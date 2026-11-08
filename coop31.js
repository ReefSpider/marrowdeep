'use strict';
/* ===== v31 co-op: the code stays in reach, and a dropped friend finds their way back =====
   - Pause › Co-op shows the invite code (copy code, copy link), who's in, and who is reconnecting.
     From a solo run the same page opens the descent to friends where you stand, rejoins your last
     descent, or takes you to the join screen.
   - Both sides send a heartbeat once a second. A guest who hears nothing for 12 seconds (or whose
     link closes) doesn't get thrown out: the game holds still and keeps knocking with the same code
     for two minutes, and can go on alone at any point.
   - The host keeps a dropped player's place (seat, colour, fate debt) for two minutes. Coming back
     with the same tab, even after a reload, takes the same place.
   - Anyone joining mid-run lands beside the host, with sealed arenas sealed, opened chests open and
     a boss already awake.
   - A host who reloads hosts again with the same code for 20 minutes, so anyone still knocking gets in.
   - The lobby offers "Rejoin" for the last descent you were in. */
const HOLD_MS = 120e3, RECON_MS = 120e3, HEAR_MS = 12e3;
Object.assign(NET, { heard: {}, held: {}, away: [] });
const CID = (() => { try { let c = sessionStorage.getItem('marrowdeep.cid'); if (!c) { c = Math.random().toString(36).slice(2, 12); sessionStorage.setItem('marrowdeep.cid', c); } return c; } catch (e) { return Math.random().toString(36).slice(2, 12); } })();
let RECON = null;

(function () {
  const st = document.createElement('style'); st.id = 'coop31Css'; st.textContent = `
.cpcode.sm{font-size:calc(var(--u)*3.4);letter-spacing:.24em;margin:0;user-select:all}
.cpPanel{display:flex;flex-direction:column;align-items:center;gap:calc(var(--u)*.7);max-width:calc(var(--u)*72)}
.cpTop{display:flex;align-items:center;gap:calc(var(--u)*2)}.cpL{display:flex;flex-direction:column;align-items:center;gap:calc(var(--u)*.5)}
#pause.pvCoop #pLore{display:none}
.cpPanel .cpk{font-family:var(--fs);font-size:var(--t-s,max(10px,calc(var(--u)*1.05)));letter-spacing:.2em;color:#7a8aa8;text-transform:uppercase}
.cpPanel .row{display:flex;gap:calc(var(--u)*.6);justify-content:center}
.cpPanel .sub{font-family:var(--fs);font-size:max(10px,calc(var(--u)*1.1));color:#8a8a9a;text-align:center;line-height:1.4;margin:0}
.cpPanel .cpseats{min-width:calc(var(--u)*34)}.cpPanel .cpseat{padding:calc(var(--u)*.3) calc(var(--u)*.8);font-size:max(10px,calc(var(--u)*1.2))}
.cpseat.away{color:#d0a070}.cpseat.away i{opacity:.5}
.cplast{display:flex;align-items:center;gap:calc(var(--u)*.8);font-family:var(--fs);font-size:max(10px,calc(var(--u)*1.2));color:#8a8a9a}
.cplast b{font-weight:400;letter-spacing:.18em;color:#cfe0ff}
#coopTeam .tcode{font-family:var(--fs);font-size:max(9px,calc(var(--u)*.95));color:#7a8aa8;letter-spacing:.14em;background:rgba(4,4,6,.55);padding:calc(var(--u)*.2) calc(var(--u)*.6)}
#coopTeam .tm.away{opacity:.75;border-left-style:dashed}
#reconScr{z-index:60;background:radial-gradient(ellipse at 50% 40%,rgba(16,24,40,.88),rgba(3,3,5,.96) 72%)}
#reconScr .mh span{font-family:'Shippori Mincho',serif;color:#6a9ad0}
#reconScr .sub{font-family:var(--fs);font-size:max(11px,calc(var(--u)*1.35));color:#a8a8b8;margin-bottom:calc(var(--u)*.8)}
#reconScr .row{display:flex;gap:calc(var(--u)*.8);margin-top:calc(var(--u)*1.2)}
#reconScr .dots i{display:inline-block;animation:rcd 1.2s infinite;opacity:.2}#reconScr .dots i:nth-child(2){animation-delay:.2s}#reconScr .dots i:nth-child(3){animation-delay:.4s}
@keyframes rcd{40%{opacity:1}}`;
  document.head.appendChild(st);
})();
const reconScr = document.createElement('div'); reconScr.className = 'screen'; reconScr.id = 'reconScr'; reconScr.hidden = true; stage.appendChild(reconScr);

/* ---------- small helpers ---------- */
const NOOP_H = { open() {}, msg() {}, drop() {}, stage() {}, knock() {}, knockFail() {} };
function shut(tr) { if (!tr) return; tr.h = NOOP_H; try { tr.close(); } catch (e) {} }
function remember(host) { if (NET.code) store.set('marrowdeep.lastcoop', { code: NET.code, host: !!host, t: Date.now() }); }
function lastCoop(maxMs) { const l = store.get('marrowdeep.lastcoop'); return l && l.code && Date.now() - l.t < (maxMs || 3 * 3600e3) ? l : null; }
function joinLink(code) { const u = new URL(location.href); u.search = ''; u.hash = ''; u.searchParams.set('join', code); if (QS.get('net')) u.searchParams.set('net', QS.get('net')); return u.toString(); }
function copyTo(btn, text) { try { navigator.clipboard.writeText(text); } catch (e) {} if (btn) { const t = btn.textContent; btn.textContent = 'Copied'; setTimeout(() => { if (btn.isConnected) btn.textContent = t; }, 1400); } }
const heldSeat = s => Object.values(NET.held).find(h => h.s === s);
function sendAway() { NET.away = Object.values(NET.held).map(h => ({ s: h.s, name: h.name })); bcast({ t: 'away', a: NET.away }); }
function inLevel() { return !!(L && L.def && L.def.kind !== 'cabin' && lvlIdx > 0); }

/* reset clears the new bookkeeping too */
(function () { const o = netReset; netReset = function () { o(); NET.heard = {}; NET.held = {}; NET.away = []; }; })();

/* a host who comes back within 20 minutes reuses the old code, so anyone still knocking finds them */
(function () { const o = makeCode; makeCode = function () { if (NET._prefer) { const c = NET._prefer; NET._prefer = null; return c; } return o(); }; })();
(function () { const o = netHost; netHost = async function () { const l = lastCoop(20 * 60e3); if (l && l.host && !NET._prefer) NET._prefer = l.code; await o(); NET._prefer = null; if (NET.host && NET.conn) remember(true); }; })();

/* ---------- hearing from each other ---------- */
(function () { const o = netRecv; netRecv = function (id, m) { NET.heard[id] = Date.now(); return o(id, m); }; })();
/* leaving the page (reload, a crash, closing the tab) is a soft goodbye: your place is kept */
let pageLeaving = false;
const softBye = () => { pageLeaving = true; };
addEventListener('beforeunload', softBye, true); addEventListener('pagehide', softBye, true);
(function () { const o = bcast; bcast = function (m, ex) { if (pageLeaving && m && m.t === 'bye') m = { t: 'bye', soft: 1 }; return o(m, ex); }; })();
(function () { const o = toHost; toHost = function (m) { if (pageLeaving && m && m.t === 'bye') m = { t: 'bye', soft: 1 }; if (m && m.t === 'hello' && !m.cid) m.cid = CID; return o(m); }; })();

setInterval(() => {
  if (!NET.conn || !NET.tr) return;
  const now = Date.now();
  if (NET.host) bcast({ t: 'pg' }); else toHost({ t: 'pg' });
  if (NET.host) {
    for (const id of Object.keys(NET.links)) {
      if (NET.heard[id] == null) { NET.heard[id] = now; continue; }
      if (now - NET.heard[id] > HEAR_MS) { const c = NET.tr.conns && NET.tr.conns.get(id); if (c) { NET.tr.conns.delete(id); try { c.close(); } catch (e) {} } if (NET.tr.peers) NET.tr.peers.delete(id); netDrop(id); }
    }
    let gone = false;
    for (const [k, h] of Object.entries(NET.held)) if (h.until < now) { delete NET.held[k]; delete NET.debt[h.s]; gone = true; if (NET.running) toast(`${h.name} didn't make it back.`); }
    if (gone) sendAway();
  } else if (NET.running && NET.welcomed && now - (NET.heard.host || now) > HEAR_MS) startRecon('No word from the host.');
  if (NET.running && now % 30000 < 1000) remember(NET.host);
}, 1000);

/* ---------- the host: hold a dropped player's place ---------- */
(function () {
  const o = netDrop;
  netDrop = function (id) {
    if (RECON && !NET.host) { shut(NET.tr); NET.tr = null; netReset(); reconNext(); return; }
    if (NET.host && NET.running && !NET._bye && !NET.ending) {
      const s = NET.links[id]; if (s == null) return; const x = seatOf(s);
      delete NET.links[id]; delete NET.heard[id]; NET.seats = NET.seats.filter(q => q.s !== s); delete NET.heroes[s];
      if (x) NET.held[x.cid || ('s' + s)] = { s, name: x.name, lvl: x.lvl, cid: x.cid, until: Date.now() + HOLD_MS };
      toast(`${x ? x.name : 'Someone'} lost the connection. Their place is kept for two minutes.`);
      bcast({ t: 'left', s, away: 1 }); sendAway();
      if (NET.roll && !NET.roll.resolved) rollCheck(); if (NET.betweenLevels) readyCheck(); return;
    }
    if (!NET.host && NET.conn && NET.running && !NET.ending && !NET._bye) { startRecon('Lost the link to the host.'); return; }
    return o(id);
  };
})();

/* what someone arriving mid-run needs to see the level as it is */
function midLvl() {
  const boss = enemies.find(e => e.boss && !e.dead);
  let at = [P.x, P.y]; if (P.dead) { const h = Object.values(NET.heroes).find(h => heroLive(h) && !h.p.dead); if (h) at = [h.p.x, h.p.y]; }
  return { t: 'lvl', ep: NET.epoch, idx: lvlIdx, ngp, vs: (typeof LVVAR !== 'undefined' ? LVVAR.v : 0), wipe: 0, sec: (typeof SECRET !== 'undefined' && SECRET.on && SECRET.from === lvlIdx) ? 1 : 0, mid: 1,
    a: enemies.filter(e => !e.dead && e.nid).map(espec), d: drops.filter(d => d.nid).map(dspec),
    at: [Math.round(at[0]), Math.round(at[1])], lk: L.locked ? 1 : 0, bi: boss && !boss.intro ? 1 : 0,
    ar: L.arenas ? L.arenas.map(a => [a.state, a.wave || 0, a.waves || 0]) : [],
    ch: chests.map(c => ({ x: c.x, y: c.y, tier: c.tier, open: c.open ? 1 : 0, secret: c.secret || 0, elite: c.elite || 0, floorY: c.floorY })) };
}
(function () {
  const o = hostHello;
  hostHello = function (id, m) {
    NET.heard[id] = Date.now();
    if (!NET.running) { const r = o(id, m); const s = NET.links[id]; const x = s != null && seatOf(s); if (x) x.cid = m.cid; return r; }
    const rej = why => NET.tr.send(id, { t: 'reject', why });
    if (m.v !== NET_V) return rej('Your copy of the game doesn\'t match the host\'s. Both of you reload the page.');
    /* the same tab knocking again before its old link timed out: retire the old link, keep the place */
    const dup = m.cid && NET.seats.find(x => x.cid === m.cid);
    if (dup) {
      const oid = idOfSeat(dup.s);
      if (oid != null) { const c = NET.tr.conns && NET.tr.conns.get(oid); if (c) { NET.tr.conns.delete(oid); try { c.close(); } catch (e) {} } if (NET.tr.peers) NET.tr.peers.delete(oid); delete NET.links[oid]; delete NET.heard[oid]; }
      NET.seats = NET.seats.filter(x => x !== dup); delete NET.heroes[dup.s];
      NET.held[m.cid] = { s: dup.s, name: dup.name, lvl: dup.lvl, cid: m.cid, until: Date.now() + HOLD_MS };
    }
    const held = m.cid && NET.held[m.cid] ? NET.held[m.cid] : null;
    let s;
    if (held && !seatOf(held.s)) { s = held.s; delete NET.held[m.cid]; }
    else {
      if (NET.seats.length >= 4) return rej('That descent is full.');
      s = 0; while (s < 4 && (seatOf(s) || heldSeat(s))) s++;
      if (s >= 4) { /* every free place is being kept: give up the one held longest */
        const old = Object.entries(NET.held).filter(([, h]) => !seatOf(h.s)).sort((a, b) => a[1].until - b[1].until)[0];
        if (!old) return rej('That descent is full.'); s = old[1].s; delete NET.held[old[0]];
      }
      delete NET.debt[s];
    }
    let nm = held ? held.name : (m.name || 'Sellsword').replace(/[<>&"]/g, '').slice(0, 16);
    if (!held) { const base = nm; let k = 2; while (NET.seats.some(x => x.name === nm)) nm = base + ' ' + (k++); }
    const x = { s, name: nm, lvl: m.lvl | 0, cid: m.cid };
    NET.seats.push(x); NET.seats.sort((a, b) => a.s - b.s); NET.links[id] = s; NET.heroes[s] = mkHero(x); NET.n = NET.seats.length;
    const tier = NET.tier != null ? NET.tier : (META.pick || 0);
    NET.tr.send(id, { t: 'welcome', s, code: NET.code, tier });
    NET.tr.send(id, { t: 'start', tier, n: NET.n, seats: NET.seats.map(q => ({ s: q.s, name: q.name, lvl: q.lvl })), mid: 1, back: held ? 1 : 0 });
    for (const [lid, ls] of Object.entries(NET.links)) if (ls !== s) NET.tr.send(lid, { t: 'join', x: { s, name: nm, lvl: x.lvl }, seats: NET.seats.map(q => ({ s: q.s, name: q.name, lvl: q.lvl })), back: held ? 1 : 0 });
    if (NET.betweenLevels) { NET.rdy.add(s); }
    else if (inLevel()) setTimeout(() => { if (NET.links[id] === s && NET.running) NET.tr.send(id, midLvl()); }, 400);
    toast(held ? `${nm} is back.` : `${nm} joins the descent.`); sendAway(); AU.tone('triangle', 660, 880, .15, .1, .3);
  };
})();

/* ---------- a guest: messages ---------- */
(function () {
  const o = onMsg;
  onMsg = function (s, m) {
    if (!m) return o(s, m);
    switch (m.t) {
      case 'pg': return;
      case 'away': if (!NET.host) NET.away = m.a || []; return;
      case 'bye':
        if (NET.host) { NET._bye = !m.soft; try { return o(s, m); } finally { NET._bye = false; } }
        if (m.soft && NET.running && !NET.ending) { startRecon('The host dropped out.'); return; }
        NET._bye = true; try { return o(s, m); } finally { NET._bye = false; }
      case 'welcome': o(s, m); NET.heard.host = Date.now(); remember(false);
        if (RECON) { const R = RECON; R.err = 'Back in. Catching up…'; renderRecon(); setTimeout(() => { if (RECON === R && NET.conn && !NET.running) { endRecon(); openCoop(); } }, 1500); }
        return;
      case 'reject': if (RECON) { clearTimeout(NET.helloT); shut(NET.tr); NET.tr = null; netReset(); RECON.err = m.why; RECON.gaveUp = true; renderRecon(); return; } break;
      case 'left': if (!NET.host && m.away) { const nm = nameOf(m.s); NET.seats = NET.seats.filter(x => x.s !== m.s); delete NET.heroes[m.s]; toast(`${nm} lost the connection. Their place is kept for two minutes.`); return; } break;
      case 'join': if (!NET.host && m.back) { NET.seats = m.seats; if (m.x.s !== NET.me) NET.heroes[m.x.s] = mkHero(m.x); NET.n = NET.seats.length; toast(`${m.x.name} is back.`); return; } break;
    }
    return o(s, m);
  };
})();

/* arriving mid-run: stand by the host, and see the level as it is */
(function () {
  const o = loadLevel;
  loadLevel = function (idx, opt) {
    const m = (COOP && !NET.host && NET.pendingLvl && NET.pendingLvl.mid) ? NET.pendingLvl : null;
    const r = o(idx, opt); if (m && L) try { applyMid(m); } catch (e) { console.warn('mid-run join', e); }
    return r;
  };
})();
function applyMid(m) {
  if (m.at) { const off = (NET.me % 2 ? 1 : -1) * Math.ceil(NET.me / 2) * 12; P.x = m.at[0] + off; P.y = m.at[1] - 2; P.vx = P.vy = 0; P.safe = { x: P.x, y: P.y }; P.inv = Math.max(P.inv || 0, 2); }
  if (L.arenas && m.ar) m.ar.forEach(([st, w, ws], i) => { const a = L.arenas[i]; if (!a) return; a.state = st; a.wave = w; a.waves = ws; if (st === 1) setDoors(a, 1); if (st === 2) setDoors(a, 0); });
  L.locked = !!m.lk;
  if (m.ch) { const out = m.ch.map((h, i) => { const c = chests[i]; if (c && c.x === h.x && c.tier === h.tier) { c.open = !!h.open; if (c.open) c.t = 9; return c; } return { x: h.x, y: h.y, tier: h.tier, open: !!h.open, t: h.open ? 9 : 0, falling: false, vy: 0, floorY: h.floorY, secret: h.secret || undefined, elite: h.elite || undefined }; }); chests.length = 0; chests.push(...out); NET.chestN = chests.length; }
  if (m.bi) setTimeout(() => { const b = enemies.find(e => e.boss && e.intro && !e.dead); if (b && COOP) { closeMenus(); bossIntro(b); } }, 700);
}

/* ---------- a guest: reconnecting ---------- */
function startRecon(why) {
  if (RECON || NET.host) return;
  const code = NET.code, me = seatOf(NET.me), name = me ? me.name : myName();
  clearTimeout(NET.helloT); shut(NET.tr); NET.tr = null;
  if (!$('#case').hidden) { $('#case').hidden = true; caseState = null; reveal = null; }
  closeMenus(); if (!$('#card').hidden) hideCard(); $('#death').hidden = true;
  RECON = { code, name, idx: lvlIdx, life: P.life, t0: Date.now(), n: 0, why, err: '', gaveUp: false, timer: null, tr: null, busy: false };
  netReset();
  mode = 'recon'; hud.hidden = true; if (typeof MUS !== 'undefined') MUS.setMood('silent');
  renderRecon(); RECON.timer = setTimeout(reconTry, 600);
}
async function reconTry() {
  const R = RECON; if (!R || R.busy) return; R.busy = true; R.gaveUp = false; R.n++; renderRecon();
  const tr = newTransport(); R.tr = tr; let ok = false;
  try { await tr.join(R.code); ok = true; } catch (e) { R.err = errText(e); }
  R.busy = false; R.tr = null;
  if (RECON !== R) { shut(tr); return; }
  if (!ok) { shut(tr); return reconNext(); }
  NET.tr = tr; NET.code = R.code; NET.host = false; NET.conn = true; NET.heard.host = Date.now();
  toHost({ t: 'hello', v: NET_V, name: R.name, lvl: P.lvl, cid: CID, re: 1 });
  R.err = 'Found the host. Taking your place again…'; renderRecon();
  NET.helloT = setTimeout(() => { if (RECON === R && !NET.welcomed) { shut(NET.tr); NET.tr = null; netReset(); R.err = 'The host didn\'t answer.'; reconNext(); } }, 8000);
}
function reconNext() { const R = RECON; if (!R) return; clearTimeout(R.timer); if (Date.now() - R.t0 > RECON_MS) { R.gaveUp = true; renderRecon(); return; } renderRecon(); R.timer = setTimeout(reconTry, 2500); }
function endRecon() { if (!RECON) return; clearTimeout(RECON.timer); if (RECON.tr) shut(RECON.tr); RECON = null; reconScr.hidden = true; }
function goAlone() {
  const R = RECON; if (!R) return; endRecon(); clearTimeout(NET.helloT); shut(NET.tr); NET.tr = null; netReset(); coopScr.hidden = true;
  ngp = META.pick || 0; const idx = R.idx;
  if (LEVELS[idx] && LEVELS[idx].kind !== 'cabin' && idx > 0) { P.dead = false; P.deadT = 0; P.life = Math.max(R.life || 0, P.stats.life * .5); loadLevel(idx); try { saveGame(); } catch (e) {} }
  mode = 'play'; hud.hidden = false; if (typeof MUS !== 'undefined' && L) MUS.setMood(moodFor(L.def));
  toast('You go on alone, from where you stood. Pause › Co-op rejoins the others.');
}
function renderRecon() {
  const R = RECON; if (!R) return; const secs = Math.floor((Date.now() - R.t0) / 1000);
  reconScr.innerHTML = `<h2 class="mh">Lost the others <span>途切れ</span></h2>
    <div class="sub">${R.gaveUp ? 'Couldn\'t reach the host.' : `${R.why} Reconnecting<span class="dots"><i>.</i><i>.</i><i>.</i></span>`}</div>
    <div class="cpk" style="font-family:var(--fs);color:#7a8aa8;letter-spacing:.2em;font-size:max(10px,calc(var(--u)*1.05))">CODE</div><div class="cpcode sm">${R.code}</div>
    <div class="cpmsg">${R.err || ''}</div>
    <div class="sub" style="font-size:max(10px,calc(var(--u)*1.05));color:#6a6a7a">Attempt ${R.n} · <span id="rcT">${secs}</span>s</div>
    <div class="row">${R.gaveUp ? '<button class="btn" id="rcTry">Try again <kbd>E</kbd></button>' : ''}<button class="btn ghost" id="rcAlone">Go on alone</button></div>
    <div class="hint">Your hero and satchel are safe. Going on alone keeps you where you stood; Pause › Co-op rejoins with the same code.</div>`;
  reconScr.hidden = false;
  const t = $('#rcTry'); if (t) t.onclick = () => { R.t0 = Date.now(); R.err = ''; reconTry(); };
  $('#rcAlone').onclick = goAlone;
}
setInterval(() => { if (RECON) { const t = $('#rcT'); if (t) t.textContent = Math.floor((Date.now() - RECON.t0) / 1000); } }, 1000);
addEventListener('keydown', e => { if (mode === 'recon' && RECON && RECON.gaveUp && (e.key === 'e' || e.key === 'E' || e.key === 'Enter')) { e.preventDefault(); RECON.t0 = Date.now(); RECON.err = ''; reconTry(); } });

/* back with the others: no free heal for having dropped */
(function () {
  const o = coopStart;
  coopStart = function (m) {
    const R = RECON; if (R) endRecon();
    o(m);
    if (R) { P.life = clamp(Math.max(R.life || 0, P.stats.life * .4), 1, P.stats.life); toast('Back with the others.'); }
  };
})();

/* ---------- opening a solo run to friends, where you stand ---------- */
async function hostHere() {
  if (NET.conn) return;
  pcMsg('Opening a door…');
  await netHost();
  if (!(NET.host && NET.conn)) { pcMsg(coopStatus || 'Couldn\'t open a door.'); return; }
  coopScr.hidden = true;
  if (inLevel()) {
    Object.assign(NET, { running: true, n: 1, tier: ngp, debt: {}, heroes: {}, betweenLevels: false, going: false, roll: null, chq: [] });
    COOP = NET; NET.epoch = (NET.epoch || 0) + 1;
    for (const e of enemies) { e.nid = ++NET.nid; if (e.dead) e._ds = 1; }
    for (const d of drops) if (d.kind !== 'orb') d.nid = ++NET.dnid;
    NET.chestN = chests.length; NET.arSt = L.arenas ? L.arenas.map(a => [a.state, a.wave]) : [];
    teamEl.hidden = false; tagsEl.hidden = false;
  }
  coopStatus = ''; if (mode === 'pause') pauseView('coop');
}

/* ---------- Pause › Co-op ---------- */
PV.coop = ['_coopPanel'];
function pcMsg(t) { const m = $('#pcMsg'); if (m) m.textContent = t || ''; }
function seatRows() {
  return [0, 1, 2, 3].map(i => {
    const x = seatOf(i), a = !x && (NET.away || []).find(h => h.s === i);
    if (x) return `<div class="cpseat on"><i style="background:${SEAT_C[i]}"></i>${x.name}${i === 0 ? ' · host' : ''}${i === NET.me ? ' · you' : ''}<small>Lv ${x.lvl}</small></div>`;
    if (a) return `<div class="cpseat away"><i style="background:${SEAT_C[i]}"></i>${a.name}<small>reconnecting…</small></div>`;
    return `<div class="cpseat"><i></i>Empty</div>`;
  }).join('');
}
function renderPanel() {
  let p = $('#p_coopPanel');
  if (!p) { p = document.createElement('div'); p.id = 'p_coopPanel'; p.className = 'cpPanel'; (UI30.park || $('#pause')).appendChild(p); }
  if (NET.conn) {
    const full = NET.seats.length >= 4;
    p.innerHTML = `<div class="cpTop"><div class="cpL"><div class="cpk">Invite code</div><div class="cpcode sm">${NET.code}</div>
      <div class="row"><button class="btn ghost" id="pcCopy">Copy code</button><button class="btn ghost" id="pcLink">Copy link</button></div></div>
      <div class="cpseats">${seatRows()}</div></div>
      <div class="sub">${full ? 'The descent is full.' : NET.running ? 'Friends can join now: Co-op on the title, then this code.' : 'Waiting in the lobby.'} If anyone drops, the same code brings them back.</div>
      <div class="row"><button class="btn ghost" id="pcLeave">${NET.host ? 'End co-op for everyone' : 'Leave co-op'}</button></div>`;
    $('#pcCopy').onclick = e => copyTo(e.currentTarget, NET.code);
    $('#pcLink').onclick = e => copyTo(e.currentTarget, joinLink(NET.code));
    $('#pcLeave').onclick = () => { closePause(); netLeave(); };
  } else {
    const l = lastCoop(); const re = l && !l.host ? l : null; const here = inLevel();
    p.innerHTML = `<div class="sub">${here ? 'Let friends into this descent, here and now. They choose Co-op on the title and type your code.' : 'Play with up to three friends.'}</div>
      <div class="row"><button class="btn" id="pcOpen">${here ? 'Open to friends' : 'Host'}</button><button class="btn ghost" id="pcJoin">Join a friend</button></div>
      ${re ? `<div class="cplast">Last descent <b>${re.code}</b><button class="btn ghost" id="pcRe">Rejoin</button></div>` : ''}
      <div class="cpmsg" id="pcMsg"></div>`;
    $('#pcOpen').onclick = () => { if (here) hostHere(); else { closePause(); openCoop(); netHost(); } };
    $('#pcJoin').onclick = () => { closePause(); openCoop(); setTimeout(() => { const c = $('#cpCode'); c && c.focus(); }, 30); };
    if (re) $('#pcRe').onclick = () => { closePause(); openCoop(re.code); netJoin(re.code); };
  }
  return p;
}
(function () {
  const o = pauseView;
  pauseView = function (v) {
    if (v === 'coop') renderPanel();
    $('#pause').classList.toggle('pvCoop', v === 'coop');
    o(v);
    if (v === 'coop') { const h = $('#pause .pv .pvh'); if (h) h.textContent = 'Co-op'; const f = $('#pause .pv #pcCopy, #pause .pv #pcOpen'); f && f.focus({ preventScroll: true }); }
  };
})();
(function () {
  const o = openPause;
  openPause = function () {
    o();
    let b = $('#pCoop');
    if (!b) { b = document.createElement('button'); b.className = 'btn ghost'; b.id = 'pCoop'; (UI30.park || $('#pause')).appendChild(b); }
    const show = !!(NET.conn || (L && P && !NET.ending));
    b.hidden = !show;
    b.innerHTML = NET.conn ? `Co-op <small class="cnt">${NET.code}</small> <span class="more">›</span>` : 'Co-op <span class="more">›</span>';
    b.onclick = () => pauseView('coop');
    pauseView('main');
  };
})();
/* the team list carries the code and anyone reconnecting */
(function () {
  const o = drawCoopHud;
  drawCoopHud = function () {
    o(); if (mode !== 'play') tagsEl.hidden = true; /* name tags belong to the world, not to the pause menu */
    if (teamEl.hidden) return;
    const html = `${NET.host && NET.seats.length < 4 ? `<div class="tcode">CODE ${NET.code}</div>` : ''}${(NET.away || []).map(a => `<div class="tm away" style="--sc:${SEAT_C[a.s]}"><b>${a.name}</b> · reconnecting…</div>`).join('')}`;
    let x = teamEl.querySelector('.c31'); if (!x) { x = document.createElement('div'); x.className = 'c31'; x.style.display = 'contents'; teamEl.prepend(x); }
    if (x._h !== html) { x._h = html; x.innerHTML = html; }
  };
})();

/* ---------- the lobby: rejoin your last descent ---------- */
(function () {
  const o = renderCoop;
  renderCoop = function (code) {
    o(code);
    if (NET.conn) return;
    const l = lastCoop(); const host = $('#cpHost'); if (!l || !host) return;
    const d = document.createElement('div'); d.className = 'cplast';
    if (!l.host) { d.innerHTML = `Last descent <b>${l.code}</b><button class="btn" id="cpRe">Rejoin</button>`; host.parentNode.insertBefore(d, host); $('#cpRe').onclick = () => netJoin(l.code); }
    else if (Date.now() - l.t < 20 * 60e3) { d.innerHTML = `Hosting again reuses your code <b>${l.code}</b>, so the others can find you.`; host.after(d); }
  };
})();
