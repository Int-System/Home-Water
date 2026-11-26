const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const D=path.join(__dirname,'deps/node_modules');
const html='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0}[hidden]{display:none!important}</style></head><body>'+fs.readFileSync(path.join(__dirname,'flood-house.lite.html'),'utf8')+'</body></html>';
const FORM=process.argv[2]||'gable', NC=process.argv[3]==='1', NS=process.argv[4]==='1', SS=process.argv[5]==='1', RF=process.argv[6]||'hip', POS=process.argv[7]||'fr', PK='S'+(FORM==='gable'?'':'-'+FORM)+(RF!=='hip'?'-r'+RF:'')+(POS!=='fr'?'-p'+POS:(NC?'-nc':'')+(NS?'-ns':'')+(SS?'-ss':''))+(RF==='shed'?'-h30':'-h40');
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:1600,height:1000},deviceScaleFactor:1.2});
 p.on('pageerror',e=>console.log('PAGEERR',e.message));
 await p.emulateMedia({reducedMotion:'reduce'});
 await p.addInitScript(()=>{window.__FH_HQ=1;const g=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,o){if(o)delete o.failIfMajorPerformanceCaveat;return g.call(this,t,o)}});
 await p.route('**/*',r=>{const u=r.request().url();
  if(u.includes('three.min.js'))return r.fulfill({path:D+'/three/build/three.min.js',contentType:'text/javascript'});
  if(u.includes('three@0.128.0/examples/js/')&&!u.includes('OrbitControls'))return r.fulfill({path:D+'/three/examples/js/'+u.split('examples/js/')[1],contentType:'text/javascript'});
  if(u.includes('OrbitControls'))return r.fulfill({path:D+'/three/examples/js/controls/OrbitControls.js',contentType:'text/javascript'});
  if(u.startsWith('http://local/'))return r.fulfill({body:html,contentType:'text/html'});
  return r.abort();});

 await p.goto('http://local/');await p.waitForTimeout(800);
 await p.evaluate(()=>document.getElementById('model-shelter').click());await p.waitForTimeout(800);
 await p.evaluate(f=>document.querySelector('[data-sform="'+f+'"]').click(),FORM);await p.waitForTimeout(800);
 await p.evaluate(([nc,ns,ss])=>{if(nc)document.querySelector('[data-sopt="canopy"]').click();if(ns)document.querySelector('[data-sopt="stair"]').click();if(ss)document.querySelector('[data-sopt="easy"]').click()},[NC,NS,SS]);
 if(RF!=='hip'){await p.evaluate(r=>document.querySelector('[data-broof="'+r+'"]').click(),RF);await p.waitForTimeout(800);}if(POS!=='fr'){await p.evaluate(v=>document.querySelector('[data-spos="'+v+'"]').click(),POS);await p.waitForTimeout(800);}await p.waitForTimeout(800);
 await p.click('#go3d');await p.waitForTimeout(5000);
 const clk=id=>p.evaluate(id=>document.getElementById(id).click(),id);
 const hide=()=>p.evaluate(()=>{document.getElementById('tags').hidden=true;document.querySelectorAll('.vb,.vtop,.views').forEach(e=>e.style.visibility='hidden')});
 const tags={}, V=['iso','front','ramp','under','top','street'];
 for(const v of V){await clk('v-'+v);await p.waitForTimeout(2200);await hide();const key=PK+'-'+v;
   await (await p.$('#scene')).screenshot({path:`stills3/${key}.png`});
   const r=await p.evaluate(()=>{const f=window.__fh3d,T=THREE;
      const pos=f.LABELS.map(l=>{const t=l.v.clone().project(f.camera);const vis=t.z<1&&Math.abs(t.x)<1.02&&Math.abs(t.y)<1.02;return vis?[+((t.x+1)/2).toFixed(4),+((1-t.y)/2).toFixed(4)]:null});
      const mat=new T.ShaderMaterial({vertexShader:'varying float vy; void main(){ vec4 w=modelMatrix*vec4(position,1.0); vy=w.y; gl_Position=projectionMatrix*viewMatrix*w; }',
        fragmentShader:'varying float vy; void main(){ float v=floor(clamp((vy+0.2)/0.05,0.0,254.0)+0.5)/255.0; gl_FragColor=vec4(v,v,v,1.0); }'});
      const s=f.scene, bg=s.background, fog=s.fog, enc=f.renderer.outputEncoding, tm=f.renderer.toneMapping;
      const PS=window.__fhPretty&&window.__fhPretty.sky,pv=PS?PS.visible:false;if(PS)PS.visible=false;s.overrideMaterial=mat; s.background=new T.Color(1,1,1); s.fog=null; f.renderer.outputEncoding=T.LinearEncoding; f.renderer.toneMapping=T.NoToneMapping;
      f.renderer.render(s,f.camera); const url=f.renderer.domElement.toDataURL('image/png');
      s.overrideMaterial=null;if(PS)PS.visible=pv; s.background=bg; s.fog=fog; f.renderer.outputEncoding=enc; f.renderer.toneMapping=tm; f.renderer.render(s,f.camera);
      return {pos,url}});
   fs.writeFileSync(`stills3/${key}-hm.png`,Buffer.from(r.url.split(',')[1],'base64')); tags[key]=r.pos;}
 fs.writeFileSync('stills3/tags-'+PK+'.json',JSON.stringify(tags));
 await clk('dn-eve');await p.waitForTimeout(1200);
 for(const v of V){await clk('v-'+v);await p.waitForTimeout(2200);await hide();await (await p.$('#scene')).screenshot({path:`stillsE/${PK}-${v}-eve.png`})}
 await clk('dn-night');await p.waitForTimeout(1200);
 for(const v of V){await clk('v-'+v);await p.waitForTimeout(2200);await hide();await (await p.$('#scene')).screenshot({path:`stillsN/${PK}-${v}-non.png`});
   await clk('lz-all');await p.waitForTimeout(900);await hide();await (await p.$('#scene')).screenshot({path:`stillsN/${PK}-${v}-noff.png`});await clk('lz-all');await p.waitForTimeout(600)}
 console.log('done',PK);
 await b.close();})();
