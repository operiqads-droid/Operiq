import { Link, useRouterState } from "@tanstack/react-router";
import { Activity, Fingerprint, GitBranch, Radar, Scale } from "lucide-react";
import type { ReactNode } from "react";

const links = [
  { to: "/", label: "Network", icon: Radar },
  { to: "/campaigns", label: "Campaigns", icon: Activity },
  { to: "/wallets", label: "Wallets", icon: Fingerprint },
  { to: "/attribution", label: "Attribution", icon: GitBranch },
  { to: "/protocol", label: "Protocol", icon: Scale },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="sticky top-0 z-20 border-b border-border bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-ink font-display text-lg">O</span>
            <span>
              <span className="block font-display text-lg leading-none">Operiq</span>
              <span className="text-xs text-muted">Solana attention ledger</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => {
              const active = path === l.to;
              const Icon = l.icon;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm ${active ? "bg-surface-2 text-fg" : "text-muted hover:text-fg"}`}
                >
                  <Icon size={16} />
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:hidden">
          {links.map((l) => {
            const active = path === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`shrink-0 rounded-full px-3 py-2 text-sm ${active ? "bg-primary text-primary-ink" : "bg-surface text-muted"}`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
