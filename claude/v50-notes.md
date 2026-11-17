# Marrowdeep v50: set pieces

BT (17 Nov): "do a full audit and work out why this game still doesn't feel steam ready … make the first few bosses way cooler, more epic … more targeted to the zone. Also like a moving background … think in lotr when Gandalf falls down fighting that big fire demon … make it so the player needs to react and not just running through."

Branch `feature/set-pieces`. Co-op needs `marrowdeep-50` (the first three boss arenas changed size; foes carry regional leanings and officers). Scripts are tagged `?v=50`; the title shows v50. The audit is in `claude/audit-v50-steam.md`.

## The first three bosses (`bosses55.js`, numbers in `SP`)
All three used one 36-tile room: a flat floor and the same three planks. Each now has its own ground, something vast behind it, and mechanics only that place has. Their life bar moved from the floor to the top of the screen (it sat over the boss's feet), and the level name steps aside while it shows.

### Ser Odo, the Gallows Road (60 tiles)
- **The place:** three gallows with caged dead, two wheat fields, and the hunt riding the ridge behind with torches.
- **Pass (mounted):** he rides the whole road down. Jump it or roll through. Strike him as he goes by (twice, or once heavy or critical) and the dead horse shies: open for 2.4 s.
- **Torches (mounted):** the riders behind throw fire into the field. Wheat carries it at 34 px/s and it burns his hounds as well as you. Your own fire lights wheat too.
- **Hook (on foot):** the gallows hook on a chain, 210 px. If it lands you are dragged in for a cut a second later; roll to tear free. If it misses he is open for 1.9 s.
- **Gibbet (on foot):** four or five cages come down in marked columns.
- **Last 22%:** the field burns in from both ends until the fight is one screen wide.
- He rides in during his intro instead of standing there.

### The Three Sisters, the Sisters' Pool (52 tiles)
- **The drowned stand up.** A sister who sinks rises again behind the reeds, 168 px tall, and attacks from there for the rest of the fight:
  - the Eyeless throws three knucklebones (marked columns);
  - the Mouthless screams across the upper two thirds of the screen (get down off the boards);
  - the Many-Fingered brings a hand down. It stays 3.4 s, and blows on it land on the sisters' shared life at the open rate.
- **The fen breathes.** Every 17 s the water comes up over the floor for about 5 s. Standing in it you are slowed and grabbed every 1.5 s. Everything standing in it is Soaked, the sister included, so lightning and cold builds get their combos for free.
- The scream and the flood never overlap (one says get down, the other says climb).

### The Lantern Preacher, Saint Edda's Ashes (52 tiles)
- **The place:** inside the chapel, at half light, under its bell, with the east window behind. No sandstorm indoors.
- **Sermon:** he lifts the lantern for 1.9 s. When it flares, anything within 150 px that it can see takes a heavy hit and a fire pillar. Stand under a loft, behind the fallen bell, or out of reach.
- **The bell:** strike it (a jump-strike near the top of the jump reaches it; checked with real key presses) or toll your own Funeral Bell near it. The sermon stops, the kneeling congregation is on its feet for good, every other foe is stunned 2.4 s, and he is open (2.4 s if it cut a sermon short, 1.3 s otherwise). It can be rung again after 9 s.
- **At half life** he burns the rope: the bell falls on a marked spot, rings as it lands, and stays as cover.
- **Last 22%:** the window goes, and a burning beam falls near you every 2.7 s.

## The world moves (`stage54.js`, numbers in `STG`)
- **Far plane, all the time:** the hunt on the ridge and siege fire crossing the sky (Quiet Fields); something tall wading through the mist (Rushmere Fen); the towers of Kesh coming down one at a time (Ashes).
- **Set pieces:** a director calls one every 34–50 s of play (first at 14–20 s) while you are on the ground, outside a sealed arena, with five or fewer foes near.

| Region | Set piece | What it asks |
|---|---|---|
| Quiet Fields | **The Hunt:** a horn, a marked lane, then three riders and three hounds charge from behind | Jump, roll or meet them |
| | **Torches:** five torches from the ridge land round you | Move; the grass and wheat carry it |
| Rushmere Fen | **They come up:** up to four drowners surface in a ring | Break out of the ring |
| | **The Hand:** what is wading out there slams down twice | Watch the shadow |
| Ashes of Kesh | **A tower falls:** seven blocks of masonry over three seconds (a tower on the skyline goes at the same moment) | Read the columns |
| | **The Company:** four buried soldiers rise in front and behind | Pick a side |

- Foes a set piece brings are real foes. In co-op the host spawns them; hazards hurt the hero on that machine.
- `?stage=off` turns the director off.

## Foes answer the Marrow (`react56.js`, numbers in `RX`)
Talents-plan section 5, points 2–5, started.
- **Reactions:** eighteen foe-and-type pairs do something of their own (the list is at the top of `react56.js`). Examples: fire on a scarecrow sends it running and it leaves fire behind; lightning throws a rider; lightning on a drowner arcs to everything wet; fire sets off a zealot's own flask. Anything flying is grounded by wind; anything standing in water conducts lightning. Each shows a label and explains itself once.
- **Regions lean:** foes of each Act I and II region are weak to one type (+30%) and resist another (30%). The level says which when you arrive.
- **Element shrines:** one in each Act I and II dungeon level. Your blows carry the region's weak type for 40 s. A new hero has no type of their own for a long time; this is how they meet the system. Uses Codex's shrine art.
- **Officers:** a few in each dungeon level, where three or more foes stand together (the regression sweep counted 0–5 a level at the first setting; it was raised by half after).
  - 旗 **Banner-bearer:** everything within 110 px takes 45% less and doesn't flinch.
  - 角 **Horn-blower:** winds a horn for 1.9 s. Stun, freeze or kill him and it stops. If it finishes, the region's set piece comes at once (or three more of his kind where there is no director).
- **Weight:** heavy and critical blows get 60 ms of slow motion (at most every 0.3 s), ranked and officer kills 200 ms, a broken boss 300 ms. Not in co-op, not with reduced motion. This is the v49 finding that hit-stop is capped at 25 ms.

## Where this differs from what was asked
- **"The first few bosses"** is the first three. Merrow, Piet and the ten after them are still in the 36-tile room.
- **Mob abilities** are reactions, leanings and two officer kinds laid over the existing foes. No foe's own attack list was rewritten.
- **Level set pieces** cover the first three regions. The other seven have no director and no far plane yet.
- The bosses' sprites are the same size as before. The scale comes from the stage.

## Tested headless
- **Each boss mechanic driven on its own and read back:** pass and unseat (opens on the second blow), torches lighting wheat, hook hit and miss, gibbet, the closing fire and its damage; flood, all three giants' attacks, the hand passing 25 damage for a 20 blow; sermon, toll (opens him, frees the congregation), the bell's fall, the burning phase.
- **Each set piece** fired on a flat stretch of its level: foes arrive in the right states, hazards land.
- **Reactions:** nine pairs checked by result; banner 11 damage against 20 without; shrine gives the type, survives `calcStats`, and leaves after its time; a finished horn calls the director.
- **Regression:** all 28 levels loaded and simulated (every boss through all three phases, every set piece) on desktop and phone sizes. No errors.
- **Co-op, two tabs:** start, the Quiet Fields with a Hunt and Torches, then all three bosses. Both sides on the same map with the same officers and shrine; hunt foes reach the guest. No errors.
- **Looked at:** stills of every boss mechanic and set piece. Several were repainted after the first look (the chapel wall, glow blowing out the burning phases, the life bar under toasts).

## Not tested
- **How any of it plays.** Nothing here has had a hand on the keys. Every number in `SP`, `STG` and `RX` is a first guess. The ones to watch first: the pass (440 px/s), the sermon's reach (150 px), how often the director calls (34–50 s), the banner's 45%.
- **Whether a fight is now too long.** Boss life is unchanged, but all three have more to dodge.
- **Co-op beyond the smoke test:** a guest ringing the bell rings it on their side only; the giants and the flood run on each machine's own clock; nobody watched a two-player boss fight.
- **Phone:** it loads and runs at phone size. Reaching the bell with a jump-strike on touch controls wasn't tried.
- **The balance lab** wasn't run (regional resist changes what a one-type build does in a region).
- **Frame rate** with the far plane, wheat fire and a set piece at once.

## Next
1. BT plays the first three regions and bosses; tune `SP`, `STG`, `RX` from that.
2. The same treatment for Merrow and Piet (the Black Camp, the Gate), then Act II's five.
3. Directors and far planes for the Weeping Pass, the Last Light and Act II.
4. Plan section 5, the rest: Gift routes, bone piles and updraft vents, boss phases with a tree answer.
5. The audit's Steam list (desktop build, controller, settings).
