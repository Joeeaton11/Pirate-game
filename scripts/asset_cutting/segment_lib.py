"""
Reusable sprite-sheet cutting toolkit — real per-item pixel segmentation, never a grid
assumption. Built and battle-tested cutting the 2026-08-20 terrain-extras-2 delivery
(see GAME_DESIGN.md item 141, assets/sprites/TERRAIN_EXTRAS_2_MANIFEST.md).

Read assets/sprites/README.md's "Cutting convention" section first — this module is the
concrete implementation of the discipline described there, not a replacement for reading it.

## Quick start

    from segment_lib import *
    arr = load_arr('source_sheet.png')

    # For a whole panel where you don't know row/column structure yet:
    boxes, mask = segment_window(arr, (x0, y0, x1, y1), thresh=28, dilation=0, min_size=800)
    draw_debug(arr, (x0, y0, x1, y1), boxes, 'debug.png')   # ALWAYS view this before trusting it

    # For a single row you've confirmed is a uniform n-column grid (measure real gaps between
    # a few unambiguous items first — see row_grid_boxes' docstring):
    boxes = row_grid_boxes(arr, (x0, y0, x1, y1), n_cols=5)

    # Crop with alpha + feathered edges:
    img = crop_rgba(arr, window, box, pad=4, feather=14, thresh=28)
    img.save('output.png')

## Lessons baked into this code (read before skipping a step)

1. **Never trust a bounding-box count alone.** A component count matching the sheet's own
   label count is not proof of correctness — two merges can cancel out, or a slice can grab a
   caption instead of the art. ALWAYS render `draw_debug()` and look, and for finished crops,
   open a sample of the actual output PNGs (not just the debug overlay) before filing.
2. **`row_grid_boxes` takes the largest CONNECTED COMPONENT per column slice, not the full
   column content span.** An earlier version took the full span and silently baked caption
   text below the art into several crops (they're both "content" within the same column
   window if you don't distinguish blob size). This was the single most common bug found
   during the 2026-08-20 delivery — check for it specifically.
3. **Small escalating dilation (0-3 iterations) bridges an item's own internal gaps** (sparse
   branches, thin roots, rope, fence rails) without bridging into a caption below it. Going
   higher than ~3 risks merging into neighboring content — if an item still won't segment
   cleanly by dilation=3, it needs a manual re-crop (see #5).
4. **A uniform-pitch grid must be verified, not assumed** — even on a clean catalog-style
   sheet. `row_grid_boxes` divides a row into N equal slices; before trusting that for a
   whole row/panel, measure the real pixel gap between a few already-unambiguous items in
   that row and confirm the pitch actually is constant. It usually is on generated catalog
   sheets, but confirm rather than guess (see AGENTS.md's no-grid-assumption rule).
5. **Sparse/thin items (bare branches, hanging vines, small props, thin poles) sometimes need
   a manual re-crop anyway.** When a box comes back suspiciously small/thin relative to its
   row siblings (see the outlier-detection snippet below), widen the search window around
   that item's approximate expected position, re-run `segment_window` with a wider window
   and a couple dilation values, and *visually confirm* the result against a zoomed crop of
   the source before accepting it. Don't force it through the automated grid pass a second
   time — hand-verify it directly.
6. **Exclude panel border lines.** `segment_window`'s `exclude_border` drops components whose
   bbox covers >85% of the window in both dimensions (works for whole-panel windows, but
   disable it — pass `exclude_border=False` — for a single large hero image that legitimately
   fills most of its window). `row_grid_boxes` instead drops any column with near-full-window-
   height content (a vertical border line) when computing the row's real content span.

## Outlier-detection snippet (run this after any row_grid_boxes/segment_window pass)

    import statistics
    ws = [b[2]-b[0] for b in boxes]; hs = [b[3]-b[1] for b in boxes]
    mw, mh = statistics.median(ws), statistics.median(hs)
    for i, (w, h) in enumerate(zip(ws, hs)):
        if w < 0.55*mw or h < 0.55*mh:
            print('SUSPECT', i, boxes[i])   # hand-verify these before filing

Flags candidates worth a second look — not proof of a bug (some items are legitimately
narrower/shorter than their row siblings, e.g. a curb's straight-edge strip), but every
delivery this session that had a real bug also showed up in this list.
"""

import numpy as np
from scipy import ndimage
from PIL import Image

BG = np.array([14, 20, 24])  # approx navy background — re-sample per sheet, corners are a good spot


def load_arr(path):
    return np.array(Image.open(path).convert('RGB')).astype(float)


def bg_distance(arr):
    return np.sqrt(((arr - BG) ** 2).sum(axis=-1))


def segment_window(arr, win, thresh=28, dilation=0, min_size=40, row_tol=40,
                    exclude_border=True):
    """win = (x0,y0,x1,y1). Returns (boxes, mask); boxes are (x0,y0,x1,y1,pixel_area) in
    window-local coords, in reading order (top-to-bottom rows, left-to-right within a row)."""
    y0, y1, x0, x1 = win[1], win[3], win[0], win[2]
    W, H = x1 - x0, y1 - y0
    sub = arr[y0:y1, x0:x1]
    dist = bg_distance(sub)
    mask = dist > thresh
    if dilation > 0:
        struct = np.ones((3, 3))
        dmask = ndimage.binary_dilation(mask, structure=struct, iterations=dilation)
    else:
        dmask = mask
    lbl, n = ndimage.label(dmask)
    boxes = []
    for i in range(1, n + 1):
        comp = (lbl == i)
        real = comp & mask
        if real.sum() < min_size:
            continue
        ys, xs = np.where(real)
        bw, bh = xs.max() - xs.min(), ys.max() - ys.min()
        if exclude_border and bw > 0.85 * W and bh > 0.85 * H:
            continue  # panel outline artifact
        boxes.append((int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1, int(real.sum())))
    boxes = cluster_reading_order(boxes, row_tol)
    return boxes, mask


def cluster_reading_order(boxes, row_tol=40):
    """Gap-based row clustering (not fixed-bucket rounding) then sort each row left-to-right."""
    if not boxes:
        return boxes
    items = [(((b[1] + b[3]) / 2), b) for b in boxes]
    items.sort(key=lambda t: t[0])
    rows = []
    cur_row = [items[0]]
    for yc, b in items[1:]:
        if yc - cur_row[-1][0] > row_tol:
            rows.append(cur_row)
            cur_row = [(yc, b)]
        else:
            cur_row.append((yc, b))
    rows.append(cur_row)
    out = []
    for row in rows:
        row.sort(key=lambda t: t[1][0])
        out.extend(b for _, b in row)
    return out


def autotune(arr, win, expected, thresh=28, min_size=1200, dilation_range=range(0, 12), row_tol=40):
    """Search dilation for a count match with sane (non-outlier) sizes. Count-matching alone is
    NOT proof of correctness (see module docstring #1) — still visually verify the result."""
    best = None
    for d in dilation_range:
        boxes, _ = segment_window(arr, win, thresh=thresh, dilation=d, min_size=min_size, row_tol=row_tol)
        if len(boxes) == expected:
            sizes = [b[4] for b in boxes]
            med = sorted(sizes)[len(sizes) // 2]
            if all(s > med * 0.15 for s in sizes):
                return boxes, d
        if best is None or abs(len(boxes) - expected) < abs(len(best[0]) - expected):
            best = (boxes, d)
    return best


def crop_rgba(arr, win, box, pad=4, feather=14, thresh=28):
    """box in window-local coords (x0,y0,x1,y1[,area]). Returns PIL RGBA image with a
    feathered alpha edge (~feather units of color-distance ramp) so composited edges aren't
    hard-cut."""
    y0, y1, x0, x1 = win[1], win[3], win[0], win[2]
    bx0, by0, bx1, by1 = box[:4]
    ax0 = max(x0, x0 + bx0 - pad)
    ay0 = max(y0, y0 + by0 - pad)
    ax1 = min(x1, x0 + bx1 + pad)
    ay1 = min(y1, y0 + by1 + pad)
    crop = arr[ay0:ay1, ax0:ax1]
    dist = bg_distance(crop)
    alpha = np.clip((dist - (thresh - feather)) / feather, 0, 1) * 255
    rgba = np.dstack([crop, alpha]).astype(np.uint8)
    return Image.fromarray(rgba, 'RGBA')


def row_grid_boxes(arr, win, n_cols, thresh=28, min_size=30):
    """win=(x0,y0,x1,y1) spanning ONE row only. Verified-pitch equal subdivision: finds the
    row's real outer content span (excluding panel border lines), divides into n_cols equal
    slices, then within each slice takes the LARGEST CONNECTED COMPONENT (with small escalating
    dilation to bridge an item's own internal gaps) — not a blind slice crop, and not the full
    column content span (that bug bakes caption text into the crop, see module docstring #2).

    Only use this after confirming the row really is uniform pitch (module docstring #4)."""
    y0, y1, x0, x1 = win[1], win[3], win[0], win[2]
    sub = arr[y0:y1, x0:x1]
    H = y1 - y0
    dist = bg_distance(sub)
    mask = dist > thresh
    col_run = mask.sum(axis=0)
    col_has = (col_run > 0) & (col_run < 0.92 * H)  # drop full-height columns: panel border lines
    xs = np.where(col_has)[0]
    if len(xs) == 0:
        return []
    cx0, cx1 = xs.min(), xs.max() + 1
    col_w = (cx1 - cx0) / n_cols
    boxes = []
    for c in range(n_cols):
        sx0 = int(cx0 + c * col_w)
        sx1 = int(cx0 + (c + 1) * col_w)
        slice_mask = mask[:, sx0:sx1]
        best_box = None
        for dil in range(0, 4):
            dm = ndimage.binary_dilation(slice_mask, iterations=dil) if dil else slice_mask
            lbl, n = ndimage.label(dm)
            if n == 0:
                continue
            sizes = ndimage.sum(dm & slice_mask, lbl, range(1, n + 1))
            best = int(np.argmax(sizes)) + 1
            if sizes[best - 1] < min_size:
                continue
            real = (lbl == best) & slice_mask
            ys, xs2 = np.where(real)
            bw, bh = xs2.max() - xs2.min(), ys.max() - ys.min()
            if bw >= 15 and bh >= 15:  # sane 2D blob, not a thin line/text fragment
                best_box = (int(sx0 + xs2.min()), int(ys.min()), int(sx0 + xs2.max()) + 1, int(ys.max()) + 1, int(real.sum()))
                break
        if best_box is None:
            best_box = (sx0, 0, sx1, sub.shape[0], 0)  # flagged with area=0 — needs manual re-crop
        boxes.append(best_box)
    return boxes


def draw_debug(arr, win, boxes, out_path):
    """Draws numbered red boxes over the source region — always view this before trusting a
    segmentation pass. Boxes must be in window-local coords (subtract win's own x0,y0 first if
    they came from a different window)."""
    from PIL import ImageDraw
    y0, y1, x0, x1 = win[1], win[3], win[0], win[2]
    sub = Image.fromarray(arr[y0:y1, x0:x1].astype(np.uint8)).convert('RGB')
    d = ImageDraw.Draw(sub)
    for idx, b in enumerate(boxes):
        d.rectangle([b[0], b[1], b[2], b[3]], outline=(255, 0, 0), width=1)
        d.text((b[0] + 1, b[1] + 1), str(idx + 1), fill=(255, 255, 0))
    sub.save(out_path)
