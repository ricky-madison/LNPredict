/** TP53 mRNA construct model for the cargo sequence panel. */

export interface ConstructSegment {
  id: string;
  label: string;
  length: number;
  note: string;
  tone: "utr" | "cds" | "tail" | "cap";
}

/** Therapeutic p53 mRNA construct layout (Moderna/BioNTech-style UTR design). */
export const CONSTRUCT: ConstructSegment[] = [
  { id: "cap", label: "Cap1", length: 12, note: "m7G(5')ppp(5')N1-2'-O-methyl · CleanCap AG", tone: "cap" },
  { id: "utr5", label: "5′ UTR", length: 68, note: "human α-globin (HBA1) leader · strong 43S recruitment", tone: "utr" },
  { id: "cds", label: "TP53 CDS", length: 1182, note: "393 aa · N1-methylpseudouridine, GC-optimised codons", tone: "cds" },
  { id: "utr3", label: "3′ UTR", length: 264, note: "mtRNR1 + AES tandem UTR · transcript stabilising", tone: "utr" },
  { id: "polya", label: "Poly(A)", length: 110, note: "segmented A110 with 10-nt linker", tone: "tail" },
];

export const CONSTRUCT_LENGTH = CONSTRUCT.reduce((s, x) => s + x.length, 0);

export interface Domain {
  id: string;
  label: string;
  from: number; // aa
  to: number;
  note: string;
}

/** p53 protein domain map (aa coordinates). */
export const P53_DOMAINS: Domain[] = [
  { id: "tad1", label: "TAD1", from: 1, to: 42, note: "MDM2 binding, transactivation" },
  { id: "tad2", label: "TAD2", from: 43, to: 63, note: "secondary transactivation" },
  { id: "prd", label: "PRD", from: 64, to: 92, note: "proline-rich, apoptotic signalling" },
  { id: "dbd", label: "DNA-binding domain", from: 102, to: 292, note: "sequence-specific DNA contact, Zn²⁺ site" },
  { id: "nls", label: "NLS", from: 305, to: 322, note: "nuclear localisation" },
  { id: "tet", label: "Tetramerisation", from: 323, to: 356, note: "oligomerisation, dominant-negative interface" },
  { id: "ctd", label: "CTD", from: 363, to: 393, note: "regulatory, non-specific DNA binding" },
];

export interface HotspotCodon {
  id: string;
  codonIndex: number; // aa position
  wtCodon: string;
  mutCodon: string;
  context: string; // 5 codons: -2 -1 [codon] +1 +2, wild-type
  wtAa: string;
  mutAa: string;
  cosmicRank: string;
}

/** Codon-level context of each supported hotspot in the TP53 CDS. */
export const HOTSPOT_CODONS: HotspotCodon[] = [
  { id: "R175H", codonIndex: 175, wtCodon: "CGC", mutCodon: "CAC", context: "TCC CAC CGC TTC TTG", wtAa: "Arg", mutAa: "His", cosmicRank: "#1 missense hotspot" },
  { id: "R248Q", codonIndex: 248, wtCodon: "CGG", mutCodon: "CAG", context: "ATG AAC CGG AGG CCC", wtAa: "Arg", mutAa: "Gln", cosmicRank: "#2 missense hotspot" },
  { id: "R273H", codonIndex: 273, wtCodon: "CGT", mutCodon: "CAT", context: "GTT GGG CGT GAG CGC", wtAa: "Arg", mutAa: "His", cosmicRank: "#3 missense hotspot" },
  { id: "Y220C", codonIndex: 220, wtCodon: "TAT", mutCodon: "TGT", context: "AAC TAC TAT GGG TCT", wtAa: "Tyr", mutAa: "Cys", cosmicRank: "druggable cavity mutant" },
  { id: "G245S", codonIndex: 245, wtCodon: "GGC", mutCodon: "AGC", context: "TGT ATG GGC AAC AGC", wtAa: "Gly", mutAa: "Ser", cosmicRank: "L3 loop hotspot" },
  { id: "R249S", codonIndex: 249, wtCodon: "AGG", mutCodon: "AGT", context: "AAC CGG AGG CCC ATC", wtAa: "Arg", mutAa: "Ser", cosmicRank: "aflatoxin signature" },
  { id: "R282W", codonIndex: 282, wtCodon: "CGG", mutCodon: "TGG", context: "GAA CGG CGG ACA GCA", wtAa: "Arg", mutAa: "Trp", cosmicRank: "H2 helix hotspot" },
];

export function hotspotFor(variantId: string) {
  return HOTSPOT_CODONS.find((h) => h.id === variantId);
}

/**
 * Deterministic pseudo-sequence used only for GC-content and folding-energy
 * illustration of the synthetic construct (real CDS shown at codon level).
 */
export function syntheticSegment(seed: number, length: number): string {
  const bases = "ACGU";
  let s = seed || 1;
  let out = "";
  for (let i = 0; i < length; i++) {
    s = (s * 1103515245 + 12345) % 2147483648;
    // GC-enriched, as in codon-optimised therapeutic mRNA
    const r = (s / 2147483648) * 100;
    out += r < 27 ? bases[1]! : r < 55 ? bases[2]! : r < 78 ? bases[0]! : bases[3]!;
  }
  return out;
}

export function gcContent(seq: string) {
  const gc = [...seq].filter((c) => c === "G" || c === "C").length;
  return (gc / seq.length) * 100;
}

/** Crude Turner-style ΔG proxy: −0.45 kcal/mol per GC, −0.25 per AU stack. */
export function foldingEnergy(seq: string) {
  let dg = 0;
  for (let i = 0; i < seq.length - 1; i++) {
    const pair = seq.slice(i, i + 2);
    dg -= /[GC]{2}/.test(pair) ? 0.45 : /[GC]/.test(pair) ? 0.32 : 0.18;
  }
  return dg;
}
