'use strict';
/* ===== jackpot 大当たり (v22): good loot pays out like a pokie =====
   Every stat that lands High or better strikes a charm, and each one in the same reveal rings a step higher up the
   scale, so a run of good rolls climbs. When the reveal ends, the item is scored (rarity plus its Max and Abyssal
   grades) and the win is celebrated to match:
     1 Good      Rare-class        a three-note charm, sparkles off the tooltip
     2 Great     Legendary-class   a five-note run, coins burst from the tooltip, the screen's edge glows its colour
     3 Big win   Unique-class      marquee bulbs chase round the screen, coins rain, a banner, the bell trill
     4 Jackpot   any Abyssal       all of it, longer, in abyss red and purple, with drums
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
  if(vt>=3){ jpBulbs(ab?3.2*1.5:3.0,ab); jpRain(ab?140:(drop?30:70),ab); jpBanner(ab?'JACKPOT':'BIG WIN',ab?'奈落の大当たり':'大当たり',ab?'#ff4a3d':col,ab); shake(ab?7:4); }
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
#jpfx .ban{position:absolute;left:50%;top:19%;transform:translate(-50%,-50%) scale(.2);text-align:center;font-family:var(--fs);color:var(--c);letter-spacing:.14em;
  text-shadow:0 0 calc(var(--u)*1.4) var(--c),calc(var(--u)*.3) calc(var(--u)*.3) 0 #0e0a0a;animation:jpBan var(--d) cubic-bezier(.2,1.4,.3,1) forwards;white-space:nowrap}
#jpfx .ban b{display:block;font-size:calc(var(--u)*var(--s));font-weight:700;line-height:1}
#jpfx .ban i{display:block;font-style:normal;font-family:'Shippori Mincho',serif;font-weight:800;font-size:calc(var(--u)*var(--s)*.42);color:#ece6d8;margin-top:calc(var(--u)*.4)}
#jpfx .ban.ab b{animation:jpAb .5s steps(1) infinite}
@keyframes jpAb{0%{color:#ff4a3d}50%{color:#b04aff}}
@keyframes jpBan{0%{transform:translate(-50%,-50%) scale(.2);opacity:0}12%{transform:translate(-50%,-50%) scale(1.08);opacity:1}20%{transform:translate(-50%,-50%) scale(1)}80%{opacity:1}100%{transform:translate(-50%,-62%) scale(1);opacity:0}}
.jpg{animation:jpRow .7s ease-out}
@keyframes jpRow{0%{box-shadow:0 0 0 0 rgba(255,207,106,0)}25%{box-shadow:0 0 calc(var(--u)*1.2) calc(var(--u)*.2) rgba(255,207,106,.75)}100%{box-shadow:0 0 0 0 rgba(255,207,106,0)}}
@media (prefers-reduced-motion: reduce){.jpg{animation:none}}`; document.head.appendChild(st); }
function jpRect(el){ const s=stage.getBoundingClientRect(), r=el.getBoundingClientRect(); return {x:r.left-s.left,y:r.top-s.top,w:r.width,h:r.height,sw:s.width,sh:s.height}; }
function jpSparks(el,n,col){ jpCss(); const L=jpLayer(), r=jpRect(el); for(let i=0;i<n;i++){ const d=document.createElement('div'); d.className='spk';
    const side=i%4, x=side===0?r.x+Math.random()*r.w:side===1?r.x+r.w:side===2?r.x+Math.random()*r.w:r.x, y=side===0?r.y:side===1?r.y+Math.random()*r.h:side===2?r.y+r.h:r.y+Math.random()*r.h;
    const a=Math.atan2(y-(r.y+r.h/2),x-(r.x+r.w/2))+(Math.random()-.5)*.6, dist=20+Math.random()*50;
    d.style.cssText=`left:${x}px;top:${y}px;--c:${col};--dx:${Math.cos(a)*dist}px;--dy:${Math.sin(a)*dist}px;animation-delay:${Math.random()*.15}s`; L.appendChild(d); setTimeout(()=>d.remove(),1000); } }
function jpGlow(col,dur){ jpCss(); const L=jpLayer(); const d=document.createElement('div'); d.className='glow'; d.style.cssText=`--c:${col};--d:${dur}s`; L.appendChild(d); setTimeout(()=>d.remove(),dur*1000+50); }
function jpBanner(big,jp,col,ab){ jpCss(); const L=jpLayer(); L.querySelectorAll('.ban').forEach(b=>b.remove()); const d=document.createElement('div'); d.className='ban'+(ab?' ab':'');
  d.style.cssText=`--c:${col};--d:${ab?3.6:2.6}s;--s:${ab?9:7}`; d.innerHTML=`<b>${big}</b><i>${jp}</i>`; L.appendChild(d); setTimeout(()=>d.remove(),(ab?3.6:2.6)*1000+50); }
/* coins and bulbs share one pixel canvas at half the game's grid, so they sit with the art */
function jpCanvas(){ jpCss(); const L=jpLayer(), c=$('#jpcv'); const w=W, h=H; if(c.width!==w){ c.width=w; c.height=h; } return c; }
function jpBurst(el,n,ab){ const c=jpCanvas(); const r=el?jpRect(el):{x:c.width,y:c.height*.4,w:0,h:0,sw:1,sh:1}; const k=c.width/(r.sw||stage.clientWidth||1);
  const cx=(r.x+r.w/2)*k, cy=(r.y+r.h*.35)*k; for(let i=0;i<n;i++){ const a=-Math.PI/2+(Math.random()-.5)*2.4, sp=90+Math.random()*170;
    JP.coins.push({x:cx+(Math.random()-.5)*r.w*k*.6,y:cy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,ph:Math.random()*6,ab,life:1.6+Math.random()*.6}); } jpRun(); }
function jpRain(n,ab){ const c=jpCanvas(); for(let i=0;i<n;i++) JP.coins.push({x:Math.random()*c.width,y:-8-Math.random()*c.height*.9,vx:(Math.random()-.5)*20,vy:60+Math.random()*80,ph:Math.random()*6,ab,life:6,rain:1}); jpRun(); }
function jpBulbs(dur,ab){ JP.bulbs={t:0,dur,ab}; jpRun(); }
function jpRun(){ if(JP.raf) return; let last=performance.now(); const step=now=>{ const dt=Math.min(.05,(now-last)/1000); last=now; const c=$('#jpcv'); if(!c){ JP.raf=0; return; }
    const g=c.getContext('2d'), w=c.width, h=c.height; g.clearRect(0,0,w,h);
    /* marquee bulbs round the edge: every third lit, the lit ones chasing clockwise */
    const B=JP.bulbs; if(B){ B.t+=dt; const sp=7, per=2*(w+h)/sp|0, off=(B.t*10)|0, fade=Math.min(1,(B.dur-B.t)/.4,B.t/.15);
      for(let i=0;i<per;i++){ const d=i*sp; let x,y; if(d<w){ x=d; y=2; } else if(d<w+h){ x=w-3; y=d-w; } else if(d<2*w+h){ x=w-(d-w-h); y=h-3; } else { x=2; y=h-(d-2*w-h); }
        const lit=(i+off)%3===0; g.globalAlpha=fade*(lit?1:.28); g.fillStyle=lit?(B.ab?(((i+off)/3|0)%2?'#ff4a3d':'#b04aff'):(((i+off)/3|0)%2?'#ffcf6a':'#fff3c4')):'#5a3a20'; g.fillRect(Math.round(x)-1,Math.round(y)-1,3,3); }
      g.globalAlpha=1; if(B.t>B.dur) JP.bulbs=null; }
    /* coins: pixel discs that spin (their width breathes) and bounce once off the floor */
    for(const q of JP.coins){ q.life-=dt; q.vy+=(q.rain?60:420)*dt; q.x+=q.vx*dt; q.y+=q.vy*dt; q.ph+=dt*9; if(!q.rain&&q.y>h-6&&q.vy>0){ q.y=h-6; q.vy*=-.35; q.vx*=.6; }
      const wd=Math.max(1,Math.round(Math.abs(Math.cos(q.ph))*4)); g.globalAlpha=Math.min(1,q.life/.4); g.fillStyle=q.ab?'#c0283a':'#c8962e'; g.fillRect(Math.round(q.x-wd/2),Math.round(q.y)-2,wd,5);
      g.fillStyle=q.ab?'#ff7a8a':'#ffe08a'; if(wd>2) g.fillRect(Math.round(q.x-wd/2),Math.round(q.y)-2,1,2); }
    g.globalAlpha=1; JP.coins=JP.coins.filter(q=>q.life>0&&q.y<h+10);
    if(JP.bulbs||JP.coins.length) JP.raf=requestAnimationFrame(step); else { JP.raf=0; g.clearRect(0,0,w,h); } };
  JP.raf=requestAnimationFrame(step); }

/* ---------- hooks ---------- */
(function(){ const o=statReel; statReel=function(it,box,done,opt){ JP.streak=0; const fast=!!(opt&&opt.fast);
  return o(it,box,function(){ try{ JP.win(it,fast?'drop':'chest',box); }catch(e){ console.warn('jackpot',e); } if(done) return done.apply(this,arguments); },opt); }; })();
if(typeof settle==='function'){ const o=settle; settle=function(sy,bet){ const g0=P.gold; o(sy,bet); const won=P.gold-g0; if(won>bet) try{ JP.cash(won/bet,sy[0]); }catch(e){} }; }
/* the pause menu switch */
(function(){ const o=openPause; openPause=function(){ o(); let cb=$('#pWins'); if(!cb){ const sc=$('#pScare'); const lab=sc&&sc.closest('label'); if(lab){ const l=document.createElement('label'); l.className='chk'; l.innerHTML='Big-win effects <input type="checkbox" id="pWins">'; lab.parentNode.insertBefore(l,lab.nextSibling); cb=$('#pWins'); } }
  if(cb){ cb.checked=SETTINGS.wins!==false; cb.onchange=()=>{ SETTINGS.wins=cb.checked; store.set('marrowdeep.settings',SETTINGS); }; } }; })();
