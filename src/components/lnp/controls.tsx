import type { ReactNode } from "react";

export function Chip({ active, onClick, children, title }: { active: boolean; onClick: () => void; children: ReactNode; title?: string }) {
  return (
    <button
      type="button"
      title={title}
      aria-pressed={active}
      onClick={onClick}
      className={`font-mono text-[11px] px-2 py-1 rounded-md transition-colors ${
        active ? "bg-ink text-paper" : "bg-paper ring-1 ring-line text-ink-soft hover:bg-primary/5 hover:text-accent-ink"
      }`}
    >
      {children}
    </button>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  display: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">{label}</span>
        <span className="font-mono text-[12px] font-bold text-accent-ink">{display}</span>
      </div>
      <input
        type="range"
        aria-label={label}
        className="mt-2 w-full"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

export function Card({ title, tag, children, source }: { title: string; tag: string; children: ReactNode; source?: string }) {
  return (
    <section className="h-full rounded-xl bg-panel ring-1 ring-black/5 p-4">
      <div className="flex items-baseline justify-between mb-3 gap-3">
        <h2 className="text-[13px] font-semibold tracking-tight">{title}</h2>
        <span className="font-mono text-[10px] text-ink-soft/60 shrink-0">{tag}</span>
      </div>
      {children}
      {source ? <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-soft/60">Paper · {source}</p> : null}
    </section>
  );
}
