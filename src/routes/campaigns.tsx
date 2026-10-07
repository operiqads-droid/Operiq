import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/shell";
import type { Objective } from "@/lib/operiq/score";
import { addCampaign, settleCampaign, spentSol, togglePause, useLedger } from "@/lib/operiq/store";

export const Route = createFileRoute("/campaigns")({ component: Campaigns });

function Campaigns() {
  const ledger = useLedger();
  const [name, setName] = useState("Mobile wallet onboarding");
  const [advertiser, setAdvertiser] = useState("Lumen");
  const [objective, setObjective] = useState<Objective>("acquire");
  const [budget, setBudget] = useState(12);
  const [open, setOpen] = useState<string | null>(ledger.campaigns[0]?.id ?? null);

  return (
    <Shell>
      <h1 className="font-display text-4xl">Campaigns</h1>
      <p className="mt-2 max-w-xl text-muted">Launch against the shared wallet set. Operiq scores every impression before any SOL moves.</p>
      <form className="mt-6 grid gap-3 rounded-2xl border border-border bg-surface p-4 md:grid-cols-5" onSubmit={(e) => { e.preventDefault(); addCampaign({ name, advertiser, objective, budgetSol: budget, cpmSol: 0.06 }); }}>
        <label className="text-sm md:col-span-2"><span className="text-muted">Name</span><input className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} required /></label>
        <label className="text-sm"><span className="text-muted">Advertiser</span><input className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2" value={advertiser} onChange={(e) => setAdvertiser(e.target.value)} required /></label>
        <label className="text-sm"><span className="text-muted">Objective</span><select className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2" value={objective} onChange={(e) => setObjective(e.target.value as Objective)}><option value="acquire">Acquire</option><option value="reactivate">Reactivate</option><option value="retain">Retain</option></select></label>
        <label className="text-sm"><span className="text-muted">Budget (SOL)</span><input type="number" min={1} className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2" value={budget} onChange={(e) => setBudget(Number(e.target.value))} /></label>
        <button type="submit" className="min-h-11 rounded-full bg-primary px-4 text-primary-ink md:col-span-5 md:w-fit">Score a new campaign</button>
      </form>
      <ul className="mt-6 space-y-3">
        {ledger.campaigns.map((c) => {
          const rows = ledger.impressions.filter((i) => i.campaignId === c.id);
          const ok = rows.filter((i) => i.card.payable);
          const expanded = open === c.id;
          return (
            <li key={c.id} className="rounded-2xl border border-border bg-surface">
              <button type="button" className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-4 text-left" onClick={() => setOpen(expanded ? null : c.id)}>
                <div><p className="font-medium">{c.name}</p><p className="text-sm text-muted">{c.advertiser} · {c.objective} · budget {c.budgetSol} SOL</p></div>
                <p className="text-sm">{ok.length} payable · {spentSol(ledger, c.id).toFixed(2)} settled · {c.status}</p>
              </button>
              {expanded && (
                <div className="border-t border-border px-4 py-4">
                  <div className="mb-3 flex flex-wrap gap-2">
                    {c.status !== "settled" && <button type="button" className="min-h-11 rounded-full bg-primary px-4 text-sm text-primary-ink" onClick={() => settleCampaign(c.id)}>Settle payable impressions</button>}
                    {c.status !== "settled" && <button type="button" className="min-h-11 rounded-full border border-border px-4 text-sm" onClick={() => togglePause(c.id)}>{c.status === "live" ? "Pause" : "Resume"}</button>}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="text-muted"><tr><th className="py-2 pr-3 font-medium">Wallet</th><th className="py-2 pr-3 font-medium">Attention</th><th className="py-2 pr-3 font-medium">Quality</th><th className="py-2 pr-3 font-medium">Composite</th><th className="py-2 font-medium">Decision</th></tr></thead>
                      <tbody>
                        {rows.map((r) => (
                          <tr key={r.id} className="border-t border-border">
                            <td className="py-2 pr-3">{r.wallet}</td>
                            <td className="py-2 pr-3">{r.card.attention}</td>
                            <td className="py-2 pr-3">{r.card.quality}</td>
                            <td className="py-2 pr-3">{r.card.composite}</td>
                            <td className={`py-2 ${r.card.payable ? "text-primary" : "text-danger"}`}>{r.settled ? (r.card.payable ? "Paid" : "Rejected") : r.card.payable ? "Eligible" : r.card.flags[0] ?? "Below floor"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Shell>
  );
}
