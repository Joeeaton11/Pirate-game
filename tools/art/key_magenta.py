"""Key out a flat magenta background and fit the painted object into the code reference's frame:
the object takes the same width and the same foot position as the code-drawn one; if its height is within
15% it is matched exactly too, otherwise it keeps its own shape and grows upwards."""
import sys
import numpy as np
from PIL import Image

src, ref, out = sys.argv[1:4]
a = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
mag = np.clip(((r + b) / 2 - g - 60) / 120, 0, 1)  # high red and blue, low green
alpha = 1 - mag
alpha[alpha < 0.15] = 0
spill = np.minimum(r, b) - g
fix = (spill > 0) & (alpha < 1)
a[..., 0] = np.where(fix, r - spill * 0.6, r)
a[..., 2] = np.where(fix, b - spill * 0.6, b)
im = Image.fromarray(np.dstack([np.clip(a, 0, 255), alpha * 255]).astype(np.uint8), 'RGBA')
im = im.crop(im.getbbox())

R = Image.open(ref).convert('RGBA')
ra = np.asarray(R)[..., 3]
ys, xs = np.where(ra > 120)  # the object itself, not its faint contact shadow
l, t, rr, bb = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
f = im.size[0] / (rr - l)  # painted px per reference px: the painting fills the code object's width
bw, bh = (rr - l) * f, (bb - t) * f  # the code object's box at the painting's scale
if abs(im.size[1] / bh - 1) <= 0.15:
    # nearly the same shape: match the box exactly, so no plot or ground shows round the edges
    im = im.resize((int(round(bw)), int(round(bh))), Image.LANCZOS)
# a taller painting (a palm with higher fronds) keeps its width and grows upwards from the same foot
top = max(0, im.size[1] - int(round(bb * f)))
W, H = int(round(R.size[0] * f)), int(round(R.size[1] * f)) + top
canvas = Image.new('RGBA', (W, H), (0, 0, 0, 0))
canvas.alpha_composite(im, (int(round(l * f)), top + int(round(bb * f)) - im.size[1]))
# snap onto the locked pixel grid (6 px per world unit, docs/ART_STYLE_GUIDE.md): shrink to exactly the
# code sprite's pixel size, limit the palette, make edges hard, then store it 3x (nearest) so it stays crisp
import os, re
PPU = 6
aid = os.path.splitext(os.path.basename(ref))[0]
here = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src', 'blueprint')
width_units = None
for f in ('artObjects.generated.ts', 'tortugaArtSlots.generated.ts'):
    m = re.search(r"\['" + re.escape(aid) + r"', [-\d.]+, [-\d.]+, ([\d.]+)\]", open(os.path.join(here, f)).read())
    if m: width_units = float(m.group(1)); break
if width_units is None: width_units = R.size[0] / (4 * PPU)  # life frames: references are 4x the game's pixels
gw = max(1, round(width_units * PPU)); gh = max(1, round(gw * canvas.size[1] / canvas.size[0]))
small = canvas.resize((gw, gh), Image.LANCZOS)
alpha = small.getchannel('A').point(lambda v: 255 if v > 110 else 0)
pal = small.convert('RGB').quantize(64, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGBA')
pal.putalpha(alpha)
canvas = pal.resize((gw * 3, gh * 3), Image.NEAREST)
canvas.save(out)
print(out, (gw, gh), 'game px', canvas.size, 'stored')
