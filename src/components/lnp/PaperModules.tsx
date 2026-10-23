import { CARGOS, LIGANDS, PLATFORMS, RELEASE_TRIGGERS, type CargoType } from "@/lib/lnp/data";
import type { DesignInput, DesignResult } from "@/lib/lnp/predict";
import { CORONAS, STRATEGIES, TABLE3, TABLE3_NOTE } from "@/lib/lnp/paper";
import { Card, Chip, Slider } from "./controls";
import { LineChart, ValueBars } from "./Charts";

type SetFn = <K extends keyof DesignInput>(k: K, v: DesignInput[K]) => void;

const fmt = (n: number, d = 1) => n.toFixed(d);
const selectCls =
  "w-full bg-paper ring-1 ring-line rounded-lg px-3 py-2 text-[13px] font-medium text-ink focus:outline-none focus:ring-2 focus:ring-primary";

/** Designer modules that implement the review paper's framework (strategy, Tables 1–3, SORT, anti-PEG, Fig. 3). */
export function PaperModules({ input, set, result }: { input: DesignInput; set: SetFn; result: DesignResult }) {
  const platform = PLATFORMS.find((p) => p.id === input.platformId)!;
  const strat = STRATEGIES.find((s) => s.id === input.cargo)!;
  const rec = STRATEGIES.find((s) => s.id === result.strategy.primary)!;
  const { targeting, bio, peg, release } = result;
  const trigger = RELEASE_TRIGGERS.find((t) => t.id === input.triggerId)!;
  const benchmarks = TABLE3.filter((r) => r.platformId === input.platformId);

  const releaseXMax = 48;

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* STRATEGY */}
      <div className="col-span-12 xl:col-span-6">
        <Card title="p53 strategy · cargo class" tag="06" source="p53 as a master therapeutic target">
          <p className="font-mono text-[11px] text-ink-soft leading-relaxed">
            <span className="text-accent-ink font-bold">{input.variantId}</span> → {result.strategy.rationale}
          </p>
          <div className="mt-3 grid gap-1.5">
            {STRATEGIES.map((s) => {
              const active = s.id === input.cargo;
              const isRec = s.id === result.strategy.primary;
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => set("cargo", s.id as CargoType)}
                  className={`text-left rounded-lg px-3 py-2 ring-1 transition-colors ${
                    active ? "bg-ink text-paper ring-ink" : "bg-paper ring-line hover:bg-primary/5"
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[12px] font-bold">{s.name}</span>
                    {isRec ? (
                      <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary ring-1 ring-primary/40">
                        paper-recommended
                      </span>
                    ) : null}
                  </span>
                  <span className={`block font-mono text-[10px] mt-0.5 ${active ? "text-paper/70" : "text-ink-soft"}`}>{s.indication}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-3 font-mono text-[10px] text-rust">⚠ {strat.caveat}</p>
          {input.cargo !== result.strategy.primary ? (
            <button
              type="button"
              onClick={() => set("cargo", result.strategy.primary)}
              className="mt-2 font-mono text-[10px] px-2 py-1 rounded-md ring-1 ring-primary/40 text-accent-ink hover:bg-primary/5"
            >
              apply recommended: {rec.name}
            </button>
          ) : null}
          {!result.compatible ? (
            <p className="mt-2 font-mono text-[10px] text-rust">
              ⚠ Table 1 lists {platform.label} for {platform.cargos.join(", ")} — {CARGOS.find((c) => c.id === input.cargo)!.id} is not a listed
              cargo for this platform.
            </p>
          ) : null}
        </Card>
      </div>

      {/* PLATFORM */}
      <div className="col-span-12 xl:col-span-6">
        <Card title="Nanocarrier architecture" tag="07" source="Table 1 · Fig. 1">
          <div className="flex flex-wrap gap-1.5">
            {PLATFORMS.map((p) => (
              <Chip key={p.id} active={p.id === input.platformId} onClick={() => set("platformId", p.id)}>
                {p.label}
              </Chip>
            ))}
          </div>
          <p className="mt-3 font-mono text-[11px] text-ink-soft leading-relaxed">{platform.architecture}.</p>
          <dl className="mt-3 grid grid-cols-2 gap-2 font-mono text-[10px]">
            {[
              ["Size", `${platform.size[0]}–${platform.size[1]} nm`],
              ["Drug loading", `${platform.loading[0]}–${platform.loading[1]} %`],
              ["Encapsulation", `${platform.encap[0]}–${platform.encap[1]} %`],
              ["Cargo compatibility", platform.cargos.join(", ")],
              ["Clinical status", platform.status],
              ["Key limitation", platform.limitation],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg bg-paper ring-1 ring-line p-2">
                <dt className="uppercase tracking-[0.12em] text-ink-soft/70">{k}</dt>
                <dd className="mt-0.5 font-bold text-ink">{v}</dd>
              </div>
            ))}
          </dl>
          <ul className="mt-3 space-y-1">
            {result.checks.map((c) => (
              <li key={c.label} className="flex items-center justify-between font-mono text-[10px]">
                <span className="text-ink-soft">
                  Predicted {c.label.toLowerCase()} {fmt(c.value, 0)}
                  {c.unit} vs Table 1 {c.range[0]}–{c.range[1]}
                  {c.unit}
                </span>
                <span className={c.inRange ? "text-accent-ink font-bold" : "text-rust font-bold"}>{c.inRange ? "in range" : "outside"}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* TARGETING */}
      <div className="col-span-12 xl:col-span-6">
        <Card title="Active targeting vs passive EPR" tag="08" source="Table 2 · passive targeting">
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">Ligand</span>
            <select className={`${selectCls} mt-1.5`} value={input.ligandId} onChange={(e) => set("ligandId", e.target.value)}>
              <option value="auto">Auto — paper-recommended for {input.cancer}</option>
              <option value="none">None — passive EPR only</option>
              {LIGANDS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.strategy} · {l.ligand} → {l.target}
                </option>
              ))}
            </select>
          </label>
          <div className="mt-3">
            <Slider
              label="Ligand surface density"
              min={0}
              max={5}
              step={0.1}
              value={input.ligandPct}
              display={`${fmt(input.ligandPct)} mol%`}
              onChange={(v) => set("ligandPct", v)}
            />
          </div>
          <div className="mt-4 rounded-lg bg-ink text-paper p-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
              {targeting.ligand ? `${targeting.ligand.ligand} · ${targeting.ligand.target}` : "No Table 2 ligand"}
            </p>
            <p className="mt-1 font-mono text-[11px] text-paper/70 text-pretty">{targeting.evidence}</p>
            {targeting.ligand ? (
              <p className="mt-1 font-mono text-[10px] text-paper/60">
                Limitation: {targeting.ligand.limitation}. {targeting.matchesCancer ? "" : "Ligand is not listed for this cancer type in Table 2."}
              </p>
            ) : null}
          </div>
          <div className="mt-3">
            <ValueBars
              unit="% ID"
              max={Math.max(3, targeting.modelledDose * 1.2)}
              items={[
                { label: "Passive EPR (median)", value: targeting.passiveDose, tone: "rust" },
                { label: "Modelled with ligand", value: targeting.modelledDose, tone: "primary" },
              ]}
            />
            <p className="mt-2 font-mono text-[9px] text-ink-soft/70">
              Passive 0.7% is the Wilhelm et al. 2016 median cited in the paper; the ligand gain ({fmt(targeting.foldGain, 2)}×) is an illustrative
              saturating model — the paper reports no fold-gain. No p53-directed ligand-targeted LNP has entered clinical trials.
            </p>
          </div>
        </Card>
      </div>

      {/* RELEASE */}
      <div className="col-span-12 xl:col-span-6">
        <Card title="Stimuli-responsive release" tag="09" source="Fig. 3 · stimuli-responsive and triggered release">
          <div className="flex flex-wrap gap-1.5">
            {RELEASE_TRIGGERS.map((t) => (
              <Chip key={t.id} active={t.id === input.triggerId} onClick={() => set("triggerId", t.id)}>
                {t.label}
              </Chip>
            ))}
          </div>
          <p className="mt-2 font-mono text-[10px] text-ink-soft">{trigger.note}</p>
          <div className="mt-3">
            <LineChart
              title={release.title}
              series={release.series}
              xMax={releaseXMax}
              yMax={100}
              xLabel={release.xLabel}
              yLabel="cumulative release (%)"
              xTicks={[0, 12, 24, 36, 48]}
            />
          </div>
          <p className="mt-2 font-mono text-[10px] text-ink-soft text-pretty">
            {release.note} Selectivity at 24 h: <span className="font-bold text-accent-ink">{fmt(release.selectivity, 0)} pts</span> triggered vs off.
          </p>
        </Card>
      </div>

      {/* SORT */}
      <div className="col-span-12 xl:col-span-6">
        <Card title="SORT charged lipid · biodistribution" tag="10" source="AI-driven LNP design · SORT trade-offs">
          <Slider
            label="SORT charged-lipid fraction"
            min={0}
            max={30}
            step={1}
            value={input.sortPct}
            display={`${input.sortPct} mol%`}
            onChange={(v) => set("sortPct", v)}
          />
          <div className="mt-3">
            <ValueBars
              title="Predicted organ share of dose"
              items={[
                { label: "Liver", value: bio.liver, tone: "ink" },
                { label: "Spleen", value: bio.spleen, tone: "amber" },
                { label: "Lung", value: bio.lung, tone: "amber" },
                { label: "Tumour", value: bio.tumour, tone: "primary" },
              ]}
            />
          </div>
          <ul className="mt-3 space-y-1 font-mono text-[10px] text-ink-soft list-disc pl-4">
            <li>Standard ionizable formulations are liver-dominant, limiting extrahepatic efficacy.</li>
            <li>SORT charged lipids alter protein-corona composition and shift uptake to spleen / lung.</li>
            <li className={input.sortPct > 0 ? "text-rust" : undefined}>
              Trade-offs: endosomal escape {input.sortPct > 0 ? `drops to ${fmt(result.lead.escape, 0)}%` : "can drop"}, non-specific uptake rises, scale-up is harder; re-optimise
              ionizable pKa and PEG-lipid.
            </li>
          </ul>
          <p className="mt-2 font-mono text-[9px] text-ink-soft/70">Organ percentages are an illustrative, qualitative model of the paper&apos;s statements.</p>
        </Card>
      </div>

      {/* PEG */}
      <div className="col-span-12 xl:col-span-6">
        <Card title="Anti-PEG immunogenicity" tag="11" source="Immunogenicity and safety">
          <div className="flex flex-wrap gap-1.5">
            {CORONAS.map((c) => (
              <Chip key={c.id} active={c.id === input.coronaId} onClick={() => set("coronaId", c.id)}>
                {c.label}
              </Chip>
            ))}
          </div>
          <p className="mt-2 font-mono text-[10px] text-ink-soft">{CORONAS.find((c) => c.id === input.coronaId)!.note}</p>
          <label className="mt-3 flex items-center gap-2 font-mono text-[11px] text-ink-soft">
            <input type="checkbox" checked={input.repeatDosing} onChange={(e) => set("repeatDosing", e.target.checked)} />
            Chronic / multi-cycle regimen (repeat dosing)
          </label>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] font-medium text-ink-soft">Accelerated blood clearance risk</span>
              <span
                className={`font-mono text-sm font-bold ${peg.level === "high" ? "text-rust" : peg.level === "moderate" ? "text-amber" : "text-accent-ink"}`}
              >
                {peg.level} · {fmt(peg.score, 0)}/100
              </span>
            </div>
            <div className="mt-1.5 h-1.5 rounded-full bg-line overflow-hidden">
              <div className={`h-full bar-grow ${peg.level === "high" ? "bg-rust" : peg.level === "moderate" ? "bg-amber" : "bg-primary"}`} style={{ width: `${peg.score}%` }} />
            </div>
          </div>
          <ul className="mt-3 space-y-1 font-mono text-[10px] text-ink-soft list-disc pl-4">
            {peg.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </Card>
      </div>

      {/* IMMUNE + CLINICAL */}
      <div className="col-span-12 xl:col-span-6">
        <Card title="Immunotherapy combination & clinical benchmarks" tag="12" source="p53 LNPs in cancer immunotherapy · Table 3">
          <label className="flex items-center gap-2 font-mono text-[11px] text-ink-soft">
            <input type="checkbox" checked={input.antiPD1} onChange={(e) => set("antiPD1", e.target.checked)} />
            Combine with anti-PD-1 checkpoint blockade
          </label>
          <p className="mt-3 font-mono text-[11px] font-bold text-accent-ink">{result.immune.headline}</p>
          <ul className="mt-1 space-y-1.5 font-mono text-[10px] text-ink-soft list-disc pl-4">
            {result.immune.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left font-mono text-[10px]">
              <thead>
                <tr className="uppercase tracking-[0.1em] text-ink-soft border-b border-line">
                  <th className="py-1.5 pr-2 font-medium">Product ({platform.label})</th>
                  <th className="py-1.5 pr-2 font-medium">Cargo</th>
                  <th className="py-1.5 font-medium">Phase</th>
                </tr>
              </thead>
              <tbody>
                {benchmarks.length ? (
                  benchmarks.map((r) => (
                    <tr key={r.product} className="border-b border-line">
                      <td className="py-1.5 pr-2 font-bold">{r.product}</td>
                      <td className="py-1.5 pr-2">{r.cargo}</td>
                      <td className="py-1.5">{r.phase}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-2 text-ink-soft">
                      No Table 3 product uses this platform — {platform.status.toLowerCase()} per Table 1.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="mt-2 font-mono text-[9px] text-ink-soft/70">{TABLE3_NOTE}</p>
        </Card>
      </div>
    </div>
  );
}
