# Marrowdeep v35: what the report couldn't see, and stun fatigue

Commit acf26a6 on main. New module **play35.js** (after bal34.js). Co-op protocol `marrowdeep-35`. Title shows v35.

## The third report
"He got really OP with a hammer, and we didn't even get close to dying."
- The report said `marrowdeep-34`, but its timeline runs 5:02–6:10 pm on 9 Nov, before v34 was pushed (6:51 pm). The version was stamped when the report was exported, not when it was played.
- Its timestamps and level-ups match report 1 to the second (level 1→8 in the Quiet Fields … 44 at the Count): it is the other player's half of the same co-op run, on v33. So it doesn't test v34.
- What it does show, on v33: the weapons were rares, the jumps came from levelling (44 against monster level 21), Giant's Grip with a second two-hander, and hammers (the top class by 40% in v33; v34 puts them 8% under the median).
- What it couldn't show: whether it was co-op, how close anyone came to dying, which weapons, and why nothing hit back.

## Why nothing hit back: hammer stun-lock
Every hammer swing stunned for 1.2 s and the next swing came within ~1 s, so anything near a hammer never acted. Headless, 5 ghouls next to the hero for 40 s, attack held:

| Weapon | Attacks foes started → blows landed, v34 | v35 |
|---|---|---|
| Great Hammer | 11 → 2 | 48 → 17 |
| Giant's Grip, two Great Hammers | 48 → 13 | 59 → 23 |
| Zweihander | 39 → 2 | 21 → 5 |
| Two Arming Swords | 76 → 18 | 80 → 11 |

**Stun fatigue:** each stun from a blow adds a point of fatigue to that foe (decaying 0.8 a second, at most 3), and a blow's stun is divided by 1 + fatigue. A lone blow stuns as before; held attacks still stun, but foes get their turn. Skills that stun outright (Funeral Bell, the tether, interrupts) aren't blows and aren't reduced. Bosses were never stunned by blows and still aren't.

## What the report records now (from v35 on)
- **Header:** the build it was exported from, and "Played on" with the builds the visits were actually played on.
- **Danger:** lowest life reached and where, times you fell below 30%, times downed (co-op), largest co-op size, share of time foes near you spent stunned, attacks they started and blows they landed.
- **Per level visit:** build, solo or co-op size, lowest life, falls below 30%, downs, both weapons (base, rarity letter, item level) and the Way, foes stunned %, attacks started → landed, median hit and a real hit (75th percentile; the median was skewed by small ticks), and the top three sources of damage taken.
- **Per boss fight:** build, co-op size, seconds, your level, boss life, life it lost per second (whole team in co-op), your lowest life, hits and damage taken, weapons.
- **Gear changes** carry the build and the weapons' names.

## Tested headless
- Sample report generated with every new section.
- All 28 maps on Pilgrim and Marrow's End; every boss to death; no errors.
- Hold-to-attack alternation unchanged.

## Ask the testers
- Update (co-op needs everyone on v35), press **Clear** in the playtest report before the next run, so the report holds only v34/v35 play, then send it.
