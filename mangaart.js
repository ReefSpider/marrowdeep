'use strict';
/* ===== manga art (v19): the in-engine drawings behind each panel =====
   Drawn in greys and one red, at the panel's own size; the ink filter (manga.js) turns greys into screentone, edges into
   ink lines and keeps the red. Faces stay in shadow and figures are mostly silhouettes against light: that is where
   manga gets its weight, and it is what code can draw well. A Higgsfield still with the same panel id replaces any of these. */
const RD='#c0181c';
function A(g,w,h){ const s=Math.min(w,h);
  const o={g,w,h,s,X:u=>u*w,Y:v=>v*h,
    fill(c){ g.fillStyle=c; g.fillRect(0,0,w,h); },
    vgrad(c0,c1,y0,y1){ const gr=g.createLinearGradient(0,(y0||0)*h,0,(y1==null?1:y1)*h); gr.addColorStop(0,c0); gr.addColorStop(1,c1); g.fillStyle=gr; g.fillRect(0,0,w,h); },
    glow(x,y,r,c,a){ const gr=g.createRadialGradient(x*w,y*h,0,x*w,y*h,r*s); gr.addColorStop(0,c); gr.addColorStop(1,a||'rgba(0,0,0,0)'); g.fillStyle=gr; g.fillRect(0,0,w,h); },
    poly(pts,c){ g.fillStyle=c; g.beginPath(); pts.forEach(([x,y],i)=>i?g.lineTo(x*w,y*h):g.moveTo(x*w,y*h)); g.closePath(); g.fill(); },
    rect(x,y,ww,hh,c){ g.fillStyle=c; g.fillRect(x*w,y*h,ww*w,hh*h); },
    circ(x,y,r,c){ g.fillStyle=c; g.beginPath(); g.arc(x*w,y*h,r*s,0,Math.PI*2); g.fill(); },
    ell(x,y,rx,ry,c,rot){ g.fillStyle=c; g.beginPath(); g.ellipse(x*w,y*h,rx*s,ry*s,rot||0,0,Math.PI*2); g.fill(); },
    line(pts,c,lw){ g.strokeStyle=c; g.lineWidth=(lw||.006)*s; g.lineCap='round'; g.beginPath(); pts.forEach(([x,y],i)=>i?g.lineTo(x*w,y*h):g.moveTo(x*w,y*h)); g.stroke(); },
    flame(x,y,sz,lit){ o.glow(x,y-sz*.4,sz*3,`rgba(255,250,235,${lit==null?.6:lit})`); const tear=(k,c)=>{ g.fillStyle=c; g.beginPath(); g.moveTo(x*w,(y-sz*1.5*k)*h); g.quadraticCurveTo((x+sz*.5*k*h/w)*w,(y-sz*.35*k)*h,x*w,y*h+sz*.05*h); g.quadraticCurveTo((x-sz*.5*k*h/w)*w,(y-sz*.35*k)*h,x*w,(y-sz*1.5*k)*h); g.fill(); };
      tear(1.12,'#141012'); tear(1,'#fffdf6'); tear(.42,'#8a827a'); },
    candle(x,y,hgt,wd,lit){ o.rect(x-wd/2-.004,y-hgt-.004,wd+.008,hgt+.004,'#141012'); o.rect(x-wd/2,y-hgt,wd,hgt,'#e4ded2'); o.rect(x-wd/2,y-hgt,wd*.28,hgt,'#a8a090'); o.poly([[x+wd*.1,y-hgt],[x+wd*.3,y-hgt+hgt*.5],[x+wd*.42,y-hgt]],'#f4f0e8'); o.line([[x,y-hgt],[x,y-hgt-.022]],'#141012',.005); if(lit!==false) o.flame(x,y-hgt-.018,.06); },
    rays(x,y,n,len,c,spread){ for(let i=0;i<n;i++){ const a=-Math.PI/2+(i/(n-1)-.5)*(spread||2.4); o.poly([[x,y],[x+Math.cos(a-.03)*len,y+Math.sin(a-.03)*len*w/h],[x+Math.cos(a+.03)*len,y+Math.sin(a+.03)*len*w/h]],c); } },
    rubble(y0,n,c){ for(let i=0;i<n;i++){ const x=R(), yy=y0+R()*(1-y0), r=.01+R()*.03; o.poly([[x-r,yy],[x,yy-r*1.4],[x+r,yy],[x+r*.4,yy+r*.6]],c); } }
  }; return o; }
/* ---------- the game's own sprites in a panel ----------
   Figures are drawn with the same functions the game draws them with (the hero in your current gear, the bosses, the Host),
   scaled up on the pixel grid, with the game's ink outline. sil: a flat silhouette colour (backlit); outline: its colour. */
function ilseSprite(c,o){ o=o||{}; const R_=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
  R_(-5,-3,10,3,'#3a1e2a'); R_(-4,-20,8,18,'#4a2a36'); R_(-4,-20,2,18,'#3a1e2a'); R_(-5,-21,10,4,'#5a3a44'); R_(2,-17,2,7,'#d8c0a0'); R_(3,-11,2,1,'#d8c0a0');
  R_(-2,-27,5,6,'#d8c0a0'); R_(-3,-28,7,2,'#2a1a14'); R_(-4,-27,2,12,'#2a1a14'); R_(-3,-26,1,4,'#2a1a14'); R_(1,-25,1,1,'#2a1a14'); R_(1,-22,2,1,'#b89880');
  if(o.candle!==false){ R_(4,-15,2,4,'#e8e0d0'); R_(4.5,-17,1,2,'#fff6d0'); } }
let HERO_POSE={a:1.25};
function heroSprite(c){ if(!P){ return; } const sv={a:P.attack,d:P.dash,h:P.hurtT,t:P.teth,i:P.iai,vx:P.vx,vy:P.vy,g:P.onGround,w:P.wallT,dd:P.dead,sa:P.swordA,ho:P.houndT,gh:P.ghostT};
  Object.assign(P,{attack:null,dash:0,hurtT:0,teth:null,iai:null,vx:0,vy:0,onGround:true,wallT:0,dead:false,swordA:HERO_POSE.a,houndT:0,ghostT:0});
  try{ drawHero(c); } catch(e){} finally{ Object.assign(P,{attack:sv.a,dash:sv.d,hurtT:sv.h,teth:sv.t,iai:sv.i,vx:sv.vx,vy:sv.vy,onGround:sv.g,wallT:sv.w,dead:sv.dd,swordA:sv.sa,houndT:sv.ho,ghostT:sv.gh}); } }
function bossSprite(kind){ const B=BOSSES[kind]; const e={anim:1.3,phase:1,state:'idle',st:0,face:1,vx:0,vy:0,w:B.w,h:B.h,pat:null,alpha:1,hp:1,maxhp:1,kind,shield:0,flash:0,dead:false,deadT:0,intro:false,fly:!!B.fly,x:0,y:0};
  const fn={mother:drawMother,choir:drawChoir,tithe:drawTithe,saint:drawSaint,count:drawCount}[kind]; return c=>{ try{ fn(c,e); }catch(err){} }; }
function enemySprite(type){ const e={type,walk:1,state:'chase',st:0,seed:2,champ:0,face:1,vx:0,vy:0,anim:1,w:EDEF[type].w,h:EDEF[type].h}; return c=>{ try{ EDRAW[type](c,e); }catch(err){} }; }
const SPR={sellsword:{fn:heroSprite,h:34,box:70},girl:{fn:ilseSprite,h:28,box:40},hag:{fn:bossSprite('mother'),h:96,box:150},count:{fn:bossSprite('count'),h:40,box:90},saint:{fn:bossSprite('saint'),h:84,box:150}};
function spriteTo(g,fn,x,y,k,face,o){ o=o||{}; const box=o.box||70, S=Math.ceil(box*k*1.6), oy=Math.round(S*.82);
  const c=document.createElement('canvas'); c.width=c.height=S; const sc=c.getContext('2d'); sc.imageSmoothingEnabled=false; sc.translate(Math.round(S/2),oy); sc.scale(k*face,k); if(o.rot) sc.rotate(o.rot); fn(sc);
  if(o.sil){ sc.setTransform(1,0,0,1,0,0); sc.globalCompositeOperation='source-in'; sc.fillStyle=o.sil; sc.fillRect(0,0,S,S); }
  const ol=document.createElement('canvas'); ol.width=ol.height=S; const oc=ol.getContext('2d'); oc.drawImage(c,0,0); oc.globalCompositeOperation='source-in'; oc.fillStyle=o.outline||'#0c0a0a'; oc.fillRect(0,0,S,S);
  const d=Math.max(1,Math.round(k*(o.outline?.9:.5))), X=Math.round(x-S/2), Yy=Math.round(y-oy); g.imageSmoothingEnabled=false;
  for(const [dx,dy] of [[-d,0],[d,0],[0,-d],[0,d]]) g.drawImage(ol,X+dx,Yy+dy); g.drawImage(c,X,Yy); }
/* figure(a, x, y, hh, kind, opt): feet at (x,y) in panel fractions, height hh of the panel. opt.c set → backlit silhouette in
   that colour; opt.col → the sprite's own colours; opt.rim → an outline in that colour. */
function figure(a,x,y,hh,kind,opt){ opt=opt||{}; const sp=SPR[kind]; if(!sp) return; const k=Math.max(.5,Math.round(hh*a.h/sp.h*2)/2);
  spriteTo(a.g,sp.fn,x*a.w,y*a.h,k,opt.face||1,{box:sp.box,sil:opt.col?null:(opt.c||'#0c0a0a'),outline:opt.rim||null,rot:opt.rot}); }
const MART={
  /* the wall at night, the Host below, fires */
  wall_siege(g,w,h,v){ const a=A(g,w,h); a.vgrad('#9a948e','#d8d2c8',0,.45); a.circ(.8,.17,.065,'#fbf8f0'); a.glow(.8,.17,.25,'rgba(255,255,250,.5)');
    a.poly([[0,.5],[1,.44],[1,.62],[0,.66]],'#141012'); for(let x=0;x<1.02;x+=.055) a.rect(x,.43-x*.06,.03,.08,'#141012'); a.rect(0,.6,1,.4,'#7a7472');
    for(let i=0;i<6;i++){ const fx=.06+i*.18+R()*.04, fy=.45-fx*.06; a.glow(fx,fy,.07,'rgba(255,250,240,.85)'); a.poly([[fx-.012,fy],[fx,fy-.05],[fx+.012,fy]],'#fffdf6'); a.line([[fx,fy],[fx+.02,fy-.2]],'rgba(60,56,56,.5)',.03); }
    const hk=enemySprite('husk'); for(let r=0;r<3;r++){ const k=Math.max(.5,Math.round((.1+r*.035)*h/24*2)/2), n=Math.ceil(w/(k*16)); for(let i=0;i<=n;i++){ const x=(i+(r%2)*.5)/n, y=.8+r*.09; spriteTo(g,hk,x*w,y*h,k,-1,{box:40,sil:r<2?'#2a2426':null}); } }
    if(v!=='nored') a.glow(.5,.62,.6,'rgba(190,20,24,.28)'); },
  /* Ilse's window: a candle, her silhouette, rooftops */
  window_candle(g,w,h,v){ const a=A(g,w,h); a.fill('#141012'); a.rect(.18,.08,.64,.84,'#4a4446'); const sky=v==='red'?'#7a3436':'#6a6466'; a.rect(.22,.12,.56,.5,sky); a.glow(.5,.35,.4,'rgba(200,196,190,.5)');
    for(let i=0;i<7;i++){ const x=.22+i*.08; a.poly([[x,.62],[x+.04,.5-R()*.06],[x+.08,.62]],'#2a2628'); }
    a.rect(.49,.12,.02,.5,'#141012'); a.rect(.22,.36,.56,.02,'#141012'); a.rect(.18,.62,.64,.06,'#2a2428');
    const lo=v==='low'; a.candle(.5,.62,lo?.03:.11,.05,true);
    figure(a,.36,.98,.42,'girl',{col:1,face:1}); a.glow(.5,.5,.18,'rgba(255,248,230,.35)'); if(v==='red') a.glow(.5,.1,.5,'rgba(190,20,24,.35)'); },
  /* close on a candle stub */
  candle_close(g,w,h,v){ const a=A(g,w,h); a.fill('#0e0b0c'); const lit=v!=='unlit'&&v!=='out'; a.rect(.38,.45,.24,.55,'#ccc6b8'); a.rect(.38,.45,.06,.55,'#8a8478'); a.ell(.5,.45,.12,.025,'#e4dece');
    for(let i=0;i<3;i++) a.poly([[.4+i*.08,.45],[.42+i*.08,.6+R()*.15],[.44+i*.08,.45]],'#ddd7c8'); a.line([[.5,.45],[.5,.38]],'#1a1414',.012);
    if(lit) { a.glow(.5,.25,.6,'rgba(255,250,235,.85)'); a.ell(.5,.25,.06,.14,'#fffdf6'); a.ell(.5,.31,.025,.05,'#c8c0b0'); }
    else if(v==='out'){ for(let i=0;i<6;i++) a.ell(.5+Math.sin(i*1.3)*.04,.32-i*.05,.03,.02,`rgba(200,196,190,${.5-i*.07})`); }
    if(v==='blood') a.poly([[.36,.6],[.4,.58],[.42,.75],[.38,.8]],RD); },
  /* two hands, a candle passed between them */
  hands_candle(g,w,h,v){ const a=A(g,w,h); a.vgrad('#5a5456','#2a2426'); a.glow(.52,.42,.32,'rgba(250,244,230,.6)');
    a.poly([[0,.8],[.3,.66],[.44,.6],[.49,.66],[.4,.74],[0,1]],'#0c0a0a'); a.line([[0,.8],[.3,.66],[.44,.6]],'#d8d2c6',.006); for(let i=0;i<3;i++) a.rect(.1+i*.08,.7-i*.02,.05,.02,'#2a2426');
    a.poly([[1,.72],[.68,.62],[.56,.6],[.54,.66],[.64,.73],[1,.88]],'#e4ddd0'); a.line([[1,.72],[.68,.62],[.56,.6],[.54,.66],[.64,.73],[1,.88]],'#141012',.007);
    for(let i=0;i<4;i++) a.line([[.57+i*.025,.6],[.58+i*.027,.565]],'#141012',.006);
    a.candle(.5,.62,.16,.055,true); if(v==='two') a.candle(.64,.6,.12,.045,true); },
  /* a crow on the sill with a letter */
  crow(g,w,h,v){ const a=A(g,w,h); a.vgrad('#5a5456','#1e1a1c'); a.circ(.8,.2,.08,'#e8e4dc'); a.rect(0,.72,1,.28,'#2a2426');
    a.ell(.45,.55,.14,.1,'#0c0a0a',-.3); a.ell(.58,.42,.07,.065,'#0c0a0a'); a.poly([[.63,.42],[.75,.45],[.63,.47]],'#1a1616'); a.circ(.6,.405,.008,'#f0ece4');
    a.poly([[.33,.58],[.12,.7],[.36,.66]],'#0c0a0a'); a.line([[.44,.64],[.42,.73]],'#0c0a0a',.008); a.line([[.5,.64],[.52,.73]],'#0c0a0a',.008);
    a.rect(.47,.66,.08,.03,'#e8e2d4'); a.circ(.51,.675,.012,RD); },
  /* a rolled letter, a red seal */
  crow_letter(g,w,h,v){ const a=A(g,w,h); a.fill('#2a2426'); a.poly([[.08,.2],[.92,.14],[.95,.82],[.06,.88]],'#e6decc'); for(let i=0;i<9;i++) a.line([[.14,.28+i*.06],[.86-R()*.15,.26+i*.06]],'#8a8276',.004);
    a.circ(.8,.78,.06,RD); a.circ(.8,.78,.035,'#8a1014'); a.line([[.02,.95],[.3,.6]],'#0c0a0a',.02); a.ell(.25,.6,.1,.04,'#0c0a0a',-.6); },
  /* the Count raises his crown, the Wound opens */
  count_crown(g,w,h,v){ const a=A(g,w,h); a.vgrad('#c8c2b8','#4a4446'); a.ell(.5,.16,.36,.075,'#0c0a0a'); a.ell(.5,.16,.31,.045,RD); a.ell(.5,.16,.06,.04,'#0c0a0a'); a.rays(.5,.16,11,.5,'rgba(190,20,24,.28)',2.2);
    figure(a,.5,1.02,.78,'count',{col:1,rim:'#f4f0e8'}); },
  wound_eye(g,w,h,v){ const a=A(g,w,h); a.vgrad('#2a0e10','#0a0606'); a.ell(.5,.45,.55,.18,'#0a0606'); a.ell(.5,.45,.5,.12,RD); a.ell(.5,.45,.08,.11,'#0a0606'); a.ell(.47,.42,.015,.02,'#f4f0e8');
    for(let i=0;i<14;i++){ const x=R(); a.line([[x,.1+R()*.2],[x+(R()-.5)*.1,.3]],'#120808',.004); }
    if(v==='ash') for(let i=0;i<80;i++) a.circ(R(),R(),.004+R()*.004,'#a8a098'); else for(let i=0;i<20;i++) figure(a,R(),.9+R()*.1,.06,'sellsword',{c:'#060404'}); },
  /* the fall */
  fall(g,w,h,v){ const a=A(g,w,h); a.vgrad('#e8e4dc','#2a2426'); a.rubble(.0,40,'#3a3436'); figure(a,.5,.66,.36,'sellsword',{col:1,rot:.5}); a.circ(.62,.4,.012,'#fffdf6'); a.glow(.62,.4,.05,'rgba(255,250,235,.8)'); },
  /* a hand among the bones, the candle */
  bones_wake(g,w,h,v){ const a=A(g,w,h); a.fill('#1a1618'); for(let i=0;i<26;i++){ const x=R(), y=.5+R()*.5; a.ell(x,y,.05,.04,'#b8b2a6'); a.ell(x-.015,y,.01,.012,'#1a1618'); a.ell(x+.015,y,.01,.012,'#1a1618'); }
    for(let i=0;i<14;i++){ const x=R(), y=.55+R()*.4, l=.08+R()*.08, ag=R()*3; a.line([[x,y],[x+Math.cos(ag)*l,y+Math.sin(ag)*l*.5]],'#a8a296',.012); }
    a.poly([[.3,1],[.4,.68],[.48,.62],[.56,.66],[.52,.72],[.44,.74],[.38,1]],'#3a3234'); for(let i=0;i<4;i++) a.line([[.48+i*.02,.64],[.5+i*.025,.56]],'#3a3234',.016);
    a.candle(.62,.78,.06,.03,false); a.glow(.6,.3,.5,'rgba(120,116,110,.4)'); },
  /* the hero from behind, looking up a shaft */
  sellsword_back(g,w,h,v){ const a=A(g,w,h); HERO_POSE.a=v==='ghost'?1.25:-2.45; a.fill('#141012'); a.poly([[.3,0],[.7,0],[.62,1],[.38,1]],'#5a5456'); a.glow(.5,0,.5,'rgba(240,236,228,.85)');
    for(let i=0;i<5;i++) a.rect(.36+R()*.26,.15+i*.16,.08,.012,'#2a2628'); figure(a,.5,1.0,.5,'sellsword',v==='ghost'?{c:'#8a847e',rim:'#141012'}:{col:1}); if(v==='ghost') for(let i=0;i<60;i++) a.circ(.3+R()*.4,R(),.003+R()*.004,'#3a3436'); if(v==='red') a.glow(.5,0,.4,'rgba(190,20,24,.4)'); },
  /* eyes in shadow, one red glint */
  sellsword_eyes(g,w,h,v){ const a=A(g,w,h); a.vgrad('#cfc9bf','#8a847e',.2,.9); a.rect(0,0,1,.2,'#141012');
    for(let i=0;i<14;i++){ const x=-.05+i*.08; a.poly([[x-.05,0],[x+.04,.38+((i*37)%7)/60],[x+.09,0]],'#141012'); }
    a.poly([[0,.2],[1,.2],[1,.34],[0,.3]],'#141012'); a.vgrad('rgba(0,0,0,0)','rgba(0,0,0,0)');
    for(const [ex,f] of [[.3,-1],[.7,1]]){ a.poly([[ex-.12,.6],[ex-.02,.555],[ex+.11,.575],[ex+.05,.63],[ex-.08,.635]],'#f6f2ea'); a.line([[ex-.13,.61],[ex-.02,.55],[ex+.12,.57]],'#141012',.016);
      a.circ(ex+f*-.005,.595,.032,'#141012'); a.circ(ex+.012,.585,.009,'#fbf8f0'); a.line([[ex-.12,.5],[ex+.12,.49+f*.02]],'#141012',.014); }
    if(v!=='calm') a.circ(.705,.6,.011,RD); a.rect(0,.78,1,.22,'#141012'); a.poly([[.48,.64],[.5,.74],[.46,.75]],'#6a645e'); if(v==='tear') a.line([[.69,.64],[.68,.77]],'#fbf8f0',.007); },
  /* Agathe, hooded, with a bundle */
  agathe(g,w,h,v){ const a=A(g,w,h); a.vgrad('#e8e2d8','#8a847e'); a.glow(.5,.4,.5,'rgba(255,252,246,.9)'); figure(a,.5,1.0,.9,'hag',{col:1,rim:'#ece6d8'}); if(v==='tear') a.line([[.54,.52],[.545,.6]],'#ece6d8',.004); },
  /* the cradle, small lights rising */
  cradle(g,w,h,v){ const a=A(g,w,h); a.fill('#121012'); a.ell(.5,.82,.36,.12,'#3a3234'); a.poly([[.16,.8],[.84,.8],[.78,.95],[.22,.95]],'#2a2224'); a.line([[.2,.98],[.5,.9],[.8,.98]],'#4a4244',.02);
    for(let i=0;i<8;i++) a.ell(.3+i*.06,.76,.03,.02,'#d8d2c4'); const rise=v==='rise';
    for(let i=0;i<(rise?16:5);i++){ const x=.25+R()*.5, y=rise?.1+R()*.6:.72+R()*.05; a.glow(x,y,.05,'rgba(255,252,240,.9)'); a.circ(x,y,.008,'#fffdf6'); } },
  /* the chapel bell under black water */
  bell(g,w,h,v){ const a=A(g,w,h); a.vgrad('#3a3a40','#060608'); for(let i=0;i<6;i++) a.line([[.5,0],[.5+(i-2.5)*.02,.25]],'#1a1a1e',.006);
    a.poly([[.36,.7],[.4,.32],[.5,.25],[.6,.32],[.64,.7],[.7,.76],[.3,.76]],'#2a2a2e'); a.poly([[.4,.32],[.44,.3],[.42,.7],[.36,.7]],'#4a4a50'); a.circ(.5,.8,.04,'#2a2a2e');
    for(let i=0;i<30;i++) a.circ(R(),R(),.003+R()*.006,'rgba(200,200,210,.6)'); for(let r=1;r<4;r++){ g.strokeStyle=`rgba(220,220,230,${.4/r})`; g.lineWidth=2; g.beginPath(); g.ellipse(.5*w,.55*h,r*.18*w,r*.07*h,0,0,Math.PI*2); g.stroke(); } },
  /* a wall of singing mouths */
  choir_mouths(g,w,h,v){ const a=A(g,w,h); a.fill('#9a948a'); const shut=v==='shut';
    for(let r=0;r<3;r++) for(let i=0;i<5;i++){ const x=.12+i*.19+(r%2)*.09, y=.22+r*.28; a.ell(x,y,.08,.1,'#5a5452'); a.ell(x,y+.02,.06,shut?.006:.05,'#0c0a0a'); if(!shut) for(let t=-3;t<=3;t++) a.rect(x+t*.016-.006,y-.025,.012,.02,'#ece6d8'); }
    if(!shut) for(let i=0;i<10;i++){ const x=R(), y=R()*.9; a.poly([[x,y],[x+.03,y-.04],[x+.035,y+.02]],'#0c0a0a'); } },
  /* the Tithe ledger */
  ledger(g,w,h,v){ const a=A(g,w,h); a.fill('#1a1616'); a.poly([[.04,.1],[.49,.14],[.49,.95],[.04,.9]],'#e2dac8'); a.poly([[.51,.14],[.96,.1],[.96,.9],[.51,.95]],'#e8e0ce'); a.rect(.49,.12,.02,.84,'#8a8276');
    for(let i=0;i<13;i++){ const y=.2+i*.055; a.line([[.08,y],[.3+R()*.12,y]],'#4a4440',.006); a.line([[.56,y],[.76+R()*.14,y]],'#4a4440',.006); }
    const close=v==='close'||v==='struck'; if(close||v==='father'){ a.rect(.56,.53,.36,.05,'rgba(190,20,24,.25)'); a.line([[.56,.56],[.88,.56]],'#2a2424',.01); }
    if(close){ a.line([[.56,.62],[.84,.62]],RD,.014); a.line([[.6,.6],[.62,.64]],RD,.008); }
    if(v==='struck'){ a.line([[.54,.6],[.9,.635]],'#0c0a0a',.02); a.line([[.54,.64],[.9,.6]],'#0c0a0a',.012); a.poly([[.8,.9],[.98,.4],[1,.42],[.83,.92]],'#2a2424'); } },
  /* the Collector's cage opens */
  cage_open(g,w,h,v){ const a=A(g,w,h); a.fill('#1a1618'); a.glow(.5,.4,.5,'rgba(200,196,188,.5)'); for(let i=0;i<9;i++) a.rect(.18+i*.08,.1,.015,.75,'#0c0a0a'); a.rect(.16,.1,.68,.03,'#0c0a0a'); a.rect(.16,.84,.68,.03,'#0c0a0a');
    a.poly([[.84,.1],[1,.02],[1,.75],[.84,.87]],'rgba(12,10,10,.85)'); for(let i=0;i<6;i++){ const x=.25+i*.1; a.line([[x,.9],[x+.05,.55-R()*.15]],'#3a3234',.03); a.circ(x+.05,.52-R()*.1,.02,'#d8d2c4'); }
    for(let i=0;i<12;i++) a.ell(R(),.88+R()*.1,.02,.008,'#bab4a8'); },
  /* the Saint's gold mask falls away */
  mask_fall(g,w,h,v){ const a=A(g,w,h); a.fill('#2a2224'); a.glow(.5,.4,.5,'rgba(240,230,210,.5)'); g.save(); g.translate(.52*w,.55*h); g.rotate(.4); g.translate(-.52*w,-.55*h);
    a.ell(.52,.55,.17,.22,'#e8e0cc'); a.ell(.46,.5,.04,.025,'#1a1414'); a.ell(.58,.5,.04,.025,'#1a1414'); a.rect(.48,.66,.08,.01,'#1a1414'); a.line([[.46,.53],[.45,.62]],RD,.01); a.line([[.58,.53],[.585,.64]],RD,.01); g.restore();
    for(let i=0;i<5;i++) a.line([[.2+i*.15,.05],[.22+i*.15,.15]],'#a8a094',.008); },
  /* the Saint lowers her arms */
  saint_arms(g,w,h,v){ const a=A(g,w,h); a.fill('#e8e2d6'); a.glow(.5,.3,.6,'rgba(255,252,244,1)'); figure(a,.5,1.0,.85,'saint',{col:1});
    for(let i=0;i<7;i++){ const x=.3+R()*.4; a.line([[x,.6+R()*.3],[x+.01,.66+R()*.3]],'#4a4444',.008); } },
  /* the Count, half his face in shadow */
  count_face(g,w,h,v){ const a=A(g,w,h); a.fill('#0e0a0a'); a.ell(.5,.6,.26,.38,'#bab2a6'); a.poly([[.5,.2],[.8,.3],[.8,1],[.5,1]],'#0e0a0a'); a.ell(.4,.55,.05,.02,'#0e0a0a'); a.circ(.4,.55,.008,'#f4f0e8'); a.line([[.36,.78],[.5,.8]],'#2a2224',.012);
    for(let i=-3;i<=3;i++) a.poly([[.5+i*.06-.025,.28],[.5+i*.06,.12-(i%2?0:.04)],[.5+i*.06+.025,.28]],'#ddd5c6'); a.rect(.32,.27,.36,.04,'#ddd5c6');
    if(v==='crack') a.line([[.42,.12],[.46,.3],[.43,.45],[.47,.6]],RD,.012); else a.ell(.5,.22,.2,.03,'rgba(190,20,24,.5)'); },
  crown_break(g,w,h,v){ const a=A(g,w,h); a.vgrad('#5a5254','#1a1618'); a.rect(0,.7,1,.3,'#2a2426'); a.poly([[.3,.72],[.33,.5],[.38,.62],[.44,.45],[.5,.6],[.56,.44],[.62,.62],[.66,.5],[.7,.72]],'#ddd5c6');
    a.line([[.5,.45],[.48,.6],[.52,.72]],'#0c0a0a',.01); a.poly([[.66,.74],[.72,.68],[.76,.74]],'#ddd5c6'); for(let i=0;i<6;i++) a.circ(.3+R()*.4,.75+R()*.1,.008,RD); },
  /* Hollowmere at dawn */
  dawn_city(g,w,h,v){ const a=A(g,w,h); a.vgrad('#f4f0e8','#8a8486',0,.75); a.circ(.5,.7,.12,'#fffdf6'); a.rays(.5,.7,13,.9,'rgba(255,255,250,.5)',2.8);
    for(let i=0;i<22;i++){ const x=i/21, hh=.12+R()*.22; a.rect(x-.025,.75-hh,.05,hh+.3,'#2a2628'); if(R()<.5) a.poly([[x-.03,.75-hh],[x,.75-hh-.08],[x+.03,.75-hh]],'#2a2628'); }
    a.rect(0,.88,1,.12,'#1a1618'); for(let i=0;i<6;i++) a.ell(.1+R()*.8,.2+R()*.2,.015,.006,'#2a2628'); },
  /* the door, light spilling out, Ilse in it */
  door(g,w,h,v){ const a=A(g,w,h); a.fill('#1a1618'); a.rect(.3,.1,.4,.9,'#0c0a0a'); a.rect(.34,.14,.32,.86,'#fffaf0'); a.glow(.5,.6,.6,'rgba(255,250,235,.6)'); a.poly([[.34,1],[.66,1],[.9,1.2],[.1,1.2]],'#d8d2c4');
    figure(a,.5,1.0,.6,'girl',{c:'#0c0a0a'}); },
  embrace(g,w,h,v){ const a=A(g,w,h); a.fill('#2a2426'); a.poly([[.36,.02],[.64,.02],[.64,.5],[.36,.5]],'#fbf8f0'); a.glow(.5,.25,.35,'rgba(255,255,255,.9)'); a.rect(.33,0,.03,.52,'#0c0a0a'); a.rect(.64,0,.03,.52,'#0c0a0a');
    a.poly([[.36,.5],[.64,.5],[.98,1],[.02,1]],'#ece6d8'); a.line([[.36,.5],[.64,.5]],'#0c0a0a',.008);
    a.poly([[.47,.5],[.53,.5],[.62,1],[.36,1]],'#141012'); a.poly([[.53,.5],[.57,.5],[.8,1],[.62,1]],'#4a4446'); a.ell(.49,1.0,.08,.03,'#141012');
    figure(a,.47,.5,.36,'sellsword',{c:'#0c0a0a',face:1}); figure(a,.545,.5,.3,'girl',{c:'#3a3436',face:-1,rim:'#fbf8f0'}); },
  candle_relit(g,w,h,v){ const a=A(g,w,h); a.vgrad('#e8e4dc','#9a9496'); a.rect(.1,.05,.8,.62,'#d8d4cc'); a.rect(.49,.05,.02,.62,'#4a4446'); a.rect(.1,.34,.8,.02,'#4a4446');
    a.rect(.05,.67,.9,.08,'#3a3436'); a.candle(.42,.67,.04,.045,true); a.candle(.58,.67,.11,.05,true); a.ell(.8,.6,.06,.045,'#0c0a0a',-.3); a.ell(.85,.53,.03,.03,'#0c0a0a'); a.poly([[.87,.53],[.92,.55],[.87,.56]],'#1a1616'); },
  hands_ash(g,w,h,v){ const a=A(g,w,h); a.fill('#1a1618'); a.glow(.5,.4,.5,'rgba(220,214,204,.6)'); for(const [x,f] of [[.36,-1],[.64,1]]){ a.ell(x,.6,.12,.14,'#bab2a6'); for(let i=0;i<4;i++) a.ell(x+f*(.02-i*.035),.44,.022,.08,'#bab2a6'); }
    for(let i=0;i<40;i++) a.circ(.3+R()*.4,.3+R()*.5,.004+R()*.005,'#3a3234'); a.poly([[.32,.62],[.36,.58],[.38,.66]],'#4a4244'); }
};
