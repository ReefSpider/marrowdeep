'use strict';
/* ===== v29 co-op =====
   - Friends can join a descent that's already under way. The host seats them, sends them the current map (same
     seed, live foes, drops), and tells everyone else to expect a new sellsword. A crowd counts from the next map on.
   - Leaving mid-run no longer sends you home. You stay where you were, on a fresh solo copy of the same map, and
     the save points there, so Continue brings you back to it. Use the code again to rejoin the others.
   - The Gilded Debtor only escapes on the host's word, so a guest can't watch him vanish while he's still running
     on the host. His chest is a boss chest now. */

/* ---------- the Gilded Debtor ---------- */
(function(){ const o=EAI.debtor; EAI.debtor=function(e,dt,c){ if(COOP&&!NET.host&&e.seen){ e.escape=99; } return o(e,dt,c); }; })();
(function(){ const o=dropChest; dropChest=function(e,tier){ if(e&&e.type==='debtor') tier=2; return o(e,tier); }; })();
(function(){ const o=killEnemy; killEnemy=function(e,dir,crit){ const r=o(e,dir,crit); if(e&&e.type==='debtor'&&e.dead&&!e.escaped) toast('The Debtor\'s hoard spills out: a boss reliquary.'); return r; }; })();

/* ---------- joining a descent already under way ---------- */
(function(){ const o=hostHello; hostHello=function(id,m){ if(!NET.running) return o(id,m);
  const rej=why=>NET.tr.send(id,{t:'reject',why}); if(m.v!==NET_V) return rej('Your copy of the game doesn\'t match the host\'s. Both of you reload the page.'); if(NET.seats.length>=4) return rej('That descent is full.');
  let s=0; while(seatOf(s)) s++; let nm=(m.name||'Sellsword').replace(/[<>&"]/g,'').slice(0,16); const base=nm; let k=2; while(NET.seats.some(x=>x.name===nm)) nm=base+' '+(k++);
  const x={s,name:nm,lvl:m.lvl|0}; NET.seats.push(x); NET.seats.sort((a,b)=>a.s-b.s); NET.links[id]=s; NET.heroes[s]=mkHero(x); NET.n=NET.seats.length;
  NET.tr.send(id,{t:'welcome',s,code:NET.code,tier:NET.tier!=null?NET.tier:(META.pick||0)});
  NET.tr.send(id,{t:'start',tier:NET.tier!=null?NET.tier:(META.pick||0),n:NET.n,seats:NET.seats.map(q=>({s:q.s,name:q.name,lvl:q.lvl})),mid:1});
  for(const [lid,ls] of Object.entries(NET.links)) if(ls!==s) NET.tr.send(lid,{t:'join',x,seats:NET.seats});
  if(L&&!NET.betweenLevels&&L.def.kind!=='cabin') setTimeout(()=>{ if(!NET.links[id]&&NET.links[id]!==0) return;
    NET.tr.send(id,{t:'lvl',ep:NET.epoch,idx:lvlIdx,ngp,vs:(typeof LVVAR!=='undefined'?LVVAR.v:0),wipe:0,sec:0,a:enemies.filter(e=>!e.dead&&e.nid).map(espec),d:drops.filter(d=>d.nid).map(dspec)}); },400);
  toast(`${nm} joins the descent.`); AU.tone('triangle',660,880,.15,.1,.3); }; })();
(function(){ const o=onMsg; onMsg=function(s,m){ if(m&&m.t==='join'&&!NET.host){ NET.seats=m.seats; if(m.x.s!==NET.me&&!NET.heroes[m.x.s]) NET.heroes[m.x.s]=mkHero(m.x); NET.n=NET.seats.length; toast(`${m.x.name} joins the descent.`); return; } return o(s,m); }; })();
/* a guest who joins mid-run starts at the host's tier and skips the opening card once the map arrives */
(function(){ const o=coopStart; coopStart=function(m){ o(m); if(m.mid&&!NET.host) toast('You catch up with the others…'); }; })();

/* ---------- leaving keeps you where you were ---------- */
netLeave=function(quiet){ if(NET.tr){ if(NET.host) bcast({t:'bye'}); else toHost({t:'bye'}); const tr=NET.tr; setTimeout(()=>tr.close(),150); }
  const was=NET.running, ending=NET.ending, idx=lvlIdx, here=L&&L.def; clearTimeout(NET.helloT); netReset(); COOP=null; if(!quiet) coopStatus=''; coopScr.hidden=true;
  if(was&&ending){ /* everyone walks home through their own ending */ }
  else if(was){ ngp=META.pick||0; $('#case').hidden=true; caseState=null; hideCard(); $('#death').hidden=true; for(const k in NET.heroes) delete NET.heroes[k]; teamEl&&(teamEl.hidden=true); tagsEl&&(tagsEl.hidden=true);
    if(here&&here.kind!=='cabin'&&idx>0){ if(P.dead){ P.dead=false; P.deadT=0; } P.life=Math.max(P.life,P.stats.life*.5); loadLevel(idx); mode='play'; hud.hidden=false; if(typeof MUS!=='undefined') MUS.setMood(moodFor(LEVELS[idx])); try{ saveGame(); }catch(_){}
      toast('You go on alone, from where you stood. The way back to the others is the same code.'); }
    else { mode='play'; hud.hidden=false; } }
  else if(!coopScr.hidden||mode==='coop'){ mode='play'; hud.hidden=false; } };
