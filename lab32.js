'use strict';
/* ===== v32: the balance lab =====
   A simulator that uses the game's own code: genItem rolls kits, calcStats and sheetDps price them, mkEnemy (with every
   wrapper: RAMP, tune, Pilgrim's extra life) builds the foes. Nothing here runs in play; call it from the console or
   the headless harness:  BAL.run({tiers:[0,1,4,8,10], K:40})  → JSON, one row per (tier, monster level).
   Each row: foe life and hit for a ghoul, husk and brute; then per gear profile the median and 10th/90th percentile
   of sheet DPS and effective life over K random kits, time to kill (life ÷ DPS) and hits to die (effective life ÷ hit).
   Profiles (all worn at the item level the monster level drops, unless said):
     stale  · magic items 10 item levels old (you stopped upgrading)
     magic  · magic         rare · rare         leg · legendary
     uniq   · unique weapon, armour and helm (the rest legendary)
     abyss  · abyssal weapon (the rest unique / legendary)
   The player is two levels above the monster level, with no Marrow, Ways, vows or borrowed power. */
const BAL={};
const BAL_SLOTS=['weapon','armor','helm','gloves','boots','ring','ring2','amulet']; /* v39: gloves, boots, second ring */
const balW=(w,s)=>w[s]!=null?w[s]:s==='ring2'?w.ring:(s==='gloves'||s==='boots')?w.helm:1;
const BAL_FOES=['ghoul','husk','brute'];
function balFixed(list,r,slot,il){ const ds=list.filter(d=>d.slot===slot&&(slot!=='weapon'||baseByName(d.base).max>0)); if(!ds.length) return null; const it=mkFixed(pick(ds),r); it.ilvl=il; empower(it,il); return fin(it); }
function balItem(r,slot,il){ il=Math.max(1,il);
  if(r===5){ const it=balFixed(ABYSSAL,5,slot,il); if(it) return it; r=4; }
  if(r===4){ const it=balFixed(UNIQUES,4,slot,il); if(it) return it; r=3; }
  const w=[0,0,0,0,0,0]; w[r]=1; let it=genItem(il,w,0,slot); let n=0; while(slot==='weapon'&&!(it.base.max>0)&&n++<20) it=genItem(il,w,0,slot); return it; }
const BAL_PROF={stale:{w:{weapon:1,armor:1,helm:1,ring:1,amulet:1},il:-9},magic:{w:{weapon:1,armor:1,helm:1,ring:1,amulet:1}},rare:{w:{weapon:2,armor:2,helm:2,ring:2,amulet:2}},
  leg:{w:{weapon:3,armor:3,helm:3,ring:3,amulet:3}},uniq:{w:{weapon:4,armor:4,helm:4,ring:3,amulet:3}},abyss:{w:{weapon:5,armor:4,helm:4,ring:3,amulet:3}}};
function balPct(a,p){ const b=a.slice().sort((x,y)=>x-y); return b[Math.min(b.length-1,Math.max(0,Math.round((b.length-1)*p)))]; }
BAL.row=function(tier,m,K,plvlOff){ K=K||40; const pl=Math.max(1,m+(plvlOff==null?2:plvlOff)), il=Math.min(100,m+1);
  const sv={ngp,mlvl,ec:typeof eliteChance==='function'?eliteChance:null}; ngp=tier; mlvl=()=>m; if(sv.ec) eliteChance=()=>0;
  try{
    const foes={}; for(const t of BAL_FOES){ let hp=0,dmg=0; for(let i=0;i<6;i++){ const e=mkEnemy({x:0,y:0,t}); hp+=e.maxhp; dmg+=e.dmg; } foes[t]={hp:Math.round(hp/6),hit:Math.round(dmg/6)}; }
    const row={tier,m,pl,il,foes,prof:{}};
    for(const [name,pr] of Object.entries(BAL_PROF)){ const dps=[],eff=[],main=[],dv=[],lf=[];
      for(let k=0;k<K;k++){ P.lvl=pl; P.equip={weapon:null,off:null,armor:null,helm:null,gloves:null,boots:null,ring:null,ring2:null,amulet:null}; P.way=null;
        for(const s of BAL_SLOTS) P.equip[s]=balItem(balW(pr.w,s),s==='ring2'?'ring':s,il+(pr.il||0)); calcStats(); const d=sheetDps(); dps.push(d.total); eff.push(effLife(P.stats)); dv.push(P.stats.def); lf.push(P.stats.life); }
      const g=foes.ghoul, b=foes.brute; const P50=balPct(dps,.5), E50=balPct(eff,.5);
      row.prof[name]={dps:[balPct(dps,.1),P50,balPct(dps,.9)].map(Math.round),eff:[balPct(eff,.1),E50,balPct(eff,.9)].map(Math.round),
        ttkGhoul:+(g.hp/P50).toFixed(2),ttkBrute:+(b.hp/P50).toFixed(2),ttkGhoulP90:+(g.hp/balPct(dps,.9)).toFixed(2),def:Math.round(balPct(dv,.5)),life:Math.round(balPct(lf,.5)),htdGhoul:+(E50/Math.max(1,g.hit)).toFixed(1),htdBrute:+(E50/Math.max(1,b.hit)).toFixed(1)}; }
    return row;
  } finally{ ngp=sv.ngp; mlvl=sv.mlvl; if(sv.ec) eliteChance=sv.ec; } };
/* which monster levels a tier spans (tierRange: Pilgrim 1–21, then lo to lo+10) */
BAL.levels=function(tier){ const [lo,hi]=tierRange(tier); const out=[]; for(let m=lo;m<=hi;m+=2) out.push(m); if(out[out.length-1]!==hi) out.push(hi); return out; };
BAL.run=function(opt){ opt=opt||{}; const tiers=opt.tiers||[0,1,2,3,4,5,6,7,8,9,10], K=opt.K||40;
  const svP=P; P=newPlayer(); P.skills=new Set(); calcStats(); const rows=[];
  try{ for(const t of tiers){ if(t>0&&!DIFFS[t]) continue; for(const m of (opt.levels||BAL.levels(t))) rows.push(BAL.row(t,m,K,opt.plvlOff)); } }
  finally{ P=svP; if(P) calcStats(); }
  return {v:typeof GAME_VERSION!=='undefined'?GAME_VERSION:'',K,rows}; };
/* one factor at a time: how each source of damage grows with level (typical rare kit), for the write-up */
BAL.factors=function(ms){ const out=[]; const svP=P; P=newPlayer(); calcStats();
  try{ for(const m of ms||[1,5,10,15,20,30,40,50,60,70,80,90,100]){ const il=Math.min(100,m+1);
    let best=null; for(const b of BASES.weapon) if(b.max>0&&b.lvl<=il+1&&(!best||b.min+b.max>best.min+best.max)) best=b;
    out.push({m,base:(best.min+best.max)/2,ilvlMul:+(1+(il-1)*.075).toFixed(2),heroMul:+(1+(m+1)*.05).toFixed(2),flatMul:+(1+.05*Math.max(0,il-12)).toFixed(2),
      foeBase:+((1+.3*(m-1)/2)*(1+.002*((m-1)/2)**2)).toFixed(2),ramp:+RAMP.hp(m).toFixed(2)}); } }
  finally{ P=svP; if(P) calcStats(); } return out; };
/* v34: bosses. For every boss level on a tier: the boss's life and hit, and seconds of pure swinging to kill it with the
   median kit of each profile (life ÷ sheet DPS). Real fights run longer (dodging, phases, grit). Needs a level loaded,
   so it loads each boss level in turn; call it from the harness, not mid-run. */
BAL.bosses=function(opt){ opt=opt||{}; const tiers=opt.tiers||[0,1,2,4,6,8,10], K=opt.K||24, out=[];
  const svP=P, svI=lvlIdx, svN=ngp; P=newPlayer(); P.skills=new Set(); calcStats();
  try{ for(const t of tiers){ if(t>0&&!DIFFS[t]) continue; ngp=t;
    for(let i=0;i<LEVELS.length;i++){ const d=LEVELS[i]; if(!d.boss) continue; loadLevel(i); const m=mlvl();
      let hp=0,dmg=0; for(let j=0;j<3;j++){ const e=spawnBoss(d.boss); hp+=e.maxhp; dmg+=e.dmg; } hp/=3; dmg/=3;
      const row=BAL.row(t,m,K); const sec={}; for(const p of ['rare','leg','uniq','abyss']) sec[p]=Math.round(hp/row.prof[p].dps[1]);
      out.push({tier:t,boss:d.boss,m,hp:Math.round(hp),hit:Math.round(dmg),sec,htd:+(row.prof.rare.eff[1]/Math.max(1,dmg)).toFixed(1)}); } } }
  finally{ P=svP; ngp=svN; lvlIdx=svI; if(P) calcStats(); } return out; };
