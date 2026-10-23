import type { Series } from "@/lib/lnp/paper";

const TONE: Record<Series["tone"], { stroke: string; fill: string }> = {
  primary: { stroke: "stroke-primary", fill: "bg-primary" },
  amber: { stroke: "stroke-amber", fill: "bg-amber" },
  rust: { stroke: "stroke-rust", fill: "bg-rust" },
  ink: { stroke: "stroke-ink-soft", fill: "bg-ink-soft" },
};

const W = 360;
const H = 190;
const M = { l: 38, r: 10, t: 10, b: 32 };

const niceTicks = (min: number, max: number, n = 4) => Array.from({ length: n + 1 }, (_, i) => min + ((max - min) * i) / n);
const fmtTick = (v: number) => (Math.abs(v) >= 100 || Number.isInteger(v) ? v.toFixed(0) : v.toFixed(2).replace(/0+$/, "").replace(/\.$/, ""));

export interface LineChartProps {
  series: Series[];
  xLabel: string;
  yLabel: string;
  xMin?: number;
  xMax: number;
  yMax: number;
  xLog?: boolean;
  /** shaded vertical band in x units */
  band?: { from: number; to: number; label: string };
  /** vertical reference line */
  refX?: { x: number; label: string };
  /** horizontal reference line */
  refY?: { y: number; label: string };
  xTicks?: number[];
  title?: string;
}

/** Dependency-free SVG line chart using theme tokens only. */
export function LineChart({ series, xLabel, yLabel, xMin = 0, xMax, yMax, xLog, band, refX, refY, xTicks, title }: LineChartProps) {
  const px = (x: number) => {
    const f = xLog ? (Math.log10(x) - Math.log10(xMin)) / (Math.log10(xMax) - Math.log10(xMin)) : (x - xMin) / (xMax - xMin);
    return M.l + f * (W - M.l - M.r);
  };
  const py = (y: number) => M.t + (1 - y / yMax) * (H - M.t - M.b);
  const xt = xTicks ?? (xLog ? [] : niceTicks(xMin, xMax));
  const yt = niceTicks(0, yMax);
  return (
    <figure className="w-full">
      {title ? <figcaption className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">{title}</figcaption> : null}
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title ?? yLabel} className="w-full h-auto">
        {band ? (
          <g>
            <rect x={px(band.from)} y={M.t} width={px(band.to) - px(band.from)} height={H - M.t - M.b} className="fill-primary/10" />
            <text x={(px(band.from) + px(band.to)) / 2} y={M.t + 9} textAnchor="middle" className="fill-accent-ink font-mono" fontSize="8">
              {band.label}
            </text>
          </g>
        ) : null}
        {yt.map((v) => (
          <g key={`y${v}`}>
            <line x1={M.l} x2={W - M.r} y1={py(v)} y2={py(v)} className="stroke-line" strokeWidth="0.6" />
            <text x={M.l - 5} y={py(v) + 3} textAnchor="end" className="fill-ink-soft font-mono" fontSize="8">
              {fmtTick(v)}
            </text>
          </g>
        ))}
        {xt.map((v) => (
          <text key={`x${v}`} x={px(v)} y={H - M.b + 12} textAnchor="middle" className="fill-ink-soft font-mono" fontSize="8">
            {fmtTick(v)}
          </text>
        ))}
        {xLog
          ? [0.01, 0.1, 1, 10, 100].filter((v) => v >= xMin && v <= xMax).map((v) => (
              <text key={`xl${v}`} x={px(v)} y={H - M.b + 12} textAnchor="middle" className="fill-ink-soft font-mono" fontSize="8">
                {v}
              </text>
            ))
          : null}
        <line x1={M.l} x2={W - M.r} y1={H - M.b} y2={H - M.b} className="stroke-ink-soft" strokeWidth="0.8" />
        <line x1={M.l} x2={M.l} y1={M.t} y2={H - M.b} className="stroke-ink-soft" strokeWidth="0.8" />
        {refX ? (
          <g>
            <line x1={px(refX.x)} x2={px(refX.x)} y1={M.t} y2={H - M.b} className="stroke-rust" strokeDasharray="3 3" strokeWidth="0.9" />
            <text x={px(refX.x) - 3} y={M.t + 9} textAnchor="end" className="fill-rust font-mono" fontSize="8">
              {refX.label}
            </text>
          </g>
        ) : null}
        {refY ? (
          <g>
            <line x1={M.l} x2={W - M.r} y1={py(refY.y)} y2={py(refY.y)} className="stroke-rust" strokeDasharray="3 3" strokeWidth="0.9" />
            <text x={W - M.r - 2} y={py(refY.y) - 3} textAnchor="end" className="fill-rust font-mono" fontSize="8">
              {refY.label}
            </text>
          </g>
        ) : null}
        {series.map((s) => (
          <polyline
            key={s.name}
            fill="none"
            strokeWidth="1.8"
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeDasharray={s.dashed ? "4 3" : undefined}
            className={TONE[s.tone].stroke}
            points={s.points
              .filter(([x]) => x >= xMin && x <= xMax)
              .map(([x, y]) => `${px(x).toFixed(1)},${py(Math.min(y, yMax)).toFixed(1)}`)
              .join(" ")}
          />
        ))}
        <text x={(M.l + W - M.r) / 2} y={H - 4} textAnchor="middle" className="fill-ink-soft font-mono" fontSize="8.5">
          {xLabel}
        </text>
        <text transform={`translate(9 ${(M.t + H - M.b) / 2}) rotate(-90)`} textAnchor="middle" className="fill-ink-soft font-mono" fontSize="8.5">
          {yLabel}
        </text>
      </svg>
      <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
        {series.map((s) => (
          <li key={s.name} className="flex items-center gap-1.5 font-mono text-[10px] text-ink-soft">
            <span className={`inline-block h-1.5 w-3 rounded-full ${TONE[s.tone].fill}`} />
            {s.name}
          </li>
        ))}
      </ul>
    </figure>
  );
}

export interface RangeBar {
  label: string;
  low: number;
  high: number;
  highlight?: boolean;
}

/** Horizontal floating-range bars (used for Table 1 ranges). */
export function RangeBars({ items, max, unit, title }: { items: RangeBar[]; max: number; unit: string; title?: string }) {
  return (
    <figure className="w-full">
      {title ? <figcaption className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">{title}</figcaption> : null}
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.label} className="grid grid-cols-[110px_1fr_70px] items-center gap-2 font-mono text-[10px]">
            <span className={it.highlight ? "font-bold text-accent-ink" : "text-ink-soft"}>{it.label}</span>
            <div className="relative h-3 rounded-full bg-line">
              <div
                className={`absolute top-0 h-3 rounded-full ${it.highlight ? "bg-primary" : "bg-ink-soft/60"}`}
                style={{ left: `${(it.low / max) * 100}%`, width: `${((it.high - it.low) / max) * 100}%` }}
              />
            </div>
            <span className="text-right text-ink-soft">
              {it.low}–{it.high}
              {unit}
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

/** Simple value bars (percent). */
export function ValueBars({ items, title, unit = "%", max = 100 }: { items: { label: string; value: number; tone?: Series["tone"] }[]; title?: string; unit?: string; max?: number }) {
  return (
    <figure className="w-full">
      {title ? <figcaption className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">{title}</figcaption> : null}
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.label} className="grid grid-cols-[120px_1fr_52px] items-center gap-2 font-mono text-[10px]">
            <span className="text-ink-soft">{it.label}</span>
            <div className="h-3 rounded-full bg-line overflow-hidden">
              <div className={`h-3 rounded-full ${TONE[it.tone ?? "primary"].fill} bar-grow`} style={{ width: `${Math.min(100, (it.value / max) * 100)}%` }} />
            </div>
            <span className="text-right font-bold">
              {it.value.toFixed(it.value < 10 ? 1 : 0)}
              {unit}
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
