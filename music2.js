'use strict';
/* ===== music2 (v26): recorded scores for each region, each act and each boss =====
   The synth choir (music.js) stays underneath as glue. Over it, every region has:
     pad    a texture that loops the whole time you're there
     theme  tonal loops played one at a time, with silences between them, so the fields never just loop
     perc   drums: under the fighting (arenas and bosses), and in a few places all the time (the siege at Kesh,
            the Last Light)
     sting  a horn, a bell or a hit, now and then, and when a fight starts
   The act decides the instruments: Kesh is war drums and iron strings. Act I (the March) is cello and folk
   instruments (fiddle, lute, duduk) in D minor. Act II (Hollowmere) is music box, organ, harp and court strings,
   detuned the lower you go. Act III goes back down to the old choir over two slowed textures.
   Files load per level (the next level's set is fetched in the background), so the game doesn't fetch 8 MB at start.
   Drums are retimed to the theme's tempo, and the theme waits for the drum's next bar, so they don't drift. */
const MX={on:false,set:null,key:null,mood:'title',bus:null,ch:{},voices:{pad:[],theme:[],perc:[]},want:new Set(),loading:new Set(),
  BPM:{mx_a1_cello_low_D:90,mx_a1_cello_micro_Dm:90,mx_a1_cello_rough_D:90,mx_a1_cello_prog_D:90,mx_meadow_fiddle_Dm:80,mx_meadow_lute_Am:93.33,
    mx_ashes_duduk_Dm:90,mx_ashes_duduk_riff_Dm:105,mx_pass_fiddle_snow_Dm:140,mx_villages_musicbox_Cm:75,mx_villages_fiddle_Dm:80,mx_oldcity_organ_Fsm:57,
    mx_royal_harp_Cm:65,mx_royal_strings_D:90,mx_a2boss_stabs_Fm:86,mx_a1boss_strings_Dm:90,mx_slums_industrial:65,
    mx_pro_war_drums:85,mx_fort_war_bell_drums:85,mx_pass_shaman_drum:90,mx_a1boss_war_155:155,mx_a1boss_frame_drum:95,mx_a2boss_drums:132,mx_a2boss_predator:90},
  /* pad: [name, vol, rate, filter]; theme: name or [name, rate, vol]; idle: perc that plays while exploring [name, vol];
     arena: perc for Blood Arenas in this region; duck: how far the synth layers drop under this set */
  SETS:{
    title:{pad:[['mx_pro_iron_string_D',.55]],theme:['mx_a1_cello_low_D','mx_a1_cello_micro_Dm'],gap:[8,14],duck:{choir:.55,high:.5}},
    kesh:{pad:[['mx_pro_iron_string_D',.6]],theme:['mx_a1_cello_rough_D','mx_a1_cello_prog_D'],idle:['mx_pro_war_drums',.62],arena:'mx_pro_war_drums',sting:['mx_pro_horn_Dm','mx_fort_war_horn_E'],gap:[4,9]},
    meadow:{pad:[['mx_ashes_wind',.5,1,{type:'lowpass',f:1500}],['mx_fen_chaser_Dm',.22,1,{type:'lowpass',f:1100}]],theme:['mx_meadow_fiddle_Dm','mx_a1_cello_low_D','mx_meadow_lute_Am','mx_a1_cello_micro_Dm'],arena:'mx_pass_shaman_drum',sting:['mx_pass_bells_Dm'],gap:[10,18]},
    fen:{pad:[['mx_fen_bow_Ebm',.62,.9439],['mx_ashes_wind',.2,.8,{type:'lowpass',f:600}]],theme:['mx_a1_cello_micro_Dm','mx_fen_chaser_Dm','mx_a1_cello_low_D'],arena:'mx_a1boss_frame_drum',gap:[12,20]},
    ashes:{pad:[['mx_ashes_wind',.75]],theme:['mx_ashes_duduk_riff_Dm','mx_ashes_duduk_Dm','mx_a1_cello_rough_D'],arena:'mx_a1boss_frame_drum',gap:[8,15]},
    pass:{pad:[['mx_pass_bells_Dm',.6],['mx_ashes_wind',.35,.9,{type:'lowpass',f:900}]],theme:['mx_pass_fiddle_snow_Dm','mx_a1_cello_prog_D','mx_a1_cello_low_D'],arena:'mx_pass_shaman_drum',gap:[10,18]},
    fort:{pad:[['mx_pro_iron_string_D',.55]],theme:['mx_a1_cello_rough_D','mx_a1_cello_prog_D'],idle:['mx_fort_war_bell_drums',.34],arena:'mx_fort_war_bell_drums',sting:['mx_fort_war_horn_E'],gap:[6,12]},
    villages:{pad:[['mx_slums_menace',.42,1,{type:'lowpass',f:900}]],theme:['mx_villages_musicbox_Cm','mx_villages_fiddle_Dm'],arena:'mx_fort_war_bell_drums',sting:['mx_oldcity_bells_Dm'],gap:[10,18]},
    slums:{pad:[['mx_slums_industrial',.6],['mx_slums_menace',.45]],theme:[['mx_villages_musicbox_Cm',.943,.85],['mx_slums_industrial',.94,.5]],arena:'mx_a2boss_predator',gap:[14,24],duck:{choir:.15}},
    oldcity:{pad:[['mx_oldcity_tortured_A',.55]],theme:['mx_oldcity_organ_Fsm',['mx_villages_musicbox_Cm',.89,.6]],arena:'mx_a2boss_predator',sting:['mx_oldcity_bells_Dm'],gap:[10,18]},
    royal:{pad:[['mx_royal_bow_Bb',.5]],theme:['mx_royal_harp_Cm','mx_royal_strings_D'],arena:'mx_a2boss_drums',sting:['mx_oldcity_bells_Dm'],gap:[8,14]},
    bridge:{pad:[['mx_bridge_bass_A',.55],['mx_bridge_chaser_E',.3]],theme:['mx_royal_strings_D'],arena:'mx_a2boss_drums',sting:['mx_bridge_braaam'],gap:[14,24]},
    deep:{pad:[['mx_oldcity_tortured_A',.42,.667],['mx_bridge_bass_A',.36,.667,{type:'lowpass',f:700}]],theme:[],duck:{choir:1,high:1,throat:1,drums:1,war:1,frenzy:1},synthPerc:1}},
  BOSS:{odo:{perc:'mx_a1boss_war_155',theme:'mx_a1boss_strings_Dm'},sisters:{perc:'mx_a1boss_frame_drum',theme:'mx_a1_cello_micro_Dm'},
    preacher:{perc:'mx_a1boss_frame_drum',theme:'mx_ashes_duduk_Dm'},merrow:{perc:'mx_a1boss_war_155',theme:'mx_a1boss_strings_Dm'},
    piet:{perc:'mx_fort_war_bell_drums',theme:'mx_a1boss_strings_Dm',sting:'mx_fort_war_horn_E'},
    brann:{perc:'mx_a2boss_drums',theme:'mx_a2boss_stabs_Fm',sting:'mx_fort_war_horn_E'},tithe:{perc:'mx_a2boss_predator',theme:['mx_villages_musicbox_Cm',.943,.7]},
    choir:{perc:'mx_a2boss_predator',theme:'mx_oldcity_organ_Fsm'},rook:{perc:'mx_a2boss_drums',theme:'mx_a2boss_stabs_Fm',sting:'mx_fort_war_horn_E'},
    gideon:{perc:'mx_a2boss_predator',theme:'mx_a2boss_stabs_Fm',sting:'mx_bridge_braaam'}},
  /* how loud each channel sits in each mood */
  MOOD:{title:{pad:.8,theme:.8,perc:0},surface:{pad:1,theme:1,perc:1},deep:{pad:1,theme:1,perc:1},lair:{pad:.9,theme:.7,perc:.3},
    boss:{pad:.6,theme:.75,perc:1},cut:{pad:.5,theme:.2,perc:0},calm:{pad:.55,theme:.45,perc:0},silent:{pad:.06,theme:0,perc:0}},

  /* ---------- which set is playing ---------- */
  keyFor(def,mood){ if(mood==='title') return 'title'; if(!def||def.kind==='cabin') return null;
    if(def.look&&this.SETS[def.look]) return def.look; if(def.pal==='kesh'||def.id==='wall') return 'kesh';
    if(def.boss==='choir'||def.id==='choir') return 'oldcity'; if(def.act==='Act III'||def.act==='Finale') return 'deep'; return null; },
  bossFor(def){ return def&&def.kind==='boss'&&this.BOSS[def.boss||def.id]?this.BOSS[def.boss||def.id]:null; },
  filesFor(key,def){ const s=this.SETS[key]; if(!s) return []; const f=new Set(); s.pad.forEach(p=>f.add(p[0])); s.theme.forEach(t=>f.add(typeof t==='string'?t:t[0]));
    if(s.idle) f.add(s.idle[0]); if(s.arena) f.add(s.arena); (s.sting||[]).forEach(n=>f.add(n));
    const b=this.bossFor(def); if(b){ f.add(b.perc); f.add(typeof b.theme==='string'?b.theme:b.theme[0]); if(b.sting) f.add(b.sting); } return [...f]; },

  /* ---------- loading, one level at a time ---------- */
  fetch(n){ if(SMP.has(n)||this.loading.has(n)||!AU.c) return; this.loading.add(n);
    fetch('audio/'+n+'.ogg').then(r=>r.ok?r.arrayBuffer():Promise.reject(r.status)).then(a=>new Promise((ok,no)=>AU.c.decodeAudioData(a,ok,no)))
      .then(b=>{ SMP.buf[n]=b; this.loading.delete(n); this.ready(n); }).catch(()=>{ this.loading.delete(n); }); },
  ready(n){ if(!this.on||!this.set) return; if(this.set.pad.some(p=>p[0]===n)) this.startPads(); if(!this.voices.theme.length&&!this.themeT) this.queueTheme(.5);
    if(this.percName===n&&!this.voices.perc.length) this.startPerc(this.percName,this.percVol); },

  init(){ if(this.on||!AU.c||!MUS.on) return; const c=AU.c; this.on=true;
    const comp=c.createDynamicsCompressor(); comp.threshold.value=-16; comp.ratio.value=2.5; comp.attack.value=.02; comp.release.value=.4; comp.connect(AU.mm);
    this.bus=c.createGain(); this.bus.gain.value=.85; this.bus.connect(comp);
    for(const k of ['pad','theme','perc','sting']){ const g=c.createGain(); g.gain.value=0; g.connect(this.bus); this.ch[k]=g; } this.ch.sting.gain.value=.7;
    this.apply(MUS.mood,true); },

  /* ---------- voices ---------- */
  voice(name,o){ const r=SMP.play(name,Object.assign({loop:true},o)); if(!r) return null; const t=AU.c.currentTime; r.g.gain.cancelScheduledValues(t);
    const v=o.v==null?1:o.v; r.g.gain.setValueAtTime(0,t+(o.delay||0)); r.g.gain.linearRampToValueAtTime(v,t+(o.delay||0)+(o.fade||2.5)); r.name=name; r.t0=t+(o.delay||0); r.rate=o.rate||1; return r; },
  kill(list,fade){ const t=AU.c.currentTime; for(const r of list.splice(0)){ try{ r.g.gain.cancelScheduledValues(t); r.g.gain.setValueAtTime(r.g.gain.value,t); r.g.gain.linearRampToValueAtTime(0,t+(fade||2.5)); r.s.stop(t+(fade||2.5)+.05); }catch(_){ } } },
  startPads(){ const have=new Set(this.voices.pad.map(r=>r.name)); for(const [n,v,rate,filter] of this.set.pad){ if(have.has(n)||!SMP.has(n)) continue;
    const r=this.voice(n,{v,rate:rate||1,filter,dest:this.ch.pad,fade:4,off:Math.random()*Math.max(0,SMP.buf[n].duration-1)}); if(r) this.voices.pad.push(r); } },
  /* the drum's bar grid, so a theme can start on its downbeat */
  nextBar(){ const p=this.voices.perc[0]; if(!p) return 0; const bpm=(this.BPM[p.name]||90)*p.rate, bar=240/bpm, t=AU.c.currentTime; const k=Math.ceil((t+.05-p.t0)/bar); return Math.max(0,p.t0+k*bar-t); },
  fitRate(themeBpm,percName){ const pb=this.BPM[percName]; if(!pb||!themeBpm) return 1; let best=1, bd=9; for(const m of [.5,2/3,.75,1,4/3,1.5,2]){ const r=themeBpm*m/pb; const d=Math.abs(Math.log(r)); if(r>.84&&r<1.19&&d<bd){ bd=d; best=r; } } return best; },
  startPerc(name,vol){ this.percName=name; this.percVol=vol; if(!name){ this.kill(this.voices.perc,1.5); return; }
    if(this.voices.perc.length&&this.voices.perc[0].name===name) return; this.kill(this.voices.perc,1.5); if(!SMP.has(name)){ this.fetch(name); return; }
    const th=this.voices.theme[0]; const tb=th?this.BPM[th.name]*th.rate:this.themeBpmHint; const rate=this.fitRate(tb,name);
    let delay=0; if(th&&this.BPM[th.name]){ const bar=240/(this.BPM[th.name]*th.rate), t=AU.c.currentTime; delay=Math.max(0,th.t0+Math.ceil((t+.05-th.t0)/bar)*bar-t); }
    const r=this.voice(name,{v:vol,rate,dest:this.ch.perc,fade:delay?.05:1.2,delay}); if(r) this.voices.perc.push(r); },
  queueTheme(wait){ clearTimeout(this.themeT); this.themeT=setTimeout(()=>{ this.themeT=null; this.playTheme(); },wait*1000); },
  playTheme(){ if(!this.on||!this.set) return; const list=this.themeList(); if(!list.length) return;
    let pickT=list.filter(t=>(typeof t==='string'?t:t[0])!==this.lastTheme); if(!pickT.length) pickT=list; const ent=pick(pickT);
    const [n,rate,v]=typeof ent==='string'?[ent,1,1]:[ent[0],ent[1]||1,ent[2]==null?1:ent[2]]; if(!SMP.has(n)){ this.fetch(n); this.queueTheme(2); return; }
    this.lastTheme=n; const delay=this.nextBar(); const r=this.voice(n,{v,rate,dest:this.ch.theme,fade:delay?.08:1.5,delay}); if(!r) return; this.voices.theme.push(r);
    const len=SMP.buf[n].duration/rate; const fight=this.mood==='boss';
    /* explore: one to three passes (about 25-60 s), then a silence; fights: keep going */
    const reps=fight?99:Math.max(1,Math.round(clamp(rnd(26,58)/len,1,4))); const end=delay+len*reps;
    if(!fight){ clearTimeout(this.endT); this.endT=setTimeout(()=>{ if(this.voices.theme.includes(r)){ this.kill(this.voices.theme,2.5); const g=this.set.gap||[10,18]; this.queueTheme(rnd(g[0],g[1])); } },(end-1.2)*1000); } },
  themeList(){ if(this.mood==='boss'&&this.bossKit) return [this.bossKit.theme]; return this.set.theme; },

  /* ---------- mood and level ---------- */
  apply(mood,now){ this.mood=mood; if(!this.on) return; const def=(typeof L!=='undefined'&&L)?L.def:null; const key=this.keyFor(def,mood);
    if(key!==this.key){ this.switchSet(key,def); }
    const M=this.MOOD[mood]||this.MOOD.deep, t=AU.c.currentTime, k=now?.15:1.4;
    for(const c of ['pad','theme','perc']) this.ch[c].gain.setTargetAtTime(this.set?M[c]:0,t,k);
    if(!this.set) return;
    /* drums follow the fight */
    const arena=mood==='boss', kit=def&&mood==='boss'?this.bossFor(def):null, wasKit=this.bossKit; this.bossKit=kit;
    if(kit){ if(kit!==wasKit){ this.kill(this.voices.theme,1.2); clearTimeout(this.endT); clearTimeout(this.themeT); this.themeT=null; const th=kit.theme; this.themeBpmHint=(this.BPM[typeof th==='string'?th:th[0]]||0)*(typeof th==='string'?1:th[1]||1);
        this.startPerc(kit.perc,.95); this.queueTheme(.2); this.sting(kit.sting||(this.set.sting||[])[0],.9); } else this.startPerc(kit.perc,.95); }
    else if(arena&&this.set.arena){ this.startPerc(this.set.arena,.85); this.sting((this.set.sting||[])[0],.6); }
    else if(mood==='lair'&&this.set.arena){ this.startPerc(null); }
    else if(this.set.idle&&(mood==='surface'||mood==='deep')) this.startPerc(this.set.idle[0],this.set.idle[1]);
    else if(mood!=='boss') this.startPerc(null);
    if(wasKit&&!kit){ this.kill(this.voices.theme,2); this.queueTheme(rnd(4,8)); }
    if(!this.voices.theme.length&&!this.themeT&&mood!=='silent') this.queueTheme(mood==='title'?1:rnd(2,5)); },
  switchSet(key,def){ this.key=key; this.set=key?this.SETS[key]:null; this.bossKit=null; clearTimeout(this.themeT); clearTimeout(this.endT); this.themeT=null;
    this.kill(this.voices.pad,3.5); this.kill(this.voices.theme,2.5); this.kill(this.voices.perc,2); this.percName=null;
    if(!this.set) return; const th=this.set.theme[0]; this.themeBpmHint=th?this.BPM[typeof th==='string'?th:th[0]]:0;
    for(const n of this.filesFor(key,def)) this.fetch(n); this.startPads(); this.prefetchNext(); },
  prefetchNext(){ if(typeof lvlIdx==='undefined'||!LEVELS) return; const nx=LEVELS[lvlIdx+1]; const k=nx&&this.keyFor(nx,'deep'); if(k) setTimeout(()=>{ for(const n of this.filesFor(k,nx)) this.fetch(n); },6000); },
  sting(n,v){ if(!n||!SMP.has(n)||!this.on) return; const t=AU.c.currentTime; if(this.lastSting&&t-this.lastSting<6) return; this.lastSting=t; SMP.play(n,{v:v||.6,dest:this.ch.sting}); },
  /* now and then, in the quiet: a horn on the walls, a bell in the city */
  wander(){ if(this.on&&this.set&&this.set.sting&&(this.mood==='surface'||this.mood==='deep')&&Math.random()<.5) this.sting(pick(this.set.sting),.45); setTimeout(()=>this.wander(),rnd(45,90)*1000); }
};

/* the synth bows out where a recorded set plays: choir down, its drums off (the recorded drums take over) */
(function(){ const o=MUS.setMood.bind(MUS); MUS.setMood=function(m,now){ o(m,now); if(!this.on) return; MX.init(); MX.apply(m,now);
  const set=MX.set; if(!set) return; const D=Object.assign({choir:.3,high:.35,throat:.25,drums:0,war:0,frenzy:set.synthPerc?1:0},set.duck||{});
  const M=this.MOODS[m]||this.MOODS.deep, t=AU.c.currentTime; for(const k in this.layers) this.layers[k].gain.setTargetAtTime((M[k]||0)*(D[k]==null?1:D[k]),t,now?.1:1.6); }; })();
(function(){ const o=MUS.start.bind(MUS); MUS.start=function(){ const was=this.on; o(); if(!was&&this.on){ MX.init(); MUS.setMood(MUS.mood,true); setTimeout(()=>MX.wander(),30000); } }; })();
/* phase three: a hit, and the drums come up */
(function(){ const o=bossPhase3; bossPhase3=function(e){ o(e); if(MX.on){ const k=MX.bossKit; MX.lastSting=0; MX.sting((k&&k.sting)||'mx_bridge_braaam',.85); MX.ch.perc.gain.setTargetAtTime(1.25,AU.c.currentTime,.4); } }; })();
