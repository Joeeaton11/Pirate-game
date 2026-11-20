import json, numpy as np, sys
from PIL import Image
from scipy import ndimage
sys.path.insert(0,'.')
from mapdata import *
PPU=4.8; L,T=-150,-455
im=np.array(Image.open('town.png').convert('RGB')).astype(int)
H,W=im.shape[:2]; GW=int(W/PPU); GH=int(H/PPU)
r,g,b=im[...,0],im[...,1],im[...,2]
water=(b>r+25)&(b>90)&(g>r)
veg=(g>r+12)&(g>b+8)
cells=lambda m: np.array(Image.fromarray((m*255).astype('uint8')).resize((GW,GH),Image.BOX))/255.0
wc=cells(water); vc=cells(veg)
blocked=(wc>0.5)
v=ndimage.binary_opening(ndimage.uniform_filter(vc,5)>0.55,iterations=2)
lab,n=ndimage.label(v); sizes=ndimage.sum(v,lab,range(1,n+1))
v=np.isin(lab,1+np.where(sizes>=40)[0])
blocked|=v
blocked=ndimage.binary_opening(blocked,iterations=1)|(wc>0.5)
def rect(l,r_,t,b_,val=True):
    x0=max(0,int(np.floor(l-L))); x1=min(GW,int(np.ceil(r_-L))); y0=max(0,int(np.floor(t-T))); y1=min(GH,int(np.ceil(b_-T)))
    blocked[y0:y1,x0:x1]=val
# Harbour: east of Gun Point everything north of the town is water except the decks
rect(-60,300,-455,-288)
DECKS=[(-17.5,-3.5,-401,-288),(-56,35,-403,-386),(70,84,-372,-288),(82,123,-365,-346),(103,122,-392,-365),
       (-55,121,-318,-288),(121,258,-311,-276),(196,258,-374,-276),(227,244,-455,-374),(244,283,-453,-434)]
for d in DECKS: rect(*d,False)
SAIL=[(-50,30,-425,-403),(104,121,-414,-392),(283,300,-452,-434)]
# sail zones removed: the game only lets you onto open sea once boarded
doors=[]; last=None
for e in B:
    l,r_,t,bb,dx,i=e
    if l is None: l,r_,t,bb=last
    else: last=(l,r_,t,bb); rect(l+1,r_-1,t,bb-0.5)
    if dx is not None:
        rect(dx-4,dx+4,bb-0.4,bb+10,False)
        if i: doors.append({'id':i,'x':dx,'y':bb+1.5})
for s in S: rect(*s)
for x1,x2,yt,yb,gaps in WALLS:
    cur=x1
    for a,c in sorted(gaps): rect(cur,a,yt,yb); rect(a,c,yt,yb,False); cur=c
    rect(cur,x2,yt,yb)
for s in SIDES: rect(*s)
for c in SEA_FIX: rect(*c)
for c in CLEAR: rect(*c,False)
# greedy maximal rectangles
used=np.zeros_like(blocked); rects=[]
for y in range(GH):
    x=0
    while x<GW:
        if blocked[y,x] and not used[y,x]:
            x2=x
            while x2<GW and blocked[y,x2] and not used[y,x2]: x2+=1
            y2=y+1
            while y2<GH and blocked[y2,x:x2].all() and not used[y2,x:x2].any(): y2+=1
            used[y:y2,x:x2]=True; rects.append((x,x2,y,y2)); x=x2
        else: x+=1
R=[{'l':L+a,'r':L+c,'t':T+y0,'b':T+y1} for a,c,y0,y1 in rects]
json.dump({'blocks':R,'doors':doors},open('mapout.json','w'))
Image.fromarray((blocked*255).astype('uint8')).resize((W//2,H//2)).save('/tmp/bm.png')
print(len(R),'rects',len(doors),'doors')
