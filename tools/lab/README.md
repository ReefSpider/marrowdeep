# Balance lab harness

Headless runs of the game's own code (Playwright + Chrome, three.js r128 served locally, fonts blocked).

    npm i three@0.128.0 playwright-core
    GAME=/path/to/marrowdeep node run-lab.js out.json   # BAL.run({K:60}) across all tiers
    node hold-test.js                                  # which hand swings while attack is held

`BAL.run()` and `BAL.factors()` live in lab32.js and can also be called from the browser console.
`balance-lab.html` (one folder up) is the write-up of the v32 run, with a reader for playtest reports.
