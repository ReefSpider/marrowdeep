# Marrowdeep — why it doesn't feel Steam-ready yet (audit on v49, 17 Nov 2026)

BT: "do a full audit and work out why this game still doesn't feel steam ready."

How this was done: the v49 build was run headless and looked at (title, the first three regions, the first three bosses through every phase), a bot was sent sprinting through the first three regions without fighting, and the boss, foe, level and background code was read. Nobody played it by hand for this audit, so findings about feel are read from structure and stills, not from the stick.

**The short answer:** the systems are deep (loot, 273 tree nodes, ten damage types, 13 bosses, co-op), but the stage they play on stood still and asked for little. Most of what a Steam player would call polish is the world reacting: to where you are, to what you hit it with, and to time passing. That was the thin part. Separately, there is a list of things Steam itself requires that a web page doesn't have.

## Findings, biggest first

| # | Finding | Evidence | State after v50 |
|---|---|---|---|
| 1 | **Every boss fought in the same room.** | One arena generator: 36 tiles, flat floor, the same three planks, for all 13 bosses (five got a small change). The fight fits on one screen and the backdrop is a still image. | First three rebuilt (v50). Ten to go. |
| 2 | **Nothing happened unless you walked into it.** | Background events were one small thing every 11–18 s (five crows two pixels wide, a spark). Levels had no timed events. A bot holding right and jumping crossed 1,200 px of the Quiet Fields in 23 s and lost 76 of 81 life without ever needing to stop; the first region's foes are passive by design (scarecrows stand, crows sit). | A director and a far plane in the first three regions (v50). Seven regions to go. |
| 3 | **The tree and the foes didn't talk.** | v46–v48 added 273 nodes about ten damage types. No foe reacted to a type by what it was; regions didn't favour any; a new hero carries no type until a drop gives one or the tree reaches a wedge. Plan section 5 was not started. | Reactions, regional leanings, shrines, officers (v50). Gift routes and boss tree answers still open. |
| 4 | **A single blow had no weight.** | Hit-stop is capped at 25 ms on any hit and zero after a kill (found in v49). | A slow-motion beat on heavy blows, ranked kills and boss breaks (v50). Needs a hand to judge. |
| 5 | **The boss's life bar sat on the fight.** | It was drawn 73 px above the bottom edge; the arena floor is there, so it covered the boss's legs and the hero's. | Moved to the top (v50). |
| 6 | **Bosses are the size of the hero.** | The Sisters and the Preacher are 16×30 px; the hero is about the same. | Unchanged. v50 gets scale from the stage (168 px giants, a falling bell). A real fix is the art pass in the roadmap. |
| 7 | **Two boss rooms were hard to read.** | The Preacher's arena went flat beige under its sandstorm; the Sisters' Pool is very dark. | The chapel is indoors now. The Pool is still dark. |
| 8 | **The first region is the quietest.** | The level straight after the cold open is "too quiet" on purpose, with the most passive foes in the game. v49 made the first 30 seconds loud, then the next ten minutes drop. | The Hunt and Torches fire there from 14–20 s in (v50). The foes themselves are unchanged. |

## What Steam needs that isn't built
None of this is in v50.
- **A desktop build.** The game is a web page. Steam needs an executable (Electron or Tauri around the same files), Steamworks wired in (achievements, cloud saves, the overlay), and an offline start.
- **Fonts from the network.** `index.html` loads its four typefaces from Google Fonts. Offline, every heading falls back to Georgia. They need to ship in the repo.
- **Controller support and rebinding.** Both are on the roadmap, neither is started. Steam Deck is a large share of the audience for this kind of game.
- **Display settings.** Fullscreen, resolution scale, vsync, a frame cap. The game renders at 480×270 and scales, which is fine, but there is no control over it.
- **Sound.** Effects are synthesized or a small set of licensed samples, with no mix pass. The roadmap already lists a sound designer.
- **A store presence.** Trailer, screenshots, a one-line pitch, a demo build.
- **Real-device testing.** Frame rate in the worst fights on a mid-range laptop; co-op across two real networks (never tested; no TURN relay).

## What makes every change slower
- The game is 107 script files loaded in order, each one wrapping functions from the ones before. `loadLevel` is wrapped 39 times, `update` 26, `dmgEnemy` 20, `hurtPlayer` 12. v50 adds three more files and deepens each of those. A change to one rule means reading the whole stack to find where it now lives. The roadmap's "fold the wrapper stacks" item is the fix, and it gets more expensive each release it waits.
- Nothing is tested by play. Every release since v32 has been checked headless and by friends' reports. That catches errors and balance; it doesn't catch feel, which is what this audit was asked about.

## What is already good enough
- **The cold open** (v49): in control at 0 s, six kills by 2.8 s.
- **Loot and builds:** 36 uniques, 14 abyssals, sets, three attributes, team roles, all checked by simulation.
- **Bosses as designs:** every one has its own idea (kill order, cover, a mirror of your own style). The patterns were sound; the staging wasn't.
- **The look** at its own scale: region palettes, dithered backdrops, lighting.
- **Co-op** works in every local test.

## Order I would do the rest in
1. Play v50's three regions and bosses, and tune.
2. Give Merrow, Piet and Act II's five bosses the same treatment; directors for the remaining seven regions.
3. Fonts into the repo, then controller support and rebinding (needed for Steam, and for a Deck).
4. Fold the four deepest wrapper stacks before more is built on them.
5. A desktop build with Steamworks.
6. The art and sound passes (need people).
