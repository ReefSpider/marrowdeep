'use strict';
/* ===== sigils (v23): demonic seals instead of kanji =====
   Every kanji and kana the game shows (titles, cut-ins, epigraphs, the Codex, damage types, combos, Ways, verdicts,
   the kanji painted on canvases) is drawn as a sigil: a goetic-style seal built from the character itself, so the
   same word always gets the same seal. Text keeps its meaning underneath (screen readers and copy still get it).
   Pause → "Demonic sigils" switches back to kanji. Panel art painted into the manga stills is unchanged. */

const SIG_RE=/[぀-ヿ㐀-䶿一-鿿豈-﫿々ー、。]/;
const SIG_RE_G=/([぀-ヿ㐀-䶿一-鿿豈-﫿々ー、。])/g;
const sigOn=()=>typeof SETTINGS==='undefined'||SETTINGS.sigils!==false;

/* ---------- one seal per character ---------- */
const SIG_CV={}, SIG_URL={};
function sigRng(n){ let a=(n*2654435761)>>>0; return ()=>{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function sigCanvas(ch){ if(SIG_CV[ch]) return SIG_CV[ch]; const S=64, c=document.createElement('canvas'); c.width=c.height=S; const g=c.getContext('2d'); const r=sigRng(ch.codePointAt(0)*7+13);
  g.strokeStyle='#fff'; g.fillStyle='#fff'; g.lineWidth=5; g.lineCap='round'; g.lineJoin='round';
  const L_=(x0,y0,x1,y1)=>{ g.beginPath(); g.moveTo(x0,y0); g.lineTo(x1,y1); g.stroke(); };
  const O=(x,y,rr,fill)=>{ g.beginPath(); g.arc(x,y,rr,0,Math.PI*2); fill?g.fill():g.stroke(); };
  const end=(x,y,a)=>{ const k=r(); if(k<.34) O(x,y,3.2,true); else if(k<.55){ g.save(); g.lineWidth=3; O(x+Math.cos(a)*3,y+Math.sin(a)*3,3.4,false); g.restore(); } else if(k<.75){ L_(x,y,x+Math.cos(a+2.4)*6,y+Math.sin(a+2.4)*6); L_(x,y,x+Math.cos(a-2.4)*6,y+Math.sin(a-2.4)*6); } };
  const cx=32+(r()-.5)*6, top=8+r()*4, bot=56-r()*4, lean=(r()-.5)*.2;
  /* the stem */ const sx0=cx+lean*-24, sx1=cx+lean*24; L_(sx0,top,sx1,bot);
  const at=y=>sx0+(sx1-sx0)*((y-top)/(bot-top));
  /* a crown: horns, a trident, a ring or an inverted cross */
  const q=r(), cr=q<.3?0:q<.55?1:q<.7?2:q<.9?3:4;
  if(cr===0){ L_(at(top+8),top+8,at(top+8)-11,top-1); L_(at(top+8),top+8,at(top+8)+11,top-1); end(at(top+8)-11,top-1,-2.3); end(at(top+8)+11,top-1,-.8); }
  else if(cr===1){ const y=top+10; L_(at(y)-11,y,at(y)+11,y); L_(at(y)-11,y,at(y)-11,y-9); L_(at(y)+11,y,at(y)+11,y-9); end(at(y)-11,y-9,-1.57); end(at(y)+11,y-9,-1.57); }
  else if(cr===2){ g.save(); g.lineWidth=4; O(at(top)+0,top+1,6.5,false); g.restore(); }
  else if(cr===3){ g.beginPath(); g.arc(at(top+4),top+4,10,Math.PI*.15,Math.PI*.85,true); g.stroke(); }
  else end(at(top),top,-1.57);
  /* bars across the stem */ const nb=1+Math.floor(r()*3); for(let i=0;i<nb;i++){ const y=top+16+i*(bot-top-24)/Math.max(1,nb)+r()*4, w=6+r()*12, tilt=(r()-.5)*10, x=at(y);
    const kind=r(); if(kind<.5){ L_(x-w,y-tilt,x+w,y+tilt); end(x-w,y-tilt,Math.PI); end(x+w,y+tilt,0); }
    else if(kind<.75){ L_(x,y,x-w,y+w*.7); L_(x,y,x+w,y+w*.7); end(x-w,y+w*.7,2.4); end(x+w,y+w*.7,.7); }
    else { const s=r()<.5?-1:1; L_(x,y,x+s*w,y); L_(x+s*w,y,x+s*w,y+8+r()*6); end(x+s*w,y+8,1.57); } }
  /* a crescent or a hook at the side, sometimes */ if(r()<.45){ const y=top+(bot-top)*(.4+r()*.3), s=r()<.5?-1:1; g.beginPath(); g.arc(at(y)+s*12,y,7,s>0?Math.PI*.6:-Math.PI*.4,s>0?Math.PI*1.4:Math.PI*.4); g.stroke(); }
  /* the foot: a fork, a hook, a point or a little circle */ const ft=Math.floor(r()*4), fx=at(bot);
  if(ft===0){ L_(fx,bot,fx-7,bot+5); L_(fx,bot,fx+7,bot+5); } else if(ft===1){ g.beginPath(); g.arc(fx-5,bot,5,0,Math.PI*.9); g.stroke(); } else if(ft===2) O(fx,bot+1,3,true); else end(fx,bot,1.57);
  /* stray dots, as on the old seals */ for(let i=0,n=Math.floor(r()*3);i<n;i++) O(10+r()*44,14+r()*36,2,true);
  SIG_CV[ch]=c; return c; }
function sigURL(ch){ return SIG_URL[ch]||(SIG_URL[ch]=sigCanvas(ch).toDataURL()); }

/* ---------- page text: wrap each character in a seal-masked span; the character stays as transparent text ---------- */
(function(){ const st=document.createElement('style'); st.textContent=`.sgl{display:inline-block;-webkit-text-fill-color:transparent;color:inherit;background-color:currentColor;-webkit-mask:var(--sg) center/86% 92% no-repeat;mask:var(--sg) center/86% 92% no-repeat;text-shadow:none!important;width:1em;line-height:1;filter:drop-shadow(0 0 .08em currentColor)}`; document.head.appendChild(st); })();
function sigWrapNode(tn){ const s=tn.nodeValue; if(!s||!SIG_RE.test(s)) return; const p=tn.parentNode; if(!p||p.nodeType!==1) return; if(p.classList&&p.classList.contains('sgl')) return; const tag=p.tagName; if(tag==='SCRIPT'||tag==='STYLE'||tag==='TEXTAREA'||tag==='INPUT'||tag==='TITLE') return;
  const frag=document.createDocumentFragment(); for(const part of s.split(SIG_RE_G)){ if(!part) continue; if(part.length===1&&SIG_RE.test(part)){ const sp=document.createElement('span'); sp.className='sgl'; sp.textContent=part; sp.style.setProperty('--sg',`url(${sigURL(part)})`); frag.appendChild(sp); } else frag.appendChild(document.createTextNode(part)); }
  p.replaceChild(frag,tn); }
function sigWalk(root){ if(!sigOn()||!root) return; if(root.nodeType===3){ sigWrapNode(root); return; } const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null); const list=[]; let n; while((n=w.nextNode())) if(SIG_RE.test(n.nodeValue)) list.push(n); list.forEach(sigWrapNode); }
const SIG_MO=new MutationObserver(ms=>{ if(!sigOn()) return; for(const m of ms){ if(m.type==='characterData') sigWrapNode(m.target); else for(const n of m.addedNodes){ if(n.nodeType===1&&n.classList&&n.classList.contains('sgl')) continue; sigWalk(n); } } });
function sigStart(){ sigWalk(document.body); SIG_MO.observe(document.body,{childList:true,subtree:true,characterData:true}); }
function sigStop(){ SIG_MO.disconnect(); document.querySelectorAll('.sgl').forEach(sp=>sp.replaceWith(document.createTextNode(sp.textContent))); document.body.normalize(); }
if(sigOn()) sigStart();
/* the Gallows Wheel's painted 絞 is CSS content, not text */
(function(){ const st=document.createElement('style'); st.id='sigCss'; const set=()=>{ st.textContent=sigOn()?`.slcab::before{content:""!important;width:calc(var(--u)*3.4);height:calc(var(--u)*3.4);background:#c9a96a;-webkit-mask:url(${sigURL('絞')}) center/contain no-repeat;mask:url(${sigURL('絞')}) center/contain no-repeat}.slot.ins::after{content:""!important;width:calc(var(--u)*1.2);height:calc(var(--u)*1.2);background:#ff7a4a;-webkit-mask:url(${sigURL('保')}) center/contain no-repeat;mask:url(${sigURL('保')}) center/contain no-repeat}`:''; }; set(); document.head.appendChild(st); window.sigCssSet=set; })();

/* ---------- canvases: seals in place of kanji wherever the game paints text ---------- */
(function(){ const C=CanvasRenderingContext2D.prototype, oF=C.fillText, oS=C.strokeText, tint={};
  function tinted(ch,col){ const k=ch+'|'+col; if(tint[k]) return tint[k]; const s=sigCanvas(ch), c=document.createElement('canvas'); c.width=c.height=64; const g=c.getContext('2d'); g.fillStyle=col; g.fillRect(0,0,64,64); g.globalCompositeOperation='destination-in'; g.drawImage(s,0,0); tint[k]=c; return c; }
  function sz(ctx){ const m=/(\d+(?:\.\d+)?)px/.exec(ctx.font); return m?+m[1]:10; }
  function draw(ctx,orig,txt,x,y,mw){ txt=String(txt); if(!sigOn()||!SIG_RE.test(txt)) return orig.call(ctx,txt,x,y,mw);
    const size=sz(ctx), parts=txt.split(SIG_RE_G).filter(Boolean); const wOf=p=>p.length===1&&SIG_RE.test(p)?size:ctx.measureText(p).width; const tot=parts.reduce((a,p)=>a+wOf(p),0);
    const al=ctx.textAlign, bl=ctx.textBaseline; let sx=al==='center'?x-tot/2:(al==='right'||al==='end')?x-tot:x;
    const top=bl==='top'||bl==='hanging'?y:bl==='middle'?y-size/2:bl==='bottom'||bl==='ideographic'?y-size:y-size*.86;
    const col=typeof ctx.fillStyle==='string'?ctx.fillStyle:'#ffffff'; ctx.textAlign='left';
    try{ for(const p of parts){ const w=wOf(p); if(p.length===1&&SIG_RE.test(p)) ctx.drawImage(tinted(p,col),sx,top,size,size); else orig.call(ctx,p,sx,y); sx+=w; } } finally{ ctx.textAlign=al; } }
  C.fillText=function(t,x,y,mw){ return draw(this,oF,t,x,y,mw); };
  C.strokeText=function(t,x,y,mw){ if(sigOn()&&SIG_RE.test(String(t))) return; return oS.call(this,t,x,y,mw); }; })();

/* ---------- the pause switch ---------- */
(function(){ const o=openPause; openPause=function(){ o(); let cb=$('#pSig'); if(!cb){ const sc=$('#pScare'); const lab=sc&&sc.closest('label'); if(lab){ const l=document.createElement('label'); l.className='chk'; l.innerHTML='Demonic sigils <input type="checkbox" id="pSig">'; lab.parentNode.insertBefore(l,lab.nextSibling); cb=$('#pSig'); } }
  if(cb){ cb.checked=sigOn(); cb.onchange=()=>{ SETTINGS.sigils=cb.checked; store.set('marrowdeep.settings',SETTINGS); if(cb.checked) sigStart(); else sigStop(); window.sigCssSet&&window.sigCssSet(); }; } }; })();
