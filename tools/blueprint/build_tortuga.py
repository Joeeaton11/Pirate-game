"""Build the Tortuga blueprint: plan_tortuga.py (authored, outside the town) + the painted town's
walk map (derived) -> src/blueprint/tortugaBlueprint.generated.ts and a preview image.
Usage: python3 build_tortuga.py <town.png> [preview.png]"""
import sys, random, math, json
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from shapely.geometry import Polygon, LineString, Point, box
from shapely.ops import unary_union
import sources as S
import plan_tortuga as P

ROOT = S.ROOT
# ---- edits made in the game's Plan editor (exported JSON pasted into edits_tortuga.json)
import json as _json, os as _os, re as _re0
EDITS = _json.load(open(_os.path.join(_os.path.dirname(__file__), 'edits_tortuga.json')))
def bkey(b): return b[0] or f'{b[1]}@{b[3]:g},{b[4]:g}'
P_ORIG = list(P.BUILDINGS); PROPS_ORIG = list(P.PROPS)
P.BUILDINGS = [tuple(list(b[:3]) + [b[3] + EDITS['buildings'].get(bkey(b), [0, 0])[0], b[4] + EDITS['buildings'].get(bkey(b), [0, 0])[1]] + list(b[5:])) for b in P.BUILDINGS]
def pkey(p): return f'{p[0]}@{p[1]:g},{p[2]:g}'
P.PROPS = [(p[0], p[1] + EDITS['props'].get(pkey(p), [0, 0])[0], p[2] + EDITS['props'].get(pkey(p), [0, 0])[1]) for p in P.PROPS]
# deletions, resizes and additions from the editor (keys refer to the plan as authored)
_db, _dp = set(EDITS.get('deleted_buildings', [])), set(EDITS.get('deleted_props', []))
_keep = [i for i, b in enumerate(P_ORIG) if bkey(b) not in _db]
P_ORIG = [P_ORIG[i] for i in _keep]
P.BUILDINGS = [tuple(list(b[:5]) + list(EDITS.get('resized', {}).get(bkey(P_ORIG[k]), b[5:7])) + [b[7]]) for k, b in enumerate(P.BUILDINGS[i] for i in _keep)]
_keepp = [i for i, p in enumerate(PROPS_ORIG) if pkey(p) not in _dp]
PROPS_ORIG = [PROPS_ORIG[i] for i in _keepp]; P.PROPS = [P.PROPS[i] for i in _keepp]
for _a in EDITS.get('added', []):
    if _a['what'] == 'cottage': P.BUILDINGS.append((None, 'Cottage', 'home', _a['x'], _a['y'], _a['w'], _a['h'], 'S')); P_ORIG.append(P.BUILDINGS[-1])
    elif _a['what'] != 'tree': P.PROPS.append((_a['what'], _a['x'], _a['y'])); PROPS_ORIG.append(P.PROPS[-1])
TOWN = (-150, 300, -455, 2336 / 4.8 - 455)  # l, r, t, b of the painted town
town_box = box(TOWN[0], TOWN[2], TOWN[1], TOWN[3])
coast = Polygon(S.coast()).buffer(0)
problems = []

# ---------------------------------------------------------------- geometry of the authored plan
def door_point(b):
    _, _, _, cx, cy, w, h, side = b
    return {'N': (cx, cy - h / 2), 'S': (cx, cy + h / 2), 'E': (cx + w / 2, cy), 'W': (cx - w / 2, cy), None: None}[side]

# the island's roads wind with the land instead of running ruler-straight: long straight stretches
# get a gentle meander, kept straight near buildings, rivers, junctions and their ends
def _wind(pts, w, seed):
    from shapely.geometry import box as _bx2
    rr = random.Random(seed)
    blds = unary_union([_bx2(b[3] - b[5] / 2 - w / 2 - 3, b[4] - b[6] / 2 - w / 2 - 3, b[3] + b[5] / 2 + w / 2 + 3, b[4] + b[6] / 2 + w / 2 + 3) for b in P.BUILDINGS])
    wet = unary_union([LineString(r_['pts']).buffer(r_['w'] / 2 + 14) for r_ in P.RIVERS])
    out = [pts[0]]
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        L = math.hypot(x1 - x0, y1 - y0)
        n = int(L // 22)
        if n >= 2:
            nx_, ny_ = -(y1 - y0) / L, (x1 - x0) / L
            ph = rr.uniform(0, 6.28); amp = min(5.5, L / 14)
            for k in range(1, n):
                f = k / n
                o = amp * math.sin(ph + f * math.pi * rr.choice([1.5, 2, 2.5])) * math.sin(math.pi * f)
                q = (x0 + (x1 - x0) * f + nx_ * o, y0 + (y1 - y0) * f + ny_ * o)
                if not blds.contains(Point(*q)) and not wet.contains(Point(*q)): out.append((round(q[0], 1), round(q[1], 1)))
        out.append((x1, y1))
    return out
import random
P.ROADS = [(n_, k_, w_, _wind(p_, w_, i_) if k_ in ('main', 'lane', 'path') else p_) for i_, (n_, k_, w_, p_) in enumerate(P.ROADS)]
import town_plan
P.ROADS = list(P.ROADS) + town_plan.STREETS
P.PROPS = [q for q in P.PROPS if not town_plan.SQUARE.buffer(3).contains(Point(q[1], q[2]))]  # the square is dressed by dressing.py  # the town's own streets: walkable and checked like any road
# Flat road ends (no rounded caps): the plan is what the artwork copies.
road_geoms = [LineString(pts).buffer(w / 2, cap_style=2, join_style=1) for _, _, w, pts in P.ROADS]
dock_geoms = [(n, k, w, LineString(pts).buffer(w / 2, cap_style=2, join_style=2)) for n, k, w, pts in P.DOCKS]
breakwater = unary_union([LineString(m).buffer(4, cap_style=1) for m in P.MOLES])
plaza_geoms = [box(l, t, r, b) for _, l, r, t, b in P.PLAZAS]
ways = unary_union(road_geoms + plaza_geoms)
bldg_geoms = [box(cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2) for _, _, _, cx, cy, w, h, _ in P.BUILDINGS]
import math as _mth
_lc, _lr = P.LAGOON['c'], P.LAGOON['r']
lagoon = Polygon([(_lc[0] + _mth.cos(a) * _lr * (1 + 0.16 * _mth.sin(3 * a + 1) + 0.09 * _mth.cos(5 * a)), _lc[1] + _mth.sin(a) * _lr * 0.86 * (1 + 0.12 * _mth.cos(2 * a + 0.5)))
                  for a in [k * 2 * _mth.pi / 48 for k in range(48)]])  # an organic pool, not a circle
rivers = unary_union([LineString(r['pts']).buffer(r['w'] / 2) for r in P.RIVERS])
bridges = unary_union(road_geoms).intersection(rivers.buffer(1.5))
# every road that crosses a river gets a proper bridge spanning bank to bank
BRIDGE_SPANS = []
for _n, _k, _w, _pts in P.ROADS:
    _x = LineString(_pts).intersection(rivers.buffer(3.2))
    for _seg in getattr(_x, 'geoms', [_x]):
        if _seg.geom_type == 'LineString' and _seg.length > 1: BRIDGE_SPANS.append((_n, _k, _w, list(_seg.coords)))
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
    if t in getattr(P, 'FENCED', []): bounds_fence.append(LineString(g.exterior.coords))
_trace = Polygon(P.FORT_TRACE)
_bast = [Polygon([(x - 11, y), (x, y - 11), (x + 11, y), (x, y + 11)]) for x, y in P.FORT_BASTIONS]
fort_area = unary_union([_trace] + _bast).intersection(coast.buffer(-3))
fort_area = max(getattr(fort_area, 'geoms', [fort_area]), key=lambda g: g.area)
fort_line = LineString(fort_area.exterior.coords)
gaps = unary_union([LineString(pts).buffer(w / 2 + 3, cap_style=2) for n, k, w, pts in P.ROADS] + [box(l, t, r, b_) for _, l, r, t, b_ in P.PLAZAS]
                   + [box(*g) for g in P.FORT_GATES])
fort_wall = fort_line.difference(gaps)
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
        if not {'Wing', 'Bell Tower'} & {b[1], P.BUILDINGS[j][1]} and g.buffer(2).intersects(bldg_geoms[j]): problems.append(f'{b[1]} touches {P.BUILDINGS[j][1]}')
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
blocked_for_trees = unary_union([fort_area.buffer(2), ways.buffer(5), unary_union(bldg_geoms).buffer(7), water.buffer(4),
                                 town_box.buffer(6), Point(-290, 202).buffer(26)] + [g for t, g in zone_geoms if t in ('fields', 'graveyard', 'garden', 'sugarcane', 'paddock', 'allotment', 'pen', 'orchard', 'quarry')])
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
trees += [(_a['x'], _a['y'], 'tree') for _a in EDITS.get('added', []) if _a['what'] == 'tree']
trees += list(P.ORCHARD_TREES); TREES_ORIG += [(x, y) for x, y, k in P.ORCHARD_TREES]
TREES_ORIG += [(_a['x'], _a['y']) for _a in EDITS.get('added', []) if _a['what'] == 'tree']

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

# ---------------------------------------------------------------- the life sheet (plan_life.py)
from shapely.ops import nearest_points as _np
dock_area = unary_union([g for *_, g in dock_geoms])
_bld = unary_union(bldg_geoms).buffer(1.5)
_wet = water.buffer(1)
def free_spot(x, y, name, town=False, way=False, dock=False):
    p = Point(x, y)
    area = coast.buffer(-1.5) if town else coast.buffer(-1.5).difference(town_box)
    if dock: area = area.union(dock_area)
    bad = unary_union([_bld, _wet] + ([] if way else [ways.buffer(1.5)]))
    ok = area.difference(bad)
    if ok.contains(p): return (x, y)
    q = _np(ok, p)[0]
    problems.append(f'{name} moved from ({x:g},{y:g}) to ({q.x:.0f},{q.y:.0f})')
    return (round(q.x, 1), round(q.y, 1))

# hand-placed props: off buildings and out of the water (docks allowed)
_moved = []
_extra_set = set(P.EXTRA_PROPS) | set(P.PIRATE_PROPS) | {('notice', x, y) for _, x, y in P.NOTICE_BOARDS} | {('bottle', x, y) for x, y, _ in P.BOTTLES}
for k, x, y in P.PROPS:
    p = Point(x, y)
    if (k, x, y) not in _extra_set: _moved.append((k, x, y)); continue
    if _bld.contains(p) or _wet.contains(p) or not (coast.contains(p) or dock_area.contains(p) or town_box.contains(p)):
        if k in P.SEA_PROPS or k in ('falls', 'spring', 'cave'): _moved.append((k, x, y)); continue
        x, y = free_spot(x, y, f'prop {k}', town=town_box.contains(p), way=True, dock=True)
    _moved.append((k, x, y))
P.PROPS = _moved

# automatic props round every building, chosen by kind, on the sides away from the door
PROP_BY_KIND = {'tavern': ['rum_barrels', 'parrot_perch', 'bench'], 'shop': ['crates', 'flowerpot', 'lantern'], 'market': ['crates', 'barrels', 'stall'],
                'warehouse': ['crates', 'barrels', 'cart'], 'home': ['flowerpot', 'woodpile', 'water_butt', 'barrels', 'flowerpot', 'crates'],
                'civic': ['bench', 'lantern', 'flowerpot'], 'fort': ['cannonballs', 'barrels'], 'shed': ['woodpile', 'barrels', 'crates'],
                'mill': ['barrels', 'cart'], 'manor': ['flowerpot', 'lantern', 'statue'], 'ruin': ['rubble', 'rubble'], 'landmark': ['lantern']}
_rng = random.Random(11)
_pts = [(x, y) for _, x, y in P.PROPS]
auto_props = []
for b in P.BUILDINGS:
    bid, label, kind, cx, cy, w, h, side = b
    if label in ('Wing', 'Gate Tower'): continue
    kinds = PROP_BY_KIND.get(kind, [])
    want = 2 if label == 'Cottage' else 4
    cands = []
    for sd in 'NSEW':
        if sd == side: continue
        for t in (0.2, 0.5, 0.8):
            if sd in 'NS': cands.append((cx - w / 2 + w * t, cy + (h / 2 + 3.5) * (1 if sd == 'S' else -1)))
            else: cands.append((cx + (w / 2 + 3.5) * (1 if sd == 'E' else -1), cy - h / 2 + h * t))
    _rng.shuffle(cands)
    for x, y in cands:
        if want == 0: break
        p = Point(x, y)
        if town_box.contains(p) or not coast.buffer(-1.5).contains(p) or ways.buffer(1.5).contains(p) or _wet.contains(p): continue
        if any(g.buffer(1.2).contains(p) for g in bldg_geoms): continue
        if any(math.hypot(x - a, y - c) < 4.5 for a, c in _pts): continue
        k = kinds[_rng.randrange(len(kinds))] if kinds else 'barrels'
        x, y = round(x, 1), round(y, 1)
        key = f'{k}@{x:g},{y:g}'
        if key in EDITS.get('deleted_props', []): want -= 1; continue
        dx, dy = EDITS['props'].get(key, [0, 0])
        auto_props.append((k, x + dx, y + dy)); PROPS_ORIG.append((k, x, y)); _pts.append((x, y)); want -= 1
P.PROPS = list(P.PROPS) + auto_props
# a hanging sign beside every tavern and shop door
for b in P.BUILDINGS:
    bid, label, kind, cx, cy, w, h, side = b
    if kind not in ('tavern', 'shop') or not side: continue
    dx, dy = {'S': (w * 0.3, h / 2 + 1.5), 'N': (w * 0.3, -h / 2 - 1.5), 'E': (w / 2 + 1.5, h * 0.3), 'W': (-w / 2 - 1.5, h * 0.3)}[side]
    k = 'tavern_sign' if kind == 'tavern' else 'shop_sign'
    P.PROPS.append((k, round(cx + dx, 1), round(cy + dy, 1))); PROPS_ORIG.append(P.PROPS[-1])
bottles = []
for x, y, msg in P.BOTTLES:
    q = next(((a, b_) for k, a, b_ in P.PROPS if k == 'bottle' and math.hypot(a - x, b_ - y) < 60), (x, y))
    bottles.append((q[0], q[1], msg))

fishing = [(i, *free_spot(x, y, f'fishing {i}'), wh) for i, x, y, wh in P.FISHING]
digs = []
for did, lm, lx, ly, n, d, gold, clue in P.DIG_SPOTS:
    x, y = free_spot(lx + P.DIRS[d][0] * n, ly + P.DIRS[d][1] * n, did, way=True)
    digs.append((did, lm, lx, ly, x, y, gold, clue))
collect = [(dist, *free_spot(x, y, f'skull {dist}', town=(dist == 'Basse-Terre'))) for dist, x, y in P.COLLECTIBLES]
views = [(n, x, y, ds) for n, x, y, ds in P.VIEWPOINTS]
notices = [(dist, *free_spot(x, y, f'notice {dist}', town=(dist == 'Basse-Terre'), way=True)) for dist, x, y in P.NOTICE_BOARDS]
events = [(k, *free_spot(x, y, f'event {k}', way=True)) for k, x, y in P.EVENTS]
# shelters: a porch in front of every tavern, shop and market door, plus the market roofs
shelters = []
for b in P.BUILDINGS:
    bid, label, kind, cx, cy, w, h, side = b
    if kind not in ('tavern', 'shop', 'market') or not side: continue
    pw = (w if side in 'NS' else h) * 0.7
    if side == 'S': shelters.append((cx - pw / 2, cy + h / 2, cx + pw / 2, cy + h / 2 + 4))
    elif side == 'N': shelters.append((cx - pw / 2, cy - h / 2 - 4, cx + pw / 2, cy - h / 2))
    elif side == 'E': shelters.append((cx + w / 2, cy - pw / 2, cx + w / 2 + 4, cy + pw / 2))
    else: shelters.append((cx - w / 2 - 4, cy - pw / 2, cx - w / 2, cy + pw / 2))
# homes and haunts: each errand-giver lives in the nearest free cottage and drinks/sits nearby
cottages = [(b[3], b[4]) for b in P.BUILDINGS if b[1] == 'Cottage']
haunts = [(b[3], b[4]) for b in P.BUILDINGS if b[2] == 'tavern'] + [((l + r) / 2, (t + b_) / 2) for _, l, r, t, b_ in P.PLAZAS] + \
         [(x, y) for k, x, y in P.PROPS if k in ('well', 'bench')]
people, _used = [], set()
for e in P.ERRANDS:
    ex, ey = e[4], e[5]
    free_c = [c for c in cottages if c not in _used] or cottages
    home = min(free_c, key=lambda c: math.hypot(c[0] - ex, c[1] - ey)); _used.add(home)
    haunt = min(haunts, key=lambda c: math.hypot(c[0] - home[0], c[1] - home[1]) + 0.5 * math.hypot(c[0] - ex, c[1] - ey))
    people.append((e[2], e[1], home, (ex, ey), haunt))

# ---------------------------------------------------------------- the painted town, derived
blocks, doors = S.painted()
import importlib.util
spec = importlib.util.spec_from_file_location('mapdata', f'{ROOT}/tools/town/painted/mapdata.py')
md = importlib.util.module_from_spec(spec); spec.loader.exec_module(md)
terraces = []
for l, r, t, b, dx, i in md.B:
    if l is not None: terraces.append([l, r, t, b, []])
    if dx is not None: terraces[-1][4].append(dx)
town_bldgs = []  # one footprint per house: terraces split midway between their doors
for l, r, t, b, dxs in terraces:
    dxs = sorted(dxs)
    if len(dxs) >= 2:
        cuts = [l] + [round((dxs[k] + dxs[k + 1]) / 2, 1) for k in range(len(dxs) - 1)] + [r]
    elif not dxs and r - l > 30:
        n = int((r - l) // 18); cuts = [round(l + (r - l) * k / n, 1) for k in range(n + 1)]
    else:
        cuts = [l, r]
    for a, c in zip(cuts, cuts[1:]):
        # stagger the frontage a little so a row reads as separate houses
        k = len(town_bldgs)
        town_bldgs.append((a, c, t + (0, 1.5, 0.8)[k % 3], b))
town_walls = []  # the old painted town's terrace strips: town streets meet as plain junctions now
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
# tidy the leftovers of the old painted map: garden scraps and ponds that no longer belong to a house
# become street, and the gardens that stay lose their stair-stepped edges
from scipy.ndimage import binary_opening as _bo, label as _lab
_house = np.zeros((ny, nx), bool)
for l, r, t, b in town_bldgs:
    _house[max(0, int((t - TOWN[2]) / CELL) - 1):int(math.ceil((b - TOWN[2]) / CELL)) + 1,
           max(0, int((l - TOWN[0]) / CELL) - 1):int(math.ceil((r - TOWN[0]) / CELL)) + 1] = True
_wl, _wn = _lab(cls == 2)
for k in range(1, _wn + 1):
    if (_wl == k).sum() * CELL * CELL < 300: cls[_wl == k] = 3  # garden ponds: not drawn, so not kept
_g = cls == 3
_free = _bo(_g & ~_house, structure=np.ones((3, 3)), iterations=2)
_fl, _fn = _lab(_free)
_keepg = np.zeros_like(_g)
for k in range(1, _fn + 1):
    if (_fl == k).sum() >= 90: _keepg |= _fl == k
from scipy.ndimage import binary_dilation as _bd
_harb = _bd(cls == 2, iterations=6)
_gone = _g & ~(_house | _keepg)
cls[_gone & _harb] = 2   # scraps out in the harbour are water
cls[_gone & ~_harb] = 0  # scraps in town are street
print('  town tidy: garden cells removed', int(_gone.sum()))
# clean ground: the old painting's pixel noise must not survive into the reference the artist copies.
# 1) every patch smaller than a small yard is absorbed by whatever surrounds it
# 2) a majority filter smooths stair-stepped and ragged edges into clean runs
from scipy.ndimage import uniform_filter as _uf
def _absorb(cls, min_cells):
    changed = 0
    for c in range(5):
        lab, n = _lab(cls == c)
        for k in range(1, n + 1):
            blob = lab == k
            if blob.sum() >= min_cells: continue
            ring = _bd(blob, iterations=1) & ~blob
            if not ring.any(): continue
            vals = np.bincount(cls[ring], minlength=5); vals[c] = 0
            cls[blob] = int(vals.argmax()); changed += int(blob.sum())
    return changed
_n1 = _absorb(cls, 30)
for _it in range(3):
    _cnt = np.stack([_uf((cls == c).astype(float), size=5, mode='nearest') for c in range(5)])
    _maj = _cnt.argmax(0).astype(np.uint8)
    _strong = _cnt.max(0) > 0.6
    cls = np.where(_strong, _maj, cls).astype(np.uint8)
_n2 = _absorb(cls, 30)
# per-material rules: no cobble islands on the beach or wharf, no gardens or ponds cut off in the harbour
def _absorb_class(cls, c, min_cells, into=None):
    lab, n = _lab(cls == c); moved = 0
    sizes = np.bincount(lab.ravel())
    big = sizes[1:].argmax() + 1 if n else 0
    for k in range(1, n + 1):
        blob = lab == k
        if k == big and c == 2: continue          # the harbour itself
        if blob.sum() >= min_cells: continue
        ring = _bd(blob, iterations=1) & ~blob
        vals = np.bincount(cls[ring], minlength=5); vals[c] = 0
        cls[blob] = into if into is not None else int(vals.argmax()); moved += int(blob.sum())
    return moved
_n3 = _absorb_class(cls, 0, 400) + _absorb_class(cls, 2, 600)
_lg, _ng = _lab(cls == 3)
for k in range(1, _ng + 1):
    blob = _lg == k
    if (_bd(blob, iterations=2) & (cls == 2)).any() and not (blob & _house).any(): cls[blob] = 2; _n3 += int(blob.sum())
_n2 += _n3
print('  ground clean-up: fragment cells absorbed', _n1 + _n2)

# the town plan: Basse-Terre redrawn as a harbour town of winding streets and alleys (town_plan.py)
_bts = open(f'{ROOT}/src/data/buildings.ts').read()
_types = dict(_re0.findall(r"id: '(tortuga_[a-z0-9_]+)',\s*\n\s*islandId: 'tortuga_cove',\s*\n\s*name: [^\n]+\n\s*type: '([a-z]+)'", _bts))
cls, town_bldgs, doors, INFILL = town_plan.layout(cls, TOWN, CELL, _types)
# townsfolk routes and door lamps for the town life layer follow the new streets
_life_p = f'{ROOT}/src/town/townLife.generated.ts'; _life = open(_life_p).read()
_routes = []
for _n, _k, _w, _pts in town_plan.STREETS:
    if _w < 6: continue
    _routes.append(list(_pts) + list(reversed(_pts[:-1])))
_life = _re0.sub(r'export const WALKER_ROUTES: \[number, number\]\[\]\[\] = \[.*?\n\];',
                 'export const WALKER_ROUTES: [number, number][][] = [\n' + ''.join('  [' + ', '.join(f'[{x:g}, {y:g}]' for x, y in r) + '],\n' for r in _routes) + '];', _life, flags=_re0.S)
_life = _re0.sub(r'export const DOOR_LAMPS: \[number, number\]\[\] = \[.*?\];',
                 'export const DOOR_LAMPS: [number, number][] = [' + ', '.join(f'[{x:g}, {y - 7:g}]' for i, x, y in doors if i) + '];', _life, flags=_re0.S)
open(_life_p, 'w').write(_life)
_keep_open = unary_union([LineString(pts).buffer(w / 2 + 5) for n_, k_, w, pts in P.ROADS] +
                         [Point(x, y).buffer(9) for _, x, y in doors] +
                         [box(l - 6, t - 6, r + 6, b + 9) for l, r, t, b in town_bldgs] +
                         [box(l - 4, t - 4, r + 4, b + 4) for _, l, r, t, b in P.PLAZAS])
# the harbour, squared up (2026-11-24, user: docks and wharves should be straight): the painted
# map left ragged, blobby planking; real wharves were built in straight runs on pilings. Lay the
# whole harbour out again as clean rectangles: one long quay, a straight west wharf, the Long Pier
# and the Middle Pier as T-shaped piers, and a square east wharf. Everything else in the basin is water.
def _cells(l, r, t, b):
    return (slice(max(0, int(round((t - TOWN[2]) / CELL))), max(0, int(round((b - TOWN[2]) / CELL)))),
            slice(max(0, int(round((l - TOWN[0]) / CELL))), max(0, int(round((r - TOWN[0]) / CELL)))))
cls[_cells(-100, 258, -455, -287)] = 2
for _r in [(-100, 258, -317, -287),   # the quay, the full length of the harbour
           (-100, -82, -455, -317),   # west wharf along the beach
           (-18, -4, -388, -317),     # Long Pier stem
           (-56, 34, -403, -388),     # Long Pier T-head
           (70, 84, -372, -317),      # Middle Pier stem
           (58, 122, -386, -372),     # Middle Pier head
           (196, 258, -373, -317)]:   # east wharf
    cls[_cells(*_r)] = 1
cls[_cells(258, 300, -455, -373)] = 2          # the old planking by the fort becomes water...
cls[_cells(262, 300, -400, -392)] = 1          # ...with the fort's own jetty running out from its water gate
_bw = cls[_cells(-150, -100, -455, -287)]
_bw[_bw == 1] = 4  # stray planking poking out over the beach becomes sand again
# slips: the solid wharves get berths of open water cut into their seaward edge, so they read as piers
# on pilings with water between them (like the target), not one great plank floor
_slips = 0
for _j in range(1, ny):
    for _i in range(0, nx, 1):
        if not (cls[_j, _i] == 1 and cls[_j - 1, _i] == 2): continue      # a wood cell with open water to its north
        sw, sd = 4, 11                                                     # 8 units wide, 22 deep (in cells)
        if _i + sw + 3 > nx or _j + sd + 4 > ny or _i - 3 < 0: continue
        blk_ = cls[_j:_j + sd + 4, _i - 3:_i + sw + 3]
        if not (blk_ == 1).all(): continue                                 # planking all round it, with room to spare
        if not (cls[_j - 1, _i:_i + sw] == 2).all(): continue
        l, t = TOWN[0] + _i * CELL, TOWN[2] + _j * CELL
        g = box(l, t, l + sw * CELL, t + sd * CELL)
        if _keep_open.intersects(g.buffer(2)): continue
        cls[_j:_j + sd, _i:_i + sw] = 2; _slips += 1
        _gap = random.Random(_i * 31 + _j).uniform(26, 46)  # fewer berths, unevenly spaced
        _keep_open = _keep_open.union(box(l - _gap, t - 2, l + sw * CELL + _gap, t + sd * CELL + 4))
print('  wharf slips', _slips)
# the wharves: the biggest stretches of open planking get dockside warehouses and sheds
_wood = cls == 1
_wh = []
for _w, _d in ((26, 13), (18, 11)):
    for _j in range(0, ny):
        for _i in range(0, nx):
            l, t = TOWN[0] + _i * CELL, TOWN[2] + _j * CELL
            r, b = l + _w, t + _d
            i1, j1 = int(math.ceil((r - TOWN[0]) / CELL)), int(math.ceil((b - TOWN[2]) / CELL))
            mi0, mj0, mi1, mj1 = _i - 4, _j - 4, i1 + 5, j1 + 5
            if mi0 < 0 or mj0 < 0 or mi1 > nx or mj1 > ny: continue
            if not _wood[mj0:mj1, mi0:mi1].all(): continue
            g = box(l, t, r, b)
            if _keep_open.intersects(g.buffer(1)): continue
            _wh.append((l, r, t, b)); _keep_open = _keep_open.union(box(l - 8, t - 8, r + 8, b + 10))
            _wood[mj0:mj1, mi0:mi1] = False
town_bldgs.extend([(round(l, 1), round(r, 1), round(t, 1), round(b, 1)) for l, r, t, b in _wh])
print('  wharf sheds', len(_wh))

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

# ---------------------------------------------------------------- building sprites (needed for the town's walk solids)
import art_slots
art_slots.INFILL = INFILL
_assets, _drawn_b, _stats = art_slots.build(ROOT, P, trees, town_box, (town_bldgs, doors))
print('art slots', _stats)

# ---------------------------------------------------------------- walk solids outside the town
X0, X1, Y0, Y1, C = -600, 600, -520, 520, 1
W_, H_ = int((X1 - X0) / C), int((Y1 - Y0) / C)
sol = np.zeros((H_, W_), bool)
BURN_TAGS = {}
def burn(g, tag='other'):
    BURN_TAGS.setdefault(tag, []).append(g)
    minx, miny, maxx, maxy = g.bounds
    for j in range(max(0, int((miny - Y0) / C)), min(H_, int((maxy - Y0) / C) + 1)):
        for i in range(max(0, int((minx - X0) / C)), min(W_, int((maxx - X0) / C) + 1)):
            if g.contains(Point(X0 + (i + .5) * C, Y0 + (j + .5) * C)): sol[j, i] = True
for g, b in zip(bldg_geoms, P.BUILDINGS):
    burn(g.buffer(-1), 'building')
burn(water.buffer(1.2), 'water')  # the whole river and its muddy bank: Scally's feet stop at the edge, not mid-stream
for x, y, k in trees:
    burn(Point(x, y).buffer(2.6 if k == 'rock' else 1.6), 'tree')  # trunks and boulders, not the crowns
for g_, wdt in ((fence_geom, 0.7), (hedge_geom, 1.1), (wall_geom, 1.1), (fort_wall, 2.4)):
    if not g_.is_empty: burn(g_.buffer(wdt), 'fence/hedge/wall')
# terraces: retaining walls along the south half of each high-ground ellipse, cut where roads climb
_road_cut = unary_union([LineString(pts).buffer(w / 2 + 1.5) for n_, k_, w, pts in P.ROADS if k_ != 'secret'])
terrace_walls, terrace_stairs = [], []
for tcx, tcy, trx, try_ in P.TERRACES:
    arc = LineString([(tcx + math.cos(a) * trx, tcy + math.sin(a) * try_) for a in [math.radians(d) for d in range(15, 166, 3)]])
    arc = arc.intersection(coast.buffer(-3))
    for seg in getattr(arc, 'geoms', [arc]):
        if seg.is_empty or seg.geom_type != 'LineString': continue
        cut = seg.difference(_road_cut).difference(unary_union(bldg_geoms).buffer(2))
        for piece in getattr(cut, 'geoms', [cut]):
            if piece.geom_type == 'LineString' and piece.length > 2: terrace_walls.append(list(piece.coords))
        st = seg.intersection(_road_cut)
        for piece in getattr(st, 'geoms', [st]):
            if piece.geom_type == 'LineString' and piece.length > 1:
                # the flight runs along the road that climbs here, whatever angle it takes
                mid = piece.interpolate(0.5, normalized=True); best = None
                for n_, k_, w_, pts_ in P.ROADS:
                    if k_ == 'secret': continue
                    rl = LineString(pts_); dd = rl.distance(mid)
                    if best is None or dd < best[0]:
                        pr = rl.project(mid); a_ = rl.interpolate(max(0, pr - 1)); b_ = rl.interpolate(min(rl.length, pr + 1))
                        best = (dd, math.atan2(b_.y - a_.y, b_.x - a_.x), w_)
                terrace_stairs.append((list(piece.coords), best[1], best[2]))
# the quay wall: the wharves stand a level above the town streets, behind a stone retaining wall facing
# the town, with flights of steps every so often and wherever a road comes down to the water
_wood_u = unary_union([box(l, t, r, b) for l, r, t, b in town_rects.get('wood', [])]).buffer(0.01)
_st_u = unary_union([box(l, t, r, b) for l, r, t, b in town_rects.get('street', [])]).buffer(0.01)
_seam = _wood_u.boundary.intersection(_st_u.buffer(0.6))
_road_c = unary_union([LineString(pts).buffer(w / 2 + 1.2) for n_, k_, w, pts in P.ROADS if n_ != 'Front Street'])
from shapely.ops import linemerge as _lm
_seam = _lm([g for g in getattr(_seam, 'geoms', [_seam]) if g.geom_type == 'LineString']) if not _seam.is_empty else _seam
_qw = _qs = 0
for seg in getattr(_seam, 'geoms', [_seam]):
    if seg.is_empty or seg.geom_type != 'LineString' or seg.length < 6: continue
    (x0_, y0_), (x1_, y1_) = seg.coords[0], seg.coords[-1]
    if abs(y1_ - y0_) > abs(x1_ - x0_) * 0.3: continue                      # east-west runs only: the face looks south
    m = seg.interpolate(0.5, normalized=True)
    if not (_wood_u.contains(Point(m.x, m.y - 2)) and _st_u.contains(Point(m.x, m.y + 2))): continue  # wharf north, street south
    gaps = [p_ for p_ in (seg.intersection(_road_c),) if not p_.is_empty]
    span = []
    _tb = unary_union([box(l - 0.5, t - 1, r + 0.5, b + 1) for l, r, t, b in town_bldgs])
    _last = -99
    for d_ in range(6, int(seg.length) - 5, 2):                            # a flight every 20+ units, landing on open street
        if d_ - _last < 22: continue
        c = seg.interpolate(d_)
        if _tb.intersects(box(c.x - 4.5, c.y - 1, c.x + 4.5, c.y + 8)) or _road_c.intersects(box(c.x - 6, c.y - 1, c.x + 6, c.y + 2)): continue
        span.append(LineString([(c.x - 4, c.y), (c.x + 4, c.y)])); _last = d_
    for g in getattr(seg.intersection(_road_c), 'geoms', [seg.intersection(_road_c)]):
        if g.geom_type == 'LineString' and g.length > 1: span.append(g)
    cut = unary_union([sp.buffer(0.2, cap_style=2) for sp in span]) if span else None
    wall = seg.difference(cut) if cut is not None else seg
    for piece in getattr(wall, 'geoms', [wall]):
        if piece.geom_type == 'LineString' and piece.length > 1.5: terrace_walls.append(list(piece.coords)); _qw += 1
    for sp in span:
        terrace_stairs.append((list(sp.coords), math.pi / 2, max(4, sp.length))); _qs += 1
print('  quay wall pieces', _qw, 'flights', _qs)
# terraces inside the town: the main cross streets run along raised terraces, with a stone retaining
# wall dropping to the gardens and lower rows on their south side, and flights of steps wherever a lane
# or alley crosses down through the wall
_tst = {n_: (w_, p_) for n_, k_, w_, p_ in town_plan.STREETS}
_tw_n = _ts_n = 0
for _name in ("Chandlers' Row", "Ropewalk", "Tanners' Row", "Salt Row", "Chapel Lane"):
    _w, _pts = _tst[_name]
    _pts = sorted(_pts) if _pts[0][0] > _pts[-1][0] else list(_pts)
    _ln = LineString(_pts).offset_curve(_w / 2 + 1.0, join_style=2)
    if _ln.is_empty: continue
    _cross = [(n_, w_, p_) for n_, (w_, p_) in _tst.items() if n_ != _name and LineString(p_).buffer(w_ / 2 + 2).intersects(_ln)]
    _cut = unary_union([LineString(p_).buffer(w_ / 2 + 2.0, cap_style=2) for n_, w_, p_ in _cross] + [town_plan.SQUARE.buffer(2)])
    _wall = _ln.difference(_cut)
    for _pc in getattr(_wall, 'geoms', [_wall]):
        if _pc.geom_type == 'LineString' and _pc.length > 3: terrace_walls.append(list(_pc.coords)); _tw_n += 1
    for n_, w_, p_ in _cross:
        _x = _ln.intersection(LineString(p_).buffer(w_ / 2 + 0.3, cap_style=2))
        for _g in getattr(_x, 'geoms', [_x]):
            if _g.geom_type != 'LineString' or _g.length < 1: continue
            _L2 = LineString(p_); _mm = _L2.interpolate(_L2.project(_g.interpolate(0.5, normalized=True)))
            _a2 = _L2.interpolate(max(0, _L2.project(_mm) - 1)); _b2 = _L2.interpolate(min(_L2.length, _L2.project(_mm) + 1))
            terrace_stairs.append((list(_g.coords), math.atan2(_b2.y - _a2.y, _b2.x - _a2.x), w_)); _ts_n += 1
print('  town terraces: wall pieces', _tw_n, 'flights', _ts_n)
# stepped alleys: flights of steps where the ginnels climb the hill
for _n, _k, _w, _pts in town_plan.STREETS:
    if _n not in town_plan.STEPPED: continue
    _L = LineString(_pts)
    for _f in (0.3, 0.7):
        _m = _L.interpolate(_f, normalized=True); _a = _L.interpolate(max(0, _L.project(_m) - 1)); _b = _L.interpolate(min(_L.length, _L.project(_m) + 1))
        _ang = math.atan2(_b.y - _a.y, _b.x - _a.x); _vx, _vy = -math.sin(_ang), math.cos(_ang)
        terrace_stairs.append(([(_m.x - _vx * _w / 2, _m.y - _vy * _w / 2), (_m.x + _vx * _w / 2, _m.y + _vy * _w / 2)], _ang, _w))
for tw in terrace_walls: burn(LineString(tw).buffer(1.2), 'terrace')
extra_terraces = (terrace_walls, terrace_stairs)
# set dressing: clutter, cargo, boats, animals, flowers and name boards (art only; bulky ones are solid)
import dressing
dressing.TOWN_WALLS = unary_union([box(l, t - 1, r, b + 1) for l, r, t, b, gaps in town_walls] or [box(0, 0, 0, 0)])
dress_props = dressing.dress(P, coast, beach, zone_geoms, ways, bldg_geoms, water, town_box, town_rects, town_bldgs, doors, dock_geoms)
from shapely.prepared import prep as _prep
_deck_p = _prep(unary_union([box(l, t, r, b) for l, r, t, b in town_rects.get('wood', [])] + [g for *_, g in dock_geoms]).buffer(1))
for k_, x_, y_ in dress_props:
    if k_ == 'fountain': burn(box(x_ - 15, y_ - 7, x_ + 15, y_ - 0.5), 'dress:fountain')  # the whole basin
    elif k_ in dressing.SOLID_KINDS:
        # small deck clutter never blocks the boardwalks (user, 2026-11-24): only cannons and cargo stacks do
        if k_ not in ('cannon', 'cargo') and _deck_p.contains(Point(x_, y_)): continue
        burn(Point(x_, y_).buffer(0.9), 'dress:' + k_)
for k_, x_, y_ in P.PROPS:  # posts you would otherwise walk straight through (and end up drawn over your face)
    if k_ in ('scarecrow', 'statue', 'mermaid_statue', 'signpost'): burn(Point(x_, y_).buffer(0.8), 'prop:' + k_)
print('  dressing', len(dress_props))
import life_sprites
life_sprites.ROOFS[:] = [(b[3] - b[5] / 2 - 1, b[4] - b[6] / 2 - b[6] * 0.9, b[3] + b[5] / 2 + 1, b[4] + b[6] / 2 + 1.5) for b in P.BUILDINGS] + \
                        [(l - 1, t - (b - t) * 0.9, r + 1, b + 1.5) for l, r, t, b in town_bldgs]
print('  life', life_sprites.build(ROOT, P, dress_props, coast, beach, unary_union([box(l, t, r, b) for kk in ('wood', 'water') for l, r, t, b in town_rects.get(kk, [])] + [g for *_, g in dock_geoms]).buffer(4)))
# the town core: houses, harbour water and retaining walls exactly as the Art town draws them
# a town house blocks only where its walls stand: the lower part of its sprite, never the garden behind it
for l, r, t, b, gy, h in art_slots.TOWN_BOXES: burn(box(l + 0.6, max(t, gy - h * 0.62), r - 0.6, b - 0.4), 'building')
_tw = unary_union([box(l, t, r, b) for l, r, t, b in town_rects.get('water', [])]).buffer(0.5).buffer(-0.5)
for _g in getattr(_tw, 'geoms', [_tw]):
    if _g.area > 300:  # only the harbour the Art town draws, not old garden ponds, and never under drawn ground
        _drawn = unary_union([box(l, t, r, b) for kk in ('street', 'wood', 'sand') for l, r, t, b in town_rects.get(kk, [])] + [ways])
        burn(_g.difference(_drawn.buffer(0.6)).buffer(-0.4), 'water')
import art_layers
art_layers.BRIDGE_SPANS[:] = BRIDGE_SPANS
# the town's terrace walls: the drawn wall face is solid, the flights of steps in its gaps are open
# alleys between neighbouring town houses and a doorstep at every door, for the art
_rows = {}
for l, r, t, b in town_bldgs: _rows.setdefault(round(b), []).append((l, r, t, b))
art_layers.ALLEYS[:] = []
for _, row in _rows.items():
    row.sort()
    for (l1, r1, t1, b1), (l2, r2, t2, b2) in zip(row, row[1:]):
        if 1.5 <= l2 - r1 <= 7: art_layers.ALLEYS.append((r1, l2, max(t1, t2) + 2, min(b1, b2)))
art_layers.PLOTS[:] = [(b[3] - b[5] / 2, b[4] - b[6] / 2, b[3] + b[5] / 2, b[4] + b[6] / 2) for b in P.BUILDINGS if not town_box.contains(Point(b[3], b[4]))]
art_layers.DOORSTEPS[:] = [(x, y + 0.6) for _, x, y in doors] + [(b[3], b[4] + b[6] / 2 + 0.4) for b in P.BUILDINGS if b[7] == 'S']
# every path, lane, walk and square is walkable end to end: clear anything solid left on them
# (except real buildings and water), so nothing invisible ever blocks the way
_keep = unary_union(list(bldg_geoms) + [water] + [box(l, t, r, b) for l, r, t, b in town_bldgs] + [g for g in getattr(_tw, 'geoms', [_tw]) if g.area > 300])
for n_, k_, w, pts in P.ROADS:
    _g = LineString(pts).buffer(max(2.6, w / 2 + 0.6)).difference(_keep)  # room for the player (radius 1.5) on every path
    minx, miny, maxx, maxy = _g.bounds
    for j in range(max(0, int((miny - Y0) / C)), min(H_, int((maxy - Y0) / C) + 1)):
        for i in range(max(0, int((minx - X0) / C)), min(W_, int((maxx - X0) / C) + 1)):
            if sol[j, i] and _g.contains(Point(X0 + (i + .5) * C, Y0 + (j + .5) * C)): sol[j, i] = False
# bridges: the whole drawn deck is walkable, river included, so the player (radius 1.5) fits easily
for _n, _k, _w, _pts in BRIDGE_SPANS:
    _g = LineString(_pts).buffer(_w / 2 + 0.8, cap_style=2).union(LineString(_pts).buffer(_w / 2 + 0.8).intersection(LineString(_pts).buffer(3)))
    _g = LineString(_pts).buffer(_w / 2 + 0.8, cap_style=2).buffer(0.01)
    # extend past both banks so the way on and off is open too
    (_x0, _y0), (_x1, _y1) = _pts[0], _pts[-1]; _L = math.hypot(_x1 - _x0, _y1 - _y0) or 1
    _ux, _uy = (_x1 - _x0) / _L, (_y1 - _y0) / _L
    _g = LineString([(_x0 - _ux * 3, _y0 - _uy * 3), (_x1 + _ux * 3, _y1 + _uy * 3)]).buffer(_w / 2 + 1.4, cap_style=2)
    minx, miny, maxx, maxy = _g.bounds
    for j in range(max(0, int((miny - Y0) / C)), min(H_, int((maxy - Y0) / C) + 1)):
        for i in range(max(0, int((minx - X0) / C)), min(W_, int((maxx - X0) / C) + 1)):
            if sol[j, i] and _g.contains(Point(X0 + (i + .5) * C, Y0 + (j + .5) * C)): sol[j, i] = False
for _, l, r, t, b in P.PLAZAS:  # squares: open in the middle, stalls may line the edges
    if r - l <= 14 or b - t <= 14: continue
    l, r, t, b = l + 6, r - 6, t + 6, b - 6
    _g = box(l, t, r, b).difference(_keep)
    for j in range(max(0, int((t - Y0) / C)), min(H_, int((b - Y0) / C) + 1)):
        for i in range(max(0, int((l - X0) / C)), min(W_, int((r - X0) / C) + 1)):
            if sol[j, i] and _g.contains(Point(X0 + (i + .5) * C, Y0 + (j + .5) * C)): sol[j, i] = False
# report anything still solid on a path centre line (should only be buildings or water)
for n_, k_, w, pts in P.ROADS:
    _ln = LineString(pts)
    for d_ in range(0, int(_ln.length), 1):
        p_ = _ln.interpolate(d_); i, j = int((p_.x - X0) / C), int((p_.y - Y0) / C)
        if 0 <= i < W_ and 0 <= j < H_ and sol[j, i] and not _keep.buffer(1).contains(p_):
            print(f'  BLOCKED PATH {n_} at {p_.x:.0f},{p_.y:.0f}'); break
# ---------------------------------------------------------------- world extras: stepping stones, shortcuts, walkers
def _clear(g):
    minx, miny, maxx, maxy = g.bounds
    for j in range(max(0, int((miny - Y0) / C)), min(H_, int((maxy - Y0) / C) + 1)):
        for i in range(max(0, int((minx - X0) / C)), min(W_, int((maxx - X0) / C) + 1)):
            if sol[j, i] and g.contains(Point(X0 + (i + .5) * C, Y0 + (j + .5) * C)): sol[j, i] = False
def _river_cross(ri, frac):
    """A crossing line square to river `ri` at fraction `frac` of its length, bank to bank."""
    rv = P.RIVERS[ri]; ln = LineString(rv['pts']); p = ln.interpolate(frac, normalized=True)
    a, b = ln.interpolate(max(0, ln.project(p) - 1)), ln.interpolate(min(ln.length, ln.project(p) + 1))
    ux, uy = b.x - a.x, b.y - a.y; L = math.hypot(ux, uy) or 1; nx, ny = -uy / L, ux / L
    half = rv['w'] / 2 + 2.6
    return LineString([(p.x - nx * half, p.y - ny * half), (p.x + nx * half, p.y + ny * half)]), (nx, ny)
_bridge_pts = [LineString(pts).interpolate(0.5, normalized=True) for *_, pts in BRIDGE_SPANS]
def _good_cross(ri, fracs):
    for f in fracs:
        ln_, n_ = _river_cross(ri, f)
        m = ln_.interpolate(0.5, normalized=True)
        if min((m.distance(q) for q in _bridge_pts), default=99) > 25 and ways.distance(m) > 8 and all(m.distance(LineString(st_).interpolate(0.5, normalized=True)) > 30 for st_ in STONES) and coast.buffer(-6).contains(m): return ln_, n_
    return None
STONES = []
for _ri, _fr in ((2, (0.35, 0.3, 0.45, 0.25)), (0, (0.55, 0.6, 0.5, 0.7))):
    _c = _good_cross(_ri, _fr)
    if _c:
        STONES.append(list(_c[0].coords)); _clear(_c[0].buffer(1.9, cap_style=2))
# secret trails ford streams on stepping stones rather than stopping dead at the bank
for _n, _k, _w, _pts in P.ROADS:
    if _k != 'secret': continue
    _x = LineString(_pts).intersection(water.buffer(2.4))
    for _seg in getattr(_x, 'geoms', [_x]):
        if _seg.geom_type == 'LineString' and _seg.length > 0.5 and min((_seg.distance(LineString(p_)) for *_, p_ in BRIDGE_SPANS), default=99) > 2:
            STONES.append(list(_seg.coords)); _clear(_seg.buffer(2.2, cap_style=2))
SHORTCUTS = []
_c = _good_cross(2, (0.7, 0.75, 0.65, 0.8, 0.85, 0.6, 0.55, 0.9, 0.15, 0.1)) or _good_cross(0, (0.3, 0.25, 0.35, 0.2, 0.8, 0.85))
if _c:
    _ln, (_nx, _ny) = _c; (_ax, _ay), (_bx, _by) = _ln.coords
    if _ay < _by: (_ax, _ay), (_bx, _by) = (_bx, _by), (_ax, _ay)   # b is the north (far) bank
    _clear(_ln.buffer(1.9, cap_style=2))
    _bl = _ln.buffer(1.9, cap_style=2).bounds
    SHORTCUTS.append(dict(id='log_brook', name='Fallen-log crossing', kind='log', a=(_ax, _ay), b=(_bx, _by), block=_bl, line=list(_ln.coords)))
# a rope ladder up the High Woods terrace wall, away from the roads
for _tw in terrace_walls:
    _L = LineString(_tw)
    if _L.length < 20: continue
    _m = _L.interpolate(0.5, normalized=True)
    if math.hypot(_m.x - 500, _m.y + 30) > 120 or ways.distance(_m) < 12: continue
    _blk = box(_m.x - 1.9, _m.y - 2.5, _m.x + 1.9, _m.y + 5.5)
    _clear(_blk)
    SHORTCUTS.append(dict(id='ladder_highwoods', name='Rope ladder', kind='ladder', a=(_m.x, _m.y + 8), b=(_m.x, _m.y - 6), block=_blk.bounds, line=[(_m.x, _m.y), (_m.x, _m.y + 4.5)]))
    break
# townsfolk routes: down the long town streets and along the main roads
WALKS = [[tuple(p_) for p_ in _pts] for _n, _k, _w, _pts in town_plan.STREETS if _w >= 6]
for _n, _k, _w, _pts in P.ROADS:
    if _k in ('main', 'lane') and LineString(_pts).length > 60: WALKS.append([tuple(p_) for p_ in _pts])
FISHERS = [tuple(pts[-1]) for n_, k_, w_, pts in P.DOCKS][:6]
# workers: a farmer hoeing up and down the field furrows, dockhands rolling barrels along the big wharves
WORK = []
for _t, _g in zone_geoms:
    if _t == 'fields' and _g.area > 400:
        _l, _tp, _r, _b = _g.bounds
        for _f in (0.3, 0.7):
            _y = _tp + (_b - _tp) * _f
            _ln = LineString([(_l + 6, _y), (_r - 6, _y)]).intersection(_g.buffer(-4))
            if _ln.geom_type == 'LineString' and _ln.length > 20: WORK.append({'kind': 'farm', 'pts': [list(c) for c in _ln.coords]})
_wood = unary_union([box(l, t, r, b) for l, r, t, b in town_rects.get('wood', [])] + [g for *_, g in dock_geoms])
for _g in sorted(getattr(_wood, 'geoms', [_wood]), key=lambda g_: -g_.area)[:5]:
    if _g.area < 400: continue
    _l, _tp, _r, _b = _g.bounds; _cx, _cy = (_l + _r) / 2, (_tp + _b) / 2
    _ln = (LineString([(_l, _cy), (_r, _cy)]) if _r - _l > _b - _tp else LineString([(_cx, _tp), (_cx, _b)])).intersection(_g.buffer(-4))
    if _ln.geom_type == 'LineString' and _ln.length > 15: WORK.append({'kind': 'barrel', 'pts': [list(c) for c in _ln.coords]})
BRIDGE_MIDS = [(round(q.x, 1), round(q.y, 1)) for q in _bridge_pts]
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
out.append(f"export const BP_BREAKWATER: [number, number][] = [{', '.join(f'[{x}, {y}]' for m in P.MOLES for x, y in m)}];")
out.append('/** The breakwater arms one by one (island-relative), drawn 8 units wide: ships cannot sail through them. */')
out.append(f"export const BP_MOLES: [number, number][][] = [{', '.join('[' + ', '.join(f'[{x}, {y}]' for x, y in m) + ']' for m in P.MOLES)}];")
out.append('export const BP_SEA_ZONES: { t: string; d: string }[] = [' + ', '.join(f"{{ t: '{t}', d: '{poly_d(g)}' }}" for t, g in sea_zones) + '];')
out.append('export const BP_POIS: [string, string, number, number][] = [' + ', '.join(f"['{k}', {i!r}, {x:g}, {y:g}]" for k, i, x, y in pois) + '];')
out.append('/** x, y, kind code (0 jungle, 1 tree, 2 palm, 3 rock, 4 mangrove), packed. */')
code = {'jungle': 0, 'tree': 1, 'palm': 2, 'rock': 3, 'mangrove': 4}
out.append('export const BP_TREES: number[] = [' + ','.join(f'{x:g},{y:g},{code[k]}' for x, y, k in trees) + '];')
out.append('export const BP_PROPS: [string, number, number][] = [' + ', '.join(f"['{k}', {x:g}, {y:g}]" for k, x, y in P.PROPS) + '];')
out.append('/** Stable edit keys (the plan original positions) for props and trees, same order as BP_PROPS / BP_TREES. */')
_lamps = [(x, y - 4) for k, x, y in list(P.PROPS) + list(dress_props) if k in ('lamp', 'lantern', 'lantern_post', 'signal_lamp', 'harbour_light', 'campfire')]
out.append('/** Lamp heads in Art mode (plan and set dressing), lit at night by DayNight. */')
out.append('export const BP_LAMPS: [number, number][] = [' + ', '.join(f'[{x:g}, {y:g}]' for x, y in _lamps) + '];')
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
    + [f"{{ id: '{i}', x: {x}, y: {y} }}" for i, x, y in LANDMARK_DOORS]
    + [f"{{ id: '{i}', x: {x:g}, y: {y:g} }}" for i, x, y in doors if i]) + '];')
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
surfaces['grass'] = coast.difference(town_box).difference(unary_union([beach, ways, water] + [g for t_, g in zone_geoms if t_ in ('fields', 'sugarcane', 'paddock')])).simplify(0.6)
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
extra['fort_area'], extra['fort_wall'] = fort_area, fort_wall
extra['town_walls'] = town_walls
wild = [(k, Polygon(p).buffer(0)) for k, p in P.WILDLIFE]
extra['wildlife'] = wild
extra['terraces'] = extra_terraces
extra['dressing'] = dress_props
extra['life'] = dict(fishing=fishing, digs=digs, collect=collect, views=views, notices=notices, events=events, shelters=shelters, people=people)
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
g_out.append('export const BP_ERRANDS: { id: string; district: string; person: string; sprite: string; x: number; y: number; resource: string; amount: number; gold: number; line: string; reward?: { kind: string; value: string | number; text: string } }[] = [')
import json as _json
for e in P.ERRANDS:
    rw = P.REWARDS.get(e[0])
    rws = f", reward: {{ kind: {_json.dumps(rw[0])}, value: {_json.dumps(rw[1])}, text: {_json.dumps(rw[2], ensure_ascii=False)} }}" if rw else ''
    g_out.append(f"  {{ id: {e[0]!r}, district: {e[1]!r}, person: {e[2]!r}, sprite: {e[3]!r}, x: {poi_at[e[0]][0]:g}, y: {poi_at[e[0]][1]:g}, resource: {e[6]!r}, amount: {e[7]}, gold: {e[8]}, line: {e[9]!r}{rws} }},")
g_out.append('];')
poi_at = {pid: (x, y) for k, pid, x, y in pois}
g_out.append('export const BP_GATHER: { resource: string; id: string; x: number; y: number }[] = [' + ', '.join(f"{{ resource: {r!r}, id: {i!r}, x: {poi_at[i][0]:g}, y: {poi_at[i][1]:g} }}" for r, i, x, y in P.GATHER) + '];')
lh = next(b for b in P.BUILDINGS if b[0] == 'tortuga_lighthouse_tower')
g_out.append(f'export const BP_LIGHTHOUSE = {{ x: {lh[3]}, y: {lh[4]} }};')
g_out.append("export const BP_GROTTO = { x: -416, y: 318 };")
L_ = extra['life']
g_out.append('/** Buried treasure, paced out from a landmark: the clue shows by the landmark, the spot is dug where it says. */')
g_out.append('export const BP_DIGS: { id: string; landmark: string; lx: number; ly: number; x: number; y: number; gold: number; clue: string }[] = [' + ', '.join(
    f'{{ id: {_json.dumps(i)}, landmark: {_json.dumps(lm)}, lx: {lx:g}, ly: {ly:g}, x: {x:g}, y: {y:g}, gold: {g}, clue: {_json.dumps(c, ensure_ascii=False)} }}' for i, lm, lx, ly, x, y, g, c in L_['digs']) + '];')
g_out.append('/** One carved skull hidden in each district. */')
g_out.append('export const BP_SKULLS: { district: string; x: number; y: number }[] = [' + ', '.join(f'{{ district: {_json.dumps(d)}, x: {x:g}, y: {y:g} }}' for d, x, y in L_['collect']) + '];')
g_out.append('/** Viewpoints: standing here reveals these districts. */')
g_out.append('export const BP_VIEWPOINTS: { name: string; x: number; y: number; districts: string[] }[] = [' + ', '.join(f'{{ name: {_json.dumps(n)}, x: {x:g}, y: {y:g}, districts: {_json.dumps(ds)} }}' for n, x, y, ds in L_['views']) + '];')
g_out.append('/** Notice boards: list the errands of their district. */')
g_out.append('export const BP_NOTICES: { district: string; x: number; y: number }[] = [' + ', '.join(f'{{ district: {_json.dumps(d)}, x: {x:g}, y: {y:g} }}' for d, x, y in L_['notices']) + '];')
g_out.append('/** Hazards: wasps sting (slow), rockfall warns; mud is the swamp polygon. */')
g_out.append('export const BP_HAZARDS: { kind: string; x: number; y: number; r: number }[] = [' + ', '.join(f'{{ kind: {_json.dumps(k)}, x: {x}, y: {y}, r: {r} }}' for k, x, y, r in P.HAZARDS if k != 'tide') + '];')
g_out.append('export const BP_MUD: [number, number][][] = [' + ', '.join('[' + ', '.join(f'[{x}, {y}]' for x, y in pts) + ']' for t, pts in P.ZONES if t == 'swamp') + '];')
g_out.append('/** Who lives where: home, work and favourite haunt for each errand-giver (for daily routines). */')
g_out.append('export const BP_PEOPLE: { name: string; district: string; home: [number, number]; work: [number, number]; haunt: [number, number] }[] = [' + ', '.join(
    f'{{ name: {_json.dumps(n, ensure_ascii=False)}, district: {_json.dumps(d)}, home: [{h[0]:g}, {h[1]:g}], work: [{w[0]:g}, {w[1]:g}], haunt: [{a[0]:g}, {a[1]:g}] }}' for n, d, h, w, a in L_['people']) + '];')
g_out.append('/** Messages in bottles on the beaches. */')
g_out.append('export const BP_BOTTLES: { x: number; y: number; text: string }[] = [' + ', '.join(f'{{ x: {x:g}, y: {y:g}, text: {_json.dumps(t, ensure_ascii=False)} }}' for x, y, t in bottles) + '];')
g_out.append('/** Random event spots on the roads (for later). */')
g_out.append('export const BP_EVENTS: { kind: string; x: number; y: number }[] = [' + ', '.join(f'{{ kind: {_json.dumps(k)}, x: {x:g}, y: {y:g} }}' for k, x, y in L_['events']) + '];')
g_out.append('/** Signposts (island-relative): standing by one points you at unexplored districts. */')
g_out.append('export const BP_SIGNPOSTS: [number, number][] = [' + ', '.join(f'[{x}, {y}]' for k, x, y in P.PROPS if k == 'signpost') + '];')
g_out.append('/** District centres, for signpost directions. */')
g_out.append('export const BP_DISTRICT_CENTRES: { name: string; x: number; y: number }[] = [' + ', '.join(f'{{ name: {_json.dumps(n)}, x: {x}, y: {y} }}' for n, x, y, _ in P.DISTRICTS) + '];')
g_out.append('/** Rowboat taxi stops (unlocked by the boat-builder errand). */')
g_out.append('export const BP_FERRY: { name: string; x: number; y: number }[] = [' + ', '.join(f'{{ name: {_json.dumps(n)}, x: {x}, y: {y} }}' for n, x, y in P.FERRY) + '];')
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

# ---------------------------------------------------------------- art mode base (painted from the plan)
import art
# The base keeps only what has no sprite yet; anything with a sprite is drawn by the game on top.
art_bldgs = [(b[3] - b[5] / 2, b[4] - b[6] / 2, b[3] + b[5] / 2, b[4] + b[6] / 2, b[2]) for n_, b in enumerate(P.BUILDINGS) if n_ not in _drawn_b]
art_bldgs += [(l, t, r, b, 'town') for l, r, t, b in town_bldgs]
class _PP: pass
_P2 = _PP(); _P2.__dict__.update({k: getattr(P, k) for k in dir(P) if not k.startswith('__')})
_P2.PROPS = list(P.PROPS)
import art_layers
_avoid = unary_union([box(l, t - 3, r, b + 3) for l, r, t, b, gaps in town_walls] + [LineString(tw).buffer(2.5) for tw in terrace_walls] + [g_.buffer(1.8) for g_ in (fence_geom, hedge_geom, wall_geom) if not g_.is_empty] + [fort_area.buffer(3), ways.buffer(2), unary_union(bldg_geoms).buffer(3), water.buffer(2), town_box.buffer(4), dock_area.buffer(2)]
                     + [g for t_, g in zone_geoms if t_ in ('fields', 'sugarcane', 'allotment', 'paddock', 'pen', 'graveyard', 'rock')])
_no_rocks = unary_union([dock_area.buffer(6), town_box.buffer(2)] + [LineString(pts).buffer(w / 2 + 3) for n_, k_, w, pts in P.ROADS])
_fp = [(b[3] - b[5] / 2, b[4] - b[6] / 2, b[3] + b[5] / 2, b[4] + b[6] / 2) for b in P.BUILDINGS]
_town_open = unary_union([box(l, t, r, b) for k_ in ('street', 'wood', 'water', 'sand') for l, r, t, b in town_rects.get(k_, [])] + [box(l, t, r, b) for l, r, t, b in blocks])
_avoid = unary_union([box(l, t - 3, r, b + 3) for l, r, t, b, gaps in town_walls] + [LineString(tw).buffer(2.5) for tw in terrace_walls] + [g_.buffer(1.8) for g_ in (fence_geom, hedge_geom, wall_geom) if not g_.is_empty] + [fort_area.buffer(3), ways.buffer(2), unary_union(bldg_geoms).buffer(3), water.buffer(2), _town_open.buffer(1.5), dock_area.buffer(2)]
                     + [g for t_, g in zone_geoms if t_ in ('fields', 'sugarcane', 'allotment', 'paddock', 'pen', 'graveyard', 'rock', 'quarry', 'orchard')])
art_layers.STONES[:] = STONES
art_layers.build('/tmp/plan_art_full.png', coast, beach, zone_geoms, water, P, trees, bridges, dock_geoms, breakwater, extra, _avoid, _no_rocks, _fp, town_rects, town_walls)
# cut the base into tiles so phones never need one huge texture, and the game loads only nearby ones
from PIL import Image as _Im
_full = _Im.open('/tmp/plan_art_full.png')
# the code-drawn ground doubles as the reference for a painted one: keep a copy for the brief
os.makedirs(f'{ROOT}/docs/art_reference', exist_ok=True)
_full.convert('RGB').resize((_full.size[0] // 2, _full.size[1] // 2), _Im.NEAREST).save(f'{ROOT}/docs/art_reference/ground_reference.png')
# a painted ground (one image of the whole island, same framing) replaces the code-drawn one when present
_painted = f'{ROOT}/assets/art_painted/ground.png'
_code_full = None
if os.path.exists(_painted):
    _code_full = _full
    _full = _Im.open(_painted).convert('RGBA').resize(_full.size, _Im.LANCZOS); print('  using painted ground', _painted)
_TW, _TH = _full.size[0] // 4, _full.size[1] // 4
_tdir = f'{ROOT}/assets/sprites/tortuga_town/plan_tiles'; os.makedirs(_tdir, exist_ok=True)
_tl = ["// GENERATED by build_tortuga.py — the Art map base, painted from the plan, in 4x4 tiles (island units).",
       "export const ART_TILES: { src: number; l: number; t: number; w: number; h: number }[] = ["]
_ppu = _full.size[0] / 1240
for _r in range(4):
    for _c in range(4):
        _t = _full.crop((_c * _TW, _r * _TH, (_c + 1) * _TW, (_r + 1) * _TH))
        if not _t.getbbox(): continue
        _t.save(f'{_tdir}/tile_{_r}_{_c}.png', optimize=True)
        _tl.append(f"  {{ src: require('../../assets/sprites/tortuga_town/plan_tiles/tile_{_r}_{_c}.png'), l: {-620 + _c * _TW / _ppu:g}, t: {-580 + _r * _TH / _ppu:g}, w: {_TW / _ppu:g}, h: {_TH / _ppu:g} }},")
_tl.append('];')
# the code-drawn ground, kept for the painted/code switch when a painted ground is in use
_tl.append('/** The code-drawn ground, only when a painted ground has replaced it (for the painted/code switch). */')
_tl.append('export const ART_TILES_CODE: { src: number; l: number; t: number; w: number; h: number }[] = [')
for _r in range(4):
    for _c in range(4):
        if _code_full is None: break
        _t = _code_full.crop((_c * _TW, _r * _TH, (_c + 1) * _TW, (_r + 1) * _TH))
        _t.save(f'{_tdir}/code_tile_{_r}_{_c}.png', optimize=True)
        _tl.append(f"  {{ src: require('../../assets/sprites/tortuga_town/plan_tiles/code_tile_{_r}_{_c}.png'), l: {-620 + _c * _TW / _ppu:g}, t: {-580 + _r * _TH / _ppu:g}, w: {_TW / _ppu:g}, h: {_TH / _ppu:g} }},")
_tl.append('];')
# building shadows as a second, mostly empty tile set drawn over the ground
_sh = _Im.open('/tmp/plan_art_shadow.png')
_tl.append('/** Building cast shadows, drawn over the ground (kept apart so a painted ground needs none). */')
_tl.append('export const ART_SHADOW_TILES: { src: number; l: number; t: number; w: number; h: number }[] = [')
for _r in range(4):
    for _c in range(4):
        _t = _sh.crop((_c * _TW, _r * _TH, (_c + 1) * _TW, (_r + 1) * _TH))
        if not _t.getbbox(): continue
        _t.save(f'{_tdir}/shadow_{_r}_{_c}.png', optimize=True)
        _tl.append(f"  {{ src: require('../../assets/sprites/tortuga_town/plan_tiles/shadow_{_r}_{_c}.png'), l: {-620 + _c * _TW / _ppu:g}, t: {-580 + _r * _TH / _ppu:g}, w: {_TW / _ppu:g}, h: {_TH / _ppu:g} }},")
_tl.append('];')
open(f'{ROOT}/src/blueprint/tortugaArtTiles.generated.ts', 'w').write('\n'.join(_tl) + '\n')
print('art base written')
_w = ['// GENERATED by build_tortuga.py — Art mode world extras: shortcuts, bridge fishing, townsfolk routes. Never hand-edit.',
      'export interface Shortcut { id: string; name: string; kind: string; a: [number, number]; b: [number, number]; block: [number, number, number, number]; line: [number, number][] }',
      'export const WORLD_SHORTCUTS: Shortcut[] = ' + json.dumps([dict(id=c['id'], name=c['name'], kind=c['kind'], a=[round(v, 1) for v in c['a']], b=[round(v, 1) for v in c['b']],
                                                                   block=[round(c['block'][0], 1), round(c['block'][2], 1), round(c['block'][1], 1), round(c['block'][3], 1)],
                                                                   line=[[round(x, 1), round(y, 1)] for x, y in c['line']]) for c in SHORTCUTS]) + ';',
      'export const WORLD_BRIDGE_FISHING: [number, number][] = ' + json.dumps([list(p) for p in BRIDGE_MIDS]) + ';',
      'export const WORLD_WALKS: [number, number][][] = ' + json.dumps([[[round(x, 1), round(y, 1)] for x, y in w] for w in WALKS]) + ';',
      'export const WORLD_FISHERS: [number, number][] = ' + json.dumps([[round(x, 1), round(y, 1)] for x, y in FISHERS]) + ';',
      'export const WORLD_SPANS: { kind: string; pts: [number, number][]; w: number }[] = ' + json.dumps([{'kind': 'stone' if k_ in ('main', 'lane') else 'wood', 'w': w_, 'pts': [[round(x, 1), round(y, 1)] for x, y in p_]} for n_, k_, w_, p_ in BRIDGE_SPANS]) + ';',
      'export const WORLD_STEPS: [number, number, number][] = ' + json.dumps([[round(LineString(st_).centroid.x, 1), round(LineString(st_).centroid.y, 1), round(LineString(st_).length / 2 + 2, 1)] for st_, a_, w_ in terrace_stairs if len(st_) > 1]) + ';',
      'export const WORLD_SQUARE = ' + json.dumps({
          'fountain': next(([round(x_, 1), round(y_, 1)] for k_, x_, y_ in dress_props if k_ == 'fountain'), [0, 0]),
          'stalls': [[round(x_, 1), round(y_, 1)] for k_, x_, y_ in dress_props if k_ == 'stall' and town_plan.SQUARE.buffer(1).contains(Point(x_, y_))],
          'lamps': [[round(x_, 1), round(y_, 1)] for x_, y_ in list(town_plan.SQUARE.buffer(-3, join_style=2).exterior.coords)[:-1]],
          'bounds': [round(v_, 1) for v_ in town_plan.SQUARE.bounds]}) + ';',
      "export const WORLD_WORK: { kind: 'farm' | 'barrel'; pts: [number, number][] }[] = " + json.dumps([{'kind': w['kind'], 'pts': [[round(x, 1), round(y, 1)] for x, y in w['pts']]} for w in WORK]) + ';']
open(f'{ROOT}/src/blueprint/artWorld.generated.ts', 'w').write('\n'.join(_w) + '\n')
print('  world extras: stones', len(STONES), 'shortcuts', [c['id'] for c in SHORTCUTS], 'walks', len(WALKS))
import art_spec
art_spec.build(ROOT, P, coast, beach, zone_geoms, water, town_rects, town_box, ways, dock_geoms, bridges, breakwater, art_slots, art_layers, life_sprites)
