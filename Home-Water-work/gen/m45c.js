const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1400,height:1300}});const err=[];p.on('pageerror',e=>err.push(e.message));
await p.goto('http://localhost:8771/index.html#shelter-custom');await p.waitForTimeout(2500);
console.log(await p.evaluate(()=>({open:[...document.querySelectorAll('details.m45')].filter(d=>d.open).map(d=>d.dataset.m45),btn:!!document.getElementById('cusReset').offsetParent})),err);
await (await p.$('.menu45')).screenshot({path:'uimock/m45-cus.png'});await b.close()})();
