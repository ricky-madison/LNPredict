export type CargoType = "mRNA" | "siRNA" | "dual" | "miRNA" | "CRISPR";

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

/** Active-targeting ligands — paper Table 2 (ligand, receptor, cancer types, status, key limitations). */
export interface LigandSpec {
  id: string;
  strategy: string;
  ligand: string;
  target: string;
  cancers: string[];
  status: string;
  limitation: string;
}

export const LIGANDS: LigandSpec[] = [
  { id: "folate", strategy: "Folate", ligand: "Folic acid", target: "FR-α", cancers: ["Ovarian", "Breast"], status: "Platform (preclinical; clinical phases refer to general ligand use, not p53-specific products)", limitation: "Off-target accumulation in kidneys; requires high FR-α expression" },
  { id: "transferrin", strategy: "Transferrin", ligand: "Transferrin", target: "TfR", cancers: ["Glioma / GBM", "Leukemia"], status: "Platform (preclinical; clinical phases refer to general ligand use, not p53-specific products)", limitation: "Competition with endogenous transferrin; receptor saturation" },
  { id: "rgd", strategy: "RGD peptide", ligand: "cRGDfK", target: "αvβ3 integrin", cancers: ["Melanoma", "Glioma / GBM"], status: "Platform (preclinical; clinical phases refer to general ligand use, not p53-specific products)", limitation: "Lower affinity for human vs. murine integrins; off-target in bone" },
  { id: "her2", strategy: "Anti-HER2", ligand: "Trastuzumab Fab", target: "HER2", cancers: ["Breast", "Gastric"], status: "Platform (preclinical; clinical phases refer to general ligand use, not p53-specific products)", limitation: "Potential cardiotoxicity; internalization variability" },
  { id: "egfr", strategy: "Anti-EGFR", ligand: "Cetuximab Fab", target: "EGFR", cancers: ["Colorectal", "HNSCC"], status: "Platform (preclinical; clinical phases refer to general ligand use, not p53-specific products)", limitation: "Skin toxicity; mutations affecting binding" },
  { id: "as1411", strategy: "Aptamer", ligand: "AS1411", target: "Nucleolin", cancers: ["Leukemia", "Breast"], status: "Preclinical", limitation: "Nuclease degradation in vivo; rapid clearance" },
  { id: "ha", strategy: "Hyaluronic acid", ligand: "HA oligos", target: "CD44", cancers: ["Breast", "Colorectal", "Ovarian"], status: "Platform (preclinical; clinical phases refer to general ligand use, not p53-specific products)", limitation: "Rapid clearance; CD44 isoform specificity" },
];

export interface CancerSpec {
  id: string;
  /** default Table 2 ligand; "none" = no Table 2 ligand — passive EPR / route-based delivery */
  ligandId: string;
  evidence: string;
}

/** Cancer contexts named in the paper, with the targeting route the text supports for each. */
export const CANCERS: CancerSpec[] = [
  { id: "Ovarian", ligandId: "folate", evidence: "Folate/HA targeting for ovarian contexts; TP53 restoration strategies reviewed by Zhang et al. 2025." },
  { id: "Breast", ligandId: "her2", evidence: "Trastuzumab-functionalised LNPs raise internalisation in HER2+ breast cancer and were combined with p53 mRNA (Lin et al. 2025)." },
  { id: "Hepatocellular", ligandId: "none", evidence: "p53 mRNA + checkpoint blockade reprogrammed the immune microenvironment in HCC models (Xiao et al. 2022). Standard ionizable LNPs are liver-dominant, so no Table 2 ligand is needed." },
  { id: "NSCLC", ligandId: "none", evidence: "Peptide-lipid NPs (Zhang et al. 2026), inhaled macrophage-mediated delivery (Liu et al. 2026) and inhaled dual-targeted mRNA NPs (Tang et al. 2023); no Table 2 ligand." },
  { id: "Pancreatic", ligandId: "none", evidence: "Dual-targeted extracellular vesicles delivering p53 mRNA with siKRAS (Chiang et al. 2023); no Table 2 ligand." },
  { id: "Colorectal", ligandId: "egfr", evidence: "Anti-EGFR (cetuximab Fab) listed for colorectal in Table 2; p53-null HCT116 models used in Fig. 4." },
  { id: "HNSCC", ligandId: "egfr", evidence: "Anti-EGFR (cetuximab Fab) listed for HNSCC; oral cancer chemoimmunotherapy with p53 mRNA reported." },
  { id: "Glioma / GBM", ligandId: "transferrin", evidence: "Transferrin (glioma) and cRGDfK (GBM) are Table 2 options." },
  { id: "Melanoma", ligandId: "rgd", evidence: "cRGDfK / αvβ3 integrin listed for melanoma in Table 2." },
  { id: "Gastric", ligandId: "her2", evidence: "Anti-HER2 listed for gastric cancer in Table 2." },
  { id: "Leukemia", ligandId: "transferrin", evidence: "Transferrin and AS1411 aptamer (nucleolin) are Table 2 options for leukemia." },
];

export interface CargoSpec {
  id: CargoType;
  label: string;
  nucleotides: number;
  charge: number;
  note: string;
}

export const CARGOS: CargoSpec[] = [
  { id: "mRNA", label: "p53 mRNA (wild-type restoration)", nucleotides: 1750, charge: -1750, note: "full-length wild-type TP53 CDS + UTRs — for TP53-null / loss-of-function alleles" },
  { id: "siRNA", label: "mutant-p53 siRNA (GOF silencing)", nucleotides: 21, charge: -42, note: "allele-selective duplex — for gain-of-function missense mutants" },
  { id: "dual", label: "siRNA + mRNA dual cargo", nucleotides: 1771, charge: -1792, note: "silence mutant p53 and restore wild-type in one particle (coexisting clones)" },
  { id: "miRNA", label: "miR-34a mimic (downstream axis)", nucleotides: 23, charge: -46, note: "engages p53 effector pathway regardless of mutation; less direct" },
  { id: "CRISPR", label: "CRISPR-Cas9 (TP53 correction)", nucleotides: 5200, charge: -5200, note: "Cas9 + guide RNA for permanent correction; delivery and off-target hurdles" },
];

export const RELEASE_TRIGGERS = [
  { id: "ph", label: "pH (endosomal / TME)", boost: 6, note: "ionizable-lipid protonation; TME pH 6.5–6.8, endosome pH 4.5–6.0" },
  { id: "redox", label: "Redox (GSH)", boost: 9, note: "disulfide lipids cleaved by intracellular GSH (2–10 mM)" },
  { id: "enzyme", label: "Enzyme (MMP-2/9)", boost: 5, note: "MMP-cleavable peptide enables tumour-specific dePEGylation" },
  { id: "thermo", label: "Thermo (~41 °C)", boost: 4, note: "DPPC / NLC gel-to-liquid-crystalline transition above ~41 °C" },
  { id: "ultrasound", label: "Ultrasound", boost: 3, note: "external, on-demand p53 cargo liberation" },
  { id: "none", label: "None", boost: 0, note: "constitutive release" },
] as const;

/** LNP platforms — paper Table 1 (typical literature ranges). */
export interface PlatformSpec {
  id: string;
  label: string;
  sizeBias: number;
  encapBias: number;
  size: [number, number];
  loading: [number, number];
  encap: [number, number];
  cargos: string[];
  status: string;
  limitation: string;
  architecture: string;
}

export const PLATFORMS: PlatformSpec[] = [
  { id: "ionizable", label: "Ionizable LNP", sizeBias: 0, encapBias: 0, size: [50, 150], loading: [10, 20], encap: [85, 95], cargos: ["mRNA", "siRNA", "sa-mRNA"], status: "Approved", limitation: "Liver-dominant biodistribution; anti-PEG immunogenicity", architecture: "pH-responsive ionizable lipid layer around a nucleic-acid core with PEG corona; pKa 6.0–7.0 optimum" },
  { id: "liposome", label: "Liposome", sizeBias: 28, encapBias: -12, size: [80, 120], loading: [5, 10], encap: [80, 95], cargos: ["mRNA", "miRNA"], status: "Approved", limitation: "Low endosomal escape; rapid clearance if non-PEGylated", architecture: "Phospholipid bilayer (DSPC / DOPC / HSPC + cholesterol) around an aqueous core" },
  { id: "sln", label: "Solid lipid NP", sizeBias: 18, encapBias: -7, size: [100, 300], loading: [2, 8], encap: [60, 80], cargos: ["siRNA", "hydrophobic"], status: "Phase I/II", limitation: "Low drug-loading capacity; burst release", architecture: "Solid lipid matrix (triglycerides, fatty acids, waxes) with cargo dispersed in it" },
  { id: "nlc", label: "NLC", sizeBias: 12, encapBias: -4, size: [100, 250], loading: [5, 15], encap: [70, 90], cargos: ["mRNA", "siRNA"], status: "Preclinical", limitation: "Less stable than SLNs during long-term storage", architecture: "Blend of solid and liquid lipids that distorts the crystalline matrix" },
  { id: "hybrid", label: "Lipid-polymer hybrid", sizeBias: 8, encapBias: 2, size: [100, 300], loading: [8, 20], encap: [80, 90], cargos: ["pDNA", "CRISPR"], status: "Preclinical", limitation: "Complex manufacturing; scalability challenges", architecture: "PLGA core, lipid shell and PEG corona; sustained release over days to weeks" },
];
