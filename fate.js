'use strict';
/* ===== the toll of dying, and the Kintsugi Seal 金継 (v16) =====
   Dying breaks one piece of what you wear, chosen at random. Abyssal items never break (only the Hungry Altar can take
   those). A Kintsugi Seal is one-time protection: when something would break, a seal shatters in its place, automatically.
   You can carry three.
   Where seals come from:
   - Every boss rolls for one on a reel after it dies: 12%, or 25% if you ended it by hand (止め) (v21; was 40/70%).
   - The Gilded Debtor carries one 4% of the time (was 20%).
   - The Hollow Garden's last chamber rolls for one at 35% (it used to always leave one).
   Not counted as dying: the prologue on the wall, being downed in co-op (only a wipe counts), and Last Breath.
   In co-op every player rolls their own seal at a boss, like gold. */
/* v21 (playtest: "make it much harder to get"): boss 40% → 12%, finished by hand 70% → 25%, the Debtor 20% → 4%,
   the Hollow Garden always → 35%. */
const SEAL_MAX=3, SEAL_BOSS=.12, SEAL_FINISH=.25, SEAL_DEBTOR=.04, SEAL_GARDEN=.35;
const sealsOf=()=>P?(P.seals|0):0;
function giveSeal(why){ if(!P) return; if(sealsOf()>=SEAL_MAX){ toast(`Kintsugi Seal ${why?'· '+why+' ':''}— you already carry ${SEAL_MAX}. It crumbles to gold dust.`); P.gold+=50*(1+lvlIdx); return; }
  P.seals=sealsOf()+1; AU.reveal(3); sparks(P.x,P.y-16,16,'#ffd27a'); toast(`金継 Kintsugi Seal${why?' · '+why:''}. In your satchel (${P.seals}/${SEAL_MAX}). If you die, it breaks instead of your gear.`); updBelt(); saveGame(); }
/* v18 (playtest: "mobs out-leveled me and I lost all my gear"): at most one item breaks per visit to a level, and
   nothing breaks when the foes are 3 or more levels above you. The death screen says why and points at Abandon. */
let BROKE_HERE=-1, SPARED='';
(function(){ const o=goLevel; goLevel=function(i){ BROKE_HERE=-1; return o(i); }; })();
function breakOnDeath(){ SPARED=''; if(!P||!L||L.def.kind==='cabin'||L.def.id==='wall') return null;
  if(BROKE_HERE===lvlIdx){ SPARED='The Pit already took its due on this level. Your gear is safe until you climb on.'; return null; }
  const over=(typeof curMlvl==='function'?curMlvl():1)-P.lvl; if(over>=3){ SPARED=`These foes are ${over} levels above you, so the Pit spares your gear. Pause → Abandon the descent to go home and grow stronger.`; return null; }
  const ks=Object.keys(P.equip).filter(k=>P.equip[k]&&P.equip[k].rarity<5); if(!ks.length) return null;
  const k=pick(ks), it=P.equip[k];
  BROKE_HERE=lvlIdx; if(sealsOf()>0){ P.seals--; updBelt(); return {saved:true,it}; }
  P.equip[k]=null; calcStats(); P.life=Math.min(P.life,P.stats.life); return {saved:false,it}; }
function deathNote(r){ if(!r) return ''; return r.saved?`A Kintsugi Seal shattered to save your ${r.it.name}. ${sealsOf()} left.`:`Your ${r.it.name} broke.`; }
(function(){ const o=onDeath; onDeath=function(){ const fresh=!deathShown&&!(typeof COOP!=='undefined'&&COOP); const r=fresh?breakOnDeath():null; o();
  if(!r&&fresh&&SPARED){ const sub=$('#deathSub'); if(sub) sub.textContent=SPARED+' '+sub.textContent; }
  if(r){ const sub=$('#deathSub'); if(sub) sub.textContent=deathNote(r)+' '+sub.textContent; if(!r.saved) setTimeout(()=>toast(`The Pit kept your ${r.it.name}. A Kintsugi Seal (rare, from bosses) would have saved it.`),2800); saveGame(); } }; })();
/* a co-op wipe is a death for everyone; being downed and revived is not */
(function(){ const o=wipeIn; wipeIn=function(){ o(); const r=breakOnDeath(); if(r){ const sub=$('#deathSub'); if(sub) sub.textContent=deathNote(r)+' '+sub.textContent; saveGame(); } }; })();

/* ---------- the seal roll after a boss ---------- */
const sealEl=document.createElement('div'); sealEl.id='sealRoll'; sealEl.hidden=true; stage.appendChild(sealEl);
(function(){ const st=document.createElement('style'); st.textContent=`
#sealRoll{position:absolute;left:50%;top:calc(var(--u)*13);transform:translateX(-50%);width:calc(var(--u)*46);padding:calc(var(--u)*.8);background:rgba(6,4,4,.9);border:1px solid #3a2a20;z-index:8;text-align:center;font-family:var(--fs);color:var(--bone);pointer-events:auto}
#sealRoll .sh{font-family:var(--fd);font-size:calc(var(--u)*1.9)}#sealRoll .sh span{font-family:'Shippori Mincho',serif;color:#ffd27a}
#sealRoll .sr{position:relative;height:calc(var(--u)*5);overflow:hidden;margin:calc(var(--u)*.6) 0;border:1px solid #2a2020}
#sealRoll .st{display:flex;position:absolute;left:0;top:0;height:100%;will-change:transform}
#sealRoll .tl{flex:none;width:calc(var(--u)*5);height:100%;margin-right:calc(var(--u)*.4);display:flex;align-items:center;justify-content:center;font-family:'Shippori Mincho',serif;font-size:calc(var(--u)*2);background:#120d0c;color:#4a4040}
#sealRoll .tl.g{background:linear-gradient(#3a2810,#1e1408);color:#ffd27a;box-shadow:inset 0 0 calc(var(--u)*.8) rgba(255,200,90,.5)}#sealRoll .tl.won{outline:2px solid #fff}
#sealRoll .mk{position:absolute;left:50%;top:0;bottom:0;width:2px;background:#ff6a3a;box-shadow:0 0 6px #ff6a3a}
#sealRoll .sx{font-size:max(10px,calc(var(--u)*1.1));color:#c9b48a;margin-top:calc(var(--u)*.2)}
#sealRoll .swon{display:flex;gap:calc(var(--u)*.8);align-items:center;text-align:left;margin-top:calc(var(--u)*.4)}#sealRoll .swon canvas{width:calc(var(--u)*4.4);height:calc(var(--u)*4.4);image-rendering:pixelated;flex:none;border:1px solid #b07a20;background:#0a0707}#sealRoll .swon b{display:block;color:#ffd27a;font-weight:400}#sealRoll .swon span{display:block;font-family:var(--fs);font-size:max(10px,calc(var(--u)*1.05));color:#b8a890}
#sealRoll .so{font-size:max(10px,calc(var(--u)*1.1));color:#9a8a7a}#sealRoll .swr{font-family:var(--fd);font-size:calc(var(--u)*1.8);min-height:1.2em}`; document.head.appendChild(st); })();
function sealRoll(p,why){ const hit=R()<p; const N=40, WI=32;
  sealEl.innerHTML=`<div class="sh">Kintsugi Seal <span>金継</span></div><div class="sx">Saves one piece of worn gear from breaking when you die</div><div class="sr"><div class="st"></div><div class="mk"></div></div><div class="so">${Math.round(p*100)}% chance · ${why}</div><div class="swr"></div>`; sealEl.hidden=false;
  const strip=sealEl.querySelector('.st'), tiles=[]; const near=!hit&&R()<.6?WI+(R()<.5?1:-1):-1;
  for(let i=0;i<N;i++){ const g=i===WI?hit:i===near?true:R()<p*.5; const d=document.createElement('div'); d.className='tl'+(g?' g':''); d.textContent=g?'金継':'空'; strip.appendChild(d); tiles.push(d); }
  const reelW=strip.parentElement.clientWidth, cw=tiles[1].offsetLeft-tiles[0].offsetLeft, tw=tiles[0].offsetWidth;
  const target=WI*cw+(near>WI?.78:near>=0?.22:rnd(.2,.8))*tw-reelW/2, dur=RM?500:3000, t0=performance.now(); let li=-1, done=false;
  const finish=()=>{ if(done) return; done=true; strip.style.transform=`translateX(${-target}px)`; tiles[WI].classList.add('won'); const w=sealEl.querySelector('.swr');
    if(hit){ const full=sealsOf()>=SEAL_MAX; giveSeal(why); if(full){ w.textContent=`A seal, but you already carry ${SEAL_MAX}. It crumbles to gold.`; w.style.color='#ffd27a'; setTimeout(()=>{ sealEl.hidden=true; },3200); } else sealWon(w); } else { w.textContent=near>=0?'So close. Nothing.':'Nothing.'; w.style.color='#8a8078'; AU.tone('sine',220,110,.4,.1,.4); setTimeout(()=>{ sealEl.hidden=true; },2200); } };
  const step=now=>{ if(done) return; const k=Math.min(1,(now-t0)/dur), e=1-Math.pow(1-k,4), x=target*e; strip.style.transform=`translateX(${-x}px)`; const idx=Math.floor((x+reelW/2)/cw); if(idx!==li){ li=idx; AU.tick(); } if(k<1) requestAnimationFrame(step); else finish(); };
  sealEl.onclick=()=>{ if(!done) finish(); else if(sealEl.dataset.won) sealEl.hidden=true; }; delete sealEl.dataset.won; requestAnimationFrame(step); }
/* what you just won, where it went, and what it does */
function sealWon(w){ sealEl.dataset.won=1; const n=sealsOf(); w.innerHTML='';
  const box=document.createElement('div'); box.className='swon'; const ic=document.createElement('canvas'); ic.width=ic.height=32; if(typeof sealIcon==='function') ic.getContext('2d').drawImage(sealIcon(),0,0); box.appendChild(ic);
  const t=document.createElement('div'); t.innerHTML=`<b>A seal, mended with gold.</b><span>When you die, it breaks instead of your gear. It's in your satchel (I) · you carry ${n} of ${SEAL_MAX}.</span>`; box.appendChild(t); w.appendChild(box);
  setTimeout(()=>{ sealEl.hidden=true; },6500); }
(function(){ const o=bossDefeated; bossDefeated=function(e){ o(e); const fin=!!e.finisher; setTimeout(()=>{ if(P&&!P.dead) sealRoll(fin?SEAL_FINISH:SEAL_BOSS,fin?`${e.name||'The boss'} · finished by hand`:`${e.name||'The boss'} falls`); },2600); }; })();
(function(){ const o=killEnemy; killEnemy=function(e,dir,crit){ const was=e.dead; o(e,dir,crit); if(!was&&e.dead&&e.type==='debtor'&&!e.escaped&&R()<SEAL_DEBTOR) giveSeal('the Gilded Debtor\'s pocket'); }; })();
(function(){ const o=finalCleared; finalCleared=function(a){ o(a); if(typeof SECRET!=='undefined'&&SECRET.on) setTimeout(()=>{ if(P&&!P.dead) sealRoll(SEAL_GARDEN,'the Hollow Garden'); },2200); }; })();

/* ---------- saved with the character, shown on the belt ---------- */
(function(){ const o=saveGame; saveGame=function(){ o(); try{ const db=slotsDB(); const s=db.list.find(x=>x.id===curSlot); if(s&&s.data&&s.data.P){ s.data.P.seals=sealsOf(); s.data.P.way=P.way||null; store.set(SLOTS_KEY,db); } }catch(e){} }; })();
(function(){ const o=restorePlayer; restorePlayer=function(sv){ o(sv); P.seals=Math.min(SEAL_MAX,sv&&sv.seals|0); P.way=sv&&sv.way||null; if(typeof calcStats==='function') calcStats(); }; })();
(function(){ const o=updBelt; updBelt=function(){ o(); const b=$('#belt'); if(!b) return; let c=b.querySelector('.seal'); if(!c){ c=document.createElement('b'); c.className='seal'; c.title='Kintsugi Seals: each one stops one item breaking when you die'; c.style.cssText='font-family:Shippori Mincho,serif;color:#ffd27a;margin-left:.6em;font-weight:500;text-shadow:0 0 4px #000'; b.appendChild(c); }
  const n=sealsOf(); c.textContent=n?`金継 ${n}`:''; }; })();
