"""Pixelate the 3D Black Pearl renders (tools/art/ship3d_render.html, Tripo model) onto the locked
6 px/unit grid: one 44x44-unit canvas per heading (32 headings, 11.25 deg apart, 0 = east, clockwise),
shared scale so the side-on hull is 40 units, 24 colours, hard alpha, a dark outline round the solid
parts, thin dark rigging, a brightened skull, stored 3x nearest. Also writes a matching water shadow
per heading (ship_XX_shadow.png): the silhouette flattened onto the sea, thrown away from the sun.
Usage: pack_ship3d.py <renders dir with f_00..f_31.png> <out dir> [side-on length in units, default 40] [noskull]"""
import sys, numpy as np
from PIL import Image
src, dst = sys.argv[1], sys.argv[2]
LENGTH = float(sys.argv[3]) if len(sys.argv) > 3 else 40  # side-on length in world units
SKULL = 'noskull' not in sys.argv  # only the Black Pearl has a skull to brighten; others have pale sails
PPU = 6; S = 44 * PPU; N = 32


def erode(M):
    E = M.copy(); E[1:, :] &= M[:-1, :]; E[:-1, :] &= M[1:, :]; E[:, 1:] &= M[:, :-1]; E[:, :-1] &= M[:, 1:]; return E


def dilate(M):
    D = M.copy(); D[1:, :] |= M[:-1, :]; D[:-1, :] |= M[1:, :]; D[:, 1:] |= M[:, :-1]; D[:, :-1] |= M[:, 1:]; return D


e = Image.open(f'{src}/f_00.png'); a = np.asarray(e)[..., 3] > 20
xs = np.where(a.any(0))[0]; f = LENGTH * PPU / (xs.max() - xs.min() + 1)
for i in range(N):
    im = Image.open(f'{src}/f_{i:02d}.png').convert('RGBA')
    # find the skull at full render size: pale, colourless blobs on the sails (ropes are too thin
    # to survive the erosion), and push them to bone white before shrinking so they stay readable
    R = np.asarray(im).astype(float)
    lum = R[..., :3].mean(-1); sat = R[..., :3].max(-1) - R[..., :3].min(-1)
    pale = (lum > 95) & (sat < 30) & (R[..., 3] > 200)
    core = pale
    for _ in range(2): core = erode(core)
    for _ in range(4): core = dilate(core)
    skull = core & pale if SKULL else np.zeros_like(pale)
    R[skull, :3] = (245, 240, 225)
    im = Image.fromarray(R.astype(np.uint8), 'RGBA')
    W = im.size[0]; sm = im.resize((round(W * f), round(W * f)), Image.LANCZOS)
    c = Image.new('RGBA', (S, S), (0, 0, 0, 0)); c.alpha_composite(sm, ((S - sm.size[0]) // 2, (S - sm.size[1]) // 2 + 2))
    q = np.asarray(c).astype(float)
    warm = np.clip((q[..., 0] - q[..., 2] - 4) / 20, 0, 1)[..., None]  # lift the timber, keep the sails black
    q[..., :3] = np.clip(q[..., :3] * (1 - warm) + 255 * ((q[..., :3] / 255) ** 0.9) * 1.0 * warm, 0, 255)
    q[..., :3] = np.clip((q[..., :3] - 128) * 1.15 + 128 + 6, 0, 255)  # a touch more contrast
    c = Image.fromarray(q.astype(np.uint8), 'RGBA')
    al = c.getchannel('A').point(lambda v: 255 if v > 110 else 0)
    p = c.convert('RGB').quantize(24, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGBA'); p.putalpha(al)
    A0 = np.asarray(al) > 0
    A = dilate(erode(A0))  # the solid parts (hull, sails); the rest is rigging
    ring = dilate(A) & ~A0
    P = np.asarray(p).copy()
    P[ring] = (24, 18, 14, 255)  # one-pixel dark outline, like the island's pixel art
    thin = A0 & ~A  # rigging: dark tarred rope, not pale lines
    P[thin, :3] = (P[thin, :3].astype(float) * 0.45 + np.array([40, 30, 22]) * 0.55).astype(np.uint8)
    Image.fromarray(P, 'RGBA').resize((S * 3, S * 3), Image.NEAREST).save(f'{dst}/ship_{i:02d}.png')
    # water shadow: the silhouette squashed flat onto the sea at the waterline, slid down-right
    ys = np.where(A0.any(1))[0]; base = ys.max() - 2
    sh = np.zeros((S, S), bool)
    yy, xx = np.nonzero(A0)
    ny = (base + (yy - base) * 0.28).astype(int) + 3
    nx = (xx + (base - yy) * 0.35).astype(int) + 4
    ok = (ny >= 0) & (ny < S) & (nx >= 0) & (nx < S)
    sh[ny[ok], nx[ok]] = True
    sh = dilate(sh)
    SH = np.zeros((S, S, 4), np.uint8); SH[sh] = (8, 30, 48, 255)
    Image.fromarray(SH, 'RGBA').resize((S * 3, S * 3), Image.NEAREST).save(f'{dst}/ship_{i:02d}_shadow.png')
print('scale', f, 'views', N)
