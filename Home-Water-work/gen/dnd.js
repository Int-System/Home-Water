const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const SP=path.join(__dirname,'..');
const html='<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0}[hidden]{display:none!important}</style></head><body>'+fs.readFileSync(path.join(SP,'flood-house.lite.html'),'utf8')+'</body></html>';
(async()=>{const b=await chromium.launch({args:['--disable-webgl']});
 for(const [nm,opt] of [['desk',{viewport:{width:1300,height:950}}],['phone',{viewport:{width:390,height:844},hasTouch:true,isMobile:true}]]){
 const p=await b.newPage(opt);const err=[];p.on('pageerror',e=>err.push(e.message));
 await p.route('**/*',r=>r.request().url().startsWith('http://local/')?r.fulfill({body:html,contentType:'text/html'}):r.abort());
 const mini=()=>p.evaluate(()=>[...document.querySelectorAll('#cusMini .rm')].map(e=>e.getAttribute('aria-label').replace('ห้อง','').replace('นั่งเล่น + กินข้าว','นั่งเล่น').replace('ครัวเปิดโล่ง','ครัว')).join(' | ')+'  ['+document.getElementById('cusTip').textContent+']');
 await p.goto('http://local/#shelter-custom-cw120-cd120-cb2-ct1-cs1-cl1');await p.waitForTimeout(1500);
 await (await p.$('#cusMini')).scrollIntoViewIfNeeded();
 const box=async n=>(await (await p.$$('#cusMini .rm'))[n].boundingBox());
 const dnd=async(a,c)=>{const A=await box(a),C=await box(c);const x=A.x+A.width/2,y=A.y+A.height/2,x2=C.x+C.width/2,y2=C.y+C.height/2;
   await p.mouse.move(x,y);await p.mouse.down();for(let k=1;k<=10;k++){await p.mouse.move(x+(x2-x)*k/10,y+(y2-y)*k/10);await p.waitForTimeout(30)}await p.mouse.up();await p.waitForTimeout(600)};
 console.log(nm,'start  ',await mini());
 await dnd(2,3);console.log(nm,'bed1->bath',await mini());
 await dnd(0,4);console.log(nm,'living->bed (refuse)',await mini());
 await dnd(4,4);console.log(nm,'onto itself',await mini());
 await dnd(1,0);console.log(nm,'kitchen->living',await mini());
 const tap=async n=>{const B=await box(n);await p.mouse.click(B.x+B.width/2,B.y+B.height/2);await p.waitForTimeout(400)};
 await tap(2);await tap(5);console.log(nm,'tap swap',await mini());
 const hs=await p.$$('#cusMini rect[role=slider]');const hb=await hs[0].boundingBox();await p.mouse.move(hb.x+hb.width/2,hb.y+hb.height/2);await p.mouse.down();await p.mouse.move(hb.x+hb.width/2+25,hb.y+hb.height/2,{steps:6});await p.mouse.up();await p.waitForTimeout(600);
 console.log(nm,'wall drag',await p.evaluate(()=>[...document.querySelectorAll('#cusMini text')].map(t=>t.textContent).filter(t=>/×/.test(t)).join(', ')));
 console.log(nm,'hash',await p.evaluate(()=>location.hash),'errors',err);await p.close()}
 await b.close()})();
