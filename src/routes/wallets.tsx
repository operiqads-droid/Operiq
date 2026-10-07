import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Shell } from "@/components/shell";
import { compose, scoreQuality, SEED_WALLETS, type AttentionSample } from "@/lib/operiq/score";

export const Route = createFileRoute("/wallets")({ component: Wallets });

const neutral: AttentionSample = { dwellMs: 6000, interactions: 2, velocityPerMin: 3, replay: false };

function Wallets() {
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState(SEED_WALLETS[0].address);
  const rows = useMemo(
    () => SEED_WALLETS.filter((w) => `${w.address} ${w.label}`.toLowerCase().includes(q.toLowerCase())),
    [q],
  );
  const wallet = SEED_WALLETS.find((w) => w.address === picked) ?? SEED_WALLETS[0];
  const quality = scoreQuality(wallet);
  const card = compose(wallet, neutral, "acquire");

  return (
    <Shell>
      <h1 className="font-display text-4xl">Wallet quality</h1>
      <p className="mt-2 max-w-xl text-muted">A shared, inspectable score. Same inputs, same output — advertisers and publishers do not keep private black boxes.</p>
      <input className="mt-6 w-full max-w-md rounded-lg border border-border bg-surface px-3 py-2" placeholder="Filter wallets" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <ul className="divide-y divide-border rounded-2xl border border-border">
          {rows.map((w) => {
            const s = scoreQuality(w);
            const active = w.address === wallet.address;
            return (
              <li key={w.address}>
                <button type="button" className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left ${active ? "bg-surface-2" : ""}`} onClick={() => setPicked(w.address)}>
                  <span>
                    <span className="block font-medium">{w.address}</span>
                    <span className="text-sm text-muted">{w.label}</span>
                  </span>
                  <span className={s.score >= 62 ? "text-primary" : "text-danger"}>{s.score}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <article className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-sm text-muted">{wallet.label}</p>
          <h2 className="font-display text-3xl">{wallet.address}</h2>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Fact k="Age" v={`${wallet.ageDays} days`} />
            <Fact k="Programs" v={String(wallet.programs)} />
            <Fact k="Volume" v={`${wallet.solVolume} SOL`} />
            <Fact k="Counterparties" v={String(wallet.counterparties)} />
            <Fact k="Cluster size" v={String(wallet.clusterSize)} />
            <Fact k="Retained actions" v={String(wallet.retainedActions)} />
          </dl>
          <p className="mt-5 text-sm text-muted">Quality {quality.score} · with a clean attention sample, composite {card.composite}.</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {(quality.flags.length ? quality.flags : ["clear"]).map((f) => (
              <li key={f} className={`rounded-full px-3 py-1 text-xs ${f === "clear" ? "bg-primary text-primary-ink" : "bg-surface-2 text-warn"}`}>{f}</li>
            ))}
          </ul>
        </article>
      </div>
    </Shell>
  );
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl bg-bg px-3 py-2">
      <dt className="text-muted">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}
