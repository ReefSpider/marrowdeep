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
function placeTraps(){ L.traps=[]; const d=L.def; if(!d||d.kind==='cabin'||d.kind==='boss'||lvlIdx===0||!L.rooms) return;
  const rnd_=trapRng(gridHash()); const pickR=a=>a[Math.floor(rnd_()*a.length)];
  const want=Math.min(7,(ngp===0?1:2)+Math.floor(lvlIdx/2)+(rnd_()<.5?1:0));
  const keep=[]; const far=(tx,ty)=>{ const sx=L.spawn.x/T, ex=L.exit.x; if(Math.abs(tx-sx)<10&&Math.abs(ty-L.spawn.y/T)<8) return false; if(Math.abs(tx-ex)<7&&Math.abs(ty-L.exit.y)<8) return false;
    for(const c of L.chests||[]) if(Math.abs(c.x-tx)<4&&Math.abs(c.y-ty)<4) return false; for(const s of L.stones||[]) if(Math.abs(s.x/T-tx)<4&&Math.abs(s.y/T-ty)<4) return false;
    if(L.merch&&Math.abs(L.merch.x/T-tx)<6&&Math.abs(L.merch.y/T-ty)<5) return false;
    for(const k of keep) if(Math.abs(k[0]-tx)<9&&Math.abs(k[1]-ty)<6) return false; return true; };
  const rooms=L.rooms.filter(r=>['normal','cave','ruin','tunnel','hall'].includes(r.kind)&&r.entry!=='S');
  /* floor runs in those rooms: stretches you walk along with headroom */
  const runs=[]; for(const r of rooms){ const ox=r.x*RW, oy=r.y*RH; for(let ty=oy+3;ty<oy+RH;ty++){ let s=-1; for(let tx=ox+1;tx<=ox+RW-1;tx++){ const ok=tx<ox+RW-1&&standAtF(tx,ty)&&airCol(tx,ty,4); if(ok&&s<0) s=tx; if(!ok&&s>=0){ if(tx-s>=5) runs.push({x0:s,x1:tx-1,y:ty,r}); s=-1; } } } }
  for(let tries=0;tries<60&&L.traps.length<want&&runs.length;tries++){ const run=pickR(runs), len=run.x1-run.x0+1; const kind=pickR(['teeth','crusher','crusher','dart','dart','dart']);
    if(kind==='teeth'){ const tx=run.x0+1+Math.floor(rnd_()*(len-3)); if(!far(tx,run.y)) continue; keep.push([tx,run.y]);
      L.traps.push({k:'teeth',x:tx*T,y:run.y*T,w:2*T,per:2.8+rnd_()*.8,ph:rnd_()*3}); }
    else if(kind==='crusher'){ const tx=run.x0+1+Math.floor(rnd_()*(len-2)); let cy=-1; for(let k=5;k<=15;k++){ if(tileAt(tx,run.y-k)===1){ cy=run.y-k; break; } if(tileAt(tx,run.y-k)!==0) break; } if(cy<0||!far(tx,run.y)) continue; keep.push([tx,run.y]);
      L.traps.push({k:'crusher',x:tx*T,y:run.y*T,top:(cy+1)*T,w:T,per:3.4+rnd_()*1.2,ph:rnd_()*4}); }
    else { /* a skull in the wall at the end of the run, spitting along it */ const left=tileAt(run.x0-1,run.y-1)===1&&tileAt(run.x0-1,run.y-2)===1, right=tileAt(run.x1+1,run.y-1)===1&&tileAt(run.x1+1,run.y-2)===1;
      if(!left&&!right) continue; const dir=left&&(!right||rnd_()<.5)?1:-1; const wx=dir>0?run.x0:run.x1; if(!far(wx,run.y)) continue; keep.push([wx,run.y]);
      L.traps.push({k:'dart',x:dir>0?run.x0*T:(run.x1+1)*T,y:run.y*T-15,dir,per:2.4+rnd_()*1,ph:rnd_()*3,darts:[]}); } } }
function standAtF(tx,ty){ const v=tileAt(tx,ty); return v===1&&tileAt(tx,ty-1)===0&&tileAt(tx,ty-2)===0; }
(function(){ const o=loadLevel; loadLevel=function(idx,opt){ const r=o(idx,opt); try{ placeTraps(); }catch(e){ L.traps=[]; } return r; }; })();

const trapDmg=k=>(k==='crusher'?18:k==='teeth'?12:9)+diff()*(k==='crusher'?4:3);
function trapHurtFoes(box,k,dir){ for(const e of enemies){ if(e.dead||e.boss||e.intro||e.fly&&k!=='dart') continue; if(!overlap(box,eBox(e))||e._trT>time) continue; e._trT=time+.6; dmgEnemy(e,Math.round(trapDmg(k)*1.5),false,dir||(Math.sign(e.x-box.x-box.w/2)||1),k==='crusher'?60:120,k==='crusher'); } }
const nearCam=x=>Math.abs(x-camR.x-W/2)<W*.9;
function teethState(t){ const c=(time+t.ph)%t.per; return c<.55?1:c<1.25?2:0; }   /* 1 warn, 2 up */
function crushY(t){ const c=(time+t.ph)%t.per, H_=t.y-t.top-14; if(c<.5) return {y:t.top+Math.sin(c*60)*.6,s:1}; if(c<.62) return {y:t.top+H_*((c-.5)/.12),s:2}; if(c<1.1) return {y:t.top+H_,s:3}; if(c<2.3) return {y:t.top+H_*(1-(c-1.1)/1.2),s:0}; return {y:t.top,s:0}; }
function updTraps(dt){ const pb=P&&!P.dead?pBox():null;
  for(const t of L.traps){
    if(t.k==='teeth'){ const s=teethState(t); if(s!==t.s){ if(s===2&&nearCam(t.x)){ AU.tone('square',180,90,.12,.08,.2); AU.noise(.12,3000,900,2,.12,'bandpass',.1); } if(s===1&&nearCam(t.x)) AU.tone('triangle',900,700,.05,.03,.1); t.s=s; }
      if(s===2){ const box={x:t.x+1,y:t.y-11,w:t.w-2,h:11}; if(pb&&overlap(box,pb)) hurtPlayer(trapDmg('teeth'),{x:t.x+t.w/2,hp:0,dead:true}); trapHurtFoes(box,'teeth'); } }
    else if(t.k==='crusher'){ const c=crushY(t); if(c.s!==t.s){ if(c.s===3&&nearCam(t.x)){ AU.slam(); shake(Math.abs(P.x-t.x)<160?4:1); dust(t.x+8,t.y,10); } t.s=c.s; } t.cy=c.y;
      if(c.s===2||c.s===3&&((time+t.ph)%t.per)<.7){ const box={x:t.x,y:c.y,w:t.w,h:14+2}; if(pb&&overlap(box,pb)){ hurtPlayer(trapDmg('crusher'),{x:t.x+8,hp:0,dead:true}); } trapHurtFoes(box,'crusher'); } }
    else if(t.k==='dart'){ const c=(time+t.ph)%t.per; const st=c>t.per-.5?1:0; if(t.last!=null&&c<t.last){ t.darts.push({x:t.x+t.dir*2,y:t.y,vx:t.dir*300}); if(nearCam(t.x)) AU.tone('sawtooth',700,300,.08,.04,.1); } t.last=c; t.warn=st;
      for(const d of t.darts){ d.x+=d.vx*dt; const box={x:d.x-4,y:d.y-1,w:8,h:3}; if(solidPx(d.x+Math.sign(d.vx)*4,d.y)&&Math.abs(d.x-t.x)>6){ d.dead=1; sparks(d.x,d.y,2,'#e2d6b8'); continue; }
        if(pb&&overlap(box,pb)){ hurtPlayer(trapDmg('dart'),{x:d.x-d.vx*.05,hp:0,dead:true}); d.dead=1; continue; }
        for(const e of enemies){ if(e.dead||e.boss||e.intro) continue; if(overlap(box,eBox(e))){ dmgEnemy(e,Math.round(trapDmg('dart')*1.5),false,Math.sign(d.vx),90,false); d.dead=1; break; } } }
      t.darts=t.darts.filter(d=>!d.dead&&Math.abs(d.x-t.x)<60*T); } } }

function drawTraps(){ if(!L||!L.traps) return;
  for(const t of L.traps){ const sx=Math.round(t.x-camR.x), sy=Math.round(t.y-camR.y); if(sx<-60||sx>W+60||sy<-200||sy>H+60) continue;
    if(t.k==='teeth'){ const s=teethState(t); rect(ctx,sx,sy-1,t.w,2,'#1a1418'); for(let i=2;i<t.w;i+=5) rect(ctx,sx+i,sy-1,2,1,'#050304');
      const h=s===2?11:s===1?2:0; if(h){ for(let i=1;i<t.w-1;i+=4){ ctx.fillStyle='#cfc4ae'; ctx.beginPath(); ctx.moveTo(sx+i,sy); ctx.lineTo(sx+i+1.5,sy-h); ctx.lineTo(sx+i+3,sy); ctx.fill(); rect(ctx,sx+i+1,sy-Math.min(h,3),1,Math.min(h,3),'#6a1414'); } }
      if(s===1){ ectx.fillStyle='rgba(255,90,60,.45)'; ectx.fillRect(sx,sy-1,t.w,1); } }
    else if(t.k==='crusher'){ const y=Math.round((t.cy==null?t.top:t.cy)-camR.y), ty=Math.round(t.top-camR.y);
      for(let yy=ty;yy<y;yy+=3){ rect(ctx,sx+3,yy,1,2,'#3e3a44'); rect(ctx,sx+12,yy,1,2,'#3e3a44'); }
      rect(ctx,sx,y,16,12,'#3a3438'); rect(ctx,sx,y,16,1,'#6a6268'); rect(ctx,sx+1,y+3,14,1,'#2a2428'); rect(ctx,sx+7,y+5,2,3,'#1a1418');
      for(let i=0;i<16;i+=3){ ctx.fillStyle='#8a8478'; ctx.beginPath(); ctx.moveTo(sx+i,y+12); ctx.lineTo(sx+i+1.5,y+16); ctx.lineTo(sx+i+3,y+12); ctx.fill(); }
      if(t.s===1){ ectx.fillStyle='rgba(255,120,60,.35)'; ectx.fillRect(sx,y+15,16,1); } }
    else if(t.k==='dart'){ const fx=t.dir>0?sx-6:sx; rect(ctx,fx,sy-5,6,9,'#c8bea8'); rect(ctx,fx+1,sy-3,1,2,'#120c0c'); rect(ctx,fx+4,sy-3,1,2,'#120c0c'); rect(ctx,fx+(t.dir>0?5:0),sy,1,2,'#120c0c'); rect(ctx,fx+1,sy+3,4,1,'#8a8070');
      if(t.warn){ const k=.4+.4*Math.sin(time*30); ectx.fillStyle=`rgba(255,60,40,${k.toFixed(2)})`; ectx.fillRect(fx+1,sy-3,1,1); ectx.fillRect(fx+4,sy-3,1,1); addLight(t.x,t.y,30,.5,1,.3,.2); }
      for(const d of t.darts){ const dx=Math.round(d.x-camR.x), dy=Math.round(d.y-camR.y); rect(ctx,dx-4,dy,8,1,'#e2d6b8'); rect(ctx,dx+(d.vx>0?3:-4),dy-1,1,3,'#e2d6b8'); } } } }
(function(){ const o=drawHazards; drawHazards=function(){ o(); drawTraps(); }; })();
