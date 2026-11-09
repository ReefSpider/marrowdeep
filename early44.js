'use strict';
/* ===== v42: Pilgrim's middle stops being a walk (BT, 9 Nov co-op run: "too op again in act 2") =====
   What the reports showed (fresh co-op Pilgrim run on v41): from the Black Camp on, bosses died in 2–7 s and landed 0–2
   hits; ordinary foes hit for ~3 and it took 66–78 of them to drop you. Both heroes wore a unique or legendary by
   level 10 and sheet DPS jumped ×3 in one pick-up.
   What the lab showed: on Pilgrim a unique kit did ×2.8–3.3 the damage of a rare kit and took twice the hits to die.
   The cause was each unique's signature damage type: it reached its top tier at item level 8 (+20%), so a unique helm or
   breastplate added ~15 flat damage to every hit while early weapons hit for 5–11, and rares never roll damage types.
   Even a rare kit took 20–25 ghoul hits to die there (the v40 target is a dozen or so).
   1. Signature damage types reach their tiers at item level 8 and 16 (were 4 and 8), and on anything that isn't a
      weapon they're half size. Weapons keep the full signature, so a unique still feels like one. Items you already own
      are moved to the new range once, keeping how good the roll was.
   2. Pilgrim, from the end of Act I (monster level 5) to level 10: ordinary foes and bosses ramp up to hit 60% harder
      and carry 25% more life, and stay there for the rest of the campaign. Defense counts for less there too: the
      reports showed blows of 3 because a unique breastplate and helm reached the 80% cap against level-9 monsters
      (defense is weighed against 1.15 × monster level + 43, which is small that early); Pilgrim adds 5 × monster level
      to that, ramping in with the rest (at level 9: 53 → 98, a 215-defense kit takes 31% of a blow instead of 20%).
   E44 holds the numbers. */
const E44={sigStep:8, sigGear:.5, pilFrom:4, pilTo:10, pilDmg:.6, pilHp:.25, pilDef:5};

/* ---------- 1. signature damage types ---------- */
sigTier=function(d,ilvl){ return Math.min(d.v.length-1,Math.floor((ilvl||1)/E44.sigStep)); };
const isSigGear=it=>it&&it.slot!=='weapon';
(function(){ const o=signatureElem; signatureElem=function(it,ilvl){ const a=o(it,ilvl); if(!a||!isSigGear(it)) return a;
  const f=E44.sigGear; a.lo=Math.max(1,Math.round(a.lo*f)); a.hi=Math.max(a.lo+1,Math.round(a.hi*f)); const rs=rollStat(a.lo,a.hi); a.v=rs.v; a.g=rs.g; return a; }; })();
/* saved uniques and abyssals: the signature type (the damage type a unique carries that isn't in its own list) takes the new
   range, keeping how far up the old range it rolled */
function rebudget44(it){ if(!it||!it.aff||it.rarity<4) return false; const def=it.rarity===5?ABYSSAL.find(d=>d.name===it.name):UNIQUES.find(d=>d.name===it.name); if(!def) return false;
  let ch=false; const il=it.ilvl||1;
  for(const a of it.aff){ if(a.x||!ELEM_KEYS.includes(a.k)||def.aff.some(x=>x[0]===a.k)) continue; const s=PRE.find(x=>x.k===a.k); if(!s) continue;
    const t=sigTier(s,il), m=(it.rarity===5?BUD.sigA:BUD.sigU)*flatMul(a.k,il)*(isSigGear(it)?E44.sigGear:1);
    let lo=Math.max(1,Math.round(s.v[t][0]*m)), hi=Math.max(lo+1,Math.round(s.v[t][1]*m)); if(lo===a.lo&&hi===a.hi) continue;
    const top=a.g===4?gradeRange(a.lo,a.hi,4)[1]:a.hi, q=top>a.lo?clamp((a.v-a.lo)/(top-a.lo),0,1):1;
    a.lo=lo; a.hi=hi; if(a.g===4){ const [n0,n1]=gradeRange(lo,hi,4); a.v=Math.round(n0+(n1-n0)*q); } else a.v=Math.round(lo+(hi-lo)*q); ch=true; }
  return ch; }
/* items.js: serItem writes v44:1 and deItem calls rebudget44 once for anything saved before it */

/* ---------- 2. Pilgrim from the end of Act I ---------- */
function pilRamp(){ if(typeof tierNow==='function'?tierNow()!==0:ngp!==0) return 0; const m=typeof mlvl==='function'?mlvl():1;
  return clamp((m-E44.pilFrom)/(E44.pilTo-E44.pilFrom),0,1); }
(function(){ const o=mkEnemy; mkEnemy=function(s){ const e=o(s); if(!e||e.type==='anchor'||e.type==='relicx') return e; const k=pilRamp(); if(k>0){ const h=1+E44.pilHp*k; e.hp*=h; e.maxhp*=h; e.dmg*=1+E44.pilDmg*k; } return e; }; })();
(function(){ const o=spawnBoss; spawnBoss=function(key){ const e=o(key); if(!e) return e; const k=pilRamp(); if(k>0){ const h=1+E44.pilHp*k; e.hp=Math.round(e.hp*h); e.maxhp=Math.round(e.maxhp*h); e.dmg*=1+E44.pilDmg*k; } return e; }; })();
(function(){ const o=defMul; defMul=def=>{ const k=pilRamp(); if(!(k>0)) return o(def); const m=typeof mlvl==='function'?Math.max(1,mlvl()):1; def=Math.max(0,def||0);
  return 1-Math.min(defCapNow(),def/(def+B34.defK*m+B34.defC+E44.pilDef*m*k)); }; })();
