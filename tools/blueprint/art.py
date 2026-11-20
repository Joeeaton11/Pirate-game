"""Art mode's base map, painted straight from the plan: colour fills, roofs, tree crowns and
shadows, no labels. Everything outside the land (and docks) is transparent so the game's sea shows
through. The painted town is drawn on top of this in the game."""
import random
from PIL import Image, ImageDraw, ImageFilter
from palette import PAL

X0, Y0, W, H = -620, -580, 1240, 1120

def hexc(h, a=255): return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5)) + (a,)
def shade(c, k): return tuple(max(0, min(255, int(v * k))) for v in c[:3]) + (c[3],)

ROOF = {'civic': '#8d7fae', 'shop': '#c98a3f', 'tavern': '#b5523a', 'warehouse': '#8a6c4c', 'market': '#c9a33f',
        'home': '#b4694a', 'fort': '#7c7c7c', 'manor': '#9a5f93', 'ruin': '#7b7163', 'landmark': '#d8d2c2',
        'shed': '#8f7353', 'mill': '#b78d4a', 'town': '#a8583c'}

def draw(path, coast, beach, zones, water, P, bldgs, trees, bridges, docks, breakwater, sea_zones, ss=4, out_scale=2):
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
    poly(coast, hexc(PAL['grass'])); poly(beach, hexc(PAL['beach']))
    for t, g in zones: poly(g, hexc(PAL.get(t, PAL['grass'])))
    # furrows in the fields
    for t, g in zones:
        if t not in ('fields', 'sugarcane'): continue
        l, tp, r, b = g.bounds
        for y in range(int(tp), int(b), 4):
            from shapely.geometry import LineString
            ln = LineString([(l, y), (r, y)]).intersection(g)
            for seg in getattr(ln, 'geoms', [ln]):
                if seg.is_empty or seg.geom_type != 'LineString': continue
                d.line([T(*c) for c in seg.coords], fill=shade(hexc(PAL[t]), 0.82), width=S)
    poly(water.buffer(1.2), hexc('#3b7f9e')); poly(water, hexc(PAL['water']))
    for name, k, w, pts in P.ROADS:
        if k == 'secret': continue
        d.line([T(*p) for p in pts], fill=hexc('#8f6f4c'), width=int((w + 1.4) * S), joint='curve')
    for name, k, w, pts in P.ROADS:
        if k == 'secret': continue
        d.line([T(*p) for p in pts], fill=hexc(PAL[k]), width=int(w * S), joint='curve')
    for _, l, r, t, b in P.PLAZAS:
        d.rectangle([T(l, t), T(r, b)], fill=hexc(PAL['plaza']), outline=hexc('#8f6f4c'), width=S)
        for x in range(int(l) + 3, int(r), 4):
            for y in range(int(t) + 3, int(b), 4): d.point(T(x, y), fill=hexc('#b9aa88'))
    if bridges is not None: poly(bridges, hexc(PAL['bridge']))
    for *_, g in docks: poly(g, hexc(PAL['wood']), outline=hexc('#5e4128'), width=S)
    if breakwater is not None: poly(breakwater, hexc('#8d877a'), outline=hexc('#5c574d'), width=S)
    # shadows (south-east), then trees, then buildings
    sh = Image.new('RGBA', im.size, (0, 0, 0, 0)); sd = ImageDraw.Draw(sh)
    for x, y, k in trees:
        r = {'jungle': 4, 'tree': 5, 'palm': 3.5, 'rock': 4, 'mangrove': 3.5}[k] * S
        cx, cy = T(x + 1.5, y + 1.5); sd.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(20, 30, 10, 90))
    for b in bldgs:
        l, t, r, bt = b[:4]
        sd.rectangle([T(l + 1.8, t + 1.8), T(r + 1.8, bt + 1.8)], fill=(20, 20, 10, 100))
    im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(S)))
    d = ImageDraw.Draw(im)
    rng = random.Random(7)
    for x, y, k in trees:
        r = {'jungle': 4, 'tree': 5, 'palm': 3.5, 'rock': 4, 'mangrove': 3.5}[k] * S
        base = shade(hexc(PAL['t_' + k]), rng.uniform(0.9, 1.1))
        cx, cy = T(x, y)
        if k == 'palm':
            for a in range(6):
                import math
                ang = a * math.pi / 3 + rng.random()
                d.line([cx, cy, cx + math.cos(ang) * r * 1.3, cy + math.sin(ang) * r * 1.3], fill=base, width=int(S * 1.4))
            d.ellipse([cx - S, cy - S, cx + S, cy + S], fill=hexc('#7a5a33'))
            continue
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=base)
        if k != 'rock':
            hr = r * 0.55; d.ellipse([cx - r * 0.55 - hr * 0.3, cy - r * 0.55 - hr * 0.3, cx - r * 0.55 + hr, cy - r * 0.55 + hr], fill=shade(base, 1.18))
    for b in bldgs:
        l, t, r, bt, kind = b
        col = hexc(ROOF.get(kind, ROOF['home']))
        d.rectangle([T(l, t), T(r, bt)], fill=col, outline=shade(col, 0.55), width=S)
        if r - l >= bt - t:   # ridge runs east-west: north slope lit, south slope dark
            m = (t + bt) / 2; d.rectangle([T(l + 0.4, m), T(r - 0.4, bt - 0.4)], fill=shade(col, 0.8))
            d.line([T(l, m), T(r, m)], fill=shade(col, 1.2), width=S)
        else:
            m = (l + r) / 2; d.rectangle([T(m, t + 0.4), T(r - 0.4, bt - 0.4)], fill=shade(col, 0.8))
            d.line([T(m, t), T(m, bt)], fill=shade(col, 1.2), width=S)
    for k, x, y in P.PROPS:
        cx, cy = T(x, y)
        if k == 'skull_rock':
            d.ellipse([cx - 14 * S, cy - 12 * S, cx + 14 * S, cy + 8 * S], fill=hexc('#cfc8b8'), outline=hexc('#6d665a'), width=S)
            d.rectangle([cx - 8 * S, cy + 4 * S, cx + 8 * S, cy + 12 * S], fill=hexc('#cfc8b8'), outline=hexc('#6d665a'), width=S)
            for ex in (-5, 5): d.ellipse([cx + (ex - 3.4) * S, cy - 4 * S, cx + (ex + 3.4) * S, cy + 2 * S], fill=hexc('#2b2620'))
            d.polygon([(cx, cy + 2 * S), (cx - 1.5 * S, cy + 5 * S), (cx + 1.5 * S, cy + 5 * S)], fill=hexc('#2b2620'))
            continue
        if k == 'careened_ship':
            d.chord([cx - 16 * S, cy - 8 * S, cx + 16 * S, cy + 10 * S], 180, 360, fill=hexc('#7a5230'), outline=hexc('#4a3018'), width=S)
            d.line([cx - 4 * S, cy - 2 * S, cx - 14 * S, cy - 12 * S], fill=hexc('#4a3018'), width=S); continue
        if k in ('whale_bones', 'kraken_bones'):
            for i in range(6): d.arc([cx + (-12 + i * 4) * S, cy - 7 * S, cx + (-8 + i * 4) * S, cy + 7 * S], 270, 90, fill=hexc('#efe9dc'), width=S)
            d.line([cx - 14 * S, cy, cx + 14 * S, cy], fill=hexc('#efe9dc'), width=S); continue
        if k == 'jolly_roger':
            d.line([cx, cy + 3 * S, cx, cy - 6 * S], fill=hexc('#4a3018'), width=S)
            d.rectangle([cx, cy - 6 * S, cx + 5 * S, cy - 2.6 * S], fill=hexc('#1b1b1b')); d.ellipse([cx + 1.8 * S, cy - 5.3 * S, cx + 3.2 * S, cy - 3.9 * S], fill=hexc('#ffffff')); continue
        if k == 'buoy': d.ellipse([cx - 1.4 * S, cy - 1.4 * S, cx + 1.4 * S, cy + 1.4 * S], fill=hexc('#e74c3c')); continue
        if k == 'wreck_mast': d.line([cx, cy + 3 * S, cx + 2 * S, cy - 6 * S], fill=hexc('#4a3018'), width=S); continue
        if k in ('treasure_pile', 'sea_chest'): d.ellipse([cx - 2 * S, cy - 1.4 * S, cx + 2 * S, cy + 1.4 * S], fill=hexc('#e8c547')); continue
        if k in ('signpost', 'lamp', 'bollard', 'grave', 'cave', 'x_mark', 'bottle', 'notice'): continue
        r = 1.6 * S
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=hexc('#6b4d2e'))
    im = im.resize((W * out_scale, H * out_scale), Image.LANCZOS)
    im.save(path)
