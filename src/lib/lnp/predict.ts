import {
  CARGOS,
  HELPER_LIPIDS,
  LIPID_LIBRARY,
  PLATFORMS,
  RELEASE_TRIGGERS,
  TARGETING_TABLE,
  TP53_VARIANTS,
  type CargoType,
  type IonizableLipid,
  type TargetingEntry,
} from "./data";

export interface DesignInput {
  variantId: string;
  cancer: string;
  cargo: CargoType;
  npRatio: number;
  ionizablePct: number;
  helperPct: number;
  cholPct: number;
  pegPct: number;
  helperId: string;
  flowRatio: number; // aqueous:organic
  flowRate: number; // mL/min
  platformId: string;
  triggerId: string;
}

export const DEFAULT_INPUT: DesignInput = {
  variantId: "R175H",
  cancer: "Ovarian",
  cargo: "mRNA",
  npRatio: 6,
  ionizablePct: 50,
  helperPct: 10,
  cholPct: 38.5,
  pegPct: 1.5,
  helperId: "dspc",
  flowRatio: 3,
  flowRate: 8,
  platformId: "ionizable",
  triggerId: "ph",
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
/** Gaussian window centred on `mu`. */
const bell = (x: number, mu: number, sigma: number) => Math.exp(-((x - mu) ** 2) / (2 * sigma * sigma));

/**
 * Encapsulation efficiency (%) — empirical regression over published
 * LNP–mRNA datasets: pKa window, N/P titration, cargo length, PEG shielding.
 */
export function predictEncapsulation(lipid: IonizableLipid, input: DesignInput): number {
  const cargo = CARGOS.find((c) => c.id === input.cargo)!;
  const platform = PLATFORMS.find((p) => p.id === input.platformId)!;

  const pKaTerm = 46 * bell(lipid.pKa, 6.45, 0.42);
  const npTerm = 30 * bell(input.npRatio, 6.2, 2.6);
  const lenTerm = 9 * Math.tanh(Math.log10(cargo.nucleotides) / 2.4);
  const pegTerm = 6 * bell(input.pegPct, 1.6, 1.1);
  const ionTerm = 8 * bell(input.ionizablePct, 49, 12);
  const lipoTerm = 4 * bell(lipid.logP, 4.7, 1.2);

  const raw = 22 + pKaTerm + npTerm + lenTerm + pegTerm + ionTerm + lipoTerm + platform.encapBias;
  return clamp(raw, 35, 97);
}

/** Z-average hydrodynamic diameter (nm) from composition + microfluidic conditions. */
export function predictSize(lipid: IonizableLipid, input: DesignInput): number {
  const platform = PLATFORMS.find((p) => p.id === input.platformId)!;
  const base = 148;
  const peg = -26 * Math.log1p(input.pegPct * 2.2);
  const flow = -13 * Math.log1p(input.flowRatio);
  const rate = -1.6 * Math.log1p(input.flowRate);
  const chol = 0.32 * (input.cholPct - 38.5);
  const tail = 0.9 * (lipid.tailCarbons - 14);
  const np = -1.4 * (input.npRatio - 6);
  return clamp(base + peg + flow + rate + chol + tail + np + platform.sizeBias, 42, 210);
}

/** Polydispersity index from process consistency. */
export function predictPDI(lipid: IonizableLipid, input: DesignInput): number {
  const base = 0.32;
  const flow = -0.055 * Math.log1p(input.flowRatio * 2);
  const rate = -0.012 * Math.log1p(input.flowRate);
  const peg = -0.05 * bell(input.pegPct, 1.6, 1.3);
  const pKa = -0.06 * bell(lipid.pKa, 6.45, 0.5);
  const compo = 0.0016 * Math.abs(input.ionizablePct - 49);
  return clamp(base + flow + rate + peg + pKa + compo, 0.04, 0.42);
}

/** pKa-dependent membrane-disruption model for endosomal escape (%). */
export function predictEscape(lipid: IonizableLipid, input: DesignInput): number {
  const helper = HELPER_LIPIDS.find((h) => h.id === input.helperId)!;
  const trigger = RELEASE_TRIGGERS.find((t) => t.id === input.triggerId)!;
  const pKaTerm = 62 * bell(lipid.pKa, 6.4, 0.38);
  const cholTerm = 10 * bell(input.cholPct, 38.5, 9);
  const pegPenalty = -5 * Math.max(0, input.pegPct - 2.5);
  const unsat = lipid.tail.includes(":2") ? 6 : 0;
  return clamp(14 + pKaTerm + cholTerm + pegPenalty + unsat + helper.phaseBonus + trigger.boost, 8, 96);
}

/** Composite in-vitro delivery score. */
export function deliveryScore(encap: number, escape: number, size: number, pdi: number): number {
  const sizeFit = 100 * bell(size, 80, 32);
  const pdiFit = 100 * clamp(1 - pdi / 0.35, 0, 1);
  return clamp(0.32 * encap + 0.34 * escape + 0.2 * sizeFit + 0.14 * pdiFit, 0, 100);
}

export interface LipidPrediction {
  lipid: IonizableLipid;
  encapsulation: number;
  size: number;
  pdi: number;
  escape: number;
  score: number;
}

export function rankLipids(input: DesignInput): LipidPrediction[] {
  return LIPID_LIBRARY.map((lipid) => {
    const encapsulation = predictEncapsulation(lipid, input);
    const size = predictSize(lipid, input);
    const pdi = predictPDI(lipid, input);
    const escape = predictEscape(lipid, input);
    return { lipid, encapsulation, size, pdi, escape, score: deliveryScore(encapsulation, escape, size, pdi) };
  }).sort((a, b) => b.score - a.score);
}

export function matchTargeting(cancer: string): TargetingEntry {
  return TARGETING_TABLE.find((t) => t.cancer === cancer) ?? TARGETING_TABLE[0]!;
}

export interface DesignResult {
  input: DesignInput;
  ranked: LipidPrediction[];
  lead: LipidPrediction;
  alternates: LipidPrediction[];
  targeting: TargetingEntry;
  variantNote: string;
  cargoNote: string;
  confidence: number;
}

export function runDesign(input: DesignInput, pinnedLipidId?: string): DesignResult {
  const ranked = rankLipids(input);
  const lead = (pinnedLipidId && ranked.find((r) => r.lipid.id === pinnedLipidId)) || ranked[0]!;
  const alternates = ranked.filter((r) => r.lipid.id !== lead.lipid.id).slice(0, 3);
  const variant = TP53_VARIANTS.find((v) => v.id === input.variantId)!;
  const cargo = CARGOS.find((c) => c.id === input.cargo)!;
  const total = input.ionizablePct + input.helperPct + input.cholPct + input.pegPct;
  const confidence = clamp(96 - Math.abs(100 - total) * 1.6 - (lead.pdi > 0.2 ? 8 : 0), 40, 96);

  const strategy =
    variant.gofRisk > 0.6
      ? "high gain-of-function risk — co-deliver mutp53 knockdown with wild-type restoration"
      : "restoration-dominant strategy sufficient; knockdown optional";

  return {
    input,
    ranked,
    lead,
    alternates,
    targeting: matchTargeting(input.cancer),
    variantNote: `${variant.aa} · ${variant.klass} · ${variant.mechanism}. Recommendation: ${strategy}.`,
    cargoNote: `${cargo.label} · ${cargo.nucleotides} nt · ${cargo.note}`,
    confidence,
  };
}

export function buildReport(result: DesignResult) {
  const { input, lead, alternates, targeting } = result;
  return {
    generated: new Date().toISOString(),
    mutation: input.variantId,
    cancerType: input.cancer,
    cargo: input.cargo,
    platform: PLATFORMS.find((p) => p.id === input.platformId)?.label,
    releaseTrigger: RELEASE_TRIGGERS.find((t) => t.id === input.triggerId)?.label,
    formulation: {
      ionizableLipid: lead.lipid.name,
      pKa: lead.lipid.pKa,
      smiles: lead.lipid.smiles,
      helperLipid: HELPER_LIPIDS.find((h) => h.id === input.helperId)?.name,
      molarRatio: `${input.ionizablePct}:${input.helperPct}:${input.cholPct}:${input.pegPct}`,
      npRatio: input.npRatio,
      microfluidics: `${input.flowRatio}:1 aqueous:organic at ${input.flowRate} mL/min`,
    },
    predicted: {
      encapsulationPct: +lead.encapsulation.toFixed(1),
      sizeNm: +lead.size.toFixed(1),
      pdi: +lead.pdi.toFixed(3),
      endosomalEscapePct: +lead.escape.toFixed(1),
      deliveryScore: +lead.score.toFixed(1),
      modelConfidencePct: +result.confidence.toFixed(1),
    },
    targeting,
    alternates: alternates.map((a) => ({
      name: a.lipid.name,
      pKa: a.lipid.pKa,
      encapsulationPct: +a.encapsulation.toFixed(1),
      deliveryScore: +a.score.toFixed(1),
    })),
    disclaimer: "In silico prediction from empirical literature models. Validate in vitro before use.",
  };
}
