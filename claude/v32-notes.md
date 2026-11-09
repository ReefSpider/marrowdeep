# Marrowdeep v32: measuring balance (DPS meter, telemetry, balance lab, both hands on hold)

Commit 8822a62 on main. New modules after coop31.js, before boot.js: **dps32.js · hands32.js · lab32.js**. Co-op protocol unchanged (`marrowdeep-31`). Title shows v32. Write-up with charts and a playtest-report reader: https://claude.ai/artifact/VzyQyDvnDSv74vJhnS1kq9 (also `tools/balance-lab.html`).

## Both hands on hold (hands32.js)
- `dualMelee` now covers Giant's Grip with a two-hander in the main hand (it only alternated with a one-hander there) and Twin Crossbows (both fire from the held left button; right-click still fires the off hand alone).
- An off-hand weapon you're too low a level for is skipped (it used to swing for 0).
- Two plain one-handers already alternated in every headless test (held mouse, held J, running, Battō, Kaeshi). Open: ask BT which pair failed.
- Note: holding alternates hands, so a weak off hand lowers sustained DPS. The comparison shows this.

## Off-hand comparison (hands32.js)
- A one-hander (or a two-hander under Giant's Grip) gets a second block, "In your off hand · compared with X": DPS, main/off DPS, off-hand damage, attack rate.
- Every comparison now leads with DPS (sheet), with the % change.
- A tooltip too tall for the screen puts its comparisons in a column beside the item.
- The satchel's stat list shows DPS (sheet), and the off hand's when it swings.

## DPS meter (dps32.js)
- Beside the arts bar: last 3 s, fight average, fight peak, and the split main (pale) / off (blue) / other (red: DoTs, combinations, hazards, Cassian).
- Reads foes' life frame by frame, so it counts everything. Strikes and bolts are attributed by hand.
- Settings › Display › DPS meter (on by default).
- `sheetDps()`: worn gear on paper, holding attack, every swing landing; crit and damage types averaged; grit, misses, rhythm, combinations and Way procs left out.

## Telemetry (dps32.js → playtest report, F8)
- Per level visit: monster level, your level in → out, worn item level, sheet DPS in → out, real DPS while fighting, peak, median seconds to kill an ordinary foe, their median hit, hits to kill you, damage taken per fighting minute.
- Every gear change with sheet DPS and effective life before/after; "big gear jumps" (×1.5+) listed in the report.
- A timeline sample every 30 s (`marrowdeep.baltl`, 480 kept).
- All in the RAW line; paste it into the lab page's reader.

## The balance lab (lab32.js, tools/lab)
- `BAL.run({tiers,K})`: per tier and monster level, rolls K kits per profile with the game's genItem, prices them with calcStats + sheetDps, builds ghoul/husk/brute with mkEnemy (all wrappers). Profiles: stale (magic, 10 levels old), magic, rare, legendary, unique, abyssal weapon. Hero 2 levels above the foes.
- Run headless with `tools/lab/run-lab.js` (Playwright + Chrome).

## Findings (v32 run, 60 kits per point)
- **Level curve holds:** a rare kit kills a ghoul in 0.6–1.3 s from monster level 1 to 100.
- **Rarity spread breaks it:** unique kit ×2–×9 a rare kit's DPS (×9 at monster level 1), abyssal weapon ×11–×38. Legendary ×1.1–×1.7. Stale gear ×0.4–×0.7 (barely a penalty).
- Causes, by size:
  1. `signatureElem` rolls the top tier of a damage type at any item level (×1.2 unique, ×1.5 abyssal). Early-game blowout.
  2. Abyssals stack ED 380–500%, best base ×1.2, crit, speed and a ×1.5 type.
  3. Uniques: uniqueFloor ×1.05 + empower ×1.2 + two extra legendary stats + signature type.
  4. Abyssal grade rolls 1.5–2× the top of a range.
  5. Weapon class spread ×4.7 at equal rarity (rare great hammer 3,738 vs sickle 796 at ml 50); p90/p10 kits 3–4×.
  6. Defense has no monster level: 20 ghoul hits to die with a rare kit, 40–60 with uniques.
  7. Pilgrim → Ashen seam: foes lose 28% life (FOE_HP 2.5 → 1.8), so Ashen's first level is easier than the Count's.

## Proposed (not built, waiting for BT)
Targets as multiples of a current rare kit: stale ×0.5, magic ×0.75, rare ×1, legendary ×1.25, unique ×1.5, abyssal ×1.9; lucky rolls ≤ ×1.3 more.
1. Damage types on uniques/abyssals at the item level's tier; flat types scaled to weapon damage.
2. Damage budget for uniques/abyssals (cut ED, drop empower's ×1.2).
3. Abyssal grade +25% over the top, not up to +100%.
4. Weapon classes within ±25% by sheet DPS at equal hands (credit reach and stun).
5. Defense = def ÷ (def + 40 × monster level), cap 75%.
6. Smooth the Pilgrim → Ashen seam.
7. `BAL.run()` as a regression check after every balance change.

## Research
WoW stat budget per item level and slot; Diablo IV Season 4 (rares 2 affixes, legendaries 3, conditional affixes removed, armour capped at 85%); Path of Exile additive "increased" pool and hit-size armour formula.

## Not tested
- The meter on a real screen (headless runs at a few fps); co-op attribution on host vs guest.
