# Marrowdeep v38: chests come in three kinds

Commit 1973553 on main. New module **play38.js** (after play37.js). Co-op protocol `marrowdeep-38`. Title shows v38.

## Feedback
"I feel like I land on rings and amulets a lot. Mix up the boxes between weapons, armour and jewellery; jewellery drops less, armour and weapons equal. Keep boss chests the same." (BT, 9 Nov)

## Change
- Coffers and reliquaries are each one of three kinds:

  | Kind | Share | Gives | Coffer | Reliquary |
  |---|---|---|---|---|
  | Weapons | 40% | weapons | Weaponsmith's Coffer | Reliquary of Blades |
  | Armour | 40% | body armour or helm | Armourer's Coffer | Reliquary of Mail |
  | Jewellery | 20% | ring or amulet | Jeweller's Casket | Reliquary of Rings |

  Before, any chest could give anything: weapons 32%, armour 36%, jewellery 32%.
- A small mark is painted on the chest front: a sword, a breastplate or a ring with a teal stone.
- The prompt and the reel's title name the kind.
- The won item, the reel's filler cards and its unique/abyssal teaser cards all come from the chest's kind.
- Unchanged: boss hoards, elite chests, the Hollow Reliquary and the merchant's box still give anything.
- Co-op: the kind is hashed from the chest's position, the level and the map variation, so every screen agrees.
- Loot memory (v37) still steers body vs helm and ring vs amulet. Reel fillers aren't biased, so co-op reels match.

## Tested headless
- 123 chests across 40 level loads: weapons 44, armour 50, jewellery 29.
- 45 openings: every won item and every reel card was the right kind (armour reels 656 body / 625 helm; jewellery 331 ring / 340 amulet).
- Two-tab co-op: same chests and kinds on host and guest through two level changes.
- All 28 maps on Pilgrim and Marrow's End, every boss to death, no errors.
