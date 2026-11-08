'use strict';
/* ===== v27 region traps: each region has its own trap, to go with the fen's hands and the pass's rockfall =====
     Quiet Fields   bear traps in the stubble (and in the grass). Snap shut, hold you a second.
     Rushmere Fen   bad water: some pools are poison, green and bubbling. Get out of them.
     Ashes of Kesh  quicksand: you slow down, sink, and your jumps get weaker. Stay too long and it hurts.
     Weeping Pass   icicles: they shake, then drop on whoever's under them.
     Last Light     caltrops scattered in front of the walls. Rolling over them doesn't hurt.
     Harvest Villages snares: a loop in the dirt that strings you up. Roll through them.
     Lower City     rotten boards: stand on them too long and they give way.
     Royal Houses   chandeliers: they come down on you, and on anything else under them.
   Placement is hashed from the map, so co-op peers get the same traps without any extra messages. */
let TR=[];
function trapGround(Lv,x,y){ return Lv.g[y]&&Lv.g[y][x]===1&&Lv.g[y-1]&&Lv.g[y-1][x]===0&&Lv.g[y-2]&&Lv.g[y-2][x]===0; }
function placeTraps(Lv){ TR=[]; const look=Lv.def.look; if(!look||Lv.def.kind==='boss') return;
  const first=Lv.rooms&&Lv.rooms[0], safe=x=>!(first&&x<first.x*RW+10&&x>=first.x*RW-2);
  const runs=[]; for(let y=3;y<Lv.h;y++){ let s=-1; for(let x=1;x<Lv.w;x++){ const ok=trapGround(Lv,x,y)&&safe(x); if(ok&&s<0) s=x; if((!ok||x===Lv.w-1)&&s>=0){ if(x-s>=3) runs.push({x0:s,x1:x,y}); s=-1; } } }
  const every=(k,fn)=>{ let last=-99; for(const r of runs){ for(let x=r.x0+1;x<r.x1-1;x++){ const h=hsh(x*7+3,r.y*11); if(x-last<k||h<.62) continue; if(fn(x,r.y,r,h)!==false) last=x; } } };
  if(look==='meadow') every(16,(x,y)=>{ TR.push({k:'bear',x:x*T+8,y:y*T,arm:1,t:0}); });
  if(look==='ashes') every(14,(x,y,r)=>{ const w=Math.min(r.x1-x,3+((x*5)%3)); if(w<3) return false; TR.push({k:'sand',x0:x*T,x1:(x+w)*T,y:y*T}); });
  if(look==='fort') every(14,(x,y,r)=>{ const w=Math.min(r.x1-x,2+((x*3)%2)); if(w<2) return false; TR.push({k:'caltrop',x0:x*T,x1:(x+w)*T,y:y*T}); });
  if(look==='villages') every(15,(x,y)=>{ TR.push({k:'snare',x:x*T+8,y:y*T,arm:1,t:0}); });
  if(look==='slums') every(16,(x,y,r)=>{ if(r.x1-x<3) return false; let deep=0; for(let d=2;d<=5;d++) if(Lv.g[y+d]&&Lv.g[y+d][x]===1&&Lv.g[y+d][x+1]===1){ deep=d; break; } if(!deep) return false;
    for(let d=1;d<deep;d++) if(Lv.g[y+d][x]!==1||Lv.g[y+d][x+1]!==1){ return false; } TR.push({k:'board',tx:x,ty:y,deep,t:0,gone:0}); });
  /* things on ceilings: icicles in the pass, chandeliers in the royal houses */
  if(look==='pass'||look==='royal'){ for(let x=4;x<Lv.w-4;x+=1){ for(let y=2;y<Lv.h-6;y++){ if(Lv.g[y][x]!==1||Lv.g[y+1][x]!==0) continue; let fy=-1; for(let d=3;d<12;d++){ if(Lv.g[y+d]&&Lv.g[y+d][x]===1){ fy=y+d; break; } if(Lv.g[y+d]&&Lv.g[y+d][x]!==0) break; }
        if(fy<0||!safe(x)) continue; const h=hsh(x*13,y*17); if(h<(look==='royal'?.6:.55)) continue; if(TR.some(t=>t.cx&&Math.abs(t.cx-x*T)<(look==='royal'?120:64))) continue;
        TR.push({k:look==='royal'?'chand':'icicle',cx:x*T+8,cy:(y+1)*T,gy:fy*T,state:0,t:0,y:(y+1)*T,vy:0}); } } }
  /* poison pools in the fen: flood the water into pools and turn about half of them */
  if(look==='fen'){ const seen=new Set(); for(let y=0;y<Lv.h;y++) for(let x=0;x<Lv.w;x++){ if(Lv.g[y][x]!==4||seen.has(y*Lv.w+x)) continue; const pool=[], st=[[x,y]]; seen.add(y*Lv.w+x);
      while(st.length){ const [cx,cy]=st.pop(); pool.push([cx,cy]); for(const [ax,ay] of [[cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]]){ if(Lv.g[ay]&&Lv.g[ay][ax]===4&&!seen.has(ay*Lv.w+ax)){ seen.add(ay*Lv.w+ax); st.push([ax,ay]); } } }
      if(hsh(x*31,y*7)>.45&&safe(x)) TR.push({k:'bile',tiles:pool,set:new Set(pool.map(([a,b])=>b*Lv.w+a))}); } } }
(function(){ const o=loadLevel; loadLevel=function(idx,opt){ const r=o(idx,opt); if(L) placeTraps(L); P.rootT=0; P.sink=0; P.bileT=0; return r; }; })();

function trapHurt(d,x){ hurtPlayer(Math.round(d),{x,hp:0,dead:true}); }
function updTraps(dt){ if(!L||mode!=='play'||!TR.length) return; const me=P, alive=!me.dead, ground=me.onGround;
  let inSand=false;
  for(const t of TR){
    if(t.k==='bear'||t.k==='snare'){ if(!t.arm){ t.t-=dt; if(t.t<=0) t.arm=1; continue; }
      if(alive&&ground&&Math.abs(me.x-t.x)<6&&Math.abs(me.y-t.y)<6&&!(t.k==='snare'&&me.dash>0)){ t.arm=0; t.t=8; t.held=1.1;
        if(t.k==='bear'){ me.rootT=1; trapHurt(8+diff()*2,t.x); AU.clang(); shake(4); bleed(me.x,me.y-4,8); toast('A bear trap, in the stubble.'); }
        else { me.rootT=1.3; me.hoist=1.3; trapHurt(4+diff(),t.x); AU.noise&&AU.noise(.25,900,300,2,.3,'bandpass',.2); toast('A snare. Roll through the next one.'); } }
      if(t.held>0) t.held-=dt; }
    else if(t.k==='sand'){ if(alive&&ground&&me.x>t.x0+2&&me.x<t.x1-2&&Math.abs(me.y-t.y)<6) inSand=true; }
    else if(t.k==='caltrop'){ if(alive&&ground&&me.dash<=0&&me.x>t.x0&&me.x<t.x1&&Math.abs(me.y-t.y)<6){ me.vx*=.8; if(!(me.calT>time)){ me.calT=time+.7; trapHurt(3+diff()*.8,me.x); } } }
    else if(t.k==='board'){ if(t.gone>0){ t.gone-=dt; if(t.gone<=0){ const ok=!(Math.abs(me.x-(t.tx+1)*T)<20&&me.y>t.ty*T&&me.y<(t.ty+t.deep)*T+4); if(ok){ L.g[t.ty][t.tx]=1; L.g[t.ty][t.tx+1]=1; } else t.gone=.5; } continue; }
      const on=alive&&ground&&me.x>t.tx*T-2&&me.x<(t.tx+2)*T+2&&Math.abs(me.y-t.ty*T)<4; t.t=on?t.t+dt:Math.max(0,t.t-dt*.5);
      if(on&&t.t>.15&&!t.creak){ t.creak=1; AU.noise&&AU.noise(.3,300,120,2,.25,'lowpass',.2); }
      if(t.t>.55){ t.gone=6; t.t=0; t.creak=0; L.g[t.ty][t.tx]=0; L.g[t.ty][t.tx+1]=0; dust((t.tx+1)*T,t.ty*T,10); AU.slam(); for(let i=0;i<6;i++) part({x:(t.tx+rnd(0,2))*T,y:t.ty*T,vx:rnd(-40,40),vy:rnd(-60,0),g:600,life:.8,col:'#5a4636'}); } }
    else if(t.k==='icicle'||t.k==='chand'){ if(t.state===0){ if(alive&&Math.abs(me.x-t.cx)<(t.k==='chand'?22:16)&&me.y>t.cy&&me.y<=t.gy+4){ t.state=1; t.t=t.k==='chand'?.6:.45; AU.noise&&AU.noise(.3,t.k==='chand'?700:2400,400,2,.2,'bandpass',.3); } }
      else if(t.state===1){ t.t-=dt; if(t.t<=0){ t.state=2; t.vy=0; } }
      else if(t.state===2){ t.vy+=1100*dt; t.y+=t.vy*dt; const hw=t.k==='chand'?18:6;
        if(!t.hit&&alive&&Math.abs(me.x-t.cx)<hw&&t.y>me.y-me.h&&t.y<me.y+2){ t.hit=1; trapHurt(t.k==='chand'?14+diff()*3:10+diff()*2,t.cx); }
        if(t.k==='chand') for(const e of enemies){ if(!e.dead&&!e.boss&&!(e.chandHit===t)&&Math.abs(e.x-t.cx)<hw&&t.y>e.y-e.h&&t.y<e.y+2){ e.chandHit=t; dmgEnemy(e,Math.round(e.maxhp*.6),false,1,60,true); } }
        if(t.y>=t.gy){ t.y=t.gy; t.state=3; t.t=t.k==='chand'?999:10; AU.slam(); shake(t.k==='chand'?5:2); for(let i=0;i<(t.k==='chand'?14:8);i++) part({x:t.cx+rnd(-hw,hw),y:t.gy-2,vx:rnd(-90,90),vy:rnd(-160,-40),g:700,life:.7,col:t.k==='chand'?pick(['#b8913a','#e8d4a0','#3a2a14']):'#d8e4ec'}); } }
      else if(t.state===3&&t.k==='icicle'){ t.t-=dt; if(t.t<=0){ t.state=0; t.y=t.cy; t.hit=0; } } }
    else if(t.k==='bile'){ if(alive){ const tx=Math.floor(me.x/T), ty=Math.floor((me.y-4)/T); if(t.set.has(ty*L.w+tx)){ if(!(me.bileT>0)&&!t.told){ t.told=1; toast('The water has gone bad. Get out of it.'); } me.bileT=2; } } } }
  /* quicksand: slow, sink, weaker jumps, then it hurts */
  if(inSand){ me.sink=Math.min(1,(me.sink||0)+dt*.42); me.vx=clamp(me.vx,-70*(1-me.sink*.5),70*(1-me.sink*.5)); if(me.sink>.85&&!(me.sandT>time)){ me.sandT=time+.6; trapHurt(4+diff(),me.x); }
    if(R()<.3) part({x:me.x+rnd(-6,6),y:me.y-1,vx:rnd(-10,10),vy:rnd(-20,-5),g:80,life:.5,col:'#c8b88a'}); }
  else me.sink=Math.max(0,(me.sink||0)-dt*(ground?1.2:3));
  if(me.sink>0&&me.vy<-120&&!me.sandJ){ me.vy*=1-.65*me.sink; me.sandJ=1; } if(ground) me.sandJ=0;
  /* bad water */
  if(me.bileT>0){ me.bileT-=dt; if(!(me.bileHit>time)&&alive){ me.bileHit=time+.5; trapHurt(2+diff()*.5,me.x); } if(R()<.4) part({x:me.x+rnd(-6,6),y:me.y-rnd(4,20),vx:rnd(-8,8),vy:rnd(-30,-10),g:-10,life:.6,col:'#9ac040'}); }
  /* held by a trap */
  if(me.rootT>0){ me.rootT-=dt; me.vx=0; if(me.vy<0) me.vy=0; if(me.hoist>0) me.hoist-=dt; } }
(function(){ const o=update; update=function(dt){ o(dt); updTraps(dt); }; })();

function drawTraps(){ if(!L||!TR.length) return;
  for(const t of TR){
    if(t.k==='bear'){ const sx=Math.round(t.x-camR.x), sy=Math.round(t.y-camR.y); if(sx<-20||sx>W+20) continue; rect(ctx,sx-6,sy-1,12,1,'#3a3430');
      if(t.arm){ for(let i=-5;i<=5;i+=2){ rect(ctx,sx+i,sy-3,1,2,'#8a8478'); } rect(ctx,sx-1,sy-2,2,1,'#5a5048'); }
      else { rect(ctx,sx-3,sy-6,6,5,'#5a5048'); for(let i=-2;i<=2;i+=2) rect(ctx,sx+i,sy-7,1,2,'#8a8478'); if(t.held>0) rect(ctx,sx-1,sy-3,2,2,'#8a1a14'); } }
    else if(t.k==='snare'){ const sx=Math.round(t.x-camR.x), sy=Math.round(t.y-camR.y); if(sx<-20||sx>W+20) continue;
      if(t.arm){ ctx.strokeStyle='#6a5a3a'; ctx.lineWidth=1; ctx.beginPath(); ctx.ellipse(sx,sy-1,6,1.5,0,0,7); ctx.stroke(); rect(ctx,sx+6,sy-4,1,4,'#3a2a1c'); }
      else if(t.held>0){ rect(ctx,sx,sy-160,1,140,'#6a5a3a'); } }
    else if(t.k==='sand'){ const sx=t.x0-camR.x, w=t.x1-t.x0, sy=t.y-camR.y; if(sx>W||sx+w<0) continue; rect(ctx,Math.round(sx),Math.round(sy-2),w,4,'#b8a676');
      for(let x=0;x<w;x+=3){ const k=Math.sin(time*2+x*.4+t.x0); rect(ctx,Math.round(sx+x),Math.round(sy-2+(k>.3?1:0)),2,1,k>0?'#d8c898':'#9a8a5e'); }
      const cx=sx+w/2+Math.sin(time*.7+t.x0)*w*.3; rect(ctx,Math.round(cx-2),Math.round(sy-1),4,1,'#7a6a46'); }
    else if(t.k==='caltrop'){ const sx=t.x0-camR.x, w=t.x1-t.x0, sy=t.y-camR.y; if(sx>W||sx+w<0) continue; for(let x=2;x<w;x+=4){ rect(ctx,Math.round(sx+x),Math.round(sy-2),1,2,'#6a6e78'); rect(ctx,Math.round(sx+x-1),Math.round(sy-1),3,1,'#4a4e58'); } }
    else if(t.k==='board'){ if(t.gone>0) continue; const sx=t.tx*T-camR.x, sy=t.ty*T-camR.y; if(sx>W||sx+32<0) continue; const j=t.t>.15?Math.round(Math.sin(time*40)):0;
      rect(ctx,Math.round(sx),Math.round(sy+j),32,4,'#6a5236'); rect(ctx,Math.round(sx),Math.round(sy+j),32,1,'#8a7050'); rect(ctx,Math.round(sx+10),Math.round(sy+j),1,4,'#2a1e14'); rect(ctx,Math.round(sx+21),Math.round(sy+j),1,4,'#2a1e14'); rect(ctx,Math.round(sx+14),Math.round(sy+1+j),5,1,'#1a120c'); }
    else if(t.k==='icicle'){ if(t.state===3) continue; const sx=Math.round(t.cx-camR.x+(t.state===1?Math.sin(time*60):0)), sy=Math.round(t.y-camR.y); if(sx<-20||sx>W+20) continue;
      ctx.fillStyle='#d8e4ec'; ctx.beginPath(); ctx.moveTo(sx-4,sy); ctx.lineTo(sx+4,sy); ctx.lineTo(sx,sy+16); ctx.fill(); rect(ctx,sx-1,sy,1,10,'#ffffff'); ctx.fillStyle='#a8bcc8'; ctx.beginPath(); ctx.moveTo(sx+5,sy); ctx.lineTo(sx+9,sy); ctx.lineTo(sx+7,sy+7); ctx.fill(); }
    else if(t.k==='chand'){ const sx=Math.round(t.cx-camR.x+(t.state===1?Math.sin(time*30)*2:Math.sin(time*.8+t.cx)*1)), sy=Math.round(t.y-camR.y); if(sx<-40||sx>W+40) continue;
      if(t.state<2){ rect(ctx,Math.round(t.cx-camR.x),Math.round(t.cy-camR.y),1,Math.max(0,sy-Math.round(t.cy-camR.y)+8),'#2a1a10'); }
      const yy=t.state<2?sy+8:sy-6; rect(ctx,sx-16,yy,32,3,'#b8913a'); rect(ctx,sx-16,yy+3,32,1,'#6e5420'); rect(ctx,sx-2,yy-6,4,6,'#b8913a'); for(let i=-14;i<=14;i+=7){ rect(ctx,sx+i,yy-4,2,4,'#e8d4a0'); if(t.state<3){ const fl=Math.sin(time*13+i)*.5+.5; ectx.fillStyle='rgba(255,170,70,.85)'; ectx.fillRect(sx+i,yy-6-Math.round(fl),2,2); } }
      if(t.state<3) addLight(t.cx,t.y+8,90,.9,1,.7,.4); }
    else if(t.k==='bile'){ for(const [tx,ty] of t.tiles){ const sx=tx*T-camR.x, sy=ty*T-camR.y; if(sx<-16||sx>W||sy<-16||sy>H) continue; ctx.fillStyle='rgba(110,150,30,.38)'; ctx.fillRect(Math.round(sx),Math.round(sy),T,T);
        if(L.g[ty-1]&&L.g[ty-1][tx]!==4){ rect(ctx,Math.round(sx),Math.round(sy),T,1,'#9ac040'); const b=(time*.7+tx*.37)%1; if(b<.3) rect(ctx,Math.round(sx+((tx*7)%12)+2),Math.round(sy-1-b*6),2,2,'#b8d860'); ectx.fillStyle='rgba(150,200,60,.12)'; ectx.fillRect(Math.round(sx),Math.round(sy-2),T,3); } } } } }
(function(){ const o=drawHazards; drawHazards=function(){ o(); drawTraps(); }; })();
/* sinking: the sand covers your legs */
(function(){ const o=render; render=function(){ o(); if(!L||!P||!(P.sink>0)) return; const sx=Math.round(P.x-camR.x), sy=Math.round(P.y-camR.y), h=Math.round(P.sink*14);
  rect(ctx,sx-9,sy-h,18,h+1,'#b8a676'); rect(ctx,sx-9,sy-h,18,1,'#d8c898'); }; })();
/* strung up by a snare: hauled off your feet for a moment */
(function(){ const o=drawHero; if(typeof o!=='function') return; drawHero=function(c){ if(P.hoist>0){ const k=Math.min(1,(1.3-P.hoist)*6)*Math.min(1,P.hoist*4); c.save(); c.translate(0,-Math.round(k*14)); try{ return o(c); } finally{ c.restore(); } } return o(c); }; })();
