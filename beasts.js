'use strict';
/* ===== new things in the dark (v16): four foes, three marks for rare monsters, ten combinations =====
   Foes, each built to be read rather than mashed:
   - 箱喰 Coffer-Maw: a chest that was never a chest (some ordinary chests; see scares.js). Leaps at you with its lid
     open, chomps on landing. Kill it and it coughs up a reliquary.
   - 壁生 Wall-Born: hides as a seam of dark in the stone with two pale eyes. Walk close and it bursts out screaming.
     Fragile, fast, vicious.
   - 骨呼び Bonecaller: keeps its distance and raises Wretchlings out of the floor around you every few seconds (its
     hands glow green first). Kill it first or the room fills.
   - 盾番 Tithe Warden: a tower shield that turns aside every light blow from the front. Get behind it, hit it with a
     heavy blow, stun it with the Bell, or wait for the shield bash: after it bashes, the shield is down for a moment.
   Marks for rare monsters: Thorn-Hided (your blows cut you back), Frenzied (attacks faster below half life),
   Warded (a shimmering ward makes it untouchable for a moment every few seconds; wait it out). */
Object.assign(EDEF,{
  mimic:{w:20,h:18,hp:130,dmg:20,spd:70,xp:40,name:'Coffer-Maw'},
  lurker:{w:11,h:22,hp:26,dmg:16,spd:120,xp:16,name:'Wall-Born'},
  bonecaller:{w:11,h:24,hp:34,dmg:10,spd:38,xp:22,name:'Bonecaller'},
  warden:{w:16,h:28,hp:90,dmg:15,spd:34,xp:30,name:'Tithe Warden'}});
NO_RANK.add('mimic');
/* where they live (weights beside the existing ones) */
const NEWFOES={ossuary:{lurker:.8,bonecaller:.6},chapel:{lurker:1,warden:.6},warren:{warden:1.2,bonecaller:1,lurker:.7},kiln:{warden:1,bonecaller:.8,lurker:.6},breach:{warden:1,bonecaller:1,lurker:1}};
for(const d of LEVELS) if(NEWFOES[d.id]) Object.assign(d.enemies,NEWFOES[d.id]);
/* codex */
CODEX.push(
  {id:'mimic',k:'箱喰',t:'The Coffer-Maw',x:'Somebody down here learned that the living open boxes. It took the lesson to heart and grew a lid. It is patient the way only a chest can be.'},
  {id:'lurker',k:'壁生',t:'The Wall-Born',x:'The Pit grows them in its own stone, like damp. They wait inside the walls with their eyes open, because they have no lids.'},
  {id:'bonecaller',k:'骨呼び',t:'The Bonecaller',x:'An ossuary keeper who kept counting after the count was finished. He still calls the bones by name, and the small ones still come.'},
  {id:'warden',k:'盾番',t:'The Tithe Warden',x:'The Collector\'s doormen. The shield is a door from the Counting House; the debts of everyone who knocked are scratched on the inside.'});
for(const c of CODEX.slice(-4)) CX[c.id]=c;
Object.assign(TYPE_CODEX,{mimic:'mimic',lurker:'lurker',bonecaller:'bonecaller',warden:'warden'});

/* hidden Wall-Born: only the ones the level places start hidden (waves and summons come out fighting) */
let BEAST_LOAD=false;
(function(){ const o=loadLevel; loadLevel=function(idx,opt){ BEAST_LOAD=true; try{ return o(idx,opt); } finally{ BEAST_LOAD=false; } }; })();
(function(){ const o=mkEnemy; mkEnemy=function(s){ const e=o(s); if(e.type==='lurker'&&BEAST_LOAD&&!s.pack){ e.state='hide'; e.intro=true; } if(e.type==='warden') e.shieldUp=1; return e; }; })();

const EAI2={
  mimic(e,dt,c){ e.walk+=dt*4;
    if(e.state==='leap'){ tryHit(e,eBox(e),e.dmg); if(e.onGround&&e.vy>=0&&e.st<=0){ e.state='land'; e.st=.45; shake(5); AU.slam(); dust(e.x,e.y,12); AU.tone('square',140,60,.2,.18,.3); } e.st-=dt; }
    else if(e.state==='land'){ e.st-=dt; e.vx=approach(e.vx,0,600*dt); if(e.st<=0){ e.state='chase'; e.atkCd=.9; } }
    else if(e.state==='wind'){ e.st-=dt; e.vx=0; if(e.st<=0){ e.state='leap'; e.st=.15; e.vy=-300; e.vx=e.face*Math.min(240,c.adx*2.2+60); AU.growl(); } }
    else { e.face=Math.sign(c.dx)||e.face; e.vx=approach(e.vx,c.adx>30?e.face*e.spd*.5:0,300*dt); if(c.vis&&c.adx<200&&e.atkCd<=0&&e.onGround){ e.state='wind'; e.st=.42; } }
    e.vy+=900*dt; moveBody(e,dt); },
  lurker(e,dt,c){ e.walk+=dt*Math.abs(e.vx)*.25;
    if(e.state==='hide'){ e.vx=0; e.vy+=900*dt; moveBody(e,dt); if(c.vis&&c.adx<64&&Math.abs(c.dy)<44){ e.state='burst'; e.st=.3; e.intro=false; e.face=Math.sign(c.dx)||1; e.vy=-290; e.vx=e.face*190;
        if(typeof AU.shriek2==='function') AU.shriek2(.8); else AU.scream(); shake(8); for(let i=0;i<18;i++) part({x:e.x+rnd(-6,6),y:e.y-rnd(0,22),vx:rnd(-120,120),vy:rnd(-160,-20),g:400,life:rnd(.3,.7),col:pick(['#3a3236','#5a5054','#1a1416'])});
        unlockCodex('lurker'); if(typeof scareFlash==='function'&&R()<.3) scareFlash('wall'); } return; }
    if(e.state==='burst'){ e.st-=dt; tryHit(e,eBox(e),e.dmg); if(e.st<=0&&e.onGround){ e.state='chase'; e.atkCd=.35; } }
    else if(e.state==='wind'){ e.st-=dt; e.vx=approach(e.vx,0,800*dt); if(e.st<=0){ e.state='lunge'; e.st=.2; e.vx=e.face*230; e.vy=-80; } }
    else if(e.state==='lunge'){ e.st-=dt; tryHit(e,{x:e.x-6+e.face*7,y:e.y-20,w:16,h:18},e.dmg); if(e.st<=0){ e.state='chase'; e.atkCd=.55; } }
    else if(c.vis&&c.adx<220&&Math.abs(c.dy)<80){ e.face=Math.sign(c.dx)||1; e.vx=approach(e.vx,c.adx>16?e.face*e.spd:0,600*dt); if(c.adx<34&&e.atkCd<=0){ e.state='wind'; e.st=.24; } if(e.hitWall&&e.onGround) e.vy=-300; }
    else c.patrol(e.spd*.3);
    e.vy+=900*dt; moveBody(e,dt); },
  bonecaller(e,dt,c){ e.walk+=dt*Math.abs(e.vx)*.14;
    if(e.state==='raise'){ e.st-=dt; e.vx=0; if(R()<.4) part({x:e.x+e.face*6,y:e.y-16,vx:rnd(-10,10),vy:-30,g:-20,life:.5,em:true,col:'#9fe080'});
      if(e.st<=0){ const mine=enemies.filter(o=>!o.dead&&o.raisedBy===e).length; const n=Math.min(2,4-mine);
        for(let i=0;i<n;i++){ const x=P.x+(i?1:-1)*rnd(26,50); if(solidPx(x,P.y-8)) continue; const fy=findFloor(x,P.y-20); const m=mkEnemyAt('crawler',x,fy); m.raisedBy=e; m.vy=-200; m.atkCd=.7; m.stun=.3; enemies.push(m); dust(x,fy,8); for(let k=0;k<8;k++) part({x,y:fy-2,vx:rnd(-40,40),vy:rnd(-120,-40),g:300,life:.5,col:'#d8ccb0'}); }
        AU.noise(.35,600,180,2,.3,'bandpass',.4); e.state='chase'; e.atkCd=5.5; } }
    else if(c.vis&&c.adx<260&&Math.abs(c.dy)<120){ e.face=Math.sign(c.dx)||1; const want=c.adx<90?-e.face:c.adx>170?e.face:0; e.vx=approach(e.vx,want*e.spd,250*dt);
      if(e.atkCd<=0){ e.state='raise'; e.st=.9; AU.cast(); unlockCodex('bonecaller'); } }
    else c.patrol(e.spd*.3);
    e.vy+=900*dt; moveBody(e,dt); },
  warden(e,dt,c){ e.walk+=dt*Math.abs(e.vx)*.1;
    if(e.state==='wind'){ e.st-=dt; e.vx=approach(e.vx,0,400*dt); if(e.st<=0){ e.state='bash'; e.st=.25; e.vx=e.face*260; AU.swing(true); } }
    else if(e.state==='bash'){ e.st-=dt; if(!e.bashHit&&overlap({x:e.face>0?e.x:e.x-30,y:e.y-28,w:30,h:28},pBox())){ e.bashHit=1; const l0=P.life; hurtPlayer(e.dmg,e); if(P.life<l0&&!P.dead){ P.vx=e.face*320; P.vy=-180; } }
      if(e.st<=0){ e.state='rec'; e.st=.9; e.shieldUp=0; e.bashHit=0; } }
    else if(e.state==='rec'){ e.st-=dt; e.vx=approach(e.vx,0,500*dt); if(e.st<=0){ e.state='chase'; e.shieldUp=1; e.atkCd=1.4; } }
    else if(c.vis&&c.adx<200&&Math.abs(c.dy)<70){ const want=Math.sign(c.dx)||1; if(want!==e.face){ e.turnT=(e.turnT||0)+dt; if(e.turnT>.55){ e.face=want; e.turnT=0; } } else e.turnT=0;
      e.vx=approach(e.vx,c.adx>34?e.face*e.spd:0,250*dt); if(c.adx<50&&e.atkCd<=0&&want===e.face){ e.state='wind'; e.st=.55; AU.growl(); unlockCodex('warden'); } }
    else c.patrol(e.spd*.3);
    if(e.stun>0) e.shieldUp=0; else if(e.state!=='rec'&&e.state!=='bash') e.shieldUp=1;
    e.vy+=900*dt; moveBody(e,dt); }
};
Object.assign(EAI,EAI2);
/* the Warden's shield turns light blows from the front */
(function(){ const o=strike; strike=function(e,mv,id,hand,dir,mult){
  if(e.type==='warden'&&!e.dead&&e.shieldUp&&!(e.stun>0)&&e.hitId!==id&&Math.sign(P.x-e.x)===e.face&&mv.dm<1.5){ e.hitId=id; AU.clang(); sparks(e.x+e.face*9,e.y-16,8,'#fff1c8'); P.vx=-Math.sign(e.x-P.x)*140; num(e.x,e.y-e.h-6,0,'#8a8078'); freeze=Math.max(freeze,.03);
    if(!e._told){ e._told=1; toast('The Warden\'s shield turns light blows. Get behind it, hit it heavy, stun it, or wait for its bash.'); } return true; }
  return o(e,mv,id,hand,dir,mult); }; })();

/* ---------- sprites ---------- */
function drawMimic(c,e){ const open=e.state==='leap'||e.state==='wind'?1:e.state==='land'?.4:.15+.1*Math.sin(time*6); const lid=-open*1.1;
  rect(c,-10,-10,20,10,'#5a3a1e'); rect(c,-10,-10,20,1.5,'#7a5228'); rect(c,-10,-4,20,1,'#3a2410'); rect(c,-11,-10,2,10,'#2a2a30'); rect(c,9,-10,2,10,'#2a2a30');
  for(let i=-8;i<=6;i+=3) rect(c,i,-11,2,2.5,'#e8dcc0');
  c.save(); c.translate(-10,-10); c.rotate(lid); rect(c,0,-6,20,6,'#6a4422'); rect(c,0,-6,20,1.2,'#8a6230'); rect(c,-1,-6,2,6,'#2a2a30'); rect(c,19,-6,2,6,'#2a2a30'); for(let i=2;i<=17;i+=3) rect(c,i,-.5,2,2.8,'#e8dcc0'); c.restore();
  if(open>.5){ c.fillStyle='#6a0e10'; c.beginPath(); c.moveTo(-8,-11); c.quadraticCurveTo(8,-14+Math.sin(time*20)*2,14,-6); c.lineTo(12,-5); c.quadraticCurveTo(4,-10,-8,-10); c.fill(); }
  const wk=Math.sin(e.walk*3); rect(c,-8+wk,-1,2,2,'#2a1a10'); rect(c,6-wk,-1,2,2,'#2a1a10'); }
function drawLurker(c,e){ if(e.state==='hide'){ c.fillStyle='rgba(10,8,10,.85)'; c.beginPath(); c.moveTo(-3,0); c.lineTo(-1,-12); c.lineTo(-2,-20); c.lineTo(1,-24); c.lineTo(2,-14); c.lineTo(4,0); c.fill(); return; }
  const wk=Math.round(Math.sin(e.walk)*2), lu=e.state==='lunge'||e.state==='burst';
  rect(c,-3+wk,-8,1.5,8,'#2e282c'); rect(c,1.5-wk,-8,1.5,8,'#2e282c');
  c.fillStyle='#3a3236'; c.beginPath(); c.moveTo(-5,-8); c.lineTo(-3,-20); c.lineTo(4,-21); c.lineTo(5,-8); c.fill(); for(let i=0;i<4;i++) rect(c,-3+i*2,-18+i,.6,6,'#1e1a1c');
  c.fillStyle='#4a4246'; c.beginPath(); c.ellipse(2,-22,4,3.5,0,0,Math.PI*2); c.fill(); rect(c,2,-20,4,1,'#0a0606');
  c.save(); c.translate(3,-17); c.rotate(lu?-.3:.7+Math.sin(e.walk)*.4); rect(c,0,-.6,9,1.2,'#3a3236'); for(let i=0;i<3;i++) rect(c,8,-2+i*1.5,4,.6,'#d8ccb0'); c.restore(); }
function drawBonecaller(c,e){ c.fillStyle='#2a3226'; c.beginPath(); c.moveTo(-5,-20); c.lineTo(5,-20); c.lineTo(7,0); c.lineTo(-7,0); c.fill(); rect(c,-5,-20,1.5,20,'#1a2016');
  rect(c,-3,-26,6,6,'#d8ccb0'); rect(c,-1,-24,1,1,'#0a0606'); rect(c,1.5,-24,1,1,'#0a0606'); rect(c,-.5,-22,2,.6,'#0a0606'); c.fillStyle='#2a3226'; c.beginPath(); c.moveTo(-4,-25); c.lineTo(0,-31); c.lineTo(4,-25); c.fill();
  rect(c,-1,-12,9,1.2,'#5a4a30'); for(let i=0;i<5;i++) rect(c,7+i*.2,-14+i,1.5,1,'#d8ccb0'); const up=e.state==='raise'; rect(c,3,up?-24:-17,1.5,up?8:6,'#d8ccb0'); }
function drawWarden(c,e){ const wk=Math.round(Math.sin(e.walk)*2), up=e.shieldUp, bash=e.state==='bash';
  rect(c,-4+wk,-10,3,10,'#3a3a40'); rect(c,1-wk,-10,3,10,'#4a4a52');
  rect(c,-5,-24,10,14,'#5a4a3a'); rect(c,-5,-24,10,1,'#7a6a52'); for(let i=0;i<3;i++) rect(c,-4,-21+i*4,8,.6,'#3a2a1e');
  rect(c,-3,-31,7,7,'#4a4a52'); rect(c,-3,-31,7,1,'#8a8a92'); rect(c,0,-28,4,1,'#0a0606');
  const sx=up?(bash?9:6):-6, sy=up?-30:-24; c.save(); c.translate(sx,sy); c.rotate(up?0:.5); rect(c,0,0,4,26,'#4a3a26'); rect(c,0,0,4,1,'#8a7a5a'); rect(c,0,25,4,1,'#2a1e12'); for(let i=3;i<24;i+=5) rect(c,1,i,2,.8,'#2a2016'); rect(c,1.5,10,1,6,'#8a7a5a'); c.restore(); }
Object.assign(EDRAW,{mimic:drawMimic,lurker:drawLurker,bonecaller:drawBonecaller,warden:drawWarden});
(function(){ const o=enemyEmis; enemyEmis=function(e,g){ const T_=e.type;
  if(T_==='lurker'){ const a=e.state==='hide'?.35+.25*Math.sin(time*2+e.seed):1; g.fillStyle=`rgba(230,230,255,${a.toFixed(2)})`; g.fillRect(e.state==='hide'?-1:3,e.state==='hide'?-18:-23,1,1); g.fillRect(e.state==='hide'?1:5,e.state==='hide'?-18:-23,1,1); return; }
  if(T_==='mimic'){ if(e.state!=='land'){ g.fillStyle='#ffd27a'; g.fillRect(-6,-9,1,1); g.fillRect(4,-9,1,1); } return; }
  if(T_==='bonecaller'){ g.fillStyle='#9fe080'; g.fillRect(-1,-24,1,1); g.fillRect(1.5,-24,1,1); if(e.state==='raise'){ g.fillStyle='rgba(150,240,110,.7)'; g.fillRect(2,-26,4,4); } return; }
  if(T_==='warden'){ g.fillStyle='#ff8a3a'; g.fillRect(1,-28,2,.8); if(e.state==='wind'){ g.fillStyle='rgba(255,230,200,.6)'; g.fillRect(6,-32,4,1); } return; }
  return o(e,g); }; })();
(function(){ const o=enemyLight; enemyLight=function(e){ if(e.type==='bonecaller'&&e.state==='raise') addLight(e.x,e.y-20,50,.8,.5,1,.4); return o(e); }; })();

/* ---------- three new marks for rare monsters ---------- */
Object.assign(MODS,{thorn:'Thorn-Hided',frenzy:'Frenzied',warded:'Warded'}); BASE_MODS.push('thorn','frenzy','warded');
(function(){ const o=strike; strike=function(e,mv,id,hand,dir,mult){ const h0=e.hp; const r=o(e,mv,id,hand,dir,mult);
  if(r&&e.mods&&e.mods.includes('thorn')&&e.hp<h0&&!P.dead){ const back=Math.min((h0-e.hp)*.1,e.dmg*.5); if(back>=1){ P.life-=back; num(P.x,P.y-30,Math.round(back),'#c07a50'); if(P.life<=0) die(); } }
  return r; }; })();
(function(){ const o=dmgEnemy; dmgEnemy=function(e,d,...rest){ if(e&&e.mods&&e.mods.includes('warded')&&e.wardOn&&!e.dead){ AU.clang(); sparks(e.x,e.y-e.h/2,4,'#9ad0ff'); num(e.x,e.y-e.h-6,0,'#9ad0ff'); return; } return o(e,d,...rest); }; })();
(function(){ const o=updEnemy; updEnemy=function(e,dt){ o(e,dt); if(e.dead||!e.mods) return;
  if(e.mods.includes('frenzy')&&e.hp<e.maxhp*.5){ e.atkCd-=dt*.8; if(!e.frenzied){ e.frenzied=1; e.spd*=1.3; AU.growl(); } }
  if(e.mods.includes('warded')){ e.wardT=(e.wardT==null?rnd(2,5):e.wardT)-dt; if(e.wardT<=0){ e.wardOn=!e.wardOn; e.wardT=e.wardOn?1.4:5; if(e.wardOn) AU.tone('sine',880,1320,.3,.06,.5); } } }; })();
(function(){ const o=drawEnemies; drawEnemies=function(){ o(); for(const e of enemies){ if(e.dead||!e.wardOn) continue; const sx=e.x-camR.x, sy=e.y-e.h/2-camR.y; ectx.strokeStyle=`rgba(150,200,255,${(.5+.3*Math.sin(time*12)).toFixed(2)})`; ectx.lineWidth=1; ectx.beginPath(); ectx.ellipse(sx,sy,e.w*.9,e.h*.7,0,0,Math.PI*2); ectx.stroke(); } }; })();

/* ---------- ten new combinations ---------- */
const NEW_COMBOS=[
  {id:'pyre',a:'holy',b:'fire',name:'Pyre of Saints',jp:'聖火',tier:'S',d:'A Sanctified foe set alight becomes a pillar of holy fire: everything near it burns, and the light mends you.',
    fn(e,v){ const [cx,cy]=ctr(e); judgement(e.x,e.y,v*2.4+wAvg()*1,52,false); for(const o of [e].concat(live(cx,cy,60,e))) setBurn(o,v*.6+wAvg()*.15); P.life=Math.min(P.stats.life,P.life+P.stats.life*.05); burst(cx,cy,24,'#ffe0a0',150,-60); }},
  {id:'septic',a:'poison',b:'blood',name:'Septic Wound',jp:'敗血',tier:'S',d:'Rot gets into an open wound: the bleeding doubles and the rot climbs to its full five stacks at once.',
    fn(e,v){ const s=stOf(e); if(s.bleed){ s.bleed.dps*=2; s.bleed.t=4; } else addBleed(e,v*.4+wAvg()*.1,2); const r=s.rot; s.rot={t:4,dps:(r?r.dps:v*.4)*2.2+wAvg()*.1,acc:0,tk:.4,n:5}; burst(e.x,e.y-e.h/2,16,'#8a2a40',90,40); }},
  {id:'blizzard',a:'cold',b:'wind',name:'Blizzard',jp:'吹雪',tier:'A',d:'The wind carries the frost: every foe near the target is chilled hard, and those already chilled freeze.',
    fn(e,v){ const [cx,cy]=ctr(e); for(const o of [e].concat(live(cx,cy,100,e))){ const s=stOf(o); if(s.chill||o===e) freezeFoe(o,1.6); else s.chill={t:3,n:2}; hurt(o,v*.6*(1-resOf(o,'cold')),Math.sign(o.x-cx)||1,90); } for(let i=0;i<30;i++) part({x:cx+rnd(-60,60),y:cy+rnd(-30,20),vx:P.face*rnd(80,200),vy:rnd(-20,20),g:0,life:rnd(.4,.8),em:true,col:'#e0f4ff'}); }},
  {id:'pyrebone',a:'fire',b:'bone',name:'Bonefire',jp:'骨焚',tier:'A',d:'Brittle bones catch fire and burst: burning shards fly out from the foe into everything around it.',
    fn(e,v){ const n=stOf(e).brittle?stOf(e).brittle.n:1; clearEl(e,'bone'); splinter(e,v*.8+wAvg()*.4,6+n*2,false); for(const o of live(e.x,e.y-e.h/2,70,e)) setBurn(o,v*.4); burst(e.x,e.y-e.h/2,18,'#ff9a4a',160,60); }},
  {id:'blackice',a:'cold',b:'shadow',name:'Black Ice',jp:'黒氷',tier:'A',d:'A Marked foe frozen solid: the Mark sinks into the ice, and when the foe dies the ice bursts and freezes everything close.',
    fn(e,v){ freezeFoe(e,2); e.blackIce=v+wAvg()*.4; burst(e.x,e.y-e.h/2,12,'#6a7aa0',80,0); }},
  {id:'bonestorm',a:'bone',b:'wind',name:'Bone Storm',jp:'骨嵐',tier:'A',d:'The wind tears splinters off the foe and drives them ahead of you in a volley.',
    fn(e,v){ const [cx,cy]=ctr(e); const dir=P.face; for(let i=0;i<9;i++){ const a=rnd(-.35,.35); projs.push({type:'shard',from:'p',x:cx,y:cy,vx:Math.cos(a)*360*dir,vy:Math.sin(a)*360,g:60,dmg:v*.7+wAvg()*.3,r:3,life:.6,hits:new Set([e]),kb:80}); } AU.noise(.3,3000,800,1,.25,'bandpass',.3); }},
  {id:'galvanic',a:'shock',b:'bone',name:'Marrowspark',jp:'骨雷',tier:'B',d:'Lightning runs along the marrow: it jumps to every Brittle foe nearby and shatters a stack on each.',
    fn(e,v){ const [cx,cy]=ctr(e); const tg=live(cx,cy,140,e).filter(o=>hasSt(o,'brittle')); for(const o of tg){ const [ox,oy]=ctr(o); zap(cx,cy,ox,oy,null,1); hurt(o,(v+wAvg()*.35)*(1-resOf(o,'shock')),Math.sign(o.x-cx)||1,40); const b=stOf(o).brittle; if(b) b.n=Math.max(0,b.n-1); } if(!tg.length) hurt(e,v*.8,P.face,40); AU.tone('square',2400,800,.12,.06,.3); }},
  {id:'bog',a:'water',b:'poison',name:'Bog',jp:'沼',tier:'B',d:'Water spreads the poison into a sucking pool that slows and rots whatever stands in it.',
    fn(e,v){ const [cx,cy]=ctr(e); addCloud(cx,e.y-4,52,v*.45+wAvg()*.1,3.4,[70,110,60]); for(const o of live(cx,cy,60)) { const s=stOf(o); s.soak={t:3}; } }},
  {id:'sacrament',a:'holy',b:'blood',name:'Sacrament',jp:'聖餐',tier:'B',d:'Holy on an open wound: the blood is blessed, the wound burns white, and you drink twice as much of it.',
    fn(e,v){ const b=stOf(e).bleed; const n=(b?b.dps*b.t:0)*.6+v*1.2; hurt(e,n+wAvg()*.4,P.face,60); P.life=Math.min(P.stats.life,P.life+n*.3); burst(e.x,e.y-e.h/2,14,'#fff0d0',100,-40); }},
  {id:'rest',a:'holy',b:'bone',name:'Requiem',jp:'鎮魂',tier:'F',d:'Holy lays the bones to rest: every Brittle stack is cleansed from the foe, and the second hit loses its type.',
    fn(e,v,ctx){ clearEl(e,'bone'); clearEl(e,'holy'); ctx.cancel=true; burst(e.x,e.y-e.h/2,10,'#f0ead8',60,-30); }}
];
for(const c of NEW_COMBOS){ COMBOS.push(c); COMBO_BY[c.a+'+'+c.b]=c; COMBO_BY[c.b+'+'+c.a]=c; }
/* Black Ice: the frozen Marked foe bursts on death */
(function(){ const o=killEnemy; killEnemy=function(e,dir,crit){ const bi=!e.dead&&e.blackIce; o(e,dir,crit); if(bi&&e.dead){ const [cx,cy]=ctr(e); for(const x of live(cx,cy,70,e)){ freezeFoe(x,1.8); hurt(x,bi*(1-resOf(x,'cold')),Math.sign(x.x-cx)||1,100); } burst(cx,cy,26,'#a0b8ff',200,0); AU.noise(.3,5000,1200,2,.3,'bandpass',.3); } }; })();
