# Pack rendered still sets into the site's data files and refresh the label positions in page.html.
# ฉบับ 46 layout: data/<PK>.json holds the day images (img + hm) of one design;
#                 data/n-XXX.json holds the evening/night images (eve, non, noff) of up to 3 designs;
#                 window.FH_NGRP in page.html maps each design to its n-XXX file.
# usage: python3 packchunk.py SITE_DIR STILLS_ROOT PK [PK ...]
#   SITE_DIR    folder with page.html and data/   (the published site)
#   STILLS_ROOT folder that holds stills3/ stillsE/ stillsN/ written by stillsSF.js
#   PK          still set key, e.g. S-b105-h40, S-big1-rshed-psr-h30, A-h40
# A design that already exists keeps its n-XXX file: that file must be in SITE_DIR/data first
# (fetch it from the artifact: Artifact read, path data/n-XXX.json). New designs get new n-XXX files.
import sys,io,json,base64,os,re
from PIL import Image
site,root,keys=sys.argv[1],sys.argv[2],sys.argv[3:]
EW,QD,QN=1200,60,55
def webp(im,q,w):
    if im.width!=w: im=im.resize((w,round(im.height*w/im.width)),Image.LANCZOS)
    b=io.BytesIO(); im.save(b,'WEBP',quality=q,method=6); return b.getvalue()
d64=lambda b,t='webp':'data:image/'+t+';base64,'+base64.b64encode(b).decode()
P=f'{site}/page.html'; page=open(P,encoding='utf8').read()
m=re.search(r'window\.FH_NGRP=(\{[^}]*\});',page); assert m,'page.html has no FH_NGRP (needs the ฉบับ 46 loader)'
ngrp=json.loads(m.group(1))
os.makedirs(f'{site}/data',exist_ok=True)
for pk in keys:
    if pk in ngrp and not os.path.exists(f'{site}/data/{ngrp[pk]}.json'):
        sys.exit(f'{pk} lives in {ngrp[pk]}.json: put that file in {site}/data first (Artifact read path data/{ngrp[pk]}.json)')
tags={}; night={}
for pk in keys:
    day={}
    for v in ['iso','front','ramp','under','top','street']:
        key=f'{pk}-{v}'
        if v=='street' and not os.path.exists(f'{root}/stills3/{key}.png'): continue
        im=Image.open(f'{root}/stills3/{key}.png').convert('RGB')
        hm=Image.open(f'{root}/stills3/{key}-hm.png').convert('L'); hm=hm.resize((hm.width//2,hm.height//2),Image.NEAREST)
        hb=io.BytesIO(); hm.save(hb,'PNG',optimize=True)
        day[key]={'img':d64(webp(im,QD,EW)),'hm':d64(hb.getvalue(),'png')}
        night.setdefault(pk,{})[key]={n:d64(webp(Image.open(src).convert('RGB'),q,EW)) for n,src,q in
            [('non',f'{root}/stillsN/{key}-non.png',QN),('noff',f'{root}/stillsN/{key}-noff.png',QN),('eve',f'{root}/stillsE/{key}-eve.png',QD)]}
    open(f'{site}/data/{pk}.json','w').write(json.dumps(day,separators=(',',':')))
    tf=f'{root}/stills3/tags-{pk}.json'
    if os.path.exists(tf): tags.update(json.load(open(tf)))
    print('packed',pk)
# evening/night: update existing group files in place, put new designs 3 per new group file
new=[pk for pk in keys if pk not in ngrp]
nxt=max([int(g[2:]) for g in ngrp.values()]+[-1])+1
for i in range(0,len(new),3):
    gid='n-%03d'%nxt; nxt+=1
    for pk in new[i:i+3]: ngrp[pk]=gid
for gid in sorted({ngrp[pk] for pk in keys}):
    f=f'{site}/data/{gid}.json'; g=json.load(open(f)) if os.path.exists(f) else {}
    for pk in keys:
        if ngrp[pk]==gid:
            g={k:v for k,v in g.items() if not k.startswith(pk+'-') or k.rsplit('-',1)[0]!=pk}; g.update(night[pk])
    open(f,'w').write(json.dumps(g,separators=(',',':'))); print('night file',gid)
page=page[:m.start(1)]+json.dumps(ngrp,separators=(',',':'))+page[m.end(1):]
if tags:
    a='window.STILL_TAGS='; i=page.index(a)+len(a); j=page.index(';window.DRIVE_CAPS=',i)
    cur=json.loads(page[i:j]); cur.update(tags); page=page[:i]+json.dumps(cur,separators=(',',':'))+page[j:]
    print('labels updated',len(tags))
open(P,'w',encoding='utf8').write(page)
