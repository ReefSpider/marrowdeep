'use strict';
/* ===== the cold open (v49): the first thirty seconds =====
   BT (16 Nov): "The first 30s feeling good? Let's make that epic." Notes: claude/v49-notes.md.

   Before: Start → a page of story (clicks) → a text card with a Go button → an unarmed walk past a step and a spike pit
   → a sword 20 tiles in → the first foe 31 tiles in, who took five or six blows. Nothing was struck for the first
   twenty seconds or so.

   Now: Start → you are standing on the wall of Kesh, in control, as the camera pulls back and the sky burns.
     second 1   the dead captain's sword is four tiles ahead; you run over it and it's yours;
     second 2   six Kesh levies come down the wall at you, with Cassian at your shoulder. Each dies to one blow,
                thrown back, in a beat of slow motion;
     the last   falls slower, the screen flashes, and the name of the place comes up;
     then       the story page plays (the one that used to come first), and the lessons carry on as before,
                moved 12 tiles down the wall to make room.
   The card with the Go button is gone. New Game+ keeps the old opening. ?open=old brings the old one back for anyone.

   Everything here only runs on the prologue's first stretch. Numbers are in OPEN. */
const COLD_OPEN=!/[?&]open=old\b/.test(location.search);
const OPEN={on:false,stage:0,t:0,st:0,slow:0,slowK:1,kills:0,next:0,
  SH:12,            /* how far the old lessons move down the wall, in tiles */
  swordAt:3.5,      /* the captain's sword, in tiles ahead of where you start */
  n:6, first:12, gap:1.3, hp:3, dmg:4, spd:1.5,     /* the levies: how many, tiles ahead of you the first stands, spacing (tiles), life, damage, haste */
  killSlow:.1, killK:.25, lastSlow:.7, lastK:.22,   /* slow motion on each kill, and on the last */
  zoom:1.7 };
if(COLD_OPEN){
  /* the wall, re-laid: an open run first, then teach.js's step and spikes, 12 tiles later */
  (function(){ const o=genRooms; genRooms=function(def,safe){ const Lv=o(def,safe); if(def.id!=='wall'||!Lv.authored) return Lv; const g=Lv.g, fl=14, S=OPEN.SH;
    for(let x=10;x<14;x++){ g[fl-1][x]=0; g[fl-2][x]=0; } for(let x=17;x<20;x++){ g[fl][x]=1; g[fl+1][x]=1; }
    for(let x=10+S;x<14+S;x++){ g[fl-1][x]=1; g[fl-2][x]=1; } for(let x=17+S;x<20+S;x++){ g[fl][x]=0; g[fl+1][x]=3; }
    Lv.spawns=Lv.spawns.map(s=>Object.assign({},s,{x:s.x+(s.t==='husk'?S-8:S)})); /* the two husks move less, to stay ahead of the rider at the end */ Lv.chests=Lv.chests.map(c=>Object.assign({},c,{x:c.x+S}));
    Lv.lessons=LESSONS.map((l,i)=>Object.assign({},l,{x:i===0?18:i===1?28:i===2?9:i===LESSONS.length-1?l.x+S-4:l.x+S})); return Lv; }; })();
  (function(){ const o=loadLevel; loadLevel=function(idx,opt){ OPEN.on=false; OPEN.slow=0; const r=o(idx,opt); if(L&&L.def.id==='wall'&&L.relic&&ngp===0&&!(typeof COOP!=='undefined'&&COOP)){ L.relic.x=L.spawn.x+OPEN.swordAt*T; for(let i=0;i<OPEN.n;i++) openLevy(i); Object.assign(OPEN,{on:true,stage:0,t:0,st:0,kills:0,next:.7,slow:0,said:1}); } return r; }; })();

  /* Start: no page, no card. You're on the wall. */
  (function(){ const old=openingCut; openingCut=function(){ if(ngp>0||!L||L.def.id!=='wall'||!L.relic) return old();
    L.redHour=0; mode='play'; hud.hidden=false; Object.assign(OPEN,{on:true,stage:0,t:0,st:0,kills:0,next:.7,slow:0,said:0}); U.uFade.value=0; fadeTarget=1;
    if(!RM){ camZ=OPEN.zoom; camZT=1; } if(AU.setTension) AU.setTension(.8); if(typeof MUS!=='undefined') MUS.setMood(moodFor(L.def)); spawnBG('fireball'); AU.boom&&AU.boom(.4); }; })();

  function openLevy(i){ const e=mkEnemy({x:L.spawn.x/T+OPEN.first+i*OPEN.gap,y:14,t:'ghoul',pack:1}); e.hp=e.maxhp=OPEN.hp; e.dmg=OPEN.dmg; e.levy=1; e.face=-1; e.state='chase'; e.atkCd=.5+i*.12; e.xp=Math.max(1,Math.round(e.xp*.4)); e.spd*=OPEN.spd; e.name='Kesh Levy'; enemies.push(e); return e; }
  function openTick(dt){ const O=OPEN; O.t+=dt; O.st+=dt; if(!L||L.def.id!=='wall'||mode!=='play'){ return; }
    /* the sky */
    if(O.stage<3&&O.t>=O.next){ O.next=O.t+rnd(1.1,2.2); spawnBG(pick(['fireball','fireball','lightning','clash'])); }
    if(O.stage===0){ if(O.st>.5&&!O.said){ O.said=1; caption('With you, brother.','カシアン'); setTimeout(()=>caption(''),1900); }
      /* the line holds until you take the sword, or walk at them without it */
      for(const e of enemies) if(e.levy&&!e.dead){ e.stun=.3; e.face=-1; }
      if(!L.relic.taken&&Math.abs(L.relic.x+12-P.x)<16&&Math.abs(L.relic.y-P.y)<20) takeRelic(); /* no key: you run over it and it's yours */
      if(L.relic.taken||P.x>L.relic.x+70){ O.stage=1; O.st=0; for(const e of enemies) if(e.levy) e.stun=0; AU.roar&&AU.roar(); shake(3); } }
    else if(O.stage===1){ let left=0; for(const e of enemies){ if(!e.levy||e.dead) continue; left++; const dx=P.x-e.x; if(Math.abs(dx)>=165&&e.state!=='wind'&&e.state!=='lunge'&&!(e.stun>0)){ e.face=Math.sign(dx)||-1; e.vx=e.face*e.spd; } }
      if(!left){ O.stage=2; O.st=0; } }
    else if(O.stage===2){ if(O.st>1.5){ O.stage=3; O.st=0; storyPlay('opening',()=>{}); } }
    else if(O.stage===3){ if(P.x>(22+O.SH)*T||O.st>40) O.on=false; } }
  /* each levy that falls: thrown back, a beat of slow motion; the last one gets the screen */
  (function(){ const o=killEnemy; killEnemy=function(e,dir,crit){ const was=e&&e.dead, r=o(e,dir,crit); if(!OPEN.on||!e||was||!e.dead||!e.levy) return r; OPEN.kills++;
    e.vx=(dir||1)*rnd(200,300); e.vy=-rnd(110,190); bleed(e.x,e.y-e.h*.5,18,dir||1,2); shake(5);
    const last=!enemies.some(q=>q.levy&&!q.dead);
    if(last){ if(!RM){ OPEN.slow=OPEN.lastSlow; OPEN.slowK=OPEN.lastK; camZ=1.22; camZT=1; } U.uWhite.value=Math.max(U.uWhite.value,.14); impactT=Math.max(impactT,.12); AU.boom&&AU.boom(.9); AU.slam&&AU.slam();
      setTimeout(()=>{ if(L&&L.def.id==='wall'&&typeof showBossName==='function') showBossName('The Walls of Kesh','序','Prologue · the last war'); },350); }
    else if(!RM){ OPEN.slow=Math.max(OPEN.slow,OPEN.killSlow); OPEN.slowK=OPEN.killK; }
    return r; }; })();
  (function(){ const o=update; update=function(dt){ if(OPEN.slow>0){ OPEN.slow-=dt; dt*=OPEN.slowK; } o(dt); if(OPEN.on) openTick(dt); }; })();
}
