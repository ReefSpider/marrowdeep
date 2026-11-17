'use strict';
/* ===== v52: grander bosses (BT, 17 Nov: "some of the boss sizes seem small, I want them to feel grander") =====
   Nine bosses were drawn at the hero's own size (16 by 30 px). They are now drawn, and can be hit, at 1.35 to 1.6
   times that. Their attacks reach as far as before: only the body grew. The Collector, the Choir, the Mother, the
   Saint and the Crowned Wound were already large and are unchanged. BSC holds the sizes. */
const BSC={odo:1.4,sisters:1.5,preacher:1.5,merrow:1.5,piet:1.4,brann:1.5,rook:1.35,gideon:1.6,count:1.45};
(function(){ const o=spawnBoss; spawnBoss=function(key){ const e=o(key); const k=e&&BSC[key]; if(k){ e.sc=k; e.w=Math.round(e.w*k); e.h=Math.round(e.h*k); } return e; }; })();
(function(){ const o=updBoss; updBoss=function(e,dt){ const r=o(e,dt); if(e.sc&&(e.kind==='odo'||e.kind==='rook')&&!e.mounted&&e.w===14){ e.w=Math.round(14*e.sc*1.15); e.h=Math.round(30*e.sc*1.15); } if(e.sc&&e.kind==='count'&&e.phase>1) e.sc=0; return r; }; })();
for(const k of Object.keys(BSC)){ const o=BDRAW[k]; if(!o) continue; BDRAW[k]=function(c,e){ const s=e&&e.sc?e.sc*((k==='odo'||k==='rook')&&!e.mounted?1.15:1):0; if(!s) return o(c,e); c.save(); c.scale(s,s); o(c,e); c.restore(); }; }
(function(){ const o=dSister; dSister=function(c,e,i,dim){ if(!e||!e.sc) return o(c,e,i,dim); c.save(); c.scale(e.sc,e.sc); o(c,e,i,dim); c.restore(); }; })();
