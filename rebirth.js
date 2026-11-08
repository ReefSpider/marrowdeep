'use strict';
/* ===== rebirth (v23): falling into spikes costs something, being stuck has a way out, death cleans you,
   the dash is a dive, the Hound no longer covers the screen, and every ability says what it does =====
   - Spikes, lava and the bottomless fall take a quarter of your life (was 18%) and you don't just reappear:
     the body is gone, a beam of light comes down on the last safe ground, and you form inside it (about 1.6 s).
   - Pause → "I'm stuck · respawn": unlocks after 10 seconds, then brings you down the same beam on safe ground
     from a little while ago (or the level's start).
   - Burning, rot, bleeding and the rest are wiped when you die, so nothing kills you again after you rise.
   - Dash: a low forward dive with after-images, then a short tuck as you land.
   - Hover the ability slots (1–4) and the draught belt for what they do, what they cost and how long they take. */

/* ---------- the beam ---------- */
function beamRespawn(x,y){ const p=P; p.beam={t:0,dur:1.6,x,y,fx:p.x,fy:p.y}; p.x=x; p.y=y; p.vx=p.vy=0; p.inv=Math.max(p.inv,2.6); p.attack=null; p.teth=null; p.iai=null; p.dash=0;
  ash(p.beam.fx,p.beam.fy-14,24); AU.tone('sine',220,110,.8,.12,.6); }
(function(){ const o=updPlayer; updPlayer=function(dt){ const p=P; if(p&&p.beam&&!p.dead){ const b=p.beam; b.t+=dt; p.vx=p.vy=0; p.x=b.x; p.y=b.y; p.inv=Math.max(p.inv,1.2); p.attack=null;
      if(b.t>.35&&!b.snd){ b.snd=1; [1,1.5,2,2.5].forEach((m,i)=>AU.tone('sine',330*m,330*m,1.4,.05,.8,i*.07)); }
      if(b.t<1.1&&R()<.7) part({x:b.x+rnd(-5,5),y:b.y-rnd(0,60),vx:0,vy:rnd(-60,-20),g:0,life:rnd(.3,.6),em:true,col:pick(['#fff6d8','#ffe1a0','#ffffff'])});
      if(b.t>=.95&&!b.land){ b.land=1; dust(b.x,b.y,14); sparks(b.x,b.y-14,10,'#fff6d8'); shake(2); }
      if(b.t>=b.dur){ p.beam=null; p.inv=Math.max(p.inv,1); } return; }
    if(p&&p.onGround&&!p.dead&&!p.plat&&p.safe){ const tr=p.safeTrail||(p.safeTrail=[]); const l=tr[tr.length-1]; if(!l||Math.hypot(l.x-p.safe.x,l.y-p.safe.y)>40){ tr.push({x:p.safe.x,y:p.safe.y,t:time}); if(tr.length>24) tr.shift(); } }
    return o(dt); }; })();
function drawBeam(){ const b=P&&P.beam; if(!b) return; const sx=b.x-camR.x, sy=b.y-camR.y, k=b.t/b.dur;
  const w=k<.6?2+10*(1-k/.6):2+Math.max(0,(k-.6))*4, a=k<.85?.75:Math.max(0,(1-k)/.15*.75);
  const gr=ectx.createLinearGradient(0,0,0,sy); gr.addColorStop(0,'rgba(255,240,200,0)'); gr.addColorStop(.6,`rgba(255,240,210,${(a*.6).toFixed(2)})`); gr.addColorStop(1,`rgba(255,250,235,${a.toFixed(2)})`);
  ectx.fillStyle=gr; ectx.fillRect(Math.round(sx-w/2),0,Math.round(w),Math.round(sy)); ectx.fillStyle=`rgba(255,255,245,${(a*.9).toFixed(2)})`; ectx.fillRect(Math.round(sx),0,1,Math.round(sy));
  ectx.fillStyle=`rgba(255,240,200,${(a*.5).toFixed(2)})`; ectx.fillRect(Math.round(sx-10),Math.round(sy-1),20,1);
  addLight(b.x,b.y-20,110,1.2*a+.2,1,.92,.75); }
(function(){ const o=drawHeroAndFX; drawHeroAndFX=function(){ const b=P&&P.beam;
  if(b&&b.t<.9){ drawBeam(); return; }
  if(b){ const k=clamp((b.t-.9)/.5,0,1); const sv=P.ghostT; o(); if(k<1) blit(drawHero,P.x,P.y,P.face,{alpha:1-k,outline:'#fff6e6',ghost:'rgba(255,250,235,.9)',noOutline:true}); P.ghostT=sv; drawBeam(); return; }
  /* the dive: lift the body a little while the pose leans it forward */
  if(P&&P.dash>0&&!P.dead){ const k=clamp((P.dashAge||0)/.17,0,1), lift=Math.round(Math.sin(k*Math.PI)*5); P.y-=lift; try{ o(); } finally{ P.y+=lift; } return; }
  return o(); }; })();

/* ---------- the dive ---------- */
(function(){ const o=heroPose; heroPose=function(){ const r=o(); const p=P; if(!p||p.dead) return r;
  if(p.dash>0){ const k=clamp((p.dashAge||0)/.17,0,1); const lean=k<.3?k/.3:k>.8?(1-k)/.2*.6+.4:1; return {rot:.25+.95*lean,sx:1.12,sy:.84}; }
  if(p.diveT>0){ const k=p.diveT/.14; return {rot:r.rot+.25*k,sx:r.sx*(1+.12*k),sy:r.sy*(1-.14*k)}; }
  return r; }; })();
(function(){ const o=updPlayer; updPlayer=function(dt){ const p=P; const was=p&&p.dash>0; if(p&&p.diveT>0) p.diveT-=dt; o(dt);
  if(!p||p.dead||p.beam) return;
  if(p.dash>0){ p._gh=(p._gh||0)-dt; if(p._gh<=0){ p._gh=.035; ghosts.push({x:p.x,y:p.y-Math.round(Math.sin(clamp((p.dashAge||0)/.17,0,1)*Math.PI)*5),face:p.face,a:p.swordA,life:.16}); }
    if(R()<.6) part({type:'dust',x:p.x-p.face*rnd(4,10),y:p.y-rnd(1,4),vx:-p.face*rnd(20,60),vy:rnd(-20,-5),g:-10,life:rnd(.2,.4),col:'rgba(160,140,120,.45)',size:ri(1,2)}); }
  else if(was){ p.diveT=.14; if(p.onGround) dust(p.x,p.y,5); } }; })();

/* ---------- death wipes damage over time ---------- */
function clearHeroDots(){ if(!P) return; P.burn=null; P.poison=null; P.bleedS=null; P.chillT=0; P.soakT=0; P.brittleT=0; P.shadowT=0; }
(function(){ const o=die; die=function(){ o(); if(P&&P.dead) clearHeroDots(); }; })();
(function(){ const o=respawn; respawn=function(){ clearHeroDots(); const r=o.apply(this,arguments); clearHeroDots(); if(P) P.beam=null; return r; }; })();
(function(){ const o=loadLevel; loadLevel=function(idx,opt){ const r=o(idx,opt); clearHeroDots(); if(P){ P.beam=null; P.safeTrail=[]; P._stuckAt=performance.now(); } return r; }; })();
/* ground fire and rot clouds you left burning don't wait for you either */
(function(){ const o=onDeath; onDeath=function(){ try{ if(typeof flames!=='undefined') flames.length=0; if(typeof clouds!=='undefined') clouds.length=0; }catch(e){} clearHeroDots(); return o.apply(this,arguments); }; })();

/* ---------- I'm stuck ---------- */
const STUCK_WAIT=10;
function unstickSpot(){ const tr=(P.safeTrail||[]).filter(s=>Math.hypot(s.x-P.x,s.y-P.y)>40&&time-s.t>3); const s=tr[tr.length-1]; return s?{x:s.x,y:s.y}:{x:L.spawn.x,y:L.spawn.y}; }
function stuckLeft(){ return Math.max(0,STUCK_WAIT-(performance.now()-(P._stuckOpen||performance.now()))/1000); }
(function(){ const o=openPause; openPause=function(){ o(); if(!P) return; P._stuckOpen=performance.now(); let b=$('#pStuck'); const col=$('#pause .col');
  if(!b&&col){ b=document.createElement('button'); b.className='btn ghost'; b.id='pStuck'; col.insertBefore(b,$('#pTitle')||null);
    b.onclick=()=>{ if(stuckLeft()>0||!P||P.dead||!L||L.def.kind==='cabin') return; const s=unstickSpot(); closePause(); P.safe={x:s.x,y:s.y}; beamRespawn(s.x,s.y); toast('Pulled out of the dark, back to safe ground.'); }; }
  if(!b) return; const can=L&&L.def.kind!=='cabin'&&!P.dead; b.hidden=!can; const tick=()=>{ if($('#pause').hidden||!b.isConnected) return; const left=Math.ceil(stuckLeft()); b.disabled=left>0; b.textContent=left>0?`I'm stuck · respawn (${left})`:"I'm stuck · respawn on safe ground"; if(left>0) setTimeout(tick,250); };
  tick(); }; })();

/* ---------- ability tooltips ---------- */
const AB_INFO={hem:{cost:'7% of your life',cd:()=>`${CD.hem}s`,extra:'Aims at the mouse.'},teth:{cost:'15 grit',cd:()=>`${CD.teth}s`,extra:'Hold Up to throw it straight up. Snaps to iron rings.'},
  hound:{cost:'A full rage bar (fills as you bleed and make others bleed)',cd:()=>'10s of Hound, then 2.5s winded',extra:'+50% attack rate, +25% damage, take 40% less, every blow steals life, no flinching.'},
  bell:{cost:'40 grit',cd:()=>`${CD.bell}s`,extra:'Stuns everything within reach for 2.6s. No damage. Bosses take a stagger jolt.'}};
function abTip(id){ const s=SKILLS.find(x=>x.id===id); if(!s) return ''; const b=BRANCH[s.br], i=AB_INFO[id]||{}, on=has(id);
  let state=''; if(on){ if(id==='hound') state=P.houndT>0?`Worn · ${P.houndT.toFixed(1)}s left`:`Rage ${Math.floor(P.rage)}%`; else { const cd=P.cd&&P.cd[id]||0; state=cd>0?`Ready in ${cd.toFixed(1)}s`:'Ready'; } }
  return `<div style="color:${b.c};font-size:1.15em">${s.k}　${s.name} <span class="g">· key ${s.key}</span></div>`+
    `<div class="w" style="margin-top:.35em;text-align:left">${s.desc}</div>`+(i.extra?`<div class="g" style="margin-top:.3em;text-align:left">${i.extra}</div>`:'')+
    `<div class="g" style="margin-top:.35em;text-align:left">Cost: ${i.cost||'—'} · Cooldown: ${i.cd?i.cd():'—'}</div>`+
    (on?`<div style="margin-top:.3em;color:#e8c25a">${state}</div>`:`<div style="margin-top:.3em;color:#9a8a7a">Not learned · ${b.n} brand, tier ${s.tier+1}, from level ${TIER_LVL[s.tier]} (T opens the brands)</div>`); }
function beltTip(){ return `<div style="font-size:1.15em">Draughts <span class="g">· key Q</span></div><div class="w" style="margin-top:.35em;text-align:left">Drink to heal. You carry ${P.potions} of ${POT_MAX}. Rising again after a death fills the belt; the Pale Merchant sells a couple on each level; foes sometimes drop one.</div>`; }
(function(){ let shown=null;
  addEventListener('pointermove',ev=>{ if(!P||mode!=='play'||hud.hidden){ if(shown){ hideTip(); shown=null; } return; } const x=ev.clientX, y=ev.clientY; let hit=null, html='';
    for(const el of document.querySelectorAll('#abar .ab')){ const r=el.getBoundingClientRect(); if(x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom){ hit=el; html=abTip(SKEY[el.dataset.k]); break; } }
    if(!hit){ const bl=$('#belt'); if(bl){ const r=bl.getBoundingClientRect(); if(x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom){ hit=bl; html=beltTip(); } } }
    if(hit&&html){ showTipHTML(html,hit); shown=hit; } else if(shown){ hideTip(); shown=null; } }); })();
