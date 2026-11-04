'use strict';
/* ===== co-op: up to four sellswords in one descent, peer to peer =====
   Shape: a star. Every guest talks to the host (PeerJS over WebRTC; ?net=local uses a BroadcastChannel between tabs).
   Model: everyone simulates the level; the host owns what matters.
   - Each machine moves its own hero and sends its state ~20 times a second. Remote heroes are drawn from those states.
   - Every machine runs enemy AI against the nearest living hero, and enemies only hurt the hero who lives on that machine,
     so dodging always feels local. The host sends enemy positions and life ~15 times a second and the guests ease toward them.
   - Guests send the damage they deal; the host applies it, decides every death, and tells everyone.
   - Loot: the host rolls every drop. Gold and draughts are each player's own (everyone picks up their own copy);
     items are shared, first to take one gets it. Chests are opened for everyone at once and rolled for (see below).
   - Arenas, the last chamber, boss intros, level changes and wipes are the host's call.
   Shared chests: everyone watches the reel, then has 3 seconds to roll for the item or pass. The winner is drawn with
   odds weighted by "fate debt": winning raises your debt (more for rarer items, a little even when nobody rolled against
   you), losing a contested roll pays some back, so the loot spreads out. */
const NET_V='marrowdeep-13';
const SEAT_C=['#e8c25a','#7ab8ff','#86d66a','#ff7ab8'];
const QS=new URLSearchParams(location.search);
const NET={conn:false,host:false,running:false,me:0,code:'',seats:[],tr:null,links:{},heroes:{},epoch:0,n:1,
  nid:0,dnid:0,seq:0,pend:[],ack:{},roll:null,chq:[],cc:null,debt:{},rdy:new Set(),going:false,betweenLevels:false,
  wipeT:0,tSt:0,tSn:0,tEq:0,eqKey:'',lp:null,swapped:false,applying:false,pendingLvl:null,chestN:0,giveTo:null,downShown:false,arSt:[]};
const DEBT_WIN=[0,.3,.6,1.5,2,3], DEBT_SOLO=[.2,.3,.4,.8,1,1.5];

/* ---------- transports ---------- */
function makeCode(){ const A='ABCDEFGHJKMNPQRSTUVWXYZ23456789'; let s=''; for(let i=0;i<6;i++) s+=A[Math.floor(Math.random()*A.length)]; return s; }
const cleanCode=s=>(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
let peerLib=null;
function loadPeer(){ if(window.Peer) return Promise.resolve(); if(peerLib) return peerLib;
  peerLib=new Promise((res,rej)=>{ const sc=document.createElement('script'); sc.src='https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js'; sc.onload=()=>res(); sc.onerror=()=>{ peerLib=null; rej(new Error('lib')); }; document.head.appendChild(sc); }); return peerLib; }
class PeerTr{ constructor(h){ this.h=h; this.conns=new Map(); }
  host(code){ return loadPeer().then(()=>new Promise((res,rej)=>{ const p=new Peer('marrowdeep-'+code,{debug:0}); this.peer=p; let done=false;
    p.on('open',()=>{ done=true; res(); });
    p.on('error',e=>{ if(!done){ done=true; rej(e); } });
    p.on('connection',c=>{ c.on('open',()=>{ const id=c.peer; this.conns.set(id,c); c.on('data',d=>this.h.msg(id,d)); c.on('close',()=>{ if(this.conns.get(id)===c){ this.conns.delete(id); this.h.drop(id); } }); c.on('error',()=>{}); this.h.open(id); }); });
    p.on('disconnected',()=>{ try{ if(!p.destroyed) p.reconnect(); }catch(e){} });
    setTimeout(()=>{ if(!done){ done=true; rej(new Error('timeout')); } },20000); })); }
  join(code){ return loadPeer().then(()=>new Promise((res,rej)=>{ const p=new Peer(undefined,{debug:0}); this.peer=p; let done=false;
    p.on('open',()=>{ const c=p.connect('marrowdeep-'+code,{reliable:true,serialization:'json'});
      c.on('open',()=>{ if(done) return; done=true; this.conns.set('host',c); c.on('data',d=>this.h.msg('host',d)); c.on('close',()=>this.h.drop('host')); res(); });
      c.on('error',e=>{ if(!done){ done=true; rej(e); } }); });
    p.on('error',e=>{ if(!done){ done=true; rej(e); } else if(e&&e.type==='peer-unavailable') this.h.drop('host'); });
    setTimeout(()=>{ if(!done){ done=true; rej(new Error('timeout')); } },25000); })); }
  send(id,m){ const c=this.conns.get(id); if(c&&c.open) try{ c.send(m); }catch(e){} }
  close(){ try{ for(const c of this.conns.values()) c.close(); }catch(e){} try{ this.peer&&this.peer.destroy(); }catch(e){} this.conns.clear(); } }
/* tabs of one browser, for testing: ?net=local, optionally &ping=150 to fake a slow line */
class LocalTr{ constructor(h){ this.h=h; this.id='L'+Math.random().toString(36).slice(2,9); this.bc=new BroadcastChannel('marrowdeep-net'); this.bc.onmessage=ev=>this.on(ev.data); this.peers=new Set(); this.ping=+(QS.get('ping')||0); }
  on(d){ const mine=d.to===this.id||(this.isHost&&d.to==='H:'+this.code); if(!mine) return;
    const run=()=>{ if(d.k==='hi'){ if(this.isHost){ this.peers.add(d.from); this.raw(d.from,{k:'ok'}); this.h.open(d.from); } return; }
      if(d.k==='ok'){ this.hostId=d.from; if(this._res){ const r=this._res; this._res=null; r(); } return; }
      if(d.k==='bye'){ if(this.isHost){ if(this.peers.delete(d.from)) this.h.drop(d.from); } else if(d.from===this.hostId) this.h.drop('host'); return; }
      this.h.msg(this.isHost?d.from:'host',d.m); };
    if(this.ping) setTimeout(run,this.ping/2); else run(); }
  raw(to,o){ this.bc.postMessage(Object.assign({from:this.id,to},o)); }
  host(code){ this.isHost=true; this.code=code; return Promise.resolve(); }
  join(code){ return new Promise((res,rej)=>{ this._res=res; this.raw('H:'+code,{k:'hi'}); setTimeout(()=>{ if(this._res){ this._res=null; rej({type:'peer-unavailable'}); } },3000); }); }
  send(id,m){ const to=id==='host'?this.hostId:id; if(to) this.raw(to,{k:'m',m}); }
  close(){ if(this.isHost) for(const p of this.peers) this.raw(p,{k:'bye'}); else if(this.hostId) this.raw(this.hostId,{k:'bye'}); try{ this.bc.close(); }catch(e){} } }

/* ---------- sending ---------- */
const seatOf=s=>NET.seats.find(x=>x.s===s);
const nameOf=s=>{ const x=seatOf(s); return x?x.name:'Someone'; };
function idOfSeat(s){ for(const id in NET.links) if(NET.links[id]===s) return id; return null; }
function sendSeat(s,m){ if(!NET.tr) return; if(NET.host){ const id=idOfSeat(s); if(id) NET.tr.send(id,m); } }
function bcast(m,except){ if(!NET.tr||!NET.host) return; for(const id in NET.links) if(NET.links[id]!==except) NET.tr.send(id,m); }
function toHost(m){ if(NET.tr&&!NET.host) NET.tr.send('host',m); }
/* a message the host and every guest should act on: the host acts now and tells the rest */
function everyone(m){ if(NET.host){ bcast(m); onMsg(0,m); } else toHost(m); }

/* ---------- the lobby ---------- */
(function(){ const st=document.createElement('style'); st.textContent=`
#coopScr{background:radial-gradient(ellipse at 50% 35%,rgba(16,24,40,.9),rgba(3,3,5,.97) 72%)}
#coopScr .mh span{font-family:'Shippori Mincho',serif;color:#6a9ad0}
#coopScr .sub{font-family:var(--fs);font-size:max(10px,calc(var(--u)*1.25));color:#8a8a9a;letter-spacing:.06em;margin-bottom:calc(var(--u)*1.2);max-width:calc(var(--u)*64)}
.cpbox{display:flex;flex-direction:column;align-items:center;gap:calc(var(--u)*.9)}
.cpbox input{font-family:var(--fs);font-size:max(13px,calc(var(--u)*1.8));background:#0a0a0e;color:var(--bone);border:1px solid #2a3040;padding:calc(var(--u)*.5) calc(var(--u)*1);letter-spacing:.12em;text-align:center}
.cpbox input.code{text-transform:uppercase;width:calc(var(--u)*16)}
.cpcode{font-family:var(--fs);font-size:calc(var(--u)*5.4);letter-spacing:.3em;color:#cfe0ff;text-shadow:0 0 calc(var(--u)*1.6) rgba(120,180,255,.5);margin:calc(var(--u)*.2) 0}
.cpseats{display:grid;grid-template-columns:1fr;gap:calc(var(--u)*.4);min-width:calc(var(--u)*40)}
.cpseat{display:flex;align-items:center;gap:calc(var(--u)*1);padding:calc(var(--u)*.5) calc(var(--u)*1);background:#0a0a10;border:1px solid #1e2230;font-family:var(--fs);font-size:max(11px,calc(var(--u)*1.4));color:#6a6a7a;text-align:left}
.cpseat i{width:calc(var(--u)*1.2);height:calc(var(--u)*1.2);border-radius:50%;background:#222;flex:none}.cpseat.on{color:var(--bone)}.cpseat small{margin-left:auto;color:#8a8a9a}
.cpmsg{font-family:var(--fs);font-size:max(10px,calc(var(--u)*1.2));color:#d08a6a;min-height:1.2em}
.cpor{font-family:var(--fs);color:#4a4a5a;font-size:max(9px,calc(var(--u)*1));letter-spacing:.2em}
#coopTeam{position:absolute;left:calc(var(--u)*1.2);top:calc(var(--u)*8.5);display:flex;flex-direction:column;gap:calc(var(--u)*.35);pointer-events:none;z-index:6}
#coopTeam .tm{font-family:var(--fs);font-size:max(9px,calc(var(--u)*1.05));color:var(--bone);background:rgba(4,4,6,.55);padding:calc(var(--u)*.2) calc(var(--u)*.6);border-left:3px solid var(--sc);min-width:calc(var(--u)*13)}
#coopTeam .tm b{font-weight:400;color:var(--sc)}#coopTeam .tm .lb{height:calc(var(--u)*.5);background:#1a0808;margin-top:calc(var(--u)*.2)}#coopTeam .tm .lb s{display:block;height:100%;background:#a8201a}
#coopTeam .tm.dn{opacity:.7}#coopTeam .tm.dn .lb s{background:#444}
#coopTags{position:absolute;inset:0;pointer-events:none;z-index:5}
#coopTags .tg{position:absolute;transform:translate(-50%,-100%);font-family:var(--fs);font-size:max(9px,calc(var(--u)*1));color:var(--sc);text-shadow:0 0 3px #000,0 0 3px #000;white-space:nowrap;text-align:center}
#coopTags .tg .rv{display:block;height:3px;background:#222;margin-top:2px}#coopTags .tg .rv s{display:block;height:100%;background:#9ad0ff}
#coopBanner{position:absolute;left:50%;top:calc(var(--u)*3);transform:translateX(-50%);font-family:var(--fd);font-size:calc(var(--u)*2.4);color:#ffb0a0;text-shadow:0 0 calc(var(--u)*1) #600;pointer-events:none;z-index:7;text-align:center;white-space:nowrap}
#coopBanner small{display:block;font-family:var(--fs);font-size:.5em;color:#c9b8a8;letter-spacing:.08em}
.coopTrade{margin-top:calc(var(--u)*.8);display:flex;gap:calc(var(--u)*.4);align-items:center;flex-wrap:wrap;font-family:var(--fs);font-size:max(10px,calc(var(--u)*1.1));color:#8a8078}
.coopTrade .btn{padding:calc(var(--u)*.25) calc(var(--u)*.9);font-size:max(10px,calc(var(--u)*1.15))}.coopTrade .btn.on{border-color:var(--sc);color:var(--sc);box-shadow:0 0 calc(var(--u)*.8) var(--sc)}
.need{display:flex;flex-direction:column;align-items:center;gap:calc(var(--u)*.45)}.need .nq{font-family:var(--fd);font-size:calc(var(--u)*2);color:var(--bone)}.need .nodds b{color:#ffd27a;font-weight:400}
#rbtns:has(.need){background:linear-gradient(rgba(4,2,3,0),rgba(4,2,3,.98) 16%)}
.need .row{display:flex;gap:calc(var(--u)*.8);position:static;padding:0;background:none}.ntimer{width:calc(var(--u)*30);height:calc(var(--u)*.6);background:#140c0c;border:1px solid #2a2020;overflow:hidden}.ntimer i{display:block;height:100%;width:100%;background:linear-gradient(90deg,#ff6a3a,#ffd27a)}
.nodds{font-family:var(--fs);font-size:max(10px,calc(var(--u)*1.15));color:#9a8a7a}
.rollv{display:flex;flex-direction:column;align-items:center;gap:calc(var(--u)*.6);width:100%}.rollv .rh{font-family:var(--fd);font-size:calc(var(--u)*2.6)}
.rollv .reel{width:min(100%,calc(var(--u)*70))}.rollv .card .n{font-size:max(11px,calc(var(--u)*1.4))}
.rollv .rwin{font-family:var(--fd);font-size:calc(var(--u)*3);min-height:1.2em}
`; document.head.appendChild(st); })();
const coopScr=document.createElement('div'); coopScr.className='screen'; coopScr.id='coopScr'; coopScr.hidden=true; stage.appendChild(coopScr);
const teamEl=document.createElement('div'); teamEl.id='coopTeam'; teamEl.hidden=true; stage.appendChild(teamEl);
const tagsEl=document.createElement('div'); tagsEl.id='coopTags'; tagsEl.hidden=true; stage.appendChild(tagsEl);
const bannerEl=document.createElement('div'); bannerEl.id='coopBanner'; bannerEl.hidden=true; stage.appendChild(bannerEl);
let coopPrevMode='play', coopStatus='';
function myName(){ try{ const s=curSlot&&slotGet(curSlot); if(s) return s.name.split(' ')[0]; }catch(e){} return store.get('marrowdeep.coopname')||'Sellsword'; }
function openCoop(code){ if(mode!=='coop') coopPrevMode=mode==='title'?'play':mode; mode='coop'; hud.hidden=true; coopScr.hidden=false; renderCoop(code); }
function closeCoop(){ coopScr.hidden=true; if(!NET.running){ mode=coopPrevMode==='coop'?'play':coopPrevMode; if(mode==='card'||mode==='inv') mode='play'; hud.hidden=false; } }
function renderCoop(code){ const lobby=NET.conn;
  if(!lobby){ coopScr.innerHTML=`<h2 class="mh">Together <span>共に</span></h2><div class="sub">Up to four sellswords, one descent. The more of you there are, the more of them there are, and the harder they hit.</div>
    <div class="cpbox"><input id="cpName" maxlength="16" value="${myName().replace(/"/g,'')}" aria-label="Your name">
    <button class="btn" id="cpHost">Host a descent</button><div class="cpor">— OR —</div>
    <input id="cpCode" class="code" maxlength="8" placeholder="CODE" value="${code||''}" aria-label="Invite code"><button class="btn" id="cpJoin">Join</button>
    <div class="cpmsg" id="cpMsg">${coopStatus}</div><button class="btn ghost" id="cpBack">Back <kbd>Esc</kbd></button>
    <div class="hint">Everyone plays this same page. The host's map table sets how deep you go.</div></div>`;
    $('#cpHost').onclick=()=>netHost(); $('#cpJoin').onclick=()=>netJoin(cleanCode($('#cpCode').value)); $('#cpBack').onclick=closeCoop;
    $('#cpCode').onkeydown=e=>{ if(e.key==='Enter') netJoin(cleanCode($('#cpCode').value)); }; return; }
  const tier=NET.tier!=null?NET.tier:(META.pick||0); const [a,b]=tierRange(tier);
  coopScr.innerHTML=`<h2 class="mh">Together <span>共に</span></h2><div class="sub">Send this code to the others. They open the same page, press Together and type it in.</div>
    <div class="cpbox"><div class="cpcode">${NET.code}</div>${NET.host?'<div class="row"><button class="btn ghost" id="cpCopy">Copy code</button><button class="btn ghost" id="cpLink">Copy link</button></div>':''}
    <div class="cpseats">${[0,1,2,3].map(i=>{ const x=seatOf(i); return `<div class="cpseat${x?' on':''}"><i style="background:${x?SEAT_C[i]:'#222'}"></i>${x?x.name+(i===0?' · host':'')+(i===NET.me?' · you':''):'Empty'}<small>${x?'Level '+x.lvl:''}</small></div>`; }).join('')}</div>
    <div class="sub" style="margin:0">${DIFFS[tier].n} · monster level ${a}–${b}${NET.seats.length>1?` · ${NET.seats.length} sellswords: foes have ${Math.round(60*(NET.seats.length-1))}% more life and there are more of them`:''}</div>
    ${NET.host?`<button class="btn" id="cpStart">Begin the descent (${NET.seats.length})</button>`:'<div class="sub" style="margin:0">Waiting for the host to begin…</div>'}
    <div class="cpmsg" id="cpMsg">${coopStatus}</div><button class="btn ghost" id="cpLeave">Leave</button></div>`;
  if($('#cpCopy')) $('#cpCopy').onclick=()=>{ try{ navigator.clipboard.writeText(NET.code); $('#cpCopy').textContent='Copied'; }catch(e){} };
  if($('#cpLink')) $('#cpLink').onclick=()=>{ const u=new URL(location.href); u.search=''; u.hash=''; u.searchParams.set('join',NET.code); if(QS.get('net')) u.searchParams.set('net',QS.get('net')); try{ navigator.clipboard.writeText(u.toString()); $('#cpLink').textContent='Copied'; }catch(e){} };
  if($('#cpStart')) $('#cpStart').onclick=hostStart; $('#cpLeave').onclick=()=>netLeave(); }
function cpMsg(t){ coopStatus=t; const m=$('#cpMsg'); if(m) m.textContent=t; }
function saveName(){ const n=($('#cpName')&&$('#cpName').value||'').replace(/[<>&"]/g,'').trim().slice(0,16); if(n) store.set('marrowdeep.coopname',n); return n||myName(); }
function newTransport(){ const h={open:id=>{},msg:(id,m)=>netRecv(id,m),drop:id=>netDrop(id)}; return QS.get('net')==='local'?new LocalTr(h):new PeerTr(h); }
function errText(e){ const t=e&&e.type; if(e&&e.message==='lib') return 'Couldn\'t load the networking library (are you online?)'; if(t==='peer-unavailable') return 'No game with that code.'; if(t==='unavailable-id') return 'That code is taken.';
  if(t==='browser-incompatible') return 'This browser can\'t do peer-to-peer.'; if(e&&e.message==='timeout') return 'No answer. A strict network on one side, or the host is gone.'; return 'Couldn\'t reach the matchmaking server'+(t?` (${t})`:'')+'.'; }
async function netHost(){ const name=saveName(); cpMsg('Opening a door…');
  for(let tries=0;tries<4;tries++){ const code=makeCode(); const tr=newTransport(); try{ await tr.host(code); NET.tr=tr; NET.code=code; break; } catch(e){ tr.close(); if(e&&e.type==='unavailable-id') continue; cpMsg(errText(e)); return; } }
  if(!NET.tr){ cpMsg('That code is taken.'); return; }
  Object.assign(NET,{conn:true,host:true,me:0,seats:[{s:0,name,lvl:P.lvl}],links:{}}); coopStatus=''; renderCoop(); }
async function netJoin(code){ if(code.length!==6){ cpMsg('An invite code is 6 letters and numbers.'); return; } const name=saveName(); cpMsg('Knocking…');
  const tr=newTransport(); try{ await tr.join(code); } catch(e){ tr.close(); cpMsg(errText(e)); return; }
  NET.tr=tr; NET.code=code; NET.host=false; NET.conn=true; toHost({t:'hello',v:NET_V,name,lvl:P.lvl});
  NET.helloT=setTimeout(()=>{ if(!NET.welcomed){ cpMsg('The host didn\'t answer.'); netLeave(true); } },8000); }
function hostStart(){ if(!NET.host||NET.running) return; const tier=META.pick||0; const m={t:'start',tier,n:NET.seats.length,seats:NET.seats.map(x=>({s:x.s,name:x.name,lvl:x.lvl}))}; bcast(m); coopStart(m); }
function netLeave(quiet){ if(NET.tr){ if(NET.host) bcast({t:'bye'}); else toHost({t:'bye'}); const tr=NET.tr; setTimeout(()=>tr.close(),150); }
  const was=NET.running, ending=NET.ending; clearTimeout(NET.helloT); netReset(); if(!quiet) coopStatus=''; coopScr.hidden=true;
  if(was&&ending){ /* everyone walks home through their own ending */ }
  else if(was){ ngp=META.pick||0; if(L&&L.def.kind!=='cabin'){ $('#case').hidden=true; caseState=null; hideCard(); $('#death').hidden=true; goCabin(); } else { mode='play'; hud.hidden=false; } }
  else if(!coopScr.hidden||mode==='coop'){ mode='play'; hud.hidden=false; } }
function netReset(){ Object.assign(NET,{conn:false,host:false,running:false,me:0,code:'',seats:[],tr:null,links:{},heroes:{},roll:null,chq:[],cc:null,debt:{},rdy:new Set(),going:false,betweenLevels:false,pendingLvl:null,welcomed:false,giveTo:null,downShown:false,tier:null,pend:[],ending:false,wiping:false});
  COOP=null; teamEl.hidden=true; tagsEl.hidden=true; tagsEl.innerHTML=''; bannerEl.hidden=true; }
function netEnd(why){ toast(why); const was=NET.running; netLeave(true); if(!was){ coopStatus=why; openCoop(); } }

/* ---------- messages in ---------- */
function netRecv(id,m){ if(!m||!m.t) return;
  if(NET.host){ if(m.t==='hello') return hostHello(id,m); const s=NET.links[id]; if(s==null) return; onMsg(s,m); }
  else onMsg(0,m); }
function hostHello(id,m){ const rej=why=>NET.tr.send(id,{t:'reject',why});
  if(m.v!==NET_V) return rej('Your copy of the game doesn\'t match the host\'s. Both of you reload the page.'); if(NET.running) return rej('That descent has already begun.'); if(NET.seats.length>=4) return rej('That descent is full.');
  let s=0; while(seatOf(s)) s++; let nm=(m.name||'Sellsword').replace(/[<>&"]/g,'').slice(0,16); const base=nm; let k=2; while(NET.seats.some(x=>x.name===nm)) nm=base+' '+(k++);
  NET.seats.push({s,name:nm,lvl:m.lvl|0}); NET.seats.sort((a,b)=>a.s-b.s); NET.links[id]=s; NET.tr.send(id,{t:'welcome',s,code:NET.code,tier:META.pick||0}); bcast({t:'lobby',seats:NET.seats,tier:META.pick||0}); renderCoop(); AU.tone('triangle',660,880,.15,.1,.3); }
function netDrop(id){ if(NET.host){ const s=NET.links[id]; if(s==null) return; delete NET.links[id]; const nm=nameOf(s); NET.seats=NET.seats.filter(x=>x.s!==s); delete NET.heroes[s];
    if(NET.running){ toast(`${nm} left the descent.`); bcast({t:'left',s}); if(NET.roll&&!NET.roll.resolved) rollCheck(); if(NET.betweenLevels) readyCheck(); } else { bcast({t:'lobby',seats:NET.seats,tier:META.pick||0}); renderCoop(); } }
  else if(NET.conn) netEnd(NET.running?'The host left. The descent is over.':'Lost the host.'); }
function onMsg(s,m){ const H=NET.host;
  switch(m.t){
  /* lobby */
  case 'welcome': NET.welcomed=true; clearTimeout(NET.helloT); NET.me=m.s; NET.tier=m.tier; coopStatus=''; renderCoop(); break;
  case 'reject': coopStatus=m.why; netLeave(true); openCoop(); break;
  case 'lobby': NET.seats=m.seats; NET.tier=m.tier; if(!NET.running) renderCoop(); break;
  case 'start': coopStart(m); break;
  case 'bye': if(H){ const id=idOfSeat(s); if(id) netDrop(id); } else netEnd(NET.running?'The host ended the descent.':'The host closed the door.'); break;
  case 'left': { const nm=nameOf(m.s); NET.seats=NET.seats.filter(x=>x.s!==m.s); delete NET.heroes[m.s]; if(NET.running) toast(`${nm} left the descent.`); break; }
  /* heroes */
  case 'st': if(H){ heroIn(s,m); } break;
  case 'hs': for(const st of m.a) if(st.s!==NET.me) heroIn(st.s,st); break;
  case 'eq': if(H) bcast(m,s); eqIn(m); break;
  /* the level */
  case 'lvl': if(!H) lvlIn(m); break;
  case 'sp': if(!H&&m.ep===NET.epoch) spawnIn(m.a); break;
  case 'sn': if(!H&&m.ep===NET.epoch) snapIn(m); break;
  case 'hit': if(H&&m.ep===NET.epoch) hitIn(s,m); break;
  case 'die': if(!H&&m.ep===NET.epoch) dieIn(m); break;
  case 'dr': if(!H&&m.ep===NET.epoch) dropsIn(m.a); break;
  case 'pj': if(H) bcast(m,s); if(m.ep===NET.epoch&&m.s!==NET.me) projIn(m.a); break;
  case 'pdrop': if(H){ const it=deItem(m.it); if(it) dropItem(it,m.x,m.y,true); } break;
  case 'take': if(H) takeIn(s,m.n); break;
  case 'gone': goneIn(m); break;
  case 'give': if(H&&m.to!==0){ sendSeat(m.to,m); break; } giftIn(m); break;
  case 'rev': if(H&&m.to!==0){ sendSeat(m.to,m); break; } reviveIn(m); break;
  case 'ar': if(!H&&m.ep===NET.epoch) arenaIn(m); break;
  case 'ca': if(!H&&m.ep===NET.epoch){ chests.push({x:m.x,y:m.y,tier:m.tier,open:false,t:0,falling:!!m.f,vy:0,floorY:m.fy}); NET.chestN=chests.length; } break;
  case 'bint': if(!H&&m.ep===NET.epoch){ const b=enemies.find(e=>e.boss&&e.intro); if(b){ closeMenus(); bossIntro(b); } } break;
  case 'exit': if(H) hostFinish(); break;
  case 'fin': if(!H) coopFin(m.idx); break;
  case 'rdy': if(H){ NET.rdy.add(s); readyCheck(); } break;
  case 'wipe': if(!H) wipeIn(); break;
  /* chests */
  case 'copen': if(H) hostChest(m.ci,s,m.mf|0); break;
  case 'chest': if(!H){ const it=deItem(m.it); if(it) showCoopChest(m,it); } break;
  case 'need': if(H) rollAnswer(s,m.rid,!!m.y); break;
  case 'roll': if(!H) rollIn(m); break;
  case 'sroll': if(!H&&typeof showSecretRoll==='function') showSecretRoll(!!m.hit,null); break;
  } }

/* ---------- starting, levels ---------- */
function coopStart(m){ NET.running=true; COOP=NET; NET.n=Math.max(1,m.n|0); NET.tier=m.tier; NET.seats=m.seats; NET.debt={}; NET.heroes={}; NET.betweenLevels=true; NET.epoch=0;
  for(const x of m.seats) if(x.s!==NET.me) NET.heroes[x.s]=mkHero(x);
  coopScr.hidden=true; closeMenus(); ngp=m.tier; if(!P.equip.weapon){ P.equip.weapon=mkBase('Rusted Falchion'); calcStats(); }
  P.life=P.stats.life; P.potions=Math.max(P.potions,2); P.dead=false; updBelt(); NET.eqKey=''; teamEl.hidden=false; tagsEl.hidden=false;
  toast(`Together · ${m.seats.map(x=>x.name).join(', ')}`);
  if(NET.host){ META.runs++; NET.going=true; goLevel(1); }
  else { mode='card'; hud.hidden=true; showCard({title:'The descent',jp:'下降',body:'The rope creaks under more than one of you.'}); } }
function mkHero(x){ const p=newPlayer(); p.lvl=x.lvl||1; const sv=P; P=p; calcStats(); P=sv; p.life=p.stats.life; return {s:x.s,name:x.name,p,st:null,rt:-9,rev:0,revCd:0,seenT:-9}; }
/* every level load: the host numbers the enemies, makes them tougher for a crowd, and sends the list */
(function(){ const o=loadLevel; loadLevel=function(idx,opt){
  if(COOP&&LEVELS[idx]&&LEVELS[idx].kind==='cabin'){ const r=o(idx,opt); setTimeout(()=>{ if(COOP) netLeave(true); },0); return r; }
  const r=o(idx,opt); if(!COOP) return r;
  NET.betweenLevels=false; NET.going=false; NET.wipeT=0; NET.downShown=false; bannerEl.hidden=true; NET.arSt=L.arenas?L.arenas.map(a=>[a.state,a.wave]):[];
  const off=(NET.me%2?1:-1)*Math.ceil(NET.me/2)*12; P.x=L.spawn.x+off; P.safe={x:P.x,y:P.y};
  for(const h of Object.values(NET.heroes)){ h.st=null; h.rev=0; }
  if(NET.host){ NET.epoch++; const n=NET.n; if(n>1) scaleForCrowd(n);
    for(const e of enemies) e.nid=++NET.nid; for(const d of drops) d.nid=++NET.dnid; NET.chestN=chests.length;
    bcast({t:'lvl',ep:NET.epoch,idx,ngp,wipe:NET.wipeFlag?1:0,sec:(typeof SECRET!=='undefined'&&SECRET.on&&SECRET.from===idx)?1:0,a:enemies.map(espec),d:drops.map(dspec)}); NET.wipeFlag=false; NET.roll=null; NET.chq=[]; }
  else if(NET.pendingLvl){ const m=NET.pendingLvl; NET.pendingLvl=null; NET.epoch=m.ep; const boss=enemies.find(e=>e.boss); enemies=[]; spawnIn(m.a,boss); drops=[]; dropsIn(m.d||[]); NET.chestN=chests.length; NET.pend=[]; }
  return r; }; })();
function scaleForCrowd(n){ const hp=1+.6*(n-1), dm=1+.08*(n-1), add=[];
  for(const e of enemies){ if(e.boss){ e.hp=e.maxhp=Math.round(e.maxhp*(1+.75*(n-1))); e.dmg*=dm; continue; } e.hp=e.maxhp=e.maxhp*hp; e.dmg*=dm;
    if(['anchor','relicx','debtor','hanged'].includes(e.type)||e.ceil||e.unique) continue; if(R()<.3*(n-1)){ const c=mkEnemyAt(e.type,e.x+rnd(-14,14),e.y); c.hp=c.maxhp=c.maxhp*hp; c.dmg*=dm; c.hy=c.y; add.push(c); } }
  for(const c of add) enemies.push(c); }
(function(){ const o=spawnWave; spawnWave=function(a){ const n0=enemies.length; o(a); if(!COOP||!NET.host||NET.n<2) return; const n=NET.n, made=enemies.slice(n0).filter(e=>!e.boss);
  for(const e of made){ e.hp=e.maxhp=e.maxhp*(1+.6*(n-1)); e.dmg*=1+.08*(n-1); }
  for(let i=0;i<(n-1)*2&&made.length;i++){ const s=pick(made); const c=mkEnemyAt(s.type,s.x+rnd(-20,20),s.y); c.hp=c.maxhp=c.maxhp*(1+.6*(n-1)); c.dmg*=1+.08*(n-1); c.atkCd=1+R(); c.hy=c.y; a.list.push(c); enemies.push(c); } }; })();
function espec(e){ const o={}; for(const k in e){ const v=e[k], ty=typeof v; if(k==='_b'||k==='_tg'||k==='hitId') continue;
    if(ty==='number') o[k]=Math.round(v*100)/100; else if(ty==='string'||ty==='boolean') o[k]=v; else if(Array.isArray(v)&&v.every(x=>typeof x!=='object')) o[k]=v.slice(); else if(k==='res'&&v) o[k]=Object.assign({},v); }
  return o; }
function spawnIn(list,boss){ const have=new Set(enemies.map(e=>e.nid));
  for(const sp of list){ if(have.has(sp.nid)) continue; if(sp.boss){ const b=boss||enemies.find(e=>e.boss&&!e.nid); if(b){ b.nid=sp.nid; b.hp=sp.hp; b.maxhp=sp.maxhp; if(!enemies.includes(b)) enemies.push(b); } continue; }
    const e=Object.assign({},sp); if(sp.mods) e.mods=sp.mods.slice(); if(sp.elems) e.elems=sp.elems.slice(); if(sp.res) e.res=Object.assign({},sp.res); e.hitId=-1; e.sts=null; e._b=e.hp; enemies.push(e); } }
function lvlIn(m){ closeMenus(); if(!mapScr.hidden){ cancelAnimationFrame(mapAnim); mapScr.hidden=true; } $('#death').hidden=true; hideCard();
  ngp=m.ngp; NET.pendingLvl=m; if(typeof SECRET!=='undefined'){ SECRET.on=!!m.sec; SECRET.from=m.idx; } goLevel(m.idx); if(m.wipe){ P.dead=false; P.deadT=0; P.life=P.stats.life; P.inv=2; } }
/* close any menu so a shared moment (a chest, a boss, a new level) can take the screen */
function closeMenus(){ if(mode==='inv') toggleInv(false); if(mode==='pause') closePause(); if(!$('#card').hidden&&mode==='card'){ hideCard(); mode='play'; } if(!stashScr.hidden){ stashScr.hidden=true; mode='play'; } hideTip(); if(mode==='map'&&!mapScr.hidden){ cancelAnimationFrame(mapAnim); mapScr.hidden=true; mode='play'; } }

/* ---------- heroes: send mine, draw theirs ---------- */
function heroSt(){ const p=P, a=p.attack; return {s:NET.me,ep:NET.epoch,x:+p.x.toFixed(1),y:+p.y.toFixed(1),vx:Math.round(p.vx),vy:Math.round(p.vy),f:p.face,g:p.onGround?1:0,sa:+p.swordA.toFixed(2),oa:+p.offA.toFixed(2),
  at:a?[a.name,a.hand,+a.t.toFixed(3),+a.dur.toFixed(3),+(a.aimA||0).toFixed(2),a.id]:0,da:p.dash>0?1:0,hu:p.hurtT>0?+p.hurtT.toFixed(2):0,de:p.dead?1:0,lf:Math.max(0,Math.ceil(p.life)),ml:p.stats.life,
  rp:+p.runPh.toFixed(2),sy:+p.sy.toFixed(2),bl:p.block?1:0,wl:p.wallT>0?1:0,cl:+p.cloak.toFixed(1),gh:p.ghostT>0?1:0,hd:p.houndT>0?1:0,lv:p.lvl}; }
function heroIn(s,st){ let h=NET.heroes[s]; if(!h){ const x=seatOf(s); if(!x) return; h=NET.heroes[s]=mkHero(x); } const p=h.p, fresh=!h.st||h.st.ep!==st.ep;
  h.st=st; h.rt=time; h.seenT=time; if(fresh){ p.x=st.x; p.y=st.y; }
  p.face=st.f; p.onGround=!!st.g; p.vx=st.vx; p.vy=st.vy; p.dash=st.da?.1:0; p.hurtT=st.hu; if(st.de&&!p.dead) p.deadT=0; p.dead=!!st.de; p.life=st.lf; p.block=!!st.bl; p.wallT=st.wl?.1:0; p.cloak=st.cl; p.ghostT=st.gh?1:0; p.houndT=st.hd?1:0; p.sy=st.sy; p.runPh=st.rp; p.lvl=st.lv||p.lvl; p.inv=0;
  if(st.at){ const at=st.at; if(!p.attack||p.attack.id!==at[5]){ const mv=MV[at[0]]; p.attack=mv?{mv,name:at[0],hand:at[1],t:at[2],dur:at[3],aimA:at[4],id:at[5],prev:[]}:null; } else if(Math.abs(p.attack.t-at[2])>.08) p.attack.t=at[2]; }
  else p.attack=null;
  if(!p.attack){ h.sa=st.sa; h.oa=st.oa; }
  const x=seatOf(s); if(x) x.lvl=p.lvl; }
function eqIn(m){ const h=NET.heroes[m.s]; if(!h||m.s===NET.me) return; const p=h.p; for(const k in p.equip) p.equip[k]=m.eq[k]?deItem(m.eq[k]):null; p.skills=new Set(m.sk||[]); p.lvl=m.lvl||p.lvl; const sv=P; P=p; try{ calcStats(); } finally{ P=sv; } }
function heroLive(h){ return h&&h.st&&h.st.ep===NET.epoch&&time-h.seenT<3; }
function tickHeroes(dt){ for(const h of Object.values(NET.heroes)){ if(!heroLive(h)) continue; const p=h.p, st=h.st; const age=Math.min(.12,time-h.rt);
    const tx=st.x+st.vx*age, ty=st.y+(st.g?0:st.vy*age); const far=Math.abs(tx-p.x)>90||Math.abs(ty-p.y)>90; p.x=far?tx:lerp(p.x,tx,Math.min(1,dt*16)); p.y=far?ty:lerp(p.y,ty,Math.min(1,dt*16));
    if(p.dead) p.deadT+=dt; if(p.hurtT>0) p.hurtT-=dt;
    if(p.attack){ const a=p.attack; a.t=Math.min(a.dur,a.t+dt); const ang=moveAngle(a); if(a.hand==='off'){ a.prev.push(p.offA); p.offA=ang; } else { a.prev.push(p.swordA); p.swordA=ang; } if(a.prev.length>5) a.prev.shift(); }
    else { p.swordA=lerp(p.swordA,h.sa??p.swordA,Math.min(1,dt*14)); p.offA=lerp(p.offA,h.oa??p.offA,Math.min(1,dt*12)); if(st.g&&Math.abs(p.vx)>12) p.runPh+=dt*Math.abs(p.vx)*.11; } } }
(function(){ const o=drawHeroAndFX; drawHeroAndFX=function(){ if(COOP){ const sv=P, gs=ghosts; ghosts=[]; NET.swapped=true; NET.lp=sv;
    try{ for(const h of Object.values(NET.heroes)){ if(!heroLive(h)) continue; P=h.p; o(); } } finally{ P=sv; ghosts=gs; NET.swapped=false; } }
  o(); }; })();
/* enemies go for the nearest living hero; only the hero on this machine can actually be hurt here */
function nearestHero(e){ let best=P&&!P.dead?P:null, bd=best?Math.abs(P.x-e.x)+Math.abs(P.y-e.y)*1.5:1e9;
  for(const h of Object.values(NET.heroes)){ if(!heroLive(h)||h.p.dead) continue; const d=Math.abs(h.p.x-e.x)+Math.abs(h.p.y-e.y)*1.5-(e._tg===h.s?30:0); if(d<bd){ bd=d; best=h.p; } }
  if(best===P) e._tg=-1; else for(const h of Object.values(NET.heroes)) if(h.p===best) e._tg=h.s; return best||P; }
(function(){ const o=updEnemy; updEnemy=function(e,dt){ if(!COOP||e.dead) return o(e,dt); const t=nearestHero(e); if(t===P) return o(e,dt);
  const sv=P; P=t; NET.swapped=true; NET.lp=sv; try{ o(e,dt); } finally{ P=sv; NET.swapped=false; } }; })();
(function(){ const o=hurtPlayer; hurtPlayer=function(d,src){ if(COOP&&NET.swapped) return; return o(d,src); }; })();
(function(){ const o=gainXP; gainXP=function(n){ if(COOP&&NET.swapped){ const r=P; P=NET.lp; try{ o(n); } finally{ P=r; } return; } return o(n); }; })();

/* ---------- damage and deaths ---------- */
(function(){ const o=killEnemy; killEnemy=function(e,dir,crit){ if(COOP&&!NET.host&&!NET.applying) return; if(COOP&&NET.host&&!e.dead){ e._k=1; e._kd=dir||1; e._kc=!!crit; } return o(e,dir,crit); }; })();
function byNid(){ const m=new Map(); for(const e of enemies) if(e.nid) m.set(e.nid,e); return m; }
function guestScan(){ const hits=[]; for(const e of enemies){ if(!e.nid||e.dead) continue; if(e._b==null){ e._b=e.hp; continue; }
    if(e.hp<e._b-1e-6){ const d=e._b-e.hp, lh=e.lastHit||{}; hits.push([e.nid,+d.toFixed(2),lh.cls||null,lh.el||null,Math.sign(e.x-P.x)||1]); } e._b=e.hp; }
  if(!hits.length) return; const q=++NET.seq; for(const h of hits) NET.pend.push({q,n:h[0],d:h[1]}); toHost({t:'hit',ep:NET.epoch,q,h:hits}); }
function hitIn(s,m){ const map=byNid(); for(const [n,d,cls,el,dir] of m.h){ const e=map.get(n); if(!e||e.dead||e.intro) continue;
    e.lastHit={cls,el,t:time,heavy:false}; e.hp-=d; e.flash=.1; num(e.x+rnd(-4,4),e.y-e.h-4,Math.max(1,Math.round(d)),SEAT_C[s]||'#c9b8a8'); if(R()<.5) bleed(e.x,e.y-e.h*.55,3,dir,.8);
    if(e.boss&&typeof bossStagAdd==='function') bossStagAdd(e,d,false,false); if(e.hp<=0) killEnemy(e,dir,false); }
  NET.ack[s]=Math.max(NET.ack[s]||0,m.q); }
function dieIn(m){ const e=byNid().get(m.n); if(!e||e.dead) return; NET.applying=true;
  try{ if(m.k){ if(m.lh) e.lastHit=Object.assign({t:time},m.lh); e.hp=Math.min(e.hp,0); killEnemy(e,m.r||1,!!m.c); } else { e.dead=true; e.deadT=2.2; if(!e.escaped) ash(e.x,e.y-e.h/2,10); } }
  finally{ NET.applying=false; } for(const x of enemies) x._b=x.hp; }
function snapIn(m){ NET.pend=NET.pend.filter(p=>p.q>m.ak); const ps={}; for(const p of NET.pend) ps[p.n]=(ps[p.n]||0)+p.d; const map=byNid();
  for(const [n,x,y,vx,vy,f,hp] of m.e){ const e=map.get(n); if(!e||e.dead) continue; const disp=hp-(ps[n]||0);
    if(disp<e.hp-.5){ e.flash=.1; if(R()<.4) bleed(e.x,e.y-e.h*.55,3,R()<.5?1:-1,.7); } e.hp=disp; e._b=e.hp;
    if(e.boss&&e.intro) continue; const dx=x-e.x, dy=y-e.y; if(Math.abs(dx)>56||Math.abs(dy)>56){ e.x=x; e.y=y; } else { e.x+=dx*.3; e.y+=dy*.3; }
    e.vx=vx; if(e.fly) e.vy=vy; e.face=f; } }
function snapFor(s){ const h=NET.heroes[s]; const hx=h&&h.st?h.p.x:null, hy=h&&h.st?h.p.y:null; const out=[];
  for(const e of enemies){ if(e.dead||!e.nid) continue; if(hx!=null&&(Math.abs(e.x-hx)>W*1.4||Math.abs(e.y-hy)>H*1.6)) continue;
    out.push([e.nid,Math.round(e.x*10)/10,Math.round(e.y*10)/10,Math.round(e.vx),Math.round(e.vy),e.face,Math.round(e.hp*10)/10]); }
  return {t:'sn',ep:NET.epoch,ak:NET.ack[s]||0,e:out}; }

/* ---------- drops, items, projectiles ---------- */
function dspec(d){ return {n:d.nid,k:d.kind,x:+d.x.toFixed(1),y:+d.y.toFixed(1),vx:Math.round(d.vx||0),vy:Math.round(d.vy||0),nn:d.n,big:d.big?1:0,it:d.item?serItem(d.item):undefined}; }
function dropsIn(a){ const have=new Set(drops.map(d=>d.nid)); for(const o of a){ if(have.has(o.n)) continue; const d={kind:o.k,x:o.x,y:o.y,vx:o.vx,vy:o.vy,n:o.nn,big:!!o.big,nid:o.n}; if(o.it){ d.item=deItem(o.it); if(!d.item) continue; } drops.push(d);
    if(d.item&&mode==='play'&&typeof dropRoll==='function') dropRoll(d.item,d.x,d.y); } }
(function(){ const o=dropItem; dropItem=function(it,x,y,quiet){ if(COOP&&!NET.host){ if(NET.applying) return; toHost({t:'pdrop',it:serItem(it),x,y}); return; } return o(it,x,y,quiet); }; })();
(function(){ const o=dropGold; dropGold=function(x,y,n){ if(COOP&&!NET.host) return; return o(x,y,n); }; })();
(function(){ const o=takeDrop; takeDrop=function(d){ if(!COOP||!d.nid) return o(d); if(P.bag.length>=24){ bark('meh'); return; }
  if(NET.host){ o(d); bcast({t:'gone',n:d.nid,by:0}); return; } if(d._pend&&time-d._pend<1.2) return; d._pend=time; toHost({t:'take',n:d.nid}); }; })();
function takeIn(s,n){ const d=drops.find(x=>x.nid===n&&!x.gone); if(!d) return; d.gone=true; drops=drops.filter(x=>!x.gone); bcast({t:'gone',n,by:s}); }
function goneIn(m){ const d=drops.find(x=>x.nid===m.n); if(!d) return; drops=drops.filter(x=>x!==d); if(m.by===NET.me&&!NET.host&&d.item){ if(P.bag.length<24){ P.bag.push(d.item); AU.coin(); noteBest(d.item); if(d.item.rarity>=4) bark('unique',true); } else dropItem(d.item,P.x,P.y-10,true); } }
function projIn(a){ for(const [type,x,y,vx,vy,g,r,life] of a) projs.push({type,from:'v',x,y,vx,vy,g,r,life,hits:new Set()}); }

/* ---------- trading: give an item straight to someone ---------- */
(function(){ const o=renderInv; renderInv=function(){ o(); if(!COOP) return; const pane=$('#paneBag'); if(!pane) return; let bar=pane.querySelector('.coopTrade'); if(!bar){ bar=document.createElement('div'); bar.className='coopTrade'; pane.appendChild(bar); }
  const others=NET.seats.filter(x=>x.s!==NET.me); bar.innerHTML=others.length?`Give to: ${others.map(x=>`<button class="btn ghost${NET.giveTo===x.s?' on':''}" style="--sc:${SEAT_C[x.s]}" data-s="${x.s}">${x.name}</button>`).join('')}<span>${NET.giveTo!=null?'· click an item to hand it over':'· or shift-click an item to drop it'}</span>`:'';
  bar.querySelectorAll('.btn').forEach(b=>b.onclick=()=>{ const s=+b.dataset.s; NET.giveTo=NET.giveTo===s?null:s; renderInv(); }); }; })();
(function(){ const o=equipFromBag; equipFromBag=function(i,wantOff){ if(COOP&&NET.giveTo!=null&&seatOf(NET.giveTo)){ const it=P.bag.splice(i,1)[0]; if(!it) return; const m={t:'give',to:NET.giveTo,from:NET.me,it:serItem(it)};
    if(NET.host){ if(m.to===0) giftIn(m); else sendSeat(m.to,m); } else toHost(m); hideTip(); AU.coin(); invMsg(`Given to ${nameOf(NET.giveTo)}: ${it.name}`); renderInv(); return; } return o(i,wantOff); }; })();
function giftIn(m){ const it=deItem(m.it); if(!it) return; if(P.bag.length<24){ P.bag.push(it); noteBest(it); } else dropItem(it,P.x,P.y-10,true); AU.coin(); toast(`${nameOf(m.from)} gave you ${it.name}.`); if(mode==='inv') renderInv(); }

/* ---------- down, revive, wipe ---------- */
(function(){ const o=onDeath; onDeath=function(){ if(!COOP) return o(); if(!NET.downShown){ NET.downShown=true; bannerEl.innerHTML='You\'re down<small>A teammate can stand over you to bring you back</small>'; bannerEl.hidden=false; AU.setTension(.3); } }; })();
function reviveIn(m){ if(!P.dead) return; P.dead=false; P.deadT=0; P.life=Math.round(P.stats.life*.4); P.inv=2; P.vx=P.vy=0; NET.downShown=false; bannerEl.hidden=true; AU.lvl(); sparks(P.x,P.y-14,16,'#cfe0ff'); toast(`${nameOf(m.from)} pulled you back up.`); }
function tickRevive(dt){ for(const h of Object.values(NET.heroes)){ if(!heroLive(h)||!h.p.dead){ h.rev=0; continue; } h.revCd-=dt;
    const close=P&&!P.dead&&Math.abs(P.x-h.p.x)<26&&Math.abs(P.y-h.p.y)<30; h.rev=close?h.rev+dt:Math.max(0,h.rev-dt*2);
    if(h.rev>=2.4&&h.revCd<=0){ h.rev=0; h.revCd=3; const m={t:'rev',to:h.s,from:NET.me}; if(NET.host) sendSeat(h.s,m); else toHost(m); toast(`You pull ${h.name} back up.`); AU.lvl(); } } }
function wipeCheck(dt){ const all=[P].concat(Object.values(NET.heroes).filter(heroLive).map(h=>h.p)); const down=all.every(p=>p.dead);
  NET.wipeT=down?NET.wipeT+dt:0; if(NET.wipeT>2.6&&!NET.wiping){ NET.wiping=true; bcast({t:'wipe'}); wipeIn(); setTimeout(()=>{ NET.wiping=false; if(!COOP) return; NET.wipeFlag=true; P.dead=false; P.deadT=0; P.life=P.stats.life; P.inv=2; $('#death').hidden=true; goLevel(lvlIdx); },3200); } }
function wipeIn(){ closeMenus(); bannerEl.hidden=true; const el=$('#death'); el.hidden=false; const dl=pick(DEATH_LINES); $('#death .shi').textContent=dl.k; $('#deathLine').textContent='The Pit takes all of you.'; $('#deathSub').textContent=`Back to the start of ${LEVELS[lvlIdx].name}, together.`; mode='death'; hud.hidden=true; if(typeof MUS!=='undefined') MUS.setMood('silent'); }
(function(){ const o=respawn; respawn=function(){ if(COOP) return; return o(); }; })();

/* ---------- arenas, the last chamber, bosses: the host's call ---------- */
(function(){ const o=updArenas; updArenas=function(dt){ if(!COOP) return o(dt); if(!NET.host) return;
  let trig=null; if(L.arenas) for(const a of L.arenas){ if(a.state!==0) continue; const inA=p=>!p.dead&&p.x>a.x0+4*T&&p.x<a.x1-4*T&&p.y>a.y0&&p.y<a.y1; if(inA(P)){ trig=null; break; } for(const h of Object.values(NET.heroes)) if(heroLive(h)&&inA(h.p)) trig=trig||h.p; }
  if(trig){ const sv=P; P=trig; NET.swapped=true; NET.lp=sv; try{ o(dt); } finally{ P=sv; NET.swapped=false; } } else o(dt);
  if(!L.arenas) return; L.arenas.forEach((a,i)=>{ const pv=NET.arSt[i]||[0,0]; if(pv[0]!==a.state||pv[1]!==a.wave){ NET.arSt[i]=[a.state,a.wave]; bcast({t:'ar',ep:NET.epoch,i,st:a.state,w:a.wave,ws:a.waves}); } }); }; })();
function arenaIn(m){ const a=L.arenas&&L.arenas[m.i]; if(!a) return;
  if(m.st>=1&&a.state===0){ setDoors(a,1); AU.chain(); AU.slam(); shake(6); cutIn('hero',a.final?'The last chamber':'Blood Arena',a.final?'最後の間':'血の闘技場',1.3); if(typeof MUS!=='undefined') MUS.setMood('boss'); }
  if(m.w>a.wave&&m.st===1){ AU.roar(); shake(4); showBossName(a.final?`The last chamber · wave ${m.w} of ${m.ws}`:`Wave ${m.w} of ${m.ws}`,['一','二','三','四'][m.w-1]||'',m.w===m.ws?'The last of them.':''); }
  if(m.st===2&&a.state!==2){ setDoors(a,0); AU.door(); AU.bell(); gainXP(40*(1+lvlIdx)); if(a.final){ L.locked=false; toast('The last chamber falls silent. The way up opens.'); } else toast('The arena falls silent. Something drops from the dark.'); if(typeof MUS!=='undefined') MUS.setMood(moodFor(L.def)); }
  a.state=m.st; a.wave=m.w; a.waves=m.ws; }
bossIntroReady=function(b){ if(!COOP) return P.x>9*T; if(!NET.host) return false; const go=P.x>9*T||Object.values(NET.heroes).some(h=>heroLive(h)&&h.p.x>9*T); if(go) bcast({t:'bint',ep:NET.epoch}); return go; };

/* ---------- leaving a level: everyone reads their letter, then the host climbs on ---------- */
(function(){ const o=finishLevel; finishLevel=function(){ if(!COOP||(L&&L.def.kind==='cabin')) return o(); if(NET.host) hostFinish(); else { toHost({t:'exit'}); toast('The others will follow you up.'); } }; })();
function hostFinish(){ if(NET.betweenLevels||L.locked||L.noExit) return; bcast({t:'fin',idx:lvlIdx}); NET.rdy=new Set(); coopFin(lvlIdx); }
function coopFin(idx){ closeMenus(); NET.betweenLevels=true; const def=LEVELS[idx]; if(def.id==='count'){ AU.door(); toast('The war is over. Each of you goes home.'); NET.ending=true; setTimeout(()=>{ if(COOP){ const was=NET.host; playEnding(); } },400); return; }
  AU.door(); mode='card'; merchantCard(()=>{ hideCard(); coopReady(); }); }
function coopReady(){ showCard({title:'Climb on',jp:'登れ',body:NET.host?'Waiting for the others to finish with the merchant…':'Waiting for the host to climb on…',buttons:NET.host?[{label:'Go on without them',fn:()=>hostGo()}]:[]});
  if(NET.host){ NET.rdy.add(0); readyCheck(); } else toHost({t:'rdy'}); }
function readyCheck(){ if(!NET.host||!NET.betweenLevels) return; if(NET.seats.every(x=>NET.rdy.has(x.s))) hostGo(); }
function hostGo(){ if(NET.going) return; NET.going=true; hideCard(); nextLevel();
  /* the map plays for the host; nobody should wait on the host's click, so it climbs on by itself */
  if(mode==='map') setTimeout(()=>{ if(COOP&&mode==='map'&&!mapScr.hidden&&mapScr._close) mapScr._close(); },2600); }

/* ---------- shared chests: watch, roll for it or pass, fate decides ---------- */
(function(){ const o=openChest; openChest=function(c){ if(!COOP||NET.seats.length<2) return o(c); const ci=chests.indexOf(c);
  if(NET.host) hostChest(ci,0,P.stats.mf); else { if(c._pend&&time-c._pend<2) return; c._pend=time; toHost({t:'copen',ci,mf:P.stats.mf}); } }; })();
function hostChest(ci,s,mf){ const c=chests[ci]; if(!c||c.open) return; if(NET.roll){ if(!NET.chq.some(q=>q[0]===ci)) NET.chq.push([ci,s,mf]); return; }
  c.open=true; c.t=0; dropGold(c.x,c.y-14,Math.round(ri(4,12)*(1+lvlIdx*.6)*(c.tier?2:1)*(c.tier===2?3:1)*(1+P.stats.gf/100)));
  const ilvl=ilvlNow()+(c.tier?2:0)+(c.tier===2?2:0)+ri(0,2); const win=genItem(ilvl,CW[c.tier],mf); const rid=(NET.rid=(NET.rid||0)+1);
  NET.roll={rid,ci,win,ans:{},t0:performance.now(),readyAt:0,resolved:false}; const m={t:'chest',rid,ci,tier:c.tier,ilvl,it:serItem(win),by:s,debt:NET.debt};
  bcast(m); showCoopChest(m,win); }
function showCoopChest(m,win){ closeMenus(); const c=chests[m.ci]; if(c){ c.open=true; c.t=0; for(let i=0;i<14;i++) part({x:c.x+rnd(-6,6),y:c.y-12,vx:rnd(-40,40),vy:rnd(-120,-40),g:200,life:rnd(.4,.9),em:true,col:pick(['#ffe1a0','#ffd06a','#fff'])}); }
  AU.chest(); shake(2); NET.cc={rid:m.rid,win,choice:null,t0:0,by:m.by,debt:m.debt||{}}; mode='case'; hud.hidden=true;
  if(m.by!==NET.me) toast(`${nameOf(m.by)} opens a chest. Everyone watches.`);
  setTimeout(()=>playChestCine(m.tier,win.rarity,()=>showCase(m.tier,m.ilvl,win,()=>{})),280); }
(function(){ const o=land; land=function(){ o(); const cc=NET.cc; if(!cc) return; const rb=$('#rbtns'); if(!rb) return;
  const ds=cc.debt||{}, w=s=>1/(1+(ds[s]||0)), tot=NET.seats.reduce((a,x)=>a+w(x.s),0), mine=tot?w(NET.me)/tot*100:100;
  rb.innerHTML=`<div class="need"><div class="row"><button class="btn" id="takeBtn">Roll for it <kbd>E</kbd></button><button class="btn ghost" id="leaveBtn">Pass <kbd>Q</kbd></button></div>
    <div class="ntimer"><i id="nBar"></i></div><div class="nodds" id="nOdds"><b id="nSec">3</b>s to choose · if everyone rolls, your odds are ${mine.toFixed(0)}% · fate debt ${(ds[NET.me]||0).toFixed(1)}</div></div>`;
  $('#takeBtn').onclick=()=>coopNeed(true); $('#leaveBtn').onclick=()=>coopNeed(false); }; })();
(function(){ const o=closeCase; closeCase=function(take){ const cc=NET.cc; if(cc){ if(caseState&&caseState.ready) coopNeed(take!==false); return; } return o(take); }; })();
addEventListener('keydown',ev=>{ if(mode==='case'&&NET.cc&&caseState&&caseState.ready&&(ev.key==='q'||ev.key==='Q')){ ev.preventDefault(); coopNeed(false); } });
function coopNeed(yes){ const cc=NET.cc; if(!cc||cc.choice!=null) return; cc.choice=yes; const rb=$('#rbtns'); if(rb) rb.innerHTML=`<div class="need"><div class="nq">${yes?'You roll for it.':'You pass.'}</div><div class="nodds">Waiting for the others…</div></div>`;
  AU.tone('triangle',yes?520:300,yes?780:220,.12,.1,.2); if(NET.host) rollAnswer(0,cc.rid,yes); else toHost({t:'need',rid:cc.rid,y:yes?1:0}); }
function tickNeed(){ const cc=NET.cc; if(!cc) return; if(!cc.t0&&caseState&&caseState.ready){ cc.t0=performance.now(); if(NET.host&&NET.roll) NET.roll.readyAt=cc.t0; }
  if(cc.t0&&cc.choice==null){ const k=(performance.now()-cc.t0)/3000; const b=$('#nBar'); if(b) b.style.width=(clamp(1-k,0,1)*100).toFixed(1)+'%'; const sc=$('#nSec'); if(sc) sc.textContent=Math.max(0,Math.ceil(3-k*3)); if(k>=1) coopNeed(false); } }
function rollAnswer(s,rid,yes){ const r=NET.roll; if(!r||r.rid!==rid||r.resolved) return; r.ans[s]=yes; rollCheck(); }
function rollCheck(){ const r=NET.roll; if(!r||r.resolved) return; if(NET.seats.every(x=>x.s in r.ans)) rollResolve(); }
function tickRoll(){ const r=NET.roll; if(!r||r.resolved) return; const now=performance.now(); if((r.readyAt&&now-r.readyAt>4800)||now-r.t0>32000) rollResolve(); }
function rollResolve(){ const r=NET.roll; r.resolved=true; const yes=NET.seats.map(x=>x.s).filter(s=>r.ans[s]); const ser=serItem(r.win); let m;
  if(!yes.length){ const c=chests[r.ci]; if(c) dropItem(r.win,c.x,c.y-12,true); m={t:'roll',rid:r.rid,none:1,it:ser}; }
  else { const ws=yes.map(s=>1/(1+(NET.debt[s]||0))), tot=ws.reduce((a,b)=>a+b,0); let x=R()*tot, win=yes[yes.length-1]; for(let i=0;i<yes.length;i++){ x-=ws[i]; if(x<=0){ win=yes[i]; break; } }
    const rar=r.win.rarity; NET.debt[win]=(NET.debt[win]||0)+(yes.length>1?DEBT_WIN[rar]:DEBT_SOLO[rar]); if(yes.length>1) for(const s of yes) if(s!==win) NET.debt[s]=Math.max(0,(NET.debt[s]||0)-.25);
    m={t:'roll',rid:r.rid,cands:yes.map((s,i)=>[s,+(ws[i]/tot*100).toFixed(1)]),win,it:ser,debt:NET.debt}; }
  bcast(m); rollIn(m); setTimeout(()=>{ NET.roll=null; const q=NET.chq.shift(); if(q) hostChest(q[0],q[1],q[2]); },5400); }
function rollIn(m){ const cc=NET.cc; const it=cc&&cc.rid===m.rid?cc.win:deItem(m.it);
  if(!cc||cc.rid!==m.rid||$('#case').hidden){ if(m.win===NET.me&&it){ if(P.bag.length<24) P.bag.push(it); else dropItem(it,P.x,P.y-10,true); toast(`You won ${it.name}.`); } return; }
  if(reveal) reveal.finish(); const res=$('#result'); const box=document.createElement('div'); box.className='rollv';
  if(m.none){ box.innerHTML=`<div class="rh">Nobody rolled for it.</div><div class="rwin" style="color:#9a8a7a">It lies by the chest for whoever wants it.</div>`; res.innerHTML=''; res.appendChild(box); setTimeout(()=>finishCoopCase(m,it),1900); return; }
  box.innerHTML=`<div class="rh">Fate decides</div><div class="reel"><div class="strip" id="rstrip"></div><div class="marker"></div></div><div class="nodds">${m.cands.map(([s,p])=>`<span style="color:${SEAT_C[s]}">${nameOf(s)} ${p}%</span>`).join(' · ')}</div><div class="rwin" id="rwin"></div>`;
  res.innerHTML=''; res.appendChild(box); const strip=$('#rstrip'), N=44, WI=36; const cards=[];
  const pickC=()=>{ let x=Math.random()*100; for(const [s,p] of m.cands){ x-=p; if(x<=0) return s; } return m.cands[0][0]; };
  for(let i=0;i<N;i++){ let s=i===WI?m.win:pickC(); if(Math.abs(i-WI)===1&&m.cands.length>1) while(s===m.win) s=pick(m.cands)[0];
    const d=document.createElement('div'); d.className='card'; d.style.setProperty('--rc',SEAT_C[s]); d.style.setProperty('--rg',SEAT_C[s]+'55'); d.innerHTML=`<div class="n" style="color:${SEAT_C[s]}">${nameOf(s)}</div>`; strip.appendChild(d); cards.push(d); }
  const reelW=strip.parentElement.clientWidth, cw=cards[1].offsetLeft-cards[0].offsetLeft, cardW=cards[0].offsetWidth; const x0=Math.max(0,2*cw-reelW/2), target=WI*cw+rnd(.15,.85)*cardW-reelW/2; const dur=RM?600:2800, t0=performance.now(); let li=-1;
  if(AU.caseDrums) AU.caseDrums(dur/1000,1);
  const step=now=>{ const p=Math.min(1,(now-t0)/dur), e=1-Math.pow(1-p,4), x=x0+(target-x0)*e; strip.style.transform=`translateX(${-x}px)`; const idx=Math.floor((x+reelW/2)/cw); if(idx!==li){ li=idx; AU.tick(); }
    if(p<1) requestAnimationFrame(step); else { cards[WI].classList.add('won'); const w=$('#rwin'); w.style.color=SEAT_C[m.win]; w.textContent=m.win===NET.me?`You take it.`:`${nameOf(m.win)} takes it.`; AU.reveal(Math.min(5,it?it.rarity:1)); if(AU.caseHit) AU.caseHit(it?it.rarity:1); setTimeout(()=>finishCoopCase(m,it),1900); } };
  requestAnimationFrame(step); }
function finishCoopCase(m,it){ if(NET.cc&&NET.cc.rid!==m.rid) return; $('#case').hidden=true; caseState=null; reveal=null; NET.cc=null; if(m.debt) NET.debtSeen=m.debt;
  if(m.win===NET.me&&it){ if(P.bag.length<24){ P.bag.push(it); AU.coin(); noteBest(it); } else dropItem(it,P.x,P.y-10,true); toast(`${it.name} is yours.`); }
  else if(m.win!=null&&it) toast(`${nameOf(m.win)} takes ${it.name}.`);
  if(mode==='case'){ mode='play'; hud.hidden=false; } }

/* ---------- every frame ---------- */
const BG_MODES=new Set(['inv','card','pause','map']);
function bgRun(rdt){ const ks={}; for(const k in keys){ ks[k]=keys[k]; keys[k]=false; } for(const k in buf) delete buf[k]; const mh=mouseHeld, rh=rmouseHeld, am=aimMouse; mouseHeld=rmouseHeld=false; aimMouse=false;
  try{ let left=rdt; while(left>1e-5){ const st=Math.min(left,1/60); update(st); left-=st; } } finally{ for(const k in ks) keys[k]=ks[k]; mouseHeld=mh; rmouseHeld=rh; aimMouse=am; } }
(function(){ const o=frame; let lt=performance.now(); frame=function(now){ const rdt=clamp((now-lt)/1000,0,.05); lt=now;
  if(COOP&&L&&P&&!NET.betweenLevels&&BG_MODES.has(mode)) bgRun(rdt);
  o(now); if(NET.conn) try{ netTick(rdt); }catch(e){ console.warn('co-op tick',e); } }; })();
(function(){ const o=update; update=function(dt){ o(dt); if(!COOP) return; tickHeroes(dt);
  if(NET.host){ const sp=[]; for(const e of enemies) if(!e.nid){ e.nid=++NET.nid; sp.push(espec(e)); } if(sp.length) bcast({t:'sp',ep:NET.epoch,a:sp});
    const dr=[]; for(const d of drops) if(!d.nid&&d.kind!=='orb'){ d.nid=++NET.dnid; dr.push(dspec(d)); } if(dr.length) bcast({t:'dr',ep:NET.epoch,a:dr});
    for(const e of enemies) if(e.dead&&e.nid&&!e._ds){ e._ds=1; bcast({t:'die',ep:NET.epoch,n:e.nid,k:e._k?1:0,r:e._kd||1,c:e._kc?1:0,lh:e.lastHit?{cls:e.lastHit.cls,el:e.lastHit.el,heavy:e.lastHit.heavy}:null}); }
    if(chests.length>NET.chestN){ for(let i=NET.chestN;i<chests.length;i++){ const c=chests[i]; bcast({t:'ca',ep:NET.epoch,x:c.x,y:c.y,tier:c.tier,f:c.falling?1:0,fy:c.floorY}); } NET.chestN=chests.length; } }
  else { guestScan(); enemies=enemies.filter(e=>e.nid); drops=drops.filter(d=>d.nid||d.kind==='orb'); if(chests.length>NET.chestN) chests.length=NET.chestN; }
  const pj=[]; for(const p of projs) if(p.from==='p'&&!p._nv){ p._nv=1; pj.push([p.type,Math.round(p.x),Math.round(p.y),Math.round(p.vx),Math.round(p.vy),p.g||0,p.r||3,+p.life.toFixed(2)]); }
  if(pj.length){ const m={t:'pj',ep:NET.epoch,s:NET.me,a:pj}; if(NET.host) bcast(m); else toHost(m); }
  tickRevive(dt); if(NET.host) wipeCheck(dt); }; })();
function netTick(dt){ if(!NET.running) return; tickNeed(); if(NET.host) tickRoll();
  const now=performance.now();
  if(now-NET.tSt>50){ NET.tSt=now; if(L&&P&&!NET.betweenLevels){ const st=heroSt(); if(NET.host){ const a=[st]; for(const h of Object.values(NET.heroes)) if(h.st) a.push(h.st); bcast({t:'hs',a}); } else toHost(Object.assign({t:'st'},st)); } }
  if(NET.host&&now-NET.tSn>66&&!NET.betweenLevels){ NET.tSn=now; for(const x of NET.seats) if(x.s!==0) sendSeat(x.s,snapFor(x.s)); }
  if(now-NET.tEq>500){ NET.tEq=now; const eq=Object.fromEntries(Object.entries(P.equip).map(([k,v])=>[k,serItem(v)])); const key=JSON.stringify(eq)+[...P.skills].join(); if(key!==NET.eqKey){ NET.eqKey=key; const m={t:'eq',s:NET.me,eq,sk:[...P.skills],lvl:P.lvl}; if(NET.host) bcast(m); else toHost(m); } }
  drawCoopHud(); }
function drawCoopHud(){ const show=mode==='play'||mode==='inv'||mode==='pause'; teamEl.hidden=!show; tagsEl.hidden=!show; if(!show) return;
  const rows=NET.seats.filter(x=>x.s!==NET.me).map(x=>{ const h=NET.heroes[x.s]; const live=heroLive(h); const st=h&&h.st; const lf=st?clamp(st.lf/Math.max(1,st.ml),0,1):1; const dn=st&&st.de;
    return `<div class="tm${dn?' dn':''}" style="--sc:${SEAT_C[x.s]}"><b>${x.name}</b> · Lv ${x.lvl}${dn?' · DOWN':!live?' · elsewhere':''}<div class="lb"><s style="width:${(lf*100).toFixed(0)}%"></s></div></div>`; }).join('');
  if(teamEl._h!==rows){ teamEl._h=rows; teamEl.innerHTML=rows; }
  let n=0; for(const h of Object.values(NET.heroes)){ if(!heroLive(h)) continue; const sx=scrX(h.p.x), sy=scrY(h.p.y-38); let el=tagsEl.children[n]; if(!el){ el=document.createElement('div'); el.className='tg'; tagsEl.appendChild(el); }
    el.hidden=false; el.style.setProperty('--sc',SEAT_C[h.s]); el.style.left=sx+'px'; el.style.top=sy+'px';
    const html=h.p.dead?`${h.name} · DOWN<br>${h.rev>0?`<span class="rv"><s style="width:${(h.rev/2.4*100).toFixed(0)}%"></s></span>`:'stand over them to revive'}`:h.name; if(el._h!==html){ el._h=html; el.innerHTML=html; } n++; }
  for(let i=n;i<tagsEl.children.length;i++) tagsEl.children[i].hidden=true; }

/* ---------- ways in and out ---------- */
(function(){ const o=toTitle; toTitle=function(){ if(COOP||NET.conn) netLeave(true); o(); let b=$('#coopBtn'); if(!b){ b=document.createElement('button'); b.className='btn ghost'; b.id='coopBtn'; b.textContent='Together (co-op)'; const after=$('#slotsBtn')||$('#startBtn'); after.after(b); b.onclick=()=>coopFromTitle(); } }; })();
function coopFromTitle(code){ AU.init(); const db=slotsDB(); const last=db.list.find(s=>s.id===db.last&&s.data);
  if(last){ curSlot=last.id; continueGame(); if(L.def.kind!=='cabin') goCabin(); }
  else { curSlot=newSlot().id; META=freshMeta(); stopTitleBits(); ngp=0; seenIntro={}; CODEX_OPEN=new Set(); VOWS_TAKEN={}; P=newPlayer(); P.equip.weapon=mkBase('Rusted Falchion'); calcStats(); P.life=P.stats.life; $('#title').hidden=true; goCabin(); }
  setTimeout(()=>{ if(mode==='card'){ hideCard(); } openCoop(code); },60); }
(function(){ const o=openPause; openPause=function(){ o(); const col=$('#pause .col'); let b=$('#pCoop'); if(!b&&col){ b=document.createElement('button'); b.className='btn ghost'; b.id='pCoop'; col.appendChild(b); }
  if(b){ b.hidden=!COOP; b.textContent=NET.host?'End the descent for everyone':'Leave the descent'; b.onclick=()=>{ closePause(); netLeave(); }; } }; })();
addEventListener('keydown',ev=>{ if(mode==='coop'&&ev.key==='Escape'&&!NET.conn){ ev.preventDefault(); closeCoop(); } });
addEventListener('pagehide',()=>{ if(NET.conn&&NET.tr){ if(NET.host) bcast({t:'bye'}); else toHost({t:'bye'}); } });
if(QS.get('join')) setTimeout(()=>{ if(mode==='title') coopFromTitle(cleanCode(QS.get('join'))); },400);
