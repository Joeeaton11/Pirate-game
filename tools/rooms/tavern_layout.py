import json
TABLES=[(66,110),(285,114),(282,186),(258,242),(82,250)]
P=[]  # (name, x, bottomY, flip)
for i,(x,y) in enumerate(TABLES):
    P.append(('chair_front',x,y-6,False))
    P.append(('chair_side',x+27,y+6,False))
    P.append(('chair_side',x-27,y+6,True))
    P.append(('table',x,y+14,False))
    P.append(('chair_back',x,y+26,False))
for x in (138,170,202,234): P.append(('stool',x,140,False))
P+= [('barrel',326,238,False),('barrel',340,256,False),('barrel',22,250,False),('crates',30,272,False)]
json.dump(P,open('layout.json','w'))
