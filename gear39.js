'use strict';
/* ===== v39: gloves, boots, a second ring, and armour families =====
   (claude/builds-plan.md, decisions of 9 Nov.)
   - Worn gear: weapon, off hand, helm, armour, gloves, boots, amulet, ring, second ring.
   - Every armour, helm, gloves and boots base is Light (leather, cloth), Medium (mail, brigandine) or Heavy (plate).
     Families decide defense (light ×0.7 of medium, heavy ×1.3), and later the stats they lean to and set bonuses.
     Existing bases keep their names; Plate Cuirass, Blackened Plate, the Great Helm and the Hound Visor are heavy now
     and their defense rose by 30%.
   - A new item of these slots picks its family first (each equally likely), then the best base of that family its
     item level reaches (sometimes the one below), the way weapons pick a class first.
   - Rings go to an empty ring finger first; with both full, to the one the new ring improves most. Drag onto either
     ring to choose. */
const FAM={L:{n:'Light',kj:'軽',d:'leather and cloth'},M:{n:'Medium',kj:'中',d:'mail and brigandine'},H:{n:'Heavy',kj:'重',d:'plate'}};
const GEAR_SLOTS=['armor','helm','gloves','boots'];

/* ---------- bases ---------- */
(function(){
  const setF=(slot,name,fam,look,def)=>{ const b=BASES[slot].find(x=>x.name===name); if(b){ b.fam=fam; b.look=look; if(def!=null) b.def=def; } };
  setF('armor','Quilted Gambeson','L',0); setF('armor','Ring Mail','M',1); setF('armor','Brigandine','M',2); setF('armor','Plate Cuirass','H',3,39); setF('armor','Blackened Plate','H',4,57);
  setF('helm','Kettle Hat','M',0); setF('helm','Barbute','M',1); setF('helm','Bascinet','M',2); setF('helm','Great Helm','H',3,20); setF('helm','Hound Visor','H',4,29);
  BASES.armor.push({name:'Leather Jerkin',lvl:3,def:8,fam:'L',look:0},{name:'Studded Leathers',lvl:6,def:13,fam:'L',look:0},{name:"Hunter's Coat",lvl:10,def:21,fam:'L',look:0},{name:'Shadow Leathers',lvl:15,def:31,fam:'L',look:0},
    {name:'Scale Hauberk',lvl:10,def:30,fam:'M',look:2},{name:'Black Brigandine',lvl:15,def:44,fam:'M',look:2},
    {name:'Iron Breastplate',lvl:3,def:14,fam:'H',look:3},{name:'Half Plate',lvl:6,def:25,fam:'H',look:3});
  BASES.helm.push({name:'Hood',lvl:0,def:2,fam:'L',look:-1},{name:'Leather Cap',lvl:3,def:4,fam:'L',look:0},{name:"Ranger's Cowl",lvl:6,def:7,fam:'L',look:-1},{name:'Shadow Cowl',lvl:10,def:11,fam:'L',look:-1},{name:'Wraith Hood',lvl:15,def:16,fam:'L',look:-1},
    {name:'Sallet',lvl:10,def:15,fam:'M',look:2},{name:'Visored Sallet',lvl:15,def:22,fam:'M',look:2},
    {name:'Iron Pot',lvl:3,def:8,fam:'H',look:1},{name:'Closed Helm',lvl:6,def:13,fam:'H',look:3});
  BASES.gloves=[{name:'Leather Gloves',lvl:0,def:1,fam:'L'},{name:"Archer's Bracers",lvl:6,def:4,fam:'L'},{name:'Shadow Grips',lvl:12,def:7,fam:'L'},
    {name:'Mail Mitts',lvl:3,def:3,fam:'M'},{name:'Scale Gauntlets',lvl:10,def:6,fam:'M'},
    {name:'Iron Gauntlets',lvl:6,def:6,fam:'H'},{name:'Plate Gauntlets',lvl:12,def:10,fam:'H'}];
  BASES.boots=[{name:'Soft Boots',lvl:0,def:1,fam:'L'},{name:'Running Boots',lvl:6,def:4,fam:'L'},{name:'Shadow Treads',lvl:12,def:7,fam:'L'},
    {name:'Mail Chausses',lvl:3,def:3,fam:'M'},{name:'Scale Boots',lvl:10,def:6,fam:'M'},
    {name:'Sabatons',lvl:6,def:6,fam:'H'},{name:'Plate Sabatons',lvl:12,def:10,fam:'H'}];
  /* chest and boss rolls: the armour share is spread over four slots now, rings come up more than amulets (two fingers) */
  Object.assign(SLOTW,{weapon:32,armor:11,helm:9,gloves:8,boots:8,ring:10,amulet:6});
  /* which stats can roll there */
  const add=(list,k,slots)=>{ for(const a of list) if(a.k===k) for(const s of slots) if(!a.s.includes(s)) a.s.push(s); };
  add(PRE,'edef',['gloves','boots']); add(PRE,'life',['gloves','boots']); add(PRE,'crit',['gloves']); add(PRE,'ls',['gloves']);
  add(SUF,'ms',['boots']); add(SUF,'as',['gloves']); add(SUF,'life',['gloves','boots']); add(SUF,'mf',['gloves','boots']); add(SUF,'gf',['gloves']); add(SUF,'regen',['boots']); add(SUF,'thorns',['gloves','boots']);
  RN2.gloves=['Grip','Grasp','Fist','Clutch','Touch','Knuckle']; RN2.boots=['Stride','Tread','March','Step','Path','Heel'];
  UNIQUES.push(
    {name:"Hangman's Grip",slot:'gloves',base:'Iron Gauntlets',aff:[['edef',60,90],['crit',6,10],['ls',3,5]],fl:'Worn to the gallows every morning for thirty years.'},
    {name:"The Penitent's Wraps",slot:'gloves',base:'Leather Gloves',aff:[['as',12,18],['crit',8,12],['life',10,20]],fl:'Wound tight so the flail would not slip.'},
    {name:"Ilse's Errand",slot:'boots',base:'Soft Boots',aff:[['ms',14,20],['regen',2,3],['mf',20,35]],fl:'She ran these to the well and back, every morning of the siege.'},
    {name:'Sabatons of the Last Wall',slot:'boots',base:'Plate Sabatons',aff:[['edef',80,120],['life',25,40],['thorns',6,12]],fl:'They did not retreat. Neither did the man inside them.'});
  /* the armour kind of chest gives all four */
  if(typeof CKIND!=='undefined') CKIND.armour.slots=['armor','helm','gloves','boots'];
})();
/* family first, then the best base of it (sometimes the one below) */
function pickGearBase(slot,ilvl){ const all=BASES[slot].filter(b=>b.lvl<=ilvl+1); const fams=[...new Set(all.map(b=>b.fam).filter(Boolean))]; if(!fams.length) return all[all.length-1]||BASES[slot][0];
  const f=pick(fams), pool=all.filter(b=>b.fam===f).sort((a,b)=>b.lvl-a.lvl); return pool[pool.length>1&&R()<.3?1:0]; }

/* ---------- the second ring ---------- */
let EQ_TARGET=null;
function ringSlot(it){ if(EQ_TARGET==='ring'||EQ_TARGET==='ring2') return EQ_TARGET; if(!P.equip.ring) return 'ring'; if(!P.equip.ring2) return 'ring2';
  const sc=s=>{ const d=sheetWith(s,it).total, e=statsWith(s,it); return d/Math.max(1,sheetDps().total)+effLife(e)/Math.max(1,effLife(P.stats)); }; return sc('ring2')>sc('ring')?'ring2':'ring'; }
(function(){ const o=targetSlot; targetSlot=function(it){ if(it&&it.slot==='ring'&&P) return ringSlot(it); return o(it); }; })();
const SLOT_WORD={weapon:'main hand',off:'off hand',armor:'armour',helm:'helm',gloves:'gloves',boots:'boots',amulet:'amulet',ring:'ring',ring2:'second ring'};
/* every save and hero has the new places, empty if they're new */
(function(){ const o=calcStats; calcStats=function(){ if(P&&P.equip) for(const k of ['gloves','boots','ring2']) if(!(k in P.equip)) P.equip[k]=null; return o(); }; })();

/* ---------- icons ---------- */
function famCols(it){ const r=it.rarity, f=it.base.fam;
  if(r===5) return ['#1a0303','#5a0f0f','#ff5a40']; if(r===4) return ['#5a1a3e','#a03a78','#ff9ad4']; if(r===3) return ['#5a3410','#a8641e','#ffbe6a'];
  return f==='L'?['#2e2218','#6b5640','#9a8460']:f==='H'?['#3e424b','#8a909a','#d8dce2']:['#34373d','#5d626b','#8a909a']; }
(function(){ const o=getIcon; getIcon=function(it){ if(!it||(it.slot!=='gloves'&&it.slot!=='boots')) return o(it); if(it._ic) return it._ic;
  const c=document.createElement('canvas'); c.width=c.height=32; const g=c.getContext('2d'); const px=(x,y,w,h,col)=>{ g.fillStyle=col; g.fillRect(x,y,w,h); };
  const M=famCols(it), rc=RCOL[it.rarity], f=it.base.fam;
  if(it.slot==='gloves'){ px(9,13,13,12,M[1]); px(9,13,3,12,M[0]); for(let i=0;i<4;i++){ px(10+i*3,6+(i===0||i===3?2:0),3,8-(i===0||i===3?2:0),M[1]); px(10+i*3,6+(i===0||i===3?2:0),3,1,M[2]); }
    px(21,15,4,6,M[1]); px(24,15,1,6,M[2]); px(8,24,15,4,f==='H'?M[2]:M[0]); if(f==='H') for(let i=0;i<4;i++) px(10+i*3,10,3,1,M[0]); if(f==='M') for(let y=15;y<24;y+=2) for(let x=10;x<21;x+=2) px(x+(y%4?1:0),y,1,1,M[0]);
    if(it.rarity) px(15,18,2,2,rc); }
  else { px(11,5,9,17,M[1]); px(11,5,3,17,M[0]); px(11,20,15,7,M[1]); px(11,26,16,2,M[0]); px(22,21,5,1,M[2]); px(11,5,9,1,M[2]);
    if(f==='H'){ for(let y=8;y<20;y+=3) px(11,y,9,1,M[0]); px(19,5,1,22,M[2]); } else if(f==='M'){ for(let y=8;y<20;y+=2) for(let x=12;x<20;x+=2) px(x+(y%4?1:0),y,1,1,M[0]); } else { px(12,9,7,1,M[0]); px(12,14,7,1,M[0]); }
    if(it.rarity) px(15,12,2,2,rc); }
  it._ic=c; return c; }; })();
