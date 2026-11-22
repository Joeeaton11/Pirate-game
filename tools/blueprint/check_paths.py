"""Walks every road, path and walk with a player-sized circle (radius 1.5) against the walk solids and
reports anywhere it would get stuck. Run from the repo root after a build."""
import re, sys
sys.path.insert(0, 'tools/blueprint')
s = open('src/blueprint/tortugaBlueprint.generated.ts').read()
sol = list(map(float, re.search(r'BP_SOLIDS: number\[\] = \[(.*?)\];', s).group(1).split(',')))
R = [sol[i:i + 4] for i in range(0, len(sol), 4)]
import plan_tortuga as P
from shapely.geometry import LineString
def blocked(x, y, r=1.5): return any(l - r < x < rr + r and t - r < y < b + r for l, rr, t, b in R)
bad_total = 0
for n, k, w, pts in P.ROADS:
    ln = LineString(pts); bad = []
    for d in range(int(ln.length)):
        p = ln.interpolate(d)
        if blocked(p.x, p.y): bad.append((round(p.x), round(p.y)))
    if bad: print('STUCK', n, len(bad), bad[:4]); bad_total += len(bad)
print('paths checked:', len(P.ROADS), 'stuck points:', bad_total)
