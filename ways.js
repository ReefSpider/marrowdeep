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
function chooseWay(back){ if(!canChangeWay()){ toast('Your Way can be changed in the Rope-House.'); return; } const prev=mode; AU.tone('triangle',330,440,.2,.1,.4);
  showCard({title:'Choose your Way',jp:'道',body:`Four ways to fight. Choose one; you can change it later in the Rope-House.${Object.values(WAYS).map(w=>`<br><br><b>${w.k} ${w.n}</b> — ${w.d}`).join('')}`,
    buttons:Object.entries(WAYS).map(([id,w])=>({label:`${w.k} ${w.n.split(',')[0]}${P.way===id?' ✓':''}`,fn:()=>{ setWay(id); hideCard(); if(back) back(); else { mode='play'; hud.hidden=false; } }})).concat([{label:'Later',ghost:1,fn:()=>{ hideCard(); if(back) back(); else { mode='play'; hud.hidden=false; } }}])}); }
function setWay(id){ P.way=id; calcStats(); const w=WAYS[id]; toast(`${w.k} ${w.n}. ${w.d}`); AU.lvl(); sparks(P.x,P.y-16,16,'#ffd27a'); saveGame(); }
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
function placeIn(slot,i,it){ const old=P.equip[slot]; P.equip[slot]=it; P.bag.splice(i,1); if(old) P.bag.push(old); calcStats(); AU.tone('triangle',420,300,.08,.12,.1); hideTip(); renderInv(); }
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
    const old=P.equip.off; P.equip.off=it; if(old){ if(P.bag.length<24) P.bag.push(old); else dropItem(old,P.x-P.face*10,P.y-10,true); } calcStats(); noteBest(it); AU.pickup(); toast(`Equipped ${it.name} in your off hand`); return true; }
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
