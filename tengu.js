'use strict';
/* ===== tengu (v23): Kurohana, the Tengu who sells insurance =====
   A red-faced tengu with a long nose and a little black cap stands in the Rope-House between the Altar and the Wheel.
   He insures one item against the Hungry Altar: the next time it is offered, the gods may bless it or strip it,
   but they cannot devour it. One policy covers one offering, and it burns either way.
   - Price: by rarity and item level, and ×1.45 for every time the item has been offered before (it gets very dear).
   - You pay the full price up front. Then his abacus-reel spins a rarity; land higher and he hands part of it back
     (Normal 0% · Magic 10% · Rare 25% · Legendary 45% · Unique 65% · Abyssal 90%). */

CAB.tengu=33;
const INS_TIERS=[{n:'Normal',back:0,w:50},{n:'Magic',back:10,w:28},{n:'Rare',back:25,w:14},{n:'Legendary',back:45,w:6},{n:'Unique',back:65,w:1.8},{n:'Abyssal',back:90,w:.2}];
function insPrice(it){ const base=[40,80,160,350,600,1500][it.rarity]||40; return Math.round(base*(1+(it.ilvl||1)*.08)*Math.pow(1.45,it.rc||0)); }
const TENGU={sel:null,busy:false,last:null};
const tenguScr=document.createElement('div'); tenguScr.className='screen'; tenguScr.id='tenguScr'; tenguScr.hidden=true; stage.appendChild(tenguScr);
(function(){ const st=document.createElement('style'); st.textContent=`
#tenguScr{background:radial-gradient(ellipse at 50% 30%,rgba(70,16,10,.92),rgba(4,2,3,.97) 72%)}
#tenguScr .mh{font-size:calc(var(--u)*3.2);margin-bottom:calc(var(--u)*.3)}
#tenguScr .sub{font-family:var(--fs);font-size:max(10px,calc(var(--u)*1.2));color:#b08a70;letter-spacing:.06em;margin-bottom:calc(var(--u)*1);max-width:calc(var(--u)*70)}
#tenguScr .bag{grid-template-columns:repeat(9,calc(var(--u)*3.9));grid-auto-rows:calc(var(--u)*3.9)}
#tenguScr .bag.worn{grid-template-columns:repeat(6,calc(var(--u)*4.4))}
.tgc{min-width:calc(var(--u)*30);max-width:calc(var(--u)*38);display:flex;flex-direction:column;align-items:center;gap:calc(var(--u)*.7)}
.tgc canvas.tgf{width:calc(var(--u)*12);height:calc(var(--u)*12);image-rendering:pixelated}
.tgc .q{font-family:var(--fs);font-size:max(10px,calc(var(--u)*1.25));color:#d8ccb0;text-align:center;line-height:1.4;max-width:calc(var(--u)*34)}
.tgc .pr{font-family:var(--fd);font-size:calc(var(--u)*2.6);color:#e8c25a}
.tgreel{position:relative;width:calc(var(--u)*32);height:calc(var(--u)*5.4);overflow:hidden;border:1px solid #5a2a1a;background:#0a0606}
.tgreel .strip{display:flex;position:absolute;left:0;top:0;height:100%;will-change:transform}
.tgreel .c{flex:0 0 calc(var(--u)*7);height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;border-right:1px solid #1a1010;font-family:var(--fs);font-size:max(9px,calc(var(--u)*1.05));color:var(--rc)}
.tgreel .c b{font-family:var(--fd);font-size:calc(var(--u)*1.9);font-weight:400}
.tgreel .ln{position:absolute;left:50%;top:0;bottom:0;width:2px;background:#ff5a3a;box-shadow:0 0 8px #ff5a3a;transform:translateX(-1px)}
.tgres{max-width:calc(var(--u)*36);font-family:var(--fd);font-size:calc(var(--u)*1.8);text-align:center;min-height:1.3em;color:var(--bone)}
.slot.ins::after{content:"保";position:absolute;right:1px;bottom:0;font-family:'Shippori Mincho',serif;font-size:calc(var(--u)*1.2);color:#ff7a4a;text-shadow:0 0 3px #000}
`; document.head.appendChild(st); })();

/* ---------- him, in the Rope-House ---------- */
function drawTenguAt(g,x,y,s,face,t){ const p=(px,py,w,h,c)=>{ g.fillStyle=c; g.fillRect(Math.round(x+px*s*face-(face<0?w*s:0)),Math.round(y+py*s),Math.max(1,w*s),Math.max(1,h*s)); };
  const bob=Math.round(Math.sin(t*1.8)*.6);
  /* geta and legs */ p(-4,-2,3,2,'#3a2414'); p(1,-2,3,2,'#3a2414'); p(-3,-6,2,4,'#e8e0d0'); p(1,-6,2,4,'#e8e0d0');
  /* ochre robe, white over-collar, pom-poms of the yamabushi */ p(-6,-20+bob,12,14,'#c98a3a'); p(-6,-20+bob,12,1,'#e8b060'); p(-1,-20+bob,2,14,'#8a5a20');
  p(-5,-19+bob,3,3,'#e8e0d0'); p(2,-19+bob,3,3,'#e8e0d0'); for(const yy of [-17,-13]){ p(-4,yy+bob,2,2,'#f0f0f0'); p(2,yy+bob,2,2,'#f0f0f0'); }
  /* black feathered wings behind */ p(-10,-22+bob,4,12,'#1a1418'); p(-12,-18+bob,2,8,'#1a1418'); p(6,-22+bob,4,12,'#1a1418'); p(10,-18+bob,2,8,'#1a1418');
  /* the red face and the long nose */ p(-4,-28+bob,8,8,'#c4241c'); p(-4,-28+bob,8,1,'#e04a3a'); p(4,-25+bob,6,2,'#d8342a'); p(9,-25+bob,1,1,'#ff6a5a');
  p(-2,-26+bob,2,1,'#120808'); p(1,-26+bob,2,1,'#120808'); p(-3,-27+bob,3,1,'#f0f0f0'); p(1,-27+bob,3,1,'#f0f0f0'); p(-1,-22+bob,3,1,'#5a0a08');
  /* wild white hair and beard */ p(-6,-28+bob,2,9,'#f0ece4'); p(-5,-21+bob,6,2,'#f0ece4'); p(-6,-30+bob,10,2,'#f0ece4');
  /* the tokin: a tiny black cap tied on the forehead */ p(-1,-34+bob,4,4,'#120c10'); p(-2,-31+bob,6,1,'#120c10'); p(0,-35+bob,2,1,'#3a2a30');
  /* a feather fan in the far hand */ const fw=Math.sin(t*3)*.5; p(6,-20+bob,1,6,'#3a2414'); p(5+fw,-27+bob,5,6,'#2a2228'); p(6+fw,-26+bob,3,4,'#4a4048'); }
function drawTengu(){ if(!L||L.def.kind!=='cabin') return; const F=16*T, x=CAB.tengu*T+4; const face=P&&P.x<x?-1:1;
  drawTenguAt(ctx,x-camR.x,F-camR.y,1,face,time);
  /* his little lectern: a ledger with a red seal */ const lx=Math.round(x+(face>0?12:-22)-camR.x), ly=Math.round(F-14-camR.y); rect(ctx,lx,ly,10,14,'#2a1a10'); rect(ctx,lx-1,ly-2,12,3,'#d8ccb0'); rect(ctx,lx+6,ly-2,3,2,'#b0141a');
  addLight(x,F-24,50,.35,1,.4,.25); }
(function(){ const o=drawPlats; drawPlats=function(){ drawTengu(); o(); }; })();
(function(){ const o=findInteract; findInteract=function(){ const b=o(); if(!L||L.def.kind!=='cabin'||!P) return b; const x=CAB.tengu*T+4, d=Math.abs(P.x-x);
  const bd=b&&typeof b.o==='number'?Math.abs(b.o*T+8-P.x):b?6:1e9; if(d<16&&d<bd) return {o:CAB.tengu,txt:'<kbd>E</kbd> Kurohana the Tengu · insure an item against the Altar',act:openTengu}; return b; }; })();

/* ---------- the screen ---------- */
function owned(){ return typeof ownedList==='function'?ownedList():[]; }
function openTengu(){ TENGU.sel=null; TENGU.last=null; mode='altar'; hud.hidden=true; tenguScr.hidden=false; AU.tone('triangle',330,280,.3,.1,.4); renderTengu(); }
function closeTengu(){ if(TENGU.busy) return; tenguScr.hidden=true; hideTip(); mode='play'; hud.hidden=false; saveGame(); }
const TG_LINES=['"Every god is a bank. I am the only honest one."','"The Altar is hungry. I am merely peckish. Pay me first."','"Nothing is lost if it is insured. Except the premium."','"A small fee. A long nose. A guarantee."'];
function renderTengu(){ const it=TENGU.sel, pr=it?insPrice(it):0;
  tenguScr.innerHTML=`<h2 class="mh">Kurohana <span style="font-family:'Shippori Mincho',serif;color:#c4241c">天狗</span></h2><div class="sub">He insures one item against the Hungry Altar. Insured, the next offering can be blessed or stripped but never devoured. One policy, one offering. ${pick(TG_LINES)}</div>
  <div class="pane"><div class="panel"><h3>Satchel</h3><div class="bag" id="tgBag"></div><h3 style="margin-top:.6em">Worn</h3><div class="bag worn" id="tgWorn"></div><div class="hint">Click an item to ask his price. 保 marks an insured item.</div></div>
  <div class="panel tgc"><canvas class="tgf" width="40" height="40"></canvas>
    ${it?`<div class="slot r${it.rarity}" id="tgSel" style="width:calc(var(--u)*7);height:calc(var(--u)*7)"></div>
      <div class="q">${it.ins?'Already insured for its next offering.':`Offered at the Altar <b>${it.rc||0}</b> time${(it.rc||0)===1?'':'s'}${it.rc?` · each one makes the policy ×1.45 dearer`:''}.`}</div>
      <div class="pr">${it.ins?'—':pr+' crowns'}</div>
      <div class="q">You pay it now. Then his reel spins: land higher and he gives part of it back.<br>${INS_TIERS.map((t,i)=>`<span style="color:${RCOL[i]}">${t.n} ${t.back}%</span>`).join(' · ')}</div>`
      :'<div class="q">Pick something from your satchel or what you wear.</div>'}
    <div class="tgreel" id="tgReel"><div class="strip"></div><div class="ln"></div></div><div class="tgres" id="tgRes">${TENGU.last||''}</div>
    <div class="row"><button class="btn" id="tgGo"${it&&!it.ins&&P.gold>=pr?'':' disabled'}>Insure it · ${it&&!it.ins?pr:'—'} <kbd>E</kbd></button><button class="btn ghost" id="tgClose">Leave <kbd>Esc</kbd></button></div>
    <div class="q">Carried: <b>${P.gold}</b> crowns</div></div></div>`;
  const fc=tenguScr.querySelector('canvas.tgf').getContext('2d'); fc.imageSmoothingEnabled=false; drawTenguAt(fc,18,38,1,1,0);
  const mk=e=>{ const d=slotEl(e.it,()=>{ if(TENGU.busy) return; TENGU.sel=e.it; TENGU.last=null; hideTip(); AU.tone('triangle',500,420,.06,.06,.1); renderTengu(); }); if(e.it===TENGU.sel) d.classList.add('sel'); if(e.it.ins) d.classList.add('ins'); return d; };
  const all=owned(), bag=$('#tgBag'), worn=$('#tgWorn');
  for(let i=0;i<Math.max(27,Math.ceil(P.bag.length/9)*9);i++){ const e=all.find(x=>x.where==='bag'&&x.i===i); bag.appendChild(e?mk(e):slotEl(null)); }
  const w=all.filter(x=>x.where==='equip'); for(const e of w) worn.appendChild(mk(e)); for(let i=w.length;i<6;i++) worn.appendChild(slotEl(null));
  if(it){ const s=$('#tgSel'); s.appendChild(iconEl(it)); bindTip(s,it); }
  fillReel(); $('#tgGo').onclick=insureGo; $('#tgClose').onclick=closeTengu; }
function fillReel(win){ const strip=tenguScr.querySelector('.tgreel .strip'); if(!strip) return; const N=40, cells=[];
  for(let i=0;i<N;i++){ const r=i===32&&win!=null?win:rollIns(); cells.push(`<div class="c" style="--rc:${RCOL[r]}"><b>−${INS_TIERS[r].back}%</b>${INS_TIERS[r].n}</div>`); }
  strip.innerHTML=cells.join(''); strip.style.transition='none'; strip.style.transform='translateX(0px)'; return strip; }
function rollIns(){ const tot=INS_TIERS.reduce((a,t)=>a+t.w,0); let r=Math.random()*tot; for(let i=0;i<INS_TIERS.length;i++){ r-=INS_TIERS[i].w; if(r<=0) return i; } return 0; }
function insureGo(){ const it=TENGU.sel; if(!it||it.ins||TENGU.busy) return; const pr=insPrice(it); if(P.gold<pr){ AU.tone('square',200,150,.15,.08,.2); return; }
  P.gold-=pr; AU.coin(); TENGU.busy=true; const win=rollIns(); const strip=fillReel(win); const reel=$('#tgReel'), cw=strip.firstChild.offsetWidth;
  $('#tgGo').disabled=true; $('#tgClose').disabled=true; $('#tgRes').textContent=`Paid ${pr}. The reel turns…`;
  const target=32*cw+cw*(.15+Math.random()*.7)-reel.clientWidth/2, dur=RM?600:3200, t0=performance.now(); let li=-1;
  const step=now=>{ const k=Math.min(1,(now-t0)/dur), e=1-Math.pow(1-k,4), x=target*e; strip.style.transform=`translateX(${-x}px)`; const idx=Math.floor((x+reel.clientWidth/2)/cw); if(idx!==li){ li=idx; AU.tick(); }
    if(k<1) requestAnimationFrame(step); else land(); };
  const land=()=>{ const back=Math.round(pr*INS_TIERS[win].back/100); P.gold+=back; it.ins=1; TENGU.busy=false; calcStats(); saveGame();
    if(back) AU.coin(); if(win>=3&&typeof AU.reveal==='function') AU.reveal(Math.min(5,win)); else AU.tone('triangle',600,800,.12,.08,.2);
    TENGU.last=`<span style="color:${RCOL[win]}">${INS_TIERS[win].n}</span> · ${back?`he hands back ${back} crowns. You paid ${pr-back}.`:'no refund. You paid the full price.'} Insured.`; renderTengu(); };
  requestAnimationFrame(step); }
addEventListener('keydown',ev=>{ if(tenguScr.hidden) return; const k=ev.key.length===1?ev.key.toLowerCase():ev.key;
  if(k==='Escape'){ ev.preventDefault(); closeTengu(); } else if(k==='e'||k==='Enter'){ ev.preventDefault(); insureGo(); } });

/* ---------- the Altar honours the policy ---------- */
VERDICT.spared={k:'保',t:'Spared',c:'#ff7a4a',s:'The mouth closed on it, and opened again. Kurohana\'s seal burned instead. The item comes back as it went in.'};
(function(){ const o=altarGo; altarGo=function(){ const it=ALTAR.prim; if(!it||ALTAR.busy) return o(); const ins=!!it.ins; it.rc=(it.rc||0)+1; it.ins=0; ALTAR._ins=ins?it:null; ALTAR._saved=false;
  try{ return o(); } finally{ ALTAR._ins=null; } }; })();
(function(){ const o=takeOut; takeOut=function(it){ if(ALTAR._ins&&it===ALTAR._ins){ ALTAR._saved=true; return; } return o(it); }; })();
(function(){ const o=putIn; putIn=function(old,nit){ if(old&&nit&&nit!==old&&old.rc) nit.rc=old.rc; return o(old,nit); }; })();
(function(){ const o=altarResult; altarResult=function(out,res,was){ if(out==='devour'&&ALTAR._saved){ ALTAR._saved=false; AU.toll&&AU.toll(); return o('spared',res,was); } return o(out,res,was); }; })();
(function(){ const o=renderAltar; renderAltar=function(){ o(); const it=ALTAR.prim; const w=altarScr.querySelector('.alodds .why'); if(it&&w) w.insertAdjacentHTML('beforeend',it.ins?'<br><span style="color:#ff7a4a">保 Insured by Kurohana: if the gods would devour it, it comes back unharmed. The policy burns either way.</span>':`<br>Offered here ${it.rc||0} time${(it.rc||0)===1?'':'s'} before. Kurohana the Tengu can insure it.`); }; })();
(function(){ const o=tipHTML; tipHTML=function(it){ const h=o(it); if(!it) return h; let x=''; if(it.ins) x+='<div class="g" style="color:#ff7a4a;margin-top:.3em">保 Insured · the next offering at the Altar can\'t devour it</div>'; if(it.rc) x+=`<div class="g" style="margin-top:.2em">Offered at the Altar ${it.rc}×</div>`; return h+x; }; })();
