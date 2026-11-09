'use strict';
/* ===== v43 loot (BT, 9 Nov) =====
   1. "i have not hit one bow or even really seen them": a weapon drop picked its class evenly from 14, so a crossbow was
      1 in 14 weapons (about 3% of everything). Crossbows now weigh 3 classes' worth (about 1 weapon in 5, 8% of everything), and 5 when
      you walk the Way of Twin Crossbows. Loot memory (play37) still lowers whatever you've just found.
   2. "the random chests in the secret level need 10x better odds": in the Hollow Garden, every chest other than the
      Hollow Reliquary rolls Unique and Abyssal about ten times as often (weights ×10; Legendary ×3 and plain items ×0.25,
      so the uniques aren't crowded out: on Pilgrim a chest goes from 0.8% Unique / 9.5% Legendary to about 7.5% / 27%).
      The reliquary keeps its own odds. */
const L46={xbow:3, xbowWay:5, secretW:[.25,1,1,3,10,10]};
const clsBoost=c=>c==='xbow'?(P&&P.way==='xbows'?L46.xbowWay:L46.xbow):1;
pickWeaponBase=function(ilvl){ const ok=BASES.weapon.filter(b=>b.lvl<=ilvl+1); const bias=typeof LM!=='undefined'&&LM.on&&!LM.off;
  const cw={}; for(const b of ok) cw[b.cls]=(bias?lmW(LM.cls,b.cls,LM_K.cls):1)*clsBoost(b.cls); const c=wpick(cw);
  const inC=ok.filter(b=>b.cls===c); const hw={}; for(const b of inC) hw[b.h]=bias?lmW(LM.cls,c+':'+b.h,LM_K.cls):1; const h=+wpick(hw);
  const pool=inC.filter(b=>b.h===h).sort((a,b)=>b.lvl-a.lvl); return pool[pool.length>1&&R()<.3?1:0]; };
(function(){ const o=oddsW; oddsW=function(w,mf){ const r=o(w,mf); if(typeof SECRET==='undefined'||!SECRET.on||w===CW[4]) return r; return r.map((v,i)=>v*(L46.secretW[i]??1)); }; })();
