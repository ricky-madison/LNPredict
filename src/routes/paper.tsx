import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Card } from "@/components/lnp/controls";
import { LineChart, RangeBars, ValueBars } from "@/components/lnp/Charts";
import { LIGANDS, PLATFORMS } from "@/lib/lnp/data";
import {
  PAPER,
  SELECTIVITY,
  STRATEGIES,
  TABLE3,
  TABLE3_NOTE,
  dlsDistributions,
  doseResponse,
  p53Kinetics,
  pdiDistributions,
  releaseGSH,
  releasePH,
  releaseSiRNA,
  releaseThermo,
  tumourGrowth,
  zetaVsPH,
} from "@/lib/lnp/paper";

export const Route = createFileRoute("/paper")({
  head: () => ({
    meta: [
      { title: "Paper Companion — Lipid Nanoparticle Platforms for p53-Targeted Cancer Therapy" },
      {
        name: "description",
        content:
          "Interactive companion to Madison (2026), Cancer Nanotechnology: LNP architectures, p53 cargo strategies, active targeting, stimuli-responsive release and clinical pipeline, with every table and figure reproduced.",
      },
      { property: "og:title", content: "Paper Companion — p53-Targeted LNP Platforms" },
      {
        property: "og:description",
        content: "Tables 1–3 and Figures 1–4 of the peer-reviewed review on lipid nanoparticles for p53-targeted cancer therapy, reproduced live.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PaperPage,
});

function Th({ children }: { children?: ReactNode }) {
  return <th className="px-3 py-2 font-medium align-bottom">{children}</th>;
}
const td = "px-3 py-2 align-top";

function Note({ children }: { children: ReactNode }) {
  return <p className="mt-3 font-mono text-[10px] leading-relaxed text-ink-soft/80 text-pretty">{children}</p>;
}

function Fig({ n, title, caption, children }: { n: string; title: string; caption: string; children: ReactNode }) {
  return (
    <Card title={`Fig. ${n} · ${title}`} tag="figure">
      {children}
      <Note>{caption}</Note>
    </Card>
  );
}

/** Fig. 1 — schematic of the four LNP architectures. */
function Fig1() {
  const items: { key: string; label: string; sub: string; draw: ReactNode }[] = [
    {
      key: "A",
      label: "Conventional liposome",
      sub: "bilayer · aqueous core · p53 mRNA",
      draw: (
        <g>
          <circle cx="60" cy="60" r="44" className="fill-primary/10 stroke-primary" strokeWidth="5" />
          <circle cx="60" cy="60" r="35" className="fill-none stroke-primary" strokeWidth="1.5" />
          <path d="M42 62c8-14 14 14 22 0s14 12 20-4" className="fill-none stroke-amber" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      ),
    },
    {
      key: "B",
      label: "Solid lipid NP",
      sub: "solid lipid matrix · siRNA + hydrophobic drug",
      draw: (
        <g>
          <circle cx="60" cy="60" r="44" className="fill-ink-soft/20 stroke-ink-soft" strokeWidth="3" />
          {[[45, 48], [70, 44], [55, 68], [78, 72], [40, 74], [64, 58]].map(([x, y]) => (
            <circle key={`${x}${y}`} cx={x} cy={y} r="4" className="fill-amber" />
          ))}
        </g>
      ),
    },
    {
      key: "C",
      label: "Ionizable LNP",
      sub: "pH-responsive lipid layer · PEG corona · pKa 6.0–7.0",
      draw: (
        <g>
          {Array.from({ length: 18 }).map((_, i) => {
            const a = (i / 18) * Math.PI * 2;
            return <line key={i} x1={60 + 44 * Math.cos(a)} y1={60 + 44 * Math.sin(a)} x2={60 + 55 * Math.cos(a)} y2={60 + 55 * Math.sin(a)} className="stroke-rust" strokeWidth="2" />;
          })}
          <circle cx="60" cy="60" r="44" className="fill-primary/20 stroke-primary" strokeWidth="4" />
          <circle cx="60" cy="60" r="24" className="fill-ink" />
          <path d="M48 62c5-9 9 9 14 0s9 8 12-3" className="fill-none stroke-primary" strokeWidth="2" strokeLinecap="round" />
        </g>
      ),
    },
    {
      key: "D",
      label: "Lipid-polymer hybrid",
      sub: "PLGA core · lipid shell · PEG corona · pDNA / CRISPR",
      draw: (
        <g>
          {Array.from({ length: 18 }).map((_, i) => {
            const a = (i / 18) * Math.PI * 2;
            return <line key={i} x1={60 + 44 * Math.cos(a)} y1={60 + 44 * Math.sin(a)} x2={60 + 55 * Math.cos(a)} y2={60 + 55 * Math.sin(a)} className="stroke-rust" strokeWidth="2" />;
          })}
          <circle cx="60" cy="60" r="44" className="fill-primary/15 stroke-primary" strokeWidth="4" />
          <circle cx="60" cy="60" r="28" className="fill-accent-ink/70" />
          <circle cx="54" cy="56" r="3.5" className="fill-amber" />
          <circle cx="68" cy="64" r="3.5" className="fill-amber" />
        </g>
      ),
    },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((it) => (
        <div key={it.key} className="rounded-lg bg-paper ring-1 ring-line p-3 text-center">
          <svg viewBox="0 0 120 120" role="img" aria-label={it.label} className="mx-auto h-28 w-28">
            {it.draw}
          </svg>
          <p className="mt-1 font-mono text-[11px] font-bold">
            {it.key} · {it.label}
          </p>
          <p className="font-mono text-[10px] text-ink-soft text-pretty">{it.sub}</p>
        </div>
      ))}
    </div>
  );
}

function PaperPage() {
  const gsh = releaseGSH();
  const rm = (s: ReturnType<typeof releasePH>) => s;
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-line">
        <div className="flex items-center gap-3">
          <div className="size-7 grid place-items-center bg-ink text-paper font-mono text-xs font-bold rounded-md">p53</div>
          <div>
            <p className="text-[13px] font-semibold tracking-tight leading-none">
              Paper companion <span className="text-ink-soft/60 font-normal">/ Madison 2026</span>
            </p>
            <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-ink-soft/70 mt-1">Cancer Nanotechnology · article in press</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/structure" className="font-mono text-[11px] font-medium text-ink-soft ring-1 ring-line rounded-lg py-2 px-3 hover:bg-primary/5 transition-colors">
            Molecular viewer
          </Link>
          <Link to="/validation" className="font-mono text-[11px] font-medium text-ink-soft ring-1 ring-line rounded-lg py-2 px-3 hover:bg-primary/5 transition-colors">
            Validation
          </Link>
          <Link to="/" className="font-mono text-[11px] font-medium text-accent-ink ring-1 ring-primary/40 rounded-lg py-2 px-3 hover:bg-primary/5 transition-colors">
            ← Designer
          </Link>
        </div>
      </header>

      <main className="px-5 py-6 max-w-[1200px] mx-auto space-y-4">
        <section className="rounded-xl bg-ink text-paper p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">Review · {PAPER.journal}</p>
          <h1 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight text-balance max-w-[34ch]">{PAPER.title}</h1>
          <p className="mt-2 font-mono text-[12px] text-paper/70">
            {PAPER.author} ·{" "}
            <a className="underline decoration-primary underline-offset-2" href={PAPER.url} target="_blank" rel="noreferrer">
              doi:{PAPER.doi}
            </a>
          </p>
          <p className="mt-4 text-[13px] leading-relaxed text-paper/80 max-w-[78ch] text-pretty">
            LNPs are the most clinically validated nanocarrier platform in oncology. This review reframes LNP development around p53 — inactivated in over 50% of
            human cancers — and unifies four nucleic-acid strategies (p53 mRNA, mutant-p53 siRNA, miR-34a mimics, CRISPR-Cas9) under one biological framework,
            with liver-dominant biodistribution, anti-PEG immunogenicity, manufacturing scalability and regulatory complexity as the persistent barriers.
          </p>
          <ul className="mt-4 grid md:grid-cols-2 gap-x-6 gap-y-1.5 font-mono text-[11px] text-paper/70 list-disc pl-4">
            <li>Ionizable lipids with optimised pKa (6.0–7.0) enable efficient endosomal escape.</li>
            <li>p53 mRNA-LNPs restore wild-type p53 in TP53-deficient tumours and sensitise to mTOR and checkpoint inhibition.</li>
            <li>KEYNOTE-942 Phase IIb: mRNA-4157 + pembrolizumab, 44% reduction in recurrence risk (neoantigen vaccine, not p53).</li>
            <li>AI-driven lipid discovery screened 1.6 million virtual lipids.</li>
            <li>Stimuli-responsive LNPs (pH, redox, enzyme) achieve tumour-selective release.</li>
            <li>Passive EPR delivers a median of only 0.7% of the injected dose to tumours.</li>
          </ul>
        </section>

        <Card title="How the paper maps onto the Designer" tag="map">
          <ul className="grid md:grid-cols-2 gap-2 font-mono text-[11px]">
            {[
              ["Four p53 strategies + dual cargo", "Cargo selector with paper-recommended class per TP53 variant"],
              ["Table 1 — LNP platforms", "Architecture selector, range checks, 3D architecture view"],
              ["Table 2 — active targeting", "Ligand + density vs passive 0.7% EPR"],
              ["Fig. 3 — triggered release", "pH / redox / enzyme / thermo / ultrasound release curves"],
              ["SORT trade-offs", "Charged-lipid fraction: biodistribution and escape penalty"],
              ["Anti-PEG immunogenicity", "Corona choice, repeat-dose ABC risk"],
              ["Immunotherapy combination", "Anti-PD-1 toggle and KEYNOTE-942 context"],
              ["Table 3 — clinical pipeline", "Platform benchmarks in the Designer"],
            ].map(([a, b]) => (
              <li key={a} className="rounded-lg bg-paper ring-1 ring-line p-2.5">
                <span className="font-bold text-accent-ink">{a}</span>
                <span className="block text-ink-soft">{b}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Fig n="1" title="LNP architectures for p53-directed therapy" caption="Schematic representation only; does not represent experimental imaging data (as stated in the paper).">
          <Fig1 />
        </Fig>

        <Card title="Table 1 · Comparison of LNP platforms for p53-directed cancer drug delivery" tag="table">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-[11px]">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.1em] text-ink-soft border-b border-line">
                  <Th>Feature</Th>
                  {PLATFORMS.slice()
                    .sort((a, b) => ["liposome", "sln", "nlc", "ionizable", "hybrid"].indexOf(a.id) - ["liposome", "sln", "nlc", "ionizable", "hybrid"].indexOf(b.id))
                    .map((p) => (
                      <Th key={p.id}>{p.label}</Th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {(
                  [
                    ["Size (nm)", (p: (typeof PLATFORMS)[number]) => `${p.size[0]}–${p.size[1]}`],
                    ["Drug loading (%)", (p: (typeof PLATFORMS)[number]) => `${p.loading[0]}–${p.loading[1]}`],
                    ["Encapsulation efficiency (%)", (p: (typeof PLATFORMS)[number]) => `${p.encap[0]}–${p.encap[1]}`],
                    ["p53 cargo compatibility", (p: (typeof PLATFORMS)[number]) => p.cargos.join(", ")],
                    ["Clinical status", (p: (typeof PLATFORMS)[number]) => p.status],
                    ["Key limitations", (p: (typeof PLATFORMS)[number]) => p.limitation],
                  ] as const
                ).map(([k, fn]) => (
                  <tr key={k} className="border-b border-line">
                    <td className={`${td} font-bold`}>{k}</td>
                    {PLATFORMS.slice()
                      .sort((a, b) => ["liposome", "sln", "nlc", "ionizable", "hybrid"].indexOf(a.id) - ["liposome", "sln", "nlc", "ionizable", "hybrid"].indexOf(b.id))
                      .map((p) => (
                        <td key={p.id} className={td}>
                          {fn(p)}
                        </td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Note>
            SLN = solid lipid nanoparticle; NLC = nanostructured lipid carrier; LPHN = lipid-polymer hybrid nanoparticle; pDNA = plasmid DNA; sa-mRNA = self-amplifying
            mRNA. Values are typical literature ranges and vary with formulation parameters and cargo.
          </Note>
        </Card>

        <div className="grid lg:grid-cols-2 gap-4">
          <Fig n="2A" title="DLS size distribution" caption="Mean ≈95 nm (p53 mRNA-LNP), ≈120 nm (siRNA-LNP), ≈150 nm (empty LNP). Representative simulated profile, as in the paper.">
            <LineChart series={dlsDistributions()} xMin={20} xMax={400} yMax={100} xLog xLabel="hydrodynamic diameter (nm)" yLabel="intensity (a.u.)" />
          </Fig>
          <Fig n="2B" title="Zeta potential vs pH" caption="Ionizable LNP with pKa 6.5: charge transition for endosomal escape while remaining near-neutral in circulation (pH 7.4).">
            <LineChart
              series={zetaVsPH(6.5)}
              xMin={4}
              xMax={8}
              yMin={-10}
              yMax={30}
              xLabel="pH"
              yLabel="zeta potential (mV)"
              xTicks={[4, 5, 6, 7, 8]}
              band={{ from: 6.0, to: 7.0, label: "pKa window 6.0–7.0" }}
            />
          </Fig>
          <Fig n="2C" title="Encapsulation efficiency by platform" caption="Drawn from Table 1 ranges (typical literature values). Ionizable LNPs exceed 90% encapsulation.">
            <RangeBars
              max={100}
              unit="%"
              items={PLATFORMS.map((p) => ({ label: p.label, low: p.encap[0], high: p.encap[1], highlight: p.id === "ionizable" }))}
            />
          </Fig>
          <Fig n="2D" title="PDI distributions" caption="All formulations below the 0.3 acceptance threshold. Representative simulated plots.">
            <LineChart series={pdiDistributions()} xMax={0.3} yMax={100} xLabel="polydispersity index" yLabel="frequency (a.u.)" xTicks={[0, 0.1, 0.2, 0.3]} refX={{ x: 0.3, label: "0.3 limit" }} />
          </Fig>
        </div>

        <Card title="p53 as a master therapeutic target · four LNP strategies" tag="text">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-[11px]">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.1em] text-ink-soft border-b border-line">
                  <Th>Strategy</Th>
                  <Th>Indicated when</Th>
                  <Th>Caveat</Th>
                </tr>
              </thead>
              <tbody>
                {STRATEGIES.map((s) => (
                  <tr key={s.id} className="border-b border-line">
                    <td className={`${td} font-bold`}>{s.name}</td>
                    <td className={td}>{s.indication}</td>
                    <td className={td}>{s.caveat}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Note>Restoring p53 reactivates p21/CDKN1A cell-cycle arrest, Bax/Bcl-2 apoptosis and caspase-3 activation, senescence and ferroptosis, and the miR-34 positive-feedback loop.</Note>
        </Card>

        <Card title="Table 2 · Active targeting strategies for p53-directed LNP delivery" tag="table">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-[11px]">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.1em] text-ink-soft border-b border-line">
                  <Th>Strategy</Th>
                  <Th>Ligand</Th>
                  <Th>Target</Th>
                  <Th>Cancer types</Th>
                  <Th>Status</Th>
                  <Th>Key limitations</Th>
                </tr>
              </thead>
              <tbody>
                {LIGANDS.map((l) => (
                  <tr key={l.id} className="border-b border-line">
                    <td className={`${td} font-bold`}>{l.strategy}</td>
                    <td className={td}>{l.ligand}</td>
                    <td className={td}>{l.target}</td>
                    <td className={td}>{l.cancers.join(", ")}</td>
                    <td className={td}>{l.status}</td>
                    <td className={td}>{l.limitation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Note>
            Phases indicate clinical exploration of the ligand/platform generally, not specifically for p53 cargo. No dedicated p53-directed ligand-targeted LNP product has
            yet entered clinical trials.
          </Note>
        </Card>

        <div className="grid lg:grid-cols-2 gap-4">
          <Fig n="3A" title="pH-responsive p53 mRNA release" caption="Accelerated release at pH 5.5 (endosomal) vs pH 6.5 (tumour microenvironment) and pH 7.4 (blood).">
            <LineChart series={rm(releasePH(6.5))} xMax={48} yMax={100} xLabel="time (h)" yLabel="cumulative release (%)" xTicks={[0, 12, 24, 36, 48]} />
          </Fig>
          <Fig n="3B" title="Three-phase siRNA release" caption="Burst (0–2 h), sustained (2–12 h) and plateau (>12 h) phases from ionizable LNPs.">
            <LineChart series={releaseSiRNA()} xMax={48} yMax={100} xLabel="time (h)" yLabel="cumulative release (%)" xTicks={[0, 12, 24, 36, 48]} band={{ from: 0, to: 2, label: "burst" }} refX={{ x: 12, label: "plateau >12 h" }} />
          </Fig>
          <Fig n="3C" title="Thermosensitive release (NLC)" caption="Release at 37–45 °C with a trigger zone at 40–42 °C (DPPC gel-to-liquid-crystalline transition ≈41 °C).">
            <LineChart series={releaseThermo()} xMax={24} yMax={100} xLabel="time (h)" yLabel="cumulative release (%)" xTicks={[0, 6, 12, 18, 24]} />
          </Fig>
          <Fig n="3D" title="Redox-responsive release vs GSH" caption="Intracellular GSH (2–10 mM) triggers near-complete release; extracellular GSH (~10 µM) does not.">
            <LineChart
              series={[{ name: "disulfide-lipid LNP", tone: "primary", points: gsh.map((g) => [g.gsh, g.release] as [number, number]) }]}
              xMin={0.001}
              xMax={25}
              yMax={100}
              xLog
              xLabel="GSH concentration (mM, log)"
              yLabel="release (%)"
              band={{ from: 2, to: 10, label: "intracellular" }}
              refX={{ x: 0.01, label: "~10 µM" }}
            />
          </Fig>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <Fig n="4A" title="Dose response in p53-null HCT116" caption="Conceptual: p53 mRNA-LNP vs free doxorubicin vs empty LNP. Generated artificially for visualisation in the paper; not a single experimental dataset.">
            <LineChart series={doseResponse()} xMin={0.01} xMax={100} yMax={100} xLog xLabel="dose (µM, log)" yLabel="cell viability (%)" />
          </Fig>
          <Fig n="4B" title="Selectivity at 1 µM" caption="Preferential cytotoxicity in p53-null and wild-type cancer cells vs normal HDF fibroblasts and BEAS-2B bronchial epithelium. Conceptual values.">
            <ValueBars items={SELECTIVITY.map((s, i) => ({ ...s, tone: i < 2 ? "primary" : "ink" }))} title="viability after p53 mRNA-LNP" />
          </Fig>
          <Fig n="4C" title="Xenograft growth inhibition" caption="p53 mRNA-LNP and the combination with anti-PD-1 show superior efficacy in HCT116 xenografts. Conceptual.">
            <LineChart series={tumourGrowth()} xMax={28} yMax={2000} xLabel="day" yLabel="relative tumour volume (%)" xTicks={[0, 7, 14, 21, 28]} />
          </Fig>
          <Fig n="4D" title="Temporal p53 restoration" caption="p53 protein peaks at 24 h, followed by p21 (CDKN1A) and cleaved caspase-3. Transient expression limits the therapeutic window.">
            <LineChart series={p53Kinetics()} xMax={96} yMax={100} xLabel="time after LNP (h)" yLabel="relative level (%)" xTicks={[0, 24, 48, 72, 96]} refX={{ x: 24, label: "p53 peak 24 h" }} />
          </Fig>
        </div>

        <Card title="Table 3 · Selected LNP-based cancer therapeutics in clinical development (2020–2026)" tag="table">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-[11px]">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.1em] text-ink-soft border-b border-line">
                  <Th>Product</Th>
                  <Th>Platform</Th>
                  <Th>Cargo</Th>
                  <Th>Indication</Th>
                  <Th>Phase</Th>
                  <Th>Company</Th>
                </tr>
              </thead>
              <tbody>
                {TABLE3.map((r) => (
                  <tr key={r.product} className={`border-b border-line ${r.p53 ? "bg-primary/5" : ""}`}>
                    <td className={`${td} font-bold`}>{r.product}</td>
                    <td className={td}>{r.platform}</td>
                    <td className={td}>{r.cargo}</td>
                    <td className={td}>{r.indication}</td>
                    <td className={td}>{r.phase}</td>
                    <td className={td}>{r.company}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Note>* {TABLE3_NOTE} AML = acute myeloid leukaemia; NSCLC = non-small cell lung cancer; HCC = hepatocellular carcinoma.</Note>
        </Card>

        <div className="grid lg:grid-cols-2 gap-4">
          <Card title="Clinical translation: challenges and solutions" tag="text">
            <ul className="space-y-2 font-mono text-[11px] text-ink-soft list-disc pl-4 text-pretty">
              <li>Manufacturing: microfluidic mixing is the industry standard; flow rates and mixing ratios set size, PDI and encapsulation, and scale-up must preserve critical quality attributes.</li>
              <li>Immunogenicity: anti-PEG antibodies can cause accelerated blood clearance on repeat dosing; mitigations are alternative polymer coronas, PEG dose optimisation and biomimetic coatings.</li>
              <li>Regulatory: LNP products may be combination products; EMA nanomedicine reflection paper and FDA liposome guidance apply.</li>
              <li>Barriers: p53 expression duration, TP53 heterogeneity within tumours, and liver-dominant biodistribution (SORT or active targeting, each with trade-offs).</li>
            </ul>
          </Card>
          <Card title="Future perspectives" tag="text">
            <ul className="space-y-2 font-mono text-[11px] text-ink-soft list-disc pl-4 text-pretty">
              <li>AI-driven LNP design: virtual lipid screening and models trained on LNP activity datasets (Witten et al. 2025).</li>
              <li>SORT nanoparticles: extrahepatic delivery via charged lipids, with endosomal-escape and scale-up trade-offs.</li>
              <li>Biomimetic approaches: cell-membrane-coated NPs and exosome-mimetic LNPs; personalised p53 mRNA-LNPs from TP53 sequencing.</li>
              <li>Self-amplifying mRNA for lower doses; CRISPR-Cas9 and circular ADAR-recruiting RNAs for TP53 correction.</li>
            </ul>
          </Card>
        </div>

        <p className="font-mono text-[10px] text-ink-soft/70 text-pretty pb-6">
          Figures 2–4 in the paper are conceptual plots simulated for visualisation; the curves here reproduce those trends and are not experimental data. Cite as: Madison R. {PAPER.title}.{" "}
          {PAPER.journal} (2026). doi:{PAPER.doi}.
        </p>
      </main>
    </div>
  );
}
