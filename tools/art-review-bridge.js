'use strict';
/* Development-only preview bridge, loaded by tools/art-review.html. */
window.requestAnimationFrame=()=>0;
P=newPlayer();calcStats();loadLevel(3,{noSave:true});mode='pause';
window.ART_REVIEW={
 list(category){return category==='gear'?Object.values(BASES).flat().map(b=>b.name):category==='mobs'?Object.keys(EDRAW):category==='bosses'?Object.keys(BDRAW):ELEMS;},
 paint(canvas,category,name,opt={}){
  const c=canvas.getContext('2d'),z=opt.zoom||3,t=opt.time||0;time=t;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,canvas.width,canvas.height);c.imageSmoothingEnabled=false;c.fillStyle='#22272b';c.fillRect(0,0,canvas.width,canvas.height);c.fillStyle='#dcd6c2';c.font='14px sans-serif';c.fillText(name,12,23);
  c.save();c.translate(canvas.width/2,canvas.height-30);c.scale(z,z);
  if(category==='gear'){
   const it=mkBase(name);it.rarity=opt.rarity||0;if(opt.element&&ART_ECOL[opt.element])it.aff=[{k:opt.element,v:1}];
   c.save();c.translate(-25,-36);c.drawImage(getIcon(it),0,0);c.restore();
   if(it.slot==='weapon'&&it.base.cls!=='shield'){c.translate(-15,0);artWeapon(c,it,true);}else if(it.base.cls==='shield')artShield(c,it,false);
  }else if(category==='mobs'){
   const e=mkEnemy({t:name,x:0,y:0});Object.assign(e,{kesh:opt.kesh?1:0,state:opt.state||'chase',walk:t*5,anim:t,seed:1,champ:false,face:1,vx:0});EDRAW[name](c,e);
  }else if(category==='bosses'){
   const e=spawnBoss(name);Object.assign(e,{anim:t,phase:opt.phase||1,state:'idle',vx:0});if(opt.active)e.pat={name:(BOSSES[name].kit[(opt.phase||1)-1]||BOSSES[name].kit[0])[0],t:t%1};BDRAW[name](c,e);
  }else{
   c.translate(0,-30);artImpact(c,name,0,0,(t%1),3);c.translate(-24,20);const it=mkBase('Arming Sword');it.rarity=4;it.aff=[{k:name,v:1}];artWeapon(c,it,true);
  }
  c.restore();
 }
};
