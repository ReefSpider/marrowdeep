'use strict';
/* ===== v32: both hands on one button, and the off-hand comparison =====
   - Holding attack alternates hands for every pair that can swing together: two one-handers (as before), Giant's Grip
     with a two-hander in the main hand (it only worked with a one-hander there), and Twin Crossbows (both crossbows now
     fire from the held left button; right-click still fires the off hand on its own).
   - An off-hand weapon you're too low a level for is skipped instead of swinging for nothing.
   - Tooltips for a weapon that could go in your off hand add a second block: what it would change there. */

/* ---------- who swings together ---------- */
dualMelee=function(){ if(!P||!offActive()) return false; const o=P.equip.off, m=P.equip.weapon; if(!o||!m) return false;
  if(typeof canWear==='function'&&(!canWear(o)||!canWear(m))) return false;
  const oc=o.base.cls, mc=m.base.cls; if(oc==='shield'||!(o.base.max>0)||!(m.base.max>0)) return false;
  if(oc==='xbow'||mc==='xbow') return oc==='xbow'&&mc==='xbow';
  return true; };

/* ---------- where an item could go in the off hand ---------- */
function offCandidate(it){ if(!P||!it||it.slot!=='weapon'||!(it.base.max>0)||!has('off')) return false; const b=it.base;
  if(b.h===0) return false; /* off-hand-only items already compare against the off hand */
  if(b.h===1) return !(P.equip.weapon&&P.equip.weapon.base.h===2&&P.way!=='giant');
  if(b.h===2) return P.way==='giant';
  return false; }

/* the whole comparison block, for a chosen slot */
const OFF_ROWS=new Set(['DPS','Main hand DPS','Off hand DPS','Off-hand damage','Attack rate']);
function compareFor(it,slot,only){ const cur=P.equip[slot], a=P.stats, live=sheetDps(), b=statsWith(slot,it), next=sheetWith(slot,it); const rows=[];
  const dps=[['DPS',live.total,next.total],['Main hand DPS',live.main,next.main],['Off hand DPS',live.off,next.off]];
  for(const [n,va,vb] of dps){ const d=(vb||0)-(va||0); if(Math.abs(d)<.5) continue; rows.push([d>0,n,`${d>0?'+':'−'}${fmtN(Math.abs(d))}${va>0?` <small>(${d>0?'+':'−'}${Math.round(Math.abs(d)/va*100)}%)</small>`:''}`]); }
  for(const [n,f,fmt] of CMP){ const va=f(a)||0, vb=f(b)||0, d=vb-va; if(Math.abs(d)<.005) continue; const F=fmt||(v=>String(Math.round(v))); rows.push([d>0,n,`${d>0?'+':'−'}${F(Math.abs(d)).replace(/^-/,'')}`]); }
  if(only) return {cur,rows:rows.filter(r=>only.has(r[1]))};
  for(const k of (typeof ELEMS!=='undefined'?ELEMS:[])){ const d=(b[k]||0)-(a[k]||0); if(d) rows.push([d>0,`<span style="color:${ELEM[k].c}">${ELEM[k].jp} ${ELEM[k].n}</span>`,`${d>0?'+':'−'}${Math.abs(d)}`]); }
  return {cur,rows}; }
function cmpBlock(head,rows,note){ const body=rows.length?rows.map(([up,n,v])=>`<div class="cr ${up?'up':'dn'}"><span>${n}</span><b>${up?'▲':'▼'} ${v}</b></div>`).join(''):`<div class="cr eq">No change to your stats</div>`;
  const up=rows.filter(r=>r[0]).length, dn=rows.length-up; const verdict=!rows.length?'':up&&!dn?'<div class="cv up">An upgrade</div>':dn&&!up?'<div class="cv dn">A step down</div>':'<div class="cv mx">Trade-offs</div>';
  return `<div class="cmp"><div class="ch">${head}</div>${note||''}${body}${verdict}</div>`; }

compareHTML=function(it){ if(!P||!it) return ''; for(const k in P.equip) if(P.equip[k]===it) return '';
  const slot=targetSlot(it); if(slot==='off'&&!has('off')) return `<div class="cmp"><div class="ch">Off hand only · learn Second Hand to use it</div></div>`;
  const nm=c=>`<span style="color:${RCOL[c.rarity]}">${c.name}</span>`;
  const m=compareFor(it,slot); let h=cmpBlock(m.cur?`${slot==='off'?'In your off hand · c':'C'}ompared with ${nm(m.cur)}`:`Your ${typeof SLOT_WORD!=='undefined'&&SLOT_WORD[slot]||slot} slot is empty`,m.rows);
  if(slot==='weapon'&&offCandidate(it)){ const o=compareFor(it,'off',OFF_ROWS); const note='<div class="cr eq">Other stats count in either hand</div>';
    h+=cmpBlock(o.cur?`In your off hand · compared with ${nm(o.cur)}`:'In your off hand · it is empty',o.rows,note); }
  return h; };

/* the satchel's stat list: the sheet DPS, per hand when both swing */
(function(){ const o=renderInv; renderInv=function(){ const r=o(); const el=$('#stats'); if(el&&P&&P.stats){ const d=sheetDps();
    el.insertAdjacentHTML('beforeend',`<span title="Damage per second on paper: holding attack, nothing missing, every swing landing. The meter in play shows what you really deal.">DPS (sheet)</span><b>${fmtN(d.total)}${d.off>0?` <small>${d.dual?'alternating':'main'} · off ${fmtN(d.off)}</small>`:''}</b>`); } return r; }; })();

/* a tooltip with comparisons that won't fit the screen's height puts them in a column beside the item */
(function(){ const st=document.createElement('style'); st.textContent=`#tip.wide{display:flex;gap:calc(var(--u)*1.4);max-width:calc(var(--u)*62);text-align:center}#tip.wide>.tcol{flex:1 1 0;min-width:calc(var(--u)*20)}#tip.wide>.tcol+.tcol{border-left:1px solid #2a2220;padding-left:calc(var(--u)*1.4)}#tip.wide .cmp:first-child{margin-top:0;border-top:0;padding-top:0}`; document.head.appendChild(st); })();
(function(){ const o=showTipHTML; showTipHTML=function(html,el){ tip.classList.remove('wide'); o(html,el); const sr=stage.getBoundingClientRect(); if(tip.offsetHeight<=sr.height-8||!/class="cmp"/.test(html)) return;
  const d=document.createElement('div'); d.innerHTML=html; const cmps=[...d.querySelectorAll(':scope>.cmp')]; if(!cmps.length) return; cmps.forEach(c=>c.remove());
  tip.classList.add('wide'); o(`<div class="tcol">${d.innerHTML}</div><div class="tcol">${cmps.map(c=>c.outerHTML).join('')}</div>`,el); }; })();
