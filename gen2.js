'use strict';
/* ===== maps (v16): every visit is a new map =====
   The generator was always procedural, but each level's seed was fixed by its index and tier, so the Ossuary Stair on
   Pilgrim was the same map every time. Now every visit to a level rolls a new variation. Dying and respawning keeps the
   map you died on, and in co-op the host's roll travels with the level message so everyone gets the same map. */
let LVVAR={idx:-1,v:0,ngp:-1};
function varFor(idx){ if(LVVAR.idx!==idx||LVVAR.ngp!==ngp){ if(!(typeof COOP!=='undefined'&&COOP&&!NET.host)) LVVAR={idx,ngp,v:(Math.random()*0x3fffffff)|0}; } return LVVAR.v; }
(function(){ const o=loadLevel; loadLevel=function(idx,opt){ opt=Object.assign({},opt); const def=LEVELS[idx];
  if(def&&def.kind!=='boss'&&def.kind!=='cabin') opt.seed=(opt.seed||0)+varFor(idx); return o(idx,opt); }; })();

/* ---------- new rooms: caves, perches, ruins ----------
   - Cave: the floor rolls in low hills (never more than two tiles a step) under a ragged ceiling of stalactites.
   - Perch: a stone buttress hangs in the middle of the room with a hidden chest on top. You walk under it; you only get
     on top with Grave Claw (climb its side), Ash Wings (a double jump just reaches) or Red Tether (an iron ring above it).
   - Ruin: broken plank floors at two and three heights, a jungle gym for archers and for you.
   Every room still passes the reachability proof without any skill: the climb and hook spots only guard extra loot. */
const NEW_ROOMS=new Set(['cave','perch','ruin']);
function carveNew(Lv,r){ const g=Lv.g, ox=r.x*RW, oy=r.y*RH, kind=r.kind;
  const set=(x,y,v)=>{ if(x>=0&&x<RW&&y>=0&&y<RH) g[oy+y][ox+x]=v; };
  for(let y=1;y<=13;y++) for(let x=1;x<RW-1;x++) set(x,y,0);
  for(let y=10;y<=13;y++){ set(0,y,0); set(RW-1,y,0); }
  const fl=new Int16Array(RW).fill(14), feats=[];
  if(kind==='cave'){ const p1=R()*6, p2=R()*6, p3=R()*6; let h=0;
    for(let x=4;x<RW-4;x++){ const tgt=Math.round((Math.sin(x*.55+p1)+Math.sin(x*.23+p2))*1.5+1.4); h=clamp(clamp(tgt,h-2,h+2),0,4); fl[x]=14-h; }
    for(let x=RW-6;x<RW-4;x++) fl[x]=Math.max(fl[x],12);
    for(let x=2;x<RW-2;x++){ let d=Math.round((Math.sin(x*.7+p3)+1)*1.6)-(x%3?1:0); d=Math.min(d,fl[x]-7); for(let y=1;y<=d;y++) set(x,y,1); }
    if(R()<.4) Lv.rings.push({x:(ox+ri(8,RW-9))*T+8,y:(oy+3)*T}); }
  else if(kind==='perch'){ const c=ri(9,RW-12);
    for(let y=5;y<=11;y++) for(let x=c;x<c+2;x++) set(x,y,1); feats.push({k:'perch',x:c,y:5});
    Lv.chests.push({x:ox+c+1,y:oy+5,tier:R()<.4?1:0,secret:1}); Lv.rings.push({x:(ox+c+1)*T,y:(oy+2)*T+4});
    Lv.torches.push({x:ox+c-2,y:oy+7},{x:ox+c+3,y:oy+7});
    if(R()<.5){ const s2=c+4+ri(0,2); for(let x=s2;x<s2+3&&x<RW-3;x++) set(x,8,2); feats.push({k:'plats',x:s2,y:8,len:3}); } }
  else if(kind==='ruin'){ let x=3; while(x<RW-5){ const len=ri(3,5), y=pick([10,10,7]); for(let i=0;i<len&&x+i<RW-3;i++) set(x+i,y,2); feats.push({k:'plats',x,y,len}); x+=len+ri(1,3); }
    for(let x=4;x<RW-6;x+=ri(6,9)){ const len=3; for(let i=0;i<len;i++) set(x+i,4,2); feats.push({k:'plats',x,y:4,len}); }
    const pc=ri(6,RW-8); fl[pc]=12; fl[pc+1]=12;
    if(R()<.5) Lv.rings.push({x:(ox+ri(8,RW-9))*T+8,y:(oy+1)*T+6}); }
  for(let x=1;x<RW-1;x++) for(let y=fl[x];y<=13;y++) set(x,y,1);
  return {fl,feats,ox,oy}; }
(function(){ const o=carveRoom; carveRoom=function(Lv,r){ Lv.rings=Lv.rings||[]; if(NEW_ROOMS.has(r.kind)) return carveNew(Lv,r); const res=o(Lv,r);
  const ox=r.x*RW, oy=r.y*RH;
  if(r.kind==='chasm'&&R()<.7) Lv.rings.push({x:(ox+RW/2)*T,y:(oy+3)*T});
  if(r.kind==='shaft'&&r.hout>0&&R()<.5) Lv.rings.push({x:(ox+r.hout+2)*T,y:(oy+2)*T});
  return res; }; })();
/* the level's size shifts a little each visit too: one column more or less, sometimes a row more */
(function(){ const o=genRooms; genRooms=function(def,safe){ if(def.kind!=='dungeon') return o(def,safe); const d=Object.assign({},def,{cols:Math.max(5,def.cols+ri(-1,1)),rows:def.rows+(R()<.3?1:0),up:clamp((def.up||.4)+rnd(-.08,.12),.25,.7)}); const Lv=o(d,safe); Lv.def=def; return Lv; }; })();

/* ---------- climbing: Grave Claw now climbs ----------
   Against a wall in the air with Grave Claw, hold toward the wall and Up (W or ↑) to climb it (it costs grit as you go).
   At the top you pull yourself over the lip. Space still jumps off the wall. */
const wallAt=(d,dy)=>solidPx(P.x+d*(P.w/2+2),P.y-dy);
(function(){ const o=updPlayer; updPlayer=function(dt){ if(!P||P._remote||P.dead) return o(dt);
  const dir=(down('d','ArrowRight')?1:0)-(down('a','ArrowLeft')?1:0), up=down('w','ArrowUp');
  const can=has('claw')&&!P.onGround&&!P.attack&&P.dash<=0&&!P.teth&&dir!==0&&up&&P.grit>2&&P.wallLock<=0;
  const low=can&&wallAt(dir,6), high=can&&wallAt(dir,22), climb=low&&high, mantle=low&&!high;
  if((climb||mantle)&&buf.jump!=null&&!keys.space) buf.jump=null;
  o(dt);
  if(climb){ P.vy=-82; P.wallT=.12; P.wallDir=dir; P.face=dir; P.grit=Math.max(0,P.grit-14*dt); if(R()<.2) dust(P.x+dir*5,P.y-8,1); P._climbT=time; }
  else if(mantle&&time-(P._climbT||-9)<.3){ P.vy=-250; P.vx=dir*90; AU.jump(); dust(P.x+dir*6,P.y-6,4); P._climbT=-9; } }; })();

/* ---------- iron rings: Red Tether hooks them ----------
   Rings hang over chasms, under shaft holes and over every perch. A tether thrown near one snaps to it (it is the
   easiest thing to hit in the Pit), and with nothing held a cast aims at the nearest ring ahead of you within reach. */
const ringsNow=()=>(L&&L.rings)||[];
(function(){ const o=castTether; castTether=function(){ o(); const t=P.teth; if(!t||down('w','ArrowUp')||down('s','ArrowDown')) return; const ox=P.x+P.face*4, oy=P.y-18; let best=null, bd=1e9;
  for(const g of ringsNow()){ const dx=g.x-ox, dy=g.y-oy, d=Math.hypot(dx,dy); if(d>185||d<20||Math.sign(dx)!==P.face&&Math.abs(dx)>12||dy>10) continue; if(d<bd){ bd=d; best=g; } }
  if(best){ const dx=best.x-ox, dy=best.y-oy, d=Math.hypot(dx,dy); t.dx=dx/d; t.dy=dy/d; } }; })();
(function(){ const o=updTether; updTether=function(dt){ const t=P.teth; if(t&&t.state==='out'){ const ox=P.x+P.face*4, oy=P.y-18, tx=ox+t.dx*(t.len+820*dt), ty=oy+t.dy*(t.len+820*dt);
    for(const g of ringsNow()){ if(Math.hypot(g.x-tx,g.y-ty)<16||Math.hypot(g.x-(ox+t.dx*t.len),g.y-(oy+t.dy*t.len))<16){ t.state='pull'; t.px=g.x; t.py=g.y; t.dy=Math.min(t.dy,-.6); t.t=0; t.len=Math.hypot(g.x-ox,g.y-oy); AU.clang(); sparks(g.x,g.y,6,'#ffd8a0'); return; } } }
  return o(dt); }; })();
(function(){ const o=drawEnemies; drawEnemies=function(){ for(const g of ringsNow()){ const sx=Math.round(g.x-camR.x), sy=Math.round(g.y-camR.y); if(sx<-20||sx>W+20||sy<-40||sy>H+20) continue;
    for(let y=sy-14;y<sy-4;y+=2) ctx.fillStyle='#3a3438',ctx.fillRect(sx,y,1,1);
    ctx.strokeStyle='#5a5258'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(sx+.5,sy,4,0,Math.PI*2); ctx.stroke(); ctx.strokeStyle='#9a8e88'; ctx.lineWidth=.6; ctx.beginPath(); ctx.arc(sx+.5,sy,4,-2.4,-1.2); ctx.stroke();
    if(has('teth')){ const k=.35+.25*Math.sin(time*3+g.x); ectx.fillStyle=`rgba(255,120,90,${k.toFixed(2)})`; ectx.fillRect(sx-1,sy-5,3,1); } }
  o(); }; })();

/* ---------- omens: a twist on some visits ----------
   闇 Lightless: the dark is deeper. 宝 Gilded: three more chests lie about. 群 Teeming (Ashen and deeper): more of
   them in every room. 潜 Restless (the first descent): more Wall-Born hide in the stone. Two visits in five have none. */
const OMENS={dark:{k:'闇',n:'Lightless',d:'The dark is deeper here.'},gilded:{k:'宝',n:'Gilded',d:'More chests lie about. Not all of them are chests.'},teeming:{k:'群',n:'Teeming',d:'More of them in every room.'},restless:{k:'潜',n:'Restless',d:'More Wall-Born hide in the stone.'}};
function omenFor(def){ if(!def||def.kind!=='dungeon') return null; const pickO=['','','dark','gilded','crowd'][LVVAR.v%5]; return pickO==='crowd'?(ngp>0?'teeming':'restless'):pickO||null; }
function floorSpot(r){ const {fl,ox,oy}=r.res; const c=[]; for(let x=5;x<RW-5;x++) if(fl[x]<99&&L.g[oy+fl[x]-1]&&L.g[oy+fl[x]-1][ox+x]===0&&L.g[oy+fl[x]-2][ox+x]===0) c.push([ox+x,oy+fl[x]]); return c.length?pick(c):null; }
(function(){ const o=loadLevel; loadLevel=function(idx,opt){ const r=o(idx,opt); if(!L) return r; const om=omenFor(L.def); L.omen=om; if(!om) return r;
  const guest=typeof COOP!=='undefined'&&COOP&&!NET.host;
  if(om==='dark') U.uAmb.value.multiplyScalar(.62);
  if(!guest) withSeed((LVVAR.v^0x5bd1e995)>>>0,()=>{ const rooms=L.rooms.filter(x=>x.res&&x.i>0&&x.kind!=='shaft'&&x.kind!=='arena'&&x.exit!=='X');
    if(om==='gilded') for(let i=0;i<3&&rooms.length;i++){ const p=floorSpot(pick(rooms)); if(p) chests.push({x:p[0]*T+8,y:p[1]*T,tier:R()<.2?1:0,open:false,t:0}); }
    if(om==='teeming') for(const e of enemies.slice()) if(!e.boss&&!e.unique&&!e.rare&&!e.ceil&&e.type!=='hanged'&&e.type!=='debtor'&&R()<.35) enemies.push(mkEnemyAt(e.type,e.x+rnd(-14,14),e.y));
    if(om==='restless') for(const rm of rooms){ if(R()<.45){ const p=floorSpot(rm); if(p){ const e=mkEnemyAt('lurker',p[0]*T+8,p[1]*T,{pack:0}); e.state='hide'; e.intro=true; enemies.push(e); } } } });
  return r; }; })();
(function(){ const o=goLevel; goLevel=function(i){ o(i); if(L&&L.omen){ const w=OMENS[L.omen]; setTimeout(()=>toast(`${w.k} ${w.n} · ${w.d}`),2600); $('#actTxt').textContent+=` · ${w.k} ${w.n}`; } }; })();
