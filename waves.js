'use strict';
/* ===== the last chamber: every dungeon level ends in a room that seals until three waves are dead =====
   The exit stays barred until the chamber is cleared, so nobody can sprint past a level.
   It reuses the Blood Arena machinery (gates, waves, the reliquary that drops at the end). */
const FINAL_WAVES=3;
function finalLevel(def){ return def&&def.kind!=='boss'&&def.kind!=='cabin'&&def.kind!=='surface'; }
(function(){ const o=loadLevel; loadLevel=function(idx,opt){ const r=o(idx,opt); const def=LEVELS[idx];
  if(finalLevel(def)&&L.rooms&&L.rooms.length){ const rm=L.rooms[L.rooms.length-1], ox=rm.x*RW, oy=rm.y*RH;
    L.arenas.push({ox,oy,x0:(ox+1)*T,x1:(ox+RW-1)*T,y0:(oy+1)*T,y1:(oy+15)*T,state:0,wave:0,waves:FINAL_WAVES,final:1});
    L.locked=true; L.finalArena=L.arenas[L.arenas.length-1]; }
  return r; }; })();

/* where a foe can stand in the chamber: solid floor, two tiles of air above, no spikes, lava or water */
function chamberSpots(a){ const out=[]; for(let x=a.ox+2;x<a.ox+RW-2;x++){ for(let y=a.oy+3;y<=a.oy+15;y++){
    const v=tileAt(x,y), up=tileAt(x,y-1), up2=tileAt(x,y-2); if((v===1||v===2)&&up===0&&up2===0){ out.push([x,y]); break; } } }
  return out; }
/* the last chamber's foes rise out of the floor instead of dropping from the ceiling, so low ceilings and pits are safe */
(function(){ const o=spawnWave; spawnWave=function(a){ if(!a.final) return o(a);
  a.wave++; const def=L.def; const n=ngp===0?2+a.wave+Math.floor(dep()/4):4+a.wave*2+Math.min(ngp,4)*3+Math.floor(dep()/3); a.list=[]; AU.roar(); shake(4);
  showBossName(`The last chamber · wave ${a.wave} of ${a.waves}`,['一','二','三'][a.wave-1]||'',a.wave===a.waves?'Kill them and the way up opens.':'The door above stays shut.');
  const spots=chamberSpots(a); if(!spots.length){ a.next=1; return; }
  for(let i=0;i<n;i++){ const pk=def.packs?pick(def.packs).t:wpick(def.enemies); const t=(pk==='hanged'||pk==='spitter'||pk==='anchor'||pk==='relicx')?'ghoul':pk; const fly=EDEF[t].fly; const [sx,sy]=pick(spots);
    const e=mkEnemy({x:sx+.5,y:sy,t,pack:i>1?1:0,leader:a.wave===a.waves&&i===0?1:0}); e.x=sx*T+8; e.y=fly?(sy-4)*T:sy*T; e.hy=e.y; e.atkCd=1+R()*1.2; e.stun=.5;
    a.list.push(e); enemies.push(e); ash(e.x,sy*T-4,12); dust(e.x,sy*T,6); for(let k=0;k<6;k++) part({type:'blood',x:e.x+rnd(-6,6),y:sy*T-2,vx:rnd(-40,40),vy:rnd(-160,-60),g:520,life:rnd(.4,.8),col:pick(BLOOD)}); }
  if(a.wave===a.waves){ const t=wpick(def.enemies); const tt=EDEF[t].fly||t==='hanged'||t==='spitter'?'brute':t; const [sx,sy]=pick(spots); const e=mkEnemy({x:sx+.5,y:sy,t:tt}); e.x=sx*T+8; e.y=sy*T;
    if(!e.rare&&!e.champ&&!e.unique){ const ks=Object.keys(MODS).filter(k=>BASE_MODS.includes(k)); rankUp(e,'rare',[pick(ks),pick(ks)].filter((v,i,ar)=>ar.indexOf(v)===i),pick(RN1)+' '+pick(RARE2)); }
    a.list.push(e); enemies.push(e); ash(e.x,sy*T-6,20); }
  a.next=1.4; }; })();
/* when the chamber falls silent, the barred door to the next level opens */
(function(){ const o=updArenas; updArenas=function(dt){ const was=L.arenas?L.arenas.map(a=>a.state):[]; o(dt);
  if(L.arenas) L.arenas.forEach((a,i)=>{ if(a.final&&was[i]===0&&a.state===1) cutIn('hero','The last chamber','最後の間',1.3);
    if(a.final&&was[i]===1&&a.state===2) finalCleared(a); }); }; })();
function finalCleared(a){ L.locked=false; toast('The last chamber falls silent. The way up opens.'); AU.bell(); AU.door();
  for(let i=0;i<8;i++) dropGold((a.ox+RW/2)*T+rnd(-40,40),(a.oy+10)*T,Math.round(ri(3,8)*(1+dep()*.6))); }
/* walking up to the barred door says why */
(function(){ const o=findInteract; findInteract=function(){ const b=o(); if(b||!L||!L.locked||!L.finalArena||!P) return b; const ex=L.exit.x*T+8, ey=L.exit.y*T;
  if(Math.abs(P.x-ex)<26&&Math.abs(P.y-ey)<22) return {o:L.exit,txt:L.finalArena.state===0?'Barred · something waits in this room':'Barred · kill everything in the chamber',act:()=>{ AU.clang(); shake(2); }}; return b; }; })();
