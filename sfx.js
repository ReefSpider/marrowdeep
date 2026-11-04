'use strict';
/* ===== sfx: recorded sounds (audio/*.ogg) layered over the synth.
   Round-robin with pitch jitter so repeated hits never sound the same,
   ambience beds per environment, and loops handed to the music layers. ===== */
const SMP={buf:{},last:{},loading:false,
  FILES:['sword_hit_01','sword_hit_02','sword_hit_heavy','sword_blade_scrape','gore_big_smash','gore_blood_hit','gore_flesh_rip',
    'blade_friction','blade_slice','blade_shwing','bell_drone','bell_dissonant','choir_male_low_ah_A','choir_medieval_unison',
    'throat_sustain_C','throat_open_E','throat_whirlwind_C','drums_rhythm_120','drums_rhythm_144','drums_rhythm_154',
    'amb_cave_drips_01','amb_cave_drips_02','amb_sunken_vessel'],
  load(){ if(this.loading||!AU.c) return; this.loading=true;
    for(const n of this.FILES) fetch('audio/'+n+'.ogg').then(r=>r.ok?r.arrayBuffer():Promise.reject(r.status))
      .then(a=>new Promise((ok,no)=>AU.c.decodeAudioData(a,ok,no))).then(b=>{ this.buf[n]=b; AMB.ready(n); if(typeof MUS!=='undefined') MUS.sampleReady(n); })
      .catch(()=>{}); },
  has(n){ return !!this.buf[n]; },
  // o: v gain, rate, jit (random pitch ±), wet (reverb send), dest (node), delay, loop, filter {type,f}
  play(n,o){ o=o||{}; const b=this.buf[n]; if(!b||!AU.c) return null; const c=AU.c, t=c.currentTime+(o.delay||0);
    const s=c.createBufferSource(); s.buffer=b; s.loop=!!o.loop; s.playbackRate.value=(o.rate||1)*(o.jit?1+(Math.random()*2-1)*o.jit:1);
    const g=c.createGain(); g.gain.value=o.v==null?1:o.v; let head=s;
    if(o.filter){ const f=c.createBiquadFilter(); f.type=o.filter.type; f.frequency.value=o.filter.f; s.connect(f); head=f; }
    head.connect(g); if(o.dest) g.connect(o.dest); else AU.out(g,o.wet==null?.15:o.wet);
    s.start(t,o.off||0); return {s,g}; },
  // round robin: never the same file twice in a row
  rr(list,o){ const ok=list.filter(n=>this.buf[n]); if(!ok.length) return null; const k=list.join('|'); let n=pick(ok);
    if(ok.length>1&&n===this.last[k]) n=ok[(ok.indexOf(n)+1)%ok.length]; this.last[k]=n; return this.play(n,o); }
};

/* ---------- ambience beds per environment ---------- */
const AMB={cur:null,nodes:[],bus:null,mood:'title',
  BEDS:{bone:[['amb_cave_drips_01',.55]],
    water:[['amb_sunken_vessel',.5],['amb_cave_drips_02',.28]],
    debt:[['amb_cave_drips_02',.45]],
    fire:[['amb_sunken_vessel',.42,.72,{type:'lowpass',f:900}]],
    ash:[['amb_cave_drips_01',.22,.86,{type:'highpass',f:500}],['amb_sunken_vessel',.2,.9,{type:'lowpass',f:600}]],
    war:[]},
  LVL:{title:0,cut:.45,silent:.15,boss:.35,lair:.6,deep:1,surface:1,calm:.8},
  ensureBus(){ if(this.bus||!AU.c) return; this.bus=AU.c.createGain(); this.bus.gain.value=0; this.bus.connect(AU.m); },
  envNow(){ return (typeof L!=='undefined'&&L&&L.env)?(L.surface?'war':L.env):null; },
  set(mood){ this.mood=mood; if(!AU.c) return; this.ensureBus(); const env=mood==='title'?null:this.envNow(), t=AU.c.currentTime;
    this.bus.gain.setTargetAtTime((this.LVL[mood]==null?1:this.LVL[mood])*.9,t,1.2);
    if(env===this.cur) return; this.cur=env;
    for(const nd of this.nodes){ nd.g.gain.setTargetAtTime(0,t,.8); nd.s.stop(t+4); } this.nodes=[];
    for(const [n,v,rate,filter] of (this.BEDS[env]||[])){ const nd=SMP.play(n,{v:0,loop:true,rate:rate||1,filter,dest:this.bus,off:Math.random()*8}); if(nd){ nd.g.gain.setTargetAtTime(v,t,1.5); this.nodes.push(nd); } } },
  ready(n){ if(this.cur!=null&&(this.BEDS[this.cur]||[]).some(b=>b[0]===n)){ const m=this.mood; this.cur=undefined; this.set(m); } }
};

/* ---------- layer recorded hits over the synthesized ones ---------- */
(function(){
  const wrap=(name,fn,keepSynth)=>{ const orig=AU[name]; AU[name]=function(...a){ const used=AU.c&&fn.apply(AU,a); if(keepSynth||!used) orig.apply(AU,a); }; };
  const initOrig=AU.init; AU.init=function(){ initOrig.apply(AU,arguments); SMP.load(); AMB.set(AMB.mood); };
  wrap('hit',c=>{ const a=SMP.rr(['sword_hit_01','sword_hit_02'],{v:c?.5:.42,jit:.08,wet:.12});
    if(c){ SMP.play('sword_hit_heavy',{v:.55,jit:.05,wet:.2}); SMP.rr(['gore_blood_hit','gore_flesh_rip'],{v:.32,jit:.1}); } return !!a; },true);
  wrap('kill',()=>!!SMP.rr(['gore_flesh_rip','gore_blood_hit'],{v:.45,jit:.12,wet:.2}),true);
  wrap('clang',()=>!!SMP.play('sword_blade_scrape',{v:.55,jit:.1,wet:.25}),true);
  wrap('swing',h=>!!(h?SMP.play('blade_slice',{v:.32,jit:.1,wet:.15}):SMP.play('blade_friction',{v:.2,jit:.15,wet:.1})),true);
  wrap('spin',()=>!!SMP.play('blade_friction',{v:.25,rate:.8,jit:.1,wet:.2}),true);
  wrap('ting',()=>!!SMP.play('blade_shwing',{v:.42,jit:.04,wet:.35}),true);
  wrap('bell',()=>!!SMP.play('bell_drone',{v:.6,rate:.98+Math.random()*.04,wet:.45}));      // recorded bell replaces the synth bell
  AU.gore=function(){ SMP.play('gore_big_smash',{v:.55,jit:.06,wet:.3}); };                // brutes, uniques, executions, nests
  AU.toll=function(){ SMP.play('bell_dissonant',{v:.55,wet:.5}); };                        // boss broken (崩し)
})();
