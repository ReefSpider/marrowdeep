'use strict';
/* ===== the toll of dying, and the Kintsugi Seal 金継 (v16) =====
   Dying breaks one piece of what you wear, chosen at random. Abyssal items never break (only the Hungry Altar can take
   those). A Kintsugi Seal is one-time protection: when something would break, a seal shatters in its place, automatically.
   You can carry three.
   Where seals come from:
   - Every boss rolls for one on a reel after it dies: 40%, or 70% if you ended it by hand (止め).
   - The Gilded Debtor carries one 20% of the time.
   - The Hollow Garden's last chamber always leaves one.
   Not counted as dying: the prologue on the wall, being downed in co-op (only a wipe counts), and Last Breath.
   In co-op every player rolls their own seal at a boss, like gold. */
const SEAL_MAX=3, SEAL_BOSS=.4, SEAL_FINISH=.7, SEAL_DEBTOR=.2;
const sealsOf=()=>P?(P.seals|0):0;
function giveSeal(why){ if(!P) return; if(sealsOf()>=SEAL_MAX){ toast(`Kintsugi Seal ${why?'· '+why+' ':''}— you already carry ${SEAL_MAX}. It crumbles to gold dust.`); P.gold+=50*(1+lvlIdx); return; }
  P.seals=sealsOf()+1; AU.reveal(3); sparks(P.x,P.y-16,16,'#ffd27a'); toast(`金継 Kintsugi Seal${why?' · '+why:''}. You carry ${P.seals}. If you die, it breaks instead of your gear.`); updBelt(); saveGame(); }
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
  if(r){ const sub=$('#deathSub'); if(sub) sub.textContent=deathNote(r)+' '+sub.textContent; if(!r.saved) setTimeout(()=>toast(`The Pit kept your ${r.it.name}. Kintsugi Seals (from bosses) stop this once each.`),2800); saveGame(); } }; })();
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
#sealRoll .so{font-size:max(10px,calc(var(--u)*1.1));color:#9a8a7a}#sealRoll .sw{font-family:var(--fd);font-size:calc(var(--u)*1.8);min-height:1.2em}`; document.head.appendChild(st); })();
function sealRoll(p,why){ const hit=R()<p; const N=40, WI=32;
  sealEl.innerHTML=`<div class="sh">Kintsugi <span>金継</span></div><div class="sr"><div class="st"></div><div class="mk"></div></div><div class="so">${Math.round(p*100)}% · ${why}</div><div class="sw"></div>`; sealEl.hidden=false;
  const strip=sealEl.querySelector('.st'), tiles=[]; const near=!hit&&R()<.6?WI+(R()<.5?1:-1):-1;
  for(let i=0;i<N;i++){ const g=i===WI?hit:i===near?true:R()<p*.5; const d=document.createElement('div'); d.className='tl'+(g?' g':''); d.textContent=g?'金継':'空'; strip.appendChild(d); tiles.push(d); }
  const reelW=strip.parentElement.clientWidth, cw=tiles[1].offsetLeft-tiles[0].offsetLeft, tw=tiles[0].offsetWidth;
  const target=WI*cw+(near>WI?.78:near>=0?.22:rnd(.2,.8))*tw-reelW/2, dur=RM?500:3000, t0=performance.now(); let li=-1, done=false;
  const finish=()=>{ if(done) return; done=true; strip.style.transform=`translateX(${-target}px)`; tiles[WI].classList.add('won'); const w=sealEl.querySelector('.sw');
    if(hit){ w.textContent='A seal, mended with gold.'; w.style.color='#ffd27a'; giveSeal(why); } else { w.textContent=near>=0?'So close. Nothing.':'Nothing.'; w.style.color='#8a8078'; AU.tone('sine',220,110,.4,.1,.4); }
    setTimeout(()=>{ sealEl.hidden=true; },2200); };
  const step=now=>{ if(done) return; const k=Math.min(1,(now-t0)/dur), e=1-Math.pow(1-k,4), x=target*e; strip.style.transform=`translateX(${-x}px)`; const idx=Math.floor((x+reelW/2)/cw); if(idx!==li){ li=idx; AU.tick(); } if(k<1) requestAnimationFrame(step); else finish(); };
  sealEl.onclick=finish; requestAnimationFrame(step); }
(function(){ const o=bossDefeated; bossDefeated=function(e){ o(e); const fin=!!e.finisher; setTimeout(()=>{ if(P&&!P.dead) sealRoll(fin?SEAL_FINISH:SEAL_BOSS,fin?`${e.name||'The boss'} · finished by hand`:`${e.name||'The boss'} falls`); },2600); }; })();
(function(){ const o=killEnemy; killEnemy=function(e,dir,crit){ const was=e.dead; o(e,dir,crit); if(!was&&e.dead&&e.type==='debtor'&&!e.escaped&&R()<SEAL_DEBTOR) giveSeal('the Gilded Debtor\'s pocket'); }; })();
(function(){ const o=finalCleared; finalCleared=function(a){ o(a); if(typeof SECRET!=='undefined'&&SECRET.on) giveSeal('the Hollow Garden'); }; })();

/* ---------- saved with the character, shown on the belt ---------- */
(function(){ const o=saveGame; saveGame=function(){ o(); try{ const db=slotsDB(); const s=db.list.find(x=>x.id===curSlot); if(s&&s.data&&s.data.P){ s.data.P.seals=sealsOf(); s.data.P.way=P.way||null; store.set(SLOTS_KEY,db); } }catch(e){} }; })();
(function(){ const o=restorePlayer; restorePlayer=function(sv){ o(sv); P.seals=Math.min(SEAL_MAX,sv&&sv.seals|0); P.way=sv&&sv.way||null; if(typeof calcStats==='function') calcStats(); }; })();
(function(){ const o=updBelt; updBelt=function(){ o(); const b=$('#belt'); if(!b) return; let c=b.querySelector('.seal'); if(!c){ c=document.createElement('b'); c.className='seal'; c.title='Kintsugi Seals: each one stops one item breaking when you die'; c.style.cssText='font-family:Shippori Mincho,serif;color:#ffd27a;margin-left:.6em;font-weight:500;text-shadow:0 0 4px #000'; b.appendChild(c); }
  const n=sealsOf(); c.textContent=n?`金継 ${n}`:''; }; })();
