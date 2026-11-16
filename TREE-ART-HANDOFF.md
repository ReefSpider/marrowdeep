# Tree art handoff

Branch: `codex/tree-art-handoff`. Based on `80d3d96` from
`codex/environment-detail`, retaining its environment work and v44.1 compatibility.

## Preview

From the repository root run `python -m http.server 8000`, then open:

- http://localhost:8000/tools/tree-review.html — complete workshop.
- http://localhost:8000/tools/tree-review.html?view=attributes9 — 21 new attribute pictures.
- http://localhost:8000/tools/tree-review.html?view=pictures8 — 27 Brand/fork pictures.

Use the View menu for combat effects, environment studies, frames, glyphs and
tree layouts. Pictures show native size, 3× magnification and all five states.
Search attributes by name or might/finesse/fortitude. Effects support scrubbing,
facing changes and reduced motion.

## What is delivered

`arttree.js` exposes the isolated `TreeArt` renderer. The catalogue has 109 nodes:
48 illustrated interiors, 60 sigil fallbacks, and the special Paradox frame.
It also includes tree frames, Heart/Spine/links, stat glyphs, combat effect studies
and environment props from the preceding batches. The original brief is in
`tools/tree-art-brief.md`; renderer APIs and batch details are in `tools/TREE-ART.md`.

These are rendered art and review tools. The new ability mechanics and live
gameplay hooks are not implemented. The five painted images in the original
brief are not part of this delivery. Element and bridge interiors remain future
illustration work.

## Integration instructions

1. Review this branch before merging; it includes the earlier environment branch.
2. Keep `arttree.js` loaded after `artfx2.js`, as in `index.html`.
3. Render to an integer-resolution canvas with image smoothing disabled. Supply
   animation time and state from the caller; do not introduce gameplay RNG into art.
4. Use the documented `TreeArt` APIs when wiring real tree UI or combat events.
   The workshop's node placement and allocations are examples, not game rules.
5. Preserve all five state overlays and reduced-motion support. Test gameplay and
   saves separately when adding integration; the art checks do not cover campaign play.

## Reproduce validation

Install Node.js and Python, then run from the repository root:

```sh
npm install --no-save --package-lock=false playwright
npx playwright install chromium
node audit/tree-qa.cjs
node audit/tree-pictures8-qa.cjs
node audit/tree-attributes9-qa.cjs
```

Optionally set `CHROME_PATH` to an installed Chrome executable. Other
`audit/tree*-qa.cjs` files verify earlier effect and environment batches. Tests
route game files locally and use the included Three.js copy. Reports and review
screenshots are committed under `audit/tree*/`; rerunning replaces them.

Latest checks: 2,180 complete node draws, 540 Brand/fork draws, and 420 attribute
draws passed with no browser errors. Picture tests check bounds, deterministic
opaque integer pixels, unique locked silhouettes, context restoration, state
marks, and unchanged game/save data with RNG guarded. Earlier batch reports are
retained as historical evidence. No production deployment is part of this handoff.
