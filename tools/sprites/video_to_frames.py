"""Turns a green-screen character animation video into a clean, looping pixel-art frame set.

    python3 tools/sprites/video_to_frames.py VIDEO OUT_PREFIX --frames 8 --height 120 [--loop] [--mirror]

1. Pulls every frame, keys out the flat green background (with de-spill on the edges).
2. --loop: finds the walk/idle cycle — the stretch that ends on the frame most like its start — so
   the animation repeats with no jump. Otherwise the whole clip (minus a lead-in) is used.
3. Samples N evenly spaced frames, all anchored to ONE shared canvas: feet on the same baseline,
   body centre on the same x (median over the cycle), so the torso never wobbles between frames.
4. Pixel pass: down to the game's sprite height with a fixed palette shared by every frame, plus a
   dark 1-px outline — the same look as the town art.
Writes OUT_PREFIX_0.png .. OUT_PREFIX_{N-1}.png (and mirrored copies with --mirror OUT2).
"""
import argparse, os, subprocess, tempfile, glob
import numpy as np
from PIL import Image
from scipy import ndimage


def read_frames(video, fps=24):
    d = tempfile.mkdtemp()
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', video, '-vf', f'fps={fps}', os.path.join(d, 'f_%04d.png')], check=True)
    return [np.array(Image.open(f).convert('RGB')) for f in sorted(glob.glob(os.path.join(d, 'f_*.png')))]


def key_green(a):
    a = a.astype(int)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    bg = (g > 120) & (g - np.maximum(r, b) > 60)
    fg = ~bg
    fg = ndimage.binary_opening(fg, iterations=1)
    lab, n = ndimage.label(fg)
    if n:
        sizes = ndimage.sum(fg, lab, range(1, n + 1))
        fg = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s > sizes.max() * 0.05])
    # de-spill: pull green down to the max of red/blue on edge pixels
    edge = fg & ~ndimage.binary_erosion(fg, iterations=2)
    spill = edge & (g > np.maximum(r, b))
    a[spill, 1] = np.maximum(a[spill, 0], a[spill, 2])
    return np.dstack([np.clip(a, 0, 255).astype('uint8'), (fg * 255).astype('uint8')])


def find_loop(masks, start, min_len, max_len):
    ref = masks[start].astype(float)
    best, best_len = 1e18, None
    for L in range(min_len, min(max_len, len(masks) - start - 1)):
        d = np.abs(masks[start + L].astype(float) - ref).mean()
        if d < best:
            best, best_len = d, L
    return best_len


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('video'); ap.add_argument('out')
    ap.add_argument('--frames', type=int, default=8)
    ap.add_argument('--height', type=int, default=128, help='sprite canvas height in px')
    ap.add_argument('--width', type=int, default=112, help='sprite canvas width in px')
    ap.add_argument('--stand', type=int, default=108, help='standing character height in px')
    ap.add_argument('--base', type=int, default=4, help='px from canvas bottom to the feet')
    ap.add_argument('--end', type=float, default=None, help='one-shots: stop at this many seconds')
    ap.add_argument('--loop', action='store_true')
    ap.add_argument('--mirror-half', action='store_true', help='front/back: second step = mirrored first step')
    ap.add_argument('--front', action='store_true', help='front/back view: choose the most symmetric loop')
    ap.add_argument('--start', type=float, default=0.25, help='seconds of lead-in to skip')
    ap.add_argument('--min-cycle', type=float, default=0.6)
    ap.add_argument('--max-cycle', type=float, default=1.6)
    ap.add_argument('--colors', type=int, default=48)
    ap.add_argument('--mirror', default=None, help='also write horizontally flipped frames with this prefix')
    ap.add_argument('--sheet', default=None, help='write a contact sheet png here')
    a = ap.parse_args()
    fps = 24
    rgb = read_frames(a.video, fps)
    rgba = [key_green(f) for f in rgb]
    small = [np.array(Image.fromarray(f[..., 3]).resize((96, 72))) > 128 for f in rgba]
    s0 = int(a.start * fps)
    if a.loop and a.front:
        # front/back views: pick the loop whose frames are most left-right symmetric (no twisting)
        sym = [np.abs(m.astype(float) - m[:, ::-1].astype(float)).mean() for m in small]
        best = None
        for st in range(s0, len(small) - int(a.max_cycle * fps) - 1):
            L = find_loop(small, st, int(a.min_cycle * fps), int(a.max_cycle * fps))
            close = np.abs(small[st + L].astype(float) - small[st].astype(float)).mean()
            score = float(np.mean(sym[st:st + L])) + close * 2
            if best is None or score < best[0]:
                best = (score, st, L)
        _, s0, L = best
        print(f'front loop: start {s0/fps:.2f}s len {L/fps:.2f}s')
    if a.loop and not a.front:
        L = find_loop(small, s0, int(a.min_cycle * fps), int(a.max_cycle * fps))
    if a.loop:
        seq = rgba[s0:s0 + L]
    else:
        seq = rgba[s0: int(a.end * fps) if a.end else None]
    if a.mirror_half:
        # Front/back walks are left-right symmetric half a cycle apart: take one step (half the
        # loop) and play it again mirrored for the other foot. Cancels any body twist on average.
        half = seq[: max(2, len(seq) // 2)]
        idx = np.linspace(0, len(half), a.frames // 2, endpoint=False).astype(int)
        picks = [half[i] for i in idx] + [half[i][:, ::-1].copy() for i in idx]
    else:
        idx = np.linspace(0, len(seq), a.frames, endpoint=False).astype(int)
        picks = [seq[i] for i in idx]
    # Shared canvas for EVERY animation: the character's standing height (first frame of the clip,
    # which is always the locked pose) maps to --stand px, feet sit on one baseline, torso x is
    # locked to the cycle median. Same canvas size for all clips, so swapping animation never
    # changes his size or position.
    b0 = Image.fromarray(rgba[0]).getbbox()
    scale = a.stand / (b0[3] - b0[1])
    cxs = []
    for p in picks:
        al = p[..., 3] > 128
        bb = Image.fromarray(p).getbbox()
        ys, xs = np.nonzero(al[bb[1]: bb[1] + (bb[3] - bb[1]) // 2])
        cxs.append(xs.mean())
    cx = float(np.median(cxs))
    feet = max(Image.fromarray(p).getbbox()[3] for p in picks) if a.loop else Image.fromarray(rgba[0]).getbbox()[3]
    W, H = a.width, a.height
    frames = []
    for p, c in zip(picks, cxs):
        im = Image.fromarray(p)
        dx = float(np.clip(c - cx, -3, 3)) if a.loop else 0.0
        big = im.resize((int(im.width * scale), int(im.height * scale)), Image.LANCZOS)
        ox = int(round(W / 2 - (cx + dx) * scale))
        oy = int(round((H - a.base) - feet * scale))
        canvas = Image.new('RGBA', (W, H))
        canvas.alpha_composite(big, (ox, oy)) if ox >= 0 and oy >= 0 else canvas.paste(big, (ox, oy), big)
        frames.append(canvas)
    # one palette for the whole set so colours never flicker between frames
    strip = Image.new('RGBA', (W * len(frames), a.height))
    for i, f in enumerate(frames):
        strip.paste(f, (i * W, 0))
    al = np.array(strip)[..., 3] > 110
    pal = strip.convert('RGB').quantize(a.colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    q = np.array(pal.convert('RGB')).astype(int)
    edge = al & ~ndimage.binary_erosion(al)
    q[edge] = (q[edge] * 0.35).astype(int)
    strip = Image.fromarray(np.dstack([q.astype('uint8'), (al * 255).astype('uint8')]), 'RGBA')
    out_frames = [strip.crop((i * W, 0, (i + 1) * W, a.height)) for i in range(len(frames))]
    os.makedirs(os.path.dirname(a.out) or '.', exist_ok=True)
    for i, f in enumerate(out_frames):
        f.save(f'{a.out}_{i}.png')
        if a.mirror:
            f.transpose(Image.FLIP_LEFT_RIGHT).save(f'{a.mirror}_{i}.png')
    if a.sheet:
        S = Image.new('RGBA', (W * 2 * len(out_frames), a.height * 2), (70, 120, 70, 255))
        for i, f in enumerate(out_frames):
            S.alpha_composite(f.resize((W * 2, a.height * 2), Image.NEAREST), (i * W * 2, 0))
        S.save(a.sheet)
    print(f'{len(seq)} source frames -> {len(out_frames)} frames {W}x{H}')


if __name__ == '__main__':
    main()
