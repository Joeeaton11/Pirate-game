# Front walk, Pokemon-style: the stepping foot comes DOWN/forward toward the viewer and the trailing
# foot goes UP/back behind the coat; body dips on each foot plant; arms swing opposite to legs.
import numpy as np
from PIL import Image
from scipy import ndimage
im=Image.open('base.png'); A=np.array(im); H,W=A.shape[:2]
legtop=80; split=30; mid=W//2
yy,xx=np.mgrid[0:H,0:W]
def part(m):
    o=np.zeros_like(A); o[m]=A[m]; return Image.fromarray(o)
legL=part((yy>=legtop-6)&(xx<split)); legR=part((yy>=legtop-6)&(xx>=split))
upper=part(yy<legtop)
armL=part((yy>=54)&(yy<legtop+3)&(xx<mid-12)); armR=part((yy>=54)&(yy<legtop+3)&(xx>=mid+12))
# per-frame: (left leg dy, left leg scale, right dy, right scale, body dy, arm swing)
# forward foot: +dy (down) & a touch bigger; back foot: -dy (up, tucked) & smaller
seq=[(0,1,0,1,0,0),(3,1.05,-3,0.94,1,2),(4,1.07,-4,0.92,2,3),(2,1.03,-2,0.96,1,1),
     (0,1,0,1,0,0),(-3,0.94,3,1.05,1,-2),(-4,0.92,4,1.07,2,-3),(-2,0.96,2,1.03,1,-1)]
CW,CH=112,128; frames=[]
def leg(c,img,dy,sc,o,anchor_x):
    if sc!=1:
        w,h=img.size; s=img.resize((round(w*sc),round(h*sc)),Image.NEAREST)
        # scale about the hip (top of leg region) at the leg's own centre
        ox=round(anchor_x-anchor_x*sc); oy=round((legtop-6)-(legtop-6)*sc)
        c.alpha_composite(s,(max(0,ox),o+dy+oy)) if ox>=0 else c.paste(s,(ox,o+dy+oy),s)
    else: c.alpha_composite(img,(0,o+dy))
for (ldy,lsc,rdy,rsc,bdy,arm) in seq:
    c=Image.new('RGBA',(W,H+12)); o=6
    # back foot first (drawn under), forward foot on top
    order=[('L',legL,ldy,lsc,split*0.5),('R',legR,rdy,rsc,split+(W-split)*0.5)]
    order.sort(key=lambda t:t[2])
    for _,img,dy,sc,ax in order: leg(c,img,dy,sc,o,ax)
    c.alpha_composite(upper,(0,o+bdy))
    c.alpha_composite(armL,(0,o+bdy-arm//2))
    c.alpha_composite(armR,(0,o+bdy+arm//2))
    canvas=Image.new('RGBA',(CW,CH)); canvas.alpha_composite(c,((CW-W)//2,CH-4-(H+o)-4))
    frames.append(canvas)
strip=Image.new('RGBA',(CW*8,CH))
for i,f in enumerate(frames): strip.paste(f,(i*CW,0))
sal=np.array(strip)[...,3]>110
q=np.array(strip.convert('RGB').quantize(48,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE).convert('RGB')).astype(int)
edge=sal&~ndimage.binary_erosion(sal); q[edge]=(q[edge]*0.35).astype(int)
strip=Image.fromarray(np.dstack([q.astype('uint8'),(sal*255).astype('uint8')]),'RGBA')
for i in range(8): strip.crop((i*CW,0,(i+1)*CW,CH)).save(f'walk_s_{i}.png')
big=Image.new('RGBA',(CW*16,CH*2),(70,120,70,255)); big.alpha_composite(strip.resize((CW*16,CH*2),Image.NEAREST)); big.save('/tmp/south_new.png')
fr=[]
for i in range(16):
    f=strip.crop(((i%8)*CW,0,(i%8+1)*CW,CH)).resize((CW*3,CH*3),Image.NEAREST); F=Image.new('RGB',f.size,(196,170,128)); F.paste(f,(0,0),f); fr.append(F)
fr[0].save('/tmp/south_new.gif',save_all=True,append_images=fr[1:],duration=120,loop=0)
