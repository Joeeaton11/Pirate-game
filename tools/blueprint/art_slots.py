"""Art slots: one sprite slot for every building, home, tree and prop on Tortuga's plan, each naming an
art-list asset id. The game draws whatever image the asset registry holds for that id — today a
stand-in from the existing sprite library, later the new consistent art. Swapping art = changing
STANDINS (or dropping new files in), never re-placing anything.

Writes src/blueprint/tortugaArtSlots.generated.ts and docs/ART_LIST_TORTUGA.md (the master art list).
"""
import shutil
import glob, json, os, random
from PIL import Image

SPR = 'assets/sprites'

# Asset id -> stand-in file (relative to assets/sprites). None = no stand-in yet (the coloured base shows).
INFILL = set()


def _first(pattern):
    hits = sorted(glob.glob(f'{ROOT}/{SPR}/{pattern}'))
    return os.path.relpath(hits[0], f'{ROOT}/{SPR}') if hits else None

ROOT = None
V2_ALIAS = {'tortuga_shipyard': 'tortuga_v2_the_shipyard', 'tortuga_wayside_tavern': 'tortuga_v2_the_wayside_tavern',
            'tortuga_crossroads_shop': 'tortuga_v2_the_crossroads_shop'}
NAMED_STANDIN = {'bld_tortuga_lighthouse_tower': 'landmarks/lighthouse_1.png', 'bld_tortuga_farmstead': 'tortuga_v2/houses/house_3.png',
                 'bld_tortuga_charcoal_burner': 'tortuga_v2/houses/house_2.png', 'bld_tortuga_hermit_hut': 'tortuga_v2/houses/house_4.png',
                 'bld_tortuga_boatbuilder': 'tortuga_v2/buildings/tortuga_careening_shed.png', 'bld_tortuga_sugar_mill': None,
                 'home_barracks': 'tortuga_v2/buildings/tortuga_gaol.png', 'home_gate_tower': 'landmarks/turret_1.png',
                 'home_lookout': 'landmarks/watchtower_1.png', 'home_fishing_hut': 'tortuga_v2/houses/house_4.png',
                 'home_suzettes_still': 'tortuga_v2/houses/house_2.png', 'home_ringot_farmhouse': 'tortuga_v2/houses/house_3.png',
                 'home_barn': None}
PROP_STANDIN = {
    'barrels': 'tortuga_v2/props/barrels2.png', 'crates': 'tortuga_v2/props/crates.png', 'cart': 'tortuga_v2/props/cart.png',
    'bench': 'tortuga_v2/props/bench.png', 'well': 'tortuga_v2/props/well.png', 'lamp': 'tortuga_v2/props/lamp_iron.png',
    'lantern_post': 'tortuga_v2/props/lamp_wood.png', 'lantern': 'props/dock_lamp_1.png', 'stall': 'tortuga_v2/props/stall.png',
    'signpost': 'props/signpost_1.png', 'notice': 'props/notice_board*.png', 'campfire': 'props/campfire_1.png',
    'anchor': 'props/anchor_1.png', 'jolly_roger': 'props/flag_skull.png', 'fishing_rack': 'props/fish_rack*.png',
    'nets': 'props/fishing_net*.png', 'haystack': 'props/hay_bale*.png', 'flowerpot': 'props/potted_plant*.png',
    'grave': 'props/grave_marker*.png', 'pirate_grave': 'props/grave_marker*.png', 'rubble': 'props/ruin_stone_blocks*.png',
    'cannonballs': 'props/cannonball_pile_1.png', 'wheelbarrow': 'props/wheelbarrow*.png', 'spyglass': 'props/telescope_tripod*.png',
    'tavern_sign': 'props/tavern_sign_1.png', 'washing': 'props/clothesline*.png', 'rum_barrels': 'props/barrels_2.png',
    'powder_keg': 'props/barrel_3.png', 'water_butt': 'props/barrel_1.png', 'trough': 'props/crate_trough*.png',
    'sea_chest': 'treasure/chest_1.png', 'buried_chest': 'treasure/chest_2.png', 'chest': 'treasure/chest_3.png',
    'treasure_pile': 'treasure/chest_4.png', 'wreck': 'landmarks/shipwreck_debris_1.png', 'woodpile': 'props/dock_plank_bundle*.png',
    'timber': 'props/dock_plank_bundle*.png', 'x_mark': 'treasure/treasure_marker_1.png', 'cargo': 'props/crates_3.png',
    'bollard': 'props/dock_piling*.png', 'statue': 'landmarks/fountain_statue_1.png', 'mermaid_statue': 'landmarks/fountain_statue_2.png',
    'signal_fire': 'props/brazier*.png', 'signal_lamp': 'props/torch*.png', 'rope_coil': 'props/sacks*.png', 'shop_sign': 'props/tavern_sign_1.png',
}
# World width (units) each prop is drawn at.
PROP_W = {'barrels': 6, 'crates': 6, 'cart': 9, 'bench': 6, 'well': 7, 'lamp': 3.5, 'lantern_post': 3.5, 'lantern': 3, 'stall': 10,
          'signpost': 4, 'notice': 5, 'campfire': 5, 'anchor': 5, 'jolly_roger': 5, 'fishing_rack': 9, 'nets': 9, 'haystack': 6,
          'flowerpot': 3, 'grave': 3.5, 'pirate_grave': 3.5, 'rubble': 7, 'cannonballs': 4, 'wheelbarrow': 5, 'spyglass': 4,
          'tavern_sign': 4, 'washing': 13, 'rum_barrels': 8, 'powder_keg': 3.5, 'water_butt': 3.5, 'trough': 7, 'sea_chest': 4.5,
          'buried_chest': 4.5, 'chest': 4.5, 'treasure_pile': 6, 'wreck': 30, 'woodpile': 7, 'timber': 11, 'x_mark': 4, 'cargo': 8,
          'bollard': 2, 'statue': 6, 'mermaid_statue': 7, 'signal_fire': 5, 'signal_lamp': 3, 'rope_coil': 4, 'shop_sign': 3.5}
# The library has no clean broadleaf/jungle trees (they're cropped or sit on grass squares), so those
# stay painted on the Art map base until the new art arrives; palms and boulders have good stand-ins.
TREE_STANDIN = {'jungle': [None, None, None], 'tree': [None, None, None],
                'palm': ['nature/trees/palm_1.png', 'nature/trees/palm_2.png', 'nature/trees/palm_6.png', 'nature/trees/palm_8.png'],
                'mangrove': [None, None],
                'rock': ['nature/rocks/boulder_large_1.png', 'nature/rocks/boulder_large_2.png', 'nature/rocks/boulder_cluster_2.png']}
TREE_W = {'jungle': 11, 'tree': 13, 'palm': 11, 'mangrove': 10, 'rock': 8}

# Plain-English descriptions for the master art list.
def slug(s): return ''.join(c if c.isalnum() else '_' for c in s.lower()).strip('_').replace('__', '_')


def painted_over(root, aid, out):
    """If a painted version of this building exists, it replaces the code-drawn file (same slot and width)."""
    p = f'{root}/assets/art_painted/buildings/{aid}.png'
    os.makedirs(f'{root}/docs/art_reference/buildings', exist_ok=True)
    shutil.copy(out, f'{root}/docs/art_reference/buildings/{aid}.png')
    if os.path.exists(p):
        shutil.copy(out, out.replace('.png', '__code.png'))  # kept for the painted/code switch
        shutil.copy(p, out); PAINTED.add(aid)
    elif os.path.exists(out.replace('.png', '__code.png')): os.remove(out.replace('.png', '__code.png'))


def build(root, P, trees, town_box, town=None):
    global WINDOWS, CHIMNEYS, TOWN_BOXES, PAINTED, PLACES, FEATS
    WINDOWS, CHIMNEYS, TOWN_BOXES, PAINTED, PLACES, FEATS = [], [], [], set(), {}, {}
    global ROOT
    ROOT = root
    from shapely.geometry import Point
    slots, assets = [], {}

    def asset(aid, standin, kind, desc, w_units):
        if aid not in assets:
            f = standin
            if f and ('*' in f): f = _first(f)
            if f and not os.path.exists(f'{root}/{SPR}/{f}'): f = None
            if f and not f.startswith('plan_art/'):  # a stand-in must have a transparent background, or it shows as a box
                im = Image.open(f'{root}/{SPR}/{f}').convert('RGBA'); W_, H_ = im.size
                if max(im.getpixel(q)[3] for q in ((0, 0), (W_ - 1, 0), (0, H_ - 1), (W_ - 1, H_ - 1))) > 10: f = None
            assets[aid] = dict(file=f, kind=kind, desc=desc, w=w_units, count=0)
        assets[aid]['count'] += 1

    import sys as _sys
    _sys.path.insert(0, f'{root}/tools/art')
    import pixel_houses as houses, specs
    os.makedirs(f'{root}/{SPR}/plan_art', exist_ok=True)
    drawn = set()
    for n, b in enumerate(P.BUILDINGS):
        bid, label, kind, cx, cy, w, h, side = b
        aid = f'bld_{bid}' if bid else f'home_{slug(label)}_{w:g}x{h:g}_{n % 5}'
        if not bid and label in ('Gate Tower', 'Lookout', 'Barracks', 'Barn'): aid = f'home_{slug(label)}'
        sp = specs.spec_for(b, n)
        rel = f'plan_art/{aid}.png'
        sw = houses.render(sp, f'{root}/{SPR}/{rel}')
        _w, _c = houses.features(cx, cy + h / 2 + 1.2)
        PLACES.setdefault(aid, []).append((cx, cy + h / 2 + 1.2)); FEATS[aid] = ([(round(x - cx, 1), round(y - cy - h / 2 - 1.2, 1)) for x, y in _w], [(round(x - cx, 1), round(y - cy - h / 2 - 1.2, 1)) for x, y in _c])
        painted_over(root, aid, f'{root}/{SPR}/{rel}')
        asset(aid, rel, 'building' if bid else 'home', f'{label} — {kind}, footprint {w:g}×{h:g}, door {side or "none"} (pixel art drawn in code)', sw)
        slots.append((aid, cx, cy + h / 2 + 1.2, round(sw, 2)))
        WINDOWS.extend(_w); CHIMNEYS.extend(_c)
        drawn.add(n)
    # the town core (Basse-Terre): one sprite per house of each terrace, kind from the game's building type
    if town:
        town_bldgs, town_doors = town
        bts = open(f'{root}/src/data/buildings.ts').read()
        import re as _re
        types = dict(_re.findall(r"id: '(tortuga_[a-z0-9_]+)',\s*\n\s*islandId: 'tortuga_cove',\s*\n\s*name: [^\n]+\n\s*type: '([a-z]+)'", bts))
        KIND = {'tavern': 'tavern', 'shop': 'shop', 'market': 'market', 'warehouse': 'warehouse', 'smithy': 'civic', 'customs': 'civic',
                'chapel': 'civic', 'manor': 'manor', 'gaol': 'civic', 'fort': 'fort', 'watchtower': 'civic', 'college': 'civic', 'shrine': 'civic'}
        for n, (l, r, t, b) in enumerate(town_bldgs):
            ids = [i for i, x, y in town_doors if l - 1 <= x <= r + 1 and abs(y - b) < 8]
            bid = next((i for i in ids if i), None)
            small = (l, r, t, b) in INFILL  # the town's infill houses (scenery, no door of their own to enter)
            kind = KIND.get(types.get(bid, ''), 'home') if bid else ('home' if ids or small else 'warehouse')
            if small and not bid:  # how well-off the street is, by how far up the hill it stands
                import town_plan as _tpl
                kind = {'hut': 'shed', 'home': 'home', 'grand': 'manor'}[_tpl.wealth(b)]
            w, h = r - l, b - t
            sp = specs.spec_for((bid, 'Town house', kind, (l + r) / 2, (t + b) / 2, w, h, 'S' if ids or small else None), n + 300)
            sp['door'] = bool(ids) or small
            import town_plan as _tp2
            _run = _tp2.TERRACES.get((l, r, t, b)) if not bid else None
            if _run:  # a terrace: one roof line, one height, one roof material; each house its own colour
                _rr = random.Random(_run * 7919)
                sp.update(massing='ridge', terrace=True, tight=True, storeys=_rr.choice([1, 2, 2]),
                          roof=_rr.choice(['tile', 'tile_dark', 'slate', 'tile_orange']), roof_h=None, chimney=True)
            # terraced: a neighbour wall to wall on either side means no eave overhang or side shadow
            if any(abs(l2 - r) < 1.5 or abs(r2 - l) < 1.5 for l2, r2, t2, b2 in town_bldgs if (l2, r2, t2, b2) != (l, r, t, b) and abs(b2 - b) < 4):
                sp['tight'] = True
            # the house in front must not hide the front of the one behind it: cap its drawn height
            lim = min([b - b2 - 0.3 for l2, r2, t2, b2 in town_bldgs if b2 < b - 2 and min(r, r2) - max(l, l2) > 1] or [99])
            aid = f'town_{n}'
            rel = f'plan_art/{aid}.png'
            sw = houses.render(sp, f'{root}/{SPR}/{rel}')
            for _try in range(6):
                _im = Image.open(f'{root}/{SPR}/{rel}')
                if sw * _im.size[1] / _im.size[0] <= lim: break
                if sp.get('storeys', 1) > 1: sp['storeys'] = 1
                else: sp['d'] = max(4, sp['d'] * 0.75)
                sw = houses.render(sp, f'{root}/{SPR}/{rel}')
            if bid == 'tortuga_chapel':  # the town's landmark: a tall stone bell tower on the chapel's west end
                _tp = f'{root}/{SPR}/plan_art/_tower_tmp.png'
                houses.render({'shape': 'tower', 'w': 6, 'height': 17, 'wall': 'stone', 'flag': '#f1ead8', 'door': False}, _tp)
                _ch = Image.open(f'{root}/{SPR}/{rel}').convert('RGBA'); _tw = Image.open(_tp).convert('RGBA')
                _k = _ch.size[0] / (sw * 6)  # stored pixels per art pixel
                if abs(_k - 1) > 0.05: _tw = _tw.resize((round(_tw.size[0] * _k), round(_tw.size[1] * _k)), Image.NEAREST)
                _H = max(_ch.size[1], _tw.size[1])
                _out = Image.new('RGBA', (_ch.size[0], _H), (0, 0, 0, 0))
                _out.alpha_composite(_ch, (0, _H - _ch.size[1]))
                _out.alpha_composite(_tw, (0, _H - _tw.size[1]))
                _out.save(f'{root}/{SPR}/{rel}'); os.remove(_tp)
            _w, _c = houses.features((l + r) / 2, b + 1.2)
            PLACES.setdefault(aid, []).append(((l + r) / 2, b + 1.2)); FEATS[aid] = ([(round(x - (l + r) / 2, 1), round(y - b - 1.2, 1)) for x, y in _w], [(round(x - (l + r) / 2, 1), round(y - b - 1.2, 1)) for x, y in _c])
            painted_over(root, aid, f'{root}/{SPR}/{rel}')
            asset(aid, rel, 'building', f'Basse-Terre {bid or "house"} — {kind}, footprint {w:g}×{h:g}', sw)
            slots.append((aid, (l + r) / 2, b + 1.2, round(sw, 2)))
            WINDOWS.extend(_w); CHIMNEYS.extend(_c)
            _im = Image.open(f'{root}/{SPR}/{rel}'); TOWN_BOXES.append((l, r, t, b, b + 1.2, sw * _im.size[1] / _im.size[0]))
    for i, (x, y, k) in enumerate(trees):
        if town_box.contains(Point(x, y)): continue
        opts = TREE_STANDIN[k]
        v = (int(abs(x) * 7 + abs(y) * 3)) % len(opts)
        aid = f'tree_{k}_{v + 1}'
        asset(aid, opts[v], 'tree', f'{ {"jungle": "Jungle tree", "tree": "Broadleaf tree", "palm": "Palm", "mangrove": "Mangrove", "rock": "Boulder"}[k] } (variant {v + 1})', TREE_W[k])
        assets[aid]['file'] = None  # trees stay painted on the base until new art
        continue
        slots.append((aid, x, y + TREE_W[k] * 0.15, TREE_W[k] * (0.9 + ((i * 37) % 20) / 100)))
    for k, x, y in P.PROPS:
        if town_box.contains(Point(x, y)) and k not in ('notice',): continue
        aid = f'prop_{k}'
        asset(aid, None, 'prop', k.replace('_', ' '), PROP_W.get(k, 5))
        continue  # props stay painted on the base until new art

    # registry + slots for the game
    ts = ['// GENERATED by tools/blueprint/art_slots.py — every art slot on Tortuga and the image each asset uses.',
          '// To swap in new art: change STANDINS in art_slots.py (or replace the file) and rebuild. Never hand-edit.',
          "import type { ImageSourcePropType } from 'react-native';", '',
          '/** Asset id -> image and its height/width ratio. Assets without an image are not drawn yet. */',
          'export const ART_ASSETS: Record<string, { src: ImageSourcePropType; aspect: number; code?: ImageSourcePropType; codeAspect?: number }> = {']
    for aid, a in sorted(assets.items()):
        if not a['file']: continue
        im = Image.open(f'{root}/{SPR}/{a["file"]}'); bb = im.getbbox() or (0, 0, *im.size)
        code = ''
        if aid in PAINTED:
            cf = a['file'].replace('.png', '__code.png'); ci = Image.open(f'{root}/{SPR}/{cf}')
            code = f", code: require('../../{SPR}/{cf}'), codeAspect: {round(ci.size[1] / ci.size[0], 3)}"
        ts.append(f"  {aid}: {{ src: require('../../{SPR}/{a['file']}'), aspect: {round(im.size[1] / im.size[0], 3)}{code} }},")
    ts.append('};')
    ts.append('/** Window centres and chimney tops of the drawn buildings (island-relative): lit and smoking in Art mode. */')
    ts.append('export const ART_WINDOWS: [number, number][] = [' + ', '.join(f'[{x:g}, {y:g}]' for x, y in WINDOWS) + '];')
    ts.append('export const ART_CHIMNEYS: [number, number][] = [' + ', '.join(f'[{x:g}, {y:g}]' for x, y in CHIMNEYS) + '];')
    ts.append('/** [asset id, x, ground y (island-relative), width in world units], sorted back to front. */')
    slots.sort(key=lambda s: s[2])
    global SLOT_RECTS
    SLOT_RECTS = []
    for a_, x_, y_, w_ in slots:
        if assets.get(a_, {}).get('file'):
            _i = Image.open(f'{root}/{SPR}/{assets[a_]["file"]}'); SLOT_RECTS.append((x_ - w_ / 2, y_ - w_ * _i.size[1] / _i.size[0], x_ + w_ / 2, y_))
    ts.append('export const ART_SLOTS: [string, number, number, number][] = [' + ', '.join(f"['{a}', {x:g}, {round(y, 1):g}, {w:g}]" for a, x, y, w in slots) + '];')
    open(f'{root}/src/blueprint/tortugaArtSlots.generated.ts', 'w').write('\n'.join(ts) + '\n')

    # master art list
    md = ['# Tortuga — master art list', '',
          'Generated from the plan by `tools/blueprint/art_slots.py`. **One asset per image** — every row is its own',
          'separate generation, never a sheet. Follow `docs/ART_STYLE_GUIDE.md` for every asset.', '',
          'Status: **drawn in code** = a polished code-drawn sprite fills the slot now (generated by `tools/art/houses.py`);',
          '**missing** = nothing yet, the coloured map shows through.', '']
    order = [('building', 'Buildings (bespoke, one per named building)'), ('home', 'Homes, huts and outbuildings'),
             ('tree', 'Trees and rocks'), ('prop', 'Props')]
    pr = {'building': 1, 'home': 1, 'tree': 2, 'prop': 3}
    for kind, title in order:
        md.append(f'## {title}'); md.append('')
        md.append('| Asset id | What | Size on map (units wide) | Used | Status | Priority |')
        md.append('|---|---|---|---|---|---|')
        for aid, a in sorted(assets.items(), key=lambda kv: (-kv[1]['count'], kv[0])):
            if a['kind'] != kind: continue
            status = 'drawn in code' if a['file'] else '**missing**'
            md.append(f"| `{aid}` | {a['desc']} | {a['w']:.0f} | {a['count']}× | {status} | {pr[kind] if a['file'] else 1} |")
        md.append('')
    os.makedirs(f'{root}/docs', exist_ok=True)
    open(f'{root}/docs/ART_LIST_TORTUGA.md', 'w').write('\n'.join(md) + '\n')
    global LAST_ASSETS
    LAST_ASSETS = assets
    return assets, drawn, (len(slots), len(assets), sum(1 for a in assets.values() if not a['file']))
