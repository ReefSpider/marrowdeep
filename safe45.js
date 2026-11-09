'use strict';
/* ===== v45: co-op messages are cleaned before the game reads them =====
   Items from other players are rebuilt by deItem (items.js), which cleans their name and stats. This wraps onMsg last, so it
   runs first: any player name in a message (lobby seats, a returning hero, duel news) loses characters that could become HTML.
   The host already cleaned names at hello; this also covers a guest whose host isn't playing fair. */
(function(){
  const clean=n=>String(n==null?'':n).replace(/[<>&"`\\]/g,'').slice(0,24);
  const walk=(v,d)=>{ if(!v||typeof v!=='object'||d>4) return; if(Array.isArray(v)){ for(const x of v) walk(x,d+1); return; }
    for(const k of Object.keys(v)){ if((k==='name'||k==='by'||k==='who')&&typeof v[k]==='string') v[k]=clean(v[k]); else if(v[k]&&typeof v[k]==='object'&&k!=='it'&&k!=='item'&&k!=='items') walk(v[k],d+1); } };
  const o=onMsg; onMsg=function(s,m){ if(!m||typeof m!=='object'||typeof m.t!=='string') return; try{ walk(m,0); }catch(e){ return; } return o(s,m); };
})();
