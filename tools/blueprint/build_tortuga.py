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
TOWN = (-150, 300, -455, 2336 / 4.8 - 455)  # l, r, t, b of the painted town
town_box = box(TOWN[0], TOWN[2], TOWN[1], TOWN[3])
coast = Polygon(S.coast()).buffer(0)
problems = []

# ---------------------------------------------------------------- geometry of the authored plan
def door_point(b):
    _, _, _, cx, cy, w, h, side = b
    return {'N': (cx, cy - h / 2), 'S': (cx, cy + h / 2), 'E': (cx + w / 2, cy), 'W': (cx - w / 2, cy), None: None}[side]

road_geoms = [LineString(pts).buffer(w / 2, cap_style=1, join_style=1) for _, _, w, pts in P.ROADS]
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

# ---------------------------------------------------------------- points of interest
blocks0, _ = S.painted()
town_blocked = unary_union([box(l, t, r, b) for l, r, t, b in blocks0])
taken = unary_union([unary_union(bldg_geoms).buffer(3), water.buffer(2), town_blocked]
                    + [Point(x, y).buffer(3.5) for x, y, _ in trees])
pois = []
for kind, pid, x, y in P.POIS:
    p = Point(x, y)
    ok = (coast.contains(p) or town_box.contains(p)) and not taken.contains(p)
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
sol_rects = [(X0 + i * C, X0 + k * C, Y0 + j * C, Y0 + jj * C) for i, k, j, jj in merge(sol)]

# ---------------------------------------------------------------- write TS
def poly_d(g):
    def ring(c): return 'M' + 'L'.join(f'{x:.1f} {y:.1f}' for x, y in list(c.coords)[:-1]) + 'Z'
    gs = [g] if g.geom_type == 'Polygon' else list(getattr(g, 'geoms', []))
    return ''.join(ring(p.exterior) + ''.join(ring(h) for h in p.interiors) for p in gs if p.geom_type == 'Polygon' and not p.is_empty)
def flat(rs): return ','.join(f'{a:g},{b:g},{c:g},{d:g}' for a, b, c, d in rs)

out = ['// GENERATED by tools/blueprint/build_tortuga.py from tools/blueprint/plan_tortuga.py and the painted',
       '// town walk map. Edit the plan and re-run — never hand-edit. Island-relative world units.',
       '', 'export interface BpBuilding { id: string | null; label: string; kind: string; l: number; t: number; w: number; h: number; door: [number, number] | null }',
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
    bl.append(f"  {{ id: {('null' if bid is None else repr(bid))}, label: {label!r}, kind: '{kind}', l: {cx - w / 2:g}, t: {cy - h / 2:g}, w: {w}, h: {h}, door: {('null' if d is None else f'[{d[0]:g}, {d[1]:g}]')} }},")
out.append('export const BP_BUILDINGS: BpBuilding[] = [\n' + '\n'.join(bl) + '\n];')
out.append(f"export const BP_BRIDGES = '{poly_d(bridges)}';")
out.append('export const BP_SEA_ZONES: { t: string; d: string }[] = [' + ', '.join(f"{{ t: '{t}', d: '{poly_d(g)}' }}" for t, g in sea_zones) + '];')
out.append('export const BP_POIS: [string, string, number, number][] = [' + ', '.join(f"['{k}', {i!r}, {x:g}, {y:g}]" for k, i, x, y in pois) + '];')
out.append('/** x, y, kind code (0 jungle, 1 tree, 2 palm, 3 rock, 4 mangrove), packed. */')
code = {'jungle': 0, 'tree': 1, 'palm': 2, 'rock': 3, 'mangrove': 4}
out.append('export const BP_TREES: number[] = [' + ','.join(f'{x:g},{y:g},{code[k]}' for x, y, k in trees) + '];')
out.append('export const BP_PROPS: [string, number, number][] = [' + ', '.join(f"['{k}', {x}, {y}]" for k, x, y in P.PROPS) + '];')
out.append('export const BP_LABELS: [number, number, string, string][] = [' + ', '.join(f"[{x}, {y}, {t!r}, '{s}']" for x, y, t, s in P.LABELS) + '];')
out.append('/** The painted town as a plan: l,r,t,b rects per surface, derived from its walk map. */')
out.append('export const BP_TOWN: Record<string, number[]> = {\n' + ''.join(f"  {k}: [{flat(v)}],\n" for k, v in town_rects.items()) + '};')
out.append('export const BP_TOWN_BUILDINGS: number[] = [' + flat([(l, r, t, b) for l, r, t, b in town_bldgs]) + '];')
out.append('/** Walk solids outside the painted town (buildings, trees, rocks, inland water): l,r,t,b packed. */')
out.append('export const BP_SOLIDS: number[] = [' + flat(sol_rects) + '];')
out.append('/** Enterable doors outside the painted town (the town keeps its own). */')
out.append('export const BP_DOORS: { id: string; x: number; y: number }[] = [' + ', '.join(
    f"{{ id: '{b[0]}', x: {door_point(b)[0]:g}, y: {door_point(b)[1]:g} }}" for b in P.BUILDINGS if b[0]) + '];')
txt = '\n'.join(out) + '\n'
open(f'{ROOT}/src/blueprint/tortugaBlueprint.generated.ts', 'w').write(txt)

print(f'trees {len(trees)}  solids {len(sol_rects)}  town rects', {k: len(v) for k, v in town_rects.items()})
print('PROBLEMS' if problems else 'no problems', *problems, sep='\n  ')

# ---------------------------------------------------------------- architect-style plan (the in-game Plan view)
import architect
svg = architect.make_svg(P, coast, zone_geoms, sea_zones, water, bridges, trees, pois, town_rects, town_bldgs, doors,
                         S.building_names(), door_point, town_box)
open(f'{ROOT}/src/blueprint/tortugaPlanSvg.ts', 'w').write(
    '// GENERATED by tools/blueprint/build_tortuga.py (architect.py) — the architect-style site plan.\n'
    '// Island-relative world units, viewBox -620 -540 1240 1080. Re-run the builder; never hand-edit.\n'
    'export const TORTUGA_PLAN_SVG = `' + svg.replace('`', "'") + '`;\n')
open('/tmp/tortuga_plan.svg', 'w').write(svg)
print('plan svg', len(svg) // 1024, 'KB')

# ---------------------------------------------------------------- preview
if len(sys.argv) > 2:
    import preview
    preview.draw(sys.argv[2], coast, beach, zone_geoms, water, P, town_rects, town_bldgs, doors, trees, door_point,
                 bridges=bridges, sea_zones=sea_zones, pois=pois)
