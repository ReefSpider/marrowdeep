'use strict';
/* ===== v34: scaling, from the first real playtest reports (claude/v34-notes.md) =====
   What the reports showed: on Pilgrim one player finished at level 44 against level-21 monsters without dying once;
   on the tiers above, the Act III bosses died in 2–8 seconds and the deepest tiers were easier than Pilgrim.
   Fixed elsewhere: the boss tier scaling and kill XP still used the old level index (meta.js, actors.js), and the
   unique/abyssal budget (items.js BUD, data.js ABYSSAL). This file holds the rest:
   1. XP falls off when you out-level the monsters, so your level tracks the monster level instead of running away.
   2. Weapon classes are brought within a band of each other: a class's best base at an item level is scaled to the
      median of its hand (one- or two-handed). Bases inside a class keep their order, so the best-base chase stays.
   3. Defense is measured against the monster level, with a cap, so piling it up can't make you untouchable.
   4. Ordinary foes above Pilgrim get ×1.22 life (plus 1% a tier), which closes the seam where Ashen's first level was
      easier than the Count's (they had lost 28% of their life at the step), and 2% more damage a tier.
   5. Items from older saves are brought to the new budget once, on load. */
const B34={
  xpFree:2, xpStep:.375, xpFloor:.02,         /* v36: full XP up to 2 levels above the monsters, then 62% / 25% / 2% (was −20% a level, floor 5%: deep tiers ran 5–6 above) */
  defK:1.15, defC:43, defCap:.8,              /* blow taken ×(1 − def ÷ (def + 1.15 × monster level + 43)), at most 80% off */
  tierHp:t=>t>0?1.22+.01*t:1, tierDmg:t=>1+.02*t, /* ordinary foes: Ashen ×1.23 … Marrow's End ×1.32 life, ×1.02 … ×1.2 damage */
  wpers:{hammer:.92,hammer2:.92,mace2:.95,spear:.95,spear2:.95} /* slams stun and spears reach: they give a little damage for it */
};

/* ---------- 1. XP falls off above the monster level ---------- */
function xpFalloff(){ if(!P||!L||!L.def||L.def.kind==='cabin'||typeof mlvl!=='function') return 1; const g=P.lvl-mlvl();
  return g<=B34.xpFree?1:Math.max(B34.xpFloor,1-B34.xpStep*(g-B34.xpFree)); }
(function(){ const o=gainXP; gainXP=function(n,...r){ return o(n*xpFalloff(),...r); }; })();

/* ---------- 2. weapon classes within a band ---------- */
const WN={dps:new Map(),ref:new Map()};
function wBaseDps(b){ if(WN.dps.has(b)) return WN.dps.get(b); const it={base:b,name:b.name,rarity:2}; const W=wclassOf(it);
  const list=comboFor(it).filter(n=>MV[n]&&n!=='block'&&MV[n].t!=='shoot'); let d=0,t=0;
  for(const n of list){ const mv=MV[n]; d+=(mv.multi?2:1)*mv.dm*W.dm; t+=Math.max(.2,mv.dur*W.dur/b.spd); }
  const v=list.length&&t>0?(b.min+b.max)/2*d/t*(1.05+(W.crit||0)/100):0; WN.dps.set(b,v); return v; }
function wBest(cls,h,il){ let best=null; for(const x of BASES.weapon) if(x.cls===cls&&x.h===h&&x.max>0&&x.lvl<=il+1&&(!best||x.min+x.max>best.min+best.max)) best=x; return best; }
function wRef(h,il){ const k=h+':'+il; if(WN.ref.has(k)) return WN.ref.get(k);
  const v=[...new Set(BASES.weapon.filter(x=>x.h===h&&x.max>0&&x.lvl<=il+1).map(x=>x.cls))].map(c=>wBaseDps(wBest(c,h,il))).filter(x=>x>0).sort((a,b)=>a-b);
  const r=v.length?v[Math.floor(v.length/2)]:0; WN.ref.set(k,r); return r; }
function wNorm(it){ const b=it&&it.base; if(!b||!(b.max>0)||b.h===0||typeof wclassOf!=='function') return 1; const il=Math.max(1,Math.min(110,it.ilvl||1));
  const best=wBest(b.cls,b.h,il)||b, bd=wBaseDps(best), ref=wRef(b.h,il); if(!(bd>0&&ref>0)) return 1;
  const key=b.cls+(b.h===2?'2':''); return clamp(ref*(B34.wpers[key]||1)/bd,.5,3); }
(function(){ const o=fin; fin=function(it){ const r=o(it); if(r&&r.slot==='weapon'&&r.base&&r.base.max>0){ const m=wNorm(r); if(m!==1){ r.min=Math.max(1,Math.round(r.min*m)); r.max=Math.max(r.min+1,Math.round(r.max*m)); } } return r; }; })();

/* ---------- 3. defense against the monster level ---------- */
defMul=def=>{ const m=typeof mlvl==='function'?Math.max(1,mlvl()):1; def=Math.max(0,def||0); return 1-Math.min(B34.defCap,def/(def+B34.defK*m+B34.defC)); };

/* ---------- 4. deeper tiers are harder at the same monster level ---------- */
(function(){ const o=mkEnemy; mkEnemy=function(s){ const e=o(s); if(ngp>0&&e.type!=='anchor'&&e.type!=='relicx'){ const t=tierNow(); e.hp*=B34.tierHp(t); e.maxhp*=B34.tierHp(t); e.dmg*=B34.tierDmg(t); } return e; }; })();
/* bosses get neither: with the depth bug fixed (meta.js) they already climb steeply through the tiers */

/* ---------- 5. items from older saves ----------
   Items saved before v34 are brought to the new budget once, when they load: a unique's or abyssal's own stats take the
   new ranges, keeping how good the roll was (a roll 80% of the way up its old range lands 80% up the new one); its
   signature damage type takes the tier its item level reaches; and any Abyssal-grade stat on any item moves into the
   new +10–25% band. The two extra legendary stats on a unique are left alone. Returns true when something changed. */
function rebudget(it){ if(!it||!it.aff) return false; let ch=false; const il=it.ilvl||1;
  const oldG4=hi=>[hi+Math.max(1,Math.ceil(hi*.5)),hi+Math.max(2,Math.ceil(hi))];
  const def=it.rarity===5?ABYSSAL.find(d=>d.name===it.name):it.rarity===4?UNIQUES.find(d=>d.name===it.name):null;
  for(const a of it.aff){ if(!(a.hi>0)) continue; let lo=a.lo, hi=a.hi;
    if(def&&!a.x){ const d=def.aff.find(x=>x[0]===a.k);
      if(d&&d[2]>0){ const m=(it.rarity===4?BUD.uEmp:1)*flatMul(a.k,il)*(a.k==='ed'?(it.rarity===4?BUD.edU:BUD.edA):1)*((a.k==='ed'||a.k==='edef')?edScale(il):1); lo=Math.round(d[1]*m); hi=Math.max(lo,Math.round(d[2]*m)); }
      else if(!d&&ELEM_KEYS.includes(a.k)){ const s=PRE.find(x=>x.k===a.k); if(s){ const t=sigTier(s,il), m=(it.rarity===5?BUD.sigA:BUD.sigU)*flatMul(a.k,il); lo=Math.round(s.v[t][0]*m); hi=Math.max(lo+1,Math.round(s.v[t][1]*m)); } } }
    let q; if(a.g===4&&a.v>a.hi){ const [o0,o1]=oldG4(a.hi); q=clamp((a.v-o0)/Math.max(1,o1-o0),0,1); } else q=a.hi>a.lo?clamp((a.v-a.lo)/(a.hi-a.lo),0,1):1;
    if(lo===a.lo&&hi===a.hi&&a.g!==4) continue;
    a.lo=lo; a.hi=hi; if(a.g===4){ const [n0,n1]=gradeRange(lo,hi,4); a.v=Math.round(n0+(n1-n0)*q); } else a.v=Math.round(lo+(hi-lo)*q); ch=true; }
  return ch; }
