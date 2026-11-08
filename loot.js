'use strict';
/* ===== loot: war drums under the chest reel, tooltips for what you stand on, and comparison with what you wear ===== */

/* ---------- drums ---------- */
AU.drumBus=function(){ if(this._db||!this.c) return this._db; const g=this.c.createGain(); g.gain.value=.7;
  // v23: a limiter so the accelerating roll can't sum past full scale (that clipping was the 'static' in headphones)
  const L=this.c.createDynamicsCompressor(); L.threshold.value=-14; L.knee.value=6; L.ratio.value=12; L.attack.value=.003; L.release.value=.12; g.connect(L); L.connect(this.mm||this.m); const w=this.c.createGain(); w.gain.value=.35; g.connect(w); w.connect(this.rv); this._db=g; return g; };
AU.taiko=function(v,at,pitch,dest){ if(!this.c) return; const c=this.c, t=at||c.currentTime, p=pitch||1, out=dest||this.drumBus();
  const o=c.createOscillator(); o.type='sine'; o.frequency.setValueAtTime(115*p,t); o.frequency.exponentialRampToValueAtTime(44*p,t+.42); const g=c.createGain(); g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.9*v,t+.006); g.gain.exponentialRampToValueAtTime(.0001,t+.6); o.connect(g); g.connect(out); o.start(t); o.stop(t+.65);
  const o2=c.createOscillator(); o2.type='triangle'; o2.frequency.setValueAtTime(230*p,t); o2.frequency.exponentialRampToValueAtTime(90*p,t+.08); const g2=c.createGain(); g2.gain.setValueAtTime(.0001,t); g2.gain.exponentialRampToValueAtTime(.35*v,t+.003); g2.gain.exponentialRampToValueAtTime(.0001,t+.12); o2.connect(g2); g2.connect(out); o2.start(t); o2.stop(t+.15);
  const s=c.createBufferSource(); s.buffer=this.nb; const f=c.createBiquadFilter(); f.type='lowpass'; f.frequency.value=900; const g3=c.createGain(); g3.gain.setValueAtTime(.0001,t); g3.gain.exponentialRampToValueAtTime(.4*v,t+.003); g3.gain.exponentialRampToValueAtTime(.0001,t+.09); s.connect(f); f.connect(g3); g3.connect(out); s.start(t,Math.random()*.5); s.stop(t+.1); };
AU.rim=function(v,at){ if(!this.c) return; const c=this.c, t=at||c.currentTime; const s=c.createBufferSource(); s.buffer=this.nb; const f=c.createBiquadFilter(); f.type='bandpass'; f.frequency.value=2600; f.Q.value=3; const g=c.createGain(); g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.3*v,t+.002); g.gain.exponentialRampToValueAtTime(.0001,t+.05); s.connect(f); f.connect(g); g.connect(this.drumBus()); s.start(t,Math.random()*.5); s.stop(t+.06); };
/* a war-drum build that accelerates with the reel and lands on its last card */
AU.caseDrums=function(dur,tier){ if(!this.c) return; const c=this.c, t0=c.currentTime, bus=this.drumBus(); let t=0, i=0; const big=1+(tier||0)*.15;
  while(t<dur-.12){ const k=t/dur, iv=Math.max(.12,.52*Math.pow(.13,k)); const v=(.3+.55*k*k)*big; this.taiko(Math.min(1,v),t0+t,i%4===0?1:i%2?1.35:1.15,bus); t+=iv; i++; }
  // the recorded war loop rises underneath, speeding up
  if(typeof SMP!=='undefined'&&SMP.has('drums_rhythm_154')){ const n=SMP.play('drums_rhythm_154',{v:0,loop:true,rate:.82,dest:bus}); if(n){ n.g.gain.setValueAtTime(.0001,t0); n.g.gain.exponentialRampToValueAtTime(.55*big,t0+dur*.7); n.g.gain.exponentialRampToValueAtTime(.8*big,t0+dur); n.g.gain.exponentialRampToValueAtTime(.0001,t0+dur+.25);
    n.s.playbackRate.setValueAtTime(.82,t0); n.s.playbackRate.linearRampToValueAtTime(1.22,t0+dur); n.s.stop(t0+dur+.3); } }
  // (v23: the noise riser and rim clicks are gone: they read as static in headphones)
  if(typeof MUS!=='undefined'&&MUS.out){ MUS.out.gain.setTargetAtTime(.35,t0,.4); MUS.out.gain.setTargetAtTime(.9,t0+dur+.6,1.2); } };
AU.caseHit=function(r){ if(!this.c) return; const t=this.c.currentTime, bus=this.drumBus(); const v=1+r*.12;
  this.taiko(1.4*v,t,.8,bus); this.taiko(1.1*v,t+.01,1.1,bus); this.tone('sine',48,26,1.6,.9,.6);
  if(r>=3){ this.taiko(1.2,t+.32,.75,bus); this.taiko(1.3,t+.48,.7,bus); } };
(function(){ const o=showCase; showCase=function(tier,ilvl,win,onClose){ o(tier,ilvl,win,onClose); AU.caseDrums(RM?1.45:7.5,tier); }; })();
(function(){ const o=land; land=function(){ const cs=caseState; if(cs) AU.caseHit(cs.win.rarity); o();
  // once the stats are revealed, show what it would change
  const box=$('#rtt'); if(cs&&box){ const wait=setInterval(()=>{ if(!caseState||caseState!==cs){ clearInterval(wait); return; } if(cs.ready){ clearInterval(wait); const h=compareHTML(cs.win); if(h) box.insertAdjacentHTML('beforeend',h); } },120); } }; })();

/* ---------- comparison with what you wear ---------- */
function targetSlot(it){ if(it.slot!=='weapon') return it.slot; return it.base.h===0?'off':'weapon'; }
function statsWith(slot,it){ const sv=P.equip[slot], life=P.life, pow=P.power; P.equip[slot]=it; calcStats(); const s=P.stats; P.equip[slot]=sv; calcStats(); P.life=life; P.power=pow; return s; }
const CMP=[['Damage',s=>(s.min+s.max)/2,v=>v.toFixed(1),s=>`${s.min}–${s.max}`],['Off-hand damage',s=>(s.omin+s.omax)/2,v=>v.toFixed(1),s=>`${s.omin}–${s.omax}`],
  ['Attack rate',s=>s.spd*(1+s.as/100),v=>v.toFixed(2)+'×'],['Defense',s=>s.def],['Life',s=>s.life],['Critical strike',s=>s.crit,v=>v+'%'],['Life stolen',s=>s.ls,v=>v+'%'],
  ['Run speed',s=>s.ms,v=>v+'%'],['Life regen',s=>s.regen,v=>v+'/s'],['Thorns',s=>s.thorns],['Magic find',s=>s.mf,v=>v+'%'],['Gold find',s=>s.gf,v=>v+'%']];
function compareHTML(it){ if(!P||!it) return ''; for(const k in P.equip) if(P.equip[k]===it) return '';
  const slot=targetSlot(it); if(slot==='off'&&!has('off')) return `<div class="cmp"><div class="ch">Off hand only · learn Second Hand to use it</div></div>`;
  const cur=P.equip[slot], a=P.stats, b=statsWith(slot,it); const rows=[];
  for(const [n,f,fmt] of CMP){ const va=f(a)||0, vb=f(b)||0, d=vb-va; if(Math.abs(d)<.005) continue; const F=fmt||(v=>String(Math.round(v))); rows.push([d>0,`${n}`,`${d>0?'+':'−'}${F(Math.abs(d)).replace(/^-/,'')}`]); }
  for(const k of (typeof ELEMS!=='undefined'?ELEMS:[])){ const d=(b[k]||0)-(a[k]||0); if(d) rows.push([d>0,`<span style="color:${ELEM[k].c}">${ELEM[k].jp} ${ELEM[k].n}</span>`,`${d>0?'+':'−'}${Math.abs(d)}`]); }
  const head=cur?`Compared with <span style="color:${RCOL[cur.rarity]}">${cur.name}</span>`:`Your ${slot==='off'?'off hand':slot} slot is empty`;
  const body=rows.length?rows.map(([up,n,v])=>`<div class="cr ${up?'up':'dn'}"><span>${n}</span><b>${up?'▲':'▼'} ${v}</b></div>`).join(''):`<div class="cr eq">No change to your stats</div>`;
  const up=rows.filter(r=>r[0]).length, dn=rows.length-up; const verdict=!rows.length?'':up&&!dn?'<div class="cv up">An upgrade</div>':dn&&!up?'<div class="cv dn">A step down</div>':'<div class="cv mx">Trade-offs</div>';
  return `<div class="cmp"><div class="ch">${head}</div>${body}${verdict}</div>`; }

/* ---------- what you're standing on: tooltips in the top right, side by side ---------- */
let gtKey='';
function updGroundTips(){ const layer=$('#drolls'); if(!layer) return;
  const near=(mode==='play'&&P&&!P.dead)?drops.filter(d=>d.kind==='item'&&Math.abs(d.x-P.x)<28&&Math.abs(d.y-P.y)<26&&!dropLive.some(b=>b._it===d.item)).sort((a,b)=>Math.abs(a.x-P.x)-Math.abs(b.x-P.x)):[];
  const cap=Math.max(1,3-dropLive.filter(b=>b.isConnected).length), show=near.slice(0,cap), more=near.length-show.length; const key=show.map(d=>d.item.id).join(',')+'|'+more+'|'+(P?Object.values(P.equip).map(e=>e&&e.id).join('.'):'');
  if(key===gtKey) return; gtKey=key; layer.querySelectorAll('.gtip').forEach(e=>e.remove());
  show.forEach((d,i)=>{ const box=document.createElement('div'); box.className='droll tt gtip'+(i===0?' first':''); box.appendChild(iconEl(d.item)).className='dri';
    box.insertAdjacentHTML('beforeend',tipHTML(d.item)+compareHTML(d.item)+(i===0?'<div class="gk"><button class="eqb tk"><kbd>E</kbd> Take</button><button class="eqb"><kbd>R</kbd> Equip</button></div>':'<div class="gk"><button class="eqb">Equip</button></div>')); layer.appendChild(box); box.querySelectorAll('.eqb').forEach(b=>{ b.onpointerdown=ev=>ev.stopPropagation(); b.onclick=ev=>{ ev.stopPropagation(); if(b.classList.contains('tk')) takeDrop(d); else equipFromFloor(d); gtKey=''; }; }); });
  if(more>0){ const m=document.createElement('div'); m.className='droll tt gtip gmore'; m.textContent=`+${more} more underfoot`; layer.appendChild(m); } }
(function(){ const o=updLabels; updLabels=function(){ o(); updGroundTips(); }; })();

/* ---------- equip straight from a chest or the floor ---------- */
function equipItem(it){ const slot=targetSlot(it); if(slot==='off'&&!has('off')){ toast('Off hand only. Learn Second Hand (Steel) first.'); return false; }
  const old=P.equip[slot]; P.equip[slot]=it; if(old){ if(!bagAdd(old)) dropItem(old,P.x-P.face*10,P.y-10,true); }
  if(slot==='weapon'&&it.base.h===2&&P.equip.off&&has('off')) toast('Two-handed: your off hand rests.');
  calcStats(); noteBest(it); AU.tone('triangle',420,300,.08,.12,.1); AU.pickup(); sparks(P.x,P.y-16,8,RCOL[it.rarity]); toast(`Equipped ${it.name}${old?` · ${old.name} went to your satchel`:''}`); gtKey=''; return true; }
function underfoot(){ return drops.filter(d=>d.kind==='item'&&Math.abs(d.x-P.x)<28&&Math.abs(d.y-P.y)<26).sort((a,b)=>Math.abs(a.x-P.x)-Math.abs(b.x-P.x)); }
function equipFromFloor(d){ if(!d) d=underfoot()[0]; if(!d) return; if(equipItem(d.item)){ d.gone=true; drops=drops.filter(x=>!x.gone); } }
addEventListener('keydown',ev=>{ const k=ev.key.length===1?ev.key.toLowerCase():ev.key; if(k!=='r'||ev.repeat) return;
  if(mode==='play'&&P&&!P.dead&&underfoot().length){ ev.preventDefault(); equipFromFloor(); }
  else if(mode==='case'&&caseState&&caseState.ready){ ev.preventDefault(); closeCase('equip'); } });

/* ---------- the first descent is lean: rarer good drops, rarer top stat grades ---------- */
(function(){ const o=oddsW; oddsW=function(w,mf){ const q=o(w,mf); return q.map((v,i)=>i===3?v*2.2:v); }; })();
(function(){ const o=oddsW; oddsW=function(w,mf){ const r=o(w,ngp>0?mf:(mf||0)*.6); return ngp>0?r:r.map((v,i)=>v*[1.7,1,.5,.8,.33,.2][i]); }; })();
const GR_BASE=GR.map(g=>g.w);
function setGrades(){ const lean=ngp===0; GR[2].w=lean?14:GR_BASE[2]; GR[3].w=lean?2.6:GR_BASE[3]; GR[4].w=lean?.08:GR_BASE[4]; }
(function(){ const o=loadLevel; loadLevel=function(){ const r=o.apply(this,arguments); setGrades(); return r; }; })();
{ const cb=$('#pFlash'); if(cb){ cb.checked=SETTINGS.flashes!==false; cb.onchange=()=>{ SETTINGS.flashes=cb.checked; store.set('marrowdeep.settings',SETTINGS); }; } }
