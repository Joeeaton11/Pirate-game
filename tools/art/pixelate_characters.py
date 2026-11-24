"""Snap the characters' map sprites onto the locked pixel grid (6 art pixels per world unit, AGENTS.md):
each frame is shrunk so one art pixel is 1/6 of a world unit at the size the game draws it, edges are made
hard, and it is stored 3x (nearest) beside the original in a px6/ folder. The originals stay untouched.
Run from the repo root, then point the sprite tables at the px6 folders (done once, see the sed below)."""
import glob, os
from PIL import Image

PPU, STORE = 6, 3
# folder -> world units that the full canvas height is drawn at in the game
JOBS = {
    'assets/sprites/scally/v2': 8.5 * 1.5 * 1.15,        # PLAYER_SIZE * 1.5 * 1.15 (MapScreen)
    'assets/sprites/scally/cheeky_v2': 9.5,              # CHEEKY_SIZE
    'assets/sprites/characters/npcs/walk': 11.5 * 128 / 108,  # WALKER_HEIGHT * walkScale
    'assets/sprites/characters/npcs': 11.5,              # standing: WALKER_HEIGHT tall (TownLife, ArtWorld FOLK_H)
    'assets/sprites/characters/npcs/sit': 11.5 * 104 / 128,
}
n = 0
for folder, units in JOBS.items():
    out = os.path.join(folder, 'px6'); os.makedirs(out, exist_ok=True)
    for f in sorted(glob.glob(os.path.join(folder, '*.png'))):
        im = Image.open(f).convert('RGBA')
        h = max(1, round(units * PPU * im.size[1] / (128 if folder.endswith(('v2', 'walk')) or folder.endswith('npcs') else im.size[1])))
        if folder.endswith('cheeky_v2'): h = max(1, round(units * PPU))
        if folder.endswith('sit'): h = max(1, round(units * PPU))
        w = max(1, round(im.size[0] * h / im.size[1]))
        # premultiply so transparent edges don't bleed dark or light, then shrink
        small = im.resize((w, h), Image.BOX)
        a = small.getchannel('A').point(lambda v: 255 if v > 100 else 0)
        small.putalpha(a)
        small.resize((w * STORE, h * STORE), Image.NEAREST).save(os.path.join(out, os.path.basename(f)))
        n += 1
print('pixelated', n, 'frames')
