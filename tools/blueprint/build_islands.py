"""Blueprints for every island other than Tortuga: a landing jetty, a village square, the island's
own game buildings with doors facing the square, cottages, roads, a hill, woods in the island's
character, trees, props and names — laid out automatically from the island's shape and data, then
checked the same way as Tortuga. Writes src/blueprint/islandPlans.generated.ts and previews.
Usage: python3 build_islands.py [preview_dir]"""
import sys, re, math, random, types, os
import numpy as np
from shapely.geometry import Polygon, LineString, Point, box
from shapely.ops import unary_union, nearest_points
import sources as S
import architect

ROOT = S.ROOT
isl_src = open(f'{ROOT}/src/data/islands.ts').read()
bld_src = open(f'{ROOT}/src/data/buildings.ts').read()

THEME = {  # woods kind, extra zone, flavour label
    'cow_island': ('forest', 'swamp', 'Grazing flats'),
    'new_providence': ('forest', None, 'The pirate republic'),
    'roatan': ('jungle', None, 'Careening cove'),
    'port_royal': ('forest', 'rock', 'The sunken city'),
    'ile_sainte_marie': ('jungle', None, 'Haven of legends'),
    'skulls_end': ('rock', 'rock', "Grimtide's last stand"),
}
SHAPE_OF = dict(re.findall(r"  (\w+): \{\n    id: '\w+',[\s\S]*?shape: (\w+),", isl_src))
NAME_OF = dict((k, v) for k, v in re.findall(r"  (\w+): \{\n    id: '\w+',\n    name: ['\"](.*?)['\"],", isl_src))
ENC_OF = dict(re.findall(r"  (\w+): \{\n    id: '\w+',[\s\S]*?encounterChance: ([\d.]+),", isl_src))

def shape(island):
    body = re.search(rf'const {SHAPE_OF[island]} = polygon\(\[(.*?)\]\);', isl_src, re.S).group(1)
    return Polygon([(float(a), float(b)) for a, b in re.findall(r'\[(-?[\d.]+), (-?[\d.]+)\]', body)]).buffer(0)

def buildings_of(island):
    out = []
    for blk in re.split(r'\n  \{', bld_src):
        m = re.search(r"id: '(\w+)'", blk); i = re.search(r"islandId: '(\w+)'", blk)
        o = re.search(r"offset: \{ x: (-?[\d.]+), y: (-?[\d.]+) \}", blk); n = re.search(r"name: (['\"])(.*?)\1", blk)
        t = re.search(r"type: '(\w+)'", blk)
        if m and i and i.group(1) == island and o:
            out.append((m.group(1), n.group(2), t.group(1), float(o.group(1)), float(o.group(2))))
    return out

KIND = {'tavern': 'tavern', 'shop': 'shop', 'market': 'market', 'smithy': 'warehouse', 'beach': 'shed',
        'college': 'civic', 'manor': 'manor', 'shrine': 'landmark'}

def plan_island(iid, rng):
    coast = shape(iid)
    inner = coast.buffer(-26)
    blds = buildings_of(iid)
    problems = []
    # Landing: the coast point nearest the buildings' centre (or the island centre).
    cx = np.mean([b[3] for b in blds]) if blds else 0; cy = np.mean([b[4] for b in blds]) if blds else 0
    cpt = Point(cx, cy)
    if not inner.contains(cpt): cpt = nearest_points(inner, cpt)[0]
    shore = nearest_points(coast.exterior, cpt)[0]
    vx, vy = shore.x - cpt.x, shore.y - cpt.y; L = math.hypot(vx, vy) or 1; ux, uy = vx / L, vy / L
    root = (shore.x - ux * 6, shore.y - uy * 6); tip = (shore.x + ux * 34, shore.y + uy * 34)
    docks = [('Landing Jetty', 'pier', 7, [root, tip]), ('Jetty Head', 'pier', 6, [(tip[0] - uy * 12, tip[1] + ux * 12), (tip[0] + uy * 12, tip[1] - ux * 12)])]
    # Square 60 inland of the landing.
    sq = Point(shore.x - ux * 70, shore.y - uy * 70)
    if not inner.contains(sq): sq = nearest_points(inner, sq)[0]
    plazas = [('Square', sq.x - 22, sq.x + 22, sq.y - 16, sq.y + 16)]
    roads = [('Landing Road', 'main', 8, [root, (sq.x, sq.y)])]
    # Hill on the far side from the landing (woods round it), a path up to it, and a coast path
    # looping the island just inside the beach.
    far = Point(sq.x - ux * 200, sq.y - uy * 200)
    if not coast.buffer(-60).contains(far): far = nearest_points(coast.buffer(-60), far)[0]
    ring = coast.buffer(-20, join_style=1).simplify(6)
    if ring.geom_type == 'MultiPolygon': ring = max(ring.geoms, key=lambda q: q.area)
    loop = [(round(x, 1), round(y, 1)) for x, y in ring.exterior.coords]
    hill_path = [(sq.x, sq.y), (round((sq.x + far.x) / 2 + uy * 25, 1), round((sq.y + far.y) / 2 - ux * 25, 1)), (round(far.x, 1), round(far.y, 1))]
    roads.append(('Coast Path', 'path', 4, loop))
    roads.append(('Hill Path', 'path', 4, hill_path))
    builds, taken = [], [box(*[plazas[0][1], plazas[0][3], plazas[0][2], plazas[0][4]]).buffer(4), LineString(roads[0][3]).buffer(8),
                         LineString(loop).buffer(6), LineString(hill_path).buffer(6)]
    def place(bid, label, kind, x, y, w, h, link=True):
        p = Point(x, y)
        g = box(x - w / 2, y - h / 2, x + w / 2, y + h / 2)
        tries = 0
        while (not inner.contains(g) or unary_union(taken).intersects(g.buffer(3))) and tries < 400:
            ang = rng.uniform(0, 2 * math.pi); r = 6 + tries * 0.8
            x, y = p.x + math.cos(ang) * r, p.y + math.sin(ang) * r
            g = box(x - w / 2, y - h / 2, x + w / 2, y + h / 2); tries += 1
        if tries >= 400: problems.append(f'{label}: no room'); return
        # Door on the side facing the square.
        dx, dy = sq.x - x, sq.y - y
        side = ('E' if dx > 0 else 'W') if abs(dx) * h > abs(dy) * w else ('S' if dy > 0 else 'N')
        door = {'N': (x, y - h / 2), 'S': (x, y + h / 2), 'E': (x + w / 2, y), 'W': (x - w / 2, y)}[side]
        builds.append((bid, label, kind, round(x, 1), round(y, 1), w, h, side))
        taken.append(g.buffer(2))
        if link:
            out = {'N': (0, -6), 'S': (0, 6), 'E': (6, 0), 'W': (-6, 0)}[side]
            p1 = (door[0] + out[0], door[1] + out[1])
            dist = math.hypot(sq.x - p1[0], sq.y - p1[1])
            if dist > 26:
                roads.append((f'{label} Lane', 'lane' if dist < 120 else 'path', 6 if dist < 120 else 4, [door, p1, (sq.x, sq.y)]))
                taken.append(LineString([p1, (sq.x, sq.y)]).buffer(5))
    for bid, name, typ, x, y in blds:
        place(bid, name, KIND.get(typ, 'shop'), x, y, 26, 20)
    # Cottages round the square.
    for k in range(6):
        a = k / 6 * 2 * math.pi + 0.4
        place(None, 'Cottage', 'home', sq.x + math.cos(a) * 52, sq.y + math.sin(a) * 42, 18, 16, link=False)
    woods, extra_zone, flavour = THEME.get(iid, ('forest', None, ''))
    hills = [(round(far.x), round(far.y), 30, 110, 90)]
    zones = []
    wz = Point(far.x, far.y).buffer(150).intersection(coast.buffer(-14)).difference(unary_union(taken).buffer(10))
    zones.append((woods if woods != 'rock' else 'rock', wz))
    if extra_zone:
        ez = Point(sq.x + uy * 160, sq.y - ux * 160).buffer(110).intersection(coast.buffer(-14)).difference(unary_union(taken).buffer(10)).difference(wz)
        zones.append((extra_zone, ez))
    beach = coast.difference(coast.buffer(-12))
    ways = unary_union([LineString(p).buffer(w / 2) for _, _, w, p in roads] + [box(l, t, r, b) for _, l, r, t, b in plazas])
    bg = [box(x - w / 2, y - h / 2, x + w / 2, y + h / 2) for _, _, _, x, y, w, h, _ in builds]
    blocked = unary_union([ways.buffer(5), unary_union(bg).buffer(7) if bg else Polygon()])
    trees = []
    def scatter(area, spacing, kind, keep=1.0):
        if area.is_empty: return
        minx, miny, maxx, maxy = area.bounds
        for _ in range(int(area.area / (spacing * spacing) * 6)):
            x, y = rng.uniform(minx, maxx), rng.uniform(miny, maxy)
            if rng.random() > keep: continue
            p = Point(x, y)
            if not area.contains(p) or blocked.contains(p): continue
            if any((x - a) ** 2 + (y - b) ** 2 < spacing * spacing for a, b, _ in trees): continue
            trees.append((round(x, 1), round(y, 1), kind))
    for t, g in zones:
        scatter(g, {'jungle': 13, 'forest': 15, 'rock': 34, 'swamp': 16}[t], {'jungle': 'jungle', 'forest': 'tree', 'rock': 'rock', 'swamp': 'mangrove'}[t])
    scatter(beach, 30, 'palm', 0.5)
    scatter(coast.buffer(-14).difference(unary_union([g for _, g in zones])), 40, 'tree', 0.35)
    props = [('well', round(sq.x), round(sq.y)), ('signpost', round(root[0] - ux * 10 + uy * 8), round(root[1] - uy * 10 - ux * 8)),
             ('crates', round(root[0] - ux * 4 - uy * 9), round(root[1] - uy * 4 + ux * 9)), ('barrels', round(root[0] - ux * 4 + uy * 9), round(root[1] - uy * 4 - ux * 9)),
             ('bench', round(sq.x - 14), round(sq.y + 10)), ('lamp', round(sq.x - 22), round(sq.y - 16)), ('lamp', round(sq.x + 22), round(sq.y - 16))]
    labels = [(round(sq.x), round(sq.y - 30), NAME_OF[iid].upper(), 'district'), (round(far.x), round(far.y + 30), flavour, 'place')]
    P = types.SimpleNamespace(ROADS=roads, PLAZAS=plazas, BUILDINGS=builds, PROPS=props, LABELS=labels, DOCKS=docks,
                              MOORED=[(round(tip[0] + uy * 10 + ux * 4), round(tip[1] - ux * 10 + uy * 4), math.degrees(math.atan2(uy, ux)))], LANES=[])
    return P, coast, zones, trees, hills, problems

def main():
    rng = random.Random(9)
    out = ['// GENERATED by tools/blueprint/build_islands.py — plans for every island but Tortuga.',
           '// Island-relative units, viewBox -620 -580 1240 1120. Re-run the builder; never hand-edit.', '',
           "import type { PlanLayer } from './tortugaPlanSvg';", '',
           'export interface IslandPlan { layers: PlanLayer[]; solids: number[]; doors: { id: string; x: number; y: number }[];',
           '  docks: { from: { x: number; y: number }; to: { x: number; y: number }; halfWidth: number }[]; cliffs: number[][] }', '',
           'export const ISLAND_PLANS: Record<string, IslandPlan> = {']
    previews = []
    far_box = box(9000, 9000, 9001, 9001)
    for iid in [k for k in SHAPE_OF if k != 'tortuga_cove']:
        P, coast, zones, trees, hills, problems = plan_island(iid, rng)
        def door_point(b):
            _, _, _, cx, cy, w, h, side = b
            return {'N': (cx, cy - h / 2), 'S': (cx, cy + h / 2), 'E': (cx + w / 2, cy), 'W': (cx - w / 2, cy), None: None}[side]
        dock_geoms = [(n, k, w, LineString(p).buffer(w / 2, cap_style=2, join_style=2)) for n, k, w, p in P.DOCKS]
        # contours + cliffs
        GS = 4; xs = np.arange(-620, 621, GS); ys = np.arange(-580, 541, GS); XX, YY = np.meshgrid(xs, ys)
        from shapely import contains_xy
        from scipy.ndimage import distance_transform_edt
        from skimage import measure
        land = contains_xy(coast, XX, YY)
        hf = sum(h * np.exp(-2.2 * (((XX - x) / rx) ** 2 + ((YY - y) / ry) ** 2)) for x, y, h, rx, ry in hills)
        hf = np.where(land, hf * np.clip(distance_transform_edt(land) * GS / 30, 0, 1), 0.0)
        contours = []
        for lvl in range(5, 40, 5):
            ls = [LineString([(-620 + c[1] * GS, -580 + c[0] * GS) for c in cc]).simplify(0.8) for cc in measure.find_contours(hf, lvl) if len(cc) > 4]
            if ls: contours.append((lvl, architect.lines_d(unary_union(ls)), lvl % 20 == 0))
        raw = lambda x, y: sum(h * math.exp(-2.2 * (((x - hx) / rx) ** 2 + ((y - hy) / ry) ** 2)) for hx, hy, h, rx, ry in hills)
        cliffs, run, ext = [], [], coast.exterior
        for t in np.arange(0, ext.length, 2.5):
            p0 = ext.interpolate(t)
            inward = nearest_points(coast.buffer(-8), p0)[0]
            if raw(inward.x, inward.y) > 12: run.append((round(p0.x, 1), round(p0.y, 1)))
            elif run:
                if len(run) > 1: cliffs.append(run)
                run = []
        if len(run) > 1: cliffs.append(run)
        cliff_d = ''.join(f'M{x:.1f} {y:.1f}L{(x * 0.97):.1f} {(y * 0.97):.1f}' for r in cliffs for x, y in r)
        ways = unary_union([LineString(p).buffer(w / 2, cap_style=1) for _, _, w, p in P.ROADS])
        surfaces = {'sand': coast.difference(coast.buffer(-12)).difference(ways), 'dirt': ways, 'plank': unary_union([g for *_, g in dock_geoms]),
                    'cobble': unary_union([box(l, t, r, b) for _, l, r, t, b in P.PLAZAS]),
                    'grass': coast.buffer(-12).difference(ways)}
        enc = float(ENC_OF.get(iid, 0))
        danger = [('area', coast, (f'WILD ENCOUNTERS ON LAND · {round(enc * 100)}% A STEP' if enc else 'SAFE ON LAND', (P.LABELS[0][0], P.LABELS[0][1] - 14)), '#b03a2e' if enc else '#1e8449')]
        trig = [(door_point(b)[0], door_point(b)[1], 9, '') for b in P.BUILDINGS if b[0]]
        road_labels = []
        for rn, k, w, pts in P.ROADS:
            segs = list(zip(pts, pts[1:]))
            a_, b_ = max(segs, key=lambda sg: math.hypot(sg[1][0] - sg[0][0], sg[1][1] - sg[0][1]))
            if math.hypot(b_[0] - a_[0], b_[1] - a_[1]) < 24: continue
            ang = math.degrees(math.atan2(b_[1] - a_[1], b_[0] - a_[0]))
            ang = ang - 180 if ang > 90 else ang + 180 if ang < -90 else ang
            road_labels.append(((a_[0] + b_[0]) / 2, (a_[1] + b_[1]) / 2, ang, rn, 3.0 if k == 'main' else 2.4, k == 'path'))
        extra = {'road_labels': road_labels, 'contours': contours, 'contour_labels': [], 'cliffs': cliff_d, 'peaks': [(h[0], h[1], h[2]) for h in hills],
                 'surfaces': surfaces, 'districts': [], 'districts_disc': [], 'danger': danger,
                 'shallows': coast.buffer(22, join_style=1).difference(coast), 'triggers': trig, 'routes': [], 'lamps': [(x, y) for k, x, y in P.PROPS if k == 'lamp']}
        solids_geom = unary_union([box(x - w / 2 + 1, y - h / 2 + 1, x + w / 2 - 1, y + h / 2 - 1) for _, _, _, x, y, w, h, _ in P.BUILDINGS]
                                  + [Point(x, y).buffer(4 if k == 'rock' else 2.4) for x, y, k in trees])
        rects0 = []
        for g in (solids_geom.geoms if hasattr(solids_geom, 'geoms') else [solids_geom]):
            l, t, r, b = g.bounds
            rects0.append((l, r, t, b) if g.area > 30 else (g.centroid.x - 2, g.centroid.x + 2, g.centroid.y - 2, g.centroid.y + 2))
        extra['solids'] = unary_union([box(l, t, r, b) for l, r, t, b in rects0])
        names = {b[0]: b[1] for b in P.BUILDINGS if b[0]}
        parts = architect.make_svg(P, coast, zones, [], Polygon(), Polygon(), trees, [], {'water': [], 'garden': [], 'wood': [], 'sand': [], 'street': []},
                                   [], [], names, door_point, far_box, dock_geoms, None, extra, title=NAME_OF[iid])
        layers = []
        for lid, lname, on, group in architect.LAYERS:
            body = parts[lid]
            if lid in ('paper', 'grid') or not body.strip(): continue  # paper and grid come from the world layer
            layers.append(f"    {{ id: '{lid}', name: {lname!r}, on: {str(on).lower()}, group: '{group}', svg: `{architect.svg_doc(body).replace('`', chr(39))}` }},")
        rects = []
        for g in (solids_geom.geoms if hasattr(solids_geom, 'geoms') else [solids_geom]):
            l, t, r, b = g.bounds
            if g.area > 30:  # buildings: their rect; trees: a small square
                rects.append((l, r, t, b))
            else:
                c = g.centroid; rects.append((c.x - 2, c.x + 2, c.y - 2, c.y + 2))
        out.append(f'  {iid}: {{')
        out.append('    layers: [')
        out += layers
        out.append('    ],')
        out.append('    solids: [' + ','.join(f'{l:.1f},{r:.1f},{t:.1f},{b:.1f}' for l, r, t, b in rects) + '],')
        out.append('    doors: [' + ', '.join(f"{{ id: '{b[0]}', x: {door_point(b)[0]:g}, y: {door_point(b)[1]:g} }}" for b in P.BUILDINGS if b[0]) + '],')
        out.append('    docks: [' + ', '.join(f'{{ from: {{ x: {p[0][0]:.1f}, y: {p[0][1]:.1f} }}, to: {{ x: {p[1][0]:.1f}, y: {p[1][1]:.1f} }}, halfWidth: {w / 2 + 1:g} }}' for _, _, w, p in P.DOCKS) + '],')
        out.append('    cliffs: [' + ', '.join('[' + ','.join(f'{x:g},{y:g}' for x, y in r) + ']' for r in cliffs) + '],')
        out.append('  },')
        print(iid, 'buildings', len(P.BUILDINGS), 'trees', len(trees), 'cliffs', len(cliffs), *(['PROBLEMS'] + problems if problems else []))
        if len(sys.argv) > 1:
            on_ids = [l[0] for l in architect.LAYERS if l[2]]
            open(f'{sys.argv[1]}/{iid}.svg', 'w').write(architect.svg_doc('\n'.join(parts[i] for i in on_ids)))
    out.append('};')
    open(f'{ROOT}/src/blueprint/islandPlans.generated.ts', 'w').write('\n'.join(out) + '\n')
    print('KB', os.path.getsize(f'{ROOT}/src/blueprint/islandPlans.generated.ts') // 1024)

main()
