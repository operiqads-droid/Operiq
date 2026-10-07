import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { spentSol, useLedger } from "@/lib/operiq/store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const ledger = useLedger();
  const scored = ledger.impressions.length;
  const payable = ledger.impressions.filter((i) => i.card.payable).length;
  const held = scored - payable;
  const settledSpend = ledger.campaigns.reduce((n, c) => n + spentSol(ledger, c.id), 0);
  const passRate = scored ? Math.round((payable / scored) * 100) : 0;

  return (
    <Shell>
      <section className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="text-sm uppercase tracking-widest text-muted">Shared quality layer</p>
          <h1 className="mt-2 font-display text-4xl leading-tight md:text-5xl">
            Pay only for attention that clears the floor.
          </h1>
          <p className="mt-4 max-w-xl text-muted">
            Operiq scores every impression against a public rule set: dwell, interaction, wallet quality, and Sybil risk. Campaigns settle in SOL only when the composite clears 62 and hard fraud flags are absent.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/campaigns" className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-primary-ink">
              Open a campaign
            </Link>
            <Link to="/protocol" className="inline-flex min-h-11 items-center rounded-full border border-border px-5">
              Read the rules
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Scored impressions" value={String(scored)} />
          <Stat label="Pass rate" value={`${passRate}%`} />
          <Stat label="Held for fraud" value={String(held)} />
          <Stat label="Settled SOL" value={settledSpend.toFixed(2)} />
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {[
          ["Proof of attention", "Dwell, interactions, and a one-time nonce. Replays and burst velocity are rejected before spend."],
          ["Wallet quality", "Age, program breadth, volume, and graph diversity. Dust-only and fresh-spray wallets fail the floor."],
          ["Shared settlement", "Advertisers and publishers use the same score. A payable impression is the only one that moves SOL."],
        ].map(([t, d]) => (
          <article key={t} className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="font-display text-xl">{t}</h2>
            <p className="mt-2 text-sm text-muted">{d}</p>
          </article>
        ))}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl">Live campaigns</h2>
        <ul className="mt-4 divide-y divide-border rounded-2xl border border-border">
          {ledger.campaigns.map((c) => {
            const rows = ledger.impressions.filter((i) => i.campaignId === c.id);
            const ok = rows.filter((i) => i.card.payable).length;
            return (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-sm text-muted">{c.advertiser} · {c.objective} · {c.status}</p>
                </div>
                <p className="text-sm">{ok}/{rows.length} payable · {spentSol(ledger, c.id).toFixed(2)} SOL</p>
              </li>
            );
          })}
        </ul>
      </section>
    </Shell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 font-display text-3xl">{value}</p>
    </div>
  );
}
