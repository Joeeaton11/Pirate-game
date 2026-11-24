"""Bakes a painted ground area (curvy paths, grass, wharf, shallows) from a JSON description into
image chunks + a generated TS module the town scene loads.

    python3 tools/town/bake_ground.py src/town/ground/tortugaHarbour.json

Each layer fills its shapes with a seamless texture (assets/sprites/tortuga_town/style2/<tex>.png,
or the town cobble) at 1 texture pixel per output pixel, with pixel-art edges:
  rough = ragged, blocky noise edge + darker rim   soft = feathered (water)   hard = straight
Outputs assets/sprites/tortuga_town/style2/baked/<name>_<i>_<j>.png and src/town/ground/<name>.generated.ts
(chunk list + walk-blocking rects + wall strips). Re-run after any edit; nothing else changes.
"""
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage
from shapely.geometry import LineString, Polygon

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
STYLE = os.path.join(ROOT, 'assets/sprites/tortuga_town/style2')
TEX_FILES = {'cobble': os.path.join(ROOT, 'assets/sprites/tortuga_town/cobble.png')}


def catmull(pts, n=12):
    if len(pts) < 3:
        return pts
    p = [pts[0]] + pts + [pts[-1]]
    out = []
    for i in range(1, len(p) - 2):
        p0, p1, p2, p3 = map(np.array, (p[i - 1], p[i], p[i + 1], p[i + 2]))
        for t in np.linspace(0, 1, n, endpoint=False):
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
    out.append(np.array(pts[-1]))
    return [tuple(q) for q in out]


def shape_geom(s):
    if 'poly' in s:
        return Polygon(s['poly'])
    line = LineString(catmull([tuple(q) for q in s['path']]))
    return line.buffer(s['width'] / 2, cap_style=2 if s.get('flat') else 1, join_style=1)


def load_tex(name):
    f = TEX_FILES.get(name) or os.path.join(STYLE, name + '.png')
    return np.array(Image.open(f).convert('RGB')).astype(float)


def main(spec_path):
    spec = json.load(open(spec_path))
    R = spec['region']
    ppu = spec['pxPerUnit']
    W = int((R['r'] - R['l']) * ppu)
    H = int((R['b'] - R['t']) * ppu)
    rng = np.random.default_rng(7)
    canvas = np.zeros((H, W, 4), float)

    def to_px(pts):
        return [((x - R['l']) * ppu, (y - R['t']) * ppu) for x, y in pts]

    # blocky noise (2px cells) for pixel-art ragged edges
    block = rng.random((H // 2 + 2, W // 2 + 2))
    noise = np.kron(block, np.ones((2, 2)))[:H, :W]
    # low-frequency wobble so edges meander instead of following the drawn polygon exactly
    wob = ndimage.gaussian_filter(rng.standard_normal((H, W)), 22)
    wob = wob / (np.abs(wob).max() + 1e-6)

    for layer in spec['layers']:
        m = Image.new('L', (W, H), 0)
        d = ImageDraw.Draw(m)
        for s in layer['shapes']:
            g = shape_geom(s)
            geoms = getattr(g, 'geoms', [g])
            for gg in geoms:
                d.polygon(to_px(list(gg.exterior.coords)), fill=255)
        mask = np.array(m).astype(float) / 255
        edge = layer.get('edge', 'rough')
        if edge == 'rough':
            soft = ndimage.gaussian_filter(mask, 10)
            mask = (soft + wob * 0.55 * layer.get('wobble', 1) + (noise - 0.5) * 0.3 > 0.5).astype(float)
        elif edge == 'soft':
            mask = ndimage.gaussian_filter(mask, 10 * ppu / 8)
        tex = load_tex(layer['tex'])
        if layer.get('texScale', 1) != 1:
            k = layer['texScale']
            tex = np.array(Image.fromarray(tex.astype('uint8')).resize((int(tex.shape[1] * k), int(tex.shape[0] * k)), Image.NEAREST)).astype(float)
        th, tw, _ = tex.shape
        tiled = np.tile(tex, (H // th + 2, W // tw + 2, 1))
        ox = int(((R['l'] * ppu) % tw))
        oy = int(((R['t'] * ppu) % th))
        tiled = tiled[oy:oy + H, ox:ox + W]
        if layer.get('outline'):
            inner = ndimage.binary_erosion(mask > 0.5, iterations=2)
            rim = (mask > 0.5) & ~inner
            tiled = tiled.copy()
            tiled[rim] *= layer['outline']
        a = mask * layer.get('alpha', 1.0)
        canvas[..., :3] = canvas[..., :3] * (1 - a[..., None]) + tiled * a[..., None]
        canvas[..., 3] = canvas[..., 3] * (1 - a) + a

    out_dir = os.path.join(STYLE, 'baked')
    os.makedirs(out_dir, exist_ok=True)
    name = spec['name']
    for f in os.listdir(out_dir):
        if f.startswith(name + '_'):
            os.remove(os.path.join(out_dir, f))
    rgba = np.clip(canvas, 0, 255)
    rgba[..., 3] = np.clip(canvas[..., 3] * 255, 0, 255)
    img = Image.fromarray(rgba.astype('uint8'), 'RGBA')
    cw = spec['chunk']
    chunks = []
    for j, y in enumerate(range(R['t'], R['b'], cw)):
        for i, x in enumerate(range(R['l'], R['r'], cw)):
            w = min(cw, R['r'] - x)
            h = min(cw, R['b'] - y)
            crop = img.crop(((x - R['l']) * ppu, (y - R['t']) * ppu, (x - R['l'] + w) * ppu, (y - R['t'] + h) * ppu))
            if crop.getbbox() is None:
                continue
            fn = f'{name}_{i}_{j}.png'
            crop.save(os.path.join(out_dir, fn))
            chunks.append((fn, x, y, w, h))

    blocks = []
    for ln in spec.get('blocks', {}).get('lines', []):
        pts = ln['pts']
        t = ln.get('thick', 4) / 2
        gaps = ln.get('gaps', [])
        for (x1, y1), (x2, y2) in zip(pts, pts[1:]):
            n = max(1, int(np.hypot(x2 - x1, y2 - y1) / 3))
            for k in range(n + 1):
                x = x1 + (x2 - x1) * k / n
                y = y1 + (y2 - y1) * k / n
                if any(a <= x <= b for a, b in gaps):
                    continue
                blocks.append((round(x - t - 1.5, 2), round(x + t + 1.5, 2), round(y - t, 2), round(y + t, 2)))

    ts = [f'// GENERATED by tools/town/bake_ground.py from {os.path.relpath(spec_path, ROOT)} — do not edit; edit the JSON and re-run.',
          "import { Rect, BakedChunk, StripRun } from '../townTypes';", '',
          f'export const {name.upper()}_CHUNKS: BakedChunk[] = [']
    for fn, x, y, w, h in chunks:
        ts.append(f"  {{ src: require('../../../assets/sprites/tortuga_town/style2/baked/{fn}'), l: {x}, t: {y}, w: {w}, h: {h} }},")
    ts += ['];', '', f'export const {name.upper()}_BLOCKS: Rect[] = [']
    ts += [f'  {{ l: {l}, r: {r}, t: {t_}, b: {b} }},' for l, r, t_, b in blocks]
    ts += ['];', '', f'export const {name.upper()}_STRIPS: StripRun[] = {json.dumps(spec.get("strips", []))};', '']
    out_ts = os.path.join(os.path.dirname(spec_path), name + '.generated.ts')
    open(out_ts, 'w').write('\n'.join(ts))
    img.save(f'/tmp/{name}_baked.png')
    print(f'{len(chunks)} chunks, {len(blocks)} block rects -> {os.path.relpath(out_ts, ROOT)}')


if __name__ == '__main__':
    main(sys.argv[1])
