<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Paper-derived data and models live in `src/lib/lnp/paper.ts` (+ Tables 1/2 in `data.ts`); keep them faithful to the cited review and label anything not in the paper as illustrative.
- `DesignInput` defaults must stay neutral for the validation benchmark (`validation.ts` zeroes ligand/SORT), so benchmark stats do not drift.
- Non-ionizable platforms map model outputs onto their Table 1 size/encapsulation ranges (see `predict.ts`).
- Shared designer UI primitives (Chip, Slider, Card) are in `src/components/lnp/controls.tsx`; charts are dependency-free SVG in `Charts.tsx`.
- Rules from the paper are covered by `src/lib/lnp/paper.test.ts` (run with `bunx vitest run`).
