# Marrowdeep v48: the Marrow 髄, stage 3

BT (16 Nov): "Go for it", after v47. Branch `feature/marrow-stage3`. Co-op needs `marrowdeep-48`; scripts are tagged `?v=48`; the title shows v48.

## What's new for players
273 of 300 nodes can now be taken (223 in v47). All ten damage-type wedges and all ten bridges work. Three new combos exist only in the tree, and there is one new creature.

### The wedges

| Type | Notables | Keystone |
|---|---|---|
| Fire | **Wildfire:** ground fire spreads to both sides, lasts 1 s longer. **Pyre Walker:** in your own fire you can't burn and swing 10% faster. **Cinder Heart:** heavy blows on a Burning foe blast those near it. | **Funeral Pyre:** Burning doesn't tick; when it ends, all of it lands at once ×1.5 and spreads. |
| Cold | **Deep Winter:** two chills freeze. **Hoarfrost:** 4% less damage taken per frozen foe near you, up to 20%. **Glacial Shards:** ice shards chill. | **Permafrost:** bosses freeze for 0.8 s, once every 12 s; cold deals 30% less. |
| Lightning | **Forked Path:** each arc jumps once more. **Grit Siphon:** 1 grit per arc. **Static Skin:** Shocked foes that hit you take lightning back. | **Storm Conduit:** no arcs; charge is stored on Shocked foes and a critical strike lets it all go, each charged foe taking half the total. |
| Water | **Tidebreak:** a wave runs six tiles along the floor, shoving and Soaking. **Undertow:** water pulls foes to you. **Rising Tide:** +3% damage per Soaked foe near you, up to 15%. | **Deluge:** Soaked lasts 12 s and Soaked foes take 25% more; water deals no damage. |
| Wind | **Cyclone:** hurled foes hit what they fly through. **Eye of the Storm:** +15% run speed with three foes in the air. **Downdraft:** a heavy blow slams an airborne foe down into a crater. | **Tempest:** wind lifts foes straight up and holds them 1.2 s; it never throws them away. |
| Poison | **Virulence:** rot stacks to eight. **Contagion:** death clouds pass on half the stacks. **Slow Decay:** Rotting foes deal 15% less. | **Necrosis:** rot stacks without limit; each stack adds 60%. |
| Holy | **Litany:** Judgement every third hit. **Sanctuary:** Judgement leaves ground where you take 15% less, for 4 s. **Zealot's Fire:** Judgement leaps to the nearest Sanctified foe. | **Inquisitor:** ×3 to ranked foes and bosses, half to ordinary ones. |
| Shadow | **Long Shadow:** Marks last 10 s and pass on at a kill. **Unseen:** killing a Marked foe hides you 1.5 s; your next blow +50%. **Bloomreaper:** blooms 40% bigger. | **Night Has Teeth:** a Marked foe under 25% blooms at once and dies; no bloom on death. |
| Blood | **Open Veins:** bleeds build twice as fast. **Sanguine Shell:** bleed healing past full life becomes a shield, up to 20% of life. **Gusher:** a critical strike pours out 2 s of the bleed. | **Blood Price:** bleeds heal double; regen and draughts heal half. |
| Bone | **Spur:** shards pierce. **Bone Plate:** a splinter near you gives a plate that takes one hit (up to 3). **Brittle Frame:** Brittle stacks to seven; the splinter hits 40% harder. | **Ossuary:** each splinter raises a Bone Thrall for 8 s (up to 3). |

### The bridges
| Bridge | What it does |
|---|---|
| Nightshade (Shadow · Poison) | Rot Bloom clouds Mark what stands in them |
| Pestilence (Poison · Wind) | Plague Wind reaches 220 px, not 110 |
| Squall Line (Wind · Lightning) | Thunderhead leaves ordinary targets airborne |
| Wrath of Heaven (Lightning · Holy) | Judgement-combo pillars stun 1 s, not 0.6 |
| **Pale Light 白光 (Holy · Cold), new combo** | Holy on a Frozen foe calls Judgement; shatters it under 30% life |
| Glacier (Cold · Water) | Flash Freeze reaches 180 px, not 90 |
| **Drowned Bones 沈骨 (Water · Bone), new combo** | Bone on a Soaked foe roots it 1.5 s; Brittle stacks double |
| Marrowmonger (Bone · Blood) | Marrow Rend heals 5% of the bleeding it opens |
| Scald (Blood · Fire) | Boiling Blood sets everything near Burning |
| **Black Flame 黒炎 (Fire · Shadow), new combo** | Fire on a Marked foe Marks and burns everything near it |

The three new combos are in the Codex with the other 28, shown once witnessed, marked "Tree only".

### The Bone Thrall
A skeleton of splinters that rises where a foe splintered, walks to the nearest foe within 170 px, and swings every 0.9 s for half your weapon's average. It doesn't jump or cross gaps, and foes ignore it. Eight seconds, then it crumbles.

## Where this differs from the plan
- **Tidebreak** isn't stronger over standing water. Levels have no standing water yet (plan section 5).
- **Sanctuary** protects only the hero who called it, not allies.
- **Unseen** makes you untouchable for 1.5 s. The plan says "foes lose you"; solo foes aim straight at the hero, so this is the nearest thing without opening the enemy AI.
- **Deluge:** Soaked foes take 25% more from everything, not "from every other type". Water itself deals nothing, so it comes to the same.
- **Black Flame** Marks and burns the foes near at once. It isn't a burn that keeps spreading.
- **Necrosis** doesn't show a number over five stacks. Codex drew one (`TreeArt.rotStacks`); it isn't wired.
- **Plan section 5 (levels built around the tree)** is not started: shrines, ground that plays with types, regions that resist, Gift routes. Codex's props for it are delivered.

## How it's built
- **`wedges52.js`** (new, after `brands51.js`): everything with its own state or timing. Tide wave, Sanctuary ground, Zealot's leap, Mark passing, Unseen, plates, shell, thralls, Cinder Heart, Gusher, Storm Conduit's discharge, Downdraft, Night Has Teeth, Hoarfrost, Static Skin, Slow Decay, the three tree combos. Numbers in `WK`.
- **`elements.js`** reads the tree directly through `TW(id)` wherever a node only changes a number in the rules: freeze threshold, stack caps, combo reach, mark length, holy multipliers, Funeral Pyre, Permafrost, Tempest, Deluge. 31 small edits.
- **Stat bonuses that come and go** (Pyre Walker, Rising Tide, Eye of the Storm, Unseen) go through `dynSet`, so `calcStats` can run at any time without losing or doubling them.
- **`tree50.js`:** 50 more nodes forged; 13 texts rewritten to say what is built.
- **Art used:** `tidebreak`, `boneThrall` (five poses), `sanguineShell`, `shieldBar`, `bonePlate`, `paleLight`, `drownedBones`, `blackFlame`, and `graveSlam` (gale) for Downdraft.

## Tested headless
Each node switched on alone against live foes, with the result read back from the game:
- **Fire:** 3 flames for 1 with Wildfire; Funeral Pyre holds 10/s for 3 s then lands 45 and sets two neighbours Burning; Cinder Heart hits two neighbours; Pyre Walker +10% attack speed in fire, gone outside it.
- **Cold:** two chills freeze with Deep Winter, not without; a boss freezes 0.8 s and not again; 8 chilling shards; Hoarfrost 46 taken against 50.
- **Lightning:** Forked Path reaches a fourth foe; 4 grit; Storm Conduit stores 120 on two foes and a crit hits both for 138; Static Skin 55 back.
- **Water:** Tidebreak soaks and hits four in a line; Undertow pulls; Rising Tide +9% with three; Deluge 12 s, no water damage, +25%.
- **Wind:** Tempest holds a foe 21 px up after 0.6 s; Eye +15%; Downdraft craters three; Cyclone hits the foe flown through.
- **Poison:** 5, 8 and 12 stacks (plain, Virulence, Necrosis); Contagion passes 2 of 4; Slow Decay 43 against 50.
- **Holy:** Judgement on the third hit; one Sanctuary; Zealot's leap; Inquisitor 300 ranked, 50 ordinary.
- **Shadow:** 10 s Marks; the Mark passes; Unseen +50% then spent on the next blow; Night Has Teeth kills at 20% and the bloom hits the rest.
- **Blood:** 2 stacks for 1; a 25-point shell that absorbs a 10 hit; Gusher 110; Blood Price halves regen.
- **Bone:** six stacks hold, the seventh splinters, shards pierce; a plate absorbs a hit; a thrall rises, walks and hits three times; never more than 3.
- **Bridges:** Pale Light does nothing without the bridge; with it the foe shatters. Drowned Bones roots 1.5 s. Black Flame Marks and burns all three.
- **Looked at:** one close-up in play with the shield bar, three plates, the blood film, Sanctuary and a thrall mid-swing. They read clearly.
- **Regression:** boot (desktop, phone), tree run-through, forks, two-tab co-op, v45 save migration, all 28 levels load, the balance lab. No errors.

## Not tested
- **Co-op with wedge nodes.** The session runs without errors, but which player's tree applies when two heroes hit the same foe was not looked at.
- **Balance.** Every `WK` number is a first guess. Watch Unseen, Storm Conduit, Night Has Teeth and Ossuary first.
- **How the other effects look in play:** Tidebreak, the three combos, Downdraft.
- **Frame rate** with three thralls and a room of statuses on a phone.

## Next
1. Stage 4: 15 attribute notables, 3 attribute keystones, Paradox.
2. Stage 5: lab "tree" option, balance, co-op with wedges.
3. Levels built around the tree (plan section 5), using Codex's props.
4. Clean-up: fold the wrapper stacks.
