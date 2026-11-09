'use strict';
/* ===== items: generation, grades, tooltips, icons, save/restore ===== */
let IID=0;
/* you can wear an item once you're within 6 levels of its item level */
const REQ_GAP=6, reqLvl=it=>Math.max(1,((it&&it.ilvl)||1)-REQ_GAP);
const sumAff=(it,k)=>it.aff.reduce((s,a)=>s+(a.k===k?a.v:0),0);
const varies=a=>a.lo!=null&&a.lo!==a.hi;
const isShield=it=>it&&it.base.cls==='shield';
const affSlot=it=>it.base.cls==='shield'?'shield':it.slot;
const valTxt=(k,v)=>AFX[k][0]+v+AFX[k][1];
/* v34 rarity budget (see v34 notes): what uniques and abyssals get over a rare, in one place */
const BUD={uFloor:1.05,aFloor:1.1,uEmp:1.1,sigU:1.2,sigA:1.3,g4:[.1,.25],edU:.55,edA:.55};
/* v34: a unique's or abyssal's enhanced damage/defense grows into its full size by item level 12, the way a rare's ED tier does
   (a level-2 unique with +150% was three times a level-2 rare) */
const edScale=il=>clamp(((il||1)+4)/16,.35,1);
function gradeRange(lo,hi,g){ const sp=hi-lo; if(g===4) return [hi+Math.max(1,Math.ceil(hi*BUD.g4[0])),hi+Math.max(2,Math.ceil(hi*BUD.g4[1]))]; /* v34: Abyssal grade +10–25% over the top (was +50–100%) */ if(g===3) return [hi,hi];
  const b1=lo+Math.floor(sp*.4), b2=lo+Math.floor(sp*.75); if(g===0) return [lo,b1]; if(g===1) return [b1+1,b2]; return [b2+1,hi-1]; }
function valueFor(lo,hi,g){ while(g>0){ const r=gradeRange(lo,hi,g); if(r[0]<=r[1]) return ri(r[0],r[1]); g--; } return ri(lo,gradeRange(lo,hi,0)[1]); }
function rollStat(lo,hi){ if(lo===hi) return {v:lo,g:3}; let r=R()*GR.reduce((a,b)=>a+b.w,0), g=0; for(let i=0;i<GR.length;i++){ r-=GR[i].w; if(r<=0){g=i;break;} }
  while(g>0&&g<3){ const rg=gradeRange(lo,hi,g); if(rg[0]<=rg[1]) break; g--; } return {v:valueFor(lo,hi,g),g}; }
function fin(it){ const ed=sumAff(it,'ed'),edef=sumAff(it,'edef');
  if(it.slot==='weapon'&&it.base.max>0){const sc=(1+Math.max(0,(it.ilvl||1)-1)*.075)*(it.rarity>=4?uniqueFloor(it):1);it.min=Math.max(1,Math.round(it.base.min*sc*(1+ed/100)));it.max=Math.max(it.min+1,Math.round(it.base.max*sc*(1+ed/100)));}
  if(it.base.def!=null) it.def=Math.round(it.base.def*(it.rarity>=4&&it.slot!=='weapon'?defFloor(it)*(it.rarity===5?BUD.aFloor:BUD.uFloor):1)*(it.dq||100)/100*(1+edef/100)*(1+Math.max(0,(it.ilvl||1)-1)*.05));
  return it; }
/* every stat category that can appear on this slot, each counted once, so all are equally likely */
function catPool(slot){ const ks=[]; for(const a of PRE.concat(SUF)) if(a.s.includes(slot)&&!ks.includes(a.k)) ks.push(a.k); return ks; }

/* ---------- v16 loot fixes (see v16 notes: measured over 20,000 rolls per item level) ----------
   1. Weapon bases used to come from the 7 highest-level bases, and above item level 14 those are all two-handers and
      off-hand crossbows: no one-handed weapon could drop at all. Now a class is picked first (every class equally likely),
      then one or two hands where the class has both, then the best base of that kind for the item level.
   2. Flat stats (life, the ten damage types, thorns, regen) stopped growing at item level 12. They now grow 5% per item
      level above 12, so late jewellery keeps up with late monsters. Percent stats are unchanged.
   3. Uniques were weaker than legendaries (fixed early bases, three stats). A unique now hits as hard as the best base of
      its kind at its item level ×1.05 (abyssal ×1.2), armour and helms get the best base's defense the same way, its own
      stats roll 20% higher, and it gains two extra stats rolled at legendary strength (item level +6). */
const FLAT_K=new Set(['life','thorns','regen'].concat(ELEM_KEYS));
const flatMul=(k,ilvl)=>FLAT_K.has(k)?1+.05*Math.max(0,(ilvl||1)-12):1;
function flatScale(k,lo,hi,ilvl){ const m=flatMul(k,ilvl); if(m===1) return [lo,hi]; return [Math.round(lo*m),Math.max(Math.round(lo*m),Math.round(hi*m))]; }
function pickWeaponBase(ilvl){ const ok=BASES.weapon.filter(b=>b.lvl<=ilvl+1); const cls=[...new Set(ok.map(b=>b.cls))]; const c=pick(cls);
  const inC=ok.filter(b=>b.cls===c), hs=[...new Set(inC.map(b=>b.h))], h=pick(hs); const pool=inC.filter(b=>b.h===h).sort((a,b)=>b.lvl-a.lvl);
  return pool[pool.length>1&&R()<.3?1:0]; }
/* v34: this cuts both ways now. A unique on a base above its item level (Bellbreaker's Great Hammer at item level 2) used to
   keep the big base's damage; it now hits like the best base of its kind that the item level reaches. */
function uniqueFloor(it){ const b=it.base; if(!(b.max>0)) return 1; const il=it.ilvl||1; let best=null;
  for(const x of BASES.weapon) if(x.h===b.h&&x.cls===b.cls&&x.max>0&&x.lvl<=il+1&&(!best||x.min+x.max>best.min+best.max)) best=x;
  return (best?(best.min+best.max)/(b.min+b.max):1)*(it.rarity===5?BUD.aFloor:BUD.uFloor); }
function defFloor(it){ const b=it.base; if(!b.def||!BASES[it.slot]) return 1; const il=it.ilvl||1; let best=null; for(const x of BASES[it.slot]) if(x.def&&x.lvl<=il+1&&(!b.fam||x.fam===b.fam)&&(!best||x.def>best.def)) best=x; /* v39: within the base's own family */ return best?best.def/b.def:1; }
/* v16: damage types are what make a unique (and an abyssal) unique. Lesser items never roll them; every unique carries
   one, its own, at the strongest tier, rolled 20% higher (abyssal 50%) and growing with item level like any flat stat. */
const SIG_EL={"Widow's Promise":'blood','Grave Mother':'bone','The Mourning Hatchet':'shadow',"Sister's Needle":'poison','Gravedigger':'cold','Last Wall of Hollowmere':'holy','Ironheart':'fire','Hollow Crown':'shadow',"The Debtor's Chain":'water',
  'The Unpaid Debt':'blood',"Ilse's Candle":'holy',"Rope's End":'wind',"The Hound's Jaw":'blood'};
/* v34: the signature type rolls at the tier the item level reaches (like any stat), not always the top tier — the top tier
   on an item level 1 unique was three times the weapon's own damage */
function sigTier(d,ilvl){ return Math.min(d.v.length-1,Math.floor((ilvl||1)/4)); }
function signatureElem(it,ilvl){ const k=SIG_EL[it.name]||ELEM_KEYS[(it.name||'').length%ELEM_KEYS.length]; const d=PRE.find(x=>x.k===k); if(!d) return null; const t=sigTier(d,ilvl);
  const m=(it.rarity===5?BUD.sigA:BUD.sigU)*flatMul(k,ilvl); const lo=Math.round(d.v[t][0]*m), hi=Math.max(lo+1,Math.round(d.v[t][1]*m)); const rs=rollStat(lo,hi); return {k,v:rs.v,g:rs.g,lo,hi,nm:d.n[t],pre:true}; }
function empower(it,ilvl){ for(const a of it.aff){ if(a.hi<=0) continue; const m=(it.rarity===4?BUD.uEmp:1)*flatMul(a.k,ilvl)*(a.k==='ed'?(it.rarity===4?BUD.edU:it.rarity===5?BUD.edA:1):1)*((a.k==='ed'||a.k==='edef')&&it.rarity>=4?edScale(ilvl):1); if(m===1) continue; a.lo=Math.round(a.lo*m); a.hi=Math.max(a.lo,Math.round(a.hi*m)); const rs=rollStat(a.lo,a.hi); a.v=rs.v; a.g=rs.g; }
  if(!it.aff.some(a=>ELEM_KEYS.includes(a.k))){ const a=signatureElem(it,ilvl); if(a) it.aff.push(a); }
  if(it.rarity!==4) return it; const used=new Set(it.aff.map(a=>a.k)); const as=affSlot(it);
  for(let i=0;i<2;i++){ const a=rollAff(i?SUF:PRE,as,ilvl+6,used)||rollAff(i?PRE:SUF,as,ilvl+6,used); if(a){ a.x=1; it.aff.push(a); } }
  return it; }
function rollAff(list,slot,ilvl,used){ const hasEl=[...used].some(k=>ELEM_KEYS.includes(k)); const keys=catPool(slot).filter(k=>!used.has(k)&&!(hasEl&&ELEM_KEYS.includes(k))); if(!keys.length) return null; const k=pick(keys); used.add(k);
  const defs=PRE.concat(SUF).filter(d=>d.k===k&&d.s.includes(slot)); const a=defs.find(d=>list.includes(d))||pick(defs);
  const mt=Math.min(a.v.length-1,Math.floor(ilvl/4)); const t=ri(Math.max(0,mt-1),mt); const [lo,hi]=flatScale(k,a.v[t][0],a.v[t][1],ilvl); const rs=rollStat(lo,hi); return {k,v:rs.v,g:rs.g,lo,hi,nm:a.n[t],pre:PRE.includes(a)}; }
/* one stat of a known category, rolled at the tier this item level reaches (used by legendaries and the altar) */
function affOf(k,slot,ilvl,preferPre){ const defs=PRE.concat(SUF).filter(d=>d.k===k&&d.s.includes(slot)); if(!defs.length) return null; const a=defs.find(d=>preferPre==null||PRE.includes(d)===preferPre)||defs[0];
  const mt=Math.min(a.v.length-1,Math.floor(ilvl/4)); const t=ri(Math.max(0,mt-1),mt); const [lo,hi]=flatScale(k,a.v[t][0],a.v[t][1],ilvl); const rs=rollStat(lo,hi); return {k,v:rs.v,g:rs.g,lo,hi,nm:a.n[t],pre:PRE.includes(a)}; }
function oddsW(w,mf){ const m=1+(mf||0)/100*.6; return w.map((v,i)=>i===0?v:v*(i>=4?Math.sqrt(m):m)); }
function rollRarity(w,mf){ const ww=oddsW(w,mf); let s=ww.reduce((a,b)=>a+b,0),r=R()*s; for(let i=0;i<ww.length;i++){r-=ww[i];if(r<=0)return i;} return 0; }
function mkFixed(def,rar){ return fin({id:++IID,slot:def.slot,base:baseByName(def.base),rarity:rar,name:def.name,ilvl:0,dq:ri(95,105),aff:def.aff.map(([k,lo,hi])=>{ const rs=rollStat(lo,hi); return {k,lo,hi,v:rs.v,g:rs.g}; }),fl:def.fl,set:def.set}); }
function mkBase(name){ const b=baseByName(name); const slot=Object.keys(BASES).find(s=>BASES[s].includes(b)); return fin({id:++IID,slot,base:b,rarity:0,name:b.name,ilvl:1,dq:100,aff:[]}); }
function genItem(ilvl,w,mf,forceSlot){
  let r=rollRarity(w,mf||0);
  if(r===5){const it=mkFixed(pick(ABYSSAL),5);it.ilvl=ilvl;empower(it,ilvl);return fin(it);}
  if(r===4){const it=mkFixed(pick(UNIQUES),4);it.ilvl=ilvl;empower(it,ilvl);return fin(it);}
  const slot=forceSlot||wpick(SLOTW); if((slot==='ring'||slot==='amulet')&&r===0) r=1;
  const bs=BASES[slot].filter(b=>b.lvl<=ilvl+1).sort((a,b)=>a.lvl-b.lvl); const base=slot==='weapon'?pickWeaponBase(ilvl):(typeof pickGearBase==='function'&&GEAR_SLOTS.includes(slot))?pickGearBase(slot,ilvl):bs[Math.max(0,bs.length-1-ri(0,2))]||BASES[slot][0];
  const it={id:++IID,slot,base,rarity:r,ilvl,dq:ri(90,110),aff:[]}; const used=new Set(ELEM_KEYS); /* damage types belong to uniques and abyssals only (v16) */ const as=affSlot(it);
  if(r===1){ const n=R()<.5?2:1; for(let i=0;i<n;i++){ const a=rollAff(i?SUF:PRE,as,ilvl,used); if(a) it.aff.push(a); }
    const p=it.aff.find(a=>a.pre), s=it.aff.find(a=>!a.pre); it.name=[p&&p.nm,base.name,s&&s.nm].filter(Boolean).join(' '); }
  else if(r===3){ const n=as==='ring'||as==='amulet'?5:ri(5,6), li=ilvl+6; for(let i=0;i<n;i++){const a=rollAff(i%2?SUF:PRE,as,li,used)||rollAff(i%2?PRE:SUF,as,li,used); if(a) it.aff.push(a);} if(slot==='weapon'&&!used.has('ed')){ const a=affOf('ed',as,li); if(a){ it.aff.unshift(a); if(it.aff.length>6) it.aff.pop(); } } it.name=pick(LEG1)+' '+base.name; }
  else if(r===2){ const n=ri(3,5); for(let i=0;i<n;i++){const a=rollAff(i%2?SUF:PRE,as,ilvl,used)||rollAff(i%2?PRE:SUF,as,ilvl,used); if(a) it.aff.push(a);} it.name=pick(RN1)+' '+pick(RN2[as]); }
  else it.name=base.name;
  return fin(it);
}
function spdWord(s){return s>=1.2?'Very Fast':s>=1.03?'Fast':s>=.95?'Normal':s>=.85?'Slow':'Very Slow';}
function quality(it){ const r=it.aff.filter(varies); if(!r.length) return null; return Math.round(r.reduce((s,a)=>s+(a.v-a.lo)/(a.hi-a.lo),0)/r.length*100); }
function handWord(b){ return b.h===2?'Two-Hand':b.h===0?'Off-Hand':'One-Hand'; }
function tipParts(it,reel){
  const c=RCOL[it.rarity], ab=it.rarity===5?' class="abyss"':''; const rows=[]; let n=0, dmgFinal='';
  let h=`<div${ab} style="color:${c}">${it.name}</div>`; if(it.rarity>=2) h+=`<div${ab} style="color:${c}">${it.base.name}</div>`;
  const edA=it.aff.filter(a=>a.k==='ed'), edfA=it.aff.filter(a=>a.k==='edef');
  const hold=fin=>{ if(!reel||!it.aff.some(varies)) return fin; dmgFinal=fin; return `<span id="rdm">· · ·</span>`; };
  if(it.slot==='weapon'){ const b=it.base;
    h+=`<div class="g">${handWord(b)} ${WEAPON_TYPE[b.cls]}</div>`;
    if(b.max>0) h+=`<div class="w">Damage: <span class="${edA.length?'m':'w'}">${hold(`${it.min} to ${it.max}`)}</span></div><div class="w">Attack Speed: ${spdWord(b.spd)}</div>`;
    if(b.cls==='shield') h+=`<div class="g">Hold to block. Block at the last instant to parry.</div>`;
    else h+=`<div class="g">${b.h===0?'Off hand':'Combo'}: ${(b.h===0?offComboFor(it):comboFor(it)).map(m=>MV[m].nm).join(' · ')}</div>`;
    if(b.h===1) h+=`<div class="g">Off hand: ${offComboFor(it).map(m=>MV[m].nm).join(' · ')}</div>`; }
  if(it.def!=null) h+=`<div class="w">Defense: <span class="${edfA.length?'m':'w'}">${hold(String(it.def))}</span></div>`;
  if(it.ilvl) h+=`<div class="g">Item Level: ${it.ilvl}</div>`;
  { const rq=reqLvl(it); if(rq>1) h+=P&&P.lvl<rq?`<div style="color:#ff5a4a">Requires level ${rq} · you can't use it yet</div>`:`<div class="g">Requires level ${rq}</div>`; }
  for(const a of it.aff){
    if(reel&&varies(a)){ const id='sr'+(n++); rows.push({id,a}); h+=`<div class="srl" id="${id}"><div class="sw"><div class="ss"></div></div><span class="lb">${AFX[a.k][2]}</span><span class="gt"></span></div>`; continue; }
    const g=varies(a)?a.g:1; const vs=g===4?`<span class="abyss" style="color:var(--r5)">${FMT[a.k](a.v)}</span><span class="tag" style="color:var(--r5)">ABYSSAL</span>`:g===3?`<span class="max">${FMT[a.k](a.v)}</span>`:FMT[a.k](a.v);
    h+=`<div class="m">${vs}${varies(a)?` <span class="rg">[${a.lo}–${a.hi}]</span>`:''}</div>`; }
  if(false&&it.set){ const S=SETS[it.set]; h+=`<div class="s" style="margin-top:.4em">${S.name}</div>`; for(const sp of SETP.filter(x=>x.set===it.set)){ const has=P&&Object.values(P.equip).some(e=>e&&e.name===sp.name); h+=`<div class="${has?'s':'x'}">${sp.name}</div>`; }
    for(const [k2,affs] of S.bonus) h+=`<div class="x">(${k2} items) ${affs.map(([k,v])=>FMT[k](v)).join(', ')}</div>`; }
  if(it.fl) h+=`<div class="fl">${it.fl}</div>`;
  const q=quality(it); if(q!=null){ const vr=it.aff.filter(varies), na=vr.filter(a=>a.g===4).length;
    h+=`<div class="q"${reel?' id="rq" hidden':''}>Roll quality <b>${q}%</b>${na?` · <span class="abyss" style="color:var(--r5)">${na===vr.length&&vr.length>1?'ALL ABYSSAL':na+' abyssal'}</span>`:q===100?' · perfect':''}</div>`; }
  return {html:h,rows,dmgFinal};
}
function tipHTML(it){ return tipParts(it,false).html; }

/* ---------- icons ---------- */
function getIcon(it){ if(it._ic) return it._ic; const c=document.createElement('canvas'); c.width=c.height=32; const g=c.getContext('2d');
  if(it.slot==='weapon'&&proofWeapon(it)){ g.save(); g.translate(1,30); g.rotate(-Math.PI/4); g.scale(1.35,1.35); drawCraftWeapon(g,it); g.restore(); it._ic=c; return c; }
  if(it.slot==='helm'&&it.base.name==='Kettle Hat'){ drawKettle(g,it.rarity); it._ic=c; return c; }
  const px=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
  const b=it.base, rc=RCOL[it.rarity];
  const M=it.rarity===5?['#1a0303','#5a0f0f','#ff5a40']:it.rarity===4?['#5a1a3e','#a03a78','#ff9ad4']:it.rarity===3?['#5a3410','#a8641e','#ffbe6a']:['#3e424b','#737a87','#cfcabd'];
  const wood='#4a3324';
  const diag=(x0,y0,len,w,col,hi)=>{ for(let i=0;i<len;i++){ px(x0+i,y0-i-w,w+1,w+1,col); if(hi) px(x0+i,y0-i-w,1,1,hi); } };
  if(it.slot==='weapon'){ const cl=b.cls;
    if(cl==='sword'||cl==='dagger'){ const L=cl==='dagger'?9:Math.min(22,8+Math.round(b.len*.45)), bw=Math.max(1,Math.round(b.wid/2.5));
      diag(9,22,L,bw,M[1],M[2]); px(9+L,22-L-bw,1,1,M[2]);
      for(let k=-3;k<=3;k++) px(8+k,23+k,2,2,it.rarity===4?'#ff7ac4':it.rarity===3?'#ff9a3a':'#4e4a52');
      for(let i=1;i<5;i++) px(8-i,24+i,2,2,wood); px(2,28,3,3,it.rarity?rc:'#6a5a48'); }
    else if(cl==='axe'){ diag(5,28,20,1,wood); const big=b.h===2; g.fillStyle=M[1]; g.beginPath(); g.moveTo(19,10); g.lineTo(26,3); g.lineTo(31,big?16:12); g.lineTo(24,15); g.fill(); px(27,4,2,2,M[2]); if(big){ g.beginPath(); g.moveTo(19,10); g.lineTo(13,5); g.lineTo(16,14); g.fill(); } if(it.rarity) px(22,10,2,2,rc); }
    else if(cl==='spear'){ diag(3,30,24,1,wood); g.fillStyle=M[1]; g.beginPath(); g.moveTo(25,6); g.lineTo(31,0); g.lineTo(28,8); g.fill(); px(27,3,2,2,M[2]); if(b.name==='Glaive'){ g.beginPath(); g.moveTo(23,8); g.lineTo(31,1); g.lineTo(30,10); g.fill(); } if(b.name==='Halberd'){ g.beginPath(); g.moveTo(20,12); g.lineTo(17,4); g.lineTo(24,2); g.lineTo(25,9); g.fill(); px(17,4,7,1,M[2]); } if(it.rarity) px(23,9,2,2,rc); }
    else if(cl==='mace'){ diag(5,28,b.h===2?18:14,1,wood); const hx=b.h===2?22:18, hy=b.h===2?6:10; px(hx,hy,8,8,M[1]); px(hx,hy,8,1,M[2]); px(hx-2,hy+3,2,2,M[0]); px(hx+8,hy+3,2,2,M[0]); px(hx+3,hy-2,2,2,M[0]); if(it.rarity) px(hx+3,hy+3,2,2,rc); }
    else if(cl==='scythe'){ diag(4,30,20,1,wood); g.strokeStyle=M[1]; g.lineWidth=3; g.beginPath(); g.arc(14,10,12,-1.2,.6); g.stroke(); g.strokeStyle=M[2]; g.lineWidth=1; g.beginPath(); g.arc(14,10,13,-1.1,.5); g.stroke(); if(it.rarity) px(22,6,2,2,rc); }
    else if(cl==='xbow'){ px(4,15,22,3,wood); px(4,15,22,1,'#6a4a30'); px(24,6,3,21,M[1]); px(24,6,1,21,M[2]); g.strokeStyle='#cfc6b0'; g.lineWidth=1; g.beginPath(); g.moveTo(24,6); g.lineTo(14,16); g.lineTo(24,27); g.stroke(); px(6,18,3,5,wood); if(b.name==='Repeater'){ px(10,10,9,4,'#3a2a1e'); px(10,10,9,1,'#6a4a30'); } if(it.rarity) px(12,14,2,2,rc); }
    else if(cl==='katana'){ const L=b.h===2?22:18; for(let i=0;i<L;i++){ const bend=Math.round(Math.pow(i/L,2)*3); px(11+i,20-i-bend,2,2,M[1]); px(11+i,20-i-bend,1,1,M[2]); } px(9,20,4,4,it.rarity===4?'#c9a96a':'#2a2428'); for(let i=1;i<7;i++){ px(9-i,23+i,2,2,'#1c1416'); if(i%2) px(9-i,23+i,1,1,'#cdbf9e'); } if(it.rarity) px(3,28,2,2,rc); }
    else if(cl==='rapier'){ for(let i=0;i<20;i++) px(11+i,19-i,1,1,i%3?M[1]:M[2]); g.strokeStyle=it.rarity===4?'#c9a96a':'#7a7680'; g.lineWidth=1; g.beginPath(); g.arc(10,21,4,0,Math.PI*2); g.stroke(); for(let i=1;i<5;i++) px(8-i,23+i,2,2,wood); px(3,28,3,3,it.rarity?rc:'#6a5a48'); }
    else if(cl==='cleaver'){ g.fillStyle=M[1]; g.beginPath(); g.moveTo(12,20); g.lineTo(22,6); g.lineTo(29,11); g.lineTo(19,25); g.fill(); g.strokeStyle=M[2]; g.lineWidth=1; g.beginPath(); g.moveTo(29,11); g.lineTo(19,25); g.stroke(); px(23,10,2,2,'#0a0607'); px(16,18,4,1,'#5a1414'); for(let i=0;i<6;i++) px(11-i,22+i,2,2,wood); if(it.rarity) px(19,15,2,2,rc); }
    else if(cl==='sickle'){ for(let i=0;i<7;i++) px(12-i,20+i,2,2,wood); g.strokeStyle=M[1]; g.lineWidth=3; g.beginPath(); g.arc(18,12,9,Math.PI*.75,Math.PI*1.95); g.stroke(); g.strokeStyle=M[2]; g.lineWidth=1; g.beginPath(); g.arc(18,12,7.5,Math.PI*.8,Math.PI*1.9); g.stroke(); if(it.rarity) px(12,18,2,2,rc); }
    else if(cl==='flail'){ diag(3,30,11,1,wood); for(let i=0;i<6;i++) px(14+i*2,18-i*2+(i%2),2,2,i%2?'#6a6470':'#3e3a44'); const hr=b.name==='Morning Star'?6:5; g.fillStyle=M[1]; g.beginPath(); g.arc(25,8,hr,0,Math.PI*2); g.fill(); for(let i=0;i<8;i++){ const a=i/8*Math.PI*2; px(25+Math.cos(a)*(hr+1)-1,8+Math.sin(a)*(hr+1)-1,2,2,M[2]); } px(23,6,2,2,M[2]); if(it.rarity) px(24,8,2,2,rc); }
    else if(cl==='hammer'){ const big=b.h===2; diag(4,30,big?18:15,1,wood); const hx=big?18:16, hy=big?2:5, hs=big?12:9; g.save(); g.translate(hx+hs/2,hy+hs/2); g.rotate(Math.PI/4); g.fillStyle=M[1]; g.fillRect(-hs/2,-hs/3,hs,hs*.66); g.fillStyle=M[2]; g.fillRect(-hs/2,-hs/3,hs,1); g.fillStyle=M[0]; g.fillRect(hs/2-2,-hs/3,2,hs*.66); g.restore(); if(!big){ g.fillStyle=M[0]; g.beginPath(); g.moveTo(13,8); g.lineTo(8,4); g.lineTo(12,11); g.fill(); } if(it.rarity) px(hx+hs/2-1,hy+hs/2-1,2,2,rc); }
    else if(cl==='shield'){ if(b.name==='Buckler'||b.name==='Pavise'&&false){} if(b.name==='Pavise'){ px(8,3,16,26,M[1]); px(8,3,16,1,M[2]); px(8,3,2,26,M[0]); px(15,6,2,20,'#5a1414'); px(11,13,10,2,'#5a1414'); } else { g.fillStyle=M[1]; g.beginPath(); g.arc(16,16,11,0,Math.PI*2); g.fill(); g.strokeStyle=M[2]; g.lineWidth=1; g.beginPath(); g.arc(16,16,11,0,Math.PI*2); g.stroke(); px(13,13,6,6,M[0]); px(15,15,2,2,M[2]); } if(it.rarity) px(15,9,2,2,rc); }
  } else if(it.slot==='armor'){ const tier=b.look!=null?b.look:Math.max(0,BASES.armor.indexOf(b)); const cl=tier===0?['#3e3024','#6b5640','#8f7a5c']:M;
    px(9,8,14,17,cl[1]); px(5,7,6,6,cl[1]); px(21,7,6,6,cl[1]); px(9,8,3,17,cl[0]); px(20,9,2,15,cl[2]); px(5,7,6,1,cl[2]); px(21,7,6,1,cl[2]);
    g.clearRect(13,7,6,3); px(10,25,12,3,cl[0]); px(9,20,14,2,'#3a2618'); px(15,20,2,2,'#a08a50');
    if(tier===1) for(let y=10;y<20;y+=2)for(let x=11;x<21;x+=2)px(x+(y%4?1:0),y,1,1,cl[0]);
    if(tier>=3) for(let y=12;y<20;y+=3)px(9,y,14,1,cl[0]);
    if(tier===4) px(9,8,14,17,'rgba(10,8,10,.45)');
    if(it.rarity) px(15,13,2,2,rc);
  } else if(it.slot==='helm'&&b.look===-1){ /* v39: hoods and cowls */ g.fillStyle=M[1]; g.beginPath(); g.moveTo(8,26); g.lineTo(9,10); g.quadraticCurveTo(16,2,23,10); g.lineTo(24,26); g.closePath(); g.fill(); g.fillStyle='#0d0a0a'; g.beginPath(); g.ellipse(16,18,5,6,0,0,Math.PI*2); g.fill(); px(9,10,3,16,M[0]); px(12,7,8,1,M[2]); if(it.rarity) px(15,9,2,2,rc);
  } else if(it.slot==='helm'){ const tier=b.look!=null?Math.max(0,b.look):Math.max(0,BASES.helm.indexOf(b)); g.fillStyle=M[1]; g.beginPath(); g.arc(16,16,9,Math.PI,0); g.fill(); px(7,16,18,9,M[1]); px(7,16,4,9,M[0]); px(10,9,6,2,M[2]);
    px(9,18,14,2,'#0d0a0a'); if(tier>=2) for(let x=12;x<21;x+=3) px(x,21,1,3,'#0d0a0a');
    if(tier>=3) px(15,3,2,5,'#7a1517'); if(tier===4){px(6,10,2,6,M[2]);px(24,10,2,6,M[2]);}
    if(it.rarity) px(15,12,2,2,rc);
  } else if(it.slot==='ring'){ g.strokeStyle=M[1]; g.lineWidth=3; g.beginPath(); g.arc(16,19,7,0,Math.PI*2); g.stroke(); g.strokeStyle=M[2]; g.lineWidth=1; g.beginPath(); g.arc(16,19,8,Math.PI*1.1,Math.PI*1.5); g.stroke();
    px(12,7,8,6,M[0]); px(13,8,6,4,rc); px(14,8,2,1,'#fff');
  } else { for(let i=0;i<10;i++){px(6+i,4+i*1.3|0,1,1,M[2]);px(26-i,4+i*1.3|0,1,1,M[2]);}
    g.fillStyle=M[1]; g.beginPath(); g.moveTo(16,16); g.lineTo(22,22); g.lineTo(16,29); g.lineTo(10,22); g.fill(); px(14,20,4,4,rc); px(14,20,1,1,'#fff'); }
  it._ic=c; return c; }
function iconEl(it){ const c=document.createElement('canvas'); c.width=c.height=32; c.getContext('2d').drawImage(getIcon(it),0,0); return c; }

/* ---------- serialise for save/continue ---------- */
const serItem=it=>it&&Object.assign({s:it.slot,b:it.base.name,r:it.rarity,n:it.name,l:it.ilvl,d:it.dq,a:it.aff,f:it.fl,t:it.set,v34:1,v44:1},it.rc?{rc:it.rc}:null,it.ins?{ins:1}:null); /* v34: every item saved from now on carries v34, so the one-time rebudget skips it */ /* v23: rc = times offered at the altar, ins = insured */
const deItem=o=>{ if(!o) return o; const it=fin({id:++IID,slot:o.s,base:baseByName(o.b),rarity:o.r,name:o.n,ilvl:o.l,dq:o.d,aff:o.a||[],fl:o.f,set:o.t}); if(it){ if(o.rc) it.rc=o.rc; if(o.ins) it.ins=1; if(!o.v34&&typeof rebudget==='function'&&rebudget(it)) fin(it); if(!o.v44&&typeof rebudget44==='function'&&rebudget44(it)) fin(it); } return it; };

/* ---------- grids (v21): the satchel and the stash, items take up room by size ----------
   Each grid is 16 × 10 cells per tab. A ring or amulet is 1×1, a helm or crossbow 2×2, armour 2×3, a one-handed weapon
   1×2 to 2×3, a two-hander or a polearm up to 2×4. Every item in a grid carries its tab and cell (bt, bx, by); the lists
   (P.bag, STASH) stay plain arrays so older modules that splice them still work.
   Tabs unlock with play: the satchel gains a tab each time this character finishes the campaign (up to 4); the shared
   stash gains a tab each time any character does (up to 6). */
const BAG_W=16, BAG_H=10, BAG_TABS_MAX=4, STASH_TABS_MAX=6;
function itemSize(it){ if(!it) return [1,1]; const b=it.base||{};
  if(it.slot==='ring'||it.slot==='amulet') return [1,1];
  if(it.slot==='helm'||it.slot==='gloves'||it.slot==='boots') return [2,2];
  if(it.slot==='armor') return [2,3];
  if(b.cls==='shield') return b.name==='Pavise'?[2,3]:[2,2];
  if(b.cls==='xbow') return [2,2];
  if(b.h===2){ const thin=b.cls==='spear'||b.cls==='scythe'||(b.wid||0)<=3; return [thin?1:2,(b.len||0)>=30||thin?4:3]; }
  return [(b.wid||0)>=6?2:1,(b.len||0)<=12?2:3]; }
const charClears=()=>{ if(typeof META==='undefined'||!META) return 0; return Math.max(META.clears|0,(META.cleared||[]).length); };
const bagTabs=()=>clamp(1+charClears(),1,BAG_TABS_MAX);
const stashTabs=()=>clamp(typeof STASH_TABS!=='undefined'?STASH_TABS|0:1,1,STASH_TABS_MAX);
const GBAG={id:'bag',name:'satchel',list:()=>P.bag,set:v=>{ P.bag=v; },tabs:()=>bagTabs(),max:BAG_TABS_MAX};
const GSTASH={id:'stash',name:'stash',list:()=>STASH,set:v=>{ STASH=v; },tabs:()=>stashTabs(),max:STASH_TABS_MAX};
const overlaps=(a,ax,ay,b)=>{ const [w,h]=itemSize(a), [ow,oh]=itemSize(b); return ax<b.bx+ow&&ax+w>b.bx&&ay<b.by+oh&&ay+h>b.by; };
function gFits(G,it,t,x,y,ignore){ const [w,h]=itemSize(it); if(t<0||t>=G.tabs()||x<0||y<0||x+w>BAG_W||y+h>BAG_H) return false;
  for(const o of G.list()){ if(o===it||(ignore&&ignore.includes(o))||o.bx==null||(o.bt|0)!==t) continue; if(overlaps(it,x,y,o)) return false; }
  return true; }
function gSpot(G,it,ignore,pref){ const n=G.tabs(), order=[]; if(pref!=null&&pref<n) order.push(pref); for(let t=0;t<n;t++) if(t!==pref) order.push(t);
  for(const t of order) for(let y=0;y<BAG_H;y++) for(let x=0;x<BAG_W;x++) if(gFits(G,it,t,x,y,ignore)) return [t,x,y]; return null; }
function gAdd(G,it,pref){ if(!it) return false; const s=gSpot(G,it,null,pref); if(!s) return false; [it.bt,it.bx,it.by]=s; G.list().push(it); return true; }
/* repair a grid: anything without a cell, outside an open tab, or overlapping gets a new cell; returns what didn't fit */
function gEnsure(G){ const ok=[], lost=[], n=G.tabs();
  for(const it of G.list()){ const t=it.bt|0, [w,h]=itemSize(it);
    const keep=it.bx!=null&&t<n&&it.bx>=0&&it.by>=0&&it.bx+w<=BAG_W&&it.by+h<=BAG_H&&!ok.some(o=>(o.bt|0)===t&&overlaps(it,it.bx,it.by,o));
    if(keep){ it.bt=t; ok.push(it); } else { it.bx=null; lost.push(it); } }
  G.set(ok); return lost.filter(it=>!gAdd(G,it)); }
/* the satchel */
const bagFits=(it,x,y,ignore,t)=>gFits(GBAG,it,t==null?(it.bt|0):t,x,y,ignore);
const bagSpot=(it,ignore,pref)=>gSpot(GBAG,it,ignore,pref);
const bagRoom=it=>!!gSpot(GBAG,it);
function bagAdd(it,pref){ if(!it||!P) return false; return gAdd(GBAG,it,pref); }
/* take item i out and put `old` where it was (or anywhere it fits, or at your feet) */
function bagSwapOut(i,old){ const it=P.bag[i]; const t=it?it.bt|0:0, x=it?it.bx:null, y=it?it.by:null; P.bag.splice(i,1);
  if(!old) return; if(x!=null&&gFits(GBAG,old,t,x,y)){ old.bt=t; old.bx=x; old.by=y; P.bag.push(old); return; }
  if(!bagAdd(old,t)){ dropItem(old,P.x-P.face*10,P.y-10,true); if(typeof toast==='function') toast(`No room in the satchel. ${old.name} fell at your feet.`); } }
function bagEnsure(){ if(!P||!P.bag) return; for(const it of gEnsure(GBAG)){ if(typeof stashAdd==='function'&&stashAdd(it)) continue; if(typeof L!=='undefined'&&L) dropItem(it,P.x,P.y-10,true); } }
/* the stash */
const stashAdd=(it,pref)=>{ const r=gAdd(GSTASH,it,pref); if(r&&typeof saveStash==='function') saveStash(); return r; };
