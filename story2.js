'use strict';
/* ===== the new story in pages (v24) =====
   Storyboard from Story Bible & Storyboard v2 (claude/story/): the prologue (the last war, the pact, the frame, the
   trial, the farewell, the coronation), Act I (the road home) and Act II (Hollowmere in darkness, to the fall).
   Panel ids are the bible's, so a still dropped in art/manga/<id>.webp (or .png/.jpg) replaces the drawing (see manifest.json).
   v45: the panels are WebP at quality 82 (77 MB of PNG became 5 MB). Convert new stills the same way before adding them.
   Panels the bible marks "keep" use the old still's id so the existing art shows. Drawings here are placeholders in
   the same 1-bit pipeline until the stills are generated.
   Act III (the old story) keeps its pages for now: the old Act I opening ("You fell") opens Act III; the Kiln and the
   Breach keep their intros as level scenes. */

/* ---------- figures ---------- */
function casSprite(c,o){ o=o||{}; const R_=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
  R_(-3,-10,2,10,'#24242a'); R_(1,-10,2,10,'#2c2c32'); R_(-5,-22,10,12,o.king?'#141012':'#2a2a32'); R_(-5,-22,10,1,o.king?'#b8913a':'#6a6a7a'); R_(-5,-17,10,1,'#b8913a');
  if(o.king){ R_(-6,-22,12,22,'#141012'); R_(-6,-22,1,22,'#b8913a'); R_(5,-22,1,22,'#b8913a'); }
  R_(-3,-28,6,6,'#e0c8a8'); R_(-4,-30,8,3,'#e8d090'); R_(-5,-28,2,4,'#e8d090'); R_(1,-26,1,1,'#2a1a10'); R_(-1,-24,3,1,o.grief?'#5a3a3a':'#b08070');
  if(o.king){ R_(-4,-33,8,3,'#5a5054'); R_(-4,-34,1,2,'#5a5054'); R_(3,-34,1,2,'#5a5054'); R_(-1,-33,2,2,'#0c0a0a'); }
  if(o.sword!==false){ R_(4,-18,1,2,'#b8913a'); R_(5,-19,12,1,'#d8d4cc'); } }
function kingSprite(c,o){ o=o||{}; const R_=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);}; R_(-7,-24,14,24,'#3a1018'); R_(-7,-24,14,2,'#b8913a'); R_(-2,-24,4,24,'#e8e0d0');
  R_(-3,-31,7,7,o.dead?'#8a8a86':'#d8c0a0'); R_(-4,-28,9,9,'#ece6d8'); R_(-3,-31,7,3,o.dead?'#8a8a86':'#d8c0a0'); R_(-1,-29,1,1,'#2a1a10'); R_(2,-29,1,1,'#2a1a10'); R_(-4,-35,9,3,'#b8913a'); R_(-4,-36,1,2,'#b8913a'); R_(0,-37,1,2,'#b8913a'); R_(4,-36,1,2,'#b8913a'); }
function boySprite(c){ const R_=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);}; R_(-2,-6,1,6,'#2a1a14'); R_(1,-6,1,6,'#2a1a14'); R_(-3,-13,6,7,'#5a4430'); R_(-2,-18,4,5,'#d8c0a0'); R_(-3,-19,6,2,'#2a1a14'); R_(3,-11,4,3,'#c8a070'); R_(6,-13,1,2,'#c8a070'); }
function girlSprite(c){ const R_=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);}; R_(-3,-11,6,11,'#4a2a36'); R_(-2,-15,4,4,'#d8c0a0'); R_(-3,-16,6,2,'#2a1a14'); R_(-3,-15,1,5,'#2a1a14'); R_(3,-9,1,3,'#e8e0d0'); R_(3,-10,1,1,'#fff6d0'); }
function hoodSprite(c){ const R_=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);}; c.fillStyle='#141012'; c.beginPath(); c.moveTo(-6,0); c.lineTo(-5,-22); c.lineTo(-1,-31); c.lineTo(4,-28); c.lineTo(6,-20); c.lineTo(7,0); c.fill(); R_(0,-25,3,3,'#2a2024'); R_(5,-16,2,10,'#8a8478'); }
function bossFig(kind,extra){ return c=>{ const B=BOSSES[kind]; const e=Object.assign({anim:1.3,phase:1,state:'idle',st:0,face:1,vx:0,vy:0,w:B.w,h:B.h,pat:null,alpha:1,kind,sis:[{},{},{}],cur:0},extra||{}); BDRAW[kind](c,e); }; }
Object.assign(SPR,{cassian:{fn:casSprite,h:30,box:60},king:{fn:c=>casSprite(c,{king:1}),h:34,box:60},aldous:{fn:kingSprite,h:37,box:60},deadking:{fn:c=>kingSprite(c,{dead:1}),h:37,box:60},
  boy:{fn:boySprite,h:19,box:36},wren:{fn:girlSprite,h:16,box:32},hood:{fn:hoodSprite,h:31,box:60},
  odo:{fn:bossFig('odo',{mounted:1}),h:56,box:110},hags:{fn:bossFig('sisters'),h:32,box:60},preacher:{fn:bossFig('preacher'),h:33,box:60},merrow:{fn:bossFig('merrow'),h:37,box:60},
  piet:{fn:bossFig('piet'),h:31,box:60},brann:{fn:bossFig('brann'),h:37,box:80},rook:{fn:bossFig('rook'),h:31,box:60},gideon:{fn:bossFig('gideon'),h:35,box:60},footman:{fn:c=>EDRAW.footman(c,{walk:0,state:'chase'}),h:30,box:50}});

/* ---------- drawings ---------- */
Object.assign(MART,{
  kesh_wall(g,w,h,v){ const a=A(g,w,h); a.vgrad('#2a2426','#6a6060',0,.6); a.glow(.7,.7,.7,'rgba(190,20,24,.45)'); a.poly([[0,.55],[.35,.45],[.42,.62],[.6,.5],[1,.56],[1,1],[0,1]],'#141012'); a.rubble(.6,24,'#2a2426');
    for(let i=0;i<5;i++) a.glow(.1+i*.2,.5,.08,'rgba(255,250,240,.6)'); figure(a,.4,.6,.36,'sellsword',{col:1}); figure(a,.52,.6,.34,'cassian',{col:1,face:-1}); if(v==='backs'){ for(let i=0;i<6;i++) figure(a,.08+i*.17,.98,.28,'footman',{c:'#1a1618',face:i<3?1:-1}); } },
  rider_order(g,w,h){ const a=A(g,w,h); a.fill('#4a4446'); a.glow(.8,.3,.5,'rgba(255,250,240,.5)'); a.poly([[0,.8],[1,.75],[1,1],[0,1]],'#141012');
    a.ell(.3,.62,.1,.05,'#141012'); a.rect(.24,.62,.015,.16,'#141012'); a.rect(.34,.62,.015,.16,'#141012'); a.rect(.37,.52,.02,.1,'#141012'); figure(a,.3,.6,.25,'hood',{c:'#141012'}); a.rect(.4,.5,.04,.03,'#ece6d8'); a.circ(.42,.515,.008,'#b0141a');
    figure(a,.5,.82,.4,'cassian',{col:1,face:-1}); figure(a,.8,.82,.42,'sellsword',{col:1,face:1}); },
  granary(g,w,h){ const a=A(g,w,h); a.fill('#141012'); a.glow(.5,.7,.9,'rgba(255,240,220,.9)'); for(let i=0;i<4;i++){ const x=.15+i*.2; a.poly([[x,.85],[x+.06,.4],[x+.12,.85]],'#2a2426'); } a.glow(.5,.6,.4,'rgba(190,20,24,.5)');
    for(let i=0;i<14;i++){ const x=R(); a.flame(x,.85,.03+R()*.03); } figure(a,.5,1,.5,'cassian',{c:'#0c0a0a',face:-1}); for(let i=0;i<5;i++) figure(a,.1+i*.06,.98,.08,'wren',{c:'#2a2426'}); },
  triumph(g,w,h){ const a=A(g,w,h); a.vgrad('#ece6d8','#a8a090'); for(let i=0;i<60;i++) a.circ(R(),R()*.8,.004,'#fbf8f0'); a.poly([[0,.75],[1,.7],[1,1],[0,1]],'#4a4446');
    for(let i=0;i<14;i++) figure(a,i/13,1,.22,i%3?'boy':'wren',{c:'#2a2426'}); a.ell(.45,.6,.1,.05,'#141012'); figure(a,.45,.58,.28,'sellsword',{col:1}); figure(a,.75,.7,.3,'cassian',{c:'#3a3436'}); },
  throne(g,w,h,v){ const a=A(g,w,h); a.fill('#2a2426'); a.rays(.5,0,9,1.2,'rgba(236,230,216,.12)',1.6); a.rect(.42,.2,.16,.6,'#141012'); a.poly([[.42,.2],[.5,.08],[.58,.2]],'#141012');
    figure(a,.5,.8,.42,'aldous',{col:1}); figure(a,.62,.84,.36,'sellsword',{col:1,face:-1}); for(let i=0;i<5;i++) figure(a,.08+i*.06,.98,.2,'hood',{c:'#141012'}); figure(a,.94,.98,.3,'cassian',{c:'#3a3436',face:-1}); },
  cup(g,w,h,v){ const a=A(g,w,h); a.fill(v==='wine'?'#2a2426':'#6a6466'); a.glow(.5,.3,.5,'rgba(255,250,240,.4)'); a.poly([[.38,.42],[.62,.42],[.58,.62],[.42,.62]],'#d8d2c8'); a.rect(.48,.62,.04,.16,'#d8d2c8'); a.rect(.42,.78,.16,.03,'#d8d2c8');
    if(v==='wine'){ a.poly([[.62,.1],[.72,.12],[.6,.4],[.55,.38]],'#d8d2c8'); a.line([[.58,.38],[.52,.48]],'#b0141a',.012); a.rect(.4,.45,.2,.04,'#b0141a'); } else { a.rect(.4,.44,.2,.04,'#b0141a'); for(let i=0;i<5;i++) a.line([[.66+i*.03,.3],[.7+i*.04,.24]],'#141012',.006); } },
  stair(g,w,h){ const a=A(g,w,h); a.fill('#0c0a0a'); for(let i=0;i<10;i++){ const y=.1+i*.09, x=.5+Math.sin(i*.9)*.25; a.poly([[x-.12,y],[x+.12,y],[x+.1,y+.04],[x-.1,y+.04]],'#3a3436'); } a.glow(.55,.55,.25,'rgba(255,250,235,.7)'); figure(a,.55,.62,.3,'cassian',{c:'#141012'}); a.flame(.6,.42,.04); },
  altar(g,w,h,v){ const a=A(g,w,h); a.fill('#141012'); a.ell(.5,.42,.36,.4,'#4a4446'); a.ell(.5,.42,.3,.34,'#6a6466');
    for(let i=0;i<7;i++){ const ang=-1.2+i*.4, x=.5+Math.cos(ang-Math.PI/2)*.2, y=.36+Math.sin(ang-Math.PI/2)*.15+.12; a.ell(x,y,.025,.012,'#0c0a0a'); a.line([[x,y],[x,y+.16+R()*.1]],'#b0141a',.008); }
    a.ell(.5,.62,.08,.06,'#0c0a0a'); for(let i=0;i<6;i++) a.candle(.15+i*.14,.95,.06,.025,true);
    if(v==='blood'){ a.poly([[.44,.4],[.56,.4],[.54,.48],[.46,.48]],'#d8c0a0'); a.line([[.5,.48],[.5,.6]],'#b0141a',.014); } else figure(a,.5,.96,.16,'cassian',{c:'#0c0a0a'}); },
  forgery(g,w,h){ const a=A(g,w,h); a.fill('#2a2426'); a.glow(.25,.4,.4,'rgba(255,250,235,.8)'); a.candle(.22,.75,.18,.06,true); for(let i=0;i<5;i++) a.rect(.4+i*.02,.6-i*.03,.4,.25,i===4?'#ece6d8':'#c8c2b8');
    a.line([[.5,.65],[.75,.62]],'#141012',.004); a.line([[.5,.69],[.72,.67]],'#141012',.004); a.circ(.72,.76,.03,'#b0141a'); a.line([[.62,.45],[.55,.7]],'#141012',.01); },
  bedchamber(g,w,h){ const a=A(g,w,h); a.fill('#2a2426'); a.rect(.55,.35,.45,.3,'#4a4446'); a.rect(.55,.33,.45,.04,'#6a6466'); a.line([[.62,.6],[.6,.82]],'#d8c0a0',.012); a.line([[.6,.82],[.58,.86]],'#d8c0a0',.008);
    a.poly([[0,.8],[1,.8],[1,1],[0,1]],'#141012'); figure(a,.25,.98,.2,'sellsword',{col:1,rot:-1.4}); a.line([[.3,.9],[.48,.88]],'#d8d2c8',.01); a.line([[.48,.88],[.5,.9]],'#b0141a',.012); },
  doorway(g,w,h){ const a=A(g,w,h); a.fill('#141012'); a.rect(.25,.05,.5,.95,'#6a6466'); a.glow(.5,.4,.5,'rgba(255,240,220,.7)'); figure(a,.5,1,.8,'cassian',{col:1,face:-1}); figure(a,.3,1,.6,'footman',{c:'#141012'}); figure(a,.72,1,.6,'footman',{c:'#141012',face:-1}); },
  trial(g,w,h,v){ const a=A(g,w,h); a.fill('#3a3436'); a.rays(.5,0,7,1.1,'rgba(236,230,216,.1)',1.4); for(let i=0;i<9;i++) a.rect(.02+i*.11,.05,.04,.5,'#2a2426');
    for(let r=0;r<2;r++) for(let i=0;i<14;i++) figure(a,i/13,.48+r*.08,.12,'hood',{c:'#141012'});
    if(v==='rook'){ a.fill('#6a6466'); figure(a,.5,1.1,.9,'rook',{col:1,face:-1}); }
    else if(v==='mercy'){ figure(a,.5,.96,.4,'cassian',{col:1}); for(let i=0;i<4;i++) figure(a,.15+i*.23,.98,.3,'hood',{c:'#2a2426'}); }
    else { figure(a,.5,.95,.4,'sellsword',{col:1}); a.line([[.45,.8],[.55,.8]],'#8a8478',.012); for(let i=0;i<4;i++) figure(a,.12+i*.25+(i>1?.1:0),.96,.38,i===1?'rook':'merrow',{c:'#2a2426',face:i<2?1:-1}); } },
  hostage(g,w,h){ const a=A(g,w,h); a.fill('#4a4446'); a.glow(.5,.5,.5,'rgba(236,230,216,.5)'); figure(a,.45,.95,.5,'girl',{col:1}); figure(a,.32,.95,.3,'boy',{col:1}); figure(a,.58,.95,.26,'wren',{col:1});
    for(let i=0;i<7;i++){ const x=.08+i*.14; a.line([[x,.15],[x,1]],'#141012',.01); a.poly([[x-.02,.15],[x,.06],[x+.02,.15]],'#141012'); } },
  toy_horse(g,w,h,v){ const a=A(g,w,h); a.fill(v==='cobbles'?'#3a3436':'#6a6466'); if(v==='cobbles'){ for(let y=.6;y<1;y+=.08) for(let x=0;x<1;x+=.12) a.ell(x+(y*10%2)*.06,y,.05,.025,'#4a4446'); a.glow(.5,.0,.6,'rgba(190,20,24,.35)'); }
    else { a.poly([[.2,.95],[.3,.7],[.45,.66],[.4,.95]],'#d8c0a0'); a.poly([[.8,.95],[.7,.7],[.55,.66],[.6,.95]],'#d8c0a0'); }
    a.rect(.36,.5,.28,.12,'#a8a090'); a.rect(.38,.62,.03,.12,'#a8a090'); a.rect(.59,.62,.03,.12,'#a8a090'); a.rect(.6,.4,.08,.12,'#a8a090'); a.circ(.65,.44,.008,'#141012'); a.line([[.36,.52],[.3,.6]],'#a8a090',.012);
    if(v==='cobbles'){ a.candle(.8,.86,.05,.03,false); a.poly([[.75,.9],[.86,.88],[.85,.91]],'#e4ded2'); } },
  hood_torn(g,w,h){ const a=A(g,w,h); a.fill('#4a4446'); a.poly([[.2,.2],[.5,.1],[.55,.9],[.15,.95]],'#ece6d8'); a.line([[.3,.3],[.45,.7]],'#141012',.008); a.rect(.33,.4,.1,.12,'#b0141a'); a.poly([[.55,.05],[.95,.15],[.9,.95],[.6,.9]],'#141012'); },
  ride_out(g,w,h,v){ const a=A(g,w,h); if(v==='road'){ a.vgrad('#8a8486','#c8c2b8',0,.6); a.poly([[0,.7],[1,.66],[1,1],[0,1]],'#4a4446'); a.poly([[.45,.68],[.55,.68],[.9,1],[.1,1]],'#2a2426'); a.ell(.75,.62,.05,.006,'#b0141a'); }
    else { a.vgrad('#d8d2c8','#ece6d8',0,.5); a.rect(0,.3,.35,.5,'#2a2426'); a.rect(.12,.45,.12,.35,'#0c0a0a'); a.poly([[0,.78],[1,.75],[1,1],[0,1]],'#4a4446'); figure(a,.82,.2,.06,'crow',{c:'#141012'}); }
    a.ell(.5,.82,.07,.035,'#141012'); a.rect(.45,.82,.01,.1,'#141012'); a.rect(.54,.82,.01,.1,'#141012'); a.rect(.56,.74,.015,.08,'#141012'); figure(a,.5,.8,.2,'hood',{c:'#141012'}); },
  crowned(g,w,h){ const a=A(g,w,h); a.fill('#2a2426'); a.rays(.5,0,9,1.2,'rgba(236,230,216,.18)',1.4); for(let r=0;r<3;r++) for(let i=0;i<8;i++) a.circ(.08+i*.12+(r%2)*.06,.75+r*.08,.025,'#4a4446');
    figure(a,.5,.8,.48,'king',{col:1}); a.line([[.5,.05],[.5,.16]],'#141012',.008); a.ell(.5,.18,.05,.02,'#5a5054'); },
  campfire(g,w,h){ const a=A(g,w,h); a.vgrad('#8a8486','#e8e2d8',0,.7); for(let i=0;i<5;i++) a.poly([[i*.25-.1,.7],[i*.25+.05,.4+R()*.1],[i*.25+.2,.7]],'#6a6466'); a.rect(0,.7,1,.3,'#ece6d8');
    a.flame(.42,.82,.03); a.glow(.42,.8,.15,'rgba(255,250,235,.6)'); figure(a,.5,.86,.22,'hood',{c:'#141012',face:-1}); a.ell(.75,.78,.06,.03,'#2a2426'); a.rect(.79,.7,.015,.08,'#2a2426'); },
  hags(g,w,h,v){ const a=A(g,w,h); a.fill('#4a4446'); a.glow(.5,.4,.6,'rgba(200,196,190,.4)'); a.rect(0,.7,1,.3,'#141012'); for(let i=0;i<20;i++) a.line([[R(),.7+R()*.3],[R(),.7+R()*.3]],'#2a2426',.003);
    if(v==='sink'){ for(let i=0;i<3;i++){ const x=.25+i*.25; for(let f=-2;f<=2;f++) a.line([[x+f*.012,.72],[x+f*.018,.62]],'#d8d2c8',.006); } return; }
    for(let i=0;i<3;i++) figure(a,.25+i*.25,.76,.5,'hags',{col:1,face:i===2?-1:1}); for(let i=0;i<6;i++) a.rect(.4+i*.035,.8,.02,.01,'#ece6d8'); },
  warrant(g,w,h){ const a=A(g,w,h); a.fill('#4a4446'); for(let i=0;i<40;i++) a.line([[R(),R()],[R()-.05,R()+.1]],'rgba(200,196,190,.3)',.002); a.rect(.48,0,.04,1,'#141012'); a.rect(.3,.25,.4,.5,'#d8d2c8');
    a.ell(.5,.45,.08,.1,'#4a4446'); a.rect(.46,.36,.08,.06,'#141012'); a.line([[.38,.65],[.62,.7]],'#141012',.01); a.line([[.38,.7],[.62,.65]],'#141012',.01); a.circ(.5,.3,.012,'#8a8478'); },
  hounds_master(g,w,h){ const a=A(g,w,h); a.fill('#6a6466'); a.rect(0,.7,1,.3,'#4a4446'); figure(a,.5,.82,.18,'sellsword',{c:'#141012',rot:-1.5}); for(let i=0;i<4;i++){ a.ell(.25+i*.15,.84,.06,.025,'#141012'); a.ell(.3+i*.15,.82,.02,.015,'#141012'); } },
  black_eyes(g,w,h){ const a=A(g,w,h); a.fill('#4a4446'); for(let i=0;i<60;i++) a.line([[R(),R()],[R()-.03,R()+.08]],'rgba(236,230,216,.3)',.002); a.ell(.5,.55,.3,.38,'#c8c2b8'); a.poly([[.18,.4],[.82,.4],[.75,.1],[.25,.1]],'#2a2426');
    a.ell(.38,.52,.07,.035,'#0c0a0a'); a.ell(.62,.52,.07,.035,'#0c0a0a'); a.line([[.42,.75],[.58,.75]],'#2a2426',.01); },
  still_rows(g,w,h){ const a=A(g,w,h); a.fill('#6a6466'); for(let i=0;i<50;i++) a.line([[R(),R()],[R()-.03,R()+.08]],'rgba(236,230,216,.3)',.002); for(let r=0;r<3;r++) for(let i=0;i<8;i++) figure(a,.08+i*.12+(r%2)*.06,.6+r*.15,.28,'footman',{c:r===2?'#141012':'#2a2426'}); figure(a,.5,.98,.12,'merrow',{c:'#0c0a0a',rot:-1.5}); },
  tithe_street(g,w,h){ const a=A(g,w,h); a.fill('#141012'); for(let i=0;i<8;i++){ const x=i*.13; a.rect(x,.25,.11,.6,'#3a3436'); a.rect(x+.04,.6,.04,.25,'#0c0a0a'); if(i===3||i===7){ a.line([[x+.04,.62],[x+.08,.72]],'#b0141a',.008); a.line([[x+.08,.62],[x+.04,.72]],'#b0141a',.008); } }
    a.rect(.3,.82,.3,.08,'#4a4446'); a.circ(.33,.92,.03,'#2a2426'); a.circ(.57,.92,.03,'#2a2426'); for(let i=0;i<4;i++) a.ell(.35+i*.07,.8,.035,.02,'#c8c2b8'); },
  preacher(g,w,h,v){ const a=A(g,w,h); a.fill('#2a2426'); a.glow(.7,.6,.6,'rgba(255,240,220,.8)'); a.poly([[.55,1],[.6,.35],[.7,.2],[.8,.35],[.85,1]],'#141012'); for(let i=0;i<8;i++) a.flame(.58+R()*.25,.4+R()*.5,.03);
    if(v==='ash'){ a.fill('#8a8486'); a.rect(0,.7,1,.3,'#a8a2a0'); a.rect(.45,.62,.1,.1,'#141012'); a.line([[.42,.72],[.6,.68]],'#141012',.01); a.glow(.7,.3,.5,'rgba(60,56,56,.5)'); return; }
    figure(a,.35,.98,.6,'preacher',{col:1}); for(let i=0;i<5;i++) figure(a,.05+i*.08,1,.18,'hood',{c:'#141012'}); a.flame(.42,.32,.04); },
  crow_post(g,w,h){ const a=A(g,w,h); a.fill('#6a6466'); a.rect(.44,.5,.12,.5,'#2a2426'); figure(a,.5,.5,.3,'crow',{col:1}); a.line([[.48,.48],[.44,.6]],'#ece6d8',.004); a.circ(.5,.5,.012,'#b0141a'); },
  piet_wall(g,w,h){ const a=A(g,w,h); a.fill('#d8d2c8'); a.rect(0,0,.45,1,'#4a4446'); for(let y=0;y<1;y+=.08) a.line([[0,y],[.45,y]],'#3a3436',.004); a.rect(0,.85,1,.15,'#ece6d8'); figure(a,.36,.95,.32,'piet',{col:1,rot:-.3}); figure(a,.7,.95,.55,'hood',{c:'#141012',face:-1}); a.circ(.4,.82,.02,'#b0141a'); },
  palace_window(g,w,h){ const a=A(g,w,h); a.fill('#0c0a0a'); a.rect(.3,.1,.4,.75,'#3a3436'); a.rect(.33,.14,.34,.6,'#141012'); a.poly([[.33,.14],[.5,.04],[.67,.14]],'#3a3436'); a.rect(.49,.14,.02,.6,'#3a3436'); a.rect(.3,.74,.4,.04,'#4a4446'); a.glow(.5,0,.4,'rgba(190,20,24,.3)'); },
  sealed_gate(g,w,h){ const a=A(g,w,h); a.vgrad('#2a2426','#4a4446'); a.ell(.5,.15,.18,.025,'#b0141a'); a.rect(0,.4,1,.6,'#141012'); for(let x=0;x<1;x+=.06) a.rect(x,.36,.035,.05,'#141012'); a.rect(.38,.55,.24,.45,'#3a3436'); for(let y=.58;y<1;y+=.05) a.line([[.38,y],[.62,y]],'#2a2426',.004);
    for(let i=0;i<4;i++) a.poly([[.1+i*.25,.42],[.16+i*.25,.42],[.16+i*.25,.62],[.13+i*.25,.58],[.1+i*.25,.62]],'#0c0a0a'); },
  curfew(g,w,h){ const a=A(g,w,h); a.fill('#141012'); for(let i=0;i<6;i++){ a.rect(i*.17,.2,.15,.7,'#2a2426'); a.rect(i*.17+.04,.4,.07,.1,i===2?'#d8d2c8':'#0c0a0a'); } a.rect(0,.85,1,.15,'#3a3436'); figure(a,.5,.92,.4,'hood',{col:1}); a.poly([[.56,.6],[.62,.6],[.63,.68],[.55,.68]],'#a8a090'); },
  brann_map(g,w,h){ const a=A(g,w,h); a.fill('#4a4446'); a.rect(.1,.55,.8,.4,'#c8c2b8'); for(let i=0;i<6;i++) a.line([[.15+R()*.7,.6+R()*.3],[.15+R()*.7,.6+R()*.3]],'#4a4446',.004); a.rect(.72,.6,.08,.1,'#ece6d8'); a.rect(.82,.6,.08,.1,'#ece6d8'); a.ell(.76,.64,.015,.02,'#4a4446'); a.ell(.86,.64,.015,.02,'#4a4446');
    figure(a,.4,1.25,.95,'brann',{col:1}); },
  ledger_names(g,w,h){ const a=A(g,w,h); a.fill('#e8e2d6'); for(let i=0;i<12;i++) a.line([[.1,.1+i*.07],[.9,.1+i*.07]],'#c8c2b8',.003); for(let i=0;i<3;i++){ const y=.38+i*.1; a.line([[.2,y],[.6,y]],'#2a2426',.012); if(i>0) a.line([[.18,y],[.66,y-.01]],'#b0141a',.018); } },
  rook_kneel(g,w,h){ const a=A(g,w,h); a.fill('#6a6466'); a.rect(0,.8,1,.2,'#4a4446'); a.ell(.78,.82,.16,.05,'#141012'); a.rect(.62,.76,.02,.08,'#141012'); figure(a,.42,.98,.55,'rook',{col:1,rot:.15}); a.ell(.25,.9,.04,.03,'#a8a2a0'); },
  memory(g,w,h){ const a=A(g,w,h); a.fill('#d8d2c8'); a.glow(.5,.5,.7,'rgba(255,255,255,.6)'); figure(a,.4,.95,.4,'boy',{c:'#4a4446'}); figure(a,.6,.95,.36,'wren',{c:'#4a4446'}); a.ell(.42,.42,.06,.03,'#2a2426'); a.ell(.6,.48,.06,.03,'#2a2426'); a.rect(.4,.2,.25,.04,'#2a2426'); },
  eye_close(g,w,h,v){ const a=A(g,w,h); a.fill('#c8c2b8'); a.ell(.5,.5,.4,.12,v==='rage'?'#ece6d8':'#a8a2a0'); if(v==='rage'){ a.circ(.5,.5,.08,'#141012'); a.line([[.44,.62],[.42,.9]],'#ece6d8',.012); a.glow(.5,.5,.4,'rgba(190,20,24,.35)'); } else { a.line([[.1,.5],[.9,.5]],'#2a2426',.02); a.line([[.6,.55],[.62,.85]],'#ece6d8',.01); } },
  pike_gate(g,w,h){ const a=A(g,w,h); a.vgrad('#2a2426','#b0141a',0,.8); a.ell(.5,.12,.2,.025,'#5a0a0e'); a.rect(.3,.45,.4,.55,'#0c0a0a'); for(const [x,s] of [[.42,.012],[.5,.018],[.58,.012]]){ a.line([[x,.45],[x,.2]],'#0c0a0a',.006); a.circ(x,.2-s,s,'#0c0a0a'); }
    a.poly([[.45,1],[.55,1],[.52,.7],[.48,.7]],'#2a2426'); for(let i=0;i<6;i++){ const t=i/6; a.rect(.48-t*.4,.7+t*.3,.01,.05,'#0c0a0a'); a.rect(.52+t*.4,.7+t*.3,.01,.05,'#0c0a0a'); } },
  charge(g,w,h){ const a=A(g,w,h); a.fill('#e8e2d6'); for(let i=0;i<40;i++){ const y=R(); a.line([[0,y],[1,y]],'rgba(42,36,38,.35)',.002); } figure(a,.35,.95,.6,'hood',{col:1}); a.line([[.42,.6],[.7,.55]],'#d8d2c8',.012); for(let i=0;i<4;i++) figure(a,.75+i*.07,.95,.4,'footman',{c:'#2a2426',face:-1}); },
  torch_kegs(g,w,h){ const a=A(g,w,h); a.fill('#2a2426'); for(let i=0;i<5;i++){ a.ell(.15+i*.18,.88,.07,.1,'#4a4446'); a.line([[.08+i*.18,.85],[.22+i*.18,.85]],'#141012',.006); } figure(a,.45,.75,.55,'gideon',{col:1}); a.line([[.6,.5],[.62,.78]],'#8a8478',.012); a.flame(.62,.78,.04); },
  balcony(g,w,h){ const a=A(g,w,h); a.fill('#0c0a0a'); a.glow(.5,0,.8,'rgba(190,20,24,.4)'); a.rect(.2,.55,.6,.06,'#3a3436'); for(let i=0;i<8;i++) a.rect(.22+i*.075,.61,.02,.12,'#3a3436'); figure(a,.5,.56,.4,'king',{col:1}); },
  blast(g,w,h){ const a=A(g,w,h); a.fill('#ece6d8'); a.glow(.5,.7,.6,'rgba(255,255,255,1)'); for(let i=0;i<24;i++){ const ang=R()*Math.PI*2, r=.1+R()*.4; a.poly([[.5+Math.cos(ang)*r,.7+Math.sin(ang)*r*.6],[.5+Math.cos(ang)*r+.03,.7+Math.sin(ang)*r*.6],[.5+Math.cos(ang)*r+.01,.7+Math.sin(ang)*r*.6+.03]],'#2a2426'); } figure(a,.5,.6,.06,'hood',{c:'#0c0a0a'}); }
});

/* ---------- the pages ---------- */
const OLD_STORY={a1:STORY['act:Act I'],a4:STORY['act:Act IV'],a5:STORY['act:Act V']};
const CAP=(t,jp,at)=>Object.assign({t},jp?{jp}:{},at?{at}:{});
Object.assign(STORY,{
  opening:[
    {panels:LY.wide3(
      {id:'pr-01-kesh',art:'kesh_wall',cap:[CAP('The last war. Kesh fell in a single night.','最後の戦')]},
      {id:'pr-02-backs',art:'kesh_wall',v:'backs',say:[{t:'Left! I\'ve got your back.',at:[.7,.2]}],cap:[CAP('Halden and Cassian, side by side. As always.',null,'bl')]},
      {id:'op-4-eyes',px:3,art:'sellsword_eyes',v:'calm',cap:[CAP('You are the elder prince. First sword of the realm. Your father\'s favourite.',null,'bl')]})}],
  prologue:[
    {panels:LY.l4(
      {id:'pr-03-order',art:'rider_order',cap:[CAP('The King\'s order: burn the granaries.','王命')]},
      {id:'pr-04-granary',art:'granary',cap:[CAP('Cassian did it. No one sang about it.',null,'bl')]},
      {id:'pr-05-triumph',art:'triumph',cap:[CAP('They chanted one name.',null,'bl')]},
      {id:'pr-06-heir',art:'throne',say:[{t:'My heir.',at:[.42,.2]}],cap:[CAP('Cassian, at the far edge of the light.',null,'bl')]})},
    {panels:LY.top2(
      {id:'pr-07-insult',art:'cup',say:[{t:'I\'ll find a use for you, brother.',who:'you',at:[.5,.2]}],cap:[CAP('You were drunk, and proud, and everyone heard.',null,'bl')]},
      {id:'pr-08-crypt',art:'stair',cap:[CAP('Under the palace there is an older door.',null,'bl')]},
      {id:'pr-09-altar',art:'altar',sfx:{t:'餓',at:[.85,.3],size:7,red:1},cap:[CAP('Something down there was hungry.','餓えたもの')]})},
    {panels:LY.wide3(
      {id:'pr-10-price',art:'altar',v:'blood',cap:[CAP('His soul. And the soul of every man who swears to him.','代償')]},
      {id:'pr-11-letters',art:'forgery',cap:[CAP('Letters to Kesh, in your hand.',null,'bl')]},
      {id:'pr-12-wine',art:'cup',v:'wine',say:[{t:'Drink with me, brother.',at:[.3,.2]}]})},
    {panels:LY.l4(
      {id:'pr-13-wake',art:'bedchamber',sfx:{t:'血',at:[.85,.25],size:6,red:1},cap:[CAP('You woke with your sword in your hand.','目覚め')]},
      {id:'pr-14-doorway',art:'doorway',say:[{t:'Brother... what have you done?',at:[.5,.12]}]},
      {id:'pr-15-trial',art:'trial',cap:[CAP('The generals spoke, one by one.',null,'bl')]},
      {id:'pr-16-rook',px:2,art:'trial',v:'rook',cap:[CAP('Rook said nothing.',null,'bl')]})},
    {panels:LY.top2(
      {id:'pr-17-mercy',art:'trial',v:'mercy',say:[{t:'Not death. Exile. He is still my brother.',at:[.5,.12]}]},
      {id:'pr-18-hostage',art:'hostage',say:[{t:'Your family will stay. Under the crown\'s protection.',at:[.5,.1]}]},
      {id:'pr-19-window',art:'window_candle',cap:[CAP('One window still lit.','灯')]})},
    {panels:LY.wide3(
      {id:'pr-20-candle',art:'hands_candle',say:[{t:'Bring it back lit.',at:[.62,.24]}],cap:[CAP('Ilse. Clever, stubborn. She keeps a candle in the window when you\'re at war.',null,'bl')]},
      {id:'pr-21-horse',px:2,art:'toy_horse',say:[{t:'So you\'re not alone.',at:[.5,.15]}],cap:[CAP('Tomas carved it with you. Wren copies her mother\'s candle.',null,'bl')]},
      {id:'pr-22-hood',art:'hood_torn',cap:[CAP('They took your colours.',null,'bl')]})},
    {panels:LY.wide3(
      {id:'pr-23-ride',art:'ride_out',cap:[CAP('You rode out with a candle and a wooden horse.','追放')]},
      {id:'pr-24-crowned',art:'crowned',cap:[CAP('They crowned him in a week. The Choir sang.',null,'bl')]},
      {id:'pr-25-eye',art:'count_crown',cap:[CAP('That night the sky opened an eye.','空の眼')]})}],
  'act:Act I':[
    {panels:LY.l4(
      {id:'a1-01-exile',art:'campfire',cap:[CAP('Far away. Months later.','第一幕　帰路')]},
      {id:'op-5-crow',px:3,art:'crow',cap:[CAP('A crow found you.',null,'bl')]},
      {id:'a2-3-letter',art:'crow_letter',cap:[CAP('"He comes to the house now. The children ask for you. Come home."',null,'bl')]},
      {id:'a1-04-road',art:'ride_out',v:'road',say:[{t:'Home.',who:'you',at:[.7,.3]}]})}],
  'boss:odo':[
    {panels:LY.wide3(
      {id:'b02-1-fall',alt:'hounds_master',shot:'boss',cap:[CAP('Ser Odo Gallowmark. You hunted boar with him once.','猟犬番')]},
      {id:'b02-2-warrant',art:'warrant',cap:[CAP('"The Kingslayer. Alive or dead."',null,'bl')]},
      {id:'b02-3-hounds',art:'hounds_master',cap:[CAP('His hounds wouldn\'t leave him.',null,'bl')]})}],
  'boss:sisters':[
    {panels:LY.tall2(
      {id:'b01-2-sisters',art:'hags',say:[{t:'You\'ll come home to a gate of pikes.',at:[.5,.15]}],cap:[CAP('They read your fate in thrown bones.','三姉妹')]},
      {id:'b01-3-sink',art:'hags',v:'sink',cap:[CAP('The fen took them back.',null,'bl')]})}],
  'boss:preacher':[
    {panels:LY.wide3(
      {id:'a1-05-tithe',art:'tithe_street',cap:[CAP('A second letter: "They took the tithe in our street. One in ten."','十分の一')]},
      {id:'b04-2-preacher',art:'preacher',say:[{t:'The new King hears every prayer.',at:[.3,.12]}]},
      {id:'b04-3-lantern',art:'preacher',v:'ash',cap:[CAP('He heard nothing.',null,'bl')]})}],
  'boss:merrow':[
    {panels:LY.wide3(
      {id:'b03-2-eyes',px:2,art:'black_eyes',say:[{t:'You trained me, Captain.',at:[.5,.12]}],cap:[CAP('Your own old soldiers. Black eyes. They don\'t flinch. They don\'t sleep.','虚ろ')]},
      {id:'b03-3-still',art:'still_rows',cap:[CAP('His men didn\'t even blink.',null,'bl')]},
      {id:'a1-06-crow',art:'crow_post',cap:[CAP('The third crow brought no letter.',null,'bl')]})}],
  'boss:piet':[
    {panels:LY.tall2(
      {id:'b05-2-piet',art:'piet_wall',say:[{t:'The King took your wife into the palace.',at:[.4,.12]}],cap:[CAP('Piet. Six years at your shoulder.','盾持ち')]},
      {id:'b05-3-window',art:'palace_window',say:[{t:'She doesn\'t come to the window any more.',at:[.5,.88]}]})}],
  'act:Act II':[
    {panels:LY.top2(
      {id:'a2-01-sealed',art:'sealed_gate',cap:[CAP('Hollowmere had shut its gates.','第二幕　闇のホロウミア')]},
      {id:'a2-02-curfew',art:'curfew',cap:[CAP('One bell for curfew. One for the tithe.',null,'bl')]},
      {id:'a2-02b-level',alt:'curfew',shot:'start',cap:[CAP('Nobody runs. Everybody watches.',null,'bl')]})}],
  'boss:brann':[
    {panels:LY.tall2(
      {id:'b06-1-fall',alt:'brann_map',shot:'boss',cap:[CAP('General Brann. An engineer, not a soldier.','ブラン')]},
      {id:'b06-2-brann',art:'brann_map',say:[{t:'He\'d have my daughters if I opened that gate.',at:[.5,.12]}]})}],
  'boss:tithe':[
    {panels:LY.wide3(
      {id:'a3-2-ledger',art:'ledger',cap:[CAP('The tithe: one soul in ten.','十分の一')]},
      {id:'b07-3-names',art:'ledger_names',cap:[CAP('Your household. Two names already paid.',null,'bl')]},
      {id:'b3-2-cage',art:'cage_open',cap:[CAP('The debtors climb out, still holding out their coins.',null,'bl')]})}],
  'boss:choir':[
    {panels:LY.tall2(
      {id:'b2-2-mouths',art:'choir_mouths',say:[{t:'...long live the King, long live the King...',at:[.5,.86]}],cap:[CAP('Where Cassian was crowned.','戴冠の聖歌')]},
      {id:'b2-4-shut',art:'choir_mouths',v:'shut',cap:[CAP('Silence is also a note.',null,'bl')]})}],
  'boss:rook':[
    {panels:LY.wide3(
      {id:'b09-2-rook',art:'rook_kneel',say:[{t:'I saw him leave the King\'s chamber.',at:[.4,.12]}],cap:[CAP('Oswin Rook. Your oldest friend.','告白')]},
      {id:'b09-3-hostages',art:'memory',say:[{t:'He has my children too.',at:[.5,.12]}]},
      {id:'b09-4-under',px:3,art:'eye_close',say:[{t:'He swore us all to something under the palace.',at:[.5,.86]}]})}],
  'boss:gideon':[
    {panels:LY.l4(
      {id:'a2-03-gate',art:'pike_gate',cap:[CAP('The palace gate. Something hung above it.','槍の門')]},
      {id:'a2-04-horse',art:'toy_horse',v:'cobbles',cap:[CAP('Tomas\'s horse.',null,'bl')]},
      {id:'a2-05-eyes',px:3,art:'eye_close',v:'rage',sfx:{t:'怒',at:[.82,.3],size:7,red:1}},
      {id:'b10-2-torch',art:'torch_kegs',say:[{t:'The King sends his regards.',at:[.4,.12]}]})},
    {panels:LY.wide3(
      {id:'b10-3-balcony',art:'balcony',cap:[CAP('He watched from the balcony.',null,'bl')]},
      {id:'b10-4-blast',art:'blast',sfx:{t:'轟',at:[.8,.3],size:8,red:1}},
      {id:'a1-1-fall',art:'fall',fx:'down',cap:[CAP('You fell.','落')]})}]
});
/* the old story moves down a floor: its Act I opening now opens Act III; the Kiln and the Breach keep theirs as level scenes */
if(OLD_STORY.a1){ STORY['act:Act III']=OLD_STORY.a1; for(const pg of OLD_STORY.a1) for(const pn of pg.panels){
    if(pn.id==='a1-1-fall') pn.cap=[CAP('A long way down. Far enough that the light became a rumour.','落')];
    if(pn.id==='a1-4-level') pn.cap=[CAP('Act III — The Marrowdeep. Under Hollowmere there is an older city, and under that, the Pit.','第三幕　骨髄の底')]; } }
if(OLD_STORY.a4) STORY['lvl:kiln']=OLD_STORY.a4; if(OLD_STORY.a5) STORY['lvl:breach']=OLD_STORY.a5;
delete STORY['act:Act IV']; delete STORY['act:Act V'];
(function(){ const o=goLevel; goLevel=function(i){ const r=o(i); const d=LEVELS[i]; if(d&&STORY['lvl:'+d.id]&&!mgSeen('lvl:'+d.id)) setTimeout(()=>{ if(mode==='play') storyPlay('lvl:'+d.id); },400); return r; }; })();
(function(){ const o=storyName; storyName=function(id){ if(id==='prologue') return 'The frame'; if(id.startsWith('lvl:')){ const d=LEVELS.find(x=>x.id===id.slice(4)); return d?d.name:id; } return o(id); }; })();

/* the hero's voice follows the act */
(function(){ const o=bark; bark=function(k,force){ const act=L&&L.def&&L.def.act; const set=act==='Act I'?BARKS_ROAD:act==='Act II'?BARKS_CITY:null; if(set&&set[k]){ const sv=BARKS[k]; BARKS[k]=set[k]; try{ return o(k,force); } finally{ BARKS[k]=sv; } } return o(k,force); }; })();
