"""Build the Tortuga blueprint: plan_tortuga.py (authored, outside the town) + the painted town's
walk map (derived) -> src/blueprint/tortugaBlueprint.generated.ts and a preview image.
Usage: python3 build_tortuga.py <town.png> [preview.png]"""
import sys, random, math
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from shapely.geometry import Polygon, LineString, Point, box
from shapely.ops import unary_union
import sources as S
import plan_tortuga as P

ROOT = S.ROOT
# ---- edits made in the game's Plan editor (exported JSON pasted into edits_tortuga.json)
import json as _json, os as _os
EDITS = _json.load(open(_os.path.join(_os.path.dirname(__file__), 'edits_tortuga.json')))
def bkey(b): return b[0] or f'{b[1]}@{b[3]:g},{b[4]:g}'
P_ORIG = list(P.BUILDINGS); PROPS_ORIG = list(P.PROPS)
P.BUILDINGS = [tuple(list(b[:3]) + [b[3] + EDITS['buildings'].get(bkey(b), [0, 0])[0], b[4] + EDITS['buildings'].get(bkey(b), [0, 0])[1]] + list(b[5:])) for b in P.BUILDINGS]
def pkey(p): return f'{p[0]}@{p[1]:g},{p[2]:g}'
P.PROPS = [(p[0], p[1] + EDITS['props'].get(pkey(p), [0, 0])[0], p[2] + EDITS['props'].get(pkey(p), [0, 0])[1]) for p in P.PROPS]
TOWN = (-150, 300, -455, 2336 / 4.8 - 455)  # l, r, t, b of the painted town
town_box = box(TOWN[0], TOWN[2], TOWN[1], TOWN[3])
coast = Polygon(S.coast()).buffer(0)
problems = []

# ---------------------------------------------------------------- geometry of the authored plan
def door_point(b):
    _, _, _, cx, cy, w, h, side = b
    return {'N': (cx, cy - h / 2), 'S': (cx, cy + h / 2), 'E': (cx + w / 2, cy), 'W': (cx - w / 2, cy), None: None}[side]

# Flat road ends (no rounded caps): the plan is what the artwork copies.
road_geoms = [LineString(pts).buffer(w / 2, cap_style=2, join_style=1) for _, _, w, pts in P.ROADS]
dock_geoms = [(n, k, w, LineString(pts).buffer(w / 2, cap_style=2, join_style=2)) for n, k, w, pts in P.DOCKS]
breakwater = LineString(P.BREAKWATER).buffer(4, cap_style=1)
plaza_geoms = [box(l, t, r, b) for _, l, r, t, b in P.PLAZAS]
ways = unary_union(road_geoms + plaza_geoms)
bldg_geoms = [box(cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2) for _, _, _, cx, cy, w, h, _ in P.BUILDINGS]
lagoon = Point(P.LAGOON['c']).buffer(P.LAGOON['r'])
rivers = unary_union([LineString(r['pts']).buffer(r['w'] / 2) for r in P.RIVERS])
bridges = unary_union(road_geoms).intersection(rivers.buffer(1.5))
water = unary_union([lagoon, rivers]).difference(ways)
sea_zones = [(t, Polygon(p).buffer(0).difference(coast)) for t, p in P.SEA_ZONES]
zone_geoms = [(t, Polygon(p).buffer(0).intersection(coast).difference(town_box)) for t, p in P.ZONES]
beach = coast.difference(coast.buffer(-14)).difference(town_box)

# ---- boundaries: fences (cottage yards), hedges (fields), stone walls (graveyard, garden, fort)
def door_side_of(b): return b[7]
bounds_fence, bounds_hedge, bounds_wall = [], [], []
for b in P.BUILDINGS:
    if b[1] != 'Cottage': continue
    _, _, _, cx, cy, w, h, side = b
    yl, yt, yr, yb = cx - w / 2 - 6, cy - h / 2 - 6, cx + w / 2 + 6, cy + h / 2 + 6
    ring = {'S': [(yl, yb), (yl, yt), (yr, yt), (yr, yb)], 'N': [(yl, yt), (yl, yb), (yr, yb), (yr, yt)],
            'E': [(yr, yt), (yl, yt), (yl, yb), (yr, yb)], 'W': [(yl, yt), (yr, yt), (yr, yb), (yl, yb)]}[side]
    bounds_fence.append(LineString(ring))
for t, g in zone_geoms:
    if t in P.HEDGED: bounds_hedge.append(g.exterior)
    if t in P.WALLED: bounds_wall.append(LineString(g.exterior.coords))
fl, ft, fr, fb = P.FORT_WALLS
fort_ring = box(fl, ft, fr, fb).intersection(coast.buffer(-3))
bounds_wall.append(LineString(fort_ring.exterior.coords))
gaps = unary_union([LineString(pts).buffer(w / 2 + 3, cap_style=2) for n, k, w, pts in P.ROADS] + [box(l, t, r, b_) for _, l, r, t, b_ in P.PLAZAS])
def cut(lines): return unary_union([ln for ln in lines]).difference(gaps).difference(unary_union([g for g in bldg_geoms]).buffer(0.5))
fence_geom, hedge_geom, wall_geom = cut(bounds_fence), cut(bounds_hedge), cut(bounds_wall)

# ---------------------------------------------------------------- checks
for i, b in enumerate(P.BUILDINGS):
    g = bldg_geoms[i]
    if not coast.contains(g): problems.append(f'{b[1]} @({b[3]},{b[4]}) pokes outside the coast')
    if g.intersects(town_box): problems.append(f'{b[1]} overlaps the painted town')
    if g.buffer(-0.5).intersects(ways): problems.append(f'{b[1]} @({b[3]},{b[4]}) sits on a road')
    if g.intersects(water): problems.append(f'{b[1]} sits in water')
    for j in range(i):
        if g.buffer(2).intersects(bldg_geoms[j]): problems.append(f'{b[1]} touches {P.BUILDINGS[j][1]}')
    d = door_point(b)
    if d and b[2] not in ('landmark',) and Point(d).distance(ways) > 12:
        problems.append(f'{b[1]} @({b[3]},{b[4]}) door is {Point(d).distance(ways):.0f} from a road')
for n, k, w, pts in P.DOCKS:
    if not coast.buffer(3).contains(Point(pts[0])) and not any(LineString(o[3]).distance(LineString(pts)) < 1 for o in P.DOCKS if o[0] != n):
        problems.append(f'{n} starts in the sea (not tied to land)')
for name, _, _, pts in P.ROADS:
    for p in pts:
        if not coast.buffer(2).contains(Point(p)) and not town_box.contains(Point(p)):
            problems.append(f'{name} point {p} is in the sea')

# ---------------------------------------------------------------- trees (blue-noise per zone)
rng = random.Random(4)
blocked_for_trees = unary_union([ways.buffer(5), unary_union(bldg_geoms).buffer(7), water.buffer(4),
                                 town_box.buffer(6)] + [g for t, g in zone_geoms if t in ('fields', 'graveyard', 'garden', 'sugarcane')])
trees = []
def scatter(area, spacing, kind, keep=1.0):
    if area.is_empty: return
    minx, miny, maxx, maxy = area.bounds
    tries = int(area.area / (spacing * spacing) * 6)
    for _ in range(tries):
        x, y = rng.uniform(minx, maxx), rng.uniform(miny, maxy)
        if rng.random() > keep: continue
        p = Point(x, y)
        if not area.contains(p) or blocked_for_trees.contains(p): continue
        if any((x - a) ** 2 + (y - b) ** 2 < spacing * spacing for a, b, _ in trees): continue
        trees.append((round(x, 1), round(y, 1), kind))
for t, g in zone_geoms:
    if t == 'jungle': scatter(g, 13, 'jungle')
    elif t == 'forest': scatter(g, 15, 'tree')
    elif t == 'rock': scatter(g, 40, 'rock')
    elif t == 'swamp': scatter(g, 16, 'mangrove')
    elif t == 'palms': scatter(g, 15, 'palm')
scatter(beach, 30, 'palm', 0.55)
grass = coast.buffer(-14).difference(town_box).difference(unary_union([g for _, g in zone_geoms]))
scatter(grass, 38, 'tree', 0.35)

def tkey(t): return f'{t[0]:g},{t[1]:g}'
_del = set(EDITS.get('deleted_trees', []))
TREES_ORIG = [(x, y) for x, y, k in trees if tkey((x, y)) not in _del]
trees = [(x + EDITS['trees'].get(tkey((x, y)), [0, 0])[0], y + EDITS['trees'].get(tkey((x, y)), [0, 0])[1], k) for x, y, k in trees if tkey((x, y)) not in _del]

# ---------------------------------------------------------------- points of interest
blocks0, _ = S.painted()
town_blocked = unary_union([box(l, t, r, b) for l, r, t, b in blocks0])
taken = unary_union([unary_union(bldg_geoms).buffer(3), water.buffer(2), town_blocked]
                    + [Point(x, y).buffer(3.5) for x, y, _ in trees])
pois = []
P.POIS = list(P.POIS) + [('resource', gid, x, y) for res, gid, x, y in P.GATHER] + [('errand', e[0], e[4], e[5]) for e in P.ERRANDS]
for kind, pid, x, y in P.POIS:
    p = Point(x, y)
    ok = (coast.contains(p) or town_box.contains(p) or unary_union([g for *_, g in dock_geoms]).contains(p)) and not taken.contains(p)
    if not ok:
        free = coast.buffer(-4).union(town_box.intersection(coast)).difference(taken)
        from shapely.ops import nearest_points
        q = nearest_points(free, p)[0]
        problems.append(f'POI {pid} moved from ({x},{y}) to ({q.x:.0f},{q.y:.0f})')
        x, y = round(q.x, 1), round(q.y, 1)
    pois.append((kind, pid, x, y))

# ---------------------------------------------------------------- the painted town, derived
blocks, doors = S.painted()
import importlib.util
spec = importlib.util.spec_from_file_location('mapdata', f'{ROOT}/tools/town/painted/mapdata.py')
md = importlib.util.module_from_spec(spec); spec.loader.exec_module(md)
town_bldgs = [(l, r, t, b) for l, r, t, b, *_ in md.B if l is not None]
hsv = np.asarray(Image.open(sys.argv[1]).convert('HSV')).astype(int)
CELL = 2
nx, ny = int((TOWN[1] - TOWN[0]) / CELL), int((TOWN[3] - TOWN[2]) / CELL)
blk = np.zeros((ny, nx), bool)
for l, r, t, b in blocks:
    blk[max(0, int((t - TOWN[2]) / CELL)):int(math.ceil((b - TOWN[2]) / CELL)),
        max(0, int((l - TOWN[0]) / CELL)):int(math.ceil((r - TOWN[0]) / CELL))] = True
cls = np.zeros((ny, nx), np.uint8)  # 0 street 1 wood 2 water 3 garden 4 sand
for j in range(ny):
    for i in range(nx):
        x, y = TOWN[0] + (i + .5) * CELL, TOWN[2] + (j + .5) * CELL
        px, py = min(2159, int((x - TOWN[0]) * 4.8)), min(2335, int((y - TOWN[2]) * 4.8))
        h, s_, v = hsv[py, px]
        wet = 100 < h < 155 and s_ > 80
        if not blk[j, i]: cls[j, i] = 1 if (y < -286 and x > -100) else 4 if (x <= -100 and y < -200) else 0
        else: cls[j, i] = 2 if wet else 3

def merge(mask):
    """Greedy rectangles covering a boolean grid (row runs merged downwards)."""
    mask = mask.copy(); out = []
    H, W = mask.shape
    for j in range(H):
        i = 0
        while i < W:
            if not mask[j, i]: i += 1; continue
            k = i
            while k < W and mask[j, k]: k += 1
            jj = j + 1
            while jj < H and mask[jj, i:k].all(): jj += 1
            mask[j:jj, i:k] = False
            out.append((i, k, j, jj)); i = k
    return out
town_rects = {}
for c, name in enumerate(['street', 'wood', 'water', 'garden', 'sand']):
    town_rects[name] = [(round(TOWN[0] + i * CELL, 1), round(TOWN[0] + k * CELL, 1), round(TOWN[2] + j * CELL, 1), round(TOWN[2] + jj * CELL, 1))
                        for i, k, j, jj in merge(cls == c)]

# ---------------------------------------------------------------- walk solids outside the town
X0, X1, Y0, Y1, C = -600, 600, -520, 520, 2
W_, H_ = int((X1 - X0) / C), int((Y1 - Y0) / C)
sol = np.zeros((H_, W_), bool)
def burn(g):
    minx, miny, maxx, maxy = g.bounds
    for j in range(max(0, int((miny - Y0) / C)), min(H_, int((maxy - Y0) / C) + 1)):
        for i in range(max(0, int((minx - X0) / C)), min(W_, int((maxx - X0) / C) + 1)):
            if g.contains(Point(X0 + (i + .5) * C, Y0 + (j + .5) * C)): sol[j, i] = True
for g, b in zip(bldg_geoms, P.BUILDINGS):
    burn(g.buffer(-1))
burn(water)
for x, y, k in trees:
    burn(Point(x, y).buffer(4 if k == 'rock' else 2.4))
for g_, wdt in ((fence_geom, 1.1), (hedge_geom, 1.4), (wall_geom, 1.4)):
    if not g_.is_empty: burn(g_.buffer(wdt))
sol_rects = [(X0 + i * C, X0 + k * C, Y0 + j * C, Y0 + jj * C) for i, k, j, jj in merge(sol)]

# ---------------------------------------------------------------- write TS
def poly_d(g):
    def ring(c): return 'M' + 'L'.join(f'{x:.1f} {y:.1f}' for x, y in list(c.coords)[:-1]) + 'Z'
    gs = [g] if g.geom_type == 'Polygon' else list(getattr(g, 'geoms', []))
    return ''.join(ring(p.exterior) + ''.join(ring(h) for h in p.interiors) for p in gs if p.geom_type == 'Polygon' and not p.is_empty)
def flat(rs): return ','.join(f'{a:g},{b:g},{c:g},{d:g}' for a, b, c, d in rs)

out = ['// GENERATED by tools/blueprint/build_tortuga.py from tools/blueprint/plan_tortuga.py and the painted',
       '// town walk map. Edit the plan and re-run — never hand-edit. Island-relative world units.',
       '', 'export interface BpBuilding { key: string; id: string | null; label: string; kind: string; l: number; t: number; w: number; h: number; door: [number, number] | null }',
       'export interface BpRoad { name: string; kind: string; w: number; pts: [number, number][] }', '']
out.append(f"export const BP_COAST = '{poly_d(coast)}';")
out.append(f"export const BP_BEACH = '{poly_d(beach)}';")
out.append('export const BP_ZONES: { t: string; d: string }[] = [' + ', '.join(f"{{ t: '{t}', d: '{poly_d(g)}' }}" for t, g in zone_geoms if not g.is_empty) + '];')
out.append(f"export const BP_WATER = '{poly_d(water)}';")
out.append('export const BP_ROADS: BpRoad[] = [\n' + ''.join(
    f"  {{ name: {name!r}, kind: '{k}', w: {w}, pts: [{', '.join(f'[{x}, {y}]' for x, y in pts)}] }},\n".replace("'", "'") for name, k, w, pts in P.ROADS) + '];')
out.append('export const BP_PLAZAS: [string, number, number, number, number][] = [' + ', '.join(f"[{n!r}, {l}, {r}, {t}, {b}]" for n, l, r, t, b in P.PLAZAS) + '];')
bl = []
for b in P.BUILDINGS:
    bid, label, kind, cx, cy, w, h, side = b
    d = door_point(b)
    bl.append(f"  {{ key: {bkey(P_ORIG[len(bl)])!r}, id: {('null' if bid is None else repr(bid))}, label: {label!r}, kind: '{kind}', l: {cx - w / 2:g}, t: {cy - h / 2:g}, w: {w}, h: {h}, door: {('null' if d is None else f'[{d[0]:g}, {d[1]:g}]')} }},")
out.append('export const BP_BUILDINGS: BpBuilding[] = [\n' + '\n'.join(bl) + '\n];')
out.append(f"export const BP_BRIDGES = '{poly_d(bridges)}';")
segs = []
for n, k, w, pts in P.DOCKS:
    if k == 'slip': continue
    for a, b in zip(pts, pts[1:]): segs.append(f'{{ from: {{ x: {a[0]}, y: {a[1]} }}, to: {{ x: {b[0]}, y: {b[1]} }}, halfWidth: {w / 2 + 1:g} }}')
out.append('/** Walkable boardwalks outside the painted town (src/data/harbor.ts reads these). */')
out.append('export const BP_DOCK_SEGMENTS: { from: { x: number; y: number }; to: { x: number; y: number }; halfWidth: number }[] = [\n  ' + ',\n  '.join(segs) + '\n];')
out.append(f"export const BP_BREAKWATER: [number, number][] = [{', '.join(f'[{x}, {y}]' for x, y in P.BREAKWATER)}];")
out.append('export const BP_SEA_ZONES: { t: string; d: string }[] = [' + ', '.join(f"{{ t: '{t}', d: '{poly_d(g)}' }}" for t, g in sea_zones) + '];')
out.append('export const BP_POIS: [string, string, number, number][] = [' + ', '.join(f"['{k}', {i!r}, {x:g}, {y:g}]" for k, i, x, y in pois) + '];')
out.append('/** x, y, kind code (0 jungle, 1 tree, 2 palm, 3 rock, 4 mangrove), packed. */')
code = {'jungle': 0, 'tree': 1, 'palm': 2, 'rock': 3, 'mangrove': 4}
out.append('export const BP_TREES: number[] = [' + ','.join(f'{x:g},{y:g},{code[k]}' for x, y, k in trees) + '];')
out.append('export const BP_PROPS: [string, number, number][] = [' + ', '.join(f"['{k}', {x:g}, {y:g}]" for k, x, y in P.PROPS) + '];')
out.append('/** Stable edit keys (the plan original positions) for props and trees, same order as BP_PROPS / BP_TREES. */')
out.append('export const BP_PROP_KEYS: string[] = [' + ', '.join(repr(pkey(p)) for p in PROPS_ORIG) + '];')
out.append('export const BP_TREE_KEYS: string[] = [' + ', '.join(repr(tkey(t)) for t in TREES_ORIG) + '];')
out.append('export const BP_LABELS: [number, number, string, string][] = [' + ', '.join(f"[{x}, {y}, {t!r}, '{s}']" for x, y, t, s in P.LABELS) + '];')
out.append('/** The painted town as a plan: l,r,t,b rects per surface, derived from its walk map. */')
out.append('export const BP_TOWN: Record<string, number[]> = {\n' + ''.join(f"  {k}: [{flat(v)}],\n" for k, v in town_rects.items()) + '};')
out.append('export const BP_TOWN_BUILDINGS: number[] = [' + flat([(l, r, t, b) for l, r, t, b in town_bldgs]) + '];')
out.append('/** Walk solids outside the painted town (buildings, trees, rocks, inland water): l,r,t,b packed. */')
out.append('export const BP_SOLIDS: number[] = [' + flat(sol_rects) + '];')
out.append('/** Enterable doors outside the painted town (the town keeps its own). */')
LANDMARK_DOORS = [('tortuga_grotto', -411, 322), ('tortuga_wreck', -438, 298)]
out.append('export const BP_DOORS: { id: string; x: number; y: number }[] = [' + ', '.join(
    [f"{{ id: '{b[0]}', x: {door_point(b)[0]:g}, y: {door_point(b)[1]:g} }}" for b in P.BUILDINGS if b[0]]
    + [f"{{ id: '{i}', x: {x}, y: {y} }}" for i, x, y in LANDMARK_DOORS]) + '];')
txt = '\n'.join(out) + '\n'
open(f'{ROOT}/src/blueprint/tortugaBlueprint.generated.ts', 'w').write(txt)

print(f'trees {len(trees)}  solids {len(sol_rects)}  town rects', {k: len(v) for k, v in town_rects.items()})
print('PROBLEMS' if problems else 'no problems', *problems, sep='\n  ')

# ---------------------------------------------------------------- architect-style plan, in layers
import architect, re as _re
life = open(f'{ROOT}/src/town/townLife.generated.ts').read()
routes = [[(float(x), float(y)) for x, y in _re.findall(r'\[(-?[\d.]+), (-?[\d.]+)\]', line)]
          for line in _re.search(r'WALKER_ROUTES[^=]*= \[(.*?)\n\];', life, _re.S).group(1).strip().split('\n')]
lamps = [(float(x), float(y)) for x, y in _re.findall(r'\[(-?[\d.]+), (-?[\d.]+)\]', _re.search(r'DOOR_LAMPS[^=]*= \[(.*?)\];', life, _re.S).group(1))]
lamps += [(x, y) for k, x, y in P.PROPS if k == 'lamp']
lamps += [door_point(b) for b in P.BUILDINGS if b[2] in ('tavern', 'fort', 'manor') and door_point(b)]
bp_src = open(f'{ROOT}/src/data/blackPearl.ts').read()
mx, my = map(float, _re.search(r'BLACK_PEARL_START_OFFSET = \{ x: (-?[\d.]+), y: (-?[\d.]+) \}', bp_src).groups())
solid_geom = unary_union([box(l, t, r, b) for l, r, t, b in sol_rects] + [box(l, t, r, b) for l, r, t, b in blocks])
extra = {
    'solids': solid_geom.simplify(0.3),
    'routes': routes,
    'lamps': lamps,
    # Mirrors MapScreen's harbour ambience: loud north of y -340, fading out by y -200 (in town).
    'sound': [(-170, -470, 320, -340, 'HARBOUR: SURF & GULLS (LOUD)', 0.10), (-170, -340, 320, -200, 'HARBOUR: SURF (FADING)', 0.05)],
    'spawns': [(30, -100, 'START / SPAWN'), (mx, my, 'BLACK PEARL MOORING')],
}
# ---- height field, contours, cliffs
from skimage import measure
GX0, GY0, GS = -620, -580, 3
gw, gh = int(1240 / GS) + 1, int(1120 / GS) + 1
xs = GX0 + np.arange(gw) * GS; ys = GY0 + np.arange(gh) * GS
XX, YY = np.meshgrid(xs, ys)
hf = np.zeros_like(XX, dtype=float)
for hx, hy, hh, rx, ry in P.HILLS:
    hf += hh * np.exp(-2.2 * (((XX - hx) / rx) ** 2 + ((YY - hy) / ry) ** 2))
from shapely import contains_xy
land = contains_xy(coast, XX, YY)
from scipy.ndimage import distance_transform_edt
dist = distance_transform_edt(land) * GS
hf = np.where(land, hf * np.clip(dist / 30, 0, 1) + np.clip(dist / 40, 0, 1) * 3, 0.0)
def raw_height(x, y):
    return sum(hh * math.exp(-2.2 * (((x - hx) / rx) ** 2 + ((y - hy) / ry) ** 2)) for hx, hy, hh, rx, ry in P.HILLS)
def height_at(x, y):
    i = int(round((x - GX0) / GS)); j = int(round((y - GY0) / GS))
    return float(hf[min(max(j, 0), gh - 1), min(max(i, 0), gw - 1)])
contours, clabels = [], []
for lvl in range(5, 45, 5):
    lines = []
    for c in measure.find_contours(hf, lvl):
        pts = [(GX0 + cc[1] * GS, GY0 + cc[0] * GS) for cc in c]
        if len(pts) < 4: continue
        ln = LineString(pts).simplify(0.6).difference(town_box)
        if not ln.is_empty and ln.length > 12: lines.append(ln)
    if not lines: continue
    u = unary_union(lines)
    contours.append((lvl, architect.lines_d(u if u.geom_type != 'GeometryCollection' else unary_union([g for g in u.geoms if 'Line' in g.geom_type])), lvl % 20 == 0))
    if lvl % 10 == 0:
        longest = max((g for g in (u.geoms if hasattr(u, 'geoms') else [u])), key=lambda g: g.length)
        pt = longest.interpolate(0.5, normalized=True); clabels.append((round(pt.x, 1), round(pt.y, 1), lvl))
peaks = [(hx, hy, int(round(height_at(hx, hy)))) for hx, hy, hh, rx, ry in P.HILLS if hh >= 12]
cliff = []
ext = coast.exterior; Lc = ext.length; t = 0
while t < Lc:
    p0 = ext.interpolate(t); p1 = ext.interpolate(min(Lc, t + 1))
    dx, dy = p1.x - p0.x, p1.y - p0.y; n = math.hypot(dx, dy) or 1
    nx, ny = -dy / n, dx / n
    if not coast.contains(Point(p0.x + nx * 4, p0.y + ny * 4)): nx, ny = -nx, -ny
    if not town_box.contains(p0) and raw_height(p0.x + nx * 8, p0.y + ny * 8) > 10:
        cliff.append(f'M{p0.x:.1f} {p0.y:.1f}l{nx * 3.2:.1f} {ny * 3.2:.1f}')
    t += 2.5
# ---- ground surfaces
def U(rs): return unary_union([box(l, t_, r, b) for l, r, t_, b in rs])
dock_union = unary_union([g for *_, g in dock_geoms])
surfaces = {
    'cobble': unary_union([U(town_rects['street'])] + plaza_geoms).simplify(0.4),
    'plank': unary_union([U(town_rects['wood']), dock_union, bridges]).simplify(0.4),
    'sand': unary_union([beach, U(town_rects['sand'])]).difference(ways).simplify(0.4),
    'dirt': unary_union(road_geoms).difference(town_box).difference(bridges).simplify(0.4),
}
surfaces['grass'] = coast.difference(town_box).difference(unary_union([beach, ways, water] + [g for t_, g in zone_geoms if t_ in ('fields', 'sugarcane')])).simplify(0.6)
# ---- districts (Voronoi of the seeds, clipped to the island; Basse-Terre is the painted town)
from shapely.ops import voronoi_diagram
from shapely.geometry import MultiPoint
seeds = [d for d in P.DISTRICTS if d[0] != 'Basse-Terre']
vor = voronoi_diagram(MultiPoint([(x, y) for _, x, y, _ in seeds]), envelope=box(-700, -700, 700, 700))
land_out = coast.buffer(2).difference(town_box)
districts = []
for name_, x, y, known in P.DISTRICTS:
    if name_ == 'Basse-Terre':
        g = town_box.intersection(coast.buffer(60))
    else:
        cell = next(c for c in vor.geoms if c.contains(Point(x, y)))
        g = cell.intersection(land_out)
    if g.is_empty: continue
    if g.geom_type == 'MultiPolygon': g = max(g.geoms, key=lambda q: q.area)
    rp = g.representative_point() if not g.contains(Point(x, y)) else Point(x, y)
    districts.append((name_, g.simplify(0.5), round(rp.x, 1), round(rp.y, 1), known))
# ---- danger, shipping, triggers
enter_r = 26
danger = [
    ('area', coast, ('SAFE ZONE  ·  NO WILD ENCOUNTERS ON TORTUGA', (40, 140)), '#1e8449'),
    ('area', coast.buffer(30, join_style=1).difference(coast.buffer(29, join_style=1)) , ('OPEN SEA  ·  ENCOUNTERS WHILE SAILING', (-300, -520)), '#b03a2e'),
    ('ring', (mx, my, enter_r), 'DUEL: CAPTAIN ODESSA KANE (UNTIL THE SHIP IS WON)', '#b03a2e'),
]
shallows = coast.buffer(22, join_style=1).difference(coast).difference(town_box)
shallows = unary_union([shallows] + [g.buffer(10) for _, g in sea_zones]).simplify(0.6)
trig = [(x, y, 9, '') for _, x, y in doors] + [(b[3] + 0, b[4] + 0, 0, '') for b in []]
trig += [(door_point(b)[0], door_point(b)[1], 9, '') for b in P.BUILDINGS if b[0]]
trig += [(mx, my, enter_r, 'BOARD / DUEL FOR THE BLACK PEARL')]
for k, pid, x, y in pois:
    if k in ('quest', 'treasure', 'resource'):
        trig.append((x, y, enter_r, pid.replace('_', ' ').upper()))
extra.update({'contours': contours, 'contour_labels': clabels, 'cliffs': ''.join(cliff), 'peaks': peaks,
              'surfaces': surfaces, 'districts': [(n, g, x, y) for n, g, x, y, k in districts],
              'districts_disc': districts, 'danger': danger, 'shallows': shallows, 'triggers': trig})
# ---- boundaries and wildlife for the drawing; crab and gull spots for the game
extra['fence'], extra['hedge'], extra['wall'] = fence_geom, hedge_geom, wall_geom
wild = [(k, Polygon(p).buffer(0)) for k, p in P.WILDLIFE]
extra['wildlife'] = wild
rng2 = random.Random(21)
def spots(area, n, spacing):
    out_ = []
    if area.is_empty: return out_
    minx, miny, maxx, maxy = area.bounds
    for _ in range(4000):
        if len(out_) >= n: break
        x, y = rng2.uniform(minx, maxx), rng2.uniform(miny, maxy)
        if area.contains(Point(x, y)) and all((x - a) ** 2 + (y - b) ** 2 > spacing ** 2 for a, b in out_):
            out_.append((round(x, 1), round(y, 1)))
    return out_
crab_area = unary_union([g for k, g in wild if k == 'crabs']).intersection(beach)
gull_area = unary_union([g for k, g in wild if k == 'gulls']).intersection(unary_union([dock_union, U(town_rects['wood'])]))
crab_spots, gull_spots = spots(crab_area, 16, 10), spots(gull_area, 14, 12)
extra['crab_spots'], extra['gull_spots'] = crab_spots, gull_spots

# ---- gameplay data from the plan: districts (discovery), cliffs (no landing), surface grid (footsteps)
cliff_segs = []
t = 0; run = []
while t <= Lc:
    p0 = ext.interpolate(t)
    p1 = ext.interpolate(min(Lc, t + 1)); dx, dy = p1.x - p0.x, p1.y - p0.y; n_ = math.hypot(dx, dy) or 1
    nx, ny = -dy / n_, dx / n_
    if not coast.contains(Point(p0.x + nx * 4, p0.y + ny * 4)): nx, ny = -nx, -ny
    high = not town_box.contains(p0) and raw_height(p0.x + nx * 8, p0.y + ny * 8) > 10
    if high: run.append((round(p0.x, 1), round(p0.y, 1)))
    elif run:
        if len(run) > 1: cliff_segs.append(run)
        run = []
    t += 2.5
if len(run) > 1: cliff_segs.append(run)
SG = 4; sx0, sy0 = -620, -580
sw, sh = 1240 // SG, 1120 // SG
CX = sx0 + (np.arange(sw) + 0.5) * SG; CY = sy0 + (np.arange(sh) + 0.5) * SG
GX, GY = np.meshgrid(CX, CY)
grid = np.full(GX.shape, '.', dtype='<U1')
for code_, key in (('g', 'grass'), ('s', 'sand'), ('d', 'dirt'), ('c', 'cobble'), ('p', 'plank')):
    g = surfaces[key]
    if not g.is_empty: grid[contains_xy(g, GX, GY)] = code_
rle = []
for row in grid:
    r = ''.join(row); i = 0; parts_ = []
    while i < len(r):
        j = i
        while j < len(r) and r[j] == r[i]: j += 1
        parts_.append(f'{j - i}{r[i]}'); i = j
    rle.append(''.join(parts_))
g_out = ['// GENERATED by tools/blueprint/build_tortuga.py — gameplay read from the plan (island-relative units).',
         '', 'export const BP_DISTRICTS: { name: string; known: boolean; cx: number; cy: number; poly: number[] }[] = [']
for name_, g, cx, cy, known in districts:
    gg = g.simplify(1.0)
    if gg.geom_type != 'Polygon': gg = max(gg.geoms, key=lambda q: q.area)
    g_out.append(f"  {{ name: {name_!r}, known: {str(known).lower()}, cx: {cx}, cy: {cy}, poly: [{','.join(f'{x:.0f},{y:.0f}' for x, y in list(gg.exterior.coords)[:-1])}] }},")
g_out.append('];')
g_out.append('/** Coast runs where the land is high: no landing a boat here. Each is x,y pairs. */')
g_out.append('export const BP_CLIFFS: number[][] = [' + ', '.join('[' + ','.join(f'{x:g},{y:g}' for x, y in r) + ']' for r in cliff_segs) + '];')
g_out.append(f'/** Ground surface, {SG}-unit cells from ({sx0},{sy0}), {sw} x {sh}, run-length rows: g grass, s sand, d dirt, c cobbles, p planks, . none. */')
g_out.append(f'export const BP_SURFACE = {{ x0: {sx0}, y0: {sy0}, cell: {SG}, w: {sw}, h: {sh}, rows: [' + ','.join(f"'{r}'" for r in rle) + '] };')
reef = [g for _, g in sea_zones][0]
g_out.append('/** The coral reef shoal offshore (counts as shallows). */')
g_out.append('export const BP_REEF: number[] = [' + ','.join(f'{x:.0f},{y:.0f}' for x, y in list(reef.exterior.coords)[:-1]) + '];')
g_out.append('/** Townsfolk routes outside the painted town (there and back along the roads). */')
walk_loops = [w + w[-2:0:-1] for w in P.WALKS]
g_out.append('export const BP_WALKS: [number, number][][] = [' + ', '.join('[' + ', '.join(f'[{x}, {y}]' for x, y in w) + ']' for w in walk_loops) + '];')
g_out.append('/** Wildlife spots (island-relative): crabs scuttle on beaches, gulls sit on the docks. */')
g_out.append('export const BP_CRABS: [number, number][] = [' + ', '.join(f'[{x}, {y}]' for x, y in crab_spots) + '];')
g_out.append('export const BP_GULLS: [number, number][] = [' + ', '.join(f'[{x}, {y}]' for x, y in gull_spots) + '];')
poi_at = {pid: (x, y) for k, pid, x, y in pois}
g_out.append('/** One errand per district (plan_tortuga.py ERRANDS). */')
g_out.append('export const BP_ERRANDS: { id: string; district: string; person: string; sprite: string; x: number; y: number; resource: string; amount: number; gold: number; line: string }[] = [')
for e in P.ERRANDS:
    g_out.append(f"  {{ id: {e[0]!r}, district: {e[1]!r}, person: {e[2]!r}, sprite: {e[3]!r}, x: {poi_at[e[0]][0]:g}, y: {poi_at[e[0]][1]:g}, resource: {e[6]!r}, amount: {e[7]}, gold: {e[8]}, line: {e[9]!r} }},")
g_out.append('];')
poi_at = {pid: (x, y) for k, pid, x, y in pois}
g_out.append('export const BP_GATHER: { resource: string; id: string; x: number; y: number }[] = [' + ', '.join(f"{{ resource: {r!r}, id: {i!r}, x: {poi_at[i][0]:g}, y: {poi_at[i][1]:g} }}" for r, i, x, y in P.GATHER) + '];')
lh = next(b for b in P.BUILDINGS if b[0] == 'tortuga_lighthouse_tower')
g_out.append(f'export const BP_LIGHTHOUSE = {{ x: {lh[3]}, y: {lh[4]} }};')
g_out.append("export const BP_GROTTO = { x: -416, y: 318 };")
open(f'{ROOT}/src/blueprint/tortugaGameplay.generated.ts', 'w').write('\n'.join(g_out) + '\n')
extra['routes'] = routes + walk_loops

# ---- road name labels: along the longest stretch of each road, plus the town's streets
road_labels = []
for name_, k, w, pts in P.ROADS:
    if 'Spur' in name_: continue
    segs = list(zip(pts, pts[1:]))
    a_, b_ = max(segs, key=lambda sg: math.hypot(sg[1][0] - sg[0][0], sg[1][1] - sg[0][1]))
    L_ = math.hypot(b_[0] - a_[0], b_[1] - a_[1])
    if L_ < 24: continue
    ang = math.degrees(math.atan2(b_[1] - a_[1], b_[0] - a_[0]))
    if ang > 90: ang -= 180
    if ang < -90: ang += 180
    size = 3.0 if k == 'main' else 2.4
    road_labels.append(((a_[0] + b_[0]) / 2, (a_[1] + b_[1]) / 2, ang, name_, size, k == 'path'))
for name_, x, y, ang in P.TOWN_STREETS:
    road_labels.append((x, y, ang, name_, 3.0, False))
extra['road_labels'] = road_labels

parts = architect.make_svg(P, coast, zone_geoms, sea_zones, water, bridges, trees, pois, town_rects, town_bldgs, doors,
                           S.building_names(), door_point, town_box, dock_geoms, breakwater, extra)
import os
os.makedirs(f'{ROOT}/tools/blueprint/layers', exist_ok=True)
for fn in os.listdir(f'{ROOT}/tools/blueprint/layers'):
    if fn.endswith('.svg'): os.remove(f'{ROOT}/tools/blueprint/layers/{fn}')
ts = ['// GENERATED by tools/blueprint/build_tortuga.py (architect.py) — the architect-style site plan,',
      '// one standalone SVG per layer, bottom to top. Island-relative units, viewBox -620 -580 1240 1120.',
      '// Re-run the builder; never hand-edit. The same layers are saved as tools/blueprint/layers/*.svg.',
      '', 'export interface PlanLayer { id: string; name: string; on: boolean; group: string; svg: string }', '',
      'export const TORTUGA_PLAN_LAYERS: PlanLayer[] = [']
for i, (lid, name, on, group) in enumerate(architect.LAYERS):
    doc = architect.svg_doc(parts[lid])
    open(f'{ROOT}/tools/blueprint/layers/{i:02d}_{lid}.svg', 'w').write(doc)
    ts.append(f"  {{ id: '{lid}', name: {name!r}, on: {str(on).lower()}, group: '{group}', svg: `{doc.replace('`', chr(39))}` }},")
ts.append('];')
open(f'{ROOT}/src/blueprint/tortugaPlanSvg.ts', 'w').write('\n'.join(ts) + '\n')
everything = architect.svg_doc('\n'.join(parts[l[0]] for l in architect.LAYERS if l[2]))
open('/tmp/tortuga_plan.svg', 'w').write(everything)
open('/tmp/tortuga_plan_all.svg', 'w').write(architect.svg_doc('\n'.join(parts[l[0]] for l in architect.LAYERS)))
print('layers', len(architect.LAYERS), 'ts KB', os.path.getsize(f'{ROOT}/src/blueprint/tortugaPlanSvg.ts') // 1024)

# ---------------------------------------------------------------- preview
if len(sys.argv) > 2:
    import preview
    preview.draw(sys.argv[2], coast, beach, zone_geoms, water, P, town_rects, town_bldgs, doors, trees, door_point,
                 bridges=bridges, sea_zones=sea_zones, pois=pois)
