# Marrowdeep v42: Pilgrim's middle bites back

BT (9 Nov, two co-op playtest reports, fresh Pilgrim run on v41): "ok so we are too op again in act 2".

Everything is in `early44.js`, after hard43.js. The `E44` object holds the numbers. Co-op needs `marrowdeep-42`; scripts are tagged `?v=42`. Merged through the new branch `balance/act2`.

## What the reports showed
- **Bosses:** from the Black Camp on, they died in 2–7 s (the Gate of the Last Light in 2) and landed 0–2 hits.
- **Ordinary foes:** they hit for about 3, so it took 66–78 blows to go down. Lowest life on most visits was 67–97%.
- **Gear:** both players had a unique or legendary by level 10 (Zweihander U13, War Scythe L11). The partner's sheet DPS jumped ×3.1 in one change at the Black Camp.

## Cause (lab, Pilgrim)
- **Damage gap:** a unique kit did ×2.8–3.3 the damage of a rare kit and took twice the hits to die.
  - Swapping only the armour and helm to unique took a rare kit from 241 to 430 DPS.
  - The source was each unique's **signature damage type**: it reached its top tier at item level 8 (×1.2 on top), so Ironheart and Hollow Crown each added about 15 flat damage per hit while early weapons hit for 5–11. Rares never roll damage types.
- **Defense cap:** unique armour hit the 80% defense cap against level-9 monsters. A blow is weighed against 1.15 × monster level + 43, which is small that early.
- **Rares too:** even a rare kit took 20–25 ghoul hits to die.

## Changes
1. **Signature damage types:** they reach their tiers at item levels 8 and 16 (were 4 and 8). On anything that isn't a weapon they're half size.
   - Saved uniques and abyssals move to the new range once on load, keeping how good the roll was (`rebudget44`, flag `v44`).
   - Example at item level 10: Ironheart fire 18 → 5, Hollow Crown shadow 18 → 5, Gravedigger cold 18 → 10.
2. **Pilgrim ramp:** from monster level 5 to 10, ordinary foes and bosses ramp up to ×1.6 damage and ×1.25 life, and stay there to the end of the campaign.
3. **Pilgrim defense:** it is weighed against an extra 5 × monster level, ramping in with the rest. At level 9 a 215-defense kit takes 31% of a blow instead of 20%.

## Lab (BAL.row, K=24, solo, player 2 above monster level), before → after
| Monster level | Rare kit: ghoul hits to die | Unique kit: ghoul hits to die | Unique kit DPS |
|---|---|---|---|
| 3 | 15.5 → 17.5 | 41 → 43 | 377 → 200 |
| 7 | 21 → 14 | 44 → 27 | 772 → 523 |
| 9 | 23 → 11 | 48 → 26 | 826 → 570 |
| 11 | 25 → 10 | 41 → 19 | 981 → 993* |
| 15 | 25 → 9 | 35 → 18 | 1219 → 962 |
| 21 | 21 → 7 | 29 → 14 | 1920 → 1296 |

\*Noise, K=24.

| Bosses | Before | After |
|---|---|---|
| Hits to die (rare kit), monster level 9–21 | 13–16 | 5–6 |
| Unique kit fight length | 4–7 s | 7–14 s |
| Rare kit fight length | 15–20 s | 16–21 s |

Co-op boss life is ×1.75 for two heroes, so co-op fights run about as long as solo.

## Still open
- Legendary and unique kits are still ×1.5–2 rare in survivability through unique defense (Ironheart's enhanced defense). Watch the next report's hits-to-kill-you column.
- Ashen (monster level 20–30) has neither this ramp nor hard43's (which starts at 30).
