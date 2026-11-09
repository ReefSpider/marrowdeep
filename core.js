'use strict';
/* ===== core: utilities, seeded RNG, audio, renderer, sprite blitting, input ===== */
const W=(typeof window!=='undefined'&&window.MDW)||480,H=270,T=16, RES=2; /* v33: phones widen the view to their own shape (mobile-boot in index.html) */
const $=s=>document.querySelector(s);
let COOP=null; /* set while a co-op descent is running (net.js) */
let RNG=Math.random; const R=()=>RNG();
const rnd=(a,b)=>a+R()*(b-a), ri=(a,b)=>Math.floor(a+R()*(b-a+1)), pick=a=>a[Math.floor(R()*a.length)];
const clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t;
const approach=(v,t,d)=>v<t?Math.min(v+d,t):Math.max(v-d,t);
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const hex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const mixc=(a,b,t)=>{const A=hex(a),B=hex(b);return '#'+A.map((v,i)=>Math.round(lerp(v,B[i],t)).toString(16).padStart(2,'0')).join('');};
const wpick=ws=>{let s=0;for(const k in ws)s+=ws[k];let r=R()*s;for(const k in ws){r-=ws[k];if(r<=0)return k;}return Object.keys(ws)[0];};
const hsh=(a,b)=>{const s=Math.sin(a*127.1+b*311.7)*43758.5453;return s-Math.floor(s);};
function mulberry(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function withSeed(seed,fn){ const prev=RNG; RNG=mulberry(seed>>>0); try{ return fn(); } finally { RNG=prev; } }
const store={get(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}},del(k){try{localStorage.removeItem(k)}catch(e){}}};

/* ---------- audio (all synthesized) ---------- */
const SETTINGS=Object.assign({music:.75,sfx:1},store.get('marrowdeep.settings')||{});
const AU={c:null,tension:0,
  setVol(){ if(!this.c) return; this.m.gain.setTargetAtTime(.55*SETTINGS.sfx,this.c.currentTime,.1); this.mm.gain.setTargetAtTime(SETTINGS.music,this.c.currentTime,.1); store.set('marrowdeep.settings',SETTINGS); },
  init(){ if(this.c){this.c.resume&&this.c.resume();return;} const C=window.AudioContext||window.webkitAudioContext; if(!C) return; const c=new C(); this.c=c;
    this.m=c.createGain(); this.m.gain.value=.55*SETTINGS.sfx; this.m.connect(c.destination); this.mm=c.createGain(); this.mm.gain.value=SETTINGS.music; this.mm.connect(c.destination);
    const len=c.sampleRate*2.4, ir=c.createBuffer(2,len,c.sampleRate);
    for(let ch=0;ch<2;ch++){const d=ir.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3.2);}
    this.rv=c.createConvolver(); this.rv.buffer=ir; const rg=c.createGain(); rg.gain.value=.4; this.rv.connect(rg); rg.connect(this.m);
    const nb=c.createBuffer(1,c.sampleRate,c.sampleRate), nd=nb.getChannelData(0); for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1; this.nb=nb;
    this.drone(); if(typeof MUS!=='undefined') MUS.start(); },
  out(n,wet){n.connect(this.m); if(wet>0){const g=this.c.createGain();g.gain.value=wet;n.connect(g);g.connect(this.rv);}},
  env(g,t,a,dur,v){g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+dur);},
  noise(dur,f0,f1,q,v,type,wet){ if(!this.c) return; const c=this.c,t=c.currentTime; const s=c.createBufferSource(); s.buffer=this.nb; const f=c.createBiquadFilter(); f.type=type||'bandpass'; f.Q.value=q; f.frequency.setValueAtTime(f0,t); f.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur); const g=c.createGain(); this.env(g,t,.005,dur,v); s.connect(f); f.connect(g); this.out(g,wet==null?.2:wet); s.start(t,Math.random()*.5); s.stop(t+dur+.05); },
  tone(type,f0,f1,dur,v,wet,delay){ if(!this.c) return; const c=this.c,t=c.currentTime+(delay||0); const o=c.createOscillator(); o.type=type; o.frequency.setValueAtTime(f0,t); o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur); const g=c.createGain(); this.env(g,t,.005,dur,v); o.connect(g); this.out(g,wet==null?.2:wet); o.start(t); o.stop(t+dur+.05); },
  drone(){ const c=this.c; const f=c.createBiquadFilter(); f.type='lowpass'; f.frequency.value=260; f.Q.value=4; const g=c.createGain(); g.gain.value=.045; this.df=f; this.dg=g;
    [55,55.35,82.6].forEach((fr,i)=>{const o=c.createOscillator(); o.type=i<2?'sawtooth':'sine'; o.frequency.value=fr; o.connect(f); o.start();});
    const lfo=c.createOscillator(); lfo.frequency.value=.07; const lg=c.createGain(); lg.gain.value=140; lfo.connect(lg); lg.connect(f.frequency); lfo.start();
    f.connect(g); this.out(g,.5);
    setInterval(()=>{ if(Math.random()<.5) this.tone('sine',1400+Math.random()*800,800,.18,.05,.9); },2600);
    setInterval(()=>{ if(this.tension>.5){ this.tone('sine',55,40,.25,.35*this.tension,.3); this.tone('sine',55,40,.22,.25*this.tension,.3,.28); } },1100); },
  setTension(v){ this.tension=v; if(!this.c) return; const t=this.c.currentTime; this.dg.gain.setTargetAtTime(.045+v*.05,t,.8); this.df.frequency.setTargetAtTime(260+v*380,t,.8); },
  swing(h){this.noise(h?.26:.15,h?2400:3600,h?260:500,1.1,h?.5:.32,'bandpass',.15);},
  hit(c){this.tone('sine',c?170:140,38,.2,.75,.1);this.noise(.09,c?2600:1800,500,.7,.45,'bandpass',.12); if(c) this.tone('square',90,30,.25,.18,.3);},
  clang(){this.tone('square',1900,1700,.12,.1,.4);this.tone('triangle',2600,2400,.2,.08,.5);this.noise(.06,5000,3000,3,.2,'bandpass',.2);},
  kill(){this.tone('sine',110,28,.45,.8,.35);this.noise(.3,900,90,.6,.5,'lowpass',.4);},
  hurt(){this.noise(.22,700,180,1.5,.55,'bandpass',.2);this.tone('triangle',180,70,.2,.3,.1);},
  jump(){this.noise(.08,900,1800,1,.12,'bandpass',.05);},
  land(){this.noise(.07,500,120,1,.16,'lowpass',.05);},
  dash(){this.noise(.22,400,3000,.8,.28,'bandpass',.2);},
  coin(){this.tone('square',1320,1320,.06,.05,.3);this.tone('square',1760,1760,.12,.05,.3,.05);},
  tick(){ const n=performance.now(); if(n-(this._tk||0)<60) return; this._tk=n; this.tone('triangle',1500,1250,.03,.05,.04);},
  chest(){this.noise(.4,180,900,2,.35,'bandpass',.4);this.tone('sine',220,110,.5,.2,.5);},
  slam(){this.tone('sine',80,25,.6,.9,.4);this.noise(.4,600,60,.5,.6,'lowpass',.4);},
  growl(){this.noise(.6,240,120,6,.35,'bandpass',.4);},
  shriek(){this.tone('sawtooth',900,1600,.35,.08,.6);this.tone('sawtooth',930,1500,.35,.06,.6);},
  drink(){for(let i=0;i<3;i++)this.tone('sine',300+i*60,200,.08,.1,.2,i*.09);},
  door(){this.tone('sine',60,30,1.4,.6,.8);this.noise(1.2,300,80,.7,.3,'lowpass',.8);},
  reveal(r){ const base=[196,247,294,262,220,147][r]; const ch=[[1],[1,1.5],[1,1.26,1.5],[1,1.26,1.5,2],[1,1.19,1.5,1.78,2],[1,1.19,1.5,1.78,2,2.38]][r];
    ch.forEach((m,i)=>this.tone(r>=3?'triangle':'sine',base*m,base*m,1.6+r*.4,.12+r*.03,.6,i*.06));
    if(r>=3){this.tone('sine',base/2,base/2,2.6,.25,.8);} if(r>=4){this.tone('sawtooth',base/4,base/4,2.4,.06,.9);} if(r===5){this.tone('sine',base/4,base/4,4,.4,.9);this.noise(2.5,200,2000,1,.2,'bandpass',.9);} },
  lock(){this.tone('triangle',520,780,.07,.12,.15);this.noise(.03,3000,2000,2,.08,'bandpass',0);},
  perfect(){[1,1.25,1.5,2].forEach((m,i)=>this.tone('sine',660*m,660*m,.6,.1,.5,i*.045));},
  tease(){this.tone('sawtooth',73,70,1.3,.07,.8);this.tone('sine',36.7,36.7,1.5,.3,.8);this.tone('triangle',587,580,.9,.05,.9,.1);},
  spin(){this.noise(.3,1200,4200,1.2,.3,'bandpass',.2);},
  abyssStat(){this.tone('sine',55,30,1.6,.7,.8);this.tone('sawtooth',880,1400,.5,.07,.8);this.tone('sawtooth',905,1350,.5,.05,.8);this.noise(1,150,1800,1,.25,'bandpass',.8);},
  pickup(){this.tone('square',220,180,.08,.12,.4);this.noise(.35,3500,600,3,.25,'bandpass',.6);this.tone('sine',440,438,1.2,.08,.8,.05);},
  roar(){this.noise(1.6,140,60,3,.7,'bandpass',.8);this.tone('sawtooth',70,40,1.8,.16,.8);this.tone('sawtooth',73,38,1.8,.12,.8);this.tone('sine',35,25,2,.5,.8);},
  bell(){[1,2.4,3.9,5.2].forEach((m,i)=>this.tone('sine',110*m,110*m*.995,3.5-i*.6,.24/(i+1),.9));},
  thunder(){this.noise(2.5,400,40,.5,.5,'lowpass',.9);},
  boom(v){this.tone('sine',60,25,1.2,.35*(v||1),.9);this.noise(.8,300,50,.6,.3*(v||1),'lowpass',.9);},
  chain(){for(let i=0;i<4;i++)this.tone('square',1800+Math.random()*600,1500,.04,.04,.3,i*.05);},
  cast(){this.noise(.35,300,2400,2,.35,'bandpass',.4);this.tone('sawtooth',220,110,.3,.08,.4);},
  lvl(){[1,1.25,1.5,2,2.5].forEach((m,i)=>this.tone('triangle',330*m,330*m,1,.11,.6,i*.08));},
  scream(){this.tone('sawtooth',600,1400,.8,.08,.8);this.tone('sawtooth',620,1300,.8,.06,.8);this.noise(.8,2000,900,2,.15,'bandpass',.8);},
  slow(){this.tone('sine',900,200,.9,.15,.9);this.noise(.8,3000,300,1,.15,'bandpass',.8);},
  ting(){this.tone('sine',2600,2600,.6,.08,.7);this.tone('sine',3900,3900,.4,.04,.7);},
  wind(){this.noise(2.2,300,900,.8,.12,'bandpass',.7);}
};

/* ---------- rendering surfaces + post shader ---------- */
const stage=$('#stage');
const cv=document.createElement('canvas'); cv.width=W*RES; cv.height=H*RES; const ctx=cv.getContext('2d'); ctx.imageSmoothingEnabled=false;
const ev=document.createElement('canvas'); ev.width=W*RES; ev.height=H*RES; const ectx=ev.getContext('2d'); ectx.imageSmoothingEnabled=false;
function mkScr(n){ const mk=()=>{const c=document.createElement('canvas'); c.width=c.height=n*RES; return c;}; const s=mk(),l=mk(),r=mk(); return {n,ox:n/2,oy:Math.round(n*.75),s,sc:s.getContext('2d'),l,lc:l.getContext('2d'),r,rc:r.getContext('2d')}; }
const SCRS=mkScr(128), SCRB=mkScr(320);

const renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,window.MOBILE?1.5:2)); /* the art is 2× of 480 wide: 1.5× of a phone's width already covers it */
stage.insertBefore(renderer.domElement,stage.firstChild);
const mkTex=(c,filt)=>{const t=new THREE.CanvasTexture(c);t.magFilter=filt;t.minFilter=filt;t.generateMipmaps=false;return t;};
const tBase=mkTex(cv,THREE.NearestFilter), tEmis=mkTex(ev,THREE.LinearFilter);
const LMAX=32; const uL=[],uC=[]; for(let i=0;i<LMAX;i++){uL.push(new THREE.Vector4());uC.push(new THREE.Vector3());}
const U={tBase:{value:tBase},tEmis:{value:tEmis},uTime:{value:0},uImpact:{value:0},uHurt:{value:0},uLow:{value:0},uFade:{value:1},uSlow:{value:0},uRed:{value:0},uWhite:{value:0},uAlt:{value:0},uL:{value:uL},uC:{value:uC},uN:{value:0},uAmb:{value:new THREE.Vector3(.4,.37,.42)}};
const FRAG=`precision highp float;
varying vec2 vUv;
uniform sampler2D tBase; uniform sampler2D tEmis;
uniform float uTime,uImpact,uHurt,uLow,uFade,uSlow,uRed,uWhite,uAlt;
uniform vec4 uL[${LMAX}]; uniform vec3 uC[${LMAX}]; uniform int uN; uniform vec3 uAmb;
float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){
  vec2 uv=vUv+vec2(sin(uTime*1.3)*.0004,sin(uTime*2.1+1.7)*.0006);
  vec2 c=uv-.5; float d=dot(c,c);
  float ca=.0012+d*.008+uSlow*.004;
  vec3 base=vec3(texture2D(tBase,uv+c*ca).r,texture2D(tBase,uv).g,texture2D(tBase,uv-c*ca).b);
  vec2 px=vec2(uv.x*${W}.,(1.-uv.y)*${H}.);
  vec3 lt=uAmb*1.2+vec3(.04);
  for(int i=0;i<${LMAX};i++){ if(i>=uN) break; vec4 L=uL[i]; float a=clamp(1.-distance(px,L.xy)/L.z,0.,1.); lt+=uC[i]*(a*a*L.w); }
  vec3 band=floor(lt*5.)/5.; lt=mix(lt,band+.07,.45);
  vec3 col=base*lt;
  vec2 tx=vec2(1./${W}.,1./${H}.);
  vec3 em=texture2D(tEmis,uv).rgb;
  vec3 bl=vec3(0.);
  for(int i=0;i<10;i++){ float a=float(i)*.6283; vec2 o=vec2(cos(a),sin(a)); bl+=texture2D(tEmis,uv+o*tx*2.5).rgb; bl+=texture2D(tEmis,uv+o*tx*6.).rgb*.7; bl+=texture2D(tEmis,uv+o*tx*12.).rgb*.4; }
  bl/=21.;
  col+=em+bl*1.35;
  float l=dot(col,vec3(.299,.587,.114));
  col=mix(vec3(l),col,.9-uLow*.45);
  col*=vec3(1.04,.98,.9);
  col=mix(col,col*col*1.6,.22);
  col+=vec3(.025,.014,.02)*(1.-l);
  col=mix(col,vec3(l)*vec3(.8,.95,1.2)+em*.6,uSlow*.75);
  col=mix(col,col*vec3(1.4,.5,.45)+vec3(.04,0.,0.),uRed*.6);
  if(uImpact>0.){ float m=step(.2,l); vec3 imp=mix(vec3(.93,.9,.82),vec3(.06,.02,.03),m); imp=mix(imp,vec3(.78,.06,.05),step(.3,em.r-em.g)); col=mix(col,imp,uImpact); }
  col=mix(col,vec3(.45,.02,.02),clamp(uHurt*(d*3.+.1),0.,.8));
  col=mix(col,vec3(.3,0.,0.),clamp(uLow*d*2.*(.6+.4*sin(uTime*7.)),0.,.6));
  col=mix(col,vec3(l)*vec3(.8,.93,1.16)+em*.45,uAlt*.38); col+=vec3(.0,.015,.05)*(1.-l)*uAlt;
  col*=1.-d*.75;
  col*=.965+.035*sin(gl_FragCoord.y*3.14159);
  col+=(hash(gl_FragCoord.xy*.5+fract(uTime*7.)*91.)-.5)*.04;
  float fr=floor(uTime*18.);
  col=mix(col,vec3(1.,.97,.92),uWhite);
  gl_FragColor=vec4(max(col,0.)*uFade,1.);
}`;
const mat=new THREE.ShaderMaterial({uniforms:U,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:FRAG,depthTest:false,depthWrite:false});
const scene=new THREE.Scene(); scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),mat));
const camera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
let SCALE=2;
function fit(){ const cs=getComputedStyle(document.body); const aw=document.body.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight); const ah=document.body.clientHeight;
  let s=Math.min(aw/W,ah/H); if(!window.MOBILE&&s>=2&&Math.floor(s)/s>.86) s=Math.floor(s); s=Math.max(window.MOBILE?.2:.5,s);
  const sw=Math.floor(W*s), sh=Math.floor(H*s); stage.style.width=sw+'px'; stage.style.height=sh+'px';
  /* --u is 1% of a 16:9 stage of this height, so screens laid out for 16:9 keep their proportions on a wider phone */
  stage.style.setProperty('--u',(Math.min(sw,sh*16/9*(window.MOBILE?window.MUI||1.18:1))/100)+'px');
  renderer.setSize(sw,sh,false); SCALE=sw/W; }
addEventListener('resize',fit);

/* ---------- shared world/time state ---------- */
let time=0, freeze=0, impactT=0, shakeV=0, hurtV=0, timeScale=1, camZ=1, camZT=1, camPX=W/2, camPY=H/2;
const cam={x:0,y:0}, camR={x:0,y:0};
const lights=[];
function addLight(wx,wy,r,i,cr,cg,cb){ if(lights.length>=LMAX) return; const sx=(wx-camR.x-camPX)*camZ+camPX, sy=(wy-camR.y-camPY)*camZ+camPY; r*=camZ; if(sx<-r||sx>W+r||sy<-r||sy>H+r) return; lights.push([sx,sy,r,i,cr,cg,cb]); }
function beginFrame(){ const z=camZ, tx=(camPX-camPX*z)*RES, ty=(camPY-camPY*z)*RES; ctx.setTransform(1,0,0,1,0,0); ctx.fillStyle='#000'; ctx.fillRect(0,0,W*RES,H*RES); ctx.setTransform(RES*z,0,0,RES*z,tx,ty); ectx.setTransform(1,0,0,1,0,0); ectx.clearRect(0,0,W*RES,H*RES); ectx.setTransform(RES*z,0,0,RES*z,tx,ty); ctx.imageSmoothingEnabled=false; ectx.imageSmoothingEnabled=false; }
function shake(v){ shakeV=Math.max(shakeV,RM?v*.3:v); }
const rect=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};

/* ---------- sprite blit with ink outline, flash, emissive rim ---------- */
function blit(fn,wx,wy,face,o){ o=o||{}; const S=o.big?SCRB:SCRS, N=S.n, D=N*RES, sc=S.sc, slc=S.lc, rmc=S.rc;
  const x=Math.round((wx-camR.x)*RES)/RES-S.ox, y=Math.round((wy-camR.y)*RES)/RES-S.oy;
  if(x>W+40||x+N<-40||y>H+40||y+N<-40) return;
  sc.setTransform(RES,0,0,RES,0,0); sc.clearRect(0,0,N,N); sc.globalAlpha=1; sc.save(); sc.translate(S.ox,S.oy); if(face<0) sc.scale(-1,1); if(o.rot) sc.rotate(o.rot); if(o.sx||o.sy) sc.scale(o.sx||1,o.sy||1); fn(sc); sc.restore();
  slc.globalCompositeOperation='source-over'; slc.clearRect(0,0,D,D); slc.drawImage(S.s,0,0); slc.globalCompositeOperation='source-in'; slc.fillStyle=o.outline||'#0b0708'; slc.fillRect(0,0,D,D); slc.globalCompositeOperation='source-over';
  ctx.globalAlpha=o.alpha==null?1:o.alpha; const ow=o.thin?.5:1;
  if(!o.noOutline){ ctx.drawImage(S.l,x-ow,y,N,N); ctx.drawImage(S.l,x+ow,y,N,N); ctx.drawImage(S.l,x,y-ow,N,N); ctx.drawImage(S.l,x,y+ow,N,N); }
  ctx.drawImage(S.s,x,y,N,N);
  if(o.rim){ slc.globalCompositeOperation='source-in'; slc.fillStyle=o.rim; slc.fillRect(0,0,D,D); slc.globalCompositeOperation='source-over';
    rmc.globalCompositeOperation='source-over'; rmc.clearRect(0,0,D,D); rmc.drawImage(S.l,-RES,0); rmc.drawImage(S.l,RES,0); rmc.drawImage(S.l,0,-RES); rmc.drawImage(S.l,0,RES);
    rmc.globalCompositeOperation='destination-out'; rmc.drawImage(S.s,0,0); rmc.globalCompositeOperation='source-over'; ectx.drawImage(S.r,x,y,N,N); }
  if(o.flash>0){ slc.globalCompositeOperation='source-in'; slc.fillStyle='#fff6e6'; slc.fillRect(0,0,D,D); slc.globalCompositeOperation='source-over'; ctx.globalAlpha=Math.min(1,o.flash)*(o.alpha==null?1:o.alpha); ctx.drawImage(S.l,x,y,N,N); }
  if(o.ghost){ slc.globalCompositeOperation='source-in'; slc.fillStyle=o.ghost; slc.fillRect(0,0,D,D); slc.globalCompositeOperation='source-over'; ectx.globalAlpha=.55; ectx.drawImage(S.l,x,y,N,N); ectx.globalAlpha=1; }
  ctx.globalAlpha=1;
}
function emisAt(wx,wy,face,fn,pose){ ectx.save(); ectx.translate(Math.round(wx-camR.x),Math.round(wy-camR.y)); if(face<0) ectx.scale(-1,1); if(pose){ ectx.rotate(pose.rot); ectx.scale(pose.sx,pose.sy); } fn(ectx); ectx.restore(); }
const FONT={'0':'111101101101111','1':'010110010010111','2':'111001111100111','3':'111001111001111','4':'101101111001001','5':'111100111001111','6':'111100111101111','7':'111001010010010','8':'111101111101111','9':'111101111001111','+':'000010111010000','!':'010010010000010'};
function pxText(c,str,x,y,col,s){ c.fillStyle=col; let cx=x; for(const ch of str){ const f=FONT[ch]; if(f) for(let i=0;i<15;i++) if(f[i]==='1') c.fillRect(cx+(i%3)*s,y+Math.floor(i/3)*s,s,s); cx+=4*s; } }

/* ---------- input: buffered actions so no press is lost ---------- */
const keys={}, buf={}; let mouseHeld=false, rmouseHeld=false;
const ACT={j:'atk',x:'atk',k:'off',space:'jump',w:'jump',ArrowUp:'jump',Shift:'dash',l:'dash',q:'potion','1':'s1','2':'s2','3':'s3','4':'s4'};
const GAMEKEYS=new Set(['space','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Tab','Shift']);
const norm=e=>{ const k=e.key.length===1?e.key.toLowerCase():e.key; return k===' '?'space':k; };
addEventListener('keydown',e=>{ const k=norm(e); if(k==='j'||k==='x') aimMouse=false; if(!keys[k]&&!e.repeat&&ACT[k]&&mode==='play') buf[ACT[k]]=time; keys[k]=true; if(GAMEKEYS.has(k)&&mode!=='title') e.preventDefault(); uiKey(k,e); });
addEventListener('keyup',e=>{ keys[norm(e)]=false; });
addEventListener('blur',()=>{ for(const k in keys) keys[k]=false; mouseHeld=rmouseHeld=false; });
const down=(...ks)=>ks.some(k=>keys[k]);
const took=(a,win)=>{ if(buf[a]!=null&&time-buf[a]<=win){ buf[a]=null; return true; } return false; };
/* mouse aim: the cursor's position in world space, so swings and bolts go where you point */
let mouseSX=W/2, mouseSY=H/2, aimMouse=false;
function setMouse(e){ const r=stage.getBoundingClientRect(); if(!r.width) return; mouseSX=(e.clientX-r.left)/r.width*W; mouseSY=(e.clientY-r.top)/r.height*H; }
stage.addEventListener('pointermove',e=>{ if(e.pointerType!=='mouse') return; setMouse(e); aimMouse=true; });
function mouseWorld(){ return {x:(mouseSX-camPX)/camZ+camPX+camR.x, y:(mouseSY-camPY)/camZ+camPY+camR.y}; }
stage.addEventListener('pointerdown',e=>{ if(e.pointerType==='mouse'){ setMouse(e); aimMouse=true; } if(mode==='cut'){ skipCut(); return; } if(mode!=='play'||e.pointerType!=='mouse'||e.target.closest('button')) return;
  if(e.button===0){ buf.atk=time; mouseHeld=true; } else if(e.button===2){ buf.off=time; rmouseHeld=true; } });
addEventListener('pointerup',e=>{ if(e.button===0) mouseHeld=false; if(e.button===2) rmouseHeld=false; });
stage.addEventListener('contextmenu',e=>{ if(mode==='play'||mode==='cut') e.preventDefault(); });
