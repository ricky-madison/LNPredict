export type CargoType = "mRNA" | "siRNA" | "miRNA" | "CRISPR";

export interface IonizableLipid {
  id: string;
  name: string;
  pKa: number;
  logP: number;
  tail: string;
  tailCarbons: number;
  chargeType: string;
  smiles: string;
  origin: string;
  clinical: string;
}

/** Curated ionizable lipid library (values compiled from published LNP literature). */
export const LIPID_LIBRARY: IonizableLipid[] = [
  { id: "mc3", name: "DLin-MC3-DMA", pKa: 6.44, logP: 4.8, tail: "C18:2 x2", tailCarbons: 18, chargeType: "tertiary amine", smiles: "CCCCCC=CCC=CCCCCCCCC(=O)OCCCCN(C)C", origin: "Alnylam / Onpattro", clinical: "Approved" },
  { id: "alc0315", name: "ALC-0315", pKa: 6.09, logP: 5.1, tail: "C14 branched", tailCarbons: 14, chargeType: "tertiary amine", smiles: "CCCCCCCCC(CCCCCC)COC(=O)CCCCCCN(CCO)CCCCCC(=O)OCC(CCCCCC)CCCCCCCC", origin: "Acuitas / Comirnaty", clinical: "Approved" },
  { id: "sm102", name: "SM-102", pKa: 6.68, logP: 4.2, tail: "C10/C7 ester", tailCarbons: 17, chargeType: "tertiary amine", smiles: "CCCCCCCCC(=O)OCCCCCCN(CCO)CCCCCCCC(=O)OCCCCCCCC", origin: "Moderna / Spikevax", clinical: "Approved" },
  { id: "c12200", name: "C12-200", pKa: 6.20, logP: 3.9, tail: "C12 x5", tailCarbons: 12, chargeType: "polyamine core", smiles: "CCCCCCCCCCCCN(CCO)CCN(CCO)CCN", origin: "Anderson lab", clinical: "Preclinical" },
  { id: "kc2", name: "DLin-KC2-DMA", pKa: 6.10, logP: 4.6, tail: "C18:2 x2", tailCarbons: 18, chargeType: "tertiary amine", smiles: "CCCCCC=CCC=CCCCCCCCC1(CCN(C)C)OCCO1", origin: "Tekmira", clinical: "Phase I" },
  { id: "306oi10", name: "306Oi10", pKa: 6.55, logP: 4.4, tail: "C10 branched", tailCarbons: 10, chargeType: "amino-ester", smiles: "CCCCCCCCC(C)OC(=O)CCN(C)CCC(=O)OC(C)CCCCCCCC", origin: "Anderson lab", clinical: "Preclinical" },
  { id: "lipid5", name: "Lipid 5", pKa: 6.56, logP: 4.9, tail: "C9/C8 ester", tailCarbons: 17, chargeType: "tertiary amine", smiles: "CCCCCCCCC(=O)OCCCCCN(C)CCCCCOC(=O)CCCCCCCC", origin: "Moderna", clinical: "Preclinical" },
  { id: "cks17", name: "cKK-E12", pKa: 6.14, logP: 3.7, tail: "C12 x4", tailCarbons: 12, chargeType: "ketal amine", smiles: "CCCCCCCCCCCCOC(=O)C1CN(CCO)CCN1", origin: "Anderson lab", clinical: "Preclinical" },
  { id: "9a1p9", name: "9A1P9", pKa: 6.90, logP: 4.1, tail: "C9 ester", tailCarbons: 9, chargeType: "phenol ester amine", smiles: "CCCCCCCCCOC(=O)CN(C)Cc1ccc(O)cc1", origin: "Siegwart lab", clinical: "Preclinical" },
  { id: "bama", name: "BAMEA-O16B", pKa: 6.75, logP: 4.7, tail: "C16 disulfide", tailCarbons: 16, chargeType: "redox-cleavable amine", smiles: "CCCCCCCCCCCCCCCCSSCCN(CCO)CCSSCCCCCCCCCCCCCCCC", origin: "Dong lab", clinical: "Preclinical" },
  { id: "tt3", name: "TT3 (FTT5)", pKa: 6.35, logP: 4.3, tail: "C15 branched", tailCarbons: 15, chargeType: "thiol-ene amine", smiles: "CCCCCCCCCCCCCCCSCCN(CCS)CCSCCCCCCCCCCCCCCC", origin: "Dong lab", clinical: "Preclinical" },
  { id: "l319", name: "L319", pKa: 6.25, logP: 4.5, tail: "C18:2 ester", tailCarbons: 18, chargeType: "biodegradable ester", smiles: "CCCCCC=CCC=CCCCCCCCC(=O)OCC(COC(=O)C)N(C)C", origin: "Alnylam", clinical: "Preclinical" },
  { id: "306o", name: "OF-Deg-Lin", pKa: 5.80, logP: 4.0, tail: "C18:2 oxidized", tailCarbons: 18, chargeType: "degradable amine", smiles: "CCCCCC=CCC=CCCCCCCCC(=O)OCCN1CCOCC1", origin: "Whitehead lab", clinical: "Preclinical" },
  { id: "ss33", name: "SS-33/4PE-15", pKa: 7.15, logP: 5.3, tail: "C15 disulfide", tailCarbons: 15, chargeType: "SS-cleavable", smiles: "CCCCCCCCCCCCCCCSSCCN1CCCC1", origin: "Harashima lab", clinical: "Preclinical" },
  { id: "a18", name: "A18-Iso5-2DC18", pKa: 6.60, logP: 5.0, tail: "C18 x2", tailCarbons: 18, chargeType: "adjuvant amine", smiles: "CCCCCCCCCCCCCCCCCCN(CCCCCCCCCCCCCCCCCC)CCC(=O)N", origin: "Xu lab", clinical: "Preclinical" },
];

export interface HelperLipid {
  id: string;
  name: string;
  note: string;
  phaseBonus: number;
}

export const HELPER_LIPIDS: HelperLipid[] = [
  { id: "dspc", name: "DSPC", note: "saturated C18 · lamellar stabiliser", phaseBonus: 0 },
  { id: "dope", name: "DOPE", note: "cone-shaped · hexagonal HII promoter", phaseBonus: 8 },
  { id: "popc", name: "POPC", note: "mono-unsaturated · fluid bilayer", phaseBonus: 3 },
];

export interface Variant {
  id: string;
  aa: string;
  klass: string;
  mechanism: string;
  /** preferred restoration strategy weighting */
  gofRisk: number;
}

export const TP53_VARIANTS: Variant[] = [
  { id: "R175H", aa: "p.Arg175His", klass: "Structural", mechanism: "Core domain misfolding; dominant-negative + GOF", gofRisk: 0.9 },
  { id: "R248Q", aa: "p.Arg248Gln", klass: "DNA contact", mechanism: "Loss of minor-groove contact; strong GOF", gofRisk: 0.85 },
  { id: "R273H", aa: "p.Arg273His", klass: "DNA contact", mechanism: "Loss of major-groove contact; dominant-negative", gofRisk: 0.75 },
  { id: "Y220C", aa: "p.Tyr220Cys", klass: "Thermal", mechanism: "Surface cavity; destabilised, druggable pocket", gofRisk: 0.4 },
  { id: "G245S", aa: "p.Gly245Ser", klass: "Structural", mechanism: "L3 loop distortion; Zn coordination loss", gofRisk: 0.7 },
  { id: "R249S", aa: "p.Arg249Ser", klass: "Structural", mechanism: "Aflatoxin hotspot; L3 destabilisation", gofRisk: 0.8 },
  { id: "R282W", aa: "p.Arg282Trp", klass: "Structural", mechanism: "H2 helix disruption; partial DNA binding loss", gofRisk: 0.65 },
  { id: "null", aa: "TP53-null", klass: "Null", mechanism: "Complete loss of expression", gofRisk: 0.1 },
];

export interface TargetingEntry {
  cancer: string;
  ligand: string;
  receptor: string;
  rationale: string;
  status: string;
  affinity: string;
}

/** Targeting decision table (paper Table 2). */
export const TARGETING_TABLE: TargetingEntry[] = [
  { cancer: "Ovarian", ligand: "Folate", receptor: "FR-α", rationale: "FR-α overexpressed in 80% of epithelial ovarian tumours", status: "Phase II", affinity: "0.8 nM" },
  { cancer: "Breast (TNBC)", ligand: "Transferrin", receptor: "TfR / CD71", rationale: "TfR upregulated with high proliferative iron demand", status: "Phase I", affinity: "4 nM" },
  { cancer: "Pancreatic", ligand: "cRGD peptide", receptor: "αvβ3 integrin", rationale: "Integrin-rich desmoplastic stroma and neovasculature", status: "Preclinical", affinity: "12 nM" },
  { cancer: "NSCLC", ligand: "Anti-EGFR Fab", receptor: "EGFR", rationale: "EGFR amplification frequent in TP53-mutant NSCLC", status: "Phase I", affinity: "2 nM" },
  { cancer: "Colorectal", ligand: "Anti-EpCAM scFv", receptor: "EpCAM", rationale: "EpCAM homogeneously expressed in colorectal adenocarcinoma", status: "Preclinical", affinity: "6 nM" },
  { cancer: "Hepatocellular", ligand: "GalNAc", receptor: "ASGPR", rationale: "Hepatocyte-restricted ASGPR gives first-pass liver tropism", status: "Approved (siRNA)", affinity: "0.4 nM" },
  { cancer: "Glioblastoma", ligand: "Angiopep-2", receptor: "LRP-1", rationale: "LRP-1 mediated transcytosis across the blood-brain barrier", status: "Phase II", affinity: "18 nM" },
  { cancer: "Prostate", ligand: "PSMA aptamer", receptor: "PSMA", rationale: "PSMA highly restricted to prostate epithelium", status: "Phase I", affinity: "9 nM" },
  { cancer: "Head & neck", ligand: "Hyaluronic acid", receptor: "CD44", rationale: "CD44-high cancer stem-like compartment", status: "Preclinical", affinity: "30 nM" },
];

export interface CargoSpec {
  id: CargoType;
  label: string;
  nucleotides: number;
  charge: number;
  note: string;
}

export const CARGOS: CargoSpec[] = [
  { id: "mRNA", label: "p53 mRNA", nucleotides: 1750, charge: -1750, note: "full-length TP53 CDS + UTRs, N1-Me-pseudo-U" },
  { id: "siRNA", label: "mutp53 siRNA", nucleotides: 21, charge: -42, note: "allele-selective knockdown duplex" },
  { id: "miRNA", label: "miR-34a mimic", nucleotides: 23, charge: -46, note: "p53 pathway effector mimic" },
  { id: "CRISPR", label: "CRISPR base editor", nucleotides: 5200, charge: -5200, note: "ABE mRNA + sgRNA co-formulation" },
];

export const RELEASE_TRIGGERS = [
  { id: "ph", label: "pH (endosomal)", boost: 6, note: "protonation-driven, tumour acidosis synergy" },
  { id: "redox", label: "Redox (GSH)", boost: 9, note: "disulfide cleavage in high-GSH cytosol" },
  { id: "enzyme", label: "Enzyme (MMP-2)", boost: 5, note: "stroma protease-cleavable PEG shed" },
  { id: "none", label: "None", boost: 0, note: "constitutive release" },
] as const;

export const PLATFORMS = [
  { id: "ionizable", label: "Ionizable LNP", sizeBias: 0, encapBias: 0 },
  { id: "liposome", label: "Liposome", sizeBias: 28, encapBias: -12 },
  { id: "sln", label: "Solid lipid NP", sizeBias: 18, encapBias: -7 },
  { id: "nlc", label: "NLC", sizeBias: 12, encapBias: -4 },
  { id: "hybrid", label: "Lipid-polymer hybrid", sizeBias: 8, encapBias: 2 },
] as const;
