import numpy as np
from PIL import Image
src='/home/claude/gen/ship/v2/';dst='/home/claude/pirate-game/assets/sprites/ship/px6/'
PPU=6; S=44*PPU  # square canvas 44 units
ims={}
for d in 'n ne e se s sw w nw'.split():
  a=np.asarray(Image.open(src+d+'.png').convert('RGB')).astype(np.float32)
  r,g,b=a[...,0],a[...,1],a[...,2]
  alpha=1-np.clip(((r+b)/2-g-60)/120,0,1);alpha[alpha<0.15]=0
  sp=np.minimum(r,b)-g;fix=(sp>0)&(alpha<1)
  a[...,0]=np.where(fix,r-sp*.6,r);a[...,2]=np.where(fix,b-sp*.6,b)
  im=Image.fromarray(np.dstack([np.clip(a,0,255),alpha*255]).astype(np.uint8),'RGBA')
  ims[d]=im.crop(im.getbbox())
f=40*PPU/ims['e'].size[0]
print('scale',f,{d:(round(i.size[0]*f),round(i.size[1]*f)) for d,i in ims.items()})
for d,im in ims.items():
  sm=im.resize((max(1,round(im.size[0]*f)),max(1,round(im.size[1]*f))),Image.LANCZOS)
  c=Image.new('RGBA',(S,S),(0,0,0,0));c.alpha_composite(sm,((S-sm.size[0])//2,(S-sm.size[1])//2))
  q=np.asarray(c).copy();r,g,b=[q[...,i].astype(int) for i in range(3)]
  pink=(r-g>25)&(b-g>25)&(q[...,3]>0)
  q[pink,0]=np.minimum(g[pink]*1.2+20,255);q[pink,1]=g[pink]+10;q[pink,2]=g[pink]
  c=Image.fromarray(q,'RGBA')
  al=c.getchannel('A').point(lambda v:255 if v>110 else 0)
  p=c.convert('RGB').quantize(64,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE).convert('RGBA');p.putalpha(al)
  p.resize((S*3,S*3),Image.NEAREST).save(dst+f'ship_{d}.png')
