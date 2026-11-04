'use strict';
/* ===== borrowed power 借 (v20): the stones grant power for one run only =====
   A remembrance stone still asks its koan. Your answer chooses the kind of power (the six old vows: Release, Carry,
   Forgive, Remember, Endure, Seek); then a reel spins for its rarity, and you get a power that lasts until the run
   ends (you go home: by the door, by Abandon, by running out of lives, or by finishing the campaign). Powers stack.
   The old permanent vows are gone: the stats you had sworn no longer apply.
     Magic    50%  a small boost in the answer's kind (v21: hard nerf, e.g. +2% crit, +3% damage)
     Rare     30%  a slightly bigger one (+3% crit, +6% damage)
     Legendary 13% a miracle: Heaven's Gate, an oni fighting for you, Raijin's lightning…
     Unique    6%  a Bargain: something huge, at a real cost. You may refuse it and take a Rare boon instead.
     Abyssal   1%  a god comes down with you.
   Each stone answers once per run. In co-op every player kneels for themselves; procs run on your own machine. */
const BR_RAR=[{r:1,w:50,n:'Magic'},{r:2,w:30,n:'Rare'},{r:3,w:13,n:'Legendary'},{r:4,w:6,n:'Bargain'},{r:5,w:1,n:'Abyssal'}];
let RUN={powers:[],deaths:0,stones:{}};
const PW={cd:{},ward:0,oni:0};
const hasPw=id=>RUN.powers.some(p=>p.id===id);
const pwOf=id=>RUN.powers.filter(p=>p.id===id);
const hitAvg=()=>{ if(!P||!P.stats) return 5; const s=P.stats; return (s.min+s.max)/2*(1+(s.dmgP||0)/100)*(1+(P.lvl-1)*.05); };
const TH={release:{k:'放',n:'Release'},carry:{k:'担',n:'Carry'},forgive:{k:'赦',n:'Forgive'},remember:{k:'憶',n:'Remember'},endure:{k:'忍',n:'Endure'},seek:{k:'求',n:'Seek'}};

/* ---------- the powers ---------- */
const POWERS={
  /* Magic and Rare: by kind. v21 (playtest: "too OP, only Legendary and above can stay, the rest need a hard nerf,
     like 2% not 15%"): cut to roughly a seventh of v20 (v20 values in brackets). */
  carry1:{r:1,th:'carry',k:'力',n:'Borrowed Strength',d:'+3% damage.',st:{dmg:3}},                                   /* [+25%] */
  carry2:{r:2,th:'carry',k:'剛',n:'Iron Arm',d:'+6% damage.',st:{dmg:6}},                                            /* [+45%] */
  endure1:{r:1,th:'endure',k:'堅',n:'Borrowed Hide',d:'+4% life.',st:{lifeP:4}},                                       /* [+30%] */
  endure2:{r:2,th:'endure',k:'城',n:'Walled Heart',d:'+7% life and +5% defense.',st:{lifeP:7,defP:5}},                 /* [+50%, +40%] */
  release1:{r:1,th:'release',k:'疾',n:'Borrowed Haste',d:'+2% attack speed, +2% run speed.',st:{as:2,ms:2}},          /* [+15%, +12%] */
  release2:{r:2,th:'release',k:'迅',n:'Lightfoot',d:'+4% attack speed, +3% run speed.',st:{as:4,ms:3}},                /* [+25%, +20%, half-grit rolls] */
  forgive1:{r:1,th:'forgive',k:'癒',n:'Borrowed Mercy',d:'+0.5% life stolen.',st:{ls:.5}},                            /* [+4%] */
  forgive2:{r:2,th:'forgive',k:'慈',n:'Open Hand',d:'+1% life stolen, +0.4 life a second.',st:{ls:1,regen:.4}},        /* [+7%, +3/s] */
  remember1:{r:1,th:'remember',k:'鋭',n:'Borrowed Eye',d:'+2% critical strike.',st:{crit:2}},                          /* [+12%] */
  remember2:{r:2,th:'remember',k:'閃',n:'Second Sight',d:'+3% critical strike.',st:{crit:3}},                          /* [+20%, crits +50%] */
  seek1:{r:1,th:'seek',k:'運',n:'Borrowed Luck',d:'+10% magic find and gold find.',st:{mf:10,gf:10}},                 /* [+75%] */
  seek2:{r:2,th:'seek',k:'福',n:'Fortune\'s Child',d:'+20% magic find and gold find.',st:{mf:20,gf:20}},              /* [+150%] */
  /* Legendary: miracles */
  gate:{r:3,th:'forgive',k:'天門',n:'Heaven\'s Gate',d:'Every 12 s, when foes press close, a pillar of holy light crashes down on you: it wipes out the ordinary foes around you and heals you 15%.'},
  rain:{r:3,th:'forgive',k:'血雨',n:'Blood Rain',d:'Every 15 s, blood rains around you for 5 s: foes in it bleed heavily, you drink 2% life a second.'},
  oni:{r:3,th:'carry',k:'鬼',n:'Oni Pact',d:'Every 30 s, or when you fall below 40% life, an oni bursts out of the floor and fights beside you for 12 s.'},
  raijin:{r:3,th:'remember',k:'雷神',n:'Raijin\'s Due',d:'Critical strikes have a 30% chance to call down lightning that strikes the foe and leaps to three more.'},
  hyakki:{r:3,th:'remember',k:'百鬼',n:'Night Parade',d:'A third of the foes you kill rise as vengeful ghosts that hunt the nearest foe and burst.'},
  fujin:{r:3,th:'release',k:'風神',n:'Fūjin\'s Breath',d:'Every roll looses a gale: foes near you are torn and hurled away.'},
  fudo:{r:3,th:'endure',k:'不動',n:'Immovable',d:'Every 10 s a stone ward forms over you. The next blow breaks on it instead of you, and it bursts in a shockwave.'},
  neko:{r:3,th:'seek',k:'招猫',n:'Beckoning Cat',d:'Kills spill extra gold. Every kill has a 4% chance to drop a coffer; every elite drops one.'},
  /* Unique: bargains (a big gain at a real cost) */
  oneblade:{r:4,k:'一刀',n:'One Blade',d:'+120% main-hand damage. Your off hand is bound: it does nothing.',bargain:1},
  nomind:{r:4,k:'無心',n:'No-Mind',d:'+90% damage. You can never land a critical strike.',bargain:1,st:{dmg:90}},
  river:{r:4,k:'背水',n:'Back to the River',d:'+80% damage and +30% attack speed. Draughts no longer heal you.',bargain:1,st:{dmg:80,as:30}},
  glass:{r:4,k:'硝子',n:'Glass Body',d:'Double damage. Half life.',bargain:1},
  ironmass:{r:4,k:'鉄塊',n:'Iron Mass',d:'+120% life, +100% defense. You move 30% slower and rolling costs double grit.',bargain:1,st:{lifeP:120,defP:100,ms:-30}},
  oath:{r:4,k:'刀誓',n:'Oath of the Blade',d:'Your current weapon\'s kind deals +150%. Every other kind deals half.',bargain:1},
  gaki:{r:4,k:'餓鬼',n:'Hungry Ghost',d:'Life stolen tripled, and +8%. Your life never regenerates and draughts heal half.',bargain:1},
  frenzy:{r:4,k:'狂',n:'Frenzy',d:'+100% damage while below half life. You always take 30% more damage.',bargain:1},
  /* Abyssal */
  kami:{r:5,k:'神降',n:'Descent of the God',d:'Heaven\'s Gate every 6 s, and +50% damage.',st:{dmg:50}},
  enma:{r:5,k:'閻魔',n:'King Enma\'s Retainer',d:'An oni walks with you for the whole run, rising again 5 s after it falls. +30% life.',st:{lifeP:30}},
  avici:{r:5,k:'無間',n:'Avīci',d:'Every foe you kill bursts like a bomb, hurting everything around it. Chains are likely.'}
};
function powerFor(th,r){ const all=Object.keys(POWERS).filter(id=>POWERS[id].r===r); if(r<=2){ const own=all.filter(id=>POWERS[id].th===th); return own.length?pick(own):pick(all)||null; }
  const fresh=all.filter(id=>!hasPw(id)), own=fresh.filter(id=>POWERS[id].th===th); return own.length&&R()<.7?pick(own):fresh.length?pick(fresh):all.length?pick(all):null; }

/* ---------- applying them ---------- */
vowBonus=function(){ return 0; };
(function(){ const o=calcStats; calcStats=function(){ const r=o(); if(!P||!P.stats||P._remote) return r; const s=P.stats; let lifeP=0, defP=0;
  for(const pw of RUN.powers){ const d=POWERS[pw.id]; if(!d) continue; const st=d.st||{};
    if(st.dmg) s.dmgP=(s.dmgP||0)+st.dmg; if(st.as) s.as+=st.as; if(st.ms) s.ms+=st.ms; if(st.ls) s.ls+=st.ls; if(st.regen) s.regen+=st.regen; if(st.crit) s.crit+=st.crit; if(st.mf) s.mf+=st.mf; if(st.gf) s.gf+=st.gf;
    if(st.lifeP) lifeP+=st.lifeP; if(st.defP) defP+=st.defP;
    if(pw.id==='glass'){ s.dmgP=((s.dmgP||0)+100)*2-100; lifeP-=50; }
    if(pw.id==='gaki') s.ls=s.ls*3+8; }
  if(hasPw('nomind')) s.crit=-1000; if(hasPw('gaki')) s.regen=0;
  s.life=Math.max(10,Math.round(s.life*(1+lifeP/100))); s.def=Math.round(s.def*(1+defP/100)); P.life=Math.min(P.life,s.life); return r; }; })();
(function(){ const o=offActive; offActive=function(){ if(P&&!P._remote&&hasPw('oneblade')) return false; return o(); }; })();
(function(){ const o=strike; strike=function(e,mv,id,hand,dir,mult){ let m=mult==null?1:mult; if(P&&!P._remote){
    if(hasPw('oneblade')&&(hand||'main')==='main') m*=2.2;
    for(const pw of pwOf('oath')) m*=wcls(hand)===pw.cls?2.5:.5;
    if(hasPw('frenzy')&&P.life<P.stats.life*.5) m*=2; }
  return o(e,mv,id,hand,dir,m); }; })();
let BR_PROC=0;
(function(){ const o=dmgEnemy; dmgEnemy=function(e,d,crit,dir,...rest){ if(crit&&!BR_PROC&&P&&!P._remote&&RUN.powers.some(p=>p.id==='remember2')) d=Math.round(d*1.5);
  const r=o(e,d,crit,dir,...rest); if(crit&&!BR_PROC&&e&&!e.dead&&hasPw('raijin')&&R()<.3) raijinBolt(e); return r; }; })();
(function(){ const o=hurtPlayer; hurtPlayer=function(d,src){ if(P&&!P._remote&&!P.dead&&mode==='play'){
    if(hasPw('frenzy')) d*=1.3;
    if(PW.ward&&P.inv<=0&&P.dash<=0&&!(P.ghostT>0)){ PW.ward=0; PW.cd.fudo=10; P.inv=.6; wardBurst(); return; } }
  return o(d,src); }; })();
/* draughts: the river and the hungry ghost */
(function(){ const o=updPlayer; updPlayer=function(dt){ if(!P||P._remote) return o(dt); const pot=P.potions, dash=P.dash;
  if(hasPw('river')&&buf.potion!=null){ buf.potion=null; if(!PW.toldRiver){ PW.toldRiver=1; toast('背水 Back to the River: draughts will not heal you this run.'); } }
  o(dt);
  if(P.potions<pot&&hasPw('gaki')) P.healT*=.5;
  if(P.dash>0&&dash<=0){ if(hasPw('ironmass')) P.grit=Math.max(0,P.grit-25); if(RUN.powers.some(p=>p.id==='release2')) P.grit=Math.min(100,P.grit+12); if(hasPw('fujin')) gale(); } }; })();

/* ---------- the miracles ---------- */
function foesNear(x,y,r){ return enemies.filter(e=>!e.dead&&!e.intro&&Math.hypot(e.x-x,(e.y-e.h/2)-y)<r); }
function procHit(e,d,dir,kb){ BR_PROC++; try{ dmgEnemy(e,Math.round(d),false,dir||Math.sign(e.x-P.x)||1,kb==null?120:kb,true); } finally{ BR_PROC--; } }
function heavensGate(big){ const x=P.x, y=P.y; AU.bell(); AU.boom(1.1); shake(9); U.uWhite.value=Math.max(U.uWhite.value,.12); impactT=.05;
  for(const e of foesNear(x,y-14,big?140:115)) procHit(e,e.boss?hitAvg()*4:Math.max(hitAvg()*10,e.maxhp*.6),Math.sign(e.x-x)||1,220);
  P.life=Math.min(P.stats.life,P.life+P.stats.life*.15);
  fx.push({t:0,dur:1,draw(f){ const k=1-f.t/f.dur, sx=x-camR.x, sy=y-camR.y; ectx.fillStyle=`rgba(255,250,225,${(.85*k).toFixed(2)})`; const wd=(big?54:40)*(1-f.t*.4); ectx.fillRect(sx-wd/2,-10,wd,sy+10); ectx.fillStyle=`rgba(255,240,190,${(.4*k).toFixed(2)})`; ectx.fillRect(sx-(big?140:115),sy-6,(big?280:230),6); addLight(x,y-40,200,1.6*k,1,.95,.75); }}); }
function bloodRain(){ const x=P.x, y=P.y; AU.noise(1.2,600,200,.6,.25,'lowpass',.6);
  fx.push({t:0,dur:5,tk:0,upd(f,dt){ f.tk-=dt; if(f.tk<=0){ f.tk=.5; for(const e of foesNear(x,y-20,120)) addBleed(e,hitAvg()*.5,2); if(Math.abs(P.x-x)<120) P.life=Math.min(P.stats.life,P.life+P.stats.life*.01); } },
    draw(f){ for(let i=0;i<14;i++){ const px=x+rnd(-120,120)-camR.x, py=y-rnd(0,180)-camR.y; ctx.fillStyle='rgba(150,10,14,.7)'; ctx.fillRect(px,py,1,6); } }}); }
function raijinBolt(e){ BR_PROC++; try{ const tg=[e].concat(foesNear(e.x,e.y-e.h/2,150).filter(o=>o!==e).slice(0,3)); AU.tone('square',2600,500,.2,.08,.4); AU.thunder&&AU.thunder(); shake(4);
    for(const o of tg){ const ox=o.x, oy=o.y-o.h/2; if(typeof zap==='function') zap(ox,oy-120,ox,oy,null,2); procHit(o,hitAvg()*3,Math.sign(o.x-P.x)||1,60); } } finally{ BR_PROC--; } }
function gale(){ const x=P.x, y=P.y-14; AU.noise(.6,300,2400,1,.35,'bandpass',.4); for(let i=0;i<24;i++){ const a=R()*Math.PI*2; part({x,y,vx:Math.cos(a)*260,vy:Math.sin(a)*160,g:0,life:.4,em:true,col:'rgba(220,230,240,.7)'}); }
  for(const e of foesNear(x,y,85)){ procHit(e,hitAvg()*2,Math.sign(e.x-x)||1,60); if(!e.boss&&!e.dead){ e.vx=(Math.sign(e.x-x)||1)*420; e.vy=-220; e.stun=Math.max(e.stun||0,.6); } } }
function wardBurst(){ AU.clang(); AU.slam(); shake(7); sparks(P.x,P.y-16,20,'#e8e0d0'); if(typeof shockwave==='function') shockwave(P.x,P.y,50,[-1,1]); for(const e of foesNear(P.x,P.y-14,90)) procHit(e,hitAvg()*3,Math.sign(e.x-P.x)||1,200); toast('不動 The ward breaks on the blow.'); }
/* ghosts of the night parade */
function ghostFrom(x,y){ fx.push({t:0,dur:3,x,y,tgt:null,upd(f,dt){ if(!f.tgt||f.tgt.dead){ const l=foesNear(f.x,f.y,260); f.tgt=l.length?l.reduce((a,b)=>Math.hypot(a.x-f.x,a.y-f.y)<Math.hypot(b.x-f.x,b.y-f.y)?a:b):null; if(!f.tgt){ f.y-=40*dt; return; } }
    const tx=f.tgt.x, ty=f.tgt.y-f.tgt.h/2, d=Math.hypot(tx-f.x,ty-f.y)||1; f.x+=(tx-f.x)/d*230*dt; f.y+=(ty-f.y)/d*230*dt;
    if(d<10){ for(const e of foesNear(f.x,f.y,40)) procHit(e,hitAvg()*2,Math.sign(e.x-f.x)||1,90); burst(f.x,f.y,12,'#b8c8ff',120,0); AU.noise(.2,3000,600,1,.2,'bandpass',.3); f.t=f.dur; } },
  draw(f){ const sx=f.x-camR.x, sy=f.y-camR.y; ectx.fillStyle='rgba(190,210,255,.8)'; ectx.fillRect(sx-2,sy-3,4,5); ectx.fillRect(sx-1,sy+2,2,3); ectx.fillStyle='#10121a'; ectx.fillRect(sx-1,sy-2,1,1); ectx.fillRect(sx+1,sy-2,1,1); addLight(f.x,f.y,24,.5,.6,.7,1); }}); }
/* the oni */
function drawOni(c,ph,sw){ const R_=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);}; const wk=Math.round(Math.sin(ph)*2);
  R_(-9+wk,-14,6,14,'#4a1010'); R_(3-wk,-14,6,14,'#4a1010'); R_(-10,-17,20,5,'#2a1a10'); for(let i=-8;i<9;i+=4) R_(i,-17,2,5,'#d8c070');
  R_(-11,-36,22,20,'#8a1a1a'); R_(-7,-30,14,12,'#a8302a'); R_(-11,-36,4,20,'#6a1212'); R_(-15,-34,5,15,'#7a1616');
  R_(-7,-47,14,12,'#9a2020'); R_(-7,-53,3,7,'#e8dcc0'); R_(4,-53,3,7,'#e8dcc0'); R_(-8,-49,16,3,'#2a1010'); R_(-4,-43,3,2,'#ffd27a'); R_(2,-43,3,2,'#ffd27a'); R_(-4,-38,8,1,'#f4f0e8');
  c.save(); c.translate(11,-32); c.rotate(-1.1+sw*2.6); R_(0,-3,5,6,'#7a1616'); R_(4,-2,26,5,'#3a2a1e'); for(let i=8;i<30;i+=5) R_(i,-4,2,2,'#a8a098'); c.restore(); }
function summonOni(life){ if(PW.oniLive) { PW.oniLive.t=0; PW.oniLive.dur=life||12; return; } const side=P.face; let x=P.x+side*24; if(solidPx(x,P.y-10)) x=P.x;
  const o={t:0,dur:life||12,x,y:findFloor(x,P.y-20),face:side,cd:.8,sw:0,ph:0,
    upd(f,dt){ f.ph+=dt*6; f.cd-=dt; f.sw=Math.max(0,f.sw-dt*3); const l=foesNear(f.x,f.y-20,260); const tg=l.length?l.reduce((a,b)=>Math.abs(a.x-f.x)<Math.abs(b.x-f.x)?a:b):null;
      const goal=tg?tg.x:P.x-P.face*20, dx=goal-f.x; if(Math.abs(dx)>(tg?26:30)){ const nx=f.x+Math.sign(dx)*110*dt; if(!solidPx(nx+Math.sign(dx)*10,f.y-10)) f.x=nx; f.face=Math.sign(dx)||f.face; }
      f.y=findFloor(f.x,f.y-24); if(Math.abs(f.x-P.x)>320){ f.x=P.x-P.face*20; f.y=findFloor(f.x,P.y-20); ash(f.x,f.y-20,16); }
      if(tg&&Math.abs(dx)<46&&f.cd<=0){ f.cd=.9; f.sw=1; AU.slam(); shake(4); dust(f.x+f.face*26,f.y,10); for(const e of foesNear(f.x+f.face*22,f.y-18,48)) procHit(e,hitAvg()*4,f.face,240); }
      if(f.t>=f.dur-.05&&!f.gone){ f.gone=1; ash(f.x,f.y-24,30); AU.roar(); PW.oniLive=null; if(hasPw('enma')) PW.cd.enma=5; } },
    draw(f){ const a=f.t<.3?f.t/.3:f.t>f.dur-.4?(f.dur-f.t)/.4:1; blit(c=>drawOni(c,f.ph,f.sw),f.x,f.y,f.face,{big:true,alpha:clamp(a,0,1),sx:1.25,sy:1.25,rim:'rgba(255,90,60,.5)'}); addLight(f.x,f.y-40,70,.8,1,.35,.2); } };
  fx.push(o); PW.oniLive=o; AU.roar(); shake(8); ash(x,o.y-10,30); for(let i=0;i<16;i++) part({type:'blood',x:x+rnd(-12,12),y:o.y-2,vx:rnd(-80,80),vy:rnd(-220,-80),g:520,life:rnd(.4,.9),col:pick(BLOOD)}); }
/* timers */
(function(){ const o=update; update=function(dt){ o(dt); if(!P||P.dead||mode!=='play'||!L||L.def.kind==='cabin'||!RUN.powers.length) return; const c=PW.cd;
  for(const k in c) c[k]-=dt;
  const near=foesNear(P.x,P.y-14,120), crowd=near.length>=3||near.some(e=>e.champ||e.rare||e.unique||e.boss);
  if(hasPw('kami')){ if(!(c.kami>0)&&near.length){ c.kami=6; heavensGate(true); } } else if(hasPw('gate')&&!(c.gate>0)&&crowd){ c.gate=12; heavensGate(false); }
  if(hasPw('rain')&&!(c.rain>0)&&near.length){ c.rain=15; bloodRain(); }
  if(hasPw('oni')&&!(c.oni>0)&&(near.length||P.life<P.stats.life*.4)){ c.oni=P.life<P.stats.life*.4?20:30; summonOni(12); }
  if(hasPw('enma')&&!PW.oniLive&&!(c.enma>0)) summonOni(9999);
  if(hasPw('fudo')&&!PW.ward&&!(c.fudo>0)){ PW.ward=1; AU.tone('triangle',300,600,.3,.1,.4); }
  if(PW.ward&&R()<.3) part({x:P.x+rnd(-8,8),y:P.y-rnd(4,30),vx:0,vy:-10,g:0,life:.4,em:true,col:'rgba(220,210,190,.6)'}); }; })();
(function(){ const o=killEnemy; killEnemy=function(e,dir,crit){ const was=e.dead; o(e,dir,crit); if(was||!e.dead||e.boss||!P||P._remote) return;
  if(hasPw('hyakki')&&R()<.33) ghostFrom(e.x,e.y-e.h/2);
  if(hasPw('neko')){ dropGold(e.x,e.y-8,Math.round(ri(3,8)*(1+lvlIdx*.6))); if(e.champ||e.rare||e.unique||R()<.04) dropChest(e,e.rare||e.unique?1:0); }
  if(hasPw('avici')&&!(BR_PROC>3)){ const x=e.x, y=e.y-e.h/2; AU.boom(.7); shake(4); burst(x,y,20,'#ff5a3a',200,40); BR_PROC++; try{ for(const o2 of foesNear(x,y,70)) procHit(o2,hitAvg()*3,Math.sign(o2.x-x)||1,180); } finally{ BR_PROC--; } } }; })();
(function(){ const o=drawHeroAndFX; drawHeroAndFX=function(){ o(); if(PW.ward&&P&&!P.dead&&!(typeof NET!=='undefined'&&NET.swapped)){ const sx=P.x-camR.x, sy=P.y-16-camR.y; ectx.strokeStyle='rgba(230,220,200,.55)'; ectx.lineWidth=1; ectx.beginPath(); ectx.ellipse(sx,sy,11,17,0,0,Math.PI*2); ectx.stroke(); } }; })();

/* ---------- the stone: answer, spin, receive ---------- */
stoneCard=function(st){ const c=CX[st.id]; if(!c) return; unlockCodex(st.id); AU.bell(); const back=()=>{ hideCard(); mode='play'; hud.hidden=false; }; const done=RUN.stones[st.id];
  if(!c.q){ showCard({title:c.t,jp:c.k,body:c.x,buttons:[{label:'Rise',fn:back}]}); return; }
  if(done){ const pw=RUN.powers.find(p=>p.stone===st.id); showCard({title:c.t,jp:c.k,body:`${c.x}\n\n${c.q}\n\nYou answered: ${c.a.find(a=>a[1]===done)[0]}${pw?`\nIt lent you ${POWERS[pw.id].k} ${powName(pw)} until the climb ends.`:''}`,buttons:[{label:'Rise',fn:back}]}); return; }
  const btns=c.a.map(([txt,v])=>({label:`${txt}<small>${TH[v].k}　${TH[v].n} · borrowed power of this kind, for this run</small>`,fn:()=>{ hideCard(); boonRoll(st,v); }})).concat([{label:'Not yet. Walk on.',ghost:1,fn:back}]);
  showCard({title:c.t,jp:c.k,body:c.x+`\n\n${c.q}`,buttons:btns}); $('#cardBtns').classList.add('koan'); };
const powName=pw=>pw.id==='oath'?`Oath of the ${WEAPON_TYPE[pw.cls]||'Blade'}`:POWERS[pw.id].n;
const brEl=document.createElement('div'); brEl.id='boonRoll'; brEl.hidden=true; stage.appendChild(brEl);
(function(){ const st=document.createElement('style'); st.textContent=`
#boonRoll{position:absolute;inset:0;z-index:30;background:rgba(4,2,3,.9);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:calc(var(--u)*1);font-family:var(--fs);color:var(--bone);pointer-events:auto}
#boonRoll .bh{font-family:var(--fd);font-size:calc(var(--u)*2.6)}#boonRoll .bh span{font-family:'Shippori Mincho',serif;color:#ffd27a;margin-left:.4em}
#boonRoll .br{position:relative;width:calc(var(--u)*70);height:calc(var(--u)*7);overflow:hidden;border:1px solid #2a2020;background:#0a0708}
#boonRoll .bs{display:flex;position:absolute;left:0;top:0;height:100%;will-change:transform}
#boonRoll .bt{flex:none;width:calc(var(--u)*7);height:100%;margin-right:calc(var(--u)*.5);display:flex;align-items:center;justify-content:center;font-family:'Shippori Mincho',serif;font-size:calc(var(--u)*2.2);background:#120d0c;border-bottom:3px solid var(--c);color:var(--c);box-shadow:inset 0 0 calc(var(--u)*1.2) var(--g)}
#boonRoll .bt.won{outline:2px solid #fff}#boonRoll .mk{position:absolute;left:50%;top:0;bottom:0;width:2px;background:#ff6a3a;box-shadow:0 0 6px #ff6a3a}
#boonRoll .bo{font-size:max(10px,calc(var(--u)*1.1));color:#9a8a7a}#boonRoll .bo b{font-weight:400}
#boonRoll .bp{max-width:calc(var(--u)*56);text-align:center;min-height:calc(var(--u)*9)}#boonRoll .bp .pk{font-family:'Shippori Mincho',serif;font-size:calc(var(--u)*4);line-height:1}
#boonRoll .bp .pn{font-family:var(--fd);font-size:calc(var(--u)*2.4)}#boonRoll .bp .pd{font-family:var(--fb);font-size:max(11px,calc(var(--u)*1.35));margin-top:.4em}
#boonRoll .row{display:flex;gap:calc(var(--u)*.8)}`; document.head.appendChild(st); })();
function boonRoll(st,th){ const prev=mode; mode='boon'; hud.hidden=true; const w=BR_RAR.reduce((a,b)=>a+b.w,0); let x=R()*w, rar=1; for(const b of BR_RAR){ x-=b.w; if(x<=0){ rar=b.r; break; } }
  const N=44, WI=36, tiles=[], near=rar<3&&R()<.5?WI+(R()<.5?1:-1):-1;
  brEl.innerHTML=`<div class="bh">Borrowed power<span>借</span></div><div class="br"><div class="bs"></div><div class="mk"></div></div><div class="bo">${BR_RAR.map(b=>`<b style="color:${RCOL[b.r]}">${b.n} ${b.w}%</b>`).join(' · ')}</div><div class="bp"></div><div class="row"></div>`; brEl.hidden=false;
  const strip=brEl.querySelector('.bs'); const tileR=()=>{ let y=R()*w; for(const b of BR_RAR){ y-=b.w; if(y<=0) return b.r; } return 1; };
  for(let i=0;i<N;i++){ const r=i===WI?rar:i===near?pick([3,4,5]):tileR(); const d=document.createElement('div'); d.className='bt'; d.style.setProperty('--c',RCOL[r]); d.style.setProperty('--g',RGLOW[r]); d.textContent=['','借','借','奇','契','神'][r]; strip.appendChild(d); tiles.push(d); }
  const reelW=strip.parentElement.clientWidth, cw=tiles[1].offsetLeft-tiles[0].offsetLeft, tw=tiles[0].offsetWidth, target=WI*cw+(near>WI?.8:near>=0?.2:rnd(.2,.8))*tw-reelW/2, dur=RM?600:3600, t0=performance.now(); let li=-1, landed=false;
  if(AU.caseDrums) AU.caseDrums(dur/1000,rar>=3?2:1);
  const land=()=>{ if(landed) return; landed=true; strip.style.transform=`translateX(${-target}px)`; tiles[WI].classList.add('won'); AU.reveal(Math.min(5,rar+(rar>=3?0:0))); if(AU.caseHit) AU.caseHit(rar);
    let id=powerFor(th,rar); if(!id){ id=powerFor(th,2); }
    const offer=(pid,rr)=>{ const d=POWERS[pid]; const pw={id:pid,r:rr,stone:st.id,th}; if(pid==='oath') pw.cls=wcls('main')==='fist'?'sword':wcls('main');
      brEl.querySelector('.bp').innerHTML=`<div class="pk" style="color:${RCOL[rr]}">${d.k}</div><div class="pn" style="color:${RCOL[rr]}">${powName(pw)}</div><div class="pd">${d.d}${pid==='oath'?` (${WEAPON_TYPE[pw.cls]||'Sword'})`:''}</div><div class="bo">${['','Magic','Rare','Legendary','Bargain','Abyssal'][rr]} · until this climb ends</div>`;
      const row=brEl.querySelector('.row'); row.innerHTML='';
      const btn=(lab,fn,ghost)=>{ const b=document.createElement('button'); b.className='btn'+(ghost?' ghost':''); b.innerHTML=lab; b.onclick=fn; row.appendChild(b); return b; };
      const take=()=>{ grantPower(pw); close(); };
      if(d.bargain){ btn('Accept the bargain <kbd>E</kbd>',take); btn('Refuse — take a Rare boon',()=>{ offer(powerFor(th,2)||'carry2',2); },true); }
      else btn('Take it <kbd>E</kbd>',take).focus({preventScroll:true}); };
    offer(id,rar); };
  const close=()=>{ brEl.hidden=true; mode=prev==='boon'||prev==='card'?'play':prev; if(mode==='play') hud.hidden=false; };
  const step=now=>{ if(landed) return; const k=Math.min(1,(now-t0)/dur), e=1-Math.pow(1-k,4), x=target*e; strip.style.transform=`translateX(${-x}px)`; const idx=Math.floor((x+reelW/2)/cw); if(idx!==li){ li=idx; AU.tick(); } if(k<1) requestAnimationFrame(step); else land(); };
  brEl.onclick=ev=>{ if(!landed&&ev.target===brEl) land(); }; requestAnimationFrame(step); }
addEventListener('keydown',ev=>{ if(brEl.hidden) return; const b=brEl.querySelector('.row .btn'); if((ev.key==='e'||ev.key==='E'||ev.key==='Enter')&&b){ ev.preventDefault(); ev.stopImmediatePropagation(); b.click(); } },true);
function grantPower(pw){ RUN.stones[pw.stone]=pw.th; RUN.powers.push(pw); VOWS_TAKEN=RUN.stones; calcStats(); AU.lvl(); impactT=.05; sparks(P.x,P.y-16,20,RCOL[pw.r]);
  toast(`借 ${POWERS[pw.id].k} ${powName(pw)} — borrowed until the climb ends.`); if(pw.id==='enma'||pw.id==='oni') summonOni(pw.id==='enma'?9999:12); saveGame(); }
if(typeof BG_MODES!=='undefined') BG_MODES.add('boon');

/* ---------- the run: starts at the door, ends at home ---------- */
function runStart(){ RUN={powers:[],deaths:0,stones:{}}; VOWS_TAKEN=RUN.stones; PW.cd={}; PW.ward=0; PW.oniLive=null; if(P) calcStats(); }
function runEnd(){ if(RUN.powers.length) setTimeout(()=>toast(`借 What you borrowed goes back to the dark: ${RUN.powers.map(p=>POWERS[p.id].k).join(' ')}.`),900); runStart(); }
(function(){ const o=startDescent; startDescent=function(){ runStart(); return o(); }; })();
(function(){ const o=newGame; newGame=function(){ const r=o(); runStart(); return r; }; })();
(function(){ const o=coopStart; coopStart=function(m){ runStart(); return o(m); }; })();
(function(){ const o=goCabin; goCabin=function(){ if(L&&L.def.kind!=='cabin') runEnd(); return o(); }; })();
(function(){ const o=saveGame; saveGame=function(){ o(); try{ const db=slotsDB(); const s=db.list.find(x=>x.id===curSlot); if(s&&s.data&&s.data.P){ s.data.P.run=RUN; store.set(SLOTS_KEY,db); } }catch(e){} }; })();
(function(){ const o=restorePlayer; restorePlayer=function(sv){ o(sv); RUN=sv&&sv.run&&sv.run.powers?sv.run:{powers:[],deaths:0,stones:{}}; RUN.powers=RUN.powers.filter(p=>POWERS[p.id]); VOWS_TAKEN=RUN.stones; calcStats(); P.life=P.stats.life; }; })();
/* the list, in the pause menu and the codex */
function powersHTML(){ return RUN.powers.length?RUN.powers.map(p=>`${POWERS[p.id].k} ${powName(p)} (${['','Magic','Rare','Legendary','Bargain','Abyssal'][p.r]}) — ${POWERS[p.id].d}`).join('\n'):'Nothing borrowed yet. Kneel at the remembrance stones and answer them.'; }
(function(){ const o=openPause; openPause=function(){ o(); const col=$('#pause .col'); let b=$('#pPow'); if(!b&&col){ b=document.createElement('button'); b.className='btn ghost'; b.id='pPow'; col.insertBefore(b,$('#pBag').nextSibling); }
  if(b){ b.textContent=`Borrowed power 借 (${RUN.powers.length})`; b.onclick=()=>{ $('#pause').hidden=true; showCard({title:'Borrowed power',jp:'借',body:powersHTML()+`\n\nComebacks left this run: ${livesLeft()} of 3.`,buttons:[{label:'Back',fn:()=>{ hideCard(); openPause(); }}]}); }; } }; })();
(function(){ const o=renderCodex; renderCodex=function(){ o(); const v=$('#vowsTxt'); if(v) v.innerHTML=`<b>${CODEX_OPEN.size} / ${CODEX.length}</b> written. Borrowed this run: ${RUN.powers.length?RUN.powers.map(p=>`<b style="color:${RCOL[p.r]}">${POWERS[p.id].k} ${powName(p)}</b>`).join(', '):'nothing yet'}.`; }; })();
