'use strict';
/* ===== campaign (v24): the new story's shape =====
   Story Bible & Storyboard v2 (claude/story/). Prologue on the walls of Kesh → Act I, the road home across the March →
   Act II, Hollowmere in darkness, ending in the fall from the palace bridge → Act III, the Marrowdeep (today's
   Ossuary, Kiln and Breach levels, until Act III is rewritten) → the Finale.
   Loaded straight after data.js so every later module (lore, world, meta's Rope-House, retreat's act starts) sees the
   new order. The Drowned Chapel and the Debtors' Warren leave the campaign: their bosses (the Choir and the Collector)
   now live in the city, in Act II.
   Levels with open:1 are outdoors: sky behind, several rows of rooms, the room kinds of the deep (world.js). look: the
   region's art in regions.js; env: the mechanics they borrow (water: pools and flooded floors, ash: wind). */

const OLD_ORDER=['wall','ossuary','mother','chapel','choir','warren','tithe','kiln','saint','breach','count']; /* v23 indices, for old saves */
const RETIRED={};
{ const byId=Object.fromEntries(LEVELS.map(d=>[d.id,d])); for(const id of ['chapel','warren']) RETIRED[id]=byId[id];
  const wall=byId.wall; Object.assign(wall,{name:'The Walls of Kesh',jp:'ケシュの城壁',act:'Prologue',pal:'kesh'});
  const old=['ossuary','mother','kiln','saint','breach'].map(id=>Object.assign(byId[id],{act:'Act III'}));
  Object.assign(byId.count,{act:'Finale',name:'The Throne Beneath the Wound',jp:'傷の下の玉座'});
  const A1='Act I', A2='Act II';
  const NEW=[
    {id:'meadow',kind:'dungeon',open:1,look:'meadow',name:'The Quiet Fields',jp:'静かな野',act:A1,pal:'meadow',cols:7,rows:2,up:.3,env:'war',amb:'wind',
      enemies:{scarecrow:3,crow:2.4,hound:1.6,rider:.9,archer:.8},packs:[{t:'hound',n:[3,5]},{t:'crow',n:[5,8]}],packP:.45,bg:['crows','crows','riders','wound']},
    {id:'odo',kind:'boss',boss:'odo',open:1,look:'meadow',arena:'road',name:'The Gallows Road',jp:'絞首台の道',act:A1,pal:'meadow',surface:1,bg:['crows','riders']},
    {id:'fen',kind:'dungeon',open:1,look:'fen',name:'The Rushmere Fen',jp:'ラッシュミアの沼',act:A1,pal:'fen',cols:7,rows:2,up:.3,env:'water',amb:'water',
      enemies:{drowner:2.2,fenhag:1.4,lantern:1.6,leech:2.4,hound:.8,scarecrow:.5},packs:[{t:'leech',n:[5,8]},{t:'drowner',n:[2,3]}],packP:.45,bg:['wisps','bell','wound']},
    {id:'sisters',kind:'boss',boss:'sisters',open:1,look:'fen',arena:'pools',name:'The Sisters\' Pool',jp:'三姉妹の淵',act:A1,pal:'fen',surface:1,env:'water',bg:['wisps']},
    {id:'ashes',kind:'dungeon',open:1,look:'ashes',name:'The Ashes of Kesh',jp:'ケシュの灰',act:A1,pal:'ashes',cols:7,rows:2,up:.35,env:'ash',amb:'wind',
      enemies:{saltwraith:2,buried:2.4,vulture:1.4,zealot:1.6,rider:.6,hound:.8},packs:[{t:'buried',n:[3,5]},{t:'saltwraith',n:[3,4]}],packP:.45,bg:['vultures','sandstorm','wound']},
    {id:'preacher',kind:'boss',boss:'preacher',open:1,look:'ashes',arena:'chapel',name:'Saint Edda\'s Ashes',jp:'聖エッダの灰',act:A1,pal:'ashes',surface:1,bg:['sandstorm']},
    {id:'pass',kind:'dungeon',open:1,look:'pass',name:'The Weeping Pass',jp:'泣き峠',act:A1,pal:'pass',cols:4,rows:4,up:.7,env:'ash',amb:'wind',
      enemies:{harpy:2,hermit:1.6,footman:1.6,pikeman:1.2,vulture:.6,archer:1},packs:[{t:'footman',n:[2,3]},{t:'harpy',n:[2,3]}],packP:.4,bg:['rockfall','vultures','wound']},
    {id:'merrow',kind:'boss',boss:'merrow',open:1,look:'pass',arena:'camp',name:'The Black Camp',jp:'黒い陣',act:A1,pal:'pass',surface:1,bg:['rockfall']},
    {id:'lastlight',kind:'dungeon',open:1,look:'fort',name:'The Last Light',jp:'最後の灯',act:A1,pal:'fort',cols:5,rows:3,up:.5,env:'war',amb:'wind',
      enemies:{footman:2.2,pikeman:2,archer:1.6,hound:1.2,zealot:.6},packs:[{t:'footman',n:[3,4]},{t:'pikeman',n:[2,3]}],packP:.5,bg:['wound','wound','riders']},
    {id:'piet',kind:'boss',boss:'piet',open:1,look:'fort',arena:'gate',name:'The Gate of the Last Light',jp:'最後の灯の門',act:A1,pal:'fort',surface:1,bg:['wound']},
    {id:'villages',kind:'dungeon',open:1,look:'villages',name:'The Harvest Villages',jp:'収穫の村',act:A2,pal:'villages',cols:7,rows:2,up:.25,env:'war',amb:'festival',
      enemies:{villager:4,engineer:1,hound:1,footman:.8,archer:.8},packs:[{t:'villager',n:[4,6]}],packP:.5,bg:['wound','bells']},
    {id:'brann',kind:'boss',boss:'brann',open:1,look:'villages',arena:'works',name:'The Siege Works',jp:'攻城陣',act:A2,pal:'villages',surface:1,bg:['wound','bells']},
    {id:'slums',kind:'dungeon',open:1,look:'slums',name:'The Lower City',jp:'下町',act:A2,pal:'slums',cols:6,rows:3,up:.45,env:'debt',amb:'drip',
      enemies:{cutpurse:1.2,ratking:1,rat:2,beggar:1.6,plague:1.4,taker:1,guard:1},packs:[{t:'rat',n:[6,9]},{t:'beggar',n:[2,3]}],packP:.5,bg:['bells','wound']},
    Object.assign(byId.tithe,{act:A2,name:'The Counting House',jp:'勘定所',pal:'slums',look:'slums'}),
    {id:'oldcity',kind:'dungeon',open:1,look:'oldcity',name:'The Old City',jp:'旧市街',act:A2,pal:'oldcity',cols:6,rows:3,up:.42,env:'war',amb:'city',
      enemies:{guard:2.2,taker:1.4,bellman:1,gargoyle:1.4,archer:1,cutpurse:.6},packs:[{t:'guard',n:[3,4]}],packP:.45,bg:['bells','wound','bells']},
    Object.assign(byId.choir,{act:A2,name:'The Cathedral of the Crown',jp:'王冠の大聖堂',pal:'chapel'}),
    {id:'royal',kind:'dungeon',look:'royal',name:'The Royal Houses',jp:'王家の館',act:A2,pal:'royal',cols:6,rows:3,up:.4,env:'bone',amb:'ball',
      enemies:{noble:2,puppet:1.8,servant:1.6,handknight:.9,guard:1},packs:[{t:'puppet',n:[3,4]},{t:'noble',n:[2,3]}],packP:.45,bg:['eyes','procession']},
    {id:'rook',kind:'boss',boss:'rook',open:1,look:'royal',arena:'yard',name:'The Iron Barracks',jp:'鉄の兵舎',act:A2,pal:'barracks',surface:1,bg:['wound']},
    {id:'bridge',kind:'dungeon',open:1,look:'bridge',name:'The Palace Bridge',jp:'王宮の橋',act:A2,pal:'bridge',cols:7,rows:1,up:0,env:'war',amb:'wind',
      enemies:{guard:2.4,handknight:1,archer:1.6,taker:1,bellman:.6},packs:[{t:'guard',n:[3,5]}],packP:.55,bg:['wound','wound','bells']},
    {id:'gideon',kind:'boss',boss:'gideon',open:1,look:'bridge',arena:'bridge',name:'The Gate of Pikes',jp:'槍の門',act:A2,pal:'bridge',surface:1,bg:['wound']}
  ];
  LEVELS.length=0; LEVELS.push(wall,...NEW,...old,byId.count); }
const DEPTH_N=()=>LEVELS.filter(d=>d.kind!=='cabin').length-1;
/* depth on the v23 scale (0..10): the economy (gold, prices, waves, traps) was tuned for 11 levels */
function dep(i){ const li=i==null?lvlIdx:i; return Math.round(li*10/Math.max(1,DEPTH_N())*10)/10; }
function lvlIndexOf(id){ return LEVELS.findIndex(d=>d.id===id); }
/* a v23 save: its index pointed into the old order */
function migrateIdx(i){ const id=OLD_ORDER[i]; const map={chapel:'villages',choir:'choir',warren:'slums',tithe:'tithe'}; const ni=lvlIndexOf(map[id]||id); return ni<0?0:ni; }

Object.assign(ACTS,{
  'Prologue':{t:'Prologue — The Walls of Kesh',jp:'序章　ケシュの城壁',body:'The last war. Your brother at your shoulder, the enemy fortress in front of you, and your father\'s banner behind.'},
  'Act I':{t:'Act I — The Road Home',jp:'第一幕　帰路',body:'Months later, far away. A crow found you with a letter. The way back crosses the March: fields, fen, the ashes of Kesh, the pass, the border fort.'},
  'Act II':{t:'Act II — Hollowmere in Darkness',jp:'第二幕　闇のホロウミア',body:'The city has sealed itself. Curfew bells, the soul tithe, hymns rewritten for the new King, Hollowed guards on every corner. Nobody runs. Everybody watches.'},
  'Act III':{t:'Act III — The Marrowdeep',jp:'第三幕　骨髄の底',body:'You fell. Under Hollowmere there is an older city, and under that, the Pit. From down here it looks like Hell, red and burning and crowded with the damned.'},
  'Finale':{t:'Finale — The Throne Beneath the Wound',jp:'終幕　傷の下の玉座',body:'You climb out where the palace used to be. The Hollowed kneel in rows. In the middle of them a man is waiting for you with a crown on his head. He is your brother.'}});
for(const k of ['Act IV','Act V']) delete ACTS[k];

Object.assign(LETTERS,{
  meadow:'Halden. He comes to the house now. He brings the children sweets and tells them to call him uncle, as if they didn\'t know. They ask for you. Come home. — I.',
  odo:'There are papers on every door with your face drawn on them. The face is wrong. Tomas says the nose is too nice.',
  fen:'Tomas carved a second horse so the first one wouldn\'t be lonely on the road. Wren lights a candle when I do. She burns her fingers and won\'t cry, because you don\'t.',
  sisters:'The cough is back. Don\'t you dare turn around for it. Keep walking.',
  ashes:'They took the tithe in our street. One in ten. A bell, then a cart. Mrs. Harl\'s boy. Nobody said anything. I said something.',
  preacher:'There is a new hymn. They teach it in the square. The children already know the words. I don\'t let ours sing it in the house.',
  pass:'The crow has no letter this time. Only a thread on its leg, and blood on its foot.',
  merrow:'(No letter.)',
  lastlight:'(No letter. The crows have stopped coming.)',
  villages:'A notice nailed to every tenth door: BY ORDER OF THE KING. CURFEW AT THE SECOND BELL. THE TITHE IS A BLESSING.',
  brann:'Chalk on a wall by the siege works, in a child\'s hand: THE KINGSLAYER IS COMING. Someone has tried to scrub it off. Someone else wrote it again.',
  slums:'Pinned to a door with a knife: a receipt. One soul, received with thanks. The name has been scraped off with a thumbnail.',
  tithe:'The Collector\'s ledger, the page for your street: three names together, two struck through in wet red ink.',
  oldcity:'Every shop has his portrait in the window. Someone has painted the eyes so they follow you. You check. They don\'t. Then you check again.',
  choir:'In the cathedral they sing it every hour now. Long live the King. Long live the King. Nobody remembers the old words.',
  royal:'A dance card on the floor of the ballroom. Every dance is promised to the same name.',
  rook:'Oswin taught your son to sit a horse. He held Tomas on the saddle and walked the yard for an hour, laughing.',
  bridge:'You can see the gate from here. You can see that something is on it. You walk anyway.'});

/* the hero's voice, by act */
const BARKS_ROAD={start:['Home. Keep walking.','She said come home. So I\'m coming.','One more field. One more after that.','Don\'t think about the gate. Think about the door.'],
  low:['Not here. They\'re waiting.','Get up. Tomas is watching.','Breathe. You promised.']};
const BARKS_CITY={start:['They\'re watching. Let them.','This was my city.','Keep your hood up. Keep moving.','Every tenth door. Don\'t count them.'],
  low:['Not in this street.','Get up. Nearly there.']};

/* new palettes (stone/cap/hi drive the generic baking; regions.js repaints the ground for open levels) */
Object.assign(PALS,{
  kesh:{sky:['#0a0814','#3a1a1c','#7a3412'],shaft:'rgba(255,150,80,',stone:['#4c4440','#544a44','#463e3a','#5c524a'],mortar:'#221c1a',cap:'#706660',hi:'#a08e80',amb:[.56,.46,.46],surface:1},
  meadow:{sky:['#bfbca8','#d8d4c2','#e6e3d4'],shaft:'rgba(255,250,235,',stone:['#4e5640','#56604a','#48503c','#5e684e'],mortar:'#2a3024',cap:'#7f8b6f',hi:'#a8b08c',amb:[.82,.82,.76]},
  fen:{sky:['#1c1424','#3a2a40','#3e5a2c'],shaft:'rgba(160,190,110,',stone:['#2e3424','#343a28','#282e20','#3a4230'],mortar:'#14180e',cap:'#3e5a2c',hi:'#6f8a3a',amb:[.5,.54,.46]},
  ashes:{sky:['#d8cdb0','#ebe4d2','#d0c4a4'],shaft:'rgba(255,240,210,',stone:['#8a7652','#957a50','#7a6848','#a08860'],mortar:'#4a3a28',cap:'#c4ad80',hi:'#e2d2a6',amb:[.86,.8,.68]},
  pass:{sky:['#3a4048','#6a737a','#a8adb0'],shaft:'rgba(230,236,240,',stone:['#2a2e34','#32363c','#262a30','#3a3e44'],mortar:'#121418',cap:'#7b848b',hi:'#e7e9e7',amb:[.62,.66,.72]},
  fort:{sky:['#0e0a0a','#1f232c','#2c3240'],shaft:'rgba(220,150,90,',stone:['#4a4642','#524e4a','#423e3a','#5a5652'],mortar:'#1a1816',cap:'#8a8580',hi:'#c8c2b8',amb:[.46,.46,.56]},
  villages:{sky:['#1a141c','#4a2c38','#b8704a'],shaft:'rgba(255,190,120,',stone:['#5a4430','#644c36','#4e3a28','#6e563e'],mortar:'#2a1e14',cap:'#8a6a32',hi:'#d4b25a',amb:[.66,.52,.48]},
  slums:{sky:['#100e0c','#2e3424','#1a1812'],shaft:'rgba(200,180,120,',stone:['#4a3a28','#52402c','#423424','#5a4632'],mortar:'#1e160e',cap:'#5a4636',hi:'#8a7a5a',amb:[.42,.42,.36]},
  oldcity:{sky:['#0e0e12','#1a1e2a','#2a3040'],shaft:'rgba(224,176,96,',stone:['#5e5a54','#66625c','#56524c','#6e6a64'],mortar:'#24221e',cap:'#9a9488','hi':'#cfc6b2',amb:[.46,.44,.5]},
  royal:{sky:['#0a0606','#2a0a10','#3a1018'],shaft:'rgba(232,212,160,',stone:['#3a1a1e','#421e22','#34161a','#4a2226'],mortar:'#1a0a0c',cap:'#6e5420',hi:'#b8913a',amb:[.5,.38,.36],motif:'windows'},
  barracks:{sky:['#0e0a0a','#2a2024','#3a2a2a'],shaft:'rgba(224,160,96,',stone:['#4a4440','#524c46','#423c38','#5a544e'],mortar:'#1e1a18',cap:'#7a7068',hi:'#b0a494',amb:[.5,.44,.44]},
  bridge:{sky:['#0e0a0a','#5a0a0e','#b0141a'],shaft:'rgba(255,90,60,',stone:['#3a3a40','#424248','#34343a','#4a4a50'],mortar:'#16161a',cap:'#6e6a68',hi:'#a8a4a0',amb:[.6,.36,.36]}});
