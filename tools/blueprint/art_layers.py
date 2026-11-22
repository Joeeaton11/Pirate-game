"""Tortuga's Art map, painted from the plan one layer at a time, aimed at the target style
(docs/style/target_style.png): turquoise sea with foam and submerged rocks, dark jagged coastal
rocks, lush grass full of flowering bushes and palms, grey cobbles, heavy timber docks on pilings,
red-roofed buildings (drawn separately as sprites).

Each layer is painted on its own transparent canvas, saved to tools/blueprint/art_layers/ for
review, then stacked into the map base. Layer order (bottom to top):
  01 sea · 02 terrain · 03 rivers · 04 roads · 05 walls · 06 docks · 07 cliffs · 08 plants · 09 props
"""
import math, os, random, re, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageChops
from shapely.geometry import LineString, Point, Polygon
from scipy.ndimage import distance_transform_edt, binary_dilation

HERE = os.path.dirname(__file__)
sys.path.insert(0, os.path.join(HERE, '..', 'art'))
import ground
import pixel_props as pp
import pixel_houses as ph

X0, Y0, W, H = -620, -580, 1240, 1120
S = 4  # pixels per world unit
GAME_SEA = (18, 77, 115)


def hexrgb(h): return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


def new_layer():
    im = Image.new('RGBA', (W * S, H * S), (0, 0, 0, 0))
    T = lambda x, y: ((x - X0) * S, (y - Y0) * S)
    return im, T


def lowres_mask(geoms, scale=1):
    m = Image.new('L', (W * scale, H * scale), 0); d = ImageDraw.Draw(m)
    for g in geoms:
        for p in ([g] if g.geom_type == 'Polygon' else list(getattr(g, 'geoms', []))):
            if p.geom_type != 'Polygon' or p.is_empty: continue
            d.polygon([((x - X0) * scale, (y - Y0) * scale) for x, y in p.exterior.coords], fill=255)
            for h in p.interiors: d.polygon([((x - X0) * scale, (y - Y0) * scale) for x, y in h.coords], fill=0)
    return np.asarray(m) > 0


def up(arr):
    """Upscale a 1-px-per-unit float field to the layer size."""
    im = Image.fromarray(arr.astype(np.float32), 'F').resize((W * S, H * S), Image.BILINEAR)
    return np.asarray(im)


# ---------------------------------------------------------------- 01 sea
def sea(coast, town_water=None):
    rng = random.Random(1); nrng = np.random.default_rng(1)
    land = lowres_mask([coast.difference(town_water) if town_water is not None else coast])
    dist = distance_transform_edt(~land)  # units from shore
    yy, xx = np.mgrid[0:H, 0:W]
    edge = np.minimum.reduce([xx, W - 1 - xx, yy, H - 1 - yy]).astype(np.float32)
    D = up(dist); E = up(edge)
    stops = [(0, hexrgb('#7fe3d6')), (3, hexrgb('#3cc9cc')), (9, hexrgb('#16a9c2')), (22, hexrgb('#0b88ad')),
             (45, hexrgb('#08698f')), (80, hexrgb('#0a587d'))]
    rgb = np.zeros(D.shape + (3,), np.float32)
    for (d0, c0), (d1, c1) in zip(stops, stops[1:]):
        t = np.clip((D - d0) / (d1 - d0), 0, 1)[..., None]
        sel = ((D >= d0) & (D < d1))[..., None]
        rgb = np.where(sel, np.array(c0) + (np.array(c1) - np.array(c0)) * t, rgb)
    rgb = np.where((D >= stops[-1][0])[..., None], np.array(stops[-1][1], np.float32), rgb)
    # fade into the game's own sea at the edge of the map region
    f = np.clip((E - 6) / 40, 0, 1)[..., None]
    rgb = rgb * f + np.array(GAME_SEA, np.float32) * (1 - f)
    # soft mottling
    n = np.asarray(Image.fromarray((nrng.random((H // 6, W // 6)) * 255).astype(np.uint8)).resize((W * S, H * S), Image.BICUBIC)).astype(np.float32) / 255
    rgb *= (0.95 + 0.1 * n)[..., None]
    im = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8), 'RGB').convert('RGBA')
    d = ImageDraw.Draw(im)
    # submerged rocks in the shallows
    pts = np.argwhere((dist > 3) & (dist < 22))
    for _ in range(420):  # submerged rock clusters: lumpy, lit on top, darker underwater skirt
        y, x = pts[rng.randrange(len(pts))]
        X, Y = x * S, y * S
        deep = dist[y, x] > 10
        for k in range(rng.randint(2, 5)):
            bx, by, r = X + rng.uniform(-3, 3) * S, Y + rng.uniform(-2, 2) * S, rng.uniform(1.2, 3.2) * S
            poly = [(bx + math.cos(a) * r * rng.uniform(0.7, 1.1), by + math.sin(a) * r * 0.75 * rng.uniform(0.7, 1.1)) for a in np.linspace(0, 6.28, 9)[:-1]]
            d.polygon([(px_ + 2, py_ + 3) for px_, py_ in poly], fill=(6, 74, 96, 255) if deep else (14, 112, 128, 255))
            d.polygon(poly, fill=(18, 96, 112, 255) if deep else (34, 138, 146, 255))
            d.polygon([(px_ * 0.6 + bx * 0.4 - r * 0.15, py_ * 0.6 + by * 0.4 - r * 0.2) for px_, py_ in poly], fill=(40, 124, 134, 255) if deep else (70, 176, 176, 255))
    # sandbars: pale shoals just offshore, showing through the shallows
    sb = np.argwhere((dist > 9) & (dist < 16))
    sand = Image.new('RGBA', im.size, (0, 0, 0, 0)); sdr = ImageDraw.Draw(sand)
    for _ in range(14):
        y, x = sb[rng.randrange(len(sb))]
        X, Y = x * S, y * S; rx, ry = rng.uniform(10, 22) * S, rng.uniform(2.5, 4.5) * S
        sdr.ellipse([X - rx, Y - ry, X + rx, Y + ry], fill=(206, 214, 170, 120))
        sdr.ellipse([X - rx * 0.7, Y - ry * 0.6, X + rx * 0.6, Y + ry * 0.4], fill=(226, 226, 184, 150))
    im.alpha_composite(sand); d = ImageDraw.Draw(im)
    # wave glints: short light dashes, thicker near the shore
    for _ in range(26000):  # darker ripples all over the open water
        x, y = rng.randrange(W), rng.randrange(H)
        if dist[y, x] < 4: continue
        X, Y = x * S + rng.randrange(S), y * S + rng.randrange(S)
        c = im.getpixel((X, Y)); d.line([X, Y, X + rng.randint(2, 5), Y], fill=(int(c[0] * 0.8), int(c[1] * 0.82), int(c[2] * 0.86), 255))
    for _ in range(16000):
        x, y = rng.randrange(W), rng.randrange(H)
        dd = dist[y, x]
        if dd < 1 or (dd > 30 and rng.random() < 0.6): continue
        X, Y = x * S + rng.randrange(S), y * S + rng.randrange(S); L = rng.randint(2, 4 if dd > 10 else 6)
        col = (190, 245, 240, 255) if dd < 10 else (100, 200, 220, 255) if dd < 30 else (60, 140, 175, 255)
        d.line([X, Y, X + L, Y], fill=col)
    # surf: broken white band hugging every shore
    surf = (dist >= 0.4) & (dist < 2.4)
    for y, x in np.argwhere(surf):
        for _ in range(3):
            if rng.random() < 0.55:
                X, Y = x * S + rng.randrange(S), y * S + rng.randrange(S)
                d.point((X, Y), fill=(245, 252, 250, 255) if rng.random() < 0.7 else (180, 235, 232, 255))
    return im


# ---------------------------------------------------------------- 02 terrain
def terrain(coast, beach, zones, town_water=None):
    im, T = new_layer()
    gp = ground.Painter(im, T, S, seed=2)
    land_ = coast.difference(town_water) if town_water is not None else coast
    gp.grass(land_, '#5f9e3c')
    def blades(d):  # dense pixel blades so the grass reads as grass, not paint
        for x, y in gp.scatter(coast, 70):
            X, Y = T(x, y)
            c = gp.rng.choice([(74, 140, 52), (50, 116, 42), (104, 168, 66), (86, 154, 56)])
            d.line([X, Y, X, Y - gp.rng.randint(1, 3)], fill=c + (255,))
        for x, y in gp.scatter(coast, 0.8):  # clover and darker patches
            X, Y = T(x, y); r = gp.rng.randint(4, 9)
            d.ellipse([X - r, Y - r * 0.6, X + r, Y + r * 0.6], fill=(70, 132, 50, 255))
    gp.pattern(gp.mask([land_.difference(beach)]), blades)
    gp.sand(beach, water_edge=coast.boundary)
    for t, g in zones:
        if t in ('jungle', 'forest'): gp.woodland(g, '#3f7d32' if t == 'jungle' else '#4a8a36')
        elif t == 'swamp': gp.woodland(g, '#4d6e3c')
        elif t == 'palms': gp.grass(g, '#7fae48')
        elif t == 'rock': gp.fill(gp.mask([g]), '#8d877c', 0.12, (5, 2))
        elif t == 'quarry':  # a stepped pit cut into pale stone
            gp.fill(gp.mask([g]), '#b8b0a0', 0.08, (4, 2))
            for k, f in enumerate((0.75, 0.5, 0.28)):
                inner = g.buffer(-(1 - f) * 12)
                if inner.is_empty: break
                gp.fill(gp.mask([inner]), ['#a39b8b', '#8e8778', '#77716a'][k], 0.06, (4, 2))
                ring = gp.mask([inner.boundary.buffer(0.4)])
                gp.pattern(ring, lambda d: d.rectangle([0, 0, *im.size], fill=(220, 214, 200, 255)))
        elif t in ('fields', 'sugarcane', 'allotment'):
            gp.fill(gp.mask([g]), {'fields': '#c9a04e', 'sugarcane': '#9cbf4a', 'allotment': '#7a5a36'}[t], 0.05, (10, 3))
            l, tp, r, b = g.bounds
            def rows(d, g=g, t=t, l=l, tp=tp, r=r, b=b):
                step = 3 if t != 'fields' else 4
                for y in np.arange(tp, b, step):
                    for x in np.arange(l, r, 1.6 if t != 'fields' else 99):
                        X, Y = T(x, y)
                        if t == 'fields': d.line([T(l, y), T(r, y)], fill=(150, 112, 50, 255), width=2); d.line([(T(l, y)[0], T(l, y)[1] - 2), (T(r, y)[0], T(r, y)[1] - 2)], fill=(222, 186, 98, 255)); break
                        col = (70, 140, 50, 255) if t == 'sugarcane' else (96, 150, 58, 255)
                        d.line([X, Y, X, Y - (6 if t == 'sugarcane' else 3)], fill=col, width=2); d.point((X - 1, Y - 3), fill=(150, 200, 90, 255))
            gp.pattern(gp.mask([g]), rows)
        else: gp.grass(g, '#6aa846' if t != 'graveyard' else '#6f9156')
    return im


# ---------------------------------------------------------------- 03 rivers and lagoon
def rivers(water):
    im, T = new_layer()
    gp = ground.Painter(im, T, S, seed=3)
    gp.fill(gp.mask([water.buffer(1.4)]), '#7a6a4a', 0.05)  # muddy bank
    m = gp.mask([water]); bb = m.getbbox()
    if bb:
        mc = m.crop(bb)
        dist = distance_transform_edt(np.asarray(mc) > 0) / S
        t = np.clip(dist / 5, 0, 1)[..., None]
        lo, hi = np.array(hexrgb('#6fdcd2'), np.float32), np.array(hexrgb('#139cbc'), np.float32)
        rgb = lo + (hi - lo) * t
        layer = Image.fromarray(rgb.astype(np.uint8), 'RGB').convert('RGBA'); layer.putalpha(mc)
        im.alpha_composite(layer, bb[:2])
    rng = random.Random(3)
    def glints(d):
        for x, y in gp.scatter(water, 10):
            X, Y = T(x, y); d.line([X, Y, X + rng.randint(2, 5), Y], fill=(200, 248, 244, 255))
    gp.pattern(m, glints)
    edge = gp.mask([water.boundary.buffer(0.5)])
    gp.pattern(ImageChops.multiply(edge, gp.mask([water.buffer(1.4)])), lambda d: d.rectangle([0, 0, *im.size], fill=(235, 250, 248, 200)))
    return im


# ---------------------------------------------------------------- 04 roads
def cobble_pattern(gp, geom, m, size=1.0, keep=1.0):
    S_ = gp.S; rng = gp.rng
    l, t, r, b = geom.bounds
    def stones(d):
        y = t; row = 0
        while y < b:
            x = l - (size / 2 if row % 2 else 0)
            while x < r:
                w = size * rng.uniform(0.8, 1.2)
                c = rng.choice([(168, 160, 146), (152, 144, 130), (182, 174, 158), (140, 134, 122)])
                X0_, Y0_ = gp.T(x + 0.1, y + 0.1); X1_, Y1_ = gp.T(x + w - 0.1, y + size * 0.8 - 0.1)
                if X1_ - X0_ < 2 or Y1_ - Y0_ < 2 or rng.random() > keep: x += w; continue
                d.rounded_rectangle([X0_, Y0_, X1_, Y1_], radius=1, fill=c + (255,), outline=(92, 84, 74, 255))
                d.line([X0_ + 1, Y0_ + 1, X1_ - 2, Y0_ + 1], fill=(210, 204, 190, 255))
                x += w
            y += size * 0.8; row += 1
    gp.pattern(m, stones)


def roads(P):
    im, T = new_layer()
    gp = ground.Painter(im, T, S, seed=4)
    order = {'path': 0, 'lane': 1, 'main': 2}
    for name, k, w, pts in sorted(P.ROADS, key=lambda r: order.get(r[1], 0)):
        if k == 'secret': continue
        if k == 'ruinlane':  # the Old Landing's streets: broken cobbles swallowed by grass
            m = gp.mask(lines=[(pts, w)]); gp.fill(m, '#7c9a4e', 0.06)
            cobble_pattern(gp, LineString(pts).buffer(w / 2), m, 1.5, keep=0.55)
            continue
        if k == 'lane':
            gp.fill(gp.mask(lines=[(pts, w + 1.0)]), '#6e6458', 0.04)
            m = gp.mask(lines=[(pts, w)]); gp.fill(m, '#a49a88', 0.04)
            cobble_pattern(gp, LineString(pts).buffer(w / 2), m, 1.6)
        elif k == 'main':
            gp.fill(gp.mask(lines=[(pts, w + 1.4)]), '#9c7a4a', 0.05)
            m = gp.mask(lines=[(pts, w)]); gp.fill(m, '#d8b578', 0.06, (10, 3))
            ln = LineString(pts)
            def ruts(d, ln=ln, w=w):
                for off in (w * 0.22,):
                    for side in ('left', 'right'):
                        o = ln.parallel_offset(off, side, join_style=1)
                        for g in getattr(o, 'geoms', [o]):
                            if not g.is_empty: d.line([T(*c) for c in g.coords], fill=(182, 146, 92, 255), width=2)
                for x, y in gp.scatter(ln.buffer(w / 2), 8):
                    X, Y = T(x, y); d.rectangle([X, Y, X + 1, Y + 1], fill=gp.rng.choice([(160, 130, 86, 255), (236, 210, 160, 255), (140, 134, 122, 255)]))
            gp.pattern(m, ruts)
        else:
            m = gp.mask(lines=[(pts, w)])
            gp.fill(m.filter(ImageFilter.GaussianBlur(2)).point(lambda v: 255 if v > 120 else 0), '#d9bd84', 0.07, (8, 2))
    # wear: ragged edges where grass creeps in and dirt kicks out, puddles, fallen leaves
    d = ImageDraw.Draw(im)
    for name, k, w, pts in P.ROADS:
        if k in ('secret', 'lane', 'ruinlane'): continue
        ln = LineString(pts)
        edge = ln.buffer(w / 2 + 0.9).difference(ln.buffer(w / 2 - 0.9))
        inner = ln.buffer(w / 2)
        for x, y in gp.scatter(edge, 4.5):
            X, Y = T(x, y)
            if inner.contains(Point(x, y)):
                for _ in range(3): d.line([X + gp.rng.randint(-2, 2), Y, X + gp.rng.randint(-1, 1), Y - gp.rng.randint(2, 5)], fill=gp.rng.choice([(78, 140, 52, 255), (98, 156, 60, 255)]))
            else:
                d.rectangle([X, Y, X + 1, Y + 1], fill=gp.rng.choice([(196, 166, 112, 255), (170, 140, 94, 255)]))
        if k == 'main':
            for x, y in gp.scatter(ln.buffer(w / 2 - 1), 0.25):
                X, Y = T(x, y); rx = gp.rng.uniform(1.2, 2.4) * S
                d.ellipse([X - rx, Y - rx * 0.5, X + rx, Y + rx * 0.5], fill=(112, 128, 130, 255)); d.line([X - rx * 0.4, Y - rx * 0.2, X, Y - rx * 0.2], fill=(196, 220, 224, 255))
        for x, y in gp.scatter(inner, 1.2):
            X, Y = T(x, y); d.rectangle([X, Y, X + 1, Y], fill=gp.rng.choice([(196, 110, 40, 255), (150, 96, 40, 255), (210, 170, 60, 255)]))
    for name_, l, r, t, b in P.PLAZAS:
        if name_ == 'Duelling Ground':
            gp.fill(gp.mask(rects=[(l, t, r, b)]), '#d9bd84', 0.06, (6, 2)); continue
        if name_ == 'Old Landing Square':
            m = gp.mask(rects=[(l, t, r, b)]); gp.fill(m, '#7c9a4e', 0.05)
            cobble_pattern(gp, Polygon([(l, t), (r, t), (r, b), (l, b)]), m, 1.9, keep=0.5); continue
        gp.fill(gp.mask(rects=[(l - 0.8, t - 0.8, r + 0.8, b + 0.8)]), '#6e6458', 0.03)
        m = gp.mask(rects=[(l, t, r, b)]); gp.fill(m, '#a49a88', 0.03)
        cobble_pattern(gp, Polygon([(l, t), (r, t), (r, b), (l, b)]), m, 1.9)
    return im


# ---------------------------------------------------------------- 05 walls, fences, hedges
ALLEYS, DOORSTEPS, BRIDGE_SPANS = [], [], []
FACE = 4.5  # how tall a retaining wall face reads from above (units)


def retaining(d, T, pts, rng, height=FACE, ends=True):
    """A stone retaining wall seen from the south, so the ground above reads as a higher level:
    a dark coping with a grassy lip, a face of big irregular blocks lit at the top and darker at the
    foot, moss and ivy, a cast shadow on the lower ground, and squared piers at both ends."""
    ln = LineString(pts)
    if ln.length < 0.5: return
    H = min(height, FACE) * S
    step = 0.8
    for i in range(int(ln.length / step) + 1):
        p = ln.interpolate(i * step); X, Y = T(p.x, p.y); w = step * S + 1
        d.rectangle([X, Y + H, X + w, Y + H + 0.9 * S], fill=(12, 30, 12, 120))          # shadow at the foot
        rows = max(2, int(H / (1.1 * S)))
        for r in range(rows):
            yy = Y + r * H / rows; f = 1.12 - 0.35 * r / rows                          # lit top, dark foot
            c = rng.choice([(150, 144, 132), (136, 130, 120), (164, 158, 146), (124, 118, 110)])
            c = tuple(min(255, int(v * f)) for v in c)
            off = (0.4 * S) if r % 2 else 0
            d.rectangle([X, yy, X + w, yy + H / rows - 1], fill=c + (255,))
            d.line([X + off, yy, X + off, yy + H / rows - 1], fill=(84, 78, 70, 255))      # staggered joints
            d.line([X, yy + H / rows - 1, X + w, yy + H / rows - 1], fill=(92, 86, 78, 255))
        if rng.random() < 0.18:                                                           # moss and ivy down the face
            for _ in range(int(H / 2)): d.point((X + rng.uniform(0, w), Y + rng.uniform(0, H)), fill=rng.choice([(56, 110, 44, 255), (82, 140, 56, 255)]))
        d.rectangle([X, Y - 0.7 * S, X + w, Y], fill=(110, 104, 96, 255))               # coping
        d.line([X, Y - 0.7 * S, X + w, Y - 0.7 * S], fill=(196, 190, 176, 255))
        d.line([X, Y - 0.7 * S - 1, X + w, Y - 0.7 * S - 1], fill=(70, 126, 46, 255), width=2)  # grassy lip
    if ends:
        for q in (ln.coords[0], ln.coords[-1]):
            pier(d, T, q[0], q[1], H)


def pier(d, T, x, y, H):
    X, Y = T(x, y); w = 1.6 * S
    d.rectangle([X - w / 2, Y - 1.4 * S, X + w / 2, Y + H], fill=(146, 140, 128, 255), outline=(60, 56, 50, 255))
    d.line([X - w / 2 + 1, Y - 1.4 * S + 1, X - w / 2 + 1, Y + H - 1], fill=(190, 184, 170, 255))
    d.line([X + w / 2 - 1, Y - 1.4 * S + 1, X + w / 2 - 1, Y + H - 1], fill=(96, 90, 82, 255))
    d.rectangle([X - w / 2 - 1, Y - 1.9 * S, X + w / 2 + 1, Y - 1.3 * S], fill=(176, 170, 156, 255), outline=(60, 56, 50, 255))
    d.rectangle([X - w / 2, Y + H, X + w / 2 + 0.6 * S, Y + H + 0.8 * S], fill=(12, 30, 12, 120))


def stairs(d, T, pts, rng, height=FACE):
    """A flight of steps down the wall: one tread per 0.8 units of drop, each lit on its nose with a
    dark riser, between low cheek walls, landing on the lower ground."""
    ln = LineString(pts)
    if ln.length < 0.5: return
    H = min(height, FACE) * S
    (x0, y0), (x1, y1) = ln.coords[0], ln.coords[-1]
    L, R = T(min(x0, x1), y0)[0], T(max(x0, x1), y0)[0]; Y = T(x0, y0)[1]
    n = max(3, int(H / (0.7 * S)))
    for k in range(n):
        yy = Y + k * H / n
        d.rectangle([L, yy, R, yy + H / n], fill=(196, 188, 172, 255) if k % 2 == 0 else (182, 174, 158, 255))
        d.line([L, yy, R, yy], fill=(226, 220, 206, 255))                                 # lit nose
        d.line([L, yy + H / n - 1, R, yy + H / n - 1], fill=(110, 102, 90, 255))          # riser shadow
    d.rectangle([L, Y + H, R, Y + H + 0.5 * S], fill=(30, 40, 30, 70))
    for xx in (L - 0.9 * S, R):                                                          # cheek walls
        d.rectangle([xx, Y - 0.8 * S, xx + 0.9 * S, Y + H], fill=(138, 132, 120, 255), outline=(60, 56, 50, 255))
        d.line([xx + 1, Y - 0.8 * S, xx + 1, Y + H], fill=(186, 180, 166, 255))


def alley(d, T, l, r, t, b, rng):
    """A narrow passage between two houses: darker worn paving in shade, a gutter, and a few steps."""
    X0_, Y0_ = T(l, t); X1_, Y1_ = T(r, b)
    d.rectangle([X0_, Y0_, X1_, Y1_], fill=(108, 100, 90, 255))
    for y in range(int(Y0_), int(Y1_), int(0.9 * S)):
        for x in range(int(X0_), int(X1_), int(1.1 * S)):
            c = rng.choice([(126, 118, 106), (116, 108, 96), (136, 128, 116)])
            d.rectangle([x + 1, y + 1, x + 1.1 * S - 1, y + 0.9 * S - 1], fill=c + (255,))
    cx = (X0_ + X1_) / 2
    d.line([cx, Y0_, cx, Y1_], fill=(72, 66, 60, 255), width=2)                           # gutter
    d.rectangle([X0_, Y0_, X1_, Y0_ + (Y1_ - Y0_) * 0.35], fill=(20, 20, 30, 70))       # shade from the eaves
    for k in range(3):                                                                    # steps up into the passage
        yy = Y1_ - (k + 1) * 0.7 * S
        d.line([X0_, yy, X1_, yy], fill=(206, 198, 182, 255)); d.line([X0_, yy + 2, X1_, yy + 2], fill=(96, 88, 78, 255))


def doorstep(d, T, x, y):
    X, Y = T(x, y); w = 1.7 * S
    d.rectangle([X - w, Y - 0.2 * S, X + w, Y + 0.9 * S], fill=(170, 164, 150, 255), outline=(78, 72, 64, 255))
    d.line([X - w + 1, Y - 0.2 * S + 1, X + w - 1, Y - 0.2 * S + 1], fill=(214, 208, 194, 255))
    d.rectangle([X - w + 2, Y + 0.9 * S, X + w + 2, Y + 1.3 * S], fill=(20, 30, 20, 80))


def walls(fence, hedge, wall, terraces=None, town_walls=()):
    im, T = new_layer(); d = ImageDraw.Draw(im); rng = random.Random(5)
    if terraces:
        for tw in terraces[0]: retaining(d, T, tw, rng)
        for st in terraces[1]: stairs(d, T, st, rng)
    for l, r, t, b, gaps in town_walls:  # the town's terraces: wall face at the foot of the step, flights in the gaps
        yt = b - FACE
        xs = [l] + [v for g in sorted(gaps) for v in g] + [r]
        for a, c in zip(xs[0::2], xs[1::2]): retaining(d, T, [(a, yt), (c, yt)], rng)
        for g0, g1 in gaps: stairs(d, T, [(g0, yt), (g1, yt)], rng)
    for l, r, t, b in ALLEYS: alley(d, T, l, r, t, b, rng)
    for x, y in DOORSTEPS: doorstep(d, T, x, y)
    def segs(g):
        for ln in (getattr(g, 'geoms', [g]) if g is not None and not g.is_empty else []):
            if ln.geom_type == 'LineString': yield ln
    for ln in segs(hedge):
        for i in range(int(ln.length / 1.6) + 1):
            p = ln.interpolate(i * 1.6); X, Y = T(p.x, p.y); r = rng.uniform(1.0, 1.4) * S
            d.ellipse([X - r, Y - r, X + r, Y + r * 0.8], fill=(46, 104, 40, 255), outline=(26, 60, 24, 255))
            d.ellipse([X - r * 0.6, Y - r * 0.8, X + r * 0.2, Y - r * 0.1], fill=(92, 160, 64, 255))
            if rng.random() < 0.3: d.point((X + rng.randint(-3, 3), Y - rng.randint(0, 3)), fill=(220, 60, 80, 255))
    for ln in segs(wall):
        cs = [T(*c) for c in ln.coords]
        d.line(cs, fill=(70, 64, 56, 255), width=int(1.8 * S)); d.line(cs, fill=(150, 142, 128, 255), width=int(1.3 * S))
        for i in range(int(ln.length / 1.2) + 1):
            p = ln.interpolate(i * 1.2); X, Y = T(p.x, p.y)
            d.rectangle([X - 2, Y - 3, X + 2, Y - 1], fill=rng.choice([(176, 168, 152, 255), (160, 152, 138, 255)]))
            d.line([X - 2, Y + 1, X + 2, Y + 1], fill=(96, 90, 80, 255))
    for ln in segs(wall):  # every stone wall ends in a squared pier, so it never just stops
        for q in (ln.coords[0], ln.coords[-1]): pier(d, T, q[0], q[1] - 0.6, 1.2 * S)
    for ln in segs(fence):  # and every fence in a stout gate post
        for q in (ln.coords[0], ln.coords[-1]):
            X, Y = T(*q); d.rectangle([X - 3, Y - 11, X + 3, Y + 2], fill=(110, 74, 42, 255), outline=(44, 28, 14, 255)); d.rectangle([X - 4, Y - 13, X + 4, Y - 10], fill=(140, 100, 62, 255), outline=(44, 28, 14, 255))
    for ln in segs(fence):
        cs = [T(*c) for c in ln.coords]
        d.line([(x, y - 4) for x, y in cs], fill=(52, 34, 20, 255), width=4)  # rails: bold enough to read as a barrier
        d.line([(x, y - 4) for x, y in cs], fill=(150, 104, 62, 255), width=2)
        d.line([(x, y) for x, y in cs], fill=(40, 60, 30, 90), width=3)  # its shadow on the grass
        for i in range(int(ln.length / 2.0) + 1):
            p = ln.interpolate(i * 2.0); X, Y = T(p.x, p.y)
            d.rectangle([X - 2, Y - 8, X + 1, Y + 1], fill=(120, 82, 46, 255), outline=(52, 34, 20, 255))
    return im



def bridge(im, d, T, gp, name, kind, w, pts, rng):
    """A proper river bridge: stone abutments on both banks, a deck a little wider than the road,
    rails with posts on both sides, and its shadow on the water. Lanes and main roads get a stone
    arch bridge; paths a timber footbridge; the Rope Bridge planks on ropes."""
    ln = LineString(pts)
    (x0, y0), (x1, y1) = pts[0], pts[-1]
    ang = math.atan2(y1 - y0, x1 - x0)
    half = w / 2 + 0.8
    deck_g = ln.buffer(half, cap_style=2)
    stone = kind in ('lane', 'main')
    # shadow on the water, down and to the right
    sh = [T(x + 1.0, y + 1.6) for x, y in deck_g.exterior.coords]
    d.polygon(sh, fill=(6, 60, 80, 150))
    # abutments on both banks
    for (ax, ay), sgn in (((x0, y0), 1), ((x1, y1), -1)):
        ab = LineString([(ax - math.cos(ang) * 1.2 * sgn, ay - math.sin(ang) * 1.2 * sgn), (ax + math.cos(ang) * 0.8 * sgn, ay + math.sin(ang) * 0.8 * sgn)]).buffer(half + 0.3, cap_style=2)
        cs = [T(*c) for c in ab.exterior.coords]
        d.polygon(cs, fill=(136, 130, 118, 255), outline=(62, 58, 52, 255))

    if stone:  # stone arch bridge: dressed deck, parapets
        cs = [T(*c) for c in deck_g.exterior.coords]
        d.polygon(cs, fill=(150, 144, 132, 255), outline=(62, 58, 52, 255))
        L = ln.length
        for i in range(int(L / 1.1) + 1):
            p = ln.interpolate(i * 1.1); nx, ny = -math.sin(ang), math.cos(ang)
            a_ = T(p.x + nx * half * 0.8, p.y + ny * half * 0.8); b_ = T(p.x - nx * half * 0.8, p.y - ny * half * 0.8)
            d.line([a_, b_], fill=(118, 112, 102, 255))
        for side in (1, -1):
            o = ln.parallel_offset(half - 0.4, 'left' if side > 0 else 'right')
            for g in getattr(o, 'geoms', [o]):
                c = [T(*q) for q in g.coords]
                d.line(c, fill=(84, 78, 70, 255), width=int(1.0 * S) + 2); d.line(c, fill=(186, 180, 166, 255), width=int(0.6 * S))
    else:
        deck(im, T, gp, deck_g, ang + math.pi / 2, water=None, pilings=False)
        rope = name == 'Rope Bridge'
        for side in (1, -1):
            o = ln.parallel_offset(half - 0.2, 'left' if side > 0 else 'right')
            for g in getattr(o, 'geoms', [o]):
                c = [T(*q) for q in g.coords]
                d.line(c, fill=(196, 168, 112, 255) if rope else (92, 62, 36, 255), width=2 if rope else 4)
                if not rope: d.line(c, fill=(150, 106, 62, 255), width=1)
                n_ = max(2, int(g.length / 3.2) + 1)
                for i in range(n_):
                    p = g.interpolate(i / (n_ - 1), normalized=True); X, Y = T(p.x, p.y)
                    d.rectangle([X - 1, Y - 4, X + 1, Y + 1], fill=(96, 64, 36, 255), outline=(40, 26, 14, 255))


def deck(im, T, gp, geom, angle=0.0, water=None, pilings=True):
    """Heavy timber decking like the target harbour: individual boards in three tones with staggered
    ends and nail pairs, a dark rim, and thick round pilings standing in the water along every edge."""
    d = ImageDraw.Draw(im); rng = random.Random(int(abs(geom.bounds[0] * 7 + geom.bounds[1])))
    m = gp.mask([geom]); gp.fill(m, '#7a5230', 0.04)
    l, t, r, b = geom.bounds
    ca, sa = math.cos(angle), math.sin(angle)
    cx, cy = (l + r) / 2, (t + b) / 2; L = math.hypot(r - l, b - t) + 8
    tones = [(150, 102, 60), (134, 90, 52), (164, 114, 68), (122, 82, 48)]
    def boards(dd):
        k = -L / 2
        while k < L / 2:  # one strip of boards across the travel direction, ends staggered
            j = -L / 2 + rng.uniform(0, 6)
            while j < L / 2:
                ln = rng.uniform(5, 11)
                pts = []
                for (u, v) in ((k, j), (k, j + ln), (k + 1.05, j + ln), (k + 1.05, j)):
                    pts.append(T(cx + ca * u - sa * v, cy + sa * u + ca * v))
                c = rng.choice(tones)
                dd.polygon(pts, fill=c + (255,))
                dd.line([pts[0], pts[1]], fill=tuple(min(255, int(v * 1.18)) for v in c) + (255,))
                dd.line([pts[2], pts[3]], fill=(64, 40, 22, 255))
                dd.line([pts[1], pts[2]], fill=(70, 46, 26, 255))
                for f in (0.25, 0.75):  # nail pairs at the board ends
                    q = (pts[0][0] + (pts[3][0] - pts[0][0]) * f, pts[0][1] + (pts[3][1] - pts[0][1]) * f)
                    dd.point(q, fill=(52, 44, 40, 255))
                if rng.random() < 0.08:  # a knot or a wet stain
                    mx, my = (pts[0][0] + pts[2][0]) / 2, (pts[0][1] + pts[2][1]) / 2
                    dd.ellipse([mx - 2, my - 1, mx + 2, my + 1], fill=(96, 64, 38, 255))
                j += ln
            k += 1.05
    gp.pattern(m, boards)
    rim = ImageChops.subtract(gp.mask([geom.buffer(0.45)]), m)
    gp.pattern(rim, lambda dd: dd.rectangle([0, 0, *im.size], fill=(52, 32, 16, 255)))
    # pilings: thick round posts just outside the edge, every few units, where the edge meets water
    for poly in (getattr(geom, 'geoms', [geom]) if pilings else []):
        ring = poly.exterior
        for i in range(int(ring.length / 2.6)):
            p = ring.interpolate(i * 2.6 + 0.6)
            if water is not None and not water.contains(Point(p.x, p.y + 1.2)) and not water.contains(Point(p.x + 1.2, p.y)) \
               and not water.contains(Point(p.x - 1.2, p.y)) and not water.contains(Point(p.x, p.y - 1.2)): continue
            X, Y = T(p.x, p.y)
            d.ellipse([X - 7, Y + 4, X + 7, Y + 10], fill=(6, 70, 92, 170))            # dark water ring
            d.rectangle([X - 4, Y - 9, X + 4, Y + 7], fill=(86, 58, 34, 255), outline=(34, 22, 12, 255))
            d.line([X - 3, Y - 8, X - 3, Y + 6], fill=(140, 100, 62, 255))
            d.line([X + 2, Y - 8, X + 2, Y + 6], fill=(58, 38, 22, 255))
            d.rectangle([X - 4, Y + 2, X + 4, Y + 7], fill=(44, 64, 58, 255))         # weed/wet band
            d.ellipse([X - 4, Y - 12, X + 4, Y - 7], fill=(132, 96, 60, 255), outline=(34, 22, 12, 255))
            if i % 5 == 0: d.line([X - 4, Y - 4, X + 4, Y - 3], fill=(200, 172, 120, 255), width=2)  # rope lashing
            if i % 2 == 0:
                for _ in range(3): d.point((X + rng.randint(-8, 8), Y + rng.randint(6, 10)), fill=(240, 250, 248, 255))  # foam


# ---------------------------------------------------------------- 02b the town (Basse-Terre), from the walk map
def town(rects):
    im, T = new_layer(); gp = ground.Painter(im, T, S, seed=12)
    from shapely.geometry import box as _bx
    from shapely.ops import unary_union as _uu
    def geom(k):  # union of the grid rects, then round off stair steps into straight edges
        g = _uu([_bx(l, t, r, b) for l, r, t, b in rects.get(k, [])])
        if g.is_empty: return g
        rr = 2.6 if k in ('wood', 'sand', 'water') else 1.2
        g = g.buffer(rr, join_style=2).buffer(-2 * rr, join_style=2).buffer(rr, join_style=2).simplify(2.2 if k != 'garden' else 1.4, preserve_topology=True)
        return _uu([p for p in getattr(g, 'geoms', [g]) if p.area > 60])
    st, wd, sd, gd = geom('street'), geom('wood'), geom('sand'), geom('garden')
    if not st.is_empty:
        gp.fill(gp.mask([st.buffer(0.6)]), '#6e6458', 0.03)
        m = gp.mask([st]); gp.fill(m, '#a49a88', 0.03); cobble_pattern(gp, st, m, 1.6)
    if not sd.is_empty: gp.sand(sd)
    wt = geom('water')
    if not wd.is_empty:
        deck(im, T, gp, wd, math.pi / 2, water=wt.buffer(0.5))
    # walled gardens like the target: a low stone wall with ivy round each garden, dense planting inside
    if not gd.is_empty:
        d = ImageDraw.Draw(im); rng = random.Random(31)
        for poly in getattr(gd, 'geoms', [gd]):
            if poly.area < 40: continue
            ring = poly.buffer(-0.4, join_style=2).exterior
            cs = [T(*c) for c in ring.coords]
            d.line(cs, fill=(70, 66, 60, 255), width=int(1.4 * S) + 2)
            d.line(cs, fill=(150, 142, 128, 255), width=int(1.4 * S) - 1)
            for i in range(int(ring.length / 1.3)):
                p = ring.interpolate(i * 1.3); X, Y = T(p.x, p.y)
                d.line([X - 2, Y, X + 2, Y], fill=(110, 104, 94, 255))
                if rng.random() < 0.45:  # ivy and flowers spilling over the wall
                    for _ in range(4):
                        d.point((X + rng.randint(-3, 3), Y + rng.randint(-3, 3)), fill=rng.choice([(46, 104, 40, 255), (74, 140, 56, 255), (220, 60, 80, 255)]))
    return im


# ---------------------------------------------------------------- 06 docks
def docks(P, dock_geoms, breakwater, bridges):
    im, T = new_layer(); d = ImageDraw.Draw(im); rng = random.Random(6)
    gp = ground.Painter(im, T, S, seed=6)
    def pilings(geom, spacing=3.0):
        ring = geom.exterior
        for i in range(int(ring.length / spacing)):
            p = ring.interpolate(i * spacing); X, Y = T(p.x, p.y)
            d.ellipse([X - 6, Y + 2, X + 6, Y + 7], fill=(8, 80, 100, 160))  # reflection
            d.rectangle([X - 3, Y - 6, X + 3, Y + 5], fill=(92, 62, 36, 255), outline=(40, 26, 14, 255))
            d.line([X - 2, Y - 5, X - 2, Y + 4], fill=(140, 100, 60, 255))
            d.line([X - 3, Y + 1, X + 3, Y + 1], fill=(30, 60, 70, 255))  # wet line
            d.ellipse([X - 3, Y - 8, X + 3, Y - 5], fill=(120, 86, 52, 255), outline=(40, 26, 14, 255))
    for name, kind_, w, g in dock_geoms:
        pts = [pt for nm, kk, ww, pp_ in P.DOCKS if nm == name for pt in pp_]
        ang = math.atan2(pts[-1][1] - pts[0][1], pts[-1][0] - pts[0][0]) if len(pts) > 1 else 0
        shadow = gp.mask([g.buffer(1.2).difference(g)]); gp.pattern(shadow, lambda dd: dd.rectangle([0, 0, *im.size], fill=(6, 58, 78, 150)))
        deck(im, T, gp, g, ang + math.pi / 2, water=None)
        # rails along the long sides
        ring = g.exterior
        d.line([T(*c) for c in ring.coords], fill=(64, 42, 24, 255), width=2)
    if breakwater is not None:
        m = gp.mask([breakwater]); gp.fill(m, '#8a8478', 0.06)
        def blocks(dd):
            l, t, r, b = breakwater.bounds
            for x in np.arange(l, r, 1.8):
                for y in np.arange(t, b, 1.4):
                    X, Y = T(x + (0.9 if int(y / 1.4) % 2 else 0), y)
                    c = rng.choice([(150, 144, 132), (132, 126, 116), (166, 160, 148)])
                    dd.rectangle([X, Y, X + 6, Y + 4], fill=c + (255,), outline=(70, 66, 60, 255)); dd.line([X + 1, Y + 1, X + 5, Y + 1], fill=(196, 190, 178, 255))
        gp.pattern(m, blocks)
        sur = gp.mask([breakwater.buffer(1.6).difference(breakwater)])
        gp.pattern(sur, lambda dd: [dd.point((rng.randrange(im.size[0]), rng.randrange(im.size[1])), fill=(240, 250, 250, 255)) for _ in range(160000)])
    for name, kind, w, pts in BRIDGE_SPANS:
        bridge(im, d, T, gp, name, kind, w, pts, rng)
    return im


# ---------------------------------------------------------------- 07 cliffs and coastal rocks
def jagged_rock(seed, size):
    """A dark grey pointed sea rock, lit from the upper left, with a foam skirt."""
    rng = random.Random(seed)
    w = int(size * S * 1.4); h = int(size * S * 1.9)
    im = Image.new('RGBA', (w + 8, h + 8), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    cx = (w + 8) / 2; base = h + 2
    peaks = rng.randint(1, 3)
    for k in range(peaks):
        px_ = cx + (k - (peaks - 1) / 2) * w * 0.32 + rng.uniform(-3, 3); top = rng.uniform(2, h * 0.35)
        hw = w * rng.uniform(0.28, 0.42)
        body = [(px_ - hw, base), (px_ - hw * 0.6, top + h * 0.3), (px_ - 2, top), (px_ + 2, top + 2), (px_ + hw * 0.7, top + h * 0.35), (px_ + hw, base)]
        d.polygon(body, fill=(72, 70, 72, 255))
        d.polygon([(px_ - hw, base), (px_ - hw * 0.6, top + h * 0.3), (px_ - 2, top), (px_ - 1, base)], fill=(118, 114, 112, 255))
        d.line([(px_ - hw * 0.6, top + h * 0.3), (px_ - 2, top)], fill=(160, 156, 150, 255))
        for _ in range(4):
            y = rng.uniform(top + 6, base - 4); d.line([(px_ - hw * 0.5, y), (px_ + hw * 0.4, y + rng.uniform(-3, 3))], fill=(54, 52, 56, 255))
        d.polygon([(px_ + 2, top + 2), (px_ + hw * 0.7, top + h * 0.35), (px_ + hw, base), (px_ + 3, base)], fill=(52, 50, 54, 255))
    im = pp._outline(im, (28, 26, 30, 255))
    d = ImageDraw.Draw(im)
    for k in range(int(w * 1.4)):  # foam skirt hugging the waterline
        x = rng.uniform(0, w + 8); y = base + rng.uniform(-2, 4)
        if im.getpixel((int(min(w + 7, x)), int(min(im.size[1] - 1, max(0, y)))))[3] == 0:
            d.point((x, y), fill=(245, 252, 250, 255) if rng.random() < 0.75 else (190, 236, 232, 255))
    return im, (cx, base)


def cliffs(coast, zones, no_rocks):
    """Long rocky stretches of shore (dark rock ground + dense jagged rocks), scattered rocks
    elsewhere, and outcrops on the crags."""
    im, T = new_layer(); rng = random.Random(7)
    ring = coast.exterior
    stamps = []
    rocky = [g for t, g in zones if t == 'rock']
    step = 3.0
    n = int(ring.length / step)
    run = 0; rocky_run = False
    shore = []
    for i in range(n):
        p = ring.interpolate(i * step)
        if run <= 0:
            rocky_run = rng.random() < 0.45; run = rng.randint(8, 26)
        run -= 1
        if no_rocks.contains(p): continue
        near_rock = any(g.buffer(18).contains(p) for g in rocky)
        is_rocky = rocky_run or near_rock
        if is_rocky: shore.append(p)
        if not is_rocky and rng.random() > 0.08: continue
        q = ring.interpolate(i * step + 0.5); nx, ny = q.y - p.y, -(q.x - p.x); L = math.hypot(nx, ny) or 1
        if coast.contains(Point(p.x + nx / L, p.y + ny / L)): nx, ny = -nx, -ny
        for k in range(rng.randint(2, 4) if is_rocky else 1):
            off = rng.uniform(-1.5, 3.0)
            stamps.append((p.y + ny / L * off + rng.uniform(-1, 1), p.x + nx / L * off + rng.uniform(-1.5, 1.5),
                           rng.uniform(2.8, 6.0 if near_rock else 4.6) if is_rocky else rng.uniform(2.2, 3.4), rng.randrange(10 ** 6)))
    # dark rocky ground along the rocky stretches (covers the sand there)
    gp = ground.Painter(im, T, S, seed=8)
    if shore:
        from shapely.ops import unary_union
        band = unary_union([pt.buffer(9) for pt in shore]).intersection(coast.buffer(2).difference(coast.buffer(-11))).difference(no_rocks)
        m = gp.mask([band]); gp.fill(m, '#6f6a64', 0.12, (4, 1.5))
        def pebbles(d):
            for x, y in gp.scatter(band, 40):
                X, Y = T(x, y); c = rng.choice([(96, 92, 88), (130, 124, 116), (60, 58, 60)])
                d.ellipse([X - 2, Y - 1, X + 2, Y + 1], fill=c + (255,))
        gp.pattern(m, pebbles)
    for g in rocky:  # outcrops inland on the crags
        for x, y in gp.scatter(g.intersection(coast).difference(no_rocks), 4):
            stamps.append((y, x, rng.uniform(2.4, 4.6), rng.randrange(10 ** 6)))
    # sea stacks: clusters of big dark rocks standing offshore along the rocky runs and headlands
    for i, p in enumerate(shore[::7]):
        q = ring.interpolate(ring.project(p) + 0.5); nx, ny = q.y - p.y, -(q.x - p.x); L = math.hypot(nx, ny) or 1
        if coast.contains(Point(p.x + nx / L, p.y + ny / L)): nx, ny = -nx, -ny
        if rng.random() < 0.6:
            off = rng.uniform(5, 14)
            cx_, cy_ = p.x + nx / L * off, p.y + ny / L * off
            if no_rocks.contains(Point(cx_, cy_)): continue
            for k in range(rng.randint(2, 5)):
                stamps.append((cy_ + rng.uniform(-3, 3), cx_ + rng.uniform(-4, 4), rng.uniform(3.5, 7.5), rng.randrange(10 ** 6)))
    for dd_ in range(0, int(ring.length), 32):  # and the odd stack off the sandy shores too
        if rng.random() > 0.55: continue
        p = ring.interpolate(dd_); q = ring.interpolate(dd_ + 0.5); nx, ny = q.y - p.y, -(q.x - p.x); L = math.hypot(nx, ny) or 1
        if coast.contains(Point(p.x + nx / L, p.y + ny / L)): nx, ny = -nx, -ny
        off = rng.uniform(7, 16); cx_, cy_ = p.x + nx / L * off, p.y + ny / L * off
        if no_rocks.buffer(10).contains(Point(cx_, cy_)): continue
        for k in range(rng.randint(1, 4)):
            stamps.append((cy_ + rng.uniform(-2.5, 2.5), cx_ + rng.uniform(-3.5, 3.5), rng.uniform(3, 6.5), rng.randrange(10 ** 6)))
    stamps.sort()
    for y, x, size, seed in stamps:
        spr, anc = jagged_rock(seed, size)
        pp.stamp(im, spr, anc, *T(x, y))
    return im


# ---------------------------------------------------------------- 08 plants (trees, palms, bushes)
def bush(seed):
    rng = random.Random(seed)
    r = rng.uniform(1.4, 2.4) * S
    w = int(r * 2.4) + 4; h = int(r * 2) + 4
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    cx, cy = w / 2, h - r - 1
    base = rng.choice([(44, 112, 44), (58, 124, 46), (38, 98, 52)])
    for _ in range(5):
        bx, by, br = cx + rng.uniform(-0.6, 0.6) * r, cy + rng.uniform(-0.4, 0.3) * r, rng.uniform(0.5, 0.7) * r
        d.ellipse([bx - br, by - br, bx + br, by + br], fill=pp._mul(base, 0.8))
        d.ellipse([bx - br * 0.9, by - br * 0.9, bx + br * 0.5, by + br * 0.5], fill=base + (255,))
    for _ in range(4):
        x, y = cx + rng.uniform(-0.6, 0.2) * r, cy + rng.uniform(-0.7, 0) * r; d.point((x, y), fill=pp._mul(base, 1.35))
    if rng.random() < 0.6:  # flowers
        col = rng.choice([(220, 48, 60), (236, 92, 130), (246, 196, 60), (240, 240, 236)])
        for _ in range(rng.randint(3, 7)):
            x, y = cx + rng.uniform(-0.7, 0.7) * r, cy + rng.uniform(-0.7, 0.3) * r
            if im.getpixel((int(x), int(y)))[3]: d.rectangle([x, y, x + 1, y + 1], fill=col + (255,))
    return pp._outline(im, (22, 48, 24, 255)), (cx, h - 2)


OBJECTS = []  # (asset id, sprite, anchor, x, y): standalone sprites the game draws, not baked into the ground
GROUND_COVER = {'flowers', 'tall_grass', 'shells', 'stone', 'mushrooms', 'vines', 'rubble_stones', 'fog', 'tide_pool',
                'mangrove_roots', 'nest', 'driftwood', 'log', 'rope_pile'}


def obj(aid, spr, anc, x, y):
    OBJECTS.append((aid, spr, anc, x, y))


def plants(trees, coast, zones, avoid):
    im, T = new_layer(); rng = random.Random(9)
    sh = Image.new('RGBA', im.size, (0, 0, 0, 0)); sd = ImageDraw.Draw(sh)
    items = []
    for x, y, k in trees:
        items.append((y, x, k))
    # bushes: dense in woodland, scattered on grass, never on roads, water, buildings or the town
    free = coast.buffer(-2).difference(avoid)
    gp = ground.Painter(im, T, S, seed=10)
    wood = [g for t, g in zones if t in ('jungle', 'forest', 'swamp', 'palms')]
    for g in wood:
        for x, y in gp.scatter(g.intersection(free), 9): items.append((y, x, 'bush'))
    for x, y in gp.scatter(free, 1.6): items.append((y, x, 'bush'))
    # extra palms along the beaches, like the target's tropical shores
    beach_band = coast.difference(coast.buffer(-12)).intersection(free)
    for x, y in gp.scatter(beach_band, 2.4): items.append((y, x, 'palm'))
    for x, y in gp.scatter(free.difference(beach_band), 0.35): items.append((y, x, 'palm'))
    items.sort()
    for y, x, k in items:
        if k != 'bush': continue
        X, Y = T(x, y)
        r = {'jungle': 4, 'tree': 5, 'palm': 3, 'mangrove': 3.5, 'bush': 1.6, 'rock': 3}[k] * S
        sd.ellipse([X - r + 4, Y - r * 0.4 + 2, X + r + 4, Y + r * 0.4 + 2], fill=(10, 30, 10, 80))
    im.alpha_composite(sh)
    for y, x, k in items:
        if k == 'bush':
            spr, anc = bush(rng.randrange(10 ** 6)); pp.stamp(im, spr, anc, *T(x, y))
        else:
            v = int(abs(x * 7 + y * 3)) % 4
            spr, anc = pp.get(S, k, v); obj(f'{k}_{v}', spr, anc, x, y)
    return im


# ---------------------------------------------------------------- 09 props
SKIP_PROPS = {'spring', 'lookout', 'x_mark', 'bottle', 'bollard', 'grave_marker', 'tavern_sign', 'shop_sign', 'parrot_perch',
              'plank', 'hammock', 'rope_coil', 'ship_wheel', 'spyglass', 'cannonballs', 'trough', 'figurehead', 'cane_press', 'hull', 'lobster_pot'}


def props(P, footprints=()):
    im, T = new_layer()
    sh = ImageDraw.Draw(im)
    for l, t, r, b in footprints:  # drop shadow of every building, cast to the lower right
        sh.polygon([T(r + 1, t), T(r + 6, t + 3), T(r + 6, b + 3.2), T(l + 4, b + 3.2), T(l + 1, b + 1.4)], fill=(14, 30, 12, 100))
    for k, x, y in sorted(P.PROPS, key=lambda p: p[2]):
        if k in SKIP_PROPS or k in ANIM_KINDS: continue
        got = pp.get(S, k, 0)
        if not got: continue
        spr, anc = got
        obj(f'{k}_0', spr, anc, x, y)
    return im


ANIM_KINDS = ('goat', 'pig', 'chicken', 'crow', 'parrot', 'crab', 'turtle', 'gull', 'rowboat_moored', 'fishing_boat', 'jolly_roger', 'flag', 'campfire')


def name_board(text):
    from PIL import ImageFont
    f = ImageFont.load_default()
    w = int(f.getlength(text)) + 8
    im = Image.new('RGBA', (w, 20), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    small = Image.new('RGBA', (w, 13), (0, 0, 0, 0)); sd = ImageDraw.Draw(small)
    sd.rectangle([0, 0, w - 1, 12], fill=(118, 80, 48, 255)); sd.line([0, 0, w - 1, 0], fill=(158, 114, 72, 255))
    sd.line([0, 12, w - 1, 12], fill=(78, 50, 30, 255))
    sd.text((4, 1), text, font=f, fill=(244, 226, 180, 255))
    d.rectangle([4, 12, 5, 19], fill=(78, 50, 30, 255)); d.rectangle([w - 6, 12, w - 5, 19], fill=(78, 50, 30, 255))
    im.alpha_composite(small, (0, 0))
    return pp._outline(im), (w / 2, 19)


def dressing_layer(items):
    im, T = new_layer(); d = ImageDraw.Draw(im)
    for k, x, y in sorted(items, key=lambda p: p[2]):
        X, Y = T(x, y)
        if k in ANIM_KINDS: continue
        if k.startswith('name_board:'):
            text = k.split(':', 1)[1]
            spr, anc = name_board(text); obj('board_' + re.sub(r'[^a-z0-9]+', '_', text.lower()).strip('_'), spr, anc, x, y); continue
        v = int(abs(x * 13 + y * 7)) % 3
        got = pp.get(S, k, v)
        if not got: continue
        spr, anc = got
        if k in GROUND_COVER: pp.stamp(im, spr, anc, X, Y)
        else: obj(f'{k}_{v}', spr, anc, x, y)
    return im


# ---------------------------------------------------------------- stack
def quantise(im):
    a = im.getchannel('A')
    rgb = Image.new('RGB', im.size, (0, 0, 0)); rgb.paste(im, (0, 0), im)
    q = rgb.quantize(palette=ph.palette(), dither=Image.Dither.NONE).convert('RGB')
    q.putalpha(a.point(lambda v: 255 if v > 0 else 0) if False else a)
    return q


def build(out_path, coast, beach, zones, water, P, trees, bridges, dock_geoms, breakwater, extra, avoid, no_rocks=None, footprints=(), town_rects=None, town_walls=()):
    os.makedirs(os.path.join(HERE, 'art_layers'), exist_ok=True)
    base = None
    from shapely.geometry import box as _bx
    from shapely.ops import unary_union as _uu
    tw = _uu([_bx(l, t, r, b) for l, r, t, b in (town_rects or {}).get('water', [])]).buffer(0.5).buffer(-0.5)
    tw = _uu([g for g in getattr(tw, 'geoms', [tw]) if g.area > 300])  # the harbour, not garden ponds
    tw = tw.buffer(2.6, join_style=2).buffer(-5.2, join_style=2).buffer(2.6, join_style=2).simplify(2.2)  # clean edges, no steps
    steps = [('01_sea', lambda: sea(coast, tw)),
             ('02_terrain', lambda: terrain(coast, beach, zones, tw)),
             ('02b_town', lambda: town(town_rects or {})),
             ('03_rivers', lambda: rivers(water)),
             ('04_roads', lambda: roads(P)),
             ('05_walls', lambda: walls(extra.get('fence'), extra.get('hedge'), extra.get('wall'), extra.get('terraces'), town_walls)),
             ('06_docks', lambda: docks(P, dock_geoms, breakwater, bridges)),
             ('07_cliffs', lambda: cliffs(coast, zones, no_rocks)),
             ('08_plants', lambda: plants(trees, coast, zones, avoid)),
             ('09_props', lambda: props(P, footprints)),
             ('10_dressing', lambda: dressing_layer(extra.get('dressing', [])))]
    for name, fn in steps:
        layer = fn()
        layer.resize((W, H), Image.NEAREST).save(os.path.join(HERE, 'art_layers', f'{name}.png'))  # 1 px/unit review copy
        if name == '09_props':  # building shadows: their own overlay, so a painted ground never has to include them
            layer.save('/tmp/plan_art_shadow.png'); del layer; print('  layer', name, '(shadow overlay)'); continue
        if base is None: base = layer
        else: base.alpha_composite(layer)
        del layer
        print('  layer', name)
    quantise(base).save(out_path)
    export_objects()


PAINTED_OBJ, OBJ_PLACES, OBJ_SIZE = {}, {}, {}


def export_objects():
    """Each distinct object look is saved once (with its own soft contact shadow, padded so its foot
    sits at the bottom centre) and every placement becomes a slot the game draws back to front."""
    root = os.path.abspath(os.path.join(HERE, '..', '..'))
    rel = 'assets/sprites/plan_art/obj'
    os.makedirs(f'{root}/{rel}', exist_ok=True)
    for f in os.listdir(f'{root}/{rel}'): os.remove(f'{root}/{rel}/{f}')
    assets, slots = {}, []
    PAINTED_OBJ.clear(); OBJ_PLACES.clear(); OBJ_SIZE.clear()
    for aid, spr, (ax, ay), x, y in OBJECTS:
        Wd, Ht = spr.size
        if aid not in assets:
            half = int(math.ceil(max(ax, Wd - ax))) + 3
            below = Ht - ay
            pad_b = 4
            im = Image.new('RGBA', (half * 2, int(math.ceil(Ht + pad_b))), (0, 0, 0, 0))
            ImageDraw.Draw(im).ellipse([half - Wd * 0.42 + 2, ay - 2.5, half + Wd * 0.42 + 2, ay + 2.5], fill=(10, 20, 10, 70))
            q = quantise(spr)
            im.alpha_composite(q, (int(round(half - ax)), 0))
            ref = f'{root}/docs/art_reference/obj'; os.makedirs(ref, exist_ok=True)
            im.resize((im.size[0] * 4, im.size[1] * 4), Image.NEAREST).save(f'{ref}/{aid}.png')  # brief reference, 16 px/unit
            painted = f'{root}/assets/art_painted/obj/{aid}.png'
            if os.path.exists(painted):  # a painted look replaces the code one at the same footprint
                pim = Image.open(painted).convert('RGBA')
                pim.save(f'{root}/{rel}/{aid}.png'); im.save(f'{root}/{rel}/{aid}__code.png')
                PAINTED_OBJ[aid] = im.size[1] / im.size[0]
                assets[aid] = (im.size[0] / S, pim.size[1] / pim.size[0], (im.size[1] - ay) / S)
            else:
                im.save(f'{root}/{rel}/{aid}.png')
                assets[aid] = (im.size[0] / S, im.size[1] / im.size[0], (im.size[1] - ay) / S)
        w, aspect, below_u = assets[aid]
        slots.append((aid, round(x, 1), round(y + below_u, 1), round(w, 2)))
        OBJ_PLACES.setdefault(aid, []).append((round(x, 1), round(y, 1)))
    ts = ['// GENERATED by tools/blueprint/art_layers.py — every tree, rock, prop and piece of set dressing on',
          "// Tortuga as its own sprite. One image per look in assets/sprites/plan_art/obj; swap a file to restyle every copy.",
          "import type { ImageSourcePropType } from 'react-native';", '',
          'export const OBJ_ASSETS: Record<string, { src: ImageSourcePropType; aspect: number; code?: ImageSourcePropType; codeAspect?: number }> = {']
    for aid, (w, aspect, _) in sorted(assets.items()):
        code = f", code: require('../../{rel}/{aid}__code.png'), codeAspect: {PAINTED_OBJ[aid]:.3f}" if aid in PAINTED_OBJ else ''
        ts.append(f"  {aid}: {{ src: require('../../{rel}/{aid}.png'), aspect: {aspect:.3f}{code} }},")
        OBJ_SIZE[aid] = (w, aspect)
    ts.append('};')
    ts.append('/** [asset id, x, ground y, width in world units] island-relative. */')
    ts.append('export const OBJ_SLOTS: [string, number, number, number][] = [' + ', '.join(f"['{a}', {x:g}, {y:g}, {w:g}]" for a, x, y, w in slots) + '];')
    open(f'{root}/src/blueprint/artObjects.generated.ts', 'w').write('\n'.join(ts) + '\n')
    print('  objects', len(slots), 'looks', len(assets))
