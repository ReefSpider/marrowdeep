'use strict';
/* ===== v29 chests: every chest looks like it's worth opening =====
   Coffer (grey):  iron-bound oak, studded straps, a lock plate, a glint on the iron.
   Reliquary:      gilt filigree, glowing glass panels, a skull boss, two candles burning on the lid.
   Boss chest:     a black-iron sarcophagus chest twice the size, gold trim, a crowned skull, and red runes that
                   pulse. Closed, it throws a column of light and sparks. An elite's second chest burns gold.
   The new art shows up in the world and in the opening cine. */
(function(){ const o=drawChest; drawChest=function(c,ch){ const op=ch.open, tr=ch.tier; if(tr!==0&&tr!==1&&tr!==2) return o(c,ch); const tm=(typeof time!=='undefined'?time:0);
  if(tr===0){ rect(c,-10,-12,20,12,'#4b3221'); rect(c,-10,-12,20,1,'#7a5436'); for(let x=-8;x<10;x+=4) rect(c,x,-11,1,11,'#3a2618'); rect(c,-10,-1,20,1,'#24160c');
    for(const x of [-8,6]){ rect(c,x,-12,2,12,'#5a5e68'); rect(c,x,-12,2,1,'#a8acb4'); for(let y=-10;y<0;y+=3) rect(c,x,y,1,1,'#c8ccd4'); }
    rect(c,-10,-6,20,1,'#5a5e68');
    if(!op){ rect(c,-10,-17,20,5,'#5a3c27'); rect(c,-9,-18,18,1,'#7a5436'); rect(c,-10,-13,20,1,'#24160c'); for(const x of [-8,6]) rect(c,x,-18,2,6,'#5a5e68');
      rect(c,-2,-14,5,5,'#8a8e98'); rect(c,-2,-14,5,1,'#d0d4dc'); rect(c,0,-12,1,2,'#141012'); if(Math.sin(tm*2.3)>.92) rect(c,-1,-13,1,1,'#ffffff'); }
    else { rect(c,-10,-26,20,7,'#5a3c27'); rect(c,-10,-19,20,2,'#120a08'); for(const x of [-8,6]) rect(c,x,-26,2,7,'#5a5e68'); }
    return; }
  if(tr===1){ rect(c,-11,-13,22,13,'#2e2826'); rect(c,-11,-13,22,1,'#e8c25a'); rect(c,-11,-1,22,1,'#8a6a2a');
    for(const x of [-9,3]){ rect(c,x,-11,6,8,'#6a1a14'); const g=.5+.5*Math.sin(tm*3+x); rect(c,x+1,-10,4,6,g>.5?'#c84a2a':'#a83a22'); rect(c,x+2,-9,2,4,'#ffb070'); }
    rect(c,-2,-11,4,9,'#b08a3a'); rect(c,-2,-11,4,1,'#ffe1a0'); rect(c,-1,-9,2,2,'#e8e0d0'); rect(c,-1,-8,1,1,'#1a1210');
    for(let x=-11;x<11;x+=3) rect(c,x,-13,1,1,'#ffe1a0');
    if(!op){ c.fillStyle='#3a3230'; c.beginPath(); c.moveTo(-12,-13); c.lineTo(-9,-19); c.lineTo(9,-19); c.lineTo(12,-13); c.fill(); rect(c,-9,-19,18,1,'#e8c25a'); rect(c,-12,-14,24,1,'#b08a3a');
      rect(c,-1,-23,2,4,'#e8c25a'); rect(c,-3,-22,6,1,'#e8c25a'); for(const x of [-8,7]){ rect(c,x,-22,1,3,'#ece6d8'); const f=Math.sin(tm*13+x)*.5+.5; rect(c,x,-24-Math.round(f),1,2,'#ffb050'); } }
    else { rect(c,-12,-28,24,8,'#3a3230'); rect(c,-12,-20,24,2,'#120a08'); rect(c,-12,-28,24,1,'#e8c25a'); }
    return; }
  /* the boss chest */ const el=ch.elite, gold=el?'#ffd66a':'#c8a040', rune=el?'#ffe8a0':'#ff3a2a', pul=.5+.5*Math.sin(tm*3);
  rect(c,-17,-18,34,18,'#141014'); rect(c,-17,-18,34,1,gold); rect(c,-17,-1,34,1,gold); rect(c,-17,-18,1,18,gold); rect(c,16,-18,1,18,gold);
  for(let x=-14;x<15;x+=7) rect(c,x,-16,1,14,'#2a2226'); for(let i=0;i<6;i++) rect(c,-13+i*5,-6,2,1,pul>.5?rune:'#7a1410');
  rect(c,-5,-16,10,9,gold); rect(c,-4,-15,8,7,'#e8e0d0'); rect(c,-3,-13,2,2,'#120c0c'); rect(c,1,-13,2,2,'#120c0c'); rect(c,-2,-10,4,1,'#120c0c'); rect(c,-4,-18,8,2,gold); rect(c,-4,-20,1,2,gold); rect(c,0,-20,1,2,gold); rect(c,3,-20,1,2,gold);
  if(!op){ c.fillStyle='#1e181c'; c.beginPath(); c.moveTo(-18,-18); c.lineTo(-14,-27); c.lineTo(14,-27); c.lineTo(18,-18); c.fill(); rect(c,-14,-27,28,1,gold); rect(c,-18,-19,36,1,gold);
    for(let x=-12;x<13;x+=4) rect(c,x,-24,2,1,pul>.5?rune:'#5a1010'); rect(c,-1,-31,2,5,gold); rect(c,-3,-29,6,1,gold); }
  else { rect(c,-18,-40,36,10,'#1e181c'); rect(c,-18,-30,36,2,'#100a0a'); rect(c,-18,-40,36,1,gold); } }; })();
/* light, a shaft and sparks round closed chests in the world */
function chestGlow(){ if(!chests) return; for(const c of chests){ if(c.open||c.falling) continue; const sx=Math.round(c.x-camR.x), sy=Math.round(c.y-camR.y); if(sx<-40||sx>W+40||sy<-80||sy>H+20) continue;
  if(c.tier===2){ const g=c.elite?[255,214,106]:[255,90,60]; addLight(c.x,c.y-14,110,1.1,g[0]/255,g[1]/255,g[2]/255); const gr=ectx.createLinearGradient(0,sy-120,0,sy-10); gr.addColorStop(0,`rgba(${g},0)`); gr.addColorStop(1,`rgba(${g},.22)`); ectx.fillStyle=gr; ectx.fillRect(sx-12,sy-120,24,110);
    if(R()<.35) part({x:c.x+rnd(-16,16),y:c.y-rnd(4,20),vx:rnd(-8,8),vy:rnd(-60,-20),g:-10,life:.8,em:true,col:c.elite?'#ffe8a0':'#ff8a5a'}); }
  else if(c.tier===1){ addLight(c.x,c.y-12,70,.8,1,.8,.4); if(R()<.12) part({x:c.x+rnd(-10,10),y:c.y-rnd(6,18),vx:0,vy:-30,g:-5,life:.7,em:true,col:'#ffe1a0'}); }
  else addLight(c.x,c.y-8,36,.35,1,.85,.6); } }
(function(){ const o=drawHazards; drawHazards=function(){ o(); chestGlow(); }; })();
