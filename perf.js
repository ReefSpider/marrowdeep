'use strict';
/* ===== perf (v23): keep big fights smooth =====
   Profiled a pierce volley through 70 foes: 95% of the frame went on building Web Audio nodes (every hit started
   its own oscillators, filters and samples, dozens per frame). Sounds of the same kind now share a small budget per
   moment, so twenty hits in one frame sound like a few hits and cost a few voices. Particles stop being pushed once
   the pool is full instead of shifting the whole array on every push. */

/* ---------- sound budget ---------- */
(function(){
  const WIN=70; /* ms */
  const CAP={hit:2,kill:2,gore:1,clang:2,boom:2,slam:2,hurt:2,swing:3,spin:2,chain:2,tick:1,coin:3,ting:2,land:2,growl:2,shriek:2,roar:2};
  const seen={};
  const ok=(k,cap)=>{ const n=performance.now(), s=seen[k]||(seen[k]={t:0,n:0}); if(n-s.t>WIN){ s.t=n; s.n=0; } if(s.n>=cap) return false; s.n++; return true; };
  for(const k in CAP){ const o=AU[k]; if(typeof o!=='function') continue; AU[k]=function(){ if(!ok(k,CAP[k])) return; return o.apply(this,arguments); }; }
  /* a ceiling on every new synth voice, so nothing can flood the audio thread */
  for(const k of ['tone','noise']){ const o=AU[k]; AU[k]=function(){ if(!ok('_voice',36)) return; return o.apply(this,arguments); }; }
  if(typeof SMP!=='undefined'){ const o=SMP.play; SMP.play=function(n,opt){ if(!(opt&&opt.loop)&&!ok('_smp',10)) return null; return o.call(this,n,opt); }; }
})();

/* ---------- particles: drop the newest when the pool is full, trim once a frame ---------- */
part=function(o){ if(parts.length>=900&&o.type!=='num') return; parts.push(Object.assign({vx:0,vy:0,g:0,life:1,max:1,size:1,em:false,type:'p',col:'#fff'},o)); };
(function(){ const o=updParts; updParts=function(dt){ o(dt); if(parts.length>900) parts.splice(0,parts.length-900); }; })();
