import sys, numpy as np, cv2
from PIL import Image
sys.path.insert(0,'.')
from tiles import *
PICK={'00':'polish/00b_reg.png','01':'polish/01a.png','10':'polish/10a.png','11':'polish/11b.png','20':'polish/20b.png','21':'polish/21b.png'}
base=np.array(Image.open('town_v1.png').convert('RGB')).astype(float)
H,W=base.shape[:2]; L,T=min(COLS),min(ROWS)
def lab_match(p,o,mask,s=0.6):
    P=cv2.cvtColor(p.astype(np.uint8),cv2.COLOR_RGB2LAB).astype(float); O=cv2.cvtColor(o.astype(np.uint8),cv2.COLOR_RGB2LAB).astype(float)
    m=mask>0.5
    for ch in range(3):
        pm,ps=P[...,ch][m].mean(),P[...,ch][m].std()+1e-6; om,os_=O[...,ch][m].mean(),O[...,ch][m].std()
        P[...,ch]=P[...,ch]*(1-s)+((P[...,ch]-pm)/ps*os_+om)*s
    return cv2.cvtColor(np.clip(P,0,255).astype(np.uint8),cv2.COLOR_LAB2RGB).astype(float)
xs=[round((c-L)*PPU) for c in COLS]; ys=[round((r-T)*PPU) for r in ROWS]
# seam lines: columns split at overlap middle; rows split 70% down the overlap (upper tile keeps more)
colseam=(xs[1]+ (xs[0]+1200))/2
rowseam=[ys[1]+0.7*((ys[0]+896)-ys[1]), ys[2]+0.7*((ys[1]+896)-ys[2])]
F=30
out=base.copy(); acc=np.zeros_like(base); wsum=np.zeros((H,W,1))
yy,xx=np.mgrid[0:H,0:W]
for r in range(3):
  for c in range(2):
    k=f'{r}{c}'; p=np.array(Image.open(PICK[k]).convert('RGB').resize((1200,896),Image.LANCZOS)).astype(float)
    cov=np.ones((896,1200))
    if k=='00': cov=(np.array(Image.open('polish/00b_mask.png'))>250).astype(float); cov=cv2.erode(cov,np.ones((9,9)))
    o=np.array(Image.open(f'paint_{k}.png').convert('RGB').resize((1200,896))).astype(float)
    p=lab_match(p,o,cov)
    x,y=xs[c],ys[r]; h=min(896,H-y); w=min(1200,W-x)
    # ownership weight in global coords
    gx=xx[y:y+h,x:x+w]; gy=yy[y:y+h,x:x+w]
    wx=np.clip((gx-colseam)/F+0.5,0,1) if c==1 else np.clip((colseam-gx)/F+0.5,0,1)
    wy=np.ones_like(wx,dtype=float)
    if r>0: wy=np.minimum(wy,np.clip((gy-rowseam[r-1])/F+0.5,0,1))
    if r<2: wy=np.minimum(wy,np.clip((rowseam[r]-gy)/F+0.5,0,1))
    wt=(wx*wy*cv2.GaussianBlur(cov[:h,:w],(31,31),0))[...,None]
    acc[y:y+h,x:x+w]+=p[:h,:w]*wt; wsum[y:y+h,x:x+w]+=wt
out=np.where(wsum>0.01,(acc+base*np.clip(1-wsum,0,1))/np.maximum(wsum+np.clip(1-wsum,0,1),1e-6),base)
Image.fromarray(np.clip(out,0,255).astype('uint8')).save('town.png')
Image.fromarray(np.clip(out,0,255).astype('uint8')).resize((1080,1168)).save('/tmp/town2_small.jpg',quality=88)
print('ok')
