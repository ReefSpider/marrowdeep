'use strict';
/* ===== v25 fixes from BT's notes on v24 =====
   - Foes swapped in for the Wall-Born kept its "hidden in the stone" flag, so they couldn't be hit (the scarecrows in
     the fields, guards on the bridge). Anything hidden that isn't a Wall-Born is woken.
   - The scarecrow is now a crow-post: it never moves and never hurts you, but it keeps loosing crows at you until
     you cut it down.
   - No chains or pendulums out of doors (the crusher hangs from a ceiling that isn't there).
   - Bright levels: the hero's and foes' lights are turned down, so nobody glows in daylight.
   - The prologue can't be skipped by going home: the door starts at Kesh until it's been finished.
   - The Lantern Zealot stands its ground and throws slowly, only forward.
   - Red Tether goes where the mouse points (and still catches an iron ring near that line).
   - Outdoors, one Blood Arena per level at most (each one drops a chest). */

/* ---------- woken from the stone ---------- */
(function(){ const o=update; update=function(dt){ o(dt); if(!L) return; for(const e of enemies){ if(e.dead||!e.intro||e.boss||e.type==='lurker') continue;
  if(e.state==='hide'){ e.intro=false; e.state=e.type==='scarecrow'?'post':'chase'; } } }; })();

/* ---------- the crow-post ---------- */
EDEF.scarecrow=Object.assign(EDEF.scarecrow,{hp:60,dmg:0,spd:0,xp:16});
CX.scarecrow&&(CX.scarecrow.x='The fields stopped growing when the tithe started. The scarecrows stayed at their posts anyway, and the crows came to them instead of the corn. Cut the post down and the crows have nowhere to come back to.');
(function(){ const o=mkEnemy; mkEnemy=function(s){ const e=o(s); if(e.type==='scarecrow'){ e.state='post'; e.intro=false; e.spawnT=rnd(1,2.5); } return e; }; })();
EAI.scarecrow=function(e,dt,c){ e.vx=0; e.vy+=900*dt; moveBody(e,dt); e.walk=0;
  if(c.vis&&c.adx<240&&Math.abs(c.dy)<120){ e.turn=approach(e.turn||0,1,dt*1.5); if(e.turn>.6) e.face=Math.sign(c.dx)||e.face;
    e.spawnT-=dt; const mine=enemies.filter(o=>!o.dead&&o.from===e).length;
    if(e.spawnT<=0&&mine<4){ e.spawnT=rnd(2.6,3.8); const m=mkEnemyAt('crow',e.x,e.y-28); m.from=e; m.state='flock'; m.fly=true; m.vy=-140; m.vx=e.face*60; m.st=rnd(.4,.8); enemies.push(m);
      AU.noise(.4,2600,900,2,.22,'bandpass',.4); for(let i=0;i<6;i++) part({x:e.x,y:e.y-26,vx:rnd(-40,40),vy:rnd(-60,-10),g:200,life:.5,col:'#141012'}); unlockCodex('scarecrow'); } }
  else e.turn=approach(e.turn||0,0,dt*.5); };
/* the post doesn't swing a sickle any more */
{ const o=EDRAW.scarecrow; EDRAW.scarecrow=(c,e)=>{ const s=e.state; e.state='still'; o(c,e); e.state=s; if((e.turn||0)>.6){ rect(c,-2,-28,1,1,'#b0141a'); rect(c,2,-28,1,1,'#b0141a'); } }; }
/* crows flap whenever they're off the ground */
(function(){ const o=EAI.crow; EAI.crow=function(e,dt,c){ if(e.state!=='perch') e.fly=true; return o(e,dt,c); }; })();
{ const o=EDRAW.crow; EDRAW.crow=(c,e)=>{ if(e.state!=='perch'){ e.fly=true; } o(c,e); }; }

/* ---------- no chains or pendulums outdoors; one arena outdoors ---------- */
(function(){ const o=genLevel; genLevel=function(def,seed){ const Lv=o(def,seed); if(def.open){ Lv.pends=[]; if(Lv.arenas&&Lv.arenas.length>1) Lv.arenas=Lv.arenas.slice(0,1); } return Lv; }; })();
(function(){ const o=loadLevel; loadLevel=function(idx,opt){ const r=o(idx,opt); if(L&&L.def.open){ L.pends=[]; if(L.traps) L.traps=L.traps.filter(t=>t.k!=='crusher'); } return r; }; })();

/* ---------- daylight: less glow round the living ---------- */
function dayDim(){ const d=L&&L.def; if(!d||!d.look) return 1; const pl=PALS[d.pal]; if(!pl||!pl.amb) return 1; const m=(pl.amb[0]+pl.amb[1]+pl.amb[2])/3; return m>.6?clamp(1.6-1.6*m,.25,1):1; }
(function(){ const o=addLight; addLight=function(wx,wy,r,i,cr,cg,cb){ const k=dayDim(); return o(wx,wy,k<1?r*(.7+.3*k):r,i*k,cr,cg,cb); }; })();

/* ---------- the prologue has to be walked ---------- */
function prologueDone(){ if(!META) return true; if(META.prologue) return true; const t=META.pick||0; const far=META.reach&&META.reach[reachKey(t)]; return (far||0)>=1||(META.cleared&&META.cleared.length>0); }
(function(){ const o=startDescent; startDescent=function(){ if(prologueDone()) return o();
  ngp=META.pick||0; META.runs++; META.inCabin=false; P.life=P.stats.life; P.potions=Math.max(P.potions,2); updBelt(); AU.door(); goLevel(0); openingCut(); }; })();
(function(){ const o=redHourCut; redHourCut=function(){ if(META) META.prologue=1; return o(); }; })();

/* ---------- the zealot: one way, slowly ---------- */
EAI.zealot=function(e,dt,c){ e.walk+=dt*Math.abs(e.vx)*.13;
  if(e.state==='aim'){ e.st-=dt; e.vx=0; if(e.st<=0){ const d=clamp(c.adx,60,130); lob('flask',e.x+e.face*6,e.y-22,e.x+e.face*d,e.y-4,e.dmg,.75); e.state='chase'; e.atkCd=rnd(3.6,4.6); } }
  else if(c.vis&&c.adx<200&&Math.abs(c.dy)<60){ e.face=Math.sign(c.dx)||1; e.vx=approach(e.vx,c.adx>40?e.face*e.spd*.7:0,220*dt); if(e.atkCd<=0&&c.adx>50){ e.state='aim'; e.st=.7; unlockCodex('zealot'); }
    else if(c.adx<26&&e.atkCd<=0){ tryHit(e,{x:e.face>0?e.x:e.x-20,y:e.y-20,w:20,h:14},e.dmg*.8); e.atkCd=1.4; } }
  else c.patrol(e.spd*.4);
  grav(e,dt); };

/* ---------- Red Tether follows the mouse ---------- */
(function(){ const o=castTether; castTether=function(){ o(); const t=P.teth; if(!t||!aimMouse) return; const ox=P.x+P.face*4, oy=P.y-18, m=mouseWorld();
  let dx=m.x-ox, dy=m.y-oy; const d=Math.hypot(dx,dy)||1; dx/=d; dy/=d; let best=null, bd=.26;
  for(const g of (typeof ringsNow==='function'?ringsNow():[])){ const gx=g.x-ox, gy=g.y-oy, gd=Math.hypot(gx,gy); if(gd>200||gd<20) continue; const ang=Math.acos(clamp((gx*dx+gy*dy)/gd,-1,1)); if(ang<bd){ bd=ang; best=g; } }
  if(best){ const gx=best.x-ox, gy=best.y-oy, gd=Math.hypot(gx,gy); dx=gx/gd; dy=gy/gd; }
  t.dx=dx; t.dy=dy; if(Math.abs(dx)>.05) P.face=Math.sign(dx); }; })();

/* ---------- the Marrow opens when the Brand tree is full ---------- */
(function(){ const o=calcStats; calcStats=function(){ o(); if(!P||P._remote||typeof marrowOn!=='function'||marrowOn()||!P.skills) return;
  if(SKILLS.every(s=>P.skills.has(s.id))){ unlockMarrow(true); o(); setTimeout(()=>toast('Every brand burned in. The Marrow 髄 opens in your satchel.'),400); } }; })();
