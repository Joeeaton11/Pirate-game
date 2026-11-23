"""Renders the whole of Tortuga as the game draws it in Art mode (ground, building shadows, buildings,
trees, props and set dressing, sorted back to front) into one image, plus close-ups of each district.
For checking the layout before the painted art pass. Run from the repo root after a build:
  python3 tools/blueprint/render_full.py [out_dir]   (default docs/art_reference/layout)"""
import os, re, sys
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'docs/art_reference/layout')
X0, Y0, S = -620, -580, 6
os.makedirs(OUT, exist_ok=True)

base = Image.open('/tmp/plan_art_full.png').convert('RGBA')
sh = Image.open('/tmp/plan_art_shadow.png').convert('RGBA')
if sh.size != base.size: sh = sh.resize(base.size)
base.alpha_composite(sh)

def table(ts, name):
    src = open(os.path.join(ROOT, 'src/blueprint', ts)).read()
    files = {m.group(1): m.group(2) for m in re.finditer(r"^  (\w+): \{ src: require\('\.\./\.\./([^']+)'\)", src, re.M)}
    slots = [(a, float(x), float(y), float(w)) for a, x, y, w in re.findall(r"\['(\w+)', ([-\d.]+), ([-\d.]+), ([-\d.]+)\]", src.split(name)[1])]
    return files, slots

items = []
for ts, name in (('artObjects.generated.ts', 'OBJ_SLOTS'), ('tortugaArtSlots.generated.ts', 'ART_SLOTS')):
    files, slots = table(ts, name)
    for a, x, y, w in slots:
        if a in files: items.append((y, a, x, w, os.path.join(ROOT, files[a])))
cache = {}
for y, a, x, w, f in sorted(items):
    if f not in cache: cache[f] = Image.open(f).convert('RGBA')
    im = cache[f]
    W = max(1, round(w * S)); H = max(1, round(W * im.size[1] / im.size[0]))
    spr = im.resize((W, H), Image.NEAREST)
    base.alpha_composite(spr, (round((x - X0) * S - W / 2), round((y - Y0) * S - H)))
base.convert('RGB').resize((base.size[0] // 4, base.size[1] // 4), Image.LANCZOS).save(os.path.join(OUT, 'island_overview.png'))

# district close-ups at full game resolution
sys.path.insert(0, os.path.dirname(__file__))
import plan_tortuga as P
crops = {}
src = open(os.path.join(ROOT, 'src/blueprint/tortugaGameplay.generated.ts')).read()
m = re.search(r'BP_DISTRICT_CENTRES[^=]*=\s*(\[.*?\]);', src, re.S)
if m:
    for name, cx, cy in re.findall(r'name: "([^"]+)", x: ([-\d.]+), y: ([-\d.]+)', m.group(1)):
        crops[name] = (float(cx), float(cy))
for name, (cx, cy) in crops.items():
    l, t = (cx - 70 - X0) * S, (cy - 60 - Y0) * S
    box = tuple(int(v) for v in (max(0, l), max(0, t), min(base.size[0], l + 140 * S), min(base.size[1], t + 120 * S)))
    base.crop(box).convert('RGB').save(os.path.join(OUT, 'district_' + re.sub(r'\W+', '_', name.lower()).strip('_') + '.png'))
print('overview + %d districts ->' % len(crops), OUT)
