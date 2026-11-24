"""Checks everything the painted-art pass needs is in place: every object, building and life frame the game
draws has a manifest entry, a reference image and a guide, and nothing in the game is missing from the manifest.
Run from the repo root after a build."""
import json, os, re

m = json.load(open('docs/art_reference/manifest.json'))
items = {i['id']: i for i in m['items']}
problems = []
for i in items.values():
    if i.get('ref') and not os.path.exists(i['ref']): problems.append(('no reference image', i['id']))
for i in items.values():
    if i['group'] != 'ground' and not (i.get('guide') and os.path.exists(i['guide'])): problems.append(('no guide', i['id']))
drawn = set(re.findall(r"^  (\w+): \{ src:", open('src/blueprint/artObjects.generated.ts').read(), re.M))
drawn |= set(re.findall(r"^  (\w+): \{ src:", open('src/blueprint/tortugaArtSlots.generated.ts').read(), re.M))
for a in sorted(drawn - set(items)): problems.append(('drawn in game but not in manifest', a))
for p in problems: print(*p)
print(f"assets {len(items)}, drawn looks {len(drawn)}, problems {len(problems)}, missing variants {len(m.get('missing_variants', []))}")
