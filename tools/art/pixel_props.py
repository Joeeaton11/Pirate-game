"""Pixel-art trees and props drawn in code, stamped onto the Art map base. Same rules as the
buildings: sun upper left, warm dark outline, earthy palette. Each look is drawn once as a small
sprite (a few variants per kind) and stamped wherever the plan puts one."""
import math, random
import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import binary_dilation

OUTLINE = (42, 28, 18, 255)
_cache = {}


def _outline(im, col=OUTLINE):
    a = np.asarray(im.getchannel('A')) > 0
    ring = binary_dilation(a, iterations=1) & ~a
    arr = np.asarray(im).copy(); arr[ring] = col
    return Image.fromarray(arr, 'RGBA')


def _mul(c, f): return tuple(max(0, min(255, int(v * f))) for v in c[:3]) + (255,)


def _canvas(w, h):
    im = Image.new('RGBA', (int(w), int(h)), (0, 0, 0, 0)); return im, ImageDraw.Draw(im)


# ---------------------------------------------------------------- trees
TREE_COL = {'jungle': (40, 112, 44), 'tree': (62, 138, 52), 'mangrove': (50, 104, 60), 'palm': (92, 146, 60)}


def crown_tree(S, kind, seed):
    rng = random.Random(seed)
    r = {'jungle': 5.2, 'tree': 5.6, 'mangrove': 4.2}[kind] * S
    base = TREE_COL[kind]
    W = int(r * 2.6) + 4; H = int(r * 2.9) + 4
    im, d = _canvas(W, H)
    cx, cy = W / 2, r * 1.15 + 2
    # trunk
    tb = (96, 66, 40, 255)
    d.rectangle([cx - S * 0.5, cy + r * 0.4, cx + S * 0.5, cy + r * 1.2], fill=tb)
    d.line([cx - S * 0.5, cy + r * 0.4, cx - S * 0.5, cy + r * 1.2], fill=_mul(tb, 1.25))
    if kind == 'mangrove':  # stilt roots
        for k in (-1, 1): d.line([cx, cy + r * 0.9, cx + k * r * 0.6, cy + r * 1.25], fill=tb, width=max(1, S // 2))
    # crown: overlapping blobs, dark first then lit
    blobs = [(cx + rng.uniform(-0.55, 0.55) * r, cy + rng.uniform(-0.5, 0.35) * r, rng.uniform(0.45, 0.62) * r) for _ in range(7)]
    for bx, by, br in blobs: d.ellipse([bx - br, by - br, bx + br, by + br], fill=_mul(base, 0.78))
    for bx, by, br in blobs: d.ellipse([bx - br * 0.85 - S * 0.3, by - br * 0.85 - S * 0.3, bx + br * 0.7, by + br * 0.7], fill=base + (255,))
    for bx, by, br in blobs[:4]:
        hx, hy = bx - br * 0.35, by - br * 0.4
        d.ellipse([hx - br * 0.32, hy - br * 0.28, hx + br * 0.32, hy + br * 0.28], fill=_mul(base, 1.28))
    for _ in range(int(r)):  # leaf flecks
        x, y = cx + rng.uniform(-r, r) * 0.9, cy + rng.uniform(-r, r) * 0.8
        if im.getpixel((int(x), int(y)))[3]: d.point((x, y), fill=_mul(base, rng.choice((0.7, 1.35))))
    if kind == 'tree' and rng.random() < 0.4:  # fruit
        for _ in range(4):
            x, y = cx + rng.uniform(-0.6, 0.6) * r, cy + rng.uniform(-0.5, 0.4) * r
            d.point((x, y), fill=(214, 92, 60, 255))
    return _outline(im), (W / 2, cy + r * 1.2)  # sprite, anchor (ground point)


def palm(S, seed):
    rng = random.Random(seed)
    L = 8.0 * S
    W = int(L * 2.6); H = int(L * 2.8)
    im, d = _canvas(W, H)
    bx, by = W / 2 + rng.uniform(-1, 1) * S, H - 2
    lean = rng.uniform(-2.2, 2.2) * S
    tx, ty = bx + lean, by - L * 1.2
    seg = 9
    for k in range(seg):  # ringed, gently curved trunk
        a = k / seg; b = (k + 1) / seg
        bend = math.sin(a * math.pi) * lean * 0.25
        x0, y0 = bx + (tx - bx) * a + bend, by + (ty - by) * a; x1, y1 = bx + (tx - bx) * b + bend, by + (ty - by) * b
        wdt = max(3, int(S * (1.3 - 0.4 * a)))
        d.line([x0, y0, x1, y1], fill=(126, 88, 50, 255) if k % 2 else (156, 114, 68, 255), width=wdt)
        d.line([x0 - wdt / 2 + 1, y0, x1 - wdt / 2 + 1, y1], fill=(186, 146, 96, 255), width=1)
    dark, mid, lite = (38, 104, 38), (70, 150, 52), (126, 196, 78)
    fr = 9
    for layer, col in ((0, dark), (1, mid)):
        for k in range(fr):
            a = -math.pi / 2 + (k - (fr - 1) / 2) * (2.6 / fr) * 1.2 + rng.uniform(-0.12, 0.12) + (0.15 if layer else 0)
            reach = L * rng.uniform(0.75, 1.0) * (0.92 if layer else 1)
            ex, ey = tx + math.cos(a) * reach, ty + math.sin(a) * reach * 0.55 + reach * 0.35
            mx, my = (tx + ex) / 2, (ty + ey) / 2 - reach * 0.22
            pts = [(tx, ty), (mx, my), (ex, ey)]
            d.line(pts, fill=col + (255,), width=max(3, int(S * 1.1)), joint='curve')
            # leaflets
            for t in np.linspace(0.25, 0.95, 6):
                qx, qy = tx + (ex - tx) * t, ty + (ey - ty) * t - math.sin(t * math.pi) * reach * 0.18
                d.line([qx, qy, qx + math.cos(a + 1.4) * S * 0.9, qy + math.sin(a + 1.4) * S * 0.9 + S * 0.5], fill=col + (255,), width=2)
                d.line([qx, qy, qx + math.cos(a - 1.4) * S * 0.9, qy + math.sin(a - 1.4) * S * 0.9 + S * 0.5], fill=col + (255,), width=2)
            if layer: d.line([(tx, ty - 1), (mx, my - 1)], fill=lite + (255,), width=1)
    for cx_ in (-1, 1): d.ellipse([tx + cx_ * S * 0.6 - S * 0.6, ty - S * 0.1, tx + cx_ * S * 0.6 + S * 0.6, ty + S * 1.1], fill=(110, 76, 40, 255))
    return _outline(im, (20, 44, 20, 255)), (bx, by)


def rock(S, seed):
    rng = random.Random(seed)
    r = 3.6 * S
    W, H = int(r * 2.4), int(r * 2)
    im, d = _canvas(W, H)
    pts = [(W / 2 + math.cos(a) * r * rng.uniform(0.75, 1.0), H * 0.55 + math.sin(a) * r * 0.65 * rng.uniform(0.75, 1.0)) for a in np.linspace(0, 2 * math.pi, 9)[:-1]]
    d.polygon(pts, fill=(140, 132, 118, 255))
    d.polygon([(x - S * 0.6, y - S * 0.6) for x, y in pts[4:8]] + [(W / 2, H * 0.4)], fill=(172, 164, 148, 255))
    d.line([pts[0], pts[1], pts[2]], fill=(104, 96, 84, 255), width=max(1, S // 2))
    return _outline(im), (W / 2, H * 0.85)


# ---------------------------------------------------------------- props (small, a few kinds)
WOOD, WOOD_HI, WOOD_LO = (134, 94, 60, 255), (162, 118, 78, 255), (96, 64, 40, 255)


def prop(S, kind, seed):
    rng = random.Random(seed)
    s = S
    if kind in ('barrels', 'rum_barrels', 'powder_keg', 'water_butt', 'barrel'):
        n = {'barrels': 2, 'rum_barrels': 3}.get(kind, 1)
        im, d = _canvas(n * 3.4 * s + 2, 4.2 * s)
        for k in range(n):
            x = 1 + k * 3.2 * s
            col = (60, 90, 120, 255) if kind == 'water_butt' else (110, 72, 44, 255) if kind == 'powder_keg' else WOOD
            d.rounded_rectangle([x, 0.4 * s, x + 3 * s, 4 * s], radius=s, fill=col)
            d.line([x + s * 0.4, 0.6 * s, x + s * 0.4, 3.8 * s], fill=_mul(col, 1.25))
            for yy in (1.3, 3.0): d.line([x, yy * s, x + 3 * s, yy * s], fill=(70, 64, 58, 255), width=max(1, s // 3))
        return _outline(im), (im.size[0] / 2, im.size[1] - 1)
    if kind in ('crates', 'cargo', 'sea_chest', 'chest', 'buried_chest', 'treasure_pile'):
        gold = kind in ('sea_chest', 'chest', 'treasure_pile')
        im, d = _canvas(4.2 * s, 4 * s)
        col = (150, 104, 60, 255) if not gold else (130, 84, 44, 255)
        d.rectangle([0, s, 4 * s, 3.8 * s], fill=col); d.rectangle([0, 0.2 * s, 4 * s, 1.2 * s], fill=_mul(col, 1.2))
        if gold: d.rectangle([1.6 * s, 1.0 * s, 2.4 * s, 2.0 * s], fill=(232, 196, 90, 255)); d.line([0, 1.2 * s, 4 * s, 1.2 * s], fill=(232, 196, 90, 255))
        else: d.line([0, s, 4 * s, 3.8 * s], fill=_mul(col, 0.7), width=max(1, s // 3))
        return _outline(im), (im.size[0] / 2, im.size[1] - 1)
    if kind in ('well',):
        im, d = _canvas(5 * s, 6 * s)
        d.ellipse([0.2 * s, 2.6 * s, 4.8 * s, 5.8 * s], fill=(150, 140, 122, 255)); d.ellipse([1.0 * s, 3.2 * s, 4.0 * s, 4.8 * s], fill=(40, 60, 80, 255))
        d.line([0.6 * s, 4 * s, 0.6 * s, 0.6 * s], fill=WOOD, width=max(1, s // 2)); d.line([4.4 * s, 4 * s, 4.4 * s, 0.6 * s], fill=WOOD, width=max(1, s // 2))
        d.polygon([(0, 1.2 * s), (2.5 * s, 0), (5 * s - 1, 1.2 * s)], fill=(176, 86, 52, 255))
        return _outline(im), (2.5 * s, 5.8 * s)
    if kind in ('bench', 'stool'):
        im, d = _canvas(5 * s, 2.4 * s)
        d.rectangle([0, 0.4 * s, 5 * s - 1, 1.2 * s], fill=WOOD_HI); d.line([0.5 * s, 1.2 * s, 0.5 * s, 2.3 * s], fill=WOOD_LO, width=max(1, s // 2)); d.line([4.4 * s, 1.2 * s, 4.4 * s, 2.3 * s], fill=WOOD_LO, width=max(1, s // 2))
        return _outline(im), (2.5 * s, 2.3 * s)
    if kind in ('cart', 'wheelbarrow'):
        im, d = _canvas(6 * s, 4 * s)
        d.rectangle([0.4 * s, 0.4 * s, 5.2 * s, 2.4 * s], fill=WOOD); d.line([0.4 * s, 0.4 * s, 5.2 * s, 0.4 * s], fill=WOOD_HI)
        d.ellipse([1.0 * s, 1.8 * s, 2.8 * s, 3.8 * s], fill=(80, 56, 36, 255)); d.ellipse([3.4 * s, 1.8 * s, 5.2 * s, 3.8 * s], fill=(80, 56, 36, 255))
        return _outline(im), (3 * s, 3.8 * s)
    if kind in ('stall',):
        # a full market stall: striped awning on posts over a counter piled with goods, crates beside
        s = s * 1.6  # big enough to read as a proper stall beside a person (about 18 paces wide)
        im, d = _canvas(11 * s, 8 * s)
        cols = rng.choice([((176, 64, 52), (236, 222, 196)), ((52, 110, 160), (236, 222, 196)), ((70, 140, 70), (236, 222, 196))])
        for x in (1.0, 9.6): d.rectangle([x * s, 2.4 * s, (x + 0.45) * s, 7.6 * s], fill=WOOD_LO)
        d.rectangle([1.4 * s, 4.6 * s, 9.6 * s, 7.4 * s], fill=WOOD); d.line([1.4 * s, 4.6 * s, 9.6 * s, 4.6 * s], fill=WOOD_HI)
        goods = [(220, 160, 50), (200, 60, 50), (120, 170, 60), (240, 210, 120), (150, 90, 160)]
        for k in range(7):
            gx = (1.9 + k * 1.1) * s; c = rng.choice(goods)
            d.ellipse([gx, 3.8 * s, gx + 0.9 * s, 4.7 * s], fill=c + (255,))
        for k in range(9):
            d.rectangle([(0.4 + k * 1.14) * s, 0.4 * s, (0.4 + (k + 1) * 1.14) * s - 1, 2.4 * s], fill=(cols[k % 2] + (255,)))
            d.polygon([((0.4 + k * 1.14) * s, 2.4 * s), ((0.4 + (k + 1) * 1.14) * s - 1, 2.4 * s), ((0.97 + k * 1.14) * s, 3.0 * s)], fill=(cols[k % 2] + (255,)))
        d.line([0.4 * s, 0.4 * s, 10.6 * s, 0.4 * s], fill=tuple(min(255, int(v * 1.2)) for v in cols[0]) + (255,))
        return _outline(im), (5.5 * s, 7.6 * s)
    if kind in ('signpost', 'notice'):
        im, d = _canvas(4 * s, 5 * s)
        d.line([2 * s, 5 * s, 2 * s, 0.6 * s], fill=WOOD_LO, width=max(1, s // 2))
        if kind == 'notice':
            d.rectangle([0.2 * s, 0.6 * s, 3.8 * s, 3 * s], fill=WOOD); d.rectangle([0.8 * s, 1.0 * s, 1.8 * s, 2.4 * s], fill=(236, 226, 200, 255)); d.rectangle([2.1 * s, 1.2 * s, 3.2 * s, 2.2 * s], fill=(236, 226, 200, 255))
        else:
            d.polygon([(0, 0.6 * s), (3 * s, 0.6 * s), (3.8 * s, 1.2 * s), (3 * s, 1.8 * s), (0, 1.8 * s)], fill=WOOD_HI)
            d.polygon([(4 * s - 1, 2.2 * s), (1 * s, 2.2 * s), (0.2 * s, 2.8 * s), (1 * s, 3.4 * s), (4 * s - 1, 3.4 * s)], fill=WOOD)
        return _outline(im), (2 * s, 5 * s - 1)
    if kind in ('lamp', 'lantern', 'lantern_post', 'signal_lamp'):
        im, d = _canvas(2.4 * s, 6 * s)
        d.line([1.2 * s, 6 * s, 1.2 * s, 1.4 * s], fill=(50, 44, 40, 255), width=max(1, s // 2))
        d.rectangle([0.4 * s, 0.2 * s, 2.0 * s, 1.8 * s], fill=(246, 206, 120, 255))
        return _outline(im), (1.2 * s, 6 * s - 1)
    if kind in ('jolly_roger', 'flag'):
        im, d = _canvas(6 * s, 9 * s)
        d.line([0.6 * s, 9 * s, 0.6 * s, 0], fill=(80, 56, 36, 255), width=max(1, s // 2))
        col = (24, 24, 24, 255) if kind == 'jolly_roger' else (176, 52, 44, 255)
        d.rectangle([0.8 * s, 0.2 * s, 5.6 * s, 3.4 * s], fill=col)
        if kind == 'jolly_roger':
            d.ellipse([2.4 * s, 0.8 * s, 3.8 * s, 2.2 * s], fill=(236, 232, 222, 255)); d.line([2.0 * s, 2.6 * s, 4.2 * s, 3.0 * s], fill=(236, 232, 222, 255))
        return _outline(im), (0.6 * s, 9 * s - 1)
    if kind in ('campfire', 'signal_fire'):
        im, d = _canvas(4 * s, 4 * s)
        for k in range(6):
            a = k * math.pi / 3; d.ellipse([2 * s + math.cos(a) * 1.4 * s - 0.5 * s, 2 * s + math.sin(a) * 1.1 * s - 0.4 * s, 2 * s + math.cos(a) * 1.4 * s + 0.5 * s, 2 * s + math.sin(a) * 1.1 * s + 0.4 * s], fill=(130, 124, 112, 255))
        d.polygon([(1.4 * s, 2.6 * s), (2 * s, 0.4 * s), (2.6 * s, 2.6 * s)], fill=(236, 136, 52, 255)); d.polygon([(1.8 * s, 2.4 * s), (2 * s, 1.2 * s), (2.2 * s, 2.4 * s)], fill=(250, 216, 110, 255))
        return _outline(im), (2 * s, 3.4 * s)
    if kind in ('anchor',):
        im, d = _canvas(4 * s, 5 * s)
        d.line([2 * s, 0.4 * s, 2 * s, 4.2 * s], fill=(90, 90, 96, 255), width=max(1, s // 2)); d.line([0.8 * s, 1.2 * s, 3.2 * s, 1.2 * s], fill=(90, 90, 96, 255), width=max(1, s // 2))
        d.arc([0.2 * s, 2.2 * s, 3.8 * s, 4.8 * s], 0, 180, fill=(90, 90, 96, 255), width=max(1, s // 2))
        return _outline(im), (2 * s, 4.8 * s)
    if kind in ('grave', 'pirate_grave'):
        im, d = _canvas(2.6 * s, 3.4 * s)
        d.rounded_rectangle([0.2 * s, 0.2 * s, 2.4 * s, 3.2 * s], radius=s, fill=(150, 144, 132, 255)); d.line([0.6 * s, 0.6 * s, 0.6 * s, 3 * s], fill=(176, 170, 158, 255))
        if kind == 'pirate_grave': d.line([0.6 * s, 1 * s, 2 * s, 2.4 * s], fill=(60, 60, 60, 255)); d.line([2 * s, 1 * s, 0.6 * s, 2.4 * s], fill=(60, 60, 60, 255))
        return _outline(im), (1.3 * s, 3.2 * s)
    if kind in ('cannon', 'beach_cannon'):
        im, d = _canvas(6 * s, 3.4 * s)
        d.rectangle([0.6 * s, 0.6 * s, 5.6 * s, 1.8 * s], fill=(58, 58, 62, 255)); d.line([0.6 * s, 0.6 * s, 5.6 * s, 0.6 * s], fill=(96, 96, 104, 255))
        d.ellipse([1.0 * s, 1.4 * s, 2.8 * s, 3.2 * s], fill=WOOD_LO); d.ellipse([3.2 * s, 1.4 * s, 5.0 * s, 3.2 * s], fill=WOOD_LO)
        return _outline(im), (3 * s, 3.2 * s)
    if kind in ('haystack',):
        im, d = _canvas(5 * s, 4 * s)
        d.ellipse([0, 0.4 * s, 5 * s - 1, 4 * s - 1], fill=(210, 172, 92, 255)); d.ellipse([0.6 * s, 0.6 * s, 2.6 * s, 2 * s], fill=(232, 200, 120, 255))
        return _outline(im), (2.5 * s, 3.8 * s)
    if kind in ('beehive',):
        im, d = _canvas(2.6 * s, 3 * s)
        d.ellipse([0, 0, 2.6 * s - 1, 3 * s - 1], fill=(214, 172, 80, 255))
        for yy in (0.9, 1.6, 2.3): d.line([0.2 * s, yy * s, 2.4 * s, yy * s], fill=(160, 120, 50, 255))
        return _outline(im), (1.3 * s, 2.9 * s)
    if kind in ('scarecrow',):
        im, d = _canvas(5 * s, 6 * s)
        d.line([2.5 * s, 6 * s, 2.5 * s, 1 * s], fill=WOOD_LO, width=max(1, s // 2)); d.line([0.4 * s, 2.4 * s, 4.6 * s, 2.4 * s], fill=WOOD_LO, width=max(1, s // 2))
        d.rectangle([1.6 * s, 2 * s, 3.4 * s, 4 * s], fill=(120, 90, 140, 255)); d.ellipse([1.8 * s, 0.4 * s, 3.2 * s, 1.8 * s], fill=(222, 196, 140, 255))
        d.polygon([(1.4 * s, 0.7 * s), (3.6 * s, 0.7 * s), (2.5 * s, 0)], fill=(176, 140, 70, 255))
        return _outline(im), (2.5 * s, 6 * s - 1)
    if kind in ('flowerpot',):
        im, d = _canvas(2.2 * s, 2.6 * s)
        d.rectangle([0.4 * s, 1.2 * s, 1.8 * s, 2.5 * s], fill=(176, 86, 52, 255)); d.ellipse([0, 0, 2.2 * s - 1, 1.6 * s], fill=(86, 130, 60, 255))
        d.point((0.8 * s, 0.6 * s), fill=(236, 120, 150, 255)); d.point((1.4 * s, 0.4 * s), fill=(246, 216, 90, 255))
        return _outline(im), (1.1 * s, 2.5 * s)
    if kind in ('woodpile', 'timber', 'dock_plank_bundle'):
        im, d = _canvas(6 * s, 3 * s)
        for k in range(3):
            for j in range(4 - k): d.ellipse([j * 1.4 * s + k * 0.7 * s, (2 - k) * 0.9 * s, j * 1.4 * s + k * 0.7 * s + 1.3 * s, (2 - k) * 0.9 * s + 1.2 * s], fill=(150, 108, 66, 255))
        return _outline(im), (3 * s, 2.9 * s)
    if kind in ('boat', 'rowboat'):
        im, d = _canvas(8 * s, 3.4 * s)
        d.polygon([(0, 1.2 * s), (8 * s - 1, 1.2 * s), (7 * s, 3.2 * s), (1 * s, 3.2 * s)], fill=WOOD); d.line([0, 1.2 * s, 8 * s - 1, 1.2 * s], fill=WOOD_HI)
        d.rectangle([1.2 * s, 1.4 * s, 6.8 * s, 2.2 * s], fill=WOOD_LO)
        return _outline(im), (4 * s, 3.2 * s)
    if kind in ('nets', 'fishing_rack', 'washing'):
        im, d = _canvas(8 * s, 5 * s)
        d.line([0.4 * s, 5 * s, 0.4 * s, 0.6 * s], fill=WOOD_LO, width=max(1, s // 2)); d.line([7.6 * s, 5 * s, 7.6 * s, 0.6 * s], fill=WOOD_LO, width=max(1, s // 2))
        d.line([0.4 * s, 0.8 * s, 7.6 * s, 0.8 * s], fill=(70, 60, 50, 255))
        for k in range(4):
            x = 1.2 * s + k * 1.6 * s
            col = (130, 170, 190, 255) if kind == 'fishing_rack' else (232, 222, 196, 255) if kind == 'washing' else (110, 130, 120, 255)
            d.rectangle([x, 0.9 * s, x + 1.1 * s, 2.8 * s if kind != 'nets' else 4 * s], fill=col)
        return _outline(im), (4 * s, 5 * s - 1)
    if kind in ('statue', 'mermaid_statue'):
        im, d = _canvas(4 * s, 6 * s)
        d.rectangle([0.4 * s, 4 * s, 3.6 * s, 5.8 * s], fill=(150, 144, 132, 255)); d.ellipse([1.3 * s, 0.4 * s, 2.7 * s, 1.8 * s], fill=(190, 184, 172, 255))
        d.polygon([(1.1 * s, 1.8 * s), (2.9 * s, 1.8 * s), (3.1 * s, 4 * s), (0.9 * s, 4 * s)], fill=(178, 172, 160, 255))
        return _outline(im), (2 * s, 5.8 * s)
    if kind in ('rubble',):
        im, d = _canvas(6 * s, 3 * s)
        for k in range(5): x = k * 1.1 * s; d.rectangle([x, (k % 2) * s + 0.6 * s, x + 1.4 * s, (k % 2) * s + 1.8 * s], fill=(150, 140, 122, 255))
        return _outline(im), (3 * s, 2.9 * s)
    if kind in ('skull_rock',):
        im, d = _canvas(30 * s, 28 * s)
        d.ellipse([s, s, 29 * s, 20 * s], fill=(198, 190, 172, 255)); d.rectangle([7 * s, 14 * s, 23 * s, 26 * s], fill=(198, 190, 172, 255))
        d.ellipse([3 * s, 2 * s, 14 * s, 10 * s], fill=(222, 216, 200, 255))
        d.ellipse([7 * s, 8 * s, 13 * s, 14 * s], fill=(34, 30, 26, 255)); d.ellipse([17 * s, 8 * s, 23 * s, 14 * s], fill=(34, 30, 26, 255))
        d.polygon([(15 * s, 15 * s), (13.5 * s, 18 * s), (16.5 * s, 18 * s)], fill=(34, 30, 26, 255))
        for k in range(5): d.line([(9 + k * 3) * s, 20 * s, (9 + k * 3) * s, 25 * s], fill=(120, 112, 98, 255), width=max(1, s // 2))
        return _outline(im), (15 * s, 26 * s)
    if kind in ('careened_ship',):
        im, d = _canvas(34 * s, 16 * s)
        d.chord([s, 2 * s, 33 * s, 22 * s], 180, 360, fill=(122, 82, 48, 255)); d.chord([s, 2 * s, 33 * s, 22 * s], 180, 270, fill=(146, 102, 62, 255))
        for k in range(8): d.line([(4 + k * 3.6) * s, 3 * s, (4 + k * 3.6) * s, 12 * s], fill=(96, 64, 40, 255))
        d.line([12 * s, 6 * s, 2 * s, 0], fill=(80, 56, 36, 255), width=max(1, s // 2))
        return _outline(im), (17 * s, 12 * s)
    if kind == 'whale_bones':
        im, d = _canvas(34 * s, 16 * s)
        bone, bone_hi, bone_lo = (226, 216, 190, 255), (246, 240, 222, 255), (170, 158, 130, 255)
        d.ellipse([1 * s, 9 * s, 33 * s, 15.5 * s], fill=(214, 186, 128, 255))  # sand drift
        d.line([3 * s, 10 * s, 26 * s, 10 * s], fill=bone_lo, width=max(2, s))  # spine
        for k in range(7):
            x = (6 + k * 3) * s; hgt = (6.5 - abs(k - 3) * 0.8) * s
            d.arc([x - 2 * s, 10 * s - hgt, x + 2 * s, 10 * s + 1], 200, 340, fill=bone, width=max(2, s // 2 + 1))
            d.arc([x - 2 * s, 10 * s - hgt + 1, x + 2 * s, 10 * s + 2], 210, 260, fill=bone_hi, width=1)
        d.polygon([(25 * s, 7 * s), (32 * s, 8 * s), (33 * s, 11 * s), (25 * s, 12 * s)], fill=bone)  # skull
        d.line([25 * s, 7 * s, 32 * s, 8 * s], fill=bone_hi); d.ellipse([27 * s, 8.5 * s, 28.6 * s, 10 * s], fill=(60, 50, 40, 255))
        return _outline(im, (70, 56, 40, 255)), (17 * s, 14 * s)
    if kind == 'kraken_bones':
        im, d = _canvas(30 * s, 16 * s)
        d.ellipse([1 * s, 8 * s, 29 * s, 15.5 * s], fill=(214, 186, 128, 255))
        for k, (dx, dy, sgn) in enumerate(((5, 11, 1), (11, 12, -1), (18, 11, 1), (24, 12, -1))):
            pts = [((dx + sgn * math.sin(t / 3) * 2.5) * s, (dy - t * 1.1) * s) for t in range(7)]
            d.line(pts, fill=(150, 104, 128, 255), width=max(2, int(s * 1.2)), joint='curve')
            for t in range(1, 6): d.point(((dx + sgn * math.sin(t / 3) * 2.5) * s, (dy - t * 1.1) * s), fill=(236, 196, 210, 255))
        d.ellipse([12 * s, 3 * s, 18 * s, 8 * s], fill=(222, 212, 186, 255)); d.ellipse([13.5 * s, 4.5 * s, 15 * s, 6 * s], fill=(50, 40, 34, 255))
        return _outline(im, (70, 56, 40, 255)), (15 * s, 14 * s)
    if kind == 'wreck_ship':
        im, d = _canvas(40 * s, 26 * s)
        hull = [(2 * s, 14 * s), (30 * s, 10 * s), (38 * s, 15 * s), (33 * s, 22 * s), (6 * s, 22 * s)]
        d.polygon(hull, fill=(104, 70, 42, 255)); d.polygon(hull[:2] + [(30 * s, 13 * s), (4 * s, 17 * s)], fill=(136, 96, 58, 255))
        for k in range(8): d.line([(6 + k * 3.6) * s, 13 * s, (7 + k * 3.6) * s, 21 * s], fill=(72, 48, 28, 255))
        d.polygon([(12 * s, 15 * s), (20 * s, 14 * s), (18 * s, 20 * s)], fill=(40, 30, 24, 255))  # stove-in planks
        d.line([22 * s, 12 * s, 14 * s, 0], fill=(80, 56, 36, 255), width=max(2, s))  # broken mast
        d.polygon([(14 * s, 2 * s), (24 * s, 5 * s), (16 * s, 9 * s)], fill=(214, 204, 176, 255))  # torn sail
        d.line([4 * s, 23 * s, 36 * s, 23 * s], fill=(240, 250, 250, 255))
        return _outline(im), (20 * s, 22 * s)
    if kind == 'harbour_light':
        im, d = _canvas(8 * s, 16 * s)
        d.rectangle([1.5 * s, 4 * s, 6.5 * s, 15.5 * s], fill=(222, 214, 196, 255)); d.line([1.5 * s, 4 * s, 1.5 * s, 15.5 * s], fill=(246, 240, 226, 255))
        for yy in (7, 11): d.rectangle([1.5 * s, yy * s, 6.5 * s, (yy + 1.6) * s], fill=(196, 72, 52, 255))
        d.rectangle([2.2 * s, 1.4 * s, 5.8 * s, 4 * s], fill=(255, 226, 140, 255)); d.polygon([(1.6 * s, 1.6 * s), (4 * s, 0), (6.4 * s, 1.6 * s)], fill=(70, 70, 76, 255))
        return _outline(im), (4 * s, 15.5 * s)
    if kind == 'ruin_wall':
        im, d = _canvas(16 * s, 6 * s)
        for k in range(8):
            hgt = (1.5 + 3.5 * abs(math.sin(k * 1.7 + seed))) * s
            d.rectangle([k * 2 * s, 6 * s - hgt, k * 2 * s + 2 * s - 1, 6 * s - 1], fill=(150, 144, 132, 255))
            d.line([k * 2 * s, 6 * s - hgt, k * 2 * s + 2 * s - 2, 6 * s - hgt], fill=(186, 180, 166, 255))
        d.line([1 * s, 3 * s, 5 * s, 5 * s], fill=(82, 120, 60, 255), width=2)
        return _outline(im), (8 * s, 5.9 * s)
    if kind == 'dry_well':
        im, d = _canvas(5 * s, 4 * s)
        d.ellipse([0, 0.4 * s, 5 * s - 1, 4 * s - 1], fill=(140, 134, 122, 255)); d.ellipse([1 * s, 1.2 * s, 4 * s, 3 * s], fill=(40, 34, 30, 255))
        d.rectangle([0.2 * s, 1.6 * s, 1.2 * s, 2.4 * s], fill=(112, 106, 96, 255))
        return _outline(im), (2.5 * s, 3.8 * s)
    if kind == 'tent':
        im, d = _canvas(8 * s, 6 * s)
        d.polygon([(0, 5.8 * s), (4 * s, 0.4 * s), (8 * s - 1, 5.8 * s)], fill=(196, 176, 132, 255)); d.polygon([(4 * s, 0.4 * s), (8 * s - 1, 5.8 * s), (5 * s, 5.8 * s)], fill=(160, 140, 100, 255))
        d.polygon([(3.2 * s, 5.8 * s), (4 * s, 3 * s), (4.8 * s, 5.8 * s)], fill=(60, 44, 30, 255))
        return _outline(im), (4 * s, 5.8 * s)
    if kind == 'pilings':
        im, d = _canvas(10 * s, 5 * s)
        for k in range(4):
            x = (1 + k * 2.4) * s; h = (2 + (k * 7 % 3)) * s
            d.rectangle([x, 4.6 * s - h, x + 1.2 * s, 4.6 * s], fill=(70, 50, 32, 255)); d.line([x, 4.6 * s - h, x + 1.2 * s, 4.6 * s - h], fill=(110, 80, 50, 255))
        d.line([0, 4.8 * s, 10 * s, 4.8 * s], fill=(240, 250, 250, 255))
        return _outline(im), (5 * s, 4.8 * s)
    if kind == 'gibbet':
        im, d = _canvas(8 * s, 12 * s)
        d.line([1.5 * s, 12 * s, 1.5 * s, 0.6 * s], fill=(80, 56, 36, 255), width=max(2, s)); d.line([1.5 * s, 1 * s, 6 * s, 1 * s], fill=(80, 56, 36, 255), width=max(2, s // 2 + 1))
        d.line([5.5 * s, 1 * s, 5.5 * s, 3.4 * s], fill=(60, 60, 64, 255))
        d.rectangle([4.2 * s, 3.4 * s, 6.8 * s, 7.6 * s], outline=(60, 60, 64, 255), width=max(1, s // 3))
        for x in (4.9, 5.5, 6.1): d.line([x * s, 3.4 * s, x * s, 7.6 * s], fill=(60, 60, 64, 255))
        return _outline(im), (1.5 * s, 11.8 * s)
    if kind == 'crane':
        im, d = _canvas(12 * s, 12 * s)
        d.rectangle([1 * s, 9 * s, 4 * s, 11.6 * s], fill=(110, 76, 46, 255)); d.line([2.5 * s, 9 * s, 2.5 * s, 1 * s], fill=(96, 66, 40, 255), width=max(2, s))
        d.line([2.5 * s, 1.2 * s, 11 * s, 3 * s], fill=(96, 66, 40, 255), width=max(2, s // 2 + 1)); d.line([10.5 * s, 3 * s, 10.5 * s, 7 * s], fill=(60, 60, 60, 255))
        d.rectangle([9.6 * s, 7 * s, 11.4 * s, 8.6 * s], fill=(150, 104, 60, 255))
        return _outline(im), (2.5 * s, 11.6 * s)
    if kind == 'falls':
        im, d = _canvas(16 * s, 12 * s)
        d.polygon([(0, 0), (16 * s - 1, 0), (16 * s - 1, 5 * s), (0, 5 * s)], fill=(108, 104, 100, 255))
        for k in range(7):
            x = (2 + k * 2) * s
            d.line([x, 1 * s, x + 0.4 * s, 9 * s], fill=(200, 240, 244, 255) if k % 2 else (120, 210, 226, 255), width=max(2, s))
        d.ellipse([0, 8 * s, 16 * s - 1, 12 * s - 1], fill=(240, 250, 250, 255)); d.ellipse([2 * s, 9 * s, 14 * s, 11 * s], fill=(150, 226, 232, 255))
        return _outline(im, (30, 50, 60, 255)), (8 * s, 11 * s)
    if kind == 'cave':
        im, d = _canvas(12 * s, 9 * s)
        d.ellipse([0, 0, 12 * s - 1, 12 * s], fill=(96, 92, 90, 255)); d.ellipse([2.5 * s, 2.5 * s, 9.5 * s, 13 * s], fill=(22, 18, 16, 255))
        d.arc([0, 0, 12 * s - 1, 12 * s], 190, 300, fill=(150, 146, 140, 255), width=max(1, s // 2))
        return _outline(im), (6 * s, 8.8 * s)
    if kind in ('wreck', 'wreck_mast'):
        im, d = _canvas(10 * s, 10 * s)
        d.line([3 * s, 10 * s, 6 * s, 0], fill=(80, 56, 36, 255), width=max(1, s)); d.line([2 * s, 3 * s, 8 * s, 4 * s], fill=(80, 56, 36, 255), width=max(1, s // 2))
        d.polygon([(0, 9 * s), (10 * s - 1, 9 * s), (8 * s, 10 * s - 1), (2 * s, 10 * s - 1)], fill=(110, 76, 46, 255))
        return _outline(im), (5 * s, 9.6 * s)
    if kind in ('buoy',):
        im, d = _canvas(3 * s, 3 * s); d.ellipse([0, 0, 3 * s - 1, 3 * s - 1], fill=(206, 64, 52, 255)); d.line([0.4 * s, 1.5 * s, 2.6 * s, 1.5 * s], fill=(236, 232, 222, 255))
        return _outline(im), (1.5 * s, 2.8 * s)
    if kind in ('kiln',):
        im, d = _canvas(8 * s, 6 * s); d.ellipse([0, s, 8 * s - 1, 6 * s - 1], fill=(70, 62, 54, 255)); d.ellipse([3 * s, 0, 5 * s, 2 * s], fill=(236, 136, 52, 255))
        return _outline(im), (4 * s, 5.8 * s)
    return None

IRON, IRON_HI, IRON_LO = (64, 64, 70, 255), (112, 112, 122, 255), (36, 36, 42, 255)
ROPE, ROPE_LO = (200, 170, 112, 255), (150, 120, 72, 255)


def pirate(S, kind, seed):
    """Pirate-port paraphernalia, each its own small sprite."""
    rng = random.Random(seed); s = S
    if kind == 'bollard':
        im, d = _canvas(3 * s, 3.2 * s)
        d.rectangle([0.9 * s, 1.2 * s, 2.1 * s, 3.1 * s], fill=(30, 30, 34, 255))
        d.ellipse([0.3 * s, 0.5 * s, 2.7 * s, 1.7 * s], fill=(40, 40, 46, 255)); d.ellipse([0.6 * s, 0.6 * s, 1.8 * s, 1.1 * s], fill=(96, 96, 108, 255))
        d.line([1.1 * s, 1.4 * s, 1.1 * s, 2.9 * s], fill=(84, 84, 96, 255))
        d.ellipse([0.5 * s, 1.8 * s, 2.5 * s, 2.6 * s], outline=ROPE, width=max(2, s // 2)); d.line([2.4 * s, 2.2 * s, 3 * s - 1, 3 * s], fill=ROPE, width=max(1, s // 3))
        return _outline(im), (1.5 * s, 3.1 * s)
    if kind == 'cannonballs':
        im, d = _canvas(4 * s, 3.2 * s)
        for row, n in ((2, 3), (1, 2), (0, 1)):
            for k in range(n):
                x = (0.4 + k * 1.1 + (3 - n) * 0.55) * s; y = (0.4 + row * 0.9) * s
                d.ellipse([x, y, x + 1.1 * s, y + 1.1 * s], fill=IRON); d.point((x + 0.3 * s, y + 0.3 * s), fill=IRON_HI)
        return _outline(im), (2 * s, 3.1 * s)
    if kind == 'rope_coil':
        im, d = _canvas(3.6 * s, 2.4 * s)
        for r in (1.6, 1.1, 0.6): d.ellipse([(1.8 - r) * s, (1.2 - r * 0.6) * s, (1.8 + r) * s, (1.2 + r * 0.6) * s], outline=ROPE, width=max(2, s // 2))
        d.line([3.2 * s, 1.2 * s, 3.5 * s, 2.2 * s], fill=ROPE, width=max(1, s // 3))
        return _outline(im), (1.8 * s, 2.2 * s)
    if kind == 'ship_wheel':
        im, d = _canvas(4 * s, 4.6 * s)
        c = (2 * s, 2 * s); r = 1.4 * s
        for a in range(8):
            ang = a * math.pi / 4
            d.line([c[0], c[1], c[0] + math.cos(ang) * 1.9 * s, c[1] + math.sin(ang) * 1.9 * s], fill=WOOD_LO, width=max(1, s // 3))
        d.ellipse([c[0] - r, c[1] - r, c[0] + r, c[1] + r], outline=WOOD, width=max(2, s // 2)); d.ellipse([c[0] - 0.4 * s, c[1] - 0.4 * s, c[0] + 0.4 * s, c[1] + 0.4 * s], fill=(200, 170, 80, 255))
        d.rectangle([1.8 * s, 3.4 * s, 2.2 * s, 4.5 * s], fill=WOOD_LO)
        return _outline(im), (2 * s, 4.5 * s)
    if kind == 'lobster_pot':
        im, d = _canvas(3.4 * s, 2.6 * s)
        d.chord([0.2 * s, 0.2 * s, 3.2 * s, 3.6 * s], 180, 360, fill=(168, 128, 80, 255)); d.rectangle([0.2 * s, 1.9 * s, 3.2 * s, 2.5 * s], fill=(130, 96, 56, 255))
        for k in range(1, 5): d.line([k * 0.65 * s, 0.4 * s, k * 0.65 * s, 2.4 * s], fill=(110, 80, 46, 255))
        d.ellipse([2.3 * s, 0.8 * s, 2.9 * s, 1.3 * s], fill=(210, 70, 50, 255))
        return _outline(im), (1.7 * s, 2.5 * s)
    if kind == 'figurehead':
        im, d = _canvas(4 * s, 6 * s)
        d.polygon([(1.2 * s, 6 * s - 1), (1.6 * s, 2 * s), (2.6 * s, 0.8 * s), (3.0 * s, 2.2 * s), (2.4 * s, 6 * s - 1)], fill=(176, 120, 72, 255))
        d.ellipse([2.0 * s, 0.4 * s, 3.2 * s, 1.6 * s], fill=(214, 170, 120, 255)); d.line([2.4 * s, 0.6 * s, 1.6 * s, 2.6 * s], fill=(200, 160, 60, 255), width=max(1, s // 2))
        d.rectangle([1.4 * s, 3.2 * s, 2.6 * s, 3.6 * s], fill=(176, 52, 44, 255))
        return _outline(im), (1.8 * s, 6 * s - 1)
    if kind == 'wanted_poster':
        im, d = _canvas(3 * s, 4.6 * s)
        d.rectangle([1.3 * s, 2.2 * s, 1.7 * s, 4.6 * s - 1], fill=WOOD_LO)
        d.rectangle([0.2 * s, 0.2 * s, 2.8 * s, 3 * s], fill=(232, 214, 168, 255)); d.line([0.6 * s, 0.6 * s, 2.4 * s, 0.6 * s], fill=(90, 50, 30, 255), width=max(1, s // 3))
        d.ellipse([1 * s, 1 * s, 2 * s, 2 * s], fill=(160, 120, 90, 255)); d.line([0.6 * s, 2.5 * s, 2.4 * s, 2.5 * s], fill=(90, 50, 30, 255))
        return _outline(im), (1.5 * s, 4.6 * s - 1)
    if kind == 'skull_post':
        im, d = _canvas(2.6 * s, 6 * s)
        d.rectangle([1.1 * s, 1.6 * s, 1.5 * s, 6 * s - 1], fill=WOOD_LO)
        d.ellipse([0.4 * s, 0.2 * s, 2.2 * s, 1.8 * s], fill=(230, 224, 206, 255))
        for x in (0.8, 1.4): d.rectangle([x * s, 0.8 * s, (x + 0.4) * s, 1.2 * s], fill=(30, 30, 30, 255))
        d.line([0.3 * s, 2.6 * s, 2.3 * s, 2.4 * s], fill=(176, 52, 44, 255), width=max(1, s // 2))
        return _outline(im), (1.3 * s, 6 * s - 1)
    if kind == 'treasure_open':
        im, d = _canvas(4.6 * s, 4 * s)
        d.rectangle([0.3 * s, 2 * s, 4.3 * s, 3.8 * s], fill=(130, 84, 44, 255)); d.line([0.3 * s, 2.9 * s, 4.3 * s, 2.9 * s], fill=(232, 196, 90, 255))
        d.polygon([(0.3 * s, 2 * s), (4.3 * s, 2 * s), (4.0 * s, 0.4 * s), (0.6 * s, 0.4 * s)], fill=(110, 70, 36, 255))
        for _ in range(14):
            x, y = rng.uniform(0.6, 4.0) * s, rng.uniform(1.5, 2.3) * s
            d.ellipse([x, y, x + 0.5 * s, y + 0.4 * s], fill=rng.choice([(246, 210, 80, 255), (255, 236, 140, 255), (200, 60, 60, 255)]))
        return _outline(im), (2.3 * s, 3.8 * s)
    if kind == 'hammock':
        im, d = _canvas(9 * s, 4 * s)
        for x in (0.4, 8.2): d.rectangle([x * s, 0.2 * s, (x + 0.4) * s, 3.9 * s], fill=WOOD_LO)
        d.chord([0.8 * s, -1.6 * s, 8.2 * s, 3.2 * s], 0, 180, fill=(220, 190, 140, 255))
        for k in range(1, 6): d.line([(0.8 + k * 1.2) * s, 1.0 * s, (0.8 + k * 1.2) * s, 2.8 * s], fill=(176, 52, 44, 255))
        return _outline(im), (4.5 * s, 3.9 * s)
    if kind == 'spyglass':
        im, d = _canvas(4 * s, 5 * s)
        for a, b in ((0.6, 3.4), (3.4, 3.4), (2, 1.4)): d.line([2 * s, 1.6 * s, a * s, 5 * s - 1], fill=WOOD_LO, width=max(1, s // 3))
        d.line([0.6 * s, 1.4 * s, 3.6 * s, 0.6 * s], fill=(200, 170, 80, 255), width=max(2, s // 2 + 1))
        return _outline(im), (2 * s, 5 * s - 1)
    if kind == 'ship_bell':
        im, d = _canvas(3 * s, 5 * s)
        for x in (0.3, 2.3): d.rectangle([x * s, 0.4 * s, (x + 0.4) * s, 5 * s - 1], fill=WOOD_LO)
        d.rectangle([0.3 * s, 0.4 * s, 2.7 * s, 0.8 * s], fill=WOOD)
        d.polygon([(1.1 * s, 1 * s), (1.9 * s, 1 * s), (2.3 * s, 2.6 * s), (0.7 * s, 2.6 * s)], fill=(200, 160, 60, 255)); d.line([1.2 * s, 1.2 * s, 1.0 * s, 2.4 * s], fill=(250, 220, 120, 255))
        return _outline(im), (1.5 * s, 5 * s - 1)
    if kind == 'rum_cart':
        im, d = _canvas(7 * s, 4.4 * s)
        d.rectangle([0.4 * s, 1.6 * s, 6.4 * s, 3 * s], fill=WOOD); d.ellipse([1 * s, 2.6 * s, 2.6 * s, 4.2 * s], fill=WOOD_LO); d.ellipse([4.2 * s, 2.6 * s, 5.8 * s, 4.2 * s], fill=WOOD_LO)
        for x in (0.8, 2.6, 4.4): d.rounded_rectangle([x * s, 0.2 * s, (x + 1.6) * s, 1.8 * s], radius=s * 0.5, fill=(110, 72, 44, 255))
        return _outline(im), (3.4 * s, 4.2 * s)
    if kind == 'lantern_string':
        im, d = _canvas(10 * s, 3 * s)
        d.line([0, 0.6 * s, 5 * s, 1.6 * s, 10 * s - 1, 0.6 * s], fill=(80, 60, 40, 255))
        for k in range(1, 9):
            x = k * 1.1 * s; y = 0.6 * s + (1 - abs(k - 4.5) / 4.5) * s
            d.rectangle([x - 0.3 * s, y, x + 0.3 * s, y + 0.7 * s], fill=rng.choice([(246, 196, 80, 255), (230, 110, 60, 255), (250, 230, 140, 255)]))
        return im, (5 * s, 3 * s - 1)
    if kind == 'crab_trap_stack':
        spr, _ = pirate(S, 'lobster_pot', seed)
        im = Image.new('RGBA', (spr.size[0] + int(1 * s), spr.size[1] + int(1.6 * s)), (0, 0, 0, 0))
        im.alpha_composite(spr, (0, int(1.6 * s))); im.alpha_composite(spr, (int(1 * s), 0))
        return im, (im.size[0] / 2, im.size[1] - 1)
    if kind == 'parrot_perch':
        im, d = _canvas(3 * s, 6 * s)
        d.rectangle([1.3 * s, 1 * s, 1.7 * s, 6 * s - 1], fill=WOOD_LO); d.line([0.2 * s, 1.2 * s, 2.8 * s, 1.2 * s], fill=WOOD, width=max(1, s // 2))
        d.ellipse([0.8 * s, 0, 2 * s, 1.2 * s], fill=(214, 52, 44, 255)); d.rectangle([1.6 * s, 0.3 * s, 2.1 * s, 0.6 * s], fill=(240, 190, 50, 255))
        return _outline(im), (1.5 * s, 6 * s - 1)
    return None


def critter(S, kind, seed):
    """Dressing sprites: sacks, pots, rope, flowers, grass, stones, logs, shells, boats and animals."""
    rng = random.Random(seed); s = S
    if kind.startswith('sign_'):  # a trade sign hanging from an iron bracket on its post, the trade painted on it
        icon = kind[5:]
        im, d = _canvas(5.2 * s, 7 * s); H = im.size[1]
        d.rectangle([0.4 * s, 1.0 * s, 0.9 * s, H - 1], fill=(70, 48, 30, 255))                      # post
        d.line([0.6 * s, 1.2 * s, 4.6 * s, 1.2 * s], fill=(40, 40, 46, 255), width=max(1, int(0.35 * s)))  # bracket
        d.line([0.9 * s, 2.4 * s, 2.4 * s, 1.2 * s], fill=(40, 40, 46, 255), width=max(1, int(0.25 * s)))
        for xx in (1.6, 4.0): d.line([xx * s, 1.2 * s, xx * s, 2.0 * s], fill=(60, 60, 66, 255))       # chains
        x0, y0, x1, y1 = 1.1 * s, 2.0 * s, 4.6 * s, 4.9 * s
        d.rectangle([x0, y0, x1, y1], fill=(132, 92, 54, 255), outline=(60, 40, 22, 255))
        d.line([x0 + 1, y0 + 1, x1 - 1, y0 + 1], fill=(168, 124, 78, 255))
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2; u = s * 0.45
        ink, gold = (236, 214, 150, 255), (226, 186, 70, 255)
        if icon == 'fish': d.ellipse([cx - 2.6 * u, cy - u, cx + 1.4 * u, cy + u], fill=(150, 196, 210, 255)); d.polygon([(cx + 1.2 * u, cy), (cx + 2.6 * u, cy - u), (cx + 2.6 * u, cy + u)], fill=(150, 196, 210, 255))
        elif icon == 'anchor': d.line([cx, cy - 2 * u, cx, cy + 2 * u], fill=ink, width=max(1, int(u * 0.8))); d.arc([cx - 2 * u, cy - u, cx + 2 * u, cy + 2.4 * u], 20, 160, fill=ink, width=max(1, int(u * 0.7))); d.line([cx - u, cy - 1.2 * u, cx + u, cy - 1.2 * u], fill=ink)
        elif icon == 'tankard': d.rectangle([cx - 1.4 * u, cy - 1.6 * u, cx + 0.8 * u, cy + 2 * u], fill=gold); d.arc([cx + 0.2 * u, cy - u, cx + 2.2 * u, cy + u], 270, 90, fill=gold, width=max(1, int(u * 0.6))); d.rectangle([cx - 1.4 * u, cy - 2.2 * u, cx + 0.8 * u, cy - 1.4 * u], fill=(250, 248, 236, 255))
        elif icon == 'bread': d.ellipse([cx - 2.2 * u, cy - 1.2 * u, cx + 2.2 * u, cy + 1.4 * u], fill=(214, 156, 76, 255)); [d.line([cx + k * u, cy - u, cx + k * u + 0.6 * u, cy + 0.4 * u], fill=(150, 96, 40, 255)) for k in (-1, 0, 1)]
        elif icon == 'barrel': d.ellipse([cx - 1.6 * u, cy - 2 * u, cx + 1.6 * u, cy + 2 * u], fill=(160, 110, 60, 255)); [d.line([cx - 1.6 * u, cy + k * u, cx + 1.6 * u, cy + k * u], fill=(60, 60, 66, 255)) for k in (-1, 1)]
        elif icon == 'rope': d.ellipse([cx - 2 * u, cy - 1.6 * u, cx + 2 * u, cy + 1.6 * u], outline=ink, width=max(1, int(u * 0.6))); d.ellipse([cx - u, cy - 0.8 * u, cx + u, cy + 0.8 * u], outline=ink)
        elif icon == 'anvil': d.polygon([(cx - 2.2 * u, cy - u), (cx + 2.2 * u, cy - u), (cx + u, cy), (cx + u, cy + 1.6 * u), (cx - u, cy + 1.6 * u), (cx - u, cy)], fill=(70, 70, 78, 255))
        elif icon == 'coin': d.ellipse([cx - 1.8 * u, cy - 1.8 * u, cx + 1.8 * u, cy + 1.8 * u], fill=gold, outline=(150, 110, 30, 255)); d.ellipse([cx - 0.7 * u, cy - 0.7 * u, cx + 0.7 * u, cy + 0.7 * u], outline=(150, 110, 30, 255))
        elif icon == 'bell': d.polygon([(cx - 1.8 * u, cy + 1.6 * u), (cx - u, cy - 1.6 * u), (cx + u, cy - 1.6 * u), (cx + 1.8 * u, cy + 1.6 * u)], fill=gold); d.ellipse([cx - 0.4 * u, cy + 1.4 * u, cx + 0.4 * u, cy + 2.2 * u], fill=gold)
        elif icon == 'skull': d.ellipse([cx - 1.6 * u, cy - 1.8 * u, cx + 1.6 * u, cy + 1.0 * u], fill=ink); d.rectangle([cx - u, cy + 0.6 * u, cx + u, cy + 1.8 * u], fill=ink); d.ellipse([cx - 1.0 * u, cy - 0.8 * u, cx - 0.2 * u, cy], fill=(40, 30, 20, 255)); d.ellipse([cx + 0.2 * u, cy - 0.8 * u, cx + 1.0 * u, cy], fill=(40, 30, 20, 255))
        elif icon == 'turtle': d.ellipse([cx - 2 * u, cy - 1.4 * u, cx + 1.6 * u, cy + 1.4 * u], fill=(96, 150, 70, 255)); d.ellipse([cx + 1.2 * u, cy - 0.6 * u, cx + 2.4 * u, cy + 0.6 * u], fill=(120, 170, 90, 255))
        elif icon == 'needle': d.line([cx - 2 * u, cy + 1.6 * u, cx + 2 * u, cy - 1.6 * u], fill=ink, width=max(1, int(u * 0.6))); d.ellipse([cx + 1.2 * u, cy - 2.2 * u, cx + 2.4 * u, cy - 1.0 * u], outline=ink)
        else: d.polygon([(cx - 2 * u, cy + 1.6 * u), (cx, cy - 2 * u), (cx + 2 * u, cy + 1.6 * u)], fill=ink)  # a ship's sail
        return _outline(im), (0.65 * s, H - 1)
    if kind == 'fountain':  # the square's centrepiece: a wide two-tier stone fountain, about 32 paces across
        s = s * 1.6
        im, d = _canvas(20 * s, 17 * s); W, H = im.size
        st, lit, dk, wat, wl = (150, 142, 128, 255), (190, 182, 164, 255), (108, 100, 90, 255), (54, 140, 166, 255), (140, 210, 224, 255)
        # big lower basin: an octagonal stone rim, its wall, and the pool
        def octo(x0, y0, x1, y1, k):
            return [(x0 + k, y0), (x1 - k, y0), (x1, y0 + k * 0.6), (x1, y1 - k * 0.6), (x1 - k, y1), (x0 + k, y1), (x0, y1 - k * 0.6), (x0, y0 + k * 0.6)]
        d.polygon(octo(0.3 * s, H - 8.4 * s, W - 0.3 * s, H - 0.4 * s, 3 * s), fill=dk)               # wall face
        d.polygon(octo(0.3 * s, H - 8.4 * s, W - 0.3 * s, H - 2.6 * s, 3 * s), fill=st)
        d.polygon(octo(1.2 * s, H - 7.8 * s, W - 1.2 * s, H - 3.3 * s, 2.6 * s), fill=wat)          # pool
        for k in range(5): d.arc([(3 + k * 2.6) * s, H - 6.6 * s, (5 + k * 2.6) * s, H - 5.6 * s], 200, 340, fill=wl)  # ripples
        d.line([1.0 * s, H - 8.2 * s, W - 1.0 * s, H - 8.2 * s], fill=lit)
        for k in range(1, 6): d.line([k * W / 6, H - 2.6 * s, k * W / 6, H - 0.6 * s], fill=(96, 88, 80, 255))  # wall blocks
        # pillar, upper bowl, finial
        d.rectangle([8.6 * s, 4.6 * s, 11.4 * s, H - 5.2 * s], fill=st); d.line([8.8 * s, 4.8 * s, 8.8 * s, H - 5.4 * s], fill=lit)
        d.ellipse([5.2 * s, 3.4 * s, 14.8 * s, 6.6 * s], fill=dk); d.ellipse([5.2 * s, 3.0 * s, 14.8 * s, 5.6 * s], fill=st)
        d.ellipse([6.2 * s, 3.4 * s, 13.8 * s, 5.0 * s], fill=wat)
        d.rectangle([9.4 * s, 0.9 * s, 10.6 * s, 3.8 * s], fill=st); d.ellipse([9.0 * s, 0.2 * s, 11.0 * s, 1.6 * s], fill=lit)
        # water spilling from the upper bowl into the pool
        for x in (5.6, 7.2, 12.8, 14.4):
            d.line([x * s, 5.4 * s, (x + (-0.6 if x < 10 else 0.6)) * s, H - 6.4 * s], fill=wl, width=max(1, int(0.3 * s)))
        for x in (9.6, 10.4): d.arc([(x - 2.4) * s, 0.4 * s, (x + 2.4) * s, 5 * s], 200 if x < 10 else 270, 270 if x < 10 else 340, fill=wl)
        return _outline(im), (W / 2, H - 1)
    if kind in ('planter', 'planter_palm'):  # a raised stone bed on the cobbles, planted up
        im, d = _canvas(7 * s, (7.5 if kind == 'planter_palm' else 4.4) * s)
        H = im.size[1]
        d.rectangle([0.3 * s, H - 2.6 * s, 6.7 * s, H - 0.3 * s], fill=(150, 142, 128, 255))
        for k in range(6): d.line([(0.3 + k * 1.1) * s, H - 2.6 * s, (0.3 + k * 1.1) * s, H - 0.3 * s], fill=(118, 110, 98, 255))
        d.rectangle([0.3 * s, H - 2.6 * s, 6.7 * s, H - 2.1 * s], fill=(186, 178, 160, 255))  # lit coping
        d.rectangle([0.8 * s, H - 3.2 * s, 6.2 * s, H - 2.5 * s], fill=(92, 64, 40, 255))  # soil
        rr = random.Random(seed)
        for _ in range(14):
            x = rr.uniform(0.9, 6.1) * s; y = H - rr.uniform(2.7, 3.9) * s
            d.ellipse([x - 0.6 * s, y - 0.6 * s, x + 0.6 * s, y + 0.5 * s], fill=rr.choice([(70, 132, 56, 255), (96, 156, 64, 255), (58, 112, 50, 255)]))
        for _ in range(6):
            x = rr.uniform(1.0, 6.0) * s; y = H - rr.uniform(3.0, 4.1) * s
            d.ellipse([x - 0.3 * s, y - 0.3 * s, x + 0.3 * s, y + 0.3 * s], fill=rr.choice([(230, 80, 90, 255), (250, 210, 80, 255), (240, 240, 230, 255), (200, 90, 200, 255)]))
        if kind == 'planter_palm':
            d.line([3.5 * s, H - 3.0 * s, 3.8 * s, 1.6 * s], fill=(122, 86, 52, 255), width=max(1, int(0.5 * s)))
            for a in range(0, 360, 45):
                import math as _m
                ex, ey = 3.8 * s + _m.cos(_m.radians(a)) * 2.8 * s, 1.6 * s + _m.sin(_m.radians(a)) * 1.3 * s
                d.line([3.8 * s, 1.6 * s, ex, ey], fill=(64, 140, 60, 255), width=max(1, int(0.45 * s)))
        return _outline(im), (im.size[0] / 2, H - 1)
    if kind == 'hay_bale':  # a round bale of straw, lying on its side
        im, d = _canvas(5 * s, 3.8 * s)
        d.rounded_rectangle([0.2 * s, 0.4 * s, 4.8 * s, 3.7 * s], radius=s * 1.4, fill=(214, 178, 92, 255))
        d.ellipse([3.2 * s, 0.4 * s, 4.8 * s, 3.7 * s], fill=(232, 202, 118, 255))
        d.ellipse([3.7 * s, 1.3 * s, 4.3 * s, 2.8 * s], outline=(180, 140, 66, 255))
        for k in range(4): d.line([(0.6 + k * 0.7) * s, 0.8 * s, (0.6 + k * 0.7) * s, 3.3 * s], fill=(188, 150, 72, 255))
        d.line([1.6 * s, 0.4 * s, 1.6 * s, 3.7 * s], fill=(140, 96, 52, 255))
        return _outline(im), (im.size[0] / 2, im.size[1] - 1)
    if kind == 'hay_stack':  # a tall stook of sheaves
        im, d = _canvas(4.4 * s, 5 * s)
        d.polygon([(2.2 * s, 0.2 * s), (4.2 * s, 4.8 * s), (0.2 * s, 4.8 * s)], fill=(206, 168, 84, 255))
        for k in range(5): d.line([2.2 * s, 0.4 * s, (0.5 + k * 0.85) * s, 4.8 * s], fill=(176, 138, 62, 255))
        d.line([0.9 * s, 3.2 * s, 3.5 * s, 3.2 * s], fill=(130, 90, 48, 255), width=max(1, int(s * 0.3)))
        return _outline(im), (im.size[0] / 2, im.size[1] - 1)
    if kind == 'sacks':
        im, d = _canvas(5 * s, 3.6 * s)
        for k, (x, y) in enumerate(((0, 1), (2.2, 1.2), (1.1, 0))):
            c = (196, 172, 124, 255) if k != 1 else (176, 150, 104, 255)
            d.rounded_rectangle([x * s, y * s, (x + 2.6) * s, (y + 2.3) * s], radius=s * 0.8, fill=c)
            d.line([(x + 0.6) * s, (y + 0.5) * s, (x + 2) * s, (y + 0.5) * s], fill=_mul(c, 0.75))
        return _outline(im), (im.size[0] / 2, im.size[1] - 1)
    if kind == 'potted_palm':
        im, d = _canvas(5 * s, 6 * s)
        d.rectangle([1.6 * s, 4 * s, 3.4 * s, 6 * s - 1], fill=(176, 92, 58, 255)); d.line([1.6 * s, 4.3 * s, 3.4 * s, 4.3 * s], fill=(206, 122, 82, 255))
        for a in range(7):
            ang = math.radians(-180 + a * 30 + rng.uniform(-8, 8))
            d.line([2.5 * s, 4 * s, 2.5 * s + math.cos(ang) * 2.4 * s, 4 * s + math.sin(ang) * 3.4 * s], fill=(70, 140, 56, 255) if a % 2 else (96, 166, 64, 255), width=max(2, s // 2))
        return _outline(im), (2.5 * s, 6 * s - 1)
    if kind == 'rope_pile':
        im, d = _canvas(4 * s, 2.6 * s)
        for r in (1.8, 1.2, 0.6): d.ellipse([(2 - r) * s, (1.3 - r * 0.6) * s, (2 + r) * s, (1.3 + r * 0.6) * s], outline=(196, 160, 104, 255), width=max(1, s // 2))
        return _outline(im), (2 * s, 2.4 * s)
    if kind == 'flowers':
        im, d = _canvas(4 * s, 2.4 * s)
        col = rng.choice([(232, 84, 120), (246, 204, 76), (240, 240, 232), (186, 96, 200), (246, 132, 60)])
        for _ in range(7):
            x, y = rng.uniform(0.3, 3.4) * s, rng.uniform(0.3, 1.8) * s
            d.line([x, y, x, y + 0.6 * s], fill=(52, 120, 44, 255)); d.rectangle([x - 1, y - 1, x + 1, y + 1], fill=col + (255,))
        return im, (2 * s, 2.2 * s)
    if kind == 'tall_grass':
        im, d = _canvas(4 * s, 3 * s)
        for _ in range(9):
            x = rng.uniform(0.3, 3.6) * s
            d.line([x, 3 * s - 1, x + rng.uniform(-0.6, 0.6) * s, rng.uniform(0, 1.2) * s], fill=rng.choice([(58, 128, 48, 255), (86, 152, 58, 255), (122, 168, 70, 255)]), width=max(1, s // 3))
        return im, (2 * s, 3 * s - 1)
    if kind == 'stone':
        im, d = _canvas(3 * s, 2 * s)
        d.ellipse([0, 0.2 * s, 3 * s - 1, 2 * s - 1], fill=(128, 124, 116, 255)); d.ellipse([0.4 * s, 0.3 * s, 1.6 * s, 0.9 * s], fill=(164, 160, 150, 255))
        return _outline(im), (1.5 * s, 1.9 * s)
    if kind in ('log', 'driftwood'):
        c = (120, 84, 52, 255) if kind == 'log' else (178, 160, 136, 255)
        im, d = _canvas(6 * s, 2 * s)
        d.rounded_rectangle([0, 0.3 * s, 6 * s - 1, 1.7 * s], radius=0.6 * s, fill=c); d.line([0.4 * s, 0.6 * s, 5.4 * s, 0.6 * s], fill=_mul(c, 1.25))
        d.ellipse([5 * s, 0.3 * s, 6 * s - 1, 1.7 * s], fill=_mul(c, 1.3) if kind == 'log' else _mul(c, 0.9))
        return _outline(im), (3 * s, 1.8 * s)
    if kind == 'mushrooms':
        im, d = _canvas(3 * s, 2 * s)
        for x in (0.5, 1.6):
            d.rectangle([(x + 0.3) * s, 1 * s, (x + 0.6) * s, 2 * s - 1], fill=(232, 222, 200, 255)); d.ellipse([x * s, 0.4 * s, (x + 0.9) * s, 1.2 * s], fill=(196, 56, 44, 255))
        return _outline(im), (1.5 * s, 1.9 * s)
    if kind == 'shells':
        im, d = _canvas(3 * s, 1.4 * s)
        for _ in range(4):
            x = rng.uniform(0.2, 2.2) * s; d.ellipse([x, 0.2 * s, x + 0.9 * s, 1.0 * s], fill=rng.choice([(246, 222, 210, 255), (238, 176, 150, 255)]))
        return im, (1.5 * s, 1.2 * s)
    if kind in ('rowboat_moored', 'beached_rowboat'):
        im, d = _canvas(8 * s, 4 * s)
        hull = (122, 78, 46, 255) if rng.random() < 0.6 else (60, 96, 130, 255)
        d.polygon([(0, 1.2 * s), (8 * s - 1, 1.2 * s), (7 * s, 3.4 * s), (1 * s, 3.4 * s)], fill=hull)
        d.polygon([(0.6 * s, 0.8 * s), (7.4 * s, 0.8 * s), (7 * s, 2.2 * s), (1 * s, 2.2 * s)], fill=(168, 124, 80, 255))
        for x in (2.6, 5.2): d.line([x * s, 0.9 * s, x * s, 2.1 * s], fill=(110, 72, 44, 255), width=max(1, s // 2))
        im = _outline(im)
        if kind == 'rowboat_moored':
            d = ImageDraw.Draw(im); d.line([0.6 * s, 3.8 * s, 7.4 * s, 3.8 * s], fill=(214, 236, 236, 200))
        return im, (4 * s, 3.9 * s)
    if kind == 'fishing_boat':
        im, d = _canvas(14 * s, 14 * s)
        d.polygon([(0, 9 * s), (14 * s - 1, 9 * s), (12 * s, 12.6 * s), (2 * s, 12.6 * s)], fill=(108, 66, 40, 255))
        d.line([0, 9.4 * s, 14 * s, 9.4 * s], fill=(196, 64, 48, 255), width=max(1, s // 2))
        d.rectangle([1.4 * s, 8.2 * s, 12.6 * s, 9 * s], fill=(160, 116, 74, 255))
        d.line([6.5 * s, 0.5 * s, 6.5 * s, 8.4 * s], fill=(80, 54, 34, 255), width=max(2, s // 2))
        d.polygon([(6.9 * s, 1 * s), (12 * s, 7.6 * s), (6.9 * s, 7.6 * s)], fill=(238, 228, 204, 255))
        d.polygon([(6.1 * s, 2 * s), (2.4 * s, 7.6 * s), (6.1 * s, 7.6 * s)], fill=(216, 204, 178, 255))
        im = _outline(im); d = ImageDraw.Draw(im)
        d.line([0, 13.2 * s, 14 * s, 13.2 * s], fill=(214, 236, 236, 220), width=max(1, s // 3))
        return im, (7 * s, 13 * s)
    if kind == 'canopy':
        im, d = _canvas(10 * s, 5 * s)
        c1, c2 = rng.choice([((196, 64, 52), (240, 232, 214)), ((52, 110, 160), (240, 232, 214)), ((70, 140, 70), (240, 232, 214)), ((226, 176, 60), (150, 60, 40))])
        for k in range(10):
            d.polygon([(k * s, 0.6 * s), ((k + 1) * s, 0.6 * s), ((k + 1) * s, 2.6 * s), (k * s, 2.6 * s)], fill=(c1 if k % 2 else c2) + (255,))
            d.polygon([(k * s, 2.6 * s), ((k + 1) * s, 2.6 * s), ((k + 0.5) * s, 3.3 * s)], fill=_mul((c1 if k % 2 else c2) + (255,), 0.85))
        d.line([0, 0.6 * s, 10 * s, 0.6 * s], fill=_mul(c1 + (255,), 1.2))
        for x in (0.3, 9.4): d.rectangle([x * s, 2.6 * s, (x + 0.3) * s, 5 * s - 1], fill=WOOD_LO)
        return _outline(im), (5 * s, 5 * s - 1)
    if kind == 'lean_to':
        im, d = _canvas(9 * s, 6 * s)
        thatch = rng.random() < 0.6
        top = (196, 164, 92, 255) if thatch else (150, 140, 120, 255)
        d.polygon([(0, 1.6 * s), (9 * s - 1, 0.4 * s), (9 * s - 1, 3.4 * s), (0, 4 * s)], fill=top)
        for k in range(1, 9): d.line([k * s, 1.5 * s - k * 0.13 * s, k * s, 3.9 * s - k * 0.07 * s], fill=_mul(top, 0.82))
        for x in (0.3, 8.3): d.rectangle([x * s, 3.4 * s, (x + 0.4) * s, 6 * s - 1], fill=WOOD_LO)
        d.rectangle([2 * s, 4.4 * s, 4 * s, 5.8 * s], fill=(150, 104, 60, 255))
        return _outline(im), (4.5 * s, 6 * s - 1)
    if kind == 'laundry_line':
        im, d = _canvas(12 * s, 3 * s)
        d.line([0, 0.4 * s, 6 * s, 0.9 * s, 12 * s - 1, 0.4 * s], fill=(210, 200, 180, 255))
        for k in range(1, 11, 2):
            c = rng.choice([(236, 232, 220), (196, 70, 60), (70, 120, 170), (226, 196, 90)])
            y0 = 0.4 * s + (0.5 - abs(k - 6) / 12) * s
            d.rectangle([k * s, y0, (k + 1.2) * s, y0 + rng.uniform(1.2, 2.2) * s], fill=c + (255,))
        return im, (6 * s, 3 * s - 1)
    if kind == 'loot_crates':
        im, d = _canvas(6 * s, 4.6 * s)
        for x, y in ((0, 1.4), (2.6, 1.6), (1.3, 0)):
            d.rectangle([x * s, y * s, (x + 3) * s, (y + 2.8) * s], fill=(150, 104, 60, 255)); d.line([x * s, y * s, (x + 3) * s, (y + 2.8) * s], fill=(110, 74, 42, 255))
        d.rectangle([1.8 * s, 0.6 * s, 3.6 * s, 1.2 * s], fill=(236, 200, 80, 255)); d.point([(2.2 * s, 0.4 * s), (3 * s, 0.5 * s)], fill=(255, 240, 160, 255))
        return _outline(im), (3 * s, 4.6 * s - 1)
    if kind == 'dead_tree':
        # a gnarled, leafless swamp tree: flared roots, a twisting trunk, a few thick spreading limbs
        # that fork into twigs, hanging grey moss, so it reads as a tree (not a post) at play size
        im, d = _canvas(16 * s, 16 * s)
        bark, hi, lo = (104, 90, 78, 255), (140, 124, 108, 255), (64, 54, 48, 255)
        cx, base = 8 * s, 15.6 * s
        d.polygon([(cx - 2.2 * s, base), (cx - 0.9 * s, base - 1.6 * s), (cx - 0.7 * s, base - 7 * s), (cx + 0.7 * s, base - 7.4 * s),
                   (cx + 1.0 * s, base - 1.6 * s), (cx + 2.4 * s, base)], fill=bark)
        d.line([cx - 0.5 * s, base - 1 * s, cx - 0.4 * s, base - 7 * s], fill=hi, width=max(1, s // 3))
        tips = []
        def br(x, y, a, L, w, depth):
            x2, y2 = x + math.cos(a) * L * s, y - math.sin(a) * L * s
            d.line([x, y, x2, y2], fill=bark, width=max(1, int(w)))
            if w > 2: d.line([x - 1, y, x2 - 1, y2], fill=hi, width=1)
            if depth == 0: tips.append((x2, y2)); return
            for da in (rng.uniform(0.35, 0.7), -rng.uniform(0.35, 0.7)):
                br(x2, y2, a + da, L * rng.uniform(0.55, 0.7), w * 0.6, depth - 1)
        top = base - 7 * s
        for a0 in (math.radians(150), math.radians(105), math.radians(70), math.radians(30)):
            br(cx, top, a0 + rng.uniform(-0.15, 0.15), rng.uniform(3.2, 4.4), max(2, s * 0.9), 2)
        for x, y in tips:  # twig flicks and hanging moss
            d.line([x, y, x + rng.uniform(-3, 3), y - rng.uniform(2, 5)], fill=lo, width=1)
            if rng.random() < 0.45:
                L = rng.uniform(4, 10); d.line([x, y, x + rng.uniform(-1, 1), y + L], fill=(150, 160, 140, 255), width=max(1, s // 3))
        im = _outline(im, (30, 24, 22, 255)); d = ImageDraw.Draw(im)
        return im, (cx, base)
    if kind == 'fog':
        im, d = _canvas(16 * s, 6 * s)
        for _ in range(6):
            x, y, r = rng.uniform(3, 13) * s, rng.uniform(2, 4) * s, rng.uniform(1.6, 3) * s
            d.ellipse([x - r * 1.6, y - r * 0.7, x + r * 1.6, y + r * 0.7], fill=(214, 222, 228, 110))
        return im, (8 * s, 4 * s)
    if kind == 'vines':
        im, d = _canvas(5 * s, 4 * s)
        for _ in range(26):
            x, y = rng.uniform(0.2, 4.6) * s, rng.uniform(0.6, 3.8) * s
            d.rectangle([x, y, x + 1, y + 1], fill=rng.choice([(48, 104, 44, 255), (70, 132, 54, 255), (40, 84, 40, 255), (200, 70, 110, 255)]))
        return im, (2.5 * s, 4 * s - 1)
    if kind == 'rubble_stones':
        im, d = _canvas(6 * s, 3 * s)
        for _ in range(5):
            x, y, w = rng.uniform(0, 4.4) * s, rng.uniform(0.6, 1.8) * s, rng.uniform(1, 1.6) * s
            d.rectangle([x, y, x + w, y + w * 0.7], fill=rng.choice([(156, 146, 128, 255), (132, 124, 110, 255), (176, 166, 146, 255)]))
        return _outline(im), (3 * s, 3 * s - 1)
    if kind == 'tide_pool':
        im, d = _canvas(6 * s, 3.6 * s)
        d.ellipse([0, 0, 6 * s - 1, 3.6 * s - 1], fill=(96, 92, 86, 255)); d.ellipse([0.6 * s, 0.5 * s, 5.4 * s, 3.1 * s], fill=(40, 150, 160, 255))
        d.ellipse([1.4 * s, 0.9 * s, 3 * s, 1.6 * s], fill=(130, 214, 210, 255)); d.point([(3.6 * s, 2.2 * s), (4.2 * s, 1.6 * s)], fill=(236, 120, 70, 255))
        return _outline(im), (3 * s, 3.4 * s)
    if kind == 'nest':
        im, d = _canvas(4 * s, 2.6 * s)
        d.ellipse([0, 0.8 * s, 4 * s - 1, 2.6 * s - 1], fill=(124, 96, 60, 255)); d.ellipse([0.8 * s, 0.8 * s, 3.2 * s, 1.8 * s], fill=(78, 58, 36, 255))
        for x in (1.2, 2.1): d.ellipse([x * s, 0.7 * s, (x + 0.8) * s, 1.5 * s], fill=(236, 230, 214, 255))
        return _outline(im), (2 * s, 2.6 * s - 1)
    if kind == 'mangrove_roots':
        im, d = _canvas(6 * s, 3.4 * s)
        for k in range(6):
            x = rng.uniform(0.4, 5.6) * s
            d.arc([x - 1.4 * s, 0.4 * s, x + 1.4 * s, 4.2 * s], 180, 360, fill=(104, 84, 60, 255), width=max(1, s // 2))
        d.ellipse([1 * s, 0, 5 * s, 1.6 * s], fill=(50, 104, 60, 255))
        return _outline(im), (3 * s, 3.3 * s)
    if kind in ('goat', 'pig', 'chicken', 'crow', 'parrot', 'crab', 'turtle', 'gull'):
        body = {'goat': (226, 220, 206), 'pig': (236, 170, 160), 'chicken': (246, 242, 230), 'crow': (40, 40, 48),
                'parrot': (214, 52, 44), 'crab': (220, 86, 52), 'turtle': (86, 120, 62), 'gull': (242, 242, 238)}[kind]
        big = kind in ('goat', 'pig', 'turtle')
        w, h = (5.2, 3.6) if big else (2.6, 2.4)
        im, d = _canvas(w * s, h * s); B = body + (255,)
        if kind in ('goat', 'pig'):
            d.ellipse([0.6 * s, 0.6 * s, 4.2 * s, 2.8 * s], fill=B)
            for x in (1.1, 3.4): d.rectangle([x * s, 2.4 * s, (x + 0.4) * s, 3.5 * s], fill=_mul(B, 0.6))
            d.ellipse([3.6 * s, 0.2 * s, 5.1 * s, 1.6 * s], fill=B); d.rectangle([4.6 * s, 0.6 * s, 4.7 * s, 0.7 * s], fill=(20, 20, 20, 255))
            if kind == 'goat': d.line([3.9 * s, 0.3 * s, 3.5 * s, 0], fill=(110, 96, 80, 255), width=max(1, s // 3))
        elif kind == 'turtle':
            d.ellipse([0.8 * s, 0.4 * s, 4.2 * s, 3.2 * s], fill=B); d.ellipse([1.4 * s, 0.9 * s, 3.6 * s, 2.7 * s], fill=_mul(B, 1.25))
            d.ellipse([4 * s, 1.2 * s, 5.1 * s, 2.3 * s], fill=(150, 170, 110, 255))
        elif kind == 'crab':
            d.ellipse([0.5 * s, 0.8 * s, 2.1 * s, 2 * s], fill=B)
            for x in (0.1, 2.1): d.rectangle([x * s, 0.4 * s, (x + 0.5) * s, 0.9 * s], fill=B)
        else:
            d.ellipse([0.3 * s, 0.7 * s, 2.1 * s, 2.1 * s], fill=B); d.ellipse([1.4 * s, 0.1 * s, 2.4 * s, 1.1 * s], fill=B)
            beak = (240, 180, 50, 255) if kind != 'parrot' else (60, 60, 60, 255)
            d.rectangle([2.3 * s, 0.5 * s, 2.6 * s - 1, 0.8 * s], fill=beak)
            if kind == 'parrot': d.rectangle([0.3 * s, 1.2 * s, 1.2 * s, 2.1 * s], fill=(52, 110, 200, 255))
            if kind == 'chicken': d.rectangle([1.7 * s, 0, 2 * s, 0.3 * s], fill=(220, 40, 40, 255))
        return _outline(im), (w * s / 2, h * s - 1)
    return None


def stamp(base, sprite, anchor, x, y):
    """Paste sprite so its anchor lands on pixel (x, y)."""
    base.alpha_composite(sprite, (int(round(x - anchor[0])), int(round(y - anchor[1]))))


def get(S, kind, variant):
    key = (S, kind, variant)
    if key not in _cache:
        if kind in ('jungle', 'tree', 'mangrove'): _cache[key] = crown_tree(S, kind, variant * 31 + 7)
        elif kind == 'palm': _cache[key] = palm(S, variant * 17 + 3)
        elif kind == 'rock': _cache[key] = rock(S, variant * 13 + 5)
        else: _cache[key] = pirate(S, kind, variant * 5 + 2) or critter(S, kind, variant * 7 + 1) or prop(S, kind, variant)
    return _cache[key]
