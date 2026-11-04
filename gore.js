'use strict';
/* ===== gore: how things die depends on what killed them.
   Swords and katanas cut in half. Axes, cleavers, scythes and sickles take the head.
   Maces, hammers, flails and shield bashes crush the body to pieces. Spears and crossbow bolts
   impale and pin the corpse to the wall. Daggers and rapiers pierce: the body folds round a jet of blood.
   Bare fists send it flying. Damage types have their own deaths: fire burns to ash, cold shatters,
   lightning cooks the skeleton, water drowns, poison melts, holy lifts the body away in light,
   shadow and blood burst it, wind throws it off the screen, bone splinters it.
   Every piece is the enemy's own sprite drawn through a clip polygon with its own spin, gravity and blood. ===== */
let gibs=[];
const NO_CHOP=new Set(['bloat','swarm','anchor','relicx']);
const W_DEATH={sword:'halves',katana:'halves',axe:'decap',cleaver:'decap',scythe:'decap',sickle:'decap',mace:'crush',hammer:'crush',flail:'crush',shield:'crush',
  spear:'impale',xbow:'pin',dagger:'pierce',rapier:'pierce',fist:'punch',lance:'husk'};
const E_DEATH={fire:'ash',cold:'shatter',shock:'electro',water:'drown',poison:'melt',holy:'ascend',shadow:'blast',blood:'husk',wind:'gust',bone:'bones'};
const DEATH_NAMES={halves:'Cut in half',decap:'Beheaded',crush:'Crushed',impale:'Impaled',pin:'Pinned',pierce:'Run through',punch:'Beaten',ash:'Burned to ash',shatter:'Shattered',electro:'Cooked',drown:'Drowned',melt:'Melted',ascend:'Taken by the light',blast:'Burst',husk:'Bled dry',gust:'Thrown',bones:'Splintered'};
function deathStyle(e){ const h=e.lastHit&&time-e.lastHit.t<2?e.lastHit:{cls:wcls('main')};
  if(h.el&&E_DEATH[h.el]&&(h.dot||h.combo||R()<.6)) return E_DEATH[h.el];
  let st=W_DEATH[h.cls||'fist']||'halves'; const w=P&&P.equip.weapon;
  if(st==='decap'&&h.cls==='scythe'&&R()<.5) st='halves';
  if(st==='impale'&&w&&w.base.name==='Halberd'&&R()<.5) st='decap';
  return st; }

/* ---------- pieces ---------- */
const ESCALE=e=>e.unique?1.15:e.small?.8:1;
function piece(e,o){ const s=ESCALE(e), F=e.face; const g=Object.assign({e,s,face:F,poly:null,px:0,py:0,vx:0,vy:0,vr:0,rot:0,t:0,life:4.2,grav:820,off:4,tint:null,sx:1,sy:1,alpha:1,rest:false},o);
  g.x=e.x+F*g.px*s; g.y=e.y+g.py*s; gibs.push(g); if(gibs.length>90) gibs.splice(0,gibs.length-90); return g; }
const box=e=>[[-e.w*.9,-e.h*1.25],[e.w*.9,-e.h*1.25],[e.w*.9,4],[-e.w*.9,4]];
function halfPolys(cy,th,B){ const dx=Math.cos(th), dy=Math.sin(th); return [-1,1].map(side=>{ const nx=-dy*side, ny=dx*side; return {side,ny,poly:[[-dx*B,cy-dy*B],[dx*B,cy+dy*B],[dx*B+nx*B,cy+dy*B+ny*B],[-dx*B+nx*B,cy-dy*B+ny*B]]}; }); }
function cutFlash(e,cy,th){ const s=ESCALE(e), F=e.face, wx=e.x, wy=e.y+cy*s, ca=F>0?th:Math.PI-th;
  fx.push({t:0,dur:.35,draw(f){ const k=1-f.t/f.dur; ectx.save(); ectx.translate(wx-camR.x,wy-camR.y); ectx.rotate(ca); ectx.fillStyle=`rgba(255,246,236,${(k*.55).toFixed(2)})`; ectx.fillRect(-20-f.t*30,-.5,40+f.t*60,1); ectx.restore(); }}); return [wx,wy,ca]; }
function sheet(x,y,ca,n,dir,w){ for(let i=0;i<n;i++){ const al=rnd(-w,w); const a=ca+Math.PI/2*(R()<.5?1:-1)+rnd(-.5,.5), sp=rnd(60,220); part({type:'blood',x:x+Math.cos(ca)*al,y:y+Math.sin(ca)*al,vx:Math.cos(a)*sp+dir*40,vy:Math.sin(a)*sp-60,g:520,life:rnd(.5,1.2),col:pick(BLOOD),size:R()<.3?2:1}); } }
function chunks(x,y,n,dir,cols){ for(let i=0;i<n;i++) part({type:'blood',x,y,vx:dir*rnd(-40,180),vy:-rnd(80,240),g:620,life:rnd(.8,1.4),col:pick(cols||['#4a0608','#6e0e10','#8a2a20']),size:2}); }
function grid(e,cols,rows,o){ const W_=e.w*1.8, H_=e.h*1.3, x0=-e.w*.9, y0=-e.h*1.25; const out=[];
  for(let i=0;i<cols;i++) for(let j=0;j<rows;j++){ const a=x0+W_*i/cols, b=y0+H_*j/rows, c=x0+W_*(i+1)/cols, d=y0+H_*(j+1)/rows; const cx=(a+c)/2, cy=Math.min(-1,(b+d)/2);
    const ang=Math.atan2(cy+e.h*.5,cx)+rnd(-.4,.4), sp=rnd(o.sp[0],o.sp[1]);
    out.push(piece(e,Object.assign({poly:[[a,b],[c,b],[c,d],[a,d]],px:cx,py:cy,vx:Math.cos(ang)*sp*e.face+o.dir*o.push,vy:Math.sin(ang)*sp-o.lift,vr:rnd(-12,12),off:2,life:o.life||3},o.extra||{}))); }
  return out; }

/* ---------- each way to die ---------- */
const DEATHS={
  halves(e,dir,crit){ const vertical=(crit||e.lastHit&&e.lastHit.heavy)&&R()<.45; const h=e.h, cy=vertical?-h*.5:-h*rnd(.42,.6), th=vertical?Math.PI/2+rnd(-.18,.18):rnd(-.45,.45);
    for(const p of halfPolys(cy,th,120)){ const up=p.ny<0; let vx,vy,vr; const nx=-Math.sin(th)*p.side;
      if(vertical){ vx=nx*e.face*rnd(40,90)+dir*20; vy=-rnd(60,140); vr=nx*e.face*rnd(2,4); } else if(up){ vx=dir*rnd(70,150); vy=-rnd(140,240); vr=dir*rnd(4,10); } else { vx=dir*rnd(5,25); vy=-20; vr=-dir*rnd(1.5,3); }
      piece(e,{poly:p.poly,px:0,py:cy,vx,vy,vr,stump:!up||vertical,slump:!up&&!vertical,off:up&&!vertical?4:Math.abs(cy*ESCALE(e)),seam:th}); }
    const [x,y,ca]=cutFlash(e,cy,th); sheet(x,y,ca,26,dir,e.w*.7); chunks(x,y,ri(3,6),dir); },
  decap(e,dir){ const h=e.h, cy=-h*rnd(.74,.8), th=rnd(-.25,.25); const [up,low]=halfPolys(cy,th,120).sort((a,b)=>a.ny-b.ny);
    piece(e,{poly:up.poly,px:0,py:cy,vx:dir*rnd(60,140),vy:-rnd(240,320),vr:dir*rnd(10,18),off:3,seam:th});
    piece(e,{poly:low.poly,px:0,py:cy,vx:dir*10,vy:-10,vr:-dir*rnd(.6,1.4),stump:true,neck:true,slump:true,off:Math.abs(cy*ESCALE(e)),seam:th,life:5});
    const [x,y,ca]=cutFlash(e,cy,th); sheet(x,y,ca,14,dir,e.w*.4); AU.tone('sine',300,90,.15,.15,.2); },
  crush(e,dir){ grid(e,3,4,{dir,push:90,lift:120,sp:[80,260]}); const [cx,cy]=[e.x,e.y-e.h/2]; for(let i=0;i<50;i++){ const a=R()*Math.PI*2, sp=rnd(60,280); part({type:'blood',x:cx,y:cy,vx:Math.cos(a)*sp+dir*50,vy:Math.sin(a)*sp-80,g:560,life:rnd(.5,1.2),col:pick(BLOOD),size:R()<.4?2:1}); }
    chunks(cx,cy,8,dir); shake(4); AU.boom(.5); for(let i=0;i<12;i++){ const gx=e.x+rnd(-14,14), ty=Math.floor((e.y+1)/T); if(tileAt(Math.floor(gx/T),ty)===1) decal(gx,ty*T,pick(BLOOD),ri(1,3)); } },
  impale(e,dir){ piece(e,{poly:box(e),px:0,py:-e.h*.5,vx:dir*rnd(300,380),vy:-rnd(60,110),vr:dir*rnd(.5,1.5),stick:true,jet:{a:Math.PI,dur:1.4},spike:true,off:e.h*.5}); },
  pin(e,dir){ piece(e,{poly:box(e),px:0,py:-e.h*.5,vx:dir*rnd(380,460),vy:-rnd(20,60),vr:dir*rnd(.2,.8),stick:true,grav:300,jet:{a:Math.PI,dur:1},bolt:true,off:e.h*.5}); },
  pierce(e,dir){ piece(e,{poly:box(e),px:0,py:0,vx:dir*rnd(10,40),vy:-30,vr:-dir*rnd(2,3),slump:true,off:0,jet:{a:Math.PI*.15,dur:1.3,at:-e.h*.55},life:4.5}); bleed(e.x,e.y-e.h*.55,18,dir,1.6); },
  punch(e,dir){ piece(e,{poly:box(e),px:0,py:-e.h*.5,vx:dir*rnd(260,340),vy:-rnd(160,230),vr:dir*rnd(8,14),off:e.h*.4,bounce:.45}); },
  ash(e,dir){ piece(e,{poly:box(e),px:0,py:0,grav:0,vx:0,vy:0,off:0,tint:'rgba(20,10,8,X)',tintRamp:.7,crumble:1.4,life:1.6,ember:true}); AU.noise(.8,600,2400,.8,.25,'bandpass',.4); },
  electro(e,dir){ piece(e,{poly:box(e),px:0,py:0,grav:0,vx:0,vy:0,off:0,flicker:.55,crumble:1.4,crumbleDelay:.55,life:2.1,ember:true}); for(let i=0;i<4;i++) zap(e.x,e.y-e.h-30,e.x+rnd(-6,6),e.y-e.h*rnd(.2,.9),null,1); AU.tone('square',3000,400,.3,.08,.4); },
  shatter(e,dir){ grid(e,3,3,{dir,push:60,lift:90,sp:[90,240],life:1.4,extra:{tint:'rgba(170,220,255,.65)',grav:520,fade:.6}}); burst(e.x,e.y-e.h/2,26,'#e0f4ff',220,200); AU.tone('triangle',3200,1400,.2,.08,.6); AU.noise(.25,8000,3000,2,.2,'highpass',.3); },
  drown(e,dir){ piece(e,{poly:box(e),px:0,py:0,grav:0,vx:0,vy:0,off:0,tint:'rgba(60,120,200,.45)',melt:1.3,life:1.5,puddle:'rgba(40,80,140,.6)'}); for(let i=0;i<20;i++) part({x:e.x+rnd(-6,6),y:e.y-rnd(0,e.h),vx:rnd(-80,80),vy:-rnd(40,160),g:500,life:rnd(.4,.8),em:true,col:pick(['#4aa8ff','#a8d8ff'])}); AU.noise(.5,1200,300,1,.3,'lowpass',.3); },
  melt(e,dir){ piece(e,{poly:box(e),px:0,py:0,grav:0,vx:0,vy:0,off:0,tint:'rgba(110,190,40,X)',tintRamp:.7,melt:1.6,life:1.8,puddle:'rgba(70,110,20,.7)',bubbles:'#8fe050'}); AU.noise(1,400,150,2,.25,'bandpass',.3); },
  ascend(e,dir){ piece(e,{poly:box(e),px:0,py:0,grav:0,vx:0,vy:-30,off:-99,tint:'rgba(255,240,200,X)',tintRamp:.9,fade:1.8,life:1.9,motes:'#ffe6a8',float:true});
    fx.push({t:0,dur:1.6,draw(f){ const k=1-f.t/f.dur; ectx.fillStyle=`rgba(255,236,190,${(.35*k).toFixed(2)})`; ectx.fillRect(e.x-camR.x-7,0,14,e.y-camR.y); addLight(e.x,e.y-20,70,.9*k,1,.9,.6); }}); AU.tone('sine',880,1320,1.2,.06,.8); },
  blast(e,dir){ DEATHS.crush(e,dir); const x=e.x, y=e.y-e.h/2; for(let i=0;i<40;i++){ const a=R()*Math.PI*2, sp=rnd(100,320); part({type:'blood',x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-60,g:480,life:rnd(.6,1.3),col:pick(BLOOD),size:2}); }
    fx.push({t:0,dur:.4,draw(f){ const k=1-f.t/f.dur; ectx.strokeStyle=`rgba(120,40,200,${k.toFixed(2)})`; ectx.lineWidth=2; ectx.beginPath(); ectx.arc(x-camR.x,y-camR.y,50*(f.t/f.dur),0,Math.PI*2); ectx.stroke(); }}); },
  husk(e,dir){ piece(e,{poly:box(e),px:0,py:0,vx:dir*15,vy:-20,vr:-dir*rnd(2,3),slump:true,off:0,tint:'rgba(70,6,8,X)',tintRamp:.75,shrink:.8,life:4.5,jet:{a:-Math.PI/2,dur:1.6,at:-e.h*.6,many:1}}); bleed(e.x,e.y-e.h*.5,30,dir,2); },
  gust(e,dir){ piece(e,{poly:box(e),px:0,py:-e.h*.5,vx:dir*rnd(520,640),vy:-rnd(260,340),vr:dir*rnd(14,22),off:e.h*.4,grav:500,life:2.5}); for(let i=0;i<10;i++) part({type:'dust',x:e.x,y:e.y-rnd(0,e.h),vx:dir*rnd(200,400),vy:rnd(-30,30),g:0,life:.4,col:'rgba(220,240,230,.6)',size:1}); },
  bones(e,dir){ grid(e,3,4,{dir,push:50,lift:100,sp:[70,220],extra:{tint:'rgba(226,214,184,.75)'}}); for(let i=0;i<10;i++) part({x:e.x,y:e.y-e.h/2,vx:rnd(-160,160),vy:-rnd(60,220),g:600,life:rnd(.6,1.1),col:'#e2d6b8',size:2}); AU.noise(.2,3000,800,2,.25,'bandpass',.2); }
};
function killStyle(e,dir,crit){ if(e.boss||NO_CHOP.has(e.type)||e.exploded) return false; const st=deathStyle(e); e.chopped=true; e.deathStyle=st; (DEATHS[st]||DEATHS.halves)(e,dir||1,crit);
  if(st==='halves'||st==='decap'||st==='crush'||st==='blast'){ AU.gore&&AU.gore(); freeze=Math.max(freeze,crit?.11:.07); } return true; }

/* ---------- physics ---------- */
function updGibs(dt){ for(const g of gibs){ g.t+=dt; const e=g.e;
    if(g.tintRamp) g.tk=Math.min(1,g.t/g.tintRamp);
    if(g.melt) g.sy=Math.max(0,1-g.t/g.melt);
    if(g.shrink) g.sx=1-Math.min(1-g.shrink,g.t*.3);
    if(g.crumble&&g.t>(g.crumbleDelay||0)){ const k=Math.min(1,(g.t-(g.crumbleDelay||0))/g.crumble); g.clipTop=-e.h*1.3+(e.h*1.3+4)*k; if(R()<.9){ const ly=g.y+g.clipTop*g.s; ash(e.x+rnd(-e.w/2,e.w/2),ly,1); if(g.ember&&R()<.6) part({x:e.x+rnd(-e.w/2,e.w/2),y:ly,vx:rnd(-20,20),vy:-rnd(30,70),g:-20,life:rnd(.3,.7),em:true,col:pick(['#ff7a2a','#ffcf7a'])}); } }
    if(g.fade) g.alpha=Math.max(0,1-g.t/g.fade);
    if(g.motes&&R()<.6) part({x:g.x+rnd(-e.w/2,e.w/2),y:g.y-rnd(0,e.h),vx:0,vy:-rnd(20,60),g:-20,life:.7,em:true,col:g.motes});
    if(g.bubbles&&R()<.4) part({x:g.x+rnd(-e.w/2,e.w/2),y:g.y-rnd(0,e.h*g.sy),vx:0,vy:-rnd(10,30),g:0,life:.4,em:true,col:g.bubbles});
    if(g.puddle&&!g.pud&&g.t>.3){ g.pud=1; LVc.fillStyle=g.puddle; const ty=findFloor(g.x,g.y-4); for(let i=-e.w;i<=e.w;i++) LVc.fillRect(Math.round(g.x+i),ty-1,1,Math.abs(i)<e.w*.6?2:1); }
    if(g.jet&&g.t<g.jet.dur){ const pulse=.5+.5*Math.sin(g.t*20); const a=g.jet.a+g.rot*g.face, py=g.y+(g.jet.at||0)*Math.cos(g.rot); for(let i=0;i<(g.jet.many?3:1);i++) if(R()<.85) part({type:'blood',x:g.x+(g.jet.at?Math.sin(g.rot*g.face)*-g.jet.at:0),y:py,vx:Math.cos(a)*g.face*rnd(60,160)*pulse+rnd(-20,20),vy:Math.sin(a)*rnd(60,160)*pulse-rnd(20,80),g:520,life:rnd(.4,.9),col:pick(BLOOD)}); }
    if(g.rest||g.float){ if(g.float){ g.y+=g.vy*dt; } continue; }
    g.vy+=g.grav*dt; const nx=g.x+g.vx*dt;
    if(solidPx(nx,g.y-2)){ if(g.stick){ g.rest=true; g.x=nx-Math.sign(g.vx)*3; g.vx=g.vy=g.vr=0; g.stuck=true; g.jet={a:Math.PI/2,dur:g.t+1.5}; shake(2); AU.slam&&AU.tone('sine',90,40,.2,.25,.2); for(let i=0;i<8;i++) decal(g.x+rnd(-3,3),g.y+rnd(-6,6),pick(BLOOD),1); continue; } g.vx*=-(g.bounce||.3); } else g.x=nx;
    g.y+=g.vy*dt; g.rot+=g.vr*dt;
    if(g.slump&&Math.abs(g.rot)>1.45){ g.rot=Math.sign(g.rot)*1.45; g.vr=0; }
    const foot=g.y+g.off*Math.max(.25,Math.abs(Math.cos(g.rot)));
    if(g.vy>0&&(solidPx(g.x,foot)||tileAt(Math.floor(g.x/T),Math.floor(foot/T))===2)){ const ty=Math.floor(foot/T)*T; g.y-=foot-ty; if(g.vy>90){ g.vy=-g.vy*(g.bounce||.28); g.vx*=.55; g.vr*=.45; bleed(g.x,g.y,4,Math.sign(g.vx)||1,.5); } else { g.vy=0; g.vx=0; if(!g.slump||Math.abs(g.rot)>=1.4||g.vr===0) { g.vr=0; g.rest=true; } } }
    if(g.y>L.h*T+60) g.life=0;
    if(g.stump&&g.t<(g.neck?1.8:1.3)&&R()<.8){ const pulse=.5+.5*Math.sin(g.t*22); const a=g.rot-Math.PI/2; for(let i=0;i<(g.neck?3:2);i++) part({type:'blood',x:g.x,y:g.y,vx:Math.cos(a)*40*pulse+rnd(-25,25),vy:-rnd(80,g.neck?260:190)*pulse,g:520,life:rnd(.4,.9),col:pick(BLOOD),size:1}); }
    else if(!g.stump&&g.seam!=null&&g.t<1.1&&R()<.45) part({type:'blood',x:g.x,y:g.y,vx:rnd(-20,20),vy:rnd(-20,30),g:520,life:rnd(.4,.9),col:pick(BLOOD),size:1}); }
  gibs=gibs.filter(g=>g.t<g.life); }
function drawGibs(){ for(const g of gibs){ const e=g.e, fn=EDRAW[e.type]; if(!fn) continue; if(g.x-camR.x<-90||g.x-camR.x>W+90||g.y-camR.y<-90||g.y-camR.y>H+90) continue;
    const alpha=clamp((g.life-g.t)/.8,0,1)*g.alpha; if(alpha<=0) continue;
    const flick=g.flicker&&g.t<g.flicker; const tint=flick?`rgba(200,220,255,${(.3+.2*Math.sin(g.t*12)).toFixed(2)})`:g.tint?g.tint.replace('X',(g.tk||0).toFixed(2)):null;
    blit(c=>{ c.rotate(g.rot*g.face); c.scale(g.s*g.sx,g.s*g.sy); c.translate(-g.px,-g.py);
      if(g.poly){ c.beginPath(); g.poly.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])); c.closePath(); c.clip(); }
      if(g.clipTop!=null){ c.beginPath(); c.rect(-80,g.clipTop,160,200); c.clip(); }
            fn(c,e);
      if(tint){ c.globalCompositeOperation='source-atop'; c.fillStyle=tint; c.fillRect(-80,-140,160,160); c.globalCompositeOperation='source-over'; }
      if(g.seam!=null){ c.fillStyle='#5a0608'; c.save(); c.translate(0,g.py); c.rotate(g.seam); c.fillRect(-e.w*.7,-.6,e.w*1.4,1.2); c.fillStyle='#b8a890'; c.fillRect(-1,-.6,2,1.2); c.restore(); }
      if(g.spike){ c.fillStyle='#4a3020'; c.fillRect(-e.w*1.2,-e.h*.5,e.w*2.4,2); c.fillStyle='#8a8a90'; c.fillRect(e.w*1.2,-e.h*.5-1,4,4); }
      if(g.bolt){ c.fillStyle='#6a4a30'; c.fillRect(-2,-e.h*.55,10,1); c.fillStyle='#c9c2b2'; c.fillRect(-4,-e.h*.55-1,2,3); }
    },g.x,g.y,g.face,{alpha,noOutline:!!(g.melt||g.crumble)&&g.t>.3}); } }

/* ---------- hooks ---------- */
(function(){ const o=killEnemy; killEnemy=function(e,dir,crit){ const was=e.dead; o(e,dir,crit); if(!was&&e.dead&&!e.boss&&!e.chopped) killStyle(e,dir||1,crit); }; })();
(function(){ const o=drawEnemies; drawEnemies=function(){ const hid=[]; for(const e of enemies) if(e.chopped&&!e.boss){ hid.push([e,e.deadT]); e.deadT=99; } o(); for(const [e,t] of hid) e.deadT=t; drawGibs(); }; })();
(function(){ const o=updParts; updParts=function(dt){ o(dt); if(mode==='play') updGibs(dt); }; })();
(function(){ const o=loadLevel; loadLevel=function(){ gibs=[]; return o.apply(this,arguments); }; })();
