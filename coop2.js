'use strict';
/* ===== co-op fixes (v16) =====
   1. Arenas and the last chamber wait for everyone. A chamber used to seal the moment any one player stepped in,
      locking the rest outside. Now it holds open until every living player is inside, with a banner saying who is
      missing. After 45 seconds it seals anyway, and anyone still outside (or lying down outside) is pulled in, so
      nobody can be locked out and nobody can stall the run by standing in the doorway.
   2. Everyone sees the same reels. The item was always the same, but each machine drew its own filler cards, its own
      near misses and its own stopping point. The chest reel, every stat reel, the fate reel and the Hollow Garden roll
      now draw from a seed every machine shares, so if you just miss something, you all just miss it.
   3. Foe snapshots carry stun, freezing and state (net.js), and go out 20 times a second instead of 15. */
const WAIT_MAX=45;
const AW={i:-1,n:0,of:0,left:0,t:0};
const awEl=document.createElement('div'); awEl.id='coopWait'; awEl.hidden=true; stage.appendChild(awEl);
(function(){ const st=document.createElement('style'); st.textContent=`#coopWait{position:absolute;left:50%;top:calc(var(--u)*7.5);transform:translateX(-50%);font-family:var(--fd);font-size:calc(var(--u)*2);color:#ffd6a0;text-shadow:0 0 calc(var(--u)*.8) #300;pointer-events:none;z-index:7;text-align:center;white-space:nowrap}
#coopWait small{display:block;font-family:var(--fs);font-size:.55em;color:#c9b8a8;letter-spacing:.06em}`; document.head.appendChild(st); })();
function showWait(n,of,left,final){ awEl.innerHTML=`${final?'The last chamber':'The arena'} waits for everyone · ${n} of ${of} inside<small>${left>0?`It seals in ${Math.ceil(left)}s and pulls the others in`:'Sealing'}</small>`; awEl.hidden=false; AW.t=time; }
const teamAlive=()=>[P].concat(Object.values(NET.heroes).filter(heroLive).map(h=>h.p)).filter(p=>p&&!p.dead);
const inArena=(a,p,core)=>core?(p.x>a.x0+4*T&&p.x<a.x1-4*T&&p.y>a.y0&&p.y<a.y1):(p.x>a.x0&&p.x<a.x1&&p.y>a.y0&&p.y<a.y1);
/* the host holds a chamber open until everyone living is inside it */
(function(){ const o=updArenas; updArenas=function(dt){ if(!COOP||!NET.host||!L||!L.arenas) return o(dt);
  const team=teamAlive(); let shown=false;
  L.arenas.forEach((a,i)=>{ a.hold=false; if(a.state!==0) return; const n=team.filter(p=>inArena(a,p,true)).length;
    if(n>0&&n<team.length){ a.waitT=(a.waitT||0)+dt; if(a.waitT<WAIT_MAX){ a.hold=true; shown=true; const left=WAIT_MAX-a.waitT;
        if(AW.i!==i||AW.n!==n||AW.of!==team.length||Math.ceil(left)!==Math.ceil(AW.left)){ Object.assign(AW,{i,n,of:team.length,left}); bcast({t:'aw',ep:NET.epoch,i,n,of:team.length,left:Math.ceil(left),f:a.final?1:0}); showWait(n,team.length,left,a.final); } } }
    else a.waitT=0; });
  if(!shown&&AW.i>=0){ AW.i=-1; bcast({t:'aw',ep:NET.epoch,i:-1}); awEl.hidden=true; }
  const was=L.arenas.map(a=>a.state); o(dt);
  L.arenas.forEach((a,i)=>{ if(was[i]===0&&a.state===1) pullIn(a); }); }; })();
/* sealing pulls in anyone outside, living or down, so nobody is left on the wrong side of the door */
function pullIn(a){ if(!P||inArena(a,P,false)) return; const spots=typeof chamberSpots==='function'?chamberSpots(a):[]; if(!spots.length) return;
  spots.sort((p,q)=>Math.abs(p[0]-(a.ox+3))-Math.abs(q[0]-(a.ox+3))); const [sx,sy]=spots[Math.min(spots.length-1,NET.me||0)];
  ash(P.x,P.y-14,16); P.x=sx*T+8; P.y=sy*T; P.vx=P.vy=0; P.inv=Math.max(P.inv,1.5); P.teth=null; P.attack=null; P.safe={x:P.x,y:P.y}; ash(P.x,P.y-14,20); AU.door();
  toast('The chamber seals and drags you in with the others.'); }
(function(){ const o=arenaIn; arenaIn=function(m){ const a=L&&L.arenas&&L.arenas[m.i]; const opening=a&&m.st>=1&&a.state===0; o(m); if(opening) pullIn(a); awEl.hidden=true; }; })();
/* a teammate brought back up outside a sealed chamber walks back in */
(function(){ const o=reviveIn; reviveIn=function(m){ o(m); if(L&&L.arenas) for(const a of L.arenas) if(a.state===1) pullIn(a); }; })();
(function(){ const o=onMsg; onMsg=function(s,m){
  if(m&&m.t==='aw'){ if(!NET.host&&m.ep===NET.epoch){ if(m.i<0) awEl.hidden=true; else showWait(m.n,m.of,m.left,!!m.f); } return; }
  return o(s,m); }; })();
(function(){ const o=loadLevel; loadLevel=function(idx,opt){ awEl.hidden=true; AW.i=-1; return o(idx,opt); }; })();
(function(){ const o=update; update=function(dt){ o(dt); if(!awEl.hidden&&time-AW.t>3) awEl.hidden=true; }; })();

/* ---------- shared reels ---------- */
(function(){ const o=showCase; showCase=function(tier,ilvl,win,onClose){ if(!(COOP&&NET.cc)) return o(tier,ilvl,win,onClose); const rid=NET.cc.rid;
  const r=withSeed(netSeed('case',rid),()=>o(tier,ilvl,win,onClose)); if(caseState) caseState.seed=netSeed('stat',rid); return r; }; })();
(function(){ const o=statReel; statReel=function(it,box,done,opt){ opt=Object.assign({},opt); if(COOP&&opt.seed==null&&it) opt.seed=netSeed('drop',JSON.stringify(serItem(it))); return o(it,box,done,opt); }; })();
if(typeof showSecretRoll==='function'){ const o=showSecretRoll; showSecretRoll=function(hit,cb){ if(!COOP) return o(hit,cb); return withSeed(netSeed('sec',lvlIdx,NET.epoch),()=>o(hit,cb)); }; }
