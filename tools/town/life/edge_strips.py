"""Feathered edge strips for the painted town: the outer F units of town.png on each side, with
alpha ramping from 0 at the boundary to 1 inside, so the painting melts into the island art
around it. The map clips the JPG chunks F units in and lays these strips over the band.
Usage: python3 edge_strips.py <town.png> <outdir>"""
import sys
import numpy as np
from PIL import Image
F = 14  # units
PX = 4.8
im = Image.open(sys.argv[1]).convert('RGB')
W, H = im.size
f = int(round(F * PX))
def ramp(n):
    k = (np.arange(n) + 0.5) / n
    return k * k * (3 - 2 * k)  # smoothstep 0 -> 1 inward
def save(name, box, alpha):
    c = im.crop(box).convert('RGBA')
    c.putalpha(Image.fromarray((alpha * 255).astype(np.uint8)))
    c = c.resize((max(1, c.width // 2), max(1, c.height // 2)), Image.LANCZOS)
    c.save(f'{sys.argv[2]}/edge_{name}.png', optimize=True)
rx = ramp(f)
fullx = np.ones(W); fullx[:f] = rx; fullx[-f:] = rx[::-1]
# top / bottom: full width, corners use the product of both ramps
save('top', (0, 0, W, f), np.outer(rx, fullx))
save('bottom', (0, H - f, W, H), np.outer(rx[::-1], fullx))
# left / right: between the corner squares
save('left', (0, f, f, H - f), np.tile(rx, (H - 2 * f, 1)))
save('right', (W - f, f, W, H - f), np.tile(rx[::-1], (H - 2 * f, 1)))
print(f, W, H)
