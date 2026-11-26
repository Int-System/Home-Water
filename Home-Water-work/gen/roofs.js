const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const SP=path.join(__dirname,'..'), D=path.join(SP,'deps/node_modules');
const html='<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0}[hidden]{display:none!important}</style></head><body>'+fs.readFileSync(path.join(SP,'flood-house.lite.html'),'utf8')+'</body></html>';
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:1000,height:700}});
 p.on('pageerror',e=>console.log('PAGEERR',e.message));
 await p.addInitScript(()=>{const g=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,o){if(o)delete o.failIfMajorPerformanceCaveat;return g.call(this,t,o)}});
 await p.route('**/*',r=>{const u=r.request().url();
  if(u.includes('three.min.js'))return r.fulfill({path:D+'/three/build/three.min.js',contentType:'text/javascript'});
  if(u.includes('OrbitControls'))return r.fulfill({path:D+'/three/examples/js/controls/OrbitControls.js',contentType:'text/javascript'});
  if(u.startsWith('http://local/'))return r.fulfill({body:html,contentType:'text/html'});
  return r.abort();});
 const k=process.argv[2];
 await p.goto('http://local/#shelter-'+k);await p.waitForTimeout(1200);
 await p.fill('#lockCode','5857');await p.evaluate(()=>document.getElementById('lockForm').requestSubmit());await p.waitForTimeout(300);
 await p.click('#go3d');await p.waitForTimeout(4000);
 for(const r of ['hip','gable','butterfly','barrel','split']){
  await p.evaluate(r=>{location.hash='shelter-'+location.hash.split('-')[1]+(r==='hip'?'':'-r'+r)},r);await p.waitForTimeout(2500);
  console.log(await p.evaluate(()=>[location.hash,document.getElementById('t-all').textContent,document.getElementById('sfcost-b105').textContent,document.getElementById('sfcost-b135').textContent].join(' | ')));
  await p.evaluate(()=>document.getElementById('v-iso').click());await p.waitForTimeout(2500);
  await (await p.$('#scene')).screenshot({path:path.join(__dirname,`r-${k}-${r}.png`)});
  await p.evaluate(()=>document.querySelector('[data-tab="elev"]').click());await p.waitForTimeout(300);
  await (await p.$('#sElevF')).screenshot({path:path.join(__dirname,`r-${k}-${r}-e.png`)});
  await p.evaluate(()=>document.querySelector('[data-tab="overview"]').click());await p.waitForTimeout(300);
 }
 await b.close()})();
