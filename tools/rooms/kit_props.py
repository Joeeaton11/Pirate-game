import numpy as np, cv2
from PIL import Image, ImageFilter, ImageDraw
from scipy import ndimage
K=1024/360
orig=np.array(Image.open('/home/claude/gen/rooms/tav_b.png').convert('RGB'))
def crop(l,t,r,b): return orig[int(t*K):int(b*K),int(l*K):int(r*K)]
def key(n):
    a=np.array(Image.open(f'{n}.png').convert('RGB')).astype(int); r,g,b=a[...,0],a[...,1],a[...,2]
    green=(g>140)&(g>r+50)&(g>b+50)
    fg=~green; fg=ndimage.binary_opening(fg,iterations=1)
    lab,nn=ndimage.label(fg); sz=ndimage.sum(fg,lab,range(1,nn+1)); fg=np.isin(lab,1+np.where(sz>sz.max()*0.05)[0])
    edge=fg&~ndimage.binary_erosion(fg,iterations=2); sp=edge&(g>np.maximum(r,b)); a[sp,1]=np.maximum(a[sp,0],a[sp,2])
    return a.astype(np.uint8),fg
# reference furniture stats: pixels in original that are 'wood' (not floor?) -> use table+chair crops' brighter half
ref=np.concatenate([crop(262,165,307,200).reshape(-1,3),crop(48,95,90,120).reshape(-1,3),crop(55,235,103,265).reshape(-1,3)])
refL=cv2.cvtColor(ref.reshape(-1,1,3),cv2.COLOR_RGB2LAB).reshape(-1,3).astype(float)
def match(a,fg,s=0.75):
    L=cv2.cvtColor(a,cv2.COLOR_RGB2LAB).astype(float); P=L[fg]
    for c in range(3):
        pm,ps=P[:,c].mean(),P[:,c].std()+1e-6; rm,rs=refL[:,c].mean(),refL[:,c].std()
        P[:,c]=P[:,c]*(1-s)+((P[:,c]-pm)/ps*rs+rm)*s
    P[:,0]=P[:,0]*0.72; P[:,1]=128+(P[:,1]-128)*0.95; P[:,2]=128+(P[:,2]-128)*0.95
    L[fg]=P; return cv2.cvtColor(np.clip(L,0,255).astype(np.uint8),cv2.COLOR_LAB2RGB)
# target sizes in room units (width), and shadow
SPEC={'table':(44,0.55),'chair_front':(17,0.35),'chair_back':(17,0.35),'chair_side':(17,0.35),'stool':(14,0.4),'barrel':(19,0.45),'crates':(24,0.45)}
PX=4  # export px per room unit (crisp enough at zoom)
out={}
for n,(wu,sh) in SPEC.items():
    a,fg=key(n); a=match(a,fg)
    ys,xs=np.where(fg); a=a[ys.min():ys.max()+1,xs.min():xs.max()+1]; m=fg[ys.min():ys.max()+1,xs.min():xs.max()+1]
    im=Image.fromarray(np.dstack([a,(m*255).astype(np.uint8)]),'RGBA')
    W=int(wu*PX); H=round(im.height*W/im.width); im=im.resize((W,H),Image.LANCZOS)
    # dark 1px outline like the painted room
    al=np.array(im)[...,3]>128; ring=ndimage.binary_dilation(al,iterations=1)&~al
    arr=np.array(im); arr[ring]=(28,16,9,255); arr[...,3]=np.where(al|ring,255,0); im=Image.fromarray(arr,'RGBA')
    # bake a soft contact shadow under the base
    pad=int(4*PX); can=Image.new('RGBA',(W+2*pad,H+pad),(0,0,0,0))
    sh_im=Image.new('L',can.size,0); d=ImageDraw.Draw(sh_im)
    d.ellipse((pad-2*PX,H-int(W*0.18),pad+W+2*PX,H+int(W*0.12)),fill=int(255*sh)); sh_im=sh_im.filter(ImageFilter.GaussianBlur(PX*1.5))
    shadow=Image.new('RGBA',can.size,(20,10,4,0)); shadow.putalpha(sh_im)
    can.alpha_composite(shadow); can.alpha_composite(im,(pad,0))
    can.save(f'kit_{n}.png'); out[n]=(can.width/PX,can.height/PX)
    print(n,can.size, round(can.width/PX,1), round(can.height/PX,1))
import json; json.dump(out,open('kit_sizes.json','w'))
