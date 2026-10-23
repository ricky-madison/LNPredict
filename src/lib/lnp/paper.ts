import { CANCERS, LIGANDS, PLATFORMS, type CargoType, type LigandSpec, type Variant } from "./data";

/**
 * Everything in this module is derived from, or explicitly labelled against, the peer-reviewed review:
 * Madison R. "Lipid nanoparticle platforms for p53-targeted cancer therapy". Cancer Nanotechnology (2026).
 * https://doi.org/10.1186/s12645-026-00431-9
 * Paper figures 2–4 are themselves conceptual (simulated for visualisation); the curves here follow the same trends.
 */
export const PAPER = {
  title: "Lipid nanoparticle platforms for p53-targeted cancer therapy",
  author: "Ricky Madison",
  journal: "Cancer Nanotechnology",
  doi: "10.1186/s12645-026-00431-9",
  url: "https://doi.org/10.1186/s12645-026-00431-9",
  epr: 0.7, // median % injected dose reaching tumour by passive targeting (Wilhelm et al. 2016)
  pKaWindow: [6.0, 7.0] as [number, number],
  pdiThreshold: 0.3,
  ionizableShare: [30, 50] as [number, number],
} as const;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const bell = (x: number, mu: number, sigma: number) => Math.exp(-((x - mu) ** 2) / (2 * sigma * sigma));

/* -------------------------------------------------------------------------- */
/* Strategy selection — "p53 as a master therapeutic target" (four strategies) */
/* -------------------------------------------------------------------------- */

export interface StrategyInfo {
  id: CargoType;
  name: string;
  indication: string;
  caveat: string;
}

export const STRATEGIES: StrategyInfo[] = [
  { id: "mRNA", name: "p53 mRNA", indication: "TP53-null or loss-of-function (LOF) mutations where no dominant-negative protein is expressed.", caveat: "Therapeutic window is limited by the duration of p53 expression; transient transfection may be insufficient." },
  { id: "siRNA", name: "Mutant-p53 siRNA", indication: "Gain-of-function (GOF) missense mutants with oncogenic dominant-negative or neomorphic activity.", caveat: "Release follows a burst (0–2 h), sustained (2–12 h) and plateau (>12 h) profile." },
  { id: "dual", name: "siRNA + mRNA (single LNP)", indication: "Intra-tumoural heterogeneity where wild-type, null and GOF clones coexist; silences mutant and restores wild-type.", caveat: "Explored for refractory liver cancer; two cargo classes in one particle complicate formulation." },
  { id: "miRNA", name: "miR-34a mimic", indication: "Engages the p53 downstream axis regardless of mutational status, though less directly.", caveat: "MRX34 (liposomal miR-34a) was discontinued for immune-related adverse events." },
  { id: "CRISPR", name: "CRISPR-Cas9 / RNA editing", indication: "Permanent TP53 correction (e.g. circular ADAR-recruiting RNAs for nonsense mutations).", caveat: "Delivery across tumour vasculature, editing efficiency and off-target mutagenesis remain barriers." },
];

export interface StrategyRecommendation {
  primary: CargoType;
  rationale: string;
  alternatives: CargoType[];
}

/** Applies the paper's cargo-stratification rules to a TP53 alteration. */
export function recommendStrategy(variant: Variant): StrategyRecommendation {
  if (variant.id === "null") {
    return {
      primary: "mRNA",
      rationale: "TP53-null: no dominant-negative protein is expressed, so wild-type p53 mRNA restoration is indicated.",
      alternatives: ["miRNA", "CRISPR"],
    };
  }
  if (variant.gofRisk >= 0.6) {
    return {
      primary: "siRNA",
      rationale: `${variant.aa} is a gain-of-function missense mutant — mutant-p53 siRNA is indicated; use the dual siRNA + mRNA LNP if wild-type, null and mutant clones coexist.`,
      alternatives: ["dual", "miRNA", "CRISPR"],
    };
  }
  return {
    primary: "mRNA",
    rationale: `${variant.aa} is loss-of-function dominant — wild-type p53 mRNA restoration is indicated.`,
    alternatives: ["dual", "miRNA", "CRISPR"],
  };
}

/* -------------------------------------------------------------------------- */
/* Table 1 — platform checks                                                  */
/* -------------------------------------------------------------------------- */

const CARGO_TAGS: Record<CargoType, string[]> = {
  mRNA: ["mRNA"],
  siRNA: ["siRNA"],
  dual: ["mRNA", "siRNA"],
  miRNA: ["miRNA"],
  CRISPR: ["CRISPR"],
};

export function cargoCompatible(cargo: CargoType, platformId: string): boolean {
  const platform = PLATFORMS.find((p) => p.id === platformId);
  if (!platform) return true;
  return CARGO_TAGS[cargo].every((t) => platform.cargos.includes(t));
}

export interface RangeCheck {
  label: string;
  value: number;
  range: [number, number];
  unit: string;
  inRange: boolean;
}

export function table1Checks(platformId: string, size: number, encap: number): RangeCheck[] {
  const p = PLATFORMS.find((x) => x.id === platformId)!;
  return [
    { label: "Size", value: size, range: p.size, unit: "nm", inRange: size >= p.size[0] && size <= p.size[1] },
    { label: "Encapsulation", value: encap, range: p.encap, unit: "%", inRange: encap >= p.encap[0] && encap <= p.encap[1] },
  ];
}

/* -------------------------------------------------------------------------- */
/* Table 2 — active targeting                                                 */
/* -------------------------------------------------------------------------- */

export interface TargetingResult {
  ligand: LigandSpec | null;
  recommended: LigandSpec | null;
  matchesCancer: boolean;
  evidence: string;
  passiveDose: number;
  modelledDose: number;
  foldGain: number;
}

/**
 * Passive EPR delivers a median 0.7 % of the injected dose (Wilhelm 2016, cited in the paper).
 * The ligand gain is an ILLUSTRATIVE saturating model — the paper gives no fold-gain figures.
 */
export function targetingFor(cancerId: string, ligandId: string, ligandPct: number): TargetingResult {
  const cancer = CANCERS.find((c) => c.id === cancerId) ?? CANCERS[0]!;
  const recommended = LIGANDS.find((l) => l.id === cancer.ligandId) ?? null;
  const ligand = ligandId === "auto" ? recommended : ligandId === "none" ? null : (LIGANDS.find((l) => l.id === ligandId) ?? null);
  const matchesCancer = !!ligand && ligand.cancers.includes(cancer.id);
  const density = 1 - Math.exp(-ligandPct / 0.8);
  const foldGain = ligand ? 1 + (matchesCancer ? 2.4 : 0.35) * density : 1;
  return {
    ligand,
    recommended,
    matchesCancer,
    evidence: cancer.evidence,
    passiveDose: PAPER.epr,
    modelledDose: PAPER.epr * foldGain,
    foldGain,
  };
}

/* -------------------------------------------------------------------------- */
/* SORT & biodistribution (liver-dominant baseline)                           */
/* -------------------------------------------------------------------------- */

export interface Biodistribution {
  liver: number;
  spleen: number;
  lung: number;
  tumour: number;
  other: number;
}

/**
 * Qualitative model: the paper states standard ionizable LNPs are liver-dominant, and that SORT charged lipids
 * increase spleen / lung uptake while compromising endosomal escape. Absolute percentages are illustrative.
 */
export function biodistribution(sortPct: number, tumourDose: number): Biodistribution {
  const spleenShift = 0.32 * sortPct;
  const lungShift = 0.26 * sortPct;
  const liver = clamp(66 - spleenShift - lungShift, 10, 80);
  const spleen = 10 + spleenShift;
  const lung = 4 + lungShift;
  const tumour = tumourDose;
  const other = Math.max(0, 100 - liver - spleen - lung - tumour);
  return { liver, spleen, lung, tumour, other };
}

export function sortEscapePenalty(sortPct: number, pKa: number, pegPct: number): number {
  if (sortPct <= 0) return 0;
  const needsReopt = (pKa < PAPER.pKaWindow[0] || pKa > PAPER.pKaWindow[1] ? 0.25 : 0) + (pegPct > 2.5 ? 0.1 : 0);
  return (0.45 + needsReopt) * sortPct;
}

/* -------------------------------------------------------------------------- */
/* Anti-PEG immunogenicity                                                    */
/* -------------------------------------------------------------------------- */

export const CORONAS = [
  { id: "peg", label: "PEG-lipid corona", factor: 1, note: "Standard hydrophilic corona; reduces opsonisation, prolongs circulation." },
  { id: "alt", label: "Alternative polymer corona", factor: 0.55, note: "Non-PEG polymer corona to avoid anti-PEG antibodies." },
  { id: "bio", label: "Biomimetic cell-membrane coat", factor: 0.35, note: "RBC / platelet / leukocyte membrane coating improves biocompatibility and circulation." },
] as const;

export interface PegRisk {
  score: number;
  level: "low" | "moderate" | "high";
  notes: string[];
}

/** Accelerated-blood-clearance (ABC) risk heuristic: rises with PEG dose and repeat dosing; lowered by alternative coronas. */
export function pegRisk(pegPct: number, coronaId: string, repeat: boolean): PegRisk {
  const corona = CORONAS.find((c) => c.id === coronaId) ?? CORONAS[0];
  const dose = 12 + 11 * pegPct;
  const raw = dose * (repeat ? 1.7 : 1) * corona.factor;
  const score = clamp(raw, 0, 100);
  const notes: string[] = [];
  if (repeat) notes.push("Repeat dosing: pre-existing or induced anti-PEG antibodies can accelerate blood clearance and raise hepatic capture.");
  if (pegPct > 2.5) notes.push("High PEG dose — optimise (reduce) PEG-lipid content.");
  notes.push("Complement activation-related pseudoallergy needs monitoring in p53 LNP development.");
  return { score, level: score < 30 ? "low" : score < 55 ? "moderate" : "high", notes };
}

/* -------------------------------------------------------------------------- */
/* Fig. 3 — stimuli-responsive release                                        */
/* -------------------------------------------------------------------------- */

export interface Series {
  name: string;
  tone: "primary" | "amber" | "rust" | "ink";
  points: [number, number][];
  dashed?: boolean;
}

const grid = (max: number, n: number) => Array.from({ length: n + 1 }, (_, i) => (max * i) / n);
const firstOrder = (k: number, rmax: number) => (t: number) => rmax * (1 - Math.exp(-k * t));

/** Fig 3A — pH-responsive p53 mRNA release at pH 5.5 / 6.5 / 7.4. */
export function releasePH(pKa = 6.5): Series[] {
  const m = 0.7 + 0.3 * bell(pKa, 6.5, 0.7);
  const t = grid(48, 96);
  return [
    { name: "pH 5.5 · endosome", tone: "primary", points: t.map((x) => [x, firstOrder(0.32 * m, 96)(x)]) },
    { name: "pH 6.5 · tumour microenvironment", tone: "amber", points: t.map((x) => [x, firstOrder(0.07 * m, 55)(x)]) },
    { name: "pH 7.4 · blood", tone: "rust", points: t.map((x) => [x, firstOrder(0.012, 14)(x)]) },
  ];
}

/** Fig 3B — three-phase siRNA release from ionizable LNPs. */
export function releaseSiRNA(): Series[] {
  const t = grid(48, 96);
  const f = (x: number) => 30 * (1 - Math.exp(-x / 0.7)) + 42 * (1 - Math.exp(-x / 5)) + 14 * (1 - Math.exp(-x / 22));
  return [{ name: "siRNA · ionizable LNP", tone: "primary", points: t.map((x) => [x, f(x)]) }];
}

/** Fig 3C — thermosensitive NLC release at 37–45 °C, trigger zone 40–42 °C. */
export function releaseThermo(): Series[] {
  const t = grid(24, 96);
  const kOf = (T: number) => 0.012 + 0.55 / (1 + Math.exp(-(T - 41) / 0.8));
  const spec: [number, Series["tone"]][] = [
    [37, "rust"],
    [40, "amber"],
    [42, "primary"],
    [45, "ink"],
  ];
  return spec.map(([T, tone]) => ({ name: `${T} °C`, tone, points: t.map((x) => [x, firstOrder(kOf(T), 98)(x)] as [number, number]) }));
}

/** Fig 3D — redox-responsive release as a function of GSH concentration (mM, log axis handled by caller). */
export function releaseGSH(): { gsh: number; release: number }[] {
  const out: { gsh: number; release: number }[] = [];
  for (let e = -3; e <= 1.4; e += 0.05) {
    const c = 10 ** e; // mM
    const r = 99 * (c ** 1.5 / (0.5 ** 1.5 + c ** 1.5));
    out.push({ gsh: c, release: r });
  }
  return out;
}

export interface ReleasePair {
  title: string;
  xLabel: string;
  series: Series[];
  note: string;
  selectivity: number; // triggered − off release at 24 h
}

/** Trigger-specific release for the designer: triggered environment vs circulation/off state. */
export function releaseFor(triggerId: string, pKa: number): ReleasePair {
  const t = grid(48, 96);
  const mk = (name: string, tone: Series["tone"], fn: (x: number) => number, dashed = false): Series => ({
    name,
    tone,
    dashed,
    points: t.map((x) => [x, fn(x)] as [number, number]),
  });
  const at24 = (s: Series) => s.points.find((p) => p[0] >= 24)?.[1] ?? 0;
  const done = (series: Series[], note: string, title: string): ReleasePair => ({
    title,
    xLabel: "time (h)",
    series,
    note,
    selectivity: at24(series[0]!) - at24(series[series.length - 1]!),
  });

  switch (triggerId) {
    case "redox": {
      const s = [
        mk("5 mM GSH · intracellular", "primary", firstOrder(0.26, 97)),
        mk("10 µM GSH · extracellular", "rust", firstOrder(0.006, 5)),
      ];
      return done(s, "Disulfide lipids stay stable in circulation and are cleaved by intracellular GSH (2–10 mM vs ~10 µM extracellular).", "Redox-responsive release (Fig. 3D)");
    }
    case "enzyme": {
      const s = [mk("+ MMP-2/9 · tumour", "primary", firstOrder(0.14, 92)), mk("no protease · blood", "rust", firstOrder(0.01, 10))];
      return done(s, "MMP-cleavable peptide substrates enable tumour-specific dePEGylation and cargo liberation.", "Enzyme-triggered release");
    }
    case "thermo": {
      const s = [mk("42 °C · hyperthermia", "primary", firstOrder(0.42, 98)), mk("37 °C · body", "rust", firstOrder(0.012, 12))];
      return done(s, "DPPC / NLC matrices release above the gel-to-liquid-crystalline transition (~41 °C); trigger zone 40–42 °C (Fig. 3C).", "Thermosensitive release");
    }
    case "ultrasound": {
      const pulse = (x: number) => (x < 12 ? 0.8 * x : 9.6 + 80 * (1 - Math.exp(-(x - 12) / 1.2)) * 0.9 + 0.1 * (x - 12));
      const s = [mk("sonication at 12 h", "primary", (x) => Math.min(95, pulse(x))), mk("no sonication", "rust", firstOrder(0.012, 12))];
      return done(s, "External ultrasound gives spatiotemporal control — on-demand release at the chosen time point.", "Ultrasound-triggered release");
    }
    case "none": {
      const s = [mk("constitutive", "amber", firstOrder(0.05, 90)), mk("blood pH 7.4 baseline", "rust", firstOrder(0.012, 14))];
      return done(s, "No trigger: release is constitutive, risking premature cargo loss in circulation.", "Constitutive release");
    }
    default: {
      const ph = releasePH(pKa);
      return done([ph[0]!, ph[1]!, ph[2]!], "Ionizable-lipid protonation in the endosome destabilises the membrane; the TME (pH 6.5–6.8) gives partial release, blood (pH 7.4) almost none (Fig. 3A).", "pH-responsive release (Fig. 3A)");
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Fig. 2 — physicochemical characterisation                                  */
/* -------------------------------------------------------------------------- */

/** Fig 2A — DLS intensity distributions (mean ≈95 / 120 / 150 nm). */
export function dlsDistributions(): Series[] {
  const sizes = Array.from({ length: 120 }, (_, i) => 20 * 1.03 ** i);
  const ln = (mean: number, sd = 0.2) => (x: number) => Math.exp(-((Math.log(x) - Math.log(mean)) ** 2) / (2 * sd * sd));
  const mk = (name: string, tone: Series["tone"], mean: number): Series => ({
    name,
    tone,
    points: sizes.filter((x) => x <= 420).map((x) => [x, 100 * ln(mean)(x)] as [number, number]),
  });
  return [mk("p53 mRNA-LNP · ~95 nm", "primary", 95), mk("p53 siRNA-LNP · ~120 nm", "amber", 120), mk("empty LNP · ~150 nm", "ink", 150)];
}

/** Fig 2B — zeta potential vs pH for an ionizable LNP (pKa 6.5). */
export function zetaVsPH(pKa = 6.5): Series[] {
  const ph = Array.from({ length: 41 }, (_, i) => 4 + i * 0.1);
  return [{ name: `ionizable LNP · pKa ${pKa}`, tone: "primary", points: ph.map((x) => [x, -4 + 34 / (1 + 10 ** (x - pKa))] as [number, number]) }];
}

/** Fig 2D — PDI distributions, all below the 0.3 acceptance threshold. */
export function pdiDistributions(): Series[] {
  const x = Array.from({ length: 61 }, (_, i) => i * 0.005);
  const g = (m: number, sd = 0.03) => (v: number) => 100 * bell(v, m, sd);
  const spec: [string, Series["tone"], number][] = [
    ["Ionizable LNP", "primary", 0.12],
    ["Liposome", "amber", 0.16],
    ["NLC", "ink", 0.2],
    ["Hybrid", "rust", 0.23],
  ];
  return spec.map(([name, tone, m]) => ({ name, tone, points: x.map((v) => [v, g(m)(v)] as [number, number]) }));
}

/* -------------------------------------------------------------------------- */
/* Fig. 4 — conceptual anticancer activity                                    */
/* -------------------------------------------------------------------------- */

/** Fig 4A — dose response in p53-null HCT116 (log µM axis). */
export function doseResponse(): Series[] {
  const d = Array.from({ length: 41 }, (_, i) => 10 ** (-2 + i * 0.1));
  const hill = (ic50: number, floor: number, n = 1.3) => (x: number) => floor + (100 - floor) / (1 + (x / ic50) ** n);
  return [
    { name: "p53 mRNA-LNP", tone: "primary", points: d.map((x) => [x, hill(0.35, 8)(x)] as [number, number]) },
    { name: "free doxorubicin", tone: "amber", points: d.map((x) => [x, hill(0.9, 12)(x)] as [number, number]) },
    { name: "empty LNP", tone: "ink", points: d.map((x) => [x, hill(80, 88)(x)] as [number, number]) },
  ];
}

/** Fig 4B — selectivity at 1 µM: viability after p53 mRNA-LNP. */
export const SELECTIVITY = [
  { label: "p53-null cancer", value: 34 },
  { label: "p53-WT cancer", value: 46 },
  { label: "HDF fibroblasts", value: 91 },
  { label: "BEAS-2B epithelium", value: 88 },
];

/** Fig 4C — HCT116 xenograft growth with p53 mRNA-LNP ± anti-PD-1. */
export function tumourGrowth(): Series[] {
  const d = Array.from({ length: 29 }, (_, i) => i);
  const g = (k: number) => (x: number) => 100 * Math.exp(k * x) ;
  return [
    { name: "control", tone: "rust", points: d.map((x) => [x, g(0.105)(x)] as [number, number]) },
    { name: "anti-PD-1", tone: "ink", points: d.map((x) => [x, g(0.085)(x)] as [number, number]) },
    { name: "p53 mRNA-LNP", tone: "amber", points: d.map((x) => [x, g(0.06)(x)] as [number, number]) },
    { name: "p53-LNP + anti-PD-1", tone: "primary", points: d.map((x) => [x, g(0.028)(x)] as [number, number]) },
  ];
}

/** Fig 4D — temporal restoration of p53, p21 and cleaved caspase-3 (p53 peaks at 24 h). */
export function p53Kinetics(): Series[] {
  const t = grid(96, 96);
  const pulse = (peak: number, wUp: number, wDown: number) => (x: number) => 100 * (x <= peak ? bell(x, peak, wUp) : bell(x, peak, wDown));
  return [
    { name: "p53 protein", tone: "primary", points: t.map((x) => [x, pulse(24, 9, 22)(x)] as [number, number]) },
    { name: "p21 (CDKN1A)", tone: "amber", points: t.map((x) => [x, 80 * pulse(36, 12, 28)(x) / 100] as [number, number]) },
    { name: "cleaved caspase-3", tone: "rust", points: t.map((x) => [x, 65 * pulse(48, 14, 30)(x) / 100] as [number, number]) },
  ];
}

/* -------------------------------------------------------------------------- */
/* Table 3 — clinical pipeline                                                */
/* -------------------------------------------------------------------------- */

export interface ClinicalRow {
  product: string;
  platformId: string;
  platform: string;
  cargo: string;
  indication: string;
  phase: string;
  company: string;
  p53: boolean;
}

export const TABLE3: ClinicalRow[] = [
  { product: "Doxil", platformId: "liposome", platform: "PEG-liposome", cargo: "Doxorubicin", indication: "Ovarian, Kaposi", phase: "Approved", company: "Multiple", p53: false },
  { product: "Onivyde", platformId: "liposome", platform: "Liposome", cargo: "Irinotecan", indication: "Pancreatic", phase: "Approved", company: "Ipsen", p53: false },
  { product: "Vyxeos", platformId: "liposome", platform: "Liposome", cargo: "Cyt/Daun", indication: "AML", phase: "Approved", company: "Jazz", p53: false },
  { product: "mRNA-4157", platformId: "ionizable", platform: "Ionizable LNP", cargo: "mRNA neoantigens", indication: "Melanoma, NSCLC", phase: "Phase III", company: "Moderna/Merck", p53: false },
  { product: "BNT122", platformId: "ionizable", platform: "Ionizable LNP", cargo: "mRNA neoantigens", indication: "Colorectal", phase: "Phase II", company: "BioNTech", p53: false },
  { product: "BNT111", platformId: "ionizable", platform: "Ionizable LNP", cargo: "mRNA (fixed)", indication: "Melanoma", phase: "Phase II", company: "BioNTech", p53: false },
  { product: "mRNA-2752", platformId: "ionizable", platform: "Ionizable LNP", cargo: "OX40L/IL-23/36", indication: "Solid tumours", phase: "Phase I", company: "Moderna", p53: false },
  { product: "p53 mRNA-LNP", platformId: "ionizable", platform: "Ionizable LNP", cargo: "p53 mRNA", indication: "HCC, NSCLC, pancreatic", phase: "Preclinical / Exploratory Phase I (no published results)", company: "Academic/Industry", p53: true },
];

export const TABLE3_NOTE =
  "mRNA-4157 and BNT122 are personalized neoantigen vaccines and do not encode p53; they are included to illustrate clinical validation of the ionizable LNP-mRNA platform in oncology, not as p53-directed therapies.";

/* -------------------------------------------------------------------------- */
/* Immuno-oncology context                                                    */
/* -------------------------------------------------------------------------- */

export interface ImmuneContext {
  headline: string;
  points: string[];
}

export function immuneContext(cargo: CargoType, antiPD1: boolean): ImmuneContext {
  const restores = cargo === "mRNA" || cargo === "dual";
  const points: string[] = [];
  points.push(
    restores
      ? "p53 mRNA restoration induces immunogenic cell death and enhances antigen presentation; with checkpoint blockade it increased CD8+ T-cell infiltration and gave durable suppression in HCC models (Xiao et al. 2022)."
      : "Direct p53 restoration is what converts immunologically cold tumours into inflamed phenotypes; this cargo reaches the p53 axis only indirectly.",
  );
  points.push(
    antiPD1
      ? "Checkpoint inhibitors relieve T-cell suppression but cannot generate de novo responses without tumour-infiltrating lymphocytes — LNP-primed T cells are what blockade then unleashes."
      : "Enable anti-PD-1 to see the combination rationale: p53 restoration can sensitise resistant tumours to checkpoint blockade.",
  );
  points.push("Platform proof-of-concept: KEYNOTE-942 Phase IIb — mRNA-4157 + pembrolizumab cut recurrence risk by 44% vs pembrolizumab alone (neoantigen vaccine; does not encode p53).");
  return { headline: antiPD1 ? "p53-LNP + checkpoint blockade" : "p53-LNP monotherapy", points };
}
