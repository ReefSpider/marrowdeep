const { open } = require('./lib'); const fs=require('fs');
(async () => {
  const { browser, page, errs } = await open();
  const r = await page.evaluate(() => { const t0=performance.now(); const run=BAL.run({K:60}); run.factors=BAL.factors(); run.ms=Math.round(performance.now()-t0); return run; });
  fs.writeFileSync(process.argv[2]||'lab.json', JSON.stringify(r));
  console.log('rows', r.rows.length, 'ms', r.ms); console.log(errs.slice(0,5));
  const P=(row,p)=>row.prof[p];
  for(const row of r.rows){ console.log(`t${row.tier} m${row.m} ghoul ${row.foes.ghoul.hp}/${row.foes.ghoul.hit} brute ${row.foes.brute.hp} | ` + ['stale','magic','rare','leg','uniq','abyss'].map(p=>`${p} ${P(row,p).dps[1]} ttk ${P(row,p).ttkGhoul}s htd ${P(row,p).htdGhoul}`).join(' | ')); }
  await browser.close();
})();
