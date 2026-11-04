'use strict';
/* ===== music: synthesized voices. A low choir shaped by vowel formants, a throat-sung drone,
   a lone high voice for bosses, and war drums. Everything is mixed by mood. ===== */
const MUS={on:false,mood:'title',bar:0,
  VOW:{a:[730,1090],o:[570,840],u:[300,870],e:[530,1840],m:[250,700]},
  CHORDS:[[38,45,50,53],[34,41,46,50],[36,43,48,52],[33,40,45,49],[38,45,50,57],[31,38,43,46]],
  // the throat voice is kept for boss fights only
  MOODS:{title:{choir:.55,throat:0,high:.06,drums:0,war:0,frenzy:0},surface:{choir:.34,throat:0,high:0,drums:0,war:.7,frenzy:0},deep:{choir:.46,throat:0,high:.07,drums:0,war:0,frenzy:0},
    lair:{choir:.5,throat:0,high:.12,drums:.42,war:0,frenzy:0},
    boss:{choir:.62,throat:.6,high:.38,drums:.25,war:0,frenzy:.9},cut:{choir:.75,throat:0,high:.28,drums:0,war:0,frenzy:0},calm:{choir:.32,throat:0,high:.12,drums:0,war:0,frenzy:0},silent:{choir:.06,throat:0,high:0,drums:0,war:0,frenzy:0}},
  // recorded loops: the throat drone is retuned from C to D, drums are one loop per layer
  LOOPS:{throat_sustain_C:['throat',.62,1.1225],drums_rhythm_120:['war',.75,1],drums_rhythm_144:['drums',.8,1],drums_rhythm_154:['frenzy',.85,1]},
  sampleReady(n){ if(!this.on){ return; } const L_=this.LOOPS[n]; if(!L_) return; const [layer,v,rate]=L_;
    SMP.play(n,{loop:true,v,rate,dest:this.layers[layer]});
    if(layer==='throat'&&this.tgn) this.tgn.gain.setTargetAtTime(.8,AU.c.currentTime,2);
    if(layer!=='throat') this.smpDrums=true; },
  start(){ if(this.on||!AU.c) return; this.on=true; const c=AU.c; const out=this.out=c.createGain(); out.gain.value=.9; out.connect(AU.mm); const wet=c.createGain(); wet.gain.value=.7; const mrv=c.createConvolver(); mrv.buffer=AU.rv.buffer; out.connect(wet); wet.connect(mrv); mrv.connect(AU.mm);
    const comp=c.createDynamicsCompressor(); comp.threshold.value=-18; comp.ratio.value=3; comp.connect(out); this.bus=comp;
    this.layers={}; for(const k of ['choir','throat','high','drums','war','frenzy']){ const g=c.createGain(); g.gain.value=0; g.connect(comp); this.layers[k]=g; }
    // choir: four voices, each two detuned saws through two formant band-passes
    this.voices=[]; for(let i=0;i<4;i++){ const vg=c.createGain(); vg.gain.value=.0; vg.connect(this.layers.choir);
      const f1=c.createBiquadFilter(), f2=c.createBiquadFilter(); [f1,f2].forEach(f=>{ f.type='bandpass'; f.Q.value=9; f.connect(vg); }); f1.frequency.value=730; f2.frequency.value=1090;
      const g2=c.createGain(); g2.gain.value=.55; f2.disconnect(); f2.connect(g2); g2.connect(vg);
      const oscs=[]; for(const det of [-7,6]){ const o=c.createOscillator(); o.type='sawtooth'; o.detune.value=det; o.connect(f1); o.connect(f2); o.start(); oscs.push(o); }
      const vib=c.createOscillator(); vib.frequency.value=4.6+i*.37; const vd=c.createGain(); vd.gain.value=5; vib.connect(vd); oscs.forEach(o=>vd.connect(o.detune)); vib.start();
      this.voices.push({vg,f1,f2,oscs}); }
    // throat drone: two low saws with a narrow sweeping formant ("hmmm-ohhh")
    const tf=c.createBiquadFilter(); tf.type='bandpass'; tf.Q.value=11; tf.frequency.value=320; const tg=c.createGain(); tg.gain.value=1.6; this.tgn=tg; tf.connect(tg); tg.connect(this.layers.throat);
    const tl=c.createBiquadFilter(); tl.type='lowpass'; tl.frequency.value=180; const tlg=c.createGain(); tlg.gain.value=.5; tl.connect(tlg); tlg.connect(this.layers.throat);
    this.throat=[]; for(const [f,d] of [[36.7,0],[36.7,9],[55,-4]]){ const o=c.createOscillator(); o.type='sawtooth'; o.frequency.value=f; o.detune.value=d; o.connect(tf); o.connect(tl); o.start(); this.throat.push(o); }
    const tlfo=c.createOscillator(); tlfo.frequency.value=.055; const tld=c.createGain(); tld.gain.value=140; tlfo.connect(tld); tld.connect(tf.frequency); tlfo.start(); this.tf=tf;
    // high voice: a single sung line, vowel "ah" to "ee"
    const hf1=c.createBiquadFilter(), hf2=c.createBiquadFilter(); hf1.type=hf2.type='bandpass'; hf1.Q.value=hf2.Q.value=7; hf1.frequency.value=800; hf2.frequency.value=2600; const hg=c.createGain(); hg.gain.value=.0; hf1.connect(hg); hf2.connect(hg); hg.connect(this.layers.high);
    const ho=c.createOscillator(); ho.type='sawtooth'; ho.frequency.value=587; ho.connect(hf1); ho.connect(hf2); ho.start(); const hv=c.createOscillator(); hv.frequency.value=5.4; const hvd=c.createGain(); hvd.gain.value=14; hv.connect(hvd); hvd.connect(ho.detune); hv.start(); this.high={o:ho,g:hg,f1:hf1,f2:hf2};
    this.setMood(this.mood,true); this.tick(); this.beat(); for(const n in this.LOOPS) if(SMP.has(n)) this.sampleReady(n); },
  midi(n){ return 440*Math.pow(2,(n-69)/12); },
  tick(){ if(!this.on) return; const c=AU.c, t=c.currentTime; const ch=this.CHORDS[this.bar%this.CHORDS.length]; this.bar++;
    const vow=pick(['a','o','u','m','a']); const [F1,F2]=this.VOW[vow];
    this.voices.forEach((v,i)=>{ const f=this.midi(ch[i]+12); v.oscs.forEach(o=>o.frequency.setTargetAtTime(f,t,1.4)); v.f1.frequency.setTargetAtTime(F1*(1+i*.03),t,2); v.f2.frequency.setTargetAtTime(F2*(1+i*.02),t,2);
      v.vg.gain.cancelScheduledValues(t); v.vg.gain.setTargetAtTime(.0,t,.01); v.vg.gain.setTargetAtTime(.22+i*.02,t+.05,1.8+i*.4); v.vg.gain.setTargetAtTime(.08,t+5.5,1.6); });
    this.throat[0].frequency.setTargetAtTime(this.midi(ch[0]-12),t,2); this.throat[1].frequency.setTargetAtTime(this.midi(ch[0]-12),t,2); this.throat[2].frequency.setTargetAtTime(this.midi(ch[1]-12),t,2);
    const hn=this.midi(ch[3]+24+(R()<.4?2:0)); this.high.o.frequency.setTargetAtTime(hn,t,.6); this.high.g.gain.setTargetAtTime(0,t,.02); this.high.g.gain.setTargetAtTime(.5,t+.3,1.2); this.high.g.gain.setTargetAtTime(.0,t+5,1.5);
    this.high.f1.frequency.setTargetAtTime(R()<.5?800:400,t,1.5);
    // recorded voices: a low male "ah" retuned to the chord root, throat swells, and the old unison choir in scenes
    let st=((ch[0]%12)-9+12)%12; if(st>6) st-=12;
    if(Math.random()<.5) SMP.play('choir_male_low_ah_A',{v:.5,rate:Math.pow(2,st/12),dest:this.layers.choir,delay:.4});
    if(this.mood==='boss'&&Math.random()<.35){ const e=Math.random()<.5; SMP.play(e?'throat_open_E':'throat_whirlwind_C',{v:.45,rate:Math.pow(2,(e?-2:2)/12),dest:this.layers.throat,delay:1.5}); }
    if((this.mood==='cut'||this.mood==='title')&&Math.random()<.4) SMP.play('choir_medieval_unison',{v:.42,dest:this.layers.choir,delay:2});
    setTimeout(()=>this.tick(),8000); },
  beat(){ if(!this.on) return; const L_=this.layers, c=AU.c; const t=c.currentTime; this.b=(this.b||0)+1;
    const drum=(f0,f1,v,dl,dest)=>{ const o=c.createOscillator(); o.type='sine'; o.frequency.setValueAtTime(f0,t+dl); o.frequency.exponentialRampToValueAtTime(f1,t+dl+.35); const g=c.createGain(); g.gain.setValueAtTime(.0001,t+dl); g.gain.exponentialRampToValueAtTime(v,t+dl+.01); g.gain.exponentialRampToValueAtTime(.0001,t+dl+.6); o.connect(g); g.connect(dest); o.start(t+dl); o.stop(t+dl+.7); };
    const b=this.b%8; if(!this.smpDrums){ drum(90,42,.9,0,L_.drums); if(b===3||b===7) drum(110,50,.6,.25,L_.drums); if(b%2===1) drum(70,38,.5,.5,L_.drums);
    if(b===0||b===4) drum(70,40,.9,0,L_.war); if(b===2||b===6){ drum(80,44,.6,0,L_.war); drum(80,44,.4,.18,L_.war); } }
    setTimeout(()=>this.beat(),this.mood==='boss'?520:760); },
  setMood(m,now){ this.mood=m; if(typeof AMB!=='undefined') AMB.set(m); if(!this.on) return; const M=this.MOODS[m]||this.MOODS.deep, t=AU.c.currentTime; for(const k in this.layers) this.layers[k].gain.setTargetAtTime(M[k]||0,t,now?.1:1.6); }
};
function moodFor(def){ if(!def) return 'title'; if(def.kind==='boss') return 'lair'; if(def.kind==='surface') return 'surface'; return 'deep'; }
