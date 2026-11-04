'use strict';
/* ===== manga 漫画 (v19): the story told in inked pages =====
   Cutscenes are pages of panels laid over the game: black gutters, paper-white panels in ink and screentone, with red
   the only colour. Every panel's picture, whatever its source, goes through the same ink filter, so the three sources
   read as one book:
     1. A Higgsfield still, if art/manga/<panel id>.(webp|jpg|png) is listed in art/manga/manifest.json.
     2. A shot of the actual level (an act's first room, a boss at the moment it falls).
     3. A drawing in mangaart.js.
   Click, E, Space or Enter turns to the next panel; Esc skips the whole scene. Panels also turn on their own.
   Each scene plays once per character (seenIntro 'mg:<id>'); after that the act cards are the short versions.
   Fonts: captions IM Fell, Japanese Shippori Mincho written top to bottom, sound effects in heavy Mincho. */
const MG={on:false,pages:null,pi:0,qi:0,el:null,onEnd:null,shots:{},art:{},manifest:null,t:0,auto:0,locked:0,prev:'play'};
const PAPER=[236,230,216], INK=[14,10,10], RED=[176,20,24];

/* ---------- the ink filter: 1-bit pixel art, ordered dithering on the game's own pixel grid ---------- */
const BAYER=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
function inkify(src,w,h,opt){ opt=opt||{}; const c=document.createElement('canvas'); c.width=w; c.height=h; const g=c.getContext('2d'); g.imageSmoothingEnabled=true;
  if(src) g.drawImage(src,0,0,w,h); const img=g.getImageData(0,0,w,h), d=img.data, n=w*h; const lum=new Float32Array(n), red=new Uint8Array(n);
  const con=opt.contrast||1.15, bias=opt.bias||0, gam=opt.gamma||.85; let lo=0, hi=1;
  if(opt.auto){ const hist=new Uint32Array(64); for(let i=0;i<n;i++){ const l=(.3*d[i*4]+.59*d[i*4+1]+.11*d[i*4+2])/255; hist[Math.min(63,l*64|0)]++; } let acc=0; lo=-1;
    for(let b=0;b<64;b++){ acc+=hist[b]; if(lo<0&&acc>n*.04) lo=b/64; if(acc>n*.985){ hi=(b+1)/64; break; } } if(hi-lo<.08) hi=lo+.08; }
  for(let i=0;i<n;i++){ const r=d[i*4]/255, gg=d[i*4+1]/255, b=d[i*4+2]/255; let l=.3*r+.59*gg+.11*b; l=clamp((l-lo)/(hi-lo),0,1); l=Math.pow(l,gam); l=clamp((l-.5)*con+.5+bias,0,1); lum[i]=l;
    if(opt.red!==false&&r>(opt.redMin||.32)&&r-Math.max(gg,b)>(opt.redT||.2)) red[i]=1; }
  const cell=Math.max(2.4,opt.cell||3), ca=Math.cos(.785), sa=Math.sin(.785), k=2*Math.PI/cell, edgeT=opt.edge==null?.22:opt.edge;
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){ const i=y*w+x; let l=lum[i];
    const gx=x>0&&x<w-1?lum[i+1]-lum[i-1]:0, gy=y>0&&y<h-1?lum[i+w]-lum[i-w]:0; const edge=Math.abs(gx)+Math.abs(gy)>edgeT;
    let out;
    if(red[i]){ const dk=l<.25; out=dk?[90,8,12]:RED; }
    else if(edge&&opt.edge!==0) out=INK;
    else if(l<.1) out=INK; else if(l>.9) out=PAPER;
    else { const s=(BAYER[(y&3)*4+(x&3)]+.5)/16; out=l<s?INK:PAPER; }
    const j=i*4, gr=0; d[j]=clamp(out[0]+gr,0,255); d[j+1]=clamp(out[1]+gr,0,255); d[j+2]=clamp(out[2]+gr,0,255); d[j+3]=255; }
  g.putImageData(img,0,0); return c; }

/* ---------- shots of the actual level ---------- */
function mgShot(cx,cy,zoom){ if(!L||!LV) return null; const sv={cx:cam.x,cy:cam.y,sh:shakeV,z:camZ,px:camPX,py:camPY};
  try{ cam.x=clamp(cx-W/2,0,Math.max(0,L.w*T-W)); cam.y=clamp(cy-H*.55,0,Math.max(0,L.h*T-H)); shakeV=0; camZ=zoom||1; camPX=W/2; camPY=H/2; render();
    const c=document.createElement('canvas'); c.width=W*RES; c.height=H*RES; const g=c.getContext('2d'); g.drawImage(cv,0,0); g.globalCompositeOperation='lighter'; g.drawImage(ev,0,0); return c; }
  catch(e){ console.warn('manga shot',e); return null; }
  finally{ cam.x=sv.cx; cam.y=sv.cy; shakeV=sv.sh; camZ=sv.z; camPX=sv.px; camPY=sv.py; } }
function mgShotLevelStart(){ return L?mgShot(L.spawn.x+W*.25,L.spawn.y-30,1):null; }

/* ---------- Higgsfield stills (optional) ---------- */
function mgLoadManifest(){ if(MG.manifest) return Promise.resolve(MG.manifest);
  return fetch('art/manga/manifest.json',{cache:'no-cache'}).then(r=>r.ok?r.json():[]).catch(()=>[]).then(a=>{ MG.manifest=new Set(Array.isArray(a)?a:[]); return MG.manifest; }); }
function mgImage(id){ const m=MG.manifest; if(!m) return Promise.resolve(null); const f=[...m].find(x=>x.replace(/\.(webp|jpe?g|png)$/,'')===id); if(!f) return Promise.resolve(null);
  if(MG.art[id]) return Promise.resolve(MG.art[id]); return new Promise(res=>{ const im=new Image(); im.onload=()=>{ MG.art[id]=im; res(im); }; im.onerror=()=>res(null); im.src='art/manga/'+f; }); }

/* ---------- page layout ----------
   A page is panels in stage percentages: r:[x,y,w,h] (the stage is 100 × 56.25), sl: slant of the left/right edges.
   Panel content: art:'drawing' (mangaart.js), v: variant, shot:'start'|'boss'|[x,y,zoom]. cap: narration boxes,
   say: speech balloons, sfx: a sound effect, fx: 'focus' (lines to the centre) or 'speed' (lines across), t: seconds. */
const STAGE_H=56.25;
function polyFor(p){ const [x,y,w,h]=p.r, s=p.sl||[0,0,0,0]; return [[x+s[0],y],[x+w+s[1],y],[x+w+s[3],y+h],[x+s[2],y+h]]; }
function pct(v,axis){ return axis==='y'?v/STAGE_H*100:v; }
function mgCss(){ if($('#mgCss')) return; const st=document.createElement('style'); st.id='mgCss'; st.textContent=`
#manga{position:absolute;inset:0;z-index:60;background:rgba(4,2,3,.0);transition:background .4s;pointer-events:auto;cursor:pointer;overflow:hidden}
#manga.on{background:rgba(4,2,3,.94)}
#manga .page{position:absolute;inset:2.2% 2.6%;transition:transform .55s cubic-bezier(.6,0,.3,1),opacity .4s}
#manga .page.out{transform:translateX(-108%) rotate(-2deg);opacity:0}
#manga .pn{position:absolute;inset:0;opacity:0;transform:scale(1.045);transition:opacity .22s,transform .38s cubic-bezier(.2,.9,.3,1.15)}
#manga .pn.on{opacity:1;transform:none}
#manga .pn canvas{position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated;image-rendering:crisp-edges}
#manga .pn svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none}
#manga .cap{position:absolute;background:#ece6d8;color:#120c0c;border:2px solid #0e0a0a;font-family:var(--fb);font-size:max(10px,calc(var(--u)*1.32));line-height:1.3;padding:calc(var(--u)*.35) calc(var(--u)*.7);max-width:44%;box-shadow:calc(var(--u)*.25) calc(var(--u)*.25) 0 #0e0a0a;opacity:0;transition:opacity .3s .15s}
#manga .pn.on .cap,#manga .pn.on .bal,#manga .pn.on .sfx{opacity:1}
#manga .cap.letter{font-style:italic;background:#e8dcc4;border-style:double;border-width:3px}
#manga .jp{position:absolute;writing-mode:vertical-rl;font-family:'Shippori Mincho',serif;font-weight:500;color:#120c0c;background:#ece6d8;border:2px solid #0e0a0a;font-size:max(9px,calc(var(--u)*1.15));padding:calc(var(--u)*.45) calc(var(--u)*.25);letter-spacing:.12em;max-height:78%;opacity:0;transition:opacity .3s .25s}
#manga .pn.on .jp{opacity:1}
#manga .bal{position:absolute;background:#ece6d8;color:#120c0c;border:2px solid #0e0a0a;box-shadow:calc(var(--u)*.25) calc(var(--u)*.25) 0 #0e0a0a;font-family:var(--fb);font-size:max(10px,calc(var(--u)*1.32));line-height:1.3;padding:calc(var(--u)*.35) calc(var(--u)*.7);text-align:left;max-width:40%;opacity:0;transition:opacity .25s .3s;transform:translate(-50%,-50%)}
#manga .bal.you{font-style:italic}
#manga .bal.dead{border-left:calc(var(--u)*.35) solid #a8141a}
#manga .bal.red{color:#a8141a}
#manga .sfx{position:absolute;font-family:'Shippori Mincho',serif;font-weight:800;color:#0e0a0a;-webkit-text-stroke:calc(var(--u)*.22) #ece6d8;paint-order:stroke fill;opacity:0;transition:opacity .15s .1s;transform:translate(-50%,-50%) rotate(var(--rot,-8deg));line-height:1;white-space:nowrap}
#manga .sfx.red{color:#b0141a}
#manga .hint{position:absolute;right:2.4%;bottom:1.2%;font-family:var(--fs);font-size:max(9px,calc(var(--u)*1));color:#6a5e58;letter-spacing:.1em}
@media (prefers-reduced-motion: reduce){#manga .pn,#manga .page{transition:opacity .2s}}`; document.head.appendChild(st); }
function svgPoly(pts,attrs){ return `<polygon points="${pts.map(([x,y])=>`${x},${pct(y,'y')}`).join(' ')}" ${attrs}/>`; }
function fxLines(kind,poly,seed){ const [x,y,w,h]=bbox(poly); const out=[]; const rg=mulberry(seed>>>0); const cx=x+w/2, cy=pct(y+h/2,'y');
  if(kind==='focus') for(let i=0;i<70;i++){ const a=rg()*Math.PI*2, r0=Math.min(w,pct(h,'y'))*(.28+rg()*.14), r1=Math.max(w,pct(h,'y')); const wd=.05+rg()*.25;
      out.push(`<polygon points="${cx+Math.cos(a-wd*.02)*r1},${cy+Math.sin(a-wd*.02)*r1} ${cx+Math.cos(a)*r0},${cy+Math.sin(a)*r0} ${cx+Math.cos(a+wd*.02)*r1},${cy+Math.sin(a+wd*.02)*r1}" fill="#0e0a0a"/>`); }
  if(kind==='speed') for(let i=0;i<38;i++){ const yy=pct(y,'y')+rg()*pct(h,'y'), x0=x+rg()*w*.6, len=w*(.2+rg()*.5); out.push(`<rect x="${x0}" y="${yy}" width="${len}" height="${.12+rg()*.25}" fill="#0e0a0a" opacity=".8"/>`); }
  if(kind==='down') for(let i=0;i<40;i++){ const xx=x+rg()*w, y0=pct(y,'y')+rg()*pct(h,'y')*.5, len=pct(h,'y')*(.2+rg()*.6); out.push(`<rect x="${xx}" y="${y0}" width="${.1+rg()*.2}" height="${len}" fill="#0e0a0a" opacity=".85"/>`); }
  return out.join(''); }
function pixFx(g,w,h,kind,seed){ const rg=mulberry(seed>>>0); g.fillStyle='#0c0a0a'; const cx=w/2, cy=h/2;
  if(kind==='focus') for(let i=0;i<60;i++){ const a=rg()*Math.PI*2, r0=Math.min(w,h)*(.32+rg()*.12), r1=Math.hypot(w,h); const wd=.008+rg()*.02; g.beginPath(); g.moveTo(cx+Math.cos(a-wd)*r1,cy+Math.sin(a-wd)*r1); g.lineTo(cx+Math.cos(a)*r0,cy+Math.sin(a)*r0); g.lineTo(cx+Math.cos(a+wd)*r1,cy+Math.sin(a+wd)*r1); g.fill(); }
  if(kind==='speed') for(let i=0;i<34;i++){ g.fillRect(Math.round(rg()*w*.6),Math.round(rg()*h),Math.round(w*(.2+rg()*.5)),1); }
  if(kind==='down') for(let i=0;i<40;i++){ g.fillRect(Math.round(rg()*w),Math.round(rg()*h*.5),1,Math.round(h*(.2+rg()*.6))); } }
function bbox(poly){ const xs=poly.map(p=>p[0]), ys=poly.map(p=>p[1]); const x=Math.min(...xs), y=Math.min(...ys); return [x,y,Math.max(...xs)-x,Math.max(...ys)-y]; }

/* ---------- building a panel ---------- */
async function mgPanel(p,pageEl,seq){ const poly=polyFor(p), [bx,by,bw,bh]=bbox(poly); const el=document.createElement('div'); el.className='pn';
  const rect=MG.el.querySelector('.page').getBoundingClientRect(), sr=stage.getBoundingClientRect(), gpx=sr.width/(W*RES); const px=p.px||(p.shot&&!p.art?1:2); /* 1 = the game's RES grid (shots), 2 = one pixel per game unit (drawings), 3+ = close-ups */
  const pw=Math.max(24,Math.round(rect.width*bw/100/gpx/px)), ph=Math.max(16,Math.round(rect.height*bh/STAGE_H/gpx/px));
  let src=await mgImage(p.id), opt={};
  if(!src&&p.shot&&!MG.noShots){ src=p.shot==='boss'?MG.shots.boss:p.shot==='start'?(MG.shots.start||(MG.shots.start=mgShotLevelStart())):Array.isArray(p.shot)?mgShot(p.shot[0],p.shot[1],p.shot[2]):null; opt={contrast:1.25,auto:1,gamma:.7,edge:.32,redMin:.62,redT:.42}; if(src) src=cropFit(src,pw/ph,p.crop); }
  const artN=src?null:(p.art||p.alt);
  if(!src&&artN&&MART[artN]){ const c=document.createElement('canvas'); c.width=pw; c.height=ph; const g=c.getContext('2d'); withSeed(hashStr(p.id),()=>MART[artN](g,pw,ph,p.art?(p.v||''):(p.altv||''))); src=c; opt={contrast:1.05,edge:.3,gamma:.8}; }
  else if(src&&!p.shot) { src=cropFit(src,pw/ph); opt={contrast:1.2}; }
  if(p.fx){ const fc=document.createElement('canvas'); fc.width=pw; fc.height=ph; const fg=fc.getContext('2d'); if(src) fg.drawImage(src,0,0,pw,ph); pixFx(fg,pw,ph,p.fx,hashStr(p.id)); src=fc; }
  const ink=inkify(src,pw,ph,Object.assign(opt,p.ink||{}));
  const cvs=document.createElement('canvas'); cvs.width=pw; cvs.height=ph; cvs.getContext('2d').drawImage(ink,0,0);
  const clip=`polygon(${poly.map(([x,y])=>`${(x-bx)/bw*100}% ${(y-by)/bh*100}%`).join(',')})`;
  const holder=document.createElement('div'); holder.style.cssText=`position:absolute;left:${bx}%;top:${pct(by,'y')}%;width:${bw}%;height:${pct(bh,'y')}%;clip-path:${clip}`; holder.appendChild(cvs); el.appendChild(holder);
  const svg=`<svg viewBox="0 0 100 100" preserveAspectRatio="none">${svgPoly(poly,'fill="none" stroke="#ece6d8" stroke-width=".9" vector-effect="non-scaling-stroke" style="stroke-width:3px"')}${svgPoly(poly,'fill="none" stroke="#0e0a0a" style="stroke-width:1.5px"')}</svg>`;
  el.insertAdjacentHTML('beforeend',svg);
  for(const c of p.cap||[]){ const d=document.createElement('div'); d.className='cap'+(c.letter?' letter':''); d.textContent=c.t; const at=c.at||'tl'; const pad=1.2;
    if(at.includes('t')) d.style.top=pct(by+pad,'y')+'%'; else d.style.bottom=(100-pct(by+bh-pad,'y'))+'%';
    if(at.includes('l')) d.style.left=(bx+pad+(p.sl?Math.max(0,p.sl[0]):0))+'%'; else d.style.right=(100-(bx+bw-pad+(p.sl?Math.min(0,p.sl[1]):0)))+'%'; d.style.maxWidth=Math.min(44,bw*.78)+'%'; el.appendChild(d);
    if(c.jp){ const j=document.createElement('div'); j.className='jp'; j.textContent=c.jp; j.style.top=pct(by+pad,'y')+'%'; if(at.includes('l')) j.style.right=(100-(bx+bw-pad))+'%'; else j.style.left=(bx+pad)+'%'; el.appendChild(j); } }
  for(const s of p.say||[]){ const d=document.createElement('div'); d.className='bal'+(s.who==='you'?' you':'')+(s.dead?' dead':'')+(s.red?' red':''); d.textContent=/^["“…]/.test(s.t)?s.t:`“${s.t}”`; d.style.maxWidth=Math.min(40,bw*.8)+'%'; d.style.left=(bx+bw*s.at[0])+'%'; d.style.top=pct(by+bh*s.at[1],'y')+'%'; el.appendChild(d); }
  if(p.sfx){ const s=p.sfx, d=document.createElement('div'); d.className='sfx'+(s.red?' red':''); d.textContent=s.t; d.style.left=(bx+bw*s.at[0])+'%'; d.style.top=pct(by+bh*s.at[1],'y')+'%'; d.style.fontSize=`calc(var(--u)*${s.size||6})`; d.style.setProperty('--rot',(s.rot==null?-8:s.rot)+'deg'); el.appendChild(d); }
  pageEl.appendChild(el); return el; }
function cropFit(src,ar,crop){ const sw=src.width||src.naturalWidth, sh=src.height||src.naturalHeight; let cw=sw, ch=sw/ar; if(ch>sh){ ch=sh; cw=sh*ar; }
  const z=crop&&crop.z||1; cw/=z; ch/=z; const fx=crop&&crop.x!=null?crop.x:.5, fy=crop&&crop.y!=null?crop.y:.5; const sx=clamp(sw*fx-cw/2,0,sw-cw), sy=clamp(sh*fy-ch/2,0,sh-ch);
  const c=document.createElement('canvas'); c.width=Math.max(1,Math.round(cw)); c.height=Math.max(1,Math.round(ch)); c.getContext('2d').drawImage(src,sx,sy,cw,ch,0,0,c.width,c.height); return c; }
const hashStr=s=>{ let h=2166136261; for(const ch of String(s)){ h^=ch.charCodeAt(0); h=Math.imul(h,16777619); } return h>>>0; };

/* ---------- playing a scene ---------- */
async function mangaPlay(id,pages,onEnd){ if(MG.on){ MG.queue=(MG.queue||[]).concat([[id,pages,onEnd]]); return; }
  mgCss(); await mgLoadManifest(); MG.on=true; MG.noShots=!!MG.replay; MG.replay=false; MG.id=id; MG.pages=pages; MG.pi=-1; MG.onEnd=onEnd; MG.prev=mode==='cut'?'play':mode; mode='manga'; hud.hidden=true; msgHold&&msgHold(1e6);
  if(typeof MUS!=='undefined') MUS.setMood('cut'); AU.setTension(0);
  const el=document.createElement('div'); el.id='manga'; el.innerHTML='<div class="hint">CLICK · E — NEXT　　ESC — SKIP</div>'; stage.appendChild(el); MG.el=el; void el.offsetWidth; el.classList.add('on');
  el.onclick=()=>mgNext(); await mgPage(0); }
async function mgPage(i){ const old=MG.el.querySelector('.page'); if(old){ old.classList.add('out'); AU.noise(.35,1800,400,.8,.18,'bandpass',.2); setTimeout(()=>old.remove(),560); }
  MG.pi=i; MG.qi=-1; const pg=document.createElement('div'); pg.className='page'; MG.el.appendChild(pg); MG.locked=1;
  const page=MG.pages[i]; MG.nodes=[]; let k=0; for(const p of page.panels){ MG.nodes.push({p,el:await mgPanel(p,pg,k++)}); if(!MG.on) return; }
  MG.locked=0; mgNext(); }
function mgNext(){ if(!MG.on||MG.locked) return; const nodes=MG.nodes; clearTimeout(MG.auto);
  if(MG.qi<nodes.length-1){ MG.qi++; const n=nodes[MG.qi]; n.el.classList.add('on'); const p=n.p; AU.tone('sine',90,40,.18,.35,.2); AU.noise(.08,900,200,1,.2,'lowpass',.1);
    if(p.sfx){ shake(0); AU.boom(.5); } if(p.sound&&AU[p.sound]) AU[p.sound]();
    const words=[].concat(p.cap||[],p.say||[]).reduce((a,c)=>a+c.t.split(/\s+/).length,0); MG.auto=setTimeout(mgNext,(p.t||Math.max(2.4,1.6+words*.32))*1000); return; }
  if(MG.pi<MG.pages.length-1){ mgPage(MG.pi+1); return; }
  mangaEnd(); }
function mangaEnd(){ if(!MG.on) return; clearTimeout(MG.auto); MG.on=false; const el=MG.el; el.classList.remove('on'); el.style.opacity='0'; el.style.transition='opacity .35s'; setTimeout(()=>el.remove(),380);
  if(typeof MSG!=='undefined') MSG.hold=0; MG.shots={}; if(MG.id) seenIntro['mg:'+MG.id]=1;
  mode=MG.prev==='manga'?'play':MG.prev; if(mode==='play') hud.hidden=false; const cb=MG.onEnd; MG.onEnd=null; if(cb) cb();
  const q=MG.queue&&MG.queue.shift(); if(q) setTimeout(()=>mangaPlay(...q),50); }
addEventListener('keydown',ev=>{ if(!MG.on) return; const k=ev.key; if(k==='Escape'){ ev.preventDefault(); ev.stopImmediatePropagation(); mangaEnd(); return; }
  if(k===' '||k==='Enter'||k==='e'||k==='E'||k==='j'||k==='J'){ ev.preventDefault(); ev.stopImmediatePropagation(); mgNext(); } else if(GAMEKEYS.has(k)) { ev.preventDefault(); ev.stopImmediatePropagation(); } },true);
const mgSeen=id=>!!seenIntro['mg:'+id];
if(typeof BG_MODES!=='undefined') BG_MODES.add('manga');
if(typeof closeMenus==='function'){ const o=closeMenus; closeMenus=function(){ if(MG.on) mangaEnd(); return o(); }; }
