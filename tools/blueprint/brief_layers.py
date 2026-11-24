"""Writes LAYER_ART_BRIEF.md: the art for Tortuga, layer by layer, straight from the blueprint.
Every asset is its own generation (AGENTS.md: one asset per image, never a grid/sheet), sized from
the plan so it drops onto its footprint. Usage: python3 brief_layers.py"""
import re
from collections import Counter, OrderedDict
import sources as S
import plan_tortuga as P

ROOT = S.ROOT
names = S.building_names()
ONE = 'One asset per image: a single isolated item, not a sheet, grid, row or collage of several items.'
BG = 'Flat pure-green (#00FF00) background for keying, no shadow on the background, no text, no border.'
STYLE = ('Match the attached MASTER_STYLE_harbour.png: dense retro pixel art with visible pixel grain, high top-down '
         'three-quarter view (large roof seen from above, front wall plus a little side wall), weathered Caribbean pirate '
         'port, warm terracotta roofs, crisp dark outlines.')
PX = 7  # one world unit is 7 screen px at the map's zoom; generate at 3x that and downscale

def ridge(w, h):
    return 'east–west' if w >= h else 'north–south'

def door_face(side):
    return {'N': 'back (north) wall, facing away from the viewer', 'S': 'front (south) wall, facing the viewer',
            'E': 'right (east) wall', 'W': 'left (west) wall', None: 'no door'}[side]

lines = ['# Layer Art Brief — Tortuga Cove', '',
         'Generated from the island blueprint (`tools/blueprint/plan_tortuga.py`) by `tools/blueprint/brief_layers.py`.',
         'Re-run it after the plan changes. Each layer below is painted on its own, in this order, and each asset is',
         'traced from the matching plan layer (`tools/blueprint/layers/*.svg`) so the art lands exactly on the plan.', '',
         '## Rules for every generation', '',
         f'- **{ONE}** If a group below lists several items, each one is still its own separate image generation.',
         f'- {STYLE}',
         f'- {BG}',
         f'- Sizes: footprints are in world units (1 unit = {PX} screen px at map zoom). Generate at about {PX * 3} px per unit, then downscale.',
         '- Attach the plan layer crop for that asset as a second reference so the footprint, roof ridge and door match.', '']

def section(title, intro):
    lines.extend([f'## {title}', '', intro, ''])

def asset(name, prompt, meta=''):
    lines.append(f'### {name}')
    if meta: lines.append(f'*{meta}*')
    lines.extend(['', '```', prompt.strip(), '```', ''])

# 1. Ground
section('Layer 1 — Ground surfaces (seamless tiles)',
        'From the *Ground surface* and *Terrain zones* layers. Each is one seamless square tile that repeats without seams.')
for name, desc in [('Grass', 'short tropical meadow grass with a few tiny flowers and darker tufts'),
                   ('Sand', 'pale beach sand with faint ripples and a few shells'),
                   ('Dirt road', 'packed brown cart-road dirt with wheel ruts and pebbles'),
                   ('Cobbles', 'worn sandy cobblestones with moss in the gaps'),
                   ('Planks', 'weathered dock planks running left to right, nail heads, gaps between boards'),
                   ('Jungle floor', 'dense dark jungle floor: leaf litter, ferns, roots'),
                   ('Woodland floor', 'lighter forest floor: grass, fallen leaves, small shrubs'),
                   ('Swamp', 'mangrove swamp: shallow brown-green water, mud banks, roots'),
                   ('Tilled field', 'farm field in straight furrows running left to right'),
                   ('Sugarcane', 'dense rows of tall sugarcane seen from above'),
                   ('Rock', 'grey island rock with cracks, lichen and loose stones'),
                   ('Shallow sea', 'clear turquoise shallow water over sand, gentle ripples'),
                   ('River', 'fresh river water, slightly darker blue-green, soft ripples')]:
    asset(f'Ground tile — {name}', f'Seamless square terrain tile, 256x256 px, top-down: {desc}. Tiles perfectly on all four edges. '
          f'{STYLE} {ONE} No background keying needed (full-bleed tile).')
asset('Coast edge — sand to sea', f'One seamless horizontal strip tile, 256x128 px: beach sand at the top meeting turquoise sea at the bottom with a foam line. Tiles left-right. {STYLE} {ONE}')
asset('Coast edge — cliff to sea', f'One seamless horizontal strip tile, 256x128 px: rocky cliff top at the top dropping to sea with surf at the bottom. Tiles left-right. {STYLE} {ONE}')

# 2. Roads, bridges, docks
section('Layer 2 — Bridges and docks (modules)', 'From the *Bridges* and *Docks & piers* layers. Pieces join end to end along the plan lines.')
for name, desc in [('Pier — straight section', 'one straight section of wooden pier, planks across, posts on both sides, 8 units wide x 16 long, running top to bottom'),
                   ('Pier — end', 'the end of a wooden pier with a mooring post and coiled rope, 8 units wide'),
                   ('Pier — T-junction', 'a wooden pier T-junction piece, 8 units wide'),
                   ('Slipway', 'a timber slipway ramp running down into the water, 10 units wide x 30 long'),
                   ('Footbridge', 'a small wooden plank footbridge with rope rails over a stream, 8 units wide x 12 long'),
                   ('Breakwater section', 'a section of rough rubble breakwater with surf on both sides, 8 units wide x 24 long')]:
    asset(name, f'{desc}. {STYLE} {BG} {ONE}')

# 3. Buildings
section('Layer 3 — Buildings', 'From the *Interactive buildings*, *Homes & sheds* and *Roofs* layers: each building is drawn to its own '
        'footprint, with a hipped roof whose ridge runs along the longer side and the door on the face the plan shows.')
seen = OrderedDict()
for b in P.BUILDINGS:
    bid, label, kind, cx, cy, w, h, side = b
    key = bid or (label if label != 'Cottage' else f'Cottage {w}x{h} door {side}')
    if key in seen: seen[key][1] += 1; continue
    seen[key] = [b, 1]
for key, (b, n) in seen.items():
    bid, label, kind, cx, cy, w, h, side = b
    title = names.get(bid) or label
    extra = {'tavern': 'a rowdy pirate tavern with a hanging sign', 'shop': 'a small shop with an awning and goods by the door',
             'civic': 'a sober stone civic building', 'warehouse': 'a timber warehouse with big doors and stacked cargo',
             'market': 'an open-fronted market hall', 'home': 'a modest island cottage', 'fort': 'a squat stone fort with a gate and cannon embrasures',
             'manor': "a governor's manor with shutters and a small portico", 'ruin': 'a crumbling old stone fort ruin, roofless in places',
             'landmark': 'a tall whitewashed lighthouse with a lamp room', 'shed': 'a small timber shed'}.get(kind, 'a building')
    asset(f'{title}' + (f' (×{n})' if n > 1 else ''),
          f'{title}: {extra}. Footprint {w} x {h} world units (aspect {w / h:.2f}:1), seen from the high three-quarter view. '
          f'Hipped roof, ridge running {ridge(w, h)}. Door on the {door_face(side)}. {STYLE} {BG} {ONE}',
          f'{kind} · footprint {w}×{h} · door {side or "—"}' + (f' · used {n} times' if n > 1 else ''))

# 4. Trees and rocks
section('Layer 4 — Trees and rocks', 'From the *Trees & planting* and *Rocks* layers. Three variants of each, each variant its own generation.')
for name, desc, size in [('Jungle tree', 'a dense dark-green jungle tree canopy seen from above', 8), ('Broadleaf tree', 'a round broadleaf tree canopy', 10),
                         ('Palm tree', 'a coconut palm seen from above, fronds spread in a star', 7), ('Mangrove', 'a low tangled mangrove with roots in water', 7),
                         ('Rock', 'a grey island boulder with moss', 7)]:
    for v in (1, 2, 3):
        asset(f'{name} — variant {v}', f'{desc}, about {size} world units across, variant {v} of 3 (different shape from the others). {STYLE} {BG} {ONE}')

# 5. Props
section('Layer 5 — Props', 'From the *Props* and *Moored boats* layers.')
counts = Counter(k for k, x, y in P.PROPS)
PDESC = {'signpost': 'a wooden crossroads signpost with two arrow boards', 'well': 'a round stone well with a rope and bucket',
         'crates': 'a small stack of wooden cargo crates', 'barrels': 'a cluster of three wooden barrels', 'cart': 'a two-wheeled wooden hand cart',
         'bench': 'a plain wooden bench', 'lamp': 'an iron street lamp post with a lantern', 'cannon': 'a black iron cannon on a wooden carriage',
         'grave': 'a weathered wooden grave cross with a small mound', 'boat': 'a small wooden rowboat pulled up on the sand',
         'cave': "a dark cave mouth in a rock face (the smugglers' grotto)", 'wreck': 'the broken hull of a wrecked galleon half in the surf',
         'marked_palm': 'a leaning palm with an X carved into its trunk', 'campfire': "a trapper's campfire ring with a spit", 'still': 'a copper moonshine still'}
for k, n in counts.items():
    asset(k.replace('_', ' ').title() + (f' (×{n})' if n > 1 else ''), f'{PDESC.get(k, k)}. {STYLE} {BG} {ONE}', f'used {n} time(s)')
asset('Moored rowboat', f'a small wooden rowboat on the water seen from above, tied with a rope, bow pointing right. {STYLE} {BG} {ONE}', f'used {len(P.MOORED)} times')

lines.extend(['## Order of work', '', '1. Ground tiles and coast edges', '2. Bridges and dock modules', '3. Buildings (interactive first)',
              '4. Trees and rocks', '5. Props and boats', '',
              'After each layer is cut and keyed it replaces that plan layer in the game; the walk map and doors stay on the plan.', ''])
n_assets = sum(1 for l in lines if l.startswith('### '))
lines.insert(2, f'**{n_assets} separate generations.**')
lines.insert(3, '')
open(f'{ROOT}/LAYER_ART_BRIEF.md', 'w').write('\n'.join(lines))
print('assets', n_assets)
