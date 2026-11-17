'use strict';
/* ===== v50: foes that answer the Marrow (BT, 17 Nov: "make the gameplay reflect the use of the new skills and
   systems … maybe we need an overhaul on mob abilities") =====
   v46–v48 built 273 tree nodes round ten damage types, and the foes didn't know. A scarecrow took fire the way a
   drowned man did. This is talents-plan section 5 (points 2–5), started:
   1. Foes react to a type by what they are (RX_T). The first hit of that type, and again every few seconds:
        Scarecrow + fire   Tinder: it goes up and runs, leaving fire behind it
        Hound + fire       Panic: it bolts, burning, through whatever is in the way
        Crows + wind       Scattered: the whole flock is knocked out of the air
        Rider + lightning  Spooked: the horse throws him
        Drowner + lightning  Conducts: it arcs to every wet thing near
        Drowner + cold     Bog-frozen: frozen at once
        Leech + fire/holy  Shrivels · Marsh Lantern + water/wind  Doused
        Fen Hag + holy     Unhexed: stunned, and she can't cast for a while
        Salt Wraith + water  Dissolves · + wind  Scattered
        Buried + holy      Laid to rest · Hollowed + holy  The oath slips: he flinches and takes 40% more for 3 s
        Zealot + fire      The oil catches: his own flask goes off among his friends · + water  Doused
        anything flying + wind  Grounded · anything standing in water + lightning  Conducts
   2. Regions lean (REGION_EL): the foes of a region are weak to one type (+30%) and resist another (30%), and the
      level says so when you arrive.
   3. Element shrines: one in each Act I and II dungeon level. Put a hand in and your blows carry that region's weak
      type for 40 s, so every hero can try the types (and see the reactions) before the tree gives them one.
   4. Officers in the packs. Where three or more stand together, about half the eligible foes (a few a level):
        旗 Banner-bearer  everything within 110 px of him takes 45% less and doesn't flinch. Kill him first.
        角 Horn-blower    winds a horn for two seconds; if nobody stops him (any stun, a freeze, a kill) the region's
                          set piece comes now, or three more of his kind do.
   5. Weight. v49 found hit-stop capped at 25 ms everywhere. Heavy blows, ranked kills and breaking a boss now get a
      short slow-motion beat instead (hitSlowT in ui.js; never in co-op, never with reduced motion).
   RX holds the numbers. */
const RX={cd:3.5,weak:1.3,res:.3,infuse:40,ban:.55,banR:110,horn:1.9,every:9};
/* v52: only soldiers carry a banner or a horn (villagers, beggars, nobles and servants were getting them) */
const RX_ARMY=new Set(['footman','pikeman','guard','handknight','archer','buried','zealot','knight','taker','engineer','rider','penitent','husk']);
const REGION_EL={meadow:['fire','poison'],fen:['shock','water'],ashes:['water','fire'],pass:['fire','cold'],fort:['holy','shadow'],villages:['holy','blood'],slums:['fire','poison'],oldcity:['shock','holy'],royal:['shadow','blood'],bridge:['wind','shock']};
const rxSeen=(()=>{ try{ return store.get('marrowdeep.rx')||{}; }catch(e){ return {}; } })();
function rxPop(e,jp,name,col){ try{ const d=document.createElement('div'); d.className='cpop t1'; d.innerHTML=`<b>${jp}</b>${name}`; d.style.setProperty('--tc',col||'#ffd27a'); cpLayer.appendChild(d); cpops.push({el:d,x:e.x,y:e.y-e.h-8,t:0}); }catch(err){} }
function rxTip(k,t){ if(rxSeen[k]) return; rxSeen[k]=1; try{ store.set('marrowdeep.rx',rxSeen); }catch(e){} toast(t,1); }
const rxNear=(e,r)=>enemies.filter(o=>o!==e&&!o.dead&&!o.boss&&!o.intro&&Math.abs(o.x-e.x)<r&&Math.abs(o.y-e.y)<r*.6);
function rxConduct(e,d){ const tg=rxNear(e,120).filter(o=>o.type==='drowner'||o.wet||hasSt(o,'soak')).slice(0,5); for(const o of tg){ zap(e.x,e.y-e.h/2,o.x,o.y-o.h/2); stOf(o).shock={t:2}; hurt(o,d*.9,Math.sign(o.x-e.x)||1,30); } if(tg.length) AU.noise(.1,6000,2000,2,.14,'bandpass',.2); return ['導','Conducts']; }
function rxGround(e){ e.stun=Math.max(e.stun||0,1.8); e.vy=260; e.vx*=.2; return ['墜','Grounded']; }
const RX_T={
  scarecrow:{fire(e,d){ e.tinder=2.6; e.state='chase'; setBurn(e,d*1.2); return ['藁','Tinder']; }},
  hound:{fire(e,d){ e.panic=2.2; e.tinder=2.2; return ['狂','Panic']; }},
  crow:{wind(e,d){ for(const c of [e].concat(rxNear(e,150).filter(o=>o.type==='crow'))){ c.state='flock'; c.fly=true; c.stun=1.6; c.vy=220; if(c!==e) hurt(c,Math.max(2,d*.8),1,40); } return ['散','Scattered']; }},
  rider:{shock(e){ if(!e.mounted) return null; e.mounted=0; e.type='pikeman'; e.w=12; e.h=26; e.name='Unhorsed Rider'; e.state='chase'; e.stun=1.4; e.vy=-180; dust(e.x,e.y,16); AU.slam(); return ['驚','Spooked']; }},
  drowner:{shock:rxConduct,cold(e){ freezeFoe(e,2.2); return ['凍','Bog-frozen']; }},
  leech:{fire(e){ hurt(e,999); return ['縮','Shrivels']; },holy(e){ hurt(e,999); return ['縮','Shrivels']; }},
  lantern:{water(e){ hurt(e,999); return ['消','Doused']; },wind(e){ hurt(e,999); return ['消','Blown out']; }},
  fenhag:{holy(e){ e.stun=Math.max(e.stun||0,1.6); e.atkCd=Math.max(e.atkCd||0,4.5); return ['祓','Unhexed']; }},
  saltwraith:{water(e,d){ hurt(e,d*1.5,1,0); e.stun=Math.max(e.stun||0,.8); return ['溶','Dissolves']; },wind(e){ e.stun=Math.max(e.stun||0,1.4); e.alpha=1; return ['散','Scattered']; }},
  buried:{holy(e,d){ hurt(e,d*1.2,1,0); e.stun=Math.max(e.stun||0,.6); return ['鎮','Laid to rest']; }},
  footman:{holy(e){ e.oathT=time+3; e.stun=Math.max(e.stun||0,.9); return ['誓','The oath slips']; }},
  pikeman:{holy(e){ e.oathT=time+3; e.stun=Math.max(e.stun||0,.9); return ['誓','The oath slips']; }},
  zealot:{fire(e,d){ const dm=Math.max(8,d*2.2); for(const o of rxNear(e,46)) hurt(o,dm,Math.sign(o.x-e.x)||1,120); hurt(e,dm,1,60); AU.boom(.4); shake(4); for(let i=0;i<18;i++) part({x:e.x,y:e.y-14,vx:rnd(-150,150),vy:rnd(-200,-30),g:500,life:rnd(.3,.6),em:true,col:pick(['#ffd27a','#ff8a3a'])}); addFlame(e.x,e.y,d*.5,2.6); return ['油','The oil catches']; },
    water(e){ e.atkCd=Math.max(e.atkCd||0,5); return ['湿','Doused']; }} };
const RX_TIP={'scarecrow.fire':'Scarecrows are straw. Fire sends them running, and what they run through burns.','hound.fire':'A burning hound bolts. Point it at its friends.','crow.wind':'Wind knocks a whole flock of crows out of the air.','rider.shock':'Lightning spooks the horse. The rider comes off.',
  'drowner.shock':'The drowned are always wet. Lightning runs from one to every wet thing near it.','drowner.cold':'The drowned freeze at the first touch of cold.','fenhag.holy':'Holy blows break a hag\'s hex and keep her from casting.','saltwraith.water':'Salt wraiths come apart in water.',
  'zealot.fire':'A zealot carries oil. Fire sets his own flask off among his friends.','footman.holy':'A holy blow loosens the Hollowed\'s oath: he flinches, and takes more for a moment.','fly.wind':'Wind puts anything that flies on the ground.','wet.shock':'Lightning runs through anything standing in water.'};
(function(){ const o=applyElem; applyElem=function(e,k,d,dir){ if(e&&!e.dead&&!e.boss&&!(typeof spProp==='function'&&spProp(e))){ if(e.weak===k) d*=RX.weak;
    let key=e.type+'.'+k, fn=RX_T[e.type]&&RX_T[e.type][k]; if(!fn&&k==='wind'&&e.fly){ fn=rxGround; key='fly.wind'; } if(!fn&&k==='shock'&&e.wet){ fn=rxConduct; key='wet.shock'; }
    if(fn&&!((e._rx||0)>time)){ e._rx=time+RX.cd; const r=fn(e,d,dir); if(r){ rxPop(e,r[0],r[1],ELEM[k].c); if(RX_TIP[key]) rxTip(key,RX_TIP[key]); else if(key.startsWith('pikeman')) rxTip('footman.holy',RX_TIP['footman.holy']); if(e.dead) return 0; } } }
  return o(e,k,d,dir); }; })();
/* burning runners, the oath, the banner */
(function(){ const o=updEnemy; updEnemy=function(e,dt){ if(e.dead||e.boss) return o(e,dt);
  if(e.tinder>0){ e.tinder-=dt; e.fk=(e.fk||0)-dt; if(e.fk<=0&&e.onGround){ e.fk=.16; addFlame(e.x,e.y,Math.max(2,e.dmg*.35),2.2); } }
  if(e.panic>0&&!(e.stun>0)){ e.panic-=dt; e.face=-(Math.sign(P.x-e.x)||1); e.vx=e.face*e.spd*1.35; e.vy+=900*dt; moveBody(e,dt); if(e.hitWall) e.face=-e.face; e.anim+=dt; e.walk=(e.walk||0)+dt*12; e.flash-=dt; return; }
  if(e.officer==='horn'){ e.hornCd=(e.hornCd==null?rnd(1.5,3.5):e.hornCd)-dt;
    if(e.hornT>0){ if(e.stun>0||hasSt(e,'frozen')){ e.hornT=0; e.hornCd=8; rxPop(e,'黙','Silenced','#9a948a'); } else { e.hornT-=dt; e.vx=0; e.vy+=900*dt; moveBody(e,dt); e.anim+=dt; e.flash-=dt; e.face=Math.sign(P.x-e.x)||e.face; if(e.hornT<=0){ e.hornCd=18; rxHornCall(e); } return; } }
    else if(e.hornCd<=0&&!e.intro&&e.onGround&&!(e.stun>0)&&Math.abs(P.x-e.x)<250&&Math.abs(P.y-e.y)<80&&!P.dead){ e.hornT=RX.horn; if(typeof spHorn==='function') spHorn(.7); rxTip('horn','A horn-blower. Stop him before the horn is done: stun him, freeze him, or kill him.'); } }
  return o(e,dt); }; })();
function rxHornCall(e){ rxPop(e,'角','The horn is answered','#ff8a5a'); AU.roar(); if(typeof SD!=='undefined'&&SD&&!STG.off&&typeof stQuiet==='function'&&stQuiet()){ SD.t=Math.min(SD.t,.3); return; }
  if(typeof stSpawn!=='function') return; const t=EDEF[e.type]?e.type:'ghoul'; for(let i=0;i<3;i++){ const x=clamp(e.x+(i-1)*26+Math.sign(e.x-P.x)*40,2*T,(L.w-2)*T), fy=findFloor(x,e.y-40); if(Math.abs(fy-e.y)<40&&!solidPx(x,fy-12)) stSpawn(t,x,fy,m=>{ ash(m.x,m.y-8,10); }); } }
(function(){ const o=dmgEnemy; dmgEnemy=function(e,d,crit,dir,kb,heavy,launch,stun){ if(e&&!e.dead&&!e.boss){
    if((e.oathT||0)>time) d=Math.round(d*1.4);
    if(!e.officer){ const b=enemies.find(m=>m.officer==='banner'&&!m.dead&&Math.abs(m.x-e.x)<RX.banR&&Math.abs(m.y-e.y)<70); if(b){ d=Math.max(1,Math.round(d*RX.ban)); kb=0; launch=false; stun=false; e._ban=time; if(!(e._bs>time)){ e._bs=time+.15; sparks(e.x,e.y-e.h*.6,2,'#c8b890'); } rxTip('banner','A banner-bearer: everything near him takes less and doesn\'t flinch. Kill him first.'); } }
    if(typeof hitSlowT!=='undefined'&&!RM&&!(typeof COOP!=='undefined'&&COOP)&&(heavy||crit)&&d>0&&!(rxLastSlow>time)){ rxLastSlow=time+.3; hitSlowT=Math.max(hitSlowT,.06); } }
  return o(e,d,crit,dir,kb,heavy,launch,stun); }; })();
let rxLastSlow=0;
(function(){ const o=killEnemy; killEnemy=function(e,dir,crit){ if(e&&!e.dead&&!e.boss&&(e.champ||e.rare||e.unique||e.officer)&&typeof hitSlowT!=='undefined'&&!RM&&!(typeof COOP!=='undefined'&&COOP)) hitSlowT=Math.max(hitSlowT,.2); return o(e,dir,crit); }; })();
(function(){ const o=bossBreak; bossBreak=function(e,dur){ if(typeof hitSlowT!=='undefined'&&!RM&&!(typeof COOP!=='undefined'&&COOP)) hitSlowT=Math.max(hitSlowT,.3); return o(e,dur); }; })();

/* ---------- regions lean; officers in the packs; shrines ---------- */
(function(){ const o=mkEnemy; mkEnemy=function(s){ const e=o(s); const le=L&&L.def&&REGION_EL[L.def.look]; if(e&&le&&!e.boss){ e.weak=le[0]; e.res=Object.assign({},e.res); e.res[le[1]]=Math.min(.75,(e.res[le[1]]||0)+RX.res); } return e; }; })();
(function(){ const o=loadLevel; loadLevel=function(idx,opt){ const r=o(idx,opt); if(!L) return r; const d=L.def, le=REGION_EL[d.look]; L.shrines=[];
  if(d.kind==='dungeon'){ /* officers */ const ok=e=>RX_ARMY.has(e.type)&&!e.dead&&!e.boss&&!e.fly&&e.h>=20&&!NO_RANK.has(e.type)&&!e.champ&&!e.rare&&!e.unique&&!e.ceil&&e.state!=='hang'&&e.type!=='scarecrow'&&e.type!=='debtor'; let n=0;
    enemies.forEach((e,i)=>{ if(!ok(e)||hsh(i*31+idx,77)>4.5/RX.every) return; const near=enemies.filter(m=>m!==e&&!m.dead&&!m.officer&&Math.abs(m.x-e.x)<160&&Math.abs(m.y-e.y)<50).length; if(near<2) return; n++;
      if(n%2){ e.officer='banner'; e.hp=e.maxhp=e.hp*1.4; e.name='Banner-bearer'; } else { e.officer='horn'; e.name='Horn-blower'; } e.xp=Math.round(e.xp*2); });
    /* a shrine */ if(le&&L.rooms&&L.rooms.length>2){ const fin=L.rooms[L.rooms.length-1], spots=[]; const g=(x,y)=>L.g[y]&&L.g[y][x]===1&&[1,2,3].every(k=>L.g[y-k]&&L.g[y-k][x]===0);
      for(let y=4;y<L.h-1;y++) for(let x=Math.floor(L.w*.25);x<L.w*.75;x++){ if(!g(x,y)||!g(x-1,y)||!g(x+1,y)) continue; if(x>=fin.x*RW&&x<(fin.x+1)*RW&&y>=fin.y*RH&&y<(fin.y+1)*RH) continue; if(L.arenas.some(a=>x*T>a.x0-T&&x*T<a.x1+T&&y*T>a.y0&&y*T<=a.y1+T)) continue; if((L.traps||[]).some(t=>Math.abs((t.x||0)-x*T)<40&&Math.abs((t.y||0)-y*T)<40)) continue; spots.push([x,y]); }
      if(spots.length){ const [x,y]=spots[Math.floor(hsh(idx*13+spots.length,L.w)*spots.length)]; L.shrines.push({x:x*T+8,y:y*T,el:le[0],used:0}); } }
    if(le&&mode!=='title') setTimeout(()=>{ if(L&&L.def===d&&mode==='play') toast(`Foes of ${d.name}: weak to ${ELEM[le[0]].jp} ${ELEM[le[0]].n}, resist ${ELEM[le[1]].jp} ${ELEM[le[1]].n}.`,1); },3200); }
  if(P&&P.infuse){ P.infuse=null; calcStats(); } return r; }; })();
function rxUseShrine(sh){ sh.used=1; sh.t=time; P.infuse={el:sh.el,until:time+RX.infuse}; calcStats(); AU.cast(); AU.bell&&AU.bell(); shake(4); const c=ELEM[sh.el].c; for(let i=0;i<24;i++){ const a=i/24*6.283; part({x:sh.x,y:sh.y-14,vx:Math.cos(a)*90,vy:Math.sin(a)*90-30,g:0,life:.6,em:true,col:c}); }
  showBossName(ELEM[sh.el].n,ELEM[sh.el].jp,`Your blows carry it for ${RX.infuse} seconds.`); toast(`${ELEM[sh.el].jp} ${ELEM[sh.el].n} is on your blows. ${ELEM[sh.el].does.split('. ')[0]}.`,1); }
(function(){ const o=findInteract; findInteract=function(){ const r=o(); for(const sh of (L&&L.shrines)||[]){ if(sh.used) continue; const dx=Math.abs(sh.x-P.x), dy=Math.abs(sh.y-P.y); if(dx<22&&dy<24) return {o:sh,txt:`<kbd>E</kbd> Put your hand in the ${ELEM[sh.el].n} shrine`,act:()=>rxUseShrine(sh)}; } return r; }; })();
(function(){ const o=calcStats; calcStats=function(){ const r=o(); const f=P&&P.infuse; if(f&&f.until>time&&P.stats){ const s=P.stats, v=Math.max(2,Math.round(wAvg()*.3)); s.elm=s.elm||{}; for(const h of ['main','off']){ s.elm[h]=Object.assign({},s.elm[h]); s.elm[h][f.el]=(s.elm[h][f.el]||0)+v; } } return r; }; })();
(function(){ const o=update; update=function(dt){ o(dt); const f=P&&P.infuse; if(!f) return; if(f.until<=time){ P.infuse=null; calcStats(); toast(`The ${ELEM[f.el].n} leaves your blade.`,0); return; } if(R()<.25) part({x:P.x+rnd(-6,6),y:P.y-rnd(4,26),vx:rnd(-8,8),vy:rnd(-30,-10),g:-10,life:.5,em:true,col:ELEM[f.el].c}); }; })();
/* drawing: shrines behind the fighters, officers' marks over them */
(function(){ const o=drawHazards; drawHazards=function(){ o(); for(const sh of (L&&L.shrines)||[]){ const sx=Math.round(sh.x-camR.x), sy=Math.round(sh.y-camR.y); if(sx<-30||sx>W+30||sy<-30||sy>H+40) continue; const c=ELEM[sh.el], gl=.5+.5*Math.sin(time*2.6);
    let drawn=false; try{ if(typeof TreeArt!=='undefined'&&TreeArt.environment){ TreeArt.environment(ctx,'shrine-'+sh.el,sx,sy,time,{state:sh.used?'used':'dormant',reducedMotion:RM}); drawn=true; } }catch(err){ drawn=false; }
    if(!drawn){ rect(ctx,sx-9,sy-4,18,4,'#3a3432'); rect(ctx,sx-6,sy-13,12,9,'#4a4442'); rect(ctx,sx-8,sy-15,16,3,'#5a5452'); rect(ctx,sx-6,sy-13,1,9,'#6a6462'); rect(ctx,sx-4,sy-16,8,2,sh.used?'#2a2624':c.c); }
    if(!sh.used){ ectx.fillStyle=`rgba(${c.rgb[0]},${c.rgb[1]},${c.rgb[2]},${(.35+gl*.4).toFixed(2)})`; ectx.fillRect(sx-3,sy-18-Math.round(gl*2),6,3); ectx.font='bold 8px "Shippori Mincho",serif'; ectx.textAlign='center'; ectx.fillText(c.jp,sx,sy-24-Math.round(gl*2)); addLight(sh.x,sh.y-16,56,.5+gl*.3,c.rgb[0]/255,c.rgb[1]/255,c.rgb[2]/255); } } }; })();
(function(){ const o=drawEnemies; drawEnemies=function(){ o(); for(const e of enemies){ if(!e.officer||e.dead) continue; const sx=Math.round(e.x-camR.x), top=Math.round(e.y-e.h-camR.y); if(sx<-40||sx>W+40) continue;
    if(e.officer==='banner'){ const bx=sx-e.face*5; rect(ctx,bx,top-20,1,24,'#3a2a1c'); for(let i=0;i<4;i++){ const w=Math.round(Math.sin(time*5+i*.8)*1.5); rect(ctx,bx+1+i*3,top-20+w,3,9-i,'#8a1414'); rect(ctx,bx+1+i*3,top-20+w,3,1,'#c03a2a'); } rect(ctx,bx-1,top-22,3,2,'#d8b24a');
      ectx.strokeStyle=`rgba(200,60,40,${(.16+.08*Math.sin(time*3)).toFixed(2)})`; ectx.lineWidth=1; ectx.setLineDash([3,5]); ectx.beginPath(); ectx.ellipse(sx,Math.round(e.y-camR.y)-2,RX.banR,9,0,0,7); ectx.stroke(); ectx.setLineDash([]);
      for(const m of enemies){ if(m===e||m.dead||m.boss||!((m._ban||0)>time-.4)) continue; ectx.strokeStyle='rgba(200,60,40,.35)'; ectx.beginPath(); ectx.moveTo(sx,top-12); ectx.lineTo(m.x-camR.x,m.y-m.h*.6-camR.y); ectx.stroke(); } }
    else { rect(ctx,sx+e.face*6,top-6,6,2,'#c8a85a'); rect(ctx,sx+e.face*6+(e.face>0?5:-1),top-8,2,5,'#e0c878'); if(e.hornT>0){ const k=1-e.hornT/RX.horn; for(let i=0;i<3;i++){ const kk=(k*2.2+i*.33)%1; ectx.strokeStyle=`rgba(255,150,80,${((1-kk)*.6).toFixed(2)})`; ectx.lineWidth=1; ectx.beginPath(); ectx.arc(sx+e.face*9,top-6,4+kk*26,0,7); ectx.stroke(); }
        rect(ectx,sx-12,top-14,24,2,'rgba(40,10,8,.8)'); rect(ectx,sx-12,top-14,Math.round(24*k),2,'#ff7a4a'); } } } }; })();
