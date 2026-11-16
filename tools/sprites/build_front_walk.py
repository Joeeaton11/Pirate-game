import numpy as np
from PIL import Image
from scipy import ndimage
im=Image.open('base.png'); A=np.array(im); H,W=A.shape[:2]
legtop=80; split=30
yy,xx=np.mgrid[0:H,0:W]
def part(m):
    o=np.zeros_like(A); o[m]=A[m]; return Image.fromarray(o)
P=dict(upper=part(yy<legtop),legL=part((yy>=legtop-6)&(xx<split)),legR=part((yy>=legtop-6)&(xx>=split)))
lift=[0,3,5,3,0,0,0,0]; liftR=lift[4:]+lift[:4]
bob=[0,-1,-2,-1,0,-1,-2,-1]
CW,CH=112,128; frames=[]
for i in range(8):
    c=Image.new('RGBA',(W,H+8)); o=6
    c.alpha_composite(P['legL'],(0,o-lift[i]))
    c.alpha_composite(P['legR'],(0,o-liftR[i]))
    c.alpha_composite(P['upper'],(0,o+bob[i]))
    canvas=Image.new('RGBA',(CW,CH)); canvas.alpha_composite(c,((CW-W)//2,CH-4-(H+o)))
    frames.append(canvas)
strip=Image.new('RGBA',(CW*8,CH))
for i,f in enumerate(frames): strip.paste(f,(i*CW,0))
sal=np.array(strip)[...,3]>110
q=np.array(strip.convert('RGB').quantize(48,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE).convert('RGB')).astype(int)
edge=sal&~ndimage.binary_erosion(sal); q[edge]=(q[edge]*0.35).astype(int)
strip=Image.fromarray(np.dstack([q.astype('uint8'),(sal*255).astype('uint8')]),'RGBA')
for i in range(8): strip.crop((i*CW,0,(i+1)*CW,CH)).save(f'walk_s_{i}.png')
big=Image.new('RGBA',(CW*16,CH*2),(70,120,70,255)); big.alpha_composite(strip.resize((CW*16,CH*2),Image.NEAREST)); big.save('/tmp/south_new.png')
