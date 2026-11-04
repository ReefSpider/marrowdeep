'use strict';
/* ===== tactics (v16): fewer, better blows =====
   Combat had drifted into mashing: every swing was free, every hit stunned the foe, abilities came back almost at once.
   1. Swings cost grit: 4 for a light blow, 7 for a heavy one, and grit stops refilling for half a second after each.
      Swing nonstop for about seven seconds and you're Winded: blows come 40% slower and hit 25% softer until you stop.
      The Hound (rage) swings for free.
   2. Rhythm: a combo press made in the last part of a swing carries on with a beat (+20% damage, a white spark).
      A press in the first 40% of a swing is ignored, so mashing drops combos instead of extending them.
   3. Poise: an ordinary foe flinches from a light blow only once every 0.8 s. Heavy blows, crits and launches still
      always land their stagger. Foes stop being stun-locked and swing back, so dodging matters.
   4. Interrupts: a blow that lands during a foe's wind-up (the glint before a lunge, a slam, a cast or a spit) deals
      +40% and cancels it. Reading the telegraph is the reward.
   5. Abilities come back slower: Hemorrhage 1.6 s (was 0.55), Red Tether 0.9 s (was 0.35).
   6. The Funeral Bell does no damage at all now. It stuns everything near you for 2.6 s (bosses take a heavy jolt of
      stagger instead), costs 40 grit and tolls once every 12 s. */
const SWING_COST={light:4,heavy:7}, GRIT_PAUSE=.5, POISE_T=.8, RHYTHM=1.2, INTERRUPT=1.4;
const WINDUP=new Set(['wind','draw','cast','spit','raise','aim']);
let tacTold={};
function tacTip(k,msg){ if(tacTold[k]) return; tacTold[k]=1; const t=store.get('marrowdeep.tactips')||{}; if(t[k]) return; t[k]=1; store.set('marrowdeep.tactips',t); toast(msg); }

/* ---------- grit per swing, winded, rhythm ---------- */
(function(){ const o=startMove; startMove=function(name,ci,hand){ const r=o(name,ci,hand); const a=P.attack; if(!a||P._remote) return r;
  const mv=MV[name]; if(name!=='plunge'&&P.houndT<=0){ const cost=mv.dm>=1.5?SWING_COST.heavy:SWING_COST.light;
    if(P.grit>=cost) P.grit-=cost; else { a.dur*=1.4; a.winded=1; tacTip('winded','Winded. Every swing costs grit, and grit only comes back when you stop swinging for a moment.'); } }
  P._swingT=time;
  if((hand||'main')==='main'&&ci>0&&P._rhythm){ a.rhythm=1; sparks(P.x+P.face*10,P.y-20,4,'#ffffff'); AU.tone('sine',1320,1320,.05,.05,.2); }
  P._rhythm=false; return r; }; })();
(function(){ const o=updPlayer; updPlayer=function(dt){ if(!P||P._remote) return o(dt);
  const a=P.attack; if(buf.atk!=null&&buf.atk!==P._seenAtk&&a&&a.hand==='main'&&a.mv.t!=='plunge'){ P._seenAtk=buf.atk; const pr=a.t/a.dur;
    if(pr<.4){ buf.atk=null; P._mash=(P._mash||0)+1; if(P._mash>=8) tacTip('rhythm','Strike in rhythm: press as a swing finishes, not while it starts. On-beat strikes hit 20% harder; mashing drops the combo.'); }
    else if(pr>=.6) P._rhythm=true; }
  const g0=P.grit; o(dt); if(time-(P._swingT||-9)<GRIT_PAUSE&&P.grit>g0) P.grit=g0; }; })();

/* ---------- interrupts and rhythm on the blow ---------- */
(function(){ const o=strike; strike=function(e,mv,id,hand,dir,mult){ let m=mult==null?1:mult; const a=P&&P.attack;
  if(a&&a.id===id&&a.rhythm) m*=RHYTHM; if(a&&a.id===id&&a.winded) m*=.75;
  const intr=!e.boss&&!e.dead&&e.hitId!==id&&WINDUP.has(e.state);
  if(intr){ m*=INTERRUPT; }
  const r=o(e,mv,id,hand,dir,m); if(intr&&r&&!e.dead){ e.state=e.fly?'rec':'chase'; e.stun=Math.max(e.stun||0,.5); num(e.x,e.y-e.h-12,'!','#ffd27a',true); AU.ting(); tacTip('interrupt','Interrupted: hitting a foe in its wind-up does 40% more and cancels the attack.'); }
  return r; }; })();

/* ---------- poise: light blows can't stun-lock an ordinary foe ---------- */
(function(){ const o=dmgEnemy; dmgEnemy=function(e,d,crit,dir,kb,heavy,launch,stun){ if(!e||e.boss||e.dead) return o(e,d,crit,dir,kb,heavy,launch,stun);
  const light=!crit&&!heavy&&!launch&&!stun, guarded=light&&e.poiseT>time; const sv=guarded?{stun:e.stun,vx:e.vx,vy:e.vy,state:e.state}:null;
  const r=o(e,d,crit,dir,kb,heavy,launch,stun);
  if(guarded&&!e.dead){ e.stun=sv.stun; e.vx=sv.vx; e.vy=sv.vy; if(e.state!=='drop') e.state=sv.state; }
  else if(!e.dead&&e.stun>0) e.poiseT=time+POISE_T;
  return r; }; })();

/* ---------- abilities come back slower ---------- */
(function(){ const o=castHem; castHem=function(){ const l0=P.life; o(); if(P.life<l0) P.cd.hem=CD.hem; }; })();
(function(){ const o=castTether; castTether=function(){ o(); if(P.teth) P.cd.teth=CD.teth; }; })();

/* ---------- the Funeral Bell: a stun, not a weapon ---------- */
castBell=function(){ if(P.grit<40) return; P.grit-=40; P.cd.bell=CD.bell; AU.bell(); shake(5); const bx=P.x, by=P.y-20; let n=0;
  for(const e of enemies){ if(e.dead||e.intro) continue; const d=Math.hypot(e.x-bx,e.y-e.h/2-by); if(d>=140) continue;
    if(e.boss){ if(typeof bossStagAdd==='function') bossStagAdd(e,(e.stagMax||e.maxhp*.07)*.22,false,false); continue; }
    if(e.type==='anchor'||e.type==='relicx') continue;
    e.stun=Math.max(e.stun||0,2.6); e.state=e.fly?'rec':'chase'; e.vx=Math.sign(e.x-bx)*60; if(e.fly) e.vy=0; e.bellT=2.6; n++; }
  if(n) tacTip('bell','The Bell stuns, it does not wound: use the quiet to cut them down, or to walk away.');
  fx.push({t:0,dur:1.1,draw(f){ const k=f.t/f.dur; const sx=bx-camR.x, sy=by-camR.y; ectx.strokeStyle=`rgba(210,215,240,${((1-k)*.7).toFixed(2)})`; ectx.lineWidth=2; ectx.beginPath(); ectx.ellipse(sx,sy,k*140,k*70,0,0,Math.PI*2); ectx.stroke();
    const a=(1-k)*.6; ectx.strokeStyle=`rgba(230,230,255,${a.toFixed(2)})`; ectx.lineWidth=1; ectx.beginPath(); ectx.moveTo(sx-10,sy-30); ectx.quadraticCurveTo(sx-12,sy-52,sx,sy-54); ectx.quadraticCurveTo(sx+12,sy-52,sx+10,sy-30); ectx.lineTo(sx+14,sy-26); ectx.lineTo(sx-14,sy-26); ectx.closePath(); ectx.stroke(); }}); };
/* stunned by the bell: three slow pale rings over the head */
(function(){ const o=updEnemy; updEnemy=function(e,dt){ o(e,dt); if(e.bellT>0){ e.bellT-=dt; if(e.dead||!(e.stun>0)) e.bellT=0; } }; })();
(function(){ const o=drawEnemies; drawEnemies=function(){ o(); for(const e of enemies){ if(!(e.bellT>0)||e.dead) continue; const sx=e.x-camR.x, sy=e.y-e.h-8-camR.y;
  for(let i=0;i<3;i++){ const a=time*3+i*2.1; ectx.fillStyle='rgba(220,225,255,.8)'; ectx.fillRect(Math.round(sx+Math.cos(a)*7),Math.round(sy+Math.sin(a)*2),1,1); } } }; })();
