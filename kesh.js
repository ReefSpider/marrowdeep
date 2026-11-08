'use strict';
/* ===== the prologue (v24): the walls of Kesh =====
   The same hand-built lesson walk (teach.js), now the last war: you and your brother Cassian storm Kesh side by side.
   Cassian fights beside you (he can't die here, and the lessons are still yours to learn). The defenders are men of
   Kesh, not the dead. At the end the King's rider brings an order: burn the granaries. You refuse. Cassian does it
   without a word. Then the betrayal, in pages (story2.js), and the road home. */
const inKesh=()=>L&&L.def&&L.def.id==='wall';
const KESH_NAME={ghoul:'Kesh Spearman',archer:'Kesh Archer',hound:'Kesh War-Dog',husk:'Kesh Shieldman'};
(function(){ const o=mkEnemy; mkEnemy=function(s){ const e=o(s); if(inKesh()&&KESH_NAME[e.type]){ e.name=(e.champ?pick(['Grim','Scarred','Veteran'])+' ':'')+KESH_NAME[e.type]; e.kesh=1; } return e; }; })();
/* men of Kesh: sand-coloured coats, kettle helms, round shields */
function keshMan(c,e,arm){ const wk=Math.round(Math.sin(e.walk||0)*2); rect(c,-3+wk,-9,2,9,'#4a3a28'); rect(c,1-wk,-9,2,9,'#4a3a28'); rect(c,-5,-19,10,10,'#a08860'); rect(c,-5,-19,10,1,'#d2bd82'); rect(c,-5,-14,10,1,'#6a4e2a');
  rect(c,-3,-24,6,5,'#b08a6a'); rect(c,-4,-26,8,2,'#6a6460'); rect(c,-2,-27,4,1,'#8a8478'); rect(c,1,-22,1,1,'#120c0c'); rect(c,-2,-20,4,1,'#2a1a10');
  if(arm==='spear'){ const th=e.state==='lunge'||e.state==='thrust'; c.save(); c.translate(3,-15); c.rotate(e.state==='wind'?-.3:0); rect(c,th?6:0,-.5,22,1,'#5a3d27'); rect(c,th?27:21,-1.5,4,3,'#cfc6b2'); c.restore(); }
  else if(arm==='bow'){ c.strokeStyle='#5a3d27'; c.lineWidth=1; c.beginPath(); c.arc(4,-15,7,-1.2,1.2); c.stroke(); rect(c,4,-21,1,12,'rgba(220,210,190,.5)'); }
  else if(arm==='shield'){ c.fillStyle='#6a4e2a'; c.beginPath(); c.arc(6,-14,7,0,7); c.fill(); c.fillStyle='#d2bd82'; c.beginPath(); c.arc(6,-14,2,0,7); c.fill(); rect(c,-8,-16,6,1,'#cfc6b2'); } }
for(const [t,arm] of [['ghoul','spear'],['archer','bow'],['husk','shield']]){ const o=EDRAW[t]; EDRAW[t]=(c,e)=>e.kesh?keshMan(c,e,arm):o(c,e); }
{ const o=EDRAW.hound; EDRAW.hound=(c,e)=>{ o(c,e); if(e.kesh){ rect(c,-4,-8,8,2,'#a08860'); } }; }

/* ---------- Cassian, at your shoulder ---------- */
let CAS=null;
const CAS_LINES=['Left! On your left!','With you, brother.','Keep going. I\'ve got your back.','That\'s the gate. Through it!','Father\'s watching from the hill. Show him.','Don\'t wait for me.'];
(function(){ const o=loadLevel; loadLevel=function(idx,opt){ const r=o(idx,opt); CAS=inKesh()?{x:P.x-30,y:P.y,vx:0,vy:0,face:1,on:true,atk:0,atkT:0,lineT:6,walk:0,onGround:false,w:10,h:28}:null; return r; }; })();
function casBox(){ return {x:CAS.x-5,y:CAS.y-28,w:10,h:28}; }
function updCas(dt){ if(!CAS||!inKesh()||mode!=='play') return; const c=CAS; c.atkT-=dt; c.lineT-=dt;
  const foe=enemies.filter(e=>!e.dead&&!e.intro&&!e.boss&&Math.abs(e.x-c.x)<150&&Math.abs(e.y-c.y)<50).sort((a,b)=>Math.abs(a.x-c.x)-Math.abs(b.x-c.x))[0];
  let tx=P.x-P.face*26; if(foe&&Math.abs(foe.x-P.x)<200) tx=foe.x-Math.sign(foe.x-c.x||1)*16;
  const dx=tx-c.x; c.face=foe?Math.sign(foe.x-c.x)||c.face:Math.sign(P.x-c.x)||c.face; c.vx=approach(c.vx,Math.abs(dx)>6?Math.sign(dx)*Math.min(150,Math.abs(dx)*3):0,700*dt);
  if(c.onGround&&(c.hitWall||P.y<c.y-40&&Math.abs(P.x-c.x)<60)) c.vy=-360;
  if(Math.hypot(P.x-c.x,P.y-c.y)>320||c.y>L.h*T){ c.x=P.x-P.face*30; c.y=P.y; c.vx=c.vy=0; ash(c.x,c.y-14,10); }
  c.vy+=900*dt; moveBody(c,dt); c.walk+=dt*Math.abs(c.vx)*.15;
  if(foe&&Math.abs(foe.x-c.x)<28&&Math.abs(foe.y-c.y)<30&&c.atkT<=0){ c.atkT=.75; c.atk=.25; AU.swing(false); dmgEnemy(foe,Math.round(foe.maxhp*.18+3),false,c.face,90,false); }
  if(c.atk>0) c.atk-=dt;
  if(c.lineT<=0&&foe){ c.lineT=rnd(9,15); caption(pick(CAS_LINES),'カシアン'); setTimeout(()=>caption(''),1800); } }
(function(){ const o=update; update=function(dt){ o(dt); updCas(dt); }; })();
function drawCas(g){ const c=CAS, wk=Math.round(Math.sin(c.walk)*2), air=!c.onGround;
  rect(g,-3+wk,-10,2,10,'#24242a'); rect(g,1-wk,-10,2,10,'#2c2c32'); rect(g,-5,-22,10,12,'#2a2a32'); rect(g,-5,-22,10,1,'#6a6a7a'); rect(g,-5,-17,10,1,'#b8913a'); rect(g,-1,-21,2,10,'#1a1a20');
  rect(g,-3,-28,6,6,'#e0c8a8'); rect(g,-4,-30,8,3,'#e8d090'); rect(g,-5,-28,2,4,'#e8d090'); rect(g,-6,-25,2,5,'#d8c080'); rect(g,1,-26,1,1,'#2a1a10'); rect(g,-1,-24,3,1,'#b08070');
  g.save(); g.translate(4,-18); g.rotate(c.atk>0?.9-c.atk*6:air?-.8:.5); rect(g,0,-1,16,2,'#d8d4cc'); rect(g,-1,-2,3,4,'#b8913a'); g.restore(); }
(function(){ const o=drawEnemies; drawEnemies=function(){ o(); if(CAS&&inKesh()){ blit(g=>drawCas(g),CAS.x,CAS.y,CAS.face); } }; })();

/* ---------- the opening card, and the order at the end ---------- */
openingCut=function(){ L.redHour=0; const card=()=>{ mode='card'; showCard({title:'Prologue — The Walls of Kesh',jp:'序章　ケシュの城壁',body:'The last war. Your sword broke on the first gate. A Kesh captain lies ahead who won\'t need his. Cassian is already on the wall.',buttons:[{label:'Go',fn:()=>{ hideCard(); mode='play'; hud.hidden=false; bark('bare',true); }}]}); };
  if(!storyPlay('opening',card)) card(); };
redHourCut=function(){ L.redDone=true; L.noExit=true; P.vx=0; P.attack=null; for(const e of enemies) if(!e.dead) e.stun=99;
  const rider={x:P.x+180,y:P.y}; const fire=()=>{ for(let i=0;i<40;i++) part({x:camR.x+rnd(W*.4,W),y:camR.y+rnd(H*.3,H*.8),vx:rnd(-20,20),vy:rnd(-80,-20),g:-30,life:rnd(.8,1.6),em:true,col:pick(['#ffd27a','#ff8a3a','#ff4a2a'])}); };
  playCut([
    {dur:2.2,cap:'Kesh fell in a single night.',jp:'ケシュは一夜で落ちた。',cam:{x:P.x+80,y:P.y-60},fn:()=>{ AU.setTension(.5); spawnBG('fireball'); }},
    {dur:3.4,cap:'The King\'s rider brought an order, sealed: burn the granaries.',jp:'王命：穀倉を焼け。',cam:{x:P.x+120,y:P.y-40},fn:()=>{ AU.tone('square',330,330,.4,.05,.3); }},
    {dur:3,cap:'You refused. There were children in the lower town.',jp:'断った。',zoom:1.2,cam:{x:P.x,y:P.y-24},fn:()=>cutIn('hero','','断',1.4)},
    {dur:3.6,cap:'Cassian did it without a word.',jp:'カシアンは黙って火を放った。',zoom:1.1,cam:{x:P.x+140,y:P.y-50},fn:()=>{ AU.boom(.8); spawnBG('fireball'); spawnBG('fireball'); },tick:(dt)=>{ fire(); shake(1); }},
    {dur:3.2,cap:'Nobody sang about that.',jp:'誰も歌わなかった。',cam:{x:P.x+100,y:P.y-60},tick:()=>fire()},
    {dur:1,cap:'',fade:0}
  ],()=>{ fadeTarget=1; const go=()=>{ lvlIdx=0; goLevel(1); }; if(!storyPlay('prologue',go)) go(); }); };

/* Kesh's defenders are men, not the Host: their deaths don't fill the Codex with the dead, and the Count's old stone stays out */
(function(){ const o=unlockCodex; unlockCodex=function(id){ if(inKesh()) return false; return o(id); }; })();
if(typeof STONES!=='undefined') STONES.wall=[];
