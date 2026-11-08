'use strict';
/* ===== the journey (v24): the map, and old saves =====
   The map (M, and between levels) is no longer a cross-section of the Pit: it is the whole road. Kesh in the east,
   the March across the surface, Hollowmere on its hill, the palace bridge, the long fall, and the climb back up under
   the palace. Old saves (v23 and before) point into the old level order; they are moved to the matching place. */
function journeyNodes(){ const N=[]; const n=LEVELS.length; for(let i=0;i<n;i++){ const d=LEVELS[i]; if(d.kind==='cabin') continue;
    let x,y; const a=d.act; const inAct=LEVELS.slice(0,i).filter(o=>o.act===a).length;
    if(a==='Prologue'){ x=22; y=48; }
    else if(a==='Act I'){ x=46+inAct*21; y=46+Math.sin(inAct*.9)*6; }
    else if(a==='Act II'){ x=262+inAct*17; y=44-inAct*1.4; }
    else if(a==='Act III'){ const P_=[[430,236],[392,242],[338,214],[300,176],[318,124]]; [x,y]=P_[Math.min(inAct,4)]; }
    else { x=420; y=26; }
    N[i]=[x,y]; } return N; }
drawMap=function(from,to,k){ const cv_=$('#mapCv'), g=cv_.getContext('2d'); g.setTransform(2,0,0,2,0,0); g.imageSmoothingEnabled=false; const NODES_=journeyNodes();
  const sky=g.createLinearGradient(0,0,0,70); sky.addColorStop(0,'#1a0606'); sky.addColorStop(1,'#4a2a20'); g.fillStyle=sky; g.fillRect(0,0,480,70);
  g.fillStyle='#ff3a2a'; g.globalAlpha=.22; g.beginPath(); g.ellipse(380,14,60,7,0,0,Math.PI*2); g.fill(); g.globalAlpha=1;
  const earth=g.createLinearGradient(0,60,0,270); earth.addColorStop(0,'#2a2018'); earth.addColorStop(1,'#080506'); g.fillStyle=earth; g.fillRect(0,60,480,210);
  for(let i=0;i<8;i++){ g.fillStyle=i%2?'rgba(60,44,36,.35)':'rgba(30,22,20,.4)'; g.beginPath(); g.moveTo(0,80+i*24); for(let x=0;x<=480;x+=20) g.lineTo(x,80+i*24+Math.sin(x*.03+i*1.7)*5); g.lineTo(480,94+i*24); g.lineTo(0,94+i*24); g.fill(); }
  /* the March: fields, fen, salt, the pass, the fort */
  const band=(x0,x1,col)=>{ g.fillStyle=col; g.fillRect(x0,56,x1-x0,6); }; band(40,100,'#6a6a3a'); band(100,140,'#2e3a24'); band(140,180,'#a08860'); band(180,222,'#5a606a'); band(222,256,'#4a4642');
  g.fillStyle='#4a4642'; for(let x=182;x<222;x+=8){ g.beginPath(); g.moveTo(x,58); g.lineTo(x+4,46); g.lineTo(x+8,58); g.fill(); }
  /* Hollowmere on its hill, the palace, the bridge */
  g.fillStyle='#1a1418'; g.beginPath(); g.moveTo(256,62); g.quadraticCurveTo(340,20,460,58); g.lineTo(460,62); g.fill(); for(let x=262;x<450;x+=7){ g.fillRect(x,40-((x*13)%9)-(x>400?10:0),5,24); }
  g.fillRect(410,12,26,30); g.fillRect(405,8,6,10); g.fillRect(432,6,6,12);
  /* the Pit under the city */
  g.fillStyle='#050304'; g.beginPath(); g.moveTo(440,62); g.bezierCurveTo(470,150,450,262,380,262); g.lineTo(300,250); g.bezierCurveTo(250,220,270,140,300,62); g.lineTo(316,62); g.bezierCurveTo(290,140,300,210,340,226); g.lineTo(400,232); g.bezierCurveTo(440,226,452,150,428,62); g.fill();
  g.fillStyle='rgba(255,60,30,.12)'; g.beginPath(); g.ellipse(380,240,60,14,0,0,Math.PI*2); g.fill();
  const ids=NODES_.map((n,i)=>i).filter(i=>NODES_[i]);
  g.strokeStyle='rgba(216,204,176,.35)'; g.setLineDash([2,3]); g.lineWidth=1; g.beginPath(); ids.forEach((i,j)=>{ const [x,y]=NODES_[i]; if(j&&LEVELS[i].act==='Act III'&&LEVELS[ids[j-1]].act==='Act II'){ g.moveTo(x,y); } else j?g.lineTo(x,y):g.moveTo(x,y); }); g.stroke(); g.setLineDash([]);
  /* the fall, dotted red, from the bridge to the bottom */
  const bi=LEVELS.findIndex(d=>d.id==='gideon'), oi=LEVELS.findIndex(d=>d.id==='ossuary'); if(bi>=0&&oi>=0){ g.strokeStyle='rgba(200,40,30,.5)'; g.setLineDash([1,3]); g.beginPath(); g.moveTo(...NODES_[bi]); g.lineTo(...NODES_[oi]); g.stroke(); g.setLineDash([]); }
  g.strokeStyle='rgba(200,40,30,.9)'; g.lineWidth=1.5; g.beginPath(); for(let j=0;j<ids.length;j++){ const i=ids[j]; if(i>to) break; const [x,y]=NODES_[i]; if(i>from&&i===to&&j>0){ const [px,py]=NODES_[ids[j-1]]; g.lineTo(lerp(px,x,k),lerp(py,y,k)); break; } j?g.lineTo(x,y):g.moveTo(x,y); } g.stroke();
  g.font='7px "IM Fell English SC", Georgia, serif'; g.textBaseline='middle';
  const curI=(from===to||k>=1)?to:from;
  ids.forEach(i=>{ const [x,y]=NODES_[i], def=LEVELS[i], boss=def.kind==='boss', done=i<curI, cur=i===curI; const r=boss?3.5:2.5;
    g.fillStyle=done?'#8a1a14':cur?'#ff5a3a':'#2a2220'; g.strokeStyle=cur?'#fff1d8':done?'#c9a96a':'#5a4e48'; g.lineWidth=1; g.beginPath(); if(boss){ g.moveTo(x,y-r-1); g.lineTo(x+r+1,y); g.lineTo(x,y+r+1); g.lineTo(x-r-1,y); g.closePath(); } else g.arc(x,y,r,0,Math.PI*2); g.fill(); g.stroke();
    if(cur){ g.strokeStyle=`rgba(255,90,60,${(.4+.4*Math.sin(time*5)).toFixed(2)})`; g.beginPath(); g.arc(x,y,r+4,0,Math.PI*2); g.stroke(); } });
  const label=(i,strong)=>{ if(!NODES_[i]) return; const [x,y]=NODES_[i], def=LEVELS[i]; const below=def.act==='Act I'||def.act==='Act II'||def.act==='Prologue'; const ly=below?y+13:y-9; g.textAlign=x>400?'right':x<60?'left':'center';
    g.fillStyle=strong?'#fff1d8':'#a89a88'; g.fillText(def.name,x,ly); g.fillStyle=def.kind==='boss'?'#c8322a':'#8a7e72'; g.fillText(`${def.act} · Lv ${mlvl(i)}`,x,ly+8); };
  label(curI,true); if(to!==from) label(to,true);
  g.textAlign='left'; g.font='7px "IM Fell English SC", Georgia, serif'; g.fillStyle='#8d827a'; g.fillText('The March',96,74); g.fillText('Hollowmere',330,74); g.fillText('The Marrowdeep',282,262);
  g.font='12px "Pirata One", Georgia, serif'; g.fillStyle='#dccfb2'; g.fillText('The Road Home',14,232); g.font='7px "IM Fell English SC", Georgia, serif'; g.fillStyle='#8d827a'; g.fillText(`${DIFFS[tierNow()].jp} ${DIFFS[tierNow()].n} · monster level ${tierRange(tierNow()).join('–')}`,14,246);
  const a=NODES_[from], b=NODES_[to]||a; const [ax,ay]=from===to?b:[lerp(a[0],b[0],k),lerp(a[1],b[1],k)]; g.fillStyle='#fff1d8'; g.fillRect(ax-1,ay-9,3,6); g.fillStyle='#141012'; g.fillRect(ax-1,ay-11,3,2); };

/* ---------- old saves ---------- */
function migrateSave(sv){ if(!sv||sv.camp) return sv; sv.lvlIdx=migrateIdx(sv.lvlIdx||0); if(sv.meta&&sv.meta.reach) for(const k in sv.meta.reach) sv.meta.reach[k]=migrateIdx(sv.meta.reach[k]); sv.camp=24; return sv; }
(function(){ const o=loadSave; loadSave=function(){ return migrateSave(o()); }; })();
(function(){ const o=slotWhere; slotWhere=function(d){ if(d&&!d.camp){ const L_=LEVELS[migrateIdx(d.lvlIdx||0)]; return L_?L_.name:'—'; } return o(d); }; })();
