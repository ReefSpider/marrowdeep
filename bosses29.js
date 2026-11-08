'use strict';
/* ===== v29 bosses: Odo in horror, Rook made epic, the Sisters harder and on the move =====
   - Ser Odo Gallowmark rides a dead horse: a bare skull with coals for eyes, ribs through the hide, and nooses and a
     cage of bones swinging from the saddle. Odo is a tall, rusted hangman-knight. His helm is crowned with iron
     antlers, there's nothing behind the visor but two points of light, a noose hangs round his neck and his cape
     is in rags. His lance is a gallows hook.
   - Marshal Oswin Rook is bigger, and dressed for a coronation:
       * an armoured destrier in a crimson caparison with gold
       * gilt plate, a winged helm and a house banner flying from his back
       * a pennoned lance on horseback, a greatsword on foot
     New patterns:
       Royal Cavalry  spectral riders charge down marked lanes
       War Cry        he plants the banner: guards come and he is briefly unstoppable
   - The Three Sisters glide after you between attacks instead of standing in their pools. They gain Ambush: the
     sister goes under and comes up beneath you, so the red mark under your feet means move. Their life is up from
     ×1.45 to ×1.7. */

/* ---------- Odo ---------- */
function deadHorse(c,t,run){ const g=run?Math.sin(t*14)*2:Math.sin(t*2)*.5;
  rect(c,-14,-20,26,10,'#2a2220'); rect(c,-14,-20,26,1,'#4a3a32'); for(let i=0;i<5;i++){ rect(c,-8+i*4,-19,1,7,'#cfc6b2'); } rect(c,-9,-13,20,1,'#6a1a14');
  rect(c,-16,-20,3,9,'#1a1412'); for(let i=0;i<3;i++) rect(c,-17-i,-12+i*3,1,4,'#2a2220');
  for(const [x,o] of [[-12,g],[-7,-g],[5,-g],[9,g]]){ const h=10-Math.min(0,o); rect(c,x,-10+Math.min(0,o),2,h,'#1a1412'); rect(c,x,-6+Math.min(0,o),2,1,'#cfc6b2'); }
  rect(c,9,-27,5,9,'#2a2220'); rect(c,9,-27,1,9,'#cfc6b2'); /* the skull */ rect(c,11,-32,9,6,'#d8cfb8'); rect(c,18,-29,3,3,'#d8cfb8'); rect(c,13,-31,2,2,'#140c0c'); rect(c,14,-31,1,1,'#ff5a2a'); rect(c,17,-27,1,1,'#140c0c'); rect(c,19,-27,1,1,'#140c0c'); rect(c,15,-26,5,1,'#cfc6b2');
  rect(c,10,-34,2,3,'#1a1412'); /* swinging nooses and the bone cage */ const sw=Math.sin(t*3)*1.5;
  rect(c,-10,-20,1,8+Math.round(sw),'#6a5a3a'); rect(c,-11,-12+Math.round(sw),3,3,'#6a5a3a'); rect(c,-4,-20,1,5,'#6a5a3a'); rect(c,-6,-15,5,6,'#3a3230'); for(let i=0;i<3;i++) rect(c,-6+i*2,-15,1,6,'#cfc6b2'); }
function dOdo(c,e){ const t=e.anim, p=e.pat&&e.pat.name; if(e.mounted){ deadHorse(c,t,p==='charge'||p==='lance'); c.save(); c.translate(0,-18); }
  /* rags of a cape */ const fl=Math.sin(t*2.4)*2; c.fillStyle='#1a1210'; c.beginPath(); c.moveTo(-5,-18); c.lineTo(-11-fl,-2); c.lineTo(-8,-4); c.lineTo(-9-fl,0); c.lineTo(-5,-3); c.lineTo(-3,-16); c.fill();
  /* rusted mail and plate, a tithe ledger chained to the belt */
  rect(c,-5,-17,10,13,'#4a3a30'); rect(c,-5,-17,10,1,'#7a5a40'); for(let y=-15;y<-5;y+=2) rect(c,-4,y,8,1,'#3a2c24'); rect(c,-6,-8,12,2,'#2a1e14'); rect(c,4,-7,3,4,'#6a5236'); rect(c,4,-7,3,1,'#8a1a14');
  if(!e.mounted){ rect(c,-4,-4,3,8,'#2a2018'); rect(c,1,-4,3,8,'#2a2018'); rect(c,-4,0,3,1,'#5a5e68'); rect(c,1,0,3,1,'#5a5e68'); }
  rect(c,-7,-18,4,4,'#5a4a3a'); rect(c,3,-18,4,4,'#5a4a3a'); rect(c,-7,-18,4,1,'#8a7a5a');
  /* the noose round his neck */ rect(c,-3,-17,7,1,'#8a7a50'); rect(c,1,-17,1,4,'#8a7a50');
  /* helm: no face, antlers of iron */ rect(c,-3,-24,7,7,'#3a3230'); rect(c,-3,-24,7,1,'#6a5a50'); rect(c,-1,-22,5,3,'#050304'); rect(c,0,-21,1,1,'#ffd27a'); rect(c,2,-21,1,1,'#ffd27a');
  c.fillStyle='#2a2220'; for(const s of [-1,1]){ const bx=s<0?-2:3; c.fillRect(bx,-28,1,4); c.fillRect(bx+s*1,-30,1,3); c.fillRect(bx+s*2,-32,1,3); c.fillRect(bx+s*3,-30,1,2); c.fillRect(bx-s*1,-33,1,2); }
  /* the gallows hook */ const arm=p==='lance'?0:p==='net'?-1.4:p==='duel'?Math.sin(t*20)*.8:.4; c.save(); c.translate(4,-12); c.rotate(arm);
  if(e.mounted){ rect(c,0,-.5,30,1,'#3a2a1c'); rect(c,29,-3,1,5,'#8a8478'); rect(c,27,-3,3,1,'#8a8478'); rect(c,10,0,1,4,'#8a7a50'); } else { rect(c,0,-1,14,2,'#6a6a72'); rect(c,13,-3,2,4,'#6a6a72'); } c.restore();
  if(e.mounted) c.restore(); }
BDRAW.odo=dOdo;
(function(){ const o=drawBoss; drawBoss=function(e){ if(e.kind==='odo'&&!e.dead){ addLight(e.x+(e.face||1)*14,e.y-30,40,.6,1,.4,.15); } return o(e); }; })();

/* ---------- Rook ---------- */
function destrier(c,t,run){ const g=run?Math.sin(t*14)*2:Math.sin(t*2)*.5;
  rect(c,-15,-21,28,11,'#2a2a30'); for(const [x,o] of [[-12,g],[-7,-g],[5,-g],[9,g]]){ rect(c,x,-10+Math.min(0,o),3,10-Math.min(0,o),'#1a1a1e'); rect(c,x,-2+Math.min(0,o),3,2,'#5a5e68'); }
  /* the caparison */ c.fillStyle='#6a0a14'; c.beginPath(); c.moveTo(-16,-22); c.lineTo(13,-22); c.lineTo(14,-9); c.lineTo(8,-11); c.lineTo(2,-8); c.lineTo(-4,-11); c.lineTo(-10,-8); c.lineTo(-17,-10); c.fill(); rect(c,-16,-22,30,1,'#c8a040'); rect(c,-15,-11,29,1,'#c8a040');
  for(const x of [-10,0]){ rect(c,x,-19,4,4,'#c8a040'); rect(c,x+1,-18,2,2,'#6a0a14'); }
  /* chanfron */ rect(c,9,-29,6,10,'#6a0a14'); rect(c,11,-34,9,6,'#8a8e98'); rect(c,11,-34,9,1,'#d0d4dc'); rect(c,16,-32,1,1,'#140c0c'); rect(c,13,-37,1,3,'#c8a040'); rect(c,18,-30,3,3,'#8a8e98'); }
function dRook(c,e){ const t=e.anim, p=e.pat&&e.pat.name; c.save(); c.scale(1.2,1.2);
  if(e.mounted){ destrier(c,t,p==='charge'||p==='lance'||p==='trample'); c.save(); c.translate(0,-19); }
  /* the house banner on his back */ const fl=Math.sin(t*4); rect(c,-7,-44,1,30,'#3a2a1c'); c.fillStyle='#8a0a14'; c.beginPath(); c.moveTo(-6,-44); c.lineTo(-22,-42+fl*2); c.lineTo(-19,-37+fl); c.lineTo(-22,-32+fl*2); c.lineTo(-6,-34); c.fill(); rect(c,-15,-41,4,4,'#c8a040'); rect(c,-14,-40,2,2,'#8a0a14'); rect(c,-7,-46,2,2,'#c8a040');
  if(!e.mounted){ rect(c,-5,-4,4,9,'#8a8e98'); rect(c,1,-4,4,9,'#8a8e98'); rect(c,-5,-4,4,1,'#d0d4dc'); rect(c,-5,4,4,1,'#3a3a40'); rect(c,1,4,4,1,'#3a3a40'); }
  /* gilt plate, a crimson surcoat */ rect(c,-7,-18,14,15,'#8a8e98'); rect(c,-7,-18,14,1,'#d0d4dc'); rect(c,-4,-16,8,13,'#6a0a14'); rect(c,-4,-16,8,1,'#c8a040'); rect(c,-1,-14,2,6,'#c8a040'); rect(c,-3,-12,6,1,'#c8a040'); rect(c,-8,-6,16,2,'#3a2a1c'); rect(c,-1,-6,2,2,'#c8a040');
  rect(c,-10,-19,5,5,'#9a9ea8'); rect(c,5,-19,5,5,'#9a9ea8'); rect(c,-10,-19,5,1,'#c8a040'); rect(c,5,-19,5,1,'#c8a040');
  /* winged helm */ rect(c,-4,-27,8,9,'#9a9ea8'); rect(c,-4,-27,8,1,'#e0e4ec'); rect(c,0,-24,4,1,'#050304'); rect(c,-1,-27,2,9,'#c8a040');
  c.fillStyle='#e8e0d0'; c.beginPath(); c.moveTo(-4,-25); c.lineTo(-12,-34); c.lineTo(-9,-27); c.lineTo(-11,-29); c.lineTo(-5,-22); c.fill(); c.beginPath(); c.moveTo(4,-25); c.lineTo(10,-34); c.lineTo(8,-27); c.lineTo(10,-28); c.lineTo(4,-22); c.fill();
  /* lance with pennant, or the greatsword */ const sw=p==='duel'?Math.sin(t*20)*.9:p==='lance'||p==='charge'?0:.4; c.save(); c.translate(6,-12); c.rotate(sw);
  if(e.mounted){ rect(c,0,-1,36,2,'#5a4a30'); rect(c,35,-2,6,4,'#d0d4dc'); rect(c,4,-2,4,4,'#c8a040'); c.fillStyle='#8a0a14'; c.beginPath(); c.moveTo(26,-1); c.lineTo(20,-6+fl); c.lineTo(17,-1); c.fill(); }
  else { rect(c,0,-1.5,26,3,'#d0d4dc'); rect(c,0,-.5,26,1,'#ffffff'); rect(c,-2,-4,3,8,'#c8a040'); rect(c,-5,-1,4,2,'#3a2a1c'); } c.restore();
  if(e.mounted) c.restore(); c.restore(); }
BDRAW.rook=dRook;
Object.assign(BOSSES.rook,{kit:[['charge','cavalry','lance','charge','trample'],['duel','leap','warcry','wave','cavalry','duel'],['duel','cavalry','leap','duel','warcry','wave','charge']]});

/* ---------- the Sisters ---------- */
Object.assign(BOSSES.sisters,{kit:[['swap','gift','ambush','gift','gift'],['ambush','gift','swap','gift','ambush','gift'],['gift','ambush','gift','swap','ambush','gift','gift']]});
if(typeof BOSS_HP_MUL!=='undefined') BOSS_HP_MUL.sisters=1.7;
(function(){ const o=bossIdle; bossIdle=function(e,dt){ if(e.kind!=='sisters') return o(e,dt);
  const sp=(e.phase>1?78:56)*(e.sis&&e.sis.filter(s=>!s.alive).length?1.2:1), want=P.x+(e.x<P.x?-1:1)*rnd(60,90);
  e.vx=approach(e.vx||0,clamp((want-e.x)*1.5,-sp,sp),220*dt); e.vy+=900*dt; moveBody(e,dt); e.face=Math.sign(P.x-e.x)||e.face;
  if(R()<.15) part({x:e.x+rnd(-6,6),y:e.y-1,vx:rnd(-20,20),vy:rnd(-40,-10),g:200,life:.4,col:'#2a3a2a'}); }; })();
(function(){ const o=startPat2; startPat2=function(e,n,p){ const F=FLOOR();
  if(n==='ambush'){ p.tx=clamp(P.x,2*T,(L.w-2)*T); AU.noise(.5,300,120,2,.3,'bandpass',.4); return; }
  if(n==='cavalry'){ const lanes=e.phase>2?3:2, used=[]; p.lanes=[]; for(let i=0;i<lanes;i++){ let y; do{ y=F-14-ri(0,2)*26; }while(used.includes(y)&&used.length<3); used.push(y); const dir=R()<.5?1:-1; p.lanes.push({y,dir,x:dir>0?-40:L.w*T+40,hit:0}); teleRect(0,y-14,L.w*T,24,.9); }
    AU.roar(); showBossName('The Royal Cavalry','近衛騎兵','They rode with him once. They ride for him still.'); return; }
  if(n==='warcry'){ AU.roar(); shake(8); e.unstop=2.4; return; }
  return o(e,n,p); }; })();
(function(){ const o=runPat2; runPat2=function(e,dt,p,n,t,F){
  if(n==='ambush'){ if(t<.35){ e.alpha=1-t/.35; } else if(!p.marked){ p.marked=1; p.tx=clamp(P.x,2*T,(L.w-2)*T); teleRect(p.tx-16,F-40,32,40,.55); }
    else if(t>=.9&&!p.up){ p.up=1; e.x=p.tx; e.alpha=1; AU.scream&&AU.scream(); shake(6); hazard(p.tx-16,F-40,32,40,.25,e.dmg*1.15,e); for(let i=0;i<20;i++) part({x:p.tx+rnd(-10,10),y:F,vx:rnd(-80,80),vy:rnd(-260,-80),g:600,life:.7,col:pick(['#2a3a2a','#a9b46c','#141012'])}); }
    if(t>=1.5){ e.alpha=1; endPat(e,.8); } return true; }
  if(n==='cavalry'){ if(t>=.9){ for(const l of p.lanes){ l.x+=l.dir*520*dt; if(!l.hit&&Math.abs(P.x-l.x)<18&&Math.abs((P.y-12)-l.y)<16){ l.hit=1; hurtPlayer(e.dmg*1.1,e); } if(R()<.6) part({x:l.x,y:l.y+8,vx:-l.dir*rnd(20,80),vy:rnd(-40,0),g:100,life:.5,em:true,col:'#9ab0ff'}); } }
    if(t>=.9+(L.w*T+80)/520){ endPat(e,1.2); } return true; }
  if(n==='warcry'){ if(!p.done&&t>=.5){ p.done=1; summonFoes('guard',Math.max(0,Math.min(2,4-enemies.filter(o=>!o.dead&&!o.boss).length))); } if(t>=1.2) endPat(e,1); return true; }
  return o(e,dt,p,n,t,F); }; })();
/* the spectral riders */
(function(){ const o=drawBossOverlays; drawBossOverlays=function(){ o(); for(const e of enemies){ const p=e.boss&&e.pat; if(!p||p.name!=='cavalry'||!p.lanes||p.t<.9) continue;
  for(const l of p.lanes){ const sx=Math.round(l.x-camR.x), sy=Math.round(l.y-camR.y); if(sx<-40||sx>W+40) continue; ectx.save(); ectx.translate(sx,sy+10); ectx.scale(l.dir,1); ectx.globalAlpha=.75;
    ectx.fillStyle='rgba(150,180,255,.55)'; ectx.fillRect(-14,-14,26,9); ectx.fillRect(9,-21,5,9); ectx.fillRect(11,-25,8,6); for(const x of [-12,-7,5,9]) ectx.fillRect(x,-5,2,6);
    ectx.fillStyle='rgba(200,215,255,.7)'; ectx.fillRect(-4,-26,7,12); ectx.fillRect(-3,-31,5,5); ectx.fillRect(3,-20,22,1); for(let i=1;i<5;i++){ ectx.globalAlpha=.15; ectx.fillRect(-14-i*10,-14,26,9); } ectx.restore(); } } }; })();
/* War Cry: briefly unstoppable */
(function(){ const o=dmgEnemy; dmgEnemy=function(e,d,crit,dir,kb,heavy,launch,stun){ if(e&&e.boss&&e.unstop>0){ kb=0; stun=0; launch=0; } return o(e,d,crit,dir,kb,heavy,launch,stun); }; })();
(function(){ const o=update; update=function(dt){ o(dt); for(const e of enemies) if(e.boss&&e.unstop>0){ e.unstop-=dt; if(R()<.3) part({x:e.x+rnd(-10,10),y:e.y-rnd(0,40),vx:0,vy:-40,g:-10,life:.5,em:true,col:'#ffd66a'}); } }; })();
