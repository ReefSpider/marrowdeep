'use strict';
/* ===== balance pass (v14): the Pit fights back =====
   Measured before this pass: once a character had any real gear, ordinary foes died in under one swing and needed
   25–50 hits to kill them, and it got easier the higher you went, because gear grows faster than monsters.
   A level 13 wearing level 38 gear could clear monster level 37.
   1. Foes ramp up with monster level: life up to ×3.6 and damage up to ×3.2. Monster levels 1–3 are unchanged,
      so the first steps with the Rusted Falchion feel the same; the ramp is full by about monster level 15 (life)
      and 25 (damage).
   2. Fighting above your level hurts: for every monster level more than 2 above yours, you deal 3% less damage
      (down to 25%) and take 5% more (up to ×3).
   3. Items have a level requirement (items.js, reqLvl): item level − 6. Worn items you're too low for give nothing
      until you reach their level, and you can't put new ones on. */
const RAMP={hp:m=>clamp(1+.22*Math.max(0,m-3),1,3.6), dmg:m=>clamp(1+.1*Math.max(0,m-3),1,3.2), bossHp:m=>clamp(1+.12*(m-1),1,2.2), bossDmg:m=>clamp(1+.08*(m-1),1,2.6)};
const curMlvl=()=>typeof mlvl==='function'?mlvl():1;
(function(){ const o=mkEnemy; mkEnemy=function(s){ const e=o(s); const m=curMlvl(); e.hp*=RAMP.hp(m); e.maxhp*=RAMP.hp(m); e.dmg*=RAMP.dmg(m); return e; }; })();
(function(){ const o=spawnBoss; spawnBoss=function(key){ const e=o(key); const m=curMlvl(); e.hp=e.maxhp=Math.round(e.maxhp*RAMP.bossHp(m)); e.dmg*=RAMP.bossDmg(m); return e; }; })();

/* ---------- the level gap ---------- */
/* v18: the penalty starts 4 levels above you (was 2) and bites more gently: −2.5% dealt, +4% taken per level */
function levelGap(){ if(!P) return 0; return Math.max(0,curMlvl()-P.lvl-4); }
const gapDealt=()=>Math.max(.25,1-.025*levelGap()), gapTaken=()=>Math.min(3,1+.04*levelGap());
(function(){ const o=dmgEnemy; dmgEnemy=function(e,d,...rest){ if(P&&!P._remote&&L&&L.def.kind!=='cabin') d*=gapDealt(); return o(e,d,...rest); }; })();
(function(){ const o=hurtPlayer; hurtPlayer=function(d,src){ if(P&&L&&L.def.kind!=='cabin') d*=gapTaken(); return o(d,src); }; })();

/* ---------- level requirements ---------- */
const canWear=it=>!it||!P||P.lvl>=reqLvl(it);
/* items you're too low for stay on you but give nothing */
(function(){ const o=calcStats; calcStats=function(){ if(!P||!P.equip) return o(); const off={}; for(const k in P.equip){ const it=P.equip[k]; if(it&&!canWear(it)){ off[k]=it; P.equip[k]=null; } }
  try{ return o(); } finally{ for(const k in off) P.equip[k]=off[k]; P.inactive=Object.keys(off); } }; })();
(function(){ const o=equipFromBag; equipFromBag=function(i,wantOff){ const it=P.bag[i];
  if(it&&!canWear(it)&&!(typeof COOP!=='undefined'&&COOP&&NET.giveTo!=null)){ invMsg(`Requires level ${reqLvl(it)}. You are level ${P.lvl}.`); AU.tone('square',200,150,.12,.08,.2); return; } return o(i,wantOff); }; })();
(function(){ const o=equipItem; equipItem=function(it){ if(!canWear(it)){ toast(`Requires level ${reqLvl(it)}. You are level ${P.lvl}.`); return false; } return o(it); }; })();
/* show it: the HUD names the gap, and worn items you're too low for are marked in the satchel */
(function(){ const o=renderInv; renderInv=function(){ o(); if(!P||!P.inactive||!P.inactive.length) return; const eq=$('#equip'); if(!eq) return;
  for(const k of P.inactive){ const el=eq.querySelector(`[data-slot="${k}"]`)||null; if(el) el.style.outline='2px solid #ff5a4a'; }
  invMsg(`Too low a level to use: ${P.inactive.map(k=>P.equip[k]&&P.equip[k].name).filter(Boolean).join(', ')}. They give nothing until you catch up.`); }; })();
(function(){ const o=gainXP; gainXP=function(n){ const was=P&&P.lvl; const r=o(n); if(P&&P.lvl!==was&&P.inactive&&P.inactive.length){ calcStats(); if(!P.inactive.length) toast('You can use all your gear again.'); } return r; }; })();
(function(){ const o=loadLevel; loadLevel=function(idx,opt){ const r=o(idx,opt); const g=levelGap(); if(g>0&&L&&L.def.kind!=='cabin') setTimeout(()=>toast(`These foes are ${g+4} levels above you: you deal ${Math.round(gapDealt()*100)}% damage and take ${Math.round(gapTaken()*100)}%.`),3200); return r; }; })();
