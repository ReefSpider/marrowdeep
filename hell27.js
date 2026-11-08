'use strict';
/* ===== v27: the Ossuary Stair goes to Hell =====
   BT: "the ossuary stair needs to be more hellish, fire and demons; save this artwork for the higher levels".
   - The Ossuary Stair and the Cradle below it are now the Burning Stair: basalt, a furnace mouth in the dark, embers,
     fire on the floor, and three demons:
       Imp           flies, keeps its distance and spits fireballs that set the floor alight
       Hellhound     fast, lunges, leaves a line of fire where it runs
       Horned Fiend  big and slow; it raises both fists and brings them down in a ring of fire
   - The old bone ossuary's look (palette and bone ambience) moves down to the Breach, the deepest level before the Field. */
EDEF.imp={w:10,h:12,hp:24,dmg:8,spd:110,xp:12,fly:1,name:'Imp'};
EDEF.hellhound={w:16,h:12,hp:36,dmg:10,spd:150,xp:13,name:'Hellhound'};
EDEF.fiend={w:18,h:32,hp:120,dmg:20,spd:32,xp:30,name:'Horned Fiend'};
CODEX.push({id:'imp',k:'小鬼',t:'Imps',x:'Small, quick and delighted with themselves. They have been waiting a long time for someone to throw fire at.'},
  {id:'hellhound',k:'地獄犬',t:'Hellhounds',x:'The Kennelmaster\'s hounds were bred down here first. These are the ones he couldn\'t keep.'},
  {id:'fiend',k:'角の悪鬼',t:'Horned Fiends',x:'They carry the Stair\'s furnaces up from below on their backs, and they do not like to be interrupted.'});
for(const c of CODEX.slice(-3)) CX[c.id]=c;
for(const t of ['imp','hellhound','fiend']) TYPE_CODEX[t]=t;

let HELLP=[];
function hellBolt(x,y,tx,ty,dmg){ const d=Math.hypot(tx-x,ty-y)||1, sp=170; HELLP.push({x,y,vx:(tx-x)/d*sp,vy:(ty-y)/d*sp,dmg,life:2.6}); AU.noise&&AU.noise(.2,900,300,2,.22,'lowpass',.3); }
(function(){ const o=update; update=function(dt){ o(dt); if(!L||mode!=='play') return;
  for(const b of HELLP){ b.life-=dt; b.x+=b.vx*dt; b.y+=b.vy*dt; if(R()<.6) part({x:b.x,y:b.y,vx:rnd(-10,10),vy:rnd(-30,0),g:-20,life:.3,em:true,col:pick(['#ffd27a','#ff8a3a'])});
    if(!P.dead&&Math.abs(P.x-b.x)<7&&b.y>P.y-P.h&&b.y<P.y+2){ b.life=0; hurtPlayer(b.dmg,{x:b.x,hp:0,dead:true}); foeFire(b.x,P.y-2,Math.max(2,b.dmg*.35),2); }
    else if(solidPx(b.x,b.y)){ b.life=0; foeFire(b.x,b.y-4,Math.max(2,b.dmg*.35),2.5); for(let i=0;i<8;i++) part({x:b.x,y:b.y,vx:rnd(-80,80),vy:rnd(-120,-20),g:400,life:.4,em:true,col:'#ff8a3a'}); } }
  HELLP=HELLP.filter(b=>b.life>0); }; })();
(function(){ const o=loadLevel; loadLevel=function(i,opt){ HELLP=[]; return o(i,opt); }; })();
(function(){ const o=drawHazards; drawHazards=function(){ o(); for(const b of HELLP){ const sx=Math.round(b.x-camR.x), sy=Math.round(b.y-camR.y); ectx.fillStyle='rgba(255,140,50,.9)'; ectx.fillRect(sx-2,sy-2,4,4); ectx.fillStyle='rgba(255,240,180,.95)'; ectx.fillRect(sx-1,sy-1,2,2); addLight(b.x,b.y,50,.9,1,.5,.2); } }; })();

const hgrav=(e,dt)=>{ e.vy+=900*dt; moveBody(e,dt); };
EAI.imp=function(e,dt,c){ e.walk+=dt*12; if(e.hy==null) e.hy=e.y;
  if(e.state==='cast'){ e.st-=dt; e.vx*=.9; e.vy*=.9; e.x+=e.vx*dt; e.y+=e.vy*dt; if(e.st<=0){ hellBolt(e.x,e.y-6,P.x,P.y-12,e.dmg); e.state='chase'; e.atkCd=rnd(2.2,3.2); } return; }
  const side=Math.sign(e.x-P.x)||1, tx=P.x+side*rnd(80,100), ty=P.y-60+Math.sin(time*2.3+e.seed)*14;
  e.vx=approach(e.vx,clamp((tx-e.x)*2,-e.spd,e.spd),360*dt); e.vy=approach(e.vy,clamp((ty-e.y)*2,-e.spd,e.spd),360*dt); e.face=Math.sign(c.dx)||1;
  if(!c.vis||Math.hypot(c.dx,c.dy)>320){ e.vx*=.95; e.vy=approach(e.vy,(e.hy-e.y),120*dt); }
  e.x+=e.vx*dt; e.y+=e.vy*dt; if(solidPx(e.x,e.y-4)){ e.x-=e.vx*dt; e.y-=e.vy*dt; e.vx*=-.5; e.vy*=-.5; }
  if(c.vis&&e.atkCd<=0&&Math.hypot(c.dx,c.dy)<240){ e.state='cast'; e.st=.55; unlockCodex('imp'); } };
EAI.hellhound=function(e,dt,c){ e.walk+=dt*Math.abs(e.vx)*.12;
  if(e.state==='wind'){ e.st-=dt; e.vx=approach(e.vx,0,600*dt); if(e.st<=0){ e.state='lunge'; e.st=.5; e.bit=0; e.vx=e.face*330; e.vy=-160; AU.roar&&AU.roar(); } }
  else if(e.state==='lunge'){ e.st-=dt; e.fT=(e.fT||0)-dt; if(e.fT<=0&&e.onGround){ e.fT=.14; foeFire(e.x,e.y-2,Math.max(2,e.dmg*.25),1.4); } { const bx={x:e.x-8,y:e.y-12,w:16,h:12}; if(!e.bit&&overlap(bx,pBox())){ e.bit=1; tryHit(e,bx,e.dmg); } } if(e.st<=0&&e.onGround){ e.state='chase'; e.atkCd=rnd(1.6,2.4); } }
  else if(c.vis&&c.adx<260&&Math.abs(c.dy)<70){ e.face=Math.sign(c.dx)||1; e.vx=approach(e.vx,e.face*e.spd,500*dt); if(c.adx<110&&e.atkCd<=0){ e.state='wind'; e.st=.35; unlockCodex('hellhound'); } }
  else c.patrol(e.spd*.4);
  hgrav(e,dt); };
EAI.fiend=function(e,dt,c){ e.walk+=dt*Math.abs(e.vx)*.08;
  if(e.state==='raise'){ e.st-=dt; e.vx=0; if(e.st<=0){ e.state='slam'; e.st=.45; AU.slam(); shake(6); const x=e.x+e.face*16; tryHit(e,{x:x-22,y:e.y-26,w:44,h:26},e.dmg); for(const d of [-1,1]) for(let k=1;k<=4;k++) setTimeout(()=>{ if(!e.dead) foeFire(x+d*k*14,e.y-2,Math.max(3,e.dmg*.3),2.4); },k*90);
      for(let i=0;i<16;i++) part({x,y:e.y-2,vx:rnd(-160,160),vy:rnd(-200,-40),g:600,life:.6,em:true,col:pick(['#ffd27a','#ff8a3a','#3a2420'])}); } }
  else if(e.state==='slam'){ e.st-=dt; if(e.st<=0){ e.state='chase'; e.atkCd=rnd(2.4,3.2); } }
  else if(c.vis&&c.adx<220&&Math.abs(c.dy)<60){ e.face=Math.sign(c.dx)||1; e.vx=approach(e.vx,c.adx>34?e.face*e.spd:0,200*dt); if(c.adx<56&&e.atkCd<=0){ e.state='raise'; e.st=.75; unlockCodex('fiend'); } }
  else c.patrol(e.spd*.5);
  hgrav(e,dt); };
/* the fiend doesn't flinch from light blows */
(function(){ const o=dmgEnemy; dmgEnemy=function(e,d,crit,dir,kb,heavy,launch,stun){ if(e&&e.type==='fiend'&&!heavy){ kb=0; stun=0; } return o(e,d,crit,dir,kb,heavy,launch,stun); }; })();

function dImp(c,e){ const fl=Math.sin(e.walk), up=e.state==='cast';
  c.fillStyle='#2a0a0c'; c.beginPath(); c.moveTo(-2,-8); c.lineTo(-11,-12-fl*5); c.lineTo(-9,-6); c.lineTo(-6,-8); c.lineTo(-4,-4); c.fill(); c.beginPath(); c.moveTo(2,-8); c.lineTo(11,-12+fl*5); c.lineTo(9,-6); c.lineTo(6,-8); c.lineTo(4,-4); c.fill();
  rect(c,-3,-9,6,7,'#8a2a1c'); rect(c,-3,-9,6,1,'#b04a2c'); rect(c,-3,-14,6,5,'#9a3220'); rect(c,-4,-16,1,3,'#e8d8b8'); rect(c,3,-16,1,3,'#e8d8b8'); rect(c,-5,-17,1,1,'#e8d8b8'); rect(c,4,-17,1,1,'#e8d8b8');
  rect(c,-2,-12,1,1,'#ffd27a'); rect(c,1,-12,1,1,'#ffd27a'); rect(c,-1,-10,3,1,'#1a0204'); rect(c,-2,-2,1,3,'#5a1a14'); rect(c,1,-2,1,3,'#5a1a14'); rect(c,3,-3,4,1,'#5a1a14'); rect(c,6,-4,1,1,'#5a1a14');
  if(up){ rect(c,3,-15,3,3,'#ffd27a'); } }
function dHellhound(c,e){ const wk=Math.round(Math.sin(e.walk)*2), lunge=e.state==='lunge';
  rect(c,-8,-10,15,6,'#1e0e0e'); rect(c,-8,-10,15,1,'#3a1a14'); for(let i=-6;i<6;i+=3) rect(c,i,-11-((i+6)%2),1,2,'#ff8a3a');
  rect(c,5,-13,6,6,'#1e0e0e'); rect(c,10,-11,3,3,'#1e0e0e'); rect(c,8,-12,1,1,'#ffd27a'); rect(c,11,-9,2,1,'#e8d8b8'); rect(c,6,-15,1,2,'#1e0e0e'); rect(c,8,-15,1,2,'#1e0e0e');
  rect(c,-7+wk,-4,2,4,'#1e0e0e'); rect(c,-3-wk,-4,2,4,'#1e0e0e'); rect(c,2+wk,-4,2,4,'#1e0e0e'); rect(c,5-wk,-4,2,4,'#1e0e0e'); rect(c,-11,-10-(lunge?2:0),3,2,'#1e0e0e'); rect(c,-13,-12-(lunge?2:0),2,2,'#ff8a3a');
  if(e.state==='wind') rect(c,6,-14,4,1,'#ff5a2a'); }
function dFiend(c,e){ const wk=Math.round(Math.sin(e.walk)*2), up=e.state==='raise', sl=e.state==='slam';
  rect(c,-6+wk,-12,5,12,'#2a1210'); rect(c,1-wk,-12,5,12,'#2a1210'); rect(c,-7+wk,-1,6,1,'#120808'); rect(c,1-wk,-1,6,1,'#120808');
  rect(c,-9,-28,18,16,'#4a1a14'); rect(c,-9,-28,18,1,'#6a2a1c'); for(let y=-26;y<-13;y+=4) rect(c,-6,y,12,1,'#3a1210'); rect(c,-1,-26,2,12,'#ff6a2a');
  rect(c,-5,-34,10,7,'#5a2016'); rect(c,-3,-31,2,2,'#ffd27a'); rect(c,2,-31,2,2,'#ffd27a'); rect(c,-3,-28,7,1,'#1a0204'); for(let t=-2;t<4;t+=2) rect(c,t,-28,1,1,'#e8d8b8');
  c.fillStyle='#d8c8a8'; c.beginPath(); c.moveTo(-5,-33); c.quadraticCurveTo(-13,-38,-10,-46); c.lineTo(-8,-38); c.lineTo(-3,-34); c.fill(); c.beginPath(); c.moveTo(5,-33); c.quadraticCurveTo(13,-38,10,-46); c.lineTo(8,-38); c.lineTo(3,-34); c.fill();
  const ay=up?-44:sl?-6:-24; rect(c,-12,Math.min(ay,-24),4,Math.abs(ay+24)+10,'#4a1a14'); rect(c,8,Math.min(ay,-24),4,Math.abs(ay+24)+10,'#4a1a14'); rect(c,-13,ay-2,6,5,'#3a1210'); rect(c,7,ay-2,6,5,'#3a1210');
  if(up){ ectx.fillStyle='rgba(255,120,40,.6)'; ectx.fillRect(-12,ay-4,4,2); ectx.fillRect(8,ay-4,4,2); } }
Object.assign(EDRAW,{imp:dImp,hellhound:dHellhound,fiend:dFiend});
(function(){ const o=mkEnemy; mkEnemy=function(s){ const e=o(s); if(e.type==='imp'){ e.hy=e.y; e.fly=true; } return e; }; })();
(function(){ const o=enemyLight; enemyLight=function(e){ if(!e.dead&&(e.type==='imp'||e.type==='hellhound'||e.type==='fiend')) addLight(e.x,e.y-e.h/2,e.type==='fiend'?70:45,.7,1,.45,.2); return o(e); }; })();

/* the Burning Stair */
PALS.hellstair={sky:['#0a0405','#3a0c0a','#120506'],shaft:'rgba(255,90,40,',stone:['#241414','#2c1817','#1e1010','#341c1a'],mortar:'#0e0606',cap:'#4a2420',hi:'#8a3a28',amb:[.46,.26,.22],motif:'furnace'};
(function(){ const oss=LEVELS.find(d=>d.id==='ossuary'), mom=LEVELS.find(d=>d.id==='mother'), br=LEVELS.find(d=>d.id==='breach');
  if(oss) Object.assign(oss,{pal:'hellstair',env:'fire',name:'The Burning Stair',jp:'燃える階段',enemies:{imp:3,hellhound:3,fiend:1.2,husk:2,penitent:1.2,bonecaller:.8,swarm:1},
    packs:[{t:'hellhound',n:[3,5]},{t:'imp',n:[3,5]},{t:'husk',n:[4,6]}]});
  if(mom) mom.pal='hellstair';
  /* the bone stair's look goes deeper: the Breach becomes the Ossuary of the Breach */
  if(br) Object.assign(br,{pal:'ossuary',env:'bone'}); })();
