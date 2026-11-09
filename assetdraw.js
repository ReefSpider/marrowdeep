'use strict';
/* Gameplay art proof: shared silhouettes/materials for icons and equipped gear.
   Coordinates are in world units, hand at x=4. No combat data is changed. */
function artPoly(c,col,points){ c.fillStyle=col; c.beginPath(); points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y)); c.closePath(); c.fill(); }
function proofWeapon(it){ return ['Hatchet','Bearded Axe','Flanged Mace'].includes(it.base.name); }
function drawCraftWeapon(c,it){
  const b=it.base,L=b.len,M=metalOf(it.rarity),r=(x,y,w,h,col)=>rect(c,x,y,w,h,col);
  // Ash haft: dark end grain, warm body, a lit ridge and leather grip.
  artPoly(c,'#35251c',[[3,-1],[L-1,-1.5],[L+2,-1],[L+2,1],[8,1.5],[3,2]]);
  r(5,-.5,L-4,1.5,'#80603b'); r(8,-1,L-8,.5,'#b0935b');
  r(3,0,5,2,'#44322b'); r(3,1.5,4,.5,'#261b1a');
  for(let x=4;x<8;x+=1.5)r(x,0,.5,1.5,'#a08561');
  if(b.name==='Flanged Mace'){
    // Longitudinal fins around a socket, rather than a square spiked block.
    r(L-3,-2,2,4,M[0]); r(L-3,-2,.5,4,M[2]);
    artPoly(c,M[0],[[L-1,-2],[L,-4],[L+5,-4],[L+7,-2],[L+7,2],[L+5,4],[L,4],[L-1,2]]);
    artPoly(c,M[1],[[L-1,-1],[L+1,-3],[L+5,-3],[L+6,-1],[L+5,0],[L,0]]);
    r(L,-3,5,.5,M[2]); r(L,-.5,7,1,M[2]);
    artPoly(c,M[1],[[L,1],[L+5,1],[L+6,2],[L+4,3],[L,3]]);
    r(L,1,5,.5,M[2]); r(L+6,-1,1,2,M[0]);
  } else {
    const beard=b.name==='Bearded Axe';
    // Poll on the back, a visible eye, and one blade on the cutting side.
    r(L-1,1,3,2.5,M[0]); r(L-1,1,3,.5,M[1]);
    const head=beard?[[L-2,1],[L+2,1],[L+3,-5],[L+2,-8],[L-5,-8],[L-6,-6],[L-5,-4],[L-2,-3]]:
      [[L-2,1],[L+2,1],[L+3,-4],[L+2,-6],[L-2,-6],[L-3,-4],[L-2,-2]];
    artPoly(c,M[1],head);
    artPoly(c,M[0],[[L-2,-2],[L+1,-3],[L+2,1],[L-2,1]]);
    if(beard){artPoly(c,M[2],[[L-5,-8],[L+2,-8],[L+3,-6],[L-5,-6],[L-6,-5]]);r(L-4,-5,3,.5,M[0]);}
    else {r(L-2,-6,4,1,M[2]);r(L-3,-5,1,1,M[2]);r(L+2,-5,1,1,M[2]);}
    r(L-1,-1,2,2,'#292322'); r(L-.5,-1,1,1,'#9a7949');
    r(L-2,2,3,.5,M[1]);
  }
}
function drawKettle(c,r){
  const M=metalOf(r),p=(x,y,w,h,col)=>rect(c,x,y,w,h,col);
  // Front three-quarter inventory view: shallow bowl, broad brim, open underside.
  artPoly(c,M[0],[[8,14],[9,10],[12,7],[19,7],[22,10],[23,14],[28,16],[27,19],[5,19],[4,17]]);
  artPoly(c,M[1],[[9,14],[10,10],[13,8],[18,8],[21,11],[22,15],[12,16]]);
  p(12,9,2,5,M[2]);p(14,8,4,1,M[2]);p(18,10,1,4,M[0]);
  artPoly(c,M[1],[[5,16],[11,14],[22,14],[28,16],[26,18],[8,18]]);
  p(5,16,8,1,M[2]);p(13,17,13,1,M[2]);p(8,19,17,1,'#25282d');
  p(11,20,2,5,'#56402b');p(21,20,1,4,'#56402b');p(12,24,2,1,'#b49a6a');
}
