'use strict';
/* ===== more of the Pit: new enemy types, rare & unique monsters, mods ===== */
Object.assign(EDEF,{
  hound:{w:14,h:10,hp:12,dmg:6,spd:118,xp:4,name:'Gutter Hound'},
  swarm:{w:8,h:8,hp:5,dmg:3,spd:75,xp:2,fly:1,name:'Carrion Swarm'},
  penitent:{w:11,h:24,hp:38,dmg:12,spd:44,xp:13,name:'Penitent'},
  spitter:{w:14,h:8,hp:20,dmg:8,spd:40,xp:9,name:'Ceiling Leech'},
  knight:{w:13,h:28,hp:110,dmg:17,spd:40,xp:34,name:'Flayed Knight'},
  nun:{w:11,h:24,hp:30,dmg:12,spd:32,xp:16,name:'Candle Nun'},
  debtor:{w:14,h:16,hp:70,dmg:0,spd:100,xp:60,name:'The Gilded Debtor'},
  anchor:{w:16,h:20,hp:60,dmg:0,spd:0,xp:20,fly:1,name:'Debt Anchor'},
  relicx:{w:14,h:16,hp:55,dmg:0,spd:0,xp:20,fly:1,name:'Martyr\'s Reliquary'}
});
const MODS={fast:'Extra Fast',stone:'Stone Skin',fire:'Fire Enchanted',vamp:'Bloodthirsty',blink:'Shadow-Stepping',cursed:'Cursed',split:'Legion'};
const RARE2=['Gnaw','Shroud','Maw','Thorn','Ruin','Wail','Rot','Ledger','Hymn','Nail'];
const UNQ_MON=[
  {t:'brute',name:'Old Marrow, Who Counts the Dead',mods:['stone','fire']},{t:'nun',name:'Sister Wick',mods:['fast','fire']},{t:'knight',name:'Ser Hollow, Unhorsed',mods:['vamp','blink']},
  {t:'penitent',name:'The Flagellant Abbot',mods:['split','fast']},{t:'hound',name:'Debtcatcher',mods:['fast','vamp']},{t:'witch',name:'Mother Lantern',mods:['blink','cursed']},
  {t:'husk',name:'Captain Ash, Still Saluting',mods:['stone','cursed']},{t:'ghoul',name:'Gnawing Tom',mods:['fast','split']}];
const NO_RANK=new Set(['swarm','crawler','debtor','anchor','relicx']);
function rankUp(e,kind,mods,name){ e[kind]=1; e.mods=mods; if(kind==='rare'){ e.hp*=3; e.dmg*=1.4; e.xp*=5; } else { e.hp*=5; e.dmg*=1.6; e.xp*=10; } e.maxhp=e.hp; e.name=name; if(mods.includes('fast')) e.spd*=1.6; }
function decorateEnemy(e,s){ const D=diff();
  if(s.unique!=null){ const u=UNQ_MON[s.unique]; rankUp(e,'unique',u.mods.slice(),u.name); return; }
  if(!s.pack&&!s.guard&&!e.champ&&!NO_RANK.has(e.type)&&R()<.035+D*.004){ const ks=Object.keys(MODS); const m=[pick(ks)]; let m2=pick(ks); if(m2!==m[0]) m.push(m2); rankUp(e,'rare',m,pick(RN1)+' '+pick(RARE2)); } }
function modsTick(e,dt){ if(!e.mods||e.dead) return;
  if(e.mods.includes('fire')){ e.fireT=(e.fireT||0)-dt; if(e.fireT<=0&&e.onGround&&Math.abs(e.vx)>10){ e.fireT=.35; const x=e.x, y=e.y; fx.push({t:0,dur:1.4,upd(f){ if(!f.h&&f.t>.1&&Math.abs(P.x-x)<8&&Math.abs(P.y-y)<12){ f.h=1; hurtPlayer(e.dmg*.35,{x,hp:0,dead:true}); } },draw(f){ const k=1-f.t/f.dur; ectx.fillStyle=`rgba(255,${100+Math.random()*80|0},40,${(.8*k).toFixed(2)})`; ectx.fillRect(x-camR.x-2,y-camR.y-3-Math.random()*3,4,3); }}); } }
  if(e.mods.includes('blink')){ e.blinkT=(e.blinkT||2)-dt; if(e.blinkT<=0&&Math.abs(P.x-e.x)<200){ e.blinkT=3.5; const nx=P.x-P.face*30; if(!solidPx(nx,e.y-6)&&!solidPx(nx,e.y-e.h+2)){ ash(e.x,e.y-e.h/2,10); e.x=nx; e.face=Math.sign(P.x-e.x)||1; ash(e.x,e.y-e.h/2,10); AU.noise(.25,3000,300,1,.2,'bandpass',.4); } } } }
function modsOnHitPlayer(src,dmg){ if(!src||!src.mods) return; if(src.mods.includes('vamp')){ src.hp=Math.min(src.maxhp,src.hp+dmg*1.5); } if(src.mods.includes('cursed')){ P.grit=Math.max(0,P.grit-30); sparks(P.x,P.y-14,8,'#a060ff'); } }
function modsOnDeath(e){ if(!e.mods) return;
  if(e.mods.includes('fire')){ AU.boom(.6); for(let i=0;i<20;i++){ const a=R()*Math.PI*2; part({x:e.x,y:e.y-8,vx:Math.cos(a)*150,vy:Math.sin(a)*150-40,g:200,life:rnd(.3,.7),em:true,col:pick(['#ff7a2a','#ffcf7a','#ff3a1a'])}); } if(Math.hypot(P.x-e.x,P.y-e.y)<46) hurtPlayer(e.dmg*.8,{x:e.x,hp:0,dead:true}); }
  if(e.mods.includes('split')&&!e.isSplit){ for(const d of [-1,1]){ const c=mkEnemyAt(e.type,e.x+d*10,e.y); c.isSplit=1; c.hp=c.maxhp=e.maxhp*.3; c.name=e.name+"'s Remnant"; c.small=1; c.vx=d*120; c.vy=-160; enemies.push(c); } } }
function mkEnemyAt(t,x,y,extra){ const e=mkEnemy(Object.assign({x:x/T,y:y/T,t,pack:1},extra||{})); e.x=x; e.y=y; return e; }
function findFloor(x,y){ const tx=Math.floor(x/T); let ty=Math.floor(y/T); for(let i=0;i<14;i++){ const v=tileAt(tx,ty+i); if(v===1||v===2) return (ty+i)*T; } return y; }
function firePillar(x,y,dmg){ AU.cast(); fx.push({t:0,dur:1.35,haz:1,upd(f){ if(f.t>.7&&f.t<1.3&&!f.h&&Math.abs(P.x-x)<11&&P.y>y-58&&P.y-P.h<y){ f.h=1; hurtPlayer(dmg,{x,hp:0,dead:true}); } if(f.t>.7&&!f.s){ f.s=1; AU.noise(.5,300,1500,1,.35,'bandpass',.3); } },
  draw(f){ const sx=x-camR.x, sy=y-camR.y; if(f.t<.7){ const a=.3+.4*Math.abs(Math.sin(f.t*18)); ectx.fillStyle=`rgba(255,120,40,${a.toFixed(2)})`; ectx.fillRect(sx-9,sy-2,18,2); }
    else { const k=1-Math.max(0,(f.t-1.15)/.2); for(let i=0;i<14;i++){ ectx.fillStyle=`rgba(255,${120+i*8},${40+i*4},${(.8*k).toFixed(2)})`; ectx.fillRect(sx-7+Math.sin(time*30+i)*2,sy-4-i*4,14-i*.6,4); } addLight(x,y-28,70,1.2*k,1,.5,.2); } }}); }
function acidPuddle(x,y,dmg){ fx.push({t:0,dur:2.6,tk:0,upd(f,dt){ f.tk-=dt; if(f.tk<=0&&Math.abs(P.x-x)<12&&Math.abs(P.y-y)<6){ f.tk=.5; hurtPlayer(dmg*.4,{x,hp:0,dead:true}); } },draw(f){ const k=1-f.t/f.dur; ectx.fillStyle=`rgba(150,220,60,${(.45*k).toFixed(2)})`; ectx.fillRect(x-camR.x-10,y-camR.y-1,20,1.5); if(Math.random()<.2) ectx.fillRect(x-camR.x-8+Math.random()*16,y-camR.y-3,1,1); }}); }
const EAI={
  hound(e,dt,c){ e.walk+=dt*Math.abs(e.vx)*.25;
    if(e.state==='pounce'){ tryHit(e,eBox(e),e.dmg); if(e.onGround&&e.vy>=0){ e.state='chase'; e.atkCd=.8; } }
    else if(c.vis&&c.adx<240&&Math.abs(c.dy)<90){ e.face=Math.sign(c.dx)||1; e.vx=approach(e.vx,c.adx>16?e.face*e.spd:0,700*dt); if(c.adx<56&&e.onGround&&e.atkCd<=0){ e.state='pounce'; e.vy=-190; e.vx=e.face*210; AU.growl(); } if(e.hitWall&&e.onGround) e.vy=-280; }
    else c.patrol(e.spd*.3);
    e.vy+=900*dt; moveBody(e,dt); },
  swarm(e,dt,c){ e.walk+=dt*20; const ag=c.vis&&c.adx<220&&Math.abs(c.dy)<160; const tx=ag?P.x+Math.sin(time*3+e.seed)*14:e.hx0==null?(e.hx0=e.x):e.hx0, ty=ag?P.y-14+Math.cos(time*4+e.seed)*10:e.hy+Math.sin(time+e.seed)*6;
    e.vx=approach(e.vx,clamp((tx-e.x)*2,-e.spd,e.spd)+Math.sin(time*9+e.seed)*30,300*dt); e.vy=approach(e.vy,clamp((ty-e.y)*2,-e.spd,e.spd)+Math.cos(time*8+e.seed)*30,300*dt);
    e.x+=e.vx*dt; e.y+=e.vy*dt; e.face=Math.sign(e.vx)||1; if(e.atkCd<=0&&overlap(eBox(e),pBox())){ hurtPlayer(e.dmg,e); e.atkCd=.7; } },
  penitent(e,dt,c){ e.walk+=dt*Math.abs(e.vx)*.16;
    if(!e.enraged&&e.hp<e.maxhp*.5&&e.state!=='spin'&&e.state!=='lash'){ e.state='lash'; e.st=1; e.vx=0; }
    if(e.state==='lash'){ e.st-=dt; if(R()<.3) bleed(e.x,e.y-16,1,-e.face,.6); if(e.st<=0){ e.enraged=1; e.spd*=1.4; e.dmg*=1.3; e.state='chase'; AU.scream(); } }
    else if(e.state==='wind'){ e.st-=dt; e.vx=0; if(e.st<=0){ e.state='spin'; e.st=1.1; e.tk=0; AU.spin(); } }
    else if(e.state==='spin'){ e.st-=dt; e.tk-=dt; e.vx=approach(e.vx,Math.sign(c.dx)*e.spd*.6,300*dt); if(e.tk<=0){ e.tk=.28; tryHit(e,{x:e.x-30,y:e.y-26,w:60,h:28},e.dmg); } if(e.st<=0){ e.state='chase'; e.atkCd=1.6; } }
    else if(c.vis&&c.adx<180&&Math.abs(c.dy)<60){ e.face=Math.sign(c.dx)||1; e.vx=approach(e.vx,c.adx>26?e.face*e.spd:0,300*dt); if(c.adx<44&&e.atkCd<=0){ e.state='wind'; e.st=.5; } }
    else c.patrol(e.spd*.3);
    e.vy+=900*dt; moveBody(e,dt); },
  spitter(e,dt,c){ if(e.ceil){ e.walk+=dt*Math.abs(e.vx)*.3; const cy=e.y-e.h; const ag=c.vis&&c.adx<220&&P.y>cy;
      if(e.state==='spit'){ e.st-=dt; e.vx=0; if(e.st<=0){ const sx=e.x, sy=e.y, t=.7; eProj({type:'acid',x:sx,y:sy,vx:(P.x-sx)/t,vy:(P.y-10-sy)/t-.5*400*t,g:400,dmg:e.dmg,r:4,life:2,acid:1}); AU.noise(.2,600,200,3,.2,'bandpass',.3); e.state='crawl'; e.atkCd=2.2; } }
      else { const want=ag?Math.sign(c.dx)*(c.adx>30?1:0):e.face*.5; e.vx=approach(e.vx,want*e.spd,200*dt); const nx=e.x+(Math.sign(e.vx)||e.face)*(e.w/2+2); if(!solidPx(nx,cy-2)||solidPx(nx,cy+4)){ e.vx=0; e.face*=-1; } e.x+=e.vx*dt; if(e.vx) e.face=Math.sign(e.vx); if(ag&&e.atkCd<=0&&c.adx<150){ e.state='spit'; e.st=.6; } }
      return; }
    e.walk+=dt*Math.abs(e.vx)*.3; if(c.vis&&c.adx<200){ e.face=Math.sign(c.dx)||1; e.vx=approach(e.vx,e.face*e.spd*1.4,500*dt); if(c.adx<14&&e.atkCd<=0){ tryHit(e,eBox(e),e.dmg); e.atkCd=.8; } } else c.patrol(e.spd*.4); e.vy+=900*dt; moveBody(e,dt); },
  knight(e,dt,c){ e.walk+=dt*Math.abs(e.vx)*.12;
    if(e.state==='combo'){ e.st+=dt; const hits=[.45,.85,1.45]; if(e.ci<3&&e.st>=hits[e.ci]){ const big=e.ci===2; tryHit(e,{x:e.face>0?e.x:e.x-(big?50:40),y:e.y-30,w:big?50:40,h:30},e.dmg*(big?1.4:1)); AU.swing(big); if(big){ shake(6); dust(e.x+e.face*30,e.y,10); AU.slam(); } e.vx=e.face*90; e.ci++; } e.vx=approach(e.vx,0,400*dt); if(e.st>=1.9){ e.state='chase'; e.atkCd=1.4; } }
    else if(c.vis&&c.adx<200&&Math.abs(c.dy)<70){ const want=Math.sign(c.dx)||1; if(want!==e.face){ e.turnT=(e.turnT||0)+dt; if(e.turnT>.4){ e.face=want; e.turnT=0; } } e.vx=approach(e.vx,c.adx>36?e.face*e.spd:0,250*dt); if(c.adx<46&&e.atkCd<=0&&want===e.face){ e.state='combo'; e.st=0; e.ci=0; AU.growl(); } }
    else c.patrol(e.spd*.3);
    e.vy+=900*dt; moveBody(e,dt); },
  nun(e,dt,c){ e.walk+=dt*Math.abs(e.vx)*.12;
    if(e.state==='cast'){ e.st-=dt; e.vx=0; if(e.st<=0){ firePillar(P.x,findFloor(P.x,P.y-4),e.dmg); e.state='chase'; e.atkCd=2.6; } }
    else if(c.vis&&c.adx<230&&Math.abs(c.dy)<120){ e.face=Math.sign(c.dx)||1;
      if(c.adx<50&&e.atkCd<1.8){ e.atkCd=2.2; AU.scream(); const x=e.x,y=e.y-14; fx.push({t:0,dur:.5,draw(f){ const k=f.t/f.dur; ectx.strokeStyle=`rgba(255,200,120,${(1-k).toFixed(2)})`; ectx.beginPath(); ectx.arc(x-camR.x,y-camR.y,k*60,0,Math.PI*2); ectx.stroke(); }}); P.vx=Math.sign(c.dx)*260; P.vy=-120; hurtPlayer(e.dmg*.4,e); }
      e.vx=approach(e.vx,c.adx<90?-e.face*e.spd:c.adx>150?e.face*e.spd:0,200*dt); if(e.atkCd<=0){ e.state='cast'; e.st=.6; } }
    else c.patrol(e.spd*.3);
    e.vy+=900*dt; moveBody(e,dt); },
  debtor(e,dt,c){ e.walk+=dt*Math.abs(e.vx)*.2; e.coinT=(e.coinT||0)-dt;
    if(!e.seen&&c.vis&&c.adx<260&&Math.abs(c.dy)<120){ e.seen=1; e.escape=15; AU.tone('triangle',1200,1800,.3,.1,.5); toast('A Gilded Debtor! Catch him before he slips away.'); }
    if(e.seen){ e.escape-=dt; if(e.escape<=0){ for(let i=0;i<20;i++) sparks(e.x,e.y-8,1,'#ffd870'); ash(e.x,e.y-8,20); e.dead=true; e.deadT=9; e.escaped=1; AU.tone('square',900,300,.6,.08,.6); toast('The Gilded Debtor escaped through a crack in the world.'); return; }
      const away=-Math.sign(c.dx)||1; e.face=away; e.vx=approach(e.vx,away*e.spd,500*dt); if(e.hitWall&&e.onGround) e.vy=-320; if(e.coinT<=0&&c.adx<200){ e.coinT=.6; dropGold(e.x,e.y-8,ri(1,3)*(1+lvlIdx)); } }
    else c.patrol(30);
    e.vy+=900*dt; moveBody(e,dt); },
  anchor(e,dt){ e.y=e.hy+Math.sin(time*1.5+e.seed)*2; },
  relicx(e,dt){ e.y=e.hy+Math.sin(time*2+e.seed)*4; }
};
/* ---------- sprites ---------- */
function drawHound(c,e){
  const pn=e.state==='pounce',wk=Math.round(Math.sin((e.walk||0)*1.2)*2);
  const p=(col,pts)=>artPoly(c,col,pts),r=(x,y,w,h,col)=>rect(c,x,y,w,h,col);
  const dark='#302c2b',mid='#655343',light='#9d8665';
  // Far legs fold through the hock instead of sliding as vertical pegs.
  p(dark,[[-6,-7],[-3,-6],[-4-wk,-3],[-2-wk,-1],[-3-wk,0],[-6-wk,-2]]);
  p(dark,[[3,-8],[5,-8],[5+wk,-3],[7+wk,-1],[4+wk,0],[3+wk,-3]]);
  p(mid,[[-10,-9],[-8,-12],[-4,-13],[0,-12],[4,-14],[7,-11],[6,-6],[2,-5],[-2,-7],[-6,-6],[-9,-7]]);
  p(light,[[-8,-11],[-5,-12],[-1,-11],[1,-10],[4,-12],[5,-10],[1,-8],[-4,-9]]);
  p(dark,[[-3,-8],[1,-7],[4,-8],[4,-5],[1,-5],[-2,-6]]);
  // Lean ribcage, heavy shoulder and tucked belly.
  r(-3,-10,.5,2,'#403a31');r(-1,-9,.5,2,'#403a31');r(1,-9,.5,2,'#403a31');
  p(mid,[[-8,-8],[-5,-7],[-6+wk,-4],[-5+wk,-2],[-3+wk,-1],[-3+wk,0],[-6+wk,0],[-8+wk,-4]]);
  p(light,[[3,-10],[5,-9],[5,-5],[pn?8:4-wk,pn?-4:-1],[pn?10:7-wk,pn?-4:-1],[pn?10:7-wk,pn?-3:0],[pn?6:2-wk,pn?-3:0],[2,-5]]);
  p(dark,[[-8,-10],[-11,-10],[-13,-13],[-12,-9],[-10,-7],[-8,-7]]);
  // Neck, folded ear, brow, long muzzle and a separate lower jaw.
  p(mid,[[4,-11],[4,-15],[7,-17],[10,-15],[11,-12],[14,-11],[14,-9],[9,-8],[6,-9]]);
  p(light,[[6,-15],[8,-16],[10,-14],[10,-12],[13,-11],[10,-10],[7,-11]]);
  p(dark,[[5,-15],[4,-18],[7,-16],[7,-13]]);
  r(9,-14,2,1,'#201c1d');r(10,-14,.5,.5,'#d0b073');r(13,-11,2,1,'#211c1c');
  r(10,-9,4,pn?2:1,'#2e1c20');r(11,-9,2,.5,'#dbccaa');
  if(pn){p(mid,[[9,-7],[13,-6],[14,-7],[14,-6],[11,-5],[8,-7]]);r(12,-7,1,1,'#dbccaa');}
}
function drawSwarm(c,e){ for(let i=0;i<6;i++){ const a=time*7+i*1.1+e.seed, x=Math.cos(a)*3.5, y=-4+Math.sin(a*1.3)*3; rect(c,x,y,1.2,1.2,'#0e0a0c'); const w=Math.sin(time*40+i)>0; rect(c,x-.8,y-(w?.8:-.4),.8,.5,'#4a4048'); rect(c,x+1,y-(w?.8:-.4),.8,.5,'#4a4048'); } }
function drawPenitent(c,e){ const wk=Math.round(Math.sin(e.walk)*2), spin=e.state==='spin';
  rect(c,-3+wk,-8,2,8,'#9a7a62'); rect(c,1-wk,-8,2,8,'#8a6a52'); c.fillStyle='#3a2a1e'; c.beginPath(); c.moveTo(-5,-12); c.lineTo(5,-12); c.lineTo(6,-3); c.lineTo(-6,-3); c.fill();
  rect(c,-4,-21,8,10,'#a8846a'); for(let i=0;i<5;i++) rect(c,-3.5+i*.3,-20+i*1.8,7,.5,'#6a1010'); c.fillStyle='#2a1e16'; c.beginPath(); c.moveTo(-4.5,-20); c.lineTo(0,-30); c.lineTo(4.5,-20); c.fill(); rect(c,0,-25,3,3,'#0a0606');
  const a=spin?time*18:(e.state==='wind'?-2.2:.6+Math.sin(e.walk)*.3); c.save(); c.translate(3,-18); c.rotate(a); rect(c,0,-.5,6,1,'#4a3020'); for(let i=0;i<5;i++) rect(c,6+i*2,-.5,1.5,1,'#5a5660'); c.fillStyle='#3a3640'; c.beginPath(); c.arc(17,0,2.5,0,Math.PI*2); c.fill(); for(let i=0;i<6;i++){ const b=i/6*Math.PI*2; rect(c,17+Math.cos(b)*3.2-.4,Math.sin(b)*3.2-.4,.8,.8,'#8a8690'); } c.restore(); }
function drawSpitter(c,e){ for(let i=0;i<5;i++){ c.fillStyle=i%2?'#5a3a3a':'#6a4444'; c.beginPath(); c.ellipse(-6+i*3,-3+Math.sin(e.walk*3+i)*.5,2.2,2.6,0,0,Math.PI*2); c.fill(); rect(c,-6.5+i*3,-.5,.5,1.5,'#3a2020'); rect(c,-5+i*3,-.5,.5,1.5,'#3a2020'); }
  c.fillStyle='#2a0606'; c.beginPath(); c.arc(8,-3,2.2,0,Math.PI*2); c.fill(); for(let i=0;i<6;i++){ const b=i/6*Math.PI*2; rect(c,8+Math.cos(b)*2-.3,-3+Math.sin(b)*2-.3,.6,.6,'#d8ccb0'); } }
function drawKnight(c,e){ const wk=Math.round(Math.sin(e.walk)*2), cmb=e.state==='combo';
  rect(c,-4+wk,-11,3,11,'#3a3a40'); rect(c,1-wk,-11,3,11,'#4a4a52'); rect(c,-4.3+wk,-7,3.6,1.5,'#6a6a72'); rect(c,.7-wk,-7,3.6,1.5,'#6a6a72');
  rect(c,-5,-24,10,13,'#7a2a24'); for(let i=0;i<4;i++) rect(c,-4,-22+i*3,8,.5,'#4a1210'); rect(c,-5,-24,10,4,'#5a5a62'); rect(c,-5,-24,10,.8,'#9a9aa2'); rect(c,-5,-16,10,2,'#4a4a52');
  c.fillStyle='#3a1a1a'; c.beginPath(); c.moveTo(-4,-12); c.lineTo(4,-12); c.lineTo(3,-4); c.lineTo(1.5,-6); c.lineTo(0,-3); c.lineTo(-1.5,-6); c.lineTo(-3,-4); c.fill();
  rect(c,-3,-31,7,7,'#5a5a62'); rect(c,-3,-31,7,.8,'#9a9aa2'); rect(c,0,-28,4,1,'#0a0606'); rect(c,1,-31,.5,3,'#0a0606'); rect(c,-5,-25,4,4,'#6a6a72');
  const hits=[.45,.85,1.45]; let a=-.8; if(cmb){ const n=hits.findIndex(h=>e.st<h); a=n<0?1:(n%2===0?(e.st>hits[n]-.25?-2.2:-.8):(1)); if(n===2) a=e.st>1.2?-2.6:1; }
  c.save(); c.translate(3,-20); c.rotate(a); rect(c,0,-1.5,5,3,'#4a4a52'); rect(c,5,-3,1.5,6,'#6a6a72'); rect(c,6.5,-2,24,4,'#8a8a92'); rect(c,6.5,-2,24,.8,'#d0ccc0'); rect(c,18,-1,4,1,'#5a1010'); c.restore(); }
function drawNun(c,e){ c.fillStyle='#1a1418'; c.beginPath(); c.moveTo(-5,-22); c.lineTo(5,-22); c.lineTo(7,0); c.lineTo(-7,0); c.fill(); rect(c,-5,-22,2,22,'#120e12');
  rect(c,-3,-26,6,5,'#c8c0b0'); rect(c,-1.5,-25,3.5,3.5,'#d8c8a0'); rect(c,-1,-21.5,.5,2,'#d8c8a0'); rect(c,1,-21.5,.5,1.2,'#d8c8a0'); rect(c,-.5,-24,1.5,.5,'#5a4a30');
  rect(c,-1,-32,2.5,6,'#e8dcc0'); rect(c,-1.5,-27,.6,2,'#e8dcc0'); rect(c,1.6,-28,.6,3,'#e8dcc0'); rect(c,-1,-16,3,2,'#d8c8a0'); }
function drawDebtor(c,e){ const wk=Math.round(Math.sin(e.walk)*2);
  rect(c,-1+wk,-5,1.5,5,'#5a5a48'); rect(c,2-wk,-5,1.5,5,'#5a5a48'); c.fillStyle='#6a6a58'; c.beginPath(); c.moveTo(-2,-5); c.lineTo(-1,-12); c.lineTo(6,-13); c.lineTo(6,-5); c.fill();
  c.fillStyle='#8a6a2a'; c.beginPath(); c.ellipse(-5,-11,7,7,0,0,Math.PI*2); c.fill(); c.fillStyle='#6a4e1e'; c.beginPath(); c.ellipse(-6,-9,5,4,0,0,Math.PI*2); c.fill(); rect(c,-5,-18,3,2,'#4a3410');
  for(let i=0;i<4;i++) rect(c,-9+i*2.5,-6+(i%2),1.5,1,'#e8c25a'); rect(c,4,-15,5,4,'#6a6a58'); rect(c,6,-12.4,3,.8,'#e8c25a'); rect(c,6.5,-14.5,1,1,'#120a0a'); rect(c,3.5,-16.5,6,1.5,'#2a2018'); }
function drawAnchor(c,e){ c.fillStyle='#2a2628'; c.beginPath(); c.moveTo(-8,0); c.lineTo(8,0); c.lineTo(5,-14); c.lineTo(-5,-14); c.fill(); rect(c,-8,-1,16,1,'#4a4448'); for(let i=-6;i<7;i+=4) rect(c,i,-10,1,1,'#6a6470'); for(let y=-14;y>-22;y-=3) rect(c,-1,y-2,2,2,'#4a4650'); }
function drawRelicx(c,e){ rect(c,-7,-14,14,12,'#8a6a2a'); rect(c,-7,-14,14,1,'#e2c88a'); rect(c,-4,-11,8,6,'#d8cbb0'); rect(c,-1,-9,2,2,'#2a0606'); for(let i=0;i<5;i++) rect(c,-6+i*3,-17,1,3,'#c9a96a'); rect(c,-7,-2,14,1,'#5a4418'); }
Object.assign(EDRAW,{hound:drawHound,swarm:drawSwarm,penitent:drawPenitent,spitter:drawSpitter,knight:drawKnight,nun:drawNun,debtor:drawDebtor,anchor:drawAnchor,relicx:drawRelicx});
function enemyEmis(e,g){ const T_=e.type;
  if(T_==='hound'){ g.fillStyle='#ff5a2a'; g.fillRect(8,-9,1,.8); }
  else if(T_==='swarm'){ g.fillStyle='rgba(255,40,30,.8)'; for(let i=0;i<3;i++) g.fillRect(Math.cos(time*7+i*2+e.seed)*3.5,-4+Math.sin(time*9+i)*3,.6,.6); }
  else if(T_==='penitent'){ g.fillStyle='#ffd0a0'; g.fillRect(1.5,-24,.8,.8); }
  else if(T_==='spitter'){ if(e.state==='spit'){ g.fillStyle='rgba(150,230,60,.8)'; g.fillRect(7,-4,2,2); } }
  else if(T_==='knight'){ g.fillStyle='#ff3a2a'; g.fillRect(1,-28,2,.8); if(e.state==='combo'){ g.fillStyle='rgba(255,230,200,.5)'; g.fillRect(0,-33,4,1); } }
  else if(T_==='nun'){ const f=.6+.4*Math.sin(time*13+e.seed); g.fillStyle=`rgba(255,180,80,${f.toFixed(2)})`; g.fillRect(-.5,-35,1.5,3); g.fillStyle='#fff2c0'; g.fillRect(0,-34,.6,1.5); if(e.state==='cast'){ g.fillStyle='rgba(255,120,40,.6)'; g.fillRect(-4,-36,8,1); } }
  else if(T_==='debtor'){ if(Math.sin(time*8+e.seed)>.6){ g.fillStyle='#fff3c0'; g.fillRect(-6+Math.random()*8,-14+Math.random()*6,1,1); } g.fillStyle='rgba(255,210,100,.5)'; g.fillRect(6,-12.4,3,.8); }
  else if(T_==='anchor'){ g.fillStyle=`rgba(255,40,30,${(.5+.4*Math.sin(time*4)).toFixed(2)})`; g.fillRect(-2,-9,4,3); }
  else if(T_==='relicx'){ g.fillStyle=`rgba(255,220,140,${(.5+.4*Math.sin(time*5)).toFixed(2)})`; g.fillRect(-1,-9,2,2); g.fillRect(-7,-14,14,.6); } }
function enemyLight(e){ if(e.type==='nun') addLight(e.x,e.y-34,60,.9,1,.6,.25); else if(e.type==='debtor') addLight(e.x,e.y-10,50,.7,1,.8,.3); else if(e.type==='relicx') addLight(e.x,e.y-10,50,.7,1,.8,.5); else if(e.type==='anchor') addLight(e.x,e.y-8,40,.6,1,.2,.1); }
