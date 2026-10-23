import { describe, expect, it } from "vitest";

import { PLATFORMS, TP53_VARIANTS } from "./data";
import { DEFAULT_INPUT, runDesign } from "./predict";
import { PAPER, cargoCompatible, pegRisk, recommendStrategy, targetingFor } from "./paper";

const variant = (id: string) => TP53_VARIANTS.find((v) => v.id === id)!;

describe("paper rules", () => {
  it("recommends p53 mRNA for TP53-null", () => {
    expect(recommendStrategy(variant("null")).primary).toBe("mRNA");
  });

  it("recommends mutant-p53 siRNA for gain-of-function missense R175H", () => {
    expect(recommendStrategy(variant("R175H")).primary).toBe("siRNA");
  });

  it("uses the 0.7% median passive EPR dose as the baseline", () => {
    expect(PAPER.epr).toBe(0.7);
    expect(targetingFor("Ovarian", "none", 0).modelledDose).toBe(0.7);
  });

  it("gives a matching Table 2 ligand more tumour dose than passive delivery", () => {
    expect(targetingFor("Breast", "auto", 2).modelledDose).toBeGreaterThan(0.7);
    expect(targetingFor("Breast", "auto", 2).ligand?.id).toBe("her2");
  });

  it("has no Table 2 ligand for hepatocellular carcinoma", () => {
    expect(targetingFor("Hepatocellular", "auto", 1).ligand).toBeNull();
  });

  it("lists mRNA but not CRISPR for ionizable LNPs, and CRISPR for hybrids", () => {
    expect(cargoCompatible("mRNA", "ionizable")).toBe(true);
    expect(cargoCompatible("CRISPR", "ionizable")).toBe(false);
    expect(cargoCompatible("CRISPR", "hybrid")).toBe(true);
  });

  it("raises anti-PEG clearance risk with repeat dosing and lowers it with a biomimetic coat", () => {
    const single = pegRisk(1.5, "peg", false).score;
    expect(pegRisk(1.5, "peg", true).score).toBeGreaterThan(single);
    expect(pegRisk(1.5, "bio", true).score).toBeLessThan(pegRisk(1.5, "peg", true).score);
  });

  it("keeps predicted size and encapsulation inside Table 1 for every platform", () => {
    for (const p of PLATFORMS) {
      const r = runDesign({ ...DEFAULT_INPUT, platformId: p.id });
      for (const c of r.checks) expect(c.inRange, `${p.id} ${c.label}`).toBe(true);
    }
  });

  it("lowers endosomal escape when SORT charged lipid is added", () => {
    const base = runDesign(DEFAULT_INPUT, "mc3").lead.escape;
    expect(runDesign({ ...DEFAULT_INPUT, sortPct: 20 }, "mc3").lead.escape).toBeLessThan(base);
  });
});
