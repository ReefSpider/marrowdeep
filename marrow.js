'use strict';
/* ===== the long climb after the war =====
   - There is no level cap.
   - Once a character has finished the campaign, every level after that costs 8% more XP than the one before,
     compounding (on top of the normal curve), so levels keep coming but slow down for good.
   v46: the ten stat boosts and their satchel tab that used to live here are now small nodes in the one tree
   (tree50.js). What stays is the XP curve. META.marrow still marks when the campaign was finished ({start}); its old
   alloc is ignored. */
const MARROW_GROWTH=1.08;
const marrowOn=()=>!!(META&&META.marrow);
function unlockMarrow(){ if(marrowOn()||!P) return; META.marrow={start:P.lvl}; }

/* ---------- the XP curve: no cap, and exponential once the war is over ---------- */
(function(){ const o=xpNext; xpNext=function(l){ const b=o(l); if(!marrowOn()||!(META.cleared&&META.cleared.length)) return b; /* v25: the steeper curve only after a campaign clear */ const over=l-(META.mxs||META.marrow.start)+1; return over>0?Math.round(b*Math.pow(MARROW_GROWTH,over)):b; }; })();

/* ---------- marking the clear ---------- */
(function(){ const o=campaignCleared; campaignCleared=function(a){ unlockMarrow(); if(META&&!META.mxs&&P) META.mxs=P.lvl; return o(a); }; })();
/* characters who finished the campaign before the mark existed get it the next time they're loaded */
(function(){ const o=continueGame; continueGame=function(){ const r=o(); if(META&&META.cleared&&META.cleared.length&&!marrowOn()) unlockMarrow(); return r; }; })();
