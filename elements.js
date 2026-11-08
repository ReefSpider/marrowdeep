'use strict';
/* ===== damage types, their combinations, and the run ladder =====
   Ten damage types ride on weapons, rings and amulets (one per item) and on elites.
   Each leaves a status on what it hits. When a second type lands on a status left by another,
   the two combine: some combinations are devastating, a few work against you.
   The main weapon's type rides main-hand blows, the off weapon's rides off-hand blows, jewellery rides both,
   so a Drowning off hand and a Shocking main hand is a plan, not an accident. */
const ELEM={
  fire:  {n:'Fire',     jp:'火',c:'#ff7a2a',rgb:[255,122,42], mod:'Fire Enchanted',     st:'Burning',
    does:'Sets foes alight. Burning foes leave fire on the ground as they move, and the fire catches anything that walks through it, so a crowd burns from one spark. Foes that die burning leave a pyre.',
    you:'You burn for a few seconds.'},
  cold:  {n:'Cold',     jp:'氷',c:'#8fd0ff',rgb:[143,208,255],mod:'Cold Enchanted',     st:'Chilled · Frozen',
    does:'Each hit chills and slows. Three chills freeze a foe solid; frozen foes take 40% more. Kill one while it is frozen and it shatters into ice shards that cut the ones behind it.',
    you:'You are slowed.'},
  shock: {n:'Lightning',jp:'雷',c:'#fff3a0',rgb:[255,243,160],mod:'Lightning Enchanted',st:'Shocked',
    does:'Arcs from the foe you hit to the two nearest, and leaves them all Shocked: 15% more damage from everything.',
    you:'Drains your grit. Soaked, it hurts half again as much.'},
  water: {n:'Water',    jp:'水',c:'#4aa8ff',rgb:[74,168,255], mod:'Drowned',            st:'Soaked',
    does:'Hits like a wave and shoves foes back. Leaves them Soaked and slower. On its own it is the weakest type; it exists to be combined.',
    you:'You are Soaked: slower, and lightning hurts more.'},
  poison:{n:'Poison',   jp:'毒',c:'#8fe050',rgb:[143,224,80], mod:'Plague-Bearer',      st:'Rotting',
    does:'All of its damage comes over time, and it stacks up to five times. Foes that die rotting burst into a cloud that rots everything inside it.',
    you:'A stacking rot on you.'},
  holy:  {n:'Holy',     jp:'聖',c:'#ffe6a8',rgb:[255,230,168],mod:'Hallowed',           st:'Sanctified',
    does:'Double damage to champions, rares, uniques and bosses. Every fourth holy hit on a foe calls down Judgement: a pillar of light that strikes everything nearby and heals you a little.',
    you:'Cuts through your armour and knocks you back.'},
  shadow:{n:'Shadow',   jp:'影',c:'#a070ff',rgb:[160,112,255],mod:'Shadow-Wreathed',    st:'Marked',
    does:'Marks the foe. When a marked foe dies it bursts in a bloom of blood that tears into everything around it, and marked foes caught in the bloom burst too. Also slips past a raised guard.',
    you:'Your life steal stops for a few seconds.'},
  blood: {n:'Blood',    jp:'血',c:'#d0352c',rgb:[208,53,44],  mod:'Hemophage',          st:'Bleeding',
    does:'Opens wounds that bleed and stack. Every drop they lose comes back to you as life.',
    you:'You bleed.'},
  wind:  {n:'Wind',     jp:'風',c:'#c8e8d8',rgb:[200,232,216],mod:'Gale-Born',          st:'Airborne',
    does:'Hurls foes away and up. Throw them into spikes, lava and each other. Wind also carries other types: it spreads fire and rot.',
    you:'Throws you hard.'},
  bone:  {n:'Bone',     jp:'骨',c:'#e2d6b8',rgb:[226,214,184],mod:'Ossified',           st:'Brittle',
    does:'Each hit makes the foe Brittle: 8% more damage taken per stack, up to five. At five stacks it splinters, firing bone shards into everything nearby.',
    you:'You are Brittle and take more damage.'}
};
const ELEMS=Object.keys(ELEM);
for(const k of ELEMS) if(k!=='fire') MODS[k]=ELEM[k].mod;
const BASE_MODS=['fast','stone','fire','vamp','blink','cursed','split'];

/* ---------- the run ladder ---------- */
function eliteChance(kind){ const D=dep();
  if(kind==='champ') return ngp===0?0:Math.min(.32,.07+ngp*.04+D*.003);
  if(kind==='rare')  return ngp===0?0:Math.min(.22,.045+ngp*.03+D*.002);
  if(kind==='lead')  return ngp===0?0:Math.min(.85,.45+ngp*.15);
  if(kind==='unique')return ngp===0?0:Math.min(.95,.7+ngp*.1);
  return 0; }
function extraFoes(){ return ngp===0?0:Math.min(5,1+Math.floor(ngp*1.5)); }
function runName(n){ return ['I','II','III','IV','V','VI','VII','VIII','IX','X'][n]||String(n+1); }
function giveElem(e,k){ e.elems=e.elems||[]; if(e.elems.includes(k)) return; e.elems.push(k); e.res=e.res||{}; e.res[k]=.7;
  e.mods=e.mods||[]; if(!e.mods.includes(k)) e.mods.push(k); e.dmg*=1.15; }
decorateEnemy=function(e,s){
  if(s.unique!=null){ const u=UNQ_MON[s.unique]; rankUp(e,'unique',u.mods.slice(),u.name); }
  else if(!s.pack&&!s.guard&&!e.champ&&!NO_RANK.has(e.type)&&R()<eliteChance('rare')){
    const pool=ngp?BASE_MODS.concat(ELEMS.filter(k=>k!=='fire')):BASE_MODS; const n=ngp?Math.min(4,2+Math.floor(ngp/2)):ri(1,2); const m=[];
    while(m.length<n){ const k=pick(pool); if(!m.includes(k)) m.push(k); } rankUp(e,'rare',m,pick(RN1)+' '+pick(RARE2)); }
  if(e.mods) for(const k of e.mods.slice()) if(ELEM[k]) giveElem(e,k);
  if(ngp>0&&(e.champ||e.rare||e.unique)&&!(e.elems&&e.elems.length)&&R()<(e.champ?.8:1)) giveElem(e,pick(ELEMS));
  if(ngp>1&&(e.rare||e.unique)&&e.elems&&R()<.5) giveElem(e,pick(ELEMS.filter(k=>!e.elems.includes(k))));
  if(ngp>0&&e.champ){ e.hp*=1+ngp*.15; e.maxhp=e.hp; } };
function elemRim(e){ const k=e.elems&&e.elems[0]; return k?ELEM[k].rgb:null; }
function elemSummary(s){ return ELEMS.filter(k=>s[k]).map(k=>`<span style="color:${ELEM[k].c}">+${s[k]} ${ELEM[k].n.toLowerCase()}</span>`).join(' '); }

/* ---------- statuses on enemies ---------- */
const ST_EL={burn:'fire',chill:'cold',frozen:'cold',shock:'shock',soak:'water',rot:'poison',sanct:'holy',mark:'shadow',bleed:'blood',gale:'wind',brittle:'bone'};
const stOf=e=>e.sts||(e.sts={});
const hasSt=(e,k)=>!!(e.sts&&e.sts[k]&&e.sts[k].t>0);
const elOn=(e,el)=>e.sts?Object.keys(e.sts).some(k=>ST_EL[k]===el&&e.sts[k].t>0):false;
function clearEl(e,el){ if(!e.sts) return; for(const k in e.sts) if(ST_EL[k]===el) delete e.sts[k]; }
const wAvg=()=>P?(P.stats.min+P.stats.max)/2*(1+(P.lvl-1)*.05):5;
const resOf=(e,k)=>(e.res&&e.res[k])||0;
const ranked=e=>e.champ||e.rare||e.unique||e.boss;
const live=(x,y,r,not)=>enemies.filter(o=>o!==not&&!o.dead&&!o.intro&&Math.hypot(o.x-x,(o.y-o.h/2)-y)<r);
const ctr=e=>[e.x,e.y-e.h/2];
let curEl=null;
function hurt(o,n,dir,kb,col){ if(o.dead||n<1) return; if(curEl) o.lastHit={el:curEl,t:time,combo:1}; dmgEnemy(o,Math.round(n),false,dir||Math.sign(o.x-P.x)||1,kb==null?60:kb,false); }
function burst(x,y,n,col,sp,g){ for(let i=0;i<n;i++){ const a=R()*Math.PI*2, v=rnd(30,sp||160); part({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-30,g:g==null?120:g,life:rnd(.25,.6),em:true,col}); } }
function zap(x0,y0,x1,y1,col,w){ const len=Math.hypot(x1-x0,y1-y0)||1, nx=-(y1-y0)/len, ny=(x1-x0)/len, b1=rnd(-.18,.18)*len, b2=rnd(-.12,.12)*len;
  const c1x=lerp(x0,x1,.33)+nx*b1, c1y=lerp(y0,y1,.33)+ny*b1, c2x=lerp(x0,x1,.66)+nx*b2, c2y=lerp(y0,y1,.66)+ny*b2;
  fx.push({t:0,dur:.38,draw(f){ const grow=Math.min(1,f.t/.08), k=f.t<.08?1:1-(f.t-.08)/(f.dur-.08); if(k<=0) return; const g=ectx;
    g.save(); g.lineCap='round'; g.lineJoin='round'; g.setLineDash([len*1.3*grow,9999]);
    const path=()=>{ g.beginPath(); g.moveTo(x0-camR.x,y0-camR.y); g.bezierCurveTo(c1x-camR.x,c1y-camR.y,c2x-camR.x,c2y-camR.y,x1-camR.x,y1-camR.y); };
    path(); g.strokeStyle=`rgba(140,180,255,${(.22*k).toFixed(3)})`; g.lineWidth=(w||1)+3; g.stroke();
    path(); g.strokeStyle=`rgba(255,250,230,${(.85*k).toFixed(3)})`; g.lineWidth=w||1; g.stroke(); g.restore();
    if(grow>=1) addLight(x1,y1,34,.45*k,.8,.85,1); }}); }

/* ground fire and rot clouds */
let flames=[], clouds=[];
function addFlame(x,y,pow,life){ if(flames.length>48) flames.shift(); const fy=findFloor(x,y-4); if(Math.abs(fy-y)>20) return; flames.push({x,y:fy,pow,t:0,life:life||2.4,tk:0}); }
function addCloud(x,y,r,pow,life,col){ if(clouds.length>12) clouds.shift(); clouds.push({x,y,r,pow,t:0,life:life||3,tk:0,col:col||[120,190,60]}); }
function updGround(dt){
  for(const f of flames){ f.t+=dt; f.tk-=dt; if(f.tk<=0){ f.tk=.3; for(const o of enemies){ if(o.dead||o.intro||o.fly) continue; if(Math.abs(o.x-f.x)<9&&Math.abs(o.y-f.y)<10) setBurn(o,f.pow); } } }
  flames=flames.filter(f=>f.t<f.life);
  for(const c of clouds){ c.t+=dt; c.tk-=dt; if(c.tk<=0){ c.tk=.5; for(const o of live(c.x,c.y,c.r)) addRot(o,c.pow); } }
  clouds=clouds.filter(c=>c.t<c.life); }
function drawGround(){ let li=0;
  for(const f of flames){ const sx=f.x-camR.x, sy=f.y-camR.y; if(sx<-20||sx>W+20||sy<-30||sy>H+20) continue; const k=Math.min(1,(f.life-f.t)/.5)*Math.min(1,f.t*6);
    for(let i=0;i<4;i++){ const h=(3+Math.abs(Math.sin(time*13+f.x*.3+i*2))*6)*k; ectx.fillStyle=i%2?`rgba(255,200,90,${(.85*k).toFixed(2)})`:`rgba(255,90,30,${(.8*k).toFixed(2)})`; ectx.fillRect(Math.round(sx-5+i*3),Math.round(sy-h),2,Math.round(h)); }
    if(li++%3===0) addLight(f.x,f.y-6,40,.7*k,1,.5,.2); if(R()<.08) part({x:f.x+rnd(-4,4),y:f.y-6,vx:rnd(-6,6),vy:-rnd(20,50),g:-10,life:.6,em:true,col:'#ffb060'}); }
  for(const c of clouds){ const sx=c.x-camR.x, sy=c.y-camR.y; if(sx<-80||sx>W+80) continue; const k=Math.min(1,(c.life-c.t)/.6)*Math.min(1,c.t*4); const [r,g,b]=c.col;
    for(let i=0;i<6;i++){ const a=time*.6+i*1.05, rr=c.r*(.45+.25*Math.sin(time*1.3+i)); ctx.fillStyle=`rgba(${r>>1},${g>>1},${b>>1},${(.1*k).toFixed(3)})`; ctx.beginPath(); ctx.arc(sx+Math.cos(a)*c.r*.35,sy+Math.sin(a)*c.r*.25,rr,0,Math.PI*2); ctx.fill(); }
    if(R()<.3) part({type:'dust',x:c.x+rnd(-c.r*.6,c.r*.6),y:c.y+rnd(-c.r*.3,c.r*.3),vx:rnd(-6,6),vy:-rnd(4,12),g:0,life:.9,col:`rgba(${r},${g},${b},.35)`,size:2}); } }

/* status setters */
function setBurn(e,p){ const s=stOf(e); const r=resOf(e,'fire'); const dps=p*(1-r); if(dps<=0) return; if(s.soak&&s.soak.t>0) return; s.burn={t:3,dps:Math.max(dps,s.burn?s.burn.dps:0),acc:0,tk:.4,drop:0}; }
function addRot(e,p){ const s=stOf(e); const dps=p*(1-resOf(e,'poison')); if(dps<=0) return; const c=s.rot; s.rot={t:3.2,dps:Math.min((c?c.dps:0)+dps,dps*5),acc:c?c.acc:0,tk:c?c.tk:.4,n:Math.min(5,(c?c.n:0)+1)}; }
function addBleed(e,p,n){ const s=stOf(e); const dps=p*(1-resOf(e,'blood')); if(dps<=0) return; const c=s.bleed; s.bleed={t:3.5,dps:Math.min((c?c.dps:0)+dps*(n||1),dps*5),acc:c?c.acc:0,tk:c?c.tk:.4,n:Math.min(5,(c?c.n:0)+(n||1))}; }
function freezeFoe(e,dur){ if(e.boss){ stOf(e).chill={t:3,n:3}; return; } const s=stOf(e); s.frozen={t:dur}; delete s.chill; e.vx=0; if(!e.fly) e.vy=Math.max(e.vy,0); AU.tone('triangle',2600,1800,.25,.06,.6); AU.noise(.2,6000,3000,3,.12,'highpass',.3); burst(e.x,e.y-e.h/2,10,'#cfeaff',90,0); }

/* the solo effect of each type when it lands */
function applyElem(e,k,d,dir){ if(e.dead) return 0; curEl=k; const s=stOf(e), [cx,cy]=ctr(e), heavyT=e.boss||e.type==='brute'||e.type==='knight'||e.unique;
  switch(k){
    case 'fire': setBurn(e,d*.35); burst(cx,cy,4,'#ff8a3a'); return d*.5;
    case 'cold': { if(s.frozen&&s.frozen.t>0){ s.frozen.t=Math.max(s.frozen.t,.6); return d*.8; } const n=(s.chill?s.chill.n:0)+1; s.chill={t:3,n}; burst(cx,cy,3,'#bfe6ff',60,0); if(n>=3) freezeFoe(e,1.7); return d*.8; }
    case 'shock': { s.shock={t:2}; const tg=live(cx,cy,85,e).sort((a,b)=>Math.abs(a.x-e.x)-Math.abs(b.x-e.x)).slice(0,2);
      for(const o of tg){ const [ox,oy]=ctr(o); zap(cx,cy,ox,oy); stOf(o).shock={t:2}; hurt(o,d*.6*(1-resOf(o,'shock')),Math.sign(o.x-e.x),30); }
      if(tg.length){ AU.tone('square',2400,900,.08,.05,.3); AU.noise(.08,6000,2000,2,.12,'bandpass',.2); } burst(cx,cy,4,'#fff3a0',140,0); return d; }
    case 'water': s.soak={t:4}; delete s.burn; if(!heavyT){ e.vx+=dir*90; } for(let i=0;i<8;i++) part({x:cx+dir*4,y:cy+rnd(-6,6),vx:dir*rnd(40,140),vy:-rnd(20,90),g:400,life:rnd(.3,.6),em:true,col:pick(['#4aa8ff','#a8d8ff'])}); return d*.9;
    case 'poison': addRot(e,d*1.7/3); burst(cx,cy,3,'#8fe050',50,150); return 0;
    case 'holy': { const n=(s.sanct?s.sanct.n:0)+1; s.sanct={t:5,n}; burst(cx,cy,3,'#ffe6a8',60,-40); if(n>=4){ s.sanct.n=0; judgement(e.x,e.y,wAvg()*1.4+d*3,44,false); P.life=Math.min(P.stats.life,P.life+P.stats.life*.03); } return d*(ranked(e)?2:1); }
    case 'shadow': s.mark={t:5}; burst(cx,cy,4,'#a070ff',60,-30); return d;
    case 'blood': addBleed(e,d*.32); bleed(cx,cy,5,dir,.8); return d*.6;
    case 'wind': s.gale={t:.9}; if(!e.boss){ e.vx=dir*(heavyT?150:290); e.vy=heavyT?-80:-190; e.stun=Math.max(e.stun||0,.35); if(!heavyT) e.launchT=.6; }
      for(let i=0;i<6;i++) part({type:'dust',x:cx-dir*8,y:cy+rnd(-10,10),vx:dir*rnd(120,240),vy:rnd(-10,10),g:0,life:.3,col:'rgba(220,240,230,.6)',size:1}); return d*.8;
    case 'bone': { const n=Math.min(5,(s.brittle?s.brittle.n:0)+1); s.brittle={t:4,n}; if(n>=5){ s.brittle.n=0; splinter(e,d*1.3+wAvg()*.4,8); } return d; }
  } return d; }
function splinter(e,dmg,n,ice){ const [cx,cy]=ctr(e); AU.noise(.15,4000,900,2,.3,'bandpass',.2); AU.tone('triangle',ice?2200:900,ice?1200:300,.12,.08,.3);
  for(let i=0;i<n;i++){ const a=i/n*Math.PI*2+rnd(-.2,.2); projs.push({type:ice?'ice':'shard',from:'p',x:cx,y:cy,vx:Math.cos(a)*300,vy:Math.sin(a)*300-40,g:200,dmg,r:3,life:.45,hits:new Set([e]),kb:60}); } }
function judgement(x,y,dmg,r,lightning){ shake(5); AU.boom(.5); AU.ting(); U.uWhite.value=Math.max(U.uWhite.value,lightning?.07:.04);
  for(const o of live(x,y-14,r+10)) hurt(o,dmg*(1-resOf(o,lightning?'shock':'holy')),Math.sign(o.x-x),90);
  fx.push({t:0,dur:.5,draw(f){ const k=1-f.t/f.dur, sx=x-camR.x, sy=y-camR.y; ectx.fillStyle=lightning?`rgba(255,250,210,${k.toFixed(2)})`:`rgba(255,236,190,${(k*.9).toFixed(2)})`; const w=(lightning?6:10)*k+2; ectx.fillRect(sx-w/2,0,w,sy); ectx.fillStyle=`rgba(255,220,140,${(k*.4).toFixed(2)})`; ectx.fillRect(sx-r,sy-4,r*2,4); addLight(x,y-30,90,1.4*k,1,.9,.6); }}); }

/* ---------- combinations ----------
   Rank: S devastating · A strong · B useful · F works against you. */
const TIER={S:{n:'Devastating',c:'#ff4a3d'},A:{n:'Strong',c:'#f2c14e'},B:{n:'Useful',c:'#8fd0ff'},F:{n:'Works against you',c:'#8a8078'}};
const COMBOS=[
  {id:'conduct',a:'water',b:'shock',name:'Conduction',jp:'導電',tier:'S',d:'Lightning races through every Soaked foe nearby, then strikes them all a second time. The water is spent.',
    fn(e,v){ const [cx,cy]=ctr(e); const tg=[e].concat(live(cx,cy,150,e).filter(o=>hasSt(o,'soak'))); const dmg=v*1.6+wAvg()*.5; U.uWhite.value=Math.max(U.uWhite.value,.05); shake(4);
      for(const o of tg){ const [ox,oy]=ctr(o); zap(cx,cy,ox,oy,null,2); hurt(o,dmg*(1-resOf(o,'shock')),Math.sign(o.x-e.x),40); stOf(o).shock={t:2.5}; }
      fx.push({t:0,dur:.3,upd(f){ if(f.t>=.25&&!f.done){ f.done=1; for(const o of tg){ if(o.dead) continue; const [ox,oy]=ctr(o); zap(ox,oy-60,ox,oy,null,2); hurt(o,dmg*(1-resOf(o,'shock')),1,30); delete stOf(o).soak; } AU.tone('square',3000,600,.12,.07,.4); } }});
      AU.tone('square',2800,700,.15,.08,.4); AU.noise(.2,7000,2000,2,.2,'bandpass',.3); }},
  {id:'harvest',a:'shadow',b:'blood',name:'Red Harvest',jp:'血祭',tier:'S',d:'The Mark ruptures. The foe bursts in a fountain of blood that opens three wounds on everything nearby, and you drink some of it back.',
    fn(e,v){ const [cx,cy]=ctr(e); delete stOf(e).mark; bloodBloom(cx,cy,v*2.4+wAvg()*1.2,64,e); hurt(e,v*3+wAvg(),P.face,120); for(const o of live(cx,cy,64,e)) addBleed(o,v*.3+wAvg()*.1,3); P.life=Math.min(P.stats.life,P.life+P.stats.life*.06); }},
  {id:'flash',a:'water',b:'cold',name:'Flash Freeze',jp:'瞬凍',tier:'S',d:'Soaked foes freeze instantly and for longer, and every Soaked foe close by freezes with them. Frozen foes take 40% more from everything.',
    fn(e,v){ const [cx,cy]=ctr(e); freezeFoe(e,2.6); delete stOf(e).soak; for(const o of live(cx,cy,90,e)) if(hasSt(o,'soak')){ freezeFoe(o,1.9); delete stOf(o).soak; } burst(cx,cy,24,'#e0f4ff',160,0); }},
  {id:'storm',a:'fire',b:'wind',name:'Firestorm',jp:'火嵐',tier:'A',d:'The wind catches the flames and drives a wall of fire across the floor, setting everything in its path alight.',
    fn(e,v){ const dir=P.face, pow=v*.45+wAvg()*.18; let x=e.x, y=e.y; AU.noise(1,300,1600,1,.35,'bandpass',.5);
      fx.push({t:0,dur:1.1,acc:0,upd(f,dt){ f.acc+=dt*200; while(f.acc>10){ f.acc-=10; x+=dir*10; if(solidPx(x,y-6)) { f.t=f.dur; return; } addFlame(x,y,pow,2.6); for(const o of enemies) if(!o.dead&&!o.intro&&Math.abs(o.x-x)<12&&Math.abs(o.y-y)<30){ setBurn(o,pow); hurt(o,pow,dir,80); } } }}); }},
  {id:'shatter',a:'cold',b:'bone',name:'Shatter',jp:'砕',tier:'A',d:'A frozen foe struck with bone breaks apart: below 40% life it dies outright, and the ice and bone fly into everything nearby. Merely chilled foes splinter less.',
    fn(e,v){ const fr=hasSt(e,'frozen'); if(fr&&!e.boss&&e.hp<e.maxhp*.4){ e.hp=0; e.lastHit={el:'cold',t:time,combo:1}; killEnemy(e,P.face,true); } else hurt(e,v*(fr?3:1.5)+wAvg()*(fr?1:.4),P.face,120); clearEl(e,'cold'); if(!e.dead) splinter(e,v+wAvg()*.5,fr?10:5,true); }},
  {id:'miasma',a:'poison',b:'fire',name:'Miasma Burst',jp:'瘴爆',tier:'A',d:'The rot ignites. Everything it had left to deal goes off at once in an explosion that rots and burns what stands near.',
    fn(e,v){ const s=stOf(e), r=s.rot; const left=r?r.dps*r.t*1.5:0; delete s.rot; const [cx,cy]=ctr(e); const dmg=left+v*2+wAvg()*.6; AU.boom(.9); shake(5);
      for(const o of [e].concat(live(cx,cy,56,e))){ hurt(o,dmg*(o===e?1:.7),Math.sign(o.x-cx)||1,180); setBurn(o,v*.4); } burst(cx,cy,30,'#b8e060',220,100); burst(cx,cy,20,'#ff8a3a',180,60); }},
  {id:'judge',a:'shock',b:'holy',name:'Judgement',jp:'天罰',tier:'A',d:'A Shocked foe hit with holy calls the sky down on itself: a lightning pillar that strikes it and everything around it, and stuns them.',
    fn(e,v){ judgement(e.x,e.y,v*3+wAvg()*1.2,48,true); for(const o of live(e.x,e.y-14,58)) if(!o.boss) o.stun=Math.max(o.stun||0,.6); delete stOf(e).shock; }},
  {id:'plague',a:'poison',b:'wind',name:'Plague Wind',jp:'疫風',tier:'A',d:'The wind carries the rot. Every foe within reach catches the same stack the target was carrying.',
    fn(e,v){ const r=stOf(e).rot; if(!r) return false; const [cx,cy]=ctr(e); for(const o of live(cx,cy,110,e)){ const s=stOf(o); s.rot={t:3.2,dps:r.dps*(1-resOf(o,'poison')),acc:0,tk:.4,n:r.n}; } addCloud(cx,cy,40,r.dps*.4,1.6); }},
  {id:'rend',a:'bone',b:'blood',name:'Marrow Rend',jp:'髄裂',tier:'B',d:'Brittle flesh tears wide open: the bleeding doubles and every Brittle stack becomes another wound.',
    fn(e,v){ const s=stOf(e); const n=s.brittle?s.brittle.n:0; delete s.brittle; if(s.bleed){ s.bleed.dps*=2; s.bleed.t=4; } addBleed(e,v*.3+wAvg()*.08,Math.max(1,n)); bleed(e.x,e.y-e.h/2,18,P.face,1.4); }},
  {id:'boil',a:'blood',b:'fire',name:'Boiling Blood',jp:'沸血',tier:'B',d:'The blood boils in the wound: everything left of the bleed is dealt at once.',
    fn(e,v){ const s=stOf(e), b=s.bleed; if(!b) return false; const n=b.dps*b.t*1.3; delete s.bleed; hurt(e,n+v,P.face,80); P.life=Math.min(P.stats.life,P.life+n*.1); burst(e.x,e.y-e.h/2,14,'#ff5a3a',120,-20); }},
  {id:'thunder',a:'shock',b:'wind',name:'Thunderhead',jp:'雷雲',tier:'B',d:'The wind lifts the charge into a cloud: lightning jumps twice as far, to up to five foes.',
    fn(e,v){ const [cx,cy]=ctr(e); const tg=live(cx,cy,170,e).slice(0,5); for(const o of tg){ const [ox,oy]=ctr(o); zap(cx,cy-20,ox,oy,null,1); hurt(o,(v*1.1+wAvg()*.3)*(1-resOf(o,'shock')),Math.sign(o.x-cx),40); stOf(o).shock={t:2}; } AU.tone('square',2000,500,.2,.06,.4); }},
  {id:'squall',a:'water',b:'wind',name:'Squall',jp:'嵐',tier:'B',d:'Wind drives the water into a wall: Soaked foes are hurled far away, straight into whatever is behind them.',
    fn(e,v){ const dir=P.face; for(const o of [e].concat(live(e.x,e.y-e.h/2,60,e).filter(o=>hasSt(o,'soak')))){ if(o.boss) continue; o.vx=dir*480; o.vy=-240; o.stun=Math.max(o.stun||0,.8); o.launchT=.9; } for(let i=0;i<16;i++) part({x:e.x,y:e.y-rnd(0,e.h),vx:dir*rnd(150,320),vy:-rnd(0,120),g:300,life:.5,em:true,col:'#8fc8ff'}); }},
  {id:'bloom',a:'shadow',b:'poison',name:'Rot Bloom',jp:'腐花',tier:'B',d:'The Mark flowers into a cloud of rot around the foe that poisons everything that lingers in it.',
    fn(e,v){ const [cx,cy]=ctr(e); addCloud(cx,cy+4,46,v*.5+wAvg()*.12,3.2,[120,70,140]); burst(cx,cy,14,'#b080d0',90,0); }},
  {id:'quench',a:'fire',b:'cold',name:'Quench',jp:'相殺',tier:'F',d:'Fire and frost cancel out. The burning goes out, the frozen thaw and walk free, and the second hit loses its type.',
    fn(e,v,ctx){ clearEl(e,'fire'); clearEl(e,'cold'); ctx.cancel=true; steamPuff(e,22); }},
  {id:'steam',a:'water',b:'fire',name:'Steam',jp:'湯気',tier:'F',d:'Water puts the fire out and the steam blinds you for a moment. Both are wasted.',
    fn(e,v,ctx){ clearEl(e,'fire'); clearEl(e,'water'); ctx.cancel=true; steamPuff(e,60,2.2); }},
  {id:'eclipse',a:'holy',b:'shadow',name:'Eclipse',jp:'日蝕',tier:'F',d:'Light and dark swallow each other. Both marks vanish and the foe recovers a little life.',
    fn(e,v,ctx){ clearEl(e,'holy'); clearEl(e,'shadow'); ctx.cancel=true; if(!e.boss) e.hp=Math.min(e.maxhp,e.hp+e.maxhp*.06); burst(e.x,e.y-e.h/2,12,'#6a5a80',60,0); }},
  {id:'purify',a:'poison',b:'holy',name:'Purify',jp:'浄化',tier:'F',d:'Holy burns the rot out of the wound. Your poison is gone.',
    fn(e,v){ clearEl(e,'poison'); burst(e.x,e.y-e.h/2,10,'#fff8d0',60,-40); }},
  {id:'wash',a:'blood',b:'water',name:'Washed Clean',jp:'洗',tier:'F',d:'Water rinses the wounds closed. The bleeding stops.',
    fn(e,v){ clearEl(e,'blood'); for(let i=0;i<10;i++) part({x:e.x,y:e.y-rnd(0,e.h),vx:rnd(-40,40),vy:rnd(-40,10),g:300,life:.4,em:true,col:'#c06070'}); }}
];
const COMBO_BY={}; for(const c of COMBOS){ COMBO_BY[c.a+'+'+c.b]=c; COMBO_BY[c.b+'+'+c.a]=c; }
let COMBO_SEEN=store.get('marrowdeep.combos')||{};
function steamPuff(e,r,blind){ const x=e.x, y=e.y-e.h/2; AU.noise(.6,2500,600,.7,.25,'highpass',.4); for(let i=0;i<14;i++) part({type:'dust',x:x+rnd(-8,8),y:y+rnd(-8,8),vx:rnd(-30,30),vy:-rnd(10,50),g:-20,life:rnd(.6,1.2),col:'rgba(220,220,220,.5)',size:3});
  if(blind) fx.push({t:0,dur:blind,draw(f){ const k=Math.min(1,f.t*5)*Math.min(1,(f.dur-f.t)/.5); for(let i=0;i<7;i++){ const a=i*.9+f.t*.7; ctx.fillStyle=`rgba(200,200,205,${(.22*k).toFixed(3)})`; ctx.beginPath(); ctx.arc(x-camR.x+Math.cos(a)*r*.5,y-camR.y+Math.sin(a)*r*.3,r*.7,0,Math.PI*2); ctx.fill(); } }}); }
function bloodBloom(x,y,dmg,r,src){ const pe=curEl; curEl='shadow'; AU.gore&&AU.gore(); AU.boom(.6); shake(5);
  for(let i=0;i<46;i++){ const a=R()*Math.PI*2, sp=rnd(60,260); part({type:'blood',x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-80,g:520,life:rnd(.5,1.2),col:pick(BLOOD),size:R()<.4?2:1}); }
  fx.push({t:0,dur:.35,draw(f){ const k=1-f.t/f.dur; ectx.strokeStyle=`rgba(220,30,20,${k.toFixed(2)})`; ectx.lineWidth=2; ectx.beginPath(); ectx.arc(x-camR.x,y-camR.y,r*(f.t/f.dur),0,Math.PI*2); ectx.stroke(); addLight(x,y,r*1.4,1.1*k,1,.15,.1); }});
  for(const o of live(x,y,r,src)) hurt(o,dmg*(1-resOf(o,'shadow')),Math.sign(o.x-x)||1,160); curEl=pe; }

/* combo popups that rise from the foe */
const cpLayer=document.createElement('div'); cpLayer.className='layer'; cpLayer.id='cpops'; stage.appendChild(cpLayer); let cpops=[];
function popCombo(e,c){ const d=document.createElement('div'); d.className='cpop t'+c.tier; d.innerHTML=`<b>${c.jp}</b>${c.name}`; d.style.setProperty('--tc',TIER[c.tier].c); cpLayer.appendChild(d); cpops.push({el:d,x:e.x,y:e.y-e.h-8,t:0});
  const first=!COMBO_SEEN[c.id]; COMBO_SEEN[c.id]=(COMBO_SEEN[c.id]||0)+1; store.set('marrowdeep.combos',COMBO_SEEN);
  if(first) toast(`新　${c.jp} ${c.name} — ${ELEM[c.a].n} + ${ELEM[c.b].n}. Written in the Codex.`); }
function updPops(rdt){ for(const p of cpops){ p.t+=rdt; const sx=((p.x-camR.x-camPX)*camZ+camPX)/W*100, sy=((p.y-p.t*18-camR.y-camPY)*camZ+camPY)/H*100; p.el.style.left=sx+'%'; p.el.style.top=sy+'%'; p.el.style.opacity=Math.min(1,(1.5-p.t)*2); if(p.t>1.5) p.el.remove(); } cpops=cpops.filter(p=>p.t<=1.5); }

/* ---------- a player hit carrying damage types ---------- */
function elemHit(e,crit,hand,dir){ const map=(P.stats.elm&&P.stats.elm[hand||'main'])||{}; const inc=Object.keys(map).filter(k=>map[k]>0); if(!inc.length||e.dead) return 0; dir=dir||P.face;
  const ctx={cancel:false}; let fired=0; e.ccd=e.ccd||{};
  for(const k of inc){ if(fired>=2) break; for(const j of ELEMS){ if(j===k||!elOn(e,j)) continue; const c=COMBO_BY[j+'+'+k]; if(!c||(e.ccd[c.id]&&time-e.ccd[c.id]<.5)) continue;
      const v=map[k]*(crit?1.5:1); curEl=c.id==='harvest'||c.id==='bloom'?'shadow':c.b; if(c.fn(e,v,ctx)===false){ curEl=null; continue; } e.ccd[c.id]=time; popCombo(e,c); fired++; if(e.dead) return 0; if(ctx.cancel) break; } }
  if(ctx.cancel){ curEl=null; return 0; }
  let tot=0; for(const k of inc){ if(e.dead) break; const r=resOf(e,k); tot+=applyElem(e,k,map[k]*(crit?1.5:1)*(1-r),dir); }
  curEl=null; return Math.round(tot); }

/* damage taken is raised by Shock, Frozen and Brittle */
(function(){ const o=dmgEnemy; dmgEnemy=function(e,d,...rest){ const s=e.sts; if(s&&!e.dead){ let m=1; if(hasSt(e,'shock')) m*=1.15; if(hasSt(e,'frozen')) m*=1.4; if(hasSt(e,'brittle')) m*=1+.08*s.brittle.n; d=Math.round(d*m); } return o(e,d,...rest); }; })();

/* ticks: damage over time, slows, frozen statues, the shards and blooms on death */
function tickSts(e,dt){ const s=e.sts; if(!s) return;
  for(const k in s){ const x=s[k]; x.t-=dt; if(x.t<=0){ delete s[k]; continue; }
    if(x.dps){ x.acc+=x.dps*dt; x.tk-=dt; if(x.tk<=0&&x.acc>=1){ x.tk=.4; const n=Math.floor(x.acc); x.acc-=n; e.hp-=n; e.flash=.03; targetE=e; targetT=2; num(e.x+rnd(-4,4),e.y-e.h-4,n,k==='burn'?'#ff9a4a':k==='rot'?'#9fe060':'#ff4a3d');
        if(k==='bleed'){ P.life=Math.min(P.stats.life,P.life+n*.15); bleed(e.x,e.y-e.h*.5,2,R()<.5?1:-1,.5); }
        if(e.hp<=0){ if(e.boss) e.hp=1; else { e.lastHit={el:ST_EL[k],t:time,dot:1}; killEnemy(e,R()<.5?-1:1,false); return; } } } }
    if(k==='burn'&&!e.fly&&e.onGround){ x.drop-=dt; if(x.drop<=0){ x.drop=.4; addFlame(e.x,e.y,x.dps*.8,2.2); } } }
  const [cx,cy]=ctr(e);
  if(s.burn&&R()<.5) part({x:cx+rnd(-e.w/2,e.w/2),y:cy+rnd(-e.h/2,e.h/2),vx:rnd(-10,10),vy:-rnd(20,50),g:-30,life:rnd(.2,.45),em:true,col:pick(['#ff7a2a','#ffcf7a'])});
  if(s.rot&&R()<.3) part({x:cx+rnd(-e.w/2,e.w/2),y:cy,vx:0,vy:rnd(10,30),g:150,life:.4,em:true,col:'#8fe050'});
  if(s.soak&&R()<.25) part({x:cx+rnd(-e.w/2,e.w/2),y:cy,vx:0,vy:20,g:400,life:.4,em:true,col:'#4aa8ff'});
  if(s.shock&&R()<.07) part({x:cx+rnd(-e.w/2,e.w/2),y:cy+rnd(-e.h/2,e.h/2),vx:rnd(-15,15),vy:rnd(-15,15),g:0,life:.35,em:true,col:'rgba(210,225,255,.8)'});
  if(s.mark&&R()<.25) part({type:'dust',x:cx+rnd(-5,5),y:e.y-e.h-2,vx:0,vy:-20,g:0,life:.5,col:'rgba(60,20,90,.8)',size:2});
  if(s.chill&&R()<.2) part({x:cx+rnd(-e.w/2,e.w/2),y:cy+rnd(-6,6),vx:0,vy:rnd(-10,10),g:0,life:.5,em:true,col:'rgba(170,220,255,.8)'}); }
(function(){ const o=updEnemy; updEnemy=function(e,dt){
  if(!e.dead&&!e.intro){ tickSts(e,dt); if(e.dead) return o(e,dt); const s=e.sts;
    if(s&&s.frozen&&!e.boss){ if(!e.fly&&!e.ceil){ e.vy+=900*dt; e.vx=approach(e.vx,0,500*dt); moveBody(e,dt); } return; }
    if(s){ let m=1; if(s.chill) m*=1-.17*s.chill.n; if(s.soak) m*=.85; if(e.boss) m=Math.max(.7,m); dt*=m; } }
  if(!e.dead&&e.elems&&R()<.18) part({x:e.x+rnd(-e.w/2,e.w/2),y:e.y-rnd(0,e.h),vx:rnd(-8,8),vy:-rnd(15,40),g:-10,life:rnd(.3,.6),em:true,col:ELEM[pick(e.elems)].c});
  o(e,dt); }; })();
(function(){ const o=killEnemy; killEnemy=function(e,dir,crit){ const was=e.dead, s=e.sts; o(e,dir,crit); if(was||!e.dead||e.boss||!s) return; const [cx,cy]=ctr(e);
  if(s.mark&&s.mark.t>0){ e.sts=null; bloodBloom(cx,cy,Math.min(e.maxhp*.8,wAvg()*6)+wAvg()*2,62,e); }
  if(s.frozen&&s.frozen.t>0) splinter(e,wAvg()*.9,8,true);
  if(s.rot&&s.rot.t>0) addCloud(cx,cy+4,34,s.rot.dps*.5,2.6);
  if(s.burn&&s.burn.t>0){ for(let i=-1;i<=1;i++) addFlame(e.x+i*7,e.y,s.burn.dps,3.2); } }; })();

/* status pips over heads, ice over the frozen */
const PIP={burn:'#ff7a2a',chill:'#8fd0ff',frozen:'#e8f8ff',shock:'#fff3a0',soak:'#4aa8ff',rot:'#8fe050',sanct:'#ffe6a8',mark:'#a070ff',bleed:'#d0352c',gale:'#c8e8d8',brittle:'#e2d6b8'};
function drawSts(){ for(const e of enemies){ const s=e.sts; if(!s||e.dead) continue; const ks=Object.keys(s); if(!ks.length) continue; const sx=e.x-camR.x, sy=e.y-e.h-(e.boss?14:5)-camR.y; if(sx<-20||sx>W+20) continue;
    let x=Math.round(sx-ks.length*2.5); for(const k of ks){ ectx.fillStyle=PIP[k]||'#fff'; ectx.fillRect(x,Math.round(sy),3,2); const n=s[k].n||0; for(let i=1;i<n;i++) ectx.fillRect(x+1,Math.round(sy)-i*2,1,1); x+=5; }
    if(s.frozen){ const b=eBox(e); ctx.fillStyle='rgba(170,215,255,.38)'; ctx.fillRect(Math.round(b.x-camR.x)-1,Math.round(b.y-camR.y)-1,b.w+2,b.h+2); ectx.fillStyle='rgba(200,235,255,.35)'; ectx.fillRect(Math.round(b.x-camR.x)-1,Math.round(b.y-camR.y)-1,b.w+2,1); ectx.fillRect(Math.round(b.x-camR.x)-1,Math.round(b.y-camR.y),1,b.h); } } }
(function(){ const o=drawEnemies; drawEnemies=function(){ drawGround(); o(); drawSts(); }; })();
(function(){ const o=drawProjs; drawProjs=function(){ o(); for(const p of projs){ if(p.type!=='ice'&&p.type!=='shard') continue; const sx=p.x-camR.x, sy=p.y-camR.y, a=Math.atan2(p.vy,p.vx); const c=p.type==='ice'?ectx:ctx; c.save(); c.translate(sx,sy); c.rotate(a); c.fillStyle=p.type==='ice'?'rgba(200,235,255,.9)':'#e2d6b8'; c.fillRect(-4,-1,6,2); c.restore(); } }; })();
(function(){ const o=updParts; updParts=function(dt){ o(dt); if(mode==='play') updGround(dt); }; })();
(function(){ const o=frame; let lt=0; frame=function(now){ o(now); updPops(lt?clamp((now-lt)/1000,0,.1):0); lt=now; }; })();
(function(){ const o=loadLevel; loadLevel=function(){ flames=[]; clouds=[]; cpops.forEach(p=>p.el.remove()); cpops=[]; return o.apply(this,arguments); }; })();

/* ---------- elites' damage types landing on the player ---------- */
function elemOnPlayer(src){ if(!src||!src.elems) return; for(const k of src.elems){
  if(k==='fire') P.burn={dps:src.dmg*.12,t:2,acc:0};
  else if(k==='poison') P.poison={dps:Math.min((P.poison?P.poison.dps:0)+src.dmg*.08,src.dmg*.3),t:3,acc:0};
  else if(k==='blood') P.bleedS={dps:Math.min((P.bleedS?P.bleedS.dps:0)+src.dmg*.07,src.dmg*.25),t:3,acc:0};
  else if(k==='cold'){ P.chillT=1.8; AU.tone('sine',1800,600,.25,.06,.5); }
  else if(k==='water'){ P.soakT=3.5; P.burn=null; }
  else if(k==='shock'){ P.grit=Math.max(0,P.grit-22); U.uWhite.value=Math.max(U.uWhite.value,.12); AU.noise(.1,6000,2000,2,.2,'bandpass',.2); sparks(P.x,P.y-14,8,'#fff3a0'); }
  else if(k==='shadow') P.shadowT=3;
  else if(k==='bone') P.brittleT=3.5;
  else if(k==='wind'){ P.vx=Math.sign(P.x-src.x||1)*320; P.vy=-260; }
  else if(k==='holy'){ P.vx*=1.6; P.vy=Math.min(P.vy,-200); } } }
(function(){ const o=hurtPlayer; hurtPlayer=function(d,src){ let dd=d; const el=src&&src.elems;
  if(el&&el.includes('holy')) dd*=1.2;
  if(el&&el.includes('shock')&&P.soakT>0){ dd*=1.5; P.soakT=0; U.uWhite.value=.2; }
  if(P.brittleT>0) dd*=1.15;
  const l0=P.life; o(dd,src); if(P.life<l0&&el&&!P.dead) elemOnPlayer(src); }; })();
(function(){ const o=updPlayer; updPlayer=function(dt){ o(dt); const p=P; if(p.dead) return;
  for(const k of ['burn','poison','bleedS']){ const d=p[k]; if(!d) continue; d.t-=dt; d.acc+=d.dps*dt;
    if(R()<.3) part({x:p.x+rnd(-5,5),y:p.y-rnd(4,24),vx:0,vy:k==='burn'?-30:30,g:k==='bleedS'?400:0,life:.35,em:k!=='bleedS',col:k==='burn'?'#ff8a3a':k==='poison'?'#8fe050':'#7a1012',type:k==='bleedS'?'blood':'p'});
    if(d.acc>=2){ const n=Math.floor(d.acc); d.acc-=n; p.life-=n; num(p.x,p.y-30,n,k==='burn'?'#ff9a4a':k==='poison'?'#9fe060':'#ff4a3d'); if(p.life<=0){ die(); return; } }
    if(d.t<=0) p[k]=null; }
  if(p.chillT>0){ p.chillT-=dt; if(R()<.3) part({x:p.x+rnd(-5,5),y:p.y-rnd(2,26),vx:0,vy:0,g:0,life:.5,em:true,col:'rgba(170,220,255,.8)'}); }
  if(p.soakT>0){ p.soakT-=dt; p.vx*=1-dt*1.2; if(R()<.25) part({x:p.x+rnd(-5,5),y:p.y-rnd(4,24),vx:0,vy:20,g:400,life:.4,em:true,col:'#4aa8ff'}); }
  if(p.brittleT>0){ p.brittleT-=dt; if(R()<.15) part({type:'dust',x:p.x+rnd(-5,5),y:p.y-rnd(4,24),vx:0,vy:10,g:100,life:.4,col:'rgba(226,214,184,.6)',size:1}); }
  if(p.shadowT>0){ p.shadowT-=dt; if(R()<.3) part({type:'dust',x:p.x+rnd(-6,6),y:p.y-rnd(2,26),vx:0,vy:-20,g:0,life:.6,col:'rgba(40,10,60,.7)',size:2}); } }; })();

/* ---------- the Codex: damage types and their combinations ---------- */
function renderElemCodex(){ const box=$('#elemCodex'); if(!box) return; const seenN=COMBOS.filter(c=>COMBO_SEEN[c.id]).length;
  const tag=k=>`<span class="el" style="color:${ELEM[k].c}"><i>${ELEM[k].jp}</i>${ELEM[k].n}</span>`;
  let h=`<div class="exHead">Ten damage types. Only uniques and abyssals carry one, never more. Your main weapon's type rides your main-hand blows, your off weapon's rides your off-hand blows, rings and amulets ride both. When a type lands on a status another type left, the two combine. <b>${seenN} / ${COMBOS.length}</b> combinations witnessed.</div>`;
  h+=`<h4>Damage types</h4><div class="exGrid">`+ELEMS.map(k=>{ const E=ELEM[k]; const pre=PRE.find(a=>a.k===k); return `<div class="cx ex" style="--ec:${E.c}"><b><i>${E.jp}</i>${E.n}<small>${E.st}</small></b>${E.does}<div class="ey">From elites: ${E.you} Elites of this type shrug off most of it.</div>${pre?`<div class="ep">Found as ${pre.n.join(' · ')}</div>`:''}</div>`; }).join('')+`</div>`;
  for(const t of ['S','A','B','F']){ const list=COMBOS.filter(c=>c.tier===t); h+=`<h4 style="color:${TIER[t].c}"><span class="tb">${t}</span>${TIER[t].n}</h4><div class="exGrid">`+list.map(c=>{ const n=COMBO_SEEN[c.id]||0;
      return `<div class="cx cb${n?'':' un'}" style="--tc:${TIER[t].c}"><b><i>${c.jp}</i>${c.name}</b><div class="rc">${tag(c.a)} <em>+</em> ${tag(c.b)}</div>${c.d}<div class="seen">${n?`Witnessed ${n}×`:'Not yet witnessed'}</div></div>`; }).join('')+`</div>`; }
  box.innerHTML=h; }
(function(){ const o=renderCodex; renderCodex=function(){ o(); const pane=$('#paneCodex'); if(!$('#cxTabs')){ const t=document.createElement('div'); t.id='cxTabs'; t.className='tabs sub'; t.innerHTML='<button class="tab on" id="cxLore">Lore 記</button><button class="tab" id="cxElem">Damage types &amp; combinations 属</button>'; pane.insertBefore(t,pane.firstChild);
    const ec=document.createElement('div'); ec.id='elemCodex'; ec.hidden=true; pane.appendChild(ec);
    const show=el=>{ const on=el==='elem'; $('#cxLore').classList.toggle('on',!on); $('#cxElem').classList.toggle('on',on); $('#codex').hidden=on; $('#vowsTxt').hidden=on; ec.hidden=!on; if(on) renderElemCodex(); };
    $('#cxLore').onclick=()=>show('lore'); $('#cxElem').onclick=()=>show('elem'); }
  if(!$('#elemCodex').hidden) renderElemCodex(); }; })();
