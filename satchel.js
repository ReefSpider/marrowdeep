'use strict';
/* ===== the satchel grid (v21) =====
   Playtest: "users can't move items around in their backpack" and "make it a bit more modern, items take up a few
   slots based on size, more boxes so it doesn't fill up too fast".
   - 16 × 10 cells (was 24 single slots). Sizes come from itemSize() in items.js.
   - Drag an item to move it. Drop it on another item to swap the two. Drop it on a worn slot to wear it; drag a worn
     item into the satchel to take it off. In the stash, drag (or click) an item onto the stash to store it.
   - Sort packs everything by kind (weapons, off hands, armour, helms, amulets, rings), best first.
   - The Kintsugi Seals you carry sit in a pocket under the grid, with what they are for. */

/* ---------- drawing an item into its cells ---------- */
const BAG_PX=16; /* canvas pixels per cell; CSS scales it */
function bagArt(it){ const [w,h]=itemSize(it); const c=document.createElement('canvas'); c.width=w*BAG_PX*2; c.height=h*BAG_PX*2; const g=c.getContext('2d'); g.imageSmoothingEnabled=false;
  const ic=getIcon(it), long=it.slot==='weapon'&&!['shield','xbow'].includes(it.base.cls)&&h>w;
  if(long){ /* the icons lie on the diagonal; stand the long ones upright in their column */
    const k=Math.min(c.height*.98/45,c.width*1.5/18); g.translate(c.width/2,c.height/2); g.rotate(-Math.PI/4); g.scale(k,k); g.drawImage(ic,-16,-16); }
  else { const k=Math.max(1,Math.min(Math.floor(Math.min(c.width,c.height)/32),Math.round(Math.min(c.width,c.height)*.95/32))); const s=32*k; g.drawImage(ic,Math.round((c.width-s)/2),Math.round((c.height-s)/2),s,s); }
  return c; }

/* ---------- the grid ---------- */
let BAGDRAG=null;
function renderBagGrid(root,o){ o=o||{}; bagEnsure(); root.innerHTML=''; root.className='ggrid'; root.style.setProperty('--cell',o.cell||'calc(var(--u)*3.1)');
  root._opt=o; const hl=document.createElement('div'); hl.className='ghl'; hl.hidden=true; root.appendChild(hl);
  P.bag.forEach((it,i)=>{ const [w,h]=itemSize(it); const d=document.createElement('div'); d.className='gitem r'+it.rarity; d.style.left=`calc(var(--cell)*${it.bx})`; d.style.top=`calc(var(--cell)*${it.by})`;
    d.style.width=`calc(var(--cell)*${w} - 2px)`; d.style.height=`calc(var(--cell)*${h} - 2px)`; d.appendChild(bagArt(it));
    if(typeof canWear==='function'&&!canWear(it)) d.classList.add('toohigh');
    bindTip(d,it); d._it=it;
    d.onpointerdown=e=>{ if(e.button!==0) return; e.preventDefault(); startBagDrag(e,{it,el:d,from:'bag',root}); };
    d.oncontextmenu=e=>{ e.preventDefault(); const j=P.bag.indexOf(it); if(j>=0&&o.context) o.context(it,j,e); };
    root.appendChild(d); }); }

function startBagDrag(e,src){ const r=src.el.getBoundingClientRect(); BAGDRAG={...src,x0:e.clientX,y0:e.clientY,dx:e.clientX-r.left,dy:e.clientY-r.top,on:false,ghost:null,shift:e.shiftKey,target:null};
  addEventListener('pointermove',bagDragMove); addEventListener('pointerup',bagDragUp); addEventListener('pointercancel',bagDragCancel); }
function bagDragCancel(){ const D=BAGDRAG; if(!D) return; endDragVisuals(D); BAGDRAG=null; unbindDrag(); }
function unbindDrag(){ removeEventListener('pointermove',bagDragMove); removeEventListener('pointerup',bagDragUp); removeEventListener('pointercancel',bagDragCancel); }
function endDragVisuals(D){ if(D.ghost) D.ghost.remove(); if(D.el) D.el.classList.remove('lifted'); document.querySelectorAll('.ghl').forEach(h=>h.hidden=true); document.querySelectorAll('.dropok,.dropbad').forEach(x=>x.classList.remove('dropok','dropbad')); }
function bagDragMove(e){ const D=BAGDRAG; if(!D) return;
  if(!D.on){ if(Math.hypot(e.clientX-D.x0,e.clientY-D.y0)<5) return; D.on=true; hideTip(); D.el.classList.add('lifted');
    const sr=stage.getBoundingClientRect(); let r=D.el.getBoundingClientRect();
    if(D.from!=='bag'){ /* a worn item is carried at its satchel size, held by its middle */ const gr=$('#bag')&&$('#bag').getBoundingClientRect(), cp=gr?gr.width/BAG_W:30, [w,h]=itemSize(D.it); r={width:w*cp,height:h*cp}; D.dx=r.width/2; D.dy=r.height/2; }
    const g=document.createElement('div'); g.className='gghost r'+D.it.rarity; g.style.width=r.width+'px'; g.style.height=r.height+'px';
    g.appendChild(bagArt(D.it)); stage.appendChild(g); D.ghost=g; D.sr=sr; AU.tone&&AU.tone('triangle',520,620,.04,.05,.06); }
  hideTip(); D.ghost.style.left=(e.clientX-D.sr.left-D.dx)+'px'; D.ghost.style.top=(e.clientY-D.sr.top-D.dy)+'px';
  document.querySelectorAll('.ghl').forEach(h=>h.hidden=true); document.querySelectorAll('.dropok,.dropbad').forEach(x=>x.classList.remove('dropok','dropbad'));
  D.target=bagTargetAt(e); const t=D.target; D.ghost.classList.remove('ok','swap','bad'); if(!t) return; D.ghost.classList.add(t.how);
  if(t.kind==='grid'){ const [w,h]=itemSize(D.it); const hl=t.root.querySelector('.ghl'); hl.hidden=false; hl.style.left=`calc(var(--cell)*${t.x})`; hl.style.top=`calc(var(--cell)*${t.y})`; hl.style.width=`calc(var(--cell)*${w})`; hl.style.height=`calc(var(--cell)*${h})`; hl.className='ghl '+t.how; }
  else if(t.el) t.el.classList.add(t.how==='bad'?'dropbad':'dropok'); }
/* what is under the pointer: a cell in the grid (free, a swap, or blocked), a worn slot, or a custom drop zone */
function bagTargetAt(e){ const D=BAGDRAG; const under=document.elementsFromPoint(e.clientX,e.clientY);
  const grid=under.find(x=>x.classList&&x.classList.contains('ggrid'));
  if(grid){ const r=grid.getBoundingClientRect(), cp=r.width/BAG_W, [w,h]=itemSize(D.it);
    const x=clamp(Math.round((e.clientX-D.dx-r.left)/cp),0,BAG_W-w), y=clamp(Math.round((e.clientY-D.dy-r.top)/cp),0,BAG_H-h);
    const self=D.from==='bag'?[D.it]:[]; if(bagFits(D.it,x,y,self)) return {kind:'grid',root:grid,x,y,how:'ok'};
    const hits=P.bag.filter(o=>o!==D.it&&o.bx!=null&&(()=>{ const [ow,oh]=itemSize(o); return x<o.bx+ow&&x+w>o.bx&&y<o.by+oh&&y+h>o.by; })());
    if(hits.length===1) return {kind:'grid',root:grid,x,y,how:'swap',other:hits[0]};
    return {kind:'grid',root:grid,x,y,how:'bad'}; }
  const eq=under.find(x=>x.dataset&&x.dataset.slot&&x.closest&&x.closest('#equip'));
  if(eq&&D.from==='bag'){ const s=eq.dataset.slot; return {kind:'equip',el:eq,slot:s,how:fitsSlot(D.it,s)?'ok':'bad'}; }
  const zones=(D.root&&D.root._opt&&D.root._opt.drops)||{}; for(const sel in zones){ const z=under.find(x=>x.matches&&x.matches(sel)); if(z) return {kind:'zone',el:z,fn:zones[sel],how:'ok'}; }
  return null; }
function fitsSlot(it,s){ if(s==='weapon') return it.slot==='weapon'&&it.base.h!==0; if(s==='off') return it.slot==='weapon'&&has('off')&&(it.base.h!==2||P.way==='giant')||(it.slot==='weapon'&&it.base.cls==='xbow'&&P.way==='xbows'); return it.slot===s; }
function bagDragUp(e){ const D=BAGDRAG; if(!D) return; unbindDrag(); BAGDRAG=null; endDragVisuals(D); const opt=(D.root&&D.root._opt)||{};
  if(!D.on){ /* a click, not a drag */ const i=P.bag.indexOf(D.it); if(D.from==='bag'&&i>=0&&opt.click) opt.click(D.it,i,e); else if(D.from==='equip'&&D.onClick) D.onClick(e); return; }
  const t=D.target; if(!t||t.how==='bad'){ if(t) AU.tone&&AU.tone('square',200,150,.08,.06,.15); return; }
  const done=()=>{ AU.tone&&AU.tone('triangle',420,300,.08,.12,.1); hideTip(); if(opt.after) opt.after(); else if(mode==='inv'&&typeof renderInv==='function') renderInv(); if(typeof saveGame==='function'&&D.from==='equip') saveGame(); };
  if(t.kind==='zone'){ const i=P.bag.indexOf(D.it); if(i>=0) t.fn(D.it,i); return; }
  if(t.kind==='equip'){ const i=P.bag.indexOf(D.it); if(i>=0) equipFromBag(i,t.slot==='off'); return; }
  if(D.from==='bag'){
    if(t.how==='ok'){ D.it.bx=t.x; D.it.by=t.y; return done(); }
    /* swap: the other item goes where this one was, or anywhere else it fits */
    const B=t.other, ax=D.it.bx, ay=D.it.by; D.it.bx=t.x; D.it.by=t.y; const bx=B.bx, by=B.by; B.bx=null;
    if(bagFits(B,ax,ay)){ B.bx=ax; B.by=ay; return done(); } const s=bagSpot(B); if(s){ B.bx=s[0]; B.by=s[1]; return done(); }
    D.it.bx=ax; D.it.by=ay; B.bx=bx; B.by=by; invMsg('No room to swap those two.'); return; }
  if(D.from==='equip'){ const k=D.slot;
    if(t.how==='ok'){ P.equip[k]=null; D.it.bx=t.x; D.it.by=t.y; P.bag.push(D.it); calcStats(); return done(); }
    const B=t.other; if(!fitsSlot(B,k)||(typeof canWear==='function'&&!canWear(B))){ invMsg(`${B.name} can't be worn there.`); return; }
    const i=P.bag.indexOf(B); P.bag.splice(i,1); P.equip[k]=B;
    if(bagFits(D.it,t.x,t.y)){ D.it.bx=t.x; D.it.by=t.y; P.bag.push(D.it); } else if(!bagAdd(D.it)){ P.equip[k]=D.it; P.bag.splice(i,0,B); invMsg('No room for that.'); return; }
    calcStats(); if(typeof noteBest==='function') noteBest(B); return done(); } }

/* ---------- Sort: weapons, off hands, armour, helms, amulets, rings; best first; packed in columns ---------- */
function bagGroup(it){ if(it.slot==='weapon'){ const c=it.base.cls; if(c==='shield'||c==='xbow') return 2; return it.base.h===2?0:1; } return {armor:3,helm:4,amulet:5,ring:6}[it.slot]??7; }
function sortBag(){ const items=P.bag.slice().sort((a,b)=>bagGroup(a)-bagGroup(b)||b.rarity-a.rarity||(b.ilvl|0)-(a.ilvl|0)||a.name.localeCompare(b.name));
  const old=P.bag.map(it=>[it,it.bx,it.by]); P.bag=[]; let ok=true;
  for(const it of items){ let s=null; for(let x=0;x<BAG_W&&!s;x++) for(let y=0;y<BAG_H;y++) if(bagFits(it,x,y)){ s=[x,y]; break; } if(!s){ ok=false; break; } it.bx=s[0]; it.by=s[1]; P.bag.push(it); }
  if(!ok){ P.bag=old.map(([it,x,y])=>{ it.bx=x; it.by=y; return it; }); invMsg('Too full to sort. Make a little room first.'); return; }
  AU.tone&&AU.tone('triangle',330,440,.12,.08,.2); renderInv(); }

/* ---------- worn slots: drag a worn item into the satchel ---------- */
(function(){ const o=renderInv; renderInv=function(){ o(); const eq=$('#equip'); if(eq) eq.querySelectorAll('[data-slot]').forEach(d=>{ const s=d.dataset.slot, it=P.equip[s]; if(!it) return; const click=d.onclick; d.onclick=null;
      d.onpointerdown=e=>{ if(e.button!==0) return; e.preventDefault(); startBagDrag(e,{it,el:d,from:'equip',slot:s,root:$('#bag'),onClick:()=>click&&click(e)}); }; });
    const pane=$('#bag')&&$('#bag').parentElement; if(!pane) return;
    let hd=pane.querySelector('.bagHead'); if(!hd){ const h3=pane.querySelector('h3'); hd=document.createElement('div'); hd.className='bagHead'; h3.replaceWith(hd); hd.appendChild(h3); const b=document.createElement('button'); b.className='btn ghost sortBtn'; b.textContent='Sort'; b.onclick=sortBag; hd.appendChild(b); }
    const used=P.bag.reduce((a,it)=>{ const [w,h]=itemSize(it); return a+w*h; },0); hd.querySelector('h3').innerHTML=`Satchel <small>${used} / ${BAG_W*BAG_H}</small>`;
    const hint=pane.querySelector('.hint'); if(hint) hint.textContent='Drag to move or swap · drag onto a worn slot to wear · click to wear · right-click: off hand · shift-click to drop';
    renderSealPocket(pane); }; })();

/* ---------- the seal pocket ---------- */
let SEAL_IC=null;
function sealIcon(){ if(SEAL_IC) return SEAL_IC; const c=document.createElement('canvas'); c.width=c.height=32; const g=c.getContext('2d'); const px=(x,y,w,h,col)=>{ g.fillStyle=col; g.fillRect(x,y,w,h); };
  /* a small raku tea bowl, broken and mended with gold */
  const rows=[[4,10,24],[4,11,24],[5,13,22],[5,15,22],[6,17,20],[7,19,18],[8,21,16],[10,23,12]];
  rows.forEach(([x,y,w],i)=>{ px(x,y,w,2,['#a07a60','#7a5444','#6a4638','#5e3e32','#523428','#462c22','#3a241c','#30201a'][i]); });
  px(6,10,20,1,'#c09a7a'); px(7,11,18,1,'#1a100c'); px(12,25,8,2,'#2a1a14'); px(11,27,10,1,'#4a3226');
  px(7,14,2,4,'rgba(255,230,200,.18)');
  const gold=['#ffe08a','#ffc24a'];
  [[15,10],[16,12],[14,14],[15,16],[17,18],[16,20],[17,22]].forEach(([x,y],i)=>px(x,y,2,2,gold[i%2]));
  [[8,15],[10,16],[12,17],[13,18]].forEach(([x,y])=>px(x,y,2,1,gold[0])); [[19,13],[21,14],[23,15]].forEach(([x,y])=>px(x,y,2,1,gold[1]));
  px(14,12,1,1,'#fff6d0'); SEAL_IC=c; return c; }
const SEAL_TIP=()=>`<div style="color:#ffd27a;font-size:1.15em">金継 Kintsugi Seal</div><div class="g">Kept in your satchel · you carry ${sealsOf()} of ${SEAL_MAX}</div><div class="w" style="margin-top:.35em;text-align:left">When you die, the Pit breaks one piece of the gear you're wearing. A seal breaks in its place, by itself — nothing to press.</div><div class="g" style="margin-top:.35em">Rare. A boss sometimes leaves one (finish it by hand with 止め for better odds).</div>`;
function renderSealPocket(pane){ if(typeof sealsOf!=='function') return; let pk=pane.querySelector('.sealPocket'); if(!pk){ pk=document.createElement('div'); pk.className='sealPocket'; pane.querySelector('.ggrid').after(pk); }
  const n=sealsOf(); pk.innerHTML=`<span class="spk"><b>金継</b> Kintsugi Seals</span>`;
  for(let i=0;i<SEAL_MAX;i++){ const s=document.createElement('div'); s.className='sps'+(i<n?' on':''); if(i<n){ const c=document.createElement('canvas'); c.width=c.height=32; c.getContext('2d').drawImage(sealIcon(),0,0); s.appendChild(c); } pk.appendChild(s); }
  const t=document.createElement('span'); t.className='spt'; t.textContent=n?'Each one saves a worn item from breaking when you die.':'None. A seal saves a worn item from breaking when you die.'; pk.appendChild(t);
  pk.onpointerenter=()=>showTipHTML(SEAL_TIP(),pk); pk.onpointerleave=hideTip; }

/* ---------- saved beside the items ---------- */
(function(){ const o=saveGame; saveGame=function(){ o(); try{ const db=slotsDB(); const s=db.list.find(x=>x.id===curSlot); if(s&&s.data&&s.data.P){ s.data.P.bp=P.bag.map(it=>[it.bx,it.by]); store.set(SLOTS_KEY,db); } }catch(e){} }; })();
(function(){ const o=restorePlayer; restorePlayer=function(sv){ o(sv); if(sv&&sv.bp) P.bag.forEach((it,i)=>{ const p=sv.bp[i]; if(p&&p[0]!=null){ it.bx=p[0]; it.by=p[1]; } }); bagEnsure(); }; })();

(function(){ const st=document.createElement('style'); st.textContent=`
.ggrid{position:relative;width:calc(var(--cell)*${BAG_W});height:calc(var(--cell)*${BAG_H});background-color:#060404;border:1px solid #2e2422;
  background-image:linear-gradient(#1c1514 1px,transparent 1px),linear-gradient(90deg,#1c1514 1px,transparent 1px);background-size:var(--cell) var(--cell);box-sizing:content-box;touch-action:none;user-select:none}
.gitem{position:absolute;margin:1px;background:#0e0a0a;border:1px solid #3a2c28;display:grid;place-items:center;cursor:grab;overflow:hidden;box-sizing:border-box}
.gitem canvas,.gghost canvas{width:100%;height:100%;object-fit:contain;image-rendering:pixelated;pointer-events:none}
.gitem:hover{border-color:#8a6a50;background:#151010}
.gitem.r1{border-color:#3e3e7a;box-shadow:inset 0 0 calc(var(--u)*1.4) rgba(132,132,255,.22)}
.gitem.r2{border-color:#6a6430;box-shadow:inset 0 0 calc(var(--u)*1.4) rgba(242,228,110,.2)}
.gitem.r3{border-color:#7a4a1a;box-shadow:inset 0 0 calc(var(--u)*1.4) rgba(255,138,30,.28)}
.gitem.r4{border-color:#7a2a5a;box-shadow:inset 0 0 calc(var(--u)*1.6) rgba(255,79,180,.38)}
.gitem.r5{border-color:#7a1a1a;animation:abslot 1s linear infinite}
.gitem.toohigh::after{content:'';position:absolute;inset:0;background:rgba(120,10,10,.28)}
.gitem.lifted{opacity:.25}
.gghost{position:absolute;z-index:60;pointer-events:none;border:2px solid #c9a96a;background:rgba(14,10,10,.55);box-shadow:0 6px 18px #000;display:grid;place-items:center;box-sizing:border-box}
.gghost.ok{border-color:rgba(120,230,140,.9);background:rgba(30,60,36,.55)}.gghost.swap{border-color:rgba(255,210,110,.95);background:rgba(70,54,20,.55)}.gghost.bad{border-color:rgba(255,80,80,.9);background:rgba(70,16,16,.55)}
.ghl{position:absolute;pointer-events:none;z-index:2;box-sizing:border-box}
.ghl.ok{background:rgba(90,200,110,.18);border:1px solid rgba(120,230,140,.7)}
.ghl.swap{background:rgba(230,180,70,.18);border:1px solid rgba(255,210,110,.8)}
.ghl.bad{background:rgba(220,40,40,.2);border:1px solid rgba(255,80,80,.7)}
#equip .slot.dropok{outline:2px solid rgba(120,230,140,.8)}#equip .slot.dropbad{outline:2px solid rgba(255,80,80,.8)}
#sbStash.dropok{outline:2px solid rgba(120,230,140,.8)}
.bagHead{display:flex;align-items:baseline;justify-content:space-between;gap:1em}.bagHead h3{margin:0}.bagHead h3 small{font-family:var(--fs);font-size:.62em;color:#6a5e58;margin-left:.6em;letter-spacing:.05em}
.sortBtn{font-size:max(10px,calc(var(--u)*1.05))!important;padding:calc(var(--u)*.25) calc(var(--u)*1)!important;margin:0 0 calc(var(--u)*.5)!important}
.sealPocket{display:flex;align-items:center;gap:calc(var(--u)*.5);margin-top:calc(var(--u)*.7);padding:calc(var(--u)*.4) calc(var(--u)*.6);border:1px solid #2e2422;background:#0a0707;font-family:var(--fs);font-size:max(10px,calc(var(--u)*1.05));color:#8a7a6a;cursor:help}
.sealPocket .spk b{font-family:'Shippori Mincho',serif;color:#ffd27a;font-weight:500;margin-right:.3em}
.sealPocket .sps{width:calc(var(--u)*3);height:calc(var(--u)*3);border:1px dashed #3a2c28;display:grid;place-items:center}
.sealPocket .sps.on{border:1px solid #b07a20;box-shadow:inset 0 0 calc(var(--u)*1) rgba(255,200,90,.35)}
.sealPocket .sps canvas{width:100%;height:100%;image-rendering:pixelated}
.sealPocket .spt{color:#6a5e58;margin-left:.3em}
#stashScr .ggrid{margin:0}`; document.head.appendChild(st); })();
