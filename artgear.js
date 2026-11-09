'use strict';
/* Hand-authored gameplay silhouettes on an integer grid. Pure rendering only. */
function pxPoly(c,col,pts){
  const p=pts.map(([x,y])=>[Math.round(x),Math.round(y)]);let lo=Infinity,hi=-Infinity;
  for(const v of p){lo=Math.min(lo,v[1]);hi=Math.max(hi,v[1]);}c.fillStyle=col;
  for(let y=lo;y<hi;y++){const xs=[];for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];if((a[1]<=y+.5&&b[1]>y+.5)||(b[1]<=y+.5&&a[1]>y+.5))xs.push(a[0]+(y+.5-a[1])*(b[0]-a[0])/(b[1]-a[1]));}xs.sort((a,b)=>a-b);for(let i=0;i+1<xs.length;i+=2)c.fillRect(Math.round(xs[i]),y,Math.max(1,Math.round(xs[i+1])-Math.round(xs[i])),1);}
}
function pxLine(c,col,x0,y0,x1,y1,w=1){x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);const dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1;let er=dx+dy;c.fillStyle=col;for(;;){c.fillRect(x0,y0,w,w);if(x0===x1&&y0===y1)break;const e=2*er;if(e>=dy){er+=dy;x0+=sx;}if(e<=dx){er+=dx;y0+=sy;}}}
function pxRect(c,col,x,y,w,h){c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));}
artPoly=pxPoly;
metalOf=r=>r===5?['#26252f','#676271','#c7bfc2']:r===4?['#363a40','#858b8b','#e4ddc7']:['#303b45','#74858b','#c8d5ca'];
const ART_ECOL={fire:['#d94b22','#ffc365'],cold:['#5092b5','#dcf7f1'],shock:['#bc9a39','#fff1a5'],water:['#256e93','#87d6d9'],poison:['#53752e','#bada62'],holy:['#ba9342','#fff0bb'],shadow:['#604279','#b496d2'],blood:['#76232d','#d45c4c'],wind:['#709388','#d8edce'],bone:['#99846b','#e4d7b5']};
function artElement(it){return it&&it.aff&&it.aff.find(a=>ART_ECOL[a.k]&&a.v>0)?.k;}
function artTrim(it){return it.rarity===5?'#a85b59':it.rarity===4?'#c5a45e':it.rarity===3?'#a18d59':'#807562';}
function artWeaponAnchors(b){const L=b.len;switch(b.cls){case 'axe':return [[L-3,-5],[L,-5],[L+2,-4]];case 'mace':case 'hammer':return [[L+1,-3],[L+4,-2],[L+4,2]];case 'flail':return [[L+10,-2],[L+12,0],[L+10,2]];case 'scythe':case 'sickle':return [[L,-8],[L-3,-6],[L-5,-3]];case 'spear':return [[L+3,-1],[L+6,0],[L+8,0]];case 'xbow':return [[L,-5],[L,0],[L,5]];default:return [[12,0],[Math.round(10+L*.55),0],[8+L,-1]];}}
function artWeaponAccents(c,it,animated){const k=artElement(it),a=artWeaponAnchors(it.base),col=k?ART_ECOL[k]:[artTrim(it),artTrim(it)];
  const M=metalOf(it.rarity),b=it.base;
  if(['sword','katana','rapier','dagger','cleaver'].includes(b.cls)){
    const start=b.h===2?15:12;
    pxRect(c,M[2],start,-1,2,1);pxRect(c,M[0],start+3,1,2,1);
    if(it.rarity>=2){pxRect(c,artTrim(it),start+5,0,1,2);pxRect(c,artTrim(it),start+4,1,3,1);}
  }else if(['axe','mace','hammer'].includes(b.cls)){pxRect(c,'#b79a66',b.len-3,0,1,1);pxRect(c,M[2],b.len+1,-2,1,1);}
  if(it.rarity>=4){let sig=0;for(const ch of it.name||b.name)sig=(sig*31+ch.charCodeAt(0))>>>0;pxRect(c,artTrim(it),4,-1,1,3);if(sig%2)pxRect(c,M[2],6,0,1,1);}
  for(let i=0;i<a.length;i++){const [x,y]=a[i];pxRect(c,col[i%2],x,y,i===1?2:1,1);if(k&&i===1){pxRect(c,col[0],x,y-1,1,3);if(animated&&Math.floor(time*6)%3===0)pxRect(c,col[1],x+1,y-1,1,1);}}
}
function artWeapon(c,it,animated=true){
 const b=it.base,L=b.len,cl=b.cls,n=b.name,M=metalOf(it.rarity),trim=artTrim(it),p=(col,a)=>pxPoly(c,col,a),r=(col,x,y,w,h)=>pxRect(c,col,x,y,w,h),line=(col,x,y,X,Y)=>pxLine(c,col,x,y,X,Y);
 const wood='#725337',woodHi='#ad8d59',leather='#47352e';
 const haft=(start=4,end=L+2)=>{r('#30271f',start,-1,end-start,3);r(wood,start,0,end-start,1);r(woodHi,start+2,-1,Math.max(1,end-start-3),1);};
 const grip=(end=9)=>{r(leather,3,-1,end-3,3);for(let x=4;x<end;x+=2)r('#9b805b',x,-1,1,2);r(trim,2,-1,2,3);};
 if(['Hatchet','Bearded Axe','Flanged Mace'].includes(n)){drawCraftWeapon(c,it);artWeaponAccents(c,it,animated);return;}
 if(['sword','katana','rapier','dagger','cleaver'].includes(cl)){
  const g=b.h===2?12:9;grip(g);r(trim,g,-3,2,7);r(M[2],g,-3,2,1);
  if(cl==='katana'){
    const tip=g+L; p(M[0],[[g+1,-2],[g+L*.5,-2],[tip-3,-5],[tip,-5],[tip-2,-2],[g+L*.5,1],[g+1,1]]);line(M[2],g+1,0,g+L*.5,0);line(M[2],g+L*.5,0,tip-2,-3);line(M[1],g+1,-1,tip-4,-3);r('#282932',g,-3,1,7);
  }else if(n==='Kris'){
    p(M[1],[[g+1,-2],[g+4,-3],[g+7,-1],[g+10,-3],[g+L+3,0],[g+10,1],[g+7,3],[g+4,1],[g+1,2]]);line(M[2],g+1,-2,g+4,-2);line(M[2],g+4,-2,g+7,0);line(M[2],g+7,0,g+10,-2);
  }else if(cl==='cleaver'||n==="Headsman's Blade"||n==='Iron Slab'){
    const w=n==='Iron Slab'?5:cl==='cleaver'?4:4;p(M[1],[[g+2,-w],[g+L,-w],[g+L+1,w-1],[g+3,w]]);r(M[0],g+3,-w,L-2,2);r(M[2],g+3,w-1,L-3,1);r('#24292c',g+L-3,-w+2,2,2);if(n==='Iron Slab'){r('#32323a',g+L-8,2,3,2);r(trim,g+5,-3,2,1);}
  }else if(n==='Rusted Falchion'){
    p(M[1],[[g+1,-2],[g+L-5,-3],[g+L,-5],[g+L+2,-3],[g+L-1,2],[g+1,2]]);line(M[2],g+2,2,g+L-2,1);line(M[2],g+L-2,1,g+L+1,-3);r('#7d5336',g+5,-1,3,1);r('#7d5336',g+12,0,2,1);
  }else{
    const w=cl==='rapier'?1:cl==='dagger'?1:Math.max(2,Math.round(b.wid/2));p(M[1],[[g+1,-w],[g+L-3,-w],[g+L+2,0],[g+L-3,w],[g+1,w]]);line(M[2],g+2,-w,g+L-3,-w);line(M[2],g+L-3,-w,g+L+1,0);r(M[0],g+3,0,Math.max(2,L-5),1);
    if(n==='Zweihander'){r(leather,g+2,-2,6,4);r(trim,g+7,-4,2,8);p(trim,[[g,-4],[g-3,-6],[g-3,-4],[g,0]]);}
    if(n==='Estoc'){line(trim,g-1,-4,g+3,-3);line(trim,g-1,4,g+3,3);r(trim,g-2,-4,1,9);}
    if(n==='Misericorde'){r(trim,g,-2,1,5);r(M[2],g+3,-1,3,1);}
  }
 }else if(cl==='axe'){
  haft();grip();r(trim,L-3,-2,3,5);p(M[1],[[L-3,-2],[L-2,-8],[L+2,-11],[L+6,-9],[L+7,-3],[L+3,-2],[L+2,3],[L-1,3]]);line(M[2],L-2,-8,L+2,-10);line(M[2],L+2,-10,L+5,-8);r(M[0],L-1,-2,3,4);r(woodHi,L,0,1,1);p(M[0],[[L-2,2],[L-4,6],[L,6],[L+2,2]]);
 }else if(cl==='spear'){
  haft(-10,L+2);r(trim,L-2,-2,3,4);p(M[1],[[L+1,-2],[L+7,-3],[L+12,0],[L+7,2],[L+1,2]]);line(M[2],L+2,-2,L+10,0);
  if(n==='Boar Spear'){r(M[1],L,-5,2,11);r(M[2],L,-5,1,10);}
  if(n==='Glaive'){p(M[1],[[L-2,-2],[L+2,-6],[L+12,-6],[L+13,-4],[L+7,1],[L-2,1]]);line(M[2],L+2,-6,L+11,-6);}
  if(n==='Halberd'){p(M[1],[[L-4,-1],[L-6,-8],[L,-11],[L+2,-8],[L+1,-2]]);line(M[2],L-6,-8,L,-10);p(M[1],[[L-3,1],[L-6,7],[L,3],[L+1,1]]);}
 }else if(cl==='hammer'||cl==='mace'){
  haft();grip();const big=b.h===2,h=big?7:5;r(trim,L-3,-2,3,4);p(M[0],[[L-1,-h],[L+5,-h],[L+7,-h+2],[L+7,h-1],[L+5,h],[L-1,h]]);r(M[1],L,-h+1,5,h*2-2);r(M[2],L,-h+1,5,1);r(M[2],L+5,-h+2,1,h*2-4);
  if(n==='Maul'){r('#544035',L,-h+2,4,h*2-4);r(M[1],L,-h+3,4,1);r(M[1],L,h-3,4,1);}else if(!big)p(M[1],[[L,3],[L-6,6],[L-2,1]]);r(trim,L+1,-1,2,2);
 }else if(cl==='xbow'){
  haft(3,L+3);p(wood,[[3,1],[6,1],[6,6],[4,6]]);line(M[0],L-1,-7,L+3,-3);line(M[1],L+3,-3,L+3,3);line(M[1],L+3,3,L-1,8);line(M[2],L,-7,L+3,-3);line('#b7b7a2',L-1,-7,L-5,0);line('#b7b7a2',L-5,0,L-1,8);line(M[2],L-6,0,L+5,0);r(M[0],6,2,3,2);
  if(n==='Arbalest'){r(M[0],8,-3,5,2);r(trim,9,-4,1,2);r(trim,8,3,3,2);}if(n==='Repeater'){r('#322c27',8,-5,7,4);r(woodHi,8,-5,7,1);for(let x=9;x<15;x+=2)r(M[2],x,-4,1,2);}
 }else if(cl==='flail'){
  grip(10);haft(4,10);const x=L+10,y=animated?Math.round(Math.sin(time*7)*2):0;for(let j=0;j<7;j++)r(j%2?M[0]:M[1],10+j*(x-10)/7,y*j/7,1,2);const h=n==='Morning Star'?5:4;p(M[1],[[x-h,y-2],[x-2,y-h],[x+2,y-h],[x+h,y-2],[x+h,y+2],[x+2,y+h],[x-2,y+h],[x-h,y+2]]);r(M[2],x-2,y-3,3,1);for(const [dx,dy]of [[-h-2,0],[h+1,0],[0,-h-2],[0,h+1]])r(M[2],x+dx,y+dy,2,2);if(n==='Morning Star')r(trim,x-1,y-1,2,2);
 }else if(cl==='scythe'||cl==='sickle'){
  const end=cl==='scythe'?L:10;haft(cl==='scythe'?-8:3,end);grip(9);const rad=cl==='scythe'?13:9;
  p(M[1],[[end-2,1],[end+2,0],[end+3,-6],[end+1,-rad],[end-5,-rad-2],[end-11,-rad],[end-14,-rad+4],[end-7,-rad+1],[end-2,-rad+3],[end,-5]]);line(M[2],end+2,-5,end,-rad+1);line(M[2],end,-rad+1,end-5,-rad-1);r(trim,end-2,-2,3,3);
 }
 artWeaponAccents(c,it,animated);
}
drawWeapon=artWeapon;
function artShield(c,it,raised){const M=metalOf(it.rarity),x=raised?5:3,y=raised?-27:-20,pav=it.base.name==='Pavise';pxPoly(c,'#493d31',pav?[[x,y],[x+5,y-1],[x+6,y+20],[x,y+20]]:[[x+1,y],[x+4,y+1],[x+6,y+7],[x+4,y+13],[x+1,y+14],[x-1,y+7]]);pxLine(c,M[2],x,y,x,y+(pav?20:14));pxRect(c,M[1],x+1,y+6,3,4);pxRect(c,artTrim(it),x+2,y+7,1,2);if(pav){pxRect(c,'#803a36',x+2,y+3,1,13);pxRect(c,'#803a36',x+1,y+7,3,1);}}
drawShield=artShield;
function artFamilyIcon(c,it){
 const n=it.base.name,f=it.base.fam,shadow=/Shadow|Wraith|Black/.test(n),M=f==='L'?(shadow?['#252832','#464351','#80778c']:['#352b25','#71543b','#ae9063']):metalOf(it.rarity),trim=artTrim(it);
 const p=(col,a)=>pxPoly(c,col,a),r=(col,x,y,w,h)=>pxRect(c,col,x,y,w,h),line=(col,x,y,X,Y)=>pxLine(c,col,x,y,X,Y);
 const mail=(x0,y0,x1,y1)=>{for(let y=y0;y<y1;y+=2)for(let x=x0;x<x1;x+=2)r((x+y)%4?M[2]:M[0],x,y,1,1);};
 const scales=(x0,y0,x1,y1)=>{for(let y=y0;y<y1;y+=3)for(let x=x0;x<x1;x+=4){p(M[0],[[x,y],[x+4,y],[x+3,y+3],[x+1,y+3]]);line(M[2],x+1,y,x+3,y);}};
 if(it.slot==='gloves'){
  const bracer=n.includes('Bracers'),plate=f==='H',scale=n.includes('Scale');
  p(M[0],[[8,24],[9,16],[7,12],[8,10],[11,12],[11,6],[13,5],[15,6],[16,4],[18,4],[19,6],[21,5],[23,7],[24,13],[26,14],[25,20],[22,24],[23,29],[8,29]]);
  p(M[1],[[10,24],[11,16],[9,12],[12,14],[13,7],[15,7],[16,6],[18,6],[19,8],[21,7],[22,9],[22,16],[24,15],[23,21],[20,24],[21,27],[10,27]]);
  for(let x=14;x<=20;x+=3){line(M[0],x,9,x,17);r(M[2],x-1,8,1,3);}
  line(M[0],12,18,16,21);line(M[2],23,16,22,20);
  if(plate){for(let y=12;y<24;y+=4){line(M[0],12,y,21,y);line(M[2],13,y+1,20,y+1);}p(M[1],[[7,24],[23,24],[25,29],[6,29]]);line(M[2],8,25,22,25);if(n==='Plate Gauntlets'){r(trim,16,17,2,3);r(M[2],9,27,1,1);r(M[2],22,27,1,1);}}
  else if(scale)scales(12,16,21,24);
  else if(f==='M')mail(12,16,22,24);
  else{r(M[0],10,23,12,2);r(trim,16,23,3,2);line(M[2],11,19,11,22);if(bracer){r(M[1],8,22,16,7);line(M[0],10,23,21,27);r(trim,17,24,3,2);}if(shadow){line('#92869f',13,18,17,21);line('#92869f',18,18,17,21);}}
 }else if(it.slot==='boots'){
  const plate=f==='H';p(M[0],[[10,3],[22,3],[21,19],[25,21],[29,23],[29,28],[8,28],[7,24],[10,19]]);
  p(M[1],[[12,5],[20,5],[19,20],[24,23],[27,24],[27,26],[10,26],[10,23],[12,19]]);line(M[2],12,5,19,5);line(M[2],19,7,18,19);r(M[0],9,26,19,2);
  if(plate){for(let y=8;y<20;y+=4){line(M[0],11,y,20,y);line(M[2],12,y+1,19,y+1);}for(let x=18;x<27;x+=3)line(M[0],x,22,x+1,25);line(M[2],21,22,26,24);if(n==='Plate Sabatons'){p(M[1],[[9,4],[12,2],[20,2],[23,5],[20,8],[11,8]]);line(M[2],12,3,20,3);r(trim,16,12,2,3);}}
  else if(n.includes('Scale'))scales(12,8,20,20);
  else if(f==='M')mail(12,8,19,21);
  else{for(let y=9;y<19;y+=4){line(M[0],12,y,19,y+2);line(M[2],13,y+1,17,y+2);}if(n==='Running Boots'){r('#9f8c68',10,5,11,3);line('#c1aa7f',12,23,24,24);}if(shadow){r('#82768b',12,7,6,2);line('#82768b',11,24,23,24);}}
 }else if(it.slot==='helm'&&f==='L'){
  if(n==='Leather Cap'){p(M[0],[[6,14],[8,8],[12,5],[20,5],[25,10],[26,20],[22,23],[21,15],[9,15],[9,24],[6,22]]);p(M[1],[[8,13],[10,8],[14,7],[19,7],[23,11],[24,14]]);line(M[2],11,9,18,7);line(M[0],16,7,17,14);r(M[2],8,14,15,1);}
  else{p(M[0],[[4,28],[7,21],[6,14],[10,6],[16,3],[23,7],[26,15],[24,24],[28,29],[20,28],[14,26],[8,29]]);p(M[1],[[8,24],[9,14],[12,8],[16,5],[21,9],[23,15],[21,24],[24,27],[17,24],[12,25]]);p('#171c23',[[11,15],[13,11],[18,10],[21,15],[20,23],[14,24],[11,21]]);line(M[2],11,13,15,8);line(M[2],9,23,11,17);if(n.includes('Ranger')){line('#70805d',21,9,25,22);r('#a99d6d',22,24,2,2);}if(n.includes('Wraith')){line('#9896a1',12,8,16,5);line('#9896a1',7,25,6,28);}if(shadow)r('#9b86a6',18,26,2,1);}
 }else if(it.slot==='helm'){
  const sallet=n.includes('Sallet'),pot=n==='Iron Pot';p(M[0],sallet?[[4,18],[7,10],[13,5],[21,6],[25,12],[27,24],[18,24],[8,21],[4,23]]:[[7,7],[13,4],[22,6],[25,12],[24,26],[9,27],[6,20]]);
  p(M[1],[[9,11],[14,7],[20,8],[23,12],[23,22],[11,23],[9,20]]);line(M[2],11,9,17,7);
  if(sallet){line(M[2],6,18,23,15);r('#172029',14,16,11,2);p(M[1],[[6,18],[10,21],[6,24],[3,24]]);if(n.includes('Visored')){p(M[1],[[16,19],[25,18],[27,22],[21,25],[16,23]]);for(let x=19;x<25;x+=2)r(M[0],x,22,1,1);}}
  else{r('#172029',12,14,12,2);if(pot){r(M[0],15,16,3,9);line(M[2],8,8,22,7);}else{line(trim,17,8,17,25);for(let y=19;y<25;y+=2)for(let x=19;x<24;x+=2)r(M[0],x,y,1,1);}}
 }else if(it.slot==='armor'){
  p(M[0],[[10,5],[6,7],[2,12],[6,18],[9,16],[8,26],[12,29],[23,28],[24,17],[27,18],[30,12],[25,7],[21,5],[20,9],[13,9]]);
  p(M[1],[[10,8],[13,11],[20,11],[23,8],[27,12],[24,15],[22,14],[22,25],[12,26],[11,14],[7,15],[5,12]]);line(M[2],12,12,20,12);line(M[2],22,16,22,23);
  if(n.includes('Scale'))scales(12,14,22,25);
  else if(f==='M'){r('#302c30',11,13,11,12);for(let y=14;y<25;y+=3)for(let x=12;x<22;x+=3)r('#a99979',x,y,1,1);}
  else if(f==='H'){line(M[2],17,13,17,22);p(M[0],[[12,21],[17,23],[22,21],[20,25],[14,25]]);if(n==='Half Plate'){for(let y=25;y<29;y+=2)line(M[2],10,y,23,y);r(M[2],4,12,5,1);r(M[2],25,12,4,1);}}
  else{line(M[0],16,12,16,24);line(M[2],13,14,13,22);if(n==='Studded Leathers'){for(let y=14;y<23;y+=3)for(let x=12;x<23;x+=4)r('#b9aa8d',x,y,1,1);}if(n.includes('Hunter')){p('#63715a',[[8,8],[12,10],[10,21],[6,27],[4,25],[7,15]]);line('#9d9b72',8,12,6,23);}if(shadow){line('#96829d',18,13,20,20);r('#25212b',9,25,15,3);}}
  r('#302a26',10,23,14,2);r(trim,16,23,3,2);
 }else return false;
 return true;
}
function artEquipmentIcon(c,it){const n=it.base.name,M=metalOf(it.rarity),p=(col,a)=>pxPoly(c,col,a),r=(col,x,y,w,h)=>pxRect(c,col,x,y,w,h),line=(col,x,y,X,Y)=>pxLine(c,col,x,y,X,Y),trim=artTrim(it);
 if((it.slot==='gloves'||it.slot==='boots'||(['armor','helm'].includes(it.slot)&&!['Quilted Gambeson','Ring Mail','Brigandine','Plate Cuirass','Blackened Plate','Kettle Hat','Barbute','Bascinet','Great Helm','Hound Visor'].includes(n)))&&artFamilyIcon(c,it))return;
 if(it.slot==='helm'){
  if(n==='Kettle Hat'){drawKettle(c,it.rarity);return;}
  const great=n==='Great Helm',hound=n==='Hound Visor',basc=n==='Bascinet';
  p(M[0],great?[[7,6],[24,6],[25,25],[20,28],[9,26]]:[[8,13],[10,7],[15,4],[21,7],[24,13],[24,25],[9,27]]);
  p(M[1],great?[[9,7],[22,7],[23,24],[17,26],[10,24]]:[[10,13],[12,8],[16,6],[20,9],[22,15],[21,24],[11,25]]);line(M[2],great?9:13,great?7:8,20,great?7:9);
  if(n==='Barbute'){p('#171e24',[[13,13],[22,13],[22,16],[19,16],[19,25],[15,25],[15,16],[13,16]]);line(M[2],12,13,12,23);}
  else if(basc||hound){p(M[1],[[14,14],[23,13],[hound?30:28,20],[22,25],[14,22]]);line(M[2],17,14,hound?29:27,20);line('#18212a',18,17,25,18);for(let x=19;x<26;x+=2)r('#303b45',x,21,1,2);if(hound){r('#ddd3b5',25,22,2,2);r('#ddd3b5',28,21,1,2);}}
  else{r('#18212a',10,14,13,2);r(trim,16,8,1,17);r(trim,10,13,12,1);for(let y=19;y<24;y+=2)for(let x=19;x<23;x+=2)r('#18212a',x,y,1,1);}
 }else if(it.slot==='armor'){
  const cloth=n==='Quilted Gambeson',mail=n==='Ring Mail',brig=n==='Brigandine',dark=n==='Blackened Plate';const base=cloth?'#897048':brig?'#6c4033':dark?'#3d4650':M[1],shadow=cloth?'#4a3d30':brig?'#38272b':M[0];
  p(shadow,[[11,5],[7,7],[3,11],[6,17],[9,15],[8,26],[12,29],[22,29],[24,25],[23,15],[27,17],[29,11],[24,7],[21,5],[20,9],[13,9]]);
  p(base,[[11,7],[13,10],[20,10],[23,8],[25,12],[22,15],[22,23],[19,26],[11,25],[11,15],[6,14],[6,11]]);
  line(cloth?'#b39d6a':brig?'#b0774e':M[2],12,11,20,11);line(cloth?'#b39d6a':M[2],21,13,22,20);
  if(cloth){for(let x=12;x<22;x+=3)line('#5f503b',x,13,x,23);line('#b39d6a',7,9,10,11);}
  else if(mail){for(let y=13;y<25;y+=2)for(let x=12;x<22;x+=2)r((x+y)%4?'#b4b9ae':'#39424b',x,y,1,1);}
  else if(brig){for(let y=13;y<23;y+=3)for(let x=12;x<22;x+=3)r(trim,x,y,1,1);}
  else{p(M[0],[[12,20],[16,22],[21,19],[20,23],[16,25],[12,23]]);line(M[2],16,12,16,20);r(M[1],9,25,14,2);r(M[2],10,25,12,1);}
  r('#332c28',10,23,13,2);r(trim,16,23,2,2);
 }else if(it.base.cls==='shield'){
  if(n==='Pavise'){p(M[0],[[8,4],[15,2],[24,4],[25,28],[7,28]]);r('#6c5140',9,5,13,21);r('#997b53',10,6,1,19);r('#843b38',15,6,2,17);r('#843b38',11,12,10,2);line(M[2],8,4,15,2);}
  else{p(M[0],[[10,4],[21,4],[27,10],[27,21],[21,27],[10,27],[4,21],[4,10]]);p('#655444',[[11,6],[20,6],[25,11],[25,20],[20,25],[11,25],[6,20],[6,11]]);line(M[2],10,4,21,4);p(M[1],[[13,11],[19,11],[22,15],[19,20],[13,20],[10,15]]);r(M[2],14,12,4,2);r(M[0],17,16,3,3);}
 }else if(it.slot==='ring'){
  p(M[0],[[9,12],[22,12],[26,17],[26,24],[21,29],[11,29],[6,24],[6,17]]);p(M[1],[[10,14],[21,14],[24,18],[24,23],[20,27],[12,27],[8,23],[8,18]]);p('#24282b',[[12,17],[20,17],[22,20],[20,24],[12,24],[10,21]]);r(M[2],9,17,2,5);r(trim,12,7,8,8);r(artElement(it)?ART_ECOL[artElement(it)][0]:'#617786',14,8,5,5);r('#eadfbd',14,8,2,1);
 }else{
  line(trim,6,4,15,17);line(trim,25,4,17,17);p('#a89b7e',[[14,16],[19,17],[22,22],[19,25],[20,29],[17,30],[15,26],[11,25],[10,22],[13,21]]);line('#e2d9b9',14,18,12,23);r('#635c4c',16,21,2,4);r(artElement(it)?ART_ECOL[artElement(it)][0]:trim,17,18,1,2);
 }
}
const ART_ICON_CACHE=new Map();
getIcon=function(it){const key=[it.slot,it.base.name,it.rarity,it.rarity>=4?(it.name||''):'',artElement(it)||''].join('|');if(ART_ICON_CACHE.has(key))return ART_ICON_CACHE.get(key);const c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
 if(it.slot==='weapon'&&it.base.cls!=='shield'){
  // Rasterise the shared world silhouette first, then fit its actual painted bounds.
  const s=document.createElement('canvas');s.width=s.height=128;const q=s.getContext('2d');q.translate(30,65);q.rotate(-Math.PI/4);artWeapon(q,it,false);const d=q.getImageData(0,0,128,128).data;let x0=128,y0=128,x1=0,y1=0;for(let y=0;y<128;y++)for(let x=0;x<128;x++)if(d[(y*128+x)*4+3]>64){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}const w=x1-x0+1,h=y1-y0+1,sc=28/Math.max(w,h);g.drawImage(s,x0,y0,w,h,Math.round((32-w*sc)/2),Math.round((32-h*sc)/2),Math.round(w*sc),Math.round(h*sc));
 }else artEquipmentIcon(g,it);
 // Binary alpha keeps icon enlargement crisp; no grey antialiased edge fringe.
 const pixels=g.getImageData(0,0,32,32);for(let i=3;i<pixels.data.length;i+=4)pixels.data[i]=pixels.data[i]>=128?255:0;g.putImageData(pixels,0,0);if(ART_ICON_CACHE.size>512)ART_ICON_CACHE.delete(ART_ICON_CACHE.keys().next().value);ART_ICON_CACHE.set(key,c);return c;
};
