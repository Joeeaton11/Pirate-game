import numpy as np, cv2
from PIL import Image
im=np.array(Image.open('town.png').convert('RGB')).astype(np.float32)
H,W=im.shape[:2]
r,g,b=im[...,0],im[...,1],im[...,2]
water=((b>r+25)&(b>90)&(g>r)).astype(np.float32)
water[1000:]=0  # harbour only (north of the wharf)
water=cv2.morphologyEx(water,cv2.MORPH_OPEN,np.ones((5,5)))
def nblur(x,m,s):
    k=(0,0)
    return cv2.GaussianBlur(x*m[...,None],k,s)/np.maximum(cv2.GaussianBlur(m,k,s),1e-3)[...,None]
lab=cv2.cvtColor(im.astype(np.uint8),cv2.COLOR_RGB2LAB).astype(np.float32)
lp=nblur(lab,water,10)
tgt=nblur(lab,water,180)
fixed=lab-lp+tgt
wm=cv2.GaussianBlur(water,(0,0),3)[...,None]
out=lab*(1-wm)+fixed*wm
rgb=cv2.cvtColor(np.clip(out,0,255).astype(np.uint8),cv2.COLOR_LAB2RGB)
Image.fromarray(rgb).save('town.png')
Image.fromarray(rgb).crop((0,0,W,1100)).resize((1080,550)).save('/tmp/water.jpg',quality=88)
