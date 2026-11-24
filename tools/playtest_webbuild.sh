set -e
cd /home/claude/pirate-game && rm -rf dist && npx expo export -p web >/dev/null 2>&1
cd dist && find . -name '*.png' -size +40k -print0 | xargs -0 -P8 -n20 pngquant --force --ext .png --quality 60-90 --skip-if-larger --speed 3 2>/dev/null || true
rm -rf /home/claude/s && mkdir -p /home/claude/s/a && python3 - <<'PY'
# Pack the web build for the playtest artifact (cap: 512 files, 16 MiB a file):
# the largest assets stay their own files; every smaller one goes as a data URI into a few
# d<N>.js chunk files (each under 12 MB) loaded before the game, which the game reads as __A[i].
import os,glob,shutil,base64,hashlib
KEEP_FILES = 300          # largest assets served as their own files
CHUNK = 12_000_000        # bytes of data per chunk file
js=glob.glob('_expo/static/js/web/*.js')[0]; src=open(js).read()
src=src.replace('"/assets/','"./assets/')
items=[]
for r,_,fs in os.walk('assets'):
    for f in fs:
        p=os.path.join(r,f)
        if ('"./'+p+'"') in src: items.append(p)
items.sort(key=os.path.getsize)
mime={'png':'image/png','jpg':'image/jpeg','ttf':'font/ttf','wav':'audio/wav'}
n_inline=max(0,len(items)-KEEP_FILES)
chunks=[[]]; size=0
for i,p in enumerate(items):
    k='"./'+p+'"'
    ext=p.rsplit('.',1)[1]
    if i<n_inline and ext!='ttf':
        uri='data:'+mime[ext]+';base64,'+base64.b64encode(open(p,'rb').read()).decode()
        if size+len(uri)>CHUNK and chunks[-1]: chunks.append([]); size=0
        chunks[-1].append((i,uri)); size+=len(uri)
        src=src.replace(k,'__A['+str(i)+']')
    else:
        h=hashlib.md5(open(p,'rb').read()).hexdigest()[:10]; new='a/'+h+'.'+ext
        src=src.replace(k,'"./'+new+'"'); shutil.copy(p,'/home/claude/s/'+new)
tags=''
for c,ch in enumerate(chunks):
    body='var __A=window.__A=window.__A||{};\n'+''.join('__A['+str(i)+']="'+u+'";\n' for i,u in ch)
    name='d'+hashlib.md5(body.encode()).hexdigest()[:8]+'.js'
    open('/home/claude/s/'+name,'w').write(body); tags+='<script src="./'+name+'"></script>'
open('/home/claude/s/m.js','w').write(src)
h=open('index.html').read().replace('<script src="/'+js+'" defer>',tags+'<script src="./m.js" defer>').replace('href="/favicon','href="./favicon').replace('<title>Pirate-game</title>','<title>Scallywag Isles — playtest</title>')
assert './m.js' in h
open('/home/claude/s/index.html','w').write(h); shutil.copy('favicon.ico','/home/claude/s/favicon.ico')
files=len(os.listdir('/home/claude/s'))+len(os.listdir('/home/claude/s/a'))-1
print('inlined',n_inline,'chunks',len(chunks),'files',files,'m.js MB',round(os.path.getsize('/home/claude/s/m.js')/1e6,1),'biggest chunk MB',round(max(os.path.getsize('/home/claude/s/'+f) for f in os.listdir('/home/claude/s') if f.startswith('d'))/1e6,1))
PY
