'use strict';
/* ===== v37: loot that doesn't repeat, a vote at the exit, falls that hurt =====
   1. Loot memory. Each item you're shown as a find (chests, the merchant's box) is remembered. The next item is less
      likely to share its slot, its weapon class and hand, or (for a unique or abyssal) its name, so the same things
      don't keep coming back. Memory fades by a fifth with each new find (a tenth for unique names), so after a few
      other finds a kind is back to full odds. Kept per browser. Reel filler cards aren't biased, so co-op reels
      still match on every screen.
   2. The exit vote (co-op). Pressing E at the way out no longer drags everyone up at once. It asks: a banner shows who
      has agreed and counts down 10 seconds; the others agree by pressing E at the door, Y anywhere, or clicking the
      banner. When everyone present has agreed, or the 10 seconds run out (someone AFK), the host climbs on.
   3. Spikes, lava and the bottomless fall take 30% of your life on Pilgrim, 2% more each tier (50% on Marrow's End),
      and ignore defense. Since v34 defense cut them to about 5%. */

/* ---------- 1. loot memory ---------- */
const LM_KEY='marrowdeep.lootmem';
const LM=Object.assign({slot:{},cls:{},uniq:{}},store.get(LM_KEY)||{}); LM.off=false; LM.on=false;
const LM_K={slot:.7,cls:1,uniq:2.5,decay:.8,udecay:.9};
const lmW=(map,k,s)=>1/(1+s*(map[k]||0));
function lmRecord(it){ if(!it||!it.base) return;
  for(const k in LM.slot) LM.slot[k]*=LM_K.decay; for(const k in LM.cls) LM.cls[k]*=LM_K.decay; for(const k in LM.uniq) LM.uniq[k]*=LM_K.udecay;
  LM.slot[it.slot]=(LM.slot[it.slot]||0)+1;
  if(it.slot==='weapon'){ LM.cls[it.base.cls]=(LM.cls[it.base.cls]||0)+1; const kh=it.base.cls+':'+it.base.h; LM.cls[kh]=(LM.cls[kh]||0)+1; }
  if(it.rarity>=4&&it.name) LM.uniq[it.name]=(LM.uniq[it.name]||0)+1;
  try{ store.set(LM_KEY,{slot:LM.slot,cls:LM.cls,uniq:LM.uniq}); }catch(e){} }
pickWeaponBase=function(ilvl){ const ok=BASES.weapon.filter(b=>b.lvl<=ilvl+1); const bias=LM.on&&!LM.off;
  const cw={}; for(const b of ok) cw[b.cls]=bias?lmW(LM.cls,b.cls,LM_K.cls):1; const c=wpick(cw);
  const inC=ok.filter(b=>b.cls===c); const hw={}; for(const b of inC) hw[b.h]=bias?lmW(LM.cls,c+':'+b.h,LM_K.cls):1; const h=+wpick(hw);
  const pool=inC.filter(b=>b.h===h).sort((a,b)=>b.lvl-a.lvl); return pool[pool.length>1&&R()<.3?1:0]; };
(function(){ const o=mkFixed; mkFixed=function(def,rar){ if(LM.on&&!LM.off&&rar>=4&&def){ const list=rar===5?ABYSSAL:UNIQUES; if(list.includes(def)){ const w={}; list.forEach((d,i)=>w[i]=lmW(LM.uniq,d.name,LM_K.uniq)); def=list[+wpick(w)]; } } return o(def,rar); }; })();
(function(){ const o=genItem; genItem=function(ilvl,w,mf,forceSlot){ if(LM.off||LM.on) return o(ilvl,w,mf,forceSlot);
  const sv=Object.assign({},SLOTW); for(const s in SLOTW) SLOTW[s]=sv[s]*lmW(LM.slot,s,LM_K.slot); LM.on=true;
  try{ return o(ilvl,w,mf,forceSlot); } finally{ LM.on=false; Object.assign(SLOTW,sv); } }; })();
(function(){ const o=showCase; showCase=function(tier,ilvl,win,...r){ lmRecord(win); LM.off=true; try{ return o(tier,ilvl,win,...r); } finally{ LM.off=false; } }; })();

/* ---------- 2. the exit vote ---------- */
const XV_SECS=10;
const xvEl=document.createElement('div'); xvEl.id='xvBanner'; xvEl.hidden=true; stage.appendChild(xvEl);
(function(){ const st=document.createElement('style'); st.textContent=`
#xvBanner{position:absolute;left:50%;top:calc(var(--u)*7.4);transform:translateX(-50%);z-index:8;cursor:pointer;text-align:center;font-family:var(--fs);color:var(--bone);
  background:rgba(10,7,8,.88);border:1px solid #6a5030;padding:calc(var(--u)*.7) calc(var(--u)*1.6);font-size:max(12px,calc(var(--u)*1.35));white-space:nowrap;box-shadow:0 0 calc(var(--u)*1.2) rgba(0,0,0,.6)}
#xvBanner b{font-family:var(--fd);font-weight:400;font-size:max(15px,calc(var(--u)*2));color:#f1d9a0;display:block;margin-bottom:calc(var(--u)*.25)}
#xvBanner .who{display:flex;gap:calc(var(--u)*1);justify-content:center;margin:calc(var(--u)*.3) 0}
#xvBanner .who span{opacity:.5} #xvBanner .who span.ok{opacity:1;color:#bfe39a}
#xvBanner small{color:#9a8a7a;font-size:max(11px,calc(var(--u)*1.1))}
#xvBanner kbd{border:1px solid #7a6a5a;padding:0 .3em;border-radius:2px;font-family:var(--fs)}`; document.head.appendChild(st); })();
const xvVoters=()=>NET.seats.filter(x=>!(typeof heldSeat==='function'&&heldSeat(x.s))).map(x=>x.s);
function xvShow(who,left){ if(!COOP||!L||mode!=='play'&&mode!=='pause'){ xvEl.hidden=true; return; } const set=new Set(who), me=set.has(NET.me);
  const touch=!!window.MOBILE;
  xvEl.innerHTML=`<b>Climb on?</b><div class="who">${xvVoters().map(s=>`<span class="${set.has(s)?'ok':''}">${set.has(s)?'✓':'○'} ${(nameOf(s)||'').replace(/</g,'&lt;')}</span>`).join('')}</div>`+
    `<small>${me?'Waiting for the others':touch?'Tap here to go on':'<kbd>Y</kbd> or click here to go on'} · leaving in ${Math.max(0,Math.ceil(left))}s</small>`;
  xvEl.hidden=false; }
function xvHide(){ xvEl.hidden=true; if(typeof NET!=='undefined') NET.xv=null; }
/* the host keeps the count */
function xvCast(s){ if(!NET.host||NET.betweenLevels||!L||L.locked||L.noExit) return; if(!NET.xv) NET.xv={who:new Set(),end:performance.now()+XV_SECS*1000}; NET.xv.who.add(s); xvSend(); xvCheck(); }
function xvSend(){ const v=NET.xv; if(!v) return; const m={t:'xvs',who:[...v.who],left:(v.end-performance.now())/1000}; bcast(m); xvShow(m.who,m.left); }
function xvCheck(){ const v=NET.xv; if(!v) return; const all=xvVoters().every(s=>v.who.has(s)); if(all||performance.now()>=v.end){ NET.xv=null; xvEl.hidden=true; bcast({t:'xvx'}); hostFinish(); } }
function xvAgree(){ if(!COOP||!L||L.def.kind==='cabin'||NET.betweenLevels) return; if(NET.host) xvCast(NET.me); else toHost({t:'xv'}); }
(function(){ const o=finishLevel; finishLevel=function(){ if(typeof COOP==='undefined'||!COOP||(L&&L.def.kind==='cabin')) return o(); xvAgree(); }; })();
(function(){ const o=onMsg; onMsg=function(s,m){
  if(m&&m.t==='xv'){ if(NET.host) xvCast(s); return; }
  if(m&&m.t==='xvs'){ if(!NET.host){ NET.xvLocal={who:m.who,end:performance.now()+m.left*1000}; xvShow(m.who,m.left); } return; }
  if(m&&m.t==='xvx'){ NET.xvLocal=null; xvEl.hidden=true; return; }
  return o(s,m); }; })();
/* the count runs on the wall clock (a timer, not the game loop), so a tab in the background still counts down */
setInterval(()=>{ if(typeof COOP==='undefined'||!COOP){ if(!xvEl.hidden) xvEl.hidden=true; return; }
  if(NET.host&&NET.xv){ xvSend(); xvCheck(); }
  else if(!NET.host&&NET.xvLocal){ const x=NET.xvLocal, left=(x.end-performance.now())/1000; if(left<-3){ NET.xvLocal=null; xvEl.hidden=true; } else xvShow(x.who,left); } },250);
xvEl.onclick=()=>xvAgree();
addEventListener('keydown',ev=>{ if((ev.key==='y'||ev.key==='Y')&&mode==='play'&&typeof COOP!=='undefined'&&COOP&&!xvEl.hidden){ ev.preventDefault(); xvAgree(); } });
/* a new level, a wipe or leaving clears the vote */
(function(){ const o=loadLevel; loadLevel=function(...a){ xvHide(); if(typeof NET!=='undefined') NET.xvLocal=null; return o(...a); }; })();
(function(){ const o=coopFin; coopFin=function(idx){ xvHide(); if(typeof NET!=='undefined') NET.xvLocal=null; return o(idx); }; })();
(function(){ const o=netReset; netReset=function(){ o(); xvHide(); NET.xvLocal=null; }; })();

/* ---------- 3. falls that hurt ---------- */
/* actors.js asks fallHurt(s) for the life a fall takes; it's raised past defense so the blow lands at full size */
fallHurt=s=>{ const t=typeof tierNow==='function'?tierNow():ngp; const f=.3+.02*Math.max(0,t); return Math.round(s.life*f/defMul(s.def)); };
