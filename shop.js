'use strict';
/* ===== shop (v23): the Pale Merchant walks the Pit with you =====
   - Between levels there is no shop page any more: only Ilse's letter (when a crow brings one) and Continue.
   - The Pale Merchant stands near the start of every level of the descent (not the prologue wall, not the Rope-House).
     He carries a few boxes and a couple of draughts, and he doesn't restock: what he has on this level is what there is.
   - Every box bought on a descent makes the next one dearer (×1.6), on top of the price rising with depth. The count
     resets when you go home.
   - He buys anything in your satchel. Legendary and better ask twice. On a boss level he leaves when the boss wakes. */

/* ---------- between levels: just Continue ---------- */
merchantCard=function(next){ const hol=typeof SECRET!=='undefined'&&SECRET.on&&typeof HOLLOW!=='undefined'; const def=hol?HOLLOW:LEVELS[lvlIdx]; const letter=LETTERS[def.id];
  const go=[{label:'Continue',fn:()=>{ hideCard(); next(); }}];
  if(letter) showCard({sal:'A crow found you in the dark. A letter on its leg.',body:letter,sig:'— Ilse',buttons:go});
  else showCard({title:def.name,jp:'登',body:'Behind you now. Up.',buttons:go}); };
merchantCardSilent=function(next){ merchantCard(next); if(typing){ clearInterval(typing); typing=null; } $('#ledger').classList.add('on'); $('#cardBtns').hidden=false; };

/* ---------- stock and prices ---------- */
const SHOP={sell:false,ask:null,back:null};
function shopRun(){ if(!META.shop||META.shop.run!==META.runs) META.shop={run:META.runs,stock:{},bought:0}; return META.shop; }
function shopStock(){ const r=shopRun(); const k=lvlIdx+(typeof SECRET!=='undefined'&&SECRET.on?'h':''); return r.stock[k]||(r.stock[k]={box:L&&L.omen==='gilded'?3:2,pot:2}); }
const boxBase=()=>Math.round(70+35*dep());
const boxPrice=n=>Math.round(boxBase()*Math.pow(1.6,n==null?shopRun().bought:n));
const potPrice=()=>Math.round(20+dep()*6);
function sellPrice(it){ if(!it) return 0; const v=[4,12,35,80,120,300][it.rarity]||4; return Math.max(1,Math.round(v*(1+(it.ilvl||1)*.12))); }
(function(){ const o=goCabin; goCabin=function(){ if(typeof META!=='undefined') META.shop=null; return o.apply(this,arguments); }; })();

/* ---------- where he stands ---------- */
function placeMerchant(){ L.merch=null; const d=L.def; if(!d||lvlIdx===0||d.kind==='cabin'||d.kind==='surface') return;
  const sx=Math.floor(L.spawn.x/T), sy=Math.floor(L.spawn.y/T); const boss=d.kind==='boss'; let best=null, bs=1e9;
  for(let dx=-6;dx<=8;dx++){ const tx=sx+dx; if(Math.abs(dx)<2||tx<1||tx>=L.w-1) continue; if(boss&&tx*T>8*T) continue;
    for(let ty=sy-3;ty<=sy+3;ty++){ const v=tileAt(tx,ty); if(!(v===1||v===2)||tileAt(tx,ty-1)!==0||tileAt(tx,ty-2)!==0||tileAt(tx,ty-3)!==0) continue; const sc=Math.abs(dx-3)+Math.abs(ty-sy)*2; if(sc<bs){ bs=sc; best={x:tx*T+8,y:ty*T}; } } }
  if(best) L.merch={x:best.x,y:best.y,gone:false,boss}; }
(function(){ const o=loadLevel; loadLevel=function(idx,opt){ const r=o(idx,opt); try{ placeMerchant(); }catch(e){ L.merch=null; } return r; }; })();
(function(){ const o=update; update=function(dt){ o(dt); const m=L&&L.merch; if(m&&m.boss&&!m.gone&&enemies.some(e=>e.boss&&!e.intro)){ m.gone=true; m.fade=1; } if(m&&m.fade>0) m.fade=Math.max(0,m.fade-dt*1.5); }; })();
(function(){ const o=findInteract; findInteract=function(){ const b=o(); const m=L&&L.merch; if(!m||m.gone||!P) return b; const dx=Math.abs(m.x-P.x);
  if(dx<22&&Math.abs(m.y-P.y)<24&&(!b||dx<6)) return {o:m,txt:`<kbd>E</kbd> The Pale Merchant · trade (${P.gold} crowns)`,act:()=>openMerchant()}; return b; }; })();

function drawMerchant(){ const m=L&&L.merch; if(!m||(m.gone&&!(m.fade>0))) return; const sx=Math.round(m.x-camR.x), sy=Math.round(m.y-camR.y); if(sx<-40||sx>W+40||sy<-60||sy>H+40) return;
  const a=m.gone?m.fade:1; ctx.globalAlpha=a; ectx.globalAlpha=a; const face=P&&P.x<m.x?-1:1, br=Math.round(Math.sin(time*1.6)*.6);
  /* pack of boxes on his back */ rect(ctx,sx-face*8-4,sy-24+br,8,6,'#3a2414'); rect(ctx,sx-face*8-4,sy-24+br,8,1,'#6a4a2a'); rect(ctx,sx-face*8-3,sy-18+br,7,6,'#2e1c10'); rect(ctx,sx-face*8-3,sy-18+br,7,1,'#c9a96a');
  /* long grey cloak */ ctx.fillStyle='#4a4650'; ctx.beginPath(); ctx.moveTo(sx-6,sy); ctx.lineTo(sx-4,sy-24+br); ctx.lineTo(sx+4,sy-24+br); ctx.lineTo(sx+6,sy); ctx.fill(); rect(ctx,sx-6,sy-1,12,1,'#2a262e'); rect(ctx,sx-1,sy-22+br,1,20,'#3a3640');
  /* hood and the faceless face */ rect(ctx,sx-4,sy-31+br,8,8,'#3a3640'); rect(ctx,sx-3,sy-30+br,6,6,'#d8d2c4'); rect(ctx,sx-3,sy-30+br,6,1,'#3a3640'); rect(ctx,sx+(face>0?1:-3),sy-27+br,2,1,'#bdb6a8');
  /* the lantern on a crook */ const lx=sx+face*9; rect(ctx,lx,sy-34+br,1,34,'#2a1a10'); rect(ctx,lx-face*3,sy-34+br,4,1,'#2a1a10'); const fl=.7+.3*Math.sin(time*9+m.x);
  rect(ctx,lx-face*3-1,sy-32+br,3,4,'#5a4a30'); ectx.fillStyle=`rgba(255,${190+Math.round(fl*40)},120,.9)`; ectx.fillRect(lx-face*3,sy-31+br,1,2);
  addLight(m.x+face*7,m.y-30,70,.8*fl*a,1,.85,.55); ctx.globalAlpha=1; ectx.globalAlpha=1; }
(function(){ const o=drawPlats; drawPlats=function(){ o(); drawMerchant(); }; })();

/* ---------- trading ---------- */
const MERCH_LINES=['He has no face. The lantern looks at you instead.','"You can afford exactly this."','He holds out a box. It is warmer than it should be.','"Down here everything is for sale. Up there too, but they lie about it."','He waits. He is good at it.'];
function backToPlay(){ hideCard(); mode='play'; hud.hidden=false; }
function openMerchant(){ if(P.dead) return; mode='card'; AU.coin(); merchantTrade(true); }
function merchantTrade(type){ const st=shopStock(), r=shopRun(), bc=boxPrice(), pc=potPrice();
  showCard({title:'The Pale Merchant',jp:'商人',body:type?pick(MERCH_LINES):'He waits.',
    ledger:`Carried: <b>${P.gold}</b> crowns. Boxes bought this descent: <b>${r.bought}</b> · every one makes the next dearer.`,
    buttons:[{label:`The Merchant's box · ${bc} <small>${st.box?`${st.box} left on this level · after it: ${boxPrice(r.bought+1)}`:'none left on this level'}</small>`,disabled:!st.box||P.gold<bc,fn:()=>buyBox()},
      {label:`A draught · ${pc} <small>${st.pot?`${st.pot} left`:'none left'} · your belt ${P.potions} / ${POT_MAX}</small>`,disabled:!st.pot||P.gold<pc||P.potions>=POT_MAX,fn:()=>{ if(!st.pot||P.gold<pc||P.potions>=POT_MAX) return; P.gold-=pc; st.pot--; P.potions++; AU.coin(); updBelt(); saveGame(); merchantTrade(false); }},
      {label:'Sell from your satchel <small>click an item to sell it</small>',fn:()=>openSell()},
      {label:'Leave',ghost:1,fn:backToPlay}]});
  if(!type){ if(typing){ clearInterval(typing); typing=null; } $('#lbody').textContent='He waits.'; $('#ledger').classList.add('on'); $('#cardBtns').hidden=false; }
  $('#cardBtns').classList.add('koan'); }
function buyBox(){ const st=shopStock(), r=shopRun(), bc=boxPrice(); if(!st.box||P.gold<bc) return; P.gold-=bc; st.box--; r.bought++; saveGame(); hideCard();
  const ilvl=ilvlNow()+1; const win=genItem(ilvl,CW[3],P.stats.mf); playChestCine(3,win.rarity,()=>showCase(3,ilvl,win,()=>{ mode='card'; merchantTrade(false); })); }

/* ---------- selling: the satchel opens and a click sells ---------- */
function openSell(){ hideCard(); SHOP.sell=true; SHOP.ask=null; toggleInv(true,'bag'); sellBar(); }
function sellBar(){ const pane=$('#paneBag'); if(!pane) return; let b=$('#sellBar'); if(!SHOP.sell){ if(b) b.remove(); return; }
  if(!b){ b=document.createElement('div'); b.id='sellBar'; pane.insertBefore(b,pane.firstChild); }
  b.innerHTML=`<span>商 Selling to the Pale Merchant · click an item to sell it · Legendary and better ask twice · you carry <b>${P.gold}</b> crowns</span><button class="btn ghost" id="sellDone">Done</button>`;
  $('#sellDone').onclick=()=>toggleInv(false); }
function sellAt(i,force){ const it=P.bag[i]; if(!it) return; const v=sellPrice(it);
  if(it.rarity>=3&&!force&&SHOP.ask!==it){ SHOP.ask=it; invMsg(`Sell ${it.name} for ${v} crowns? Click it again.`); AU.tone('triangle',500,400,.08,.06,.1); return; }
  P.bag.splice(i,1); P.gold+=v; SHOP.ask=null; AU.coin(); hideTip(); invMsg(`Sold ${it.name} for ${v} crowns.`); renderInv(); sellBar(); saveGame(); }
(function(){ const o=equipFromBag; equipFromBag=function(i,wantOff){ if(SHOP.sell){ sellAt(i,false); return; } return o(i,wantOff); }; })();
(function(){ const o=dropFromBag; dropFromBag=function(i){ if(SHOP.sell){ sellAt(i,true); return; } return o(i); }; })();
(function(){ const o=toggleInv; toggleInv=function(open,tab){ const r=o(open,tab); if(!open&&SHOP.sell){ SHOP.sell=false; sellBar(); mode='card'; merchantTrade(false); } else if(open) sellBar(); return r; }; })();
(function(){ const o=renderInv; renderInv=function(){ o(); if(SHOP.sell) sellBar(); }; })();
(function(){ const o=tipHTML; tipHTML=function(it){ const h=o(it); return SHOP.sell&&P&&P.bag.includes(it)?h+`<div class="g" style="margin-top:.35em;color:#e8c25a">Sells for ${sellPrice(it)} crowns</div>`:h; }; })();
(function(){ const st=document.createElement('style'); st.textContent=`#sellBar{display:flex;align-items:center;justify-content:space-between;gap:calc(var(--u)*1);padding:calc(var(--u)*.5) calc(var(--u)*1);margin-bottom:calc(var(--u)*.6);border:1px solid #6a5020;background:rgba(40,28,8,.6);font-family:var(--fs);font-size:max(10px,calc(var(--u)*1.2));color:#e8c25a}
#sellBar b{color:#ffe9a0}#sellBar .btn{padding:calc(var(--u)*.3) calc(var(--u)*1.2)}`; document.head.appendChild(st); })();
