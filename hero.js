'use strict';
/* ===== hero: drawn at 2x detail so armour, helms and weapons read clearly ===== */
const ARM_COL=[['#3e3024','#6b5640','#8a7458'],['#34373d','#5d626b','#8a909a'],['#2a201c','#45372d','#6a564a'],['#454b55','#7a828e','#b8bec8'],['#141217','#28242c','#5a4e58']];
function tierIn(list,b){ if(b&&b.look!=null) return b.look; let i=list.indexOf(b); if(i<0) i=list.findIndex(x=>x.name===b.name); if(i<0) i=clamp(Math.floor((b.lvl||0)/5),0,list.length-1); return clamp(i,0,4); }
function tint(cols,r){ if(r===5) return ['#0e0606','#221010','#ff4a3d']; if(r===4) return [cols[0],cols[1],'#e2c88a']; if(r===3) return [cols[0],mixc(cols[1],'#3a6a44',.35),'#9ad0a2']; return cols; }
function metalOf(r){ return r===5?['#120808','#2a1416','#ff6a50']:r===4?['#3e3424','#6a6250','#e2c88a']:r===3?['#2e3e32','#5a6a5e','#a9dcae']:['#3e4249','#5f646d','#c9c2b2']; }
function drawWeapon(c,it){ const b=it.base, cl=b.cls, r=it.rarity, L=b.len, hw=b.wid/2, M=metalOf(r); const wood='#4a3020', R_=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
  const grip=(x,len)=>{ R_(x,-1.5,len,3,wood); for(let i=0;i<len;i+=1) R_(x+i,-1.5,.5,3,'#2a1a10'); };
  if(cl==='sword'){ grip(4,4); R_(3,-1.8,1.2,3.6,r>=4?'#c9a96a':'#6a6470'); R_(8,-hw-1.5,2,b.wid+3,r>=4?'#9a7c45':'#55505a'); R_(8,-hw-1.5,2,.5,'#8a8890');
    R_(10,-hw,L,b.wid,M[1]); R_(10,hw-1.5,L,1.5,M[0]); R_(10,-hw,L,.6,M[2]); R_(11,-.25,L-6,.5,M[0]);
    if(b.name==='Rusted Falchion'){ R_(10+L-7,-hw-1,7,1,M[2]); for(let i=0;i<4;i++) R_(12+i*3.5,-hw+.5,1.5,1,'#6a4a30'); }
    if(b.name==="Headsman's Blade"){ R_(10+L-1,-hw,1,b.wid,M[2]); R_(10+L-6,-1,2,2,'#0a0607'); } else { c.fillStyle=M[1]; c.beginPath(); c.moveTo(10+L,-hw); c.lineTo(13.5+L,-hw); c.lineTo(10+L,hw); c.fill(); }
    if(b.name==='Iron Slab') for(let i=14;i<L;i+=6) R_(10+i,hw-1,2,1,'#0a0606');
    R_(10+Math.round(L*.55),-1,3,.8,'#4a1a14'); }
  else if(cl==='dagger'){ grip(4,4); R_(8,-2.5,1,5,'#55505a'); R_(9,-1,L,2,M[1]); R_(9,-1,L,.5,M[2]); c.fillStyle=M[1]; c.beginPath(); c.moveTo(9+L,-1); c.lineTo(12.5+L,0); c.lineTo(9+L,1); c.fill(); if(b.name==='Kris') for(let i=0;i<L;i+=3) R_(10+i,i%6?-1.3:.5,1.5,.8,M[1]); }
  else if(cl==='axe'){ R_(4,-1,L+2,2,wood); R_(4,-1,L+2,.5,'#6a4a30'); const big=b.h===2; c.fillStyle=M[1]; c.beginPath(); c.moveTo(L-2,-1); c.lineTo(L+2,-hw-5); c.lineTo(L+7,-hw-3); c.lineTo(L+6,hw+4); c.lineTo(L+2,hw+6); c.lineTo(L-2,1); c.fill(); R_(L+5.5,-hw-3,1.5,b.wid+7,M[2]); R_(L,-1,1,2,M[0]);
    if(big){ c.beginPath(); c.moveTo(L-1,-1); c.lineTo(L-6,-hw-4); c.lineTo(L-6,hw+4); c.lineTo(L-1,1); c.fill(); R_(L-6,-hw-4,.8,b.wid+8,M[2]); } }
  else if(cl==='spear'){ R_(-10,-1,L+12,2,wood); R_(-10,-1,L+12,.5,'#6a4a30'); for(let i=-8;i<L;i+=7) R_(i,-1,1,2,'#2a1a10'); c.fillStyle=M[1]; c.beginPath(); c.moveTo(L+2,-2); c.lineTo(L+(b.name==='Glaive'?14:10),0); c.lineTo(L+2,2); c.fill(); R_(L+2,-2,8,.5,M[2]);
    if(b.name==='Glaive'){ c.beginPath(); c.moveTo(L+2,-2); c.lineTo(L+10,-5); c.lineTo(L+13,-1); c.fill(); } if(b.name==='Halberd'){ c.beginPath(); c.moveTo(L-4,-1); c.lineTo(L-2,-9); c.lineTo(L+4,-10); c.lineTo(L+3,-1); c.fill(); R_(L-2,-9,6,.6,M[2]); c.beginPath(); c.moveTo(L-3,1); c.lineTo(L-6,5); c.lineTo(L-1,1); c.fill(); } R_(L,-2,2,4,'#55505a'); R_(L-1,-1.5,1,3,'#7a1414'); }
  else if(cl==='mace'){ R_(4,-1,L,2,wood); const hx=L+2, hs=b.h===2?8:5; R_(hx,-hs/2-1,hs+2,hs+2,M[1]); R_(hx,-hs/2-1,hs+2,.6,M[2]); R_(hx+1,-hs/2-3,2,2,M[0]); R_(hx+hs-1,-hs/2-3,2,2,M[0]); R_(hx+1,hs/2+1,2,2,M[0]); R_(hx+hs-1,hs/2+1,2,2,M[0]); R_(hx+hs/2,-.5,1,1,M[2]); }
  else if(cl==='scythe'){ R_(-8,-1,L+10,2,wood); R_(-8,-1,L+10,.5,'#6a4a30'); c.strokeStyle=M[1]; c.lineWidth=3; c.beginPath(); c.arc(L-6,-12,13,-.2,1.6); c.stroke(); c.strokeStyle=M[2]; c.lineWidth=.7; c.beginPath(); c.arc(L-6,-12,14.6,-.1,1.5); c.stroke(); }
  else if(cl==='katana'){ R_(3,-1.6,8,3.2,'#1c1416'); for(let i=3;i<11;i+=2){ R_(i,-1.6,1,1,'#cdbf9e'); R_(i+1,.6,1,1,'#cdbf9e'); } c.fillStyle=r>=4?'#9a7c45':'#2a2428'; c.beginPath(); c.ellipse(11.5,0,1.2,3.4,0,0,Math.PI*2); c.fill();
    c.fillStyle=M[1]; c.beginPath(); c.moveTo(12.5,-1.4); c.quadraticCurveTo(12.5+L*.6,-1.9,12.5+L,-3.6); c.lineTo(12.5+L-2.5,-1.8); c.quadraticCurveTo(12.5+L*.6,.3,12.5,1.2); c.closePath(); c.fill();
    c.strokeStyle=M[2]; c.lineWidth=.5; c.beginPath(); c.moveTo(13,.6); c.quadraticCurveTo(12.5+L*.6,-.2,12.5+L-2.5,-2); c.stroke(); R_(12.5,-1.4,L*.55,.5,M[0]); }
  else if(cl==='rapier'){ grip(4,4); c.strokeStyle=r>=4?'#c9a96a':'#7a7680'; c.lineWidth=.8; c.beginPath(); c.arc(9,0,3.4,-1.6,1.6); c.stroke(); R_(8,-3.5,1,7,r>=4?'#9a7c45':'#55505a'); R_(10,-.7,L,1.4,M[1]); R_(10,-.7,L,.5,M[2]); c.fillStyle=M[1]; c.beginPath(); c.moveTo(10+L,-.7); c.lineTo(14+L,0); c.lineTo(10+L,.7); c.fill(); }
  else if(cl==='cleaver'){ grip(4,4); R_(8,-2,1.5,4,'#55505a'); R_(9.5,-hw-1,L,b.wid+2,M[1]); R_(9.5,-hw-1,L,1,M[0]); R_(9.5,hw,L,1,M[2]); R_(9.5+L-4,-hw+.5,2,2,'#0a0607'); R_(12,-.5,4,1,'#5a1414'); }
  else if(cl==='sickle'){ grip(4,5); R_(9,-1.5,1.5,3,'#55505a'); c.strokeStyle=M[1]; c.lineWidth=2; c.beginPath(); c.arc(10+L*.5,0,L*.5,Math.PI,Math.PI*1.95); c.stroke(); c.strokeStyle=M[2]; c.lineWidth=.6; c.beginPath(); c.arc(10+L*.5,0,L*.5-1,Math.PI*1.05,Math.PI*1.9); c.stroke(); }
  else if(cl==='flail'){ grip(3,7); R_(10,-2,1.5,4,'#55505a'); const sw=Math.sin(time*7)*2.2, hx=10+L, hy=3+sw; for(let i=1;i<=6;i++){ const k=i/7; R_(10+(hx-10)*k-.5,hy*k*k-.5,1.2,1.2,i%2?'#6a6470':'#3e3a44'); }
    c.fillStyle=M[1]; c.beginPath(); c.arc(hx,hy,hw+1,0,Math.PI*2); c.fill(); for(let i=0;i<6;i++){ const a=i/6*Math.PI*2; R_(hx+Math.cos(a)*(hw+1.6)-.5,hy+Math.sin(a)*(hw+1.6)-.5,1.2,1.2,M[2]); } R_(hx-1,hy-1,1,1,M[2]); }
  else if(cl==='hammer'){ R_(4,-1,L+2,2,wood); R_(4,-1,L+2,.5,'#6a4a30'); const hh=b.wid+4; R_(L,-hh/2,6,hh,M[1]); R_(L,-hh/2,6,.7,M[2]); R_(L+5.3,-hh/2,.7,hh,M[2]); R_(L,-hh/2,1,hh,M[0]);
    c.fillStyle=M[0]; c.beginPath(); c.moveTo(L,-hh/2+1); c.lineTo(L-5,-hh/2-2); c.lineTo(L,-hh/2+3); c.fill(); if(b.h===2){ R_(L+1,-hh/2-3,4,3,M[1]); R_(L+1,hh/2,4,3,M[1]); } }
  else if(cl==='xbow'){ R_(2,-1.5,L,3,wood); R_(2,-1.5,L,.5,'#6a4a30'); R_(L,-7,2,14,M[1]); R_(L,-7,.6,14,M[2]); c.strokeStyle='#cfc6b0'; c.lineWidth=.5; c.beginPath(); c.moveTo(L,-7); c.lineTo(L-6,0); c.lineTo(L,7); c.stroke(); R_(L-6,-.4,8,.8,'#8a8a90'); R_(4,1.5,2,3,wood); if(b.name==='Repeater'){ R_(L-9,-4.5,7,3,'#3a2a1e'); R_(L-9,-4.5,7,.6,'#6a4a30'); R_(L-7,-6,2,1.5,'#8a8a90'); } }
}
function drawShield(c,it,raised){ const pav=it.base.name==='Pavise', r=it.rarity; const M=r===5?['#120808','#2a1416','#ff6a50']:r===4?['#3e3424','#6a6250','#e2c88a']:r===3?['#2e3e32','#5a6a5e','#a9dcae']:['#2a2420','#4a3e34','#8a7a68'];
  const x=raised?5:3, y=raised?(pav?-28:-24):(pav?-22:-17), R_=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
  if(pav){ R_(x,y,5,20,M[1]); R_(x,y,5,.6,M[2]); R_(x+4,y,1,20,M[0]); R_(x+2,y+3,1,12,'#5a1414'); R_(x+1,y+8,3,1,'#5a1414'); for(let i=2;i<20;i+=4) R_(x+.5,y+i,.5,.5,M[2]); }
  else { c.fillStyle=M[1]; c.beginPath(); c.ellipse(x+2,y+5,2.5,6,0,0,Math.PI*2); c.fill(); c.strokeStyle=M[2]; c.lineWidth=.5; c.beginPath(); c.ellipse(x+2,y+5,2.5,6,0,0,Math.PI*2); c.stroke(); R_(x+1,y+4,2,2,M[0]); R_(x+1.5,y+4.5,.8,.8,M[2]); } }
function drawHero(c){
  const p=P, st=heroState(), ph=p.runPh; const br=heroBr(); const E=p.equip; const hound=p.houndT>0;
  const R_=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
  const flow=p.cloak; const flap=Math.sin(time*8+ph)*(st==='run'?1.5:.6);
  const ar=E.armor; let at=ar?tierIn(BASES.armor,ar.base):-1; let AC=ar?tint(ARM_COL[at],ar.rarity):null;
  const hm=E.helm; let ht=hm?tierIn(BASES.helm,hm.base):-1;
  let HM=hm?(hm.rarity===5?['#0e0606','#241010','#ff4a3d']:hm.rarity===4?['#4a1a36','#8a3a6a','#ff9ad4']:hm.rarity===3?['#4a2a10','#8a5420','#ffb060']:['#3a3e46','#6a717e','#b0b6c0']):null;
  if(hm&&!hound&&hm.base.fam==='L'&&hm.rarity<3) HM=['#241a14','#3e3024','#6b5640'];
  /* v39: gloves and boots, coloured by family and rarity */
  const fc=it=>{ if(!it) return null; const f=it.base.fam; const base=f==='L'?['#2e2218','#5a4632','#8a7458']:f==='H'?['#454b55','#7a828e','#b8bec8']:['#34373d','#5d626b','#8a909a']; return tint(base,it.rarity); };
  let GC=fc(E.gloves), BC=fc(E.boots);
  if(hound){ at=4; AC=['#050405','#121014','#4a1c1c']; ht=4; HM=['#050405','#141216','#5a1a1a']; GC=BC=null; }
  const armored=!!(ar||hound);
  // cloak with tattered hem and folds
  const k0=hound?'#070607':armored?'#1a1418':'#2a2224', k1=hound?'#0e0c0e':armored?'#2e2228':'#3a2e2e';
  c.fillStyle=k0; c.beginPath(); c.moveTo(-1,-21+br); c.lineTo(-5,-20+br); c.lineTo(-10+flow,-4+flap); c.lineTo(-9.5+flow,-2+flap); c.lineTo(-8.5+flow,-3.4); c.lineTo(-8+flow,-.5); c.lineTo(-6.8+flow,-2.6); c.lineTo(-5.5+flow,-1.2); c.lineTo(-4+flow*.5,-3+flap*.5); c.lineTo(-2+flow*.5,-2.5+flap*.5); c.lineTo(1,-10); c.closePath(); c.fill();
  c.fillStyle=k1; c.beginPath(); c.moveTo(-2,-20+br); c.lineTo(-5,-19+br); c.lineTo(-8+flow,-6+flap); c.lineTo(-3+flow*.5,-5); c.closePath(); c.fill();
  c.strokeStyle=k0; c.lineWidth=.5; c.beginPath(); c.moveTo(-3,-18+br); c.lineTo(-6.5+flow*.7,-5+flap*.6); c.moveTo(-1.6,-16+br); c.lineTo(-3.4+flow*.4,-4); c.stroke();
  R_(-5,-20+br,.5,2,hound?'#3a0a0a':'#4a3a34');
  // off hand behind the body
  const off=offActive()?E.off:null;
  if(off&&!isShield(off)){ c.save(); c.translate(-1+armExt('off'),-18+br); c.rotate(p.offA); R_(0,-1.5,6,3,armored?AC[0]:'#9a7258'); if(armored&&at>=3) R_(0,-1.5,6,.5,AC[1]); drawWeapon(c,off); c.restore(); }
  let a=0,b=0,la=0,lb=0;
  if(st==='run'){a=Math.sin(ph)*3.5;b=-a;la=Math.max(0,Math.cos(ph))*2.5;lb=Math.max(0,-Math.cos(ph))*2.5;}
  else if(st==='jump'){a=2;b=-1;la=3;lb=1;} else if(st==='fall'){a=-1;b=2;la=1;lb=2;} else if(st==='dash'){a=4;b=-4;la=1;lb=1;} else if(st==='wall'){a=2;b=1;la=2;lb=0;} else if(st==='iai'){a=4;b=-4;}
  else if(st==='atk'){ const t=p.attack.mv.t; if(t==='slam'){a=4;b=-3;} else if(t==='thrust'){a=5;b=-3;la=1;} else if(t==='spin'){a=2;b=-2;lb=p.onGround?0:2;} else if(t==='plunge'){a=1;b=-1;la=2;lb=2;} else {a=3;b=-2;} }
  const leg=(x,lift,front)=>{ const c0=at>=3?AC[0]:front?'#2b262c':'#1f1b20', c1=at>=3?AC[1]:front?'#38323a':'#2a2428';
    R_(x,-10,3,10-lift,c0); R_(x+(front?2:0),-10,1,10-lift,c1);
    if(at>=3){ R_(x-.3,-6.5-lift*.5,3.6,1.5,AC[1]); R_(x,-6.5-lift*.5,2.4,.5,AC[2]); R_(x,-10,3,.5,AC[2]); }
    else if(at>=0&&at<3){ R_(x,-9,3,.5,'rgba(0,0,0,.35)'); }
    if(BC){ R_(x,-4.5-lift,3.6,2.6,BC[0]); R_(x,-2-lift,4.2,2,BC[1]); R_(x,-4.5-lift,3.6,.5,BC[2]); R_(x+3.4,-1.6-lift,.8,.6,BC[2]); }
    else { R_(x,-3.5-lift,3.6,1.6,at>=3?AC[0]:'#1a1214'); R_(x,-2-lift,4,2,at>=3?AC[1]:'#0e0a0b'); R_(x,-4-lift,3,.5,at>=3?AC[2]:'#3a2a20'); } };
  leg(Math.round(-3+b),Math.round(lb),false);
  // torso
  if(!armored){ R_(-4,-19+br,8,10,'#5e5446'); R_(-4,-19+br,2.5,10,'#463e34'); R_(1.5,-19+br,1,9,'#6e6452'); R_(1,-16+br,2,3,'#b48a6a'); R_(1.5,-15.5+br,1,.5,'#8a6550');
    c.strokeStyle='#3a2a1c'; c.lineWidth=1; c.beginPath(); c.moveTo(-3.5,-18.5+br); c.lineTo(3.5,-11.5+br); c.stroke();
    R_(-4,-11+br,8,1.5,'#4a3a28'); R_(-4,-10.5+br,8,.5,'#2e2218'); R_(1,-11+br,1.5,2.5,'#5a4632'); R_(-3.5,-10+br,2,2,'#3a2a1c'); R_(-3.5,-10+br,2,.5,'#5a4632'); }
  else { const [d0,d1,d2]=AC; R_(-4,-19+br,8,10,d1); R_(-4,-19+br,2.5,10,d0);
    if(at===0){ for(let y=-17;y<-11;y+=2) R_(-4,y+br,8,.5,d0); for(let x=-2.5;x<4;x+=2) R_(x,-18.5+br,.5,7,d0); R_(-3,-19.5+br,6,1,d2); R_(-3,-19.5+br,6,.4,'#a8946e'); }
    else if(at===1){ for(let y=-18.5;y<-10.5;y+=1) for(let x=-3.5;x<4;x+=1) R_(x+(((y*2)&1)?.5:0),y+br,.5,.5,((Math.floor(x)+Math.floor(y))&1)?d0:d2); R_(-4,-9,8,1.5,d1); for(let x=-3.5;x<4;x+=1) R_(x,-8.5,.5,.5,d2); }
    else if(at===2){ for(let y=-17.5;y<-11;y+=2) for(let x=-3;x<4;x+=1.5) R_(x,y+br,.5,.5,d2); R_(-4,-15+br,8,.5,'#1a1210'); R_(-1,-19+br,.5,8,'#1a1210'); }
    else { R_(-.5,-18.5+br,.5,7,d2); R_(1.5,-18+br,1,5,d2); R_(-4,-12.5+br,8,.5,d0); R_(-4,-11+br,8,.5,d0); R_(-4,-9,8,2,d1); R_(-4,-9,8,.5,d2); R_(-4,-8,8,.5,d0); R_(-2.5,-20.5+br,5,1.5,d1); R_(-2.5,-20.5+br,5,.5,d2);
      if(at===4){ c.strokeStyle=(ar&&ar.rarity===5)||hound?'#5a1414':'#3a2a30'; c.lineWidth=.5; c.beginPath(); c.moveTo(-3,-17+br); c.quadraticCurveTo(0,-14+br,3,-17+br); c.moveTo(-3,-15+br); c.quadraticCurveTo(0,-12.5+br,3,-15+br); c.stroke(); R_(-4,-19+br,8,.5,hound?'#4a0a0a':'#4a1414'); } }
    if(at<3){ R_(-4,-11+br,8,1.5,'#3b2618'); R_(0,-11+br,1.5,1.5,ar&&ar.rarity>=4?'#e2c88a':'#8a7444'); R_(.4,-10.6+br,.6,.6,'#2a1a10'); } }
  leg(Math.round(a),Math.round(la),true);
  if(!hound&&at<3){ R_(-3,-21+br,7,2,'#7a1517'); R_(-3,-21+br,7,.5,'#9a2a24'); R_(-7+flow*.6,-21+br+flap*.4,4,2,'#6a1214'); R_(-7.5+flow*.6,-19.5+br+flap*.4,1,1.5,'#6a1214'); }
  if(E.amulet&&!hound){ R_(.5,-20.5+br,.5,1.5,'#8a7a5a'); R_(1,-19+br,2,2,RCOL[E.amulet.rarity]); R_(1.2,-18.8+br,.6,.6,'#fff'); }
  // head
  R_(-1,-21.5+br,3,1.5,'#9a7258');
  R_(-2,-26+br,5,5,'#b48a6a'); R_(-2,-26+br,1,5,'#9a7258'); R_(2.5,-24.5+br,.5,1.5,'#c89a7a'); R_(-2,-21.5+br,5,.5,'#8a6550');
  R_(0,-22+br,.5,.5,'#6a4a3a'); R_(1.5,-22.4+br,.5,.5,'#6a4a3a'); R_(2.5,-22+br,.5,.5,'#6a4a3a');
  const fullHelm=ht>=1;
  if(!fullHelm){ R_(1.5,-24.5+br,1.5,1,'#e8dcc8'); R_(2.4,-24.5+br,.6,1,'#1a1214'); R_(1,-25.5+br,2.5,.5,'#2a1a14'); R_(0,-25.5+br,.5,3,'#d6a88a'); R_(.5,-23+br,.5,.5,'#d6a88a'); R_(1.5,-22.5+br,1.5,.5,'#6a4038'); R_(-1,-24.5+br,1,1.5,'#9a7258'); }
  if(ht<=0){ c.fillStyle='#151012'; R_(-3,-28.5+br,6,3,'#151012'); c.beginPath(); c.moveTo(-3,-28+br); c.lineTo(-6.5,-27+br); c.lineTo(-3,-26+br); c.fill(); c.beginPath(); c.moveTo(-3,-26.5+br); c.lineTo(-5.5,-23.5+br); c.lineTo(-2,-25+br); c.fill(); c.beginPath(); c.moveTo(-1.5,-28.5+br); c.lineTo(-.5,-30.8+br); c.lineTo(1.5,-28.5+br); c.fill(); R_(1,-26.6+br,2.5,1,'#151012'); R_(-2,-28+br,.5,2,'#3a3034'); R_(0,-28.5+br,.5,1.5,'#3a3034'); }
  if(HM){ const [h0,h1,h2]=HM;
    if(ht===-1){ /* v39: hoods and cowls */ R_(-3,-27.6+br,6.4,2.2,h1); R_(-3.6,-26.5+br,2,5.5,h1); R_(-3.6,-26.5+br,.6,5.5,h0); R_(-3,-27.6+br,6.4,.5,h2); c.fillStyle=h1; c.beginPath(); c.moveTo(-3.5,-27+br); c.lineTo(-7+flow*.5,-23+br+flap*.4); c.lineTo(-3.5,-23+br); c.fill(); R_(2.6,-26+br,.6,3,h0); }
    else if(ht===0){ R_(-2,-31+br,5,3,h1); R_(-2,-31+br,5,.6,h2); R_(-4,-28.4+br,9,1,h1); R_(-4,-28.4+br,9,.4,h2); for(let x=-1.5;x<3;x+=1.5) R_(x,-29.5+br,.5,.5,h0); }
    else if(ht===1){ R_(-3,-29+br,7,8,h1); R_(-3,-29+br,2,8,h0); R_(-2,-29+br,5,.6,h2); R_(1,-26+br,3,1,'#060304'); R_(2,-26+br,1,3,'#060304'); for(let y=-28;y<-22;y+=1.5) R_(-1.5,y+br,.5,.5,h2); R_(4,-29+br,.5,8,h0); }
    else if(ht===2){ R_(-3,-29+br,6,8,h1); R_(-3,-29+br,2,8,h0); R_(-2,-30+br,3,1,h1); c.fillStyle=h1; c.beginPath(); c.moveTo(2,-27+br); c.lineTo(7.5,-24+br); c.lineTo(2,-21+br); c.fill(); R_(3,-25+br,3.5,.8,'#060304'); for(let i=0;i<3;i++) R_(3+i*1.2,-23+br,.5,.5,'#060304'); R_(-1,-30+br,2,.6,h2); R_(2,-27+br,4,.4,h2); }
    else if(ht===3){ R_(-3,-30+br,7,10,h1); R_(-3,-30+br,2,10,h0); R_(-3,-30+br,7,.6,h2); R_(0,-26+br,4,1,'#060304'); R_(2,-29+br,1,9,h0); R_(2.2,-29+br,.4,9,h2); R_(1,-24+br,.5,.5,'#060304'); R_(3,-24+br,.5,.5,'#060304'); R_(1,-22.5+br,.5,.5,'#060304'); R_(3,-22.5+br,.5,.5,'#060304'); }
    else { R_(-3,-29+br,6,8,h1); R_(-3,-29+br,2,8,h0); c.fillStyle=h1; c.beginPath(); c.moveTo(2,-28+br); c.lineTo(9.5,-24+br); c.lineTo(2,-21+br); c.fill(); R_(3,-25+br,4.5,.8,'#060304'); R_(-2,-30+br,4,.6,h2); for(let i=0;i<4;i++) R_(3.5+i*1.4,-22.5+br,.6,1.3,'#cdbf9f');
      if(hound){ c.fillStyle='#050405'; c.beginPath(); c.moveTo(-3,-29+br); c.lineTo(-7.5,-34.5+br); c.lineTo(-2,-30+br); c.fill(); c.beginPath(); c.moveTo(0,-30+br); c.lineTo(-1,-36.5+br); c.lineTo(2,-30+br); c.fill(); }
      else { c.fillStyle='#6a1214'; c.beginPath(); c.moveTo(-1,-30+br); c.lineTo(-7+flow,-31+br+flap*.5); c.lineTo(-6+flow,-28+br); c.lineTo(-2,-29+br); c.fill(); c.strokeStyle='#8a2a24'; c.lineWidth=.5; c.beginPath(); c.moveTo(-1.5,-29.8+br); c.lineTo(-6.5+flow,-30+br+flap*.5); c.stroke(); } } }
  // main arm and weapon
  const main=E.weapon;
  c.save(); c.translate(1+armExt('main'),-18+br); c.rotate(p.swordA);
  if(armored&&at>=3){ R_(0,-1.6,6,3.2,AC[1]); R_(0,-1.6,6,.6,AC[2]); R_(3,-1.6,.5,3.2,AC[0]); }
  else if(armored){ R_(0,-1.5,6,3,AC[0]); R_(0,-1.5,6,.5,AC[1]); }
  else { R_(0,-1.5,6,3,'#b48a6a'); R_(1,-1.5,.5,3,'#d8ccb4'); R_(2.5,-1.5,.5,3,'#d8ccb4'); R_(4,-1.5,.5,3,'#d8ccb4'); R_(0,.8,6,.7,'#9a7258'); }
  if(GC){ R_(3.5,-1.9,3,3.8,GC[1]); R_(3.5,-1.9,3,.6,GC[2]); R_(3.5,-1.9,.6,3.8,GC[0]); }
  if(!main){ R_(5,-2,3,4,GC?GC[1]:armored&&at>=3?AC[0]:'#9a7258'); R_(7,-2,1,4,'#6a4a38'); if(E.ring) R_(6,-2,1,1,RCOL[E.ring.rarity]); }
  else drawWeapon(c,main);
  c.restore();
  // pauldron
  if(armored&&at>=1){ const [d0,d1,d2]=AC;
    if(at===1){ R_(0,-21+br,4,3,d1); for(let x=.5;x<4;x+=1) R_(x,-20.5+br,.5,.5,d2); R_(0,-18.5+br,4,.5,d0); }
    else if(at===2){ R_(0,-21+br,5,3,d1); R_(0,-21+br,5,.5,d2); R_(1,-20+br,.5,.5,d2); R_(3,-20+br,.5,.5,d2); R_(0,-18.5+br,5,.5,d0); }
    else { R_(-.5,-21.5+br,6,2,d1); R_(-.5,-21.5+br,6,.6,d2); R_(0,-19.5+br,5.5,1.5,d1); R_(0,-19.5+br,5.5,.5,d2); R_(.5,-18+br,5,1.2,d1); R_(.5,-18+br,5,.4,d2); R_(5,-21.5+br,.5,4.5,d0);
      if(at===4){ R_(2,-24+br,1,2.5,d2); R_(4,-23+br,.8,1.5,d2); if(hound){ R_(1,-25+br,.8,3,'#050405'); R_(3.5,-24.5+br,.8,3,'#050405'); } } } }
  else if(!armored){ R_(0,-21+br,4,3,'#5e5446'); R_(0,-21+br,4,.5,'#7a6e58'); }
  if(off&&isShield(off)) drawShield(c,off,p.block);
}
function heroRim(){ if(P.houndT>0) return `rgba(200,20,14,${(.35+.15*Math.sin(time*9)).toFixed(2)})`; const pw=P.power||0; if(pw<10||P.dead) return null; const a=clamp((pw-9)/40,.03,.16)*(.75+.25*Math.sin(time*3));
  const vals=Object.values(P.equip).filter(Boolean); const abyss=vals.some(e=>e.rarity===5||e.aff.some(x=>varies(x)&&x.g===4)), uniq=vals.some(e=>e.rarity===4);
  return abyss?`rgba(200,24,16,${a.toFixed(2)})`:uniq?`rgba(220,150,80,${a.toFixed(2)})`:`rgba(170,70,40,${a.toFixed(2)})`; }
function gearFX(pose,br){ if(P.dead) return; const pw=P.power||0, E=P.equip, hound=P.houndT>0;
  const vals=Object.values(E).filter(Boolean); const abyss=hound||vals.some(e=>e.rarity===5||e.aff.some(x=>varies(x)&&x.g===4));
  const ec=abyss?'#ff3a2a':'#ffb070';
  if((pw>=12&&R()<pw*.005)||(hound&&R()<.5)) part({x:P.x+rnd(-6,6),y:P.y-rnd(4,26),vx:rnd(-8,8),vy:rnd(-40,-15),g:-8,life:rnd(.5,1),em:true,col:abyss?pick(['#ff3a2a','#a01010']):pick(['#ff9a4a','#ffcf8a'])});
  if((pw>=18&&R()<.3)||(hound&&R()<.6)) part({type:'dust',x:P.x+rnd(-7,7),y:P.y-rnd(0,20),vx:rnd(-6,6)-P.vx*.2,vy:rnd(-30,-12),g:-6,life:rnd(.6,1.1),col:'rgba(8,4,6,.7)',size:ri(1,2)});
  const hm=E.helm; const eyes=hound||pw>=16||(hm&&hm.rarity>=4);
  if(eyes){ const ht=hound?4:hm?tierIn(BASES.helm,hm.base):-1; emisAt(P.x,P.y,P.face,g=>{ g.fillStyle=ec; if(ht===1) g.fillRect(2,-26+br,2,1); else if(ht===2||ht===4) g.fillRect(4,-25+br,hound?3:2,.8); else if(ht===3) g.fillRect(1,-26+br,2,1); else g.fillRect(2.4,-24.5+br,.6,1); },pose); }
  if(E.amulet&&!hound&&E.amulet.rarity>=3){ const c=hex(RCOL[E.amulet.rarity]); emisAt(P.x,P.y,P.face,g=>{ g.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${E.amulet.rarity>=4?.7:.35})`; g.fillRect(1,-19+br,2,2); },pose); }
  if(E.armor&&E.armor.rarity===5&&!hound){ const fl=.5+.5*Math.sin(time*5); emisAt(P.x,P.y,P.face,g=>{ g.fillStyle=`rgba(255,50,30,${(.3+fl*.35).toFixed(2)})`; g.fillRect(-1,-17+br,.6,3); g.fillRect(0,-14+br,2,.6); g.fillRect(-3,-13+br,.6,2); },pose); }
  if(pw>=14||hound) addLight(P.x,P.y-14,36+pw,hound?.5:clamp(pw/70,.08,.28),1,abyss?.18:.55,abyss?.1:.3); }
