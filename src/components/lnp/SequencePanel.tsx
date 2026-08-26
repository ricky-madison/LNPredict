import { useMemo } from "react";

import {
  CONSTRUCT,
  CONSTRUCT_LENGTH,
  P53_DOMAINS,
  foldingEnergy,
  gcContent,
  hotspotFor,
  syntheticSegment,
} from "@/lib/lnp/sequence";

const TONE: Record<string, string> = {
  cap: "bg-rust",
  utr: "bg-ink-soft/70",
  cds: "bg-primary",
  tail: "bg-amber/80",
};

/** TP53 mRNA cargo panel: construct map, protein domain track and hotspot codon view. */
export function SequencePanel({ variantId }: { variantId: string }) {
  const hotspot = hotspotFor(variantId);
  const cds = useMemo(() => syntheticSegment(1182, 900), []);
  const gc = gcContent(cds);
  const dg = foldingEnergy(cds);

  const codonNt = hotspot ? (hotspot.codonIndex - 1) * 3 + 1 : null;
  const contextCodons = hotspot ? hotspot.context.split(" ") : [];

  return (
    <div className="space-y-5">
      {/* construct map */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <h3 className="text-[13px] font-semibold tracking-tight">Construct map</h3>
          <span className="font-mono text-[10px] text-ink-soft">{CONSTRUCT_LENGTH} nt total</span>
        </div>
        <div className="flex h-6 rounded-md overflow-hidden ring-1 ring-line">
          {CONSTRUCT.map((s) => (
            <div
              key={s.id}
              className={`${TONE[s.tone]} relative grid place-items-center`}
              style={{ width: `${(s.length / CONSTRUCT_LENGTH) * 100}%` }}
              title={`${s.label} · ${s.length} nt · ${s.note}`}
            >
              <span className="font-mono text-[9px] text-paper/90 truncate px-1">
                {s.length / CONSTRUCT_LENGTH > 0.08 ? s.label : ""}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
          {CONSTRUCT.map((s) => (
            <div key={s.id} className="flex items-start gap-2 font-mono text-[10px] text-ink-soft">
              <span className={`mt-1 size-2 rounded-sm shrink-0 ${TONE[s.tone]}`} />
              <span>
                <b className="text-ink">{s.label}</b> · {s.length} nt — {s.note}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* domain track */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <h3 className="text-[13px] font-semibold tracking-tight">p53 protein domains (393 aa)</h3>
          <span className="font-mono text-[10px] text-ink-soft">encoded by the CDS above</span>
        </div>
        <div className="relative h-9 rounded-md bg-paper ring-1 ring-line">
          {P53_DOMAINS.map((d) => (
            <div
              key={d.id}
              title={`${d.label} · aa ${d.from}–${d.to} · ${d.note}`}
              className={`absolute top-1.5 bottom-1.5 rounded-sm grid place-items-center ${
                d.id === "dbd" ? "bg-primary" : "bg-ink-soft/50"
              }`}
              style={{ left: `${(d.from / 393) * 100}%`, width: `${((d.to - d.from) / 393) * 100}%` }}
            >
              <span className="font-mono text-[9px] text-paper truncate px-1">
                {(d.to - d.from) / 393 > 0.1 ? d.label : ""}
              </span>
            </div>
          ))}
          {hotspot ? (
            <div
              className="absolute -top-1 bottom-[-4px] w-[2px] bg-rust"
              style={{ left: `${(hotspot.codonIndex / 393) * 100}%` }}
              title={`${variantId} at aa ${hotspot.codonIndex}`}
            />
          ) : null}
        </div>
        {hotspot ? (
          <p className="mt-1.5 font-mono text-[10px] text-ink-soft">
            ▲ {variantId} at aa {hotspot.codonIndex} — inside the DNA-binding domain (aa 102–292), the mutational hotspot
            region of TP53.
          </p>
        ) : (
          <p className="mt-1.5 font-mono text-[10px] text-ink-soft">
            TP53-null: no residue-level lesion — the construct supplies full-length wild-type p53.
          </p>
        )}
      </div>

      {/* codon view */}
      {hotspot ? (
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <h3 className="text-[13px] font-semibold tracking-tight">Hotspot codon context</h3>
            <span className="font-mono text-[10px] text-ink-soft">
              CDS nt {codonNt}–{codonNt! + 2} · {hotspot.cosmicRank}
            </span>
          </div>
          <div className="rounded-lg bg-ink p-4 font-mono text-[13px] text-paper/80 overflow-x-auto">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-paper/50 w-14 shrink-0">wild-type</span>
              {contextCodons.map((c, i) => (
                <span
                  key={`wt-${i}`}
                  className={`px-2 py-1 rounded ${i === 2 ? "bg-primary text-paper font-bold" : "bg-paper/10"}`}
                >
                  {i === 2 ? hotspot.wtCodon : c}
                </span>
              ))}
              <span className="text-[10px] text-paper/50">→ {hotspot.wtAa}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] text-paper/50 w-14 shrink-0">mutant</span>
              {contextCodons.map((c, i) => (
                <span
                  key={`mt-${i}`}
                  className={`px-2 py-1 rounded ${i === 2 ? "bg-rust text-paper font-bold" : "bg-paper/10"}`}
                >
                  {i === 2 ? hotspot.mutCodon : c}
                </span>
              ))}
              <span className="text-[10px] text-paper/50">→ {hotspot.mutAa}</span>
            </div>
            <p className="mt-3 text-[10px] text-paper/50">
              The therapeutic cargo delivers the wild-type codon; an allele-selective siRNA can be tiled across the mutant
              codon for simultaneous knockdown.
            </p>
          </div>
        </div>
      ) : null}

      {/* cargo stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { k: "GC content", v: `${gc.toFixed(1)}%`, s: "codon-optimised CDS" },
          { k: "ΔG fold (proxy)", v: `${dg.toFixed(0)} kcal/mol`, s: "structured → slower ribosome load" },
          { k: "Modified base", v: "m1Ψ", s: "N1-methylpseudouridine" },
          { k: "Poly(A)", v: "A110", s: "segmented tail" },
        ].map((c) => (
          <div key={c.k} className="rounded-lg bg-paper ring-1 ring-line p-3">
            <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-ink-soft">{c.k}</p>
            <p className="mt-1 font-mono text-sm font-bold">{c.v}</p>
            <p className="font-mono text-[10px] text-ink-soft truncate">{c.s}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
