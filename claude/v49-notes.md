# Marrowdeep v49: the cold open

BT (16 Nov), after playing v48: "not really sure what makes it not feel good enough for Steam yet", then "The first 30s feeling good? Let's make that epic." Branch `feature/cold-open`. Co-op needs `marrowdeep-49` (the prologue wall is laid out differently); scripts are tagged `?v=49`.

## What the first 30 seconds were
Recorded from pressing Start on v48:
1. A page of story (three panels, clicked through).
2. A text card, "Prologue: The Walls of Kesh", with a Go button.
3. An unarmed walk: a step, a spike pit, then the sword 20 tiles in (press E).
4. The first foe 31 tiles in. It had 27 life against a 3–7 sword: five or six blows.

Nothing was struck for roughly the first twenty seconds, and the first kill took six swings.

## What they are now (`open53.js`)
Recorded the same way, in seconds of play:

| When | What happens |
|---|---|
| 0.0 | You are on the wall and in control. The screen fades up, the camera pulls back from the hero, fireballs cross the sky. Cassian is behind you. Four tiles ahead a sword stands in a dead captain; beyond it, six Kesh levies hold a line. |
| 1.4 | You run over the sword and it's yours (no key). The line breaks and charges. |
| 1.8–2.8 | Six kills. Each levy dies to one blow, is thrown back, and gets a beat of slow motion. |
| 2.8 | The last one falls slower. White flash, camera punch, and the name comes up: "The Walls of Kesh". The counter reads "6 slain · RAMPAGE". |
| 5.5 | The story page plays (the same one that used to come first). |
| after | The lessons carry on as before, 12 tiles further down the wall. |

- **The Go card is gone.**
- **The story page is the same**, moved from before play to after the first fight.
- **Lessons:** the strike chalk is at the sword; the walk-and-jump chalk moved to the step, where the jump is needed.
- **The two shieldmen at the end** moved 4 tiles, not 12, so both still stand before the rider's scene.
- **New Game+** keeps the old opening. **`?open=old`** on the address brings the old opening back for anyone.
- **Co-op:** the levy line is solo only.
- **Reduced motion:** no slow motion or camera pull.
- All numbers are in `OPEN` at the top of `open53.js`.

## Two things found on the way (not changed)
1. **Hit-stop is nearly off, everywhere.** `ui.js` caps the freeze on any hit at 25 ms, and at zero for 50 ms after a kill (`look.js`: "kills never freeze the game"). The code asks for 70–120 ms on kills and heavy hits, and the cap throws it away. That decision was made for hordes, where freezes read as stutter. It also means a single heavy blow has almost no weight. The cold open uses short slow motion instead, which doesn't stutter. Doing the same for heavy blows, elite kills and boss staggers across the game is the next thing to try.
2. **The first real foe still takes five or six blows** (27 life, 3–7 damage). After six one-blow kills that will feel like a wall. Halving the prologue's foes again, or giving the captain's sword more bite, would fix it.

## Tested headless
- **New opening:** Start, run, sword at 1.4 s, six kills by 2.8 s, title, story page at 5.5 s. No errors.
- **`?open=old`:** the story page comes first, no levies.
- **The wall:** step at tiles 22–25, spikes at 29–31, the old spots flat again; foes and chest at their new places.
- **Regression:** boot (desktop, phone), tree run-through, two-tab co-op. No errors.

## Not tested
- **How it feels.** Timings are measured; whether the slow motion is too much or too little needs a hand on the keys.
- **Phone:** the opening on touch controls.
- **The rest of the prologue played through to the rider** after the move. Positions were checked, not walked.
