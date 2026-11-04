'use strict';
/* ===== Ways 道 (v16): choose one of four ways to fight =====
   Offered at level 3 (and any time from the pause menu until you've chosen). Once chosen it can only be changed in the
   Rope-House, at the weapon rack's side, by opening the pause menu there.
   - 双弩 Twin Crossbows: a crossbow can go in either hand (no Second Hand needed for a crossbow), bolts pass through
     foes, and attack speed is 15% higher. Left-click a crossbow to fill your main hand first, then your off hand.
   - 双巨 Giant's Grip: a two-handed weapon in each hand (needs Second Hand). Both hands swing 15% slower. Right-click a
     two-hander in the satchel to put it in your off hand.
   - 抜刀 Battō, the Drawn Blade: the first blow after a breath (1.2 s without attacking) is a draw cut: always a
     critical strike and 50% stronger. Blows in a flurry deal 85%. A glint on the blade says it's ready.
   - 返し Kaeshi, the Counter: you take 20% less damage. Roll through an attack, or parry one, and your next blow within
     2 s is a riposte: triple damage, and it heals you 5%. Other blows deal 90%. */
const WAYS={
  xbows:{k:'双弩',n:'Twin Crossbows',d:'A crossbow in each hand, no Second Hand needed. Bolts pass through foes. +15% attack speed.'},
  giant:{k:'双巨',n:"Giant's Grip",d:'A two-handed weapon in each hand (needs Second Hand). Both swing 15% slower, at full strength.'},
  batto:{k:'抜刀',n:'Battō, the Drawn Blade',d:'Wait a breath between attacks and the next blow is a draw cut: always critical, 50% stronger. Flurries deal 85%.'},
  kaeshi:{k:'返し',n:'Kaeshi, the Counter',d:'Take 20% less damage. Roll through or parry an attack and your next blow is a riposte: triple damage, heals 5%. Other blows 90%.'}};
const wayIs=w=>!!P&&!P._remote&&P.way===w;
const BATTO_REST=1.2, RIPOSTE_T=2;

/* ---------- choosing ---------- */
function canChangeWay(){ return !P.way||(L&&L.def.kind==='cabin'); }
/* chooseWay(): the four-card chooser at the end of this file (v21) */
function setWay(id){ P.way=id; calcStats(); const w=WAYS[id]; toast(`${w.k} ${w.n.split(',')[0]} · ${(WAYS_SHORT[id]||[w.d])[0]}`); AU.lvl(); sparks(P.x,P.y-16,16,'#ffd27a'); saveGame(); }
/* the offer comes at level 3, at the start of a level rather than mid-fight */
(function(){ const o=goLevel; goLevel=function(i){ o(i); if(P&&!P.way&&P.lvl>=3&&LEVELS[i]&&LEVELS[i].kind!=='boss') setTimeout(()=>{ if(mode==='play'&&!P.way) chooseWay(); },1600); }; })();
(function(){ const o=openPause; openPause=function(){ o(); const col=$('#pause .col'); let b=$('#pWay'); if(!b&&col){ b=document.createElement('button'); b.className='btn ghost'; b.id='pWay'; col.insertBefore(b,$('#pCodex').nextSibling); }
  if(b){ const w=P.way&&WAYS[P.way]; b.innerHTML=w?`Way · ${w.k} ${w.n.split(',')[0]}`:'Choose your Way 道'; b.onclick=()=>{ $('#pause').hidden=true; chooseWay(()=>{ mode='play'; hud.hidden=false; }); }; } }; })();

/* ---------- hands ---------- */
(function(){ const o=offActive; offActive=function(){ const m=P.equip.weapon, f=P.equip.off; if(!f) return false;
  if(P.way==='giant'&&has('off')) return true;
  if(P.way==='xbows'&&f.base.cls==='xbow') return !(m&&m.base.h===2);
  return o(); }; })();
(function(){ const o=offComboFor; offComboFor=function(it){ if(it&&it.base.h===2) return {spear:['pike','sweep'],scythe:['reap'],sword:['slash','cleave'],axe:['chop','cleave'],mace:['cleave'],hammer:['smash'],katana:['kesa','cleave']}[it.base.cls]||['slash']; return o(it); }; })();
function placeIn(slot,i,it){ const old=P.equip[slot]; P.equip[slot]=it; bagSwapOut(i,old); calcStats(); AU.tone('triangle',420,300,.08,.12,.1); hideTip(); renderInv(); }
(function(){ const o=equipFromBag; equipFromBag=function(i,wantOff){ const it=P.bag[i]; if(!it||it.slot!=='weapon'||(typeof COOP!=='undefined'&&COOP&&NET.giveTo!=null)) return o(i,wantOff);
  if(P.way==='xbows'&&it.base.cls==='xbow'){ const m=P.equip.weapon; const slot=wantOff||(m&&m.base.cls==='xbow'&&!P.equip.off)?'off':'weapon'; if(typeof canWear==='function'&&!canWear(it)) return o(i,wantOff); placeIn(slot,i,it); return; }
  if(P.way==='giant'&&it.base.h===2&&wantOff&&has('off')){ if(typeof canWear==='function'&&!canWear(it)) return o(i,wantOff); placeIn('off',i,it); return; }
  return o(i,wantOff); }; })();
(function(){ const o=targetSlot; targetSlot=function(it){ if(it.slot==='weapon'&&P){ const m=P.equip.weapon;
    if(P.way==='xbows'&&it.base.cls==='xbow') return m&&m.base.cls==='xbow'&&!P.equip.off?'off':'weapon';
    if(P.way==='giant'&&it.base.h===2&&has('off')&&m&&m.base.h===2&&!P.equip.off) return 'off'; }
  return o(it); }; })();
/* the chest's Equip button: under Twin Crossbows a second crossbow goes straight to the off hand, no Second Hand needed */
(function(){ const o=equipItem; equipItem=function(it){ if(P.way==='xbows'&&it&&it.base.cls==='xbow'&&targetSlot(it)==='off'&&!has('off')){ if(typeof canWear==='function'&&!canWear(it)) return o(it);
    const old=P.equip.off; P.equip.off=it; if(old){ if(!bagAdd(old)) dropItem(old,P.x-P.face*10,P.y-10,true); } calcStats(); noteBest(it); AU.pickup(); toast(`Equipped ${it.name} in your off hand`); return true; }
  return o(it); }; })();
(function(){ const o=calcStats; calcStats=function(){ const r=o(); if(!P||!P.stats) return r; const s=P.stats;
  if(P.way==='xbows') s.as+=15;
  if(P.way==='giant'&&offActive()&&P.equip.off&&P.equip.off.base.h===2){ s.spd*=.85; s.ospd*=.85; }
  return r; }; })();
(function(){ const o=fireBolt; fireBolt=function(hand){ const n0=projs.length; o(hand); if(P.way==='xbows') for(let i=n0;i<projs.length;i++) if(projs[i].from==='p') projs[i].pierce=1; }; })();

/* ---------- Battō: the draw cut ---------- */
(function(){ const o=updPlayer; updPlayer=function(dt){ o(dt); if(!P||P._remote) return; if(P.attack) P._atkLast=time;
  if(wayIs('batto')&&!P.attack&&time-(P._atkLast||-9)>BATTO_REST&&!P._drawReady){ P._drawReady=true; AU.ting(); sparks(P.x+P.face*8,P.y-22,3,'#fff6e0'); }
  if(P.attack) P._drawReady=false; }; })();
(function(){ const o=startMove; startMove=function(name,ci,hand){ const ready=wayIs('batto')&&time-(P._atkLast||-9)>BATTO_REST; const r=o(name,ci,hand); if(P.attack&&!P._remote&&wayIs('batto')&&ready&&name!=='plunge'&&MV[name].t!=='shoot'){ P.attack.draw=1; } return r; }; })();
/* ---------- Kaeshi: the riposte ---------- */
function armRiposte(){ if(!wayIs('kaeshi')||P.ripT>time) return; P.ripT=time+RIPOSTE_T; AU.ting(); sparks(P.x,P.y-18,10,'#9ad0ff'); num(P.x,P.y-36,'!','#9ad0ff',true); }
(function(){ const o=hurtPlayer; hurtPlayer=function(d,src){ if(P&&!P._remote&&wayIs('kaeshi')&&!P.dead&&mode==='play'){ if(P.dash>0&&src&&!src.dead){ armRiposte(); return o(d,src); } d*=.8; } return o(d,src); }; })();
(function(){ const o=parry; parry=function(src){ o(src); armRiposte(); }; })();
(function(){ const o=strike; strike=function(e,mv,id,hand,dir,mult){ let m=mult==null?1:mult; const a=P&&P.attack; let forceCrit=false, rip=false;
  if(wayIs('batto')){ if(a&&a.id===id&&a.draw){ m*=1.5; forceCrit=true; } else m*=.85; }
  if(wayIs('kaeshi')){ if(P.ripT>time&&!e.dead){ m*=3; rip=true; } else m*=.9; }
  let r; if(forceCrit){ const c=P.clarT; P.clarT=Math.max(c,1e-4); try{ r=o(e,mv,id,hand,dir,m); } finally{ P.clarT=c; } } else r=o(e,mv,id,hand,dir,m);
  if(r&&forceCrit) num(e.x,e.y-e.h-14,'!','#fff6e0',true);
  if(r&&rip){ P.ripT=0; P.life=Math.min(P.stats.life,P.life+P.stats.life*.05); num(e.x,e.y-e.h-14,'!','#9ad0ff',true); AU.hit(true); shake(5); }
  return r; }; })();

/* ---------- v21: the chooser as four cards with art ----------
   Playtest: the four Ways were one long text card and the fourth button ran off the edge. Now: four cards side by
   side, each with a picture of the Way (the hero in your own armour holding the Way's weapons), a kanji, a name and
   three short lines. 1–4 or click to choose; Esc for later. */
const WAYS_SHORT={
  xbows:['A crossbow in each hand','Bolts pierce through foes','+15% attack speed · no Second Hand needed'],
  giant:['A two-hander in each hand','Both swing 15% slower','Needs Second Hand · right-click to fill the off hand'],
  batto:['Wait a breath (1.2 s) between swings','Then a draw cut: always crits, +50%','Quick follow-ups deal 85%'],
  kaeshi:['Take 20% less damage','Roll through or parry a blow → riposte ×3, heals 5%','Other blows deal 90%']};
const WAY_GEAR={xbows:['Hand Crossbow','Arbalest'],giant:['Zweihander','Great Axe'],batto:['Uchigatana',null],kaeshi:['Arming Sword','Buckler']};
function demoItem(name,r){ return name?deItem({s:'weapon',b:name,r:r||2,n:name,l:10,a:[]}):null; }
function wayArt(id){ const W_=104, H_=64, c=document.createElement('canvas'); c.width=W_; c.height=H_; const g=c.getContext('2d'); g.imageSmoothingEnabled=false;
  const px=(x,y,w,h,col)=>{ g.fillStyle=col; g.fillRect(Math.round(x),Math.round(y),w,h); };
  const bg=g.createLinearGradient(0,0,0,H_); bg.addColorStop(0,'#120c0c'); bg.addColorStop(1,'#060404'); g.fillStyle=bg; g.fillRect(0,0,W_,H_);
  px(0,54,W_,10,'#0c0808'); px(0,54,W_,1,'#2a1e1a'); for(let x=3;x<W_;x+=9) px(x,56,4,1,'#1a1210');
  const foe=(type,x,face,sil)=>{ if(typeof enemySprite!=='function') return; g.save(); g.translate(x,54); g.scale(face,1); g.globalAlpha=.9; enemySprite(type)(g); g.restore(); };
  /* the hero in your own armour, with the Way's weapons */
  const hero=(x,a)=>{ if(!P||typeof heroSprite!=='function') return; const sv={eq:Object.assign({},P.equip),way:P.way,off:offActive,sk:P.skills}, [m,o]=WAY_GEAR[id];
    P.equip.weapon=demoItem(m,id==='batto'?4:2); P.equip.off=demoItem(o,3); P.way=id; offActive=()=>!!P.equip.off; const pa=HERO_POSE.a; HERO_POSE.a=a;
    g.save(); g.translate(x,54); try{ heroSprite(g); }catch(e){} g.restore(); HERO_POSE.a=pa; Object.assign(P.equip,sv.eq); P.way=sv.way; offActive=sv.off; };
  if(id==='xbows'){ foe('ghoul',74,-1); foe('husk',92,-1); hero(28,.2);
    for(const [y,c1] of [[33,'#e8e0c8'],[38,'#cfc6b0']]){ px(44,y,56,1,'rgba(255,240,200,.25)'); px(60,y,40,1,c1); px(98,y-1,3,3,c1); }
    for(const x of [74,92]){ px(x-1,30,2,2,'#b0141a'); px(x+2,36,2,2,'#b0141a'); } }
  else if(id==='giant'){ hero(44,-.5);
    g.strokeStyle='rgba(255,230,190,.35)'; g.lineWidth=1; for(const [r,a0,a1] of [[30,-2.4,-.4],[25,-2.2,-.6]]){ g.beginPath(); g.arc(46,40,r,a0,a1); g.stroke(); }
    for(let i=0;i<5;i++) px(70+i*5,53-i%2,3,1,'#5a4030'); px(22,52,8,2,'#3a2a20'); px(66,52,10,2,'#3a2a20'); }
  else if(id==='batto'){ foe('husk',80,-1); hero(30,1.25);
    g.fillStyle='#fff6e0'; g.beginPath(); g.moveTo(40,36); g.lineTo(100,30); g.lineTo(100,32); g.lineTo(40,37); g.fill(); px(40,35,60,1,'rgba(255,246,224,.35)');
    const sx=82,sy=31; px(sx-4,sy,9,1,'#fff'); px(sx,sy-4,1,9,'#fff'); px(sx-1,sy-1,3,3,'#fff6e0'); px(78,38,3,2,'#b0141a'); px(84,41,2,2,'#b0141a'); px(88,36,2,1,'#b0141a'); }
  else if(id==='kaeshi'){ foe('brute',76,-1); hero(34,.6);
    g.strokeStyle='#9ad0ff'; g.lineWidth=2; g.beginPath(); g.arc(42,34,14,-1.1,1.1); g.stroke(); g.strokeStyle='rgba(154,208,255,.35)'; g.lineWidth=1; g.beginPath(); g.arc(42,34,17,-1,1); g.stroke();
    for(const [x,y] of [[57,26],[59,33],[56,40],[61,29]]) px(x,y,2,1,'#e8f4ff');
    g.fillStyle='#9ad0ff'; px(30,8,2,6,'#9ad0ff'); px(30,16,2,2,'#9ad0ff'); }
  return c; }
let WAY_BACK=null;
function chooseWay(back){ if(!canChangeWay()){ toast('Your Way can be changed in the Rope-House.'); return; } AU.tone('triangle',330,440,.2,.1,.4);
  WAY_BACK=back||null; let el=$('#wayScr'); if(!el){ el=document.createElement('div'); el.id='wayScr'; el.className='screen'; stage.appendChild(el); }
  mode='card'; hud.hidden=true; el.hidden=false;
  el.innerHTML=`<div class="wyT"><b>Choose your Way</b> <span>道</span></div><div class="wyS">How you fight. You can change it later in the Rope-House.</div><div class="wyRow"></div><div class="row"><button class="btn ghost" id="wyLater">Later <kbd>Esc</kbd></button></div>`;
  const row=el.querySelector('.wyRow');
  Object.entries(WAYS).forEach(([id,w],i)=>{ const card=document.createElement('button'); card.className='wyC'+(P.way===id?' cur':'');
    card.innerHTML=`<div class="wyA"></div><div class="wyK">${w.k}</div><div class="wyN">${w.n.split(',')[0]}</div><ul>${WAYS_SHORT[id].map(t=>`<li>${t}</li>`).join('')}</ul><div class="wyB">${P.way===id?'Your Way ✓':`Choose <kbd>${i+1}</kbd>`}</div>`;
    card.querySelector('.wyA').appendChild(wayArt(id)); card.onclick=()=>pickWay(id); row.appendChild(card); });
  $('#wyLater').onclick=()=>closeWays(); }
function closeWays(){ const el=$('#wayScr'); if(el) el.hidden=true; hideTip(); const b=WAY_BACK; WAY_BACK=null; if(b) b(); else { mode='play'; hud.hidden=false; } }
function pickWay(id){ setWay(id); closeWays(); }
addEventListener('keydown',ev=>{ const el=$('#wayScr'); if(!el||el.hidden) return; const k=ev.key; const ids=Object.keys(WAYS);
  if(k==='Escape'){ ev.preventDefault(); ev.stopImmediatePropagation(); closeWays(); } else if('1234'.includes(k)&&k.length===1){ ev.preventDefault(); ev.stopImmediatePropagation(); pickWay(ids[+k-1]); }
  else if(k.length===1||k==='Enter'||k==='Tab'){ ev.stopImmediatePropagation(); } },true);
(function(){ const st=document.createElement('style'); st.textContent=`
#wayScr{background:rgba(5,3,4,.94);z-index:30;justify-content:center;gap:calc(var(--u)*1)}
#wayScr .wyT b{font-family:var(--fd);font-weight:400;font-size:calc(var(--u)*3.2);color:var(--bone)}#wayScr .wyT span{font-family:'Shippori Mincho',serif;font-size:calc(var(--u)*3);color:#d4ac48;margin-left:.3em}
#wayScr .wyS{font-family:var(--fs);font-size:max(11px,calc(var(--u)*1.2));color:#8a7a6a;margin-bottom:calc(var(--u)*.8)}
#wayScr .wyRow{display:grid;grid-template-columns:repeat(4,calc(var(--u)*21.5));gap:calc(var(--u)*1.2);justify-content:center}
#wayScr .wyC{all:unset;box-sizing:border-box;cursor:pointer;display:flex;flex-direction:column;align-items:center;text-align:center;background:#0d090a;border:1px solid #3a2c28;padding:calc(var(--u)*.8) calc(var(--u)*.8) calc(var(--u)*1);box-shadow:inset 0 0 calc(var(--u)*3) rgba(0,0,0,.8);transition:border-color .15s,transform .15s}
#wayScr .wyC:hover,#wayScr .wyC:focus-visible{border-color:#c9a96a;transform:translateY(-2px)}#wayScr .wyC.cur{border-color:#d4ac48;box-shadow:inset 0 0 calc(var(--u)*2) rgba(212,172,72,.25)}
#wayScr .wyA{width:100%;aspect-ratio:104/64;border:1px solid #241a18;overflow:hidden}#wayScr .wyA canvas{width:100%;height:100%;image-rendering:pixelated;display:block}
#wayScr .wyK{font-family:'Shippori Mincho',serif;font-weight:800;font-size:calc(var(--u)*3);color:#ffd27a;line-height:1;margin-top:calc(var(--u)*.7)}
#wayScr .wyN{font-family:var(--fd);font-size:calc(var(--u)*1.7);color:var(--bone);margin:calc(var(--u)*.3) 0 calc(var(--u)*.5)}
#wayScr ul{list-style:none;margin:0;padding:0;font-family:var(--fs);font-size:max(10px,calc(var(--u)*1.08));line-height:1.35;color:#b8a890;flex:1}
#wayScr li{margin:.25em 0}#wayScr li+li{color:#8a7a6a}
#wayScr .wyB{margin-top:calc(var(--u)*.6);font-family:var(--fs);font-size:max(10px,calc(var(--u)*1.1));color:#c9a96a;letter-spacing:.06em}
#wayScr .row{margin-top:calc(var(--u)*1.2)}`; document.head.appendChild(st); })();
