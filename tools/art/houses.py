"""Buildings drawn in code: one polished three-quarter-view sprite per building on Tortuga's plan.

Every building is built from the same parts (walls, roof, windows, door, sign, chimney, awning…)
with the same camera, light and outline, so the whole island matches. Camera: from the south,
facade parallel to the screen, roof ridge horizontal (never isometric). Sun upper-left.

    spec = dict(w=22, d=16, kind='tavern', storeys=2, door=True, ...)
    png_path = render(spec, out_path)       # 8 px per world unit

Units below are world units; the SVG viewBox is in units and rasterised at PX per unit.
"""
import math, random
import cairosvg

PX = 8
INK = '#3a2a1a'
OUT = 0.22  # outline width (units)

WALLS = {'plaster': '#ecdcb8', 'plaster_blue': '#cfdde3', 'plaster_ochre': '#e6c98a', 'plaster_rose': '#ecc9b8',
         'plaster_white': '#f1ead8', 'timber': '#efe0bd', 'stone': '#c9c0ad', 'stone_dark': '#a9a294', 'planks': '#9a6a42',
         'planks_red': '#9b4a34', 'planks_grey': '#8c8172'}
ROOFS = {'tile': '#b4523a', 'tile_dark': '#8e3b2a', 'tile_orange': '#c46a3c', 'slate': '#5f6b7a', 'slate_green': '#5c7266',
         'thatch': '#c8a35a', 'plank': '#6f5640', 'flat': '#a39d90'}
SHUTTERS = ['#3f6f8f', '#5f8a4a', '#8e3b2a', '#6b5a8e', '#2f5d5a']


def shade(hex_, k):
    r, g, b = (int(hex_[i:i + 2], 16) for i in (1, 3, 5))
    return '#%02x%02x%02x' % tuple(max(0, min(255, int(v * k))) for v in (r, g, b))


def poly(pts, fill, stroke=INK, sw=OUT, extra=''):
    return f'<path d="M{"L".join(f"{x:.2f} {y:.2f}" for x, y in pts)}Z" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round" {extra}/>'


def line(d, stroke=INK, sw=OUT, extra=''):
    return f'<path d="{d}" fill="none" stroke="{stroke}" stroke-width="{sw}" stroke-linecap="round" {extra}/>'


def rect(x, y, w, h, fill, stroke=INK, sw=OUT, rx=0, extra=''):
    return f'<rect x="{x:.2f}" y="{y:.2f}" width="{w:.2f}" height="{h:.2f}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" {extra}/>'


# ---------------------------------------------------------------- small parts
def window(x, y, w, h, shutter=None, bars=False, lit=False):
    o = []
    if shutter:
        o.append(rect(x - w * 0.55, y, w * 0.5, h, shutter, sw=0.15))
        o.append(rect(x + w * 1.05, y, w * 0.5, h, shutter, sw=0.15))
        o.append(line(f'M{x - w * 0.5:.2f} {y + h * 0.5:.2f}h{w * 0.4:.2f}M{x + w * 1.1:.2f} {y + h * 0.5:.2f}h{w * 0.4:.2f}', shade(shutter, 0.7), 0.12))
    o.append(rect(x, y, w, h, '#f6d58a' if lit else '#3d4b5c', sw=0.2))
    o.append(poly([(x + 0.15, y + 0.15), (x + w * 0.55, y + 0.15), (x + 0.15, y + h * 0.6)], '#6f8396' if not lit else '#fff1c4', 'none', 0))
    if bars:
        o.append(line(''.join(f'M{x + w * k / 4:.2f} {y:.2f}v{h:.2f}' for k in (1, 2, 3)), '#222', 0.18))
    else:
        o.append(line(f'M{x + w / 2:.2f} {y:.2f}v{h:.2f}M{x:.2f} {y + h / 2:.2f}h{w:.2f}', '#5b4630', 0.16))
    o.append(rect(x - 0.25, y + h, w + 0.5, 0.35, '#d9cbb0', sw=0.12))
    return ''.join(o)


def door(cx, base, w=2.6, h=4.0, col='#6b4426', arch=True):
    x = cx - w / 2; y = base - h
    d = (f'M{x:.2f} {base:.2f}V{y + w / 2:.2f}A{w / 2:.2f} {w / 2:.2f} 0 0 1 {x + w:.2f} {y + w / 2:.2f}V{base:.2f}Z' if arch
         else f'M{x:.2f} {base:.2f}V{y:.2f}H{x + w:.2f}V{base:.2f}Z')
    o = [f'<path d="{d}" fill="{col}" stroke="{INK}" stroke-width="0.24"/>']
    o.append(line(''.join(f'M{x + w * k / 3:.2f} {y + (0.9 if arch else 0.2):.2f}V{base - 0.1:.2f}' for k in (1, 2)), shade(col, 0.7), 0.12))
    o.append(f'<circle cx="{x + w * 0.78:.2f}" cy="{base - h * 0.45:.2f}" r="0.16" fill="#e1b04a"/>')
    o.append(rect(x - 0.5, base - 0.05, w + 1.0, 0.45, '#b7ab95', sw=0.15))  # step
    return ''.join(o)


def big_door(cx, base, w, h):
    x = cx - w / 2
    o = [rect(x, base - h, w, h, '#5e3f26', sw=0.24)]
    o.append(line(f'M{cx:.2f} {base - h:.2f}V{base:.2f}' + ''.join(f'M{x + w * k / 6:.2f} {base - h + 0.2:.2f}V{base:.2f}' for k in (1, 2, 4, 5)), '#3f2a18', 0.12))
    o.append(line(f'M{x:.2f} {base - h:.2f}L{cx:.2f} {base:.2f}M{x + w:.2f} {base - h:.2f}L{cx:.2f} {base:.2f}', '#3f2a18', 0.15))
    return ''.join(o)


ICONS = {
    'tankard': lambda x, y: rect(x - 0.5, y - 0.55, 0.9, 1.1, '#e8c56a', sw=0.1) + line(f'M{x + 0.4:.2f} {y - 0.3:.2f}h0.35v0.6h-0.35', '#e8c56a', 0.18) + rect(x - 0.55, y - 0.7, 1.0, 0.25, '#fff', sw=0.08),
    'coin': lambda x, y: f'<circle cx="{x}" cy="{y}" r="0.6" fill="#e8c56a" stroke="{INK}" stroke-width="0.1"/>' + line(f'M{x:.2f} {y - 0.35:.2f}v0.7', '#a8842a', 0.12),
    'bottle': lambda x, y: poly([(x - 0.35, y + 0.6), (x + 0.35, y + 0.6), (x + 0.35, y - 0.1), (x + 0.12, y - 0.35), (x + 0.12, y - 0.65), (x - 0.12, y - 0.65), (x - 0.12, y - 0.35), (x - 0.35, y - 0.1)], '#6fae7a', INK, 0.08),
    'scissors': lambda x, y: f'<circle cx="{x - 0.35}" cy="{y + 0.4}" r="0.25" fill="none" stroke="#ddd" stroke-width="0.12"/><circle cx="{x + 0.35}" cy="{y + 0.4}" r="0.25" fill="none" stroke="#ddd" stroke-width="0.12"/>' + line(f'M{x - 0.2:.2f} {y + 0.25:.2f}L{x + 0.4:.2f} {y - 0.6:.2f}M{x + 0.2:.2f} {y + 0.25:.2f}L{x - 0.4:.2f} {y - 0.6:.2f}', '#ddd', 0.12),
    'pistol': lambda x, y: line(f'M{x - 0.6:.2f} {y - 0.2:.2f}h1.1M{x + 0.3:.2f} {y - 0.2:.2f}l0.2 0.7', '#ddd', 0.3),
    'anchor': lambda x, y: line(f'M{x:.2f} {y - 0.6:.2f}v1.1M{x - 0.35:.2f} {y - 0.35:.2f}h0.7M{x - 0.5:.2f} {y + 0.2:.2f}a0.5 0.5 0 0 0 1 0', '#ddd', 0.15),
    'fish': lambda x, y: f'<path d="M{x - 0.6} {y}q0.5 -0.45 1 0q-0.5 0.45 -1 0ZM{x + 0.4} {y}l0.35 -0.3v0.6Z" fill="#9cc7dd" stroke="{INK}" stroke-width="0.07"/>',
    'leaf': lambda x, y: f'<path d="M{x - 0.5} {y + 0.5}q0 -1 1 -1q0 1 -1 1Z" fill="#7aa356" stroke="{INK}" stroke-width="0.07"/>',
    'hammer': lambda x, y: line(f'M{x - 0.4:.2f} {y + 0.5:.2f}L{x + 0.2:.2f} {y - 0.2:.2f}', '#c8a067', 0.16) + rect(x - 0.05, y - 0.55, 0.7, 0.35, '#bbb', sw=0.08, extra=f'transform="rotate(-45 {x + 0.3} {y - 0.4})"'),
    'keg': lambda x, y: rect(x - 0.45, y - 0.55, 0.9, 1.1, '#8a5a32', sw=0.08, rx=0.25) + line(f'M{x - 0.45:.2f} {y - 0.2:.2f}h0.9M{x - 0.45:.2f} {y + 0.2:.2f}h0.9', '#333', 0.08),
    'skull': lambda x, y: f'<circle cx="{x}" cy="{y - 0.1}" r="0.5" fill="#eee"/><circle cx="{x - 0.18}" cy="{y - 0.12}" r="0.12" fill="#222"/><circle cx="{x + 0.18}" cy="{y - 0.12}" r="0.12" fill="#222"/>',
    'bread': lambda x, y: f'<ellipse cx="{x}" cy="{y}" rx="0.6" ry="0.38" fill="#d9a35a" stroke="{INK}" stroke-width="0.07"/>',
    'cane': lambda x, y: line(f'M{x - 0.3:.2f} {y + 0.6:.2f}v-1.2M{x:.2f} {y + 0.6:.2f}v-1.3M{x + 0.3:.2f} {y + 0.6:.2f}v-1.1', '#a5c46a', 0.14),
    'boat': lambda x, y: f'<path d="M{x - 0.6} {y}h1.2l-0.3 0.4h-0.6Z" fill="#c8a067"/>' + line(f'M{x:.2f} {y:.2f}v-0.8l0.45 0.6Z', '#eee', 0.08),
}


def hanging_sign(x, y, icon, board='#5b3c22'):
    o = [line(f'M{x - 1.8:.2f} {y - 0.6:.2f}h1.8M{x - 1.4:.2f} {y - 0.6:.2f}v0.4M{x - 0.4:.2f} {y - 0.6:.2f}v0.4', '#2b2016', 0.16)]
    o.append(rect(x - 1.9, y - 0.25, 2.0, 1.5, board, sw=0.15, rx=0.15))
    o.append(ICONS.get(icon, ICONS['coin'])(x - 0.9, y + 0.5))
    return ''.join(o)


def barrel(x, base, s=1.0):
    return (rect(x - 0.6 * s, base - 1.4 * s, 1.2 * s, 1.4 * s, '#8a5a32', sw=0.15, rx=0.3 * s)
            + line(f'M{x - 0.6 * s:.2f} {base - 1.0 * s:.2f}h{1.2 * s:.2f}M{x - 0.6 * s:.2f} {base - 0.4 * s:.2f}h{1.2 * s:.2f}', '#3b3026', 0.1))


def crate(x, base, s=1.0):
    return rect(x - 0.75 * s, base - 1.5 * s, 1.5 * s, 1.5 * s, '#b48552', sw=0.15) + line(f'M{x - 0.75 * s:.2f} {base - 1.5 * s:.2f}l{1.5 * s:.2f} {1.5 * s:.2f}', '#7a5532', 0.12)


def lantern(x, y):
    return line(f'M{x:.2f} {y - 0.8:.2f}v0.4', '#2b2016', 0.12) + rect(x - 0.35, y - 0.4, 0.7, 0.9, '#f6d58a', sw=0.12, rx=0.1) + f'<circle cx="{x}" cy="{y + 0.05}" r="1.2" fill="#ffd27a" opacity="0.18"/>'


# ---------------------------------------------------------------- roofs and walls
def roof(W, R, kind, col, rng, vents=()):
    """Hip roof seen from the south-above: back slope (top), side hips, front slope (bottom)."""
    i = min(R * 0.55, W * 0.32)
    r1 = R * 0.42
    base, light, dark, back = col, shade(col, 1.12), shade(col, 0.78), shade(col, 1.04)
    o = [poly([(0, 0), (W, 0), (W - i, r1), (i, r1)], back),
         poly([(0, 0), (i, r1), (0, R)], light),
         poly([(W, 0), (W, R), (W - i, r1)], dark),
         poly([(0, R), (i, r1), (W - i, r1), (W, R)], base)]
    # texture on the front slope
    if kind in ('tile', 'tile_dark', 'tile_orange'):
        rows = max(2, int((R - r1) / 0.9))
        for k in range(1, rows + 1):
            y = r1 + (R - r1) * k / (rows + 0.2)
            t = (y - r1) / (R - r1); x0 = i * (1 - t); x1 = W - x0
            n = max(2, int((x1 - x0) / 0.9))
            o.append(line(''.join(f'M{x0 + (x1 - x0) * j / n:.2f} {y:.2f}q{(x1 - x0) / n / 2:.2f} 0.45 {(x1 - x0) / n:.2f} 0' for j in range(n)), shade(col, 0.72), 0.12))
        for k in range(1, 3):  # back slope rows
            y = r1 * k / 3; x0 = i * y / r1; o.append(line(f'M{x0:.2f} {y:.2f}H{W - x0:.2f}', shade(col, 0.8), 0.1))
    elif kind.startswith('slate'):
        rows = max(2, int((R - r1) / 0.75))
        for k in range(1, rows + 1):
            y = r1 + (R - r1) * k / (rows + 0.2); t = (y - r1) / (R - r1); x0 = i * (1 - t)
            o.append(line(f'M{x0:.2f} {y:.2f}H{W - x0:.2f}', shade(col, 0.7), 0.1))
            o.append(line(''.join(f'M{x0 + 0.9 * j + (0.45 if k % 2 else 0):.2f} {y - 0.7:.2f}v0.6' for j in range(int((W - 2 * x0) / 0.9))), shade(col, 0.75), 0.07))
    elif kind == 'thatch':
        for j in range(int(W * 2.2)):
            x = rng.uniform(0.3, W - 0.3); y = rng.uniform(r1 + 0.3, R - 0.2)
            t = (y - r1) / (R - r1)
            if x < i * (1 - t) or x > W - i * (1 - t): continue
            o.append(line(f'M{x:.2f} {y:.2f}l{rng.uniform(-0.15, 0.15):.2f} 0.7', shade(col, rng.choice((0.8, 0.88, 1.1))), 0.09))
        o.append(line(f'M0.2 {R - 0.1:.2f}H{W - 0.2:.2f}', shade(col, 0.7), 0.3))
    elif kind == 'plank':
        n = int(W / 0.8)
        o.append(line(''.join(f'M{W * j / n:.2f} {R:.2f}L{min(max(W * j / n, i), W - i):.2f} {r1:.2f}' for j in range(1, n)), shade(col, 0.72), 0.1))
    o.append(line(f'M{i:.2f} {r1:.2f}H{W - i:.2f}', shade(col, 0.6), 0.32))  # ridge
    o.append(line(f'M0 {R:.2f}H{W:.2f}', shade(col, 0.55), 0.3))  # eave line
    return ''.join(o)


def wall(x0, y0, w, h, kind, rng):
    col = WALLS[kind]
    o = [rect(x0, y0, w, h, col, sw=0.26)]
    if kind == 'timber':
        posts = max(2, int(w / 3.2))
        o.append(line(''.join(f'M{x0 + w * k / posts:.2f} {y0:.2f}v{h:.2f}' for k in range(1, posts)), '#5b3c22', 0.38))
        o.append(line(f'M{x0:.2f} {y0 + h * 0.48:.2f}h{w:.2f}', '#5b3c22', 0.38))
        o.append(line(''.join(f'M{x0 + w * k / posts:.2f} {y0 + h * 0.48:.2f}l{w / posts:.2f} {-h * 0.48:.2f}' for k in range(0, posts, 2)), '#5b3c22', 0.25))
    elif kind.startswith('stone'):
        rows = max(3, int(h / 0.9))
        for r in range(rows):
            y = y0 + h * r / rows
            o.append(line(f'M{x0:.2f} {y:.2f}h{w:.2f}', shade(col, 0.82), 0.08))
            off = 0 if r % 2 else 0.8
            o.append(line(''.join(f'M{x0 + off + 1.6 * j:.2f} {y:.2f}v{h / rows:.2f}' for j in range(int((w - off) / 1.6) + 1)), shade(col, 0.82), 0.08))
    elif kind.startswith('planks'):
        n = max(3, int(w / 0.9))
        o.append(line(''.join(f'M{x0 + w * k / n:.2f} {y0:.2f}v{h:.2f}' for k in range(1, n)), shade(col, 0.72), 0.1))
    else:  # plaster: a little weathering and a stone plinth
        for _ in range(int(w / 3)):
            x = rng.uniform(x0 + 0.5, x0 + w - 2); y = rng.uniform(y0 + 0.5, y0 + h - 1.5)
            o.append(rect(x, y, rng.uniform(0.8, 1.6), rng.uniform(0.5, 0.9), shade(col, 0.93), 'none', 0, rx=0.2))
    o.append(rect(x0, y0 + h - 0.8, w, 0.8, '#b3a892', sw=0.18))  # plinth
    o.append(line(f'M{x0:.2f} {y0 + 0.05:.2f}h{w:.2f}', '#00000033', 0.6))  # eave shadow
    return ''.join(o)


# ---------------------------------------------------------------- whole buildings
def building_svg(s):
    rng = random.Random(s.get('seed', 1))
    w, d = s['w'], s['d']
    kind = s.get('kind', 'home')
    st = s.get('storeys', 1)
    eave = 0.7
    W = w + 2 * eave
    H = 5.6 * st + (0.6 if st > 1 else 0)
    R = max(3.6, d * 0.5)
    if s.get('shape') == 'lighthouse':
        return lighthouse_svg(s)
    if s.get('shape') == 'tower':
        return tower_svg(s)
    if s.get('shape') == 'ruin':
        return ruin_svg(s)
    top = 0.0
    extra_top = 6.0 if s.get('chimney_tall') else 0
    total_h = R + H + extra_top + 0.8
    o = []
    y_roof = extra_top
    wall_y = y_roof + R - 0.2
    base = wall_y + H
    # contact shadow (lower right)
    o.append(f'<ellipse cx="{W / 2 + 1.2:.2f}" cy="{base + 0.1:.2f}" rx="{W * 0.55:.2f}" ry="0.9" fill="#000" opacity="0.18"/>')
    # wall
    o.append(wall(eave, wall_y, w, H, s.get('wall', 'plaster'), rng))
    if s.get('crenel'):
        n = max(3, int(w / 2))
        for k in range(n):
            if k % 2 == 0: o.append(rect(eave + w * k / n, wall_y - 1.2, w / n, 1.4, WALLS['stone'], sw=0.2))
    # windows + door on the front
    door_on = s.get('door', True)
    cx = eave + w * s.get('door_at', 0.5)
    bars = s.get('bars', False)
    shut = s.get('shutters')
    lit = s.get('lit', False)
    for r in range(st):
        wy = wall_y + 1.0 + r * 5.6
        n = max(1, int(w / 5.2))
        xs = [eave + w * (k + 0.5) / n for k in range(n)]
        for x in xs:
            if r == st - 1 and door_on and abs(x - cx) < 2.6: continue
            ww, wh = (1.7, 2.1) if r < st - 1 or st == 1 else (1.7, 2.2)
            if r == st - 1 and st > 1: wy2 = wy
            o.append(window(x - ww / 2, wy + (0.6 if r == st - 1 else 0.3), ww, wh, shut, bars, lit))
    if s.get('big_door'):
        o.append(big_door(cx, base - 0.8, min(w * 0.4, 6), min(H - 1.2, 4.6)))
    elif door_on:
        o.append(door(cx, base - 0.8, col=s.get('door_col', '#6b4426')))
    if s.get('sign'):
        o.append(hanging_sign(cx - 1.6, wall_y + H - 4.6, s['sign']))
    if s.get('awning'):
        a1, a2 = s['awning']
        ax0, ax1, ay = eave + 0.4, eave + w - 0.4, wall_y + H - 4.9
        n = max(4, int((ax1 - ax0) / 1.1))
        for k in range(n):
            x = ax0 + (ax1 - ax0) * k / n
            o.append(poly([(x, ay), (x + (ax1 - ax0) / n, ay), (x + (ax1 - ax0) / n + 0.1, ay + 1.3), (x - 0.1, ay + 1.3)], a1 if k % 2 == 0 else a2, INK, 0.12))
        o.append(line(''.join(f'M{ax0 + (ax1 - ax0) * k / n:.2f} {ay + 1.3:.2f}q{(ax1 - ax0) / n / 2:.2f} 0.5 {(ax1 - ax0) / n:.2f} 0' for k in range(n)), INK, 0.12))
    if s.get('lanterns'):
        o.append(lantern(cx - 2.4, wall_y + H - 3.6)); o.append(lantern(cx + 2.4, wall_y + H - 3.6))
    if s.get('columns'):
        for x in (cx - 3.2, cx + 3.2):
            o.append(rect(x - 0.4, wall_y + 0.6, 0.8, H - 1.4, '#f4efe3', sw=0.15))
    if s.get('wheel'):
        wx, wy = eave + 1.2, base - 3.2
        o.append(f'<circle cx="{wx}" cy="{wy}" r="3" fill="none" stroke="#5b3c22" stroke-width="0.5"/>' +
                 line(''.join(f'M{wx:.2f} {wy:.2f}l{3 * math.cos(a):.2f} {3 * math.sin(a):.2f}' for a in [k * math.pi / 4 for k in range(8)]), '#5b3c22', 0.25))
    # props at the base
    for side, what in s.get('base_props', []):
        x = eave + 0.9 if side == 'L' else eave + w - 0.9
        o.append(barrel(x, base) if what == 'barrel' else crate(x, base))
    # roof
    if s.get('roof', 'tile') != 'none':
        o.append(f'<g transform="translate(0 {y_roof:.2f})">' + roof(W, R, s.get('roof', 'tile'), s.get('roof_col') or ROOFS[s.get('roof', 'tile')], rng) + '</g>')
    if s.get('chimney') or s.get('chimney_tall'):
        hx = W * 0.72; ch = 2.6 + (extra_top if s.get('chimney_tall') else 0)
        cy = y_roof + R * 0.3
        o.append(rect(hx, cy - ch, 1.4, ch + 0.4, '#a85a3e' if not s.get('chimney_tall') else '#9a8e7c', sw=0.2))
        o.append(rect(hx - 0.2, cy - ch - 0.3, 1.8, 0.5, '#6b6157', sw=0.15))
    if s.get('flag'):
        fx = W * 0.25
        o.append(line(f'M{fx:.2f} {y_roof + R * 0.3:.2f}v-5', '#3b2c1c', 0.22))
        o.append(poly([(fx, y_roof + R * 0.3 - 5), (fx + 3, y_roof + R * 0.3 - 4.3), (fx, y_roof + R * 0.3 - 3.5)], s['flag'], INK, 0.1))
    vb_h = base + 1.2
    return W, vb_h, ''.join(o)


def lighthouse_svg(s):
    w = s['w']; W = w + 2; H = 26; x0 = 1
    o = [f'<ellipse cx="{W / 2 + 1:.2f}" cy="{H + 6:.2f}" rx="{W * 0.6:.2f}" ry="1" fill="#000" opacity="0.18"/>']
    body = [(x0 + w * 0.18, 6), (x0 + w * 0.82, 6), (x0 + w, H + 6), (x0, H + 6)]
    o.append(poly(body, '#f1ead8', INK, 0.3))
    for k in range(1, 5, 2):
        y0 = 6 + H * k / 5; y1 = 6 + H * (k + 1) / 5
        t0, t1 = (y0 - 6) / H, (y1 - 6) / H
        o.append(poly([(x0 + w * 0.18 * (1 - t0), y0), (x0 + w - w * 0.18 * (1 - t0), y0), (x0 + w - w * 0.18 * (1 - t1), y1), (x0 + w * 0.18 * (1 - t1), y1)], '#b4523a', INK, 0.2))
    o.append(rect(x0 + w * 0.05, 5, w * 0.9, 1.2, '#3b3b3b', sw=0.2))  # gallery
    o.append(rect(x0 + w * 0.25, 1.4, w * 0.5, 3.6, '#ffe59a', sw=0.25))  # lamp room
    o.append(f'<circle cx="{W / 2}" cy="3.2" r="4" fill="#ffd27a" opacity="0.25"/>')
    o.append(poly([(x0 + w * 0.2, 1.5), (W / 2, -1.2), (x0 + w * 0.8, 1.5)], '#5f6b7a', INK, 0.25))
    o.append(door(W / 2, H + 6 - 0.2, 2.4, 3.6))
    o.append(window(W / 2 - 0.7, 14, 1.4, 1.9))
    return W, H + 7.4, ''.join(o)


def tower_svg(s):
    w = s['w']; W = w + 1.4; H = s.get('height', 14); x0 = 0.7
    stone = s.get('wall', 'stone')
    o = [f'<ellipse cx="{W / 2 + 1:.2f}" cy="{H + 3:.2f}" rx="{W * 0.6:.2f}" ry="0.9" fill="#000" opacity="0.18"/>']
    o.append(wall(x0, 3, w, H, stone, random.Random(3)))
    n = max(3, int(w / 1.6))
    for k in range(n):
        if k % 2 == 0: o.append(rect(x0 + w * k / n, 1.6, w / n, 1.6, WALLS[stone] if stone in WALLS else '#c9c0ad', sw=0.2))
    o.append(window(W / 2 - 0.6, 6, 1.2, 2.2))
    if s.get('door', True): o.append(door(W / 2, H + 3 - 0.8, 2.2, 3.4))
    if s.get('flag'):
        o.append(line(f'M{W / 2:.2f} 1.6v-5', '#3b2c1c', 0.22)); o.append(poly([(W / 2, -3.4), (W / 2 + 3, -2.7), (W / 2, -2)], s['flag'], INK, 0.1))
    return W, H + 4.2, ''.join(o)


def ruin_svg(s):
    w, d = s['w'], s['d']; W = w + 1.4; R = d * 0.62; H = 5; x0 = 0.7
    rng = random.Random(9)
    o = [poly([(x0, 1), (x0 + w, 1), (x0 + w, R + 1), (x0, R + 1)], '#8f9b6c', INK, 0.15)]  # grassy floor inside
    for _ in range(int(w)):
        o.append(rect(rng.uniform(x0 + 1, x0 + w - 2), rng.uniform(1.5, R), rng.uniform(0.6, 1.4), 0.6, '#b5ad9c', sw=0.1))
    o.append(rect(x0, 0.6, 1.2, R + 1, WALLS['stone_dark'], sw=0.2)); o.append(rect(x0 + w - 1.2, 0.6, 1.2, R + 1, WALLS['stone_dark'], sw=0.2))
    o.append(rect(x0, 0, w, 1.2, WALLS['stone_dark'], sw=0.2))
    # broken front wall with a jagged top
    pts = [(x0, R + 1 + H)]
    for k in range(13):
        x = x0 + w * k / 12; pts.append((x, R + 1 + rng.uniform(0, H * 0.7) if 3 < k < 10 else R + 1))
    pts.append((x0 + w, R + 1 + H))
    o.append(poly(pts, WALLS['stone'], INK, 0.25))
    o.append(line(''.join(f'M{x0 + rng.uniform(0, w):.2f} {R + 1 + rng.uniform(1, H):.2f}q0.6 -1.6 1.4 -2.4' for _ in range(6)), '#5f8a4a', 0.3))
    o.append(f'<ellipse cx="{W / 2 + 1:.2f}" cy="{R + 1 + H:.2f}" rx="{W * 0.55:.2f}" ry="0.8" fill="#000" opacity="0.15"/>')
    return W, R + H + 1.8, ''.join(o)


def render(spec, out_path):
    W, Hh, body = building_svg(spec)
    pad = 0.6
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{-pad} {-pad - 6} {W + 2 * pad} {Hh + 2 * pad + 6}" '
           f'width="{(W + 2 * pad) * PX:.0f}" height="{(Hh + 2 * pad + 6) * PX:.0f}">{body}</svg>')
    cairosvg.svg2png(bytestring=svg.encode(), write_to=out_path)
    # trim the transparent top margin so the sprite's bottom stays the ground line
    from PIL import Image
    im = Image.open(out_path); bb = im.getbbox()
    if bb: im.crop((0, bb[1], im.size[0], im.size[1])).save(out_path)
    return W + 2 * pad
