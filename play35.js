'use strict';
/* ===== v35: what the playtest report couldn't see, and stun fatigue =====
   The third report ("he got really OP with a hammer, we never got close to dying") raised questions the report
   couldn't answer: which build was it played on (it stamped the build at export, so a v33 run read as v34), was it
   co-op, how close to death did anyone get, which weapons, and were foes ever allowed to swing back.
   1. The report now records, per level visit: the build, co-op size, lowest life, times you fell below 30%,
      times downed (co-op), both weapons and the Way, where the damage you took came from, how long foes near you
      spent stunned, how many attacks they started and how many landed, and the size of a real hit (75th percentile)
      beside the median. Per boss fight: lowest life, damage taken, hits taken, your DPS on it.
   2. Stun fatigue: a foe stunned again soon after a stun is stunned for less. Every hammer swing stunned for 1.2 s
      and swung again within 1.2 s, so anything near a hammer never acted. Each stun from a blow adds a point of
      fatigue (decaying half a point a second, at most 6), and a blow's stun is divided by 1 + fatigue. A lone blow
      stuns as before; a held hammer still stuns, but the foe gets its turn. Skills that stun outright (the Funeral
      Bell, the tether, interrupts) aren't blows and aren't reduced. */

/* ---------- stun fatigue ---------- */
const STUNF={on:true,decay:.8,max:3};
(function(){ const o=dmgEnemy; dmgEnemy=function(e,...a){ if(!STUNF.on||!e||e.boss||e.dead) return o(e,...a);
  const s0=e.stun||0, r=o(e,...a), s1=e.stun||0;
  if(!e.dead&&s1>s0+.04){ const f=Math.max(0,(e.stF||0)-(time-(e.stFT||time))*STUNF.decay); e.stun=s0+(s1-s0)/(1+f); e.stF=Math.min(STUNF.max,f+1); e.stFT=time; }
  return r; }; })();

/* ---------- report: what each visit records ---------- */
const RLET='NMRLUA';
const wDesc=it=>it&&it.base?`${it.base.name} ${RLET[it.rarity]||'?'}${it.ilvl||1}`:'';
const wpnNow=()=>P?{m:wDesc(P.equip.weapon),o:wDesc(P.equip.off),way:P.way||null}:null;
const pctl=(a,q)=>{ if(!a||!a.length) return 0; const b=a.slice().sort((x,y)=>x-y); return b[Math.min(b.length-1,Math.floor(b.length*q))]; };
const coopN=()=>typeof COOP!=='undefined'&&COOP&&typeof NET!=='undefined'?NET.seats.length:1;
(function(){ const o=ptOpen; ptOpen=function(idx){ o(idx); const v=PT.v; if(!v) return;
  Object.assign(v,{b:GAME_VERSION,coop:coopN(),minL:1,close:0,downs:0,src:{},nearT:0,stunT:0,wu:0,blows:0,wpn:wpnNow()}); v._low=false; }; })();
(function(){ const o=ptClose; ptClose=function(how){ const v=PT.v;
  if(v&&v.minL!=null){ v.minL=+v.minL.toFixed(2); v.wpn=wpnNow()||v.wpn; v.coop=Math.max(v.coop||1,coopN()); if(v.fh) v.hitBig=Math.round(pctl(v.fh,.75)); v.nearT=Math.round(v.nearT); v.stunT=Math.round(v.stunT);
    for(const k in v.src) v.src[k]=Math.round(v.src[k]); delete v._low; }
  return o(how); }; })();
/* lowest life, close calls, foes near you: stunned time and attacks started */
(function(){ const o=update; update=function(dt){ const r=o(dt); const v=PT.v; if(!v||v.minL==null||!P||P._remote||mode!=='play'||!P.stats) return r;
  if(!P.dead){ const f=clamp(P.life/P.stats.life,0,1); if(f<v.minL) v.minL=f; if(f<.3&&!v._low){ v.close++; v._low=true; } else if(f>.5) v._low=false;
    const b=PT.boss; if(b&&!b.done){ if(b.minL==null) b.minL=1; if(f<b.minL) b.minL=f; } }
  for(const e of enemies){ if(e.dead||e.boss||e.intro||e.type==='anchor'||e.type==='relicx') continue;
    if(Math.abs(e.x-P.x)>200||Math.abs(e.y-P.y)>110){ e._wu=false; continue; }
    v.nearT+=dt; if((e.stun||0)>0) v.stunT+=dt; const w=WINDUP.has(e.state); if(w&&!e._wu) v.wu++; e._wu=w; }
  return r; }; })();
/* where the damage came from, blows landed, boss damage */
(function(){ const o=hurtPlayer; hurtPlayer=function(d,src){ const l0=P?P.life:0; const r=o(d,src); const v=PT.v;
  if(v&&v.src&&P&&!P._remote&&P.life<l0){ const k=src?(src.boss?src.kind:src.type||'hazard'):'hazard', amt=l0-Math.max(0,P.life); v.src[k]=(v.src[k]||0)+amt;
    if(src&&!src.boss) v.blows++; const b=PT.boss; if(b&&!b.done){ b.taken=(b.taken||0)+amt; b.hits=(b.hits||0)+1; } }
  return r; }; })();
/* downed in co-op */
(function(){ const o=onDeath; onDeath=function(){ if(typeof COOP!=='undefined'&&COOP&&PT.v&&PT.v.downs!=null&&P&&!P._remote&&!(typeof NET!=='undefined'&&NET.downShown)) PT.v.downs++; return o(); }; })();
/* boss fights: add to the event stats.js just wrote */
(function(){ const o=bossIntro; bossIntro=function(e){ const r=o(e); const b=PT.boss; if(b&&b.e===e&&b.hp==null){ b.hp=Math.round(e.maxhp); b.minL=1; b.taken=0; b.hits=0; b.wpn=wpnNow(); } return r; }; })();
(function(){ const o=bossDefeated; bossDefeated=function(e){ const b=PT.boss, fresh=b&&!b.done; const r=o(e);
  if(fresh&&b.done){ const d=ptLoad(), x=d.ev[d.ev.length-1]; if(x&&x.k==='boss'&&x.boss===b.kind){ Object.assign(x,{b:GAME_VERSION,hp:b.hp||0,minL:+(b.minL==null?1:b.minL).toFixed(2),taken:Math.round(b.taken||0),hits:b.hits||0,wpn:b.wpn||null}); store.set(PT_KEY,d); } }
  return r; }; })();
/* gear changes carry the weapons' names */
(function(){ const o=ptPush; ptPush=function(e){ if(e&&e.k==='gear'){ e.b=GAME_VERSION; e.wpn=wpnNow(); } return o(e); }; })();

/* ---------- report: the summary and the text ---------- */
const pc=f=>Math.round((f||0)*100)+'%';
(function(){ const o=ptSummary; ptSummary=function(){ const s=o(), d=ptLoad(), vis=d.ev.filter(e=>e.k==='visit');
  s.exportedOn=GAME_VERSION; s.builds={}; for(const v of vis){ const k=v.b||'before v35'; s.builds[k]=(s.builds[k]||0)+1; }
  const byAt=new Map(vis.filter(v=>v.in).map(v=>[v.at,v]));
  if(s.bal){ const vs=vis.filter(v=>v.in); s.bal.forEach((b,i)=>{ const v=vs[i]; if(!v) return; Object.assign(b,{b:v.b||null,coop:v.coop||1,minL:v.minL,close:v.close,downs:v.downs,wpn:v.wpn||null,src:v.src||null,stun:v.nearT?+(v.stunT/v.nearT).toFixed(2):null,nearT:v.nearT,wu:v.wu,blows:v.blows,hitBig:v.hitBig||0}); }); }
  const dv=vis.filter(v=>v.minL!=null);
  s.danger=dv.length?{visits:dv.length,lowest:Math.min(...dv.map(v=>v.minL)),where:(()=>{ const v=dv.reduce((a,x)=>x.minL<a.minL?x:a); return v.lvl+'@'+v.tier; })(),close:dv.reduce((a,v)=>a+v.close,0),downs:dv.reduce((a,v)=>a+v.downs,0),
    coop:Math.max(...dv.map(v=>v.coop||1)),stun:(()=>{ const n=dv.reduce((a,v)=>a+v.nearT,0); return n?+(dv.reduce((a,v)=>a+v.stunT,0)/n).toFixed(2):null; })(),wu:dv.reduce((a,v)=>a+v.wu,0),blows:dv.reduce((a,v)=>a+v.blows,0)}:null;
  s.bossFights=d.ev.filter(e=>e.k==='boss').slice(-40).map(x=>({boss:x.boss,tier:x.tier,secs:x.secs,deaths:x.deaths,b:x.b||null,coop:x.coop||1,pl:x.plvl,hp:x.hp||0,minL:x.minL,taken:x.taken,hits:x.hits,wpn:x.wpn||null}));
  return s; }; })();
const wTxt=w=>!w?'':(w.m||'fists')+(w.o?' + '+w.o:'')+(w.way?' · '+(typeof WAYS!=='undefined'&&WAYS[w.way]?WAYS[w.way].n:w.way):'');
const srcTxt=src=>{ if(!src) return ''; const t=Object.values(src).reduce((a,x)=>a+x,0); if(!t) return ''; return Object.entries(src).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,n])=>`${ptName(k)} ${Math.round(n/t*100)}%`).join(', '); };
(function(){ const o=ptText; ptText=function(s){ let txt=o(s);
  /* header: the build it was exported from, and the builds the visits were played on */
  const nl=txt.indexOf('\n'); const bl=Object.entries(s.builds||{}).map(([k,n])=>`${k} ${n} visit${n===1?'':'s'}`).join(', ');
  txt=`Marrowdeep playtest report · exported from ${s.exportedOn} (${s.v}) · since ${s.since}\nPlayed on: ${bl||'nothing yet'}`+txt.slice(nl);
  const i=txt.lastIndexOf('\nRAW '); if(i<0) return txt; const L_=[];
  const dg=s.danger;
  L_.push('','Danger (from v35 on):');
  if(dg){ const w=dg.where.split('@'); L_.push(`  Lowest life ${pc(dg.lowest)} (${ptName(w[0])} [${ptTier(+w[1])}]) · fell below 30% ${dg.close}× · downed ${dg.downs}× · co-op up to ${dg.coop}`);
    L_.push(`  Foes near you were stunned ${dg.stun==null?'–':pc(dg.stun)} of the time · they started ${dg.wu} attacks and landed ${dg.blows} blows`); }
  else L_.push('  nothing recorded yet (needs a run on v35 or later)');
  const rows=(s.bal||[]).filter(b=>b.minL!=null).slice(-40);
  if(rows.length){ L_.push('','Per level visit (build · co-op · lowest life · below 30% · weapons · foes stunned · attacks started → landed · real hit · damage taken from):');
    for(const b of rows) L_.push(`  ${ptName(b.lvl)} [${ptTier(b.tier)}] ${b.b||''}${b.coop>1?' · co-op '+b.coop:' · solo'} · low ${pc(b.minL)} · <30% ${b.close}×${b.downs?' · downed '+b.downs+'×':''} · ${wTxt(b.wpn)} · stunned ${b.stun==null?'–':pc(b.stun)} · ${b.wu}→${b.blows} · hit ${b.foeHit||'–'} (big ${b.hitBig||'–'}) · ${srcTxt(b.src)||'no damage'}`); }
  const bf=(s.bossFights||[]).filter(x=>x.minL!=null);
  if(bf.length){ L_.push('','Boss fights (build · co-op · seconds · your level · boss life · life it lost per second, whole team in co-op · lowest life · hits taken · damage taken · weapons):');
    for(const x of bf) L_.push(`  ${ptName(x.boss)} [${ptTier(x.tier)}] ${x.b||''}${x.coop>1?' · co-op '+x.coop:' · solo'} · ${x.secs}s · lv ${x.pl} · ${fmtN(x.hp)} · ${x.secs?fmtN(x.hp/x.secs):'–'}/s · low ${pc(x.minL)} · ${x.hits} hits · ${fmtN(x.taken)} · ${wTxt(x.wpn)}${x.deaths?' · died '+x.deaths+'×':''}`); }
  return txt.slice(0,i)+'\n'+L_.join('\n')+txt.slice(i); }; })();
