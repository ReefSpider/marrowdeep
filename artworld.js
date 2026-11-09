'use strict';
/* Environment detail is baked once. Coordinate hashes never advance gameplay RNG. */
function envHash(x,y,s=0){let n=Math.imul(x+37,374761393)^Math.imul(y+71,668265263)^Math.imul(s+11,1274126177);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296;}
function envWood(g,x,y,w,kind='fixed',phase=0){
 const lift=kind==='lift',crumble=kind==='crumb',base=lift?'#493d33':'#59412d',hi=lift?'#887966':'#92714a',dark='#251e19';
 pxRect(g,base,x,y,w,4);pxRect(g,hi,x,y,w,1);pxRect(g,dark,x,y+4,w,2);
 for(let i=2;i<w-2;i+=8){const h=envHash(i,w);pxLine(g,h>.5?'#715337':'#382b20',x+i,y+2,x+Math.min(w-2,i+4),y+2);if(h>.6)pxRect(g,'#b09266',x+i,y+1,2,1);}
 for(let i=3;i<w-2;i+=16){pxRect(g,dark,x+i,y+1,2,3);pxRect(g,'#a6a08a',x+i,y+1,1,1);}
 if(lift){for(const i of [1,w-5]){pxRect(g,'#292b2d',x+i,y,4,6);pxRect(g,'#7c7c70',x+i,y,3,1);pxRect(g,'#a6a08a',x+i+1,y+3,1,1);}pxLine(g,'#6c6151',x+7,y+4,x+w-8,y+4);}
 if(crumble){for(let i=6;i<w-2;i+=11){pxLine(g,dark,x+i,y+1,x+i-2,y+3);pxRect(g,dark,x+i-2,y+3,1,2);}if(phase===1)pxRect(g,'#b49365',x+Math.floor(w/2),y,2,1);}
}
function envTerrain(c,Lv,pl){
 const g=c.getContext('2d'),lk=lookOf(Lv.def),look=Lv.def.look||Lv.env||'bone',mason=!lk||lk.mason,hi=lk?lk.top2:pl.hi,edge=lk?lk.edge:pl.mortar;
 const tile=(x,y)=>x<0||y<0||x>=Lv.w||y>=Lv.h?1:Lv.g[y][x];
 for(let y=0;y<Lv.h;y++)for(let x=0;x<Lv.w;x++){
  const v=tile(x,y),X=x*T,Y=y*T,h=envHash(x,y),top=tile(x,y-1)!==1,bottom=tile(x,y+1)!==1;
  if(v===2){envWood(g,X,Y,T);continue;}if(v!==1)continue;
  // Details stay in the existing collision silhouette; deep rock stays quiet.
  let depth=4;for(let d=1;d<4;d++)if(tile(x-d,y)!==1||tile(x+d,y)!==1||tile(x,y-d)!==1||tile(x,y+d)!==1){depth=d;break;}
  if(depth===4)continue;g.save();g.beginPath();g.rect(X,Y,T,T);g.clip();g.globalAlpha=depth===1?1:.4;
  if(mason){
   for(let row=0;row<2;row++){const yy=Y+row*8,offset=((y*2+row)&1)*8;
    for(let xx=X-offset;xx<X+16;xx+=16){pxLine(g,'rgba(224,209,180,.10)',xx+2,yy+1,xx+12,yy+1);pxRect(g,'rgba(0,0,0,.20)',xx+14,yy+2,1,5);if(envHash(xx,yy)>.64){pxLine(g,'rgba(0,0,0,.28)',xx+7,yy+2,xx+9,yy+4);pxLine(g,'rgba(0,0,0,.28)',xx+9,yy+4,xx+8,yy+6);pxRect(g,'rgba(240,220,185,.10)',xx+10,yy+4,1,2);}}
   }
   if(top){for(let i=3;i<16;i+=7){pxRect(g,'rgba(0,0,0,.25)',X+i,Y+1,1,2);pxRect(g,hi,X+i+1,Y+2,2,1);}if(h>.65)pxRect(g,'rgba(245,225,195,.18)',X+3,Y+1,5,1);}
   if((look==='slums'||look==='water')&&h>.5){for(let i=0;i<3;i++)pxRect(g,'rgba(65,86,48,.30)',X+2+i*4,Y+5+i,2,2);}
   if((look==='royal'||look==='palace')&&top&&x%4===0){pxRect(g,'#776038',X+7,Y+2,3,2);pxRect(g,'#b39a61',X+8,Y+2,1,1);}
  }else{
   if(h>.3){const yy=Y+7+Math.floor(h*5);pxLine(g,'rgba(0,0,0,.20)',X+1,yy,X+6,yy+1);pxLine(g,'rgba(0,0,0,.20)',X+6,yy+1,X+13,yy);pxLine(g,'rgba(238,216,175,.08)',X+2,yy-1,X+6,yy);}
   if(top&&(look==='meadow'||look==='fen'||look==='villages')&&h>.45){pxLine(g,edge,X+6,Y+4,X+7,Y+8);pxLine(g,edge,X+7,Y+8,X+5,Y+11);pxLine(g,edge,X+7,Y+7,X+10,Y+9);}
   if(look==='pass'||look==='ashes'){pxLine(g,'rgba(225,230,220,.13)',X+3,Y+9,X+8,Y+6);pxLine(g,'rgba(0,0,0,.25)',X+8,Y+6,X+12,Y+10);}
   if(top){pxRect(g,'rgba(0,0,0,.14)',X+Math.floor(h*10)+2,Y+3,3,1);if(look==='pass'){pxRect(g,'#f0f0e8',X+2,Y,5,1);pxRect(g,'#8999a5',X+11,Y+2,2,1);}}
  }
  if(bottom){pxRect(g,'rgba(0,0,0,.25)',X,Y+14,16,2);if(h>.5)pxRect(g,'rgba(206,190,158,.09)',X+4,Y+13,4,1);}
  g.restore();
 }
 // Existing gateway: joints, hinge plates and recessed jambs, no new doorway.
 if(Lv.exit){const X=Lv.exit.x*T+8,Y=Lv.exit.y*T,outer=lk?24:28,inner=lk?18:20;
  for(const side of [-1,1]){const xx=X+(side<0?-outer:inner);for(let yy=Y-58;yy<Y;yy+=9){pxRect(g,'rgba(0,0,0,.3)',xx,yy,5,1);pxRect(g,'rgba(228,210,175,.1)',xx,yy+1,4,1);}for(const yy of [Y-44,Y-18]){pxRect(g,'#292a29',xx+1,yy,3,5);pxRect(g,'#8b8371',xx+2,yy+1,1,1);}}
 }
 return c;
}
{const old=bakeLevel;bakeLevel=function(Lv,pl){return envTerrain(old(Lv,pl),Lv,pl);};}
function envBackdrop(bg,pl){
 const look=L.def.look||L.env||'bone',lk=lookOf(L.def),m=bg.mid.getContext('2d'),f=bg.far.getContext('2d');
 // Existing silhouettes receive recessed joints and sparse edge glints.
 // source-atop cannot turn empty air into a false platform or fill a window.
 m.save();m.globalCompositeOperation='source-atop';
 const organic=['meadow','fen','ashes','pass'].includes(look);
 if(organic){for(let x=4;x<1200;x+=17){const h=envHash(x,23),y=180+Math.floor(h*120);pxLine(m,'rgba(210,204,165,.12)',x,y,x+1,y+8);pxLine(m,'rgba(0,0,0,.14)',x+3,y+5,x+4,y+14);}}
 else{for(let y=48;y<320;y+=12)for(let x=((y/12)&1)*12;x<1200;x+=24){const h=envHash(x,y);if(h<.48)continue;pxLine(m,'rgba(0,0,0,.20)',x,y,x+18,y);pxRect(m,'rgba(0,0,0,.22)',x,y,1,8);pxLine(m,'rgba(226,206,170,.065)',x+2,y+1,x+14,y+1);}
  for(let x=20;x<1200;x+=60){pxRect(m,'rgba(232,212,180,.07)',x,40,1,260);pxRect(m,'rgba(0,0,0,.12)',x+3,40,2,260);}}
 m.restore();
 // Region-specific details follow the existing composition and subdued palette.
 if(look==='meadow'){f.save();f.globalAlpha=.22;for(let x=20;x<960;x+=80){const y=249+Math.round(Math.sin(x*.02)*3);pxLine(f,'#55614f',x,y,x+51,y-1);for(let j=0;j<3;j++)pxRect(f,'#55614f',x+j*24,y-4,1,9);}f.restore();}
 if(look==='fen'){m.save();m.globalAlpha=.5;for(const x of [180,620,1000]){pxLine(m,'#444638',x+2,110,x+3,245);for(let y=60;y<160;y+=34){pxLine(m,'#181b18',x,y,x-18,y-11);pxLine(m,'#181b18',x-18,y-11,x-25,y-24);}}m.restore();}
 if(look==='slums'){for(let i=0;i<12;i++){const x=i*80,h=120+(i*67)%90,y=320-h;pxRect(f,'rgba(0,0,0,.22)',x+51,y+15,3,h-15);for(let yy=y+33;yy<310;yy+=21){pxRect(f,'#171911',x+12,yy,5,7);pxRect(f,'rgba(115,104,55,.13)',x+13,yy+1,1,4);}pxLine(f,'rgba(162,135,90,.12)',x+5,y+1,x+65,y+1);}}
 if(look==='villages'){for(let i=0;i<10;i++){const x=i*120+10,y=300,h=14+(i%3)*3;pxLine(m,'#231d22',x+1,y-h+2,x+22,y-2);pxRect(m,'#231d22',x+11,y-h,1,h);pxRect(m,'#958167',x+4,y-h+4,1,3);pxRect(m,'#34282a',x+3,y-2,21,2);}}
 if(look==='fort'){for(const x of [100,520,900]){pxRect(m,'#383a3e',x+3,184,3,136);pxRect(m,'#aaa79b',x,180,40,1);for(let y=221;y<315;y+=24){pxRect(m,'#26272a',x+17,y,3,9);pxRect(m,'#6c665d',x+20,y,1,9);}}}
 if(look==='ashes'){f.save();f.globalAlpha=.35;for(let i=0;i<3;i++){const x=150+i*320;pxLine(f,'#a88e6a',x+15,205,x+8,250);pxLine(f,'#211d1b',x+18,219,x+23,227);pxLine(f,'#211d1b',x+23,227,x+18,239);}f.restore();}
 if(!lk){m.save();m.globalCompositeOperation='source-atop';for(let x=24;x<1200;x+=120){for(let y=96;y<290;y+=48){pxRect(m,'rgba(0,0,0,.22)',x,y,8,9);pxRect(m,'rgba(225,204,166,.09)',x,y,1,8);if(L.env==='fire')pxRect(m,'rgba(211,108,49,.16)',x+3,y+2,1,5);}}m.restore();}
 return bg;
}
{const old=bakeBG;bakeBG=function(pl){return envBackdrop(old(pl),pl);};}
/* Retain regional hues while reducing full-screen high-contrast checkerboards. */
dGrad=function(g,x0,y0,w,h,stops,px){px=px||1;const C=stops.map(hexRGB),id=g.getImageData(x0,y0,w,h),d=id.data;
 for(let y=0;y<h;y+=px){const f=y/Math.max(1,h-1)*(C.length-1),i=Math.min(C.length-2,f|0),t=f-i,band=t*6,base=Math.floor(band),blend=band-base;
  for(let x=0;x<w;x+=px){const next=blend>.7||(blend>.3&&RBAYER[((y/px)&3)*4+((x/px)&3)]/16<(blend-.3)/.4),u=Math.min(1,(base+(next?1:0))/6),col=C[i].map((v,j)=>Math.round(v+(C[i+1][j]-v)*u));
   for(let yy=y;yy<Math.min(h,y+px);yy++)for(let xx=x;xx<Math.min(w,x+px);xx++){const k=(yy*w+xx)*4;d[k]=col[0];d[k+1]=col[1];d[k+2]=col[2];d[k+3]=255;}
  }
 }g.putImageData(id,x0,y0);
};
// The original visibility/density semantics are preserved, with a quieter fog texture.
{const old=dFog;dFog=function(g,x,y,w,h,col,dens,px,seed){return old(g,x,y,w,h,col,dens*.65,px,seed);};}
{const old=drawChest;drawChest=function(c,ch){old(c,ch);const gold=ch.elite?'#dcc590':'#ad9663';if(ch.tier===0){for(const x of [-5,2]){pxLine(c,'#986c43',x,-10,x+1,-4);pxRect(c,'#312a25',x+1,-8,1,2);}pxRect(c,'#30383c',-10,-5,2,3);pxRect(c,'#a1a391',-10,-5,2,1);}
 else if(ch.tier===1){for(const s of [-1,1]){pxLine(c,gold,s*8,-12,s*6,-10);pxRect(c,'#d5c49a',s*7,-5,1,1);}pxRect(c,'#b6aa86',-1,-8,2,3);pxRect(c,'#38312b',0,-7,1,2);}
 else if(ch.tier===2){pxPoly(c,'#b9b09a',[[-3,-15],[2,-15],[4,-12],[2,-9],[-2,-9],[-4,-12]]);pxRect(c,'#28282c',-2,-13,2,2);pxRect(c,'#28282c',1,-13,2,2);pxRect(c,'#51483e',0,-11,1,1);for(const x of [-2,0,2])pxRect(c,'#ddd1b2',x,-9,1,1);for(const x of [-15,13]){pxRect(c,gold,x,-16,2,2);pxRect(c,gold,x,-4,2,2);}}
};}
{const old=relicDraw;relicDraw=function(c,taken){old(c,taken);pxLine(c,'#645748',-6,-7,-4,-2);pxRect(c,'#a1977c',-2,-16,1,1);pxRect(c,'#5e594c',0,-13,1,2);};}
drawGround=function(){let li=0;for(const f of flames){const sx=Math.round(f.x-camR.x),sy=Math.round(f.y-camR.y);if(sx<-30||sx>W+30)continue;const k=Math.min(1,(f.life-f.t)/.5)*Math.min(1,f.t*6);ectx.save();ectx.globalAlpha=k;
 for(let j=0;j<4;j++){const x=sx-6+j*4,h=Math.round((5+Math.abs(Math.sin(time*9+j+f.x))*5)*k);pxPoly(ectx,'#c85d32',[[x-1,sy],[x-2,sy-3],[x,sy-h],[x+1,sy-h+3],[x+3,sy-2],[x+2,sy]]);pxRect(ectx,'#f0bd6d',x,sy-3,1,3);}ectx.restore();if(li++%3===0)addLight(f.x,f.y-6,35,.6*k,1,.5,.2);}
 for(const cloud of clouds){const x=Math.round(cloud.x-camR.x),y=Math.round(cloud.y-camR.y);if(x<-80||x>W+80)continue;const k=Math.min(1,(cloud.life-cloud.t)/.6)*Math.min(1,cloud.t*4);ctx.save();ctx.globalAlpha=.16*k;const col=`rgb(${cloud.col.map(v=>Math.round(v*.6)).join(',')})`;for(let j=0;j<5;j++){const xx=x+Math.round(Math.sin(time*.8+j*2)*cloud.r*.45),yy=y+Math.round(Math.cos(time*.6+j)*cloud.r*.2),r=cloud.r*.4;pxPoly(ctx,col,[[xx-r,yy-r*.4],[xx-r*.5,yy-r],[xx+r*.4,yy-r*.8],[xx+r,yy],[xx+r*.5,yy+r*.5],[xx-r*.6,yy+r*.6]]);}ctx.restore();for(let j=0;j<5;j++){const xx=x+Math.round(Math.sin(j*2+time*.3)*cloud.r*.65),yy=y-Math.round((time*8+j*7)%20);pxRect(ectx,'#809353',xx,yy,1,1);}}
};
