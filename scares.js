'use strict';
/* ===== scares (v16) =====
   - A new scream: four detuned saw voices pushed through three vowel formants and a distortion curve, rising and then
     breaking into a fast flutter, over a breath of noise and a sub thump. It replaces the old stinger on the face.
   - The face is no longer one face. Six of them, never the same twice in a row: the original, a face of many eyes,
     a sewn mouth, a hanged face upside down, a ring of teeth, and a face pressing out through the stone.
   - Some ordinary chests are Coffer-Maws (15%, 10% on the first descent; never reliquaries or hidden chests). Open one
     and it leaps out screaming. Kill it and it coughs up a reliquary. A careful eye can catch a chest breathing first.
   - Wall-Born (beasts.js) burst out of the stone with the same scream.
   - In co-op only the host spawns the foes behind you, so guests no longer get foes that vanish a moment later. */
AU.shriek2=function(vol){ if(!this.c) return; const c=this.c, t=c.currentTime, v=vol==null?1:vol;
  const ws=c.createWaveShaper(); const n=1024, cv=new Float32Array(n); for(let i=0;i<n;i++){ const x=i/n*2-1; cv[i]=Math.tanh(x*4.5); } ws.curve=cv;
  const g=c.createGain(); g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.55*v,t+.03); g.gain.setValueAtTime(.55*v,t+.5); g.gain.exponentialRampToValueAtTime(.0001,t+1.25);
  const mix=c.createGain(); mix.gain.value=.35; mix.connect(ws); ws.connect(g); this.out(g,.45);
  const fm=[[880,7],[1450,8],[2550,9]].map(([f,q])=>{ const b=c.createBiquadFilter(); b.type='bandpass'; b.frequency.setValueAtTime(f*.8,t); b.frequency.linearRampToValueAtTime(f*1.15,t+.3); b.Q.value=q; b.connect(mix); return b; });
  const lfo=c.createOscillator(); lfo.frequency.setValueAtTime(7,t); lfo.frequency.linearRampToValueAtTime(26,t+.5); const lg=c.createGain(); lg.gain.setValueAtTime(15,t); lg.gain.linearRampToValueAtTime(80,t+.6); lfo.connect(lg); lfo.start(t); lfo.stop(t+1.3);
  for(const d of [-18,-6,7,19]){ const o=c.createOscillator(); o.type='sawtooth'; o.detune.value=d; o.frequency.setValueAtTime(480,t); o.frequency.exponentialRampToValueAtTime(1180,t+.22); o.frequency.exponentialRampToValueAtTime(980,t+1.2); lg.connect(o.frequency); for(const b of fm) o.connect(b); o.start(t); o.stop(t+1.3); }
  this.noise(.9,5200,1300,1.4,.4*v,'bandpass',.6); this.tone('sine',90,38,.45,.6*v,.4); };
/* the face, in six kinds */
const FACE_KINDS=['classic','eyes','stitch','hang','maw','wall']; let lastFace='';
function grain(g,red){ const img=g.getImageData(0,0,160,90), d=img.data; for(let i=0;i<d.length;i+=4){ const n=(Math.random()-.5)*70; d[i]+=n; d[i+1]+=n; d[i+2]+=n; if(red){ d[i+1]*=.35; d[i+2]*=.3; } } g.putImageData(img,0,0);
  g.fillStyle='rgba(0,0,0,.35)'; for(let y=0;y<90;y+=2) g.fillRect(0,y,160,1); for(let i=0;i<3;i++){ const y=Math.random()*90|0; g.drawImage(scareCv,0,y,160,4,rnd(-8,8),y,160,4); } }
function skin(g,rx,ry){ const sk=g.createRadialGradient(0,-6,4,0,0,Math.max(rx,ry)*1.05); sk.addColorStop(0,'#e8e0d0'); sk.addColorStop(.6,'#a89e8c'); sk.addColorStop(1,'#1a1412'); g.fillStyle=sk; g.beginPath(); g.ellipse(0,0,rx,ry,0,0,Math.PI*2); g.fill(); }
function drawFaceKind(v){ if(v.kind==='classic'){ drawScareFace(v); return; } const g=SG; g.setTransform(1,0,0,1,0,0); g.fillStyle=v.red?'#140000':'#000'; g.fillRect(0,0,160,90);
  const s=v.scale||1; g.save(); g.translate(80+rnd(-3,3),50+rnd(-2,2)); g.scale(s,s*1.05); g.rotate(rnd(-.05,.05));
  if(v.kind==='eyes'){ skin(g,34,44); for(let i=0;i<14;i++){ const a=i*2.4, r=6+(i%5)*5, x=Math.cos(a)*r*.9, y=Math.sin(a)*r*1.1-4; g.fillStyle='#f4eee0'; g.beginPath(); g.ellipse(x,y,4,2.6+v.open,0,0,Math.PI*2); g.fill(); g.fillStyle=v.red?'#ff2010':'#1a0606'; g.beginPath(); g.arc(x+rnd(-1,1),y,1.6,0,Math.PI*2); g.fill(); } }
  else if(v.kind==='stitch'){ skin(g,30,43); g.strokeStyle='#120808'; g.lineWidth=2; for(const sx of [-1,1]){ g.beginPath(); g.moveTo(sx*12-5,-15); g.lineTo(sx*12+5,-5); g.moveTo(sx*12+5,-15); g.lineTo(sx*12-5,-5); g.stroke(); }
    g.fillStyle='#2a0606'; g.fillRect(-14,18,28,v.open?10:3); g.strokeStyle='#d8ccb0'; g.lineWidth=1; for(let x=-12;x<=12;x+=4){ g.beginPath(); g.moveTo(x,15); g.lineTo(x+1,v.open?30:23); g.stroke(); } if(v.open){ g.fillStyle='#000'; g.fillRect(-4,20,8,8); } }
  else if(v.kind==='hang'){ g.rotate(Math.PI); skin(g,30,42); g.strokeStyle='#4a3a2a'; g.lineWidth=3; g.beginPath(); g.moveTo(-30,26); g.lineTo(30,30); g.stroke(); g.beginPath(); g.moveTo(0,40); g.lineTo(0,90); g.stroke();
    for(const sx of [-1,1]){ g.fillStyle='#000'; g.beginPath(); g.ellipse(sx*11,-8,6,9,0,0,Math.PI*2); g.fill(); g.fillStyle='#ffffff'; g.fillRect(sx*11-1,-9,2,2); }
    g.fillStyle='#000'; g.beginPath(); g.ellipse(0,18,8,v.open?14:7,0,0,Math.PI*2); g.fill(); g.fillStyle='#7a1a20'; g.fillRect(-3,18,6,v.open?30:12); }
  else if(v.kind==='maw'){ g.fillStyle='#3a0606'; g.beginPath(); g.ellipse(0,0,46,36,0,0,Math.PI*2); g.fill(); g.fillStyle='#000'; g.beginPath(); g.ellipse(0,4,30*(.6+v.open*.4),22*(.5+v.open*.5),0,0,Math.PI*2); g.fill();
    for(let i=0;i<22;i++){ const a=i/22*Math.PI*2, r1=38, r2=26*(.6+v.open*.4); g.fillStyle='#e8dcc0'; g.beginPath(); g.moveTo(Math.cos(a-.12)*r1,Math.sin(a-.12)*r1*.8); g.lineTo(Math.cos(a)*r2,Math.sin(a)*r2*.8); g.lineTo(Math.cos(a+.12)*r1,Math.sin(a+.12)*r1*.8); g.fill(); }
    g.fillStyle=v.red?'#ff2010':'#ffd27a'; g.fillRect(-20,-30,3,3); g.fillRect(17,-30,3,3); }
  else if(v.kind==='wall'){ g.fillStyle='#2a2428'; g.fillRect(-90,-60,180,120); g.strokeStyle='#120e10'; g.lineWidth=1; for(let y=-60;y<60;y+=12){ g.beginPath(); g.moveTo(-90,y); g.lineTo(90,y); g.stroke(); for(let x=(y/12)%2?-90:-78;x<90;x+=24){ g.beginPath(); g.moveTo(x,y); g.lineTo(x,y+12); g.stroke(); } }
    skin(g,26,36); g.fillStyle='rgba(42,36,40,.55)'; g.beginPath(); g.ellipse(0,0,26,36,0,0,Math.PI*2); g.fill();
    for(const sx of [-1,1]){ g.fillStyle='#000'; g.beginPath(); g.ellipse(sx*10,-8,5+v.open*2,4+v.open*4,0,0,Math.PI*2); g.fill(); g.fillStyle='#fff'; g.fillRect(sx*10-1,-8,1,1); }
    g.fillStyle='#000'; g.beginPath(); g.ellipse(0,18,7,v.open?16:5,0,0,Math.PI*2); g.fill(); g.strokeStyle='#120e10'; g.lineWidth=1.5; for(let i=0;i<8;i++){ g.beginPath(); const a=i*.8; g.moveTo(Math.cos(a)*26,Math.sin(a)*36); g.lineTo(Math.cos(a)*44,Math.sin(a)*58); g.stroke(); } }
  g.restore(); grain(g,v.red); }
/* the full-screen face, any kind, now with the scream */
scareFace=function(scale,kind){ if(!SETTINGS.scares||RM) return; if(!kind){ const ks=FACE_KINDS.filter(k=>k!==lastFace); kind=pick(ks); } lastFace=kind; AU.shriek2(1); AU.stinger(); shake(12); hurtV=1; const sc=scale||1;
  const seq=[[0,{scale:sc,open:0,kind}],[70,{scale:sc*1.25,open:1,kind}],[150,null],[190,{scale:sc*1.6,open:1,red:1,kind}],[320,null]];
  for(const [ms,v] of seq) setTimeout(()=>{ if(v){ scareCv.style.display='block'; drawFaceKind(v); } else scareCv.style.display='none'; },ms); };
/* a shorter flash for creatures that leap out (only one frame of face, then the creature itself) */
function scareFlash(kind){ if(!SETTINGS.scares||RM) return; lastFace=kind; scareCv.style.display='block'; drawFaceKind({scale:1.3,open:1,kind,red:1}); setTimeout(()=>{ scareCv.style.display='none'; },110); }
/* co-op guests: no local foes behind you (the host's would replace them a moment later) */
(function(){ const o=scareBehind; scareBehind=function(){ if(typeof COOP!=='undefined'&&COOP&&!NET.host) return false; return o(); }; })();

/* ---------- Coffer-Maws ---------- */
const MIMIC_P=()=>ngp===0?.1:.15;
(function(){ const o=loadLevel; loadLevel=function(idx,opt){ const r=o(idx,opt); if(!L||L.def.kind==='cabin'||L.def.kind==='boss') return r;
  const v=typeof LVVAR!=='undefined'?LVVAR.v%9973:0; for(const c of chests){ if(c.tier===0&&!c.secret&&!c.falling&&hsh(c.x*.37+v,c.y*.11+idx)<MIMIC_P()) c.mimic=1; }
  return r; }; })();
function mimicBurst(c,spawn){ if(!c||c.open) return; c.open=true; c.t=0; AU.shriek2(1.1); AU.boom(.8); shake(10); impactT=.06; scareFlash('maw');
  for(let i=0;i<20;i++) part({x:c.x+rnd(-8,8),y:c.y-10,vx:rnd(-160,160),vy:rnd(-220,-60),g:500,life:rnd(.4,.9),col:pick(['#5a3a1e','#e8dcc0','#6a0e10'])});
  if(spawn){ const e=mkEnemyAt('mimic',c.x,c.y); e.face=Math.sign(P.x-c.x)||1; e.state='leap'; e.st=.15; e.vy=-320; e.vx=e.face*170; enemies.push(e); }
  unlockCodex('mimic'); toast('It was never a chest.'); if(mode==='case'||mode==='card'){ mode='play'; hud.hidden=false; } }
(function(){ const o=openChest; openChest=function(c){ if(!c||c.open||!c.mimic) return o(c);
  if(typeof COOP!=='undefined'&&COOP&&NET.seats.length>=2&&!NET.host) return o(c); /* the host decides (hostChest below) */
  mimicBurst(c,true); if(typeof COOP!=='undefined'&&COOP&&NET.host) bcast({t:'mim',ep:NET.epoch,ci:chests.indexOf(c)}); }; })();
(function(){ const o=hostChest; hostChest=function(ci,s,mf){ const c=chests[ci]; if(c&&c.mimic&&!c.open){ mimicBurst(c,true); bcast({t:'mim',ep:NET.epoch,ci}); return; } return o(ci,s,mf); }; })();
(function(){ const o=onMsg; onMsg=function(s,m){ if(m&&m.t==='mim'){ if(!NET.host&&m.ep===NET.epoch) mimicBurst(chests[m.ci],false); return; } return o(s,m); }; })();
(function(){ const o=killEnemy; killEnemy=function(e,dir,crit){ const was=e.dead; o(e,dir,crit); if(!was&&e.dead&&e.type==='mimic'){ dropChest(e,1); toast('The Coffer-Maw coughs up what it swallowed.'); } }; })();
/* the tell: now and then a Coffer-Maw breathes, or a single eye opens under the lid */
(function(){ const o=drawEnemies; drawEnemies=function(){ o(); for(const c of chests){ if(!c.mimic||c.open) continue; const ph=(time+c.x*.01)%5.5; if(ph>.6) continue;
  const sx=c.x-camR.x, sy=c.y-camR.y; ectx.fillStyle=`rgba(255,210,120,${(1-ph/.6).toFixed(2)})`; ectx.fillRect(Math.round(sx+3),Math.round(sy-11),1,1); if(ph<.3){ ctx.fillStyle='rgba(120,20,20,.8)'; ctx.fillRect(Math.round(sx-2),Math.round(sy-9),1,2); } } }; })();
