'use strict';
const $=id=>document.getElementById(id),cv=$('scene'),screen=cv.getContext('2d'),world=document.createElement('canvas');world.width=world.height=680;const c=world.getContext('2d');
let art,nodes=[],cards=[],time=0,animate=!matchMedia('(prefers-reduced-motion: reduce)').matches,zoom=1,pan={x:0,y:0},drag=null,selected=null,ready=false;
let effectPhase=.42,effectDirection=1;
const effectCanvas=document.createElement('canvas');effectCanvas.width=160;effectCanvas.height=104;
$('effectReduced').checked=matchMedia('(prefers-reduced-motion: reduce)').matches;
const polar=(r,a)=>({x:Math.round(Math.cos(a)*r),y:Math.round(Math.sin(a)*r)});
function buildNodes(){nodes=[];
  const add=(entry,r,a,extra={})=>{const p=polar(r,a);nodes.push({entry,...p,state:'reachable',...extra});return nodes[nodes.length-1];};
  art.catalogue.filter(n=>n.group==='Brands').forEach((n,i)=>{const a=i*Math.PI*2/9-Math.PI/2,b=add(n,80,a,{state:i<3?'allocated':'reachable'});art.catalogue.filter(v=>v.parent===n.name).forEach((f,j)=>add(f,111,a+(j?1:-1)*.14,{parent:b,state:i<3?(j?'refusable':'allocated'):'locked'}));});
  ['might','finesse','fortitude'].forEach((role,i)=>art.catalogue.filter(n=>n.group==='Attributes'&&n.role===role).forEach((n,j)=>add(n,j===6?157:144,(i+j/7)*Math.PI*2/3-Math.PI/2,{state:j<2?'allocated':'reachable'})));
  art.order.forEach((element,i)=>{const a=i*Math.PI/5-Math.PI/2+Math.PI/10,es=art.catalogue.filter(n=>n.group==='Elements'&&n.element===element);es.forEach((n,j)=>add(n,j===0?181:j===4?263:221,a+(j>0&&j<4?(j-2)*.14:0),{state:i===6||i===7?'allocated':j===0?'reachable':'locked'}));const bridge=art.catalogue.find(n=>n.group==='Bridges'&&n.element===element);add(bridge,242,a+Math.PI/10,{state:i===6?'preview':'locked'});});
  add(art.catalogue.find(n=>n.kind==='paradox'),184,-Math.PI/2,{state:'reachable'});
}
function setup(){const v=$('view').value;cards=[];$('gallery').replaceChildren();$('gallery').classList.toggle('effects-grid',['effects','combat2','brands3','shades4','brands5','elements6','environment7'].includes(v));$('stage').hidden=['frames','icons','glyphs','pictures8','attributes9','details','effects','combat2','brands3','shades4','brands5','elements6','environment7'].includes(v);$('effectControls').hidden=!['effects','combat2','brands3','shades4','brands5','elements6','environment7'].includes(v);$('detail').replaceChildren();selected=null;
  if(v==='tree'){pan={x:0,y:0};zoom=1;$('sceneTitle').textContent='The inner cathedral';}
  if(v==='wedge'){pan={x:185,y:-130};zoom=3;$('sceneTitle').textContent='Water / the rising tide';}
  if(v==='path'){pan={x:210,y:-65};zoom=3;$('sceneTitle').textContent='Water → Bone';}
  if(v==='frames')for(const kind of Object.keys(art.sizes))card(kind,`${art.sizes[kind]} × ${art.sizes[kind]} · five states`,(g,w,h,t)=>{art.states.forEach((state,i)=>{g.save();g.translate(Math.round(w*(i+.5)/5),Math.round(h/2));g.scale(2,2);art.frame(g,kind,0,0,{state,time:t,color:art.elements.water,color2:art.elements.bone,role:'might',both:true});g.restore();});},true);
  if(v==='icons'){const term=$('search').value.toLowerCase();for(const n of art.catalogue.filter(n=>(n.name+' '+n.group+' '+(n.element||'')).toLowerCase().includes(term)))card(n.name,`${n.group} · ${n.kind} · ${n.art==='picture'?'illustrated icon':n.art==='frame'?'unique frame':'sigil fallback'}`,(g,w,h,t)=>{g.save();g.translate(Math.round(w/2),Math.round(h/2));g.scale(zoom,zoom);art.node(g,n,0,0,{time:t,state:'reachable'});g.restore();});}
  $('gallery').classList.toggle('illustrated-grid',['pictures8','attributes9'].includes(v));
  for(const id of ['zoom','plus','minus']){$(id).disabled=['pictures8','attributes9'].includes(v);$(id).title=['pictures8','attributes9'].includes(v)?'This comparison fixes the drawings at native size and 3×. Use All node icons for adjustable zoom.':'';}
  if(['pictures8','attributes9'].includes(v)){
    zoom=3;
    const term=$('search').value.toLowerCase();
    for(const n of art.catalogue.filter(n=>n.art==='picture'&&(v==='attributes9'?n.group==='Attributes':n.group!=='Attributes')&&(n.name+' '+(n.parent||'')+' '+(n.role||'')).toLowerCase().includes(term))){
      card(n.name,`${n.group} · ${n.iconSize} × ${n.iconSize} interior${n.role?' · '+n.role:''}`,(g,w,h,t)=>{
        art.node(g,n,42,75,{state:'reachable',time:t});g.save();g.translate(166,75);g.scale(3,3);art.node(g,n,0,0,{state:'reachable',time:t});g.restore();
        g.fillStyle='#8a847e';g.font='10px system-ui';g.textAlign='center';g.fillText('Native 1×',42,145);g.fillText('3×',166,145);
        art.states.forEach((state,i)=>{art.node(g,n,26+i*52,190,{state,time:t});g.fillStyle='#8a847e';g.fillText(state,26+i*52,222);});g.textAlign='left';
      });const canvas=cards[cards.length-1].canvas;canvas.width=260;canvas.height=240;canvas.setAttribute('aria-label',n.name+' at native size, 3× and all five states');
    }
  }
  if(v==='glyphs')for(const name of art.glyphs)card(name,'8 × 8 · native glyph',(g,w,h)=>{g.save();g.translate(Math.round(w/2),Math.round(h/2));g.scale(zoom+2,zoom+2);art.glyph(g,name,0,0,art.palette.bone);g.restore();});
  if(v==='details'){
    card('The Heart','64 × 64 · four-frame pulse',(g,w,h,t)=>{g.save();g.translate(w/2,h/2);g.scale(2,2);art.heart(g,0,0,t,!animate);g.restore();});
    card('The Spine','Six vertebrae',(g,w,h)=>{for(let i=0;i<6;i++){g.save();g.translate(w/2-75+i*30,h/2);g.scale(2,2);art.vertebra(g,0,0,{state:i<3?'allocated':'reachable'});g.restore();}});
    for(const state of ['unallocated','allocated','preview','chain','braid'])card(state+' link','Deterministic · time supplied by caller',(g,w,h,t)=>art.connection(g,{x:20,y:h/2+15},{x:w-20,y:h/2-15},{state:state==='braid'?'allocated':state,time:t,chain:state==='chain',braid:state==='braid',reducedMotion:!animate}));
    card('Ribcage tab','16 × 16',(g,w,h)=>{g.save();g.translate(w/2,h/2);g.scale(4,4);art.ribcage(g,0,0);g.restore();});
    card('Sigil socket','Empty / seated future variant',(g,w,h)=>{for(let i=0;i<2;i++){g.save();g.translate(w*(i+.5)/2,h/2);g.scale(3,3);art.frame(g,'socket',0,0,{filled:!!i,color:art.elements.shadow,state:'locked'});g.restore();}});
  }
  if(v==='effects'){
    zoom=3;
    for(const spec of art.effectSpecs)effectCard(spec.name,`${spec.duration.toFixed(1)} s · ${spec.family==='slam'?'leap → impact → settle':spec.family==='ward'?'form → hold → break':'six-tile floor wave'}`,spec);
    for(const pose of ['leap','crash'])effectCard('Hero / '+pose,'Authored stance · neutral armour study',{pose});
  }
  if(v==='combat2'){
    zoom=3;for(const spec of art.combatSpecs)effectCard(spec.name,`${spec.duration.toFixed(1)} s · ${spec.family==='thrall'?'splinter skeleton':spec.id==='sanguine-shell'?'blood film / shield above life':spec.id==='bone-plate'?'three plates / successive breaks':spec.kanji+' / combo study'}`,{...spec,batch:2});
  }
  if(v==='brands3'){zoom=3;for(const spec of art.brandSpecs)effectCard(spec.name,`${spec.duration.toFixed(1)} s · ${spec.note}`,{...spec,batch:3});}
  if(v==='shades4'){zoom=3;for(const spec of art.shadeSpecs)effectCard(spec.name,`${spec.duration.toFixed(1)} s · ${spec.note}`,{...spec,batch:4});}
  if(v==='brands5'||v==='elements6'){zoom=3;for(const spec of art.remainingSpecs.filter(s=>s.family===(v==='brands5'?'brands':'elements')))effectCard(spec.name,`${spec.duration.toFixed(1)} s · ${spec.note}`,{...spec,batch:v==='brands5'?5:6});}
  $('environmentControl').hidden=v!=='environment7';
  if(v==='environment7'){zoom=3;for(const spec of art.environmentSpecs)effectCard(spec.name,spec.note,{...spec,batch:7,duration:3});}
  $('zoom').value=zoom;$('zoomValue').value=zoom+'×';$('status').textContent=cards.length?cards.length+' studies':'109 nodes · pure rendering';resize();paint();
}
function card(name,note,draw,wide=false){const el=document.createElement('article');el.className='card'+(wide?' frame-card':'');const title=document.createElement('h2');title.textContent=name;const p=document.createElement('p');p.textContent=note;const canvas=document.createElement('canvas');canvas.width=wide?500:240;canvas.height=wide?150:160;el.append(title,p,canvas);if(wide){const labels=document.createElement('div');labels.className='states';for(const state of art.states){const label=document.createElement('span');label.textContent=state;labels.append(label);}el.append(labels);}$('gallery').append(el);cards.push({canvas,draw});}
function effectCard(name,note,spec){
  card(name,note,(g,w,h)=>{
    const f=effectCanvas.getContext('2d');f.setTransform(1,0,0,1,0,0);f.fillStyle='#151110';f.fillRect(0,0,160,104);f.imageSmoothingEnabled=false;
    // A quiet ground reference makes travel and height legible at gameplay scale.
    f.fillStyle='#312823';f.fillRect(0,90,160,14);f.fillStyle='#655448';f.fillRect(0,90,160,1);
    for(let i=0;i<10;i++){f.fillStyle='#211b18';f.fillRect(i*16,92,1,12);f.fillStyle='#4a3b31';f.fillRect(i*16+4,96,5,1);}
    const wave=spec.family==='wave',x=wave?(effectDirection<0?138:22):80,wet=spec.variant==='water',age=effectPhase*(spec.duration||1);
    if(wet){f.fillStyle='#193d56';f.fillRect(0,87,160,3);f.fillStyle='#2b6d98';for(let i=0;i<10;i++)f.fillRect(i*16+3,87,8,1);}
    const opt={hero:true,direction:effectDirection,reducedMotion:$('effectReduced').checked,seed:7};
    if(spec.batch===7)art.environment(f,spec.id,x,88,age,{...opt,state:environmentState(spec)});else if(spec.batch>=5)art.remainingEffect(f,spec.id,x,88,age,opt);else if(spec.batch===4)art.shadeEffect(f,spec.id,x,88,age,opt);else if(spec.batch===3)art.brandEffect(f,spec.id,x,88,age,opt);else if(spec.batch===2)art.combatEffect(f,spec.id,x,88,age,opt);else if(spec.pose)art.heroPose(f,80,80,spec.pose,opt);else art.effect(f,spec.id,x,88,age,opt);
    g.fillStyle='#151110';g.fillRect(0,0,w,h);g.imageSmoothingEnabled=false;g.drawImage(effectCanvas,Math.round((w-160*zoom)/2),Math.round((h-104*zoom)/2),160*zoom,104*zoom);
  });
  const entry=cards[cards.length-1];entry.canvas.width=500;entry.canvas.height=320;
  entry.canvas.setAttribute('aria-label',name+' animated art preview');
  const badge=document.createElement('p');badge.style.color='#ffd27a';badge.dataset.phase=spec.id||spec.pose;entry.canvas.after(badge);entry.spec=spec;entry.badge=badge;
  if(spec.family==='combo'){const wrap=document.createElement('div');wrap.className='effect-stage';entry.canvas.before(wrap);wrap.append(entry.canvas);entry.popup=art.comboPopup(document,spec.id);wrap.append(entry.popup);}
}
function resize(){cv.style.height=Math.max(180,innerHeight-document.querySelector('header').offsetHeight-document.querySelector('footer').offsetHeight)+'px';const r=cv.getBoundingClientRect();cv.width=Math.max(1,Math.round(r.width));cv.height=Math.max(1,Math.round(r.height));}
function transform(){return {scale:Math.min(cv.width/650,cv.height/650)*zoom,cx:Math.round(cv.width/2),cy:Math.round(cv.height/2)};}
function brandPhaseLabel(s,a){const phase=s.id==='heart-spike'?(a<.35?'Lance':a<.7?'Stagger':'Blood fall'):s.id==='black-iron'?(a<.45?'Idle':a<.8?'Brace':a<1.2?'Strike':'Recover'):s.id==='red-maw'?(a<.25?'Brace':a<.8?'Bloody strike':'Recover'):s.id==='thunder-draw'?(a<.18?'Sheathed':a<.58?'Cuts':'Lightning wounds'):(a<.6?'Charge glint':a<1.36?'Wide crescent':'Settle');return `${a.toFixed(2)} / ${s.duration.toFixed(2)} s · ${phase}`;}
function shadePhaseLabel(s,a){return `${a.toFixed(2)} / ${s.duration.toFixed(2)} s · `+(s.id==='marking-shade'?(a<.3?'Shade forms':a<.55?'Copied cut':'Mark remains'):s.id==='decoy'?(a<.4?'Hero targeted':a<.9?'Locks transfer':'Shade targeted'):a<.65?'Blades falling':'Impact / settle');}
function remainingPhaseLabel(s,a){const q=a/s.duration;return `${a.toFixed(2)} / ${s.duration.toFixed(2)} s · `+(s.id==='necrosis'?(1+Math.floor(q*11))+' rot stacks':s.id==='funeral-pyre'?(q<.48?'Smoulder':'Detonation'):s.id==='storm-conduit'?(q<.55?'Stored charge':'Chain discharge'):s.id==='toll-for-me'?(q<.3?'Foes marked':'Hero targeted'):s.note);}
function environmentState(s){const selection=$('environmentState').value;return s.states[selection==='auto'?Math.min(s.states.length-1,Math.floor(effectPhase*s.states.length)):Math.min(s.states.length-1,+selection)];}
$('environmentState').onchange=()=>paint();
function paint(){if(!ready)return;const t=time;
  if(['effects','combat2','brands3','shades4','brands5','elements6','environment7'].includes($('view').value)){$('effectPhase').value=Math.round(effectPhase*1000);$('effectTime').value=Math.round(effectPhase*100)+'%';for(const card of cards){if(!card.spec)continue;const s=card.spec,a=effectPhase*(s.duration||1);card.badge.textContent=s.batch===7?environmentState(s):s.batch>=5?remainingPhaseLabel(s,a):s.batch===4?shadePhaseLabel(s,a):s.batch===3?brandPhaseLabel(s,a):s.batch===2?`${a.toFixed(2)} / ${s.duration.toFixed(2)} s · `+(s.family==='thrall'?s.pose:s.id==='bone-plate'?Math.max(0,3-Math.floor(a/.5))+' plates':s.id==='sanguine-shell'?Math.round((1-effectPhase)*100)+'% shield':s.name):s.pose?'Static pose':`${a.toFixed(2)} / ${s.duration.toFixed(2)} s · `+(s.family==='slam'?(a<.6?'Leap':a<1.35?'Impact':'Settle'):s.family==='ward'?(a<1?'Form':a<1.3?'Hold':'Break'):'Travel');if(card.popup){card.popup.style.top=(80-($('effectReduced').checked?0:a*18))+'px';card.popup.style.opacity=String(Math.max(0,Math.min(1,(1.5-a)*2)));}}}
  for(const {canvas,draw}of cards){const g=canvas.getContext('2d');g.clearRect(0,0,canvas.width,canvas.height);g.imageSmoothingEnabled=false;draw(g,canvas.width,canvas.height,t);}
  if($('stage').hidden)return;c.setTransform(1,0,0,1,0,0);c.fillStyle=art.palette.ink;c.fillRect(0,0,680,680);c.imageSmoothingEnabled=false;
  const {scale,cx,cy}=transform();c.save();c.translate(340,340);art.guides(c,0,0);
  for(const n of nodes){if(n.parent)art.connection(c,n.parent,n,{chain:true,time:t});else if(n.entry.group==='Elements'){const siblings=nodes.filter(v=>v.entry.element===n.entry.element&&v.entry.group==='Elements'),entry=siblings[0];if(n!==entry)art.connection(c,entry,n,{state:n.state==='allocated'?'allocated':'unallocated',time:t,reducedMotion:!animate});}}
  const water=nodes.find(n=>n.entry.name==='Rising Tide'),bridge=nodes.find(n=>n.entry.name==='Drowned Bones'),bone=nodes.find(n=>n.entry.name==='Bone Plate');
  for(const [a,b]of [[water,bridge],[bridge,bone]])art.connection(c,a,b,{state:'preview',time:t,braid:true,color:art.elements.water,color2:art.elements.bone,reducedMotion:!animate});
  art.connection(c,{x:0,y:-30},{x:0,y:-163},{state:'allocated',time:t,reducedMotion:!animate});for(let i=0;i<6;i++)art.vertebra(c,0,-43-i*22,{state:i<3?'allocated':'reachable'});
  const term=$('search').value.toLowerCase();for(const n of nodes)art.node(c,n.entry,n.x,n.y,{state:n.state,time:t,both:true,reducedMotion:!animate,match:!!term&&n.entry.name.toLowerCase().includes(term)});
  art.heart(c,0,0,t,!animate);c.restore();screen.fillStyle=art.palette.ink;screen.fillRect(0,0,cv.width,cv.height);screen.imageSmoothingEnabled=false;screen.drawImage(world,Math.round(cx+(pan.x-340)*scale),Math.round(cy+(pan.y-340)*scale),Math.round(680*scale),Math.round(680*scale));
  if($('view').value==='path'){screen.fillStyle='#34291e';screen.fillRect(cx-50,cv.height-55,100,25);screen.fillStyle=art.palette.bone;screen.font='12px system-ui';screen.textAlign='center';screen.fillText('7 points · preview',cx,cv.height-38);screen.textAlign='left';}
}
function setZoom(value){zoom=Math.max(1,Math.min(4,value));$('zoom').value=zoom;$('zoomValue').value=zoom+'×';paint();}
$('view').onchange=()=>ready&&setup();$('search').oninput=()=>{if(ready){if(['icons','pictures8','attributes9'].includes($('view').value))setup();else paint();}};$('zoom').oninput=()=>setZoom(+$('zoom').value);$('plus').onclick=()=>setZoom(zoom+1);$('minus').onclick=()=>setZoom(zoom-1);$('centre').onclick=()=>{pan={x:0,y:0};paint();};$('motion').onclick=()=>{animate=!animate;$('motion').setAttribute('aria-pressed',animate);paint();};$('motion').setAttribute('aria-pressed',animate);
$('effectPhase').oninput=()=>{animate=false;$('motion').setAttribute('aria-pressed','false');effectPhase=+$('effectPhase').value/1000;paint();};
$('effectRestart').onclick=()=>{effectPhase=0;animate=true;$('motion').setAttribute('aria-pressed','true');paint();};
$('effectFacing').onclick=()=>{effectDirection*=-1;$('effectFacing').setAttribute('aria-pressed',effectDirection<0);$('effectFacing').textContent=effectDirection<0?'Facing left':'Facing right';paint();};
$('effectReduced').onchange=paint;
cv.onpointerdown=e=>{drag={x:e.clientX,y:e.clientY,pan:{...pan},moved:false};cv.setPointerCapture(e.pointerId);};
cv.onpointermove=e=>{if(!ready)return;if(drag){const {scale}=transform(),dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.moved=drag.moved||Math.hypot(dx,dy)>4;pan={x:drag.pan.x+dx/scale,y:drag.pan.y+dy/scale};paint();}};
cv.onpointerup=e=>{if(!ready){drag=null;return;}if(drag&&!drag.moved){const r=cv.getBoundingClientRect(),{scale,cx,cy}=transform(),x=(e.clientX-r.left-cx)/scale-pan.x,y=(e.clientY-r.top-cy)/scale-pan.y;selected=nodes.find(n=>Math.hypot(n.x-x,n.y-y)<art.sizes[n.entry.kind]/2+4);$('detail').replaceChildren();if(selected){const n=selected.entry,h=document.createElement('h2'),p=document.createElement('p'),s=document.createElement('p');h.textContent=n.name;p.textContent=n.group+' / '+selected.state;s.textContent=n.parent?'Fork: takes the place of the other '+n.parent+' fork.':'Art specimen · '+(n.art==='picture'?'illustrated icon':n.art==='sigil'?'sigil fallback':'kintsugi seal');$('detail').append(h,p,s);}}drag=null;};cv.onpointercancel=()=>drag=null;
cv.onkeydown=e=>{if(e.key==='+'||e.key==='=')setZoom(zoom+1);else if(e.key==='-')setZoom(zoom-1);else if(e.key==='Home'){pan={x:0,y:0};paint();}else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();pan.x+=e.key==='ArrowLeft'?20:e.key==='ArrowRight'?-20:0;pan.y+=e.key==='ArrowUp'?20:e.key==='ArrowDown'?-20:0;paint();}};
window.addEventListener('resize',()=>{resize();paint();});
$('engine').onload=()=>{try{const win=$('engine').contentWindow;art=win.eval('TreeArt');win.requestAnimationFrame=()=>0;ready=true;buildNodes();const initial=new URLSearchParams(location.search).get('view');if(initial&&Array.from($('view').options).some(o=>o.value===initial))$('view').value=initial;setup();window.TREE_REVIEW={art,nodes,paint,setView(v){$('view').value=v;setup();}};}catch(e){$('status').textContent='Renderer unavailable';$('error').hidden=false;$('error').textContent='Serve game-review over HTTP to use the workshop. '+e.message;}};
let last=0;function loop(ms){if(ms-last>=125){const dt=Math.min(.25,(ms-last)/1000);last=ms;if(animate){time+=dt;effectPhase=(effectPhase+dt/2.8)%1;paint();}}requestAnimationFrame(loop);}requestAnimationFrame(loop);
