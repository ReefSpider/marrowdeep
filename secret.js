'use strict';
/* ===== the Hollow Garden 虚ろの庭: a secret level =====
   After any level (not the Rope-House or the last battle) a reel rolls for a hidden door: 1 in 100.
   On a hit, the next level is the Hollow Garden instead: a porcelain-and-gold world under a cracked moon,
   with petals falling upward. Foes there have twice the life, hit twice as hard and give twice the XP.
   Its last chamber drops the Hollow Reliquary, whose rarity odds are fixed: Abyssal exactly 1 in 100.
   When it's cleared, the climb carries on to the level that would have come next.
   Testing: add ?secret=1 to the address and every roll hits.
   How it works: the garden is loaded at the index of the level you came from (so monster level, gold and
   drops scale as they would have), with that slot of LEVELS swapped for the garden's definition while it loads. */
const SECRET={on:false,from:-1,seed:4243,p:new URLSearchParams(location.search).get('secret')==='1'?1:.01};
const HOLLOW={id:'hollow',kind:'dungeon',secret:1,name:'The Hollow Garden',jp:'虚ろの庭',act:'Secret',pal:'hollow',cols:6,rows:3,up:.45,env:'hollow',
  enemies:{wraith:3,ghoul:2,penitent:2,knight:1.5,nun:1.5,witch:1.2,hound:2,archer:1.5,husk:2,brute:1},
  packs:[{t:'wraith',n:[4,6]},{t:'hound',n:[4,6]},{t:'knight',n:[2,3]}],packP:.5};
PALS.hollow={sky:['#02030a','#13234c','#0a1430'],shaft:'rgba(170,215,255,',stone:['#cfc8b6','#d9d3c3','#c3bba7','#e3ddce'],mortar:'#a8842f',cap:'#f1ece0',hi:'#ffffff',amb:[.6,.64,.76],motif:'hollow'};
EPIGRAPH.hollow={k:'幽玄',r:'yūgen',t:'The grace of a thing too deep to see the bottom of.'};
LETTERS.hollow='I dreamed of a white garden under a cracked moon. You were in it, mending something with gold. You looked up and didn\'t know me. Wake up.';
CW[4]=[0,0,50,30,19,1];
CNAME[4]='The Hollow Reliquary';

/* ---------- loading: the garden takes the place of the level you came from ---------- */
(function(){ const o=loadLevel; loadLevel=function(idx,opt){
  if(SECRET.on&&idx!==SECRET.from) SECRET.on=false;
  const real=LEVELS[idx]; const sec=SECRET.on&&real&&real.kind!=='cabin';
  if(!sec){ U.uAlt.value=0; return o(idx,opt); }
  opt=Object.assign({},opt||{}); opt.seed=(opt.seed||0)+SECRET.seed; LEVELS[idx]=HOLLOW;
  try{ o(idx,opt); } finally{ LEVELS[idx]=real; }
  U.uAlt.value=1; L.lanterns=(L.torches||[]).map(t=>({x:t.x*T+8,y:t.y*T-6,ph:t.x*1.7+t.y})); L.torches=[];
  $('#actTxt').textContent='Secret · foes ×2'+(typeof diffLabel==='function'?' · '+diffLabel():''); }; })();
/* twice as hard: every foe made while the garden is loaded */
(function(){ const o=mkEnemy; mkEnemy=function(s){ const e=o(s); if(SECRET.on){ e.hp*=2; e.maxhp*=2; e.dmg*=2; e.xp*=2; } return e; }; })();
(function(){ const o=moodFor; moodFor=function(def){ return def&&def.secret?'title':o(def); }; })();
(function(){ const o=epigraph; epigraph=function(id){ return o(SECRET.on?'hollow':id); }; })();
(function(){ const o=merchantCard; merchantCard=function(next){ if(!SECRET.on) return o(next); const i=lvlIdx, real=LEVELS[i]; LEVELS[i]=HOLLOW; try{ return o(next); } finally{ LEVELS[i]=real; } }; })();
(function(){ const o=toTitle; toTitle=function(){ SECRET.on=false; U.uAlt.value=0; return o(); }; })();

/* ---------- after a level: roll for the hidden door ---------- */
(function(){ const o=nextLevel; nextLevel=function(){
  if(SECRET.on){ SECRET.on=false; return o(); }            /* leaving the garden: on to the level that was next */
  const def=LEVELS[lvlIdx]; const host=typeof COOP==='undefined'||!COOP||NET.host;
  if(!def||def.kind==='cabin'||def.id==='count'||lvlIdx+1>=CABIN_IDX||!host) return o();
  const hit=Math.random()<SECRET.p; if(typeof COOP!=='undefined'&&COOP) bcast({t:'sroll',hit:hit?1:0});
  showSecretRoll(hit,()=>{ if(hit){ enterSecret(); return; } o();
    if(typeof COOP!=='undefined'&&COOP&&mode==='map') setTimeout(()=>{ if(COOP&&mode==='map'&&!mapScr.hidden&&mapScr._close) mapScr._close(); },2600); }); }; })();
function enterSecret(){ SECRET.on=true; SECRET.from=lvlIdx; goLevel(lvlIdx);
  toast('The Hollow Garden. Foes here have twice the life and hit twice as hard.'); setTimeout(()=>toast('A reliquary waits beyond the last chamber.'),2600); }

/* ---------- the roll ---------- */
(function(){ const st=document.createElement('style'); st.textContent=`
#srScr{position:absolute;inset:0;z-index:40;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(ellipse at 50% 45%,rgba(10,14,30,.9),rgba(2,2,5,.97) 70%);pointer-events:auto;cursor:pointer;transition:background .6s}
#srScr .srK{font-family:'Shippori Mincho',var(--fb);font-weight:800;font-size:calc(var(--u)*4.2);color:#cfd8ff;text-shadow:0 0 calc(var(--u)*1.4) rgba(140,180,255,.6);line-height:1}
#srScr .srT{font-family:var(--fd);font-size:calc(var(--u)*2.6);color:var(--bone);margin:calc(var(--u)*.5) 0 calc(var(--u)*.2)}
#srScr .srS{font-family:var(--fs);font-size:max(10px,calc(var(--u)*1.2));color:#8a8aa0;letter-spacing:.12em;margin-bottom:calc(var(--u)*1.4)}
#srScr .srS b{color:#9fe0ff;font-weight:400}
.srreel{position:relative;width:min(92%,calc(var(--u)*80));height:calc(var(--u)*11);overflow:hidden;border-top:1px solid #20243a;border-bottom:1px solid #20243a;background:#05060c}
.srstrip{position:absolute;left:0;top:0;height:100%;display:flex;gap:calc(var(--u)*.5);padding:calc(var(--u)*.6) 0;will-change:transform}
.srt{flex:none;width:calc(var(--u)*8.4);height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:calc(var(--u)*.3);background:linear-gradient(#10121c,#0a0b12);border-bottom:3px solid #3a3e52;font-family:var(--fs);font-size:max(9px,calc(var(--u)*1));color:#6a6e84}
.srt i{font-style:normal;font-family:'Shippori Mincho',var(--fb);font-weight:800;font-size:calc(var(--u)*3);color:#4a4e64;line-height:1}
.srt.h{background:linear-gradient(#1a2440,#0c1226);border-bottom-color:#d4ac48;color:#e8eeff;box-shadow:inset 0 0 calc(var(--u)*2) rgba(140,200,255,.35)}
.srt.h i{color:#f4f6ff;text-shadow:0 0 calc(var(--u)*1) #9fe0ff,0 0 calc(var(--u)*.3) #fff}
.srt.won{outline:2px solid #fff;outline-offset:-2px}
.srmk{position:absolute;left:50%;top:0;bottom:0;width:2px;margin-left:-1px;background:#e8e0c8;box-shadow:0 0 calc(var(--u)*.8) rgba(255,240,200,.8);z-index:2}
#srScr .srR{font-family:var(--fd);font-size:calc(var(--u)*3);min-height:1.4em;margin-top:calc(var(--u)*1.2);color:#8a8aa0;text-align:center}
#srScr .srR small{display:block;font-family:var(--fs);font-size:.42em;letter-spacing:.1em;color:#9a9ab0}
#srScr.hit{background:radial-gradient(ellipse at 50% 45%,rgba(200,220,255,.5),rgba(10,14,30,.96) 70%)}
#srScr.hit .srR{color:#f4f6ff;text-shadow:0 0 calc(var(--u)*1.6) #9fe0ff}
#srScr .srX{position:absolute;right:calc(var(--u)*1.4);bottom:calc(var(--u)*1.2);font-family:var(--fs);font-size:max(10px,calc(var(--u)*1.05));color:#4a4e64;letter-spacing:.1em}
#srFlash{position:absolute;inset:0;z-index:41;pointer-events:none;background:#f6f8ff;opacity:0;transition:opacity .7s}
`; document.head.appendChild(st); })();
let SROLL=null;
function showSecretRoll(hit,done){
  if(SROLL) SROLL.end(true);
  const el=document.createElement('div'); el.id='srScr';
  el.innerHTML=`<div class="srK">隠</div><div class="srT">A door that shouldn't be there?</div><div class="srS">The hidden door · <b>1 in 100</b></div>
    <div class="srreel"><div class="srstrip" id="srStrip"></div><div class="srmk"></div></div><div class="srR" id="srRes"></div><div class="srX">E · skip</div>`;
  stage.appendChild(el);
  const strip=el.querySelector('#srStrip'), N=46, WI=38, tiles=[];
  const tile=h=>{ const d=document.createElement('div'); d.className='srt'+(h?' h':''); d.innerHTML=h?'<i>隠</i>???':'<i>上</i>The way up'; return d; };
  /* the strip shows the door now and then, and on a miss it sometimes stops one short of it */
  const near=!hit&&R()<.55?WI+(R()<.5?1:-1):-1;
  for(let i=0;i<N;i++){ const h=i===WI?hit:i===near?true:(Math.abs(i-WI)>2&&Math.random()<.06); const d=tile(h); strip.appendChild(d); tiles.push(d); }
  const reel=el.querySelector('.srreel'), reelW=reel.clientWidth, cw=tiles[1].offsetLeft-tiles[0].offsetLeft, tw=tiles[0].offsetWidth;
  const x0=Math.max(0,2*cw-reelW/2), target=WI*cw+(near>WI?.72:near>=0?.28:rnd(.15,.85))*tw-reelW/2;
  const dur=RM?700:2600, t0=performance.now(); let li=-1, ended=false, landed=false, raf=0;
  const res=el.querySelector('#srRes');
  const finish=()=>{ if(ended) return; ended=true; cancelAnimationFrame(raf); removeEventListener('keydown',key,true); el.remove(); const f=$('#srFlash'); if(f) f.remove(); SROLL=null; if(done) done(); };
  const land=()=>{ if(landed) return; landed=true; strip.style.transform=`translateX(${-target}px)`; tiles[WI].classList.add('won');
    if(hit){ el.classList.add('hit'); res.innerHTML='虚ろの庭 · The Hollow Garden<small>Foes ×2 · a reliquary at the end · Abyssal 1 in 100</small>'; AU.perfect(); AU.bell(); AU.abyssStat&&AU.abyssStat(); shake(3);
      const fl=document.createElement('div'); fl.id='srFlash'; stage.appendChild(fl); setTimeout(()=>{ fl.style.opacity='1'; },1500); setTimeout(finish,RM?1200:2400); }
    else { res.innerHTML='上 · The way up'; AU.tone('sine',220,196,.5,.06,.4); setTimeout(finish,RM?400:900); } };
  const step=now=>{ const p=Math.min(1,(now-t0)/dur), e=1-Math.pow(1-p,4), x=x0+(target-x0)*e; strip.style.transform=`translateX(${-x}px)`;
    const idx=Math.floor((x+reelW/2)/cw); if(idx!==li){ li=idx; AU.tick(); } if(p<1) raf=requestAnimationFrame(step); else land(); };
  const key=ev=>{ const k=ev.key.length===1?ev.key.toLowerCase():ev.key; if(k==='e'||k==='Enter'||k===' '||k==='Escape'){ ev.preventDefault(); ev.stopImmediatePropagation(); if(!landed) land(); else finish(); } };
  addEventListener('keydown',key,true); el.onclick=()=>{ if(!landed) land(); else finish(); };
  AU.spin&&AU.spin(); raf=requestAnimationFrame(step);
  SROLL={end:(quiet)=>{ if(quiet){ done=null; } finish(); }}; }

/* ---------- the Hollow Reliquary: fixed odds, its own look ---------- */
(function(){ const o=oddsW; oddsW=function(w,mf){ return w===CW[4]?w.slice():o(w,mf); }; })();
(function(){ const o=playChestCine; playChestCine=function(tier,rar,done){ if(tier!==4) return o(tier,rar,done); const g2=CHEST_GLOW[2]; CHEST_GLOW[2]=CHEST_GLOW[4]; try{ return o(2,rar,done); } finally{ CHEST_GLOW[2]=g2; } }; })();
(function(){ const o=showCase; showCase=function(tier,ilvl,win,onClose){ o(tier,ilvl,win,onClose); if(tier===4) $('#caseSub').textContent='THE HOLLOW GARDEN · SECRET'; }; })();
(function(){ const o=findInteract; findInteract=function(){ const b=o(); if(b&&b.o&&b.o.tier===4&&typeof b.txt==='string') b.txt=b.txt.replace('undefined','The Hollow Reliquary'); return b; }; })();
(function(){ const o=drawChest; drawChest=function(c,ch){ if(ch.tier!==4) return o(c,ch); const op=ch.open;
  rect(c,-11,-13,22,13,'#a8a294'); rect(c,-11,-13,22,1,'#d8d2c4'); rect(c,-11,-2,22,2,'#5e5a52'); rect(c,9,-12,2,10,'#7e786c'); rect(c,-11,-12,1,10,'#c4beb0');
  rect(c,-11,-8,22,2,'#c89a30'); rect(c,-11,-8,22,1,'#f0cc68'); rect(c,-7,-13,2,12,'#c89a30'); rect(c,5,-13,2,12,'#c89a30'); rect(c,-8,-12,1,3,'#e0bc58'); rect(c,-7,-10,1,2,'#e0bc58'); rect(c,-6,-9,2,1,'#e0bc58'); rect(c,4,-6,1,3,'#e0bc58'); rect(c,5,-4,2,1,'#e0bc58'); rect(c,6,-3,1,2,'#e0bc58');
  rect(c,-11,-13,2,2,'#d4ac48'); rect(c,9,-13,2,2,'#d4ac48'); rect(c,-11,-2,2,2,'#d4ac48'); rect(c,9,-2,2,2,'#d4ac48');
  if(!op){ rect(c,-12,-20,24,7,'#b4aea0'); rect(c,-12,-20,24,1,'#e4dece'); rect(c,-12,-14,24,1,'#5e5a52'); rect(c,-7,-20,2,7,'#c89a30'); rect(c,5,-20,2,7,'#c89a30'); rect(c,-3,-17,6,6,'#c89a30'); rect(c,-2,-16,4,4,'#1a2a40'); rect(c,-1,-15,2,2,'#7fe0ff'); }
  else { rect(c,-12,-30,24,4,'#f3efe6'); rect(c,-12,-30,24,1,'#ffffff'); rect(c,-11,-13,22,2,'#0c1020'); } }; })();

/* ---------- the last chamber drops the reliquary instead of the usual one ---------- */
(function(){ const o=finalCleared; finalCleared=function(a){ o(a); if(!L||!L.def||!L.def.secret) return;
  const c=chests.slice().reverse().find(x=>x.tier===1&&x.falling); if(c) c.tier=4; else chests.push({x:(a.ox+RW/2)*T,y:(a.oy+1)*T,tier:4,open:false,t:0,falling:true,vy:0,floorY:(a.oy+14)*T});
  toast('Something white falls out of the moonlight.'); }; })();

/* ---------- the look: porcelain stone mended with gold, a cracked moon, lanterns, petals that fall up ---------- */
(function(){ const o=bakeLevel; bakeLevel=function(Lv,pl){ const c=o(Lv,pl); if(Lv.env!=='hollow') return c; const g=c.getContext('2d');
  const tl=(x,y)=>(x<0||x>=Lv.w||y<0||y>=Lv.h)?1:Lv.g[y][x];
  for(let y=0;y<Lv.h;y++) for(let x=0;x<Lv.w;x++){ const v=Lv.g[y][x], px=x*T, py=y*T;
    if(v===1){ const open=tl(x,y-1)!==1||tl(x,y+1)!==1||tl(x-1,y)!==1||tl(x+1,y)!==1;
      if(!open){ g.fillStyle='rgba(6,10,28,.55)'; g.fillRect(px,py,16,16); continue; }
      if(hsh(x*5,y*11)>.72){ /* kintsugi: a crack mended with gold */ let cx=px+ri(1,14), cy=py; g.fillStyle='#d9b24c'; for(let k=0;k<16;k++){ g.fillRect(cx,cy,1,1); if(R()<.3) g.fillRect(cx+1,cy,1,1); cx=clamp(cx+ri(-1,1),px,px+15); cy++; } g.fillStyle='rgba(255,244,190,.8)'; g.fillRect(px+ri(2,13),py+ri(2,13),1,1); }
      if(tl(x,y-1)===0){ g.fillStyle='#ffffff'; g.fillRect(px,py,16,1); if(hsh(x,y*3)>.6){ g.fillStyle='#e9a8c0'; g.fillRect(px+ri(1,13),py-1,2,1); } if(hsh(x*7,y)>.85){ g.fillStyle='#9fd8a8'; g.fillRect(px+ri(2,12),py-3,1,3); g.fillRect(px+ri(2,12),py-2,1,2); } } }
    else if(v===2){ g.clearRect(px,py,16,6); g.fillStyle='#f4f1ea'; g.fillRect(px,py,16,4); g.fillStyle='#ffffff'; g.fillRect(px,py,16,1); g.fillStyle='#7d8aa0'; g.fillRect(px,py+4,16,1); g.fillStyle='#d4ac48'; if(!(x&1)) g.fillRect(px+7,py+1,2,2); }
    else if(v===3){ g.clearRect(px,py,16,16); g.fillStyle='#0b1226'; g.fillRect(px,py+12,16,4);
      for(let i=0;i<4;i++){ const sx=px+i*4; g.fillStyle='#8fd8f0'; g.beginPath(); g.moveTo(sx,py+13); g.lineTo(sx+2,py+2+(i%2)*3); g.lineTo(sx+4,py+13); g.fill(); g.fillStyle='#e8fbff'; g.fillRect(sx+2,py+4+(i%2)*3,1,4); } } }
  /* a vermilion gate stands over the way out */
  if(Lv.exit){ const ex=Lv.exit.x*T+8, ey=Lv.exit.y*T; g.fillStyle='#b8321e'; g.fillRect(ex-34,ey-96,6,96); g.fillRect(ex+28,ey-96,6,96); g.fillRect(ex-38,ey-84,76,4);
    g.fillStyle='#d0402a'; g.beginPath(); g.moveTo(ex-46,ey-100); g.quadraticCurveTo(ex,ey-94,ex+46,ey-100); g.lineTo(ex+44,ey-94); g.quadraticCurveTo(ex,ey-89,ex-44,ey-94); g.fill();
    g.fillStyle='#1a1418'; g.fillRect(ex-46,ey-102,92,2); g.fillStyle='#d4ac48'; g.fillRect(ex-4,ey-92,8,7); }
  return c; }; })();
(function(){ const o=bakeBG; bakeBG=function(pl){ if(pl!==PALS.hollow) return o(pl);
  const far=document.createElement('canvas'); far.width=960; far.height=320; const f=far.getContext('2d');
  let gr=f.createLinearGradient(0,0,0,320); gr.addColorStop(0,'#02030a'); gr.addColorStop(.6,'#101d44'); gr.addColorStop(1,'#1c2e5c'); f.fillStyle=gr; f.fillRect(0,0,960,320);
  for(let i=0;i<260;i++){ const a=rnd(.15,.8); f.fillStyle=`rgba(220,230,255,${a.toFixed(2)})`; const x=ri(0,959), y=ri(0,230); f.fillRect(x,y,1,1); if(a>.72){ f.fillStyle=`rgba(200,220,255,${(a*.35).toFixed(2)})`; f.fillRect(x-1,y,3,1); f.fillRect(x,y-1,1,3); } }
  for(let b=0;b<3;b++){ f.strokeStyle=`rgba(${b?120:90},${b?255:200},${b?220:255},.07)`; f.lineWidth=18-b*5; f.beginPath(); f.moveTo(-20,60+b*22); f.bezierCurveTo(260,10+b*30,520,120-b*20,980,40+b*25); f.stroke(); }
  const mx=640, my=105, mr=72; const hal=f.createRadialGradient(mx,my,mr*.8,mx,my,mr*2.6); hal.addColorStop(0,'rgba(200,220,255,.35)'); hal.addColorStop(1,'rgba(200,220,255,0)'); f.fillStyle=hal; f.fillRect(mx-mr*3,my-mr*3,mr*6,mr*6);
  const mg=f.createRadialGradient(mx-20,my-20,8,mx,my,mr); mg.addColorStop(0,'#ffffff'); mg.addColorStop(1,'#cfd6ee'); f.fillStyle=mg; f.beginPath(); f.arc(mx,my,mr,0,Math.PI*2); f.fill();
  f.fillStyle='rgba(150,160,200,.18)'; for(let i=0;i<9;i++){ f.beginPath(); f.arc(mx+rnd(-45,45),my+rnd(-45,45),rnd(4,12),0,Math.PI*2); f.fill(); }
  f.strokeStyle='#d9b24c'; f.lineWidth=2; for(let k=0;k<3;k++){ f.beginPath(); let x=mx+rnd(-30,30), y=my-mr+4; f.moveTo(x,y); while(y<my+mr-6){ x+=rnd(-9,9); y+=rnd(6,12); f.lineTo(x,y); } f.stroke(); }
  f.fillStyle='#0a1330'; for(let i=0;i<6;i++){ const ix=i*170+rnd(0,60), iy=rnd(150,210), iw=rnd(60,120); f.beginPath(); f.moveTo(ix,iy); f.lineTo(ix+iw,iy); f.lineTo(ix+iw*.6,iy+rnd(30,60)); f.lineTo(ix+iw*.3,iy+rnd(20,50)); f.fill(); f.fillRect(ix+iw*.2,iy-6,iw*.6,6); for(let k=0;k<4;k++) f.fillRect(ix+rnd(10,iw-10),iy+10,1,rnd(10,40)); }
  const lake=f.createLinearGradient(0,262,0,320); lake.addColorStop(0,'#1a2a58'); lake.addColorStop(1,'#060a1c'); f.fillStyle=lake; f.fillRect(0,262,960,58);
  for(let y=266;y<318;y+=3){ const w=rnd(20,70)*(1-(y-266)/60); f.fillStyle=`rgba(230,236,255,${(.35-(y-266)/200).toFixed(2)})`; f.fillRect(mx-w/2+rnd(-6,6),y,w,1); }
  const mid=document.createElement('canvas'); mid.width=1200; mid.height=320; const m=mid.getContext('2d'); const dk='#0b1230';
  for(let i=0;i<3;i++){ const x=i*400+rnd(30,120); m.fillStyle=dk; m.fillRect(x,120,10,200); m.fillRect(x+110,120,10,200); m.fillRect(x-12,138,144,8);
    m.beginPath(); m.moveTo(x-26,112); m.quadraticCurveTo(x+60,122,x+146,112); m.lineTo(x+142,124); m.quadraticCurveTo(x+60,132,x-22,124); m.fill(); m.fillStyle='rgba(255,90,60,.12)'; m.fillRect(x,124,2,196); }
  for(let i=0;i<4;i++){ const x=i*300+rnd(150,260), by=320; m.fillStyle=dk; m.beginPath(); m.moveTo(x-8,by); m.quadraticCurveTo(x-2,by-80,x-30,by-150); m.lineTo(x-22,by-152); m.quadraticCurveTo(x+6,by-90,x+8,by); m.fill();
    for(let k=0;k<220;k++){ const a=R()*Math.PI*2, r=Math.sqrt(R())*60; m.fillStyle=pick(['rgba(255,214,230,.5)','rgba(255,255,255,.38)','rgba(240,190,215,.42)','rgba(200,150,190,.3)']); const px=x-30+Math.cos(a)*r*1.4, py=by-160+Math.sin(a)*r*.7; m.fillRect(px|0,py|0,ri(1,3),ri(1,2)); } }
  return {far,mid}; }; })();
(function(){ const o=drawWeather; const petals=[]; for(let i=0;i<90;i++) petals.push({x:Math.random()*W,y:Math.random()*H,z:.3+Math.random()*.7,s:Math.random()*10});
  drawWeather=function(){ if(!L||L.env!=='hollow') return o();
    for(const p of petals){ const x=((p.x-camR.x*p.z*.5+Math.sin(time*.8+p.s)*14+time*10*p.z)%W+W)%W, y=((p.y-time*(14+p.z*22)-camR.y*p.z*.3)%H+H)%H; const flip=Math.sin(time*3+p.s*5);
      if(p.s>9.2){ ectx.fillStyle=`rgba(255,220,130,${(.35+.35*Math.sin(time*4+p.s*7)).toFixed(2)})`; ectx.fillRect(x|0,y|0,1,1); continue; }
      ctx.fillStyle=p.s>5?'rgba(255,214,230,.85)':'rgba(255,255,255,.8)'; ctx.fillRect(x|0,y|0,flip>0?2:1,1); } }; })();
(function(){ const o=drawHazards; drawHazards=function(){ o(); if(!L||!L.lanterns) return;
  for(const l of L.lanterns){ const bob=Math.sin(time*1.4+l.ph)*3, sx=Math.round(l.x-camR.x), sy=Math.round(l.y-camR.y+bob); if(sx<-40||sx>W+40||sy<-40||sy>H+40) continue;
    rect(ctx,sx,sy-14,1,8,'#3a3a4a'); rect(ctx,sx-3,sy-6,7,9,'#f4efe2'); rect(ctx,sx-3,sy-6,7,1,'#c8402a'); rect(ctx,sx-3,sy+2,7,1,'#c8402a');
    const fl=.7+.3*Math.sin(time*6+l.ph*3); ectx.fillStyle=`rgba(190,235,255,${(.45*fl).toFixed(2)})`; ectx.fillRect(sx-2,sy-4,5,5); addLight(l.x,l.y+bob,90,.9*fl,.62,.85,1); }
  for(const c of chests) if(c.tier===4&&!c.open){ const gl=.5+.5*Math.sin(time*2); addLight(c.x,c.y-10,70,.45+gl*.25,.7,.9,1); emisAt(c.x,c.y,1,g=>{ g.fillStyle=`rgba(160,230,255,${(.35+gl*.45).toFixed(2)})`; g.fillRect(-1,-15,2,2); g.fillStyle=`rgba(255,215,120,${(.12+gl*.18).toFixed(2)})`; g.fillRect(-11,-8,22,1); });
    if(R()<.2) part({x:c.x+rnd(-12,12),y:c.y-rnd(0,16),vx:0,vy:-24,g:-8,life:.8,em:true,col:pick(['#e8fbff','#ffe6a0'])}); } }; })();
