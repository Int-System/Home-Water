const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const SP=path.join(__dirname,'..');
const html='<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0}[hidden]{display:none!important}</style></head><body>'+fs.readFileSync(path.join(SP,'flood-house.lite.html'),'utf8')+'</body></html>';
(async()=>{const b=await chromium.launch({args:['--disable-webgl']});
 const p=await b.newPage({viewport:{width:1300,height:950}});const err=[];p.on('pageerror',e=>err.push(e.message));
 await p.route('**/*',r=>r.request().url().startsWith('http://local/')?r.fulfill({body:html,contentType:'text/html'}):r.abort());
 const mini=()=>p.evaluate(()=>[...document.querySelectorAll('#cusMini .rm')].map(e=>e.getAttribute('aria-label').replace('ห้อง','').replace('นั่งเล่น + กินข้าว','นั่งเล่น').replace('ครัวเปิดโล่ง','ครัว')).join(' | '));
 for(const h of ['#shelter-custom-cw110-cd120-cb2-ct1-cs0-cl1','#shelter-custom-cw140-cd140-cb4-ct2-cs1-cl1','#shelter-custom-cw90-cd110-cb1-ct1-cs0-cl0']){
  await p.goto('http://local/'+h);await p.waitForTimeout(1200);
  console.log(h,'|',await p.evaluate(()=>document.getElementById('cusReset').textContent));
  const seen=new Set();
  for(let i=0;i<18;i++){await p.evaluate(()=>document.getElementById('cusReset').click());await p.waitForTimeout(250);
   const lab=await p.evaluate(()=>document.getElementById('cusReset').textContent+' :: '+location.hash.split('-co')[1]);const m=await mini();seen.add(m);if(i<4||i>14)console.log('  ',lab,'::',m)}
  console.log('  distinct',seen.size,'msg',await p.evaluate(()=>document.getElementById('cusMsg').textContent))}
 console.log('errors',err);await b.close()})();
