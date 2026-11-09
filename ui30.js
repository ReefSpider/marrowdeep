'use strict';
/* ===== v30: the UI pass (from the v29 UI audit)
   1. bugs: kanji under card titles, the map table, the Tengu's empty state
   2. the pause menu split into Journal / Settings / Leave
   3. no screen scrolls at 16:9: codex as list + page, merchant, sell, wheel, rack, satchel
   4. the typewriter only for story cards
   5. one kit: shared panel/button/type sizes, one word for leaving a screen, shorter labels
   6. the Rope-House names its stations, Ilse shows you round, stations open as they matter
   Loaded after every other module, before boot.js. ===== */

const UI30 = {};
const tipOn = (el, html) => { if (!el) return; el.addEventListener('pointerenter', () => showTipHTML(html, el)); el.addEventListener('pointerleave', hideTip); el.addEventListener('click', hideTip); };

/* ---------- 1a. kanji under card titles stacked into a column ----------
   #cardTitle span{display:block} (and a few like it) beat .sgl{display:inline-block},
   so every sigil character became its own block. */
(function () {
  const st = document.createElement('style'); st.id = 'ui30Fix';
  st.textContent = `.sgl{display:inline-block!important}`;
  document.head.appendChild(st);
})();

/* ---------- 1b. the map table: tiers ran off the right edge ----------
   It used the koan column (flex column + wrap + max-height), which wraps into new columns
   sideways. Now a compact grid that always fits; explanations live in tooltips. */
diffCard = function () {
  const hold = META.hold !== false;
  const tiers = DIFFS.map((d, t) => {
    const [a, b] = tierRange(t), open = t <= META.unlocked, done = META.cleared.includes(t);
    return { t, d, a, b, open, done };
  });
  showCard({
    title: 'The map table', jp: '地図台', story: false,
    body: `Pick how deep you go. Clearing the campaign opens the next three tiers.`,
    buttons: [{ label: 'Back', key: 'Esc', ghost: 1, fn: () => { hideCard(); mode = 'play'; hud.hidden = false; } }]
  });
  const row = $('#cardBtns'); row.className = 'row';
  const grid = document.createElement('div'); grid.className = 'tiers';
  for (const x of tiers) {
    const b = document.createElement('button');
    b.className = 'tier' + (x.t === META.pick ? ' on' : '') + (x.open ? '' : ' lk') + (x.done ? ' done' : '');
    b.disabled = !x.open;
    b.innerHTML = `<i>${x.d.jp}</i><b>${x.d.n}</b><small>${x.open ? `Lv ${x.a}–${x.b}${x.done ? ' · cleared' : ''}` : 'Locked'}</small>`;
    tipOn(b, x.open ? `<b>${x.d.n}</b><br>Monster level ${x.a}–${x.b}<br><span class="g">${x.d.d}</span>` : `<b>${x.d.n}</b><br><span class="g">Clear the campaign on ${DIFFS[Math.max(0, x.t - 3)].n} or deeper to open it.</span>`);
    b.onclick = () => { META.pick = x.t; saveGame(); AU.tone('triangle', 600, 400, .1, .1, .2); diffCard(); };
    grid.appendChild(b);
  }
  const hb = document.createElement('label'); hb.className = 'chk holdt';
  hb.innerHTML = `<input type="checkbox" id="holdTier"${hold ? ' checked' : ''}> Hold this tier`;
  tipOn(hb, hold ? 'Every descent stays on the tier you pick here.' : 'Clearing the campaign moves you one tier deeper.');
  hb.querySelector('input').onchange = e => { META.hold = e.target.checked; saveGame(); AU.tone('triangle', 500, 700, .1, .1, .2); diffCard(); };
  const wrap = document.createElement('div'); wrap.className = 'tierWrap';
  const now = document.createElement('div'); now.className = 'tierNow';
  now.innerHTML = `Chosen: <b>${DIFFS[META.pick].n}</b>${hold ? ' (held)' : ''} · you are level <b>${P.lvl}</b>`;
  wrap.append(now, grid, hb);
  row.parentNode.insertBefore(wrap, row);
  UI30.cardExtra = wrap;
};

/* ---------- 4 + 5. cards: one renderer ----------
   Only story cards type themselves out (letters, Ilse, stones, act and prologue cards).
   Utility cards (map table, rack, merchant, door, powers…) appear at once with their buttons ready.
   Buttons take an optional key, drawn as a small badge. Esc presses the card's Back. */
const UTIL_CARDS = new Set(['The map table', 'The weapon rack', 'Borrowed power', 'Where do you climb in?', 'The Pale Merchant', 'The descent', 'Climb on', 'Abandon the descent?', 'The story so far', 'Controls']);
showCard = function (o) {
  if (UI30.cardExtra) { UI30.cardExtra.remove(); UI30.cardExtra = null; }
  mode = 'card'; hud.hidden = true; $('#card').hidden = false;
  const lt = $('#letter'), lg = $('#ledger'), row = $('#cardBtns');
  const story = o.story != null ? o.story : !!(o.sal || o.sig || (!UTIL_CARDS.has(o.title) && (o.body || '').length >= 120));
  $('#card').classList.toggle('util', !story);
  $('#cardTitle').innerHTML = o.title ? `<b>${o.title}</b>${o.jp ? `<span>${o.jp}</span>` : ''}` : '';
  lt.innerHTML = `${o.sal ? `<span class="sal">${o.sal}</span>` : ''}<span id="lbody"></span>${o.sig ? `<span class="sig">${o.sig}</span>` : ''}`;
  lt.hidden = !(o.body || o.sal || o.sig);
  lg.innerHTML = o.ledger || ''; lg.classList.remove('on'); row.innerHTML = ''; row.hidden = true; row.className = 'row';
  (o.buttons || []).forEach(b => {
    const bt = document.createElement('button'); bt.className = 'btn' + (b.ghost ? ' ghost' : '');
    const back = /^(Back|Not yet)$/.test(String(b.label).replace(/<[^>]*>/g, '').trim());
    bt.innerHTML = b.label + (b.key ? ` <kbd>${b.key}</kbd>` : back && !/<kbd>/.test(b.label) ? ' <kbd>Esc</kbd>' : '');
    if (back) bt.dataset.back = '1';
    if (b.tip) tipOn(bt, b.tip);
    bt.onclick = () => { hideTip(); b.fn(bt); }; if (b.disabled) bt.disabled = true; row.appendChild(bt);
  });
  const lb = $('#lbody'); let i = 0; const full = o.body || '';
  const done = () => { if (typing) { clearInterval(typing); typing = null; } lb.textContent = full; lg.classList.add('on'); row.hidden = false; const f = row.querySelector('.btn:not(.ghost):not([disabled])') || row.querySelector('.btn'); f && f.focus({ preventScroll: true }); };
  if (typing) { clearInterval(typing); typing = null; }
  if (!story || RM) done();
  else typing = setInterval(() => { i += 2; lb.textContent = full.slice(0, i); if (i % 6 === 0) AU.tone('triangle', rnd(900, 1300), 700, .02, .02, .1); if (i >= full.length) done(); }, 26);
  $('#card').onclick = e => { if (typing && !e.target.closest('button')) done(); };
};
(function () { const hc = hideCard; hideCard = function () { if (UI30.cardExtra) { UI30.cardExtra.remove(); UI30.cardExtra = null; } hideTip(); return hc.apply(this, arguments); }; })();
/* Esc on a card presses its Back; on my own screens it goes back one step */
addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (mode === 'card' && !$('#card').hidden) { const b = $('#cardBtns [data-back]'); if (b && !$('#cardBtns').hidden) { e.preventDefault(); e.stopImmediatePropagation(); b.click(); } return; }
  if (mode === 'pause' && UI30.pview && UI30.pview !== 'main') { e.preventDefault(); e.stopImmediatePropagation(); pauseView('main'); return; }
  if (mode === 'settings') { e.preventDefault(); e.stopImmediatePropagation(); closeSettings(); }
}, true);

/* ---------- 2. pause: Resume · Satchel · Journal · Map · Settings · Leave ----------
   Other modules still add their buttons to #pause .col inside openPause. Before each open
   everything goes back into .col so their code finds what it expects; afterwards each
   control is filed into the view it belongs to. */
const PV = {
  main: ['pResume', 'pBag', '_journal', 'pMap', '_settings', 'pCoop', '_leave'],
  journal: ['pStory', 'pCodex', 'pPow', 'pWay'],
  leave: ['pStuck', 'pAbandon', 'pTitle'],
};
const PLABEL = { pResume: 'Resume', pBag: 'Satchel', pCodex: 'Codex', pStory: 'Story', pMap: 'Map', pTitle: 'Quit to title', pAbandon: 'Abandon run' };
const PKEY = { pResume: 'Esc', pBag: 'I', pMap: 'M' };
function pauseEl(id) {
  if (id[0] !== '_') return $('#' + id);
  let b = $('#p' + id); if (b) return b;
  b = document.createElement('button'); b.className = 'btn ghost'; b.id = 'p' + id;
  const name = id.slice(1);
  b.innerHTML = name === 'settings' ? 'Settings' : name === 'journal' ? 'Journal <span class="more">›</span>' : 'Leave <span class="more">›</span>';
  b.onclick = () => name === 'settings' ? openSettings('pause') : pauseView(name);
  return b;
}
function pauseView(v) {
  UI30.pview = v; const box = $('#pause .pv'); if (!box) return;
  const ids = PV[v];
  [...box.children].forEach(c => UI30.park.appendChild(c));
  if (v !== 'main') { const h = document.createElement('div'); h.className = 'pvh'; h.textContent = v === 'journal' ? 'Journal' : 'Leave'; box.appendChild(h); }
  for (const id of ids) { const el = pauseEl(id); if (el && !el.hidden) box.appendChild(el); }
  if (v !== 'main') { let bk = $('#p_back'); if (!bk) { bk = document.createElement('button'); bk.className = 'btn ghost'; bk.id = 'p_back'; bk.innerHTML = 'Back <kbd>Esc</kbd>'; bk.onclick = () => pauseView('main'); } box.appendChild(bk); }
  const f = box.querySelector('.btn:not([disabled])'); f && f.focus({ preventScroll: true });
}
(function () {
  const o = openPause;
  openPause = function () {
    const col = $('#pause .col');
    if (UI30.park) { for (const el of [...UI30.park.children, ...$('#pause .pv').children]) if (el.id && el.id[1] !== '_' && el.id !== 'p_back' && !el.classList.contains('pvh')) col.appendChild(el); }
    o();
    if (!UI30.park) {
      UI30.park = document.createElement('div'); UI30.park.hidden = true; $('#pause').appendChild(UI30.park);
      const pv = document.createElement('div'); pv.className = 'pv'; col.after(pv); col.hidden = true;
    }
    /* settings controls live on the settings screen now; keep the originals parked so the modules that set them keep working */
    for (const l of [...col.querySelectorAll('label')]) UI30.park.appendChild(l);
    for (const [id, t] of Object.entries(PLABEL)) { const b = $('#' + id); if (b) b.innerHTML = t + (PKEY[id] ? ` <kbd>${PKEY[id]}</kbd>` : ''); }
    const pw = $('#pPow'); if (pw) { const n = typeof RUN !== 'undefined' && RUN.powers ? RUN.powers.length : 0; pw.innerHTML = `Powers${n ? ` <small class="cnt">${n}</small>` : ''}`; }
    const rp = $('#pReport'); if (rp) { rp.hidden = !UI30.debug(); if (!rp.hidden) PV.main.includes('pReport') || PV.main.push('pReport'); }
    const pl = $('#pLore'); if (pl) pl.hidden = false;
    pauseView('main');
  };
})();
UI30.debug = () => { try { return !!store.get('marrowdeep.debug') || /[?&]debug/.test(location.search); } catch (e) { return false; } };
/* F8 toggles the playtest tools (the report in the pause menu) */
addEventListener('keydown', e => { if (e.key === 'F8') { e.preventDefault(); const on = !UI30.debug(); store.set('marrowdeep.debug', on); toast(on ? 'Playtest tools on · the report is in the pause menu.' : 'Playtest tools off.'); if (mode === 'pause') openPause(); } });

/* ---------- settings: one screen, reachable from the title and the pause menu ---------- */
function setRow(label, ctl, tip) { return `<label class="srow"${tip ? ` data-tip="${tip}"` : ''}><span>${label}</span>${ctl}</label>`; }
function openSettings(from) {
  UI30.setFrom = from; UI30.setPrev = mode; mode = 'settings';
  let s = $('#setScr');
  if (!s) { s = document.createElement('div'); s.className = 'screen'; s.id = 'setScr'; stage.appendChild(s); }
  const on = k => (SETTINGS[k] !== false && SETTINGS[k] != null) ? ' checked' : '';
  const keys = [['A D', 'Move'], ['Space', 'Jump'], ['S + Space', 'Drop through'], ['Shift', 'Roll'], ['Mouse', 'Aim'], ['Click · J', 'Combo'], ['Right-click · K', 'Off hand'], ['S + strike', 'Plunge (midair)'], ['1–4', 'Arts'], ['Q', 'Drink'], ['E', 'Open · take · talk'], ['F', 'Finish a kneeling boss'], ['I', 'Satchel'], ['T', 'Skills'], ['C', 'Codex'], ['M', 'Map'], ['Esc', 'Pause · back']];
  s.innerHTML = `<h2 class="mh">Settings</h2>
    <div class="tabs"><button class="tab${UI30.setTab !== 'keys' ? ' on' : ''}" data-t="opts">Sound &amp; display</button><button class="tab${UI30.setTab === 'keys' ? ' on' : ''}" data-t="keys">Controls</button></div>
    <div class="setGrid" ${UI30.setTab === 'keys' ? 'hidden' : ''}>
      <div class="panel"><h3>Sound</h3>
        ${setRow('Music &amp; voices', `<input type="range" id="sMus" min="0" max="1" step="0.05" value="${SETTINGS.music}">`)}
        ${setRow('Sound', `<input type="range" id="sSfx" min="0" max="1" step="0.05" value="${SETTINGS.sfx}">`)}
      </div>
      <div class="panel"><h3>Display</h3>
        ${setRow('Demonic sigils', `<input type="checkbox" id="sSig"${SETTINGS.sigils !== false ? ' checked' : ''}>`, 'Draw kanji as demonic seals. Off shows plain kanji.')}
        ${setRow('Big-win effects', `<input type="checkbox" id="sWins"${SETTINGS.wins !== false ? ' checked' : ''}>`, 'The saint and the demon behind great loot. Sounds stay either way.')}
        ${setRow('Jump scares', `<input type="checkbox" id="sScare"${SETTINGS.scares !== false ? ' checked' : ''}>`, 'Faces, watchers and things behind you in the Pit.')}
      </div>
    </div>
    <div class="keyGrid" ${UI30.setTab === 'keys' ? '' : 'hidden'}>${keys.map(([k, a]) => `<div><kbd>${k}</kbd><span>${a}</span></div>`).join('')}</div>
    <div class="row"><button class="btn ghost" id="sBack">Back <kbd>Esc</kbd></button></div>`;
  s.hidden = false; hud.hidden = true; if (from === 'pause') $('#pause').hidden = true; if (from === 'title') $('#title').hidden = true;
  s.querySelectorAll('.tab').forEach(t => t.onclick = () => { UI30.setTab = t.dataset.t; openSettings(from); });
  s.querySelectorAll('[data-tip]').forEach(l => tipOn(l, l.dataset.tip));
  const save = () => store.set('marrowdeep.settings', SETTINGS);
  const v = id => $('#' + id);
  if (v('sMus')) {
    v('sMus').oninput = e => { SETTINGS.music = +e.target.value; AU.setVol(); save(); };
    v('sSfx').oninput = e => { SETTINGS.sfx = +e.target.value; AU.setVol(); save(); };
    v('sSig').onchange = e => { SETTINGS.sigils = e.target.checked; save(); if (e.target.checked) sigStart(); else sigStop(); window.sigCssSet && window.sigCssSet(); };
    v('sWins').onchange = e => { SETTINGS.wins = e.target.checked; save(); };
    v('sScare').onchange = e => { SETTINGS.scares = e.target.checked; save(); };
  }
  $('#sBack').onclick = closeSettings;
  $('#sBack').focus({ preventScroll: true });
}
function closeSettings() {
  const s = $('#setScr'); if (s) s.hidden = true; hideTip();
  if (UI30.setFrom === 'title') { mode = 'title'; $('#title').hidden = false; }
  else { openPause(); pauseView('main'); }
}

/* ---------- title: controls move to Settings, a version number, Settings on the title ---------- */
const GAME_VERSION = 'v32';
(function () {
  const t = $('#title'); const keys = t.querySelector('.keys'); if (keys) keys.hidden = true;
  const row = t.querySelector('.row');
  const sb = document.createElement('button'); sb.className = 'btn ghost'; sb.id = 'titleSet'; sb.textContent = 'Settings';
  sb.onclick = () => { AU.init(); openSettings('title'); };
  row.appendChild(sb);
  const v = document.createElement('div'); v.className = 'ver'; v.textContent = `Marrowdeep ${GAME_VERSION}`; t.appendChild(v);
  const hint = document.createElement('div'); hint.className = 'keyhint'; hint.innerHTML = '<kbd>A D</kbd> move · <kbd>Space</kbd> jump · <kbd>Click</kbd> strike · <kbd>Shift</kbd> roll · <kbd>Esc</kbd> pause';
  t.appendChild(hint);
})();
/* title buttons are added by other modules after load (Characters, Co-op): keep Settings last */
(function () { const o = toTitle; toTitle = function () { const r = o.apply(this, arguments); const row = $('#title .row'), sb = $('#titleSet'); if (row && sb) row.appendChild(sb); return r; }; })();

/* ---------- 3a. the codex: a list on the left, one page on the right ----------
   Works on whatever cards a renderer produced (.cx), keeping its h4 group headings.
   Long lists turn pages instead of scrolling. */
UI30.lx = {};
function listify(box, key, opt) {
  opt = opt || {};
  const nodes = [...box.querySelectorAll('h4, .cx')].filter(n => !(opt.skipLocked && n.classList.contains('lk')));
  if (!nodes.length) return;
  const st = UI30.lx[key] || (UI30.lx[key] = { sel: null, page: 0 });
  const items = []; let group = null;
  for (const n of nodes) {
    if (n.tagName === 'H4') { group = n.outerHTML; continue; }
    const b = n.querySelector('b'); const lab = b ? b.cloneNode(true) : document.createElement('b'); lab.querySelectorAll('small').forEach(x => x.remove());
    items.push({ group, label: lab.innerHTML, html: n.outerHTML, dim: n.classList.contains('un') || n.classList.contains('lk'), id: lab.textContent.trim() });
  }
  const PER = opt.per || 13;
  /* pages: headings count as a row and never sit alone at the foot of a page */
  const pages = [[]]; let rows = 0, lastG = null;
  for (const it of items) {
    const head = it.group && it.group !== lastG;
    if (rows + (head ? 2 : 1) > PER) { pages.push([]); rows = 0; lastG = null; }
    const pg = pages[pages.length - 1];
    if (it.group && it.group !== lastG) { pg.push({ head: it.group }); rows++; lastG = it.group; }
    pg.push(it); rows++;
  }
  if (st.sel == null || !items.find(x => x.id === st.sel)) st.sel = items[0].id;
  st.page = Math.min(st.page, pages.length - 1);
  const draw = () => {
    const cur = items.find(x => x.id === st.sel) || items[0];
    box.innerHTML = `${opt.head ? `<div class="lxHead">${opt.head}</div>` : ''}<div class="lx"><div class="lxL"><div class="lxList">${pages[st.page].map(x => x.head ? `<div class="lxG">${x.head.replace(/<\/?h4[^>]*>/g, '')}</div>` : `<button class="lxI${x.id === st.sel ? ' on' : ''}${x.dim ? ' dim' : ''}" data-id="${x.id.replace(/"/g, '&quot;')}">${x.label}</button>`).join('')}</div>
      ${pages.length > 1 ? `<div class="lxP"><button class="lxPb" data-d="-1"${st.page ? '' : ' disabled'}>‹</button><span>${st.page + 1} / ${pages.length}</span><button class="lxPb" data-d="1"${st.page < pages.length - 1 ? '' : ' disabled'}>›</button></div>` : ''}
      ${opt.foot ? `<div class="lxF">${opt.foot}</div>` : ''}</div><div class="lxR">${cur.html}</div></div>`;
    box.querySelectorAll('.lxI').forEach(b => b.onclick = () => { st.sel = b.dataset.id; AU.tick && AU.tick(); draw(); });
    box.querySelectorAll('.lxPb').forEach(b => b.onclick = () => { st.page = Math.max(0, Math.min(pages.length - 1, st.page + +b.dataset.d)); AU.tick && AU.tick(); draw(); });
    const L_ = box.querySelector('.lxList'); if (L_) L_.onwheel = e => { e.preventDefault(); const d = Math.sign(e.deltaY); if (!d) return; const np = Math.max(0, Math.min(pages.length - 1, st.page + d)); if (np !== st.page) { st.page = np; draw(); } };
  };
  draw();
}
(function () {
  const o = renderCodex;
  renderCodex = function () {
    o();
    const cx = $('#codex'); if (!cx || cx.hidden) return;
    const locked = CODEX.length - CODEX_OPEN.size;
    listify(cx, 'lore', { skipLocked: true, per: 14, foot: locked ? `${locked} still unwritten. Meet them, or kneel at the stones.` : '' });
  };
  const e = renderElemCodex;
  renderElemCodex = function () {
    e();
    const box = $('#elemCodex'); if (!box) return;
    const head = box.querySelector('.exHead'); const seen = head ? (head.querySelector('b') || {}).textContent : '';
    const intro = head ? `<div class="cx ex" style="--ec:#c9a96a"><b><i>属</i>How types work</b>${head.innerHTML}</div>` : '';
    if (head) head.remove();
    if (intro) box.insertAdjacentHTML('afterbegin', `<h4>Start here</h4>${intro}`);
    listify(box, 'elem', { per: 14, foot: seen ? `${seen} combinations witnessed` : '' });
  };
})();

/* ---------- 3b. the merchant: three wares in a row, details in tooltips ---------- */
merchantTrade = function (type) {
  const st = shopStock(), r = shopRun(), bc = boxPrice(), pc = potPrice();
  const boxOk = st.box && P.gold >= bc, potOk = st.pot && P.gold >= pc && P.potions < POT_MAX;
  showCard({
    title: 'The Pale Merchant', jp: '商人', story: false, body: type ? pick(MERCH_LINES) : 'He waits.',
    ledger: `You carry <b>${P.gold}</b> crowns`,
    buttons: [
      { label: `<span class="ware">Box</span><span class="price">${bc}</span><small>${st.box ? `${st.box} left` : 'sold out'}</small>`, disabled: !boxOk, fn: () => buyBox(),
        tip: st.box ? `A merchant's box: a chest roll at this depth.<br><span class="g">Every box you buy this descent makes the next dearer. After this one: ${boxPrice(r.bought + 1)}.</span>` : 'None left on this level.' },
      { label: `<span class="ware">Draught</span><span class="price">${pc}</span><small>${st.pot ? `${st.pot} left · belt ${P.potions}/${POT_MAX}` : 'sold out'}</small>`, disabled: !potOk,
        fn: () => { if (!potOk) return; P.gold -= pc; st.pot--; P.potions++; AU.coin(); updBelt(); saveGame(); merchantTrade(false); },
        tip: P.potions >= POT_MAX ? 'Your belt is full.' : 'A healing draught for your belt.' },
      { label: `<span class="ware">Sell</span><small>from your satchel</small>`, fn: () => openSell(), tip: 'Opens your satchel. Click an item to sell it; Legendary and better ask twice.' },
      { label: 'Back', ghost: 1, fn: backToPlay }]
  });
  $('#cardBtns').classList.add('shop');
};

/* ---------- 3c. selling: one short line over the satchel ---------- */
sellBar = function () {
  const pane = $('#paneBag'); if (!pane) return; let b = $('#sellBar');
  if (!SHOP.sell) { if (b) b.remove(); return; }
  if (!b) { b = document.createElement('div'); b.id = 'sellBar'; $('#inv').insertBefore(b, $('#inv .tabs').nextSibling); }
  b.innerHTML = `<span>Selling · click an item · you carry <b>${P.gold}</b></span><button class="btn ghost" id="sellDone">Done <kbd>Esc</kbd></button>`;
  $('#sellDone').onclick = () => toggleInv(false);
};
(function () { const o = toggleInv; toggleInv = function (open, tab) { const r = o(open, tab); $('#inv').classList.toggle('selling', !!(open && SHOP.sell)); if (!open) { const b = $('#sellBar'); if (b && !SHOP.sell) b.remove(); } return r; }; })();

/* ---------- 3d. the Gallows Wheel: the machine on the left, the bets on the right ---------- */
(function () {
  const o = renderSlots_;
  renderSlots_ = function () {
    o();
    const s = slotScr, m = s.querySelector('.slm'); if (!m) return;
    const side = document.createElement('div'); side.className = 'slside';
    for (const sel of ['.slmsg', '.slgold', '.slbets', '.slpay', '.row']) { const el = s.querySelector(sel); if (el) side.appendChild(el); }
    const wrap = document.createElement('div'); wrap.className = 'slwrap'; m.replaceWith(wrap); wrap.append(m, side);
    s.querySelectorAll('.slbets .btn').forEach(b => { const n = b.dataset.b; const k = b.querySelector('kbd'); b.innerHTML = `${n} <kbd>${k ? k.textContent : ''}</kbd>`; });
  };
})();

/* ---------- 3e. the weapon rack: one row per peg ---------- */
loadoutCard = function () {
  showCard({ title: 'The weapon rack', jp: '武具掛け', story: false, body: 'Save what you wear to a peg. Wearing a peg pulls each piece from the satchel, the stash or another peg.', buttons: [{ label: 'Back', ghost: 1, fn: () => { hideCard(); mode = 'play'; hud.hidden = false; } }] });
  const wrap = document.createElement('div'); wrap.className = 'pegs';
  for (let n = 0; n < 3; n++) {
    const lo = META.loadouts[n]; const r = document.createElement('div'); r.className = 'peg';
    r.innerHTML = `<b>${n + 1}</b><span class="${lo ? '' : 'dim'}">${lo ? Object.values(lo.names).join(' · ') : 'Empty'}</span>`;
    const w = document.createElement('button'); w.className = 'btn'; w.textContent = 'Wear'; w.disabled = !lo; w.onclick = () => { wearLoadout(n); loadoutCard(); };
    const sv = document.createElement('button'); sv.className = 'btn ghost'; sv.textContent = 'Save'; sv.onclick = () => { saveLoadout(n); loadoutCard(); };
    tipOn(sv, lo ? `Replace peg ${n + 1} with what you wear now.` : `Save what you wear now to peg ${n + 1}.`);
    r.append(w, sv); wrap.appendChild(r);
  }
  const row = $('#cardBtns'); row.parentNode.insertBefore(wrap, row); UI30.cardExtra = wrap;
};

/* ---------- 6. the Rope-House ----------
   Stations are named as you come near (and glow a little), Ilse walks you round on the first
   visit, and the altar, the Gallows Wheel and the Tengu open after the first campaign clear. */
const LATE_ST = { altar: 1, slots: 1, tengu: 1 };
function cabCleared() { return Math.max(META.clears | 0, (META.cleared || []).length) > 0; }
function cabOpen(k) { return !LATE_ST[k] || cabCleared(); }
(function () { const o = drawTengu; drawTengu = function () { if (!cabOpen('tengu')) return; o(); }; })();
(function () {
  const o = findInteract;
  findInteract = function () {
    const b = o(); if (!b || !L || L.def.kind !== 'cabin') return b;
    for (const k of Object.keys(LATE_ST)) if (b.o === CAB[k] && !cabOpen(k)) return null;
    return b;
  };
})();
const STATIONS = [
  ['bed', 'Bed', 'rest · save', 30], ['stash', 'Stash', 'shared by everyone', 34], ['rack', 'Weapon rack', 'loadouts', 52],
  ['ilse', 'Ilse', '', 46], ['table', 'Map table', () => DIFFS[META.pick].n, 30], ['altar', 'The Hungry Altar', 'offer an item', 44],
  ['slots', 'Gallows Wheel', 'gamble', 82], ['bell', 'The bell', 'co-op', 62], ['tengu', 'Kurohana', 'insurance', 56], ['door', 'Door', 'descend', 44],
];
function stationX(k) { if (k === 'door') return L.exit ? L.exit.x * T + 8 : null; return CAB[k] != null ? CAB[k] * T + 8 : null; }
const stLbl = {};
function updStations() {
  const inCab = L && L.def.kind === 'cabin' && mode === 'play' && P && !P.dead;
  for (const [k, n, sub, h] of STATIONS) {
    let el = stLbl[k];
    const x = inCab ? stationX(k) : null;
    if (!inCab || x == null || !cabOpen(k)) { if (el) el.hidden = true; continue; }
    if (!el) { el = stLbl[k] = document.createElement('div'); el.className = 'stl'; lblLayer.appendChild(el); }
    const d = Math.abs(P.x - x), touring = UI30.tourAt === k;
    const a = touring ? 1 : d < 40 ? 1 : d < 150 ? 1 - (d - 40) / 110 : 0;
    if (a <= 0.02) { el.hidden = true; continue; }
    const s = typeof sub === 'function' ? sub() : sub;
    const html = `<b>${n}</b>${s ? `<small>${s}</small>` : ''}`; if (el._h !== html) { el._h = html; el.innerHTML = html; }
    el.hidden = false; el.style.opacity = a.toFixed(2); el.classList.toggle('on', d < 26 || touring);
    el.style.left = scrX(x) + 'px'; el.style.top = scrY(16 * T - h) + 'px';
  }
}
(function () { const o = updLabels; updLabels = function () { o(); updStations(); tourTick(); }; })();
(function () {
  const o = drawPlats;
  drawPlats = function () {
    o();
    if (!L || L.def.kind !== 'cabin' || !P) return;
    for (const [k] of STATIONS) {
      if (!cabOpen(k)) continue; const x = stationX(k); if (x == null) continue;
      const d = Math.abs(P.x - x); if (d > 120 && UI30.tourAt !== k) continue;
      const a = UI30.tourAt === k ? .55 : .35 * (1 - d / 120);
      addLight(x, 16 * T - 18, 44, a, 1, .78, .5);
    }
  };
})();
/* Ilse's tour on the first visit, and a line from her whenever a station opens */
const TOUR = [
  ['bed', 'The bed. Sleep there and the house remembers you.'],
  ['stash', 'The chest is the stash. Everyone who climbs from this house shares it.'],
  ['rack', 'Your rack. Three pegs, three ways of going down.'],
  ['table', 'I drew the Pit on the table. Choose how deep you go.'],
  ['door', 'And the door. Down is that way. Come back.'],
];
const OPEN_LINES = {
  altar: 'Something carved itself into the wall while you were gone. It is hungry. It takes offerings.',
  slots: 'The Gallows Wheel. Men bet their last crowns on it. Don\'t.',
  tengu: 'A tengu has moved in. Kurohana. He sells insurance against the altar, of all things.',
};
function tourStart() {
  const q = [];
  META.cabSeen = META.cabSeen || [];
  if (!META.tour) { q.push(...TOUR); META.tour = 1; }
  for (const k of Object.keys(LATE_ST)) if (cabOpen(k) && !META.cabSeen.includes(k)) { META.cabSeen.push(k); q.push([k, OPEN_LINES[k]]); }
  if (!q.length) return;
  saveGame(); UI30.tour = { q, i: -1, t: 0 };
}
function tourTick() {
  const inCab = L && L.def.kind === 'cabin';
  if (!inCab) { UI30.tourArmed = false; if (UI30.tour) { UI30.tour = null; UI30.tourAt = null; caption(''); } return; }
  if (mode !== 'play') { const T0 = UI30.tour; if (T0 && !T0.hold && T0.i >= 0) { T0.hold = 1; T0.i--; T0.t = 0; caption(''); } return; }
  if (UI30.tour) UI30.tour.hold = 0;
  if (!UI30.tourArmed) { UI30.tourArmed = true; UI30.tourDelay = performance.now() + 1600; return; }
  if (UI30.tourDelay && performance.now() > UI30.tourDelay) { UI30.tourDelay = 0; tourStart(); }
  const T_ = UI30.tour; if (!T_) return;
  const now = performance.now();
  if (now < T_.t) return;
  T_.i++;
  if (T_.i >= T_.q.length) { UI30.tour = null; UI30.tourAt = null; caption(''); return; }
  const [k, line] = T_.q[T_.i]; UI30.tourAt = k;
  caption(`“${line}”`, 'ILSE'); T_.t = now + Math.max(3200, line.length * 55);
}

/* ---------- 5. the kit: one set of sizes, panels and buttons ---------- */
(function () {
  const st = document.createElement('style'); st.id = 'ui30Kit';
  st.textContent = `
:root{--line:#3a2c28;--line2:#5a2a24;--panel:#0d090a;--t-s:max(11px,calc(var(--u)*1.3));--t-m:max(12px,calc(var(--u)*1.6));--t-l:max(13px,calc(var(--u)*1.9));--h-m:calc(var(--u)*3);--h-l:calc(var(--u)*4.2)}
/* buttons: one size, the key as a small badge after the word */
.btn{font-size:var(--t-l);padding:calc(var(--u)*.6) calc(var(--u)*2.2);letter-spacing:.1em}
.btn kbd{display:inline-block;font-size:.62em;letter-spacing:.04em;line-height:1;padding:.22em .4em;margin-left:.55em;border:1px solid currentColor;color:var(--ember);vertical-align:.18em;opacity:.85}
.btn.ghost kbd{color:var(--ash)}
.btn small{display:block;font-size:.6em;letter-spacing:.05em;color:var(--ash);margin-top:.2em}
.btn .more{color:var(--ash);margin-left:.3em}
.mh{font-size:var(--h-l);margin-bottom:calc(var(--u)*1)}
.panel h3{font-size:var(--h-m)}
.hint{font-size:var(--t-s)}
/* cards */
#cardTitle b{font-size:var(--h-l)}
#cardTitle span{display:block;font-size:var(--t-s);letter-spacing:.3em;margin:calc(var(--u)*.5) 0 calc(var(--u)*1.4)}
#card.util .letter{min-height:0;font-size:var(--t-m);text-align:center;max-width:calc(var(--u)*56);cursor:default}
#card.util #ledger{margin-top:calc(var(--u)*.8)}
#cardBtns{margin-top:calc(var(--u)*1.6)}
#cardBtns.koan .btn small{color:var(--r4)}
#cardBtns.shop{display:grid;grid-template-columns:repeat(3,calc(var(--u)*17)) auto;gap:calc(var(--u)*.8);align-items:stretch;justify-content:center}
#cardBtns.shop .btn{margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:calc(var(--u)*.2);padding:calc(var(--u)*.8) calc(var(--u)*1)}
#cardBtns.shop .ware{font-size:var(--t-l)}
#cardBtns.shop .price{font-family:var(--fd);font-size:calc(var(--u)*2.6);color:var(--gold);letter-spacing:0;line-height:1}
#cardBtns.shop .btn.ghost{align-self:center}
/* the map table */
.tierWrap{display:flex;flex-direction:column;align-items:center;gap:calc(var(--u)*1);margin-top:calc(var(--u)*1)}
.tierNow{font-family:var(--fs);font-size:var(--t-m);color:var(--ash)}.tierNow b{color:var(--bone);font-weight:400}
.tiers{display:grid;grid-template-columns:repeat(4,calc(var(--u)*16));gap:calc(var(--u)*.6)}
.tier{display:grid;grid-template-columns:auto 1fr;grid-template-rows:auto auto;column-gap:calc(var(--u)*.7);align-items:center;text-align:left;background:#0d090a;border:1px solid var(--line);color:var(--ash);padding:calc(var(--u)*.5) calc(var(--u)*.8);cursor:pointer;font-family:var(--fs)}
.tier i{grid-row:1/3;font-style:normal;font-family:'Shippori Mincho',var(--fb);font-weight:800;font-size:calc(var(--u)*2.2);color:#9a3a2c}
.tier b{font-weight:400;font-size:var(--t-m);color:var(--bone)}.tier small{font-size:var(--t-s);color:var(--ash)}
.tier:hover:not([disabled]),.tier:focus-visible{border-color:var(--blood);outline:none}
.tier.on{border-color:var(--blood);background:#2a1010;box-shadow:0 0 calc(var(--u)*1.2) rgba(154,31,28,.35)}
.tier.done small{color:var(--gold)}
.tier.lk{opacity:.4;cursor:default}
label.holdt{font-family:var(--fs);font-size:var(--t-m);color:var(--ash);cursor:pointer}
/* the weapon rack */
.pegs{display:flex;flex-direction:column;gap:calc(var(--u)*.6);width:calc(var(--u)*62);margin-top:calc(var(--u)*1.2)}
.peg{display:grid;grid-template-columns:calc(var(--u)*3) 1fr auto auto;gap:calc(var(--u)*.8);align-items:center;background:var(--panel);border:1px solid var(--line);padding:calc(var(--u)*.5) calc(var(--u)*.9);text-align:left}
.peg b{font-family:var(--fd);font-weight:400;font-size:calc(var(--u)*2.4);color:var(--gold);text-align:center}
.peg span{font-family:var(--fs);font-size:var(--t-s);color:var(--bone);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.peg span.dim{color:#5a4e48}
.peg .btn{margin:0;padding:calc(var(--u)*.35) calc(var(--u)*1.4);font-size:var(--t-m)}
/* pause */
#pause .pt{font-size:calc(var(--u)*5)}
#pause h2{font-size:var(--h-m);margin-bottom:calc(var(--u)*1.4)}
#pause .pv{display:flex;flex-direction:column;align-items:stretch;gap:calc(var(--u)*.7);min-width:calc(var(--u)*30)}
#pause .pv .btn{margin:0}
#pause .pvh{font-family:var(--fd);font-size:calc(var(--u)*2.4);color:var(--ash);margin-bottom:calc(var(--u)*.2)}
#pause .cnt{display:inline-block;font-size:.7em;color:var(--gold);margin-left:.4em}
#pause .lore{font-size:var(--t-s);max-width:calc(var(--u)*60);margin-top:calc(var(--u)*2)}
/* settings */
#setScr{background:rgba(4,2,3,.96);z-index:26}
.setGrid{display:grid;grid-template-columns:repeat(2,calc(var(--u)*34));gap:calc(var(--u)*1.6)}
.setGrid .panel{display:flex;flex-direction:column;gap:calc(var(--u)*.9)}
.srow{display:flex;align-items:center;justify-content:space-between;gap:calc(var(--u)*1.4);font-family:var(--fs);font-size:var(--t-m);color:var(--bone);cursor:pointer}
.srow input[type=range]{accent-color:#9a1f1c;width:calc(var(--u)*15)}
.srow input[type=checkbox]{accent-color:#9a1f1c;width:calc(var(--u)*1.8);height:calc(var(--u)*1.8)}
.keyGrid{display:grid;grid-template-columns:repeat(3,calc(var(--u)*22));gap:calc(var(--u)*.5) calc(var(--u)*1.6);text-align:left}
.keyGrid div{display:grid;grid-template-columns:calc(var(--u)*9) 1fr;gap:calc(var(--u)*1);border-bottom:1px solid #1e1616;padding:calc(var(--u)*.35) 0;font-family:var(--fs);font-size:var(--t-m);color:var(--bone)}
.keyGrid kbd{color:var(--ember)}
#setScr .row{margin-top:calc(var(--u)*1.8)}
/* title */
#title .ver{position:absolute;right:calc(var(--u)*1.6);bottom:calc(var(--u)*1.2);font-family:var(--fs);font-size:var(--t-s);color:#5a4e48;letter-spacing:.08em}
#title .keyhint{margin-top:calc(var(--u)*2.2);font-family:var(--fs);font-size:var(--t-s);color:var(--ash);letter-spacing:.06em}
#title .keyhint kbd{color:var(--bone)}
/* the codex: list + page */
#paneCodex{width:min(100%,calc(var(--u)*88))}
#paneCodex #codex:not([hidden]){display:block!important}
#vowsTxt{font-size:var(--t-s);text-align:center}
.lxHead{font-family:var(--fs);font-size:var(--t-s);color:var(--ash);margin-bottom:calc(var(--u)*.6)}
.lx{display:grid;grid-template-columns:calc(var(--u)*26) 1fr;gap:calc(var(--u)*1.4);height:calc(var(--u)*38);text-align:left}
.lxL{display:flex;flex-direction:column;min-height:0;border-right:1px solid #2a2020;padding-right:calc(var(--u)*1)}
.lxList{display:flex;flex-direction:column;gap:2px;flex:1;min-height:0;overflow:hidden}
.lxI{display:flex;align-items:baseline;gap:calc(var(--u)*.7);background:transparent;border:0;border-left:2px solid transparent;color:var(--ash);font-family:var(--fs);font-size:var(--t-m);padding:calc(var(--u)*.3) calc(var(--u)*.7);text-align:left;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lxI i{font-style:normal;font-family:'Shippori Mincho',var(--fb);font-weight:800;color:#9a3a2c;flex:none}
.lxI:hover,.lxI:focus-visible{color:var(--bone);outline:none;background:#140c0c}
.lxI.on{color:var(--bone);border-left-color:var(--blood);background:#1a0e0e}
.lxI.dim{opacity:.5}
.lxG{font-family:var(--fs);font-size:var(--t-s);letter-spacing:.14em;color:var(--gold);padding:calc(var(--u)*.6) calc(var(--u)*.7) calc(var(--u)*.2);display:flex;gap:.5em;align-items:center}
.lxG .tb{display:inline-grid;place-items:center;width:1.4em;height:1.4em;border:1px solid currentColor}
.lxP{display:flex;align-items:center;justify-content:space-between;font-family:var(--fs);font-size:var(--t-s);color:var(--ash);padding-top:calc(var(--u)*.5);border-top:1px solid #2a2020}
.lxPb{background:transparent;border:1px solid var(--line);color:var(--bone);font-size:var(--t-l);width:calc(var(--u)*3.4);height:calc(var(--u)*2.6);cursor:pointer;line-height:1}.lxPb[disabled]{opacity:.3;cursor:default}
.lxF{font-family:var(--fs);font-size:var(--t-s);color:#5a4e48;padding-top:calc(var(--u)*.5)}
.lxR{min-width:0;overflow:hidden}
.lxR .cx{background:transparent;border:0;padding:0;font-size:var(--t-l);line-height:1.5;color:#b9ae9c}
.lxR .cx>b{font-family:var(--fd);font-size:calc(var(--u)*3.2);color:var(--bone);margin-bottom:calc(var(--u)*1)}
.lxR .cx>b small{font-family:var(--fs);font-size:.45em;color:var(--ash);margin-left:auto}
.lxR .cx q{margin-top:calc(var(--u)*1.2);font-size:1.05em}
.lxR .cx.ex,.lxR .cx.cb{border-left:3px solid var(--ec,var(--tc));padding-left:calc(var(--u)*1.4)}
#elemCodex{max-height:none;overflow:visible;padding:0}
#elemCodex .lxR .ey,#elemCodex .lxR .ep,#elemCodex .lxR .seen,#elemCodex .lxR .rc{font-size:.9em;margin-top:calc(var(--u)*.8)}
/* inventory: tighter so the satchel fits */
#inv{padding-top:calc(var(--u)*1.6);padding-bottom:calc(var(--u)*1);gap:calc(var(--u)*.6)}
#invMsg{position:absolute;left:0;right:0;bottom:calc(var(--u)*.4);margin:0;pointer-events:none}
#inv .sortBtn{font-size:var(--t-s);padding:calc(var(--u)*.25) calc(var(--u)*1)}
#inv .bagHead{margin-bottom:calc(var(--u)*.4)}
#inv .tabs{margin-bottom:calc(var(--u)*.8)}
#inv .hint{line-height:1.3}
#inv.selling .tabs{display:none}
#paneTree{display:flex;flex-direction:column;align-items:center;align-self:center}
#paneCodex{align-self:center}
#sellBar{display:flex;align-items:center;justify-content:space-between;gap:calc(var(--u)*1.4);width:calc(var(--u)*70);padding:calc(var(--u)*.2) calc(var(--u)*1);margin-bottom:calc(var(--u)*.2);border:1px solid #6a5020;background:rgba(40,28,8,.6);font-family:var(--fs);font-size:var(--t-m);color:#e8c25a}
#sellBar .btn{margin:0;padding:calc(var(--u)*.25) calc(var(--u)*1.2);font-size:var(--t-m)}
/* the Gallows Wheel */
.slwrap{display:flex;align-items:center;gap:calc(var(--u)*3);margin-top:calc(var(--u)*.6)}
.slside{display:flex;flex-direction:column;align-items:center;gap:calc(var(--u)*.8);width:calc(var(--u)*36)}
.slside .slbets{display:grid;grid-template-columns:repeat(2,1fr);gap:calc(var(--u)*.6);width:100%;margin:0}
.slside .slbets .btn{margin:0}
.slside .slpay{margin-top:0}
.slside .row{margin-top:calc(var(--u)*.4)!important}
.slreel{height:calc(var(--u)*24)}
/* the Tengu */
#tenguScr .tgreel[hidden]{display:none}
/* HUD: the prompt reads from across the room */
#prompt{font-size:var(--t-l);bottom:calc(var(--u)*7.6)}
#prompt kbd{display:inline-block;border:1px solid currentColor;padding:0 .35em;margin-right:.4em;font-size:.85em}
/* Rope-House station names */
.stl{position:absolute;transform:translate(-50%,-100%);text-align:center;pointer-events:none;white-space:nowrap;text-shadow:0 1px 0 #000,0 0 8px #000;transition:opacity .2s}
.stl b{display:block;font-family:var(--fs);font-weight:400;font-size:var(--t-m);color:var(--bone);letter-spacing:.08em}
.stl small{display:block;font-family:var(--fs);font-size:var(--t-s);color:var(--ash);letter-spacing:.06em}
.stl::after{content:"";display:block;width:1px;height:calc(var(--u)*1.2);margin:calc(var(--u)*.2) auto 0;background:linear-gradient(var(--ash),transparent)}
.stl.on b{color:#ffe7b0;text-shadow:0 0 10px rgba(255,190,90,.6),0 1px 0 #000}
#caption .cap-jp{letter-spacing:.3em}
`;
  document.head.appendChild(st);
})();

/* ---------- 5b. one item picker: the altar and the Tengu use the satchel's own grid ---------- */
function pickerGrid(el, onPick, mark, again) {
  if (!el || typeof renderGrid !== 'function') return;
  const h = document.createElement('div'); el.replaceWith(h); h.id = el.id;
  renderGrid(h, GBAG, { cell: 'calc(var(--u)*2.05)', click: it => onPick(it), after: () => again() });
  const tab = GVIEW.bag | 0, items = GBAG.list().filter(it => (it.bt | 0) === tab), els = h.querySelectorAll('.gitem');
  items.forEach((it, i) => { const c = mark(it); if (c && els[i]) els[i].classList.add(...c.split(' ')); });
}
(function () {
  const o = renderAltar;
  renderAltar = function () {
    o();
    pickerGrid($('#alBag'), it => altarPick(it), it => [it === ALTAR.prim ? 'sel' : '', ALTAR.trib.includes(it) ? 'trib' : ''].join(' ').trim(), () => renderAltar());
  };
  const t = renderTengu;
  renderTengu = function () {
    t();
    pickerGrid($('#tgBag'), it => { if (TENGU.busy) return; TENGU.sel = it; TENGU.last = null; hideTip(); AU.tone('triangle', 500, 420, .06, .06, .1); renderTengu(); }, it => [it === TENGU.sel ? 'sel' : '', it.ins ? 'ins' : ''].join(' ').trim(), () => renderTengu());
  };
})();
(function () {
  const st = document.createElement('style');
  st.textContent = `.gholder .gitem.sel{outline:2px solid var(--gold);outline-offset:-2px;box-shadow:0 0 calc(var(--u)*1) rgba(216,178,74,.5)}
.gholder .gitem.trib{outline:2px solid var(--blood);outline-offset:-2px}
.gholder .gitem.ins::after{content:"保";position:absolute;right:2px;top:1px;font-family:'Shippori Mincho',serif;font-size:calc(var(--u)*1);color:#e8c25a}`;
  document.head.appendChild(st);
})();
(function () { const st = document.createElement('style'); st.textContent = `#altarScr .sub,#tenguScr .sub{font-size:var(--t-s);margin-bottom:calc(var(--u)*.6)}#altarScr .mh,#tenguScr .mh{margin-bottom:calc(var(--u)*.3)}#altarScr .panel h3,#tenguScr .panel h3{font-size:calc(var(--u)*2.4);margin-bottom:calc(var(--u)*.5)}`; document.head.appendChild(st); })();
