'use strict';
/* ===== v50: the first three bosses as set pieces (BT, 17 Nov: "make the first few bosses way cooler, more epic … more
   targeted to the zone … think Gandalf and the Balrog") =====
   What they were: three fights in the same 36-tile room (one flat floor, the same three planks), against a boss the
   size of the hero, in front of a still backdrop. Each now has its own ground, something vast going on behind it,
   and two things only that place can do to you.
   Ser Odo, the Gallows Road · a road twice as long, through wheat that burns. The hunt rides the horizon with torches.
       Pass      he rides the whole road down. Strike him as he goes by (twice, or once heavy) and the dead horse
                 shies: a long opening.
       Torches   the riders behind throw fire into the field. Wheat carries it, and burns his hounds as well as you.
       Hook      (on foot) the gallows hook on its chain. Roll to tear free before the cut; if it misses he is open.
       Gibbet    (on foot) he cuts the hanged down on you.
       Last quarter: the field burns in from both ends.
   The Three Sisters, the Sisters' Pool · a wider fen. A sister who sinks stands up again behind the reeds, as tall
     as a steeple, and fights from there: the Eyeless throws knucklebones, the Mouthless screams over the reeds (get
     down), the Many-Fingered brings her hand down (and the hand stays a moment: cut it, the sisters share one life).
       The fen breathes: the water comes up over the floor (climb), then goes out again. Everything standing in it
       is Soaked, the sister included.
   The Lantern Preacher, Saint Edda's Ashes · inside what's left of the chapel, in the dark, under its bell.
       Sermon    he lifts the lantern. When it flares, everything it can see burns: get under a loft, behind the
                 bell, or far off.
       The bell  strike it (or toll your own) and the sermon stops, the congregation is off its knees and he is open.
                 At half life he burns the rope and it comes down.
       Last quarter: the roof comes down a beam at a time and the great window goes.
   All numbers are in SP. Hazards hurt the hero on this machine only (as every boss pattern does). */
const SP={ passTell:.95, passSp:440, unseat:2.4, strawSp:34, fireLife:4.5, hookR:210, hookSp:620, closeSp:24, closeHalf:15,
  giantCd:[9.5,11,10], floodEvery:17, floodHold:5.2, sermonT:1.9, sermonR:150, bellCd:9, beamEvery:2.7 };
const spTold={}; function spTell(k,t){ if(spTold[k]) return; spTold[k]=1; toast(t,2); }
const spBoss=()=>enemies.find(e=>e.boss&&!e.dead);
const spHost=()=>!(typeof COOP!=='undefined'&&COOP&&!NET.host);
function spHorn(v){ v=v||1; AU.tone('sawtooth',98,131,1.5,.16*v,.7); AU.tone('sawtooth',147,196,1.4,.1*v,.7,.08); AU.tone('sine',65,87,1.6,.25*v,.5); }

/* ---------- the ground ---------- */
function spArena(def,w,plats){ const h=18,g=newGrid(w,h,1); for(let y=0;y<=15;y++) for(let x=1;x<w-1;x++) g[y][x]=0; for(const [x,y,n] of plats) for(let i=0;i<n;i++) g[y][x+i]=2;
  return {w,h,g,spawns:[],chests:[],torches:[],fg:[{x:210,w:14},{x:w*T*1.3-260,w:18}],plats:[],pends:[],def,arena:true,surface:true,spawn:{x:3*T,y:16*T},exit:{x:w-5,y:16},rooms:[],
    env:def.env||ENV_OF[def.id]||'bone',jets:[],winds:[],nests:[],arenas:[],stones:[],decor:[]}; }
const SP_ARENA={
  odo(def){ const Lv=spArena(def,60,[[9,11,5],[27,10,6],[46,11,5]]); Lv.straw=[[15,25],[35,44]].map(([a,b])=>({x0:a*T,x1:b*T,a:null,b:null,next:0})); Lv.gal=[[9,11,5],[27,10,6],[46,11,5]]; return Lv; },
  sisters(def){ const Lv=spArena(def,52,[[6,12,5],[23,11,6],[41,12,5],[14,7,4],[34,7,4]]); for(const x0 of [9,24,39]) for(let x=x0;x<x0+4;x++){ Lv.g[16][x]=4; Lv.g[17][x]=1; } Lv.pools=[11*T,26*T,41*T]; return Lv; },
  preacher(def){ const Lv=spArena(def,52,[[4,11,7],[41,11,7]]); Lv.torches=[{x:5,y:9},{x:46,y:9}]; Lv.fg=[]; return Lv; } };
(function(){ const o=genArena; genArena=function(def){ return SP_ARENA[def.id]?SP_ARENA[def.id](def):o(def); }; })();

/* ---------- kits ---------- */
BOSSES.odo.kit=[['pass','hounds','torches','net','pass','lance'],['hook','duel','hounds','gibbet','leap','duel'],['hook','duel','gibbet','leap','duel','hounds']];
BOSSES.preacher.kit=[['oil','sermon','flock','volley','firewalk'],['sermon','oil','firewalk','flock','volley','firewalk'],['immolate','firewalk','sermon','oil','immolate']];
Object.assign(PHASE3_SUB,{odo:'He blows the horn. The field is burning in from both ends.',sisters:'One sister left in the water. Two behind the reeds.',preacher:'He lights himself, and the roof with him.'});
EDEF.fenhand={w:44,h:22,hp:99999,dmg:0,spd:0,xp:0,name:'The Many-Fingered Hand'};
EDEF.chapelbell={w:28,h:28,hp:99999,dmg:0,spd:0,xp:0,name:'Saint Edda\'s Bell'};
NO_RANK.add('fenhand'); NO_RANK.add('chapelbell');
const spProp=e=>e&&(e.type==='fenhand'||e.type==='chapelbell');

/* ---------- fire that burns both sides, and wheat that carries it ---------- */
function spFire(x,y,dmg,life){ life=life||SP.fireLife; foeFire(x,y,dmg,life);
  fx.push({t:0,dur:life,tk:0,upd(f,dt){ f.tk-=dt; if(f.tk>0) return; f.tk=.5; for(const o of enemies) if(!o.dead&&!o.boss&&!spProp(o)&&!o.fly&&Math.abs(o.x-x)<15&&Math.abs(o.y-y)<12){ setBurn(o,Math.max(3,dmg*.7)); } },draw(){}}); }
function spStraw(x){ const zs=L&&L.straw; if(!zs) return; for(const z of zs){ if(x<z.x0-4||x>z.x1+4||z.done) continue; if(z.a==null){ z.a=z.b=clamp(x,z.x0,z.x1); z.next=0; AU.noise(.5,500,1800,1,.25,'bandpass',.3); spTell('straw','The wheat is alight. It burns whatever stands in it: him, his hounds, you.'); } else { z.a=Math.min(z.a,Math.max(z.x0,x)); z.b=Math.max(z.b,Math.min(z.x1,x)); } } }
function spStrawTick(dt,dmg){ const zs=L.straw; if(!zs) return; const F=FLOOR(); for(const z of zs){ if(z.a==null||z.done) continue; z.a=Math.max(z.x0,z.a-SP.strawSp*dt); z.b=Math.min(z.x1,z.b+SP.strawSp*dt); z.next-=dt;
    if(z.next<=0){ z.next=.5; z.lit=1; if(z.a>z.x0) spFire(z.a,F,dmg,3.4); if(z.b<z.x1) spFire(z.b,F,dmg,3.4); z.lit=0; }
    if(z.a<=z.x0&&z.b>=z.x1) z.done=1; } }
(function(){ const o=addFlame; addFlame=function(x,y,pow,life,_w){ if(L&&L.straw&&Math.abs(y-FLOOR())<20) spStraw(x); return o(x,y,pow,life,_w); }; })();
(function(){ const o=foeFire; foeFire=function(x,y,dmg,life){ if(L&&L.straw&&Math.abs(y-FLOOR())<20&&!L.straw.some(z=>z.lit)) spStraw(x); return o(x,y,dmg,life); }; })();

/* ---------- things that fall out of the sky ---------- */
function spDrop(x,tell,o){ o=o||{}; const F=o.F==null?FLOOR():o.F; const w=o.w||11, fall=.4; teleRect(x-w,Math.max(0,F-230),w*2,Math.min(F,230),tell);
  fx.push({t:0,dur:tell+.9,haz:1,y:null,upd(f,dt){ if(f.t<tell-fall||f.land) return; if(f.y0==null) f.y0=camR.y-34; const k=clamp((f.t-(tell-fall))/fall,0,1); f.y=lerp(f.y0,F,k*k);
      if(!f.hit&&!P.dead&&Math.abs(P.x-x)<w+4&&P.y-P.h<f.y&&P.y>f.y-(o.h||22)){ f.hit=1; hurtPlayer(o.dmg,{x,hp:0,dead:true}); }
      if(k>=1){ f.land=1; f.lt=f.t; shake(o.shake||5); AU.slam(); dust(x,F,10); if(o.wave) shockwave(x,F,o.wave,[-1,1]); if(o.onLand) o.onLand(x,F); } },
    draw(f){ if(f.y==null) return; const sx=Math.round(x-camR.x), sy=Math.round(f.y-camR.y); if(f.land&&f.t-f.lt>.6) return; o.draw(sx,sy,f); }}); }
const dCage=(sx,sy,f)=>{ rect(ctx,sx-7,sy-20,14,20,'#1a1412'); for(let i=0;i<4;i++) rect(ctx,sx-6+i*4,sy-19,1,18,'#5a5054'); rect(ctx,sx-7,sy-20,14,1,'#6a6064'); rect(ctx,sx-7,sy-1,14,1,'#6a6064'); rect(ctx,sx-3,sy-14,5,5,'#d8cfb8'); rect(ctx,sx-2,sy-12,1,1,'#140c0c'); rect(ctx,sx+1,sy-12,1,1,'#140c0c'); rect(ctx,sx-2,sy-9,3,6,'#cfc6b2'); rect(ctx,sx,sy-28,1,8,'#6a5a3a'); };
const dBeam=(sx,sy,f)=>{ ctx.save(); ctx.translate(sx,sy-6); ctx.rotate(f.land?.12:Math.sin(f.t*9)*.5); rect(ctx,-22,-3,44,6,'#2a1a12'); rect(ctx,-22,-3,44,1,'#4a2e1e'); ctx.restore(); for(let i=0;i<5;i++){ ectx.fillStyle=i%2?'rgba(255,170,70,.85)':'rgba(255,90,30,.85)'; ectx.fillRect(sx-18+i*8,sy-12-Math.abs(Math.sin(time*12+i))*6,3,7); } };
const dBone=(sx,sy,f)=>{ ctx.save(); ctx.translate(sx,sy-9); ctx.rotate(f.land?.4:f.t*7); rect(ctx,-3,-10,6,20,'#d8cfb8'); rect(ctx,-6,-13,5,6,'#e6dfca'); rect(ctx,1,-13,5,6,'#e6dfca'); rect(ctx,-6,7,5,6,'#e6dfca'); rect(ctx,1,7,5,6,'#cfc6b2'); rect(ctx,-3,-10,1,20,'#f4eedc'); ctx.restore(); };

/* ---------- per-fight state ---------- */
const SP_INIT={
  odo(){ return {kind:'odo',hunt:rnd(0,40),close:null,barn:0}; },
  sisters(){ return {kind:'sisters',giants:[],flood:{st:0,k:0,t:6},busy:0,seen:0}; },
  preacher(){ const F=FLOOR(); const b=mkEnemyAt('chapelbell',26*T,F-48); b.intro=false; b.state='prop'; b.hang=1; b.pack=0; b.hp=b.maxhp=99999; b.name='Saint Edda\'s Bell'; enemies.push(b);
    U.uAmb.value.set(pal.amb[0]*.55,pal.amb[1]*.5,pal.amb[2]*.5); return {kind:'preacher',bell:b,cd:0,swing:0,beam:2,burn:0,glass:1,fallT:0}; } };
(function(){ const o=loadLevel; loadLevel=function(idx,opt){ const r=o(idx,opt); if(L){ L.sp=null; const d=L.def; if(d.kind==='boss'&&SP_INIT[d.id]&&L.w>40) L.sp=SP_INIT[d.id](); } return r; }; })();

/* ---------- patterns ---------- */
(function(){ const o=startPat2; startPat2=function(e,n,p){ const F=FLOOR();
  if(n==='pass'){ p.dir=Math.sign(P.x-e.x)||e.face; if(p.dir>0?(L.w-3)*T-e.x<170:e.x-3*T<170) p.dir=-p.dir; e.face=p.dir; p.x1=p.dir>0?(L.w-3)*T:3*T; p.struck=0; teleRect(Math.min(e.x,p.x1),F-30,Math.abs(p.x1-e.x),30,SP.passTell); spHorn(); AU.growl(); spTell('pass','He rides the whole road down. Jump it or roll through, and strike him as he passes.'); return; }
  if(n==='torches'){ const k=e.phase>1?5:4; p.k=k; const zs=(L.straw||[]).filter(z=>z.a==null); for(let i=0;i<k;i++){ let x=i===0?P.x:i===1&&zs.length?rnd(zs[0].x0+10,zs[0].x1-10):P.x+rnd(-170,170); spTorch(clamp(x,2*T,(L.w-2)*T),.95+i*.24,e); } spHorn(.6); return; }
  if(n==='hook'){ p.dir=Math.sign(P.x-e.x)||e.face; e.face=p.dir; p.len=0; teleRect(p.dir>0?e.x:e.x-SP.hookR,e.y-24,SP.hookR,7,.55); AU.chain(); return; }
  if(n==='gibbet'){ const k=e.phase>2?5:4; p.k=k; p.xs=[]; for(let i=0;i<k;i++) p.xs.push(clamp(i===0?P.x:i===1?P.x+(R()<.5?-1:1)*rnd(40,70):rnd(camR.x+20,camR.x+W-20),2*T,(L.w-2)*T)); AU.chain(); AU.growl(); spTell('gibbet','He cuts the hanged down. Watch the red columns.'); return; }
  if(n==='sermon'){ p.line=pick(['"He hears every prayer."','"Kneel, and be heard."','"There is a light for you too."']); caption(p.line,'聴け'); setTimeout(()=>caption(''),1500); AU.cast(); spTell('sermon','When he lifts the lantern, get out of its light: under a loft, behind the bell, or far away. Or ring the bell.'); return; }
  return o(e,n,p); }; })();
(function(){ const o=runPat2; runPat2=function(e,dt,p,n,t,F){
  if(n==='pass'){ if(t<SP.passTell){ e.vx=0; e.rear=1; return true; } e.rear=0; if(!p.go){ p.go=1; AU.roar(); shake(4); }
    e.x+=p.dir*SP.passSp*dt; if(R()<.7) dust(e.x-p.dir*12,F,2); if(R()<.3) sparks(e.x-p.dir*16,F-2,1,'#ffcf7a');
    if(!p.hit&&overlap({x:e.x-16,y:F-30,w:32,h:30},pBox())){ p.hit=1; hurtPlayer(e.dmg*1.3,e); }
    if(L.straw) for(const o2 of enemies) if(o2.type==='hound'&&!o2.dead&&Math.abs(o2.x-e.x)<200) o2.vx+=p.dir*200*dt;
    if(p.dir>0?e.x>=p.x1:e.x<=p.x1){ e.x=p.x1; e.face=-p.dir; shake(5); dust(e.x,F,12); endPat(e,1.1); } return true; }
  if(n==='torches'){ e.vx=0; if(t>=.95+p.k*.24+.5) endPat(e,1); return true; }
  if(n==='hook'){ e.vx=0; if(t>=.55&&!p.out){ p.out=1; AU.swing(true); }
    if(p.out&&!p.back){ p.len+=SP.hookSp*dt; const hx=e.x+p.dir*p.len; if(!P.dead&&P.dash<=0&&P.ghostT<=0&&!(P.inv>0)&&Math.abs(P.x-hx)<12&&P.y>e.y-42&&P.y-P.h<e.y-8){ p.got=1; p.back=1; p.cutT=t+1.05; hurtPlayer(e.dmg*.45,e); P.grabbed=1.2; AU.chain(); spTell('hook','Hooked. Roll to tear free before the cut.'); }
      else if(p.len>=SP.hookR){ p.back=1; p.tb=t; AU.clang(); sparks(hx,e.y-18,6,'#fff1c8'); } }
    if(p.got){ if(P.dash>0){ p.free=1; P.grabbed=0; } if(!p.free&&!P.dead){ const tx=e.x+p.dir*28; P.x=clamp(lerp(P.x,tx,Math.min(1,dt*5)),2*T,(L.w-2)*T); p.len=Math.abs(P.x-e.x); }
      if(t>=p.cutT-.3&&!p.tele){ p.tele=1; sparks(e.x+p.dir*10,e.y-28,5,'#fff2d0'); AU.ting(); }
      if(t>=p.cutT&&!p.cut){ p.cut=1; AU.swing(true); hazard(p.dir>0?e.x:e.x-48,e.y-36,48,36,.12,e.dmg*1.4,e); }
      if(t>=p.cutT+.45) endPat(e,1); }
    else if(p.back&&t>=p.tb+.8){ endPat(e,1); bossSetOpen(e,1.9,1); spTell('hookmiss','The hook is in the dirt. He is open while he drags it back.'); }
    return true; }
  if(n==='gibbet'){ e.vx=0; while(p.i<p.k&&t>=.3+p.i*.22){ spDrop(p.xs[p.i],.85,{dmg:e.dmg*1.1,wave:22,draw:dCage,onLand(x,y){ for(let k=0;k<6;k++) part({x,y:y-8,vx:rnd(-90,90),vy:rnd(-160,-40),g:600,life:rnd(.4,.8),col:pick(['#d8cfb8','#5a5054'])}); }}); p.i++; } if(t>=.3+p.k*.22+1.5) endPat(e,1.1); return true; }
  if(n==='sermon'){ e.vx=0; const S=L.sp; p.r=lerp(34,SP.sermonR,clamp(t/SP.sermonT,0,1));
    if(t>=SP.sermonT&&!p.done){ p.done=1; U.uWhite.value=Math.max(U.uWhite.value,.22); AU.boom(.5); AU.noise(.4,400,2400,1,.35,'bandpass',.4); shake(5); const lx=e.x+e.face*9, ly=e.y-26;
      if(!P.dead&&Math.hypot(P.x-lx,P.y-14-ly)<SP.sermonR&&!underCover()&&!spBehindBell(e)){ hurtPlayer(e.dmg*1.25,e); firePillar(P.x,F,e.dmg*.8); }
      for(let i=0;i<26;i++){ const a=i/26*6.283; part({x:lx,y:ly,vx:Math.cos(a)*190,vy:Math.sin(a)*190,g:0,life:.5,em:true,col:pick(['#ffe6a8','#ffb060'])}); } }
    if(t>=SP.sermonT+.7) endPat(e,1.1); return true; }
  return o(e,dt,p,n,t,F); }; })();
function spTorch(x,delay,e,Fy){ const F=Fy==null?FLOOR():Fy, x0=x+rnd(-140,140), y0=F-54, dmg=e.dmg*.32; teleRect(x-12,F-5,24,5,delay);
  fx.push({t:0,dur:delay+.1,haz:1,upd(f){ if(f.t>=delay&&!f.l){ f.l=1; AU.noise(.3,1800,500,2,.3,'bandpass',.3); spFire(x,F,dmg); spFire(x-14,F,dmg,3.6); spFire(x+14,F,dmg,3.6); } },
    draw(f){ const k=clamp(f.t/delay,0,1); if(k>=1) return; const wx=lerp(x0,x,k), wy=lerp(y0,F,k)-Math.sin(k*Math.PI)*(80+k*20), s=1+Math.round(k*2); const sx=Math.round(wx-camR.x), sy=Math.round(wy-camR.y);
      rect(ctx,sx-1,sy,s,s+2,'#3a2a1c'); ectx.fillStyle='#ffd27a'; ectx.fillRect(sx-1,sy-s,s,s); ectx.fillStyle='rgba(255,120,40,.7)'; ectx.fillRect(sx-s,sy-s-1,s*2,s); addLight(wx,wy,24+k*30,.7,1,.6,.25); if(R()<.5) part({x:wx,y:wy,vx:rnd(-8,8),vy:rnd(-10,10),g:-10,life:.35,em:true,col:'#ff9a3c'}); }}); }
function spBehindBell(e){ const S=L.sp, b=S&&S.bell; if(!b||b.hang) return false; return Math.abs(P.x-b.x)<46&&Math.sign(b.x-e.x)===Math.sign(P.x-b.x)&&Math.abs(P.x-e.x)>Math.abs(b.x-e.x); }

/* ---------- Odo: struck in the pass, the dead horse shies ---------- */
function spUnseat(e){ e.pat=null; e.rear=0; e.shyT=time+SP.unseat; e.cd=SP.unseat; e.vx=0; bossSetOpen(e,SP.unseat); AU.roar(); AU.clang(); shake(8); impactT=.1; bossSlow=Math.max(bossSlow,.35); sparks(e.x,e.y-24,18,'#fff1c8'); dust(e.x,FLOOR(),16);
  showBossName('隙','OPENING','The dead horse shies. Strike.'); spTell('unseat','That is how you stop a charge: meet it.'); }
(function(){ const o=dmgEnemy; dmgEnemy=function(e,d,crit,dir,kb,heavy,launch,stun){
  if(e&&e.boss&&!e.dead&&e.kind==='odo'&&e.mounted&&e.pat&&e.pat.name==='pass'&&e.pat.go){ e.pat.struck++; if(heavy||crit||e.pat.struck>=2) spUnseat(e); }
  if(e&&e.type==='fenhand'){ const b=spBoss(); e.flash=.1; if(b&&!b.intro){ bossSetOpen(b,.25,1); sparks(e.x,e.y-12,3,'#a9b46c'); return o(b,d,crit,dir,0,heavy,0,0); } return; }
  if(e&&e.type==='chapelbell'){ spToll(e,heavy); return; }
  return o(e,d,crit,dir,kb,heavy,launch,stun); }; })();
(function(){ const o=updEnemy; updEnemy=function(e,dt){ if(!spProp(e)) return o(e,dt); e.flash-=dt; e.anim+=dt; e.vx=e.vy=0; e.stun=0; e.sts=null;
  if(e.type==='fenhand'){ e.life-=dt; if(e.life<=0&&!e.dead){ e.dead=true; e.deadT=9; for(let i=0;i<12;i++) part({x:e.x+rnd(-18,18),y:e.y-rnd(0,18),vx:rnd(-30,30),vy:rnd(-80,-20),g:300,life:.6,col:'#2a3a2a'}); } }
  }; })();
(function(){ const o=killEnemy; killEnemy=function(e,dir,crit){ if(spProp(e)){ e.hp=e.maxhp; return; } return o(e,dir,crit); }; })();
(function(){ const o=bossPhase3; bossPhase3=function(e){ o(e); const S=L.sp; if(!S) return; const F=FLOOR();
  if(S.kind==='odo'){ const c=clamp(e.x,(SP.closeHalf+2)*T,(L.w-SP.closeHalf-2)*T); S.close={l:T,r:(L.w-1)*T,tl:c-SP.closeHalf*T,tr:c+SP.closeHalf*T,tk:0}; S.barn=.001; spHorn(1.2); for(const z of L.straw||[]) if(z.a==null){ z.a=z.b=(z.x0+z.x1)/2; } spTell('close','The field is burning in from both ends. Stay inside the fire.'); }
  if(S.kind==='preacher'){ S.burn=1; S.beam=1.2; if(S.glass){ S.glass=0; S.shat=time; U.uWhite.value=.5; AU.boom(1); AU.noise(.8,6000,1500,2,.4,'highpass',.5); shake(12); for(let i=0;i<40;i++) part({x:camR.x+W/2+rnd(-30,30),y:F-rnd(90,190),vx:rnd(-160,160),vy:rnd(-60,120),g:500,life:rnd(.6,1.4),em:true,col:pick(['#c03a2a','#3a6ac0','#d8b24a','#e8e0d0'])}); } }
  }; })();
/* the preacher burns the bell rope at half; the sisters' giants */
(function(){ const o=bossPhase; bossPhase=function(e){ o(e); const S=L.sp; if(S&&S.kind==='preacher'&&S.bell&&S.bell.hang&&!S.fallT){ S.fallT=1.7; teleRect(S.bell.x-34,0,68,FLOOR(),1.7); caption('He puts the lantern to the bell rope.','鐘が落ちる'); setTimeout(()=>caption(''),1800); } }; })();

/* ---------- the bell ---------- */
function spToll(b,heavy){ const S=L.sp; if(!S||S.kind!=='preacher') return; b.flash=.12; if(S.cd>0){ AU.clang(); return; } S.cd=SP.bellCd; S.swing=1.6; AU.bell(); AU.toll&&AU.toll(); if(typeof SMP!=='undefined') SMP.play('bell_dissonant',{v:.7,wet:.5}); shake(7); impactT=.08;
  fx.push({t:0,dur:.9,draw(f){ const k=f.t/f.dur; ectx.strokeStyle=`rgba(255,230,170,${((1-k)*.7).toFixed(2)})`; ectx.lineWidth=2; ectx.beginPath(); ectx.ellipse(b.x-camR.x,b.y-14-camR.y,k*230,k*120,0,0,7); ectx.stroke(); }});
  let n=0; for(const m of enemies){ if(m.dead||m.boss||spProp(m)) continue; if(m.flockOf){ m.flockOf=null; m.kneel=0; n++; } m.stun=Math.max(m.stun||0,2.4); }
  const e=spBoss(); if(e&&!e.intro&&e.kind==='preacher'){ const ser=e.pat&&e.pat.name==='sermon'&&!e.pat.done; if(ser){ e.pat=null; e.cd=2.2; } bossSetOpen(e,ser?2.4:1.3); if(ser) showBossName('隙','OPENING','The bell drowns the sermon.'); }
  spTell('bell',n?'The bell. The congregation is off its knees and he is bare.':'The bell stops him talking. Strike while it rings.'); }
(function(){ const o=typeof bellCast==='function'?bellCast:null; if(!o) return; bellCast=function(bx,by){ const S=L&&L.sp, b=S&&S.bell; if(b&&Math.hypot(b.x-bx,b.y-by)<230){ S.cd=0; spToll(b,true); } return o(bx,by); }; })();
function dBell(c,e){ const S=L&&L.sp, sw=S?Math.sin(time*7)*S.swing*.16:0; c.save(); c.translate(0,-28); c.rotate(sw); c.fillStyle='#6a5226'; c.beginPath(); c.moveTo(-5,0); c.lineTo(5,0); c.lineTo(9,10); c.lineTo(12,22); c.lineTo(14,28); c.lineTo(-14,28); c.lineTo(-12,22); c.lineTo(-9,10); c.fill();
  rect(c,-13,25,26,3,'#8a6c30'); rect(c,-8,8,16,1,'#8a6c30'); rect(c,-6,2,2,22,'#a88a44'); rect(c,-3,-3,6,4,'#3a2a1c'); rect(c,-1,26,3,5,'#2a1e14'); rect(c,4,12,3,10,'#4a3a1c'); c.restore(); }
EDRAW.chapelbell=dBell;
EDRAW.fenhand=function(c,e){ const k=clamp(e.life>.4?1:e.life/.4,0,1); c.fillStyle='#1e2a1c'; c.beginPath(); c.moveTo(-18,0); c.lineTo(-20,-10*k); c.lineTo(-6,-16*k); c.lineTo(14,-14*k); c.lineTo(20,-6*k); c.lineTo(18,0); c.fill();
  for(let i=0;i<7;i++){ const x=-20+i*6.5, l=10+((i*5)%7); rect(c,x,-2,3,3,'#a9b46c'); rect(c,x+(i%2?2:-2),0,3,2,'#a9b46c'); rect(c,x,-6*k-l*.2,3,6,'#8a9658'); } rect(c,-14,-12*k,24,1,'#3a4a30'); };

/* ---------- the tick ---------- */
(function(){ const o=update; update=function(dt){ o(dt); const S=L&&L.sp; if(!S||mode!=='play') return; const e=enemies.find(b=>b.boss), F=FLOOR(); if(!e) return; const live=!e.dead&&!e.intro;
  if(S.kind==='odo'){ S.hunt+=dt; spStrawTick(dt,e.dmg*.3); if(S.barn) S.barn=Math.min(1,S.barn+dt*.25);
    const c=S.close; if(c&&!e.dead){ c.l=Math.min(c.tl,c.l+SP.closeSp*dt); c.r=Math.max(c.tr,c.r-SP.closeSp*dt); c.tk-=dt; if(c.tk<=0){ c.tk=.5; if(!P.dead&&(P.x<c.l+6||P.x>c.r-6)) hurtPlayer(e.dmg*.5,{x:P.x<c.l+6?c.l-20:c.r+20,hp:0,dead:true}); for(const m of enemies) if(!m.dead&&!m.boss&&(m.x<c.l||m.x>c.r)) setBurn(m,e.dmg*.4); }
      e.x=clamp(e.x,c.l+14,c.r-14); } if(e.dead) S.close=null; }
  else if(S.kind==='sisters'&&live){ spSisters(S,e,dt,F); }
  else if(S.kind==='preacher'){ S.cd-=dt; S.swing=Math.max(0,S.swing-dt); const b=S.bell; if(typeof RG!=='undefined'){ RG.storm=0; RG.stormT=20; }
    if(S.fallT>0&&b.hang){ S.fallT-=dt; if(R()<.5) part({x:b.x+rnd(-1,1),y:b.y-40-rnd(0,40),vx:rnd(-10,10),vy:rnd(-30,0),g:-20,life:.5,em:true,col:'#ff9a3c'});
      if(S.fallT<=0){ b.hang=0; b.vyF=0; } }
    if(!b.hang&&b.y<F){ b.vyF=(b.vyF||0)+1700*dt; b.y=Math.min(F,b.y+b.vyF*dt); if(b.y>=F){ AU.boom(1.2); AU.slam(); shake(14); impactT=.14; shockwave(b.x,F,64,[-1,1]); dust(b.x,F,30); if(!P.dead&&Math.abs(P.x-b.x)<36&&P.y>F-60) hurtPlayer(e.dmg*1.5,{x:b.x,hp:0,dead:true}); S.cd=0; spToll(b,true); } }
    if(S.burn&&live){ S.beam-=dt; if(S.beam<=0){ S.beam=SP.beamEvery; const x=clamp(P.x+rnd(-50,50),2*T,(L.w-2)*T); spDrop(x,1,{w:20,h:14,dmg:e.dmg,shake:6,draw:dBeam,onLand(x,y){ spFire(x-12,y,e.dmg*.3,3.6); spFire(x+12,y,e.dmg*.3,3.6); }}); } } } }; })();

/* ---------- the Sisters: the fen breathes, and the drowned stand up ---------- */
function spSisters(S,e,dt,F){ const dead=e.sis.filter(s=>!s.alive);
  for(const s of dead) if(!s.giant){ s.giant=1; const i=e.sis.indexOf(s); S.giants.push({i,t:0,cd:4.5+S.giants.length*2,ax:[.24,.5,.76][i]}); S.flood.t=Math.min(S.flood.t,1.2); shake(10); AU.roar(); AU.tone('sine',44,30,2.4,.5,.5); bossSlow=Math.max(bossSlow,.9);
    setTimeout(()=>{ if(L&&L.sp===S){ caption('She stands up again behind the reeds. She was never small.','立ち上がる'); setTimeout(()=>caption(''),3200); } },1500); }
  S.busy-=dt; const fl=S.flood; fl.t-=dt;
  if(fl.st===0&&fl.t<=0&&S.busy<=0){ fl.st=1; fl.t=1.7; teleRect(T,F-12,(L.w-2)*T,12,1.7); AU.noise(1.6,200,700,1,.3,'lowpass',.4); caption('The fen breathes in.','水が来る'); setTimeout(()=>caption(''),1600); spTell('flood','The water is coming up. Climb. Whatever stands in it is Soaked, the sisters too.'); }
  else if(fl.st===1){ fl.k=1-fl.t/1.7; if(fl.t<=0){ fl.st=2; fl.t=SP.floodHold; fl.grab=1; } }
  else if(fl.st===2){ fl.k=1; if(fl.t<=0){ fl.st=3; fl.t=1.2; } }
  else if(fl.st===3){ fl.k=fl.t/1.2; if(fl.t<=0){ fl.st=0; fl.k=0; fl.t=SP.floodEvery*(e.phase>2?.75:1); } }
  if(fl.k>.6){ fl.sk=(fl.sk||0)-dt; if(fl.sk<=0){ fl.sk=1; for(const m of enemies) if(!m.dead&&!spProp(m)&&!m.fly&&m.y>F-10){ stOf(m).soak={t:1.6}; } }
    if(!P.dead&&P.y>F-8){ P.wet=true; fl.grab-=dt; if(fl.grab<=0&&P.dash<=0){ fl.grab=1.5; const x=P.x; teleRect(x-9,F-10,18,10,.5);
        setTimeout(()=>{ if(mode!=='play'||!L||L.sp!==S||e.dead) return; AU.noise(.25,200,900,2,.3,'bandpass',.3); hazard(x-9,F-44,18,44,.3,e.dmg*.7,{x},f=>{ const k=Math.min(1,f.t/.08)*(1-Math.max(0,(f.t-.2)/.1)), hgt=44*k, sx=Math.round(x-camR.x), sy=F-camR.y; rect(ctx,sx-3,Math.round(sy-hgt),6,Math.round(hgt),'#2a3a2a'); for(let i=0;i<4;i++) rect(ctx,sx-5+i*3,Math.round(sy-hgt-3),2,4,'#a9b46c'); }); },500); } } }
  for(const g of S.giants){ g.t+=dt; if(g.t<3.2) continue; g.cd-=dt; if(g.cd>0||S.busy>0||P.dead) continue; g.cd=SP.giantCd[g.i]*(e.phase>2?.8:1); g.act=time; const dmg=e.dmg;
    if(g.i===0){ S.busy=1.2; for(let k=0;k<3;k++){ const x=clamp(P.x+(k-1)*rnd(54,80)+(k===1?0:rnd(-10,10)),2*T,(L.w-2)*T); setTimeout(()=>{ if(mode==='play'&&L&&L.sp===S&&!e.dead) spDrop(x,1.15,{w:16,h:26,dmg:dmg*1.05,shake:8,wave:30,draw:dBone}); },k*260); } AU.noise(.5,300,90,1,.3,'lowpass',.3); spTell('g0','The Eyeless throws the bones. Red columns: move.'); }
    else if(g.i===1){ if(fl.st!==0){ g.cd=1.5; continue; } S.busy=2.4; fl.t=Math.max(fl.t,3.2); const y0=F-150, hh=118; teleRect(T,y0,(L.w-2)*T,hh,1.25); AU.bossScream&&AU.bossScream('minor',{pitch:.6}); spTell('g1','The Mouthless screams over the reeds. Get down off the boards.');
      fx.push({t:0,dur:1.75,haz:1,upd(f){ if(f.t>=1.25&&!f.h){ f.h=1; shake(9); U.uWhite.value=Math.max(U.uWhite.value,.12); AU.scream(); if(!P.dead&&P.y-P.h<y0+hh&&P.y>y0){ hurtPlayer(dmg*1.1,{x:P.x-(g.ax<.5?1:-1)*30,hp:0,dead:true}); P.vy=Math.max(P.vy,260); } } },
        draw(f){ if(f.t<1.25) return; const k=(f.t-1.25)/.5; for(let i=0;i<9;i++){ const yy=y0+8+i*12-camR.y, off=((time*900+i*70)%(W+80))-40; ectx.fillStyle=`rgba(230,240,225,${((1-k)*.55).toFixed(2)})`; ectx.fillRect(g.ax<.5?off:W-off,yy,60,1); ectx.fillRect(g.ax<.5?off-90:W-off+90,yy+5,34,1); } }}); }
    else { S.busy=1.6; const x=clamp(P.x,3*T,(L.w-3)*T); AU.growl(); spTell('g2','The Many-Fingered brings her hand down. When it lands, cut it: they share one life.'); spHandSlam(x,F,dmg*1.35,1); } } }
/* a hand the size of a cart comes down out of the sky (the Sisters' Pool, and the fen itself) */
function spHandSlam(x,F,dmg,leave){ const lv=L; teleRect(x-30,F-5,60,5,1.3);
  fx.push({t:0,dur:1.6,haz:1,upd(f){ if(f.t>=1.3&&!f.h){ f.h=1; shake(11); AU.slam(); AU.boom(.7); shockwave(x,F,44,[-1,1]); if(!P.dead&&Math.abs(P.x-x)<32&&P.y>F-64&&P.y<F+8) hurtPlayer(dmg,{x,hp:0,dead:true});
        if(leave&&spHost()&&L===lv){ const h=mkEnemyAt('fenhand',x,F); h.intro=false; h.state='prop'; h.life=3.4; h.hp=h.maxhp=99999; h.champ=false; h.name='The Many-Fingered Hand'; enemies.push(h); } } },
    draw(f){ const sx=Math.round(x-camR.x), sy=F-camR.y; if(f.t<1.3){ const k=f.t/1.3; ctx.fillStyle=`rgba(4,8,6,${(.2+k*.45).toFixed(2)})`; ctx.beginPath(); ctx.ellipse(sx,sy-1,10+k*24,2+k*3,0,0,7); ctx.fill(); if(k>.72){ const kk=(k-.72)/.28, top=lerp(-60,sy-70,kk*kk); rect(ctx,sx-12,0,24,Math.max(0,Math.round(top)),'#1e2a1c'); rect(ctx,sx-22,Math.round(top),44,16,'#1e2a1c'); for(let i=0;i<7;i++) rect(ctx,sx-21+i*6,Math.round(top)+16,3,10+((i*5)%7),'#a9b46c'); } }
      else { const k=(f.t-1.3)/.3; rect(ctx,sx-12,0,24,Math.max(0,sy-14),`rgba(30,42,28,${(1-k).toFixed(2)})`); } }}); }

/* ---------- intros ---------- */
(function(){ const o=bossIntro; bossIntro=function(e){ const r=o(e); const S=L&&L.sp; if(!S) return r; const long=cut&&cut.steps&&cut.steps.length>1, D=long?4.6:1.5;
  if(S.kind==='odo'){ const home=e.x; e.x=Math.min((L.w-2)*T,home+210); spHorn(1.1); if(long) setTimeout(()=>spHorn(.8),1700);
    fx.push({t:0,dur:D,upd(f){ const k=clamp((f.t-(long?1.6:.1))/(long?2.2:1.2),0,1), ee=1-(1-k)*(1-k); e.x=lerp(Math.min((L.w-2)*T,home+210),home,ee); e.face=-1; e.anim+=1/60; e.rear=k>=1&&f.t<D-.4?1:0; if(k>0&&k<1&&R()<.6) dust(e.x+14,FLOOR(),2); if(f.t>=D-.05) e.rear=0; },draw(){}}); }
  if(S.kind==='preacher'){ L.dark=1; AU.bell(); if(long) setTimeout(()=>AU.bell(),2400); }
  if(S.kind==='sisters'){ AU.tone('sine',52,38,3,.4,.5); }
  return r; }; })();

/* ---------- drawing: behind everything (the far plane) ---------- */
const spPx=(x,par)=>Math.round(x-camR.x*par);
function spBack(){ const S=L&&L.sp; if(!S) return; const F=FLOOR()-camR.y;
  if(S.kind==='odo'){ /* the hunt on the ridge: a column of riders with torches, and the farm going up */
    const hy=F-49, e=enemies.find(b=>b.boss), ph=e?e.phase:1; const span=W+520, base=((S.hunt*13)%span);
    for(let i=0;i<16;i++){ const x=Math.round(((base+i*31)%span)-260-camR.x*.12*0+Math.sin(i*7)*4), y=hy+Math.round(Math.sin(i*3.1)*2), g=Math.sin(time*11+i)>0?1:0; if(x<-12||x>W+12) continue;
      rect(ctx,x-4,y-5,8,3,'#0b0607'); rect(ctx,x+3,y-7,3,3,'#0b0607'); rect(ctx,x-3,y-2,1,2+g,'#0b0607'); rect(ctx,x+2,y-2,1,3-g,'#0b0607'); rect(ctx,x-1,y-9,2,4,'#0b0607');
      if(i%2===0){ ectx.fillStyle='#ffb050'; ectx.fillRect(x+1,y-13,1,2); ectx.fillStyle='rgba(255,120,40,.5)'; ectx.fillRect(x,y-14,3,3); } }
    if(S.barn>0){ const k=S.barn, bx=spPx(L.w*T*.5,.1)-W*.05+40; for(let i=0;i<26;i++){ const x=bx-40+i*4+Math.sin(i*9)*3, h=(10+Math.abs(Math.sin(time*5+i*1.7))*34)*k; ctx.fillStyle=i%3?`rgba(255,110,40,${(.85*k).toFixed(2)})`:`rgba(255,210,120,${(.9*k).toFixed(2)})`; ctx.fillRect(Math.round(x),Math.round(hy-8-h),3,Math.round(h)); if(i%5===0){ ectx.fillStyle=`rgba(255,140,60,${(.35*k).toFixed(2)})`; ectx.fillRect(Math.round(x),Math.round(hy-8-h*.6),3,Math.round(h*.6)); } }
      const gg=ctx.createLinearGradient(0,hy-120,0,hy); gg.addColorStop(0,'rgba(255,90,30,0)'); gg.addColorStop(1,`rgba(255,110,40,${(.28*k).toFixed(2)})`); ctx.fillStyle=gg; ctx.fillRect(0,hy-120,W,120); }
    if(ph>2||S.close){ for(let i=0;i<W;i+=3){ const h=2+hsh(i,3)*5+Math.abs(Math.sin(time*5+i*.9))*(4+hsh(i,9)*9); ctx.fillStyle=hsh(i,5)>.6?'rgba(255,200,110,.85)':'rgba(230,90,36,.85)'; ctx.fillRect(i,Math.round(hy+3-h),3,Math.round(h)); } } }
  else if(S.kind==='sisters'){ for(const g of S.giants) spGiant(g,F); }
  else if(S.kind==='preacher'){ spChapel(S,F); } }
function spGiant(g,F){ const rise=clamp(g.t/3,0,1), ee=1-(1-rise)*(1-rise); const cx=Math.round(g.ax*W+(W/2-(camR.x+W/2-L.w*T/2)*.22-W/2)), hgt=168, top=Math.round(F-20-hgt*ee+Math.sin(time*.7+g.i)*2);
  const act=g.act?clamp((time-g.act)/1.6,0,1):1, lean=g.act&&act<1?Math.sin(act*Math.PI):0; const col='#0d1410', col2='#16201a', pale='#a9b46c';
  ctx.save(); ctx.globalAlpha=.92; ctx.fillStyle=col; ctx.beginPath(); ctx.moveTo(cx-46,F+10); ctx.lineTo(cx-38,top+70); ctx.lineTo(cx-24,top+30); ctx.lineTo(cx-14,top+6); ctx.lineTo(cx,top); ctx.lineTo(cx+14,top+6); ctx.lineTo(cx+24,top+30); ctx.lineTo(cx+38,top+70); ctx.lineTo(cx+46,F+10); ctx.fill();
  ctx.fillStyle=col2; ctx.beginPath(); ctx.moveTo(cx-12,top+14); ctx.lineTo(cx+12,top+14); ctx.lineTo(cx+10,top+40); ctx.lineTo(cx,top+46); ctx.lineTo(cx-10,top+40); ctx.fill();
  /* hair like weed */ for(let i=0;i<9;i++){ const x=cx-20+i*5, l=40+((i*13)%30)+Math.sin(time*1.1+i)*3; rect(ctx,x,top+12,2,Math.round(l),col); }
  ctx.globalAlpha=1;
  if(g.i===0){ rect(ctx,cx-9,top+22,18,4,'#3a4630'); rect(ctx,cx-9,top+23,18,1,'#5a6a44'); rect(ctx,cx-4,top+36,8,2,'#1a0e0e'); }
  else if(g.i===1){ const o=lean; rect(ctx,cx-7,top+23,3,3,pale); rect(ctx,cx+4,top+23,3,3,pale); if(o>0){ ctx.fillStyle='#000'; ctx.beginPath(); ctx.ellipse(cx,top+36,4+o*3,2+o*9,0,0,7); ctx.fill(); ectx.fillStyle=`rgba(230,240,225,${(o*.5).toFixed(2)})`; ectx.fillRect(cx-7,top+23,3,3); ectx.fillRect(cx+4,top+23,3,3); } }
  else { rect(ctx,cx-7,top+24,3,2,pale); rect(ctx,cx+4,top+24,3,2,pale); rect(ctx,cx-3,top+36,6,1,'#2a1210'); }
  /* arms */ const up=g.i===2?.35+lean*.65:lean*.5; for(const d of [-1,1]){ const sx0=cx+d*30, sy0=top+62, hx=sx0+d*(18+up*10), hy=sy0+40-up*96; ctx.strokeStyle=col; ctx.lineWidth=9; ctx.beginPath(); ctx.moveTo(sx0,sy0); ctx.lineTo(hx,hy); ctx.stroke();
    const nf=g.i===2?7:4; for(let k=0;k<nf;k++){ const a=-1.57+(k-(nf-1)/2)*.22*d+d*.2; ctx.strokeStyle=pale; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(hx,hy); ctx.lineTo(hx+Math.cos(a)*(12+((k*5)%6))*(g.i===2?1.6:1),hy+Math.sin(a)*(12+((k*5)%6))*(g.i===2?1.6:1)); ctx.stroke(); } }
  ctx.restore();
  /* mist at her waist */ for(let i=0;i<5;i++){ ctx.fillStyle='rgba(120,150,130,.10)'; ctx.fillRect(cx-70+i*12+Math.round(Math.sin(time*.4+i)*8),F-34+i*3,90,5); } }
function spChapel(S,F){ const off=(camR.x+W/2-L.w*T/2)*.3, cx=Math.round(W/2-off), burn=S.burn, sky=burn?'#b8501e':'#6e5240', sky2=burn?'#e8903a':'#8a6a50';
  ctx.fillStyle='#0f0b0b'; ctx.fillRect(0,0,W,F+20); /* the wall: courses of stone */
  for(let y=6;y<F;y+=11){ ctx.fillStyle='rgba(255,230,200,.035)'; ctx.fillRect(0,y,W,1); for(let x=-((off|0)%34)-34+((y/11|0)%2)*17;x<W;x+=34){ ctx.fillStyle='rgba(0,0,0,.35)'; ctx.fillRect(Math.round(x),y+1,1,10); } }
  /* the roof is half gone */ ctx.fillStyle=sky; ctx.beginPath(); ctx.moveTo(cx-150,0); ctx.lineTo(cx-128,14); ctx.lineTo(cx-96,8); ctx.lineTo(cx-70,22); ctx.lineTo(cx-30,10); ctx.lineTo(cx+10,26); ctx.lineTo(cx+60,12); ctx.lineTo(cx+96,20); ctx.lineTo(cx+140,6); ctx.lineTo(cx+160,0); ctx.fill();
  for(let i=0;i<5;i++){ const bx=cx-130+i*62; ctx.save(); ctx.translate(bx,2); ctx.rotate(.5-i*.22); rect(ctx,-3,0,6,46,'#070505'); ctx.restore(); }
  const lancet=(x,y,w,h,glass)=>{ ctx.fillStyle=sky; ctx.fillRect(x,y+w/2,w,h-w/2); ctx.beginPath(); ctx.arc(x+w/2,y+w/2,w/2,Math.PI,0); ctx.fill(); ctx.fillStyle=sky2; ctx.fillRect(x,y+h-Math.round(h*.3),w,Math.round(h*.3));
    if(burn){ for(let i=0;i<w;i+=3){ const hh=(h*.25+Math.abs(Math.sin(time*5+i*1.3+x))*h*.5); ctx.fillStyle=i%2?'#ffb04a':'#ff7a2a'; ctx.fillRect(x+i,Math.round(y+h-hh),3,Math.round(hh)); } ectx.fillStyle='rgba(255,140,50,.07)'; ectx.fillRect(x,y+Math.round(h*.4),w,Math.round(h*.6)); } };
  for(const d of [-1,1]) for(let k=1;k<=3;k++) lancet(cx+d*(k*78)-6,F-150,12,54);
  /* the east window */ const ww=60, wh=132, wx=cx-30, wy=F-178;
  if(S.glass){ rect(ctx,wx,wy,ww,wh,'#140c0c'); const cols=[[150,34,28],[40,66,130],[160,120,34],[32,92,62],[104,34,88]];
    for(let y=0;y<wh;y+=6) for(let x=0;x<ww;x+=6){ if(y<26&&Math.hypot(x+3-ww/2,y-30)>31) continue; const c=cols[Math.floor(hsh(x,y)*cols.length)], k=.75+.25*Math.sin(time*.8+x*.3+y*.2); ctx.fillStyle=`rgb(${c[0]>>1},${c[1]>>1},${c[2]>>1})`; ctx.fillRect(wx+x,wy+y,5,5); ectx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${(.3*k).toFixed(2)})`; ectx.fillRect(wx+x,wy+y,5,5); }
    /* the saint in the glass, holding a lantern: leaded dark against the colour */ rect(ectx,cx-7,wy+44,14,52,'#000'); rect(ectx,cx-5,wy+32,10,12,'#000'); rect(ctx,cx-7,wy+44,14,52,'#1a1012'); rect(ctx,cx-5,wy+32,10,12,'#1a1012'); rect(ctx,cx-9,wy+50,3,22,'#1a1012'); ectx.fillStyle='rgba(255,205,110,.9)'; ectx.fillRect(cx+9,wy+58,4,6); }
  else { lancet(wx,wy,ww,wh); const g=ctx.createLinearGradient(0,wy,0,wy+wh); g.addColorStop(0,'rgba(90,20,16,.6)'); g.addColorStop(1,'rgba(224,106,42,0)'); ctx.fillStyle=g; ctx.fillRect(wx,wy+30,ww,wh-30);
    for(let i=0;i<5;i++) rect(ctx,wx+4+i*12+((i*7)%5),wy+((i*37)%50),3,8+((i*11)%9),'#140c0c'); }
  rect(ctx,cx-1,wy+8,2,wh-8,'#0c0808'); rect(ctx,wx,wy+48,ww,2,'#0c0808'); rect(ctx,wx,wy+92,ww,2,'#0c0808');
  /* piers */ for(const d of [-1,1]) for(let k=0;k<=3;k++){ const px=cx+d*(39+k*78); rect(ctx,px-6,0,12,F+20,'#191212'); rect(ctx,px-6,0,1,F+20,'#2c2020'); rect(ctx,px+5,0,1,F+20,'#060404'); rect(ctx,px-9,F-160,18,4,'#231a18');
      if(burn){ for(let i=0;i<3;i++){ const h=4+Math.abs(Math.sin(time*7+i*2+px))*8; ctx.fillStyle=i%2?'#ffb04a':'#e8662a'; ctx.fillRect(px-7+i*5,Math.round(F-160-h),3,Math.round(h)); } } }
  /* the rope the bell hangs from */ const b=S.bell; if(b&&b.hang){ const bx=Math.round(b.x-camR.x); rect(ctx,bx,0,1,Math.max(0,Math.round(b.y-28-camR.y)),S.fallT>0?'#ff9a3c':'#6a5a3a'); } }

/* ---------- drawing: in the world, behind the fighters ---------- */
function spWorld(){ const S=L&&L.sp; if(!S) return; const F=FLOOR(), sy=F-camR.y;
  if(S.kind==='odo'){ /* gallows posts under the beams, the hanged, and the wheat */
    for(const [x,y,n] of L.gal||[]){ const px=Math.round((x+n-1)*T+6-camR.x), py=y*T-camR.y; if(px<-80||px>W+80) continue; rect(ctx,px,py,4,sy-py,'#1c1412'); rect(ctx,px,py,1,sy-py,'#3a2a22'); ctx.strokeStyle='#1c1412'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(px+2,py+22); ctx.lineTo(px-16,py+2); ctx.stroke();
      for(let k=0;k<2;k++){ const hx=Math.round(x*T+10+k*26-camR.x), sw=Math.round(Math.sin(time*1.3+x+k)*1.5); rect(ctx,hx,py+4,1,10,'#6a5a3a'); rect(ctx,hx-3+sw,py+14,7,14,'#141012'); for(let i=0;i<3;i++) rect(ctx,hx-2+sw+i*2,py+14,1,14,'#4a4448'); rect(ctx,hx-1+sw,py+18,3,3,'#cfc6b2'); } }
    for(const z of L.straw||[]){ for(let x=z.x0;x<z.x1;x+=3){ const sx=Math.round(x-camR.x); if(sx<-4||sx>W+4) continue; const h=hsh(x,7), burnt=z.a!=null&&x>=z.a&&x<=z.b;
        if(burnt){ rect(ctx,sx,sy-3-Math.round(h*3),1,3+Math.round(h*3),'#120c0a'); if(h>.9&&!z.done){ ectx.fillStyle='rgba(255,120,40,.7)'; ectx.fillRect(sx,sy-2,1,1); } }
        else { const ht=16+Math.round(h*12), lean=Math.round(Math.sin(time*1.6+x*.05)*2); rect(ctx,sx,sy-ht,1,ht,h>.5?'#b89a52':'#8a7438'); rect(ctx,sx+lean,sy-ht-3,1,4,h>.5?'#e0c878':'#c0a45c'); } } }
    const c=S.close; if(c){ for(const [edge,d] of [[c.l,-1],[c.r,1]]){ const ex=Math.round(edge-camR.x); if(d<0?ex<-20:ex>W+20) continue; const x0=d<0?Math.max(0,ex-W):ex, x1=d<0?ex:Math.min(W,ex+W);
          for(let x=x0;x<x1;x+=5){ const near=1-Math.min(1,Math.abs(x-ex)/90), h=(12+near*58)*(.6+.4*Math.abs(Math.sin(time*9+x*.4))); ctx.fillStyle=`rgba(${200+Math.round(near*55)},${70+Math.round(near*110)},${24+Math.round(near*40)},.92)`; ctx.fillRect(x,Math.round(sy-h),4,Math.round(h)); if(near>.5){ ectx.fillStyle=`rgba(255,170,70,${(near*.45).toFixed(2)})`; ectx.fillRect(x,Math.round(sy-h*.7),3,Math.round(h*.7)); } }
          addLight(edge,F-30,150,1.3,1,.5,.2); if(R()<.4) part({x:edge+rnd(-6,6),y:F-rnd(10,70),vx:-d*rnd(5,30),vy:rnd(-60,-20),g:-20,life:rnd(.5,1.1),em:true,col:pick(['#ff9a3c','#ffcf7a'])}); } } }
  else if(S.kind==='preacher'){ /* pews, and the lantern's reach while he preaches */
    for(let i=0;i<8;i++){ const px=Math.round((8+i*5)*T-camR.x); if(i===3||i===4) continue; rect(ctx,px,sy-9,22,3,'#1e1410'); rect(ctx,px,sy-16,2,16,'#1e1410'); rect(ctx,px+20,sy-9,2,9,'#1e1410'); rect(ctx,px,sy-16,2,1,'#3a2a20'); }
    const e=spBoss(); if(e&&!e.intro){ const lx=e.x+e.face*9, ly=e.y-26; addLight(lx,ly,120,1.15,1,.75,.4); const p=e.pat; if(p&&p.name==='sermon'&&!p.done){ const sx=lx-camR.x, yy=ly-camR.y, a=.25+.25*Math.abs(Math.sin(p.t*14)); ectx.strokeStyle=`rgba(255,90,50,${a.toFixed(2)})`; ectx.lineWidth=1; ectx.beginPath(); ectx.arc(sx,yy,SP.sermonR,0,7); ectx.stroke(); ectx.strokeStyle=`rgba(255,220,150,${(.3+.3*p.t/SP.sermonT).toFixed(2)})`; ectx.beginPath(); ectx.arc(sx,yy,p.r,0,7); ectx.stroke(); for(let i=0;i<10;i++){ const a2=i/10*6.283+time*.6; ectx.fillStyle='rgba(255,220,150,.5)'; ectx.fillRect(Math.round(sx+Math.cos(a2)*p.r),Math.round(yy+Math.sin(a2)*p.r),2,2); } addLight(lx,ly,p.r*1.3,1.1+p.t*.3,1,.8,.45);
        /* shade under the lofts and behind the bell */ ctx.fillStyle='rgba(0,0,0,.35)'; for(const x0 of [4,41]) ctx.fillRect(x0*T-camR.x,11*T+4-camR.y,7*T,F-11*T-4); } } } }

/* ---------- drawing: in front (water over the floor) ---------- */
function spFront(){ const S=L&&L.sp; if(!S) return; if(S.kind==='sisters'&&S.flood.k>0){ const F=FLOOR()-camR.y, k=S.flood.k, h=Math.round(11*k); ctx.fillStyle='rgba(24,52,50,.58)'; ctx.fillRect(0,F-h,W,h+2);
    for(let x=0;x<W;x+=2){ const yy=F-h+Math.round(Math.sin(time*3+(x+camR.x)*.14)*1); ectx.fillStyle=`rgba(170,215,205,${(.16+.1*Math.sin(time*2+x*.3)).toFixed(2)})`; ectx.fillRect(x,yy,2,1); } }
  if(S.kind==='preacher'&&L.dark>0&&!L.cand) L.dark=Math.max(0,L.dark-.004); }
(function(){ const o=drawBGEvents; drawBGEvents=function(){ o(); try{ spBack(); }catch(err){ if(!spTold.err){ spTold.err=1; console.error(err); } } }; })();
(function(){ const o=drawHazards; drawHazards=function(){ try{ spWorld(); }catch(err){ if(!spTold.err2){ spTold.err2=1; console.error(err); } } o(); }; })();
(function(){ const o=drawBossOverlays; drawBossOverlays=function(){ o(); try{ spFront(); }catch(err){ if(!spTold.err3){ spTold.err3=1; console.error(err); } } }; })();

/* Odo rears before the pass and when the horse shies */
(function(){ const o=BDRAW.odo; if(!o) return; BDRAW.odo=function(c,e){ const r=e.rear||(e.shyT||0)>time; if(r&&e.mounted){ c.save(); c.translate(-8,0); c.rotate(-.42); c.translate(8,0); o(c,e); c.restore(); } else o(c,e); }; })();

/* ---------- the boss's life sits at the top of the screen, off the floor; the level's name steps aside for it ---------- */
(function(){ const st=document.createElement('style'); st.textContent='#bossbar{bottom:auto;top:calc(var(--u)*2.4)}#stage.bossing .topl{opacity:0}.topl{transition:opacity .5s}'; document.head.appendChild(st);
  setInterval(()=>{ try{ const on=$('#bossbar').classList.contains('on')&&mode!=='title'; $('#stage').classList.toggle('bossing',on); }catch(e){} },250); })();
