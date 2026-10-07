export type Objective = "acquire" | "reactivate" | "retain";

export type WalletProfile = {
  address: string;
  ageDays: number;
  programs: number;
  solVolume: number;
  counterparties: number;
  clusterSize: number;
  retainedActions: number;
  label: string;
};

export type AttentionSample = {
  dwellMs: number;
  interactions: number;
  velocityPerMin: number;
  replay: boolean;
};

export type FraudFlag =
  | "burst-velocity"
  | "sybil-cluster"
  | "replayed-nonce"
  | "dust-only"
  | "fresh-spray";

export type Scorecard = {
  attention: number;
  quality: number;
  composite: number;
  flags: FraudFlag[];
  payable: boolean;
  reason: string;
};

function clamp(n: number, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

export function scoreAttention(sample: AttentionSample): { score: number; flags: FraudFlag[] } {
  const flags: FraudFlag[] = [];
  if (sample.velocityPerMin > 18) flags.push("burst-velocity");
  if (sample.replay) flags.push("replayed-nonce");
  const dwell = Math.min(sample.dwellMs / 8000, 1) * 55;
  const acts = Math.min(sample.interactions / 3, 1) * 35;
  const penalty = flags.length * 28;
  return { score: clamp(dwell + acts + 10 - penalty), flags };
}

export function scoreQuality(wallet: WalletProfile): { score: number; flags: FraudFlag[] } {
  const flags: FraudFlag[] = [];
  if (wallet.clusterSize >= 12) flags.push("sybil-cluster");
  if (wallet.solVolume < 0.05 && wallet.programs < 2) flags.push("dust-only");
  if (wallet.ageDays < 2 && wallet.counterparties < 3) flags.push("fresh-spray");
  const age = Math.min(wallet.ageDays / 90, 1) * 28;
  const breadth = Math.min(wallet.programs / 8, 1) * 24;
  const volume = Math.min(Math.log10(wallet.solVolume + 1) / 2, 1) * 22;
  const graph = Math.min(wallet.counterparties / 20, 1) * 16;
  const retain = Math.min(wallet.retainedActions / 4, 1) * 10;
  const penalty = flags.length * 18;
  return { score: clamp(age + breadth + volume + graph + retain - penalty), flags };
}

export function compose(wallet: WalletProfile, sample: AttentionSample, objective: Objective): Scorecard {
  const a = scoreAttention(sample);
  const q = scoreQuality(wallet);
  const flags = [...new Set([...a.flags, ...q.flags])];
  const weight = objective === "retain" ? 0.35 : objective === "reactivate" ? 0.45 : 0.55;
  const composite = clamp(a.score * weight + q.score * (1 - weight));
  const payable = composite >= 62 && !flags.includes("replayed-nonce") && !flags.includes("sybil-cluster");
  const reason = payable
    ? "Cleared shared quality floor. Settlement eligible."
    : flags.length
      ? `Held: ${flags.join(", ")}.`
      : "Below the shared quality floor (62).";
  return { attention: a.score, quality: q.score, composite, flags, payable, reason };
}

export const SEED_WALLETS: WalletProfile[] = [
  { address: "7kQm\u2026aR2v", ageDays: 214, programs: 11, solVolume: 840, counterparties: 46, clusterSize: 1, retainedActions: 5, label: "DeFi regular" },
  { address: "4nLp\u20269cXe", ageDays: 61, programs: 6, solVolume: 42, counterparties: 18, clusterSize: 2, retainedActions: 2, label: "Returning trader" },
  { address: "9sWb\u2026k1Tq", ageDays: 12, programs: 3, solVolume: 4.2, counterparties: 7, clusterSize: 1, retainedActions: 1, label: "New but real" },
  { address: "2hFd\u2026m88P", ageDays: 1, programs: 1, solVolume: 0.01, counterparties: 1, clusterSize: 28, retainedActions: 0, label: "Sybil cluster" },
  { address: "8cYr\u2026p0Ls", ageDays: 3, programs: 1, solVolume: 0.02, counterparties: 2, clusterSize: 4, retainedActions: 0, label: "Fresh spray" },
  { address: "5qAa\u2026zN7d", ageDays: 140, programs: 9, solVolume: 190, counterparties: 31, clusterSize: 1, retainedActions: 4, label: "Protocol power user" },
  { address: "3mUe\u2026b44K", ageDays: 28, programs: 4, solVolume: 8.5, counterparties: 9, clusterSize: 1, retainedActions: 1, label: "Casual holder" },
  { address: "6tRi\u2026wQ1s", ageDays: 90, programs: 2, solVolume: 0.04, counterparties: 3, clusterSize: 16, retainedActions: 0, label: "Dust farmer" },
];
