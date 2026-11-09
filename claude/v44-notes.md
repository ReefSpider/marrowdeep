# Marrowdeep v44: bosses you have to read, and every kind of item has a unique

BT (10 Nov, two co-op reports on v42): "way too easy and the bosses were soooo easy … make them like you need to think about it, can damage them when they are doing some mechanics … these ones you can just rush and smack them down so fast. also items feel like i keep seeing the same ones … didn't hit a bow or hammer once … the same sword over and over again for unique, are there equal items for each item type in each rarity?"

Three branches, all merged into main:
- `bosses/guard` (5715464)
- `items/uniques` (379a33f)
- `items/jewellery-abyssal` (652fc04)

Co-op needs `marrowdeep-44`; scripts are tagged `?v=44.2`.

## Bosses: guard 構え and opening 隙 (`boss47.js`, `BGU` holds the numbers)
- **What the reports showed:** Act III Pilgrim bosses died in 2–8 s in co-op, mostly without landing a hit.
- **Guard:** a boss is on guard by default. It takes 10% damage (dull clang, grey sparks), and stagger builds at 20% of the usual rate.
- **Opening:** when an attack pattern ends (`endPat`), the boss is open for 1.4 s, then 1.1 s in phase 2 and 0.9 s in phase 3.
  - It can't start the next attack, its body doesn't hurt to touch, and it takes 125%.
  - The tell: red corner brackets, 隙 over its head, a bell, and the life bar reads 隙 · open (otherwise 構え · guarding or 崩し · broken).
- **Parry:** parrying a boss's blow opens it for 2 s.
- **Stagger:** a broken boss (崩し) still takes 150%. After a break its stance can't break again for 5 s; steady hitting used to keep bosses broken for 25–50% of a fight.
- **Damage over time:** burn, rot and bleed land in full, guarded or not.
- **Pilgrim bosses** from Act II on carry 60% more life (`pilRamp`).
- **Co-op:** the host broadcasts openings (`bo`). Each player's blows are scaled on their own side, and the host receives the scaled amount.
- **Simulation:** all 13 bosses, 40 s each, hero untouchable, phase 1.

| | Damage dealt (×) | Share of fight open | Share of fight broken |
|---|---|---|---|
| Swinging nonstop | ×0.69 | 51% | 21% |
| Swinging only when open | ×1.28 per swing, total DPS about 0.93× the rusher's | | |

  Rushing now earns about 10% more damage than reading, while standing in every attack. Before, stagger alone gave rushers ×1.15 or more.
- **Knobs:** `BGU.guard`, `open`, `win`, `parryWin`, `stagGuard`, `stagLock`, `pilHp`.

## Uniques (`items48.js`)
Before, there were 21 uniques. Two-handed swords had two (Widow's Promise and Grave Mother), and these had none:
- one-handed swords, spears, maces, mauls, great axes, cleavers and war hammers;
- light and medium body armour and light hoods;
- medium gloves and medium boots.

Rings and amulets had one unique each, and a unique was picked evenly from the whole list.

- **15 new uniques:** each has a flavour line and a signature damage type.

| Unique | Base |
|---|---|
| Oath of Ash | Arming Sword |
| The Long Goodbye | Glaive |
| Confessor | Flanged Mace |
| Gravel Saint | Maul |
| Headtaker's Wage | Great Axe |
| Hunger Moon | Butcher's Cleaver |
| The Nail and the Word | War Hammer |
| Mantle of the Last Hunt | Hunter's Coat (light) |
| Hollowmere Colours | Brigandine (medium) |
| The Quiet Hood | Ranger's Cowl (light) |
| Ferryman's Palms | Scale Gauntlets (medium) |
| Pilgrim's Last Mile | Mail Chausses (medium) |
| Widow's Band | ring |
| The Saint's Knuckle | ring |
| Lantern of the Drowned | amulet |

  There are now 36 uniques, and every weapon kind (class and hands) and every armour slot in every family has at least one.
- **Picking a unique or abyssal:** by kind first, so each weapon kind and armour slot/family is equally likely; then an item inside it, weighted away from recent finds by loot memory. Chest kinds are honoured (weapon chests give only weapon uniques). This replaces the old double re-pick by play37 and play38.
- **Weapon variety:** loot memory leans three times harder toward weapon classes you haven't seen (`LM_K.cls` 1 → 3). Crossbows come down from ×3 to ×2 (×4 on the Way).
- **Simulated with loot memory:**
  - all 36 uniques seen; 27 different ones in the first 40 unique drops;
  - two-handed swords down from about 15% to 4% of uniques;
  - every weapon class 6–10% (hammer 7%, crossbow 10%).

## Jewellery bases and abyssals (`items49.js`, loads after the art files)
- **Rings:** Iron Ring, plus Copper Band (0), Signet (4), Bone Ring (6), Silver Ring (10) and Black Iron Seal (15).
- **Amulets:** Bone Amulet, plus Saint's Medal (3), Prayer Beads (7), Iron Locket (11) and Crow Talisman (15).
- **Jewellery icons:** each new base has its own pixel icon (an `artEquipmentIcon` wrapper; the gem or charm takes the item's damage-type colour). Bases carry no stats. A drop picks among the three newest the item level reaches (unchanged rule), so early jewellery looks different from late.
- **Abyssals:** 5 → 14, so every slot has one now.

| Abyssal | Base |
|---|---|
| The Last Verdict | Arbalest |
| The Gallows Pole | Halberd |
| Ninefold Night | Kris |
| The Bell of Kesh | Great Hammer |
| Hollowmere Unbroken | Pavise |
| Hands of the Hanged | Plate Gauntlets |
| The Walk Home | Shadow Treads |
| The Ninth Wage | Black Iron Seal |
| Skin of the Fox | Shadow Leathers |

  Simulated abyssal drops spread evenly (79–114 each over 1,400).
