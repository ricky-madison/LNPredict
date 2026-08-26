import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import {
  CARGOS,
  HELPER_LIPIDS,
  PLATFORMS,
  RELEASE_TRIGGERS,
  TARGETING_TABLE,
  TP53_VARIANTS,
  type CargoType,
} from "@/lib/lnp/data";
import { DEFAULT_INPUT, buildReport, runDesign, type DesignInput } from "@/lib/lnp/predict";
import { printReport } from "@/lib/lnp/report-html";
import { ParticleViewer3D } from "@/components/lnp/ParticleViewer3D";



export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "p53-LNP Designer — In Silico LNP Formulation Workbench" },
      {
        name: "description",
        content:
          "Turn a TP53 mutation into an optimised lipid nanoparticle formulation: ranked ionizable lipids, encapsulation, size, PDI, endosomal escape and targeting ligand.",
      },
      { property: "og:title", content: "p53-LNP Designer — LNP Formulation Workbench" },
      {
        property: "og:description",
        content:
          "Predict encapsulation, particle size, PDI and endosomal escape for p53 mRNA lipid nanoparticles, with cancer-type targeting recommendations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Designer,
});

const fmt = (n: number, d = 1) => n.toFixed(d);

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint ? <p className="mt-1 font-mono text-[9px] text-ink-soft/60">{hint}</p> : null}
    </label>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`font-mono text-[11px] px-2 py-1 rounded-md transition-colors ${
        active
          ? "bg-ink text-paper"
          : "bg-paper ring-1 ring-line text-ink-soft hover:bg-primary/5 hover:text-accent-ink"
      }`}
    >
      {children}
    </button>
  );
}

function Slider({
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

function Gauge({ label, value, display, pct }: { label: string; value: number; display: string; pct: number }) {
  return (
    <div key={`${label}-${value.toFixed(2)}`}>
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] font-medium text-ink-soft">{label}</span>
        <span className="font-mono text-lg font-bold num-fade">{display}</span>
      </div>
      <div className="mt-1.5 h-1.5 rounded-full bg-line overflow-hidden">
        <div className="h-full bg-primary bar-grow" style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
    </div>
  );
}

const selectCls =
  "w-full bg-paper ring-1 ring-line rounded-lg px-3 py-2 text-[13px] font-medium text-ink focus:outline-none focus:ring-2 focus:ring-primary";

function Designer() {
  const [input, setInput] = useState<DesignInput>(DEFAULT_INPUT);
  const [pinned, setPinned] = useState<string | undefined>(undefined);
  const [pKaMin, setPKaMin] = useState(5.5);
  const [pKaMax, setPKaMax] = useState(7.5);

  const set = <K extends keyof DesignInput>(k: K, v: DesignInput[K]) =>
    setInput((prev) => ({ ...prev, [k]: v }));

  const result = useMemo(() => runDesign(input, pinned), [input, pinned]);
  const { lead, alternates, targeting, ranked } = result;

  const filtered = ranked.filter((r) => r.lipid.pKa >= pKaMin && r.lipid.pKa <= pKaMax);
  const total = input.ionizablePct + input.helperPct + input.cholPct + input.pegPct;
  const helper = HELPER_LIPIDS.find((h) => h.id === input.helperId)!;

  const exportReport = () => {
    const blob = new Blob([JSON.stringify(buildReport(result), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `p53-lnp_${input.variantId}_${input.cancer.replace(/\W+/g, "-")}.json`;
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
              p53-LNP Designer <span className="text-ink-soft/60 font-normal">/ Formulation Workbench</span>
            </p>
            <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-ink-soft/70 mt-1">
              In silico · empirical + pKa models · build 0x9C2F
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 font-mono text-[10px] text-ink-soft">
            <span className="size-1.5 rounded-full bg-primary" />
            <span className="uppercase tracking-[0.15em]">Model loaded</span>
            <span className="text-ink-soft/40">·</span>
            <span>214 formulations · {ranked.length} lipids</span>
          </div>
          <button
            type="button"
            onClick={exportReport}
            className="font-mono text-[11px] font-medium text-accent-ink ring-1 ring-primary/40 rounded-lg py-2 px-3 hover:bg-primary/5 transition-colors"
          >
            ↓ JSON
          </button>
          <button
            type="button"
            onClick={() => printReport(result)}
            className="font-mono text-[11px] font-medium text-accent-ink ring-1 ring-primary/40 rounded-lg py-2 px-3 hover:bg-primary/5 transition-colors"
          >
            ↓ PDF spec
          </button>
          <Link
            to="/validation"
            className="font-mono text-[11px] font-medium text-ink-soft ring-1 ring-line rounded-lg py-2 px-3 hover:bg-primary/5 transition-colors"
          >
            Validation →
          </Link>
        </div>
      </header>


      <main className="px-5 py-5">
        <h1 className="sr-only">p53-LNP Designer — in silico lipid nanoparticle formulation platform</h1>
        <div className="grid grid-cols-12 gap-4">
          {/* PARAMETER RAIL */}
          <aside className="col-span-12 lg:col-span-4 xl:col-span-3">
            <div className="rounded-xl bg-panel ring-1 ring-black/5 p-4 sticky top-4">
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="text-[13px] font-semibold tracking-tight">Formulation parameters</h2>
                <span className="font-mono text-[10px] text-ink-soft/60">01</span>
              </div>

              <Field label="TP53 variant" hint={result.variantNote}>
                <div className="flex flex-wrap gap-1.5">
                  {TP53_VARIANTS.map((v) => (
                    <Chip key={v.id} active={input.variantId === v.id} onClick={() => set("variantId", v.id)}>
                      {v.id}
                    </Chip>
                  ))}
                </div>
              </Field>

              <div className="h-px bg-line my-4" />

              <Field label="Cancer type">
                <select
                  className={selectCls}
                  value={input.cancer}
                  onChange={(e) => set("cancer", e.target.value)}
                >
                  {TARGETING_TABLE.map((t) => (
                    <option key={t.cancer}>{t.cancer}</option>
                  ))}
                </select>
              </Field>

              <div className="mt-4">
                <Field label="Cargo" hint={result.cargoNote}>
                  <div className="grid grid-cols-4 gap-1.5">
                    {CARGOS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => set("cargo", c.id as CargoType)}
                        className={`font-mono text-[11px] text-center py-1.5 rounded-md transition-colors ${
                          input.cargo === c.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-paper ring-1 ring-line text-ink-soft hover:bg-primary/5"
                        }`}
                      >
                        {c.id}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <Field label="Platform">
                  <select
                    className={selectCls}
                    value={input.platformId}
                    onChange={(e) => set("platformId", e.target.value)}
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Helper lipid">
                  <select
                    className={selectCls}
                    value={input.helperId}
                    onChange={(e) => set("helperId", e.target.value)}
                  >
                    {HELPER_LIPIDS.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="mt-2">
                <Field label="Release trigger">
                  <select
                    className={selectCls}
                    value={input.triggerId}
                    onChange={(e) => set("triggerId", e.target.value)}
                  >
                    {RELEASE_TRIGGERS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="h-px bg-line my-4" />

              <div className="space-y-4">
                <Slider
                  label="N/P ratio"
                  min={2}
                  max={12}
                  step={0.5}
                  value={input.npRatio}
                  display={fmt(input.npRatio)}
                  onChange={(v) => set("npRatio", v)}
                />
                <Slider
                  label="Ionizable %"
                  min={20}
                  max={70}
                  step={0.5}
                  value={input.ionizablePct}
                  display={`${fmt(input.ionizablePct)}%`}
                  onChange={(v) => set("ionizablePct", v)}
                />
                <Slider
                  label={`Helper % · ${helper.name}`}
                  min={0}
                  max={40}
                  step={0.5}
                  value={input.helperPct}
                  display={`${fmt(input.helperPct)}%`}
                  onChange={(v) => set("helperPct", v)}
                />
                <Slider
                  label="Cholesterol %"
                  min={10}
                  max={60}
                  step={0.5}
                  value={input.cholPct}
                  display={`${fmt(input.cholPct)}%`}
                  onChange={(v) => set("cholPct", v)}
                />
                <Slider
                  label="PEG-lipid %"
                  min={0}
                  max={6}
                  step={0.1}
                  value={input.pegPct}
                  display={`${fmt(input.pegPct)}%`}
                  onChange={(v) => set("pegPct", v)}
                />
              </div>

              <div className="mt-3 flex h-2 rounded-full overflow-hidden ring-1 ring-black/5">
                <div className="bg-primary" style={{ width: `${input.ionizablePct}%` }} />
                <div className="bg-ink-soft/70" style={{ width: `${input.helperPct}%` }} />
                <div className="bg-amber/80" style={{ width: `${input.cholPct}%` }} />
                <div className="bg-rust" style={{ width: `${input.pegPct}%` }} />
              </div>
              <p
                className={`mt-1.5 font-mono text-[10px] ${
                  Math.abs(total - 100) < 0.51 ? "text-ink-soft/60" : "text-rust"
                }`}
              >
                Σ molar = {fmt(total)}% {Math.abs(total - 100) < 0.51 ? "· balanced" : "· normalise to 100%"}
              </p>

              <div className="h-px bg-line my-4" />

              <div className="grid grid-cols-2 gap-3">
                <Slider
                  label="Flow ratio (aq:org)"
                  min={1}
                  max={6}
                  step={0.5}
                  value={input.flowRatio}
                  display={`${fmt(input.flowRatio)}:1`}
                  onChange={(v) => set("flowRatio", v)}
                />
                <Slider
                  label="Flow rate"
                  min={1}
                  max={20}
                  step={0.5}
                  value={input.flowRate}
                  display={`${fmt(input.flowRate)} mL/min`}
                  onChange={(v) => set("flowRate", v)}
                />
              </div>

              <div className="mt-4 rounded-lg bg-ink text-paper/80 px-3 py-2.5 font-mono text-[10px] leading-relaxed">
                <span className="text-primary block mb-1">▸ ENDOSOMAL ESCAPE</span>
                pKa {fmt(lead.lipid.pKa, 2)}{" "}
                {lead.lipid.pKa >= 6 && lead.lipid.pKa <= 7
                  ? "sits in the 6.0–7.0 window for low-pH protonation & membrane disruption."
                  : "sits outside the 6.0–7.0 window — protonation is mistimed for endosomal disruption."}
              </div>

              <button
                type="button"
                onClick={() => {
                  setInput(DEFAULT_INPUT);
                  setPinned(undefined);
                }}
                className="mt-3 w-full font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft py-2 rounded-lg ring-1 ring-line hover:bg-paper transition-colors"
              >
                Reset to reference protocol
              </button>
            </div>
          </aside>

          {/* READOUT */}
          <section className="col-span-12 lg:col-span-8 xl:col-span-9">
            <div className="grid grid-cols-12 gap-4">
              {/* report card */}
              <div className="col-span-12 xl:col-span-7 rounded-xl bg-panel ring-1 ring-black/5 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-ink">
                      Recommended formulation
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight text-balance max-w-[26ch]">
                      {lead.lipid.name} · {input.variantId} p53-{input.cargo}
                    </h2>
                    <p className="mt-1 font-mono text-[11px] text-ink-soft">
                      {lead.lipid.origin} · {lead.lipid.clinical} · {lead.lipid.chargeType}
                    </p>
                  </div>
                  <span className="font-mono text-[10px] text-ink-soft/60 shrink-0">02</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                  {[
                    { k: "Ionizable", v: `${fmt(input.ionizablePct)}%`, s: `pKa ${fmt(lead.lipid.pKa, 2)}` },
                    { k: `Helper · ${helper.name}`, v: `${fmt(input.helperPct)}%`, s: helper.note },
                    { k: "Cholesterol", v: `${fmt(input.cholPct)}%`, s: "membrane rigidity" },
                    { k: "PEG-lipid", v: `${fmt(input.pegPct)}%`, s: "DMG-PEG2000" },
                  ].map((c) => (
                    <div key={c.k} className="rounded-lg bg-paper ring-1 ring-line p-3">
                      <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-ink-soft">{c.k}</p>
                      <p className="mt-1 font-mono text-sm font-bold">{c.v}</p>
                      <p className="font-mono text-[10px] text-ink-soft truncate">{c.s}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-4 mt-5">
                  <Gauge
                    label="Encapsulation"
                    value={lead.encapsulation}
                    display={`${fmt(lead.encapsulation)}%`}
                    pct={lead.encapsulation}
                  />
                  <Gauge
                    label="Endosomal escape"
                    value={lead.escape}
                    display={`${fmt(lead.escape)}%`}
                    pct={lead.escape}
                  />
                  <Gauge
                    label="Particle size"
                    value={lead.size}
                    display={`${fmt(lead.size)} nm`}
                    pct={(lead.size / 210) * 100}
                  />
                  <Gauge
                    label="PDI"
                    value={lead.pdi}
                    display={fmt(lead.pdi, 3)}
                    pct={(lead.pdi / 0.42) * 100}
                  />
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-[10px] text-ink-soft">
                  <span className="px-2 py-1 rounded-md bg-paper ring-1 ring-line">
                    delivery score {fmt(lead.score)}
                  </span>
                  <span className="px-2 py-1 rounded-md bg-paper ring-1 ring-line">
                    model confidence {fmt(result.confidence)}%
                  </span>
                  <span className="px-2 py-1 rounded-md bg-paper ring-1 ring-line">
                    N/P {fmt(input.npRatio)} · {fmt(input.flowRatio)}:1 @ {fmt(input.flowRate)} mL/min
                  </span>
                </div>

                <div className="mt-5 rounded-lg bg-ink text-paper p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                      Targeting ligand
                    </p>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary ring-1 ring-primary/40">
                      {targeting.status}
                    </span>
                  </div>
                  <p className="mt-2 text-lg font-semibold tracking-tight">
                    {targeting.ligand} · {targeting.receptor}
                  </p>
                  <p className="font-mono text-[11px] text-paper/60 mt-1">
                    {targeting.rationale} · affinity {targeting.affinity}
                  </p>
                </div>
              </div>

              {/* alternates + process */}
              <div className="col-span-12 xl:col-span-5 flex flex-col gap-4">
                <div className="rounded-xl bg-panel ring-1 ring-black/5 p-4">
                  <div className="flex items-baseline justify-between mb-3">
                    <h2 className="text-[13px] font-semibold tracking-tight">Top-3 alternate lipids</h2>
                    <span className="font-mono text-[10px] text-ink-soft/60">03</span>
                  </div>
                  <ol className="space-y-2">
                    {alternates.map((a, i) => (
                      <li
                        key={a.lipid.id}
                        className="flex items-center gap-3 rounded-lg bg-paper ring-1 ring-line p-2.5"
                      >
                        <span
                          className={`font-mono text-sm font-bold w-4 ${
                            i === 0 ? "text-accent-ink" : "text-ink-soft"
                          }`}
                        >
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-mono text-[12px] font-bold truncate">{a.lipid.name}</p>
                          <p className="font-mono text-[10px] text-ink-soft">
                            pKa {fmt(a.lipid.pKa, 2)} · escape {fmt(a.escape, 0)}%
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-sm font-bold">{fmt(a.encapsulation, 0)}%</p>
                          <div className="mt-1 h-1 w-16 rounded-full bg-line overflow-hidden ml-auto">
                            <div
                              className="h-full bg-primary bar-grow"
                              style={{ width: `${a.encapsulation}%` }}
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPinned(a.lipid.id)}
                          className="font-mono text-[10px] px-2 py-1 rounded-md ring-1 ring-line text-ink-soft hover:bg-primary/5 hover:text-accent-ink"
                        >
                          use
                        </button>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="rounded-xl bg-panel ring-1 ring-black/5 p-4 flex-1">
                  <div className="flex items-baseline justify-between mb-3">
                    <h2 className="text-[13px] font-semibold tracking-tight">Microfluidic alignment</h2>
                    <span className="font-mono text-[10px] text-ink-soft/60">04</span>
                  </div>
                  <div className="h-[120px] rounded-lg bg-ink overflow-hidden flex items-center px-4 gap-2">
                    {Array.from({ length: 12 }).map((_, i) => {
                      const jitter = lead.pdi * 46;
                      const size = 8 + (lead.size - 42) / 12;
                      return (
                        <span
                          key={i}
                          className="rounded-full bg-primary transition-all duration-500"
                          style={{
                            width: `${size}px`,
                            height: `${size}px`,
                            transform: `translateY(${((i % 3) - 1) * jitter}px)`,
                            opacity: 0.55 + ((i % 4) * 0.12),
                          }}
                        />
                      );
                    })}
                  </div>
                  <p className="font-mono text-[10px] text-ink-soft mt-2 text-pretty">
                    {lead.pdi < 0.2 ? "Droplets snap into monodisperse alignment" : "Population is polydisperse"} ·
                    flow {fmt(input.flowRatio)}:1, {fmt(input.flowRate)} mL/min · D₅₀ {fmt(lead.size)} nm
                  </p>
                </div>
              </div>

              {/* lipid library */}
              <div className="col-span-12 rounded-xl bg-panel ring-1 ring-black/5">
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-line">
                  <div className="flex items-baseline gap-3">
                    <h2 className="text-[13px] font-semibold tracking-tight">Ionizable lipid library</h2>
                    <span className="font-mono text-[10px] text-ink-soft/60">05</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 font-mono text-[10px] text-ink-soft">
                      <span className="uppercase tracking-[0.12em]">pKa</span>
                      <input
                        type="range"
                        min={5.5}
                        max={7.5}
                        step={0.05}
                        value={pKaMin}
                        onChange={(e) => setPKaMin(Math.min(Number(e.target.value), pKaMax))}
                        className="w-20"
                      />
                      <span className="w-16 text-center text-accent-ink font-bold">
                        {fmt(pKaMin, 2)}–{fmt(pKaMax, 2)}
                      </span>
                      <input
                        type="range"
                        min={5.5}
                        max={7.5}
                        step={0.05}
                        value={pKaMax}
                        onChange={(e) => setPKaMax(Math.max(Number(e.target.value), pKaMin))}
                        className="w-20"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPKaMin(6);
                        setPKaMax(7);
                      }}
                      className="font-mono text-[10px] px-2 py-1 rounded-md ring-1 ring-line text-ink-soft hover:bg-primary/5"
                    >
                      optimal window
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-[12px]">
                    <thead>
                      <tr className="text-[10px] uppercase tracking-[0.12em] text-ink-soft border-b border-line">
                        <th className="px-4 py-2 font-medium">Lipid</th>
                        <th className="px-3 py-2 font-medium text-right">pKa</th>
                        <th className="px-3 py-2 font-medium text-right">logP</th>
                        <th className="px-3 py-2 font-medium text-right">Tail</th>
                        <th className="px-3 py-2 font-medium text-right">Encap.</th>
                        <th className="px-3 py-2 font-medium text-right">Size</th>
                        <th className="px-3 py-2 font-medium text-right">PDI</th>
                        <th className="px-3 py-2 font-medium text-right">Escape</th>
                        <th className="px-3 py-2 font-medium text-right">Score</th>
                        <th className="px-4 py-2 font-medium text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((r) => {
                        const isLead = r.lipid.id === lead.lipid.id;
                        return (
                          <tr
                            key={r.lipid.id}
                            onClick={() => setPinned(r.lipid.id)}
                            className={`border-b border-line cursor-pointer transition-colors hover:bg-primary/5 ${
                              isLead ? "bg-primary/5" : ""
                            }`}
                          >
                            <td className="px-4 py-2.5 font-bold">
                              {r.lipid.name}
                              <span className="block text-[10px] font-normal text-ink-soft truncate max-w-[22ch]">
                                {r.lipid.origin}
                              </span>
                            </td>
                            <td
                              className={`px-3 py-2.5 text-right ${
                                r.lipid.pKa >= 6 && r.lipid.pKa <= 7 ? "text-accent-ink font-bold" : "text-rust"
                              }`}
                            >
                              {fmt(r.lipid.pKa, 2)}
                            </td>
                            <td className="px-3 py-2.5 text-right">{fmt(r.lipid.logP)}</td>
                            <td className="px-3 py-2.5 text-right">{r.lipid.tail}</td>
                            <td className="px-3 py-2.5 text-right font-bold">{fmt(r.encapsulation, 0)}%</td>
                            <td className="px-3 py-2.5 text-right">{fmt(r.size, 0)} nm</td>
                            <td className="px-3 py-2.5 text-right">{fmt(r.pdi, 3)}</td>
                            <td className="px-3 py-2.5 text-right">{fmt(r.escape, 0)}%</td>
                            <td className="px-3 py-2.5 text-right font-bold">{fmt(r.score, 0)}</td>
                            <td className="px-4 py-2.5 text-right">
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full ring-1 ${
                                  isLead
                                    ? "bg-primary/10 text-accent-ink ring-primary/30"
                                    : "bg-ink/5 text-ink-soft ring-line"
                                }`}
                              >
                                {isLead ? "selected" : r.lipid.clinical.toLowerCase()}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-2 border-t border-line flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] text-ink-soft/70">
                  <span>
                    {filtered.length} of {ranked.length} lipids · sorted by delivery score ↓ · click a row to pin
                  </span>
                  <span>Predictions are in silico — validate in vitro before use.</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
