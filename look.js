'use strict';
/* ===== look: depth and readability =====
   A haze between the far background and the level pushes the backdrop back; soft shadows under
   everyone standing on the floor sit them on it; kills never freeze the game. */
let lastKillT=-9;
(function(){ const o=killEnemy; killEnemy=function(e,dir,crit){ if(!e.dead) lastKillT=time; return o(e,dir,crit); }; })();
function drawDepthFog(){ if(!pal||!pal.sky) return; const c=hex(pal.sky[1]); const r=Math.min(255,c[0]+40), g=Math.min(255,c[1]+34), b=Math.min(255,c[2]+40);
  const gr=ctx.createLinearGradient(0,0,0,H); gr.addColorStop(0,`rgba(${r},${g},${b},.30)`); gr.addColorStop(.6,`rgba(${r},${g},${b},.18)`); gr.addColorStop(1,`rgba(${r},${g},${b},.08)`);
  ctx.fillStyle=gr; ctx.fillRect(0,0,W,H); }
function footShadow(x,y,w){ const sx=Math.round(x-camR.x), sy=Math.round(y-camR.y); if(sx<-30||sx>W+30||sy<-10||sy>H+10) return; ctx.fillStyle='rgba(0,0,0,.38)'; ctx.fillRect(sx-Math.round(w/2),sy-1,Math.round(w),2); ctx.fillStyle='rgba(0,0,0,.2)'; ctx.fillRect(sx-Math.round(w/2)-2,sy-1,2,1); ctx.fillRect(sx+Math.round(w/2),sy-1,2,1); }
(function(){ const o=drawEnemies; drawEnemies=function(){ for(const e of enemies){ if(e.dead||e.fly||e.ceil||e.boss||!e.onGround) continue; footShadow(e.x,e.y,e.w*.9); }
  if(P&&!P.dead&&P.onGround) footShadow(P.x,P.y,P.w*1.1);
  // a soft pool of light on the nearest foes so they read against the dark, without glowing edges
  if(P){ const near=enemies.filter(e=>!e.dead&&!e.boss&&Math.abs(e.x-P.x)<W*.7&&Math.abs(e.y-P.y)<H*.7).sort((a,b)=>Math.abs(a.x-P.x)-Math.abs(b.x-P.x)).slice(0,9);
    for(const e of near) addLight(e.x,e.y-e.h*.55,Math.max(26,e.h*1.25),.32,1,.86,.72); }
  o(); }; })();
