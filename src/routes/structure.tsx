import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { LipidViewer3D } from "@/components/lnp/LipidViewer3D";
import { ProteinViewer3D } from "@/components/lnp/ProteinViewer3D";
import { SequencePanel } from "@/components/lnp/SequencePanel";
import { LIPID_LIBRARY, TP53_VARIANTS } from "@/lib/lnp/data";
import { VARIANT_RESIDUE } from "@/lib/lnp/structures";

export const Route = createFileRoute("/structure")({
  head: () => ({
    meta: [
      { title: "Molecular Viewer — p53-LNP Designer Lipid & p53 Structures" },
      {
        name: "description",
        content:
          "Rotate ionizable lipids in 3D from their SMILES, inspect the p53 DNA-binding domain with the hotspot residue highlighted, and read the TP53 mRNA construct map.",
      },
      { property: "og:title", content: "Molecular Viewer — p53-LNP Designer" },
      {
        property: "og:description",
        content:
          "3D ionizable lipid structures, p53 DNA-binding domain with highlighted hotspot residues, and the TP53 mRNA cargo construct map.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Structure,
});

type Tab = "lipid" | "protein" | "sequence";

function Structure() {
  const [tab, setTab] = useState<Tab>("lipid");
  const [lipidId, setLipidId] = useState(LIPID_LIBRARY[0]!.id);
  const [variantId, setVariantId] = useState("R175H");

  const lipid = LIPID_LIBRARY.find((l) => l.id === lipidId)!;
  const variant = TP53_VARIANTS.find((v) => v.id === variantId)!;
  const residue = VARIANT_RESIDUE[variantId] ?? null;

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-line">
        <div className="flex items-center gap-3">
          <div className="size-7 grid place-items-center bg-ink text-paper font-mono text-xs font-bold rounded-md">
            p53
          </div>
          <div>
            <p className="text-[13px] font-semibold tracking-tight leading-none">
              Molecular viewer <span className="text-ink-soft/60 font-normal">/ lipid · protein · cargo</span>
            </p>
            <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-ink-soft/70 mt-1">
              3D structures · SMILES embedding · PDB 1TUP
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/validation"
            className="font-mono text-[11px] font-medium text-ink-soft ring-1 ring-line rounded-lg py-2 px-3 hover:bg-primary/5 transition-colors"
          >
            Validation
          </Link>
          <Link
            to="/"
            className="font-mono text-[11px] font-medium text-ink-soft ring-1 ring-line rounded-lg py-2 px-3 hover:bg-primary/5 transition-colors"
          >
            ← Designer
          </Link>
        </div>
      </header>

      <main className="px-5 py-5">
        <h1 className="sr-only">Molecular viewer for ionizable lipids, p53 structure and the TP53 mRNA cargo</h1>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {(
            [
              ["lipid", "Ionizable lipid 3D"],
              ["protein", "p53 structure"],
              ["sequence", "mRNA cargo"],
            ] as [Tab, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`font-mono text-[11px] px-3 py-1.5 rounded-md transition-colors ${
                tab === id ? "bg-ink text-paper" : "bg-panel ring-1 ring-line text-ink-soft hover:bg-primary/5"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "lipid" ? (
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-8 rounded-xl bg-panel ring-1 ring-black/5 p-4">
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="text-[13px] font-semibold tracking-tight">{lipid.name}</h2>
                <span className="font-mono text-[10px] text-ink-soft/60">01</span>
              </div>
              <LipidViewer3D smiles={lipid.smiles} name={lipid.name} />
              <p className="mt-3 font-mono text-[10px] text-ink-soft break-all">SMILES · {lipid.smiles}</p>
            </div>
            <div className="col-span-12 lg:col-span-4 rounded-xl bg-panel ring-1 ring-black/5 p-4">
              <h2 className="text-[13px] font-semibold tracking-tight mb-3">Lipid library</h2>
              <div className="grid grid-cols-2 gap-1.5 max-h-[240px] overflow-y-auto pr-1">
                {LIPID_LIBRARY.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setLipidId(l.id)}
                    className={`text-left font-mono text-[10px] px-2 py-1.5 rounded-md transition-colors ${
                      l.id === lipidId ? "bg-ink text-paper" : "bg-paper ring-1 ring-line text-ink-soft hover:bg-primary/5"
                    }`}
                  >
                    {l.name}
                  </button>
                ))}
              </div>
              <dl className="mt-4 space-y-2 font-mono text-[11px]">
                {[
                  ["pKa", lipid.pKa.toFixed(2)],
                  ["logP", lipid.logP.toFixed(1)],
                  ["Tail", lipid.tail],
                  ["Head group", lipid.chargeType],
                  ["Origin", lipid.origin],
                  ["Status", lipid.clinical],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 border-b border-line pb-1.5">
                    <dt className="text-ink-soft">{k}</dt>
                    <dd className="font-bold text-right">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        ) : null}

        {tab === "protein" ? (
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-8 rounded-xl bg-panel ring-1 ring-black/5 p-4">
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="text-[13px] font-semibold tracking-tight">p53 core domain · {variantId}</h2>
                <span className="font-mono text-[10px] text-ink-soft/60">01</span>
              </div>
              <ProteinViewer3D residue={residue} variantId={variantId} />
              <p className="mt-3 font-mono text-[10px] text-ink-soft text-pretty">
                Cα trace of chain A from PDB 1TUP (Cho et al., 1994). The marker sits on the mutated residue.
              </p>
            </div>
            <div className="col-span-12 lg:col-span-4 rounded-xl bg-panel ring-1 ring-black/5 p-4">
              <h2 className="text-[13px] font-semibold tracking-tight mb-3">TP53 variant</h2>
              <div className="flex flex-wrap gap-1.5">
                {TP53_VARIANTS.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVariantId(v.id)}
                    className={`font-mono text-[11px] px-2 py-1 rounded-md transition-colors ${
                      v.id === variantId ? "bg-ink text-paper" : "bg-paper ring-1 ring-line text-ink-soft hover:bg-primary/5"
                    }`}
                  >
                    {v.id}
                  </button>
                ))}
              </div>
              <div className="mt-4 rounded-lg bg-paper ring-1 ring-line p-3">
                <p className="font-mono text-[11px] font-bold">{variant.aa}</p>
                <p className="font-mono text-[10px] text-ink-soft mt-1">{variant.klass} class</p>
                <p className="text-[11px] text-ink-soft mt-2 text-pretty">{variant.mechanism}</p>
              </div>
              <div className="mt-3 rounded-lg bg-ink text-paper/80 px-3 py-2.5 font-mono text-[10px] leading-relaxed">
                <span className="text-primary block mb-1">▸ GAIN-OF-FUNCTION RISK</span>
                {(variant.gofRisk * 100).toFixed(0)}% —{" "}
                {variant.gofRisk > 0.6
                  ? "co-deliver allele-selective knockdown with wild-type restoration."
                  : "restoration-dominant cargo is sufficient."}
              </div>
            </div>
          </div>
        ) : null}

        {tab === "sequence" ? (
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 xl:col-span-9 rounded-xl bg-panel ring-1 ring-black/5 p-4">
              <SequencePanel variantId={variantId} />
            </div>
            <div className="col-span-12 xl:col-span-3 rounded-xl bg-panel ring-1 ring-black/5 p-4">
              <h2 className="text-[13px] font-semibold tracking-tight mb-3">Variant</h2>
              <div className="flex flex-wrap gap-1.5">
                {TP53_VARIANTS.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVariantId(v.id)}
                    className={`font-mono text-[11px] px-2 py-1 rounded-md transition-colors ${
                      v.id === variantId ? "bg-ink text-paper" : "bg-paper ring-1 ring-line text-ink-soft hover:bg-primary/5"
                    }`}
                  >
                    {v.id}
                  </button>
                ))}
              </div>
              <p className="mt-3 font-mono text-[10px] text-ink-soft text-pretty">
                Construct lengths and UTR choices follow approved mRNA drug design; the codon context shown is the
                published TP53 hotspot sequence.
              </p>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
