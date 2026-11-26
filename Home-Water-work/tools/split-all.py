# ฉบับ 46: split each still chunk into a day file (img+hm, same name as before) and
# evening/night group files n-XXX.json (3 designs each), then write the group map into the page.
# Only needed to rebuild ALL data files from combined chunks (old ฉบับ 44 format: one file per design with img hm eve non noff).
# usage: python3 tools/split-all.py COMBINED_DIR   (writes light/data/*.json and the FH_NGRP map in light/page.html)
import json,os,glob,re,sys
SRC=sys.argv[1] if len(sys.argv)>1 else 'chunks-full'; OUT='light/data'; PAGE='light/page.html'; G=3
names=sorted(os.path.basename(f)[:-5] for f in glob.glob(SRC+'/*.json') if not os.path.basename(f).startswith('drive-'))
fam=lambda n:'S' if n.startswith('S') else 'H'
groups=[];cur=[]
for n in names:
    if cur and (len(cur)==G or fam(cur[0])!=fam(n)): groups.append(cur);cur=[]
    cur.append(n)
if cur: groups.append(cur)
for f in glob.glob(OUT+'/n-*.json'): os.remove(f)
ngrp={};tot_day=0;tot_n=0
for i,g in enumerate(groups):
    gid='n-%03d'%i; night={}
    for n in g:
        d=json.load(open(f'{SRC}/{n}.json'))
        day={k:{kk:v[kk] for kk in ('img','hm') if kk in v} for k,v in d.items()}
        for k,v in d.items():
            rest={kk:vv for kk,vv in v.items() if kk not in ('img','hm')}
            if rest: night[k]=rest
        t=json.dumps(day,separators=(',',':'));open(f'{OUT}/{n}.json','w').write(t);tot_day+=len(t)
        ngrp[n]=gid
    t=json.dumps(night,separators=(',',':'));open(f'{OUT}/{gid}.json','w').write(t);tot_n+=len(t)
# drive clips unchanged
for f in glob.glob(SRC+'/drive-*.json'):
    o=OUT+'/'+os.path.basename(f)
    if not os.path.exists(o) or os.path.getsize(o)!=os.path.getsize(f): open(o,'w').write(open(f).read())
s=open(PAGE,encoding='utf8').read()
m=json.dumps(ngrp,separators=(',',':'))
s,n=re.subn(r'window\.FH_CHUNKS=true;(window\.FH_NGRP=\{[^}]*\};)?','window.FH_CHUNKS=true;window.FH_NGRP='+m.replace('\\','\\\\')+';',s,count=1);assert n==1
open(PAGE,'w',encoding='utf8').write(s)
print('designs',len(names),'groups',len(groups),'files',len(os.listdir(OUT)),'day avg KB',round(tot_day/len(names)/1024),'group avg KB',round(tot_n/len(groups)/1024))
