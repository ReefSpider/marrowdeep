# Marrowdeep v53: the end of Act I

BT (18 Nov): "Ok continue with this what's next". Next on the list was Merrow and Piet, the last two bosses still fought in the old 36-tile room. Branch `feature/act1-finale`. Co-op needs `marrowdeep-53` (both arenas changed size). Scripts are tagged `?v=53`; the title shows v53.

All fifteen Act I and Act II bosses now have their own ground.

## Captain Merrow, the Black Camp (`bosses60.js`, numbers in `M53`)
- **The place:** the Hollowed host's camp in the Weeping Pass at night (60 tiles). Tents, a bonfire, a war drum with its drummer, four rocky ledges, and a mountain heavy with snow. On the slopes above, four terraces of his men stand in the dark and don't sleep; every nine seconds their eyes all turn to you.
- **Countermand:** when he calls an order ("Loose!", "To me! Close up!", "Forward. In step."), he holds it for a second first. Get within 160 px and press E: his men stand down (they stop protecting him for 6 s and are stunned 1.8 s), the order is cancelled, and he is open 1.8 s. Too far away and the game says so once. You trained them; they still know your voice.
- **The avalanche:** in his last quarter he calls for the drums and the mountain lets go. The slide shows on the mountain first (3.4 s), then sweeps the floor left to right. On the floor you take a heavy hit; up on a ledge you are safe. His men are buried; he is buried to the waist (8%, broken 3.6 s). Every 19 s after that.

## Piet, the Gate of the Last Light
- **The place:** the wall walk of the last fortress that never swore to the King (56 tiles), at night. Beyond the parapet the valley is full of the Hollowed host's torches, two siege towers, and a ram at the gate. The Last Light itself burns on the east tower.
- **Ladders:** the host raises a ladder against the back of the wall every 12 s (9 s in his second phase; never more than two up). Up to three Hollowed climb each one. Strike the top of a ladder and it goes over with whoever is still on it.
- **The chain:** his three-cut chain is the one you taught him, now slower (cuts at 0.7, 1.15 and 1.6 s) with a glint before each and three diamonds over his head. Answer a cut by parrying it (with a shield) or by striking him in its glint (the blades meet and the cut doesn't land). All three: his shield breaks (8%, broken 3.2 s, and no guard for 14 s). Two: it cracks; two cracks break it.
- **The ram:** in his last quarter the ram hits the gate every 3 s (2.6 s under 10% life). The floor flashes before each stroke. On the ground when it lands you take a hit and are thrown; Piet braces, unless he is mid-attack, and then he goes down (3%, broken 1.8 s).

## Also
- **Glows at the right size:** Gideon's torch, Piet's guard line and the Preacher's prayer ring now scale with the bosses (left over from v52).
- **Saves from before v52** parked on the Palace Bridge or on Rook still land one level off. Looked at and left: a save on old-Rook lands on the bridge (replays it), a save on the old bridge lands on Rook (skips the bridge). Fixing it would also move saves made on v52, and there is no way to tell them apart.

## Tested headless
- **Merrow:** the countermand prompt appears in reach, cancels the order, frees a standing squad of three, and they rejoin after 6 s. The avalanche shows its tell, sweeps, buries him for 8% while the hero stands on a ledge, and comes again 19 s later.
- **Piet:** a ladder rises, three climb, a strike sends it over with two still on it. The chain, driven from inside the game loop: three answered breaks the shield (8%); two answered cracks it, and a second two breaks it; one answered does nothing; a shield parry counts. The ram throws a hero on the ground and throws Piet when he is mid-chain.
- **Regression:** all 28 levels, every boss through three phases, desktop and phone sizes. No errors.
- **Co-op, two tabs:** both fights load at the new size on both sides. No errors.
- **Looked at:** stills of the camp, the countermand, the avalanche, the wall, the ladders, the ram and the beacon. The host on the slopes was redrawn on ridgelines, and the bonfire, the beacon and the ram were reworked after the first look.

## Not tested
- **Play.** Every number in `M53` is a first guess.
- **The chain with slow weapons.** Cuts are 0.45 s apart; a maul may not swing fast enough to meet all three. Two of three still cracks it.
- **Co-op fights:** ladders and the ram run on each machine's own clock; only the host spawns climbers. A guest's countermand works on the guest's side only.
- **Phone:** the countermand uses the same prompt as chests; the chain's glint timing on touch wasn't tried.

## Next
1. BT plays the end of Act I.
2. Act III's three bosses and the finale on their own ground (the Mother, the Saint, the Count).
3. Directors and far planes for the Weeping Pass, the Last Light and Act II's regions.
4. The stake in co-op.
