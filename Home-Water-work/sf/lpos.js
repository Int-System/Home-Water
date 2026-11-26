// stair positions on the light build: stills for the standard set, 3D note otherwise, hash round trip
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--disable-webgl']});const p=await b.newPage({viewport:{width:1366,height:900}});const err=[];p.on('pageerror',e=>err.push(e.message));
 await p.route('**/*',r=>{const u=r.request().url();if(u.includes('fonts.g')||u.includes('cdnjs'))return r.abort();return r.continue()});
 const st=()=>p.evaluate(()=>({hash:location.hash,h:document.querySelector('.opt[data-h][aria-pressed=true]').dataset.h,form:(document.querySelector('.opt[data-sform][aria-pressed=true]')||{dataset:{}}).dataset.sform,roof:document.querySelector('.opt[data-broof][aria-pressed=true]').dataset.broof,pos:document.querySelector('.opt[data-spos][aria-pressed=true]').dataset.spos,img:document.getElementById('still').naturalWidth,note:document.getElementById('stillNote').textContent.slice(0,70)}));
 await p.goto('http://127.0.0.1:8771/#shelter-big1');await p.waitForTimeout(2500);
 let n=0,bad=0;
 for(const f of ['big1','big2','b105','b135'])for(const r of ['shed','hip','gable','butterfly','barrel','split'])for(const q of ['fl','sr','sl']){
  const h='#shelter-'+f+(r==='hip'?'':'-r'+r)+'-p'+q+(r==='shed'?'-h30':'');
  await p.evaluate(h=>location.hash=h,h);await p.waitForTimeout(600);
  for(const v of ['iso','front','under']){await p.evaluate(v=>{const b=document.getElementById('v-'+v);if(b)b.click()},v);await p.waitForTimeout(200)}
  const s=await st();n++;const ok=s.hash===h&&s.form===f&&s.roof===r&&s.pos===q&&s.img>0&&!s.note;if(!ok){bad++;console.log('BAD',h,JSON.stringify(s))}}
 console.log('checked',n,'bad',bad);
 await p.evaluate(()=>location.hash='#shelter-b105-psr-nc');await p.waitForTimeout(1200);console.log('nc note',JSON.stringify(await st()));
 await p.evaluate(()=>document.querySelector('[data-spos="fr"]').click());await p.waitForTimeout(1200);console.log('back fr',JSON.stringify(await st()));
 await p.evaluate(()=>document.querySelector('[data-spos="sl"]').click());await p.waitForTimeout(1200);console.log('click sl',JSON.stringify(await st()));
 await p.evaluate(()=>document.getElementById('model-shelter').click());await p.waitForTimeout(1000);console.log('to shelter',JSON.stringify(await st()));
 await p.evaluate(()=>document.getElementById('model-big').click());await p.waitForTimeout(1000);console.log('to big',JSON.stringify(await st()));
 console.log('errors',err);await b.close()})();
