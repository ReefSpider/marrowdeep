'use strict';
/* ===== v44 items: every kind of thing has a unique, and you see all of them (BT, 10 Nov: "items feel like i keep
   seeing the same ones … i didnt hit a bow or hammer once … the same sword over and over again for unique, are there
   equal items for each item type in each rarity?") =====
   They weren't equal. There were 21 uniques: two-handed swords had two (Widow's Promise, Grave Mother), and one-handed
   swords, spears, maces, mauls, great axes, cleavers, war hammers, light and medium body armour, light hoods, medium
   gloves and medium boots had none; rings and amulets had one each. A unique was picked evenly from the whole list.
   1. Fifteen new uniques, so every weapon kind and every armour slot in every family has at least one, and rings and
      amulets have three and two.
   2. Picking a unique goes by kind first: each weapon kind (class and hands) and each armour slot-and-family is equally
      likely, then a unique inside it, and loot memory turns away from uniques you've just found.
   3. Loot memory leans three times harder toward weapon classes you haven't seen lately (LM_K.cls 1 → 3), so a run
      meets hammers and crossbows; the flat crossbow boost (v43) comes down to ×2 (×4 on the Twin Crossbows Way). */
UNIQUES.push(
  {name:'Oath of Ash',slot:'weapon',base:'Arming Sword',aff:[['ed',80,120],['as',12,20],['life',15,25],['fin',6,10]],fl:'Sworn the night Kesh burned. Every swing keeps it.'},
  {name:'The Long Goodbye',slot:'weapon',base:'Glaive',aff:[['ed',90,140],['crit',8,14],['ms',6,10],['fin',5,8]],fl:'Held them off at arm\'s length. Then at a spear\'s.'},
  {name:'Confessor',slot:'weapon',base:'Flanged Mace',aff:[['ed',80,120],['crit',10,16],['ls',3,6],['mig',6,10]],fl:'Everyone tells the truth eventually.'},
  {name:'Gravel Saint',slot:'weapon',base:'Maul',aff:[['ed',120,170],['life',20,35],['thorns',8,14],['fort',6,10]],fl:'They carved a saint from a millstone. It would not stay carved.'},
  {name:"Headtaker's Wage",slot:'weapon',base:'Great Axe',aff:[['ed',120,170],['crit',10,16],['ls',4,8],['mig',6,10]],fl:'Paid by the head. Never short.'},
  {name:'Hunger Moon',slot:'weapon',base:"Butcher's Cleaver",aff:[['ed',80,130],['ls',6,10],['as',8,14]],fl:'Hung in a cold room all winter. Came out hungry.'},
  {name:'The Nail and the Word',slot:'weapon',base:'War Hammer',aff:[['ed',90,130],['crit',8,12],['as',6,10],['mig',8,12]],fl:'One to build the gallows. One to read beneath it.'},
  {name:'Mantle of the Last Hunt',slot:'armor',base:"Hunter's Coat",aff:[['edef',70,110],['ms',10,15],['as',8,14],['fin',8,12]],fl:'Whatever it chased, it did not come back without.'},
  {name:'Hollowmere Colours',slot:'armor',base:'Brigandine',aff:[['edef',80,120],['life',20,35],['crit',6,10],['mig',6,10]],fl:'The regiment\'s colours, stitched inside where no one could strip them.'},
  {name:'The Quiet Hood',slot:'helm',base:"Ranger's Cowl",aff:[['crit',10,16],['ms',8,12],['mf',10,20],['fin',6,10]],fl:'The last thing a sentry never heard.'},
  {name:"Ferryman's Palms",slot:'gloves',base:'Scale Gauntlets',aff:[['edef',40,70],['as',10,16],['ls',3,6]],fl:'Two coins, pressed into them and never let go.'},
  {name:"Pilgrim's Last Mile",slot:'boots',base:'Mail Chausses',aff:[['ms',12,18],['life',15,25],['fort',6,10]],fl:'Worn through at the heel. Not at the toe.'},
  {name:"Widow's Band",slot:'ring',base:'Iron Ring',aff:[['crit',8,14],['ls',3,6],['life',15,25]],fl:'She never took it off. Someone did.'},
  {name:"The Saint's Knuckle",slot:'ring',base:'Iron Ring',aff:[['regen',2,4],['life',20,35],['fort',6,10]],fl:'A relic, sold by the knuckle. This is the only true one.'},
  {name:'Lantern of the Drowned',slot:'amulet',base:'Bone Amulet',aff:[['as',10,16],['crit',6,10],['mf',20,35]],fl:'It still lights the way down. Only down.'});
Object.assign(SIG_EL,{'Oath of Ash':'fire','The Long Goodbye':'wind','Confessor':'holy','Gravel Saint':'bone',"Headtaker's Wage":'blood','Hunger Moon':'blood',
  'The Nail and the Word':'holy','Mantle of the Last Hunt':'wind','Hollowmere Colours':'water','The Quiet Hood':'shadow',"Ferryman's Palms":'water',"Pilgrim's Last Mile":'bone',
  "Widow's Band":'blood',"The Saint's Knuckle":'holy','Lantern of the Drowned':'water'});

/* ---------- picking a unique: by kind first ---------- */
function uniqKind(d){ const b=baseByName(d.base); if(!b) return d.slot; return d.slot==='weapon'?'w:'+b.cls+':'+(b.h==null?1:b.h):d.slot+':'+(b.fam||'-'); }
function pickUnique(list,slots){ const pool=list.filter(d=>!slots||slots.includes(d.slot)); if(!pool.length) return null; const n={};
  for(const d of pool){ const k=uniqKind(d); n[k]=(n[k]||0)+1; }
  const mem=typeof LM!=='undefined'&&LM.on&&!LM.off; const w={}; pool.forEach((d,i)=>{ w[i]=(1/n[uniqKind(d)])*(mem?lmW(LM.uniq,d.name,LM_K.uniq):1); }); return pool[+wpick(w)]; }
(function(){ const o=mkFixed; mkFixed=function(def,rar){ if(!def||rar<4) return o(def,rar); const list=rar===5?ABYSSAL:UNIQUES; if(!list.includes(def)) return o(def,rar);
  const slots=(typeof KIND_FORCE!=='undefined'&&KIND_FORCE&&typeof CKIND!=='undefined')?CKIND[KIND_FORCE].slots:null; const pick2=pickUnique(list,slots)||def;
  /* the older wrappers (play37 loot memory, play38 chest kind) would pick again: this pick already honours both */
  const sv=typeof LM!=='undefined'?LM.off:null; if(sv!=null) LM.off=true; try{ return o(pick2,rar); } finally{ if(sv!=null) LM.off=sv; } }; })();

/* ---------- loot memory leans harder toward unseen weapon classes ---------- */
if(typeof LM_K!=='undefined') LM_K.cls=3;
if(typeof L46!=='undefined'){ L46.xbow=2; L46.xbowWay=4; }
