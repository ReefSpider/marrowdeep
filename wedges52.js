'use strict';
/* ===== the Marrow, stage 3 (v48): the ten damage-type wedges and the bridges between them =====
   Plan: claude/talents-plan.md section 4. Art: arttree.js (Codex). Notes: claude/v48-notes.md.

   30 notables, 10 keystones, 10 bridge notables (three of them combos that exist only in the tree) and one new creature,
   the Bone Thrall. Where a node only changes a number inside the element rules (how many chills freeze, how far a combo
   reaches), elements.js reads it directly through TW(id). Everything that needs its own state or timing is here.
   All numbers are in WK. */
const WK={
  cinder:.6, cinderMig:.01, cinderR:40, cinderCd:.5,
  pyreMul:1.5, pyreR:54, pyreSpread:.6, pyreAs:10,
  hoar:.04, hoarMax:.20, hoarR:120,
  static_:.8, staticFort:.01,
  conduit:.5,
  tideLen:96, tideSp:230, tideMul:.5, tideCd:.8,
  rising:3, risingMax:15, risingR:150,
  cyclone:.5, cycloneCd:.6, eyeMs:15, eyeN:3,
  down:.9, downMig:.01, downR:44,
  decay:.15,
  sanctT:4, sanctR:44, sanctCut:.15, zealot:.6, zealotMig:.01, zealotR:160,
  passR:120, unseenT:1.5, unseenDmg:50, nhtAt:.25,
  gusherT:2, gusherMig:.005, gusherCd:1,
  plateR:100, plateMax:3,
  thrallT:8, thrallMax:3, thrallSp:70, thrallHit:.5, thrallSee:170, thrallRate:.9,
  paleAt:.30, drownRoot:1.5, blackR:64, blackBurn:.3 };
const wMine=()=>!!P&&!P._remote&&P===TREE.owner;
const wAttr=k=>(P&&P.stats&&P.stats[k])||0;
const wSX=x=>Math.round(x-camR.x), wSY=y=>Math.round(y-camR.y);
const wFx=(dur,draw)=>fx.push({t:0,dur,draw(f){ draw(ectx,f.t); }});
let W_IN=0; /* guards the damage wrapper against its own blasts */
const wHurt=(o,n,dir,kb)=>{ W_IN++; try{ hurt(o,n,dir,kb); } finally{ W_IN--; } };

/* stat bonuses that come and go in play (Pyre Walker, Rising Tide, Eye of the Storm, Unseen) */
const DYN={as:0,ms:0,dmgP:0};
function dynSet(k,v){ if(!P||!P.stats||DYN[k]===v) return; P.stats[k]=Math.round((P.stats[k]+v-DYN[k])*10)/10; DYN[k]=v; }
(function(){ const o=calcStats; calcStats=function(){ const r=o(); if(!wMine()) return r; const s=P.stats; for(const k in DYN) if(DYN[k]) s[k]=Math.round((s[k]+DYN[k])*10)/10;
  if(tHas('blood-price')){ s.regen=Math.round(s.regen*5)/10; s.healMul=(s.healMul||1)*.5; } return r; }; })();

/* ---------- fire ---------- */
function pyreBlast(e,dps){ const [cx,cy]=ctr(e), dmg=dps*3*WK.pyreMul; AU.boom(.7); shake(4); burst(cx,cy,26,'#ff8a3a',220,40); burst(cx,cy,12,'#ffe0a0',140,-40); addLight(cx,cy,90,1.2,1,.5,.2);
  const near=live(cx,cy,WK.pyreR,e); curEl='fire'; wHurt(e,dmg,P.face,120); for(const o of near){ wHurt(o,dmg*.5*(1-resOf(o,'fire')),Math.sign(o.x-cx)||1,100); setBurn(o,dps*WK.pyreSpread); } curEl=null; }

/* ---------- water ---------- */
let tideT=0;
function tideWave(e,d,dir){ if(tideT>time||!wMine()) return; tideT=time+WK.tideCd; const y=findFloor(e.x,e.y-6), x0=e.x, hit=new Set([e]), pow=d*WK.tideMul+wAvg()*.2; if(Math.abs(y-e.y)>40) return;
  AU.noise(.5,900,300,1,.3,'lowpass',.4); wFx(1.1,(c,t)=>TreeArt.tidebreak(c,wSX(x0),wSY(y),t,{direction:dir,reducedMotion:RM}));
  fx.push({t:0,dur:WK.tideLen/WK.tideSp,upd(f){ const x=x0+dir*f.t*WK.tideSp; if(solidPx(x,y-6)){ f.t=f.dur; return; }
    for(const o of enemies){ if(o.dead||o.intro||o.fly||hit.has(o)||Math.abs(o.x-x)>12||Math.abs(o.y-y)>22) continue; hit.add(o); stOf(o).soak={t:TW('deluge')?12:4}; delete stOf(o).burn;
      if(!o.boss) o.vx+=(TW('undertow')?-dir:dir)*150; if(!TW('deluge')){ curEl='water'; wHurt(o,pow*(1-resOf(o,'water')),dir,40); curEl=null; } } }}); }

/* ---------- holy ---------- */
let sancts=[];
function onJudgement(e,dmg){ if(!wMine()) return;
  if(tHas('sanctuary')){ if(sancts.length>4) sancts.shift(); sancts.push({x:e.x,y:e.y,t:WK.sanctT}); }
  if(tHas('zealot-s-fire')){ let tg=null, bd=WK.zealotR; for(const o of enemies){ if(o===e||o.dead||o.intro||!hasSt(o,'sanct')) continue; const dd=Math.hypot(o.x-e.x,o.y-e.y); if(dd<bd){ bd=dd; tg=o; } }
    if(tg){ const x=tg.x, y=tg.y; fx.push({t:0,dur:.2,upd(f){ if(f.t>=.15&&!f.done){ f.done=1; curEl='holy'; judgement(x,y,dmg*WK.zealot*(1+wAttr('mig')*WK.zealotMig),44,false); curEl=null; } }}); } } }

/* ---------- shadow ---------- */
function onMarkedDeath(e,cx,cy){ if(!wMine()) return;
  if(tHas('long-shadow')){ let tg=null, bd=WK.passR; for(const o of enemies){ if(o===e||o.dead||o.intro) continue; const dd=Math.hypot(o.x-cx,o.y-o.h/2-cy); if(dd<bd){ bd=dd; tg=o; } } if(tg){ stOf(tg).mark={t:10}; burst(tg.x,tg.y-tg.h/2,5,'#a070ff',60,-30); } }
  if(tHas('unseen')){ P.unseenT=time+WK.unseenT; P.inv=Math.max(P.inv,WK.unseenT); P._unseen=1; dynSet('dmgP',(P._tide||0)+WK.unseenDmg); burst(P.x,P.y-14,10,'#3a2a55',70,-10); } }

/* ---------- bone: plates and thralls ---------- */
let thralls=[];
function onSplinter(e){ if(!wMine()) return;
  if(tHas('bone-plate')&&Math.hypot(e.x-P.x,e.y-P.y)<WK.plateR&&(P.plates||0)<WK.plateMax){ P.plates=(P.plates||0)+1; AU.clang(); }
  if(tHas('ossuary')){ if(thralls.filter(t=>t.life>0).length>=WK.thrallMax){ const old=thralls.find(t=>t.life>0); if(old) old.life=0; } const y=findFloor(e.x,e.y-6); if(Math.abs(y-e.y)<40) thralls.push({x:e.x,y,face:P.face,age:0,life:WK.thrallT,sw:0,cd:.4,pose:'rise',pt:0}); } }
function updThralls(dt){ for(const t of thralls){ t.age+=dt; t.pt+=dt; if(t.life<=0){ if(t.pose!=='crumble'){ t.pose='crumble'; t.pt=0; } continue; } t.life-=dt; if(t.age<.8) continue; t.cd-=dt;
    let tg=null, bd=WK.thrallSee; for(const o of enemies){ if(o.dead||o.intro||o.fly&&o.y<t.y-30) continue; const dd=Math.hypot(o.x-t.x,o.y-t.y); if(dd<bd){ bd=dd; tg=o; } }
    if(t.pose==='swing'&&t.pt<.6) continue;
    if(!tg){ if(t.pose!=='idle'){ t.pose='idle'; t.pt=0; } continue; } t.face=Math.sign(tg.x-t.x)||t.face;
    if(Math.abs(tg.x-t.x)<tg.w/2+14&&Math.abs(tg.y-t.y)<26){ if(t.cd<=0){ t.cd=WK.thrallRate; t.pose='swing'; t.pt=0; AU.swing(false); curEl='bone'; wHurt(tg,wAvg()*WK.thrallHit*(1-resOf(tg,'bone')),t.face,50); curEl=null; } else if(t.pose!=='idle'){ t.pose='idle'; t.pt=0; } continue; }
    const nx=t.x+t.face*WK.thrallSp*dt; if(solidPx(nx+t.face*4,t.y-8)){ if(t.pose!=='idle'){ t.pose='idle'; t.pt=0; } continue; } const fy=findFloor(nx,t.y-10); if(Math.abs(fy-t.y)>14){ if(t.pose!=='idle'){ t.pose='idle'; t.pt=0; } continue; }
    t.x=nx; t.y=fy; if(t.pose!=='walk'){ t.pose='walk'; t.pt=0; } }
  thralls=thralls.filter(t=>!(t.pose==='crumble'&&t.pt>=.8)); }

/* ---------- what your own blows set off ---------- */
(function(){ const o=dmgEnemy; dmgEnemy=function(e,d,crit,dir,kb,heavy,launch,stun){ if(!e||W_IN||!wMine()) return o(e,d,crit,dir,kb,heavy,launch,stun);
  const airborne=e.launchT>0&&!e.onGround, burning=hasSt(e,'burn'), bleeding=hasSt(e,'bleed'); const hidden=P._unseen;
  const r=o(e,d,crit,dir,kb,heavy,launch,stun); const [cx,cy]=ctr(e);
  if(hidden&&P._unseen&&d>0){ P._unseen=0; dynSet('dmgP',P._tide||0); } /* the blow from hiding is spent */
  if(heavy&&burning&&tHas('cinder-heart')&&!((e.cinT||0)>time)){ e.cinT=time+WK.cinderCd; const n=wAvg()*WK.cinder*(1+wAttr('mig')*WK.cinderMig); burst(cx,cy,14,'#ff8a3a',170,20); AU.boom(.35); addLight(cx,cy,60,1,1,.5,.2); curEl='fire'; for(const q of live(cx,cy,WK.cinderR,e)){ wHurt(q,n*(1-resOf(q,'fire')),Math.sign(q.x-cx)||1,90); setBurn(q,n*.3); } curEl=null; }
  if(crit&&bleeding&&!e.dead&&tHas('gusher')&&!((e.gushT||0)>time)){ const b=e.sts&&e.sts.bleed; if(b){ e.gushT=time+WK.gusherCd; bleed(cx,cy,22,dir||1,1.6); curEl='blood'; wHurt(e,b.dps*WK.gusherT*(1+wAttr('mig')*WK.gusherMig),dir,40); curEl=null; } }
  if(crit&&tHas('storm-conduit')){ const ch=enemies.filter(q=>!q.dead&&q.sts&&q.sts.shock&&q.sts.shock.ch>0); if(ch.length){ const tot=ch.reduce((a,q)=>a+q.sts.shock.ch,0)*WK.conduit; let px=P.x, py=P.y-16; U.uWhite.value=Math.max(U.uWhite.value,.06); shake(4); AU.tone('square',2800,500,.2,.09,.5);
      curEl='shock'; for(const q of ch){ q.sts.shock.ch=0; const [qx,qy]=ctr(q); zap(px,py,qx,qy,null,2); px=qx; py=qy; wHurt(q,tot*(1-resOf(q,'shock')),Math.sign(q.x-P.x)||1,60); } curEl=null; } }
  if(heavy&&airborne&&!e.dead&&!e.boss&&tHas('downdraft')){ const fy=findFloor(e.x,e.y-4), x=e.x; e.vy=520; e.vx=0; e.launchT=0; fx.push({t:0,dur:.2,upd(f){ if(f.t>=.14&&!f.done){ f.done=1; shake(6); AU.boom(.5); burst(x,fy-2,16,'#c8e8d8',180,60); const n=wAvg()*WK.down*(1+wAttr('mig')*WK.downMig); curEl='wind'; for(const q of live(x,fy-10,WK.downR)) wHurt(q,n*(1-resOf(q,'wind')),Math.sign(q.x-x)||1,120); curEl=null; } }}); wFx(1.2,(c,t)=>TreeArt.graveSlam(c,wSX(x),wSY(fy),t+.1,{variant:'gale',seed:(x|0)&255,reducedMotion:RM})); }
  if(!e.dead&&!e.boss&&tHas('night-has-teeth')&&hasSt(e,'mark')&&e.hp<e.maxhp*WK.nhtAt){ e._nht=1; e.hp=0; e.lastHit={el:'shadow',t:time,combo:1}; W_IN++; try{ killEnemy(e,dir||P.face,true); } finally{ W_IN--; } }
  return r; }; })();

/* ---------- what protects you ---------- */
(function(){ const o=hurtPlayer; hurtPlayer=function(d,src){ if(!wMine()||P.dead||mode!=='play'||P.dash>0||P.inv>0||P.ghostT>0) return o(d,src);
  if((P.plates||0)>0){ P.plates--; P.inv=Math.max(P.inv,.35); AU.clang(); sparks(P.x,P.y-16,8,'#e2d6b8'); impactT=Math.max(impactT,.04); return; }
  if(src&&src.sts){ if(hasSt(src,'rot')&&tHas('slow-decay')) d*=1-WK.decay;
    if(hasSt(src,'shock')&&tHas('static-skin')&&!src.dead&&src.h){ const [sx,sy]=ctr(src); zap(P.x,P.y-16,sx,sy); curEl='shock'; wHurt(src,wAvg()*WK.static_*(1+wAttr('fort')*WK.staticFort)*(1-resOf(src,'shock')),Math.sign(src.x-P.x)||1,60); curEl=null; } }
  if(tHas('hoarfrost')){ let n=0; for(const q of enemies) if(!q.dead&&hasSt(q,'frozen')&&Math.hypot(q.x-P.x,q.y-P.y)<WK.hoarR) n++; d*=1-Math.min(WK.hoarMax,n*WK.hoar); }
  if(sancts.some(s=>Math.abs(s.x-P.x)<WK.sanctR&&Math.abs(s.y-P.y)<40)) d*=1-WK.sanctCut;
  if((P.shell||0)>0){ const a=Math.min(P.shell,d); P.shell-=a; d-=a; if(d<1){ P.inv=Math.max(P.inv,.25); bleed(P.x,P.y-16,6,-P.face,.8); return; } }
  return o(d,src); }; })();

/* ---------- every frame ---------- */
(function(){ const o=updPlayer; let acc=0; updPlayer=function(dt){ const r=o(dt); if(!wMine()||P.dead) return r;
  updThralls(dt); for(const s of sancts) s.t-=dt; sancts=sancts.filter(s=>s.t>0);
  /* Tempest: foes hang where the wind put them */
  if(tHas('tempest')||tHas('cyclone')) for(const e of enemies){ if(e.dead||!e.sts||!e.sts.gale) continue; const g=e.sts.gale;
    if(g.hold&&e.vy>0) e.vy=0;
    if(!g.hold&&tHas('cyclone')&&Math.abs(e.vx)>120) for(const q of live(e.x,e.y-e.h/2,16,e)){ if((q.cycT||0)>time) continue; q.cycT=time+WK.cycloneCd; curEl='wind'; wHurt(q,wAvg()*WK.cyclone*(1-resOf(q,'wind')),Math.sign(e.vx),90); curEl=null; } }
  acc-=dt; if(acc>0) return r; acc=.2;
  let inFire=false; if(tHas('pyre-walker')) for(const f of flames) if(Math.abs(f.x-P.x)<11&&Math.abs(f.y-P.y)<14){ inFire=true; break; }
  if(inFire) P.burn=null; dynSet('as',inFire?WK.pyreAs:0);
  let air=0, soaked=0; for(const e of enemies){ if(e.dead) continue; if(e.launchT>0) air++; if(hasSt(e,'soak')&&Math.hypot(e.x-P.x,e.y-P.y)<WK.risingR) soaked++; }
  dynSet('ms',tHas('eye-of-the-storm')&&air>=WK.eyeN?WK.eyeMs:0);
  const tide=tHas('rising-tide')?Math.min(WK.risingMax,soaked*WK.rising):0; P._tide=tide; dynSet('dmgP',tide+(P._unseen?WK.unseenDmg:0));
  if(P._unseen&&!(P.unseenT>time)){ P._unseen=0; dynSet('dmgP',tide); }
  return r; }; })();

/* ---------- drawn in the world ---------- */
(function(){ const o=drawFX; drawFX=function(){ o(); if(!P||!wMine()) return;
  for(const s of sancts){ const k=Math.min(1,s.t/.6), sx=wSX(s.x), sy=wSY(s.y); ectx.fillStyle=`rgba(255,230,168,${(.5*k).toFixed(2)})`; for(let i=-WK.sanctR;i<=WK.sanctR;i+=3){ if(((i+Math.floor(time*8))&7)>4) continue; ectx.fillRect(sx+i,sy-1,2,1); } ectx.fillStyle=`rgba(255,230,168,${(.16*k).toFixed(2)})`; ectx.fillRect(sx-WK.sanctR,sy-3,WK.sanctR*2,2); }
  for(const t of thralls){ const pose=t.pose==='crumble'?'crumble':t.age<.8?'rise':t.pose, age=pose==='rise'?t.age:pose==='crumble'?t.pt:pose==='swing'?Math.min(.59,t.pt):t.pt%1; TreeArt.boneThrall(ectx,wSX(t.x),wSY(t.y),pose,age,{direction:t.face,reducedMotion:RM}); }
  if(P.dead) return;
  if((P.shell||0)>0){ TreeArt.sanguineShell(ectx,wSX(P.x),wSY(P.y),time,{strength:P.shell/(P.stats.life*.2),reducedMotion:RM}); TreeArt.shieldBar(ectx,wSX(P.x)-17,wSY(P.y)-46,P.shell/(P.stats.life*.2),P.life/P.stats.life,34); }
  if((P.plates||0)>0) TreeArt.bonePlate(ectx,wSX(P.x),wSY(P.y),time,{count:P.plates,reducedMotion:RM}); }; })();

/* ---------- the three combos that exist only in the tree ---------- */
const TREE_COMBOS=[
  {id:'pale',a:'cold',b:'holy',name:'Pale Light',jp:'白光',tier:'A',tree:'pale-light',d:'Tree only (the Pale Light bridge). Holy on a Frozen foe calls Judgement at once, and shatters the foe if it is under 30% life.',
    fn(e,v){ if(!TW('pale-light')||!hasSt(e,'frozen')) return false; const x=e.x, y=e.y; wFx(1.1,(c,t)=>TreeArt.paleLight(c,wSX(x),wSY(y),t,{reducedMotion:RM})); judgement(x,y,v*3+wAvg()*1.2,44,false);
      if(!e.dead&&!e.boss&&e.hp<e.maxhp*WK.paleAt){ e.hp=0; e.lastHit={el:'holy',t:time,combo:1}; killEnemy(e,P.face,true); } }},
  {id:'drowned',a:'water',b:'bone',name:'Drowned Bones',jp:'沈骨',tier:'A',tree:'drowned-bones',d:'Tree only (the Drowned Bones bridge). Bone on a Soaked foe roots it for 1.5 s, and its Brittle stacks double.',
    fn(e,v){ if(!TW('drowned-bones')||!hasSt(e,'soak')) return false; const s=stOf(e), cap=TW('brittle-frame')?7:5, x=e.x, y=e.y; if(!e.boss){ e.stun=Math.max(e.stun||0,WK.drownRoot); e.vx=0; }
      s.brittle={t:4,n:Math.min(cap-1,Math.max(2,(s.brittle?s.brittle.n:0)*2))}; wFx(1.6,(c,t)=>TreeArt.drownedBones(c,wSX(x),wSY(y),t,{reducedMotion:RM})); }},
  {id:'blackflame',a:'shadow',b:'fire',name:'Black Flame',jp:'黒炎',tier:'A',tree:'black-flame',d:'Tree only (the Black Flame bridge). Fire on a Marked foe burns purple: everything near it is Marked and set Burning.',
    fn(e,v){ if(!TW('black-flame')||!hasSt(e,'mark')) return false; const [cx,cy]=ctr(e), x=e.x, y=e.y, f=P.face; wFx(1.4,(c,t)=>TreeArt.blackFlame(c,wSX(x),wSY(y),t,{direction:f,reducedMotion:RM}));
      for(const o of live(cx,cy,WK.blackR,e)){ stOf(o).mark={t:TW('long-shadow')?10:5}; setBurn(o,v*WK.blackBurn+wAvg()*.1); burst(o.x,o.y-o.h/2,5,'#a070ff',70,-30); } }} ];
for(const c of TREE_COMBOS){ COMBOS.push(c); COMBO_BY[c.a+'+'+c.b]=c; COMBO_BY[c.b+'+'+c.a]=c; }

/* a clean slate each level */
(function(){ const o=loadLevel; loadLevel=function(i,opt){ thralls=[]; sancts=[]; tideT=0; if(P&&P.stats&&wMine()) for(const k in DYN) dynSet(k,0); else for(const k in DYN) DYN[k]=0; if(P){ P.plates=0; P.shell=0; P._unseen=0; P._tide=0; } return o(i,opt); }; })();
