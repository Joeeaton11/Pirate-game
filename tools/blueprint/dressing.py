"""Set dressing: fills the island the way the target art does — clutter along every building front,
cargo on the quays, stalls and lamps in the squares, boats at the jetties, animals in their pens and
on the beaches, flowers, logs and stones in the grass, and a carved name board at each district.

Returns extra (kind, x, y) props; the builder adds them to the plan (so they show in the blueprint,
get drawn in the art, and the bulky ones become solid)."""
import math, random
from shapely.geometry import Point, LineString, box
from shapely.ops import unary_union
from shapely.prepared import prep

FRONT_CLUTTER = ['barrels', 'crates', 'sacks', 'flowerpot', 'potted_palm', 'barrel', 'crates', 'bench', 'lamp', 'wanted_poster', 'rum_barrels', 'flowerpot', 'potted_palm']
QUAY_CARGO = ['cargo', 'barrels', 'crates', 'sacks', 'nets', 'barrels', 'crates', 'rope_coil', 'barrel', 'lobster_pot', 'crab_trap_stack', 'rope_coil', 'rum_barrels', 'anchor', 'powder_keg']
GRASS_DECOR = ['flowers', 'flowers', 'flowers', 'tall_grass', 'tall_grass', 'tall_grass', 'stone']
SOLID_KINDS = {'cannon', 'rum_cart', 'cannonballs', 'figurehead', 'ship_bell', 'crab_trap_stack', 'stall', 'canopy_never', 'loot_crates', 'tent', 'dead_tree', 'lean_to', 'rubble_stones', 'barrels', 'crates', 'cargo', 'cart', 'stall', 'well', 'barrel', 'sacks', 'rowboat_beached', 'log', 'potted_palm'}


TOWN_WALLS = box(0, 0, 0, 0)


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
        if k not in ('rowboat_moored', 'fishing_boat', 'gull') and bl_near.contains(Point(x, y)): return False  # never on or behind a roof
        if free(x, y, gap):
            out.append((k, round(x, 1), round(y, 1))); taken.append(Point(x, y)); return True
        return False

    bl_all = unary_union(bldg_geoms + [box(l, t, r, b) for l, r, t, b in town_bldgs])
    # the space each building's sprite covers: its footprint plus the roof rising above it
    bl_near = prep(unary_union([box(g.bounds[0] - 0.8, g.bounds[1] - (g.bounds[3] - g.bounds[1]) * 0.9, g.bounds[2] + 0.8, g.bounds[3] + 1.0) for g in bldg_geoms] +
                               [box(l - 0.8, t - (b - t) * 0.9, r + 0.8, b + 1.0) for l, r, t, b in town_bldgs]))
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
        if town_box.contains(Point((l + r) / 2, b)): continue  # town houses stand shoulder to shoulder
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
            front = any(abs(y - (b_ + 2.0)) < 0.9 and l_ + 1 < x < r_ - 1 for l_, r_, t_, b_ in town_bldgs)
            if not front: continue  # only along a house front; the street itself stays clear
            k = rng.choice(['lamp', 'barrels', 'crates', 'bench', 'potted_palm', 'lamp'])
            put(k, x, y, 4.5)

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
            put('crab' if k < 0.25 else 'turtle' if k < 0.33 else 'shells' if k < 0.65 else 'driftwood' if k < 0.85 else 'beached_rowboat', x, y, 10)

    # 7. canopies: striped market awnings over the squares' stalls, lean-tos at farms and camps
    for k, x, y in list(out):
        pass  # stalls carry their own awning now; no separate canopies
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
                pass  # (washing lines across streets read as floating confetti from above; houses carry their own washing)

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
    open_grass = open_grass.difference(town_box.buffer(3))
    og = prep(open_grass); l, t, r, b = open_grass.bounds
    woodsy = prep(unary_union([g for t_, g in zone_geoms if t_ in ('jungle', 'forest', 'swamp')]))
    for _ in range(5000):
        x, y = rng.uniform(l, r), rng.uniform(t, b)
        if og.contains(Point(x, y)):
            k = rng.choice(['mushrooms', 'log', 'tall_grass']) if woodsy.contains(Point(x, y)) else rng.choice(GRASS_DECOR)
            put(k, x, y, 6)

    # 10. planted town gardens: palms, flower beds and greenery inside the walls, like the target
    gdn = unary_union([box(l, t, r, b) for l, r, t, b in town_rects.get('garden', [])])
    for poly in getattr(gdn, 'geoms', [gdn]):
        if poly.area < 40: continue
        inner = poly.buffer(-4.0, join_style=2).difference(bl_all.buffer(3.0)).difference(st.buffer(3.0)).difference(TOWN_WALLS.buffer(4))
        if inner.is_empty: continue
        ip = prep(inner); l, t, r, b = inner.bounds
        n = max(1, int(inner.area / 55))
        for _ in range(n * 10):
            if n <= 0: break
            x, y = rng.uniform(l, r), rng.uniform(t, b)
            if ip.contains(Point(x, y)):
                k = rng.choice(['palm', 'palm', 'flowers', 'flowers', 'tall_grass', 'flowers'])
                if put(k, x, y, 3.2 if k != 'palm' else 6): n -= 1

    # 11. soften the town's edge: a broken band of palms, shrubs and flowers just outside it
    edge = town_box.buffer(7).difference(town_box.buffer(1)).difference(ways.buffer(2)).intersection(coast.buffer(-3))
    ep = prep(edge); l, t, r, b = edge.bounds
    for _ in range(2500):
        x, y = rng.uniform(l, r), rng.uniform(t, b)
        if ep.contains(Point(x, y)): put(rng.choice(['palm', 'palm', 'tall_grass', 'flowers', 'flowers']), x, y, 5.5)

    # 12. the pirate port: bollards along every quay edge, cannons on the seaward edges with shot beside
    #     them, figureheads and ship's wheels from broken-up ships, a bell on the wharf
    if not wood.is_empty:
        sea_side = prep(unary_union([coast.difference(tw)]).buffer(-0.5)) if not tw.is_empty else prep(coast)
        for g in getattr(wood, 'geoms', [wood]):
            ring = g.exterior
            for i in range(int(ring.length / 12)):
                p = ring.interpolate(i * 12 + rng.uniform(0, 1.5))
                q = ring.interpolate(i * 12 + 0.5); nx, ny = q.y - p.y, -(q.x - p.x); L = math.hypot(nx, ny) or 1
                if g.contains(Point(p.x + nx / L, p.y + ny / L)): nx, ny = -nx, -ny
                out_ = Point(p.x + nx / L * 2.5, p.y + ny / L * 2.5)
                if lw.intersects(out_): continue          # only where the deck meets open water
                ix, iy = p.x - nx / L * 4.5, p.y - ny / L * 4.5
                if g.area < 400: continue
                if i % 3 == 1 and g.area > 400:
                    if put('cannon', ix - nx / L * 1.2, iy - ny / L * 1.2, 5): put('cannonballs', ix - nx / L * 3 + 2, iy - ny / L * 3, 2.5)
                else: put('bollard', ix, iy, 2.2)
            if g.area > 900:
                c = g.centroid
                for k_ in ('ship_bell', 'figurehead', 'ship_wheel', 'spyglass'):
                    for _ in range(20):
                        x, y = rng.uniform(g.bounds[0], g.bounds[2]), rng.uniform(g.bounds[1], g.bounds[3])
                        if g.buffer(-2).contains(Point(x, y)) and put(k_, x, y, 4): break
    # beaches: hammocks, skull posts, a half-dug chest, parrot perches
    l, t, r, b = beach.bounds
    inner_c = prep(coast.buffer(-2.5))
    for k_, n_ in (('skull_post', 8), ('hammock', 10), ('treasure_open', 3), ('parrot_perch', 6), ('beach_cannon', 4)):
        for _ in range(n_ * 30):
            if n_ <= 0: break
            x, y = rng.uniform(l, r), rng.uniform(t, b)
            if bp.contains(Point(x, y)) and inner_c.contains(Point(x, y)) and put(k_, x, y, 4.5): n_ -= 1
    # Cayonne's pirate camp and the town squares get the good stuff
    around(-330, -142, 70, ['rum_cart', 'skull_post', 'treasure_open', 'spyglass', 'ship_bell', 'rum_barrels', 'powder_keg', 'cannonballs'], 18, 6)
    for name, l2, r2, t2, b2 in P.PLAZAS:
        if name in ('Duelling Ground', 'Old Landing Square'): continue
        put('lantern_string', (l2 + r2) / 2, t2 + 1, 3); put('wanted_poster', l2 + 2.5, (t2 + b2) / 2, 3)

    # 9. a carved name board at each district label
    for x, y, text, size in P.LABELS:
        if size == 'district' and 'painted' not in text:
            out.append(('name_board:' + text.title().replace("'S", "'s"), x, y + 4))
    return out
