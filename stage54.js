'use strict';
/* ===== v50: the world moves (BT, 17 Nov: "a moving background, stuff happening to make it feel more epic … get more
   creative with the levels and make it so the player needs to react and not just running through") =====
   What was there: one small thing in the sky every 11–18 s (a few crows, a spark), and levels where nothing happened
   unless you walked into it. A hero who held right and jumped through the Quiet Fields lost about one life bar in
   23 seconds and never had to stop.
   Now each of the first three regions has
     - a far plane that is busy all the time: the hunt riding the ridge with torches and siege fire crossing the sky
       (fields), something tall wading through the mist (fen), the towers of Kesh coming down one at a time (ashes);
     - and set pieces that come out of that far plane into the level, called by a director every 35–50 s of play
       while you are outdoors and not already in a sealed fight. Each is announced, and each asks for something:
         The Quiet Fields   The Hunt: a horn, then riders and hounds charge your stretch of road from behind.
                            Torches: the ridge throws fire down round you. Wheat and grass carry it.
         The Rushmere Fen   They come up: drowners surface in a ring round you.
                            The Hand: what is wading out there reaches in, twice.
         The Ashes of Kesh  A tower falls: masonry comes down round you for three seconds.
                            The Company: your own buried dead rise in front and behind at once.
   Foes that a set piece brings are real foes (the host's in co-op): they can be killed, burned, belled and thrown.
   Hazards hurt the hero on this machine only. STG holds the numbers; ?stage=off turns the director off. */
const STG={first:[14,20],every:[34,50],busy:5,dmg:()=>10+dep()*2.6+ngp*8,off:new URLSearchParams(location.search).get('stage')==='off'};
const STG_EV={meadow:['hunt','torches'],fen:['risen','hand'],ashes:['tower','company']};
let SD=null;
(function(){ const o=loadLevel; loadLevel=function(idx,opt){ const r=o(idx,opt); SD=null; const d=L&&L.def; if(d&&d.kind==='dungeon'&&STG_EV[d.look]){ SD={look:d.look,t:rnd(STG.first[0],STG.first[1]),last:'',n:0,clock:rnd(0,50),sky:rnd(4,9),sk:[],fall:-1,fallT:0,towers:[...Array(6)].map((_,i)=>({x:60+i*150+hsh(i,idx)*60,h:46+hsh(i*3,idx)*54,w:14+hsh(i*7,idx)*10,k:1})),wader:rnd(0,400),arm:0}; } return r; }; })();
const stFloor=(x,y)=>{ const f=findFloor(x,(y==null?P.y:y)-46); return Math.abs(f-(y==null?P.y:y))<=64?f:null; };
const stQuiet=()=>!L.arenas||!L.arenas.some(a=>a.state===1);
function stCap(t,jp,ms){ caption(t,jp); setTimeout(()=>caption(''),ms||2600); }
function stSpawn(t,x,y,fn){ if(!spHost()) return null; const e=mkEnemyAt(t,x,y); e.intro=false; e.state='chase'; e.atkCd=rnd(.4,.9); e.staged=1; if(fn) fn(e); enemies.push(e); return e; }

const STG_RUN={
  hunt(S){ const dir=P.face||1, F=stFloor(P.x); if(F==null) return false; stCap('A horn behind you. Riders.','角笛'); spHorn(1); S.ridge=3;
    const x0=P.x-dir*W*.62; teleRect(Math.min(x0,x0+dir*W),F-28,W,28,1.5); const lv=L;
    setTimeout(()=>{ if(L!==lv||mode==='title') return; let n=0; for(let i=0;i<3;i++){ const x=clamp(x0-dir*i*52,2*T,(L.w-2)*T), fy=stFloor(x,F); if(fy==null||solidPx(x,fy-20)) continue; stSpawn('rider',x,fy,e=>{ e.state='wind'; e.st=.35+i*.12; e.face=dir; e.mounted=1; }); n++; }
      for(let i=0;i<3;i++){ const x=clamp(x0+dir*(30+i*22),2*T,(L.w-2)*T), fy=stFloor(x,F); if(fy!=null&&!solidPx(x,fy-8)) stSpawn('hound',x,fy,e=>{ e.face=dir; e.vx=dir*120; }); } AU.roar(); shake(4); },1500); return true; },
  torches(S){ const F=stFloor(P.x); if(F==null) return false; stCap('Torches, from the ridge.','火が来る'); spHorn(.6); S.ridge=3; const src={dmg:STG.dmg()};
    for(let i=0;i<5;i++){ const x=P.x+(i===0?P.face*30:rnd(-150,150)), fy=stFloor(x,F); if(fy==null) continue; spTorch(x,1+i*.28,src,fy); if(L.grass) setTimeout(()=>{ if(L&&L.grass&&typeof addFlame==='function') addFlame(x,fy,src.dmg*.2,3); },(1+i*.28)*1000+60); } return true; },
  risen(S){ const F=stFloor(P.x); if(F==null) return false; stCap('The water is moving. They are coming up.','浮かぶ'); AU.noise(1.2,200,600,1,.3,'lowpass',.4); const lv=L, spots=[];
    for(const d of [-1,1,-1,1]){ const x=P.x+d*rnd(44,120), fy=stFloor(x,F); if(fy==null||solidPx(x,fy-12)) continue; spots.push([x,fy]); teleRect(x-8,fy-4,16,4,1.4); }
    if(!spots.length) return false; fx.push({t:0,dur:1.4,upd(){ for(const [x,y] of spots) if(R()<.25) part({x:x+rnd(-5,5),y:y-1,vx:0,vy:-rnd(20,50),g:-10,life:.5,col:'rgba(160,190,120,.7)'}); },draw(){}});
    setTimeout(()=>{ if(L!==lv||mode==='title') return; for(const [x,y] of spots){ stSpawn('drowner',x,y,e=>{ e.vy=-210; e.face=Math.sign(P.x-x)||1; e.atkCd=.7; }); for(let i=0;i<10;i++) part({x:x+rnd(-8,8),y:y-2,vx:rnd(-80,80),vy:rnd(-180,-60),g:500,life:.6,col:'#2a3a2a'}); } AU.noise(.4,400,1200,2,.35,'bandpass',.4); },1400); return true; },
  hand(S){ const F=stFloor(P.x); if(F==null) return false; stCap('It has seen you. It is reaching in.','手が来る',3000); AU.growl(); AU.tone('sine',46,32,2,.45,.5); S.arm=3.4; const lv=L, dmg=STG.dmg()*1.3;
    spHandSlam(P.x,F,dmg,0); setTimeout(()=>{ if(L!==lv||mode!=='play'||P.dead) return; const f2=stFloor(P.x); if(f2!=null) spHandSlam(P.x+P.vx*.5,f2,dmg,0); },1250); return true; },
  tower(S){ const F=stFloor(P.x); if(F==null) return false; stCap('Kesh is still falling.','崩れる'); AU.boom(.9); AU.tone('sine',50,28,2.2,.5,.5); shake(7); S.fall=(S.fall+1)%S.towers.length; S.towers[S.fall].k=.999; const lv=L, dmg=STG.dmg();
    for(let i=0;i<7;i++){ const x=P.x+(i===0?0:rnd(-160,160)), fy=stFloor(x,F); if(fy==null) continue; setTimeout(()=>{ if(L!==lv||mode!=='play') return; spDrop(x,1,{F:fy,w:12,h:20,dmg,shake:5,wave:14,draw:stRubble}); },i*340); } return true; },
  company(S){ const F=stFloor(P.x); if(F==null) return false; const spots=[]; for(const d of [-110,-76,76,110]){ const x=P.x+d, fy=stFloor(x,F); if(fy!=null&&!solidPx(x,fy-12)&&x>2*T&&x<(L.w-2)*T) spots.push([x,fy]); } if(spots.length<2) return false;
    stCap('Your own dead. They kept the formation.','隊列'); AU.noise(.9,300,700,2,.3,'bandpass',.3); for(const [x,y] of spots){ teleRect(x-8,y-4,16,4,.9); stSpawn('buried',x,y,e=>{ e.state='rise'; e.st=.9; e.face=Math.sign(P.x-x)||1; }); } return true; } };
const stRubble=(sx,sy,f)=>{ ctx.save(); ctx.translate(sx,sy-8); ctx.rotate(f.land?.3:f.t*5); rect(ctx,-9,-7,18,14,'#3a302a'); rect(ctx,-9,-7,18,2,'#5a4a3e'); rect(ctx,-9,0,18,1,'#241c18'); rect(ctx,-1,-7,1,7,'#241c18'); rect(ctx,4,1,1,6,'#241c18'); ctx.restore(); };

(function(){ const o=update; update=function(dt){ o(dt); const S=SD; if(!S||mode!=='play'||!L) return; S.clock+=dt; S.wader+=dt*5; if(S.arm>0) S.arm-=dt; if(S.ridge>0) S.ridge-=dt;
  for(const t of S.towers) if(t.k<1&&t.k>0){ t.k=Math.max(0,t.k-dt*.3); if(t.k<=0){ AU.boom(.25); shake(2); } }
  S.fallT-=dt; if(S.look==='ashes'&&S.fallT<=0){ S.fallT=rnd(26,40); const live=S.towers.filter(t=>t.k>=1); if(live.length>2){ pick(live).k=.999; AU.tone('sine',48,30,2,.2,.6); } }
  S.sky-=dt; if(S.look==='meadow'&&S.sky<=0){ S.sky=rnd(5,10); const d=R()<.5?1:-1; S.sk.push({t:0,dur:rnd(2.6,3.6),x0:d>0?-30:W+30,x1:d>0?rnd(W*.5,W+40):rnd(-40,W*.5),h:rnd(90,150),y0:rnd(120,160)}); AU.noise(.9,700,200,1,.07,'lowpass',.7); }
  for(const k of S.sk) k.t+=dt; S.sk=S.sk.filter(k=>k.t<k.dur+.7);
  if(STG.off||P.dead) return; S.t-=dt; if(S.t>0) return;
  if(!stQuiet()||!P.onGround||enemies.filter(e=>!e.dead&&Math.abs(e.x-P.x)<220&&Math.abs(e.y-P.y)<90).length>STG.busy||(L.finalArena&&P.x>L.finalArena.x0-3*T&&P.y>L.finalArena.y0&&P.y<L.finalArena.y1)){ S.t=3; return; }
  const list=STG_EV[S.look]; let ev=list[S.n%list.length]; if(ev===S.last) ev=list[(S.n+1)%list.length];
  if(STG_RUN[ev](S)){ S.last=ev; S.n++; S.t=rnd(STG.every[0],STG.every[1]); S.ran=(S.ran||0)+1; if(typeof MUS!=='undefined'&&MUS.sting) try{ MUS.sting(); }catch(e){} } else S.t=4; }; })();

/* ---------- the far plane ---------- */
function stBack(){ const S=SD; if(!S) return; const maxY=Math.max(1,L.h*T-H), hy=Math.round(189+20-(camR.y/maxY)*20), px=camR.x*.1;
  if(S.look==='meadow'){ const span=W+560, base=(S.clock*13)%span, hot=S.ridge>0;
    for(let i=0;i<18;i++){ const x=Math.round(((base+i*31)%span)-280+Math.sin(i*7)*4), y=hy+Math.round(Math.sin(i*3.1)*2), g=Math.sin(time*11+i)>0?1:0; if(x<-12||x>W+12) continue;
      rect(ctx,x-4,y-5,8,3,'#0b0607'); rect(ctx,x+3,y-7,3,3,'#0b0607'); rect(ctx,x-3,y-2,1,2+g,'#0b0607'); rect(ctx,x+2,y-2,1,3-g,'#0b0607'); rect(ctx,x-1,y-9,2,4,'#0b0607');
      if(i%2===0||hot){ ectx.fillStyle='#ffb050'; ectx.fillRect(x+1,y-13,1,2); ectx.fillStyle=hot?'rgba(255,150,60,.8)':'rgba(255,120,40,.5)'; ectx.fillRect(x,y-14,3,3); } }
    for(const k of S.sk){ const q=k.t/k.dur; if(q<1){ for(let i=0;i<14;i++){ const kk=Math.max(0,q-i*.014), x=lerp(k.x0,k.x1,kk), y=k.y0-k.h*4*kk*(1-kk)+kk*(hy-k.y0); if(i<3){ ectx.fillStyle=i?'rgba(255,150,60,.8)':'#ffe6b0'; ectx.fillRect(Math.round(x),Math.round(y),i?3:4,i?3:4); } else { ctx.fillStyle=`rgba(40,26,24,${(.5-i*.03).toFixed(2)})`; ctx.fillRect(Math.round(x),Math.round(y-(i-3)*.6),3,3); } } }
      else { const b=(k.t-k.dur)/.7; ectx.fillStyle=`rgba(255,160,70,${((1-b)*.7).toFixed(2)})`; ectx.beginPath(); ectx.arc(k.x1,hy,4+b*22,Math.PI,0); ectx.fill(); for(let i=0;i<5;i++){ ctx.fillStyle=`rgba(30,20,18,${((1-b)*.6).toFixed(2)})`; ctx.fillRect(Math.round(k.x1-10+i*5),Math.round(hy-8-b*30-i*3),4,4); } if(!k.b){ k.b=1; AU.boom(.12); } } } }
  else if(S.look==='fen'){ /* something tall, wading */ const span=W+300, x=Math.round(((S.wader-px*2)%span+span)%span-150), bob=Math.round(Math.sin(S.wader*.5)*2), top=-96+bob, up=clamp(S.arm>0?Math.sin(clamp((3.4-S.arm)/1.3,0,1)*Math.PI*.5):0,0,1), col='rgba(10,16,13,.82)';
    ctx.save(); ctx.translate(x,hy+8); ctx.scale(1.75,1.75); ctx.translate(-x,0); { const hy=0;
    ctx.fillStyle=col; ctx.beginPath(); ctx.moveTo(x-20,hy+26); ctx.lineTo(x-15,top+34); ctx.lineTo(x-8,top+8); ctx.lineTo(x,top); ctx.lineTo(x+8,top+8); ctx.lineTo(x+15,top+34); ctx.lineTo(x+20,hy+26); ctx.fill();
    for(let i=0;i<6;i++) ctx.fillRect(x-10+i*4,top+8,2,20+((i*11)%14)); rect(ctx,x-4,top+12,2,2,'#a9b46c'); rect(ctx,x+2,top+12,2,2,'#a9b46c');
    ctx.strokeStyle=col; ctx.lineWidth=5; for(const d of [-1,1]){ ctx.beginPath(); ctx.moveTo(x+d*13,top+32); ctx.lineTo(x+d*(22+up*8),top+62-up*(d>0?92:20)); ctx.stroke(); }
    for(let i=0;i<4;i++){ ctx.fillStyle='rgba(120,150,130,.09)'; ctx.fillRect(x-50+i*10+Math.round(Math.sin(time*.4+i)*6),hy+4+i*4,110,5); }
    } ctx.restore(); if(S.arm>0){ ectx.fillStyle='rgba(169,180,108,.6)'; ectx.fillRect(x-7,hy+8+Math.round((top+12)*1.75),3,3); ectx.fillRect(x+4,hy+8+Math.round((top+12)*1.75),3,3); } }
  else if(S.look==='ashes'){ /* what is left of the city */ for(const t of S.towers){ const x=Math.round(((t.x-px*1.6)%(W+200)+(W+200))%(W+200)-100), k=t.k>=1?1:t.k*t.k, h=Math.round(t.h*1.7*(.18+.82*k)), w=Math.round(t.w*1.5), lean=t.k<1?(1-t.k)*.5:0;
      ctx.save(); ctx.translate(x,hy+10); ctx.rotate(lean); rect(ctx,-w/2,-h,w,h,'#2a211c'); rect(ctx,-w/2,-h,1,h,'#3e322a'); if(k>=1){ for(let i=0;i<3;i++) rect(ctx,-w/2+i*Math.round(w/3)+1,-h-4,Math.max(2,Math.round(w/3)-2),4,'#2a211c'); for(let y=10;y<h-8;y+=14) rect(ctx,-1,-h+y,2,5,(hsh(t.x,y)>.6)?'#c8642a':'#0c0808'); } ctx.restore();
      if(t.k<1&&t.k>0){ for(let i=0;i<7;i++){ const r=(1-t.k)*40; ctx.fillStyle=`rgba(190,170,140,${(t.k*.35).toFixed(2)})`; ctx.beginPath(); ctx.arc(x-20+i*7+Math.sin(i*3+time)*3,hy+6-r*.4*hsh(i,2),6+r*.5*hsh(i,7),0,7); ctx.fill(); } }
      else if(k>=1&&hsh(t.x,3)>.5){ const fl=3+Math.abs(Math.sin(time*6+t.x))*5; ectx.fillStyle='rgba(255,130,50,.6)'; ectx.fillRect(x-1,Math.round(hy+10-h-4-fl),2,Math.round(fl)); } } } }
(function(){ const o=drawBGEvents; drawBGEvents=function(){ o(); try{ stBack(); }catch(err){ if(!STG.err){ STG.err=1; console.error(err); } } }; })();
