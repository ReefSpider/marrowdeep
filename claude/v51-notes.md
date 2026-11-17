# Marrowdeep v51: Act II's bosses, and the stake

BT (17 Nov, after v50): "The bosses especially in the second zone feel a bit out of place and not nearly epic enough. Let's do those … get creative and think outside the box for the bosses, with the maps … moving parts … I've added the risk/gambling aspect … what part is the best fun part and for bosses."

"The second zone" was read as Act II (five bosses). Branch `feature/act2-bosses`. Co-op needs `marrowdeep-51`; scripts are tagged `?v=51`; the title shows v51.

## The idea behind all five
The arena is a machine, and the machine can be turned on the boss. Each fight has one thing that moves on its own and hurts you, and one way to make the place hurt him instead. Hitting him with his own arena takes 5–8% of his life and breaks his stance.

## The five (`bosses57.js`, numbers in `A2`)

| Boss | The stage | What it does to you | How you turn it |
|---|---|---|---|
| **Lord Brann**, the Siege Works (72 tiles) | A field under his guns, ending in a palisade you can't climb. On the hill behind, a great bombard with its crew, two trebuchets working, a siege tower creeping. | The bombard fires at you every 11 s (two shells in his last quarter). His own barrages reach the whole field. | Three powder carts stand in the field. Strike one and it rolls the way you hit it. Roll one into the palisade: it comes down, he loses 8% and is broken for 3 s. Carts also go off against him afterwards. A new cart arrives if all are spent. |
| **The Tithe-Collector**, the Counting House (52) | A vault: a wall of deposit drawers, clerks writing on a gallery, and a pair of scales that weigh his ledger against your purse, with both numbers on them. | He opens by taking 25% of your crowns. Every blow he lands takes 8% more. Three coin presses stamp the floor in a row every 6.8 s. | Punish an opening and 6% of the ledger spills back as coins. Kill him and the ledger pays double. A press stamps him too if he is under it (5%, broken 2 s). Die and he keeps it. |
| **The Choir of Teeth**, the Cathedral (56) | The nave: a turning rose window, the organ in five ranks either side. | Three shafts of the window's light walk the floor and burn what stands in them. **Canon:** the organ plays four of its five ranks in order (a number and a note each), then sounds them in the same order. | The light strips the Choir's guard for as long as it floats in a shaft. It follows you, so where you stand decides where it floats. |
| **Marshal Rook**, the Iron Barracks (64) | A yard at dusk under the barracks wall, the garrison at pike drill behind, banners. A ballista on a tower at each end. | His charges and the royal cavalry, as before. Stay on a tower more than 4.5 s and the wall archers shoot you off it. | Each ballista is laid on a chalk mark in the yard. Loose it (E) as he rides over the mark: 7%, broken 2.8 s. It takes 14 s to wind again. |
| **Ser Gideon**, the Gate of Pikes (64) | A bridge in nine spans. The palace gate ahead with your brother on its balcony, chains to the towers, the city's lights far below. | **Fuse:** he lights the span you are standing on; 3.2 s, with a countdown over it. In his last quarter the charges go on their own every 7 s. Never fewer than four spans left. | If he is on the span when it goes he drops with it: 7%, broken 3.2 s while he hauls himself up. |

- Brann's sappers and slam wait until the palisade is down (they were unreachable behind it).
- Gideon's Sunder is replaced by Fuse. The bridge still goes up in the story scene after he dies.
- The yard, the vault and the nave are painted over the region's own backdrop. Rook was fighting in front of the Royal Houses' portrait wall.

## The stake 賭 (`wager58.js`, numbers in `WG`)
Every boss fight now carries a stake, shown under the boss's life.
- **Build it:** punishing an opening adds a pip, up to five (at most one per 1.6 s).
- **Lose it:** taking a hit removes one (at most one per 1.5 s).
- **Double it:** at each change of phase an offer shows for 5 s: "Double the stake". Take it (E) and the stake counts ×2, then ×4; the boss hits 25% harder each time for the rest of the fight. Doing nothing refuses.
- **It pays on his chest:** every two points are +1 item level, and each point makes the chest's top three rarities 20% likelier. Measured over 1,200 rolls each at item level 10, the share of boss-chest items in the top three rarities: 39% with no stake, 56% at five, 64% at ten (five, doubled once), 75% at twenty (five, doubled twice, which is also +10 item levels). A purse of crowns as well.
- **Solo only.** Co-op chests are rolled by the host on another path, so the stake is hidden in co-op.

## Tested headless
- **Each mechanic driven and read back:**
  - Brann: a struck cart rolls 165 px, takes the palisade down, he loses 8% and is broken; the bombard's shell lands.
  - Tithe: the tithe is taken, a blow steals, an opening spills a coin, a press stamps him for 5%, the ledger pays out on death.
  - Choir: the canon shows and sounds; floating in a shaft opens it.
  - Rook: the prompt appears on the tower, the bolt takes 7% and breaks him.
  - Gideon: the span under the hero lights and goes; caught on it he loses 7%; the last quarter lights spans on its own and stops at four.
- **The stake:** a pip per punished opening, one lost per hit, the offer at the phase change, ×2 and 25% more damage when taken, item level and rarity weights changed on a staked chest and not on a plain one.
- **Regression:** all 28 levels, every boss through three phases, desktop and phone sizes. No errors.
- **Co-op, two tabs:** all five Act II bosses load at the same size on both sides with no errors.
- **Looked at:** stills of each stage. The glow layer blows out on large fills; the organ, the window and the canon columns were repainted for that.

## Not tested
- **Play.** No hand on the keys. Every number in `A2` and `WG` is a first guess.
- **Whether the stake is too generous.** One measurement, one item level.
- **Co-op fights.** Carts, presses, shafts and fuses run on each machine's own clock; a cart struck by a guest rolls on the guest's side only. The ballista prompt and the ledger weren't tried with two players.
- **The Collector's and Rook's reach.** Nobody checked that the Collector can actually be led under a press in a real fight, or how often Rook's charge crosses a chalk mark.
- **Gideon standing over a broken span** is held at deck height so he can't get stuck in a pit; how that looks wasn't judged.
- **Phone:** the ballista and the double offer use the same prompt as chests; not tried on touch.

## Next
1. BT plays Act II; tune `A2` and `WG`.
2. Merrow and Piet (the last two of Act I still in the old room), then Act III's three and the finale.
3. The stake in co-op (the host's chest roll has to carry it).
