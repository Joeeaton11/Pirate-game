"""Tortuga's Art map, painted from the plan one layer at a time, aimed at the target style
(docs/style/target_style.png): turquoise sea with foam and submerged rocks, dark jagged coastal
rocks, lush grass full of flowering bushes and palms, grey cobbles, heavy timber docks on pilings,
red-roofed buildings (drawn separately as sprites).

Each layer is painted on its own transparent canvas, saved to tools/blueprint/art_layers/ for
review, then stacked into the map base. Layer order (bottom to top):
  01 sea · 02 terrain · 03 rivers · 04 roads · 05 walls · 06 docks · 07 cliffs · 08 plants · 09 props
"""
import math, os, random, sys
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
def sea(coast, docks_union):
    rng = random.Random(1); nrng = np.random.default_rng(1)
    land = lowres_mask([coast])
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
    pts = np.argwhere((dist > 3) & (dist < 14))
    for _ in range(260):
        y, x = pts[rng.randrange(len(pts))]
        X, Y = x * S, y * S; r = rng.uniform(1.5, 4) * S
        d.ellipse([X - r, Y - r * 0.7, X + r, Y + r * 0.7], fill=(10, 104, 120, 255))
        d.ellipse([X - r * 0.7, Y - r * 0.6, X + r * 0.2, Y], fill=(26, 132, 140, 255))
    # wave glints: short light dashes, thicker near the shore
    for _ in range(9000):
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
def terrain(coast, beach, zones):
    im, T = new_layer()
    gp = ground.Painter(im, T, S, seed=2)
    gp.grass(coast, '#5f9e3c')
    gp.sand(beach, water_edge=coast.boundary)
    for t, g in zones:
        if t in ('jungle', 'forest'): gp.woodland(g, '#3f7d32' if t == 'jungle' else '#4a8a36')
        elif t == 'swamp': gp.woodland(g, '#4d6e3c')
        elif t == 'palms': gp.grass(g, '#7fae48')
        elif t == 'rock': gp.fill(gp.mask([g]), '#8d877c', 0.12, (5, 2))
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
def cobble_pattern(gp, geom, m, size=1.0):
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
                if X1_ - X0_ < 2 or Y1_ - Y0_ < 2: x += w; continue
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
    for _, l, r, t, b in P.PLAZAS:
        gp.fill(gp.mask(rects=[(l - 0.8, t - 0.8, r + 0.8, b + 0.8)]), '#6e6458', 0.03)
        m = gp.mask(rects=[(l, t, r, b)]); gp.fill(m, '#a49a88', 0.03)
        cobble_pattern(gp, Polygon([(l, t), (r, t), (r, b), (l, b)]), m, 1.9)
    return im


# ---------------------------------------------------------------- 05 walls, fences, hedges
def walls(fence, hedge, wall):
    im, T = new_layer(); d = ImageDraw.Draw(im); rng = random.Random(5)
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
    for ln in segs(fence):
        cs = [T(*c) for c in ln.coords]
        d.line([(x, y - 3) for x, y in cs], fill=(124, 86, 50, 255), width=2)
        d.line([(x, y - 1) for x, y in cs], fill=(96, 64, 36, 255), width=1)
        for i in range(int(ln.length / 2.2) + 1):
            p = ln.interpolate(i * 2.2); X, Y = T(p.x, p.y)
            d.rectangle([X - 1, Y - 6, X + 1, Y + 1], fill=(108, 74, 42, 255), outline=(52, 34, 20, 255))
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
        gp.planks(g, ang, '#8e6236')
        pilings(g)
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
    if bridges is not None and not bridges.is_empty:
        for bg in getattr(bridges, 'geoms', [bridges]):
            ang = 0
            for name, k, w, pts in P.ROADS:
                for a, b in zip(pts, pts[1:]):
                    if LineString([a, b]).intersects(bg): ang = math.atan2(b[1] - a[1], a[0] - b[0]) * -1
            gp.planks(bg.buffer(0.6), ang, '#8e6236')
            d.line([T(*c) for c in bg.buffer(0.6).exterior.coords], fill=(64, 42, 24, 255), width=3)
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
    for k in range(int(w / 2)):  # foam skirt
        x = rng.uniform(2, w + 6); d.point((x, base + rng.uniform(-1, 3)), fill=(245, 252, 250, 255))
    return im, (cx, base)


def cliffs(coast, zones, rock_zones_only=False):
    im, T = new_layer(); rng = random.Random(7)
    ring = coast.exterior
    stamps = []
    rocky = [g for t, g in zones if t == 'rock']
    n = int(ring.length / 4)
    for i in range(n):
        p = ring.interpolate(i * 4 + rng.uniform(0, 2))
        near_rock = any(g.buffer(14).contains(p) for g in rocky)
        if not near_rock and rng.random() > 0.16: continue
        # push slightly out to sea
        q = ring.interpolate(i * 4 + 0.5); nx, ny = q.y - p.y, -(q.x - p.x); L = math.hypot(nx, ny) or 1
        out = Point(p.x + nx / L * 1.5, p.y + ny / L * 1.5)
        if coast.contains(out): out = Point(p.x - nx / L * 1.5, p.y - ny / L * 1.5)
        for k in range(rng.randint(1, 3 if near_rock else 2)):
            stamps.append((out.y + rng.uniform(-1.5, 1.5), out.x + rng.uniform(-2.5, 2.5), rng.uniform(2.6, 5.2 if near_rock else 3.6), rng.randrange(10 ** 6)))
    for g in rocky:  # outcrops inland on the crags
        for x, y in ground.Painter(im, T, S, seed=8).scatter(g.intersection(coast), 3):
            stamps.append((y, x, rng.uniform(2.2, 4.2), rng.randrange(10 ** 6)))
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


def plants(trees, coast, zones, avoid):
    im, T = new_layer(); rng = random.Random(9)
    sh = Image.new('RGBA', im.size, (0, 0, 0, 0)); sd = ImageDraw.Draw(sh)
    items = []
    for x, y, k in trees:
        if k == 'rock': continue
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
    for x, y in gp.scatter(beach_band, 0.9): items.append((y, x, 'palm'))
    items.sort()
    for y, x, k in items:
        X, Y = T(x, y)
        r = {'jungle': 4, 'tree': 5, 'palm': 3, 'mangrove': 3.5, 'bush': 1.6}[k] * S
        sd.ellipse([X - r + 4, Y - r * 0.4 + 2, X + r + 4, Y + r * 0.4 + 2], fill=(10, 30, 10, 80))
    im.alpha_composite(sh)
    for y, x, k in items:
        if k == 'bush': spr, anc = bush(rng.randrange(10 ** 6))
        else: spr, anc = pp.get(S, k, int(abs(x * 7 + y * 3)) % 4)
        pp.stamp(im, spr, anc, *T(x, y))
    return im


# ---------------------------------------------------------------- 09 props
SKIP_PROPS = {'falls', 'spring', 'cave', 'lookout', 'x_mark', 'bottle', 'bollard', 'grave_marker', 'tavern_sign', 'shop_sign', 'parrot_perch',
              'plank', 'hammock', 'rope_coil', 'ship_wheel', 'spyglass', 'cannonballs', 'trough', 'figurehead', 'cane_press', 'hull', 'lobster_pot'}


def props(P):
    im, T = new_layer()
    for k, x, y in sorted(P.PROPS, key=lambda p: p[2]):
        if k in SKIP_PROPS: continue
        got = pp.get(S, k, 0)
        if not got: continue
        spr, anc = got
        X, Y = T(x, y)
        ImageDraw.Draw(im).ellipse([X - spr.size[0] * 0.4 + 3, Y - 3, X + spr.size[0] * 0.4 + 3, Y + 3], fill=(10, 20, 10, 70))
        pp.stamp(im, spr, anc, X, Y)
    return im


# ---------------------------------------------------------------- stack
def quantise(im):
    a = im.getchannel('A')
    rgb = Image.new('RGB', im.size, (0, 0, 0)); rgb.paste(im, (0, 0), im)
    q = rgb.quantize(palette=ph.palette(), dither=Image.Dither.NONE).convert('RGB')
    q.putalpha(a.point(lambda v: 255 if v > 0 else 0) if False else a)
    return q


def build(out_path, coast, beach, zones, water, P, trees, bridges, dock_geoms, breakwater, extra, avoid):
    os.makedirs(os.path.join(HERE, 'art_layers'), exist_ok=True)
    base = None
    steps = [('01_sea', lambda: sea(coast, None)),
             ('02_terrain', lambda: terrain(coast, beach, zones)),
             ('03_rivers', lambda: rivers(water)),
             ('04_roads', lambda: roads(P)),
             ('05_walls', lambda: walls(extra.get('fence'), extra.get('hedge'), extra.get('wall'))),
             ('06_docks', lambda: docks(P, dock_geoms, breakwater, bridges)),
             ('07_cliffs', lambda: cliffs(coast, zones)),
             ('08_plants', lambda: plants(trees, coast, zones, avoid)),
             ('09_props', lambda: props(P))]
    for name, fn in steps:
        layer = fn()
        layer.resize((W, H), Image.NEAREST).save(os.path.join(HERE, 'art_layers', f'{name}.png'))  # 1 px/unit review copy
        if base is None: base = layer
        else: base.alpha_composite(layer)
        del layer
        print('  layer', name)
    quantise(base).save(out_path)
