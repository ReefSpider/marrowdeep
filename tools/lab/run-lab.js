/* Balance lab runner (headless). Usage:
     node run-lab.js [out.json] [run|roles|bosses|all] [K] [seed]
   run    BAL.run({K}) across all tiers + BAL.factors()   (default, K=60)
   roles  BAL.roles({K}) — each build as a multiple of a balanced rare kit (DPS / effective life), K=400
   bosses BAL.bosses()
   A seed (default 1234) makes the dice repeat, so two builds of the game can be compared on identical kits:
   run this on main and on your branch with the same seed and diff the tables. */
const { open } = require('./lib'); const fs = require('fs');
const [out = 'lab.json', what = 'run', Karg, seedArg] = process.argv.slice(2);
(async () => {
  const { browser, page, errs } = await open();
  const r = await page.evaluate(([what, K, seed]) => {
    RNG = mulberry(seed >>> 0); const t0 = performance.now(); const res = {};
    if (what === 'run' || what === 'all') { res.run = BAL.run({ K: K || 60 }); res.run.factors = BAL.factors(); }
    if (what === 'roles' || what === 'all') res.roles = BAL.roles({ K: K || 400 });
    if (what === 'bosses' || what === 'all') res.bosses = BAL.bosses();
    res.ms = Math.round(performance.now() - t0); res.v = typeof GAME_VERSION !== 'undefined' ? GAME_VERSION : ''; return res;
  }, [what, +Karg || 0, +seedArg || 1234]);
  fs.writeFileSync(out, JSON.stringify(r));
  console.log(r.v, what, 'ms', r.ms, errs.length ? errs.slice(0, 5) : 'no errors');
  if (r.run) for (const row of r.run.rows) console.log(`t${row.tier} m${row.m} ghoul ${row.foes.ghoul.hp}/${row.foes.ghoul.hit} brute ${row.foes.brute.hp} | ` + ['stale', 'magic', 'rare', 'leg', 'uniq', 'abyss'].map(p => `${p} ${row.prof[p].dps[1]} ttk ${row.prof[p].ttkGhoul}s htd ${row.prof[p].htdGhoul}`).join(' | '));
  if (r.roles) { console.log('build: DPS× / effective life× of a balanced rare kit (targets: tank 0.7/1.8 · killer 1.4/0.8 · marksman 1.6 at range/0.55)');
    for (const t of r.roles) { const B = t.roles.balanced; console.log(`t${t.tier} m${t.m}  ` + Object.entries(t.roles).filter(([k]) => k !== 'balanced').map(([k, v]) => `${k} ${(v.dps / B.dps).toFixed(2)}/${(v.eff / B.eff).toFixed(2)}`).join('  ')); } }
  if (r.bosses) console.log('bosses:', Array.isArray(r.bosses) ? r.bosses.length + ' rows' : Object.keys(r.bosses).length + ' keys');
  await browser.close();
})();
