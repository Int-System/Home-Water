const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--disable-webgl']});const p=await b.newPage({viewport:{width:1366,height:900}});const err=[];p.on('pageerror',e=>err.push(e.message));
 const bad404=[];p.on('response',r=>{if(r.status()>=400)bad404.push(r.url())});
 await p.route('**/*',r=>{const u=r.request().url();if(u.includes('fonts.g')||u.includes('cdnjs'))return r.abort();return r.continue()});
 const st=()=>p.evaluate(()=>({hash:location.hash,h:document.querySelector('.opt[data-h][aria-pressed=true]').dataset.h,form:(document.querySelector('.opt[data-sform][aria-pressed=true]')||{}).dataset?.sform,roof:document.querySelector('.opt[data-broof][aria-pressed=true]').dataset.broof,img:document.getElementById('still').naturalWidth,tags:document.querySelectorAll('#tags *').length,note:document.getElementById('stillNote').textContent.slice(0,50),cost:document.getElementById('sfcost-b105').textContent+'/'+document.getElementById('sfcost-b135').textContent}));
 await p.goto('http://127.0.0.1:8771/#shelter-b105-rshed-h30');await p.waitForTimeout(2500);
 let bad=0,n=0;
 for(const f of ['b105','b135'])for(const r of ['shed','hip','gable','butterfly','barrel','split'])for(const sx of ['','-nc','-ns','-ss','-nc-ns','-nc-ss','-ns-ss','-nc-ns-ss']){
  const h='#shelter-'+f+(r==='hip'?'':'-r'+r)+sx+(r==='shed'?'-h30':'');
  await p.evaluate(h=>location.hash=h,h);await p.waitForTimeout(700);
  for(const v of ['iso','front','under']){await p.evaluate(v=>{const b=document.getElementById('v-'+v);if(b)b.click()},v);await p.waitForTimeout(250)}
  const s=await st();n++;const ok=s.hash===h&&s.form===f&&s.roof===r&&s.img>0&&s.h===(r==='shed'?'30':'40');
  if(!ok){bad++;console.log('BAD',h,JSON.stringify(s))}}
 console.log('checked',n,'bad',bad,'errors',err,'http errors',bad404.slice(0,5));
 // UI clicks
 await p.goto('http://127.0.0.1:8771/');await p.waitForTimeout(2000);
 await p.evaluate(()=>document.getElementById('model-big').click());await p.waitForTimeout(800);
 await p.evaluate(()=>document.querySelector('[data-sform="b135"]').click());await p.waitForTimeout(1200);console.log('click b135',JSON.stringify(await st()));
 await p.evaluate(()=>document.querySelector('[data-broof="shed"]').click());await p.waitForTimeout(1200);console.log('shed',JSON.stringify(await st()));
 await p.evaluate(()=>document.querySelector('[data-sform="b105"]').click());await p.waitForTimeout(1200);console.log('b105',JSON.stringify(await st()));
 console.log(await p.evaluate(()=>[document.getElementById('sformDesc').textContent,document.getElementById('h-snotes').textContent,document.getElementById('sn-intro').textContent.slice(0,80),document.getElementById('sformHint').textContent.slice(0,60)].join('\n')));
 await p.evaluate(()=>document.getElementById('model-shelter').click());await p.waitForTimeout(1200);console.log('back to shelter',JSON.stringify(await st()));
 await p.evaluate(()=>document.getElementById('model-big').click());await p.waitForTimeout(1200);console.log('back to big',JSON.stringify(await st()));
 console.log('errors',err);await b.close()})();
