'use strict';
/* ===== the bosses of Acts I and II (v24) =====
   Eight new, two reused (the Tithe-Collector and the Choir of Teeth now live in the city). Each one shows a different
   reason someone serves the new King (bible: fear, greed, faith, guilt, ambition) and fights like it:
   I  Ser Odo Gallowmark, the Hound-Warden · mounted charges, hounds in waves, a net. Unhorsed at half life.
      The Three Sisters of the Fen · one life between them. They swap places through the pools. At two thirds and one
      third, the sister who is out dies, and the two left take her gift (her attack, faster). Kill order matters.
      The Lantern Preacher · oil on the floor, then fire along it; his congregation kneels round him and shields him
      (while two or more pray, he takes half).
      Captain Merrow, the First Hollowed · fights with his squad. While any of his men stand he can't be staggered and
      takes less. Kill the men first.
      Piet, the Shield-Bearer · your own style mirrored: a guard that turns light blows and answers them, rolls behind
      you, the shield bash, a three-cut chain.
   II General Brann the Mortar · stays back; bombards marked ground, a creeping barrage, mines, sappers.
      Marshal Oswin Rook · cavalry charges across the yard; unhorsed at half, then the sword your father taught you both.
      Ser Gideon Vale, the King's Hand · a fight on a bridge that gets narrower: his blows break it a section at a time.
      Beaten, he smiles and drops his torch. */
Object.assign(BOSSES,{
  odo:{name:'Ser Odo Gallowmark',jp:'猟犬番オド',sub:'The Hound-Warden. Alive or dead.',hp:900,w:28,h:34,xp:360,kit:[['charge','hounds','lance','net','lance'],['net','hounds','duel','leap','charge'],['hounds','duel','net','leap','duel']],minion:'hound'},
  sisters:{name:'The Three Sisters',jp:'沼の三姉妹',sub:'One without eyes. One without a mouth. One with too many fingers.',hp:1000,w:16,h:30,xp:420,kit:[['swap','gift','gift','gift'],['swap','gift','gift','gift','gift'],['gift','swap','gift','gift','gift']],minion:'leech'},
  preacher:{name:'The Lantern Preacher',jp:'灯の説教者',sub:'The new King hears every prayer.',hp:1000,w:16,h:32,xp:460,kit:[['oil','firewalk','flock','volley'],['oil','firewalk','flock','volley','firewalk'],['immolate','firewalk','oil','flock','immolate']],minion:'zealot'},
  merrow:{name:'Captain Merrow',jp:'最初の虚ろ　メロウ',sub:'The First Hollowed. You trained him.',hp:1050,w:16,h:32,xp:520,kit:[['advance','orders','charge','squad'],['squad','advance','charge','orders','advance'],['charge','duel','advance','squad','orders']],minion:'footman'},
  piet:{name:'Piet, the Shield-Bearer',jp:'盾持ちピート',sub:'He carried your shield for six years.',hp:1100,w:16,h:30,xp:600,kit:[['guard','combo','roll','bash'],['guard','combo','roll','bash','leap'],['combo','roll','guard','combo','bash','leap']],minion:'footman'},
  brann:{name:'General Brann the Mortar',jp:'臼砲のブラン将軍',sub:'He\'d have my daughters if I opened that gate.',hp:1150,w:20,h:34,xp:680,kit:[['barrage','mines','sappers','creep'],['barrage','creep','mines','sappers','slam'],['creep','barrage','mines','slam','barrage']],minion:'engineer'},
  rook:{name:'Marshal Oswin Rook',jp:'鉄の元帥　ルーク',sub:'Your oldest friend. He said nothing at the trial.',hp:1250,w:28,h:36,xp:780,kit:[['charge','lance','charge','trample'],['duel','leap','wave','charge','duel'],['duel','leap','duel','wave','charge']],minion:'guard'},
  gideon:{name:'Ser Gideon Vale',jp:'王の手　ギデオン',sub:'The King\'s Hand. The Red Knight.',hp:1350,w:16,h:32,xp:900,kit:[['flame','duel','pikes','sunder'],['flame','sunder','duel','charge','pikes'],['sunder','flame','duel','sunder','rain']],minion:'guard'}});
Object.assign(BOSS_PROJ,{odo:'arrow',sisters:'tooth',preacher:'orb',merrow:'arrow',piet:'knife',brann:'orb',rook:'arrow',gideon:'orb'});
Object.assign(RAIN_PROJ,{odo:'arrow',sisters:'tooth',preacher:'orb',merrow:'arrow',piet:'knife',brann:'orb',rook:'arrow',gideon:'orb'});
if(typeof BOSS_HP_MUL!=='undefined') Object.assign(BOSS_HP_MUL,{odo:1.25,sisters:1.45,preacher:1.6,merrow:1.75,piet:1.9,brann:2.1,tithe:2.4,choir:2.6,rook:2.9,gideon:3.1,mother:3.4,saint:4.3,count:4.5});
Object.assign(PHASE3_SUB,{odo:'He blows the horn for the last of the pack.',sisters:'One sister left. She has all three gifts.',preacher:'He lights himself.',merrow:'He stands alone now. He doesn\'t mind.',piet:'He stops holding back.',brann:'He brings the guns forward.',rook:'"He has my children too."',gideon:'He smiles. Something under the bridge is ticking.'});
Object.assign(BOSS_FAREWELL,{odo:'His hounds wouldn\'t leave him.',sisters:'The fen took them back.',preacher:'He heard nothing.',merrow:'His men didn\'t even blink.',piet:'"The King took your wife into the palace."',brann:'"He\'d have my daughters if I opened that gate."',rook:'"He swore us all to something under the palace."',gideon:'"The King sends his regards."'});
Object.assign(BOSS_CODEX,{odo:'b_odo',sisters:'b_sisters',preacher:'b_preacher',merrow:'b_merrow',piet:'b_piet',brann:'b_brann',rook:'b_rook',gideon:'b_gideon'});
CODEX.push(
  {id:'b_odo',k:'猟犬番',t:'Ser Odo Gallowmark',x:'Master of the royal kennels, then of the royal warrants. He hunted boar with you once and called you the only lord who could keep up. He hunts you for money now, and is ashamed of nothing except the money.'},
  {id:'b_sisters',k:'三姉妹',t:'The Three Sisters of the Fen',x:'Older than Hollowmere. They read fates in thrown bones and charge nothing, because the reading is the price. They told your father he would be remembered well.'},
  {id:'b_preacher',k:'説教者',t:'The Lantern Preacher',x:'Saint Edda\'s last priest. When the King\'s letters came he burned the old hymnals and taught the new one. Faith is a habit; he only changed what it pointed at.'},
  {id:'b_merrow',k:'メロウ',t:'Captain Merrow',x:'The first to swear. You taught him to hold a line at sixteen. He held it at Kesh, and he held it for the new King, and he is holding it still with black eyes.'},
  {id:'b_piet',k:'ピート',t:'Piet, the Shield-Bearer',x:'Six years at your shoulder. He believed the frame because he believed the court, and he believed the court because you taught him to. He was the first to tell you about her.'},
  {id:'b_brann',k:'ブラン',t:'General Brann',x:'An engineer, not a soldier. He sealed the city because the King has his daughters in the palace school. Fear is the cheapest oath; it never needs renewing.'},
  {id:'b_rook',k:'ルーク',t:'Marshal Oswin Rook',x:'Your oldest friend. He saw Cassian leave the King\'s chamber that night and said nothing at the trial, because Cassian already had his children.'},
  {id:'b_gideon',k:'ギデオン',t:'Ser Gideon Vale',x:'The King\'s Hand. He wanted rank and got it, and found it was a smaller thing than he had hoped. He lit the charges under the bridge himself and smiled while he did it.'});
for(const c of CODEX.slice(-8)) CX[c.id]=c;

/* ---------- arenas ---------- */
(function(){ const o=genArena; genArena=function(def){ const Lv=o(def); const g=Lv.g, w=Lv.w, a=def.arena; if(!a) return Lv;
  const clearPlats=()=>{ for(let y=1;y<16;y++) for(let x=1;x<w-1;x++) if(g[y][x]===2) g[y][x]=0; };
  if(a==='pools'){ for(const x0 of [5,16,27]) for(let x=x0;x<x0+4;x++){ g[16][x]=4; g[17][x]=1; } Lv.pools=[7*T,18*T,29*T]; }
  else if(a==='works'){ for(let x=26;x<28;x++) for(let y=14;y<16;y++) g[y][x]=1; }
  else if(a==='yard'){ clearPlats(); for(const [x0,y] of [[4,11],[w-8,11]]) for(let i=0;i<4;i++) g[y][x0+i]=2; }
  else if(a==='bridge'){ clearPlats(); for(let i=0;i<6;i++) g[11][(w>>1)-3+i]=2; Lv.sections=[[2,6],[w-7,w-3],[7,11],[w-12,w-8]]; }
  else if(a==='camp'){ for(let x=3;x<5;x++) g[15][x]=1; }
  return Lv; }; })();
function breakSection(i){ if(!L.sections||!L.sections[i]||L.sections[i].gone) return; const [x0,x1]=L.sections[i]; L.sections[i].gone=1;
  for(let x=x0;x<=x1;x++){ L.g[16][x]=0; L.g[17][x]=3; } /* bake the hole into the level art */
  const g=LVc; g.clearRect(x0*T,16*T,(x1-x0+1)*T,2*T); g.fillStyle='#120808'; g.fillRect(x0*T,17*T+8,(x1-x0+1)*T,8);
  for(let x=x0;x<=x1;x++){ g.fillStyle='#b0141a'; g.fillRect(x*T+3,17*T+6,2,2); }
  for(let k=0;k<26;k++) part({x:rnd(x0*T,(x1+1)*T),y:16*T,vx:rnd(-40,40),vy:rnd(-120,40),g:700,life:rnd(.6,1.2),col:pick(['#3a3a40','#6e6a68','#24242a']),size:ri(2,4)});
  AU.boom(.8); AU.slam(); shake(10); }

/* ---------- helpers ---------- */
const sideX=s=>s<0?3*T:(L.w-3)*T;
function summonFoes(t,n,opt){ opt=opt||{}; const F=FLOOR(); const out=[]; for(let i=0;i<n;i++){ const x=opt.at!=null?opt.at+rnd(-30,30):sideX(i%2?1:-1)+rnd(-10,10); const m=mkEnemyAt(t,clamp(x,2*T,(L.w-2)*T),F); m.state='chase'; m.intro=false; m.atkCd=rnd(.5,1.2); enemies.push(m); ash(m.x,m.y-8,10); out.push(m); } return out; }
function netThrow(e){ const x0=e.x+e.face*10, y0=e.y-24, tx=P.x+P.vx*.3, t=.7; const vx=(tx-x0)/t, vy=(P.y-14-y0)/t-450*t;
  fx.push({t:0,dur:2,haz:1,x:x0,y:y0,vx,vy,upd(f,dt){ if(f.done) return; f.vy+=900*dt; f.x+=f.vx*dt; f.y+=f.vy*dt; if(!P.dead&&P.ghostT<=0&&Math.abs(P.x-f.x)<16&&f.y>P.y-30&&f.y<P.y+4){ f.done=1; if(P.dash>0) return; P.grabbed=1.3; hurtPlayer(e.dmg*.5,e); toast('Netted. Roll to cut free.'); AU.chain(); } if(solidPx(f.x,f.y)) f.done=1; },
    draw(f){ if(f.done) return; const sx=f.x-camR.x, sy=f.y-camR.y; ctx.strokeStyle='#8a7a5a'; ctx.lineWidth=1; for(let i=-2;i<=2;i++){ ctx.beginPath(); ctx.moveTo(sx-10,sy+i*4); ctx.lineTo(sx+10,sy+i*4); ctx.stroke(); ctx.beginPath(); ctx.moveTo(sx+i*4,sy-10); ctx.lineTo(sx+i*4,sy+10); ctx.stroke(); } }}); }
function shell(x,delay,dmg,r){ const F=FLOOR(); r=r||28; teleRect(x-r,F-6,r*2,6,delay); setTimeout(()=>{ if(mode!=='play'||!L) return; boom(x,F-2,r+6,dmg); },delay*1000); }
function mineAt(x,dmg){ const F=FLOOR(); fx.push({t:0,dur:9,haz:1,upd(f){ if(f.blown) return; if((!P.dead&&Math.abs(P.x-x)<14&&Math.abs(P.y-F)<10&&f.t>.6)||f.t>8.5){ f.blown=1; f.t=f.dur; boom(x,F-2,34,dmg); } },
  draw(f){ const sx=Math.round(x-camR.x), sy=Math.round(F-camR.y); rect(ctx,sx-4,sy-3,8,3,'#2a2420'); rect(ctx,sx-3,sy-4,6,1,'#5a5054'); if(Math.sin(f.t*(f.t>6?24:8))>0){ ectx.fillStyle='#ff3a2a'; ectx.fillRect(sx,sy-5,1,1); addLight(x,F-5,20,.6,1,.2,.1); } }}); }

/* ---------- patterns ---------- */
(function(){ const o=startPat2; startPat2=function(e,n,p){ const F=FLOOR();
  if(n==='hounds'){ AU.roar(); toast(e.phase>2?'The horn. The last of the pack.':'He looses the hounds.'); }
  else if(n==='lance'){ p.dir=Math.sign(P.x-e.x)||1; teleRect(Math.min(e.x,e.x+p.dir*180),F-28,180,28,.6); AU.growl(); }
  else if(n==='net'){ AU.swing(false); }
  else if(n==='swap'){ AU.noise(.5,300,120,2,.3,'bandpass',.4); }
  else if(n==='gift'){ const alive=e.sis.filter(s=>s.alive), me=e.sis[e.cur]; const pool=[me.gift]; for(const s of e.sis) if(!s.alive) pool.push(s.gift,s.gift); p.gift=pick(pool); p.fast=!me.alive||e.sis.filter(s=>!s.alive).some(s=>s.gift===p.gift);
    if(p.gift==='bones'){ p.name='rain'; } else if(p.gift==='scream'){ p.name=e.phase>1?'ring2':'ring'; } else { p.name='tendril'; p.next=0; } }
  else if(n==='oil'){ p.n=e.phase>1?4:3; }
  else if(n==='firewalk'){ p.dir=Math.sign(P.x-e.x)||1; p.x=e.x; AU.cast(); }
  else if(n==='flock'){ if(enemies.filter(o=>!o.dead&&o.flockOf===e).length>=3){ p.skip=1; return; } AU.bell?AU.bell():AU.ting(); }
  else if(n==='immolate'){ AU.roar(); }
  else if(n==='advance'){ p.steps=0; AU.growl(); }
  else if(n==='orders'){ caption('"Loose."','放て'); setTimeout(()=>caption(''),1400); }
  else if(n==='squad'){ if(enemies.filter(o=>!o.dead&&o.squadOf===e).length>=2){ p.skip=1; return; } }
  else if(n==='guard'){ e.guard=1; AU.clang(); }
  else if(n==='roll'){ p.dir=Math.sign(P.x-e.x)||1; }
  else if(n==='combo'){ p.name='duel'; AU.noise(.3,600,2000,2,.2,'bandpass',.3); }
  else if(n==='bash'){ p.name='charge'; teleRect(Math.min(e.x,e.x+e.face*420),F-30,420,30,.7); AU.growl(); }
  else if(n==='barrage'){ p.xs=[]; const k=e.phase>1?6:4; for(let i=0;i<k;i++) p.xs.push(clamp(i===0?P.x:P.x+rnd(-140,140),2*T,(L.w-2)*T)); p.xs.forEach((x,i)=>shell(x,1+i*.18,e.dmg,26)); AU.boom(.3); caption('"Mark. Fire."','撃て'); setTimeout(()=>caption(''),1300); }
  else if(n==='creep'){ p.dir=Math.sign(P.x-e.x)||1; const x0=p.dir>0?3*T:(L.w-3)*T; const n_=12; for(let i=0;i<n_;i++) shell(x0+p.dir*i*36,.9+i*.22,e.dmg,20); }
  else if(n==='mines'){ for(let i=0;i<(e.phase>1?4:3);i++) mineAt(clamp(P.x+rnd(-160,160),3*T,(L.w-3)*T),e.dmg*1.1); AU.lock&&AU.lock(); toast('Mines. Watch the red lights.'); }
  else if(n==='sappers'){ if(enemies.filter(o=>!o.dead&&o.type==='engineer').length>=2){ p.skip=1; return; } }
  else if(n==='trample'){ p.name='charge'; teleRect(Math.min(e.x,e.x+e.face*500),F-34,500,34,.6); AU.roar(); }
  else if(n==='flame'){ p.dir=Math.sign(P.x-e.x)||1; AU.cast(); }
  else if(n==='pikes'){ if(enemies.filter(o=>!o.dead&&!o.boss).length>=3){ p.skip=1; return; } }
  else if(n==='sunder'){ const left=L.sections?L.sections.map((s,i)=>[s,i]).filter(([s])=>!s.gone):[]; if(!left.length){ p.name='slam'; p.tx=P.x; teleRect(p.tx-24,F-72,48,72,.8); return; } const [s,i]=left.reduce((a,b)=>Math.abs((b[0][0]+b[0][1])/2*T-P.x)<Math.abs((a[0][0]+a[0][1])/2*T-P.x)?b:a); p.sec=i; teleRect(s[0]*T,F-8,(s[1]-s[0]+1)*T,10,1.1); AU.growl(); }
  else return o(e,n,p);
  if(p.name==='rain'||p.name==='ring'||p.name==='ring2'||p.name==='tendril'){ /* handled by the core patterns */ } }; })();
(function(){ const o=runPat2; runPat2=function(e,dt,p,n,t,F){ const sp=p.fast?1.35:1;
  if(n==='hounds'){ if(!p.done&&t>=.5){ p.done=1; const k=Math.max(0,Math.min(e.phase>2?4:3,6-enemies.filter(o=>!o.dead&&!o.boss).length)); summonFoes('hound',k); } if(t>=1.2) endPat(e,1.3); return true; }
  if(n==='lance'){ if(t>=.6){ e.x+=p.dir*420*dt; if(!p.hit&&overlap({x:e.x-16,y:F-30,w:32,h:30},pBox())){ p.hit=1; hurtPlayer(e.dmg*1.2,e); } if(t>=1.05||e.x<2*T||e.x>(L.w-2)*T){ e.x=clamp(e.x,2*T,(L.w-2)*T); endPat(e,1.1); } } return true; }
  if(n==='net'){ if(!p.done&&t>=.45){ p.done=1; netThrow(e); } if(t>=1) endPat(e,1); return true; }
  if(n==='swap'){ if(t<.4) e.alpha=1-t/.4; else if(!p.moved){ p.moved=1; const opts=e.sis.map((s,i)=>i).filter(i=>i!==e.cur&&e.sis[i].alive); const nx=opts.length?pick(opts):e.cur; e.cur=nx; e.x=e.sis[nx].x; for(let i=0;i<14;i++) part({x:e.x+rnd(-8,8),y:F,vx:rnd(-40,40),vy:rnd(-160,-40),g:400,life:.6,col:'#2a3a2a'}); }
    else { e.alpha=Math.min(1,(t-.4)/.4); if(t>=.9){ e.alpha=1; endPat(e,.5); } } return true; }
  if(n==='oil'){ while(p.i<p.n&&t>=.5+p.i*.28/sp){ p.i++; lob('flask',e.x+e.face*8,e.y-28,clamp(P.x+rnd(-70,70),2*T,(L.w-2)*T),F-4,e.dmg*.9,.8); } if(t>=1.9) endPat(e,1); return true; }
  if(n==='firewalk'){ if(t>=.6){ while(p.i<14&&t>=.6+p.i*.1){ p.i++; const x=p.x+p.dir*p.i*20; if(x>T&&x<(L.w-1)*T) foeFire(x,F,e.dmg*.4,2.4); } } if(t>=2.2) endPat(e,1.1); return true; }
  if(n==='flock'){ if(!p.done&&t>=.6){ p.done=1; const ms=summonFoes('zealot',3,{at:e.x}); for(const m of ms){ m.flockOf=e; m.kneel=1; } toast('His congregation kneels round him. Break them and he\'s bare.'); } if(t>=1.4) endPat(e,1.4); return true; }
  if(n==='immolate'){ while(p.i<3&&t>=.5+p.i*.5){ p.i++; firePillar(clamp(P.x+rnd(-20,20),2*T,(L.w-2)*T),F,e.dmg*1.1); } if(t>=2.4) endPat(e,1); return true; }
  if(n==='advance'){ const bt=[.5,1.1,1.7]; if(p.steps<3&&t>=bt[p.steps]){ p.steps++; e.face=Math.sign(P.x-e.x)||e.face; e.x=clamp(e.x+e.face*36,2*T,(L.w-2)*T); shockwave(e.x+e.face*12,F,30,[e.face]); for(const m of enemies) if(m.squadOf===e&&!m.dead){ m.x=clamp(m.x+e.face*30,2*T,(L.w-2)*T); } } if(t>=2.3) endPat(e,1); return true; }
  if(n==='orders'){ while(p.i<8&&t>=.6+p.i*.12){ p.i++; const side=p.i%2?-1:1, x0=side<0?camR.x-10:camR.x+W+10; const tx=P.x+rnd(-40,40); eProj({type:'arrow',x:x0,y:F-120,vx:(tx-x0)/.9,vy:-60,g:260,dmg:e.dmg*.6,r:3,life:2,ghost:true}); } if(t>=1.9) endPat(e,1); return true; }
  if(n==='squad'){ if(!p.done&&t>=.5){ p.done=1; const ms=summonFoes('footman',e.phase>2?2:3,{at:e.x}); for(const m of ms) m.squadOf=e; toast('His men close round him. While they stand, he can\'t be broken.'); } if(t>=1.2) endPat(e,1.2); return true; }
  if(n==='guard'){ e.vx=0; if(t>=1.6){ e.guard=0; endPat(e,.6); } return true; }
  if(n==='roll'){ if(t<.45){ e.x=clamp(e.x+p.dir*360*dt,2*T,(L.w-2)*T); e.rollT=t; } else if(!p.cut){ p.cut=1; e.face=Math.sign(P.x-e.x)||e.face; AU.swing(true); hazard(e.face>0?e.x:e.x-44,e.y-30,44,30,.12,e.dmg,e); } if(t>=1) { e.rollT=null; endPat(e,.8); } return true; }
  if(n==='barrage'){ if(t>=2.2) endPat(e,1.2); return true; }
  if(n==='creep'){ if(t>=3.8) endPat(e,1.2); return true; }
  if(n==='mines'){ if(t>=.8) endPat(e,1.4); return true; }
  if(n==='sappers'){ if(!p.done&&t>=.5){ p.done=1; summonFoes('engineer',2); } if(t>=1) endPat(e,1.4); return true; }
  if(n==='flame'){ while(p.i<3&&t>=.5+p.i*.35){ p.i++; AU.swing(true); eProj({type:'wave',x:e.x+p.dir*10,y:F-1,vx:p.dir*260,vy:0,dmg:e.dmg*.9,r:7,life:2.5,ghost:true}); foeFire(e.x+p.dir*(20+p.i*14),F,e.dmg*.35,2.4); } if(t>=1.7) endPat(e,1); return true; }
  if(n==='pikes'){ if(!p.done&&t>=.5){ p.done=1; summonFoes('guard',2); caption('"Hold him."','押さえろ'); setTimeout(()=>caption(''),1200); } if(t>=1.1) endPat(e,1.3); return true; }
  if(n==='sunder'){ if(!p.hit&&t>=1.1){ p.hit=1; hazard(L.sections[p.sec][0]*T,F-30,(L.sections[p.sec][1]-L.sections[p.sec][0]+1)*T,30,.15,e.dmg*1.2,e); breakSection(p.sec); } if(t>=1.8) endPat(e,1.2); return true; }
  return o(e,dt,p,n,t,F); }; })();

/* ---------- per-boss rules ---------- */
(function(){ const o=spawnBoss; spawnBoss=function(key){ const e=o(key);
  if(key==='sisters'){ const xs=(L.pools||[7*T,18*T,29*T]); e.sis=[{n:'The Eyeless',gift:'bones',x:xs[0],alive:1},{n:'The Mouthless',gift:'scream',x:xs[1],alive:1},{n:'The Many-Fingered',gift:'grasp',x:xs[2],alive:1}]; e.cur=2; e.x=xs[2]; e.deaths=0; }
  if(key==='odo'||key==='rook') e.mounted=1;
  if(key==='brann'){ e.x=(L.w-4)*T; }
  return e; }; })();
(function(){ const o=bossIdle; bossIdle=function(e,dt){ const F=FLOOR();
  if(e.kind==='sisters'){ e.vx=0; e.vy+=900*dt; moveBody(e,dt); e.face=Math.sign(P.x-e.x)||e.face; return; }
  if(e.kind==='brann'){ e.face=Math.sign(P.x-e.x)||e.face; const want=(L.w-4)*T; e.vx=approach(e.vx,Math.abs(P.x-e.x)<70?-e.face*40:Math.sign(want-e.x)*20,200*dt); e.vy+=900*dt; moveBody(e,dt); return; }
  if(e.kind==='odo'||e.kind==='rook'){ if(e.mounted){ const dx=P.x-e.x; e.face=Math.sign(dx)||e.face; e.vx=approach(e.vx,Math.abs(dx)<90?-e.face*70:Math.abs(dx)>220?e.face*70:0,300*dt); e.vy+=900*dt; moveBody(e,dt); return; } }
  if(e.kind==='piet'||e.kind==='gideon'||e.kind==='merrow'||e.kind==='preacher'||e.kind==='odo'||e.kind==='rook'){ const dx=P.x-e.x; e.face=Math.sign(dx)||e.face; const sp=e.kind==='piet'?70:e.kind==='preacher'?24:50, keep=e.kind==='preacher'?120:60; e.vx=approach(e.vx,Math.abs(dx)>keep?e.face*sp:e.kind==='preacher'?-e.face*sp:0,300*dt); e.vy+=900*dt; moveBody(e,dt); return; }
  return o(e,dt); }; })();
/* the sisters die one at a time; the mounted come down at half */
(function(){ const o=updBoss; updBoss=function(e,dt){
  if(e.kind==='sisters'&&!e.dead&&!e.intro){ const k=e.hp/e.maxhp; const want=k<.33?2:k<.66?1:0; if(e.deaths<want&&e.state!=='roar'){ e.deaths++; const s=e.sis[e.cur]; s.alive=0; e.pat=null; fx=fx.filter(f=>!f.haz);
      showBossName(s.n+' sinks.','沈む',`The others take her gift: ${s.gift==='bones'?'the bones fall faster':s.gift==='scream'?'the silent scream comes twice':'the fingers reach further'}.`); AU.scream(); shake(8); for(let i=0;i<30;i++) part({x:e.x+rnd(-8,8),y:FLOOR()-rnd(0,30),vx:rnd(-80,80),vy:rnd(-200,0),g:500,life:.8,col:pick(['#2a3a2a','#a9b46c','#2a1c30'])});
      const opts=e.sis.map((x,i)=>i).filter(i=>e.sis[i].alive); if(opts.length){ e.cur=pick(opts); e.x=e.sis[e.cur].x; } e.state='roar'; e.st=1.4; } }
  if((e.kind==='odo'||e.kind==='rook')&&e.mounted&&e.phase>1){ e.mounted=0; e.w=14; e.h=30; e.stun=0; e.state='roar'; e.st=1.6; dust(e.x,FLOOR(),24); AU.slam(); shake(10); for(let i=0;i<20;i++) bleed(e.x,e.y-14,1,R()<.5?1:-1,1.4);
    showBossName(e.name,e.jp,e.kind==='odo'?'Unhorsed. He draws his hunting sword.':'Unhorsed. The sword your father taught you both.'); }
  if(e.kind==='piet'&&e.guard&&!e.pat) e.guard=0;
  return o(e,dt); }; })();
(function(){ const o=bossPhase; bossPhase=function(e){ if(['odo','rook','sisters'].includes(e.kind)) return; return o(e); }; })();
/* cover: the congregation, the squad, the guard */
(function(){ const o=dmgEnemy; dmgEnemy=function(e,d,crit,dir,kb,heavy,launch,stun){ if(e&&e.boss&&!e.dead){
    if(e.kind==='preacher'&&enemies.filter(m=>!m.dead&&m.flockOf===e).length>=2){ d=Math.round(d*.5); if(R()<.3) sparks(e.x,e.y-26,3,'#ffd27a'); }
    if(e.kind==='merrow'&&enemies.some(m=>!m.dead&&m.squadOf===e)){ d=Math.round(d*.6); }
    if(e.kind==='piet'&&e.guard&&Math.sign(P.x-e.x)===e.face&&!heavy){ AU.clang(); sparks(e.x+e.face*10,e.y-18,8,'#fff1c8'); num(e.x,e.y-e.h-6,0,'#8a8078'); freeze=Math.max(freeze,.05);
      if(!e._ans||time-e._ans>.6){ e._ans=time; hazard(e.face>0?e.x:e.x-40,e.y-28,40,28,.1,e.dmg*.8,e); P.vx=-Math.sign(e.x-P.x)*200; } if(!e._told){ e._told=1; toast('He reads you. Get behind the shield, or hit it heavy.'); } return; } }
  return o(e,d,crit,dir,kb,heavy,launch,stun); }; })();
(function(){ const o=bossStagAdd; bossStagAdd=function(e,d,heavy,crit){ if(e.kind==='merrow'&&enemies.some(m=>!m.dead&&m.squadOf===e)){ if(!e._told){ e._told=1; toast('His men don\'t let him fall. Kill them first.'); } return; } return o(e,d,heavy,crit); }; })();
/* the zealots kneel and pray instead of fighting while the preacher lives */
(function(){ const o=updEnemy; updEnemy=function(e,dt){ if(e.kneel&&e.flockOf&&!e.flockOf.dead&&!e.dead&&!(e.stun>0)){ e.vx=0; e.vy+=900*dt; moveBody(e,dt); e.anim+=dt; e.flash-=dt; e.state='kneel'; return; } if(e.kneel&&e.flockOf&&e.flockOf.dead){ e.kneel=0; } return o(e,dt); }; })();

/* ---------- Gideon: the bridge goes up ---------- */
(function(){ const o=bossDefeated; bossDefeated=function(e){ o(e); if(e.kind!=='gideon') return; L.bridgeFall={t:0}; chests.length=0; L.noExit=true; }; })();
(function(){ const o=update; update=function(dt){ o(dt); const b=L&&L.bridgeFall; if(!b||b.started) return; if(typeof MG!=='undefined'&&MG.on) return; b.t+=dt; if(b.t>3.4){ b.started=1; bridgeFall(); } }; })();
function bridgeFall(){ for(const e of enemies) if(!e.dead) e.stun=99;
  playCut([{dur:2,cap:'He smiled, and let the torch fall.',jp:'松明が落ちた。',cam:{x:L.w*T/2,y:P.y-40},fn:()=>{ AU.ting(); }},
    {dur:1.8,cap:'Your brother watched from the balcony.',jp:'兄は露台から見ていた。',zoom:1.1,cam:{x:L.w*T-80,y:P.y-120}},
    {dur:2.4,cap:'The bridge went up under you.',jp:'橋が吹き飛んだ。',fn:()=>{ AU.boom(1.4); AU.slam(); impactT=.25; for(let i=0;i<L.sections.length;i++) breakSection(i); },tick:(dt)=>{ shake(10); P.y+=dt*120; }},
    {dur:1,cap:'',fade:0,fn:()=>{ U.uWhite.value=1; }}],()=>{ fadeTarget=1; goLevel(lvlIdx+1); }); }

/* ---------- sprites ---------- */
function horse(c,t,run,col){ const g=run?Math.sin(t*14)*2:Math.sin(t*2)*.5; col=col||'#2a2420';
  rect(c,-14,-20,26,10,col); rect(c,9,-27,5,9,col); rect(c,11,-31,8,6,col); rect(c,17,-29,2,2,'#140c0c'); rect(c,-16,-20,3,8,mixc(col,'#000000',.3));
  for(const [x,o] of [[-12,g],[-7,-g],[5,-g],[9,g]]) rect(c,x,-10+Math.min(0,o),2,10-Math.min(0,o),mixc(col,'#000000',.4)); rect(c,-12,-21,22,1,mixc(col,'#ffffff',.15)); }
function dOdo(c,e){ const t=e.anim, p=e.pat&&e.pat.name; if(e.mounted){ horse(c,t,p==='charge'||p==='lance','#2a2018'); c.save(); c.translate(0,-18); }
  rect(c,-5,-16,10,12,'#5a4a36'); c.fillStyle='#3a2a1a'; c.beginPath(); c.moveTo(-7,-17); c.lineTo(7,-17); c.lineTo(8,-6); c.lineTo(-8,-6); c.fill(); for(let i=0;i<5;i++) rect(c,-7+i*3,-7,2,2,'#2a1e12');
  if(!e.mounted){ rect(c,-4,-4,3,8,'#2a2018'); rect(c,1,-4,3,8,'#2a2018'); }
  rect(c,-3,-22,6,6,'#c8a890'); rect(c,-5,-25,10,4,'#3a2a1a'); rect(c,-6,-23,3,3,'#3a2a1a'); rect(c,1,-20,1,1,'#120c0c'); rect(c,-2,-18,5,1,'#5a3a2a');
  const arm=p==='lance'?0:p==='net'?-1.4:p==='duel'?Math.sin(t*20)*.8:.4; c.save(); c.translate(4,-12); c.rotate(arm); if(e.mounted){ rect(c,0,-.5,30,1,'#5a4a30'); rect(c,29,-1.5,4,3,'#cfc6b2'); } else { rect(c,0,-1,14,2,'#a8a4a0'); } c.restore();
  if(e.mounted) c.restore(); }
function dSister(c,e,i,dim){ const t=e.anim+i; const col=['#2a1c30','#3a2a40','#1e2a1c'][i]; c.fillStyle=col; c.beginPath(); c.moveTo(-8,0); c.lineTo(-5,-22); c.lineTo(5,-24); c.lineTo(9,0); c.fill();
  for(let k=0;k<5;k++) rect(c,-7+k*3,-2,1,3+(k%2)*2,'#4a2f4f'); rect(c,-3,-30,7,7,'#a9b46c'); rect(c,-5,-31,11,3,'#141012'); rect(c,-6,-29,3,16,'#141012');
  if(i===0){ rect(c,-2,-28,5,2,'#6a7a4a'); } else { rect(c,-1,-28,1,1,'#120c0c'); rect(c,2,-28,1,1,'#120c0c'); }
  if(i===1){ rect(c,-2,-25,5,1,'#a9b46c'); } else rect(c,-1,-25,3,1,'#2a1210');
  const n=i===2?7:4; for(let k=0;k<n;k++) rect(c,5+k*.6,-16+k*1.2+Math.sin(t*3+k)*1,4+(i===2?2:0),1,'#a9b46c'); if(dim){ c.fillStyle='rgba(20,26,20,.55)'; c.fillRect(-9,-32,19,32); } }
function dSisters(c,e){ dSister(c,e,e.cur,false); }
function dPreacher(c,e){ const t=e.anim, p=e.pat&&e.pat.name; c.fillStyle='#2a1e18'; c.beginPath(); c.moveTo(-8,0); c.lineTo(-5,-24); c.lineTo(5,-24); c.lineTo(8,0); c.fill(); rect(c,-5,-24,10,1,'#6a4a2a'); rect(c,-1,-23,2,10,'#b08a3a');
  rect(c,-3,-31,6,7,'#c8a890'); rect(c,-2,-28,1,1,'#120c0c'); rect(c,1,-28,1,1,'#120c0c'); rect(c,-2,-26,4,1,'#5a2a1a'); rect(c,-4,-33,8,2,'#2a1e18');
  const up=p==='oil'||p==='flock'||p==='immolate'; c.save(); c.translate(4,-20); c.rotate(up?-2.6:-.3); rect(c,0,-.5,12,1,'#2a1e18'); rect(c,10,-3,4,6,'#5a4a30'); c.restore();
  if(e.phase>2){ for(let i=0;i<4;i++) rect(c,-6+i*4,-30-Math.abs(Math.sin(t*9+i))*6,2,6,'#ff8a3a'); } }
function dMerrow(c,e){ const t=e.anim, wk=Math.round(Math.sin(t*3)*Math.min(2,Math.abs(e.vx)/10)); rect(c,-5+wk,-11,4,11,'#2a2e34'); rect(c,1-wk,-11,4,11,'#32363c'); rect(c,-7,-25,14,14,'#4a4642'); rect(c,-7,-25,14,1,'#8a847c'); rect(c,-7,-18,14,1,'#2a2420');
  rect(c,-5,-33,10,8,'#3a3a40'); rect(c,-6,-33,12,1,'#8a847c'); rect(c,-1,-30,5,2,'#000'); rect(c,-2,-37,4,4,'#5a1414');
  rect(c,-12,-28,6,22,'#3a2a20'); rect(c,-12,-28,6,1,'#6a5a3a'); rect(c,-11,-19,4,3,'#5a1414');
  const p=e.pat&&e.pat.name, sw=p==='duel'?Math.sin(t*20)*.9:p==='charge'?0:.3; c.save(); c.translate(6,-21); c.rotate(sw); rect(c,0,-1,18,2,'#a8a4a0'); rect(c,-1,-2,3,4,'#3a2a20'); c.restore(); }
function dPiet(c,e){ const t=e.anim, p=e.pat&&e.pat.name, rl=e.rollT!=null; c.save(); if(rl){ c.translate(0,-10); c.rotate((e.rollT||0)*14*(e.face>0?1:-1)); c.translate(0,10); }
  const wk=Math.round(Math.sin(t*3)*Math.min(2,Math.abs(e.vx)/10)); rect(c,-4+wk,-10,3,10,'#3a3a40'); rect(c,1-wk,-10,3,10,'#42424a'); rect(c,-6,-22,12,12,'#5a5a62'); rect(c,-6,-22,12,1,'#9a9aa2'); rect(c,-6,-16,12,1,'#2a2a30');
  rect(c,-3,-28,6,6,'#d8c0a0'); rect(c,-4,-30,8,3,'#6a4a2a'); rect(c,1,-26,1,1,'#120c0c'); rect(c,-1,-24,3,1,'#8a5a4a');
  const gd=e.guard||p==='charge'; const sx=gd?6:-9; rect(c,sx,-30,5,28,'#4a3a2a'); rect(c,sx,-30,5,1,'#8a7a5a'); rect(c,sx+1,-18,3,5,'#b0141a'); rect(c,sx+2,-27,1,22,'#2a1e14');
  const sw=p==='duel'?Math.sin(t*20)*.9:gd?1.2:.4; c.save(); c.translate(gd?-2:5,-18); c.rotate(sw); rect(c,0,-1,15,2,'#cfc6b2'); rect(c,-1,-2,3,4,'#4a3a2a'); c.restore(); c.restore(); }
function dBrann(c,e){ const t=e.anim; rect(c,-6,-12,5,12,'#3a2e22'); rect(c,1,-12,5,12,'#3a2e22'); rect(c,-9,-28,18,16,'#5a4430'); rect(c,-9,-28,18,1,'#8a6a32'); rect(c,-10,-20,20,2,'#2a1e14'); for(let i=0;i<3;i++) rect(c,-7+i*5,-26,2,2,'#b08a3a');
  rect(c,-4,-35,9,8,'#c8a890'); rect(c,-5,-37,11,3,'#3a3236'); rect(c,1,-32,1,1,'#120c0c'); rect(c,3,-32,1,1,'#120c0c'); rect(c,-2,-29,6,1,'#5a3a2a'); for(let i=0;i<3;i++) rect(c,-5+i*4,-31+i,1,1,'rgba(220,220,255,.5)');
  /* the mortar beside him */ rect(c,12,-10,12,10,'#2a2420'); c.save(); c.translate(16,-8); c.rotate(-.9); rect(c,0,-4,16,8,'#3a3438'); rect(c,15,-4,2,8,'#1a1418'); c.restore(); if(e.pat&&(e.pat.name==='barrage'||e.pat.name==='creep')&&Math.sin(t*20)>.5){ rect(c,24,-24,4,4,'#ffd27a'); } }
function dRook(c,e){ const t=e.anim, p=e.pat&&e.pat.name; if(e.mounted){ horse(c,t,p==='charge'||p==='lance','#5a4a3a'); c.save(); c.translate(0,-18); }
  rect(c,-6,-16,12,13,'#6a6a72'); rect(c,-6,-16,12,1,'#a8a8b0'); if(!e.mounted){ rect(c,-4,-3,3,7,'#3a3a40'); rect(c,1,-3,3,7,'#3a3a40'); }
  rect(c,-4,-24,8,8,'#5a5a62'); rect(c,-4,-24,8,1,'#a8a8b0'); rect(c,-1,-21,4,1,'#050304'); rect(c,-1,-30,2,6,'#e8e0d0'); rect(c,-3,-27,6,1,'#cfc6b2');
  const sw=p==='duel'?Math.sin(t*20)*.9:p==='lance'||p==='charge'?0:.4; c.save(); c.translate(5,-12); c.rotate(sw); if(e.mounted){ rect(c,0,-.5,32,1,'#5a4a30'); rect(c,31,-1.5,4,3,'#cfc6b2'); } else { rect(c,0,-1,20,2,'#cfc6b2'); rect(c,-1,-2,3,4,'#3a2a20'); } c.restore(); if(e.mounted) c.restore(); }
function dGideon(c,e){ const t=e.anim, p=e.pat&&e.pat.name, wk=Math.round(Math.sin(t*3)*Math.min(2,Math.abs(e.vx)/10)); rect(c,-4+wk,-11,3,11,'#5a0a0e'); rect(c,1-wk,-11,3,11,'#6a0e12'); rect(c,-7,-25,14,14,'#a01418'); rect(c,-7,-25,14,1,'#e04848'); rect(c,-7,-18,14,1,'#5a0a0e'); rect(c,-10,-26,4,6,'#a01418'); rect(c,6,-26,4,6,'#a01418');
  rect(c,-3,-32,7,7,'#d8c0a0'); rect(c,-4,-34,9,3,'#2a1a10'); rect(c,1,-29,1,1,'#120c0c'); rect(c,-1,-27,4,1,'#8a3a2a'); rect(c,3,-27,1,1,'#120c0c');
  const sw=p==='duel'?Math.sin(t*20)*.9:p==='flame'?Math.sin(t*10)*1.2:p==='sunder'?-2.2+Math.min(2.6,(e.pat.t||0)*2.4):.3; c.save(); c.translate(6,-21); c.rotate(sw); rect(c,0,-1,20,2,'#cfc6b2'); rect(c,-1,-2,3,4,'#5a0a0e'); c.restore();
  rect(c,-12,-20,2,10,'#3a2a1a'); }
Object.assign(BDRAW,{odo:dOdo,sisters:dSisters,preacher:dPreacher,merrow:dMerrow,piet:dPiet,brann:dBrann,rook:dRook,gideon:dGideon});
/* the sisters who aren't out wait in their pools */
(function(){ const o=drawBossOverlays; drawBossOverlays=function(){ o(); for(const e of enemies){ if(!e.boss||e.kind!=='sisters'||e.dead) continue;
  e.sis.forEach((s,i)=>{ if(i===e.cur||!s.alive) return; blit(g=>dSister(g,e,i,true),s.x,FLOOR()+6,Math.sign(P.x-s.x)||1); });
  if(e.kind==='preacher') {} } }; })();
(function(){ const o=drawBoss; drawBoss=function(e){ o(e); if(e.kind==='preacher'&&!e.dead&&enemies.filter(m=>!m.dead&&m.flockOf===e).length>=2){ const sx=e.x-camR.x, sy=e.y-camR.y; ectx.strokeStyle=`rgba(255,210,120,${(.35+.25*Math.sin(time*6)).toFixed(2)})`; ectx.lineWidth=1; ectx.beginPath(); ectx.ellipse(sx,sy-18,14,22,0,0,Math.PI*2); ectx.stroke(); }
  if(e.kind==='piet'&&e.guard&&!e.dead){ const sx=e.x+e.face*9-camR.x, sy=e.y-16-camR.y; ectx.fillStyle=`rgba(255,240,200,${(.3+.3*Math.sin(time*10)).toFixed(2)})`; ectx.fillRect(Math.round(sx),Math.round(sy-12),1,26); }
  if(e.kind==='gideon'&&!e.dead){ addLight(e.x-11,e.y-22,60,.8,1,.55,.25); ectx.fillStyle='#ffb060'; ectx.fillRect(Math.round(e.x-11-camR.x),Math.round(e.y-34-camR.y+Math.sin(time*13)),2,3); } }; })();
for(const k of ['odo','sisters','preacher','merrow','piet','brann','rook','gideon']) PORTRAIT[k]=(g,t)=>{ g.save(); g.translate(170+t*6,62); g.scale(1.8,1.8); g.imageSmoothingEnabled=false; const e={anim:t*2,phase:1,state:'idle',st:0,face:-1,vx:0,vy:0,w:BOSSES[k].w,h:BOSSES[k].h,pat:null,alpha:1,mounted:k==='odo'||k==='rook',sis:[{},{},{}],cur:0,kind:k}; try{ BDRAW[k](g,e); }catch(_){} g.restore(); };
