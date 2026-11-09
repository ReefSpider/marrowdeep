# Gameplay art pass

Branch: `codex/gameplay-art-proof`, integrated with v41 main at `78a4e06` (including all v40 equipment).

The gameplay palette retains region colour and material shading. Pixel contours use integer scanlines and stepped strokes. Detail is concentrated in joints, faces, cloth seams, weapon fittings and small material highlights. Small creatures retain simpler readable shapes.

## Coverage

- 74 base equipment entries: 31 weapons/shields and 43 armour, helmets, gloves, boots and jewellery entries. Inventory icons and held weapons share geometry; blade and tool families have distinct profiles.
- 55 ordinary enemy renderers, with Kesh variants, concealed states and creature-specific silhouettes. The approved ghoul, hound and salt wraith are retained with stepped contours and further detail.
- 13 boss entries: new human forms and major creature bodies; existing strong rider/machinery designs retain their structure with improved mounts and details.
- Ten damage types have distinct animated pixel impacts. Weapon colour uses local inlays, glints and narrow trails. The old broad rarity strip is removed.
- Directional effect refinement: tall rising fire, unchanged cold shards, shooting branched lightning, upward water splash, falling poison drips, vertical holy beam, irregular shadow smoke, denser blood, left-to-right wind and tumbling bone fragments. Lightning follows hit direction; cosmetic variation remains deterministic.
- Supporting chest/relic details, pixel fire and rot effects, and more restrained background banding/fog.

The cutscene art is unchanged. This is not a replacement of every environmental prop or UI asset.

## Integration

`assetdraw.js` contains the first approved weapon shapes. `artgear.js`, `artmobs.js`, `artbosses.js`, `artfx.js` and `artworld.js` load in that order immediately before boot. They extend the project's existing global renderer architecture. Earlier first-pass edits remain in actors.js, enemies2.js, foes_march.js, hero.js and items.js. ui.js routes attack trails to the new renderer and removes the old rarity overlay.

Serve the repository over HTTP and open `tools/art-review.html`. The workshop runs the real renderers, with collection, name, element, rarity, pose, phase and Kesh controls. It is a developer preview, not part of the player UI. The game's existing Three.js CDN dependency still applies.

## Validation

Reports and reproducible browser harnesses are in the sibling `audit` folder, under `v40` and `v40-*.cjs`.

- 4,884 icon variants, 5,500 ordinary enemy poses and 960 boss poses: no failed draws or renderer entity mutations in the revised build.
- No fractional icon alpha or clipped icon border pixels in the tested variants.
- BASES, EDEF, BOSSES and MV definitions match the untouched v40 snapshot. Seeded application of all ten elements gives identical damage/status results.
- Cosmetic effects do not advance combat RNG. Hit effects are capped at 36 and lightning arcs at 16. Reduced-motion variants reduce ray count and duration.
- 31 weapon/shield entries each passed 120 update/render frames with movement and attack enabled; no browser exceptions or nonfinite player positions.
- Workshop collections expose 74, 55, 13 and 10 entries respectively. Render sheets and ten representative levels were visually inspected.

These checks are rendering and short simulation checks, not a full campaign playthrough or a mobile performance guarantee. The first snapshot has an existing crow draw-state mutation; the revised renderers passed the no-mutation check.

## v40 integration

Preserves upstream attributes, weapon grades, armour weight, family sets, milestones, chest categories, second ring, and mobile worn-panel layout. The hero merge retains glove/boot rendering and hood support. All 31 newly added equipment bases receive family-aware pixel icons; Leather Cap keeps its own worn silhouette.

The subsequent v41 late-game balance update (hard43.js) is merged unchanged. The workshop and 31 weapon/shield simulation checks were repeated on that combined build.
