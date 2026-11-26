const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const SP=path.join(__dirname,'..'),D=path.join(SP,'deps/node_modules');
const html='<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync(path.join(SP,'flood-house.lite.html'),'utf8')+'</body></html>';
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});const p=await b.newPage({viewport:{width:1366,height:900}});const err=[];p.on('pageerror',e=>err.push(e.message));
 await p.addInitScript(()=>{const g=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,o){if(o)delete o.failIfMajorPerformanceCaveat;return g.call(this,t,o)};const cu=URL.createObjectURL;URL.createObjectURL=function(bl){bl.text().then(t=>window.__doc=t);return cu.call(URL,bl)};window.open=()=>({});});
 await p.route('**/*',r=>{const u=r.request().url();
  if(u.includes('three.min.js'))return r.fulfill({path:D+'/three/build/three.min.js',contentType:'text/javascript'});
  if(u.includes('OrbitControls'))return r.fulfill({path:D+'/three/examples/js/controls/OrbitControls.js',contentType:'text/javascript'});
  if(u.startsWith('http://local/'))return r.fulfill({body:html,contentType:'text/html'});return r.abort()});
 for(const h of process.argv.slice(2)){
  await p.goto('http://local/#'+h);await p.waitForTimeout(1500);
  if(await p.isVisible('#lockCode')){await p.fill('#lockCode','5857');await p.evaluate(()=>document.getElementById('lockForm').requestSubmit())}await p.waitForTimeout(300);
  await p.click('#go3d');await p.waitForTimeout(4000);
  await p.evaluate(()=>{window.__doc=null;document.getElementById('docBtn').click()});await p.waitForFunction(()=>window.__doc,null,{timeout:20000});const d=await p.evaluate(()=>window.__doc);
  const q=await b.newPage();await q.route('**/*',r=>r.abort());await q.setContent(d.replace(/<link[^>]*fonts[^>]*>/,''));await q.waitForTimeout(500);
  const out=path.join(SP,'gen','doc-'+h.split('-')[1]);
  await q.pdf({path:out+'.pdf',format:'A4',printBackground:true,margin:{top:'10mm',bottom:'10mm',left:'10mm',right:'10mm'}});
  console.log(h,'bytes',d.length,'pdf ok',await q.evaluate(()=>[document.title,[...document.querySelectorAll('h2')].map(e=>e.textContent).join(' / '),document.querySelectorAll('svg').length,document.querySelectorAll('table.boq tr').length].join(' | ')));await q.close()}
 console.log('errors',err);await b.close()})();
