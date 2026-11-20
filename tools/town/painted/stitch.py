# Blend all painted tiles into one image (feathered over the overlaps).
import sys, os, numpy as np
from PIL import Image
sys.path.insert(0,'/home/claude/gen/world')
from tiles import *
L,T=min(COLS),min(ROWS); R=max(COLS)+TW; B=max(ROWS)+TH
W=round((R-L)*PPU); H=round((B-T)*PPU)
acc=np.zeros((H,W,3)); wsum=np.zeros((H,W,1))
for r in range(3):
    for c in range(2):
        f=f'./paint_{r}{c}.png'
        if not os.path.exists(f): continue
        p=np.array(Image.open(f).convert('RGB').resize((1200,896))).astype(float)
        x=round((COLS[c]-L)*PPU); y=round((ROWS[r]-T)*PPU)
        h,w=p.shape[:2]; h=min(h,H-y); w=min(w,W-x); p=p[:h,:w]
        # weight ramps up from the tile edges over 100 px (only matters where tiles overlap)
        ry=np.minimum(np.arange(h)+1,np.arange(h)[::-1]+1)/100.0; rx=np.minimum(np.arange(w)+1,np.arange(w)[::-1]+1)/100.0
        wt=np.clip(np.minimum(ry[:,None],rx[None,:]),0.001,1)[...,None]
        if r==0: wt[:100]=np.maximum(wt[:100],1)  # outer edges keep full weight
        if c==0: wt[:,:100]=np.maximum(wt[:,:100],1)
        if c==1: wt[:,-100:]=np.maximum(wt[:,-100:],1)
        if r==2: wt[-100:]=np.maximum(wt[-100:],1)
        acc[y:y+h,x:x+w]+=p*wt; wsum[y:y+h,x:x+w]+=wt
out=np.where(wsum>0,acc/np.maximum(wsum,1e-6),0)
Image.fromarray(out.astype('uint8')).save('./town.png'); print(W,H)
