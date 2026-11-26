const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const html='<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync(path.join(__dirname,'../flood-house.lite.html'),'utf8')+'</body></html>';
(async()=>{const b=await chromium.launch({args:['--disable-webgl']});const p=await b.newPage({viewport:{width:1366,height:900}});const err=[];p.on('pageerror',e=>err.push(e.message));
 await p.route('**/*',r=>r.request().url().startsWith('http://local/')?r.fulfill({body:html,contentType:'text/html'}):r.abort());
 for(const h of ['shelter-b105','shelter-b105-psr','shelter-big1-psl-rshed-h30','shelter-big1-rshed-h30']){
  await p.goto('http://local/#'+h);await p.waitForTimeout(1200);
  if(await p.isVisible('#lockCode')){await p.fill('#lockCode','5857');await p.evaluate(()=>document.getElementById('lockForm').requestSubmit());await p.waitForTimeout(300)}
  console.log(h,await p.evaluate(()=>[location.hash,document.getElementById('t-all').textContent,[...document.querySelectorAll('#boq td')].filter(t=>/ชานหัว/.test(t.textContent)).map(t=>t.textContent).join(),document.getElementById('sn-stair').textContent.slice(0,90),document.getElementById('stillNote').textContent.slice(0,80)].join(' | ')))}
 console.log('errors',err);await b.close()})();
