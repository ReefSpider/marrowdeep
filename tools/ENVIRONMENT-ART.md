# Environment detail pass

Based on v43.1 main (`79f4b57`). Preserves the existing region palettes, silhouettes and level layout.

- Stone: recessed joints, sparse cracks, edge chips and small mineral highlights.
- Earth: restrained strata and roots; snow and ash surfaces keep their original colours.
- Timber: grain, nail heads, underside shading and iron straps on lifts; crumbling platforms keep their existing shake and disappear states.
- Backgrounds: texture clipped to existing silhouettes, with regional details in fen trees, ash ruins, village frames, slum windows and fort towers.
- Gateways: recessed joints and hinge plates.

Terrain and background detail is baked during level loading. Coordinate hashes add variation without consuming game RNG. Dynamic platform detail uses the original position and state.

Validation: load/render coverage for all 28 levels, before/after comparisons of collision grids, moving platforms, spawns, decorative props and post-bake RNG state. Visual comparisons cover 13 environments. This is not a full campaign playthrough.

Implementation: `artworld.js` wraps the existing baking functions; `world.js` routes platform surfaces to the shared timber renderer. Cache versions change only for these two scripts.

Integrated with v44.1 (379a33f) after the detail pass. Preserves its new boss and unique-item scripts; level rendering was checked again on the combined build.
