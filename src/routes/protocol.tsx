import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/shell";
import { compose, type AttentionSample, type Objective, type WalletProfile } from "@/lib/operiq/score";
import { resetLedger } from "@/lib/operiq/store";

export const Route = createFileRoute("/protocol")({ component: Protocol });

function Protocol() {
  const [ageDays, setAge] = useState(40);
  const [programs, setPrograms] = useState(5);
  const [solVolume, setVol] = useState(12);
  const [counterparties, setCp] = useState(10);
  const [clusterSize, setCluster] = useState(1);
  const [dwell, setDwell] = useState(7000);
  const [interactions, setActs] = useState(2);
  const [velocity, setVel] = useState(3);
  const [replay, setReplay] = useState(false);
  const [objective, setObjective] = useState<Objective>("acquire");
  const wallet: WalletProfile = { address: "sim\u2026wallet", ageDays, programs, solVolume, counterparties, clusterSize, retainedActions: 1, label: "Simulator" };
  const sample: AttentionSample = { dwellMs: dwell, interactions, velocityPerMin: velocity, replay };
  const card = compose(wallet, sample, objective);
  return (
    <Shell>
      <h1 className="font-display text-4xl">Protocol</h1>
      <p className="mt-2 max-w-2xl text-muted">Operiq is a shared scoring contract, not a private ad network. Publishers emit attention proofs. Advertisers query the same function. Settlement pays only when composite is at least 62 and replay or Sybil flags are absent.</p>
      <ol className="mt-6 grid gap-3 md:grid-cols-3">
        {[["1. Attest", "A placement records dwell, interactions, and a nonce. Velocity above 18 views/min is a burst."],["2. Score", "Wallet age, programs, volume, counterparties, and cluster size produce quality. Hard flags subtract."],["3. Settle", "Payable impressions debit the campaign at the quoted CPM. Held impressions are public and unpaid."]].map(([t, d]) => (
          <li key={t} className="rounded-2xl border border-border bg-surface p-4"><h2 className="font-display text-xl">{t}</h2><p className="mt-2 text-sm text-muted">{d}</p></li>
        ))}
      </ol>
      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <form className="grid gap-3 rounded-2xl border border-border bg-surface p-5" onSubmit={(e) => e.preventDefault()}>
          <h2 className="font-display text-2xl">Verifier</h2>
          <Slider label="Wallet age (days)" min={0} max={365} value={ageDays} onChange={setAge} />
          <Slider label="Programs touched" min={0} max={20} value={programs} onChange={setPrograms} />
          <Slider label="SOL volume" min={0} max={200} value={solVolume} onChange={setVol} />
          <Slider label="Counterparties" min={0} max={40} value={counterparties} onChange={setCp} />
          <Slider label="Sybil cluster size" min={1} max={40} value={clusterSize} onChange={setCluster} />
          <Slider label="Dwell (ms)" min={200} max={12000} value={dwell} onChange={setDwell} />
          <Slider label="Interactions" min={0} max={6} value={interactions} onChange={setActs} />
          <Slider label="Views / minute" min={1} max={40} value={velocity} onChange={setVel} />
          <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={replay} onChange={(e) => setReplay(e.target.checked)} />Replayed nonce</label>
          <label className="text-sm">Objective<select className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2" value={objective} onChange={(e) => setObjective(e.target.value as Objective)}><option value="acquire">Acquire</option><option value="reactivate">Reactivate</option><option value="retain">Retain</option></select></label>
        </form>
        <article className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-sm text-muted">Decision</p>
          <p className={`font-display text-5xl ${card.payable ? "text-primary" : "text-danger"}`}>{card.payable ? "Payable" : "Held"}</p>
          <p className="mt-2 text-muted">{card.reason}</p>
          <dl className="mt-6 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-bg p-3"><dt className="text-xs text-muted">Attention</dt><dd className="font-display text-2xl">{card.attention}</dd></div>
            <div className="rounded-xl bg-bg p-3"><dt className="text-xs text-muted">Quality</dt><dd className="font-display text-2xl">{card.quality}</dd></div>
            <div className="rounded-xl bg-bg p-3"><dt className="text-xs text-muted">Composite</dt><dd className="font-display text-2xl">{card.composite}</dd></div>
          </dl>
          <p className="mt-4 text-sm">Flags: {card.flags.length ? card.flags.join(", ") : "none"}</p>
          <button type="button" className="mt-6 min-h-11 rounded-full border border-border px-4 text-sm" onClick={() => resetLedger()}>Reset demo ledger</button>
        </article>
      </section>
    </Shell>
  );
}

function Slider({ label, min, max, value, onChange }: { label: string; min: number; max: number; value: number; onChange: (n: number) => void }) {
  return (
    <label className="text-sm">
      <span className="flex justify-between"><span>{label}</span><span>{value}</span></span>
      <input className="mt-1 w-full accent-primary" type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}
