# Marrowdeep v29: art and co-op

The last wave of BT's notes on v24.

## Mobs (mobs29.js)
- **Helms on every soldier-type foe:**
  - Kettle hats with mail aventails: riders and pikemen.
  - A barbute with a T-visor, a red glint and a plume: Hollowed footmen.
  - Rusted sallets: the buried dead.
  - A crested great helm with a red plume: city guards.
  - A crowned crimson great helm: Knights of the Hand.
  - A kettle hat and goggles: siege engineers.
- **Hoods and masks:**
  - Zealot: a hood with lantern-lit eyes.
  - Tithe-taker: an executioner's hood.
  - Nobles: a gilt Venetian mask and a plumed hat.
  - Villagers: cowls.
  - Cutpurse: a shadowed hood with eye glints.
  - Servants: a white cap.
  - Plague doctor: a glass-eye glint.
- **Uglier dead:** drowners with weed hair and pale eyes, scarecrows with stitched sack faces, fen hags with long hair and a lamp-green eye.
- **Shading pass on every foe:** lit from above and darker towards the feet. It's applied only inside the sprite buffer.

## Bosses (bosses29.js)
- **Ser Odo:**
  - He rides a dead horse: a bare skull with coal eyes, ribs through the hide, nooses and a bone cage swinging.
  - He is a rusted hangman-knight. His helm has iron antlers and no face, just two points of light.
  - A noose hangs round his neck, his cape is rags, he carries a tithe ledger on a chain and his lance is a gallows hook.
- **Marshal Rook** is drawn 1.2× larger:
  - an armoured destrier in a crimson and gold caparison
  - gilt plate, a winged helm and a house banner flying from his back
  - a pennoned lance on horseback, a greatsword on foot

  New patterns:
  - **Royal Cavalry:** spectral riders charge down 2–3 marked lanes.
  - **War Cry:** guards arrive and he is unstoppable for 2.4 s.
- **The Three Sisters:**
  - The sister who is out glides after you between attacks.
  - **Ambush:** she sinks and comes up under a red mark at your feet.
  - Their kits have more ambushes, and their life is ×1.7 (was ×1.45).

## Chests (chests29.js)
- **Coffer:** iron-bound oak with studded straps and a lock that glints.
- **Reliquary:** gilt filigree, glowing glass panels, a skull boss and two lit candles.
- **Boss chest:** a black-iron sarcophagus chest with gold trim, a crowned skull and pulsing red runes. It throws a light shaft and sparks.
- **Elite chest:** the boss chest in gold.
- The new art shows in the world and in the opening cine.

## Co-op (coop29.js)
- **Join mid-run.** The host seats the newcomer and sends the current map (same seed, live foes, drops). Everyone else gets the new hero.
- **Leaving keeps you where you were.** You continue solo on a fresh copy of the same map, the save points there, and the same code rejoins.
- **Gilded Debtor:**
  - He only escapes on the host's say-so, so guests no longer see him vanish early.
  - His chest is a boss chest now.
- Protocol `marrowdeep-29`.

## Tested headless
- All maps pass.
- Sisters, Rook and Odo simulated to death. The Sisters used Ambush; Rook used Cavalry and War Cry.
- Foe soaks, and the prologue flow.
- Three-tab co-op:
  - Host and guest play through the fields, fen and lower city with matching foe counts.
  - A third player joins mid-run in the Lower City with a matching foe count and sees both other heroes. The first guest sees the newcomer.
  - The first guest leaves and stays in the Lower City solo.
- Art sheets of the helms, Odo, Rook and the chests.
