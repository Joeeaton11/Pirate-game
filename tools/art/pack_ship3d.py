"""Pixelate the 3D Black Pearl renders (tools: /home/claude/gen/ship3d/render.html, Tripo model) onto the
locked 6 px/unit grid: one 44x44-unit canvas per heading (16 headings, 22.5 deg apart, 0 = east, clockwise),
shared scale so the side-on hull is 40 units, 64 colours, hard alpha, stored 3x nearest."""
import sys, numpy as np
from PIL import Image
src, dst = sys.argv[1], sys.argv[2]
PPU = 6; S = 44 * PPU
ANGS = [0, 22, 45, 67, 90, 112, 135, 157, 180, 202, 225, 247, 270, 292, 315, 337]
e = Image.open(f'{src}/r_0.png'); a = np.asarray(e)[..., 3] > 20
xs = np.where(a.any(0))[0]; f = 40 * PPU / (xs.max() - xs.min() + 1)
for i, ang in enumerate(ANGS):
    im = Image.open(f'{src}/r_{ang}.png').convert('RGBA')
    W = im.size[0]; sm = im.resize((round(W * f), round(W * f)), Image.LANCZOS)
    c = Image.new('RGBA', (S, S), (0, 0, 0, 0)); c.alpha_composite(sm, ((S - sm.size[0]) // 2, (S - sm.size[1]) // 2 + 2))
    q = np.asarray(c).astype(float)
    warm = np.clip((q[..., 0] - q[..., 2] - 4) / 20, 0, 1)[..., None]  # lift the timber, keep the sails black
    q[..., :3] = np.clip(q[..., :3] * (1 - warm) + 255 * ((q[..., :3] / 255) ** 0.75) * 1.1 * warm, 0, 255)
    c = Image.fromarray(q.astype(np.uint8), 'RGBA')
    al = c.getchannel('A').point(lambda v: 255 if v > 110 else 0)
    p = c.convert('RGB').quantize(64, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGBA'); p.putalpha(al)
    p.resize((S * 3, S * 3), Image.NEAREST).save(f'{dst}/ship_{i:02d}.png')
print('scale', f)
