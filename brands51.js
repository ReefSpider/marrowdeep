'use strict';
/* ===== the Marrow, stage 2 (v47): Grave Slam, Stillness and the eighteen forks =====
   Plan: claude/talents-plan.md section 2. Art: arttree.js (Codex). Notes: claude/v47-notes.md.
   tree50.js owns the tree; this file is what the Brand nodes do in play. Every Brand has two forks, one of which can be
   held at a time, and every fork wears a role tag (力 Might, 技 Finesse, 耐 Fortitude) and scales with that attribute.

   actors.js calls in here by name where a Brand already lived there (castHem, performIai, thousandCuts, updShade, castBell,
   die, the plunge landing) and tactics.js (the live castBell); everything else is a wrapper below. All numbers are in BK. */
const BK={
  slamCd:4, slamR:64, slamMul:1.4, slamUp:-270, slamLaunch:.7,
  ossMig:.4, ossMax:40, ossStacks:3,                  /* Ossuary Crash: +px radius per Might, capped; Brittle stacks */
  galeUp:-350, galeLaunch:1.1, galeFin:.02, galeMinCd:2, /* Gale Crash: higher throw; −s cooldown per Finesse */
  stillForm:1, stillSlow:.5, stillInv:.4,
  frozR:70, frozFort:.5, hallMul:1.4, hallMig:.01,
  pactFin:.5,                                          /* Crimson Pact: +% damage per Finesse (1% per 2) */
  spikeMul:1.9, spikeBleed:.2, spikeStun:.5, spikeMig:.02,
  ironRage:120, ironCut:.30, ironFort:.002, ironMax:.5,
  mawRage:1.5, mawBleed:.10, mawMig:.001,
  thunder:.25, thunderFin:.002,
  longT:1, longLen:200, longMul:2,
  markT:5, markFin:.03,
  decoyT:2, decoyFort:.02, decoyR:110,
  needles:10, needleMul:.3, needleRot:.15, needleFin:.01,
  execs:6, execMul:.8, execMig:.005, execR:170,
  tollT:4, tollFort:.02, tollCut:.2,
  drownFin:.8, drownMax:200,
  martyrHeal:.30, martyrR:120,
  vengeBurn:.5, vengeMig:.01 };
const bAttr=k=>(P&&P.stats&&P.stats[k])||0;
const bMine=()=>P&&!P._remote&&P===TREE.owner;
const bFx=(dur,draw,t0)=>fx.push({t:t0||0,dur,draw(f){ if(f.t<0) return; draw(ectx,f.t); }});
const bSX=x=>Math.round(x-camR.x), bSY=y=>Math.round(y-camR.y);

/* ---------- Grave Slam 墓: the plunge becomes a crash ---------- */
function graveSlamLand(p){ if(!bMine()||(p.cd.slam||0)>0) return; const oss=has('ossuary-crash'), gale=has('gale-crash');
  p.cd.slam=gale?Math.max(BK.galeMinCd,BK.slamCd-bAttr('fin')*BK.galeFin):BK.slamCd;
  const r=BK.slamR+(oss?Math.min(BK.ossMax,bAttr('mig')*BK.ossMig):0), id=++swingId, x=p.x, y=p.y;
  shake(9); freeze=Math.max(freeze,.12); impactT=Math.max(impactT,.05); AU.boom&&AU.boom(.5);
  for(const e of enemies){ if(e.dead||e.intro||Math.abs(e.x-x)>r+e.w/2||e.y<y-40||e.y-e.h>y+10) continue;
    strike(e,MV.plunge,id,'main',Math.sign(e.x-x)||p.face,BK.slamMul); if(e.dead) continue;
    const heavy=e.boss||e.type==='brute'||e.type==='knight'||e.unique;
    if(!heavy&&!e.fly){ e.vy=gale?BK.galeUp:BK.slamUp; e.launchT=gale?BK.galeLaunch:BK.slamLaunch; e.stun=Math.max(e.stun||0,.6); if(gale){ stOf(e).gale={t:.9}; e.vx=Math.sign(e.x-x||1)*40; } }
    if(oss){ const s=stOf(e); s.brittle={t:4,n:Math.min(4,(s.brittle?s.brittle.n:0)+BK.ossStacks)}; } }
  const variant=oss?'ossuary':gale?'gale':'plain', seed=(x|0)&255;
  bFx(1.2,(c,t)=>TreeArt.graveSlam(c,bSX(x),bSY(y),t,{variant,seed,reducedMotion:RM})); }

/* ---------- Stillness 澄: stand a second and a ward forms; it takes one hit ---------- */
const STILL={t:0,form:0,up:false,brk:-9,bx:0,by:0};
function stillBreak(src){ const frozen=has('frozen-stillness'), hall=has('hallowed-stillness'); STILL.up=false; STILL.t=0; STILL.brk=time; STILL.bx=P.x; STILL.by=P.y;
  P.clarT=Math.max(P.clarT||0,BK.stillSlow); P.inv=Math.max(P.inv,BK.stillInv); AU.slow&&AU.slow(); AU.clang(); impactT=Math.max(impactT,.05); sparks(P.x,P.y-14,10,frozen?'#8fd0ff':hall?'#ffe6a8':'#ece6d8');
  const x=P.x, y=P.y, variant=frozen?'frozen':hall?'hallowed':'plain'; bFx(.7,(c,t)=>TreeArt.stillness(c,bSX(x),bSY(y),t,{phase:'break',variant,reducedMotion:RM}));
  if(frozen){ const r=BK.frozR+bAttr('fort')*BK.frozFort; for(const e of live(x,y-14,r)) dmgEnemy(e,Math.round(applyElem(e,'cold',wAvg()*.3,Math.sign(e.x-x)||1)),false,Math.sign(e.x-x)||1,40,false); }
  if(hall){ const tx=src&&src.x!=null&&!src.dead&&src.h?src.x:x, ty=src&&src.y!=null&&!src.dead&&src.h?src.y:y; judgement(tx,ty,wAvg()*BK.hallMul*(1+bAttr('mig')*BK.hallMig),44,false); } }
(function(){ const o=updPlayer; updPlayer=function(dt){ const r=o(dt); if(!bMine()||P.dead||!has('still')){ STILL.up=false; STILL.t=0; return r; }
  const still=P.onGround&&Math.abs(P.vx)<8&&!P.attack&&!P.iai&&P.dash<=0&&P.hurtT<=0&&!P.block;
  if(STILL.up) return r; if(!still){ STILL.t=0; return r; }
  STILL.t+=dt; if(STILL.t>=BK.stillForm){ STILL.up=true; STILL.form=time; AU.ting&&AU.ting(); } return r; }; })();
(function(){ const o=hurtPlayer; hurtPlayer=function(d,src){ if(!bMine()||P.dead||mode!=='play') return o(d,src);
  if(STILL.up&&P.dash<=0&&P.inv<=0&&!(P.ghostT>0)){ stillBreak(src); return; }
  /* forks that take the edge off a blow */
  if(P.houndT>0&&has('black-iron')) d*=1-Math.min(BK.ironMax,BK.ironCut+bAttr('fort')*BK.ironFort);
  if(P.tollT>time) d*=1-BK.tollCut;
  const l0=P.life, r=o(d,src);
  if(has('black-iron')&&P.houndT<=0&&P.life<l0) P.rage=Math.min(100,P.rage+(l0-P.life)/P.stats.life*BK.ironRage);
  return r; }; })();
/* the ward, drawn round the hero */
(function(){ const o=drawFX; drawFX=function(){ o(); if(!P||P.dead||!has('still')||!bMine()) return; const variant=has('frozen-stillness')?'frozen':has('hallowed-stillness')?'hallowed':'plain';
  if(STILL.up) TreeArt.stillness(ectx,bSX(P.x),bSY(P.y),time-STILL.form,{phase:time-STILL.form<.25?'form':'hold',variant,reducedMotion:RM});
  else if(STILL.t>.15) TreeArt.stillness(ectx,bSX(P.x),bSY(P.y),STILL.t/BK.stillForm,{phase:'form',variant,reducedMotion:RM}); }; })();

/* ---------- Hemorrhage 血 ---------- */
function hemMod(){ if(has('pact')) return {dm:1+bAttr('fin')*BK.pactFin/100};
  if(has('heart-spike')){ const f=P.face, x=P.x+f*8, y=P.y; return {dm:BK.spikeMul,spike:true,cast(){ bFx(1.2,(c,t)=>TreeArt.heartSpike(c,bSX(x),bSY(y),t,{direction:f,reducedMotion:RM})); }}; }
  return {dm:1}; }
function spikeHit(e,d,dir){ if(e.dead) return; addBleed(e,d*BK.spikeBleed,2); const m=1+bAttr('mig')*BK.spikeMig;
  if(e.boss) bossStagAdd(e,d*m,true,false); else { e.stun=Math.max(e.stun||0,BK.spikeStun*m); e.reelT=.3; } }

/* ---------- The Hound 獣 ---------- */
(function(){ const o=dmgEnemy; dmgEnemy=function(e,d,crit,dir,kb,heavy,launch,stun){ const h0=e?e.hp:0, r=o(e,d,crit,dir,kb,heavy,launch,stun);
  if(e&&bMine()&&has('red-maw')&&!BK._in&&e.hp<h0){ if(P.houndT>0){ if(!e.dead&&P.attack){ BK._in=1; try{ addBleed(e,(h0-Math.max(0,e.hp))*(BK.mawBleed+bAttr('mig')*BK.mawMig)); } finally{ BK._in=0; } }
      if(P.attack&&!P.attack._maw){ P.attack._maw=1; const f=P.face, x=P.x, y=P.y; bFx(.75,(c,t)=>TreeArt.redMaw(c,bSX(x),bSY(y),t,{direction:f,reducedMotion:RM})); } }
    else P.rage=Math.min(100,P.rage+BK.mawRage); }
  return r; }; })();

/* ---------- Iaidō 居 ---------- */
function iaiMod(hold){ if(has('long-draw')){ const k=clamp((hold-.42)/BK.longT,0,1), f=P.face; return {len:Math.round(120+(BK.longLen-120)*k),dm:1+(BK.longMul-1)*k,cast(sx,ex){ const y=P.y; bFx(.9,(c,t)=>TreeArt.longDraw(c,bSX(ex-f*30),bSY(y),t+.6,{direction:f,reducedMotion:RM})); }}; }
  if(has('thunder-draw')){ const f=P.face; return {len:120,dm:1,hit(e,dmg){ if(e.dead) return; const x=e.x, y=e.y; dmgEnemy(e,Math.round(applyElem(e,'shock',dmg*(BK.thunder+bAttr('fin')*BK.thunderFin),f)),false,f,0,false); zap(x,y-e.h-30,x,y-e.h/2); }}; }
  return {len:120,dm:1}; }

/* ---------- Shade Step 影 ---------- */
function shadeHit(id){ if(!has('marking-shade')) return; for(const e of enemies){ if(e.dead||e.hitId!==id) continue; const s=stOf(e); if(!s.mark||s.mark.t<1){ burst(e.x,e.y-e.h/2,4,'#a070ff',60,-30); } s.mark={t:BK.markT+bAttr('fin')*BK.markFin}; } }
(function(){ const o=updPlayer; updPlayer=function(dt){ const had=P&&P.shade; const r=o(dt); if(!bMine()||!has('decoy')) return r; const sh=P.shade;
  if(sh&&sh!==had){ sh.decoyT=BK.decoyT+bAttr('fort')*BK.decoyFort; sh.t=Math.max(sh.t,sh.decoyT); }
  if(sh&&sh.decoyT>0){ sh.decoyT-=dt; for(const e of enemies){ if(e.dead||e.intro||e.boss||Math.abs(e.x-sh.x)>BK.decoyR||Math.abs(e.y-sh.y)>50) continue; e.stun=Math.max(e.stun||0,.15); e.face=Math.sign(sh.x-e.x)||e.face; e.decoyT=time+.2; } }
  return r; }; })();
(function(){ const o=drawFX; drawFX=function(){ o(); if(!P||!P.shade||!(P.shade.decoyT>0)) return; for(const e of enemies){ if(e.dead||!(e.decoyT>time)) continue; const sx=bSX(e.x), sy=bSY(e.y-e.h)-7; ectx.fillStyle='rgba(200,30,24,.85)'; ectx.fillRect(sx-2,sy,4,4); ectx.fillStyle='rgba(255,140,120,.9)'; ectx.fillRect(sx-1,sy+1,2,2); } }; })();

/* ---------- Thousand Cuts 千 ---------- */
function thouAlt(){ const needles=has('rain-of-needles'), execs=has('six-executioners'); if(!needles&&!execs) return false; const x0=P.x, y0=P.y, f=P.face;
  if(needles){ const n=BK.needles; bFx(1.5,(c,t)=>TreeArt.bladeRain(c,bSX(x0+f*24),bSY(y0),t,{variant:'needles',direction:f,reducedMotion:RM}));
    for(let i=0;i<n;i++){ const id=++swingId, bx=x0+f*24+(i-(n-1)/2)*10; fx.push({t:-i*.045,dur:.7,hit:false,upd(g){ if(!g.hit&&g.t>=.6){ g.hit=true; for(const e of enemies){ if(e.dead||e.intro||Math.abs(e.x-bx)>e.w/2+7||e.y<y0-60||e.y-e.h>y0+8) continue; strike(e,MV.slash,id,'main',f,BK.needleMul); if(!e.dead) addRot(e,wAvg()*BK.needleRot*(1+bAttr('fin')*BK.needleFin)); } } }}); }
    return true; }
  let tg=null, bd=BK.execR; for(const e of enemies){ if(e.dead||e.intro) continue; const d=Math.hypot(e.x-x0,e.y-y0); if(d<bd){ bd=d; tg=e; } }
  const tx=tg?tg.x:x0+f*30, ty=tg?tg.y:y0; bFx(1.7,(c,t)=>TreeArt.bladeRain(c,bSX(tg&&!tg.dead?tg.x:tx),bSY(tg&&!tg.dead?tg.y:ty),t,{variant:'executioners',direction:f,reducedMotion:RM}));
  for(let i=0;i<BK.execs;i++){ const id=++swingId; fx.push({t:-i*.085,dur:.75,hit:false,upd(g){ if(!g.hit&&g.t>=.62){ g.hit=true; AU.swing(true); if(tg&&!tg.dead) strike(tg,MV.slash,id,'main',Math.sign(tg.x-x0)||f,BK.execMul*(1+bAttr('mig')*BK.execMig)); } }}); }
  return true; }

/* ---------- Funeral Bell 鐘 ---------- */
function bellR(){ return has('drowning-bell')?Math.min(BK.drownMax,140+bAttr('fin')*BK.drownFin):140; }
function bellHit(e){ if(has('drowning-bell')){ const s=stOf(e); s.soak={t:4}; delete s.burn; }
  if(has('toll-for-me')&&!e.boss){ e.lockP=P; e.lockT=time+BK.tollT+bAttr('fort')*BK.tollFort; } }
function bellCast(x,y){ if(has('toll-for-me')){ P.tollT=time+BK.tollT+bAttr('fort')*BK.tollFort; bFx(1.5,(c,t)=>TreeArt.remainingEffect(c,'toll-for-me',bSX(P.x),bSY(P.y),t,{reducedMotion:RM})); }
  if(has('drowning-bell')) bFx(1.5,(c,t)=>TreeArt.remainingEffect(c,'drowning-bell',bSX(x),bSY(y+20),t,{reducedMotion:RM})); }

/* ---------- Last Breath 息 ---------- */
function lastBreathFired(){ if(has('martyr-s-breath')){ const x=P.x, y=P.y; bFx(1.6,(c,t)=>TreeArt.remainingEffect(c,'martyrs-breath',bSX(x),bSY(y),t,{reducedMotion:RM}));
    if(typeof COOP!=='undefined'&&COOP&&typeof everyone==='function') everyone({t:'mb',s:NET.me,x:Math.round(x),y:Math.round(y),ep:NET.epoch}); }
  if(has('vengeful-shade')){ bFx(4,(c,t)=>{ if(P&&P.ghostT>0) TreeArt.remainingEffect(c,'vengeful-shade',bSX(P.x),bSY(P.y),t%1.6,{reducedMotion:RM}); }); } }
function ghostHit(id){ if(!has('vengeful-shade')) return; for(const e of enemies){ if(e.dead||e.hitId!==id) continue; setBurn(e,wAvg()*BK.vengeBurn*(1+bAttr('mig')*BK.vengeMig)); } }
/* Martyr's Breath reaches allies: the host passes it on; each hero near enough heals. At most one a sender every 5 s. */
(function(){ if(typeof onMsg!=='function') return; const last={}; const o=onMsg; onMsg=function(s,m){ if(!m||m.t!=='mb') return o(s,m);
  if(typeof NET==='undefined'||!NET.running||!Number.isFinite(m.x)||!Number.isFinite(m.y)||!Number.isInteger(m.s)) return;
  if(NET.host){ if(s!==m.s) return; /* a guest can only speak for its own seat */ if(last[m.s]>time) return; last[m.s]=time+5; bcast(m); }
  if(m.s===NET.me||m.ep!==NET.epoch||!P||P.dead) return; if(Math.hypot(P.x-m.x,P.y-m.y)>BK.martyrR) return;
  P.life=Math.min(P.stats.life,P.life+P.stats.life*BK.martyrHeal); burst(P.x,P.y-14,12,'#ffe6a8',80,-40); AU.ting&&AU.ting(); }; })();

/* cooldown slot for the slam, and a clean slate each level */
(function(){ const o=newPlayer; newPlayer=function(){ const p=o(); p.cd.slam=0; return p; }; })();
(function(){ const o=loadLevel; loadLevel=function(i,opt){ STILL.up=false; STILL.t=0; if(P){ P.tollT=0; if(P.cd&&P.cd.slam==null) P.cd.slam=0; } return o(i,opt); }; })();
