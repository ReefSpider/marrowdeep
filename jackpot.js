'use strict';
/* ===== jackpot 大当たり (v22): good loot pays out like a pokie =====
   Every stat that lands High or better strikes a charm, and each one in the same reveal rings a step higher up the
   scale, so a run of good rolls climbs. When the reveal ends, the item is scored (rarity plus its Max and Abyssal
   grades) and the win is celebrated to match:
     1 Good      Rare-class        a three-note charm, sparkles off the tooltip
     2 Great     Legendary-class   a five-note run, coins burst from the tooltip, the screen's edge glows its colour
     3 Big win   Unique-class      a winged saint descends in a shaft of light behind the panel (祝), votive candles
                                   catch in a sweep along the foot of the screen, feathers fall, the bell trill
     4 Jackpot   any Abyssal       a horned demon rises, its eyes open red into violet and its jaw roars (魔); red veins
                                   crawl in from the edges, embers rise, the candles burn red and violet, drums
   World drops (mid-fight) top out at Great unless Abyssal. The Gallows Wheel pays out the same way.
   No full-screen flashes (see v12): the edge glow breathes slowly, the bulbs are small. Reduced motion or the pause
   menu's "Big-win effects" switch keeps the sounds and drops the screen effects. */
const JP={streak:0,raf:0,fx:[],coins:[],bulbs:null,glow:null};
const JP_SCALE=[0,2,4,7,9,12,14,16,19,21,24,26,28,31];   // major pentatonic, semitones
const JP_BASE=784;                                         // G5
const jpOn=()=>!RM&&SETTINGS.wins!==false;

/* ---------- sound ---------- */
/* a struck charm: inharmonic bell partials, bright attack, short ring */
AU.charm=function(f,v,delay){ if(!this.c) return; const c=this.c, t=c.currentTime+(delay||0);
  for(const [m,a,d] of [[1,1,1.1],[2.76,.32,.5],[5.4,.14,.26],[8.93,.06,.15]]){ const o=c.createOscillator(); o.type='sine'; o.frequency.value=f*m; const g=c.createGain(), dur=d*(1+v);
    g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(Math.max(.0002,v*a*.5),t+.004); g.gain.exponentialRampToValueAtTime(.0001,t+dur); o.connect(g); this.out(g,.35); o.start(t); o.stop(t+dur+.05); } };
AU.clink=function(delay,v){ const p=.85+Math.random()*.4; this.tone('square',2637*p,2637*p,.05,.035*(v||1),.3,delay); this.tone('sine',3951*p,3900*p,.18,.05*(v||1),.4,(delay||0)+.02); };
const jpNote=i=>JP_BASE*Math.pow(2,JP_SCALE[clamp(i,0,JP_SCALE.length-1)]/12);
function jpArp(from,n,gap,v,delay){ for(let i=0;i<n;i++) AU.charm(jpNote(from+i),v,(delay||0)+i*gap); }
/* the pokie bell: two charms alternating fast, getting louder, then a held chord */
function jpTrill(dur,v,root,delay){ const d0=delay||0, n=Math.round(dur*14); for(let i=0;i<n;i++){ const k=i/n; AU.charm(jpNote(root+(i%2?2:0)),v*(.35+.65*k),d0+i/14); }
  [0,2,4].forEach(s=>AU.charm(jpNote(root+s+5),v,d0+dur+.02)); }
function jpCoins(n,span,v,delay){ for(let i=0;i<n;i++) AU.clink((delay||0)+Math.pow(i/n,1.4)*span+Math.random()*.03,v); }

/* ---------- scoring ---------- */
function jpTier(it){ if(!it) return 0; const aff=it.aff||[]; const nMax=aff.filter(a=>a.g===3).length, nAby=aff.filter(a=>a.g===4).length, nHi=aff.filter(a=>a.g===2).length;
  if(it.rarity===5||nAby) return 4; const s=[0,0,1,2,3,4][it.rarity]+nMax*.75+nHi*.15; return s>=3?3:s>=2?2:s>=1?1:0; }

/* each good stat as it lands: the charm climbs with the streak */
JP.stat=function(g,fast,rowEl){ if(g<2) return; this.streak++; const step=this.streak-1+(g===3?2:g===4?4:0), v=fast?.32:.45;
  AU.charm(jpNote(step),v); if(g>=3) AU.charm(jpNote(step+2),v*.8,.07); if(g===4) AU.charm(jpNote(step+4),v*.9,.14);
  if(rowEl&&jpOn()){ rowEl.classList.remove('jpg'); void rowEl.offsetWidth; rowEl.classList.add('jpg'); if(g>=3) jpSparks(rowEl,g===4?14:7,g===4?'#ff4a3d':'#ffcf6a'); } };

/* the payout, once the whole item is revealed */
JP.win=function(it,ctx,box){ const t=jpTier(it); if(!t) return; const drop=ctx==='drop', v=drop?.38:.5, col=RCOL[it.rarity]||'#ffcf6a';
  const vt=drop?(t===4?3:Math.min(t,2)):t;                       // what the screen does
  if(t===1){ jpArp(this.streak+1,3,.07,v); AU.coin(); }
  if(t===2){ jpArp(this.streak+1,5,.06,v); jpCoins(8,.7,.8,.25); }
  if(t===3){ jpArp(3,6,.05,v); jpTrill(drop?.7:1.4,v,5,.32); jpCoins(drop?10:26,drop?1:2.2,.9,.5); AU.taiko&&AU.taiko(1.1); }
  if(t===4){ jpArp(3,8,.045,v); jpTrill(drop?1.1:2.6,v*1.1,7,.4); jpCoins(drop?16:44,drop?1.4:3.4,1,.6); if(AU.taiko){ AU.taiko(1.3); AU.taiko(1.2,AU.c&&AU.c.currentTime+.45,.8); AU.taiko(1.4,AU.c&&AU.c.currentTime+.9,.7); } AU.tone('sine',41,30,2.4,.6,.8,.4); }
  if(!jpOn()) return;
  const ab=t===4;
  if(vt>=1&&box) jpSparks(box,vt>=2?16:10,ab?'#ff4a3d':col);
  if(vt>=2){ jpBurst(box,vt>=3?40:22,ab); jpGlow(ab?'#a8141a':col,vt>=3?2.4:1.5); }
  if(vt>=3){ jpBulbs(ab?4.4:3.6,ab); if(ab) jpRain(90,ab);
    if(!drop||ab){ jpApparition(ab?'demon':'saint',box,ab?4.0:3.6,drop); if(ab) setTimeout(()=>{ AU.roar(); AU.slam(); shake(drop?3:6); },1700); else { AU.bell&&AU.bell(); shake(2); } } }
  if(t>=3&&typeof MUS!=='undefined'&&MUS.out&&AU.c){ const c=AU.c.currentTime; MUS.out.gain.setTargetAtTime(.3,c,.1); MUS.out.gain.setTargetAtTime(.9,c+(ab?4.5:3),1); } };

/* the Gallows Wheel pays the same way: by how many times the bet came back */
JP.cash=function(mult,sym){ const t=sym==='crown'?4:mult>=40?3:mult>=10?2:1; const fake={rarity:[0,2,3,4,5][t],aff:[]};
  this.streak=0; this.win(fake,'wheel',$('#slCab')||null); };

/* ---------- screen effects ---------- */
function jpLayer(){ let el=$('#jpfx'); if(el) return el; el=document.createElement('div'); el.id='jpfx'; stage.appendChild(el);
  const c=document.createElement('canvas'); c.id='jpcv'; el.appendChild(c); return el; }
function jpCss(){ if($('#jpCss')) return; const st=document.createElement('style'); st.id='jpCss'; st.textContent=`
#jpfx{position:absolute;inset:0;pointer-events:none;z-index:95;overflow:hidden}
#jpcv{position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated;image-rendering:crisp-edges}
#jpfx .spk{position:absolute;width:calc(var(--u)*.5);height:calc(var(--u)*.5);background:var(--c);box-shadow:0 0 calc(var(--u)*.6) var(--c);animation:jpSpk .75s cubic-bezier(.2,.7,.3,1) forwards}
@keyframes jpSpk{0%{transform:translate(0,0) scale(1.3);opacity:1}100%{transform:translate(var(--dx),var(--dy)) scale(.2);opacity:0}}
#jpfx .glow{position:absolute;inset:0;box-shadow:inset 0 0 calc(var(--u)*7) calc(var(--u)*1.2) var(--c);opacity:0;animation:jpGlow var(--d) ease-in-out forwards}
@keyframes jpGlow{0%{opacity:0}25%{opacity:.85}55%{opacity:.5}75%{opacity:.7}100%{opacity:0}}
#jpap{position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated;image-rendering:crisp-edges;z-index:-1;pointer-events:none}
.jpdim{transition:opacity .5s;opacity:.12!important}
.jpg{animation:jpRow .7s ease-out}
@keyframes jpRow{0%{box-shadow:0 0 0 0 rgba(255,207,106,0)}25%{box-shadow:0 0 calc(var(--u)*1.2) calc(var(--u)*.2) rgba(255,207,106,.75)}100%{box-shadow:0 0 0 0 rgba(255,207,106,0)}}
@media (prefers-reduced-motion: reduce){.jpg{animation:none}}`; document.head.appendChild(st); }
function jpRect(el){ const s=stage.getBoundingClientRect(), r=el.getBoundingClientRect(); return {x:r.left-s.left,y:r.top-s.top,w:r.width,h:r.height,sw:s.width,sh:s.height}; }
function jpSparks(el,n,col){ jpCss(); const L=jpLayer(), r=jpRect(el); for(let i=0;i<n;i++){ const d=document.createElement('div'); d.className='spk';
    const side=i%4, x=side===0?r.x+Math.random()*r.w:side===1?r.x+r.w:side===2?r.x+Math.random()*r.w:r.x, y=side===0?r.y:side===1?r.y+Math.random()*r.h:side===2?r.y+r.h:r.y+Math.random()*r.h;
    const a=Math.atan2(y-(r.y+r.h/2),x-(r.x+r.w/2))+(Math.random()-.5)*.6, dist=20+Math.random()*50;
    d.style.cssText=`left:${x}px;top:${y}px;--c:${col};--dx:${Math.cos(a)*dist}px;--dy:${Math.sin(a)*dist}px;animation-delay:${Math.random()*.15}s`; L.appendChild(d); setTimeout(()=>d.remove(),1000); } }
function jpGlow(col,dur){ jpCss(); const L=jpLayer(); const d=document.createElement('div'); d.className='glow'; d.style.cssText=`--c:${col};--d:${dur}s`; L.appendChild(d); setTimeout(()=>d.remove(),dur*1000+50); }
/* coins and bulbs share one pixel canvas at half the game's grid, so they sit with the art */
function jpCanvas(){ jpCss(); const L=jpLayer(), c=$('#jpcv'); const w=W, h=H; if(c.width!==w){ c.width=w; c.height=h; } return c; }
function jpBurst(el,n,ab){ const c=jpCanvas(); const r=el?jpRect(el):{x:c.width,y:c.height*.4,w:0,h:0,sw:1,sh:1}; const k=c.width/(r.sw||stage.clientWidth||1);
  const cx=(r.x+r.w/2)*k, cy=(r.y+r.h*.35)*k; for(let i=0;i<n;i++){ const a=-Math.PI/2+(Math.random()-.5)*2.4, sp=90+Math.random()*170;
    JP.coins.push({x:cx+(Math.random()-.5)*r.w*k*.6,y:cy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,ph:Math.random()*6,ab,life:1.6+Math.random()*.6}); } jpRun(); }
function jpRain(n,ab){ const c=jpCanvas(); for(let i=0;i<n;i++) JP.coins.push(ab?{x:Math.random()*c.width,y:c.height+4+Math.random()*c.height*.8,vx:(Math.random()-.5)*16,vy:-(40+Math.random()*70),ph:Math.random()*6,ab,life:6,rise:1}:{x:Math.random()*c.width,y:-8-Math.random()*c.height*.9,vx:(Math.random()-.5)*20,vy:60+Math.random()*80,ph:Math.random()*6,ab,life:6,rain:1}); jpRun(); }
function jpBulbs(dur,ab){ JP.bulbs={t:0,dur,ab}; jpRun(); }

/* ---------- the apparitions (drawn like the altar's god: a 320×180 pixel canvas, gradients, Mincho verdict) ----------
   A big win brings down a winged saint in a shaft of light (祝, blessed); the abyss sends up a horned demon whose eyes
   open and whose jaw roars (魔). In a chest or the wheel they are drawn behind the panel, so the stats stay readable;
   the reel above dims while they're there. */
function jpApparition(kind,box,D,faint){ jpCss(); const host=box&&box.closest?box.closest('.screen'):null; const cv=document.createElement('canvas'); cv.width=320; cv.height=180; cv.id='jpap'; const dimmed=[];
  $('#jpap')&&$('#jpap').remove(); const tok=JP.apTok=(JP.apTok||0)+1;
  const front=kind==='demon'; if(front&&host){ cv.style.zIndex='5'; host.appendChild(cv); }
  else if(host){ host.style.isolation='isolate'; host.insertBefore(cv,host.firstChild); for(const s of ['#reel','#odds','#caseName','#caseSub']){ const e=host.querySelector(s); if(e){ e.classList.add('jpdim'); dimmed.push(e); } } }
  else { cv.style.zIndex='0'; jpLayer().insertBefore(cv,$('#jpcv')); }
  const g=cv.getContext('2d'); g.imageSmoothingEnabled=false; const t0=performance.now(), ps=[], rg=mulberry((Math.random()*1e9)>>>0);
  const veins=[]; if(kind==='demon') for(let i=0;i<14;i++){ const side=i%4; let x=side===1?320:side===3?0:rg()*320, y=side===0?0:side===2?180:rg()*180; const pts=[[x,y]]; let ang=Math.atan2(90-y,160-x);
    for(let k=0;k<9;k++){ ang+=(rg()-.5)*.9; x+=Math.cos(ang)*(7+rg()*7); y+=Math.sin(ang)*(7+rg()*7); pts.push([x,y]); } veins.push({pts,d:rg()*.5}); }
  const step=now=>{ const t=JP.freezeAt!=null?JP.freezeAt:(now-t0)/1000; if(t>D||!cv.isConnected){ cv.remove(); if(JP.apTok===tok){ dimmed.forEach(e=>e.classList.remove('jpdim')); if(host) host.style.isolation=''; } return; }
    g.setTransform(1,0,0,1,0,0); g.clearRect(0,0,320,180); const a=clamp(Math.min(t/.35,(D-t)/.8),0,1)*(faint?.75:1);
    (kind==='demon'?jpDemon:jpSaint)(g,t,a,ps,faint,veins,rg,D); requestAnimationFrame(step); };
  requestAnimationFrame(step); }
const jpE=(g,x,y,rx,ry,c)=>{ g.fillStyle=c; g.beginPath(); g.ellipse(x,y,rx,ry,0,0,Math.PI*2); g.fill(); };
const jpPoly=(g,pts,c)=>{ g.fillStyle=c; g.beginPath(); g.moveTo(pts[0][0],pts[0][1]); for(const p of pts.slice(1)) g.lineTo(p[0],p[1]); g.closePath(); g.fill(); };
function jpSaint(g,t,a,ps,faint){ const oy=-70*Math.pow(1-clamp(t/1.1,0,1),3), cx=160, hy=46+oy;
  if(!faint){ const vg=g.createRadialGradient(160,80,40,160,90,210); vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,`rgba(0,0,0,${(.7*a).toFixed(2)})`); g.fillStyle=vg; g.fillRect(0,0,320,180); }
  /* the shaft of light */
  const fl=.85+.15*Math.sin(t*5.3); const sh=g.createLinearGradient(0,0,0,180); sh.addColorStop(0,`rgba(255,226,160,${(.42*a*fl).toFixed(3)})`); sh.addColorStop(1,`rgba(255,200,110,${(.06*a).toFixed(3)})`);
  g.fillStyle=sh; g.beginPath(); g.moveTo(cx-16,0); g.lineTo(cx+16,0); g.lineTo(cx+46,180); g.lineTo(cx-46,180); g.closePath(); g.fill();
  /* the halo: a ring of beads turning one way, rays turning the other */
  const hs=clamp((t-.3)/.6,0,1); g.globalAlpha=a;
  const hg=g.createRadialGradient(cx,hy,4,cx,hy,44*hs+1); hg.addColorStop(0,'rgba(255,240,200,.55)'); hg.addColorStop(1,'rgba(255,200,110,0)'); g.fillStyle=hg; g.fillRect(cx-46,hy-46,92,92);
  for(let i=0;i<16;i++){ const an=i/16*Math.PI*2-t*.5, L=(i%2?12:21)*hs; g.strokeStyle='rgba(255,224,150,.55)'; g.lineWidth=1; g.beginPath(); g.moveTo(cx+Math.cos(an)*30*hs,hy+Math.sin(an)*30*hs); g.lineTo(cx+Math.cos(an)*(30*hs+L),hy+Math.sin(an)*(30*hs+L)); g.stroke(); }
  for(let i=0;i<36;i++){ const an=i/36*Math.PI*2+t*.8; g.fillStyle=i%3?'#ffe6a8':'#fff8e0'; g.fillRect(Math.round(cx+Math.cos(an)*24*hs),Math.round(hy+Math.sin(an)*24*hs),i%3?1:2,i%3?1:2); }
  /* the wings unfold: seven feathers a side */
  const u=clamp((t-.25)/1,0,1), ue=1-Math.pow(1-u,3);
  for(const s of [-1,1]) for(let k=6;k>=0;k--){ const bx=cx+s*7, by=hy+20, th=ue*(.35+k*.22), len=(22+k*5)*(.3+.7*ue), w=3+k*.4;
    const tx=bx+s*Math.sin(th)*len, ty=by-Math.cos(th)*len, nx=-(ty-by)/len*w, ny=(tx-bx)/len*w, mx=(bx+tx)/2, my=(by+ty)/2;
    jpPoly(g,[[bx,by],[mx+nx,my+ny],[tx,ty],[mx-nx*.3,my-ny*.3]],'#1a1410'); jpPoly(g,[[bx,by],[mx+nx*.7,my+ny*.7],[tx,ty]],k%2?'#e8dcc4':'#cfc4ae'); }
  /* the saint: a robe in shadow, arms open, a gold mask with red tears */
  jpPoly(g,[[cx-10,hy+16],[cx+10,hy+16],[cx+20,hy+80],[cx-20,hy+80]],'#120c0c'); g.strokeStyle='#cfc4ae'; g.lineWidth=1; g.beginPath(); g.moveTo(cx-10,hy+16); g.lineTo(cx-20,hy+80); g.moveTo(cx+10,hy+16); g.lineTo(cx+20,hy+80); g.moveTo(cx,hy+30); g.lineTo(cx-3,hy+78); g.stroke();
  const ar=clamp((t-.5)/.8,0,1); for(const s of [-1,1]){ g.strokeStyle='#120c0c'; g.lineWidth=4; g.beginPath(); g.moveTo(cx+s*8,hy+20); g.lineTo(cx+s*(10+22*ar),hy+22+10*(1-ar)); g.stroke(); g.fillStyle='#e8dcc4'; g.fillRect(Math.round(cx+s*(10+22*ar))-1,Math.round(hy+21+10*(1-ar)),3,3); }
  jpE(g,cx,hy+6,9,11,'#120c0c'); g.strokeStyle='#cfc4ae'; g.beginPath(); g.ellipse(cx,hy+6,9,11,0,Math.PI*1.05,Math.PI*1.95); g.stroke(); jpE(g,cx,hy+8,5,7,'#d8b060'); g.fillStyle='#0e0a0a'; g.fillRect(cx-3,hy+6,2,1); g.fillRect(cx+1,hy+6,2,1);
  const tr=clamp((t-1)/1.2,0,1)*7; g.fillStyle='#b0141a'; g.fillRect(cx-3,hy+7,1,tr); g.fillRect(cx+2,hy+7,1,tr*.8);
  /* feathers and light falling */
  if(t<2.8&&Math.random()<.5) ps.push({x:cx+rnd(-40,40),y:hy+rnd(-10,20),vx:rnd(-6,6),vy:rnd(8,22),l:2.5,c:Math.random()<.7?'#ece6d8':'#ffe08a'});
  for(const p of ps){ p.l-=1/60; p.x+=p.vx/60+Math.sin(t*3+p.y*.1)*.15; p.y+=p.vy/60; if(p.l>0){ g.globalAlpha=a*Math.min(1,p.l); g.fillStyle=p.c; g.fillRect(p.x|0,p.y|0,1,p.c==='#ece6d8'?2:1); } }
  for(let i=ps.length-1;i>=0;i--) if(ps[i].l<=0) ps.splice(i,1);
  /* the verdict */
  const ka=clamp((t-.7)/.5,0,1); g.globalAlpha=a*ka*.95; g.fillStyle='#ffd27a'; g.font='bold 52px "Shippori Mincho",serif'; g.textAlign='center'; g.fillText('祝',262,104); g.globalAlpha=1; }
function jpDemon(g,t,a,ps,faint,veins,rg,D){ const rise=1-Math.pow(1-clamp((t-.2)/1.3,0,1),3), sink=Math.pow(clamp((t-(D-1.1))/1,0,1),2), cy=230-138*rise+150*sink, cx=160;
  if(!faint){ g.fillStyle=`rgba(14,0,4,${(.55*a*(1-sink)).toFixed(2)})`; g.fillRect(0,0,320,180); const vg=g.createRadialGradient(160,90,50,160,90,200); vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,`rgba(70,0,10,${(.8*a).toFixed(2)})`); g.fillStyle=vg; g.fillRect(0,0,320,180); }
  /* veins of red crawl in from the edges */
  g.globalAlpha=a; g.lineWidth=1; for(const v of veins){ const gr=clamp((t-v.d)/1.4,0,1)*(v.pts.length-1); g.strokeStyle='#7a0c12'; g.beginPath(); g.moveTo(v.pts[0][0],v.pts[0][1]); for(let k=1;k<=gr;k++) g.lineTo(v.pts[k][0],v.pts[k][1]); g.stroke();
    const tip=v.pts[Math.floor(gr)]; g.fillStyle=Math.sin(t*9+v.d*20)>0?'#ff4a3d':'#b04aff'; g.fillRect(tip[0]|0,tip[1]|0,1,1); }
  /* horns, bone, curving up and out */
  for(const s of [-1,1]){ const H=[[cx+s*30,cy-34],[cx+s*50,cy-54],[cx+s*56,cy-76],[cx+s*50,cy-92],[cx+s*62,cy-74],[cx+s*62,cy-52],[cx+s*42,cy-30]];
    jpPoly(g,H,'#1a1410'); jpPoly(g,H.map(p=>[p[0]-s*1.5,p[1]+1]),'#cfc4ae'); g.fillStyle='#8a8070'; for(let k=0;k<5;k++) g.fillRect(Math.round(cx+s*(36+k*4.5)),Math.round(cy-40-k*8),2,1); }
  /* the head: black, broad in the jaw, outlined in old blood */
  jpE(g,cx,cy,64,56,'#3a1014'); jpE(g,cx,cy+1,62,54,'#070304'); jpPoly(g,[[cx-62,cy+4],[cx+62,cy+4],[cx+44,cy+52],[cx-44,cy+52]],'#070304');
  g.strokeStyle='#3a1014'; g.beginPath(); g.moveTo(cx-40,cy-26); g.lineTo(cx-8,cy-14); g.lineTo(cx,cy-20); g.lineTo(cx+8,cy-14); g.lineTo(cx+40,cy-26); g.stroke();
  /* the eyes open, burning red into violet */
  const o=clamp((t-1.1)/.45,0,1), hue=Math.sin(t*2.6)>0, ec=hue?'#ff3a2a':'#c04aff';
  for(const s of [-1,1]){ const ex=cx+s*22, ey=cy-8; if(o>0){ const eg=g.createRadialGradient(ex,ey,1,ex,ey,22); eg.addColorStop(0,hue?'rgba(255,60,40,.55)':'rgba(190,70,255,.55)'); eg.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=eg; g.fillRect(ex-22,ey-22,44,44);
      jpPoly(g,[[ex-s*12,ey+3],[ex+s*2,ey-2-5*o],[ex+s*13,ey-6],[ex+s*4,ey+2+2*o]],ec); g.fillStyle='#fff0e0'; g.fillRect(ex-s*2,ey-2,2,1); g.fillStyle='#050202'; g.fillRect(ex,ey-Math.round(3*o),1,Math.max(1,Math.round(5*o))); }
    else { g.fillStyle='#3a1014'; g.fillRect(ex-10,ey,20,1); } }
  /* the jaw: a grin, then a roar */
  const m=t<1.7?0:clamp((t-1.7)/.25,0,1)*clamp(1-(t-3.1)/.6,0,1), my=cy+28, mw=34, mh=3+m*15;
  jpE(g,cx,my,mw+2,mh+2,'#3a1014'); jpE(g,cx,my,mw,mh,'#050202'); if(m>.05){ const mg=g.createRadialGradient(cx,my+2,1,cx,my,mw); mg.addColorStop(0,`rgba(220,40,24,${(.6*m).toFixed(2)})`); mg.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=mg; g.fillRect(cx-mw,my-mh,mw*2,mh*2); }
  g.fillStyle='#e0d4b8'; for(let i=-5;i<=5;i++){ const tx=cx+i*6, lim=Math.sqrt(Math.max(0,1-Math.pow(i*6/mw,2))); if(lim<=0) continue; const th=(i%2?4:6)*lim; jpPoly(g,[[tx-2,my-mh*lim],[tx+2,my-mh*lim],[tx,my-mh*lim+th]],'#e0d4b8'); jpPoly(g,[[tx-2,my+mh*lim],[tx+2,my+mh*lim],[tx,my+mh*lim-th]],'#e0d4b8'); }
  /* embers */
  if(Math.random()<.8) ps.push({x:cx+rnd(-90,90),y:184,vx:rnd(-8,8),vy:rnd(-60,-25),l:3,c:Math.random()<.5?'#ff4a3d':'#b04aff'});
  if(m>.5&&Math.random()<.9) for(let i=0;i<3;i++) ps.push({x:cx+rnd(-20,20),y:my,vx:rnd(-70,70),vy:rnd(-50,10),l:1,c:'#ff7a3a'});
  for(const p of ps){ p.l-=1/60; p.x+=p.vx/60; p.y+=p.vy/60; if(p.l>0){ g.globalAlpha=a*Math.min(1,p.l); g.fillStyle=p.c; g.fillRect(p.x|0,p.y|0,1,1); } }
  for(let i=ps.length-1;i>=0;i--) if(ps[i].l<=0) ps.splice(i,1);
  /* the verdict */
  const ka=clamp((t-1.8)/.4,0,1); g.globalAlpha=a*ka*.9; g.fillStyle='#b0141a'; g.font='bold 52px "Shippori Mincho",serif'; g.textAlign='center'; g.fillText('魔',58,104); g.globalAlpha=1; }

function jpRun(){ if(JP.raf) return; let last=performance.now(); const step=now=>{ const dt=Math.min(.05,(now-last)/1000); last=now; const c=$('#jpcv'); if(!c){ JP.raf=0; return; }
    const g=c.getContext('2d'), w=c.width, h=c.height; g.clearRect(0,0,w,h);
    /* votive candles along the foot of the screen: they catch one after another in a sweep, back and forth, then
       burn together and gutter out. In the abyss the flames turn red and violet. (The pokie's chasing lights, in wax.) */
    const B=JP.bulbs; if(B){ B.t+=dt; const sp=14, n=Math.ceil(w/sp), fade=Math.min(1,(B.dur-B.t)/.6,B.t/.2), sweep=B.t*24;
      for(let i=0;i<n;i++){ const x=i*sp+5, hh=5+((i*7)%3)*2, y=h-hh-1; g.globalAlpha=fade; g.fillStyle='#d8ccb0'; g.fillRect(x,y,3,hh); g.fillStyle='#8a8070'; g.fillRect(x+2,y+1,1,hh-1);
        const pos=sweep%(2*n), head=pos<n?pos:2*n-pos, lit=B.t>B.dur*.55||Math.abs(i-head)<3.5||(i*13+(B.t*6|0))%11===0; if(!lit) continue;
        const f=Math.sin(B.t*17+i*2.3), fh=3+(f>.3?1:0); const c1=B.ab?(i%2?'#ff4a3d':'#b04aff'):'#ffd27a', c2=B.ab?'#ffb0c0':'#fff3c4';
        g.globalAlpha=fade*.22; g.fillStyle=c1; g.fillRect(x-3,y-fh-4,9,fh+5); g.globalAlpha=fade; g.fillStyle=c1; g.fillRect(x+(f>.6?1:0),y-fh,2,fh); g.fillStyle=c2; g.fillRect(x+1,y-fh+1,1,fh-1); }
      g.globalAlpha=1; if(B.t>B.dur) JP.bulbs=null; }
    /* coins: pixel discs that spin (their width breathes) and bounce once off the floor */
    for(const q of JP.coins){ q.life-=dt; q.vy+=(q.rise?-10:q.rain?60:420)*dt; q.x+=q.vx*dt; q.y+=q.vy*dt; q.ph+=dt*9; if(!q.rain&&q.y>h-6&&q.vy>0){ q.y=h-6; q.vy*=-.35; q.vx*=.6; }
      if(q.rise){ g.globalAlpha=Math.min(1,q.life/.4)*(Math.sin(q.ph*2)>-.6?1:.3); g.fillStyle=Math.sin(q.ph*.7)>0?'#ff4a3d':'#b04aff'; g.fillRect(Math.round(q.x),Math.round(q.y),1,2); continue; }
      const wd=Math.max(1,Math.round(Math.abs(Math.cos(q.ph))*4)); g.globalAlpha=Math.min(1,q.life/.4); g.fillStyle=q.ab?'#c0283a':'#c8962e'; g.fillRect(Math.round(q.x-wd/2),Math.round(q.y)-2,wd,5);
      g.fillStyle=q.ab?'#ff7a8a':'#ffe08a'; if(wd>2) g.fillRect(Math.round(q.x-wd/2),Math.round(q.y)-2,1,2); }
    g.globalAlpha=1; JP.coins=JP.coins.filter(q=>q.life>0&&q.y<h+10+(q.rise?h:0)&&q.y>-30);
    if(JP.bulbs||JP.coins.length) JP.raf=requestAnimationFrame(step); else { JP.raf=0; g.clearRect(0,0,w,h); } };
  JP.raf=requestAnimationFrame(step); }

/* ---------- hooks ---------- */
(function(){ const o=statReel; statReel=function(it,box,done,opt){ JP.streak=0; const fast=!!(opt&&opt.fast);
  return o(it,box,function(){ try{ JP.win(it,fast?'drop':'chest',box); }catch(e){ console.warn('jackpot',e); } if(done) return done.apply(this,arguments); },opt); }; })();
if(typeof settle==='function'){ const o=settle; settle=function(sy,bet){ const g0=P.gold; o(sy,bet); const won=P.gold-g0; if(won>bet) try{ JP.cash(won/bet,sy[0]); }catch(e){} }; }
/* the pause menu switch */
(function(){ const o=openPause; openPause=function(){ o(); let cb=$('#pWins'); if(!cb){ const sc=$('#pScare'); const lab=sc&&sc.closest('label'); if(lab){ const l=document.createElement('label'); l.className='chk'; l.innerHTML='Big-win effects <input type="checkbox" id="pWins">'; lab.parentNode.insertBefore(l,lab.nextSibling); cb=$('#pWins'); } }
  if(cb){ cb.checked=SETTINGS.wins!==false; cb.onchange=()=>{ SETTINGS.wins=cb.checked; store.set('marrowdeep.settings',SETTINGS); }; } }; })();
