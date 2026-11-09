'use strict';
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
