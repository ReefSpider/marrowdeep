# Balance lab harness

Headless runs of the game's own code (Playwright + Chrome, three.js r128 served locally, fonts blocked).

    npm i playwright-core
    GAME=/path/to/marrowdeep node run-lab.js out.json            # BAL.run({K:60}) across all tiers
    GAME=/path/to/marrowdeep node run-lab.js out.json roles 400  # each build vs a balanced rare kit (v45)
    GAME=/path/to/marrowdeep node run-lab.js out.json bosses     # BAL.bosses()
    node hold-test.js                                           # which hand swings while attack is held

A fifth argument sets the dice seed (default 1234). Same seed on two builds = identical kits, so a change can be measured
without noise: at K=12 the role table swings ±30% from run to run; seeded at K=400 it repeats exactly.
three.js and PeerJS are in the repo's `lib/` since v45, so the lab no longer needs its own copy of three.

`BAL.run()`, `BAL.factors()` and `BAL.bosses()` (v34: every boss's life, hit and seconds of pure swinging per gear profile) live in lab32.js and can also be called from the browser console.
`balance-lab.html` (one folder up) is the write-up of the v32 run, with a reader for playtest reports.
