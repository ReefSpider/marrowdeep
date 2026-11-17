'use strict';
/* ===== v51: the stake 賭 (BT, 17 Nov: "I've added the risk/gambling aspect … what part is the best fun part and for
   bosses") =====
   The chest reel works because of the moment before it stops: you have something riding on an outcome you can't
   quite control. A boss fight had no such moment; the chest at the end was the same whatever you did. Now every
   boss fight carries a stake that you build and can lose, and twice a fight you are offered the chance to double it.
     - Punish an opening (隙 or 崩し) and the stake goes up a pip, to five. Take a hit and it drops one.
     - At each change of phase: "Double the stake". Take it and the stake counts double (then fourfold), and the boss
       hits 25% harder for the rest of the fight. Refuse by doing nothing.
     - The stake rides on the boss's chest: every two points are +1 item level, each point makes its top three
       rarities 20% likelier (a full doubled-twice stake is 5×), and there is a purse.
       Die and it is gone with the attempt.
   Solo only for now: co-op chests are rolled by the host on another path. WG holds the numbers. */
const WG={max:5,grace:1.5,gainGap:1.6,mf:20,gold:8,dbl:1.25,offer:5};
let wgOpen=0;
const wgOn=()=>L&&L.wg&&!(typeof COOP!=='undefined'&&COOP);
const wgVal=w=>w.n*w.mult;
(function(){ const o=loadLevel; loadLevel=function(idx,opt){ const r=o(idx,opt); if(L){ L.wg=L.def.kind==='boss'?{n:0,mult:1,hitT:0,gainT:0,offerT:0,pay:0}:null; } return r; }; })();
(function(){ const o=dmgEnemy; dmgEnemy=function(e,d,crit,dir,kb,heavy,launch,stun){ if(e&&e.boss&&!e.dead&&!e.intro&&wgOn()&&d>0&&typeof bossOpen==='function'&&bossOpen(e)){ const w=L.wg; if(time>w.gainT&&w.n<WG.max){ w.gainT=time+WG.gainGap; w.n++; AU.coin(); sparks(e.x,e.y-e.h-6,5,'#ffd06a');
      if(!wgTold()){ toast('The stake 賭: every opening you punish raises it, every hit you take lowers it. It rides on the chest he leaves.',2); } } } return o(e,d,crit,dir,kb,heavy,launch,stun); }; })();
function wgTold(){ try{ if(store.get('marrowdeep.wg')) return true; store.set('marrowdeep.wg',1); }catch(e){} return false; }
(function(){ const o=hurtPlayer; hurtPlayer=function(d,src){ if(!wgOn()||!P) return o(d,src); const l0=P.life, r=o(d,src), w=L.wg; if(P.life<l0&&w.n>0&&time>w.hitT){ w.hitT=time+WG.grace; w.n--; AU.tone('square',330,165,.16,.07,.2); } return r; }; })();
function wgOffer(e){ if(!wgOn()||!e||e.dead) return; const w=L.wg; if(w.mult>=4) return; w.offerT=time+WG.offer; w.boss=e; AU.ting(); }
(function(){ const o=bossPhase; bossPhase=function(e){ o(e); wgOffer(e); }; })();
(function(){ const o=bossPhase3; bossPhase3=function(e){ o(e); wgOffer(e); }; })();
(function(){ const o=findInteract; findInteract=function(){ if(wgOn()&&L.wg.offerT>time&&!P.dead){ const w=L.wg; return {o:w,txt:`<kbd>E</kbd> 賭 Double the stake (×${w.mult*2}) · he hits 25% harder`,act:()=>{ w.offerT=0; w.mult*=2; const e=w.boss; if(e&&!e.dead) e.dmg*=WG.dbl; AU.bell&&AU.bell(); AU.roar(); shake(6); showBossName('Double or nothing','倍',`The stake counts ×${w.mult}. He hits harder.`); if(e) for(let i=0;i<20;i++) part({x:e.x+rnd(-20,20),y:e.y-rnd(0,e.h),vx:rnd(-40,40),vy:rnd(-120,-30),g:-20,life:.7,em:true,col:'#ff5a3a'}); }}; } return o(); }; })();
(function(){ const o=bossDefeated; bossDefeated=function(e){ if(wgOn()){ const w=L.wg, v=wgVal(w); w.pay=v; w.offerT=0; if(v>0){ for(let i=0;i<4;i++) dropGold(e.x+rnd(-40,40),e.y-rnd(20,60),Math.round(v*WG.gold*(1+dep()*.5)/4)); setTimeout(()=>toast(`The stake pays: +${Math.ceil(v/2)} item levels on his chest, and its best drops are ${(1+v*WG.mf/100).toFixed(1)}× as likely.`,2),3400); } } return o(e); }; })();
(function(){ const o=update; update=function(dt){ o(dt); if(!wgOn()||!L.wg.pay) return; for(const c of chests) if(c.tier===2&&!c.open&&c.stake==null) c.stake=L.wg.pay; }; })();
(function(){ const o=openChest; openChest=function(c){ wgOpen=c&&!c.open&&c.stake?c.stake:0; try{ return o(c); } finally { wgOpen=0; } }; })();
(function(){ const o=genItem; genItem=function(ilvl,w,mf,...a){ if(wgOpen>0&&Array.isArray(w)){ ilvl+=Math.ceil(wgOpen/2); const k=1+wgOpen*WG.mf/100; w=w.map((x,i)=>i>=3?x*k:x); } return o(ilvl,w,mf,...a); }; })();
/* the readout under the boss's life */
(function(){ const st=document.createElement('style'); st.textContent=`#bossbar .wg{margin-top:calc(var(--u)*.5);font-family:var(--fs);font-size:max(10px,calc(var(--u)*1.15));color:var(--ash);letter-spacing:.05em;text-shadow:0 1px 0 #000;white-space:nowrap}
#bossbar .wg b{font-family:'Shippori Mincho',serif;font-weight:400;color:var(--gold);margin-right:.5em}#bossbar .wg i{font-style:normal;color:var(--gold);letter-spacing:.12em}#bossbar .wg u{text-decoration:none;color:#ff5a40;margin-left:.5em}#bossbar .wg.off em{font-style:normal;color:#ff7a4a;animation:wgp .5s infinite alternate}@keyframes wgp{to{opacity:.4}}`; document.head.appendChild(st);
  let last=''; setInterval(()=>{ try{ const bar=$('#bossbar'); if(!bar) return; let el=bar.querySelector('.wg'); const on=wgOn()&&mode!=='title'&&bar.classList.contains('on'); if(!on){ if(el&&last!==''){ el.innerHTML=''; last=''; } return; }
    if(!el){ el=document.createElement('div'); el.className='wg'; bar.appendChild(el); } const w=L.wg, v=wgVal(w), offer=w.offerT>time;
    const txt=`<b>賭</b><i>${'◆'.repeat(w.n)}${'◇'.repeat(WG.max-w.n)}</i>${w.mult>1?`<u>×${w.mult}</u>`:''} &nbsp;${v>0?`chest +${Math.ceil(v/2)} levels · best drops ×${(1+v*WG.mf/100).toFixed(1)}`:'nothing staked'}${offer?' &nbsp;<em>double it?</em>':''}`;
    if(txt!==last){ last=txt; el.innerHTML=txt; el.classList.toggle('off',offer); } }catch(e){} },150); })();
