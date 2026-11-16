# Marrow tree art — tree, combat, environment and illustrated icons

Open `tools/art-review.html` over HTTP and follow **Open the Marrow tree workshop**,
or go directly to `tools/tree-review.html`. The workshop loads the real game
renderer in its existing review mode. It requires the same Three.js dependency
as the game. From `game-review`, `python -m http.server 8000` serves it at
`http://localhost:8000/tools/tree-review.html`.

## Delivered

- `arttree.js`, loaded immediately after `artfx2.js`: isolated `TreeArt` API,
  with no gameplay hooks, player changes, combat RNG or internal clock reads.
- All nine frame types in all five states, including split bridge colours,
  attunement cracks, empty/seated sockets, three keystone nails and kintsugi Paradox.
- 64 × 64 Heart with a four-frame pulse; vertebra renderer; a six-node Spine example.
- Three cracked ring guides, attribute sectors, ten elemental wedges and their sigils.
- Broken unallocated lines, crawling allocated links, marching preview dashes,
  short chains and braided two-element connections. Reduced-motion option.
- 109 named node records: 9 Brands, 18 forks, 21 attributes, 50 element nodes,
  10 bridges and Paradox. **48 interiors are illustrated (Brands, forks and attributes),
  60 still use sigil fallbacks, and Paradox uses its unique frame.**
- Twenty individually authored 8 × 8 stat glyphs and a 16 × 16 ribcage tab drawing.
- Workshop with searchable catalogue, all-state frame sheets, glyph sheet,
  Heart/Spine/link studies, animation toggle, drag/keyboard pan, zoom, Heart recenter,
  node inspection, whole-tree/Water-wedge/bridge-path presets. Reduced-motion system
  preference is respected on load.

The example tree placement, allocation states and seven-point cost plate are art
fixtures, not the talent graph or cost logic. No playable tree UI is installed.
The existing tree and save format are unchanged. The combat-art batches below
cover the brief's section 5 effect studies, two hero poses, Bone Thrall, defensive
art and three combos. These are preview renderers, not implemented abilities.
The environment batch also covers the section 6 props and gift-route markers.
Attribute, element and bridge picture icons, final gameplay tooltips/badges/notices
and painted assets are still outstanding.
No generated images were used. This checkout does not yet implement the new
talent mechanics; the old dodge/parry Clarity remains unchanged.

## Combat art / batch 1

Select **Combat art / batch 1** in the workshop, or open
`tools/tree-review.html?view=effects`. Ten studies cover eight effect variants and
two authored poses. The shared timeline scrubs each effect through its own duration;
scrubbing pauses on that frame. Replay, left/right facing, zoom and reduced-motion
controls apply to every study. Pause retains the current effect frame.

| Family | Delivered art | Preview timing |
| --- | --- | --- |
| Grave Slam | Raised-sword leap, crouched sword-first crash, cracked crater, expanding dust ring and thrown debris | 1.8 s; impact at 0.6 s |
| Ossuary Crash | Seven rising bone splinters around the crater | Same slam timeline |
| Gale Crash | Rising stepped wind spiral and ash streaks | Same slam timeline |
| Stillness | Thin bone ward traced over 1 s, steady hold and fragmented break | 2 s; break at 1.3 s |
| Frozen Stillness | Cold accents and radial frost shards on break | Same ward timeline |
| Hallowed Stillness | Holy accents and a light pillar on break | Same ward timeline |
| Tidebreak | Travelling floor wave with a curling foam crest and wake | 1.1 s; 96 px / six 16 px tiles |
| Tidebreak in standing water | Taller crest, longer wake and more spray | Same range and speed |

The hero art uses a neutral sellsword with a fixed sword and tintable cloth/plate.
It is an authored pose study, not yet an equipment-aware replacement for `drawHero`.
Gale draws the lifting wind; enemy displacement remains gameplay's responsibility.
Preview durations and offsets are cosmetic, not new combat balance values.

### Effect API

All effect anchors are **ground/feet coordinates**. All ages are **seconds**.
Negative, nonfinite and expired ages produce no drawing. Each call saves/restores
canvas state, uses integer pixel primitives and reads no player, world or RNG state.
Effects allocate no persistent particle list and schedule no work.

```js
// Complete preview timeline; no hero unless explicitly requested.
TreeArt.effect(ctx, 'ossuary-crash', x, groundY, age, {
  hero: true, direction: 1, seed: 7, reducedMotion: false
});

// Production-friendly individual phases. Call back layer, draw the actual hero,
// then front layer. Omit layer to draw both layers together.
TreeArt.graveSlam(ctx, x, groundY, ageSinceImpact, {
  variant: 'ossuary', layer: 'back', seed: 7, reducedMotion: false
}); // landing art lasts 1.2 s
TreeArt.stillness(ctx, x, groundY, ageSinceBreak, {
  phase: 'break', variant: 'frozen', layer: 'front'
}); // form: 1 s to complete; hold: steady; break: .7 s
TreeArt.tidebreak(ctx, originX, groundY, age, {
  direction: -1, standingWater: true, tileSize: 16
}); // crest moves 6 * tileSize; decorative spray extends beyond it

const stance = TreeArt.slamPose(ageSinceTakeoff, reducedMotion);
TreeArt.heroPose(ctx, x, groundY + stance.offsetY, stance.pose, {
  direction: 1, cloth: '#3a2e2e', steel: '#74858b'
});
```

`effectSpecs` exposes the eight IDs, families, variants and preview durations.
`graveSlam` variants: `plain`, `ossuary`, `gale`; `stillness` variants: `plain`,
`frozen`, `hallowed`; phases: `form`, `hold`, `break`. Low-level renderers accept
`layer: 'back' | 'front'`; `effect` always composes both layers. `heroPose` supports
`leap`, `crash`, and a neutral `idle` for effect previews.

Reduced motion cuts dust, debris, wind trails, break shards and spray, and reduces
the preview hero's leap displacement. Timings and wave travel remain legible;
there is no screen shake, glow blur or rapid strobing. `tileSize` is bounded to
1–64 pixels; the default is the game's 16 pixels. The caller owns concurrent effect
limits, spawning, collision and enemy movement. No gameplay hooks were installed.

Validation: `../audit/tree-effects-qa.cjs`, report in
`../audit/tree-effects/report.json`. 2,000 draws cover eight timelines, both facings,
two seeds, normal/reduced motion, lifecycle boundaries, repeatability, integer and
opaque pixels, context restoration and unchanged player data. Both `Math.random`
and the game's `RNG` are guarded. Layer composition and taller/travelling water
are checked, as are scrub/pause, replay, facing and system reduced-motion controls.
Peak observed primitive count: 757 pixel calls for one timeline draw. No browser
errors. The existing 2,180-draw tree suite also passes.

Phone (852 × 393) and desktop (1280 × 720) gallery captures are in
`../audit/tree-effects/`; leap, impact, break and phone layouts were visually
inspected. Full-page sheets are taller than the viewport because the gallery scrolls.

## Combat art / batch 2

Select **Combat art / batch 2**, or open `tools/tree-review.html?view=combat2`.
Ten animated studies use the same timeline, facing, zoom and reduced-motion controls.

- **Bone Thrall:** a hunched, ghoul-scale splinter skeleton with separated ribs,
  broken shoulder/crown spurs and a single faint gold eye. Rise, idle, walk, swing
  and crumble poses. Rise/crumble last .8 s; swing lasts .6 s; idle and walk loop.
- **Sanguine Shell:** a thin blood film and red shield bar above the life bar.
  The preview depletes the shield while retaining 75% life to make them distinct.
- **Bone Plate:** 0–3 individual bone pips, with a separate lost-slot shatter.
  The preview breaks one every .5 s; these are illustrative timings only.
- **Pale Light / 白光:** frozen casing, white shaft and white ice fragments.
- **Drowned Bones / 沈骨:** dark pool, opaque knee-deep foreground and jutting bones.
- **Black Flame / 黒炎:** purple fire that propagates visually across three positions,
  relaying a mark at each. No damage/status spread is performed by the art renderer.

`TreeArt.combatSpecs` describes the ten studies. `combatEffect` runs their complete
cosmetic timeline; `hero: true` opts into the neutral reference figure for scale.
All anchors remain feet/ground positions and all ages are seconds.

```js
TreeArt.boneThrall(ctx, x, groundY, 'walk', animationAge, {
  direction: -1, reducedMotion: false, seed: 7
});
TreeArt.sanguineShell(ctx, x, groundY, animationAge, {
  strength: shieldFraction, layer: 'front'
});
TreeArt.shieldBar(ctx, barX, barY, shieldFraction, lifeFraction, 34);
TreeArt.bonePlate(ctx, x, groundY, animationAge, {
  count: 2, shatterSlot: 2, hitAge: secondsSinceHit
});
TreeArt.combatEffect(ctx, 'pale-light', x, groundY, age, {hero: true});
```

`bonePlate` clamps count to 0–3. Slots are zero-based from left to right; the caller
supplies the remaining count and lost slot explicitly. Shatter lasts .55 s.
`shieldBar` clamps both fractions to 0–1 and width to 8–160 px. Its shield occupies
the top 3 px, followed by a 2 px gap and the 3 px life bar. Empty shield is unfilled.
`sanguineShell` accepts `layer: 'back' | 'front'` to bracket the actual hero.

Low-level combo functions are `paleLight` (1.1 s), `drownedBones` (1.6 s, split
back/front layers supported), and `blackFlame` (1.4 s, direction supported).
Negative/nonfinite ages draw nothing; transient effects stop at their duration.
Idle/walk and active defenses remain caller-owned states, rather than expiring.
All drawing is integer-grid and deterministic with bounded loops, context restoration
and no game RNG, character state or persistent particle mutation.

`TreeArt.comboArt` supplies the three names and kanji. `comboPopup(document, id)`
returns the existing `.cpop` / `<b>kanji</b>name` structure with a cosmetic colour.
The workshop copies the existing popup typography/glow and rise/fade timing. In
the game DOM, its normal sigil observer can transform the kanji. The factory does
not call `popCombo`, select a gameplay tier, mark a combo seen, or save anything.

Validation: `../audit/tree-combat2-qa.cjs`, report and phone/desktop sheets in
`../audit/tree-combat2/`. 2,490 draws cover the ten studies, two seeds, both facings,
normal/reduced motion, deterministic repeats, expiry, context restoration,
opaque integer pixels, plate counts/shatter, shell layer composition and exact
popup text. Game/player/combo discovery/save data remain unchanged with both RNG
paths guarded. Peak observed primitive count is 472 pixel calls per draw.
Phone and desktop mid/late-animation sheets were visually inspected. Gameplay
summoning, shields, damage, crowd control and status propagation are not installed.

## Brand art / batch 3

Select **Brand art / batch 3**, or open `tools/tree-review.html?view=brands3`.
The five studies share the timeline scrubber, pause/replay, facing, zoom and
reduced-motion controls. This batch adds:

- **Heart-Spike:** one thick blood lance with an impact crack/flash and falling
  droplets. 1.2 s preview. The flash is cosmetic; it does not apply stagger.
- **Black Iron Hound:** heavier overlapping black plate, shoulder guards,
  gauntlets and greaves, with idle, brace and strike poses. 1.6 s preview.
  This preserves the game's humanoid Hound transformation rather than drawing
  a quadruped. The preview sword is fixed, not equipment-aware.
- **Red Maw:** lighter Hound plate with a red jaw accent, blood crescent and
  ballistic droplets on its blow. 1.2 s preview; strike blood lasts .75 s.
- **Thunder Draw:** a sheathed/drawn sellsword pose, three scored cuts, then
  sequential lightning wounds. 1.4 s preview. The first lightning opens at
  .58 s, followed by the others at .70 and .82 s.
- **Long Draw:** a growing sheath glint followed by a wide stepped crescent.
  1.5 s preview; release at .6 s. Reduced motion shortens the visible arc and
  removes stray charge pixels without changing its timing.

```js
TreeArt.brandEffect(ctx, 'thunder-draw', x, groundY, age, {
  hero: true, direction: 1, reducedMotion: false, seed: 7
});
// Individual renderers for later gameplay bindings:
TreeArt.heartSpike(ctx, x, groundY, age, options);
TreeArt.houndForm(ctx, x, groundY, age, {
  variant: 'black-iron', pose: 'brace', direction: -1
});
TreeArt.redMaw(ctx, x, groundY, ageSinceBlow, options);
TreeArt.drawCutPose(ctx, x, groundY, age, {drawn: true, direction: 1});
TreeArt.thunderDraw(ctx, x, groundY, ageSinceDrawSequence, options);
TreeArt.longDraw(ctx, x, groundY, ageSinceCharge, options);
```

`brandSpecs` contains the five IDs, descriptions and preview durations.
All anchors are feet/ground positions and ages are seconds. All transient renderers
return without drawing for negative, nonfinite or expired ages. `houndForm` and
`drawCutPose` are caller-owned persistent poses; Hound poses are `idle`, `brace`,
and `strike`, with `variant: 'red-maw'` selecting the lighter form. `brandEffect`
draws the Black Iron transformation itself; for other studies, `hero: true` opts
into the reference character. Effects alone do not mutate characters or apply
damage, stagger, transformation, bleed or lightning statuses.

Validation: `../audit/tree-brands3-qa.cjs` and `../audit/tree-brands3/report.json`.
1,244 draws cover normal/reduced motion, both facings, two seeds, animation phases,
expiry, repeatability, opaque integer pixels and canvas-state restoration. Additional
preview-bound checks sample 240 frames inside the actual 160 × 104 art canvas.
Tests verify that lightning is absent before its delay, the two Hound variants differ,
and game, combo-discovery and save data are unchanged with RNG calls guarded.
Peak observed primitive count: 536 pixel calls. Phone and desktop mid/late sheets
were visually inspected. No gameplay mechanics were added.

## Shade and blade art / batch 4

Open `tools/tree-review.html?view=shades4` for four studies:

- Marking Shade: a violet apparition copies a cut, then leaves a purple cross-mark.
- Decoy: red lock corners transfer from the reference hero to the shade.
- Rain of Needles: exactly ten green blades, narrow silhouettes and staggered falls.
- Six Executioners: exactly six broad iron swords, crossguards and heavier impacts.

`shadeSpecs` holds IDs/durations; `shadeEffect(ctx,id,x,y,age,options)` composes
the previews. `hero: true` adds the reference hero to shade studies. Individual
APIs: `shadeFigure`, `markingShade`, `decoy`, and `bladeRain` (variant `needles`
or `executioners`). All use ground anchors, seconds, explicit facing and reduced
motion. Reduced motion preserves the ten/six blade counts, reducing trails and
debris instead. Preview target positions are illustrative and change no aggro.

Validation: `../audit/tree-shades4-qa.cjs`, 998 draw checks plus 192 preview-bound
samples. Tests verify every blade at impact, lock transfer, deterministic output,
integer opaque pixels, state restoration, expiry and no player/save/RNG mutation.
Phone/desktop sheets are in `../audit/tree-shades4/`.

## Bell and breath art / batch 5

Open `tools/tree-review.html?view=brands5`:

- Toll for Me: bell silhouette, toll ring, red locks snapping onto the hero.
- Drowning Bell: expanding blue floor ring with a stepped foam rim.
- Martyr's Breath: paired healing wavefronts reaching allied reference figures.
- Vengeful Shade: violet apparition wreathed in orange flame and embers.

## Element art / batch 6

Open `tools/tree-review.html?view=elements6`:

- Undertow: floor-water streaks converge inward.
- Wildfire: spread reuses the four-tongue pixel fire-tile geometry and colours
  from `artworld.js`, with explicit local age instead of game-state reads.
- Pyre Walker: fire rim-light on intact armour, with nearby floor flames.
- Cinder Heart: compact heart/ember detonation.
- Funeral Pyre: smoulder followed by a large delayed flare.
- Permafrost: a large ice casing around a double-size reference target, then release.
- Storm Conduit: sparks stored on a reference target, followed by a chained bolt.
- Tempest: suspended figures tumble in four stepped orientations; reduced motion
  retains suspension but removes tumbling.
- Necrosis: five rot pips plus an actual pixel-font stack count progressing beyond
  five. `rotStacks(ctx,x,y,count)` supports integer values 0–999 (display cap).
- Sanctuary: a broken gold/bone ground seal and rising light strokes.
- Night Has Teeth: immediate fanged shadow/blood bloom. Preview starts at its
  trigger; the renderer does not inspect or alter enemy life thresholds.
- Unseen: an evenly half-transparent reference hero and opaque ink smoke. The
  hero is composited once from an opaque cached sprite to avoid overlapping
  primitives accidentally accumulating opacity.

`remainingSpecs` describes both batches, with `family: 'brands' | 'elements'`.
`remainingEffect(ctx,id,x,y,age,options)` renders each finite study; ground anchors,
seconds, `direction`, `reducedMotion`, `seed`, and `hero: true` follow earlier batches.
`stacks` can explicitly override Necrosis's illustrative counter. Reference allies,
foes and the frozen large target use Bone Thrall art for scale; they are not spawned
entities. Preview effects stop at their specified duration. There are no applied
heals, threat changes, crits, damage, crowd control, visibility changes or status ticks.

Validation: `../audit/tree-remaining-qa.cjs`, 3,972 draw checks plus 768 preview-bound
samples across sixteen studies. Tests cover normal/reduced motion, facing, seeds,
phases, expiry, determinism, restored canvas state, Necrosis beyond five, hero lock
placement, half-opacity Unseen, and unchanged player/combo/save data with RNG guarded.
Unseen intentionally permits alpha 128; the rest is rendered on the integer grid.
Reports and phone/desktop sheets are in `../audit/tree-remaining/`.

## Environment art / batch 7

Open `tools/tree-review.html?view=environment7`. Seventeen studies cover 35
explicit states. The **State** selector can cycle through them or pin resting,
active or burnt states. Burnt applies to the two ground props; other objects
retain their last supported state. The badge always names the actual state.

| Asset | IDs | States |
| --- | --- | --- |
| Ten element shrines | `shrine-` + existing element ID (`shock` for Lightning) | `dormant`, `used` |
| Oil slick and straw | `oil`, `straw` | `intact`, `burning`, `charred` |
| Updraft vent | `updraft` | `idle`, `active` |
| Ossuary bone pile | `bone-pile` | `intact` |
| Gift routes | `grave-claw`, `ash-wings`, `red-tether` | `visible`, `highlighted` |

Shrines have stepped stone plinths, an engraved sigil, and a bowl lit in the exact
element colour when used. Ground props retain their base texture under flames and
have a separate charred residue. The iron vent emits ash in its active state. The
bone pile includes long bones, ribs and a skull with opaque eye sockets. The route
markers are a claw-scarred masonry section, feathered ash wings and a wall-mounted
iron ring with a brighter glint.

```js
TreeArt.environment(ctx, 'shrine-fire', x, groundY, animationAge, {
  state: 'used', reducedMotion: false, direction: 1, seed: 7
});
TreeArt.environment(ctx, 'straw', x, groundY, animationAge, {state: 'burning'});
TreeArt.environment(ctx, 'red-tether', x, groundY, animationAge, {
  state: 'highlighted', reducedMotion: true
});
```

`environmentSpecs` exposes IDs, kind, element and supported states. Unlike the
finite combat timelines, these are persistent props: any nonnegative finite age
is accepted, and the caller supplies state. Invalid ages draw nothing; unknown
IDs/states throw descriptive errors. Ground/feet anchors and explicit seconds
match the rest of the API. The 3 s gallery cycle is a preview, not a state machine.
Reduced motion freezes flame movement, ash drift and glint variation while
retaining the visible active-state cues. No shrine use, collision, burning damage,
vent forces, traversal unlocks or level placement is implemented.

Validation: `../audit/tree-environment7-qa.cjs` and
`../audit/tree-environment7/report.json`: 5,087 render checks across all 35 states,
both facings, reduced motion, seeds, time samples, persistence, invalid ages and
state selection. Checks include exact shrine colours, distinct state output,
integer opaque pixels, restored context, preview bounds, and unchanged game/save
state with both RNG paths guarded. Peak observed primitive count: 445 pixel calls.
Phone (852 × 393) and desktop (1280 × 720) sheets in
`../audit/tree-environment7/` were visually inspected.

## Illustrated Brand and fork icons / batch 8

Open `tools/tree-review.html?view=pictures8` for all 27 new pictures. The view shows
each complete node at native size and fixed 3×, plus all five states. Its zoom
controls are disabled because those two scales are the comparison; the full
**109 node icons** catalogue retains adjustable zoom. Search by a Brand name also
finds its two forks. The tree overview and ordinary icon gallery use these pictures
automatically. No render bindings or caller changes are needed.

| Brand | Picture | Fork pictures |
| --- | --- | --- |
| Hemorrhage | Blood lance and drop | Three lances / heavy lance and stagger cracks |
| The Hound | Fanged iron head | Plated head / open bleeding jaws |
| Grave Slam | Downward impact into crater | Bone splinters / rising wind strokes |
| Iaidō | Drawn blade above sheath | Lightning cut / wide crescent and glint |
| Shade Step | Apparition with copied blade | Mark beside shade / red targeting cue |
| Thousand Cuts | Falling blades | Ten green needles / six broad swords |
| Funeral Bell | Bell with toll strokes | Red targeting brackets / water beneath bell |
| Last Breath | Heart with pulse line | Healing cross and breath / burning shade |
| Stillness | Figure inside ward | Broken frost ward / light pillar |

Brand interiors use an 18 × 18 allocation; fork interiors use 14 × 14. All geometry
is hand-authored integer pixels. State colours keep locked pictures dim and allocated
pictures gold, with selected effect accents in reachable states. Fork role tags
are composited above their picture in the lower-right corner. Refusal cracks and
refund slashes are composited last so they remain visible.

`catalogue` entries now declare `art: 'picture'` and `iconSize` for these 27 nodes.
`TreeArt.brandIcon(ctx,entry,x,y,{state})` draws a picture alone at its native size;
`TreeArt.node` draws the full frame/picture/tag/state assembly. Remaining entries
retain their existing sigil rendering, and Paradox retains its special seal.
Kanji identities remain in the node metadata; no text is baked into pictures.

Validation: `../audit/tree-pictures8-qa.cjs`, report and native/3× sheets in
`../audit/tree-pictures8/`. 540 draws verify all five states, icon bounds, distinct
silhouettes, deterministic pixels, refusal-mark visibility, context restoration,
and unchanged game/save data with RNG guarded. Browser checks cover 27 illustrated
entries versus 81 fallbacks, Brand-family search, and phone horizontal overflow.
The existing 2,180-draw tree suite also passes. Desktop, family and phone sheets
were visually inspected. This changes art only.

## Renderer contract

Coordinates are node centres. Draw on an integer pixel canvas, then scale with
`imageSmoothingEnabled = false`, as the workshop does. Frames have their nominal
sizes; outer allocation/search glints need an additional 6 px of padding.
Time values are seconds. Supply `reducedMotion: true` to freeze moving links and
outlines. `heart` takes this as its fifth argument.

```js
TreeArt.frame(ctx, 'bridge', 100, 100, {
  state: 'allocated', color: TreeArt.elements.water,
  color2: TreeArt.elements.bone, both: true, time: seconds
});
const node = TreeArt.catalogue.find(n => n.name === 'Tidebreak');
TreeArt.node(ctx, node, 100, 150, {state: 'reachable', time: seconds});
TreeArt.connection(ctx, {x: 100, y: 110}, {x: 100, y: 138}, {
  state: 'preview', time: seconds, reducedMotion: false
});
TreeArt.heart(ctx, 200, 200, seconds, false);
TreeArt.vertebra(ctx, 200, 160, {state: 'allocated'});
TreeArt.glyph(ctx, 'Life', 100, 200);
TreeArt.ribcage(ctx, 250, 200);
```

`frame`, `node`, `connection`, `guides`, `heart`, `vertebra` and `ribcage`
save/restore transforms. `glyph` and `sigil` only set fill colour and pixels.
`sigil` uses the existing `sigCanvas` when available, honours the sigils setting,
and thresholds the small raster to opaque pixels. Its bounded mask cache is
cosmetic only. The fallback without `sigils.js` is browser-rendered kanji.
Use `shock` for Lightning, matching the game's existing element identifier.

## Validation

`../audit/tree-qa.cjs` uses the local browser harness pattern and a local copy of
Three.js. It checks all 109 node entries × 5 states × 4 time samples (2,180 draws),
opaque/empty pixels, catalogue immutability, transform balance, no `Math.random`
calls, all frame/glyph/helper renderers, browser errors, search results, zoom
controls and horizontal overflow at the requested viewport sizes.

Results: `../audit/tree/report.json`. Screenshots in `../audit/tree/` include all
three requested views at 1280 × 720 and 852 × 393, plus four full gallery sheets.
Representative desktop, phone, zoomed and frame screenshots were visually inspected.
These checks do not claim combat integration or campaign/playtesting coverage.

## Batch 9 — attribute illustrations

All 21 attributes now have bespoke integer-pixel pictures: six notables and one
keystone each for Might, Finesse and Fortitude. Notables use 18 × 18 interiors;
Colossus, Paper Tiger and Martyr use 30 × 30. `TreeArt.attributeIcon` draws the
interior; `TreeArt.node` adds its frame and state marks. Select **21 attribute
pictures** in the workshop for native/3× comparisons and all five states.
Search by name or attribute family. This remains art only.

Validation: `audit/tree-attributes9-qa.cjs` checks 420 draws, bounds, unique
locked silhouettes, deterministic opaque pixels, state overlays, context balance,
and unchanged game/save state with RNG guarded.
