'use strict';
/* ===== actors: player, skills, enemies, projectiles, particles, effects ===== */
let P=null, enemies=[], chests=[], drops=[], parts=[], ghosts=[], projs=[], fx=[], targetE=null, targetT=0, swingId=0, lvlIdx=0, ngp=0;
const diff=()=>typeof mlvl==='function'?(mlvl()-1)/2:lvlIdx+ngp*8;

/* ---------- particles ---------- */
const BLOOD=['#5e0b0d','#7a1012','#9b1a16','#3e0708'];
function part(o){ parts.push(Object.assign({vx:0,vy:0,g:0,life:1,max:1,size:1,em:false,type:'p',col:'#fff'},o)); if(parts.length>800) parts.splice(0,parts.length-800); }
function bleed(x,y,n,dir,pow){ for(let i=0;i<n;i++){ const a=rnd(-1.2,.4), sp=rnd(40,160)*(pow||1); part({type:'blood',x,y,vx:Math.cos(a)*sp*dir+rnd(-20,20),vy:Math.sin(a)*sp-rnd(0,60),g:520,life:rnd(.5,1.2),col:pick(BLOOD),size:R()<.25?2:1}); } }
function sparks(x,y,n,col){ for(let i=0;i<n;i++){ const a=R()*Math.PI*2, sp=rnd(60,220); part({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,g:300,life:rnd(.15,.4),em:true,col:col||pick(['#ffd28a','#fff1c8','#ff9a4a'])}); } }
function dust(x,y,n){ for(let i=0;i<n;i++) part({type:'dust',x:x+rnd(-6,6),y,vx:rnd(-40,40),vy:rnd(-30,-5),g:-10,life:rnd(.3,.6),col:'rgba(160,140,120,.5)',size:ri(1,2)}); }
function ash(x,y,n){ for(let i=0;i<n;i++) part({type:'dust',x:x+rnd(-6,6),y:y+rnd(-4,4),vx:rnd(-60,60),vy:rnd(-40,40),g:-20,life:rnd(.4,.8),col:pick(['rgba(40,36,40,.8)','rgba(90,86,94,.7)']),size:ri(1,2)}); }
function num(x,y,v,col,big){ part({type:'num',x,y,vy:-38,vx:rnd(-10,10),life:.9,max:.9,txt:String(v),col,big,em:true}); }
function decal(x,y,col,n){ LVc.fillStyle=col; LVc.fillRect(Math.round(x),Math.round(y),n||1,1); }
function updParts(dt){
  for(const p of parts){ p.life-=dt; const py0=p.y; p.vy+=p.g*dt; p.x+=p.vx*dt; p.y+=p.vy*dt;
    if(p.type==='blood'&&tileAt(Math.floor(p.x/T),Math.floor(p.y/T))===1){ const top=Math.floor(p.y/T)*T; if(py0<top) decal(p.x,top,p.col,ri(1,2)); else decal(p.x,p.y,p.col,1); p.life=0; } }
  parts=parts.filter(p=>p.life>0);
}
function drawParts(){ for(const p of parts){ const sx=Math.round(p.x-camR.x), sy=Math.round(p.y-camR.y); if(sx<-10||sx>W+10||sy<-10||sy>H+10) continue; const k=clamp(p.life/(p.max||1),0,1);
  if(p.type==='num'){ pxText(ectx,p.txt,sx-p.txt.length*(p.big?4:2),sy,p.col,p.big?2:1); continue; }
  const c=p.em?ectx:ctx; c.globalAlpha=p.type==='dust'?k:1; c.fillStyle=p.col; c.fillRect(sx,sy,p.size,p.size); c.globalAlpha=1; } }

/* ---------- player ---------- */
function newPlayer(){ return {x:0,y:0,w:10,h:26,vx:0,vy:0,face:1,onGround:false,coyote:0,drop:0,runPh:0,swordA:1.35,offA:1.1,attack:null,dash:0,dashAge:9,dashCd:0,inv:0,hurtT:0,life:60,grit:100,gold:0,potions:2,healT:0,
  equip:{weapon:null,off:null,armor:null,helm:null,ring:null,amulet:null},bag:[],stats:null,kills:0,safe:{x:0,y:0},dead:false,deadT:0,best:null,ghostT:0,sy:1,cloak:0,combo:0,comboWin:0,offCombo:0,offWin:0,hits:0,hitT:0,lastMv:'',power:0,
  lvl:1,xp:0,sp:0,skills:new Set(),rage:0,airJ:0,wallDir:0,wallT:0,wallLock:0,clarT:0,clarCd:0,houndT:0,exhaustT:0,lastUsed:false,shade:null,teth:null,iai:null,block:false,blockT:-9,cd:{hem:0,teth:0,bell:0},plat:null,auraT:0}; }
const has=id=>P&&P.skills.has(id);
function offActive(){ const m=P.equip.weapon, o=P.equip.off; return !!(has('off')&&o&&!(m&&m.base.h===2)); }
function xpNext(l){ return Math.round(30+22*Math.pow(l-1,1.45)); }
function gearPower(){ let p=0; for(const k in P.equip){ const it=P.equip[k]; if(!it||(k==='off'&&!offActive())) continue; p+=[0,1,2,3,4,8][it.rarity]; p+=it.aff.filter(a=>varies(a)&&a.g===4).length*2; } return p; }
function calcStats(){ const s={min:1+Math.floor(P.lvl/2),max:3+P.lvl,spd:1.1,omin:0,omax:0,ospd:1,def:0,life:60+(P.lvl-1)*7,as:0,ms:0,ls:0,fire:0,cold:0,shock:0,poison:0,holy:0,shadow:0,water:0,blood:0,wind:0,bone:0,crit:5,mf:0,gf:0,regen:0,thorns:0}; const sets={};
  for(const k in P.equip){ const it=P.equip[k]; if(!it||(k==='off'&&!offActive())) continue; for(const a of it.aff){ if(a.k==='ed'||a.k==='edef') continue; s[a.k]+=a.v; } if(it.def) s.def+=it.def; if(it.set) sets[it.set]=(sets[it.set]||0)+1; }
  const w=P.equip.weapon; if(w){ s.min=w.min; s.max=w.max; s.spd=w.base.spd; }
  const o=P.equip.off; if(o&&offActive()&&o.base.max>0){ s.omin=o.min; s.omax=o.max; s.ospd=o.base.spd; }
  s.life+=vowBonus('life'); s.ls+=vowBonus('ls'); s.crit+=vowBonus('crit'); s.def+=vowBonus('def'); s.mf+=vowBonus('mf'); s.dmgP=vowBonus('dmg');
  // damage types per hand: the main weapon's type rides main-hand blows, the off weapon's rides off-hand blows, jewellery rides both
  s.elm={main:{},off:{}}; for(const k in P.equip){ const it=P.equip[k]; if(!it||(k==='off'&&!offActive())) continue; for(const a of it.aff){ if(!ELEM_KEYS.includes(a.k)) continue; for(const h of k==='weapon'?['main']:k==='off'?['off']:['main','off']) s.elm[h][a.k]=(s.elm[h][a.k]||0)+a.v; } }
  s.mf+=ngp*20;
  s.life=Math.max(10,Math.round(s.life)); P.stats=s; P.power=gearPower(); P.life=Math.min(P.life,s.life); }
function gainXP(n){ if(!P||P.dead) return; P.xp+=Math.round(n); while(P.xp>=xpNext(P.lvl)){ P.xp-=xpNext(P.lvl); P.lvl++; P.sp++; calcStats(); P.life=P.stats.life; levelUpFX(); } }
function heroState(){ const p=P; return p.dead?'dead':p.dash>0?'dash':p.iai?'iai':p.attack?'atk':p.hurtT>0?'hurt':p.teth&&p.teth.state==='pull'?'jump':(p.wallT>0&&!p.onGround)?'wall':!p.onGround?(p.vy<0?'jump':'fall'):Math.abs(p.vx)>12?'run':'idle'; }
const heroBr=()=>{ const st=heroState(); return st==='idle'?Math.round(Math.sin(time*2.2)*.6):st==='run'?-Math.round(Math.abs(Math.sin(P.runPh))*1.4):0; };
function armExt(hand){ const a=P.attack; if(!a||a.hand!==hand||a.mv.t!=='thrust') return 0; const pr=a.t/a.dur; return Math.round(pr<.25?-4*pr/.25:pr<.6?7:7*(1-(pr-.6)/.4)); }
function heroPose(){ const p=P; let rot=0, sx=1; const sy=p.sy; const sp=108*(1+p.stats.ms/100);
  if(p.dead) return {rot:-Math.min(1.5,p.deadT*3),sx:1,sy:1};
  if(p.dash>0) rot=.28;
  else if(p.iai) rot=p.iai.ready?.18:.1;
  else if(p.attack){ const a=p.attack, mv=a.mv, pr=a.t/a.dur;
    if(mv.t==='spin'){ const k=clamp((pr-mv.act[0])/(mv.act[1]-mv.act[0]),0,1); sx=.6+.4*Math.abs(Math.cos(Math.PI*k*(mv.turns||1))); rot=.06; }
    else if(mv.t==='slam') rot=pr<mv.act[0]?-.14:.24*(1-clamp((pr-mv.act[1])/.4,0,1));
    else if(mv.t==='thrust') rot=pr<.25?-.12:.2;
    else if(mv.t==='plunge') rot=.12;
    else rot=pr<mv.act[0]?-.1:.13; }
  else if(p.wallT>0&&!p.onGround) rot=-.15;
  else if(!p.onGround) rot=clamp(-p.vy/2600,-.12,.12)+(Math.abs(p.vx)>20?.05:0);
  else rot=clamp(Math.abs(p.vx)/sp,0,1)*.11;
  if(p.hurtT>0) rot=-.22;
  const vs=p.dash>0?.86:sy;
  return {rot,sx:sx*clamp(2-vs,.8,1.25),sy:vs}; }

/* ---------- player moves ---------- */
function aimInfo(){ if(!aimMouse||!P) return null; const m=mouseWorld(); const dx=m.x-P.x, dy=m.y-(P.y-18); return {dx,dy,face:dx>=0?1:-1,ang:Math.atan2(dy,Math.abs(dx)||.001)}; }
function aimFor(mv,ai){ if(!ai||mv.t==='spin'||mv.t==='plunge') return 0; const lim=mv.t==='shoot'?1.45:mv.t==='slam'?.55:1.05; return clamp(ai.ang,-lim,lim)*(mv.t==='slam'?.6:1); }
function startMove(name,ci,hand){ const s=P.stats, mv=MV[name]; hand=hand||'main'; const ai=aimInfo(); if(ai&&mv.t!=='plunge'&&Math.abs(ai.dx)>3) P.face=ai.face;
  const spd=hand==='off'?s.ospd:s.spd; const rate=spd*(1+s.as/100)*(P.houndT>0?1.5:1);
  P.attack={mv,name,ci,hand,aimA:aimFor(mv,ai),t:0,dur:name==='plunge'?mv.dur:mv.dur/rate,queued:null,id:++swingId,prev:[],lunged:false,slammed:false,half:false,shot:false};
  if(ci>=0){ if(hand==='off') P.offCombo=ci; else P.combo=ci; }
  if(mv.t==='spin') AU.spin(); else if(mv.t!=='shoot') AU.swing(mv.dm>=1.5);
  if(name==='plunge') P.vy=-90;
  if(P.shade&&P.shade.armed&&mv.t!=='shoot'){ P.shade.armed=false; P.shade.atk={mv,t:-.12,dur:P.attack.dur,id:++swingId,hand,prev:[]}; } }
function moveAngle(a){ const mv=a.mv, p=a.t/a.dur, ao=a.aimA||0; if(mv.t==='thrust'||mv.t==='plunge'||mv.t==='shoot') return mv.a0+ao;
  const s=mv.act[0]*.8, e=mv.act[1]; const k=clamp((p-s)/(e-s),0,1); const dirn=Math.sign(mv.a1-mv.a0);
  const ee=mv.t==='spin'?.5-.5*Math.cos(Math.PI*k):1-Math.pow(1-k,3); const wind=p<s?.32*Math.sin((p/s)*Math.PI/2):0;
  return mv.a0-wind*dirn+(mv.a1-mv.a0)*ee+ao; }
function reachOf(mv,hand){ const it=hand==='off'?P.equip.off:P.equip.weapon; return Math.max(18,mv.reach+(it&&it.base.len?(it.base.len-23)*.6:0)); }
function boxAt(mv,hand,x,y,face,ao){ const rc=reachOf(mv,hand);
  if(ao&&(mv.t==='arc'||mv.t==='thrust'||mv.t==='slam')){ const c=Math.cos(ao), sn=Math.sin(ao), cx=x+face*c*rc*.5, cy=y-18+sn*rc*.55;
    const w=mv.t==='thrust'?Math.abs(c)*rc+14:rc+8, h=mv.t==='thrust'?Math.abs(sn)*rc+20:48; return {x:cx-w/2,y:cy-h/2,w,h}; }
  if(mv.t==='spin') return {x:x-rc,y:y-42,w:rc*2,h:48};
  if(mv.t==='thrust') return {x:face>0?x:x-rc,y:y-28,w:rc,h:20};
  if(mv.t==='plunge') return {x:x-14,y:y-14,w:28,h:22};
  return {x:face>0?x-6:x-rc+6,y:y-44,w:rc,h:48}; }
function shockwave(x,y,len,dirs){ shake(6); AU.slam();
  for(const d of dirs){ for(let i=0;i<10;i++) part({x:x+d*rnd(2,len),y:y-1,vx:d*rnd(60,190),vy:rnd(-70,-10),g:300,life:rnd(.2,.45),em:true,col:pick(['#ffcf9a','#fff1d8','#ff9a5a'])});
    dust(x+d*len*.5,y,8); let cx=x, cy=y+1; LVc.fillStyle='rgba(0,0,0,.6)';
    for(let k=0;k<len*.7;k++){ cx+=d; if(R()<.35) cy=clamp(cy+ri(-1,1),y+1,y+4); if(tileAt(Math.floor(cx/T),Math.floor((y+1)/T))===1) LVc.fillRect(Math.round(cx),cy,1,1); } } }
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const pBox=()=>({x:P.x-P.w/2,y:P.y-P.h,w:P.w,h:P.h});
const eBox=e=>({x:e.x-e.w/2,y:e.y-e.h,w:e.w,h:e.h});
function rollHand(hand){ const s=P.stats; return (hand==='off'?ri(s.omin,s.omax):ri(s.min,s.max))*(1+(s.dmgP||0)/100); }
function canExecute(e){ return has('exe')&&!e.boss&&!e.dead&&(e.hp<e.maxhp*.2||e.launchT>0||e.stun>.4); }
function strike(e,mv,id,hand,dir,mult){ const s=P.stats;
  if(e.hitId===id) return false; e.hitId=id; e.lastHit={cls:wcls(hand),el:handEl(hand),t:time,heavy:mv.dm>=1.5};
  let d=rollHand(hand)*mv.dm*mult*(1+(P.lvl-1)*.05)*(P.houndT>0?1.25:1);
  const crit=R()*100<s.crit||P.clarT>0; if(crit) d*=2; d=Math.round(d)+elemHit(e,crit,hand,dir);
  if((e.type==='husk'&&e.state!=='thrust'||e.type==='knight'&&e.state!=='combo'||e.mods&&e.mods.includes('stone')&&R()<.35)&&!(e.stun>0)&&Math.sign(P.x-e.x)===e.face&&!crit&&mv.dm<1.5){ AU.clang(); sparks(e.x+e.face*6,e.y-14,6,'#fff1c8'); e.vx=-e.face*70; const gd=Math.round(d*.15)+(s.shadow||0); num(e.x,e.y-28,Math.max(1,gd),'#8a8078'); e.hp-=gd; if(e.hp<=0) killEnemy(e,dir,false); freeze=Math.max(freeze,.03); return true; }
  if(canExecute(e)){ execute(e,dir); return true; }
  if(s.fire) sparks(e.x,e.y-e.h/2,5,'#ff7a2a');
  dmgEnemy(e,d,crit,dir,mv.kb,mv.dm>=1.5,mv.launch,mv.stun);
  AU.hit(crit); freeze=Math.max(freeze,crit?.1:mv.dm>=1.5?.08:.045); shake(crit?5:mv.dm>=1.5?4:2.5);
  if(s.ls&&!(P.shadowT>0)) P.life=Math.min(s.life,P.life+d*s.ls/100*(P.houndT>0?1:1)+(P.houndT>0?d*.08:0));
  else if(P.houndT>0) P.life=Math.min(s.life,P.life+d*.08);
  P.rage=Math.min(100,P.rage+2); P.hits++; P.hitT=1.6; P.lastMv=mv.nm; return true; }
function hitBoxAll(hb,mv,id,hand,dirO,mult){ for(const e of enemies){ if(e.dead||e.intro) continue; if(overlap(hb,eBox(e))){ const dir=dirO||((mv.t==='spin'||mv.t==='plunge')?(Math.sign(e.x-P.x)||P.face):P.face); strike(e,mv,id,hand,dir,mult); } } }
function execute(e,dir){ const s=P.stats; e.hp=0; impactT=.04; freeze=.16; shake(7); AU.hit(true); AU.kill(); AU.gore&&AU.gore();
  const x0=e.x-60, x1=e.x+60, y=e.y-e.h/2; fx.push({t:0,dur:.5,draw(f){ const k=f.t/f.dur; ectx.fillStyle=`rgba(255,240,230,${(1-k).toFixed(2)})`; ectx.save(); ectx.translate(e.x-camR.x,y-camR.y); ectx.rotate(-.35*dir); ectx.fillRect(-70,-1,140,2); ctx.save(); ctx.translate(e.x-camR.x,y-camR.y); ctx.rotate(-.35*dir); ctx.fillStyle=`rgba(0,0,0,${(1-k)*.8})`; ctx.fillRect(-80,1,160,2); ctx.restore(); ectx.restore(); }});
  num(e.x,e.y-e.h-6,'!','#ff4a3d',true); P.life=Math.min(s.life,P.life+s.life*.12); bleed(e.x,y,30,dir,1.8); killEnemy(e,dir,true); P.hits++; P.hitT=1.6; P.lastMv='Execution'; }
function runAttack(dt){ const p=P, a=p.attack, mv=a.mv; a.t+=dt; const pr=a.t/a.dur; const hand=a.hand;
  const kd=(down('d','ArrowRight')?1:0)-(down('a','ArrowLeft')?1:0), early=pr<mv.act[0]*.9, late=pr>mv.act[1];
  if(mv.t!=='plunge'&&mv.t!=='spin'){ const ai=aimInfo();
    if(ai){ if((early||late)&&Math.abs(ai.dx)>6) p.face=ai.face; a.aimA=lerp(a.aimA||0,aimFor(mv,ai),Math.min(1,dt*14)); }
    else if(kd&&kd!==p.face&&(early||late)) p.face=kd; }
  const ang=moveAngle(a); if(hand==='off'){ a.prev.push(p.offA); p.offA=ang; } else { a.prev.push(p.swordA); p.swordA=ang; } if(a.prev.length>(mv.t==='spin'?7:5)) a.prev.shift();
  if(!a.lunged&&pr>=mv.act[0]*.9&&mv.t!=='plunge'&&mv.t!=='shoot'){ a.lunged=true; if(mv.lunge) p.vx=p.face*mv.lunge*(kd===-p.face?.15:kd===p.face?1.1:.8); if(mv.hop) p.vy=Math.min(p.vy,p.onGround?mv.hop:mv.hop*.5); if(mv.t==='thrust') dust(p.x,p.y,4); }
  if(mv.t==='shoot'&&!a.shot&&pr>=mv.act[0]){ a.shot=true; fireBolt(hand); }
  if(mv.multi&&!a.half&&pr>.5){ a.half=true; a.id=++swingId; AU.spin(); }
  if(mv.t==='slam'&&!a.slammed&&pr>=mv.act[0]+.05){ a.slammed=true; if(p.onGround){ const it=hand==='off'?p.equip.off:p.equip.weapon; const gx=p.x+p.face*((it?it.base.len:6)+8); shockwave(gx,p.y,40,[p.face]); hitBoxAll({x:p.face>0?gx-10:gx-50,y:p.y-14,w:60,h:16},mv,a.id,hand,p.face,1); } }
  if(pr>=mv.act[0]&&pr<=mv.act[1]&&mv.t!=='shoot') hitBoxAll(boxAt(mv,hand,p.x,p.y,p.face,a.aimA),mv,a.id,hand,null,1);
  if(mv.t==='plunge'&&p.onGround&&a.t>.05){ shockwave(p.x,p.y,34,[-1,1]); a.id=++swingId; hitBoxAll({x:p.x-42,y:p.y-16,w:84,h:18},mv,a.id,hand,null,.8); freeze=Math.max(freeze,.08); a.t=a.dur; }
  if(a.t>=a.dur){ const list=hand==='off'?offComboFor(p.equip.off):comboFor(p.equip.weapon); const last=a.ci<0||a.ci>=list.length-1; const q=a.queued; p.attack=null;
    p.swordA=Math.atan2(Math.sin(p.swordA),Math.cos(p.swordA)); p.offA=Math.atan2(Math.sin(p.offA),Math.cos(p.offA));
    if(hand==='off') p.offWin=last?0:.45; else p.comboWin=last?0:.45;
    if(hand==='main'&&a.ci===list.length-1&&has('thou')) thousandCuts();
    if(q==='main'){ const ml=comboFor(p.equip.weapon); if(a.ci<0&&hand==='main'){ if(p.onGround) startMove(ml[0],0,'main'); } else { const nc=hand==='main'?(last?0:a.ci+1):(p.comboWin>0?Math.min(p.combo+1,ml.length-1):0); startMove(ml[nc],nc,'main'); } }
    else if(q==='off'&&offActive()){ const ol=offComboFor(p.equip.off); if(ol[0]!=='block'){ const nc=hand==='off'?(last?0:a.ci+1):(p.offWin>0?Math.min(p.offCombo+1,ol.length-1):0); startMove(ol[nc],nc,'off'); } } } }
function fireBolt(hand){ const s=P.stats; const d=(hand==='off'?ri(s.omin,s.omax):ri(s.min,s.max))*(1+(P.lvl-1)*.04); AU.chain(); AU.noise(.12,2000,600,2,.3,'bandpass',.2);
  const at=P.attack, ao=at?at.aimA||0:0, wa=P.face>0?ao:Math.PI-ao, rep=hand==='off'&&P.equip.off&&P.equip.off.base.name==='Repeater';
  for(const sp of rep?[-.06,.06]:[0]) projs.push({type:'bolt',from:'p',x:P.x+Math.cos(wa)*12,y:P.y-18+Math.sin(wa)*12,vx:Math.cos(wa+sp)*540,vy:Math.sin(wa+sp)*540,g:40,hand,dmg:d*(rep?.65:1),r:3,life:.9,hits:new Set(),kb:120}); }
function thousandCuts(){ for(let i=0;i<6;i++){ const a0=i/6*Math.PI*2; const id=++swingId; fx.push({t:-i*.05,dur:.62,a:a0,id,x:P.x,y:P.y-16,hit:false,
  upd(f,dt){ if(!f.hit&&f.t>=.3){ f.hit=true; const hx=f.x+Math.cos(f.a)*28, hy=f.y+Math.sin(f.a)*20; hitBoxAll({x:hx-20,y:hy-20,w:40,h:40},MV.slash,f.id,'main',Math.sign(Math.cos(f.a))||1,.55); AU.swing(false); } },
  draw(f){ if(f.t<0) return; const k=f.t<.3?f.t/.3:1-(f.t-.3)/.32; const r=28+(f.t>.3?(f.t-.3)*60:0), hx=f.x+Math.cos(f.a)*r, hy=f.y+Math.sin(f.a)*r*.75;
    ectx.save(); ectx.translate(hx-camR.x,hy-camR.y); ectx.rotate(f.a+Math.PI/2+(f.t>.3?2.4:0)); ectx.fillStyle=`rgba(230,240,255,${(clamp(k,0,1)*.85).toFixed(2)})`; ectx.fillRect(-1,-12,2,24); ectx.fillRect(-3,10,6,1); ectx.restore(); }}); } }

/* ---------- skills in play ---------- */
function triggerClarity(){ P.clarT=1.6; P.clarCd=1.2; P.inv=Math.max(P.inv,.5); AU.slow(); impactT=.05; sparks(P.x,P.y-14,10,'#cfe0ff'); }
function parry(src){ AU.clang(); AU.ting(); sparks(P.x+P.face*8,P.y-18,14,'#fff6d8'); impactT=.06; freeze=.12; if(src&&!src.boss&&src.hp>0){ src.stun=1.3; src.state=src.fly?'rec':'chase'; src.vx=P.face*120; } if(has('clar')) triggerClarity(); }
function castHem(){ const s=P.stats; const cost=Math.max(2,Math.round(s.life*.07)); if(P.life<=cost+1) return; P.life-=cost; P.cd.hem=.55; AU.cast(); bleed(P.x+P.face*6,P.y-18,6,P.face,.6);
  const dmg=((s.min+s.max)/2*1.7+P.lvl*2.5)*(P.houndT>0?1.3:1); const angs=has('pact')?[-.2,0,.2]:[0]; const ai=aimInfo(); if(ai) P.face=ai.face; const ab=ai?clamp(ai.ang,-1.2,1.2):0;
  for(const a0 of angs){ const a=a0+ab; projs.push({type:'blood',from:'p',x:P.x+P.face*10,y:P.y-17,vx:Math.cos(a)*440*P.face,vy:Math.sin(a)*440,g:0,dmg,r:5,life:.7,pierce:1,hits:new Set(),heal:s.life*.04,kb:90}); } }
function castTether(){ if(P.grit<15) return; P.grit-=15; P.cd.teth=.35; AU.chain();
  const up=down('w','ArrowUp'), dn=down('s','ArrowDown'); let dx=P.face*.72, dy=-.7; if(up){dx=P.face*.15;dy=-1;} else if(dn){dx=P.face;dy=-.12;} const l=Math.hypot(dx,dy);
  P.teth={state:'out',dx:dx/l,dy:dy/l,len:0,t:0,px:0,py:0,tgt:null}; }
function updTether(dt){ const t=P.teth; if(!t) return; t.t+=dt; const ox=P.x+P.face*4, oy=P.y-18;
  if(t.state==='out'){ t.len+=820*dt; const tx=ox+t.dx*t.len, ty=oy+t.dy*t.len;
    for(const e of enemies){ if(e.dead||e.intro) continue; if(Math.abs(e.x-tx)<e.w/2+5&&ty>e.y-e.h-5&&ty<e.y+5){ AU.hit(false); bleed(e.x,e.y-e.h/2,6,P.face,1);
      if(has('pact')&&!e.boss){ e.reelT=.35; e.stun=Math.max(e.stun||0,.9); P.teth={state:'back',len:t.len,dx:t.dx,dy:t.dy,t:0}; return; }
      t.state='pull'; t.tgt=e; t.t=0; if(!e.boss) e.stun=Math.max(e.stun||0,.7); return; } }
    if(solidPx(tx,ty)){ t.state='pull'; t.px=tx; t.py=ty; t.t=0; sparks(tx,ty,6,'#ff6a50'); AU.clang(); return; }
    if(t.len>190){ t.state='back'; } }
  else if(t.state==='back'){ t.len-=1200*dt; if(t.len<=0) P.teth=null; }
  else if(t.state==='pull'){ const px=t.tgt?t.tgt.x:t.px, py=t.tgt?t.tgt.y-t.tgt.h/2:t.py+(t.dy<-.5?28:10); const dx=px-P.x, dy=py-(P.y-12), d=Math.hypot(dx,dy)||1; t.len=Math.hypot(px-ox,(t.tgt?t.tgt.y-t.tgt.h/2:t.py)-oy);
    P.vx=dx/d*470; P.vy=dy/d*470; if(d<18||t.t>.75||P.hitWall){ P.vy=Math.min(P.vy,-160); P.vx*=.4; P.airJ=has('wing')?1:0; if(t.tgt&&!t.tgt.dead){ strike(t.tgt,MV.chop,++swingId,'main',P.face,.6); } P.teth=null; } } }
function castBell(){ if(P.grit<40) return; P.grit-=40; P.cd.bell=7; AU.bell(); shake(6); U.uWhite.value=.22; const bx=P.x, by=P.y-20; const id=++swingId;
  for(const e of enemies){ if(e.dead||e.intro) continue; const d=Math.hypot(e.x-bx,e.y-e.h/2-by); if(d<135){ if(!e.boss){ e.stun=2.4; e.state=e.fly?'rec':'chase'; e.vy=e.fly?0:-120; } strike(e,MV.slash,id,'main',Math.sign(e.x-bx)||1,.9); } }
  fx.push({t:0,dur:1.1,draw(f){ const k=f.t/f.dur; const sx=bx-camR.x, sy=by-camR.y; ectx.strokeStyle=`rgba(210,215,240,${((1-k)*.7).toFixed(2)})`; ectx.lineWidth=2; ectx.beginPath(); ectx.ellipse(sx,sy,k*140,k*70,0,0,Math.PI*2); ectx.stroke();
    const a=(1-k)*.6; ectx.strokeStyle=`rgba(230,230,255,${a.toFixed(2)})`; ectx.lineWidth=1; ectx.beginPath(); ectx.moveTo(sx-10,sy-30); ectx.quadraticCurveTo(sx-12,sy-52,sx,sy-54); ectx.quadraticCurveTo(sx+12,sy-52,sx+10,sy-30); ectx.lineTo(sx+14,sy-26); ectx.lineTo(sx-14,sy-26); ectx.closePath(); ectx.stroke(); }}); }
function startHound(){ P.houndT=10; AU.roar(); impactT=.12; shake(7); bark('hound',true); cutIn('hero','The Hound wears you','獣',1.2); unlockCodex('hound'); ash(P.x,P.y-14,30); calcStats(); }
function performIai(){ const s=P.stats; const sx=P.x; let ex=P.x; for(let i=0;i<120;i+=4){ const nx=P.x+P.face*i; if(solidPx(nx+P.face*6,P.y-6)||solidPx(nx+P.face*6,P.y-20)) break; ex=nx; }
  const box={x:Math.min(sx,ex)-8,y:P.y-30,w:Math.abs(ex-sx)+16,h:32}; const tg=enemies.filter(e=>!e.dead&&!e.intro&&overlap(box,eBox(e)));
  for(let k=0;k<6;k++) ghosts.push({x:lerp(sx,ex,k/6),y:P.y,face:P.face,a:-.3,oa:P.offA,life:.3});
  P.x=ex; P.inv=Math.max(P.inv,.45); P.swordA=.4; AU.dash(); AU.ting(); P.iai=null; const y=P.y-14;
  fx.push({t:0,dur:.5,draw(f){ const k=f.t/f.dur; ectx.fillStyle=`rgba(255,250,240,${(1-k).toFixed(2)})`; ectx.fillRect(Math.min(sx,ex)-camR.x,y-camR.y,Math.abs(ex-sx),1); }});
  const dmg=((s.min+s.max)/2)*3.4*(1+(P.lvl-1)*.04);
  fx.push({t:0,dur:.4,upd(f){ if(f.t>=.36&&!f.done){ f.done=true; if(tg.length){ impactT=.04; freeze=.12; shake(6); AU.kill(); }
    for(const e of tg){ if(e.dead) continue; if(canExecute(e)){ execute(e,P.face); continue; } const crit=P.clarT>0||R()<.35; dmgEnemy(e,Math.round(dmg*(crit?2:1)),crit,P.face,160,true,false,false); bleed(e.x,e.y-e.h/2,24,P.face,1.6);
      const ey=e.y-e.h/2; fx.push({t:0,dur:.45,draw(g){ const kk=g.t/g.dur; ectx.save(); ectx.translate(e.x-camR.x,ey-camR.y); ectx.rotate(-.6); ectx.fillStyle=`rgba(255,240,230,${(1-kk).toFixed(2)})`; ectx.fillRect(-18,-1,36,2); ectx.restore(); }}); } } }}); }
function updShade(dt){ const sh=P.shade; if(!sh) return; sh.t-=dt; if(sh.atk){ const a=sh.atk; a.t+=dt; if(a.t>=0){ const pr=a.t/a.dur, mv=a.mv; const ang=moveAngle(a); a.prev.push(ang); if(a.prev.length>5) a.prev.shift(); sh.ang=ang; if(pr>=mv.act[0]&&pr<=mv.act[1]) hitBoxAll(boxAt(mv,a.hand,sh.x,sh.y,sh.face),mv,a.id,a.hand,sh.face,.7); if(a.t>=a.dur) sh.atk=null; } } if(sh.t<=0&&!sh.atk) P.shade=null; }

/* ---------- player update ---------- */
function updPlayer(dt){
  const p=P, s=p.stats;
  if(p.dead){ p.deadT+=dt; p.vx=approach(p.vx,0,300*dt); p.vy+=900*dt; moveBody(p,dt); return; }
  p.inv-=dt; p.hurtT-=dt; p.dashCd-=dt; p.drop-=dt; p.comboWin-=dt; p.offWin-=dt; p.hitT-=dt; p.wallLock-=dt; p.dashAge+=dt; p.clarCd-=dt; if(p.hitT<=0) p.hits=0;
  for(const k in p.cd) p.cd[k]-=dt;
  if(p.houndT>0){ p.houndT-=dt; p.rage=100*p.houndT/10; if(p.houndT<=0){ p.exhaustT=2.5; calcStats(); } } p.exhaustT-=dt;
  if(p.ghostT>0){ p.ghostT-=dt; p.auraT-=dt; if(p.auraT<=0){ p.auraT=.3; const id=++swingId; hitBoxAll({x:p.x-30,y:p.y-38,w:60,h:46},MV.slash,id,'main',null,.6); } if(p.ghostT<=0){ p.life=Math.round(s.life*.35); p.inv=1; } }
  if(p.plat&&p.plat.type==='lift') p.y+=p.plat.dy;
  const L_=down('a','ArrowLeft'), R_=down('d','ArrowRight'), D_=down('s','ArrowDown');
  const dir=p.wallLock>0?0:(R_?1:0)-(L_?1:0);
  const speed=108*(1+s.ms/100)*(p.houndT>0?1.18:1)*(p.exhaustT>0?.7:1)*(p.wet?.62:1)*(p.chillT>0?.6:1);
  const atk=p.attack, pulling=p.teth&&p.teth.state==='pull';
  const wallR=solidPx(p.x+p.w/2+2,p.y-6)&&solidPx(p.x+p.w/2+2,p.y-20), wallL=solidPx(p.x-p.w/2-2,p.y-6)&&solidPx(p.x-p.w/2-2,p.y-20);
  const sliding=has('claw')&&!p.onGround&&p.vy>0&&!atk&&p.dash<=0&&((dir>0&&wallR)||(dir<0&&wallL));
  if(sliding){ p.wallT=.12; p.wallDir=dir; p.airJ=has('wing')?1:0; } else p.wallT-=dt;
  if(pulling){ /* tether drives velocity */ }
  else if(p.iai){ p.vx=approach(p.vx,0,900*dt); p.vy+=900*dt; p.iai.t+=dt; p.swordA=lerp(p.swordA,2.75,Math.min(1,dt*16));
    if(!p.iai.ready&&p.iai.t>=.42){ p.iai.ready=true; AU.ting(); sparks(p.x+p.face*2,p.y-10,4,'#fff6e0'); }
    if(!(down('j','x')||mouseHeld)){ if(p.iai.ready) performIai(); else { p.iai=null; startMove(comboFor(p.equip.weapon)[0],0,'main'); } } }
  else if(p.dash>0){ p.dash-=dt; p.vx=p.face*330; p.vy=0; p.ghostT2=(p.ghostT2||0)-dt; if(p.ghostT2<=0){ ghosts.push({x:p.x,y:p.y,face:p.face,a:p.swordA,oa:p.offA,life:.25}); p.ghostT2=.025; } }
  else if(atk){ if(atk.mv.t==='plunge'){ p.vx=approach(p.vx,0,600*dt); p.vy=atk.t<.08?p.vy+900*dt:480; }
    else { p.vx=approach(p.vx,dir*speed*.6,900*dt); p.vy+=900*dt; if(atk.mv.t==='spin'&&!p.onGround) p.vy=Math.min(p.vy,110); p.vy=Math.min(p.vy,540); } }
  else { if(p.hurtT<=0){ const rev=dir&&Math.sign(dir)!==Math.sign(p.vx)&&Math.abs(p.vx)>20; p.vx=approach(p.vx,dir*speed*(p.block?.35:1),(p.onGround?(rev?2800:1700):1100)*dt); }
    if(dir&&p.hurtT<=0&&dir!==p.face&&!p.block){ if(p.onGround&&Math.abs(p.vx)>60){ dust(p.x,p.y,3); p.sy=.9; } p.face=dir; }
    else if(!dir&&p.hurtT<=0&&!p.block){ const ai=aimInfo(); if(ai&&Math.abs(ai.dx)>8) p.face=ai.face; }
    p.vy+=900*dt*(p.wet?.5:1); if(!down('space','w','ArrowUp')&&p.vy<0) p.vy+=1100*dt*(p.wet?.5:1); p.vy=Math.min(p.vy,sliding?55:p.wet?150:540);
    if(sliding&&R()<.3) dust(p.x+dir*5,p.y-10,1); }
  if(p.onGround||(p.wet&&p.vy>-60)){ p.coyote=.1; p.airJ=has('wing')?1:0; } else p.coyote-=dt;
  if(p.dash<=0&&!p.iai&&(!atk||atk.t>atk.dur*.3)){
    if(p.coyote>0&&took('jump',.14)){ if(D_&&tileAt(Math.floor(p.x/T),Math.floor(p.y/T))===2){ p.drop=.25; p.y+=2; } else { p.attack=null; p.teth=null; p.vy=p.wet?-330:-390; p.sy=1.22; AU.jump(); dust(p.x,p.y,5); } p.coyote=0; }
    else if(p.wallT>0&&has('claw')&&took('jump',.14)){ p.attack=null; p.vy=-370; p.vx=-p.wallDir*220; p.face=-p.wallDir; p.wallLock=.16; p.wallT=0; p.sy=1.2; AU.jump(); dust(p.x,p.y-8,5); }
    else if(p.airJ>0&&!p.onGround&&took('jump',.14)){ p.airJ--; p.attack=null; p.teth=null; p.vy=-340; p.sy=1.25; AU.dash(); ash(p.x,p.y,16); for(let i=0;i<8;i++) part({x:p.x+rnd(-8,8),y:p.y,vx:rnd(-50,50),vy:rnd(20,70),g:-30,life:rnd(.4,.7),em:true,col:'rgba(160,160,180,.6)'}); } }
  // attacks
  const holdMain=down('j','x')||mouseHeld;
  const off=offActive()?p.equip.off:null, offKind=off?off.base.cls:null;
  p.block=!!(off&&offKind==='shield'&&(down('k')||rmouseHeld)&&!p.attack&&p.dash<=0&&p.hurtT<=0);
  if(p.attack){ if(took('atk',.45)) p.attack.queued='main'; else if(off&&offKind!=='shield'&&took('off',.45)) p.attack.queued='off'; }
  else if(!p.iai&&p.hurtT<=0&&p.dash<=0&&!pulling){
    if(has('iai')&&p.onGround&&D_&&p.equip.weapon&&took('atk',.3)){ p.iai={t:0,ready:false}; AU.noise(.2,800,300,2,.12,'bandpass',.2); }
    else if(took('atk',.45)||(holdMain&&p.comboWin>0)){
      if(!p.onGround&&D_) startMove('plunge',-1,'main');
      else if(!p.onGround&&p.comboWin<=0) startMove('aerial',-1,'main');
      else { const list=comboFor(p.equip.weapon); const ci=p.comboWin>0?Math.min(p.combo+1,list.length-1):0; startMove(list[ci],ci,'main'); } }
    else if(off&&took('off',.45)){ if(offKind==='shield') p.blockT=time; else { const ol=offComboFor(off); const ci=p.offWin>0?Math.min(p.offCombo+1,ol.length-1):0; startMove(ol[ci],ci,'off'); } } }
  if(off&&offKind==='shield'&&took('off',.2)) p.blockT=time;
  if(p.grit>=25&&p.dashCd<=0&&p.dash<=0&&took('dash',.15)){ p.dash=.17; p.dashAge=0; p.dashCd=.3; p.inv=Math.max(p.inv,.22); p.grit-=25; p.attack=null; p.iai=null; p.teth=null; p.swordA=Math.atan2(Math.sin(p.swordA),Math.cos(p.swordA)); if(dir) p.face=dir; AU.dash(); dust(p.x,p.y,6);
    if(has('shade')) p.shade={x:p.x,y:p.y,face:p.face,t:1.4,armed:true,atk:null,ang:p.swordA}; }
  if(p.potions>0&&p.life<s.life&&p.healT<=0&&took('potion',.15)){ p.potions--; p.healT=1.1; AU.drink(); bark('potion'); updBelt(); }
  if(has('hem')&&p.cd.hem<=0&&took('s1',.2)) castHem();
  if(has('teth')&&p.cd.teth<=0&&!p.teth&&took('s2',.2)) castTether();
  if(has('hound')&&p.rage>=100&&p.houndT<=0&&took('s3',.2)) startHound();
  if(has('bell')&&p.cd.bell<=0&&took('s4',.2)) castBell();
  if(p.healT>0){ p.healT-=dt; p.life=Math.min(s.life,p.life+s.life*.45/1.1*dt); }
  p.life=Math.min(s.life,p.life+s.regen*dt*.5);
  p.grit=Math.min(100,p.grit+22*dt);
  if(p.attack) runAttack(dt);
  else if(!p.iai){ const st=heroState(); const m=p.equip.weapon; const tgtA=!m?(st==='dash'?2.6:st==='run'?1.45+Math.sin(p.runPh)*.55:st==='jump'||st==='fall'?.6:1.35+Math.sin(time*2.2)*.04):st==='dash'?2.9:st==='wall'?-2.9:st==='run'?-2.7+Math.sin(p.runPh*2)*.06:st==='jump'||st==='fall'?-2.15:-2.45+Math.sin(time*2.2)*.04;
    let ta=tgtA; const ai=m?aimInfo():null; if(ai&&ai.face===p.face&&st!=='dash'&&st!=='wall') ta=clamp(ai.ang,-1.35,1.25);
    p.swordA=lerp(p.swordA,ta,Math.min(1,dt*14)); }
  if(!p.attack||p.attack.hand!=='off'){ const oc=off?offKind:null; const ai=oc==='xbow'?aimInfo():null; const tg=ai&&ai.face===p.face?clamp(ai.ang,-1.45,1.45):oc==='xbow'?.15+Math.sin(p.runPh)*.1:oc==='dagger'?1.2:1.05+(heroState()==='run'?Math.sin(p.runPh+3)*.4:0); p.offA=lerp(p.offA,tg,Math.min(1,dt*12)); }
  const wasG=p.onGround, vyb=p.vy;
  moveBody(p,dt);
  updTether(dt); updShade(dt);
  if(p.onGround&&!wasG&&vyb>160){ AU.land(); dust(p.x,p.y,vyb>400?8:4); p.sy=clamp(1-vyb/1700,.7,.92); if(vyb>420) shake(2); }
  if(Math.abs(p.vx)>12&&p.onGround) p.runPh+=dt*Math.abs(p.vx)*.11;
  p.sy=lerp(p.sy,1,Math.min(1,dt*11));
  p.cloak=lerp(p.cloak,clamp(-Math.abs(p.vx)/28-(p.onGround?0:1.5),-6,0),Math.min(1,dt*7));
  if(p.onGround&&!p.plat&&tileAt(Math.floor(p.x/T),Math.floor(p.y/T))===1&&tileAt(Math.floor((p.x-5)/T),Math.floor(p.y/T))===1&&tileAt(Math.floor((p.x+5)/T),Math.floor(p.y/T))===1){ p.safe.x=p.x; p.safe.y=p.y; }
  for(const pd of L.pends){ if(Math.hypot(pd.bx-p.x,pd.by+6-(p.y-12))<15) hurtPlayer(14+diff()*3,{x:pd.bx,hp:0,dead:true}); }
  if(p.lava&&!p.dead){ for(let i=0;i<20;i++) part({x:p.x+rnd(-6,6),y:p.y-4,vx:rnd(-60,60),vy:rnd(-160,-40),g:300,life:rnd(.3,.7),em:true,col:pick(['#ff9a3c','#ffcf7a','#ff4a1a'])}); AU.noise(.5,2000,200,1,.4,'lowpass',.2); }
  if(p.spiked||p.y>L.h*T+30){ bleed(p.x,p.y-6,14,1,1.2); const ff=Math.round(s.life*.18); p.inv=0; p.dash=0; p.attack=null; p.teth=null; hurtPlayer(ff,{x:p.x,hp:0,dead:true}); if(!p.dead){ p.x=p.safe.x; p.y=p.safe.y; p.vx=p.vy=0; p.inv=1; } }
}
function hurtPlayer(d,src){
  if(P.dead||P.ghostT>0||mode!=='play') return;
  if(P.dash>0){ if(has('clar')&&P.dashAge<.2&&P.clarCd<=0) triggerClarity(); return; }
  if(P.inv>0) return;
  const s=P.stats; let dmg=d*(1+diff()*.0)*100/(100+s.def*2)*(P.houndT>0?.6:1);
  if(P.block&&src&&Math.sign((src.x==null?P.x:src.x)-P.x)===P.face){ if(time-P.blockT<.2){ parry(src); P.inv=.3; return; } dmg*=.2; P.grit=Math.max(0,P.grit-10); AU.clang(); sparks(P.x+P.face*7,P.y-16,6,'#fff1c8'); P.vx=-P.face*90; P.inv=.25; }
  dmg=Math.max(1,Math.round(dmg));
  P.life-=dmg; P.rage=Math.min(100,P.rage+dmg*1.5);
  if(!P.block){ if(P.houndT>0) P.inv=.35; else { P.inv=.8; P.hurtT=.22; P.vx=(P.x<(src.x==null?P.x:src.x)?-1:1)*170; P.vy=-150; P.attack=null; P.iai=null; P.teth=null; }
    hurtV=1; shake(5); freeze=Math.max(freeze,.06); AU.hurt(); bleed(P.x,P.y-16,10,P.x<(src.x||P.x)?-1:1,1); }
  num(P.x,P.y-32,dmg,P.block?'#8a8078':'#ff5a4a');
  if(s.thorns&&src&&src.hp>0&&!src.dead) dmgEnemy(src,s.thorns,false,P.x<src.x?1:-1,40,false);
  if(P.life<=0) die(); else if(P.life<s.life*.3) bark('low',true);
}
function die(){ if(has('last')&&!P.lastUsed){ P.lastUsed=true; P.ghostT=4; P.life=1; P.inv=4.2; AU.scream(); impactT=.12; shake(5); bark('low',true); ash(P.x,P.y-14,30); return; }
  P.life=0; P.dead=true; P.deadT=0; AU.kill(); bleed(P.x,P.y-14,30,-P.face,1.5); impactT=.12; P.attack=null; P.teth=null; P.iai=null; }

/* ---------- enemies ---------- */
function mkEnemy(s){ const d=EDEF[s.t]; const D=diff(); const champ=!s.guard&&!s.pack&&!s.unique&&!NO_RANK.has(s.t)&&(s.leader&&ngp>0||R()<eliteChance('champ'));
  const e={type:s.t,x:s.x*T,y:s.y*T,w:d.w,h:d.h,vx:0,vy:0,face:R()<.5?-1:1,hp:d.hp*(1+.3*D)*(1+D*D*.002)*(champ?2.2:1)*(s.guard?1.3:1)*(s.pack?.55:1),dmg:d.dmg*(1+.17*D)*(1+D*D*.0006)*(champ?1.4:1)*(s.pack?.85:1),spd:d.spd*(champ?1.15:1)*(s.pack?rnd(.9,1.12):1),xp:d.xp*(champ?3:1)*(s.pack?.75:1),
    state:'idle',st:0,atkCd:rnd(.3,1),stun:0,walk:R()*6,flash:0,champ,seed:R()*10,onGround:false,dead:false,deadT:0,hitId:-1,fly:!!d.fly,launchT:0,reelT:0,anim:0};
  e.maxhp=e.hp; e.name=champ?pick(CHAMP)+' '+d.name:d.name; e.hy=e.y;
  if(s.t==='hanged'){ e.ax=e.x; e.ay=e.y; e.state='hang'; e.y=e.ay+40; }
  if(s.ceil){ e.ceil=1; e.y=s.y*T+d.h; }
  if(s.escort) e.escort=1;
  decorateEnemy(e,s);
  return e; }
function dmgEnemy(e,d,crit,dir,kb,heavy,launch,stun){
  if(e.dead) return;
  if(e.boss){ if(e.shield){ AU.clang(); sparks(e.x,e.y-e.h/2,4,'#ffe0a0'); num(e.x,e.y-e.h-6,0,'#8a8078'); return; } if(e.anchorsUp) d=Math.round(d*.5); if(e.state==='stagger') d=Math.round(d*1.5); }
  if(e.ceil){ e.ceil=0; e.vy=0; }
  if(e.type==='debtor'&&!e.seen){ e.seen=1; e.escape=15; }
  e.hp-=d; e.flash=.12; targetE=e; targetT=2.6;
  const ex=e.x, ey=e.y-e.h*.55;
  num(ex,ey-8,d,crit?'#ffb24a':'#f3e6c8',crit); bleed(ex,ey,crit?18:9,dir,crit?1.4:1); sparks(ex,ey,crit?3:1);
  if(e.boss){ bossStagAdd(e,d,heavy,crit); if(e.hp<=0) killEnemy(e,dir,crit); return; }
  if(e.state==='hang'){ e.state='drop'; }
  if(e.type==='anchor'||e.type==='relicx'){ if(e.hp<=0) killEnemy(e,dir,crit); return; }
  const heavyT=e.type==='brute'||e.type==='knight'||e.unique;
  if(!heavyT||heavy||crit){ e.stun=Math.max(e.stun||0,heavyT?.25:.3); e.vx=dir*kb*(heavyT?.35:1); e.vy=e.fly?-40:-60; if((e.state==='wind'||e.state==='draw'||e.state==='cast')&&!heavyT) e.state='chase'; }
  if(stun){ e.stun=1.2; }
  if(launch){ e.vy=heavyT?-120:-290; e.stun=.6; e.launchT=.8; if(e.state==='dive'||e.state==='tele') e.state='rec'; }
  if(e.hp<=0) killEnemy(e,dir,crit); }
function killEnemy(e,dir,crit){
  if(e.dead) return; e.dead=true; e.deadT=0; e.vx=dir*90; P.kills++;
  if(e.boss){ bossDefeated(e); return; }
  if(e.type==='anchor'||e.type==='relicx'){ AU.boom(.7); AU.clang(); shake(6); sparks(e.x,e.y-8,24,e.type==='anchor'?'#ff5a3a':'#ffe0a0'); ash(e.x,e.y-8,16); gainXP(e.xp); return; }
  P.streak=(P.streak||0)+1; P.streakT=2.2; unlockCodex(TYPE_CODEX[e.type]);
  modsOnDeath(e);
  bleed(e.x,e.y-e.h*.5,28,dir,1.6);
  for(let i=0;i<10;i++){ const gx=e.x+rnd(-10,10), ty=Math.floor((e.y+1)/T); if(tileAt(Math.floor(gx/T),ty)===1) decal(gx,ty*T,pick(BLOOD),ri(1,3)); }
  AU.kill(); if(AU.gore&&(e.type==='brute'||e.unique||e.champ||e.rare)) AU.gore(); const hordeK=e.pack&&!e.champ; shake(e.type==='brute'||e.unique?7:hordeK?2.5:4); freeze=Math.max(freeze,e.type==='brute'||e.champ||e.rare||e.unique?.12:hordeK?.035:.07);
  if(e.type==='bloat') explodeBloat(e);
  gainXP(e.xp*(1+lvlIdx*.12)*(typeof xpMul==='function'?xpMul():1));
  const gf=1+P.stats.gf/100;
  if(e.type==='debtor'){ for(let i=0;i<10;i++) dropGold(e.x+rnd(-10,10),e.y-8,Math.round(ri(8,16)*(1+lvlIdx*.6)*gf)); for(let i=0;i<2;i++) dropItem(genItem(ilvlNow()+3,[0,40,40,9,10,.02],P.stats.mf+100),e.x+rnd(-8,8),e.y-8); toast('The Gilded Debtor\'s debts come loose.'); }
  if(e.rare||e.unique){ const n=e.unique?ri(2,3):ri(1,2); for(let i=0;i<n;i++) dropItem(genItem(ilvlNow()+(e.unique?3:2),e.unique?[0,30,48,10,11.5,.03]:[0,52,38,5,4.8,.006],P.stats.mf+(e.unique?60:25)),e.x+rnd(-10,10),e.y-8); if(e.unique){ AU.roar(); showBossName(e.name,'討','Struck down.'); } }
  if(R()<.7||e.champ) dropGold(e.x,e.y-6,Math.round(ri(2,6)*(1+lvlIdx*.6)*gf*(e.champ?3:e.type==='brute'?2:e.pack?.6:1)));
  if(R()<.08) drops.push({kind:'potion',x:e.x,y:e.y-8,vy:-120,vx:rnd(-40,40)});
  if(has('feast')) for(let i=0;i<2;i++) drops.push({kind:'orb',x:e.x+rnd(-4,4),y:e.y-10,vy:-rnd(80,160),vx:rnd(-50,50)});
  const ch=e.type==='debtor'||e.rare||e.unique?0:e.champ?1:(e.type==='brute'||e.type==='knight'?.4:e.pack?.06:.12)*(ngp?1:.6);
  if(R()<ch){ const w=e.champ?[0,60,32,5,2.9,.002]:[72,22,5,.6,.38,.0005]; dropItem(genItem(ilvlNow()+(e.champ?2:0),w,P.stats.mf),e.x,e.y-8); }
  if(R()<.18) bark('kill'); }
function explodeBloat(e){ if(e.exploded) return; e.exploded=true; e.dead=true; e.deadT=1.6; const x=e.x, y=e.y-10;
  AU.boom(1); shake(6); for(let i=0;i<40;i++){ const a=R()*Math.PI*2, sp=rnd(60,260); part({type:'blood',x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-60,g:520,life:rnd(.5,1.2),col:pick(['#5a5a2a','#6a1010','#3e3e1a','#8a1414']),size:ri(1,2)}); }
  for(let i=0;i<12;i++) part({type:'dust',x:x+rnd(-14,14),y:y+rnd(-10,6),vx:rnd(-20,20),vy:rnd(-20,-5),g:-4,life:rnd(1,1.8),col:'rgba(110,120,60,.45)',size:3});
  if(Math.hypot(P.x-x,P.y-12-y)<54) hurtPlayer(e.dmg,{x,hp:0,dead:true});
  for(const o of enemies) if(o!==e&&!o.dead&&!o.boss&&Math.hypot(o.x-x,o.y-o.h/2-y)<54) dmgEnemy(o,30+diff()*6,false,Math.sign(o.x-x)||1,180,true); }
function ilvlNow(){ return typeof mlvl==='function'?Math.min(100,mlvl()+1):2+lvlIdx*2+ngp*8; }
function dropGold(x,y,n){ drops.push({kind:'gold',x,y,vx:rnd(-50,50),vy:-140,n}); }
function dropItem(it,x,y,quiet){ drops.push({kind:'item',x,y,vx:rnd(-40,40),vy:-160,item:it}); if(!quiet&&mode==='play') dropRoll(it,x,y); }
function tryHit(e,box,dmg){ if(overlap(box,pBox())){ const l0=P.life; hurtPlayer(dmg,e); if(P.life<l0) modsOnHitPlayer(e,l0-P.life); } }
function eProj(o){ projs.push(Object.assign({from:'e',g:0,r:3,life:3,hits:new Set()},o)); }
function aimAt(x,y,tx,ty,sp){ const d=Math.hypot(tx-x,ty-y)||1; return [(tx-x)/d*sp,(ty-y)/d*sp]; }
function updEnemy(e,dt){
  e.anim+=dt;
  if(e.boss){ updBoss(e,dt); return; }
  if(e.dead){ e.deadT+=dt; if(!e.fly){ e.vy+=900*dt; e.vx=approach(e.vx,0,200*dt); moveBody(e,dt); } else { e.vy+=500*dt; e.x+=e.vx*dt; e.y+=e.vy*dt; } return; }
  e.flash-=dt; e.atkCd-=dt; e.launchT-=dt;
  const dx=P.x-e.x, dy=(P.y-13)-(e.y-e.h/2), adx=Math.abs(dx); const vis=!P.dead&&P.ghostT<=0;
  if(e.reelT>0){ e.reelT-=dt; const d=Math.hypot(dx,dy)||1; e.vx=dx/d*420; e.vy=e.fly?dy/d*420:Math.min(e.vy,-80); if(e.fly){ e.x+=e.vx*dt; e.y+=e.vy*dt; } else { e.vy+=900*dt; moveBody(e,dt); } return; }
  if(e.stun>0){ e.stun-=dt; e.vx=approach(e.vx,0,500*dt); if(e.fly){ e.x+=e.vx*dt; e.y+=e.vy*dt; e.vy*=.9; } else { e.vy+=900*dt; moveBody(e,dt); } return; }
  const patrol=(sp)=>{ e.vx=approach(e.vx,e.face*sp,300*dt); const ax=e.x+e.face*(e.w/2+3); const bt=tileAt(Math.floor(ax/T),Math.floor((e.y+2)/T)); if(e.onGround&&(bt===0||bt===3||bt===5)||e.hitWall) e.face*=-1; };
  const T_=e.type;
  if(e.spiked&&!e.fly&&!e.ceil){ e.hp=0; bleed(e.x,e.y-6,16,1,1.2); killEnemy(e,1,false); return; }
  modsTick(e,dt);
  if(EAI[T_]){ EAI[T_](e,dt,{dx,dy,adx,vis,patrol}); if(!e.fly&&!e.ceil&&e.y>L.h*T+40){ e.dead=true; e.deadT=9; } return; }
  if(T_==='ghoul'){
    e.walk+=dt*Math.abs(e.vx)*.18;
    if(e.state==='wind'){ e.st-=dt; e.vx=approach(e.vx,0,600*dt); if(e.st<=0){ e.state='lunge'; e.st=.24; e.vx=e.face*175; e.vy=-90; } }
    else if(e.state==='lunge'){ e.st-=dt; if(e.st>.04) tryHit(e,{x:e.x-6+e.face*6,y:e.y-17,w:14,h:15},e.dmg); if(e.st<=0){ e.state='chase'; e.atkCd=.9; } }
    else { const ag=vis&&adx<170&&Math.abs(dy)<70; if(ag){ e.face=Math.sign(dx)||1; e.vx=approach(e.vx,adx>18?e.face*e.spd:0,420*dt); if(adx<32&&Math.abs(dy)<26&&e.atkCd<=0){ e.state='wind'; e.st=.38; } } else patrol(e.spd*.35); }
    e.vy+=900*dt; moveBody(e,dt);
  } else if(T_==='brute'){
    e.walk+=dt*Math.abs(e.vx)*.12;
    if(e.state==='wind'){ e.st-=dt; e.vx=0; if(e.st<=0){ e.state='slam'; e.st=.32; } }
    else if(e.state==='slam'){ const was=e.st; e.st-=dt; if(was>.24&&e.st<=.24){ shake(7); AU.slam(); dust(e.x+e.face*26,e.y,14); tryHit(e,{x:e.face>0?e.x:e.x-52,y:e.y-38,w:52,h:40},e.dmg); } if(e.st<=0){ e.state='chase'; e.atkCd=1.5; } }
    else { const ag=vis&&adx<190&&Math.abs(dy)<80; if(ag){ e.face=Math.sign(dx)||1; e.vx=approach(e.vx,adx>30?e.face*e.spd:0,200*dt); if(adx<48&&Math.abs(dy)<34&&e.atkCd<=0){ e.state='wind'; e.st=.75; AU.growl(); } } else e.vx=approach(e.vx,0,200*dt); }
    e.vy+=900*dt; moveBody(e,dt);
  } else if(T_==='husk'){
    e.walk+=dt*Math.abs(e.vx)*.16;
    if(e.state==='wind'){ e.st-=dt; e.vx=approach(e.vx,0,600*dt); if(e.st<=0){ e.state='thrust'; e.st=.22; e.vx=e.face*130; AU.swing(false); } }
    else if(e.state==='thrust'){ e.st-=dt; if(e.st>.05) tryHit(e,{x:e.face>0?e.x:e.x-38,y:e.y-19,w:38,h:9},e.dmg); if(e.st<=0){ e.state='chase'; e.atkCd=1.1; } }
    else { const ag=vis&&adx<180&&Math.abs(dy)<60; if(ag){ const want=Math.sign(dx)||1; if(want!==e.face){ e.turnT=(e.turnT||0)+dt; e.vx=approach(e.vx,0,300*dt); if(e.turnT>.55){ e.face=want; e.turnT=0; } }
        else { e.turnT=0; e.vx=approach(e.vx,adx>34?e.face*e.spd:0,300*dt); if(adx<42&&Math.abs(dy)<24&&e.atkCd<=0){ e.state='wind'; e.st=.42; } } } else patrol(e.spd*.3); }
    e.vy+=900*dt; moveBody(e,dt);
  } else if(T_==='bloat'){
    e.walk+=dt*Math.abs(e.vx)*.12;
    if(e.state==='swell'){ e.st-=dt; e.vx=0; if(R()<.3) part({type:'dust',x:e.x+rnd(-8,8),y:e.y-12,vx:0,vy:-10,g:0,life:.6,col:'rgba(110,120,60,.4)',size:2}); if(e.st<=0){ e.hp=0; killEnemy(e,1,false); } }
    else { const ag=vis&&adx<160&&Math.abs(dy)<60; if(ag){ e.face=Math.sign(dx)||1; e.vx=approach(e.vx,e.face*e.spd,200*dt); if(adx<34&&Math.abs(dy)<30){ e.state='swell'; e.st=.9; AU.growl(); } } else patrol(e.spd*.4); }
    e.vy+=900*dt; moveBody(e,dt);
  } else if(T_==='crawler'){
    e.walk+=dt*Math.abs(e.vx)*.3;
    if(e.state==='leap'){ tryHit(e,eBox(e),e.dmg); if(e.onGround&&e.vy>=0){ e.state='chase'; e.atkCd=1; } }
    else { const ag=vis&&adx<200&&Math.abs(dy)<70; if(ag){ e.face=Math.sign(dx)||1; e.vx=approach(e.vx,e.face*e.spd,600*dt); if(adx<70&&e.onGround&&e.atkCd<=0){ e.state='leap'; e.vy=-210; e.vx=e.face*160; AU.shriek(); } } else patrol(e.spd*.4); }
    e.vy+=900*dt; moveBody(e,dt);
  } else if(T_==='archer'){
    if(e.state==='draw'){ e.st-=dt; e.vx=0; e.face=Math.sign(dx)||1; if(e.st<=0){ const tx=P.x, ty=P.y-14, sx=e.x+e.face*6, sy=e.y-16; const t=Math.max(.25,Math.abs(tx-sx)/260); eProj({type:'arrow',x:sx,y:sy,vx:(tx-sx)/t,vy:(ty-sy)/t-.5*300*t,g:300,dmg:e.dmg,r:3,life:2.5}); AU.noise(.1,2400,900,2,.2,'bandpass',.2); e.state='chase'; e.atkCd=2.2; } }
    else { const ag=vis&&adx<250&&Math.abs(dy)<140; if(ag){ e.face=Math.sign(dx)||1; if(adx<50){ const ax=e.x-e.face*(e.w/2+3); const bt=tileAt(Math.floor(ax/T),Math.floor((e.y+2)/T)); e.vx=approach(e.vx,(bt===1||bt===2)?-e.face*e.spd:0,300*dt); } else e.vx=approach(e.vx,0,300*dt); if(e.atkCd<=0&&adx>36){ e.state='draw'; e.st=.8; } } else e.vx=approach(e.vx,0,300*dt); }
    e.vy+=900*dt; moveBody(e,dt);
  } else if(T_==='hanged'){
    if(e.state==='hang'){ e.x=e.ax+Math.sin(time*1.3+e.seed)*3; e.y=e.ay+40; if(vis&&Math.abs(dx)<34&&P.y>e.y-20&&P.y<e.y+120){ e.state='drop'; AU.scream(); } return; }
    if(e.state==='drop'){ e.vy+=900*dt; moveBody(e,dt); if(e.onGround){ e.state='chase'; e.atkCd=.4; dust(e.x,e.y,6); AU.land(); } return; }
    e.walk+=dt*Math.abs(e.vx)*.16;
    if(e.state==='wind'){ e.st-=dt; e.vx=0; if(e.st<=0){ e.state='swipe'; e.st=.2; AU.swing(true); } }
    else if(e.state==='swipe'){ e.st-=dt; if(e.st>.05) tryHit(e,{x:e.face>0?e.x:e.x-32,y:e.y-26,w:32,h:24},e.dmg); if(e.st<=0){ e.state='chase'; e.atkCd=1.1; } }
    else { const ag=vis&&adx<170&&Math.abs(dy)<70; if(ag){ e.face=Math.sign(dx)||1; e.vx=approach(e.vx,adx>24?e.face*e.spd:0,400*dt); if(adx<34&&e.atkCd<=0){ e.state='wind'; e.st=.5; } } else patrol(e.spd*.3); }
    e.vy+=900*dt; moveBody(e,dt);
  } else if(T_==='witch'){
    e.walk+=dt*4; const ag=vis&&adx<230&&Math.abs(dy)<170;
    if(e.state==='fade'){ e.st-=dt; if(e.st<=0){ for(let k=0;k<12;k++){ const nx=P.x+rnd(-130,130), ny=P.y-rnd(50,110); if(!solidPx(nx,ny)&&!solidPx(nx,ny-16)&&Math.abs(nx-P.x)>60){ e.x=nx; e.y=ny; break; } } e.state='appear'; e.st=.3; ash(e.x,e.y-10,10); } return; }
    if(e.state==='appear'){ e.st-=dt; if(e.st<=0){ e.state='hover'; e.atkCd=1; } return; }
    if(e.state==='cast'){ e.st-=dt; e.vx*=.9; e.vy*=.9; if(e.st<=0){ for(let k=-1;k<=1;k++){ const [vx,vy]=aimAt(e.x,e.y-14,P.x,P.y-14,90); const a=Math.atan2(vy,vx)+k*.5; eProj({type:'wisp',x:e.x+e.face*6,y:e.y-16,vx:Math.cos(a)*90,vy:Math.sin(a)*90,dmg:e.dmg,r:4,life:4,homing:1}); } AU.cast(); e.state='hover'; e.atkCd=3.2; } }
    else { if(ag){ e.face=Math.sign(dx)||1; const tx=P.x-e.face*120, ty=P.y-70+Math.sin(time+e.seed)*10; e.vx=approach(e.vx,clamp((tx-e.x)*1.2,-e.spd,e.spd),200*dt); e.vy=approach(e.vy,clamp((ty-e.y)*1.2,-e.spd,e.spd),200*dt);
        if(adx<55&&Math.abs(dy)<50&&e.atkCd<1.5){ e.state='fade'; e.st=.35; ash(e.x,e.y-10,12); AU.noise(.3,3000,300,1,.2,'bandpass',.4); } else if(e.atkCd<=0){ e.state='cast'; e.st=.7; } }
      else { e.vx*=.95; e.vy=Math.sin(time+e.seed)*10; } }
    e.x+=e.vx*dt; e.y+=e.vy*dt; e.y=clamp(e.y,30,L.h*T-20);
  } else {
    e.walk+=dt*6; const ag=vis&&adx<210&&Math.abs(dy)<160;
    if(e.state==='dive'){ e.st-=dt; e.x+=e.vx*dt; e.y+=e.vy*dt; tryHit(e,{x:e.x-7,y:e.y-17,w:14,h:16},e.dmg); if(e.st<=0||solidPx(e.x,e.y-4)){ e.state='rec'; e.st=.7; e.atkCd=1.5; e.vx*=.2; e.vy=-40; } }
    else if(e.state==='tele'){ e.st-=dt; e.x-=e.face*14*dt; e.y-=16*dt; if(e.st<=0){ e.state='dive'; e.st=.55; const [vx,vy]=aimAt(e.x,e.y,P.x,P.y-10,245); e.vx=vx; e.vy=vy; AU.shriek(); } }
    else { if(e.state==='rec'){ e.st-=dt; if(e.st<=0) e.state='hover'; }
      const tx=ag?P.x-(Math.sign(dx)||1)*62:e.x+Math.sin(time*.5+e.seed)*14, ty=ag?P.y-66:e.hy+Math.sin(time+e.seed)*8;
      e.vx=approach(e.vx,clamp((tx-e.x)*1.6,-e.spd,e.spd),280*dt); e.vy=approach(e.vy,clamp((ty-e.y)*1.6,-e.spd,e.spd),280*dt);
      e.x+=e.vx*dt; e.y+=e.vy*dt; if(ag) e.face=Math.sign(dx)||1;
      if(ag&&e.state!=='rec'&&e.atkCd<=0&&adx<135){ e.state='tele'; e.st=.5; } }
    e.y=clamp(e.y,30,L.h*T-20);
  }
}

/* ---------- enemy sprites ---------- */
function drawGhoul(c,e){ const sk=e.champ?'#8b93a8':'#7b856f', sd=e.champ?'#5d6478':'#566050', dk='#373d33'; const wk=Math.round(Math.sin(e.walk)*2); const ha=e.state==='wind'?-2:0;
  rect(c,-3+Math.round(wk*.5),-7,2,7,sd);
  c.fillStyle=sk; c.beginPath(); c.moveTo(-6,-6); c.lineTo(-5,-14); c.lineTo(-1,-17); c.lineTo(4,-15); c.lineTo(5,-8); c.lineTo(1,-5); c.closePath(); c.fill();
  c.fillStyle=sd; c.beginPath(); c.moveTo(-6,-6); c.lineTo(-5,-14); c.lineTo(-2,-16); c.lineTo(-3,-7); c.closePath(); c.fill();
  for(let i=0;i<3;i++) rect(c,0,-13+i*2,3,1,dk); rect(c,1-Math.round(wk*.5),-7,2,7,sk);
  rect(c,3,-18+ha,6,5,sk); rect(c,3,-14+ha,6,1,sd); if(e.state==='lunge'||e.state==='wind') rect(c,6,-14+ha,3,2,'#2a0c0c');
  rect(c,2,-19+ha,4,2,'#22201e'); rect(c,1,-18+ha,1,5,'#22201e');
  const aa=e.state==='wind'?-2.3:e.state==='lunge'?.15:.95+Math.sin(e.walk)*.2; c.save(); c.translate(3,-14); c.rotate(aa); rect(c,0,-1,9,2,sk); rect(c,9,-2,3,1,'#d8ccb0'); rect(c,9,0,3,1,'#d8ccb0'); c.restore(); }
function drawWraith(c,e){ const fl=Math.sin(time*6+e.seed);
  c.fillStyle='#29252f'; c.beginPath(); c.moveTo(-6,-18); c.lineTo(6,-18); c.lineTo(8,-6); for(let i=0;i<=8;i++){ const x=8-i*2; c.lineTo(x,-2+((i%2)?3:0)+Math.round(Math.sin(time*7+i+e.seed)*1.5)); } c.lineTo(-8,-6); c.closePath(); c.fill();
  c.fillStyle='#3d374a'; c.beginPath(); c.moveTo(-4,-17); c.lineTo(2,-17); c.lineTo(1,-4); c.lineTo(-5,-4); c.closePath(); c.fill();
  c.fillStyle='#29252f'; c.beginPath(); c.arc(0,-18,6.5,Math.PI,0); c.fill();
  rect(c,-2,-20+Math.round(fl*.5),5,6,'#cfc4aa'); rect(c,-2,-15+Math.round(fl*.5),5,1,'#9a8f78'); rect(c,-1,-18,1,2,'#0a0708'); rect(c,2,-18,1,2,'#0a0708');
  const reach=e.state==='dive'||e.state==='tele'; rect(c,4,-11,reach?7:3,1,'#bdb39c'); rect(c,reach?10:6,-12,2,1,'#bdb39c'); }
function drawBrute(c,e){ const wk=Math.round(Math.sin(e.walk)*2);
  rect(c,-7+wk,-12,6,12,'#3a2c24'); rect(c,-7+wk,-3,7,3,'#1e1612');
  rect(c,-10,-29,20,18,'#5e4330'); rect(c,-10,-29,6,18,'#47321f'); rect(c,-9,-28,18,8,'#6b5a4c'); rect(c,-9,-28,18,1,'#9a8a78'); rect(c,-10,-14,20,3,'#3a2016');
  rect(c,2-wk,-12,6,12,'#45342a'); rect(c,2-wk,-3,7,3,'#241a14');
  rect(c,-4,-37,9,9,'#4a4542'); rect(c,-4,-37,9,1,'#7a7470'); rect(c,-2,-33,7,1,'#0a0606');
  c.fillStyle='#cbbf9f'; c.beginPath(); c.moveTo(-4,-35); c.lineTo(-10,-40); c.lineTo(-8,-34); c.fill(); c.beginPath(); c.moveTo(5,-35); c.lineTo(9,-42); c.lineTo(8,-34); c.fill();
  const aa=e.state==='wind'?-2.3:e.state==='slam'?1.25:.55+Math.sin(e.walk)*.08;
  c.save(); c.translate(6,-25); c.rotate(aa); rect(c,0,-2.5,10,5,'#5e4330'); rect(c,10,-1,4,2,'#2a1a10'); rect(c,14,-6,15,11,'#58534f'); rect(c,14,3,15,2,'#aaa39a'); rect(c,28,-6,1,11,'#aaa39a'); rect(c,16,-4,6,3,'#5a1a14'); c.restore(); }
function drawHusk(c,e){ const wk=Math.round(Math.sin(e.walk)*2);
  rect(c,-3+wk,-9,3,9,'#2a2624'); rect(c,1-wk,-9,3,9,'#34302c'); rect(c,-3+wk,-2,4,2,'#151112'); rect(c,1-wk,-2,4,2,'#151112');
  rect(c,-4,-20,8,11,'#4a4440'); rect(c,-4,-20,3,11,'#36302e'); for(let y=-19;y<-11;y+=2) rect(c,-3,y,6,1,'#3e3834'); rect(c,-4,-11,8,2,'#2a1a14');
  rect(c,-5,-21,4,8,'#5a524a'); c.fillStyle='#6a6460'; c.beginPath(); c.moveTo(-4,-12); c.lineTo(-7,-6); c.lineTo(-3,-9); c.fill();
  rect(c,-3,-27,7,7,'#5a5048'); rect(c,-3,-27,7,1,'#8a7a6a'); rect(c,-4,-22,9,1,'#4a4038'); rect(c,1,-24,3,1,'#0a0606');
  const sa=e.state==='wind'?-.15:e.state==='thrust'?0:-1.1; c.save(); c.translate(2,-16); c.rotate(sa); rect(c,-10,-1,42,2,'#4a3020'); rect(c,32,-2,6,4,'#8a8a90'); rect(c,32,-2,6,1,'#c9c2b2'); c.restore();
  rect(c,3,-22,5,14,'#3a2e28'); rect(c,3,-22,5,1,'#6a5a48'); rect(c,7,-22,1,14,'#1e1612'); rect(c,4,-18,3,5,'#5a1414'); rect(c,5,-19,1,7,'#5a1414'); }
function drawBloat(c,e){ const sw=e.state==='swell'?1+(1-e.st/.9)*.4:1; const wk=Math.round(Math.sin(e.walk)*1.5);
  rect(c,-5+wk,-5,3,5,'#6a6a52'); rect(c,2-wk,-5,3,5,'#5a5a44');
  c.save(); c.translate(0,-12); c.scale(sw,sw);
  c.fillStyle='#8a8a68'; c.beginPath(); c.ellipse(0,0,9,9,0,0,Math.PI*2); c.fill(); c.fillStyle='#6a6a4a'; c.beginPath(); c.ellipse(-2,2,7,6,0,0,Math.PI*2); c.fill();
  c.strokeStyle='#5a2a2a'; c.lineWidth=1; c.beginPath(); c.moveTo(-6,-4); c.lineTo(-2,-1); c.lineTo(-4,4); c.moveTo(4,-6); c.lineTo(2,0); c.stroke();
  rect(c,-5,1,10,1,'#2a0a0a'); for(let i=-4;i<5;i+=2) rect(c,i,0,1,3,'#c8bca8');
  c.fillStyle='#a8a070'; c.beginPath(); c.arc(5,-3,2,0,Math.PI*2); c.fill(); c.beginPath(); c.arc(-6,3,1.5,0,Math.PI*2); c.fill(); c.restore();
  c.fillStyle='#8a8a68'; c.beginPath(); c.arc(3,-22*sw+1,3,0,Math.PI*2); c.fill(); rect(c,4,-21*sw+1,2,1,'#2a0a0a'); }
function drawCrawler(c,e){ const wk=Math.sin(e.walk*1.5); const lp=e.state==='leap';
  for(let i=0;i<4;i++){ const lx=-4+i*3, ph=Math.sin(e.walk*2+i*1.7)*2; c.strokeStyle='#a89a8a'; c.lineWidth=1; c.beginPath(); c.moveTo(lx,-4); c.lineTo(lx+ph-1,-7); c.lineTo(lx+ph+(lp?2:0),0); c.stroke(); }
  c.fillStyle='#c8bcae'; c.beginPath(); c.ellipse(0,-4,5,2.6,0,0,Math.PI*2); c.fill(); c.fillStyle='#d6cabc'; c.beginPath(); c.arc(5,-6+wk*.5,3,0,Math.PI*2); c.fill();
  rect(c,6,-6,2,1,'#2a0a0a'); rect(c,4,-8,1,1,'#120a0a'); rect(c,6,-8,1,1,'#120a0a'); }
function drawArcher(c,e){ const drawK=e.state==='draw'?1-e.st/.8:0;
  rect(c,-3,-9,2,9,'#bfb194'); rect(c,1,-9,2,9,'#a99c80'); rect(c,-3,-1,3,1,'#5a4a38'); rect(c,1,-1,3,1,'#5a4a38');
  rect(c,-3,-19,6,10,'#2a2228'); for(let i=0;i<3;i++) rect(c,-2,-17+i*2,4,1,'#cdbf9e');
  c.fillStyle='#2a2228'; c.beginPath(); c.moveTo(-5,-20); c.lineTo(-4,-27); c.lineTo(3,-27); c.lineTo(5,-20); c.fill(); rect(c,-1,-25,4,4,'#cdbf9e'); rect(c,1,-24,1,1,'#0a0606'); rect(c,-1,-21,4,1,'#9a8d70');
  c.strokeStyle='#5a3a24'; c.lineWidth=1.5; c.beginPath(); c.arc(4,-15,8,-1.2,1.2); c.stroke();
  c.strokeStyle='#cfc6b0'; c.lineWidth=1; const sx=4+Math.cos(1.2)*8-drawK*6; c.beginPath(); c.moveTo(4+Math.cos(-1.2)*8,-15+Math.sin(-1.2)*8); c.lineTo(sx,-15); c.lineTo(4+Math.cos(1.2)*8,-15+Math.sin(1.2)*8); c.stroke();
  if(drawK>0){ rect(c,sx,-15,12,1,'#8a7a6a'); } rect(c,-1,-16,6,1,'#bfb194'); }
function drawHanged(c,e){ const hang=e.state==='hang'; const wk=Math.round(Math.sin(e.walk)*2);
  if(hang){ rect(c,-2,-8,2,8,'#3a3236'); rect(c,1,-8,2,8,'#2a2428'); } else { rect(c,-3+wk,-8,2,8,'#3a3236'); rect(c,1-wk,-8,2,8,'#2a2428'); }
  rect(c,-4,-20,8,12,'#3a2e2a'); rect(c,-4,-20,3,12,'#2a201e'); rect(c,-3,-9,6,2,'#2a1a14');
  c.save(); c.translate(0,-26); c.rotate(hang?.5:.25); rect(c,-3,-4,7,8,'#6a5a44'); rect(c,-3,-4,7,1,'#8a7a5a'); rect(c,-1,2,4,1,'#2a1a14'); c.restore();
  rect(c,-1,-23,3,2,'#4a3a2a');
  const aa=e.state==='wind'?-2.2:e.state==='swipe'?.6:hang?1.5:1.2; for(const s of [-1,1]){ c.save(); c.translate(s*3,-18); c.rotate(aa+(s<0?.2:0)); rect(c,0,-1,16,2,'#9a8a78'); rect(c,16,-2,3,1,'#cdbf9e'); rect(c,16,1,3,1,'#cdbf9e'); c.restore(); } }
function drawWitch(c,e){ const fade=e.state==='fade'?e.st/.35:e.state==='appear'?1-e.st/.3:1; c.globalAlpha=clamp(fade,0,1);
  c.fillStyle='#1e1a1e'; c.beginPath(); c.moveTo(-5,-20); c.lineTo(4,-20); c.lineTo(7,-2); for(let i=0;i<=7;i++) c.lineTo(7-i*2,-2+((i%2)?3:0)+Math.round(Math.sin(time*5+i)*1)); c.lineTo(-7,-2); c.closePath(); c.fill();
  c.fillStyle='#2a242a'; c.beginPath(); c.moveTo(-6,-18); c.lineTo(-1,-28); c.lineTo(5,-19); c.fill();
  rect(c,1,-22,3,3,'#8a8070'); rect(c,4,-21,3,1,'#8a8070'); rect(c,2,-20,1,1,'#0a0606');
  rect(c,5,-14,1,1,'#bdb39c'); c.save(); c.translate(4,-14); c.rotate(-.5); rect(c,0,0,1,14,'#3a2a1e'); c.restore();
  rect(c,9,-27,3,4,'#4a3a2a'); c.globalAlpha=1; }
function drawChest(c,ch){ const op=ch.open, tr=ch.tier;
  if(tr===2){ rect(c,-14,-16,28,16,'#1a1416'); rect(c,-14,-16,28,1,'#5a4a4a'); for(let i=-12;i<14;i+=6) rect(c,i,-16,2,16,'#2a2226'); rect(c,-14,-4,28,2,'#3a1a1a');
    if(!op){ rect(c,-15,-23,30,7,'#241c1e'); rect(c,-15,-23,30,1,'#6a5050'); c.strokeStyle='#4a4650'; c.lineWidth=1; c.beginPath(); c.moveTo(-14,-22); c.lineTo(14,-2); c.moveTo(14,-22); c.lineTo(-14,-2); c.stroke(); rect(c,-3,-14,6,6,'#cdbf9e'); rect(c,-2,-13,1,1,'#120c0c'); rect(c,1,-13,1,1,'#120c0c'); }
    else { rect(c,-15,-34,30,8,'#241c1e'); rect(c,-15,-26,30,2,'#100a0a'); } return; }
  const rel=tr===1; const body=rel?'#36302f':'#4b3221', band=rel?'#b08a3a':'#5a5a62', lid=rel?'#433a38':'#5a3c27';
  rect(c,-9,-11,18,11,body); rect(c,-9,-11,18,1,rel?'#cfc2a2':'#6e4c32'); for(let i=-6;i<9;i+=5) rect(c,i,-11,1,11,'rgba(0,0,0,.35)');
  rect(c,-7,-11,2,11,band); rect(c,5,-11,2,11,band);
  if(rel){ rect(c,-2,-8,5,4,'#cdbf9e'); rect(c,-1,-7,1,1,'#1a1210'); rect(c,1,-7,1,1,'#1a1210'); }
  if(!op){ rect(c,-9,-16,18,5,lid); rect(c,-8,-17,16,1,lid); rect(c,-7,-16,2,5,band); rect(c,5,-16,2,5,band); rect(c,-1,-13,3,4,'#a08a50'); }
  else { rect(c,-9,-24,18,6,lid); rect(c,-9,-18,18,2,'#120a08'); rect(c,-7,-24,2,6,band); rect(c,5,-24,2,6,band); } }
function relicDraw(c,taken){
  c.fillStyle='#1c1618'; c.beginPath(); c.moveTo(-9,0); c.lineTo(-8,-9); c.lineTo(-3,-13); c.lineTo(2,-10); c.lineTo(5,0); c.fill();
  rect(c,-8,-9,4,9,'#141012'); rect(c,1,-3,8,3,'#1a1416'); rect(c,-4,-17,5,5,'#c9bc9c'); rect(c,-3,-15,1,1,'#120c0c'); rect(c,-1,-15,1,1,'#120c0c'); rect(c,-3,-13,3,1,'#9a8d70'); rect(c,-5,-17,2,3,'#2a2020');
  rect(c,-2,-8,6,1,'#5a0d0e'); if(!taken){ rect(c,12,-22,2,24,'#5f646d'); rect(c,12,-22,1,24,'#c9c2b2'); rect(c,9,-24,8,2,'#55505a'); rect(c,12,-30,2,6,'#4a3020'); rect(c,11,-31,4,2,'#6a5a48'); rect(c,12,-14,2,3,'#6a4a30'); } }
const EDRAW={ghoul:drawGhoul,wraith:drawWraith,brute:drawBrute,husk:drawHusk,bloat:drawBloat,crawler:drawCrawler,archer:drawArcher,hanged:drawHanged,witch:drawWitch};
function drawEnemies(){
  for(const e of enemies){ if(e.dead&&e.deadT>1.6&&!e.boss) continue; if(e.x-camR.x<-200||e.x-camR.x>W+200||e.y-camR.y<-120||e.y-camR.y>H+120) continue;
    if(e.boss){ drawBoss(e); continue; }
    const alpha=e.dead?clamp(1-(e.deadT-.8)/.8,0,1):1; const rot=e.dead?-Math.min(1.45,e.deadT*7)*(e.fly?0:1):0;
    if(e.type==='hanged'&&(e.state==='hang'||!e.dead)){ const sx=e.ax-camR.x, sy=e.ay-camR.y, ex=e.x-camR.x, ey=e.y-40-camR.y; if(e.state==='hang'){ ctx.strokeStyle='#4a3a2a'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(ex,ey+12); ctx.stroke(); } else { rect(ctx,Math.round(sx),Math.round(sy),1,22,'#4a3a2a'); } }
    if((e.champ||e.rare||e.unique)&&!e.dead){ const pulse=.5+.5*Math.sin(time*5+e.seed); const c=elemRim(e)||(e.unique?[255,150,60]:e.rare?[255,220,90]:[110,140,255]); e._rim=`rgba(${c[0]},${c[1]},${c[2]},${(.35+pulse*.25).toFixed(2)})`; addLight(e.x,e.y-e.h/2,e.unique?60:40,.5,c[0]/255,c[1]/255,c[2]/255);
      if((e.rare||e.unique)&&R()<.25) part({x:e.x+rnd(-e.w/2,e.w/2),y:e.y-rnd(0,e.h),vx:0,vy:-30,g:-10,life:.5,em:true,col:e.unique?'#ffa040':'#ffe070'}); }
    if(e.ceil) blit(g=>EDRAW[e.type](g,e),e.x,e.y-e.h,-e.face,{flash:e.flash>0?.35:0,alpha,rot:Math.PI});
    else blit(g=>EDRAW[e.type](g,e),e.x,e.y,e.face,{flash:e.flash>0?.35:0,alpha,rot,rim:(e.champ||e.rare||e.unique)&&!e.dead?e._rim:null,sx:e.small?.8:e.unique?1.15:undefined,sy:e.small?.8:e.unique?1.15:undefined});
    if(!e.dead){ const tele=(e.state==='wind'||e.state==='tele'||e.state==='draw'||e.state==='swell'||e.state==='cast');
      emisAt(e.x,e.y,e.face,g=>{ const T_=e.type; g.fillStyle=e.champ?'#9fc0ff':'#ff3a2a';
        if(T_==='ghoul'){ const ha=e.state==='wind'?-2:0; g.fillRect(7,-16+ha,1,1); if(tele) g.fillRect(6,-17+ha,3,3); }
        else if(T_==='wraith'){ g.fillStyle='#d2ffe0'; g.fillRect(-1,-17,1,1); g.fillRect(2,-17,1,1); if(tele){g.globalAlpha=.6;g.fillRect(-2,-19,6,4);g.globalAlpha=1;} }
        else if(T_==='brute'){ g.fillRect(1,-33,2,1); if(e.state==='wind'){ g.fillStyle='#fff2d0'; g.fillRect(-14,-46,3,3); } }
        else if(T_==='husk'){ g.fillStyle='#ff8a3a'; g.fillRect(2,-24,2,1); if(tele){ g.fillStyle='#fff2d0'; g.fillRect(28,-17,3,2); } }
        else if(T_==='bloat'&&e.state==='swell'){ g.fillStyle=`rgba(200,220,90,${(.3+.5*Math.sin(time*20)**2).toFixed(2)})`; g.fillRect(-5,-11,10,2); }
        else if(T_==='crawler'){ g.fillStyle='#ffe0b0'; g.fillRect(4,-8,1,1); g.fillRect(6,-8,1,1); }
        else if(T_==='archer'){ g.fillRect(1,-24,1,1); }
        else if(T_==='hanged'){ g.fillStyle='#ffd0a0'; g.fillRect(1,-27,1,1); }
        else if(T_==='witch'){ const f=.6+.4*Math.sin(time*9); g.fillStyle=`rgba(150,255,170,${f.toFixed(2)})`; g.fillRect(9,-27,3,3); g.fillStyle='#d2ffe0'; g.fillRect(2,-20,1,1); }
        else if(!e.ceil) enemyEmis(e,g); });
      enemyLight(e);
      if(e.type==='witch') addLight(e.x+e.face*10,e.y-26,60,.8,.45,1,.55);
      if(tele) addLight(e.x,e.y-e.h,30,.6,1,.3,.2);
      if(canExecute(e)) emisAt(e.x,e.y-e.h-7,1,g=>{ const s=.5+.5*Math.sin(time*10); g.fillStyle=`rgba(255,40,30,${(.6+s*.4).toFixed(2)})`; g.save(); g.rotate(Math.PI/4); g.fillRect(-2,-2,4,4); g.restore(); }); } }
}

/* ---------- projectiles ---------- */
function updProjs(dt){
  for(const p of projs){ p.life-=dt;
    if(p.homing){ const a=Math.atan2(P.y-14-p.y,P.x-p.x), sp=Math.hypot(p.vx,p.vy), cur=Math.atan2(p.vy,p.vx); let da=Math.atan2(Math.sin(a-cur),Math.cos(a-cur)); const na=cur+clamp(da,-2.4*dt,2.4*dt); p.vx=Math.cos(na)*sp; p.vy=Math.sin(na)*sp; }
    p.vy+=(p.g||0)*dt; p.x+=p.vx*dt; p.y+=p.vy*dt;
    if(!p.ghost&&(solidPx(p.x,p.y)||p.acid&&tileAt(Math.floor(p.x/T),Math.floor(p.y/T))===2&&p.vy>0)){ if(p.acid) acidPuddle(p.x,Math.floor(p.y/T)*T,p.dmg); p.life=0; sparks(p.x,p.y,3,p.type==='blood'?'#c4302a':undefined); if(p.type==='blood') decal(p.x,p.y,'#7a1012',2); continue; }
    if(p.from==='e'){ if(P.ghostT<=0&&Math.abs(p.x-P.x)<(p.r||3)+5&&p.y>P.y-P.h-(p.r||3)&&p.y<P.y+(p.r||3)){
        if(P.block&&Math.sign(p.x-P.x)===P.face){ if(time-P.blockT<.2){ p.from='p'; p.vx=-p.vx*1.2; p.vy=-Math.abs(p.vy)*.3; p.hits=new Set(); p.homing=0; p.dmg*=1.5; parry(null); continue; } p.life=0; AU.clang(); P.grit=Math.max(0,P.grit-5); continue; }
        hurtPlayer(p.dmg,{x:p.x-p.vx*.02}); if(p.acid) acidPuddle(p.x,P.y,p.dmg); if(!p.pierce) p.life=0; } }
    else if(p.from==='p'){ for(const e of enemies){ if(e.dead||e.intro||p.hits.has(e)) continue; if(overlap({x:p.x-p.r,y:p.y-p.r,w:p.r*2,h:p.r*2},eBox(e))){ p.hits.add(e);
        e.lastHit={cls:p.type==='bolt'?'xbow':p.type==='blood'?'lance':'dagger',el:p.type==='blood'?'blood':p.type==='ice'?'cold':p.type==='shard'?'bone':p.type==='bolt'?handEl(p.hand||'off'):null,t:time}; const crit=R()*100<P.stats.crit||P.clarT>0; const d=Math.round(p.dmg*(crit?2:1))+(p.type==='bolt'?elemHit(e,crit,p.hand||'off',Math.sign(p.vx)||1):0); if(canExecute(e)) execute(e,Math.sign(p.vx)||1); else dmgEnemy(e,d,crit,Math.sign(p.vx)||1,p.kb||80,false); AU.hit(crit); freeze=Math.max(freeze,.03);
        if(p.heal) P.life=Math.min(P.stats.life,P.life+p.heal); P.rage=Math.min(100,P.rage+2); P.hits++; P.hitT=1.6;
        if(!p.pierce){ p.life=0; break; } } } } }
  projs=projs.filter(p=>p.life>0); }
function drawProjs(){ for(const p of projs){ const sx=p.x-camR.x, sy=p.y-camR.y; if(sx<-20||sx>W+20||sy<-20||sy>H+20) continue; const a=Math.atan2(p.vy,p.vx);
  const line=(c,len,col,w)=>{ c.save(); c.translate(sx,sy); c.rotate(a); c.fillStyle=col; c.fillRect(-len,-(w||1)/2,len,w||1); c.restore(); };
  switch(p.type){
    case 'arrow': line(ctx,9,'#6a4a30'); line(ctx,2,'#c9c2b2'); break;
    case 'bolt': line(ctx,8,'#8a8a90',2); line(ectx,4,'rgba(255,240,220,.5)'); break;
    case 'blood': line(ectx,16,'rgba(200,30,20,.85)',3); line(ectx,8,'rgba(255,120,90,.9)',1); addLight(p.x,p.y,40,.6,1,.15,.1); if(R()<.5) part({x:p.x,y:p.y,vx:rnd(-20,20),vy:rnd(-20,20),g:200,life:.3,em:true,col:'#a01010'}); break;
    case 'wisp': ectx.fillStyle='rgba(150,255,170,.85)'; ectx.beginPath(); ectx.arc(sx,sy,3,0,Math.PI*2); ectx.fill(); line(ectx,8,'rgba(150,255,170,.3)',2); addLight(p.x,p.y,36,.6,.45,1,.55); break;
    case 'tear': ectx.fillStyle='rgba(200,20,16,.9)'; ectx.beginPath(); ectx.ellipse(sx,sy,2.5,4,a-Math.PI/2,0,Math.PI*2); ectx.fill(); break;
    case 'tooth': ctx.save(); ctx.translate(sx,sy); ctx.rotate(a); ctx.fillStyle='#e6dcc4'; ctx.beginPath(); ctx.moveTo(4,0); ctx.lineTo(-3,-2); ctx.lineTo(-3,2); ctx.fill(); ctx.restore(); break;
    case 'note': ectx.strokeStyle='rgba(230,200,255,.85)'; ectx.lineWidth=1; ectx.beginPath(); ectx.arc(sx,sy,4+Math.sin(time*20)*1,0,Math.PI*2); ectx.stroke(); ectx.fillStyle='rgba(255,220,255,.6)'; ectx.fillRect(sx-1,sy-1,2,2); break;
    case 'knife': ctx.save(); ctx.translate(sx,sy); ctx.rotate(a); ctx.fillStyle='#bdb6a8'; ctx.fillRect(-6,-1,9,2); ctx.fillStyle='#2a1a10'; ctx.fillRect(-9,-1,3,2); ctx.restore(); line(ectx,5,'rgba(255,220,140,.5)'); break;
    case 'orb': ectx.fillStyle='rgba(255,40,20,.9)'; ectx.beginPath(); ectx.arc(sx,sy,p.r,0,Math.PI*2); ectx.fill(); ctx.fillStyle='#120202'; ctx.fillRect(sx-1,sy-p.r*.6,2,p.r*1.2); addLight(p.x,p.y,40,.6,1,.2,.1); break;
    case 'acid': ectx.fillStyle='rgba(150,230,60,.85)'; ectx.beginPath(); ectx.arc(sx,sy,2.5,0,Math.PI*2); ectx.fill(); break;
    case 'wave': ectx.fillStyle='rgba(255,60,40,.8)'; ectx.beginPath(); ectx.moveTo(sx,sy-14); ectx.quadraticCurveTo(sx+Math.sign(p.vx)*10,sy-7,sx,sy); ectx.quadraticCurveTo(sx+Math.sign(p.vx)*4,sy-7,sx,sy-14); ectx.fill(); addLight(p.x,p.y-7,40,.5,1,.2,.1); break;
    default: ectx.fillStyle='#fff'; ectx.fillRect(sx-1,sy-1,2,2);
  } } }

/* ---------- effects list ---------- */
function updFX(dt){ for(const f of fx){ f.t+=dt; if(f.upd) f.upd(f,dt); } fx=fx.filter(f=>f.t<f.dur); }
function drawFX(){ for(const f of fx) if(f.draw) f.draw(f); }

/* ---------- drops ---------- */
function updDrops(dt){
  for(const d of drops){ if(d.kind==='orb'){ const dx=P.x-d.x, dy=P.y-12-d.y, dd=Math.hypot(dx,dy); if(dd<70&&d.t>.4){ d.vx=dx/dd*260; d.vy=dy/dd*260; d.x+=d.vx*dt; d.y+=d.vy*dt; if(dd<10){ d.gone=true; P.life=Math.min(P.stats.life,P.life+P.stats.life*.05); P.grit=Math.min(100,P.grit+12); AU.tone('sine',600,900,.12,.08,.3); } d.t=(d.t||0)+dt; continue; } d.t=(d.t||0)+dt; }
    d.vy=(d.vy||0)+700*dt; d.vx=approach(d.vx||0,0,120*dt); d.x+=d.vx*dt; const ny=d.y+d.vy*dt; const tv=tileAt(Math.floor(d.x/T),Math.floor(ny/T));
    if(d.vy>0&&(tv===1||tv===2)){ d.y=Math.floor(ny/T)*T; d.vy=0; } else d.y=ny;
    if(tileAt(Math.floor(d.x/T),Math.floor((d.y-2)/T))===1){ d.x-=d.vx*dt; d.vx=-d.vx*.3; }
    const dx=d.x-P.x, dy=d.y-(P.y-8);
    if(d.kind==='gold'&&dx*dx+dy*dy<18*18&&!P.dead){ d.gone=true; P.gold+=d.n; AU.coin(); num(d.x,d.y-10,'+'+d.n,'#e8c25a'); }
    if(d.kind==='potion'&&dx*dx+dy*dy<16*16&&P.potions<4){ d.gone=true; P.potions++; updBelt(); AU.coin(); }
    if(d.y>L.h*T+40) d.gone=true; }
  drops=drops.filter(d=>!d.gone); }
function drawDrops(){ for(const d of drops){ const sx=Math.round(d.x-camR.x), sy=Math.round(d.y-camR.y); if(sx<-20||sx>W+20||sy<-30||sy>H+20) continue;
  if(d.kind==='gold'){ rect(ctx,sx-2,sy-2,4,2,'#9a7a2a'); rect(ctx,sx-1,sy-3,2,1,'#e8c25a'); if(Math.sin(time*6+d.x)>.8){ ectx.fillStyle='#fff3c0'; ectx.fillRect(sx,sy-4,1,1);} if(d.big){ rect(ctx,sx-4,sy-4,8,4,'#7a1012'); emisAt(d.x,d.y,1,g=>{g.fillStyle='rgba(255,60,40,.5)';g.fillRect(-3,-6,6,2);}); } }
  else if(d.kind==='potion'){ rect(ctx,sx-2,sy-6,4,5,'#7a0e10'); rect(ctx,sx-1,sy-6,1,2,'#e05a40'); rect(ctx,sx-1,sy-8,2,2,'#6d5a4a'); addLight(d.x,d.y-4,24,.4,1,.2,.15); }
  else if(d.kind==='orb'){ const p=.6+.4*Math.sin(time*10+d.x); ectx.fillStyle=`rgba(220,30,20,${p.toFixed(2)})`; ectx.beginPath(); ectx.arc(sx,sy-3,2.5,0,Math.PI*2); ectx.fill(); addLight(d.x,d.y-3,22,.5,1,.15,.1); }
  else { const bob=Math.round(Math.sin(time*3+d.x)*1); ctx.drawImage(getIcon(d.item),sx-7,sy-15+bob,14,14); const col=hex(RCOL[d.item.rarity]);
    if(d.item.rarity>0){ ectx.fillStyle=`rgba(${col[0]},${col[1]},${col[2]},.25)`; ectx.fillRect(sx,sy-60,1,58); addLight(d.x,d.y-8,30+d.item.rarity*10,.5+d.item.rarity*.15,col[0]/255,col[1]/255,col[2]/255); } } } }

function wcls(h){ const w=h==='off'?P.equip.off:P.equip.weapon; return w&&w.base?w.base.cls:'fist'; }
function handEl(h){ const w=h==='off'?P.equip.off:P.equip.weapon, we=w&&w.aff.find(a=>ELEM_KEYS.includes(a.k)); if(we) return we.k; const m=P.stats.elm&&P.stats.elm[h]; const ks=m?Object.keys(m):[]; return ks.length?pick(ks):null; }
