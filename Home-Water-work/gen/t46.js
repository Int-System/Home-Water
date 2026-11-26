const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
for(const [w,h] of [[1366,900],[390,844]]){
const p=await b.newPage({viewport:{width:w,height:h}});const err=[];p.on('pageerror',e=>err.push(e.message));
const got=[];p.on('response',r=>{const u=r.url();if(u.includes('/data/'))got.push(u.split('/data/')[1]+' '+r.status())});
const st=async()=>p.evaluate(()=>{const i=document.getElementById('still');return {src:(i.currentSrc||i.src).slice(0,30),len:(i.src||'').length,w:i.naturalWidth,wait:document.getElementById('imgbox').classList.contains('fh-wait'),hash:location.hash}});
const step=async(lbl,fn)=>{got.length=0;await fn();await p.waitForTimeout(1500);console.log(w,lbl.padEnd(22),JSON.stringify(await st()),got.join(', '))};
await step('load b105',async()=>{await p.goto('http://localhost:8771/index.html#shelter-b105')});
await step('eve',async()=>p.evaluate(()=>document.getElementById('dn-eve').click()));
await step('night',async()=>p.evaluate(()=>document.getElementById('dn-night').click()));
await step('view top',async()=>p.evaluate(()=>document.getElementById('v-top').click()));
await step('roof gable (night)',async()=>p.evaluate(()=>document.querySelector('[data-broof=gable]').click()));
await step('day',async()=>p.evaluate(()=>document.getElementById('dn-day').click()));
await step('house model',async()=>p.evaluate(()=>document.querySelector('[data-model=house]').click()));
await step('house eve',async()=>p.evaluate(()=>document.getElementById('dn-eve').click()));
console.log('errors',err);await p.close()}
await b.close()})();
