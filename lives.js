'use strict';
/* ===== lives 命 (v20): three comebacks per run, then home =====
   Every death still breaks gear (fate.js rules). Each run gives you three comebacks:
     1st death: rise again free.
     2nd death: rising costs 50% of your crowns.
     3rd death: rising costs 75% of your crowns.
     4th death: the Pit is done with you. You wake in the Rope-House with what's left, and the run (and its borrowed
                power) is over.
   On a paid death you choose: pay and rise, or go home now with all your crowns.
   Your crowns no longer lie where you fell: the fee replaces that.
   Co-op: a wipe costs everyone a life (each pays from their own crowns, automatically); after the last, the descent ends. */
const LIFE_COST=[0,0,.5,.75], LIVES=3;
const livesLeft=()=>Math.max(0,LIVES-RUN.deaths);
function deathNoteLives(){ const n=RUN.deaths; if(n>LIVES) return 'The Pit is done with you.'; const c=LIFE_COST[n]||0, next=LIFE_COST[n+1];
  return `${['','First','Second','Third'][n]} fall. ${c?'':'This one is free. '}${next!=null&&n<LIVES?`The next will cost ${Math.round(next*100)}% of your crowns.`:'The next fall sends you home.'}`; }
const dRow=document.createElement('div'); dRow.className='row'; dRow.id='deathBtns'; dRow.style.marginTop='calc(var(--u)*1.4)'; $('#death').appendChild(dRow);
const goHome=why=>{ $('#death').hidden=true; dRow.innerHTML=''; deathShown=false; P.dead=false; P.deadT=0; P.life=P.stats.life; mode='play'; hud.hidden=false; goCabin(); if(why) setTimeout(()=>toast(why),1200); };
(function(){ const o=onDeath; onDeath=function(){ if(typeof COOP!=='undefined'&&COOP) return o(); if(deathShown) return; o(); if(!L||L.def.kind==='cabin'||L.def.id==='wall') return;
  RUN.deaths++; saveGame(); dRow.innerHTML=''; const n=RUN.deaths, sub=$('#deathSub'); updBelt();
  if(n>LIVES){ mode='deathhome'; sub.textContent=`${sub.textContent.split('Back to the start')[0]}The Pit is done with you. You wake in the Rope-House with your crowns.`; setTimeout(()=>{ if(mode==='deathhome') goHome('Four falls. The run is over; what you borrowed goes back to the dark.'); },3800); return; }
  const cost=Math.floor(P.gold*(LIFE_COST[n]||0));
  sub.textContent=`${sub.textContent.split('Back to the start')[0]}${deathNoteLives()}`;
  if(cost<=0&&!(LIFE_COST[n]>0)) return; /* the free one: the usual respawn follows */
  mode='deathpay'; const b=(lab,fn,ghost)=>{ const x=document.createElement('button'); x.className='btn'+(ghost?' ghost':''); x.innerHTML=lab; x.onclick=fn; dRow.appendChild(x); return x; };
  b(`Rise again · ${cost} crowns (${Math.round(LIFE_COST[n]*100)}%) <kbd>E</kbd>`,()=>{ P.gold-=cost; dRow.innerHTML=''; mode='death'; AU.coin(); respawn(); toast(`You paid ${cost} crowns to the Pit. ${LIVES-n} ${LIVES-n===1?'comeback':'comebacks'} left.`); }).focus({preventScroll:true});
  b('Go home with your crowns',()=>goHome(),true); }; })();
addEventListener('keydown',ev=>{ if(mode!=='deathpay') return; if(ev.key==='e'||ev.key==='E'||ev.key==='Enter'){ ev.preventDefault(); ev.stopImmediatePropagation(); const x=dRow.querySelector('.btn'); if(x) x.click(); } },true);
/* no gold stain: the fee replaces it */
(function(){ const o=respawn; respawn=function(){ if(typeof COOP!=='undefined'&&COOP) return o(); const g=P.gold; P.gold=0; try{ o(); } finally{ P.gold=g; } dRow.innerHTML=''; updBelt(); }; })();
/* co-op: a wipe costs everyone a life */
(function(){ const o=wipeIn; wipeIn=function(){ o(); RUN.deaths++; const n=RUN.deaths, sub=$('#deathSub');
  if(n>LIVES){ sub.textContent='The Pit is done with all of you. You wake in the Rope-House.'; if(NET.host) setTimeout(()=>{ if(COOP){ bcast({t:'bye'}); netLeave(); } },3000); return; }
  const cost=Math.floor(P.gold*(LIFE_COST[n]||0)); P.gold-=cost; sub.textContent=`${sub.textContent} ${['','First','Second','Third'][n]} fall${cost?`: you paid ${cost} crowns`:' (free)'}. ${n<LIVES?`Next costs ${Math.round(LIFE_COST[n+1]*100)}%.`:'The next ends the descent.'}`; updBelt(); }; })();
/* the belt shows your comebacks */
(function(){ const o=updBelt; updBelt=function(){ o(); const b=$('#belt'); if(!b) return; let c=b.querySelector('.lives'); if(!c){ c=document.createElement('b'); c.className='lives'; c.title='Comebacks left this run'; c.style.cssText='font-family:Shippori Mincho,serif;color:#ff7a6a;margin-left:.6em;font-weight:500;text-shadow:0 0 4px #000'; b.appendChild(c); }
  const left=typeof RUN!=='undefined'?Math.max(0,LIVES-RUN.deaths):LIVES; c.textContent=L&&L.def.kind==='cabin'?'':`命 ${'●'.repeat(left)}${'○'.repeat(LIVES-left)}`; }; })();
(function(){ const o=loadLevel; loadLevel=function(idx,opt){ const r=o(idx,opt); updBelt(); return r; }; })();
