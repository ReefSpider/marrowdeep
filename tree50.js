'use strict';
/* ===== the Marrow 髄 (v46): one big passive tree =====
   Plan: claude/talents-plan.md. Art: arttree.js (Codex's TreeArt). Notes: claude/v46-notes.md.

   The Brand tree (15 skills in three columns) and the old Marrow tab (ten stat sliders after the campaign) are now one
   tree of about 300 nodes around a Heart:
     - inner ring: 9 Brands, each one small node out from the Heart, each with two forks (take one);
     - middle ring: three sectors, 技 Finesse · 耐 Fortitude · 力 Might, of small stat nodes, notables, a keystone, sockets;
     - outer ring: ten damage-type wedges (Attunement, small nodes, three notables, a keystone) and ten bridges;
     - the Spine: six vertebrae from the Heart to Paradox.
   1 point per level from level 2, nothing else. Allocate anywhere you can reach; give points back only in the Rope-House.

   What this file owns:
     - TREE.nodes / TREE.adj: the graph, built once by buildTree() from the tables below;
     - META.tree = {v:1, a:[node ids], g:[gift skill ids], note:bool}: what a character has taken (saved with META);
     - P.skills is derived from it (syncTree), so every has('…') check in the game keeps working, and co-op still sends the
       plain skill list;
     - the stat nodes, applied last in calcStats for the hero who owns the tree (never the lab's stand-in heroes);
     - the full-screen tree (T, or the Marrow tab of the satchel).

   Forging: a node with live:false is drawn and readable but can't be taken yet ("Not yet forged"). Stage 1 forges every
   small node, the ten Attunements, the eight Brands the game already had, Crimson Pact, Chain Warden, Headsman, Unbowed
   and Undying. The rest are forged in later stages (see the notes). Paths never need an unforged node. */

const TREE={nodes:[],by:{},adj:{},owner:null,VER:1};
const TK={ /* every number a small node gives, in one place */
  dmg:2, mdmg:3, life:3, def:3, as:1, crit:.5, ls:.2, regen:.4, ms:1, mf:4, gf:4, threat:5, grit:4, stag:4, carry:1, heal:4, xbow:3,
  ed:5, dur:8, str:6, pen:10, bridge:3, attune:8,
  headsman:.25, unbowed:2, undying:.35 };
const T_ROLE={finesse:{jp:'技',n:'Finesse',c:'#7ad0a8',a0:0,a1:144,sp:[48,96]}, fortitude:{jp:'耐',n:'Fortitude',c:'#8aa8e0',a0:144,a1:252,sp:[180,216]}, might:{jp:'力',n:'Might',c:'#e07a52',a0:252,a1:360,sp:[288,324]}};
const T_ORDER=['shadow','poison','wind','shock','holy','cold','water','bone','blood','fire']; /* clockwise from the top, 36° each */
const T_ELN={fire:'Fire',cold:'Cold',shock:'Lightning',water:'Water',poison:'Poison',holy:'Holy',shadow:'Shadow',blood:'Blood',wind:'Wind',bone:'Bone'};
const T_STATUS={fire:['burn','Burning'],cold:['chill','Chill'],shock:['shock','Shocked'],water:['soak','Soaked'],poison:['rot','Rotting'],holy:['sanct','Sanctified'],shadow:['mark','Marks'],blood:['bleed','Bleeding'],wind:['gale','Gale'],bone:['brittle','Brittle']};
const T_DOT={fire:1,poison:1,blood:1};
/* small nodes: glyph (TreeArt.glyphs), and the line the tooltip shows */
const T_STAT={
  dmg:['Damage',v=>`+${v}% damage`], mdmg:['Damage',v=>`+${v}% damage with Might weapons, by the weapon's Might grade`], life:['Life',v=>`+${v}% life`], def:['Defense',v=>`+${v}% defense`],
  as:['Attack speed',v=>`+${v}% attack speed`], crit:['Crit',v=>`+${v}% critical strike`], ls:['Life steal',v=>`+${v}% life stolen`], regen:['Regen',v=>`+${v} life regen /s`],
  ms:['Run speed',v=>`+${v}% run speed`], mf:['Magic find',v=>`+${v}% magic find`], gf:['Gold find',v=>`+${v}% gold find`], threat:['Threat',v=>`+${v}% threat (foes prefer you)`],
  grit:['Grit regen',v=>`Grit refills ${v}% faster`], stag:['Boss stagger',v=>`+${v}% boss stagger`], carry:['Carry weight',v=>`+${v} carry weight`], heal:['Draught healing',v=>`Draughts heal ${v}% more`],
  xbow:['Crossbow damage',v=>`+${v}% crossbow damage`] };
const T_MENU={ /* 22 small nodes a sector, in the order the builder places them */
  might:['mdmg','life','stag','mdmg','def','carry','mdmg','life','ls','stag','mdmg','def','carry','life','stag','mdmg','ls','def','carry','life','stag','mdmg'],
  finesse:['as','crit','ms','as','xbow','crit','grit','as','ms','crit','mf','as','xbow','crit','ms','grit','as','crit','mf','ms','xbow','grit'],
  fortitude:['life','def','threat','regen','life','def','heal','threat','life','gf','def','regen','threat','life','def','heal','regen','threat','def','gf','heal','life'] };
/* Brands: catalogue id, the skill it gives, sector, angle */
const T_BRANDS=[['iaid','iai','finesse',24],['shade-step','shade','finesse',72],['thousand-cuts','thou','finesse',120],
  ['funeral-bell','bell','fortitude',162],['last-breath','last','fortitude',198],['stillness','still','fortitude',234],
  ['hemorrhage','hem','might',270],['the-hound','hound','might',306],['grave-slam','slam','might',342]];
const T_GIFTS=[{sk:'wing',boss:'odo',n:'Ash Wings',jp:'翼',d:'Jump again in midair on a burst of grave ash.'},{sk:'claw',boss:'sisters',n:'Grave Claw',jp:'爪',d:'Cling to walls and climb them.'},{sk:'teth',boss:'preacher',n:'Red Tether',jp:'鎖',d:'Fling a chain of blood that drags you to stone and flesh. Key 2.'}];
/* what every named node says. [text, forged in this build?] */
const T_TEXT={
  'hemorrhage':['Art, key 1. Throw a lance of your own blood. It costs life, pierces everything, and each foe it passes through gives some back.',1],
  'crimson-pact':["Hemorrhage splits into three lances. +1% lance damage per 2 Finesse.",1],
  'heart-spike':["Hemorrhage becomes one heavy lance: ×1.9 damage, it opens Bleeding and stuns. On bosses it fills the stagger bar. The stun and the stagger grow with Might.",1],
  'the-hound':['Art, key 3. Rage builds as you bleed and make others bleed. At full rage the Hound wears you: black iron, faster blows, stolen life, no flinching. The dead spill blood orbs that feed life and grit.',1],
  'black-iron':["Rage also builds from the damage you take. In Hound form you take 30% less, more with Fortitude.",1],
  'red-maw':["Every blow that draws blood builds rage. In Hound form your blows open Bleeding, more with Might.",1],
  'grave-slam':["In the air, hold Down and Strike to crash down. Once every 4 s the landing is a Grave Slam: a wide crater that hits harder and knocks ordinary foes into the air.",1],
  'ossuary-crash':["The crater leaves 3 stacks of Brittle. It is wider with Might.",1],
  'gale-crash':["Foes are thrown higher and stay in the air longer, ready to juggle. The slam comes back sooner with Finesse.",1],
  'iaid':['On the ground, hold Down + Strike to sheathe and wait. Release to cut through everything ahead. The wounds open a heartbeat later.',1],
  'thunder-draw':["The wounds open as lightning: foes are Shocked and it arcs to those nearby. The lightning grows with Finesse.",1],
  'long-draw':["Keep holding after the sword is ready: up to a second more makes the cut reach further and hit up to ×2.",1],
  'shade-step':['Your roll leaves a shade where you stood. It copies your next attack from there.',1],
  'marking-shade':["The shade's copy Marks what it hits. Marks last longer with Finesse.",1],
  'decoy':["For 2 s, foes near the shade stop and turn to it. Longer with Fortitude. Not bosses.",1],
  'thousand-cuts':['The last blow of every main-hand combo leaves six phantom blades in the air. They fall a moment later.',1],
  'rain-of-needles':["Ten small blades fall in a row ahead of you, and each adds a stack of Rotting. The rot grows with Finesse.",1],
  'six-executioners':["Six heavy blades all fall on the nearest foe. They hit harder with Might.",1],
  'funeral-bell':['Art, key 4. Toll a bell no one else can hear. Everything near you stands stunned, and bosses reel. Costs 40 grit.',1],
  'toll-for-me':["Stunned foes lock on to you, and you take 20% less for 4 s. Longer with Fortitude.",1],
  'drowning-bell':["The toll Soaks everything it reaches. It reaches further with Finesse.",1],
  'last-breath':['Once per level, refuse death. Become a shade for a few seconds, untouchable, then crawl back with a third of your life.',1],
  'martyr-s-breath':["When Last Breath fires, allies near you heal 30% of their life.",1],
  'vengeful-shade':["As a shade you deal double and leave foes Burning. The burn grows with Might.",1],
  'stillness':["Stand still for a second without attacking and a ward of bone forms. It takes one hit for you. When it breaks, time slows for half a second and your strikes are critical.",1],
  'frozen-stillness':["The ward breaks into a burst that Chills everything near. Wider with Fortitude.",1],
  'hallowed-stillness':["The ward breaks into a Judgement pillar on whatever struck it. Harder with Might.",1],
  'headsman':['The red finishing mark appears on foes at 25% life, not 20%.',1],
  'siegebreaker':['Heavy blows ignore 30% of elites\' and bosses\' defense.',0],
  'iron-grip':['Two-handers swing 8% faster. Giant\'s Grip loses half its slowdown.',0],
  'undertow-of-iron':['Two-handed slams pull foes towards the impact.',0],
  'unbowed':['Each kill heals 2% of your life.',1],
  'bloodletter-s-due':['+1% damage per 10 Might while below half life.',0],
  'colossus':['Two-handed weapons deal +40% damage.|Costs: one-handed weapons deal 30% less, and your off hand can\'t hold a weapon.',0],
  'flowing-steel':['The rhythm window is a third wider, and a rhythm beat gives +30%, not +20%.',0],
  'deadeye':['Bolts reach their full range bonus at half the distance.',0],
  'twin-fangs':['Two blades deal +10% damage, and the off hand crits 5% more.',0],
  'second-wind':['Winded wears off twice as fast, and grit refills 15% faster.',0],
  'cutpurse':['+20% magic find, and elites drop a chest 25% more often.',0],
  'featherfall':['No fall damage, and a crit in the air refunds 5 grit.',0],
  'paper-tiger':['+60% critical damage and +5% critical strike.|Costs: 30% less life, and draughts heal 20% less.',0],
  'chain-warden':['Red Tether drags foes to you instead of you to them.',1],
  'shieldwall':['Allies close behind you take 15% less.',0],
  'undying':['Life regen doubles while you are below 35% life.',1],
  'stone-skin':['The first hit from each new foe is halved.',0],
  'long-watch':['Threat lock lasts 5 s, not 3.',0],
  'pilgrim-s-draught':['Draughts also cleanse statuses and heal nearby allies for half.',0],
  'martyr':['You take 20% less from everything.|Costs: 30% of the damage your allies take is taken by you instead.',0],
  'wildfire':['Ground fire spreads 50% further and lasts 1 s longer.',0],
  'pyre-walker':['Standing in your own fire, you can\'t be set Burning and you swing 10% faster.',0],
  'cinder-heart':['Heavy blows on a Burning foe explode in a small blast.',0],
  'funeral-pyre':['When Burning would end, the whole burn lands at once at ×1.5, and the blast spreads Burning.|Costs: Burning no longer ticks.',0],
  'deep-winter':['Two chills freeze, not three.',0],
  'hoarfrost':['You take 4% less for each frozen foe nearby, up to 20%.',0],
  'glacial-shards':['Shatter shards chill what they hit.',0],
  'permafrost':['You can freeze bosses for a moment, once every 12 s.|Costs: cold deals 30% less.',0],
  'forked-path':['Arcs jump once more from each foe they reach.',0],
  'grit-siphon':['Each arc gives you 1 grit back.',0],
  'static-skin':['Shocked foes that hit you take lightning back.',0],
  'storm-conduit':['Each Shocked foe stores charge, and your next critical strike lets all of it go in one bolt across them.|Costs: lightning stops arcing.',0],
  'tidebreak':['Water hits send a wave along the floor that shoves and Soaks everything in a line. Stronger over standing water.',0],
  'undertow':['Water pulls foes towards you instead of shoving them away.',0],
  'rising-tide':['+3% damage for each Soaked foe nearby, up to +15%.',0],
  'deluge':['Soaked lasts three times as long, and Soaked foes take 25% more from every other type.|Costs: water deals no damage itself.',0],
  'cyclone':['Hurled foes hit what they fly through.',0],
  'eye-of-the-storm':['+15% run speed while three or more foes are in the air.',0],
  'downdraft':['A heavy blow on an airborne foe slams it down in a crater.',0],
  'tempest':['Wind throws foes straight up and holds them there for 1.2 s (not bosses).|Costs: wind never throws foes away.',0],
  'virulence':['Rot stacks to eight.',0],
  'contagion':['Death clouds also pass on half the dead foe\'s stacks.',0],
  'slow-decay':['Rotting foes deal 15% less damage.',0],
  'necrosis':['Rot stacks without limit.|Costs: each stack ticks at 60%.',0],
  'litany':['Judgement falls on every third hit, not every fourth.',0],
  'sanctuary':['Judgement leaves hallowed ground for 4 s. Allies inside take 15% less.',0],
  'zealot-s-fire':['Judgement leaps to the nearest Sanctified foe.',0],
  'inquisitor':['Holy deals ×3 to ranked foes and bosses.|Costs: holy deals half to ordinary foes.',0],
  'long-shadow':['Marks last 10 s and pass to the nearest foe on a kill.',0],
  'unseen':['Killing a Marked foe hides you for 1.5 s. Foes lose you, and your next blow deals +50%.',0],
  'bloomreaper':['Blood blooms are 40% bigger.',0],
  'night-has-teeth':['A Marked foe that drops below 25% life blooms at once, and the bloom kills it.|Costs: Marks no longer bloom on death.',0],
  'open-veins':['Bleeding stacks build twice as fast.',0],
  'sanguine-shell':['Healing from bleeds past full life becomes a blood shield, up to 20% of your life.',0],
  'gusher':['A critical strike on a Bleeding foe pours out 2 s of its bleed at once.',0],
  'blood-price':['Bleeds heal you twice as much.|Costs: regen and draughts heal 50% less.',0],
  'spur':['Splinter shards pierce.',0],
  'bone-plate':['Each splinter near you gives you a plate of bone that takes one hit (up to 3).',0],
  'brittle-frame':['Brittle stacks to seven, so the splinter hits harder.',0],
  'ossuary':['Each splinter raises a Bone Thrall that fights for you for 8 s (up to 3).',0],
  'nightshade':['Rot Bloom clouds Mark everything inside them.',0],
  'pestilence':['Plague Wind reaches twice as far.',0],
  'squall-line':['Thunderhead leaves its targets airborne.',0],
  'wrath-of-heaven':['Judgement-combo pillars stun for 1 s.',0],
  'pale-light':['New combo, tree only. Holy on a Frozen foe calls Judgement at once and shatters it if under 30% life.',0],
  'glacier':['Flash Freeze reaches twice as far.',0],
  'drowned-bones':['New combo, tree only. Bone on a Soaked foe roots it for 1.5 s, and Brittle stacks double.',0],
  'marrowmonger':['Marrow Rend heals you for 5% of the damage.',0],
  'scald':['Boiling Blood also sets everything near Burning.',0],
  'black-flame':['New combo, tree only. Fire on a Marked foe burns purple: the burn spreads the Mark.',0],
  'paradox':['The five combos that work against you stop doing so: Quench stuns, Steam blinds them, Eclipse heals you, Purify turns rot into holy damage, Washed Clean turns the bleed into one hit.',0] };

/* ---------- building the graph ---------- */
function buildTree(){ const N=TREE.nodes, by=TREE.by, adj=TREE.adj; N.length=0; for(const k in by) delete by[k]; for(const k in adj) delete adj[k];
  const cat=Object.fromEntries(TreeArt.catalogue.map(c=>[c.id,c]));
  const pt=(r,deg)=>{ const a=deg*Math.PI/180; return {x:Math.round(r*Math.sin(a)),y:Math.round(-r*Math.cos(a))}; };
  const add=(id,kind,r,deg,o)=>{ const n=Object.assign({id,kind,live:true},pt(r,deg),o||{}); N.push(n); by[id]=n; adj[id]=[]; return id; };
  const link=(a,b,o)=>{ adj[a].push(b); adj[b].push(a); if(o) (TREE.linkOpt=TREE.linkOpt||{})[a<b?a+'|'+b:b+'|'+a]=o; };
  const named=(cid,kind,r,deg,o)=>{ const c=cat[cid], t=T_TEXT[cid]||['',0]; return add(cid,kind,r,deg,Object.assign({art:c,name:c.name,jp:c.kanji,text:t[0],live:!!t[1]},o||{})); };
  const small=(id,r,deg,st,o)=>add(id,'small',r,deg,Object.assign({st},o||{}));
  TREE.linkOpt={};
  add('heart','heart',0,0,{name:'The Heart',jp:'髄',text:'Where every path begins. It gives Second Hand: a one-handed weapon, shield or crossbow in your off hand.'});
  /* the Spine */
  { let prev='heart'; ['life','mf','life','def','mf','life'].forEach((st,i)=>{ const id=small('sp'+i,40+i*20,0,{[st]:TK[st]},{vert:1,grp:'spine'}); link(prev,id); prev=id; }); link(prev,named('paradox','paradox',196,0,{grp:'spine'})); }
  /* Brands and forks */
  for(const [cid,sk,role,deg] of T_BRANDS){ const p=small('bp-'+cid,56,deg,{[role==='might'?'life':role==='finesse'?'as':'def']:TK[role==='might'?'life':role==='finesse'?'as':'def']},{grp:role,role});
    link('heart',p); const b=named(cid,'brand',100,deg,{sk,grp:role,role}); link(p,b);
    TreeArt.catalogue.filter(c=>c.parent===cat[cid].name).forEach((f,j)=>{ const id=named(f.id,'fork',139,deg+(j?8:-8),{grp:role,role:f.role,fork:cid,sk:f.id==='crimson-pact'?'pact':f.id}); link(b,id,{chain:1}); }); }
  /* attribute sectors */
  const notes={might:['headsman','siegebreaker','iron-grip','undertow-of-iron','unbowed','bloodletter-s-due','colossus'],finesse:['flowing-steel','deadeye','twin-fangs','second-wind','cutpurse','featherfall','paper-tiger'],fortitude:['chain-warden','shieldwall','undying','stone-skin','long-watch','pilgrim-s-draught','martyr']};
  const gates={};
  for(const role in T_ROLE){ const R=T_ROLE[role], [p,q]=R.sp, mid=(p+q)/2, menu=T_MENU[role].slice(), pre=role.slice(0,2); let si=0;
    const sm=(tag,r,deg)=>{ const st=menu[si++%menu.length]; return small(pre+'-'+tag,r,deg,{[st]:TK[st]},{grp:role,role}); };
    const P_=[], Q_=[]; [78,166,198,230,262].forEach((r,i)=>{ P_.push(sm('p'+i,r,p)); Q_.push(sm('q'+i,r,q)); });
    link('heart',P_[0]); link('heart',Q_[0]); for(let i=1;i<5;i++){ link(P_[i-1],P_[i]); link(Q_[i-1],Q_[i]); }
    const M=sm('m',186,mid); link(P_[2],M); link(Q_[2],M);
    const N1=sm('n1',270,mid-9), N2=sm('n2',270,mid+9); link(P_[4],N1); link(N1,N2); link(N2,Q_[4]);
    const W1=sm('w1',232,p-9), W2=sm('w2',240,p-18), X1=sm('x1',232,q+9), X2=sm('x2',240,q+18); link(P_[3],W1); link(W1,W2); link(Q_[3],X1); link(X1,X2);
    /* gates: one per wedge behind this sector */
    const outer=[[W2,p-18],[P_[4],p],[N1,mid-9],[N2,mid+9],[Q_[4],q],[X2,q+18]];
    T_ORDER.forEach((el,i)=>{ const g=i*36+18; if(g<R.a0||g>R.a1) return; const id=sm('g-'+el,300,g); gates[el]=id; const near=outer.slice().sort((a,b)=>Math.abs(a[1]-g)-Math.abs(b[1]-g))[0]; link(near[0],id); });
    /* notables, keystone, sockets */
    const nt=notes[role];
    link(P_[2],named(nt[0],'notable',196,p-9,{grp:role,role}));
    link(Q_[2],named(nt[1],'notable',196,q+9,{grp:role,role}));
    link(M,named(nt[2],'notable',160,mid,{grp:role,role}));
    link(W2,named(nt[3],'notable',262,p-27,{grp:role,role}));
    link(X2,named(nt[4],'notable',262,q+27,{grp:role,role}));
    const e1=sm('e1',214,mid-8); link(M,e1); link(e1,named(nt[5],'notable',238,mid-4,{grp:role,role}));
    link(N2,named(nt[6],'keystone',240,mid+7.5,{grp:role,role}));
    add(pre+'-s1','socket',166,p-9,{grp:role,name:'Sigil socket',text:'Empty. Marrow Sigils will seat here in a later update.',live:false}); link(P_[1],pre+'-s1');
    add(pre+'-s2','socket',166,q+9,{grp:role,name:'Sigil socket',text:'Empty. Marrow Sigils will seat here in a later update.',live:false}); link(Q_[1],pre+'-s2');
    add(pre+'-s3','socket',272,mid,{grp:role,name:'Sigil socket',text:'Empty. Marrow Sigils will seat here in a later update.',live:false}); link(N1,pre+'-s3');
    while(si<22){ const k=si; const host=k%2?X1:W1, deg=k%2?q+17:p-17; const id=sm('f'+k,212,deg); link(host,id); } }
  /* element wedges */
  const elNotes={fire:['wildfire','pyre-walker','cinder-heart','funeral-pyre'],cold:['deep-winter','hoarfrost','glacial-shards','permafrost'],shock:['forked-path','grit-siphon','static-skin','storm-conduit'],water:['tidebreak','undertow','rising-tide','deluge'],wind:['cyclone','eye-of-the-storm','downdraft','tempest'],poison:['virulence','contagion','slow-decay','necrosis'],holy:['litany','sanctuary','zealot-s-fire','inquisitor'],shadow:['long-shadow','unseen','bloomreaper','night-has-teeth'],blood:['open-veins','sanguine-shell','gusher','blood-price'],bone:['spur','bone-plate','brittle-frame','ossuary']};
  const anchors={};
  T_ORDER.forEach((el,i)=>{ const g=i*36+18, o={grp:el,el};
    const es=(tag,r,deg,kind)=>{ const v=kind==='str'&&!T_DOT[el]?'ed':kind; return small(el+'-'+tag,r,deg,{[v+':'+el]:TK[v]},o); };
    const at=add(el+'-attunement','attunement',340,g,Object.assign({art:cat[el+'-attunement'],name:T_ELN[el]+' Attunement',jp:TreeArt.kanji[el],text:`${TK.attune}% of your weapon's damage is added as ${T_ELN[el].toLowerCase()} damage. It stacks with gear and with other Attunements.`},o)); link(gates[el],at);
    const t=['ed','dur','ed','pen','ed'].map((k,j)=>es('t'+j,378+j*32,g,k)); link(at,t[0]); for(let j=1;j<5;j++) link(t[j-1],t[j]);
    const aL=es('a',412,g-7,'ed'), aR=es('b',444,g+7,'str'), cL=es('c',480,g-9,'dur'), dR=es('d',480,g+9,'pen'); link(t[1],aL); link(t[2],aR); link(t[3],cL); link(t[3],dR);
    const n=elNotes[el]; link(aL,named(n[0],'notable',404,g-12.5,o)); link(aR,named(n[1],'notable',440,g+12,o)); link(cL,named(n[2],'notable',516,g-9.5,o)); link(t[4],named(n[3],'keystone',548,g,o));
    anchors[el]={L:cL,R:dR}; });
  /* bridges: a small node on the border between two wedges, and the combo notable hanging off it */
  T_ORDER.forEach((el,i)=>{ const nx=T_ORDER[(i+1)%10], deg=(i+1)*36, c=TreeArt.catalogue.find(c=>c.group==='Bridges'&&c.element===el);
    const b=small('br-'+el,486,deg,{['ed:'+el]:TK.bridge,['ed:'+nx]:TK.bridge},{grp:'bridge',el,el2:nx}); link(anchors[el].R,b); link(b,anchors[nx].L,{});
    link(b,named(c.id,'bridge',520,deg,{grp:'bridge',el,el2:nx}),{braid:1,color:TreeArt.elements[el],color2:TreeArt.elements[nx]}); });
  /* names and text for small nodes */
  for(const n of N){ if(n.kind!=='small') continue; const lines=[]; let glyph='Damage';
    for(const k in n.st){ const [key,el]=k.split(':'); const v=n.st[k];
      if(el){ const E=T_ELN[el].toLowerCase(); if(key==='ed'){ lines.push(`+${v}% ${E} damage`); glyph='Element damage'; } else if(key==='dur'){ lines.push(`${T_STATUS[el][1]} lasts ${v}% longer`); glyph='Status duration'; } else if(key==='str'){ lines.push(`${T_STATUS[el][1]} deals ${v}% more`); glyph='Status strength'; } else if(key==='pen'){ lines.push(`Foes resist ${E} ${v}% less`); glyph='Penetration'; } }
      else { lines.push(T_STAT[key][1](v)); glyph=T_STAT[key][0]; } }
    n.glyph=glyph; n.name=n.el2?`${T_ELN[n.el]} · ${T_ELN[n.el2]}`:glyph; n.text=lines.join('|'); }
  TREE.extent=600; }

/* ---------- what a character has ---------- */
const treeOf=()=>{ if(typeof META==='undefined'||!META) return null; if(!META.tree||META.tree.v!==TREE.VER) META.tree={v:TREE.VER,a:[],g:(META.tree&&META.tree.g)||[]}; return META.tree; };
const tHas=id=>{ const t=TREE.set; return !!(t&&t.has(id)); };
function treePoints(){ return Math.max(0,(P?P.lvl:1)-1); }
function treeSpent(){ const t=treeOf(); return t?t.a.length:0; }
function treeFree(){ return treePoints()-treeSpent(); }
const tNode=id=>TREE.by[id];
function forkSibling(n){ if(!n.fork) return null; return TREE.nodes.find(o=>o.fork===n.fork&&o!==n); }
function tCanTake(n){ if(!n.live||n.kind==='heart'||n.kind==='socket') return false; const s=forkSibling(n); return !(s&&tHas(s.id)); }
/* cheapest path from what's owned to a node, through nodes that can be taken */
function treePath(id){ const goal=tNode(id); if(!goal||tHas(id)||!tCanTake(goal)) return null; const prev={}, q=[]; const seen=new Set();
  for(const n of TREE.nodes) if(n.kind==='heart'||tHas(n.id)){ q.push(n.id); seen.add(n.id); }
  for(let h=0;h<q.length;h++){ const c=q[h]; if(c===id){ const path=[]; let x=c; while(prev[x]!==undefined){ path.unshift(x); x=prev[x]; } return path; }
    for(const o of TREE.adj[c]){ if(seen.has(o)) continue; const n=tNode(o); if(!tCanTake(n)) continue; seen.add(o); prev[o]=c; q.push(o); } }
  return null; }
function treeTake(id){ const path=treePath(id); if(!path||path.length>treeFree()) return false; const t=treeOf(); for(const p of path) t.a.push(p); treeChanged(); return path.length; }
/* giving a node back also gives back whatever only hung off it */
function treeRefundSet(id){ const t=treeOf(); if(!t||!tHas(id)) return []; const keep=new Set(['heart']), q=['heart'];
  for(let h=0;h<q.length;h++) for(const o of TREE.adj[q[h]]){ if(o===id||keep.has(o)||!tHas(o)) continue; keep.add(o); q.push(o); }
  return t.a.filter(x=>!keep.has(x)); }
const inRopeHouse=()=>!!(typeof L!=='undefined'&&L&&L.def&&L.def.kind==='cabin');
function treeRefund(id){ if(!inRopeHouse()) return false; const out=treeRefundSet(id); if(!out.length) return false; const t=treeOf(); t.a=t.a.filter(x=>!out.includes(x)); treeChanged(); return out.length; }
function treeRefundAll(){ if(!inRopeHouse()) return false; treeOf().a=[]; treeChanged(); return true; }
function treeChanged(){ syncTree(); if(P){ calcStats(); if(typeof renderInv==='function'&&mode==='inv') renderInv(); if(typeof saveGame==='function') saveGame(); } TREEUI.dirty=true; }
/* P.skills and the summed stat nodes, from META.tree */
function syncTree(){ const t=treeOf(); if(!t||!P||P._remote) return; TREE.owner=P;
  t.a=t.a.filter(id=>TREE.by[id]&&TREE.by[id].live); /* a node that was un-forged or renamed gives its point back */
  TREE.set=new Set(t.a); const sk=new Set(['off','exe']), sum={};
  for(const g of t.g) sk.add(g);
  for(const id of t.a){ const n=TREE.by[id]; if(n.sk) sk.add(n.sk); if(n.st) for(const k in n.st) sum[k]=(sum[k]||0)+n.st[k]; }
  if(sk.has('hound')) sk.add('feast');
  for(const id of ['chain-warden','headsman','unbowed','undying']) if(TREE.set.has(id)) sk.add(id);
  for(const el of T_ORDER) if(TREE.set.has(el+'-attunement')) sum['att:'+el]=TK.attune;
  const hadWing=P.skills&&P.skills.has('wing'); P.skills=sk; if(sk.has('wing')&&!hadWing) P.airJ=1; TREE.sum=sum; P.sp=Math.max(0,treeFree()); }
function giveGift(sk,quiet){ const t=treeOf(); if(!t||t.g.includes(sk)) return false; t.g.push(sk); syncTree(); const g=T_GIFTS.find(x=>x.sk===sk);
  if(!quiet&&g) setTimeout(()=>{ toast(`A Gift: ${g.n} ${g.jp}. ${g.d}`); if(typeof AU!=='undefined'&&AU.lvl) AU.lvl(); },1800); if(typeof saveGame==='function'&&P&&!quiet) saveGame(); TREEUI.dirty=true; return true; }
function giftsByReach(quiet){ if(typeof META==='undefined'||!META) return; let far=0; for(const k in (META.reach||{})) far=Math.max(far,META.reach[k]||0); if(META.cleared&&META.cleared.length) far=1e9;
  for(const g of T_GIFTS){ const bi=LEVELS.findIndex(d=>d.id===g.boss); if(bi>=0&&far>bi) giveGift(g.sk,quiet); } }
/* a character from before the tree: everything refunded, Gifts handed over */
function treeMigrate(oldSkills){ const fresh=!META.tree; const t=treeOf(); if(fresh){ for(const g of T_GIFTS) if(oldSkills&&oldSkills.includes(g.sk)&&!t.g.includes(g.sk)) t.g.push(g.sk);
    if(P&&P.lvl>1){ t.note=true; setTimeout(()=>toast('The Marrow 髄 has changed. Every point is back in your hand: press T.'),2200); } }
  giftsByReach(true); syncTree(); if(P){ calcStats(); P.life=Math.min(P.life,P.stats.life); } }

/* ---------- hooks into the game ---------- */
(function(){ const o=restorePlayer; restorePlayer=function(sv){ const r=o(sv); treeMigrate(sv&&sv.skills); return r; }; })();
(function(){ const o=newGame; newGame=function(){ const r=o(); if(typeof META!=='undefined'&&META){ META.tree={v:TREE.VER,a:[],g:[]}; } syncTree(); calcStats(); return r; }; })();
(function(){ const o=bossDefeated; bossDefeated=function(e){ const r=o(e); const g=e&&T_GIFTS.find(x=>x.boss===e.kind); if(g&&P&&!P._remote) giveGift(g.sk); return r; }; })();
(function(){ const o=goLevel; goLevel=function(i){ const r=o(i); const d=LEVELS[i]; if(d&&(d.kind==='dungeon'||d.kind==='boss'||d.kind==='surface')&&P&&!(typeof SECRET!=='undefined'&&SECRET.on)){ for(const g of T_GIFTS){ const bi=LEVELS.findIndex(x=>x.id===g.boss); if(bi>=0&&i>bi) giveGift(g.sk); } } if(P&&TREE.owner!==P) syncTree(); return r; }; })();
/* points: 1 per level; the HUD and the phone badge read P.sp */
(function(){ const o=gainXP; gainXP=function(n){ const r=o(n); if(P&&P===TREE.owner) P.sp=Math.max(0,treeFree()); return r; }; })();

/* the stat nodes, last of all, for the hero who owns the tree */
(function(){ const o=calcStats; calcStats=function(){ const r=o(); if(!P||P._remote||P!==TREE.owner||!TREE.sum) return r; const s=P.stats, m=TREE.sum, v=k=>m[k]||0;
  s.dmgP=(s.dmgP||0)+v('dmg');
  if(v('mdmg')&&typeof wGrades==='function'){ const f=it=>1+v('mdmg')*GRADE_F[wGrades(it)[0]]/100, a=f(P.equip.weapon), b=f(P.equip.off);
    if(s.max>0){ s.min=Math.max(1,Math.round(s.min*a)); s.max=Math.max(s.min+1,Math.round(s.max*a)); } if(s.omax>0){ s.omin=Math.max(1,Math.round(s.omin*b)); s.omax=Math.max(s.omin+1,Math.round(s.omax*b)); } }
  s.life=Math.round(s.life*(1+v('life')/100)); s.def=Math.round(s.def*(1+v('def')/100));
  s.as=Math.round((s.as+v('as'))*10)/10; s.crit=Math.round((s.crit+v('crit'))*10)/10; s.ls=Math.round((s.ls+v('ls'))*10)/10; s.regen=Math.round((s.regen+v('regen'))*10)/10; s.ms=Math.round((s.ms+v('ms'))*10)/10; s.mf+=v('mf'); s.gf+=v('gf');
  if(v('threat')) s.threat=(s.threat||1)*(1+v('threat')/100);
  s.gritP=v('grit'); s.xbowP=v('xbow'); if(v('stag')) s.stagP=(s.stagP||0)+v('stag'); if(v('heal')) s.healMul=(s.healMul||1)*(1+v('heal')/100);
  if(v('carry')&&s.carry!=null){ const was=s.over||0; s.carry+=v('carry'); s.over=Math.max(0,(s.weight||0)-s.carry); const back=was-s.over; if(back>0&&typeof A_PER!=='undefined'){ s.ms=Math.round((s.ms+back*A_PER.wMs)*10)/10; s.as=Math.round((s.as+back*A_PER.wAs)*10)/10; } }
  /* damage types: Attunements add a share of the weapon's damage, then the wedge's own nodes scale the type */
  for(const el of T_ORDER){ const att=v('att:'+el), ed=v('ed:'+el);
    if(att){ if(s.max>0) s.elm.main[el]=(s.elm.main[el]||0)+Math.max(1,Math.round((s.min+s.max)/2*att/100)); if(s.omax>0) s.elm.off[el]=(s.elm.off[el]||0)+Math.max(1,Math.round((s.omin+s.omax)/2*att/100)); }
    if(ed) for(const h of ['main','off']) if(s.elm[h][el]) s.elm[h][el]=Math.max(1,Math.round(s.elm[h][el]*(1+ed/100))); }
  s.exeAt=tHas('headsman')?TK.headsman:.2;
  if(P.life>s.life) P.life=s.life; return r; }; })();
/* penetration (elements.js asks), status length and strength */
function treePen(el){ return P&&P===TREE.owner&&TREE.sum?(TREE.sum['pen:'+el]||0)/100:0; }
(function(){ const o=applyElem; applyElem=function(e,k,d,dir){ const r=o(e,k,d,dir); const m=TREE.sum; if(!m||!P||P!==TREE.owner||!e||e.dead) return r; const dur=m['dur:'+k], str=m['str:'+k]; if(!dur&&!str) return r;
  const st=stOf(e)[T_STATUS[k][0]]; if(st&&!st._tree){ st._tree=1; if(dur&&st.t) st.t*=1+dur/100; if(str&&st.dps) st.dps*=1+str/100; } return r; }; })();
/* Unbowed and Undying */
(function(){ const o=killEnemy; killEnemy=function(e,dir,crit){ const was=e&&e.dead; const r=o(e,dir,crit); if(e&&!was&&e.dead&&!e.boss&&P&&P===TREE.owner&&!P.dead&&tHas('unbowed')) P.life=Math.min(P.stats.life,P.life+P.stats.life*TK.unbowed/100); return r; }; })();
(function(){ const o=updPlayer; updPlayer=function(dt){ const r=o(dt); if(P&&P===TREE.owner&&!P.dead&&tHas('undying')&&P.life<P.stats.life*TK.undying) P.life=Math.min(P.stats.life,P.life+P.stats.regen*dt*.5); return r; }; })();

/* =====================================================================================================================
   the screen
   ===================================================================================================================== */
const TREEUI={open:false,dirty:true,scale:1,cam:{x:0,y:0},sel:null,find:'',t:0,base:null,direct:false,ptr:new Map(),raf:0};
(function(){ const st=document.createElement('style'); st.textContent=`
#mtree{position:absolute;inset:0;z-index:27;background:#0e0a0a;overflow:hidden;touch-action:none;pointer-events:auto;font-family:var(--fs);color:var(--bone)}
#mtCv{position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated;cursor:grab}
#mtCv.drag{cursor:grabbing}
.mt-top{position:absolute;left:0;right:0;top:0;display:flex;align-items:center;gap:calc(var(--u)*1.2);padding:calc(var(--u)*.8) calc(var(--u)*1.4);padding-left:max(calc(var(--u)*1.4),env(safe-area-inset-left));padding-right:max(calc(var(--u)*1.4),env(safe-area-inset-right));background:linear-gradient(#0e0a0a,#0e0a0af0 70%,#0e0a0a00);pointer-events:none}
.mt-top>*{pointer-events:auto}
.mt-top h2{margin:0;font-family:var(--fd);font-weight:400;font-size:max(16px,calc(var(--u)*2.6));letter-spacing:.06em;color:var(--bone);white-space:nowrap}
.mt-top h2 b{color:#b0141a;font-family:'Shippori Mincho',var(--fb);font-weight:800}
#mtPts{font-size:max(11px,calc(var(--u)*1.5));color:var(--ash);white-space:nowrap}#mtPts b{color:#ffd27a;font-weight:400}
#mtFind{flex:0 1 calc(var(--u)*20);min-width:calc(var(--u)*9);margin-left:auto;font:inherit;font-size:max(12px,calc(var(--u)*1.5));color:var(--bone);background:#161110;border:1px solid #3a2c28;padding:calc(var(--u)*.45) calc(var(--u)*.9);-webkit-user-select:text;user-select:text}
#mtFind:focus{outline:1px solid #ffd27a}
#mtree .btn{margin:0;padding:calc(var(--u)*.45) calc(var(--u)*1.5);font-size:max(12px,calc(var(--u)*1.5));white-space:nowrap}
.mt-zoom{position:absolute;right:max(calc(var(--u)*1.4),env(safe-area-inset-right));bottom:max(calc(var(--u)*1.4),env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:calc(var(--u)*.6)}
.mt-zoom button{width:max(40px,calc(var(--u)*4.4));height:max(40px,calc(var(--u)*4.4));padding:0;font-family:var(--fs);font-size:max(16px,calc(var(--u)*2.2));line-height:1;color:var(--bone);background:#161110;border:1px solid #5a4a3c;cursor:pointer}
.mt-zoom button:hover{border-color:#ffd27a;color:#ffd27a}
#mtInfo{position:absolute;left:max(calc(var(--u)*1.4),env(safe-area-inset-left));bottom:max(calc(var(--u)*1.4),env(safe-area-inset-bottom));width:min(46%,calc(var(--u)*40));max-height:62%;overflow:hidden;background:rgba(14,10,10,.94);border:1px solid #3a2c28;padding:calc(var(--u)*1) calc(var(--u)*1.2);text-align:left;font-size:max(11px,calc(var(--u)*1.4));line-height:1.35}
#mtInfo.key{border-color:#ffd27a}
#mtInfo .hd{display:flex;align-items:center;gap:calc(var(--u)*1)}
#mtInfo canvas{image-rendering:pixelated;flex:none;background:#0e0a0a}
#mtInfo .nm{font-size:1.25em;color:var(--bone)}#mtInfo .nm i{font-style:normal;font-family:'Shippori Mincho',var(--fb);font-weight:800;margin-left:.4em}
#mtInfo .tg{color:var(--ash);font-size:.92em}
#mtInfo .fx{margin-top:calc(var(--u)*.6);color:#e8dfca}#mtInfo .fx div{margin-top:.15em}
#mtInfo .cost{color:#e0564a}
#mtInfo .st{margin-top:calc(var(--u)*.6);color:var(--ash)}#mtInfo .st.ok{color:#ffd27a}
#mtInfo .btn{margin-top:calc(var(--u)*.7)}
#mtInfo .gf{margin-top:.25em}#mtInfo .gf.no{color:var(--ash)}
`; document.head.appendChild(st);
  const d=document.createElement('div'); d.id='mtree'; d.hidden=true; d.innerHTML=`<canvas id="mtCv" aria-label="The Marrow tree. Drag to move, pinch or scroll to zoom, select a node to read it."></canvas>
    <div class="mt-top"><h2>The Marrow <b>髄</b></h2><span id="mtPts"></span><input id="mtFind" type="search" placeholder="Find: bleed, life, 水…" aria-label="Find a node" autocomplete="off"><button class="btn ghost" id="mtAll" hidden>Give every point back</button><button class="btn ghost" id="mtBack">Back</button></div>
    <div class="mt-zoom"><button id="mtIn" aria-label="Zoom in">+</button><button id="mtOut" aria-label="Zoom out">−</button><button id="mtHeart" aria-label="Centre on the Heart">髄</button></div>
    <div id="mtInfo" hidden></div>`;
  $('#inv').parentNode.appendChild(d); })();

const tAttrC=r=>T_ROLE[r]?T_ROLE[r].c:'#8a847e';
function tNodeColor(n){ if(n.el) return TreeArt.elements[n.el]; if(n.role) return tAttrC(n.role); if(n.grp&&T_ROLE[n.grp]) return tAttrC(n.grp); return '#ece6d8'; }
function tNodeSize(n){ return n.kind==='heart'?56:n.vert?14:TreeArt.sizes[n.kind]||10; }
function tState(n,path,refund){ if(n.kind==='heart'||tHas(n.id)) return 'allocated'; if(path&&path.includes(n.id)) return 'preview';
  if(n.fork){ const s=forkSibling(n); if(s&&tHas(s.id)) return 'refusable'; }
  if(!tCanTake(n)) return 'locked'; return TREE.adj[n.id].some(o=>o==='heart'||tHas(o))?'reachable':'far'; }
function tDrawNode(c,n,x,y,state,opt){ opt=opt||{};
  if(n.kind==='heart') return; if(n.kind==='socket'){ TreeArt.frame(c,'socket',x,y,{state:'locked'}); return; }
  if(n.vert){ TreeArt.vertebra(c,x,y,{state:state==='reachable'||state==='preview'?'reachable':state}); return; }
  if(n.kind==='small'){ TreeArt.frame(c,'small',x,y,{state,color:tNodeColor(n),reducedMotion:true}); return; }
  TreeArt.node(c,n.art,x,y,{state,reducedMotion:true,refund:!!opt.refund,color2:n.el2?TreeArt.elements[n.el2]:undefined,both:state==='allocated'}); }
function tPxRing(c,col,r,gap){ const n=Math.ceil(r*6.3); c.fillStyle=col; for(let i=0;i<n;i++){ if(gap&&(i%gap)>gap-4) continue; const a=i/n*Math.PI*2; c.fillRect(Math.round(Math.cos(a)*r),Math.round(Math.sin(a)*r),1,1); } }
function tGuides(c){ const pt=(r,deg)=>{ const a=deg*Math.PI/180; return [Math.round(r*Math.sin(a)),Math.round(-r*Math.cos(a))]; };
  const spoke=(col,deg,r0,r1,al)=>{ c.globalAlpha=al; c.fillStyle=col; for(let r=r0;r<r1;r++){ if(r%9>6) continue; const [x,y]=pt(r,deg); c.fillRect(x,y,1,1); } c.globalAlpha=1; };
  for(const [r,g] of [[152,31],[318,37],[584,43]]){ tPxRing(c,'#3b302d',r,g); tPxRing(c,'#241d1b',r-2,g-12); }
  for(const role in T_ROLE){ const R=T_ROLE[role], mid=(R.a0+R.a1)/2; spoke(R.c,R.a0,152,318,.35); c.globalAlpha=.13; const [x,y]=pt(218,mid+(role==='finesse'?0:18)); TreeArt.sigil(c,R.jp,x,y,44,R.c); c.globalAlpha=1; }
  T_ORDER.forEach((el,i)=>{ const col=TreeArt.elements[el]; spoke(col,i*36,318,584,.28); c.globalAlpha=.5; const [x,y]=pt(600,i*36+18); TreeArt.sigil(c,TreeArt.kanji[el],x,y,18,col); c.globalAlpha=.07; const [x2,y2]=pt(455,i*36+18); TreeArt.sigil(c,TreeArt.kanji[el],x2,y2,72,col); c.globalAlpha=1;
    c.globalAlpha=.35; c.fillStyle=col; const n=Math.ceil(578*.61); for(let k=4;k<n-4;k++){ if(k%7>4) continue; const [ax,ay]=pt(578,i*36+k/n*36); c.fillRect(ax,ay,1,1); } c.globalAlpha=1; }); }
function tLinkKey(a,b){ return a<b?a+'|'+b:b+'|'+a; }
function tRebuild(){ const E=TREE.extent+24, S=E*2; let cv=TREEUI.base; if(!cv){ cv=TREEUI.base=document.createElement('canvas'); cv.width=cv.height=S; } const c=cv.getContext('2d'); c.imageSmoothingEnabled=false;
  c.setTransform(1,0,0,1,0,0); c.clearRect(0,0,S,S); c.translate(E,E); tGuides(c);
  const path=TREEUI.path||null, onPath=id=>id==='heart'||tHas(id)||(path&&path.includes(id));
  const refund=TREEUI.refund||[];
  const seen=new Set();
  for(const n of TREE.nodes) for(const o of TREE.adj[n.id]){ const k=tLinkKey(n.id,o); if(seen.has(k)) continue; seen.add(k); const m=TREE.by[o], lo=TREE.linkOpt[k]||{};
    const own=(n.kind==='heart'||tHas(n.id))&&(m.kind==='heart'||tHas(m.id)); const pv=!own&&path&&onPath(n.id)&&onPath(m.id)&&(path.includes(n.id)||path.includes(m.id));
    if(pv){ continue; } /* preview links are drawn live, marching */
    TreeArt.connection(c,n,m,Object.assign({state:own?'allocated':'unallocated',reducedMotion:true},lo)); }
  /* 'far' = forged but not next to anything you own: drawn like a reachable node at half strength, so the tree can be read
     and unforged nodes (ash grey) stand apart */
  for(const n of TREE.nodes){ const st=tState(n,path); if(st==='far'){ c.globalAlpha=.5; tDrawNode(c,n,n.x,n.y,'reachable'); c.globalAlpha=1; } else tDrawNode(c,n,n.x,n.y,st,{refund:refund.includes(n.id)}); }
  TREEUI.dirty=false; }
function tResize(){ const el=$('#mtree'), cv=$('#mtCv'); const w=Math.max(200,el.clientWidth|0), h=Math.max(120,el.clientHeight|0); if(cv.width!==w||cv.height!==h){ cv.width=w; cv.height=h; } TREEUI.fit=Math.min(w,h-40)/(2*(TREE.extent+16)); }
function tZoomLevels(){ const f=TREEUI.fit||.4; return [f,1,2,3].filter((v,i,a)=>i===0||v>a[0]*1.15); }
function tSetScale(s,ax,ay){ const cv=$('#mtCv'), f=TREEUI.fit||.4; s=clamp(s,f,3); const cx=ax==null?cv.width/2:ax, cy=ay==null?cv.height/2:ay, old=TREEUI.scale;
  const wx=(cx-cv.width/2)/old+TREEUI.cam.x, wy=(cy-cv.height/2)/old+TREEUI.cam.y; TREEUI.scale=s; TREEUI.cam.x=wx-(cx-cv.width/2)/s; TREEUI.cam.y=wy-(cy-cv.height/2)/s; tClampCam(); }
function tClampCam(){ const E=TREE.extent; TREEUI.cam.x=clamp(TREEUI.cam.x,-E,E); TREEUI.cam.y=clamp(TREEUI.cam.y,-E,E); }
function tStep(dir){ const lv=tZoomLevels(), s=TREEUI.scale; let i=lv.findIndex(v=>v>=s-.01); if(i<0) i=lv.length-1; if(dir>0) i=Math.min(lv.length-1,lv[i]>s+.01?i:i+1); else i=Math.max(0,i-1); tSetScale(lv[i]); }
function tDraw(){ const cv=$('#mtCv'), g=cv.getContext('2d'), s=TREEUI.scale, E=TREE.extent+24; if(TREEUI.dirty||!TREEUI.base) tRebuild();
  g.setTransform(1,0,0,1,0,0); g.fillStyle='#0e0a0a'; g.fillRect(0,0,cv.width,cv.height); g.imageSmoothingEnabled=s<1;
  const ox=Math.round(cv.width/2-(TREEUI.cam.x+E)*s), oy=Math.round(cv.height/2-(TREEUI.cam.y+E)*s); g.drawImage(TREEUI.base,ox,oy,Math.round(E*2*s),Math.round(E*2*s));
  g.setTransform(s,0,0,s,ox+E*s,oy+E*s); g.imageSmoothingEnabled=false; const t=RM?0:TREEUI.t;
  TreeArt.heart(g,0,0,t,RM);
  const path=TREEUI.path; if(path&&path.length){ const all=id=>id==='heart'||tHas(id)||path.includes(id), seen=new Set();
    for(const id of path) for(const o of TREE.adj[id]){ const k=tLinkKey(id,o); if(seen.has(k)||!all(o)) continue; seen.add(k); TreeArt.connection(g,TREE.by[id],TREE.by[o],{state:'preview',time:t,reducedMotion:RM}); }
    for(const id of path){ const n=TREE.by[id]; tDrawNode(g,n,n.x,n.y,'preview'); } }
  if(TREEUI.find){ g.fillStyle='#ffd27a'; for(const n of TREEUI.hits||[]){ const r=tNodeSize(n)/2+3; g.save(); g.translate(n.x,n.y); tPxRing(g,'#ffd27a',r,0); tPxRing(g,'#ffd27a',r+1,0); g.restore(); } }
  if(TREEUI.sel){ const n=TREE.by[TREEUI.sel], r=tNodeSize(n)/2+2+(RM?0:Math.floor(t*3)%2); g.save(); g.translate(n.x,n.y); tPxRing(g,'#ece6d8',r,5); g.restore(); }
  g.setTransform(1,0,0,1,0,0); }
function tLoop(ts){ if(!TREEUI.open) return; TREEUI.t=ts/1000; if($('#mtCv').width!==($('#mtree').clientWidth|0)||$('#mtCv').height!==($('#mtree').clientHeight|0)){ tResize(); tSetScale(TREEUI.scale); } tDraw(); TREEUI.raf=requestAnimationFrame(tLoop); }
function tPick(px,py){ const cv=$('#mtCv'), s=TREEUI.scale, wx=(px-cv.width/2)/s+TREEUI.cam.x, wy=(py-cv.height/2)/s+TREEUI.cam.y; let best=null, bd=1e9;
  for(const n of TREE.nodes){ const d=Math.hypot(n.x-wx,n.y-wy), lim=tNodeSize(n)/2+Math.max(3,9/s); if(d<lim&&d-tNodeSize(n)/2<bd){ bd=d-tNodeSize(n)/2; best=n; } } return best; }
const tEsc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function tKindLine(n){ const parts=[]; if(n.kind==='heart') return 'Start'; parts.push(n.vert?'Spine':({small:'Small node',brand:'Brand',fork:'Fork',notable:'Notable',keystone:'Keystone',attunement:'Attunement',bridge:'Bridge',socket:'Socket',paradox:'Keystone · Spine'})[n.kind]);
  if(n.el2) parts.push(`${T_ELN[n.el]} and ${T_ELN[n.el2]}`); else if(n.el) parts.push(T_ELN[n.el]); else if(n.role&&T_ROLE[n.role]) parts.push(`${T_ROLE[n.role].jp} ${T_ROLE[n.role].n}`); return parts.join(' · '); }
function tSelect(id){ TREEUI.sel=id; const n=id&&TREE.by[id]; TREEUI.path=n&&!tHas(id)?treePath(id):null; TREEUI.refund=n&&tHas(id)&&inRopeHouse()?treeRefundSet(id):[]; TREEUI.dirty=true; const t=treeOf(); if(t&&t.note&&id){ t.note=false; } tInfo(); tClear(); }
/* the panel must never sit on the node it describes: slide the view until the node is clear of it */
function tClear(){ const n=TREEUI.sel&&TREE.by[TREEUI.sel], box=$('#mtInfo'), cv=$('#mtCv'); if(!n||box.hidden) return; const r=cv.getBoundingClientRect(), b=box.getBoundingClientRect(), k=cv.width/r.width, s=TREEUI.scale;
  const sx=cv.width/2+(n.x-TREEUI.cam.x)*s, sy=cv.height/2+(n.y-TREEUI.cam.y)*s, pad=tNodeSize(n)/2*s+14, bx=(b.right-r.left)*k, by=(b.top-r.top)*k;
  if(sx<bx+pad&&sy>by-pad){ const dx=bx+pad-sx, dy=sy-(by-pad); if(dy<=dx||bx+pad>cv.width-60) TREEUI.cam.y+=dy/s; else TREEUI.cam.x-=dx/s; } }
function tInfo(){ const box=$('#mtInfo'), t=treeOf(), free=treeFree(), pts=treePoints(); $('#mtPts').innerHTML=`<b>${free}</b> of ${pts} point${pts===1?'':'s'} free`; $('#mtAll').hidden=!(inRopeHouse()&&treeSpent()>0);
  const n=TREEUI.sel&&TREE.by[TREEUI.sel];
  if(!n){ if(t&&t.note){ box.hidden=false; box.className=''; box.innerHTML=`<div class="hd"><canvas id="mtIc" width="48" height="48" style="width:48px;height:48px"></canvas><div><div class="nm">The Marrow has changed</div><div class="tg">One tree now holds everything</div></div></div><div class="fx"><div>Your Brands and the old Marrow boosts are one tree. Every point you had is back in your hand: 1 for each level after the first.</div><div>Ash Wings, Grave Claw and Red Tether are Gifts now. They cost nothing and come from the first three bosses.</div><div>Take points anywhere. You can give them back only in the Rope-House.</div></div>`; const g=$('#mtIc').getContext('2d'); g.imageSmoothingEnabled=false; g.save(); g.translate(24,24); g.scale(3,3); TreeArt.ribcage(g,0,0,16); g.restore(); }
    else box.hidden=true; return; }
  box.hidden=false; box.className=n.kind==='keystone'||n.kind==='paradox'?'key':''; const own=n.kind==='heart'||tHas(n.id), z=n.kind==='small'||n.vert?4:n.kind==='keystone'||n.kind==='paradox'||n.kind==='heart'?1.2:2, sz=Math.round(tNodeSize(n)*z)+8;
  const lines=(n.text||'').split('|').map(l=>`<div${/^Costs:/.test(l)?' class="cost"':''}>${tEsc(l)}</div>`).join('');
  let st='', btn='';
  if(n.kind==='heart'){ st=`<div class="fx">${T_GIFTS.map(g=>{ const has_=t&&t.g.includes(g.sk), bd=LEVELS.find(d=>d.id===g.boss); return `<div class="gf${has_?'':' no'}">${has_?'Gift':'Gift to come'}: ${g.n} ${g.jp}${has_?'. '+tEsc(g.d):bd?', from '+tEsc(bd.name):''}</div>`; }).join('')}</div>`; }
  else if(n.kind==='socket'){ st=''; }
  else if(own){ if(inRopeHouse()){ const out=TREEUI.refund||[]; btn=`<button class="btn" id="mtDo">Give back · ${out.length} point${out.length===1?'':'s'}</button>`; if(out.length>1) st=`<div class="st">${out.length-1} other node${out.length===2?' hangs':'s hang'} off this one and come${out.length===2?'s':''} back with it.</div>`; } else st='<div class="st ok">Taken. Points can be given back in the Rope-House.</div>'; }
  else if(!n.live){ st='<div class="st">Not yet forged. It comes in a later update.</div>'; }
  else { const sib=forkSibling(n); if(sib&&tHas(sib.id)) st=`<div class="st cost">Its other fork, ${tEsc(sib.name)}, is taken. Give that back in the Rope-House first.</div>`;
    else { const p=TREEUI.path; if(!p) st='<div class="st">No path leads here yet.</div>'; else if(p.length<=free) btn=`<button class="btn" id="mtDo">Take · ${p.length} point${p.length===1?'':'s'}</button>`; else st=`<div class="st">Needs ${p.length} point${p.length===1?'':'s'}. You have ${free}.</div>`; } }
  const fork=n.fork?`<div class="tg">Fork of ${tEsc(TREE.by[n.fork].name)}: takes the place of ${tEsc((forkSibling(n)||{}).name||'')}</div>`:'';
  box.innerHTML=`<div class="hd"><canvas id="mtIc" width="${sz}" height="${sz}" style="width:${sz}px;height:${sz}px"></canvas><div><div class="nm" style="color:${n.kind==='small'||n.kind==='heart'||n.kind==='socket'?'#ece6d8':tNodeColor(n)}">${tEsc(n.name||'')}${n.jp&&n.kind!=='small'?`<i>${tEsc(n.jp)}</i>`:''}</div><div class="tg">${tKindLine(n)}</div>${fork}</div></div><div class="fx">${lines}</div>${st}${btn}`;
  const g=$('#mtIc').getContext('2d'); g.imageSmoothingEnabled=false; g.save(); g.translate(sz/2,sz/2); g.scale(z,z);
  if(n.kind==='heart') TreeArt.heart(g,0,0,0,true); else if(n.kind==='small'&&!n.vert){ g.scale(.75,.75); TreeArt.glyph(g,n.glyph,0,0,tNodeColor(n)); } else tDrawNode(g,n,0,0,own?'allocated':'reachable'); g.restore();
  const b=$('#mtDo'); if(b) b.onclick=()=>tAct(n.id); }
function tAct(id){ const n=TREE.by[id]; if(!n) return; if(tHas(id)){ if(treeRefund(id)){ AU.tone('sine',300,150,.3,.1,.4); tSelect(id); } return; }
  const k=treeTake(id); if(k){ if(n.kind==='small') AU.tone('triangle',440,660,.08,.08,.2); else { AU.lvl(); if(typeof impactT!=='undefined') impactT=.04; } tSelect(id); } }
function tSearch(q){ q=(q||'').trim().toLowerCase(); TREEUI.find=q; TREEUI.hits=q?TREE.nodes.filter(n=>((n.name||'')+' '+(n.jp||'')+' '+(n.text||'')+' '+(n.el?T_ELN[n.el]:'')+' '+(n.role||'')).toLowerCase().includes(q)):[]; }
function openTree(){ if(!P||TREEUI.open) return; if(TREE.owner!==P) syncTree(); TREEUI.open=true; $('#mtree').hidden=false; hideTip(); tResize(); TREEUI.scale=clamp(1,TREEUI.fit,3); TREEUI.cam={x:0,y:0}; TREEUI.sel=null; TREEUI.path=null; TREEUI.refund=[]; TREEUI.dirty=true; $('#mtFind').value=''; tSearch(''); tInfo(); cancelAnimationFrame(TREEUI.raf); TREEUI.raf=requestAnimationFrame(tLoop); }
function closeTree(){ if(!TREEUI.open) return; TREEUI.open=false; TREEUI.direct=false; $('#mtree').hidden=true; cancelAnimationFrame(TREEUI.raf); $('#mtFind').blur(); }
/* wiring: the satchel tab and T open the tree; leaving the satchel closes it */
renderTree=function(){};
(function(){ const o=setTab; setTab=function(t){ if(t==='tree'){ if(TREEUI.open){ closeTree(); return; } o('bag'); openTree(); return; } closeTree(); return o(t); }; })();
(function(){ const o=toggleInv; toggleInv=function(open,tab){ if(!open) closeTree(); const r=o(open,tab); TREEUI.direct=!!(open&&tab==='tree'&&TREEUI.open); return r; }; })();
(function(){ const cv=$('#mtCv'), P_=TREEUI.ptr; let moved=0, pinch=0;
  const pos=e=>{ const r=cv.getBoundingClientRect(); return [(e.clientX-r.left)*cv.width/r.width,(e.clientY-r.top)*cv.height/r.height]; };
  cv.addEventListener('pointerdown',e=>{ cv.setPointerCapture(e.pointerId); const [x,y]=pos(e); P_.set(e.pointerId,{x,y}); if(P_.size===1) moved=0; if(P_.size===2){ const [a,b]=[...P_.values()]; pinch=Math.hypot(a.x-b.x,a.y-b.y); moved=99; } cv.classList.add('drag'); $('#mtFind').blur(); });
  cv.addEventListener('pointermove',e=>{ const p=P_.get(e.pointerId); if(!p) return; const [x,y]=pos(e), dx=x-p.x, dy=y-p.y; p.x=x; p.y=y;
    if(P_.size===1){ moved+=Math.abs(dx)+Math.abs(dy); if(moved>6){ TREEUI.cam.x-=dx/TREEUI.scale; TREEUI.cam.y-=dy/TREEUI.scale; tClampCam(); } }
    else if(P_.size===2){ const [a,b]=[...P_.values()], d=Math.hypot(a.x-b.x,a.y-b.y); if(pinch>0&&d>0) tSetScale(TREEUI.scale*d/pinch,(a.x+b.x)/2,(a.y+b.y)/2); pinch=d; } });
  const up=e=>{ const p=P_.get(e.pointerId); if(!p) return; P_.delete(e.pointerId); if(!P_.size) cv.classList.remove('drag'); if(e.type==='pointerup'&&moved<=6&&!P_.size){ const n=tPick(p.x,p.y); if(n&&n.id===TREEUI.sel&&n.kind!=='heart') tAct(n.id); else tSelect(n?n.id:null); } };
  cv.addEventListener('pointerup',up); cv.addEventListener('pointercancel',up);
  cv.addEventListener('wheel',e=>{ e.preventDefault(); const [x,y]=pos(e); const lv=tZoomLevels(), s=TREEUI.scale; let i=lv.findIndex(v=>v>=s-.01); if(i<0) i=lv.length-1; i=clamp(i+(e.deltaY<0?1:-1),0,lv.length-1); tSetScale(lv[i],x,y); },{passive:false});
  $('#mtIn').onclick=()=>tStep(1); $('#mtOut').onclick=()=>tStep(-1); $('#mtHeart').onclick=()=>{ TREEUI.cam={x:0,y:0}; tSetScale(clamp(1,TREEUI.fit,3)); };
  $('#mtBack').onclick=()=>{ if(TREEUI.direct) toggleInv(false); else closeTree(); };
  $('#mtAll').onclick=()=>{ if(treeRefundAll()){ AU.tone('sine',300,150,.3,.1,.4); tSelect(null); } };
  const f=$('#mtFind'); f.addEventListener('input',()=>tSearch(f.value)); for(const ev of ['keydown','keyup','keypress']) f.addEventListener(ev,e=>{ if(e.key==='Escape'){ f.value=''; tSearch(''); f.blur(); } e.stopPropagation(); });
  window.addEventListener('keydown',e=>{ if(!TREEUI.open||e.target===f) return; const k=e.key, st=40/TREEUI.scale;
    if(k==='ArrowLeft') TREEUI.cam.x-=st; else if(k==='ArrowRight') TREEUI.cam.x+=st; else if(k==='ArrowUp') TREEUI.cam.y-=st; else if(k==='ArrowDown') TREEUI.cam.y+=st; else if(k==='+'||k==='=') tStep(1); else if(k==='-') tStep(-1); else if(k==='Enter'&&TREEUI.sel) tAct(TREEUI.sel); else return; tClampCam(); e.preventDefault(); });
})();
buildTree();
