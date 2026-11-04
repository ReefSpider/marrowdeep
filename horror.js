'use strict';
/* ===== horror: boss screams, harder bosses, the boss finisher (止め), and jump scares ===== */
if(SETTINGS.scares==null) SETTINGS.scares=!RM;

/* ---------- sounds: boss screams, the scare stinger, whispers ---------- */
AU.shaper=function(k){ if(this['_ws'+k]) return this['_ws'+k]; const n=1024, cu=new Float32Array(n); for(let i=0;i<n;i++){ const x=i/(n-1)*2-1; cu[i]=Math.tanh(k*x); } const w=this.c.createWaveShaper(); w.curve=cu; return w; };
const SCREAM={mother:{f:[520,760,300],dur:1.9,form:[[800,1150],[350,2300]],v:3},choir:{f:[420,560,260],dur:1.7,form:[[600,1000],[300,2600]],v:4,cluster:1},
  tithe:{f:[120,170,60],dur:2,form:[[500,900],[300,700]],v:3,sub:1},saint:{f:[880,1300,500],dur:1.6,form:[[900,1300],[320,2800]],v:3},
  count:{f:[180,260,70],dur:2.3,form:[[650,1050],[400,800]],v:4,sub:1},minor:{f:[600,900,380],dur:.9,form:[[800,1200],[350,2400]],v:2}};
AU.bossScream=function(kind,o){ if(!this.c) return; o=o||{}; const S=SCREAM[kind]||SCREAM.minor, c=this.c, t=c.currentTime, dur=S.dur*(o.long?1.7:1), pitch=o.pitch||1;
  const out=c.createGain(); out.gain.setValueAtTime(.0001,t); out.gain.exponentialRampToValueAtTime(.42*(o.vol||1),t+.07); out.gain.setTargetAtTime(.3*(o.vol||1),t+.25,.4); out.gain.exponentialRampToValueAtTime(.0001,t+dur);
  this.out(out,.75); const ws=this.shaper(6); const pre=c.createGain(); pre.gain.value=.6; pre.connect(ws);
  const f1=c.createBiquadFilter(), f2=c.createBiquadFilter(); f1.type=f2.type='bandpass'; f1.Q.value=5; f2.Q.value=7; ws.connect(f1); ws.connect(f2); const g2=c.createGain(); g2.gain.value=.7; f1.connect(out); f2.connect(g2); g2.connect(out);
  const [A,E]=S.form; f1.frequency.setValueAtTime(A[0],t); f1.frequency.linearRampToValueAtTime(E[0],t+dur); f2.frequency.setValueAtTime(A[1],t); f2.frequency.linearRampToValueAtTime(E[1],t+dur*.7);
  const voices=S.cluster?[0,100,-170,290]:Array.from({length:S.v},(_,i)=>(i-1)*14);
  const lfo=c.createOscillator(); lfo.frequency.setValueAtTime(5,t); lfo.frequency.linearRampToValueAtTime(11,t+dur); const ld=c.createGain(); ld.gain.setValueAtTime(10,t); ld.gain.linearRampToValueAtTime(70,t+dur); lfo.connect(ld); lfo.start(t); lfo.stop(t+dur+.1);
  for(const det of voices){ const os=c.createOscillator(); os.type='sawtooth'; os.detune.value=det+rnd(-8,8); const [a,b,e]=S.f.map(x=>x*pitch);
    os.frequency.setValueAtTime(a,t); os.frequency.exponentialRampToValueAtTime(b,t+.18); os.frequency.exponentialRampToValueAtTime(e,t+dur); ld.connect(os.detune); os.connect(pre); os.start(t); os.stop(t+dur+.1); }
  const ns=c.createBufferSource(); ns.buffer=this.nb; ns.loop=true; const nf=c.createBiquadFilter(); nf.type='bandpass'; nf.frequency.value=2600; nf.Q.value=1.2; const ng=c.createGain(); ng.gain.setValueAtTime(.0001,t); ng.gain.exponentialRampToValueAtTime(.25,t+.05); ng.gain.exponentialRampToValueAtTime(.0001,t+dur*.8); ns.connect(nf); nf.connect(ng); ng.connect(out); ns.start(t); ns.stop(t+dur);
  if(S.sub||o.long){ this.tone('sine',62,28,dur,.55,.6); }
  if(typeof SMP!=='undefined') SMP.play('gore_big_smash',{v:.35,rate:.55,wet:.6}); };
AU.stinger=function(){ if(!this.c) return; const c=this.c, t=c.currentTime; const out=c.createGain(); out.gain.setValueAtTime(.0001,t); out.gain.exponentialRampToValueAtTime(.7,t+.01); out.gain.exponentialRampToValueAtTime(.0001,t+1.4); this.out(out,.6);
  const ws=this.shaper(9); ws.connect(out); for(const f of [1180,1253,1670,1771,2350]){ const o=c.createOscillator(); o.type='sawtooth'; o.frequency.setValueAtTime(f,t); o.frequency.exponentialRampToValueAtTime(f*.45,t+1.2); const g=c.createGain(); g.gain.value=.16; o.connect(g); g.connect(ws); o.start(t); o.stop(t+1.3); }
  this.noise(.5,8000,1500,.7,.6,'highpass',.4); this.tone('sine',70,24,1.1,.9,.5);
  if(typeof SMP!=='undefined') SMP.play('bell_dissonant',{v:.5,rate:1.35,wet:.6}); };
AU.whisper=function(dur){ if(!this.c) return; const c=this.c, t=c.currentTime; for(let i=0;i<3;i++){ const s=c.createBufferSource(); s.buffer=this.nb; s.loop=true; const f=c.createBiquadFilter(); f.type='bandpass'; f.frequency.value=1400+i*900; f.Q.value=4; const g=c.createGain(); g.gain.value=0;
    for(let k=0;k<dur*3;k++) g.gain.setValueAtTime(Math.random()<.5?.0:.12+Math.random()*.1,t+k/3+i*.07); g.gain.setValueAtTime(0,t+dur); s.connect(f); f.connect(g); this.out(g,.9); s.start(t); s.stop(t+dur+.1); }
  this.tone('sine',110,104,dur,.12,.9); };
AU.glitch=function(){ for(let i=0;i<5;i++) this.tone('square',200+Math.random()*3000,100+Math.random()*900,.04,.08,.2,i*.035); this.noise(.25,5000,800,.6,.25,'bandpass',.3); };

/* ---------- harder, more aggressive bosses ---------- */
function bossAggr(e){ return Math.min(1.6,1.06+ngp*.12+(e.phase-1)*.09); }
(function(){ const o=spawnBoss; spawnBoss=function(key){ const e=o(key); e.hp=e.maxhp=Math.round(e.hp*1.15); e.dmg*=1.1; return e; }; })();
endPat=function(e,cd){ e.pat=null; e.cd=(cd||1.2)*[.82,.6,.46][e.phase-1]/(1+Math.min(ngp,5)*.2); };
(function(){ const o=bossIdle; bossIdle=function(e,dt){ o(e,dt*1.25); const d=Math.abs(P.x-e.x); if(d>150) e.cd-=dt*.7; }; })();
(function(){ const o=updBoss; updBoss=function(e,dt){
  if(e.dead||e.intro) return o(e,dt);
  if(e.finWin>0){ e.finWin-=dt; e.state='stagger'; e.st=Math.max(e.st,.2); e.pat=null; if(R()<.4) bleed(e.x+rnd(-e.w/3,e.w/3),e.y-e.h*rnd(.3,.8),2,R()<.5?1:-1,.8);
    if(e.finWin<=0){ e.finCd=7; e.state='idle'; e.cd=.3; AU.bossScream(e.kind,{vol:.8}); shake(6); toast('It rises again.'); } return o(e,dt); }
  if(e.finCd>0) e.finCd-=dt;
  const ph=e.phase; const fast=e.state!=='stagger'&&e.state!=='roar'; o(e,fast?dt*bossAggr(e):dt);
  if(e.phase!==ph&&!e.dead){ AU.bossScream(e.kind,{vol:1.1}); if(e.phase===3) setTimeout(()=>{ if(mode==='play') scareFace(.6); },350); }
  if(!e.dead&&canKneel(e)) kneel(e); }; })();
(function(){ const o=bossIntro; bossIntro=function(e){ o(e); setTimeout(()=>AU.bossScream(e.kind),seenIntro[e.kind]&&cut&&cut.steps.length<2?150:2100); }; })();
(function(){ const o=bossDefeated; bossDefeated=function(e){ AU.bossScream(e.kind,{long:1,pitch:.85,vol:1.15}); o(e); }; })();

/* ---------- the finisher: a broken boss can be ended by hand ---------- */
const finalPhase=e=>e.phase>=(BOSSES[e.kind].kit[2]?3:2);
const canKneel=e=>finalPhase(e)&&e.hp>0&&e.hp<e.maxhp*.1&&!(e.finCd>0)&&!(e.finWin>0)&&!e.shield;
function kneel(e){ e.finWin=5; e.state='stagger'; e.st=5; e.pat=null; e.stag=0; fx=fx.filter(f=>!f.haz); projs=projs.filter(p=>p.from==='p');
  AU.toll&&AU.toll(); AU.bossScream(e.kind,{pitch:.8,vol:.9}); impactT=.08; shake(8); camZT=1.12; setTimeout(()=>{ if(camZT===1.12) camZT=1; },900);
  showBossName('止め','todome','It kneels. Go to it and press F to finish it.'); }
function finTarget(){ if(mode!=='play'||!P||P.dead) return null; return enemies.find(e=>e.boss&&!e.dead&&e.finWin>0&&Math.abs(e.x-P.x)<e.w/2+60&&Math.abs((e.y-e.h/2)-(P.y-14))<e.h/2+60)||null; }
function performFinisher(e){ const side=Math.sign(e.x-P.x)||1, ey=e.y-e.h*.55; e.finWin=0; e.finisher=1; P.attack=null; P.vx=P.vy=0; P.inv=9;
  const slash=(ang,len,dur)=>fx.push({t:0,dur:dur||.4,draw(f){ const k=1-f.t/f.dur; ectx.save(); ectx.translate(e.x-camR.x,ey-camR.y); ectx.rotate(ang); ectx.fillStyle=`rgba(255,246,236,${k.toFixed(2)})`; ectx.fillRect(-len/2,-1,len,2); ectx.fillStyle=`rgba(255,60,40,${(k*.6).toFixed(2)})`; ectx.fillRect(-len/2,1,len,1); ectx.restore(); }});
  playCut(Object.assign([
    {dur:.55,zoom:1.45,skip:false,cam:{x:e.x,y:ey},fn:()=>{ U.uWhite.value=.35; AU.ting(); freeze=.05; P.x=e.x-side*(e.w/2+16); P.y=Math.min(P.y,e.fly?FLOOR():e.y); P.face=side; cutIn('hero','止め','todome',.9); }},
    {dur:1.05,zoom:1.7,skip:false,cam:{x:e.x,y:ey},fn:()=>{ for(let i=0;i<6;i++) setTimeout(()=>{ if(!cut) return; const a=rnd(-1.2,1.2); slash(a,e.w*1.6+30,.35); AU.hit(true); AU.swing(true); bleed(e.x,ey,22,R()<.5?1:-1,1.8); sparks(e.x,ey,8); shake(5); impactT=.04; P.face=i%2?-side:side; ghosts.push({x:P.x,y:P.y,face:P.face,a:-.4,oa:P.offA,life:.3}); P.x=e.x+(i%2?side:-side)*(e.w/2+14); },i*150); }},
    {dur:1.3,zoom:1.25,skip:false,cam:{x:e.x,y:ey},fn:()=>{ for(let k=0;k<8;k++) ghosts.push({x:lerp(e.x-side*60,e.x+side*60,k/8),y:P.y,face:side,a:.3,oa:P.offA,life:.35}); P.x=e.x+side*(e.w/2+40); P.face=side;
        slash(side>0?-.12:.12,W*1.4,.8); impactT=.22; U.uWhite.value=.6; shake(14); AU.kill(); AU.gore&&AU.gore(); AU.toll&&AU.toll(); for(let i=0;i<5;i++) bleed(e.x,ey+rnd(-20,20),30,side,2.2); }}
  ],{keepMood:1}),()=>{ P.inv=1; e.hp=0; killEnemy(e,side,true);
    P.life=P.stats.life; dropChest(e,1); toast('止め — finished by your hand. The Pit pays extra: a second reliquary.'); }); }
addEventListener('keydown',ev=>{ const k=ev.key.length===1?ev.key.toLowerCase():ev.key; if(ev.repeat) return; if(k==='f'||k==='e'){ const e=finTarget(); if(e){ ev.preventDefault(); ev.stopImmediatePropagation(); performFinisher(e); } } },true);
const finEl=document.createElement('div'); finEl.id='finPrompt'; finEl.innerHTML='<b>止め</b><kbd>F</kbd>FINISH'; stage.appendChild(finEl);
function updFinPrompt(){ const e=mode==='play'&&enemies.find(x=>x.boss&&!x.dead&&x.finWin>0); if(!e){ finEl.style.display='none'; return; }
  const near=!!finTarget(); const sx=((e.x-camR.x-camPX)*camZ+camPX)/W*100, sy=((e.y-e.h-10-camR.y-camPY)*camZ+camPY)/H*100;
  finEl.style.display='block'; finEl.style.left=sx+'%'; finEl.style.top=sy+'%'; finEl.style.opacity=near?1:.55+.25*Math.sin(time*8); }

/* ---------- jump scares ---------- */
const scareCv=document.createElement('canvas'); scareCv.id='scareCv'; scareCv.width=160; scareCv.height=90; stage.appendChild(scareCv); const SG=scareCv.getContext('2d');
const SCARE={cd:60,n:0,max:2,busy:false,watcher:null,dim:0};
function drawScareFace(v){ const g=SG; g.setTransform(1,0,0,1,0,0); g.fillStyle=v.red?'#140000':'#000'; g.fillRect(0,0,160,90); const cx=80+rnd(-3,3), cy=50+rnd(-2,2), s=v.scale||1;
  g.save(); g.translate(cx,cy); g.scale(s,s*1.05); g.rotate(rnd(-.04,.04));
  const sk=g.createRadialGradient(0,-6,4,0,0,46); sk.addColorStop(0,'#e8e0d0'); sk.addColorStop(.6,'#a89e8c'); sk.addColorStop(1,'#1a1412'); g.fillStyle=sk; g.beginPath(); g.ellipse(0,0,31,44,0,0,Math.PI*2); g.fill();
  g.fillStyle='rgba(30,20,18,.55)'; g.beginPath(); g.ellipse(-24,4,8,30,0,0,Math.PI*2); g.ellipse(24,4,8,30,0,0,Math.PI*2); g.fill();
  for(const sx of [-1,1]){ g.fillStyle='#000'; g.beginPath(); g.ellipse(sx*12,-10,8+rnd(0,1.5),11,sx*.25,0,Math.PI*2); g.fill(); g.fillStyle='rgba(0,0,0,.6)'; g.fillRect(sx*12-2,-1,3,14); g.fillStyle=v.red?'#ff2010':'#ff3a2a'; g.fillRect(sx*12-1+rnd(-1,1),-11,2,2); }
  g.fillStyle='#000'; g.beginPath(); g.ellipse(0,22,10,v.open?19:12,0,0,Math.PI*2); g.fill(); g.fillStyle='#d8ccb0'; for(let i=-8;i<=8;i+=3){ g.fillRect(i,22-(v.open?17:10),2,4+(i%2?2:0)); g.fillRect(i+1,22+(v.open?14:8),2,3); }
  g.strokeStyle='rgba(40,10,8,.8)'; g.lineWidth=.7; g.beginPath(); g.moveTo(-6,-40); g.lineTo(-3,-26); g.lineTo(-8,-18); g.moveTo(14,-38); g.lineTo(9,-28); g.stroke(); g.restore();
  const img=g.getImageData(0,0,160,90), d=img.data; for(let i=0;i<d.length;i+=4){ const n=(Math.random()-.5)*70; d[i]+=n; d[i+1]+=n; d[i+2]+=n; if(v.red){ d[i+1]*=.35; d[i+2]*=.3; } } g.putImageData(img,0,0);
  g.fillStyle='rgba(0,0,0,.35)'; for(let y=0;y<90;y+=2) g.fillRect(0,y,160,1); for(let i=0;i<3;i++){ const y=Math.random()*90|0; g.drawImage(scareCv,0,y,160,4,rnd(-8,8),y,160,4); } }
function scareFace(scale){ if(!SETTINGS.scares||RM) return; AU.stinger(); shake(12); hurtV=1; const seq=[[0,{scale:scale||1,open:0}],[70,{scale:(scale||1)*1.25,open:1}],[150,null],[190,{scale:(scale||1)*1.6,open:1,red:1}],[300,null]];
  for(const [ms,v] of seq) setTimeout(()=>{ if(v){ scareCv.style.display='block'; drawScareFace(v); } else scareCv.style.display='none'; },ms); }
function groundType(){ const pool=Object.keys(L.def.enemies||{}).filter(t=>['ghoul','hound','crawler','husk','penitent','hanged'].includes(t)); return pool.length?pick(pool):'ghoul'; }
function scareBehind(){ const side=-P.face; for(let d=24;d<=60;d+=12) if(solidPx(P.x+side*d,P.y-8)||solidPx(P.x+side*d,P.y-20)||!solidPx(P.x+side*d,P.y+4)) return false; SCARE.busy=true; AU.whisper(1.6); fadeTarget=.32; SCARE.dim=1; const ex=P.x+side*46, ey=P.y-22;
  fx.push({t:0,dur:1.7,draw(f){ if(f.t<.5) return; const a=Math.min(1,(f.t-.5)*3); ectx.fillStyle=`rgba(255,40,30,${a.toFixed(2)})`; for(const o of [-3,3]) ectx.fillRect(ex+o-camR.x,ey-camR.y,2,1); addLight(ex,ey,20,.5*a,1,.1,.05); }});
  setTimeout(()=>{ if(fadeTarget<1&&!cut) fadeTarget=1; SCARE.dim=0; SCARE.busy=false; if(mode!=='play'||!L||L.def.kind!=='dungeon') return; AU.bossScream('minor',{vol:.9}); AU.stinger(); shake(9); impactT=.08;
    const n=ri(2,3)+Math.min(2,ngp); for(let i=0;i<n;i++){ const x=P.x+side*(30+i*12); if(solidPx(x,P.y-8)||solidPx(x,P.y-20)) continue; const m=mkEnemyAt(groundType(),x,findFloor(x,P.y-10)); m.face=-side; m.state='chase'; m.atkCd=.35; m.vx=-side*80; enemies.push(m); ash(m.x,m.y-8,14); } },1700); return true; }
function drawWatcher(c,w){ const j=w.fade>0?rnd(-1,1):0; c.fillStyle='#050304'; c.fillRect(-3+j,-44,6,30); c.fillRect(-2,-14,2,14); c.fillRect(1,-14,2,14); c.fillRect(-5,-42,2,30); c.fillRect(3,-42,2,30); c.fillRect(-6,-14,2,5); c.fillRect(4,-14,2,5);
  c.fillStyle='#d6cebc'; c.fillRect(-3+j,-52,6,8); c.fillStyle='#050304'; c.fillRect(-2+j,-49,1,2); c.fillRect(1+j,-49,1,2); c.fillRect(-1+j,-46,2,1); }
function scareWatcher(){ const dir=R()<.7?P.face:-P.face; for(const sgn of [dir,-dir]){ const x=P.x+sgn*rnd(170,215), fy=findFloor(x,P.y-20); if(Math.abs(fy-P.y)<40&&!solidPx(x,fy-10)&&!solidPx(x,fy-40)){ SCARE.watcher={x,y:fy,t:0,fade:0,lunge:R()<.4}; AU.whisper(1.2); return true; } } return false; }
function updWatcher(dt){ const w=SCARE.watcher; if(!w) return; w.t+=dt;
  if(w.fade>0){ w.fade-=dt; if(w.fade<=0) SCARE.watcher=null; return; }
  const near=Math.abs(P.x-w.x)<95; if(near||w.t>8){ if(near&&w.lunge){ SCARE.watcher=null; scareFace(.9); return; } w.fade=.25; AU.glitch(); ash(w.x,w.y-30,16); for(let i=0;i<12;i++) part({x:w.x+rnd(-4,4),y:w.y-rnd(0,52),vx:rnd(-80,80),vy:rnd(-20,20),g:0,life:.25,em:true,col:'#e8e0d0'}); } }
function drawScareWorld(){ const w=SCARE.watcher; if(!w) return; blit(c=>drawWatcher(c,w),w.x,w.y,Math.sign(P.x-w.x)||1,{alpha:w.fade>0?w.fade*4:Math.min(1,w.t*1.5)}); emisAt(w.x,w.y,1,g=>{ g.fillStyle='rgba(255,255,240,.9)'; g.fillRect(-2,-49,1,1); g.fillRect(1,-49,1,1); }); }
function scareTick(dt){ if(!L||!SETTINGS.scares) return; updWatcher(dt); if(L.def.kind!=='dungeon'||SCARE.busy||SCARE.watcher||SCARE.n>=SCARE.max||P.dead) return; SCARE.cd-=dt; if(SCARE.cd>0) return;
  const close=enemies.some(e=>!e.dead&&Math.abs(e.x-P.x)<170&&Math.abs(e.y-P.y)<90); if(close||!P.onGround){ SCARE.cd=3; return; }
  const r=R(); let ok=true; if(r<.42) ok=scareWatcher(); else if(r<.8) ok=scareBehind()||scareWatcher(); else scareFace(1);
  if(!ok){ SCARE.cd=4; return; } SCARE.n++; SCARE.cd=rnd(50,90)/(1+ngp*.3); }
(function(){ const o=addLight; addLight=function(wx,wy,r,i,cr,cg,cb){ if(SCARE.dim>0){ r*=.55; i*=.3; } o(wx,wy,r,i,cr,cg,cb); }; })();
(function(){ const o=update; update=function(dt){ o(dt); scareTick(dt); }; })();
(function(){ const o=drawEnemies; drawEnemies=function(){ drawScareWorld(); o(); }; })();
(function(){ const o=frame; frame=function(now){ o(now); updFinPrompt(); }; })();
(function(){ const o=loadLevel; loadLevel=function(idx,opt){ const r=o(idx,opt); SCARE.cd=rnd(30,55)/(1+ngp*.25); SCARE.n=0; SCARE.max=ngp?3:2; SCARE.watcher=null; SCARE.busy=false; SCARE.dim=0; scareCv.style.display='none'; return r; }; })();

/* ---------- a new descent announces itself ---------- */
(function(){ const o=goLevel; let told=-1; goLevel=function(i){ o(i); if(i===1&&ngp>0&&told!==ngp){ told=ngp; setTimeout(()=>toast(`${typeof diffLabel==='function'?diffLabel():'Descent '+runName(ngp)}. More of them now. The marked ones carry fire, frost, rot and worse — and shrug off their own.`),1600); } }; })();

/* ---------- pause toggle ---------- */
{ const cb=$('#pScare'); if(cb){ cb.checked=!!SETTINGS.scares; cb.onchange=()=>{ SETTINGS.scares=cb.checked; store.set('marrowdeep.settings',SETTINGS); }; } }
