"""The art spec: turns the draft island into a precise brief for the painted art.

Writes, every build:
- docs/art_reference/guides/<group>/<id>.png  each asset at 16 px/unit with the player beside it for
  scale, the ground-contact dot, the sun direction and (buildings) the night windows and chimneys
- docs/art_reference/ground_layout_key.png / ground_layout_lines.png  flat colour-key and outline maps of
  the ground, so an image tool keeps the coastline, roads and docks exactly where they are
- docs/art_reference/manifest.json + src/blueprint/artManifest.generated.ts  every asset with its group,
  hero/kit, size, copies, priority, status, animation and variety targets (used by the in-game inspector)
- docs/ART_PROGRESS.md  the progress counter and the priority-ordered to-do list
- the Art catalogue page (/home/claude/catalogue) for browsing all of it
"""
import json, math, os, re, shutil
from PIL import Image, ImageDraw, ImageFont
from shapely.geometry import Point, LineString, box
from shapely.ops import unary_union
from shapely.prepared import prep

X0, Y0, W, H = -620, -580, 1240, 1120
GUIDE_PPU = 16
PLAYER_UNITS = 8.5
HERO_OBJ = {'wreck_ship', 'harbour_light', 'skull_rock', 'careened_ship', 'whale_bones', 'kraken_bones', 'gibbet', 'crane',
            'falls', 'cave', 'statue', 'windmill', 'kiln'}
VARIETY = {'palm': 6, 'tree': 6, 'jungle': 6, 'mangrove': 4, 'rock': 6, 'dead_tree': 3, 'barrel': 3, 'barrels': 3, 'crates': 3,
           'sacks': 2, 'lamp': 2, 'stall': 3, 'canopy': 4, 'cart': 2, 'tent': 3, 'lean_to': 2, 'potted_palm': 2, 'bench': 2}
ANIM = {'gull': (4, 8), 'chicken': (4, 6), 'crow': (4, 6), 'parrot': (4, 6), 'crab': (4, 8), 'goat': (4, 4), 'pig': (4, 4),
        'turtle': (4, 3), 'flag': (4, 6), 'jolly_roger': (4, 6), 'campfire': (4, 10), 'rowboat_moored': (2, 2), 'fishing_boat': (2, 2)}
KEY = [('Deep sea', (8, 88, 125)), ('Shallows', (60, 200, 204)), ('Sand / beach', (232, 212, 156)), ('Grass', (134, 178, 94)),
       ('Woodland floor', (62, 116, 56)), ('Fields', (214, 186, 110)), ('Dirt path', (217, 189, 132)), ('Cobbles / town street', (164, 154, 136)),
       ('Planks (docks, wharf, bridges)', (150, 98, 58)), ('Rock / cliffs', (96, 92, 86)), ('Fresh water', (60, 170, 200)),
       ('Stone breakwater', (130, 126, 118))]


def kind_of(aid):
    m = re.match(r'^(.*?)_(\d+)$', aid)
    return (m.group(1), int(m.group(2))) if m else (aid, 0)


def build(root, P, coast, beach, zones, water, town_rects, town_box, ways, dock_geoms, bridges, breakwater,
          art_slots, art_layers, life_sprites, terraces=()):
    ref = f'{root}/docs/art_reference'
    os.makedirs(f'{ref}/guides', exist_ok=True)
    # ---- visibility weights: the town and the paths are where the player spends the time
    near = prep(ways.buffer(25)); mid = prep(ways.buffer(60)); tb = prep(town_box)
    def vis(x, y):
        p = Point(x, y)
        return 3 if tb.contains(p) else 2 if near.contains(p) else 1 if mid.contains(p) else 0.4

    items = {}
    def add(aid, **kw):
        items[aid] = dict(id=aid, **kw)

    # buildings and homes
    for aid, a in art_slots.LAST_ASSETS.items():
        if a['kind'] not in ('building', 'home') or not a['file']: continue
        places = art_slots.PLACES.get(aid, [])
        wins, chims = art_slots.FEATS.get(aid, ([], []))
        add(aid, group='buildings', label=a['desc'].split(' — ')[0], hero=aid.startswith('bld_'), w=round(a['w'], 1),
            count=len(places), places=places, windows=len(wins), chimneys=len(chims),
            ref=f'docs/art_reference/buildings/{aid}.png', painted=aid in art_slots.PAINTED,
            score=sum(vis(x, y) for x, y in places))
    # objects
    for aid, places in art_layers.OBJ_PLACES.items():
        k, v = kind_of(aid)
        w, aspect = art_layers.OBJ_SIZE[aid]
        hero = k in HERO_OBJ or aid.startswith('board_')
        add(aid, group='objects', label=(k.replace('_', ' ') if not aid.startswith('board_') else 'Name board: ' + aid[6:].replace('_', ' ').title()),
            kind=k, variant=v, hero=hero, w=round(w, 1), count=len(places), places=places,
            ref=f'docs/art_reference/obj/{aid}.png', painted=aid in art_layers.PAINTED_OBJ, score=sum(vis(x, y) for x, y in places))
    # moving life
    for k, info in life_sprites.LIFE_KINDS.items():
        places = life_sprites.LIFE_PLACES.get(k, [])
        tf, fps = ANIM.get(k, (2, 4))
        for i in range(info['frames']):
            aid = f'{k}_{i}'
            add(aid, group='life', label=f'{k.replace("_", " ")} — frame {i + 1} of {info["frames"]}', kind=k, hero=False,
                w=round(info['w'], 1), count=len(places), places=places, frames_have=info['frames'], frames_target=tf, fps=fps,
                ref=f'docs/art_reference/life/{aid}.png', painted=aid in life_sprites.PAINTED_LIFE,
                score=1.5 * sum(vis(x, y) for x, y in places))
    # the ground
    add('ground', group='ground', label='The whole island ground (one image)', hero=True, w=W, count=1, places=[],
        ref='docs/art_reference/ground_reference.png', painted=os.path.exists(f'{root}/assets/art_painted/ground.png'), score=10 ** 6)

    # ---- priority tiers by how much the player sees each asset
    ranked = sorted(items.values(), key=lambda a: -a['score'])
    n = len(ranked)
    for i, a in enumerate(ranked):
        a['priority'] = 1 if i < n * 0.3 else 2 if i < n * 0.7 else 3
    # ---- variety: how many looks each kind has against how many it should have; the gaps are listed
    have = {}
    for a in items.values():
        if a['group'] == 'objects' and 'kind' in a: have.setdefault(a['kind'], set()).add(a['variant'])
    homes = [a for a in items.values() if a['group'] == 'buildings' and not a['hero']]
    variety = {k: dict(have=len(have.get(k, ())), target=t) for k, t in VARIETY.items() if k in have}
    variety['town houses (styles)'] = dict(have=len({a['label'] for a in homes}), target=12)
    missing = []
    for k, v in variety.items():
        for j in range(v['have'], v['target']):
            if k in have: missing.append(dict(id=f'{k}_{max(have[k]) + 1 + j - v["have"]}', kind=k, group='objects', status='missing variant'))
    # ---- status
    for a in items.values(): a['status'] = 'painted' if a['painted'] else 'code placeholder'
    done = sum(1 for a in items.values() if a['painted'])

    # ---- guide images
    font = ImageFont.load_default(size=15); big = ImageFont.load_default(size=26)
    player = None
    pf = f'{root}/assets/sprites/scally/v2/walk_s_0.png'
    if os.path.exists(pf):
        player = Image.open(pf).convert('RGBA'); bb = player.getbbox(); player = player.crop(bb)
        ph = int(PLAYER_UNITS * GUIDE_PPU * 0.9); player = player.resize((max(1, int(player.size[0] * ph / player.size[1])), ph), Image.LANCZOS)
    for a in items.values():
        if a['group'] == 'ground': continue
        src = f'{root}/{a["ref"]}'
        if not os.path.exists(src): continue
        im = Image.open(src).convert('RGBA')
        sw = int(a['w'] * GUIDE_PPU); sh = max(1, int(im.size[1] * sw / im.size[0]))
        im = im.resize((sw, sh), Image.NEAREST)
        pw = player.size[0] if player else 0
        Wd, Hd = sw + pw + 70, max(sh, player.size[1] if player else 0) + 70
        g = Image.new('RGBA', (Wd, Hd), (246, 242, 230, 255)); d = ImageDraw.Draw(g)
        for x in range(0, Wd, GUIDE_PPU * 4): d.line([x, 0, x, Hd], fill=(232, 226, 210, 255))
        for y in range(0, Hd, GUIDE_PPU * 4): d.line([0, y, Wd, y], fill=(232, 226, 210, 255))
        base = Hd - 40
        d.line([10, base, Wd - 10, base], fill=(150, 140, 120, 255))
        ox = 20
        g.alpha_composite(im, (ox, base - sh))
        d.ellipse([ox + sw / 2 - 5, base - 5, ox + sw / 2 + 5, base + 5], fill=(220, 40, 40, 255))  # ground contact
        if a['group'] == 'buildings':
            wins, chims = art_slots.FEATS.get(a['id'], ([], []))
            cx = ox + sw / 2
            for dx, dy in wins: d.rectangle([cx + dx * GUIDE_PPU - 4, base + dy * GUIDE_PPU - 5, cx + dx * GUIDE_PPU + 4, base + dy * GUIDE_PPU + 5], outline=(0, 190, 255, 255), width=3)
            for dx, dy in chims: d.ellipse([cx + dx * GUIDE_PPU - 5, base + dy * GUIDE_PPU - 5, cx + dx * GUIDE_PPU + 5, base + dy * GUIDE_PPU + 5], outline=(90, 90, 90, 255), width=2)
        if player: g.alpha_composite(player, (ox + sw + 30, base - player.size[1]))
        d.line([12, 12, 34, 30], fill=(230, 160, 30, 255), width=3); d.ellipse([6, 6, 18, 18], fill=(250, 200, 60, 255))  # sun upper left
        d.text((40, 8), f'{a["id"]}  {a["w"]} units wide  x{a["count"]}', font=font, fill=(60, 50, 40, 255))
        d.text((10, Hd - 30), 'red dot = where it stands   right = the player for scale   sun upper left' +
               ('   blue boxes = windows lit at night   grey ring = chimney smoke' if a['group'] == 'buildings' else ''), font=font, fill=(90, 80, 70, 255))
        os.makedirs(f'{ref}/guides/{a["group"]}', exist_ok=True)
        g.save(f'{ref}/guides/{a["group"]}/{a["id"]}.png')
        a['guide'] = f'docs/art_reference/guides/{a["group"]}/{a["id"]}.png'

    # ---- ground layout maps (2 px per unit, same framing as the ground)
    PX = 2
    T = lambda x, y: ((x - X0) * PX, (y - Y0) * PX)
    key = Image.new('RGB', (W * PX, H * PX), KEY[0][1]); kd = ImageDraw.Draw(key)
    def fill(g, col):
        for p in getattr(g, 'geoms', [g]):
            if p.is_empty or p.geom_type != 'Polygon': continue
            kd.polygon([T(*c) for c in p.exterior.coords], fill=col)
            for h in p.interiors: kd.polygon([T(*c) for c in h.coords], fill=KEY[3][1])
    C = dict(KEY)
    fill(coast.buffer(10).difference(coast), C['Shallows'])
    fill(coast, C['Grass'])
    fill(beach, C['Sand / beach'])
    for t, g in zones:
        if t in ('jungle', 'forest', 'swamp', 'palms'): fill(g, C['Woodland floor'])
        elif t in ('fields', 'sugarcane', 'allotment', 'orchard'): fill(g, C['Fields'])
        elif t in ('rock', 'quarry'): fill(g, C['Rock / cliffs'])
    fill(coast.difference(coast.buffer(-9)).difference(beach), C['Rock / cliffs'])
    fill(water, C['Fresh water'])
    for name, k, w, pts in P.ROADS:
        if k == 'secret': continue
        fill(LineString(pts).buffer(w / 2), C['Cobbles / town street'] if k in ('lane', 'ruinlane') else C['Dirt path'])
    for _, l, r, t, b in P.PLAZAS: fill(box(l, t, r, b), C['Cobbles / town street'])
    for kk, col in (('street', 'Cobbles / town street'), ('garden', 'Grass'), ('sand', 'Sand / beach'), ('water', 'Shallows'), ('wood', 'Planks (docks, wharf, bridges)')):
        for l, r, t, b in town_rects.get(kk, []): kd.rectangle([*T(l, t), *T(r, b)], fill=C[col])
    for *_, g in dock_geoms: fill(g, C['Planks (docks, wharf, bridges)'])
    if bridges is not None and not bridges.is_empty: fill(bridges, C['Planks (docks, wharf, bridges)'])
    if breakwater is not None and not breakwater.is_empty: fill(breakwater, C['Stone breakwater'])
    # legend
    lg = Image.new('RGB', (key.size[0], 44 * ((len(KEY) + 2) // 3) + 16), (250, 246, 236)); ld = ImageDraw.Draw(lg)
    for i, (nm, col) in enumerate(KEY):
        x, y = 16 + (i % 3) * (key.size[0] // 3), 10 + (i // 3) * 44
        ld.rectangle([x, y, x + 26, y + 26], fill=col, outline=(60, 50, 40)); ld.text((x + 36, y - 2), nm, font=big, fill=(40, 30, 20))
    out = Image.new('RGB', (key.size[0], key.size[1] + lg.size[1])); out.paste(key, (0, 0)); out.paste(lg, (0, key.size[1]))
    key.save(f'{ref}/ground_layout_key.png')  # clean colour key (no legend) for image tools
    out.save(f'{ref}/ground_layout_key_legend.png')
    # outline version: every edge between two materials, dark on white
    from PIL import ImageFilter
    edges = key.convert('L').filter(ImageFilter.FIND_EDGES).point(lambda v: 0 if v > 6 else 255)
    edges.save(f'{ref}/ground_layout_lines.png')

    # ---- manifest + in-game data
    man = dict(progress=dict(done=done, total=len(items)), items=sorted(items.values(), key=lambda a: (a['priority'], -a['score'])),
               variety=variety, missing_variants=missing)
    for a in man['items']: a['places'] = [[round(x), round(y)] for x, y in a['places']][:400]
    json.dump(man, open(f'{ref}/manifest.json', 'w'), indent=1)
    ts = ['// GENERATED by tools/blueprint/art_spec.py — what the Art inspector shows for each asset. Never hand-edit.',
          '/** id -> [group, label, hero, width units, copies, priority 1-3, painted, reference path] */',
          'export const ART_MANIFEST: Record<string, [string, string, boolean, number, number, number, boolean, string]> = {']
    for a in man['items']:
        ts.append(f"  {json.dumps(a['id'])}: [{json.dumps(a['group'])}, {json.dumps(a['label'])}, {str(a['hero']).lower()}, {a['w']}, {a['count']}, {a['priority']}, {str(a['painted']).lower()}, {json.dumps(a.get('guide', a['ref']))}],")
    ts.append('};')
    ts.append(f"export const ART_PROGRESS = {{ done: {done}, total: {len(items)} }};")
    open(f'{root}/src/blueprint/artManifest.generated.ts', 'w').write('\n'.join(ts) + '\n')

    # ---- progress page
    md = ['# Painted art progress', '', f'**{done} of {len(items)} assets painted.** Generated by `tools/blueprint/art_spec.py` on every build.', '',
          'Priority comes from how much the player sees each asset (town and paths count most). Hero pieces are one-off',
          'landmarks that need their own painting; kit pieces repeat and need a few variants.', '',
          'Each asset has a plain reference (send with the generation) and a guide (player for scale, ground dot, sun, windows).',
          'The ground has a colour-key map (`docs/art_reference/ground_layout_key.png`) and an outline map (`ground_layout_lines.png`)',
          'to send alongside its reference so the coastline, roads and docks stay put.', '']
    for pr in (1, 2, 3):
        md += [f'## Priority {pr}', '', '| Asset | What | Hero/kit | Width (units) | Copies | Status |', '|---|---|---|---|---|---|']
        for a in man['items']:
            if a['priority'] == pr:
                md.append(f"| `{a['id']}` | {a['label']} | {'hero' if a['hero'] else 'kit'} | {a['w']} | {a['count']} | {a['status']} |")
        md.append('')
    md += ['## Variety targets', '', '| Kind | Looks now | Target |', '|---|---|---|'] + [f'| {k} | {v["have"]} | {v["target"]} |' for k, v in variety.items()] + ['']
    md += ['## Animation targets', '', '| Kind | Frames now | Frames wanted | Speed (fps) |', '|---|---|---|---|'] + \
          [f'| {k} | {life_sprites.LIFE_KINDS[k]["frames"]} | {ANIM.get(k, (2, 4))[0]} | {ANIM.get(k, (2, 4))[1]} |' for k in sorted(life_sprites.LIFE_KINDS)] + ['']
    open(f'{root}/docs/ART_PROGRESS.md', 'w').write('\n'.join(md) + '\n')

    # ---- catalogue page (browsing only: one asset per card, never a generation sheet)
    cat = '/home/claude/catalogue'
    shutil.rmtree(cat, ignore_errors=True); os.makedirs(f'{cat}/img', exist_ok=True)
    for a in man['items']:
        srcf = f"{root}/{a.get('guide', a['ref'])}"
        if a['group'] == 'ground': srcf = f'{ref}/ground_reference.png'
        if not os.path.exists(srcf): continue
        im = Image.open(srcf).convert('RGB'); im.thumbnail((360, 300))
        im.save(f"{cat}/img/{a['id']}.jpg", quality=82); a['thumb'] = f"img/{a['id']}.jpg"
    lk = Image.open(f'{ref}/ground_layout_key_legend.png'); lk.thumbnail((1200, 1200)); lk.save(f'{cat}/img/ground_key.jpg', quality=85)
    # island outline for the little maps
    outline = coast if coast.geom_type == 'Polygon' else max(coast.geoms, key=lambda g: g.area)
    path = 'M' + ' L'.join(f'{(x - X0) / 4:.0f},{(y - Y0) / 4:.0f}' for x, y in outline.exterior.coords) + 'Z'
    data = [dict(id=a['id'], g=a['group'], l=a['label'], h=a['hero'], w=a['w'], c=a['count'], p=a['priority'], s=a['status'],
                 t=a.get('thumb'), r=a.get('guide', a['ref']), ref=a['ref'], win=a.get('windows'), fr=a.get('frames_have'), ft=a.get('frames_target'), fps=a.get('fps'),
                 pl=[[round((x - X0) / 4), round((y - Y0) / 4)] for x, y in a['places']][:200]) for a in man['items']]
    html = open(os.path.join(os.path.dirname(__file__), 'catalogue_template.html')).read()
    html = html.replace('__DATA__', json.dumps(data)).replace('__OUTLINE__', path).replace('__DONE__', str(done)).replace('__TOTAL__', str(len(items))) \
               .replace('__VARIETY__', json.dumps(variety)).replace('__MISSING__', json.dumps(missing))
    open(f'{cat}/index.html', 'w').write(html)
    print(f'  art spec: {len(items)} assets, {done} painted, {len(missing)} variants missing')
    return man
