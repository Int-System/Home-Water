const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const SP=path.join(__dirname,'..'), D=path.join(SP,'deps/node_modules');
const html='<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0}[hidden]{display:none!important}</style></head><body>'+fs.readFileSync(path.join(SP,'flood-house.lite.html'),'utf8')+'</body></html>';
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:1300,height:900}});const err=[];p.on('pageerror',e=>err.push(e.message));
 await p.addInitScript(()=>{window.__m45all=1});
 await p.addInitScript(()=>{const g=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,o){if(o)delete o.failIfMajorPerformanceCaveat;return g.call(this,t,o)}});
 await p.route('**/*',r=>{const u=r.request().url();
  if(u.includes('three.min.js'))return r.fulfill({path:D+'/three/build/three.min.js',contentType:'text/javascript'});
  if(u.includes('OrbitControls'))return r.fulfill({path:D+'/three/examples/js/controls/OrbitControls.js',contentType:'text/javascript'});
  if(u.startsWith('http://local/'))return r.fulfill({body:html,contentType:'text/html'});return r.abort();});
 const st=()=>p.evaluate(()=>[location.hash,document.getElementById('t-all').textContent,document.getElementById('cusMsg').textContent,document.getElementById('cusTip').textContent,document.getElementById('sformDesc').textContent.slice(0,90)].join(' | '));
 await p.goto('http://local/');await p.waitForTimeout(1200);
 if(await p.isVisible('#lockCode')){await p.fill('#lockCode','5857');await p.evaluate(()=>document.getElementById('lockForm').requestSubmit());await p.waitForTimeout(300)}
 await p.evaluate(()=>document.getElementById('model-big').click());await p.waitForTimeout(800);
 await p.evaluate(()=>document.querySelector('[data-sform="custom"]').click());await p.waitForTimeout(4500);
 console.log('custom',await st(), 'still?',await p.evaluate(()=>document.getElementById('go3d').textContent));
 await (await p.$('.side')).screenshot({path:path.join(__dirname,'cu-side.png')});
 await (await p.$('#scene')).screenshot({path:path.join(__dirname,'cu-3d-1.png')});
 // swap bedroom 1 with bath
 const tap=async n=>{await p.evaluate(n=>document.querySelectorAll('#cusMini .rm')[n].dispatchEvent(new MouseEvent('click',{bubbles:true})),n);await p.waitForTimeout(400)};
 const names=await p.evaluate(()=>[...document.querySelectorAll('#cusMini .rm')].map(e=>e.getAttribute('aria-label')));console.log('slots',names.join(','));
 await tap(2);await tap(3);await p.waitForTimeout(3000);console.log('after swap',await st());
 await tap(0);await tap(2);console.log('pub vs bed',await st());
 await tap(0);await tap(1);await p.waitForTimeout(3000);console.log('living<->kitchen',await st());
 // bigger house with 4 bed 2 bath store
 await p.fill('#cusW','14');await p.dispatchEvent('#cusW','change');await p.fill('#cusD','14');await p.dispatchEvent('#cusD','change');
 for(let i=0;i<2;i++)await p.evaluate(()=>document.querySelector('[data-cus="bed"][data-v="1"]').click());
 await p.evaluate(()=>document.querySelector('[data-cus="bath"][data-v="1"]').click());await p.evaluate(()=>document.getElementById('cusStore').click());await p.waitForTimeout(4000);
 console.log('14x14',await st());
 await (await p.$('#scene')).screenshot({path:path.join(__dirname,'cu-3d-2.png')});await (await p.$('#cusMini')).screenshot({path:path.join(__dirname,'cu-mini2.png')});
 for(const [tab,id] of [['plan','plan'],['elev','sElevF'],['elev','sElevS'],['struct','sCols'],['mep','sMep']]){await p.evaluate(t=>{const e=document.querySelector('[data-tab="'+t+'"]');if(e)e.click()},tab);await p.waitForTimeout(300);await (await p.$('#'+id)).screenshot({path:path.join(__dirname,'cu-'+id+'.png')})}
 await p.evaluate(()=>document.querySelector('[data-tab="overview"]').click());
 // too small
 await p.fill('#cusW','7');await p.dispatchEvent('#cusW','change');await p.waitForTimeout(1500);console.log('7 wide',await st());
 // hash round trip
 const h=await p.evaluate(()=>location.hash);await p.goto('http://local/#shelter-custom-cw125-cd160-cb3-ct2-cs1-cl0-rshed-psr-h30');await p.waitForTimeout(4000);
 console.log('hash load',await st());await (await p.$('#scene')).screenshot({path:path.join(__dirname,'cu-3d-3.png')});
 await p.evaluate(()=>document.getElementById('v-iso').click());await p.waitForTimeout(2500);await (await p.$('#scene')).screenshot({path:path.join(__dirname,'cu-3d-4.png')});
 console.log('errors',err);await b.close()})();
