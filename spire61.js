'use strict';
/* ===== v54: the Crowspire, the endless climb (spire61.js) =====
   BT (18 Nov): "endgame mode ... for any level to do from the house ... an endless tower and the higher you get the more
   loot you get ... every level gets 10x harder ... a good scale so it's worth it to go higher for better rolls."

   The place. Ilse: "The crows bring things up from the Pit now." They have been doing it for a long time. Behind the
   Rope-House they have built a tower out of scaffold, bone and stolen timber, and every crow that comes up out of the
   dark carries something to it. The higher the nest, the older the hoard. It has no top; they are still building.
   You climb it from the rope ladder in the Rope-House, at any level.

   The climb. Every floor is one sealed room: three waves, then the floor falls quiet and the stair opens. At the stair
   you choose: climb on, or climb down. Every fifth floor is a roost: a Keeper waits there, and next time you can start
   the climb from it.

   The prize (BT, a follow-up the same morning): one chest, the Crow's Hoard, whose odds grow with every floor cleared.
   Nothing drops on the floors. Climb down and the hoard falls through the hatch into the Rope-House; fall, or jump from
   a floor still fighting, and the crows keep it. Leaving the game mid-climb counts as falling.

   The scale (all numbers in SPIRE below). Ten times harder every ten floors, not every floor: at ten times a floor,
   floor 4 would be a thousand times floor 1 and no gear could follow. Foe life ×1.26 a floor (×10 every 10), damage
   ×1.08 a floor (×2.2 every 10), more of them and more elites.
   Floor 1 is set two levels under you, like the campaign, so anyone can start.
   The hoard's scale is a log curve on the floor: floor 1 a grey coffer, floor 10 between a reliquary and a tithe hoard,
   floor 1000 an even chance of an abyssal, with every stat's grade and the item level climbing alongside (HOARD_R/G). */

const SPIRE={
  life:1.26, dmg:1.08, xp:.15, gold:.25,              /* per floor, compounding for life and damage */
  roost:5,                                             /* the hoard's odds are HOARD_R and HOARD_G, further down */
  waves:3, champ:.012, rare:.01,
};
const SP_NAME='The Crowspire', SP_JP='鴉の塔';

/* ---------- the level slot: one def, re-dressed every floor ---------- */
const SP_N0=DEPTH_N(); /* the campaign's own depth, so pushing another level doesn't move dep() for the rest of the game */
const SPIRE_DEF={id:'crowspire',kind:'tower',name:SP_NAME,jp:SP_JP,act:SP_NAME,pal:'cabin',env:'bone',bg:[],enemies:{ghoul:1}};
LEVELS.push(SPIRE_DEF); const SPIRE_IDX=LEVELS.length-1;
EPIGRAPH.crowspire={k:'鴉',r:'karasu',t:'What the Pit swallows, the crows bring up. What the crows bring up, they keep.'};
const SPT={on:false,floor:0,ml:1,seed:0,cleared:0,hcase:null,state:0,wave:0,list:[],next:0,t:0,from:null,crows:[],took:0};
const inSpire=()=>!!(SPT.on&&L&&L.def===SPIRE_DEF);
function spMeta(){ if(!META.spire) META.spire={best:0}; return META.spire; }
const spLife=f=>Math.pow(SPIRE.life,Math.max(0,f-1)), spDmg=f=>Math.pow(SPIRE.dmg,Math.max(0,f-1));
const spRoost=f=>f>0&&f%SPIRE.roost===0;
const spX=v=>v>=100?Math.round(v).toLocaleString('en-US'):v>=10?v.toFixed(0):v.toFixed(1);
const spPct=v=>v>=10?v.toFixed(0)+'%':v>=1?v.toFixed(1)+'%':v.toFixed(2)+'%';
function kanjiNum(n){ const d='〇一二三四五六七八九'; if(n<10) return d[n]; if(n<100){ const t=Math.floor(n/10), o=n%10; return (t>1?d[t]:'')+'十'+(o?d[o]:''); } return String(n).split('').map(c=>d[+c]).join(''); }
const ORD=['','First','Second','Third','Fourth','Fifth','Sixth','Seventh','Eighth','Ninth','Tenth','Eleventh','Twelfth'];
function keeperName(f){ const n=f/SPIRE.roost; return n<ORD.length?`Keeper of the ${ORD[n]} Roost`:`Keeper of Roost ${n}`; }

/* depth and monster level inside the spire: floor 1 is your own level */
dep=(function(o){ return function(i){ const li=i==null?lvlIdx:i; if(li===SPIRE_IDX) return clamp(SPT.ml/10,0,10); return Math.round(li*10/Math.max(1,SP_N0)*10)/10; }; })(dep);
mlvl=(function(o){ return function(i){ const li=i==null?lvlIdx:i; if(li===SPIRE_IDX) return SPT.ml; return o(i); }; })(mlvl);
function spTier(ml){ let t=0; for(let i=1;i<DIFFS.length;i++) if(DIFFS[i].lo<=ml) t=i; return t; } /* the tier whose band holds this level (Pilgrim below 20); elites come from the floor, not the tier */
eliteChance=(function(o){ return function(k){ const b=o(k); if(!inSpire()) return b; const f=SPT.floor; return k==='champ'?Math.min(.55,b+f*SPIRE.champ):k==='rare'?Math.min(.4,b+f*SPIRE.rare):b; }; })(eliteChance);

/* ---------- the floor: one sealed room, a stair at the far end ---------- */
const SP_W=40, SP_H=18;
const SP_LAYOUTS=[
  {n:'scaffold',p:[[6,12,6],[28,12,6],[15,8,10]]},
  {n:'two tiers',p:[[4,11,10],[26,11,10],[17,7,6]]},
  {n:'broken stair',p:[[5,13,4],[11,11,4],[17,9,5],[24,11,4],[30,13,4]]},
  {n:'pillars',p:[[9,9,6],[25,9,6]],pil:[[14,3],[25,3]]},
  {n:'nests',p:[[3,10,5],[12,12,5],[22,12,5],[31,10,5],[16,7,8]]},
];
(function(){ const o=genLevel; genLevel=function(def,seed){ if(def.kind!=='tower') return o(def,seed);
  return withSeed(seed,()=>{ const w=SP_W,h=SP_H,g=newGrid(w,h,1); for(let y=2;y<=15;y++) for(let x=1;x<w-1;x++) g[y][x]=0;
    const lay=SP_LAYOUTS[(SPT.floor+(SPT.seed%SP_LAYOUTS.length))%SP_LAYOUTS.length];
    for(const [x,y,n] of lay.p) for(let i=0;i<n;i++) if(x+i>1&&x+i<w-2) g[y][x+i]=2;
    for(const [x,hh] of lay.pil||[]) for(let y=16-hh;y<=15;y++){ g[y][x]=1; g[y][x+1]=1; }
    /* a lip of stone above the stair, and two steps in the ceiling so it doesn't read as a box */
    for(let x=w-6;x<w-1;x++) g[2][x]=1; for(const x of [9,10,29,30]) g[2][x]=1;
    const torches=[{x:3,y:11},{x:w-4,y:11},{x:13,y:6},{x:w-14,y:6}];
    return {w,h,g,spawns:[],chests:[],torches,fg:[],plats:[],pends:[],def,arena:true,surface:false,spawn:{x:3*T,y:16*T},exit:{x:w-3,y:16},rooms:[],env:def.env,jets:[],winds:[],nests:[],arenas:[],stones:[],decor:[],layout:lay.n}; }); }; })();
function spSpots(){ const out=[]; for(let x=7;x<SP_W-3;x++) for(let y=3;y<=16;y++){ const v=tileAt(x,y); if((v===1||v===2)&&tileAt(x,y-1)===0&&tileAt(x,y-2)===0) out.push([x,y]); } return out; }

/* the tower seen from inside: night sky through tall windows, and the ground falling away as you climb */
function bakeSpireBG(f){ const far=document.createElement('canvas'); far.width=960; far.height=320; const g=far.getContext('2d');
  const sk=g.createLinearGradient(0,0,0,320); sk.addColorStop(0,'#07040a'); sk.addColorStop(.55,f>12?'#1a0a12':'#22100e'); sk.addColorStop(1,f>12?'#3a1410':'#4a1a0e'); g.fillStyle=sk; g.fillRect(0,0,960,320);
  for(let i=0;i<120;i++){ g.fillStyle=`rgba(230,220,200,${rnd(.08,.45).toFixed(2)})`; g.fillRect(ri(0,959),ri(0,170),1,1); }
  g.fillStyle='rgba(255,60,40,.18)'; g.beginPath(); g.ellipse(620,48,170,12,-.05,0,Math.PI*2); g.fill(); g.fillStyle='rgba(255,90,60,.3)'; g.beginPath(); g.ellipse(620,48,90,4,-.05,0,Math.PI*2); g.fill();
  /* the ground far below: the higher the floor, the lower and smaller the world */
  const hz=Math.min(352,236+f*5), sc=1/(1+f*.07);
  if(hz<330){ g.fillStyle='#0c0708'; g.beginPath(); g.moveTo(0,hz); for(let x=0;x<=960;x+=24) g.lineTo(x,hz-6-Math.abs(Math.sin(x*.013+1.3))*16*sc-hsh(x,7)*6*sc); g.lineTo(960,320); g.lineTo(0,320); g.fill();
    g.fillStyle='#020102'; g.beginPath(); g.ellipse(470,hz+18*sc,150*sc,26*sc,0,0,Math.PI*2); g.fill(); g.fillStyle='rgba(255,70,40,.28)'; g.beginPath(); g.ellipse(470,hz+18*sc,90*sc,10*sc,0,0,Math.PI*2); g.fill();
    g.fillStyle='#ffcf8a'; g.fillRect(470-150*sc-14,hz-3,2,2); }
  if(f>=6){ const k=clamp((f-6)/10,0,1); for(let i=0;i<9;i++){ const cx=i*120+hsh(i,f)*60, cy=262+hsh(i,3)*30-k*50; g.fillStyle=`rgba(70,40,40,${(.25+k*.35).toFixed(2)})`; g.beginPath(); g.ellipse(cx,cy,110,14+k*10,0,0,Math.PI*2); g.fill(); } }
  for(let i=0;i<14;i++){ const x=ri(0,950), y=ri(30,200), s=hsh(i,f)>.5?1:2; g.fillStyle='#050304'; g.fillRect(x,y,3*s,1*s); g.fillRect(x-2*s,y-s,2*s,s); g.fillRect(x+3*s,y-s,2*s,s); }
  const mid=document.createElement('canvas'); mid.width=1200; mid.height=320; const m=mid.getContext('2d'); const st=(PALS.cabin&&PALS.cabin.stone)||['#3a2c22','#43332a'];
  m.fillStyle='#1a120e'; m.fillRect(0,0,1200,320);
  for(let y=0;y<320;y+=8) for(let x=(y/8)%2?0:-12;x<1200;x+=24){ m.fillStyle=st[Math.floor(hsh(x,y)*st.length)]; m.globalAlpha=.55; m.fillRect(x,y,23,7); } m.globalAlpha=1;
  for(let i=0;i<4;i++){ const wx=60+i*300, wy=46, ww=96, wh=170; m.clearRect(wx,wy+ww/2,ww,wh-ww/2); m.save(); m.globalCompositeOperation='destination-out'; m.beginPath(); m.arc(wx+ww/2,wy+ww/2,ww/2,Math.PI,0); m.fill(); m.restore();
    m.fillStyle='#0e0806'; m.fillRect(wx-6,wy+wh,ww+12,8); for(const bx of [wx+ww/3,wx+2*ww/3]) m.fillRect(bx,wy+4,3,wh-4); m.fillRect(wx,wy+ww/2+30,ww,3);
    /* a nest on the sill */ for(let k=0;k<26;k++){ m.fillStyle=pick(['#2a1a10','#3a2414','#1a100a','#4a3020']); const a=rnd(0,Math.PI), r=rnd(10,26); m.fillRect(wx+ww/2+Math.cos(a)*r*1.6-6,wy+wh-2-Math.sin(a)*r*.35,ri(8,16),1); }
    if(hsh(i,f)>.4){ m.fillStyle='#d8b24a'; m.fillRect(wx+ww/2+ri(-14,14),wy+wh-6,2,2); } }
  for(let i=0;i<8;i++){ const x=ri(0,1199); m.fillStyle='rgba(106,90,64,.6)'; m.fillRect(x,0,1,ri(40,140)); }
  return {far,mid}; }

/* ---------- entering a floor ---------- */
function spRoster(f){ const pool=LEVELS.filter(d=>d.kind==='dungeon'&&d.enemies); return pool[(f*7+SPT.seed)%pool.length]; }
function spDress(f){ const src=spRoster(f); SPT.from=src;
  Object.assign(SPIRE_DEF,{name:`${SP_NAME} · Floor ${f}`,jp:`${SP_JP}　${kanjiNum(f)}階`,pal:src.pal,env:src.env==='water'?'bone':src.env||'bone',enemies:src.enemies,packs:src.packs}); }
function spFloorLine(f){ return `Floor ${f} · Lv ${SPT.ml} · foes life ×${spX(spLife(f))} · damage ×${spX(spDmg(f))}`; }
function enterFloor(f){ SPT.floor=f; SPT.state=0; SPT.wave=0; SPT.list=[]; SPT.next=0; SPT.t=0; spDress(f); ngp=spTier(SPT.ml);
  loadLevel(SPIRE_IDX); BG=withSeed(SPT.seed+f*31,()=>bakeSpireBG(f)); L.locked=true; L.noExit=false;
  SPT.crows=withSeed(SPT.seed+f,()=>spSpots().filter(()=>R()<.12).slice(0,9).map(([x,y])=>({x:x*T+8+ri(-4,4),y:y*T,vx:0,vy:0,st:0,t:R()*6})));
  mode='play'; hud.hidden=false; $('#actTxt').textContent=spFloorLine(f);
  if(typeof MUS!=='undefined') MUS.setMood('deep'); AU.door();
  showBossName(spRoost(f)?`Floor ${f} · a roost`:`Floor ${f}`,`${kanjiNum(f)}階`,`Foes: life ×${spX(spLife(f))} · damage ×${spX(spDmg(f))}${spRoost(f)?' · a Keeper waits here':''}`); }
/* every foe in the spire carries the floor's weight */
(function(){ const o=mkEnemy; mkEnemy=function(s){ const e=o(s); if(inSpire()){ const f=SPT.floor; e.hp*=spLife(f); e.maxhp=e.hp; e.dmg*=spDmg(f); e.xp*=1+SPIRE.xp*(f-1); e.spire=f; } return e; }; })();
/* no merchant on the climb: the crows are the only ones trading here */
placeMerchant=(function(o){ return function(){ if(L&&L.def&&L.def.kind==='tower'){ L.merch=null; return; } return o(); }; })(placeMerchant);

/* ---------- the waves ---------- */
const SP_SUB=new Set(['hanged','spitter','anchor','relicx','mimic','debtor']);
function spType(){ const en=L.def.enemies, ks=Object.keys(en).filter(k=>EDEF[k]&&!SP_SUB.has(k)); if(!ks.length) return 'ghoul'; const w={}; for(const k of ks) w[k]=en[k]; return wpick(w); }
function spRise(e,sx,sy){ const fly=EDEF[e.type]&&EDEF[e.type].fly; e.x=sx*T+8; e.y=fly?(sy-4)*T:sy*T; e.hy=e.y; e.atkCd=1+R()*1.2; e.stun=.5;
  ash(e.x,sy*T-4,12); dust(e.x,sy*T,6); for(let k=0;k<6;k++) part({type:'blood',x:e.x+rnd(-6,6),y:sy*T-2,vx:rnd(-40,40),vy:rnd(-160,-60),g:520,life:rnd(.4,.8),col:pick(BLOOD)}); }
function spWave(){ SPT.wave++; const f=SPT.floor, last=SPT.wave===SPIRE.waves; const n=2+SPT.wave*2+Math.min(5,Math.floor(f/4)); AU.roar(); shake(4);
  showBossName(`Floor ${f} · wave ${SPT.wave} of ${SPIRE.waves}`,kanjiNum(SPT.wave),last?(spRoost(f)?'The Keeper comes down from the rafters.':'The last of them. Then the stair.'):'The crows watch.');
  const spots=spSpots(); if(!spots.length){ SPT.next=1; return; }
  for(let i=0;i<n;i++){ const [sx,sy]=pick(spots); const e=mkEnemy({x:sx+.5,y:sy,t:spType(),pack:i>1?1:0,leader:last&&i===0?1:0}); spRise(e,sx,sy); SPT.list.push(e); enemies.push(e); }
  if(last){ const ground=spots.filter(([x,y])=>y===16); const [sx,sy]=pick(ground.length?ground:spots); const walkers=Object.keys(L.def.enemies).filter(k=>EDEF[k]&&!EDEF[k].fly&&!SP_SUB.has(k)); let t=spType(); if(EDEF[t].fly||spRoost(f)) t=walkers.sort((a,b)=>EDEF[b].hp-EDEF[a].hp)[0]||'brute'; /* a Keeper is the heaviest thing on the floor */
    const e=mkEnemy({x:sx+.5,y:sy,t}); const ks=Object.keys(MODS).filter(k=>BASE_MODS.includes(k)), m=[]; const nm=spRoost(f)?(f%10===0?3:2):2; while(m.length<nm){ const k=pick(ks); if(!m.includes(k)) m.push(k); }
    if(!e.rare&&!e.champ&&!e.unique){ if(spRoost(f)){ rankUp(e,'unique',m,keeperName(f)); if(f%10===0){ e.hp*=1.5; e.maxhp=e.hp; } } else rankUp(e,'rare',m,pick(RN1)+' '+pick(RARE2)); }
    spRise(e,sx,sy); SPT.list.push(e); enemies.push(e); ash(e.x,sy*T-6,20); if(spRoost(f)){ AU.roar(); shake(7); } }
  for(const c of SPT.crows) if(!c.st){ c.st=1; c.vx=(c.x<P.x?-1:1)*rnd(60,120); c.vy=-rnd(80,140); }
  SPT.next=1.4; }
function floorCleared(){ const f=SPT.floor, sm=spMeta(), was=SPT.cleared; SPT.state=2; L.locked=false; AU.bell(); AU.door(); if(typeof MUS!=='undefined') MUS.setMood('deep');
  const first=f>sm.best; sm.best=Math.max(sm.best,f); if(spRoost(f)) sm.roost=Math.max(sm.roost||0,f); SPT.cleared=Math.max(SPT.cleared,f);
  const cx=(SP_W/2)*T; for(let i=0;i<8;i++) dropGold(cx+rnd(-60,60),10*T,Math.round(ri(4,10)*(1+dep()*.6)*(1+SPIRE.gold*(f-1))*(1+P.stats.gf/100)));
  P.life=Math.min(P.stats.life,P.life+P.stats.life*.25); P.potions=Math.max(P.potions,2); updBelt(); gainXP(40*(1+dep())*(1+SPIRE.xp*(f-1)));
  /* a flock comes in through the windows and adds to the hoard */
  for(let i=0;i<10;i++) SPT.crows.push({x:cx+rnd(-200,200),y:rnd(1,4)*T,vx:rnd(-90,90),vy:rnd(20,60),st:2,t:R()*6});
  const hn=hoardName(f), up=!was||hoardName(was)!==hn, o=hoardOdds(f);
  toast(`Floor ${f} falls quiet. The hoard grows: ${hn} · unique ${spPct(o.r[4])} · abyssal ${fmtOdds(o.r[5])}${first&&f>1?` · a new best`:''}.`);
  if(up&&was) setTimeout(()=>cutIn('hero',`The hoard is ${hn.replace(/^a /,'a ')}`,'宝',1.1),900);
  if(spRoost(f)) setTimeout(()=>toast(`A roost. You can start the climb from floor ${f} now.`),1800); }
(function(){ const o=update; update=function(dt){ o(dt); if(!inSpire()||mode!=='play'||!P) return; SPT.t+=dt;
  if(SPT.state===0&&!P.dead&&(P.x>8*T||SPT.t>3)){ SPT.state=1; SPT.next=1; SPT.list=[]; cutIn('hero',`Floor ${SPT.floor}`,`${kanjiNum(SPT.floor)}階`,1.1); if(typeof MUS!=='undefined') MUS.setMood('boss'); }
  else if(SPT.state===1&&!SPT.list.some(e=>!e.dead)){ SPT.next-=dt; if(SPT.next<=0){ if(SPT.wave>=SPIRE.waves) floorCleared(); else spWave(); } }
  for(const c of SPT.crows){ c.t+=dt; if(c.st===0){ if(Math.abs(P.x-c.x)<46&&Math.abs(P.y-c.y)<40){ c.st=1; c.vx=(c.x<P.x?-1:1)*rnd(70,130); c.vy=-rnd(90,150); AU.noise&&AU.noise(.12,2400,500,1,.12,'bandpass',.3); } }
    else { c.x+=c.vx*dt; c.y+=c.vy*dt; if(c.st===1) c.vy-=40*dt; else if(c.st===2){ c.vy+=(Math.sin(c.t*2)*30-c.vy)*dt; if(c.t>4){ c.st=1; c.vy=-80; } } } }
  SPT.crows=SPT.crows.filter(c=>c.y>-40&&c.x>-60&&c.x<SP_W*T+60); }; })();

/* ---------- the Crow's Hoard: one chest, carried down, its odds built up floor by floor ----------
   BT: "drop as one chest inside your house with the odds of that chest all being added to ... level 1 you only get 1 grey
   chest and as you go up the chest gets better ... hit level 1000 or something crazy and like 50/50 abyssal".
   The climb drops nothing on the floors. The hoard is one chest, and its odds are a curve on the highest floor cleared
   this climb, read on a log scale between the anchors below (floor 1 a grey coffer, 1000 an even chance of abyssal, held
   from there). Both the item's rarity and every stat's roll grade follow it, and the item level rises with it too.
   Climb down and it falls through the hatch into the Rope-House; fall, or jump from a floor still fighting, and the
   crows keep it. Unopened hoards wait in the house (saved) until you open them. */
const HOARD_R=[ /* floor: Normal, Magic, Rare, Legendary, Unique, Abyssal (weights) */
  [1,[80,18,2,0,0,0]],[3,[55,35,9,.8,.2,0]],[5,[35,45,17,2,1,.001]],[10,[12,42,33,7,6,.02]],[20,[3,30,42,12,12.5,.3]],
  [50,[0,14,42,20,22,2]],[100,[0,5,35,24,30,6]],[250,[0,0,24,22,36,18]],[500,[0,0,12,16,38,34]],[1000,[0,0,4,8,38,50]]];
const HOARD_G=[ /* floor: Low, Fair, High, Max, Abyssal stat grades (weights) */
  [1,[35,34,19,6.6,.4]],[10,[12,28,34,22,4]],[20,[5,18,36,32,9]],[50,[1.5,9,32,40,17.5]],[100,[.5,4,25,45,25.5]],[1000,[0,1,9,40,50]]];
function hoardCurve(tab,f){ f=Math.max(1,f); if(f>=tab[tab.length-1][0]) return tab[tab.length-1][1].slice(); let i=0; while(tab[i+1][0]<f) i++;
  const [fa,a]=tab[i], [fb,b]=tab[i+1], k=(Math.log(f)-Math.log(fa))/(Math.log(fb)-Math.log(fa)); return a.map((v,j)=>v+(b[j]-v)*k); }
const pctOf=w=>{ const s=w.reduce((a,b)=>a+b,0); return w.map(v=>v/s*100); };
function hoardOdds(f){ return {r:pctOf(hoardCurve(HOARD_R,f)),g:pctOf(hoardCurve(HOARD_G,f))}; }
const hoardIlvl=f=>Math.floor(1.5*Math.log2(Math.max(1,f)));
const hoardTier=f=>f>=20?2:f>=5?1:0;
function hoardName(f){ return f>=100?"the Crow King's hoard":f>=20?'a tithe hoard':f>=5?'a bone reliquary':'a grey coffer'; }
let HOARD=null; /* the hoard being opened: {f,ml} */
genItem=(function(o){ return function(ilvl,w,mf,forceSlot){ if(!HOARD) return o(ilvl,w,mf,forceSlot); const h=HOARD, keep=GR.map(g=>g.w), gw=hoardCurve(HOARD_G,h.f);
  const il=ilvl+hoardIlvl(h.f); /* ilvl already counts from the hoard's own monster level (mlvl below) */
  GR.forEach((g,i)=>g.w=gw[i]); let it; try{ it=o(il,w,mf,forceSlot); } finally { GR.forEach((g,i)=>g.w=keep[i]); }
  if(it){ const tag=`From the Crow's Hoard, floor ${h.f} of the Crowspire.`; it.fl=it.fl?`${it.fl} — ${tag}`:tag; } return it; }; })(genItem);
/* while a hoard opens, its own odds stand as written (only magic find moves them), and it keeps the level it was won at */
oddsW=(function(o){ return function(w,mf){ if(!HOARD) return o(w,mf); const m=1+(mf||0)/100*.6; return w.map((v,i)=>i===0?v:v*(i>=4?Math.sqrt(m):m)); }; })(oddsW);
mlvl=(function(o){ return function(i){ return HOARD&&i==null?HOARD.ml:o(i); }; })(mlvl);
chestKind=(function(o){ return function(c){ return c&&c.hoard?null:o(c); }; })(chestKind);
openChest=(function(o){ return function(c){ if(!c||c.open||!c.hoard) return o(c); const t=c.tier, keep=CW[t]; HOARD=c.hoard; CW[t]=hoardCurve(HOARD_R,c.hoard.f);
  const sm=spMeta(); sm.hoards=(sm.hoards||[]).filter(h=>h!==c.hoard&&!(h.f===c.hoard.f&&h.at===c.hoard.at)); c._cw=keep; saveGame();
  try{ return o(c); } finally { if(mode!=='case'){ CW[t]=keep; HOARD=null; } else SPT.hcase={t,keep}; if(sm.hoards.length) setTimeout(()=>{ if(L&&L.def.kind==='cabin') hoardDrop(sm.hoards[0]); },1500); } }; })(openChest);
showCase=(function(o){ return function(tier,ilvl,win,...r){ const res=o(tier,ilvl,win,...r); const hc=SPT.hcase; if(hc&&HOARD){ const f=HOARD.f, g=hoardOdds(f).g;
    $('#caseName').textContent="The Crow's Hoard"; $('#caseSub').textContent=`${SP_NAME} · floor ${f}`.toUpperCase(); const od=$('#odds');
    if(od) od.insertAdjacentHTML('beforeend',`<span style="color:#ffcf6a">Max-grade stats ${spPct(g[3])}</span><span style="color:var(--r5)">Abyssal-grade stats ${spPct(g[4])}</span>`);
    CW[hc.t]=hc.keep; HOARD=null; SPT.hcase=null; } return res; }; })(showCase);
/* nothing drops on the floors: the hoard is the prize */
dropChest=(function(o){ return function(e,tier){ if(inSpire()) return; return o(e,tier); }; })(dropChest);
/* the save never puts you back inside the tower */
saveGame=(function(o){ return function(){ if(!SPT.on||!P) return o(); const li=lvlIdx, g=ngp; lvlIdx=CABIN_IDX; ngp=META.pick||0; try{ o(); } finally { lvlIdx=li; ngp=g; } }; })(saveGame);

/* ---------- leaving: carried down, jumped, or fallen ---------- */
function spEnd(){ SPT.on=false; SPT.cleared=0; P.dead=false; P.life=P.stats.life; }
function spClimbDown(){ const f=SPT.cleared, sm=spMeta(); if(f>0){ sm.hoards=sm.hoards||[]; sm.hoards.push({f,ml:SPT.ml,at:Date.now()}); }
  spEnd(); AU.door(); goCabin(); saveGame();
  toast(f>0?`You climb down. ${hoardName(f)[0].toUpperCase()+hoardName(f).slice(1)} from floor ${f} drops through the hatch behind you.`:'You climb down. The crows watch you go.'); }
function hoardLine(f){ const o=hoardOdds(f); return `rare ${spPct(o.r[2])} · unique ${spPct(o.r[4])} · abyssal ${fmtOdds(o.r[5])} · max-grade stats ${spPct(o.g[3])}`; }
function spExitCard(){ const f=SPT.floor, nf=f+1, h=SPT.cleared; mode='card'; hud.hidden=true; const bn=$('#bossname'); if(bn) bn.classList.remove('on');
  const grow=hoardName(nf)!==hoardName(h)?` It becomes ${hoardName(nf)}.`:'';
  showCard({title:`Floor ${f} is quiet`,jp:`${kanjiNum(f)}階`,story:false,body:`The hoard: ${hoardName(h)} · ${hoardLine(h)}.\nClear floor ${nf} (foes: life ×${spX(spLife(nf))} · damage ×${spX(spDmg(nf))}) and it holds ${hoardLine(nf)}.${grow}\n\nClimb down and it is yours. Fall, and the crows keep it.`,
    buttons:[{label:`Climb to floor ${nf}`,fn:()=>{ hideCard(); enterFloor(nf); }},{label:'Climb down with the hoard',ghost:1,fn:()=>{ hideCard(); spClimbDown(); }},{label:'Not yet',ghost:1,fn:()=>{ hideCard(); mode='play'; hud.hidden=false; }}]}); }
finishLevel=(function(o){ return function(){ if(!inSpire()) return o(); if(SPT.state!==2) return; spExitCard(); }; })(finishLevel);
(function(){ const o=findInteract; findInteract=function(){ const b=o(); if(!inSpire()||!P||SPT.state===2) return b; const ex=L.exit.x*T+8, ey=L.exit.y*T;
  if(!b&&Math.abs(P.x-ex)<26&&Math.abs(P.y-ey)<22) return {o:L.exit,txt:SPT.state===0?'Barred · the floor is waiting':'Barred · kill everything on the floor',act:()=>{ AU.clang(); shake(2); }}; return b; }; })();
(function(){ const o=findInteract; findInteract=function(){ const b=o(); if(inSpire()&&SPT.state===2&&b&&b.o===L.exit) b.txt=`<kbd>E</kbd> The stair · up to floor ${SPT.floor+1}, or down with the hoard`; return b; }; })();
/* one life on the climb */
(function(){ const o=updBelt; updBelt=function(){ o(); const c=document.querySelector('#belt .lives'); if(c&&inSpire()) c.textContent='命 ● · one life'; }; })();
function spFall(){ deathShown=true; mode='death'; hud.hidden=true; const el=$('#death'); el.hidden=false; if(typeof MUS!=='undefined') MUS.setMood('silent');
  const f=SPT.floor, h=SPT.cleared; $('#death .shi').textContent='鴉'; $('#deathLine').textContent='The crows keep the hoard.';
  $('#deathSub').textContent=`You fell on floor ${f}.${h?` ${hoardName(h)[0].toUpperCase()+hoardName(h).slice(1)} from floor ${h} stays in the nests.`:''} Your best: floor ${spMeta().best}.`;
  setTimeout(()=>{ if(mode!=='death') return; spEnd(); el.hidden=true; goCabin(); saveGame(); toast('You wake in the Rope-House. Ilse says nothing about the feathers in your hair.'); },3600); }
onDeath=(function(o){ return function(){ if(inSpire()){ if(deathShown) return; spFall(); return; } return o(); }; })(onDeath);
function spJumpCard(){ const h=SPT.cleared; $('#pause').hidden=true; mode='card'; hud.hidden=true;
  showCard({title:'Jump down?',jp:'飛び降り',story:false,body:SPT.state===2?'The stair is open: climb down from it and the hoard comes with you.':`Only a quiet floor lets you climb down with the hoard. Jump now and you land safe in the Rope-House${h?`, but ${hoardName(h)} from floor ${h} stays with the crows`:''}.`,
    buttons:[{label:'Jump',fn:()=>{ hideCard(); if(SPT.state===2){ spClimbDown(); return; } spEnd(); goCabin(); saveGame(); toast('You land in the straw behind the house. The crows keep the hoard.'); }},{label:'Stay',ghost:1,fn:()=>{ hideCard(); openPause(); }}]}); }
openPause=(function(o){ return function(){ o(); const b=$('#pAbandon'); if(b&&inSpire()){ b.hidden=false; b.textContent='Jump down'; b.onclick=spJumpCard; } else if(b) b.textContent='Abandon run'; }; })(openPause);
showMap=(function(o){ return function(from,to,onGo){ if(inSpire()){ mode='play'; hud.hidden=false; toast(`No map up here. Floor ${SPT.floor}; your best is ${spMeta().best}.`); if(onGo) onGo(); return; } return o(from,to,onGo); }; })(showMap);
journeyNodes=(function(o){ return function(){ const N=o(); delete N[SPIRE_IDX]; return N; }; })(journeyNodes);
toTitle=(function(o){ return function(){ if(SPT.on) SPT.on=false; return o(); }; })(toTitle);
goCabin=(function(o){ return function(){ const r=o(); SPT.on=false; return r; }; })(goCabin);

/* ---------- the rope ladder in the Rope-House ---------- */
CAB.spire=25;
if(typeof STATIONS!=='undefined') STATIONS.push(['spire','The Crowspire',()=>(spMeta().hoards||[]).length>1?`${spMeta().hoards.length} hoards wait`:(spMeta().hoards||[]).length?'a hoard waits':spMeta().best?`best floor ${spMeta().best}`:'endless climb',96]);
function spStarts(){ const r=Math.floor((spMeta().roost||0)/SPIRE.roost)*SPIRE.roost; return r?[1,r]:[1]; }
const spLvl=()=>clamp(P.lvl-2,1,100); /* floor 1 sits where the campaign does: monsters two levels under you */
function spireCard(){ const sm=spMeta(), ml=spLvl(), st=spStarts(); mode='card'; hud.hidden=true;
  showCard({title:SP_NAME,jp:SP_JP,story:!sm.seen,body:`${sm.seen?'':'The crows bring things up out of the Pit and carry them here, to a tower of scaffold and bone behind the house. The higher the nest, the older the hoard. Nobody has found the top.\n\n'}Every floor you clear adds to one hoard: floor 1 is a grey coffer, and it only gets better. Ten floors up, foes are ten times tougher. Every fifth floor is a roost you can start from.\nClimb down and the hoard is yours. Fall, and the crows keep it.\n\nFloor 1 is level ${ml}. ${sm.best?`Best: floor ${sm.best}.`:'You have never climbed it.'}`,
    buttons:st.map(f=>({label:f===1?'Climb from floor 1':`From the roost on floor ${f}`,fn:()=>{ hideCard(); spBegin(f); }})).concat([{label:'Not tonight',ghost:1,fn:()=>{ hideCard(); mode='play'; hud.hidden=false; }}])}); }
function spBegin(f){ spMeta().seen=1; SPT.on=true; SPT.ml=spLvl(); SPT.seed=ri(0,99999); SPT.cleared=0; META.inCabin=false; P.life=P.stats.life; P.grit=100; P.potions=Math.max(P.potions,2); updBelt(); saveGame(); enterFloor(f); }
(function(){ const o=findInteract; findInteract=function(){ const b=o(); if(!L||L.def.kind!=='cabin'||!P||(typeof COOP!=='undefined'&&COOP)) return b; const x=CAB.spire*T+8, d=Math.abs(P.x-x);
  const bd=b&&typeof b.o==='number'?Math.abs(b.o*T+8-P.x):b?6:1e9; if(d<16&&d<bd){ const best=spMeta().best; return {o:CAB.spire,txt:`<kbd>E</kbd> Climb the rope ladder · ${SP_NAME}${best?` · best floor ${best}`:''}`,act:spireCard}; } return b; }; })();
/* hoards carried down fall through the hatch and wait by the ladder until opened (kept in the save) */
(function(){ const o=loadLevel; loadLevel=function(idx,opt){ const r=o(idx,opt); if(L&&L.def.kind==='cabin'&&P){ const hs=spMeta().hoards||[];
  if(hs.length) hoardDrop(hs[0]); } return r; }; })();
function hoardDrop(h){ chests.push({x:(CAB.spire-2)*T+8,y:2*T,tier:hoardTier(h.f),open:false,t:0,falling:true,vy:0,floorY:16*T,hoard:h}); }
(function(){ const o=findInteract; findInteract=function(){ const b=o(); if(!L||L.def.kind!=='cabin'||!P) return b; let best=null, bd=18;
  for(const c of chests){ if(!c.hoard||c.open||c.falling) continue; const d=Math.abs(c.x-P.x); if(d<bd){ bd=d; best=c; } }
  return best?{o:best,txt:`<kbd>E</kbd> Open the Crow's Hoard · floor ${best.hoard.f}`,act:()=>openChest(best)}:b; }; })();
function drawSpireLadder(){ if(!L||L.def.kind!=='cabin') return; const F=16*T, x=CAB.spire*T+2, top=2*T, R_=(px,py,w,h,c)=>{ ctx.fillStyle=c; ctx.fillRect(Math.round(px-camR.x),Math.round(py-camR.y),w,h); };
  R_(x-6,top-4,24,6,'#0a0605'); R_(x-7,top+2,26,2,'#3a2818'); /* the hatch */
  const sw=Math.sin(time*.9)*1.2; for(const s of [0,11]) for(let y=top+4;y<F;y+=3) R_(x+s+Math.round(sw*(y-top)/(F-top)),y,1,2,(y>>2)%2?'#7a6648':'#5a4a34');
  for(let y=top+14;y<F-2;y+=13){ const k=(y-top)/(F-top); R_(x+Math.round(sw*k),y,12,2,'#4a3420'); R_(x+Math.round(sw*k),y,12,1,'#6a5038'); }
  /* a crow on a rung, and a feather on the floor */ const cy=top+66, bob=Math.round(Math.sin(time*2.3)), cx=x+5+Math.round(sw*.3), look=P&&P.x<x?-1:1;
  R_(cx-3,cy-5+bob,7,4,'#0c0a0e'); R_(cx+(look>0?3:-5),cy-7+bob,3,3,'#0c0a0e'); R_(cx+(look>0?6:-7),cy-6+bob,2,1,'#5a5048'); R_(cx+(look>0?4:-4),cy-7+bob,1,1,'#d8b24a'); R_(cx+(look>0?-6:4),cy-4+bob,3,1,'#0c0a0e'); R_(cx-1,cy-1+bob,1,2,'#3a3028'); R_(cx+1,cy-1+bob,1,2,'#3a3028');
  R_(x+18,F-1,5,1,'#141016'); R_(x+19,F-2,3,1,'#24202a');
  const best=spMeta().best; if(best){ ctx.fillStyle='rgba(200,170,110,.55)'; ctx.font='7px "IM Fell English SC", Georgia, serif'; ctx.textAlign='center'; ctx.fillText(`${best}`,Math.round(x+6-camR.x),Math.round(top+12-camR.y)); ctx.textAlign='left'; }
  addLight(x+6,cy,40,.25,1,.8,.55); }
(function(){ const o=drawPlats; drawPlats=function(){ drawSpireLadder(); drawSpireRoom(); o(); }; })();

/* ---------- inside: the floor number on the wall, the stair, the crows ---------- */
function drawSpireRoom(){ if(!inSpire()) return; const f=SPT.floor, R_=(px,py,w,h,c)=>{ ctx.fillStyle=c; ctx.fillRect(Math.round(px-camR.x),Math.round(py-camR.y),w,h); };
  ectx.save(); ectx.globalAlpha=.05; ectx.fillStyle='#ffb070'; ectx.font='800 56px "Shippori Mincho", serif'; ectx.textAlign='center'; ectx.fillText(kanjiNum(f),Math.round(SP_W*T/2-camR.x),Math.round(6.5*T-camR.y)); ectx.restore();
  /* the stair up behind the exit */ const ex=L.exit.x*T+8, F=16*T; for(let i=0;i<6;i++) R_(ex-14+i*4,F-8-i*12,18,3,SPT.state===2?'#5a4030':'#2a1e18');
  for(const c of SPT.crows){ const fl=c.st?(Math.sin(c.t*22)>0?1:0):0, s=c.vx<0?-1:1;
    R_(c.x-3,c.y-4,7,3,'#0a080c'); R_(c.x+s*3,c.y-6,3,3,'#0a080c'); R_(c.x+s*6-(s<0?1:0),c.y-5,2,1,'#4a4440');
    if(c.st){ R_(c.x-5,c.y-(fl?8:3),4,fl?4:1,'#0a080c'); R_(c.x+1,c.y-(fl?8:3),4,fl?4:1,'#0a080c'); } else { R_(c.x-1,c.y-1,1,1,'#2a2420'); R_(c.x+1,c.y-1,1,1,'#2a2420'); } } }

/* the HUD line while climbing */
(function(){ const o=loadLevel; loadLevel=function(idx,opt){ const r=o(idx,opt); if(L&&L.def.kind==='tower') L.merch=null; return r; }; })();
/* music: the floor plays the region its foes came from */
if(typeof MX!=='undefined'&&MX.keyFor){ const o=MX.keyFor; MX.keyFor=function(def,mood){ if(def&&def.kind==='tower'){ const lk=SPT.from&&SPT.from.look; return lk&&this.SETS[lk]?lk:'deep'; } return o.call(this,def,mood); }; }
/* safety: a hoard's odds never outlive its case */
closeCase=(function(o){ return function(...a){ const r=o(...a); if(SPT.hcase){ CW[SPT.hcase.t]=SPT.hcase.keep; SPT.hcase=null; } HOARD=null; return r; }; })(closeCase);
