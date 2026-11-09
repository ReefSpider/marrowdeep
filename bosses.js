'use strict';
/* ===== bosses: pattern framework, horror sprites ===== */
const FLOOR=()=>16*T;
function spawnBoss(key){ const B=BOSSES[key]; const e={boss:1,kind:key,type:'boss',x:L.w*T-130,y:FLOOR(),w:B.w,h:B.h,vx:0,vy:0,face:-1,
    hp:Math.round(B.hp*.8*(1+ngp*.9)),dmg:12+dep()*2.2+ngp*9,phase:1,state:'idle',st:0,cd:1.6,pat:null,anim:0,flash:0,intro:true,fly:!!B.fly,hitId:-1,dead:false,deadT:0,
    name:B.name,jp:B.jp,last:'',alpha:1,onGround:false,minions:[]};
  e.maxhp=e.hp; if(e.fly) e.y=FLOOR()-70; return e; }
function teleRect(x,y,w,h,dur){ fx.push({t:0,dur,haz:1,draw(f){ const a=.12+.3*Math.abs(Math.sin(f.t*12)); ectx.fillStyle=`rgba(255,40,30,${a.toFixed(2)})`; ectx.fillRect(x-camR.x,y-camR.y,w,h); ectx.fillStyle='rgba(255,140,110,.7)'; ectx.fillRect(x-camR.x,y+h-1-camR.y,w,1); }}); }
function hazard(x,y,w,h,dur,dmg,src,draw){ fx.push({t:0,dur,haz:1,hit:false,upd(f){ if(!f.hit&&overlap({x:f.x??x,y,w,h},pBox())){ f.hit=true; hurtPlayer(dmg,src); } },draw}); }
const BOSS_PROJ={mother:'tear',choir:'note',tithe:'tooth',saint:'knife',count:'orb'};
const RAIN_PROJ={mother:'tear',choir:'tooth',tithe:'tooth',saint:'knife',count:'orb'};
function endPat(e,cd){ e.pat=null; e.cd=(cd||1.2)*(e.phase>1?.75:1); }
function startPat(e){ const kit=BOSSES[e.kind].kit[e.phase-1]; let n=pick(kit); if(n===e.last) n=pick(kit); e.last=n; e.pat={name:n,t:0,hit:false,i:0}; const p=e.pat;
  e.face=Math.sign(P.x-e.x)||e.face;
  if(n==='slam'||n==='slam3'){ p.tx=P.x; teleRect(p.tx-24,FLOOR()-72,48,72,.8); AU.growl(); }
  else if(n==='sweep'){ p.dir=Math.sign(P.x-e.x)||1; teleRect(T,FLOOR()-18,(L.w-2)*T,18,.9); AU.growl(); }
  else if(n==='pull'){ AU.roar(); }
  else if(n==='beam'||n==='beam2'){ p.cols=[]; const k=n==='beam2'?5:3; for(let i=0;i<k;i++) p.cols.push(i===0?P.x:clamp(P.x+rnd(-200,200),30,L.w*T-30)); p.cols.forEach(x=>teleRect(x-11,0,22,FLOOR(),.85)); AU.ting(); }
  else if(n==='charge'){ teleRect(Math.min(e.x,e.x+e.face*500),FLOOR()-30,500,30,.7); AU.growl(); }
  else if(n==='duel'){ AU.noise(.3,600,2000,2,.2,'bandpass',.3); }
  else if(n==='tendril'){ p.next=0; }
  else if(n==='teleport'){ AU.noise(.4,3000,300,1,.25,'bandpass',.5); }
  else startPat2(e,n,p);
}
function bossProj(e,a,sp,type,r){ eProj({type:type||BOSS_PROJ[e.kind],x:e.x,y:e.y-e.h*.6,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,dmg:e.dmg*.75,r:r||4,life:4,ghost:true}); }
function runPat(e,dt){ const p=e.pat, n=p.name, F=FLOOR(); p.t+=dt; const t=p.t;
  if(n==='slam'||n==='slam3'){ const times=n==='slam3'?[.8,1.5,2.2]:[.8]; const ti=times[p.i];
    if(ti!=null&&t>=ti){ p.i++; p.hitX=p.tx; hazard(p.tx-24,F-72,48,72,.15,e.dmg*1.2,e); shockwave(p.tx,F,40,[-1,1]); shake(8); p.slamT=t; if(p.i<times.length){ p.tx=P.x; teleRect(p.tx-24,F-72,48,72,.65); } }
    if(t>=(n==='slam3'?2.9:1.4)) endPat(e,1.3); }
  else if(n==='sweep'){ if(t>=.9&&!p.go){ p.go=1; p.sx=p.dir>0?T:(L.w-1)*T; AU.swing(true); AU.chain(); fx.push({t:0,dur:.65,haz:1,hit:false,x:p.sx,upd(f){ f.x=p.dir>0?lerp(T,(L.w-1)*T,f.t/.65):lerp((L.w-1)*T,T,f.t/.65); if(!f.hit&&overlap({x:f.x-16,y:F-18,w:32,h:18},pBox())){ f.hit=true; hurtPlayer(e.dmg*1.1,{x:f.x-p.dir*20}); } },
      draw(f){ ectx.fillStyle='rgba(255,220,200,.85)'; ectx.fillRect(f.x-14-camR.x,F-12-camR.y,28,3); ectx.fillStyle='rgba(200,30,20,.5)'; ectx.fillRect(f.x-40*p.dir-camR.x,F-11-camR.y,40,2); for(let i=0;i<2;i++) sparks(f.x,F-6,1); }}); }
    if(t>=1.8) endPat(e,1.1); }
  else if(n==='ring'||n==='ring2'){ const waves=n==='ring2'?[.6,1.05]:[.6]; if(p.i<waves.length&&t>=waves[p.i]){ const N=e.phase>1?18:14, off=p.i*Math.PI/N; for(let i=0;i<N;i++) bossProj(e,i/N*Math.PI*2+off,e.phase>1?150:125); p.i++; AU.scream(); shake(3); }
    if(t>=1.6) endPat(e,1.2); }
  else if(n==='volley'){ const k=e.phase>1?7:5; if(p.i<k&&t>=.4+p.i*.17){ const a=Math.atan2(P.y-14-(e.y-e.h*.6),P.x-e.x)+rnd(-.12,.12); bossProj(e,a,210); p.i++; AU.noise(.08,2400,1200,3,.15,'bandpass',.2); }
    if(t>=1.8) endPat(e,1); }
  else if(n==='rain'){ const k=e.phase>1?14:10; if(!p.xs){ p.xs=[]; for(let i=0;i<k;i++){ p.xs.push(i%3===0?P.x+rnd(-20,20):rnd(2*T,(L.w-2)*T)); } p.xs.forEach((x,i)=>setTimeout(()=>{ if(e.dead||mode!=='play') return; teleRect(x-5,0,10,F,.55); },i*110)); }
    while(p.i<k&&t>=.6+p.i*.11){ const x=p.xs[p.i]; eProj({type:RAIN_PROJ[e.kind],x,y:camR.y-10,vx:0,vy:320,dmg:e.dmg*.7,r:4,life:3,ghost:true}); p.i++; }
    if(t>=k*.11+1.4) endPat(e,1); }
  else if(n==='summon'){ if(!p.done&&t>=.5){ p.done=1; const alive=enemies.filter(o=>!o.dead&&!o.boss).length; const k=Math.max(0,Math.min(3,5-alive)); const mt=BOSSES[e.kind].minion;
      for(let i=0;i<k;i++){ const m=mkEnemy({x:(e.x+rnd(-60,60))/T,y:(mt==='wraith'||mt==='witch')?(F-60)/T:F/T,t:mt}); m.x=clamp(m.x,2*T,(L.w-2)*T); enemies.push(m); ash(m.x,m.y-8,14); } AU.scream(); }
    if(t>=1.3) endPat(e,1.4); }
  else if(n==='dive'){ if(t<.8){ e.x=lerp(e.x,P.x,dt*3); e.y=lerp(e.y,F-140,dt*4); }
    else if(t<1.15){ e.x+=Math.sin(t*60)*.6; if(!p.tele){ p.tele=1; teleRect(e.x-30,F-60,60,60,.35); } }
    else if(!p.landed){ e.y+=520*dt; if(e.y>=F-4){ e.y=F-4; p.landed=1; shockwave(e.x,F,50,[-1,1]); hazard(e.x-50,F-30,100,30,.15,e.dmg*1.2,e); shake(9); } }
    else { e.y=lerp(e.y,F-70,dt*3); if(t>2.4) endPat(e,1); } }
  else if(n==='charge'){ if(t>=.7){ if(!p.go){ p.go=1; AU.roar(); } e.vx=e.face*370; e.x+=e.vx*dt; if(R()<.5) dust(e.x,F,2);
      if(e.x<2*T+e.w/2||e.x>(L.w-2)*T-e.w/2||t>1.9){ e.x=clamp(e.x,2*T+e.w/2,(L.w-2)*T-e.w/2); e.vx=0; shake(8); AU.slam(); dust(e.x,F,14); endPat(e,1.6); } } }
  else if(n==='pull'){ if(t>.4&&t<2){ if(P.dash<=0&&!P.dead){ P.vx+=Math.sign(e.x-P.x)*520*dt; } if(R()<.6) part({type:'dust',x:e.x+Math.sign(P.x-e.x)*rnd(30,160),y:F-rnd(4,40),vx:Math.sign(e.x-P.x)*200,vy:0,g:0,life:.5,col:'rgba(200,190,170,.35)',size:1}); }
    if(t>=2&&!p.hit){ p.hit=1; hazard(e.x-50,F-60,100,60,.15,e.dmg*1.4,e); AU.slam(); shake(7); }
    if(t>=2.5) endPat(e,1.2); }
  else if(n==='beam'||n==='beam2'){ if(t>=.85&&!p.go){ p.go=1; AU.boom(.6); shake(5); p.cols.forEach(x=>{ hazard(x-11,0,22,F,.45,e.dmg*1.1,{x}, f=>{ const k=1-f.t/f.dur; ectx.fillStyle=`rgba(255,240,200,${(k*.9).toFixed(2)})`; ectx.fillRect(x-8-camR.x,0,16,F-camR.y); ectx.fillStyle=`rgba(255,200,120,${(k*.5).toFixed(2)})`; ectx.fillRect(x-12-camR.x,0,24,F-camR.y); lights.length<LMAX&&addLight(x,F-40,80,1.2*k,1,.85,.6); }); }); }
    if(n==='beam2'&&t>=1.2&&!p.second){ p.second=1; p.cols=p.cols.map(x=>clamp(x+rnd(-90,90),30,L.w*T-30)); p.cols.forEach(x=>teleRect(x-11,0,22,F,.7)); p.go=0; p.t=.15; }
    if(t>=1.8&&(n==='beam'||p.second)) endPat(e,1.2); }
  else if(n==='teleport'){ if(t<.4) e.alpha=1-t/.4; else if(!p.moved){ p.moved=1; let nx=e.x; for(let i=0;i<10;i++){ nx=rnd(3*T,(L.w-3)*T); if(Math.abs(nx-P.x)>120) break; } e.x=nx; ash(e.x,e.y-40,20); } else { e.alpha=Math.min(1,(t-.4)/.4); if(t>=.9){ e.alpha=1; endPat(e,.6); } } }
  else if(n==='duel'){ const dx=P.x-e.x; if(t<.5&&Math.abs(dx)>34){ e.face=Math.sign(dx)||1; e.x+=e.face*320*dt; }
    const sl=[.55,.85,1.15]; if(p.i<3&&t>=sl[p.i]-.14&&!p.tele){ p.tele=1; sparks(e.x+e.face*12,e.y-26,4,'#fff2d0'); AU.ting(); }
    if(p.i<3&&t>=sl[p.i]){ p.tele=0; p.i++; p.swing=t; AU.swing(true); e.face=Math.sign(P.x-e.x)||e.face; e.x+=e.face*14; hazard(e.face>0?e.x:e.x-48,e.y-34,48,34,.1,e.dmg,e); }
    if(t>=1.6) endPat(e,.9); }
  else if(n==='leap'){ if(!p.go){ p.go=1; e.vy=-430; e.vx=(P.x-e.x)/.95; AU.growl(); }
    e.vy+=900*dt; e.x+=e.vx*dt; e.y+=e.vy*dt; if(e.y>=F&&e.vy>0){ e.y=F; e.vy=0; e.vx=0; if(!p.hit){ p.hit=1; shockwave(e.x,F,50,[-1,1]); hazard(e.x-44,F-24,88,24,.15,e.dmg*1.2,e); } }
    if(p.hit&&t>1.6) endPat(e,1); e.x=clamp(e.x,2*T,(L.w-2)*T); }
  else if(n==='wave'){ if(p.i<2&&t>=.5+p.i*.5){ p.i++; const d=Math.sign(P.x-e.x)||1; eProj({type:'wave',x:e.x+d*10,y:F-1,vx:d*250,vy:0,dmg:e.dmg*.9,r:7,life:2.5,ghost:true}); AU.swing(true); }
    if(t>=1.6) endPat(e,1); }
  else if(n==='tendril'){ while(p.i<7&&t>=p.i*.33){ const x=clamp(P.x+rnd(-8,8),2*T,(L.w-2)*T); p.i++; teleRect(x-9,F-10,18,10,.45);
      setTimeout(()=>{ if(e.dead||mode!=='play') return; AU.noise(.25,200,900,2,.3,'bandpass',.3); hazard(x-9,F-64,18,64,.35,e.dmg,{x},f=>{ const k=Math.min(1,f.t/.1)*(1-Math.max(0,(f.t-.25)/.1)); const hgt=64*k; ctx.fillStyle='#3a0a0a'; ctx.fillRect(x-5-camR.x,F-hgt-camR.y,10,hgt); ctx.fillStyle='#5a1414'; ctx.fillRect(x-3-camR.x,F-hgt-camR.y,3,hgt); for(let i=0;i<hgt;i+=8){ ctx.fillStyle='#cdbf9e'; ctx.fillRect(x+4-camR.x,F-hgt+i-camR.y,3,1); } ectx.fillStyle='rgba(255,40,30,.4)'; ectx.fillRect(x-1-camR.x,F-hgt-camR.y,2,hgt); }); },450); }
    if(t>=7*.33+.9) endPat(e,1); }
  else if(!runPat2(e,dt,p,n,t,F)) endPat(e,1);
}
function bossIdle(e,dt){ const F=FLOOR(), dx=P.x-e.x; e.face=Math.sign(dx)||e.face;
  if(e.kind==='choir'||e.kind==='saint'||(e.kind==='count'&&e.phase>1)){ const ty=F-(e.kind==='count'?110:e.kind==='saint'?62:76)+Math.sin(e.anim*1.3)*8; const tx=e.kind==='count'?L.w*T/2+Math.sin(e.anim*.4)*120:P.x+Math.sin(e.anim*.6)*90-dx*.2;
    e.x=lerp(e.x,clamp(tx,3*T,(L.w-3)*T),dt*(e.kind==='saint'?.8:1.2)); e.y=lerp(e.y,ty,dt*2); return; }
  const sp=e.kind==='count'?95:e.kind==='tithe'?26:20; e.vx=approach(e.vx,Math.abs(dx)>(e.kind==='count'?50:90)?e.face*sp:0,300*dt); e.vy+=900*dt; moveBody(e,dt); }
function updBoss(e,dt){ e.flash-=dt;
  if(e.dead){ e.deadT+=dt; if(R()<.7) ash(e.x+rnd(-e.w/2,e.w/2),e.y-rnd(0,e.h),2); if(R()<.3) bleed(e.x+rnd(-e.w/2,e.w/2),e.y-rnd(0,e.h),2,R()<.5?1:-1,1); return; }
  if(e.intro){ return; }
  if(e.phase===1&&e.hp<e.maxhp*.5){ e.phase=2; e.pat=null; e.state='roar'; e.st=1.8; e.alpha=1; AU.roar(); shake(9); impactT=.12; fx=fx.filter(f=>!f.haz); bossPhase(e); }
  else if(e.phase===2&&e.hp<e.maxhp*.22&&BOSSES[e.kind].kit[2]){ e.phase=3; e.pat=null; e.state='roar'; e.st=2.2; e.alpha=1; e.shield=0; AU.roar(); AU.scream(); shake(12); impactT=.16; fx=fx.filter(f=>!f.haz); bossPhase3(e); }
  bossStagTick(e,dt);
  if(e.state==='stagger'){ e.st-=dt; e.alpha=1; e.vx=approach(e.vx||0,0,400*dt); if(!e.fly){ e.vy+=900*dt; moveBody(e,dt); } else e.y=lerp(e.y,FLOOR()-24,dt*3); if(R()<.3) sparks(e.x+rnd(-e.w/2,e.w/2),e.y-e.h*rnd(.3,.9),1,'#fff1c8'); if(e.st<=0){ e.state='idle'; e.cd=.6; e.stag=0; } return; }
  if(e.state==='roar'){ e.st-=dt; e.flash=Math.sin(e.st*30)>0?.1:0; if(e.st<=0) e.state='idle'; return; }
  if(e.anchorsUp){ const n=enemies.filter(o=>!o.dead&&o.type==='anchor').length; if(n===0){ e.anchorsUp=0; toast('The anchors break. The Collector staggers.'); bossBreak(e,1.6); } else e.hp=Math.min(e.maxhp*(e.phase===3?.22:.5),e.hp+e.maxhp*.006*n*dt); }
  if(e.shield){ e.shieldT-=dt; const n=enemies.filter(o=>!o.dead&&o.type==='relicx').length; if(n===0){ e.shield=0; toast('Her reliquaries are broken.'); bossBreak(e,2); } else if(e.shieldT<=0){ e.shield=0; for(let i=0;i<24;i++) bossProj(e,i/24*Math.PI*2,170); AU.scream(); shake(8); for(const o of enemies) if(o.type==='relicx'&&!o.dead){ o.dead=true; o.deadT=9; ash(o.x,o.y-8,10); } } }
  if(!P.dead&&P.ghostT<=0&&e.alpha>.5&&overlap(eBox(e),pBox())) hurtPlayer(e.dmg*.6,e);
  if(e.pat){ runPat(e,dt); if(e.kind!=='choir'&&e.kind!=='saint'&&!(e.kind==='count'&&e.phase>1)&&e.pat&&e.pat.name!=='leap'&&e.pat.name!=='charge'){ e.vy+=900*dt; e.vx=approach(e.vx,0,400*dt); moveBody(e,dt); } return; }
  bossIdle(e,dt); e.cd-=dt; if(e.cd<=0) startPat(e); }
function bossPhase(e){ if(e.kind==='count'){ const p2=BOSSES.count.p2; e.w=p2.w; e.h=p2.h; e.fly=true; e.y=FLOOR()-110; e.x=L.w*T/2; e.hp=e.maxhp; e.name=p2.name; e.jp=p2.jp; L.wound=.6;
    for(let i=0;i<60;i++) bleed(e.x,e.y-40,2,R()<.5?1:-1,2); showBossName(p2.name,p2.jp,p2.sub); }
  else showBossName(e.name,e.jp,'It is angry now.'); }

/* ---------- boss sprites ---------- */
function drawMother(c,e){ const t=e.anim, p2=e.phase>1, br=Math.sin(t*1.4)*1.5;
  c.fillStyle='#160f12'; c.beginPath(); c.moveTo(-20,0); for(let i=0;i<=10;i++) c.lineTo(-20+i*4,-((i%2)?6:0)-Math.sin(t*2+i)*2); c.lineTo(13,-46); c.lineTo(-12,-46); c.closePath(); c.fill();
  c.fillStyle='#241a1e'; c.beginPath(); c.moveTo(-10,-46); c.lineTo(-14,-6); c.lineTo(-4,-10); c.lineTo(-2,-46); c.fill();
  [[-8,-72,-2.4],[-6,-66,-2.9],[6,-72,-.75],[6,-66,-.25]].forEach(([sx,sy,a],i)=>{ if(e.pat&&e.pat.name.startsWith('slam')&&i===2) return; const sw=Math.sin(t*1.7+i*1.3)*.25+(e.pat&&e.pat.name==='sweep'?.6:0);
    c.save(); c.translate(sx,sy+br); c.rotate(a+sw); rect(c,0,-1.5,24,3,'#cfc6b4'); rect(c,22,-2,3,4,'#5a4a40'); c.translate(24,0); c.rotate(.9+sw); rect(c,0,-1,20,2,'#cfc6b4');
    for(let f=0;f<4;f++){ c.save(); c.translate(20,0); c.rotate(-.6+f*.35); rect(c,0,-.5,9,1,'#d8d0c0'); c.restore(); } c.restore(); });
  c.fillStyle='#b9b2a4'; c.beginPath(); c.moveTo(-10,-46); c.lineTo(-8,-74+br); c.lineTo(8,-74+br); c.lineTo(10,-46); c.closePath(); c.fill();
  for(let i=0;i<5;i++) rect(c,-6,-70+br+i*4,12,1,'#8a8270');
  c.fillStyle='#2a1e1e'; c.beginPath(); c.ellipse(6,-54+br,12,8,-.2,0,Math.PI*2); c.fill(); c.fillStyle='#3a2a28'; c.beginPath(); c.ellipse(9,-57+br,7,5,.3,0,Math.PI*2); c.fill();
  rect(c,14,-60+br,3,1,'#c8bca8'); rect(c,16,-61+br,1,2,'#c8bca8'); rect(c,2,-50+br,1,4,'#c8bca8'); rect(c,10,-49+br,4,1,'#c8bca8'); rect(c,3,-62+br,4,4,'#cdbf9e'); rect(c,4,-61+br,1,1,'#120c0c'); rect(c,6,-61+br,1,1,'#120c0c');
  rect(c,-8,-60+br,18,3,'#bdb5a6');
  c.fillStyle='#0c0809'; c.beginPath(); c.moveTo(-7,-90+br); c.quadraticCurveTo(0,-99+br,7,-90+br); c.lineTo(11,-48+br); for(let i=0;i<6;i++) c.lineTo(11-i*4.4,-46+br+((i%2)?4:0)+Math.sin(t*2+i)*1.5); c.lineTo(-11,-48+br); c.closePath(); c.fill();
  for(let i=0;i<6;i++) rect(c,-6+i*2.4|0,-88+br,1,26+((i*7)%10),'#1e1618');
  if(p2){ rect(c,-2,-86+br,4,26,'#2a0606'); for(let i=0;i<6;i++){ rect(c,-2,-84+br+i*4,1,2,'#d8ccb0'); rect(c,1,-82+br+i*4,1,2,'#d8ccb0'); } } }
function drawChoir(c,e){ const t=e.anim, sing=!!e.pat;
  for(let k=0;k<3;k++){ const bx=-10+k*10; for(let i=0;i<9;i++){ rect(c,Math.round(bx+Math.sin(t*2+i*.6+k)*i*.6),-10+i*4,3,3,i%2?'#a89a88':'#cdbf9e'); } }
  c.strokeStyle='#5a3a2a'; c.lineWidth=2; c.beginPath(); c.arc(0,-32,31,0,Math.PI*2); c.stroke();
  for(let i=0;i<12;i++){ const a=i/12*Math.PI*2+t*.3; rect(c,Math.round(Math.cos(a)*34),Math.round(-32+Math.sin(a)*34),2,2,'#7a5a42'); }
  c.fillStyle='#3e2e2c'; c.beginPath(); c.ellipse(0,-30,22,18,0,0,Math.PI*2); c.fill(); c.strokeStyle='#2a1a1a'; c.lineWidth=1; for(let i=-2;i<=2;i++){ c.beginPath(); c.arc(0,-30,10+i*2,.3,2.8); c.stroke(); }
  for(let i=0;i<7;i++){ const a=i/7*Math.PI*2+t*.25; const hx=Math.cos(a)*19, hy=-30+Math.sin(a)*14; c.fillStyle='#c9bfae'; c.beginPath(); c.ellipse(hx,hy,5,6.5,0,0,Math.PI*2); c.fill();
    rect(c,Math.round(hx-3),Math.round(hy-3),2,2,'#120a0a'); rect(c,Math.round(hx+1),Math.round(hy-3),2,2,'#120a0a'); const m=sing?2+Math.abs(Math.sin(t*9+i))*2:1.2; c.fillStyle='#2a0606'; c.beginPath(); c.ellipse(hx,hy+2.5,1.6,m,0,0,Math.PI*2); c.fill(); } }
function drawTithe(c,e){ const t=e.anim, wk=Math.round(Math.sin(e.anim*3)*Math.min(2,Math.abs(e.vx)/10)); const pull=e.pat&&e.pat.name==='pull'&&e.pat.t>.4;
  rect(c,-14+wk,-30,10,30,'#4a3a32'); rect(c,4-wk,-30,10,30,'#3e302a'); rect(c,-15+wk,-6,12,6,'#2a201a'); rect(c,3-wk,-6,12,6,'#2a201a');
  c.fillStyle='#2a2628'; for(let x=-36;x<=-10;x+=4) c.fillRect(x,-104,2,44); c.fillRect(-38,-106,30,3); c.fillRect(-38,-62,30,3);
  rect(c,-30,-92,12,10,'#3a2a28'); rect(c,-27,-90,2,2,'#120c0c'); rect(c,-23,-90,2,2,'#120c0c'); for(let i=0;i<4;i++) rect(c,-34+i*7,-80+((i*5)%9),2,6,'#c8bca8'); rect(c,-40,-84,5,2,'#c8bca8');
  c.fillStyle='#6a5a4c'; c.beginPath(); c.moveTo(-18,-30); c.lineTo(-22,-70); c.lineTo(-6,-92); c.lineTo(14,-84); c.lineTo(20,-40); c.lineTo(14,-30); c.closePath(); c.fill();
  c.fillStyle='#584a3e'; c.beginPath(); c.moveTo(-18,-30); c.lineTo(-22,-70); c.lineTo(-12,-78); c.lineTo(-8,-34); c.fill(); for(let i=0;i<5;i++) rect(c,-4+i*3,-60+i*5,6,1,'#3a2a20');
  c.fillStyle='#5a4a36'; c.beginPath(); c.moveTo(4,-96); c.lineTo(22,-94); c.lineTo(24,-78); c.lineTo(6,-78); c.fill(); rect(c,6,-80,18,2,'#3a2a1a');
  const X=(x,y)=>{ rect(c,x,y,1,1,'#1a0a0a'); rect(c,x+2,y,1,1,'#1a0a0a'); rect(c,x+1,y+1,1,1,'#1a0a0a'); rect(c,x,y+2,1,1,'#1a0a0a'); rect(c,x+2,y+2,1,1,'#1a0a0a'); }; X(12,-90); X(18,-90);
  rect(c,10,-84,12,1,pull?'#2a0606':'#3a2a1a'); if(pull){ c.fillStyle='#1a0404'; c.beginPath(); c.ellipse(16,-82,6,4,0,0,Math.PI*2); c.fill(); }
  c.save(); c.translate(12,-78); c.rotate(.6); rect(c,0,-5,30,10,'#6a5a4c'); rect(c,28,-6,8,12,'#584a3e'); c.restore(); }
function drawSaint(c,e){ const t=e.anim; const a=e.alpha==null?1:e.alpha; c.globalAlpha=a;
  for(let i=0;i<12;i++){ const ang=i/12*Math.PI*2+t*.8; c.save(); c.translate(Math.cos(ang)*19,-68+Math.sin(ang)*19); c.rotate(ang); rect(c,-1,-5,2,10,'#bdb6a8'); rect(c,-1,4,2,2,'#2a1a10'); c.restore(); }
  c.fillStyle='rgba(216,208,192,.88)'; c.beginPath(); c.moveTo(-10,-60); c.lineTo(10,-60); c.lineTo(16,-20); for(let i=0;i<=8;i++) c.lineTo(16-i*4,6+((i%2)?6:0)+Math.sin(t*2+i)*3); c.lineTo(-16,-20); c.closePath(); c.fill();
  rect(c,-6,-62,12,28,'#7a2a24'); for(let i=0;i<5;i++) rect(c,-5,-58+i*5,10,1,'#4a1210'); rect(c,-1,-60,2,24,'#a8443a');
  rect(c,-32,-60,26,4,'#7a2a24'); rect(c,6,-60,26,4,'#7a2a24'); rect(c,-32,-60,26,1,'#a8443a'); rect(c,6,-60,26,1,'#a8443a'); rect(c,-31,-59,2,2,'#1a0a0a'); rect(c,29,-59,2,2,'#1a0a0a');
  c.fillStyle='#c9a96a'; c.beginPath(); c.ellipse(0,-70,6,8,0,0,Math.PI*2); c.fill(); rect(c,-3,-72,2,1,'#2a1a10'); rect(c,1,-72,2,1,'#2a1a10'); rect(c,-4,-76,1,1,'#2a1a10'); rect(c,3,-66,1,1,'#2a1a10'); rect(c,0,-64,1,4,'#7a1010'); rect(c,-2,-63,1,3,'#7a1010');
  c.globalAlpha=1; }
function drawCount(c,e){ const t=e.anim;
  if(e.phase>1){ for(let i=0;i<7;i++){ const bx=-30+i*10; c.strokeStyle='#3a0a0a'; c.lineWidth=3; c.beginPath(); c.moveTo(bx,-14); c.quadraticCurveTo(bx+Math.sin(t*2+i)*10,10,bx+Math.sin(t*1.5+i)*14,30); c.stroke(); }
    for(let i=0;i<9;i++){ const sx=-28+i*7; c.fillStyle='#cdbf9e'; c.beginPath(); c.moveTo(sx,-60); c.lineTo(sx+3,-76-((i*13)%12)); c.lineTo(sx+6,-60); c.fill(); }
    c.fillStyle='#5a1a18'; c.beginPath(); c.ellipse(0,-38,40,28,0,0,Math.PI*2); c.fill(); c.fillStyle='#3a0c0a'; c.beginPath(); c.ellipse(0,-38,36,22,0,0,Math.PI*2); c.fill();
    const open=.7+.3*Math.sin(t*.8); c.fillStyle='#d8cbb0'; c.beginPath(); c.ellipse(0,-38,30,18*open,0,0,Math.PI*2); c.fill();
    c.strokeStyle='#a02a20'; c.lineWidth=1; for(let i=0;i<8;i++){ const a=i/8*Math.PI*2; c.beginPath(); c.moveTo(Math.cos(a)*28,-38+Math.sin(a)*16*open); c.lineTo(Math.cos(a)*14,-38+Math.sin(a)*7*open); c.stroke(); }
    return; }
  const sw=e.pat&&e.pat.name==='duel'&&e.pat.swing&&e.pat.t-e.pat.swing<.15; const wk=Math.round(Math.sin(e.anim*8)*Math.min(2,Math.abs(e.vx)/30));
  c.fillStyle='#4a0c0e'; c.beginPath(); c.moveTo(-2,-28); c.lineTo(-12-Math.min(6,Math.abs(e.vx)/30),-2+Math.sin(t*6)); c.lineTo(-4,-4); c.lineTo(2,-26); c.fill();
  rect(c,-4+wk,-12,3,12,'#1a181c'); rect(c,1-wk,-12,3,12,'#24222a'); rect(c,-5,-25,10,13,'#1e1c22'); rect(c,-5,-25,3,13,'#141216'); rect(c,1,-24,1,11,'#4a4650'); rect(c,-5,-14,10,2,'#3a0c0e');
  rect(c,-4,-33,8,8,'#1e1c22'); rect(c,-4,-33,8,1,'#4a4650'); rect(c,0,-30,4,1,'#060304');
  for(let i=0;i<4;i++){ rect(c,-4+i*2.6|0,-37-(i%2)*2,2,4+(i%2)*2,'#b08a3a'); }
  c.save(); c.translate(3,-21); c.rotate(sw?.9:e.pat&&e.pat.name==='duel'?-2.2:-.6); rect(c,0,-1.5,5,3,'#1e1c22'); rect(c,5,-3,2,6,'#b08a3a'); rect(c,7,-1.5,26,3,'#9a9aa2'); rect(c,7,-1.5,26,1,'#e0dcd0'); c.restore(); }
const BDRAW={mother:drawMother,choir:drawChoir,tithe:drawTithe,saint:drawSaint,count:drawCount};
function drawBoss(e){ const F=FLOOR(); const alpha=e.dead?clamp(1-e.deadT/2.2,0,1):(e.alpha==null?1:e.alpha);
  if(e.kind==='mother'&&e.pat&&e.pat.name.startsWith('slam')&&!e.dead){ const p=e.pat; const since=p.slamT!=null?p.t-p.slamT:9; const raise=since<.4?0:1; const tx=(p.hitX!=null&&since<.4)?p.hitX:p.tx; const sx=e.x+e.face*6, sy=e.y-74;
    const ty=F-(raise?60:0); const mx=(sx+tx)/2, my=Math.min(sy,ty)-30; ctx.strokeStyle='#cfc6b4'; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(sx-camR.x,sy-camR.y); ctx.lineTo(mx-camR.x,my-camR.y); ctx.lineTo(tx-camR.x,ty-camR.y); ctx.stroke(); ctx.strokeStyle='#0b0708'; ctx.lineWidth=1; ctx.stroke(); rect(ctx,Math.round(tx-6-camR.x),Math.round(ty-camR.y),12,4,'#d8d0c0'); }
  if(e.kind==='tithe'&&!e.dead){ const p=e.pat; let bx=e.x+e.face*36, by=F-7; if(p&&p.name.startsWith('slam')){ const since=p.slamT!=null?p.t-p.slamT:9; if(since<.4){ bx=p.hitX; by=F-7; } else { bx=lerp(e.x+e.face*20,p.tx,.3); by=e.y-120; } } else if(p&&p.name==='sweep'&&p.go){ const f=fx.find(f=>f.x!=null&&f.haz&&f.upd); if(f){ bx=f.x; by=F-10; } }
    const hx=e.x+e.face*28, hy=e.y-46; const n=14; for(let i=0;i<=n;i++){ const k=i/n; const x=lerp(hx,bx,k), y=lerp(hy,by,k)+Math.sin(k*Math.PI)*12; rect(ctx,Math.round(x-camR.x),Math.round(y-camR.y),2,2,i%2?'#3e3a44':'#6a6672'); }
    ctx.fillStyle='#2a2628'; ctx.beginPath(); ctx.arc(bx-camR.x,by-camR.y,7,0,Math.PI*2); ctx.fill(); for(let i=0;i<8;i++){ const a=i/8*Math.PI*2; rect(ctx,Math.round(bx+Math.cos(a)*9-camR.x),Math.round(by+Math.sin(a)*9-camR.y),2,2,'#5a5660'); } }
  blit(g=>BDRAW[e.kind](g,e),e.x,e.y,e.face,{big:1,flash:e.flash>0?1:0,alpha,rim:e.phase>1&&!e.dead?'rgba(180,20,14,.35)':null});
  if(e.dead) return;
  emisAt(e.x,e.y,e.face,g=>{ const t=e.anim;
    if(e.kind==='mother'){ if(e.phase>1){ g.fillStyle=`rgba(255,40,24,${(.5+.3*Math.sin(t*6)).toFixed(2)})`; g.fillRect(-1,-86,2,26); } g.fillStyle='rgba(200,20,16,.6)'; g.fillRect(-4,-46,1,3); g.fillRect(3,-45,1,4); }
    else if(e.kind==='choir'){ if(e.pat){ for(let i=0;i<7;i++){ const a=i/7*Math.PI*2+t*.25; g.fillStyle='rgba(255,60,40,.55)'; g.fillRect(Math.round(Math.cos(a)*19-1),Math.round(-30+Math.sin(a)*14+2),2,2); } } }
    else if(e.kind==='tithe'){ g.fillStyle='rgba(255,200,120,.4)'; g.fillRect(-30,-92,12,1); }
    else if(e.kind==='saint'){ g.globalAlpha=e.alpha==null?1:e.alpha; g.strokeStyle='rgba(255,210,130,.45)'; g.lineWidth=2; g.beginPath(); g.arc(0,-68,21,0,Math.PI*2); g.stroke(); g.fillStyle='#fff6e0'; g.fillRect(-3,-72,2,1); g.fillRect(1,-72,2,1); g.globalAlpha=1; }
    else if(e.kind==='count'){ if(e.phase>1){ const lx=clamp((P.x-e.x)*e.face/200,-1,1)*10; g.fillStyle='rgba(255,30,18,.95)'; g.beginPath(); g.arc(lx,-38,11,0,Math.PI*2); g.fill(); } else { g.fillStyle='#ff3a2a'; g.fillRect(0,-30,4,1); } } });
  if(e.kind==='count'&&e.phase>1){ const lx=clamp((P.x-e.x)/200,-1,1)*10; rect(ctx,Math.round(e.x+lx-1-camR.x),Math.round(e.y-46-camR.y),3,16,'#050102'); addLight(e.x,e.y-40,140,1.2,1,.2,.12); }
  else addLight(e.x,e.y-e.h*.6,90,.5,1,.4,.3); }

/* ---------- stagger: hit hard and often and even a horror loses its footing ---------- */
const PHASE3_SUB={mother:'She stops singing.',choir:'The seventh mouth opens.',tithe:'He reaches for your receipt.',saint:'The mask cracks.',count:'It looks at you. Only at you.'};
function bossPhase3(e){ showBossName(e.name,e.jp,PHASE3_SUB[e.kind]||'The last of it.'); cutIn(e.kind==='count'?'wound':e.kind,e.name,'第三幕',1.6); if(typeof MUS!=='undefined') MUS.setMood('boss'); camZT=1.12; setTimeout(()=>{ camZT=1; },1600); }
function bossStagTick(e,dt){ e.stagMax=e.stagMax||e.maxhp*.16; if(!(e.stagHit>time-2.5)) e.stag=Math.max(0,(e.stag||0)-e.stagMax*.08*dt); }
function bossStagAdd(e,d,heavy,crit){ if(e.state==='stagger'||e.state==='roar'||e.intro) return; e.stagMax=e.stagMax||e.maxhp*.16; e.stag=(e.stag||0)+d*(heavy?1.7:1)*(crit?1.4:1); e.stagHit=time; if(e.stag>=e.stagMax) bossBreak(e,2.4); }
function bossBreak(e,dur){ if(e.dead) return; e.state='stagger'; e.st=dur; e.pat=null; e.stag=e.stagMax; fx=fx.filter(f=>!f.haz); AU.clang(); AU.ting(); AU.boom(.6); AU.toll&&AU.toll(); impactT=.12; freeze=.14; shake(9);
  sparks(e.x,e.y-e.h*.6,30,'#fff6d8'); showBossName('崩し','KUZUSHI','Broken stance. Strike now.'); camZT=1.08; setTimeout(()=>{ camZT=1; },900); }
/* ---------- the new patterns ---------- */
function startPat2(e,n,p){ const F=FLOOR();
  if(n==='lullaby'){ p.cand=[]; const xs=[4*T,L.w*T/2,(L.w-4)*T]; for(const x of xs) p.cand.push({x:x+rnd(-30,30),y:F}); AU.bell(); caption('She hums. The lamps go out.','子守唄'); setTimeout(()=>caption(''),2200); }
  else if(n==='hymn'){ p.walls=0; AU.scream(); }
  else if(n==='anchors'){ if(enemies.some(o=>!o.dead&&o.type==='anchor')){ p.skip=1; return; } AU.chain(); AU.roar(); }
  else if(n==='martyr'){ if(e.shield){ p.skip=1; return; } AU.bell(); }
  else if(n==='challenge'){ p.delay=rnd(1.1,2.1); AU.noise(.6,200,800,2,.2,'bandpass',.4); e.face=Math.sign(P.x-e.x)||1; cutIn('count','Kneel, or draw.','跪け、さもなくば抜け',1.1); }
  else if(n==='gaze'){ p.dir=R()<.5?1:-1; AU.roar(); toast('Get under something.'); }
}
function inLight(p){ if(!p.cand) return true; return p.cand.some(c=>Math.abs(P.x-c.x)<c.r&&Math.abs(P.y-c.y)<40); }
function underCover(){ const tx=Math.floor(P.x/T); for(let ty=Math.floor((P.y-P.h)/T)-1;ty>=0;ty--){ const v=tileAt(tx,ty); if(v===1||v===2) return true; } return false; }
function runPat2(e,dt,p,n,t,F){
  if(p.skip){ endPat(e,.3); return true; }
  if(n==='lullaby'){ L.dark=Math.min(1,(L.dark||0)+dt*1.5); for(const c of p.cand) c.r=Math.max(18,46-t*4.5);
    if(t>1.4){ p.tk=(p.tk||0)-dt; if(p.tk<=0){ p.tk=.45; if(!inLight(p)&&!P.dead){ hurtPlayer(e.dmg*.45,{x:P.x+1,hp:0,dead:true}); } } if(R()<.25) eProj({type:'tear',x:rnd(2*T,(L.w-2)*T),y:camR.y-10,vx:0,vy:260,dmg:e.dmg*.5,r:3,life:3,ghost:true}); }
    L.cand=p.cand; if(t>=6.5){ L.cand=null; endPat(e,1.4); } return true; }
  if(n==='hymn'){ const k=e.phase>2?4:3; if(p.walls<k&&t>=.6+p.walls*1.15){ const dir=p.walls%2?-1:1, x=dir>0?1.2*T:(L.w-1.2)*T; const gap=pick([F-26,F-90,F-150]); p.walls++; AU.scream();
      for(let y=24;y<F;y+=14){ if(Math.abs(y-gap)<26) continue; eProj({type:'note',x,y,vx:dir*(e.phase>2?150:125),vy:0,dmg:e.dmg*.6,r:5,life:5.5,ghost:true}); } }
    if(t>=.6+k*1.15+1.2) endPat(e,1.2); return true; }
  if(n==='anchors'){ if(!p.done&&t>=.6){ p.done=1; e.anchorsUp=1; for(const x of [3*T,L.w*T/2,(L.w-3)*T]){ const a=mkEnemyAt('anchor',x,F-(x===L.w*T/2?150:30)); a.hy=a.y; a.hp=a.maxhp=50+dep()*10+ngp*60; enemies.push(a); ash(a.x,a.y-8,16); } toast('Break the debt anchors. Each one feeds him.'); shake(5); }
    if(t>=1.4) endPat(e,1); return true; }
  if(n==='martyr'){ if(!p.done&&t>=.5){ p.done=1; e.shield=1; e.shieldT=e.phase>2?8:10; for(const [x,y] of [[4*T,F-40],[L.w*T/2,F-150],[(L.w-4)*T,F-40]]){ const r=mkEnemyAt('relicx',x,y); r.hy=r.y; r.hp=r.maxhp=40+dep()*8+ngp*50; enemies.push(r); sparks(x,y-8,12,'#ffe0a0'); } toast('She is sealed. Break her reliquaries before the seal bursts.'); }
    if(t>=1.2) endPat(e,.8); return true; }
  if(n==='challenge'){ const g=p.delay; if(t<g){ e.vx=0; if(R()<.2) ash(e.x,e.y-20,1); }
    else if(!p.glint){ p.glint=t; AU.ting(); U.uWhite.value=.25; sparks(e.x+e.face*8,e.y-24,10,'#fff6d8'); }
    else if(!p.cut&&t>=p.glint+.3){ p.cut=1; const ok=P.dash>0||(P.dashAge<.25)||(time-P.blockT<.3&&P.block); AU.swing(true); AU.kill(); impactT=.1;
      fx.push({t:0,dur:.4,draw(f){ const k=f.t/f.dur; ectx.fillStyle=`rgba(255,245,235,${(1-k).toFixed(2)})`; ectx.fillRect(0,e.y-22-camR.y,W,2); }});
      if(ok){ showBossName('見切り','MIKIRI','You read the blade.'); P.inv=Math.max(P.inv,.4); bossBreak(e,2.6); if(has('clar')) triggerClarity(); }
      else if(Math.abs(P.y-e.y)<60) hurtPlayer(e.dmg*1.6,e); }
    if(p.cut&&t>=p.glint+1.1) endPat(e,1.1); return true; }
  if(n==='gaze'){ const dur=2.6; if(t<.9){ /* opening */ }
    else { const k=(t-.9)/dur, x=p.dir>0?lerp(T,(L.w-1)*T,k):lerp((L.w-1)*T,T,k); p.x=x; if(!p.hit&&Math.abs(P.x-x)<14&&!underCover()&&!P.dead){ p.hit=1; hurtPlayer(e.dmg*1.5,{x,hp:0,dead:true}); } if(R()<.5) sparks(x,F-2,2,'#ffb070'); }
    L.gaze=t<.9?{x:p.dir>0?T:(L.w-1)*T,warn:1}:t<.9+dur?{x:p.x}:null; if(t>=.9+dur+.4){ L.gaze=null; endPat(e,1.2); } return true; }
  return false; }
function drawBossOverlays(){
  if(L.gaze){ const x=L.gaze.x-camR.x, F=FLOOR()-camR.y; if(L.gaze.warn){ ectx.fillStyle=`rgba(255,60,40,${(.2+.2*Math.sin(time*20)).toFixed(2)})`; ectx.fillRect(x-14,0,28,F); }
    else { ectx.fillStyle='rgba(255,230,190,.85)'; ectx.fillRect(x-8,0,16,F); ectx.fillStyle='rgba(255,120,60,.45)'; ectx.fillRect(x-16,0,32,F); addLight(L.gaze.x,FLOOR()-40,120,1.4,1,.7,.4);
      // the beam is stopped by stone and planks: draw shadows under them
      const tx=Math.floor(L.gaze.x/T); for(let ty=0;ty<L.h;ty++){ const v=tileAt(tx,ty); if(v===1||v===2){ ctx.fillStyle='rgba(0,0,0,.5)'; ctx.fillRect(x-16,ty*T+T-camR.y,32,F-(ty*T+T-camR.y)); break; } } } }
  if(L.dark>0){ if(!L.cand) L.dark=Math.max(0,L.dark-1/60*1.2); const dc=DARKC, g=dc.getContext('2d'); g.setTransform(1,0,0,1,0,0); g.globalCompositeOperation='source-over'; g.clearRect(0,0,W,H); g.fillStyle=`rgba(0,0,0,${(.86*L.dark).toFixed(2)})`; g.fillRect(0,0,W,H);
    g.globalCompositeOperation='destination-out'; const hole=(x,y,r)=>{ const rg=g.createRadialGradient(x,y,2,x,y,r); rg.addColorStop(0,'rgba(0,0,0,1)'); rg.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=rg; g.fillRect(x-r,y-r,r*2,r*2); };
    hole(P.x-camR.x,P.y-14-camR.y,34); if(L.cand) for(const c of L.cand){ hole(c.x-camR.x,c.y-14-camR.y,c.r*1.6); } g.globalCompositeOperation='source-over';
    ctx.drawImage(dc,0,0,W,H);
    if(L.cand) for(const c of L.cand){ const sx=c.x-camR.x, sy=c.y-camR.y; rect(ctx,sx-1,sy-8,3,8,'#e8dcc0'); const f=.7+.3*Math.sin(time*12+c.x); ectx.fillStyle=`rgba(255,200,110,${f.toFixed(2)})`; ectx.fillRect(sx-1,sy-12,3,4); ectx.strokeStyle='rgba(255,210,140,.35)'; ectx.beginPath(); ectx.ellipse(sx,sy-1,c.r,4,0,0,Math.PI*2); ectx.stroke(); addLight(c.x,c.y-10,c.r*2,.9,1,.75,.4); } }
  for(const o of enemies){ if(o.dead) continue; const b=enemies.find(e=>e.boss&&!e.dead); if(!b) break;
    if(o.type==='anchor'&&b.anchorsUp||o.type==='relicx'&&b.shield){ const n=Math.floor(Math.hypot(b.x-o.x,b.y-b.h/2-o.y)/5); for(let i=0;i<n;i++){ const k=i/n; const x=lerp(o.x,b.x,k)-camR.x, y=lerp(o.y-8,b.y-b.h/2,k)-camR.y+Math.sin(k*9+time*6)*2; ectx.fillStyle=o.type==='anchor'?(i%2?'rgba(200,30,20,.7)':'rgba(90,10,8,.7)'):'rgba(255,220,150,.45)'; ectx.fillRect(x|0,y|0,2,2); } } }
  const b=enemies.find(e=>e.boss&&!e.dead&&e.shield); if(b){ const sx=b.x-camR.x, sy=b.y-b.h/2-camR.y; ectx.strokeStyle=`rgba(255,220,150,${(.35+.2*Math.sin(time*8)).toFixed(2)})`; ectx.lineWidth=1; ectx.beginPath(); ectx.ellipse(sx,sy,b.w*.9,b.h*.65,0,0,Math.PI*2); ectx.stroke(); }
}
const DARKC=document.createElement('canvas'); DARKC.width=W; DARKC.height=H;
