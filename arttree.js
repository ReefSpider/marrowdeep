'use strict';
/* Marrow tree art. No player state, combat RNG, clock reads or gameplay hooks.
   Coordinates are centres; time is supplied in seconds. Draw at integer scale.
   Icon catalogue deliberately records sigil fallbacks until pictures are drawn. */
const TreeArt = (() => {
  const P = Object.freeze({ink:'#0e0a0a',bone:'#ece6d8',ash:'#8a847e',blood:'#b0141a',gold:'#ffd27a'});
  const elements = Object.freeze({fire:'#ff7a2a',cold:'#8fd0ff',shock:'#fff3a0',water:'#4aa8ff',poison:'#8fe050',holy:'#ffe6a8',shadow:'#a070ff',blood:'#d0352c',wind:'#c8e8d8',bone:'#e2d6b8'});
  const attributes = Object.freeze({might:'#e07a52',finesse:'#7ad0a8',fortitude:'#8aa8e0'});
  const states = Object.freeze(['locked','reachable','allocated','preview','refusable']);
  const sizes = Object.freeze({small:10,notable:24,keystone:40,brand:32,fork:20,attunement:24,bridge:24,socket:24,paradox:48});
  const order = Object.freeze(['shadow','poison','wind','shock','holy','cold','water','bone','blood','fire']);
  const kanji = Object.freeze({fire:'火',cold:'氷',shock:'雷',water:'水',poison:'毒',holy:'聖',shadow:'影',blood:'血',wind:'風',bone:'骨'});
  const rect=(c,col,x,y,w=1,h=1)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
  function line(c,col,x,y,X,Y,w=1){x=Math.round(x);y=Math.round(y);X=Math.round(X);Y=Math.round(Y);const dx=Math.abs(X-x),dy=-Math.abs(Y-y),sx=x<X?1:-1,sy=y<Y?1:-1;let e=dx+dy;for(;;){rect(c,col,x,y,w,w);if(x===X&&y===Y)break;const q=2*e;if(q>=dy){e+=dy;x+=sx;}if(q<=dx){e+=dx;y+=sy;}}}
  function poly(c,col,points){const p=points.map(v=>v.map(Math.round)),ys=p.map(v=>v[1]);for(let y=Math.min(...ys);y<Math.max(...ys);y++){const xs=[];for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];if((a[1]<=y+.5&&b[1]>y+.5)||(b[1]<=y+.5&&a[1]>y+.5))xs.push(a[0]+(y+.5-a[1])*(b[0]-a[0])/(b[1]-a[1]));}xs.sort((a,b)=>a-b);for(let i=0;i+1<xs.length;i+=2)rect(c,col,Math.round(xs[i]),y,Math.max(1,Math.round(xs[i+1])-Math.round(xs[i])),1);}}
  function ring(c,col,x,y,r,{gap=0,phase=0,width=1,start=0,end=Math.PI*2}={}){const n=Math.max(16,Math.ceil(r*(end-start)*1.5));for(let i=0;i<n;i++){if(gap&&(i+phase)%gap<2)continue;const a=start+(end-start)*i/n;rect(c,col,x+Math.cos(a)*r,y+Math.sin(a)*r,width,width);}}
  function seal(c,col,r,cut=4){poly(c,col,[[-r+cut,-r],[r-cut,-r],[r,-r+cut],[r,r-cut],[r-cut,r],[-r+cut,r],[-r,r-cut],[-r,-r+cut]]);}
  const masks=new Map();
  function sigil(c,text,x,y,size,col=P.bone){
    const chars=Array.from(text||'髄'),n=chars.length,side=Math.floor(size/Math.max(Math.min(n,2),Math.ceil(n/2))),rows=Math.ceil(n/2);
    chars.forEach((ch,i)=>{
      const key=ch+':'+side+':'+(typeof sigOn==='function'?sigOn():true);let mask=masks.get(key);
      if(!mask){const cv=document.createElement('canvas');cv.width=cv.height=side;const g=cv.getContext('2d',{willReadFrequently:true});
        if(typeof sigCanvas==='function'&&(typeof sigOn!=='function'||sigOn()))g.drawImage(sigCanvas(ch),0,0,side,side);
        else {g.fillStyle='#fff';g.font=`${side}px serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(ch,side/2,side/2);}
        const data=g.getImageData(0,0,side,side).data;mask=[];for(let yy=0;yy<side;yy++)for(let xx=0;xx<side;xx++)if(data[(yy*side+xx)*4+3]>=96)mask.push([xx,yy]);
        if(masks.size>=512)masks.clear();masks.set(key,mask);
      }
      const cols=Math.min(n,2),ox=Math.round(x-cols*side/2+(i%2)*side),oy=Math.round(y-rows*side/2+Math.floor(i/2)*side);
      for(const [xx,yy]of mask)rect(c,col,ox+xx,oy+yy);
    });
  }
  function frame(c,kind,x,y,opt={}){
    if(!sizes[kind])throw new Error('Unknown tree frame: '+kind);
    const state=opt.state||'reachable',s=sizes[kind],r=s/2-1,t=opt.reducedMotion?0:opt.time||0;
    const edge=state==='locked'?'#494440':state==='allocated'?P.gold:state==='preview'?(Math.floor(t*4)%2?P.gold:P.bone):P.bone;
    const fill=state==='allocated'?'#685031':P.ink,accent=state==='locked'?'#494440':opt.color||P.ash;
    c.save();c.translate(Math.round(x),Math.round(y));
    if(state==='allocated'){for(let a=0;a<16;a++){const q=a*Math.PI/8;rect(c,'#60482b',Math.cos(q)*(r+3),Math.sin(q)*(r+3));}}
    if(kind==='small'){seal(c,edge,r,3);seal(c,fill,r-1,2);rect(c,state==='allocated'?P.gold:accent,-1,-2,3,3);if(opt.color)rect(c,accent,-3,1,1,2);}
    else if(kind==='brand'){seal(c,'#302a27',r,3);seal(c,state==='allocated'?P.gold:accent,r-1,3);seal(c,fill,r-3,3);for(const a of [-1,1]){rect(c,edge,a*11-1,-11,2,2);rect(c,edge,a*11-1,9,2,2);}line(c,edge,-8,-r,8,-r);line(c,edge,-8,r-1,8,r-1);}
    else if(kind==='fork'){seal(c,edge,r,2);seal(c,fill,r-1,2);rect(c,'#4a4038',-3,-r,6,2);if(opt.role)sigil(c,{might:'力',finesse:'技',fortitude:'耐'}[opt.role],5,5,6,attributes[opt.role]);}
    else if(kind==='socket'){seal(c,edge,r,5);seal(c,'#38332e',r-2,5);poly(c,P.ink,[[-8,-3],[-4,-6],[4,-6],[8,-2],[5,5],[0,7],[-6,4]]);line(c,P.ash,-6,5,-3,8);if(opt.filled){poly(c,accent,[[0,-5],[4,-1],[2,4],[-2,4],[-4,-1]]);line(c,P.bone,0,-4,-2,0);}}
    else {
      const cut=kind==='notable'||kind==='attunement'||kind==='bridge'?6:kind==='paradox'?6:4;
      seal(c,'#302a27',r,cut);seal(c,edge,r-1,cut);seal(c,fill,r-3,Math.max(3,cut-1));
      if(kind==='bridge'){c.save();c.beginPath();c.rect(-s,-s,s,s*2);c.clip();ring(c,state==='locked'?'#494440':opt.color||elements.water,0,0,r-2);c.restore();c.save();c.beginPath();c.rect(0,-s,s,s*2);c.clip();ring(c,state==='locked'?'#494440':opt.color2||elements.bone,0,0,r-2);c.restore();line(c,'#433a31',0,-r+3,0,r-3);if(opt.both&&state==='allocated'){line(c,P.gold,-6,-r+2,6,-r+2);line(c,P.gold,-6,r-2,6,r-2);}}
      if(kind==='keystone'){for(const [nx,ny]of [[0,-r+2],[-r+3,r-5],[r-3,r-5]]){rect(c,'#39312a',nx-1,ny-1,3,4);rect(c,P.bone,nx,ny-1);}}
      if(kind==='attunement'){line(c,P.ink,3,-r,0,-3,3);line(c,P.ink,0,-3,5,4,2);line(c,accent,4,-r-2,1,-5);rect(c,accent,6,-r-3,1,3);rect(c,accent,1,-r-4);}
      if(kind==='paradox'){poly(c,state==='locked'?'#494440':'#d4c7ac',[[-r+5,-r+3],[-2,-r+3],[2,-7],[-3,2],[3,9],[0,r-3],[-r+5,r-3],[-r+3,r-7],[-r+3,-r+7]]);const seam=[[-2,-r+2],[2,-8],[-3,1],[3,9],[0,r-2]],gold=state==='locked'?P.ash:P.gold;for(let i=1;i<seam.length;i++)line(c,gold,...seam[i-1],...seam[i],2);line(c,gold,0,-6,8,-11);line(c,gold,1,8,-7,13);}
    }
    if(kind!=='small'&&kind!=='socket'&&kind!=='paradox'){line(c,'#49403a',-r+4,r-2,-r+7,r-2);rect(c,P.ink,r-3,-r+4,1,2);}
    if(state==='refusable'){line(c,P.blood,-r+2,-r+3,-2,0,2);line(c,P.blood,-2,0,3,-1,2);line(c,P.blood,3,-1,r-2,r-3,2);}
    if(opt.refund)line(c,P.blood,-r,r,r,-r,2);
    if(opt.match)ring(c,P.gold,0,0,r+5,{gap:9});
    c.restore();
  }
  function heart(c,x,y,t=0,reducedMotion=false){const beat=reducedMotion?0:[0,1,2,1][Math.floor(t*2)%4];c.save();c.translate(Math.round(x),Math.round(y));
    poly(c,'#3b171b',[[-12,-12],[-5,-15],[1,-10],[7,-15],[14,-10],[15,1],[10,12],[1,22],[-9,13],[-15,3]]);
    poly(c,P.blood,[[-9,-10],[-3,-11],[1,-6],[7,-11],[11,-7],[11+beat,2],[6,12],[0,17],[-7,10],[-10,1]]);
    poly(c,'#66171c',[[-1,-5],[6,-8],[9,-4],[7,9],[0,17],[-3,5]]);
    line(c,'#d0352c',-7,-7,-6,4,2);line(c,P.blood,-3,-11,-5,-23,3);line(c,'#672026',6,-12,10,-21,3);
    for(let j=0;j<4;j++){const yy=-15+j*9,w=24-j*3;for(const sign of [-1,1]){line(c,P.ash,sign*6,yy-5,sign*w,yy,2);line(c,P.bone,sign*w,yy,sign*(w-2),yy+6,2);line(c,P.bone,sign*(w-2),yy+6,sign*9,yy+9);rect(c,P.ink,sign*w,yy+3);}}
    rect(c,P.bone,-2,-26,4,7);rect(c,P.ash,-1,23,3,5);c.restore();
  }
  function vertebra(c,x,y,opt={}){c.save();c.translate(Math.round(x),Math.round(y));const col=opt.state==='allocated'?P.gold:opt.state==='locked'?'#494440':P.bone;poly(c,col,[[-2,-5],[2,-5],[3,-2],[6,-3],[7,0],[4,3],[2,2],[2,5],[-2,5],[-2,2],[-5,3],[-7,0],[-6,-3],[-3,-2]]);rect(c,P.ink,-1,-2,2,4);rect(c,P.ash,-5,0,2,1);c.restore();}
  function connection(c,a,b,opt={}){const state=opt.state||'unallocated',t=opt.reducedMotion?0:opt.time||0,dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy),n=Math.max(1,Math.ceil(len));c.save();
    for(let i=0;i<=n;i++){const q=i/n,x=a.x+dx*q,y=a.y+dy*q;
      if(opt.chain){if(i%7<4)rect(c,i%7===0?P.bone:P.ash,x-1,y-1,3,3);else if(i%7===4)rect(c,P.ink,x,y);continue;}
      if(state==='unallocated'&&i%13>9)continue;if(state==='preview'&&(i+Math.floor(t*10))%10>5)continue;
      const col=state==='allocated'?P.gold:state==='preview'?P.bone:'#494440';rect(c,col,x,y,state==='allocated'?2:1,state==='allocated'?2:1);
      if(opt.braid){const d=Math.round(Math.sin(q*Math.PI*8+t)*2),nx=-dy/(len||1),ny=dx/(len||1);rect(c,opt.color||elements.water,x+nx*d,y+ny*d);rect(c,opt.color2||elements.bone,x-nx*d,y-ny*d);}
      if(state==='allocated'&&!opt.reducedMotion&&(i-Math.floor(t*14)+n*100)%31<3)rect(c,P.bone,x,y);
    }c.restore();
  }
  function guides(c,x,y,opt={}){const radii=opt.radii||[80,155,265];c.save();c.translate(Math.round(x),Math.round(y));
    c.save();c.globalAlpha*=.055;for(let yy=-radii[2];yy<=radii[2];yy+=5)for(let xx=-radii[2];xx<=radii[2];xx+=5){const r=Math.hypot(xx,yy);if(r<radii[0]||r>radii[2])continue;const a=(Math.atan2(yy,xx)+Math.PI/2+Math.PI*2)%(Math.PI*2);rect(c,r<radii[1]?Object.values(attributes)[Math.floor(a/(Math.PI*2/3))]:elements[order[Math.floor(a/(Math.PI/5))]],xx,yy);}c.restore();
    for(const r of radii){ring(c,'#3b302d',0,0,r,{gap:31});ring(c,'#241d1b',1,1,r-2,{gap:19});for(let i=0;i<13;i++){const a=i*2.399;line(c,P.ink,Math.cos(a)*(r-3),Math.sin(a)*(r-3),Math.cos(a)*(r+3),Math.sin(a)*(r+3));}}
    for(let i=0;i<3;i++){const a=i*Math.PI*2/3-Math.PI/2,col=Object.values(attributes)[i];c.save();c.globalAlpha*=.22;line(c,col,Math.cos(a)*radii[0],Math.sin(a)*radii[0],Math.cos(a)*radii[1],Math.sin(a)*radii[1]);sigil(c,['力','技','耐'][i],Math.cos(a+Math.PI/3)*118,Math.sin(a+Math.PI/3)*118,30,col);c.restore();}
    for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,key=order[i];c.save();c.globalAlpha*=.18;line(c,elements[key],Math.cos(a)*radii[1],Math.sin(a)*radii[1],Math.cos(a)*radii[2],Math.sin(a)*radii[2]);ring(c,elements[key],0,0,radii[2]-5,{start:a+.03,end:a+Math.PI/5-.03,gap:7});sigil(c,kanji[key],Math.cos(a+Math.PI/10)*(radii[2]+18),Math.sin(a+Math.PI/10)*(radii[2]+18),16,elements[key]);c.restore();}c.restore();
  }
  function ribcage(c,x,y,size=16,col=P.bone){c.save();c.translate(Math.round(x),Math.round(y));const scale=size/16;c.scale(scale,scale);line(c,col,0,-6,0,6);for(let j=0;j<3;j++)for(const s of [-1,1]){line(c,col,s*2,-5+j*4,s*(6-j),-3+j*4);line(c,col,s*(6-j),-3+j*4,s*3,j*4);}c.restore();}
  const glyphs=Object.freeze(['Damage','Life','Defense','Attack speed','Crit','Life steal','Regen','Run speed','Magic find','Gold find','Threat','Grit regen','Boss stagger','Carry weight','Draught healing','Crossbow damage','Penetration','Status duration','Status strength','Element damage']);
  const glyphBits=['00000100/00001100/00011000/00110000/01101000/00110000/01001000/10000000','01100110/11111111/11111111/01111110/00111100/00011000/00000000/00000000','01111110/01011010/01011010/01011010/00111100/00011000/00000000/00000000','00100100/01101100/11011000/01101100/00100100/00000000/00000000/00000000','00011000/01011010/00111100/11111111/00111100/01011010/00011000/00000000','01100000/11110010/01100111/00100010/00111100/00011000/00010000/00000000','00011000/00011000/01111110/01111110/00011000/00011000/00000000/00000000','00001100/00011000/00111110/00100000/01100000/11000000/00000000/00000000','00011000/01011010/00111100/11100111/00111100/01011010/00011000/00000000','00111100/01100110/01011010/01010010/01011010/01100110/00111100/00000000','00011000/00111100/00111100/00011000/00011000/00000000/00011000/00000000','00011100/00100000/01011010/01011010/00000100/00111000/00000000/00000000','00100100/01111110/00111100/00011000/01000010/00100100/00000000/00000000','00011000/00100100/01111110/01100110/01100110/01111110/00000000/00000000','00011000/00011000/00111100/01111110/01011010/01111110/00111100/00000000','00010000/00111000/01010100/10010010/00010000/00111000/00010000/00000000','00010000/00111000/01010100/00010000/11111110/00010000/00010000/00000000','01111110/00100100/00011000/00011000/00100100/01111110/00000000/00000000','00010000/00111000/01111100/00010000/00111000/01111100/00010000/00000000','00011000/00111100/01111110/11111111/01111110/00111100/00011000/00000000'];
  function glyph(c,name,x,y,col=P.bone){const i=glyphs.indexOf(name);if(i<0)throw new Error('Unknown tree glyph: '+name);glyphBits[i].split('/').forEach((row,yy)=>Array.from(row).forEach((v,xx)=>{if(v==='1')rect(c,col,x-4+xx,y-4+yy);}));}
  const catalogue=[];
  function add(group,name,sign,kind,color,extra={}){catalogue.push(Object.freeze({id:name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-$/,''),group,name,kanji:sign,kind,color,art:'sigil',...extra}));}
  const brands=[['Hemorrhage','血','Crimson Pact','finesse','Heart-Spike','might'],['The Hound','獣','Black Iron','fortitude','Red Maw','might'],['Grave Slam','墓','Ossuary Crash','might','Gale Crash','finesse'],['Iaidō','居','Thunder Draw','finesse','Long Draw','might'],['Shade Step','影','Marking Shade','finesse','Decoy','fortitude'],['Thousand Cuts','千','Rain of Needles','finesse','Six Executioners','might'],['Funeral Bell','鐘','Toll for Me','fortitude','Drowning Bell','finesse'],['Last Breath','息',"Martyr’s Breath",'fortitude','Vengeful Shade','might'],['Stillness','澄','Frozen Stillness','fortitude','Hallowed Stillness','might']];
  for(const [name,k,a,ar,b,br]of brands){add('Brands',name,k,'brand',P.blood,{art:'picture',iconSize:18});add('Forks',a,k,'fork',attributes[ar],{role:ar,parent:name,art:'picture',iconSize:14});add('Forks',b,k,'fork',attributes[br],{role:br,parent:name,art:'picture',iconSize:14});}
  const attrs={might:[['Headsman','首斬'],['Siegebreaker','攻城'],['Iron Grip','鉄握'],['Undertow of Iron','重力'],['Unbowed','不屈'],["Bloodletter’s Due",'血税'],['Colossus','巨像']],finesse:[['Flowing Steel','流刃'],['Deadeye','鷹目'],['Twin Fangs','双牙'],['Second Wind','再息'],['Cutpurse','掏摸'],['Featherfall','羽落'],['Paper Tiger','紙虎']],fortitude:[['Chain Warden','鎖番'],['Shieldwall','盾壁'],['Undying','不死身'],['Stone Skin','石肌'],['Long Watch','長番'],["Pilgrim’s Draught",'巡礼酒'],['Martyr','殉教']]};
  for(const [key,arr]of Object.entries(attrs))arr.forEach(([n,k],i)=>add('Attributes',n,k,i===6?'keystone':'notable',attributes[key],{role:key,art:'picture',iconSize:i===6?30:18}));
  const wedges={fire:[['Wildfire','野火'],['Pyre Walker','炎歩'],['Cinder Heart','燼心'],['Funeral Pyre','荼毘']],cold:[['Deep Winter','深冬'],['Hoarfrost','霜鎧'],['Glacial Shards','氷片'],['Permafrost','永久凍土']],shock:[['Forked Path','分岐'],['Grit Siphon','気吸'],['Static Skin','静電'],['Storm Conduit','雷導']],water:[['Tidebreak','波砕'],['Undertow','引潮'],['Rising Tide','満潮'],['Deluge','大洪水']],wind:[['Cyclone','旋風'],['Eye of the Storm','台風の目'],['Downdraft','下降気流'],['Tempest','嵐神']],poison:[['Virulence','猛毒'],['Contagion','伝染'],['Slow Decay','衰弱'],['Necrosis','壊死']],holy:[['Litany','連祷'],['Sanctuary','聖域'],["Zealot’s Fire",'狂信'],['Inquisitor','異端審問']],shadow:[['Long Shadow','長影'],['Unseen','隠形'],['Bloomreaper','花刈'],['Night Has Teeth','夜牙']],blood:[['Open Veins','開脈'],['Sanguine Shell','血殻'],['Gusher','噴血'],['Blood Price','血代']],bone:[['Spur','骨棘'],['Bone Plate','骨鎧'],['Brittle Frame','脆骨'],['Ossuary','納骨堂']]};
  for(const [key,arr]of Object.entries(wedges)){add('Elements',key[0].toUpperCase()+key.slice(1)+' Attunement',kanji[key],'attunement',elements[key],{element:key});arr.forEach(([n,k],i)=>add('Elements',n,k,i===3?'keystone':'notable',elements[key],{element:key}));}
  const bridges=[['Nightshade','夜顔'],['Pestilence','疫病'],['Squall Line','雷線'],['Wrath of Heaven','天怒'],['Pale Light','白光'],['Glacier','氷河'],['Drowned Bones','沈骨'],['Marrowmonger','髄商'],['Scald','熱傷'],['Black Flame','黒炎']];
  bridges.forEach(([n,k],i)=>add('Bridges',n,k,'bridge',elements[order[i]],{element:order[i],neighbor:order[(i+1)%10],color2:elements[order[(i+1)%10]]}));
  add('Spine','Paradox','逆','paradox',P.gold,{art:'frame'});
  function brandIcon(c,entry,x,y,opt={}){
    if(entry.art!=='picture')throw new Error('No picture icon: '+entry.name);
    const locked=opt.state==='locked',allocated=opt.state==='allocated',col=locked?'#494440':allocated?P.gold:entry.color||P.bone,hi=locked?'#645d55':P.bone,shade=locked?'#332e2b':P.ash,ink=allocated?'#685031':P.ink;
    const accent=color=>locked?'#494440':allocated?P.gold:color;
    c.save();c.translate(Math.round(x),Math.round(y));
    const r=(co,x,y,w=1,h=1)=>rect(c,co,x,y,w,h),l=(co,x,y,X,Y,w=1)=>line(c,co,x,y,X,Y,w),p=(co,pts)=>poly(c,co,pts);
    const lance=(yy,thick=1)=>{l(col,-6,yy,3,yy,thick);p(col,[[2,yy-2],[6,yy],[2,yy+2]]);r(hi,3,yy);};
    const head=(armoured=false)=>{p(col,[[-6,-5],[-3,-6],[-1,-3],[3,-3],[6,0],[4,3],[-1,3],[-5,0]]);l(hi,-5,-5,-3,-5);r(ink,1,-2,3,1);l(ink,0,1,4,1);if(armoured){l(hi,-4,-2,-1,0);l(shade,-5,0,-2,2);r(hi,4,0);}else{r(hi,1,1);r(hi,3,1);}};
    const crater=()=>{l(shade,-6,2,-3,4);l(col,-3,4,1,4);l(shade,1,4,6,1);l(col,-6,1,-3,0);l(col,3,0,6,1);};
    const person=(xx,co=col)=>{r(co,xx-1,-5,2,2);l(co,xx,-2,xx,2);l(co,xx,-1,xx-2,1);l(co,xx,2,xx-2,5);l(co,xx,2,xx+2,5);};
    const ghost=(xx=0)=>{p(col,[[xx-3,-5],[xx,-7],[xx+3,-4],[xx+2,0],[xx+3,4],[xx,3],[xx-3,5],[xx-2,0]]);r(hi,xx+1,-4);};
    const bellIcon=()=>{p(col,[[-4,1],[-3,-4],[-1,-6],[2,-6],[4,-3],[4,1],[6,2],[-6,2]]);l(hi,-2,-4,-2,0);l(hi,-5,2,5,2);r(col,0,3,2,2);};
    const heartIcon=()=>{p(col,[[-5,-3],[-3,-5],[0,-3],[3,-5],[5,-3],[4,1],[0,5],[-4,1]]);l(hi,-3,-3,-3,-1);};
    const ward=()=>{l(col,-5,-3,-3,-6);l(col,-3,-6,3,-6);l(col,3,-6,5,-3);l(col,5,-3,5,2);l(col,5,2,2,5);l(col,2,5,-3,4);l(col,-3,4,-5,1);l(col,-5,1,-5,-3);};
    switch(entry.name){
      case 'Hemorrhage': lance(-1,2);p(accent(elements.blood),[[-4,2],[-2,4],[-3,6],[-5,5]]);break;
      case 'Crimson Pact':for(const yy of [-4,0,4])lance(yy);break;
      case 'Heart-Spike':p(col,[[-6,-2],[0,-4],[6,-1],[0,2],[-6,0]]);l(hi,-4,-2,1,-2);l(shade,4,-4,6,-6);l(shade,5,1,6,3);break;
      case 'The Hound':head();l(col,-5,-5,-6,-7);l(col,-3,-6,-1,-7);break;
      case 'Black Iron':head(true);l(shade,-6,2,-3,5,2);l(hi,-5,2,-2,4);l(col,-1,4,1,4);break;
      case 'Red Maw':p(col,[[-6,-4],[-2,-6],[5,-3],[6,-1],[1,0],[-4,-1]]);p(col,[[-5,2],[1,3],[6,0],[4,4],[-1,5]]);for(const xx of [-3,0,3]){r(hi,xx,-2,1,2);r(hi,xx,2,1,1);}l(accent(elements.blood),-3,4,-3,6);break;
      case 'Grave Slam':crater();p(col,[[-2,-6],[2,-6],[2,-2],[4,-2],[0,2],[-4,-2],[-2,-2]]);r(hi,-1,-5,1,3);break;
      case 'Ossuary Crash':crater();for(const [xx,yy]of [[-5,-4],[-1,-6],[3,-4]]){p(col,[[xx-1,1],[xx,yy],[xx+2,yy+1],[xx+1,1]]);r(hi,xx,yy+1);}break;
      case 'Gale Crash':crater();l(col,-5,-3,3,-3);l(col,3,-3,5,-5);l(hi,-2,-5,3,-5);l(col,-5,-1,2,-1);l(col,-4,-6,-6,-4);break;
      case 'Iaidō':l(shade,-6,4,2,0,3);l(col,-5,2,5,-4,2);l(hi,-4,2,5,-4);l(col,-2,-1,1,3);r(hi,5,-5);break;
      case 'Thunder Draw':l(shade,-6,4,5,-5);p(col,[[1,-7],[-3,-1],[0,-1],[-2,4],[5,-3],[1,-3],[4,-7]]);r(hi,0,-2);break;
      case 'Long Draw':p(col,[[-5,5],[-1,2],[3,-2],[4,-6],[6,-3],[5,1],[1,5],[-3,6]]);l(hi,5,-4,4,0);l(col,-6,-4,-2,-4);l(col,-4,-6,-4,-2);break;
      case 'Shade Step':ghost(-2);l(hi,0,-1,5,-2);l(col,3,4,5,2);r(shade,5,5);break;
      case 'Marking Shade':ghost(-3);l(col,1,-4,6,1);l(col,6,-4,1,1);r(hi,3,-2);break;
      case 'Decoy':ghost(1);l(accent(P.blood),-6,-4,-3,-4);l(accent(P.blood),-3,-4,-3,-1);l(accent(P.blood),-6,2,-2,2);l(accent(P.blood),-2,2,0,0);break;
      case 'Thousand Cuts':for(const [xx,yy]of [[-5,-5],[-1,-7],[3,-4]]){l(col,xx,yy,xx,yy+8);l(hi,xx+1,yy+1,xx+1,yy+6);l(shade,xx-1,yy,xx+2,yy);}break;
      case 'Rain of Needles':for(const yy of [-6,0])for(const xx of [-6,-4,-2,0,2]){l(accent(elements.poison),xx,yy,xx,yy+3);r(hi,xx,yy);}break;
      case 'Six Executioners':for(const yy of [-6,0])for(const xx of [-6,-2,2]){l(col,xx,yy+1,xx,yy+4,2);l(hi,xx,yy+1,xx,yy+3);l(shade,xx-1,yy,xx+2,yy);}break;
      case 'Funeral Bell':bellIcon();l(shade,-6,-3,-6,0);l(shade,6,-4,6,-1);break;
      case 'Toll for Me':bellIcon();l(accent(P.blood),-6,-6,-4,-6);l(accent(P.blood),-6,-6,-6,-4);l(accent(P.blood),4,-6,6,-6);l(accent(P.blood),6,-6,6,-4);break;
      case 'Drowning Bell':bellIcon();l(accent(elements.water),-6,5,-4,4);l(accent(elements.water),-4,4,-1,5);l(accent(elements.water),-1,5,1,4);l(accent(elements.water),5,-5,6,-3);break;
      case 'Last Breath':heartIcon();l(hi,-6,0,-3,0);l(hi,-3,0,-1,-2);l(hi,-1,-2,1,2);l(hi,1,2,3,0);l(hi,3,0,6,0);break;
      case 'Martyr’s Breath':l(col,-6,-3,-3,-3,2);l(col,-5,-5,-5,-1,2);l(col,-2,1,0,0);l(col,0,0,2,1);l(col,2,1,5,-1);l(hi,-4,3,-1,4);break;
      case 'Vengeful Shade':p(accent(elements.fire),[[-6,3],[-5,-4],[-2,-1],[0,-7],[2,-2],[5,-5],[6,2],[2,5],[-3,5]]);p(col,[[-2,-3],[1,-4],[3,-1],[1,2],[2,4],[-2,3],[-3,4]]);r(hi,0,-2);break;
      case 'Stillness':ward();person(0,hi);r(ink,1,4,2,2);break;
      case 'Frozen Stillness':l(col,-5,1,-5,-3);l(col,-5,-3,-2,-6);l(col,-2,-6,2,-6);l(col,2,-6,5,-3);for(const [xx,yy]of [[-4,4],[0,2],[4,0]]){l(accent(elements.cold),xx-1,yy-1,xx+1,yy+1);l(hi,xx+1,yy-1,xx-1,yy+1);}break;
      case 'Hallowed Stillness':l(col,-5,1,-3,3);l(col,-5,1,-5,-2);l(col,5,-3,5,0);r(col,-1,-7,3,10);l(hi,0,-7,0,2);l(col,-4,-4,3,-4);break;
      default:c.restore();throw new Error('Missing picture icon: '+entry.name);
    }
    c.restore();
  }
  function attributeIcon(c,entry,x,y,opt={}){
    if(entry.group!=='Attributes')throw new Error('Not an attribute icon: '+entry.name);
    const locked=opt.state==='locked',allocated=opt.state==='allocated',co=locked?'#494440':allocated?P.gold:entry.color,hi=locked?'#645d55':P.bone,sd=locked?'#332e2b':P.ash,ink=allocated?'#685031':P.ink,red=locked?'#494440':P.blood;
    c.save();c.translate(Math.round(x),Math.round(y));
    const r=(col,x,y,w=1,h=1)=>rect(c,col,x,y,w,h),l=(col,x,y,X,Y,w=1)=>line(c,col,x,y,X,Y,w),p=(col,points)=>poly(c,col,points);
    const shield=(xx=0)=>{p(co,[[xx-5,-7],[xx+5,-7],[xx+5,1],[xx+2,5],[xx,7],[xx-3,4],[xx-5,0]]);l(hi,xx-4,-6,xx+3,-6);};
    const heart=(xx=0,yy=0)=>{p(co,[[xx-4,yy-2],[xx-2,yy-4],[xx,yy-2],[xx+3,yy-4],[xx+5,yy-1],[xx+3,yy+2],[xx,yy+5],[xx-3,yy+2]]);r(hi,xx-2,yy-2);};
    const person=(xx,yy,col=co)=>{r(col,xx-1,yy-6,3,3);l(col,xx,yy-2,xx,yy+3,2);l(col,xx,yy+2,xx-2,yy+7);l(col,xx+1,yy+2,xx+3,yy+7);};
    switch(entry.name){
      case 'Headsman':l(sd,-4,7,3,-7,2);p(co,[[0,-6],[4,-8],[8,-5],[7,-1],[2,0],[1,-3]]);l(hi,4,-7,7,-5);l(red,-7,5,-1,5);l(red,-4,3,-4,7);break;
      case 'Siegebreaker':shield(1);l(ink,0,-6,-2,-1,2);l(ink,-2,-1,2,2,2);l(ink,2,2,0,6,2);l(sd,-7,-2,3,-5,2);p(hi,[[-8,-5],[-6,-7],[-2,-4],[-3,-1]]);r(co,7,4,2,2);break;
      case 'Iron Grip':l(sd,0,-8,0,7,2);l(hi,-5,-6,5,-6);p(co,[[-6,-3],[-4,-5],[-1,-3],[3,-4],[6,-2],[5,4],[1,6],[-4,3]]);for(let xx=-3;xx<5;xx+=2)l(hi,xx,-2,xx,1);l(ink,-4,1,0,3);break;
      case 'Undertow of Iron':p(co,[[-4,-8],[2,-8],[3,-4],[-3,-3]]);l(sd,-1,-4,1,3,2);l(hi,-4,5,4,5);for(const s of [-1,1]){l(co,s*8,1,s*4,3);l(co,s*8,6,s*5,5);r(sd,s*7,-1);}break;
      case 'Unbowed':person(-1,-1);l(co,-1,0,5,-4,2);l(hi,4,-5,4,-8);l(hi,4,-8,7,-6);l(sd,-7,7,-1,7);l(co,-1,3,-5,4);break;
      case 'Bloodletter’s Due':p(co,[[-5,-5],[-2,-8],[3,-8],[6,-5],[6,0],[3,3],[-2,3],[-5,0]]);l(hi,-3,-5,-1,-6);r(ink,-1,-4,3,4);l(red,-3,3,-3,6);p(red,[[2,3],[4,6],[3,8],[1,7]]);break;
      case 'Flowing Steel':p(co,[[-6,5],[-4,2],[4,-7],[7,-8],[6,-5],[-3,4]]);l(hi,-4,2,5,-7);l(sd,-7,2,-3,6);l(co,-1,5,5,4);l(co,5,4,7,6);l(co,7,6,3,8);break;
      case 'Deadeye':p(co,[[-8,-2],[-4,-6],[1,-7],[7,-4],[8,-1],[4,2],[-2,3]]);p(ink,[[-5,-2],[-2,-4],[3,-4],[5,-2],[1,1],[-2,0]]);r(hi,0,-4,2,4);l(sd,-7,7,5,1);p(hi,[[3,0],[8,-1],[6,4]]);break;
      case 'Twin Fangs':p(co,[[-6,-8],[-3,-5],[5,6],[3,7],[-5,-4]]);p(hi,[[6,-8],[5,-4],[-3,7],[-5,6],[3,-5]]);l(sd,-7,3,-3,6);l(sd,3,6,7,3);break;
      case 'Second Wind':p(sd,[[-7,-7],[-3,-7],[-1,-4],[-2,-1],[0,0],[-3,2],[-3,5],[-7,6]]);l(hi,-4,-2,-2,-2);l(co,0,-3,4,-3);l(co,4,-3,6,-5);l(co,1,0,7,0);l(co,0,3,3,3);l(co,3,3,5,5);break;
      case 'Cutpurse':p(co,[[0,-1],[5,-1],[7,3],[5,7],[-1,7],[-3,4]]);l(hi,0,0,4,0);l(sd,0,-2,4,-2);p(hi,[[-8,-6],[-5,-7],[-1,-4],[2,-5],[3,-3],[-1,-1],[-4,-3],[-6,-1]]);break;
      case 'Featherfall':p(co,[[-6,4],[-6,-1],[-2,-6],[4,-8],[6,-5],[4,0],[-1,3]]);l(hi,-5,5,4,-6);l(ink,-4,-1,-1,0);l(ink,1,-5,1,-2);l(sd,-8,7,-2,7);l(sd,-2,7,-2,8);break;
      case 'Chain Warden':person(4,-1,sd);for(const [xx,yy]of [[-6,-5],[-4,-2],[-2,1],[0,3]]){l(co,xx-1,yy,xx,yy-1);l(co,xx,yy-1,xx+2,yy);l(hi,xx+2,yy,xx+1,yy+2);l(co,xx+1,yy+2,xx-1,yy);}l(co,1,2,4,1);break;
      case 'Shieldwall':for(const xx of [-5,5]){r(sd,xx,-7,2,2);l(sd,xx+1,-4,xx+1,3,2);}shield();l(hi,0,-4,0,4);l(sd,-3,-1,3,-1);break;
      case 'Undying':p(sd,[[-6,-5],[-3,-8],[4,-8],[7,-5],[7,1],[4,4],[-3,4],[-6,1]]);r(ink,-4,-4,3,3);r(ink,2,-4,3,3);heart(0,1);r(hi,-3,6,2,2);r(hi,1,6,2,2);break;
      case 'Stone Skin':p(co,[[-6,5],[-7,-1],[-5,-3],[-3,-1],[-3,-7],[-1,-8],[1,-6],[3,-7],[5,-5],[6,-1],[4,5],[0,8]]);p(sd,[[0,-5],[4,-5],[5,0],[2,5],[-1,4],[-2,0]]);l(hi,-1,-6,-1,-2);l(ink,1,0,4,1);l(ink,1,0,0,3);break;
      case 'Long Watch':l(sd,-3,-8,-3,7,2);l(hi,-3,-8,3,-8);l(co,3,-8,3,-5);p(co,[[0,-4],[6,-4],[7,3],[-1,3]]);r(ink,1,-2,4,4);r(hi,2,-1,2,3);l(co,-1,4,7,4);break;
      case 'Pilgrim’s Draught':p(co,[[-1,-6],[-4,-4],[-3,-1],[-6,2],[-5,6],[-1,8],[4,6],[5,2],[2,-1],[3,-4],[1,-6]]);l(hi,-3,2,-3,5);r(sd,-1,-8,3,2);l(sd,-3,-1,3,-1);l(hi,5,-6,8,-6);l(hi,7,-8,7,-4);break;
      case 'Colossus':
        p(sd,[[-9,-8],[-12,-3],[-10,6],[-6,7],[-5,0],[5,0],[6,7],[10,6],[12,-3],[8,-8]]);
        p(co,[[-6,-8],[6,-8],[8,1],[4,5],[-4,5],[-8,1]]);for(let j=0;j<3;j++)l(hi,-5,-6+j*3,5,-6+j*3);
        p(co,[[-5,-13],[4,-13],[6,-9],[3,-6],[-4,-7],[-6,-10]]);l(ink,-3,-10,4,-10);l(hi,-3,-13,3,-13);
        for(const s of [-1,1]){p(co,[[s*5,4],[s*8,4],[s*9,13],[s*3,13],[s*3,10]]);l(hi,s*5,6,s*6,10);p(co,[[s*6,-8],[s*11,-7],[s*13,-3],[s*7,-2]]);l(hi,s*7,-7,s*11,-6);}
        l(sd,-1,-3,-1,3,3);l(hi,-5,2,5,2);p(hi,[[-2,4],[2,4],[2,12],[0,14],[-2,12]]);l(sd,0,5,0,12);break;
      case 'Paper Tiger':
        p(co,[[-12,-2],[-6,-8],[4,-6],[10,-2],[5,3],[-5,4],[-10,1]]);p(hi,[[-6,-8],[4,-6],[-2,-1]]);l(ink,-2,-1,5,3);l(sd,-10,-1,-2,-1);
        p(co,[[4,-7],[7,-12],[9,-9],[13,-10],[14,-4],[9,0],[5,-2]]);p(hi,[[8,-8],[13,-9],[11,-5]]);r(ink,11,-5);l(ink,10,-2,13,-3);
        p(co,[[-10,1],[-6,3],[-8,10],[-12,11]]);p(hi,[[1,3],[5,2],[6,10],[2,10]]);l(co,-12,-2,-14,-7);l(co,-14,-7,-10,-11);
        p(ink,[[-6,0],[-3,1],[-5,3],[-2,5],[-7,4]]);l(hi,-8,0,-6,1);break;
      case 'Martyr':
        for(const xx of [5,10]){r(sd,xx-1,-1,3,3);l(sd,xx,3,xx,9,2);l(sd,xx,9,xx-2,13);}
        r(co,-5,-11,5,5);p(co,[[-6,-5],[-1,-5],[2,5],[-1,9],[-7,8],[-9,1]]);l(hi,-5,-4,-5,5);l(co,-7,7,-9,12,3);l(co,-2,8,0,12,3);
        l(co,-7,-3,-11,2,2);l(co,-1,-3,4,1,2);l(hi,4,0,4,5);
        for(const yy of [-7,-1,5]){l(hi,-14,yy-2,-5,yy+1);l(sd,-14,yy-2,-13,yy-5);p(red,[[-6,yy],[-3,yy+1],[-5,yy+3]]);}break;
      default:c.restore();throw new Error('Missing attribute icon: '+entry.name);
    }
    c.restore();
  }
  function node(c,entry,x,y,opt={}){
    frame(c,entry.kind,x,y,{...entry,...opt});
    if(entry.art==='picture'){if(entry.group==='Attributes')attributeIcon(c,entry,x,y,opt);else brandIcon(c,entry,x,y,opt);}
    else if(entry.kind!=='paradox'&&entry.kind!=='socket'){const size=entry.kind==='keystone'?30:entry.kind==='fork'?14:entry.kind==='brand'?22:18;sigil(c,entry.kanji,x,y,size,opt.state==='locked'?'#494440':opt.state==='allocated'?P.gold:entry.color||P.bone);}
    // Keep role tags and refusal/refund marks above the picture rather than obscured by it.
    c.save();c.translate(Math.round(x),Math.round(y));
    if(entry.kind==='fork'&&entry.role){rect(c,opt.state==='allocated'?'#685031':P.ink,3,3,5,5);sigil(c,{might:'力',finesse:'技',fortitude:'耐'}[entry.role],5,5,4,opt.state==='locked'?'#494440':attributes[entry.role]);}
    const r=sizes[entry.kind]/2-1;if(opt.state==='refusable'){line(c,P.blood,-r+2,-r+3,-2,0,2);line(c,P.blood,-2,0,3,-1,2);line(c,P.blood,3,-1,r-2,r-3,2);}if(opt.refund)line(c,P.blood,-r,r,r,-r,2);
    c.restore();
  }
  /* Combat art, batch one. World units match the game's 16 px tiles and ~30 px
     hero. All anchors are ground/feet positions; all ages are seconds.
     Callers own lifetimes, collision, character equipment and effect budgets. */
  const effectSpecs = Object.freeze([
    {id:'grave-slam',name:'Grave Slam',family:'slam',variant:'plain',duration:1.8,impactAt:.6},
    {id:'ossuary-crash',name:'Ossuary Crash',family:'slam',variant:'ossuary',duration:1.8,impactAt:.6},
    {id:'gale-crash',name:'Gale Crash',family:'slam',variant:'gale',duration:1.8,impactAt:.6},
    {id:'stillness',name:'Stillness',family:'ward',variant:'plain',duration:2,breakAt:1.3},
    {id:'frozen-stillness',name:'Frozen Stillness',family:'ward',variant:'frozen',duration:2,breakAt:1.3},
    {id:'hallowed-stillness',name:'Hallowed Stillness',family:'ward',variant:'hallowed',duration:2,breakAt:1.3},
    {id:'tidebreak',name:'Tidebreak',family:'wave',variant:'dry',duration:1.1},
    {id:'tidebreak-water',name:'Tidebreak / standing water',family:'wave',variant:'water',duration:1.1}
  ].map(Object.freeze));
  const unit=v=>Math.max(0,Math.min(1,v));
  const active=(age,duration)=>Number.isFinite(age)&&age>=0&&age<duration;
  function noise(seed,i){let n=Math.imul((seed|0)^Math.imul(i+1,374761393),668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296;}
  function ellipse(c,col,rx,ry,cy,start=0,end=Math.PI*2,gap=0){const count=128;for(let i=0;i<count;i++){if(gap&&i%gap===0)continue;const a=start+(end-start)*i/count;rect(c,col,Math.cos(a)*rx,cy+Math.sin(a)*ry);}}

  // Two authored slam stances plus a neutral preview stance. No dependency on P.
  // Palette overrides allow a caller to tint the cloth/plate before equipment binding.
  function heroPose(c,x,y,pose='idle',opt={}){
    if(!['idle','leap','crash'].includes(pose))throw new Error('Unknown tree hero pose: '+pose);
    const cloth=opt.cloth||'#3a2e2e',steel=opt.steel||'#74858b',dark='#303b45',skin='#b48a6a';
    c.save();c.translate(Math.round(x),Math.round(y));c.scale(opt.direction<0?-1:1,1);
    if(pose==='leap'){
      poly(c,'#20191d',[[-3,-23],[-8,-19],[-15,-5],[-13,-7],[-13,-1],[-9,-4],[-7,-1],[-2,-13]]);
      poly(c,cloth,[[-4,-21],[-7,-16],[-11,-5],[-7,-8],[-3,-13]]);line(c,'#574344',-6,-15,-9,-7);
      poly(c,dark,[[-4,-12],[-6,-5],[-1,-2],[4,-2],[4,-5],[-1,-6],[1,-10]]);
      poly(c,steel,[[1,-13],[6,-11],[8,-6],[5,-2],[2,-3],[4,-7],[0,-8]]);
      rect(c,P.ink,-1,-3,6,3);rect(c,P.ink,3,-2,5,3);line(c,P.ash,4,-2,7,-2);
      poly(c,dark,[[-5,-23],[2,-24],[6,-18],[4,-10],[-4,-11]]);
      poly(c,steel,[[-3,-22],[2,-22],[4,-18],[2,-12],[-2,-13]]);line(c,'#c8d5ca',-3,-22,1,-22);
      rect(c,'#604a38',-4,-12,8,2);rect(c,P.ash,1,-12,2,2);
      poly(c,dark,[[-4,-22],[-8,-26],[-6,-31],[-3,-30],[-4,-26],[0,-23]]);
      poly(c,steel,[[4,-20],[8,-25],[7,-31],[4,-32],[5,-26],[1,-23]]);
      rect(c,skin,-6,-32,3,3);rect(c,skin,4,-33,3,3);
      // Raised sword: stepped outline and separate sharpened edge.
      line(c,'#725337',-5,-33,7,-33,2);line(c,P.ash,7,-36,7,-29);
      poly(c,dark,[[9,-35],[30,-35],[34,-33],[30,-31],[9,-31]]);
      line(c,'#c8d5ca',10,-35,30,-35);line(c,steel,10,-33,31,-33);
      poly(c,skin,[[-3,-29],[1,-30],[4,-27],[3,-23],[-2,-24]]);
      poly(c,'#231b1c',[[-4,-29],[-2,-32],[2,-31],[4,-28],[0,-28],[-2,-26]]);rect(c,P.ink,2,-27);
    }else if(pose==='crash'){
      poly(c,'#20191d',[[-4,-18],[-12,-14],[-19,-4],[-16,-5],[-18,-1],[-13,-3],[-9,-1],[-3,-8]]);
      poly(c,cloth,[[-5,-17],[-11,-12],[-15,-5],[-9,-7],[-4,-10]]);line(c,'#574344',-8,-12,-12,-7);
      poly(c,dark,[[-4,-10],[-9,-8],[-11,-2],[-5,-1],[-3,-5],[3,-6]]);
      poly(c,steel,[[1,-10],[8,-7],[9,-1],[5,0],[4,-4],[-1,-5]]);
      rect(c,P.ink,-11,-2,7,2);rect(c,P.ink,5,-1,7,2);line(c,P.ash,6,-2,9,-2);
      poly(c,dark,[[-5,-19],[2,-20],[8,-13],[4,-7],[-5,-10]]);
      poly(c,steel,[[-3,-18],[1,-18],[6,-13],[3,-9],[-3,-12]]);line(c,'#c8d5ca',-3,-18,1,-18);
      line(c,'#604a38',-4,-10,3,-8,2);
      poly(c,skin,[[2,-24],[6,-24],[9,-21],[7,-17],[3,-18]]);
      poly(c,'#231b1c',[[1,-24],[3,-27],[7,-26],[9,-23],[5,-23],[3,-21]]);rect(c,P.ink,7,-21);
      line(c,dark,4,-15,11,-9,4);line(c,steel,5,-16,12,-10,2);rect(c,skin,11,-10,3,3);
      line(c,'#725337',13,-12,13,-5,2);line(c,P.ash,9,-5,18,-5);
      poly(c,steel,[[12,-3],[16,-3],[16,7],[14,10],[12,7]]);line(c,'#c8d5ca',16,-2,16,6);
    }else{
      poly(c,'#20191d',[[-3,-22],[-7,-20],[-10,-2],[-7,-4],[-5,-1],[-1,-7]]);
      poly(c,cloth,[[-4,-20],[-6,-17],[-8,-5],[-4,-7]]);
      rect(c,dark,-4,-11,3,11);rect(c,steel,2,-11,3,11);rect(c,P.ink,-5,-2,5,2);rect(c,P.ink,2,-2,6,2);
      rect(c,dark,-4,-22,9,12);rect(c,steel,-2,-21,5,10);line(c,'#c8d5ca',-2,-21,2,-21);
      rect(c,'#604a38',-4,-12,9,2);rect(c,P.ash,1,-12,2,2);
      rect(c,skin,-2,-29,6,7);poly(c,'#231b1c',[[-3,-29],[-1,-32],[3,-31],[5,-28],[1,-28],[-1,-26]]);rect(c,P.ink,3,-27);
      line(c,steel,5,-21,7,-14,3);rect(c,skin,7,-14,3,3);
      line(c,'#725337',10,-13,13,-8,2);line(c,P.ash,10,-7,16,-10);
      poly(c,steel,[[13,-7],[16,-8],[24,9],[23,13],[20,10]]);line(c,'#c8d5ca',16,-7,24,10);
    }
    c.restore();
  }
  function slamPose(age,reducedMotion=false){
    const a=Number.isFinite(age)?Math.max(0,age):0;
    if(a<.6){const q=a/.6;return {pose:'leap',offsetY:reducedMotion?-8:-Math.round(Math.sin(Math.PI*q)*28)};}
    return {pose:a<1.35?'crash':'idle',offsetY:0};
  }
  // Landing art only: age zero is impact, not takeoff. Lasts 1.2 s.
  function graveSlam(c,x,y,age,opt={}){
    if(!active(age,1.2))return;
    const q=age/1.2,variant=opt.variant||'plain',rm=!!opt.reducedMotion,seed=opt.seed|0;
    c.save();c.translate(Math.round(x),Math.round(y));c.scale(opt.direction<0?-1:1,1);
    if(opt.layer!=='front'){
      poly(c,P.ink,[[-28,0],[-18,-5],[-5,-7],[9,-6],[26,-2],[31,2],[20,7],[3,9],[-19,6]]);
      const rim=q>.83?'#39302b':'#66574a';
      for(let i=0;i<20;i++){const a=i*Math.PI/10,rx=27+(i%3),ry=6+(i%2);line(c,rim,Math.cos(a)*rx,Math.sin(a)*ry,Math.cos(a+.2)*rx,Math.sin(a+.2)*ry);}
      for(let i=0;i<7;i++){const a=i*2.399,dx=Math.cos(a),dy=Math.sin(a)*.3,r=18+i%3*3;line(c,'#4e4139',dx*7,dy*7,dx*r,dy*r);line(c,'#4e4139',dx*r,dy*r,dx*(r+6)+3,dy*(r+8)-2);}
      if(variant==='ossuary')for(let i=0;i<7;i++){
        const xx=-30+i*10,up=Math.min(1,age*9),sink=unit((1.2-age)*4),height=(13+noise(seed,i)*17)*up*sink;
        poly(c,'#8a847e',[[xx-3,3],[xx-2,-height*.65],[xx+2,-height],[xx+4,-height+5],[xx+2,3]]);
        line(c,elements.bone,xx+2,-height+2,xx,1);rect(c,P.ink,xx,-height*.45,2,2);
      }
    }
    if(opt.layer!=='back'){
      const count=rm?8:20,reach=8+Math.sqrt(q)*44;
      for(let i=0;i<count;i++){
        if(q>.65&&i%3!==0)continue;
        const a=i/count*Math.PI*2,xx=Math.cos(a)*reach,yy=Math.sin(a)*reach*.22-4*Math.sin(q*Math.PI),w=2+(i%3);
        rect(c,q>.7?'#463b33':'#8a7764',xx,yy,w,2);rect(c,'#4f443b',xx-w,yy+2,w+2,2);
      }
      if(!rm&&q<.7)for(let i=0;i<12;i++){const v=noise(seed,i+20),xx=(v-.5)*84*q,yy=-Math.sin(q*Math.PI)*(7+noise(seed,i+40)*20);rect(c,i%3?P.ash:elements.bone,xx,yy,1+i%2,2);}
      if(variant==='gale'){
        const windCount=rm?2:4;
        for(let j=0;j<windCount;j++){const yy=-8-j*10-q*16,rx=(29-j*4)*(1-q*.4),phase=rm?0:q*6;for(let i=0;i<24;i++){const a=i/24*Math.PI*1.5+phase+j;if(i%5===0)continue;rect(c,i%3?elements.wind:'#697c74',Math.cos(a)*rx,yy+Math.sin(a)*4);}}
        for(let i=0;i<(rm?2:7);i++){const xx=(noise(seed,i)-.5)*44,yy=-8-q*(25+noise(seed,i+10)*24);line(c,'#697c74',xx,yy+4,xx+2,yy);}
      }
    }
    c.restore();
  }
  // Form lasts one second; hold is steady; break lasts .7 seconds. No wall clock.
  function stillness(c,x,y,age,opt={}){
    const phase=opt.phase||'form';if(!['form','hold','break'].includes(phase))throw new Error('Unknown ward phase: '+phase);
    if(!Number.isFinite(age)||age<0||phase==='break'&&age>=.7)return;
    const variant=opt.variant||'plain',rm=!!opt.reducedMotion,col=variant==='frozen'?elements.cold:variant==='hallowed'?elements.holy:P.bone;
    c.save();c.translate(Math.round(x),Math.round(y));
    if(phase!=='break'){
      const progress=phase==='hold'?1:unit(age),end=-Math.PI/2+Math.PI*2*progress;
      if(opt.layer!=='front')ellipse(c,'#4b4138',18,23,-16,-Math.PI/2,end,9);
      if(opt.layer!=='back'){
        ellipse(c,P.bone,19,24,-16,-Math.PI/2,end,13);
        for(let i=0;i<8;i++){if((i+1)/8>progress)continue;const a=i*Math.PI/4-Math.PI/2,xx=Math.cos(a)*19,yy=-16+Math.sin(a)*24;line(c,col,xx,yy,xx+Math.cos(a)*2,yy+Math.sin(a)*2);}
        if(progress>0&&progress<1)rect(c,col,Math.cos(end)*19,-16+Math.sin(end)*24,2,2);
      }
    }else{
      const q=age/.7;
      if(opt.layer!=='front'&&variant==='hallowed'){
        const w=Math.max(1,Math.round(Math.sin(q*Math.PI)*11));
        poly(c,'#53472f',[[-w-4,2],[-w-2,-67],[-w,-77],[w,-77],[w+2,-67],[w+4,2]]);
        rect(c,elements.holy,-w,-72,w*2+1,73);rect(c,P.bone,-Math.max(1,w-3),-70,Math.max(3,w*2-5),71);
        line(c,'#fff8dc',0,-76,0,1);ellipse(c,elements.holy,9+q*28,3+q*5,0,0,Math.PI*2,7);
      }
      if(opt.layer!=='back'){
        for(let i=0;i<(rm?6:14);i++){
          if(q>.75&&i%2)continue;
          const a=i/(rm?6:14)*Math.PI*2,rx=19+q*(rm?8:21),ry=24+q*(rm?6:17),xx=Math.cos(a)*rx,yy=-16+Math.sin(a)*ry;
          line(c,q>.7?P.ash:col,xx,yy,xx-Math.sin(a)*3,yy+Math.cos(a)*3);
          if(variant==='frozen'){
            const dx=Math.cos(a),dy=Math.sin(a);poly(c,'#44718b',[[xx-dx*6,yy-dy*6],[xx-dy*2,yy+dx*2],[xx+dx*5,yy+dy*5],[xx+dy*2,yy-dx*2]]);
            line(c,elements.cold,xx-dx*4,yy-dy*4,xx+dx*4,yy+dy*4);rect(c,P.bone,xx,yy);
          }
        }
        if(variant==='hallowed')for(let i=0;i<(rm?3:8);i++)rect(c,elements.holy,(i%2?1:-1)*(8+i%3*4),-5-q*55-i*3,1,3);
      }
    }
    c.restore();
  }
  // A crest travels six tiles from the supplied origin. Water changes height,
  // foam and wake, not range or speed. No environment queries inside the renderer.
  function tidebreak(c,x,y,age,opt={}){
    if(!active(age,1.1))return;
    const tile=Number.isFinite(opt.tileSize)?Math.max(1,Math.min(64,opt.tileSize)):16;
    const q=age/1.1,wet=!!opt.standingWater,rm=!!opt.reducedMotion,xx=Math.round(q*6*tile),rise=Math.min(1,q*7,(1-q)*8),height=(wet?29:20)*rise;
    c.save();c.translate(Math.round(x),Math.round(y));c.scale(opt.direction<0?-1:1,1);
    if(opt.layer!=='front'){
      const tail=Math.max(0,xx-(wet?45:33));
      poly(c,'#193d56',[[tail,0],[xx-13,-height*.3],[xx-8,-height*.8],[xx,-height],[xx+9,-height+3],[xx+13,-height+9],[xx+9,-height+13],[xx+3,-height+11],[xx+4,-height+7],[xx,-height+6],[xx-1,-height*.35],[xx+14,1],[xx+7,4],[tail,3]]);
      poly(c,elements.water,[[Math.max(0,xx-23),0],[xx-9,-height*.45],[xx-5,-height+3],[xx+1,-height],[xx+8,-height+3],[xx+11,-height+8],[xx+8,-height+11],[xx+5,-height+9],[xx+6,-height+6],[xx+1,-height+4],[xx-2,-height*.35],[xx+10,0]]);
      line(c,'#2b6d98',tail,2,xx+10,2,2);
    }
    if(opt.layer!=='back'){
      line(c,'#d5edf2',xx-5,-height+2,xx+1,-height);line(c,'#d5edf2',xx+1,-height,xx+8,-height+3,2);line(c,'#d5edf2',xx+8,-height+3,xx+10,-height+7);
      rect(c,P.bone,xx+7,-height+8,3,2);
      const count=rm?3:wet?12:8;
      for(let i=0;i<count;i++){const p=(q*2.5+i/count)%1,dx=5+i%4*3+p*10,yy=-height+4-Math.sin(p*Math.PI)*(wet?14:8)+p*height;rect(c,i%3?elements.water:'#d5edf2',xx+dx,Math.min(2,yy),1+i%2,2);}
      for(let i=0;i<(rm?3:8);i++){const wx=xx-5-i*5;if(wx<0)continue;rect(c,i%2?'#2b6d98':'#9bcfdd',wx,1+i%2,3,1);}
    }
    c.restore();
  }
  // Complete preview timeline. Effects alone by default; hero is an explicit opt-in.
  // Gameplay may call the three lower-level renderers in its own phases/layers.
  function effect(c,id,x,y,age,opt={}){
    const spec=effectSpecs.find(e=>e.id===id);if(!spec)throw new Error('Unknown tree effect: '+id);
    if(!active(age,spec.duration))return;
    const o={...opt,variant:spec.variant};
    if(spec.family==='slam'){
      const a=age-spec.impactAt;graveSlam(c,x,y,a,{...o,layer:'back'});
      if(opt.hero){const p=slamPose(age,opt.reducedMotion);heroPose(c,x,y+p.offsetY,p.pose,opt);}
      graveSlam(c,x,y,a,{...o,layer:'front'});
    }else if(spec.family==='ward'){
      const phase=age<1?'form':age<spec.breakAt?'hold':'break',a=phase==='break'?age-spec.breakAt:age;
      stillness(c,x,y,a,{...o,phase,layer:'back'});if(opt.hero)heroPose(c,x,y,'idle',opt);stillness(c,x,y,a,{...o,phase,layer:'front'});
    }else{if(opt.hero)heroPose(c,x,y,'idle',opt);tidebreak(c,x,y,age,{...o,standingWater:spec.variant==='water'});}
  }
  const comboArt = Object.freeze([
    {id:'pale-light',name:'Pale Light',kanji:'白光',color:elements.holy,duration:1.1},
    {id:'drowned-bones',name:'Drowned Bones',kanji:'沈骨',color:elements.bone,duration:1.6},
    {id:'black-flame',name:'Black Flame',kanji:'黒炎',color:elements.shadow,duration:1.4}
  ].map(Object.freeze));
  const combatSpecs = Object.freeze([
    ...['rise','idle','walk','swing','crumble'].map(pose=>({id:'thrall-'+pose,name:'Bone Thrall / '+pose,family:'thrall',pose,duration:pose==='swing'?.6:pose==='idle'||pose==='walk'?1:.8})),
    {id:'sanguine-shell',name:'Sanguine Shell',family:'defense',duration:2},
    {id:'bone-plate',name:'Bone Plate',family:'defense',duration:2},
    ...comboArt.map(s=>({...s,family:'combo'}))
  ].map(Object.freeze));
  // Ghoul-scale ally: feet at the anchor, hunched splinter skeleton ~28 px tall.
  function boneThrall(c,x,y,pose,age,opt={}){
    if(!['rise','idle','walk','swing','crumble'].includes(pose))throw new Error('Unknown thrall pose: '+pose);
    if(!Number.isFinite(age)||age<0||(['rise','crumble'].includes(pose)&&age>=.8)||(pose==='swing'&&age>=.6))return;
    const rm=!!opt.reducedMotion,q=unit(age/(pose==='swing'?.6:.8)),seed=opt.seed|0;
    c.save();c.translate(Math.round(x),Math.round(y));c.scale(opt.direction<0?-1:1,1);
    if(pose==='crumble'){
      for(let i=0;i<(rm?9:18);i++){
        if(q>.85&&i%3)continue;const xx=(noise(seed,i)-.5)*(12+q*(rm?9:29)),yy=-24+noise(seed,i+30)*24;
        const drop=Math.min(1,noise(seed,i+60)*.12+q*1.05),Y=yy*(1-drop)-Math.sin(q*Math.PI)*(rm?0:5);
        line(c,i%3?P.bone:P.ash,xx,Y,xx+(i%2?2:-2),Y+2);if(i===0&&q<.25)rect(c,P.gold,xx,Y);
      }
      c.restore();return;
    }
    if(pose==='rise'){c.beginPath();c.rect(-40,-50,80,51);c.clip();c.translate(0,Math.round(27*(1-q)*(1-q)));}
    const walk=pose==='walk'?Math.round(Math.sin(age*Math.PI*2)*(rm?1:3)):0;
    const bob=pose==='idle'&&!rm?Math.floor(age*3)%2:0;
    const swing=pose==='swing'?Math.sin(q*Math.PI):0;
    c.translate(0,bob);
    function bone(ax,ay,bx,by){line(c,'#736e63',ax,ay,bx,by,2);line(c,P.bone,ax,ay,bx,by);rect(c,elements.bone,ax-1,ay,2,2);}
    bone(-3,-10,-5+walk,-5);bone(-5+walk,-5,-6+walk,-1);line(c,P.bone,-7+walk,0,-3+walk,0);
    bone(2,-10,5-walk,-6);bone(5-walk,-6,3-walk,-1);line(c,P.bone,2-walk,0,7-walk,0);
    poly(c,'#736e63',[[-5,-12],[3,-13],[5,-10],[1,-8],[-3,-9]]);line(c,P.bone,-4,-12,2,-12);rect(c,P.ink,-1,-11,2,2);
    bone(-1,-11,-3,-21);for(let j=0;j<4;j++)rect(c,P.bone,-4+j%2,-12-j*3,3,1);
    // Separate ribs with black gaps, rather than a solid white torso.
    for(let j=0;j<3;j++){const yy=-21+j*3;line(c,P.ash,-3,yy,-7,yy+2);line(c,P.bone,-7,yy+2,-3,yy+3);line(c,P.bone,-1,yy,4,yy+1);line(c,P.ash,4,yy+1,2,yy+3);}
    bone(-6,-21,-10,-15);bone(-10,-15,-9,-8);line(c,P.bone,-10,-8,-12,-5);
    const ex=pose==='swing'?4+Math.round(swing*10):7,ey=pose==='swing'?-24+Math.round(q*14):-17;
    bone(3,-21,ex,ey);bone(ex,ey,ex+4,ey+5);line(c,P.bone,ex+4,ey+5,ex+8,ey+7);
    if(pose==='swing'){poly(c,elements.bone,[[ex+6,ey+5],[ex+15,ey+3],[ex+10,ey+8],[ex+7,ey+8]]);if(!rm&&q>.35&&q<.75)line(c,'#736e63',ex+14,ey-4,ex+19,ey+4);}
    poly(c,P.ash,[[-4,-27],[1,-29],[6,-27],[7,-23],[4,-20],[-1,-21],[-4,-24]]);
    poly(c,P.bone,[[-3,-27],[1,-28],[5,-26],[5,-23],[2,-22],[-1,-23]]);
    rect(c,P.ink,-1,-25,2,2);rect(c,'#54452b',3,-25,3,2);rect(c,P.gold,4,-25);line(c,P.bone,1,-21,4,-21);rect(c,P.ink,2,-22);
    // Broken bone spurs on shoulder and crown.
    line(c,elements.bone,-6,-21,-9,-25);line(c,P.bone,-3,-27,-5,-30);
    c.restore();
  }
  function shieldBar(c,x,y,shield,life=1,width=34){
    const s=Number.isFinite(shield)?unit(shield):0,hp=Number.isFinite(life)?unit(life):0,w=Number.isFinite(width)?Math.round(Math.max(8,Math.min(160,width))):34;
    c.save();rect(c,P.ink,x-1,y-1,w+2,10);rect(c,'#3d2624',x,y,w,3);
    if(s>0){rect(c,elements.blood,x,y,Math.max(1,Math.round(w*s)),3);line(c,'#ef7261',x,y,x+Math.max(0,Math.round(w*s)-1),y);}
    rect(c,'#302624',x,y+5,w,3);if(hp>0)rect(c,P.blood,x,y+5,Math.max(1,Math.round(w*hp)),3);c.restore();
  }
  function sanguineShell(c,x,y,age,opt={}){
    if(!Number.isFinite(age)||age<0)return;
    const strength=Number.isFinite(opt.strength)?unit(opt.strength):1;if(strength<=0)return;
    c.save();c.translate(Math.round(x),Math.round(y));
    const shift=opt.reducedMotion?0:Math.floor(age*5)%3;
    for(let i=0;i<100;i++){
      if(i%5===0||i/100>strength&&i%3!==0)continue;
      const a=i/100*Math.PI*2,front=Math.cos(a)>=0;
      if(opt.layer==='back'&&front||opt.layer==='front'&&!front)continue;
      const xx=Math.cos(a)*12,yy=-16+Math.sin(a)*19;
      rect(c,i%4?P.blood:elements.blood,xx,yy);if(i%11===shift)rect(c,'#66171c',xx*.8,yy,1,2);
    }
    if(opt.layer!=='back')for(let i=0;i<4;i++)rect(c,elements.blood,-5+i*3,-7+(i+shift)%3,1,2);
    c.restore();
  }
  function bonePlate(c,x,y,age,opt={}){
    if(!Number.isFinite(age)||age<0)return;
    const count=Number.isFinite(opt.count)?Math.max(0,Math.min(3,Math.floor(opt.count))):3;
    c.save();c.translate(Math.round(x),Math.round(y));
    for(let i=0;i<count;i++){const xx=(i-1)*9;poly(c,P.ash,[[xx-3,-39],[xx+2,-40],[xx+3,-35],[xx,-33],[xx-3,-35]]);line(c,P.bone,xx-2,-38,xx+1,-39);line(c,elements.bone,xx+1,-38,xx+1,-35);}
    if(Number.isInteger(opt.shatterSlot)&&opt.shatterSlot>=0&&opt.shatterSlot<3&&active(opt.hitAge,.55)){
      const q=opt.hitAge/.55,xx=(opt.shatterSlot-1)*9;
      for(let i=0;i<(opt.reducedMotion?4:8);i++){const a=i*Math.PI/4,reach=2+q*(opt.reducedMotion?6:14),dx=Math.cos(a),dy=Math.sin(a);line(c,i%2?P.bone:P.ash,xx+dx*reach,-36+dy*reach+q*q*8,xx+dx*(reach+2),-36+dy*(reach+2)+q*q*8);}
    }
    c.restore();
  }
  function paleLight(c,x,y,age,opt={}){
    if(!active(age,1.1))return;const q=age/1.1,rm=!!opt.reducedMotion;
    c.save();c.translate(Math.round(x),Math.round(y));
    if(q<.4){poly(c,'#29485a',[[-12,0],[-14,-24],[-8,-38],[4,-41],[12,-29],[13,0]]);poly(c,'#517d94',[[-8,-2],[-10,-23],[-5,-36],[2,-37],[8,-27],[9,-2]]);line(c,elements.cold,-7,-31,-3,-36);line(c,elements.cold,7,-24,9,-7);line(c,'#a6dded',-4,-35,0,-21);line(c,'#a6dded',0,-21,-3,-8);}
    if(q>.18&&q<.8){const reach=unit((q-.18)*5),w=q<.4?2:rm?4:7;rect(c,'#4b5960',-w-2,-64,(w+2)*2+1,Math.round(64*reach));rect(c,P.bone,-w,-64,w*2+1,Math.round(64*reach));line(c,'#ffffff',0,-64,0,-64+64*reach);}
    if(q>=.36){const p=(q-.36)/.64;for(let i=0;i<(rm?6:14);i++){if(p>.85&&i%2)continue;const a=i*2.399,reach=8+p*(rm?13:30),xx=Math.cos(a)*reach,yy=-20+Math.sin(a)*reach*.7+p*9;poly(c,P.bone,[[xx-2,yy+3],[xx,yy-5],[xx+3,yy+1]]);line(c,elements.cold,xx-1,yy,xx,yy+2);}}
    c.restore();
  }
  function drownedBones(c,x,y,age,opt={}){
    if(!active(age,1.6))return;const q=age/1.6,form=Math.min(1,q*5,(1-q)*6),rm=!!opt.reducedMotion;
    c.save();c.translate(Math.round(x),Math.round(y));
    const radius=28*form;
    if(opt.layer!=='front'){poly(c,'#131e24',[[-radius,0],[-radius+7,-5],[0,-7],[radius-5,-4],[radius,2],[radius-8,6],[-radius+6,5]]);ellipse(c,'#28516b',radius,5,0,0,Math.PI*2,8);}
    if(opt.layer!=='back'){
      // Opaque foreground masks the feet to suggest knee-deep black water.
      poly(c,'#101419',[[-radius,0],[-12,-4],[-8,-10*form],[9,-10*form],[13,-3],[radius,0],[radius-4,5],[-radius+4,5]]);
      for(let i=0;i<6;i++){const xx=-22+i*9,ht=(7+i%3*5)*form;poly(c,P.ash,[[xx-2,2],[xx-1,-ht],[xx+2,-ht-3],[xx+3,-ht+1],[xx+1,3]]);line(c,P.bone,xx+1,-ht-1,xx,0);}
      for(let i=0;i<4;i++){const shift=rm?0:Math.floor(age*4+i)%3;line(c,'#2a4e65',-19+i*11,2+shift,-15+i*11,2+shift);}
    }
    c.restore();
  }
  function blackFlame(c,x,y,age,opt={}){
    if(!active(age,1.4))return;const q=age/1.4,rm=!!opt.reducedMotion,dir=opt.direction<0?-1:1;
    c.save();c.translate(Math.round(x),Math.round(y));c.scale(dir,1);
    for(let j=0;j<3;j++){
      const delay=j*.2,p=unit((q-delay)/(1-delay));if(q<delay)continue;
      const xx=j*24,ht=(22-j*3)*Math.min(1,p*9,(1-p)*6),flutter=rm?0:Math.floor(age*9+j)%3;
      poly(c,'#281932',[[xx-8,0],[xx-10,-8],[xx-5,-ht*.6],[xx-4,-ht-5],[xx+1,-ht*.6],[xx+5,-ht-2+flutter],[xx+7,-9],[xx+10,-3],[xx+6,2]]);
      poly(c,elements.shadow,[[xx-5,0],[xx-6,-8],[xx-2,-ht-2],[xx,-ht*.4],[xx+4,-ht+4],[xx+5,-6],[xx+3,1]]);
      poly(c,P.ink,[[xx-2,0],[xx-3,-6],[xx,-ht*.55],[xx+2,-7],[xx+3,1]]);
      // The mark is relayed to each successive flame; no status is applied here.
      if(p>.2&&p<.85){line(c,'#c6a0ef',xx-3,-ht-12,xx+3,-ht-6);line(c,elements.shadow,xx+3,-ht-12,xx-3,-ht-6);rect(c,elements.shadow,xx,-ht-15);}
      if(!rm)for(let i=0;i<3;i++)rect(c,'#70469b',xx-4+i*4,-ht-5-(age*12+i*3)%10);
    }
    c.restore();
  }
  // DOM-only cosmetic popup factory. Uses existing .cpop markup; no Codex/save writes.
  function comboPopup(doc,id){const spec=comboArt.find(s=>s.id===id);if(!spec)throw new Error('Unknown combo art: '+id);const el=doc.createElement('div'),b=doc.createElement('b');el.className='cpop';el.style.setProperty('--tc',spec.color);b.textContent=spec.kanji;el.append(b,doc.createTextNode(spec.name));return el;}
  function combatEffect(c,id,x,y,age,opt={}){
    const spec=combatSpecs.find(s=>s.id===id);if(!spec)throw new Error('Unknown combat art: '+id);if(!active(age,spec.duration))return;
    if(spec.family==='thrall'){boneThrall(c,x,y,spec.pose,age,opt);return;}
    if(id==='sanguine-shell'){
      const strength=1-age/spec.duration;
      sanguineShell(c,x,y,age,{...opt,strength,layer:'back'});if(opt.hero)heroPose(c,x,y,'idle',opt);sanguineShell(c,x,y,age,{...opt,strength,layer:'front'});
      shieldBar(c,x-17,y-50,strength,.75);return;
    }
    if(id==='bone-plate'){if(opt.hero)heroPose(c,x,y,'idle',opt);const lost=Math.min(3,Math.floor(age/.5));bonePlate(c,x,y,age,{...opt,count:3-lost,shatterSlot:3-lost,hitAge:age-lost*.5});return;}
    if(id==='pale-light'){if(opt.hero&&age<.4)heroPose(c,x,y,'idle',opt);paleLight(c,x,y,age,opt);}
    if(id==='drowned-bones'){drownedBones(c,x,y,age,{...opt,layer:'back'});if(opt.hero)heroPose(c,x,y,'idle',opt);drownedBones(c,x,y,age,{...opt,layer:'front'});}
    if(id==='black-flame'){if(opt.hero)heroPose(c,x,y,'idle',opt);blackFlame(c,x,y,age,opt);}
  }
  const brandSpecs=Object.freeze([
    {id:'heart-spike',name:'Heart-Spike',duration:1.2,note:'One heavy blood lance / stagger flash'},
    {id:'black-iron',name:'Black Iron Hound',duration:1.6,note:'Heavy plate / brace / strike / recovery'},
    {id:'red-maw',name:'Red Maw',duration:1.2,note:'Hound blow / blood crescent / falling droplets'},
    {id:'thunder-draw',name:'Thunder Draw',duration:1.4,note:'Draw cut / delayed lightning wounds'},
    {id:'long-draw',name:'Long Draw',duration:1.5,note:'Charge glint / wide crescent / settle'}
  ].map(Object.freeze));
  function glint(c,x,y,col,r=3){line(c,col,x-r,y,x+r,y);line(c,col,x,y-r,x,y+r);rect(c,P.bone,x,y);}
  function heartSpike(c,x,y,age,opt={}){
    if(!active(age,1.2))return;const q=age/1.2,rm=!!opt.reducedMotion;
    c.save();c.translate(Math.round(x),Math.round(y));c.scale(opt.direction<0?-1:1,1);
    const reach=8+unit(q*2.8)*56,thick=(q<.65?5:Math.max(1,Math.round((1-q)*12)));
    poly(c,'#4c1117',[[0,-19],[reach-18,-19-thick],[reach+4,-18],[reach-18,-16+thick],[0,-16]]);
    poly(c,elements.blood,[[2,-18],[reach-19,-18-thick+1],[reach+3,-18],[reach-19,-17+thick-1],[6,-17]]);
    line(c,'#ef7261',8,-19,reach-12,-20);line(c,P.blood,reach-17,-22,reach-9,-18);
    // One thick lance; short cracks read as a heavy stagger rather than extra spears.
    if(q>.29&&q<.58){const radius=rm?6:11;for(let i=0;i<6;i++){const a=i*Math.PI/3;line(c,i%2?P.bone:elements.blood,63+Math.cos(a)*4,-18+Math.sin(a)*4,63+Math.cos(a)*radius,-18+Math.sin(a)*radius);}}
    for(let i=0;i<(rm?3:8);i++){const p=unit((q-.2-i*.025)*1.6);if(!p)continue;rect(c,i%2?P.blood:elements.blood,12+i*6+p*5,-16+p*p*18,1+i%2,2);}
    c.restore();
  }
  // The existing Hound is a transformed humanoid in black armour, not a dog.
  function houndForm(c,x,y,age,opt={}){
    if(!Number.isFinite(age)||age<0)return;
    const heavy=opt.variant!=='red-maw',pose=opt.pose||'idle';if(!['idle','brace','strike'].includes(pose))throw new Error('Unknown Hound pose: '+pose);
    const lean=pose==='strike'?4:pose==='brace'?-2:0,drop=pose==='brace'?3:0;
    const dark='#141216',plate=heavy?'#35363c':'#292129',edge=heavy?'#78777b':'#60464b';
    c.save();c.translate(Math.round(x),Math.round(y));c.scale(opt.direction<0?-1:1,1);
    poly(c,'#21191e',[[-5,-24],[-10,-17],[-15,-2],[-11,-4],[-9,0],[-6,-4],[0,-12]]);
    for(const [xx,end]of [[-5,-7],[3,pose==='strike'?10:5]]){
      poly(c,dark,[[xx,-13],[xx+4,-13],[end+4,-3],[end+4,0],[end-1,0],[end,-5]]);
      line(c,plate,xx+1,-11,end+1,-3,2);rect(c,edge,xx,-8,4,2);rect(c,plate,end-1,-3,6,3);line(c,edge,end,-3,end+3,-3);
    }
    c.translate(lean,drop);
    poly(c,dark,[[-7,-26],[4,-27],[8,-21],[5,-10],[-5,-10],[-8,-19]]);
    poly(c,plate,[[-5,-25],[3,-25],[6,-20],[3,-12],[-3,-12],[-6,-19]]);
    for(let j=0;j<3;j++){line(c,edge,-5,-23+j*4,0,-21+j*4);line(c,edge,0,-21+j*4,4,-24+j*4);}
    rect(c,'#4a2529',-4,-12,8,2);rect(c,P.ash,0,-12,2,2);
    // Overlapping shoulder plates and broad gauntlets make Black Iron visibly heavier.
    for(const s of [-1,1]){const xx=s*6;poly(c,plate,[[xx-4,-26],[xx+3,-27],[xx+5,-22],[xx+2,-19],[xx-4,-21]]);line(c,edge,xx-3,-25,xx+2,-26);if(heavy){line(c,edge,xx-3,-22,xx+3,-22);rect(c,dark,xx-2,-21,4,2);}}
    const handX=pose==='strike'?22:pose==='brace'?9:11,handY=pose==='strike'?-19:pose==='brace'?-23:-12;
    line(c,dark,6,-22,handX,handY,heavy?5:4);line(c,plate,6,-23,handX,handY-1,3);rect(c,edge,handX-1,handY-2,4,2);
    line(c,dark,-7,-22,-9,-12,4);line(c,plate,-7,-21,-8,-14,2);rect(c,plate,-10,-14,4,5);
    if(pose==='strike'){
      line(c,'#5c4541',handX+2,handY,handX+8,handY,2);line(c,edge,handX+7,handY-4,handX+7,handY+4);
      poly(c,plate,[[handX+9,handY-3],[handX+29,handY-3],[handX+33,handY],[handX+28,handY+2],[handX+9,handY+2]]);line(c,'#b1a5a3',handX+10,handY-3,handX+28,handY-3);
    }
    poly(c,dark,[[-5,-32],[-2,-36],[4,-35],[7,-30],[10,-28],[8,-24],[1,-25],[-4,-28]]);
    poly(c,plate,[[-3,-32],[0,-34],[3,-33],[5,-29],[8,-28],[6,-26],[0,-28]]);
    line(c,edge,-3,-32,0,-34);line(c,edge,2,-32,7,-28);rect(c,P.blood,3,-30,3,1);
    poly(c,dark,[[-4,-31],[-8,-39],[-2,-34]]);line(c,edge,-7,-37,-4,-33);
    poly(c,dark,[[0,-34],[0,-41],[4,-34]]);line(c,edge,1,-39,2,-35);
    line(c,heavy?'#918583':elements.blood,3,-26,7,-26);for(let i=0;i<3;i++)rect(c,P.bone,3+i*2,-26,1,2);
    if(!heavy)rect(c,elements.blood,6,-24,1,3);
    c.restore();
  }
  function redMaw(c,x,y,age,opt={}){
    if(!active(age,.75))return;const q=age/.75,rm=!!opt.reducedMotion;
    c.save();c.translate(Math.round(x),Math.round(y));c.scale(opt.direction<0?-1:1,1);
    if(q<.65)for(let i=0;i<32;i++){const a=-1.1+i/31*1.8,rx=25+q*14,xx=9+Math.cos(a)*rx,yy=-18+Math.sin(a)*19;if(i%7===0)continue;rect(c,P.blood,xx,yy,2,2);if(i%3===0)rect(c,elements.blood,xx+1,yy);}
    for(let i=0;i<(rm?4:13);i++){const v=noise(opt.seed|0,i),p=q,xx=17+i*2+p*(12+v*13),yy=-22+(v-.5)*17-12*p+25*p*p;line(c,i%3?P.blood:elements.blood,xx,yy,xx+1,yy+2+(i%3));}
    c.restore();
  }
  function drawCutPose(c,x,y,age,opt={}){
    if(!Number.isFinite(age)||age<0)return;const drawn=!!opt.drawn;
    c.save();c.translate(Math.round(x),Math.round(y));c.scale(opt.direction<0?-1:1,1);
    poly(c,'#231b20',[[-4,-23],[-9,-17],[-15,-4],[-11,-5],[-8,-2],[-3,-10]]);
    poly(c,'#3a2e2e',[[-4,-21],[-8,-15],[-11,-6],[-6,-8]]);
    poly(c,'#303b45',[[-4,-12],[-8,-5],[-10,-1],[-5,0],[0,-8],[5,-6],[8,0],[12,0],[9,-9],[3,-13]]);
    line(c,'#74858b',3,-10,8,-5,2);line(c,P.ash,8,-2,11,-2);
    poly(c,'#303b45',[[-5,-24],[2,-24],[6,-18],[3,-10],[-4,-12]]);poly(c,'#74858b',[[-3,-23],[1,-23],[4,-18],[1,-12],[-2,-13]]);line(c,'#c8d5ca',-3,-23,1,-23);
    rect(c,'#604a38',-4,-12,8,2);poly(c,'#b48a6a',[[-1,-30],[4,-30],[7,-26],[5,-23],[0,-24]]);poly(c,'#231b1c',[[-2,-30],[0,-33],[4,-32],[7,-28],[3,-28],[0,-26]]);
    // Sheath remains behind the hip during both charge and release.
    line(c,'#413438',-5,-13,-22,-8,3);line(c,P.ash,-6,-14,-9,-13);
    if(drawn){line(c,'#74858b',4,-21,17,-18,3);rect(c,'#b48a6a',17,-19,3,3);line(c,'#725337',19,-18,24,-18,2);line(c,P.ash,24,-21,24,-14);poly(c,'#74858b',[[26,-19],[48,-21],[52,-20],[47,-18],[26,-17]]);line(c,'#c8d5ca',26,-19,48,-21);}
    else{line(c,'#74858b',4,-21,9,-16,3);line(c,'#74858b',9,-16,0,-14,2);rect(c,'#b48a6a',-1,-15,3,2);line(c,P.ash,-2,-16,0,-11);}
    c.restore();
  }
  function thunderDraw(c,x,y,age,opt={}){
    if(!active(age,1.4))return;const rm=!!opt.reducedMotion;
    c.save();c.translate(Math.round(x),Math.round(y));c.scale(opt.direction<0?-1:1,1);
    // Three fixed wounds open in sequence; no random branching or target mutation.
    for(let i=0;i<3;i++){
      const start=.18+i*.11,open=.58+i*.12,xx=27+i*11;
      if(age<start||age>1.28+i*.04)continue;
      line(c,'#59494f',xx-5,-31,xx+3,-9);
      if(age>=open){const p=unit((age-open)/.48),col=p>.8?'#807b55':elements.shock;
        const points=[[xx-5,-34],[xx,-27],[xx-3,-23],[xx+4,-17],[xx+1,-12],[xx+6,-6]];
        for(let j=1;j<points.length;j++){line(c,'#736a40',...points[j-1],...points[j],2);line(c,col,...points[j-1],...points[j]);}
        if(!rm){line(c,col,xx,-26,xx+8,-29);line(c,col,xx+8,-29,xx+6,-33);}
        if(p<.45)glint(c,xx,-22,P.bone,rm?2:3);
      }
    }
    c.restore();
  }
  function longDraw(c,x,y,age,opt={}){
    if(!active(age,1.5))return;const rm=!!opt.reducedMotion;
    c.save();c.translate(Math.round(x),Math.round(y));c.scale(opt.direction<0?-1:1,1);
    if(age<.6){const r=2+Math.floor(age/.6*(rm?2:4));glint(c,-1,-14,P.gold,r);if(!rm){rect(c,'#8a7764',-9,-14);rect(c,'#8a7764',5,-19);}}
    else{const p=(age-.6)/.9,end=-1.35+unit(p*2.4)*2.8,start=Math.max(-1.35,end-(rm?.8:1.8));
      if(p<.85)for(let i=0;i<70;i++){const a=start+(end-start)*i/69,rr=40;rect(c,'#7a7974',5+Math.cos(a)*(rr-3),-18+Math.sin(a)*(rr-3)*.7,2,2);rect(c,P.bone,5+Math.cos(a)*rr,-18+Math.sin(a)*rr*.7,2,2);if(i%4===0)rect(c,P.gold,5+Math.cos(a)*(rr+2),-18+Math.sin(a)*(rr+2)*.7);}
    }
    c.restore();
  }
  function brandEffect(c,id,x,y,age,opt={}){
    const spec=brandSpecs.find(s=>s.id===id);if(!spec)throw new Error('Unknown Brand art: '+id);if(!active(age,spec.duration))return;
    if(id==='black-iron'){houndForm(c,x,y,age,{...opt,variant:id,pose:age<.45?'idle':age<.8?'brace':age<1.2?'strike':'idle'});return;}
    if(id==='red-maw'){if(opt.hero)houndForm(c,x,y,age,{...opt,variant:id,pose:age<.25?'brace':age<.8?'strike':'idle'});redMaw(c,x,y,age-.25,opt);return;}
    if(id==='heart-spike'){if(opt.hero)heroPose(c,x,y,'idle',opt);heartSpike(c,x,y,age,opt);return;}
    if(opt.hero)drawCutPose(c,x,y,age,{...opt,drawn:age>(id==='long-draw'?.6:.18)});
    if(id==='thunder-draw')thunderDraw(c,x,y,age,opt);else longDraw(c,x,y,age,opt);
  }
  const shadeSpecs=Object.freeze([
    {id:'marking-shade',name:'Marking Shade',duration:1.6,note:'Copied attack / purple mark'},
    {id:'decoy',name:'Decoy',duration:1.6,note:'Red locks turn from hero to shade'},
    {id:'rain-of-needles',name:'Rain of Needles',duration:1.5,note:'Ten thin green phantom blades'},
    {id:'six-executioners',name:'Six Executioners',duration:1.7,note:'Six heavy falling swords'}
  ].map(Object.freeze));
  function shadeFigure(c,x,y,age,opt={}){
    if(!Number.isFinite(age)||age<0)return;
    c.save();c.translate(Math.round(x),Math.round(y));c.scale(opt.direction<0?-1:1,1);
    const strike=!!opt.strike,bob=opt.reducedMotion?0:Math.floor(age*4)%2;
    poly(c,'#21172e',[[-4,-27],[3,-27],[6,-18],[4,-9],[8,0],[3,-2],[0,1],[-3,-2],[-8,0],[-6,-12],[-8,-20]]);
    poly(c,'#493258',[[-3,-25],[2,-25],[3,-18],[1,-10],[4,-3],[0,-5],[-3,-3],[-3,-14]]);
    poly(c,'#493258',[[-3,-30],[1,-33],[5,-30],[5,-25],[1,-23],[-3,-25]]);line(c,elements.shadow,3,-29,5,-29);
    line(c,'#493258',4,-21,strike?16:8,strike?-19:-12,3);line(c,elements.shadow,5,-22,strike?16:8,strike?-20:-13);
    if(strike){poly(c,'#70469b',[[17,-21],[39,-23],[43,-21],[38,-19],[17,-18]]);line(c,'#c6a0ef',18,-21,39,-23);}
    for(let i=0;i<(opt.reducedMotion?3:7);i++)rect(c,i%2?'#493258':'#21172e',-7+i*2,1+(i+bob)%3,1,2);
    c.restore();
  }
  function lockMark(c,x,y,col=P.blood){for(const [sx,sy]of [[-1,-1],[1,-1],[-1,1],[1,1]]){line(c,col,x+sx*5,y+sy*5,x+sx*2,y+sy*5);line(c,col,x+sx*5,y+sy*5,x+sx*5,y+sy*2);}rect(c,col,x,y);}
  function markingShade(c,x,y,age,opt={}){
    if(!active(age,1.6))return;c.save();c.translate(Math.round(x),Math.round(y));c.scale(opt.direction<0?-1:1,1);
    shadeFigure(c,-10,0,age,{strike:age>.3&&age<1.1,reducedMotion:opt.reducedMotion});
    if(age>.55){const size=age<.7?4:7;line(c,elements.shadow,42-size,-27-size,42+size,-27+size);line(c,elements.shadow,42+size,-27-size,42-size,-27+size);line(c,'#c6a0ef',42,-38,42,-34);rect(c,'#c6a0ef',42,-27,2,2);}
    if(age>.3&&age<.8&&!opt.reducedMotion)for(let i=0;i<9;i++)rect(c,'#70469b',13+i*3,-20+(i%3)-age*2);
    c.restore();
  }
  function decoy(c,x,y,age,opt={}){
    if(!active(age,1.6))return;c.save();c.translate(Math.round(x),Math.round(y));c.scale(opt.direction<0?-1:1,1);
    shadeFigure(c,28,0,age,{reducedMotion:opt.reducedMotion});
    const q=unit((age-.4)/.5),target=-25+53*(opt.reducedMotion?(q>=.5?1:0):q);
    lockMark(c,target,-43);
    for(let i=0;i<2;i++){const xx=i?55:-55,yy=-19-i*4;lockMark(c,xx,yy,'#6e2729');const dx=target-xx,dy=-43-yy,len=Math.hypot(dx,dy);for(let j=5;j<len-8;j+=5)rect(c,'#6e2729',xx+dx*j/len,yy+dy*j/len);}
    c.restore();
  }
  // Fixed blade counts are preserved in reduced motion; only trails/debris shrink.
  function bladeRain(c,x,y,age,opt={}){
    const heavy=opt.variant==='executioners',duration=heavy?1.7:1.5;if(!active(age,duration))return;
    c.save();c.translate(Math.round(x),Math.round(y));c.scale(opt.direction<0?-1:1,1);
    const count=heavy?6:10;
    for(let i=0;i<count;i++){
      const xx=(i-(count-1)/2)*(heavy?17:10),delay=i*(heavy?.085:.045),p=unit((age-delay)/.65),tip=-(heavy?45:51)+p*(heavy?45:51);
      if(age<delay){rect(c,heavy?'#504650':'#477035',xx,-55,1,2);continue;}
      if(heavy){
        poly(c,'#514752',[[xx-3,tip-22],[xx+3,tip-22],[xx+3,tip-5],[xx,tip],[xx-3,tip-5]]);line(c,P.bone,xx-2,tip-21,xx-2,tip-5);line(c,'#918795',xx+1,tip-21,xx+1,tip-5);
        line(c,P.ash,xx-6,tip-23,xx+6,tip-23,2);line(c,'#604a38',xx,tip-29,xx,tip-24,2);rect(c,P.ash,xx-1,tip-31,3,2);
      }else{line(c,'#477035',xx,tip-16,xx,tip);line(c,elements.poison,xx+1,tip-14,xx+1,tip-2);rect(c,'#c8e8d8',xx,tip-15);line(c,'#477035',xx-2,tip-17,xx+2,tip-17);}
      if(p<1&&!opt.reducedMotion)line(c,heavy?'#322936':'#263c22',xx,tip-(heavy?33:20),xx,tip-(heavy?39:26));
      const since=age-delay-.65;if(since>=0&&since<.3){const r=2+since*14;line(c,heavy?P.ash:elements.poison,xx-r,1,xx+r,1);if(!opt.reducedMotion){rect(c,heavy?P.bone:elements.poison,xx-r,-r);rect(c,heavy?P.bone:elements.poison,xx+r,-r+1);}}
    }
    c.restore();
  }
  function shadeEffect(c,id,x,y,age,opt={}){
    const spec=shadeSpecs.find(s=>s.id===id);if(!spec)throw new Error('Unknown shade/blade art: '+id);if(!active(age,spec.duration))return;
    if(id==='marking-shade'){if(opt.hero)drawCutPose(c,x-30*(opt.direction<0?-1:1),y,age,{...opt,drawn:age>.18});markingShade(c,x,y,age,opt);}
    else if(id==='decoy'){if(opt.hero)heroPose(c,x-25*(opt.direction<0?-1:1),y,'idle',opt);decoy(c,x,y,age,opt);}
    else bladeRain(c,x,y,age,{...opt,variant:id==='six-executioners'?'executioners':'needles'});
  }
  const remainingSpecs=Object.freeze([
    {id:'toll-for-me',name:'Toll for Me',family:'brands',duration:1.5,note:'Red locks snap to the hero'},
    {id:'drowning-bell',name:'Drowning Bell',family:'brands',duration:1.5,note:'Water ring on the bell toll'},
    {id:'martyrs-breath',name:'Martyr’s Breath',family:'brands',duration:1.6,note:'Healing wave reaches allied figures'},
    {id:'vengeful-shade',name:'Vengeful Shade',family:'brands',duration:1.6,note:'Burning apparition'},
    {id:'undertow',name:'Undertow',family:'elements',duration:1.5,note:'Water rushes inward'},
    {id:'wildfire',name:'Wildfire',family:'elements',duration:1.8,note:'Fire spreads along the ground'},
    {id:'pyre-walker',name:'Pyre Walker',family:'elements',duration:1.6,note:'Firelight on intact armour'},
    {id:'cinder-heart',name:'Cinder Heart',family:'elements',duration:1.1,note:'Small heart-shaped ember blast'},
    {id:'funeral-pyre',name:'Funeral Pyre',family:'elements',duration:1.8,note:'Smoulder / delayed flare'},
    {id:'permafrost',name:'Permafrost',family:'elements',duration:1.7,note:'Large frozen casing / release'},
    {id:'storm-conduit',name:'Storm Conduit',family:'elements',duration:1.7,note:'Stored charge / chained discharge'},
    {id:'tempest',name:'Tempest',family:'elements',duration:2.4,note:'Suspension / slow stepped tumble'},
    {id:'necrosis',name:'Necrosis',family:'elements',duration:2,note:'Rot pips / stack count beyond five'},
    {id:'sanctuary',name:'Sanctuary',family:'elements',duration:1.7,note:'Hallowed ground circle'},
    {id:'night-has-teeth',name:'Night Has Teeth',family:'elements',duration:1.2,note:'Instant low-life bloom'},
    {id:'unseen',name:'Unseen',family:'elements',duration:1.6,note:'Half-transparent figure / ink smoke'}
  ].map(Object.freeze));
  // Shared pixel flame for this pass; bounded geometry, no particles or gameplay fire.
  function flame(c,x,y,height,col=elements.fire,phase=0){
    const h=Math.max(3,height),j=phase%3;
    poly(c,'#5a241b',[[x-7,y],[x-8,y-7],[x-4,y-h*.6],[x-3,y-h],[x+1,y-h*.5],[x+5,y-h+5+j],[x+6,y-6],[x+8,y],[x+4,y+2]]);
    poly(c,col,[[x-4,y],[x-5,y-6],[x-1,y-h+3],[x+1,y-h*.4],[x+4,y-h+9],[x+5,y-5],[x+2,y+1]]);
    poly(c,'#ffd27a',[[x-1,y],[x-2,y-5],[x,y-h*.4],[x+2,y-4],[x+1,y+1]]);
  }
  function bell(c,x,y){poly(c,P.ash,[[x-6,y-7],[x-5,y-14],[x-2,y-18],[x+3,y-18],[x+6,y-14],[x+7,y-7],[x+10,y-5],[x-9,y-5]]);line(c,P.bone,x-5,y-14,x-4,y-8);line(c,P.bone,x-8,y-5,x+9,y-5);rect(c,'#54452b',x-1,y-20,3,3);rect(c,P.bone,x,y-4,2,3);}
  // Same four-tongue fire-tile geometry as artworld.js drawGround, with time and
  // strength supplied explicitly so previews never read flames, camR or time.
  function groundFireTile(c,cx,cy,age,strength){for(let j=0;j<4;j++){const xx=cx-6+j*4,h=Math.round((5+Math.abs(Math.sin(age*9+j+cx))*5)*strength);poly(c,'#c85d32',[[xx-1,cy],[xx-2,cy-3],[xx,cy-h],[xx+1,cy-h+3],[xx+3,cy-2],[xx+2,cy]]);rect(c,'#f0bd6d',xx,cy-3,1,3);}}
  function pixelNumber(c,value,x,y,col){
    const digits=['111/101/101/101/111','010/110/010/010/111','111/001/111/100/111','111/001/111/001/111','101/101/111/001/001','111/100/111/001/111','111/100/111/101/111','111/001/010/010/010','111/101/111/101/111','111/101/111/001/111'];
    const text=String(Math.max(0,Math.min(999,Math.floor(Number.isFinite(value)?value:0))));
    for(let i=0;i<text.length;i++)digits[+text[i]].split('/').forEach((row,yy)=>{for(let xx=0;xx<3;xx++)if(row[xx]==='1')rect(c,col,x+i*4+xx,y+yy);});
  }
  function rotStacks(c,x,y,count){
    c.save();const n=Number.isFinite(count)?Math.max(0,Math.min(999,Math.floor(count))):0;
    if(n){for(let i=0;i<Math.min(5,n);i++){rect(c,'#40502f',x-12+i*4,y,3,3);rect(c,elements.poison,x-11+i*4,y,1,2);}pixelNumber(c,n,x+10,y-1,elements.poison);}c.restore();
  }
  let unseenSprite=null;
  function remainingEffect(c,id,x,y,age,opt={}){
    const spec=remainingSpecs.find(s=>s.id===id);if(!spec)throw new Error('Unknown remaining art: '+id);if(!active(age,spec.duration))return;
    const q=age/spec.duration,rm=!!opt.reducedMotion,seed=opt.seed|0;
    c.save();c.translate(Math.round(x),Math.round(y));c.scale(opt.direction<0?-1:1,1);
    const hero=(X=0,Y=0)=>{if(opt.hero)heroPose(c,X,Y,'idle');};
    const foe=(X=0,Y=0)=>{if(opt.hero)boneThrall(c,X,Y,'idle',0,{reducedMotion:true});};
    if(id==='toll-for-me'){
      hero();bell(c,0,-48);const snap=q<.3?0:1;
      for(const s of [-1,1]){const xx=s*45;foe(xx);lockMark(c,snap?0:xx,-40,snap?P.blood:'#6e2729');for(let i=1;i<8;i++)rect(c,'#6e2729',xx*(1-i/8),-32-i,1,1);}
      ellipse(c,P.ash,8+q*35,2+q*6,-2,0,Math.PI*2,9);
    }else if(id==='drowning-bell'){
      hero();bell(c,0,-48);const r=6+q*51;
      ellipse(c,'#234e69',r,3+q*10,-2,0,Math.PI*2,5);ellipse(c,elements.water,r,4+q*10,-3,0,Math.PI*2,7);
      for(let i=0;i<(rm?6:16);i++){const a=i*Math.PI/8,xx=Math.cos(a)*r,yy=-3+Math.sin(a)*r*.2-Math.sin(q*Math.PI)*(i%3+2);rect(c,i%3?elements.water:'#d5edf2',xx,yy,2,1);}
    }else if(id==='martyrs-breath'){
      hero();for(const s of [-1,1]){foe(s*43);if(q>.55){line(c,elements.holy,s*43-3,-38,s*43+3,-38);line(c,elements.holy,s*43,-41,s*43,-35);}}
      for(const s of [-1,1]){const xx=s*(3+q*54);for(let i=0;i<20;i++){const a=-1.3+i/19*2.6;rect(c,i%3?elements.holy:P.bone,xx+s*Math.cos(a)*4,-18+Math.sin(a)*20);}}
    }else if(id==='vengeful-shade'){
      for(const xx of [-8,6])flame(c,xx,0,22+Math.sin(q*Math.PI)*12,elements.fire,rm?0:Math.floor(age*7));
      shadeFigure(c,0,0,age,{strike:q>.35&&q<.75,reducedMotion:rm});
      for(let i=0;i<(rm?3:8);i++)rect(c,elements.fire,(noise(seed,i)-.5)*24,-15-q*32-i%3*3);
    }else if(id==='undertow'){
      foe();const r=52*(1-q)+4;for(let i=0;i<(rm?8:20);i++){const a=i/(rm?8:20)*Math.PI*2,xx=Math.cos(a)*r,yy=Math.sin(a)*r*.22;line(c,elements.water,xx,yy,xx+Math.cos(a)*6,yy+Math.sin(a)*2);rect(c,'#d5edf2',xx,yy);}
      ellipse(c,'#234e69',7+q*3,3,0,0,Math.PI*2,5);
    }else if(id==='wildfire'){
      for(let i=0;i<9;i++){const start=Math.abs(i-4)*.14,p=unit((q-start)*4);if(q<start)continue;groundFireTile(c,(i-4)*12,0,rm?0:age,p);}
    }else if(id==='pyre-walker'){
      for(const xx of [-30,30])flame(c,xx,0,15,elements.fire,rm?0:Math.floor(age*6));hero();
      line(c,elements.fire,-4,-21,-4,-13);line(c,P.gold,3,-21,3,-12);line(c,P.gold,5,-3,8,-3);rect(c,elements.fire,3,-28);ellipse(c,'#725039',14,3,1,0,Math.PI*2,8);
    }else if(id==='cinder-heart'||id==='funeral-pyre'){
      const big=id==='funeral-pyre',start=big?.48:0,p=unit((q-start)/(1-start));
      if(big&&q<start){foe();for(const xx of [-8,8])flame(c,xx,0,7+q*9,elements.fire,0);rect(c,elements.fire,0,-16,2,3);}
      else{const reach=(big?39:24)*Math.sin(p*Math.PI),height=(big?61:26)*Math.sin(p*Math.PI);
        flame(c,0,0,Math.max(4,height),elements.fire,rm?0:Math.floor(age*8));
        for(let i=0;i<(rm?6:big?18:12);i++){const a=i*2.399,xx=Math.cos(a)*reach,yy=-12+Math.sin(a)*reach*.7-p*8;rect(c,i%3?elements.fire:P.gold,xx,yy,2,2);}
        if(!big&&p<.35)poly(c,P.blood,[[-6,-19],[-3,-22],[0,-19],[4,-22],[7,-18],[0,-11]]);
      }
    }else if(id==='permafrost'){
      c.save();c.scale(2,2);foe(0,0);c.restore();
      if(q<.78){poly(c,'#29485a',[[-21,1],[-23,-40],[-15,-62],[6,-67],[23,-48],[24,1]]);
        for(let i=0;i<5;i++){const xx=-18+i*8;line(c,i%2?'#517d94':elements.cold,xx,0,xx-2,-48-(i%3)*6,2);}line(c,'#d5edf2',-15,-61,5,-66);line(c,'#d5edf2',5,-66,21,-48);
        // Ice windows retain the imprisoned silhouette.
        c.save();c.globalAlpha*=.5;c.scale(2,2);foe();c.restore();
      }else for(let i=0;i<10;i++){const p=(q-.78)/.22,xx=(i-4.5)*6;line(c,elements.cold,xx,-35+p*30,xx+2,-30+p*30);}
    }else if(id==='storm-conduit'){
      for(const xx of [-38,0,38])foe(xx);
      if(q<.55){for(let i=0;i<(rm?3:7);i++){const a=i*2.399+(rm?0:age),xx=Math.cos(a)*13,yy=-17+Math.sin(a)*17;line(c,elements.shock,xx,yy,xx+3,yy-3);}}
      else{for(let side=-1;side<=0;side++){let prev=[side*38,-18];for(let j=1;j<=8;j++){const xx=side*38+j*38/8,yy=-18+(j===8?0:(j%2?1:-1)*(rm?3:7));line(c,'#736a40',...prev,xx,yy,2);line(c,elements.shock,...prev,xx,yy);prev=[xx,yy];}}if(q<.72)for(const xx of [-38,0,38])glint(c,xx,-18,P.bone,rm?2:4);}
    }else if(id==='tempest'){
      const lift=rm?14:18+Math.round(Math.sin(q*Math.PI)*10),turn=rm?0:Math.floor(age/.6)%4;
      for(const xx of [-24,24]){c.save();c.translate(xx,-lift-14);if(turn===1)c.transform(0,1,-1,0,0,0);if(turn===2)c.scale(-1,-1);if(turn===3)c.transform(0,-1,1,0,0,0);foe(0,14);c.restore();}
      for(let j=0;j<3;j++){const phase=rm?0:age;for(let i=0;i<32;i++){const a=i/32*Math.PI*1.5+phase+j;rect(c,i%3?elements.wind:'#697c74',Math.cos(a)*(40-j*7),-4-j*13+Math.sin(a)*4);}}
    }else if(id==='necrosis'){
      foe();const count=Number.isFinite(opt.stacks)?opt.stacks:1+Math.floor(q*11);rotStacks(c,0,-44,count);
      for(let i=0;i<5;i++)rect(c,i%2?'#40502f':elements.poison,-5+i*2,-22+(i*3+Math.floor(age*3))%16,1,2);
    }else if(id==='sanctuary'){
      const r=24+unit(q*4)*15;ellipse(c,'#6e5a39',r,9,0,0,Math.PI*2,6);ellipse(c,elements.holy,r-2,8,-1,0,Math.PI*2,11);hero();
      for(let i=0;i<8;i++){const a=i*Math.PI/4;line(c,P.gold,Math.cos(a)*(r-3),Math.sin(a)*8,Math.cos(a)*(r+1),Math.sin(a)*10);}
      if(!rm)for(let i=0;i<6;i++)rect(c,elements.holy,-25+i*10,-4-(age*7+i*3)%15);
    }else if(id==='night-has-teeth'){
      foe();const r=6+q*42;
      for(let i=0;i<(rm?8:16);i++){const a=i/(rm?8:16)*Math.PI*2,dx=Math.cos(a),dy=Math.sin(a),xx=dx*r,yy=-16+dy*r*.55;poly(c,'#70469b',[[xx-dy*3,yy+dx*3],[xx+dx*7,yy+dy*5],[xx+dy*3,yy-dx*3],[xx-dx*3,yy-dy*3]]);line(c,P.blood,xx,yy,xx-dx*4,yy-dy*4);}
      if(q<.3){ellipse(c,elements.shadow,10,13,-16,0,Math.PI*2,6);for(const xx of [-4,4])poly(c,P.bone,[[xx-2,-22],[xx+2,-22],[xx,-15]]);}
    }else if(id==='unseen'){
      if(opt.hero){if(!unseenSprite){unseenSprite=document.createElement('canvas');unseenSprite.width=64;unseenSprite.height=64;heroPose(unseenSprite.getContext('2d'),24,44,'idle');}c.save();c.globalAlpha*=.5;c.drawImage(unseenSprite,-24,-44);c.restore();}
      for(let i=0;i<(rm?4:10);i++){const xx=(noise(seed,i)-.5)*30,yy=-4-(rm?i*2:(age*10+i*3)%28);poly(c,'#211b29',[[xx-3,yy],[xx-4,yy-3],[xx,yy-6],[xx+4,yy-3],[xx+2,yy]]);if(i%3===0)rect(c,'#493258',xx,yy-4);}
    }
    c.restore();
  }
  const environmentSpecs=Object.freeze([
    ...order.map(element=>({id:'shrine-'+element,name:(element==='shock'?'Lightning':element[0].toUpperCase()+element.slice(1))+' shrine',kind:'shrine',element,states:['dormant','used'],note:'Stone altar / sigil bowl'})),
    {id:'oil',name:'Oil slick',kind:'ground',states:['intact','burning','charred'],note:'Dark pooled oil / ignition / residue'},
    {id:'straw',name:'Straw tufts',kind:'ground',states:['intact','burning','charred'],note:'Dry stalks / ignition / ash'},
    {id:'updraft',name:'Updraft vent',kind:'vent',states:['idle','active'],note:'Iron grate / rising ash'},
    {id:'bone-pile',name:'Ossuary bone pile',kind:'pile',states:['intact'],note:'Skull / ribs / scattered long bones'},
    {id:'grave-claw',name:'Grave Claw route',kind:'route',states:['visible','highlighted'],note:'Claw scars in a climbing wall'},
    {id:'ash-wings',name:'Ash Wings route',kind:'route',states:['visible','highlighted'],note:'Wing-shaped ash at a gap'},
    {id:'red-tether',name:'Red Tether ring',kind:'route',states:['visible','highlighted'],note:'Wall-mounted iron ring / bright glint'}
  ].map(s=>Object.freeze({...s,states:Object.freeze(s.states)})));
  function environment(c,id,x,y,age=0,opt={}){
    const spec=environmentSpecs.find(s=>s.id===id);if(!spec)throw new Error('Unknown environment art: '+id);
    if(!Number.isFinite(age)||age<0)return;
    const state=opt.state||spec.states[0];if(!spec.states.includes(state))throw new Error('Unknown '+id+' state: '+state);
    const lit=state==='used'||state==='active'||state==='highlighted',rm=!!opt.reducedMotion,t=rm?0:age,seed=opt.seed|0;
    c.save();c.translate(Math.round(x),Math.round(y));c.scale(opt.direction<0?-1:1,1);
    if(spec.kind==='shrine'){
      const col=elements[spec.element];
      poly(c,'#302a28',[[-20,0],[-20,-4],[-15,-7],[15,-7],[21,-3],[21,0]]);line(c,'#736a60',-18,-4,17,-4);
      poly(c,'#4b4540',[[-12,-7],[-11,-28],[-7,-32],[8,-32],[12,-28],[13,-7]]);
      rect(c,'#665f55',-8,-28,15,20);rect(c,'#39332f',8,-27,4,20);line(c,P.ash,-9,-28,-9,-9);
      line(c,'#292323',-6,-16,-1,-18);line(c,'#292323',-1,-18,1,-13);line(c,'#292323',1,-13,5,-12);
      sigil(c,kanji[spec.element],-1,-20,12,lit?col:'#a49a87');
      poly(c,'#3a3330',[[-19,-34],[-16,-27],[-11,-25],[11,-25],[16,-28],[19,-34]]);
      line(c,'#b0a18c',-18,-34,18,-34,2);line(c,'#736a60',-15,-29,14,-29);
      rect(c,P.ink,-13,-33,26,3);line(c,lit?col:'#64534a',-11,-31,11,-31);
      for(const xx of [-15,15]){rect(c,P.ash,xx-1,-33,2,3);rect(c,P.ink,xx,-30);}
      if(lit){
        ellipse(c,col,11,3,-33,0,Math.PI*2,9);line(c,col,-6,-3,6,-3);
        for(let i=0;i<(rm?3:7);i++){const yy=-36-(t*9+i*3)%18,xx=Math.round(Math.sin(i*2.3)*8);rect(c,i%3?col:P.bone,xx,yy,1,i%2?2:1);}
      }
    }else if(id==='oil'){
      const burnt=state==='charred';
      poly(c,burnt?'#29231f':'#0c1115',[[-30,0],[-26,-4],[-15,-5],[-11,-8],[4,-7],[11,-5],[25,-4],[31,0],[25,4],[9,5],[1,7],[-14,5],[-23,3]]);
      line(c,burnt?'#53463a':'#34424a',-23,-3,-12,-4);line(c,burnt?'#53463a':'#34424a',5,4,20,2);line(c,burnt?'#3b322b':'#4a414f',-8,-5,4,-5);
      for(let i=0;i<9;i++)rect(c,burnt?'#514438':'#1c232b',-25+i*6,(i*7)%8-3,2,1);
      if(state==='burning')for(const xx of [-18,0,18])groundFireTile(c,xx,0,t,1);
    }else if(id==='straw'){
      const burnt=state==='charred';
      for(let i=0;i<18;i++){const xx=-25+i*3,lean=4+(i%3)*2,h=4+Math.floor(noise(seed,i)*12);line(c,burnt?'#514438':'#796039',xx,1,xx+(i%2?lean:-lean),-(burnt?h*.3:h));if(!burnt&&i%3===0)line(c,'#b0975c',xx,0,xx-2,-h);}
      if(burnt)for(let i=0;i<12;i++)rect(c,i%2?'#3b322b':P.ash,-23+i*4,(i*3)%4,1,1);
      if(state==='burning')for(const xx of [-16,0,16])flame(c,xx,0,16+Math.sin(t*5+xx)*3,elements.fire,Math.floor(t*6));
    }else if(id==='updraft'){
      poly(c,'#49423b',[[-26,0],[-23,-7],[23,-7],[27,0],[23,4],[-23,4]]);poly(c,'#141518',[[-22,-1],[-19,-5],[19,-5],[22,1],[-20,1]]);
      for(let i=0;i<9;i++)line(c,i%2?'#6b6967':'#414447',-19+i*5,-5,-21+i*5,1);
      line(c,P.ash,-23,-6,22,-6);line(c,'#736a60',-21,3,21,3);
      for(const xx of [-23,23])rect(c,'#b0a18c',xx,-1,2,2);
      if(lit)for(let i=0;i<(rm?5:16);i++){const p=(t*.32+i/16)%1,xx=(noise(seed,i)-.5)*32+Math.sin(i+p*3)*3,yy=-9-p*42;rect(c,i%4?P.ash:P.bone,xx,yy,1,i%3===0?2:1);}
    }else if(id==='bone-pile'){
      poly(c,'#302a27',[[-28,2],[-20,-6],[-10,-10],[9,-10],[25,-4],[29,3],[-20,5]]);
      for(let i=0;i<9;i++){const xx=-23+i*5,yy=-2-(i%3)*3,dx=i%2?9:-7;line(c,P.ash,xx,yy,xx+dx,yy-4,2);line(c,elements.bone,xx,yy,xx+dx,yy-4);rect(c,P.bone,xx-1,yy-1,2,2);rect(c,P.bone,xx+dx-1,yy-5,2,2);}
      for(let j=0;j<3;j++){line(c,P.bone,5+j*4,-12,11+j*4,-8);line(c,P.ash,11+j*4,-8,9+j*4,-4);}
      poly(c,P.ash,[[-12,-15],[-9,-20],[-2,-19],[2,-15],[0,-9],[-3,-7],[-9,-9]]);poly(c,P.bone,[[-10,-15],[-8,-18],[-3,-17],[0,-14],[-2,-11],[-9,-11]]);
      rect(c,P.ink,-8,-15,2,3);rect(c,P.ink,-3,-15,2,3);rect(c,P.ink,-5,-11,1,2);line(c,P.bone,-8,-8,-2,-8);for(const xx of [-7,-4])rect(c,P.ink,xx,-8);
    }else if(id==='grave-claw'){
      rect(c,'#332e2b',-16,-58,32,58);rect(c,'#514840',-14,-56,27,54);
      for(let j=0;j<4;j++){line(c,'#211d1b',-16,-13-j*14,15,-13-j*14);line(c,'#75695b',-14,-12-j*14,12,-12-j*14);line(c,'#211d1b',j%2?5:-6,-13-j*14,j%2?5:-6,-j*14);}
      for(let i=0;i<3;i++){const xx=-7+i*6;line(c,P.ink,xx,-47,xx-2,-26,3);line(c,lit?P.bone:'#a2947d',xx+2,-46,xx,-29);line(c,lit?P.blood:'#6d4237',xx,-34,xx-2,-25);}
      if(lit&&!rm)rect(c,P.bone,-4,-48,1,2);
    }else if(id==='ash-wings'){
      // Symmetric feather strokes remain readable as a route marker, not lettering.
      for(const s of [-1,1]){
        poly(c,'#3e3938',[[s*2,-3],[s*8,-13],[s*15,-18],[s*23,-28],[s*26,-29],[s*25,-18],[s*21,-16],[s*20,-11],[s*15,-10],[s*12,-5]]);
        for(let i=0;i<5;i++){const xx=s*(7+i*4),yy=-7-i*4;line(c,lit?P.bone:P.ash,xx,yy,xx+s*(6-i),yy-7+i);line(c,lit?'#c8e8d8':'#6b6762',xx,yy,xx+s*4,yy+4);}
      }
      poly(c,lit?P.bone:P.ash,[[0,-10],[3,-5],[1,0],[-1,0],[-3,-5]]);
      for(let i=0;i<(rm?3:9);i++)rect(c,i%3?P.ash:P.bone,(noise(seed,i)-.5)*45,-2-(lit?(t*6+i*2)%17:i%3),1,1);
    }else if(id==='red-tether'){
      rect(c,'#393332',-9,-39,18,18);rect(c,'#57504a',-7,-37,14,14);for(const xx of [-5,5])for(const yy of [-35,-25])rect(c,'#918579',xx,yy);
      rect(c,P.ink,-2,-32,5,10);line(c,'#8a847e',0,-32,0,-24,2);
      ellipse(c,'#252429',9,10,-17);ellipse(c,'#78777b',8,9,-17);ellipse(c,'#403f44',6,7,-17);
      line(c,P.ash,-7,-21,-5,-24);line(c,'#b0aaa0',5,-12,7,-15);
      if(lit){line(c,P.blood,1,-26,5,-23);glint(c,-5,-24,P.gold,rm?2:2+Math.floor(t*3)%2);}
    }
    c.restore();
  }
  return Object.freeze({palette:P,elements,attributes,states,sizes,order,kanji,catalogue:Object.freeze(catalogue),glyphs,frame,node,brandIcon,attributeIcon,sigil,glyph,heart,vertebra,connection,guides,ribcage,effectSpecs,effect,heroPose,slamPose,graveSlam,stillness,tidebreak,comboArt,combatSpecs,boneThrall,shieldBar,sanguineShell,bonePlate,paleLight,drownedBones,blackFlame,comboPopup,combatEffect,brandSpecs,heartSpike,houndForm,redMaw,drawCutPose,thunderDraw,longDraw,brandEffect,shadeSpecs,shadeFigure,markingShade,decoy,bladeRain,shadeEffect,remainingSpecs,remainingEffect,rotStacks,environmentSpecs,environment});
})();
