'use strict';
/* ===== foes (v23): smarter feet, and new traps =====
   - Walking foes hop up steps of one or two tiles while they chase you, so a ledge no longer stacks the whole pack.
   - They stop at the edge of spikes and lava instead of walking in. Knockback still throws them in (stunned or
     launched foes don't steer), so pushing them into hazards is still a tactic.
   - Foes standing on each other's toes ease apart.
   - Three new traps, placed per level from the map itself (so every co-op machine places the same ones):
     歯 Teeth (spikes that rise from a floor plate on a beat), 圧 the Crusher (a stone weight that drops from the
     ceiling), 矢 the Dart Skull (a skull in the wall that spits bone darts along the floor). They hurt foes too. */

/* ---------- feet ---------- */
const HOP_SKIP=new Set(['debtor','anchor','relicx','spitter']);
const isWalker=b=>b&&b!==P&&b.maxhp!=null&&b.type&&!b.boss&&!b.fly&&!b.ceil&&!b.dead&&!HOP_SKIP.has(b.type);
const hazT=v=>v===3||v===5;
/* is the next step in this direction into spikes or lava (directly, or by dropping into a pit that holds them)? */
function stepDanger(b,dir){ const tx=Math.floor((b.x+dir*(b.w/2+3))/T), fy=Math.floor((b.y+2)/T);
  if(hazT(tileAt(tx,fy-1))) return true; const t=tileAt(tx,fy); if(hazT(t)) return true;
  if(t===0||t===4){ for(let k=1;k<=10;k++){ const v=tileAt(tx,fy+k); if(v===0||v===4) continue; return hazT(v); } } return false; }
/* a foe knocked into spikes dies there even while it is still reeling from the blow */
function spikeKill(b){ if(!b||b===P||b.maxhp==null||b.boss||b.dead||b.fly||b.ceil||!b.spiked||!(b.hp>0)) return false; b.hp=0; bleed(b.x,b.y-6,16,1,1.2); killEnemy(b,Math.sign(b.vx)||1,false); return true; }
(function(){ const o=moveBody; moveBody=function(b,dt){
  if(!isWalker(b)){ o(b,dt); spikeKill(b); return; }
  const free=!(b.stun>0)&&!(b.launchT>0)&&!(b.reelT>0), dir=Math.sign(b.vx), wasG=b.onGround;
  if(free&&wasG&&dir&&Math.abs(b.vx)>1&&stepDanger(b,dir)) b.vx=0;
  o(b,dt); if(spikeKill(b)) return;
  if(free&&wasG&&dir&&b.hitWall&&!(b._hop>time)&&P&&!P.dead&&Math.sign(P.x-b.x)===dir&&Math.abs(P.x-b.x)<300){
    const tx=Math.floor((b.x+dir*(b.w/2+2))/T), fy=Math.floor((b.y-1)/T); let h=0; while(h<3&&tileAt(tx,fy-h)===1) h++;
    if(h>=1&&h<=2){ const top=fy-h, need=Math.ceil(b.h/T)+1, cx=Math.floor(b.x/T); let clear=true; for(let k=0;k<need&&clear;k++) if(tileAt(tx,top-k)===1||tileAt(cx,top-k)===1) clear=false;
      if(clear&&!stepDanger({x:b.x+dir*T,y:(top+1)*T,w:b.w},dir)){ b.vy=h===1?-255:-345; b.vx=dir*Math.max(b.spd||40,60); b._hop=time+.45; b.onGround=false; } } } }; })();

/* ease apart foes that stand inside each other (cheap: buckets by column) */
function separateFoes(dt){ const B=new Map(); for(const e of enemies){ if(!isWalker(e)||!e.onGround) continue; const k=Math.floor(e.x/24); let a=B.get(k); if(!a) B.set(k,a=[]); a.push(e); }
  const push=(e,dx)=>{ const nx=e.x+dx, tx=Math.floor((nx+Math.sign(dx)*e.w/2)/T); const ty=Math.floor((e.y-2)/T); if(tileAt(tx,ty)===1||tileAt(tx,ty-1)===1) return; const f=tileAt(Math.floor(nx/T),Math.floor((e.y+2)/T)); if(f!==1&&f!==2) return; e.x=nx; };
  for(const [k,a] of B){ const nb=(B.get(k+1)||[]); const all=a.concat(nb); for(const e of a){ for(const f of all){ if(f===e||(a.includes(f)&&f.x<e.x)) continue; if(Math.abs(f.y-e.y)>6) continue;
      const d=f.x-e.x, min=(e.w+f.w)*.4; if(Math.abs(d)>=min) continue; const s=d===0?(e.seed>f.seed?1:-1):Math.sign(d); const m=Math.min(30*dt,(min-Math.abs(d))*.5); push(e,-s*m); push(f,s*m); } } } }
(function(){ const o=update; update=function(dt){ o(dt); if(L&&enemies.length>1) separateFoes(dt); if(L&&L.traps) updTraps(dt); }; })();

/* ---------- traps ---------- */
function trapRng(seed){ let a=seed>>>0; return ()=>{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function gridHash(){ let h=2166136261; for(let y=0;y<L.h;y+=3){ const r=L.g[y]; for(let x=0;x<L.w;x+=2){ h^=r[x]; h=Math.imul(h,16777619); } } return (h^(lvlIdx*7919))>>>0; }
const airCol=(tx,ty,n)=>{ for(let k=1;k<=n;k++) if(tileAt(tx,ty-k)!==0) return false; return true; };
/* v45: placeTraps lived here; traps27.js replaces it */
function standAtF(tx,ty){ const v=tileAt(tx,ty); return v===1&&tileAt(tx,ty-1)===0&&tileAt(tx,ty-2)===0; }
(function(){ const o=loadLevel; loadLevel=function(idx,opt){ const r=o(idx,opt); try{ placeTraps(); }catch(e){ L.traps=[]; } return r; }; })();

const trapDmg=k=>(k==='crusher'?18:k==='teeth'?12:9)+diff()*(k==='crusher'?4:3);
function trapHurtFoes(box,k,dir){ for(const e of enemies){ if(e.dead||e.boss||e.intro||e.fly&&k!=='dart') continue; if(!overlap(box,eBox(e))||e._trT>time) continue; e._trT=time+.6; dmgEnemy(e,Math.round(trapDmg(k)*1.5),false,dir||(Math.sign(e.x-box.x-box.w/2)||1),k==='crusher'?60:120,k==='crusher'); } }
const nearCam=x=>Math.abs(x-camR.x-W/2)<W*.9;
function teethState(t){ const c=(time+t.ph)%t.per; return c<.55?1:c<1.25?2:0; }   /* 1 warn, 2 up */
function crushY(t){ const c=(time+t.ph)%t.per, H_=t.y-t.top-14; if(c<.5) return {y:t.top+Math.sin(c*60)*.6,s:1}; if(c<.62) return {y:t.top+H_*((c-.5)/.12),s:2}; if(c<1.1) return {y:t.top+H_,s:3}; if(c<2.3) return {y:t.top+H_*(1-(c-1.1)/1.2),s:0}; return {y:t.top,s:0}; }
/* v45: updTraps lived here; traps27.js replaces it */

/* v45: drawTraps lived here; traps27.js replaces it */
(function(){ const o=drawHazards; drawHazards=function(){ o(); drawTraps(); }; })();
