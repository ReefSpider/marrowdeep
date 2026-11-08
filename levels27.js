'use strict';
/* ===== v27 levels, part 1: fire walls, the burning barn, tall grass, decor that doesn't look like loot =====
   - Outdoors, the gates of a Blood Arena or the last chamber are a wall of fire as tall as the room, so it can't
     be jumped. The last chamber also closes its ceiling.
   - The last chamber of the Quiet Fields is a barn on fire.
   - The fields have tall grass. Anything in it, you included, can't be seen: only the grass moving gives it away.
   - The Last Light's crates looked like chests and the pass had gold boxes in its shrines. Now they are
     barricades, cairns and skull shrines. */

/* ---------- fire walls ---------- */
(function(){ const o=setDoors; setDoors=function(a,on){ o(a,on); if(!L||!L.def.open||!on) { if(!on) a.fire=0; return; }
  a.closed=a.closed||[]; const fill=(x,y)=>{ if(y<0||y>=L.h||x<0||x>=L.w) return; if(L.g[y][x]===0||L.g[y][x]===4){ a.closed.push([x,y,L.g[y][x]]); L.g[y][x]=1; } };
  for(let y=a.oy;y<=a.oy+15;y++) for(const x of [a.ox,a.ox+RW-1]) fill(x,y);
  if(a.final) for(let x=a.ox+1;x<a.ox+RW-1;x++) fill(x,a.oy);
  a.fire=time; AU.fire?AU.fire():AU.noise(.8,500,200,1,.35,'lowpass',.5); shake(4); }; })();
/* reopening has to put water back as water */
(function(){ const o=setDoors; setDoors=function(a,on){ if(!on&&a.closed){ for(const c of a.closed) if(c[2]===4){ L.g[c[1]][c[0]]=4; c.done=1; } a.closed=a.closed.filter(c=>!c.done); } return o(a,on); }; })();
function fireCol(wx,y0,y1,t0,a){ const sx=Math.round(wx-camR.x); if(sx<-20||sx>W+20) return; const top=Math.max(y0-camR.y,-10), bot=Math.min(y1-camR.y,H+10); if(bot<top) return;
  const k=Math.min(1,(time-t0)*2.5);
  for(let y=bot;y>top;y-=3){ const ph=time*9+y*.21+wx; const w=Math.round((5+3*Math.sin(ph)+2*Math.sin(ph*1.7))*k);
    ectx.fillStyle=`rgba(255,${(90+60*Math.sin(ph*1.3)+60)|0},40,${(.55+.3*Math.sin(ph*2.1)).toFixed(2)})`; ectx.fillRect(sx-w,Math.round(y),w*2,3);
    ectx.fillStyle='rgba(255,236,170,.75)'; ectx.fillRect(sx-Math.round(w*.35),Math.round(y),Math.max(1,Math.round(w*.7)),3); }
  for(let i=0;i<3;i++){ const f=(time*.8+i/3+wx*.013)%1; ectx.fillStyle=`rgba(255,160,60,${(.9-f).toFixed(2)})`; ectx.fillRect(sx+Math.round(Math.sin(f*9+i)*8),Math.round(bot-(bot-top)*f),1,2); }
  for(let y=y0;y<y1;y+=64) addLight(wx,y+32,90*k,.9*k,1,.45,.15); }
function drawFireWalls(){ if(!L||!L.def.open||!L.arenas) return; for(const a of L.arenas){ if(!a.fire) continue; const y0=a.oy*T, y1=(a.oy+16)*T;
    fireCol(a.ox*T+8,y0,y1,a.fire,a); fireCol((a.ox+RW-1)*T+8,y0,y1,a.fire,a);
    if(!P.dead&&P.dash<=0&&(Math.abs(P.x-(a.ox*T+8))<14||Math.abs(P.x-((a.ox+RW-1)*T+8))<14)&&P.y>y0&&P.y<y1+8&&!(P.fireHit>time)){ P.fireHit=time+.8; hurtPlayer(4+diff()*2,{x:P.x<(a.ox+RW/2)*T?P.x-20:P.x+20,hp:0,dead:true}); } } }
(function(){ const o=drawHazards; drawHazards=function(){ o(); drawFireWalls(); }; })();

/* ---------- the burning barn (the Quiet Fields' last chamber) ---------- */
function barnArena(){ return L&&L.def.look==='meadow'&&L.def.kind!=='boss'&&L.finalArena; }
function drawBarnBack(){ const a=barnArena(); if(!a) return; const x0=a.ox*T-camR.x, y0=a.oy*T-camR.y, w=RW*T, h=RH*T; if(x0>W||x0+w<0||y0>H||y0+h<0) return;
  const fl=n=>.5+.5*Math.sin(time*7+n);
  /* the glow behind the boards */
  const g=ctx.createLinearGradient(0,y0,0,y0+h); g.addColorStop(0,'rgba(60,10,6,.0)'); g.addColorStop(.5,'rgba(120,30,10,.55)'); g.addColorStop(1,'rgba(200,70,20,.7)'); ctx.fillStyle=g; ctx.fillRect(Math.round(x0),Math.round(y0),w,h);
  /* charred plank walls, with gaps the fire shows through */
  for(let x=0;x<w;x+=9){ const gap=hsh(a.ox*31+x,7)>.8; if(gap) continue; const top=h*.18+(hsh(x,a.oy)*.12)*h; ctx.fillStyle=hsh(x,3)>.5?'#1a1210':'#120c0a'; ctx.fillRect(Math.round(x0+x),Math.round(y0+top),8,Math.round(h-top)); ctx.fillStyle='#2a1a12'; ctx.fillRect(Math.round(x0+x),Math.round(y0+top),1,Math.round(h-top)); }
  /* posts and the roof truss, half burned through */
  ctx.fillStyle='#0a0606'; for(const px of [10,w/2-5,w-20]) ctx.fillRect(Math.round(x0+px),Math.round(y0+h*.12),10,Math.round(h*.88));
  ctx.strokeStyle='#0a0606'; ctx.lineWidth=6; ctx.beginPath(); ctx.moveTo(x0+4,y0+h*.2); ctx.lineTo(x0+w/2,y0+4); ctx.lineTo(x0+w*.78,y0+h*.12); ctx.stroke();
  ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(x0+w*.84,y0+h*.18); ctx.lineTo(x0+w-4,y0+h*.24); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x0+20,y0+h*.2); ctx.lineTo(x0+w-20,y0+h*.2); ctx.stroke();
  /* the loft beam with a hanging lantern and a rope */
  ctx.fillStyle='#0a0606'; ctx.fillRect(Math.round(x0+w*.3),Math.round(y0+h*.2),1,Math.round(h*.22)); ctx.fillRect(Math.round(x0+w*.3-3),Math.round(y0+h*.42),7,9);
  /* flames along the eaves and up the boards */
  for(let i=0;i<14;i++){ const fx=x0+(i+.5)*w/14, base=y0+h*(.2+.05*Math.sin(i*2.3)), fh=18+14*fl(i*1.9);
    ectx.fillStyle=`rgba(255,${(110+80*fl(i))|0},40,${(.45+.35*fl(i*3)).toFixed(2)})`; ectx.beginPath(); ectx.moveTo(fx-7,base); ectx.quadraticCurveTo(fx+5*Math.sin(time*5+i),base-fh,fx+2,base-fh*1.1); ectx.quadraticCurveTo(fx+3,base-fh*.4,fx+7,base); ectx.fill(); }
  for(let i=0;i<5;i++){ const fx=x0+w*(.12+.19*i), fh=30+20*fl(i*2.7), base=y0+h; ectx.fillStyle=`rgba(255,${(80+70*fl(i+1))|0},30,${(.35+.25*fl(i)).toFixed(2)})`; ectx.beginPath(); ectx.moveTo(fx-10,base); ectx.quadraticCurveTo(fx+6*Math.sin(time*4+i),base-fh,fx,base-fh*1.2); ectx.quadraticCurveTo(fx+4,base-fh*.5,fx+10,base); ectx.fill(); }
  /* smoke rolling out under the roof */
  for(let i=0;i<10;i++){ const f=(time*.06+i/10)%1; ctx.fillStyle=`rgba(20,14,14,${(.35*(1-f)).toFixed(2)})`; ctx.beginPath(); ctx.arc(x0+w*(i/10)+Math.sin(time*.5+i)*10,y0+h*.18-f*60,10+f*22,0,7); ctx.fill(); }
  for(let i=0;i<4;i++) addLight(a.ox*T+w*(.15+.23*i),a.oy*T+h*.7,140,.85+.15*fl(i),1,.45,.15); }
(function(){ const o=drawWeather; drawWeather=function(){ o(); if(L){ drawBarnBack(); if(typeof drawBackFolk==='function') drawBackFolk(); } }; })();
/* embers and ash falling in the barn, in front */
function drawBarnFront(){ const a=barnArena(); if(!a) return; const x0=a.ox*T-camR.x, y0=a.oy*T-camR.y, w=RW*T, h=RH*T; if(x0>W||x0+w<0) return;
  for(let i=0;i<40;i++){ const f=(time*(.12+(i%5)*.03)+i*.137)%1; const x=x0+((i*53)%w)+Math.sin(time+i)*6, y=y0+h-f*h; ectx.fillStyle=`rgba(255,${120+(i%4)*30},50,${(.8*(1-f)).toFixed(2)})`; ectx.fillRect(Math.round(x),Math.round(y),1,1+(i%2)); }
  if(a.state===1){ ctx.fillStyle='rgba(40,10,4,.12)'; ctx.fillRect(Math.max(0,Math.round(x0)),Math.max(0,Math.round(y0)),Math.min(W,w),Math.min(H,h)); } }

/* ---------- tall grass ---------- */
function plantGrass(Lv){ Lv.grass=[]; if(Lv.def.look!=='meadow'&&Lv.def.look!=='fen') return; const fen=Lv.def.look==='fen';
  const ground=(x,y)=>Lv.g[y]&&Lv.g[y][x]===1&&Lv.g[y-1]&&Lv.g[y-1][x]===0&&Lv.g[y-2]&&Lv.g[y-2][x]===0;
  const fin=Lv.rooms&&Lv.rooms.length?Lv.rooms[Lv.rooms.length-1]:null, first=Lv.rooms&&Lv.rooms[0];
  for(let y=3;y<Lv.h;y++){ let run=0; for(let x=2;x<Lv.w-1;x++){ const inRoom=r=>r&&x>=r.x*RW&&x<(r.x+1)*RW&&y>=r.y*RH&&y<(r.y+1)*RH;
      const ok=ground(x,y)&&!inRoom(fin)&&!(inRoom(first)&&x<first.x*RW+8);
      if(ok) run++; if((!ok||x===Lv.w-2)&&run>=4){ const len=run; let s=x-run; run=0;
        /* a patch or two in each run, 3-7 tiles wide */
        while(s<x-3){ const h=hsh(s*13,y*7); const pw=Math.min(x-s,3+Math.floor(h*5)); if(h>(fen?.45:.35)) Lv.grass.push({x0:s*T,x1:(s+pw)*T,y:y*T,fen,seed:h*100,rustle:0}); s+=pw+2+Math.floor(hsh(s,y)*5); } } else if(!ok) run=0; } } }
(function(){ const o=loadLevel; loadLevel=function(idx,opt){ const r=o(idx,opt); if(L&&L.def.open) plantGrass(L); else if(L) L.grass=[]; return r; }; })();
function inGrass(x,y){ if(!L||!L.grass) return null; for(const g of L.grass) if(x>g.x0+2&&x<g.x1-2&&Math.abs(y-g.y)<6) return g; return null; }
function drawGrass(){ if(!L||!L.grass||!L.grass.length) return;
  for(const g of L.grass){ const sx0=g.x0-camR.x, sx1=g.x1-camR.x, sy=g.y-camR.y; if(sx1<-4||sx0>W+4||sy<-40||sy>H+10) continue;
    const pin=inGrass(P.x,P.y)===g&&!P.dead; if(pin&&Math.abs(P.vx)>20) g.rustle=Math.min(1,g.rustle+.08); else g.rustle*=.96;
    for(let x=Math.floor(sx0);x<sx1;x+=2){ const wx=x+camR.x, hh=hsh(wx,g.seed); const edge=Math.min(x-sx0,sx1-x)/10; const ht=Math.round((g.fen?30:28)+hh*10)*Math.min(1,.45+edge);
      const near=pin?Math.max(0,1-Math.abs(wx-P.x)/22):0; const lean=Math.sin(time*1.4+wx*.05)*2+near*g.rustle*Math.sin(time*18+wx)*3;
      const base=g.fen?['#1e2a18','#2e3e22','#4a5a30']:['#26241a','#4a4430','#8a7a4e'];
      ctx.fillStyle=base[0]; ctx.fillRect(x,Math.round(sy-ht*.45),2,Math.round(ht*.45)+1);
      ctx.fillStyle=base[1]; ctx.fillRect(Math.round(x+lean*.5),Math.round(sy-ht*.8),1,Math.round(ht*.36));
      ctx.fillStyle=hh>.5?base[2]:base[1]; ctx.fillRect(Math.round(x+lean),Math.round(sy-ht),1,Math.round(ht*.22));
      if(!g.fen&&hh>.86){ ctx.fillStyle='#b8a46a'; ctx.fillRect(Math.round(x+lean)-1,Math.round(sy-ht)-2,2,3); } }
    if(g.rustle>.3&&R()<.08) part({x:P.x+rnd(-8,8),y:g.y-26,vx:rnd(-20,20),vy:rnd(-40,-10),g:120,life:.6,col:g.fen?'#4a5a30':'#8a7a4e'}); } }
(function(){ const o=render; render=function(){ o(); if(!L) return; if(mode==='play'||mode==='pause'||mode==='cut'){ drawGrass(); drawBarnFront(); } }; })();
/* foes can't see you in the grass either, unless they're close */
(function(){ const o=updEnemy; updEnemy=function(e,dt){ if(L&&L.grass&&L.grass.length&&!e.boss&&inGrass(P.x,P.y)&&Math.abs(P.x-e.x)>70&&Math.abs(P.vx)<60){ const sv=P.ghostT; P.ghostT=Math.max(sv,.01); try{ return o(e,dt); } finally{ P.ghostT=sv; } } return o(e,dt); }; })();

/* ---------- decor that doesn't look like loot ---------- */
(function(){ const o=regionDecor; regionDecor=function(Lv,g,lk){ const look=Lv.def.look; if(look!=='fort'&&look!=='pass') return o(Lv,g,lk);
  const P_=(x,y,w,h,col)=>{ g.fillStyle=col; g.fillRect(Math.round(x),Math.round(y),w,h); };
  const ground=(x,y)=>Lv.g[y][x]===1&&Lv.g[y-1]&&Lv.g[y-1][x]===0&&Lv.g[y-2]&&Lv.g[y-2][x]===0; Lv.props=[]; let last=-9;
  for(let x=5;x<Lv.w-5;x++) for(let y=3;y<Lv.h;y++){ if(!ground(x,y)||!ground(x+1,y)||x-last<4) continue; const r=hsh(x*17,y*3); if(r<.72) continue; last=x; const px=x*T, py=y*T;
    if(look==='fort'){ if(r>.88){ P_(px+3,py-10,10,10,'#2c3240'); P_(px+5,py-12,6,2,'#d0782a'); Lv.props.push({k:'brazier',x:px+8,y:py-12}); }
      else if(r>.8){ /* a cheval-de-frise: crossed stakes */ for(let k=0;k<3;k++){ g.strokeStyle='#3a2a1c'; g.lineWidth=2; g.beginPath(); g.moveTo(px+k*6,py); g.lineTo(px+k*6+8,py-12); g.moveTo(px+k*6+8,py); g.lineTo(px+k*6,py-12); g.stroke(); } P_(px,py-7,20,2,'#2a1e14'); P_(px+6,py-13,1,1,'#eceae4'); }
      else { /* a snowdrift over a fallen shield */ P_(px,py-3,16,3,'#d8d6d0'); P_(px+2,py-5,10,2,'#eceae4'); P_(px+11,py-6,4,5,'#5a606a'); P_(px+12,py-5,2,1,'#8a1a14'); } }
    else { if(r>.9){ /* a cairn with a skull on it */ P_(px+2,py-4,12,4,'#5a606a'); P_(px+4,py-8,8,4,'#7b848b'); P_(px+6,py-11,4,3,'#9aa0a6'); P_(px+6,py-15,4,4,'#ebe4d2'); P_(px+7,py-14,1,1,'#121418'); P_(px+9,py-14,1,1,'#121418'); P_(px+11,py-20,1,10,'#3a2a1c'); P_(px+11,py-20,4,2,'#8a1a14'); }
      else { for(let k=0;k<4;k++) P_(px+2+k,py-3-k*3,8-k*2,3,k%2?'#7b848b':'#b8bdc0'); } } }
  }; })();

/* ---------- the Quiet Fields at dusk: the first thing anyone sees of the March ----------
   Was a pale, empty noon. Now: a bruised dusk with the sun going down red behind a burning farm, dead trees
   with men hanging in them, crucified scarecrows on the near ridge, and at the start of the road a gibbet with
   the last people who didn't pay the tithe. The crows have found them. */
LOOKS.meadow=Object.assign(LOOKS.meadow,{soil:['#3a3a2c','#34342a','#403e30'],deep:'#1a1a14',top:'#7a6a40',top2:'#a08a56',tuft:['#7a6a40','#a08a56','#5a5a44','#3e4234'],edge:'#3e4234',fog:'#6a3a34',weather:'chaff'});
PALS.meadow=Object.assign(PALS.meadow,{sky:['#3a1a1e','#7a3a2a','#c0703a'],shaft:'rgba(255,170,110,',amb:[.62,.5,.46]});
BGPAINT.meadow=function(f,m){
  dGrad(f,0,0,960,320,['#1e1220','#4a2030','#8a3a2c','#c8683a'],2);
  /* the sun going down, too big and too red */
  for(let r=60;r>0;r-=2){ f.fillStyle=`rgba(255,${120+r},${60+r/2},${(.04).toFixed(2)})`; f.beginPath(); f.arc(610,214,r*2,0,7); f.fill(); }
  f.fillStyle='#e8603a'; f.beginPath(); f.arc(610,214,34,0,7); f.fill(); f.fillStyle='#f4a060'; f.fillRect(586,212,48,2); f.fillRect(592,222,36,1);
  dFog(f,0,120,960,90,'#5a2a2a',.35,2,3);
  /* the burning farm on the horizon and its smoke */
  ridge(f,960,238,10,'#2a1820',3,3);
  f.fillStyle='#160e12'; f.fillRect(250,222,40,16); f.beginPath(); f.moveTo(246,223); f.lineTo(270,206); f.lineTo(294,223); f.fill(); f.fillRect(296,226,22,12);
  f.fillStyle='#ff7a30'; f.fillRect(258,226,4,4); f.fillRect(276,228,3,3); for(let i=0;i<10;i++){ f.fillStyle=`rgba(255,${100+i*10},40,${(.5-i*.04).toFixed(2)})`; f.fillRect(262+((i*7)%22),206-i*3,4,6); }
  for(let i=0;i<40;i++){ f.fillStyle=`rgba(24,16,18,${(.55-i*.012).toFixed(2)})`; f.beginPath(); f.arc(272+i*3+Math.sin(i*.6)*8,196-i*4.2,6+i*.7,0,7); f.fill(); }
  dFog(f,0,215,960,60,'#6a3a34',.5,2,2); ridge(f,960,262,8,'#1e1418',4,2);
  /* dead trees with men in them */
  const tree=(g,x,y,h,s)=>{ g.fillStyle='#0e0a0c'; g.fillRect(x,y-h,4,h); const br=(bx,by,dx,dy,n)=>{ for(let i=0;i<n;i++){ g.fillRect(Math.round(bx+dx*i),Math.round(by+dy*i),2,2); } };
    br(x+2,y-h*.7,1.6,-1,h*.3); br(x,y-h*.55,-1.8,-.8,h*.28); br(x+3,y-h*.85,.8,-1.4,h*.2); br(x,y-h*.9,-.9,-1.2,h*.18);
    if(s){ const hx=x+2+h*.3*1.6*.6, hy=y-h*.7-h*.3*.6; g.fillRect(Math.round(hx),Math.round(hy),1,10); g.fillRect(Math.round(hx-2),Math.round(hy+10),5,10); g.fillRect(Math.round(hx-1),Math.round(hy+20),1,6); g.fillRect(Math.round(hx+1),Math.round(hy+20),1,5); } };
  tree(f,120,262,70,1); tree(f,420,258,54,0); tree(f,820,262,80,1); tree(f,700,256,40,0);
  /* crows wheeling over the smoke */
  f.fillStyle='#0e0a0c'; for(let i=0;i<14;i++){ const cx=230+((i*37)%120), cy=120+((i*53)%60); f.fillRect(cx-2,cy,2,1); f.fillRect(cx,cy+1,1,1); f.fillRect(cx+1,cy,2,1); }
  /* near ridge (mid layer): crucified scarecrows, stooks, a broken fence */
  m.fillStyle='#120c0e'; for(let x=0;x<1200;x++){ const h=14+Math.round(6*Math.sin(x*.011)+3*Math.sin(x*.037)); m.fillRect(x,320-h,1,h); }
  for(let i=0;i<5;i++){ const x=60+i*250+((i*71)%60), y=320-18; m.fillRect(x,y-40,2,40); m.fillRect(x-12,y-32,26,2); m.fillRect(x-4,y-30,10,14); m.fillRect(x-3,y-37,8,7); m.fillRect(x-8,y-38,18,2); m.fillRect(x-5,y-42,12,4);
    m.fillRect(x-12,y-30,2,6); m.fillRect(x+12,y-30,2,6); }
  for(let i=0;i<9;i++){ const x=20+i*134+((i*41)%50), y=320-16; m.beginPath(); m.moveTo(x-7,y); m.lineTo(x,y-16); m.lineTo(x+7,y); m.fill(); }
  for(let x=900;x<1180;x+=14){ m.fillRect(x,320-30+((x*7)%5),2,16); if(x%28) m.fillRect(x,320-26,14,2); } };

/* the gibbet at the start of the road, and other things the crows have found */
(function(){ const o=regionDecor; regionDecor=function(Lv,g,lk){ o(Lv,g,lk); if(Lv.def.look!=='meadow'||!Lv.rooms||!Lv.rooms.length) return;
  const s=Lv.rooms[0], ox=s.x*RW, oy=s.y*RH; const fl=x=>{ for(let y=oy+2;y<oy+RH;y++) if(Lv.g[y][x]===1&&Lv.g[y-1][x]===0) return y; return -1; };
  const P_=(x,y,w,h,col)=>{ g.fillStyle=col; g.fillRect(Math.round(x),Math.round(y),w,h); };
  /* the gibbet: a post, an arm and a brace, with the hanged swinging (drawn live) */
  const gx=ox+9, gy=fl(gx); if(gy>0){ const px=gx*T, py=gy*T; P_(px,py-84,5,84,'#1a1210'); P_(px+1,py-84,1,84,'#3a2a1c'); P_(px,py-84,46,4,'#1a1210'); P_(px+5,py-70,2,2,'#1a1210');
    g.strokeStyle='#1a1210'; g.lineWidth=3; g.beginPath(); g.moveTo(px+4,py-60); g.lineTo(px+22,py-82); g.stroke(); P_(px-6,py-4,18,4,'#2a1e16');
    Lv.props.push({k:'hanged',x:px+20,y:py-80,len:28,seed:1},{k:'hanged',x:px+38,y:py-80,len:22,seed:2.7});
    /* a tithe board nailed to the post */
    P_(px-10,py-50,14,10,'#5a4636'); P_(px-9,py-49,12,1,'#8a1a14'); P_(px-9,py-46,8,1,'#2a1e16'); P_(px-9,py-44,10,1,'#2a1e16'); }
  /* a cart of bodies, a dead horse, crows on it */
  const cx=ox+15, cy=fl(cx); if(cy>0){ const px=cx*T, py=cy*T; P_(px,py-14,28,8,'#3a2a1c'); P_(px,py-14,28,1,'#5a4636'); P_(px+4,py-8,8,8,'#1a1210'); P_(px+6,py-6,4,4,'#3a2a1c'); P_(px+28,py-10,14,2,'#3a2a1c');
    for(let k=0;k<4;k++){ P_(px+2+k*6,py-19+((k*3)%4),7,5,k%2?'#cfc6b2':'#8a7a6a'); } P_(px+6,py-20,2,4,'#cfc6b2'); P_(px+20,py-21,1,5,'#cfc6b2'); P_(px+3,py-6,1,6,'#6a1a22');
    Lv.props.push({k:'crowfeed',x:px+12,y:py-20,seed:3},{k:'crowfeed',x:px+22,y:py-19,seed:5}); }
  /* farm lamps on poles down the road: warm pools of light in the dusk, like the royal houses' candles */
  { let last=-99; const gr=(x,y)=>Lv.g[y][x]===1&&Lv.g[y-1]&&Lv.g[y-1][x]===0&&Lv.g[y-2]&&Lv.g[y-2][x]===0&&Lv.g[y-3]&&Lv.g[y-3][x]===0;
    for(let x=ox+26;x<Lv.w-4;x++) for(let y=4;y<Lv.h;y++){ if(!gr(x,y)||x-last<18||hsh(x*5,y*9)<.55) continue; last=x; const px=x*T, py=y*T; P_(px+7,py-30,2,30,'#1a1210'); P_(px+7,py-31,7,2,'#1a1210'); Lv.props.push({k:'lamp',x:px+13,y:py-30}); } }
  const hx=ox+21, hy=fl(hx); if(hy>0){ const px=hx*T, py=hy*T; P_(px,py-8,22,7,'#3a2620'); P_(px+20,py-10,8,5,'#3a2620'); P_(px+26,py-8,3,2,'#cfc6b2'); for(let k=0;k<4;k++) P_(px+2+k*5,py-3,1,3,'#1a1210'); P_(px+6,py-7,10,1,'#6a1a22'); P_(px+8,py-4,6,1,'#8a1a14'); Lv.props.push({k:'crowfeed',x:px+10,y:py-8,seed:7}); } }; })();
function drawMeadowProps(){ if(!L||!L.props||L.def.look!=='meadow') return;
  for(const p of L.props){ const sx=Math.round(p.x-camR.x), sy=Math.round(p.y-camR.y); if(sx<-40||sx>W+40||sy<-40||sy>H+80) continue;
    if(p.k==='hanged'){ const a=Math.sin(time*.9+p.seed)*.12, bx=sx+Math.sin(a)*p.len, by=sy+Math.cos(a)*p.len; ctx.strokeStyle='#2a1e16'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(bx,by); ctx.stroke();
      rect(ctx,Math.round(bx-2),Math.round(by),5,5,'#5a4a3a'); rect(ctx,Math.round(bx-1),Math.round(by+1),1,1,'#120c0e'); rect(ctx,Math.round(bx+1),Math.round(by+1),1,1,'#120c0e'); rect(ctx,Math.round(bx-3),Math.round(by+5),7,12,'#2a2026'); rect(ctx,Math.round(bx-3),Math.round(by+5),7,1,'#4a2c38');
      rect(ctx,Math.round(bx-2),Math.round(by+17),2,9,'#2a2026'); rect(ctx,Math.round(bx+1),Math.round(by+17),2,8,'#2a2026'); rect(ctx,Math.round(bx-4),Math.round(by+6),1,9,'#2a2026'); rect(ctx,Math.round(bx+4),Math.round(by+6),1,9,'#2a2026');
      if(Math.sin(time*.3+p.seed*3)>.6){ rect(ctx,Math.round(bx+2),Math.round(by-3),3,2,'#0e0a0c'); } }
    else if(p.k==='crowfeed'){ const peck=Math.sin(time*6+p.seed)>.4?1:0, near=Math.abs(P.x-p.x)<50; if(near&&!p.fled){ p.fled=time; for(let i=0;i<5;i++) part({x:p.x,y:p.y,vx:rnd(-80,80),vy:rnd(-140,-60),g:-30,life:1.2,col:'#0e0a0c'}); AU.noise&&AU.noise(.3,2600,900,2,.18,'bandpass',.3); }
      if(p.fled&&time-p.fled<12) continue; if(p.fled&&!near) p.fled=0;
      rect(ctx,sx-3,sy-4+peck,6,4,'#0e0a0c'); rect(ctx,sx+(peck?2:1),sy-6+peck*2,3,3,'#0e0a0c'); rect(ctx,sx+(peck?5:4),sy-5+peck*2,2,1,'#3a3430'); rect(ctx,sx-5,sy-3,3,1,'#0e0a0c'); } } }
(function(){ const o=drawHazards; drawHazards=function(){ o(); drawMeadowProps(); }; })();

/* ---------- the Harvest Villages: they watch you from the houses ----------
   The villagers no longer stand in the street. They are behind the windows, in the doorways and round the
   corners of the houses, back from the road, and you see their eyes first. Look straight at one and it ducks
   out of sight; turn away and it's back. */
(function(){ const o=loadLevel; loadLevel=function(idx,opt){ const r=o(idx,opt); if(L&&L.def.look==='villages'&&L.props){ let n=0;
    for(const p of L.props) if(p.k==='folk'){ p.k='watch'; p.kind=['window','door','corner','window','loft'][(n++)%5]; p.hide=0; p.blink=rnd(2,6); p.y0=p.y; }
    } return r; }; })();
function drawBackFolk(){ if(!L||!L.props||L.def.look!=='villages') return;
  for(const p of L.props){ if(p.k!=='watch') continue; const sx=Math.round(p.x-camR.x), sy=Math.round(p.y-camR.y); if(sx<-50||sx>W+50||sy<-80||sy>H+40) continue;
    const dx=P.x-p.x, near=Math.abs(dx)<110, faced=near&&Math.sign(dx)!==(P.face||1)&&!P.dead; /* the hero is looking their way */
    p.hide=approach(p.hide,faced?1:0,faced?.12:.015); p.blink-=1/60; if(p.blink<-.12) p.blink=rnd(2,6);
    /* the house front behind them */
    const hw=36, hh=p.kind==='loft'?56:44; rect(ctx,sx-hw/2,sy-hh,hw,hh,'#2a2016'); rect(ctx,sx-hw/2,sy-hh,hw,1,'#3a2c1e'); for(let y=sy-hh+6;y<sy;y+=7) rect(ctx,sx-hw/2,y,hw,1,'#1e160e');
    ctx.fillStyle='#1a120c'; ctx.beginPath(); ctx.moveTo(sx-hw/2-4,sy-hh); ctx.lineTo(sx,sy-hh-14); ctx.lineTo(sx+hw/2+4,sy-hh); ctx.fill();
    let ox=0, oy=0, w=10, h=10; if(p.kind==='window'){ ox=-5; oy=-30; } else if(p.kind==='door'){ ox=-6; oy=-24; w=12; h=24; } else if(p.kind==='loft'){ ox=-5; oy=-50; } else { ox=hw/2-2; oy=-22; w=8; h=22; }
    if(p.kind!=='corner') rect(ctx,sx+ox,sy+oy,w,h,'#07050a');
    /* the watcher: a shape in the dark, then the eyes */
    const up=1-p.hide; if(up<.05) continue; const hx=sx+ox+w/2+(p.kind==='corner'?2:0), hy=sy+oy+(p.kind==='door'?6:4)+Math.round(p.hide*10);
    ctx.save(); ctx.beginPath(); ctx.rect(sx+ox-(p.kind==='corner'?0:0),sy+oy,p.kind==='corner'?12:w,h); ctx.clip();
    rect(ctx,hx-3,hy,6,6,'#0e0a08'); rect(ctx,hx-5,hy+6,10,10,'#0e0a08'); ctx.restore();
    if(p.blink>0&&up>.5){ const lk=clamp(Math.round(dx/120),-1,1); ectx.fillStyle=`rgba(240,226,180,${(.75*up).toFixed(2)})`; ectx.fillRect(hx-2+lk,hy+2,1,1); if(p.kind!=='corner') ectx.fillRect(hx+1+lk,hy+2,1,1);
      ectx.fillStyle=`rgba(240,226,180,${(.18*up).toFixed(2)})`; ectx.fillRect(hx-3+lk,hy+1,6,3); } } }

/* ---------- the Old City: his portraits are not a man's any more ---------- */
function drawDemonPortraits(){ if(!L||!L.props||L.def.look!=='oldcity') return;
  for(const p of L.props){ if(p.k!=='portrait'||p.bleed) continue; const sx=Math.round(p.x-camR.x), sy=Math.round(p.y-camR.y); if(sx<-30||sx>W+30||sy<-40||sy>H+40) continue;
    const near=Math.abs(P.x-p.x)<90&&Math.abs(P.y-p.y)<90, k=near?1:0; p.wake=approach(p.wake||0,k,.04);
    rect(ctx,sx-10,sy-13,20,24,'#3a2a14'); rect(ctx,sx-9,sy-12,18,22,'#6a4a1a'); rect(ctx,sx-7,sy-10,14,18,'#120608');
    /* horns that go out past the frame */
    ctx.fillStyle='#1a1214'; ctx.beginPath(); ctx.moveTo(sx-4,sy-8); ctx.quadraticCurveTo(sx-12,sy-14,sx-9,sy-20); ctx.lineTo(sx-6,sy-12); ctx.fill(); ctx.beginPath(); ctx.moveTo(sx+4,sy-8); ctx.quadraticCurveTo(sx+12,sy-14,sx+9,sy-20); ctx.lineTo(sx+6,sy-12); ctx.fill();
    rect(ctx,sx-5,sy-9,10,11,'#8a8070'); rect(ctx,sx-5,sy-9,10,1,'#a89c88'); rect(ctx,sx-5,sy-4,1,4,'#5a5048'); rect(ctx,sx+4,sy-4,1,4,'#5a5048');
    rect(ctx,sx-6,sy-11,12,2,'#b8913a'); rect(ctx,sx-5,sy-13,1,2,'#b8913a'); rect(ctx,sx,sy-13,1,2,'#b8913a'); rect(ctx,sx+4,sy-13,1,2,'#b8913a');
    const dx=clamp(Math.round((P.x-p.x)/90),-1,1), dy=clamp(Math.round((P.y-20-p.y)/90),-1,1);
    rect(ctx,sx-4,sy-7,3,3,'#0a0204'); rect(ctx,sx+1,sy-7,3,3,'#0a0204'); ectx.fillStyle=`rgba(255,${(40+80*p.wake)|0},30,${(.6+.4*p.wake).toFixed(2)})`; ectx.fillRect(sx-3+dx*.5|0,sy-6+dy*.5|0,1,1); ectx.fillRect(sx+2+dx*.5|0,sy-6+dy*.5|0,1,1);
    const mo=Math.round(1+p.wake*3); rect(ctx,sx-4,sy-2,8,mo,'#1a0204'); for(let t=-3;t<4;t+=2){ rect(ctx,sx+t,sy-2,1,1,'#e8e0c8'); if(mo>2) rect(ctx,sx+t,sy-2+mo-1,1,1,'#e8e0c8'); }
    rect(ctx,sx-7,sy+2,14,6,'#2a0608'); rect(ctx,sx-1,sy+2,2,6,'#5a1420');
    if(p.wake>.6){ const f=(time*.4+p.x)%1; rect(ctx,sx-3,sy-4,1,Math.round(2+f*8),'#8a0a10'); rect(ctx,sx+3,sy-4,1,Math.round(2+((f+.5)%1)*8),'#8a0a10'); addLight(p.x,p.y-6,40,.5*p.wake,1,.2,.1); } } }
(function(){ const o=drawHazards; drawHazards=function(){ o(); drawDemonPortraits(); }; })();
