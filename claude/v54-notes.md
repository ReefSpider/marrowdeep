# Marrowdeep v54: the Crowspire

BT (18 Nov): "I need the endgame mode now but also add it in for any level to do from the house … an endless tower and the higher you get the more loot … every level gets 10x harder … a good scale so it's worth it to go higher for better rolls." Then, mid-build: "drop it as one chest inside your house with the odds of that chest all being added to … level 1 you only get 1 grey chest … level 1000 or something crazy, like 50/50 abyssal."

Everything is in `spire61.js` (loaded after bosses60.js). Branch `feature/crowspire`. Co-op needs `marrowdeep-54` (a new level slot at the end of `LEVELS`). Scripts are tagged `?v=54`; the title shows v54.

## The place
Ilse already says it: the crows bring things up from the Pit. Behind the Rope-House they have built a tower of scaffold, bone and stolen timber to keep it all in. The higher the nest, the older the hoard. It has no top.
- **The way in:** a rope ladder through a hatch in the Rope-House ceiling, between the map table and the altar (`CAB.spire = 25`), with a crow on a rung. Open from the first visit, at any level. Solo only (hidden in co-op).
- **A floor:** one sealed room, 40 tiles, in one of five layouts (scaffold, two tiers, broken stair, pillars, nests). The foes, palette and music come from one of the Pit's regions in turn (the crows carried them all up). Through the tall windows the ground falls away as you climb, and the clouds come up past floor 6. Crows sit on the ledges and scatter when you get close or a wave starts.
- **Three waves, then quiet.** The last wave brings a rare. Every fifth floor is a **roost**: its last wave brings a **Keeper** (the heaviest foe on the floor, ranked unique; ×1.5 more life on every tenth floor). Next time you can start the climb from your highest roost.
- **One life.** At the stair: climb on, climb down with the hoard, or not yet. Pause → Jump down leaves at once but forfeits the hoard unless the floor is quiet.

## The prize: the Crow's Hoard
Nothing drops on the floors (no chests, no elite chests; gold and XP still do). The climb builds **one chest**, and its odds are a curve on the highest floor cleared this climb.
- **Climb down** and it falls through the hatch into the Rope-House, by the ladder. It waits there (saved in `META.spire.hoards`) until opened; several wait in a queue, one on the floor at a time.
- **Fall**, or jump from a floor still fighting, or quit mid-climb: the crows keep it.
- **Opening it** uses the normal case reel. The case shows the hoard's rarity odds plus its Max-grade and Abyssal-grade stat odds. The item keeps the monster level it was won at (not the house's level 1). Its tooltip says which floor it came from.

### The scale
Read on a log scale between these anchors (`HOARD_R`, `HOARD_G`), held after floor 1000. Rarity odds are as written, moved only by your magic find.

| Floor | Chest | Rare | Legendary | Unique | Abyssal | Max-grade stats | Abyssal-grade stats | Item level |
|---|---|---|---|---|---|---|---|---|
| 1 | grey coffer | 2% | – | – | – | 7% | 0.4% | +0 |
| 3 | grey coffer | 9% | 0.8% | 0.2% | – | 14% | 2% | +2 |
| 5 | bone reliquary | 17% | 2% | 1% | ~0 | 18% | 3% | +3 |
| 10 | bone reliquary | 33% | 7% | 6% | 0.02% | 22% | 4% | +4 |
| 20 | tithe hoard | 42% | 12% | 13% | 0.3% | 32% | 9% | +6 |
| 50 | tithe hoard | 42% | 20% | 22% | 2% | 40% | 18% | +8 |
| 100 | the Crow King's hoard | 35% | 24% | 30% | 6% | 45% | 26% | +9 |
| 250 | the Crow King's hoard | 24% | 22% | 36% | 18% | 43% | 35% | +11 |
| 500 | the Crow King's hoard | 12% | 16% | 38% | 34% | 42% | 43% | +13 |
| 1000 | the Crow King's hoard | 4% | 8% | 38% | **50%** | 40% | **50%** | +14 |

For comparison, the Pit's Bone Reliquary is 28% rare / 2.4% unique and a Tithe Hoard 48% / 16%. A floor-10 hoard sits between them; floor 20 is a Tithe Hoard with real abyssal odds.

## The difficulty
"10× a floor" taken literally makes floor 4 a thousand times floor 1, and no gear can follow, so it's **10× every 10 floors**:
- **Foe life ×1.26 a floor** (×10 at floor 11, ×100 at 21, ×1,000 at 31). **Damage ×1.08 a floor** (×2.2 every 10).
- **More of them:** 4/6/8 foes a wave on floor 1, up to 7/9/11 by floor 20. **More elites:** champion chance +1.2% a floor (up to 55%), rare +1% (up to 40%).
- **Floor 1 is two levels under you**, like the campaign, so a level-3 hero and a level-90 hero both start somewhere fair. The tier's traits follow that level's band (Pilgrim below 20).
- **XP +15% a floor, gold +25% a floor.** Clearing a floor heals a quarter and tops potions up to two.

What that means, from the v41 lab figures (not measured in the tower, so treat it as a guide): a unique kit at monster level 60 kills a ghoul in ~0.8 s and takes ~9 of its hits. Floor 10: ~7 s and ~4 hits. Floor 15: ~21 s and ~3 hits. Expect most players to wall somewhere between floors 10 and 16, and better hoards to push that a floor or two. Floor 1000 is there for the curve, not because anyone will see it.

## Tested headless
- **The ladder** shows in the Rope-House with its label; the card offers floor 1 and the highest roost.
- **36 floors in a row** at level 60, every region's foes and every layout: three waves each, a rare on the last, Keepers on 5/10/15…, no chests anywhere, no errors.
- **The hoard:** clear 7 floors, climb down, the hoard falls through the hatch, the prompt reads "Open the Crow's Hoard · floor 7", the case shows floor-7 odds and the item carries floor 7's monster level and its tag. Saving with a hoard waiting keeps it.
- **Falling** on floor 2 with a floor-1 hoard: the death card says the crows keep it, you wake in the house, no hoard.
- **Saving mid-climb** writes you into the Rope-House, never into the tower.
- **Regression:** every campaign level and the Rope-House load with no errors. Desktop and phone sizes looked at.

## Not tested
- **Play.** Every number above is a first guess. Knobs: `SPIRE.life`, `SPIRE.dmg` (difficulty), `HOARD_R` and `HOARD_G` (the prize).
- **The wall.** If players stop at floor 8, try `SPIRE.life` 1.2 (×6 every 10 floors).
- **One item a climb** may feel stingy for a long climb. If so, the hoard could roll a second reel every N floors.
- **Co-op:** the tower is solo; the ladder hides in co-op.

## Next
1. BT climbs it.
2. Floor modifiers (an omen per floor: darkness, a second Keeper, crows that steal potions) so floors feel different past the roster.
3. A leaderboard line on the title screen: best floor per character.
4. Act III's bosses on their own ground (carried over from v53).
