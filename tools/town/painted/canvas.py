import sys, os
from PIL import Image
sys.path.insert(0,'.')
from tiles import *
def canvas(r,c):
    g=Image.open(f'guide_{r}{c}.png').convert('RGB')
    l,t,_,_=tile(r,c)
    for (rr,cc) in [(r-1,c),(r,c-1),(r-1,c-1),(r-1,c+1)]:
        if rr<0 or cc<0 or cc>1 or not os.path.exists(f'paint_{rr}{cc}.png'): continue
        p=Image.open(f'paint_{rr}{cc}.png').convert('RGB')
        pl,pt,_,_=tile(rr,cc)
        dx=round((pl-l)*PPU); dy=round((pt-t)*PPU)
        g.paste(p,(dx,dy))   # neighbour pixels where they overlap; rest stays sketch
        # but only keep the overlap: re-paste the sketch outside overlap
    gs=Image.open(f'guide_{r}{c}.png').convert('RGB')
    out=gs.copy()
    W,H=out.size
    top=round((ROWS[r-1]+TH-ROWS[r])*PPU) if r>0 else 0
    left=round((COLS[c-1]+TW-COLS[c])*PPU) if c>0 else 0
    if top: out.paste(g.crop((0,0,W,top)),(0,0))
    if left: out.paste(g.crop((0,0,left,H)),(0,0))
    out.save(f'canvas_{r}{c}.png'); return top,left
if __name__=='__main__':
    r,c=int(sys.argv[1]),int(sys.argv[2]); print(canvas(r,c))
