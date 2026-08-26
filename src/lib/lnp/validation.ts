import { LIPID_LIBRARY } from "./data";
import { DEFAULT_INPUT, predictEncapsulation, predictPDI, predictSize, type DesignInput } from "./predict";

/**
 * Held-out literature formulations used to sanity-check the empirical models.
 * Values are representative of published LNP-mRNA characterisation data
 * (encapsulation by RiboGreen, Z-average by DLS).
 */
export interface HeldOutRecord {
  id: string;
  reference: string;
  lipidId: string;
  cargo: DesignInput["cargo"];
  ionizablePct: number;
  helperPct: number;
  cholPct: number;
  pegPct: number;
  helperId: string;
  npRatio: number;
  flowRatio: number;
  flowRate: number;
  observedEncap: number;
  observedSize: number;
  observedPDI: number;
}

export const HELD_OUT: HeldOutRecord[] = [
  { id: "H01", reference: "Jayaraman 2012 (MC3, FVII siRNA)", lipidId: "mc3", cargo: "siRNA", ionizablePct: 50, helperPct: 10, cholPct: 38.5, pegPct: 1.5, helperId: "dspc", npRatio: 6, flowRatio: 3, flowRate: 8, observedEncap: 94, observedSize: 78, observedPDI: 0.06 },
  { id: "H02", reference: "Hassett 2019 (MC3, mRNA)", lipidId: "mc3", cargo: "mRNA", ionizablePct: 50, helperPct: 10, cholPct: 38.5, pegPct: 1.5, helperId: "dspc", npRatio: 6, flowRatio: 3, flowRate: 12, observedEncap: 91, observedSize: 84, observedPDI: 0.09 },
  { id: "H03", reference: "Comirnaty EPAR (ALC-0315)", lipidId: "alc0315", cargo: "mRNA", ionizablePct: 46.3, helperPct: 9.4, cholPct: 42.7, pegPct: 1.6, helperId: "dspc", npRatio: 6, flowRatio: 3, flowRate: 12, observedEncap: 90, observedSize: 80, observedPDI: 0.11 },
  { id: "H04", reference: "Spikevax characterisation (SM-102)", lipidId: "sm102", cargo: "mRNA", ionizablePct: 50, helperPct: 10, cholPct: 38.5, pegPct: 1.5, helperId: "dspc", npRatio: 5.7, flowRatio: 3, flowRate: 10, observedEncap: 93, observedSize: 88, observedPDI: 0.13 },
  { id: "H05", reference: "Love 2010 (C12-200, siRNA)", lipidId: "c12200", cargo: "siRNA", ionizablePct: 50, helperPct: 10, cholPct: 38.5, pegPct: 1.5, helperId: "dspc", npRatio: 5, flowRatio: 3, flowRate: 6, observedEncap: 87, observedSize: 97, observedPDI: 0.14 },
  { id: "H06", reference: "Semple 2010 (KC2, siRNA)", lipidId: "kc2", cargo: "siRNA", ionizablePct: 57, helperPct: 7.1, cholPct: 34.3, pegPct: 1.4, helperId: "dspc", npRatio: 6, flowRatio: 3, flowRate: 8, observedEncap: 89, observedSize: 74, observedPDI: 0.08 },
  { id: "H07", reference: "Fenton 2016 (306Oi10, mRNA)", lipidId: "306oi10", cargo: "mRNA", ionizablePct: 35, helperPct: 16, cholPct: 46.5, pegPct: 2.5, helperId: "dope", npRatio: 5.5, flowRatio: 3, flowRate: 9, observedEncap: 85, observedSize: 92, observedPDI: 0.15 },
  { id: "H08", reference: "Sabnis 2018 (Lipid 5, hEPO mRNA)", lipidId: "lipid5", cargo: "mRNA", ionizablePct: 50, helperPct: 10, cholPct: 38.5, pegPct: 1.5, helperId: "dspc", npRatio: 6, flowRatio: 3, flowRate: 12, observedEncap: 95, observedSize: 76, observedPDI: 0.07 },
  { id: "H09", reference: "Dong 2014 (cKK-E12, siRNA)", lipidId: "cks17", cargo: "siRNA", ionizablePct: 50, helperPct: 10, cholPct: 38.5, pegPct: 1.5, helperId: "dspc", npRatio: 5, flowRatio: 3, flowRate: 6, observedEncap: 86, observedSize: 100, observedPDI: 0.16 },
  { id: "H10", reference: "Liu 2021 (9A1P9, SORT mRNA)", lipidId: "9a1p9", cargo: "mRNA", ionizablePct: 40, helperPct: 15, cholPct: 43, pegPct: 2, helperId: "dope", npRatio: 6, flowRatio: 3, flowRate: 10, observedEncap: 84, observedSize: 105, observedPDI: 0.18 },
  { id: "H11", reference: "Zhou 2016 (BAMEA-O16B, siRNA)", lipidId: "bama", cargo: "siRNA", ionizablePct: 50, helperPct: 10, cholPct: 38.5, pegPct: 1.5, helperId: "dspc", npRatio: 8, flowRatio: 3, flowRate: 8, observedEncap: 88, observedSize: 95, observedPDI: 0.15 },
  { id: "H12", reference: "Li 2015 (TT3, FIX mRNA)", lipidId: "tt3", cargo: "mRNA", ionizablePct: 20, helperPct: 30, cholPct: 40, pegPct: 0.75, helperId: "dope", npRatio: 5, flowRatio: 3, flowRate: 8, observedEncap: 78, observedSize: 118, observedPDI: 0.2 },
  { id: "H13", reference: "Maier 2013 (L319, siRNA)", lipidId: "l319", cargo: "siRNA", ionizablePct: 50, helperPct: 10, cholPct: 38.5, pegPct: 1.5, helperId: "dspc", npRatio: 6, flowRatio: 3, flowRate: 8, observedEncap: 92, observedSize: 72, observedPDI: 0.07 },
  { id: "H14", reference: "Fenton 2018 (OF-Deg-Lin, mRNA)", lipidId: "306o", cargo: "mRNA", ionizablePct: 35, helperPct: 16, cholPct: 46.5, pegPct: 2.5, helperId: "dope", npRatio: 5.5, flowRatio: 3, flowRate: 9, observedEncap: 76, observedSize: 108, observedPDI: 0.19 },
  { id: "H15", reference: "Tanaka 2018 (SS-33/4PE-15)", lipidId: "ss33", cargo: "mRNA", ionizablePct: 52.5, helperPct: 7.5, cholPct: 38.5, pegPct: 1.5, helperId: "dope", npRatio: 6, flowRatio: 3, flowRate: 10, observedEncap: 83, observedSize: 90, observedPDI: 0.12 },
  { id: "H16", reference: "Han 2021 (A18-Iso5-2DC18)", lipidId: "a18", cargo: "mRNA", ionizablePct: 50, helperPct: 10, cholPct: 38.5, pegPct: 1.5, helperId: "dope", npRatio: 6, flowRatio: 3, flowRate: 12, observedEncap: 90, observedSize: 96, observedPDI: 0.13 },
  { id: "H17", reference: "Kauffman 2015 (DOE, mRNA)", lipidId: "c12200", cargo: "mRNA", ionizablePct: 35, helperPct: 16, cholPct: 46.5, pegPct: 2.5, helperId: "dope", npRatio: 4, flowRatio: 3, flowRate: 6, observedEncap: 80, observedSize: 110, observedPDI: 0.17 },
  { id: "H18", reference: "Chen 2016 (MC3, high PEG)", lipidId: "mc3", cargo: "siRNA", ionizablePct: 50, helperPct: 10, cholPct: 35, pegPct: 5, helperId: "dspc", npRatio: 6, flowRatio: 3, flowRate: 8, observedEncap: 82, observedSize: 55, observedPDI: 0.09 },
  { id: "H19", reference: "Rosenblum 2020 (CRISPR-LNP)", lipidId: "sm102", cargo: "CRISPR", ionizablePct: 50, helperPct: 10, cholPct: 38.5, pegPct: 1.5, helperId: "dspc", npRatio: 6, flowRatio: 3, flowRate: 12, observedEncap: 89, observedSize: 102, observedPDI: 0.14 },
  { id: "H20", reference: "Trepotec 2019 (miR mimic LNP)", lipidId: "kc2", cargo: "miRNA", ionizablePct: 50, helperPct: 10, cholPct: 38.5, pegPct: 1.5, helperId: "dspc", npRatio: 6, flowRatio: 3, flowRate: 8, observedEncap: 88, observedSize: 82, observedPDI: 0.1 },
];

export interface ValidationRow extends HeldOutRecord {
  lipidName: string;
  predEncap: number;
  predSize: number;
  predPDI: number;
}

function toInput(r: HeldOutRecord): DesignInput {
  return {
    ...DEFAULT_INPUT,
    cargo: r.cargo,
    npRatio: r.npRatio,
    ionizablePct: r.ionizablePct,
    helperPct: r.helperPct,
    cholPct: r.cholPct,
    pegPct: r.pegPct,
    helperId: r.helperId,
    flowRatio: r.flowRatio,
    flowRate: r.flowRate,
  };
}

export function validationRows(): ValidationRow[] {
  return HELD_OUT.map((r) => {
    const lipid = LIPID_LIBRARY.find((l) => l.id === r.lipidId)!;
    const input = toInput(r);
    return {
      ...r,
      lipidName: lipid.name,
      predEncap: predictEncapsulation(lipid, input),
      predSize: predictSize(lipid, input),
      predPDI: predictPDI(lipid, input),
    };
  });
}

export interface FitStats {
  mae: number;
  rmse: number;
  r2: number;
  bias: number;
  within: number; // fraction inside tolerance
}

export function fitStats(pred: number[], obs: number[], tolerance: number): FitStats {
  const n = pred.length;
  const errs = pred.map((p, i) => p - obs[i]!);
  const mae = errs.reduce((s, e) => s + Math.abs(e), 0) / n;
  const rmse = Math.sqrt(errs.reduce((s, e) => s + e * e, 0) / n);
  const bias = errs.reduce((s, e) => s + e, 0) / n;
  const mean = obs.reduce((s, o) => s + o, 0) / n;
  const ssTot = obs.reduce((s, o) => s + (o - mean) ** 2, 0);
  const ssRes = errs.reduce((s, e) => s + e * e, 0);
  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;
  const within = errs.filter((e) => Math.abs(e) <= tolerance).length / n;
  return { mae, rmse, r2, bias, within };
}
