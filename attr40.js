'use strict';
/* ===== v40: Might 力, Finesse 技, Fortitude 耐 (claude/builds-plan.md) =====
   Three attributes, from gear only. They roll as stats on every slot (weapons, armour, helms, gloves, boots, rings,
   amulets), and armour families lean toward them (light → Finesse, heavy → Fortitude and Might).
   - Might:     damage with Might weapons (by the weapon's grade) · carries armour weight · fills boss stagger faster
   - Finesse:   attack speed · run speed · crit chance · damage with Finesse weapons (by grade)
   - Fortitude: life · defense · threat (foes prefer you)
   Weapon grades: every class has a Might grade and a Finesse grade, S/A/B/C/–. Its damage gets +1.2% per point of
   that attribute × the grade (S ×1, A ×0.75, B ×0.5, C ×0.25), so any weapon works for anyone and a matching build
   makes it shine.
   Armour weight: light 0, medium 1, heavy 2 per piece. You carry 2 + Might ÷ 8; each point you can't carry costs 2.5%
   run speed and 2% attack speed. Nothing is locked: plate on a weak sellsword just slows him down. */
const ATTR={mig:{n:'Might',kj:'力',col:'#e07a52',d:'Hit harder with heavy weapons; carry heavy armour without slowing'},
  fin:{n:'Finesse',kj:'技',col:'#7ad0a8',d:'Swing and move faster; light weapons and crossbows hit harder and crit more'},
  fort:{n:'Fortitude',kj:'耐',col:'#8aa8e0',d:'Take more punishment; foes come for you and stay'}};
const A_PER={dmg:.8, finAs:.2, finMs:.2, finCrit:.08, fortLife:1, fortDef:.8, fortThreat:2, migStag:.5, carryBase:2, carryPer:8, wMs:2.5, wAs:2};
const GRADE_F={S:1,A:.75,B:.5,C:.25,'-':0};
const WGRADE={hammer:['A','-'],mace:['A','C'],axe:['A','C'],cleaver:['A','C'],flail:['A','C'],scythe:['B','B'],spear:['B','B'],sword:['B','B'],
  dagger:['-','S'],rapier:['-','S'],sickle:['C','A'],katana:['B','A'],xbow:['-','S'],shield:['B','-'],fist:['B','B']};
const ARMW={L:0,M:1,H:2};
function wGrades(it){ if(!it||!it.base) return WGRADE.fist; const b=it.base; let g=WGRADE[b.cls]||['B','B'];
  if(b.cls==='sword'&&b.h===2) g=['A','B']; if(b.cls==='katana'&&b.h===2) g=['B','A']; if((b.cls==='mace'||b.cls==='axe')&&b.h===2) g=['A','C']; return g; }

/* ---------- the stats on items ---------- */
(function(){ const all=['weapon','armor','helm','gloves','boots','ring','amulet','shield'], V=[[1,3],[3,5],[5,8],[8,11]];
  PRE.push({n:['Stout','Mighty','Brawny',"Titan's"],k:'mig',s:all.slice(),v:V});
  SUF.push({n:['of Finesse','of the Fox','of the Hawk','of the Viper'],k:'fin',s:all.slice(),v:V},{n:['of Fortitude','of the Bear','of the Bulwark','of the Mountain'],k:'fort',s:all.slice(),v:V});
  FMT.mig=v=>`+${v} to Might`; FMT.fin=v=>`+${v} to Finesse`; FMT.fort=v=>`+${v} to Fortitude`;
  AFX.mig=['+','','Might']; AFX.fin=['+','','Finesse']; AFX.fort=['+','','Fortitude'];
  /* some uniques carry an attribute that fits them */
  const giv=(name,k,lo,hi)=>{ lo=Math.round(lo*.7); hi=Math.round(hi*.7); /* a unique's attribute sits a little under a top rare roll */ const d=UNIQUES.find(x=>x.name===name)||ABYSSAL.find(x=>x.name===name); if(d&&!d.aff.some(a=>a[0]===k)) d.aff.push([k,lo,hi]); };
  giv('Ironheart','fort',10,16); giv("Sister's Needle",'fin',10,16); giv('Bellbreaker','mig',10,16); giv('Grave Mother','mig',8,14); giv('Penance','fin',8,14);
  giv("Hangman's Grip",'mig',6,10); giv("The Penitent's Wraps",'fin',8,12); giv("Ilse's Errand",'fin',8,12); giv('Sabatons of the Last Wall','fort',10,16);
  giv('Last Wall of Hollowmere','fort',12,18); giv('Hollow Crown','fin',6,10); giv('The Unpaid Debt','mig',12,18); giv('Mujō','fin',12,18); giv("Rope's End",'fort',12,18); })();

/* ---------- what they do ---------- */
function armourWeight(){ let w=0; for(const k of GEAR_SLOTS){ const it=P.equip[k]; if(it&&it.base&&it.base.fam) w+=ARMW[it.base.fam]||0; } return w; }
(function(){ const o=calcStats; calcStats=function(){ const r=o(); const s=P&&P.stats; if(!s) return r;
  s.mig=Math.max(0,s.mig||0); s.fin=Math.max(0,s.fin||0); s.fort=Math.max(0,s.fort||0);
  if(s.setMig) s.mig+=s.setMig; if(s.setFin) s.fin+=s.setFin; if(s.setFort) s.fort+=s.setFort;
  /* damage by grade, each hand by its own weapon */
  const gm=(it)=>{ const g=wGrades(it); return 1+(s.mig*GRADE_F[g[0]]+s.fin*GRADE_F[g[1]])*A_PER.dmg/100; };
  s.gMain=gm(P.equip.weapon); s.gOff=gm(P.equip.off);
  if(s.max>0){ s.min=Math.max(1,Math.round(s.min*s.gMain)); s.max=Math.max(s.min+1,Math.round(s.max*s.gMain)); }
  if(s.omax>0){ s.omin=Math.max(1,Math.round(s.omin*s.gOff)); s.omax=Math.max(s.omin+1,Math.round(s.omax*s.gOff)); }
  /* Finesse */
  s.as+=s.fin*A_PER.finAs; s.ms+=s.fin*A_PER.finMs; s.crit=Math.round((s.crit+s.fin*A_PER.finCrit)*10)/10;
  /* Fortitude */
  s.life=Math.round(s.life*(1+s.fort*A_PER.fortLife/100)); s.def=Math.round(s.def*(1+s.fort*A_PER.fortDef/100)); s.threat=1+s.fort*A_PER.fortThreat/100;
  /* Might: stagger and carrying */
  s.stagP=s.mig*A_PER.migStag; s.weight=armourWeight(); s.carry=A_PER.carryBase+s.mig/A_PER.carryPer; s.over=Math.max(0,s.weight-s.carry);
  if(s.over>0){ s.ms-=s.over*A_PER.wMs; s.as-=s.over*A_PER.wAs; }
  s.as=Math.round(s.as*10)/10; s.ms=Math.round(s.ms*10)/10;
  if(P.life>s.life) P.life=s.life;
  return r; }; })();
/* boss stagger fills faster with Might */
(function(){ const o=bossStagAdd; bossStagAdd=function(e,d,...a){ const m=P&&P.stats&&!P._remote?1+(P.stats.stagP||0)/100:1; return o(e,d*m,...a); }; })();

/* ---------- tooltips: grades on weapons, family and weight on armour ---------- */
const gradeTxt=g=>`<b style="color:${g==='S'?'#ffd66a':g==='A'?'#e8c48a':g==='-'?'#5a504a':'#cfc6b4'}">${g}</b>`;
function scaleLine(it){ if(!it||!it.base) return '';
  if(it.slot==='weapon'&&it.base.max>0){ const g=wGrades(it); return `<div class="g">Scales: ${ATTR.mig.kj} Might ${gradeTxt(g[0])} · ${ATTR.fin.kj} Finesse ${gradeTxt(g[1])}</div>`; }
  if(GEAR_SLOTS.includes(it.slot)&&it.base.fam){ const f=FAM[it.base.fam]; return `<div class="g">${f.kj} ${f.n} ${({armor:'armour',helm:'helm',gloves:'gloves',boots:'boots'})[it.slot]} · weight ${ARMW[it.base.fam]}</div>`; }
  return ''; }
(function(){ const o=tipHTML; tipHTML=function(it,...a){ const h=o(it,...a); const add=scaleLine(it); if(!add) return h; const i=h.indexOf('<div class="g">Item Level:'); return i<0?h+add:h.slice(0,i)+add+h.slice(i); }; })();
if(typeof CMP!=='undefined') CMP.unshift(['Might',s=>s.mig||0],['Finesse',s=>s.fin||0],['Fortitude',s=>s.fort||0]);

/* ---------- the character sheet ---------- */
function attrLine(k,s){ const v=s[k]||0;
  if(k==='mig'){ const gm=Math.round((s.gMain-1)*100); return `${gm>0?`+${gm}% damage with your weapon · `:''}carries ${s.carry.toFixed(1)} of ${s.weight} weight${s.over>0?` · <span style="color:#ff7a5a">overloaded: −${(s.over*A_PER.wMs).toFixed(0)}% run, −${(s.over*A_PER.wAs).toFixed(0)}% attack speed</span>`:''}`; }
  if(k==='fin'){ const gm=Math.round((s.gMain-1)*100); return `+${(v*A_PER.finAs).toFixed(1)}% attack speed · +${(v*A_PER.finMs).toFixed(1)}% run · +${(v*A_PER.finCrit).toFixed(1)}% crit${gm>0?` · weapon +${gm}%`:''}`; }
  return `+${(v*A_PER.fortLife).toFixed(0)}% life · +${(v*A_PER.fortDef).toFixed(0)}% defense · threat ×${(1+v*A_PER.fortThreat/100).toFixed(2)}`; }
(function(){ const st=document.createElement('style'); st.textContent=`
#attrs{display:grid;grid-template-columns:repeat(3,1fr);gap:calc(var(--u)*.4);margin:calc(var(--u)*.5) 0 calc(var(--u)*.15);width:100%}
#attrs .at{background:#0a0708;border:1px solid #2e2422;padding:calc(var(--u)*.2) calc(var(--u)*.3);display:flex;align-items:baseline;justify-content:center;gap:calc(var(--u)*.35);cursor:help}
#attrs .at .kj{font-family:'Shippori Mincho',var(--fb);font-size:max(12px,calc(var(--u)*1.4));line-height:1}
#attrs .at b{font-family:var(--fd);font-weight:400;font-size:max(14px,calc(var(--u)*1.8));color:#f1e6d2;line-height:1.1}
#attrs .at span.nm{font-family:var(--fs);font-size:max(9px,calc(var(--u)*.9));color:#9a8a7a;letter-spacing:.04em}`; document.head.appendChild(st); })();
(function(){ const o=renderInv; renderInv=function(){ o(); const st=$('#stats'); if(!st||!P||!P.stats) return; let box=$('#attrs'); if(!box){ box=document.createElement('div'); box.id='attrs'; st.parentNode.insertBefore(box,st); }
  const s=P.stats; box.innerHTML=['mig','fin','fort'].map(k=>`<div class="at" data-k="${k}"><span class="kj" style="color:${ATTR[k].col}">${ATTR[k].kj}</span><b>${s[k]||0}</b><span class="nm">${ATTR[k].n}</span></div>`).join('');
  box.querySelectorAll('.at').forEach(d=>{ const k=d.dataset.k; d.onpointerenter=()=>showTipHTML(`<div style="color:${ATTR[k].col}">${ATTR[k].kj} ${ATTR[k].n} ${s[k]||0}</div><div class="g">${ATTR[k].d}</div><div class="m">${attrLine(k,s)}</div>${typeof milestoneTip==='function'?milestoneTip(k,s[k]||0):''}`,d); d.onpointerleave=hideTip; }); }; })();
