'use strict';
/* ===== v29 mob detail: helms, heads and shading =====
   BT: "the mobs need a bit more design, they look a bit simple, especially the head. Where possible give them a helm."
   - Every soldier-type foe gets a real helm: kettle hats with mail aventails for the pikemen and riders, a barbute
     with a T-visor and a red glint for the Hollowed footmen, rusted sallets for the buried dead, a crested great
     helm for the city guard, a crowned great helm for the Knights of the Hand.
   - Civilians and cultists get hoods and masks: the zealot's hood with lantern-lit eyes, the executioner's hood
     on the tithe-taker, a gilt Venetian mask and plume on the nobles, a cowl on villagers, the servant's cap.
   - The dead get uglier: weed hair and pale eyes on the drowners, stitched sack faces on the scarecrows,
     long hair and a lamp-green eye on the fen hags.
   - A shading pass on every foe: lit from above, darker towards the feet, so the flat blocks read as bodies. */
const STEEL=['#5a5e68','#8a8e98','#c8ccd4','#2a2a30'], RUST=['#5a4234','#7a5a40','#a07a54','#2a1e16'];
function hKettle(c,x,y,w,h,m){ m=m||STEEL; rect(c,x-2,y+1,w+4,1,m[3]); rect(c,x-2,y,w+4,1,m[1]); rect(c,x,y-2,w,3,m[1]); rect(c,x+1,y-3,w-2,1,m[2]); rect(c,x,y-2,1,2,m[2]);
  for(let i=0;i<w;i+=2) rect(c,x+i,y+h-1,1,2,'#6a6a72'); rect(c,x-1,y+2,1,h-1,'#6a6a72'); }
function hBarbute(c,x,y,w,h,m,glint){ m=m||STEEL; rect(c,x-1,y-1,w+2,h+1,m[0]); rect(c,x-1,y-1,w+2,1,m[2]); rect(c,x,y,1,h-1,m[1]); rect(c,x+w-4,y+2,3,1,'#050304'); rect(c,x+w-3,y+2,1,h-2,'#050304');
  if(glint) rect(c,x+w-3,y+2,1,1,glint); rect(c,x+1,y+1,1,1,m[2]); rect(c,x+1,y+h-2,1,1,m[2]); rect(c,x-1,y+h,w+2,1,m[3]); }
function hSallet(c,x,y,w,h,m){ m=m||STEEL; rect(c,x-1,y-1,w+1,h-1,m[0]); rect(c,x-1,y-1,w+1,1,m[2]); rect(c,x-3,y+h-3,3,2,m[0]); rect(c,x-3,y+h-3,3,1,m[1]); rect(c,x+1,y+2,w-1,1,'#050304'); rect(c,x,y,1,h-2,m[1]); }
function hGreat(c,x,y,w,h,m,crest){ m=m||STEEL; rect(c,x-1,y-2,w+2,h+2,m[0]); rect(c,x-1,y-2,w+2,1,m[2]); rect(c,x-1,y-2,1,h+2,m[1]); rect(c,x+1,y+2,w-1,1,'#050304'); rect(c,x+w-2,y+4,1,1,'#050304'); rect(c,x+w-2,y+6,1,1,'#050304');
  rect(c,x+Math.floor(w/2)-1,y-1,1,h+1,m[1]); if(crest){ rect(c,x+1,y-4,w-2,2,crest); rect(c,x+Math.floor(w/2)-1,y-6,2,2,crest); } }
function hHood(c,x,y,w,h,col,eye){ c.fillStyle=col; c.beginPath(); c.moveTo(x-2,y+h+1); c.lineTo(x-1,y-1); c.lineTo(x+w/2,y-3); c.lineTo(x+w+1,y); c.lineTo(x+w+1,y+h+1); c.fill();
  rect(c,x+1,y+1,w-1,h-1,'#0c0808'); if(eye){ rect(c,x+w-3,y+2,1,1,eye); rect(c,x+w-1,y+2,1,1,eye); } }
const HEADS={
  rider:(c,e)=>{ if(e.state==='wind') return; hKettle(c,-3,-35,5,5); },
  pikeman:(c,e)=>{ hKettle(c,-3,-28,7,6); },
  engineer:(c,e)=>{ hKettle(c,-3,-25,6,5,RUST); rect(c,-3,-23,6,1,'#2a2420'); rect(c,1,-23,2,1,'#8ab0c0'); },
  footman:(c,e)=>{ hBarbute(c,-4,-29,8,7,STEEL,e.state==='wind'?'#ff3a2a':'#b0141a'); rect(c,-1,-32,2,2,'#8a1016'); rect(c,-3,-33,1,2,'#8a1016'); },
  buried:(c,e)=>{ if(e.state==='buried'||e.state==='rise') return; hSallet(c,-3,-26,6,5,RUST); rect(c,-2,-27,3,1,'#cdbf9e'); rect(c,2,-24,1,1,'#ffd27a'); },
  guard:(c,e)=>{ hGreat(c,-4,-30,8,7,STEEL,'#2a2a30'); rect(c,-3,-36,6,1,'#8a1016'); for(let i=0;i<4;i++) rect(c,-4+i*2,-37-(i%2),1,2,'#8a1016'); },
  handknight:(c,e)=>{ hGreat(c,-4,-33,9,8,['#6a0a10','#8a1016','#d04040','#2a0608'],'#b8913a'); rect(c,-3,-39,1,2,'#b8913a'); rect(c,4,-39,1,2,'#b8913a'); rect(c,1,-30,2,1,'#ff5a3a'); },
  zealot:(c,e)=>{ hHood(c,-3,-25,6,6,'#3a2a20',e.state==='aim'?'#ffd27a':'#e8a040'); rect(c,-4,-19,8,1,'#5a4a30'); },
  taker:(c,e)=>{ c.fillStyle='#1a0e0a'; c.beginPath(); c.moveTo(-5,-22); c.lineTo(-4,-30); c.lineTo(0,-34); c.lineTo(4,-30); c.lineTo(5,-22); c.fill(); rect(c,0,-28,1,1,'#d8c8a0'); rect(c,3,-28,1,1,'#d8c8a0'); rect(c,-1,-26,4,1,'#3a1a10'); },
  villager:(c,e)=>{ const s=Math.floor(e.seed*7)%3; c.fillStyle=['#3a2a20','#5a4430','#4a3a2a'][s]; c.beginPath(); c.moveTo(-5,-17); c.lineTo(-4,-25); c.lineTo(1,-26); c.lineTo(4,-24); c.lineTo(4,-23); c.lineTo(-3,-23); c.lineTo(-3,-17); c.fill(); rect(c,-3,-21,1,1,'#a08870'); },
  cutpurse:(c,e)=>{ rect(c,-3,-21,6,2,'#0c0808'); rect(c,1,-20,1,1,'#d8c8a0'); rect(c,3,-20,1,1,'#d8c8a0'); rect(c,-2,-17,5,1,'#1a1612'); },
  noble:(c,e)=>{ rect(c,-3,-27,7,3,'#e8d4a0'); rect(c,-3,-27,7,1,'#b8913a'); rect(c,-1,-26,1,1,'#0a0606'); rect(c,2,-26,1,1,'#0a0606'); rect(c,4,-27,2,1,'#b8913a'); rect(c,-5,-31,10,2,'#1a0a0e'); c.fillStyle='#e8e0d0'; c.beginPath(); c.moveTo(-4,-31); c.quadraticCurveTo(-9,-36,-12,-31); c.quadraticCurveTo(-8,-33,-4,-30); c.fill(); },
  servant:(c,e)=>{ rect(c,-4,-26,8,2,'#ece6d8'); rect(c,-4,-26,8,1,'#ffffff'); rect(c,-5,-24,2,3,'#ece6d8'); rect(c,-2,-21,5,1,'#3a0a10'); },
  bellman:(c,e)=>{ rect(c,-5,-26,10,1,'#3a3e4a'); rect(c,-1,-27,2,1,'#b08a4a'); rect(c,2,-22,1,1,'#120c0c'); },
  plague:(c,e)=>{ rect(c,-6,-28,12,1,'#3a3226'); rect(c,1,-25,2,2,'#a8d070'); rect(c,1,-25,1,1,'#e8ffc0'); },
  drowner:(c,e)=>{ if(e.state==='sunk') return; for(let i=0;i<5;i++) rect(c,-4+i*2,-25,1,4+((i*3)%4),i%2?'#2e3a28':'#4a5a30'); rect(c,1,-22,1,1,'#d8e8a0'); rect(c,-1,-22,1,1,'#d8e8a0'); rect(c,-1,-20,3,1,'#2a1a14'); },
  scarecrow:(c,e)=>{ rect(c,-3,-27,6,1,'#2b302b'); for(let i=-3;i<3;i+=2) rect(c,i,-28,1,3,'#2b302b'); rect(c,-3,-30,2,2,'#2b302b'); rect(c,1,-30,2,2,'#2b302b'); rect(c,-4,-25,8,1,'#7a6a40'); },
  fenhag:(c,e)=>{ for(let i=0;i<4;i++) rect(c,-3+i*2,-24,1,10+((i*5)%6),'#141012'); rect(c,2,-22,1,1,'#c8ff60'); },
  beggar:(c,e)=>{ const b=Math.min(4,(e.swell||0)*5); c.fillStyle='#5a5a2a'; c.beginPath(); c.moveTo(-4,-12-b); c.lineTo(-4,-18-b); c.lineTo(0,-19-b); c.lineTo(4,-18-b); c.lineTo(4,-15-b); c.lineTo(3,-17-b); c.lineTo(-3,-17-b); c.lineTo(-3,-12-b); c.fill(); }
};
for(const k in HEADS){ const o=EDRAW[k]; if(!o) continue; EDRAW[k]=function(c,e){ o(c,e); try{ HEADS[k](c,e); }catch(_){} }; }
/* the shading pass: only on the sprite buffers blit() draws into, never on a shared canvas */
function shadeSprite(c,h){ const sp=(typeof SCRS!=='undefined'&&c===SCRS.sc)||(typeof SCRB!=='undefined'&&c===SCRB.sc); if(!sp) return;
  c.save(); c.globalCompositeOperation='source-atop'; const g=c.createLinearGradient(0,-h-6,0,2); g.addColorStop(0,'rgba(255,240,220,.10)'); g.addColorStop(.35,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(0,0,0,.32)'); c.fillStyle=g; c.fillRect(-40,-h-30,80,h+34); c.restore(); }
for(const k of Object.keys(EDRAW)){ const o=EDRAW[k]; EDRAW[k]=function(c,e){ o(c,e); shadeSprite(c,(EDEF[k]&&EDEF[k].h)||24); }; }
