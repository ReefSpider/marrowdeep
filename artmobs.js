'use strict';
/* Distinct silhouettes, costumes and poses. All feet remain at the engine origin. */
const ART_PEOPLE={
 archer:{cloth:'#536058',skin:'#c5b993',head:'skull',weapon:'bow',lean:2},
 husk:{cloth:'#526066',head:'barbute',weapon:'spear',shield:1,wide:1},
 brute:{cloth:'#66513b',skin:'#8e7b58',head:'horns',weapon:'cleaver',wide:5},
 hanged:{cloth:'#61514a',skin:'#a39b7b',head:'sack',lean:2,hang:1},
 witch:{cloth:'#473951',skin:'#a7a286',head:'hood',robe:1,weapon:'staff',lean:2},
 penitent:{cloth:'#6f453c',skin:'#b39477',head:'cone',weapon:'flail',scars:1},
 knight:{cloth:'#654449',head:'great',weapon:'sword',wide:2,cape:1},
 nun:{cloth:'#292935',skin:'#c7bba0',head:'veil',robe:1,weapon:'sickle'},
 debtor:{cloth:'#8a7145',skin:'#b49c76',head:'bare',lean:4,burden:1},
 lurker:{cloth:'#403443',skin:'#93808d',head:'hood',lean:3,weapon:'claws'},
 bonecaller:{cloth:'#50604b',skin:'#c6bb9c',head:'skull',robe:1,weapon:'staff'},
 warden:{cloth:'#62584b',head:'great',weapon:'mace',shield:2,wide:2},
 scarecrow:{cloth:'#677052',skin:'#b5a06a',head:'sack',straw:1,weapon:'sickle',wide:1},
 fenhag:{cloth:'#4b3a4e',skin:'#91a077',head:'hair',robe:1,lean:2,weapon:'claws'},
 drowner:{cloth:'#3f5a53',skin:'#8ba58a',head:'weed',lean:3,weapon:'claws'},
 buried:{cloth:'#78654d',skin:'#c6b58d',head:'sallet',weapon:'spear',rag:1},
 hermit:{cloth:'#58626b',skin:'#afa590',head:'antlers',robe:1,weapon:'staff'},
 footman:{cloth:'#5b6261',head:'barbute',weapon:'sword',shield:1},
 pikeman:{cloth:'#687064',head:'kettle',weapon:'pike'},
 zealot:{cloth:'#735734',skin:'#b8a17a',head:'hood',robe:1,weapon:'lantern'},
 villager:{cloth:'#826747',skin:'#b19a7a',head:'cowl',weapon:'club',lean:1},
 cutpurse:{cloth:'#4f624c',skin:'#aa957a',head:'mask',weapon:'dagger',lean:2},
 plague:{cloth:'#3b4940',head:'beak',robe:1,weapon:'bottle'},
 guard:{cloth:'#4a5668',head:'crest',weapon:'glaive',wide:1},
 taker:{cloth:'#6d503d',head:'cone',weapon:'cleaver',wide:2,apron:1},
 bellman:{cloth:'#3f5062',skin:'#b6a383',head:'bare',robe:1,weapon:'bell'},
 engineer:{cloth:'#766340',head:'kettle',weapon:'hammer',pack:1},
 noble:{cloth:'#733e51',skin:'#dbc18e',head:'plume',weapon:'rapier',cape:1},
 puppet:{cloth:'#413441',skin:'#dfd2b5',head:'mask',strings:1,lean:-1},
 servant:{cloth:'#3d4543',skin:'#b8a283',head:'cap',weapon:'tray',apron:1},
 handknight:{cloth:'#853f43',head:'crown',weapon:'sword',wide:3,cape:1},
 fiend:{cloth:'#733f31',skin:'#9c5c3f',head:'horns',wide:4,weapon:'claws',scars:1}
};
function artHead(c,kind,x,y,skin,metal){const p=(col,a)=>pxPoly(c,col,a.map(([X,Y])=>[X+x,Y+y])),r=(col,X,Y,w,h)=>pxRect(c,col,X+x,Y+y,w,h),line=(col,X,Y,A,B)=>pxLine(c,col,X+x,Y+y,A+x,B+y),M=metal||['#313c48','#76858d','#c3c9b6'];
 p('#353531',[[-3,0],[-2,-3],[2,-4],[4,-2],[5,2],[3,5],[-1,5],[-3,3]]);p(skin||'#b6a485',[[-2,-1],[0,-3],[3,-2],[4,1],[3,4],[0,4],[-2,2]]);r('#242829',2,0,2,1);r('#665848',2,3,2,1);
 if(['barbute','great','crest','crown','sallet','kettle'].includes(kind)){
  p(M[0],[[-4,4],[-4,-2],[-2,-5],[2,-5],[5,-3],[5,5],[2,6],[-2,5]]);p(M[1],[[-3,-1],[-1,-4],[2,-4],[4,-2],[4,4],[0,5],[-3,3]]);line(M[2],-1,-4,2,-4);r(M[2],-3,-1,1,4);
  if(kind==='kettle'){p(M[1],[[-6,0],[-4,-1],[4,-1],[7,1],[6,2],[-6,2]]);line(M[2],-6,0,3,0);r(skin||'#b6a485',0,3,4,2);}
  else{r('#182028',0,0,5,1);if(kind==='barbute')r('#182028',2,0,1,5);else for(let yy=2;yy<5;yy+=2)r('#242d32',3,yy,1,1);}
  if(kind==='sallet'){p(M[0],[[-4,-2],[-7,3],[-3,3]]);r(M[2],-6,2,3,1);}
  if(kind==='crest'){p('#733e37',[[-3,-5],[-4,-8],[1,-9],[6,-6],[2,-6]]);r('#b47b56',-1,-8,3,1);}
  if(kind==='crown'){r('#c0a25c',-4,-5,9,1);for(const xx of [-4,0,4])r('#d8bd79',xx,-8,1,3);}
 }else if(['hood','cone','cowl','veil','hair','weed','mask'].includes(kind)){
  const col=kind==='weed'?'#3e5140':kind==='hair'?'#292c33':'#343138';p(col,[[-5,5],[-5,-2],[-2,kind==='cone'?-11:-5],[1,kind==='cone'?-8:-6],[5,-2],[6,5],[3,4],[3,-2],[-1,-2],[-2,4]]);
  if(kind==='hood'||kind==='cone'||kind==='veil'){r('#151c20',-1,-1,5,4);r('#c2b58b',2,0,1,1);}
  if(kind==='veil'){line('#c6c5ac',-3,-3,3,-4);line('#c6c5ac',-3,-3,-3,3);}
  if(kind==='hair'||kind==='weed')for(let i=-4;i<4;i+=2)r(col,i,3,1,6+(i%3));
  if(kind==='mask'){r('#55514b',-2,1,6,3);r('#a6a38a',2,1,2,1);}
 }else if(kind==='skull'){r('#323a35',-1,-1,2,2);r('#323a35',2,-1,2,2);r('#323a35',1,2,1,1);for(let i=0;i<4;i+=2)r('#ddd0ac',i,4,1,1);}
 else if(kind==='sack'){p('#9f8c5b',[[-4,-3],[3,-4],[5,2],[3,5],[-3,4]]);line('#504633',-2,1,3,1);for(let i=-2;i<4;i+=2)r('#332f2c',i,0,1,3);r('#c4b077',-3,-2,2,2);}
 else if(kind==='horns'||kind==='antlers'){for(const s of [-1,1]){line('#cbb995',s*3,-3,s*6,-7);line('#cbb995',s*6,-7,s*7,-11);if(kind==='antlers')line('#8f9e92',s*6,-7,s*10,-8);}r('#d7a763',2,0,1,1);}
 else if(kind==='beak'){p('#d4c6a0',[[-2,-2],[3,-2],[8,2],[2,3],[-1,2]]);r('#242d2d',2,-1,2,2);r('#b1ce9a',2,-1,1,1);r('#4c4e3e',-5,-4,12,1);r('#383f35',-2,-7,6,3);}
 else if(kind==='plume'){r('#c6ae77',-2,-1,6,2);r('#312736',-5,-4,12,2);p('#c7c6ad',[[-4,-4],[-7,-7],[-11,-6],[-8,-9],[-4,-7],[-2,-4]]);}
 else if(kind==='cap'){r('#d8d4bb',-4,-4,9,2);r('#d8d4bb',-4,-2,2,4);}
 else {r('#3d3530',-3,-4,6,2);r('#3d3530',-3,-2,1,3);}
}
function artPerson(c,e,d){const H=(EDEF[e.type]&&EDEF[e.type].h)||30,h=Math.max(20,H),wide=d.wide||0,bw=4+wide,hip=-Math.round(h*.34),shoulder=-h+8,head=shoulder-4,st=e.state||'idle',attack=['thrust','combo','cut','bash','lunge','spin','slash','strike','charge','slam','swing'].includes(st),wind=['wind','cast','aim','draw','tele','raise'].includes(st),wk=Math.round(Math.sin(e.walk||0)*(d.robe?1:2)),lean=d.lean||0,skin=d.skin||'#b4a17d',col=d.cloth,sd=mixc(col,'#19202a',.5),hi=mixc(col,'#d6c6a0',.27),p=(co,a)=>pxPoly(c,co,a),r=(co,x,y,w,h)=>pxRect(c,co,x,y,w,h),line=(co,x,y,X,Y)=>pxLine(c,co,x,y,X,Y);
 c.save();if(d.hang&&st==='hang')c.translate(0,-2);if(d.strings)for(const x of [-4,0,4])line('#8e8068',x,-h-45,x+Math.round(Math.sin(time*2)*2),head-3);
 if(d.cape)p(sd,[[-bw,shoulder],[-bw-3,shoulder+5],[-bw-7-wk,-2],[-bw-2,0],[-bw,-3],[-1,-2],[0,hip]]);
 // Jointed legs: different knee positions prevent the paper-doll stance.
 p(sd,[[-bw+1,hip],[-1,hip+1],[-2+wk,-5],[-4+wk,-2],[-1+wk,-1],[-1+wk,0],[-6+wk,0],[-5+wk,-5]]);
 p(col,[[0,hip],[bw-1,hip],[bw-wk,-6],[2-wk,-2],[5-wk,-1],[5-wk,0],[0-wk,0],[0-wk,-4]]);r(hi,1-wk,-6,2,2);
 if(d.robe)p(col,[[-bw,shoulder],[-bw-1,hip],[-bw-3,-1],[-3,0],[-1,-2],[2,0],[bw+3,-1],[bw,hip],[bw,shoulder]]);
 else p(col,[[-bw,shoulder+3],[-bw+1,shoulder],[bw-1+lean,shoulder-1],[bw+2+lean,shoulder+4],[bw,hip],[-bw+1,hip+1]]);
 p(sd,[[-bw,shoulder+4],[-bw+2,shoulder+3],[-2,hip],[-bw-1,d.robe?-1:hip+1]]);p(hi,[[-bw+2,shoulder+1],[bw-1,shoulder],[bw,shoulder+3],[-1,shoulder+5],[-bw+2,shoulder+4]]);
 if(d.robe){line(sd,-1,shoulder+6,-2,-2);line(hi,bw-1,hip,bw+1,-3);}else {r('#39322d',-bw,hip-2,bw*2,2);r('#ab8d53',0,hip-2,2,2);}
 if(['great','barbute','crest','crown','sallet','kettle'].includes(d.head)){for(let y=shoulder+6;y<hip-2;y+=3)line(sd,-bw+2,y,bw-1,y-1);r('#b4b8a3',bw-1,shoulder+5,1,4);p(hi,[[-bw-2,shoulder+1],[-bw+1,shoulder],[-bw+2,shoulder+4],[-bw-3,shoulder+5]]);}
 if(d.apron){p('#b1a17a',[[-2,shoulder+4],[3,shoulder+4],[4,hip+4],[-3,hip+4]]);r('#745747',1,hip,2,2);}
 if(d.scars)for(let j=0;j<3;j++)line('#542f2c',-2,shoulder+5+j*3,3,shoulder+6+j*3);
 if(d.straw){line('#4c4e36',-12,shoulder+1,12,shoulder+1);for(const x of [-10,-8,8,10])line('#ae9c61',x,shoulder+2,x+1,shoulder+7);}
 if(d.pack){r('#48382c',-bw-5,shoulder+3,4,10);r('#b18e50',-bw-5,shoulder+4,4,1);}
 if(d.burden){p('#725b36',[[-8,hip],[-13,hip-3],[-15,hip-9],[-11,hip-14],[-5,hip-15],[-1,hip-10],[-2,hip-3]]);line('#b49c58',-12,hip-11,-6,hip-13);line('#453d30',-11,hip-4,-4,hip-4);}
 artHead(c,d.head,lean,head,skin);
 const handx=attack?bw+9:wind?bw: bw+4,handy=attack?shoulder+5:wind?shoulder-6:shoulder+10;
 p(sd,[[-bw,shoulder+4],[-bw-3,shoulder+8],[-bw-2,hip],[-bw,hip-1],[-bw+1,shoulder+7]]);
 line(col,bw-1,shoulder+4,bw+2,wind?shoulder+1:shoulder+8);line(hi,bw,shoulder+4,bw+2,wind?shoulder+1:shoulder+8);line(col,bw+2,wind?shoulder+1:shoulder+8,handx,handy);r(skin,handx,handy,2,2);
 if(d.shield){const xx=attack?bw+7:bw+1;p('#4c5149',[[xx,shoulder+5],[xx+5,shoulder+4],[xx+6,hip+3],[xx+2,hip+5],[xx-1,hip+1]]);line('#b5ad89',xx,shoulder+5,xx+5,shoulder+4);r('#b5ad89',xx+2,shoulder+8,1,5);if(d.shield===2)for(let y=shoulder+7;y<hip;y+=3)r('#80734d',xx+4,y,1,1);}
 artHeldProp(c,d.weapon,handx+1,handy,wind,attack,e);
 c.restore();
}
function artHeldProp(c,kind,x,y,wind,attack,e){if(!kind)return;const r=(co,X,Y,w,h)=>pxRect(c,co,x+X,y+Y,w,h),line=(co,X,Y,A,B)=>pxLine(c,co,x+X,y+Y,x+A,y+B),p=(co,a)=>pxPoly(c,co,a.map(([X,Y])=>[X+x,Y+y]));
 if(kind==='bow'){line('#96754b',0,-9,4,-5);line('#96754b',4,-5,5,2);line('#96754b',5,2,1,8);line('#c7c1a0',0,-9,wind?-4:0,0);line('#c7c1a0',wind?-4:0,0,1,8);line('#b5b8a4',wind?-6:0,0,9,0);}
 else if(kind==='staff'){line('#7d6746',0,-15,0,14);p('#c6b78f',[[-3,-16],[-2,-20],[2,-20],[4,-17],[2,-14],[-2,-14]]);r('#3b4742',0,-18,2,2);}
 else if(kind==='claws'){for(let i=0;i<3;i++)line('#c8bea1',0,i,4+i,i-1);}
 else if(['spear','pike','glaive'].includes(kind)){const L=kind==='pike'?27:18;line('#997947',-6,0,L,0);p('#bdc9b7',[[L,-2],[L+5,0],[L,2]]);if(kind==='glaive')p('#849b9a',[[L-4,0],[L-2,-5],[L+5,-4],[L+1,0]]);}
 else if(kind==='lantern'||kind==='bell'||kind==='bottle'||kind==='tray'){
  if(kind==='tray'){r('#b7a77f',0,0,9,1);r('#a68e59',5,-4,2,4);}
  else if(kind==='bell'){p('#a58c4c',[[1,0],[2,-4],[5,-4],[7,1],[0,1]]);r('#d3bd7c',0,1,8,1);}
  else if(kind==='bottle'){r('#91a45f',1,-3,4,5);r('#d2cda3',2,-5,2,2);r('#bcc884',1,-2,1,3);}
  else{line('#a99c70',1,-4,3,-6);line('#a99c70',3,-6,5,-4);r('#493c2d',0,-3,6,8);r('#d79a43',1,-2,4,5);r('#ffe1a0',2,-1,1,3);r('#493c2d',0,5,6,1);}
 }else if(kind==='club'){line('#6f5236',0,1,9,-5);pxLine(c,'#a0804e',x+3,y-1,x+10,y-6,2);}
 else{
  const names={sword:'Arming Sword',cleaver:"Butcher's Cleaver",flail:"Penitent's Flail",sickle:'Grave Sickle',dagger:'Misericorde',hammer:'War Hammer',mace:'Flanged Mace',rapier:'Estoc'};const b=baseByName(names[kind]||'Arming Sword');c.save();c.translate(x-3,y);c.rotate(wind?-1.4:attack?-.1:.45);c.scale(.65,.65);artWeapon(c,{base:b,rarity:0,aff:[]},false);c.restore();
 }
}
function artRat(c,e,scale=1){c.save();c.scale(scale,scale);const r=(co,x,y,w,h)=>pxRect(c,co,x,y,w,h);pxPoly(c,'#695647',[[-5,-2],[-4,-5],[-1,-6],[3,-4],[5,-2],[3,0],[-3,0]]);pxLine(c,'#9c8263',-3,-5,0,-5);r('#aa8b74',2,-5,2,2);r('#ddd0a8',3,-3,1,1);r('#322d29',5,-2,1,1);pxLine(c,'#9b7a66',-5,-1,-9,-2);pxLine(c,'#9b7a66',-9,-2,-11,-1);r('#312c28',-2+Math.round(Math.sin(e.walk||0)),0,2,1);r('#312c28',2,0,2,1);c.restore();}
function artBird(c,e,k){const big=k==='harpy'||k==='gargoyle',s=big?1.5:k==='vulture'?1.2:1;const flap=Math.round(Math.sin((e.walk||time)*3)*4);c.save();c.scale(s,s);const col=k==='gargoyle'?'#68756c':k==='harpy'?'#685865':'#34363f';pxPoly(c,col,[[-4,-4],[-3,-10],[1,-12],[4,-10],[5,-6],[2,-2],[-2,-1]]);for(const side of [-1,1]){pxPoly(c,mixc(col,'#151b26',.3),[[side*2,-8],[side*7,-12-flap],[side*14,-11-flap],[side*10,-7-flap],[side*8,-8-flap],[side*5,-4]]);pxLine(c,mixc(col,'#c8c1a3',.3),side*3,-8,side*12,-11-flap);}pxPoly(c,'#b09e76',[[3,-10],[7,-8],[3,-8]]);pxRect(c,'#d2bd83',3,-11,1,1);for(const x of [-1,2]){pxLine(c,'#85765d',x,-2,x,1);pxLine(c,'#85765d',x,1,x+2,1);}if(k==='harpy')artHead(c,'hair',1,-11,'#b3a082');if(k==='gargoyle'){pxLine(c,'#a6b09b',-2,-12,-5,-17);pxLine(c,'#a6b09b',2,-12,4,-17);}c.restore();}
function artSwollen(c,e,k){const b=k==='bloat'?2:1,sw=Math.round((e.swell||0)*3),p=(co,a)=>pxPoly(c,co,a),r=(co,x,y,w,h)=>pxRect(c,co,x,y,w,h),col=k==='bloat'?'#8d9464':'#7e8759';
 p('#4d5744',[[-7-b,-3],[-9-b,-11-sw],[-7,-19-sw],[-1,-22-sw],[6,-19-sw],[10+b,-13],[8+b,-4],[3,-1]]);p(col,[[-6,-17-sw],[-1,-20-sw],[5,-17-sw],[8+b,-11],[6,-4],[-1,-3],[-7,-7]]);p('#adb17b',[[-6,-16],[-3,-18],[2,-17],[4,-13],[-2,-12]]);p('#3a382e',[[0,-11],[6,-12],[7,-8],[2,-7]]);for(let x=1;x<7;x+=2)r('#d4c69f',x,-11,1,2);for(const x of [-5,4]){r('#62694e',x,-4,2,4);r('#afb18b',x,0,3,1);}artHead(c,k==='beggar'?'cowl':'bare',0,-22-sw,'#b0a786');for(const [x,y]of [[-5,-9],[5,-16],[-2,-6]]){r('#5c4a38',x,y,2,2);r('#c3b783',x,y,1,1);}}
function artGhost(c,e){const alpha=e.alpha==null?1:e.alpha;c.save();c.globalAlpha*=alpha;const k=e.type,light=k==='wraith'?'#9b9eac':'#bbc8b0';pxPoly(c,'#303442',[[-6,-19],[-3,-26],[3,-25],[6,-19],[5,-12],[8,-2],[3,-4],[1,1],[-2,-3],[-7,-1],[-5,-11]]);pxPoly(c,'#5d6071',[[-4,-21],[-2,-24],[2,-23],[4,-18],[2,-11],[4,-4],[0,-6],[-3,-2],[-2,-12]]);pxPoly(c,light,[[-2,-22],[2,-21],[3,-18],[1,-15],[-2,-17]]);pxRect(c,'#202631',1,-19,2,1);pxRect(c,'#202631',0,-16,2,1);for(const s of [-1,1])pxLine(c,'#6e7181',s*4,-16,s*9,-8+Math.round(Math.sin(time*4+s)));c.restore();}
function artCrawler(c,e){const leap=e.state==='leap',w=Math.round(Math.sin(e.walk||0)*2),p=(co,a)=>pxPoly(c,co,a);p('#605945',[[-7,-5],[-6,-9],[-2,-11],[3,-9],[5,-6],[1,-3],[-4,-3]]);p('#a69a76',[[-5,-8],[-2,-10],[1,-8],[2,-5],[-2,-5]]);for(const [x,off]of [[-5,w],[0,-w],[4,w]]){pxLine(c,'#8a8065',x,-5,x-3+off,leap?-7:-2);pxLine(c,'#8a8065',x-3+off,leap?-7:-2,x-5+off,0);}pxRect(c,'#d4c6a1',4,-7,3,3);pxRect(c,'#312b2a',6,-6,1,1);}
function artSpitter(c,e){const p=(co,a)=>pxPoly(c,co,a);p('#5c3c3d',[[-8,-2],[-7,-6],[-2,-8],[4,-6],[8,-3],[7,0],[-6,0]]);p('#926653',[[-5,-6],[-1,-7],[3,-5],[4,-2],[-2,-2]]);for(let x=-4;x<5;x+=3)pxRect(c,'#5c3c3d',x,-4,1,2);pxRect(c,'#d3b18a',7,-3,2,2);pxRect(c,'#281e24',8,-3,1,1);}
function artLantern(c,e){const p=(co,a)=>pxPoly(c,co,a);pxLine(c,'#a79769',-3,-14,0,-17);pxLine(c,'#a79769',0,-17,3,-14);p('#504c38',[[-5,-13],[5,-13],[4,-3],[2,0],[-3,0],[-5,-4]]);p('#b87935',[[-3,-11],[3,-11],[2,-3],[-2,-3]]);pxRect(c,'#ffe0a0',-1,-9,2,5);for(const x of [-4,3])pxRect(c,'#7c7351',x,-11,1,8);pxRect(c,'#b5a271',-4,-13,8,1);}
function artMimic(c,e){const gap=['wind','leap'].includes(e.state)?7:2;pxPoly(c,'#705038',[[-10,-1],[-11,-12],[10,-12],[11,-1]]);pxRect(c,'#352c2b',-9,-12,18,5);pxPoly(c,'#8a6542',[[-11,-13-gap],[-9,-18-gap],[7,-18-gap],[11,-14-gap],[10,-11-gap],[-10,-11-gap]]);for(const x of [-8,6]){pxRect(c,'#9b9270',x,-17-gap,2,6);pxRect(c,'#9b9270',x,-7,2,6);}for(let x=-7;x<9;x+=3){pxPoly(c,'#dfd0a6',[[x,-11-gap],[x+2,-11-gap],[x+1,-7-gap]]);pxRect(c,'#cbb68d',x,-8,1,2);}if(gap>2){pxPoly(c,'#9b4b4c',[[3,-7],[9,-5],[14,-6],[14,-4],[7,-3],[2,-5]]);}pxRect(c,'#c2a266',-1,-5,2,3);}
function artAnchor(c,e){pxLine(c,'#7f817b',0,-28,0,-5,2);for(let y=-27;y<-12;y+=4)pxRect(c,'#b4b29a',-1,y,3,2);pxPoly(c,'#4d5558',[[-3,-12],[3,-12],[5,-4],[10,-8],[11,-4],[5,0],[-5,0],[-11,-4],[-10,-8],[-5,-4]]);pxLine(c,'#9ba79d',-9,-4,-4,-1);pxRect(c,'#aeb3a2',-3,-11,6,1);}
function artRelic(c,e){pxPoly(c,'#655635',[[-8,0],[-9,-15],[-5,-19],[5,-19],[9,-15],[8,0]]);pxRect(c,'#baa16a',-7,-15,14,1);pxRect(c,'#2d332f',-5,-13,10,10);artHead(c,'skull',0,-10,'#d4c7a4');for(const x of [-8,7])pxRect(c,'#c2aa68',x,-15,1,14);pxRect(c,'#b3a068',-6,-20,12,1);}
function artHorse(c,t,run,dead=false,royal=false){const w=Math.round(Math.sin(t*(run?12:2))*(run?3:1)),p=(co,a)=>pxPoly(c,co,a),col=dead?'#625044':'#77604b',hi=dead?'#b7a68b':'#ae9168';
 for(const [x,k]of [[-11,w],[-6,-w],[6,-w],[10,w]]){p('#38332f',[[x,-12],[x+3,-12],[x+2+k,-6],[x+k,-2],[x+3+k,0],[x-1+k,0],[x-1+k,-5]]);pxRect(c,'#96968b',x+k,-2,3,2);}
 p(col,[[-15,-13],[-17,-20],[-12,-25],[-6,-25],[2,-23],[9,-25],[14,-22],[14,-14],[7,-10],[-3,-12],[-10,-10]]);p(hi,[[-13,-22],[-8,-24],[1,-21],[6,-22],[6,-17],[-2,-16],[-9,-18]]);
 p(col,[[8,-20],[10,-30],[14,-35],[20,-34],[23,-29],[26,-27],[25,-23],[19,-23],[17,-26],[15,-17]]);pxLine(c,hi,12,-29,15,-33);pxRect(c,dead?'#cfbea0':'#bc9e79',20,-28,5,3);pxRect(c,'#1d2428',19,-30,2,1);pxLine(c,'#393334',13,-33,12,-38);pxLine(c,'#393334',18,-34,19,-38);pxLine(c,'#38312f',-15,-20,-19,-9,2);
 if(dead)for(let x=-10;x<6;x+=3)pxLine(c,'#c3b394',x,-21,x+1,-14);
 if(royal){p('#753e44',[[-14,-22],[9,-22],[11,-10],[6,-12],[0,-9],[-5,-12],[-14,-10]]);pxLine(c,'#c0a565',-13,-22,8,-22);for(const x of [-9,2]){pxRect(c,'#c0a565',x,-19,2,6);pxRect(c,'#c0a565',x-1,-17,4,1);}}
}
const ART_OLD_ENEMY={...EDRAW};
for(const k of Object.keys(EDRAW)){
 EDRAW[k]=function(c,e){c.save();
  if(e.kesh&&['ghoul','archer','husk'].includes(k)){artPerson(c,{...e,type:k},{cloth:'#8f7954',skin:'#bb9e79',head:'kettle',weapon:k==='archer'?'bow':'spear',shield:k==='husk'?1:0});}
  else if(k==='buried'&&['buried','rise'].includes(e.state))ART_OLD_ENEMY[k](c,e);
  else if(k==='drowner'&&e.state==='sunk')ART_OLD_ENEMY[k](c,e);
  else if(k==='lurker'&&e.state==='hide')ART_OLD_ENEMY[k](c,e);
  else if(ART_PEOPLE[k]){if(k==='witch'&&['fade','appear'].includes(e.state))c.globalAlpha*=clamp(e.state==='fade'?e.st/.35:1-e.st/.3,0,1);artPerson(c,e,ART_PEOPLE[k]);}
  else if(k==='ghoul')drawGhoul(c,e);
  else if(k==='hound'||k==='hellhound'){drawHound(c,e);if(e.kesh)pxRect(c,'#a08860',-4,-10,8,2);if(k==='hellhound')for(let x=-7;x<5;x+=3){pxPoly(c,'#b45e39',[[x,-12],[x+1,-16],[x+3,-12]]);pxRect(c,'#e9aa59',x+1,-13,1,1);}}
  else if(k==='saltwraith')dSaltWraith(c,e);
  else if(k==='wraith')artGhost(c,e);
  else if(k==='rat')artRat(c,e);
  else if(k==='ratking'){for(let i=0;i<5;i++){c.save();c.translate((i%3-1)*6,-Math.floor(i/3)*5);if(i%2)c.scale(-1,1);artRat(c,e,1.1);c.restore();}pxLine(c,'#9b7a66',-7,1,4,4);pxLine(c,'#9b7a66',4,4,8,1);}
  else if(k==='imp')artImp(c,e);
  else if(k==='gargoyle'&&['perch','land'].includes(e.state))artPerchedGargoyle(c,e);
  else if(['crow','vulture','harpy','gargoyle'].includes(k))artBird(c,e,k);
  else if(k==='bloat'||k==='beggar')artSwollen(c,e,k);
  else if(k==='crawler')artCrawler(c,e);
  else if(k==='spitter')artSpitter(c,e);
  else if(k==='leech'){for(let i=0;i<8;i++)pxRect(c,i%2?'#654149':'#8f5b58',i-4,-2+Math.round(Math.sin((e.walk||0)+i)*1),2,2);pxRect(c,'#c7a387',4,-2,1,1);}
  else if(k==='lantern')artLantern(c,e);
  else if(k==='anchor')artAnchor(c,e);
  else if(k==='relicx')artRelic(c,e);
  else if(k==='mimic')artMimic(c,e);
  else if(k==='swarm'){for(let i=0;i<6;i++){const x=Math.round(Math.sin(time*5+i*3)*5),y=-4+Math.round(Math.cos(time*4+i*2)*3);pxRect(c,'#27272d',x,y,2,1);pxRect(c,'#9a9b87',x-1,y-1,1,1);pxRect(c,'#9a9b87',x+2,y+1,1,1);}}
  else if(k==='rider'){artHorse(c,e.walk||0,Math.abs(e.vx||0)>5);c.save();c.translate(0,-21);c.scale(.65,.65);artPerson(c,{...e,type:'footman',walk:0},{cloth:'#77684d',head:'kettle',weapon:'spear'});c.restore();}
  else ART_OLD_ENEMY[k](c,e);
  artMobDetails(c,e,k);
  c.restore();
 };
}

/* A second, material-specific detail pass. Clusters stay one logical pixel wide. */
function artMobDetails(c,e,k){
 if((k==='buried'&&['buried','rise'].includes(e.state))||(k==='drowner'&&e.state==='sunk')||(k==='lurker'&&e.state==='hide'))return;
 const d=ART_PEOPLE[k],r=(co,x,y,w,h)=>pxRect(c,co,x,y,w,h),line=(co,x,y,X,Y)=>pxLine(c,co,x,y,X,Y);
 if(d&&!e.kesh){const h=Math.max(20,EDEF[k].h),sh=-h+8,bw=4+(d.wide||0),hip=-Math.round(h*.34),head=sh-4,lean=d.lean||0,hi=mixc(d.cloth,'#c8bb9d',.38),sd=mixc(d.cloth,'#17212b',.55);
  const armoured=['barbute','great','crest','crown','sallet','kettle'].includes(d.head);
  if(armoured){
   pxPoly(c,hi,[[-bw-2,sh+2],[-bw,sh],[-bw+2,sh+1],[-bw+2,sh+4],[-bw-1,sh+5],[-bw-3,sh+4]]);
   line(sd,-bw-2,sh+4,-bw+1,sh+4);r('#bcc2b1',-bw,sh+1,2,1);
   line(sd,-bw+2,sh+7,-1,sh+9);line(hi,-1,sh+9,bw-1,sh+7);
   line(hi,0,sh+3,1,hip-4);r(sd,1,sh+5,1,3);
   for(let yy=hip+1;yy<hip+5;yy+=2){line(hi,-bw+2,yy,-1,yy+1);line(hi,1,yy+1,bw,yy);}
   r('#aaa993',-2,hip-2,1,1);r('#aaa993',bw-1,sh+10,1,1);
   const wk=Math.round(Math.sin(e.walk||0)*2);line('#b4b8a1',2-wk,-6,4-wk,-6);r('#343a3e',1-wk,-2,4,2);r('#8d9689',3-wk,-2,2,1);
   if(k==='handknight'){r('#c4a46c',-1,sh+5,2,6);r('#c4a46c',-3,sh+7,6,1);r('#8f5654',bw-1,hip,1,3);}
   if(k==='guard')r('#8b4c46',-2,sh+5,2,4);
   if(k==='engineer'){r('#cab87a',lean-1,head+1,5,1);r('#252f33',lean,head+1,1,1);r('#252f33',lean+3,head+1,1,1);r('#48382c',-bw-6,hip,6,3);r('#b4935f',-bw-5,hip,1,2);}
  }else if(d.robe){
   line(hi,bw-2,sh+6,bw-1,hip);line(sd,-1,hip,-3,-3);line(hi,2,hip+1,3,-4);r(sd,bw,-4,2,2);
   line('#8a7859',-bw+2,hip-2,bw-2,hip-1);r('#b5a175',0,hip-2,1,2);
   if(k==='nun'){line('#bdbca9',-2,sh+2,1,sh+4);r('#c9c5ae',0,sh+5,1,4);r('#c9c5ae',-1,sh+6,3,1);}
   if(k==='plague'){r('#b7aa81',-2,sh+5,1,1);r('#b7aa81',-2,sh+8,1,1);line('#74775e',bw-1,hip,bw+1,-4);r('#797d62',lean-3,head-3,2,1);}
   if(k==='bonecaller')for(let i=0;i<3;i++){r('#c7bba0',-3+i*2,sh+5,1,3);r('#655f4a',-3+i*2,sh+8,1,1);}
   if(k==='fenhag'){r('#b4ac81',lean+2,head,1,1);line('#777b64',lean-3,head+4,lean-4,head+10);}
   if(k==='hermit'){r('#bba47a',-2,sh+3,4,1);line('#888c7b',-3,hip,-5,-2);}
  }else{
   line(sd,-1,sh+5,0,hip-3);r(hi,1,sh+6,1,3);r(sd,-bw+2,hip+2,2,2);
   if(d.scars){line('#6e4e3b',-bw+1,sh+5,0,sh+7);line('#c19b72',-bw+1,sh+4,-1,sh+5);}
   if(k==='villager'){r('#aa8d5c',-2,hip-5,3,2);r('#594b36',-1,hip-5,1,2);}
   if(k==='noble'){r('#c7ae74',-2,sh+3,4,2);r('#d8ccaa',-2,sh+6,2,3);line('#a66c75',-bw-2,sh+7,-bw-5,-3);}
   if(k==='cutpurse'){line('#847b58',-bw+1,sh+3,bw-1,hip-3);r('#c6b08a',0,sh+8,1,1);}
   if(k==='archer'){r('#d5c6a6',-3,sh+5,1,4);line('#a1987a',-2,sh+7,2,sh+8);line('#a1987a',-2,sh+10,2,sh+11);}
  }
  if(!armoured&&!['hood','cone','veil','mask','hair','weed'].includes(d.head)){r('#c7b18d',lean+1,head-2,1,1);r('#6a624f',lean+1,head+2,2,1);}
  if(k==='drowner'){for(const [x,y]of [[-3,sh+5],[2,sh+8],[-2,hip]]){r('#9baf87',x,y,2,1);r('#394d43',x,y+1,1,2);}}
  if(k==='scarecrow'){line('#b0a06b',-3,hip-4,2,hip-3);for(let x=-5;x<6;x+=2)line('#b2a06b',x,-4,x+1,0);}
  if(k==='fiend'){for(let y=sh+5;y<hip-2;y+=3){line('#4b2d2a',-5,y,-1,y+1);line('#4b2d2a',1,y+1,5,y);}r('#d29352',0,sh+5,1,7);for(const s of [-1,1])pxPoly(c,'#b3a081',[[s*3,head-3],[s*8,head-6],[s*10,head-13],[s*7,head-8]]);}
 }
 if(k==='hound'||k==='hellhound'){line('#b09b72',-6,-12,-3,-11);r('#463e33',4,-9,1,3);r('#c1ac81',7,-15,1,2);r('#9b8461',-6,-4,1,2);}
 if(k==='bloat'||k==='beggar'){r('#c4bc8a',-6,-14,2,1);r('#4d573d',4,-7,1,2);r('#c4bc8a',5,-15,1,1);}
}
function artImp(c,e){const fl=Math.round(Math.sin(e.walk||0)*3),p=(col,pts)=>pxPoly(c,col,pts);for(const s of [-1,1]){p('#54363b',[[s*2,-10],[s*7,-15-fl],[s*12,-13-fl],[s*9,-8],[s*7,-10],[s*4,-6]]);pxLine(c,'#926051',s*2,-10,s*9,-14-fl);}p('#975e47',[[-3,-11],[-1,-14],[3,-11],[4,-5],[1,-1],[-3,-4]]);pxLine(c,'#c08e5f',-1,-10,1,-6);artHead(c,'horns',0,-14,'#a46e4d');for(const x of [-2,2])pxLine(c,'#78503f',x,-3,x+1,1);pxLine(c,'#78503f',3,-4,7,-2);pxLine(c,'#78503f',7,-2,10,-5);if(e.state==='cast'){pxPoly(c,'#da9450',[[6,-12],[8,-17],[10,-13],[9,-10]]);pxRect(c,'#f3d396',8,-13,1,2);}}
function artPerchedGargoyle(c,e){pxPoly(c,'#707b70',[[-7,0],[-8,-10],[-4,-16],[3,-17],[7,-12],[7,-5],[4,0]]);pxPoly(c,'#9b9e88',[[-5,-13],[-2,-15],[3,-14],[4,-10],[0,-8],[-4,-9]]);for(const s of [-1,1]){pxPoly(c,'#4c5957',[[s*3,-11],[s*10,-20],[s*8,-7],[s*4,-3]]);pxLine(c,'#989f8b',s*4,-10,s*9,-18);pxRect(c,'#454f4b',s*4,-1,4,2);}artHead(c,'horns',2,-16,'#8a937f');pxRect(c,'#3d4845',4,-16,1,1);}
