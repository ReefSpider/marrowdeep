'use strict';
/* ===== v41: the late game bites (BT, 9 Nov: "cruising at level 40 … much much harder to level and enemies after 50") =====
   What the lab showed before this: at monster level 40 a legendary or unique kit killed a ghoul in 0.35 s and took ~20
   ghoul blows to die; bosses needed ~8 blows. Nothing late was a threat.
   1. Foes: from monster level 30 they gain life and damage a little each level, and from 50 a lot each level.
        life   ×1 at 30 · ×1.2 at 40 · ×1.4 at 50 · ×1.9 at 60 · ×2.7 at 76 · ×3.9 at 100
        damage ×1 at 30 · ×1.25 at 40 · ×1.5 at 50 · ×1.75 at 60 · ×2.15 at 76 · ×2.75 at 100
      Bosses take three quarters of the damage step-up (full, they two-shot geared heroes on Marrow's End) and the square
      root of the life step-up, so a fight gets deadlier without turning into a three-minute grind (×2 life at 100).
   2. Levels: past 40 each level costs 6% more than the last on top of the old curve, and past 50 another 10% a level
      (capped at ×20): ×1.8 at 50, ×2.9 at 55, ×4.6 at 60, ×12 at 70, ×20 from 72. Slower kills (more life to chew
      through) slow it further.
   HARD holds every number. ?hard=0 in the address turns the whole file off, for comparing. */
const HARD={on:!/[?&]hard=0\b/.test(location.search),
  hp:{from:30,a:.02,knee:50,b:.05}, dmg:{from:30,a:.025,knee:50,b:.025}, bossDmg:.75, bossHpPow:.5,
  xp:{from:40,a:1.06,knee:50,b:1.10,cap:20}};
const hardCurve=(c,m)=>1+c.a*Math.max(0,Math.min(m,c.knee)-c.from)+c.b*Math.max(0,m-c.knee);
function hardHp(m){ if(!HARD.on) return 1; return hardCurve(HARD.hp,m==null?(typeof mlvl==='function'?mlvl():1):m); }
function hardDmg(m){ if(!HARD.on) return 1; return hardCurve(HARD.dmg,m==null?(typeof mlvl==='function'?mlvl():1):m); }
function hardXp(l){ if(!HARD.on) return 1; const x=HARD.xp; if(l<=x.from) return 1;
  return Math.min(x.cap,Math.pow(x.a,Math.min(l,x.knee)-x.from)*Math.pow(x.b,Math.max(0,l-x.knee))); }

/* ---------- 1. foes ---------- */
(function(){ const o=mkEnemy; mkEnemy=function(s){ const e=o(s); if(!e||e.type==='anchor'||e.type==='relicx') return e; const h=hardHp(), d=hardDmg();
  if(h!==1){ e.hp*=h; e.maxhp*=h; } if(d!==1) e.dmg*=d; return e; }; })();
(function(){ const o=spawnBoss; spawnBoss=function(k){ const e=o(k); if(!e) return e; const h=Math.pow(hardHp(),HARD.bossHpPow), d=1+(hardDmg()-1)*HARD.bossDmg;
  if(h!==1){ e.hp=Math.round(e.hp*h); e.maxhp=Math.round(e.maxhp*h); } if(d!==1) e.dmg*=d; return e; }; })();

/* ---------- 2. levels ---------- */
(function(){ const o=xpNext; xpNext=function(l){ return Math.round(o(l)*hardXp(l)); }; })();

/* the playtest report notes the step-up each visit ran at */
(function(){ if(typeof ptClose!=='function') return; const o=ptClose; ptClose=function(how){ const v=typeof PT!=='undefined'&&PT.v; if(v&&typeof mlvl==='function'){ const m=mlvl(); v.hard={hp:+hardHp(m).toFixed(2),dmg:+hardDmg(m).toFixed(2),xp:P?+hardXp(P.lvl).toFixed(2):1}; } return o(how); }; })();
