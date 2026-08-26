import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { fitStats, validationRows } from "@/lib/lnp/validation";

export const Route = createFileRoute("/validation")({
  head: () => ({
    meta: [
      { title: "Model Validation — p53-LNP Designer Held-Out Benchmark" },
      {
        name: "description",
        content:
          "Predicted vs observed encapsulation, particle size and PDI across 20 held-out published LNP formulations, with MAE, RMSE and R² fit statistics.",
      },
      { property: "og:title", content: "Model Validation — p53-LNP Designer" },
      {
        property: "og:description",
        content:
          "Benchmark of the p53-LNP empirical models against 20 held-out literature formulations: MAE, RMSE, R² and parity plots.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Validation,
});

const fmt = (n: number, d = 1) => n.toFixed(d);

type Metric = "encap" | "size" | "pdi";

const METRICS: Record<Metric, { label: string; unit: string; tol: number; decimals: number; max: number }> = {
  encap: { label: "Encapsulation", unit: "%", tol: 5, decimals: 1, max: 100 },
  size: { label: "Particle size", unit: "nm", tol: 15, decimals: 1, max: 140 },
  pdi: { label: "PDI", unit: "", tol: 0.05, decimals: 3, max: 0.3 },
};

function Parity({
  points,
  max,
  decimals,
  unit,
}: {
  points: { id: string; label: string; x: number; y: number }[];
  max: number;
  decimals: number;
  unit: string;
}) {
  const S = 260;
  const pos = (v: number) => (v / max) * S;
  return (
    <svg viewBox={`0 0 ${S + 44} ${S + 40}`} className="w-full max-w-[440px]" role="img" aria-label="Parity plot of predicted versus observed values">
      <g transform={`translate(36, 8)`}>
        <rect x={0} y={0} width={S} height={S} fill="var(--panel)" stroke="var(--line)" />
        {[0.25, 0.5, 0.75].map((g) => (
          <g key={g}>
            <line x1={0} x2={S} y1={S * g} y2={S * g} stroke="var(--line)" />
            <line y1={0} y2={S} x1={S * g} x2={S * g} stroke="var(--line)" />
          </g>
        ))}
        <line x1={0} y1={S} x2={S} y2={0} stroke="var(--accent-ink)" strokeDasharray="4 4" />
        {points.map((p) => (
          <circle
            key={p.id}
            cx={pos(p.x)}
            cy={S - pos(p.y)}
            r={4.5}
            fill="var(--primary)"
            fillOpacity={0.65}
            stroke="var(--primary)"
          >
            <title>{`${p.label}: observed ${p.x.toFixed(decimals)}${unit}, predicted ${p.y.toFixed(decimals)}${unit}`}</title>
          </circle>
        ))}
        <text x={S / 2} y={S + 26} textAnchor="middle" fontSize="10" fill="var(--ink-soft)" fontFamily="var(--font-mono)">
          observed {unit || "value"}
        </text>
        <text x={-24} y={S / 2} textAnchor="middle" fontSize="10" fill="var(--ink-soft)" fontFamily="var(--font-mono)" transform={`rotate(-90, -24, ${S / 2})`}>
          predicted {unit || "value"}
        </text>
      </g>
    </svg>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-paper ring-1 ring-line p-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">{label}</p>
      <p className="mt-1 font-mono text-lg font-bold">{value}</p>
    </div>
  );
}

function Validation() {
  const [metric, setMetric] = useState<Metric>("encap");
  const rows = useMemo(() => validationRows(), []);
  const meta = METRICS[metric];

  const pick = (r: (typeof rows)[number]) =>
    metric === "encap"
      ? { obs: r.observedEncap, pred: r.predEncap }
      : metric === "size"
        ? { obs: r.observedSize, pred: r.predSize }
        : { obs: r.observedPDI, pred: r.predPDI };

  const stats = fitStats(rows.map((r) => pick(r).pred), rows.map((r) => pick(r).obs), meta.tol);
  const points = rows.map((r) => ({ id: r.id, label: `${r.id} ${r.lipidName}`, x: pick(r).obs, y: pick(r).pred }));

  const exportCsv = () => {
    const header = "id,reference,lipid,cargo,obs_encap,pred_encap,obs_size,pred_size,obs_pdi,pred_pdi";
    const body = rows
      .map((r) =>
        [r.id, `"${r.reference}"`, `"${r.lipidName}"`, r.cargo, r.observedEncap, r.predEncap.toFixed(1), r.observedSize, r.predSize.toFixed(1), r.observedPDI, r.predPDI.toFixed(3)].join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(new Blob([`${header}\n${body}`], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "p53-lnp_validation.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-line">
        <div className="flex items-center gap-3">
          <div className="size-7 grid place-items-center bg-ink text-paper font-mono text-xs font-bold rounded-md">
            p53
          </div>
          <div>
            <p className="text-[13px] font-semibold tracking-tight leading-none">
              Model validation <span className="text-ink-soft/60 font-normal">/ held-out benchmark</span>
            </p>
            <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-ink-soft/70 mt-1">
              {rows.length} published formulations · never used to fit the models
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportCsv}
            className="font-mono text-[11px] font-medium text-accent-ink ring-1 ring-primary/40 rounded-lg py-2 px-3 hover:bg-primary/5 transition-colors"
          >
            ↓ Export CSV
          </button>
          <Link
            to="/"
            className="font-mono text-[11px] font-medium text-ink-soft ring-1 ring-line rounded-lg py-2 px-3 hover:bg-primary/5 transition-colors"
          >
            ← Designer
          </Link>
        </div>
      </header>

      <main className="px-5 py-5">
        <h1 className="sr-only">p53-LNP Designer model validation against held-out literature formulations</h1>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {(Object.keys(METRICS) as Metric[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMetric(m)}
              className={`font-mono text-[11px] px-3 py-1.5 rounded-md transition-colors ${
                metric === m ? "bg-ink text-paper" : "bg-panel ring-1 ring-line text-ink-soft hover:bg-primary/5"
              }`}
            >
              {METRICS[m].label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-5 rounded-xl bg-panel ring-1 ring-black/5 p-4">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-[13px] font-semibold tracking-tight">Parity plot — {meta.label}</h2>
              <span className="font-mono text-[10px] text-ink-soft/60">01</span>
            </div>
            <Parity points={points} max={meta.max} decimals={meta.decimals} unit={meta.unit} />
            <p className="font-mono text-[10px] text-ink-soft mt-2">
              Dashed line = perfect agreement. Hover a point for the study.
            </p>
          </div>

          <div className="col-span-12 lg:col-span-7 rounded-xl bg-panel ring-1 ring-black/5 p-4">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-[13px] font-semibold tracking-tight">Fit statistics — {meta.label}</h2>
              <span className="font-mono text-[10px] text-ink-soft/60">02</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <Stat label="MAE" value={`${fmt(stats.mae, meta.decimals)}${meta.unit}`} />
              <Stat label="RMSE" value={`${fmt(stats.rmse, meta.decimals)}${meta.unit}`} />
              <Stat label="R²" value={fmt(stats.r2, 3)} />
              <Stat label="Bias" value={`${stats.bias > 0 ? "+" : ""}${fmt(stats.bias, meta.decimals)}${meta.unit}`} />
              <Stat label={`Within ±${meta.tol}${meta.unit}`} value={`${fmt(stats.within * 100, 0)}%`} />
              <Stat label="n" value={String(rows.length)} />
            </div>
            <p className="font-mono text-[10px] text-ink-soft mt-3 text-pretty">
              Models are empirical (pKa windows, N/P titration, PEG shielding, microfluidic mixing) rather than fitted
              regressors, so these figures describe agreement with literature, not training accuracy.
            </p>
          </div>

          <div className="col-span-12 rounded-xl bg-panel ring-1 ring-black/5">
            <div className="px-4 py-3 border-b border-line flex items-baseline justify-between">
              <h2 className="text-[13px] font-semibold tracking-tight">Held-out formulations</h2>
              <span className="font-mono text-[10px] text-ink-soft/60">03</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-[12px]">
                <thead>
                  <tr className="text-[10px] uppercase tracking-[0.12em] text-ink-soft border-b border-line">
                    <th className="px-4 py-2 font-medium">Study</th>
                    <th className="px-3 py-2 font-medium">Lipid</th>
                    <th className="px-3 py-2 font-medium">Cargo</th>
                    <th className="px-3 py-2 font-medium text-right">Encap obs/pred</th>
                    <th className="px-3 py-2 font-medium text-right">Size obs/pred</th>
                    <th className="px-3 py-2 font-medium text-right">PDI obs/pred</th>
                    <th className="px-4 py-2 font-medium text-right">Δ {meta.label}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const { obs, pred } = pick(r);
                    const delta = pred - obs;
                    const ok = Math.abs(delta) <= meta.tol;
                    return (
                      <tr key={r.id} className="border-b border-line">
                        <td className="px-4 py-2.5">
                          <span className="font-bold">{r.id}</span>
                          <span className="block text-[10px] text-ink-soft">{r.reference}</span>
                        </td>
                        <td className="px-3 py-2.5">{r.lipidName}</td>
                        <td className="px-3 py-2.5">{r.cargo}</td>
                        <td className="px-3 py-2.5 text-right">
                          {r.observedEncap} / {fmt(r.predEncap)}%
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          {r.observedSize} / {fmt(r.predSize)} nm
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          {r.observedPDI.toFixed(2)} / {r.predPDI.toFixed(3)}
                        </td>
                        <td className={`px-4 py-2.5 text-right font-bold ${ok ? "text-accent-ink" : "text-rust"}`}>
                          {delta > 0 ? "+" : ""}
                          {fmt(delta, meta.decimals)}
                          {meta.unit}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2 border-t border-line font-mono text-[10px] text-ink-soft/70">
              Observed values are representative characterisation data from the cited publications.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
