'use strict';
/* ===== regions (v24): how Acts I and II look and feel =====
   One look per region, from the mood boards (art/moodboard/, palettes.json): a backdrop painted at the game's pixel
   scale with ordered dithering, the ground baked to match (earth, sand, snow, cobbles, masonry), set dressing,
   weather in front of the world, and each region's one mechanic:
     meadow  too quiet: crows that sit, scarecrows that face you; dew mist; nothing sings
     fen     horror: black water, hands that grab when you wade; marsh mist
     ashes   what's left of Kesh: wind, sandstorms that cut what you can see, glass, granary ribs
     pass    fog banks hide the drops; rocks fall (a shadow first); snow
     fort    the border fort at the top of the pass; snow and braziers
     villages the festival: folk who stop and watch you pass; a tithe mark on every tenth door; bells at the wrong time
     slums   rot, laundry, tithe-lanterns, drips
     oldcity the most normal place in the game: warm windows, signs, his portrait on every wall (its eyes follow you)
     royal   damask, gilt, portraits that bleed
     bridge  a red sky, statues, the gate of pikes
   Through Act I the red Wound sits on the horizon and grows region by region, so the sky tells you how close home is. */

/* ---------- dithering helpers ---------- */
const RBAYER=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
const hexRGB=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
function dGrad(g,x0,y0,w,h,stops,px){ px=px||1; const C=stops.map(hexRGB); const id=g.getImageData(x0,y0,w,h), d=id.data;
  for(let y=0;y<h;y+=px){ const f=y/Math.max(1,h-1)*(C.length-1), i=Math.min(C.length-2,f|0), t=f-i;
    for(let x=0;x<w;x+=px){ const c=t*16>RBAYER[((y/px)&3)*4+((x/px)&3)]+.5?C[i+1]:C[i];
      for(let yy=y;yy<Math.min(h,y+px);yy++) for(let xx=x;xx<Math.min(w,x+px);xx++){ const k=(yy*w+xx)*4; d[k]=c[0]; d[k+1]=c[1]; d[k+2]=c[2]; d[k+3]=255; } } }
  g.putImageData(id,x0,y0); }
function dFog(g,x0,y0,w,h,col,dens,px,seed){ px=px||1; const c=hexRGB(col); const id=g.getImageData(x0,y0,w,h), d=id.data;
  for(let y=0;y<h;y+=px){ const t0=dens*Math.sin(Math.PI*y/h); for(let x=0;x<w;x+=px){ const tt=t0*(.65+.35*Math.sin(x/37+(seed||0)+y/13));
      if(tt*16>RBAYER[((y/px)&3)*4+((x/px)&3)]+.5) for(let yy=y;yy<Math.min(h,y+px);yy++) for(let xx=x;xx<Math.min(w,x+px);xx++){ const k=(yy*w+xx)*4; d[k]=c[0]; d[k+1]=c[1]; d[k+2]=c[2]; d[k+3]=255; } } }
  g.putImageData(id,x0,y0); }
/* a periodic ridge (tiles across the layer width) */
function ridgeFn(w,seed,octs){ const rr=rMul(seed); const A=[...Array(octs||3)].map((_,o)=>({f:(1+o*2+((rr()*2)|0))*2*Math.PI/w,p:rr()*6.28,a:1/(o+1)})); const tot=A.reduce((s,a)=>s+a.a,0);
  return x=>A.reduce((s,a)=>s+a.a*Math.sin(x*a.f+a.p),0)/tot; }
function rMul(a){ return ()=>{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function ridge(g,w,base,amp,col,seed,octs,to){ const f=ridgeFn(w,seed,octs); g.fillStyle=col; for(let x=0;x<w;x++){ const y=Math.round(base-amp*f(x)); g.fillRect(x,y,1,(to||320)-y); } return f; }
function woundSky(g,cx,cy,w,h){ if(w<=0) return; for(let y=Math.round(cy-h*3);y<cy+h*3;y++) for(let x=Math.round(cx-w*1.6);x<cx+w*1.6;x++){ const dx=(x-cx)/(w*1.5), dy=(y-cy)/(h*3), r=dx*dx+dy*dy; if(r<1&&(1-r)*.45*16>RBAYER[(y&3)*4+(x&3)]+.5){ g.fillStyle='rgba(120,10,14,.55)'; g.fillRect(x,y,1,1); } }
  g.fillStyle='#b0141a'; for(let x=Math.round(cx-w);x<=cx+w;x++){ const hh=h*(1-((x-cx)/w)**2); g.fillRect(x,Math.round(cy-hh),1,Math.max(1,Math.round(hh*2))); }
  g.fillStyle='#5a0a0e'; g.fillRect(Math.round(cx-w*.7),Math.round(cy),Math.round(w*1.4),1); g.fillRect(Math.round(cx),Math.round(cy-h*.8),1,Math.max(1,Math.round(h*1.6))); }

/* ---------- the looks ----------
   ground: colours for baked earth · mason: built places use dressed stone · wound: [x,y,w,h] on the far layer */
const LOOKS={
  meadow:{soil:['#4c5640','#465036','#525c44'],deep:'#262c22',top:'#a69357',top2:'#d2bd82',tuft:['#a69357','#d2bd82','#7f8b6f','#55614f'],edge:'#55614f',water:'rgba(40,60,60,.55)',
    wound:[150,232,7,1.2],weather:'mist',fog:'#e6e3d4'},
  fen:{soil:['#2a2e20','#24281c','#30362a'],deep:'#10120c',top:'#3e5a2c',top2:'#6f8a3a',tuft:['#3e5a2c','#6f8a3a','#4a2f4f','#2a1c30'],edge:'#141a16',water:'rgba(16,26,20,.78)',
    wound:[760,190,10,1.8],weather:'marsh',fog:'#3e5a2c'},
  ashes:{soil:['#a08860','#957a50','#8a7652'],deep:'#4a3a28',top:'#c4ad80',top2:'#e2d2a6',tuft:['#957548','#c4ad80','#6b6460'],edge:'#6b6460',water:'rgba(134,168,160,.6)',
    wound:[440,120,18,3.2],weather:'sand',fog:'#d8cdb0'},
  pass:{soil:['#2a2e34','#32363c','#262a30'],deep:'#121418',top:'#e7e9e7',top2:'#b8bdc0',tuft:['#e7e9e7','#b8bdc0','#7b848b'],edge:'#454d55',water:'rgba(60,70,80,.6)',
    wound:[300,90,26,4.5],weather:'snow',fog:'#b8bdc0',fogBanks:1},
  fort:{mason:1,stone:['#4a4642','#524e4a','#423e3a','#5a5652'],mortar:'#1a1816',deep:'#0e0c0c',top:'#eceae4',top2:'#8a8580',tuft:['#eceae4','#c8c4bc'],edge:'#2c3240',water:'rgba(30,36,48,.6)',
    wound:[560,90,42,7],weather:'snow',fog:'#2c3240'},
  villages:{soil:['#5a4430','#644c36','#4e3a28'],deep:'#1a120c',top:'#8a6a32',top2:'#d4b25a',tuft:['#d4b25a','#8a6a32','#b8704a'],edge:'#4a2c38',water:'rgba(40,30,40,.6)',
    wound:[760,70,30,5.5],weather:'chaff',fog:'#b8704a',folk:1},
  slums:{mason:1,stone:['#4a3a28','#52402c','#423424','#5a4632'],mortar:'#1e160e',deep:'#100e0c',top:'#4a3a28',top2:'#6a6a32',tuft:['#6a6a32','#2e3424'],edge:'#100e0c',water:'rgba(46,52,36,.8)',
    wound:[470,40,12,2.2],weather:'drip',fog:'#2e3424'},
  oldcity:{mason:1,cobble:1,stone:['#5e5a54','#66625c','#56524c','#6e6a64'],mortar:'#24221e',deep:'#0e0e12',top:'#9a9488',top2:'#cfc6b2',tuft:[],edge:'#3e4450',water:'rgba(26,30,42,.6)',
    wound:[210,66,22,4],weather:'none',fog:'#2a3040',portraits:1},
  royal:{mason:1,stone:['#3a1a1e','#421e22','#34161a','#4a2226'],mortar:'#1a0a0c',deep:'#0a0606',top:'#6e5420',top2:'#b8913a',tuft:[],edge:'#0a0606',water:'rgba(40,10,14,.7)',
    wound:null,weather:'motes',fog:'#5a1420',portraits:2},
  bridge:{mason:1,stone:['#3a3a40','#424248','#34343a','#4a4a50'],mortar:'#16161a',deep:'#0e0a0a',top:'#6e6a68',top2:'#a8a4a0',tuft:[],edge:'#0e0a0a',water:'rgba(40,8,10,.7)',
    wound:[480,54,60,9],weather:'embers',fog:'#5a0a0e',pikes:1}
};
const lookOf=def=>def&&def.look?LOOKS[def.look]:null;

/* ---------- backdrops: far (960x320) and mid (1200x320, transparent) ---------- */
const BGPAINT={
  meadow(f,m){ dGrad(f,0,0,960,320,['#f3eee2','#e6e3d4','#d5d0b9','#d5d0b9'],2); f.fillStyle='#f3eee2'; f.beginPath(); f.arc(640,70,24,0,7); f.fill(); dFog(f,0,30,960,120,'#e6e3d4',.5,2,1);
    ridge(f,960,236,10,'#7f8b6f',3,3); dFog(f,0,200,960,80,'#e6e3d4',.6,2,2); ridge(f,960,262,8,'#8f8a5c',4,2);
    const st=(x,y,h)=>{ m.fillStyle='#55614f'; m.fillRect(x,y-h,7,h); m.fillRect(x+1,y-h-1,5,1); m.fillStyle='#2b302b'; m.fillRect(x+6,y-h+2,1,h-2); };
    for(let i=0;i<4;i++){ const x=80+i*300; const rr=rMul(i+7); [0,12,23,35].forEach((o,k)=>st(x+o,290,14+((rr()*10)|0))); if(i%2===0){ m.fillStyle='#2b302b'; m.fillRect(x+3,290-30,4,3); m.fillRect(x+15,290-34,4,3); } }
    m.fillStyle='#a69357'; for(let x=0;x<1200;x++){ const h=8+((x*37)%7); m.fillRect(x,320-h,1,h); } m.fillStyle='#d2bd82'; for(let x=0;x<1200;x+=3) m.fillRect(x+((x*13)%2),320-14-((x*7)%5),1,4); },
  fen(f,m){ dGrad(f,0,0,960,320,['#2a1c30','#4a2f4f','#3e5a2c','#3e5a2c'],2); dFog(f,0,120,960,120,'#4a2f4f',.45,2,2);
    const tf=ridge(f,960,250,8,'#2a1c30',5,4); f.fillStyle='#2a1c30'; for(let x=0;x<960;x+=7){ const h=10+((x*29)%24); f.fillRect(x,250-h,1,h); f.fillRect(x,250-h+4,3,1); }
    dFog(f,0,220,960,80,'#3e5a2c',.55,2,4); f.fillStyle='#141a16'; f.fillRect(0,280,960,40);
    for(let i=0;i<5;i++){ const x=40+i*240; m.fillStyle='#2a1c30'; m.fillRect(x,250,26,14); m.beginPath(); m.moveTo(x-4,251); m.lineTo(x+13,240); m.lineTo(x+30,251); m.fill(); m.fillStyle='#6f8a3a'; m.fillRect(x+10,254,4,4); m.fillStyle='#0b0d0a'; for(let s=x+2;s<x+26;s+=7) m.fillRect(s,264,1,40); }
    for(const tx of [180,620,1000]){ m.fillStyle='#0b0d0a'; m.beginPath(); m.moveTo(tx-5,320); m.lineTo(tx+5,320); m.lineTo(tx+8,0); m.lineTo(tx-1,0); m.fill(); for(const by of [40,80,120]){ m.fillRect(tx,by,40,2); for(let mx=tx;mx<tx+40;mx+=2){ m.fillStyle=(mx%3)?'#3e5a2c':'#6f8a3a'; m.fillRect(mx,by,1,6+((mx*13)%30)); } m.fillStyle='#0b0d0a'; } } },
  ashes(f,m){ dGrad(f,0,0,960,320,['#d8cdb0','#ebe4d2','#ebe4d2','#d8cdb0'],2);
    ridge(f,960,250,6,'#d8cdb0',6,2); ridge(f,960,262,8,'#c4ad80',7,3); dFog(f,0,220,960,70,'#d8cdb0',.5,2,3);
    for(let i=0;i<3;i++){ const x=150+i*320; f.fillStyle='#2a211c'; f.beginPath(); f.moveTo(x,262); f.lineTo(x+26,262); f.lineTo(x+34,200); f.lineTo(x+14,196); f.fill(); f.fillStyle='#6b6460'; for(let k=0;k<5;k++) f.fillRect(x+4+k,256-k*11,22,1); }
    for(let i=0;i<4;i++){ const x=60+i*300; m.strokeStyle='#2a211c'; m.lineWidth=2; for(let k=0;k<6;k++){ const h=34-Math.abs(k-3)*3; m.beginPath(); m.arc(x+k*11+12,300,h,Math.PI,Math.PI*1.5); m.stroke(); } }
    m.fillStyle='#c4ad80'; for(let x=0;x<1200;x++){ const h=10+Math.round(6*Math.sin(x/53)+3*Math.sin(x/17)); m.fillRect(x,320-h,1,h); } m.fillStyle='#957548'; for(let x=0;x<1200;x+=2) if(Math.sin(x/53)>.3) m.fillRect(x,320-10-Math.round(6*Math.sin(x/53)),1,2); },
  pass(f,m){ dGrad(f,0,0,960,320,['#454d55','#7b848b','#b8bdc0','#b8bdc0'],2); dFog(f,0,0,960,80,'#7b848b',.5,2,1);
    const pk=(x,h,w,col,cap)=>{ f.fillStyle=col; f.beginPath(); f.moveTo(x-w,320); f.lineTo(x,320-h); f.lineTo(x+w,320); f.fill(); f.fillStyle=cap; f.beginPath(); f.moveTo(x-9,320-h+10); f.lineTo(x,320-h); f.lineTo(x+10,320-h+12); f.lineTo(x+2,320-h+7); f.fill(); };
    for(let i=0;i<6;i++) pk(i*170+60,150+((i*53)%70),110,'#7b848b','#e7e9e7'); dFog(f,0,160,960,100,'#b8bdc0',.6,2,5);
    for(let i=0;i<5;i++) pk(i*200+130,100+((i*31)%50),90,'#454d55','#b8bdc0'); dFog(f,0,230,960,90,'#b8bdc0',.85,2,7);
    m.fillStyle='#2a2e34'; m.fillRect(510,96,20,10); m.fillStyle='#121418'; m.beginPath(); m.moveTo(506,96); m.lineTo(520,89); m.lineTo(534,96); m.fill(); m.fillRect(516,82,8,7); m.beginPath(); m.moveTo(513,82); m.lineTo(520,77); m.lineTo(527,82); m.fill();
    for(let i=0;i<4;i++){ const x=40+i*300; m.strokeStyle='#121418'; m.lineWidth=1; m.beginPath(); for(let k=0;k<=60;k++){ const t=k/60; m.lineTo(x+t*120,200+14*Math.sin(t*Math.PI)); } m.stroke(); for(let k=1;k<12;k++){ const t=k/12; m.fillStyle=k%2?'#b08a4a':'#e7e9e7'; m.fillRect(x+t*120,200+14*Math.sin(t*Math.PI),3,4); } } },
  fort(f,m){ dGrad(f,0,0,960,320,['#0e0a0a','#1f232c','#2c3240','#2c3240'],2); for(let i=0;i<120;i++){ f.fillStyle='rgba(236,234,228,.5)'; f.fillRect((i*157)%960,(i*61)%200,1,1); }
    ridge(f,960,250,26,'#1f232c',8,3); ridge(f,960,272,10,'#2c3240',9,2);
    m.fillStyle='#4a4642'; m.fillRect(0,230,1200,90); for(let x=0;x<1200;x+=10) m.fillRect(x,224,6,6); for(const tx of [100,520,900]){ m.fillStyle='#8a8580'; m.fillRect(tx,180,40,140); for(let x=tx;x<tx+40;x+=10) m.fillRect(x,174,6,6); m.fillStyle='#d0782a'; m.fillRect(tx+16,200,6,8); }
    m.fillStyle='#1a1816'; for(let y=236;y<320;y+=6) for(let x=(y%12)?0:8;x<1200;x+=16) m.fillRect(x,y,1,5); for(let y=236;y<320;y+=6) m.fillRect(0,y,1200,1);
    m.fillStyle='#eceae4'; m.fillRect(0,229,1200,2); for(const bx of [300,700,1100]){ m.fillStyle='rgba(208,120,42,.8)'; m.fillRect(bx,216,4,6); m.fillStyle='#b0141a'; m.fillRect(bx+1,218,2,3); } },
  villages(f,m){ dGrad(f,0,0,960,320,['#1a141c','#4a2c38','#b8704a','#e2a65c'],2);
    f.fillStyle='#1a141c'; f.fillRect(0,224,960,96); for(let x=0;x<960;x+=7) f.fillRect(x,220,4,4); for(const tx of [60,300,540,780]){ f.fillRect(tx-7,196,14,30); f.fillStyle='#0e0a0a'; f.beginPath(); f.moveTo(tx-3,198); f.lineTo(tx+3,198); f.lineTo(tx+3,214); f.lineTo(tx,211); f.lineTo(tx-3,214); f.fill(); f.fillStyle='#1a141c'; }
    for(let i=0;i<10;i++){ const x=i*120+10, h=14+(i%3)*3, y=300; m.fillStyle='#4a2c38'; m.fillRect(x,y-h,24,h); m.fillStyle='#1a141c'; m.beginPath(); m.moveTo(x-3,y-h); m.lineTo(x+12,y-h-11); m.lineTo(x+27,y-h); m.fill(); m.fillStyle='#e2a65c'; m.fillRect(x+3,y-h+4,4,3); m.fillStyle='#1a141c'; m.fillRect(x+14,y-8,5,8); if(i%10===6){ m.fillStyle='#b0141a'; m.fillRect(x+15,y-7,1,1); m.fillRect(x+17,y-5,1,1); m.fillRect(x+16,y-6,1,1); } }
    for(let x=0;x<1200;x++){ const y=270+7*Math.sin(((x%120)/120)*Math.PI); m.fillStyle='#ebdfc4'; m.fillRect(x,y,1,1); if(x%5===0){ m.fillStyle=(x/5)%2?'#ebdfc4':'#d4b25a'; m.fillRect(x,y,3,1); m.fillRect(x+1,y+1,1,2); } }
    m.fillStyle='#8a6a32'; m.fillRect(0,300,1200,20); },
  slums(f,m){ dGrad(f,0,0,960,320,['#100e0c','#2e3424','#1a1812','#100e0c'],2);
    for(let i=0;i<12;i++){ const x=i*80, h=120+((i*67)%90); f.fillStyle=i%2?'#2a2018':'#241c14'; f.fillRect(x,320-h,72,h); f.fillStyle='#100e0c'; f.beginPath(); f.moveTo(x-2,320-h); f.lineTo(x+36,320-h-14); f.lineTo(x+74,320-h); f.fill(); f.fillStyle='rgba(106,106,50,.6)'; f.fillRect(x+12,320-h+20,5,6); }
    for(let i=0;i<6;i++){ const x=i*200+30, y=120+(i%3)*40; m.strokeStyle='#a8a294'; m.lineWidth=1; m.beginPath(); for(let k=0;k<=40;k++){ const t=k/40; m.lineTo(x+t*160,y+8*Math.sin(t*Math.PI)); } m.stroke(); for(let k=1;k<8;k++){ const t=k/8; m.fillStyle=['#a8a294','#d8cfae','#6a6a32'][k%3]; m.fillRect(x+t*160,y+8*Math.sin(t*Math.PI),6,9+(k%3)*2); } }
    for(const lx of [140,640,1050]){ m.fillStyle='rgba(176,20,26,.25)'; m.beginPath(); m.arc(lx,190,14,0,7); m.fill(); m.fillStyle='#b0141a'; m.fillRect(lx-2,187,4,6); } },
  oldcity(f,m){ dGrad(f,0,0,960,320,['#0e0e12','#1a1e2a','#2a3040','#2a3040'],2);
    const cx=480; f.fillStyle='#3e4450'; f.beginPath(); f.moveTo(cx-4,40); f.lineTo(cx+4,40); f.lineTo(cx+9,110); f.lineTo(cx-9,110); f.fill(); f.fillRect(cx-26,110,52,210); f.beginPath(); f.moveTo(cx-30,114); f.lineTo(cx,92); f.lineTo(cx+30,114); f.fill(); f.fillStyle='#e0b060'; f.beginPath(); f.arc(cx,140,9,0,7); f.fill(); f.fillStyle='#3e4450'; f.fillRect(cx-9,139,18,1); f.fillRect(cx,131,1,18);
    for(let i=0;i<14;i++){ const x=i*70, top=200+((i*41)%50); if(Math.abs(x+30-cx)<50) continue; f.fillStyle='#2a3040'; f.fillRect(x,top,64,320-top); f.beginPath(); f.moveTo(x-2,top); f.lineTo(x+32,top-16); f.lineTo(x+66,top); f.fill(); for(let wx=x+6;wx<x+56;wx+=12){ f.fillStyle=((wx*7+i)%3)?'#e0b060':'#0e0e12'; f.fillRect(wx,top+10,4,6); } }
    for(let i=0;i<6;i++){ const x=i*200, top=230; m.fillStyle='#cfc6b2'; m.fillRect(x,top,90,90); m.fillStyle='#3e4450'; m.beginPath(); m.moveTo(x-3,top); m.lineTo(x+45,top-18); m.lineTo(x+93,top); m.fill(); m.fillStyle='#0e0e12'; for(let bx=x;bx<x+90;bx+=12) m.fillRect(bx,top,1,90); m.fillRect(x,top+20,90,1); for(let wx=x+4;wx<x+80;wx+=12){ m.fillStyle=(wx%36)?'#e0b060':'#0e0e12'; m.fillRect(wx,top+6,4,7); } } },
  royal(f,m){ f.fillStyle='#3a1018'; f.fillRect(0,0,960,320); for(let y=0;y<320;y++) for(let x=0;x<960;x+=8) if(((x>>3)+(y>>3))%2===0&&(y%8===2||y%8===5)){ f.fillStyle='#6e5420'; f.fillRect(x+3,y,2,1); }
    f.fillStyle='#0a0606'; f.fillRect(0,0,960,24); for(let i=0;i<6;i++){ const x=i*160+40; f.fillStyle='#0a0606'; f.fillRect(x,24,30,296); f.fillStyle='#6e5420'; f.fillRect(x+30,24,2,296); }
    for(let i=0;i<4;i++){ const x=i*300+80; m.fillStyle='#b8913a'; m.fillRect(x,90,46,56); m.fillStyle='#0a0606'; m.fillRect(x+3,93,40,50); m.fillStyle='#ece6d8'; m.beginPath(); m.ellipse(x+23,112,9,12,0,0,7); m.fill(); m.fillStyle='#6e5420'; m.fillRect(x+12,124,22,19); m.fillStyle='#0a0606'; m.fillRect(x+18,109,2,2); m.fillRect(x+26,109,2,2); m.fillStyle='#b0141a'; m.fillRect(x+18,111,1,40+(i*7)%20); m.fillRect(x+27,111,1,30+(i*11)%25); }
    for(let i=0;i<3;i++){ const cx=i*400+200; m.fillStyle='#6e5420'; m.fillRect(cx,0,1,20); m.strokeStyle='#b8913a'; m.lineWidth=2; m.beginPath(); m.arc(cx,14,30,0,Math.PI); m.stroke(); for(let k=-28;k<=28;k+=8){ m.fillStyle='#e8d4a0'; m.fillRect(cx+k,22,1,4); m.fillStyle='#b0141a'; m.fillRect(cx+k,20,1,1); } } },
  bridge(f,m){ dGrad(f,0,0,960,320,['#0e0a0a','#5a0a0e','#b0141a','#b0141a'],2);
    for(const [tx,h] of [[300,64],[360,90],[420,40],[480,110],[540,40],[600,96],[660,60]]){ f.fillStyle='#0e0a0a'; f.fillRect(tx-10,300-h,20,h+20); f.beginPath(); f.moveTo(tx-13,300-h); f.lineTo(tx,300-h-18); f.lineTo(tx+13,300-h); f.fill(); }
    f.fillRect(220,250,520,70); f.fillRect(450,210,60,60); for(const [px_,s] of [[466,2],[480,3],[494,2]]){ f.fillRect(px_,170,1,40); f.beginPath(); f.arc(px_,168-s,s+1,0,7); f.fill(); }
    for(let i=0;i<8;i++){ const x=i*150+20; m.fillStyle='#0e0a0a'; m.fillRect(x,240,8,80); m.fillRect(x-2,236,12,4); m.fillRect(x+2,224,4,12); m.fillRect(x+6,222,2,14); m.fillStyle='rgba(224,144,64,.5)'; m.beginPath(); m.arc(x+80,250,6,0,7); m.fill(); m.fillStyle='#e09040'; m.fillRect(x+79,248,2,3); m.fillStyle='#0e0a0a'; m.fillRect(x+79,251,2,69); }
    m.fillStyle='#3a3a40'; m.fillRect(0,300,1200,20); m.fillStyle='#0e0a0a'; for(let x=0;x<1200;x+=14) m.fillRect(x,294,6,6); }
};
(function(){ const o=bakeBG; bakeBG=function(pl){ const lk=L&&lookOf(L.def); if(!lk) return o(pl); const name=L.def.look;
  const far=document.createElement('canvas'); far.width=960; far.height=320; const f=far.getContext('2d');
  const mid=document.createElement('canvas'); mid.width=1200; mid.height=320; const m=mid.getContext('2d');
  try{ BGPAINT[name](f,m); if(lk.wound&&L.def.act!=='Prologue'){ const [x,y,w,h]=lk.wound; woundSky(f,x,y,w,h); } }catch(e){ console.warn('bg',name,e); }
  return {far,mid}; }; })();

/* ---------- the ground ---------- */
function bakeRegion(Lv,pl,lk){
  const c=document.createElement('canvas'); c.width=Lv.w*T; c.height=Lv.h*T; const g=c.getContext('2d');
  const tl=(x,y)=>(x<0||x>=Lv.w||y<0||y>=Lv.h)?1:Lv.g[y][x], air=(x,y)=>tl(x,y)!==1;
  const P_=(x,y,w,h,col)=>{ g.fillStyle=col; g.fillRect(x,y,w,h); };
  for(let y=0;y<Lv.h;y++) for(let x=0;x<Lv.w;x++){ const v=Lv.g[y][x], px=x*T, py=y*T;
    if(v===1){ let dd=4; for(let r=1;r<4;r++){ if(air(x,y-r)||air(x,y+r)||air(x-r,y)||air(x+r,y)){ dd=r; break; } }
      if(dd===4){ P_(px,py,16,16,lk.deep); continue; }
      if(lk.mason){ for(let r=0;r<2;r++){ const by=py+r*8, row=y*2+r, off=(row&1)*8; const b=(bi)=>lk.stone[Math.floor(hsh(bi,row)*lk.stone.length)];
          if(off===0){ P_(px,by,16,8,b(x)); P_(px,by,1,7,lk.mortar); } else { P_(px,by,8,8,b(x-1)); P_(px+8,by,8,8,b(x)); P_(px+8,by,1,7,lk.mortar); }
          P_(px,by+7,16,1,lk.mortar); P_(px,by,16,1,'rgba(255,240,220,.05)'); }
        if(lk.cobble&&air(x,y-1)) for(let k=0;k<4;k++) P_(px+k*4,py,3,2,lk.stone[(x+k)%lk.stone.length]); }
      else { P_(px,py,16,16,lk.soil[Math.floor(hsh(x,y)*lk.soil.length)]);
        for(let i=0;i<14;i++){ const sx=px+ri(0,15), sy=py+ri(0,15); P_(sx,sy,1,1,R()<.5?'rgba(0,0,0,.18)':pick(lk.soil)); }
        if(hsh(x*7,y*3)>.86){ P_(px+ri(2,10),py+ri(4,11),ri(3,5),ri(2,3),lk.edge); }
        if(Lv.def.look==='ashes'&&hsh(x*5,y)>.9){ P_(px+3,py+8,6,1,'#ebe4d2'); P_(px+3,py+7,1,1,'#ebe4d2'); P_(px+8,py+7,1,1,'#ebe4d2'); }
        if(Lv.def.look==='fen'&&hsh(x,y*5)>.85){ P_(px+ri(1,13),py+ri(2,12),1,ri(3,6),'#141a16'); } }
      if(dd>1) P_(px,py,16,16,`rgba(6,5,6,${Math.min(.7,(dd-1)*.24)})`);
      if(air(x,y-1)){ P_(px,py,16,3,lk.top); P_(px,py,16,1,lk.top2); for(let i=0;i<16;i++) if(hsh(x*16+i,y)>.55) P_(px+i,py+3,1,1,lk.top);
        P_(px,py+4,16,1,'rgba(0,0,0,.3)');
        if(tl(x,y-1)===0&&lk.tuft.length){ const n=Lv.def.look==='meadow'?6:Lv.def.look==='fen'?4:2; for(let i=0;i<n;i++){ const gx=px+ri(0,15), gl=ri(1,Lv.def.look==='meadow'?6:3); P_(gx,py-gl,1,gl,pick(lk.tuft)); } } }
      if(air(x,y+1)&&y+1<Lv.h){ P_(px,py+14,16,2,'rgba(0,0,0,.4)'); if(R()<.3&&!lk.mason) P_(px+ri(1,14),py+16,1,ri(2,7),lk.edge); }
      if(air(x-1,y)) P_(px,py,1,16,'rgba(255,240,220,.06)'); if(air(x+1,y)) P_(px+15,py,1,16,'rgba(0,0,0,.28)'); }
    else if(v===2){ P_(px,py,16,6,'#24170f'); P_(px,py,16,4,'#5a3d27'); P_(px,py,16,1,'#7a5636'); P_(px+((x&1)?0:8),py,1,4,'#24170f'); }
    else if(v===3){ P_(px,py+10,16,6,'#120c0c'); for(let i=0;i<4;i++){ const sx=px+i*4; g.fillStyle='#4a3424'; g.beginPath(); g.moveTo(sx,py+12); g.lineTo(sx+2,py+2); g.lineTo(sx+4,py+12); g.fill(); P_(sx+2,py+3,1,3,'#8a6a48'); } }
    else if(v===4){ P_(px,py,16,16,lk.water); if(tl(x,y-1)!==4){ P_(px,py,16,1,'rgba(200,220,200,.15)'); } }
    else if(v===5){ P_(px,py+2,16,14,'#3a0a04'); P_(px,py+3,16,2,'#8a2a0a'); } }
  regionDecor(Lv,g,lk);
  if(Lv.exit){ const ex=Lv.exit.x*T+8, ey=Lv.exit.y*T; const post=lk.mason?pick(lk.stone):'#2a1a10';
    P_(ex-24,ey-70,6,70,post); P_(ex+18,ey-70,6,70,post); P_(ex-28,ey-76,56,7,post); P_(ex-28,ey-76,56,1,lk.top2); P_(ex-18,ey-62,36,62,'rgba(2,1,2,.85)'); }
  Lv.wspans=[]; for(let y=0;y<Lv.h;y++){ let x=0; while(x<Lv.w){ const v=Lv.g[y][x]; if(v===4||v===5){ let x1=x; while(x1<Lv.w&&Lv.g[y][x1]===v) x1++; Lv.wspans.push({x0:x*T,x1:x1*T,y:y*T,v,top:y===0||Lv.g[y-1][x]!==v}); x=x1; } else x++; } }
  return c; }
/* one prop per few columns where the ground is flat and open */
function regionDecor(Lv,g,lk){ const look=Lv.def.look; const P_=(x,y,w,h,col)=>{ g.fillStyle=col; g.fillRect(Math.round(x),Math.round(y),w,h); };
  const ground=(x,y)=>Lv.g[y][x]===1&&Lv.g[y-1]&&Lv.g[y-1][x]===0&&Lv.g[y-2]&&Lv.g[y-2][x]===0;
  Lv.props=[]; let last=-9;
  for(let x=5;x<Lv.w-5;x++) for(let y=3;y<Lv.h;y++){ if(!ground(x,y)||!ground(x+1,y)||x-last<4) continue; const r=hsh(x*17,y*3); if(r<.6) continue; last=x; const px=x*T, py=y*T;
    if(look==='meadow'){ if(r>.92){ P_(px+4,py-18,7,18,'#55614f'); P_(px+5,py-19,5,1,'#55614f'); P_(px+10,py-16,1,16,'#2b302b'); } else if(r>.84){ P_(px,py-4,9,4,'#f3eee2'); P_(px+8,py-4,3,3,'#55614f'); } else { for(let k=0;k<5;k++) P_(px+k*3,py-ri(8,14),1,14,'#d2bd82'); } }
    else if(look==='fen'){ if(r>.9){ P_(px+6,py-40,3,40,'#0b0d0a'); P_(px-6,py-38,20,2,'#0b0d0a'); for(let k=-5;k<14;k+=2) P_(px+k,py-37,1,ri(6,18),k%3?'#3e5a2c':'#6f8a3a'); } else { for(let k=0;k<6;k++) P_(px+k*2,py-ri(6,14),1,14,k%2?'#3e5a2c':'#2a1c30'); } }
    else if(look==='ashes'){ if(r>.9){ g.strokeStyle='#2a211c'; g.lineWidth=2; for(let k=0;k<4;k++){ g.beginPath(); g.arc(px+k*7,py,14-k,Math.PI,Math.PI*1.45); g.stroke(); } } else if(r>.82){ P_(px,py-2,16,2,'#86a8a0'); P_(px+4,py-2,2,1,'#ebe4d2'); } else { P_(px+2,py-4,5,4,'#ebe4d2'); P_(px+3,py-3,1,1,'#2a211c'); P_(px+5,py-3,1,1,'#2a211c'); P_(px+8,py-1,7,1,'#ebe4d2'); } }
    else if(look==='pass'){ if(r>.9){ P_(px+2,py-14,2,14,'#121418'); P_(px+11,py-14,2,14,'#121418'); P_(px,py-15,16,2,'#121418'); P_(px+5,py-5,5,4,'#b08a4a'); } else { for(let k=0;k<4;k++) P_(px+2+k,py-3-k*3,8-k*2,3,k%2?'#7b848b':'#b8bdc0'); } }
    else if(look==='fort'){ if(r>.88){ P_(px+3,py-10,10,10,'#2c3240'); P_(px+5,py-12,6,2,'#d0782a'); Lv.props.push({k:'brazier',x:px+8,y:py-12}); } else { P_(px,py-6,14,6,'#5a3d27'); P_(px,py-6,14,1,'#7a5636'); P_(px+1,py-7,12,1,'#eceae4'); } }
    else if(look==='villages'){ if(r>.88){ P_(px,py-8,14,8,'#d4b25a'); P_(px,py-8,14,1,'#ebdfc4'); for(let k=0;k<6;k++) P_(px+k*2,py-8,1,8,'#8a6a32'); } else Lv.props.push({k:'folk',x:px+8,y:py,seed:r*97,turn:0}); }
    else if(look==='slums'){ if(r>.86){ P_(px,py-10,12,10,'#5a4636'); P_(px,py-10,12,1,'#8a7a5a'); P_(px+5,py-10,1,10,'#2a1e14'); } else if(r>.8){ P_(px+3,py-12,9,12,'#4a3a28'); P_(px+3,py-9,9,1,'#2a1e14'); P_(px+3,py-4,9,1,'#2a1e14'); } else Lv.props.push({k:'lantern',x:px+8,y:py-30}); }
    else if(look==='oldcity'){ if(r>.85){ P_(px+7,py-34,2,34,'#0e0e12'); Lv.props.push({k:'lamp',x:px+8,y:py-36}); } else { P_(px,py-12,16,12,'#2a3040'); for(let k=0;k<16;k+=4) P_(px+k,py-15,3,4,k%8?'#cfc6b2':'#3e4450'); } }
    else if(look==='royal'){ if(r>.86){ P_(px-4,py-8,26,3,'#5a1420'); P_(px-2,py-5,2,5,'#0a0606'); P_(px+18,py-5,2,5,'#0a0606'); P_(px+2,py-11,5,3,'#6e5420'); P_(px+10,py-11,5,3,'#5a1420'); P_(px+8,py-14,1,6,'#e8d4a0'); Lv.props.push({k:'candle',x:px+8,y:py-15}); } }
    else if(look==='bridge'){ if(r>.84){ P_(px+5,py-24,6,24,'#0e0a0a'); P_(px+3,py-26,10,2,'#0e0a0a'); P_(px+7,py-34,2,8,'#0e0a0a'); P_(px+9,py-38,1,10,'#0e0a0a'); } else { P_(px,py-6,16,6,'#3a3a40'); P_(px,py-6,16,1,'#6e6a68'); } } }
  /* portraits on the walls (old city: his; royal houses: theirs, bleeding) */
  if(lk.portraits){ for(let x=6;x<Lv.w-6;x+=ri(11,17)) for(let y=4;y<Lv.h-2;y++){ if(Lv.g[y][x]!==0||Lv.g[y+1][x]!==0||Lv.g[y+2]&&Lv.g[y+2][x]!==1) continue; Lv.props.push({k:'portrait',x:x*T+8,y:y*T-6,bleed:lk.portraits===2}); break; } }
  if(look==='bridge'&&Lv.exit) Lv.props.push({k:'horse',x:Lv.exit.x*T-60,y:Lv.exit.y*T});
}
(function(){ const o=bakeLevel; bakeLevel=function(Lv,pl){ const lk=lookOf(Lv.def); if(!lk) return o(Lv,pl); Lv.fg=[]; return bakeRegion(Lv,pl,lk); }; })();

/* ---------- living props: watchers, lanterns, portraits ---------- */
function drawRegionProps(){ if(!L||!L.props) return; const lk=lookOf(L.def);
  for(const p of L.props){ const sx=Math.round(p.x-camR.x), sy=Math.round(p.y-camR.y); if(sx<-40||sx>W+40||sy<-60||sy>H+60) continue;
    if(p.k==='folk'){ /* they stop working and watch you pass */ const near=Math.abs(P.x-p.x)<170; p.turn=approach(p.turn,near?1:0,.03); const face=near?(Math.sign(P.x-p.x)||1):(Math.sin(time*.6+p.seed)>0?1:-1);
      const bob=near?0:Math.round(Math.sin(time*3+p.seed)); rect(ctx,sx-3,sy-14+bob,6,9,p.seed%2>1?'#4a2c38':'#1a141c'); rect(ctx,sx-2,sy-5,1,5,'#1a141c'); rect(ctx,sx+1,sy-5,1,5,'#1a141c'); rect(ctx,sx-2,sy-19+bob,5,5,'#ebdfc4');
      if(near){ rect(ctx,sx-1+face,sy-17,1,1,'#1a141c'); rect(ctx,sx+1+face,sy-17,1,1,'#1a141c'); rect(ctx,sx-1+face,sy-15,3,1,'#6a1a22'); } else if(Math.sin(time*1.4+p.seed)>0) rect(ctx,sx+face*3,sy-12+bob,3,1,'#8a6a32'); }
    else if(p.k==='lantern'){ rect(ctx,sx,sy-14,1,14,'#100e0c'); rect(ctx,sx-2,sy,5,6,'#2a1e14'); const fl=.6+.4*Math.sin(time*7+p.x); ectx.fillStyle=`rgba(176,20,26,${(.6+.3*fl).toFixed(2)})`; ectx.fillRect(sx-1,sy+1,3,4); addLight(p.x,p.y+4,70,.9*fl,1,.2,.15); }
    else if(p.k==='lamp'){ rect(ctx,sx-3,sy,7,6,'#0e0e12'); ectx.fillStyle='rgba(224,176,96,.85)'; ectx.fillRect(sx-2,sy+1,5,4); addLight(p.x,p.y+3,90,.9,1,.75,.45); }
    else if(p.k==='brazier'||p.k==='candle'){ const fl=Math.sin(time*13+p.x)*.5+.5; ectx.fillStyle='rgba(255,150,60,.8)'; ectx.fillRect(sx-1,sy-2-Math.round(fl*2),3,3); addLight(p.x,p.y,p.k==='candle'?50:90,.8+fl*.2,1,.6,.3); }
    else if(p.k==='portrait'){ rect(ctx,sx-9,sy-12,18,22,'#b8913a'); rect(ctx,sx-7,sy-10,14,18,'#1a1418'); rect(ctx,sx-4,sy-8,8,9,'#cfc6b2'); rect(ctx,sx-5,sy-9,10,2,p.bleed?'#2a1a14':'#d8c48a'); rect(ctx,sx-6,sy+1,12,7,p.bleed?'#5a1420':'#2a2020');
      const dx=clamp(Math.round((P.x-p.x)/90),-1,1), dy=clamp(Math.round((P.y-20-p.y)/90),-1,1); rect(ctx,sx-2+dx,sy-5+dy,1,1,'#0a0606'); rect(ctx,sx+1+dx,sy-5+dy,1,1,'#0a0606');
      if(p.bleed){ const k=(time*.2+p.x)%1; rect(ctx,sx-2,sy-4,1,Math.round(4+k*10),'#b0141a'); rect(ctx,sx+1,sy-4,1,Math.round(3+((k+.4)%1)*12),'#b0141a'); } }
    else if(p.k==='horse'){ rect(ctx,sx,sy-5,10,4,'#cfc6b2'); rect(ctx,sx+1,sy-1,1,1,'#cfc6b2'); rect(ctx,sx+8,sy-1,1,1,'#cfc6b2'); rect(ctx,sx+8,sy-9,4,4,'#cfc6b2'); rect(ctx,sx+10,sy-8,1,1,'#0e0a0a'); rect(ctx,sx+22,sy-2,7,2,'#e8e0d0'); rect(ctx,sx+30,sy-3,3,3,'#e8e0d0'); } }
  /* the gate of pikes over the bridge's exit */
  if(lk&&lk.pikes&&L.exit){ const ex=L.exit.x*T+8-camR.x, ey=L.exit.y*T-camR.y; for(const [o,s] of [[-14,2],[0,3],[14,2]]){ rect(ctx,Math.round(ex+o),Math.round(ey-118),1,40,'#0e0a0a'); ctx.fillStyle='#0e0a0a'; ctx.beginPath(); ctx.arc(ex+o,ey-120-s,s+1,0,7); ctx.fill(); } } }
(function(){ const o=drawHazards; drawHazards=function(){ o(); drawRegionProps(); }; })();

/* ---------- weather, in front of the world ---------- */
const WX=[...Array(160)].map((_,i)=>({x:Math.random()*W,y:Math.random()*H,z:.3+Math.random()*.7,s:Math.random()*10}));
function drawRegionWeather(){ const lk=lookOf(L&&L.def); if(!lk) return; const wx=lk.weather;
  for(const m of WX){ let x,y,col=null,w=1,h=1;
    if(wx==='snow'){ x=((m.x-camR.x*m.z*.6+Math.sin(time*.8+m.s)*10+time*12*m.z)%W+W)%W; y=((m.y+time*28*m.z-camR.y*m.z*.6)%H+H)%H; col=`rgba(236,234,228,${(.35+m.z*.5).toFixed(2)})`; w=h=m.z>.8?2:1; }
    else if(wx==='sand'){ const k=storm(); x=((m.x-camR.x*m.z*.7+time*(60+k*260)*m.z)%W+W)%W; y=((m.y+Math.sin(time*3+m.s)*5-camR.y*m.z*.5)%H+H)%H; col=`rgba(216,205,176,${(.15+m.z*.25+k*.3).toFixed(2)})`; w=m.z>.6?3:2; }
    else if(wx==='mist'){ if(m.s>4) continue; x=((m.x-camR.x*m.z*.5+time*14*m.z)%W+W)%W; y=((m.y+Math.sin(time*.5+m.s)*4-camR.y*m.z*.3)%H+H)%H; col=`rgba(243,238,226,${(.08+m.z*.12).toFixed(2)})`; w=6; }
    else if(wx==='marsh'){ if(m.s>6) continue; x=((m.x-camR.x*m.z*.5+Math.sin(time*.3+m.s)*20)%W+W)%W; y=((m.y+Math.sin(time*.7+m.s)*8-camR.y*m.z*.3)%H+H)%H; if(m.s<.5){ col=`rgba(169,180,108,${(.4+.4*Math.sin(time*2+m.s*9)).toFixed(2)})`; } else { col='rgba(62,90,44,.12)'; w=8; h=2; } }
    else if(wx==='chaff'){ if(m.s>5) continue; x=((m.x-camR.x*m.z*.6+time*10*m.z)%W+W)%W; y=((m.y+time*6*m.z+Math.sin(time*2+m.s)*4-camR.y*m.z*.4)%H+H)%H; col=`rgba(226,166,92,${(.2+m.z*.3).toFixed(2)})`; }
    else if(wx==='drip'){ if(m.s>3) continue; x=((m.x-camR.x*m.z*.6)%W+W)%W; y=((m.y+time*120*m.z-camR.y*m.z*.6)%H+H)%H; col='rgba(168,162,148,.35)'; h=3; }
    else if(wx==='motes'){ if(m.s>4) continue; x=((m.x-camR.x*m.z*.4+Math.sin(time*.2+m.s)*12)%W+W)%W; y=((m.y+Math.sin(time*.3+m.s)*10-camR.y*m.z*.3)%H+H)%H; col=`rgba(232,212,160,${(.06+m.z*.12).toFixed(2)})`; }
    else if(wx==='embers'){ if(m.s>5) continue; x=((m.x-camR.x*m.z*.6+Math.sin(time+m.s)*8)%W+W)%W; y=((m.y-time*22*m.z-camR.y*m.z*.4)%H+H)%H; col=`rgba(255,${100+((m.s*20)|0)},50,${(.2+m.z*.3).toFixed(2)})`; }
    if(col){ ctx.fillStyle=col; ctx.fillRect(Math.round(x),Math.round(y),w,h); } }
  /* fog banks hide the drops */
  if(lk.fogBanks){ for(let i=0;i<3;i++){ const fy=(L.h-1-i*4.5)*T-camR.y; if(fy<-40||fy>H+60) continue; const a=.55-i*.12;
      for(let x=0;x<W;x+=2){ const yy=fy-18-8*Math.sin((x+camR.x*.9)/37+time*.4+i); ctx.fillStyle=`rgba(184,189,192,${a.toFixed(2)})`; ctx.fillRect(x,Math.round(yy),2,Math.max(0,Math.round(H-yy))); } } }
  if(wx==='sand'){ const k=storm(); if(k>0){ ctx.fillStyle=`rgba(216,205,176,${(k*.55).toFixed(2)})`; ctx.fillRect(0,0,W,H); } } }
(function(){ const o=render; render=function(){ o(); if(L&&lookOf(L.def)) drawRegionWeather(); }; })();
(function(){ const o=drawWeather; drawWeather=function(){ if(L&&lookOf(L.def)) return; o(); }; })();

/* ---------- region mechanics ---------- */
let RG={storm:0,stormT:18,rockT:9,grabT:4,bellT:20,rocks:[]};
function storm(){ return RG.storm; }
(function(){ const o=loadLevel; loadLevel=function(idx,opt){ const r=o(idx,opt); RG={storm:0,stormT:rnd(14,22),rockT:rnd(6,10),grabT:rnd(2,4),bellT:rnd(14,26),rocks:[]}; return r; }; })();
function updRegion(dt){ const lk=lookOf(L&&L.def); if(!lk||mode!=='play') return; const look=L.def.look;
  if(look==='ashes'){ RG.stormT-=dt; if(RG.stormT<=0&&RG.storm<=0){ RG.stormOn=rnd(5,8); RG.stormT=rnd(20,30); toast('A sandstorm comes in off the salt.'); AU.wind&&AU.wind(); }
    if(RG.stormOn>0){ RG.stormOn-=dt; RG.storm=approach(RG.storm,1,dt*.8); if(!P.dead&&!P.onGround) P.vx+=40*dt; } else RG.storm=approach(RG.storm,0,dt*.5); }
  if(look==='pass'&&L.def.kind!=='boss'){ RG.rockT-=dt; if(RG.rockT<=0&&!P.dead){ RG.rockT=rnd(5,9); const x=P.x+P.vx*.6+rnd(-30,30); RG.rocks.push({x,y:camR.y-20,vy:0,t:0,warn:.9,gy:findFloor(x,P.y-40)}); } }
  for(const r of RG.rocks){ r.t+=dt; if(r.t<r.warn) continue; r.vy+=900*dt; r.y+=r.vy*dt;
    if(!r.hit&&Math.abs(P.x-r.x)<9&&r.y>P.y-P.h&&r.y<P.y+4){ r.hit=1; hurtPlayer(10+diff()*3,{x:r.x,hp:0,dead:true}); }
    if(r.y>=r.gy){ r.done=1; dust(r.x,r.gy,8); AU.slam(); shake(Math.abs(P.x-r.x)<120?3:1); } }
  RG.rocks=RG.rocks.filter(r=>!r.done&&r.t<6);
  if(look==='fen'&&!P.dead&&P.dash<=0){ const inW=tileAt(Math.floor(P.x/T),Math.floor((P.y-4)/T))===4; if(inW){ RG.grabT-=dt; if(RG.grabT<=0){ RG.grabT=rnd(3,5.5); RG.grab={x:P.x,t:0}; P.vx*=.2; P.grabbed=.7; hurtPlayer(5+diff()*2,{x:P.x,hp:0,dead:true}); AU.noise(.3,300,900,2,.3,'bandpass',.3); toast('Something under the water has your ankle. Roll free.'); } } }
  if(P.grabbed>0){ P.grabbed-=dt; if(P.dash>0) P.grabbed=0; else P.vx*=.5; }
  if(RG.grab){ RG.grab.t+=dt; if(RG.grab.t>.9) RG.grab=null; }
  if(look==='villages'||look==='oldcity'){ RG.bellT-=dt; if(RG.bellT<=0){ RG.bellT=rnd(18,34); if(AU.bell) AU.bell(); else AU.tone('sine',330,330,2,.06,1.6); } } }
(function(){ const o=update; update=function(dt){ o(dt); if(L) updRegion(dt); }; })();
function drawRegionHaz(){ for(const r of RG.rocks){ const sx=r.x-camR.x; if(r.t<r.warn){ const a=.25+.35*Math.abs(Math.sin(r.t*14)); ectx.fillStyle=`rgba(20,20,24,${a.toFixed(2)})`; ectx.fillRect(Math.round(sx-6),Math.round(r.gy-camR.y-1),12,2); }
    else { rect(ctx,Math.round(sx-4),Math.round(r.y-camR.y-8),8,8,'#2a2e34'); rect(ctx,Math.round(sx-4),Math.round(r.y-camR.y-8),8,1,'#7b848b'); } }
  if(RG.grab){ const sx=RG.grab.x-camR.x, sy=P.y-camR.y, k=Math.min(1,RG.grab.t*5)*(1-Math.max(0,(RG.grab.t-.6)/.3)); rect(ctx,Math.round(sx-1),Math.round(sy-10*k),2,Math.round(10*k),'#a9b46c'); for(let f=-2;f<=2;f++) rect(ctx,Math.round(sx+f*1.5),Math.round(sy-10*k-3),1,3,'#a9b46c'); } }
(function(){ const o=drawHazards; drawHazards=function(){ o(); drawRegionHaz(); }; })();

/* ---------- background events ---------- */
(function(){ const o=spawnBG; spawnBG=function(type){ const N=['riders','wound','wisps','vultures','sandstorm','rockfall','bells'];
  if(!N.includes(type)) return o(type); const e={type,t:0,dur:6,x:rnd(60,W-60),y:rnd(40,140)};
  if(type==='riders'){ e.dur=rnd(7,10); e.dir=R()<.5?1:-1; e.n=ri(2,4); e.y=rnd(150,175); }
  else if(type==='vultures'){ e.dur=rnd(8,12); e.n=ri(2,4); e.cx=rnd(80,W-80); e.cy=rnd(30,70); }
  else if(type==='wisps'){ e.dur=rnd(5,8); e.n=ri(2,4); e.y=rnd(120,170); }
  else if(type==='bells'){ e.dur=.1; if(AU.bell) AU.bell(); }
  else if(type==='rockfall'){ e.dur=1.6; e.x=rnd(40,W-40); }
  else if(type==='wound'){ e.dur=2.4; }
  else if(type==='sandstorm'){ e.dur=.1; RG.stormT=Math.min(RG.stormT,1); }
  bgev.push(e); }; })();
(function(){ const o=drawBGEvents; drawBGEvents=function(){ o(); for(const e of bgev){ const k=e.t/e.dur;
  if(e.type==='riders'){ for(let i=0;i<e.n;i++){ const x=(e.dir>0?-40:W+40)+e.dir*(W+80)*k+i*-e.dir*18, y=e.y+Math.sin(time*16+i)*1; ctx.fillStyle='rgba(26,26,30,.55)'; ctx.fillRect(Math.round(x),Math.round(y),9,4); ctx.fillRect(Math.round(x+(e.dir>0?7:-1)),Math.round(y-3),3,3); ctx.fillRect(Math.round(x+3),Math.round(y-6),3,4); ctx.fillRect(Math.round(x+1),Math.round(y+4),1,3); ctx.fillRect(Math.round(x+7),Math.round(y+4),1,3); } }
  else if(e.type==='vultures'){ for(let i=0;i<e.n;i++){ const a=time*.6+i*2.1, x=e.cx+Math.cos(a)*40, y=e.cy+Math.sin(a)*12; ctx.fillStyle='rgba(42,33,28,.7)'; ctx.fillRect(Math.round(x-3),Math.round(y),3,1); ctx.fillRect(Math.round(x+1),Math.round(y),3,1); ctx.fillRect(Math.round(x),Math.round(y+1),1,1); } }
  else if(e.type==='wisps'){ for(let i=0;i<e.n;i++){ const x=e.x+i*30+Math.sin(time*.7+i)*20, y=e.y+Math.sin(time+i*2)*6; const a=Math.sin(k*Math.PI); ectx.fillStyle=`rgba(169,200,108,${(.5*a).toFixed(2)})`; ectx.fillRect(Math.round(x),Math.round(y),2,2); } }
  else if(e.type==='rockfall'){ ctx.fillStyle='rgba(42,46,52,.6)'; for(let i=0;i<5;i++) ctx.fillRect(Math.round(e.x+i*3-6),Math.round(30+k*170+i*7),2,2); }
  /* 'wound' is quiet now: the red band across the top of the screen read as a flicker (BT, v24 notes) */ } }; })();

/* ---------- sound: each region's ambience bed ---------- */
if(typeof AMB!=='undefined'){ const o=AMB.envNow.bind(AMB); AMB.envNow=function(){ const lk=typeof L!=='undefined'&&L&&L.def&&L.def.look; if(!lk) return o();
  return {meadow:'ash',fen:'water',ashes:'ash',pass:'ash',fort:'war',villages:'war',slums:'debt',oldcity:'debt',royal:'bone',bridge:'war'}[lk]||o(); }; }

/* ---------- the generator's stock foes, translated per region ----------
   Shafts, relic guards and wall ambushes call for wraiths, brutes and the Wall-Born; on the March and in the city
   those become the local equivalent. The Gilded Debtor stays (a fortune on legs is a fortune anywhere). */
const REMAP={
  meadow:{wraith:'crow',witch:'crow',swarm:'crow',brute:'rider',knight:'rider',lurker:'scarecrow',hanged:'scarecrow'},
  fen:{wraith:'lantern',witch:'lantern',swarm:'lantern',brute:'drowner',knight:'drowner',lurker:'drowner',hanged:'drowner'},
  ashes:{wraith:'saltwraith',witch:'saltwraith',swarm:'vulture',brute:'buried',knight:'rider',lurker:'buried',hanged:'buried'},
  pass:{wraith:'harpy',witch:'harpy',swarm:'harpy',brute:'footman',knight:'footman',lurker:'hermit',hanged:'hermit'},
  fort:{wraith:'archer',witch:'archer',swarm:'archer',brute:'footman',knight:'footman',lurker:'pikeman',hanged:'pikeman'},
  villages:{wraith:'engineer',witch:'engineer',swarm:'villager',brute:'footman',knight:'footman',lurker:'villager',hanged:'villager'},
  slums:{wraith:'rat',witch:'plague',swarm:'rat',brute:'guard',knight:'taker',lurker:'cutpurse',hanged:'beggar'},
  oldcity:{wraith:'gargoyle',witch:'gargoyle',swarm:'gargoyle',brute:'handknight',knight:'handknight',lurker:'cutpurse',hanged:'bellman'},
  royal:{wraith:'puppet',witch:'puppet',swarm:'puppet',brute:'handknight',knight:'handknight',lurker:'servant',hanged:'puppet'},
  bridge:{wraith:'archer',witch:'archer',swarm:'archer',brute:'handknight',knight:'handknight',lurker:'guard',hanged:'guard'}};
(function(){ const o=genLevel; genLevel=function(def,seed){ const Lv=o(def,seed); const m=def.look&&REMAP[def.look]; if(m&&Lv.spawns) for(const s of Lv.spawns){ if(m[s.t]){ s.t=m[s.t]; delete s.hang; delete s.ceil; } } return Lv; }; })();
(function(){ const o=mkEnemy; mkEnemy=function(s){ const m=L&&L.def&&L.def.look&&REMAP[L.def.look]; if(m&&m[s.t]){ s=Object.assign({},s,{t:m[s.t]}); delete s.hang; delete s.ceil; } return o(s); }; })();
