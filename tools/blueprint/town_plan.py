"""Basse-Terre laid out like a real 1700s harbour town (Nassau, Whitby, Port Royal) instead of a grid:
a curving waterfront street under the quay wall, a market square at the heart, lanes winding uphill
from the harbour at odd angles, cross streets that bend with the hill, and narrow alleys and ginnels
cutting between the terraces, some ending in yards. Every shop, tavern and quest building keeps its
id and gets a front on a proper street (doors face south, onto the street); everything else is filled
with terraced houses of mixed widths along the street fronts, with walled back yards behind.

STREETS are added to the plan's roads (kind 'street': walkable and checked, but drawn as the town's
cobbles, not as a dirt road). layout() turns the painted town's land into street/garden cells and
returns the houses and doors in the same form the rest of the builder already uses."""
import math, random
from shapely.geometry import LineString, Polygon, box, Point
from shapely.ops import unary_union
from shapely.prepared import prep

# (name, kind, width, points), island-relative. Kind 'street' for all; width sets main/lane/alley.
STREETS = [
    ("Front Street", 'street', 11, [(-150, -222), (-134, -238), (-116, -262), (-100, -281), (-40, -282), (30, -279), (100, -282), (170, -279), (240, -281), (298, -277)]),
    ("High Street", 'street', 8, [(62, -278), (52, -246), (66, -212), (58, -176), (62, -130)]),
    ("High Street (upper)", 'street', 8, [(62, -72), (50, -42), (46, -8), (40, 30)]),
    ("Gallows Lane", 'street', 7, [(-58, -278), (-70, -246), (-62, -212), (-82, -176), (-104, -138), (-118, -100), (-150, -64)]),
    ("Turtle Lane", 'street', 7, [(222, -278), (212, -246), (226, -210), (248, -182), (270, -162), (300, -150)]),
    ("Chandlers' Row", 'street', 6, [(-68, -241), (-30, -237), (10, -245), (54, -244), (100, -238), (150, -245), (190, -237), (214, -242)]),
    ("Ropewalk", 'street', 6, [(-82, -176), (-40, -170), (0, -178), (58, -176), (110, -183), (160, -173), (200, -181), (248, -182)]),
    ("Tanners' Row", 'street', 6, [(6, -101), (-40, -96), (-80, -105), (-118, -100)]),
    ("Salt Row", 'street', 6, [(108, -101), (150, -109), (200, -99), (250, -107), (288, -98)]),
    ("Chapel Lane", 'street', 6, [(-140, -20), (-100, -34), (-50, -28), (0, -40), (48, -36), (100, -26), (150, -38), (200, -30), (250, -42), (290, -34)]),
    # alleys and ginnels (narrow, some climbing in steps, some ending in a yard)
    ("Cat Steps", 'street', 3.4, [(-10, -276), (-14, -243)]),
    ("Kipper Ginnel", 'street', 3.4, [(128, -276), (124, -242)]),
    ("Tar Alley", 'street', 3.4, [(172, -276), (176, -240)]),
    ("Blind Lane", 'street', 3.4, [(18, -241), (22, -178)]),
    ("Bosun's Ginnel", 'street', 3.4, [(150, -242), (146, -177)]),
    ("Crook Alley", 'street', 3.4, [(-30, -237), (-24, -206), (-28, -173)]),
    ("Lantern Alley", 'street', 3.4, [(-40, -170), (-46, -136), (-42, -98)]),
    ("Pitch Alley", 'street', 3.4, [(180, -177), (186, -140), (182, -102)]),
    ("Barrel Ginnel", 'street', 3.4, [(232, -181), (238, -104)]),
    ("Widow's Walk", 'street', 3.4, [(-60, -100), (-54, -64), (-58, -30)]),
    ("Chapel Steps", 'street', 3.4, [(160, -106), (154, -70), (158, -36)]),
    ("Coffin Alley", 'street', 3.4, [(228, -103), (224, -40)]),
    ("Pump Yard", 'street', 3.4, [(100, -28), (98, 10)]),
    ("Sexton's Yard", 'street', 3.4, [(-100, -32), (-96, 14)]),
    ("Dyer's Yard", 'street', 3.4, [(200, -30), (204, 12)]),
]
STEPPED = {"Cat Steps", "Chapel Steps", "Kipper Ginnel", "Widow's Walk"}  # alleys that climb in flights of steps
YARDS = []  # filled by layout(): paved yards and gaps, drawn as cobbles with the streets
SQUARE = Polygon([(4, -128), (100, -132), (110, -84), (92, -70), (2, -74)])  # the market square

# named buildings: id -> (street it fronts, preferred x). Shops, taverns and quest buildings.
HOMES = {
    'tortuga_fishermens_guildhall': ("Chandlers' Row", -50), 'tortuga_quayside_trading_post': ("Chandlers' Row", -16),
    'tortuga_ships_provisioner': ("Chandlers' Row", 30), 'tortuga_powder_and_shot': ("Chandlers' Row", 88),
    'tortuga_harbourmaster': ("Chandlers' Row", 112), 'tortuga_customs': ("Chandlers' Row", 170),
    'tortuga_fishmonger': ("Chandlers' Row", 200),
    'tortuga_careening_shed': ("Ropewalk", -64), 'tortuga_brine_barrel': ("Ropewalk", -12),
    'tortuga_net_loft': ("Ropewalk", 120), 'tortuga_chandlery': ("Ropewalk", 166), 'tortuga_rope_and_tackle': ("Ropewalk", 200),
    'tortuga_turtle_kraal': ("Ropewalk", 226),
    'tortuga_cockpit': ("SQUARE", 16), 'tortuga_tavern': ("SQUARE", 48), 'tortuga_shop': ("SQUARE", 84),
    'tortuga_crews_lodge': ("Tanners' Row", -24), 'tortuga_boarding_house': ("Tanners' Row", -78), 'tortuga_smithy': ("Tanners' Row", -104),
    'tortuga_bakery': ("Salt Row", 126), 'tortuga_dockworkers_bunkhouse': ("Salt Row", 206),
    'tortuga_salt_works': ("Salt Row", 266), 'tortuga_distillery': ("Salt Row", 166),
    'tortuga_overflow_warehouse': ("Chapel Lane", -80), 'tortuga_sailmakers_loft': ("Chapel Lane", -28), 'tortuga_coopers_yard': ("Chapel Lane", 18),
    'tortuga_chapel': ("Chapel Lane", 120), 'tortuga_sextons_house': ("Chapel Lane", 176), 'tortuga_menagerie': ("Chapel Lane", 226),
    'tortuga_tannery': ("Chapel Lane", 270),
    'tortuga_timber_yard': ("EDGE", 0), 'tortuga_warehouse': ("EDGE", 140),
}
SIZE = {'tavern': (26, 17), 'shop': (16, 14), 'market': (18, 14), 'warehouse': (22, 16), 'customs': (20, 15),
        'smithy': (18, 14), 'manor': (20, 15), 'chapel': (20, 18)}
ROOF = 1.45  # a sprite rises about this many depths above its footprint's base


def size_at(rng, y):
    """House width and depth by how far up the hill it stands: cramped huts on the waterfront, middling
    terraces mid-town, broad merchants' houses at the top (the town climbs south, away from the harbour)."""
    if y < -225: return rng.choice([10, 11, 12, 13]), rng.choice([11, 12])
    if y < -90: return rng.choice([13, 14, 15, 16, 17]), rng.choice([13, 14, 15])
    return rng.choice([16, 18, 20, 22]), rng.choice([15, 16, 17])


def wealth(b):
    """'hut' by the harbour, 'home' mid-town, 'grand' up the hill: picks how a scenery house is built."""
    return 'hut' if b < -225 else 'home' if b < -60 else 'grand'


def layout(cls, TOWN, CELL, types, seed=7):
    """cls: the painted town's cells (0 street, 1 wood, 2 water, 3 garden, 4 sand). Rewrites the land
    (0/3) as street or garden and returns (cls, houses [(l, r, t, b)], doors [(id, x, y)], scenery set)."""
    rng = random.Random(seed)
    ny, nx = cls.shape
    land = (cls == 0) | (cls == 3)
    sg = {n: LineString(p).buffer(w / 2, cap_style=2, join_style=1) for n, k, w, p in STREETS}
    sg['SQUARE'] = SQUARE
    streets = unary_union(list(sg.values()))
    st_p = prep(streets.buffer(0.3))
    l0, r0, t0, b0 = TOWN

    def on_land(l, t, r, b):
        i0, i1 = int((l - l0) / CELL), int(math.ceil((r - l0) / CELL))
        j0, j1 = int((t - t0) / CELL), int(math.ceil((b - t0) / CELL))
        if i0 < 0 or j0 < 0 or i1 > nx or j1 > ny: return False
        return bool(land[j0:j1, i0:i1].all())

    houses, roofs, doors, scenery = [], [], [], set()

    def fits(l, t, r, b, d, edge_ok=False):
        if l < l0 + 1 or r > r0 - 1 or t < t0: return False
        if not edge_ok and b > b0 - 1: return False
        if not on_land(l, t, r, min(b, b0 - 0.1)): return False
        if not on_land(l, max(t0, b - ROOF * d), r, t + 0.1): return False
        if st_p.intersects(box(l + 0.2, b - ROOF * d, r - 0.2, b - 0.4)): return False
        rb = box(l + 0.25, b - ROOF * d, r - 0.25, b - 0.1)
        if any(rb.intersects(o) for o in roofs): return False
        for (l2, r2, t2, b2), o in zip(houses, roofs):  # a neighbour standing higher or lower: leave room for the eaves
            if abs(b2 - b) >= 1.5 and min(r, r2) - max(l, l2) > -3.0 and o.bounds[1] < b and b - ROOF * d < b2: return False
        return True

    def add(l, t, r, b, d, door_id=None, scen=True):
        houses.append((round(l, 1), round(r, 1), round(t, 1), round(b, 1)))
        roofs.append(box(l, b - ROOF * d, r, b))
        if door_id: doors.append((door_id, round((l + r) / 2, 1), round(b + 1.5, 1)))
        elif scen: scenery.add(houses[-1])

    def front_base(name, l, r):
        """The y a house spanning l..r stands at to front this street (its north edge), or None."""
        g = sg[name]; ys = []
        for x in (l + 0.3, (l + r) / 2, r - 0.3):
            cut = g.intersection(LineString([(x, t0 - 5), (x, b0 + 40)]))
            if cut.is_empty: return None
            ys.append(cut.bounds[1])
        return min(ys) - 0.3

    # 1. the named buildings, each fronting its street as near its preferred spot as it will go
    for bid, (street, px) in HOMES.items():
        w, d = SIZE.get(types.get(bid, 'shop'), (16, 14))
        placed = False
        for off in [0] + [s * k for k in range(2, 120, 2) for s in (1, -1)]:
            l, r = px + off - w / 2, px + off + w / 2
            if street == 'EDGE':
                b = b0 - 1.0
            else:
                b = front_base(street, l, r)
                if b is None: continue
            if fits(l, b - d, r, b, d, edge_ok=(street == 'EDGE')):
                add(l, b - d, r, b, d, bid); placed = True; break
        if not placed:  # its own street is full: the nearest front on any street
            for nm, *_ in sorted(STREETS, key=lambda st: -st[2]):
                for xx in range(-140, 296, 3):
                    l, r = xx - w / 2, xx + w / 2
                    b = front_base(nm, l, r)
                    if b is not None and fits(l, b - d, r, b, d): add(l, b - d, r, b, d, bid); placed = True; break
                if placed: break
        if not placed: print('  town: no room for', bid)

    # 2. terraces along every street front: mixed widths, mostly wall to wall, now and then a gap
    #    for an alley or a yard, never two houses quite alike
    for name, kind, w_, pts in STREETS + [('SQUARE', 'street', 0, [(2, 0), (110, 0)])]:
        xs = [p[0] for p in pts]; lo, hi = min(xs), max(xs)
        if hi - lo < 10: continue
        x = lo
        while x < hi - 10:
            w, d = size_at(rng, front_base(name, x, x + 14) or 0)
            b = front_base(name, x, x + w)
            if b is not None and fits(x, b - d, x + w, b, d):
                add(x, b - d, x + w, b, d); x += w
                g = rng.random()
                if g < 0.12: x += rng.uniform(2.0, 3.5)       # a slot between houses (drawn as an alley)
                elif g < 0.16: x += rng.uniform(6, 9)         # a yard
            else:
                x += 1.0

    # 2b. the other side of each street: a row standing back to it, its roofs lining the street
    for name, kind, w_, pts in STREETS:
        if w_ < 6: continue
        g = sg[name]
        xs = [p[0] for p in pts]; lo, hi = min(xs), max(xs)
        x = lo
        while x < hi - 10:
            w, d = size_at(rng, (pts[0][1] + pts[-1][1]) / 2 + 20)
            ys = []
            for xx in (x + 0.3, x + w / 2, x + w - 0.3):
                cut = g.intersection(LineString([(xx, t0 - 5), (xx, b0 + 40)]))
                if cut.is_empty: ys = None; break
                ys.append(cut.bounds[3])
            if ys:
                b = max(ys) + ROOF * d + 0.4
                if fits(x, b - d, x + w, b, d):
                    add(x, b - d, x + w, b, d); x += w + (rng.uniform(2, 3.5) if rng.random() < 0.12 else 0); continue
            x += 1.0

    # 3. houses stepping down the winding lanes and alleys, on both sides, gable end to the lane
    for name, kind, w_, pts in STREETS:
        g = sg[name]
        (xa, ya), (xb, yb) = pts[0], pts[-1]
        if abs(yb - ya) < abs(xb - xa) * 0.7: continue    # only the lanes that climb
        ys_ = sorted([ya, yb]); y = ys_[0] + 8
        while y < ys_[1]:
            w = rng.choice([11, 12, 13, 14]); d = rng.choice([11, 12, 13])
            for side in (1, -1):
                cut = g.intersection(LineString([(-400, y - d / 2), (400, y - d / 2)]))
                if cut.is_empty: continue
                cl, _, cr, _ = cut.bounds
                l, r = (cr + 0.4, cr + 0.4 + w) if side == 1 else (cl - 0.4 - w, cl - 0.4)
                if fits(l, y - d, r, y, d): add(l, y - d, r, y, d)
            y += rng.choice([14, 16, 18])

    # 4. courts: a few houses behind the street fronts, round small yards, where a block is still wide open
    cand = [(x, y) for y in range(int(t0) + 10, int(b0) - 4, 3) for x in range(int(l0) + 4, int(r0) - 14, 3)]
    rng.shuffle(cand)
    courts = 0
    for x, y in cand:
        w = rng.choice([13, 14, 16]); d = rng.choice([12, 13, 14])
        if not fits(x, y - d, x + w, y, d): continue
        # it needs a yard in front and must sit clear of the street fronts' back gardens
        if not fits(x - 3, y - d - 3, x + w + 3, y + 5, d + 3): continue
        add(x, y - d, x + w, y, d); courts += 1
        if courts >= 18: break

    # paved yards: a cobbled yard in front of every house that faces a garden, and the narrow gaps
    # between neighbouring houses, so the town reads as a stone port with gardens behind, not a suburb
    yards = []
    for (l, r, t, b) in houses:
        yards.append(box(l - 2.0, b - 0.2, r + 2.0, b + 6.0))
    rows = {}
    for h in houses: rows.setdefault(round(h[3] / 3), []).append(h)
    for row in rows.values():
        row.sort()
        for (l1, r1, t1, b1), (l2, r2, t2, b2) in zip(row, row[1:]):
            if 0 < l2 - r1 < 8: yards.append(box(r1 - 0.2, max(t1, t2), l2 + 0.2, min(b1, b2) + 4))
    bl = unary_union([box(l, t, r, b) for l, r, t, b in houses])
    YARDS[:] = [unary_union(yards).difference(bl)]
    streets = unary_union([streets, YARDS[0]])
    # cells: street where the streets and square are, garden for the rest of the land
    out = cls.copy()
    sp = prep(streets)
    for j in range(ny):
        for i in range(nx):
            if not land[j, i]: continue
            out[j, i] = 0 if sp.contains(Point(l0 + (i + .5) * CELL, t0 + (j + .5) * CELL)) else 3
    print('  town plan: named', len(doors), 'houses', len(houses), 'courts', courts)
    return out, houses, doors, scenery
