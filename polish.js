'use strict';
/* ===== polish (v17): messages, buttons, fades =====
   1. One message at a time. toast() used to stack up to three lines on top of banners, cut-ins and epigraphs.
      Now messages queue and show one by one, longest-waiting first within the same importance:
        2 important (gear broke, level warnings, co-op events, Winded, first-time lessons): jump the queue,
          and shorten a minor message that's showing.
        1 normal.
        0 minor (Codex entries, equips, pickups): held while foes are close or a banner is up, dropped if stale.
      Identical messages merge ("×2"), and nothing shows while a boss name, cut-in or act banner is on screen.
      Each stays up for a time that fits its length (2.4 s plus a little per word, up to 6 s).
   2. Buttons answer: a soft tick on hover, a low click on press.
   3. Fades: screens and cards ease in, and every level fades up from black. */
const MSG={q:[],cur:null,until:0,hold:0,seq:0};
const MSG_HI=/Requires level|broke\b|Kintsugi|left the descent|ended the descent|The host|You're down|pulled you back|Winded|Interrupted|Strike in rhythm|The Bell|levels above you|can only|can't|cannot|Barred|escaped|It was never a chest|seals and drags|Choose your Way|You can change|Your Way/;
const MSG_LO=/Codex|^新|went to your satchel|^Equipped |Given to|gave you|falls from the body|coughs up|crumbles to gold/;
function msgPri(t){ return MSG_HI.test(t)?2:MSG_LO.test(t)?0:1; }
const msgDur=t=>Math.min(6,2.4+t.split(/\s+/).length*.13);
function msgBusy(){ return performance.now()<MSG.hold; }
function msgFight(){ if(typeof P==='undefined'||!P||P.dead||!enemies) return false; return enemies.some(e=>!e.dead&&!e.intro&&Math.abs(e.x-P.x)<170&&Math.abs(e.y-P.y)<100); }
toast=function(t,pri){ if(!t) return; t=String(t); pri=pri==null?msgPri(t):pri; const now=performance.now();
  if(MSG.cur&&MSG.cur.t===t){ MSG.cur.n++; MSG.cur.el.textContent=`${t} ×${MSG.cur.n}`; MSG.until=Math.max(MSG.until,now+1500); return; }
  const dup=MSG.q.find(m=>m.t===t); if(dup){ dup.n++; return; }
  MSG.q.push({t,pri,at:now,n:1,id:++MSG.seq});
  if(MSG.q.length>6){ MSG.q.sort((a,b)=>a.pri-b.pri||a.at-b.at); MSG.q.shift(); }
  if(pri===2&&MSG.cur&&MSG.cur.pri===0) MSG.until=Math.min(MSG.until,now+350);
  msgPump(); };
function msgShow(m){ const box=$('#toast'); box.innerHTML=''; const d=document.createElement('div'); const dur=msgDur(m.t);
  d.textContent=m.n>1?`${m.t} ×${m.n}`:m.t; d.className='mq p'+m.pri; d.style.animation=`toast ${dur}s ease-in-out forwards`; box.appendChild(d);
  MSG.cur={t:m.t,pri:m.pri,el:d,n:m.n}; MSG.until=performance.now()+dur*1000; }
function msgPump(){ const now=performance.now();
  if(MSG.cur&&now<MSG.until) return;
  if(MSG.cur&&now>=MSG.until){ MSG.cur.el.remove(); MSG.cur=null; }
  if(!MSG.q.length||msgBusy()) return;
  MSG.q=MSG.q.filter(m=>!(m.pri===0&&now-m.at>12000)&&!(m.pri===1&&now-m.at>20000));
  const fight=msgFight(); const ok=MSG.q.filter(m=>m.pri>0||!fight); if(!ok.length) return;
  ok.sort((a,b)=>b.pri-a.pri||a.at-b.at); const m=ok[0]; MSG.q=MSG.q.filter(x=>x!==m); msgShow(m); }
setInterval(msgPump,120);
/* banners take the screen: the queue waits for them */
const msgHold=ms=>{ MSG.hold=Math.max(MSG.hold,performance.now()+ms); if(MSG.cur&&MSG.cur.pri<2){ MSG.cur.el.remove(); MSG.q.unshift({t:MSG.cur.t,pri:MSG.cur.pri,at:performance.now(),n:MSG.cur.n,id:++MSG.seq}); MSG.cur=null; } };
(function(){ const o=showBossName; showBossName=function(...a){ msgHold(2600); return o(...a); }; })();
(function(){ const o=cutIn; cutIn=function(...a){ msgHold(1600); return o(...a); }; })();
(function(){ const o=epigraph; epigraph=function(...a){ msgHold(3200); return o(...a); }; })();
(function(){ const o=loadLevel; loadLevel=function(idx,opt){ const r=o(idx,opt); MSG.q=MSG.q.filter(m=>m.pri===2); return r; }; })();
(function(){ const st=document.createElement('style'); st.textContent=`
#toast .mq{white-space:normal;max-width:calc(var(--u)*44)}
#toast .mq.p2{border-left-color:#ffb24a;color:#fff2dc;box-shadow:0 0 calc(var(--u)*1) rgba(255,160,60,.25)}
#toast .mq.p0{color:#c9bca8;border-left-color:#5a4a44}
.screen:not([hidden]),#card:not([hidden]),#case:not([hidden]),#death:not([hidden]){animation:scrIn .32s cubic-bezier(.2,.7,.3,1)}
@keyframes scrIn{from{opacity:0;transform:scale(.985)}to{opacity:1;transform:none}}
.btn{transition:transform .08s,box-shadow .15s,border-color .15s}.btn:active{transform:translateY(1px) scale(.99)}
@media (prefers-reduced-motion: reduce){.screen:not([hidden]),#card:not([hidden]),#case:not([hidden]),#death:not([hidden]){animation:none}}`; document.head.appendChild(st); })();

/* ---------- buttons answer ---------- */
let btnHoverT=0, btnLast=null;
document.addEventListener('pointerover',ev=>{ const b=ev.target.closest&&ev.target.closest('button,.btn'); if(!b||b===btnLast||b.disabled) return; btnLast=b; const now=performance.now(); if(now-btnHoverT<45) return; btnHoverT=now; AU.tone('sine',1900,1750,.03,.022,.15); });
document.addEventListener('pointerout',ev=>{ const b=ev.target.closest&&ev.target.closest('button,.btn'); if(b&&!b.contains(ev.relatedTarget)) btnLast=null; });
document.addEventListener('click',ev=>{ const b=ev.target.closest&&ev.target.closest('button,.btn'); if(!b||b.disabled) return; AU.tone('triangle',540,380,.07,.06,.2); AU.noise(.03,3000,1800,2,.05,'bandpass',0); },true);

/* ---------- every level fades up from black ---------- */
(function(){ const o=goLevel; goLevel=function(i){ U.uFade.value=0; return o(i); }; })();
