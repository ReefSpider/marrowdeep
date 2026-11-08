'use strict';
/* ===== v27: Brann, as a medieval siege-lord =====
   BT: "General Brann is in the wrong timeline and feeling, make them look more grand and medieval, not like the army."
   He was a WWI officer: a peaked cap, a khaki coat and a mortar. Now:
   - Lord Brann of the Siege Works wears full plate with gilt edges and a great helm with a crimson crest and plume.
   - His tabard is Hollowmere's black and gold, with a fur-trimmed crimson cloak.
   - He carries a war-pick and a commander's baton.
   - Beside him is a mangonel. Its arm swings up and throws fire-pots when he calls the barrage. */
Object.assign(BOSSES.brann,{name:'Lord Brann of the Siege Works',jp:'攻城卿ブラン'});
CX.b_brann&&(CX.b_brann.t='Lord Brann');
function dBrann(c,e){ const t=e.anim||0, p=e.pat&&e.pat.name, firing=p==='barrage'||p==='creep', wk=Math.round(Math.sin(t*3)*Math.min(2,Math.abs(e.vx||0)/10));
  /* the mangonel behind him */
  c.save(); c.translate(22,0);
  rect(c,-10,-6,22,4,'#3a2a1c'); rect(c,-10,-6,22,1,'#5a4630'); rect(c,-8,-2,4,2,'#1a120c'); rect(c,6,-2,4,2,'#1a120c'); rect(c,-7,-1,2,1,'#8a8478'); rect(c,7,-1,2,1,'#8a8478');
  rect(c,-6,-22,3,16,'#4a3624'); rect(c,6,-22,3,16,'#4a3624'); rect(c,-6,-22,15,2,'#3a2a1c'); rect(c,-2,-12,6,6,'#2a2420');
  const arm=firing?(-1.9+Math.max(0,Math.sin(t*6))*1.6):-.35; c.save(); c.translate(1,-20); c.rotate(arm); rect(c,-2,-1,26,3,'#5a4630'); rect(c,22,-3,5,5,'#2a1e14');
  if(firing&&Math.sin(t*6)<.2){ rect(c,23,-2,3,3,'#ff8a3a'); } c.restore(); c.restore();
  /* cloak, fur collar */
  const fl=Math.sin(t*2.2)*1.5; c.fillStyle='#5a0a10'; c.beginPath(); c.moveTo(-8,-30); c.lineTo(-14-fl,-2); c.lineTo(-4,-1); c.lineTo(-2,-28); c.fill(); rect(c,-10,-31,18,3,'#d8cfc0'); rect(c,-10,-31,18,1,'#ffffff');
  /* greaves and sabatons */
  rect(c,-6+wk,-13,5,13,'#7a7e88'); rect(c,1-wk,-13,5,13,'#6a6e78'); rect(c,-6+wk,-13,5,1,'#b8bcc4'); rect(c,1-wk,-13,5,1,'#b8bcc4'); rect(c,-7+wk,-1,6,1,'#3a3a40'); rect(c,1-wk,-1,7,1,'#3a3a40'); rect(c,-6+wk,-8,5,1,'#c8a040'); rect(c,1-wk,-8,5,1,'#c8a040');
  /* breastplate and the tabard of Hollowmere */
  rect(c,-8,-29,16,17,'#8a8e98'); rect(c,-8,-29,16,1,'#d0d4dc'); rect(c,-5,-27,10,15,'#141014'); rect(c,-5,-27,10,1,'#c8a040'); rect(c,-5,-13,10,1,'#c8a040'); rect(c,-1,-25,2,9,'#c8a040'); rect(c,-3,-22,6,2,'#c8a040'); rect(c,-2,-19,4,1,'#c8a040');
  rect(c,-9,-17,18,3,'#3a2a1c'); rect(c,-1,-17,3,3,'#c8a040');
  /* pauldrons */
  rect(c,-12,-30,6,6,'#9a9ea8'); rect(c,-12,-30,6,1,'#d0d4dc'); rect(c,-12,-25,6,1,'#c8a040'); rect(c,6,-30,6,6,'#9a9ea8'); rect(c,6,-30,6,1,'#d0d4dc'); rect(c,6,-25,6,1,'#c8a040');
  /* great helm with a crest and a plume */
  rect(c,-5,-40,10,10,'#8a8e98'); rect(c,-5,-40,10,1,'#d0d4dc'); rect(c,-5,-35,10,1,'#141014'); rect(c,1,-36,4,3,'#141014'); rect(c,-1,-40,2,10,'#c8a040');
  for(let i=0;i<4;i++) rect(c,2+((i%2)*2),-33+i,1,1,'#2a2a30');
  rect(c,-4,-43,8,3,'#c8a040'); rect(c,-4,-45,1,2,'#c8a040'); rect(c,0,-46,1,3,'#c8a040'); rect(c,3,-45,1,2,'#c8a040');
  c.fillStyle='#a01418'; c.beginPath(); c.moveTo(0,-44); c.quadraticCurveTo(-8-fl,-54,-16-fl*2,-46); c.quadraticCurveTo(-8,-48,-2,-42); c.fill(); rect(c,-1,-47,2,3,'#c01820');
  /* arms: baton raised when he calls the guns, the war-pick otherwise */
  if(firing){ rect(c,-12,-40,4,12,'#8a8e98'); rect(c,-12,-46,2,8,'#c8a040'); rect(c,-13,-47,4,2,'#d8cfc0'); }
  else { rect(c,-12,-24,4,10,'#8a8e98'); }
  c.save(); c.translate(9,-22); c.rotate(p==='sappers'||p==='mines'?-.8:.5); rect(c,0,-1,3,12,'#8a8e98'); rect(c,1,8,2,14,'#4a3624'); rect(c,-3,20,9,3,'#5a5e68'); rect(c,5,21,4,1,'#b8bcc4'); rect(c,-5,21,3,1,'#5a5e68'); c.restore(); }
BDRAW.brann=dBrann;
