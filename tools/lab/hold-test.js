const { open } = require('./lib');
(async () => {
  const { browser, page, errs } = await open();
  const r = await page.evaluate(() => {
    const out = {};
    function trial(label, mainN, offN, way, opt={}) {
      P = newPlayer(); P.lvl = 20; P.skills.add('off'); P.way = way || 'none'; calcStats();
      const lv = LEVELS.findIndex(l => l.kind !== 'cabin' && l.kind !== 'boss' && l.id !== 'kesh');
      loadLevel(lv, { noSave: true }); mode = 'play';
      P.equip.weapon = mkBase(mainN); P.equip.off = mkBase(offN); calcStats(); P.life = P.stats.life;
      P.x = L.spawn.x; P.y = L.spawn.y; enemies.length = 0;
      for(let i=0;i<60;i++) update(1/60);
      const seq = []; let last = null; if(opt.key) keys[opt.key]=true; else mouseHeld = true; if(opt.run) keys.d=true;
      for (let i = 0; i < 60 * 6; i++) { P.grit = 100; P.hurtT = 0; update(1 / 60); const a = P.attack; if (a && a !== last) seq.push(a.hand[0]); last = a; }
      mouseHeld = false; for(const k in keys) keys[k]=false;
      out[label] = seq.join('');
    }
    trial('2x1h', 'Arming Sword', 'Arming Sword');
    trial('2x1h batto', 'Arming Sword', 'Kris', 'batto');
    trial('2x1h key j', 'Arming Sword', 'Hatchet', null, {key:'j'});
    trial('2x1h running', 'Arming Sword', 'Hatchet', null, {run:1});
    trial('mace+mace', 'Flanged Mace', 'Flanged Mace');
    trial('xbows', 'Hand Crossbow', 'Hand Crossbow', 'xbows');
    trial('giant 2h+2h', 'Zweihander', 'Great Axe', 'giant');
    return out;
  });
  console.log(r); console.log(errs.slice(0, 5)); await browser.close();
})();
