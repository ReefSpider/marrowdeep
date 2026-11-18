'use strict';
/* ===== v53: the end of Act I. Merrow and Piet on their own ground (BT, 18 Nov: "continue with this, what's next";
   they were the last two bosses still fought in the old 36-tile room) =====
   Captain Merrow, the Black Camp · the Hollowed host's camp in the Weeping Pass, at night, under a mountain heavy
     with snow. Thousands of his men stand on the slopes above and don't sleep.
       Countermand  he calls his orders the way you taught him to. Get within shouting distance before he finishes
                    and press E: his men stand down (they stop protecting him for 6 s) and he is open. You trained
                    them; they still know your voice.
       Avalanche    in his last quarter he calls for the drums and the mountain answers. Get up on the rocks. What
                    is on the floor when it passes is buried, him included.
   Piet, the Gate of the Last Light · the wall walk of the last fortress that never swore to the King, at night,
     with the Hollowed host assaulting it. Piet holds it against them and against you.
       Ladders      the host raises ladders against the back of the wall. Strike the top of one and it goes over,
                    with everyone on it.
       The chain    his three-cut chain is the one you taught him. Answer a cut by parrying it (a shield) or by
                    striking into its glint (blades meet). Answer all three and his shield breaks; answer two and it
                    cracks, and two cracks break it.
       The ram      in his last quarter the ram is at the gate. Every stroke throws the wall: be in the air when it
                    lands. Catch him mid-swing on a stroke and he goes down.
   Numbers are in M53. Hazards hurt the hero on this machine only. */
const M53={reach:160,hold:1.0,loose:6,mOpen:1.8,avaEvery:19,avaTell:3.4,avaSp:330,avaH:44,avaHit:.08,
  ladEvery:[12,9,10],ladRise:1,ladClimb:2.4,ladMax:2,ladN:3,chain:[.7,1.15,1.6],ansWin:.3,brkHit:.08,crack:2,shieldOff:14,
  ramEvery:3,ramFast:2.6,ramTell:.75,ramHit:.03};
EDEF.siegeladder={w:18,h:46,hp:99999,dmg:0,spd:0,xp:0,name:'Siege Ladder'}; NO_RANK.add('siegeladder'); SP_PROPS.add('siegeladder'); EDRAW.siegeladder=()=>{};
Object.assign(PHASE3_SUB,{merrow:'He calls for the drums. The mountain answers.',piet:'The ram is at the gate.'});

/* ---------- ground ---------- */
Object.assign(SP_ARENA,{
  merrow(def){ const Lv=spArena(def,60,[[6,12,5],[19,11,5],[33,12,5],[47,11,5]]); Lv.fg=[]; Lv.torches=[]; return Lv; },
  piet(def){ const Lv=spArena(def,56,[[2,11,6],[48,11,6]]); Lv.fg=[]; Lv.torches=[{x:4,y:9},{x:51,y:9}]; return Lv; } });
Object.assign(SP_INIT,{
  merrow(){ return {kind:'merrow',ava:{st:0,t:0,x:0,hit:0},turn:0,drum:-9,drumT:0,snow:0,told:0}; },
  piet(){ return {kind:'piet',lad:[],ladT:5,fall:[],ram:{on:0,t:3,sw:0,last:-9},cracks:0,glint:-9}; } });

/* ---------- Merrow: the countermand ---------- */
const M_ORD={orders:['"Loose!"','放て','"Hold!"'],squad:['"To me! Close up!"','集まれ','"Stand fast!"'],advance:['"Forward. In step."','前へ','"Halt!"']};
(function(){ const o=startPat2; startPat2=function(e,n,p){ const S=L&&L.sp;
  if(S&&S.kind==='merrow'&&M_ORD[n]){ o(e,n,p); if(p.skip) return; p.hold=M53.hold; p.ord=n; S.drum=time; AU.tone('sine',62,48,.5,.4,.4); caption(M_ORD[n][0],M_ORD[n][1]); setTimeout(()=>caption(''),1300);
    spTell('order','Merrow calls his orders the way you taught him. Get close and press E before he finishes: his men stand down and he is open.'); return; }
  if(S&&S.kind==='piet'&&e.kind==='piet'){
    if(n==='combo'){ n='shieldchain'; p.name=n; p.ans=[0,0,0]; p.cut=0; p.tl=-1; spTell('chain','His three-cut chain is the one you taught him. Meet each cut: parry it, or strike into the glint. All three and his shield breaks.'); return; }
    if(n==='guard'&&(e.shieldOff||0)>time){ n='roll'; p.name=n; } }
  return o(e,n,p); }; })();
(function(){ const o=runPat2; runPat2=function(e,dt,p,n,t,F){
  if(p.hold>0&&p.ord){ p.hold-=dt; p.t-=dt; e.vx=0; if(p.hold<=0) p.ord=null; return true; }
  if(n==='shieldchain') return pChain(e,dt,p,t,F);
  return o(e,dt,p,n,t,F); }; })();
function mCountermand(e){ const p=e.pat; if(!p||!p.ord) return; const ord=M_ORD[p.ord]; e.pat=null; e.cd=1.4; e.vx=0; bossSetOpen(e,M53.mOpen); AU.clang(); AU.roar(); shake(5); impactT=.08;
  if(typeof hitSlowT!=='undefined'&&!RM&&!(typeof COOP!=='undefined'&&COOP)) hitSlowT=Math.max(hitSlowT,.25);
  let n=0; for(const m of enemies){ if(m.dead||m.squadOf!==e) continue; m._sq=e; m.squadOf=null; m._sqT=time+M53.loose; m.stun=Math.max(m.stun||0,1.8); m.vx=0; n++; }
  caption(ord[2],'止まれ'); setTimeout(()=>caption(''),1400); showBossName('Countermanded','止まれ',n?`His men stand down for ${M53.loose} seconds. He is open.`:'He hears you. For a moment he is your soldier again.');
  fx.push({t:0,dur:.7,draw(f){ const k=f.t/f.dur; ectx.strokeStyle=`rgba(255,236,200,${((1-k)*.6).toFixed(2)})`; ectx.lineWidth=1; ectx.beginPath(); ectx.arc(P.x-camR.x,P.y-20-camR.y,8+k*M53.reach,0,7); ectx.stroke(); }}); }
(function(){ const o=findInteract; findInteract=function(){ const S=L&&L.sp; if(S&&S.kind==='merrow'&&!P.dead){ const e=spBoss(); if(e&&e.pat&&e.pat.ord&&e.pat.hold>0){ if(Math.abs(P.x-e.x)<M53.reach&&Math.abs(P.y-e.y)<80) return {o:e,txt:`<kbd>E</kbd> Countermand: ${M_ORD[e.pat.ord][2]}`,act:()=>mCountermand(e)}; if(!S.farTold){ S.farTold=1; toast('Too far for them to hear you. Get closer next time he calls.',1); } } } return o(); }; })();

/* ---------- Merrow: the mountain ---------- */
SP_X.p3.merrow=function(S,e){ S.ava={st:1,t:M53.avaTell,x:0,hit:0}; S.drumT=1; mAvaTell(S); };
function mAvaTell(S){ const F=FLOOR(); teleRect(T,F-M53.avaH,(L.w-2)*T,M53.avaH,M53.avaTell); AU.tone('sine',40,28,M53.avaTell,.45,.6); AU.noise(M53.avaTell,120,400,1,.25,'lowpass',.6); caption('The mountain is coming down.','雪崩'); setTimeout(()=>caption(''),2200); spTell('ava','An avalanche. Get up on the rocks. What is on the floor when it passes is buried, him included.'); }
SP_X.tick.merrow=function(S,e,dt,F,live){ for(const m of enemies) if(m._sq&&m._sqT<time){ if(!m.dead) m.squadOf=m._sq; m._sq=null; }
  S.turn+=dt; S.snow=Math.max(0,S.snow-dt*.05);
  if(S.drumT>0&&live){ S.drumT-=dt; if(S.drumT<=0){ S.drumT=.8; S.drum=time; AU.tone('sine',58,40,.35,.35,.4); } }
  if(!live&&S.ava.st!==2) return; const a=S.ava;
  if(a.st===1){ a.t-=dt; shake(Math.min(3,(1-a.t/M53.avaTell)*3)); if(a.t<=0){ a.st=2; a.x=-60; a.hit=0; a.got=new Set(); AU.boom(1.2); AU.noise(3.4,200,900,1,.5,'lowpass',.8); shake(10); } }
  else if(a.st===2){ a.x+=M53.avaSp*dt; shake(4); const h=M53.avaH;
    if(!a.hit&&!P.dead&&P.y>F-h&&Math.abs(P.x-a.x)<20){ a.hit=1; hurtPlayer(e.dmg*1.6,{x:a.x-40,hp:0,dead:true}); P.vx=300; P.vy=-160; }
    for(const m of enemies){ if(m.dead||a.got.has(m)||spProp(m)||Math.abs(m.x-a.x)>20||m.y<F-h) continue; a.got.add(m);
      if(m.boss){ if(!m.intro){ a2Hit(m,M53.avaHit); bossBreak(m,3.6); m.buried=time+3.6; showBossName('Buried','埋もれる','The mountain took his feet. Strike.'); if(typeof hitSlowT!=='undefined'&&!RM&&!(typeof COOP!=='undefined'&&COOP)) hitSlowT=Math.max(hitSlowT,.35); } }
      else if(spHost()) dmgEnemy(m,9999,true,1,300,true); }
    if(a.x>L.w*T+80){ a.st=0; a.t=M53.avaEvery; S.snow=1; } }
  else if(a.st===0&&e.phase>2&&!e.dead){ a.t-=dt; if(a.t<=0){ a.st=1; a.t=M53.avaTell; mAvaTell(S); } } };

/* ---------- Piet: the ladders ---------- */
const P_LADX=[13,22,33,42];
function pLadder(S){ const used=new Set(S.lad.map(l=>l.i)); const free=P_LADX.map((x,i)=>i).filter(i=>!used.has(i)&&Math.abs(P_LADX[i]*T-P.x)>40); if(!free.length) return; const i=pick(free), x=P_LADX[i]*T+8, F=FLOOR();
  const p=mkEnemyAt('siegeladder',x,F); p.intro=false; p.state='prop'; p.hp=p.maxhp=99999; p.champ=false; p.name='Siege Ladder'; enemies.push(p);
  const l={i,x,st:0,t:0,n:0,next:M53.ladRise+.4,ent:p}; p._lad=l; S.lad.push(l); teleRect(x-10,F-40,20,40,M53.ladRise); AU.noise(.6,300,900,2,.2,'bandpass',.3); AU.clang();
  spTell('lad','Ladders against the wall. Strike the top of one and it goes over, with everyone on it.'); }
function pTopple(l){ const S=L.sp; if(!S||l.st===2) return; l.st=2; l.t=0; if(l.ent){ l.ent.dead=true; l.ent.deadT=9; } AU.swing(true); AU.noise(.6,800,200,1,.3,'lowpass',.4); setTimeout(()=>{ try{ AU.scream(); }catch(e){} },250); shake(5); sparks(l.x,FLOOR()-40,8,'#c8b890');
  let n=0; for(const m of enemies){ if(m.dead||m._lad!==l||time-m._lsp>1.4) continue; n++; S.fall.push({x:m.x,t:0,col:'#0b0709'}); m.dead=true; m.deadT=9; m.hp=0; }
  S.fall.push({x:l.x,t:0,lad:1,n:l.n<M53.ladN?M53.ladN-l.n:0}); if(typeof hitSlowT!=='undefined'&&!RM&&!(typeof COOP!=='undefined'&&COOP)) hitSlowT=Math.max(hitSlowT,.15);
  if(!S.ladTold){ S.ladTold=1; toast(n?'Over it goes, with them on it.':'Over it goes. The next ones will have to climb from the bottom.',1); } }
(function(){ const o=dmgEnemy; dmgEnemy=function(e,d,crit,dir,kb,heavy,launch,stun){
  if(e&&e.type==='siegeladder'){ if(e.dead) return; e.flash=.1; if(e._lad&&e._lad.st===1) pTopple(e._lad); else sparks(e.x,e.y-30,3,'#c8b890'); return; }
  const S=L&&L.sp; if(S&&S.kind==='piet'&&e&&e.boss&&!e.dead&&e.pat&&e.pat.name==='shieldchain'&&d>0){ const p=e.pat, i=p.cut; if(i<3&&!p.ans[i]&&p.t>=M53.chain[i]-M53.ansWin&&p.t<=M53.chain[i]+.03&&Math.sign(P.x-e.x)===e.face){ pAnswer(e,p,i,'clash'); } }
  return o(e,d,crit,dir,kb,heavy,launch,stun); }; })();
(function(){ const o=parry; parry=function(src){ const S=L&&L.sp; if(S&&S.kind==='piet'&&src&&src.boss&&src.pat&&src.pat.name==='shieldchain'){ const p=src.pat, i=Math.max(0,p.cut-1); if(!p.ans[i]&&p.t-M53.chain[i]<.2) pAnswer(src,p,i,'parry'); } return o(src); }; })();
(function(){ const o=hurtPlayer; hurtPlayer=function(d,src){ if(src&&src.boss&&src.kind==='piet'&&(src._clash||0)>time) return; return o(d,src); }; })();
function pAnswer(e,p,i,how){ p.ans[i]=1; e._clash=time+.25; AU.clang(); AU.tone('triangle',[523,659,784][i],[523,659,784][i],.25,.18,.5); sparks((P.x+e.x)/2,e.y-e.h*.6,14,'#fff6d8'); impactT=.06; freeze=Math.max(freeze||0,.06); bossSetOpen(e,.5,1); }
function pChain(e,dt,p,t,F){ const dx=P.x-e.x, k=e.sc||1; if(!p.ans){ p.ans=[0,0,0]; p.cut=0; p.tl=-1; } if(t<.5&&Math.abs(dx)>40*k){ e.face=Math.sign(dx)||1; e.x=clamp(e.x+e.face*300*dt,2*T,(L.w-2)*T); }
  if(p.cut<3&&t>=M53.chain[p.cut]-M53.ansWin&&p.tl!==p.cut){ p.tl=p.cut; e.face=Math.sign(dx)||e.face; L.sp.glint=time; AU.ting(); sparks(e.x+e.face*12*k,e.y-26*k,5,'#fff2d0'); }
  if(p.cut<3&&t>=M53.chain[p.cut]){ const i=p.cut; p.cut++; AU.swing(true); e.x=clamp(e.x+e.face*14,2*T,(L.w-2)*T); const w=Math.round(48*k), h=Math.round(34*k); hazard(e.face>0?e.x:e.x-w,e.y-h,w,h,.1,e.dmg,e); if(!p.ans[i]) p.miss=time; }
  if(t>=M53.chain[2]+.55&&!p.done){ p.done=1; const n=p.ans.reduce((a,b)=>a+b,0), S=L.sp;
    if(n===3) pBreak(e,'Three for three. You taught him that chain.');
    else if(n===2){ S.cracks++; if(S.cracks>=M53.crack){ S.cracks=0; pBreak(e,'The crack runs through. His shield goes.'); } else { AU.clang(); sparks(e.x+e.face*10*k,e.y-18*k,10,'#c8b890'); showBossName('Cracked','罅','Two of three. Once more and it goes.'); } }
    endPat(e,.9); }
  return true; }
function pBreak(e,why){ e.shieldOff=time+M53.shieldOff; e.guard=0; a2Hit(e,M53.brkHit); bossBreak(e,3.2); AU.clang(); AU.boom(.6); shake(9); impactT=.14; if(typeof hitSlowT!=='undefined'&&!RM&&!(typeof COOP!=='undefined'&&COOP)) hitSlowT=Math.max(hitSlowT,.4);
  const k=e.sc||1; for(let i=0;i<22;i++) part({x:e.x+e.face*10*k,y:e.y-18*k,vx:rnd(-160,160),vy:rnd(-220,-40),g:600,life:rnd(.4,.9),col:pick(['#8a8478','#5a5054','#c8b890','#3a2a1c'])}); showBossName('The shield breaks','盾割り',why); }

/* ---------- Piet: the ram ---------- */
SP_X.p3.piet=function(S){ S.ram.on=1; S.ram.t=2.6; spTell('ram','The ram. Every stroke throws the wall: be in the air when it lands. Catch Piet mid-swing on a stroke and he goes down.'); };
SP_X.tick.piet=function(S,e,dt,F,live){ for(const f of S.fall) f.t+=dt; S.fall=S.fall.filter(f=>f.t<1.6);
  for(const l of S.lad){ l.t+=dt; if(l.st===0&&l.t>=M53.ladRise){ l.st=1; l.t=0; }
    else if(l.st===1&&live){ l.next-=dt; if(l.next<=0&&l.n<M53.ladN){ l.next=M53.ladClimb; l.n++; const m=stSpawn(pick(['footman','footman','pikeman']),l.x+rnd(-4,4),F,m=>{ m.vy=-200; m.face=Math.sign(P.x-l.x)||1; m._lad=l; m._lsp=time; }); AU.noise(.2,600,1600,2,.15,'bandpass',.2); }
      if(l.n>=M53.ladN&&l.next<=-4){ l.st=2; l.t=0; if(l.ent){ l.ent.dead=true; l.ent.deadT=9; } } } }
  S.lad=S.lad.filter(l=>!(l.st===2&&l.t>1.2));
  if(!live) return; S.ladT-=dt; if(S.ladT<=0){ S.ladT=M53.ladEvery[e.phase-1]||10; if(S.lad.filter(l=>l.st<2).length<M53.ladMax&&spHost()) pLadder(S); }
  const r=S.ram; if(!r.on) return; r.t-=dt; r.sw=clamp(1-r.t/M53.ramTell,0,1);
  if(r.t<=M53.ramTell&&!r.tell){ r.tell=1; teleRect(T,F-8,(L.w-2)*T,8,M53.ramTell); AU.tone('sine',50,90,M53.ramTell,.3,.4); }
  if(r.t<=0){ r.tell=0; r.last=time; r.t=e.hp/e.maxhp<.1?M53.ramFast:M53.ramEvery; AU.boom(1); AU.slam(); shake(10); impactT=.06; for(let x=camR.x;x<camR.x+W;x+=24) dust(x+rnd(0,20),F,1);
    if(!P.dead&&P.onGround){ hurtPlayer(e.dmg*.55,{x:P.x,hp:0,dead:true}); P.vy=-150; }
    for(const m of enemies) if(!m.dead&&!m.boss&&!spProp(m)&&m.onGround!==false&&m.y>=F-2) m.stun=Math.max(m.stun||0,1.2);
    const mid=e.pat&&e.pat.name!=='guard'&&e.pat.name!=='leap'; if(e.y>=F-1&&mid&&e.state!=='stagger'){ a2Hit(e,M53.ramHit); bossBreak(e,1.8); showBossName('Thrown','揺れ','The stroke took his feet.'); } else e.brace=time+.45; } };

/* ---------- drawing: Merrow ---------- */
SP_X.back.merrow=function(S,F){ const off=camR.x*.12, peak=a2Par(.12)-140, hy=F-36, a=S.ava;
  /* the mountain over the camp */ ctx.fillStyle='#0c0b10'; ctx.beginPath(); ctx.moveTo(peak-260,hy+20); ctx.lineTo(peak-60,hy-150); ctx.lineTo(peak,hy-196); ctx.lineTo(peak+60,hy-160); ctx.lineTo(peak+420,hy-20); ctx.lineTo(peak+520,hy+20); ctx.fill();
  ctx.fillStyle='#b8bccb'; ctx.beginPath(); ctx.moveTo(peak-60,hy-150); ctx.lineTo(peak,hy-196); ctx.lineTo(peak+60,hy-160); ctx.lineTo(peak+150,hy-120); ctx.lineTo(peak+100,hy-118); ctx.lineTo(peak+40,hy-136); ctx.lineTo(peak-10,hy-150); ctx.lineTo(peak-40,hy-140); ctx.fill();
  ctx.fillStyle='rgba(184,188,203,.35)'; for(let i=0;i<7;i++){ ctx.fillRect(Math.round(peak-40+i*34),Math.round(hy-130+i*16),26-i,2); }
  /* the slide coming down the mountain */ if(a.st===1||a.st===2){ const k=a.st===1?1-a.t/M53.avaTell:1; for(let i=0;i<26;i++){ const q=Math.min(1,k*1.15-i*.02); if(q<=0) continue; const x=peak+20+q*300+Math.sin(i*7)*16, y=hy-170+q*170+Math.cos(i*5)*8, r=6+q*18+((i*7)%5); ctx.fillStyle=`rgba(${200+((i*13)%40)},${205+((i*7)%40)},220,${(.55+.3*q).toFixed(2)})`; ctx.beginPath(); ctx.arc(x,y,r,0,7); ctx.fill(); } }
  /* the host on the slopes: rows of the Hollowed, standing. Every few seconds they all turn their heads. */ const turn=(S.turn%9)<1.4, look=turn?Math.sign(P.x-camR.x-W/2)||1:0;
  for(let r=3;r>=0;r--){ const y=hy-4-r*22-r*r*3, gap=9-r, par=.16-r*.02, cy=x=>Math.round(y+Math.sin((x+camR.x*par)*.013)*10*(r+1)); ctx.fillStyle=['#16151c','#19181f','#1c1b23','#1f1e27'][r]; ctx.beginPath(); ctx.moveTo(0,hy+30); for(let x=0;x<=W;x+=8) ctx.lineTo(x,cy(x)+r%2); ctx.lineTo(W,hy+30); ctx.fill(); ctx.fillStyle='rgba(200,206,220,.16)'; for(let x=0;x<W;x+=8) ctx.fillRect(x,cy(x)+r%2,8,1); for(let x=((-(camR.x*par))%gap)-gap;x<W+gap;x+=gap){ const xx=Math.round(x), h=hsh(Math.floor((x+camR.x*par)/gap),r); if(h<.12) continue; const yy=Math.round(y+Math.sin((x+camR.x*par)*.013)*10*(r+1)); rect(ctx,xx,yy-6+r%2,3,6,'#08070a'); rect(ctx,xx,yy-8+r%2,3,2,'#0e0c12');
      ectx.fillStyle=`rgba(200,214,230,${(.3+.25*(3-r)/3).toFixed(2)})`; ectx.fillRect(xx+1+look,yy-7+r%2,1,1); } }
  for(let i=0;i<9;i++){ const x=((i*137-off*1.4)%(W+60)+W+60)%(W+60)-30, y=hy-8-((i*29)%60); const fl=.5+.5*Math.sin(time*8+i); ectx.fillStyle=`rgba(255,140,60,${(.35+fl*.3).toFixed(2)})`; ectx.fillRect(Math.round(x),Math.round(y),2,2); } };
SP_X.world.merrow=function(S,F,sy){ /* tents, racks, the bonfire and the war drum */ for(const tx of [10,25,40,54]){ const x=Math.round(tx*T-camR.x); if(x<-60||x>W+60) continue; ctx.fillStyle='#1a1614'; ctx.beginPath(); ctx.moveTo(x-26,sy); ctx.lineTo(x,sy-40); ctx.lineTo(x+26,sy); ctx.fill(); ctx.fillStyle='#24201c'; ctx.beginPath(); ctx.moveTo(x-26,sy); ctx.lineTo(x,sy-40); ctx.lineTo(x-6,sy); ctx.fill(); rect(ctx,x-1,sy-46,2,8,'#3a2a1c'); rect(ctx,x+1,sy-46,6,4,'#5a1018'); rect(ctx,x-4,sy-14,8,14,'#08070a'); rect(ctx,x-26,sy-1,52,1,'#c8ccd8'); }
  const bx=Math.round(29*T-camR.x); if(bx>-60&&bx<W+60){ for(let i=0;i<5;i++){ ctx.save(); ctx.translate(bx,sy-2); ctx.rotate(-.7+i*.35); rect(ctx,-1,-16,2,16,'#2a1e14'); ctx.restore(); } for(let i=0;i<8;i++){ const h=6+Math.abs(Math.sin(time*9+i*1.7))*16; ctx.fillStyle=i%2?'#ffb04a':'#e8662a'; ctx.fillRect(bx-9+i*2,Math.round(sy-6-h),2,Math.round(h)); } ectx.fillStyle='rgba(255,170,80,.22)'; ectx.fillRect(bx-4,sy-12,8,5); addLight(29*T,F-12,150,1.2,1,.6,.3); if(R()<.3) part({x:29*T+rnd(-6,6),y:F-20,vx:rnd(-10,10),vy:rnd(-60,-30),g:-10,life:rnd(.6,1.2),em:true,col:'#ffcf7a'}); }
  const dx=Math.round(3.5*T-camR.x); if(dx>-60&&dx<W+60){ const hit=clamp(1-(time-S.drum)/.25,0,1); rect(ctx,dx-2,sy-40,3,40,'#1a120c'); rect(ctx,dx+30,sy-40,3,40,'#1a120c'); rect(ctx,dx-4,sy-42,40,3,'#1a120c'); ctx.fillStyle='#3a2416'; ctx.beginPath(); ctx.ellipse(dx+15,sy-24,15,14,0,0,7); ctx.fill(); ctx.fillStyle=hit>0?'#c8b8a0':'#8a7a64'; ctx.beginPath(); ctx.ellipse(dx+15,sy-24,4,13,0,0,7); ctx.fill(); rect(ctx,dx+5,sy-38,1,28,'#5a1018'); rect(ctx,dx+24,sy-38,1,28,'#5a1018');
    const ax=dx+30, arm=hit>0?-.2:-1.4; rect(ctx,ax,sy-22,5,22,'#08070a'); rect(ctx,ax+1,sy-27,4,5,'#0e0c12'); ectx.fillStyle='rgba(200,214,230,.6)'; ectx.fillRect(ax+1,sy-26,1,1); ctx.save(); ctx.translate(ax+1,sy-20); ctx.rotate(Math.PI+arm); rect(ctx,0,0,12,2,'#08070a'); ctx.restore(); }
  if(S.snow>0){ ctx.fillStyle=`rgba(210,216,228,${(S.snow*.8).toFixed(2)})`; ctx.fillRect(0,sy-3,W,3); } };
SP_X.front.merrow=function(S){ const a=S.ava; if(a.st!==2) return; const F=FLOOR()-camR.y, fx_=Math.round(a.x-camR.x), h=M53.avaH;
  for(let x=Math.max(-40,fx_-260);x<Math.min(W+40,fx_+8);x+=4){ const d=fx_-x, q=clamp(1-d/260,0,1), hh=(h*(.55+.45*Math.abs(Math.sin(x*.21+time*9))))*(.35+.65*q)+Math.max(0,(1-q)*30*Math.sin(x*.05)); ctx.fillStyle=`rgba(${215+((x*7)%30)},${222+((x*3)%25)},235,${(.6+.4*q).toFixed(2)})`; ctx.fillRect(x,Math.round(F-hh),4,Math.round(hh)+2); }
  for(let i=0;i<10;i++){ const x=fx_-10-i*26+Math.sin(time*7+i)*6, y=F-h-8-((i*19+time*60)%50); ctx.fillStyle='rgba(225,230,240,.35)'; ctx.beginPath(); ctx.arc(x,y,10+((i*7)%9),0,7); ctx.fill(); }
  for(let i=0;i<6;i++){ const x=fx_-6-i*40, y=F-12-Math.abs(Math.sin(time*11+i))*24; ctx.save(); ctx.translate(x,y); ctx.rotate(time*6+i); rect(ctx,-3,-3,6,6,'#3a3640'); ctx.restore(); } };
(function(){ const o=BDRAW.merrow; if(!o) return; BDRAW.merrow=function(c,e){ o(c,e); if((e.buried||0)>time){ const k=clamp((e.buried-time)/3.6,0,1); const w=Math.round(e.w*.75)+4, h=Math.round(e.h*.45*k+3); c.fillStyle='#d6dae6'; c.fillRect(-w,-h,w*2,h); c.fillStyle='#b8bccb'; c.fillRect(-w,-h,w*2,2); } }; })();

/* ---------- drawing: Piet ---------- */
SP_X.mid.piet=function(S,F){ const hy=F-10, off=camR.x*.2, r=S.ram; /* the valley at night, the host below with its torches */
  const g=ctx.createLinearGradient(0,0,0,hy); g.addColorStop(0,'#0a0a12'); g.addColorStop(1,'#1a1620'); ctx.fillStyle=g; ctx.fillRect(0,0,W,hy+20);
  ctx.fillStyle='#0d0c12'; ctx.beginPath(); ctx.moveTo(0,hy-110); for(let x=0;x<=W;x+=20) ctx.lineTo(x,hy-110+Math.sin((x+off*.4)*.012)*26+Math.sin((x+off*.4)*.031)*10); ctx.lineTo(W,hy+20); ctx.lineTo(0,hy+20); ctx.fill();
  ctx.fillStyle='rgba(200,206,220,.18)'; for(let x=0;x<W;x+=20) ctx.fillRect(x,Math.round(hy-110+Math.sin((x+off*.4)*.012)*26+Math.sin((x+off*.4)*.031)*10),20,2);
  for(let r_=0;r_<5;r_++){ const y=hy-70+r_*14, n=22+r_*8; for(let i=0;i<n;i++){ const x=((i*(W/n)*1.7+r_*13-off*(.3+r_*.1))%(W+40)+W+40)%(W+40)-20, fl=.5+.5*Math.sin(time*(5+i%3)+i*1.3+r_); if(hsh(i,r_)<.35) continue; ectx.fillStyle=`rgba(255,${120+Math.round(fl*60)},50,${(.25+fl*.3+r_*.05).toFixed(2)})`; ectx.fillRect(Math.round(x),Math.round(y+Math.sin(i)*3),1+(r_>2?1:0),1+(r_>2?1:0)); } }
  for(const [px,ph] of [[-170,0],[140,1.4]]){ const x=Math.round(a2Par(.2)+px+Math.sin(time*.15+ph)*6), y=hy-40; rect(ctx,x-9,y-58,18,58,'#09080c'); rect(ctx,x-11,y-62,22,5,'#09080c'); for(let k=0;k<4;k++) rect(ctx,x-7,y-52+k*13,14,1,'#16141c'); }
  /* the ram under its roof, at the gate far below */ const rx=a2Par(.2), ry=hy-44, sw=r.on?(r.t<=M53.ramTell?-.5+r.sw*.9:-.5*Math.min(1,(time-r.last)/.6)):Math.sin(time*.8)*.08; rect(ctx,rx+46,ry-60,26,62,'#0a090e'); rect(ctx,rx+48,ry-34,22,30,'#1a120c'); for(let i=0;i<4;i++) rect(ctx,rx+50+i*5,ry-32,2,28,'#2a1e14'); ctx.fillStyle='#16131c'; ctx.beginPath(); ctx.moveTo(rx-50,ry); ctx.lineTo(rx-34,ry-22); ctx.lineTo(rx+34,ry-22); ctx.lineTo(rx+50,ry); ctx.fill(); rect(ctx,rx-34,ry-22,68,1,'#5a4a3e'); for(let i=0;i<6;i++){ const fl=.5+.5*Math.sin(time*7+i*1.3); ectx.fillStyle=`rgba(255,140,60,${(.3+fl*.4).toFixed(2)})`; ectx.fillRect(rx-44+i*18,ry-2,1,2); }
  ctx.save(); ctx.translate(rx-30,ry-16); ctx.rotate(sw*.25); rect(ctx,0,-3,70+sw*18,6,'#2a1e14'); rect(ctx,66+sw*18,-5,8,10,'#4a4448'); ctx.restore(); if(r.on&&time-r.last<.3){ const k=1-(time-r.last)/.3; ectx.fillStyle=`rgba(255,200,120,${(k*.7).toFixed(2)})`; ectx.beginPath(); ectx.arc(rx+50,ry-6,6+k*14,0,7); ectx.fill(); } };
SP_X.world.piet=function(S,F,sy){ /* the far parapet: merlons along the back of the wall walk */ for(let x=-((camR.x|0)%22)-22;x<W+22;x+=22){ rect(ctx,x,sy-18,14,18,'#1c1a20'); rect(ctx,x,sy-18,14,1,'#3a3640'); rect(ctx,x+14,sy-10,8,10,'#16141a'); rect(ctx,x,sy-18,14,2,'rgba(220,224,236,.5)'); }
  /* the beacon: the Last Light itself, on the east tower */ const bx=Math.round((L.w-4)*T-camR.x), top=sy-200; if(bx>-80&&bx<W+80){ rect(ctx,bx-16,top+30,32,sy-top-30,'#18161c'); rect(ctx,bx-16,top+30,1,sy-top-30,'#2c2830'); for(let k=0;k<4;k++) rect(ctx,bx-20+k*12,top+22,8,10,'#18161c'); rect(ctx,bx-12,top+12,24,6,'#2a1e14');
    const big=S.ram.on?1.3:1; for(let i=0;i<10;i++){ const h=(8+Math.abs(Math.sin(time*7+i*1.9))*18)*big; ctx.fillStyle=i%3?'#b8461e':'#d8782a'; ctx.fillRect(bx-12+i*2.4,Math.round(top+12-h),3,Math.round(h)); if(i%3===0){ ectx.fillStyle='rgba(255,170,80,.28)'; ectx.fillRect(bx-12+i*2.4,Math.round(top+12-h*.6),3,Math.round(h*.6)); } } addLight((L.w-4)*T,FLOOR()-196,220*big,1.1,1,.62,.3); if(R()<.5) part({x:(L.w-4)*T+rnd(-8,8),y:FLOOR()-210,vx:rnd(-20,20),vy:rnd(-90,-40),g:-20,life:rnd(.6,1.4),em:true,col:'#ffcf7a'}); }
  /* the ladders */ for(const l of S.lad){ const x=Math.round(l.x-camR.x); if(x<-30||x>W+30) continue; let k=1, rot=0; if(l.st===0) k=clamp(l.t/M53.ladRise,0,1); if(l.st===2){ rot=Math.min(1.3,l.t*l.t*2.4); k=Math.max(0,1-l.t*.8); }
    ctx.save(); ctx.translate(x,sy+30); ctx.rotate(-rot*.3); ctx.scale(1,k||.01); ctx.translate(0,-30); const hh=86; rect(ctx,-8,-hh,2,hh,'#3a2a1c'); rect(ctx,6,-hh,2,hh,'#3a2a1c'); for(let y=-hh+6;y<0;y+=8) rect(ctx,-6,y,12,1,'#5a4630'); rect(ctx,-9,-hh,4,3,'#6a6670'); rect(ctx,5,-hh,4,3,'#6a6670'); ctx.restore(); }
  for(const f of S.fall){ if(f.lad) continue; const x=Math.round(f.x-camR.x), y=Math.round(sy-30+f.t*f.t*260); ctx.save(); ctx.globalAlpha=clamp(1-f.t/1.4,0,1); ctx.translate(x,y); ctx.rotate(f.t*4); rect(ctx,-3,-8,6,12,'#0b0709'); rect(ctx,-2,-11,4,3,'#1a1418'); rect(ctx,-6,-4,3,1,'#0b0709'); rect(ctx,3,-6,3,1,'#0b0709'); ctx.restore(); } };
SP_X.front.piet=function(S){ const e=spBoss(); if(!e||e.intro) return; const p=e.pat, k=e.sc||1, sx=Math.round(e.x-camR.x), top=Math.round(e.y-e.h-camR.y)-10;
  if(p&&p.name==='shieldchain'){ for(let i=0;i<3;i++){ const x=sx-12+i*12, on=p.ans[i], due=p.cut===i&&p.t>=M53.chain[i]-M53.ansWin; ctx.save(); ctx.translate(x,top); ctx.rotate(Math.PI/4); rect(ctx,-3,-3,6,6,on?'#d8b24a':'#2a2426'); rect(ctx,-3,-3,6,1,on?'#ffe6a8':'#4a4448'); ctx.restore(); if(due&&!on){ ectx.fillStyle=`rgba(255,240,200,${(.5+.5*Math.sin(time*40)).toFixed(2)})`; ectx.fillRect(x-1,top-1,3,3); } } }
  if(S.cracks>0&&!((e.shieldOff||0)>time)){ a2Txt('罅'.repeat(S.cracks),sx,top-8,'#c8b890',8); }
  if((e.shieldOff||0)>time){ a2Txt('盾無し',sx,top-8,'#ff7a4a',8); }
  if((e.brace||0)>time){ ctx.fillStyle='rgba(200,184,144,.35)'; ctx.fillRect(sx-14*k,Math.round(e.y-camR.y)-2,28*k,2); } };
