'use strict';
/* ===== v32: the DPS meter and balance telemetry =====
   Sheet DPS (sheetDps): what the worn gear does on paper — holding attack at the weapon's pace, every swing landing,
   crits and damage types averaged in. Grit, misses, rhythm, combinations and Ways' procs are left out. It's the number
   to compare builds and items with; the satchel shows it and tooltips compare it.
   The meter: damage you actually dealt, read from foes' life frame by frame (strikes, bolts, damage over time,
   combinations, foes knocked into spikes). Split into main hand, off hand and other. Shows the last 3 s, the fight
   average and the fight's peak. Settings › Display › DPS meter.
   Telemetry (into the playtest report, kept on this machine): per level visit the monster level, your level on the
   way in and out, worn item level, sheet DPS, real DPS while fighting, time to kill ordinary foes, how many of their
   hits it takes to kill you, damage taken per minute of fighting; a timeline sample every 30 s; and every gear change
   with the sheet DPS and effective life before and after. */

const fmtN=v=>{ v=+v||0; const a=Math.abs(v); return a>=1e6?(v/1e6).toFixed(a>=1e7?0:1)+'M':a>=1e4?(v/1e3).toFixed(a>=1e5?0:1)+'k':String(Math.round(v)); };

/* ---------- sheet DPS ---------- */
function handSheet(hand){ if(!P||!P.stats) return null; const s=P.stats, it=hand==='off'?P.equip.off:P.equip.weapon;
  if(hand==='off'&&!(offActive()&&s.omax>0)) return null;
  const list=(it?(hand==='off'?offComboFor(it):comboFor(it)):['jab','hook']).filter(n=>MV[n]&&n!=='block'); if(!list.length) return null;
  const W=wclassOf(it), spd=hand==='off'?s.ospd:s.spd, lv=P.lvl||1, avg=((hand==='off'?s.omin+s.omax:s.min+s.max)/2);
  const cr=clamp((s.crit+(W.crit||0))/100,0,1), elm=(s.elm&&s.elm[hand])||{}; let el=0; for(const k in elm) el+=Math.max(0,elm[k]);
  let dmg=0, t=0;
  for(const n of list){ const mv=MV[n];
    if(mv.t==='shoot'){ const rep=it&&it.base.name==='Repeater'; dmg+=(avg*(1+(lv-1)*.04)*(1+cr)*(rep?1.3:1)+el*(1+.5*cr)); t+=mv.dur/(spd*(1+(s.as||0)/100)); continue; }
    t+=Math.max(.2,mv.dur*W.dur/(spd*(1+capAS(s.as)/100)));
    dmg+=(mv.multi?2:1)*(avg*(1+(s.dmgP||0)/100)*(1+(lv-1)*.05)*mv.dm*W.dm*(1+cr)+el*(1+.5*cr)); }
  return {dmg:dmg/list.length,t:t/list.length,dps:dmg/t}; }
function sheetDps(){ const m=handSheet('main'), o=handSheet('off'), dual=!!(o&&typeof dualMelee==='function'&&dualMelee());
  const total=!m?0:dual?(m.dmg+o.dmg)/(m.t+o.t):m.dps; return {total,main:m?m.dps:0,off:o?o.dps:0,dual}; }
function sheetWith(slot,it){ const sv=P.equip[slot], life=P.life, pow=P.power; P.equip[slot]=it; calcStats(); const d=sheetDps(); P.equip[slot]=sv; calcStats(); P.life=life; P.power=pow; return d; }
/* effective life: how much raw foe damage it takes to empty your life (defense counted, everything else left out) */
const effLife=s=>Math.round(((s||P.stats).life)*(100+2*(s||P.stats).def)/100);

/* ---------- the meter: damage read from foes' life ---------- */
const DPS={log:[],cur:{main:0,off:0,other:0},fight:null,last:null,pend:{main:0,off:0,remote:0}};
const DPS_WIN=3, FIGHT_GAP=6;
function dpsAdd(t,amt,split){ DPS.log.push([t,amt]); while(DPS.log.length&&DPS.log[0][0]<t-DPS_WIN) DPS.log.shift();
  let f=DPS.fight; if(!f||t-f.lastHit>FIGHT_GAP){ if(f&&f.dmg>0) DPS.last=f; f=DPS.fight={t0:t,lastHit:t,dmg:0,ct:0,peak:0,h:{main:0,off:0,other:0}}; }
  f.lastHit=t; f.dmg+=amt; for(const k in split) f.h[k]+=split[k]; }
function dpsNow(){ const f=DPS.fight; if(!f||time-f.lastHit>DPS_WIN) return 0; let s=0; for(const [t,a] of DPS.log) if(t>=time-DPS_WIN) s+=a; return s/Math.max(1,Math.min(DPS_WIN,time-f.t0+.5)); }
const fightDps=f=>f&&f.ct>.5?f.dmg/f.ct:0;

/* hand attribution: a strike knows its hand; bolts are counted by whose bolts are in the air */
(function(){ const o=strike; strike=function(e,mv,id,hand,dir,mult){ const h0=e?e.hp:0; const r=o(e,mv,id,hand,dir,mult); if(e&&e.hp<h0){ const d=h0-Math.max(0,e.hp); if(P&&P._remote) DPS.pend.remote+=d; else DPS.pend[hand==='off'?'off':'main']+=d; } return r; }; })();
(function(){ const o=updProjs; updProjs=function(dt){ let m=0,f=0; for(const p of projs) if(p.from==='p'&&p.life>0){ if(p.hand==='off') f++; else m++; }
  if(!m&&!f) return o(dt); const hp=new Map(); for(const e of enemies) if(!e.dead) hp.set(e,e.hp); o(dt); let d=0; for(const [e,h] of hp) if(e.hp<h) d+=h-Math.max(0,e.hp);
  if(d>0){ DPS.pend.main+=d*m/(m+f); DPS.pend.off+=d*f/(m+f); } }; })();
/* the frame: everything foes lost during it */
(function(){ const o=update; update=function(dt){ if(mode!=='play'||!L||L.def.kind==='cabin') return o(dt);
  const hp=new Map(); for(const e of enemies) if(!e.dead) hp.set(e,e.hp); DPS.pend.main=DPS.pend.off=DPS.pend.remote=0;
  const r=o(dt); let tot=0; for(const [e,h] of hp) if(e.hp<h) tot+=h-Math.max(0,e.hp);
  const pd=DPS.pend; tot-=pd.remote; if(tot>.01){ const main=Math.min(pd.main,tot), off=Math.min(pd.off,tot-main), other=Math.max(0,tot-main-off); dpsAdd(time,tot,{main,off,other}); }
  const f=DPS.fight; if(f&&time-f.lastHit<2.5){ f.ct+=dt; f.peak=Math.max(f.peak,dpsNow()); }
  return r; }; })();

/* ---------- the readout ---------- */
(function(){ const st=document.createElement('style'); st.textContent=`
#dpsm{position:absolute;left:calc(50% + var(--u)*10.6);bottom:calc(var(--u)*1.35);width:calc(var(--u)*15);font-family:var(--fs);color:var(--bone);text-shadow:0 1px 0 #000;pointer-events:none;opacity:.55;transition:opacity .4s}
#dpsm.live{opacity:1}
#dpsm .r1{display:flex;align-items:baseline;gap:calc(var(--u)*.5);font-variant-numeric:tabular-nums}
#dpsm .r1 b{font-family:var(--fd);font-size:max(14px,calc(var(--u)*2.2));font-weight:400;line-height:1;color:#f1e6d2}
#dpsm .r1 span{font-size:max(9px,calc(var(--u)*1.05));letter-spacing:.14em;color:#9a8a7a}
#dpsm .bar{display:flex;height:max(3px,calc(var(--u)*.35));margin:calc(var(--u)*.35) 0;background:#1a1213;border:1px solid #2e2422}
#dpsm .bar i{display:block;height:100%;transition:width .3s}
#dpsm .bar .m{background:#d8c8a8}#dpsm .bar .o{background:#7aa8d8}#dpsm .bar .x{background:#b04a3a}
#dpsm .r2{font-size:max(9px,calc(var(--u)*1.05));color:#9a8a7a;font-variant-numeric:tabular-nums;white-space:nowrap}
#dpsm .r2 em{font-style:normal}#dpsm .r2 .km{color:#d8c8a8}#dpsm .r2 .ko{color:#7aa8d8}#dpsm .r2 .kx{color:#d0705e}`; document.head.appendChild(st); })();
const dpsEl=document.createElement('div'); dpsEl.id='dpsm'; dpsEl.innerHTML='<div class="r1"><b>0</b><span>DPS</span></div><div class="bar"><i class="m"></i><i class="o"></i><i class="x"></i></div><div class="r2"></div>'; hud.appendChild(dpsEl);
const dpsOn=()=>SETTINGS.dps!==false;
let dpsT=0;
function dpsDraw(){ const on=dpsOn()&&mode==='play'&&L&&L.def.kind!=='cabin'; dpsEl.hidden=!on; if(!on) return;
  const f=DPS.fight&&DPS.fight.ct>.5?DPS.fight:DPS.last, now=dpsNow(), live=now>0; dpsEl.classList.toggle('live',live);
  dpsEl.querySelector('b').textContent=fmtN(live?now:fightDps(f));
  dpsEl.querySelector('span').textContent=live?'DPS':f?'DPS · last fight':'DPS';
  const h=f?f.h:{main:0,off:0,other:0}, sum=h.main+h.off+h.other||1, pc=k=>Math.round(h[k]/sum*100);
  const bars=dpsEl.querySelectorAll('.bar i'); bars[0].style.width=pc('main')+'%'; bars[1].style.width=pc('off')+'%'; bars[2].style.width=pc('other')+'%';
  dpsEl.querySelector('.r2').innerHTML=f?`fight <em>${fmtN(fightDps(f))}</em> · peak <em>${fmtN(f.peak)}</em> · <em class="km">${pc('main')}</em>/<em class="ko">${pc('off')}</em>/<em class="kx">${pc('other')}</em>`:`sheet <em>${fmtN(sheetDps().total)}</em>`; }
(function(){ const o=update; update=function(dt){ const r=o(dt); dpsT-=dt; if(dpsT<=0){ dpsT=.25; dpsDraw(); } return r; }; })();
(function(){ const o=loadLevel; loadLevel=function(idx,opt){ const r=o(idx,opt); DPS.fight=null; DPS.last=null; DPS.log.length=0; dpsDraw(); return r; }; })();
/* Settings › Display */
(function(){ const o=openSettings; openSettings=function(from){ o(from); const pn=document.querySelector('#setScr .setGrid .panel:last-child'); if(!pn||$('#sDps')) return;
  pn.insertAdjacentHTML('beforeend',setRow('DPS meter',`<input type="checkbox" id="sDps"${dpsOn()?' checked':''}>`,'Damage per second beside the arts bar: the last 3 s, the fight average and its peak, and how much came from the main hand (pale), the off hand (blue) and everything else (red: burns, bleeds, combinations, hazards).'));
  const l=pn.lastElementChild; if(l&&l.dataset.tip) tipOn(l,l.dataset.tip);
  $('#sDps').onchange=e=>{ SETTINGS.dps=e.target.checked; store.set('marrowdeep.settings',SETTINGS); }; }; })();

/* ---------- telemetry: per level visit ---------- */
const BAL_TL='marrowdeep.baltl', BAL_TL_MAX=480;
const wornIlvl=()=>{ const v=Object.values(P.equip).filter(Boolean); return v.length?Math.round(v.reduce((a,i)=>a+(i.ilvl||1),0)/v.length):0; };
const gearSig=()=>Object.entries(P.equip).map(([k,i])=>i?k+':'+i.id:'').join('|');
function balSnap(){ const s=P.stats, d=sheetDps(); return {plvl:P.lvl,sheet:Math.round(d.total),main:Math.round(d.main),off:Math.round(d.off),dual:d.dual,life:s.life,def:s.def,eff:effLife(s),crit:s.crit,as:s.as,il:wornIlvl(),rar:Object.values(P.equip).filter(Boolean).map(i=>i.rarity)}; }
(function(){ const o=ptOpen; ptOpen=function(idx){ o(idx); const v=PT.v; if(!v||!P) return;
  Object.assign(v,{mlvl:typeof mlvl==='function'?mlvl(idx):0,plvl1:P.lvl,in:balSnap(),fdmg:0,ct:0,ttk:[],hp:[],fh:[],peak:0}); PT.gear=gearSig(); }; })();
(function(){ const o=ptClose; ptClose=function(how){ const v=PT.v; if(v&&P&&v.in){ v.plvl1=P.lvl; v.out=balSnap(); v.fight=v.ct>1?Math.round(v.fdmg/v.ct):0; v.ct=Math.round(v.ct); v.peak=Math.round(v.peak);
    const med=a=>{ if(!a.length) return 0; const b=a.slice().sort((x,y)=>x-y); return b[b.length>>1]; };
    v.ttkMed=+med(v.ttk).toFixed(2); v.ttkN=v.ttk.length; v.foeHp=Math.round(med(v.hp)); v.foeHit=Math.round(med(v.fh)); v.hitsToDie=v.foeHit?+(v.out.life/v.foeHit).toFixed(1):0;
    v.takenPerMin=v.ct>5?Math.round(v.taken/(v.ct/60)):0; delete v.ttk; delete v.hp; delete v.fh; } return o(how); }; })();
/* real DPS while fighting and time to kill, per visit */
(function(){ const o=dpsAdd; dpsAdd=function(t,amt,split){ o(t,amt,split); if(PT.v) PT.v.fdmg+=amt; }; })();
(function(){ const o=update; update=function(dt){ const r=o(dt); const v=PT.v; if(v&&P&&!P._remote&&DPS.fight&&time-DPS.fight.lastHit<2.5){ v.ct+=dt; v.peak=Math.max(v.peak,DPS.fight.peak); } return r; }; })();
(function(){ const o=dmgEnemy; dmgEnemy=function(e,d,...rest){ if(e&&!e.dead&&e._ft==null&&P&&!P._remote) e._ft=time; return o(e,d,...rest); }; })();
(function(){ const o=killEnemy; killEnemy=function(e,dir,crit){ const was=e.dead; const r=o(e,dir,crit); const v=PT.v;
  if(v&&!was&&e.dead&&!e.boss&&e._ft!=null&&!e.champ&&!e.rare&&!e.unique&&v.ttk.length<400){ v.ttk.push(Math.max(.05,time-e._ft)); v.hp.push(e.maxhp); } return r; }; })();
/* foes' hits on you, after defense, before your dodges */
(function(){ const o=hurtPlayer; hurtPlayer=function(d,src){ const l0=P?P.life:0; const r=o(d,src); const v=PT.v; if(v&&P&&src&&!src.boss&&!src.champ&&!src.rare&&P.life<l0&&v.fh.length<400) v.fh.push(l0-P.life); return r; }; })();

/* ---------- telemetry: a timeline sample every 30 s of play, and every gear change ---------- */
let balClock=0, balT=0, balGearT=0;
(function(){ const o=update; update=function(dt){ const r=o(dt); if(mode!=='play'||!P||P._remote||!L||!PT.v) return r; balClock+=dt; balT+=dt; balGearT+=dt;
  if(balGearT>1){ balGearT=0; const g=gearSig(); if(PT.gear!=null&&g!==PT.gear) balGear(); PT.gear=g; }
  if(balT>=30){ balT=0; const tl=store.get(BAL_TL)||[]; const s=balSnap(), f=DPS.fight&&DPS.fight.ct>.5?DPS.fight:DPS.last;
    tl.push({at:Date.now(),lvl:PT.v.lvl,tier:ngp,ml:PT.v.mlvl,pl:s.plvl,sh:s.sheet,fd:Math.round(fightDps(f)),life:s.life,eff:s.eff,il:s.il}); if(tl.length>BAL_TL_MAX) tl.splice(0,tl.length-BAL_TL_MAX); store.set(BAL_TL,tl); }
  return r; }; })();
let balPrev=null;
function balGear(){ const now=balSnap(), was=balPrev||PT.v.in; balPrev=now;
  const items=Object.entries(P.equip).filter(([,i])=>i).map(([k,i])=>[k,i.rarity,i.ilvl||0]);
  ptPush({k:'gear',lvl:PT.v.lvl,tier:ngp,ml:PT.v.mlvl,pl:P.lvl,sheet0:was?was.sheet:0,sheet1:now.sheet,eff0:was?was.eff:0,eff1:now.eff,items}); }
(function(){ const o=ptOpen; ptOpen=function(idx){ o(idx); balPrev=PT.v&&PT.v.in||null; }; })();

/* ---------- into the report ---------- */
(function(){ const o=ptSummary; ptSummary=function(){ const s=o(), d=ptLoad();
  const vis=d.ev.filter(e=>e.k==='visit'&&e.in);
  s.bal=vis.map(v=>({lvl:v.lvl,tier:v.tier,ml:v.mlvl,pl0:v.plvl,pl1:v.plvl1,il:v.in.il,sheet0:v.in.sheet,sheet1:v.out?v.out.sheet:0,fight:v.fight,peak:v.peak,ct:v.ct,ttk:v.ttkMed,ttkN:v.ttkN,foeHp:v.foeHp,foeHit:v.foeHit,life:v.out?v.out.life:v.in.life,eff:v.out?v.out.eff:v.in.eff,htd:v.hitsToDie,tpm:v.takenPerMin,dual:v.out?v.out.dual:false,cl:v.cleared,d:v.deaths}));
  s.gear=d.ev.filter(e=>e.k==='gear').slice(-80);
  s.tl=(store.get(BAL_TL)||[]).slice(-240); return s; }; })();
(function(){ const o=ptText; ptText=function(s){ const txt=o(s), i=txt.lastIndexOf('\nRAW '); if(i<0||!s.bal) return txt; const L_=['','Balance, per level visit (monster level · your level in→out · worn item level · sheet DPS in→out · real DPS fighting · peak · median seconds to kill an ordinary foe · their median hit · hits to kill you · damage taken per fighting minute):'];
  for(const b of s.bal.slice(-40)) L_.push(`  ${ptName(b.lvl)} [${ptTier(b.tier)}] ml ${b.ml} · lv ${b.pl0}→${b.pl1} · il ${b.il} · sheet ${fmtN(b.sheet0)}→${fmtN(b.sheet1)} · real ${fmtN(b.fight)} · peak ${fmtN(b.peak)} · TTK ${b.ttk||'–'}s (${b.ttkN}) · hit ${b.foeHit||'–'} · ${b.htd||'–'} hits · ${fmtN(b.tpm)}/min${b.cl?'':' · not cleared'}`);
  const big=s.gear.filter(g=>g.sheet0>0&&g.sheet1/g.sheet0>=1.5);
  if(big.length) { L_.push('','Big gear jumps (sheet DPS ×1.5 or more in one change):'); for(const g of big.slice(-12)) L_.push(`  ${ptName(g.lvl)} ml ${g.ml} · lv ${g.pl} · ${fmtN(g.sheet0)}→${fmtN(g.sheet1)} (×${(g.sheet1/g.sheet0).toFixed(1)})`); }
  return txt.slice(0,i)+L_.join('\n')+txt.slice(i); }; })();
