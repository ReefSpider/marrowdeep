'use strict';
/* ===== the March (v24): Act I foes =====
   Built to be read, one idea each (wind-ups use the 'wind'/'cast'/'aim' states so the glint and interrupts work):
   - 案山子 Scarecrow: stands still and faces you a moment late. It only moves while you aren't looking at it.
   - 鴉 Crow: sits in flocks that don't fly when you pass. Strike one, or loiter, and the whole flock comes for you.
   - 賞金騎手 Bounty Rider: rears (glint), then charges the length of the field. Unhorsed below half life.
   - 沼の魔女 Fen Hag: blinks between pools, hexes the ground you stand on.
   - 溺れ人 Bog Drowner: waits under black water and takes your ankle when you wade past.
   - 沼灯 Marsh Lantern: a wisp that drags you toward it. One blow puts it out.
   - 蛭 Leech: latches on and drinks until you roll.
   - 塩の霊 Salt Wraith: Kesh's dead; dashes through you. Hard to see in a sandstorm.
   - 埋もれ兵 Buried Soldier: one of your own from the burning of Kesh, rising out of the sand as you pass.
   - 禿鷲 Vulture: circles, then dives. Dives more when you're bleeding.
   - 鳥女 Harpy: swoops through you with a shove meant for the edge of a cliff.
   - 山羊頭の隠者 Goat-Skulled Hermit: lobs stones, rings a bell that brings rock down on you.
   - 虚ろの歩兵 Hollowed Footman: black eyes, never flinches from a light blow, marches in step with the others.
   - 虚ろの槍兵 Hollowed Pikeman: a long thrust; braces against a roll and punishes it.
   - 灯の狂信者 Lantern Zealot: oil flasks that set the ground alight. */
Object.assign(EDEF,{
  scarecrow:{w:12,h:30,hp:40,dmg:12,spd:60,xp:14,name:'Scarecrow'},
  crow:{w:8,h:6,hp:6,dmg:4,spd:95,xp:2,name:'Gallows Crow'},
  rider:{w:24,h:30,hp:80,dmg:16,spd:60,xp:30,name:'Bounty Rider'},
  fenhag:{w:12,h:24,hp:46,dmg:11,spd:30,xp:22,name:'Fen Hag'},
  drowner:{w:12,h:22,hp:50,dmg:13,spd:52,xp:18,name:'Bog Drowner'},
  lantern:{w:8,h:8,hp:10,dmg:6,spd:30,xp:10,fly:1,name:'Marsh Lantern'},
  leech:{w:8,h:4,hp:7,dmg:3,spd:70,xp:2,name:'Fen Leech'},
  saltwraith:{w:12,h:18,hp:26,dmg:9,spd:64,xp:12,fly:1,name:'Salt Wraith'},
  buried:{w:11,h:24,hp:40,dmg:12,spd:36,xp:14,name:'Buried Soldier'},
  vulture:{w:14,h:8,hp:20,dmg:9,spd:80,xp:9,fly:1,name:'Vulture'},
  harpy:{w:14,h:16,hp:28,dmg:11,spd:100,xp:14,fly:1,name:'Harpy'},
  hermit:{w:12,h:22,hp:34,dmg:10,spd:26,xp:16,name:'Goat-Skulled Hermit'},
  footman:{w:14,h:26,hp:70,dmg:14,spd:34,xp:24,name:'Hollowed Footman'},
  pikeman:{w:12,h:26,hp:50,dmg:15,spd:32,xp:20,name:'Hollowed Pikeman'},
  zealot:{w:12,h:24,hp:34,dmg:10,spd:38,xp:16,name:'Lantern Zealot'}});
for(const t of ['crow','leech','lantern']) NO_RANK.add(t);
CODEX.push(
  {id:'scarecrow',k:'案山子',t:'The Scarecrow',x:'The fields stopped growing when the tithe started. The scarecrows stayed at their posts anyway. They have learned to wait for the farmer to turn his back.'},
  {id:'crow',k:'鴉',t:'Gallows Crows',x:'Fat on the March. They sit where you can see them and they do not fly, because nothing on this road has been worth flying from in months.'},
  {id:'rider',k:'賞金騎手',t:'Bounty Riders',x:'Paid by the head, alive or dead, half again for alive. None of them has ever brought one back alive.'},
  {id:'fenhag',k:'沼の魔女',t:'The Fen Hags',x:'Daughters of the Three Sisters, or nieces, or nothing at all. They step into one pool and out of another, and they mark the ground you stand on so it remembers you.'},
  {id:'drowner',k:'溺れ人',t:'The Bog Drowners',x:'The fen keeps what it is given. It gives some of it back with its hands still working.'},
  {id:'lantern',k:'沼灯',t:'Marsh Lanterns',x:'A light on the water where no one is holding a lantern. Travellers follow it because it looks like a house.'},
  {id:'leech',k:'蛭',t:'Fen Leeches',x:'They are patient, and they are many, and they only want a little.'},
  {id:'saltwraith',k:'塩の霊',t:'Salt Wraiths',x:'Kesh salted its own earth so the burning would not take the wells. The dead stayed in the salt. They know whose banner you rode under.'},
  {id:'buried',k:'埋もれ兵',t:'Buried Soldiers',x:'Hollowmere men, left where they fell at Kesh. The sand covered them and nobody came back for the bodies. They are still wearing your colours.'},
  {id:'vulture',k:'禿鷲',t:'Vultures',x:'They have learned the difference between a man walking and a man who will stop walking soon.'},
  {id:'harpy',k:'鳥女',t:'Harpies of the Pass',x:'The monks fed them once, from the cliff, and they came to love the cliff more than the monks.'},
  {id:'hermit',k:'山羊頭',t:'Goat-Skulled Hermits',x:'The monastery went quiet. The last brothers took the goats\' skulls for faces and the prayer bell for a weapon. The mountain still answers it.'},
  {id:'footman',k:'虚ろ兵',t:'The Hollowed',x:'Your own old soldiers. They swore to the new King like everyone else, and their eyes went black, and now they don\'t flinch and they don\'t sleep. They still march in step.'},
  {id:'pikeman',k:'虚ろ槍',t:'Hollowed Pikemen',x:'Taught to set the pike against a charge. They remember the drill and nothing else.'},
  {id:'zealot',k:'灯の狂信',t:'Lantern Zealots',x:'Saint Edda\'s flock. They found a new faith in the new King and carry it in jars of oil.'});
for(const c of CODEX.slice(-15)) CX[c.id]=c;
for(const t of ['scarecrow','crow','rider','fenhag','drowner','lantern','leech','saltwraith','buried','vulture','harpy','hermit','footman','pikeman','zealot']) TYPE_CODEX[t]=t;
TYPE_CODEX.rider='rider';

/* ---------- shared: lobbed things, foe fire, foe clouds ---------- */
let LOBS=[];
function lob(kind,x,y,tx,ty,dmg,t){ t=t||.8; LOBS.push({kind,x,y,vx:(tx-x)/t,vy:(ty-y)/t-450*t,dmg,age:0,fuse:kind==='bomb'?1.4:0}); }
function foeFire(x,y,dmg,life){ const fy=findFloor(x,y-6); fx.push({t:0,dur:life||3,tk:0,haz:0,upd(f,dt){ f.tk-=dt; if(f.tk<=0&&!P.dead&&Math.abs(P.x-x)<14&&Math.abs(P.y-fy)<10){ f.tk=.45; hurtPlayer(dmg,{x,hp:0,dead:true}); } },
  draw(f){ const k=1-Math.max(0,(f.t-(f.dur-.5))/.5); for(let i=0;i<6;i++){ const h=(3+Math.abs(Math.sin(time*11+i*1.9))*7)*k; ectx.fillStyle=i%2?`rgba(255,180,80,${(.8*k).toFixed(2)})`:`rgba(255,90,30,${(.8*k).toFixed(2)})`; ectx.fillRect(Math.round(x-12+i*4-camR.x),Math.round(fy-h-camR.y),3,Math.round(h)); } addLight(x,fy-6,50,.8*k,1,.5,.2); }}); }
function foeCloud(x,y,r,dmg,life,col){ col=col||[120,150,60]; fx.push({t:0,dur:life||4,tk:0,upd(f,dt){ f.tk-=dt; if(f.tk<=0&&!P.dead&&Math.hypot(P.x-x,P.y-12-y)<r){ f.tk=.6; hurtPlayer(dmg,{x,hp:0,dead:true}); } },
  draw(f){ const k=Math.min(1,f.t*3)*(1-Math.max(0,(f.t-(f.dur-.8))/.8)); for(let i=0;i<10;i++){ const a=i*.63+time*.4, rr=r*(.4+.5*((i*37)%10)/10); ctx.fillStyle=`rgba(${col[0]},${col[1]},${col[2]},${(.22*k).toFixed(2)})`; ctx.beginPath(); ctx.arc(x+Math.cos(a)*rr*.5-camR.x,y+Math.sin(a*1.3)*rr*.3-camR.y,rr*.6,0,7); ctx.fill(); } }}); }
function boom(x,y,r,dmg){ AU.boom(.5); shake(5); for(let i=0;i<22;i++) part({x,y:y-4,vx:rnd(-160,160),vy:rnd(-220,-40),g:500,life:rnd(.3,.7),em:true,col:pick(['#ffd27a','#ff8a3a','#5a4a3a'])}); dust(x,y,14); addLight(x,y-10,110,1.6,1,.6,.3);
  if(!P.dead&&Math.hypot(P.x-x,P.y-10-y)<r) hurtPlayer(dmg,{x,hp:0,dead:true}); for(const e of enemies) if(!e.dead&&!e.boss&&Math.hypot(e.x-x,e.y-e.h/2-y)<r) dmgEnemy(e,dmg,false,Math.sign(e.x-x)||1,140,true); }
function updLobs(dt){ for(const b of LOBS){ b.age+=dt; if(b.landed){ b.fuse-=dt; if(b.fuse<=0){ b.dead=1; boom(b.x,b.y,34,b.dmg); } continue; }
    b.vy+=900*dt; b.x+=b.vx*dt; b.y+=b.vy*dt;
    if(!P.dead&&Math.abs(P.x-b.x)<7&&b.y>P.y-P.h&&b.y<P.y+2&&b.kind!=='bomb'){ b.dead=1; hurtPlayer(b.dmg,{x:b.x,hp:0,dead:true}); if(b.kind==='flask') foeFire(b.x,P.y,b.dmg*.35,2.6); if(b.kind==='vial') foeCloud(b.x,P.y-10,30,b.dmg*.3,4); continue; }
    if(solidPx(b.x,b.y)||tileAt(Math.floor(b.x/T),Math.floor(b.y/T))===2&&b.vy>0||b.age>4){ const fy=Math.floor(b.y/T)*T;
      if(b.kind==='flask'){ b.dead=1; AU.noise(.3,1800,500,2,.3,'bandpass',.3); foeFire(b.x,fy,b.dmg*.35,3); foeFire(b.x+16,fy,b.dmg*.35,2.4); foeFire(b.x-16,fy,b.dmg*.35,2.4); }
      else if(b.kind==='vial'){ b.dead=1; AU.noise(.2,3000,900,2,.2,'bandpass',.2); foeCloud(b.x,fy-12,34,b.dmg*.3,4.5); }
      else if(b.kind==='bomb'){ b.landed=1; b.y=fy; }
      else { b.dead=1; dust(b.x,fy,6); AU.slam(); } } }
  LOBS=LOBS.filter(b=>!b.dead); }
function drawLobs(){ for(const b of LOBS){ const sx=Math.round(b.x-camR.x), sy=Math.round(b.y-camR.y);
  if(b.kind==='flask'){ rect(ctx,sx-2,sy-3,4,4,'#5a4a30'); ectx.fillStyle='#ffb060'; ectx.fillRect(sx,sy-5,1,2); }
  else if(b.kind==='vial'){ rect(ctx,sx-1,sy-3,3,4,'#6a8a3a'); rect(ctx,sx-1,sy-4,3,1,'#cfc6b2'); }
  else if(b.kind==='bomb'){ rect(ctx,sx-3,sy-6,6,6,'#1a1418'); rect(ctx,sx-2,sy-6,2,1,'#5a5054'); if(Math.sin(time*(b.landed?30:12))>0){ ectx.fillStyle='#ffd27a'; ectx.fillRect(sx+2,sy-8,1,2); } if(b.landed){ ectx.fillStyle=`rgba(255,40,30,${(.2+.3*Math.abs(Math.sin(time*14))).toFixed(2)})`; ectx.fillRect(sx-17,sy-1,34,1); } }
  else { rect(ctx,sx-2,sy-2,4,4,'#4a4448'); rect(ctx,sx-2,sy-2,4,1,'#7a7478'); } } }
(function(){ const o=update; update=function(dt){ o(dt); if(L) updLobs(dt); }; })();
(function(){ const o=drawHazards; drawHazards=function(){ o(); drawLobs(); }; })();
(function(){ const o=loadLevel; loadLevel=function(idx,opt){ LOBS=[]; MARCH_LOAD=true; try{ return o(idx,opt); } finally{ MARCH_LOAD=false; } }; })();
let MARCH_LOAD=false;
const looking=e=>P.face===Math.sign(e.x-P.x);
/* co-op: while a foe is acting on another machine's hero, don't push that hero around here (their own machine does) */
const meHere=()=>!(typeof COOP!=='undefined'&&COOP&&typeof NET!=='undefined'&&NET.swapped);
const grav=(e,dt)=>{ e.vy+=900*dt; moveBody(e,dt); };

/* ---------- placement-time states ---------- */
(function(){ const o=mkEnemy; mkEnemy=function(s){ const e=o(s);
  if(e.type==='scarecrow'&&!s.pack){ e.state='still'; e.face=R()<.5?-1:1; }
  if(e.type==='crow'&&MARCH_LOAD){ e.state='perch'; e.fly=false; }
  if(e.type==='drowner'&&MARCH_LOAD&&!s.pack){ e.state='sunk'; e.intro=true; }
  if(e.type==='buried'&&MARCH_LOAD&&!s.pack){ e.state='buried'; e.intro=true; }
  if(e.type==='lantern'||e.type==='vulture'||e.type==='harpy'||e.type==='saltwraith'){ e.hy=e.y; }
  if(e.type==='rider') e.mounted=1;
  return e; }; })();
/* the Hollowed don't flinch from light blows; a pikeman braced against a roll can't be knocked aside */
(function(){ const o=dmgEnemy; dmgEnemy=function(e,d,crit,dir,kb,heavy,launch,stun){ if(e&&(e.type==='footman'||e.type==='rider'&&e.mounted)&&!heavy&&!crit){ kb=0; launch=false; stun=false; } return o(e,d,crit,dir,kb,heavy,launch,stun); }; })();
/* a struck crow wakes its flock */
(function(){ const o=dmgEnemy; dmgEnemy=function(e,...a){ const r=o(e,...a); if(e&&e.type==='crow'&&e.state==='perch') wakeFlock(e); if(e&&(e.type==='scarecrow')&&e.state==='still'){ e.state='chase'; } return r; }; })();
function wakeFlock(e){ for(const c of enemies) if(c.type==='crow'&&!c.dead&&c.state==='perch'&&Math.abs(c.x-e.x)<140&&Math.abs(c.y-e.y)<80){ c.state='flock'; c.fly=true; c.vy=-160; c.st=rnd(.2,.6); } AU.noise(.6,2500,800,2,.25,'bandpass',.4); unlockCodex('crow'); }

const EAI_M={
  scarecrow(e,dt,c){ /* moves only while you aren't looking */
    if(e.state==='still'){ e.vx=0; if(c.vis&&c.adx<150&&Math.abs(c.dy)<60){ e.lookT=(e.lookT||0)+dt; if(e.lookT>.25){ e.face=Math.sign(c.dx)||e.face; } if(c.adx<34||e.lookT>2.2&&!looking(e)){ e.state='chase'; unlockCodex('scarecrow'); AU.tone('sawtooth',90,60,.3,.06,.2); } } grav(e,dt); return; }
    e.walk+=dt*Math.abs(e.vx)*.12;
    if(e.state==='wind'){ e.st-=dt; e.vx=0; if(e.st<=0){ e.state='cut'; e.st=.2; e.vx=e.face*160; AU.swing(false); } }
    else if(e.state==='cut'){ e.st-=dt; tryHit(e,{x:e.face>0?e.x:e.x-30,y:e.y-26,w:30,h:18},e.dmg); if(e.st<=0){ e.state='chase'; e.atkCd=1.1; } }
    else { e.face=Math.sign(c.dx)||e.face; const frozen=c.vis&&looking(e)&&c.adx<220; e.vx=frozen?0:approach(e.vx,c.adx>20?e.face*e.spd:0,900*dt); if(frozen&&R()<.02) e.x+=e.face; if(c.adx<36&&Math.abs(c.dy)<30&&e.atkCd<=0){ e.state='wind'; e.st=.4; } }
    grav(e,dt); },
  crow(e,dt,c){ e.walk+=dt*8;
    if(e.state==='perch'){ e.vx=0; if(c.vis&&c.adx<34&&Math.abs(c.dy)<30){ e.near=(e.near||0)+dt; if(e.near>1.4) wakeFlock(e); } grav(e,dt); return; }
    e.st-=dt; const ty=P.y-20+Math.sin(time*3+e.seed)*14, tx=P.x+Math.cos(time*1.7+e.seed)*30;
    if(e.st<=0&&e.atkCd<=0&&c.vis){ e.vx=(P.x-e.x)*3.2; e.vy=(P.y-12-e.y)*3.2; if(Math.abs(c.dx)<8&&Math.abs(c.dy)<10){ tryHit(e,eBox(e),e.dmg); e.atkCd=1.2; e.vy=-120; } }
    else { e.vx=approach(e.vx,(tx-e.x)*1.8,400*dt); e.vy=approach(e.vy,(ty-e.y)*1.8,400*dt); }
    e.x+=e.vx*dt; e.y+=e.vy*dt; if(solidPx(e.x,e.y)) e.y-=60*dt; },
  rider(e,dt,c){ e.walk+=dt*Math.abs(e.vx)*.08;
    if(e.mounted&&e.hp<e.maxhp*.45){ e.mounted=0; e.type='pikeman'; e.w=12; e.h=26; e.name='Unhorsed Rider'; e.state='chase'; e.stun=.8; e.vy=-180; dust(e.x,e.y,16); AU.slam(); toast('Unhorsed.'); return; }
    if(e.state==='wind'){ e.st-=dt; e.vx=approach(e.vx,0,600*dt); if(R()<.3) dust(e.x-e.face*8,e.y,1); if(e.st<=0){ e.state='charge'; e.st=1.3; AU.roar(); } }
    else if(e.state==='charge'){ e.st-=dt; e.vx=e.face*320; if(R()<.6) dust(e.x-e.face*10,e.y,2); tryHit(e,{x:e.face>0?e.x:e.x-30,y:e.y-26,w:30,h:24},e.dmg*1.2); if(e.st<=0||e.hitWall){ e.state='turn'; e.st=.9; if(e.hitWall){ shake(4); AU.slam(); } } }
    else if(e.state==='turn'){ e.st-=dt; e.vx=approach(e.vx,0,500*dt); if(e.st<=0){ e.face=Math.sign(c.dx)||e.face; e.state='chase'; e.atkCd=1; } }
    else { if(c.vis&&c.adx<300&&Math.abs(c.dy)<50){ e.face=Math.sign(c.dx)||1; e.vx=approach(e.vx,c.adx>120?e.face*e.spd:-e.face*e.spd*.5,300*dt); if(e.atkCd<=0&&c.adx>70){ e.state='wind'; e.st=.6; unlockCodex('rider'); } } else c.patrol(e.spd*.5); }
    grav(e,dt); },
  fenhag(e,dt,c){ e.walk+=dt*Math.abs(e.vx)*.1;
    if(e.state==='blink'){ e.st-=dt; e.alpha=Math.max(0,e.st/.35); if(e.st<=0){ const spans=(L.wspans||[]).filter(s=>s.v===4&&s.top&&Math.abs((s.x0+s.x1)/2-P.x)<260&&Math.abs(s.y-P.y)<120); let nx,ny;
        if(spans.length){ const s=pick(spans); nx=rnd(s.x0+6,s.x1-6); ny=s.y+T; } else { nx=clamp(P.x+(R()<.5?-1:1)*rnd(90,150),2*T,(L.w-2)*T); ny=findFloor(nx,P.y-40); }
        if(!solidPx(nx,ny-12)){ e.x=nx; e.y=ny; } e.state='rise'; e.st=.35; for(let i=0;i<10;i++) part({x:e.x+rnd(-6,6),y:e.y-rnd(0,6),vx:rnd(-30,30),vy:rnd(-90,-20),g:300,life:.5,col:'#2a1c30'}); } return; }
    if(e.state==='rise'){ e.st-=dt; e.alpha=1-Math.max(0,e.st/.35); if(e.st<=0){ e.state='chase'; e.alpha=1; e.atkCd=.6; } grav(e,dt); return; }
    if(e.state==='cast'){ e.st-=dt; e.vx=0; if(e.st<=0){ e.state='chase'; e.atkCd=rnd(2.2,3.2); hexCurse(P.x,P.y,e.dmg); AU.cast(); } grav(e,dt); return; }
    if(c.vis&&c.adx<260&&Math.abs(c.dy)<120){ e.face=Math.sign(c.dx)||1; const want=c.adx<80?-e.face:c.adx>180?e.face:0; e.vx=approach(e.vx,want*e.spd,200*dt);
      if(e.atkCd<=0){ if(R()<.35){ e.state='blink'; e.st=.35; AU.noise(.3,600,200,2,.25,'bandpass',.3); } else { e.state='cast'; e.st=.7; unlockCodex('fenhag'); } } } else c.patrol(e.spd*.4);
    grav(e,dt); },
  drowner(e,dt,c){ e.walk+=dt*Math.abs(e.vx)*.12;
    if(e.state==='sunk'){ e.vx=0; if(R()<.03) part({x:e.x+rnd(-4,4),y:e.y-2,vx:0,vy:-20,g:-10,life:.6,col:'rgba(160,190,120,.6)'}); if(c.vis&&c.adx<46&&Math.abs(c.dy)<40){ e.state='grab'; e.st=.5; e.intro=false; e.face=Math.sign(c.dx)||1; e.vy=-200; if(P.dash<=0&&meHere()){ P.grabbed=.6; hurtPlayer(e.dmg,e); } AU.noise(.4,400,1200,2,.35,'bandpass',.4); unlockCodex('drowner'); for(let i=0;i<14;i++) part({x:e.x+rnd(-8,8),y:e.y-2,vx:rnd(-80,80),vy:rnd(-180,-60),g:500,life:.6,col:'#2a3a2a'}); } grav(e,dt); return; }
    if(e.state==='grab'){ e.st-=dt; if(e.st<=0){ e.state='chase'; e.atkCd=.8; } }
    else if(e.state==='wind'){ e.st-=dt; e.vx=0; if(e.st<=0){ e.state='claw'; e.st=.22; e.vx=e.face*120; } }
    else if(e.state==='claw'){ e.st-=dt; tryHit(e,{x:e.face>0?e.x:e.x-22,y:e.y-20,w:22,h:16},e.dmg); if(e.st<=0){ e.state='chase'; e.atkCd=1; } }
    else if(c.vis&&c.adx<200&&Math.abs(c.dy)<60){ e.face=Math.sign(c.dx)||1; e.vx=approach(e.vx,c.adx>18?e.face*e.spd:0,300*dt); if(c.adx<30&&e.atkCd<=0){ e.state='wind'; e.st=.45; } } else c.patrol(e.spd*.3);
    grav(e,dt); },
  lantern(e,dt,c){ e.walk+=dt; const ty=(e.hy||e.y)-6+Math.sin(time*1.6+e.seed)*5;
    if(c.vis&&Math.hypot(c.dx,c.dy)<170){ const d=Math.sign(e.x-P.x); if(!P.dead&&P.dash<=0&&meHere()){ P.vx+=d*70*dt*(1-Math.hypot(c.dx,c.dy)/170)*6; } e.lure=1; unlockCodex('lantern');
      if(Math.hypot(c.dx,c.dy)<12&&e.atkCd<=0){ hurtPlayer(e.dmg,e); e.hp=0; killEnemy(e,1,false); AU.noise(.3,3000,600,2,.25,'bandpass',.3); return; } } else e.lure=0;
    e.x+=Math.sin(time*.5+e.seed)*10*dt; e.y=lerp(e.y,ty,dt*2); },
  leech(e,dt,c){ e.walk+=dt*6;
    if(e.latched){ if(P.dash>0||P.dead){ e.latched=0; e.stun=.6; e.vy=-120; e.vx=rnd(-60,60); return; } e.x=P.x+e.lx; e.y=P.y-e.ly; e.tk=(e.tk||0)-dt; if(e.tk<=0){ e.tk=.7; hurtPlayer(e.dmg,{x:e.x,hp:0,dead:true}); } return; }
    if(c.vis&&c.adx<140&&Math.abs(c.dy)<30){ e.face=Math.sign(c.dx)||1; e.vx=approach(e.vx,e.face*e.spd,300*dt); if(c.adx<8&&Math.abs(c.dy)<16&&P.dash<=0&&meHere()){ e.latched=1; e.lx=rnd(-4,4); e.ly=rnd(2,10); unlockCodex('leech'); toast('A leech has you. Roll to throw it off.'); } } else c.patrol(e.spd*.3);
    grav(e,dt); },
  saltwraith(e,dt,c){ e.walk+=dt*3; const k=storm(); e.alpha=1-k*.75;
    if(e.state==='wind'){ e.st-=dt; e.vx*=.9; e.vy*=.9; if(e.st<=0){ e.state='dash'; e.st=.45; const d=Math.hypot(c.dx,c.dy)||1; e.vx=c.dx/d*300; e.vy=c.dy/d*300; AU.noise(.3,4000,1000,2,.2,'highpass',.3); } }
    else if(e.state==='dash'){ e.st-=dt; tryHit(e,eBox(e),e.dmg); if(R()<.7) part({x:e.x,y:e.y-8,vx:0,vy:20,g:200,life:.5,col:'#ebe4d2'}); if(e.st<=0){ e.state='chase'; e.atkCd=rnd(1.4,2.2); } }
    else { const tx=P.x-Math.sign(c.dx||1)*70, ty=P.y-30+Math.sin(time*2+e.seed)*10; e.vx=approach(e.vx,(tx-e.x)*1.5,300*dt); e.vy=approach(e.vy,(ty-e.y)*1.5,300*dt); if(c.vis&&Math.hypot(c.dx,c.dy)<180&&e.atkCd<=0){ e.state='wind'; e.st=.4; unlockCodex('saltwraith'); } }
    e.x+=e.vx*dt; e.y+=e.vy*dt; },
  buried(e,dt,c){ e.walk+=dt*Math.abs(e.vx)*.14;
    if(e.state==='buried'){ e.vx=0; if(c.vis&&c.adx<70&&Math.abs(c.dy)<50){ e.state='rise'; e.st=.7; e.intro=false; e.face=Math.sign(c.dx)||1; AU.noise(.7,300,700,2,.3,'bandpass',.3); unlockCodex('buried'); } grav(e,dt); return; }
    if(e.state==='rise'){ e.st-=dt; if(R()<.8) part({x:e.x+rnd(-8,8),y:e.y-rnd(0,4),vx:rnd(-50,50),vy:rnd(-120,-30),g:400,life:.5,col:pick(['#c4ad80','#957548'])}); if(e.st<=0){ e.state='chase'; e.atkCd=.5; } grav(e,dt); return; }
    if(e.state==='wind'){ e.st-=dt; e.vx=approach(e.vx,0,600*dt); if(e.st<=0){ e.state='thrust'; e.st=.22; e.vx=e.face*110; AU.swing(false); } }
    else if(e.state==='thrust'){ e.st-=dt; tryHit(e,{x:e.face>0?e.x:e.x-34,y:e.y-19,w:34,h:9},e.dmg); if(e.st<=0){ e.state='chase'; e.atkCd=1.2; } }
    else if(c.vis&&c.adx<180&&Math.abs(c.dy)<60){ e.face=Math.sign(c.dx)||1; e.vx=approach(e.vx,c.adx>30?e.face*e.spd:0,300*dt); if(c.adx<38&&e.atkCd<=0){ e.state='wind'; e.st=.5; } } else c.patrol(e.spd*.3);
    grav(e,dt); },
  vulture(e,dt,c){ e.walk+=dt*5; const hurtMore=P.life<P.stats.life*.4;
    if(e.state==='wind'){ e.st-=dt; e.vx*=.9; e.vy=-20; if(e.st<=0){ e.state='dive'; e.st=.7; const d=Math.hypot(c.dx,c.dy)||1; e.vx=c.dx/d*280; e.vy=c.dy/d*280; } }
    else if(e.state==='dive'){ e.st-=dt; tryHit(e,eBox(e),e.dmg); if(e.st<=0||solidPx(e.x,e.y+4)){ e.state='climb'; e.st=1; e.atkCd=hurtMore?1.4:rnd(2.6,3.6); } }
    else { const a=time*1.1+e.seed, tx=P.x+Math.cos(a)*60, ty=P.y-90+Math.sin(a*2)*10; e.vx=approach(e.vx,(tx-e.x)*1.4,240*dt); e.vy=approach(e.vy,(ty-e.y)*1.4,240*dt); if(e.state==='climb'){ e.st-=dt; if(e.st<=0) e.state='circle'; } else if(c.vis&&e.atkCd<=0&&Math.hypot(c.dx,c.dy)<200){ e.state='wind'; e.st=.35; AU.noise(.25,3000,1800,2,.2,'bandpass',.3); unlockCodex('vulture'); } }
    e.x+=e.vx*dt; e.y+=e.vy*dt; },
  harpy(e,dt,c){ e.walk+=dt*7;
    if(e.state==='wind'){ e.st-=dt; e.vx*=.85; e.vy*=.85; if(e.st<=0){ e.state='swoop'; e.st=.8; e.sx=e.x; e.sy=e.y; e.dir=Math.sign(c.dx)||1; e.tx=P.x; e.ty=P.y-10; } }
    else if(e.state==='swoop'){ e.st-=dt; const k=1-e.st/.8; e.x=lerp(e.sx,e.tx+e.dir*90,k); e.y=e.sy+(e.ty-e.sy)*Math.sin(k*Math.PI)*1.1; if(!e.hit&&overlap(eBox(e),pBox())){ e.hit=1; hurtPlayer(e.dmg,e); if(P.dash<=0&&meHere()){ P.vx+=e.dir*360; P.vy=Math.min(P.vy,-150); } }
      if(e.st<=0){ e.state='circle'; e.atkCd=rnd(1.8,2.8); e.hit=0; } return; }
    else { const tx=P.x-Math.sign(c.dx||1)*110, ty=P.y-70+Math.sin(time*2+e.seed)*12; e.vx=approach(e.vx,(tx-e.x)*1.6,300*dt); e.vy=approach(e.vy,(ty-e.y)*1.6,300*dt); if(c.vis&&e.atkCd<=0&&Math.hypot(c.dx,c.dy)<220){ e.state='wind'; e.st=.4; AU.shriek&&AU.shriek(); unlockCodex('harpy'); } }
    e.x+=e.vx*dt; e.y+=e.vy*dt; },
  hermit(e,dt,c){ e.walk+=dt*Math.abs(e.vx)*.12;
    if(e.state==='aim'){ e.st-=dt; e.vx=0; if(e.st<=0){ lob('stone',e.x+e.face*6,e.y-20,P.x+P.vx*.5,P.y-6,e.dmg,.75); e.state='chase'; e.atkCd=rnd(1.8,2.6); } }
    else if(e.state==='cast'){ e.st-=dt; e.vx=0; if(e.st<=0){ AU.bell?AU.bell():AU.ting(); for(let i=0;i<3;i++){ const x=P.x+(i-1)*24+rnd(-6,6); RG.rocks.push({x,y:camR.y-20-i*20,vy:0,t:0,warn:.8,gy:findFloor(x,P.y-40)}); } e.state='chase'; e.atkCd=rnd(3,4); } }
    else if(c.vis&&c.adx<240&&Math.abs(c.dy)<140){ e.face=Math.sign(c.dx)||1; const want=c.adx<70?-e.face:c.adx>170?e.face:0; e.vx=approach(e.vx,want*e.spd,200*dt); if(e.atkCd<=0){ if(R()<.3){ e.state='cast'; e.st=.9; } else { e.state='aim'; e.st=.5; } unlockCodex('hermit'); } }
    else c.patrol(e.spd*.4);
    grav(e,dt); },
  footman(e,dt,c){ /* the Hollowed march in step: everyone moves on the same beat */
    const beat=(time*1.25)%1<.62; e.walk+=dt*Math.abs(e.vx)*.12;
    if(e.state==='wind'){ e.st-=dt; e.vx=0; if(e.st<=0){ e.state='chop'; e.st=.24; AU.swing(true); } }
    else if(e.state==='chop'){ const was=e.st; e.st-=dt; if(was>.12&&e.st<=.12){ tryHit(e,{x:e.face>0?e.x:e.x-30,y:e.y-30,w:30,h:30},e.dmg); dust(e.x+e.face*20,e.y,4); } if(e.st<=0){ e.state='chase'; e.atkCd=1.3; } }
    else if(c.vis&&c.adx<220&&Math.abs(c.dy)<60){ e.face=Math.sign(c.dx)||1; e.vx=approach(e.vx,c.adx>26&&beat?e.face*e.spd*1.4:0,500*dt); if(c.adx<34&&Math.abs(c.dy)<30&&e.atkCd<=0){ e.state='wind'; e.st=.45; unlockCodex('footman'); } }
    else c.patrol(beat?e.spd*.5:0);
    grav(e,dt); },
  pikeman(e,dt,c){ e.walk+=dt*Math.abs(e.vx)*.13;
    if(e.state==='brace'){ e.st-=dt; e.vx=0; tryHit(e,{x:e.face>0?e.x:e.x-54,y:e.y-20,w:54,h:10},e.dmg*1.5); if(e.st<=0){ e.state='chase'; e.atkCd=1; } }
    else if(e.state==='wind'){ e.st-=dt; e.vx=approach(e.vx,0,600*dt); if(e.st<=0){ e.state='thrust'; e.st=.22; e.vx=e.face*90; AU.swing(false); } }
    else if(e.state==='thrust'){ e.st-=dt; tryHit(e,{x:e.face>0?e.x:e.x-54,y:e.y-20,w:54,h:9},e.dmg); if(e.st<=0){ e.state='chase'; e.atkCd=1.2; } }
    else if(c.vis&&c.adx<220&&Math.abs(c.dy)<60){ e.face=Math.sign(c.dx)||1;
      if(P.dash>0&&Math.sign(P.vx)===-e.face&&c.adx<90&&e.atkCd<.6){ e.state='brace'; e.st=.3; AU.clang(); sparks(e.x+e.face*30,e.y-16,5,'#fff1c8'); unlockCodex('pikeman'); }
      else { e.vx=approach(e.vx,c.adx>50?e.face*e.spd:c.adx<36?-e.face*e.spd:0,300*dt); if(c.adx<58&&Math.abs(c.dy)<24&&e.atkCd<=0){ e.state='wind'; e.st=.5; unlockCodex('pikeman'); } } }
    else c.patrol(e.spd*.3);
    grav(e,dt); },
  zealot(e,dt,c){ e.walk+=dt*Math.abs(e.vx)*.13;
    if(e.state==='aim'){ e.st-=dt; e.vx=0; if(e.st<=0){ lob('flask',e.x+e.face*6,e.y-22,P.x+P.vx*.4,P.y-4,e.dmg,.8); e.state='chase'; e.atkCd=rnd(2,3); } }
    else if(c.vis&&c.adx<240&&Math.abs(c.dy)<100){ e.face=Math.sign(c.dx)||1; const want=c.adx<80?-e.face:c.adx>170?e.face:0; e.vx=approach(e.vx,want*e.spd,220*dt); if(e.atkCd<=0){ e.state='aim'; e.st=.55; unlockCodex('zealot'); } }
    else c.patrol(e.spd*.4);
    grav(e,dt); }
};
Object.assign(EAI,EAI_M);
/* a fen hag's hex: the ground under you remembers */
function hexCurse(x,y,dmg){ const fy=findFloor(x,y-8); fx.push({t:0,dur:2.4,haz:1,upd(f){ if(!f.h&&f.t>.8&&f.t<1.1&&!P.dead&&Math.abs(P.x-x)<16&&Math.abs(P.y-fy)<12){ f.h=1; hurtPlayer(dmg*1.2,{x,hp:0,dead:true}); P.grabbed=.4; } },
  draw(f){ const sx=x-camR.x, sy=fy-camR.y; if(f.t<.8){ const a=.25+.35*Math.abs(Math.sin(f.t*14)); ectx.fillStyle=`rgba(150,80,170,${a.toFixed(2)})`; ectx.fillRect(Math.round(sx-16),Math.round(sy-1),32,2); }
    else if(f.t<1.4){ const k=1-(f.t-.8)/.6; for(let i=-3;i<=3;i++){ ectx.fillStyle=`rgba(180,110,200,${(.7*k).toFixed(2)})`; ectx.fillRect(Math.round(sx+i*4),Math.round(sy-14*k-Math.abs(i)),1,Math.round(14*k)); } } }}); }

/* ---------- sprites (feet at 0,0; facing right) ---------- */
function dScarecrow(c,e){ const still=e.state==='still', wk=still?0:Math.round(Math.sin(e.walk)*2);
  rect(c,-1,-30,2,30,'#2b302b'); rect(c,-11,-24,22,2,'#2b302b'); c.fillStyle='#55614f'; c.beginPath(); c.moveTo(-6,-23); c.lineTo(6,-23); c.lineTo(8+wk,-6); c.lineTo(-8-wk,-6); c.fill();
  for(let i=0;i<5;i++) rect(c,-11+i,-22,1,4+i%2*2,'#a69357'); for(let i=0;i<5;i++) rect(c,7+i,-22,1,4+(i+1)%2*2,'#a69357');
  rect(c,-4,-31,8,8,'#a69357'); rect(c,-5,-32,10,1,'#2b302b'); c.fillStyle='#2b302b'; c.beginPath(); c.moveTo(-7,-31); c.lineTo(7,-31); c.lineTo(0,-38); c.fill();
  rect(c,-2,-28,1,1,'#120c0c'); rect(c,2,-28,1,1,'#120c0c'); for(let i=-2;i<=2;i++) rect(c,i,-25,1,1,'#120c0c');
  if(!still){ c.save(); c.translate(8,-20); c.rotate(e.state==='cut'?.6:e.state==='wind'?-1.4:-.4); rect(c,0,-.5,9,1,'#3a3028'); c.fillStyle='#8a8478'; c.beginPath(); c.arc(9,-4,4,Math.PI*.4,Math.PI*1.4,true); c.fill(); c.restore(); } }
function dCrow(c,e){ const fl=e.fly?Math.sin(e.walk*3):0; rect(c,-4,-5,7,4,'#141012'); rect(c,3,-6,3,3,'#141012'); rect(c,6,-5,2,1,'#5a5054'); rect(c,4,-5,1,1,'#b0141a');
  if(e.fly){ c.fillStyle='#141012'; c.beginPath(); c.moveTo(-2,-4); c.lineTo(-6,-4-fl*6); c.lineTo(2,-4); c.fill(); c.beginPath(); c.moveTo(-1,-4); c.lineTo(2,-4-fl*-5); c.lineTo(4,-4); c.fill(); } else { rect(c,-6,-4,2,2,'#141012'); rect(c,-1,-1,1,1,'#3a3236'); rect(c,1,-1,1,1,'#3a3236'); } }
function dRider(c,e){ const g=e.state==='charge'?Math.sin(e.walk*4)*2:Math.sin(e.walk*2), rear=e.state==='wind'?-.25:0; c.save(); c.rotate(rear);
  rect(c,-12,-18,22,9,'#2a2420'); rect(c,8,-24,4,8,'#2a2420'); rect(c,10,-27,6,5,'#2a2420'); rect(c,15,-25,2,2,'#141012'); rect(c,-13,-18,2,6,'#1a1612');
  for(const [x,o] of [[-10,g],[-6,-g],[4,-g],[8,g]]) rect(c,x,-9+Math.min(0,o),2,9-Math.min(0,o),'#1a1612');
  rect(c,-4,-30,7,12,'#4a3a2a'); rect(c,-4,-30,7,1,'#6a5a3a'); rect(c,-3,-35,5,5,'#c8b49a'); rect(c,-4,-36,7,2,'#2a2018'); rect(c,1,-34,1,1,'#120c0c');
  c.save(); c.translate(2,-24); c.rotate(e.state==='charge'?0:-.5); rect(c,0,-.5,26,1,'#5a4a30'); rect(c,25,-1.5,4,3,'#cfc6b2'); c.restore(); c.restore(); }
function dFenhag(c,e){ c.globalAlpha=e.alpha==null?1:e.alpha; c.fillStyle='#2a1c30'; c.beginPath(); c.moveTo(-6,0); c.lineTo(-4,-18); c.lineTo(4,-20); c.lineTo(7,0); c.fill(); for(let i=0;i<4;i++) rect(c,-5+i*3,-2,1,3+i%2*2,'#4a2f4f');
  rect(c,-1,-25,6,6,'#a9b46c'); rect(c,-3,-26,9,3,'#141012'); rect(c,-4,-24,2,12,'#141012'); rect(c,2,-22,1,1,'#120c0c');
  const up=e.state==='cast'; rect(c,4,up?-28:-16,1,up?10:7,'#a9b46c'); for(let i=0;i<4;i++) rect(c,4+i,up?-30:-10,1,3,'#a9b46c'); c.globalAlpha=1; }
function dDrowner(c,e){ if(e.state==='sunk'){ rect(c,-4,-2,8,2,'#1e2a1c'); return; } const wk=Math.round(Math.sin(e.walk)*2);
  rect(c,-3+wk,-8,2,8,'#3a4a34'); rect(c,1-wk,-8,2,8,'#3a4a34'); rect(c,-5,-19,10,11,'#4a5a3e'); rect(c,-5,-19,10,1,'#6a7a52'); for(let i=0;i<3;i++) rect(c,-4+i*3,-14,1,6,'#2e3a28');
  rect(c,-3,-24,6,5,'#8a9a6a'); rect(c,-4,-25,8,2,'#1e2a1c'); rect(c,1,-22,1,1,'#120c0c'); rect(c,-1,-22,1,1,'#120c0c');
  const cl=e.state==='claw'||e.state==='grab'; rect(c,4,cl?-18:-14,cl?8:3,1.5,'#8a9a6a'); for(let i=0;i<3;i++) rect(c,cl?11:6,(cl?-20:-13)+i,2,1,'#d8ccb0'); }
function dLantern(c,e){ rect(c,-2,-4,4,5,'#2a2a20'); rect(c,-3,-5,6,1,'#2a2a20'); }
function dLeech(c,e){ const s=Math.sin(e.walk)*1; rect(c,-4,-3,8,3+s*.5,'#2a1c22'); rect(c,-4,-3,8,1,'#4a2f3f'); rect(c,3,-2,2,1,'#6a0e10'); }
function dSaltWraith(c,e){ c.globalAlpha=(e.alpha==null?1:e.alpha)*.9; c.fillStyle='#ebe4d2'; c.beginPath(); c.moveTo(-6,-4); c.quadraticCurveTo(-7,-16,0,-19); c.quadraticCurveTo(7,-16,6,-4); for(let i=0;i<5;i++) c.lineTo(5-i*2.6,-(i%2?0:3)+Math.sin(time*6+i)*1.5); c.fill();
  rect(c,-3,-15,2,2,'#2a211c'); rect(c,1,-15,2,2,'#2a211c'); rect(c,-1,-11,2,3,'#2a211c'); c.globalAlpha=1; }
function dBuried(c,e){ if(e.state==='buried'){ rect(c,-4,-3,8,3,'#6b6460'); rect(c,-3,-4,6,1,'#8a8478'); rect(c,4,-6,1,4,'#cdbf9e'); return; } const wk=Math.round(Math.sin(e.walk)*2), rise=e.state==='rise'?Math.round(e.st/.7*18):0; c.save(); c.translate(0,rise);
  rect(c,-3+wk,-9,2,9,'#6a5e4a'); rect(c,1-wk,-9,2,9,'#6a5e4a'); rect(c,-5,-21,10,12,'#8a7a5a'); rect(c,-5,-21,10,1,'#f2ecd8'); rect(c,-5,-17,10,1,'#b0141a'); rect(c,-5,-13,10,1,'#f2ecd8');
  rect(c,-3,-26,6,5,'#cdbf9e'); rect(c,-4,-28,8,3,'#6b6460'); rect(c,-1,-24,1,1,'#2a211c'); rect(c,2,-24,1,1,'#2a211c');
  c.save(); c.translate(4,-16); c.rotate(e.state==='thrust'?0:-.3); rect(c,0,-.5,18,1,'#5a4a30'); rect(c,17,-1,4,2,'#8a8478'); c.restore(); c.restore(); }
function dVulture(c,e){ const fl=Math.sin(e.walk*1.4); rect(c,-5,-5,10,4,'#2a211c'); rect(c,4,-7,3,3,'#c8a090'); rect(c,6,-6,2,1,'#e2d2a6'); c.fillStyle='#2a211c'; c.beginPath(); c.moveTo(-4,-4); c.lineTo(-12,-6-fl*5); c.lineTo(2,-4); c.fill(); c.beginPath(); c.moveTo(-2,-4); c.lineTo(8,-8+fl*5); c.lineTo(4,-3); c.fill(); }
function dHarpy(c,e){ const fl=Math.sin(e.walk); rect(c,-3,-14,6,10,'#4a4448'); rect(c,-2,-18,4,4,'#b8a898'); rect(c,-3,-19,6,2,'#2a2428'); rect(c,1,-17,1,1,'#b0141a');
  c.fillStyle='#2a2e34'; c.beginPath(); c.moveTo(-2,-12); c.lineTo(-14,-14-fl*6); c.lineTo(-8,-6); c.fill(); c.beginPath(); c.moveTo(2,-12); c.lineTo(12,-15+fl*6); c.lineTo(7,-6); c.fill(); rect(c,-2,-4,1,4,'#8a8478'); rect(c,1,-4,1,4,'#8a8478'); rect(c,-3,0,3,1,'#cdbf9e'); rect(c,1,0,3,1,'#cdbf9e'); }
function dHermit(c,e){ const wk=Math.round(Math.sin(e.walk)*1.5); c.fillStyle='#454d55'; c.beginPath(); c.moveTo(-6,0); c.lineTo(-4,-18); c.lineTo(4,-18); c.lineTo(6,0); c.fill(); rect(c,-3+wk,-1,2,1,'#121418');
  rect(c,-3,-24,7,6,'#e7e9e7'); rect(c,-1,-22,1,2,'#121418'); rect(c,2,-22,1,2,'#121418'); c.fillStyle='#b8bdc0'; c.beginPath(); c.moveTo(-3,-24); c.quadraticCurveTo(-9,-30,-5,-32); c.lineTo(-2,-25); c.fill(); c.beginPath(); c.moveTo(4,-24); c.quadraticCurveTo(10,-30,6,-32); c.lineTo(3,-25); c.fill();
  const up=e.state==='aim'||e.state==='cast'; rect(c,4,up?-26:-16,1.5,up?10:8,'#454d55'); if(e.state==='cast'){ rect(c,3,-31,4,4,'#b08a4a'); } }
function dFootman(c,e){ const wk=Math.round(Math.sin(e.walk)*2), up=e.state==='wind', ch=e.state==='chop';
  rect(c,-4+wk,-10,3,10,'#2a2e34'); rect(c,1-wk,-10,3,10,'#32363c'); rect(c,-6,-22,12,12,'#4a4642'); rect(c,-6,-22,12,1,'#7a746c'); rect(c,-6,-15,12,1,'#2a2420');
  rect(c,-4,-29,8,7,'#3a3a40'); rect(c,-4,-29,8,1,'#7a7478'); rect(c,-1,-26,4,2,'#050304'); rect(c,0,-26,1,1,'#000');
  rect(c,-9,-24,5,16,'#3a2a20'); rect(c,-9,-24,5,1,'#6a5a3a'); rect(c,-8,-17,3,2,'#5a1414');
  c.save(); c.translate(5,-20); c.rotate(up?-2.2:ch?.9:.2); rect(c,0,-1,14,2,'#8a8478'); rect(c,0,-1.5,3,3,'#3a2a20'); c.restore(); }
function dPikeman(c,e){ const wk=Math.round(Math.sin(e.walk)*2), th=e.state==='thrust'||e.state==='brace';
  rect(c,-3+wk,-10,2,10,'#2a2e34'); rect(c,1-wk,-10,2,10,'#32363c'); rect(c,-5,-22,10,12,'#42403c'); rect(c,-5,-22,10,1,'#6a6660');
  rect(c,-3,-28,7,6,'#3a3a40'); rect(c,-4,-28,9,1,'#6a6668'); rect(c,1,-26,3,1,'#050304');
  c.save(); c.translate(-6,-17); c.rotate(e.state==='brace'?-.15:e.state==='wind'?.15:0); rect(c,th?10:0,-.5,46,1,'#5a4a30'); rect(c,th?55:45,-1.5,6,3,'#b8b0a0'); c.restore(); }
function dZealot(c,e){ const wk=Math.round(Math.sin(e.walk)*2); c.fillStyle='#3a2a20'; c.beginPath(); c.moveTo(-6,0); c.lineTo(-4,-19); c.lineTo(4,-19); c.lineTo(6,0); c.fill(); rect(c,-3+wk,-1,2,1,'#1a1210');
  rect(c,-3,-25,6,6,'#c8a890'); rect(c,-4,-26,8,2,'#2a1a10'); rect(c,1,-23,1,1,'#120c0c'); rect(c,-1,-21,3,1,'#6a1a14');
  const up=e.state==='aim'; rect(c,4,up?-27:-14,1.5,up?10:6,'#3a2a20'); rect(c,3,up?-31:-10,4,4,'#5a4a30'); }
Object.assign(EDRAW,{scarecrow:dScarecrow,crow:dCrow,rider:dRider,fenhag:dFenhag,drowner:dDrowner,lantern:dLantern,leech:dLeech,saltwraith:dSaltWraith,buried:dBuried,vulture:dVulture,harpy:dHarpy,hermit:dHermit,footman:dFootman,pikeman:dPikeman,zealot:dZealot});
(function(){ const o=enemyEmis; enemyEmis=function(e,g){ const t=e.type;
  if(t==='lantern'){ const a=.6+.4*Math.sin(time*4+e.seed)+(e.lure?.3:0); g.fillStyle=`rgba(190,220,120,${Math.min(1,a).toFixed(2)})`; g.fillRect(-1,-3,2,3); return; }
  if(t==='footman'||t==='pikeman'){ g.fillStyle='rgba(0,0,0,0)'; return; }
  if(t==='scarecrow'&&e.state!=='still'){ g.fillStyle='rgba(255,40,30,.8)'; g.fillRect(-2,-28,1,1); g.fillRect(2,-28,1,1); return; }
  return o(e,g); }; })();
(function(){ const o=enemyLight; enemyLight=function(e){ if(e.type==='lantern'&&!e.dead) addLight(e.x,e.y-2,e.lure?90:60,e.lure?1.1:.7,.75,1,.5); if(e.type==='zealot'&&!e.dead) addLight(e.x+e.face*5,e.y-14,40,.5,1,.6,.3); return o(e); }; })();
