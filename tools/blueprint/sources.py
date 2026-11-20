"""Read the existing Tortuga data (TS files) into Python for the blueprint builder."""
import re, json
ROOT = __file__.rsplit('/tools/', 1)[0]
def rd(p): return open(f'{ROOT}/{p}').read()

def coast():
    s = rd('src/data/islands.ts')
    body = re.search(r'const TORTUGA_SHAPE = polygon\(\[(.*?)\]\);', s, re.S).group(1)
    return [(float(a), float(b)) for a, b in re.findall(r'\[(-?[\d.]+), (-?[\d.]+)\]', body)]

def v2(name):
    s = rd('src/data/tortugaV2.ts')
    body = re.search(rf'export const {name}: \w+\[\] = \[(.*?)\n\];', s, re.S).group(1)
    return [json.loads(l.strip().rstrip(',')) for l in body.strip().split('\n') if l.strip().startswith('{')]

def streets():
    s = rd('src/data/streets.ts')
    out = []
    for m in re.finditer(r"islandId: 'tortuga_cove', from: \{ x: (-?[\d.]+), y: (-?[\d.]+) \}, to: \{ x: (-?[\d.]+), y: (-?[\d.]+) \}, style: '(\w+)'(?:, width: ([\d.]+))?", s):
        x1, y1, x2, y2 = map(float, m.group(1, 2, 3, 4))
        out.append(((x1, y1), (x2, y2), m.group(5), float(m.group(6) or (6 if m.group(5) == 'main' else 4))))
    return out

def scenery():
    s = rd('src/data/scenery.ts')
    return [(float(x), float(y), e) for x, y, e in re.findall(r"islandId: 'tortuga_cove', offset: \{ x: (-?[\d.]+), y: (-?[\d.]+) \}, emoji: '([^']+)'", s)]

def landmarks():
    s = rd('src/data/landmarks.ts')
    out = []
    for blk in re.findall(r'\{\s*(?://[^\n]*\n\s*)*id: \'(\w+)\',\s*islandId: \'tortuga_cove\',\s*offset: \{ x: (-?[\d.]+), y: (-?[\d.]+) \},\s*name: (["\'])(.*?)\4', s, re.S):
        out.append((blk[0], float(blk[1]), float(blk[2]), blk[4]))
    return out

def piers():
    s = rd('src/data/harbor.ts')
    return [((float(a), float(b)), (float(c), float(d)), 'townDrawn' in rest) for a, b, c, d, rest in re.findall(
        r"islandId: 'tortuga_cove', from: \{ x: (-?[\d.]+), y: (-?[\d.]+) \}, to: \{ x: (-?[\d.]+), y: (-?[\d.]+) \}(.*?)\}", s)]

def painted():
    s = rd('src/town/tortugaPainted.generated.ts')
    B = list(map(float, re.search(r'const B: number\[\] = \[(.*?)\];', s, re.S).group(1).split(',')))
    doors = [(m[0], float(m[1]), float(m[2])) for m in re.findall(r"id: '(\w+)', x: ([-\d.]+), y: ([-\d.]+)", s)]
    return [tuple(B[i:i + 4]) for i in range(0, len(B), 4)], doors

def building_names():
    s = rd('src/data/buildings.ts')
    return dict(re.findall(r"id: '(\w+)',\s*(?:islandId: '\w+',\s*)?name: [\"'](.*?)[\"']", s))
