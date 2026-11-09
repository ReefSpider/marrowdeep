'use strict';
/* Boss identity pass; patterns, timing, collision and encounter state remain owned by gameplay. */
const ART_OLD_BOSS={...BDRAW};
deadHorse=(c,t,run)=>artHorse(c,t,run,true,false);
destrier=(c,t,run)=>artHorse(c,t,run,false,true);
function artBossMan(c,e,d){const pat=e.pat&&e.pat.name||'',strike=/duel|combo|charge|lance|bash|sunder/.test(pat),wind=/oil|flock|immolate|orders|guard|rain|wave/.test(pat);artPerson(c,{...e,type:'guard',walk:(e.anim||0)*3*Math.min(1,Math.abs(e.vx||0)/20),state:strike?'thrust':wind?'wind':'chase'},d);}
BDRAW.merrow=(c,e)=>{artBossMan(c,e,{cloth:'#5d6968',head:'crest',weapon:'sword',wide:3,cape:1});pxRect(c,'#20252b',1,-27,3,1);pxRect(c,'#a58060',-5,-17,1,6);pxRect(c,'#9b8e69',-7,-17,4,1);};
BDRAW.piet=(c,e)=>{c.save();if(e.rollT!=null){c.translate(0,-10);c.rotate(e.rollT*14*(e.face>0?1:-1));c.translate(0,10);}artBossMan(c,e,{cloth:'#596273',skin:'#b7a17f',head:'sallet',weapon:'sword',shield:2,wide:1,cape:1});pxRect(c,'#b6a478',4,-16,3,1);c.restore();};
BDRAW.gideon=(c,e)=>{artBossMan(c,e,{cloth:'#8d4144',head:'great',weapon:'sword',wide:3,cape:1});pxRect(c,'#c4a16a',-2,-22,2,9);pxRect(c,'#c4a16a',-4,-19,6,1);pxLine(c,'#b1685b',-8,-22,-6,-12);if(e.phase>1)for(let i=0;i<3;i++)pxRect(c,'#e7a45f',3+i*2,-28-i%2,1,2);};
BDRAW.preacher=(c,e)=>{artBossMan(c,e,{cloth:'#67513b',skin:'#baa487',head:'hood',weapon:'lantern',robe:1,wide:1});pxRect(c,'#c1a260',-1,-24,2,13);pxRect(c,'#9d824b',-3,-21,6,1);pxLine(c,'#41382f',-6,-15,-8,-3);if(e.phase>2)for(let i=0;i<5;i++){const x=-7+i*3,y=-30-Math.round(Math.sin((e.anim||0)*7+i)*3);pxPoly(c,'#bd6037',[[x,y+4],[x+1,y-4],[x+3,y],[x+2,y+4]]);pxRect(c,'#e9b76b',x+1,y,1,3);}};
dSister=function(c,e,i,dim){c.save();if(dim)c.globalAlpha*=.5;const pal=['#625269','#4c665b','#655d3c'];artBossMan(c,e,{cloth:pal[i%3],skin:'#b8b891',head:'hair',robe:1,wide:i===2?2:0,weapon:'claws',lean:i-1});if(i===0)pxRect(c,'#6c7656',-1,-27,5,2);if(i===1){pxRect(c,'#b8b891',1,-24,3,1);for(let x=1;x<4;x++)pxRect(c,'#6c7656',x,-25,1,2);}if(i===2)for(let j=0;j<6;j++)pxLine(c,'#b8b891',8,-17+j,13+j%2,-18+j);c.restore();};
BDRAW.sisters=(c,e)=>dSister(c,e,e.cur||0,false);
BDRAW.count=(c,e)=>{if(e.phase>1){for(let i=0;i<7;i++){const y=-35+i*5,dx=Math.round(Math.sin((e.anim||0)*3+i)*3);pxPoly(c,'#423246',[[-3,y],[-18+dx,y-10],[-12+dx,y+2],[-2,y+4]]);pxRect(c,'#b18a72',-12+dx,y-3,1,2);}}artBossMan(c,e,{cloth:'#3d4657',head:'crown',weapon:'sword',wide:2,cape:1});pxPoly(c,'#7a3d4e',[[-6,-25],[-10,-20],[-14,-1],[-7,-3],[-2,-15]]);pxLine(c,'#bd9d62',-6,-25,-10,-4);pxRect(c,'#baa16c',-2,-22,3,5);};
BDRAW.mother=function(c,e){const t=e.anim||0,br=Math.round(Math.sin(t*1.4)),pat=e.pat&&e.pat.name||'',p=(co,a)=>pxPoly(c,co,a),line=(co,x,y,X,Y,w)=>pxLine(c,co,x,y,X,Y,w),r=(co,x,y,w,h)=>pxRect(c,co,x,y,w,h);
 p('#292631',[[-13,-51],[-18,-24],[-24,-2],[-17,0],[-13,-4],[-8,0],[-1,-3],[5,0],[11,-4],[18,-1],[14,-29],[10,-51]]);p('#49404a',[[-11,-47],[-13,-20],[-18,-3],[-11,-6],[-5,-32],[-3,-48]]);p('#3a323c',[[3,-47],[6,-24],[13,-3],[6,-6],[0,-23]]);
 p('#a6a18b',[[-10,-48],[-10,-68],[-6,-77],[3,-79],[9,-72],[10,-49],[4,-43],[-4,-44]]);for(let j=0;j<5;j++){line('#615f58',-6,-70+j*4,5,-72+j*4);r('#d0c8a7',-7,-70+j*4,3,1);}
 for(let i=0;i<4;i++){if(pat.startsWith('slam')&&i===2)continue;const s=i<2?-1:1,baseY=-72+(i%2)*10,reach=pat==='sweep'?9:0,elx=s*(22+(i%2)*6),ely=baseY-12+Math.round(Math.sin(t*1.5+i)*3),hx=s*(33+reach),hy=ely-16+(i%2)*23;line('#6e6b61',s*7,baseY,elx,ely,3);line('#d5cdb0',s*7,baseY,elx,ely,1);line('#b3b09a',elx,ely,hx,hy,2);r('#ebe1bf',elx,ely,2,2);for(let f=0;f<4;f++){const ex=hx+s*(5+f),ey=hy-4+f*2;line('#d5cdb0',hx,hy,ex,ey);line('#a6a18b',ex,ey,ex+s*2,ey-2);}}
 p('#181d27',[[-8,-90+br],[-3,-96+br],[4,-95+br],[9,-88+br],[11,-47],[7,-44],[3,-47],[-1,-44],[-7,-47],[-11,-46]]);for(let i=-7;i<9;i+=3)line(i%2?'#3c3540':'#2e2b35',i,-86+br,i+1,-52+((i*3)%7));if(e.phase>1){r('#713946',-1,-80,2,24);for(let y=-79;y<-58;y+=4)r('#c4b698',0,y,1,2);}
};
BDRAW.choir=function(c,e){const t=e.anim||0,p=(co,a)=>pxPoly(c,co,a),line=(co,x,y,X,Y)=>pxLine(c,co,x,y,X,Y),r=(co,x,y,w,h)=>pxRect(c,co,x,y,w,h);
 const ring=[];for(let i=0;i<16;i++){const a=i*Math.PI/8;ring.push([Math.round(Math.cos(a)*32),-33+Math.round(Math.sin(a)*31)]);}p('#78674d',ring);p('#29272f',ring.map(([x,y])=>[x*.92,-33+(y+33)*.92]));
 p('#5c4145',[[-20,-36],[-14,-49],[-4,-51],[8,-48],[19,-39],[20,-25],[11,-17],[-3,-16],[-15,-22]]);for(let j=0;j<6;j++)line('#3c303b',-13+j*5,-44,-18+j*5,-24);
 for(let i=0;i<7;i++){const a=i/7*Math.PI*2+t*.12,x=Math.round(Math.cos(a)*18),y=-33+Math.round(Math.sin(a)*15);c.save();c.translate(x,y);p('#bdb59c',[[-4,-4],[-1,-7],[3,-5],[4,-1],[2,5],[-1,7],[-4,3]]);p('#8a8b7a',[[-4,-3],[-2,-4],[-1,4],[-2,6],[-4,2]]);r('#25232c',-2,-2,2,1);r('#25232c',1,-3,2,1);const h=e.pat?3+Math.round(Math.abs(Math.sin(t*7+i))*3):2;p('#34242b',[[0,0],[2,1],[1,h],[-1,h-1],[-1,2]]);r('#e0d1ae',-2,-5,2,1);c.restore();}
 for(const x of [-9,0,9])for(let j=0;j<8;j++){r(j%2?'#b4a58c':'#756c61',x+Math.round(Math.sin(t*2+j)*2),-7+j*4,2,3);}for(let i=0;i<16;i+=2){const [x,y]=ring[i];r('#c3a16b',x,y,2,2);}
};
BDRAW.tithe=function(c,e){const t=e.anim||0,w=Math.round(Math.sin(t*3)*Math.min(3,Math.abs(e.vx||0)/10)),p=(co,a)=>pxPoly(c,co,a),r=(co,x,y,w,h)=>pxRect(c,co,x,y,w,h),line=(co,x,y,X,Y,w)=>pxLine(c,co,x,y,X,Y,w);
 p('#49423e',[[-16,-34],[-5,-32],[-7+w,-17],[-11+w,-5],[-6+w,-1],[-19+w,0],[-19+w,-7],[-15+w,-20]]);p('#655b4c',[[3,-33],[15,-34],[18-w,-20],[10-w,-8],[17-w,-3],[17-w,0],[2-w,0],[3-w,-10],[6-w,-22]]);r('#8b8066',5-w,-20,9,3);
 p('#655a4b',[[-20,-35],[-25,-65],[-19,-81],[-7,-91],[10,-89],[22,-76],[18,-48],[13,-31],[-4,-26]]);p('#8c7c60',[[-17,-76],[-8,-86],[5,-86],[15,-75],[14,-62],[5,-58],[-10,-61]]);p('#4a4540',[[-21,-68],[-12,-64],[-6,-29],[-18,-33]]);
 p('#51473e',[[-8,-58],[13,-60],[16,-36],[8,-30],[-5,-30]]);for(let y=-53;y<-33;y+=5)line('#a38d62',-5,y,10,y-1);line('#3c3530',-18,-75,9,-38,3);r('#b49c68',-7,-58,5,5);
 // Cage weight is borne by a bent arm and a broad shoulder, with offset legs beneath.
 line('#a18e6d',-15,-78,-31,-81,6);line('#76644f',-31,-81,-32,-66,5);p('#7e7059',[[5,-86],[7,-100],[17,-105],[27,-99],[26,-87],[19,-80],[11,-81]]);p('#a69470',[[10,-99],[17,-103],[24,-98],[23,-93],[15,-91],[10,-94]]);r('#302c2b',18,-96,5,2);r('#302c2b',18,-87,7,e.pat&&e.pat.name==='pull'?4:1);r('#c7b993',20,-87,3,1);
 const reach=e.pat&&e.pat.name==='pull'?9:0;line('#71634f',16,-77,29,-62,8);line('#a18e6d',18,-78,30,-64,3);line('#71634f',29,-62,37+reach,-53,6);for(let j=0;j<4;j++)line('#a18e6d',37+reach,-55+j*2,42+reach,-53+j*2);
 r('#292c2d',-45,-106,29,4);r('#6f7062',-44,-105,27,1);r('#292c2d',-45,-65,29,4);for(let x=-43;x<-16;x+=5){r('#555b55',x,-102,2,37);r('#8b8d73',x,-101,1,32);}for(const [x,y]of [[-38,-85],[-28,-76]]){r('#cbbd96',x,y,3,6);r('#cbbd96',x-1,y,5,1);}line('#8f927b',-32,-107,-27,-113,2);line('#8f927b',-27,-113,-22,-107,2);
};
BDRAW.saint=function(c,e){c.save();c.globalAlpha*=e.alpha==null?1:e.alpha;const t=e.anim||0,p=(co,a)=>pxPoly(c,co,a),line=(co,x,y,X,Y,w)=>pxLine(c,co,x,y,X,Y,w);
 for(let i=0;i<12;i++){const a=i*Math.PI/6+t*.3,x=Math.round(Math.cos(a)*22),y=-70+Math.round(Math.sin(a)*22);line('#ac9d72',x,y,x+Math.round(Math.cos(a)*5),y+Math.round(Math.sin(a)*5));pxRect(c,'#ded2a3',x,y,1,2);}
 p('#9d9d8c',[[-8,-61],[-13,-36],[-18,5],[-12,9],[-7,4],[-2,8],[3,4],[9,9],[16,4],[12,-33],[7,-61]]);p('#d1cbb2',[[-5,-60],[-7,-36],[-12,3],[-8,5],[-2,-8],[2,-39],[3,-60]]);p('#bebda6',[[4,-55],[6,-25],[12,4],[7,2],[3,-9]]);
 p('#784745',[[-5,-61],[5,-61],[6,-35],[-4,-32]]);for(let y=-58;y<-35;y+=5)line('#b6836a',-3,y,3,y-1);
 line('#9c7361',-5,-58,-20,-61,3);line('#c1b28c',-20,-61,-32,-57,2);line('#9c7361',6,-58,20,-62,3);line('#c1b28c',20,-62,32,-57,2);for(const s of [-1,1])for(let i=0;i<3;i++)line('#d8cba5',s*32,-57,s*(35+i),-59+i*2);
 c.save();c.translate(0,-70);c.scale(1.4,1.6);artHead(c,'bare',0,0,'#d0b476');c.restore();pxRect(c,'#3d3a35',1,-71,3,1);pxLine(c,'#746851',-3,-79,-5,-65);c.restore();
};
// Keep Brann's authored siege machinery and the two named cavalry identities;
// their mounts now use jointed anatomy, and this pass adds plate/cloth separation.
for(const k of ['odo','rook','brann']){const old=ART_OLD_BOSS[k];BDRAW[k]=function(c,e){old(c,e);const y=(k==='brann'?-28:e.mounted?-34:-16);for(let i=0;i<3;i++)pxLine(c,k==='odo'?'#9d8765':'#d0c69d',-4,y+i*3,2,y+i*3-1);};}
