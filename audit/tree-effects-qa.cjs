const fs=require('fs'),path=require('path'),assert=require('assert'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=path.join(__dirname,'tree-effects');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{}),headless:true,args:['--enable-unsafe-swiftshader','--mute-audio']});try{
 const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async r=>{const u=new URL(r.request().url());if(u.hostname==='cdnjs.cloudflare.com')return r.fulfill({body:fs.readFileSync(path.join(__dirname,'three.min.js')),contentType:'text/javascript'});if(u.hostname!=='game.local')return r.abort();const file=path.join(root,decodeURIComponent(u.pathname));if(!fs.existsSync(file)||fs.statSync(file).isDirectory())return r.fulfill({status:404,body:''});return r.fulfill({body:fs.readFileSync(file),contentType:({'js':'text/javascript','html':'text/html','png':'image/png','json':'application/json','css':'text/css','webp':'image/webp'})[file.split('.').pop()]||'application/octet-stream'});});
 await page.goto('http://game.local/tools/tree-review.html?view=effects');await page.waitForFunction(()=>window.TREE_REVIEW);assert.equal(await page.locator('.card').count(),10);
 const report=await page.evaluate(()=>{
   const a=TREE_REVIEW.art,win=document.querySelector('iframe').contentWindow,cv=document.createElement('canvas');cv.width=480;cv.height=240;const g=cv.getContext('2d',{willReadFrequently:true});let draws=0,maxPixels=0,maxCalls=0;
   const rng=win.Math.random,state=win.eval('JSON.stringify(P)'),catalogue=JSON.stringify(a.effectSpecs);
   const bad=()=>{throw new Error('Combat art consumed RNG');};win.Math.random=bad;win.eval('window.__treeOldR=RNG;RNG=()=>{throw new Error("Combat RNG")};');
   const originalFill=g.fillRect.bind(g);let calls=0;g.fillRect=(...args)=>{if(args.some(v=>!Number.isFinite(v)||!Number.isInteger(v)))throw new Error('Non-integer pixel primitive');if(++calls>15000)throw new Error('Unbounded draw');originalFill(...args);};
   const pixels=()=>g.getImageData(0,0,cv.width,cv.height).data;
   const hash=()=>{let h=2166136261;for(const b of pixels()){h=Math.imul(h^b,16777619);}return h>>>0;};
   function draw(spec,age,opt){g.clearRect(0,0,cv.width,cv.height);g.fillStyle='#123456';calls=0;a.effect(g,spec.id,240,150,age,opt);const tr=g.getTransform();if(tr.a!==1||tr.d!==1||tr.e!==0||tr.f!==0||g.fillStyle!=='#123456'||g.globalAlpha!==1)throw new Error('Context leaked '+spec.id);const data=pixels();let lit=0;for(let i=3;i<data.length;i+=4){if(data[i]!==0&&data[i]!==255)throw new Error('Fractional alpha');lit+=data[i]>0;const pixel=(i-3)/4,x=pixel%480,y=Math.floor(pixel/480);if(data[i]&&(x===0||x===479||y===0||y===239))throw new Error('Clipped effect');}maxPixels=Math.max(lit,maxPixels);maxCalls=Math.max(calls,maxCalls);draws++;return lit;}
   try{
    for(const spec of a.effectSpecs)for(const reducedMotion of [false,true])for(const direction of [-1,1])for(const seed of [0,7]){
      const opt=Object.freeze({reducedMotion,direction,seed,hero:true});
      for(let i=0;i<24;i++)draw(spec,spec.duration*i/24,opt);
      for(const age of [-1,spec.duration,spec.duration+1,NaN,Infinity])if(draw(spec,age,opt))throw new Error('Expired effect still visible '+spec.id);
      draw(spec,spec.duration*.43,opt);const h=hash();draw(spec,spec.duration*.43,opt);if(hash()!==h)throw new Error('Nondeterministic '+spec.id);
    }
    for(const spec of a.effectSpecs){draw(spec,spec.duration*.25,{hero:true});const h=hash();draw(spec,spec.duration*.72,{hero:true});if(hash()===h)throw new Error('Static effect '+spec.id);}
    for(const pose of ['idle','leap','crash']){g.clearRect(0,0,480,240);a.heroPose(g,240,150,pose,Object.freeze({direction:-1}));if(!pixels().some(v=>v))throw new Error('Empty pose');}
    // Equivalent split-layer and all-layer draws; no missing or duplicated pieces.
    for(const [fn,opts,age]of [['graveSlam',{variant:'ossuary'},.3],['graveSlam',{variant:'gale'},.4],['stillness',{variant:'frozen',phase:'break'},.3],['stillness',{variant:'hallowed',phase:'break'},.3],['tidebreak',{standingWater:true},.4]]){
      g.clearRect(0,0,480,240);a[fn](g,240,150,age,opts);const h=hash();g.clearRect(0,0,480,240);a[fn](g,240,150,age,{...opts,layer:'back'});a[fn](g,240,150,age,{...opts,layer:'front'});if(hash()!==h)throw new Error('Layer mismatch '+fn);
    }
    function bounds(age,wet){g.clearRect(0,0,480,240);a.tidebreak(g,100,150,age,{standingWater:wet});const d=pixels();let left=480,right=0,top=240;for(let i=3;i<d.length;i+=4)if(d[i]){const p=(i-3)/4;left=Math.min(left,p%480);right=Math.max(right,p%480);top=Math.min(top,Math.floor(p/480));}return {left,right,top};}
    const early=bounds(.15,false),late=bounds(.9,false),dry=bounds(.5,false),wet=bounds(.5,true);if(late.right<=early.right+40)throw new Error('Wave did not travel');if(wet.top>=dry.top)throw new Error('Wet wave not taller');
    if(catalogue!==JSON.stringify(a.effectSpecs)||state!==win.eval('JSON.stringify(P)'))throw new Error('Game data mutation');
    return {effects:a.effectSpecs.length,heroPoses:2,draws,maxPixels,maxPixelCalls:maxCalls,waveBounds:{early,late,dry,wet},deterministic:true,integerPixels:true,contextRestored:true,gameStateUnchanged:true};
   }finally{win.Math.random=rng;win.eval('RNG=window.__treeOldR;delete window.__treeOldR;');}
 });
 const scrub=async value=>{await page.locator('#effectPhase').evaluate((el,v)=>{el.value=v;el.dispatchEvent(new Event('input'));},value);};
 for(const [phase,value]of [['leap',180],['impact',420],['break',780]]){await scrub(value);await page.screenshot({path:path.join(out,`desktop-${phase}.png`),fullPage:true});}
 await scrub(420);const frozen=await page.locator('.card canvas').first().evaluate(el=>el.toDataURL());await page.waitForTimeout(250);assert.equal(await page.locator('.card canvas').first().evaluate(el=>el.toDataURL()),frozen,'Pause must freeze current frame');
 await page.locator('#effectFacing').click();assert.equal(await page.locator('#effectFacing').textContent(),'Facing left');await page.locator('#effectReduced').check();await page.screenshot({path:path.join(out,'desktop-reduced-left.png'),fullPage:true});
 await page.locator('#effectFacing').click();await page.locator('#effectReduced').uncheck();await page.setViewportSize({width:852,height:393});await scrub(780);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:path.join(out,'phone-break.png'),fullPage:true});
 await page.locator('#effectRestart').click();assert.equal(await page.locator('#motion').getAttribute('aria-pressed'),'true');
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await page.waitForFunction(()=>window.TREE_REVIEW);assert.equal(await page.locator('#effectReduced').isChecked(),true);assert.equal(await page.locator('#motion').getAttribute('aria-pressed'),'false');
 assert.deepEqual(errors,[]);report.browserErrors=errors;fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
