'use strict';
/* ===== cine: anime cut-in panels, epigraph titles, toasts, in-world loot roll panels ===== */
const CUTCV=$('#cutinCv'), CUTG=CUTCV.getContext('2d'); CUTG.imageSmoothingEnabled=false;
let cutinAnim=null;
const PORTRAIT={
  hero(g,t,red){ g.fillStyle='#b48a6a'; g.beginPath(); g.moveTo(130,0); g.lineTo(196,0); g.lineTo(200,30); g.lineTo(186,60); g.lineTo(128,60); g.fill();
    g.fillStyle='#8a6550'; g.beginPath(); g.moveTo(128,0); g.lineTo(150,0); g.lineTo(146,60); g.lineTo(128,60); g.fill();
    g.fillStyle='#151012'; g.beginPath(); g.moveTo(126,0); g.lineTo(204,0); g.lineTo(200,10); g.lineTo(186,8); g.lineTo(178,14); g.lineTo(166,9); g.lineTo(156,16); g.lineTo(146,10); g.lineTo(138,18); g.lineTo(126,14); g.fill();
    g.fillStyle='#2a1a14'; g.fillRect(160,20,30,3); g.fillStyle='#e8dcc8'; g.beginPath(); g.ellipse(176,28,12,4,0,0,Math.PI*2); g.fill();
    g.fillStyle=red?'#d01a10':'#4a5260'; g.beginPath(); g.arc(178,28,4,0,Math.PI*2); g.fill(); g.fillStyle='#050203'; g.fillRect(177,25,2,6); g.fillStyle='#fff'; g.fillRect(179,26,1,1);
    g.strokeStyle='#d6a88a'; g.lineWidth=1.5; g.beginPath(); g.moveTo(168,14); g.lineTo(184,44); g.stroke(); g.fillStyle='#6a4038'; g.fillRect(170,50,16,2);
    if(red){ g.fillStyle='rgba(255,40,20,.35)'; g.beginPath(); g.arc(178,28,10+Math.sin(t*20)*2,0,Math.PI*2); g.fill(); } },
  mother(g,t){ g.fillStyle='#0c0809'; g.fillRect(110,0,100,60); for(let i=0;i<24;i++){ g.fillStyle=i%2?'#1e1618':'#140e10'; g.fillRect(112+i*4,0,2,60); }
    g.fillStyle='#2a0606'; g.fillRect(156,4,8,56); for(let i=0;i<9;i++){ g.fillStyle='#d8ccb0'; g.fillRect(156,6+i*6,3,3); g.fillRect(161,9+i*6,3,3); }
    g.fillStyle='#b9b2a4'; g.fillRect(150,0,4,8); g.fillRect(166,0,4,6); g.fillStyle='rgba(200,20,16,.7)'; g.fillRect(152,40,1,16); },
  choir(g,t){ for(let i=0;i<3;i++){ const x=120+i*42, y=8+(i%2)*6; g.fillStyle='#c9bfae'; g.beginPath(); g.ellipse(x+16,y+24,15,22,0,0,Math.PI*2); g.fill(); g.fillStyle='#120a0a'; g.fillRect(x+7,y+14,6,5); g.fillRect(x+19,y+14,6,5);
    const m=8+Math.abs(Math.sin(t*12+i))*6; g.fillStyle='#2a0606'; g.beginPath(); g.ellipse(x+16,y+34,5,m,0,0,Math.PI*2); g.fill(); } },
  tithe(g,t){ g.fillStyle='#5a4a36'; g.beginPath(); g.moveTo(120,60); g.lineTo(126,4); g.lineTo(196,0); g.lineTo(204,60); g.fill(); g.fillStyle='#3a2a1a'; for(let i=0;i<8;i++) g.fillRect(128+i*9,6+(i%3)*2,1,52);
    const X=(x,y)=>{ g.strokeStyle='#1a0a0a'; g.lineWidth=3; g.beginPath(); g.moveTo(x-6,y-6); g.lineTo(x+6,y+6); g.moveTo(x+6,y-6); g.lineTo(x-6,y+6); g.stroke(); }; X(146,24); X(178,24);
    g.fillStyle='#2a1a10'; g.fillRect(140,44,46,3); for(let i=0;i<8;i++) g.fillRect(142+i*6,41,1,9); },
  saint(g,t){ g.fillStyle='#7a2a24'; g.fillRect(110,0,100,60); g.fillStyle='#c9a96a'; g.beginPath(); g.ellipse(160,30,26,32,0,0,Math.PI*2); g.fill(); g.fillStyle='#a88a4a'; g.beginPath(); g.ellipse(152,30,10,30,0,0,Math.PI*2); g.fill();
    g.fillStyle='#1a0a06'; g.fillRect(146,22,10,3); g.fillRect(166,22,10,3); for(const [x,y] of [[140,10],[180,12],[160,50],[138,40],[184,42]]) g.fillRect(x,y,3,3);
    g.fillStyle='#8a1010'; g.fillRect(150,25,2,22+Math.sin(t*3)*2); g.fillRect(170,25,2,18); },
  count(g,t){ g.fillStyle='#1e1c22'; g.fillRect(120,10,80,50); g.fillStyle='#4a4650'; g.fillRect(120,10,80,2); g.fillStyle='#060304'; g.fillRect(132,32,56,4);
    g.fillStyle='#b08a3a'; for(let i=0;i<7;i++){ g.beginPath(); g.moveTo(122+i*12,12); g.lineTo(128+i*12,-4-(i%2)*6); g.lineTo(134+i*12,12); g.fill(); }
    g.fillStyle=`rgba(255,40,20,${(.7+.3*Math.sin(t*9)).toFixed(2)})`; g.fillRect(140,33,40,2); },
  wound(g,t){ g.fillStyle='#3a0c0a'; g.beginPath(); g.ellipse(160,30,90,30,0,0,Math.PI*2); g.fill(); g.fillStyle='#d8cbb0'; g.beginPath(); g.ellipse(160,30,76,22,0,0,Math.PI*2); g.fill();
    g.strokeStyle='#a02a20'; g.lineWidth=1; for(let i=0;i<14;i++){ const a=i/14*Math.PI*2; g.beginPath(); g.moveTo(160+Math.cos(a)*74,30+Math.sin(a)*20); g.lineTo(160+Math.cos(a)*40,30+Math.sin(a)*10); g.stroke(); }
    g.fillStyle='#c01810'; g.beginPath(); g.arc(160,30,20,0,Math.PI*2); g.fill(); g.fillStyle='#050102'; g.fillRect(157,12,6,36); }
};
function cutIn(kind,title,jp,dur){ const el=$('#cutin'); el.hidden=false; $('#cutinT').textContent=title||''; $('#cutinJ').textContent=jp||''; el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
  const t0=performance.now(), D=(dur||1.8)*1000; AU.noise(.5,400,4000,1,.3,'bandpass',.4); if(cutinAnim) cancelAnimationFrame(cutinAnim);
  const step=now=>{ const t=(now-t0)/1000; const g=CUTG; g.setTransform(1,0,0,1,0,0); g.fillStyle=kind==='hero'&&P&&P.houndT>0?'#1a0202':'#050304'; g.fillRect(0,0,320,60);
    g.strokeStyle='rgba(255,240,225,.25)'; g.lineWidth=1; for(let i=0;i<40;i++){ const a=hsh(i,Math.floor(t*14))*Math.PI*2, r0=40+hsh(i,7)*40; g.beginPath(); g.moveTo(160+Math.cos(a)*r0,30+Math.sin(a)*r0*.4); g.lineTo(160+Math.cos(a)*240,30+Math.sin(a)*96); g.stroke(); }
    (PORTRAIT[kind]||PORTRAIT.hero)(g,t,kind==='hero'&&P&&P.houndT>0);
    if(now-t0<D) cutinAnim=requestAnimationFrame(step); else { el.classList.remove('on'); setTimeout(()=>{ if(!el.classList.contains('on')) el.hidden=true; },300); cutinAnim=null; } };
  cutinAnim=requestAnimationFrame(step); }
function epigraph(id){ const e=EPIGRAPH[id]; if(!e) return; const el=$('#epi'); el.querySelector('b').textContent=e.k; el.querySelector('span').textContent=e.r; el.querySelector('em').textContent=e.t; el.classList.remove('on'); void el.offsetWidth; el.classList.add('on'); }
function toast(t){ const el=$('#toast'); const d=document.createElement('div'); d.textContent=t; el.appendChild(d); while(el.children.length>3) el.firstChild.remove(); setTimeout(()=>d.remove(),4200); }

/* ---------- loot that drops in the world rolls its stats where it lands, and time slows to watch ---------- */
let dropQ=[], dropActive=null, dropLive=[], dropSlow=0;
/* rolls play in the top right, two at a time side by side, out of the way of the fight */
function dropRoll(it,wx,wy){ if(!it||it.rarity<1||!it.aff.some(varies)) return; if(dropQ.length>3) return; dropQ.push({it,wx,wy}); nextDropRoll(); }
function nextDropRoll(){ dropLive=dropLive.filter(b=>b.isConnected); if(dropLive.length>=2) return; const d=dropQ.shift(); if(!d){ dropActive=dropLive[0]||null; return; }
  const layer=$('#drolls'); const box=document.createElement('div'); box.className='droll tt'; box._it=d.it; layer.appendChild(box); dropLive.push(box); dropActive=box;
  if(d.it.rarity>=4){ dropSlow=.5; }
  const icon=iconEl(d.it); icon.className='dri';
  statReel(d.it,box,()=>{ const q=box.querySelector('#rq'); if(q) q.hidden=false; if(!dropLive.some(b=>b!==box&&!b.classList.contains('done'))) dropSlow=0; box.classList.add('done');
    setTimeout(()=>{ box.classList.add('out'); setTimeout(()=>{ box.remove(); dropLive=dropLive.filter(b=>b!==box); if(dropActive===box) dropActive=dropLive[0]||null; nextDropRoll(); },400); },2000); },{fast:true});
  box.insertBefore(icon,box.firstChild); if(dropQ.length&&dropLive.length<2) nextDropRoll(); }
