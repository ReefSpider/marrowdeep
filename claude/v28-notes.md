# Marrowdeep v28: combat (combat28.js)

Wave 4 of BT's notes on v24.

## Weapon classes
Each class scales swing time, damage, knockback and stun. For example, a dual-wielded Kris swings every 0.2 s and a Great Hammer every 1.3 s.

| Class | Swing time | Damage | Knockback | Stun | Notes |
|---|---|---|---|---|---|
| Dagger | ×0.7 | ×1.0 | ×0.4 | – | +10% crit, short reach |
| Sword | ×1 | ×1 | ×1 | – | the middle |
| Two-handed sword | ×1.28 | ×1.45 | ×1.5 | 0.2 | combo ends in a Great Whirl |
| Axe / two-handed axe | ×1.05 / ×1.35 | ×1.12 / ×1.6 | ×1.1 / ×1.6 | – / 0.15 | Great Axe: chop, cleave, Great Whirl |
| Mace / maul | ×1.12 / ×1.42 | ×1.15 / ×1.7 | ×1.3 / ×1.8 | 0.35 / 0.5 | |
| Hammer / great hammer | ×1.5 / ×1.75 | ×1.75 / ×2.4 | ×2 / ×2.4 | full | every swing is a slam that lands only at the very end, with a shockwave |
| Polearm | ×1.05 | ×1.05 | ×1.4 | – | reach and push |
| Katana | ×0.9 | ×1 | ×0.8 | – | +4% crit |
| Rapier | ×0.78 | ×0.88 | ×0.5 | – | +8% crit |
| Flail | ×1.15 | ×1.2 | ×1.2 | 0.25 | |
| Scythe | ×1.2 | ×1.3 | ×1.2 | – | reap, Great Whirl, reap |
| Cleaver | ×1 | ×1.1 | ×0.9 | – | |
| Sickle | ×0.8 | ×0.9 | ×0.5 | – | |

## Input
- **Hold to attack.** Holding the button or J attacks continuously at the weapon's pace, so clicking faster gains nothing.
- **Attack speed from gear** counts in full up to +30%, at 40% beyond that, and stops at +60%. No swing is shorter than 0.2 s.
- **Dual wielding** two one-handed melee weapons: the left button alternates hands, and holding it keeps both going. A crossbow or shield in the off hand keeps the right button.

## Look and sound
- **360s:** heavy weapons end their combo with a full spin, drawn as a sweeping ring of steel round the hero.
- **Kill sounds follow the weapon:** blades slice, maces, hammers and flails crush (with a low thud), daggers, rapiers and spears stab, axes and cleavers chop, and bolts thunk.

## Elite bosses
- They appear once the campaign has been cleared, on tier 1 and above.
- The odds are 8% + 3% per tier, capped at 25%, which is rarer than elite ordinary foes.
- At the boss intro you see a roll panel flick between Common and ELITE before it lands.
- An elite boss has ×1.6 life and hits ×1.25 harder. It has a gold aura, the name "Elite · …", double gold and a **second boss chest**.
- The roll is hashed from the map, so co-op peers see the same result.

## Choosing an act
After a clear, the door offers Act I, Act II or Act III, on any tier.

## Tested headless
- Swing counts and durations per class with the button held.
- Dual-wield alternation: main, off, main, off.
- Elite roll: 4 of 40 runs at 17% odds, with a ×1.6 life check.
- The act card appears.
- Odo and the Sisters simulated to death.
- A screenshot of the spin trail.
