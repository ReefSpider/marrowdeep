'use strict';
/* ===== v41: armour families lean, sets reward, milestones step up (claude/builds-plan.md) =====
   Leaning: a Light, Medium or Heavy piece rolls its family's stats twice as often and one tier higher (at the top tier,
   half the time into a band 25% above it). Light and Heavy roll everything else one tier lower; Medium is even.
     Light → Finesse, attack speed, run speed, crit · Medium → Might, Finesse, life, crit · Heavy → Fortitude, Might,
     enhanced defense, life, thorns.
   Sets (armour, helm, gloves, boots of one family):
     Light 2 Hunter: +15% run speed, rolls 20% further · 4 Shadow: the first swing after a roll always crits
     Medium 2 Soldier: +10% damage, +5% attack speed · 4 Veteran: draughts heal 35% more and harden you (−25% damage taken, 3 s)
     Heavy 2 Bastion: −10% damage taken, threat ×2 · 4 Juggernaut: no knockback; once a minute a killing blow leaves 1 life
   Milestones, by attribute total:
     Might 25 Heavy Hand (light blows always flinch) · 50 Breaker (crits stagger bosses twice as hard) · 100 Earthsplitter
       (two-handed slams send a ground wave)
     Finesse 25 Light Feet (rolls cost 30% less grit) · 50 Quickstep (rolling through a blow: +20% attack speed, 2 s)
       · 100 Flurry (every 5th hit strikes twice)
     Fortitude 25 Iron Skin (the first hit after 5 s untouched is halved) · 50 Stand Firm (no knockback or flinch while
       attacking) · 100 Bulwark (allies within 120 px take 10% less) */

/* ---------- leaning rolls ---------- */
const LEAN={L:new Set(['fin','as','ms','crit']),M:new Set(['mig','fin','life','crit']),H:new Set(['fort','mig','edef','life','thorns'])};
let ROLL_FAM=null;
(function(){ const o=pickGearBase; pickGearBase=function(slot,ilvl){ const b=o(slot,ilvl); ROLL_FAM=b&&b.fam||null; return b; }; })();
(function(){ const o=genItem; genItem=function(...a){ ROLL_FAM=null; try{ return o(...a); } finally{ ROLL_FAM=null; } }; })();
(function(){ const o=rollAff; rollAff=function(list,slot,ilvl,used){ const F=ROLL_FAM&&GEAR_SLOTS.includes(slot)?ROLL_FAM:null; if(!F) return o(list,slot,ilvl,used);
  const hasEl=[...used].some(k=>ELEM_KEYS.includes(k)); const keys=catPool(slot).filter(k=>!used.has(k)&&!(hasEl&&ELEM_KEYS.includes(k))); if(!keys.length) return null;
  const w={}; for(const k of keys) w[k]=LEAN[F].has(k)?2:1; const k=wpick(w); used.add(k); const lean=LEAN[F].has(k);
  const defs=PRE.concat(SUF).filter(d=>d.k===k&&d.s.includes(slot)); const a=defs.find(d=>list.includes(d))||pick(defs);
  const top=a.v.length-1, mt=Math.min(top,Math.floor(ilvl/4)); let t=ri(Math.max(0,mt-1),mt), band=false;
  if(lean){ if(t<top) t++; else if(R()<.5) band=true; } else if(F!=='M') t=Math.max(0,t-1);
  let lo=a.v[t][0], hi=a.v[t][1]; if(band){ lo=a.v[top][1]; hi=Math.max(lo+1,Math.round(a.v[top][1]*1.25)); }
  [lo,hi]=flatScale(k,lo,hi,ilvl); const rs=rollStat(lo,hi); return {k,v:rs.v,g:rs.g,lo,hi,nm:a.n[Math.min(t,a.n.length-1)],pre:PRE.includes(a)}; }; })();

/* ---------- sets and milestones in the stats ---------- */
const SETS41={L:[{n:'Hunter',d:'+15% run speed · rolls carry 20% further'},{n:'Shadow',d:'the first swing after a roll always crits'}],
  M:[{n:'Soldier',d:'+10% damage · +5% attack speed'},{n:'Veteran',d:'draughts heal 35% more and harden you: −25% damage taken for 3 s'}],
  H:[{n:'Bastion',d:'−10% damage taken · threat ×2'},{n:'Juggernaut',d:'no knockback · once a minute a killing blow leaves you at 1 life'}]};
const MILES={mig:[[25,'Heavy Hand','light blows always flinch ordinary foes'],[50,'Breaker','crits stagger bosses twice as hard'],[100,'Earthsplitter','two-handed slams send a ground wave']],
  fin:[[25,'Light Feet','rolls cost 30% less grit'],[50,'Quickstep','rolling through a blow gives +20% attack speed for 2 s'],[100,'Flurry','every 5th hit strikes twice']],
  fort:[[25,'Iron Skin','the first hit after 5 s untouched is halved'],[50,'Stand Firm','no knockback or flinch while attacking'],[100,'Bulwark','allies within 120 px take 10% less']]};
function famCount(){ const n={L:0,M:0,H:0}; if(P&&P.equip) for(const k of GEAR_SLOTS){ const it=P.equip[k]; if(it&&it.base&&it.base.fam&&!(P.inactive&&P.inactive.includes(k))) n[it.base.fam]++; } return n; }
(function(){ const o=calcStats; calcStats=function(){ const r=o(); const s=P&&P.stats; if(!s) return r;
  const n=famCount(); s.fams=n; s.takenMul=1; s.healMul=1; s.rollMul=1; s.rollCost=1;
  if(n.L>=2){ s.ms+=15; s.rollMul=1.2; s.hunter=true; } if(n.L>=4) s.shadowSet=true;
  if(n.M>=2&&s.max>0){ s.min=Math.round(s.min*1.1); s.max=Math.round(s.max*1.1); s.omin=Math.round(s.omin*1.1); s.omax=Math.round(s.omax*1.1); s.as=Math.round((s.as+5)*10)/10; }
  if(n.M>=4){ s.healMul=1.35; s.vetSet=true; }
  if(n.H>=2){ s.takenMul*=.9; s.threat=(s.threat||1)*2; s.bastion=true; } if(n.H>=4){ s.noKnock=true; s.jugg=true; }
  /* Twin blades: two one-handed melee weapons were barely better than one (holding alternates hands), and a one-hander
     hits ~60% as hard as a two-hander, so a Finesse killer with two blades fell far behind a hammer. Two blades now
     hit 50% harder and swing 20% faster. */
  if(typeof dualMelee==='function'&&dualMelee()&&P.equip.weapon&&P.equip.weapon.base.h===1&&P.equip.off&&P.equip.off.base.h===1){ s.twin=true; for(const k of ['min','max','omin','omax']) s[k]=Math.round(s[k]*1.5); s.as=Math.round((s.as+20)*10)/10; }
  if(s.mig>=25) s.heavyHand=true; if(s.mig>=50) s.breaker=true; if(s.mig>=100) s.earth=true;
  if(s.fin>=25) s.rollCost*=.7; if(s.fin>=50) s.quickstep=true; if(s.fin>=100) s.flurry=true;
  if(s.fort>=25) s.ironSkin=true; if(s.fort>=50) s.standFirm=true; if(s.fort>=100) s.bulwark=true;
  if(P.life>s.life) P.life=s.life; return r; }; })();

/* ---------- what they do in play ---------- */
function dmgTakenHook(dmg,src){ const s=P.stats; if(!s) return dmg; dmg*=s.takenMul||1;
  if(s.vetSet&&P.vetT>time) dmg*=.75;
  if(s.ironSkin&&time-(P.lastHitT==null?-99:P.lastHitT)>5) dmg*=.5; P.lastHitT=time;
  if(typeof COOP!=='undefined'&&COOP&&typeof NET!=='undefined') for(const h of Object.values(NET.heroes)){ if(!heroLive(h)||!h.p||h.p.dead||!h.p.stats||!h.p.stats.bulwark) continue; if(Math.abs(h.p.x-P.x)<120&&Math.abs(h.p.y-P.y)<80){ dmg*=.9; break; } }
  return dmg; }
/* Shadow: the swing after a roll */
(function(){ const o=startMove; startMove=function(name,ci,hand){ const r=o(name,ci,hand); if(P.shadowArm&&P.attack){ P.attack.allCrit=true; P.shadowArm=false; } return r; }; })();
/* Breaker */
(function(){ const o=bossStagAdd; bossStagAdd=function(e,d,heavy,crit){ return o(e,crit&&P&&P.stats&&P.stats.breaker&&!P._remote?d*2:d,heavy,crit); }; })();
/* Flurry: every 5th landed hit strikes again */
(function(){ const o=strike; strike=function(e,mv,id,hand,dir,mult){ const r=o(e,mv,id,hand,dir,mult); const s=P&&P.stats;
  if(r&&s&&s.flurry&&!P._remote&&!e.dead){ P.flurryN=(P.flurryN||0)+1; if(P.flurryN%5===0){ o(e,mv,++swingId,hand,dir,mult); sparks(e.x,e.y-e.h/2,6,'#bfe39a'); } } return r; }; })();
/* Earthsplitter: a two-handed slam sends a wave along the floor */
(function(){ const o=shockwave; shockwave=function(x,y,len,dirs){ const r=o(x,y,len,dirs); const a=P&&P.attack, s=P&&P.stats;
  if(s&&s.earth&&a&&a.mv&&a.mv.t==='slam'&&!P._remote){ const it=a.hand==='off'?P.equip.off:P.equip.weapon; if(it&&it.base.h===2) groundWave(x,y,P.face,a.hand); } return r; }; })();
function groundWave(x,y,dir,hand){ const dmg=Math.round(rollHand(hand)*1.4*(1+(P.lvl-1)*.05)), hit=new Set(); AU.slam&&AU.slam();
  fx.push({t:0,dur:.55,upd(f,dt){ const wx=x+dir*(20+f.t*420); for(const e of enemies){ if(e.dead||hit.has(e)||e.intro) continue; if(Math.abs(e.x-wx)<14&&Math.abs(e.y-y)<26){ hit.add(e); dmgEnemy(e,dmg,false,dir,160,true); } }
      if(R()<.7) dust(wx,y,2); },
    draw(f){ const wx=x+dir*(20+f.t*420)-camR.x, sy=y-camR.y, k=1-f.t/f.dur; ectx.fillStyle=`rgba(230,190,140,${(.55*k).toFixed(2)})`; ectx.fillRect(Math.round(wx-6),Math.round(sy-8),12,8); ectx.fillStyle=`rgba(255,240,210,${(.8*k).toFixed(2)})`; ectx.fillRect(Math.round(wx-2),Math.round(sy-12),4,12); }}); }

/* ---------- tooltips: set progress on armour; milestones in the attribute tips ---------- */
function setLine(it){ if(!it||!it.base||!it.base.fam||!GEAR_SLOTS.includes(it.slot)||!P) return ''; const f=it.base.fam, n=famCount()[f]+(Object.values(P.equip).includes(it)?0:1), S=SETS41[f];
  return `<div class="g" style="margin-top:.25em">${FAM[f].n} set ${Math.min(4,n)}/4</div>`+S.map((x,i)=>`<div class="${n>=(i?4:2)?'s':'x'}" style="${n>=(i?4:2)?'color:#bfe39a':''}">(${i?4:2}) ${x.n}: ${x.d}</div>`).join(''); }
(function(){ const o=tipHTML; tipHTML=function(it,...a){ const h=o(it,...a); const add=setLine(it); if(!add) return h; const i=h.indexOf('<div class="fl">'); return i<0?h+add:h.slice(0,i)+add+h.slice(i); }; })();
function milestoneTip(k,v){ return '<div style="margin-top:.35em">'+MILES[k].map(([at,n,d])=>`<div class="${v>=at?'s':'x'}" style="${v>=at?'color:#bfe39a':'color:#7a6e64'}">${v>=at?'✓':'·'} ${at} ${n}: ${d}</div>`).join('')+'</div>'; }
/* the satchel shows sets in force under the attributes */
(function(){ const o=renderInv; renderInv=function(){ o(); const box=$('#attrs'); if(!box||!P||!P.stats) return; let el=$('#setsOn'); if(!el){ el=document.createElement('div'); el.id='setsOn'; box.after(el); }
  const n=P.stats.fams||{}; const on=[]; for(const f of ['L','M','H']){ if(n[f]>=2) on.push(SETS41[f][0].n); if(n[f]>=4) on.push(SETS41[f][1].n); }
  el.style.cssText='font-family:var(--fs);font-size:max(10px,calc(var(--u)*1.05));color:#bfe39a;margin:0 0 calc(var(--u)*.4);min-height:1em';
  el.textContent=on.length?'Sets: '+on.join(' · '):''; }; })();
