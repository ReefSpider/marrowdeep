'use strict';
/* ===== the prologue teaches (v17) =====
   The Hollowmere Wall used to be a random strip with random foes, and the game taught itself with pop-ups mid-fight.
   Now it's a hand-built walk along the wall, one lesson per stretch, each taught by what's in front of you and by the
   garrison's chalk marks on the stones (shown when you come near, never over the fight):
     walk and jump (a step, then a spiked gap) → the dead man's sword → one ghoul (strike, aim) → two ghouls (rhythm)
     → an archer and a ghoul (the glint: interrupt the wind-up) → two hounds (roll through) → three ghouls (grit)
     → a draught → a chest (the reel) → two husks (guarded fronts) → the Red Hour.
   Prologue foes have half the first descent's extra life, so lessons take a few blows, not a dozen.
   Passing a chalk mark counts as having learned it: the matching first-time tip won't pop up later. */
const LESSONS=[
  {x:6,t:'<kbd>A</kbd> <kbd>D</kbd> to walk · <kbd>Space</kbd> to jump · hold it to jump higher'},
  {x:15,t:'Mind the spikes. A clean jump clears them.'},
  {x:28,t:'<kbd>Left-click</kbd> or <kbd>J</kbd> to strike · the blade follows your mouse'},
  {x:40,t:'Strike again <b>as a swing ends</b>: on the beat it cuts deeper. Mashing breaks the rhythm.',tip:'rhythm'},
  {x:56,t:'A <b>glint</b> means a blow is coming. Strike into it and you break the attack.',tip:'interrupt'},
  {x:72,t:'<kbd>Shift</kbd> to roll · nothing can touch you mid-roll'},
  {x:89,t:'Every swing costs <b>grit</b>, the blue orb. Stop swinging for a breath and it returns.',tip:'winded'},
  {x:105,t:'<kbd>Q</kbd> drinks a draught. You carry two.'},
  {x:110,t:'<kbd>E</kbd> opens a chest. Watch the reel.'},
  {x:119,t:'Some guard their front. Go round them, or strike heavy.'}];
const PRO_FOES=[[33,'ghoul'],[47,'ghoul'],[50,'ghoul'],[62,'ghoul'],[66,'archer'],[80,'hound'],[83,'hound'],[95,'ghoul'],[97,'ghoul'],[99,'ghoul'],[125,'husk'],[133,'husk']];
function authorWall(Lv){ const g=Lv.g, fl=14;
  for(let x=10;x<14;x++){ g[fl-1][x]=1; g[fl-2][x]=1; }
  for(let x=17;x<20;x++){ g[fl][x]=0; g[fl+1][x]=3; }
  Lv.spawns=PRO_FOES.map(([x,t])=>({x:x+.5,y:fl,t})); Lv.chests=[{x:112.5,y:fl,tier:0}]; Lv.lessons=LESSONS; Lv.authored=1; return Lv; }
(function(){ const o=genRooms; genRooms=function(def,safe){ if(def.id!=='wall') return o(def,safe); return authorWall(o(def,true)); }; })();
(function(){ const o=mkEnemy; mkEnemy=function(s){ const e=o(s); if(L&&L.authored&&!e.boss){ e.hp*=.5; e.maxhp*=.5; } return e; }; })();
(function(){ const o=loadLevel; loadLevel=function(idx,opt){ const r=o(idx,opt); if(L&&L.authored){ if(L.relic) L.relic.x=23*T; for(const c of chests) c.mimic=0; } return r; }; })();

/* ---------- chalk on the wall ---------- */
const chalkEl=document.createElement('div'); chalkEl.id='chalk'; chalkEl.className='layer'; stage.appendChild(chalkEl);
(function(){ const st=document.createElement('style'); st.textContent=`
#chalk{z-index:4}
#chalk .ck{position:absolute;transform:translate(-50%,-100%) rotate(-1.2deg);font-family:var(--fs);font-size:max(10px,calc(var(--u)*1.35));color:#e9dfcc;letter-spacing:.03em;text-align:center;max-width:calc(var(--u)*34);line-height:1.35;
  text-shadow:0 0 calc(var(--u)*.6) rgba(0,0,0,.95),0 1px 0 #000;padding:calc(var(--u)*.3) calc(var(--u)*.8);border-bottom:1px dashed rgba(233,223,204,.35);transition:opacity .35s}
#chalk .ck b{font-weight:400;color:#ffd27a}#chalk .ck kbd{color:var(--ember);font-family:var(--fs)}`; document.head.appendChild(st); })();
let chalkKey='';
function updChalk(){ const on=mode==='play'&&L&&L.lessons&&P&&!P.dead; if(!on){ if(chalkKey){ chalkEl.innerHTML=''; chalkKey=''; } return; }
  const near=L.lessons.map((s,i)=>({s,i,d:Math.abs(s.x*T-P.x)})).filter(o=>o.d<170);
  const key=near.map(o=>o.i).join(','); if(key!==chalkKey){ chalkKey=key; chalkEl.innerHTML=near.map(o=>`<div class="ck" data-i="${o.i}">${o.s.t}</div>`).join(''); }
  for(const el of chalkEl.children){ const s=L.lessons[+el.dataset.i]; const d=Math.abs(s.x*T-P.x); el.style.left=scrX(s.x*T)+'px'; el.style.top=scrY(14*T-44)+'px'; el.style.opacity=clamp(1-(d-60)/110,0,1).toFixed(2); }
  for(const s of L.lessons){ if(s.tip&&!s.learned&&P.x>s.x*T+8){ s.learned=1; tacTold[s.tip]=1; const t=store.get('marrowdeep.tactips')||{}; t[s.tip]=1; store.set('marrowdeep.tactips',t); } } }
(function(){ const o=frame; frame=function(now){ o(now); updChalk(); }; })();
