'use strict';
/* ===== tune (v16): foes and bosses, measured with level-appropriate magic/rare gear =====
   Before this pass (see v16 notes):
   - First descent: an ordinary ghoul died in 1 swing at the Ossuary, under 2 in the Warren; levels held 28–71 foes.
   - Bosses died in 21–50 hits, about 7–12 seconds of swinging, on every tier.
   Now:
   - Ordinary foes have 2.5× life on the first descent (Pilgrim) and 1.8× on Ashen and deeper. Their damage is unchanged.
   - The first descent is sparse: fewer foes per room, packs are rarer and smaller (world.js populate), and arena and
     last-chamber waves are smaller. The hordes start on Ashen. Foes give more XP to make up for there being fewer.
   - Bosses have 10× life (Count Varhollow 7× on each of his two bars), hit 20% harder and wait less between attacks.
     The stagger bar fills at 7% of their life (was 16%) so breaking them stays a regular reward in a long fight. */
const FOE_HP=()=>ngp===0?2.5:1.8, FOE_XP=()=>ngp===0?1.8:1.3;
const BOSS_HP_MUL={mother:10,choir:10,tithe:10,saint:10,count:7};
const NO_TUNE=new Set(['anchor','relicx']);
(function(){ const o=mkEnemy; mkEnemy=function(s){ const e=o(s); if(!NO_TUNE.has(e.type)){ const m=FOE_HP(); e.hp*=m; e.maxhp*=m; e.xp*=FOE_XP(); } return e; }; })();
(function(){ const o=spawnBoss; spawnBoss=function(key){ const e=o(key); const m=BOSS_HP_MUL[key]||10; e.hp=e.maxhp=Math.round(e.maxhp*m); e.dmg*=1.2; e.stagMax=e.maxhp*.07; return e; }; })();
(function(){ const o=endPat; endPat=function(e,cd){ o(e,cd); e.cd*=.85; }; })();
/* the first descent fights fewer at a time (arena waves; the last chamber's are in waves.js) */
const thinWaves=()=>ngp===0;
