'use strict';
/* Cosmetic, bounded, deterministic elemental effects. Never consume combat RNG. */
const ART_HIT_LIMIT=36, ART_HIT_COOLDOWN=.075;
let artHitSerial=0;const ART_HIT_TIMES=new WeakMap();
function artHandElement(h){const it=h==='off'?P.equip.off:P.equip.weapon;return artElement(it)||Object.keys(P.stats.elm&&P.stats.elm[h]||{}).find(k=>P.stats.elm[h][k]>0)||null;}
function artImpact(c,k,x,y,age,seed=0,scale=1,dir=1){
 const E=ART_ECOL[k]||ART_ECOL.bone,a=clamp(age,0,1),fade=1-a;
 // Stable per-particle variation: organic motion without consuming combat RNG.
 const noise=i=>{const n=Math.sin((seed+1)*127.1+i*311.7)*43758.5453;return n-Math.floor(n);};
 c.save();c.translate(Math.round(x),Math.round(y));c.scale(scale,scale);c.globalAlpha*=Math.min(1,fade*2.4);
 const r=(col,X,Y,w,h)=>pxRect(c,col,X,Y,w,h),line=(col,X,Y,A,B,w)=>pxLine(c,col,X,Y,A,B,w),p=(col,pts)=>pxPoly(c,col,pts);
 if(k==='cold'){
  const reach=4+Math.sqrt(a)*18;
  for(let i=0;i<(RM?4:8);i++){const t=i*Math.PI/4+(seed%7)*.13,dx=Math.cos(t),dy=Math.sin(t),X=Math.round(dx*reach),Y=Math.round(dy*reach);p(E[0],[[X-dx*5,Y-dy*5],[X-dy*2,Y+dx*2],[X+dx*4,Y+dy*4],[X+dy,Y-dx]]);line(E[1],X-dx*3,Y-dy*3,X+dx*3,Y+dy*3);}
  if(a<.22){r(E[1],-3,0,7,1);r(E[1],0,-3,1,7);}
 }else if(k==='fire'){
  const lift=a*18,flare=Math.sin(Math.PI*Math.min(1,a*1.5)),height=15+flare*21;
  p('#a84828',[[-8,4-lift],[-10,-5-lift],[-5,-13-lift],[-5,-height*.7-lift],[-1,-height-lift],[2,-height*.55-lift],[7,-height*.82-lift],[6,-8-lift],[10,-3-lift],[5,5-lift]]);
  p(E[0],[[-6,2-lift],[-5,-9-lift],[-2,-height*.75-lift],[1,-height*.45-lift],[4,-height*.6-lift],[5,-5-lift],[2,4-lift]]);
  p(E[1],[[-3,2-lift],[-2,-7-lift],[0,-height*.42-lift],[2,-6-lift],[2,3-lift]]);
  for(let i=0;i<(RM?2:6);i++){const X=(noise(i)-.5)*17+a*(noise(i+12)-.5)*10,Y=-7-noise(i+7)*16-a*33;r(i%2?E[0]:E[1],X,Y,1,2);}
 }else if(k==='shock'){
  c.scale(dir<0?-1:1,1);const head=-20+Math.min(1,a*3)*56,tail=Math.max(-26,head-39),step=Math.floor(a*9);
  let last=[tail,0];for(let i=1;i<=7;i++){const X=tail+(head-tail)*i/7,Y=i===7?0:(noise(i+step*13)-.5)*15;line(E[0],...last,X,Y,3);line(E[1],...last,X,Y);if(i===3||i===5){const by=Y+(i===3?-1:1)*(8+noise(i+31)*8);line(E[0],X,Y,X+4,by);line(E[1],X+4,by,X+11,by-3);}last=[X,Y];}r('#fff5d6',head-1,-2,3,5);
 }else if(k==='water'){
  const spread=4+a*20,top=-Math.sin(Math.PI*a)*28;
  if(a<.65){p(E[0],[[-spread,5],[-spread-3,top*.5],[-spread*.5,top*.65],[-3,top],[0,top+8],[6,top-3],[spread*.5,top*.55],[spread+2,top*.45],[spread,5]]);p('#38647a',[[-spread+2,5],[-spread*.45,-2],[-2,top*.45],[3,top*.35],[spread*.5,-1],[spread-2,5]]);line(E[1],-spread,4,spread,4);}
  for(let i=0;i<(RM?4:10);i++){const vx=(noise(i)-.5)*44,vy=23+noise(i+10)*28,X=vx*a,Y=4-vy*a+38*a*a;line(E[0],X,Y,X-vx*.055,Y+3,2);r(E[1],X,Y,1,2);}
 }else if(k==='poison'){
  if(a<.42){line('#506135',-12,-7,11,-5,3);line(E[0],-9,-8,8,-7,2);}
  for(let i=0;i<(RM?3:8);i++){const delay=noise(i+20)*.28,t=Math.max(0,a-delay),X=(noise(i)-.5)*26,Y=-7+(16+noise(i+10)*27)*t*t*2,len=3+noise(i+3)*7;
   line('#506135',X,-7+Y*.25,X,Y,1);line(E[0],X,Y-len,X,Y,2);p(E[0],[[X,Y-2],[X+2,Y+1],[X+1,Y+4],[X-1,Y+4],[X-2,Y+1]]);r(E[1],X,Y,1,2);}
 }else if(k==='holy'){
  const width=Math.max(1,Math.round(Math.sin(Math.PI*a)*6)),bottom=-39+Math.min(1,a*4)*47;
  c.save();c.globalAlpha*=.35;r(E[0],-width-3,-43,width*2+7,bottom+43);c.restore();r(E[0],-width,-43,width*2+1,bottom+43);r(E[1],-Math.max(1,width-2),-43,Math.max(3,width*2-3),bottom+43);r('#fff7d8',0,-43,1,bottom+43);
  if(a>.18){line(E[1],-10,7,10,7);for(let i=0;i<(RM?2:5);i++){const X=(noise(i)-.5)*24,Y=5-a*22+noise(i+9)*13;r(E[1],X,Y-2,1,5);r(E[1],X-2,Y,5,1);}}
 }else if(k==='shadow'){
  for(let i=0;i<(RM?4:10);i++){const X=(noise(i)-.5)*(12+a*26)+Math.sin(a*5+i)*4,Y=5-noise(i+8)*13-a*(12+noise(i+21)*22),s=3+a*5+noise(i+11)*3;
   c.save();c.globalAlpha*=.45+noise(i+4)*.4;p(i%3===0?E[0]:'#302a3e',[[X-s,Y-s*.5],[X-s*.5,Y-s],[X+s*.4,Y-s],[X+s*.4,Y-s*.6],[X+s,Y-s*.6],[X+s,Y+s*.4],[X+s*.4,Y+s*.4],[X+s*.4,Y+s],[X-s*.6,Y+s],[X-s*.6,Y+s*.4],[X-s,Y+s*.4]]);line(i%3? '#52425f':E[1],X-s*.6,Y-s*.6,X-s*.2,Y-s*.6);c.restore();}
 }else if(k==='blood'){
  for(let i=0;i<(RM?8:20);i++){const t=i*2.39996+seed*.13,v=9+noise(i)*24,X=Math.cos(t)*v*a,Y=Math.sin(t)*v*a+24*a*a,sz=i%4===0?2:1;line(E[0],X-Math.cos(t)*4,Y-Math.sin(t)*4,X,Y,sz);p(i%3?E[0]:E[1],[[X,Y-2],[X+sz+1,Y],[X+sz,Y+3],[X-1,Y+2]]);}
 }else if(k==='wind'){
  for(let i=0;i<(RM?3:7);i++){const X=-30+a*63-noise(i)*11,Y=(i-3)*4+Math.sin(a*4+i)*2,len=10+noise(i+9)*15;line(E[0],X-len,Y+1,X-4,Y+1);line(E[1],X-len*.6,Y,X,Y);line(E[0],X,Y,X+3,Y-2);if(i%2===0)r(E[1],X+5,Y-2,2,1);}
 }else{
  // Uneven tumbling splinters, with gravity: a bone fracture rather than a halo.
  for(let i=0;i<(RM?4:9);i++){const vx=(noise(i)-.4)*40,vy=12+noise(i+8)*25,X=vx*a,Y=-vy*a+35*a*a,ang=noise(i+3)*6+a*(noise(i+5)-.5)*9,L=2+noise(i+12)*4,dx=Math.cos(ang)*L,dy=Math.sin(ang)*L;line('#716b58',X-dx,Y-dy,X+dx,Y+dy,3);line(E[0],X-dx,Y-dy,X+dx,Y+dy,2);line(E[1],X-dx,Y-dy,X+dx,Y+dy);if(i%3===0){r(E[0],X-dx-1,Y-dy,3,2);r(E[1],X+dx,Y+dy,2,2);}}
 }
 c.restore();
}

function spawnArtHit(e,k,dir=1){if(!ART_ECOL[k])return;let hits=ART_HIT_TIMES.get(e);if(!hits){hits={};ART_HIT_TIMES.set(e,hits);}if(time-(hits[k]??-100)<ART_HIT_COOLDOWN)return;hits[k]=time;if(fx.reduce((n,f)=>n+(f.artHit?1:0),0)>=ART_HIT_LIMIT)return;
 const x=e.x,y=e.y-e.h*.55,seed=artHitSerial++;fx.push({t:0,dur:RM?.28:.55,artHit:1,draw(f){const sx=x-camR.x,sy=y-camR.y;if(sx<-45||sx>W+45||sy<-45||sy>H+45)return;artImpact(ectx,k,sx,sy,f.t/f.dur,seed,1,dir);if(f.t<.15){const rgb=hex(ART_ECOL[k][0]);addLight(x,y,28,.35*(1-f.t/.15),...rgb.map(v=>v/255));}}});
}
{const old=applyElem;applyElem=function(e,k,d,dir){const alive=!e.dead;const v=old(e,k,d,dir);if(alive)spawnArtHit(e,k,dir);return v;};}
// Angular, branched lightning instead of a smooth Bezier ribbon.
zap=function(x0,y0,x1,y1,col,w){const dx=x1-x0,dy=y1-y0,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len,points=[[x0,y0]];for(let i=1;i<7;i++){const u=i/7,off=(i%2?1:-1)*Math.min(9,len*.12);points.push([x0+dx*u+nx*off,y0+dy*u+ny*off]);}points.push([x1,y1]);
 if(fx.reduce((n,f)=>n+(f.artArc?1:0),0)>=16)return;fx.push({t:0,dur:.25,artArc:1,draw(f){ectx.save();ectx.globalAlpha=1-f.t/f.dur;for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i];pxLine(ectx,col||'#aa9854',a[0]-camR.x,a[1]-camR.y,b[0]-camR.x,b[1]-camR.y,2);pxLine(ectx,'#fff1bd',a[0]-camR.x,a[1]-camR.y,b[0]-camR.x,b[1]-camR.y);if(i===3)pxLine(ectx,'#d2be78',b[0]-camR.x,b[1]-camR.y,b[0]-camR.x+nx*8,b[1]-camR.y+ny*8);}ectx.restore();}});
};
function artSwingTrail(g,a0,a1,radius,strength,hand){const el=artHandElement(hand||'main'),E=el?ART_ECOL[el]:['#948e80','#ded4b9'],delta=clamp(a1-a0,-Math.PI*1.8,Math.PI*1.8),n=Math.max(2,Math.ceil(Math.abs(delta)*radius/3));g.save();g.globalAlpha*=strength*(RM?.45:.75);
 for(let i=1;i<=n;i++){const q=(i-1)/n,r=i/n,ang=a0+delta*q,b=a0+delta*r,rad=radius-(el==='wind'?i%3:0);pxLine(g,E[1],Math.cos(ang)*rad,Math.sin(ang)*rad,Math.cos(b)*rad,Math.sin(b)*rad);if(i%3!==0)pxLine(g,E[0],Math.cos(ang)*(rad-2),Math.sin(ang)*(rad-2),Math.cos(b)*(rad-2),Math.sin(b)*(rad-2));if(el&&i%4===0){const rr=rad+2+(i%3);pxRect(g,E[0],Math.cos(b)*rr,Math.sin(b)*rr,el==='bone'?2:1,el==='fire'?3:1);}}
 g.restore();
}
function artGearGlow(pose,br){if(P.dead)return;for(const h of ['main','off']){const it=h==='off'?P.equip.off:P.equip.weapon;if(!it||it.base.cls==='shield'||h==='off'&&!offActive())continue;const el=artElement(it);if(!el)continue;const E=ART_ECOL[el],anchors=artWeaponAnchors(it.base);emisAt(P.x,P.y,P.face,g=>{g.translate((h==='off'?-1:1)+armExt(h),-18+br);g.rotate(h==='off'?P.offA:P.swordA);g.globalAlpha=.38;for(let i=0;i<anchors.length;i++){const [x,y]=anchors[i];pxRect(g,E[i%2],x,y,1,1);if(P.attack&&P.attack.hand===h&&i===1&&Math.floor(time*12)%2===0)pxRect(g,E[1],x,y-2,1,1);}},pose);}}
{const old=gearFX;gearFX=function(pose,br){old(pose,br);artGearGlow(pose,br);};}
drawSts=function(){for(const e of enemies){if(e.dead||!e.sts)continue;const ks=Object.keys(e.sts).filter(k=>e.sts[k].t>0),sx=Math.round(e.x-camR.x),sy=Math.round(e.y-e.h-(e.boss?14:5)-camR.y);if(sx<-40||sx>W+40)continue;let xx=sx-ks.length*2;
 for(const k of ks){pxRect(ectx,PIP[k]||'#eee4c9',xx,sy,2,1);const n=e.sts[k].n||0;for(let j=1;j<n;j++)pxRect(ectx,PIP[k],xx,sy-j*2,1,1);xx+=4;}
 if(hasSt(e,'frozen')){const w=e.w/2,h=e.h,yy=e.y-camR.y;for(const s of [-1,1]){pxPoly(ctx,'#508397',[[sx+s*w,yy],[sx+s*(w+3),yy-7],[sx+s*(w-1),yy-h*.7],[sx+s*(w-3),yy-8]]);pxLine(ectx,'#c5e8e2',sx+s*w,yy-1,sx+s*(w-1),yy-h*.65);}pxPoly(ctx,'#8dbbc4',[[sx-3,yy],[sx,yy-7],[sx+3,yy]]);}
 }};
