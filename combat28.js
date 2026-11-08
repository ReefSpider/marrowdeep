'use strict';
/* ===== v28 combat (BT's notes on v24) =====
   - Weapon classes feel different. Each class scales how long a swing takes, how hard it hits, its knockback and
     its stun:
       daggers      fast and hard, short reach, +10% crit, barely move a foe
       swords       the middle; two-handed swords hit harder and slower, with a little stagger
       axes         a bit heavier than swords; two-handed axes cleave hard
       maces        slower, and they stun
       hammers      slow, and they only land at the very end of the swing. A big hit, a shockwave, a long stun
       polearms     reach and push
       flails, scythes, katanas, rapiers, cleavers, sickles  each their own small twist
   - Hold to attack: holding the button keeps attacking at the weapon's pace, and clicking faster doesn't help.
     Attack speed from gear is softened past +30% and capped at +60%, and no swing is shorter than 0.2 s.
   - Dual wielding (two one-handed melee weapons) puts both on the left button: each swing alternates hands, as
     fast as you can hold it. A crossbow or a shield keeps its own button (right).
   - Spin attacks: heavy weapons end their combo in a full 360°, drawn as a ring of steel round the hero.
   - Kill sounds follow the weapon: blades slice, blunt weapons crush, daggers stab, axes chop, bolts thunk.
   - Elite bosses: after the campaign has been cleared once, on a harder tier, every boss rolls to be elite. You see
     the roll. It's rarer than for ordinary foes. An elite boss has more life and hits harder, and leaves a second
     boss chest.
   - Starting a run after a clear: choose Act I, II or III. */

/* ---------- weapon classes ---------- */
const WCLASS={
  dagger:{dur:.7,dm:1.0,kb:.4,stun:0,crit:10},
  sword:{dur:1,dm:1,kb:1,stun:0}, sword2:{dur:1.28,dm:1.45,kb:1.5,stun:.2},
  axe:{dur:1.05,dm:1.12,kb:1.1,stun:0}, axe2:{dur:1.35,dm:1.6,kb:1.6,stun:.15},
  mace:{dur:1.12,dm:1.15,kb:1.3,stun:.35}, mace2:{dur:1.42,dm:1.7,kb:1.8,stun:.5},
  hammer:{dur:1.5,dm:1.75,kb:2,stun:.7,late:1}, hammer2:{dur:1.75,dm:2.4,kb:2.4,stun:.9,late:1},
  spear:{dur:1.05,dm:1.05,kb:1.4,stun:0}, spear2:{dur:1.12,dm:1.15,kb:1.5,stun:0},
  katana:{dur:.9,dm:1,kb:.8,stun:0,crit:4}, katana2:{dur:1.1,dm:1.3,kb:1,stun:.1,crit:4},
  rapier:{dur:.78,dm:.88,kb:.5,stun:0,crit:8}, flail:{dur:1.15,dm:1.2,kb:1.2,stun:.25}, scythe:{dur:1.2,dm:1.3,kb:1.2,stun:0}, scythe2:{dur:1.2,dm:1.3,kb:1.2,stun:0},
  cleaver:{dur:1,dm:1.1,kb:.9,stun:0}, sickle:{dur:.8,dm:.9,kb:.5,stun:0}, xbow:{dur:1,dm:1,kb:1,stun:0}, shield:{dur:1,dm:1,kb:1,stun:1}, fist:{dur:.85,dm:1,kb:.6,stun:0}};
function wclassOf(it){ if(!it||!it.base) return WCLASS.fist; const c=it.base.cls; return (it.base.h===2&&WCLASS[c+'2'])||WCLASS[c]||WCLASS.sword; }
/* soft cap on attack speed: full value to +30%, 40% of the rest, never past +60% */
function capAS(as){ as=as||0; if(as<=30) return as; return Math.min(60,30+(as-30)*.4); }
/* hammers: every swing is a slam that lands at the very end */
MV.hsmash={t:'slam',a0:-2.2,a1:1.5,dur:.56,act:[.74,.88],dm:2.2,kb:300,reach:40,lunge:30,stun:1,nm:'Hammerfall'};
MV.hchop={t:'slam',a0:-2.0,a1:1.3,dur:.46,act:[.72,.86],dm:1.6,kb:240,reach:34,lunge:30,stun:1,nm:'Crack'};
MV.gwhirl={t:'spin',a0:-.4,a1:-.4+Math.PI*2,dur:.62,act:[.14,.86],dm:1.5,kb:220,reach:46,lunge:120,hop:-80,nm:'Great Whirl'};
(function(){ const o=comboFor; comboFor=function(it){ if(!it) return o(it); const b=it.base, c=b.cls;
  if(c==='hammer') return b.h===2?['hsmash','gwhirl','hsmash']:['hchop','hsmash'];
  if(c==='axe'&&b.h===2) return ['chop','cleave','gwhirl'];
  if(c==='mace'&&b.h===2) return ['cleave','gwhirl','cleave'];
  if(c==='sword'&&b.h===2&&b.name!=="Headsman's Blade"&&b.name!=='Zweihander') return ['slash','cleave','gwhirl'];
  if(c==='scythe') return ['reap','gwhirl','reap'];
  return o(it); }; })();
(function(){ const o=offComboFor; offComboFor=function(it){ if(it&&it.base.cls==='hammer') return ['hchop']; return o(it); }; })();
/* every swing is tuned for its class */
(function(){ const o=startMove; startMove=function(name,ci,hand){ o(name,ci,hand); const a=P.attack; if(!a||a.tuned) return; a.tuned=1; hand=hand||'main';
  const it=hand==='off'?P.equip.off:P.equip.weapon, W_=wclassOf(it), s=P.stats, base=MV[name]; if(!base||name==='plunge') return;
  const mv=Object.assign({},base); mv.dm=base.dm*W_.dm; mv.kb=Math.round(base.kb*W_.kb); if(W_.stun&&!mv.stun) mv.stun=W_.stun; mv.critB=W_.crit||0; a.mv=mv;
  if(mv.t!=='shoot'){ const spd=hand==='off'?s.ospd:s.spd; const rate=spd*(1+capAS(s.as)/100)*(P.houndT>0?1.35:1); a.dur=Math.max(.2,base.dur*W_.dur/rate); } }; })();
/* daggers and rapiers crit more */
(function(){ const o=strike; strike=function(e,mv,id,hand,dir,mult){ const b=mv&&mv.critB; if(b) P.stats.crit+=b; try{ return o(e,mv,id,hand,dir,mult); } finally{ if(b) P.stats.crit-=b; } }; })();
/* a stunning blow actually stuns: give dmgEnemy the stun the class carries */
(function(){ const o=dmgEnemy; dmgEnemy=function(e,d,crit,dir,kb,heavy,launch,stun){ const a=P&&P.attack; if(stun&&stun!==1&&a&&e&&!e.boss&&stun>0){ const r=o(e,d,crit,dir,kb,heavy,launch,0); if(!e.dead) e.stun=Math.max(e.stun||0,stun); return r; } return o(e,d,crit,dir,kb,heavy,launch,stun); }; })();

/* ---------- hold to attack; dual wield on one button ---------- */
function dualMelee(){ if(!offActive()) return false; const o=P.equip.off, m=P.equip.weapon; if(!o||!m) return false; const oc=o.base.cls; return oc!=='shield'&&oc!=='xbow'&&m.base.cls!=='xbow'&&m.base.h===1; }
(function(){ const o=update; update=function(dt){ if(mode==='play'&&P&&!P.dead&&(mouseHeld||down('j','x'))&&!P.attack&&!P.iai&&P.dash<=0&&P.hurtT<=0&&!(P.rootT>0)) buf.atk=time; return o(dt); }; })();
(function(){ const o=startMove; startMove=function(name,ci,hand){ hand=hand||'main';
  if(hand==='main'&&dualMelee()&&name!=='plunge'&&name!=='aerial'){ P._alt=!P._alt; if(P._alt===false){ const ol=offComboFor(P.equip.off); const oc=P.offWin>0?Math.min(P.offCombo+1,ol.length-1):0; if(ol[oc]&&ol[oc]!=='block') return o(ol[oc],oc,'off'); } }
  return o(name,ci,hand); }; })();
/* after an off-hand swing in dual wield, a held button carries straight on */
(function(){ const o=runAttack; runAttack=function(dt){ const a=P.attack; o(dt); if(a&&!P.attack&&a.hand==='off'&&dualMelee()&&(mouseHeld||down('j','x'))) buf.atk=time; }; })();

/* ---------- the 360: a ring of steel ---------- */
(function(){ const o=drawHeroAndFX; drawHeroAndFX=function(){ o(); const a=P&&P.attack; if(!a||a.mv.t!=='spin') return; const mv=a.mv, pr=a.t/a.dur; if(pr<mv.act[0]||pr>mv.act[1]+.05) return;
  const k=clamp((pr-mv.act[0])/(mv.act[1]-mv.act[0]),0,1), it=a.hand==='off'?P.equip.off:P.equip.weapon, r=Math.max(20,reachOf(mv,a.hand)*.75), cx=P.x-camR.x, cy=P.y-camR.y-16;
  const turns=mv.turns||1, ang=Math.PI*2*turns*k*(P.face>0?1:-1)-Math.PI/2, sweep=1.6;
  for(let i=0;i<12;i++){ const t0=ang-(P.face>0?1:-1)*sweep*i/12; const al=(1-i/12)*.7*(1-Math.max(0,k-.85)/.15);
    ectx.strokeStyle=`rgba(235,240,255,${al.toFixed(2)})`; ectx.lineWidth=i<2?3:2; const t1=t0+(P.face>0?-1:1)*.16; ectx.beginPath(); ectx.ellipse(cx,cy,r,r*.45,0,Math.min(t0,t1),Math.max(t0,t1),false); ectx.stroke(); }
  if(R()<.5) part({x:P.x+Math.cos(ang)*r,y:P.y-16+Math.sin(ang)*r*.45,vx:rnd(-30,30),vy:rnd(-30,10),g:0,life:.25,em:true,col:'#e8eeff'}); }; })();

/* ---------- kill sounds that match the weapon ---------- */
const KILL_SND={blade:['blade_slice','sword_hit_heavy','gore_flesh_rip'],blunt:['gore_big_smash','sword_hit_heavy'],stab:['gore_blood_hit','blade_friction'],chop:['gore_flesh_rip','sword_hit_02'],bolt:['gore_blood_hit']};
const KILL_KIND={sword:'blade',katana:'blade',scythe:'blade',sickle:'blade',dagger:'stab',rapier:'stab',spear:'stab',axe:'chop',cleaver:'chop',mace:'blunt',hammer:'blunt',flail:'blunt',xbow:'bolt',shield:'blunt',fist:'blunt'};
(function(){ const o=killEnemy; killEnemy=function(e,dir,crit){ const r=o(e,dir,crit); const lh=e&&e.lastHit; if(lh&&time-lh.t<.4&&typeof SMP!=='undefined'){ const k=KILL_KIND[lh.cls]||'blade', list=KILL_SND[k];
    const big=k==='blunt'||lh.heavy; SMP.rr(list,{v:big?.8:.6,rate:k==='blunt'?.85:k==='stab'?1.15:1,jit:.06,wet:.12});
    if(k==='blunt'){ AU.tone&&AU.tone('sine',70,30,.25,.5,.3); } else if(k==='stab'){ AU.noise&&AU.noise(.08,3000,1200,2,.2,'bandpass',.1); } } return r; }; })();

/* ---------- elite bosses ---------- */
function bossEliteOdds(){ if(!(META&&META.cleared&&META.cleared.length)||!(ngp>=1)) return 0; return Math.min(.25,.08+ngp*.03); }
(function(){ const o=bossIntro; bossIntro=function(e){ const odds=bossEliteOdds(); if(odds>0&&!e.rolled){ e.rolled=1; const roll=hsh(lvlIdx*131+ngp*17,Math.floor(L.w*7+L.h*3)+(META.runs|0)); const won=roll<odds;
    if(won){ e.elite=1; e.maxhp=Math.round(e.maxhp*1.6); e.hp=e.maxhp; e.name='Elite · '+e.name; }
    eliteRollFX(odds,won); }
  return o(e); }; })();
function eliteRollFX(odds,won){ const D=2.6; AU.tone&&AU.tone('square',660,660,.05,.05,.1);
  fx.push({t:0,dur:D+1.8,ui:1,upd(f){ const step=f.t<D?Math.floor(Math.pow(f.t/D,.5)*26):26; if(step!==f.s){ f.s=step; if(f.t<D) AU.tone&&AU.tone('square',520+(step%2)*140,520,.03,.04,.05); else if(!f.done){ f.done=1; if(won){ AU.roar(); shake(8); AU.bell&&AU.bell(); } else AU.tone&&AU.tone('sine',220,180,.3,.08,.2); } } },
    draw(f){ const g=ectx, cx=W/2, cy=78, land=f.t>=D; const show=land?(won?'ELITE':'common'):(f.s%2?'ELITE':'common'); const al=f.t>D+1.2?clamp(1-(f.t-D-1.2)/.6,0,1):1;
      g.save(); g.globalAlpha=al; g.fillStyle='rgba(10,6,8,.8)'; g.fillRect(cx-90,cy-22,180,44); g.strokeStyle=land&&won?'#e8c25a':'#6a5a50'; g.lineWidth=2; g.strokeRect(cx-90,cy-22,180,44);
      g.font='9px "IM Fell English SC", Georgia, serif'; g.textAlign='center'; g.fillStyle='#a89a88'; g.fillText(`Elite roll · ${Math.round(odds*100)}%`,cx,cy-10);
      g.font='18px "Pirata One", Georgia, serif'; g.fillStyle=show==='ELITE'?'#ffd66a':'#cfc6b2'; g.fillText(show==='ELITE'?'ELITE 精鋭':'Common',cx,cy+12);
      if(land&&won){ g.font='8px Georgia, serif'; g.fillStyle='#e8c25a'; g.fillText('More life, harder blows, and two chests.',cx,cy+30); } g.restore(); } }); }
(function(){ const o=hurtPlayer; hurtPlayer=function(d,src){ if(src&&src.boss&&src.elite) d=d*1.25; else if(!src||src.dead){ const b=enemies.find(x=>x.boss&&x.elite&&!x.dead); if(b&&L&&L.def.kind==='boss') d=d*1.15; } return o(d,src); }; })();
(function(){ const o=bossDefeated; bossDefeated=function(e){ o(e); if(!e.elite) return; for(let i=0;i<5;i++) dropGold(e.x+rnd(-30,30),e.y-30,Math.round(ri(10,20)*(1+dep()*.6)));
  fx.push({t:0,dur:3.6,upd(f){ if(f.t>=3.1&&!f.done){ f.done=true; chests.push({x:L.w*T/2+48,y:-30,tier:2,open:false,t:0,falling:true,vy:0,elite:1}); AU.wind(); toast('The elite leaves a second reliquary.'); } }}); }; })();
/* a gold rim and light round an elite boss */
(function(){ const o=drawBoss; drawBoss=function(e){ if(e.elite&&!e.dead){ addLight(e.x,e.y-e.h/2,120,.9,1,.82,.35); if(R()<.3) part({x:e.x+rnd(-e.w/2,e.w/2),y:e.y-rnd(0,e.h),vx:rnd(-10,10),vy:rnd(-50,-20),g:-10,life:.6,em:true,col:'#ffd66a'}); } return o(e); }; })();

/* ---------- after a clear: start at any act ---------- */
(function(){ const o=startDescent; startDescent=function(){ const cleared=META&&((META.cleared&&META.cleared.length)||(META.clears|0)); if(!cleared||(typeof COOP!=='undefined'&&COOP)) return o();
  const starts=['Act I','Act II','Act III'].map(a=>LEVELS.findIndex(d=>d.act===a&&d.kind==='dungeon')).filter(i=>i>0);
  const begin=i=>{ hideCard(); if(typeof runStart==='function') runStart(); ngp=META.pick||0; META.runs++; META.inCabin=false; P.life=P.stats.life; P.potions=Math.max(P.potions,2); updBelt(); AU.door(); lvlIdx=i-1; goLevel(i); };
  mode='card'; hud.hidden=true;
  showCard({title:'Where do you climb in?',jp:'入口',body:`${DIFFS[META.pick||0].n}. You've cleared the campaign, so any act is open. The maps will be new.`,
    buttons:starts.map(i=>({label:`${LEVELS[i].act} · ${LEVELS[i].name}`,fn:()=>begin(i)})).concat([{label:'Back',ghost:1,fn:()=>{ hideCard(); mode='play'; hud.hidden=false; }}])}); }; })();
