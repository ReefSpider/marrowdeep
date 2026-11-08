'use strict';
/* ===== ui: HUD, satchel & skill tree, loot reels, chest cinematics, cutscenes, story flow, main loop ===== */
const CD={hem:1.6,teth:.9,bell:12}; /* ability cooldowns (v16, tactics.js) */
let mode='title', interact=null, promptTxt='', barkT=0, barkCd=0, lastHud='', caseState=null, reveal=null, typing=null, cut=null, bossSlow=0, deathShown=false, seenIntro={}, fadeTarget=1;
const hud=$('#hud'), tip=$('#tip');
const SAVEKEY='marrowdeep.v2';

/* ---------- small HUD helpers ---------- */
function bark(kind,force){ if(!force&&barkCd>0) return; const arr=BARKS[kind]; if(!arr) return; const el=$('#bark'); el.textContent=pick(arr); el.classList.add('on'); barkT=3.4; barkCd=force?3:8; }
const POT_MAX=4; /* belt size; dying refills it (v22) */
function updBelt(){ $('#belt').querySelectorAll('i').forEach((el,i)=>el.classList.toggle('f',i<P.potions)); }
/* v21 (playtest: "it keeps telling me I've levelled up but I haven't"): a one-shot banner that faded out kept its
   class, and a CSS animation replays whenever its parent is shown again, so "Level N · a skill point" came back after
   every card, map and menu. Banners that fade away now drop the class when they finish. */
document.addEventListener('animationend',e=>{ if(['lu','bn','im','epi'].includes(e.animationName)) e.target.classList.remove('on'); },true);
function levelUpFX(){ AU.lvl(); impactT=Math.max(impactT,.05); const el=$('#lvlup'); el.querySelector('b').textContent='Level '+P.lvl; el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
  for(let i=0;i<24;i++){ const a=i/24*Math.PI*2; part({x:P.x,y:P.y-14,vx:Math.cos(a)*120,vy:Math.sin(a)*80,g:0,life:.6,em:true,col:'#ffd890'}); } bark('level',true); }
function showBossName(name,jp,sub){ const el=$('#bossname'); el.querySelector('b').textContent=name; el.querySelector('span').textContent=jp; el.querySelector('em').textContent=sub||''; el.classList.remove('on'); void el.offsetWidth; el.classList.add('on'); }
function caption(t,jp){ const el=$('#caption'); if(!t){ el.classList.remove('on'); return; } el.querySelector('.cap').textContent=t; el.querySelector('.cap-jp').textContent=jp||''; el.classList.remove('on'); void el.offsetWidth; el.classList.add('on'); }
function bars(on){ $('#bars').classList.toggle('on',on); }
const SKEY={s1:'hem',s2:'teth',s3:'hound',s4:'bell'};
function updHud(){ if(!P) return; const s=P.stats; const lf=clamp(P.life/s.life,0,1);
  $('#lifeF').style.height=(lf*100).toFixed(1)+'%'; $('#gritF').style.height=P.grit.toFixed(1)+'%';
  const key=Math.ceil(P.life)+'|'+s.life+'|'+P.gold+'|'+P.lvl+'|'+P.xp+'|'+P.sp;
  if(key!==lastHud){ lastHud=key; $('#lifeN').textContent=Math.ceil(P.life)+' / '+s.life; $('#goldTxt').textContent=P.gold; $('#lvlN').textContent=P.lvl; $('#xpF').style.width=(P.xp/xpNext(P.lvl)*100).toFixed(1)+'%'; $('#spN').textContent=P.sp>0?`${P.sp} skill point${P.sp>1?'s':''} · T`:''; }
  const tg=$('#target'); if(targetE&&targetT>0&&!targetE.dead&&!targetE.boss){ tg.classList.add('on'); const nm=$('#tName'); if(nm.textContent!==targetE.name) nm.textContent=targetE.name; nm.className='nm'+(targetE.unique?' un':targetE.rare?' ra':targetE.champ?' ch':''); $('#tBar').style.width=(clamp(targetE.hp/targetE.maxhp,0,1)*100)+'%'; const mt=targetE.mods?targetE.mods.map(m=>MODS[m]).join(' · '):''; const me=$('#tMods'); if(me.textContent!==mt) me.textContent=mt; } else tg.classList.remove('on');
  const boss=enemies.find(e=>e.boss); const bb=$('#bossbar'); if(boss&&!boss.intro&&!boss.dead){ bb.classList.add('on'); $('#bbName').textContent=boss.name; $('#bbJp').textContent=boss.jp; $('#bbF').style.width=(clamp(boss.hp/boss.maxhp,0,1)*100)+'%'; const sf=boss.state==='stagger'?1:clamp((boss.stag||0)/(boss.stagMax||1),0,1); $('#bbS').style.width=(sf*100).toFixed(1)+'%'; $('#bbSt').classList.toggle('full',boss.state==='stagger'); } else bb.classList.remove('on');
  const pr=$('#prompt'); if(interact&&mode==='play'){ if(promptTxt!==interact.txt){ promptTxt=interact.txt; pr.innerHTML=interact.txt; } pr.classList.add('on'); } else pr.classList.remove('on');
  const cb=$('#combo'); if(P.hits>=3||(P.streak||0)>=5){ cb.classList.add('on'); const nEl=$('#comboN'); if(nEl.textContent!==String(P.hits)) nEl.textContent=P.hits; const mv=(P.streak||0)>=5?`${P.streak} slain · ${P.streak>=25?'殺戮 MASSACRE':P.streak>=12?'修羅 CARNAGE':'斬 RAMPAGE'}`:P.lastMv; const me=$('#comboMv'); if(me.textContent!==mv) me.textContent=mv; } else cb.classList.remove('on');
  document.querySelectorAll('#abar .ab').forEach(el=>{ const id=SKEY[el.dataset.k]; const on=has(id); el.classList.toggle('on',on); let f=0;
    if(on){ if(id==='hem') f=clamp(P.cd.hem/CD.hem,0,1); else if(id==='teth') f=P.grit<15?1:clamp(P.cd.teth/CD.teth,0,1); else if(id==='bell') f=P.grit<40?1:clamp(P.cd.bell/CD.bell,0,1); else if(id==='hound') f=P.houndT>0?0:1-P.rage/100; }
    el.style.setProperty('--cd',f.toFixed(3)); el.classList.toggle('ready',on&&f===0); });
  $('#rage').hidden=!has('hound'); $('#rageF').style.width=P.rage.toFixed(1)+'%'; $('#rage').classList.toggle('full',P.rage>=100&&P.houndT<=0);
  U.uLow.value=lerp(U.uLow.value,lf<.3&&!P.dead?1:0,.05); }
const scrX=wx=>((wx-camR.x-camPX)*camZ+camPX)*SCALE, scrY=wy=>((wy-camR.y-camPY)*camZ+camPY)*SCALE;
const lblLayer=$('#labels'); const lblPool=[];
function updLabels(){ let n=0;
  if(mode==='play'&&P) for(const d of drops){ if(d.kind!=='item') continue; const dx=d.x-P.x, dy=d.y-P.y; if(dx*dx+dy*dy>110*110) continue;
    let el=lblPool[n]; if(!el){ el=document.createElement('div'); el.className='lbl'; lblLayer.appendChild(el); lblPool.push(el); }
    el.hidden=false; if(el._it!==d.item){ el._it=d.item; el.textContent=d.item.name; el.style.color=RCOL[d.item.rarity]; }
    el.style.left=scrX(d.x)+'px'; el.style.top=scrY(d.y-17)+'px'; n++; }
  for(let i=n;i<lblPool.length;i++) lblPool[i].hidden=true; }

/* ---------- interaction ---------- */
function findInteract(){
  let best=null,bd=1e9; const consider=(o,dist,txt,act)=>{ if(dist<bd){bd=dist;best={o,txt,act};} };
  const CN=['Iron-Bound Coffer','Bone Reliquary','Tithe Hoard'];
  for(const c of chests){ if(c.open||c.falling) continue; const dx=Math.abs(c.x-P.x), dy=Math.abs(c.y-P.y); if(dx<26&&dy<22) consider(c,dx,`<kbd>E</kbd> Open ${CN[c.tier]}`,()=>openChest(c)); }
  for(const d of drops){ if(d.kind!=='item') continue; const dx=Math.abs(d.x-P.x), dy=Math.abs(d.y-P.y); if(dx<20&&dy<22) consider(d,dx-4,`<kbd>E</kbd> Take <span style="color:${RCOL[d.item.rarity]}">${d.item.name}</span>`,()=>takeDrop(d)); }
  for(const st of L.stones||[]){ const dx=Math.abs(st.x-P.x), dy=Math.abs(st.y-P.y); if(dx<22&&dy<24){ const done=CODEX_OPEN.has(st.id)&&(!CX[st.id].q||VOWS_TAKEN[st.id]); consider(st,dx,done?'<kbd>E</kbd> Read the stone again':'<kbd>E</kbd> Kneel at the remembrance stone',()=>stoneCard(st)); } }
  if(L.relic&&!L.relic.taken&&Math.abs(L.relic.x+12-P.x)<22&&Math.abs(L.relic.y-P.y)<20) consider(L.relic,0,'<kbd>E</kbd> Pull the blade from the dead man',takeRelic);
  const ex=L.exit.x*T+8, ey=L.exit.y*T; if(!L.locked&&!L.noExit&&Math.abs(P.x-ex)<26&&Math.abs(P.y-ey)<22) consider(L.exit,Math.abs(P.x-ex),L.def.id==='count'?'<kbd>E</kbd> Walk into the dawn':'<kbd>E</kbd> Climb on',()=>finishLevel());
  return best; }
function takeDrop(d){ if(!bagAdd(d.item)){ bark('meh'); toast('No room in the satchel. Open it (I) and make space.'); return; } d.gone=true; drops=drops.filter(x=>!x.gone); AU.coin(); noteBest(d.item); if(d.item.rarity>=4) bark('unique',true); }
function noteBest(it){ if(!P.best||it.rarity>P.best.rarity) P.best=it; }
function takeRelic(){ const r=L.relic; r.taken=true; P.equip.weapon=mkBase('Rusted Falchion'); calcStats(); AU.pickup(); impactT=.08; shake(3); freeze=.08; sparks(r.x+12,r.y-12,14); P.face=1; P.attack=null; P.swordA=-1.2; bark('relic',true); }

/* ---------- loot reels ---------- */
const CW=[[60,29,9,1.4,.55,.001],[18,46,28,5.5,2.4,.006],[0,22,48,14,15.95,.05],[48,34,13,2.5,1.2,.004]];
const CNAME=['Iron-Bound Coffer','Bone Reliquary','Tithe Hoard',"The Pale Merchant's Box"];
function fmtOdds(p){ return p>=1?p.toFixed(1)+'%':p>=.1?p.toFixed(2)+'%':'1 in '+Math.round(100/p).toLocaleString('en-US'); }
function openChest(c){ if(!c||c.open) return; c.open=true; c.t=0; AU.chest(); shake(2); bark('chest',true);
  for(let i=0;i<14;i++) part({x:c.x+rnd(-6,6),y:c.y-12,vx:rnd(-40,40),vy:rnd(-120,-40),g:200,life:rnd(.4,.9),em:true,col:pick(['#ffe1a0','#ffd06a','#fff'])});
  dropGold(c.x,c.y-14,Math.round(ri(4,12)*(1+dep()*.6)*(c.tier?2:1)*(c.tier===2?3:1)*(1+P.stats.gf/100)));
  const ilvl=ilvlNow()+(c.tier?2:0)+(c.tier===2?2:0)+ri(0,2); const win=genItem(ilvl,CW[c.tier],P.stats.mf);
  mode='case'; hud.hidden=true; setTimeout(()=>playChestCine(c.tier,win.rarity,()=>showCase(c.tier,ilvl,win)),280); }
function cardEl(it){ const d=document.createElement('div'); d.className='card'+(it.rarity===5?' ab':''); d.style.setProperty('--rc',RCOL[it.rarity]); d.style.setProperty('--rg',RGLOW[it.rarity]); d.appendChild(iconEl(it)); const n=document.createElement('div'); n.className='n'; n.textContent=it.name; d.appendChild(n); return d; }
function showCase(tier,ilvl,win,onClose){
  mode='case'; hud.hidden=true; const w=CW[tier]; const N=62, WI=52; const items=[];
  for(let i=0;i<N;i++) items.push(i===WI?win:genItem(ilvl,w,0));
  if(win.rarity<4&&R()<.45){ const j=WI+(R()<.5?1:-1); items[j]=mkFixed(pick(UNIQUES),4); items[j].ilvl=ilvl; fin(items[j]); }
  $('#caseName').textContent=CNAME[tier]; $('#caseSub').textContent=`${LEVELS[lvlIdx].name} · Depth ${lvlIdx+1}`.toUpperCase();
  const ow=oddsW(w,P.stats.mf), tot=ow.reduce((a,b)=>a+b,0); $('#odds').innerHTML=ow.map((v,i)=>v>0?`<span style="color:${RCOL[i]}">${RAR[i]} ${fmtOdds(v/tot*100)}</span>`:'').join('');
  const strip=$('#strip'); strip.innerHTML=''; strip.style.transform='translateX(0px)'; const els=items.map(cardEl); els.forEach(e=>strip.appendChild(e));
  $('#result').innerHTML=''; $('#case').hidden=false;
  const reelW=$('#reel').clientWidth; const cw=els[1].offsetLeft-els[0].offsetLeft; const cardW=els[0].offsetWidth;
  const i0=Math.max(2,Math.round((reelW/2-cardW/2)/cw)); const ab=mkFixed(pick(ABYSSAL),5); ab.ilvl=ilvl; fin(ab); const ne=cardEl(ab); strip.replaceChild(ne,els[i0]); els[i0]=ne;
  const x0=i0*cw+cardW/2-reelW/2; strip.style.transform=`translateX(${-x0}px)`; ne.classList.add('tease'); AU.tease();
  const target=WI*cw+rnd(.12,.88)*cardW-reelW/2; const dur=(RM||tier===0)?1100:6400; /* v25: a plain coffer doesn't make you wait */
  caseState={win,landed:false,ready:false,el:els[WI],onClose};
  setTimeout(()=>{ ne.classList.remove('tease'); const t0=performance.now(); let lastI=-1, lastTk=0;
    const step=now=>{ const p=caseState&&caseState.skip?1:Math.min(1,(now-t0)/dur); const e=1-Math.pow(1-p,4); const x=x0+(target-x0)*e; strip.style.transform=`translateX(${-x}px)`;
      const idx=Math.floor((x+reelW/2)/cw); if(idx!==lastI){ lastI=idx; if(now-lastTk>70){ AU.tick(); lastTk=now; } } if(p<1) requestAnimationFrame(step); else land(); };
    requestAnimationFrame(step); },RM?250:1100); }
function land(){ const cs=caseState; cs.landed=true; cs.el.classList.add('won'); AU.reveal(cs.win.rarity); noteBest(cs.win);
  if(cs.win.rarity>=4){ bark('unique',true); } else if(cs.win.rarity===0) bark('meh',true);
  const r=$('#result'); r.innerHTML=`<div class="tt" id="rtt"></div><div class="row" id="rbtns" hidden><button class="btn" id="takeBtn">Take it <kbd>E</kbd></button><button class="btn" id="equipBtn">Equip <kbd>R</kbd></button><button class="btn ghost" id="leaveBtn">Leave it</button></div>`;
  $('#takeBtn').onclick=()=>closeCase(true); $('#equipBtn').onclick=()=>closeCase('equip'); $('#leaveBtn').onclick=()=>closeCase(false); $('#rtt').onclick=()=>{ if(reveal) reveal.finish(); };
  statReel(cs.win,$('#rtt'),()=>{ cs.ready=true; const q=$('#rtt').querySelector('#rq'); if(q) q.hidden=false; $('#rbtns').hidden=false; $('#takeBtn').focus({preventScroll:true}); $('#rbtns').scrollIntoView({block:'nearest'}); },{seed:cs.seed}); }
function sCell(k,v,g){ const d=document.createElement('div'); d.className='sc g'+g; d.style.setProperty('--gc',GR[g].c); d.textContent=valTxt(k,v); return d; }
function catCell(k){ const d=document.createElement('div'); d.className='sc cat'; d.textContent=AFX[k][2]; return d; }
/* stat reveal, in two beats per stat: first the category spins (every category equally likely, all drawn the same),
   then the number spins inside that category. Outcomes are already rolled; the reels only show them. */
function statReel(it,box,done,opt){ opt=opt||{}; const fast=!!opt.fast;
  /* opt.seed: every row draws its fillers and landing spot from its own seeded generator, so in co-op every machine shows the same near misses */
  const rgFor=i=>{ if(opt.seed==null) return fn=>fn(); const g=mulberry((opt.seed+i*7919)>>>0); return fn=>{ const p=RNG; RNG=g; try{ return fn(); } finally{ RNG=p; } }; };
  const tp=tipParts(it,true); box.innerHTML=tp.html;
  const fillDmg=()=>{ box.querySelectorAll('#rdm').forEach(d=>{ d.textContent=tp.dmgFinal; d.classList.add('rv','lock'); }); };
  const pool=catPool(affSlot(it)).filter(k=>it.rarity>=4||!ELEM_KEYS.includes(k));
  const rows=tp.rows.map((r,i)=>{ const el=box.querySelector('#'+r.id), ss=el.querySelector('.ss'), sw=el.querySelector('.sw'), a=r.a;
    el.classList.add('cat'); el.querySelector('.lb').textContent='· · ·'; const pl=pool.includes(a.k)?pool:pool.concat([a.k]); const rg=rgFor(i);
    const N=30, WI=23; rg(()=>{ for(let j=0;j<N;j++){ let k=pick(pl); if(j===WI) k=a.k; else if(Math.abs(j-WI)===1&&pl.length>1) while(k===a.k) k=pick(pl); ss.appendChild(catCell(k)); } });
    return {el,ss,sw,a,WI,i,rg,phase:'cat',done:false}; });
  if(!rows.length){ fillDmg(); setTimeout(done,fast?400:0); return; }
  const now0=performance.now();
  const setup=(r,start)=>r.rg(()=>setup0(r,start));
  const setup0=(r,start)=>{ const ww=r.sw.clientWidth, ch=r.ss.children, cw=ch[1].offsetLeft-ch[0].offsetLeft; const i0=Math.max(1,Math.round((ww/2-cw/2)/cw));
    if(r.phase==='val') r.ss.replaceChild(sCell(r.a.k,valueFor(r.a.lo,r.a.hi,4),4),ch[i0]);      // the number reel still opens on an Abyssal tease
    r.x0=i0*cw+cw/2-ww/2; r.tx=r.WI*cw+rnd(.18,.82)*cw-ww/2; r.cw=cw; r.ww=ww; r.last=-1; r.ss.style.transform=`translateX(${-r.x0}px)`;
    r.dur=r.phase==='cat'?(fast?(RM?200:700):(RM?300:1500))+r.i*(fast?(RM?60:200):(RM?100:520)):(fast?(RM?180:420):(RM?280:1250));
    r.t0=start; };
  const buildVal=r=>r.rg(()=>buildVal0(r));
  const buildVal0=r=>{ const a=r.a, N=42, WI=33, cells=[]; for(let j=0;j<N;j++) cells.push(j===WI?{v:a.v,g:a.g}:rollStat(a.lo,a.hi));
    if(a.g<4&&R()<.45){ const j=WI+(R()<.5?1:-1), g=R()<.55?4:3; cells[j]={g,v:valueFor(a.lo,a.hi,g)}; }
    r.ss.innerHTML=''; cells.forEach(c=>r.ss.appendChild(sCell(a.k,c.v,c.g))); r.WI=WI; r.phase='val'; };
  const finishCat=(r,quiet)=>{ r.ss.style.transform=`translateX(${-r.tx}px)`; r.ss.children[r.WI].classList.add('win'); r.el.classList.remove('cat'); r.el.querySelector('.lb').textContent=AFX[r.a.k][2]; if(!quiet) AU.lock(); };
  const finishRow=r=>{ r.done=true; r.ss.style.transform=`translateX(${-r.tx}px)`; r.ss.children[r.WI].classList.add('win'); r.el.style.setProperty('--gc',GR[r.a.g].c); r.el.classList.add('done');
    const gt=r.el.querySelector('.gt'); gt.textContent=GR[r.a.g].n.toUpperCase(); gt.style.color=GR[r.a.g].c;
    if(r.a.g===4){ AU.abyssStat(); box.classList.remove('flash'); void box.offsetWidth; box.classList.add('flash'); } else if(r.a.g===3) AU.perfect(); else if(!fast||r.i===rows.length-1) AU.lock(); if(typeof JP!=='undefined') JP.stat(r.a.g,fast,r.el); };
  rows.forEach(r=>setup(r,now0+(RM?0:fast?140:450)));
  let raf=0, lastTick=0, live=true;
  const end=()=>{ if(!live) return; live=false; if(!fast) reveal=null; cancelAnimationFrame(raf);
    rows.forEach(r=>{ if(r.done) return; if(r.phase==='cat'){ finishCat(r,true); buildVal(r); setup(r,0); } finishRow(r); }); fillDmg(); done(); };
  const step=now=>{ let all=true; for(const r of rows){ if(r.done) continue; all=false; if(now<r.t0) continue; const pr=clamp((now-r.t0)/r.dur,0,1); const e=1-Math.pow(1-pr,4); const x=r.x0+(r.tx-r.x0)*e; r.ss.style.transform=`translateX(${-x}px)`;
      const idx=Math.floor((x+r.ww/2)/r.cw); if(idx!==r.last){ r.last=idx; if(now-lastTick>(fast?80:60)){ AU.tick(); lastTick=now; } }
      if(pr>=1){ if(r.phase==='cat'){ finishCat(r,fast&&r.i<rows.length-1); buildVal(r); setup(r,now+(RM?0:fast?160:420)); } else finishRow(r); } }
    if(all) end(); else raf=requestAnimationFrame(step); };
  if(!fast) reveal={finish:end}; raf=requestAnimationFrame(step); }
function closeCase(take){ const cs=caseState; if(!cs||!cs.ready) return; caseState=null;
  if(take==='equip'&&typeof equipItem==='function'&&equipItem(cs.win)){}
  else if(take&&bagAdd(cs.win)){ AU.coin(); } else dropItem(cs.win,P.x+P.face*10,P.y-10,true);
  $('#case').hidden=true; if(cs.onClose) cs.onClose(); else { hud.hidden=false; mode='play'; } }

/* ---------- chest cinematic: a close-up before the reel ---------- */
/* the close-up glows in the chest's own colour; the item's rarity stays hidden until the reel lands */
const CHEST_GLOW=['#f0e6d0','#ffd27a','#ff7a4a','#d8c8ff','#bfeaff'];
function playChestCine(tier,rar,done){ const el=$('#cine'), cvs=$('#cineCv'), g=cvs.getContext('2d'); g.imageSmoothingEnabled=false; el.hidden=false;
  const dur=(RM||tier===0)?450:[1500,2200,3400,1500][tier]; const t0=performance.now(); const col=hex(CHEST_GLOW[tier]||CHEST_GLOW[0]); const sn=new Set(); const cps=[];
  const step=now=>{ const k=Math.min(1,(now-t0)/dur); const openAt=tier===2?.66:.6, open=k>openAt;
    const cue=(n,f)=>{ if(!sn.has(n)&&k>=f){ sn.add(n); return true; } return false; };
    if(tier>=1&&cue('c1',.3)){ AU.chain(); for(let i=0;i<14;i++) cps.push({x:120-14,y:68,vx:rnd(-60,60),vy:rnd(-80,20),l:.6}); }
    if(tier>=1&&cue('c2',.45)){ AU.chain(); for(let i=0;i<14;i++) cps.push({x:120+14,y:68,vx:rnd(-60,60),vy:rnd(-80,20),l:.6}); }
    if(cue('open',openAt)){ AU.boom(.5); AU.chest(); for(let i=0;i<40;i++){ const a=rnd(-Math.PI,0); cps.push({x:120,y:72,vx:Math.cos(a)*rnd(40,160),vy:Math.sin(a)*rnd(40,160),l:rnd(.5,1.1),c:1}); } }
    if(tier===2&&cue('thrum',.2)) AU.roar();
    g.setTransform(1,0,0,1,0,0); g.fillStyle='#050304'; g.fillRect(0,0,240,135);
    const rg=g.createRadialGradient(120,80,4,120,80,140); rg.addColorStop(0,`rgba(${col[0]},${col[1]},${col[2]},${open?.35:.06+k*.1})`); rg.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=rg; g.fillRect(0,0,240,135);
    if(open){ const kk=(k-openAt)/(1-openAt); g.save(); g.translate(120,70); g.rotate(now/900); for(let i=0;i<14;i++){ g.rotate(Math.PI*2/14); g.fillStyle=`rgba(${col[0]},${col[1]},${col[2]},${(.12+.25*(1-kk)).toFixed(2)})`; g.beginPath(); g.moveTo(0,0); g.lineTo(-8,-160); g.lineTo(8,-160); g.fill(); } g.restore(); }
    const sh=open?0:k*k*3; const z=(tier===2?2.6:3.2)*(1+k*.3);
    g.save(); g.translate(120+(Math.random()-.5)*sh*2,96+(Math.random()-.5)*sh); g.scale(z,z); drawChest(g,{open,tier});
    if(tier>=1&&!open){ g.strokeStyle='#6a6672'; g.lineWidth=1; if(!sn.has('c1')){ g.beginPath(); g.moveTo(-14,-22); g.lineTo(14,-2); g.stroke(); } if(!sn.has('c2')){ g.beginPath(); g.moveTo(14,-22); g.lineTo(-14,-2); g.stroke(); } }
    g.restore();
    for(const p of cps){ p.l-=1/60; p.x+=p.vx/60; p.y+=p.vy/60; p.vy+=120/60; if(p.l>0){ g.fillStyle=p.c?`rgba(${col[0]},${col[1]},${col[2]},${Math.min(1,p.l*2).toFixed(2)})`:'#ffd28a'; g.fillRect(p.x|0,p.y|0,1,1); } }
    if(k>.9){ g.fillStyle=`rgba(255,250,240,${((k-.9)/.1).toFixed(2)})`; g.fillRect(0,0,240,135); }
    if(k<1) requestAnimationFrame(step); else { el.hidden=true; done(); } };
  requestAnimationFrame(step); }

/* ---------- satchel + brand of skills ---------- */
function showTipHTML(html,el){ tip.innerHTML=html; tip.hidden=false; const sr=stage.getBoundingClientRect(), r=el.getBoundingClientRect(); const tw=tip.offsetWidth, th=tip.offsetHeight;
  let x=r.right-sr.left+8; if(x+tw>sr.width) x=r.left-sr.left-tw-8; const y=clamp(r.top-sr.top,4,sr.height-th-4); tip.style.left=Math.max(4,x)+'px'; tip.style.top=y+'px'; }
const showTip=(it,el)=>showTipHTML(tipHTML(it)+(typeof compareHTML==='function'?compareHTML(it):''),el);
const hideTip=()=>{tip.hidden=true;};
function bindTip(el,it){ el.addEventListener('pointerenter',()=>showTip(it,el)); el.addEventListener('pointerleave',hideTip); }
function invMsg(t){ const h=$('#invMsg'); h.textContent=t; h.classList.remove('on'); void h.offsetWidth; h.classList.add('on'); }
function equipFromBag(i,wantOff){ const it=P.bag[i]; let slot=it.slot;
  if(slot==='weapon'){ const b=it.base; if(b.h===0||wantOff){ if(!has('off')){ invMsg('Learn Second Hand (Steel) to use your off hand.'); return; } if(b.h===2){ invMsg('Two-handed. It needs both hands.'); return; } slot='off'; } }
  const old=P.equip[slot]; P.equip[slot]=it; bagSwapOut(i,old);
  if(slot==='weapon'&&it.base.h===2&&P.equip.off) invMsg('Two-handed weapon: your off hand rests.');
  calcStats(); AU.tone('triangle',420,300,.08,.12,.1); hideTip(); renderInv(); }
function renderInv(){
  const eq=$('#equip'); eq.innerHTML='';
  [['weapon','Main hand','1 / 1 / 3 / 2'],['helm','Helm','1 / 2 / 2 / 3'],['armor','Armour','2 / 2 / 3 / 3'],['off','Off hand','1 / 3 / 3 / 4'],['amulet','Amulet','1 / 4 / 2 / 5'],['ring','Ring','2 / 4 / 3 / 5']].forEach(([s,lab,area])=>{
    const d=document.createElement('div'); d.className='slot'; d.dataset.slot=s; d.style.gridArea=area; const it=P.equip[s];
    if(s==='off'&&!has('off')){ d.classList.add('lockd'); d.innerHTML='<span class="kj">双</span><span class="lab">Second Hand</span>'; d.onpointerenter=()=>showTipHTML('<div class="w">Off hand</div><div class="g">Learn Second Hand in the Steel brand.</div>',d); d.onpointerleave=hideTip; eq.appendChild(d); return; }
    if(it){ d.appendChild(iconEl(it)); d.classList.add('r'+it.rarity); if(s==='off'&&!offActive()) d.classList.add('idle'); bindTip(d,it); d.onclick=()=>{ if(bagAdd(it,typeof GVIEW!=='undefined'?GVIEW.bag:0)){ P.equip[s]=null; calcStats(); hideTip(); renderInv(); } else invMsg('No room in the satchel for that.'); }; }
    else { const l=document.createElement('span'); l.className='lab'; l.textContent=lab; d.appendChild(l); }
    eq.appendChild(d); });
  renderBagGrid($('#bag'),{click:(it,i,e)=>{ if(e.shiftKey){ dropFromBag(i); return; } equipFromBag(i,false); },
    context:(it,i)=>equipFromBag(i,it.slot==='weapon'&&has('off'))});
  const s=P.stats; const rate=s.spd*(1+s.as/100);
  $('#stats').innerHTML=[['Level',`${P.lvl} (${P.xp} / ${xpNext(P.lvl)})`],['Damage',`${s.min}–${s.max} ${elemSummary(s)}`],offActive()&&s.omax?['Off hand',`${s.omin}–${s.omax}`]:null,['Defense',s.def],['Life',`${Math.ceil(P.life)} / ${s.life}`],['Attack rate',rate.toFixed(2)+'×'],['Critical strike',s.crit+'%'],['Life stolen',s.ls+'%'],['Magic find',s.mf+'%'],['Gold',P.gold]].filter(Boolean).map(([a,b])=>`<span>${a}</span><b>${b}</b>`).join('');
  renderTree(); }
function dropFromBag(i){ const it=P.bag.splice(i,1)[0]; dropItem(it,P.x+P.face*12,P.y-10,true); hideTip(); renderInv(); }
function skillAvail(s){ const prev=SKILLS.find(x=>x.br===s.br&&x.tier===s.tier-1); return !has(s.id)&&P.sp>0&&P.lvl>=TIER_LVL[s.tier]&&(!prev||has(prev.id)); }
function renderTree(){ const root=$('#tree'); root.innerHTML=''; $('#spTxt').textContent=P.sp>0?`${P.sp} point${P.sp>1?'s':''} to spend`:'No points. Level up to earn more.';
  BRANCH.forEach((b,bi)=>{ const col=document.createElement('div'); col.className='br'; col.style.setProperty('--bc',b.c); col.innerHTML=`<div class="bh"><b>${b.jp}</b><span>${b.n}</span></div>`;
    SKILLS.filter(s=>s.br===bi).forEach(s=>{ const learned=has(s.id), avail=skillAvail(s);
      const n=document.createElement('button'); n.className='node'+(learned?' on':avail?' av':''); n.innerHTML=`<i>${s.k}</i><span>${s.name}</span><small>${learned?(s.key?'Key '+s.key:'Learned'):'Level '+TIER_LVL[s.tier]}</small>`;
      n.onclick=()=>{ if(skillAvail(s)){ P.skills.add(s.id); P.sp--; AU.lvl(); impactT=.04; if(s.id==='wing') P.airJ=1; calcStats(); renderInv(); invMsg(`${s.name} learned.`); } };
      n.onpointerenter=()=>showTipHTML(`<div style="color:${b.c};font-size:1.15em">${s.k}　${s.name}</div><div class="g">${b.n} · tier ${s.tier+1} · needs level ${TIER_LVL[s.tier]}</div><div class="w" style="margin-top:.35em;text-align:left">${s.desc}</div>${s.key?`<div class="g" style="margin-top:.3em">Key ${s.key}</div>`:''}`,n);
      n.onpointerleave=hideTip; col.appendChild(n); });
    root.appendChild(col); }); }
function toggleInv(open,tab){ if(open){ mode='inv'; renderInv(); $('#inv').hidden=false; setTab(tab||'bag'); } else { mode='play'; $('#inv').hidden=true; hideTip(); } }
function setTab(t){ $('#paneBag').hidden=t!=='bag'; $('#paneTree').hidden=t!=='tree'; $('#paneCodex').hidden=t!=='codex'; $('#tabBag').classList.toggle('on',t==='bag'); $('#tabTree').classList.toggle('on',t==='tree'); $('#tabCodex').classList.toggle('on',t==='codex'); if(t==='codex') renderCodex(); }
$('#tabBag').onclick=()=>setTab('bag'); $('#tabTree').onclick=()=>setTab('tree'); $('#tabCodex').onclick=()=>setTab('codex');
function renderCodex(){ const vs=Object.entries(VOWS_TAKEN); $('#vowsTxt').innerHTML=`<b>${CODEX_OPEN.size} / ${CODEX.length}</b> written. `+(vs.length?'Vows sworn: '+vs.map(([id,v])=>`<b>${VOWS[v].jp} ${VOWS[v].n}</b> (${VOWS[v].d})`).join(' · '):'No vows sworn yet. Kneel at the remembrance stones and answer them.');
  $('#codex').innerHTML=CODEX.map(c=>{ if(!CODEX_OPEN.has(c.id)) return `<div class="cx lk"><b><i>？</i>Unwritten</b>Something in the dark has not been met yet.</div>`; const v=VOWS_TAKEN[c.id]; return `<div class="cx"><b><i>${c.k}</i>${c.t}</b>${c.x}${c.q?`<q>${c.q}</q>`:''}${v?`<div class="vw">You answered: ${c.a.find(a=>a[1]===v)[0]}</div>`:''}</div>`; }).join(''); }

/* ---------- cards: letters, act titles, merchant ---------- */
function showCard(o){ mode='card'; hud.hidden=true; $('#card').hidden=false; const lt=$('#letter'), lg=$('#ledger'), row=$('#cardBtns');
  $('#cardTitle').innerHTML=o.title?`<b>${o.title}</b><span>${o.jp||''}</span>`:''; lt.innerHTML=`${o.sal?`<span class="sal">${o.sal}</span>`:''}<span id="lbody"></span>${o.sig?`<span class="sig">${o.sig}</span>`:''}`; lg.innerHTML=o.ledger||''; lg.classList.remove('on'); row.innerHTML=''; row.hidden=true; row.className='row';
  (o.buttons||[]).forEach(b=>{ const bt=document.createElement('button'); bt.className='btn'+(b.ghost?' ghost':''); bt.innerHTML=b.label; bt.onclick=()=>b.fn(bt); if(b.disabled) bt.disabled=true; row.appendChild(bt); });
  const lb=$('#lbody'); let i=0; const full=o.body||'';
  const done=()=>{ if(typing){clearInterval(typing);typing=null;} lb.textContent=full; lg.classList.add('on'); row.hidden=false; const f=row.querySelector('.btn:not(.ghost):not([disabled])')||row.querySelector('.btn'); f&&f.focus({preventScroll:true}); };
  if(typing) clearInterval(typing); typing=setInterval(()=>{ i+=2; lb.textContent=full.slice(0,i); if(i%6===0) AU.tone('triangle',rnd(900,1300),700,.02,.02,.1); if(i>=full.length) done(); },RM?1:26);
  $('#card').onclick=e=>{ if(typing&&!e.target.closest('button')) done(); }; }
function hideCard(){ $('#card').hidden=true; $('#cardBtns').classList.remove('koan'); }
function stoneCard(st){ const c=CX[st.id]; if(!c) return; const first=unlockCodex(st.id); AU.bell(); const sworn=VOWS_TAKEN[st.id]; const back=()=>{ hideCard(); mode='play'; hud.hidden=false; };
  const btns=c.q&&!sworn?c.a.map(([txt,v])=>({label:`${txt}<small>${VOWS[v].jp}　Vow of ${VOWS[v].n} · ${VOWS[v].d}</small>`,fn:()=>{ VOWS_TAKEN[st.id]=v; calcStats(); back(); toast(`誓　You swore the Vow of ${VOWS[v].n}. ${VOWS[v].d}.`); AU.lvl(); impactT=.05; sparks(P.x,P.y-16,16,'#ffe0a0'); saveGame(); }})).concat([{label:'Not yet',ghost:1,fn:back}]):[{label:'Rise',fn:back}];
  showCard({title:c.t,jp:c.k,body:c.x+(c.q?`\n\n${c.q}`:'')+(sworn?`\n\nYou answered: ${c.a.find(a=>a[1]===sworn)[0]}`:''),buttons:btns}); if(c.q&&!sworn) $('#cardBtns').classList.add('koan'); }
function merchantCard(next){ const def=LEVELS[lvlIdx]; const potC=Math.round(20+dep()*6), boxC=Math.round(70+dep()*35);
  const letter=LETTERS[def.id];
  showCard({sal:letter?'A crow found you in the dark. A letter on its leg.':'You rest a moment.',body:letter?letter:'Your hands won\'t stop shaking. You let them.',sig:letter?'— Ilse':'',
    ledger:`Carried: <b>${P.gold}</b> crowns. In the dark beside the path, the Pale Merchant waits with a lantern and no face.`,
    buttons:[{label:`Buy a draught · ${potC}`,disabled:P.gold<potC||P.potions>=4,fn:()=>{ if(P.gold>=potC&&P.potions<4){ P.gold-=potC; P.potions++; AU.coin(); updBelt(); merchantCardSilent(next); } }},
      {label:`The Merchant's box · ${boxC}`,disabled:P.gold<boxC,fn:()=>{ if(P.gold<boxC) return; P.gold-=boxC; hideCard(); const ilvl=ilvlNow()+1; const win=genItem(ilvl,CW[3],P.stats.mf); playChestCine(3,win.rarity,()=>showCase(3,ilvl,win,()=>merchantCardSilent(next))); }},
      {label:'Climb on',fn:()=>{ hideCard(); next(); }}]}); }
function merchantCardSilent(next){ merchantCard(next); if(typing){ clearInterval(typing); typing=null; } $('#lbody').textContent=LETTERS[LEVELS[lvlIdx].id]||'Your hands won\'t stop shaking. You let them.'; $('#ledger').classList.add('on'); $('#cardBtns').hidden=false; }
function actCard(act,next){ const A=ACTS[act]; if(!A){ next(); return; } showCard({title:A.t,jp:A.jp,body:A.body,buttons:[{label:'Go',fn:()=>{ hideCard(); next(); }}]}); }

/* ---------- cutscenes ---------- */
function playCut(steps,onEnd){ cut={steps,i:-1,t:0,onEnd}; mode='cut'; hud.hidden=true; bars(true); if(typeof MUS!=='undefined'&&!steps.keepMood) MUS.setMood('cut'); nextCutStep(); }
function nextCutStep(){ cut.i++; const s=cut.steps[cut.i]; if(!s){ endCut(); return; } cut.t=0; cut.s=s; camZT=s.zoom||1; if(s.fade!=null) fadeTarget=s.fade; if(s.fn) s.fn(); if(s.cap!==undefined) caption(s.cap,s.jp); }
function updCut(dt){ if(!cut) return; const s=cut.s; cut.t+=dt; if(s.cam){ cam.x=lerp(cam.x,clamp(s.cam.x-W/2,0,L.w*T-W),Math.min(1,dt*2.5)); cam.y=lerp(cam.y,clamp(s.cam.y-H*.6,0,L.h*T-H),Math.min(1,dt*2.5)); } if(s.tick) s.tick(dt,cut.t); if(cut.t>=s.dur) nextCutStep(); }
function skipCut(){ if(cut&&cut.t>.35&&cut.s.skip!==false) nextCutStep(); }
function endCut(){ bars(false); caption(''); const f=cut.onEnd; cut=null; fadeTarget=1; camZT=1; mode='play'; hud.hidden=false; if(typeof MUS!=='undefined') MUS.setMood(moodFor(L&&L.def)); f&&f(); }

/* ---------- levels, saves, story flow ---------- */
function saveGame(){ store.set(SAVEKEY,{v:2,camp:24,lvlIdx,ngp,codex:[...CODEX_OPEN],vows:VOWS_TAKEN,seen:seenIntro,P:{lvl:P.lvl,xp:P.xp,sp:P.sp,skills:[...P.skills],gold:P.gold,potions:P.potions,equip:Object.fromEntries(Object.entries(P.equip).map(([k,v])=>[k,serItem(v)])),bag:P.bag.map(serItem)}}); }
function loadSave(){ const s=store.get(SAVEKEY); if(!s||s.v!==2) return null; return s; }
function restorePlayer(sv){ P=newPlayer(); Object.assign(P,{lvl:sv.lvl,xp:sv.xp,sp:sv.sp,gold:sv.gold,potions:sv.potions}); P.skills=new Set(sv.skills); for(const k in sv.equip) P.equip[k]=deItem(sv.equip[k]); P.bag=(sv.bag||[]).map(deItem).filter(Boolean); calcStats(); P.life=P.stats.life; }
function loadLevel(idx,opt){ opt=opt||{}; lvlIdx=idx; interact=null; promptTxt=''; const def=LEVELS[idx]; const seed=(idx+1)*7919+ngp*104729+(opt.seed||0);
  L=genLevel(def,seed); L.bornAt=performance.now(); pal=PALS[def.pal]; LV=withSeed(seed+1,()=>bakeLevel(L,pal)); LVc=LV.getContext('2d'); BG=withSeed(seed+2,()=>bakeBG(pal));
  enemies=L.spawns.map(mkEnemy); chests=L.chests.map(c=>({x:c.x*T,y:c.y*T,tier:c.tier,open:false,t:0,secret:c.secret})); drops=[]; parts=[]; ghosts=[]; projs=[]; fx=[]; bgev=[]; bgT=1.5;
  L.relic=(idx===0&&!P.equip.weapon)?{x:L.spawn.x+5*T,y:L.spawn.y,taken:false}:null;
  if(def.kind==='boss'){ const b=spawnBoss(def.boss); enemies.push(b); L.locked=false; L.noExit=true; if(def.id==='count') L.wound=.35; }
  P.x=L.spawn.x; P.y=L.spawn.y; P.vx=P.vy=0; P.safe={x:P.x,y:P.y}; P.attack=null; P.dash=0; P.teth=null; P.iai=null; P.shade=null; P.dead=false; P.deadT=0; P.ghostT=0; P.lastUsed=false; P.houndT=0; P.exhaustT=0; P.clarT=0; P.face=1;
  if(opt.stain) drops.push({kind:'gold',x:opt.stain.x,y:opt.stain.y-6,vx:0,vy:0,n:opt.stain.n,big:true});
  cam.x=clamp(P.x-W/2,0,L.w*T-W); cam.y=clamp(P.y-H*.6,0,L.h*T-H);
  U.uAmb.value.set(pal.amb[0],pal.amb[1],pal.amb[2]);
  $('#floorName').textContent=def.name; $('#actTxt').textContent=def.act+(typeof diffLabel==='function'&&def.kind!=='cabin'?' · '+diffLabel():''); $('#floorJp').textContent=def.jp||'';
  targetE=null; lastHud=''; updBelt(); AU.setTension(0); deathShown=false; L.dark=0; L.cand=null; L.gaze=null; dropQ=[]; dropSlow=0; P.streak=0; $('#drolls').innerHTML=''; dropActive=null;
  if(!opt.noSave) saveGame(); }
function nextLevel(){ const ni=lvlIdx+1; if(ni>=LEVELS.length){ if(typeof META==='undefined'||META.hold===false) ngp++; goLevel(1); return; } goLevel(ni); }
function goLevel(i){ if(cut){ cut=null; bars(false); caption(''); fadeTarget=1; } const prevAct=LEVELS[lvlIdx]&&LEVELS[lvlIdx].act; loadLevel(i); const act=LEVELS[i].act; mode='play'; hud.hidden=false;
  const begin=()=>{ mode='play'; hud.hidden=false; bark('start',true); setTimeout(()=>epigraph(LEVELS[i].id),400); if(typeof MUS!=='undefined') MUS.setMood(moodFor(LEVELS[i])); };
  if(act!==prevAct||ngp&&i===1) { mode='card'; actCard(act,begin); } else begin(); }
function finishLevel(){ /* v21: never leave a level in the same breath it opened, or while its exit is barred */
  if(L&&L.def.kind!=='cabin'&&(performance.now()-(L.bornAt||0)<800||L.locked||L.noExit)) return;
  AU.door(); const def=LEVELS[lvlIdx];
  if(def.id==='count'){ playEnding(); return; }
  mode='card'; merchantCard(()=>nextLevel()); }
function respawn(){ if(typeof MUS!=='undefined') MUS.setMood(moodFor(LEVELS[lvlIdx])); const stain=P.gold>0?{x:P.x,y:Math.min(P.y,L.h*T-T),n:P.gold}:null; P.gold=0; P.life=P.stats.life; P.grit=100; P.rage=0; P.potions=Math.max(P.potions,POT_MAX); updBelt();
  loadLevel(lvlIdx,{stain,noSave:true}); mode='play'; hud.hidden=false; $('#death').hidden=true; bark('respawn',true); }
function onDeath(){ if(deathShown) return; deathShown=true; mode='death'; hud.hidden=true; const el=$('#death'); el.hidden=false;
  const dl=pick(DEATH_LINES); $('#death .shi').textContent=dl.k; $('#deathLine').textContent=dl.t; if(typeof MUS!=='undefined') MUS.setMood('silent');
  $('#deathSub').textContent=`Back to the start of ${LEVELS[lvlIdx].name}.${P.gold>0?` Your ${P.gold} crowns lie where you fell.`:''}`;
  setTimeout(()=>{ if(mode==='death') respawn(); },2600); }

/* ---------- story set pieces ---------- */
function openingCut(){ L.redHour=0; playCut([
  {dur:3.4,cap:OPENING[0].cap,jp:OPENING[0].jp,cam:{x:P.x+200,y:P.y-40},fade:1},
  {dur:4.2,zoom:1.08,cap:OPENING[1].cap,jp:OPENING[1].jp,cam:{x:P.x+120,y:P.y-30},fn:()=>spawnBG('fireball')},
  {dur:4.2,cap:OPENING[2].cap,jp:OPENING[2].jp,cam:{x:P.x+40,y:P.y-30},fn:()=>spawnBG('lightning')},
  {dur:4,zoom:1.3,cap:OPENING[3].cap,jp:OPENING[3].jp,cam:{x:P.x,y:P.y-20},fn:()=>cutIn('hero','','九十夜目',1.6)}
],()=>{ mode='card'; showCard({title:'Prologue — The Hollowmere Wall',jp:'序章　ホロウミアの城壁',body:'The Host is on the wall. You have a shirt, a cloak, and two bare hands. There is a dead man ahead who will not need his sword.',buttons:[{label:'Go',fn:()=>{ hideCard(); mode='play'; hud.hidden=false; bark('bare',true); }}]}); }); }
function redHourCut(){ L.redDone=true; L.noExit=true; P.vx=0; P.attack=null; for(const e of enemies) if(!e.dead) e.stun=99;
  playCut([
  {dur:1.6,cap:'',cam:{x:P.x+100,y:P.y-80},fn:()=>{ AU.wind(); AU.setTension(.8); }},
  {dur:3.6,cap:'Then the sky opened.',jp:'そして、空が裂けた。',cam:{x:P.x+100,y:P.y-90},tick:(dt)=>{ L.wound=Math.min(1,(L.wound||0)+dt*.35); shake(2); }},
  {dur:3.8,zoom:1.15,cap:'Varhollow raised his crown to it. Something above us answered.',jp:'伯爵は冠を掲げ、空の何かが応えた。',cam:{x:P.x+130,y:P.y-80},fn:()=>cutIn('count','Count Varhollow','伯爵',1.6),tick:(dt)=>{ L.redHour=Math.min(1,(L.redHour||0)+dt*.5); }},
  {dur:3.2,zoom:1.25,cap:'Every soul on the wall was offered up.',jp:'城壁の魂はすべて捧げられた。',fn:()=>{ cutIn('wound','','捧げ物',1.4); AU.scream(); for(const e of enemies) if(!e.dead){ e.hp=0; killEnemy(e,1,false); } },cam:{x:P.x+60,y:P.y-40}},
  {dur:2.4,cap:'The stone gave way.',jp:'石が崩れた。',fn:()=>{ AU.boom(1.2); AU.slam(); impactT=.2; },tick:(dt,t)=>{ shake(9); if(R()<.8) part({x:camR.x+rnd(0,W),y:camR.y+rnd(H*.5,H),vx:rnd(-30,30),vy:rnd(-60,40),g:600,life:rnd(.6,1.2),col:pick(pal.stone),size:ri(2,4)}); P.y+=t>1.2?dt*200:0; }},
  {dur:1.2,cap:'',fade:0,fn:()=>{ U.uWhite.value=1; }},
  {dur:3.2,cap:'You fell a long way.',jp:'長い、長い落下。',fade:0},
  {dur:3.4,cap:'Far enough that the light became a rumour.',jp:'光が噂になるほど深く。',fade:0}
  ],()=>{ L.redHour=0; L.wound=0; U.uRed.value=0; fadeTarget=1; lvlIdx=0; goLevel(1); }); }
function bossIntro(e){ const short=seenIntro[e.kind]; seenIntro[e.kind]=1; AU.setTension(.6);
  const steps=short?[{dur:1.8,zoom:1.15,cam:{x:e.x,y:e.y-40},fn:()=>{ showBossName(e.name,e.jp,BOSSES[e.kind].sub); AU.roar(); cutIn(e.kind,e.name,e.jp,1.4); }}]
    :[{dur:1.8,zoom:1.05,cam:{x:e.x,y:e.y-40},cap:'',fn:()=>{ AU.wind(); }},{dur:2,zoom:1.3,cam:{x:e.x,y:e.y-e.h*.6},fn:()=>{ cutIn(e.kind,e.name,e.jp,1.9); AU.roar(); shake(6); }},{dur:2.8,zoom:1.12,cam:{x:e.x,y:e.y-40},fn:()=>{ showBossName(e.name,e.jp,BOSSES[e.kind].sub); AU.roar(); shake(9); impactT=.08; }},{dur:1.1,zoom:1.2,cam:{x:P.x+30,y:P.y-30},fn:()=>{ cutIn('hero','',BOSSES[e.kind].jp?'抜刀':'',1); }}];
  steps.keepMood=1; if(typeof MUS!=='undefined') MUS.setMood('boss');
  playCut(steps,()=>{ e.intro=false; AU.setTension(1); L.locked=true; e.cd=1; if(typeof MUS!=='undefined') MUS.setMood('boss'); }); }
function bossDefeated(e){ const B=BOSSES[e.kind]; e.dead=true; e.deadT=0; fx=fx.filter(f=>!f.haz); projs=projs.filter(p=>p.from==='p');
  for(const o of enemies) if(!o.boss&&!o.dead){ o.hp=0; o.dead=true; o.deadT=0; ash(o.x,o.y-8,8); }
  AU.roar(); AU.kill(); shake(12); impactT=.25; freeze=.3; bossSlow=2.4; AU.setTension(0);
  gainXP(B.xp*(1+ngp*.5)); for(let i=0;i<5;i++) dropGold(e.x+rnd(-30,30),e.y-30,Math.round(ri(10,20)*(1+dep()*.6)));
  unlockCodex(BOSS_CODEX[e.kind]); camZT=1.25; if(typeof MUS!=='undefined') MUS.setMood('calm');
  setTimeout(()=>{ showBossName('Silenced','討伐',`${e.name} will not rise again.`); },900); setTimeout(()=>{ camZT=1; caption(BOSS_FAREWELL[e.kind]||''); setTimeout(()=>caption(''),3800); },2400);
  fx.push({t:0,dur:3,upd(f){ if(f.t>=2.6&&!f.done){ f.done=true; chests.push({x:L.w*T/2,y:-30,tier:2,open:false,t:0,falling:true,vy:0}); AU.wind(); L.locked=false; L.noExit=false; if(e.kind==='count'){ L.wound=0; } } }}); }
function playEnding(){ playCut(ENDING.map((s,i)=>({dur:4.4,cap:s.cap,jp:s.jp,fade:i<2?1:.25,cam:{x:P.x+40,y:P.y-60},tick:(dt)=>{ U.uRed.value=Math.max(0,U.uRed.value-dt*.3); }})),()=>{ mode='card'; showCard({title:'The war is over.',jp:'戦は終わった。',body:'The Pit is not. It is still down there, under the city, under the grass, patient as a debt. Some nights you hear it calling the crows.',
    buttons:[{label:'Go home',fn:()=>{ hideCard(); campaignCleared(); }},{label:'Rest',ghost:1,fn:()=>{ hideCard(); campaignCleared(true); toTitle(); }}]}); }); }

/* ---------- input: menus ---------- */
function uiKey(k,e){ const m0=mode; /* a key that closes a screen must not also act in the world */
  if(mode==='cut'&&(k==='Enter'||k==='space'||k==='e'||k==='Escape')){ e.preventDefault(); skipCut(); return; }
  if(mode==='inv'&&(k==='i'||k==='Tab'||k==='Escape'||k==='t')){ e.preventDefault(); if((k==='t'&&$('#paneTree').hidden)||(k==='i'&&$('#paneBag').hidden)){ setTab(k==='t'?'tree':'bag'); return; } toggleInv(false); return; }
  if(mode==='play'&&(k==='i'||k==='Tab'||k==='t'||k==='c')){ e.preventDefault(); toggleInv(true,k==='t'?'tree':k==='c'?'codex':'bag'); return; }
  if(mode==='play'&&k==='Escape'){ e.preventDefault(); openPause(); return; }
  if(mode==='pause'&&(k==='Escape'||k==='Enter')){ e.preventDefault(); closePause(); return; }
  if(mode==='case'&&caseState&&!caseState.landed&&(k==='e'||k==='Enter'||k==='space'||k==='Escape')){ e.preventDefault(); caseState.skip=true; return; } /* v25: skip the spin */
  if(mode==='case'&&caseState&&caseState.landed){ if(reveal){ if(k==='e'||k==='Enter'||k==='space'||k==='Escape'){ e.preventDefault(); reveal.finish(); } return; }
    if(caseState.ready){ if(k==='e'||k==='Enter'){ e.preventDefault(); closeCase(true); } else if(k==='Escape') closeCase(false); } }
  if(m0==='play'&&mode==='play'&&k==='e'&&interact){ interact.act(); }
  if(mode==='death'&&(k==='Enter'||k==='space')) respawn(); }

/* ---------- render ---------- */
function tileBG(img,off,y){ const w=img.width; let ox=-(((off%w)+w)%w); for(let x=ox;x<W;x+=w) ctx.drawImage(img,Math.round(x),Math.round(y)); }
function drawHeroAndFX(){
  const pose=heroPose(), br=heroBr();
  if(P.shade){ const sh=P.shade, sv=[P.x,P.y,P.face,P.swordA,P.attack]; P.x=sh.x; P.y=sh.y; P.face=sh.face; P.swordA=sh.ang!=null?sh.ang:P.swordA; P.attack=null;
    blit(drawHero,sh.x,sh.y,sh.face,{alpha:.5,outline:'#1a0a24',ghost:'rgba(120,80,200,.55)'}); [P.x,P.y,P.face,P.swordA,P.attack]=sv; }
  for(const gh of ghosts){ const sv=[P.swordA,P.offA]; P.swordA=gh.a; P.offA=gh.oa??P.offA; blit(drawHero,gh.x,gh.y,gh.face,{alpha:gh.life*2.4,outline:'#3a5070',noOutline:true}); [P.swordA,P.offA]=sv; }
  const blink=P.inv>0&&!P.dead&&P.hurtT<=0&&P.dash<=0&&P.ghostT<=0&&Math.floor(time*20)%2===0;
  if(!blink) blit(drawHero,P.x,P.y,P.face,{flash:P.hurtT>0?.4:0,rot:pose.rot,sx:pose.sx,sy:pose.sy,rim:heroRim(),alpha:P.ghostT>0?.55:1,ghost:P.ghostT>0?'rgba(200,210,255,.7)':null});
  gearFX(pose,br);
  if(P.iai&&P.iai.ready) emisAt(P.x,P.y,P.face,g=>{ g.fillStyle=`rgba(255,250,240,${(.5+.5*Math.sin(time*30)).toFixed(2)})`; g.fillRect(-4,-14,3,1); },pose);
  const a=P.attack;
  if(a){ const mv=a.mv, pr=a.t/a.dur, it=a.hand==='off'?P.equip.off:P.equip.weapon, blen=(it?it.base.len:4)+12, shx=a.hand==='off'?-1:1;
    if(mv.t==='thrust'){ if(pr>.25&&pr<.68){ const k=1-(pr-.25)/.43; emisAt(P.x,P.y,P.face,g=>{ for(let i=0;i<5;i++){ g.fillStyle=`rgba(255,236,210,${(.8*k*(1-i*.15)).toFixed(2)})`; g.fillRect(-14+i*4+(it?0:10),-25+i*2,(it?blen+22:14)-i*(it?7:3),1); } },pose); } }
    else if(mv.t==='plunge'){ emisAt(P.x,P.y,1,g=>{ g.fillStyle='rgba(255,236,210,.5)'; for(let i=-2;i<=2;i++) g.fillRect(i*3,-50-Math.abs(i)*5,1,32); }); }
    else if(mv.t!=='shoot'&&pr>mv.act[0]*.8&&pr<mv.act[1]+.18&&a.prev.length>1){ const a0=a.prev[0], a1=a.hand==='off'?P.offA:P.swordA; const cw=a1>a0; const k=1-clamp((pr-mv.act[0])/(mv.act[1]+.18-mv.act[0]),0,1)*.7;
      emisAt(P.x,P.y,P.face,g=>{ g.translate(shx,-18+br); const R1=blen; g.fillStyle=`rgba(255,236,210,${(.85*k).toFixed(2)})`; g.beginPath(); g.arc(0,0,R1,a0,a1,!cw); g.arc(0,0,R1-3,a1,a0,cw); g.closePath(); g.fill();
        g.fillStyle=`rgba(190,36,28,${(.38*k).toFixed(2)})`; g.beginPath(); g.arc(0,0,R1-3,a0,a1,!cw); g.arc(0,0,Math.max(4,R1-9),a1,a0,cw); g.closePath(); g.fill(); },pose); } }
  if(P.shade&&P.shade.atk&&P.shade.atk.t>0&&P.shade.atk.prev.length>1){ const sa=P.shade.atk, pr=sa.t/sa.dur; if(pr>sa.mv.act[0]&&pr<sa.mv.act[1]+.1){ const a0=sa.prev[0], a1=P.shade.ang, cw=a1>a0; emisAt(P.shade.x,P.shade.y,P.shade.face,g=>{ g.translate(1,-18); g.fillStyle='rgba(160,120,255,.6)'; g.beginPath(); g.arc(0,0,32,a0,a1,!cw); g.arc(0,0,28,a1,a0,cw); g.closePath(); g.fill(); }); } }
  const wi=P.equip.weapon; if(wi&&!P.dead&&wi.base.len){ const L_=wi.base.len, ab=wi.rarity===5; if(wi.rarity>=4){ const pulse=.5+.5*Math.sin(time*4);
      emisAt(P.x,P.y,P.face,g=>{ g.translate(1+armExt('main'),-18+br); g.rotate(P.swordA); g.fillStyle=(ab?(Math.sin(time*6.3)>0?'rgba(220,36,22,':'rgba(150,60,255,'):wi.rarity===4?'rgba(255,110,190,':'rgba(240,190,120,')+(.1+pulse*.12).toFixed(2)+')'; g.fillRect(10,-1,L_,1); },pose);
      addLight(P.x,P.y-20,ab?55:40,ab?.45:.3,1,ab?.2:.75,ab?.14:.45); if(ab&&R()<.3) part({x:P.x+rnd(-10,10),y:P.y-rnd(10,30),vx:rnd(-10,10),vy:rnd(-30,-10),g:-10,life:rnd(.4,.8),em:true,col:'#ff3a2a'}); }
    else if(wi.rarity>=1){ const gc=hex(RCOL[wi.rarity]); emisAt(P.x,P.y,P.face,g=>{ g.translate(1+armExt('main'),-18+br); g.rotate(P.swordA); g.fillStyle=`rgba(${gc[0]},${gc[1]},${gc[2]},${(.02+wi.rarity*.014).toFixed(3)})`; g.fillRect(10,-1,L_,1); },pose); } }
  if(P.teth){ const t=P.teth, ox=P.x+P.face*4, oy=P.y-18; let tx, ty; if(t.state==='pull'){ tx=t.tgt?t.tgt.x:t.px; ty=t.tgt?t.tgt.y-t.tgt.h/2:t.py; } else { tx=ox+t.dx*t.len; ty=oy+t.dy*t.len; }
    const n=Math.max(2,Math.floor(Math.hypot(tx-ox,ty-oy)/4)); for(let i=0;i<=n;i++){ const k=i/n; const x=lerp(ox,tx,k)-camR.x, y=lerp(oy,ty,k)-camR.y+Math.sin(k*Math.PI+time*30)*(t.state==='out'?1.2:0); ectx.fillStyle=i%2?'rgba(220,30,20,.95)':'rgba(120,10,8,.9)'; ectx.fillRect(x|0,y|0,2,2); }
    addLight(tx,ty,30,.6,1,.2,.1); }
  if(P.clarT>0) emisAt(P.x,P.y,1,g=>{ g.strokeStyle=`rgba(200,220,255,${(.25*P.clarT).toFixed(2)})`; g.lineWidth=1; g.beginPath(); g.ellipse(0,-14,24,30,0,0,Math.PI*2); g.stroke(); });
  addLight(P.x,P.y-16,85,.55,.85,.75,.62); }
function render(){
  const sh=shakeV; camR.x=Math.round(clamp(cam.x+rnd(-1,1)*sh,0,Math.max(0,L.w*T-W))); camR.y=Math.round(clamp(cam.y+rnd(-1,1)*sh,0,Math.max(0,L.h*T-H)));
  const maxY=Math.max(1,L.h*T-H);
  lights.length=0; beginFrame(); ctx.globalAlpha=1;
  tileBG(BG.far,camR.x*.1,-20-(camR.y/maxY)*20);
  drawBGEvents();
  tileBG(BG.mid,camR.x*.35,-50*(camR.y/maxY));
  drawWeather(); if(typeof drawDepthFog==='function') drawDepthFog();
  ctx.drawImage(LV,camR.x,camR.y,W,H,0,0,W,H);
  const ex=L.exit.x*T+8, ey=L.exit.y*T;
  if(ex-camR.x>-60&&ex-camR.x<W+60){ const sx=ex-camR.x, sy=ey-camR.y;
    if(L.locked||L.noExit){ for(let x=-16;x<=16;x+=4) rect(ctx,Math.round(sx+x),Math.round(sy-76),2,76,'#1e1a1e'); rect(ctx,Math.round(sx-18),Math.round(sy-40),36,2,'#2a2428'); }
    else { for(let i=0;i<6;i++){ const fl=.5+.5*Math.sin(time*3+i*1.7); ectx.fillStyle=`rgba(220,60,40,${(.25+fl*.5).toFixed(2)})`; ectx.fillRect(sx-24,sy-74+i*11,2,5); ectx.fillRect(sx+22,sy-74+i*11,2,5); }
      const gg=ectx.createLinearGradient(0,sy-70,0,sy); gg.addColorStop(0,'rgba(120,20,16,0)'); gg.addColorStop(1,'rgba(150,30,20,.35)'); ectx.fillStyle=gg; ectx.fillRect(sx-17,sy-70,34,70); addLight(ex,ey-30,130,.8,1,.25,.18); } }
  for(const tc of L.torches){ const wx=tc.x*T+8, wy=tc.y*T+6; const sx=wx-camR.x, sy=wy-camR.y; if(sx<-100||sx>W+100||sy<-100||sy>H+100) continue;
    const fl=Math.sin(time*14+tc.x)*.5+Math.sin(time*23+tc.x*2)*.5;
    rect(ctx,sx-2,sy,5,2,'#2a2428'); rect(ctx,sx,sy+2,1,5,'#2a2428');
    ectx.fillStyle='rgba(255,90,30,.7)'; ectx.fillRect(sx-2,sy-2,5,2); ectx.fillStyle='#ff9a3c'; ectx.fillRect(sx-1,Math.round(sy-5-fl),3,Math.round(4+fl)); ectx.fillStyle='#ffe1a0'; ectx.fillRect(sx,sy-3,1,2);
    addLight(wx,wy-2,100+fl*7,1+fl*.1,1,.55,.25);
    if(R()<.05) part({x:wx+rnd(-1,1),y:wy-5,vx:rnd(-8,8),vy:rnd(-40,-20),g:-6,life:rnd(.6,1.4),em:true,col:pick(['#ff9a3c','#ffcf7a'])}); }
  drawPlats(); drawHazards();
  if(L.relic){ const r=L.relic; blit(g=>relicDraw(g,r.taken),r.x,r.y,1);
    if(!r.taken){ const gl=.5+.5*Math.sin(time*3); emisAt(r.x,r.y,1,g=>{ g.fillStyle=`rgba(255,235,200,${(.25+gl*.45).toFixed(2)})`; g.fillRect(12,-22,1,24); }); addLight(r.x+12,r.y-12,44,.35+gl*.2,1,.85,.65); } }
  for(const c of chests){ blit(g=>drawChest(g,c),c.x,c.y,1);
    if(!c.open){ const gl=.5+.5*Math.sin(time*2.4+c.x); if(c.tier===2){ addLight(c.x,c.y-10,90,.8+gl*.3,1,.25,.15); emisAt(c.x,c.y,1,g=>{ g.fillStyle=`rgba(255,60,40,${(.4+gl*.4).toFixed(2)})`; g.fillRect(-14,-4,28,1); g.fillRect(-1,-12,2,2); }); }
      else if(c.tier){ addLight(c.x,c.y-8,60,.6+gl*.3,1,.8,.4); emisAt(c.x,c.y,1,g=>{ g.fillStyle=`rgba(255,200,120,${(.25+gl*.35).toFixed(2)})`; g.fillRect(-9,-12,18,1); }); } else addLight(c.x,c.y-8,36,.25+gl*.15,1,.85,.6);
      if(c.secret) emisAt(c.x,c.y-30,1,g=>{ g.fillStyle=`rgba(255,240,200,${(.2+gl*.3).toFixed(2)})`; g.fillRect(0,0,1,1); }); }
    else if(c.t<1.2){ const k=1-c.t/1.2; addLight(c.x,c.y-12,90*k+20,1.4*k,1,.8,.5); } }
  drawDrops(); drawEnemies(); drawHeroAndFX(); drawLiquids(); drawProjs(); drawFX(); drawParts(); drawBossOverlays();
  for(const f of L.fg){ const sx=Math.round(f.x-camR.x*1.3); if(sx<-40||sx>W+10) continue; rect(ctx,sx,0,f.w,H,'#070405'); rect(ctx,sx,0,1,H,'#1d1416'); rect(ctx,sx+f.w-2,0,2,H,'#030202');
    if(f.chain){ for(let y=0;y<120;y+=4) rect(ctx,sx+f.w+8,y,2,3,'#0a0708'); rect(ctx,sx+f.w+6,120,6,4,'#0a0708'); } }
}

/* ---------- update loop ---------- */
function update(dt){
  updPlayer(dt);
  for(const e of enemies) updEnemy(e,dt);
  enemies=enemies.filter(e=>!(e.dead&&e.deadT>2.4&&!e.boss)||(e.boss&&e.deadT<3));
  updProjs(dt); updDrops(dt); updPlats(dt); updFX(dt); updParts(dt); updBG(dt); updHazards(dt); updArenas(dt);
  if(P.streakT>0){ P.streakT-=dt; if(P.streakT<=0){ if(P.streak>=12) bark('kill',true); P.streak=0; } }
  for(const c of chests){ if(c.open) c.t+=dt; if(c.falling){ c.vy+=900*dt; c.y+=c.vy*dt; const f=c.floorY||FLOOR(); if(c.y>=f){ c.y=f; c.falling=false; AU.boom(1); AU.slam(); shake(9); dust(c.x,c.y,20); impactT=.06; } } }
  for(const g of ghosts) g.life-=dt; ghosts=ghosts.filter(g=>g.life>0);
  targetT-=dt; barkT-=dt; barkCd-=dt; if(barkT<=0) $('#bark').classList.remove('on');
  const tx=P.x-W/2+P.face*28, ty=P.y-H*.6+(P.vy>200?40:0);
  cam.x=lerp(cam.x,tx,Math.min(1,dt*5)); cam.y=lerp(cam.y,ty,Math.min(1,dt*(L.surface?3:4.5)));
  cam.x=clamp(cam.x,0,Math.max(0,L.w*T-W)); cam.y=clamp(cam.y,0,Math.max(0,L.h*T-H));
  interact=P.dead?null:findInteract();
  if(L.def.id==='wall'&&!L.redDone&&P.x>(L.exit.x-10)*T) redHourCut();
  const boss=enemies.find(e=>e.boss); if(boss&&boss.intro&&bossIntroReady(boss)) bossIntro(boss);
  for(const e of enemies) if(!e.dead&&!e.seenC&&(e.unique||e.type==='debtor')&&Math.abs(e.x-P.x)<200&&Math.abs(e.y-P.y)<100){ e.seenC=1; if(e.unique){ cutIn('hero',e.name,'名有る者',1.3); AU.roar(); camZT=1.1; setTimeout(()=>{ camZT=1; },1200); } }
  if(P.dead&&P.deadT>1.3) onDeath();
}
function bossIntroReady(b){ return P.x>9*T; }
function passive(dt){ updParts(dt); updBG(dt); updPlats(dt); for(const e of enemies) e.anim+=dt; for(const g of ghosts) g.life-=dt; ghosts=ghosts.filter(g=>g.life>0); }
let last=performance.now();
function frame(now){
  requestAnimationFrame(frame);
  const rdt=clamp((now-last)/1000,0,.05); last=now; time+=rdt;
  if(P&&P.clarT>0) P.clarT-=rdt; bossSlow-=rdt; if(dropSlow>0) dropSlow-=rdt;
  timeScale=P&&P.dead&&!COOP?.3:bossSlow>0?.3:(P&&P.clarT>0)?.35:dropSlow>0?.75:1;
  camZ=lerp(camZ,camZT,Math.min(1,rdt*3)); if(Math.abs(camZ-camZT)<.002) camZ=camZT;
  if(P&&L){ const f=cut&&cut.s&&cut.s.cam?cut.s.cam:{x:P.x,y:P.y-16}; camPX=lerp(camPX,clamp(f.x-camR.x,0,W),Math.min(1,rdt*4)); camPY=lerp(camPY,clamp(f.y-camR.y,0,H),Math.min(1,rdt*4)); }
  if(mode==='play'){ if(freeze>0){ freeze=Math.min(freeze,lastKillT>time-.05?0:.025); freeze-=rdt; } if(freeze<=0){ let left=rdt*timeScale; while(left>1e-5){ const st=Math.min(left,1/60); update(st); left-=st; } } }
  else if(mode==='cut'){ updCut(rdt); passive(rdt); updFX(rdt); for(const c of chests) if(c.open) c.t+=rdt; }
  else if(mode==='pause'){ /* the world holds its breath */ }
  else if(mode==='title'){ passive(rdt); cam.x=lerp(cam.x,clamp(P.x-W*.35+Math.sin(time*.1)*60,0,L.w*T-W),.02); }
  shakeV=Math.max(0,shakeV-rdt*22); hurtV=Math.max(0,hurtV-rdt*2.2); impactT-=rdt;
  U.uWhite.value=mode==='cut'?Math.min(.25,Math.max(0,U.uWhite.value-rdt*1.6)):0; U.uSlow.value=lerp(U.uSlow.value,P&&P.clarT>0?1:0,.12);
  U.uRed.value=lerp(U.uRed.value,L&&(L.redHour||(L.def.id==='count'&&L.wound))?Math.max(L.redHour||0,(L.wound||0)*.6):0,.04);
  U.uFade.value=lerp(U.uFade.value,mode==='death'?.4:fadeTarget,.08);
  render();
  if(mode==='play') updHud();
  updLabels();
  const ln=lights.length; for(let i=0;i<LMAX;i++){ if(i<ln){ const l=lights[i]; uL[i].set(l[0],l[1],l[2],l[3]); uC[i].set(l[4],l[5],l[6]); } }
  U.uN.value=ln; U.uTime.value=time; U.uImpact.value=0; U.uHurt.value=hurtV;
  tBase.needsUpdate=true; tEmis.needsUpdate=true; renderer.render(scene,camera);
}

/* ---------- title + boot ---------- */
function toTitle(){ mode='title'; hud.hidden=true; $('#title').hidden=false; $('#pause').hidden=true; if(typeof MUS!=='undefined') MUS.setMood('title'); camZT=1; P=newPlayer(); calcStats(); loadLevel(0,{noSave:true}); P.x=L.spawn.x+40; const sv=loadSave(); $('#contBtn').hidden=!sv;
  if(sv) $('#contBtn').textContent=`Continue · ${LEVELS[sv.lvlIdx].name}`; }
function newGame(){ AU.init(); store.del(SAVEKEY); ngp=0; seenIntro={}; CODEX_OPEN=new Set(); VOWS_TAKEN={}; P=newPlayer(); calcStats(); P.life=P.stats.life; $('#title').hidden=true; loadLevel(0); openingCut(); }
function continueGame(){ AU.init(); const sv=loadSave(); if(!sv){ newGame(); return; } ngp=sv.ngp||0; CODEX_OPEN=new Set(sv.codex||[]); VOWS_TAKEN=sv.vows||{}; seenIntro=sv.seen||{}; restorePlayer(sv.P); $('#title').hidden=true; lvlIdx=Math.max(0,sv.lvlIdx-1); goLevel(sv.lvlIdx); }
$('#startBtn').onclick=newGame; $('#contBtn').onclick=continueGame;
if(matchMedia('(pointer: coarse)').matches){ const tc=$('#touch'); tc.hidden=false;
  const B=[['◀','a','2%','auto','auto','8%'],['▶','d','11%','auto','auto','8%'],['▼','s','6.5%','auto','auto','20%'],['Jump','space','auto','2%','auto','8%'],['Strike','j','auto','11%','auto','17%'],['Off','k','auto','20%','auto','26%'],['Roll','Shift','auto','20%','auto','8%'],['E','e','auto','2%','auto','26%'],['1','1','auto','11%','auto','35%'],['2','2','auto','2%','auto','44%'],['Bag','i','auto','2%','2%','auto']];
  for(const [lab,k,l,r,t,b] of B){ const bt=document.createElement('button'); bt.textContent=lab; bt.setAttribute('aria-label',lab); Object.assign(bt.style,{left:l,right:r,top:t,bottom:b});
    bt.addEventListener('pointerdown',e=>{ e.preventDefault(); e.stopPropagation(); if(!keys[k]&&ACT[k]&&mode==='play') buf[ACT[k]]=time; keys[k]=true; uiKey(k,{preventDefault(){}}); });
    const up=()=>{keys[k]=false;}; bt.addEventListener('pointerup',up); bt.addEventListener('pointercancel',up); bt.addEventListener('pointerleave',up); tc.appendChild(bt); } }
/* boot moved to boot.js so later modules can hook in first */

/* ---------- blood arenas: the gates close, the waves come ---------- */
function setDoors(a,on){ for(let y=a.oy+10;y<=a.oy+13;y++){ for(const x of [a.ox,a.ox+RW-1]){ if(on){ if(L.g[y][x]===0) { L.g[y][x]=1; (a.closed=a.closed||[]).push([x,y]); } } } } if(!on&&a.closed){ for(const [x,y] of a.closed) L.g[y][x]=0; a.closed=[]; } }
function spawnWave(a){ a.wave++; const def=L.def, n=ngp===0?2+a.wave+Math.floor(dep()/4):3+a.wave*2+Math.min(ngp,4)*3+Math.floor(dep()/3); a.list=[]; AU.roar(); shake(4);
  showBossName(`Wave ${a.wave} of ${a.waves}`,['一','二','三','四'][a.wave-1]||'',a.wave===a.waves?'The last of them.':'');
  for(let i=0;i<n;i++){ const pk=def.packs?pick(def.packs).t:wpick(def.enemies); const t=(pk==='hanged'||pk==='spitter')?'ghoul':pk; const fly=EDEF[t].fly; const x=(a.ox+ri(3,RW-4))*T+8, y=fly?(a.oy+ri(5,8))*T:(a.oy+14)*T;
    const e=mkEnemy({x:x/T,y:y/T,t,pack:i>1?1:0,leader:a.wave===a.waves&&i===0?1:0}); if(!fly){ e.y=(a.oy+4)*T; e.vy=50; } e.atkCd=1+R(); a.list.push(e); enemies.push(e); ash(x,(a.oy+12)*T,10); }
  if(a.wave===a.waves&&R()<.6){ const t=wpick(def.enemies); const s0={x:(a.ox+RW/2),y:a.oy+4,t:EDEF[t].fly||t==='hanged'||t==='spitter'?'brute':t}; const e=mkEnemy(s0); if(!e.rare&&!e.champ){ const ks=Object.keys(MODS); rankUp(e,'rare',[pick(ks),pick(ks)].filter((v,i,a)=>a.indexOf(v)===i),pick(RN1)+' '+pick(RARE2)); } a.list.push(e); enemies.push(e); }
  a.next=1.4; }
function updArenas(dt){ if(!L.arenas) return; for(const a of L.arenas){
  if(a.state===0){ if(!a.hold&&P.x>a.x0+4*T&&P.x<a.x1-4*T&&P.y>a.y0&&P.y<a.y1&&!P.dead){ a.state=1; setDoors(a,1); AU.chain(); AU.slam(); shake(6); a.wave=0; a.next=1.2; a.list=[]; cutIn('hero','Blood Arena','血の闘技場',1.3); if(typeof MUS!=='undefined') MUS.setMood('boss'); } }
  else if(a.state===1){ const alive=a.list.filter(e=>!e.dead).length; if(alive===0){ a.next-=dt; if(a.next<=0){ if(a.wave>=a.waves){ a.state=2; setDoors(a,0); AU.door(); AU.bell();
        chests.push({x:(a.ox+RW/2)*T,y:(a.oy+1)*T,tier:1,open:false,t:0,falling:true,vy:0,floorY:(a.oy+14)*T}); toast('The arena falls silent. Something drops from the dark.'); gainXP(40*(1+dep())); if(typeof MUS!=='undefined') MUS.setMood(moodFor(L.def)); }
      else spawnWave(a); } } } } }
/* ---------- pause ---------- */
function openPause(){ mode='pause'; $('#pause').hidden=false; hud.hidden=true; $('#pMus').value=SETTINGS.music; $('#pSfx').value=SETTINGS.sfx; const c=CODEX.filter(x=>CODEX_OPEN.has(x.id)); $('#pLore').textContent=c.length?(()=>{ const x=pick(c); return `${x.k}　${x.t}. ${x.x}`; })():'The Pit is quiet for one breath. Use it.'; $('#pResume').focus({preventScroll:true}); }
function closePause(){ $('#pause').hidden=true; mode='play'; hud.hidden=false; }
$('#pResume').onclick=closePause; $('#pBag').onclick=()=>{ $('#pause').hidden=true; toggleInv(true,'bag'); }; $('#pCodex').onclick=()=>{ $('#pause').hidden=true; toggleInv(true,'codex'); };
$('#pTitle').onclick=()=>{ saveGame(); toTitle(); };
$('#pMus').oninput=e=>{ SETTINGS.music=+e.target.value; AU.setVol(); store.set('marrowdeep.settings',SETTINGS); };
$('#pSfx').oninput=e=>{ SETTINGS.sfx=+e.target.value; AU.setVol(); store.set('marrowdeep.settings',SETTINGS); };
