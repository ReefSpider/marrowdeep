# Marrowdeep v37: loot that doesn't repeat, the exit vote, falls that hurt

Commit 8b4ba77 on main. New module **play37.js** (after play35.js). Co-op protocol `marrowdeep-37`. Title shows v37. Stats and builds plan (not built): `claude/builds-plan.md`.

## Loot memory
- Feedback: finds should raise the chance of other items so the same things don't keep coming.
- Every item shown as a find (chests, the merchant's box) is remembered: its slot, weapon class and hand, and its name if unique or abyssal.
- The next item is less likely to repeat them: weight ÷ (1 + 0.7 × slot memory), ÷ (1 + memory) for weapon class and hand, ÷ (1 + 2.5 × memory) for a unique's name.
- Memory fades by a fifth with each new find (a tenth for unique names). Kept per browser (`marrowdeep.lootmem`).
- Reel filler cards aren't biased, so co-op reels still match on every screen.
- 3,000 finds headless: the next weapon is the same class as the last 9.5% → 5.0%; the next unique is the same unique 6.7% → 3.9%. Slot shares barely move.

## The exit vote (co-op)
- Feedback: the end door should need everyone to agree, or wait 10 s in case someone is AFK.
- Pressing E at the way out starts a vote. A banner shows each player (✓ or ○) and counts down 10 s.
- Others agree with E at the door, Y anywhere, or a click or tap on the banner.
- When everyone present has agreed, or the time runs out, the host climbs on. Held (reconnecting) places don't count.
- The countdown runs on a timer, not the game loop, so a background tab still counts.
- Tested in two tabs (`?net=local`): host votes → banner on both → guest agrees → both move on. Guest votes, host silent → both move on after 10 s.

## Falls
- Feedback: falling in spikes doesn't scale and doesn't do enough damage.
- Cause: the fall took 25% of life, but it went through defense, so since v34 it was about 5% for an armoured hero.
- Now spikes, lava and the pit take 30% of life on Pilgrim, plus 2% a tier (50% on Marrow's End), and ignore defense.
- Measured: Pilgrim 30%, Mourning 38%, Marrow's End 50%.

## Tested
All 28 maps and every boss on Pilgrim and Marrow's End, no errors.
