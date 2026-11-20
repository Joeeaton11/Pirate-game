"""Rooms for every enterable Tortuga building outside the painted town (and the explorable
landmarks), laid out with the existing room kit on procedurally drawn floors — no new art needed.
Writes assets/sprites/interiors/plan/floor_<style>.png and src/data/planRooms.generated.ts.
Usage: python3 plan_rooms.py"""
import os, re, sys, random, json
from PIL import Image, ImageDraw

ROOT = __file__.rsplit('/tools/', 1)[0]
OUT = f'{ROOT}/assets/sprites/interiors/plan'
os.makedirs(OUT, exist_ok=True)
sys.path.insert(0, f'{ROOT}/tools/blueprint')
import plan_tortuga as P
sys.path.insert(0, f'{ROOT}/tools/rooms')
from room_lines import LINES

# Room geometry shared with the painted shells (360 x 360 room units).
WALLS = [(0, 360, 0, 98), (0, 24, 0, 360), (336, 360, 0, 360), (0, 148, 258, 360), (210, 360, 258, 360), (0, 360, 292, 360)]
EXIT = (150, 208, 280, 298)
ENTRY = (179, 262)

# ---------------------------------------------------------------- floors (drawn small, upscaled for pixel grain)
S = 4  # px per small pixel at 720 final
def floor(style):
    rng = random.Random(style)
    W = 180
    im = Image.new('RGB', (W, W), (18, 11, 6)); d = ImageDraw.Draw(im)
    u = W / 360  # small px per room unit
    pal = {
        'tavern': ((122, 78, 44), (98, 61, 33), (70, 44, 24), 'planks'),
        'shop': ((146, 104, 64), (124, 86, 51), (88, 60, 34), 'planks'),
        'warehouse': ((112, 86, 58), (92, 70, 46), (62, 46, 30), 'boards'),
        'stone': ((120, 116, 104), (98, 94, 84), (66, 63, 56), 'flags'),
        'cave': ((86, 80, 70), (70, 64, 56), (44, 40, 34), 'rock'),
        'hold': ((92, 64, 40), (74, 50, 31), (48, 32, 20), 'planks'),
        'manor': ((134, 86, 52), (112, 70, 42), (78, 48, 28), 'parquet'),
    }[style]
    base, alt, line, kind = pal
    fx0, fy0, fx1, fy1 = 24 * u, 98 * u, 336 * u, 292 * u
    d.rectangle([fx0, fy0, fx1, fy1], fill=base)
    if kind in ('planks', 'boards'):
        h = 4 if kind == 'planks' else 5
        y = fy0
        while y < fy1:
            off = rng.randint(0, 20)
            x = fx0 - off
            while x < fx1:
                L = rng.randint(16, 34)
                c = base if rng.random() < 0.55 else alt
                if min(fx1, x + L) > max(fx0, x):
                    d.rectangle([max(fx0, x), y, min(fx1, x + L), min(fy1, y + h - 1)], fill=c)
                    d.line([min(fx1, x + L), y, min(fx1, x + L), y + h - 1], fill=line)
                x += L + 1
            d.line([fx0, y + h - 1, fx1, y + h - 1], fill=line); y += h
    elif kind == 'parquet':
        for gy in range(int(fy0), int(fy1), 6):
            for gx in range(int(fx0), int(fx1), 6):
                c = base if ((gx // 6 + gy // 6) % 2) else alt
                d.rectangle([gx, gy, gx + 5, gy + 5], fill=c)
                if (gx // 6 + gy // 6) % 2: d.line([gx, gy + 2, gx + 5, gy + 2], fill=line)
                else: d.line([gx + 2, gy, gx + 2, gy + 5], fill=line)
    elif kind == 'flags':
        y = fy0
        while y < fy1:
            h = rng.randint(6, 9); x = fx0 - rng.randint(0, 6)
            while x < fx1:
                w = rng.randint(7, 12)
                c = tuple(max(0, min(255, v + rng.randint(-8, 8))) for v in (base if rng.random() < 0.6 else alt))
                if min(fx1, x + w - 1) > max(fx0, x):
                    d.rectangle([max(fx0, x), y, min(fx1, x + w - 1), min(fy1, y + h - 1)], fill=c, outline=line)
                x += w
            y += h
    else:  # rock
        for _ in range(900):
            x, y = rng.uniform(fx0, fx1), rng.uniform(fy0, fy1); r = rng.uniform(1, 4)
            d.ellipse([x - r, y - r, x + r, y + r], fill=alt if rng.random() < 0.6 else line)
    # Back wall with a skirting board, side walls, the doorway.
    wall = {'stone': (84, 80, 72), 'cave': (52, 47, 40)}.get(style, (78, 50, 28))
    d.rectangle([fx0, 0, fx1, fy0], fill=wall)
    if style in ('stone', 'cave'):
        for yy in range(0, int(fy0), 6):
            for xx in range(int(fx0) - (yy // 6 % 2) * 5, int(fx1), 10):
                d.rectangle([xx, yy, xx + 9, yy + 5], outline=tuple(v - 18 for v in wall))
    else:
        for xx in range(int(fx0), int(fx1), 7):
            d.line([xx, 0, xx, fy0], fill=tuple(v - 16 for v in wall))
    d.rectangle([fx0, fy0 - 3, fx1, fy0], fill=tuple(v - 25 for v in wall))
    d.rectangle([0, 0, fx0, W], fill=tuple(v - 30 for v in wall)); d.rectangle([fx1, 0, W, W], fill=tuple(v - 30 for v in wall))
    d.rectangle([fx0, 258 * u, 148 * u, W], fill=tuple(v - 30 for v in wall)); d.rectangle([210 * u, 258 * u, fx1, W], fill=tuple(v - 30 for v in wall))
    d.rectangle([148 * u, 292 * u, 210 * u, W], fill=(18, 11, 6))
    d.rectangle([150 * u, 282 * u, 208 * u, 292 * u], fill=(96, 34, 26))  # door mat
    # A window or two on the back wall (not in the cave).
    if style != 'cave':
        for wx in (100, 260):
            d.rectangle([wx * u - 7, 30 * u, wx * u + 7, 62 * u], fill=(46, 70, 92), outline=(30, 20, 12))
            d.line([wx * u, 30 * u, wx * u, 62 * u], fill=(30, 20, 12))
    im = im.resize((720, 720), Image.NEAREST)
    im.save(f'{OUT}/floor_{style}.png', optimize=True)

STYLES = ['tavern', 'shop', 'warehouse', 'stone', 'cave', 'hold', 'manor']
for st in STYLES: floor(st)

# ---------------------------------------------------------------- layouts per kind
def tavern_props(tables):
    props, furn, lights = [], [], []
    for x, y in tables:
        props += [dict(kit='chair_front', x=x, y=y - 16), dict(kit='chair_side', x=x - 27, y=y + 6),
                  dict(kit='chair_side', x=x + 27, y=y + 6, flip=True), dict(kit='table', x=x, y=y + 14), dict(kit='chair_back', x=x, y=y + 26)]
        furn.append(dict(type='table', x=x, y=y + 2)); lights.append(dict(x=x, y=y - 4, r=14))
    return props, furn, lights
def stack(items):
    props, furn = [], []
    for k, x, y in items:
        props.append(dict(kit=k, x=x, y=y)); furn.append(dict(type='barrel', x=x, y=y - 10))
    return props, furn

LAYOUT = {
    'tavern': lambda: (*tavern_props([(96, 150), (264, 150), (110, 222), (250, 222)])[:2], 'tavern', (180, 106),
                       [dict(x=180, y=130, label='bar', text='Rum, more rum, and something the barman calls rum.')]),
    'shop': lambda: (*stack([('table', 180, 164), ('crates', 60, 128), ('crates', 300, 126), ('barrel', 300, 246), ('barrel', 62, 248)]), 'shop', (180, 106),
                     [dict(x=268, y=110, label='shelves', text='Rope, rum, lanterns and a parrot cage nobody will admit to owning.')]),
    'market': lambda: (*stack([('table', 120, 164), ('table', 240, 164), ('crates', 60, 240), ('crates', 300, 240), ('barrel', 60, 126)]), 'shop', (180, 106),
                       [dict(x=180, y=200, label='auction block', text='Lot 14: one barrel, contents unknown. Bidding starts at two doubloons.')]),
    'civic': lambda: (*stack([('table', 180, 166), ('stool', 214, 176), ('crates', 60, 128), ('barrel', 300, 128)]), 'manor', (180, 112),
                      [dict(x=280, y=112, label='ledgers', text='Columns of figures, and a margin note: "Ask no questions."')]),
    'warehouse': lambda: (*stack([('crates', 70, 140), ('crates', 110, 140), ('crates', 70, 196), ('crates', 250, 140), ('crates', 290, 140),
                                  ('crates', 290, 196), ('barrel', 112, 196), ('barrel', 250, 196), ('barrel', 180, 240)]), 'warehouse', (180, 128),
                          [dict(x=180, y=170, label='cargo', text='Stencilled "TOBACCO". It sloshes.')]),
    'stone': lambda: (*stack([('table', 180, 166), ('stool', 150, 180), ('barrel', 50, 130), ('barrel', 310, 130), ('crates', 300, 240)]), 'stone', (180, 110),
                      [dict(x=60, y=200, label='old stonework', text='Initials carved in the stone, some of them very old.')]),
    'manor': lambda: (*tavern_props([(120, 170), (240, 170)])[:2], 'manor', (180, 112),
                      [dict(x=180, y=110, label='portrait', text='A governor in a wig, painted by someone who disliked him.')]),
    'cave': lambda: (*stack([('barrel', 60, 140), ('barrel', 88, 150), ('barrel', 280, 140), ('barrel', 304, 158), ('crates', 70, 232), ('crates', 290, 232), ('crates', 120, 120)]), 'cave', (180, 140),
                     [dict(x=180, y=200, label='contraband', text='Barrels of French brandy. The customs men would weep.')]),
    'hold': lambda: (*stack([('crates', 90, 150), ('crates', 262, 170), ('barrel', 120, 222), ('barrel', 240, 132), ('barrel', 300, 236)]), 'hold', (180, 120),
                     [dict(x=180, y=190, label='silver chest', text='An empty chest, stamped with the Spanish crown. Someone got here first.')]),
}
KIND_TO_LAYOUT = {'tavern': 'tavern', 'shop': 'shop', 'market': 'market', 'civic': 'civic', 'warehouse': 'warehouse', 'home': 'civic',
                  'fort': 'stone', 'manor': 'manor', 'ruin': 'stone', 'landmark': 'stone', 'shed': 'warehouse', 'mill': 'warehouse'}

KEEPERS = ['tortuga_amb_sailor', 'tortuga_amb_cook', 'patron_tortuga_local', 'patron_tortuga_drunk', 'patron_tortuga_rival',
           'patron_tortuga_mystic', 'tortuga_amb_lass', 'tortuga_amb_browser']
LOCALS = ['tortuga_amb_deckhand', 'tortuga_amb_clerk', 'tortuga_amb_captain', 'tortuga_amb_galley', 'tortuga_amb_sailmaker',
          'tortuga_amb_apprentice', 'tortuga_amb_browser', 'tortuga_amb_sailor']

rooms = [(b[0], KIND_TO_LAYOUT.get(b[2], 'civic')) for b in P.BUILDINGS if b[0]]
rooms += [('tortuga_grotto', 'cave'), ('tortuga_wreck', 'hold')]

ts = ['// GENERATED by tools/rooms/plan_rooms.py — rooms for Tortuga buildings outside the painted town,',
      '// laid out with the room kit on drawn floors. Re-run the script; never hand-edit.',
      "import type { BuildingInterior } from './interiors';", '',
      'const FLOORS = {']
for st in STYLES: ts.append(f"  {st}: require('../../assets/sprites/interiors/plan/floor_{st}.png'),")
ts.append('};')
ts.append('')
ts.append('/** Keeper sprite per room (aliased into NPC_SPRITES as "<id>:main"). */')
ts.append('export const PLAN_ROOM_KEEPERS: Record<string, string> = {')
for i, (bid, lay) in enumerate(rooms): ts.append(f"  {bid}: '{KEEPERS[i % len(KEEPERS)]}',")
ts.append('};')
ts.append('')
ts.append('export const PLAN_ROOMS: Record<string, BuildingInterior> = {')
for i, (bid, lay) in enumerate(rooms):
    props, furn, floor_style, keeper, hot = LAYOUT[lay]()
    if bid in LINES:
        hot = [dict(hot[0], label=LINES[bid][0], text=LINES[bid][1])]
    local = LOCALS[i % len(LOCALS)]
    lights = [dict(x=180, y=96, r=18)] if floor_style != 'cave' else [dict(x=120, y=120, r=22), dict(x=260, y=150, r=22)]
    room = dict(buildingId=bid, width=360, height=360, entryPosition=dict(x=ENTRY[0], y=ENTRY[1]),
                exitZone=dict(l=EXIT[0], r=EXIT[1], t=EXIT[2], b=EXIT[3]), walls=[dict(l=a, r=b, t=c, b=d) for a, b, c, d in WALLS],
                props=props, furniture=furn, hotspots=hot, lights=lights,
                npcSpots=[dict(id='main', x=keeper[0], y=keeper[1]), dict(id=local, x=96 if i % 2 else 262, y=236)])
    body = json.dumps(room)
    ts.append(f"  {bid}: {{ ...{body}, backdrop: FLOORS.{floor_style} }} as BuildingInterior,")
ts.append('};')
open(f'{ROOT}/src/data/planRooms.generated.ts', 'w').write('\n'.join(ts) + '\n')
print('rooms', len(rooms))
