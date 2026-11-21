"""Pixel-art buildings drawn in code, in the house style (see docs/ART_STYLE_GUIDE.md and the
tortuga_v2 building sprites): front-facing, roof ridge horizontal, warm dark outlines, sun from
the upper left, earthy palette (tools/art/palette.png, sampled from the reference art).

Everything is drawn pixel by pixel on a small canvas (PPU pixels per world unit), quantised to the
reference palette, outlined, then doubled with nearest-neighbour so the pixels stay crisp.
"""
import math, random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

PPU = 6
UPSCALE = 2
OUTLINE = (42, 28, 18)

RAMPS = {  # base, highlight, shade, dark
    'tile': ((196, 82, 46), (226, 116, 70), (150, 56, 32), (100, 34, 20)),
    'tile_dark': ((172, 66, 40), (204, 98, 62), (128, 46, 28), (86, 30, 18)),
    'tile_orange': ((210, 108, 52), (236, 140, 80), (164, 78, 36), (112, 50, 22)),
    'slate': ((92, 100, 110), (124, 132, 140), (68, 74, 84), (46, 50, 58)),
    'slate_green': ((86, 108, 96), (116, 138, 120), (64, 82, 72), (42, 56, 48)),
    'thatch': ((186, 146, 82), (214, 178, 108), (148, 110, 58), (104, 76, 40)),
    'plank': ((118, 86, 58), (148, 112, 76), (90, 64, 42), (62, 44, 30)),
    'flat': ((150, 140, 122), (178, 168, 148), (118, 108, 92), (86, 78, 66)),
    'plaster': ((232, 220, 192), (246, 238, 216), (200, 186, 156), (156, 142, 114)),
    'plaster_blue': ((196, 210, 210), (220, 230, 228), (160, 176, 178), (120, 134, 138)),
    'plaster_ochre': ((222, 186, 120), (238, 208, 150), (186, 150, 90), (146, 114, 64)),
    'plaster_rose': ((222, 180, 160), (238, 204, 186), (188, 146, 128), (148, 110, 94)),
    'plaster_white': ((232, 222, 200), (246, 238, 220), (200, 188, 164), (160, 148, 126)),
    'stone': ((150, 144, 132), (182, 176, 162), (116, 110, 100), (78, 74, 68)),
    'stone_dark': ((116, 110, 100), (144, 136, 124), (90, 84, 76), (62, 58, 52)),
    'timber': ((84, 56, 36), (114, 80, 52), (62, 40, 26), (42, 28, 18)),
    'planks': ((134, 94, 60), (162, 118, 78), (104, 70, 44), (72, 48, 30)),
    'planks_red': ((150, 70, 50), (178, 96, 70), (116, 52, 38), (80, 36, 26)),
    'planks_grey': ((128, 118, 104), (156, 146, 130), (100, 92, 80), (70, 64, 56)),
    'door': ((104, 66, 40), (132, 90, 58), (80, 50, 30), (54, 34, 20)),
    'glass': ((52, 64, 80), (92, 112, 132), (38, 46, 58), (26, 30, 38)),
    'lit': ((246, 206, 120), (255, 236, 170), (214, 160, 80), (160, 110, 50)),
}
SHUTTER_RAMPS = {
    '#3f6f8f': ((64, 108, 140), (92, 136, 166), (46, 80, 106), (30, 54, 72)),
    '#5f8a4a': ((90, 132, 72), (118, 160, 96), (66, 100, 52), (44, 70, 36)),
    '#8e3b2a': ((142, 60, 42), (172, 86, 62), (108, 44, 30), (74, 30, 20)),
    '#6b5a8e': ((106, 90, 140), (134, 118, 166), (80, 66, 108), (54, 44, 74)),
    '#2f5d5a': ((48, 94, 90), (72, 122, 116), (34, 70, 66), (22, 48, 46)),
}

_PAL = None


def palette():
    """The reference palette (sampled from the house-style art) plus every ramp colour used here."""
    global _PAL
    if _PAL is None:
        import os
        ref = Image.open(os.path.join(os.path.dirname(__file__), 'palette_target.png')).getpalette()[:96 * 3]
        extra = []
        for ramp in list(RAMPS.values()) + list(SHUTTER_RAMPS.values()):
            for c in ramp: extra += list(c[:3])
        for hx in ('#cfc6b0', '#c6bda6', '#d6cdb8', '#bfb69f', '#8f826a', '#b8a888', '#cbbd9e', '#bfb091', '#d6c9ab', '#b5a687', '#8a7b60',
                   '#e8d49c', '#c9b27a', '#c9ad80', '#bf9a6d', '#9b7a52', '#7f6244', '#86b25e', '#6f9a4b', '#a3c97a', '#a5784a', '#5e4128'):
            extra += [int(hx[i:i + 2], 16) for i in (1, 3, 5)]
        extra += [124, 140, 84, 104, 122, 70, 142, 156, 96, 82, 120, 60, 96, 120, 60, 226, 178, 74, 30, 30, 30, 236, 232, 222]
        cols = (ref + extra)[:256 * 3]
        _PAL = Image.new('P', (1, 1)); _PAL.putpalette(cols + [0] * (768 - len(cols)))
    return _PAL


def jitter(c, rng, k=0.05):
    f = 1 + rng.uniform(-k, k)
    return tuple(max(0, min(255, int(v * f))) for v in c[:3]) + (255,)


def mul(c, f):
    return tuple(max(0, min(255, int(v * f))) for v in c[:3]) + (255,)


class Pix:
    def __init__(self, w, h, seed):
        self.im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        self.d = ImageDraw.Draw(self.im)
        self.rng = random.Random(seed)
        self.w, self.h = w, h

    def rect(self, x0, y0, x1, y1, c):
        if x1 < x0 or y1 < y0: return
        self.d.rectangle([x0, y0, x1, y1], fill=c if len(c) == 4 else c + (255,))

    def px(self, x, y, c):
        if 0 <= x < self.w and 0 <= y < self.h: self.im.putpixel((int(x), int(y)), c if len(c) == 4 else c + (255,))

    def line(self, pts, c, w=1):
        self.d.line(pts, fill=c if len(c) == 4 else c + (255,), width=w)

    def poly(self, pts, c):
        self.d.polygon(pts, fill=c if len(c) == 4 else c + (255,))


# ---------------------------------------------------------------- surfaces
def wall_stone(p, x0, y0, x1, y1, ramp):
    base, hi, lo, dk = ramp
    p.rect(x0, y0, x1, y1, dk)
    y = y0; row = 0
    while y <= y1:
        bh = 3 if (y1 - y) >= 3 else (y1 - y + 1)
        x = x0 - (2 if row % 2 else 0)
        while x <= x1:
            bw = p.rng.randint(4, 7)
            a, b = max(x, x0), min(x + bw - 2, x1)
            if b >= a:
                c = jitter(base, p.rng, 0.09)
                p.rect(a, y, b, min(y + bh - 2, y1), c)
                p.line([(a, y), (b, y)], mul(c, 1.16))
            x += bw
        y += bh; row += 1


def wall_plaster(p, x0, y0, x1, y1, ramp):
    base, hi, lo, dk = ramp
    p.rect(x0, y0, x1, y1, base)
    for _ in range(int((x1 - x0) * (y1 - y0) / 14)):  # grain
        p.px(p.rng.randint(x0, x1), p.rng.randint(y0, y1), jitter(base, p.rng, 0.06))
    for _ in range(max(1, (x1 - x0) // 16)):  # worn patches showing stone
        cx, cy = p.rng.randint(x0 + 2, max(x0 + 2, x1 - 6)), p.rng.randint(y0 + 2, max(y0 + 2, y1 - 4))
        p.rect(cx, cy, cx + p.rng.randint(2, 4), cy + 1, lo)
        p.px(cx + 1, cy - 1, lo)


def wall_planks(p, x0, y0, x1, y1, ramp):
    base, hi, lo, dk = ramp
    x = x0
    while x <= x1:
        c = jitter(base, p.rng, 0.08)
        p.rect(x, y0, min(x + 2, x1), y1, c)
        p.line([(x, y0), (x, y1)], mul(c, 1.12))
        if x + 3 <= x1: p.line([(x + 3, y0), (x + 3, y1)], dk)
        for yy in range(y0 + 2, y1, 7):  # grain and nails
            if p.rng.random() < 0.5: p.px(x + 1, yy, lo)
        x += 4


def timber_frame(p, x0, y0, x1, y1, posts):
    tb, th, tl, td = RAMPS['timber']
    for k in range(posts + 1):
        x = x0 + round((x1 - x0) * k / posts) - (1 if k == posts else 0)
        p.rect(x - 1, y0, x, y1, tb); p.line([(x - 1, y0), (x - 1, y1)], th)
    p.rect(x0, y0, x1, y0 + 1, tb); p.rect(x0, y1 - 1, x1, y1, tb)
    for k in range(posts):
        a = x0 + round((x1 - x0) * k / posts); b = x0 + round((x1 - x0) * (k + 1) / posts)
        if k % 2 == 0: p.line([(a + 1, y1 - 1), (b - 1, y0 + 1)], tb, 2)
        else: p.line([(a + 1, y0 + 1), (b - 1, y1 - 1)], tb, 2)


def window(p, x, y, w, h, shutter=None, lit=False, bars=False):
    glass = RAMPS['lit' if lit else 'glass']
    fb, fh, fl, fd = RAMPS['timber']
    if shutter:
        sr = SHUTTER_RAMPS.get(shutter, SHUTTER_RAMPS['#3f6f8f'])
        for sx in (x - w // 2 - 1, x + w + 1):
            p.rect(sx, y, sx + w // 2, y + h, sr[0]); p.line([(sx, y), (sx, y + h)], sr[1])
            for yy in range(y + 1, y + h, 2): p.line([(sx + 1, yy), (sx + w // 2 - 1, yy)], sr[2])
    p.rect(x - 1, y - 1, x + w, y + h, fd)
    p.rect(x, y, x + w - 1, y + h - 1, glass[0])
    p.line([(x, y), (x + w - 2, y)], glass[1]); p.px(x + 1, y + 1, glass[1])
    if bars:
        for k in range(1, 4): p.line([(x + w * k // 4, y), (x + w * k // 4, y + h - 1)], (30, 30, 30))
    else:
        p.line([(x + w // 2, y), (x + w // 2, y + h - 1)], fb); p.line([(x, y + h // 2), (x + w - 1, y + h // 2)], fb)
    p.rect(x - 2, y + h, x + w + 1, y + h + 1, RAMPS['stone'][1]); p.line([(x - 2, y + h + 1), (x + w + 1, y + h + 1)], RAMPS['stone'][2])
    if lit:
        glow = Image.new('RGBA', p.im.size, (0, 0, 0, 0))
        ImageDraw.Draw(glow).ellipse([x - w, y - h // 2, x + 2 * w, y + 3 * h // 2], fill=(255, 210, 120, 40))
        p.im.alpha_composite(glow)


def door(p, cx, base, w, h, arch=True):
    db, dh, dl, dd = RAMPS['door']
    x0 = cx - w // 2; x1 = x0 + w - 1; y0 = base - h
    sb = RAMPS['stone']
    p.rect(x0 - 2, y0 - 2, x1 + 2, base, sb[2])  # frame
    for yy in range(y0 - 2, base, 3): p.px(x0 - 2, yy, sb[1]); p.px(x1 + 2, yy, sb[3])
    p.rect(x0, y0 + (w // 2 if arch else 0), x1, base - 1, db)
    if arch: p.d.pieslice([x0, y0, x1, y0 + w], 180, 360, fill=db + (255,))
    for k in range(1, 3): p.line([(x0 + w * k // 3, y0 + 2), (x0 + w * k // 3, base - 1)], dl)
    p.line([(x0, base - h // 3), (x1, base - h // 3)], dd); p.line([(x0, base - 2 * h // 3), (x1, base - 2 * h // 3)], dd)
    p.px(x1 - 2, base - h // 2, (226, 178, 74)); p.px(x1 - 2, base - h // 2 + 1, (160, 120, 50))
    p.line([(x0, y0 + 3), (x0, base - 1)], dh)
    p.rect(x0 - 3, base, x1 + 3, base + 1, sb[1]); p.line([(x0 - 3, base + 1), (x1 + 3, base + 1)], sb[2])


def big_door(p, cx, base, w, h):
    db, dh, dl, dd = RAMPS['planks']
    x0 = cx - w // 2; x1 = x0 + w - 1; y0 = base - h
    p.rect(x0 - 1, y0 - 1, x1 + 1, base, RAMPS['timber'][0])
    p.rect(x0, y0, x1, base - 1, db)
    for x in range(x0 + 3, x1, 3): p.line([(x, y0), (x, base - 1)], dl)
    p.line([(cx, y0), (cx, base - 1)], dd)
    p.line([(x0, y0), (cx - 1, base - 1)], RAMPS['timber'][0], 2); p.line([(x1, y0), (cx + 1, base - 1)], RAMPS['timber'][0], 2)
    p.line([(x0, y0 + 1), (x1, y0 + 1)], dh)


ICON = {  # tiny pixel icons, drawn into a 6x5 board area
    'tankard': [(1, 1, 3, 4, (226, 190, 100)), (4, 2, 4, 3, (226, 190, 100)), (1, 0, 3, 0, (246, 240, 230))],
    'coin': [(1, 1, 4, 4, (232, 196, 90)), (2, 2, 3, 3, (190, 150, 60))],
    'bottle': [(2, 0, 3, 1, (110, 170, 120)), (1, 2, 4, 4, (110, 170, 120))],
    'scissors': [(1, 3, 2, 4, (220, 220, 220)), (3, 3, 4, 4, (220, 220, 220)), (2, 0, 3, 2, (220, 220, 220))],
    'pistol': [(0, 1, 4, 2, (200, 200, 200)), (3, 2, 4, 4, (140, 100, 60))],
    'anchor': [(2, 0, 3, 4, (210, 210, 210)), (1, 1, 4, 1, (210, 210, 210)), (0, 3, 1, 4, (210, 210, 210)), (4, 3, 5, 4, (210, 210, 210))],
    'fish': [(0, 2, 3, 3, (150, 200, 220)), (4, 1, 5, 4, (150, 200, 220))],
    'leaf': [(1, 1, 4, 3, (120, 160, 80)), (2, 4, 2, 4, (90, 120, 60))],
    'hammer': [(1, 0, 4, 1, (190, 190, 190)), (2, 2, 3, 4, (170, 120, 70))],
    'keg': [(1, 0, 4, 4, (140, 92, 54)), (1, 2, 4, 2, (60, 50, 40))],
    'skull': [(1, 0, 4, 3, (236, 232, 222)), (2, 1, 2, 1, (30, 30, 30)), (3, 1, 3, 1, (30, 30, 30)), (2, 4, 3, 4, (236, 232, 222))],
    'bread': [(0, 2, 5, 4, (214, 160, 90)), (1, 1, 4, 1, (230, 186, 120))],
    'cane': [(1, 0, 1, 4, (160, 200, 100)), (3, 0, 3, 4, (160, 200, 100)), (5, 1, 5, 4, (160, 200, 100))],
    'boat': [(0, 3, 5, 4, (190, 150, 100)), (2, 0, 2, 2, (240, 240, 230)), (3, 1, 4, 2, (240, 240, 230))],
}


def sign(p, x, y, icon):
    tb = RAMPS['timber']
    p.line([(x - 1, y - 2), (x + 9, y - 2)], tb[3], 1)
    p.line([(x + 1, y - 2), (x + 1, y)], tb[3]); p.line([(x + 7, y - 2), (x + 7, y)], tb[3])
    p.rect(x, y, x + 8, y + 6, tb[0]); p.line([(x, y), (x + 8, y)], tb[1])
    p.rect(x, y, x + 8, y + 6, tb[0])
    for a, b, c, d, col in ICON.get(icon, ICON['coin']):
        p.rect(x + 2 + a, y + 1 + b, x + 2 + c, y + 1 + d, col)


def lantern(p, x, y):
    p.line([(x + 1, y - 2), (x + 1, y)], RAMPS['timber'][3])
    p.rect(x, y, x + 2, y + 3, RAMPS['lit'][0]); p.px(x + 1, y + 1, RAMPS['lit'][1])
    glow = Image.new('RGBA', p.im.size, (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse([x - 5, y - 4, x + 7, y + 8], fill=(255, 210, 120, 45))
    p.im.alpha_composite(glow)


def barrel(p, x, base):
    pb = RAMPS['planks']
    p.rect(x - 3, base - 8, x + 3, base - 1, pb[0]); p.line([(x - 3, base - 8), (x - 3, base - 1)], pb[1])
    p.line([(x + 3, base - 8), (x + 3, base - 1)], pb[2])
    for yy in (base - 7, base - 3): p.line([(x - 3, yy), (x + 3, yy)], (70, 64, 58))
    p.rect(x - 2, base - 9, x + 2, base - 9, pb[1])


def crate(p, x, base):
    pb = RAMPS['planks']
    p.rect(x - 4, base - 8, x + 4, base - 1, pb[0]); p.line([(x - 4, base - 8), (x + 4, base - 8)], pb[1])
    p.line([(x - 4, base - 8), (x + 4, base - 1)], pb[2]); p.rect(x - 4, base - 8, x - 4, base - 1, pb[3]); p.rect(x + 4, base - 8, x + 4, base - 1, pb[3])


def awning(p, x0, x1, y, c1, c2):
    k = 0
    for x in range(x0, x1 + 1, 3):
        c = c1 if k % 2 == 0 else c2
        p.poly([(x, y), (x + 2, y), (x + 3, y + 5), (x + 1, y + 6), (x - 1, y + 5)], c)
        p.line([(x, y), (x + 2, y)], mul(c, 1.15))
        k += 1
    p.line([(x0 - 1, y - 1), (x1 + 2, y - 1)], RAMPS['timber'][0], 2)


def roof(p, x0, x1, y_top, y_eave, kind, hip=True):
    """Front-facing roof: dark back slope above the ridge, tiled front slope below, hip ends."""
    base, hi, lo, dk = RAMPS[kind]
    W = x1 - x0
    ridge = y_top + max(2, (y_eave - y_top) // 4)
    inset = min((y_eave - ridge) * 0.55, W * 0.12) if hip else 0
    # back slope (seen above the ridge, darker), full width at the back eave
    p.poly([(x0, y_top), (x1, y_top), (x1 - inset, ridge), (x0 + inset, ridge)], lo)
    for yy in range(y_top + 2, ridge, 2): p.line([(x0 + 2, yy), (x1 - 2, yy)], mul(lo, 0.9))
    # front slope
    p.poly([(x0, y_eave), (x0 + inset, ridge), (x1 - inset, ridge), (x1, y_eave)], base)
    rows_h = 3 if kind != 'thatch' else 2
    y = ridge + 1; row = 0
    while y < y_eave - 1:
        t = (y - ridge) / max(1, (y_eave - ridge)); xl = x0 + inset * (1 - t); xr = x1 - inset * (1 - t)
        if kind == 'thatch':
            for x in range(int(xl) + 1, int(xr)):
                if p.rng.random() < 0.55: p.line([(x, y), (x, y + p.rng.randint(1, 3))], p.rng.choice([hi, lo, base, mul(base, 0.9)]))
        elif kind == 'plank':
            for x in range(int(xl) + 1, int(xr), 3): p.line([(x, y), (x, y + rows_h)], lo)
            p.line([(xl, y), (xr, y)], mul(base, 0.92))
        else:
            tw = 4 if kind.startswith('tile') else 5
            x = xl - (tw // 2 if row % 2 else 0)
            while x < xr:
                a, b = max(int(x), int(xl) + 1), min(int(x + tw - 1), int(xr) - 1)
                if b >= a:
                    c = jitter(base, p.rng, 0.07 if kind.startswith('tile') else 0.03)
                    p.rect(a, y, b, y + rows_h - 1, c)
                    p.line([(a, y), (b, y)], mul(c, 1.18))           # sunlit top edge of each tile
                    p.line([(a, y + rows_h - 1), (b, y + rows_h - 1)], mul(c, 0.72))
                    if kind.startswith('tile'): p.px(b, y + 1, mul(c, 0.6))
                x += tw
        y += rows_h; row += 1
    # hip ends: left lit, right shaded
    if hip and inset > 1:
        p.poly([(x0, y_eave), (x0 + inset, ridge), (x0, y_top)], mul(base, 1.12))
        p.poly([(x1, y_eave), (x1 - inset, ridge), (x1, y_top)], mul(base, 0.7))
        for yy in range(y_top + 3, y_eave, 3):
            t = abs(yy - ridge) / max(1, (y_eave - ridge if yy > ridge else ridge - y_top))
            p.line([(x0 + 1, yy), (x0 + inset * (1 - t), yy)], mul(base, 0.98))
            p.line([(x1 - inset * (1 - t), yy), (x1 - 1, yy)], mul(base, 0.6))
    # moss and wear
    for _ in range(int(W / 10)):
        mx, my = p.rng.randint(x0 + 4, max(x0 + 4, x1 - 4)), p.rng.randint(ridge + 2, max(ridge + 2, y_eave - 3))
        p.px(mx, my, (96, 120, 60)); p.px(mx + 1, my, (82, 104, 52))
    p.line([(x0 + inset, ridge), (x1 - inset, ridge)], dk, 2)                         # ridge cap
    p.line([(x0 + inset, ridge - 1), (x1 - inset, ridge - 1)], hi)
    p.line([(x0, y_eave), (x1, y_eave)], dk, 2)                                       # eave
    p.line([(x0, y_eave - 2), (x1, y_eave - 2)], mul(base, 0.85))


def front_gable(p, cx, y_eave, ridge_y, gw, wall_ramp, roof_kind, shutter, lit):
    """A cross gable over the middle of the front: plaster-and-timber gable end with a window."""
    base, hi, lo, dk = RAMPS[roof_kind]
    apex = ridge_y - 4
    half = gw // 2
    p.poly([(cx - half, y_eave), (cx, apex), (cx + half, y_eave)], RAMPS[wall_ramp][0])
    for yy in range(apex + 2, y_eave, 1):
        if p.rng.random() < 0.3: p.px(p.rng.randint(cx - 3, cx + 3), yy, RAMPS[wall_ramp][2])
    tb = RAMPS['timber'][0]
    p.line([(cx, apex + 2), (cx, y_eave)], tb, 2)
    p.line([(cx - half + 3, y_eave - 1), (cx + half - 3, y_eave - 1)], tb, 2)
    window(p, cx - 3, y_eave - 11, 6, 7, None, lit)
    # barge boards: thick tiled edges
    for sgn in (-1, 1):
        x_end = cx + sgn * (half + 2)
        p.line([(cx, apex - 1), (x_end, y_eave + 1)], dk, 4)
        p.line([(cx, apex - 2), (x_end, y_eave)], base, 2)
        p.line([(cx, apex - 3), (x_end, y_eave - 1)], hi if sgn < 0 else lo, 1)


def chimney(p, x, y_base, h):
    sb = RAMPS['stone']
    wall_stone(p, x, y_base - h, x + 5, y_base, sb)
    p.rect(x - 1, y_base - h - 2, x + 6, y_base - h - 1, sb[3]); p.line([(x - 1, y_base - h - 2), (x + 6, y_base - h - 2)], sb[1])


def outline_and_finish(im):
    a = np.asarray(im.getchannel('A')) > 0
    from scipy.ndimage import binary_dilation
    ring = binary_dilation(a, iterations=1) & ~a
    arr = np.asarray(im).copy()
    arr[ring] = OUTLINE + (255,)
    return Image.fromarray(arr, 'RGBA')


def light_gradient(im, x0, x1):
    """Sun from the left: facade a touch brighter on the left, darker on the right."""
    arr = np.asarray(im).astype(np.float32)
    W = arr.shape[1]
    g = np.clip(1.04 - 0.1 * (np.arange(W) - x0) / max(1, (x1 - x0)), 0.93, 1.04)
    arr[..., :3] *= g[None, :, None]
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), 'RGBA')


def quantise(im):
    rgb = Image.new('RGB', im.size, (0, 0, 0)); rgb.paste(im, (0, 0), im)
    q = rgb.quantize(palette=palette(), dither=Image.Dither.NONE).convert('RGB')
    q.putalpha(im.getchannel('A'))
    return q


def gable_roof(p, x0, x1, y_eave, gable_h, depth, kind, wall_ramp, timber, shutter, lit):
    """Roof with its ridge running away from the camera: a gable end faces us (wall material, with
    a window), and both roof slopes recede up and back from its edges. Left slope lit, right shaded."""
    base, hi, lo, dk = RAMPS[kind]
    cx = (x0 + x1) // 2
    ov = 3
    apex = y_eave - gable_h
    L0, L1 = (x0 - ov, y_eave + 1), (cx, apex - 1)
    R0 = (x1 + ov, y_eave + 1)
    left = [L0, L1, (cx, apex - 1 - depth), (x0 - ov, y_eave + 1 - depth)]
    right = [R0, L1, (cx, apex - 1 - depth), (x1 + ov, y_eave + 1 - depth)]
    for poly_, col, rowcol in ((right, mul(base, 0.8), mul(base, 0.6)), (left, mul(base, 1.08), mul(base, 0.82))):
        layer = Image.new('RGBA', p.im.size, (0, 0, 0, 0)); ld = ImageDraw.Draw(layer)
        ld.polygon(poly_, fill=col)
        m = Image.new('L', p.im.size, 0); ImageDraw.Draw(m).polygon(poly_, fill=255)
        tiles = Image.new('RGBA', p.im.size, (0, 0, 0, 0)); td = ImageDraw.Draw(tiles)
        if kind == 'thatch':
            for _ in range(int(abs(x1 - x0) * depth / 6)):
                tx = p.rng.randint(min(x0, x1) - ov, max(x0, x1) + ov); ty = p.rng.randint(apex - depth - 2, y_eave + 1)
                td.line([(tx, ty), (tx, ty + 2)], fill=p.rng.choice([mul(base, 0.85), mul(base, 1.15), col]))
        else:
            for k in range(-depth - gable_h, depth + 4, 3):  # rows of tiles parallel to the slope's front edge
                a, b = poly_[0], poly_[1]
                td.line([(a[0], a[1] - k), (b[0], b[1] - k)], fill=rowcol, width=1)
                td.line([(a[0], a[1] - k - 1), (b[0], b[1] - k - 1)], fill=mul(col, 1.14), width=1)
            for j in range(0, depth + gable_h, 5):  # staggered joints
                for t in range(0, 12):
                    fx = a[0] + (b[0] - a[0]) * t / 12; fy = a[1] + (b[1] - a[1]) * t / 12 - j
                    td.point((fx, fy - (t % 2)), fill=rowcol)
        layer.alpha_composite(tiles); layer.putalpha(Image.fromarray(np.minimum(np.asarray(layer.getchannel('A')), np.asarray(m))))
        p.im.alpha_composite(layer)
        p.d = ImageDraw.Draw(p.im)
        p.line(poly_ + [poly_[0]], dk)  # outline each slope
    # gable end (wall material + timber + window)
    tri = [(x0, y_eave), (cx, apex + 2), (x1, y_eave)]
    p.poly(tri, RAMPS[wall_ramp][0])
    for _ in range(gable_h * abs(x1 - x0) // 10):
        tx, ty = p.rng.randint(x0, x1), p.rng.randint(apex + 2, y_eave)
        if p.im.getpixel((tx, ty))[:3] == RAMPS[wall_ramp][0]: p.px(tx, ty, jitter(RAMPS[wall_ramp][0], p.rng, 0.06))
    if timber:
        tb = RAMPS['timber'][0]
        p.line([(cx, apex + 3), (cx, y_eave)], tb, 2)
        p.line([(x0 + 4, y_eave - 2), (x1 - 4, y_eave - 2)], tb, 2)
        p.line([((x0 + cx) // 2, y_eave - 2), (cx - 2, apex + gable_h // 2)], tb, 2)
        p.line([((x1 + cx) // 2, y_eave - 2), (cx + 2, apex + gable_h // 2)], tb, 2)
    ww, wh = int(1.4 * PPU), int(1.7 * PPU)
    if gable_h > wh + 8: window(p, cx - ww // 2, y_eave - wh - 6, ww, wh, shutter, lit)
    # barge boards along the front edges + outline
    for e in ((L0, L1), (R0, L1)):
        p.line([e[0], e[1]], dk, 3); p.line([(e[0][0], e[0][1] - 2), (e[1][0], e[1][1] - 2)], hi if e[0][0] < cx else lo, 1)
    p.line([(cx, apex - 2), (cx, apex - 1 - depth)], hi, 2)  # ridge running back
    p.line([(x0 - ov, y_eave + 2), (x1 + ov, y_eave + 2)], dk, 1)


def porch(p, x0, x1, y, kind):
    """A small tiled lean-to over the door on two posts."""
    base, hi, lo, dk = RAMPS[kind]
    p.poly([(x0 - 2, y + 6), (x0 + 2, y), (x1 - 2, y), (x1 + 2, y + 6)], base)
    for yy in range(y + 1, y + 6, 2): p.line([(x0, yy), (x1, yy)], mul(base, 0.75))
    p.line([(x0 + 2, y), (x1 - 2, y)], hi); p.line([(x0 - 2, y + 6), (x1 + 2, y + 6)], dk, 2)
    for x in (x0, x1 - 1): p.rect(x, y + 7, x + 1, y + 7 + int(3.6 * PPU), RAMPS['timber'][0])


def flower_box(p, x, y, w):
    p.rect(x - 1, y, x + w, y + 2, RAMPS['timber'][1]); p.line([(x - 1, y + 2), (x + w, y + 2)], RAMPS['timber'][3])
    for k in range(0, w, 2):
        p.px(x + k, y - 1, p.rng.choice([(214, 92, 120), (240, 200, 80), (236, 232, 222), (150, 100, 190)]))
        p.px(x + k + 1, y - 1, (86, 130, 60))


def weather(p, x0, y0, x1, y1):
    """Eave shadow at the top of the wall, grime at its foot."""
    arr = np.asarray(p.im).astype(np.float32)
    for k, f in enumerate((0.55, 0.7, 0.85)):
        yy = y0 + k
        if 0 <= yy < arr.shape[0]: arr[yy, x0:x1 + 1, :3] *= f
    for k in range(6):
        yy = y1 - k
        if 0 <= yy < arr.shape[0]: arr[yy, x0:x1 + 1, :3] *= 0.86 + k * 0.025
    p.im = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), 'RGBA'); p.d = ImageDraw.Draw(p.im)


# ---------------------------------------------------------------- buildings
def building(s):
    rng_seed = s.get('seed', 1)
    if s.get('shape') == 'lighthouse': return lighthouse(s)
    if s.get('shape') == 'tower': return tower(s)
    if s.get('shape') == 'ruin': return ruin(s)
    w, d = s['w'], s['d']; st = s.get('storeys', 1)
    eave = 4
    WW = int(w * PPU)
    W = WW + 2 * eave
    storey = int(6.2 * PPU)
    wall_h = storey * st
    gable = s.get('massing') == 'gable'
    if gable:
        gable_h = int(WW * 0.4); depth = int(max(3.0, d * 0.32) * PPU)
        roof_h = gable_h + depth + 3
    else:
        roof_h = int(max(4.6, d * 0.5) * PPU) + (6 if st > 1 else 0)
    extra = int(4 * PPU) if s.get('chimney_tall') else 10
    H = extra + roof_h + wall_h + 6
    p = Pix(W + 2, H, rng_seed)
    y_roof = extra
    y_eave = y_roof + roof_h
    wy0 = y_eave - 2; wy1 = wy0 + wall_h
    x0, x1 = eave, eave + WW - 1
    wall = s.get('wall', 'plaster')
    # ---- walls
    for k in range(st):
        a, b = wy0 + k * storey, wy0 + (k + 1) * storey - 1
        ground = (k == st - 1)
        mat = wall
        if wall == 'timber': mat = 'stone' if (ground and st > 1) else 'plaster'
        if mat.startswith('stone'): wall_stone(p, x0, a, x1, b, RAMPS[mat])
        elif mat.startswith('planks'): wall_planks(p, x0, a, x1, b, RAMPS[mat])
        else: wall_plaster(p, x0, a, x1, b, RAMPS[mat])
        if wall == 'timber' and mat == 'plaster': timber_frame(p, x0, a, x1, b, max(2, WW // 20))
        if k < st - 1: p.rect(x0, b - 1, x1, b + 1, RAMPS['timber'][0]); p.line([(x0, b - 1), (x1, b - 1)], RAMPS['timber'][1])
    # corner quoins / posts
    for cx_ in (x0, x1 - 2):
        if wall.startswith('stone') or wall == 'timber':
            for yy in range(wy0, wy1, 4): p.rect(cx_, yy, cx_ + 2, yy + 2, jitter(RAMPS['stone'][1], p.rng, 0.04))
        elif wall.startswith('planks'): p.rect(cx_, wy0, cx_ + 2, wy1, RAMPS['timber'][0])
    if s.get('crenel'):
        n = max(3, WW // 10)
        for k in range(0, n, 2):
            a = x0 + WW * k // n; b = x0 + WW * (k + 1) // n - 1
            wall_stone(p, a, wy0 - 7, b, wy0, RAMPS['stone'])
    p.rect(x0, wy1 - 2, x1, wy1, RAMPS['stone'][2]); p.line([(x0, wy1 - 2), (x1, wy1 - 2)], RAMPS['stone'][1])  # plinth
    weather(p, x0, wy0, x1, wy1)
    # ---- windows, door, sign
    cx = x0 + int(WW * s.get('door_at', 0.5))
    door_on = s.get('door', True)
    ww, wh = int(1.6 * PPU), int(2.0 * PPU)
    for k in range(st):
        a = wy0 + k * storey
        n = max(1, int(w / 5.4))
        for j in range(n):
            x = x0 + int(WW * (j + 0.5) / n) - ww // 2
            if k == st - 1 and (door_on or s.get('big_door')) and abs(x + ww // 2 - cx) < (int(3.2 * PPU) if not s.get('big_door') else int(min(w * 0.4, 6) * PPU / 2 + 6)): continue
            wy_ = a + (11 if k == st - 1 else 8)
            window(p, x, wy_, ww, wh, s.get('shutters'), s.get('lit', False), s.get('bars', False))
            if s.get('flowers') and k == 0 and st > 1: flower_box(p, x - 1, wy_ + wh + 2, ww + 1)
            elif s.get('flowers') and st == 1 and j % 2 == 0: flower_box(p, x - 1, wy_ + wh + 2, ww + 1)
    base = wy1 - 2
    if s.get('big_door'):
        big_door(p, cx, base, int(min(w * 0.4, 6) * PPU), int(min(5.4 * 0.85, 4.4) * PPU))
    elif door_on:
        door(p, cx, base, int(2.3 * PPU), int(3.7 * PPU))
    if s.get('awning'):
        c1, c2 = s['awning']
        h2 = lambda h: tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
        awning(p, x0 + 3, x1 - 4, base - int(4.6 * PPU), h2(c1), h2(c2))
    if s.get('porch') and (door_on or s.get('big_door')):
        porch(p, cx - int(2.6 * PPU), cx + int(2.6 * PPU), base - int(5.0 * PPU), s.get('roof', 'tile') if s.get('roof', 'tile').startswith(('tile', 'slate')) else 'tile')
    if s.get('sign'):
        sign(p, cx - int(2.4 * PPU) - 9, base - int(4.6 * PPU), s['sign'])
    if s.get('lanterns'):
        lantern(p, cx - int(2.2 * PPU), base - int(3.6 * PPU)); lantern(p, cx + int(2.2 * PPU) - 2, base - int(3.6 * PPU))
    if s.get('columns'):
        for x in (cx - int(3.2 * PPU), cx + int(3.2 * PPU)):
            p.rect(x - 2, wy0 + 4, x + 2, base, RAMPS['plaster_white'][0]); p.line([(x - 2, wy0 + 4), (x - 2, base)], RAMPS['plaster_white'][1])
            p.line([(x + 2, wy0 + 4), (x + 2, base)], RAMPS['plaster_white'][2])
    if s.get('wheel'):
        wx, wyc, r = x0 + 3, base - 16, 15
        p.d.ellipse([wx - r, wyc - r, wx + r, wyc + r], outline=RAMPS['timber'][0] + (255,), width=3)
        for k in range(8):
            a = k * math.pi / 4; p.line([(wx, wyc), (wx + r * math.cos(a), wyc + r * math.sin(a))], RAMPS['timber'][0], 2)
    for side, what in s.get('base_props', []):
        x = x0 + 5 if side == 'L' else x1 - 5
        (barrel if what == 'barrel' else crate)(p, x, base + 2)
    # ---- roof
    rk = s.get('roof', 'tile')
    if rk != 'none':
        if rk == 'flat':
            wall_stone(p, x0 - 2, y_roof + roof_h // 2, x1 + 2, y_eave, RAMPS['stone'])
        elif gable:
            gable_roof(p, x0, x1, y_eave, gable_h, depth, rk, 'plaster' if not wall.startswith(('stone', 'planks')) else ('stone' if wall.startswith('stone') else wall),
                       wall == 'timber' or s.get('timber_gable', False), s.get('shutters'), s.get('lit', False))
        else:
            roof(p, 0, W - 1, y_roof, y_eave, rk)
            p.line([(0, y_eave), (0, y_roof), (W - 1, y_roof), (W - 1, y_eave)], OUTLINE[:3] + (255,))
            if s.get('gable') or (st > 1 and w >= 22 and rk.startswith('tile')):
                front_gable(p, cx, y_eave, y_roof + max(2, roof_h // 4), min(int(WW * 0.42), int(11 * PPU)), 'plaster' if wall != 'stone' else 'stone', rk, s.get('shutters'), s.get('lit', False))
    if s.get('chimney') or s.get('chimney_tall'):
        ch = int(3.5 * PPU) + roof_h // 3 if s.get('chimney_tall') else 12
        chimney(p, int(W * (0.3 if gable else 0.72)), y_roof + (roof_h // 2 if gable else roof_h // 3), ch)
    if s.get('flag'):
        fx = int(W * 0.25); fy = y_roof + 2
        p.line([(fx, fy), (fx, fy - 26)], RAMPS['timber'][3], 1)
        h2 = tuple(int(s['flag'][i:i + 2], 16) for i in (1, 3, 5))
        p.poly([(fx + 1, fy - 26), (fx + 14, fy - 22), (fx + 1, fy - 17)], h2)
    im = light_gradient(p.im, 0, W)
    im = quantise(im)
    im = outline_and_finish(im)
    return finish(im, base_px=base + 3)


def lighthouse(s):
    w = s['w']; WW = int(w * PPU); W = WW + 8; Ht = int(26 * PPU)
    p = Pix(W, Ht + 40, 5)
    x0 = 4; top = 30; bot = top + Ht
    for y in range(top, bot):
        t = (y - top) / Ht; inset = int(WW * 0.18 * (1 - t))
        band = int(t * 5) % 2 == 1
        ramp = RAMPS['tile'] if band else RAMPS['plaster_white']
        a, b = x0 + inset, x0 + WW - 1 - inset
        p.line([(a, y), (b, y)], ramp[0]); p.px(a, y, ramp[1]); p.px(a + 1, y, ramp[1]); p.line([(b - 3, y), (b, y)], ramp[2])
    p.rect(x0 + 2, top - 4, x0 + WW - 3, top, RAMPS['stone_dark'][0])  # gallery
    for x in range(x0 + 3, x0 + WW - 3, 3): p.line([(x, top - 9), (x, top - 4)], RAMPS['stone_dark'][3])
    p.rect(x0 + WW // 4, top - 18, x0 + 3 * WW // 4, top - 5, RAMPS['lit'][1])
    p.poly([(x0 + WW // 4 - 2, top - 18), (x0 + WW // 2, top - 28), (x0 + 3 * WW // 4 + 2, top - 18)], RAMPS['slate'][0])
    window(p, x0 + WW // 2 - 3, top + Ht // 2, 6, 8)
    door(p, x0 + WW // 2, bot - 1, int(2.2 * PPU), int(3.5 * PPU))
    glow = Image.new('RGBA', p.im.size, (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse([x0 + WW // 4 - 4, top - 22, x0 + 3 * WW // 4 + 4, top - 1], fill=(255, 220, 140, 40))
    im = quantise(p.im); im.alpha_composite(glow)
    return finish(outline_and_finish(im), base_px=bot + 2)


def tower(s):
    w = s['w']; WW = int(w * PPU); W = WW + 6; Ht = int(s.get('height', 14) * PPU)
    p = Pix(W, Ht + 40, 6); x0 = 3; top = 34; bot = top + Ht
    mat = s.get('wall', 'stone')
    (wall_planks if mat.startswith('planks') else wall_stone)(p, x0, top, x0 + WW - 1, bot, RAMPS[mat])
    n = max(3, WW // 8)
    for k in range(0, n, 2):
        a = x0 + WW * k // n; b = x0 + WW * (k + 1) // n - 1
        (wall_planks if mat.startswith('planks') else wall_stone)(p, a, top - 7, b, top, RAMPS[mat])
    window(p, x0 + WW // 2 - 3, top + 10, 6, 9)
    if s.get('door', True): door(p, x0 + WW // 2, bot - 1, int(2.1 * PPU), int(3.3 * PPU))
    if s.get('flag'):
        fx = x0 + WW // 2; p.line([(fx, top - 7), (fx, top - 32)], RAMPS['timber'][3])
        h2 = tuple(int(s['flag'][i:i + 2], 16) for i in (1, 3, 5)); p.poly([(fx + 1, top - 32), (fx + 14, top - 28), (fx + 1, top - 23)], h2)
    im = light_gradient(p.im, x0, x0 + WW)
    return finish(outline_and_finish(quantise(im)), base_px=bot + 2)


def ruin(s):
    w, d = s['w'], s['d']; WW = int(w * PPU); W = WW + 6; R = int(d * 0.46 * PPU); Hw = int(4 * PPU)
    p = Pix(W, R + Hw + 30, 9); x0 = 3; top = 20
    p.rect(x0, top, x0 + WW - 1, top + R, (124, 140, 84))
    for _ in range(WW * R // 6):
        p.px(p.rng.randint(x0, x0 + WW - 1), p.rng.randint(top, top + R), p.rng.choice([(104, 122, 70), (142, 156, 96), (150, 140, 122)]))
    wall_stone(p, x0, top - 4, x0 + WW - 1, top + 2, RAMPS['stone_dark'])
    wall_stone(p, x0, top, x0 + 6, top + R + Hw, RAMPS['stone_dark']); wall_stone(p, x0 + WW - 7, top, x0 + WW - 1, top + R + Hw, RAMPS['stone_dark'])
    y_front = top + R
    for x in range(x0, x0 + WW):
        k = (x - x0) / WW
        broken = 0.25 < k < 0.75
        hgt = Hw if not broken else int(Hw * p.rng.uniform(0.15, 0.6))
        p.line([(x, y_front + Hw - hgt), (x, y_front + Hw)], jitter(RAMPS['stone'][0], p.rng, 0.08))
    wall_stone(p, x0, y_front, x0 + int(WW * 0.25), y_front + Hw, RAMPS['stone']); wall_stone(p, x0 + int(WW * 0.75), y_front, x0 + WW - 1, y_front + Hw, RAMPS['stone'])
    for _ in range(8):
        vx = p.rng.randint(x0, x0 + WW - 1); vy = p.rng.randint(y_front, y_front + Hw - 4)
        p.line([(vx, vy), (vx + p.rng.randint(-2, 2), vy + 5)], (82, 120, 60), 2)
    im = light_gradient(p.im, x0, x0 + WW)
    return finish(outline_and_finish(quantise(im)), base_px=y_front + Hw + 2)


def finish(im, base_px):
    """Trim, add a soft contact shadow under/right, and double the pixels."""
    bb = im.getbbox()
    top = bb[1] if bb else 0
    im = im.crop((0, top, im.size[0], min(im.size[1], base_px + 3)))
    W, H = im.size
    sh = Image.new('RGBA', (W + 8, H + 4), (0, 0, 0, 0))
    ImageDraw.Draw(sh).ellipse([6, H - 6, W + 6, H + 2], fill=(20, 14, 8, 70))
    sh.alpha_composite(im, (0, 0))
    out = sh.resize((sh.size[0] * UPSCALE, sh.size[1] * UPSCALE), Image.NEAREST)
    return out, sh.size[0] / PPU  # image and its width in world units


def render(spec, out_path):
    im, width_units = building(spec)
    im.save(out_path)
    return width_units
