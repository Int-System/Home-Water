const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const SP=path.join(__dirname,'..'), D=path.join(SP,'deps/node_modules');
const html='<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0}[hidden]{display:none!important}</style></head><body>'+fs.readFileSync(path.join(SP,'flood-house.lite.html'),'utf8')+'</body></html>';
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:900,height:620}});const err=[];p.on('pageerror',e=>err.push(e.message));
 await p.addInitScript(()=>{const g=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,o){if(o)delete o.failIfMajorPerformanceCaveat;return g.call(this,t,o)}});
 await p.route('**/*',r=>{const u=r.request().url();
  if(u.includes('three.min.js'))return r.fulfill({path:D+'/three/build/three.min.js',contentType:'text/javascript'});
  if(u.includes('OrbitControls'))return r.fulfill({path:D+'/three/examples/js/controls/OrbitControls.js',contentType:'text/javascript'});
  if(u.startsWith('http://local/'))return r.fulfill({body:html,contentType:'text/html'});return r.abort();});
 const hs=process.argv.slice(2);
 await p.goto('http://local/#shelter-'+hs[0]);await p.waitForTimeout(1200);
 await p.click('#go3d');await p.waitForTimeout(3500);
 await p.evaluate(()=>{document.getElementById('tags').hidden=true;document.querySelectorAll('.vb,.vtop,.views').forEach(e=>e.style.visibility='hidden')});
 let i=0;for(const h of hs){i++;
  await p.evaluate(h=>location.hash=h,'shelter-'+h);await p.waitForTimeout(2200);
  for(const [nm,cam] of [['R',[ 22,9,-12]],['L',[-22,9,-12]],['F',[8,7,22]]]){
   await p.evaluate(c=>{const f=window.__fh3d;f.camera.position.set(...c);f.camera.lookAt(0,3,-6);if(f.controls){f.controls.target.set(0,3,-6);f.controls.update()}f.renderer.shadowMap.needsUpdate=true;f.renderer.render(f.scene,f.camera)},cam);await p.waitForTimeout(500);
   await (await p.$('#scene')).screenshot({path:path.join(__dirname,`q-${i}-${nm}.png`)})}}
 console.log('errors',err);await b.close()})();
