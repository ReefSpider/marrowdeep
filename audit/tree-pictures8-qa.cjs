const fs=require('fs'),path=require('path'),assert=require('assert'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=path.join(__dirname,'tree-pictures8');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{}),headless:true,args:['--enable-unsafe-swiftshader','--mute-audio']});try{
 const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async r=>{const u=new URL(r.request().url());if(u.hostname==='cdnjs.cloudflare.com')return r.fulfill({body:fs.readFileSync(path.join(__dirname,'three.min.js')),contentType:'text/javascript'});if(u.hostname!=='game.local')return r.abort();const file=path.join(root,decodeURIComponent(u.pathname));if(!fs.existsSync(file)||fs.statSync(file).isDirectory())return r.fulfill({status:404,body:''});return r.fulfill({body:fs.readFileSync(file),contentType:({'js':'text/javascript','html':'text/html','png':'image/png','json':'application/json','css':'text/css','webp':'image/webp'})[file.split('.').pop()]||'application/octet-stream'});});
 await page.goto('http://game.local/tools/tree-review.html?view=pictures8');await page.waitForFunction(()=>window.TREE_REVIEW);assert.equal(await page.locator('.card').count(),27);
 const report=await page.evaluate(()=>{
  const a=TREE_REVIEW.art,win=document.querySelector('iframe').contentWindow,cv=document.createElement('canvas');cv.width=320;cv.height=200;const g=cv.getContext('2d',{willReadFrequently:true}),snapshot=win.eval('JSON.stringify({P,COMBO_SEEN})'),rng=win.Math.random,storage=JSON.stringify(win.localStorage),original=g.fillRect.bind(g);let draws=0,calls=0,maxCalls=0;
  win.Math.random=()=>{throw new Error('Math.random used');};win.eval('window.__savedTreeRNG=RNG;RNG=()=>{throw new Error("RNG used")};');
  g.fillRect=(...args)=>{if(args.some(v=>!Number.isInteger(v)))throw new Error('Noninteger primitive');if(++calls>6000)throw new Error('Unbounded effect');original(...args);};
  function image(){return g.getImageData(0,0,320,200).data;}
  function hash(){let h=2166136261;for(const b of image())h=Math.imul(h^b,16777619);return h>>>0;}
  function draw(fn){g.clearRect(0,0,320,200);g.fillStyle='#123456';calls=0;fn();const t=g.getTransform();if(t.a!==1||t.d!==1||t.e!==0||t.f!==0||g.fillStyle!=='#123456'||g.globalAlpha!==1)throw new Error('Context leak');let pixels=0;const d=image();for(let i=3;i<d.length;i+=4){if(d[i]!==0&&d[i]!==255)throw new Error('Fractional alpha');if(d[i]){pixels++;const p=(i-3)/4,x=p%320,y=Math.floor(p/320);if(x===0||x===319||y===0||y===199)throw new Error('Clipped art');}}maxCalls=Math.max(maxCalls,calls);draws++;return pixels;}
  try{
   const pictures=a.catalogue.filter(n=>n.art==='picture'&&n.group!=='Attributes'),shapes=new Set();if(pictures.length!==27||a.catalogue.filter(n=>n.art==='sigil').length!==60)throw new Error('Catalogue coverage mismatch');
   for(const n of pictures){
    for(const state of a.states){
      draw(()=>a.brandIcon(g,n,160,130,Object.freeze({state})));const d=image(),half=n.iconSize/2;let visible=0;
      for(let i=3;i<d.length;i+=4)if(d[i]){visible++;const p=(i-3)/4,x=p%320,y=Math.floor(p/320);if(x<160-half||x>=160+half||y<130-half||y>=130+half)throw new Error('Icon out of bounds '+n.name);}
      if(!visible)throw new Error('Empty picture '+n.name);
      if(state==='locked'){if(shapes.has(hash()))throw new Error('Duplicate silhouette '+n.name);shapes.add(hash());}
      const before=hash();draw(()=>a.brandIcon(g,n,160,130,{state}));if(hash()!==before)throw new Error('Nondeterministic picture');
      for(const time of [0,.3]){draw(()=>a.node(g,n,160,130,Object.freeze({state,time})));if(state==='refusable'){const px=(130*320+160)*4,d=image();if(d[px]!==176||d[px+1]!==20||d[px+2]!==26)throw new Error('Crack hidden '+n.name);}}
    }
   }
   if(snapshot!==win.eval('JSON.stringify({P,COMBO_SEEN})')||storage!==JSON.stringify(win.localStorage))throw new Error('Game/save state changed');
   return {pictures:a.catalogue.filter(n=>n.art==='picture'&&n.group!=='Attributes').length,draws,maxPixelCalls:maxCalls,deterministic:true,integerOpaquePixels:true,noRNG:true,noGameOrSaveMutation:true};
  }finally{win.Math.random=rng;win.eval('RNG=window.__savedTreeRNG;delete window.__savedTreeRNG;');}
 });
 await page.locator('#motion').click();await page.screenshot({path:path.join(out,'desktop-pictures.png'),fullPage:true});
 for(const name of ['Hemorrhage','The Hound','Thousand Cuts','Stillness']){await page.fill('#search',name);assert.equal(await page.locator('.card').count(),3);await page.screenshot({path:path.join(out,name.toLowerCase().replaceAll(' ','-')+'.png'),fullPage:true});}
 await page.fill('#search','');await page.setViewportSize({width:852,height:393});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:path.join(out,'phone-pictures.png'),fullPage:true});
 await page.selectOption('#view','icons');assert.equal(await page.locator('.card').count(),109);assert.equal(await page.locator('.card p').filter({hasText:'illustrated icon'}).count(),48);assert.equal(await page.locator('.card p').filter({hasText:'sigil fallback'}).count(),60);
 assert.deepEqual(errors,[]);report.browserErrors=errors;fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
