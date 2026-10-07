import { useEffect, useState } from "react";
import {
  compose,
  SEED_WALLETS,
  type AttentionSample,
  type Objective,
  type Scorecard,
  type WalletProfile,
} from "./score";

export type Campaign = {
  id: string;
  name: string;
  advertiser: string;
  objective: Objective;
  budgetSol: number;
  cpmSol: number;
  status: "live" | "paused" | "settled";
};

export type Impression = {
  id: string;
  campaignId: string;
  wallet: string;
  sample: AttentionSample;
  card: Scorecard;
  settled: boolean;
};

const KEY = "operiq-ledger-v1";

type Ledger = { campaigns: Campaign[]; impressions: Impression[] };

const seedCampaigns: Campaign[] = [
  { id: "cmp_jupiter", name: "Swap intent — power users", advertiser: "Northwind DEX", objective: "acquire", budgetSol: 40, cpmSol: 0.08, status: "live" },
  { id: "cmp_return", name: "Dormant LP reactivation", advertiser: "Harbor Pools", objective: "reactivate", budgetSol: 18, cpmSol: 0.05, status: "live" },
];

function sampleFor(wallet: WalletProfile, salt: number): AttentionSample {
  const burst = wallet.clusterSize >= 12;
  const fresh = wallet.ageDays < 3;
  return {
    dwellMs: burst ? 400 + (salt % 700) : 4200 + (wallet.ageDays % 7) * 900 + salt * 120,
    interactions: burst || fresh ? salt % 2 : 2 + (wallet.programs % 3),
    velocityPerMin: burst ? 26 + (salt % 8) : 2 + (salt % 4),
    replay: wallet.label === "Dust farmer" && salt % 2 === 0,
  };
}

function seedImpressions(): Impression[] {
  const out: Impression[] = [];
  seedCampaigns.forEach((c, ci) => {
    SEED_WALLETS.forEach((w, wi) => {
      const sample = sampleFor(w, ci * 3 + wi);
      out.push({
        id: `${c.id}_${w.address}`,
        campaignId: c.id,
        wallet: w.address,
        sample,
        card: compose(w, sample, c.objective),
        settled: false,
      });
    });
  });
  return out;
}

function fresh(): Ledger {
  return { campaigns: seedCampaigns, impressions: seedImpressions() };
}

function load(): Ledger {
  if (typeof window === "undefined") return fresh();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fresh();
    const parsed = JSON.parse(raw) as Ledger;
    if (!parsed.campaigns?.length || !parsed.impressions?.length) throw new Error("empty");
    return parsed;
  } catch {
    return fresh();
  }
}

let memory: Ledger = fresh();
const listeners = new Set<() => void>();

function emit(next: Ledger) {
  memory = next;
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(next));
  listeners.forEach((l) => l());
}

export function useLedger() {
  const [snap, setSnap] = useState<Ledger>(fresh);
  useEffect(() => {
    memory = load();
    setSnap(memory);
    const fn = () => setSnap(memory);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);
  return snap;
}

export function walletByAddress(address: string) {
  return SEED_WALLETS.find((w) => w.address === address);
}

export function spentSol(ledger: Ledger, campaignId: string) {
  const c = ledger.campaigns.find((x) => x.id === campaignId);
  if (!c) return 0;
  const paid = ledger.impressions.filter((i) => i.campaignId === campaignId && i.settled && i.card.payable).length;
  return Math.round(paid * c.cpmSol * 1000) / 1000;
}

export function addCampaign(input: Omit<Campaign, "id" | "status">) {
  const id = `cmp_${Date.now().toString(36)}`;
  const campaign: Campaign = { ...input, id, status: "live" };
  const impressions: Impression[] = SEED_WALLETS.map((w, wi) => {
    const sample = sampleFor(w, wi + 2);
    return {
      id: `${id}_${w.address}`,
      campaignId: id,
      wallet: w.address,
      sample,
      card: compose(w, sample, campaign.objective),
      settled: false,
    };
  });
  emit({ campaigns: [campaign, ...memory.campaigns], impressions: [...impressions, ...memory.impressions] });
}

export function settleCampaign(campaignId: string) {
  emit({
    ...memory,
    campaigns: memory.campaigns.map((c) => (c.id === campaignId ? { ...c, status: "settled" } : c)),
    impressions: memory.impressions.map((i) => (i.campaignId === campaignId ? { ...i, settled: true } : i)),
  });
}

export function togglePause(campaignId: string) {
  emit({
    ...memory,
    campaigns: memory.campaigns.map((c) =>
      c.id === campaignId && c.status !== "settled"
        ? { ...c, status: c.status === "live" ? "paused" : "live" }
        : c,
    ),
  });
}

export function resetLedger() {
  if (typeof window !== "undefined") localStorage.removeItem(KEY);
  emit(fresh());
}
