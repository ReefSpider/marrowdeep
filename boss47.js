'use strict';
/* ===== v44: bosses you have to read (BT, 10 Nov: "the bosses were soooo easy … you can just rush and smack them down
   so fast. we need to make them like you need to think about it, can damage them when they are doing some mechanics,
   like other game bosses") =====
   The reports: Act III Pilgrim bosses died in 2–8 s in co-op, mostly without landing a hit.
   Guard 構え: a boss is on guard by default. A guarded boss takes 10% of a blow (grey numbers, a dull clang), and
   blows on guard fill its stagger bar at a fifth of the usual rate. After a break its stance can't be broken again
   for 5 s (steady hitting used to keep a boss broken a quarter to half of the fight, which is what rushing lived on).
   Opening 隙: when a boss finishes an attack it is open for a moment (1.4 s, 1.1 s in its second phase, 0.9 s in its
   third). It won't start the next attack until the opening ends, its body doesn't hurt to touch, and it takes 125%.
   A red 隙 over its head and on the life bar shows when, with a bell on the first frame.
   Parry a boss's blow and it's open for 2 s. Stagger (崩し, the bar under its life) still takes 150%.
   Rushing in all the time lands mostly on guard; reading the attack, staying out of it and punishing the recovery is
   how a boss goes down. Damage over time (burn, rot, bleed) lands in full, guarded or not.
   Pilgrim bosses from Act II on also carry 60% more life (they died in seconds even with the guard counted).
   Co-op: the host runs the boss and tells everyone when an opening starts ('bo'); each player's blows are scaled on
   their own side, which is what the host then receives. BGU holds the numbers. */
const BGU={guard:.1, open:1.25, win:[1.4,1.1,.9], parryWin:2, stagGuard:.2, stagLock:5, pilHp:.6};
const bossOpen=e=>!!e&&(e.state==='stagger'||(e.openT||0)>time);
function bossSetOpen(e,sec,quiet){ if(!e||e.dead) return; const was=bossOpen(e); e.openT=Math.max(e.openT||0,time+sec);
  if(!was&&!quiet){ AU.ting&&AU.ting(); sparks(e.x,e.y-e.h-4,6,'#ff6a4a'); }
  if(typeof COOP!=='undefined'&&COOP&&NET.host&&e.nid) bcast({t:'bo',ep:NET.epoch,n:e.nid,r:+(e.openT-time).toFixed(2)});
  bossTeach(); }
let bgTold=false; try{ bgTold=!!store.get('marrowdeep.bossGuard'); }catch(e){}
function bossTeach(){ if(bgTold) return; bgTold=true; try{ store.set('marrowdeep.bossGuard',1); }catch(e){} toast('Bosses guard. Strike when 隙 shows: just after they attack, after a parry, or when broken.'); }

/* openings: the end of every attack, and a parried blow */
(function(){ const o=endPat; endPat=function(e,cd){ const hadPat=!!(e&&e.pat); o(e,cd); if(!hadPat||!e||e.dead||e.state==='stagger') return;
  const w=BGU.win[Math.max(0,Math.min(2,(e.phase||1)-1))]; e.cd=Math.max(e.cd||0,w); bossSetOpen(e,w); }; })();
(function(){ const o=parry; parry=function(src){ o(src); if(src&&src.boss&&!src.dead) bossSetOpen(src,BGU.parryWin); }; })();
(function(){ const o=bossBreak; bossBreak=function(e,dur){ o(e,dur); if(e) e.stagLock=time+(dur||2.4)+BGU.stagLock; if(e&&!e.dead&&typeof COOP!=='undefined'&&COOP&&NET.host&&e.nid) bcast({t:'bo',ep:NET.epoch,n:e.nid,r:dur||2}); }; })();

/* the guard on every blow (DoTs land in elements.js before this, through e.hp directly) */
(function(){ const o=dmgEnemy; dmgEnemy=function(e,d,crit,dir,kb,heavy,launch,stun){ if(!e||!e.boss||e.dead||e.intro||e.shield) return o(e,d,crit,dir,kb,heavy,launch,stun);
  if(bossOpen(e)){ if(e.state!=='stagger') d=d*BGU.open; return o(e,Math.max(1,Math.round(d)),crit,dir,kb,heavy,launch,stun); }
  d=Math.max(1,Math.round(d*BGU.guard)); e._guardHit=time; if(!(e._gs>time)){ e._gs=time+.12; AU.clang&&AU.clang(); sparks(e.x-Math.sign(e.x-P.x)*e.w*.4,e.y-e.h*.55,3,'#9a948a'); }
  return o(e,d,crit,dir,0,heavy,0,0); }; })();
/* stagger fills at half rate on guard */
(function(){ const o=bossStagAdd; bossStagAdd=function(e,d,...a){ if(e&&(e.stagLock||0)>time) return; return o(e,bossOpen(e)?d:d*BGU.stagGuard,...a); }; })();
/* no touch damage while open or broken: updBoss checks overlap → hurtPlayer(e.dmg*.6,e) */
(function(){ const o=hurtPlayer; hurtPlayer=function(d,src){ if(src&&src.boss&&bossOpen(src)&&Math.abs(d-src.dmg*.6)<.01) return; return o(d,src); }; })();

/* co-op: the host says when */
(function(){ const o=onMsg; onMsg=function(s,m){ if(m&&m.t==='bo'){ if(!NET.host&&m.ep===NET.epoch){ const e=enemies.find(x=>x.nid===m.n); if(e){ const was=bossOpen(e); e.openT=time+m.r; if(!was){ AU.ting&&AU.ting(); } bossTeach(); } } return; } return o(s,m); }; })();

/* Pilgrim, Act II on: more life */
(function(){ const o=spawnBoss; spawnBoss=function(key){ const e=o(key); if(!e) return e; const k=typeof pilRamp==='function'?pilRamp():0; if(k>0){ const h=1+BGU.pilHp*k; e.hp=Math.round(e.hp*h); e.maxhp=Math.round(e.maxhp*h); if(e.stagMax) e.stagMax*=h; } e.openT=0; return e; }; })();

/* ---------- the tell ---------- */
(function(){ const o=drawFX; drawFX=function(){ o(); for(const e of enemies){ if(!e.boss||e.dead||e.intro) continue; const open=bossOpen(e); if(!open) continue;
  const sx=Math.round(e.x-camR.x), top=Math.round(e.y-e.h-camR.y), k=e.state==='stagger'?1:clamp(((e.openT||0)-time)/.4,0,1), pulse=.55+.45*Math.sin(time*14);
  ectx.save(); ectx.globalAlpha=(.5+.5*pulse)*(.35+.65*k); const w=Math.round(e.w/2)+3, h=Math.round(e.h)+2, bx=sx-w, by=top-1;
  ectx.fillStyle='#ff4a32'; for(const [x,y,dx,dy] of [[bx,by,1,1],[sx+w,by,-1,1],[bx,by+h,1,-1],[sx+w,by+h,-1,-1]]){ ectx.fillRect(x-(dx<0?3:0),y-(dy<0?0:0),4,1); ectx.fillRect(x-(dx<0?0:0),y-(dy<0?3:0),1,4); }
  ectx.globalAlpha=.9*(.35+.65*k); ectx.font='bold 9px "Shippori Mincho",serif'; ectx.textAlign='center'; ectx.fillStyle='#ff5a40'; ectx.fillText('隙',sx,top-8); ectx.restore();
  addLight(e.x,e.y-e.h*.6,60,.35*pulse*k+.15,1,.25,.15); } }; })();
(function(){ const st=document.createElement('style'); st.textContent=`#bossbar .bgs{margin-left:.6em;font-family:'Shippori Mincho',serif;font-size:.9em;letter-spacing:.05em;color:#7a7268}
#bossbar .bgs.open{color:#ff5a40;text-shadow:0 0 6px rgba(255,80,50,.7)}`; document.head.appendChild(st); })();
setInterval(()=>{ try{ const b=enemies.find(e=>e.boss&&!e.dead&&!e.intro), nm=$('#bossbar .bn'); if(!nm) return; let t=nm.querySelector('.bgs'); if(!b){ if(t) t.textContent=''; return; }
  if(!t){ t=document.createElement('span'); t.className='bgs'; nm.appendChild(t); } const open=bossOpen(b); const txt=b.state==='stagger'?'崩し · broken':open?'隙 · open':'構え · guarding';
  if(t.textContent!==txt) t.textContent=txt; t.classList.toggle('open',open); }catch(e){} },100);
