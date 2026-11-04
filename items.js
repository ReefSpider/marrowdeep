'use strict';
/* ===== items: generation, grades, tooltips, icons, save/restore ===== */
let IID=0;
const sumAff=(it,k)=>it.aff.reduce((s,a)=>s+(a.k===k?a.v:0),0);
const varies=a=>a.lo!=null&&a.lo!==a.hi;
const isShield=it=>it&&it.base.cls==='shield';
const affSlot=it=>it.base.cls==='shield'?'shield':it.slot;
const valTxt=(k,v)=>AFX[k][0]+v+AFX[k][1];
function gradeRange(lo,hi,g){ const sp=hi-lo; if(g===4) return [hi+Math.max(1,Math.ceil(hi*.5)),hi+Math.max(2,Math.ceil(hi))]; if(g===3) return [hi,hi];
  const b1=lo+Math.floor(sp*.4), b2=lo+Math.floor(sp*.75); if(g===0) return [lo,b1]; if(g===1) return [b1+1,b2]; return [b2+1,hi-1]; }
function valueFor(lo,hi,g){ while(g>0){ const r=gradeRange(lo,hi,g); if(r[0]<=r[1]) return ri(r[0],r[1]); g--; } return ri(lo,gradeRange(lo,hi,0)[1]); }
function rollStat(lo,hi){ if(lo===hi) return {v:lo,g:3}; let r=R()*GR.reduce((a,b)=>a+b.w,0), g=0; for(let i=0;i<GR.length;i++){ r-=GR[i].w; if(r<=0){g=i;break;} }
  while(g>0&&g<3){ const rg=gradeRange(lo,hi,g); if(rg[0]<=rg[1]) break; g--; } return {v:valueFor(lo,hi,g),g}; }
function fin(it){ const ed=sumAff(it,'ed'),edef=sumAff(it,'edef');
  if(it.slot==='weapon'&&it.base.max>0){const sc=1+Math.max(0,(it.ilvl||1)-1)*.075;it.min=Math.max(1,Math.round(it.base.min*sc*(1+ed/100)));it.max=Math.max(it.min+1,Math.round(it.base.max*sc*(1+ed/100)));}
  if(it.base.def!=null) it.def=Math.round(it.base.def*(it.dq||100)/100*(1+edef/100)*(1+Math.max(0,(it.ilvl||1)-1)*.05));
  return it; }
/* every stat category that can appear on this slot, each counted once, so all are equally likely */
function catPool(slot){ const ks=[]; for(const a of PRE.concat(SUF)) if(a.s.includes(slot)&&!ks.includes(a.k)) ks.push(a.k); return ks; }
function rollAff(list,slot,ilvl,used){ const hasEl=[...used].some(k=>ELEM_KEYS.includes(k)); const keys=catPool(slot).filter(k=>!used.has(k)&&!(hasEl&&ELEM_KEYS.includes(k))); if(!keys.length) return null; const k=pick(keys); used.add(k);
  const defs=PRE.concat(SUF).filter(d=>d.k===k&&d.s.includes(slot)); const a=defs.find(d=>list.includes(d))||pick(defs);
  const mt=Math.min(a.v.length-1,Math.floor(ilvl/4)); const t=ri(Math.max(0,mt-1),mt); const lo=a.v[t][0],hi=a.v[t][1]; const rs=rollStat(lo,hi); return {k,v:rs.v,g:rs.g,lo,hi,nm:a.n[t],pre:PRE.includes(a)}; }
/* one stat of a known category, rolled at the tier this item level reaches (used by legendaries and the altar) */
function affOf(k,slot,ilvl,preferPre){ const defs=PRE.concat(SUF).filter(d=>d.k===k&&d.s.includes(slot)); if(!defs.length) return null; const a=defs.find(d=>preferPre==null||PRE.includes(d)===preferPre)||defs[0];
  const mt=Math.min(a.v.length-1,Math.floor(ilvl/4)); const t=ri(Math.max(0,mt-1),mt); const lo=a.v[t][0],hi=a.v[t][1]; const rs=rollStat(lo,hi); return {k,v:rs.v,g:rs.g,lo,hi,nm:a.n[t],pre:PRE.includes(a)}; }
function oddsW(w,mf){ const m=1+(mf||0)/100*.6; return w.map((v,i)=>i===0?v:v*(i>=4?Math.sqrt(m):m)); }
function rollRarity(w,mf){ const ww=oddsW(w,mf); let s=ww.reduce((a,b)=>a+b,0),r=R()*s; for(let i=0;i<ww.length;i++){r-=ww[i];if(r<=0)return i;} return 0; }
function mkFixed(def,rar){ return fin({id:++IID,slot:def.slot,base:baseByName(def.base),rarity:rar,name:def.name,ilvl:0,dq:ri(95,105),aff:def.aff.map(([k,lo,hi])=>{ const rs=rollStat(lo,hi); return {k,lo,hi,v:rs.v,g:rs.g}; }),fl:def.fl,set:def.set}); }
function mkBase(name){ const b=baseByName(name); const slot=Object.keys(BASES).find(s=>BASES[s].includes(b)); return fin({id:++IID,slot,base:b,rarity:0,name:b.name,ilvl:1,dq:100,aff:[]}); }
function genItem(ilvl,w,mf,forceSlot){
  let r=rollRarity(w,mf||0);
  if(r===5){const it=mkFixed(pick(ABYSSAL),5);it.ilvl=ilvl;return fin(it);}
  if(r===4){const it=mkFixed(pick(UNIQUES),4);it.ilvl=ilvl;return fin(it);}
  const slot=forceSlot||wpick(SLOTW); if((slot==='ring'||slot==='amulet')&&r===0) r=1;
  const bs=BASES[slot].filter(b=>b.lvl<=ilvl+1).sort((a,b)=>a.lvl-b.lvl); const base=slot==='weapon'?pick(bs.slice(-7)):bs[Math.max(0,bs.length-1-ri(0,2))]||BASES[slot][0];
  const it={id:++IID,slot,base,rarity:r,ilvl,dq:ri(90,110),aff:[]}; const used=new Set(); const as=affSlot(it);
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
  } else if(it.slot==='armor'){ const tier=Math.max(0,BASES.armor.indexOf(b)); const cl=tier===0?['#3e3024','#6b5640','#8f7a5c']:M;
    px(9,8,14,17,cl[1]); px(5,7,6,6,cl[1]); px(21,7,6,6,cl[1]); px(9,8,3,17,cl[0]); px(20,9,2,15,cl[2]); px(5,7,6,1,cl[2]); px(21,7,6,1,cl[2]);
    g.clearRect(13,7,6,3); px(10,25,12,3,cl[0]); px(9,20,14,2,'#3a2618'); px(15,20,2,2,'#a08a50');
    if(tier===1) for(let y=10;y<20;y+=2)for(let x=11;x<21;x+=2)px(x+(y%4?1:0),y,1,1,cl[0]);
    if(tier>=3) for(let y=12;y<20;y+=3)px(9,y,14,1,cl[0]);
    if(tier===4) px(9,8,14,17,'rgba(10,8,10,.45)');
    if(it.rarity) px(15,13,2,2,rc);
  } else if(it.slot==='helm'){ const tier=Math.max(0,BASES.helm.indexOf(b)); g.fillStyle=M[1]; g.beginPath(); g.arc(16,16,9,Math.PI,0); g.fill(); px(7,16,18,9,M[1]); px(7,16,4,9,M[0]); px(10,9,6,2,M[2]);
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
const serItem=it=>it&&{s:it.slot,b:it.base.name,r:it.rarity,n:it.name,l:it.ilvl,d:it.dq,a:it.aff,f:it.fl,t:it.set};
const deItem=o=>o&&fin({id:++IID,slot:o.s,base:baseByName(o.b),rarity:o.r,name:o.n,ilvl:o.l,dq:o.d,aff:o.a||[],fl:o.f,set:o.t});
