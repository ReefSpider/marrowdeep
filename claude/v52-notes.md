# Marrowdeep v52: grander bosses, Rook on the bridge, and a logic sweep

BT (17 Nov, after v51): "Some of the boss sizes seem small I want them to feel grander, also rook on horse at the end of the houses level seems stupid why is he on a horse, maybe if it's at the end of the bridge level. Let's logic bomb anything else in the game as well."

Branch `feature/grander-logic`. Co-op needs `marrowdeep-52` (the level order changed). Scripts are tagged `?v=52`; the title shows v52.

## Bigger bosses (`logic59.js`, sizes in `BSC`)
Nine bosses were drawn at the hero's own size. The hero is 10 by 26 px to hit; these are now:

| Boss | Was (px) | Now (px) | Scale |
|---|---|---|---|
| Ser Odo (mounted) | 28 × 34 | 39 × 48 | 1.4 |
| The Sisters (each) | 16 × 30 | 24 × 45 | 1.5 |
| The Lantern Preacher | 16 × 32 | 24 × 48 | 1.5 |
| Captain Merrow | 16 × 32 | 24 × 48 | 1.5 |
| Piet | 16 × 30 | 22 × 42 | 1.4 |
| Lord Brann | 20 × 34 | 30 × 51 | 1.5 |
| Marshal Rook (mounted) | 28 × 36 | 38 × 49 | 1.35 (his sprite was already drawn at 1.2) |
| Ser Gideon | 16 × 32 | 26 × 51 | 1.6 |
| Count Varhollow (before he changes) | 14 × 34 | 20 × 49 | 1.45 |

- The body you can hit grew with the picture. Their attacks reach exactly as far as before.
- Odo and Rook on foot are a further 15% up, so they don't shrink when unhorsed.
- The Collector, the Choir, the Mother, the Saint and the Crowned Wound were already 56–104 px and are unchanged.

## Rook rides the bridge
- **Order was:** Royal Houses → Rook (the Iron Barracks) → Palace Bridge → Gideon.
- **Order is:** Royal Houses → Palace Bridge → **Rook (the Long Span)** → Gideon (the Gate of Pikes).
- A lancer on a long bridge is the one place his charge makes sense, and the bridge level already ends with a horse tethered at its exit.
- His fight is the v51 one (ballistae, chalk marks, archers if you camp), on bridge stone, with the palace gate and the drop behind him and a column of his lancers waiting further along the span. The barracks yard and the drilling garrison are gone.
- The Royal Houses now end at their last chamber with no boss, and Act II ends on two bosses back to back.

## The logic sweep
What was changed:

| What was wrong | Now |
|---|---|
| Villagers, beggars, nobles and servants could be banner-bearers and horn-blowers (v50). | Only soldiers carry a banner or a horn (13 kinds, listed in `RX_ARMY`). |
| The Hunt could ride through roofed tunnels; towers, torches and the Hand could fall through a ceiling (v50). | Anything that comes from the sky needs open sky above you. Under a roof the director picks the region's other set piece, or waits. |
| Siege fire crossed the sky over the Quiet Fields (v50). There is no siege there, and the region's idea is that nothing happens overhead. | Removed. The hunt on the ridge stays. |
| Brann's mines blinked a red lamp, and he called "Mark. Fire." He was made medieval in v27. | Fire-pots with a burning fuse; "Wind her. Loose." |
| The charges under Gideon's bridge blinked red (v51). | Fuse embers. |
| The Harvest Villages' foes were weak to fire and the Lower City's to holy (v50). The villagers are the new King's converts; the Lower City is plague and rats. | Villages weak to holy; Lower City weak to fire. |

Looked at and left, because they are your call:
- **Brann's great bombard and powder carts** (v51) are gunpowder. Bombards are late-medieval and Gideon's bridge charges were already in the story, so I kept them. Say if you want the Siege Works back to mangonels only.
- **Rook's Royal Cavalry** rides lanes at three heights, two of them in mid-air. v29's notes call them spectral. On a bridge that reads stranger than it did in a yard.
- **Two small glows are still at the old size:** Gideon's torch light and the ring round the Preacher when his flock shields him sit where the smaller sprites were.
- **The title line** says "you will fall, and you will have to climb back up", which now only happens at the end of Act II.
- **A save parked on the Palace Bridge or on Rook** lands one level off after this update (the two swapped places).

## Tested headless
- All 28 levels, every boss through three phases, desktop and phone sizes, in the new order. No errors.
- Sizes read back from the game for Rook, Gideon, the Preacher and the Sisters; stills looked at for Rook on the bridge, Gideon and the Preacher.

## Not tested
- **Play.** Bigger bodies are easier to hit and bump into more; nobody has felt that.
- **The walk from the Royal Houses straight onto the bridge**, and from Rook straight into Gideon, in a real run (levels were loaded one at a time).
- **Co-op** on v52 (v51's two-tab run passed; this release changed the order and the sizes on both sides alike).
- **Odo, Merrow, Piet, Brann and the Count** at their new sizes weren't looked at, only loaded and run.
