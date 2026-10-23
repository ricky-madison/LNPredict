import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { PAPER } from "@/lib/lnp/paper";

const NAV = [
  { to: "/", label: "Designer", exact: true },
  { to: "/structure", label: "Molecular viewer", exact: false },
  { to: "/paper", label: "Paper framework", exact: false },
  { to: "/validation", label: "Validation", exact: false },
] as const;

export function SiteHeader({ subtitle, actions }: { subtitle?: string; actions?: ReactNode }) {
  return (
    <header className="border-b border-line bg-paper sticky top-0 z-30">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 pt-3">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="size-8 grid place-items-center bg-ink text-paper font-mono text-[11px] font-bold rounded-md">
            LNP
          </div>
          <div>
            <p className="text-[15px] font-semibold tracking-tight leading-none">LNPredict</p>
            <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-ink-soft/70 mt-1">
              {subtitle ?? "p53 lipid nanoparticle design platform"}
            </p>
          </div>
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          {actions}
          <a
            href={PAPER.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[11px] font-medium text-ink-soft ring-1 ring-line rounded-lg py-2 px-3 hover:bg-primary/5 transition-colors"
          >
            Reference paper (DOI) ↗
          </a>
        </div>
      </div>
      <nav aria-label="Main" className="flex gap-1 overflow-x-auto px-4 mt-2">
        {NAV.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            activeOptions={{ exact: n.exact }}
            className="whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft px-3 py-2.5 border-b-2 border-transparent hover:text-ink transition-colors"
            activeProps={{ className: "!text-ink !border-primary font-semibold" }}
          >
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
