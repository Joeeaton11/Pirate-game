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
# no bigger than 1.5x the 16 px/unit reference: plenty for the game, and keeps the web bundle small
cap = 1.5 * R.size[0] / canvas.size[0]
if cap < 1: canvas = canvas.resize((max(1, int(canvas.size[0] * cap)), max(1, int(canvas.size[1] * cap))), Image.LANCZOS)
canvas.save(out)
print(out, canvas.size, 'ref', R.size)
