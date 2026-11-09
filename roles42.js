'use strict';
/* ===== v42: team roles (claude/builds-plan.md, decisions 4 and 5) =====
   Threat (co-op): a foe that comes within 60 px of a tank (Fortitude is their highest attribute and at least 10, or they
   wear the Heavy 2-piece Bastion) locks on to them for 3 s (bosses 2 s), and the lock holds while the tank stays close.
   Otherwise foes pick the hero with the best distance ÷ threat, where threat = 1 + 2% per Fortitude point (×2 Bastion),
   so a tank in front draws the room and a crossbowman at the back is left alone unless something gets past.
   A locked foe wears a small red mark.
   Ranged: crossbow bolts hit up to 40% harder the further they fly (+2% every 10 px past the first 60), and from
   Bloodied on, ordinary foes more than 120 px from their target close in faster (+4% speed a tier, +40% on Marrow's End),
   so standing back keeps paying as long as you keep moving. */
const ROLE={lockR:60,lockT:3,bossLockT:2};
const isTank=p=>{ const s=p&&p.stats; return !!s&&((s.fort>=10&&s.fort>=s.mig&&s.fort>=s.fin)||!!s.bastion); };
const heroThreat=p=>{ const s=p&&p.stats; return s?Math.max(.2,s.threat||1):1; };
function heroesNow(){ const out=[]; if(P&&!P.dead) out.push(P); if(typeof COOP!=='undefined'&&COOP&&typeof NET!=='undefined') for(const h of Object.values(NET.heroes)) if(heroLive(h)&&h.p&&!h.p.dead) out.push(h.p); return out; }
(function(){ if(typeof nearestHero!=='function') return; nearestHero=function(e){ const hs=heroesNow(); if(!hs.length) return P;
  if(e.lockP&&e.lockT>time&&hs.includes(e.lockP)){ if(Math.abs(e.lockP.x-e.x)<ROLE.lockR*1.6&&Math.abs(e.lockP.y-e.y)<50) e.lockT=Math.max(e.lockT,time+.5); return e.lockP; }
  e.lockP=null;
  for(const h of hs) if(isTank(h)&&Math.abs(h.x-e.x)<ROLE.lockR&&Math.abs(h.y-e.y)<40){ e.lockP=h; e.lockT=time+(e.boss?ROLE.bossLockT:ROLE.lockT); return h; }
  let best=null, bd=1e9; for(const h of hs){ const d=(Math.abs(h.x-e.x)+Math.abs(h.y-e.y)*1.5)/heroThreat(h)-(e._tgp===h?30:0); if(d<bd){ bd=d; best=h; } }
  e._tgp=best; return best||P; }; })();
/* the mark over a locked foe */
(function(){ const o=drawFX; drawFX=function(){ o(); if(typeof COOP==='undefined'||!COOP) return; for(const e of enemies){ if(e.dead||!e.lockP||!(e.lockT>time)) continue;
  const sx=Math.round(e.x-camR.x), sy=Math.round(e.y-e.h-camR.y-7); ectx.fillStyle='rgba(200,30,24,.85)'; ectx.fillRect(sx-2,sy,4,4); ectx.fillStyle='rgba(255,140,120,.9)'; ectx.fillRect(sx-1,sy+1,2,2); } }; })();

/* ---------- ranged: bolts gain with distance; deep foes close in ---------- */
/* crossbows sit outside the v34 class band (they're off-hand bases); with Finesse S on top they ran away, so a crossbow's
   damage is ×0.75 here and the distance bonus below makes it up when you keep your range */
const XBOW_K=.75;
(function(){ const o=calcStats; calcStats=function(){ const r=o(); const s=P&&P.stats; if(!s) return r; const m=P.equip.weapon, f=P.equip.off;
  if(m&&m.base.cls==='xbow'&&s.max>0){ s.min=Math.max(1,Math.round(s.min*XBOW_K)); s.max=Math.max(s.min+1,Math.round(s.max*XBOW_K)); }
  if(f&&f.base.cls==='xbow'&&s.omax>0){ s.omin=Math.max(1,Math.round(s.omin*XBOW_K)); s.omax=Math.max(s.omin+1,Math.round(s.omax*XBOW_K)); } return r; }; })();
(function(){ const o=updProjs; updProjs=function(dt){ for(const p of projs){ if(p.from!=='p'||p.type!=='bolt') continue; if(p._x0==null){ p._x0=p.x; p._y0=p.y; p._d0=p.dmg; }
  const tr=Math.hypot(p.x-p._x0,p.y-p._y0); p.dmg=p._d0*(1+Math.min(.4,Math.max(0,tr-60)/10*.02)); } return o(dt); }; })();
(function(){ const o=updEnemy; updEnemy=function(e,dt){ const t=typeof tierNow==='function'?tierNow():ngp; if(t<2||e.boss||e.dead||!P) return o(e,dt);
  const tg=(typeof COOP!=='undefined'&&COOP&&typeof nearestHero==='function')?nearestHero(e):P; if(!tg||Math.abs(tg.x-e.x)<120){ return o(e,dt); }
  const sv=e.spd; e.spd=sv*(1+.04*t); try{ return o(e,dt); } finally{ e.spd=sv; } }; })();

/* ---------- the team panel: each player's leading attribute ---------- */
function leadAttr(s){ if(!s) return null; if(s.bastion) return 'fort'; const v={fort:s.fort||0,mig:s.mig||0,fin:s.fin||0}; const k=Object.keys(v).sort((a,b)=>v[b]-v[a])[0]; return v[k]>=10?k:null; } /* ties go to Fortitude, then Might */
function roleWord(s){ const k=leadAttr(s); if(!k) return 'Balanced'; if(k==='fort') return 'Tank'; const w=P&&P.equip.weapon; if(k==='fin'&&((w&&w.base.cls==='xbow')||P.way==='xbows')) return 'Marksman'; return 'Killer'; }
/* the role word sits on the sets line under the attributes */
(function(){ const o=renderInv; renderInv=function(){ o(); const el=$('#setsOn'); if(!el||!P||!P.stats) return; const r=roleWord(P.stats); el.textContent=r+(el.textContent?' · '+el.textContent:''); el.style.color='#cfc6b4'; }; })();
setInterval(()=>{ try{ if(typeof COOP==='undefined'||!COOP||typeof teamEl==='undefined'||teamEl.hidden) return;
  const others=NET.seats.filter(x=>x.s!==NET.me); teamEl.querySelectorAll('.tm').forEach((row,i)=>{ const x=others[i]; if(!x) return; const p=NET.heroes[x.s]&&NET.heroes[x.s].p; const k=p&&leadAttr(p.stats); let tag=row.querySelector('.rolek'); if(!tag){ tag=document.createElement('span'); tag.className='rolek'; tag.style.cssText='margin-left:.35em;font-family:"Shippori Mincho",serif'; row.appendChild(tag); }
    tag.textContent=k?ATTR[k].kj:''; tag.style.color=k?ATTR[k].col:''; tag.title=k?ATTR[k].n:''; }); }catch(e){} },1000);

/* ---------- the gear budget ----------
   Three more worn slots (gloves, boots, a second ring) and Fortitude added life and defense to every kit: a rare kit
   took 28 ghoul hits to die on Pilgrim (was 16) and 10 on Marrow's End (was 6). Foes and bosses hit 60% harder to put
   that back, and ordinary foes above Pilgrim gain 3% life a tier (was 1%) for the extra damage the attributes bring. */
const GEAR_DMG=1.6;
(function(){ const o=mkEnemy; mkEnemy=function(s){ const e=o(s); if(e&&e.type!=='anchor'&&e.type!=='relicx') e.dmg*=GEAR_DMG; return e; }; })();
(function(){ const o=spawnBoss; spawnBoss=function(k){ const e=o(k); if(e) e.dmg*=GEAR_DMG; return e; }; })();
if(typeof B34!=='undefined') B34.tierHp=t=>t>0?1.22+.03*t:1;

/* the playtest report records each visit's role and attributes (at the way out) */
(function(){ const o=ptClose; ptClose=function(how){ const v=PT.v; if(v&&P&&P.stats){ v.role=roleWord(P.stats); v.attrs={mig:P.stats.mig||0,fin:P.stats.fin||0,fort:P.stats.fort||0}; } return o(how); }; })();
