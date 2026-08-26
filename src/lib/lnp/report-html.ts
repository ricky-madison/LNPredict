import type { DesignResult } from "./predict";
import { buildReport } from "./predict";

const esc = (s: unknown) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);

/** Print-ready formulation spec — the browser print dialog exports it as PDF. */
export function reportHtml(result: DesignResult): string {
  const r = buildReport(result);
  const f = r.formulation;
  const p = r.predicted;
  const row = (k: string, v: unknown) =>
    `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`;

  return `<!doctype html><html><head><meta charset="utf-8">
<title>p53-LNP formulation spec — ${esc(r.mutation)} / ${esc(r.cancerType)}</title>
<style>
  @page { margin: 18mm; }
  body { font: 12px/1.5 ui-sans-serif, system-ui, sans-serif; color: #1b2027; }
  h1 { font-size: 19px; margin: 0 0 2px; }
  h2 { font-size: 12px; text-transform: uppercase; letter-spacing: .14em; margin: 22px 0 6px; color: #3c6f6b; }
  .sub { font: 11px ui-monospace, monospace; color: #6b7280; margin: 0 0 4px; }
  table { border-collapse: collapse; width: 100%; font: 11.5px ui-monospace, monospace; }
  th, td { border-bottom: 1px solid #dfe3e8; padding: 5px 8px; text-align: left; vertical-align: top; }
  th { width: 38%; font-weight: 600; color: #4b5563; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 6px; }
  .kpi { border: 1px solid #dfe3e8; border-radius: 8px; padding: 8px 10px; }
  .kpi span { display: block; font: 10px ui-monospace, monospace; text-transform: uppercase; letter-spacing: .1em; color: #6b7280; }
  .kpi b { font: 700 16px ui-monospace, monospace; }
  ol { margin: 6px 0 0 16px; font: 11.5px ui-monospace, monospace; }
  .foot { margin-top: 26px; font: 10px ui-monospace, monospace; color: #6b7280; border-top: 1px solid #dfe3e8; padding-top: 8px; }
</style></head><body>
<h1>p53-LNP Designer — formulation specification</h1>
<p class="sub">Generated ${esc(r.generated)} · in silico prediction</p>

<h2>Design case</h2>
<table>
${row("TP53 variant", r.mutation)}
${row("Cancer type", r.cancerType)}
${row("Cargo", r.cargo)}
${row("Platform", r.platform)}
${row("Release trigger", r.releaseTrigger)}
</table>

<h2>Recommended formulation</h2>
<table>
${row("Ionizable lipid", `${f.ionizableLipid} (pKa ${f.pKa})`)}
${row("Helper lipid", f.helperLipid)}
${row("Molar ratio (ion:helper:chol:PEG)", f.molarRatio)}
${row("N/P ratio", f.npRatio)}
${row("Microfluidics", f.microfluidics)}
${row("SMILES", f.smiles)}
</table>

<h2>Predicted performance</h2>
<div class="grid">
  <div class="kpi"><span>Encapsulation</span><b>${p.encapsulationPct}%</b></div>
  <div class="kpi"><span>Size</span><b>${p.sizeNm} nm</b></div>
  <div class="kpi"><span>PDI</span><b>${p.pdi}</b></div>
  <div class="kpi"><span>Endosomal escape</span><b>${p.endosomalEscapePct}%</b></div>
  <div class="kpi"><span>Delivery score</span><b>${p.deliveryScore}</b></div>
  <div class="kpi"><span>Model confidence</span><b>${p.modelConfidencePct}%</b></div>
</div>

<h2>Targeting strategy</h2>
<table>
${row("Ligand", r.targeting.ligand)}
${row("Receptor", r.targeting.receptor)}
${row("Rationale", r.targeting.rationale)}
${row("Affinity", r.targeting.affinity)}
${row("Clinical status", r.targeting.status)}
</table>

<h2>Top alternate lipids</h2>
<ol>
${r.alternates
  .map((a) => `<li>${esc(a.name)} (pKa ${esc(a.pKa)}) — ${esc(a.encapsulationPct)}% encapsulation, score ${esc(a.deliveryScore)}</li>`)
  .join("")}
</ol>

<p class="foot">${esc(r.disclaimer)}</p>
</body></html>`;
}

export function printReport(result: DesignResult) {
  const w = window.open("", "_blank", "width=900,height=1000");
  if (!w) return;
  w.document.write(reportHtml(result));
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 350);
}
