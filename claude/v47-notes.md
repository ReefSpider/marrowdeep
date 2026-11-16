# Marrowdeep v47: the Marrow 髄, stage 2

BT (16 Nov): "let's get it all going", after v46. Branch `feature/marrow-stage2`. Co-op needs `marrowdeep-47`; scripts are tagged `?v=47`; the title shows v47.

## First: co-op on the tree (the check v46 skipped)
Two tabs (`?net=local`), both heroes with trees:
- lobby, start, both on the same level;
- each sees the other's skill list (Brands, forks, Gifts, Chain Warden);
- a node taken mid-run reaches the other player within a second;
- opening and closing the tree mid-run leaves the game running;
- no errors on either side.

Not tested: two real networks.

## What's new for players
223 of 300 nodes can now be taken (205 in v46). All nine Brands and all eighteen forks work.

### Two Brands
- **Grave Slam 墓 (new).** In the air, hold Down and Strike to crash down. Once every 4 s the landing is a Grave Slam: a crater 64 px each way that hits ×1.4 and knocks ordinary foes into the air.
- **Stillness 澄 (was Clarity).** Stand still for a second without attacking and a ward forms. It takes one hit for you. When it breaks, time slows for half a second and your strikes are critical. The old roll-through slow-motion is gone.

### Eighteen forks
Each Brand has two; you hold one. Each scales with the attribute on its tag.

| Brand | Fork | Tag | What it does | Scales |
|---|---|---|---|---|
| Hemorrhage | Crimson Pact | 技 | Three lances | +1% lance damage per 2 Finesse |
| | Heart-Spike | 力 | One lance, ×1.9; opens Bleeding; stuns 0.5 s; fills boss stagger | Stun and stagger +2% per Might |
| The Hound | Black Iron | 耐 | Rage from damage taken; 30% less damage in Hound form | +0.2% per Fortitude, up to 50% |
| | Red Maw | 力 | Rage from every blow; Hound blows open Bleeding | Bleed +0.1% of the blow per Might |
| Grave Slam | Ossuary Crash | 力 | Crater leaves 3 Brittle stacks | +0.4 px radius per Might, up to +40 |
| | Gale Crash | 技 | Foes thrown higher, in the air 1.1 s | Cooldown −0.02 s per Finesse, down to 2 s |
| Iaidō | Thunder Draw | 技 | Wounds open as lightning: Shocked, arcs | Lightning +0.2% of the cut per Finesse |
| | Long Draw | 力 | Hold up to 1 s more: reach 120 → 200 px, damage up to ×2 | None yet |
| Shade Step | Marking Shade | 技 | The shade's copy Marks | Mark +0.03 s per Finesse |
| | Decoy | 耐 | Foes within 110 px of the shade stop and turn to it for 2 s | +0.02 s per Fortitude |
| Thousand Cuts | Rain of Needles | 技 | Ten blades in a row ahead, ×0.3 each, each adds Rotting | Rot +1% per Finesse |
| | Six Executioners | 力 | Six blades, ×0.8 each, all on the nearest foe | +0.5% per Might |
| Funeral Bell | Toll for Me | 耐 | Stunned foes lock on to you; 20% less damage for 4 s | +0.02 s per Fortitude |
| | Drowning Bell | 技 | The toll Soaks | Radius +0.8 px per Finesse, up to 200 |
| Last Breath | Martyr's Breath | 耐 | Allies within 120 px heal 30% | None yet |
| | Vengeful Shade | 力 | The shade deals double and leaves Burning | Burn +1% per Might |
| Stillness | Frozen Stillness | 耐 | The break Chills everything near | Radius 70 px, +0.5 per Fortitude |
| | Hallowed Stillness | 力 | The break calls Judgement on the attacker | +1% per Might |

All numbers are in `BK` at the top of `brands51.js`.

## Where this differs from the plan
- **Grave Slam has no key of its own.** The plan called it an art. The four art keys are taken (Hemorrhage, Red Tether, The Hound, Funeral Bell), and a fifth needs the "choose four in the satchel" screen and a fifth phone button. So it rides on the plunge every hero already has. Your jump is the leap. If BT wants it as a keyed art, the slot picker is the work.
- **Decoy** stops foes and turns them to the shade. It doesn't make them walk to it or attack it: solo foes aim straight at the hero, and changing that means opening the enemy AI.
- **Toll for Me's lock** only matters in co-op. Solo, foes already target you; the 20% still applies.
- **Long Draw and Martyr's Breath** have no attribute scaling yet.
- **Codex's two hero poses** for the slam aren't used. They are a fixed sellsword, not the hero in his gear.

## How it's built
- **`brands51.js`** (new, after `tree50.js`): Grave Slam, Stillness, every fork, and the co-op message for Martyr's Breath.
- **`actors.js`** calls it by name from `castHem`, `performIai`, `thousandCuts`, `updShade`, `die`, the plunge landing and the hero's projectile hits.
- **`tactics.js`:** the live `castBell` is here, not in `actors.js` (that first copy is dead code). The bell forks hook into this one.
- **`tree50.js`:** 18 more nodes forged, fork text rewritten to say what each does, forks give a skill id each.
- **Art used:** `TreeArt.graveSlam` (three variants), `stillness` (form, hold, break, three variants), `heartSpike`, `redMaw`, `longDraw`, `bladeRain` (both), and `remainingEffect` for Toll for Me, Drowning Bell, Martyr's Breath and Vengeful Shade. Thunder Draw uses the game's own lightning.
- **Martyr's Breath in co-op:** a new message `mb`. The host accepts it only from the seat it names, at most one every 5 s a player, and passes it on. The heal amount is fixed on the receiving side.
- **HUD:** "N Marrow points · T".

## Tested headless
Against live foes on the first level, with each fork switched on in turn:
- **Grave Slam:** plain, Ossuary (3 Brittle), Gale (higher, Gale status); nothing on cooldown.
- **Stillness:** forms after a second, absorbs a hit, slows time; Frozen chills three foes; Hallowed hits three foes.
- **Hemorrhage:** three lances; Heart-Spike ×1.9 with Bleeding and a 0.5 s stun.
- **Hound:** Red Maw rage and bleed; Black Iron 21 damage taken against 30 without.
- **Iaidō:** Thunder Draw shocks; Long Draw travels 199 px against 116.
- **Thousand Cuts:** needles add 3 rot stacks; executioners all land on one foe.
- **Shade:** Marking Shade marks; Decoy (with a real roll) stops three foes.
- **Bell:** Toll locks and sets the 4 s guard; Drowning Bell soaks.
- **Last Breath:** Vengeful Shade burns.
- **Regression:** boot (desktop, phone), the v46 tree run-through, two-tab co-op. No errors.

## Not tested
- **How the effects look in play.** They draw without errors, but the test level was under a story fade, so nobody has looked at them in a lit room.
- **Martyr's Breath between two players.**
- **Balance.** Every `BK` number is a first guess. Grave Slam makes foes airborne, and airborne foes take the red finishing blow, so it may be too strong.
- **Phone:** Down + Strike in the air on the stick.

## Next
1. Stage 3: wedge notables, keystones, bridges, the three new combos, Bone Thrall.
2. Stage 4: attribute notables and keystones, Paradox.
3. Stage 5: lab "tree" option, balance.
4. Clean-up: fold the wrapper stacks; remove dead first copies such as `castBell` in `actors.js`.
