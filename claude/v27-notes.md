# Marrowdeep v27: levels

All from BT's notes on v24 (wave 3 of 5).

## Why the Royal Houses works, and what the other levels took from it
The Royal Houses is the best level for five reasons:
1. **It's enclosed.** Every room has a ceiling, walls and galleries, so the frame always has something above and below you. The open levels were a flat strip of ground under a flat sky.
2. **One strong motif, repeated.** The portraits bleed and their eyes follow you. A level remembered for one thing is a level remembered.
3. **Warm pools of light against deep dark.** Candles, gold and crimson. Outdoors everything was lit the same.
4. **Dense, specific set dressing.** Carpets, tables, candles every few tiles.
5. **Foes that belong to the place:** servants, nobles, puppets.

What the other levels took from it:
- Every outdoor region now has **one motif** of its own:
  - Fields: a gibbet, hanged men and crows.
  - Villages: eyes in the windows.
  - Old City: demonic portraits.
  - Burning Stair: fire and demons.
- **Darker light, with light sources:** the fields are at dusk now, with farm lamps on poles; the barn is on fire.
- **More decor** in every region: the threshold went from 28% to 40% of ground spots.
- **A foreground layer**: tall grass you can hide in.
- **The last area is a set piece**: the burning barn.

## What changed (levels27.js, traps27.js, hell27.js, brann27.js)
- **The Quiet Fields at dusk (the first impression).**
  - A bruised red sky, the sun going down too big, and a farm burning on the horizon with its smoke.
  - Dead trees with hanged men in them, and crucified scarecrows on the near ridge.
  - At the start of the road: a gibbet with two hanged men swinging and a tithe board, a cart of bodies, a dead horse, and crows feeding that scatter when you come close.
- **Fire walls.** Outdoors, the gates of an arena or the last chamber are walls of fire as tall as the room, so they can't be jumped. The last chamber also closes its ceiling. Touching the fire hurts.
- **The burning barn.** The Quiet Fields' last chamber is a barn on fire: charred planks, a roof truss, flames on the eaves, smoke under the roof, and embers falling.
- **Tall grass** in the fields and reeds in the fen. Anything in it, you included, can't be seen; only the grass moving gives it away. Foes further than 70 px away lose sight of you while you're in it and not running.
- **Region traps.** Placement is hashed from the map, so co-op peers match:
  - Fields: bear traps.
  - Fen: poison pools (about half of them).
  - Ashes: quicksand. You slow, sink and jump weaker, and it hurts if you stay.
  - Pass: icicles.
  - Last Light: caltrops. Rolling over them doesn't hurt.
  - Villages: snares that string you up. Roll through them.
  - Lower City: rotten boards that give way.
  - Royal Houses: chandeliers. They also crush foes underneath.
- **Harvest Villages.** The villagers are in the background now: behind windows, in doorways, in the hay lofts and round the corners of houses. You see their eyes first. Look at one and it ducks; turn away and it's back.
- **Old City.** His portraits are demonic: horns, gilt, eyes that track you and burn as you get close, a mouth that opens, and blood.
- **The Burning Stair** (was the Ossuary Stair) and the Cradle below it:
  - A basalt and hellfire palette, a furnace backdrop, embers and fire on the floor.
  - Three demons: the Imp (flies, spits fireballs that set the floor alight), the Hellhound (lunges and leaves a line of fire), and the Horned Fiend (doesn't flinch; brings both fists down in a ring of fire).
  - The bone ossuary look moves down to the Breach.
- **Lord Brann of the Siege Works** (was General Brann the Mortar):
  - Full plate with gilt edges, a great helm with a crest and a crimson plume, a black-and-gold Hollowmere tabard, a fur-collared crimson cloak, and a war-pick.
  - His mortar is now a mangonel.
- **"Too many chests in the ice level".** The Last Light's snow-capped crates and the pass's gold shrine boxes looked like chests. They're now barricades, snowdrifts over fallen shields, and skull cairns. Real chest counts were normal (1–6 per level).
- Co-op protocol `marrowdeep-27`.

## Tested headless
- All 28 maps pass.
- Every trap triggers and does what it should.
- Demons soaked for 20 s.
- Brann, Odo and the Mother simulated to death.
- The prologue flow passes.
- Two-tab co-op through the fields, fen and lower city with matching foe counts.
- Screenshots of the fields' start, the barn, the grass, the villages, the old city, the Burning Stair and Brann.
