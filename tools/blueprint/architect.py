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

def make_svg(P, coast, zone_geoms, sea_zones, water, bridges, trees, pois, town_rects, town_bldgs, painted_doors,
             names, door_point, town_box, docks=(), breakwater=None):
    P_ref[0] = P
    o = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{X0} {Y0} {W} {H}" width="{W}" height="{H}">',
         f'<rect x="{X0}" y="{Y0}" width="{W}" height="{H}" fill="{PAPER}"/>']
    # Drafting grid: 10-unit minor, 50-unit major.
    minor = ''.join(f'M{x} {Y0}V{Y0 + H}' for x in range(-620, 621, 10) if x % 50) + ''.join(f'M{X0} {y}H{X0 + W}' for y in range(Y0, Y0 + H + 1, 10) if y % 50)
    major = ''.join(f'M{x} {Y0}V{Y0 + H}' for x in range(-600, 601, 50)) + ''.join(f'M{X0} {y}H{X0 + W}' for y in range(-550, 541, 50))
    o.append(path(minor, GRID, 0.15, 'opacity="0.35"')); o.append(path(major, GRID, 0.3, 'opacity="0.6"'))
    # Sea: chart-style offset lines outside the coast, reef stippled.
    for dist, w, op in ((5, 0.35, 0.7), (11, 0.3, 0.45), (18, 0.25, 0.25)):
        o.append(path(outline_d(coast.buffer(dist, join_style=1), drop=town_box), BLUE, w, f'opacity="{op}"'))
    for t, g in sea_zones:
        o.append(path(d_of(g), BLUE, 0.5, 'stroke-dasharray="1 1.6"'))
    # Breakwater: a rubble arm, stippled between two broken lines.
    if breakwater is not None:
        o.append(f'<path d="{d_of(breakwater)}" fill="{PAPER}" stroke="{INK}" stroke-width="0.5" stroke-dasharray="2 1"/>')
        import random as _r
        rg = _r.Random(3); minx, miny, maxx, maxy = breakwater.bounds; dots = []
        while len(dots) < 260:
            x, y = rg.uniform(minx, maxx), rg.uniform(miny, maxy)
            if breakwater.buffer(-1).contains(Point(x, y)): dots.append(f'M{f(x)} {f(y)}h0.6')
        o.append(path(''.join(dots), INK, 0.6, 'stroke-linecap="round"'))
    # Coast, and the beach line inside it.
    o.append(path(outline_d(coast, drop=town_box), INK, 1.4, 'stroke-linejoin="round"'))
    o.append(path(d_of(coast.buffer(-14).difference(town_box)), INK, 0.3, 'stroke-dasharray="2 2" opacity="0.7"'))
    # Zones.
    for t, g in zone_geoms:
        if t in ('jungle', 'forest', 'palms', 'swamp', 'garden'):
            o.append(path(d_of(g), GREEN, 0.5, 'stroke-dasharray="4 2"'))
            if t == 'swamp': o.append(path(hatch(g, 7, 0), GREEN, 0.25, 'stroke-dasharray="1.5 2.5" opacity="0.8"'))
        elif t in ('fields', 'sugarcane'):
            o.append(path(d_of(g), INK, 0.5))
            o.append(path(hatch(g, 4 if t == 'fields' else 3, 0 if t == 'fields' else 70), GREEN, 0.25))
        elif t == 'rock':
            o.append(path(d_of(g), INK, 0.45, 'stroke-dasharray="1 1.5"'))
        elif t == 'graveyard':
            o.append(path(d_of(g), INK, 0.5))
    # Inland water: double bank line.
    o.append(path(d_of(water), BLUE, 0.7))
    o.append(path(d_of(water.buffer(-1.6)), BLUE, 0.3))
    # Roads: inked casing, plazas, then the paper carriageway over it (clean junctions).
    for _, k, w, pts in P.ROADS:
        pl = ' '.join(f'{x},{y}' for x, y in pts)
        dash = ' stroke-dasharray="2.5 1.5"' if k == 'path' else ''
        o.append(f'<polyline points="{pl}" fill="none" stroke="{INK}" stroke-width="{w + 0.8}" stroke-linecap="round" stroke-linejoin="round"{dash}/>')
    for n, l, r, t, b in P.PLAZAS:
        o.append(f'<rect x="{l}" y="{t}" width="{r - l}" height="{b - t}" fill="{PAPER}" stroke="{INK}" stroke-width="0.5"/>')
    for _, k, w, pts in P.ROADS:
        pl = ' '.join(f'{x},{y}' for x, y in pts)
        o.append(f'<polyline points="{pl}" fill="none" stroke="{PAPER}" stroke-width="{w - 0.2}" stroke-linecap="round" stroke-linejoin="round"/>')
    # Bridges: rails and planks.
    if not bridges.is_empty:
        o.append(f'<path d="{d_of(bridges)}" fill="{PAPER}" stroke="{INK}" stroke-width="0.6"/>')
        for g in (bridges.geoms if hasattr(bridges, 'geoms') else [bridges]):
            mrr = g.minimum_rotated_rectangle
            import math
            c = list(mrr.exterior.coords)
            e1 = (c[1][0] - c[0][0], c[1][1] - c[0][1]); e2 = (c[2][0] - c[1][0], c[2][1] - c[1][1])
            long_e = e1 if math.hypot(*e1) > math.hypot(*e2) else e2
            ang = math.degrees(math.atan2(long_e[1], long_e[0])) + 90
            o.append(path(hatch(g.buffer(-0.4), 1.6, ang), INK, 0.2))
    # The painted town as a plan: outlines of water, planting, piers/wharf and buildings.
    def urects(rs, simp=0.5, min_area=0, smooth=0):
        u = unary_union([box(l, t, r, b) for l, r, t, b in rs])
        if smooth: u = u.buffer(smooth, join_style=1).buffer(-smooth, join_style=1)
        if min_area:
            u = unary_union([p for p in (u.geoms if hasattr(u, 'geoms') else [u]) if p.area >= min_area])
        return u.simplify(simp)
    inside = town_box.buffer(-0.8)
    # In the town the harbour's own water edge is the coastline, drawn as heavily as the coast.
    o.append(path(outline_d(urects(town_rects['water'], 0.9, 30, 1.5), keep=inside), INK, 1.2, 'stroke-linejoin="round"'))
    o.append(path(outline_d(urects(town_rects['water'], 0.9, 30, 1.5).buffer(5, join_style=1), keep=inside), BLUE, 0.35, 'opacity="0.7"'))
    o.append(path(outline_d(urects(town_rects['garden'], 1.0, 25, 1.5), keep=inside), GREEN, 0.35, 'stroke-dasharray="3 1.5"'))
    o.append(path(outline_d(urects(town_rects['wood'], 0.4), keep=inside), INK, 0.6))
    o.append(path(outline_d(urects(town_rects['sand'], 0.8, 20, 1.5), keep=inside), INK, 0.3, 'stroke-dasharray="2 2"'))
    # Docks: deck outline, planks across, piles along the edges; slipway ramps hatched lengthways.
    for n, k, w, g in docks:
        o.append(f'<path d="{d_of(g)}" fill="{PAPER}" stroke="{INK}" stroke-width="0.7"/>')
        c = list(g.minimum_rotated_rectangle.exterior.coords)
        import math
        e1 = (c[1][0] - c[0][0], c[1][1] - c[0][1]); e2 = (c[2][0] - c[1][0], c[2][1] - c[1][1])
        le = e1 if math.hypot(*e1) > math.hypot(*e2) else e2
        ang = math.degrees(math.atan2(le[1], le[0]))
        o.append(path(hatch(g.buffer(-0.5), 1.8 if k != 'slip' else 1.4, ang + (0 if k == 'slip' else 90)), INK, 0.18))
        if k != 'slip':
            edge = g.exterior; L = edge.length; piles = []
            t = 0
            while t < L:
                p = edge.interpolate(t); piles.append(f'M{f(p.x - 0.7)} {f(p.y - 0.7)}h1.4v1.4h-1.4Z'); t += 8
            o.append(f'<path d="{"".join(piles)}" fill="{INK}"/>')
    for x, y, hdg in getattr(P_ref[0], 'MOORED', []):
        o.append(f'<g transform="translate({x},{y}) rotate({hdg})"><path d="M-7 0Q-4 -2.6 3 -2.4L7 0L3 2.4Q-4 2.6 -7 0Z" fill="{PAPER}" stroke="{INK}" stroke-width="0.45"/>'
                 f'<path d="M-4 0H4" stroke="{INK}" stroke-width="0.2"/></g>')
    # Trees (canopy circles) and rocks.
    TR = {'jungle': 4, 'tree': 5, 'palm': 3.2, 'rock': 3.6, 'mangrove': 3.4}
    for kind in TR:
        r = TR[kind]
        d = ''.join(f'M{f(x - r)} {f(y)}a{r} {r} 0 1 0 {2 * r} 0a{r} {r} 0 1 0 {-2 * r} 0' for x, y, k in trees if k == kind)
        if kind == 'rock': o.append(path(d, INK, 0.35, 'stroke-dasharray="0.8 0.8"'))
        else: o.append(path(d, GREEN, 0.35))
        if kind == 'palm':  # palm fronds: a small cross
            o.append(path(''.join(f'M{f(x - 2)} {f(y)}h4M{f(x)} {f(y - 2)}v4' for x, y, k in trees if k == kind), GREEN, 0.25))
    # Buildings: wall outline, inner wall line, door gap with a door leaf.
    def building(l, t, w, h, door, thick=True):
        s = f'<rect x="{f(l)}" y="{f(t)}" width="{f(w)}" height="{f(h)}" fill="{PAPER}" stroke="{INK}" stroke-width="0.8"/>'
        if thick and w > 4 and h > 4:
            s += f'<rect x="{f(l + 1)}" y="{f(t + 1)}" width="{f(w - 2)}" height="{f(h - 2)}" fill="none" stroke="{INK}" stroke-width="0.25"/>'
        if door:
            x, y = door; dw = 4.5
            if abs(y - t) < 0.6 or abs(y - (t + h)) < 0.6:
                s += f'<path d="M{f(x - dw / 2)} {f(y)}h{dw}" stroke="{PAPER}" stroke-width="1.6"/>'
                sy = -1 if abs(y - (t + h)) < 0.6 else 1
                s += f'<path d="M{f(x - dw / 2)} {f(y)}l0 {f(sy * dw)}" stroke="{INK}" stroke-width="0.35"/>'
                s += f'<path d="M{f(x - dw / 2)} {f(y + sy * dw)}A{dw} {dw} 0 0 {1 if sy < 0 else 0} {f(x + dw / 2)} {f(y)}" fill="none" stroke="{INK}" stroke-width="0.2"/>'
            else:
                s += f'<path d="M{f(x)} {f(y - dw / 2)}v{dw}" stroke="{PAPER}" stroke-width="1.6"/>'
                sx = -1 if abs(x - (l + w)) < 0.6 else 1
                s += f'<path d="M{f(x)} {f(y - dw / 2)}l{f(sx * dw)} 0" stroke="{INK}" stroke-width="0.35"/>'
                s += f'<path d="M{f(x + sx * dw)} {f(y - dw / 2)}A{dw} {dw} 0 0 {0 if sx < 0 else 1} {f(x)} {f(y + dw / 2)}" fill="none" stroke="{INK}" stroke-width="0.2"/>'
        return s
    for b in P.BUILDINGS:
        _, label, kind, cx, cy, w, h, side = b
        o.append(building(cx - w / 2, cy - h / 2, w, h, door_point(b)))
    for l, r, t, b in town_bldgs:
        ds = [(x, y) for _, x, y in painted_doors if l - 1 <= x <= r + 1 and abs(y - b) < 8]
        o.append(building(l, t, r - l, b - t, None))
        for x, _ in ds:
            o.append(f'<path d="M{f(x - 2.2)} {f(b)}h4.4" stroke="{PAPER}" stroke-width="1.6"/>'
                     f'<path d="M{f(x - 2.2)} {f(b)}l0 -4.4" stroke="{INK}" stroke-width="0.35"/>'
                     f'<path d="M{f(x - 2.2)} {f(b - 4.4)}A4.4 4.4 0 0 1 {f(x + 2.2)} {f(b)}" fill="none" stroke="{INK}" stroke-width="0.2"/>')
    # Props as small drafting symbols.
    for k, x, y in P.PROPS:
        if k in ('well',): o.append(f'<circle cx="{x}" cy="{y}" r="2.2" fill="none" stroke="{INK}" stroke-width="0.35"/><circle cx="{x}" cy="{y}" r="1.2" fill="none" stroke="{BLUE}" stroke-width="0.3"/>')
        elif k in ('crates', 'cart', 'bench'): o.append(f'<rect x="{x - 1.6}" y="{y - 1.6}" width="3.2" height="3.2" fill="none" stroke="{INK}" stroke-width="0.3"/>')
        elif k == 'grave': o.append(path(f'M{x} {y - 2}v4M{x - 1.2} {y - 0.8}h2.4', INK, 0.35))
        elif k == 'signpost': o.append(path(f'M{x} {y + 2}v-4M{x - 2} {y - 2}h4', INK, 0.4))
        elif k == 'boat': o.append(f'<ellipse cx="{x}" cy="{y}" rx="3.5" ry="1.4" fill="none" stroke="{INK}" stroke-width="0.35"/>')
        elif k == 'cannon': o.append(path(f'M{x - 2} {y}h4', INK, 0.9))
        elif k == 'cave': o.append(f'<path d="M{x - 3} {y + 1.5}A3 3 0 0 1 {x + 3} {y + 1.5}" fill="none" stroke="{INK}" stroke-width="0.5"/>')
        else: o.append(f'<circle cx="{x}" cy="{y}" r="1.2" fill="none" stroke="{INK}" stroke-width="0.35"/>')
    # Points of interest.
    for k, pid, x, y in pois:
        c = POI_COL[k]
        if k == 'quest': o.append(f'<circle cx="{f(x)}" cy="{f(y)}" r="3" fill="none" stroke="{c}" stroke-width="0.7"/><circle cx="{f(x)}" cy="{f(y)}" r="0.9" fill="{c}"/>')
        else: o.append(f'<path d="M{f(x)} {f(y - 3.6)}L{f(x + 3.6)} {f(y)}L{f(x)} {f(y + 3.6)}L{f(x - 3.6)} {f(y)}Z" fill="none" stroke="{c}" stroke-width="0.7"/>')
    # Names.
    for b in P.BUILDINGS:
        bid, label, kind, cx, cy, w, h, side = b
        if label == 'Cottage': continue
        name = (names.get(bid) or label).upper()
        size = min(2.6, (w - 3) / (len(name) * 0.72))  # fit inside the footprint
        o.append(text(cx, cy + size * 0.4, name, round(size, 2), 'bold', spacing=0.1))
    # Terraces hold several businesses: stagger neighbouring names so they don't run together.
    prev = None
    for i, (did, x, y) in enumerate(sorted(painted_doors, key=lambda d: (d[2], d[1]))):
        lift = 7.2 if prev and abs(prev[1] - y) < 1 and x - prev[0] < 24 and prev[2] == 3.2 else 3.2
        o.append(text(x, y - lift, (names.get(did) or did).upper(), 2.0, 'bold', spacing=0.15))
        prev = (x, y, lift)
    for x, y, t, s in P.LABELS:
        if s == 'district': o.append(text(x, y, t.upper(), 8, 'bold', '#1f3b5c', spacing=1.6))
        else: o.append(text(x, y, t, 4.2, 'normal', INK, italic=True))
    # North arrow, scale bar and title block (bottom right, over the sea).
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
    o.append('</svg>')
    return '\n'.join(s for s in o if s)
