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
TREE_COL = {'jungle': (52, 104, 48), 'tree': (70, 126, 56), 'mangrove': (58, 96, 62), 'palm': (92, 146, 60)}


def crown_tree(S, kind, seed):
    rng = random.Random(seed)
    r = {'jungle': 4.2, 'tree': 5.0, 'mangrove': 3.8}[kind] * S
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
    L = 5.5 * S
    W = int(L * 2.6); H = int(L * 2.6)
    im, d = _canvas(W, H)
    bx, by = W / 2 + rng.uniform(-1, 1) * S, H - 2
    tx, ty = bx + rng.uniform(-1.5, 1.5) * S, by - L * 1.25
    seg = 7
    for k in range(seg):  # ringed trunk
        a = k / seg; b = (k + 1) / seg
        x0, y0 = bx + (tx - bx) * a, by + (ty - by) * a; x1, y1 = bx + (tx - bx) * b, by + (ty - by) * b
        d.line([x0, y0, x1, y1], fill=(126, 92, 56, 255) if k % 2 else (150, 112, 70, 255), width=max(2, int(S * 0.8)))
    base = TREE_COL['palm']
    for k in range(7):
        a = -math.pi / 2 + (k - 3) * 0.75 + rng.uniform(-0.15, 0.15)
        ex, ey = tx + math.cos(a) * L, ty + math.sin(a) * L * 0.6 + L * 0.25
        mx, my = (tx + ex) / 2, (ty + ey) / 2 - L * 0.18
        col = base if a < -math.pi / 2 else _mul(base, 0.82)
        d.line([tx, ty, mx, my, ex, ey], fill=col + (255,) if len(col) == 3 else col, width=max(2, int(S * 0.9)), joint='curve')
        d.line([tx, ty - 1, mx, my - 1], fill=_mul(base, 1.25), width=1)
    d.ellipse([tx - S * 0.8, ty - S * 0.5, tx + S * 0.8, ty + S * 0.7], fill=(120, 84, 48, 255))  # coconuts
    return _outline(im), (bx, by)


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
        im, d = _canvas(7 * s, 5 * s)
        d.rectangle([0.6 * s, 2.6 * s, 6.4 * s, 4.6 * s], fill=WOOD)
        for k in range(6): d.rectangle([k * 1.16 * s, 0.4 * s, (k + 1) * 1.16 * s - 1, 2.2 * s], fill=(176, 64, 52, 255) if k % 2 else (236, 222, 196, 255))
        return _outline(im), (3.5 * s, 4.6 * s)
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
    if kind in ('whale_bones', 'kraken_bones'):
        im, d = _canvas(32 * s, 16 * s)
        d.line([2 * s, 8 * s, 28 * s, 8 * s], fill=(238, 232, 216, 255), width=max(2, s))
        for k in range(6): d.arc([(5 + k * 4) * s, 1 * s, (9 + k * 4) * s, 15 * s], 270, 90, fill=(238, 232, 216, 255), width=max(1, s // 2 + 1))
        d.ellipse([26 * s, 5 * s, 31 * s, 11 * s], fill=(238, 232, 216, 255))
        return _outline(im), (16 * s, 15 * s)
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


def stamp(base, sprite, anchor, x, y):
    """Paste sprite so its anchor lands on pixel (x, y)."""
    base.alpha_composite(sprite, (int(round(x - anchor[0])), int(round(y - anchor[1]))))


def get(S, kind, variant):
    key = (S, kind, variant)
    if key not in _cache:
        if kind in ('jungle', 'tree', 'mangrove'): _cache[key] = crown_tree(S, kind, variant * 31 + 7)
        elif kind == 'palm': _cache[key] = palm(S, variant * 17 + 3)
        elif kind == 'rock': _cache[key] = rock(S, variant * 13 + 5)
        else: _cache[key] = prop(S, kind, variant)
    return _cache[key]
