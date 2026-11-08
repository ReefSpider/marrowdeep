'use strict';
/* ===== retreat (v18): from the first playtest =====
   1. Abandon the descent (pause menu, solo, in the Pit): go home to the Rope-House with everything you carry, rather than
      dying over and over to foes you can't beat. Nothing breaks. Asks once to confirm.
   2. Start deeper: the Rope-House door offers the start of every act you've reached on the chosen tier (the Ossuary,
      the Drowned Chapel, the Warren, the Kiln, the Breach), so going home to gear up doesn't cost the whole climb.
      Maps are new every visit, so replaying an act is a fresh run, not a repeat.
   3. Chests always land where you can open them. Arena and last-chamber reliquaries dropped onto row 14 even when a
      mound or pillar stood there, and a coffer from a body landed in whatever tile the corpse was in (a foe knocked
      into a wall dropped it into the rock). Now every chest, the moment it appears, is moved to the nearest spot with
      solid floor and two tiles of open air above it, searching outward from where it was meant to land. */
const ACT_STARTS=LEVELS.map((d,i)=>[d,i]).filter(([d])=>d.kind==='dungeon').map(([,i])=>i);
function reachKey(t){ return 't'+t; }
(function(){ const o=goLevel; goLevel=function(i){ const r=o(i); const d=LEVELS[i]; if(d&&(d.kind==='dungeon'||d.kind==='boss')&&!(typeof COOP!=='undefined'&&COOP)&&!(typeof SECRET!=='undefined'&&SECRET.on)){ META.reach=META.reach||{}; const k=reachKey(ngp); META.reach[k]=Math.max(META.reach[k]||1,i); } return r; }; })();

/* ---------- abandon ---------- */
function abandonDescent(){ $('#pause').hidden=true; mode='card'; hud.hidden=true;
  showCard({title:'Abandon the descent?',jp:'退却',body:`Climb back to the Rope-House now, with everything you carry. Nothing breaks. You can start again from any act you've reached.`,
    buttons:[{label:'Go home',fn:()=>{ hideCard(); if(typeof ptClose==='function') ptClose('abandoned'); P.life=P.stats.life; AU.door(); goCabin(); toast('You climb back out of the dark. Everything you carried came with you.'); }},{label:'Stay',ghost:1,fn:()=>{ hideCard(); openPause(); }}]}); }
(function(){ const o=openPause; openPause=function(){ o(); const col=$('#pause .col'); let b=$('#pAbandon'); if(!b&&col){ b=document.createElement('button'); b.className='btn ghost'; b.id='pAbandon'; b.textContent='Abandon run'; col.insertBefore(b,$('#pTitle')||null); }
  if(b){ b.hidden=!!(typeof COOP!=='undefined'&&COOP)||!L||L.def.kind==='cabin'; b.onclick=abandonDescent; } }; })();

/* ---------- the door: start at any act reached ---------- */
(function(){ const o=startDescent; startDescent=function(){ const t=META.pick||0; const far=(META.reach&&META.reach[reachKey(t)])||1; const opts=ACT_STARTS.filter(i=>i<=far);
  if(opts.length<2) return o();
  mode='card'; hud.hidden=true;
  showCard({title:'Where do you climb in?',jp:'入口',body:`${typeof DIFFS!=='undefined'?DIFFS[t].n+' · ':''}Every act you've reached on this tier. The maps will be new.`,
    buttons:opts.map(i=>({label:`${LEVELS[i].act} · ${LEVELS[i].name}`,fn:()=>{ hideCard(); o(); if(i!==1){ lvlIdx=i-1; goLevel(i); } }})).concat([{label:'Back',ghost:1,fn:()=>{ hideCard(); mode='play'; hud.hidden=false; }}])}); }; })();

/* ---------- chests land where you can reach them ---------- */
function standAt(tx,ty){ const v=tileAt(tx,ty); return (v===1||v===2)&&tileAt(tx,ty-1)===0&&tileAt(tx,ty-2)===0; }
function safeChestSpot(x,y){ const tx0=Math.floor(x/T), ty0=Math.floor(y/T); let best=null, bs=1e9;
  for(let dx=0;dx<=14;dx++){ for(const sg of dx?[1,-1]:[1]){ const tx=tx0+sg*dx; if(tx<1||tx>=L.w-1) continue;
      for(let ty=Math.max(2,ty0-6);ty<=Math.min(L.h-1,ty0+14);ty++){ if(!standAt(tx,ty)) continue; const sc=dx*2+Math.abs(ty-ty0)*(ty<ty0?1.5:.6); if(sc<bs){ bs=sc; best={x:tx*T+8,y:ty*T}; } } }
    if(best&&bs<dx*2) break; }
  return best; }
function settleChest(c){ c._safe=1; if(!L||!L.g) return; const want=c.falling?(c.floorY||(typeof FLOOR==="function"?FLOOR():c.y)):c.y; const tx=Math.floor(c.x/T), ty=Math.floor((want-1)/T)+1;
  if(standAt(tx,ty)&&Math.abs(ty*T-want)<2) { if(c.falling) c.floorY=ty*T; return; }
  const s=safeChestSpot(c.x,want); if(!s) return; c.x=s.x; if(c.falling) c.floorY=s.y; else c.y=s.y; }
(function(){ const o=update; update=function(dt){ if(chests) for(const c of chests) if(!c._safe) settleChest(c); return o(dt); }; })();
(function(){ const o=loadLevel; loadLevel=function(idx,opt){ const r=o(idx,opt); if(chests) for(const c of chests) if(!c.secret) settleChest(c); else c._safe=1; return r; }; })();
