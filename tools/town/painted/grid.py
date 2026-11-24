import sys
from PIL import Image, ImageDraw
PPU=4.8; L,T=-150,-455
im=Image.open('town.png').convert('RGB')
def view(x0,y0,x1,y1,out,step=10):
    c=im.crop((round((x0-L)*PPU),round((y0-T)*PPU),round((x1-L)*PPU),round((y1-T)*PPU)))
    d=ImageDraw.Draw(c)
    for x in range((x0//step)*step,x1+1,step):
        X=(x-x0)*PPU; d.line([(X,0),(X,c.height)],fill=(255,255,0) if x%50==0 else (255,255,255),width=1)
        if x%20==0: d.text((X+2,2),str(x),fill=(255,255,0))
    for y in range((y0//step)*step,y1+1,step):
        Y=(y-y0)*PPU; d.line([(0,Y),(c.width,Y)],fill=(255,255,0) if y%50==0 else (255,255,255),width=1)
        if y%20==0: d.text((2,Y+2),str(y),fill=(255,255,0))
    c.save(out)
view(*map(int,sys.argv[1:5]),sys.argv[5])
