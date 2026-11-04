'use strict';
/* ===== playtest stats (v17) =====
   Everything stays on the player's machine (localStorage 'marrowdeep.playtest'). Nothing is sent anywhere.
   Pause menu → Playtest report shows a summary and a "Copy report" button: the player pastes it to whoever asked.
   Recorded, per level visit: tier, play time (only while actually playing), kills, deaths and what killed you,
   damage taken and dealt, draughts drunk, swings, on-beat swings, interrupts, times Winded, whether it was cleared.
   Per boss fight: how long, deaths during it, whether it was finished by hand, your level and gear.
   Also: items broken, seals spent, combinations seen, which Way you chose, co-op or solo.
   The newest 300 entries are kept. */
const PT_KEY='marrowdeep.playtest', PT_MAX=300;
const PT={v:null,boss:null};
function ptLoad(){ const d=store.get(PT_KEY); return d&&d.ev?d:{since:Date.now(),ev:[]}; }
function ptPush(e){ const d=ptLoad(); e.at=Date.now(); d.ev.push(e); if(d.ev.length>PT_MAX) d.ev.splice(0,d.ev.length-PT_MAX); store.set(PT_KEY,d); }
const ptGear=()=>{ if(!P) return null; const r=Object.values(P.equip).filter(Boolean).map(i=>i.rarity); return {pow:P.power||0,rar:r}; };
function ptOpen(idx){ ptClose('left'); const def=LEVELS[idx]; if(!def||def.kind==='cabin') return;
  PT.v={k:'visit',lvl:def.id,tier:ngp,plvl:P?P.lvl:0,way:P&&P.way||null,coop:typeof COOP!=='undefined'&&COOP?NET.seats.length:1,omen:L&&L.omen||null,t:0,kills:0,deaths:0,killers:{},taken:0,dealt:0,draughts:0,swings:0,beat:0,intr:0,winded:0,broke:0,seals:0,cleared:false}; }
function ptClose(how){ const v=PT.v; if(!v) return; PT.v=null; if(how==='cleared') v.cleared=true; v.t=Math.round(v.t); v.taken=Math.round(v.taken); v.dealt=Math.round(v.dealt); if(v.t>3||v.cleared) ptPush(v); }
(function(){ const o=goLevel; goLevel=function(i){ const r=o(i); ptOpen(i); return r; }; })();
(function(){ const o=finishLevel; finishLevel=function(){ ptClose('cleared'); return o(); }; })();
(function(){ const o=coopFin; coopFin=function(idx){ ptClose('cleared'); return o(idx); }; })();
(function(){ const o=update; update=function(dt){ const pot=P?P.potions:0; o(dt); const v=PT.v; if(!v||!P) return; v.t+=dt; if(P.potions<pot) v.draughts+=pot-P.potions; if(PT.boss&&!PT.boss.done) PT.boss.t+=dt; }; })();
(function(){ const o=hurtPlayer; hurtPlayer=function(d,src){ const l0=P?P.life:0; const r=o(d,src); if(PT.v&&P&&P.life<l0){ PT.v.taken+=l0-P.life; PT.lastSrc=src&&(src.boss?src.kind:src.type)||'hazard'; } return r; }; })();
(function(){ const o=dmgEnemy; dmgEnemy=function(e,d,...rest){ const h0=e&&e.hp; const r=o(e,d,...rest); if(PT.v&&e&&e.hp<h0) PT.v.dealt+=h0-Math.max(0,e.hp); return r; }; })();
(function(){ const o=killEnemy; killEnemy=function(e,dir,crit){ const was=e.dead; o(e,dir,crit); if(!was&&e.dead&&PT.v&&!e.boss) PT.v.kills++; }; })();
(function(){ const o=startMove; startMove=function(name,ci,hand){ const r=o(name,ci,hand); const a=P&&P.attack; if(PT.v&&a&&!P._remote){ PT.v.swings++; if(a.rhythm) PT.v.beat++; if(a.winded) PT.v.winded++; } return r; }; })();
(function(){ const o=strike; strike=function(e,mv,id,hand,dir,mult){ const w=!e.boss&&!e.dead&&e.hitId!==id&&WINDUP.has(e.state); const r=o(e,mv,id,hand,dir,mult); if(r&&w&&PT.v) PT.v.intr++; return r; }; })();
function ptDeath(){ const v=PT.v; if(!v) return; v.deaths++; const k=PT.lastSrc||'unknown'; v.killers[k]=(v.killers[k]||0)+1; if(PT.boss&&!PT.boss.done) PT.boss.deaths++;
  ptPush({k:'death',lvl:v.lvl,tier:v.tier,by:k,plvl:P.lvl,tIn:Math.round(v.t),coop:v.coop}); }
(function(){ const o=onDeath; onDeath=function(){ const fresh=!deathShown&&!(typeof COOP!=='undefined'&&COOP); if(fresh) ptDeath(); return o(); }; })();
(function(){ const o=wipeIn; wipeIn=function(){ ptDeath(); return o(); }; })();
(function(){ const o=breakOnDeath; breakOnDeath=function(){ const r=o(); if(r&&PT.v){ if(r.saved) PT.v.seals++; else PT.v.broke++; } return r; }; })();
(function(){ const o=bossIntro; bossIntro=function(e){ if(!PT.boss||PT.boss.e!==e) PT.boss={e,kind:e.kind,tier:ngp,t:0,deaths:0,plvl:P.lvl,gear:ptGear(),coop:typeof COOP!=='undefined'&&COOP?NET.seats.length:1,done:false}; return o(e); }; })();
(function(){ const o=bossDefeated; bossDefeated=function(e){ const b=PT.boss; if(b&&!b.done){ b.done=true; ptPush({k:'boss',boss:b.kind,tier:b.tier,secs:Math.round(b.t),deaths:b.deaths,byHand:!!e.finisher,plvl:b.plvl,gear:b.gear,coop:b.coop}); } return o(e); }; })();

/* ---------- the report ---------- */
function ptSummary(){ const d=ptLoad(), ev=d.ev; const visits=ev.filter(e=>e.k==='visit'), deaths=ev.filter(e=>e.k==='death'), bosses=ev.filter(e=>e.k==='boss');
  const by={}; for(const v of visits){ const k=v.lvl+'@'+v.tier; const b=by[k]||(by[k]={lvl:v.lvl,tier:v.tier,n:0,clr:0,t:0,deaths:0,kills:0,swings:0,beat:0,intr:0,winded:0,draughts:0}); b.n++; if(v.cleared){ b.clr++; b.t+=v.t; } b.deaths+=v.deaths; b.kills+=v.kills; b.swings+=v.swings; b.beat+=v.beat; b.intr+=v.intr; b.winded+=v.winded; b.draughts+=v.draughts; }
  const killers={}; for(const x of deaths) killers[x.by]=(killers[x.by]||0)+1;
  const bossBy={}; for(const b of bosses){ const k=b.boss+'@'+b.tier; const x=bossBy[k]||(bossBy[k]={boss:b.boss,tier:b.tier,n:0,secs:0,deaths:0,hand:0}); x.n++; x.secs+=b.secs; x.deaths+=b.deaths; if(b.byHand) x.hand++; }
  const sw=visits.reduce((a,v)=>a+v.swings,0), bt=visits.reduce((a,v)=>a+v.beat,0);
  return {since:new Date(d.since).toISOString().slice(0,10),v:typeof NET_V!=='undefined'?NET_V:'',levels:Object.values(by),killers,bosses:Object.values(bossBy),swings:sw,onBeat:sw?+(bt/sw*100).toFixed(1):0,
    broke:visits.reduce((a,v)=>a+v.broke,0),seals:visits.reduce((a,v)=>a+v.seals,0),combos:typeof COMBO_SEEN!=='undefined'?COMBO_SEEN:{},ways:[...new Set(visits.map(v=>v.way).filter(Boolean))]}; }
const ptName=id=>{ const l=LEVELS.find(x=>x.id===id); return l?l.name:BOSSES[id]?BOSSES[id].name:EDEF[id]?EDEF[id].name:id; };
const ptTier=t=>typeof DIFFS!=='undefined'&&DIFFS[t]?DIFFS[t].n:'Tier '+t;
function ptText(s){ const L_=[`Marrowdeep playtest report · ${s.v} · since ${s.since}`,''];
  L_.push('Levels (visits · cleared · avg minutes to clear · deaths · kills · on-beat % · interrupts · winded · draughts):');
  for(const l of s.levels) L_.push(`  ${ptName(l.lvl)} [${ptTier(l.tier)}]: ${l.n} · ${l.clr} · ${l.clr?(l.t/l.clr/60).toFixed(1):'–'} · ${l.deaths} · ${l.kills} · ${l.swings?(l.beat/l.swings*100).toFixed(0):0}% · ${l.intr} · ${l.winded} · ${l.draughts}`);
  L_.push('','Bosses (fights won · avg minutes · deaths · finished by hand):'); for(const b of s.bosses) L_.push(`  ${ptName(b.boss)} [${ptTier(b.tier)}]: ${b.n} · ${(b.secs/b.n/60).toFixed(1)} · ${b.deaths} · ${b.hand}`);
  L_.push('','What killed you: '+(Object.entries(s.killers).sort((a,b)=>b[1]-a[1]).map(([k,n])=>`${ptName(k)} ${n}`).join(', ')||'nothing yet'));
  L_.push(`Swings ${s.swings}, on the beat ${s.onBeat}% · items broken ${s.broke}, seals spent ${s.seals} · Ways: ${s.ways.join(', ')||'none'}`);
  L_.push('Combinations seen: '+(Object.entries(s.combos).map(([k,n])=>`${k} ${n}`).join(', ')||'none'));
  L_.push('','RAW '+JSON.stringify(s)); return L_.join('\n'); }
const ptEl=document.createElement('div'); ptEl.className='screen'; ptEl.id='ptScr'; ptEl.hidden=true; stage.appendChild(ptEl);
(function(){ const st=document.createElement('style'); st.textContent=`#ptScr{background:rgba(4,3,4,.96);z-index:40}
#ptScr pre{font-family:var(--fs);font-size:max(10px,calc(var(--u)*1.15));color:var(--bone);text-align:left;white-space:pre-wrap;max-width:calc(var(--u)*80);max-height:60%;overflow:auto;background:#0a0708;border:1px solid #2a2020;padding:calc(var(--u)*1)}
#ptScr .sub{font-family:var(--fs);color:#9a8a7a;font-size:max(10px,calc(var(--u)*1.15));max-width:calc(var(--u)*70);margin:calc(var(--u)*.6) 0}`; document.head.appendChild(st); })();
let ptPrev='pause';
function openReport(){ ptPrev=mode; mode='report'; $('#pause').hidden=true; const s=ptSummary(), txt=ptText(s), short=txt.split('\nRAW ')[0];
  ptEl.innerHTML=`<h2 class="mh">Playtest report</h2><div class="sub">Kept on this machine only. Copy it and send it to whoever is testing the game with you.</div><pre>${short.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</pre>
    <div class="row"><button class="btn" id="ptCopy">Copy report</button><button class="btn ghost" id="ptClear">Clear</button><button class="btn ghost" id="ptBack">Back <kbd>Esc</kbd></button></div>`;
  ptEl.hidden=false;
  $('#ptCopy').onclick=()=>{ const done=()=>{ $('#ptCopy').textContent='Copied'; }; try{ navigator.clipboard.writeText(txt).then(done,()=>fallback()); }catch(e){ fallback(); }
    function fallback(){ const ta=document.createElement('textarea'); ta.value=txt; document.body.appendChild(ta); ta.select(); try{ document.execCommand('copy'); done(); }catch(e){} ta.remove(); } };
  $('#ptClear').onclick=()=>{ if($('#ptClear').dataset.sure){ store.del(PT_KEY); openReport(); return; } $('#ptClear').dataset.sure=1; $('#ptClear').textContent='Clear everything?'; };
  $('#ptBack').onclick=closeReport; }
function closeReport(){ ptEl.hidden=true; if(ptPrev==='pause'){ mode='pause'; $('#pause').hidden=false; } else { mode='play'; hud.hidden=false; } }
addEventListener('keydown',ev=>{ if(mode==='report'&&ev.key==='Escape'){ ev.preventDefault(); ev.stopImmediatePropagation(); closeReport(); } },true);
(function(){ const o=openPause; openPause=function(){ o(); const col=$('#pause .col'); let b=$('#pReport'); if(!b&&col){ b=document.createElement('button'); b.className='btn ghost'; b.id='pReport'; b.textContent='Playtest report'; col.appendChild(b); } if(b) b.onclick=openReport; }; })();
if(typeof BG_MODES!=='undefined') BG_MODES.add('report');
