'use strict';
/* ===== Hollowmere (v24): Act II foes =====
   Act II never jump-scares; it never lets you relax. Foes start friendly or still, and turn when you're close.
   - 村人 Villager: works, smiles, watches you pass. Turns with a pitchfork, sickle or flail when you're close.
   - 巾着切り Cutpurse: the Gilded Debtor reversed. Bumps you, takes your crowns, runs. Kill it to get them back.
   - 鼠王 Rat King: a knot of rats tied by their tails. Sheds rats as it comes.
   - 膨れ乞食 Bloated Beggar: sits by a door with its bowl. Lurches up and bursts in a cloud of rot.
   - 疫病医 Plague Doctor: keeps its distance, throws vials that leave rot hanging in the air.
   - 虚ろの衛兵 Hollowed Guard: the city watch, black-eyed; a wide halberd sweep after a long draw.
   - 十分の一取り Tithe-Taker: throws a chain, drags you in, strikes.
   - 夜警の鐘 Curfew Bellman: rings for help. Stop the bell and no one comes.
   - 屋根の怪物 Gargoyle: stone on the eaves until you pass under. Untouchable while it's still.
   - 攻城工兵 Siege Engineer: bombs with a fuse; the ground under them glows red first.
   - 仮面の貴族 Masked Noble: dances in, a rapier flurry, dances out.
   - 糸の踊り子 String-Dancer: a dancer on strings from the ceiling, jerked about by something above.
   - 黒目の召使 Black-Eyed Servant: carries a tray. Throws the knives on it.
   - 王の手の騎士 Knight of the Hand: red-lacquered plate; a three-blow chain and a shoulder charge. */
Object.assign(EDEF,{
  villager:{w:11,h:22,hp:34,dmg:11,spd:46,xp:12,name:'Villager'},
  cutpurse:{w:10,h:20,hp:22,dmg:4,spd:120,xp:20,name:'Cutpurse'},
  ratking:{w:18,h:12,hp:60,dmg:10,spd:30,xp:26,name:'Rat King'},
  rat:{w:7,h:4,hp:5,dmg:3,spd:100,xp:1,name:'Rat'},
  beggar:{w:14,h:16,hp:30,dmg:20,spd:28,xp:12,name:'Bloated Beggar'},
  plague:{w:12,h:26,hp:40,dmg:9,spd:30,xp:20,name:'Plague Doctor'},
  guard:{w:13,h:27,hp:64,dmg:16,spd:34,xp:22,name:'Hollowed Guard'},
  taker:{w:13,h:26,hp:55,dmg:13,spd:36,xp:26,name:'Tithe-Taker'},
  bellman:{w:12,h:24,hp:30,dmg:8,spd:40,xp:18,name:'Curfew Bellman'},
  gargoyle:{w:16,h:14,hp:45,dmg:14,spd:120,xp:20,name:'Gargoyle'},
  engineer:{w:12,h:24,hp:36,dmg:16,spd:34,xp:18,name:'Siege Engineer'},
  noble:{w:11,h:26,hp:40,dmg:9,spd:70,xp:20,name:'Masked Noble'},
  puppet:{w:11,h:24,hp:30,dmg:10,spd:60,xp:16,fly:1,name:'String-Dancer'},
  servant:{w:11,h:24,hp:30,dmg:9,spd:34,xp:14,name:'Black-Eyed Servant'},
  handknight:{w:15,h:30,hp:130,dmg:19,spd:44,xp:44,name:'Knight of the Hand'}});
NO_RANK.add('rat');
CODEX.push(
  {id:'villager',k:'村人',t:'The Villagers',x:'The harvest came in and the festival went on, because the King said it would. They smile at the gate and they smile at you. Every tenth door has a mark on it.'},
  {id:'cutpurse',k:'巾着切り',t:'Cutpurses',x:'In a city that takes one soul in ten, a crown in the hand is a crown that can\'t be tithed.'},
  {id:'ratking',k:'鼠王',t:'The Rat King',x:'They are what the tithe-carts leave behind. Tied by the tails, they move as one animal and want the same thing.'},
  {id:'beggar',k:'膨れ乞食',t:'Bloated Beggars',x:'The plague was never declared. It was simply not counted. They wait by the doors where the soup used to come.'},
  {id:'plague',k:'疫病医',t:'Plague Doctors',x:'The King sent them to cure the lower city. They carry their cures in glass, and they throw them.'},
  {id:'guard',k:'虚ろ衛兵',t:'The Hollowed Watch',x:'Men you trained, on walls you built. They watch the streets for curfew. They don\'t blink. They are waiting for an order that tells them who you are.'},
  {id:'taker',k:'十分取',t:'Tithe-Takers',x:'The Collector\'s hands in the street. The chain is the one the carts use. The hook has a number scratched on it.'},
  {id:'bellman',k:'夜警',t:'Curfew Bellmen',x:'One bell for curfew. One for the tithe. A third, if anyone runs.'},
  {id:'gargoyle',k:'屋根鬼',t:'Gargoyles',x:'The cathedral\'s rain-spouts. Since the coronation, the rain does not come out of their mouths.'},
  {id:'engineer',k:'工兵',t:'Siege Engineers',x:'General Brann\'s sappers. They have been mining under their own city for a month, in case it needs to be reminded.'},
  {id:'noble',k:'仮面',t:'Masked Nobles',x:'The new court wears masks to the feast so that no one has to see who is still smiling.'},
  {id:'puppet',k:'糸踊り',t:'String-Dancers',x:'The ball never ended. Something above the ballroom took up the strings when the dancers got tired.'},
  {id:'servant',k:'黒目',t:'Black-Eyed Servants',x:'They swore, the same as everyone. The oath went into their eyes first.'},
  {id:'handknight',k:'手の騎士',t:'Knights of the Hand',x:'Ser Gideon\'s own. Red lacquer, so the blood doesn\'t show.'});
for(const c of CODEX.slice(-14)) CX[c.id]=c;
for(const t of ['villager','cutpurse','ratking','beggar','plague','guard','taker','bellman','gargoyle','engineer','noble','puppet','servant','handknight']) TYPE_CODEX[t]=t;
TYPE_CODEX.rat='ratking';

let CITY_LOAD=false;
(function(){ const o=loadLevel; loadLevel=function(idx,opt){ CITY_LOAD=true; try{ return o(idx,opt); } finally{ CITY_LOAD=false; } }; })();
(function(){ const o=mkEnemy; mkEnemy=function(s){ const e=o(s);
  if(e.type==='villager'){ e.state=CITY_LOAD&&!s.pack?'idle':'chase'; e.arm=['fork','sickle','flail'][Math.floor(e.seed*3)%3]; e.intro=e.state==='idle'; }
  if(e.type==='beggar'&&CITY_LOAD){ e.state='sit'; }
  if(e.type==='gargoyle'&&CITY_LOAD&&!s.pack){ /* perch it on the nearest eave above */ const tx=Math.floor(e.x/T); let ty=Math.floor(e.y/T)-1; for(let k=0;k<9;k++,ty--){ if(tileAt(tx,ty-1)===1||tileAt(tx,ty-1)===2){ break; } } e.y=(ty+1)*T-1; e.state='perch'; e.fly=true; e.intro=true; }
  if(e.type==='puppet'){ e.hy=e.y-10; e.strings=3; }
  if(e.type==='handknight') e.combo=0;
  return e; }; })();
/* a gargoyle is stone while it waits */
(function(){ const o=dmgEnemy; dmgEnemy=function(e,...a){ if(e&&e.type==='gargoyle'&&e.state==='perch'){ AU.clang(); sparks(e.x,e.y-6,4,'#cfc6b2'); return; } if(e&&e.type==='villager'&&e.state==='idle'){ e.state='turn'; e.st=.2; e.intro=false; } return o(e,...a); }; })();
/* the cutpurse gives back what it took */
(function(){ const o=killEnemy; killEnemy=function(e,dir,crit){ const had=e&&e.type==='cutpurse'&&!e.dead?e.stolen||0:0; o(e,dir,crit); if(had>0&&e.dead){ dropGold(e.x,e.y-10,had); toast(`Your ${had} crowns, back.`); } if(e&&e.type==='beggar'&&e.dead&&!e.burst){ e.burst=1; foeCloud(e.x,e.y-8,36,e.dmg*.3,4); } }; })();

const EAI_C={
  villager(e,dt,c){ e.walk+=dt*Math.abs(e.vx)*.14;
    if(e.state==='idle'){ e.vx=0; e.work=(e.work||0)+dt; if(c.vis&&c.adx<130&&Math.abs(c.dy)<50) e.face=Math.sign(c.dx)||e.face; if(c.vis&&c.adx<52&&Math.abs(c.dy)<36){ e.state='turn'; e.st=.45; e.intro=false; AU.tone('triangle',220,180,.4,.05,.3); } grav(e,dt); return; }
    if(e.state==='turn'){ e.st-=dt; e.vx=0; if(e.st<=0){ e.state='chase'; e.atkCd=.2; unlockCodex('villager'); } grav(e,dt); return; }
    if(e.state==='wind'){ e.st-=dt; e.vx=approach(e.vx,0,600*dt); if(e.st<=0){ e.state='hit'; e.st=.22; e.vx=e.face*(e.arm==='fork'?150:90); AU.swing(false); } }
    else if(e.state==='hit'){ e.st-=dt; const box=e.arm==='fork'?{x:e.face>0?e.x:e.x-36,y:e.y-17,w:36,h:8}:e.arm==='flail'?{x:e.x-26,y:e.y-26,w:52,h:22}:{x:e.face>0?e.x:e.x-24,y:e.y-22,w:24,h:16}; tryHit(e,box,e.dmg); if(e.st<=0){ e.state='chase'; e.atkCd=1.1; } }
    else if(c.vis&&c.adx<220&&Math.abs(c.dy)<60){ e.face=Math.sign(c.dx)||1; e.vx=approach(e.vx,c.adx>24?e.face*e.spd:0,320*dt); if(c.adx<(e.arm==='fork'?40:30)&&Math.abs(c.dy)<26&&e.atkCd<=0){ e.state='wind'; e.st=.42; } } else c.patrol(e.spd*.3);
    grav(e,dt); },
  cutpurse(e,dt,c){ e.walk+=dt*Math.abs(e.vx)*.2;
    if(e.state==='flee'){ e.face=-Math.sign(c.dx)||e.face; e.vx=approach(e.vx,e.face*e.spd*1.2,600*dt); if(e.hitWall&&e.onGround) e.vy=-300; e.st-=dt; if(e.st<=0&&c.adx>W*.7){ e.dead=true; e.deadT=9; toast(`The cutpurse got away with ${e.stolen} crowns.`); } grav(e,dt); return; }
    if(c.vis&&c.adx<240&&Math.abs(c.dy)<60){ e.face=Math.sign(c.dx)||1; e.vx=approach(e.vx,e.face*e.spd,500*dt); if(c.adx<10&&Math.abs(c.dy)<20&&P.dash<=0&&P.gold>0&&meHere()){ const n=Math.min(P.gold,Math.max(5,Math.round(P.gold*.3))); P.gold-=n; e.stolen=(e.stolen||0)+n; e.state='flee'; e.st=6; num(P.x,P.y-30,'-'+n,'#ffd27a'); AU.coin&&AU.coin(); unlockCodex('cutpurse'); toast('A cutpurse took your crowns. Kill it to get them back.'); }
      else if(c.adx<10&&Math.abs(c.dy)<20&&e.atkCd<=0){ tryHit(e,eBox(e),e.dmg); e.atkCd=1; } } else c.patrol(e.spd*.3);
    if(e.hitWall&&e.onGround&&c.vis) e.vy=-280; grav(e,dt); },
  ratking(e,dt,c){ e.walk+=dt*3;
    if(c.vis&&c.adx<240&&Math.abs(c.dy)<80){ e.face=Math.sign(c.dx)||1; e.vx=approach(e.vx,c.adx>16?e.face*e.spd:0,200*dt); if(c.adx<22&&e.atkCd<=0){ tryHit(e,eBox(e),e.dmg); e.atkCd=1; }
      e.st=(e.st||3)-dt; if(e.st<=0){ e.st=rnd(2.6,3.6); const mine=enemies.filter(o=>!o.dead&&o.from===e).length; for(let i=0;i<Math.min(3,5-mine);i++){ const m=mkEnemyAt('rat',e.x+rnd(-6,6),e.y); m.from=e; m.vy=-140; m.vx=rnd(-80,80); enemies.push(m); } AU.noise(.3,4000,2000,2,.2,'bandpass',.3); unlockCodex('ratking'); } }
    else c.patrol(e.spd*.4); grav(e,dt); },
  rat(e,dt,c){ e.walk+=dt*12; if(c.vis&&c.adx<200&&Math.abs(c.dy)<40){ e.face=Math.sign(c.dx)||1; e.vx=approach(e.vx,e.face*e.spd,500*dt); if(c.adx<8&&e.atkCd<=0){ tryHit(e,eBox(e),e.dmg); e.atkCd=.8; e.vx=-e.face*80; } } else c.patrol(e.spd*.5); if(e.hitWall&&e.onGround) e.vy=-200; grav(e,dt); },
  beggar(e,dt,c){ e.walk+=dt*Math.abs(e.vx)*.1;
    if(e.state==='sit'){ e.vx=0; if(c.vis&&c.adx<46&&Math.abs(c.dy)<30){ e.state='wind'; e.st=.6; AU.growl(); unlockCodex('beggar'); } grav(e,dt); return; }
    if(e.state==='wind'){ e.st-=dt; e.vx=0; e.swell=(e.swell||0)+dt; if(e.st<=0){ e.state='lurch'; e.st=.5; e.vx=Math.sign(c.dx||1)*120; e.vy=-140; } }
    else if(e.state==='lurch'){ e.st-=dt; if(overlap(eBox(e),pBox())||e.st<=0){ e.hp=0; e.burst=1; hurtPlayer(c.adx<26?e.dmg:e.dmg*.4,e); foeCloud(e.x,e.y-8,38,e.dmg*.3,4.5); for(let i=0;i<18;i++) part({x:e.x,y:e.y-8,vx:rnd(-140,140),vy:rnd(-160,-20),g:400,life:.6,col:pick(['#6a6a32','#8a8a4a','#4a1a14'])}); killEnemy(e,1,false); AU.gore&&AU.gore(); return; } }
    else if(c.vis&&c.adx<160){ e.face=Math.sign(c.dx)||1; e.vx=approach(e.vx,e.face*e.spd,200*dt); if(c.adx<30) { e.state='wind'; e.st=.5; } } else e.vx=approach(e.vx,0,200*dt);
    grav(e,dt); },
  plague(e,dt,c){ e.walk+=dt*Math.abs(e.vx)*.12;
    if(e.state==='aim'){ e.st-=dt; e.vx=0; if(e.st<=0){ lob('vial',e.x+e.face*6,e.y-22,P.x+P.vx*.4,P.y-4,e.dmg,.8); e.state='chase'; e.atkCd=rnd(2.2,3); } }
    else if(c.vis&&c.adx<250&&Math.abs(c.dy)<110){ e.face=Math.sign(c.dx)||1; const want=c.adx<90?-e.face:c.adx>180?e.face:0; e.vx=approach(e.vx,want*e.spd,220*dt); if(e.atkCd<=0){ e.state='aim'; e.st=.6; unlockCodex('plague'); } }
    else c.patrol(e.spd*.4); grav(e,dt); },
  guard(e,dt,c){ e.walk+=dt*Math.abs(e.vx)*.12;
    if(e.state==='draw'){ e.st-=dt; e.vx=0; if(e.st<=0){ e.state='sweep'; e.st=.28; AU.swing(true); } }
    else if(e.state==='sweep'){ const was=e.st; e.st-=dt; if(was>.16&&e.st<=.16) tryHit(e,{x:e.face>0?e.x-8:e.x-44,y:e.y-26,w:52,h:22},e.dmg); if(e.st<=0){ e.state='chase'; e.atkCd=1.4; } }
    else if(c.vis&&c.adx<220&&Math.abs(c.dy)<60){ e.face=Math.sign(c.dx)||1; e.vx=approach(e.vx,c.adx>40?e.face*e.spd:0,300*dt); if(c.adx<46&&Math.abs(c.dy)<28&&e.atkCd<=0){ e.state='draw'; e.st=.6; unlockCodex('guard'); } }
    else c.patrol(e.spd*.3); grav(e,dt); },
  taker(e,dt,c){ e.walk+=dt*Math.abs(e.vx)*.12;
    if(e.state==='aim'){ e.st-=dt; e.vx=0; if(e.st<=0){ e.state='chain'; e.st=.5; e.cx=e.x; e.cy=e.y-18; e.cvx=e.face*420; AU.chain(); } }
    else if(e.state==='chain'){ e.st-=dt; e.cx+=e.cvx*dt; if(!P.dead&&P.dash<=0&&Math.abs(e.cx-P.x)<8&&Math.abs(e.cy-(P.y-14))<14){ e.state='drag'; e.st=.5; hurtPlayer(e.dmg*.5,e); } else if(e.st<=0||solidPx(e.cx,e.cy)){ e.state='chase'; e.atkCd=1.6; } }
    else if(e.state==='drag'){ e.st-=dt; if(meHere()) P.vx=Math.sign(e.x-P.x)*260; e.cx=P.x; e.cy=P.y-14; if(e.st<=0||Math.abs(P.x-e.x)<22){ e.state='wind'; e.st=.25; } }
    else if(e.state==='wind'){ e.st-=dt; e.vx=0; if(e.st<=0){ e.state='strike'; e.st=.2; AU.swing(true); } }
    else if(e.state==='strike'){ e.st-=dt; tryHit(e,{x:e.face>0?e.x:e.x-28,y:e.y-24,w:28,h:20},e.dmg); if(e.st<=0){ e.state='chase'; e.atkCd=2; } }
    else if(c.vis&&c.adx<240&&Math.abs(c.dy)<30){ e.face=Math.sign(c.dx)||1; e.vx=approach(e.vx,c.adx>60?e.face*e.spd:0,300*dt); if(e.atkCd<=0&&c.adx>50&&c.adx<200){ e.state='aim'; e.st=.55; unlockCodex('taker'); } else if(c.adx<30&&e.atkCd<=0){ e.state='wind'; e.st=.4; } }
    else c.patrol(e.spd*.3); grav(e,dt); },
  bellman(e,dt,c){ e.walk+=dt*Math.abs(e.vx)*.12;
    if(e.state==='cast'){ e.st-=dt; e.vx=0; if(((e.st*2.5)|0)!==((e.st*2.5+dt*2.5)|0)) AU.bell?AU.bell():AU.ting(); if(e.st<=0){ e.state='chase'; e.atkCd=9; for(let i=0;i<2;i++){ const side=i?1:-1, x=clamp(P.x+side*rnd(200,260),2*T,(L.w-2)*T); const m=mkEnemyAt(L.def.look==='villages'?'villager':'guard',x,findFloor(x,P.y-60)); m.state='chase'; m.intro=false; enemies.push(m); } toast('The bell brought the watch.'); } }
    else if(c.vis&&c.adx<230&&Math.abs(c.dy)<80){ e.face=Math.sign(c.dx)||1; if(e.atkCd<=0){ e.state='cast'; e.st=2; unlockCodex('bellman'); toast('A bellman is ringing for help. Stop him.'); } else { e.vx=approach(e.vx,c.adx<80?-e.face*e.spd:0,250*dt); if(c.adx<24&&(e.hitT||0)<=0){ tryHit(e,eBox(e),e.dmg); e.hitT=1; } } e.hitT=(e.hitT||0)-dt; }
    else c.patrol(e.spd*.3); grav(e,dt); },
  gargoyle(e,dt,c){ e.walk+=dt*6;
    if(e.state==='perch'){ e.vx=e.vy=0; if(c.vis&&c.adx<40&&c.dy>10&&c.dy<160){ e.state='drop'; e.intro=false; e.vy=60; AU.noise(.4,800,200,2,.3,'bandpass',.3); unlockCodex('gargoyle'); } return; }
    if(e.state==='drop'){ e.vy+=900*dt; e.x+=e.vx*dt; e.y+=e.vy*dt; tryHit(e,eBox(e),e.dmg); if(solidPx(e.x,e.y+1)||e.y>P.y+20){ e.state='land'; e.st=1.1; e.fly=false; shake(4); dust(e.x,e.y,10); AU.slam(); } return; }
    if(e.state==='land'){ e.st-=dt; e.vx=0; if(e.st<=0){ e.state='hover'; e.fly=true; e.atkCd=1; } grav(e,dt); return; }
    const tx=P.x-Math.sign(c.dx||1)*60, ty=P.y-60; e.vx=approach(e.vx,(tx-e.x)*1.4,280*dt); e.vy=approach(e.vy,(ty-e.y)*1.4,280*dt);
    if(e.state==='wind'){ e.st-=dt; e.vx*=.8; e.vy*=.8; if(e.st<=0){ e.state='drop'; e.vx=c.dx*1.2; e.vy=40; } }
    else if(e.atkCd<=0&&c.vis&&Math.hypot(c.dx,c.dy)<160){ e.state='wind'; e.st=.45; }
    e.x+=e.vx*dt; e.y+=e.vy*dt; },
  engineer(e,dt,c){ e.walk+=dt*Math.abs(e.vx)*.12;
    if(e.state==='aim'){ e.st-=dt; e.vx=0; if(e.st<=0){ lob('bomb',e.x+e.face*6,e.y-22,P.x+P.vx*.3,P.y-4,e.dmg,.85); e.state='chase'; e.atkCd=rnd(2.4,3.2); } }
    else if(c.vis&&c.adx<260&&Math.abs(c.dy)<110){ e.face=Math.sign(c.dx)||1; const want=c.adx<100?-e.face:c.adx>190?e.face:0; e.vx=approach(e.vx,want*e.spd,220*dt); if(e.atkCd<=0){ e.state='aim'; e.st=.55; unlockCodex('engineer'); } }
    else c.patrol(e.spd*.4); grav(e,dt); },
  noble(e,dt,c){ e.walk+=dt*Math.abs(e.vx)*.18; e.spin=(e.spin||0)+dt*4;
    if(e.state==='wind'){ e.st-=dt; e.vx=approach(e.vx,0,800*dt); if(e.st<=0){ e.state='flurry'; e.st=.6; e.i=0; } }
    else if(e.state==='flurry'){ e.st-=dt; e.vx=e.face*60; if(e.st<.6-e.i*.15&&e.i<4){ e.i++; AU.swing(false); tryHit(e,{x:e.face>0?e.x:e.x-30,y:e.y-20,w:30,h:6},e.dmg); } if(e.st<=0){ e.state='retreat'; e.st=.5; } }
    else if(e.state==='retreat'){ e.st-=dt; e.vx=-e.face*e.spd*1.4; if(e.st<=0){ e.state='chase'; e.atkCd=rnd(1.4,2.2); } }
    else if(c.vis&&c.adx<220&&Math.abs(c.dy)<60){ e.face=Math.sign(c.dx)||1; e.vx=approach(e.vx,c.adx>70?e.face*e.spd:c.adx<40?-e.face*e.spd*.6:Math.sin(time*3+e.seed)*e.spd*.6,400*dt); if(c.adx<56&&e.atkCd<=0){ e.state='wind'; e.st=.35; unlockCodex('noble'); } }
    else c.patrol(e.spd*.3); grav(e,dt); },
  puppet(e,dt,c){ e.walk+=dt*5; const jerk=Math.sin(time*7+e.seed)>.85?1:0;
    if(e.state==='cut'){ e.vy+=900*dt; moveBody(e,dt); e.st-=dt; if(e.st<=0&&e.onGround){ e.hp=0; killEnemy(e,1,false); } return; }
    if(e.state==='wind'){ e.st-=dt; if(e.st<=0){ e.state='lash'; e.st=.3; e.vx=Math.sign(c.dx)*260; e.vy=(c.dy)*2; AU.swing(true); } }
    else if(e.state==='lash'){ e.st-=dt; tryHit(e,eBox(e),e.dmg); if(e.st<=0){ e.state='chase'; e.atkCd=rnd(1.5,2.4); } }
    else { const tx=P.x+Math.sin(time*.9+e.seed)*50, ty=P.y-26+Math.sin(time*1.3+e.seed)*10; e.vx=approach(e.vx,(tx-e.x)*(1+jerk*3),300*dt); e.vy=approach(e.vy,(ty-e.y)*(1+jerk*3),300*dt); if(c.vis&&e.atkCd<=0&&Math.hypot(c.dx,c.dy)<90){ e.state='wind'; e.st=.4; unlockCodex('puppet'); } }
    e.x+=e.vx*dt; e.y+=e.vy*dt; e.face=Math.sign(c.dx)||e.face;
    if(e.hp<e.maxhp*.35&&e.state!=='cut'){ e.state='cut'; e.st=.4; e.fly=false; AU.noise(.2,5000,3000,2,.2,'highpass',.2); } },
  servant(e,dt,c){ e.walk+=dt*Math.abs(e.vx)*.1;
    if(e.state==='aim'){ e.st-=dt; e.vx=0; if(e.st<=0){ for(let i=-1;i<=1;i++){ const a=Math.atan2(P.y-14-(e.y-18),P.x-e.x)+i*.12; eProj({type:'knife',x:e.x,y:e.y-18,vx:Math.cos(a)*240,vy:Math.sin(a)*240,dmg:e.dmg,r:3,life:2}); } AU.swing(false); e.state='chase'; e.atkCd=rnd(2,2.8); } }
    else if(c.vis&&c.adx<230&&Math.abs(c.dy)<90){ e.face=Math.sign(c.dx)||1; e.vx=approach(e.vx,c.adx>120?e.face*e.spd:0,200*dt); if(e.atkCd<=0){ e.state='aim'; e.st=.6; unlockCodex('servant'); } }
    else c.patrol(e.spd*.3); grav(e,dt); },
  handknight(e,dt,c){ e.walk+=dt*Math.abs(e.vx)*.11;
    if(e.state==='wind'){ e.st-=dt; e.vx=0; if(e.st<=0){ e.state='cut'; e.st=.22; e.vx=e.face*140; AU.swing(true); } }
    else if(e.state==='cut'){ e.st-=dt; tryHit(e,{x:e.face>0?e.x:e.x-34,y:e.y-28,w:34,h:24},e.dmg); if(e.st<=0){ e.combo++; if(e.combo<3&&c.adx<60){ e.state='wind'; e.st=.18; } else { e.combo=0; e.state='chase'; e.atkCd=1.4; } } }
    else if(e.state==='aim'){ e.st-=dt; e.vx=0; if(e.st<=0){ e.state='rush'; e.st=.5; } }
    else if(e.state==='rush'){ e.st-=dt; e.vx=e.face*300; tryHit(e,eBox(e),e.dmg*1.2); if(e.st<=0||e.hitWall){ e.state='chase'; e.atkCd=1.4; if(e.hitWall){ shake(4); AU.slam(); e.stun=.6; } } }
    else if(c.vis&&c.adx<240&&Math.abs(c.dy)<60){ e.face=Math.sign(c.dx)||1; e.vx=approach(e.vx,c.adx>30?e.face*e.spd:0,300*dt); if(e.atkCd<=0){ if(c.adx<40){ e.state='wind'; e.st=.42; } else if(c.adx>90){ e.state='aim'; e.st=.55; } unlockCodex('handknight'); } }
    else c.patrol(e.spd*.3); grav(e,dt); }
};
Object.assign(EAI,EAI_C);

/* ---------- sprites ---------- */
function dVillager(c,e){ const wk=Math.round(Math.sin(e.walk)*2), idle=e.state==='idle', s=Math.floor(e.seed*7)%3;
  const coat=['#4a2c38','#5a4430','#3a3a2a'][s]; rect(c,-3+wk,-8,2,8,'#2a1e14'); rect(c,1-wk,-8,2,8,'#2a1e14'); rect(c,-5,-17,10,10,coat); rect(c,-5,-17,10,1,'#ebdfc4');
  rect(c,-3,-23,6,6,'#d8c0a0'); rect(c,-4,-24,8,2,['#2a1a14','#8a6a32','#4a3a2a'][s]); rect(c,1,-21,1,1,'#120c0c'); rect(c,-2,-21,1,1,'#120c0c'); rect(c,-2,-19,5,1,idle?'#8a5a4a':'#6a1a22'); if(!idle) rect(c,-2,-18,5,1,'#120c0c');
  const up=e.state==='wind', hit=e.state==='hit'; c.save(); c.translate(4,-14); c.rotate(up?-1.2:hit?.3:idle?.6+Math.sin((e.work||0)*4)*.6:.2);
  rect(c,0,-.5,e.arm==='fork'?20:10,1,'#5a3d27'); if(e.arm==='fork'){ for(let i=0;i<3;i++) rect(c,20,-2+i*1.5,4,.6,'#8a8478'); } else if(e.arm==='sickle'){ c.fillStyle='#8a8478'; c.beginPath(); c.arc(10,-3,3,Math.PI*.4,Math.PI*1.5,true); c.fill(); } else { rect(c,10,-2,3,3,'#3a3236'); } c.restore(); }
function dCutpurse(c,e){ const wk=Math.round(Math.sin(e.walk)*3); rect(c,-2+wk,-8,2,8,'#1a1612'); rect(c,1-wk,-8,2,8,'#1a1612'); rect(c,-4,-16,8,8,'#2e3424'); rect(c,-3,-21,6,5,'#c8a890'); c.fillStyle='#1a1612'; c.beginPath(); c.moveTo(-5,-20); c.lineTo(0,-25); c.lineTo(5,-20); c.fill(); rect(c,1,-19,2,1,'#120c0c');
  if(e.stolen){ rect(c,-6,-13,4,5,'#6a4e1e'); rect(c,-6,-13,4,1,'#ffd27a'); } }
function dRatKing(c,e){ for(let i=0;i<6;i++){ const a=i/6*Math.PI*2+Math.sin(e.walk+i)*.3, x=Math.cos(a)*6, y=-6+Math.sin(a)*3; rect(c,x-3,y-2,6,4,i%2?'#4a3a2a':'#3a2e22'); rect(c,x+(Math.cos(a)>0?2:-3),y-2,1,1,'#b0141a'); }
  rect(c,-2,-8,4,4,'#2a1e14'); c.strokeStyle='#8a6a5a'; c.lineWidth=1; c.beginPath(); c.moveTo(0,-6); c.lineTo(Math.sin(e.walk)*3,-1); c.stroke(); }
function dRat(c,e){ rect(c,-3,-3,6,3,'#3a2e22'); rect(c,2,-3,2,2,'#4a3a2a'); rect(c,3,-3,1,1,'#b0141a'); rect(c,-6,-1,3,1,'#8a6a5a'); rect(c,-1,0,1,1,'#2a1e14'); rect(c,1,0,1,1,'#2a1e14'); }
function dBeggar(c,e){ const sw=e.swell||0, b=Math.min(4,sw*5); rect(c,-7-b/2,-12-b,14+b,12+b,'#6a6a32'); rect(c,-7-b/2,-12-b,14+b,1,'#8a8a4a'); for(let i=0;i<4;i++) rect(c,-5+i*3,-8,1,1,'#4a1a14');
  rect(c,-3,-17-b,6,5,'#cfc6b2'); rect(c,-1,-15-b,1,1,'#120c0c'); rect(c,1,-15-b,1,1,'#120c0c'); if(e.state==='sit'){ rect(c,6,-2,5,2,'#5a4636'); } }
function dPlague(c,e){ const wk=Math.round(Math.sin(e.walk)*2); c.fillStyle='#1a1612'; c.beginPath(); c.moveTo(-6,0); c.lineTo(-4,-20); c.lineTo(4,-20); c.lineTo(7,0); c.fill(); rect(c,-2+wk,-1,2,1,'#0a0806');
  rect(c,-3,-26,6,6,'#d8cfae'); rect(c,-4,-29,8,3,'#1a1612'); rect(c,-6,-28,12,1,'#1a1612'); c.fillStyle='#d8cfae'; c.beginPath(); c.moveTo(3,-24); c.lineTo(10,-21); c.lineTo(3,-21); c.fill(); rect(c,0,-25,2,2,'#6a8a3a');
  const up=e.state==='aim'; rect(c,4,up?-27:-15,1.5,up?10:7,'#1a1612'); if(up) rect(c,3,-31,3,4,'#6a8a3a'); }
function dGuard(c,e){ const wk=Math.round(Math.sin(e.walk)*2); rect(c,-4+wk,-10,3,10,'#2a2e34'); rect(c,1-wk,-10,3,10,'#32363c'); rect(c,-6,-23,12,13,'#3a3a40'); rect(c,-6,-23,12,1,'#6a6a72'); rect(c,-6,-17,12,1,'#0e0a0a'); rect(c,-2,-22,4,12,'#0e0a0a');
  rect(c,-4,-30,8,7,'#3a3a40'); rect(c,-5,-30,10,1,'#6a6a72'); rect(c,-1,-27,4,1,'#050304');
  const dr=e.state==='draw', sw=e.state==='sweep'; c.save(); c.translate(4,-20); c.rotate(dr?-2.4:sw?.7-(e.st/.28)*2.4+2.4:-.3); rect(c,0,-.5,30,1,'#5a4a30'); c.fillStyle='#a8a4a0'; c.beginPath(); c.moveTo(26,-1); c.lineTo(34,-5); c.lineTo(33,2); c.lineTo(28,1); c.fill(); c.restore(); }
function dTaker(c,e){ const wk=Math.round(Math.sin(e.walk)*2); rect(c,-4+wk,-10,3,10,'#2a1e14'); rect(c,1-wk,-10,3,10,'#2a1e14'); rect(c,-6,-22,12,12,'#4a3a28'); rect(c,-6,-22,12,1,'#b08a3a'); for(let i=0;i<4;i++) rect(c,-5+i*3,-20,1,1,'#b08a3a');
  rect(c,-4,-29,8,7,'#2a1e14'); rect(c,-1,-26,3,1,'#b0141a'); for(let i=0;i<5;i++) rect(c,-6,-18+i*2,2,1,'#6a6668'); }
function dBellman(c,e){ const wk=Math.round(Math.sin(e.walk)*2); c.fillStyle='#1a1e2a'; c.beginPath(); c.moveTo(-6,0); c.lineTo(-4,-18); c.lineTo(4,-18); c.lineTo(6,0); c.fill(); rect(c,-2+wk,-1,2,1,'#0a0806');
  rect(c,-3,-24,6,6,'#c8b49a'); rect(c,-5,-26,10,2,'#1a1e2a'); rect(c,-3,-28,6,2,'#1a1e2a'); rect(c,1,-22,1,1,'#120c0c');
  const ring=e.state==='cast', sw=ring?Math.sin(time*24)*.7:0; c.save(); c.translate(4,ring?-26:-14); c.rotate(sw); rect(c,0,-.5,6,1,'#5a3d27'); c.fillStyle='#b08a4a'; c.beginPath(); c.moveTo(6,-3); c.lineTo(11,-3); c.lineTo(12,3); c.lineTo(5,3); c.fill(); c.restore(); }
function dGargoyle(c,e){ const st=e.state==='perch'||e.state==='land', fl=st?0:Math.sin(e.walk); const col=st?'#6e6a64':'#5e5a54';
  rect(c,-6,-12,12,10,col); rect(c,-6,-12,12,1,'#9a9488'); rect(c,4,-15,5,5,col); rect(c,7,-13,1,1,st?'#2a2a2a':'#b0141a'); rect(c,8,-15,1,2,'#9a9488'); rect(c,-5,-2,2,2,col); rect(c,3,-2,2,2,col);
  c.fillStyle=col; c.beginPath(); c.moveTo(-4,-11); c.lineTo(-12,-16-fl*5); c.lineTo(-8,-7); c.fill(); c.beginPath(); c.moveTo(0,-11); c.lineTo(6,-19+fl*5); c.lineTo(3,-8); c.fill(); }
function dEngineer(c,e){ const wk=Math.round(Math.sin(e.walk)*2); rect(c,-3+wk,-9,2,9,'#2a1e14'); rect(c,1-wk,-9,2,9,'#2a1e14'); rect(c,-5,-20,10,11,'#5a4430'); rect(c,-5,-20,10,1,'#8a6a32'); rect(c,-6,-14,12,2,'#2a1e14');
  rect(c,-3,-25,6,5,'#c8a890'); rect(c,-4,-27,8,3,'#3a3236'); rect(c,-2,-23,4,1,'#2a2420'); const up=e.state==='aim'; rect(c,4,up?-27:-14,1.5,up?10:6,'#5a4430'); if(up){ rect(c,2,-32,5,5,'#1a1418'); } else rect(c,-8,-12,4,4,'#1a1418'); }
function dNoble(c,e){ const wk=Math.round(Math.sin(e.walk)*2), tw=Math.sin(e.spin||0); c.fillStyle='#5a1420'; c.beginPath(); c.moveTo(-7-tw,0); c.lineTo(-4,-16); c.lineTo(4,-16); c.lineTo(7+tw,0); c.fill(); rect(c,-5,-22,10,7,'#3a0a10'); rect(c,-5,-22,10,1,'#b8913a');
  rect(c,-3,-28,6,6,'#ece6d8'); rect(c,-1,-26,1,1,'#0a0606'); rect(c,1,-26,1,1,'#0a0606'); rect(c,-2,-24,4,1,'#b0141a'); rect(c,-4,-30,8,2,'#0a0606'); rect(c,2,-32,1,3,'#b8913a');
  c.save(); c.translate(4,-18); c.rotate(e.state==='flurry'?Math.sin(time*40)*.2:-.5); rect(c,0,-.5,16,1,'#cfc6b2'); rect(c,-1,-1.5,2,3,'#b8913a'); c.restore(); }
function dPuppet(c,e){ const j=Math.sin(e.walk*1.3); c.strokeStyle='rgba(232,212,160,.6)'; c.lineWidth=.5; if(e.state!=='cut') for(const [x,y] of [[-4,-14],[0,-24],[4,-14]]){ c.beginPath(); c.moveTo(x,y); c.lineTo(x+j*2,y-60); c.stroke(); }
  c.fillStyle='#0a0606'; c.beginPath(); c.moveTo(-6,-2); c.lineTo(-3,-16); c.lineTo(3,-16); c.lineTo(6,-2); c.fill(); rect(c,-3,-22,6,6,'#ece6d8'); rect(c,-1,-20,1,1,'#0a0606'); rect(c,1,-20,1,1,'#0a0606');
  rect(c,-6,-14+j*3,4,1,'#0a0606'); rect(c,2,-14-j*3,4,1,'#0a0606'); rect(c,-3,-2,1,4+j,'#0a0606'); rect(c,2,-2,1,4-j,'#0a0606'); }
function dServant(c,e){ const wk=Math.round(Math.sin(e.walk)*2); rect(c,-3+wk,-9,2,9,'#0a0606'); rect(c,1-wk,-9,2,9,'#0a0606'); rect(c,-5,-19,10,10,'#1a1418'); rect(c,-2,-19,4,10,'#ece6d8'); rect(c,-3,-24,6,5,'#cfc6b2'); rect(c,-4,-25,8,2,'#2a1a14');
  rect(c,-2,-22,2,2,'#000'); rect(c,1,-22,2,2,'#000'); const up=e.state==='aim'; if(!up){ rect(c,2,-15,10,1,'#b8913a'); for(let i=0;i<3;i++) rect(c,4+i*2,-17,1,2,'#cfc6b2'); } else rect(c,4,-27,1.5,10,'#1a1418'); }
function dHandKnight(c,e){ const wk=Math.round(Math.sin(e.walk)*2); rect(c,-4+wk,-11,3,11,'#3a0a0e'); rect(c,1-wk,-11,3,11,'#4a0e12'); rect(c,-7,-25,14,14,'#8a1016'); rect(c,-7,-25,14,1,'#d04040'); rect(c,-7,-18,14,1,'#3a0a0e'); rect(c,-9,-26,4,5,'#8a1016');
  rect(c,-4,-33,9,8,'#8a1016'); rect(c,-4,-33,9,1,'#d04040'); rect(c,0,-30,4,1,'#050304'); rect(c,-1,-36,2,3,'#b8913a');
  const up=e.state==='wind', cut=e.state==='cut'; c.save(); c.translate(5,-21); c.rotate(up?-2:cut?.8:e.state==='rush'?0:.3); rect(c,0,-1,18,2,'#cfc6b2'); rect(c,-1,-2,3,4,'#3a0a0e'); c.restore(); }
Object.assign(EDRAW,{villager:dVillager,cutpurse:dCutpurse,ratking:dRatKing,rat:dRat,beggar:dBeggar,plague:dPlague,guard:dGuard,taker:dTaker,bellman:dBellman,gargoyle:dGargoyle,engineer:dEngineer,noble:dNoble,puppet:dPuppet,servant:dServant,handknight:dHandKnight});
/* the Tithe-Taker's chain */
(function(){ const o=drawEnemies; drawEnemies=function(){ o(); for(const e of enemies){ if(e.dead||e.type!=='taker'||(e.state!=='chain'&&e.state!=='drag')) continue; const x0=e.x-camR.x, y0=e.y-18-camR.y, x1=e.cx-camR.x, y1=e.cy-camR.y, n=Math.max(2,Math.round(Math.hypot(x1-x0,y1-y0)/4));
  for(let i=0;i<=n;i++) rect(ctx,Math.round(lerp(x0,x1,i/n)),Math.round(lerp(y0,y1,i/n)),2,2,i%2?'#6a6668':'#3a3a40'); rect(ctx,Math.round(x1-2),Math.round(y1-2),4,4,'#a8a4a0'); } }; })();
(function(){ const o=enemyEmis; enemyEmis=function(e,g){ const t=e.type;
  if(t==='guard'||t==='servant'||t==='handknight'){ return; }
  if(t==='villager'&&e.state!=='idle'){ g.fillStyle='rgba(255,40,30,.7)'; g.fillRect(-2,-21,1,1); g.fillRect(1,-21,1,1); return; }
  return o(e,g); }; })();
