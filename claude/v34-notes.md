# Marrowdeep v34: scaling, from the first playtest reports

Commit d8e1c22 on main. New module **bal34.js** (after lab32.js, before mobile.js). Edits in items.js, data.js, meta.js, actors.js, bosses.js, dps32.js, lab32.js. Co-op protocol `marrowdeep-34` (foe life and item stats changed). Title shows v34.

## What the reports said
- Report 1 (Pilgrim → Ashen → Mourning, Giant's Grip): zero deaths. Level 44 at the Count against monster level 21. Hits to kill you 25–78. Act III bosses on Ashen died in 3–8 s, on Mourning in 2–6 s, while Odo and the Sisters on Ashen took 25–60 s.
- Report 2 (Asura, Avīci, Marrow's End; Battō, Twin Crossbows, Giant's Grip): 7 deaths in ~150 level visits. Bosses on Marrow's End 5–25 s (the Mother 0–2 s). No gear telemetry (older build).

## Two bugs (both left over from the 3-act reorder in v24)
- **Boss tier scaling divided by the old level index** (meta.js): `hs(D)/hs(lvlIdx)` instead of `hs(D)/hs(dep(lvlIdx))`. With 28 maps the Mother (index 22), Saint and Count were divided by a depth of 22–26 instead of ~8–10, so on every tier above Pilgrim they had about a quarter of their life and hit softer the later they came. This is what both reports show.
- **Kill XP multiplied by the old level index** (actors.js): ×(1 + lvlIdx × .12) = ×4.2 by Act III instead of ×2.2. A headless replay of report 1's kill counts reproduced it: level 11 after the Quiet Fields, 44 at the Count (the report: 8 and 44). Same leftover fixed in the Tithe anchors and Saint reliquaries.
- Not changed: gold drops from ordinary kills, the Debtor and the Beckoning Cat still use the level index (gold ~2.7× what v24 meant late in the campaign). Flagged for the economy pass.

## Changes
1. **XP falls off above the monster level** (bal34.js): full XP up to 2 levels above, −20% per level after, never below 5%. Replay: level 26 at the Count (was 44); ~4–5 above the monsters through the campaign.
2. **Rarity budget** (items.js `BUD`, data.js):
   - Abyssal grade +10–25% over the top of a range (was +50–100%).
   - Signature damage type rolls at the tier its item level reaches (was always top tier; three times the weapon at item level 1). Abyssal ×1.3 (was ×1.5).
   - Unique ED ×0.55, abyssal ×0.55, and both grow into full size by item level 12 (`edScale`). Unique affixes ×1.1 (was ×1.2). Abyssal base floor ×1.1 (was ×1.2).
   - Uniques on a base above their item level now hit like the best base the item level reaches (Bellbreaker at item level 2 kept the Great Hammer's damage).
   - The Unpaid Debt: ED 100–140 (was 380–500), crit 12–18 (28–40), attack speed 10–16 (20–30), life stolen 8–12. Mujō: ED 95–130 (360–480), lightning 14–24 (30–55), crit 12–18, attack speed 10–16, life stolen 6–10.
3. **Weapon classes within ±9%** of each other per hand (bal34.js wraps `fin`): a class's best base at an item level is scaled to the median of its hand, credited for reach (spears ×0.95) and stun (hammers ×0.92, two-handed maces ×0.95). Bases inside a class keep their order. At item level 51: one-handers 403–783 → 654–715, two-handers 689–1669 → 1072–1173.
4. **Defense against the monster level**: a blow is cut by def ÷ (def + 1.15 × monster level + 43), at most 80% (was 100 ÷ (100 + 2 × def), no level, no cap). A rare kit sits at ~70% at every level; unique armour reaches the cap.
5. **Ashen seam and deeper tiers** (ordinary foes): ×1.22 life above Pilgrim plus 1% a tier, 2% more damage a tier. Pilgrim's last ghoul 475 life → Ashen's first 444 (was 361).
6. **Old saves**: items saved before v34 are rebudgeted once on load (`rebudget`, keyed by a `v34` flag every saved item now carries): a unique's or abyssal's own stats take the new ranges at the same relative roll, the signature type takes its item-level tier, Abyssal-grade stats move into the new band. The two extra legendary stats on a unique are left alone. Tested with items made by the v33 build: an item level 90 abyssal weapon 33–38k → 6.4–6.7k sheet DPS, the same as a fresh v34 one.

## Measured (balance lab, 80 kits per point, hero 2 above the monsters)
| | Pilgrim m21 | Ashen m22 | Mourning m52 | Asura m84 | Marrow's End m99 |
|---|---|---|---|---|---|
| Ghoul life / hit | 475 / 64 | 444 / 70 | 1,787 / 205 | 5,539 / 486 | 8,571 / 700 |
| Rare kit: seconds to kill a ghoul | 0.8 | 0.65 | 0.9 | 1.2 | 1.6 |
| Rare kit: ghoul hits to die | 17 | 17.5 | 11 | 8 | 6 |
| Unique kit × rare (was) | ×1.8 (×2.6) | ×1.6 (×2.6) | ×1.7 (×2.5) | ×1.5 (×2.2) | ×1.5 (×2.0) |
| Abyssal weapon × rare (was) | ×2.6 (×13) | ×2.4 (×14) | ×2.3 (×12) | ×2.1 (×12) | ×2.4 (×12) |

Legendary ×1.1–1.4, stale gear ×0.5. Uniques at monster levels 1–7 are still ×2.4–2.9 (rare drops early; left).

Bosses, seconds of pure swinging with a rare kit (unique kit): Pilgrim 14–26 (5–12) unchanged · Ashen 24–52 (13–24), was 7–26 · Mourning 27–55 (15–30), was 10–38 · Marrow's End 34–72 (26–53), was 11–49. Boss hits to kill a rare kit: Pilgrim 9–13, Ashen 7–9, Marrow's End 4–5. Real fights run 1.5–4× the pure figure.

## Regression (headless)
All 28 maps load on Pilgrim, Ashen, Mourning and Marrow's End; every boss runs through all three phases to death on all four; no errors. The lab now has `BAL.bosses()`.

## Open
- Abyssal kits land ×2.1–2.6 a rare, above the ×1.9 target; both abyssal weapons are two-handers, so the mixed-hand comparison overstates it. Next knob: `BUD.edA`.
- The harder deep tiers (6 ghoul hits, 4–5 boss hits with a rare kit at Marrow's End) need a real run. Report 2's player will feel the abyssal rebudget most.
- Combinations aren't touched: report 2 saw Rot Bloom 4,170 times and Quench (an F combo) 2,961 times.
- The playtest report only records balance rows from v32 on; ask testers to update before the next round.
