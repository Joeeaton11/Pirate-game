"""Reports buildings whose sprites overlap wrongly (side by side, or a front house hiding the front of the one behind),
buildings standing on a road, and props drawn inside buildings. Run from the repo root after a build."""
import re, sys
sys.path.insert(0,'tools/blueprint')
s=open('src/blueprint/tortugaArtSlots.generated.ts').read()
asp={m.group(1):float(m.group(2)) for m in re.finditer(r"  (\w+): \{ src: [^}]*?aspect: ([\d.]+)",s)}
slots=[(a,float(x),float(y),float(w)) for a,x,y,w in re.findall(r"\['(\w+)', ([-\d.]+), ([-\d.]+), ([-\d.]+)\]",s.split('ART_SLOTS')[1])]
B=[(a,x-w/2,y-w*asp[a],x+w/2,y) for a,x,y,w in slots if a in asp]
import plan_tortuga as P
from shapely.geometry import LineString, box
from shapely.ops import unary_union
roads=unary_union([LineString(p).buffer(w/2,cap_style=2) for n,k,w,p in P.ROADS if k!='secret' and not n.endswith('Walk')])
issues=[]
for i,(a,l,t,r,b) in enumerate(B):
    for j,(a2,l2,t2,r2,b2) in enumerate(B):
        if j<=i: continue
        ox=min(r,r2)-max(l,l2)
        if ox<=1: continue
        front,back=((a,l,t,r,b),(a2,l2,t2,r2,b2)) if b>b2 else ((a2,l2,t2,r2,b2),(a,l,t,r,b))
        # front sprite covers the back one's lower wall (its door row) if its top is above the back ground line
        cover=back[4]-front[2]
        if abs(b-b2)<2 and ox>1.5: issues.append(('side-by-side overlap',a,a2,round(ox,1)))
        elif cover>1.5 and abs(b-b2)>=2: issues.append(('front hides back',front[0],back[0],round(cover,1),round(ox,1)))
    g=box(l,b-3,r,b)  # the ground strip the building stands on
    x=g.intersection(roads).area
    if x>3: issues.append(('stands on road',a,round(x,1)))
for k in issues: print(k)
print(len(issues))
o=open('src/blueprint/artObjects.generated.ts').read()
oasp={m.group(1):float(m.group(2)) for m in re.finditer(r"  (\w+): \{ src: [^}]*?aspect: ([\d.]+)",o)}
objs=[(a,float(x),float(y),float(w)) for a,x,y,w in re.findall(r"\['(\w+)', ([-\d.]+), ([-\d.]+), ([-\d.]+)\]",o.split('OBJ_SLOTS')[1])]
from collections import Counter
c=Counter(); ex=[]
for a,x,y,w in objs:
    for bb in B:
        l,t,r,b=bb[1:]
        # object foot inside the building's drawn area (on the wall/roof), not in front of it
        if l+1<x<r-1 and t+1<y<b-1.5: c[a.rsplit('_',1)[0]]+=1; ex.append((a,x,y,bb[0])); break
print('objects on buildings', sum(c.values()), c.most_common(12)); print(ex[:8])
