const fs=require('fs'),path=require('path'),assert=require('assert'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=path.join(__dirname,'tree-brands3');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{}),headless:true,args:['--enable-unsafe-swiftshader','--mute-audio']});try{
 const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async r=>{const u=new URL(r.request().url());if(u.hostname==='cdnjs.cloudflare.com')return r.fulfill({body:fs.readFileSync(path.join(__dirname,'three.min.js')),contentType:'text/javascript'});if(u.hostname!=='game.local')return r.abort();const file=path.join(root,decodeURIComponent(u.pathname));if(!fs.existsSync(file)||fs.statSync(file).isDirectory())return r.fulfill({status:404,body:''});return r.fulfill({body:fs.readFileSync(file),contentType:({'js':'text/javascript','html':'text/html','png':'image/png','json':'application/json','css':'text/css','webp':'image/webp'})[file.split('.').pop()]||'application/octet-stream'});});
 await page.goto('http://game.local/tools/tree-review.html?view=brands3');await page.waitForFunction(()=>window.TREE_REVIEW);assert.equal(await page.locator('.card').count(),5);
 const report=await page.evaluate(()=>{
  const a=TREE_REVIEW.art,win=document.querySelector('iframe').contentWindow,cv=document.createElement('canvas');cv.width=320;cv.height=200;const g=cv.getContext('2d',{willReadFrequently:true}),snapshot=win.eval('JSON.stringify({P,COMBO_SEEN})'),rng=win.Math.random,storage=JSON.stringify(win.localStorage),original=g.fillRect.bind(g);let draws=0,calls=0,maxCalls=0;
  win.Math.random=()=>{throw new Error('Math.random used');};win.eval('window.__savedTreeRNG=RNG;RNG=()=>{throw new Error("RNG used")};');
  g.fillRect=(...args)=>{if(args.some(v=>!Number.isInteger(v)))throw new Error('Noninteger primitive');if(++calls>6000)throw new Error('Unbounded effect');original(...args);};
  function image(){return g.getImageData(0,0,320,200).data;}
  function hash(){let h=2166136261;for(const b of image())h=Math.imul(h^b,16777619);return h>>>0;}
  function draw(fn){g.clearRect(0,0,320,200);g.fillStyle='#123456';calls=0;fn();const t=g.getTransform();if(t.a!==1||t.d!==1||t.e!==0||t.f!==0||g.fillStyle!=='#123456'||g.globalAlpha!==1)throw new Error('Context leak');let pixels=0;const d=image();for(let i=3;i<d.length;i+=4){if(d[i]!==0&&d[i]!==255)throw new Error('Fractional alpha');if(d[i]){pixels++;const p=(i-3)/4,x=p%320,y=Math.floor(p/320);if(x===0||x===319||y===0||y===199)throw new Error('Clipped art');}}maxCalls=Math.max(maxCalls,calls);draws++;return pixels;}
  try{
   for(const spec of a.brandSpecs)for(const direction of [-1,1])for(const reducedMotion of [false,true])for(const seed of [0,7]){
    const opt=Object.freeze({direction,reducedMotion,seed,hero:true});const hashes=new Set();
    for(let i=0;i<24;i++){const n=draw(()=>a.brandEffect(g,spec.id,160,130,spec.duration*i/24,opt));if(!n)throw new Error('Empty active frame '+spec.id);hashes.add(hash());}
    if(!reducedMotion&&hashes.size<2)throw new Error('No animation '+spec.id);
    for(const age of [-1,spec.duration,spec.duration+1,NaN,Infinity])if(draw(()=>a.brandEffect(g,spec.id,160,130,age,opt)))throw new Error('Expired frame '+spec.id);
    draw(()=>a.brandEffect(g,spec.id,160,130,spec.duration*.43,opt));const h=hash();draw(()=>a.brandEffect(g,spec.id,160,130,spec.duration*.43,opt));if(hash()!==h)throw new Error('Nondeterministic '+spec.id);
   }
   function yellow(){const d=image();let count=0;for(let i=0;i<d.length;i+=4)if(d[i]===255&&d[i+1]===243&&d[i+2]===160&&d[i+3]===255)count++;return count;}
   draw(()=>a.thunderDraw(g,160,130,.4));if(yellow())throw new Error('Lightning fired before delay');draw(()=>a.thunderDraw(g,160,130,.72));if(!yellow())throw new Error('Delayed lightning absent');
   draw(()=>a.houndForm(g,160,130,.4,{variant:'black-iron',pose:'brace'}));const heavy=hash();draw(()=>a.houndForm(g,160,130,.4,{variant:'red-maw',pose:'brace'}));if(hash()===heavy)throw new Error('Hound variants indistinguishable');
   const preview=document.createElement('canvas');preview.width=160;preview.height=104;const pg=preview.getContext('2d',{willReadFrequently:true});
   for(const spec of a.brandSpecs)for(const direction of [-1,1])for(let i=0;i<24;i++){pg.clearRect(0,0,160,104);a.brandEffect(pg,spec.id,80,88,spec.duration*i/24,{hero:true,direction});const d=pg.getImageData(0,0,160,104).data;for(let j=3;j<d.length;j+=4)if(d[j]){const p=(j-3)/4,x=p%160,y=Math.floor(p/160);if(x===0||x===159||y===0||y===103)throw new Error('Preview clipping '+spec.id);}}
   if(snapshot!==win.eval('JSON.stringify({P,COMBO_SEEN})')||storage!==JSON.stringify(win.localStorage))throw new Error('Game/save state changed');
   return {studies:a.brandSpecs.length,draws,maxPixelCalls:maxCalls,deterministic:true,integerOpaquePixels:true,noRNG:true,noGameOrSaveMutation:true};
  }finally{win.Math.random=rng;win.eval('RNG=window.__savedTreeRNG;delete window.__savedTreeRNG;');}
 });
 const scrub=async value=>page.locator('#effectPhase').evaluate((el,v)=>{el.value=v;el.dispatchEvent(new Event('input'));},value);
 for(const [phase,value]of [['early',160],['middle',440],['late',760]]){await scrub(value);await page.screenshot({path:path.join(out,`desktop-${phase}.png`),fullPage:true});}

 await scrub(440);const frozen=await page.locator('.card canvas').first().evaluate(el=>el.toDataURL());await page.waitForTimeout(250);assert.equal(await page.locator('.card canvas').first().evaluate(el=>el.toDataURL()),frozen);
 await page.locator('#effectFacing').click();await page.locator('#effectReduced').check();await page.screenshot({path:path.join(out,'desktop-left-reduced.png'),fullPage:true});
 await page.setViewportSize({width:852,height:393});await page.locator('#effectFacing').click();await page.locator('#effectReduced').uncheck();await scrub(440);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:path.join(out,'phone-middle.png'),fullPage:true});
 await page.locator('#effectRestart').click();assert.equal(await page.locator('#motion').getAttribute('aria-pressed'),'true');
 assert.deepEqual(errors,[]);report.browserErrors=errors;fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
