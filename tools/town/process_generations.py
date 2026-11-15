import sys, numpy as np
from PIL import Image
from scipy import ndimage
sys.path.insert(0,'/home/claude/gen/town3'); from crunch import crunch
OUT='/home/claude/pirate-game/assets/sprites/tortuga_town/style2/'
def cutout(p):
    a=np.array(Image.open(p).convert('RGB')).astype(int); r,g,b=a[...,0],a[...,1],a[...,2]
    bg=(np.minimum(r,b)>110)&((r+b)/2-g>80)&(np.abs(r-b)<90)
    fg=~bg; lab,n=ndimage.label(fg); sizes=ndimage.sum(fg,lab,range(1,n+1))
    keep=np.isin(lab,[i+1 for i,s in enumerate(sizes) if s>max(400,sizes.max()*0.02)])
    keep&=~bg  # keep enclosed magenta (gaps between fronds, crane frame) transparent
    # de-spill magenta at edges
    edge=keep&~ndimage.binary_erosion(keep,iterations=2)
    sp=edge&((r+b)/2-g>30)
    a[sp,0]=np.minimum(a[sp,0],a[sp,1]+30); a[sp,2]=np.minimum(a[sp,2],a[sp,1]+30)
    rgba=np.dstack([a.astype('uint8'),(keep*255).astype('uint8')])
    im=Image.fromarray(rgba,'RGBA'); return im.crop(im.getbbox())
def seamless(im):
    a=np.array(im.convert('RGB')).astype(float); H,W,_=a.shape; m=W//6
    sh=np.roll(np.roll(a,W//2,1),H//2,0)
    # blend centre-cross seams of the shifted image with the original
    wx=np.clip(np.abs(np.arange(W)-W/2)/m,0,1)[None,:,None]; wy=np.clip(np.abs(np.arange(H)-H/2)/m,0,1)[:,None,None]
    w=np.minimum(wx,wy)
    out=sh*w+a*(1-w)
    return Image.fromarray(out.astype('uint8')).convert('RGBA')
for n in ['edge_pierdeck','edge_quaywall','edge_retaining','edge_stairs','prop_barrels','prop_bollard','prop_crane','prop_crates','prop_palms']:
    c=cutout(f'raw_{n}.png'); crunch(c,4).save(OUT+n+'.png'); print(n,c.size)
for n in []:  # textures: see texture pass in bake notes

    im=Image.open(f'raw_{n}.png').convert('RGB'); s=min(im.size); im=im.crop((0,0,s,s)).resize((1024,1024))
    t=crunch(seamless(im),4).convert('RGB'); t.save(OUT+n+'.png'); print(n)
