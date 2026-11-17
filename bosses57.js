'use strict';
/* ===== v51: Act II's five bosses on stages that move (BT, 17 Nov: "the bosses especially in the second zone feel a
   bit out of place and not nearly epic enough … get creative … moving parts, something that humans would love, maybe
   something from other games that's not been done here before") =====
   One idea each, borrowed from the fights people remember: the arena is a machine, and the machine can be turned.
   Lord Brann, the Siege Works · you cross a field under his guns to a palisade you can't climb. Powder carts stand
     in the field: strike one and it rolls. Roll one into the palisade and it comes down, with him behind it. The
     great bombard on the hill behind fires at you the whole time.
   The Tithe-Collector, the Counting House · he opens by taking a quarter of your crowns, and takes more with every
     blow he lands. Punish his openings and coins spill back. Kill him and the ledger pays double. Three coin presses
     stamp the floor in a row; they stamp him too if he is standing under one.
   The Choir of Teeth, the Cathedral of the Crown · the rose window turns and three shafts of its light walk the
     floor. The light burns you, and it strips the Choir's guard. Canon: the organ plays four of its five ranks in
     order, then sounds them in the same order. Remember the tune.
   Marshal Rook, the Iron Barracks · two ballistae on the walls. Climb, wait for him to ride over the chalk mark,
     and loose. Stand up there too long and the wall archers find you.
   Ser Gideon, the Gate of Pikes · a longer bridge in nine spans. Fuse: he lights the span you are standing on.
     Get off it, and get him onto it. In his last quarter the charges go on their own.
   Numbers are in A2. Hazards hurt the hero on this machine only. */
const A2={cartSp:150,cartFuse:6,breach:.08,momEvery:[11,8],tithe:.25,steal:.08,spill:.06,pressEvery:[6.8,5.2],pressHit:.05,shaftW:16,shaftDmg:.4,canonShow:.38,canonGap:.34,
  balCd:14,balHit:.07,balR:60,campT:4.5,fuse:3.2,fuseHit:.07,autoFuse:7,minSpans:4};
for(const [t,w,h,n] of [['powdercart',20,14,'Powder Cart']]){ EDEF[t]={w,h,hp:99999,dmg:0,spd:0,xp:0,name:n}; NO_RANK.add(t); SP_PROPS.add(t); }
const a2Hit=(e,frac)=>{ e.hp=Math.max(1,e.hp-e.maxhp*frac); num(e.x,e.y-e.h-10,Math.round(e.maxhp*frac),'#ffd27a',true); };
const a2Txt=(s,x,y,col,px)=>{ ectx.font=`bold ${px||8}px "IM Fell English SC",serif`; ectx.textAlign='center'; ectx.fillStyle=col; ectx.fillText(s,x,y); };
BOSSES.choir.kit=[['volley','canon','ring','dive','rain'],['hymn','canon','volley','ring2','dive','rain','summon'],['hymn','beam','canon','ring2','dive','hymn','rain']];
BOSSES.gideon.kit=[['flame','duel','pikes','fuse'],['flame','fuse','duel','charge','pikes'],['fuse','flame','duel','fuse','rain']];
Object.assign(PHASE3_SUB,{brann:'He brings the great gun to bear twice over.',choir:'The window turns faster.',rook:'"He has my children too."',gideon:'He smiles. The charges under the bridge are lit.',tithe:'He closes the ledger.'});

/* ---------- ground ---------- */
Object.assign(SP_ARENA,{
  brann(def){ const Lv=spArena(def,72,[[10,12,5],[25,11,5],[40,12,5]]); for(let y=8;y<=15;y++) for(const x of [58,59]) Lv.g[y][x]=1; Lv.fg=[]; return Lv; },
  tithe(def){ const Lv=spArena(def,52,[[4,11,5],[43,11,5]]); Lv.torches=[{x:3,y:9},{x:48,y:9}]; Lv.fg=[]; return Lv; },
  choir(def){ const Lv=spArena(def,56,[[4,11,6],[46,11,6],[24,8,8]]); Lv.torches=[{x:6,y:9},{x:49,y:9}]; Lv.fg=[]; return Lv; },
  rook(def){ const Lv=spArena(def,64,[[3,10,6],[55,10,6]]); Lv.fg=[]; return Lv; },
  gideon(def){ const Lv=spArena(def,64,[]); Lv.sections=[...Array(9)].map((_,i)=>[4+i*6,9+i*6]); Lv.fg=[]; return Lv; } });
Object.assign(SP_INIT,{
  brann(){ const S={kind:'brann',breach:0,mom:7,cartT:0,gun:-9}; for(const x of [13,31,47]) a2Cart(x*T); return S; },
  tithe(){ return {kind:'tithe',hoard:0,took:0,cyc:5,dirn:1,spillT:0,press:[13,26,39].map(x=>({x:x*T,k:0,st:0,t:0}))}; },
  choir(){ U.uAmb.value.set(pal.amb[0]*.6,pal.amb[1]*.55,pal.amb[2]*.6); return {kind:'choir',rot:rnd(0,6),tk:0,lit:-9}; },
  rook(){ return {kind:'rook',camp:0,bal:[{x:5.5*T,dir:1,zone:21*T,cd:0,shot:-9},{x:58.5*T,dir:-1,zone:43*T,cd:0,shot:-9}]}; },
  gideon(){ return {kind:'gideon',fuses:[],auto:5,p3:0}; } });
function a2Cart(x){ const c=mkEnemyAt('powdercart',x,FLOOR()); c.intro=false; c.state='prop'; c.hp=c.maxhp=99999; c.champ=false; c.roll=0; c.name='Powder Cart'; enemies.push(c); return c; }

/* ---------- Brann ---------- */
function a2CartBlow(c,breach){ if(c.dead) return; c.dead=true; c.deadT=9; const F=FLOOR(), b=spBoss(), dmg=b?b.dmg*1.4:20; boom(c.x,F-2,48,dmg); AU.boom(1); shake(11); for(let i=0;i<26;i++) part({x:c.x,y:F-8,vx:rnd(-220,220),vy:rnd(-300,-40),g:600,life:rnd(.4,.9),em:i%2===0,col:pick(['#ffd27a','#ff8a3a','#3a2a1c','#5a4630'])});
  const S=L.sp; if(breach&&S&&!S.breach){ S.breach=1; for(let y=8;y<=15;y++) for(const x of [58,59]) L.g[y][x]=0; LVc.clearRect(58*T,8*T,2*T,8*T); impactT=.2; bossSlow=Math.max(bossSlow,.7); U.uWhite.value=.35;
    for(let i=0;i<40;i++) part({x:58*T+rnd(0,32),y:rnd(8*T,F),vx:rnd(40,260),vy:rnd(-260,20),g:700,life:rnd(.6,1.3),col:pick(['#4a3a2a','#6a5236','#2a1e14']),size:ri(2,4)});
    if(b&&!b.intro){ a2Hit(b,A2.breach); bossBreak(b,3); } showBossName('The palisade is down','破','His own powder. Go through.'); }
  else if(b&&!b.intro&&Math.abs(b.x-c.x)<50){ a2Hit(b,A2.breach*.6); bossBreak(b,2); } }
SP_X.prop.powdercart=function(c,dt){ const F=FLOOR(), S=L.sp; c.y=F; if(!c.roll) return; c.x+=c.roll*A2.cartSp*dt; c.fuse-=dt; if(R()<.6) part({x:c.x-c.roll*8,y:F-14,vx:rnd(-20,20),vy:rnd(-60,-20),g:100,life:.3,em:true,col:'#ffcf7a'}); if(R()<.3) dust(c.x-c.roll*10,F,1);
  const b=spBoss(); if(S&&!S.breach&&c.roll>0&&c.x>=58*T-11) a2CartBlow(c,true); else if(c.x<2*T+10||c.x>(L.w-2)*T-10||c.fuse<=0||(b&&!b.intro&&S&&S.breach&&Math.abs(b.x-c.x)<22)) a2CartBlow(c,false); };
EDRAW.powdercart=function(c,e){ const w=e.roll?Math.round(e.anim*14)%2:0; rect(c,-10,-12,20,8,'#3a2a1c'); rect(c,-10,-12,20,1,'#5a4630'); for(const x of [-7,-1,5]){ rect(c,x,-17,5,6,'#2a1e14'); rect(c,x,-17,5,1,'#6a5236'); rect(c,x,-14,5,1,'#8a8478'); }
  for(const x of [-8,6]){ rect(c,x-1,-5,5,5,'#1a120c'); rect(c,x+w,-4+w,1,3,'#8a8478'); rect(c,x,-3,3,1,'#8a8478'); } rect(c,-12,-9,3,1,'#3a2a1c'); if(e.roll) rect(c,1,-20,1,3,'#ffcf7a'); };
const dShell=(sx,sy,f)=>{ ctx.fillStyle='#1a1414'; ctx.beginPath(); ctx.arc(sx,sy-9,9,0,7); ctx.fill(); rect(ctx,sx-4,sy-15,3,3,'#4a4448'); ectx.fillStyle='rgba(255,150,60,.8)'; ectx.fillRect(sx-1,sy-22,2,4); };
SP_X.tick.brann=function(S,e,dt,F,live){ if(!live) return; if(!S.breach&&!enemies.some(c=>c.type==='powdercart'&&!c.dead)){ S.cartT+=dt; if(S.cartT>5){ S.cartT=0; a2Cart(4*T); toast('The works send another cart of powder up the line.',1); } }
  if(!S.told&&P.x>12*T){ S.told=1; spTell('carts','Powder carts. Strike one and it rolls the way you hit it. Roll one into the palisade.'); }
  S.mom-=dt; if(S.mom>0) return; S.mom=A2.momEvery[e.phase>2?1:0]; S.gun=time; AU.boom(.35); AU.tone('sine',60,34,1.2,.4,.6); const n=e.phase>2?2:1, lv=L;
  for(let i=0;i<n;i++){ setTimeout(()=>{ if(L!==lv||mode!=='play'||e.dead) return; const x=clamp(P.x+(i?P.face*96:P.vx*.6),2*T,(L.w-2)*T); spDrop(x,1.5,{w:26,h:30,dmg:e.dmg*1.5,shake:12,wave:50,draw:dShell,onLand(x,y){ AU.boom(.9); for(const o of enemies) if(!o.dead&&!o.boss&&Math.abs(o.x-x)<54) dmgEnemy(o,e.dmg*1.5,false,Math.sign(o.x-x)||1,140,true); LVc.fillStyle='rgba(0,0,0,.45)'; LVc.fillRect(x-20,y,40,3); LVc.fillRect(x-12,y+3,24,2); for(let k=0;k<16;k++) part({x,y:y-4,vx:rnd(-180,180),vy:rnd(-260,-60),g:600,life:rnd(.4,.8),em:k%2===0,col:pick(['#ffd27a','#ff8a3a','#3a302a'])}); }}); },900+i*450); } };
(function(){ const o=startPat2; startPat2=function(e,n,p){ const S=L&&L.sp;
  if(S&&S.kind==='brann'&&!S.breach&&(n==='sappers'||n==='slam')){ n='barrage'; p.name=n; }
  if(n==='canon'){ const z=[0,1,2,3,4]; for(let i=4;i>0;i--){ const j=Math.floor(R()*(i+1)); [z[i],z[j]]=[z[j],z[i]]; } p.seq=z.slice(0,4); p.show=-1; p.sh=0; p.bl=0; spTell('canon','Canon: the organ plays four of its five ranks, then sounds them in the same order. Stand under the one it left out, or follow behind the tune.'); return; }
  if(n==='fuse'){ const i=(L.sections||[]).findIndex(s=>!s.gone&&P.x>=s[0]*T&&P.x<(s[1]+1)*T), live=(L.sections||[]).filter(s=>!s.gone).length; if(i<0||live<=A2.minSpans||S.fuses.some(f=>f.i===i)){ n='flame'; p.name=n; return o(e,n,p); }
    p.sec=i; a2Fuse(S,i,A2.fuse); caption('"Mind your footing."','足元'); setTimeout(()=>caption(''),1300); AU.cast(); spTell('fuse','He has lit the span you are standing on. Get off it before it goes, and get him onto it.'); return; }
  return o(e,n,p); }; })();
const A2_NOTE=[147,175,196,220,262];
(function(){ const o=runPat2; runPat2=function(e,dt,p,n,t,F){
  if(n==='canon'){ const zw=(L.w-2)*T/5, tb=.3+4*A2.canonShow+.5; while(p.sh<4&&t>=.3+p.sh*A2.canonShow){ p.show=p.seq[p.sh]; p.showT=t; AU.tone('triangle',A2_NOTE[p.show],A2_NOTE[p.show],.3,.16,.7); AU.tone('sine',A2_NOTE[p.show]/2,A2_NOTE[p.show]/2,.3,.14,.7); p.sh++; }
    while(p.bl<4&&t>=tb+p.bl*A2.canonGap){ const z=p.seq[p.bl], x0=T+z*zw; p.bl++; AU.tone('sawtooth',A2_NOTE[z],A2_NOTE[z],.35,.2,.8); AU.noise(.3,300,1800,1,.25,'bandpass',.5); shake(4);
      hazard(x0,0,zw,F,.28,e.dmg*1.1,{x:x0+zw/2},f=>{ const k=1-f.t/f.dur; ctx.fillStyle=`rgba(255,236,190,${(k*.55).toFixed(2)})`; ctx.fillRect(x0-camR.x,0,zw,F-camR.y); ectx.fillStyle=`rgba(255,236,190,${(k*.5).toFixed(2)})`; ectx.fillRect(x0-camR.x,0,2,F-camR.y); ectx.fillRect(x0-camR.x+zw-2,0,2,F-camR.y); for(let y=0;y<F-camR.y;y+=9){ ectx.fillStyle=`rgba(255,255,255,${(k*.5).toFixed(2)})`; ectx.fillRect(x0-camR.x+((y*7+f.t*900)%zw),y,10,1); } }); }
    if(t>=tb+4*A2.canonGap+.5) endPat(e,1); return true; }
  if(n==='fuse'){ const dx=P.x-e.x; e.face=Math.sign(dx)||e.face; if(Math.abs(dx)>40) e.x=clamp(e.x+e.face*95*dt,2*T,(L.w-2)*T); if(t>=1.3) endPat(e,.5); return true; }
  return o(e,dt,p,n,t,F); }; })();

/* ---------- the Tithe-Collector ---------- */
SP_X.tick.tithe=function(S,e,dt,F,live){ if(!live) return; if(!S.took){ S.took=1; const amt=Math.floor((P.gold||0)*A2.tithe); P.gold-=amt; S.hoard=amt; lastHud=''; toast(amt>0?`He takes his tithe: ${amt} crowns. Kill him and the ledger pays double. Every blow he lands takes more.`:'You have nothing for him to take. He writes that down too.',2); for(let i=0;i<Math.min(20,amt);i++) part({x:P.x,y:P.y-18,vx:(e.x-P.x)*rnd(.8,1.4),vy:rnd(-220,-120),g:300,life:.9,em:true,col:'#ffd06a'}); AU.coin(); }
  S.cyc-=dt; if(S.cyc<=0){ S.cyc=A2.pressEvery[e.phase>1?1:0]; const ord=S.dirn>0?[0,1,2]:[2,1,0]; S.dirn=-S.dirn; ord.forEach((pi,k)=>{ const pr=S.press[pi]; if(pr.st===0){ pr.st=1; pr.t=k*.55; } }); AU.chain(); }
  for(const pr of S.press){ if(pr.st===0) continue; pr.t-=dt;
    if(pr.st===1&&pr.t<=0){ pr.st=2; pr.t=.9; teleRect(pr.x-24,0,48,F,.9); }
    else if(pr.st===2){ pr.k=Math.max(0,-.08*Math.sin((.9-pr.t)*20)); if(pr.t<=0){ pr.st=3; pr.t=.5; pr.k=1; AU.slam(); AU.boom(.6); AU.clang(); shake(9); shockwave(pr.x,F,34,[-1,1]); for(let i=0;i<10;i++) part({x:pr.x+rnd(-20,20),y:F-2,vx:rnd(-120,120),vy:rnd(-200,-60),g:600,life:.6,em:true,col:'#ffd06a'});
        if(!P.dead&&Math.abs(P.x-pr.x)<26&&P.y>F-80) hurtPlayer(e.dmg*1.4,{x:pr.x,hp:0,dead:true});
        if(Math.abs(e.x-pr.x)<34&&e.state!=='stagger'){ a2Hit(e,A2.pressHit); bossBreak(e,2); showBossName('Stamped','刻印','His own press. Strike.'); spTell('press2','The presses don\'t care who is under them.'); } } }
    else if(pr.st===3&&pr.t<=0){ pr.st=4; pr.t=.7; }
    else if(pr.st===4){ pr.k=Math.max(0,pr.t/.7); if(pr.t<=0){ pr.st=0; pr.k=0; } } } };
(function(){ const o=hurtPlayer; hurtPlayer=function(d,src){ const S=L&&L.sp; if(!S||S.kind!=='tithe'||!src||!src.boss) return o(d,src); const l0=P.life, r=o(d,src); if(P.life<l0&&(P.gold||0)>0){ const amt=Math.max(1,Math.ceil(P.gold*A2.steal)); P.gold-=amt; S.hoard+=amt; lastHud=''; num(P.x,P.y-44,amt,'#ffd06a'); AU.coin(); for(let i=0;i<6;i++) part({x:P.x,y:P.y-18,vx:(src.x-P.x)*rnd(.8,1.6),vy:rnd(-200,-100),g:300,life:.8,em:true,col:'#ffd06a'}); } return r; }; })();
(function(){ const o=bossDefeated; bossDefeated=function(e){ const S=L&&L.sp; if(S&&S.kind==='tithe'&&S.hoard>0){ const pay=S.hoard*2; for(let i=0;i<8;i++) dropGold(e.x+rnd(-50,50),e.y-rnd(20,70),Math.ceil(pay/8)); setTimeout(()=>toast(`Paid in full, with interest: ${pay} crowns.`,2),1500); S.hoard=0; } return o(e); }; })();

/* ---------- shared blow hooks: carts roll, the ledger spills ---------- */
(function(){ const o=dmgEnemy; dmgEnemy=function(e,d,crit,dir,kb,heavy,launch,stun){
  if(e&&e.type==='powdercart'){ if(e.dead) return; e.flash=.1; if(!e.roll){ e.roll=dir||Math.sign(e.x-P.x)||1; e.fuse=A2.cartFuse; AU.noise(.3,300,900,2,.3,'bandpass',.2); sparks(e.x,e.y-12,6,'#ffcf7a'); } return; }
  const S=L&&L.sp; if(S&&S.kind==='tithe'&&e&&e.boss&&!e.dead&&S.hoard>0&&typeof bossOpen==='function'&&bossOpen(e)&&S.spillT<time){ S.spillT=time+1.2; const amt=Math.max(1,Math.ceil(S.hoard*A2.spill)); S.hoard-=amt; dropGold(e.x+rnd(-14,14),e.y-rnd(30,60),amt); AU.coin(); }
  return o(e,d,crit,dir,kb,heavy,launch,stun); }; })();

/* ---------- the Choir ---------- */
const a2Shaft=(S,i)=>L.w*T/2+Math.sin(S.rot*.45+i*2.0944)*(L.w*T/2-44);
SP_X.tick.choir=function(S,e,dt,F,live){ S.rot+=dt*(e.phase>2?1.3:1); if(!live) return; S.tk-=dt;
  for(let i=0;i<3;i++){ const x=a2Shaft(S,i); if(Math.abs(e.x-x)<28){ bossSetOpen(e,.25,1); if(S.lit<time-.5){ sparks(e.x,e.y-e.h*.5,6,'#ffe6a8'); spTell('lit','Caught in the window\'s light, the Choir has no guard. Keep it there, and keep out of it yourself.'); } S.lit=time; }
    if(S.tk<=0&&!P.dead&&Math.abs(P.x-x)<A2.shaftW&&!underCover()){ S.tk=.5; hurtPlayer(e.dmg*A2.shaftDmg,{x:x+(P.x<x?10:-10),hp:0,dead:true}); spTell('shaft','The light from the rose window is the Crown looking at you. Stay out of it, or under the lofts.'); } } };
SP_X.p3.choir=function(S,e){ U.uWhite.value=.3; shake(8); };

/* ---------- Rook ---------- */
function a2Loose(b){ const S=L.sp, F=FLOOR(); b.cd=A2.balCd; b.shot=time; AU.swing(true); AU.noise(.25,200,3000,1,.4,'bandpass',.3); AU.clang(); shake(4); const x0=b.x+b.dir*10, y0=10*T-12;
  fx.push({t:0,dur:.5,upd(f){ if(f.t>=.2&&!f.h){ f.h=1; shake(9); AU.slam(); dust(b.zone,F,18); const e=spBoss(); let hit=false;
        if(e&&!e.intro&&Math.abs(e.x-b.zone)<A2.balR&&e.y>F-60){ hit=true; a2Hit(e,A2.balHit); bossBreak(e,2.8); if(e.mounted){ e.vx=0; } showBossName('Run through','貫','The bolt takes him out of the charge. Get down there.'); bossSlow=Math.max(bossSlow,.6); }
        for(const o of enemies) if(!o.dead&&!o.boss&&Math.abs(o.x-b.zone)<A2.balR&&Math.abs(o.y-F)<40) dmgEnemy(o,60+dep()*14,true,b.dir,160,true);
        if(!hit) spTell('balmiss','The bolt lands on the chalk mark, nowhere else. Loose it when he rides over the mark.'); } },
    draw(f){ const k=clamp(f.t/.2,0,1), x=lerp(x0,b.zone,k)-camR.x, y=lerp(y0,F-6,k)-camR.y, a=Math.atan2(F-6-y0,b.zone-x0); ctx.save(); ctx.translate(x,y); ctx.rotate(a); rect(ctx,-26,-1,28,2,'#cfc6b2'); rect(ctx,0,-2,5,4,'#8a8478'); ctx.restore(); if(k<1){ ectx.strokeStyle='rgba(255,240,210,.5)'; ectx.lineWidth=1; ectx.beginPath(); ectx.moveTo(x0-camR.x,y0-camR.y); ectx.lineTo(x,y); ectx.stroke(); } }}); }
(function(){ const o=findInteract; findInteract=function(){ const S=L&&L.sp; if(S&&S.kind==='rook'&&!P.dead) for(const b of S.bal) if(b.cd<=0&&Math.abs(P.x-b.x)<22&&Math.abs(P.y-10*T)<8){ const e=spBoss(); if(e&&!e.intro) return {o:b,txt:'<kbd>E</kbd> Loose the ballista',act:()=>a2Loose(b)}; } return o(); }; })();
SP_X.tick.rook=function(S,e,dt,F,live){ for(const b of S.bal) if(b.cd>0) b.cd-=dt; if(!live) return; if(!S.told&&P.x>12*T){ S.told=1; spTell('bal','Two ballistae on the walls. Each is laid on a chalk mark in the yard.'); }
  const up=P.y<=10*T+2&&(P.x<10*T||P.x>54*T); S.camp=up?S.camp+dt:Math.max(0,S.camp-dt*2);
  if(S.camp>A2.campT){ S.camp=A2.campT-2.2; teleRect(P.x-44,10*T-70,88,70,.55); spTell('camp','The wall archers have found you. Don\'t stay up here.'); AU.noise(.3,2400,1200,3,.2,'bandpass',.2); for(let i=0;i<7;i++) eProj({type:'arrow',x:P.x+rnd(-40,40),y:10*T-190-i*14,vx:0,vy:330,dmg:e.dmg*.6,r:3,life:2,ghost:true}); } };

/* ---------- Gideon ---------- */
function a2Fuse(S,i,dur){ const s=L.sections[i]; if(!s||s.gone||S.fuses.some(f=>f.i===i)) return; S.fuses.push({i,t:dur,dur}); teleRect(s[0]*T,FLOOR()-7,(s[1]-s[0]+1)*T,9,dur); AU.noise(dur,2500,5000,2,.08,'highpass',.2); }
function a2SpanBlow(S,i){ const s=L.sections[i], F=FLOOR(), x0=s[0]*T, x1=(s[1]+1)*T, e=spBoss(); if(!s||s.gone) return; AU.boom(1.2); U.uWhite.value=Math.max(U.uWhite.value,.2); impactT=.12;
  for(let k=0;k<24;k++) part({x:rnd(x0,x1),y:F,vx:rnd(-120,120),vy:rnd(-320,-80),g:700,life:rnd(.5,1.1),em:k%3===0,col:pick(['#ffd27a','#ff8a3a','#3a3a40','#6e6a68'])});
  if(!P.dead&&P.x>=x0&&P.x<x1&&P.y>F-50) hurtPlayer((e?e.dmg:20)*1.3,{x:(x0+x1)/2,hp:0,dead:true});
  if(e&&!e.intro&&e.x>=x0-4&&e.x<x1+4){ const okL=i===0||!L.sections[i-1].gone, okR=i===L.sections.length-1||!L.sections[i+1].gone, nearL=Math.abs(e.x-x0)<Math.abs(e.x-x1); e.x=clamp((nearL&&okL)||!okR?x0-10:x1+10,2*T,(L.w-2)*T); e.y=F; e.vy=0; a2Hit(e,A2.fuseHit); bossBreak(e,3.2); showBossName('He goes down with it','落','He is hauling himself back up. Strike.'); bossSlow=Math.max(bossSlow,.6); }
  breakSection(i); }
SP_X.tick.gideon=function(S,e,dt,F,live){ for(const f of S.fuses){ f.t-=dt; const s=L.sections[f.i]; if(R()<.7) sparks(lerp(s[0]*T,(s[1]+1)*T,1-f.t/f.dur),F-1,1,'#ffcf7a'); if(f.t<=0&&!e.dead) a2SpanBlow(S,f.i); } S.fuses=S.fuses.filter(f=>f.t>0&&!L.sections[f.i].gone);
  if(e.y>F&&!e.dead){ e.y=F; e.vy=0; } if(!live||!S.p3) return; S.auto-=dt; if(S.auto<=0){ S.auto=A2.autoFuse; const liveS=L.sections.map((s,i)=>i).filter(i=>!L.sections[i].gone&&!S.fuses.some(f=>f.i===i)); if(liveS.length>A2.minSpans-1) a2Fuse(S,pick(liveS),4.2); } };
SP_X.p3.gideon=function(S){ S.p3=1; S.auto=2.5; spTell('ticking','The charges are going off on their own now. Watch the sparks along the deck.'); };

/* ---------- far planes ---------- */
const a2Par=(k)=>Math.round(W/2-(camR.x+W/2-L.w*T/2)*k);
SP_X.back.brann=function(S,F){ const hy=F-46, cx=a2Par(.14)+120, rec=clamp(1-(time-S.gun)/.5,0,1);
  /* the hill, the great bombard, its crew */ ctx.fillStyle='#0d0808'; ctx.beginPath(); ctx.moveTo(cx-170,hy+12); ctx.quadraticCurveTo(cx-40,hy-58,cx+40,hy-50); ctx.quadraticCurveTo(cx+130,hy-40,cx+210,hy+12); ctx.fill();
  ctx.save(); ctx.translate(cx-6+rec*7,hy-52); ctx.rotate(-2.55); rect(ctx,0,-7,74,14,'#161012'); rect(ctx,0,-7,74,2,'#2e2224'); for(const x of [8,30,52,70]) rect(ctx,x,-8,3,16,'#2e2224'); rect(ctx,-8,-9,10,18,'#161012'); ctx.restore();
  for(const d of [-14,10]){ ctx.fillStyle='#161012'; ctx.beginPath(); ctx.arc(cx+d,hy-44,10,0,7); ctx.fill(); ctx.fillStyle='#0d0808'; ctx.beginPath(); ctx.arc(cx+d,hy-44,6,0,7); ctx.fill(); }
  for(let i=0;i<5;i++){ const x=cx+34+i*9, b=Math.round(Math.abs(Math.sin(time*2+i))*1.5); rect(ctx,x,hy-56-b,2,6,'#0a0607'); rect(ctx,x-1,hy-58-b,3,2,'#0a0607'); }
  if(rec>0){ const mx=cx-68, my=hy-94; ectx.fillStyle=`rgba(255,200,110,${(rec*.9).toFixed(2)})`; ectx.beginPath(); ectx.arc(mx,my,6+rec*16,0,7); ectx.fill(); ctx.fillStyle=`rgba(255,120,40,${(rec*.3).toFixed(2)})`; ctx.fillRect(0,0,W,hy); }
  const sm=clamp((time-S.gun)/3,0,1); if(sm<1) for(let i=0;i<6;i++){ ctx.fillStyle=`rgba(60,48,46,${((1-sm)*.5).toFixed(2)})`; ctx.beginPath(); ctx.arc(cx-70-sm*30-i*6,hy-96-sm*40-i*7,6+sm*14+i,0,7); ctx.fill(); }
  /* trebuchets working, a siege tower creeping */ for(const [dx,ph] of [[-190,0],[-250,1.7]]){ const x=cx+dx, a=-.9+Math.sin(time*.9+ph)*1.1; rect(ctx,x-1,hy-30,3,34,'#0d0808'); ctx.strokeStyle='#0d0808'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(x-12,hy+4); ctx.lineTo(x,hy-28); ctx.lineTo(x+12,hy+4); ctx.stroke(); ctx.save(); ctx.translate(x,hy-29); ctx.rotate(a); rect(ctx,-9,-1,40,2,'#0d0808'); rect(ctx,-13,-4,7,8,'#0d0808'); ctx.restore(); }
  const tx=((time*3)%(W+120))-60; rect(ctx,Math.round(W-tx),hy-52,20,58,'#0b0607'); rect(ctx,Math.round(W-tx)-3,hy-56,26,5,'#0b0607'); for(let k=0;k<3;k++) rect(ctx,Math.round(W-tx)+4,hy-44+k*16,12,2,'#1c1214'); };
SP_X.world.brann=function(S,F,sy){ if(S.breach) return; const x=58*T-camR.x, top=8*T-camR.y; if(x<-40||x>W+8) return; for(let i=0;i<4;i++){ const lx=x+i*8; rect(ctx,lx,top-10,7,sy-top+10,i%2?'#3a2a1c':'#46321f'); rect(ctx,lx,top-10,1,sy-top+10,'#5a4630'); ctx.fillStyle=i%2?'#3a2a1c':'#46321f'; ctx.beginPath(); ctx.moveTo(lx,top-10); ctx.lineTo(lx+3.5,top-20); ctx.lineTo(lx+7,top-10); ctx.fill(); }
  rect(ctx,x-2,top+18,36,3,'#1a120c'); rect(ctx,x-2,top+70,36,3,'#1a120c'); const fl=Math.sin(time*4)*2; rect(ctx,x+15,top-44,1,26,'#1a120c'); for(let i=0;i<4;i++) rect(ctx,x+16+i*4,top-44+Math.round(Math.sin(time*5+i)*1.5),4,9-i,'#8a1414'); };
SP_X.mid.tithe=function(S,F){ const cx=a2Par(.3), off=(camR.x*.3)|0; ctx.fillStyle='#0e0b09'; ctx.fillRect(0,0,W,F+20);
  /* the wall of deposit drawers */ for(let y=14;y<F-8;y+=12) for(let x=-(off%16)-16;x<W;x+=16){ const h=hsh(Math.floor((x+off)/16),y); rect(ctx,x+1,y,14,10,h>.5?'#1a1410':'#15100c'); rect(ctx,x+6,y+4,3,2,h>.85?'#8a6c30':'#3a2c1a'); }
  /* the gallery of clerks */ rect(ctx,0,F-150,W,3,'#2a2016'); for(let i=0;i<7;i++){ const x=((i*74-off*1.2)%(W+80)+W+80)%(W+80)-40, a=Math.round(Math.sin(time*6+i*2)*2); rect(ctx,x,F-164,10,14,'#0a0706'); rect(ctx,x+2,F-170,6,6,'#0a0706'); rect(ctx,x+10+a,F-158,5,1,'#0a0706'); rect(ctx,x-4,F-153,22,3,'#1c140e'); ectx.fillStyle='rgba(255,190,100,.5)'; ectx.fillRect(x+16,F-159,1,2); }
  /* the scales */ const purse=P?(P.gold||0):0, tilt=clamp((S.hoard-purse)/(S.hoard+purse+40),-1,1)*.22, py=F-128; rect(ctx,cx-3,py,6,F-py,'#2a2016'); rect(ctx,cx-14,F-6,28,6,'#2a2016'); ctx.save(); ctx.translate(cx,py); ctx.rotate(-tilt); rect(ctx,-92,-2,184,4,'#8a6c30'); rect(ctx,-92,-2,184,1,'#c8a85a'); ctx.restore();
  for(const d of [-1,1]){ const ex=cx+d*90*Math.cos(tilt), ey=py+d*90*Math.sin(tilt)*-1*-1*(d<0?1:1)*(d<0?1:1); const yy=py+(d<0?1:-1)*Math.sin(tilt)*90, by=yy+46; ctx.strokeStyle='#6a5226'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(ex,yy); ctx.lineTo(ex-22,by); ctx.moveTo(ex,yy); ctx.lineTo(ex+22,by); ctx.stroke(); rect(ctx,ex-26,by,52,3,'#8a6c30');
    if(d<0){ const hh=Math.min(34,Math.sqrt(S.hoard)*2.2); ctx.fillStyle='#b8902e'; ctx.beginPath(); ctx.moveTo(ex-22,by); ctx.lineTo(ex,by-hh); ctx.lineTo(ex+22,by); ctx.fill(); if(hh>2){ ectx.fillStyle='rgba(255,210,110,.35)'; ectx.fillRect(ex-8,by-hh+2,3,2); ectx.fillRect(ex+4,by-hh*.5,2,2); } a2Txt(String(S.hoard),ex,by+14,'#ffd06a',9); a2Txt('HIS LEDGER',ex,by+23,'#8a6c30',6); }
    else { const hh=Math.min(34,Math.sqrt(purse)*2.2); rect(ctx,ex-7,by-Math.max(6,hh*.6),14,Math.max(6,hh*.6),'#5a4030'); rect(ctx,ex-4,by-Math.max(6,hh*.6)-3,8,3,'#3a2a1c'); a2Txt(String(purse),ex,by+14,'#dccfb2',9); a2Txt('YOUR PURSE',ex,by+23,'#6a5e56',6); } } };
SP_X.world.tithe=function(S,F,sy){ for(const pr of S.press){ const sx=Math.round(pr.x-camR.x); if(sx<-40||sx>W+40) continue; const up=sy-150, y=Math.round(lerp(up,sy-18,pr.k)); rect(ctx,sx-5,0,10,y,'#2a2628'); rect(ctx,sx-5,0,2,y,'#4a4448'); rect(ctx,sx-22,y,44,18,'#3a3436'); rect(ctx,sx-22,y,44,2,'#6a6266'); rect(ctx,sx-22,y+16,44,2,'#1a1618'); rect(ctx,sx-6,y+5,12,7,'#8a6c30'); rect(ctx,sx-4,y+3,2,3,'#8a6c30'); rect(ctx,sx-1,y+3,2,3,'#8a6c30'); rect(ctx,sx+2,y+3,2,3,'#8a6c30');
    rect(ctx,sx-20,sy-2,40,2,'#2a2016'); if(pr.st===2){ ectx.fillStyle=`rgba(255,80,50,${(.3+.3*Math.sin(time*24)).toFixed(2)})`; ectx.fillRect(sx-22,y+16,44,2); } } };
SP_X.mid.choir=function(S,F){ const cx=a2Par(.3), off=(camR.x*.3)|0, e=enemies.find(b=>b.boss), p=e&&e.pat&&e.pat.name==='canon'?e.pat:null; ctx.fillStyle='#0d0a0e'; ctx.fillRect(0,0,W,F+20);
  for(let y=6;y<F;y+=11){ ctx.fillStyle='rgba(230,220,255,.03)'; ctx.fillRect(0,y,W,1); }
  /* the rose window, turning */ const wy=F-150, r=46; ctx.fillStyle='#07060a'; ctx.beginPath(); ctx.arc(cx,wy,r+5,0,7); ctx.fill(); const cols=[[150,34,28],[40,66,130],[160,120,34],[104,34,88]];
  for(let i=0;i<12;i++){ const a=S.rot*.45+i*.5236, c=cols[i%4]; ctx.fillStyle=`rgb(${(c[0]*.62)|0},${(c[1]*.62)|0},${(c[2]*.62)|0})`; ctx.beginPath(); ctx.moveTo(cx,wy); ctx.arc(cx,wy,r,a+.04,a+.48); ctx.fill(); ectx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},.035)`; ectx.beginPath(); ectx.moveTo(cx,wy); ectx.arc(cx,wy,r,a+.04,a+.48); ectx.fill(); }
  ctx.fillStyle='#07060a'; ctx.beginPath(); ctx.arc(cx,wy,9,0,7); ctx.fill(); ectx.fillStyle='rgba(255,230,170,.35)'; ectx.beginPath(); ectx.arc(cx,wy,3,0,7); ectx.fill(); ctx.strokeStyle='#07060a'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(cx,wy,r*.62,0,7); ctx.stroke();
  /* the organ: five ranks of pipes either side */ for(const d of [-1,1]) for(let z=0;z<5;z++){ const zz=d<0?z:4-z, lit=p&&p.show===zz&&p.t-p.showT<.3&&p.bl===0; for(let k=0;k<4;k++){ const x=cx+d*(70+z*30+k*6), h=70+((z*17+k*23)%50)+(d<0?z:4-z)*6; rect(ctx,x,F-40-h,5,h,lit?'#86683a':'#3a2e1c'); rect(ctx,x,F-40-h,1,h,lit?'#b8964e':'#5a4a2c'); rect(ctx,x,F-58,5,2,'#0d0a0e'); if(lit){ ectx.fillStyle='rgba(255,220,140,.12)'; ectx.fillRect(x,F-40-h,5,h); } } }
  rect(ctx,0,F-40,W,3,'#1e1814'); for(const d of [-1,1]) for(let k=0;k<=3;k++){ const px=cx+d*(60+k*96); rect(ctx,px-6,0,12,F+20,'#17121a'); rect(ctx,px-6,0,1,F+20,'#2a2230'); } };
SP_X.world.choir=function(S,F,sy){ const e=enemies.find(b=>b.boss), p=e&&e.pat&&e.pat.name==='canon'?e.pat:null, wx=a2Par(.3), wy=sy-150;
  for(let i=0;i<3;i++){ const x=a2Shaft(S,i)-camR.x; if(x<-60||x>W+60) continue; const c=[[255,190,150],[190,200,255],[255,230,160]][i]; ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},.10)`; ctx.beginPath(); ctx.moveTo(wx-4,wy); ctx.lineTo(wx+4,wy); ctx.lineTo(x+A2.shaftW,sy); ctx.lineTo(x-A2.shaftW,sy); ctx.fill();
    ectx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},.16)`; ectx.fillRect(x-A2.shaftW,sy-3,A2.shaftW*2,3); for(let k=0;k<3;k++){ const yy=((time*26+k*60+i*30)%150); ectx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},.5)`; ectx.fillRect(Math.round(lerp(wx,x,yy/150)+Math.sin(k*5+i)*6),Math.round(wy+yy),1,1); } addLight(a2Shaft(S,i),F-10,46,.5,c[0]/255,c[1]/255,c[2]/255); }
  if(p&&p.show>=0&&p.bl===0&&p.t-p.showT<.32){ const zw=(L.w-2)*T/5, x0=T+p.show*zw-camR.x, k=1-(p.t-p.showT)/.32; ctx.fillStyle=`rgba(255,220,140,${(.16*k).toFixed(2)})`; ctx.fillRect(x0,0,zw,sy); ctx.fillStyle=`rgba(255,220,140,${(.5*k).toFixed(2)})`; ctx.fillRect(x0,0,1,sy); ctx.fillRect(x0+zw-1,0,1,sy); ectx.fillStyle=`rgba(255,220,140,${(.7*k).toFixed(2)})`; ectx.fillRect(x0,sy-2,zw,2); a2Txt(String(p.sh),x0+zw/2,sy-80,`rgba(255,230,170,${k.toFixed(2)})`,16); } };
SP_X.mid.rook=function(S,F){ const cx=a2Par(.25), off=(camR.x*.25)|0, hy=F-44; /* dusk over the yard; the barracks wall, banners, the gate */ const sk=ctx.createLinearGradient(0,0,0,hy); sk.addColorStop(0,'#1c0e14'); sk.addColorStop(.7,'#4a1e1c'); sk.addColorStop(1,'#7a3a22'); ctx.fillStyle=sk; ctx.fillRect(0,0,W,F+20); for(let i=0;i<5;i++){ ctx.fillStyle='rgba(20,10,14,.5)'; ctx.fillRect(((i*130-off*.3)%(W+160)+W+160)%(W+160)-80,30+i*17,90+i*20,5); } rect(ctx,0,hy+12,W,F+20-hy,'#17131a'); rect(ctx,0,hy-70,W,84,'#0f0d10'); for(let x=-(off%22)-22;x<W;x+=22) rect(ctx,x,hy-78,12,8,'#0f0d10'); for(let y=hy-62;y<hy+10;y+=10){ ctx.fillStyle='rgba(255,240,230,.03)'; ctx.fillRect(0,y,W,1); }
  rect(ctx,cx-26,hy-52,52,66,'#070608'); for(let i=0;i<6;i++) rect(ctx,cx-22+i*9,hy-50,2,62,'#1c181e'); for(let i=0;i<4;i++) rect(ctx,cx-24,hy-40+i*14,48,2,'#1c181e');
  for(const dx of [-150,-80,80,150]){ const x=cx+dx; rect(ctx,x,hy-104,1,40,'#1c181e'); for(let i=0;i<5;i++){ const w=Math.round(Math.sin(time*3+i*.7+dx)*2); rect(ctx,x+1+i*3,hy-104+w,3,16-i,i%2?'#7a1016':'#8a1418'); } rect(ctx,x+5,hy-98,5,5,'#c8a040'); }
  /* the garrison at drill: three ranks, pikes up, pikes level, on the drum */ const beat=Math.floor(time/1.2)%2, tr=clamp((time%1.2)/.25,0,1), ang=beat?lerp(-1.5,-.5,tr):lerp(-.5,-1.5,tr);
  for(let r=0;r<3;r++) for(let i=0;i<16;i++){ const x=((i*26+r*9-off*(1.1+r*.15)+Math.round(Math.sin(time*.25)*20))%(W+60)+W+60)%(W+60)-30, y=hy+2+r*5, st=beat?1:0; rect(ctx,x,y-9,4,9,'#241c22'); rect(ctx,x,y-12,4,3,'#4a4048'); rect(ctx,x-1+st,y,2,1,'#0a080a'); ctx.save(); ctx.translate(x+3,y-7); ctx.rotate(ang); rect(ctx,0,0,20,1,'#5a5058'); rect(ctx,19,-1,3,3,'#a8a2ac'); ctx.restore(); } };
SP_X.world.rook=function(S,F,sy){ for(const b of S.bal){ const sx=Math.round(b.x-camR.x), py=10*T-camR.y; if(sx>-80&&sx<W+80){ /* tower legs, the engine */ for(const dx of [-40,-12,16,40]) rect(ctx,sx+dx-(b.dir<0?4:0),py+4,3,sy-py-4,'#1e1814'); rect(ctx,sx-44,py+34,88,2,'#1e1814');
      const rdy=b.cd<=0, k=rdy?1:1-b.cd/A2.balCd; ctx.save(); ctx.translate(sx,py-8); if(b.dir<0) ctx.scale(-1,1); ctx.rotate(.38); rect(ctx,-12,-2,30,4,'#3a2a1c'); rect(ctx,-12,-2,30,1,'#5a4630'); ctx.strokeStyle='#6a5236'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(14,-12); ctx.quadraticCurveTo(14-k*7,0,14,12); ctx.stroke(); ctx.strokeStyle='#cfc6b2'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(14,-12); ctx.lineTo(14-k*12,0); ctx.lineTo(14,12); ctx.stroke(); if(rdy){ rect(ctx,-8,-1,30,2,'#cfc6b2'); rect(ctx,20,-2,4,4,'#8a8478'); } ctx.restore(); rect(ctx,sx-6,py-6,12,6,'#2a1e14');
      if(!rdy){ rect(ectx,sx-12,py-26,24,2,'rgba(20,10,8,.8)'); rect(ectx,sx-12,py-26,Math.round(24*k),2,'#c8a85a'); } else { ectx.fillStyle=`rgba(255,220,150,${(.3+.3*Math.sin(time*5)).toFixed(2)})`; ectx.fillRect(sx-1,py-30,2,2); } }
    const zx=Math.round(b.zone-camR.x); if(zx>-80&&zx<W+80){ const hot=b.cd<=0; ctx.fillStyle=hot?'rgba(236,230,214,.75)':'rgba(236,230,214,.3)'; for(let i=-A2.balR;i<A2.balR;i+=8) ctx.fillRect(zx+i,sy-1,5,1); ctx.fillRect(zx-A2.balR,sy-5,1,5); ctx.fillRect(zx+A2.balR-1,sy-5,1,5); for(let i=-5;i<=5;i++){ ctx.fillRect(zx+i,sy-7-Math.abs(i),1,1); } } } };
SP_X.back.gideon=function(S,F){ const cx=a2Par(.2), off=camR.x*.2, hy=F-30, e=enemies.find(b=>b.boss), p3=S.p3; /* the city, far below the span */ for(let i=0;i<70;i++){ const x=((i*37-off*.5)%(W+40)+W+40)%(W+40)-20, y=hy-6+((i*53)%34); if(Math.sin(time*1.5+i*2.3)>-.6){ ectx.fillStyle=i%5?'rgba(255,170,90,.5)':'rgba(255,90,50,.6)'; ectx.fillRect(Math.round(x),y,1,1); } }
  const g=ctx.createLinearGradient(0,hy-40,0,hy+30); g.addColorStop(0,'rgba(20,8,10,0)'); g.addColorStop(1,'rgba(8,4,6,.85)'); ctx.fillStyle=g; ctx.fillRect(0,hy-40,W,70);
  /* the palace gate */ const gx=cx+190; for(const d of [-1,1]){ const tx=gx+d*46; rect(ctx,tx-16,hy-210,32,230,'#0b0709'); rect(ctx,tx-16,hy-210,1,230,'#1e1418'); for(let k=0;k<4;k++) rect(ctx,tx-18+k*10,hy-218,6,8,'#0b0709'); for(let y=hy-190;y<hy-20;y+=34){ rect(ctx,tx-2,y,4,9,'#1a0e0c'); if(hsh(tx,y)>.4){ ectx.fillStyle=`rgba(255,150,70,${(.4+.2*Math.sin(time*7+y)).toFixed(2)})`; ectx.fillRect(tx-1,y+2,2,5); } } }
  rect(ctx,gx-30,hy-150,60,170,'#0b0709'); ctx.fillStyle='#050304'; ctx.beginPath(); ctx.moveTo(gx-20,hy+20); ctx.lineTo(gx-20,hy-70); ctx.quadraticCurveTo(gx,hy-104,gx+20,hy-70); ctx.lineTo(gx+20,hy+20); ctx.fill(); for(let i=0;i<5;i++) rect(ctx,gx-16+i*8,hy-84,2,104,'#1e1418');
  /* the balcony, and who is on it */ rect(ctx,gx-24,hy-128,48,3,'#1e1418'); for(let i=0;i<7;i++) rect(ctx,gx-22+i*7,hy-125,1,6,'#1e1418'); const sw=Math.round(Math.sin(time*1.2)*1); rect(ctx,gx-2,hy-141,5,13,'#12080a'); rect(ctx,gx-1,hy-146,3,5,'#c8a890'); rect(ctx,gx-2,hy-148,5,2,'#d8b24a'); rect(ctx,gx+3+sw,hy-139,3,10,'#5a0a0e'); ectx.fillStyle='rgba(216,178,74,.6)'; ectx.fillRect(gx-2,hy-148,5,1);
  /* the chains */ for(const [x0,y0,x1,y1,sag] of [[gx-46,hy-200,-40,hy-70,60],[gx-46,hy-170,-40,hy-20,50]]){ const s2=sag+Math.sin(time*.7+sag)*4; for(let k=0;k<=40;k++){ const q=k/40, x=lerp(x0,x1,q), y=lerp(y0,y1,q)+Math.sin(q*Math.PI)*s2; rect(ctx,Math.round(x),Math.round(y),3,2,k%2?'#1c1418':'#2c2026'); } }
  for(let i=0;i<14;i++){ const x=((i*71+time*(6+i%3))%(W+20)), y=hy+20-((time*(18+i*3)+i*40)%(hy+20)); ectx.fillStyle=p3?'rgba(255,150,60,.75)':'rgba(255,130,50,.4)'; ectx.fillRect(Math.round(x),Math.round(y),1,p3?2:1); } };
SP_X.world.gideon=function(S,F,sy){ for(let i=0;i<L.sections.length;i++){ const s=L.sections[i]; if(s.gone) continue; const x0=s[0]*T-camR.x, w=(s[1]-s[0]+1)*T; if(x0>W||x0+w<0) continue; rect(ctx,x0,sy-22,1,22,'#1a1216'); rect(ctx,x0+w-1,sy-22,1,22,'#1a1216'); rect(ctx,x0,sy-22,w,1,'#2a1e22'); rect(ctx,x0,sy-12,w,1,'#1a1216');
    const f=S.fuses.find(q=>q.i===i); if(f){ const k=1-f.t/f.dur; ectx.fillStyle='#ffe6a8'; ectx.fillRect(Math.round(x0+w*k)-1,sy-3,3,3); ectx.fillStyle='rgba(255,120,40,.6)'; ectx.fillRect(x0,sy-1,Math.round(w*k),1); addLight(s[0]*T+w*k,F-2,40,1,1,.6,.3); a2Txt(f.t.toFixed(1),x0+w/2,sy-30,'#ff7a4a',10); }
    else if(S.p3&&Math.sin(time*6+i*1.7)>.5){ ectx.fillStyle='#ff3a2a'; ectx.fillRect(Math.round(x0+w/2),sy+10,2,2); } } };
