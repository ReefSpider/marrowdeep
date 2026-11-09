'use strict';
/* ===== v43: duels (BT, 9 Nov: "add a way that me and another can challenge to a duel") =====
   In co-op, stand near a teammate and press V (or stand still a moment and tap the banner that appears) to challenge them; they press V within 10 s to accept.
   A 3-second count, then your blows land on each other: melee swings and bolts, with blocking, parrying, rolling and
   defense all working as they do against foes (the one who's hit applies it on their own side, the way foes hit you).
   A duel hit is 35% of what the blow would do to a foe, and never more than 35% of the target's life in one go,
   so a duel takes a while and a big level gap isn't a one-shot. The draught belt is sealed while it lasts.
   The first to be brought to nothing loses; nobody dies, nothing breaks, and both are healed to full at the end.
   Ninety seconds without a winner and the one with more life left takes it. Walk more than 500 px apart for 3 s, leave,
   or change level, and the duel is off. Everyone in the party hears who won; your record against each name is kept. */
const DUEL={k:.35, cap:.35, range:160, foeClear:250, count:3, len:90, apart:500, askT:10,
  st:null,   /* {opp, phase:'count'|'fight', t0, ids:Set, ch:bool} */
  ask:null,  /* incoming challenge {from, until} */
  out:null}; /* outgoing challenge {to, until} */
const duelOn=()=>!!(DUEL.st&&DUEL.st.phase==='fight');
const duelRec=()=>{ try{ return JSON.parse(localStorage.getItem('marrowdeep.duels')||'{}'); }catch(e){ return {}; } };
function duelSave(name,won){ const r=duelRec(); const x=r[name]||(r[name]={w:0,l:0}); won?x.w++:x.l++; try{ localStorage.setItem('marrowdeep.duels',JSON.stringify(r)); }catch(e){} return x; }

/* ---------- messages: dc challenge · da accept · dh hit · de I lost · dx off · dn everyone hears ---------- */
function dAll(m){ m.from=NET.me; if(NET.host) bcast(m); else toHost(m); }
function dSend(m){ m.from=NET.me; if(NET.host){ if(m.to===NET.me) duelMsg(m); else sendSeat(m.to,m); } else toHost(m); }
(function(){ const o=onMsg; onMsg=function(s,m){
  if(m&&m.t==='dn'){ if(NET.host) bcast(m,s); duelNews(m); return; }
  if(m&&(m.t==='dc'||m.t==='da'||m.t==='dh'||m.t==='de'||m.t==='dx')){ if(NET.host&&m.to!==NET.me){ sendSeat(m.to,m); return; } duelMsg(m); return; }
  return o(s,m); }; })();
function duelMsg(m){ const nm=nameOf(m.from);
  switch(m.t){
  case 'dc': if(DUEL.st) { dSend({t:'dx',to:m.from,why:'busy'}); return; }
    if(DUEL.out&&DUEL.out.to===m.from){ /* we challenged each other at once: that's a yes from both */ DUEL.out=null; dSend({t:'da',to:m.from}); duelBegin(m.from,NET.me<m.from); break; }
    DUEL.ask={from:m.from,until:performance.now()+DUEL.askT*1000}; AU.bell&&AU.bell(); break;
  case 'da': if(DUEL.out&&DUEL.out.to===m.from){ DUEL.out=null; duelBegin(m.from,true); } break;
  case 'dh': if(duelOn()&&DUEL.st.opp===m.from) duelTake(m); break;
  case 'de': if(DUEL.st&&DUEL.st.opp===m.from) duelEnd(true,m.draw); break;
  case 'dx': if(DUEL.out&&DUEL.out.to===m.from){ DUEL.out=null; toast(m.why==='busy'?`${nm} is already in a duel.`:`${nm} turned the duel down.`); }
    if(DUEL.st&&DUEL.st.opp===m.from){ DUEL.st=null; duelHeal(); toast(`The duel with ${nm} is off.`); } if(DUEL.ask&&DUEL.ask.from===m.from) DUEL.ask=null; break; }
  duelUI(); }
function duelNews(m){ if(m.w===NET.me||m.l===NET.me) return; toast(m.draw?`${nameOf(m.w)} and ${nameOf(m.l)} fought to a standstill.`:`${nameOf(m.w)} beat ${nameOf(m.l)} in a duel (${m.sec}s).`); }

/* ---------- who's near ---------- */
function duelNear(){ if(typeof COOP==='undefined'||!COOP||!P||P.dead||mode!=='play'||NET.betweenLevels) return null; let best=null, bd=DUEL.range;
  for(const h of Object.values(NET.heroes)){ if(!heroLive(h)||h.p.dead) continue; const d=Math.hypot(h.p.x-P.x,h.p.y-P.y); if(d<bd){ bd=d; best=h; } } return best; }
const duelFoes=()=>enemies.some(e=>!e.dead&&!e.intro&&Math.abs(e.x-P.x)<DUEL.foeClear&&Math.abs(e.y-P.y)<DUEL.foeClear*.6);
function duelKey(){ if(DUEL.st) return;
  if(DUEL.ask&&performance.now()<DUEL.ask.until){ const s=DUEL.ask.from; DUEL.ask=null; dSend({t:'da',to:s}); duelBegin(s,false); return; }
  const h=duelNear(); if(!h){ return; } if(duelFoes()){ toast('Not with foes this close. Find a quiet spot.'); return; }
  if(DUEL.out&&DUEL.out.to===h.s&&performance.now()<DUEL.out.until) return;
  DUEL.out={to:h.s,until:performance.now()+DUEL.askT*1000}; dSend({t:'dc',to:h.s}); toast(`You challenge ${h.name} to a duel.`); duelUI(); }
addEventListener('keydown',ev=>{ if(ev.repeat||mode!=='play'||typeof COOP==='undefined'||!COOP) return; if(ev.key==='v'||ev.key==='V'){ ev.preventDefault(); duelKey(); } });

/* ---------- start and end ---------- */
function duelBegin(opp,challenger){ DUEL.ask=null; DUEL.out=null; DUEL.st={opp,phase:'count',t0:performance.now(),ids:new Set(),ch:challenger,apartT:0}; duelSeal(true); P.life=P.stats.life; P.inv=DUEL.count; AU.bell&&AU.bell(); duelUI(); }
function duelSeal(on){ if(!P) return; if(on){ if(DUEL.pot==null){ DUEL.pot=P.potions|0; P.potions=0; } } else if(DUEL.pot!=null){ P.potions=Math.min(4,(P.potions|0)+DUEL.pot); DUEL.pot=null; } if(typeof updBelt==='function') updBelt(); }
function duelHeal(){ duelSeal(false); if(P&&P.stats){ P.life=P.stats.life; P.inv=Math.max(P.inv,1.2); P.dead=false; } }
function duelEnd(won,draw){ const st=DUEL.st; if(!st) return; DUEL.st=null; const nm=nameOf(st.opp), sec=Math.round((performance.now()-st.t0)/1000-DUEL.count);
  duelHeal(); if(draw){ toast(`You and ${nm} fought to a standstill.`); }
  else { const r=duelSave(nm,won); duelBanner(won?`You beat ${nm}`:`${nm} beats you`,`${r.w}–${r.l} against ${nm}`,3); if(won&&AU.bell) AU.bell(); }
  if(!won||draw){ /* the loser (or the challenger, on a draw) tells the party */ if(!draw||st.ch) dAll({t:'dn',w:draw?NET.me:st.opp,l:draw?st.opp:NET.me,sec:Math.max(0,sec),draw:!!draw}); }
  duelUI(); }
function duelLose(draw){ const st=DUEL.st; if(!st) return; dSend({t:'de',to:st.opp,draw:!!draw}); duelEnd(false,draw); }

/* ---------- your blows on them ---------- */
function oppHero(){ const st=DUEL.st; const h=st&&NET.heroes[st.opp]; return h&&heroLive(h)?h:null; }
const heroBox=p=>({x:p.x-(p.w||10)/2,y:p.y-(p.h||26),w:p.w||10,h:p.h||26});
function duelHitOut(raw,crit,dir){ const h=oppHero(); if(!h) return; const d=Math.max(1,Math.round(raw*DUEL.k)); dSend({t:'dh',to:h.s,d,crit:crit?1:0,x:Math.round(P.x)});
  num(h.p.x,h.p.y-30,d,crit?'#ffd66a':'#f1e6d2'); AU.hit(crit); freeze=Math.max(freeze,crit?.08:.04); shake(crit?4:2); sparks(h.p.x,h.p.y-16,crit?8:5,'#fff1c8'); }
(function(){ const o=hitBoxAll; hitBoxAll=function(hb,mv,id,hand,dirO,mult){ o(hb,mv,id,hand,dirO,mult); if(!duelOn()) return; const h=oppHero(); if(!h||h.p.dead||DUEL.st.ids.has(id)) return;
  if(!overlap(hb,heroBox(h.p))) return; DUEL.st.ids.add(id); const s=P.stats; let d=rollHand(hand)*mv.dm*(mult||1)*(1+(P.lvl-1)*.05)*(P.houndT>0?1.25:1);
  const crit=R()*100<s.crit||P.clarT>0||!!(P.attack&&P.attack.allCrit); if(crit) d*=2; duelHitOut(d,crit,dirO||P.face); }; })();
(function(){ const o=updProjs; updProjs=function(dt){ if(duelOn()){ const h=oppHero(); if(h&&!h.p.dead){ const b=heroBox(h.p);
    for(const p of projs){ if(p.from!=='p'||p.life<=0||!(p.dmg>0)||p.duelHit) continue; if(overlap({x:p.x-(p.r||2),y:p.y-(p.r||2),w:(p.r||2)*2,h:(p.r||2)*2},b)){ p.duelHit=1; const crit=R()*100<P.stats.crit; duelHitOut(p.dmg*(crit?2:1),crit,Math.sign(p.vx)||1); if(!p.pierce) p.life=0; } } } }
  return o(dt); }; })();

/* ---------- their blows on you (applied here, like a foe's) ---------- */
function duelTake(m){ if(!P||P.dead) return; const s=P.stats, jg=s.jugg; s.jugg=false; DUEL.taking=true;
  const cap=s.life*DUEL.cap/Math.max(.05,defMul(s.def)); /* the cap is on what lands, after your defense */
  try{ hurtPlayer(Math.min(m.d,cap),{x:m.x,hp:0,dead:true,name:'Duel'}); } finally{ s.jugg=jg; DUEL.taking=false; } }
(function(){ const o=die; die=function(){ if(DUEL.taking&&DUEL.st){ P.life=1; P.dead=false; P.inv=1.5; duelLose(false); return; } return o(); }; })();

/* ---------- each frame (on the wall clock, so a background tab still keeps time) ---------- */
setInterval(()=>{ try{
  if(typeof COOP==='undefined'||!COOP){ if(DUEL.st||DUEL.ask||DUEL.out){ DUEL.st=DUEL.ask=DUEL.out=null; duelUI(); } return; }
  const now=performance.now(); if(DUEL.ask&&now>DUEL.ask.until) DUEL.ask=null; if(DUEL.out&&now>DUEL.out.until){ toast(`${nameOf(DUEL.out.to)} didn't answer.`); DUEL.out=null; }
  DUEL.idleT=(P&&!P.dead&&Math.abs(P.vx)<5&&!P.attack)?(DUEL.idleT||0)+.25:0;
  const st=DUEL.st;
  if(st){ const el=(now-st.t0)/1000; if(st.phase==='count'&&el>=DUEL.count){ st.phase='fight'; P.inv=0; }
    const h=NET.heroes[st.opp]; if(!h||!heroLive(h)){ DUEL.st=null; duelHeal(); toast('The duel is off.'); }
    else { const far=Math.hypot(h.p.x-P.x,h.p.y-P.y)>DUEL.apart; st.apartT=far?st.apartT+.25:0; if(st.apartT>=3){ dSend({t:'dx',to:st.opp}); DUEL.st=null; duelHeal(); toast('Too far apart. The duel is off.'); }
      else if(st.phase==='fight'&&el>=DUEL.count+DUEL.len){ const mine=P.life/P.stats.life, theirs=(h.p.life||0)/Math.max(1,(h.st&&h.st.ml)||1);
        if(mine<theirs-.001) duelLose(false); else if(Math.abs(mine-theirs)<=.001&&st.ch) duelLose(true); } } }
  duelUI(); }catch(e){} },250);
(function(){ const o=loadLevel; loadLevel=function(...a){ if(DUEL.st){ DUEL.st=null; duelHeal(); } DUEL.ask=DUEL.out=null; duelUI(); return o(...a); }; })();

/* ---------- the banner ---------- */
const duelEl=document.createElement('div'); duelEl.id='duelBanner'; duelEl.hidden=true; stage.appendChild(duelEl);
(function(){ const st=document.createElement('style'); st.textContent=`
#duelBanner{position:absolute;left:50%;top:calc(var(--u)*12.6);transform:translateX(-50%);z-index:8;text-align:center;font-family:var(--fs);color:var(--bone);background:rgba(10,7,8,.82);border:1px solid #4a2a26;padding:calc(var(--u)*.45) calc(var(--u)*1.2);cursor:pointer;min-width:calc(var(--u)*18)}
#duelBanner b{font-family:var(--fd);font-weight:400;font-size:max(15px,calc(var(--u)*2));color:#f1d9a0;display:block}
#duelBanner .kj{font-family:'Shippori Mincho',serif;color:#c8322a;margin-right:.35em}
#duelBanner .bars{display:grid;grid-template-columns:1fr auto 1fr;gap:calc(var(--u)*.6);align-items:center;margin-top:calc(var(--u)*.3);font-size:max(10px,calc(var(--u)*1))}
#duelBanner .bar{height:calc(var(--u)*.6);background:#2a1a18;position:relative}#duelBanner .bar i{position:absolute;left:0;top:0;bottom:0;background:#b8322a}
#duelBanner .bar.r i{left:auto;right:0}
#duelBanner .s{font-size:max(10px,calc(var(--u)*1));color:#9a8a7a}`; document.head.appendChild(st); })();
duelEl.onclick=()=>duelKey();
let duelFlash=null;
function duelBanner(t,sub,sec){ duelFlash={t,sub,until:performance.now()+sec*1000}; duelUI(); }
function duelUI(){ const now=performance.now(); let html='';
  if(DUEL.st){ const st=DUEL.st, nm=nameOf(st.opp), h=NET.heroes[st.opp]; const el=(now-st.t0)/1000;
    if(st.phase==='count'){ const n=Math.ceil(DUEL.count-el); html=`<b><span class="kj">決闘</span>${n>0?n:'Fight'}</b><div class="s">against ${nm}</div>`; }
    else { const me=P&&P.stats?P.life/P.stats.life:0, them=h?(h.p.life||0)/Math.max(1,(h.st&&h.st.ml)||1):0, left=Math.max(0,Math.ceil(DUEL.count+DUEL.len-el));
      html=`<b><span class="kj">決闘</span>${nm}</b><div class="bars"><div class="bar"><i style="width:${(me*100).toFixed(0)}%"></i></div><span>${left}s</span><div class="bar r"><i style="width:${(clamp(them,0,1)*100).toFixed(0)}%"></i></div></div><div class="bars s"><span>You</span><span></span><span>${nm}</span></div>`; } }
  else if(duelFlash&&now<duelFlash.until) html=`<b><span class="kj">決闘</span>${duelFlash.t}</b><div class="s">${duelFlash.sub}</div>`;
  else if(DUEL.ask&&now<DUEL.ask.until) html=`<b><span class="kj">決闘</span>${nameOf(DUEL.ask.from)} challenges you</b><div class="s">V or tap to accept · ${Math.ceil((DUEL.ask.until-now)/1000)}s</div>`;
  else if(DUEL.out&&now<DUEL.out.until) html=`<b><span class="kj">決闘</span>Waiting for ${nameOf(DUEL.out.to)}</b><div class="s">${Math.ceil((DUEL.out.until-now)/1000)}s</div>`;
  else if((DUEL.idleT||0)>=1){ const h=duelNear(); if(h&&!duelFoes()) html=`<div class="s"><span class="kj">決闘</span>V or tap · challenge ${h.name} to a duel</div>`; }
  duelEl.hidden=!html; if(html&&duelEl._h!==html){ duelEl.innerHTML=html; duelEl._h=html; } }
