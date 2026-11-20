"""Architect-style site plan of Tortuga: ink outlines on paper, no fills or art. One SVG is the
single source for both the in-game Plan view (src/blueprint/tortugaPlan.svg.ts via SvgXml) and
the review preview. Island-relative world units; viewBox -620 -540 1240 1080."""
from shapely.geometry import Polygon, LineString, Point, box
from shapely.ops import unary_union
from xml.sax.saxutils import escape

X0, Y0, W, H = -620, -580, 1240, 1120
PAPER, INK, BLUE, GREEN, GRID = '#f4f1e6', '#2b2a27', '#3b6e9c', '#4c7a45', '#8fb0cf'
POI_COL = {'treasure': '#b8860b', 'landmark': '#b8860b', 'resource': '#2f8fb5', 'quest': '#c0392b'}

def f(v): return f'{v:.1f}'.rstrip('0').rstrip('.')

def rings(g):
    gs = [g] if g.geom_type == 'Polygon' else [p for p in getattr(g, 'geoms', []) if p.geom_type == 'Polygon']
    for p in gs:
        if p.is_empty: continue
        yield p.exterior
        yield from p.interiors

def d_of(g, close=True):
    out = []
    for r in rings(g):
        c = list(r.coords)[:-1]
        if len(c) < 2: continue
        out.append('M' + 'L'.join(f'{f(x)} {f(y)}' for x, y in c) + ('Z' if close else ''))
    return ''.join(out)

def lines_d(geom):
    gs = [geom] if geom.geom_type == 'LineString' else list(getattr(geom, 'geoms', []))
    return ''.join('M' + 'L'.join(f'{f(x)} {f(y)}' for x, y in g.coords) for g in gs if g.geom_type == 'LineString' and len(g.coords) > 1)

def outline_d(g, keep=None, drop=None):
    """Ring outlines as open lines, optionally clipped (keep = only inside, drop = cut out)."""
    out = []
    for r in rings(g):
        ln = LineString(r.coords)
        if keep is not None: ln = ln.intersection(keep)
        if drop is not None: ln = ln.difference(drop)
        if not ln.is_empty: out.append(lines_d(ln if ln.geom_type != 'GeometryCollection' else unary_union([x for x in ln.geoms if 'Line' in x.geom_type])))
    return ''.join(out)

def hatch(poly, spacing, angle_deg):
    """Parallel lines clipped to poly (furrows, sugarcane rows, bridge planks)."""
    import math
    minx, miny, maxx, maxy = poly.bounds
    cx, cy = (minx + maxx) / 2, (miny + maxy) / 2
    R = math.hypot(maxx - minx, maxy - miny)
    a = math.radians(angle_deg); dx, dy = math.cos(a), math.sin(a); nx, ny = -dy, dx
    segs = []
    k = -R
    while k <= R:
        p0 = (cx + nx * k - dx * R, cy + ny * k - dy * R); p1 = (cx + nx * k + dx * R, cy + ny * k + dy * R)
        segs.append(LineString([p0, p1]).intersection(poly)); k += spacing
    return ''.join(lines_d(s) for s in segs if not s.is_empty)

def path(d, stroke, w, extra=''):
    return f'<path d="{d}" fill="none" stroke="{stroke}" stroke-width="{w}" {extra}/>' if d else ''

def text(x, y, t, size, weight='normal', color=INK, spacing=0, italic=False, anchor='middle'):
    st = ' font-style="italic"' if italic else ''
    ls = f' letter-spacing="{spacing}"' if spacing else ''
    return (f'<text x="{f(x)}" y="{f(y)}" font-family="Arial, Helvetica, sans-serif" font-size="{size}" '
            f'font-weight="{weight}" fill="{color}" text-anchor="{anchor}"{st}{ls}>{escape(t)}</text>')

P_ref = [None]

# Layer order (bottom to top): id, name, shown by default, group.
LAYERS = [
    ('paper', 'Paper', True, 'base'),
    ('grid', 'Drafting grid', True, 'base'),
    ('sea', 'Sea, reef, breakwater', True, 'land'),
    ('coast', 'Coast & beaches', True, 'land'),
    ('terrain', 'Terrain zones', True, 'land'),
    ('farmland', 'Farmland', True, 'land'),
    ('water', 'Rivers & lagoon', True, 'land'),
    ('roads', 'Roads & squares', True, 'build'),
    ('bridges', 'Bridges', True, 'build'),
    ('docks', 'Docks & piers', True, 'build'),
    ('boats', 'Moored boats', True, 'build'),
    ('trees', 'Trees & planting', True, 'nature'),
    ('rocks', 'Rocks', True, 'nature'),
    ('buildings', 'Homes & sheds', True, 'build'),
    ('interactive', 'Interactive buildings', True, 'build'),
    ('entrances', 'Doors & entrances', True, 'build'),
    ('props', 'Props', True, 'detail'),
    ('pois', 'Treasure & resources', True, 'game'),
    ('quests', 'Quest spots', True, 'game'),
    ('height', 'Height & cliffs', False, 'land'),
    ('surface', 'Ground surface', False, 'land'),
    ('districts', 'Districts', False, 'names'),
    ('roofs', 'Roofs', False, 'build'),
    ('danger', 'Danger zones', False, 'game'),
    ('shipping', 'Shallows & lanes', False, 'game'),
    ('discovery', 'Discovery areas', False, 'game'),
    ('triggers', 'Quest triggers', False, 'game'),
    ('walkmap', 'Walk map', False, 'game'),
    ('routes', 'Townsfolk routes', False, 'game'),
    ('lighting', 'Night lighting', False, 'game'),
    ('sound', 'Sound zones', False, 'game'),
    ('spawns', 'Spawn & mooring', False, 'game'),
    ('places', 'Place names', True, 'names'),
    ('names', 'Building names', True, 'names'),
    ('titleblock', 'Title block', True, 'base'),
]

def make_svg(P, coast, zone_geoms, sea_zones, water, bridges, trees, pois, town_rects, town_bldgs, painted_doors,
             names, door_point, town_box, docks=(), breakwater=None, extra=None):
    """Returns {layer_id: svg_body}; wrap with svg_doc() to get a standalone SVG."""
    import math
    P_ref[0] = P
    extra = extra or {}
    layers = {lid: [] for lid, *_ in LAYERS}
    cur = ['paper']
    def L(lid): cur[0] = lid
    class _O:
        def append(self, x):
            if x: layers[cur[0]].append(x)
    o = _O()

    L('paper'); o.append(f'<rect x="{X0}" y="{Y0}" width="{W}" height="{H}" fill="{PAPER}"/>')
    L('grid')
    minor = ''.join(f'M{x} {Y0}V{Y0 + H}' for x in range(-620, 621, 10) if x % 50) + ''.join(f'M{X0} {y}H{X0 + W}' for y in range(Y0, Y0 + H + 1, 10) if y % 50)
    major = ''.join(f'M{x} {Y0}V{Y0 + H}' for x in range(-600, 601, 50)) + ''.join(f'M{X0} {y}H{X0 + W}' for y in range(-550, 541, 50))
    o.append(path(minor, GRID, 0.15, 'opacity="0.35"')); o.append(path(major, GRID, 0.3, 'opacity="0.6"'))

    L('sea')
    for dist, w, op in ((5, 0.35, 0.7), (11, 0.3, 0.45), (18, 0.25, 0.25)):
        o.append(path(outline_d(coast.buffer(dist, join_style=1), drop=town_box), BLUE, w, f'opacity="{op}"'))
    for t, g in sea_zones:
        o.append(path(d_of(g), BLUE, 0.5, 'stroke-dasharray="1 1.6"'))
    if breakwater is not None:
        o.append(f'<path d="{d_of(breakwater)}" fill="{PAPER}" stroke="{INK}" stroke-width="0.5" stroke-dasharray="2 1"/>')
        import random as _r
        rg = _r.Random(3); minx, miny, maxx, maxy = breakwater.bounds; dots = []
        while len(dots) < 260:
            x, y = rg.uniform(minx, maxx), rg.uniform(miny, maxy)
            if breakwater.buffer(-1).contains(Point(x, y)): dots.append(f'M{f(x)} {f(y)}h0.6')
        o.append(path(''.join(dots), INK, 0.6, 'stroke-linecap="round"'))

    def urects(rs, simp=0.5, min_area=0, smooth=0):
        u = unary_union([box(l, t, r, b) for l, r, t, b in rs])
        if smooth: u = u.buffer(smooth, join_style=1).buffer(-smooth, join_style=1)
        if min_area:
            u = unary_union([p for p in (u.geoms if hasattr(u, 'geoms') else [u]) if p.area >= min_area])
        return u.simplify(simp)
    inside = town_box.buffer(-0.8)

    L('coast')
    o.append(path(outline_d(coast, drop=town_box), INK, 1.4, 'stroke-linejoin="round"'))
    o.append(path(d_of(coast.buffer(-14).difference(town_box)), INK, 0.3, 'stroke-dasharray="2 2" opacity="0.7"'))
    town_water = urects(town_rects['water'], 0.9, 30, 1.5)
    o.append(path(outline_d(town_water, keep=inside), INK, 1.2, 'stroke-linejoin="round"'))
    o.append(path(outline_d(town_water.buffer(5, join_style=1), keep=inside), BLUE, 0.35, 'opacity="0.7"'))
    o.append(path(outline_d(urects(town_rects['sand'], 0.8, 20, 1.5), keep=inside), INK, 0.3, 'stroke-dasharray="2 2"'))

    for t, g in zone_geoms:
        if t in ('jungle', 'forest', 'palms', 'swamp', 'garden', 'rock', 'graveyard'):
            L('terrain')
            if t == 'rock': o.append(path(d_of(g), INK, 0.45, 'stroke-dasharray="1 1.5"'))
            elif t == 'graveyard': o.append(path(d_of(g), INK, 0.5))
            else:
                o.append(path(d_of(g), GREEN, 0.5, 'stroke-dasharray="4 2"'))
                if t == 'swamp': o.append(path(hatch(g, 7, 0), GREEN, 0.25, 'stroke-dasharray="1.5 2.5" opacity="0.8"'))
        elif t in ('fields', 'sugarcane'):
            L('farmland')
            o.append(path(d_of(g), INK, 0.5))
            o.append(path(hatch(g, 4 if t == 'fields' else 3, 0 if t == 'fields' else 70), GREEN, 0.25))

    L('water')
    o.append(path(d_of(water), BLUE, 0.7))
    o.append(path(d_of(water.buffer(-1.6)), BLUE, 0.3))

    L('roads')
    for _, k, w, pts in P.ROADS:
        pl = ' '.join(f'{x},{y}' for x, y in pts)
        dash = ' stroke-dasharray="2.5 1.5"' if k == 'path' else ''
        o.append(f'<polyline points="{pl}" fill="none" stroke="{INK}" stroke-width="{w + 0.8}" stroke-linecap="round" stroke-linejoin="round"{dash}/>')
    for n, l, r, t, b in P.PLAZAS:
        o.append(f'<rect x="{l}" y="{t}" width="{r - l}" height="{b - t}" fill="{PAPER}" stroke="{INK}" stroke-width="0.5"/>')
    for _, k, w, pts in P.ROADS:
        pl = ' '.join(f'{x},{y}' for x, y in pts)
        o.append(f'<polyline points="{pl}" fill="none" stroke="{PAPER}" stroke-width="{w - 0.2}" stroke-linecap="round" stroke-linejoin="round"/>')

    L('bridges')
    if not bridges.is_empty:
        o.append(f'<path d="{d_of(bridges)}" fill="{PAPER}" stroke="{INK}" stroke-width="0.6"/>')
        for g in (bridges.geoms if hasattr(bridges, 'geoms') else [bridges]):
            c = list(g.minimum_rotated_rectangle.exterior.coords)
            e1 = (c[1][0] - c[0][0], c[1][1] - c[0][1]); e2 = (c[2][0] - c[1][0], c[2][1] - c[1][1])
            le = e1 if math.hypot(*e1) > math.hypot(*e2) else e2
            o.append(path(hatch(g.buffer(-0.4), 1.6, math.degrees(math.atan2(le[1], le[0])) + 90), INK, 0.2))

    L('docks')
    o.append(path(outline_d(urects(town_rects['wood'], 0.4), keep=inside), INK, 0.6))
    for n, k, w, g in docks:
        o.append(f'<path d="{d_of(g)}" fill="{PAPER}" stroke="{INK}" stroke-width="0.7"/>')
        c = list(g.minimum_rotated_rectangle.exterior.coords)
        e1 = (c[1][0] - c[0][0], c[1][1] - c[0][1]); e2 = (c[2][0] - c[1][0], c[2][1] - c[1][1])
        le = e1 if math.hypot(*e1) > math.hypot(*e2) else e2
        ang = math.degrees(math.atan2(le[1], le[0]))
        o.append(path(hatch(g.buffer(-0.5), 1.8 if k != 'slip' else 1.4, ang + (0 if k == 'slip' else 90)), INK, 0.18))
        if k != 'slip':
            edge = g.exterior; Ln = edge.length; piles = []; t = 0
            while t < Ln:
                p = edge.interpolate(t); piles.append(f'M{f(p.x - 0.7)} {f(p.y - 0.7)}h1.4v1.4h-1.4Z'); t += 8
            o.append(f'<path d="{"".join(piles)}" fill="{INK}"/>')

    L('boats')
    for x, y, hdg in getattr(P, 'MOORED', []):
        o.append(f'<g transform="translate({x},{y}) rotate({hdg})"><path d="M-7 0Q-4 -2.6 3 -2.4L7 0L3 2.4Q-4 2.6 -7 0Z" fill="{PAPER}" stroke="{INK}" stroke-width="0.45"/>'
                 f'<path d="M-4 0H4" stroke="{INK}" stroke-width="0.2"/></g>')

    TR = {'jungle': 4, 'tree': 5, 'palm': 3.2, 'rock': 3.6, 'mangrove': 3.4}
    for kind in TR:
        r = TR[kind]
        d = ''.join(f'M{f(x - r)} {f(y)}a{r} {r} 0 1 0 {2 * r} 0a{r} {r} 0 1 0 {-2 * r} 0' for x, y, k in trees if k == kind)
        if kind == 'rock':
            L('rocks'); o.append(path(d, INK, 0.35, 'stroke-dasharray="0.8 0.8"'))
        else:
            L('trees'); o.append(path(d, GREEN, 0.35))
            if kind == 'palm':
                o.append(path(''.join(f'M{f(x - 2)} {f(y)}h4M{f(x)} {f(y - 2)}v4' for x, y, k in trees if k == kind), GREEN, 0.25))
    L('trees')
    o.append(path(outline_d(urects(town_rects['garden'], 1.0, 25, 1.5), keep=inside), GREEN, 0.35, 'stroke-dasharray="3 1.5"'))

    def walls(l, t, w, h, hatched=False):
        s_ = f'<rect x="{f(l)}" y="{f(t)}" width="{f(w)}" height="{f(h)}" fill="{PAPER}" stroke="{INK}" stroke-width="{0.9 if hatched else 0.8}"/>'
        if w > 4 and h > 4:
            s_ += f'<rect x="{f(l + 1)}" y="{f(t + 1)}" width="{f(w - 2)}" height="{f(h - 2)}" fill="none" stroke="{INK}" stroke-width="0.25"/>'
        if hatched:  # interactive: light diagonal hatch inside the inner wall
            s_ += path(hatch(box(l + 1.6, t + 1.6, l + w - 1.6, t + h - 1.6), 3, 45), INK, 0.12, 'opacity="0.6"')
        return s_
    def door_mark(x, y, side_h, outward):
        dw = 4.5
        if side_h:
            sy = -outward
            return (f'<path d="M{f(x - dw / 2)} {f(y)}h{dw}" stroke="{PAPER}" stroke-width="1.6"/>'
                    f'<path d="M{f(x - dw / 2)} {f(y)}l0 {f(sy * dw)}" stroke="{INK}" stroke-width="0.35"/>'
                    f'<path d="M{f(x - dw / 2)} {f(y + sy * dw)}A{dw} {dw} 0 0 {1 if sy < 0 else 0} {f(x + dw / 2)} {f(y)}" fill="none" stroke="{INK}" stroke-width="0.2"/>')
        sx = -outward
        return (f'<path d="M{f(x)} {f(y - dw / 2)}v{dw}" stroke="{PAPER}" stroke-width="1.6"/>'
                f'<path d="M{f(x)} {f(y - dw / 2)}l{f(sx * dw)} 0" stroke="{INK}" stroke-width="0.35"/>'
                f'<path d="M{f(x + sx * dw)} {f(y - dw / 2)}A{dw} {dw} 0 0 {0 if sx < 0 else 1} {f(x)} {f(y + dw / 2)}" fill="none" stroke="{INK}" stroke-width="0.2"/>')
    for b in P.BUILDINGS:
        bid, label, kind, cx, cy, w, h, side = b
        l, t = cx - w / 2, cy - h / 2
        L('interactive' if bid else 'buildings'); o.append(walls(l, t, w, h, hatched=bool(bid)))
        d = door_point(b)
        if d:
            L('entrances'); o.append(door_mark(d[0], d[1], side in ('N', 'S'), 1 if side in ('S', 'E') else -1))
    for l, r, t, b in town_bldgs:
        ds = [(x, y) for _, x, y in painted_doors if l - 1 <= x <= r + 1 and abs(y - b) < 8]
        L('interactive' if ds else 'buildings'); o.append(walls(l, t, r - l, b - t, hatched=bool(ds)))
        L('entrances')
        for x, _ in ds: o.append(door_mark(x, b, True, 1))
    L('entrances')
    for k, x, y in P.PROPS:
        if k == 'cave':
            o.append(f'<path d="M{x - 3} {y + 1.5}A3 3 0 0 1 {x + 3} {y + 1.5}" fill="none" stroke="{INK}" stroke-width="0.6"/>'
                     f'<path d="M{x - 3} {y + 1.5}h6" stroke="{INK}" stroke-width="0.3" stroke-dasharray="0.8 0.6"/>')

    L('props')
    for k, x, y in P.PROPS:
        if k == 'well': o.append(f'<circle cx="{x}" cy="{y}" r="2.2" fill="none" stroke="{INK}" stroke-width="0.35"/><circle cx="{x}" cy="{y}" r="1.2" fill="none" stroke="{BLUE}" stroke-width="0.3"/>')
        elif k in ('crates', 'cart', 'bench'): o.append(f'<rect x="{x - 1.6}" y="{y - 1.6}" width="3.2" height="3.2" fill="none" stroke="{INK}" stroke-width="0.3"/>')
        elif k == 'grave': o.append(path(f'M{x} {y - 2}v4M{x - 1.2} {y - 0.8}h2.4', INK, 0.35))
        elif k == 'signpost': o.append(path(f'M{x} {y + 2}v-4M{x - 2} {y - 2}h4', INK, 0.4))
        elif k == 'boat': o.append(f'<ellipse cx="{x}" cy="{y}" rx="3.5" ry="1.4" fill="none" stroke="{INK}" stroke-width="0.35"/>')
        elif k == 'cannon': o.append(path(f'M{x - 2} {y}h4', INK, 0.9))
        elif k == 'cave': pass
        else: o.append(f'<circle cx="{x}" cy="{y}" r="1.2" fill="none" stroke="{INK}" stroke-width="0.35"/>')

    for k, pid, x, y in pois:
        c = POI_COL[k]
        if k == 'quest':
            L('quests'); o.append(f'<circle cx="{f(x)}" cy="{f(y)}" r="3" fill="none" stroke="{c}" stroke-width="0.7"/><circle cx="{f(x)}" cy="{f(y)}" r="0.9" fill="{c}"/>')
        else:
            L('pois'); o.append(f'<path d="M{f(x)} {f(y - 3.6)}L{f(x + 3.6)} {f(y)}L{f(x)} {f(y + 3.6)}L{f(x - 3.6)} {f(y)}Z" fill="none" stroke="{c}" stroke-width="0.7"/>')

    # ---- height: contour lines (every 5 m, index every 20 m) and cliff hachures
    L('height')
    for lvl, d_, index in extra.get('contours', []):
        o.append(path(d_, '#8a5a2b', 0.45 if index else 0.25, '' if index else 'opacity="0.8"'))
    for x, y, lvl in extra.get('contour_labels', []):
        o.append(text(x, y, f'{lvl}m', 2.6, 'normal', '#8a5a2b'))
    if extra.get('cliffs'):
        o.append(path(extra['cliffs'], INK, 0.35))
    for x, y, h in extra.get('peaks', []):
        o.append(f'<path d="M{x} {y - 2.4}L{x + 2.1} {y + 1.4}L{x - 2.1} {y + 1.4}Z" fill="#8a5a2b"/>')
        o.append(text(x, y + 6, f'{h}m', 3, 'bold', '#8a5a2b'))

    # ---- ground surface: patterned fills
    L('surface')
    o.append('<defs>'
             '<pattern id="pCobble" width="3" height="3" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1.05" fill="none" stroke="#7f7a6c" stroke-width="0.18"/></pattern>'
             '<pattern id="pDirt" width="4" height="4" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.25" fill="#9c7a4f"/><circle cx="3" cy="2.6" r="0.2" fill="#9c7a4f"/></pattern>'
             '<pattern id="pSand" width="3" height="3" patternUnits="userSpaceOnUse"><circle cx="0.8" cy="0.8" r="0.18" fill="#b89b55"/><circle cx="2.2" cy="2.1" r="0.18" fill="#b89b55"/></pattern>'
             '<pattern id="pGrass" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M2 5l0.6 -1.4M3 5l0 -1.6M4 5l-0.6 -1.4" stroke="#6b8f4e" stroke-width="0.2"/></pattern>'
             '<pattern id="pPlank" width="2" height="2" patternUnits="userSpaceOnUse"><path d="M0 1H2" stroke="#8a6a44" stroke-width="0.2"/></pattern>'
             '</defs>')
    for key, pat, col in (('grass', 'pGrass', '#6b8f4e'), ('sand', 'pSand', '#b89b55'), ('dirt', 'pDirt', '#9c7a4f'),
                          ('cobble', 'pCobble', '#7f7a6c'), ('plank', 'pPlank', '#8a6a44')):
        g = extra.get('surfaces', {}).get(key)
        if g is not None and not g.is_empty:
            o.append(f'<path d="{d_of(g)}" fill="url(#{pat})" fill-rule="evenodd" stroke="{col}" stroke-width="0.2" stroke-opacity="0.6"/>')
    lx, ly = -600, 300
    o.append(f'<rect x="{lx - 4}" y="{ly - 10}" width="70" height="66" fill="{PAPER}" stroke="{INK}" stroke-width="0.4"/>')
    o.append(text(lx, ly - 2, 'GROUND SURFACE', 3.4, 'bold', anchor='start'))
    for i, (n_, pat) in enumerate((('Grass', 'pGrass'), ('Sand', 'pSand'), ('Dirt road', 'pDirt'), ('Cobbles', 'pCobble'), ('Planks', 'pPlank'))):
        o.append(f'<rect x="{lx}" y="{ly + 4 + i * 10}" width="12" height="7" fill="url(#{pat})" stroke="{INK}" stroke-width="0.3"/>')
        o.append(text(lx + 16, ly + 9.5 + i * 10, n_, 3.2, anchor='start'))

    # ---- districts
    L('districts')
    for name_, g, cx, cy in extra.get('districts', []):
        o.append(path(d_of(g), '#6c3483', 0.6, 'stroke-dasharray="6 2 1.5 2" stroke-linejoin="round"'))
        o.append(text(cx, cy, name_.upper(), 4.6, 'bold', '#6c3483', spacing=0.8))

    # ---- roofs: eaves outline, ridge and hip lines (hipped roofs, ridge along the long side)
    L('roofs')
    def roof(l, t, w, h):
        e = 1.2
        L_, T_, W_, H_ = l - e, t - e, w + 2 * e, h + 2 * e
        s_ = f'<rect x="{f(L_)}" y="{f(T_)}" width="{f(W_)}" height="{f(H_)}" fill="none" stroke="#7b241c" stroke-width="0.45"/>'
        if W_ >= H_:
            y_ = T_ + H_ / 2; a_ = L_ + H_ / 2; b_ = L_ + W_ - H_ / 2
            if b_ < a_: a_ = b_ = L_ + W_ / 2
            s_ += path(f'M{f(a_)} {f(y_)}H{f(b_)}M{f(L_)} {f(T_)}L{f(a_)} {f(y_)}L{f(L_)} {f(T_ + H_)}M{f(L_ + W_)} {f(T_)}L{f(b_)} {f(y_)}L{f(L_ + W_)} {f(T_ + H_)}', '#7b241c', 0.35)
        else:
            x_ = L_ + W_ / 2; a_ = T_ + W_ / 2; b_ = T_ + H_ - W_ / 2
            if b_ < a_: a_ = b_ = T_ + H_ / 2
            s_ += path(f'M{f(x_)} {f(a_)}V{f(b_)}M{f(L_)} {f(T_)}L{f(x_)} {f(a_)}L{f(L_ + W_)} {f(T_)}M{f(L_)} {f(T_ + H_)}L{f(x_)} {f(b_)}L{f(L_ + W_)} {f(T_ + H_)}', '#7b241c', 0.35)
        return s_
    for b in P.BUILDINGS:
        _, label, kind, cx, cy, w, h, side = b
        o.append(roof(cx - w / 2, cy - h / 2, w, h))
    for l, r, t, b in town_bldgs:
        o.append(roof(l, t, r - l, b - t))

    # ---- danger & encounter zones
    L('danger')
    for kind_, g, label, col in extra.get('danger', []):
        if kind_ == 'ring':
            x, y, r = g
            o.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{col}" fill-opacity="0.12" stroke="{col}" stroke-width="0.6" stroke-dasharray="3 1.5"/>')
            o.append(text(x, y - r - 2, label, 3.4, 'bold', col))
        else:
            o.append(f'<path d="{d_of(g)}" fill="{col}" fill-opacity="0.06" fill-rule="evenodd" stroke="{col}" stroke-width="0.6" stroke-dasharray="5 2"/>')
            lx_, ly_ = label[1]
            o.append(text(lx_, ly_, label[0], 5, 'bold', col, spacing=0.6))

    # ---- shallows & shipping lanes
    L('shipping')
    if extra.get('shallows') is not None:
        o.append('<defs><pattern id="pShallow" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 4L4 0" stroke="#5dade2" stroke-width="0.3"/></pattern></defs>')
        o.append(f'<path d="{d_of(extra["shallows"])}" fill="url(#pShallow)" fill-rule="evenodd" stroke="#5dade2" stroke-width="0.4"/>')
        o.append(text(-470, -300, 'SHALLOWS', 4, 'bold', '#2e86c1', spacing=1))
    for name_, pts in getattr(P, 'LANES', []):
        o.append(f'<polyline points="{" ".join(f"{x},{y}" for x, y in pts)}" fill="none" stroke="#1a5276" stroke-width="1.2" stroke-dasharray="6 3" stroke-linejoin="round"/>')
        for a, b in zip(pts, pts[1:]):
            mx, my = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
            ang = math.degrees(math.atan2(b[1] - a[1], b[0] - a[0]))
            o.append(f'<path d="M-2.4 -1.8L2.4 0L-2.4 1.8Z" fill="#1a5276" transform="translate({f(mx)},{f(my)}) rotate({f(ang)})"/>')
        o.append(text(pts[-1][0], pts[-1][1] + 7, name_.upper(), 3.6, 'bold', '#1a5276', spacing=0.5))

    # ---- discovery areas: fog over everything not known at the start, reveal points marked
    L('discovery')
    for name_, g, cx, cy, known in extra.get('districts_disc', []):
        if known:
            o.append(path(d_of(g), '#117a65', 0.6))
            o.append(text(cx, cy + 6, 'KNOWN FROM THE START', 3, 'bold', '#117a65'))
        else:
            o.append(f'<path d="{d_of(g)}" fill="#5d6d7e" fill-opacity="0.13" stroke="#5d6d7e" stroke-width="0.4" stroke-dasharray="2 2"/>')
            o.append(f'<circle cx="{cx}" cy="{cy}" r="14" fill="none" stroke="#5d6d7e" stroke-width="0.5" stroke-dasharray="1.5 1"/>')
            o.append(text(cx, cy + 1.6, '?', 6, 'bold', '#5d6d7e'))

    # ---- quest triggers: invisible circles that start something when Scally walks in
    L('triggers')
    for x, y, r, label in extra.get('triggers', []):
        o.append(f'<circle cx="{f(x)}" cy="{f(y)}" r="{r}" fill="#e67e22" fill-opacity="0.12" stroke="#ca6f1e" stroke-width="0.5" stroke-dasharray="2 1"/>')
        o.append(f'<circle cx="{f(x)}" cy="{f(y)}" r="0.9" fill="#ca6f1e"/>')
        o.append(text(x, y - r - 1.5, label, 2.8, 'bold', '#a04000'))

    # ---- gameplay overlays
    L('walkmap')
    if extra.get('solids') is not None:
        o.append(f'<path d="{d_of(extra["solids"])}" fill="#c0392b" fill-opacity="0.16" stroke="#c0392b" stroke-width="0.25" stroke-opacity="0.6"/>')
    L('routes')
    cols = ['#8e44ad', '#d35400', '#16a085', '#2c3e50', '#c0392b', '#2980b9']
    for i, r in enumerate(extra.get('routes', [])):
        pts = r + [r[0]]
        o.append(f'<polyline points="{" ".join(f"{x},{y}" for x, y in pts)}" fill="none" stroke="{cols[i % 6]}" stroke-width="0.7" stroke-dasharray="3 1.5" stroke-linejoin="round"/>')
        for a, b in zip(pts, pts[1:]):
            mx, my = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
            ang = math.degrees(math.atan2(b[1] - a[1], b[0] - a[0]))
            if math.hypot(b[0] - a[0], b[1] - a[1]) > 12:
                o.append(f'<path d="M-1.6 -1.3L1.6 0L-1.6 1.3Z" fill="{cols[i % 6]}" transform="translate({f(mx)},{f(my)}) rotate({f(ang)})"/>')
        o.append(f'<circle cx="{r[0][0]}" cy="{r[0][1]}" r="1.6" fill="{cols[i % 6]}"/>')
    L('lighting')
    for x, y in extra.get('lamps', []):
        o.append(f'<circle cx="{f(x)}" cy="{f(y)}" r="10" fill="#f5b041" fill-opacity="0.12" stroke="#d68910" stroke-width="0.3" stroke-dasharray="1.5 1"/>'
                 f'<circle cx="{f(x)}" cy="{f(y)}" r="1" fill="#d68910"/>')
    L('sound')
    for (l, t, r, b, label, op) in extra.get('sound', []):
        o.append(f'<rect x="{l}" y="{t}" width="{r - l}" height="{b - t}" fill="#2e86c1" fill-opacity="{op}" stroke="#2e86c1" stroke-width="0.4" stroke-dasharray="4 2"/>')
        o.append(text(l + 4, t + 8, label, 4, 'bold', '#1b4f72', anchor='start'))
    L('spawns')
    for x, y, label in extra.get('spawns', []):
        o.append(f'<circle cx="{x}" cy="{y}" r="4" fill="none" stroke="#117a65" stroke-width="0.6"/>'
                 f'<path d="M{x - 6} {y}h12M{x} {y - 6}v12" stroke="#117a65" stroke-width="0.4"/>')
        o.append(text(x + 6, y - 5, label, 3.2, 'bold', '#0e6251', anchor='start'))

    L('names')
    for b in P.BUILDINGS:
        bid, label, kind, cx, cy, w, h, side = b
        if label == 'Cottage': continue
        name = (names.get(bid) or label).upper()
        size = min(2.6, (w - 3) / (len(name) * 0.72))
        o.append(text(cx, cy + size * 0.4, name, round(size, 2), 'bold', spacing=0.1))
    prev = None
    for did, x, y in sorted(painted_doors, key=lambda d: (d[2], d[1])):
        lift = 7.2 if prev and abs(prev[1] - y) < 1 and x - prev[0] < 24 and prev[2] == 3.2 else 3.2
        o.append(text(x, y - lift, (names.get(did) or did).upper(), 2.0, 'bold', spacing=0.15))
        prev = (x, y, lift)
    L('places')
    for x, y, t, s_ in P.LABELS:
        if s_ == 'district': o.append(text(x, y, t.upper(), 8, 'bold', '#1f3b5c', spacing=1.6))
        else: o.append(text(x, y, t, 4.2, 'normal', INK, italic=True))

    L('titleblock')
    o.append(f'<g transform="translate(-570,-520)"><circle r="12" fill="none" stroke="{INK}" stroke-width="0.5"/>'
             f'<path d="M0 -10L4 6L0 3L-4 6Z" fill="{INK}"/>{text(0, -15, "N", 6, "bold")}</g>')
    tb = (420, 462, 190, 64)
    o.append(f'<rect x="{tb[0]}" y="{tb[1]}" width="{tb[2]}" height="{tb[3]}" fill="{PAPER}" stroke="{INK}" stroke-width="0.8"/>'
             f'<rect x="{tb[0] + 2}" y="{tb[1] + 2}" width="{tb[2] - 4}" height="{tb[3] - 4}" fill="none" stroke="{INK}" stroke-width="0.3"/>')
    o.append(text(tb[0] + 95, tb[1] + 16, 'TORTUGA COVE', 9, 'bold', spacing=2))
    o.append(text(tb[0] + 95, tb[1] + 26, 'SITE PLAN  ·  LAYOUT BLUEPRINT', 4, 'normal', spacing=1))
    sx, sy = tb[0] + 20, tb[1] + 42
    for i in range(4):
        o.append(f'<rect x="{sx + i * 25}" y="{sy}" width="25" height="3" fill="{INK if i % 2 == 0 else PAPER}" stroke="{INK}" stroke-width="0.3"/>')
        o.append(text(sx + i * 25, sy + 9, str(i * 25), 3))
    o.append(text(sx + 100, sy + 9, '100 units', 3, anchor='start'))
    o.append(text(tb[0] + 165, tb[1] + 52, 'grid 10 / 50', 3))
    return {k: '\n'.join(v) for k, v in layers.items()}

def svg_doc(body):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{X0} {Y0} {W} {H}" width="{W}" height="{H}">\n{body}\n</svg>'
