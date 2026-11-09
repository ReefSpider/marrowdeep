'use strict';
/* ===== v44.2: more jewellery to look at, more abyssals to chase (BT, 10 Nov: "yeah do that") =====
   1. Rings and amulets had one base each (Iron Ring, Bone Amulet), so every magic and rare piece of jewellery looked
      the same. Four new rings and four new amulets, each with its own icon. Jewellery bases carry no stats of their own;
      a drop picks among the three newest the item level reaches, as before.
        rings   Copper Band 0 · Signet 4 · Bone Ring 6 · Silver Ring 10 · Black Iron Seal 15
        amulets Saint's Medal 3 · Prayer Beads 7 · Iron Locket 11 · Crow Talisman 15
   2. Abyssals went from 5 to 14: every slot has one now (gloves, boots, ring, shield and light armour were missing),
      plus a crossbow, a halberd, a dagger and a great hammer. They follow the v44.1 kind-first picker. */
BASES.ring.push({name:'Copper Band',lvl:0},{name:'Signet',lvl:4},{name:'Bone Ring',lvl:6},{name:'Silver Ring',lvl:10},{name:'Black Iron Seal',lvl:15});
BASES.amulet.push({name:"Saint's Medal",lvl:3},{name:'Prayer Beads',lvl:7},{name:'Iron Locket',lvl:11},{name:'Crow Talisman',lvl:15});

ABYSSAL.push(
  {name:'The Last Verdict',slot:'weapon',base:'Arbalest',aff:[['ed',100,140],['crit',14,20],['as',12,18],['ls',5,8],['fin',10,14]],fl:'Read aloud, once, to an empty court. The court emptied further.'},
  {name:'The Gallows Pole',slot:'weapon',base:'Halberd',aff:[['ed',100,140],['crit',12,18],['ms',10,14],['life',60,90],['mig',8,12]],fl:'It held up the rope for forty years. Then it got tired of holding.'},
  {name:'Ninefold Night',slot:'weapon',base:'Kris',aff:[['ed',90,130],['crit',22,30],['as',16,24],['ls',6,10],['fin',10,14]],fl:'Nine cuts, one for every hour before the bells.'},
  {name:'The Bell of Kesh',slot:'weapon',base:'Great Hammer',aff:[['ed',110,150],['crit',10,16],['life',80,120],['thorns',20,30],['mig',12,16]],fl:'Cast from the city\'s bell. It still rings when it lands.'},
  {name:'Hollowmere Unbroken',slot:'weapon',base:'Pavise',aff:[['edef',260,340],['life',100,140],['thorns',30,45],['fort',12,16]],fl:'The wall fell. This part of it didn\'t.'},
  {name:'Hands of the Hanged',slot:'gloves',base:'Plate Gauntlets',aff:[['edef',150,220],['as',18,26],['ls',6,10],['crit',10,16]],fl:'Still reaching for the knot.'},
  {name:'The Walk Home',slot:'boots',base:'Shadow Treads',aff:[['ms',20,28],['life',60,90],['regen',6,10],['fin',10,14]],fl:'Every step of it, in the dark, and not one missed.'},
  {name:'The Ninth Wage',slot:'ring',base:'Black Iron Seal',aff:[['as',20,30],['crit',12,18],['ls',6,10],['life',60,90]],fl:'Eight were paid. The ninth was taken.'},
  {name:'Skin of the Fox',slot:'armor',base:'Shadow Leathers',aff:[['edef',200,280],['ms',16,22],['as',14,20],['fin',12,16]],fl:'The fox left it behind on purpose.'});
Object.assign(SIG_EL,{'The Last Verdict':'shock','The Gallows Pole':'wind','Ninefold Night':'shadow','The Bell of Kesh':'holy','Hollowmere Unbroken':'water',
  'Hands of the Hanged':'blood','The Walk Home':'bone','The Ninth Wage':'blood','Skin of the Fox':'wind'});

/* ---------- icons ---------- */
(function(){ const o=artEquipmentIcon; artEquipmentIcon=function(g,it){ const n=it.base&&it.base.name;
  if(it.slot==='ring'&&n!=='Iron Ring'&&ringIcon(g,it,n)) return; if(it.slot==='amulet'&&n!=='Bone Amulet'&&amuletIcon(g,it,n)) return; return o(g,it); }; })();
const JEW_EL=it=>artElement(it)?ART_ECOL[artElement(it)][0]:null;
function ringIcon(g,it,n){ const p=(c,pts)=>pxPoly(g,c,pts), r=(c,x,y,w,h)=>pxRect(g,c,x,y,w,h), line=(c,a,b,x,y)=>pxLine(g,c,a,b,x,y);
  const B={'Copper Band':['#4a2a18','#9a5a34','#e0a070'],'Signet':['#4a3a1a','#a8873e','#efd690'],'Bone Ring':['#5e5440','#c4b896','#f0e8cc'],'Silver Ring':['#454b54','#a6aeb8','#eef2f6'],'Black Iron Seal':['#121115','#38353d','#7a7482']}[n]; if(!B) return false;
  const band=(y0)=>{ p(B[0],[[9,y0],[22,y0],[26,y0+5],[26,y0+12],[21,y0+17],[11,y0+17],[6,y0+12],[6,y0+5]]); p(B[1],[[10,y0+2],[21,y0+2],[24,y0+6],[24,y0+11],[20,y0+15],[12,y0+15],[8,y0+11],[8,y0+6]]); p('#1e2124',[[12,y0+5],[20,y0+5],[22,y0+8],[20,y0+12],[12,y0+12],[10,y0+9]]); r(B[2],9,y0+5,2,5); };
  const el=JEW_EL(it);
  if(n==='Copper Band'){ band(10); line(B[2],12,11,20,11); r(B[0],15,10,2,2); }
  else if(n==='Signet'){ band(12); p(B[0],[[10,6],[22,6],[23,13],[9,13]]); r(B[1],11,7,10,5); line(B[2],12,7,19,7); line(B[0],14,9,18,9); line(B[0],16,8,16,11); if(el) r(el,19,10,1,1); }
  else if(n==='Bone Ring'){ band(11); for(let x=10;x<23;x+=3) r(B[0],x,12,1,2); r(B[2],13,8,6,4); r(B[1],14,9,4,2); r(el||'#8a7e66',15,9,2,1); }
  else if(n==='Silver Ring'){ band(12); p(B[0],[[13,5],[19,5],[21,8],[19,13],[13,13],[11,8]]); p(el||'#5a8ab4',[[14,6],[18,6],[20,8],[18,12],[14,12],[12,8]]); r('#ffffff',14,7,2,1); r(B[2],12,13,8,1); }
  else { band(12); r(B[0],10,5,12,9); r('#7a1a14',12,6,8,7); r('#b8322a',13,7,6,5); line('#e2b0a0',14,8,17,8); line('#5a0e0a',15,10,17,12); if(el) r(el,18,7,1,1); }
  return true; }
function amuletIcon(g,it,n){ const p=(c,pts)=>pxPoly(g,c,pts), r=(c,x,y,w,h)=>pxRect(g,c,x,y,w,h), line=(c,a,b,x,y)=>pxLine(g,c,a,b,x,y); const trim=artTrim(it), M=metalOf(it.rarity), el=JEW_EL(it);
  if(n==="Saint's Medal"){ line(trim,6,3,14,16); line(trim,26,3,18,16); p('#6a5426',[[11,16],[21,16],[25,21],[21,28],[11,28],[7,21]]); p('#c8a24a',[[12,17],[20,17],[23,21],[20,27],[12,27],[9,21]]); line('#f2dc94',16,18,16,26); line('#f2dc94',13,21,19,21); r(el||'#8a6a2a',15,24,2,2); return true; }
  if(n==='Prayer Beads'){ for(let i=0;i<14;i++){ const a=Math.PI*(.1+i/13*.8), x=16+Math.cos(a)*10, y=5+Math.sin(a)*14; r(i%4===0?'#e8dcc0':'#7a4a2e',Math.round(x)-1,Math.round(y)-1,2,2); }
    r('#8a6a4a',15,19,2,3); line(trim,16,22,14,29); line(trim,16,22,18,29); line(trim,16,22,16,30); r(el||'#c8b48a',15,18,2,1); return true; }
  if(n==='Iron Locket'){ line(trim,7,3,14,15); line(trim,25,3,18,15); p(M[0],[[12,15],[20,15],[23,19],[23,25],[20,29],[12,29],[9,25],[9,19]]); p(M[1],[[13,16],[19,16],[21,19],[21,25],[19,27],[13,27],[11,25],[11,19]]); line(M[0],16,16,16,27); r(M[2],12,18,1,5); r(el||'#5a646e',17,21,2,2); return true; }
  if(n==='Crow Talisman'){ line('#8a6a50',6,3,14,14); line('#8a6a50',26,3,18,14); p('#5a5262',[[13,12],[20,12],[25,16],[23,19],[26,25],[19,23],[17,30],[13,23],[7,25],[10,19],[8,15]]); p('#141216',[[14,13],[19,13],[24,17],[22,19],[25,24],[19,22],[17,29],[14,22],[8,24],[11,19],[9,16]]); p('#2e2a34',[[15,15],[18,15],[21,18],[18,20],[15,20]]); r('#d8c890',19,16,1,1); r('#c8322a',16,24,1,2); if(el) r(el,15,18,1,1); return true; }
  return false; }
