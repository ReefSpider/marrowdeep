# Marrowdeep v36: slower levelling

Commit 741030d on main. Edits in actors.js and bal34.js. Co-op protocol unchanged (`marrowdeep-35`). Title shows v36.

## Feedback
"The levels are going up way too fast, I was level 3 after a few mobs." (BT, 9 Nov)

## Cause
The XP curve was 30 + 22 × (level − 1)^1.45, and an ordinary Pilgrim kill is worth ~16 XP (×2.6 Pilgrim XP from v18). Level 2 came after 3 kills, level 3 after 5, level 5 after ~22. The v34 falloff only started 2 levels above the monsters, so in the Quiet Fields (monster level 2) nothing slowed you until level 4.

## Changes
- **XP curve:** 260 + 50 × (level − 1)^1.45. The early levels cost far more; later levels cost ~2.3× more, which the falloff mostly absorbs.
- **Falloff:** full XP up to 2 levels above the monsters, then 62%, 25%, and 2% from 5 above (was −20% a level, floor 5%). The tier XP multiplier is large enough that the old floor still let you run 5–6 above the monsters on deep tiers.

## Measured (headless replay of the first report's kill counts, a ghoul/husk/brute mix)
| | v35 | v36 |
|---|---|---|
| Level-ups at kill | 3, 5, 7, 12, 22 | 11, 23, 37, 56, 113 |
| After the Quiet Fields (monster level 2) | 8 | 5 |
| After the Lower City (11) | 17 | 14 |
| At the Count (21) | 25 | 23 |
| Ashen, the Count (30), starting at 23 | 37 | 34 |
| Asura, the Count (86), starting at 70 | 92 | 91 |

All 28 maps and every boss still run on Pilgrim and Marrow's End with no errors.

## Open
- Deep tiers still sit 4–5 above the monsters because each kill there is worth 40× a Pilgrim kill (`xpMul`). If that matters in play, the next knob is the tier XP multiplier in meta.js.
- Existing characters keep their level; their next level costs more.
