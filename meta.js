'use strict';
/* ===== meta: difficulty tiers, save slots, the shared stash, loadouts, the map of the Pit, and the Rope-House =====
   Finishing the campaign on a tier unlocks the next three at once, so a player who has outgrown the Pit can skip ahead.
   Monster levels climb to 100, and so can you. Each character is its own save slot; the stash is shared between them.
   Between descents you live in the Rope-House on the lip of the Pit: rest, sort gear, swap loadouts, talk to Ilse,
   choose how deep the next descent goes, and walk out the door. */

/* ---------- difficulty ---------- */
const DIFFS=[
  {n:'Pilgrim',jp:'巡礼',lo:1,d:'The campaign as written.'},
  {n:'Ashen',jp:'灰',lo:20,d:'The Host remembers you. Elites carry damage types.'},
  {n:'Bloodied',jp:'血塗',lo:28,d:'Packs swell. Rares carry three marks.'},
  {n:'Iron Vow',jp:'鉄誓',lo:36,d:'Champions walk in pairs. Bosses stop waiting.'},
  {n:'Mourning',jp:'喪',lo:44,d:'Rares and uniques carry two damage types.'},
  {n:'Karma',jp:'業',lo:52,d:'Everything you did comes back.'},
  {n:'Purgatory',jp:'煉獄',lo:60,d:'The fire does not go out.'},
  {n:'Netherdeep',jp:'冥',lo:68,d:'Below the Marrowdeep there is more Marrowdeep.'},
  {n:'Asura',jp:'修羅',lo:76,d:'Only war, forever.'},
  {n:'Avīci',jp:'無間',lo:84,d:'The hell without interval.'},
  {n:"Marrow's End",jp:'骨髄',lo:91,d:'Level 100. The bottom of the bottom.'}];
const TOP_TIER=DIFFS.length-1;
const tierNow=()=>clamp(ngp,0,TOP_TIER);
function mlvl(i){ const li=i==null?lvlIdx:i; const L_=LEVELS[li]; if(L_&&L_.kind==='cabin') return 1; const t=tierNow(); return t===0?1+li*2:Math.min(100,DIFFS[t].lo+li); }
const tierRange=t=>t===0?[1,21]:[DIFFS[t].lo,Math.min(100,DIFFS[t].lo+10)];
function diffLabel(){ const t=tierNow(); return `${DIFFS[t].n} · Lv ${mlvl()}`; }
function xpMul(){ return ngp>0?(1+mlvl()*.15)*(1+tierNow()*.3):1; }
(function(){ const o=spawnBoss; spawnBoss=function(key){ const g=ngp; ngp=0; const e=o(key); ngp=g; if(g>0){ const D=diff(), D0=lvlIdx; const hs=x=>(1+.3*x)*(1+x*x*.002), ds=x=>(1+.17*x)*(1+x*x*.0006); e.hp=e.maxhp=Math.round(e.hp*hs(D)/hs(D0)*1.3); e.dmg*=ds(D)/ds(D0)*1.15; } return e; }; })();

/* ---------- save slots ---------- */
const SLOTS_KEY='marrowdeep.slots', STASH_KEY='marrowdeep.stash', MAX_SLOTS=8;
const NAMES=['Aldric','Brenna','Corvin','Dagny','Edda','Garrick','Hild','Isak','Jory','Kael','Maren','Oswin','Rhosyn','Sabine','Torvald','Wren'];
let META=freshMeta(), curSlot=null;
function freshMeta(){ return {unlocked:0,cleared:[],runs:0,pick:0,hold:true,inCabin:false,loadouts:[null,null,null]}; }
function slotsDB(){ let db=store.get(SLOTS_KEY); if(!db||!db.list){ db={list:[],last:null}; const old=store.get(SAVEKEY); if(old&&old.v===2){ db.list.push({id:'s'+Date.now(),name:pick(NAMES)+' of the Wall',created:Date.now(),data:old}); db.last=db.list[0].id; } store.set(SLOTS_KEY,db); } return db; }
function slotGet(id){ return slotsDB().list.find(s=>s.id===id); }
function newSlot(){ const db=slotsDB(); if(db.list.length>=MAX_SLOTS){ db.list.sort((a,b)=>(a.updated||0)-(b.updated||0)); } const used=new Set(db.list.map(s=>s.name.split(' ')[0])); const nm=(NAMES.find(n=>!used.has(n))||pick(NAMES))+' of the Wall';
  const s={id:'s'+Date.now().toString(36)+ri(0,999),name:nm,created:Date.now(),data:null}; db.list.push(s); db.last=s.id; store.set(SLOTS_KEY,db); return s; }
saveGame=function(){ if(!P) return; if(!curSlot){ curSlot=newSlot().id; } const db=slotsDB(); const s=db.list.find(x=>x.id===curSlot); if(!s) return;
  s.data={v:2,lvlIdx,ngp,codex:[...CODEX_OPEN],vows:VOWS_TAKEN,seen:seenIntro,meta:META,P:{lvl:P.lvl,xp:P.xp,sp:P.sp,skills:[...P.skills],gold:P.gold,potions:P.potions,equip:Object.fromEntries(Object.entries(P.equip).map(([k,v])=>[k,serItem(v)])),bag:P.bag.map(serItem)}};
  s.updated=Date.now(); db.last=s.id; store.set(SLOTS_KEY,db); };
loadSave=function(){ const db=slotsDB(); const id=curSlot||db.last; const s=db.list.find(x=>x.id===id); if(!s||!s.data) return null; curSlot=s.id; return s.data; };
(function(){ const o=newGame; newGame=function(){ curSlot=newSlot().id; META=freshMeta(); stopTitleBits(); o(); }; })();
(function(){ const o=continueGame; continueGame=function(){ const sv=loadSave(); META=Object.assign(freshMeta(),sv&&sv.meta||{}); stopTitleBits(); o(); }; })();
function stopTitleBits(){ $('#slotsScr').hidden=true; }
function deleteSlot(id){ const db=slotsDB(); db.list=db.list.filter(s=>s.id!==id); if(db.last===id) db.last=db.list.length?db.list[db.list.length-1].id:null; if(curSlot===id) curSlot=null; store.set(SLOTS_KEY,db); }
function slotWhere(d){ if(!d) return 'Not begun'; const L_=LEVELS[d.lvlIdx]; return L_?L_.name:'—'; }

/* title screen: continue the last character, or pick one */
const slotsScr=document.createElement('div'); slotsScr.className='screen'; slotsScr.id='slotsScr'; slotsScr.hidden=true; stage.appendChild(slotsScr);
function renderSlots(){ const db=slotsDB(); const list=db.list.slice().sort((a,b)=>(b.updated||b.created)-(a.updated||a.created));
  slotsScr.innerHTML=`<h2 class="mh">Who climbs tonight?</h2><div class="slots">${list.map(s=>{ const d=s.data, m=d&&d.meta||{}, p=d&&d.P; const t=m.unlocked||0;
    return `<div class="slotc" data-id="${s.id}"><input class="sn" value="${s.name.replace(/"/g,'&quot;')}" maxlength="28" aria-label="Character name"><div class="sl">${p?`Level <b>${p.lvl}</b> · ${slotWhere(d)}`:'Not begun'}</div>
      <div class="sl">${d?`${DIFFS[clamp(d.ngp||0,0,TOP_TIER)].n}${m.cleared&&m.cleared.length?` · campaign cleared ${m.cleared.length}×`:''} · up to <b>${DIFFS[t].n}</b>`:''}</div>
      <div class="row"><button class="btn sgo"${d?'':' disabled'}>Continue</button><button class="btn ghost sdel">Forget</button></div></div>`; }).join('')}</div>
    <div class="row"><button class="btn" id="slotNew"${list.length>=MAX_SLOTS?' disabled':''}>A new sellsword</button><button class="btn ghost" id="slotBack">Back</button></div><div class="hint">${list.length} / ${MAX_SLOTS} characters · the stash in the Rope-House is shared by all of them</div>`;
  slotsScr.querySelectorAll('.slotc').forEach(c=>{ const id=c.dataset.id; c.querySelector('.sn').onchange=ev=>{ const db=slotsDB(); const s=db.list.find(x=>x.id===id); if(s){ s.name=ev.target.value.trim()||s.name; store.set(SLOTS_KEY,db); } };
    c.querySelector('.sgo').onclick=()=>{ curSlot=id; const db=slotsDB(); db.last=id; store.set(SLOTS_KEY,db); continueGame(); };
    const del=c.querySelector('.sdel'); del.onclick=()=>{ if(del.dataset.sure){ deleteSlot(id); renderSlots(); toTitle(); slotsScr.hidden=false; } else { del.dataset.sure=1; del.textContent='Forget forever?'; } }; });
  $('#slotNew').onclick=()=>{ slotsScr.hidden=true; newGame(); }; $('#slotBack').onclick=()=>{ slotsScr.hidden=true; $('#title').hidden=false; }; }
(function(){ const o=toTitle; toTitle=function(){ curSlot=null; o(); curSlot=null; const db=slotsDB(); const last=db.list.find(s=>s.id===db.last&&s.data); const cb=$('#contBtn');
  cb.hidden=!last; if(last) cb.textContent=`Continue · ${last.name}`; let sb=$('#slotsBtn'); if(!sb){ sb=document.createElement('button'); sb.className='btn ghost'; sb.id='slotsBtn'; sb.textContent='Characters'; $('#startBtn').after(sb); sb.onclick=()=>{ AU.init(); renderSlots(); $('#title').hidden=true; slotsScr.hidden=false; }; }
  sb.hidden=!db.list.length; $('#slotsScr').hidden=true; }; })();
$('#contBtn').onclick=()=>continueGame();
$('#startBtn').onclick=()=>newGame();

/* ---------- the shared stash ---------- */
/* v21: the stash is a grid with tabs. Cells are saved beside the items (marrowdeep.stashPos); tabs open as characters
   finish the campaign (marrowdeep.stashTabs). Stashes from before v21 are placed into the grid on load. */
const STASH_POS_KEY='marrowdeep.stashPos', STASH_TABS_KEY='marrowdeep.stashTabs';
let STASH=(()=>{ const pos=store.get(STASH_POS_KEY)||[]; return (store.get(STASH_KEY)||[]).map((o,i)=>{ const it=deItem(o); const p=pos[i]; if(it&&p&&p[1]!=null){ [it.bt,it.bx,it.by]=p; } return it; }).filter(Boolean); })();
let STASH_TABS=(()=>{ let n=store.get(STASH_TABS_KEY)|0; if(!n){ const db=store.get(SLOTS_KEY); let c=0; for(const sl of (db&&db.list)||[]){ const m=sl.data&&sl.data.meta; if(m) c+=Math.max(m.clears|0,(m.cleared||[]).length); } n=1+c; store.set(STASH_TABS_KEY,n); } return n; })();
const saveStash=()=>{ store.set(STASH_KEY,STASH.map(serItem)); store.set(STASH_POS_KEY,STASH.map(it=>[it.bt|0,it.bx,it.by])); };
{ /* an old 48-slot stash may not fit one tab of cells: open as many tabs as it needs, never lose anything */
  let lost=gEnsure(GSTASH); while(lost.length&&STASH_TABS<STASH_TABS_MAX){ STASH.push(...lost); STASH_TABS++; store.set(STASH_TABS_KEY,STASH_TABS); lost=gEnsure(GSTASH); }
  if(lost.length) STASH.push(...lost.map(it=>(it.bt=0,it.bx=null,it))); saveStash(); }
const stashScr=document.createElement('div'); stashScr.className='screen'; stashScr.id='stashScr'; stashScr.hidden=true; stage.appendChild(stashScr);
function slotEl(it,onclick){ const d=document.createElement('div'); d.className='slot'; if(it){ d.appendChild(iconEl(it)); d.classList.add('r'+it.rarity); bindTip(d,it); d.onclick=onclick; } return d; }
function openStash(){ mode='inv'; hud.hidden=true; stashScr.hidden=false; renderStash(); }
function closeStash(){ stashScr.hidden=true; hideTip(); mode='play'; hud.hidden=false; saveGame(); }
function renderStash(){ stashScr.innerHTML=`<h2 class="mh">The stash 蔵</h2><div class="pane"><div class="panel"><div class="gHead"><h3>Satchel</h3><button class="btn ghost sortBtn" id="sbSortB">Sort</button></div><div id="sbBag"></div><div class="hint">Click or drag across to store · drag to rearrange</div></div>
  <div class="panel"><div class="gHead"><h3>Stash</h3><button class="btn ghost sortBtn" id="sbSortS">Sort</button></div><div id="sbStash"></div><div class="hint">Shared by every character · click or drag across to take</div></div></div><div class="row"><button class="btn" id="sbClose">Close <kbd>Esc</kbd></button></div>`;
  const cell='calc(var(--u)*2.3)';
  renderGrid($('#sbBag'),GBAG,{cell,click:it=>{ if(!stashAdd(it,GVIEW.stash)){ toast('The stash is full.'); return; } P.bag.splice(P.bag.indexOf(it),1); hideTip(); AU.coin(); renderStash(); },after:()=>{ saveStash(); renderStash(); }});
  renderGrid($('#sbStash'),GSTASH,{cell,click:it=>{ if(!bagAdd(it,GVIEW.bag)){ toast('No room in your satchel for that.'); return; } STASH.splice(STASH.indexOf(it),1); saveStash(); hideTip(); AU.coin(); renderStash(); },after:()=>{ saveStash(); renderStash(); }});
  $('#sbSortB').onclick=()=>{ if(sortGrid(GBAG,GVIEW.bag)) renderStash(); }; $('#sbSortS').onclick=()=>{ if(sortGrid(GSTASH,GVIEW.stash)){ saveStash(); renderStash(); } };
  $('#sbClose').onclick=closeStash; }

/* ---------- loadouts: three saved sets of gear on the rack ---------- */
const fp=it=>{ if(!it) return null; const o=serItem(it); delete o.ins; return JSON.stringify(o); };
function findItem(f){ for(const k in P.equip) if(fp(P.equip[k])===f) return {where:'equip',k}; let i=P.bag.findIndex(x=>fp(x)===f); if(i>=0) return {where:'bag',i}; i=STASH.findIndex(x=>fp(x)===f); if(i>=0) return {where:'stash',i}; return null; }
function saveLoadout(n){ META.loadouts[n]={equip:Object.fromEntries(Object.entries(P.equip).map(([k,v])=>[k,fp(v)])),names:Object.fromEntries(Object.entries(P.equip).filter(([k,v])=>v).map(([k,v])=>[k,v.name]))}; saveGame(); toast(`Loadout ${n+1} saved.`); }
function wearLoadout(n){ const lo=META.loadouts[n]; if(!lo) return; let missing=0;
  for(const k in lo.equip){ const f=lo.equip[k]; if(!f){ continue; } if(fp(P.equip[k])===f) continue; const at=findItem(f); if(!at){ missing++; continue; }
    let it; if(at.where==='bag') it=P.bag.splice(at.i,1)[0]; else if(at.where==='stash'){ it=STASH.splice(at.i,1)[0]; saveStash(); } else { it=P.equip[at.k]; P.equip[at.k]=null; }
    const old=P.equip[k]; P.equip[k]=it; if(old){ if(!bagAdd(old)&&!stashAdd(old)) dropItem(old,P.x,P.y-10,true); } }
  saveStash(); calcStats(); P.life=P.stats.life; saveGame(); AU.pickup(); toast(missing?`Loadout ${n+1} worn · ${missing} piece${missing>1?'s':''} no longer owned`:`Loadout ${n+1} worn.`); }
function loadoutCard(){ const row=n=>{ const lo=META.loadouts[n]; return lo?Object.values(lo.names).join(' · '):'Empty'; };
  showCard({title:'The weapon rack',jp:'武具掛け',body:'Three pegs, three ways to go down. Wear a set and anything it needs comes off the rack, out of the satchel or out of the stash.\n\n'+[0,1,2].map(n=>`${n+1}. ${row(n)}`).join('\n'),
    buttons:[0,1,2].flatMap(n=>[{label:`Wear ${n+1}`,disabled:!META.loadouts[n],fn:()=>{ wearLoadout(n); loadoutCard(); }},{label:`Save as ${n+1}`,ghost:1,fn:()=>{ saveLoadout(n); loadoutCard(); }}]).concat([{label:'Done',fn:()=>{ hideCard(); mode='play'; hud.hidden=false; }}])}); $('#cardBtns').classList.add('grid3'); }

/* ---------- difficulty picker at the map table ---------- */
function diffCard(){ const rows=DIFFS.map((d,t)=>{ const [a,b]=tierRange(t), open=t<=META.unlocked, done=META.cleared.includes(t);
    return {label:`<span class="dj">${d.jp}</span> ${d.n} <small>${open?`Monster level ${a}–${b} · ${d.d}${done?' · cleared':''}`:`Locked · clear the campaign on ${DIFFS[Math.max(0,t-3)].n} or higher`}</small>`,disabled:!open,ghost:t!==META.pick,fn:()=>{ META.pick=t; saveGame(); AU.tone('triangle',600,400,.1,.1,.2); diffCard(); }}; });
  const hold=META.hold!==false;
  const hb={label:`${hold?'●':'○'} Hold this tier <small>${hold?'On · every descent stays on the tier you pick here until you change it':'Off · clearing the campaign moves you one tier deeper'}</small>`,ghost:!hold,fn:()=>{ META.hold=!hold; saveGame(); AU.tone('triangle',500,700,.1,.1,.2); diffCard(); }};
  showCard({title:'The map table',jp:'地図台',body:`Ilse has drawn the Pit on the table in candle wax. Pick how deep you go. Clearing the campaign unlocks the next three tiers at once.\n\nChosen: ${DIFFS[META.pick].n}${hold?' (held)':''}. You are level ${P.lvl}.`,buttons:[hb].concat(rows).concat([{label:'Done',fn:()=>{ hideCard(); mode='play'; hud.hidden=false; }}])});
  $('#cardBtns').classList.add('koan','diffs'); }
function campaignCleared(toTitleAfter){ const t=tierNow();
  { const bt0=bagTabs(), st0=stashTabs(); META.clears=charClears()+1; STASH_TABS=Math.min(STASH_TABS_MAX,STASH_TABS+1); store.set(STASH_TABS_KEY,STASH_TABS);
    const got=[]; if(bagTabs()>bt0) got.push(`your satchel gained a pocket (tab ${['I','II','III','IV'][bagTabs()-1]})`); if(stashTabs()>st0) got.push(`the stash gained a tab (${stashTabs()} of ${STASH_TABS_MAX})`);
    if(got.length) setTimeout(()=>toast(`More room: ${got.join(', and ')}.`),toTitleAfter?400:4200); } if(!META.cleared.includes(t)) META.cleared.push(t); const before=META.unlocked; META.unlocked=Math.max(META.unlocked,Math.min(TOP_TIER,t+3)); if(META.hold===false) META.pick=Math.min(META.unlocked,Math.max(META.pick,t+1)); /* v23: the tier holds unless the player lets it climb */
  if(META.unlocked>before) setTimeout(()=>toast(`Unlocked: ${DIFFS.slice(before+1,META.unlocked+1).map(d=>d.n).join(', ')}.${META.hold===false?'':` You stay on ${DIFFS[META.pick].n} until you change it at the map table.`}`),toTitleAfter?0:2200);
  P.life=P.stats.life; goCabin(); if(toTitleAfter) saveGame(); }

/* ---------- the Rope-House ---------- */
PALS.cabin={sky:['#140c0a','#2a1a12','#120a08'],shaft:'rgba(255,180,110,',stone:['#3a2c22','#43332a','#35281f','#4a3a2e'],mortar:'#1a120c',cap:'#5e4836',hi:'#8a6a50',amb:[.5,.4,.33],motif:null};
const CABIN={id:'cabin',kind:'cabin',name:'The Rope-House',jp:'綱の家',act:'Between descents',pal:'cabin',env:'cabin',bg:[]};
LEVELS.push(CABIN); const CABIN_IDX=LEVELS.length-1;
EPIGRAPH.cabin={k:'家',r:'ie',t:'Home. Not a place. A person who kept a candle lit.'};
const CAB={bed:3,stash:7,rack:11,ilse:15,fire:18,table:21,altar:28,slots:35,bell:39};
(function(){ const o=genLevel; genLevel=function(def,seed){ if(def.kind!=='cabin') return o(def,seed);
  const w=46,h=18,g=newGrid(w,h,1); for(let y=2;y<=15;y++) for(let x=1;x<w-1;x++) g[y][x]=0;
  return {w,h,g,spawns:[],chests:[],torches:[{x:CAB.fire,y:13},{x:CAB.ilse+1,y:12},{x:CAB.altar-4,y:11},{x:CAB.altar+4,y:11},{x:CAB.slots+2,y:12}],fg:[],plats:[],pends:[],def,arena:true,surface:false,spawn:{x:5*T,y:16*T},exit:{x:43,y:16},rooms:[],env:'cabin',jets:[],winds:[],nests:[],arenas:[],stones:[],decor:[]}; }; })();
function bakeCabinBG(){ const far=document.createElement('canvas'); far.width=W; far.height=320; const f=far.getContext('2d'); const R_=(x,y,w,h,c)=>{ f.fillStyle=c; f.fillRect(x,y,w,h); };
  R_(0,0,W,320,'#20150f'); for(let x=0;x<W;x+=14){ R_(x,0,13,320,(x/14)%2?'#2a1c14':'#271a12'); R_(x+13,0,1,320,'#140c08'); for(let y=(x*7)%40;y<320;y+=38) R_(x+3,y,1,2,'#1a100a'); }
  for(const bx of [0,W-12]) R_(bx,0,12,320,'#1a110b'); R_(0,46,W,8,'#160e09'); R_(0,46,W,1,'#3a281c');
  const wx=CAB.ilse*T-26, wy=86; R_(wx-4,wy-4,60,52,'#120a06'); const sk=f.createLinearGradient(0,wy,0,wy+44); sk.addColorStop(0,'#0a0610'); sk.addColorStop(1,'#3a0c08'); f.fillStyle=sk; f.fillRect(wx,wy,52,44);
  f.fillStyle='#d8ccb0'; f.beginPath(); f.arc(wx+40,wy+10,4,0,Math.PI*2); f.fill(); for(let i=0;i<14;i++) R_(wx+(i*11)%50,wy+30+((i*7)%8),1,14-((i*7)%8),'#1a0a08'); R_(wx+25,wy,2,44,'#120a06'); R_(wx,wy+21,52,2,'#120a06');
  const fx0=CAB.fire*T-14; R_(fx0-6,150,44,110,'#2c2420'); R_(fx0,182,32,46,'#0c0806'); for(let y=150;y<260;y+=8) R_(fx0-6,y,44,1,'#1e1814');
  const mid=document.createElement('canvas'); mid.width=1200; mid.height=320; return {far,mid}; }
(function(){ const o=loadLevel; loadLevel=function(idx,opt){ const r=o(idx,opt); if(LEVELS[idx]&&LEVELS[idx].kind==='cabin'){ BG=bakeCabinBG(); L.noExit=false; L.locked=false; META.inCabin=true; } else META.inCabin=false; return r; }; })();
const _moodFor=moodFor; moodFor=function(def){ return def&&def.kind==='cabin'?'calm':_moodFor(def); };
function goCabin(){ ngp=META.pick||0; goLevel(CABIN_IDX); }
(function(){ const o=finishLevel; finishLevel=function(){ if(L&&L.def.kind==='cabin'){ startDescent(); return; } o(); }; })();
function startDescent(){ ngp=META.pick||0; META.runs++; META.inCabin=false; P.life=P.stats.life; P.potions=Math.max(P.potions,2); updBelt(); AU.door(); goLevel(1); }
const ILSE=['You came back. You always come back. I hate how much I count on it.','The candle burned down twice while you were gone. I lit it again both times. Don\'t make it three.',
  'Mrs. Harl asked if you were dead. I said not yet. She said that\'s not how that works. It is with you.','The crows bring things up from the Pit now. A ring. A tooth. A letter in your handwriting I don\'t remember you writing.',
  'Eat something. I don\'t care that you\'re not hungry. The Pit doesn\'t get to have you hungry too.','Every time you go deeper the sky goes a little redder. I\'m not asking you to stop. I\'m just telling you what I see.',
  'I mended your cloak. Most of the blood came out. The rest I kept, so I\'d know which parts of you to worry about.'];
function ilseCard(){ showCard({sal:'Ilse sits at the window with the candle.',body:pick(ILSE),sig:'— Ilse',buttons:[{label:'Stay a while',fn:()=>{ hideCard(); mode='play'; hud.hidden=false; P.life=P.stats.life; }}]}); }
(function(){ const o=findInteract; findInteract=function(){ if(!L||L.def.kind!=='cabin') return o(); const b0=o(); if(b0&&b0.o&&b0.o.kind==='item') return b0; let best=null, bd=1e9; const near=(tx,txt,act)=>{ const d=Math.abs(tx*T+8-P.x); if(d<20&&d<bd){ bd=d; best={o:tx,txt,act}; } };
  near(CAB.bed,'<kbd>E</kbd> Rest · heal and save',()=>{ P.life=P.stats.life; P.potions=Math.max(P.potions,2); updBelt(); saveGame(); toast('You sleep. Ilse doesn\'t. Saved.'); });
  near(CAB.stash,'<kbd>E</kbd> Open the stash',openStash); near(CAB.rack,'<kbd>E</kbd> The weapon rack · loadouts',()=>{ mode='card'; loadoutCard(); });
  near(CAB.ilse,'<kbd>E</kbd> Talk to Ilse',()=>{ mode='card'; ilseCard(); }); near(CAB.table,`<kbd>E</kbd> The map table · ${DIFFS[META.pick].n}`,()=>{ mode='card'; diffCard(); });
  const ex=L.exit.x*T+8; if(Math.abs(P.x-ex)<26) { const [a,b]=tierRange(META.pick); best={o:L.exit,txt:`<kbd>E</kbd> Descend · ${DIFFS[META.pick].n} · monster level ${a}–${b}`,act:()=>finishLevel()}; }
  return best; }; })();
function drawCabin(){ if(!L||L.def.kind!=='cabin') return; const F=16*T, R_=(x,y,w,h,c)=>{ ctx.fillStyle=c; ctx.fillRect(Math.round(x-camR.x),Math.round(y-camR.y),w,h); };
  // bed
  let x=CAB.bed*T-10; R_(x,F-10,34,10,'#3a2418'); R_(x,F-12,34,3,'#8a7a62'); R_(x+2,F-15,10,4,'#cfc2a2'); R_(x,F-18,3,18,'#2a1a10'); R_(x+31,F-14,3,14,'#2a1a10'); R_(x+12,F-12,22,4,'#5a1414');
  // stash chest (iron-bound, big)
  x=CAB.stash*T-6; R_(x,F-14,28,14,'#2a1c12'); R_(x,F-14,28,1,'#6a5040'); R_(x+3,F-14,2,14,'#5a5a62'); R_(x+23,F-14,2,14,'#5a5a62'); R_(x,F-19,28,5,'#36261a'); R_(x+12,F-12,4,4,'#a08a50');
  // weapon rack with loadout pegs
  x=CAB.rack*T-8; R_(x,F-40,32,3,'#3a2818'); R_(x,F-4,32,4,'#3a2818'); R_(x+1,F-40,2,40,'#2a1a10'); R_(x+29,F-40,2,40,'#2a1a10');
  for(let i=0;i<3;i++){ const lo=META.loadouts[i]; const px=x+7+i*9; R_(px,F-36,2,2,'#8a7a62'); if(lo){ R_(px,F-34,1,28,'#9a9aa2'); R_(px-2,F-12,5,1,'#55505a'); R_(px,F-11,1,5,'#4a3020'); } }
  // Ilse at the window, a candle
  x=CAB.ilse*T; R_(x-8,F-12,16,12,'#2a1a10'); R_(x-6,F-14,12,2,'#3a2818'); const br=Math.round(Math.sin(time*1.6));
  R_(x-3,F-28+br,7,12,'#4a2a36'); R_(x-2,F-34+br,5,6,'#d8c0a0'); R_(x-3,F-35+br,7,3,'#2a1a14'); R_(x-4,F-33+br,2,8,'#2a1a14'); R_(x+3,F-24+br,4,2,'#d8c0a0');
  R_(x+10,F-26,3,6,'#e8dcc0'); ectx.fillStyle=`rgba(255,${200+Math.round(Math.sin(time*9)*30)},120,.95)`; ectx.fillRect(Math.round(x+11-camR.x),Math.round(F-29-camR.y+Math.sin(time*11)),1,3);
  // the fire
  x=CAB.fire*T; for(let i=0;i<6;i++){ const h=6+Math.abs(Math.sin(time*9+i*1.7))*12; ectx.fillStyle=i%2?'rgba(255,200,90,.9)':'rgba(255,100,30,.85)'; ectx.fillRect(Math.round(x-10+i*4-camR.x),Math.round(F-36-h-camR.y+40),3,Math.round(h)); }
  // the map table, the Pit drawn in wax
  x=CAB.table*T-12; R_(x,F-16,32,3,'#4a3020'); R_(x+2,F-13,3,13,'#2a1a10'); R_(x+27,F-13,3,13,'#2a1a10'); R_(x+4,F-18,24,2,'#cdbf9e'); R_(x+14,F-18,4,2,'#5a0d0e');
  ectx.fillStyle='rgba(255,60,40,.6)'; ectx.fillRect(Math.round(x+15-camR.x),Math.round(F-18-camR.y),2,1); }
(function(){ const o=drawPlats; drawPlats=function(){ drawCabin(); o(); }; })();

/* ---------- the map of the Pit ---------- */
const NODES=[[70,46],[96,232],[148,240],[188,206],[232,198],[262,162],[306,156],[336,120],[378,112],[404,80],[436,40]];
const mapScr=document.createElement('div'); mapScr.className='screen'; mapScr.id='mapScr'; mapScr.hidden=true; mapScr.innerHTML='<canvas id="mapCv" width="960" height="540"></canvas><div class="mapUi"><div id="mapCap"></div><div class="row" id="mapBtns"></div></div>'; stage.appendChild(mapScr);
let mapAnim=null;
function drawMap(from,to,k){ const cv_=$('#mapCv'), g=cv_.getContext('2d'); g.setTransform(2,0,0,2,0,0); g.imageSmoothingEnabled=false;
  const sky=g.createLinearGradient(0,0,0,60); sky.addColorStop(0,'#1a0606'); sky.addColorStop(1,'#4a140c'); g.fillStyle=sky; g.fillRect(0,0,480,60);
  const earth=g.createLinearGradient(0,50,0,270); earth.addColorStop(0,'#1e1614'); earth.addColorStop(1,'#080506'); g.fillStyle=earth; g.fillRect(0,52,480,218);
  for(let i=0;i<9;i++){ g.fillStyle=i%2?'rgba(60,44,36,.35)':'rgba(30,22,20,.4)'; g.beginPath(); g.moveTo(0,70+i*22); for(let x=0;x<=480;x+=20) g.lineTo(x,70+i*22+Math.sin(x*.03+i*1.7)*5); g.lineTo(480,72+i*22+12); g.lineTo(0,72+i*22+12); g.fill(); }
  g.fillStyle='#050304'; g.beginPath(); g.moveTo(60,52); g.bezierCurveTo(30,140,60,262,140,262); g.lineTo(300,250); g.bezierCurveTo(380,220,430,140,452,52); g.lineTo(430,52); g.bezierCurveTo(400,140,340,210,250,226); g.lineTo(160,232); g.bezierCurveTo(100,230,84,150,92,52); g.fill();
  g.fillStyle='#120c0c'; for(let x=0;x<480;x+=9){ const h=6+((x*37)%14); if(x>58&&x<96||x>428&&x<456) continue; g.fillRect(x,52-h,7,h); } g.fillStyle='#d8ccb0'; g.beginPath(); g.arc(420,18,5,0,Math.PI*2); g.fill(); g.fillStyle='#ff3a2a'; g.beginPath(); g.arc(250,-30,70,0,Math.PI); g.globalAlpha=.25; g.fill(); g.globalAlpha=1;
  g.strokeStyle='rgba(216,204,176,.35)'; g.setLineDash([2,3]); g.lineWidth=1; g.beginPath(); NODES.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y)); g.stroke(); g.setLineDash([]);
  g.strokeStyle='rgba(200,40,30,.9)'; g.lineWidth=1.5; g.beginPath(); for(let i=0;i<=Math.min(to,NODES.length-1);i++){ const [x,y]=NODES[i]; if(i>from&&i===to){ const [px,py]=NODES[i-1]; g.lineTo(lerp(px,x,k),lerp(py,y,k)); break; } i?g.lineTo(x,y):g.moveTo(x,y); } g.stroke();
  g.font='7px "IM Fell English SC", Georgia, serif'; g.textBaseline='middle';
  NODES.forEach(([x,y],i)=>{ const def=LEVELS[i], boss=def.kind==='boss', curI=(from===to||k>=1)?to:from, done=i<curI, cur=i===curI; const r=boss?4:3;
    g.fillStyle=done?'#8a1a14':cur?'#ff5a3a':'#2a2220'; g.strokeStyle=cur?'#fff1d8':done?'#c9a96a':'#5a4e48'; g.lineWidth=1; g.beginPath(); if(boss){ g.moveTo(x,y-r-1); g.lineTo(x+r+1,y); g.lineTo(x,y+r+1); g.lineTo(x-r-1,y); g.closePath(); } else g.arc(x,y,r,0,Math.PI*2); g.fill(); g.stroke();
    if(cur){ g.strokeStyle=`rgba(255,90,60,${(.4+.4*Math.sin(time*5)).toFixed(2)})`; g.beginPath(); g.arc(x,y,r+4,0,Math.PI*2); g.stroke(); }
    const right=i===0||i>=9?false:true, lx=x+(right?8:-8); g.textAlign=right?'left':'right'; g.fillStyle=cur?'#fff1d8':done?'#a89a88':'#6a5e56'; g.fillText(def.name,lx,y-3); g.fillStyle=boss?'#a8221a':'#5a4e48'; g.fillText(`${def.act} · Lv ${mlvl(i)}`,lx,y+5); });
  const [ax,ay]=from===to?NODES[to]:[lerp(NODES[from][0],NODES[to][0],k),lerp(NODES[from][1],NODES[to][1],k)]; g.fillStyle='#fff1d8'; g.fillRect(ax-1,ay-9,3,6); g.fillStyle='#5a1414'; g.fillRect(ax-1,ay-11,3,2);
  g.textAlign='left'; g.font='12px "Pirata One", Georgia, serif'; g.fillStyle='#dccfb2'; g.fillText('The Marrowdeep',14,248); g.font='7px "IM Fell English SC", Georgia, serif'; g.fillStyle='#8d827a'; g.fillText(`${DIFFS[tierNow()].jp} ${DIFFS[tierNow()].n} · monster level ${tierRange(tierNow()).join('–')}`,14,262); }
function showMap(from,to,onGo){ const prev=mode; mode='map'; hud.hidden=true; mapScr.hidden=false; const t0=performance.now(); const moving=from!==to;
  const nd=LEVELS[to]; $('#mapCap').innerHTML=moving?`Next: <b>${nd.name}</b> <span>${nd.jp||''}</span>`:`You are in <b>${LEVELS[from].name}</b>`;
  const close=()=>{ cancelAnimationFrame(mapAnim); mapScr.hidden=true; if(onGo) onGo(); else { mode=prev==='pause'?'play':prev; hud.hidden=false; } };
  $('#mapBtns').innerHTML=`<button class="btn" id="mapGo">${moving?'Climb on':'Close'} <kbd>E</kbd></button>`; $('#mapGo').onclick=close; mapScr._close=close;
  const step=now=>{ const k=moving?clamp((now-t0)/1600,0,1):1; drawMap(from,to,1-Math.pow(1-k,3)); mapAnim=requestAnimationFrame(step); }; mapAnim=requestAnimationFrame(step); if(moving) AU.tone('sine',220,330,1.2,.06,.6); $('#mapGo').focus({preventScroll:true}); }
(function(){ const o=nextLevel; nextLevel=function(){ const ni=lvlIdx+1; if(ni<CABIN_IDX&&LEVELS[lvlIdx].kind!=='cabin'){ showMap(lvlIdx,ni,()=>o()); } else o(); }; })();
addEventListener('keydown',ev=>{ const k=ev.key.length===1?ev.key.toLowerCase():ev.key;
  if(mode==='map'&&(k==='e'||k==='Enter'||k==='Escape'||k==='m'||k===' ')){ ev.preventDefault(); ev.stopImmediatePropagation(); if(ev.repeat) return; mapScr._close&&mapScr._close(); return; }
  if(mode==='play'&&k==='m'&&L&&L.def.kind!=='cabin'){ ev.preventDefault(); showMap(lvlIdx,lvlIdx); }
  if(mode==='inv'&&!stashScr.hidden&&['Escape','e','i','t','c','Tab'].includes(k)){ ev.preventDefault(); ev.stopImmediatePropagation(); if(k==='Escape'||k==='e') closeStash(); } },true);
{ const pb=document.createElement('button'); pb.className='btn ghost'; pb.id='pMap'; pb.innerHTML='Map <kbd>M</kbd>'; $('#pCodex').after(pb); pb.onclick=()=>{ $('#pause').hidden=true; mode='play'; if(L&&L.def.kind!=='cabin') showMap(lvlIdx,lvlIdx); else { hud.hidden=false; } }; }
