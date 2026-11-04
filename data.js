'use strict';
/* ===== data: loot tables, weapons, moves, skills, enemies, levels, story ===== */
const RAR=['Normal','Magic','Rare','Legendary','Unique','Abyssal'];
const RCOL=['#cfc8b8','#8484ff','#f2e46e','#ff8a1e','#ff4fb4','#ff4a3d'];
const RGLOW=['rgba(207,200,184,.10)','rgba(132,132,255,.30)','rgba(242,228,110,.28)','rgba(255,138,30,.42)','rgba(255,79,180,.48)','rgba(255,40,30,.7)'];
/* h: 1 one-handed, 2 two-handed, 0 off-hand only */
const BASES={
  weapon:[
    {name:'Rusted Falchion',lvl:0,min:3,max:7,spd:1.05,cls:'sword',h:1,len:19,wid:4},
    {name:'Misericorde',lvl:0,min:2,max:5,spd:1.3,cls:'dagger',h:1,len:10,wid:2},
    {name:'Hatchet',lvl:1,min:4,max:8,spd:1,cls:'axe',h:1,len:15,wid:3},
    {name:'Buckler',lvl:1,min:0,max:0,spd:1,cls:'shield',h:0,def:4,len:0,wid:0},
    {name:'Arming Sword',lvl:2,min:4,max:10,spd:1.05,cls:'sword',h:1,len:22,wid:4},
    {name:'Boar Spear',lvl:2,min:5,max:11,spd:.98,cls:'spear',h:2,len:36,wid:2},
    {name:'Flanged Mace',lvl:2,min:5,max:10,spd:.95,cls:'mace',h:1,len:16,wid:3},
    {name:'Hand Crossbow',lvl:2,min:6,max:12,spd:.9,cls:'xbow',h:0,len:12,wid:4},
    {name:'Bastard Sword',lvl:3,min:6,max:13,spd:1,cls:'sword',h:2,len:25,wid:5},
    {name:'Bearded Axe',lvl:5,min:7,max:14,spd:.95,cls:'axe',h:1,len:18,wid:4},
    {name:'Zweihander',lvl:6,min:10,max:19,spd:.92,cls:'sword',h:2,len:30,wid:5},
    {name:'Kris',lvl:6,min:5,max:11,spd:1.3,cls:'dagger',h:1,len:12,wid:2},
    {name:'War Scythe',lvl:6,min:10,max:21,spd:.88,cls:'scythe',h:2,len:34,wid:3},
    {name:'Maul',lvl:7,min:13,max:25,spd:.8,cls:'mace',h:2,len:28,wid:7},
    {name:'Pavise',lvl:8,min:0,max:0,spd:1,cls:'shield',h:0,def:12,len:0,wid:0},
    {name:'Glaive',lvl:8,min:11,max:23,spd:.9,cls:'spear',h:2,len:38,wid:3},
    {name:'Great Axe',lvl:9,min:14,max:28,spd:.84,cls:'axe',h:2,len:30,wid:6},
    {name:"Headsman's Blade",lvl:10,min:14,max:26,spd:.86,cls:'sword',h:2,len:26,wid:7},
    {name:'Arbalest',lvl:11,min:14,max:24,spd:.8,cls:'xbow',h:0,len:16,wid:5},
    {name:'Iron Slab',lvl:15,min:20,max:40,spd:.78,cls:'sword',h:2,len:34,wid:8},
    {name:"Butcher's Cleaver",lvl:1,min:4,max:9,spd:1.02,cls:'cleaver',h:1,len:13,wid:6},
    {name:'Grave Sickle',lvl:2,min:3,max:8,spd:1.18,cls:'sickle',h:1,len:12,wid:2},
    {name:"Penitent's Flail",lvl:3,min:5,max:12,spd:.95,cls:'flail',h:1,len:14,wid:5},
    {name:'Uchigatana',lvl:4,min:5,max:11,spd:1.12,cls:'katana',h:1,len:24,wid:3},
    {name:'War Hammer',lvl:5,min:7,max:14,spd:.9,cls:'hammer',h:1,len:16,wid:6},
    {name:'Estoc',lvl:6,min:6,max:13,spd:1.15,cls:'rapier',h:1,len:26,wid:2},
    {name:'Morning Star',lvl:8,min:10,max:19,spd:.9,cls:'flail',h:1,len:16,wid:7},
    {name:'Repeater',lvl:9,min:9,max:16,spd:1.25,cls:'xbow',h:0,len:14,wid:5},
    {name:'Halberd',lvl:11,min:13,max:26,spd:.86,cls:'spear',h:2,len:38,wid:3},
    {name:'Nodachi',lvl:12,min:13,max:27,spd:1,cls:'katana',h:2,len:32,wid:3},
    {name:'Great Hammer',lvl:13,min:18,max:36,spd:.76,cls:'hammer',h:2,len:28,wid:9}
  ],
  armor:[{name:'Quilted Gambeson',lvl:0,def:5},{name:'Ring Mail',lvl:3,def:11},{name:'Brigandine',lvl:6,def:19},{name:'Plate Cuirass',lvl:10,def:30},{name:'Blackened Plate',lvl:15,def:44}],
  helm:[{name:'Kettle Hat',lvl:0,def:3},{name:'Barbute',lvl:3,def:6},{name:'Bascinet',lvl:6,def:10},{name:'Great Helm',lvl:10,def:15},{name:'Hound Visor',lvl:15,def:22}],
  ring:[{name:'Iron Ring',lvl:0}], amulet:[{name:'Bone Amulet',lvl:0}]
};
const baseByName=n=>{for(const s in BASES)for(const b of BASES[s])if(b.name===n)return b;};
const SLOTW={weapon:32,armor:18,helm:18,ring:16,amulet:16};
const FMT={ed:v=>`+${v}% Enhanced Damage`,edef:v=>`+${v}% Enhanced Defense`,ls:v=>`${v}% Life Stolen Per Hit`,fire:v=>`Adds ${v} Fire Damage`,life:v=>`+${v} to Life`,crit:v=>`+${v}% Critical Strike`,ms:v=>`+${v}% Faster Run/Walk`,as:v=>`+${v}% Increased Attack Speed`,gf:v=>`${v}% Extra Gold from Monsters`,mf:v=>`${v}% Better Chance of Getting Magic Items`,regen:v=>`Replenish Life +${v}`,thorns:v=>`Attacker Takes Damage of ${v}`,
  water:v=>`Adds ${v} Water Damage`,blood:v=>`Adds ${v} Blood Damage`,wind:v=>`Adds ${v} Wind Damage`,bone:v=>`Adds ${v} Bone Damage`,
  cold:v=>`Adds ${v} Cold Damage`,shock:v=>`Adds ${v} Lightning Damage`,poison:v=>`Adds ${v} Poison Damage`,holy:v=>`Adds ${v} Holy Damage`,shadow:v=>`Adds ${v} Shadow Damage`};
const PRE=[
  {n:['Jagged','Cruel','Savage','Merciless'],k:'ed',s:['weapon'],v:[[15,30],[31,55],[56,85],[86,130]]},
  {n:['Sturdy','Strong','Glorious','Blessed'],k:'edef',s:['armor','helm','shield'],v:[[15,30],[31,55],[56,85],[86,120]]},
  {n:['Bloody','Vampiric'],k:'ls',s:['weapon','ring'],v:[[2,4],[5,8]]},
  {n:['Smoldering','Burning','Infernal'],k:'fire',s:['weapon','ring','amulet'],v:[[1,4],[4,9],[9,16]]},
  {n:['Hale','Robust','Iron-Blooded'],k:'life',s:['armor','helm','ring','amulet','shield'],v:[[5,12],[12,22],[22,36]]},
  {n:['Keen','Deadly'],k:'crit',s:['weapon','helm','amulet'],v:[[3,7],[8,14]]},
  {n:['Chilling','Frozen','Glacial'],k:'cold',s:['weapon','ring','amulet'],v:[[1,4],[4,9],[9,16]]},
  {n:['Static','Shocking','Thundering'],k:'shock',s:['weapon','ring','amulet'],v:[[1,6],[4,12],[9,22]]},
  {n:['Septic','Venomous','Pestilent'],k:'poison',s:['weapon','ring','amulet'],v:[[2,6],[5,12],[11,22]]},
  {n:['Hallowed','Sanctified','Saintly'],k:'holy',s:['weapon','ring','amulet'],v:[[1,4],[3,8],[7,14]]},
  {n:['Umbral','Shadowed','Abyss-Touched'],k:'shadow',s:['weapon','ring','amulet'],v:[[1,4],[4,9],[9,16]]},
  {n:['Brackish','Drowning','Tidal'],k:'water',s:['weapon','ring','amulet'],v:[[1,4],[4,9],[9,16]]},
  {n:['Lacerating','Serrated','Butchering'],k:'blood',s:['weapon','ring','amulet'],v:[[1,5],[4,10],[9,18]]},
  {n:['Gusting','Howling','Tempest'],k:'wind',s:['weapon','ring','amulet'],v:[[1,4],[4,8],[8,15]]},
  {n:['Splintered','Ossified','Marrow-Cracked'],k:'bone',s:['weapon','ring','amulet'],v:[[1,4],[4,9],[9,16]]}
];
/* every item carries at most one damage type */
const ELEM_KEYS=['fire','cold','shock','water','poison','holy','shadow','blood','wind','bone'];
const SUF=[
  {n:['of Haste','of Speed'],k:'ms',s:['armor','ring','amulet'],v:[[5,10],[10,18]]},
  {n:['of Readiness','of Alacrity','of Fervor'],k:'as',s:['weapon','ring','amulet','helm'],v:[[5,10],[10,18],[18,26]]},
  {n:['of the Leech','of the Lamprey'],k:'ls',s:['weapon','ring','amulet'],v:[[2,4],[4,7]]},
  {n:['of Vitality','of the Ox','of the Colossus'],k:'life',s:['weapon','armor','helm','ring','amulet','shield'],v:[[6,12],[12,24],[24,40]]},
  {n:['of Fortune','of Greed'],k:'gf',s:['helm','ring','amulet'],v:[[10,25],[25,60]]},
  {n:['of Luck','of Chance'],k:'mf',s:['helm','ring','amulet'],v:[[5,12],[12,25]]},
  {n:['of Mending','of Regrowth'],k:'regen',s:['armor','helm','ring','amulet','shield'],v:[[1,2],[2,4]]},
  {n:['of Thorns','of Spite'],k:'thorns',s:['armor','helm','shield'],v:[[2,5],[5,12]]}
];
const RN1=['Grim','Ash','Carrion','Dread','Bone','Hollow','Rust','Gloom','Blood','Raven','Ghoul','Sorrow','Wraith','Pale','Doom','Debt','Siege','Ember'];
const RN2={weapon:['Bite','Edge','Song','Thirst','Mercy','Fang','Cleaver','Psalm','Verdict'],shield:['Ward','Wall','Bulwark','Lid'],armor:['Shroud','Hide','Shell','Coat','Carapace'],helm:['Visor','Cowl','Crest','Mask','Brow'],ring:['Loop','Coil','Band','Knot','Eye'],amulet:['Heart','Charm','Locket','Ward','Sigil']};
const UNIQUES=[
  {name:"Widow's Promise",slot:'weapon',base:'Bastard Sword',aff:[['ed',70,110],['ls',4,8],['life',10,20]],fl:'She told him to come home. He kept the blade instead.'},
  {name:'Grave Mother',slot:'weapon',base:'Zweihander',aff:[['ed',120,170],['crit',12,20],['ms',-10,-10]],fl:'Heavy as the first shovel of earth.'},
  {name:'The Mourning Hatchet',slot:'weapon',base:'Bearded Axe',aff:[['ed',80,120],['crit',8,14],['ls',3,6]],fl:'Cut firewood for a funeral. Then cut the mourners.'},
  {name:"Sister's Needle",slot:'weapon',base:'Kris',aff:[['ed',60,100],['crit',18,26],['as',10,20]],fl:'Small enough to hide in a sleeve. Sharp enough to matter.'},
  {name:'Gravedigger',slot:'weapon',base:'War Scythe',aff:[['ed',100,150],['ls',5,9],['mf',15,30]],fl:'It has buried more men than plague.'},
  {name:'Penance',slot:'weapon',base:'Hand Crossbow',aff:[['ed',90,140],['fire',6,12],['crit',10,16]],fl:'Each bolt is wrapped in a confession.'},
  {name:'Last Wall of Hollowmere',slot:'weapon',base:'Pavise',aff:[['edef',120,180],['life',30,50],['thorns',10,20]],fl:'Painted with the city crest. The paint is mostly gone. The wall is not.'},
  {name:'Ironheart',slot:'armor',base:'Plate Cuirass',aff:[['edef',90,130],['life',20,35],['thorns',5,10]],fl:'The smith hammered his son\'s name inside. No one has read it since.'},
  {name:'Hollow Crown',slot:'helm',base:'Bascinet',aff:[['crit',14,22],['regen',2,4],['mf',15,30]],fl:'A king wore it into the Pit. The Pit kept the king.'},
  {name:'Last Wage',slot:'ring',base:'Iron Ring',aff:[['as',18,28],['fire',5,10],['gf',30,60]],fl:'Pressed into a palm. Never spent.'},
  {name:'Kagerō',slot:'weapon',base:'Uchigatana',aff:[['ed',90,140],['shock',6,14],['as',10,20]],fl:'Heat-haze. You see the cut after it is over.'},
  {name:"The Flagellant's Due",slot:'weapon',base:"Penitent's Flail",aff:[['ed',80,130],['poison',8,16],['ls',3,6]],fl:'Every lash a prayer. Every prayer a little louder.'},
  {name:'Bellbreaker',slot:'weapon',base:'Great Hammer',aff:[['ed',130,190],['holy',10,20],['crit',8,14]],fl:'Rang the last bell of the chapel. Then rang the bell-ringer.'},
  {name:'Winter Psalm',slot:'weapon',base:'Estoc',aff:[['ed',80,120],['cold',8,16],['crit',10,16]],fl:'Sung once, over a frozen river. The river listened.'},
  {name:"Rook's Sickle",slot:'weapon',base:'Grave Sickle',aff:[['ed',70,110],['shadow',6,12],['ms',8,12]],fl:'The crows taught a farmer what to harvest.'},
  {name:'Hollowmere Repeater',slot:'weapon',base:'Repeater',aff:[['ed',90,140],['fire',6,12],['as',15,25]],fl:'Issued to the wall. Returned by no one.'},
  {name:"The Debtor's Chain",slot:'amulet',base:'Bone Amulet',aff:[['gf',60,100],['mf',20,35],['life',-10,-10]],fl:'Every link a promissory note.'}
];
const ABYSSAL=[
  {name:'The Unpaid Debt',slot:'weapon',base:'Iron Slab',aff:[['ed',380,500],['ls',10,15],['crit',28,40],['life',60,100],['as',20,30]],fl:'Everything you ever owed, swung all at once.'},
  {name:"Ilse's Candle",slot:'amulet',base:'Bone Amulet',aff:[['life',100,150],['regen',8,12],['mf',150,220],['gf',200,260]],fl:'It never went out. Not once. Not even after.'},
  {name:"Rope's End",slot:'armor',base:'Blackened Plate',aff:[['edef',300,400],['life',110,150],['thorns',40,60],['ms',18,25]],fl:'The last thing anyone holds on the way down.'},
  {name:'Mujō',slot:'weapon',base:'Nodachi',aff:[['ed',360,480],['shock',30,55],['ls',8,12],['crit',25,35],['as',20,30]],fl:'Nothing stays. Not even the wound it leaves.'},
  {name:"The Hound's Jaw",slot:'helm',base:'Hound Visor',aff:[['crit',30,45],['ls',8,12],['as',20,30],['life',60,90]],fl:'It was never a helmet. It was always teeth.'}
];
/* legendaries replaced set items (v13): a random base, five or six strong stats, a name from LEG1 */
const LEG1=['Oathbound','Gravesworn',"The Ash King's",'Hollowmere','Red Hour','Widowmaker\'s','Last Vigil','Penitent\'s','Crowbitten','Saint-Flayer\'s','Marrowborn','Bellwright\'s','Pyrewalker\'s','Debtless','Woundwatcher\'s','Unburied','Ninefold','Ilse\'s Promised'];
const SETS={hound:{name:"The Hound's Oath",bonus:[[2,[['life',25]]],[3,[['as',20],['ls',5]]]]}};
const SETP=[
  {name:"Hound's Visor",slot:'helm',base:'Barbute',aff:[['edef',50,70],['crit',6,10]],set:'hound'},
  {name:"Hound's Hide",slot:'armor',base:'Brigandine',aff:[['edef',40,60],['thorns',4,8],['life',15,25]],set:'hound'},
  {name:"Hound's Tooth",slot:'ring',base:'Iron Ring',aff:[['ls',3,5],['fire',4,7]],set:'hound'}
];
/* stat grades */
const GR=[{n:'Low',c:'#8a8078',w:40},{n:'Fair',c:'#8484ff',w:34},{n:'High',c:'#f2e46e',w:19},{n:'Max',c:'#ffcf6a',w:6.6},{n:'Abyssal',c:'#ff4a3d',w:.4}];
const AFX={water:['+','','Water Damage'],blood:['+','','Blood Damage'],wind:['+','','Wind Damage'],bone:['+','','Bone Damage'],cold:['+','','Cold Damage'],shock:['+','','Lightning Damage'],poison:['+','','Poison Damage'],holy:['+','','Holy Damage'],shadow:['+','','Shadow Damage'],ed:['+','%','Enhanced Damage'],edef:['+','%','Enhanced Defense'],ls:['','%','Life Stolen'],fire:['+','','Fire Damage'],life:['+','','to Life'],crit:['+','%','Critical Strike'],ms:['+','%','Run Speed'],as:['+','%','Attack Speed'],gf:['+','%','Gold Find'],mf:['+','%','Magic Find'],regen:['+','/s','Life Regen'],thorns:['','','Thorns']};

/* ===== combat moves. t: arc | spin | slam | thrust | plunge | shoot | block ===== */
const MV={
  slash:{t:'arc',a0:-2.6,a1:.95,dur:.30,act:[.2,.55],dm:1,kb:110,reach:38,lunge:70,nm:'Slash'},
  back:{t:'arc',a0:1.0,a1:-2.1,dur:.28,act:[.2,.55],dm:1.05,kb:120,reach:36,lunge:50,nm:'Backhand'},
  chop:{t:'arc',a0:-2.0,a1:1.3,dur:.32,act:[.22,.55],dm:1.2,kb:140,reach:32,lunge:50,nm:'Chop'},
  sweep:{t:'arc',a0:-.7,a1:1.8,dur:.36,act:[.18,.6],dm:1.15,kb:150,reach:36,lunge:30,nm:'Sweep'},
  spin:{t:'spin',a0:-.4,a1:-.4+Math.PI*2,dur:.42,act:[.12,.82],dm:1.25,kb:170,reach:40,lunge:110,hop:-120,nm:'Spin'},
  whirl:{t:'spin',a0:-.4,a1:-.4+Math.PI*4,dur:.64,act:[.08,.9],dm:.95,kb:150,reach:44,lunge:130,hop:-140,multi:1,turns:2,nm:'Whirlwind'},
  reap:{t:'spin',a0:-1.2,a1:-1.2+Math.PI*2,dur:.48,act:[.15,.8],dm:1.35,kb:180,reach:40,lunge:60,nm:'Reap'},
  flip:{t:'spin',a0:-.4,a1:-.4+Math.PI*2,dur:.34,act:[.1,.85],dm:1.1,kb:110,reach:28,hop:-200,nm:'Flip'},
  cleave:{t:'slam',a0:-1.75,a1:1.45,dur:.5,act:[.38,.6],dm:1.9,kb:240,reach:46,lunge:90,nm:'Cleave'},
  thrust:{t:'thrust',a0:.05,a1:.05,dur:.36,act:[.25,.6],dm:1.6,kb:260,reach:56,lunge:270,nm:'Lunge'},
  pike:{t:'thrust',a0:.02,a1:.02,dur:.28,act:[.25,.6],dm:1.05,kb:120,reach:34,lunge:70,nm:'Pike'},
  lunge2:{t:'thrust',a0:.02,a1:.02,dur:.4,act:[.25,.62],dm:1.7,kb:280,reach:40,lunge:300,nm:'Long Lunge'},
  rise:{t:'arc',a0:1.35,a1:-1.7,dur:.36,act:[.2,.55],dm:1.3,kb:60,reach:38,lunge:60,hop:-230,launch:1,nm:'Riser'},
  aerial:{t:'spin',a0:-.4,a1:-.4+Math.PI*2,dur:.34,act:[.1,.85],dm:.9,kb:120,reach:36,hop:-60,nm:'Aerial Spin'},
  plunge:{t:'plunge',a0:1.57,a1:1.57,dur:1.1,act:[0,1],dm:2,kb:200,reach:18,nm:'Plunge'},
  jab:{t:'thrust',a0:.1,a1:.1,dur:.22,act:[.25,.6],dm:.8,kb:80,reach:24,lunge:50,nm:'Jab'},
  hook:{t:'arc',a0:-1.3,a1:1.0,dur:.27,act:[.2,.55],dm:1,kb:110,reach:24,lunge:40,nm:'Hook'},
  bash:{t:'thrust',a0:0,a1:0,dur:.3,act:[.2,.5],dm:.6,kb:280,reach:22,lunge:140,stun:1,nm:'Shield Bash'},
  shoot:{t:'shoot',a0:0,a1:0,dur:.34,act:[.28,.3],dm:1,kb:60,reach:0,nm:'Bolt'},
  kesa:{t:'arc',a0:-2.3,a1:1.4,dur:.24,act:[.18,.5],dm:1.05,kb:100,reach:40,lunge:80,nm:'Kesa Cut'},
  lash:{t:'arc',a0:-2.8,a1:1.6,dur:.38,act:[.25,.66],dm:1.25,kb:170,reach:46,lunge:30,nm:'Lash'},
  smash:{t:'slam',a0:-1.9,a1:1.5,dur:.56,act:[.4,.62],dm:2.2,kb:280,reach:40,lunge:40,nm:'Smash'},
  flurry:{t:'thrust',a0:.02,a1:.02,dur:.18,act:[.2,.6],dm:.75,kb:60,reach:42,lunge:40,nm:'Flurry'}
};
function comboFor(it){ if(!it) return ['jab','hook']; const b=it.base, c=b.cls;
  if(c==='sword'){ if(b.h===1) return ['slash','back','spin','thrust']; if(b.name==='Zweihander') return ['slash','whirl','cleave']; if(b.name==="Headsman's Blade") return ['cleave','spin','rise','cleave']; return ['slash','spin','cleave']; }
  if(c==='axe') return b.h===1?['chop','back','spin']:['chop','spin','cleave'];
  if(c==='mace') return b.h===1?['chop','slash','cleave']:['cleave','spin','cleave'];
  if(c==='katana') return b.h===1?['kesa','back','kesa','thrust']:['kesa','spin','kesa','cleave'];
  if(c==='hammer') return b.h===1?['chop','smash']:['smash','spin','smash'];
  if(c==='spear'&&b.name==='Halberd') return ['sweep','pike','cleave'];
  return {dagger:['jab','jab','hook','flip'],spear:['pike','pike','sweep','lunge2'],scythe:['reap','whirl','reap'],xbow:['shoot'],shield:['bash'],flail:['lash','back','spin'],rapier:['flurry','flurry','pike','lunge2'],cleaver:['chop','chop','back','spin'],sickle:['hook','back','reap']}[c]||['slash']; }
function offComboFor(it){ const c=it.base.cls; return {dagger:['jab','jab','hook'],sword:['slash','back'],axe:['chop','back'],mace:['chop'],xbow:['shoot'],shield:['block'],katana:['kesa','back'],flail:['lash'],hammer:['chop'],rapier:['flurry','flurry'],cleaver:['chop','back'],sickle:['hook','back']}[c]||['slash']; }
const WEAPON_TYPE={sword:'Sword',dagger:'Dagger',axe:'Axe',spear:'Polearm',mace:'Mace',scythe:'Scythe',xbow:'Crossbow',shield:'Shield',katana:'Katana',flail:'Flail',hammer:'Hammer',rapier:'Rapier',cleaver:'Cleaver',sickle:'Sickle'};

/* ===== skill tree: abilities, not stat buffs ===== */
const BRANCH=[{n:'Steel',jp:'鋼',c:'#d8d0c0'},{n:'Blood',jp:'血',c:'#d0352c'},{n:'Ash',jp:'灰',c:'#9aa3b8'}];
const TIER_LVL=[2,4,6,9,12];
const SKILLS=[
  {id:'off',br:0,tier:0,k:'双',name:'Second Hand',desc:'Wield a one-handed weapon, shield or crossbow in your off hand. Right-click or K to use it. Two-handed weapons leave no hand free.'},
  {id:'iai',br:0,tier:1,k:'居',name:'Iaidō',desc:'On the ground, hold Down + Strike to sheathe and wait. Release to cut through everything ahead. The wounds open a heartbeat later.'},
  {id:'clar',br:0,tier:2,k:'澄',name:'Clarity',desc:'Roll through a blow at the last instant, or parry with a shield, and the world slows. Every strike in that stillness is critical.'},
  {id:'exe',br:0,tier:3,k:'断',name:'Execution',desc:'Broken enemies (below 20% life, launched or stunned) bear a red mark. Your next strike on them kills, and it feeds you.'},
  {id:'thou',br:0,tier:4,k:'千',name:'Thousand Cuts',desc:'The last blow of every main-hand combo leaves six phantom blades in the air around you. They fall a moment later.'},
  {id:'hem',br:1,tier:0,k:'血',name:'Hemorrhage',key:'1',desc:'Open your palm and throw a lance of your own blood. It costs life and pierces everything. Each enemy it passes through gives some back.'},
  {id:'teth',br:1,tier:1,k:'鎖',name:'Red Tether',key:'2',desc:'Fling a chain of blood up and ahead (hold Up for straight up). It catches stone and flesh, and drags you to it.'},
  {id:'feast',br:1,tier:2,k:'喰',name:'Feast',desc:'The dead spill blood orbs. Walk through them to drink life and grit.'},
  {id:'hound',br:1,tier:3,k:'獣',name:'The Hound',key:'3',desc:'Rage builds as you bleed and make others bleed. At full rage, let the Hound wear you: black iron, faster blows, stolen life, no flinching.'},
  {id:'pact',br:1,tier:4,k:'契',name:'Crimson Pact',desc:'Hemorrhage splits into three lances. Red Tether drags enemies to you instead of you to them.'},
  {id:'wing',br:2,tier:0,k:'翼',name:'Ash Wings',desc:'Jump again in midair on a burst of grave ash.'},
  {id:'claw',br:2,tier:1,k:'爪',name:'Grave Claw',desc:'Cling to walls and slide down them. Jump off to climb higher.'},
  {id:'shade',br:2,tier:2,k:'影',name:'Shade Step',desc:'Your roll leaves a shade where you stood. It copies your next attack from there.'},
  {id:'bell',br:2,tier:3,k:'鐘',name:'Funeral Bell',key:'4',desc:'Toll a bell no one else can hear. Everything near you is stunned and shaken.'},
  {id:'last',br:2,tier:4,k:'息',name:'Last Breath',desc:'Once per level, refuse death. Become a shade for a few seconds, untouchable and burning, then crawl back with a third of your life.'}
];
const SK=Object.fromEntries(SKILLS.map(s=>[s.id,s]));

/* ===== enemies ===== */
const EDEF={
  ghoul:{w:10,h:18,hp:22,dmg:8,spd:50,xp:6,name:'Ghoul'},
  wraith:{w:12,h:16,hp:16,dmg:7,spd:60,xp:7,fly:1,name:'Wraith'},
  brute:{w:18,h:32,hp:95,dmg:18,spd:30,xp:26,name:'Carrion Brute'},
  husk:{w:11,h:24,hp:34,dmg:11,spd:42,xp:11,name:'Ashen Husk'},
  bloat:{w:16,h:20,hp:30,dmg:26,spd:22,xp:9,name:'Bloat'},
  crawler:{w:9,h:8,hp:9,dmg:5,spd:88,xp:3,name:'Wretchling'},
  archer:{w:10,h:22,hp:18,dmg:9,spd:30,xp:9,name:'Hollow Archer'},
  hanged:{w:10,h:26,hp:30,dmg:12,spd:50,xp:12,name:'The Hanged'},
  witch:{w:12,h:20,hp:28,dmg:10,spd:45,xp:15,fly:1,name:'Lantern Witch'}
};
const CHAMP=['Hollow-Eyed','Gravebound','Flayed','Weeping','Rot-Kissed','Ashen','Unpaid','Oathless'];

/* ===== palettes ===== */
const PALS={
  surface:{sky:['#0c0a18','#3a1c24','#6a2c12'],shaft:'rgba(255,150,80,',stone:['#4a4448','#524b50','#433d42','#5a5258'],mortar:'#221d22',cap:'#6e6468',hi:'#9a8e88',amb:[.52,.44,.48],surface:1},
  ossuary:{sky:['#161115','#3b2a2b','#1b1416'],shaft:'rgba(225,198,150,',stone:['#38323a','#3f3842','#342e37','#463e48'],mortar:'#1d181f',cap:'#5c5258',hi:'#86786f',amb:[.42,.38,.42],motif:'arches'},
  chapel:{sky:['#0d1317','#22343a','#0e1618'],shaft:'rgba(170,205,210,',stone:['#2e383c','#334046','#2a3337','#3a474c'],mortar:'#141b1e',cap:'#4b5a5c',hi:'#7f918e',amb:[.34,.39,.44],motif:'windows'},
  warren:{sky:['#19110b','#3e2818','#1b120c'],shaft:'rgba(235,170,100,',stone:['#3d3128','#45372c','#372c24','#4d3e31'],mortar:'#20170e',cap:'#665140',hi:'#97795a',amb:[.46,.37,.31],motif:'scaffold'},
  kiln:{sky:['#1b0b0b','#4a1a14','#1e0c0b'],shaft:'rgba(255,140,90,',stone:['#3a2726','#43302d','#332221','#4b3532'],mortar:'#1e1010',cap:'#664642',hi:'#9a6a5e',amb:[.47,.31,.29],motif:'furnace'},
  breach:{sky:['#120908','#3c1a10','#150a08'],shaft:'rgba(255,110,60,',stone:['#332a2a','#3b3030','#2d2424','#433636'],mortar:'#170f0f',cap:'#5c4a48',hi:'#8c6e66',amb:[.44,.32,.3],motif:'ruin'},
  wound:{sky:['#1a0404','#5a0e0a','#2a0606'],shaft:'rgba(255,60,40,',stone:['#3a3034','#423638','#34292c','#4a3c3e'],mortar:'#1a1214',cap:'#5a4648',hi:'#8a6a64',amb:[.55,.3,.3],surface:1}
};

/* ===== the campaign ===== */
const LEVELS=[
  {id:'wall',kind:'surface',name:'The Hollowmere Wall',jp:'ホロウミアの城壁',act:'Prologue',pal:'surface',cols:6,env:'war',enemies:{husk:5,archer:2,ghoul:2,hound:2},packs:[{t:'husk',n:[3,4]},{t:'hound',n:[3,5]}],packP:.4,bg:['fireball','fireball','crows','lightning','clash']},
  {id:'ossuary',kind:'dungeon',name:'The Ossuary Stair',jp:'骨の階段',act:'Act I',pal:'ossuary',cols:6,rows:3,up:.4,env:'bone',enemies:{ghoul:5,crawler:3,wraith:2,bloat:1,brute:.6,swarm:1.5,spitter:1.5,hound:1},packs:[{t:'ghoul',n:[5,8]},{t:'crawler',n:[6,9]},{t:'swarm',n:[3,5]}],packP:.5,bg:['eyes','falling','colossus','eyes','hand']},
  {id:'mother',kind:'boss',boss:'mother',name:'The Cradle',jp:'揺りかご',act:'Act I',pal:'ossuary',bg:['eyes','falling']},
  {id:'chapel',kind:'dungeon',name:'The Drowned Chapel',jp:'溺れた礼拝堂',act:'Act II',pal:'chapel',cols:6,rows:4,up:.45,env:'water',enemies:{ghoul:3,hanged:3,wraith:3,witch:1,bloat:2,crawler:2,nun:1.5,penitent:1.5,spitter:1},packs:[{t:'ghoul',n:[5,7]},{t:'penitent',n:[3,4]},{t:'wraith',n:[3,5]}],packP:.5,bg:['eyes','bell','falling','colossus','procession']},
  {id:'choir',kind:'boss',boss:'choir',name:'The Nave',jp:'身廊',act:'Act II',pal:'chapel',bg:['bell','eyes']},
  {id:'warren',kind:'dungeon',name:"The Debtors' Warren",jp:'債務者の巣穴',act:'Act III',pal:'warren',cols:7,rows:4,up:.42,env:'debt',enemies:{ghoul:3,brute:2,archer:2,crawler:3,bloat:2,hanged:1,husk:1,hound:2,penitent:1,spitter:1.5},packs:[{t:'hound',n:[4,6]},{t:'ghoul',n:[6,9]},{t:'crawler',n:[7,10]}],packP:.55,bg:['eyes','falling','colossus','procession']},
  {id:'tithe',kind:'boss',boss:'tithe',name:'The Counting House',jp:'勘定所',act:'Act III',pal:'warren',bg:['falling','eyes']},
  {id:'kiln',kind:'dungeon',name:'The Kiln of Saints',jp:'聖者の窯',act:'Act IV',pal:'kiln',cols:7,rows:4,up:.45,env:'fire',enemies:{witch:2,husk:3,brute:2,archer:2,wraith:2,bloat:1,nun:3,penitent:2,knight:1},packs:[{t:'husk',n:[4,6]},{t:'penitent',n:[3,5]},{t:'nun',n:[2,3]}],packP:.55,bg:['eyes','bell','colossus','procession']},
  {id:'saint',kind:'boss',boss:'saint',name:'The Reliquary Furnace',jp:'聖遺物の炉',act:'Act IV',pal:'kiln',bg:['bell','eyes']},
  {id:'breach',kind:'dungeon',name:'The Breach',jp:'裂け目',act:'Act V',pal:'breach',cols:6,rows:5,up:.55,env:'ash',enemies:{husk:3,witch:2,brute:2,wraith:2,bloat:1,hanged:2,archer:1,knight:2,nun:1.5,hound:2,swarm:1},packs:[{t:'hound',n:[5,7]},{t:'husk',n:[5,7]},{t:'knight',n:[2,3]},{t:'swarm',n:[3,5]}],packP:.6,bg:['eyes','falling','colossus','bell','hand']},
  {id:'count',kind:'boss',boss:'count',name:'The Field Beneath the Wound',jp:'傷の下の戦場',act:'Finale',pal:'wound',surface:1,bg:['fireball','lightning','crows','clash']}
];
const ACTS={
  'Act I':{t:'Act I — The Marrowdeep',jp:'第一幕　骨髄の底',body:'Under Hollowmere there is an older city, and under that, the Pit. Nothing that falls here is supposed to climb out.'},
  'Act II':{t:'Act II — The Drowned',jp:'第二幕　溺れし者',body:'The water down here is black and warm, and it sings. The priests who built this chapel are still at prayer. Most of them are underwater.'},
  'Act III':{t:'Act III — The Debt',jp:'第三幕　負債',body:'Every soul Varhollow sold had a price. Somebody down here keeps the accounts, and somebody comes to collect.'},
  'Act IV':{t:'Act IV — The Kiln',jp:'第四幕　窯',body:'Here they made saints the old way: by fire, by nails, by patience. The heat comes up through your boots.'},
  'Act V':{t:'Act V — The Breach',jp:'第五幕　裂け目',body:'Ash falls upward now. Somewhere above, there is wind, and a red sky, and a war that is not finished.'},
  'Finale':{t:'Finale — The Crowned Wound',jp:'終幕　冠の傷',body:'You climb out into the battlefield where the wall used to be. The Host kneels in rows. In the middle of them, a man is waiting for you with a crown on his head.'}
};
const LETTERS={
  ossuary:'They\'re saying the wall fell with every man on it. Mrs. Harl says I should stop setting your place at the table. I haven\'t.',
  mother:'The Host doesn\'t attack anymore. It waits. Everyone in the city dreams the same dream now: a red eye, and a voice counting. I count back, louder.',
  chapel:'I gave the last crow your name and told it to search. If you\'re reading this, it\'s cleverer than the priests say. Come home.',
  choir:'Varhollow rides the streets at night. People bow. I don\'t. They say the crown on his head breathes.',
  warren:'The bread\'s gone. We eat what the crows bring. I think they\'re bringing it for you, really, and I\'m just holding it.',
  tithe:'Someone painted your name on what\'s left of the wall. Under it they wrote: STILL CLIMBING. It wasn\'t me. That\'s the best part.',
  kiln:'The sky has been red for nine days. The Host is moving again. Whatever you\'re doing down there, I think it\'s working. Hurry.',
  saint:'I can see the Breach from my window. Smoke comes out of it, and sometimes singing. If any of it is you, sing louder.'
};
const OPENING=[
  {cap:'The ninetieth night of the siege.',jp:'籠城　九十日目'},
  {cap:'The Ashen Host has no supply lines. It does not need them. Its dead get back up.',jp:'灰の軍勢に糧食は要らない。'},
  {cap:'Count Varhollow holds the wall. Your sister Ilse keeps a candle lit in a window below it.',jp:'城壁の下、妹は蝋燭を灯す。'},
  {cap:'You are a sellsword. You were promised silver. Tonight you would settle for dawn.',jp:'夜明けさえ来れば、それでいい。'}
];
const BOSSES={
  mother:{name:'The Weeping Mother',jp:'泣く母',sub:'She sings to what she carries.',hp:900,w:44,h:96,xp:160,kit:[['slam','ring','summon','sweep'],['slam3','ring2','rain','summon','sweep'],['lullaby','slam3','ring2','summon','rain']],minion:'crawler'},
  choir:{name:'Choir of Teeth',jp:'歯の聖歌隊',sub:'Seven mouths. One hymn. No eyes.',hp:1100,w:60,h:56,fly:1,xp:220,kit:[['volley','ring','dive','rain'],['hymn','volley','ring2','dive','rain','summon'],['hymn','beam','ring2','dive','hymn','rain']],minion:'wraith'},
  tithe:{name:'The Tithe-Collector',jp:'十分の一の徴収人',sub:'Every debt is paid in the end. He carries the receipts.',hp:1500,w:46,h:104,xp:300,kit:[['sweep','slam','pull','summon'],['anchors','sweep','slam3','pull','charge','rain'],['anchors','charge','slam3','pull','rain','sweep']],minion:'ghoul'},
  saint:{name:'Saint Without Skin',jp:'皮なき聖者',sub:'Martyred. Canonised. Not finished.',hp:1650,w:36,h:84,fly:1,xp:380,kit:[['beam','ring','teleport','volley'],['martyr','beam2','ring2','teleport','rain','volley'],['gaze','beam2','martyr','teleport','ring2','rain']],minion:'witch'},
  count:{name:'Count Varhollow',jp:'ヴァルホロウ伯爵',sub:'He sold the city. He kept the crown.',hp:1300,w:14,h:34,xp:600,kit:[['challenge','duel','charge','leap','wave','duel'],['beam2','tendril','ring2','rain','summon'],['gaze','tendril','beam2','ring2','rain','summon']],minion:'wraith',p2:{name:'The Crowned Wound',jp:'冠の傷',sub:'What he sold the city to.',w:70,h:80}}
};
const ENDING=[
  {cap:'The Wound closed like an eye that had seen enough.',jp:'傷は閉じた。'},
  {cap:'Dawn came up grey over Hollowmere. The ordinary kind.',jp:'灰色の、ただの夜明け。'},
  {cap:'The Host lay down where it stood, and stayed down.',jp:'灰の軍勢は倒れ、もう起きなかった。'},
  {cap:'Ilse was at the window. She had kept the candle lit for a hundred and four nights.',jp:'百四夜、蝋燭は消えなかった。'},
  {cap:'You were not the man who fell. She knew you anyway.',jp:'それでも妹は、兄だと分かった。'}
];
const BARKS={
  start:['Up. Always up.','Ilse is up there. Keep climbing.','Don\'t think about the ceiling. Think about the sky.','Keep moving. If you stop, you start counting.'],
  kill:['Sorry.','You were somebody once.','Stay down.','Nothing personal.','Same as yesterday. Same as tomorrow.'],
  low:['Not here. Not yet.','Ilse\'s waiting. Get up.','Breathe. Just breathe.'],
  chest:['Let it be something good. Just once.','Come on. Come on.'],
  unique:['That\'ll keep me alive. Maybe.','Somebody died holding this. Not me. Not yet.'],
  meh:['Figures.','Rust. Of course it\'s rust.','Better than nothing. Barely.'],
  potion:['Tastes like rust and pennies.'],
  relic:['Sorry, friend. You won\'t be needing it.','Still sharp. Good. One of us should be.'],
  bare:['No blade. No armour. Just the wall and the dark.','Should have brought more than a shirt.'],
  level:['Something in me is changing. I don\'t hate it.','Stronger. Colder.','The Pit is teaching me. I wish it wouldn\'t.'],
  hound:['LET IT OUT.','Bite. Bite. BITE.'],
  respawn:['Again.','Not like that. Again.','The Pit spat me back out.']
};
