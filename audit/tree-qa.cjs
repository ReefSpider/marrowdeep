const fs=require('fs'),path=require('path'),assert=require('assert');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=path.join(__dirname,'tree');fs.mkdirSync(out,{recursive:true});
(async()=>{
const browser=await chromium.launch({...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{}),headless:true,args:['--enable-unsafe-swiftshader','--mute-audio']});
try{
const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/*',async r=>{const u=new URL(r.request().url());if(u.hostname==='cdnjs.cloudflare.com')return r.fulfill({body:fs.readFileSync(path.join(__dirname,'three.min.js')),contentType:'text/javascript'});if(u.hostname!=='game.local')return r.abort();const file=path.join(root,decodeURIComponent(u.pathname));if(!fs.existsSync(file)||fs.statSync(file).isDirectory())return r.fulfill({status:404,body:''});return r.fulfill({body:fs.readFileSync(file),contentType:({'js':'text/javascript','html':'text/html','png':'image/png','json':'application/json','css':'text/css','webp':'image/webp'})[file.split('.').pop()]||'application/octet-stream'});});
await page.goto('http://game.local/tools/tree-review.html');await page.waitForFunction(()=>window.TREE_REVIEW,{timeout:30000});
const result=await page.evaluate(()=>{
 const a=TREE_REVIEW.art,win=document.querySelector('iframe').contentWindow,cv=win.document.createElement('canvas');cv.width=cv.height=100;const g=cv.getContext('2d',{willReadFrequently:true});let draws=0;const before=JSON.stringify(a.catalogue),rng=win.Math.random;win.Math.random=()=>{throw new Error('Renderer used RNG');};
 try{for(const entry of a.catalogue)for(const state of a.states)for(const time of [0,.25,.5,.75]){g.clearRect(0,0,100,100);g.save();g.translate(50,50);const opt=Object.freeze({state,time});a.node(g,entry,0,0,opt);g.restore();const data=g.getImageData(0,0,100,100).data;let pixels=0;for(let i=3;i<data.length;i+=4){if(data[i]!==0&&data[i]!==255)throw new Error('Fractional alpha '+entry.name);pixels+=data[i]>0;}if(!pixels)throw new Error('Empty '+entry.name);if(g.getTransform().e!==0||g.getTransform().f!==0)throw new Error('Leaked transform');draws++;}
 for(const kind of Object.keys(a.sizes))for(const state of a.states)a.frame(g,kind,50,50,Object.freeze({state,color:a.elements.water}));
 for(const name of a.glyphs)a.glyph(g,name,50,50);for(let i=0;i<4;i++)a.heart(g,50,50,i/2);a.guides(g,50,50);a.vertebra(g,50,50);a.ribcage(g,50,50);
 for(const state of ['unallocated','allocated','preview'])a.connection(g,{x:0,y:0},{x:99,y:80},Object.freeze({state,time:.5}));
 }finally{win.Math.random=rng;}
 if(before!==JSON.stringify(a.catalogue))throw new Error('Catalogue mutated');
 return {nodes:a.catalogue.length,glyphs:a.glyphs.length,frameVariants:Object.keys(a.sizes).length*a.states.length,nodeDraws:draws,groups:Object.fromEntries([...new Set(a.catalogue.map(n=>n.group))].map(k=>[k,a.catalogue.filter(n=>n.group===k).length]))};
});assert.equal(result.nodes,109);assert.equal(result.glyphs,20);assert.equal(result.frameVariants,45);
await page.locator('#motion').click();
for(const [name,size]of [['desktop',{width:1280,height:720}],['phone',{width:852,height:393}]]){await page.setViewportSize(size);for(const view of ['tree','wedge','path']){await page.selectOption('#view',view);await page.screenshot({path:path.join(out,`${name}-${view}.png`)});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Horizontal overflow');}}
await page.setViewportSize({width:1280,height:720});for(const view of ['frames','icons','glyphs','details']){await page.selectOption('#view',view);await page.screenshot({path:path.join(out,`${view}.png`),fullPage:true});}
await page.selectOption('#view','icons');await page.fill('#search','tide');assert.equal(await page.locator('.card').count(),2);await page.fill('#search','');assert.equal(await page.locator('.card').count(),109);
await page.selectOption('#view','tree');await page.locator('#plus').click();assert.equal(await page.locator('#zoom').inputValue(),'2');await page.locator('#minus').click();assert.equal(await page.locator('#zoom').inputValue(),'1');
assert.deepEqual(errors,[]);result.browserErrors=errors;result.screenshots=10;fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
