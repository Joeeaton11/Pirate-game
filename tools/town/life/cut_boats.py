"""Cut the moored ships out of the painted town (water-hue key) so they can bob.
Usage: python3 cut_boats.py <town.png> <outdir>"""
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as nd
im = Image.open(sys.argv[1]).convert('RGB')
B = {'sloop': (-63, -378, -28, -351), 'brig': (6, -376, 58, -340), 'long': (127.5, -390, 145, -338)}
for k, (x0, y0, x1, y1) in B.items():
    box = (int((x0 + 150) * 4.8), int((y0 + 455) * 4.8), int((x1 + 150) * 4.8), int((y1 + 455) * 4.8))
    hsv = np.asarray(im.crop(box).convert('HSV')).astype(float)
    water = (hsv[..., 0] > 105) & (hsv[..., 0] < 150) & (hsv[..., 1] > 90)
    ship = nd.binary_fill_holes(nd.binary_closing(nd.binary_opening(~water), iterations=3))
    lab, n = nd.label(ship)
    if n: ship = lab == (np.argmax(nd.sum(ship, lab, range(1, n + 1))) + 1)
    rgba = im.crop(box).convert('RGBA')
    rgba.putalpha(Image.fromarray((ship * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2)))
    rgba.save(f'{sys.argv[2]}/boat_{k}.png')
