import json,numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage
m=json.load(open('mapout.json'))
L,T=-150,-455; GW,GH=450,486
# blocked cell (integer point x,y) if inside any rect padded 1.5
bl=np.zeros((GH+40,GW+40),bool) # offset 20
for r in m['blocks']:
    x0=int(np.floor(r['l']-1.5-L))+1+20; x1=int(np.ceil(r['r']+1.5-L))-1+20
    y0=int(np.floor(r['t']-1.5-T))+1+20; y1=int(np.ceil(r['b']+1.5-T))-1+20
    bl[max(0,y0):y1+1,max(0,x0):x1+1]=True
lab,_=ndimage.label(~bl)
sp=lab[-100-T+20,30-L+20]
reach=lab==sp
im=Image.open('town.png').convert('RGB').resize((GW*2,GH*2))
a=np.array(im)
rr=np.kron(reach[20:20+GH,20:20+GW],np.ones((2,2),bool))
a[rr]=(a[rr]*0.5+np.array([0,200,0])*0.5).astype('uint8')
im=Image.fromarray(a); d=ImageDraw.Draw(im)
for dd in m['doors']:
    x,y=(dd['x']-L)*2,(dd['y']-T)*2
    ok=reach[int(dd['y']-T)+20-2:int(dd['y']-T)+20+5, int(dd['x']-L)+20-4:int(dd['x']-L)+20+5].any()
    d.ellipse((x-5,y-5,x+5,y+5),fill=(0,0,255) if ok else (255,0,0))
    if not ok: print('door',dd['id'],dd['x'],dd['y'])
im.save('/tmp/reach.png')
