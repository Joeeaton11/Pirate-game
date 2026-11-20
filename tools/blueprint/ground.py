"""Coded ground art for the Art map: textured grass, sand, woodland floor, water, dirt roads with
wheel ruts, cobbled lanes, worn footpaths, flagstone squares, plank docks and bridges.

Every surface is a colour field with soft noise (so it never looks flat), plus a pattern clipped
to the surface's shape. Same light as the buildings: sun upper left, shade lower right."""
import math, random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageChops
from shapely.geometry import LineString, Polygon


def hexrgb(h): return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


class Painter:
    def __init__(self, im, T, S, seed=3):
        self.im, self.T, self.S = im, T, S
        self.rng = random.Random(seed)
        self.nrng = np.random.default_rng(seed)
        self.size = im.size

    # ---- masks and noise
    def mask(self, geoms=(), lines=(), rects=()):
        m = Image.new('L', self.size, 0); d = ImageDraw.Draw(m)
        for g in geoms:
            for p in ([g] if g.geom_type == 'Polygon' else list(getattr(g, 'geoms', []))):
                if p.geom_type != 'Polygon' or p.is_empty: continue
                d.polygon([self.T(*c) for c in p.exterior.coords], fill=255)
                for h in p.interiors: d.polygon([self.T(*c) for c in h.coords], fill=0)
        for pts, w in lines:
            d.line([self.T(*p) for p in pts], fill=255, width=max(1, int(w * self.S)), joint='curve')
            r = w * self.S / 2
            for p in pts:
                x, y = self.T(*p); d.ellipse([x - r, y - r, x + r, y + r], fill=255)
        for l, t, r, b in rects:
            d.rectangle([self.T(l, t), self.T(r, b)], fill=255)
        return m

    def noise(self, scale, amp, size=None):
        """Smooth noise in [-amp, amp] at feature size `scale` (world units)."""
        w, h = size or self.size
        cw, ch = max(2, int(w / (scale * self.S))), max(2, int(h / (scale * self.S)))
        small = self.nrng.random((ch, cw)).astype(np.float32)
        big = Image.fromarray((small * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
        return (np.asarray(big).astype(np.float32) / 255 - 0.5) * 2 * amp

    def fill(self, mask, colour, variation=0.06, scales=(18, 5)):
        """Colour field with soft two-scale noise, composited through mask (only over its bbox)."""
        bb = mask.getbbox()
        if not bb: return
        x0, y0, x1, y1 = bb; w, h = x1 - x0, y1 - y0
        base = np.array(hexrgb(colour), np.float32)
        k = 1 + self.noise(scales[0], variation, (w, h)) + self.noise(scales[1], variation * 0.5, (w, h))
        rgb = np.clip(base[None, None, :] * k[..., None], 0, 255).astype(np.uint8)
        layer = Image.fromarray(rgb, 'RGB').convert('RGBA'); layer.putalpha(mask.crop(bb))
        self.im.alpha_composite(layer, (x0, y0))

    def pattern(self, mask, draw_fn, blur=0):
        """Draw strokes on a transparent layer, then keep them only inside mask."""
        bb = mask.getbbox()
        if not bb: return
        layer = Image.new('RGBA', self.size, (0, 0, 0, 0))
        draw_fn(ImageDraw.Draw(layer))
        layer = layer.crop(bb)
        if blur: layer = layer.filter(ImageFilter.GaussianBlur(blur))
        layer.putalpha(ImageChops.multiply(layer.getchannel('A'), mask.crop(bb)))
        self.im.alpha_composite(layer, bb[:2])

    def scatter(self, geom, density):
        """Random points inside geom, `density` per 100 square units."""
        out = []
        if geom.is_empty: return out
        l, t, r, b = geom.bounds
        n = int(geom.area / 100 * density)
        from shapely.prepared import prep
        pg = prep(geom)
        from shapely.geometry import Point
        tries = 0
        while len(out) < n and tries < n * 4:
            tries += 1
            x, y = self.rng.uniform(l, r), self.rng.uniform(t, b)
            if pg.contains(Point(x, y)): out.append((x, y))
        return out

    # ---- surfaces
    def grass(self, geom, colour='#86b25e'):
        m = self.mask([geom]); self.fill(m, colour, 0.07)
        dark, light = hexrgb('#6f9a4b'), hexrgb('#a3c97a')
        pts = self.scatter(geom, 9)
        S = self.S
        def tufts(d):
            for x, y in pts:
                X, Y = self.T(x, y); c = dark if self.rng.random() < 0.6 else light
                for k in (-1, 0, 1):
                    d.line([X + k * 0.5 * S, Y, X + k * 0.9 * S, Y - self.rng.uniform(0.9, 1.6) * S], fill=c + (200,), width=max(1, S // 3))
            for x, y in self.scatter(geom, 1.2):  # flowers
                X, Y = self.T(x, y); c = self.rng.choice(['#f4e9cd', '#f2c230', '#e8a0b4', '#c9b3e6'])
                d.ellipse([X - 0.35 * S, Y - 0.35 * S, X + 0.35 * S, Y + 0.35 * S], fill=hexrgb(c) + (230,))
        self.pattern(m, tufts)

    def sand(self, geom, water_edge=None):
        m = self.mask([geom]); self.fill(m, '#e8d49c', 0.05, (10, 2.5))
        S = self.S
        def grain(d):
            for x, y in self.scatter(geom, 30):
                X, Y = self.T(x, y); d.point((X, Y), fill=hexrgb(self.rng.choice(['#cdb57a', '#f5e6b8', '#d9c48a'])) + (255,))
            for x, y in self.scatter(geom, 0.8):  # shells and pebbles
                X, Y = self.T(x, y)
                d.ellipse([X - 0.45 * S, Y - 0.3 * S, X + 0.45 * S, Y + 0.3 * S], fill=hexrgb(self.rng.choice(['#f4ede0', '#b9ad98', '#e9c4b0'])) + (255,), outline=(120, 100, 70, 160))
        self.pattern(m, grain)
        if water_edge is not None:  # damp sand along the waterline
            wet = geom.intersection(water_edge.buffer(4))
            if not wet.is_empty:
                self.fill(self.mask([wet]).filter(ImageFilter.GaussianBlur(2 * S)), '#c9b27a', 0.03)

    def woodland(self, geom, colour):
        m = self.mask([geom]); self.fill(m, colour, 0.09, (14, 4))
        S = self.S
        leaf = [hexrgb(c) for c in ('#2f5e2b', '#5a8a43', '#6e6a36', '#3b6a34')]
        def litter(d):
            for x, y in self.scatter(geom, 14):
                X, Y = self.T(x, y); c = self.rng.choice(leaf)
                a = self.rng.uniform(0, math.pi)
                d.line([X, Y, X + math.cos(a) * 0.9 * S, Y + math.sin(a) * 0.9 * S], fill=c + (220,), width=max(1, S // 2))
            for x, y in self.scatter(geom, 1.5):  # ferns
                X, Y = self.T(x, y)
                for k in range(5):
                    a = -math.pi / 2 + (k - 2) * 0.5
                    d.line([X, Y, X + math.cos(a) * 1.8 * S, Y + math.sin(a) * 1.8 * S], fill=hexrgb('#4f8a45') + (230,), width=max(1, S // 2))
        self.pattern(m, litter)

    def water(self, geom):
        S = self.S
        bank = self.mask([geom.buffer(1.2)])
        self.fill(bank, '#3b7f9e', 0.03)
        m = self.mask([geom])
        bb = m.getbbox()
        if not bb: return
        mc = m.crop(bb)
        # deeper in the middle: distance from the bank
        from scipy.ndimage import distance_transform_edt
        dist = distance_transform_edt(np.asarray(mc) > 0) / S
        depth = np.clip(dist / 6, 0, 1)
        lo, hi = np.array(hexrgb('#6cc0dd'), np.float32), np.array(hexrgb('#2f7ea6'), np.float32)
        rgb = (lo + (hi - lo) * depth[..., None]) * (1 + self.noise(6, 0.04, mc.size))[..., None]
        layer = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8), 'RGB').convert('RGBA'); layer.putalpha(mc)
        self.im.alpha_composite(layer, bb[:2])
        def ripples(d):
            for x, y in self.scatter(geom, 6):
                X, Y = self.T(x, y); L = self.rng.uniform(1, 2.4) * S
                d.line([X - L / 2, Y, X + L / 2, Y], fill=(230, 248, 255, 150), width=max(1, S // 3))
        self.pattern(m, ripples)
        edge = self.mask([geom.boundary.buffer(0.45)])  # foam at the bank
        self.pattern(ImageChops.multiply(edge, bank), lambda d: d.rectangle([0, 0, *self.size], fill=(240, 250, 250, 140)))

    def road(self, pts, width, kind):
        S = self.S
        edge = self.mask(lines=[(pts, width + 1.2)])
        self.fill(edge, '#7f6244', 0.05)
        m = self.mask(lines=[(pts, width)])
        if kind == 'main':
            self.fill(m, '#bf9a6d', 0.07, (12, 3))
            ln = LineString(pts)
            def ruts(d):
                for off in (-width * 0.22, width * 0.22):
                    o = ln.parallel_offset(abs(off), 'left' if off < 0 else 'right', join_style=1)
                    for g in getattr(o, 'geoms', [o]):
                        if g.is_empty: continue
                        d.line([self.T(*c) for c in g.coords], fill=hexrgb('#9b7a52') + (200,), width=max(1, int(0.55 * S)))
                for x, y in self.scatter(ln.buffer(width / 2), 6):
                    X, Y = self.T(x, y); d.ellipse([X - 0.3 * S, Y - 0.25 * S, X + 0.3 * S, Y + 0.25 * S], fill=hexrgb(self.rng.choice(['#a08766', '#d6bf98', '#8a7458'])) + (230,))
            self.pattern(m, ruts)
        elif kind == 'lane':
            self.fill(m, '#b8a888', 0.05)
            geom = LineString(pts).buffer(width / 2)
            self.cobbles(geom, m, 1.1)
        else:  # footpath: worn earth, soft grass fringe
            soft = m.filter(ImageFilter.GaussianBlur(0.6 * S))
            self.fill(soft, '#c9ad80', 0.08, (8, 2))
            def steps(d):
                for x, y in self.scatter(LineString(pts).buffer(width / 2.5), 5):
                    X, Y = self.T(x, y); d.ellipse([X - 0.25 * S, Y - 0.2 * S, X + 0.25 * S, Y + 0.2 * S], fill=hexrgb('#a98d62') + (200,))
            self.pattern(m, steps)

    def cobbles(self, geom, m, size):
        S = self.S
        l, t, r, b = geom.bounds
        def stones(d):
            row = 0
            y = t
            while y < b:
                x = l - (size / 2 if row % 2 else 0)
                while x < r:
                    w = size * self.rng.uniform(0.85, 1.15)
                    c = hexrgb(self.rng.choice(['#cbbd9e', '#bfb091', '#d6c9ab', '#b5a687']))
                    X0, Y0 = self.T(x + 0.08, y + 0.08); X1, Y1 = self.T(x + w - 0.08, y + size * 0.8 - 0.08)
                    d.rounded_rectangle([X0, Y0, X1, Y1], radius=int(0.25 * S), fill=c + (255,), outline=hexrgb('#8a7b60') + (255,), width=max(1, S // 4))
                    d.line([X0 + S * 0.2, Y0 + S * 0.15, X1 - S * 0.3, Y0 + S * 0.15], fill=(255, 255, 255, 70), width=max(1, S // 4))
                    x += w
                y += size * 0.8; row += 1
        self.pattern(m, stones)

    def flagstones(self, l, t, r, b):
        S = self.S
        m = self.mask(rects=[(l, t, r, b)])
        self.fill(m, '#cfc3a6', 0.04)
        def slabs(d):
            y = t; row = 0
            while y < b:
                x = l + (1.2 if row % 2 else 0); hgt = self.rng.uniform(2.2, 3)
                d.rectangle([self.T(l, y), self.T(l + (1.2 if row % 2 else 0), y + hgt)], fill=hexrgb('#c6b999') + (255,), outline=hexrgb('#8f826a') + (255,), width=max(1, S // 4))
                while x < r:
                    w = self.rng.uniform(2.4, 3.6)
                    c = hexrgb(self.rng.choice(['#d8ccb0', '#cbbf9f', '#ded3b9', '#c3b696']))
                    d.rectangle([self.T(x, y), self.T(min(x + w, r), y + hgt)], fill=c + (255,), outline=hexrgb('#8f826a') + (255,), width=max(1, S // 4))
                    x += w
                y += hgt; row += 1
        self.pattern(m, slabs)
        edge = self.mask(rects=[(l - 0.7, t - 0.7, r + 0.7, b + 0.7)])
        self.pattern(ImageChops.subtract(edge, m), lambda d: d.rectangle([0, 0, *self.size], fill=hexrgb('#8f7d5e') + (255,)))

    def planks(self, geom, along_angle, colour='#a5784a'):
        """Boards laid across the direction of travel, with darker gaps and nail heads."""
        S = self.S
        m = self.mask([geom]); self.fill(m, colour, 0.05, (6, 2))
        l, t, r, b = geom.bounds
        L = math.hypot(r - l, b - t) + 10
        ca, sa = math.cos(along_angle), math.sin(along_angle)
        cx, cy = (l + r) / 2, (t + b) / 2
        def boards(d):
            k = -L / 2
            while k < L / 2:
                x0, y0 = cx + ca * k, cy + sa * k
                p0 = (x0 - sa * L / 2, y0 + ca * L / 2); p1 = (x0 + sa * L / 2, y0 - ca * L / 2)
                d.line([self.T(*p0), self.T(*p1)], fill=hexrgb('#5e4128') + (230,), width=max(1, S // 3))
                k += 1.1
        self.pattern(m, boards)
        rim = ImageChops.subtract(self.mask([geom.buffer(0.35)]), m)
        self.pattern(rim, lambda d: d.rectangle([0, 0, *self.size], fill=hexrgb('#4a3018') + (255,)))
