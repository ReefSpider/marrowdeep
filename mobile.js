'use strict';
/* ===== v33 mobile: touch play that feels like a phone game =====
   Loaded after every other module, before boot.js. Does nothing unless index.html's mobile boot set window.MOBILE
   (a touch-first device, or ?touch=1).
   - The view widens to the phone's own shape (core.js reads window.MDW), fills the screen edge to edge, and keeps the
     HUD and controls inside the safe area (notch, home bar).
   - A floating analog stick on the left (touch anywhere there), thumb buttons on the right: Strike (hold to keep
     swinging), Jump, Roll, Off hand, Draught, the four arts with their cooldowns, and one context button that appears
     when there is something to open, take, talk to or finish.
   - The stick aims: swings and bolts follow it; let go and aim assist turns you to the nearest foe.
   - Top corner: pause, satchel, map, and a skill-point badge when there are points to spend.
   - Menus: bigger type, scroll where needed. Items open a sheet with what they are and buttons for what you can do;
     skills ask before they are learned; tooltips stay up after a tap.
   - Portrait shows a "turn your phone" screen. On iPhone Safari, a one-time card explains Add to Home Screen for
     true full screen. The screen stays awake while playing. Leaving the app pauses the game. */
const MOB = { on: !!window.MOBILE, stick: { id: null, x: 0, y: 0, ox: 0, oy: 0, dx: 0, dy: 0 }, held: {}, k: 1, aimT: null };
if (MOB.on) (function () {
  const MS = Object.assign({ assist: true, mirror: false, size: 1, haptics: true, fixed: false }, store.get('marrowdeep.touchset') || {});
  MOB.set = MS; const saveMS = () => store.set('marrowdeep.touchset', MS);
  if (SETTINGS.dps == null) SETTINGS.dps = false; /* the DPS meter is opt-in on a phone */

  /* ---------- 1. styles ---------- */
  const css = `
html.mobile,html.mobile body{height:100%;overflow:hidden;overscroll-behavior:none}
html.mobile:root{padding:0!important}
html.mobile body{padding:0!important;position:fixed;inset:0;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent;touch-action:none}
html.mobile #stage{box-shadow:none}
html.mobile #touch{display:none!important}
html.mobile *{-webkit-tap-highlight-color:transparent}
html.mobile .screen{padding-left:max(calc(var(--u)*2),env(safe-area-inset-left));padding-right:max(calc(var(--u)*2),env(safe-area-inset-right));-webkit-overflow-scrolling:touch}
html.mobile .btn{min-height:44px;touch-action:manipulation}
html.mobile .tab,html.mobile .gtab{min-height:36px;touch-action:manipulation}
html.mobile .gitem,html.mobile .slot{touch-action:none}
html.mobile kbd{display:none}
html.mobile .btn kbd,html.mobile button kbd{display:none}
html.mobile #title .keyhint{display:none}
/* HUD: life and grit top left, names top centre, purse top right; the bottom belongs to the thumbs */
html.mobile #hud,html.mobile #mt{left:env(safe-area-inset-left,0px);right:env(safe-area-inset-right,0px)}
html.mobile .orb{width:calc(var(--u)*6.2);height:calc(var(--u)*6.2);top:calc(var(--u)*1.1);bottom:auto}
html.mobile .orb.life{left:calc(var(--u)*1.4)}
html.mobile .orb.grit{left:calc(var(--u)*7.2);right:auto;width:calc(var(--u)*4.4);height:calc(var(--u)*4.4);top:calc(var(--u)*3.6)}
html.mobile .orbn.l{left:calc(var(--u)*.6);bottom:auto;top:calc(var(--u)*7.6);width:calc(var(--u)*8);font-size:max(10px,calc(var(--u)*1.25))}
html.mobile .orbn.g{display:none}
html.mobile .lvlbox{left:calc(var(--u)*12.4);right:auto;top:calc(var(--u)*1.1);text-align:left;font-size:max(10px,calc(var(--u)*1.2))}
html.mobile .lvlbox .sp{display:none}
html.mobile .belt{left:calc(var(--u)*12.4);bottom:auto;top:calc(var(--u)*4.8)}
html.mobile .belt i{width:calc(var(--u)*2.2);height:calc(var(--u)*2.5)}
html.mobile .belt span:has(kbd:only-child){display:none}
html.mobile #xp{left:calc(var(--u)*1.4);right:auto;width:calc(var(--u)*24);top:calc(var(--u)*9.6);bottom:auto;height:3px}
html.mobile .topl{left:50%;transform:translateX(-50%);text-align:center;top:calc(var(--u)*.9);font-size:max(9px,calc(var(--u)*1.1));white-space:nowrap}
html.mobile .topl b{font-size:max(13px,calc(var(--u)*1.9))}
html.mobile #hud.boss .topl{opacity:0}
html.mobile .purse{right:calc(var(--u)*1.6);bottom:auto;top:calc(var(--u)*7.4);font-size:max(11px,calc(var(--u)*1.5))}
html.mobile .purse small{display:none}
html.mobile #abar{display:none!important}
html.mobile #prompt{display:none!important}
html.mobile #bossbar{top:calc(var(--u)*1.2);bottom:auto;width:calc(var(--u)*46)}
html.mobile #target{top:calc(var(--u)*5.8)}
html.mobile #toast{top:calc(var(--u)*11.4);left:calc(var(--u)*1.4)}
html.mobile #toast div{white-space:normal;max-width:calc(var(--u)*42)}
html.mobile #combo{right:calc(var(--u)*3);top:24%}
html.mobile #combo b{font-size:calc(var(--u)*4.4)}
html.mobile #bark{bottom:auto;top:calc(var(--u)*13);width:46%}
html.mobile #caption{top:calc(var(--u)*7.2)!important;bottom:auto!important}
html.mobile #caption .cap{font-size:max(13px,calc(var(--u)*1.9));max-width:60%}
html.mobile #hud.cap #bark{top:calc(var(--u)*14.5)}
html.mobile #rage{bottom:auto;top:calc(var(--u)*11.2);left:calc(var(--u)*1.4);transform:none;width:calc(var(--u)*14)}
html.mobile #dpsm{left:calc(var(--u)*1.4)!important;right:auto!important;top:calc(var(--u)*14)!important;bottom:auto!important;transform:none!important}
html.mobile #lvlup span{display:none}
html.mobile .droll{max-width:40%;font-size:max(9px,calc(var(--u)*1.05))}
html.mobile #drolls{right:auto;left:50%;transform:translateX(-50%);top:calc(var(--u)*6.6);flex-direction:row}
html.mobile #drolls .droll{width:calc(var(--u)*23)}
html.mobile #drolls .gtip{display:none!important}
html.mobile #manga .hint{right:auto!important;left:max(16px,env(safe-area-inset-left))}

/* ---------- touch controls ---------- */
#mt{position:absolute;top:0;bottom:0;z-index:12;pointer-events:none;--k:1}
#mt[hidden]{display:none}
#mtZone{position:absolute;left:0;top:18%;bottom:0;width:44%;pointer-events:auto;touch-action:none}
#mt.mir #mtZone{left:auto;right:0}
.mtStick{position:absolute;width:calc(var(--k)*124px);height:calc(var(--k)*124px);margin:calc(var(--k)*-62px) 0 0 calc(var(--k)*-62px);border-radius:50%;pointer-events:none;
  background:radial-gradient(circle,rgba(12,7,8,.0) 40%,rgba(12,7,8,.42) 70%,rgba(12,7,8,.5) 100%);box-shadow:inset 0 0 0 1.5px rgba(220,207,178,.22),0 0 0 1px rgba(0,0,0,.4);transition:opacity .25s}
.mtStick.idle{opacity:.45}
.mtStick i{position:absolute;left:50%;top:50%;width:calc(var(--k)*54px);height:calc(var(--k)*54px);margin:calc(var(--k)*-27px) 0 0 calc(var(--k)*-27px);border-radius:50%;
  background:radial-gradient(circle at 38% 32%,rgba(236,226,206,.5),rgba(120,100,90,.35) 45%,rgba(30,20,20,.55) 100%);box-shadow:0 0 0 1.5px rgba(220,207,178,.5),0 4px 10px rgba(0,0,0,.5)}
.mtStick.on i{box-shadow:0 0 0 1.5px rgba(236,226,206,.85),0 0 14px rgba(154,31,28,.55)}
.mtStick b{position:absolute;inset:14%;border-radius:50%;border:1px dashed rgba(220,207,178,.12)}
.mtb{position:absolute;pointer-events:auto;touch-action:none;border-radius:50%;display:grid;place-items:center;align-content:center;padding:0;
  background:radial-gradient(circle at 40% 30%,rgba(46,30,30,.62),rgba(10,6,7,.66) 70%);border:1.5px solid rgba(220,207,178,.3);color:var(--bone);
  box-shadow:0 3px 10px rgba(0,0,0,.45),inset 0 0 12px rgba(0,0,0,.6);transition:transform .07s,border-color .1s,box-shadow .1s,opacity .2s;font-family:var(--fs);-webkit-user-select:none;user-select:none}
.mtb .g{display:block;font-family:'Shippori Mincho',var(--fb);font-weight:800;line-height:1;font-size:calc(var(--d)*.36);color:#e8dcc0;text-shadow:0 1px 0 #000}
.mtb .l{display:block;font-size:max(8px,calc(var(--d)*.15));letter-spacing:.08em;color:var(--ash);margin-top:2px;text-transform:lowercase}
.mtb.down{transform:scale(.9);border-color:rgba(240,228,204,.85);box-shadow:0 0 16px rgba(154,31,28,.6),inset 0 0 12px rgba(0,0,0,.5)}
.mtb.big{border-color:rgba(200,80,60,.55)}
.mtb.big .g{color:#f0e2c4}
.mtb.off{opacity:0;pointer-events:none}
.mtb.dim{opacity:.38}
.mtb .cd{position:absolute;inset:0;border-radius:50%;background:conic-gradient(rgba(0,0,0,.66) calc(var(--cd,0)*360deg),transparent 0);pointer-events:none}
.mtb.ready{border-color:#b0362a;box-shadow:0 0 12px rgba(200,40,30,.55),inset 0 0 12px rgba(0,0,0,.5)}
.mtb .n{position:absolute;right:-2px;top:-2px;min-width:18px;height:18px;border-radius:9px;background:#5a0e0e;border:1px solid #c8a070;color:#fff1d8;font-size:11px;line-height:16px;text-align:center;font-family:var(--fs)}
#mtAct{position:absolute;pointer-events:auto;touch-action:none;display:flex;align-items:center;gap:8px;max-width:36%;padding:0 18px 0 6px;height:calc(var(--k)*50px);border-radius:calc(var(--k)*25px);
  background:linear-gradient(180deg,rgba(40,24,22,.88),rgba(12,7,8,.9));border:1.5px solid rgba(216,178,74,.65);color:var(--bone);font-family:var(--fs);font-size:max(12px,calc(var(--k)*14px));letter-spacing:.04em;
  box-shadow:0 0 18px rgba(216,178,74,.25),0 3px 10px rgba(0,0,0,.5);transition:opacity .18s,transform .18s;white-space:nowrap;overflow:hidden}
#mtAct i{flex:0 0 auto;width:calc(var(--k)*38px);height:calc(var(--k)*38px);border-radius:50%;display:grid;place-items:center;background:#2a0c0c;border:1px solid #d8b24a;font-style:normal;font-family:'Shippori Mincho',var(--fb);font-weight:800;color:#ffe6b0;font-size:calc(var(--k)*17px)}
#mtAct span{overflow:hidden;text-overflow:ellipsis}
#mtAct.off{opacity:0;transform:translateY(10px);pointer-events:none}
#mtAct.down{transform:scale(.95)}
#mtAct.fin{border-color:#e04030;box-shadow:0 0 22px rgba(224,64,48,.55)}
#mtAct.fin i{background:#7a0e0e;border-color:#ff8060}
.mtTop{position:absolute;top:calc(var(--u)*1);pointer-events:auto;touch-action:manipulation;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;
  background:rgba(10,6,7,.6);border:1px solid rgba(220,207,178,.28);color:#e8dcc0;font-family:'Shippori Mincho',var(--fb);font-weight:800;font-size:17px;padding:0}
.mtTop.down{transform:scale(.9);border-color:#e8dcc0}
.mtTop .n{position:absolute;right:-3px;top:-3px;min-width:16px;height:16px;border-radius:8px;background:#9a1f1c;color:#fff;font-size:10px;line-height:16px;font-family:var(--fs)}
#mtSp{width:auto;padding:0 12px 0 10px;border-radius:20px;font-size:13px;gap:6px;display:flex;border-color:rgba(216,120,60,.7);color:var(--ember);font-family:var(--fs);box-shadow:0 0 12px rgba(216,120,60,.35)}
#mtSp b{font-family:'Shippori Mincho',var(--fb);font-size:16px;color:#ffd0a0}

/* ---------- item sheet (tap an item) ---------- */
#mSheet{position:absolute;top:0;bottom:0;right:0;width:min(44%,calc(var(--u)*42));z-index:40;display:flex;flex-direction:column;background:linear-gradient(90deg,rgba(8,5,6,.0),rgba(8,5,6,.96) 6%);
  padding:calc(var(--u)*1.2) max(calc(var(--u)*1.4),env(safe-area-inset-right)) max(10px,env(safe-area-inset-bottom)) calc(var(--u)*3);animation:shin .18s ease-out}
#mSheet[hidden]{display:none}
#mSheet.left{right:auto;left:0;background:linear-gradient(270deg,rgba(8,5,6,.0),rgba(8,5,6,.96) 6%);padding-left:max(calc(var(--u)*1.4),env(safe-area-inset-left));padding-right:calc(var(--u)*3)}
@keyframes shin{from{opacity:0;transform:translateX(16px)}}
#mSheet .tx{flex:1 1 auto;overflow-y:auto;-webkit-overflow-scrolling:touch;touch-action:pan-y;font-size:max(11px,calc(var(--u)*1.3));line-height:1.3}
#mSheet .tx .tt,#mSheet .tx>div{position:static!important}
#mSheet .bt{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;flex:0 0 auto}
#mSheet .bt .btn{flex:1 1 40%;margin:0;padding:8px 6px;font-size:max(12px,calc(var(--u)*1.35))}
#mSheet .bt .btn.pri{border-color:#9a1f1c;background:linear-gradient(#3a0c0c,#1a0606)}
html.mobile #tip{max-width:min(46%,calc(var(--u)*40));font-size:max(10px,calc(var(--u)*1.2))}
html.mobile .node.arm{outline:2px solid var(--ember);outline-offset:2px}
.mClose{position:absolute;top:max(8px,env(safe-area-inset-top));right:max(12px,env(safe-area-inset-right));width:40px;height:40px;border-radius:50%;display:grid;place-items:center;padding:0;background:rgba(10,6,7,.8);border:1px solid rgba(220,207,178,.3);z-index:5}
.mClose:active{transform:scale(.92)}

/* ---------- turn your phone; install card ---------- */
#mRot{position:fixed;inset:0;z-index:100;background:#050304;display:none;flex-direction:column;align-items:center;justify-content:center;gap:18px;color:var(--bone);font-family:var(--fs);text-align:center;padding:24px}
#mRot b{font-family:'Shippori Mincho',var(--fb);font-size:64px;color:#8e1414;line-height:1}
#mRot .ph{width:46px;height:80px;border:3px solid var(--bone);border-radius:9px;position:relative;animation:rotph 2.4s ease-in-out infinite}
#mRot .ph::after{content:"";position:absolute;left:50%;bottom:5px;width:12px;height:3px;margin-left:-6px;border-radius:2px;background:var(--bone)}
@keyframes rotph{0%,25%{transform:rotate(0)}55%,100%{transform:rotate(-90deg)}}
#mRot p{margin:0;color:var(--ash);font-family:var(--fb);font-style:italic;font-size:16px;max-width:280px}
@media (orientation:portrait){ html.mobile #mRot{display:flex} }
#mInst{position:absolute;left:50%;bottom:max(14px,env(safe-area-inset-bottom));transform:translateX(-50%);z-index:30;display:flex;align-items:center;gap:14px;max-width:min(92%,640px);
  background:rgba(10,6,7,.95);border:1px solid #4a3a30;border-left:3px solid var(--blood);padding:10px 12px 10px 16px;font-family:var(--fs);color:var(--bone);font-size:13px;line-height:1.35;box-shadow:0 8px 30px #000}
#mInst svg{flex:0 0 auto}
#mInst .btn{margin:0;min-height:36px;padding:4px 14px;font-size:12px}
html.mobile #title #mInst{top:max(10px,env(safe-area-inset-top));bottom:auto}
html.mobile #mInst .btn{white-space:nowrap}
html.mobile #title h1{font-size:calc(var(--u)*9.5);margin:0}
html.mobile #title .sub{font-size:max(12px,calc(var(--u)*1.5));margin:calc(var(--u)*1) 0 0}
html.mobile #title .row{flex-wrap:wrap;justify-content:center;gap:calc(var(--u)*.8)}
html.mobile #title .row .btn{margin-top:calc(var(--u)*1.4)}
html.mobile #title .ver{bottom:auto;top:max(8px,env(safe-area-inset-top));right:max(12px,env(safe-area-inset-right))}

/* ---------- menus on a phone: tighter headings and padding, so they fit or scroll a little ---------- */
html.mobile .screen{padding-top:max(8px,env(safe-area-inset-top));padding-bottom:max(8px,env(safe-area-inset-bottom))}
html.mobile #stage{--t-s:max(11px,calc(var(--u)*1.3));--t-m:max(12px,calc(var(--u)*1.55));--t-l:max(13px,calc(var(--u)*1.75));--h-m:calc(var(--u)*2.6);--h-l:calc(var(--u)*3.1)}
html.mobile .panel{padding:calc(var(--u)*1.1)}
html.mobile .panel h3{font-size:calc(var(--u)*2.1);margin-bottom:calc(var(--u)*.5)}
html.mobile .tabs{margin-bottom:calc(var(--u)*.5)}
html.mobile .tab{padding:calc(var(--u)*.2) calc(var(--u)*1.2)}
html.mobile .btn{margin-top:calc(var(--u)*1.2);padding:calc(var(--u)*.45) calc(var(--u)*1.8)}
html.mobile .mh{font-size:var(--h-l);margin-bottom:calc(var(--u)*.6)}
/* pause: two columns of buttons */
html.mobile #pause .pt{font-size:calc(var(--u)*3.2)}
html.mobile #pause h2{font-size:calc(var(--u)*2.4);margin:calc(var(--u)*.2) 0 calc(var(--u)*1)}
html.mobile #pause .pv{display:grid;grid-template-columns:repeat(2,minmax(calc(var(--u)*24),1fr));gap:calc(var(--u)*.8) calc(var(--u)*1.2)}
html.mobile #pause .pv .pvh{grid-column:1/-1}
html.mobile #pause .pv label{grid-column:span 1}
html.mobile #pause .lore{display:none}
/* satchel: compact head, stats two to a row */
html.mobile #inv{padding-top:max(4px,env(safe-area-inset-top))}
html.mobile #inv .tabs .tab{font-size:max(12px,calc(var(--u)*1.5))}
html.mobile #paneBag{gap:calc(var(--u)*1.4);flex-wrap:nowrap}
html.mobile #paneBag .panel{padding:calc(var(--u)*.9)}
html.mobile #stats{grid-template-columns:auto auto auto auto!important;column-gap:calc(var(--u)*1.2)!important;font-size:max(10px,calc(var(--u)*1.15))!important}
html.mobile #paneBag .hint{display:none}
html.mobile #bag,html.mobile #sbBag,html.mobile #sbStash{--cell:min(calc(var(--u)*2.85),calc((var(--sh,392px) - 150px)/10))!important}
html.mobile #stashScr .mh{font-size:calc(var(--u)*2.4);margin-bottom:calc(var(--u)*.3)}
html.mobile #stashScr .hint{display:none}
/* settings: three panels side by side */
html.mobile .setGrid{grid-template-columns:repeat(3,minmax(0,calc(var(--u)*30)))}
html.mobile .keyGrid{grid-template-columns:repeat(2,calc(var(--u)*34))}
html.mobile .keyGrid div{grid-template-columns:calc(var(--u)*11) 1fr}
/* chest: shorter reel, the result beside its buttons */
html.mobile #case h2{font-size:calc(var(--u)*2.6)}
html.mobile #case .cs{margin:calc(var(--u)*.2) 0 calc(var(--u)*.6)}
html.mobile .reel{height:calc(var(--u)*10.5)}
html.mobile .result{margin-top:calc(var(--u)*.6)}
html.mobile .result .tt{max-width:calc(var(--u)*92);column-count:2;column-gap:calc(var(--u)*3);text-align:left}
html.mobile .result .tt>*{break-inside:avoid}
html.mobile .result .row{bottom:calc(-1*max(8px,env(safe-area-inset-bottom)));padding:calc(var(--u)*.6) 0 max(8px,env(safe-area-inset-bottom))}
html.mobile #inv>.tabs{margin-bottom:2px}
html.mobile #inv .sortBtn{min-height:30px!important;margin:0!important}
html.mobile .bagHead{margin-bottom:2px!important}
html.mobile .bagHead h3{font-size:calc(var(--u)*1.9)}
html.mobile .gtab{min-height:26px;padding-top:2px;padding-bottom:2px}
html.mobile #bag{--cell:min(calc(var(--u)*2.85),calc((var(--sh,392px) - 168px)/10))!important}
html.mobile #sbBag,html.mobile #sbStash{--cell:min(calc(var(--u)*2.85),calc((var(--sh,392px) - 186px)/10))!important}
html.mobile #paneBag .sealPocket{margin-top:calc(var(--u)*1);flex-wrap:wrap}
html.mobile #paneBag .sealPocket .spt{display:none}
html.mobile #equip{transform-origin:top left}
`;
  const st = document.createElement('style'); st.id = 'mobileCss'; st.textContent = css; document.head.appendChild(st);
  fit();

  /* ---------- 2. the controls ---------- */
  const mt = document.createElement('div'); mt.id = 'mt'; mt.hidden = true; stage.appendChild(mt);
  const zone = document.createElement('div'); zone.id = 'mtZone'; mt.appendChild(zone);
  const stickEl = document.createElement('div'); stickEl.className = 'mtStick idle'; stickEl.innerHTML = '<b></b><i></i>'; mt.appendChild(stickEl);
  const knob = stickEl.querySelector('i');
  const ART = { s1: ['血', 'bleed'], s2: ['鎖', 'tether'], s3: ['獣', 'hound'], s4: ['鐘', 'bell'] };
  /* layout: each button's centre, in px at a 393 px tall screen, measured from the screen edge (x) and the bottom (y).
     Jump sits in the corner, Strike beside it, Roll and Drink stacked above Jump, the arts in an arc over Strike, the off hand beyond it. */
  const LAYOUT = {
    jump: { x: 62, y: 62, r: 38, g: '跳', l: 'jump', key: ' ' },
    atk: { x: 166, y: 80, r: 46, g: '斬', l: 'strike', key: 'j', big: 1 },
    dash: { x: 70, y: 160, r: 31, g: '転', l: 'roll', key: 'Shift' },
    pot: { x: 70, y: 240, r: 24, g: '薬', l: 'drink', key: 'q' },
    s1: { x: 272, y: 118, r: 25, key: '1' }, s2: { x: 242, y: 164, r: 25, key: '2' }, s3: { x: 194, y: 190, r: 25, key: '3' }, s4: { x: 140, y: 190, r: 25, key: '4' },
    off: { x: 270, y: 46, r: 29, g: '副', l: 'off hand', key: 'k' } };
  const btns = {};
  for (const [id, o] of Object.entries(LAYOUT)) {
    const b = document.createElement('button'); b.className = 'mtb' + (o.big ? ' big' : ''); b.dataset.id = id;
    const gl = o.g || ART[id][0], lb = o.l || ART[id][1];
    b.innerHTML = `<span class="cd"></span><span class="g">${gl}</span><span class="l">${lb}</span>` + (id === 'pot' ? '<span class="n">0</span>' : '');
    b.setAttribute('aria-label', lb); mt.appendChild(b); btns[id] = b; bindHold(b, o.key, id);
  }
  const act = document.createElement('button'); act.id = 'mtAct'; act.className = 'off'; act.innerHTML = '<i class="g">開</i><span class="t"></span>'; mt.appendChild(act);
  const top = (id, g, lab, key) => { const b = document.createElement('button'); b.className = 'mtTop'; b.id = id; b.innerHTML = g; b.setAttribute('aria-label', lab); mt.appendChild(b);
    b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); b.classList.add('down'); haptic(); });
    const up = () => b.classList.remove('down'); b.addEventListener('pointerup', e => { up(); if (mode === 'play') tapKey(key); }); b.addEventListener('pointercancel', up); return b; };
  const bPause = top('mtPause', '<svg width="14" height="16" viewBox="0 0 14 16"><rect x="1" y="1" width="4" height="14" fill="#e8dcc0"/><rect x="9" y="1" width="4" height="14" fill="#e8dcc0"/></svg>', 'Pause', 'Escape');
  const bBag = top('mtBag', '<svg width="20" height="20" viewBox="0 0 20 20"><path d="M6 6 4 4h12l-2 2M5 7h10l2 11H3z" fill="none" stroke="#e8dcc0" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 11h4" stroke="#d8b24a" stroke-width="1.6"/></svg>', 'Satchel', 'i');
  const bMap = top('mtMap', '<svg width="20" height="20" viewBox="0 0 20 20"><path d="M2 4l5-2 6 2 5-2v14l-5 2-6-2-5 2z M7 2v14 M13 4v14" fill="none" stroke="#e8dcc0" stroke-width="1.5" stroke-linejoin="round"/><circle cx="10" cy="9" r="1.6" fill="#c23a2a"/></svg>', 'Map', 'm');
  const bSp = top('mtSp', '<b>技</b><span class="c">0</span>', 'Spend skill points', 't');

  function layout() {
    const sh = stage.clientHeight || 393; const k = MOB.k = clamp(sh / 393, .78, 1.45) * MS.size; mt.style.setProperty('--k', k);
    const side = MS.mirror ? 'left' : 'right', other = MS.mirror ? 'right' : 'left';
    mt.classList.toggle('mir', !!MS.mirror);
    const bottomInset = 4 * k; /* the safe-area bottom is on #mt's own padding via env() below */
    for (const [id, o] of Object.entries(LAYOUT)) {
      const b = btns[id], r = o.r * k, x = o.x * k, y = o.y * k + bottomInset;
      Object.assign(b.style, { width: 2 * r + 'px', height: 2 * r + 'px', [side]: (x - r) + 'px', [other]: 'auto', bottom: `calc(${(y - r).toFixed(1)}px + env(safe-area-inset-bottom,0px)*.6)` });
      b.style.setProperty('--d', 2 * r + 'px');
    }
    Object.assign(act.style, { [side]: (318 * k) + 'px', [other]: 'auto', bottom: `calc(${(26 * k).toFixed(1)}px + env(safe-area-inset-bottom,0px)*.6)` });
    Object.assign(look.style, { width: 48 * k + 'px', height: 48 * k + 'px', [side]: (318 * k) + 'px', [other]: 'auto', bottom: `calc(${(84 * k).toFixed(1)}px + env(safe-area-inset-bottom,0px)*.6)` }); look.style.setProperty('--d', 48 * k + 'px');
    const tops = [bPause, bMap, bBag, bSp]; let x = 12;
    for (const b of tops) { Object.assign(b.style, { right: x + 'px', left: 'auto' }); x += (b === bSp ? (b.offsetWidth || 64) : 40) + 8; }
    placeStickIdle();
  }
  function placeStickIdle() { if (MOB.stick.id != null) return; const k = MOB.k, zr = zone.getBoundingClientRect(), mr = mt.getBoundingClientRect();
    const x = MS.mirror ? mr.width - 118 * k : 118 * k, y = mr.height - 104 * k - (parseFloat(getComputedStyle(mt).paddingBottom) || 0);
    stickEl.style.left = x + 'px'; stickEl.style.top = y + 'px'; knob.style.transform = ''; MOB.stick.ox = x; MOB.stick.oy = y; }
  addEventListener('resize', () => setTimeout(layout, 60));
  if (window.visualViewport) visualViewport.addEventListener('resize', () => setTimeout(() => { fit(); layout(); }, 60));

  /* key plumbing: a synthetic keydown/keyup reaches the engine and every module the same way a keyboard does */
  function keyEv(type, key) { dispatchEvent(new KeyboardEvent(type, { key, bubbles: true, cancelable: true })); }
  function tapKey(key) { keyEv('keydown', key); setTimeout(() => keyEv('keyup', key), 40); }
  MOB.tapKey = tapKey;
  function bindHold(b, key, id) {
    b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); if (b.classList.contains('off')) return; try { b.setPointerCapture(e.pointerId); } catch (_) {}
      b.classList.add('down'); MOB.held[id] = e.pointerId; haptic(id === 'atk' ? 6 : 8); AU.init();
      if (mode === 'play') { if (id === 'atk' || id === 'off') steerAimForPress(); keyEv('keydown', key); } });
    const up = e => { if (MOB.held[id] !== e.pointerId) return; delete MOB.held[id]; b.classList.remove('down'); keyEv('keyup', key); };
    b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('lostpointercapture', up);
    b.addEventListener('contextmenu', e => e.preventDefault()); }
  const look = document.createElement('button'); look.className = 'mtb off'; look.id = 'mtLook'; look.innerHTML = '<span class="g">見</span><span class="l">look</span>'; mt.appendChild(look);
  look.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); haptic(); });
  look.addEventListener('pointerup', () => { const d = typeof underfoot === 'function' ? underfoot()[0] : null; if (!d || mode !== 'play') return;
    openSheet(d.item, null, [{ t: 'Take', pri: 1, f: () => { if (!d.gone) takeDrop(d); } }, { t: 'Equip', f: () => { if (!d.gone) equipFromFloor(d); } }]); });
  act.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); act.classList.add('down'); haptic(10); AU.init(); });
  act.addEventListener('pointerup', () => { act.classList.remove('down'); if (mode !== 'play') return; tapKey(act.dataset.key || 'e'); });
  act.addEventListener('pointercancel', () => act.classList.remove('down'));

  /* haptics: Android vibrates; iOS 18 Safari ticks when a switch input is toggled from a tap */
  const hsw = document.createElement('label'); hsw.style.cssText = 'position:fixed;left:-99px;top:0;width:1px;height:1px;opacity:0;pointer-events:none';
  hsw.innerHTML = '<input type="checkbox" switch>'; document.body.appendChild(hsw);
  function haptic(ms) { if (!MS.haptics) return; try { if (navigator.vibrate) navigator.vibrate(ms || 8); else hsw.click(); } catch (_) {} }
  MOB.haptic = haptic;

  /* ---------- 3. the stick ---------- */
  const S = MOB.stick;
  zone.addEventListener('pointerdown', e => { if (mode !== 'play' || S.id != null) return; e.preventDefault(); AU.init();
    try { zone.setPointerCapture(e.pointerId); } catch (_) {}
    const mr = mt.getBoundingClientRect(); S.id = e.pointerId;
    const k = MOB.k, rad = 62 * k;
    let x = e.clientX - mr.left, y = e.clientY - mr.top;
    if (MS.fixed) { x = S.ox; y = S.oy; } else { x = clamp(x, rad * .7, mr.width - rad * .7); y = clamp(y, rad * .7, mr.height - rad * .7); }
    S.x = x; S.y = y; stickEl.style.left = x + 'px'; stickEl.style.top = y + 'px'; stickEl.classList.remove('idle'); stickEl.classList.add('on');
    moveStick(e); });
  zone.addEventListener('pointermove', e => { if (e.pointerId === S.id) moveStick(e); });
  const endStick = e => { if (e.pointerId !== S.id) return; S.id = null; S.dx = S.dy = 0; stickEl.classList.add('idle'); stickEl.classList.remove('on'); knob.style.transform = ''; placeStickIdle(); };
  zone.addEventListener('pointerup', endStick); zone.addEventListener('pointercancel', endStick); zone.addEventListener('lostpointercapture', endStick);
  function moveStick(e) { const mr = mt.getBoundingClientRect(), k = MOB.k, rad = 50 * k;
    let dx = e.clientX - mr.left - S.x, dy = e.clientY - mr.top - S.y; const m = Math.hypot(dx, dy);
    if (m > rad) { /* drag the base along when the thumb runs past it, the way phone sticks do */ if (!MS.fixed) { const over = m - rad; S.x += dx / m * over; S.y += dy / m * over; stickEl.style.left = S.x + 'px'; stickEl.style.top = S.y + 'px'; } dx = dx / m * rad; dy = dy / m * rad; }
    S.dx = dx / rad; S.dy = dy / rad; knob.style.transform = `translate(${dx}px,${dy}px)`; }

  /* stick → movement keys, every update, so nothing is lost between frames */
  const SK = { a: false, d: false, s: false, w: false };
  function setK(k, v) { if (SK[k] === v) return; SK[k] = v; keys[k] = v; }
  function applyStick() {
    const dx = S.dx, dy = S.dy, m = Math.hypot(dx, dy);
    if (S.id == null || m < .22) { setK('a', false); setK('d', false); setK('s', false); setK('w', false); return; }
    const ang = Math.atan2(-dy, dx) * 180 / Math.PI; /* 0 right, 90 up */
    /* down and up need a clear push, so running diagonally never drops you through a plank by accident */
    setK('d', dx > .28 && Math.abs(ang) < 75); setK('a', dx < -.28 && Math.abs(ang) > 105);
    setK('s', dy > .55 && ang < -55 && ang > -125); setK('w', dy < -.6 && ang > 55 && ang < 125);
  }
  /* aim: the stick's direction (snapped to eight), or the nearest foe when the stick rests */
  let assistTarget = null;
  function heroScr() { return { x: (P.x - camR.x - camPX) * camZ + camPX, y: (P.y - 18 - camR.y - camPY) * camZ + camPY }; }
  function nearestFoe() { if (!P || !enemies) return null; let best = null, bd = 1e9;
    for (const e of enemies) { if (e.dead || e.hidden || e.intro || e.friendly) continue; const ex = e.x - P.x, ey = (e.y - (e.h || 20) / 2) - (P.y - 18);
      if (Math.abs(ey) > 90) continue; const d = Math.hypot(ex * (Math.sign(ex) === P.face ? 1 : 1.6), ey * 1.3); if (d < bd && d < 150) { bd = d; best = e; } }
    return best; }
  function aimTick() {
    if (!P || P.dead) return;
    const dx = S.dx, dy = S.dy, m = Math.hypot(dx, dy);
    if (S.id != null && m > .35) { let a = Math.atan2(dy, dx); const sn = Math.PI / 4; a = Math.round(a / sn) * sn; MOB.aimV = { x: Math.cos(a), y: Math.sin(a) }; assistTarget = null; }
    else if (MS.assist) { const e = nearestFoe(); assistTarget = e; MOB.aimV = e ? null : { x: P.face, y: 0 }; }
    else { MOB.aimV = { x: P.face, y: 0 }; assistTarget = null; }
    aimMouse = !!(assistTarget || (S.id != null && m > .35)) && !(P.attack && P.attack.mv && P.attack.mv.t === 'shoot' && false);
  }
  function steerAimForPress() { aimTick(); }
  const oMW = mouseWorld;
  mouseWorld = function () { if (!MOB.on || !P) return oMW(); if (assistTarget && !assistTarget.dead) return { x: assistTarget.x, y: assistTarget.y - (assistTarget.h || 20) * .55 };
    const v = MOB.aimV || { x: P.face, y: 0 }; return { x: P.x + v.x * 90, y: P.y - 18 + v.y * 90 }; };
  (function () { const o = update; update = function (dt) { if (mode === 'play' && P) { applyStick(); aimTick(); } return o.apply(this, arguments); }; })();

  /* ---------- 4. per-frame: show what applies ---------- */
  let lastVis = null, actTxt = '';
  const strip = h => String(h || '').replace(/<kbd>[^<]*<\/kbd>/g, '').replace(/<[^>]+>/g, '').replace(/\s*·\s*$/, '').replace(/^\s*[·:\-–]\s*/, '').trim();
  function actGlyph(t) { t = t.toLowerCase(); if (/finish|止め/.test(t)) return '止'; if (/open|chest|coffer|reliquar/.test(t)) return '開'; if (/take|pick/.test(t)) return '取'; if (/talk|speak|merchant|ilse|tengu|kurohana/.test(t)) return '話';
    if (/kneel|stone|pray|answer/.test(t)) return '跪'; if (/door|descend|climb|go|exit|enter|leave/.test(t)) return '門'; if (/sleep|bed|rest/.test(t)) return '眠'; if (/read|letter|map/.test(t)) return '読'; return '手'; }
  let lastMode = null;
  function tick() {
    requestAnimationFrame(tick);
    if (mode !== lastMode) { lastMode = mode; const t = $('#tip'); if (t) t.hidden = true; if (mode !== 'inv' && !sheet.hidden) closeSheet(); }
    const shp = stage.clientHeight + 'px'; if (stage.style.getPropertyValue('--sh') !== shp) stage.style.setProperty('--sh', shp);
    const vis = mode === 'play' && !hud.hidden && !(P && P.dead);
    if (vis !== lastVis) { mt.hidden = !vis; lastVis = vis; if (vis) layout(); else releaseAll(); }
    if (!vis || !P) return;
    $('#hud').classList.toggle('boss', !!enemies.find(e => e.boss && !e.intro && !e.dead));
    /* draughts */
    const n = P.potions | 0; const pn = btns.pot.querySelector('.n'); if (pn.textContent !== String(n)) pn.textContent = n; btns.pot.classList.toggle('dim', n <= 0);
    /* off hand: only with something in it */
    btns.off.classList.toggle('off', !(P.equip && P.equip.off));
    /* arts mirror the HUD's own cooldowns */
    document.querySelectorAll('#abar .ab').forEach(el => { const b = btns[el.dataset.k]; if (!b) return; const on = el.classList.contains('on'); b.classList.toggle('off', !on);
      if (on) { const cd = el.style.getPropertyValue('--cd') || '0'; b.style.setProperty('--cd', cd); b.classList.toggle('ready', el.classList.contains('ready')); } });
    /* skill points */
    const sp = P.sp | 0; bSp.style.display = sp > 0 ? '' : 'none'; const sps = bSp.querySelector('.c'); if (sps.textContent !== String(sp)) { sps.textContent = sp; layout(); }
    bMap.style.display = L && L.def && L.def.kind === 'cabin' ? 'none' : '';
    const uf = typeof underfoot === 'function' ? underfoot() : []; look.classList.toggle('off', !uf.length);
    /* the context button: a boss kneeling, else whatever the world offers */
    let txt = '', key = 'e', fin = false;
    const ft = typeof finTarget === 'function' ? finTarget() : null;
    if (ft) { txt = 'Finish it'; key = 'f'; fin = true; }
    else if (typeof interact !== 'undefined' && interact) txt = strip(interact.txt) || 'Use';
    if (txt) { if (txt !== actTxt) { actTxt = txt; act.querySelector('.t').textContent = txt; act.querySelector('.g').textContent = fin ? '止' : actGlyph(txt); } act.dataset.key = key; act.classList.remove('off'); act.classList.toggle('fin', fin); }
    else { act.classList.add('off'); actTxt = ''; }
  }
  function releaseAll() { for (const id in MOB.held) { const o = LAYOUT[id]; if (o) keyEv('keyup', o.key); btns[id].classList.remove('down'); } MOB.held = {};
    S.id = null; S.dx = S.dy = 0; stickEl.classList.add('idle'); knob.style.transform = ''; setK('a', false); setK('d', false); setK('s', false); setK('w', false); mouseHeld = false; }
  MOB.releaseAll = releaseAll;
  requestAnimationFrame(tick);

  /* ---------- 5. words: no keyboard on a phone ---------- */
  if (typeof LESSONS !== 'undefined') {
    const T2 = { 0: 'Push the <b>stick</b> to walk · <b>跳 Jump</b> · hold it to jump higher', 2: 'Tap <b>斬 Strike</b> · hold it to keep swinging · the blade follows the stick, or finds the nearest foe',
      6: '<b>転 Roll</b> · nothing can touch you mid-roll', 8: '<b>薬 Drink</b> heals. You carry two.', 9: 'Tap the gold button to open a chest. Watch the reel.' };
    for (const i in T2) if (LESSONS[i]) LESSONS[i].t = T2[i];
  }
  const ll = $('#lvlup span'); if (ll) ll.textContent = 'A skill point. Tap 技.';
  /* text written by modules at runtime: swap key words for touch words where they're shown */
  const SWAP = [[/Go to it and press F to finish it\./, 'Go to it and tap Finish.'], [/\bPress F\b|\bpress F\b/g, 'tap Finish'], [/Click · E — next/i, 'Tap for the next page'], [/\s*Esc — skip/i, ''],
    [/Click or right-click to wear · right-click puts a weapon in your off hand once you've learned it · shift-click to drop/, 'Tap an item to see it and what you can do with it · drag to move it'],
    [/\bA skill point\. Press T\./, 'A skill point. Tap 技.'], [/Drag to move or wear · right-click: off hand · shift-click: drop/, 'Tap an item to see it · drag to move or wear'],
    [/Right-click or K to use it\./, 'The off-hand button uses it.'], [/\s*· or shift-click an item to drop it/, ''], [/\bClick\b/g, 'Tap'], [/\bclick\b/g, 'tap']];
  function swapText(root) { const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n; const hits = [];
    while ((n = w.nextNode())) { const v = n.nodeValue; if (!v || v.length < 3) continue; let o = v; for (const [re, to] of SWAP) o = o.replace(re, to); if (o !== v) hits.push([n, o]); }
    for (const [n2, o] of hits) n2.nodeValue = o; }
  /* manga pages: tap anywhere for the next page; a real Skip button, since there's no Esc */
  function mangaSkip(el) { if (el.querySelector('.mgSkip')) return; const b = document.createElement('button'); b.className = 'btn ghost mgSkip'; b.textContent = 'Skip';
    b.style.cssText = 'position:absolute;right:max(14px,env(safe-area-inset-right));bottom:max(10px,env(safe-area-inset-bottom));margin:0;z-index:5;min-height:36px;padding:4px 16px;font-size:13px;background:rgba(8,5,6,.7)';
    b.addEventListener('pointerdown', e => e.stopPropagation()); b.onclick = e => { e.stopPropagation(); tapKey('Escape'); }; el.appendChild(b); }
  new MutationObserver(ms => { for (const m of ms) for (const nd of m.addedNodes) { if (nd.nodeType === 1) { swapText(nd); if (nd.id === 'manga') mangaSkip(nd); } else if (nd.nodeType === 3 && nd.parentNode) swapText(nd.parentNode); } })
    .observe(stage, { childList: true, subtree: true, characterData: false });
  swapText(stage);

  /* ---------- 6. menus by touch ---------- */
  /* tooltips stay up after the finger lifts; the next touch somewhere else puts them away */
  addEventListener('pointerleave', e => { if (e.pointerType === 'touch' && e.target !== window && e.target.closest && !e.target.closest('#mt')) e.stopImmediatePropagation(); }, true);
  addEventListener('pointerout', e => { if (e.pointerType === 'touch' && e.target.closest && !e.target.closest('#mt')) e.stopImmediatePropagation(); }, true);
  addEventListener('pointerover', e => { if (e.pointerType === 'touch' && !(e.target.closest && e.target.closest('#tip'))) { const t = $('#tip'); if (t) t.hidden = true; } }, true);
  /* page bounce and pinch: off, except inside things that scroll */
  document.addEventListener('touchmove', e => { const t = e.target; if (t.closest && t.closest('.screen,#mSheet .tx,.scroll,#codex,.cxList,.cxBody,#setScr,.mapUi')) return; e.preventDefault(); }, { passive: false });
  document.addEventListener('gesturestart', e => e.preventDefault());
  document.addEventListener('dblclick', e => e.preventDefault(), { passive: false });

  /* the item sheet: what the item is, and the things you can do with it */
  const sheet = document.createElement('div'); sheet.id = 'mSheet'; sheet.hidden = true; stage.appendChild(sheet);
  function closeSheet() { sheet.hidden = true; sheet._it = null; document.querySelectorAll('.gitem.msel,.slot.msel').forEach(x => x.classList.remove('msel')); }
  MOB.closeSheet = closeSheet;
  function openSheet(it, el, actions) {
    const t = $('#tip'); if (t) t.hidden = true;
    document.querySelectorAll('.gitem.msel,.slot.msel').forEach(x => x.classList.remove('msel')); if (el) el.classList.add('msel');
    const sr = stage.getBoundingClientRect(), r = el ? el.getBoundingClientRect() : null;
    sheet.classList.toggle('left', !!(r && (r.left + r.width / 2 - sr.left) > sr.width * .55));
    sheet.innerHTML = `<div class="tx">${tipHTML(it)}${typeof compareHTML === 'function' ? compareHTML(it) : ''}</div><div class="bt"></div>`;
    const bt = sheet.querySelector('.bt');
    for (const a of actions.concat([{ t: 'Close', f: () => {} }])) { const b = document.createElement('button'); b.className = 'btn ghost' + (a.pri ? ' pri' : ''); b.textContent = a.t;
      b.onclick = ev => { ev.stopPropagation(); closeSheet(); a.f(); }; bt.appendChild(b); }
    sheet.hidden = false; sheet._it = it; if (typeof sigApply === 'function') try { sigApply(sheet); } catch (_) {}
  }
  addEventListener('pointerdown', e => { if (sheet.hidden) return; if (e.target.closest('#mSheet') || e.target.closest('.gitem') || e.target.closest('.slot')) return; closeSheet(); }, true);
  const fakeE = (o) => Object.assign({ shiftKey: false, button: 0, preventDefault() {}, stopPropagation() {} }, o || {});
  function sheetActions(D, opt) {
    const it = D.it, hid = D.holder && D.holder.id, inInv = mode === 'inv';
    if (!D.G) return [{ t: 'Take off', pri: 1, f: () => D.onClick && D.onClick(fakeE()) }];
    const i = D.G.list().indexOf(it); if (i < 0) return [];
    const call = (o) => opt.click && opt.click(it, i, fakeE(o));
    if (inInv && typeof SHOP !== 'undefined' && SHOP.sell) return [{ t: 'Sell', pri: 1, f: () => call() }];
    if (hid === 'sbBag') return [{ t: 'To the stash', pri: 1, f: () => call() }];
    if (hid === 'sbStash') return [{ t: 'To the satchel', pri: 1, f: () => call() }];
    if (inInv && hid === 'bag') { const a = [];
      if (it.slot === 'weapon' && it.base.h === 0) a.push({ t: 'Wear (off hand)', pri: 1, f: () => call() });
      else a.push({ t: 'Wear', pri: 1, f: () => call() });
      if (it.slot === 'weapon' && it.base.h !== 0 && typeof has === 'function' && has('off') && opt.context && (it.base.h !== 2 || P.way === 'giant')) a.push({ t: 'Off hand', f: () => opt.context(it, i, fakeE()) });
      a.push({ t: 'Drop', f: () => call({ shiftKey: true }) });
      return a; }
    return [{ t: 'Choose', pri: 1, f: () => call() }];
  }
  if (typeof bagDragUp === 'function') { const o = bagDragUp;
    bagDragUp = function (e) { const D = BAGDRAG; if (!D || D.on || e.pointerType === 'mouse') return o.apply(this, arguments);
      unbindDrag(); BAGDRAG = null; endDragVisuals(D); const opt = (D.holder && D.holder._opt) || {};
      if (sheet._it === D.it && !sheet.hidden) { closeSheet(); return; }
      openSheet(D.it, D.el, sheetActions(D, opt)); };
    /* startBagDrag and unbindDrag look bagDragUp up by name each time, so they pick this one up */
  }
  /* skills: the first tap shows what it does, the second learns it */
  let armed = null;
  addEventListener('click', e => { const n = e.target.closest && e.target.closest('#tree .node'); if (!n) { if (armed) { armed.classList.remove('arm'); armed = null; } return; }
    if (armed === n) { armed.classList.remove('arm'); armed = null; return; } /* second tap: let it through */
    e.stopImmediatePropagation(); e.preventDefault(); if (armed) armed.classList.remove('arm'); armed = n; n.classList.add('arm');
    n.dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'mouse' })); }, true);
  /* the satchel has no Back button on desktop (I or Esc closes it): a close button for thumbs */
  const invX = document.createElement('button'); invX.className = 'mClose'; invX.setAttribute('aria-label', 'Close');
  invX.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 2l10 10M12 2 2 12" stroke="#e8dcc0" stroke-width="2"/></svg>';
  invX.onclick = e => { e.stopPropagation(); closeSheet(); tapKey('Escape'); }; const invEl = $('#inv'); if (invEl) invEl.appendChild(invX);
  /* the seal pocket moves under the worn gear, so the satchel grid fits the screen */
  if (typeof renderInv === 'function') { const o = renderInv; renderInv = function () { const r = o.apply(this, arguments);
    const pk = document.querySelector('#paneBag .sealPocket'), worn = document.querySelector('#paneBag .panel'); if (pk && worn && pk.parentElement !== worn) worn.appendChild(pk); return r; }; }
  /* the satchel's level box: tap to spend points */
  const lb = $('.lvlbox'); if (lb) { lb.style.pointerEvents = 'auto'; lb.addEventListener('click', () => { if (mode === 'play' && P && P.sp > 0) tapKey('t'); }); }

  /* ---------- 7. settings: a Touch panel, the Controls tab explains the touch layout ---------- */
  if (typeof openSettings === 'function') { const o = openSettings;
    openSettings = function (from) { o.apply(this, arguments); const s = $('#setScr'); if (!s) return;
      const kg = s.querySelector('.keyGrid'); if (kg) kg.innerHTML = [['Stick', 'Move · aim · down to drop through or plunge · up to climb'], ['斬 Strike', 'Hold to keep swinging'], ['跳 Jump', 'Hold to jump higher'], ['転 Roll', 'Nothing touches you mid-roll'],
        ['副 Off hand', 'Shown when you hold something in it'], ['薬 Drink', 'A draught'], ['血 鎖 獣 鐘', 'Your arts, once learned'], ['Gold button', 'Open · take · talk · finish a kneeling boss'], ['袋 地', 'Satchel · map'], ['技', 'Skill points to spend']]
        .map(([k, a]) => `<div><b style="font-family:var(--fs);font-weight:400;color:var(--ember)">${k}</b><span>${a}</span></div>`).join('');
      const tb = s.querySelector('.tabs .tab[data-t="keys"]'); if (tb) tb.textContent = 'Touch';
      const grid = s.querySelector('.setGrid'); if (!grid) return;
      const p = document.createElement('div'); p.className = 'panel'; const row = (lab, html, tip) => (typeof setRow === 'function' ? setRow(lab, html, tip) : `<label>${lab} ${html}</label>`);
      p.innerHTML = `<h3>Touch</h3>
        ${row('Aim assist', `<input type="checkbox" id="mAssist"${MS.assist ? ' checked' : ''}>`, 'With the stick at rest, you turn to the nearest foe.')}
        ${row('Fixed stick', `<input type="checkbox" id="mFixed"${MS.fixed ? ' checked' : ''}>`, 'Off: the stick appears under your thumb.')}
        ${row('Left-handed', `<input type="checkbox" id="mMirror"${MS.mirror ? ' checked' : ''}>`, 'Buttons on the left, stick on the right.')}
        ${row('Haptics', `<input type="checkbox" id="mHap"${MS.haptics ? ' checked' : ''}>`, 'A light tap under your thumb.')}
        ${row('Button size', `<input type="range" id="mSize" min="0.8" max="1.3" step="0.05" value="${MS.size}">`)}`;
      grid.appendChild(p);
      const v = id => p.querySelector('#' + id);
      v('mAssist').onchange = e => { MS.assist = e.target.checked; saveMS(); };
      v('mFixed').onchange = e => { MS.fixed = e.target.checked; saveMS(); };
      v('mMirror').onchange = e => { MS.mirror = e.target.checked; saveMS(); layout(); };
      v('mHap').onchange = e => { MS.haptics = e.target.checked; saveMS(); haptic(); };
      v('mSize').oninput = e => { MS.size = +e.target.value; saveMS(); layout(); };
    }; }

  /* ---------- 8. turn your phone, install for full screen, stay awake, pause when away ---------- */
  const rot = document.createElement('div'); rot.id = 'mRot'; rot.innerHTML = '<b>回</b><div class="ph"></div><div>Turn your phone sideways</div><p>Marrowdeep is played in landscape.</p>'; document.body.appendChild(rot);
  const portrait = () => innerHeight > innerWidth;
  function onOrient() { fit(); layout(); if (portrait() && mode === 'play' && !(typeof COOP !== 'undefined' && COOP)) { releaseAll(); openPause(); } }
  addEventListener('orientationchange', () => setTimeout(onOrient, 250)); matchMedia('(orientation: portrait)').addEventListener('change', () => setTimeout(onOrient, 250));
  document.addEventListener('visibilitychange', () => { if (document.hidden) { releaseAll(); if (mode === 'play' && !(typeof COOP !== 'undefined' && COOP)) openPause(); try { AU.c && AU.c.suspend(); } catch (_) {} }
    else { try { AU.c && AU.c.resume(); } catch (_) {} wake(); } });
  addEventListener('touchend', () => { try { if (AU.c && AU.c.state !== 'running') AU.c.resume(); } catch (_) {} }, { passive: true });
  let lock = null; async function wake() { try { if ('wakeLock' in navigator && !document.hidden && !lock) { lock = await navigator.wakeLock.request('screen'); lock.addEventListener('release', () => { lock = null; }); } } catch (_) {} }
  addEventListener('pointerdown', () => { wake(); goFull(); }, { capture: true, passive: true });
  /* Android and iPad: real full screen on the first touch (iPhone Safari has none; the home-screen app is full screen) */
  let triedFull = false; function goFull() { if (triedFull || document.fullscreenElement) return; triedFull = true; const el = document.documentElement;
    try { const p = (el.requestFullscreen || el.webkitRequestFullscreen).call(el, { navigationUI: 'hide' }); if (p && p.then) p.then(() => { try { screen.orientation.lock('landscape').catch(() => {}); } catch (_) {} }).catch(() => {}); } catch (_) {} }
  const iOS = /iP(hone|od|ad)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = document.documentElement.classList.contains('standalone');
  if (iOS && !standalone && !store.get('marrowdeep.instSeen')) {
    const c = document.createElement('div'); c.id = 'mInst';
    c.innerHTML = `<svg width="22" height="28" viewBox="0 0 22 28"><path d="M11 2v15M6 7l5-5 5 5" stroke="#dccfb2" stroke-width="2" fill="none"/><path d="M4 11H2v15h18V11h-2" stroke="#dccfb2" stroke-width="2" fill="none"/></svg>
      <div><b style="font-weight:400;color:var(--gold)">Play full screen.</b> Tap <b style="font-weight:400">Share</b>, then <b style="font-weight:400">Add to Home Screen</b>, and open Marrowdeep from there.</div><button class="btn ghost">Got it</button>`;
    c.querySelector('button').onclick = () => { store.set('marrowdeep.instSeen', 1); c.remove(); };
    const t = $('#title'); if (t) t.appendChild(c);
  }

  layout(); fit();
})();
