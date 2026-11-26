const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--disable-webgl']});const issues=new Map();const add=(k,v)=>{if(!issues.has(k))issues.set(k,v)};
 for(const [n,w,h,sc] of [['desk',1366,900,'light'],['mob',390,844,'dark']]){
 const p=await b.newPage({viewport:{width:w,height:h},colorScheme:sc});
 p.on('pageerror',e=>add('PAGEERR '+e.message,n));p.on('console',m=>{if(m.type()==='error'&&!/ERR_FAILED|404/.test(m.text()))add('CONSOLE '+m.text().slice(0,140),n)});
 await p.route('**/*',r=>{const u=r.request().url();if(u.includes('fonts.g')||u.includes('cdnjs'))return r.abort();return r.continue()});
 await p.goto('http://127.0.0.1:8771/#shelter');await p.waitForTimeout(1500);
 await p.evaluate(()=>{const c=document.getElementById('showTags');if(!c.checked)c.click()});
 let combos=0;
 for(const f of 'gable,hip,twin,lshape,butterfly,aframe,barrel,split,wrap'.split(',')){
  await p.evaluate(f=>document.querySelector('[data-sform="'+f+'"]').click(),f);await p.waitForTimeout(1200);
  for(const cmb of ['111','011','101','110','001','010','100','000']){
  await p.evaluate(c=>{const want={canopy:c[0]==='1',stair:c[1]==='1',easy:c[2]==='1'};document.querySelectorAll('.viewer-foot input[data-sopt]').forEach(b=>{if(b.checked!==want[b.dataset.sopt])b.click()})},cmb);await p.waitForTimeout(900);
  const hs=await p.evaluate(()=>location.hash), exp='#shelter'+(f==='gable'?'':'-'+f)+(cmb[0]==='1'?'':'-nc')+(cmb[1]==='1'?'':'-ns')+(cmb[2]==='1'?'':'-ss'); if(hs!==exp) add('HASH '+hs+' want '+exp,f);
  for(const v of (cmb==='111'?['iso','front','ramp','under','top']:['iso','ramp'])){await p.evaluate(v=>document.getElementById('v-'+v).click(),v);
   for(const t of (cmb==='111'?['day','eve','night']:['day'])){await p.evaluate(t=>document.getElementById('dn-'+t).click(),t);
    for(const fl of [0,2.5]){await p.evaluate(fl=>{const s=document.getElementById('flood');s.value=fl;s.dispatchEvent(new Event('input',{bubbles:true}))},fl);
     await p.waitForTimeout(350);
     const r=await p.evaluate(()=>{const st=document.getElementById('still'),o=[];
       if(!st.complete||!st.naturalWidth)o.push('still not loaded '+(st.getAttribute('src')||'').slice(0,40));
       const tg=document.querySelectorAll('#stillTags .tag').length; if(!tg)o.push('no tags');
       const fl=+document.getElementById('flood').value; if(fl>0&&document.getElementById('stillWater').hidden)o.push('no water');
       const txt=document.querySelector('main').innerText;const m=txt.match(/.{0,30}(NaN|undefined|Infinity).{0,30}/);if(m)o.push('TEXT '+m[0]);
       if(document.documentElement.scrollWidth>document.documentElement.clientWidth+1)o.push('HSCROLL');
       return o});
     if(r.length){await p.waitForTimeout(1500);const r2=await p.evaluate(()=>{const st=document.getElementById('still');return st.complete&&st.naturalWidth?'':'still2'});r.forEach(x=>add(x+(r2?' (persist)':' (slow)'),`${n}-${f}-${cmb}-${v}-${t}-${fl}`))}
     combos++}}}}
  for(const tb of ['plan','elev','struct','mep','addons','budget','check','overview']){await p.evaluate(tb=>document.querySelector('[data-tab="'+tb+'"]').click(),tb);await p.waitForTimeout(80);
   const r=await p.evaluate(()=>{const o=[];document.querySelectorAll('svg *').forEach(e=>{for(const a of e.attributes)if(/NaN|undefined|Infinity/.test(a.value)){o.push('SVGATTR '+e.tagName+' '+a.name);break}});
     if(document.documentElement.scrollWidth>document.documentElement.clientWidth+1)o.push('HSCROLL');return o});r.forEach(x=>add(x,`${n}-${f}-${tb}`))}
 }
 // back to house and to shelter again
 await p.evaluate(()=>document.getElementById('model-house').click());await p.waitForTimeout(1500);
 const hh=await p.evaluate(()=>[location.hash,document.getElementById('still').naturalWidth]);console.log(n,'house',hh);
 await p.evaluate(()=>{history.back()});await p.waitForTimeout(1500);console.log(n,'back',await p.evaluate(()=>[location.hash,document.querySelector('[data-sform][aria-pressed=true]').dataset.sform,document.documentElement.classList.contains('m-shelter')]));
 console.log(n,'combos',combos);await p.close()}
 await b.close();console.log('ISSUES',issues.size);for(const [k,v] of issues)console.log('-',k,'|',v)})();
