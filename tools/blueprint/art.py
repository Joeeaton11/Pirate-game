"""Art mode's base map, painted straight from the plan: colour fills, roofs, tree crowns and
shadows, no labels. Everything outside the land (and docks) is transparent so the game's sea shows
through. The painted town is drawn on top of this in the game."""
import random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from palette import PAL

X0, Y0, W, H = -620, -580, 1240, 1120

def hexc(h, a=255): return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5)) + (a,)
def shade(c, k): return tuple(max(0, min(255, int(v * k))) for v in c[:3]) + (c[3],)

ROOF = {'civic': '#8d7fae', 'shop': '#c98a3f', 'tavern': '#b5523a', 'warehouse': '#8a6c4c', 'market': '#c9a33f',
        'home': '#b4694a', 'fort': '#7c7c7c', 'manor': '#9a5f93', 'ruin': '#7b7163', 'landmark': '#d8d2c2',
        'shed': '#8f7353', 'mill': '#b78d4a', 'town': '#a8583c'}

def draw(path, coast, beach, zones, water, P, bldgs, trees, bridges, docks, breakwater, sea_zones, ss=4, out_scale=4):
    S = ss
    im = Image.new('RGBA', (W * S, H * S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    T = lambda x, y: ((x - X0) * S, (y - Y0) * S)
    def poly(g, col, outline=None, width=1):
        gs = [g] if g.geom_type == 'Polygon' else list(getattr(g, 'geoms', []))
        for p in gs:
            if p.geom_type != 'Polygon' or p.is_empty: continue
            d.polygon([T(*c) for c in p.exterior.coords], fill=col, outline=outline, width=width)
            for h in p.interiors: d.polygon([T(*c) for c in h.coords], fill=(0, 0, 0, 0))
    # shallows rings and reefs
    poly(coast.buffer(22), (120, 200, 210, 70)); poly(coast.buffer(10), (150, 215, 215, 110))
    for t, g in sea_zones: poly(g, hexc(PAL[t], 150))
    poly(coast.buffer(2.5), hexc('#d9c48a'))
    import ground, math as _m
    gp = ground.Painter(im, T, S)
    gp.grass(coast)
    gp.sand(beach, water_edge=coast.boundary)
    for t, g in zones:
        if t in ('jungle', 'forest', 'swamp', 'palms'): gp.woodland(g, PAL[t])
        elif t == 'rock': gp.fill(gp.mask([g]), PAL['rock'], 0.1, (6, 2))
        elif t in ('fields', 'sugarcane'): gp.fill(gp.mask([g]), PAL[t], 0.05, (10, 3))
        else: gp.grass(g, PAL.get(t, PAL['grass']))
    # furrows in the fields
    for t, g in zones:
        if t not in ('fields', 'sugarcane', 'allotment'): continue
        l, tp, r, b = g.bounds
        step = 4 if t == 'fields' else 3
        for y in range(int(tp), int(b), step):
            from shapely.geometry import LineString
            ln = LineString([(l, y), (r, y)]).intersection(g)
            for seg in getattr(ln, 'geoms', [ln]):
                if seg.is_empty or seg.geom_type != 'LineString': continue
                d.line([T(*c) for c in seg.coords], fill=shade(hexc(PAL[t]), 0.78), width=S)
                d.line([(T(*c)[0], T(*c)[1] - S) for c in seg.coords], fill=shade(hexc(PAL[t]), 1.12), width=max(1, S // 2))
    gp.water(water)
    order = {'path': 0, 'lane': 1, 'main': 2}
    for name, k, w, pts in sorted(P.ROADS, key=lambda r: order.get(r[1], 0)):
        if k == 'secret': continue
        gp.road(pts, w, k)
    for _, l, r, t, b in P.PLAZAS: gp.flagstones(l, t, r, b)
    if bridges is not None and not bridges.is_empty:
        from shapely.geometry import LineString
        for bg in getattr(bridges, 'geoms', [bridges]):
            ang = 0
            for name, k, w, pts in P.ROADS:
                for p, q in zip(pts, pts[1:]):
                    if LineString([p, q]).intersects(bg): ang = _m.atan2(q[1] - p[1], q[0] - p[0])
            gp.planks(bg.buffer(0.6), ang, '#8a5a32')
    for name, kind_, w, g in docks:
        pts = [pt for nm, kk, ww, pp in P.DOCKS if nm == name for pt in pp]
        ang = _m.atan2(pts[-1][1] - pts[0][1], pts[-1][0] - pts[0][0]) if len(pts) > 1 else 0
        gp.planks(g, ang)
    if breakwater is not None:
        m_ = gp.mask([breakwater]); gp.fill(m_, '#8d877a', 0.08, (5, 2)); gp.cobbles(breakwater, m_, 1.8)
    # ---- pixel-art objects: flat contact shadows, then trees and props back to front
    import sys as _sys, os as _os
    _sys.path.insert(0, _os.path.join(_os.path.dirname(__file__), '..', 'art'))
    import pixel_props as pp, pixel_houses as ph
    sh = Image.new('RGBA', im.size, (0, 0, 0, 0)); sd = ImageDraw.Draw(sh)
    for x, y, k in trees:
        r = {'jungle': 4, 'tree': 5, 'palm': 3, 'rock': 3.5, 'mangrove': 3.5}[k] * S
        cx, cy = T(x + 1.2, y + 1.0); sd.ellipse([cx - r, cy - r * 0.5, cx + r, cy + r * 0.5], fill=(20, 30, 10, 70))
    im.alpha_composite(sh)
    items = [(y, 't', x, k) for x, y, k in trees]
    skip = {'falls', 'spring', 'cave', 'lookout', 'x_mark', 'bottle', 'bollard', 'grave_marker', 'tavern_sign', 'shop_sign', 'parrot_perch',
            'plank', 'hammock', 'rope_coil', 'ship_wheel', 'spyglass', 'cannonballs', 'trough', 'figurehead', 'cane_press', 'hull', 'lobster_pot'}
    items += [(y, 'p', x, k) for k, x, y in P.PROPS if k not in skip]
    items.sort()
    for i, (y, t, x, k) in enumerate(items):
        got = pp.get(S, k, int(abs(x * 7 + y * 3)) % 4) if t == 't' else pp.get(S, k, 0)
        if not got: continue
        spr, anc = got
        pp.stamp(im, spr, anc, *T(x, y))
    d = ImageDraw.Draw(im)
    for b in bldgs:  # anything without a building sprite yet: a simple roof block
        l, t, r, bt, kind = b
        col = hexc(ROOF.get(kind, ROOF['home']))
        d.rectangle([T(l, t), T(r, bt)], fill=col, outline=hexc('#2a1c12'), width=S)
    # ---- pixel finish: snap every colour to the house palette, hard alpha edges on land
    a = np.asarray(im.getchannel('A'))
    rgb = Image.new('RGB', im.size, (0, 0, 0)); rgb.paste(im, (0, 0), im)
    q = rgb.quantize(palette=ph.palette(), dither=Image.Dither.NONE).convert('RGB')
    q.putalpha(Image.fromarray(a))
    q.save(path)
