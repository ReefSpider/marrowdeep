'use strict';
/* ===== the Marrow 髄: the endgame tree, and the long climb after the war =====
   - There is no level cap.
   - Once a character has finished the campaign, every level after that costs 8% more XP than the one before,
     compounding (on top of the normal curve), so levels keep coming but slow down for good.
   - Finishing the campaign also opens the Marrow, a tab in the satchel: plain stat boosts bought with points.
     3 points to start, then 1 per level gained after the campaign. Points can be moved freely at any time.
     Every boost has a low cap, so the whole tree maxed out is about what one good item gives. */
const MARROW_GROWTH=1.08;
const MARROW=[
  {k:'dmg', n:'Edge',      jp:'刃', per:1,   cap:20, u:'% damage'},
  {k:'life',n:'Marrow',    jp:'髄', per:1,   cap:20, u:'% life'},
  {k:'def', n:'Hide',      jp:'皮', per:1,   cap:20, u:'% defense'},
  {k:'as',  n:'Quickness', jp:'速', per:.5,  cap:10, u:'% attack speed'},
  {k:'crit',n:'Eye',       jp:'眼', per:.25, cap:20, u:'% critical strike'},
  {k:'ls',  n:'Thirst',    jp:'渇', per:.1,  cap:20, u:'% life stolen'},
  {k:'regen',n:'Breath',   jp:'息', per:.2,  cap:10, u:' life regen /s'},
  {k:'ms',  n:'Stride',    jp:'歩', per:.5,  cap:10, u:'% run speed'},
  {k:'mf',  n:'Greed',     jp:'欲', per:2,   cap:25, u:'% magic find'},
  {k:'gf',  n:'Tithe',     jp:'銭', per:2,   cap:25, u:'% gold find'}];
const marrowOn=()=>!!(META&&META.marrow);
const mAlloc=()=>META.marrow.alloc||(META.marrow.alloc={});
function marrowPoints(){ if(!marrowOn()) return 0; return 3+Math.max(0,P.lvl-META.marrow.start); }
function marrowSpent(){ if(!marrowOn()) return 0; return Object.values(mAlloc()).reduce((a,b)=>a+b,0); }
function unlockMarrow(quiet){ if(marrowOn()||!P) return; META.marrow={start:P.lvl,alloc:{}}; showMarrowTab();
  if(!quiet) setTimeout(()=>toast('The Marrow 髄 is open: an endgame tree in your satchel. Levels from here on come slower.'),2600); }

/* ---------- the XP curve: no cap, and exponential once the war is over ---------- */
(function(){ const o=xpNext; xpNext=function(l){ const b=o(l); if(!marrowOn()||!(META.cleared&&META.cleared.length)) return b; /* v25: the steeper curve only after a campaign clear */ const over=l-(META.mxs||META.marrow.start)+1; return over>0?Math.round(b*Math.pow(MARROW_GROWTH,over)):b; }; })();

/* ---------- the boosts ---------- */
(function(){ const o=calcStats; calcStats=function(){ o(); if(!P||P._remote||!marrowOn()) return; const s=P.stats, a=mAlloc(), v=k=>{ const d=MARROW.find(x=>x.k===k); return Math.min(a[k]||0,d.cap)*d.per; };
  s.dmgP=(s.dmgP||0)+v('dmg'); s.life=Math.round(s.life*(1+v('life')/100)); s.def=Math.round(s.def*(1+v('def')/100)); s.as+=v('as'); s.crit+=v('crit'); s.ls+=v('ls'); s.regen+=v('regen'); s.ms+=v('ms'); s.mf+=v('mf'); s.gf+=v('gf');
  P.life=Math.min(P.life,s.life); }; })();

/* ---------- unlocking ---------- */
(function(){ const o=campaignCleared; campaignCleared=function(a){ const was=marrowOn(); unlockMarrow(); if(META&&!META.mxs&&P) META.mxs=P.lvl; if(!was) calcStats(); return o(a); }; })();
/* characters who finished the campaign before the Marrow existed get it the next time they're loaded */
(function(){ const o=continueGame; continueGame=function(){ const r=o(); if(META&&META.cleared&&META.cleared.length&&!marrowOn()){ unlockMarrow(true); calcStats(); setTimeout(()=>toast('The Marrow 髄 is open: an endgame tree in your satchel.'),1500); } showMarrowTab(); return r; }; })();
(function(){ const o=newGame; newGame=function(){ const r=o(); showMarrowTab(); return r; }; })();

/* ---------- the satchel tab ---------- */
(function(){ const st=document.createElement('style'); st.textContent=`
#paneMarrow{width:min(100%,calc(var(--u)*64));display:flex;flex-direction:column;align-items:center;gap:calc(var(--u)*.8)}
#paneMarrow .mhd{font-family:var(--fs);font-size:max(10px,calc(var(--u)*1.3));color:var(--ash);text-align:center;line-height:1.4}
#paneMarrow .mhd b{color:var(--ember);font-weight:400}
.mrows{width:100%;display:grid;grid-template-columns:1fr 1fr;gap:calc(var(--u)*.5) calc(var(--u)*1.4)}
.mrow{display:grid;grid-template-columns:calc(var(--u)*3) 1fr auto;align-items:center;gap:calc(var(--u)*.7);padding:calc(var(--u)*.5) calc(var(--u)*.7);background:rgba(10,8,9,.7);border:1px solid #241c1c;font-family:var(--fs);font-size:max(10px,calc(var(--u)*1.2));color:var(--bone)}
.mrow i{font-style:normal;font-family:'Shippori Mincho',var(--fb);font-weight:800;font-size:calc(var(--u)*2.2);color:#c9a96a;text-align:center}
.mrow.max i{color:#ffd27a;text-shadow:0 0 calc(var(--u)*.8) rgba(255,180,80,.6)}
.mrow .mi small{display:block;color:var(--ash);font-size:.86em}
.mrow .mb{height:calc(var(--u)*.45);background:#1a1010;margin-top:calc(var(--u)*.3)}.mrow .mb s{display:block;height:100%;background:linear-gradient(90deg,#8a2a1a,#ffb060)}
.mrow .mc{display:flex;gap:calc(var(--u)*.3)}.mrow .mc button{width:calc(var(--u)*2.6);height:calc(var(--u)*2.6);padding:0;font-size:max(12px,calc(var(--u)*1.5));line-height:1}
.mfoot{display:flex;gap:calc(var(--u)*.8);align-items:center;font-family:var(--fs);font-size:max(10px,calc(var(--u)*1.15));color:var(--ash)}
`; document.head.appendChild(st); })();
const mTab=document.createElement('button'); mTab.className='tab'; mTab.id='tabMarrow'; mTab.textContent='Marrow 髄'; mTab.hidden=true; $('#tabCodex').after(mTab);
const mPane=document.createElement('div'); mPane.id='paneMarrow'; mPane.hidden=true; $('#paneCodex').after(mPane);
function showMarrowTab(){ mTab.hidden=!marrowOn(); if(!marrowOn()&&!mPane.hidden){ mPane.hidden=true; } }
mTab.onclick=()=>setTab('marrow');
(function(){ const o=setTab; setTab=function(t){ if(t!=='marrow'){ mPane.hidden=true; mTab.classList.remove('on'); return o(t); } o('none'); mPane.hidden=false; mTab.classList.add('on'); renderMarrow(); }; })();
function renderMarrow(){ if(!marrowOn()){ mPane.innerHTML=''; return; } const a=mAlloc(), pts=marrowPoints(), free=pts-marrowSpent();
  mPane.innerHTML=`<div class="mhd">The war is over. What is left is the marrow.<br><b>${free}</b> of ${pts} points free · 3 to start, then 1 for every level after the campaign · move them whenever you like</div>
    <div class="mrows">${MARROW.map(d=>{ const n=a[d.k]||0, val=+(n*d.per).toFixed(2), mx=+(d.cap*d.per).toFixed(2);
      return `<div class="mrow${n>=d.cap?' max':''}"><i>${d.jp}</i><div class="mi">${d.n} <small>+${val}${d.u} · max +${mx}</small><div class="mb"><s style="width:${(n/d.cap*100).toFixed(0)}%"></s></div></div>
        <div class="mc"><button class="btn ghost" data-k="${d.k}" data-d="-1"${n<=0?' disabled':''} aria-label="Take a point from ${d.n}">−</button><button class="btn ghost" data-k="${d.k}" data-d="1"${free<=0||n>=d.cap?' disabled':''} aria-label="Put a point in ${d.n}">+</button></div></div>`; }).join('')}</div>
    <div class="mfoot"><button class="btn ghost" id="mReset"${marrowSpent()?'':' disabled'}>Take every point back</button><span>Next level: ${P.xp} / ${xpNext(P.lvl)} XP</span></div>`;
  mPane.querySelectorAll('.mc button').forEach(b=>b.onclick=ev=>{ const k=b.dataset.k, d=+b.dataset.d, def=MARROW.find(x=>x.k===k); const n=a[k]||0;
    const step=ev.shiftKey?5:1; for(let i=0;i<step;i++){ const cur=a[k]||0; if(d>0&&(marrowPoints()-marrowSpent()<=0||cur>=def.cap)) break; if(d<0&&cur<=0) break; a[k]=cur+d; }
    if(!a[k]) delete a[k]; AU.tone('triangle',d>0?440:300,d>0?660:220,.08,.08,.2); calcStats(); renderInv(); saveGame(); renderMarrow(); });
  const r=$('#mReset'); if(r) r.onclick=()=>{ META.marrow.alloc={}; AU.tone('sine',300,150,.3,.1,.4); calcStats(); renderInv(); saveGame(); renderMarrow(); }; }
/* the tab follows the satchel */
(function(){ const o=toggleInv; toggleInv=function(open,tab){ showMarrowTab(); return o(open,tab); }; })();
