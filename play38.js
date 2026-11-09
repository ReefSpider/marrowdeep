'use strict';
/* ===== v38: chests come in three kinds =====
   Feedback: "I land on rings and amulets a lot. Jewellery should drop less than armour and weapons, which are equal."
   Before, every chest could give any slot: weapons 32%, body armour and helms 36%, rings and amulets 32%.
   Now coffers and reliquaries are each one of three kinds, marked on the chest and named in the prompt:
     weapons 40% · armour 40% (body or helm) · jewellery 20% (ring or amulet).
   The item and every card on its reel come from that kind. Boss hoards, elite chests, the Hollow Reliquary and the
   merchant's box still give anything. The kind is hashed from the chest's place in the level, so every co-op
   screen agrees. Loot memory (v37) still steers which slot inside a kind. */
const CKIND_W={weapon:40,armour:40,jewel:20};
const CKIND={weapon:{slots:['weapon'],n:['Weaponsmith\'s Coffer','Reliquary of Blades']},
  armour:{slots:['armor','helm'],n:['Armourer\'s Coffer','Reliquary of Mail']},
  jewel:{slots:['ring','amulet'],n:['Jeweller\'s Casket','Reliquary of Rings']}};
function chestHash(c){ let h=2166136261; const s=`${Math.round(c.x/4)}|${c.tier}|${lvlIdx}|${typeof LVVAR!=='undefined'?LVVAR.v:0}`; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return (h>>>0)/4294967296; }
function chestKind(c){ if(!c||(c.tier!==0&&c.tier!==1)) return null; if(c.kind) return c.kind;
  let r=chestHash(c)*100; for(const k in CKIND_W){ r-=CKIND_W[k]; if(r<0) return (c.kind=k); } return (c.kind='weapon'); }
function chestLabel(c){ const k=chestKind(c); return k?'the '+CKIND[k].n[c.tier]:['an Iron-Bound Coffer','a Bone Reliquary','the Tithe Hoard'][c.tier]||'the chest'; }

/* which slot inside a kind: by the base slot weights, steered by loot memory */
function kindSlot(k){ const sl=CKIND[k].slots; if(sl.length===1) return sl[0]; const w={}; for(const s of sl) w[s]=(SLOTW[s]||1)*(typeof lmW==='function'&&!LM.off?lmW(LM.slot,s,LM_K.slot):1); return wpick(w); } /* reel fillers (LM.off) stay unbiased so co-op reels match */
let CASE_KIND=null, KIND_FORCE=null;
/* the unique and abyssal teaser cards on a kind's reel come from that kind too */
(function(){ const o=mkFixed; mkFixed=function(def,rar){ if(KIND_FORCE&&def&&rar>=4){ const sl=CKIND[KIND_FORCE].slots, list=rar===5?ABYSSAL:UNIQUES;
  if(list.includes(def)&&!sl.includes(def.slot)){ const ok=list.filter(d=>sl.includes(d.slot)); if(ok.length) def=ok[Math.floor(R()*ok.length)]; } } return o(def,rar); }; })();
(function(){ const o=genItem; genItem=function(ilvl,w,mf,forceSlot){ if(KIND_FORCE&&!forceSlot) forceSlot=kindSlot(KIND_FORCE); return o(ilvl,w,mf,forceSlot); }; })();
/* opening: solo and co-op host roll the item inside the chest's kind; every screen fills the reel from it */
(function(){ const o=openChest; openChest=function(c){ const k=c&&!c.open?chestKind(c):null; if(k&&!(typeof COOP!=='undefined'&&COOP&&NET.seats.length>=2)){ CASE_KIND=k; KIND_FORCE=k; try{ return o(c); } finally{ KIND_FORCE=null; } } return o(c); }; })();
(function(){ const o=hostChest; hostChest=function(ci,s,mf){ const c=chests[ci]; const k=c&&!c.open?chestKind(c):null; KIND_FORCE=k; try{ return o(ci,s,mf); } finally{ KIND_FORCE=null; } }; })();
(function(){ const o=showCoopChest; showCoopChest=function(m,win){ CASE_KIND=chestKind(chests[m.ci]); return o(m,win); }; })();
(function(){ const o=showCase; showCase=function(tier,ilvl,win,...r){ const k=(tier===0||tier===1)?CASE_KIND:null; CASE_KIND=null; KIND_FORCE=k;
  try{ const res=o(tier,ilvl,win,...r); if(k){ const n=$('#caseName'); if(n) n.textContent=CKIND[k].n[tier]; } return res; } finally{ KIND_FORCE=null; } }; })();

/* the mark on the chest: a sword, a breastplate or a ring */
const CK_ICON={weapon:{px:['..s..','..s..','..s..','ggggg','..h..'],c:{s:'#e4e8ee',g:'#9a8456',h:'#6a4a2a'}},
  armour:{px:['b...b','bbbbb','bhbhb','.bbb.','.bbb.'],c:{b:'#c89a5a',h:'#7a5a32'}},
  jewel:{px:['..r..','.g.g.','g...g','g...g','.ggg.'],c:{g:'#ffd66a',r:'#4ad1c9'}}};
(function(){ const o=drawChest; drawChest=function(c,ch){ o(c,ch); const k=(ch.tier===0||ch.tier===1)&&ch.x!=null?chestKind(ch):null; if(!k) return;
  const ic=CK_ICON[k], x0=-2, y0=ch.tier===1?-10:-6;
  if(ch.tier===0) rect(c,x0-1,y0-1,7,7,'#24160c'); else rect(c,x0-1,y0-1,7,7,'#2e2826');
  for(let y=0;y<5;y++) for(let x=0;x<5;x++){ const p=ic.px[y][x]; if(p!=='.') rect(c,x0+x,y0+y,1,1,ic.c[p]); } }; })();
