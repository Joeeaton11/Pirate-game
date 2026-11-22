"""Set dressing: fills the island the way the target art does — clutter along every building front,
cargo on the quays, stalls and lamps in the squares, boats at the jetties, animals in their pens and
on the beaches, flowers, logs and stones in the grass, and a carved name board at each district.

Returns extra (kind, x, y) props; the builder adds them to the plan (so they show in the blueprint,
get drawn in the art, and the bulky ones become solid)."""
import math, random
from shapely.geometry import Point, LineString, box
from shapely.ops import unary_union
from shapely.prepared import prep

FRONT_CLUTTER = ['barrels', 'crates', 'sacks', 'flowerpot', 'potted_palm', 'barrel', 'crates', 'bench', 'lamp']
QUAY_CARGO = ['cargo', 'barrels', 'crates', 'sacks', 'nets', 'barrels', 'crates', 'rope_pile', 'barrel']
GRASS_DECOR = ['flowers', 'flowers', 'tall_grass', 'tall_grass', 'stone', 'log', 'mushrooms', 'flowers']
SOLID_KINDS = {'stall', 'canopy_never', 'loot_crates', 'tent', 'dead_tree', 'lean_to', 'rubble_stones', 'barrels', 'crates', 'cargo', 'cart', 'stall', 'well', 'barrel', 'sacks', 'rowboat_beached', 'log', 'potted_palm'}


def dress(P, coast, beach, zone_geoms, ways, bldg_geoms, water, town_box, town_rects, town_bldgs, doors, dock_geoms, seed=21):
    rng = random.Random(seed)
    out = []
    taken = [Point(x, y) for _, x, y in P.PROPS]
    door_pts = [Point(x, y) for _, x, y in doors]
    for b in P.BUILDINGS:
        if b[7]:
            door_pts.append(Point(b[3], b[4] + b[6] / 2))
    def free(x, y, gap=2.6):
        p = Point(x, y)
        return all(p.distance(q) > gap for q in taken) and all(p.distance(q) > 4 for q in door_pts)
    # paths, lanes, walks and squares stay clear of anything you would bump into
    corridor = prep(unary_union([LineString(pts).buffer(w / 2 + 1.4) for n, k, w, pts in P.ROADS] +
                                [box(l + 6, t + 6, r - 6, b - 6) for _, l, r, t, b in P.PLAZAS if r - l > 14 and b - t > 14]))
    def put(k, x, y, gap=2.6):
        if k in SOLID_KINDS and corridor.contains(Point(x, y)): return False
        if free(x, y, gap):
            out.append((k, round(x, 1), round(y, 1))); taken.append(Point(x, y)); return True
        return False

    bl_all = unary_union(bldg_geoms + [box(l, t, r, b) for l, r, t, b in town_bldgs])
    st = unary_union([box(l, t, r, b) for l, r, t, b in town_rects.get('street', [])])
    walkable = unary_union([st, ways]).difference(bl_all.buffer(0.8))
    walk_p = prep(walkable)

    # 1. clutter along building fronts and sides (town houses and plan buildings)
    fronts = [(l, t, r, b) for l, r, t, b in town_bldgs] + [(g.bounds[0], g.bounds[1], g.bounds[2], g.bounds[3]) for g in bldg_geoms]
    for l, t, r, b in fronts:
        n = int((r - l) / 4.5)
        for k in range(n):
            x = l + (k + 0.5) * (r - l) / n + rng.uniform(-0.8, 0.8)
            y = b + rng.uniform(1.6, 2.6)
            if walk_p.contains(Point(x, y)) or coast.contains(Point(x, y)):
                if rng.random() < 0.55: put(rng.choice(FRONT_CLUTTER), x, y)
        for x in (l - 2.0, r + 2.0):  # gable ends
            for y in (t + (b - t) * 0.4, t + (b - t) * 0.8):
                if rng.random() < 0.5 and coast.contains(Point(x, y)) and not bl_all.contains(Point(x, y)):
                    put(rng.choice(['barrels', 'crates', 'woodpile', 'water_butt', 'barrel', 'sacks']), x, y)

    # 2. the squares: stalls round the edge, lamps at the corners
    for name, l, r, t, b in P.PLAZAS:
        if name in ('Duelling Ground', 'Old Landing Square'): continue
        for x in (l + 1, r - 1):
            for y in (t + 1, b - 1): put('lamp', x, y, 2)
        for k in range(int((r - l) / 9)):
            put('stall', l + 6 + k * 9, t + 3.5, 5)
    # town streets: lamps every so often along the kerbs, a few carts and stalls in the open
    if not st.is_empty:
        sp = prep(st.buffer(-1.5))
        l, t, r, b = st.bounds
        for _ in range(900):
            x, y = rng.uniform(l, r), rng.uniform(t, b)
            if not sp.contains(Point(x, y)) or bl_all.distance(Point(x, y)) < 1.2: continue
            near = bl_all.distance(Point(x, y)) < 4
            if not near: continue  # the middle of the street stays open
            k = rng.choice(['lamp', 'barrels', 'crates', 'bench', 'potted_palm', 'lamp'])
            put(k, x, y, 7 if not near else 4.5)

    # 3. quays and docks: cargo, nets, rope, cranes
    wood = unary_union([box(l, t, r, b) for l, r, t, b in town_rects.get('wood', [])] + [g for *_, g in dock_geoms])
    if not wood.is_empty:
        wp = prep(wood.buffer(-1.2).difference(wood.buffer(-4.5))); l, t, r, b = wood.bounds  # cargo along the quay edges, a clear way down the middle
        for _ in range(9000):
            x, y = rng.uniform(l, r), rng.uniform(t, b)
            if wp.contains(Point(x, y)): put(rng.choice(QUAY_CARGO), x, y, 3.0)
        for g in getattr(wood, 'geoms', [wood]):
            if g.area > 1200: put('crane', g.centroid.x, g.bounds[1] + 3, 8)

    # 4. boats: rowboats tied along the docks, fishing boats in the shallows
    sea_near = coast.buffer(14).difference(coast.buffer(3))
    sn = prep(sea_near)
    tw = unary_union([box(l, t, r, b) for l, r, t, b in town_rects.get('water', [])])
    lw = prep(unary_union([coast.difference(tw), wood]).buffer(1))
    for g in list(getattr(wood, 'geoms', [wood])):
        ring = g.exterior
        for i in range(0, int(ring.length), 14):
            p = ring.interpolate(i + rng.uniform(0, 6))
            for dx, dy in ((4, 0), (-4, 0), (0, 4), (0, -4)):
                q = Point(p.x + dx, p.y + dy)
                if not lw.intersects(q):
                    if rng.random() < 0.3: put('rowboat_moored', q.x, q.y, 12)
                    break
    l, t, r, b = sea_near.bounds
    for _ in range(400):
        x, y = rng.uniform(l, r), rng.uniform(t, b)
        if sn.contains(Point(x, y)) and rng.random() < 0.08: put('fishing_boat', x, y, 30)

    # 5. animals: in their pens, on beaches, on posts, in the woods
    for t_, g in zone_geoms:
        pen = prep(g.buffer(-1.5))
        l, tt, r, b = g.bounds
        kinds = {'pen': ['goat', 'chicken', 'pig'], 'paddock': ['goat', 'goat'], 'orchard': ['chicken'], 'graveyard': ['crow'],
                 'jungle': ['parrot'], 'palms': ['parrot'], 'forest': ['parrot']}.get(t_)
        if not kinds: continue
        n = {'pen': 4, 'paddock': 5, 'orchard': 3, 'graveyard': 2, 'jungle': 8, 'palms': 4, 'forest': 6}[t_]
        for _ in range(n * 6):
            if n <= 0: break
            x, y = rng.uniform(l, r), rng.uniform(tt, b)
            if pen.contains(Point(x, y)) and put(rng.choice(kinds), x, y, 3): n -= 1
    bp = prep(beach)
    l, t, r, b = beach.bounds
    for _ in range(3000):
        x, y = rng.uniform(l, r), rng.uniform(t, b)
        if bp.contains(Point(x, y)):
            k = rng.random()
            put('crab' if k < 0.25 else 'turtle' if k < 0.33 else 'shells' if k < 0.65 else 'driftwood' if k < 0.85 else 'beached_rowboat', x, y, 6)

    # 7. canopies: striped market awnings over the squares' stalls, lean-tos at farms and camps
    for k, x, y in list(out):
        if k == 'stall' and rng.random() < 0.7: put('canopy', x + rng.uniform(-3, 3), y - 3.5, 3)
    for t_, g in zone_geoms:
        if t_ in ('fields', 'sugarcane', 'pen', 'paddock', 'allotment', 'orchard') and g.area > 400:
            e = g.exterior if g.geom_type == 'Polygon' else max(g.geoms, key=lambda q: q.area).exterior
            for i in range(0 if g.area < 4000 else 2):
                p = e.interpolate(rng.uniform(0, e.length))
                if coast.contains(p) and not ways.buffer(2).contains(p): put('lean_to', p.x, p.y, 10)
            p = e.interpolate(rng.uniform(0, e.length))
            if coast.contains(p) and not ways.buffer(2).contains(p): put('lean_to', p.x, p.y, 10)
    for k, x, y in P.PROPS:
        if k in ('tent', 'campfire') and rng.random() < 0.6: put('lean_to', x + rng.uniform(-8, 8), y + rng.uniform(-6, 2), 6)
    # washing strung across the narrow town streets
    if not st.is_empty:
        for l, t, r, b in fronts:
            if rng.random() < 0.18:
                x, y = rng.uniform(l + 2, r - 2), t - 2
                if sp.contains(Point(x, y - 3)): put('laundry_line', x, y - 3, 7)

    # 8. district character
    def around(cx, cy, rad, kinds, n, gap=4):
        disk = Point(cx, cy).buffer(rad).intersection(coast.buffer(-2)).difference(unary_union([ways.buffer(1.5), bl_all.buffer(2), water.buffer(1)]))
        if disk.is_empty: return
        dp = prep(disk); l, t, r, b = disk.bounds
        for _ in range(n * 12):
            if n <= 0: break
            x, y = rng.uniform(l, r), rng.uniform(t, b)
            if dp.contains(Point(x, y)) and put(rng.choice(kinds), x, y, gap): n -= 1
    around(-330, -142, 70, ['tent', 'campfire', 'loot_crates', 'barrels', 'tent', 'woodpile', 'jolly_roger'], 26, 6)
    around(-20, 250, 75, ['dead_tree', 'dead_tree', 'fog', 'crow', 'fog', 'dead_tree', 'mushrooms'], 70, 4)
    around(10, 445, 70, ['vines', 'rubble_stones', 'vines', 'rubble_stones', 'tall_grass'], 45, 4)
    around(-96, 430, 30, ['vines', 'rubble_stones'], 14, 4)
    # cliff birds' nests and mangroves round the swamp
    band = coast.difference(coast.buffer(-10)).intersection(unary_union([g for t_, g in zone_geoms if t_ == 'rock']) if any(t_ == 'rock' for t_, _ in zone_geoms) else coast.difference(coast.buffer(-10)))
    bp2 = prep(band); l, t, r, b = band.bounds
    for _ in range(1500):
        x, y = rng.uniform(l, r), rng.uniform(t, b)
        if bp2.contains(Point(x, y)):
            if rng.random() < 0.1: put('nest', x, y, 30)
            elif rng.random() < 0.12 and coast.exterior.distance(Point(x, y)) < 5: put('tide_pool', x, y, 12)
    for t_, g in zone_geoms:
        if t_ == 'swamp':
            e = g.buffer(-1)
            for i in range(0, int(e.length), 7):
                p = e.exterior.interpolate(i) if e.geom_type == 'Polygon' else None
                if p is not None: put('mangrove_roots', p.x + rng.uniform(-2, 2), p.y + rng.uniform(-2, 2), 4)

    # 6. grass decor: flowers, tall grass, stones, logs, mushrooms
    hard = unary_union([box(l, t, r, b) for kk in ('wood', 'water', 'sand') for l, r, t, b in town_rects.get(kk, [])] + [g for *_, g in dock_geoms])
    open_grass = coast.buffer(-3).difference(unary_union([beach, ways.buffer(1.5), bl_all.buffer(2.5), water.buffer(1.5), st.buffer(1), hard.buffer(2)] + [g.buffer(1) for t_, g in zone_geoms if t_ in ('fields', 'sugarcane', 'allotment', 'graveyard', 'quarry', 'rock', 'pen', 'paddock')]))
    og = prep(open_grass); l, t, r, b = open_grass.bounds
    for _ in range(9000):
        x, y = rng.uniform(l, r), rng.uniform(t, b)
        if og.contains(Point(x, y)): put(rng.choice(GRASS_DECOR), x, y, 4.2)

    # 10. planted town gardens: palms, flower beds and greenery inside the walls, like the target
    gdn = unary_union([box(l, t, r, b) for l, r, t, b in town_rects.get('garden', [])])
    for poly in getattr(gdn, 'geoms', [gdn]):
        if poly.area < 40: continue
        inner = poly.buffer(-2.2, join_style=2).difference(bl_all.buffer(1.5))
        if inner.is_empty: continue
        ip = prep(inner); l, t, r, b = inner.bounds
        n = max(1, int(inner.area / 55))
        for _ in range(n * 10):
            if n <= 0: break
            x, y = rng.uniform(l, r), rng.uniform(t, b)
            if ip.contains(Point(x, y)):
                k = rng.choice(['palm', 'palm', 'flowers', 'flowers', 'tall_grass', 'potted_palm', 'flowers'])
                if put(k, x, y, 3.2 if k != 'palm' else 6): n -= 1

    # 9. a carved name board at each district label
    for x, y, text, size in P.LABELS:
        if size == 'district' and 'painted' not in text:
            out.append(('name_board:' + text.title().replace("'S", "'s"), x, y + 4))
    return out
