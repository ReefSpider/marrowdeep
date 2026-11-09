'use strict';
/* ===== the Rope-House, part two: the Hungry Altar, the Gallows Wheel, and the bell rope =====
   The altar takes an offering, with tribute and gold to sweeten it. The gods may bless it (item level up,
   every stat rolled again), strip it (stats rolled again, any that land Low are torn off), or eat it.
   A plain item is reforged into something better when blessed, and swapped for another plain one when not.
   The Gallows Wheel is a three-reel slot machine for the crowns you have left over.
   The bell rope by the door calls other sellswords for a descent together (co-op). */

/* ---------- styles for the new screens ---------- */
(function(){ const st=document.createElement('style'); st.textContent=`
#altarScr{background:radial-gradient(ellipse at 50% 30%,rgba(60,14,10,.9),rgba(4,2,3,.97) 72%)}
#altarScr .mh{font-size:calc(var(--u)*3.2);margin-bottom:calc(var(--u)*.4)}
#altarScr .sub{font-family:var(--fs);font-size:max(10px,calc(var(--u)*1.2));color:#9a8a7a;letter-spacing:.08em;margin-bottom:calc(var(--u)*1)}
#altarScr .pane{gap:calc(var(--u)*1.6)}
#altarScr .bag{grid-template-columns:repeat(9,calc(var(--u)*3.9));grid-auto-rows:calc(var(--u)*3.9)}
#altarScr .bag.worn{grid-template-columns:repeat(6,calc(var(--u)*4.4))}
.alc{min-width:calc(var(--u)*34);display:flex;flex-direction:column;align-items:center;gap:calc(var(--u)*.7)}
.alc h3{margin:0!important;font-size:calc(var(--u)*2.1)!important}
.alprim{width:calc(var(--u)*8);height:calc(var(--u)*8)}
.altrib{display:grid;grid-template-columns:repeat(4,calc(var(--u)*4.6));gap:calc(var(--u)*.45)}.altrib .slot{height:calc(var(--u)*4.6)}
.slot.sel{outline:2px solid #ff5a3a;outline-offset:-2px}.slot.trib{outline:2px dashed #c9a96a;outline-offset:-2px}
.algold{display:flex;gap:calc(var(--u)*.4);flex-wrap:wrap;justify-content:center}.algold .btn{padding:calc(var(--u)*.35) calc(var(--u)*1.1);font-size:max(10px,calc(var(--u)*1.2))}
.alodds{width:100%;font-family:var(--fs);font-size:max(10px,calc(var(--u)*1.2));text-align:left}
.alodds .ob{display:flex;align-items:center;gap:calc(var(--u)*.6);margin:.25em 0}.alodds .ob b{flex:0 0 calc(var(--u)*10);font-weight:400}
.alodds .ob i{flex:1;height:calc(var(--u)*.9);background:#140c0c;border:1px solid #2a2020;position:relative;overflow:hidden}.alodds .ob i s{position:absolute;inset:0 auto 0 0;background:var(--oc)}
.alodds .ob em{flex:0 0 calc(var(--u)*5);text-align:right;font-style:normal;color:var(--oc)}
.alodds .why{color:#7a6e64;margin-top:.4em;line-height:1.35}
#alCine{position:absolute;inset:0;z-index:36;background:#000}#alCine canvas{position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated}
#alCine .skip{position:absolute;right:calc(var(--u)*1.4);bottom:calc(var(--u)*1.2);font-family:var(--fs);font-size:max(10px,calc(var(--u)*1.1));color:#6a5e56;letter-spacing:.1em}
#alRes{position:absolute;inset:0;z-index:37;display:flex;flex-direction:column;align-items:center;justify-content:safe center;background:radial-gradient(ellipse at 50% 40%,rgba(30,10,8,.92),rgba(3,2,2,.98) 70%);pointer-events:auto;padding:calc(var(--u)*2);overflow-y:auto}
#alRes .vk{font-family:'Shippori Mincho',var(--fb);font-weight:800;font-size:calc(var(--u)*6.5);line-height:1;color:var(--vc);text-shadow:0 0 calc(var(--u)*2) var(--vc)}
#alRes .vt{font-family:var(--fd);font-size:calc(var(--u)*3);color:var(--bone);margin:calc(var(--u)*.4) 0}
#alRes .vs{font-family:var(--fs);color:#9a8a7a;font-size:max(10px,calc(var(--u)*1.3));margin-bottom:calc(var(--u)*1);max-width:calc(var(--u)*60);text-align:center}
#alRes .tt{background:rgba(6,4,5,.95);border:1px solid #2a2220;padding:calc(var(--u)*.8) calc(var(--u)*1.4);font-family:var(--fs);font-size:max(11px,calc(var(--u)*1.35));line-height:1.35;min-width:calc(var(--u)*30);text-align:center}
#slotScr{background:radial-gradient(ellipse at 50% 35%,rgba(40,24,10,.92),rgba(4,2,3,.97) 72%)}
.slm{display:flex;align-items:center;gap:calc(var(--u)*1.6);margin:calc(var(--u)*.8) 0}
.slcab{position:relative;padding:calc(var(--u)*1.4) calc(var(--u)*1.6);background:linear-gradient(#3a2414,#22140a);border:2px solid #5a3a20;box-shadow:inset 0 0 0 2px #120a04,0 0 calc(var(--u)*3) rgba(0,0,0,.8)}
.slcab::before{content:"絞";position:absolute;top:calc(var(--u)*-3.2);left:50%;transform:translateX(-50%);font-family:'Shippori Mincho',var(--fb);font-weight:800;font-size:calc(var(--u)*3.4);color:#c9a96a;text-shadow:0 0 calc(var(--u)*1) rgba(255,120,40,.6)}
.slreels{display:flex;gap:calc(var(--u)*.8)}
.slreel{width:calc(var(--u)*9);height:calc(var(--u)*27);background:#0a0705;border:2px solid #1a0f08;box-shadow:inset 0 calc(var(--u)*3) calc(var(--u)*2) rgba(0,0,0,.85),inset 0 calc(var(--u)*-3) calc(var(--u)*2) rgba(0,0,0,.85);overflow:hidden}
.slreel canvas{width:100%;height:100%;image-rendering:pixelated;display:block}
.slline{position:absolute;left:calc(var(--u)*1);right:calc(var(--u)*1);top:50%;height:2px;background:rgba(255,60,40,.55);box-shadow:0 0 calc(var(--u)*.8) rgba(255,60,40,.8);pointer-events:none}
.slcab.win .slline{background:#ffe08a;box-shadow:0 0 calc(var(--u)*1.6) #ffb040}
.sllever{display:flex;flex-direction:column;align-items:center;gap:calc(var(--u)*.4)}
.sllever button{width:calc(var(--u)*6);height:calc(var(--u)*16);background:linear-gradient(90deg,#2a1a10,#4a3020,#2a1a10);border:2px solid #120a04;cursor:pointer;position:relative;transition:transform .25s}
.sllever button::before{content:"";position:absolute;top:calc(var(--u)*-2.6);left:50%;transform:translateX(-50%);width:calc(var(--u)*4.2);height:calc(var(--u)*4.2);border-radius:50%;background:radial-gradient(circle at 35% 30%,#e8dcc0,#8a7a62 60%,#3a2c20);box-shadow:0 0 calc(var(--u)*.8) #000}
.sllever button.pull{transform:translateY(calc(var(--u)*5)) scaleY(.6)}
.sllever small{font-family:var(--fs);color:#8a7a6a;font-size:max(9px,calc(var(--u)*1));letter-spacing:.1em}
.slbets{display:flex;gap:calc(var(--u)*.5);justify-content:center;flex-wrap:wrap;margin:calc(var(--u)*.6) 0}
.slbets .btn{padding:calc(var(--u)*.35) calc(var(--u)*1.4)}.slbets .btn.on{border-color:#e8c25a;color:#ffe9a0;box-shadow:0 0 calc(var(--u)*1) rgba(232,194,90,.4)}
.slmsg{font-family:var(--fd);font-size:calc(var(--u)*2.4);min-height:1.3em;color:var(--bone)}.slmsg.big{color:#ffe08a;text-shadow:0 0 calc(var(--u)*1.4) #ff9a30}
.slgold{font-family:var(--fs);color:#e8c25a;letter-spacing:.08em}
.slpay{display:grid;grid-template-columns:repeat(4,auto);gap:calc(var(--u)*.25) calc(var(--u)*1.2);font-family:var(--fs);font-size:max(9px,calc(var(--u)*1.05));color:#8a7a6a;margin-top:calc(var(--u)*.8);align-items:center}
.slpay canvas{width:calc(var(--u)*2.4);height:calc(var(--u)*2.4);image-rendering:pixelated;vertical-align:middle}.slpay b{color:#e8c25a;font-weight:400}
`; document.head.appendChild(st); })();

/* ---------- the furniture, drawn into the Rope-House ---------- */
function drawAltarRoom(){ if(!L||L.def.kind!=='cabin') return; const F=16*T, R_=(x,y,w,h,c)=>{ ctx.fillStyle=c; ctx.fillRect(Math.round(x-camR.x),Math.round(y-camR.y),w,h); };
  const E_=(x,y,w,h,c)=>{ ectx.fillStyle=c; ectx.fillRect(Math.round(x-camR.x),Math.round(y-camR.y),w,h); };
  if(typeof cabOpen!=='function'||cabOpen('altar')){
  // the Hungry God, carved into the back wall above the altar
  const ax=CAB.altar*T+8; const near=P&&Math.abs(P.x-ax)<70; const wake=near?1:0; ALT_ROOM.wake=lerp(ALT_ROOM.wake,wake,.04);
  R_(ax-58,F-176,116,150,'#1c120d'); R_(ax-58,F-176,116,2,'#3a281c');
  for(let i=0;i<6;i++) R_(ax-58+i*20,F-176,1,150,'#140c08');
  R_(ax-40,F-168,80,92,'#6e6658'); R_(ax-44,F-150,88,56,'#6e6658'); R_(ax-36,F-172,72,6,'#5e574a');
  R_(ax-40,F-168,80,2,'#8a8270'); R_(ax-44,F-150,3,56,'#4a453c'); R_(ax+41,F-150,3,56,'#4a453c');
  for(const [cx,cy,l] of [[-30,-160,14],[22,-158,18],[-12,-120,10],[30,-110,12],[-34,-100,9]]) for(let k=0;k<l;k++) R_(ax+cx+(k%3===0?k/3:0),F+cy+k,1,1,'#3a352e');
  // eyes: seven of them, closed until someone stands at the altar
  const eyes=[[-20,-140,7],[20,-140,7],[0,-154,4],[-32,-124,3],[32,-124,3],[-10,-160,3],[10,-160,3]];
  for(const [ex,ey,r] of eyes){ R_(ax+ex-r,F+ey,r*2,1,'#2a2620'); const op=ALT_ROOM.wake*(r>5?1:.7); if(op>.05){ const h=Math.max(1,Math.round(r*.9*op)); R_(ax+ex-r+1,F+ey-h/2,r*2-2,h,'#d8ccb0'); E_(ax+ex-1,F+ey-1,2,2,`rgba(255,40,30,${(.5+.5*op).toFixed(2)})`); } }
  // the mouth: a long dark slit with a red ember in it
  R_(ax-22,F-100,44,6,'#0c0806'); const mg=.35+.25*Math.sin(time*1.7); E_(ax-16,F-98,32,2,`rgba(200,30,20,${mg.toFixed(2)})`); for(let i=0;i<9;i++) R_(ax-20+i*5,F-101,2,2,'#cfc2a2');
  R_(ax-6,F-196,12,14,'#2a1a10'); ctx.fillStyle='#8a1a14'; ctx.font='12px "Shippori Mincho",serif'; ctx.textAlign='center'; ctx.fillText('供',Math.round(ax-camR.x),Math.round(F-185-camR.y)); ctx.textAlign='left';
  // the altar slab, blood channels, candles, bones
  R_(ax-30,F-22,60,22,'#4a4238'); R_(ax-34,F-26,68,5,'#5e564a'); R_(ax-34,F-26,68,1,'#7a7262'); R_(ax-28,F-18,56,1,'#2a1210'); R_(ax-2,F-21,4,21,'#3a0e0c');
  R_(ax-8,F-30,16,4,'#2a201a'); R_(ax-6,F-31,12,1,'#5a1010');
  for(let i=0;i<7;i++){ const cx=ax-27+i*9, h=4+((i*7)%5); R_(cx,F-26-h,2,h,'#e0d4b8'); const fl=Math.sin(time*11+i*1.9);
    E_(cx,F-29-h+fl*.5,2,3,`rgba(255,${190+Math.round(fl*30)},110,.95)`); if(i%2===0) addLight(cx+1,F-30-h,34,.45,1,.6,.3); }
  for(const [bx,by] of [[-40,-3],[-44,-2],[36,-3],[42,-2],[-38,-6]]){ R_(ax+bx,F+by,5,2,'#d8ccb0'); R_(ax+bx-1,F+by-1,2,2,'#d8ccb0'); }
  addLight(ax,F-100,90,.35+ALT_ROOM.wake*.4,1,.25,.15);
  }
  if(typeof cabOpen!=='function'||cabOpen('slots')){
  // the Gallows Wheel: a slot machine built out of a gibbet
  const sx=CAB.slots*T+8; R_(sx-16,F-50,32,50,'#3a2414'); R_(sx-16,F-50,32,2,'#6a4a2a'); R_(sx-18,F-54,36,4,'#2a1a0e'); R_(sx-2,F-74,4,20,'#2a1a0e'); R_(sx-2,F-74,18,3,'#2a1a0e'); R_(sx+14,F-74,1,10,'#8a7a62');
  R_(sx+12,F-64,5,5,'#d8ccb0'); R_(sx+13,F-62,1,1,'#120a06'); R_(sx+15,F-62,1,1,'#120a06');
  for(let i=0;i<3;i++){ R_(sx-13+i*9,F-42,8,14,'#0c0806'); const k=SLOT_SYMS[(Math.floor(time*.4)+i*2)%SLOT_SYMS.length]; drawSymAt(ctx,k,Math.round(sx-13+i*9-camR.x)+1,Math.round(F-41-camR.y)+3,.375); }
  R_(sx-14,F-36,28,1,'#8a1a14'); R_(sx+16,F-44,2,16,'#4a3020'); R_(sx+15,F-48,4,4,'#cfc2a2');
  R_(sx-10,F-20,20,3,'#120a06'); E_(sx-6,F-19,12,1,`rgba(255,200,90,${(.4+.3*Math.sin(time*3)).toFixed(2)})`);
  for(let i=0;i<4;i++) E_(sx-12+i*8,F-52,2,1,Math.floor(time*4+i)%4===0?'rgba(255,210,120,.95)':'rgba(255,120,40,.35)');
  addLight(sx,F-36,46,.4,1,.75,.35);
  }
  // the bell rope by the door: ring it to call others down with you
  const bx=CAB.bell*T+8; R_(bx,F-230,1,190,'#6a5a40'); for(let y=F-230;y<F-40;y+=6) R_(bx,y,1,2,'#4a3e2c'); const sw=Math.sin(time*1.3)*1.5;
  R_(bx-6+sw,F-44,13,10,'#8a6a2a'); R_(bx-7+sw,F-35,15,2,'#6a4e1e'); R_(bx-1+sw,F-33,2,3,'#3a2a10'); R_(bx-6+sw,F-44,13,1,'#c9a96a');
  if(typeof NET!=='undefined'&&NET.conn&&!NET.running){ E_(bx-8,F-48,17,1,'rgba(120,200,255,.6)'); addLight(bx,F-40,40,.4,.5,.8,1); } }
const ALT_ROOM={wake:0};
(function(){ const o=drawPlats; drawPlats=function(){ drawAltarRoom(); o(); }; })();
(function(){ const o=findInteract; findInteract=function(){ const b=o(); if(!L||L.def.kind!=='cabin'||!P) return b; let best=b, bd=b&&typeof b.o==='number'?Math.abs(b.o*T+8-P.x):b?6:1e9;
  const near=(tx,txt,act)=>{ const d=Math.abs(tx*T+8-P.x); if(d<22&&d<bd){ bd=d; best={o:tx,txt,act}; } };
  near(CAB.altar,'<kbd>E</kbd> The Hungry Altar · offer an item to the gods',openAltar);
  near(CAB.slots,`<kbd>E</kbd> The Gallows Wheel · gamble your crowns (${P.gold})`,openSlots);
  near(CAB.bell,'<kbd>E</kbd> Ring the bell · descend together',()=>{ if(typeof openCoop==='function') openCoop(); });
  return best; }; })();

/* ---------- the Hungry Altar ---------- */
const ALTAR={prim:null,trib:[],gold:0,busy:false};
const altarScr=document.createElement('div'); altarScr.className='screen'; altarScr.id='altarScr'; altarScr.hidden=true; stage.appendChild(altarScr);
function ownedList(){ const out=[]; for(const k of ['weapon','off','helm','armor','gloves','boots','amulet','ring','ring2']) if(P.equip[k]) out.push({it:P.equip[k],where:'equip',k}); P.bag.forEach((it,i)=>out.push({it,where:'bag',i})); return out; }
function locOf(it){ for(const k in P.equip) if(P.equip[k]===it) return {where:'equip',k}; const i=P.bag.indexOf(it); return i>=0?{where:'bag',i}:null; }
function takeOut(it){ const l=locOf(it); if(!l) return; if(l.where==='equip') P.equip[l.k]=null; else P.bag.splice(l.i,1); }
function putIn(old,nit){ const l=locOf(old); if(!l){ if(!bagAdd(nit)) dropItem(nit,P.x,P.y-10,true); return; } if(l.where==='equip') P.equip[l.k]=nit; else { nit.bx=old.bx; nit.by=old.by; P.bag[l.i]=nit; bagEnsure(); } }
function altarOdds(){ const it=ALTAR.prim; if(!it) return null; const r=it.rarity;
  const base=32+[0,0,-3,-6,-8,-12][r]; let tr=0; for(const t of ALTAR.trib) tr+=[4,6,9,14,18,30][t.rarity]; tr=Math.min(45,tr);
  const K=120*(1+(it.ilvl||1)/6); const gb=ALTAR.gold>0?32*ALTAR.gold/(ALTAR.gold+K):0;
  const pB=clamp(base+tr+gb,8,88); const pD=(100-pB)*[.5,.45,.4,.36,.32,.28][r]; const pS=100-pB-pD; return {pB,pS,pD,tr,gb,base}; }
function openAltar(){ ALTAR.prim=null; ALTAR.trib=[]; ALTAR.gold=0; mode='altar'; hud.hidden=true; altarScr.hidden=false; AU.tone('sine',73,70,1.4,.12,.8); renderAltar(); }
function closeAltar(){ altarScr.hidden=true; hideTip(); const r=$('#alRes'); if(r) r.remove(); mode='play'; hud.hidden=false; calcStats(); saveGame(); }
function renderAltar(){ const o=altarOdds(), it=ALTAR.prim, plain=it&&it.rarity===0;
  altarScr.innerHTML=`<h2 class="mh">The Hungry Altar <span style="font-family:'Shippori Mincho',serif;color:#9a3a2c">供物台</span></h2><div class="sub">Seven eyes in the stone. They open when you kneel.</div>
  <div class="pane"><div class="panel"><h3>Satchel</h3><div class="bag" id="alBag"></div><h3 style="margin-top:.6em">Worn</h3><div class="bag worn" id="alWorn"></div>
    <div class="hint">Click once to lay the offering. Click more to add tribute (up to four). Click again to take it back.</div></div>
  <div class="panel alc"><h3>The offering</h3><div class="slot alprim${it?' r'+it.rarity:''}" id="alPrim"></div>
    <h3>Tribute <small style="font-size:.5em;color:#7a6e64">burned, whatever happens</small></h3><div class="altrib" id="alTrib"></div>
    <h3>Gold <small style="font-size:.5em;color:#7a6e64">${ALTAR.gold} of ${P.gold} crowns</small></h3>
    <div class="algold">${[50,250,1000].map(g=>`<button class="btn ghost" data-g="${g}"${P.gold-ALTAR.gold<g?' disabled':''}>+${g}</button>`).join('')}<button class="btn ghost" data-g="all"${P.gold<=ALTAR.gold?' disabled':''}>All</button><button class="btn ghost" data-g="0"${ALTAR.gold?'':' disabled'}>Clear</button></div>
    <div class="alodds">${o?`<div class="ob" style="--oc:#ffd27a"><b>祝 Blessed</b><i><s style="width:${o.pB.toFixed(1)}%"></s></i><em>${o.pB.toFixed(1)}%</em></div>
      <div class="ob" style="--oc:#b9b0a0"><b>${plain?'替 Replaced':'剥 Stripped'}</b><i><s style="width:${o.pS.toFixed(1)}%"></s></i><em>${o.pS.toFixed(1)}%</em></div>
      <div class="ob" style="--oc:#ff4a3d"><b>喰 Devoured</b><i><s style="width:${o.pD.toFixed(1)}%"></s></i><em>${o.pD.toFixed(1)}%</em></div>
      <div class="why">${plain?'Blessed: reforged into a Magic or better item, 3–8 item levels higher. Replaced: the gods hand back a different plain item.':'Blessed: 3–8 item levels higher and every stat rolled again, sometimes with a new one. Stripped: every stat rolled again, and any that land Low are torn off. Devoured: gone.'}
      <br>Odds: base ${o.base.toFixed(0)}% · tribute +${o.tr.toFixed(0)}% · gold +${o.gb.toFixed(1)}%</div>`:'<div class="why">Lay something on the altar first.</div>'}</div>
    <div class="row"><button class="btn" id="alGo"${it?'':' disabled'}>Offer <kbd>E</kbd></button><button class="btn ghost" id="alClose">Back <kbd>Esc</kbd></button></div></div></div>`;
  const mk=(e)=>{ const d=slotEl(e.it,()=>altarPick(e.it)); if(e.it===ALTAR.prim) d.classList.add('sel'); if(ALTAR.trib.includes(e.it)) d.classList.add('trib'); return d; };
  const all=ownedList(); const bag=$('#alBag'), worn=$('#alWorn');
  for(let i=0;i<Math.max(27,Math.ceil(P.bag.length/9)*9);i++){ const e=all.find(x=>x.where==='bag'&&x.i===i); bag.appendChild(e?mk(e):slotEl(null)); }
  for(const e of all.filter(x=>x.where==='equip')) worn.appendChild(mk(e)); for(let i=all.filter(x=>x.where==='equip').length;i<6;i++) worn.appendChild(slotEl(null));
  const pr=$('#alPrim'); if(it){ pr.appendChild(iconEl(it)); bindTip(pr,it); pr.onclick=()=>altarPick(it); }
  const tb=$('#alTrib'); for(let i=0;i<4;i++){ const t=ALTAR.trib[i]; tb.appendChild(slotEl(t||null,t?()=>altarPick(t):null)); }
  altarScr.querySelectorAll('.algold .btn').forEach(b=>b.onclick=()=>{ const g=b.dataset.g; ALTAR.gold=g==='all'?P.gold:g==='0'?0:Math.min(P.gold,ALTAR.gold+(+g)); AU.coin(); renderAltar(); });
  $('#alGo').onclick=altarGo; $('#alClose').onclick=closeAltar; }
function altarPick(it){ hideTip(); if(ALTAR.prim===it){ ALTAR.prim=null; }
  else if(ALTAR.trib.includes(it)){ ALTAR.trib=ALTAR.trib.filter(x=>x!==it); }
  else if(!ALTAR.prim){ ALTAR.prim=it; AU.tone('sine',110,90,.5,.15,.6); }
  else if(ALTAR.trib.length<4){ ALTAR.trib.push(it); AU.tone('triangle',300,200,.12,.1,.4); }
  else invMsgAlt('The altar holds four tributes at most.');
  renderAltar(); }
function invMsgAlt(t){ toast(t); }
function altarGo(){ const it=ALTAR.prim; if(!it||ALTAR.busy) return; const o=altarOdds(); ALTAR.busy=true;
  const roll=Math.random()*100; const out=roll<o.pB?'bless':roll<o.pB+o.pS?(it.rarity===0?'replace':'strip'):'devour';
  const trib=ALTAR.trib.slice(), gold=ALTAR.gold; for(const t of trib) takeOut(t); P.gold-=gold;
  const was={name:it.name,rarity:it.rarity,ilvl:it.ilvl};
  let res=it; if(out==='bless') res=blessItem(it); else if(out==='strip') stripItem(it); else if(out==='replace') res=genItem(it.ilvl||1,[1,0,0,0,0,0],0,it.slot);
  if(out==='devour') takeOut(it); else if(res!==it) putIn(it,res);
  calcStats(); saveGame(); hideTip();
  altarCine(it,trib,gold,out,res,()=>{ ALTAR.busy=false; altarResult(out,res,was); }); }
/* a fresh roll of a stat in the same category, at the tier this item level reaches */
function rerollAffs(it,ilvl){ const fixed=it.rarity>=4||it.set; const sl=affSlot(it); const li=it.rarity===3?ilvl+6:ilvl;
  it.aff=it.aff.map(a=>{ if(!varies(a)&&a.lo==null) return a; if(fixed||a.k==='ed'&&it.rarity>=4){ const rs=rollStat(a.lo,a.hi); return Object.assign({},a,{v:rs.v,g:rs.g}); }
    const n=affOf(a.k,sl,li,a.pre); return n||Object.assign({},a,rollStat(a.lo,a.hi)); }); }
function renameMagic(it){ if(it.rarity!==1) return; const p=it.aff.find(a=>a.pre&&a.nm), s=it.aff.find(a=>!a.pre&&a.nm); it.name=[p&&p.nm,it.base.name,s&&s.nm].filter(Boolean).join(' '); }
function blessItem(it){ const nl=Math.min(110,(it.ilvl||1)+ri(3,8));
  if(it.rarity===0){ let r=rollRarity([0,62,30,6,1.8,.05],0); if(r===0) r=1; return genItem(nl,[0,1,2,3,4,5].map(i=>i===r?1:0),0,it.slot); }
  it.ilvl=nl; rerollAffs(it,nl);
  if((it.rarity===2||it.rarity===3)&&it.aff.length<6&&R()<.35){ const used=new Set(it.aff.map(a=>a.k).concat(ELEM_KEYS)); const a=rollAff(R()<.5?PRE:SUF,affSlot(it),it.rarity===3?nl+6:nl,used); if(a) it.aff.push(a); }
  it.dq=Math.min(115,(it.dq||100)+ri(0,4)); renameMagic(it); return fin(it); }
function stripItem(it){ rerollAffs(it,it.ilvl||1); it.aff=it.aff.filter(a=>!varies(a)||a.g>0); renameMagic(it); return fin(it); }
const VERDICT={bless:{k:'祝',t:'Blessed',c:'#ffd27a',s:'The gods drink the smoke and give it back better.'},strip:{k:'剥',t:'Stripped',c:'#b9b0a0',s:'They took what was weak. What is left was rolled again.'},
  devour:{k:'喰',t:'Devoured',c:'#ff4a3d',s:'The mouth closed. The candles went out one by one. It is gone.'},replace:{k:'替',t:'Replaced',c:'#c9b98a',s:'They did not want it. They gave you something else plain in its place.'}};
function altarResult(out,res,was){ const v=VERDICT[out]; const box=document.createElement('div'); box.id='alRes'; box.style.setProperty('--vc',v.c);
  box.innerHTML=`<div class="vk">${v.k}</div><div class="vt">${v.t}</div><div class="vs">${v.s}${out==='bless'&&was.rarity>0?` Item level ${was.ilvl} → ${res.ilvl}.`:''}</div>${out==='devour'?'':'<div class="tt" id="alTT"></div>'}<div class="row" id="alResBtns" style="margin-top:1em"${out==='devour'?'':' hidden'}><button class="btn" id="alAgain">Kneel again</button><button class="btn ghost" id="alLeave">Leave</button></div>`;
  altarScr.appendChild(box);
  const fin_=()=>{ $('#alResBtns').hidden=false; $('#alAgain').focus({preventScroll:true}); };
  if(out!=='devour'){ const tt=$('#alTT'); if(res.aff.some(varies)) statReel(res,tt,()=>{ const q=tt.querySelector('#rq'); if(q) q.hidden=false; if(typeof compareHTML==='function'){ const h=compareHTML(res); if(h) tt.insertAdjacentHTML('beforeend',h); } fin_(); }); else { tt.innerHTML=tipHTML(res); fin_(); } }
  $('#alAgain').onclick=()=>{ if(reveal) reveal.finish(); box.remove(); ALTAR.prim=out==='devour'?null:res; ALTAR.trib=[]; ALTAR.gold=0; renderAltar(); };
  $('#alLeave').onclick=()=>{ if(reveal) reveal.finish(); closeAltar(); }; }

/* ---------- the offering, as a cutscene ---------- */
function altarCine(it,trib,gold,out,res,done){ const el=document.createElement('div'); el.id='alCine'; el.innerHTML='<canvas width="320" height="180"></canvas><div class="skip">E · skip</div>'; altarScr.appendChild(el);
  const g=el.querySelector('canvas').getContext('2d'); g.imageSmoothingEnabled=false; const D=RM?2.6:7.2, VA=RM?1.2:4.9;
  const ic=getIcon(it), ricon=out==='devour'?null:getIcon(res), tic=trib.map(getIcon); const rc=hex(RCOL[it.rarity]);
  const ps=[], ash=[]; const cues=new Set(); let t0=performance.now(), skipTo=0, raf=0, live=true;
  const cue=(n,at,f)=>{ if(!cues.has(n)&&tt>=at){ cues.add(n); f(); } };
  let tt=0;
  const EYES=[[-34,30,9],[34,30,9],[0,14,6],[-56,52,5],[56,52,5],[-18,4,4],[18,4,4]];
  const face=(cx,cy,k,open,mouth)=>{ g.save(); g.translate(cx,cy); g.fillStyle='#0a0606'; g.beginPath(); g.ellipse(0,40,104,86,0,0,Math.PI*2); g.fill();
    const mg=g.createRadialGradient(0,30,10,0,40,100); mg.addColorStop(0,'#cfc4ae'); mg.addColorStop(.7,'#8a8270'); mg.addColorStop(1,'#3a352e'); g.fillStyle=mg; g.beginPath(); g.ellipse(0,40,96,80,0,0,Math.PI*2); g.fill();
    g.strokeStyle='rgba(40,30,24,.8)'; g.lineWidth=1; for(const [a,b,c2,d2] of [[-60,-10,-40,30],[50,0,30,44],[-20,70,-6,100],[64,60,40,80],[-70,40,-52,76]]){ g.beginPath(); g.moveTo(a,b); g.lineTo((a+c2)/2+4,(b+d2)/2); g.lineTo(c2,d2); g.stroke(); }
    EYES.forEach(([ex,ey,r],i)=>{ const o=clamp(open*7-i,0,1); g.fillStyle='#1a1410'; g.fillRect(ex-r-1,ey-1,r*2+2,2); if(o>0){ const h=Math.max(1,r*.95*o); g.fillStyle='#e8dcc4'; g.beginPath(); g.ellipse(ex,ey,r,h,0,0,Math.PI*2); g.fill();
      g.fillStyle='#b01a12'; g.beginPath(); g.arc(ex+Math.sin(tt*1.3+i)*r*.2,ey,Math.min(h,r*.55),0,Math.PI*2); g.fill(); g.fillStyle='#050202'; g.fillRect(ex-1+Math.sin(tt*1.3+i)*r*.2,ey-Math.min(h,r*.5),2,Math.min(h,r*.5)*2);
      if(o>=1&&open>1.1){ const dl=clamp((tt-4)*.6,0,1)*30; g.fillStyle='rgba(140,10,8,.9)'; g.fillRect(ex-1,ey+h,1.5,dl*(.6+((i*7)%5)/8)); } } });
    const mw=30+mouth*30, mh=3+mouth*26; g.fillStyle='#050202'; g.beginPath(); g.ellipse(0,92,mw,mh,0,0,Math.PI*2); g.fill(); if(mouth>.05){ g.fillStyle=`rgba(200,30,20,${(.35*mouth).toFixed(2)})`; g.beginPath(); g.ellipse(0,96,mw*.7,mh*.5,0,0,Math.PI*2); g.fill(); }
    g.fillStyle='#e0d4b8'; for(let i=-4;i<=4;i++){ g.fillRect(i*7-2,92-mh,3,4); g.fillRect(i*7-2,92+mh-4,3,4); } g.restore(); };
  const step=now=>{ if(!live) return; tt=(now-t0)/1000+skipTo; const k=tt/D;
    g.setTransform(1,0,0,1,0,0); g.fillStyle='#030202'; g.fillRect(0,0,320,180);
    const sh=out==='devour'&&tt>VA+.6&&tt<VA+1.2?(Math.random()-.5)*4:0; g.translate(sh,0);
    // the god descends
    const fy=-160+clamp((tt-(RM?.4:2.1))/1.6,0,1)*150; const open=clamp((tt-(RM?.7:2.8))/1.1,0,1.3); const mouth=out==='devour'?clamp((tt-VA)/.6,0,1)*(tt>VA+1.4?clamp(1-(tt-VA-1.4)/.4,0,1):1):out==='bless'?0:clamp((tt-VA)/.5,0,.25);
    g.globalAlpha=clamp((tt-(RM?.3:1.9))/1,0,1); face(160,fy,k,open,mouth); g.globalAlpha=1;
    // the kanji of offering, faint, behind everything
    if(tt>2.2&&tt<VA){ g.fillStyle=`rgba(140,20,14,${(.18*Math.sin(Math.PI*clamp((tt-2.2)/(VA-2.2),0,1))).toFixed(2)})`; g.font='bold 110px "Shippori Mincho",serif'; g.textAlign='center'; g.fillText('供',160,140); }
    // floor and altar slab
    g.fillStyle='#0c0807'; g.fillRect(0,150,320,30); g.fillStyle='#4a4238'; g.fillRect(118,132,84,20); g.fillStyle='#6a6254'; g.fillRect(112,128,96,5); g.fillStyle='#2a1210'; g.fillRect(158,133,4,19);
    // candles light one by one
    for(let i=0;i<9;i++){ const cx=116+i*11, h=6+((i*5)%4)*2; g.fillStyle='#e0d4b8'; g.fillRect(cx,128-h,3,h); const lit=tt>(RM?.1:.25)+i*(RM?.03:.11); if(lit){ const f=Math.sin(tt*14+i*2); const gl=g.createRadialGradient(cx+1.5,124-h,0,cx+1.5,124-h,16); gl.addColorStop(0,'rgba(255,190,100,.35)'); gl.addColorStop(1,'rgba(255,120,40,0)'); g.fillStyle=gl; g.fillRect(cx-15,108-h,32,32);
      const out_=out==='devour'&&tt>VA+1.4+i*.08; if(!out_){ g.fillStyle=`rgba(255,${200+Math.round(f*30)},120,1)`; g.fillRect(cx+.5,123-h+f*.6,2,4); } } }
    // gold pours, tribute circles and burns
    if(gold>0&&tt>1.1&&tt<2.6&&Math.random()<.6) ps.push({x:160+rnd(-20,20),y:-4,vx:rnd(-10,10),vy:rnd(60,120),c:'#e8c25a',l:1.4});
    tic.forEach((c,i)=>{ const a=tt*2.2+i*Math.PI*2/tic.length, rr=60*(1-clamp((tt-1.6)/1.2,0,1)); if(tt<2.8){ const x=160+Math.cos(a)*rr, y=112+Math.sin(a)*rr*.35; g.globalAlpha=clamp(1-(tt-2.2)/.6,0,1); g.drawImage(c,Math.round(x-8),Math.round(y-8),16,16); g.globalAlpha=1; if(tt>2&&Math.random()<.5) ash.push({x,y,vx:rnd(-8,8),vy:rnd(-30,-10),l:1}); } });
    // the offering itself
    let ix=160, iy=clamp(30+((tt-(RM?.2:.9))/1.2)*86,30,116), ia=1, isz=24;
    if(tt>VA){ const q=tt-VA; if(out==='bless'){ iy=116-clamp(q/1.2,0,1)*44; isz=24+clamp(q,0,1)*8; } else if(out==='devour'){ iy=116-clamp((q-.5)/.8,0,1)*44; isz=24*(1-clamp((q-.9)/.5,0,1)); ia=1-clamp((q-1)/.4,0,1); } else if(out==='strip'||out==='replace'){ ix+=Math.sin(q*60)*clamp(1-q/1.2,0,1)*2; } }
    const showIcon=(out==='bless'||out==='replace')&&tt>VA+.7&&ricon?ricon:ic;
    if(tt>(RM?.15:.8)&&isz>1){ const gl=g.createRadialGradient(ix,iy,0,ix,iy,30); gl.addColorStop(0,`rgba(${rc[0]},${rc[1]},${rc[2]},.35)`); gl.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=gl; g.fillRect(ix-30,iy-30,60,60);
      g.globalAlpha=ia; g.drawImage(showIcon,Math.round(ix-isz/2),Math.round(iy-isz/2),Math.round(isz),Math.round(isz)); g.globalAlpha=1; }
    // the verdict
    if(tt>VA){ const q=tt-VA, v=VERDICT[out];
      if(out==='bless'){ const a=clamp(q/.5,0,1)*clamp(1-(q-2)/.6,0,1); const bg=g.createLinearGradient(0,0,0,150); bg.addColorStop(0,`rgba(255,220,140,${(.05*a).toFixed(2)})`); bg.addColorStop(1,`rgba(255,200,110,${(.35*a).toFixed(2)})`); g.fillStyle=bg; g.fillRect(140,0,40,150); g.strokeStyle=`rgba(255,220,150,${(.6*a).toFixed(2)})`; g.beginPath(); g.ellipse(ix,iy,22+Math.sin(tt*4)*2,6,0,0,Math.PI*2); g.stroke(); if(Math.random()<.5) ps.push({x:ix+rnd(-14,14),y:iy+rnd(-10,10),vx:rnd(-6,6),vy:rnd(-30,-10),c:'#ffe0a0',l:.8}); }
      if(out==='strip'||out==='replace'){ if(Math.random()<.8) ash.push({x:rnd(0,40),y:rnd(60,150),vx:rnd(120,220),vy:rnd(-10,10),l:1.2}); if(q>.3&&q<1.1&&Math.random()<.3){ ps.push({x:ix,y:iy,vx:rnd(-80,80),vy:rnd(-90,-30),c:'#8a8078',l:.9,gr:1}); } }
      if(out==='devour'&&q>1.3&&q<1.5) for(let i=0;i<20;i++) ash.push({x:160+rnd(-30,30),y:100+rnd(-10,10),vx:rnd(-40,40),vy:rnd(-40,10),l:1});
      const ka=clamp((q-.7)/.4,0,1); g.globalAlpha=ka*(out==='devour'?.85:.95); g.fillStyle=v.c; g.font='bold 52px "Shippori Mincho",serif'; g.textAlign='center'; g.fillText(v.k,out==='bless'?250:70,104); g.globalAlpha=1; }
    // particles
    for(const p of ps){ p.l-=1/60; p.x+=p.vx/60; p.y+=p.vy/60; if(p.gr) p.vy+=200/60; if(p.l>0){ g.fillStyle=p.c; g.fillRect(p.x|0,p.y|0,1,1); } }
    for(const p of ash){ p.l-=1/60; p.x+=p.vx/60; p.y+=p.vy/60; if(p.l>0){ g.fillStyle=`rgba(120,110,104,${(p.l*.7).toFixed(2)})`; g.fillRect(p.x|0,p.y|0,1,1); } }
    for(const arr of [ps,ash]) for(let i=arr.length-1;i>=0;i--) if(arr[i].l<=0) arr.splice(i,1);
    // red dark at the edges, never a flash
    const vg=g.createRadialGradient(160,90,60,160,90,200); vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,out==='devour'&&tt>VA?'rgba(60,0,0,.75)':'rgba(0,0,0,.7)'); g.fillStyle=vg; g.fillRect(0,0,320,180);
    // sound cues
    cue('drone',0,()=>{ AU.tease(); }); cue('coin',1.2,()=>{ if(gold>0) for(let i=0;i<6;i++) setTimeout(()=>AU.coin(),i*90); if(trib.length) AU.chain(); });
    cue('god',RM?.3:2.1,()=>{ AU.roar(); if(typeof SMP!=='undefined'&&SMP.has&&SMP.has('bell_drone')) AU.bell(); else AU.bell(); });
    cue('eyes',RM?.7:2.9,()=>{ for(let i=0;i<7;i++) AU.tone('sine',220-i*14,180-i*12,.5,.05,.7,i*.15); });
    cue('hush',VA-.4,()=>{ AU.tone('sine',41,38,1.2,.4,.8); });
    cue('verdict',VA,()=>{ if(out==='bless'){ AU.perfect(); AU.reveal(Math.min(5,(res&&res.rarity)||1)); AU.bell(); } else if(out==='devour'){ AU.roar(); setTimeout(()=>{ AU.slam(); AU.boom(1); shake(6); },700); } else { AU.clang(); AU.wind(); } });
    if(tt<D) raf=requestAnimationFrame(step); else end(); };
  const end=()=>{ if(!live) return; live=false; cancelAnimationFrame(raf); el.remove(); removeEventListener('keydown',kd,true); done(); };
  const skip=()=>{ if(tt<VA-.2) skipTo+=VA-.2-tt; else end(); };
  const kd=ev=>{ const k=ev.key.toLowerCase(); if(k==='e'||k===' '||k==='enter'||k==='escape'){ ev.preventDefault(); ev.stopPropagation(); skip(); } };
  addEventListener('keydown',kd,true); el.onclick=skip; raf=requestAnimationFrame(step); }

/* ---------- the Gallows Wheel ---------- */
const SLOT_SYMS=['crown','skull','sword','chalice','candle','coin'];
const SLOT_W={crown:2,skull:3,sword:5,chalice:6,candle:8,coin:10};
const SLOT_PAY={crown:250,skull:80,sword:40,chalice:25,candle:15,coin:8};
const SLOT_NAME={crown:'The Crown',skull:'The Hanged',sword:'The Blade',chalice:'The Cup',candle:'The Candle',coin:'The Coin'};
const SLOT_STRIP=(()=>{ const a=[]; for(const k of SLOT_SYMS) for(let i=0;i<SLOT_W[k];i++) a.push(k); let s=91; const r=()=>{ s=(s*16807)%2147483647; return s/2147483647; }; for(let i=a.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; })();
function drawSymAt(g,k,x,y,s){ s=s||1; const p=(px,py,w,h,c)=>{ g.fillStyle=c; g.fillRect(x+px*s,y+py*s,Math.max(1,w*s),Math.max(1,h*s)); };
  if(k==='crown'){ p(2,6,12,6,'#c99a2a'); p(2,11,12,2,'#8a6a1a'); for(const cx of [2,6,10]) { p(cx,3,2,3,'#e8c25a'); } p(13,3,1,3,'#e8c25a'); p(3,8,2,2,'#b01a12'); p(7,8,2,2,'#2a5ab0'); p(11,8,2,2,'#b01a12'); p(2,6,12,1,'#ffe08a'); }
  else if(k==='skull'){ p(3,2,10,8,'#e0d4b8'); p(4,10,8,3,'#cfc2a2'); p(5,5,2,3,'#120a06'); p(9,5,2,3,'#120a06'); p(7,8,2,2,'#3a2a20'); for(let i=0;i<4;i++) p(4.5+i*2,12,1,2,'#120a06'); p(3,2,10,1,'#fff6e0'); }
  else if(k==='sword'){ p(7,1,2,10,'#c0c4cc'); p(7,1,1,10,'#f0f2f6'); p(3,11,10,2,'#8a6a2a'); p(7,13,2,2,'#4a3020'); p(6,15,4,1,'#c9a96a'); p(8,2,1,1,'#ffffff'); }
  else if(k==='chalice'){ p(3,2,10,5,'#c99a2a'); p(4,3,8,2,'#7a0e10'); p(5,7,6,2,'#a87a20'); p(7,9,2,3,'#a87a20'); p(4,12,8,2,'#c99a2a'); p(3,2,10,1,'#ffe08a'); }
  else if(k==='candle'){ p(6,6,4,9,'#e8dcc0'); p(6,6,1,9,'#fff6e0'); p(7,2,2,4,'#ff9a3a'); p(7,3,1,2,'#ffe08a'); p(4,14,8,2,'#5a4a3a'); p(9,8,1,3,'#cfc2a2'); }
  else if(k==='coin'){ p(3,3,10,10,'#c99a2a'); p(2,5,1,6,'#c99a2a'); p(13,5,1,6,'#c99a2a'); p(5,2,6,1,'#c99a2a'); p(5,13,6,1,'#c99a2a'); p(6,6,4,4,'#3a2a10'); p(3,3,10,1,'#ffe08a'); p(4,4,1,8,'#e8c25a'); } }
function symCanvas(k,sz){ const c=document.createElement('canvas'); c.width=c.height=sz||16; const g=c.getContext('2d'); drawSymAt(g,k,0,0,(sz||16)/16); return c; }
const slotScr=document.createElement('div'); slotScr.className='screen'; slotScr.id='slotScr'; slotScr.hidden=true; stage.appendChild(slotScr);
const SL={bet:50,busy:false,pos:[0,0,0],cv:[]};
function openSlots(){ mode='altar'; hud.hidden=true; slotScr.hidden=false; if(!SL.cv.length) SL.pos=[ri(0,33),ri(0,33),ri(0,33)]; renderSlots_(); }
function closeSlots(){ if(SL.busy) return; slotScr.hidden=true; mode='play'; hud.hidden=false; saveGame(); }
function renderSlots_(){ const bets=[10,50,250,1000];
  slotScr.innerHTML=`<h2 class="mh">The Gallows Wheel <span style="font-family:'Shippori Mincho',serif;color:#9a3a2c">絞首台の輪</span></h2>
  <div class="slm"><div class="slcab" id="slCab"><div class="slreels">${[0,1,2].map(i=>`<div class="slreel"><canvas width="48" height="144" id="slR${i}"></canvas></div>`).join('')}</div><div class="slline"></div></div>
  <div class="sllever"><button id="slLever" aria-label="Pull the lever"></button><small>PULL · E</small></div></div>
  <div class="slmsg" id="slMsg">Three of a kind on the red line. Two on the left pays your bet back.</div>
  <div class="slgold">You carry <b id="slGold">${P.gold}</b> crowns</div>
  <div class="slbets">${bets.map((b,i)=>`<button class="btn ghost${SL.bet===b?' on':''}" data-b="${b}"${P.gold<b?' disabled':''}>${b} <kbd>${i+1}</kbd></button>`).join('')}</div>
  <div class="slpay" id="slPay"></div>
  <div class="row" style="margin-top:.8em"><button class="btn ghost" id="slClose">Back <kbd>Esc</kbd></button></div>`;
  const pay=$('#slPay'); for(const k of SLOT_SYMS){ const c=symCanvas(k,16); pay.appendChild(c); const sp=document.createElement('span'); sp.innerHTML=`${SLOT_NAME[k]} ×3 <b>${SLOT_PAY[k]}×</b>`; pay.appendChild(sp); }
  SL.cv=[0,1,2].map(i=>$('#slR'+i)); SL.cv.forEach((c,i)=>drawReel(i));
  slotScr.querySelectorAll('.slbets .btn').forEach(b=>b.onclick=()=>{ SL.bet=+b.dataset.b; AU.tone('triangle',500,400,.06,.08,.1); renderSlots_(); });
  $('#slLever').onclick=pullLever; $('#slClose').onclick=closeSlots; }
function drawReel(i){ const c=SL.cv[i]; if(!c) return; const g=c.getContext('2d'); g.imageSmoothingEnabled=false; g.fillStyle='#120c08'; g.fillRect(0,0,48,144); const N=SLOT_STRIP.length;
  const pos=SL.pos[i]; const base=Math.floor(pos), fr=pos-base;
  for(let r=-2;r<=2;r++){ const idx=((base+r)%N+N)%N; const y=72+(r-fr)*48-24; g.fillStyle=r===0&&fr<.02?'#2a1a10':'#1a120c'; g.fillRect(2,y+2,44,44); drawSymAt(g,SLOT_STRIP[idx],8,y+8,2); }
  const sh=g.createLinearGradient(0,0,0,144); sh.addColorStop(0,'rgba(0,0,0,.75)'); sh.addColorStop(.3,'rgba(0,0,0,0)'); sh.addColorStop(.7,'rgba(0,0,0,0)'); sh.addColorStop(1,'rgba(0,0,0,.75)'); g.fillStyle=sh; g.fillRect(0,0,48,144); }
function pullLever(){ if(SL.busy) return; const bet=SL.bet; if(P.gold<bet){ $('#slMsg').textContent='Not enough crowns.'; AU.tone('square',200,150,.15,.08,.2); return; }
  SL.busy=true; P.gold-=bet; $('#slGold').textContent=P.gold; $('#slCab').classList.remove('win'); $('#slMsg').classList.remove('big'); $('#slMsg').textContent='The wheel turns…';
  const lv=$('#slLever'); lv.classList.add('pull'); setTimeout(()=>lv.classList.remove('pull'),380); AU.chain(); AU.noise(.3,300,900,2,.25,'bandpass',.3);
  const N=SLOT_STRIP.length; const tgt=[0,1,2].map(()=>Math.floor(Math.random()*N)); const t0=performance.now(); const stops=RM?[300,450,600]:[1100,1600,2150];
  const from=SL.pos.slice(), dist=tgt.map((t,i)=>{ const cur=((from[i]%N)+N)%N; return (t-cur+N)%N+N*(3+i); }); const last=[-1,-1,-1]; const done=[false,false,false];
  const step=now=>{ let all=true; for(let i=0;i<3;i++){ const k=clamp((now-t0)/stops[i],0,1); const e=1-Math.pow(1-k,3)+ (k<1?0:0); const back=k>.92?Math.sin((k-.92)/.08*Math.PI)*.06:0;
      SL.pos[i]=from[i]+dist[i]*e-back; drawReel(i); const fi=Math.floor(SL.pos[i]); if(fi!==last[i]){ last[i]=fi; if(k<1) AU.tick(); }
      if(k>=1&&!done[i]){ done[i]=true; SL.pos[i]=((from[i]+dist[i])%N+N)%N; drawReel(i); if(AU.taiko) AU.taiko(.8,null,1+i*.15); else AU.slam(); } if(k<1) all=false; }
    if(!all) requestAnimationFrame(step); else settle(tgt.map(t=>SLOT_STRIP[t]),bet); };
  requestAnimationFrame(step); }
function settle(sy,bet){ let win=0, msg; const [a,b,c]=sy;
  if(a===b&&b===c){ win=bet*SLOT_PAY[a]; msg=`${SLOT_NAME[a]} ×3 · you win ${win} crowns`; }
  else if(a===b){ win=bet; msg=`Two ${SLOT_NAME[a].replace('The ','')}s · your bet back`; }
  else msg=pick(['The wheel keeps it.','Nothing. The hanged man grins.','The crows laugh at you.','Not tonight.','Again?']);
  P.gold+=win; $('#slGold').textContent=P.gold; const m=$('#slMsg'); m.textContent=msg; SL.busy=false;
  if(win>bet){ $('#slCab').classList.add('win'); m.classList.add('big'); for(let i=0;i<Math.min(14,4+Math.round(Math.log2(win/bet)*2));i++) setTimeout(()=>AU.coin(),i*70); if(win>=bet*40){ AU.reveal(a==='crown'?5:4); toast(a==='crown'?'冠 THE CROWN. The whole house hears the coins fall.':`${SLOT_NAME[a]}. The wheel pays.`); } else AU.perfect(); }
  else if(win===bet) AU.lock(); else AU.tone('sine',140,90,.5,.12,.4);
  slotScr.querySelectorAll('.slbets .btn').forEach(b=>{ b.disabled=P.gold<+b.dataset.b; }); }
/* keys for both screens */
addEventListener('keydown',ev=>{ const k=ev.key.length===1?ev.key.toLowerCase():ev.key;
  if(!altarScr.hidden&&!$('#alCine')){ if(k==='Escape'){ ev.preventDefault(); if($('#alRes')){ if(reveal) reveal.finish(); else closeAltar(); } else closeAltar(); } else if((k==='e'||k==='Enter')&&!$('#alRes')){ ev.preventDefault(); altarGo(); } else if((k==='e'||k==='Enter')&&$('#alRes')&&reveal){ ev.preventDefault(); reveal.finish(); } }
  else if(!slotScr.hidden){ if(k==='Escape'){ ev.preventDefault(); closeSlots(); } else if(k==='e'||k===' '||k==='Enter'){ ev.preventDefault(); pullLever(); } else if('1234'.includes(k)&&k.length===1){ const b=[10,50,250,1000][+k-1]; if(P.gold>=b&&!SL.busy){ SL.bet=b; renderSlots_(); } } } });
