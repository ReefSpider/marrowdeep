'use strict';
/* ===== tune (v16): foes and bosses, measured with level-appropriate magic/rare gear =====
   Before this pass (see v16 notes):
   - First descent: an ordinary ghoul died in 1 swing at the Ossuary, under 2 in the Warren; levels held 28–71 foes.
   - Bosses died in 21–50 hits, about 7–12 seconds of swinging, on every tier.
   Now:
   - Ordinary foes have 2.5× life on the first descent (Pilgrim) and 1.8× on Ashen and deeper. Their damage is unchanged.
   - The first descent is sparse: fewer foes per room, packs are rarer and smaller (world.js populate), and arena and
     last-chamber waves are smaller. The hordes start on Ashen. Foes give more XP to make up for there being fewer.
   - Bosses have more life (v18 values below), wait less between attacks, and from Ashen hit 20% harder. */
const FOE_HP=()=>ngp===0?2.5:1.8, FOE_XP=()=>ngp===0?2.6:1.3; /* v18: Pilgrim XP 1.8 → 2.6 so you keep pace with the monsters */
/* v18 (playtest: "can't get through the first boss, the fight would take 20 minutes"): life now climbs act by act
   instead of a flat ×10 — Pilgrim ×1.8 Mother, ×2.5 Choir, ×3.5 Collector, ×4.5 Saint, ×4.5 Count per bar; Ashen and deeper ×1.5 on top.
   The +20% damage only applies from Ashen. The stagger bar fills at 10% of life (was 7%). Boss XP doubled. */
const BOSS_HP_MUL={mother:1.8,choir:2.5,tithe:3.5,saint:4.5,count:4.5}, BOSS_TIER_MUL=()=>ngp===0?1:1.5;
for(const k in BOSSES) BOSSES[k].xp*=2;
const NO_TUNE=new Set(['anchor','relicx']);
(function(){ const o=mkEnemy; mkEnemy=function(s){ const e=o(s); if(!NO_TUNE.has(e.type)){ const m=FOE_HP(); e.hp*=m; e.maxhp*=m; e.xp*=FOE_XP(); } return e; }; })();
(function(){ const o=spawnBoss; spawnBoss=function(key){ const e=o(key); const m=(BOSS_HP_MUL[key]||3)*BOSS_TIER_MUL(); e.hp=e.maxhp=Math.round(e.maxhp*m); if(ngp>0) e.dmg*=1.2; e.stagMax=e.maxhp*.1; return e; }; })();
(function(){ const o=endPat; endPat=function(e,cd){ o(e,cd); e.cd*=.85; }; })();
/* the first descent fights fewer at a time (arena waves; the last chamber's are in waves.js) */
const thinWaves=()=>ngp===0;
