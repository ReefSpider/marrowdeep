'use strict';
/* ===== world: room-path level generator with reachability proof, room kinds, environments,
   baking, backgrounds, weather, background events, hazards and physics ===== */
const RW=26, RH=16;
let L=null, LV=null, LVc=null, BG=null, pal=null;
function newGrid(w,h,v){ const g=[]; for(let y=0;y<h;y++){ const r=new Uint8Array(w); if(v) r.fill(v); g.push(r); } return g; }
/* tiles: 0 air · 1 stone · 2 plank (one-way) · 3 spikes · 4 water · 5 lava */
function genLevel(def,seed){ return withSeed(seed,()=>{ if(def.kind==='boss') return genArena(def);
  let Lv=null; for(let i=0;i<18;i++){ Lv=genRooms(def,false); Lv.tries=i+1; if(reachable(Lv)) return Lv; }
  for(let i=0;i<6;i++){ Lv=genRooms(def,true); Lv.tries=99; if(reachable(Lv)) return Lv; } Lv.unsafe=1; return Lv; }); }
const ENV_OF={wall:'war',ossuary:'bone',chapel:'water',warren:'debt',kiln:'fire',breach:'ash',count:'war'};

function genRooms(def,safe){
  const surf=def.kind==='surface', C=def.cols, RR=surf?1:def.rows;
  const w=C*RW, h=RR*RH, g=newGrid(w,h,1), env=def.env||ENV_OF[def.id]||'bone';
  const Lv={w,h,g,spawns:[],chests:[],torches:[],fg:[],plats:[],pends:[],def,surface:surf,rooms:[],env,jets:[],winds:[],nests:[],arenas:[],stones:[],decor:[],safe};
  let cx=0, cy=RR-1, entry='S', ups=0, hin=-1;
  for(let guard=0;guard<200;guard++){
    let exit;
    if(cx===C-1&&cy===0) exit='X';
    else if(cx===C-1) exit='U';
    else if(cy>0&&ups<2&&R()<(def.up||.4)) exit='U';
    else exit='R';
    const room={x:cx,y:cy,entry,exit,hin,hout:exit==='U'?ri(5,RW-9):-1};
    Lv.rooms.push(room);
    if(exit==='X') break;
    if(exit==='U'){ hin=room.hout; cy--; entry='B'; ups++; } else { hin=-1; cx++; entry='L'; ups=0; }
  }
  // choose a kind for each room so the descent never feels like one corridor repeated
  let arenas=0; const maxA=Lv.rooms.length>12?2:1;
  Lv.rooms.forEach((r,i)=>{ r.i=i; if(r.exit==='U'){ r.kind='shaft'; return; }
    if(surf||safe||r.entry==='S'){ r.kind='normal'; return; }
    const lr=r.entry==='L'&&(r.exit==='R'); const q=R();
    if(i>=2&&arenas<maxA&&r.entry!=='B'&&r.exit==='R'&&q<.22){ r.kind='arena'; arenas++; return; }
    const tw=env==='debt'?.34:env==='bone'?.18:.12;
    if(lr&&R()<.36){ r.kind=pick(['cave','cave','perch','ruin']); return; } /* v16 room kinds (gen2.js) */
    if(lr&&R()<tw){ r.kind='tunnel'; return; }
    if(lr&&R()<.2){ r.kind='chasm'; return; }
    if(R()<.16){ r.kind='hall'; return; }
    if(lr&&R()<.12){ r.kind='gauntlet'; return; }
    r.kind='normal'; });
  const relCands=Lv.rooms.map((r,i)=>i).filter(i=>i>=2&&Lv.rooms[i].kind==='normal'&&Lv.rooms[i].exit==='R'&&Lv.rooms[i].entry==='L');
  const rel=relCands.length?pick(relCands):-1;
  Lv.rooms.forEach((r,i)=>{ const res=carveRoom(Lv,r); r.res=res; populate(Lv,r,res,i===rel); });
  const s=Lv.rooms[0]; Lv.spawn={x:(s.x*RW+3)*T,y:(s.y*RH+14)*T};
  const e=Lv.rooms[Lv.rooms.length-1]; Lv.exit={x:e.x*RW+RW-6,y:e.y*RH+14};
  Lv.torches.push({x:Lv.exit.x-3,y:Lv.exit.y-3},{x:Lv.exit.x+3,y:Lv.exit.y-3});
  for(let fx=240;fx<w*T*1.3;fx+=rnd(280,460)) Lv.fg.push({x:fx,w:ri(12,24),chain:R()<.5});
  if(!surf) placeLevelSpecials(Lv);
  return Lv;
}
function carveRoom(Lv,r){
  const g=Lv.g, ox=r.x*RW, oy=r.y*RH, surf=Lv.surface, env=Lv.env, kind=r.kind;
  const set=(x,y,v)=>{ if(x>=0&&x<RW&&y>=0&&y<RH) g[oy+y][ox+x]=v; };
  const get=(x,y)=>(x<0||x>=RW||y<0||y>=RH)?1:g[oy+y][ox+x];
  const top=kind==='tunnel'?8:surf?0:1;
  for(let y=top;y<=13;y++) for(let x=1;x<RW-1;x++) set(x,y,0);
  if(kind==='tunnel'){ // a ragged low ceiling
    for(let x=1;x<RW-1;x++){ const d=hsh(ox+x,oy)>.7?1:0; if(d&&x>3&&x<RW-4) set(x,8,1); } }
  if(surf){ for(let y=0;y<=13;y++){ if(r.entry!=='S') set(0,y,0); if(r.exit!=='X') set(RW-1,y,0); } }
  if(r.entry==='L') for(let y=10;y<=13;y++) set(0,y,0);
  if(r.exit==='R') for(let y=10;y<=13;y++) set(RW-1,y,0);
  if(r.exit==='U') for(let x=r.hout;x<r.hout+4;x++) set(x,0,0);
  const fl=new Int16Array(RW).fill(14), free=new Uint8Array(RW), feats=[], wet=new Uint8Array(RW);
  for(let x=0;x<4;x++){ free[x]=1; free[RW-1-x]=1; }
  if(r.entry==='S') for(let x=0;x<11;x++) free[x]=1;
  if(r.exit==='X') for(let x=RW-10;x<RW;x++) free[x]=1;
  if(r.entry==='B') for(let x=r.hin-1;x<r.hin+5;x++) if(x>=0&&x<RW) free[x]=1;
  const vertical=kind==='shaft';
  if(vertical) for(let x=1;x<RW-1;x++) free[x]=1; // shafts stay clean: nothing to wall off the climb
  const pitFill=env==='water'?'pool':env==='fire'?'lava':'spike';
  const place=(len)=>{ for(let tries=0;tries<16;tries++){ const s=ri(4,RW-5-len); let ok=s>3; for(let x=s-1;x<=s+len&&ok;x++) if(free[x]) ok=false; if(ok){ for(let x=s;x<s+len;x++) free[x]=1; return s; } } return -1; };
  const pit=(sx,len,fill)=>{ for(let x=sx;x<sx+len;x++){ fl[x]=99; wet[x]=fill==='pool'?1:fill==='lava'?2:0; }
    if(len>=4&&fill!=='pool'){ const mid=sx+Math.floor(len/2)-1; if(R()<.5) Lv.plats.push({type:'crumb',x:(ox+mid)*T,y:(oy+12)*T,w:2*T,st:0,t:0}); else { set(mid,12,2); set(mid+1,12,2); } } };
  if(kind==='normal'||kind==='hall'||kind==='tunnel'){
    const nF=Lv.safe?0:kind==='tunnel'?ri(1,2):kind==='hall'?ri(0,1):ri(1,3);
    const pool=surf?['pit','mound','plats','tower','plats']:kind==='tunnel'?['pit','mound','pit']:['pit','pit','mound','plats','pend','pillar','plats','tower','env','env'];
    for(let f=0;f<nF;f++){
      const k=pick(pool);
      if(k==='env'){ envFeature(Lv,r,place,fl,feats,set,ox,oy,wet); continue; }
      const len=k==='pit'?ri(3,5):k==='mound'?ri(4,7):k==='pillar'?2:k==='tower'?4:ri(4,8);
      const sx=place(len+(k==='tower'?3:0)); if(sx<0) continue; const s0=k==='tower'?sx+3:sx;
      if(k==='pit') pit(s0,len,pitFill);
      else if(k==='mound'){ const hg=ri(2,3); for(let x=s0;x<s0+len;x++) fl[x]=14-hg; }
      else if(k==='pillar'){ for(let x=s0;x<s0+len;x++) fl[x]=11; }
      else if(k==='tower'){ for(let x=s0;x<s0+len;x++) fl[x]=10; set(s0-3,12,2); set(s0-2,12,2); feats.push({k:'tower',x:s0,y:10,len}); }
      else if(k==='plats'&&kind!=='tunnel'){ const py=10, n=Math.min(len,5); for(let x=s0;x<s0+n;x++) set(x,py,2); feats.push({k:'plats',x:s0,y:py,len:n}); if(len>5&&R()<.6){ const s2=s0+ri(1,3); for(let x=s2;x<s2+3&&x<RW-2;x++) set(x,6,2); feats.push({k:'plats',x:s2,y:6,len:3}); } }
      else if(k==='pend'&&kind!=='tunnel'){ Lv.pends.push({x:(ox+s0+len/2)*T,y:(oy+1)*T,len:9*T,ph:R()*6,sp:rnd(1.6,2.2),amp:rnd(.85,1.1),a:0}); }
    }
    if(kind==='hall'){ // an upper gallery reached by plank steps at each end
      for(let x=2;x<=4;x++) set(x,11,2); for(let x=RW-5;x<=RW-3;x++) set(x,11,2);
      for(let x=5;x<RW-5;x++) if(get(x,7)===0) set(x,7,2); feats.push({k:'gallery',x:5,y:7,len:RW-10});
      for(let x=6;x<RW-6;x+=5) Lv.decor.push({k:'chandelier',x:(ox+x)*T+8,y:(oy+1)*T}); }
    if(kind==='tunnel'&&env!=='fire') feats.push({k:'ceiling',y:8});
  } else if(kind==='arena'){
    for(const [x0,y0,n] of [[4,10,4],[RW-8,10,4],[11,7,4]]) for(let i=0;i<n;i++) set(x0+i,y0,2);
    feats.push({k:'plats',x:4,y:10,len:4},{k:'plats',x:RW-8,y:10,len:4},{k:'plats',x:11,y:7,len:4});
    Lv.arenas.push({ox,oy,x0:(ox+1)*T,x1:(ox+RW-1)*T,y0:(oy+1)*T,y1:(oy+15)*T,state:0,wave:0,waves:ri(2,3)});
    Lv.torches.push({x:ox+2,y:oy+8},{x:ox+RW-3,y:oy+8},{x:ox+8,y:oy+5},{x:ox+RW-9,y:oy+5});
  } else if(kind==='chasm'){
    const a=5, b=RW-6; const fill=pitFill==='spike'&&R()<.3?'spike':pitFill;
    for(let x=a;x<b;x++){ fl[x]=99; wet[x]=fill==='pool'?1:fill==='lava'?2:0; free[x]=1; }
    if(fill==='pool'){ for(let x=a;x<b;x++) wet[x]=3; } // a flooded nave: wade it, waist deep
    else { let x=a+2; while(x<b-2){ const st=R(); if(st<.45){ fl[x]=12; fl[x+1]=12; } else if(st<.75){ Lv.plats.push({type:'crumb',x:(ox+x)*T,y:(oy+12)*T,w:2*T,st:0,t:0}); } else { set(x,11,2); set(x+1,11,2); } x+=ri(4,5); } }
    if(R()<.5&&fill!=='pool') Lv.pends.push({x:(ox+RW/2)*T,y:(oy+1)*T,len:8*T,ph:R()*6,sp:rnd(1.5,2),amp:rnd(.8,1),a:0});
    feats.push({k:'chasm',x:a,len:b-a});
  } else if(kind==='gauntlet'){
    const s=place(4); if(s>0) pit(s,4,pitFill);
    for(const px of [8,RW-9]) Lv.pends.push({x:(ox+px)*T,y:(oy+1)*T,len:9*T,ph:px,sp:rnd(1.8,2.3),amp:rnd(.9,1.1),a:0});
    if(env==='fire') for(const px of [6,13,RW-7]) Lv.jets.push({x:(ox+px)*T+8,y:(oy+14)*T,ph:px*.7,per:2.6});
  }
  const hole=x=>r.entry==='B'&&x>=r.hin&&x<r.hin+4;
  for(let x=1;x<RW-1;x++){ if(hole(x)) continue;
    if(fl[x]===99){ set(x,14,0);
      if(wet[x]===1){ set(x,14,4); set(x,15,1); } else if(wet[x]===2){ set(x,14,5); set(x,15,1); } else if(wet[x]===3){ set(x,13,4); set(x,14,4); set(x,15,1); } else set(x,15,3); }
    else for(let y=fl[x];y<=13;y++) set(x,y,1); }
  if(r.entry==='B') for(let x=r.hin;x<r.hin+4;x++){ set(x,15,2); set(x,14,0); }
  if(vertical){ const hx=r.hout;
    if(R()<.3){ for(let x=hx;x<hx+4;x++){ fl[x]=14; for(let y=1;y<=13;y++) set(x,y,0); } Lv.plats.push({type:'lift',x:(ox+hx)*T,w:4*T,y:(oy+14)*T,y0:(oy+14)*T,y1:(oy+3)*T,ph:R(),per:rnd(5,7),dy:0}); feats.push({k:'lift'}); }
    else { // a zig-zag of plank ledges that always overlap the one above, ending right under the hole
      const xs=[clamp(hx-1,2,RW-8)]; for(let i=0;i<3;i++){ let nx=clamp(xs[i]+(R()<.5?-1:1)*ri(3,4),2,RW-8); if(Math.abs(nx-xs[i])<2) nx=clamp(xs[i]+(xs[i]>RW/2?-3:3),2,RW-8); xs.push(nx); }
      [3,6,9,12].forEach((ry,i)=>{ for(let x=xs[i];x<xs[i]+6&&x<RW-1;x++) if(get(x,ry)===0) set(x,ry,2); });
      feats.push({k:'shaft',xs}); }
    if(Lv.env==='ash'&&R()<.5) Lv.winds.push({x0:(ox+1)*T,x1:(ox+RW-1)*T,y0:(oy+1)*T,y1:(oy+14)*T,dir:R()<.5?-1:1,ph:R()*5,up:1});
  } else if(kind==='normal'&&!Lv.safe&&R()<.3){ const sx=ri(7,RW-11); let clear=true; for(let x=sx-4;x<sx+5&&clear;x++) for(let y=5;y<=11;y++) if(get(x,y)!==0||fl[x]<12) clear=false;
    if(clear){ for(let x=sx;x<sx+3;x++) set(x,6,2); set(sx-3,10,2); set(sx-2,10,2); Lv.chests.push({x:ox+sx+1.5,y:oy+6,tier:R()<.35?1:0,secret:1}); } }
  if(!surf&&kind!=='tunnel') for(let x=2;x<RW-2;x++){ if(get(x,1)!==0||get(x,0)!==1||R()>=.1) continue; let ok=true; for(let y=2;y<=6;y++) if(get(x,y)!==0) ok=false; if(vertical) ok=false; if(ok) set(x,1,1); }
  if(env==='water'&&!vertical&&kind!=='chasm'&&!surf&&R()<.35){ // flooded floor: shallow water you wade through
    let a=ri(4,10), b=Math.min(RW-4,a+ri(6,12)); for(let x=a;x<b;x++) if(get(x,13)===0&&get(x,14)===1&&!hole(x)) set(x,13,4); }
  return {fl,feats,ox,oy};
}
function envFeature(Lv,r,place,fl,feats,set,ox,oy,wet){ const env=Lv.env;
  if(env==='fire'){ const n=ri(2,3); for(let i=0;i<n;i++){ const x=ri(5,RW-6); if(fl[x]===14) Lv.jets.push({x:(ox+x)*T+8,y:(oy+14)*T,ph:R()*3,per:rnd(2.6,3.4)}); } return true; }
  if(env==='bone'){ const sx=place(3); if(sx<0) return false; Lv.nests.push({x:(ox+sx+1.5)*T,y:(oy+14)*T,done:false,n:ri(4,7)}); feats.push({k:'nest',x:sx}); return true; }
  if(env==='ash'){ Lv.winds.push({x0:(ox+1)*T,x1:(ox+RW-1)*T,y0:(oy+1)*T,y1:(oy+15)*T,dir:R()<.5?-1:1,ph:R()*5}); return true; }
  if(env==='debt'){ const sx=place(5); if(sx<0) return false; Lv.decor.push({k:'gallows',x:(ox+sx+2)*T,y:(oy+14)*T}); for(let x=sx;x<sx+5;x++) fl[x]=13; return true; }
  if(env==='water'){ const sx=place(5); if(sx<0) return false; for(let x=sx;x<sx+5;x++){ fl[x]=99; wet[x]=1; } feats.push({k:'pool',x:sx,len:5}); return true; }
  return false; }
function populate(Lv,r,res,isRel){
  const {fl,feats,ox,oy}=res, def=Lv.def, pool=def.enemies;
  const cols=[]; for(let x=4;x<RW-4;x++) if(fl[x]<99&&!(r.entry==='S'&&x<12)&&!(r.exit==='X'&&x>RW-10)) cols.push(x);
  const floorAt=x=>{ for(let y=1;y<15;y++){ const v=Lv.g[oy+y][ox+x]; if((v===1||v===2)&&Lv.g[oy+y-1][ox+x]!==1&&Lv.g[oy+y-2]&&Lv.g[oy+y-2][ox+x]!==1&&y>=10) return y; } return fl[x]<99?fl[x]:14; };
  const put=(t,x,extra)=>{ if(t==='hanged'&&Lv.surface) t='husk';
    if(t==='hanged'){ Lv.spawns.push(Object.assign({x:ox+x+.5,y:oy+1+(r.kind==='tunnel'?7:0),t,hang:1},extra)); return; }
    if(t==='spitter'){ let cy=r.kind==='tunnel'?8:1; if(Lv.g[oy+cy][ox+x]===1) cy++; if(Lv.g[oy+cy][ox+x]===1) cy++; if(r.kind==='tunnel'||R()<.5){ Lv.spawns.push(Object.assign({x:ox+x+.5,y:oy+cy,t,ceil:1},extra)); return; } }
    if(t==='wraith'||t==='witch'||t==='swarm'){ Lv.spawns.push(Object.assign({x:ox+x+.5,y:oy+Math.min(13,floorAt(x))-5,t},extra)); return; }
    if(t==='archer'||t==='nun'){ const f=feats.find(f=>f.k==='plats'||f.k==='tower'||f.k==='gallery'); if(f&&R()<.7){ Lv.spawns.push(Object.assign({x:ox+f.x+R()*f.len,y:oy+f.y,t},extra)); return; } }
    Lv.spawns.push(Object.assign({x:ox+x+.5,y:oy+floorAt(x),t},extra)); };
  const pickT=()=>{ let t=wpick(pool); if(r.kind==='tunnel'&&(t==='brute'||t==='knight')) t='ghoul'; return t; };
  const thin=ngp===0; /* the first descent is sparse but tough (tune.js); the hordes start on Ashen */
  let n=r.entry==='S'?(Lv.surface?1:0):(thin?ri(1,3):ri(2,4)+(def.id==='breach'?1:0))+extraFoes();
  if(r.kind==='arena') n=0; if(r.kind==='shaft') n=Math.min(n,2);
  for(let i=0;i<n&&cols.length;i++) put(pickT(),pick(cols));
  // packs: the reason a strong build feels strong. Weak alone, a tide together.
  if(def.packs&&r.entry!=='S'&&r.kind!=='arena'&&r.kind!=='shaft'&&R()<((def.packP||.45)+Math.min(.3,ngp*.1))*(thin?.4:1)&&cols.length){
    const pk=pick(def.packs), c0=pick(cols), cnt=thin?Math.ceil(ri(pk.n[0],pk.n[1])*.55):ri(pk.n[0],pk.n[1])+Math.min(ngp,4)*3; const lead=R()<eliteChance('lead');
    for(let i=0;i<cnt;i++){ const x=clamp(c0+ri(-3,3),4,RW-5); if(fl[x]>=99) continue; put(pk.t,x,{pack:1}); }
    if(lead){ const x=clamp(c0,4,RW-5); if(fl[x]<99) put(pk.t,x,{leader:1}); } }
  if(r.kind==='shaft'&&R()<.6) Lv.spawns.push({x:ox+RW/2,y:oy+7,t:pool.witch&&R()<.4?'witch':pool.swarm&&R()<.5?'swarm':'wraith'});
  if(r.kind==='hall'){ const g=feats.find(f=>f.k==='gallery'); for(let i=0;i<ri(1,2);i++) Lv.spawns.push({x:ox+g.x+2+R()*(g.len-4),y:oy+g.y,t:pool.nun?'nun':'archer'}); if(R()<.35) Lv.chests.push({x:ox+RW/2+.5,y:oy+7,tier:0}); }
  if(isRel){ let x=Math.floor(RW/2); while(fl[x]>=99&&x<RW-5) x++; Lv.chests.push({x:ox+x+.5,y:oy+fl[x],tier:1}); Lv.spawns.push({x:ox+x-4,y:oy+Math.min(14,fl[x-4]<99?fl[x-4]:14),t:pool.knight?'knight':'brute',guard:1}); Lv.torches.push({x:ox+x-3,y:oy+fl[x]-3},{x:ox+x+3,y:oy+fl[x]-3}); }
  else if(r.kind==='normal'&&r.exit==='R'&&r.entry!=='S'&&R()<.3&&cols.length){ const x=pick(cols); Lv.chests.push({x:ox+x+.5,y:oy+floorAt(x),tier:0}); }
  for(let k=0;k<2;k++){ const x=ri(3,RW-4); if(fl[x]<99){ const ty=oy+floorAt(x)-3; if(Lv.g[ty]&&Lv.g[ty][ox+x]===0&&Lv.g[ty+1][ox+x]===0) Lv.torches.push({x:ox+x,y:ty}); } }
}
function placeLevelSpecials(Lv){ const def=Lv.def, rooms=Lv.rooms.filter(r=>r.kind!=='shaft'&&r.kind!=='arena'&&r.i>0&&r.exit!=='X');
  const floorCol=r=>{ const {fl,ox,oy}=r.res; const c=[]; for(let x=6;x<RW-6;x++) if(fl[x]===14&&Lv.g[oy+13][ox+x]===0&&Lv.g[oy+12][ox+x]===0) c.push(x); return c.length?{x:ox+pick(c),y:oy+14}:null; };
  // remembrance stones: koans along the way
  const ids=STONES[def.id]||[]; const used=new Set();
  ids.forEach((id,i)=>{ const cand=rooms.filter(r=>!used.has(r)); if(!cand.length) return; const r=cand[Math.min(cand.length-1,Math.floor((i+.5)/ids.length*cand.length))]; used.add(r); const p=floorCol(r); if(p) Lv.stones.push({id,x:p.x*T+8,y:p.y*T}); });
  // a unique monster with its retinue
  if(rooms.length>2&&R()<eliteChance('unique')){ const cands=UNQ_MON.map((u,i)=>i).filter(i=>def.enemies[UNQ_MON[i].t]); if(cands.length){ const ui=pick(cands); const r=pick(rooms.slice(Math.floor(rooms.length/3))); const p=floorCol(r);
    if(p){ Lv.spawns.push({x:p.x+.5,y:p.y,t:UNQ_MON[ui].t,unique:ui}); for(let i=0;i<3;i++) Lv.spawns.push({x:p.x+.5+ri(-3,3),y:p.y,t:UNQ_MON[ui].t==='hound'?'hound':wpick(def.enemies),pack:1,escort:1}); } } }
  // the Gilded Debtor, sometimes
  if(rooms.length>1&&R()<.42){ const r=pick(rooms); const p=floorCol(r); if(p) Lv.spawns.push({x:p.x+.5,y:p.y,t:'debtor'}); }
}
function genArena(def){
  const w=36,h=18,g=newGrid(w,h,1), surf=!!def.surface;
  for(let y=surf?0:1;y<=15;y++) for(let x=1;x<w-1;x++) g[y][x]=0;
  [[6,11,5],[w-11,11,5],[(w>>1)-3,7,6]].forEach(([x,y,n])=>{ for(let i=0;i<n;i++) g[y][x+i]=2; });
  return {w,h,g,spawns:[],chests:[],torches:surf?[]:[{x:3,y:12},{x:w-4,y:12},{x:10,y:9},{x:w-11,y:9}],fg:[{x:120,w:16},{x:560,w:20}],plats:[],pends:[],def,arena:true,surface:surf,
    spawn:{x:3*T,y:16*T},exit:{x:w-5,y:16},rooms:[],env:def.env||ENV_OF[def.id]||'bone',jets:[],winds:[],nests:[],arenas:[],stones:[],decor:[]};
}
function tileAt(tx,ty){ if(tx<0||tx>=L.w||ty<0) return 1; if(ty>=L.h) return 0; return L.g[ty][tx]; }
const solidPx=(x,y)=>tileAt(Math.floor(x/T),Math.floor(y/T))===1;

/* ---------- reachability: a conservative model of the hero's jump, so no level can wall you in ---------- */
function reachable(Lv){
  const W_=Lv.w, H_=Lv.h, g=Lv.g;
  const tl=(x,y)=>(x<0||x>=W_||y<0)?1:y>=H_?0:g[y][x];
  const isPlat=new Set();
  for(const p of Lv.plats){ const tx0=Math.floor(p.x/T), n=Math.round(p.w/T);
    if(p.type==='crumb'){ const ty=Math.floor(p.y/T); for(let i=0;i<n;i++) isPlat.add((ty)*W_+tx0+i); }
    else if(p.type==='lift'){ const a=Math.round(p.y1/T), b=Math.round(p.y0/T); for(let ty=a;ty<=b;ty++) for(let i=0;i<n;i++) isPlat.add(ty*W_+tx0+i); } }
  const floorish=(x,y)=>{ const v=tl(x,y); return v===1||v===2||isPlat.has(y*W_+x); };
  const open=(x,y)=>{ const v=tl(x,y); return v!==1; };
  const stand=(x,y)=>floorish(x,y)&&open(x,y-1)&&open(x,y-2)&&tl(x,y-1)!==5&&tl(x,y-1)!==3&&!(tl(x,y)===1&&false);
  const idx=(x,y)=>y*W_+x;
  const st=new Uint8Array(W_*H_);
  for(let y=2;y<H_;y++) for(let x=0;x<W_;x++) if(stand(x,y)) st[idx(x,y)]=1;
  const sx=Math.floor(Lv.spawn.x/T), sy=Math.round(Lv.spawn.y/T); const ex=Lv.exit.x, ey=Lv.exit.y;
  const colClear=(x,y0,y1)=>{ for(let y=Math.min(y0,y1);y<=Math.max(y0,y1);y++) if(!open(x,y)) return false; return true; };
  const seen=new Uint8Array(W_*H_); const q=[]; const push=(x,y)=>{ const i=idx(x,y); if(!seen[i]&&st[i]){ seen[i]=1; q.push(i); } };
  // start: the cell under the spawn (search a little for a floor)
  let s0=null; for(let d=0;d<4&&!s0;d++) for(const xx of [sx-d,sx+d]) for(let yy=sy-1;yy<=sy+1;yy++) if(!s0&&xx>=0&&xx<W_&&st[idx(xx,yy)]) s0=[xx,yy];
  if(!s0) return false; push(s0[0],s0[1]);
  while(q.length){ const i=q.pop(), x=i%W_, y=(i/W_)|0;
    if(Math.abs(x-ex)<=2&&Math.abs(y-ey)<=1) { Lv.reach=seen; return true; }
    for(let ty=Math.max(2,y-4);ty<=Math.min(H_-1,y+14);ty++){
      const dy=y-ty; // + is up
      const maxdx=dy>=4?2:dy===3?3:dy>=1?4:dy===0?5:Math.min(8,5+Math.floor(-dy*.5));
      for(let tx=Math.max(0,x-maxdx);tx<=Math.min(W_-1,x+maxdx);tx++){
        if(tx===x&&ty===y) continue; const j=idx(tx,ty); if(!st[j]||seen[j]) continue;
        if(dy>0){ // rise in our own column, then drift across at the target's height
          if(!colClear(x,ty-2,y-1)) continue; let ok=true; const d=Math.sign(tx-x);
          for(let cx=x;cx!==tx&&ok;cx+=d) if(!open(cx+d,ty-1)||!open(cx+d,ty-2)||!open(cx,ty-1)||!open(cx,ty-2)) ok=false;
          if(ok) push(tx,ty);
        } else if(dy===0){ let ok=true; const d=Math.sign(tx-x); const hop=Math.abs(tx-x)>1;
          for(let cx=x;cx!==tx&&ok;cx+=d){ if(!open(cx+d,y-1)||!open(cx+d,y-2)) ok=false; if(hop&&(!open(cx,y-3)||!open(cx+d,y-3))) ok=false; }
          if(ok) push(tx,ty);
        } else { // drop: drift across at our height, then fall down the target column
          let ok=true; const d=Math.sign(tx-x)||0;
          for(let cx=x;cx!==tx&&ok;cx+=d) if(!open(cx+d,y-1)||!open(cx+d,y-2)) ok=false;
          if(ok) for(let yy=y-2;yy<ty;yy++){ if(!open(tx,yy)){ ok=false; break; } if(yy>=y&&floorish(tx,yy)&&yy<ty){ ok=false; break; } }
          if(ok) push(tx,ty);
        } } }
    // dropping through a plank under our feet
    if(tl(x,y)===2||isPlat.has(idx(x,y))){ for(let yy=y+1;yy<H_;yy++){ if(st[idx(x,yy)]){ push(x,yy); break; } if(!open(x,yy)) break; } }
  }
  Lv.reach=seen; return false;
}

/* ---------- baking level art ---------- */
function bakeLevel(Lv,pl){
  const c=document.createElement('canvas'); c.width=Lv.w*T; c.height=Lv.h*T; const g=c.getContext('2d');
  const tl=(x,y)=>(x<0||x>=Lv.w||y<0||y>=Lv.h)?1:Lv.g[y][x];
  const air=(x,y)=>tl(x,y)!==1;
  const brick=(bi,row)=>pl.stone[Math.floor(hsh(bi,row)*pl.stone.length)];
  const env=Lv.env;
  for(let y=0;y<Lv.h;y++) for(let x=0;x<Lv.w;x++){
    const v=Lv.g[y][x], px=x*T, py=y*T;
    if(v===1){
      let dd=4; for(let r=1;r<4;r++){ if(air(x,y-r)||air(x,y+r)||air(x-r,y)||air(x+r,y)){dd=r;break;} }
      if(dd===4){ g.fillStyle='#0a080b'; g.fillRect(px,py,16,16); continue; }
      if(env==='bone'&&hsh(x*3,y*7)>.82){ // ossuary walls: packed skulls and long bones
        g.fillStyle=pl.mortar; g.fillRect(px,py,16,16);
        for(let k=0;k<4;k++){ const bx=px+(k%2)*8, by=py+(k>>1)*8; if(hsh(x*4+k,y)>.45){ g.fillStyle='#8a7e68'; g.fillRect(bx+1,by+1,6,6); g.fillStyle='#1a1210'; g.fillRect(bx+2,by+3,1,2); g.fillRect(bx+5,by+3,1,2); g.fillStyle='#6a604e'; g.fillRect(bx+2,by+6,4,1); } else { g.fillStyle='#9a8e76'; g.fillRect(bx,by+3,8,2); g.fillRect(bx,by+2,1,4); g.fillRect(bx+7,by+2,1,4); } } }
      else for(let r=0;r<2;r++){ const by=py+r*8, row=y*2+r, off=(row&1)*8;
        if(off===0){ g.fillStyle=brick(x,row); g.fillRect(px,by,16,8); g.fillStyle=pl.mortar; g.fillRect(px,by,1,7); }
        else { g.fillStyle=brick(x-1,row); g.fillRect(px,by,8,8); g.fillStyle=brick(x,row); g.fillRect(px+8,by,8,8); g.fillStyle=pl.mortar; g.fillRect(px+8,by,1,7); }
        g.fillStyle=pl.mortar; g.fillRect(px,by+7,16,1); g.fillStyle='rgba(255,235,210,.06)'; g.fillRect(px,by,16,1); }
      for(let i=0;i<12;i++){ g.fillStyle=R()<.6?'rgba(0,0,0,.22)':'rgba(255,240,220,.05)'; g.fillRect(px+ri(0,15),py+ri(0,15),1,1); }
      if(hsh(x,y)>.9){ g.fillStyle='rgba(0,0,0,.4)'; let cx=px+ri(3,12),cy=py+ri(2,6); for(let k=0;k<6;k++){g.fillRect(cx,cy,1,1);cx+=ri(-1,1);cy++;} }
      if(env==='water'&&hsh(x,y*3)>.5){ g.fillStyle='rgba(20,60,50,.18)'; g.fillRect(px,py,16,16); if(air(x,y+1)&&R()<.5){ g.fillStyle='#2a4a3a'; g.fillRect(px+ri(1,13),py+15,1,ri(3,9)); } }
      if(env==='fire'){ g.fillStyle=`rgba(0,0,0,${(.18+hsh(x,y)*.2).toFixed(2)})`; g.fillRect(px,py,16,16); }
      if(dd>1){ g.fillStyle=`rgba(8,5,8,${Math.min(.75,(dd-1)*.26)})`; g.fillRect(px,py,16,16); }
      if(air(x,y-1)){ g.fillStyle=pl.cap; g.fillRect(px,py,16,3); g.fillStyle=pl.hi; g.fillRect(px,py,16,1);
        for(let i=0;i<16;i++) if(hsh(x*16+i,y)>.55){ g.fillStyle=pl.cap; g.fillRect(px+i,py+3,1,1); }
        g.fillStyle='rgba(0,0,0,.35)'; g.fillRect(px,py+4,16,1);
        if(Lv.surface&&y>=12&&x%2===0&&tl(x,y-1)===0&&tl(x,y-2)===0){ g.fillStyle=pl.cap; g.fillRect(px+2,py-7,12,7); g.fillStyle=pl.hi; g.fillRect(px+2,py-7,12,1); g.fillStyle='rgba(0,0,0,.3)'; g.fillRect(px+12,py-6,2,6); }
        else if(tl(x,y-1)===0) for(let i=0;i<3;i++) if(R()<.45){ const gx=px+ri(0,15), gl=ri(1,3); g.fillStyle=env==='fire'?pick(['#3a2420','#2a1a18','#4a2a22']):env==='water'?pick(['#2e4a3e','#3a5a48','#24382e']):env==='ash'?pick(['#4a4448','#3a3438']):pick(['#6e5d36','#7f6a3c','#54482c']); g.fillRect(gx,py-gl,1,gl); } }
      if(air(x,y+1)&&y+1<Lv.h){ g.fillStyle='rgba(0,0,0,.45)'; g.fillRect(px,py+14,16,2); if(R()<.3){ g.fillStyle='#2a2119'; g.fillRect(px+ri(1,14),py+16,1,ri(2,7)); } }
      if(air(x-1,y)){ g.fillStyle='rgba(255,230,200,.07)'; g.fillRect(px,py,1,16); }
      if(air(x+1,y)){ g.fillStyle='rgba(0,0,0,.3)'; g.fillRect(px+15,py,1,16); }
    } else if(v===2){
      g.fillStyle='#24170f'; g.fillRect(px,py,16,6); g.fillStyle='#5a3d27'; g.fillRect(px,py,16,4); g.fillStyle='#7a5636'; g.fillRect(px,py,16,1);
      g.fillStyle='#24170f'; g.fillRect(px+((x&1)?0:8),py,1,4); g.fillStyle='#9a9088'; g.fillRect(px+3,py+2,1,1); g.fillRect(px+12,py+2,1,1);
      const lE=tl(x-1,y)!==2, rE=tl(x+1,y)!==2;
      if(lE||rE){ let ok=false; for(let k=1;k<10;k++) if(tl(x,y-k)===1){ok=true;break;}
        if(ok){ const cx=px+(lE?2:13); for(let yy=py-1; yy>0 && tl(x,Math.floor((yy-2)/16))!==1; yy-=3){ g.fillStyle='#3e3a44'; g.fillRect(cx,yy-2,1,2); g.fillStyle='#6a6672'; g.fillRect(cx,yy-2,1,1);} } }
    } else if(v===3){
      g.fillStyle='#120c0c'; g.fillRect(px,py+10,16,6);
      for(let i=0;i<4;i++){ const sx=px+i*4; g.fillStyle='#5a3424'; g.beginPath(); g.moveTo(sx,py+12); g.lineTo(sx+2,py+3); g.lineTo(sx+4,py+12); g.fill(); g.fillStyle='#9a6a48'; g.fillRect(sx+2,py+4,1,3); if(R()<.3){g.fillStyle='#5a0d0e';g.fillRect(sx+2,py+3,1,3);} }
    } else if(v===4){ g.fillStyle='rgba(10,30,34,.55)'; g.fillRect(px,py,16,16); if(tl(x,y+1)===1){ g.fillStyle='#1a2a28'; g.fillRect(px,py+13,16,3); } }
    else if(v===5){ g.fillStyle='#3a0a04'; g.fillRect(px,py+2,16,14); g.fillStyle='#8a2a0a'; g.fillRect(px,py+3,16,2); for(let i=0;i<3;i++){ g.fillStyle='#200402'; g.fillRect(px+ri(0,13),py+ri(7,13),ri(2,4),1); } }
  }
  const skull=(x,y)=>{g.fillStyle='#cdbf9e';g.fillRect(x,y-4,5,4);g.fillStyle='#1a1210';g.fillRect(x+1,y-3,1,1);g.fillRect(x+3,y-3,1,1);g.fillStyle='#a99c80';g.fillRect(x+1,y-1,3,1);};
  const ground=(x,y)=>Lv.g[y][x]===1&&Lv.g[y-1][x]===0;
  const dens=env==='bone'?.12:.05;
  for(let x=3;x<Lv.w-3;x++) for(let y=1;y<Lv.h;y++){ if(ground(x,y)&&R()<dens){ const r=R(); if(r<.45) skull(x*T+ri(2,10),y*T); else { g.fillStyle='#b3a688'; const bx=x*T+ri(1,9); g.fillRect(bx,y*T-1,6,1); g.fillRect(bx,y*T-2,1,1); g.fillRect(bx+5,y*T-2,1,1);} } }
  // environment set dressing
  for(let x=4;x<Lv.w-4;x++) for(let y=4;y<Lv.h;y++){ if(!ground(x,y)||Lv.g[y-1][x+1]!==0||Lv.g[y][x+1]!==1) continue; const r=hsh(x*13,y*5), px=x*T, py=y*T;
    if(env==='bone'&&r>.93){ // a standing coffin
      g.fillStyle='#2a1e18'; g.beginPath(); g.moveTo(px+3,py); g.lineTo(px+1,py-14); g.lineTo(px+5,py-22); g.lineTo(px+12,py-22); g.lineTo(px+15,py-14); g.lineTo(px+13,py); g.fill(); g.fillStyle='#3a2a20'; g.fillRect(px+7,py-19,2,10); g.fillRect(px+5,py-16,6,2); g.fillStyle='#120a08'; g.fillRect(px+4,py-6,8,1); }
    else if(env==='bone'&&r>.86){ for(let k=0;k<5;k++) skull(px+(k%3)*4,py-(k>2?4:0)); }
    else if(env==='debt'&&r>.88){ // coin piles and ledgers
      g.fillStyle='#6a4e1e'; g.beginPath(); g.moveTo(px,py); g.quadraticCurveTo(px+8,py-9,px+16,py); g.fill(); g.fillStyle='#b08a3a'; for(let k=0;k<6;k++) g.fillRect(px+2+ri(0,11),py-ri(1,6),2,1); g.fillStyle='#2a1a10'; g.fillRect(px+10,py-12,6,12); g.fillStyle='#5a3a24'; g.fillRect(px+10,py-12,6,1); g.fillRect(px+10,py-8,6,1); }
    else if(env==='water'&&r>.9){ // a broken pew
      g.fillStyle='#2a201a'; g.fillRect(px,py-8,16,2); g.fillRect(px+1,py-14,2,14); g.fillRect(px+12,py-6,2,6); g.fillStyle='#1a1410'; g.fillRect(px,py-6,14,1); }
    else if(env==='fire'&&r>.9){ // iron cage of a candidate
      g.strokeStyle='#2a2428'; g.lineWidth=1; for(let k=0;k<5;k++){ g.beginPath(); g.moveTo(px+1+k*3.5,py); g.lineTo(px+1+k*3.5,py-20); g.stroke(); } g.fillStyle='#2a2428'; g.fillRect(px,py-21,16,2); g.fillStyle='#1a1010'; g.fillRect(px+5,py-8,5,8); }
    else if(env==='ash'&&r>.88){ // a broken column
      g.fillStyle=pl.cap; g.fillRect(px+3,py-18,10,18); g.fillStyle=pl.hi; g.fillRect(px+3,py-18,1,18); g.fillStyle=mixc(pl.cap,'#000000',.4); g.beginPath(); g.moveTo(px+3,py-18); g.lineTo(px+8,py-23); g.lineTo(px+13,py-16); g.fill(); } }
  for(const d of Lv.decor){ const px=d.x, py=d.y;
    if(d.k==='gallows'){ g.fillStyle='#2a1a10'; g.fillRect(px-14,py-48,3,48); g.fillRect(px-14,py-48,26,3); g.fillRect(px-11,py-45,6,2); g.fillStyle='#4a3a2a'; g.fillRect(px+8,py-45,1,14); g.beginPath(); g.ellipse(px+8.5,py-29,3,2,0,0,Math.PI*2); g.strokeStyle='#4a3a2a'; g.stroke(); g.fillStyle='#1a120a'; g.fillRect(px-18,py-4,36,4); }
    else if(d.k==='chandelier'){ g.fillStyle='#3e3a44'; for(let yy=py;yy<py+30;yy+=3) g.fillRect(px,yy,1,2); g.fillStyle='#2a2630'; g.fillRect(px-10,py+30,21,2); for(const o of [-9,-3,3,9]){ g.fillRect(px+o,py+26,1,4); } } }
  if(!Lv.surface) for(let x=4;x<Lv.w-4;x++) for(let y=1;y<Lv.h-4;y++){ if(Lv.g[y][x]===0&&Lv.g[y-1][x]===1&&Lv.g[y+1][x]===0&&R()<(env==='debt'?.05:.025)){ const cy=y*T, len=ri(14,40), cx=x*T+8; for(let yy=cy;yy<cy+len;yy+=3){g.fillStyle='#3e3a44';g.fillRect(cx,yy,1,2);}
      const by=cy+len; g.fillStyle='#2a2630'; for(let k=0;k<5;k++) g.fillRect(cx-5+k*2.5|0,by,1,14); g.fillRect(cx-5,by,11,1); g.fillRect(cx-5,by+13,11,1); g.fillStyle='#a99c80'; g.fillRect(cx-2,by+8,3,4); g.fillRect(cx-1,by+5,2,2); } }
  if(Lv.surface) for(let x=6;x<Lv.w-6;x+=ri(9,15)){ let y=0; while(y<Lv.h-1&&Lv.g[y][x]!==1) y++; if(y>4){ const bx=x*T+3, by=y*T-7; g.fillStyle='#2a1a16'; g.fillRect(bx+4,by-26,1,26); g.fillStyle=R()<.5?'#5a1414':'#3a2a18'; g.beginPath(); g.moveTo(bx+5,by-26); g.lineTo(bx+15,by-24); g.lineTo(bx+13,by-16); g.lineTo(bx+15,by-9); g.lineTo(bx+5,by-12); g.fill(); g.fillStyle='rgba(0,0,0,.4)'; g.fillRect(bx+9,by-22,2,2); } }
  for(const n of Lv.nests){ const px=n.x, py=n.y; g.fillStyle='#4a3e30'; g.beginPath(); g.ellipse(px,py,22,8,0,Math.PI,0); g.fill(); for(let k=0;k<14;k++){ g.fillStyle=pick(['#b3a688','#9a8e76','#cdbf9e']); const a=rnd(Math.PI,Math.PI*2); g.fillRect(px+Math.cos(a)*rnd(4,20),py+Math.sin(a)*rnd(2,7),ri(2,5),1); } g.fillStyle='#120a08'; g.beginPath(); g.ellipse(px,py-2,8,3,0,0,Math.PI*2); g.fill(); }
  for(const j of Lv.jets){ g.fillStyle='#1a1214'; g.fillRect(j.x-6,j.y-3,12,3); g.fillStyle='#3a2a2a'; g.fillRect(j.x-6,j.y-3,12,1); g.fillStyle='#050203'; g.fillRect(j.x-3,j.y-2,6,1); }
  if(Lv.exit){ const ex=Lv.exit.x*T+8, ey=Lv.exit.y*T;
  g.fillStyle=mixc(pl.cap,'#000000',.4); g.fillRect(ex-28,ey-82,56,82);
  g.fillStyle=pl.cap; for(let yy=ey-82;yy<ey;yy+=8) g.fillRect(ex-28,yy,56,1);
  g.fillStyle=pl.hi; g.fillRect(ex-28,ey-82,56,2); g.fillRect(ex-4,ey-86,8,6);
  g.fillStyle='#020102'; g.fillRect(ex-18,ey-60,36,60); g.beginPath(); g.arc(ex,ey-60,18,Math.PI,0); g.fill();
  g.fillStyle=pl.hi; g.fillRect(ex-20,ey-60,2,60); g.fillRect(ex+18,ey-60,2,60); }
  Lv.wspans=[]; for(let y=0;y<Lv.h;y++){ let x=0; while(x<Lv.w){ const v=Lv.g[y][x]; if(v===4||v===5){ let x1=x; while(x1<Lv.w&&Lv.g[y][x1]===v) x1++; const surfTop=y===0||Lv.g[y-1][x]!==v; Lv.wspans.push({x0:x*T,x1:x1*T,y:y*T,v,top:surfTop}); x=x1; } else x++; } }
  return c;
}
function spire(f,x,base,w,hgt){ f.beginPath(); f.moveTo(x,base); f.lineTo(x,base-hgt); f.lineTo(x+w/2,base-hgt-w*1.5); f.lineTo(x+w,base-hgt); f.lineTo(x+w,base); f.fill(); }
function bakeBG(pl){
  const far=document.createElement('canvas'); far.width=960; far.height=320; const f=far.getContext('2d');
  let gr=f.createLinearGradient(0,0,0,320); gr.addColorStop(0,pl.sky[0]); gr.addColorStop(.55,pl.sky[1]); gr.addColorStop(1,pl.sky[2]); f.fillStyle=gr; f.fillRect(0,0,960,320);
  const mid=document.createElement('canvas'); mid.width=1200; mid.height=320; const m=mid.getContext('2d');
  if(pl.surface){
    for(let i=0;i<140;i++){ f.fillStyle=`rgba(230,220,200,${rnd(.1,.5).toFixed(2)})`; f.fillRect(ri(0,959),ri(0,150),1,1); }
    f.fillStyle='#d8cfb8'; f.beginPath(); f.arc(700,70,30,0,Math.PI*2); f.fill(); f.fillStyle=pl.sky[0]; f.beginPath(); f.arc(712,62,28,0,Math.PI*2); f.fill();
    for(let i=0;i<9;i++){ const sx=rnd(0,960), rg=f.createRadialGradient(sx,230,4,sx,140,140); rg.addColorStop(0,'rgba(12,8,10,.6)'); rg.addColorStop(1,'rgba(12,8,10,0)'); f.fillStyle=rg; f.fillRect(sx-150,0,300,320); }
    const glow=f.createLinearGradient(0,200,0,320); glow.addColorStop(0,'rgba(255,120,40,0)'); glow.addColorStop(1,'rgba(255,110,40,.35)'); f.fillStyle=glow; f.fillRect(0,200,960,120);
    for(let x=0;x<960;x+=ri(10,26)){ const hgt=rnd(30,110), w=ri(10,26); f.fillStyle='#120a0e'; spire(f,x,320,w,hgt); f.fillRect(x,320-hgt*.6,w,hgt*.6);
      for(let k=0;k<4;k++) if(R()<.5){ f.fillStyle=`rgba(255,${ri(120,190)},70,${rnd(.4,.9).toFixed(2)})`; f.fillRect(x+ri(2,w-3),320-rnd(10,hgt*.8),2,2); }
      if(R()<.25){ const fg=f.createRadialGradient(x+w/2,320-hgt,2,x+w/2,320-hgt,24); fg.addColorStop(0,'rgba(255,150,60,.55)'); fg.addColorStop(1,'rgba(255,90,30,0)'); f.fillStyle=fg; f.fillRect(x-24,320-hgt-30,w+48,60); } }
    f.fillStyle='#070405'; for(let x=0;x<960;x+=3){ const hgt=ri(4,8); f.fillRect(x,300-hgt,1,hgt); if(R()<.05){ f.fillRect(x,284,1,16); f.fillStyle='#3a0c0c'; f.fillRect(x+1,284,5,3); f.fillStyle='#070405'; } } f.fillRect(0,300,960,20);
    const dk='#0c080a';
    for(let i=0;i<4;i++){ const x=i*300+rnd(20,140); m.fillStyle=dk; m.fillRect(x,180,8,140); m.fillRect(x+40,200,8,120); m.fillRect(x-6,176,60,6);
      m.save(); m.translate(x+24,178); m.rotate(-.5-R()*.3); m.fillRect(-4,-90,6,110); m.restore(); m.fillStyle='rgba(255,120,50,.18)'; m.fillRect(x,180,1,140); }
    for(let x=0;x<1200;x+=7){ m.fillStyle=dk; m.beginPath(); m.moveTo(x,320); m.lineTo(x+3,292-ri(0,8)); m.lineTo(x+6,320); m.fill(); }
    if(pl===PALS.wound){ f.fillStyle='rgba(120,10,6,.25)'; f.fillRect(0,0,960,320); }
    return {far,mid};
  }
  const lx=300; const rg=f.createRadialGradient(lx,-30,10,lx,-30,320); rg.addColorStop(0,pl.shaft+'.6)'); rg.addColorStop(1,pl.shaft+'0)'); f.fillStyle=rg; f.fillRect(0,0,960,320);
  for(let i=0;i<8;i++){ const x0=lx+rnd(-70,70), w0=rnd(6,22), sk=rnd(40,150); f.fillStyle=pl.shaft+rnd(.03,.08).toFixed(3)+')'; f.beginPath(); f.moveTo(x0,0); f.lineTo(x0+w0,0); f.lineTo(x0+w0*3+sk,320); f.lineTo(x0+sk,320); f.fill(); }
  const cols=[mixc(pl.sky[1],pl.sky[0],.25),mixc(pl.sky[1],'#000000',.4),mixc(pl.sky[2],'#000000',.5)];
  const motif=pl.motif||'arches';
  cols.forEach((col,li)=>{
    if(li===1){ const cx=700, by=320; f.fillStyle=col;
      if(motif==='furnace'){ // a cathedral-furnace with a burning mouth
        f.fillRect(cx-80,by-200,160,200); spire(f,cx-90,by-200,40,60); spire(f,cx+50,by-200,40,60); f.fillStyle='rgba(255,90,30,.35)'; f.beginPath(); f.arc(cx,by-60,40,Math.PI,0); f.fill(); f.fillRect(cx-40,by-60,80,60); f.fillStyle='rgba(255,180,90,.25)'; f.beginPath(); f.arc(cx,by-50,22,Math.PI,0); f.fill(); }
      else if(motif==='ruin'){ // the breach: a split mountain with the Wound's light in the crack
        f.beginPath(); f.moveTo(cx-200,by); f.lineTo(cx-60,by-230); f.lineTo(cx-10,by-120); f.lineTo(cx-20,by); f.fill(); f.beginPath(); f.moveTo(cx+10,by); f.lineTo(cx+20,by-140); f.lineTo(cx+80,by-250); f.lineTo(cx+220,by); f.fill();
        f.fillStyle='rgba(255,60,30,.3)'; f.beginPath(); f.moveTo(cx-10,by-120); f.lineTo(cx+20,by-140); f.lineTo(cx+10,by); f.lineTo(cx-20,by); f.fill(); }
      else if(motif==='windows'){ for(const ox of [-160,0,160]){ f.fillStyle=col; f.fillRect(cx+ox-34,by-230,68,230); f.fillStyle=pl.shaft+'.22)'; f.fillRect(cx+ox-18,by-200,36,120); f.beginPath(); f.arc(cx+ox,by-200,18,Math.PI,0); f.fill(); f.fillStyle=col; f.fillRect(cx+ox-1,by-218,2,140); f.fillRect(cx+ox-18,by-150,36,2); } }
      else if(motif==='scaffold'){ f.strokeStyle=col; f.lineWidth=3; for(let i=0;i<6;i++){ const x=cx-150+i*60; f.beginPath(); f.moveTo(x,by); f.lineTo(x,by-220+(i%2)*30); f.stroke(); } for(let y=by-40;y>by-220;y-=40){ f.beginPath(); f.moveTo(cx-150,y); f.lineTo(cx+150,y); f.stroke(); f.beginPath(); f.moveTo(cx-150,y); f.lineTo(cx-90,y-40); f.stroke(); } f.fillStyle=pl.shaft+'.2)'; for(let i=0;i<5;i++) f.fillRect(cx-140+i*60,by-70-i*30,3,4); }
      else { f.beginPath(); f.moveTo(cx-90,by); f.lineTo(cx-70,by-120); f.quadraticCurveTo(cx-60,by-210,cx,by-230); f.quadraticCurveTo(cx+55,by-215,cx+62,by-150); f.lineTo(cx+95,by-80); f.lineTo(cx+110,by); f.fill();
        f.fillStyle=mixc(col,'#000000',.5); f.beginPath(); f.ellipse(cx+8,by-182,16,22,0,0,Math.PI*2); f.fill();
        f.fillStyle=pl.shaft+'.18)'; f.beginPath(); f.moveTo(cx-70,by-120); f.quadraticCurveTo(cx-60,by-210,cx,by-230); f.lineTo(cx-4,by-224); f.quadraticCurveTo(cx-56,by-200,cx-66,by-118); f.fill(); } }
    f.fillStyle=col;
    for(let i=0;i<12;i++){ const x=R()*960, w=rnd(14,40)*(1+li*.5), hg=rnd(70,190)*(1-li*.25); for(const o of [-960,0,960]) spire(f,x+o,320,w,hg);
      if(li<2){ f.fillStyle=pl.shaft+'.35)'; for(let k=0;k<3;k++) if(R()<.5) f.fillRect((x+w*R())|0,(320-hg*R())|0,1,2); f.fillStyle=col; } }
    f.fillRect(0,300-li*14,960,40); });
  const fg=f.createLinearGradient(0,220,0,320); fg.addColorStop(0,'rgba(0,0,0,0)'); fg.addColorStop(1,pl.shaft+'.12)'); f.fillStyle=fg; f.fillRect(0,220,960,100);
  const dk=mixc(pl.sky[2],'#000000',.3), rim=pl.shaft+'.16)';
  if(motif==='windows'){ for(let i=0;i<5;i++){ const x=i*240+30; m.fillStyle=dk; m.fillRect(x,40,22,280); m.fillRect(x+90,40,22,280); m.beginPath(); m.moveTo(x,40); m.quadraticCurveTo(x+56,-30,x+112,40); m.lineTo(x+100,46); m.quadraticCurveTo(x+56,-10,x+12,46); m.fill();
      m.fillStyle=pl.shaft+'.1)'; m.fillRect(x+30,60,52,160); m.fillStyle=dk; m.fillRect(x+55,60,2,160); m.fillRect(x+30,130,52,2); m.fillStyle=rim; m.fillRect(x,46,1,274);
      m.fillStyle='rgba(120,170,180,.08)'; m.fillRect(x-20,290,150,30); } }
  else if(motif==='scaffold'){ for(let i=0;i<5;i++){ const x=i*240+rnd(0,60); m.fillStyle=dk; m.fillRect(x,30,6,290); m.fillRect(x+80,60,6,260); for(let y=80;y<300;y+=56){ m.fillRect(x-10,y,110,4); m.save(); m.translate(x,y); m.rotate(.6); m.fillRect(0,0,70,2); m.restore(); }
      const cx=x+40, cy=rnd(90,160); for(let yy=0;yy<cy;yy+=4) m.fillRect(cx,yy,1,3); m.strokeStyle=dk; m.lineWidth=1; for(let k=0;k<5;k++){ m.beginPath(); m.moveTo(cx-8+k*4,cy); m.lineTo(cx-8+k*4,cy+22); m.stroke(); } m.fillRect(cx-9,cy,18,2); m.fillRect(cx-9,cy+22,18,2); m.fillStyle=rim; m.fillRect(x,30,1,290); } }
  else if(motif==='furnace'){ for(let i=0;i<4;i++){ const x=i*300+rnd(0,80); m.fillStyle=dk; m.fillRect(x,60,70,260); m.fillRect(x+20,0,30,60); m.fillStyle='rgba(255,100,40,.22)'; m.beginPath(); m.arc(x+35,250,22,Math.PI,0); m.fill(); m.fillRect(x+13,250,44,70); m.fillStyle='rgba(255,170,90,.18)'; m.fillRect(x+20,262,30,58);
      m.fillStyle=dk; for(let k=0;k<4;k++) m.fillRect(x+16+k*11,248,2,72); m.fillStyle=rim; m.fillRect(x,60,1,260); } }
  else if(motif==='ruin'){ for(let i=0;i<7;i++){ const x=i*170+rnd(0,50), hgt=rnd(80,230); m.fillStyle=dk; m.fillRect(x,320-hgt,24,hgt); m.beginPath(); m.moveTo(x,320-hgt); m.lineTo(x+10,320-hgt-rnd(8,24)); m.lineTo(x+24,320-hgt); m.fill();
      for(let k=0;k<3;k++){ const rx=x+rnd(-30,50), ry=rnd(40,200); m.save(); m.translate(rx,ry); m.rotate(R()*3); m.fillRect(-6,-4,12,8); m.restore(); } m.fillStyle='rgba(255,70,40,.12)'; m.fillRect(x+23,320-hgt,1,hgt); } }
  else for(let i=0;i<6;i++){ const x=i*200+20; m.fillStyle=dk; m.fillRect(x,70,30,250); m.fillRect(x-5,70,40,8); m.fillRect(x-4,300,38,20);
    m.beginPath(); m.arc(x+115,150,92,Math.PI,0); m.arc(x+115,150,78,0,Math.PI,true); m.fill();
    m.fillStyle=rim; m.fillRect(x,78,2,222);
    m.fillStyle=dk; for(let k=0;k<2;k++){ const cx=x+60+k*70+ri(-10,10), len=ri(30,110); for(let yy=60;yy<60+len;yy+=4) m.fillRect(cx,yy,2,3); m.fillRect(cx-2,60+len,6,3); }
    for(let k=0;k<4;k++){ const sx=x+4+k*6, sy=110+k*40; m.fillStyle='rgba(205,190,160,.12)'; m.fillRect(sx,sy,4,3); } }
  return {far,mid};
}

/* ---------- weather: every depth breathes differently ---------- */
let bgev=[], bgT=2, motes=[];
for(let i=0;i<70;i++) motes.push({x:Math.random()*W,y:Math.random()*H,z:.3+Math.random()*.7,s:Math.random()*10});
function drawWeather(){ const env=L.env||'bone', surf=L.surface;
  for(const m of motes){ let x,y,col,w=1,h=1;
    if(surf||env==='war'){ x=((m.x-camR.x*m.z*.5+time*8*m.z)%W+W)%W; y=((m.y-time*10*m.z-camR.y*m.z*.3)%H+H)%H; col=`rgba(255,150,70,${(.08+m.z*.16).toFixed(3)})`; }
    else if(env==='fire'){ x=((m.x-camR.x*m.z*.5+Math.sin(time+m.s)*8)%W+W)%W; y=((m.y-time*26*m.z-camR.y*m.z*.3)%H+H)%H; col=`rgba(255,${120+((m.s*20)|0)},50,${(.12+m.z*.25).toFixed(3)})`; }
    else if(env==='water'){ x=((m.x-camR.x*m.z*.5)%W+W)%W; y=((m.y+time*90*m.z-camR.y*m.z*.3)%H+H)%H; col=`rgba(170,210,215,${(.06+m.z*.14).toFixed(3)})`; h=m.z>.7?3:2; }
    else if(env==='ash'){ const gust=L.winds.length?Math.sin(time*.7)*.5+.5:0; x=((m.x-camR.x*m.z*.5+time*(30+gust*90)*m.z)%W+W)%W; y=((m.y+Math.sin(time*2+m.s)*6+time*8-camR.y*m.z*.3)%H+H)%H; col=`rgba(140,130,135,${(.12+m.z*.2).toFixed(3)})`; w=m.z>.8?2:1; }
    else if(env==='debt'){ x=((m.x-camR.x*m.z*.5+time*3*m.z)%W+W)%W; y=((m.y+Math.sin(time*.4+m.s)*6-camR.y*m.z*.3)%H+H)%H; col=(m.s>9.4&&Math.sin(time*3+m.s*9)>.9)?'rgba(255,220,120,.7)':`rgba(220,190,140,${(.04+m.z*.1).toFixed(3)})`; }
    else { x=((m.x-camR.x*m.z*.5+time*6*m.z)%W+W)%W; y=((m.y+Math.sin(time*.4+m.s)*6-camR.y*m.z*.3)%H+H)%H; col=`rgba(230,210,170,${(.05+m.z*.12).toFixed(3)})`; }
    ectx.fillStyle=col; ectx.fillRect(x|0,y|0,w,h); } }
/* water and lava are drawn in front of everything standing in them */
function drawLiquids(){ if(!L.wspans) return;
  for(const s of L.wspans){ const sx=s.x0-camR.x, sy=s.y-camR.y, w=s.x1-s.x0; if(sx>W||sx+w<0||sy>H+16||sy<-20) continue;
    if(s.v===4){ ctx.fillStyle='rgba(30,60,64,.42)'; ctx.fillRect(sx,sy+2,w,14); if(s.top){ for(let x=0;x<w;x+=2){ const yy=sy+2+Math.round(Math.sin(time*3+(s.x0+x)*.15)*1); ectx.fillStyle=`rgba(170,215,220,${(.18+.12*Math.sin(time*2+x)).toFixed(2)})`; ectx.fillRect(sx+x,yy,2,1); } } }
    else { const fl=.6+.2*Math.sin(time*4+s.x0); ectx.fillStyle=`rgba(255,110,30,${fl.toFixed(2)})`; ectx.fillRect(sx,sy+3,w,2); ectx.fillStyle='rgba(255,60,20,.35)'; ectx.fillRect(sx,sy+5,w,6);
      if(R()<.06*w/16){ const bx=s.x0+R()*w; part({x:bx,y:s.y+3,vx:rnd(-10,10),vy:rnd(-60,-20),g:150,life:rnd(.3,.6),em:true,col:pick(['#ff9a3c','#ffcf7a'])}); }
      for(let x=0;x<w;x+=48) addLight(s.x0+x+24,s.y+4,60,.6,1,.35,.12); } } }

/* ---------- live hazards: fire jets, wind gusts, bone nests ---------- */
function jetOn(j){ const t=(time+j.ph)%j.per; return t<1.1?(t<.45?1:2):0; } // 1 = warning, 2 = burning
function updHazards(dt){
  for(const j of L.jets){ const s=jetOn(j); if(Math.abs(j.x-camR.x-W/2)>W) continue;
    if(s===2){ if(!j.snd){ j.snd=1; if(Math.abs(P.x-j.x)<260) AU.noise(.6,400,1800,1,.3,'bandpass',.25); } if(!P.dead&&Math.abs(P.x-j.x)<9&&P.y>j.y-62&&P.y-P.h<j.y) hurtPlayer(10+diff()*3,{x:j.x,hp:0,dead:true});
      for(const e of enemies) if(!e.dead&&!e.boss&&Math.abs(e.x-j.x)<9&&e.y>j.y-62&&e.y-e.h<j.y&&!(e._jt>time)){ e._jt=time+.4; dmgEnemy(e,20+diff()*5,false,Math.sign(e.x-j.x)||1,80,false); } }
    else j.snd=0; }
  for(const w of L.winds){ const g=((time+w.ph)%5); w.on=g<1.9; if(w.on&&!P.dead&&P.x>w.x0&&P.x<w.x1&&P.y>w.y0&&P.y<w.y1){ if(w.up){ if(P.vy>-120) P.vy-=900*dt*.62; } else { P.vx+=w.dir*520*dt; P.vx=clamp(P.vx,-260,260); } if(R()<.5) part({type:'dust',x:camR.x+(w.dir>0?0:W),y:camR.y+rnd(0,H),vx:w.dir*rnd(200,320),vy:rnd(-10,10)-(w.up?60:0),g:0,life:rnd(.8,1.4),col:'rgba(110,104,108,.5)',size:1}); } }
  for(const n of L.nests){ if(n.done||P.dead) continue; if(Math.abs(P.x-n.x)<84&&Math.abs(P.y-n.y)<40){ n.done=true; AU.shriek(); AU.gore&&AU.gore(); AU.noise(.5,800,200,2,.3,'bandpass',.3); shake(4); dust(n.x,n.y,16);
      for(let i=0;i<n.n;i++){ const e=mkEnemyAt('crawler',n.x+rnd(-10,10),n.y-4,{pack:1}); e.vy=-rnd(160,260); e.vx=rnd(-120,120); e.atkCd=.6; enemies.push(e); } toast('The nest wakes.'); } } }
function drawHazards(){
  for(const j of L.jets){ const s=jetOn(j), sx=j.x-camR.x, sy=j.y-camR.y; if(sx<-30||sx>W+30) continue;
    if(s===1){ if(R()<.5) part({x:j.x+rnd(-3,3),y:j.y-3,vx:rnd(-10,10),vy:rnd(-60,-30),g:80,life:.3,em:true,col:'#ffb060'}); ectx.fillStyle='rgba(255,120,40,.5)'; ectx.fillRect(sx-3,sy-3,6,1); }
    else if(s===2){ const t=((time+j.ph)%j.per-.45)/.65, k=Math.sin(Math.PI*clamp(t,0,1)); for(let i=0;i<16;i++){ const w=(8-i*.4)*k+2; ectx.fillStyle=`rgba(255,${100+i*9},${30+i*5},${(.85-i*.04).toFixed(2)})`; ectx.fillRect(sx-w/2+Math.sin(time*40+i)*1.5,sy-4-i*4*k,w,4); } addLight(j.x,j.y-30,90,1.2*k,1,.5,.2); } }
  for(const s of L.stones||[]){ const sx=s.x-camR.x, sy=s.y-camR.y; if(sx<-30||sx>W+30||sy<-60||sy>H+20) continue; drawStone(s,sx,sy); }
  if(L.arenas) for(const a of L.arenas){ if(a.state!==1) continue; for(const gx of [a.ox*T,(a.ox+RW-1)*T]){ const sx=gx-camR.x, sy=(a.oy+10)*T-camR.y; if(sx<-20||sx>W+20) continue; for(let i=0;i<4;i++){ rect(ctx,sx+1+i*4,sy-2,2,66,'#2a2428'); rect(ctx,sx+1+i*4,sy-2,1,66,'#5a5460'); } rect(ctx,sx,sy+8,16,2,'#3a3438'); rect(ctx,sx,sy+40,16,2,'#3a3438'); ectx.fillStyle=`rgba(255,40,30,${(.3+.2*Math.sin(time*6)).toFixed(2)})`; ectx.fillRect(sx,sy-4,16,1); } } }
function drawStone(s,sx,sy){ const read=CODEX_OPEN.has(s.id)&&(!CX[s.id].q||VOWS_TAKEN[s.id]);
  rect(ctx,sx-7,sy-24,14,24,'#3a3438'); rect(ctx,sx-7,sy-24,14,1,'#6a6268'); rect(ctx,sx-8,sy-2,16,2,'#2a2428'); rect(ctx,sx+5,sy-23,2,23,'#2a2428');
  ctx.fillStyle='#4a4448'; ctx.beginPath(); ctx.moveTo(sx-7,sy-24); ctx.lineTo(sx,sy-28); ctx.lineTo(sx+7,sy-24); ctx.fill();
  const gl=read?0:.12+.1*Math.sin(time*2.4+s.x); ctx.font='bold 8px serif'; ctx.textAlign='center'; ctx.fillStyle=read?'#6a6266':'#c8a870'; ctx.fillText((CX[s.id]||{k:'?'}).k.slice(0,1),sx,sy-10); ctx.textAlign='left'; if(gl>0){ ectx.fillStyle=`rgba(255,190,120,${(gl*.35).toFixed(3)})`; ectx.fillRect(sx-1,sy-25,2,1); }
  if(!read) addLight(s.x,s.y-14,46,.5,1,.8,.55); }

/* ---------- background events: the world keeps happening behind you ---------- */
function spawnBG(type){
  const e={type,t:0,dur:3,x:rnd(60,W-60),y:rnd(40,140)};
  if(type==='fireball'){ e.dur=rnd(1.8,2.6); e.x0=rnd(-60,W*.4); e.x1=e.x0+rnd(220,380); e.y0=rnd(120,170); e.h=rnd(70,120); }
  else if(type==='crows'){ e.dur=rnd(6,9); e.n=ri(5,9); e.dir=R()<.5?1:-1; e.y=rnd(30,100); e.off=[...Array(e.n)].map(()=>[rnd(-30,30),rnd(-14,14),R()*6]); }
  else if(type==='lightning'){ e.dur=.45; e.x=rnd(40,W-40); e.pts=[]; let x=e.x; for(let y=0;y<170;y+=rnd(8,16)){ x+=rnd(-12,12); e.pts.push([x,y]); } setTimeout(()=>AU.thunder(),400); }
  else if(type==='clash'){ e.dur=1.2; e.y=rnd(150,170); }
  else if(type==='eyes'){ e.dur=rnd(3.5,5.5); e.s=rnd(.7,1.4); e.y=rnd(40,170); e.blink=rnd(.35,.65); }
  else if(type==='falling'){ e.dur=2.6; e.x=rnd(40,W-40); }
  else if(type==='colossus'){ e.dur=10; e.x=rnd(80,W-80); }
  else if(type==='bell'){ e.dur=3.5; e.x=rnd(80,W-80); e.y=rnd(40,120); AU.bell(); }
  else if(type==='procession'){ e.dur=14; e.dir=R()<.5?1:-1; e.y=rnd(150,190); e.n=ri(6,11); }
  else if(type==='hand'){ e.dur=6; e.x=rnd(60,W-60); }
  bgev.push(e);
}
function updBG(dt){ bgT-=dt; if(bgT<=0&&L&&L.def.bg){ spawnBG(pick(L.def.bg)); bgT=L.surface?rnd(11,18):rnd(9,16); } for(const e of bgev) e.t+=dt; bgev=bgev.filter(e=>e.t<e.dur); }
function drawBGEvents(){
  for(const e of bgev){ const k=e.t/e.dur;
    if(e.type==='fireball'){ for(let i=0;i<9;i++){ const kk=Math.max(0,k-i*.012); const x=lerp(e.x0,e.x1,kk), y=e.y0-e.h*4*kk*(1-kk)+kk*50; ectx.fillStyle=i===0?'#ffe0a0':`rgba(255,${120-i*8},40,${(.8-i*.08).toFixed(2)})`; ectx.fillRect(x|0,y|0,i===0?3:2,i===0?3:2); }
      if(e.t+1/60>=e.dur){ bgev.push({type:'burst',t:0,dur:.6,x:e.x1,y:e.y0+50}); AU.boom(.25); } }
    else if(e.type==='burst'){ const r=k*18; ectx.fillStyle=`rgba(255,150,60,${(1-k)*.7})`; ectx.beginPath(); ectx.arc(e.x,e.y,r,0,Math.PI*2); ectx.fill(); }
    else if(e.type==='crows'){ const bx=e.dir>0?lerp(-40,W+40,k):lerp(W+40,-40,k); for(const [ox,oy,ph] of e.off){ const x=bx+ox, y=e.y+oy+Math.sin(time*2+ph)*3, fl=Math.sin(time*14+ph)>0; ctx.fillStyle='#0a0607'; ctx.fillRect(x|0,y|0,2,1); ctx.fillRect((x-2)|0,(y-(fl?1:-1))|0,2,1); ctx.fillRect((x+2)|0,(y-(fl?1:-1))|0,2,1); } }
    else if(e.type==='lightning'){ const a=k<.2?1:k<.35?.2:k<.5?.8:Math.max(0,1-k); ectx.strokeStyle=`rgba(220,210,255,${a.toFixed(2)})`; ectx.lineWidth=1; ectx.beginPath(); e.pts.forEach(([x,y],i)=>i?ectx.lineTo(x,y):ectx.moveTo(x,y)); ectx.stroke(); if(k<.15) U.uWhite.value=Math.max(U.uWhite.value,.18); }
    else if(e.type==='clash'){ for(let i=0;i<6;i++) if(R()<.4){ ectx.fillStyle=pick(['#ffd28a','#fff1c8','#ff7a3a']); ectx.fillRect(e.x+rnd(-20,20),e.y+rnd(-4,4),1,1); } }
    else if(e.type==='eyes'){ const open=Math.sin(Math.PI*k)*(Math.abs(k-e.blink)<.04?.1:1); if(open<=.02) continue; const s=e.s, sx=e.x, sy=e.y;
      const px=P?clamp((P.x-camR.x-sx)/200,-1,1):0, py=P?clamp((P.y-camR.y-sy)/200,-1,1):0;
      for(const d of [-1,1]){ const cx=sx+d*14*s; ectx.fillStyle=`rgba(232,214,150,${(.35*open).toFixed(2)})`; ectx.beginPath(); ectx.ellipse(cx,sy,7*s,3.4*s*open,0,0,Math.PI*2); ectx.fill();
        ectx.fillStyle=`rgba(255,240,190,${(.6*open).toFixed(2)})`; ectx.beginPath(); ectx.ellipse(cx,sy,5*s,2.3*s*open,0,0,Math.PI*2); ectx.fill();
        ctx.fillStyle='#050203'; ctx.fillRect((cx+px*3*s-1)|0,(sy+py*1.2*s-1)|0,2,2); } }
    else if(e.type==='falling'){ const y=lerp(-10,H+20,k*k), x=e.x+Math.sin(k*9)*4; ctx.save(); ctx.translate(x,y); ctx.rotate(k*8); ctx.fillStyle='#120c0e'; ctx.fillRect(-1,-3,2,6); ctx.fillRect(-3,-2,6,1); ctx.fillRect(-2,3,1,2); ctx.fillRect(1,3,1,2); ctx.restore(); }
    else if(e.type==='colossus'){ const rise=Math.sin(Math.PI*k), base=H+10, top=base-150*rise, curl=Math.max(0,(k-.45)*2.4);
      ctx.fillStyle='rgba(6,4,5,.55)'; ctx.beginPath(); ctx.moveTo(e.x-40,base); ctx.lineTo(e.x-34,top+40); ctx.lineTo(e.x+30,top+40); ctx.lineTo(e.x+40,base); ctx.fill();
      for(let i=0;i<4;i++){ const fx=e.x-28+i*18, len=50-Math.abs(i-1.5)*8; ctx.save(); ctx.translate(fx,top+42); ctx.rotate(-.1+i*.07+curl*.9); ctx.fillRect(-5,-len,10,len); ctx.translate(0,-len); ctx.rotate(curl*1.2); ctx.fillRect(-4,-22,8,22); ctx.restore(); } }
    else if(e.type==='bell'){ for(let i=0;i<3;i++){ const kk=k*1.4-i*.18; if(kk<0||kk>1) continue; ectx.strokeStyle=`rgba(200,200,230,${((1-kk)*.25).toFixed(2)})`; ectx.lineWidth=1; ectx.beginPath(); ectx.ellipse(e.x,e.y,kk*120,kk*40,0,0,Math.PI*2); ectx.stroke(); } }
    else if(e.type==='procession'){ // a line of hooded mourners with candles, very far away
      const bx=e.dir>0?lerp(-80,W+80,k):lerp(W+80,-80,k); for(let i=0;i<e.n;i++){ const x=bx-e.dir*i*11, y=e.y+Math.sin(time*2+i)*.6; ctx.fillStyle='rgba(8,5,7,.8)'; ctx.fillRect(x|0,(y-7)|0,4,7); ctx.fillRect((x+1)|0,(y-9)|0,2,2); ectx.fillStyle=`rgba(255,200,120,${(.5+.4*Math.sin(time*9+i)).toFixed(2)})`; ectx.fillRect((x+e.dir*3)|0,(y-8)|0,1,1); } }
    else if(e.type==='hand'){ const rise=Math.sin(Math.PI*k); const base=H+20, top=base-90*rise; ctx.fillStyle='rgba(10,6,8,.6)'; ctx.fillRect(e.x-6,top,12,base-top); for(let i=0;i<4;i++){ ctx.save(); ctx.translate(e.x-5+i*3.5,top); ctx.rotate(-.2+i*.13-rise*.2); ctx.fillRect(-1,-24+Math.abs(i-1.5)*4,2.5,24-Math.abs(i-1.5)*4); ctx.restore(); } }
  }
  if(L&&L.wound>0) drawWound(L.wound);
  if(L&&L.redHour>0) drawCountTower(L.redHour);
}
function drawWound(o){ const cx=W*.62, cy=58-(camR.y||0)*.02, wdt=150, hgt=50*o;
  ctx.save(); ctx.translate(cx,cy);
  ctx.fillStyle=`rgba(30,4,4,${(.7*Math.min(1,o*2)).toFixed(2)})`; ctx.beginPath(); ctx.ellipse(0,0,wdt*1.2,hgt*1.5+6,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=`rgba(90,40,34,${(.85*o).toFixed(2)})`; ctx.beginPath(); ctx.ellipse(0,0,wdt,hgt,0,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle=`rgba(40,6,6,${(.8*o).toFixed(2)})`; ctx.lineWidth=1; for(let i=0;i<12;i++){ ctx.beginPath(); const a=i/12*Math.PI*2; ctx.moveTo(Math.cos(a)*wdt*.95,Math.sin(a)*hgt*.9); ctx.lineTo(Math.cos(a)*wdt*.5,Math.sin(a)*hgt*.35); ctx.stroke(); }
  ctx.restore();
  const lx=P?clamp((P.x-camR.x-cx)/300,-1,1)*30:0;
  const g=ectx; g.save(); g.translate(cx,cy);
  g.strokeStyle=`rgba(255,50,30,${(.25*o).toFixed(2)})`; g.lineWidth=1; g.beginPath(); g.ellipse(0,0,wdt,hgt,0,0,Math.PI*2); g.stroke();
  g.fillStyle=`rgba(200,24,14,${(.55*o).toFixed(2)})`; g.beginPath(); g.ellipse(lx,0,26*Math.min(1,o*1.4),Math.min(26,hgt*.9),0,0,Math.PI*2); g.fill();
  g.fillStyle=`rgba(255,80,50,${(.35*o).toFixed(2)})`; g.beginPath(); g.ellipse(lx,0,12*Math.min(1,o*1.4),Math.min(12,hgt*.5),0,0,Math.PI*2); g.fill();
  g.restore();
  ctx.fillStyle='#050102'; ctx.fillRect(Math.round(cx+lx-2),Math.round(cy-Math.min(22,hgt*.7)),4,Math.round(Math.min(44,hgt*1.4)));
}
function drawCountTower(o){ const x=360, base=H; ctx.fillStyle='#080405'; ctx.fillRect(x,base-150,26,150); ctx.fillRect(x-4,base-156,34,8);
  for(let i=0;i<4;i++) ctx.fillRect(x-4+i*9,base-162,5,6);
  const fx=x+13, fy=base-156; ctx.fillRect(fx-2,fy-12,4,12); ctx.fillRect(fx-1,fy-16,3,4);
  const arm=Math.min(1,o*1.5); ctx.save(); ctx.translate(fx,fy-10); ctx.rotate(-2.4*arm); ctx.fillRect(0,-1,8,2); ctx.restore(); ctx.save(); ctx.translate(fx,fy-10); ctx.rotate(-.7-2.4*arm+3.14); ctx.fillRect(0,-1,8,2); ctx.restore();
  ectx.fillStyle=`rgba(255,200,90,${(o*.9).toFixed(2)})`; ectx.fillRect(fx-2,fy-24,4,2); ectx.fillRect(fx-2,fy-26,1,2); ectx.fillRect(fx+1,fy-26,1,2); }

/* ---------- moving / crumbling platforms and pendulum blades ---------- */
function updPlats(dt){
  for(const p of L.plats){
    if(p.type==='lift'){ const t=((time/p.per)+p.ph)%1; const k=t<.1?0:t<.5?(t-.1)/.4:t<.6?1:1-(t-.6)/.4; const sm=k*k*(3-2*k); const ny=lerp(p.y0,p.y1,sm); p.dy=ny-p.y; p.y=ny; }
    else if(p.type==='crumb'){ if(p.st===1){ p.t-=dt; if(p.t<=0){ p.st=2; p.t=3; for(let i=0;i<8;i++) part({x:p.x+rnd(0,p.w),y:p.y+2,vx:rnd(-20,20),vy:rnd(0,40),g:500,life:rnd(.4,.8),col:'#5a3d27',size:2}); AU.land(); } }
      else if(p.st===2){ p.t-=dt; if(p.t<=0) p.st=0; } }
  }
  for(const pd of L.pends){ pd.a=Math.sin(time*pd.sp+pd.ph)*pd.amp; pd.bx=pd.x+Math.sin(pd.a)*pd.len; pd.by=pd.y+Math.cos(pd.a)*pd.len; }
}
function drawPlats(){
  for(const p of L.plats){ const sx=Math.round(p.x-camR.x), sy=Math.round(p.y-camR.y); if(sx>W||sx+p.w<0||sy<-40||sy>H+40) continue;
    if(p.type==='lift'){ rect(ctx,sx,sy,p.w,5,'#3a2e28'); rect(ctx,sx,sy,p.w,1,'#7a6a5a'); rect(ctx,sx,sy+5,p.w,2,'#120c0a'); for(const cx of [sx+2,sx+p.w-3]){ for(let y=sy-1;y>sy-300;y-=3) rect(ctx,cx,y-2,1,2,'#3e3a44'); } emisAt(p.x+p.w/2,p.y+3,1,g=>{ g.fillStyle='rgba(255,170,90,.5)'; g.fillRect(-1,0,2,1); }); }
    else if(p.type==='crumb'&&p.st!==2){ const jx=p.st===1?ri(-1,1):0; rect(ctx,sx+jx,sy,p.w,4,'#4a3020'); rect(ctx,sx+jx,sy,p.w,1,'#6a4a30'); for(let i=4;i<p.w;i+=7) rect(ctx,sx+jx+i,sy+1,1,3,'#1a100a'); rect(ctx,sx+jx+5,sy+2,3,1,'#1a100a'); } }
  for(const pd of L.pends){ const ax=pd.x-camR.x, ay=pd.y-camR.y, bx=pd.bx-camR.x, by=pd.by-camR.y; if(Math.max(ax,bx)<-40||Math.min(ax,bx)>W+40) continue;
    const n=Math.floor(pd.len/4); for(let i=0;i<n;i++){ const k=i/n; rect(ctx,Math.round(lerp(ax,bx,k)),Math.round(lerp(ay,by,k)),1,2,'#3e3a44'); }
    ctx.save(); ctx.translate(bx,by); ctx.rotate(-pd.a); ctx.fillStyle='#4a4a52'; ctx.beginPath(); ctx.arc(0,0,13,.15,Math.PI-.15); ctx.lineTo(-6,2); ctx.arc(0,-2,7,Math.PI,0,true); ctx.fill(); ctx.fillStyle='#bdb6a8'; ctx.beginPath(); ctx.arc(0,0,13,.3,Math.PI-.3); ctx.arc(0,0,12,Math.PI-.3,.3,true); ctx.fill(); ctx.fillStyle='#5a1414'; ctx.fillRect(-3,9,5,2); ctx.restore();
    emisAt(pd.bx,pd.by,1,g=>{ g.rotate(-pd.a); g.fillStyle='rgba(255,240,220,.35)'; g.fillRect(-9,11,4,1); }); }
}

/* ---------- physics ---------- */
function moveBody(b,dt){
  b.x+=b.vx*dt; b.hitWall=0;
  let l=b.x-b.w/2, r=b.x+b.w/2; const t=b.y-b.h, bt=b.y-.01; const ty0=Math.floor(t/T), ty1=Math.floor(bt/T);
  if(b.vx>0){ const tx=Math.floor(r/T); for(let ty=ty0;ty<=ty1;ty++) if(tileAt(tx,ty)===1){ b.x=tx*T-b.w/2-.01; b.vx=0; b.hitWall=1; break; } }
  else if(b.vx<0){ const tx=Math.floor(l/T); for(let ty=ty0;ty<=ty1;ty++) if(tileAt(tx,ty)===1){ b.x=(tx+1)*T+b.w/2+.01; b.vx=0; b.hitWall=-1; break; } }
  const py=b.y; b.y+=b.vy*dt; b.onGround=false; b.spiked=false; b.plat=null;
  l=b.x-b.w/2+.01; r=b.x+b.w/2-.01; const tx0=Math.floor(l/T), tx1=Math.floor(r/T);
  if(b.vy>=0){ const ty=Math.floor(b.y/T); for(let tx=tx0;tx<=tx1;tx++){ const v=tileAt(tx,ty); if(v===1||(v===2&&py<=ty*T+.5&&!(b.drop>0))){ b.y=ty*T; b.vy=0; b.onGround=true; break; } if(v===3) b.spiked=true; }
    if(!b.onGround&&!(b.drop>0)) for(const p of L.plats){ if(p.type==='crumb'&&p.st===2) continue; if(r>p.x&&l<p.x+p.w&&py<=p.y+1.5+(p.dy>0?p.dy:0)&&b.y>=p.y){ b.y=p.y; b.vy=0; b.onGround=true; b.plat=p; if(p.type==='crumb'&&p.st===0&&b===P){ p.st=1; p.t=.45; } break; } } }
  else { const ty=Math.floor((b.y-b.h)/T); for(let tx=tx0;tx<=tx1;tx++) if(tileAt(tx,ty)===1){ b.y=(ty+1)*T+b.h; b.vy=0; break; } }
  const mt=tileAt(Math.floor(b.x/T),Math.floor((b.y-Math.min(10,b.h*.4))/T)); const was=b.wet; b.wet=mt===4;
  if(b.wet&&!was&&b.vy>60){ for(let i=0;i<8;i++) part({x:b.x+rnd(-5,5),y:Math.floor((b.y-4)/T)*T+2,vx:rnd(-50,50),vy:rnd(-120,-40),g:500,life:rnd(.3,.6),col:'rgba(150,200,205,.7)',size:1}); if(b===P) AU.noise(.25,1200,300,1,.25,'lowpass',.2); }
  if(tileAt(Math.floor(b.x/T),Math.floor((b.y-1)/T))===5) { b.spiked=true; b.lava=true; } else b.lava=false;
}
