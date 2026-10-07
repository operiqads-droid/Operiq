import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { useLedger } from "@/lib/operiq/store";

export const Route = createFileRoute("/attribution")({ component: Attribution });

function Attribution() {
  const ledger = useLedger();
  const seen = ledger.impressions.length;
  const engaged = ledger.impressions.filter((i) => i.card.attention >= 50).length;
  const qualified = ledger.impressions.filter((i) => i.card.payable).length;
  const paid = ledger.impressions.filter((i) => i.settled && i.card.payable).length;
  const rejected = ledger.impressions.filter((i) => i.settled && !i.card.payable).length;
  const steps = [
    ["Scored", seen],
    ["Engaged", engaged],
    ["Quality pass", qualified],
    ["Settled SOL", paid],
  ];
  const max = Math.max(...steps.map((s) => s[1] as number), 1);
  const byFlag = new Map<string, number>();
  ledger.impressions.forEach((i) => {
    if (i.card.payable) return;
    const key = i.card.flags[0] ?? "below-floor";
    byFlag.set(key, (byFlag.get(key) ?? 0) + 1);
  });

  return (
    <Shell>
      <h1 className="font-display text-4xl">Attribution</h1>
      <p className="mt-2 max-w-xl text-muted">Funnel from scored attention to paid settlement. Nothing is counted as acquired unless it clears the shared floor and is settled.</p>
      <ol className="mt-8 space-y-3">
        {steps.map(([label, n]) => (
          <li key={String(label)}>
            <div className="mb-1 flex justify-between text-sm"><span>{label}</span><span>{n}</span></div>
            <div className="h-3 overflow-hidden rounded-full bg-surface-2">
              <div className="h-full rounded-full bg-primary" style={{ width: `${((n as number) / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ol>
      <section className="mt-10 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-display text-2xl">Why spend was held</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {[...byFlag.entries()].map(([k, v]) => (
              <li key={k} className="flex justify-between border-b border-border py-2"><span>{k}</span><span>{v}</span></li>
            ))}
          </ul>
        </article>
        <article className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-display text-2xl">Settlement state</h2>
          <p className="mt-3 text-sm text-muted">Paid impressions move budget. Rejected settlements stay on the ledger so both sides can audit the same decision.</p>
          <p className="mt-4 font-display text-4xl">{paid}</p>
          <p className="text-sm text-muted">paid · {rejected} rejected after settle</p>
        </article>
      </section>
    </Shell>
  );
}
