'use strict';
/* v41.2: the last smooth-vector combat effects, redrawn in the gameplay art pass's pixel style.
   ChatGPT's pass (artfx.js) converted swing trails and hit impacts but not these, and with a Shadow weapon they were
   what you saw: a 50 px glowing ring on every Shadow kill, a red ring on Red Harvest, soft discs for steam, and the
   Shade's swing as a smooth band. Each is swapped for a stepped pixel version in the same place and timing; damage,
   sound and particles are untouched. */
function pxRing(g,col,cx,cy,r,gap,phase){ r=Math.max(1,r); const n=Math.max(10,Math.round(r*2*Math.PI/2)); cx=Math.round(cx); cy=Math.round(cy);
  for(let i=0;i<n;i++){ if(gap&&((i+(phase||0))%gap)===0) continue; const a=i/n*Math.PI*2; pxRect(g,col,cx+Math.cos(a)*r,cy+Math.sin(a)*r,1,1); } }
/* a burst: a broken ring plus a few shards thrown outward */
function pxBurst(g,E,cx,cy,q,R,seed){ const k=1-q; g.save(); g.globalAlpha*=k;
  pxRing(g,E[1],cx,cy,3+R*q,3,0); if(q<.7) pxRing(g,E[0],cx,cy,2+R*.75*q,4,1);
  for(let i=0;i<8;i++){ const a=(i+((seed||0)%7)*.13)*Math.PI/4, d=4+R*q*(.8+.3*((i*37+(seed||0))%5)/5);
    pxLine(g,i%2?E[0]:E[1],cx+Math.cos(a)*(d-3),cy+Math.sin(a)*(d-3),cx+Math.cos(a)*d,cy+Math.sin(a)*d); }
  g.restore(); }
/* swap the effect a call just pushed (the old ring) for a pixel one */
function swapLastFx(n0,make){ if(fx.length>n0){ const old=fx[fx.length-1]; fx[fx.length-1]=make(old); } }

/* Shadow kill: the old 50 px purple ring */
(function(){ const o=DEATHS.blast; DEATHS.blast=function(e,dir){ const n0=fx.length, x=e.x, y=e.y-e.h/2, seed=Math.round(e.x)|0; o(e,dir);
  swapLastFx(n0,()=>({t:0,dur:.4,draw(f){ const q=f.t/f.dur; pxBurst(ectx,ART_ECOL.shadow,x-camR.x,y-camR.y,q,30,seed); }})); }; })();

/* Red Harvest: the old red ring the size of the blast */
(function(){ const o=bloodBloom; bloodBloom=function(x,y,dmg,r,src){ const n0=fx.length, seed=Math.round(x)|0; const out=o(x,y,dmg,r,src);
  swapLastFx(n0,()=>({t:0,dur:.35,draw(f){ const q=f.t/f.dur; pxBurst(ectx,ART_ECOL.blood,x-camR.x,y-camR.y,q,r*.8,seed); if(q<.3) addLight(x,y,r,(1-q/.3)*.6,1,.15,.1); }})); return out; }; })();

/* Steam (fire with water or cold): the blinding cloud as stepped puffs */
(function(){ const o=steamPuff; steamPuff=function(e,r,blind){ const n0=fx.length, x=e.x, y=e.y-e.h/2; const out=o(e,r,blind); if(!blind) return out;
  swapLastFx(n0,old=>({t:0,dur:old.dur,draw(f){ const k=Math.min(1,f.t*5)*Math.min(1,(f.dur-f.t)/.5); ctx.save(); ctx.globalAlpha=.2*k;
    for(let i=0;i<7;i++){ const a=i*.9+f.t*.7, cx=Math.round(x-camR.x+Math.cos(a)*r*.5), cy=Math.round(y-camR.y+Math.sin(a)*r*.3), q=r*.55;
      pxPoly(ctx,'#c8c8cc',[[cx-q,cy],[cx-q*.6,cy-q*.6],[cx,cy-q*.75],[cx+q*.6,cy-q*.5],[cx+q,cy],[cx+q*.5,cy+q*.5],[cx-q*.5,cy+q*.5]]); }
    ctx.restore(); }})); return out; }; })();

/* the Shade's swing: same stepped trail as yours, in Shadow purple */
function artShadeTrail(g,a0,a1,R){ const E=ART_ECOL.shadow, d=clamp(a1-a0,-Math.PI*1.8,Math.PI*1.8), n=Math.max(2,Math.ceil(Math.abs(d)*R/3)); g.save(); g.globalAlpha*=.7;
  for(let i=1;i<=n;i++){ const p=a0+d*(i-1)/n, q=a0+d*i/n; pxLine(g,E[1],Math.cos(p)*R,Math.sin(p)*R,Math.cos(q)*R,Math.sin(q)*R); if(i%3) pxLine(g,E[0],Math.cos(p)*(R-3),Math.sin(p)*(R-3),Math.cos(q)*(R-3),Math.sin(q)*(R-3)); }
  g.restore(); }
