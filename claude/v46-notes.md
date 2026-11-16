# Marrowdeep v46: the Marrow 髄, stage 1

BT (16 Nov): "go through all game files and see what has been created and what is missing. Then let's build and clean all these systems", with Codex's `codex/tree-art-handoff`. The audit is `claude/audit-v45-tree.md` (Project). BT's answers: build the whole tree in stages, rules as in `talents-plan.md`, art to main with the first tree release, sigil fallbacks where art is missing.

Branches: `merge/tree-art` (Codex's art onto main), then `feature/marrow-tree`. Co-op needs `marrowdeep-46`; scripts are tagged `?v=46`; the title shows v46.

## What changed for players
- **One tree.** The Brand tree (15 skills in three columns) and the old Marrow tab (ten stat sliders after the campaign) are gone. T, the satchel's **Marrow 髄** tab, or the phone's 髄 badge opens a full-screen tree of 300 nodes.
- **Points:** 1 per level from level 2. A level 20 hero has 19.
- **Every character is refunded.** All points come back, and a note in the tree explains the change the first time it's opened.
- **Gifts:** Ash Wings, Grave Claw and Red Tether cost nothing. They come from the first three bosses (Odo, the Sisters, the Preacher). A character who already owned one keeps it.
- **Free for everyone:** Second Hand (in the Heart) and the red finishing mark (Execution).
- **Feast** is part of The Hound.
- **Crimson Pact** is now a fork of Hemorrhage (three lances). Its other half, "Tether drags foes to you", is the Fortitude notable **Chain Warden**.
- **Points come back only in the Rope-House.** Giving a node back also gives back whatever only hung off it.

## The tree (`tree50.js`)
| Part | Nodes |
|---|---|
| Heart | 1 |
| Spine: 6 vertebrae and Paradox | 7 |
| Brands: 9 × (path node, Brand, 2 forks) | 36 |
| Sectors 技 · 耐 · 力: 3 × (22 small, 6 notables, keystone, 3 sockets) | 96 |
| Wedges: 10 × (Attunement, 9 small, 3 notables, keystone) | 140 |
| Bridges: 10 × (small, combo notable) | 20 |
| **Total** | **300** |

- **Layout:** built by `buildTree()` from tables at the top of the file. Sectors match the wedges behind them: Finesse 0–144° (Shadow, Poison, Wind, Lightning), Fortitude 144–252° (Holy, Cold, Water), Might 252–360° (Bone, Blood, Fire).
- **Costs from the Heart:** a Brand 2, sector notables 4–7, an Attunement 8, a wedge keystone 14, a bridge notable 15, Paradox 7.
- **Checked:** no two nodes overlap, every node is reachable, and every forged node is reachable through forged nodes only.

### Forged in stage 1 (205 of 300)
- **Every small node (181).** Numbers are in `TK`:

| Node | Gives | Node | Gives |
|---|---|---|---|
| Damage (Might weapons, by grade) | +3% | Threat | +5% |
| Life | +3% | Grit regen | +4% |
| Defense | +3% | Boss stagger | +4% |
| Attack speed | +1% | Carry weight | +1 |
| Critical strike | +0.5% | Draught healing | +4% |
| Life stolen | +0.2% | Crossbow damage | +3% |
| Life regen | +0.4 /s | Element damage | +5% |
| Run speed | +1% | Status length | +8% |
| Magic find, gold find | +4% | Status strength (burn, rot, bleed) | +6% |
| Bridge small node | +3% to both types | Penetration | foes resist 10% less |

- **The ten Attunements:** 8% of the weapon's damage added as that type.
- **Brands the game already had:** Hemorrhage, The Hound, Iaidō, Shade Step, Thousand Cuts, Funeral Bell, Last Breath, and Clarity (old behaviour; it becomes Stillness in stage 2).
- **Crimson Pact** (fork), **Chain Warden**, **Headsman** (finishing mark at 25%), **Unbowed** (a kill heals 2%), **Undying** (regen doubles under 35% life).

### Not yet forged (95)
Drawn in ash grey, readable, can't be taken: "Not yet forged. It comes in a later update." No path needs one.
- Grave Slam and 17 forks (stage 2).
- 30 wedge notables, 10 wedge keystones, 10 bridge notables with the three new combos, Bone Thrall (stage 3).
- 15 attribute notables, 3 attribute keystones, Paradox (stage 4).
- 9 sigil sockets (phase 2 of the plan).

## How it works
- **`META.tree = {v, a, g, note}`:** taken node ids, Gift ids, and the one-time note. Saved with the character.
- **`P.skills` is derived** from it (`syncTree`). Every `has('…')` check in the game works as before, and co-op still sends the plain skill list.
- **Stat nodes** are applied last in `calcStats`, only for the hero who owns the tree. The balance lab's stand-in heroes never get them.
- **Small edits outside `tree50.js`:**
  - `actors.js`: Tether drag reads `chain-warden`; the finishing mark reads `stats.exeAt`; grit regen reads `stats.gritP`; bolts read `stats.xbowP`.
  - `elements.js`: `resOf` takes off the tree's penetration.
  - `marrow.js`: only the XP curve after a campaign clear is left.
  - `fixes25.js`: "the Marrow opens when the Brand tree is full" removed.
  - `rebirth.js`, `mobile.js`, `index.html`: wording (Marrow point, 髄 badge).
- **Art:** `arttree.js` untouched. The screen draws the tree once to an off-screen canvas and redraws it only when something changes; the Heart, the path preview and the selection ring are drawn live. Reduced motion is respected.
- **Unreachable but forged nodes** are drawn like reachable ones at half strength. The art brief's "locked" grey is kept for unforged nodes, so the two can be told apart.

## The screen
- **Phone:** drag to move, pinch to zoom, tap a node to read it, tap again (or the button) to take it and every node on the way.
- **Desktop:** drag, wheel, the same clicks. Arrow keys move, + and − zoom, Enter takes.
- **Path preview:** the cheapest path from what you own, with its cost on the button: "Take · 8 points".
- **Find:** every node whose name, kanji or text matches gets a gold ring.
- **The panel** never covers the node it describes: the view slides.
- **Buttons:** +, −, 髄 (centre on the Heart), Back, and in the Rope-House "Give every point back".

## Tested headless
- **Graph:** 300 nodes, counts per part as in the table, no overlaps, all reachable.
- **Desktop 1280×720 and phone 852×393 (touch):** open, select, take a Brand, take a fork (its sibling shows the red crack), take an 8-point path by button, search, zoom, save, refund refused outside the Rope-House, refund with dependents inside it, Back.
- **Old save:** a v45 level 16 hero with all 15 skills and Marrow points loads with 15 points free, the three Gifts, and the note.
- **Gifts:** a new hero gets Ash Wings after Odo's level and all three after the Preacher's; saved.
- **All 28 levels load** with a tree hero (Brands, notables, two Attunements).
- **Balance lab:** `BAL.roles` runs and is unaffected by the tree.
- **Codex's checks** on the merged code: `tree-qa`, `tree-pictures8-qa`, `tree-attributes9-qa`, `tree-effects-qa`, `tree-combat2-qa` pass.
- **Boot:** no page errors, no missing files.

## Not tested, or still open
- **Co-op with the tree** (two tabs or two networks). The skill list message is unchanged, but nothing was run.
- **Balance:** the small-node numbers are first guesses. The lab has no "tree" option yet (stage 5).
- **Early game is thinner:** about 5 of 9 Brands at level 20, as the plan says. If Pilgrim feels bare, make Brand path nodes free.
- **Chain Warden** always drags foes to you. The plan's "hold Down to swap" isn't built.
- **Fork scaling** with Might/Finesse/Fortitude (plan decision 5) starts in stage 2. Crimson Pact has none yet.
- **Menus by controller or keyboard alone:** nodes can't be picked without a pointer.
- **Missing art:** 60 element and bridge icons (sigils stand in), the two painted backgrounds, three Gift panels, tree sounds.
- **The `audit/` folder** from Codex (73 files, 4.5 MB of review screenshots) is now served on the Pages site.

## Next
1. Stage 2: Grave Slam, Stillness, 17 forks with role scaling.
2. Stage 3: wedge notables, keystones, bridges, the three new combos, Bone Thrall.
3. Stage 4: attribute notables and keystones, Paradox.
4. Stage 5: co-op check, lab "tree" option, balance.
5. Clean-up: fold `loadLevel` (33 layers), `dmgEnemy` (16), `hurtPlayer` (10), `calcStats` (now 10).
