# Match every tile's colours to the master reference, separately for water and land.
import sys, os, numpy as np
from PIL import Image
from skimage import color
sys.path.insert(0,'/home/claude/gen/world')
ref=np.array(Image.open('/home/claude/pirate-game/assets/brand/style/MASTER_STYLE_harbour.png').convert('RGB')).astype(float)/255
def water(rgb): return (rgb[...,2]>rgb[...,0]+0.12)&(rgb[...,2]>0.25)
rl=color.rgb2lab(ref); rw=water(ref)
T={'w':(rl[rw].mean(0),rl[rw].std(0)),'l':(rl[~rw].mean(0),rl[~rw].std(0))}
def fix(r,c):
    raw=f'raw_{r}{c}.png'
    if not os.path.exists(raw): os.rename(f'paint_{r}{c}.png',raw)
    p=np.array(Image.open(raw).convert('RGB').resize((1200,896))).astype(float)/255
    lab=color.rgb2lab(p); m=water(p)
    from scipy import ndimage
    soft=ndimage.gaussian_filter(m.astype(float),3)[...,None]
    out={}
    for k,mask in (('w',m),('l',~m)):
        if mask.sum()<500: out[k]=lab; continue
        s_mu,s_sd=lab[mask].mean(0),lab[mask].std(0); d_mu,d_sd=T[k]
        # partial match (70%) so tiles keep some character
        tgt_sd=s_sd+(d_sd-s_sd)*0.7; tgt_mu=s_mu+(d_mu-s_mu)*0.7
        out[k]=(lab-s_mu)/(s_sd+1e-6)*tgt_sd+tgt_mu
    lab2=out['w']*soft+out['l']*(1-soft)
    Image.fromarray((np.clip(color.lab2rgb(lab2),0,1)*255).astype('uint8')).save(f'paint_{r}{c}.png')
if __name__=='__main__':
    for a in sys.argv[1:]: fix(int(a[0]),int(a[1]))
