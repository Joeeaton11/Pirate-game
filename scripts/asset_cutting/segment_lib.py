"""
Reusable sprite-sheet cutting toolkit — real per-item pixel segmentation, never assumed
uniform spacing. Built and battle-tested cutting the 2026-08-20 terrain-extras-2 delivery
(see GAME_DESIGN.md item 141, assets/sprites/TERRAIN_EXTRAS_2_MANIFEST.md).

Read assets/sprites/README.md's "Cutting convention" section first — this module is the
concrete implementation of the discipline described there, not a replacement for reading it.
That section's standing rule applies here too: do not assume equal spacing for a row of items —
confirm it against real pixel gaps first, every time, even when a sheet looks clean and
computer-arranged.

## Quick start

    from segment_lib import *
    arr = load_arr('source_sheet.png')

    # For a whole panel where you don't know row/column structure yet:
    boxes, mask = segment_window(arr, (x0, y0, x1, y1), thresh=28, dilation=0, min_size=800)
    draw_debug(arr, (x0, y0, x1, y1), boxes, 'debug.png')   # ALWAYS view this before trusting it

    # For a single row where you've measured real pixel gaps between a few unambiguous items
    # and confirmed the spacing is genuinely constant (see verified_pitch_row_boxes' docstring —
    # do not skip the measurement step just because the sheet looks tidy):
    boxes = verified_pitch_row_boxes(arr, (x0, y0, x1, y1), n_items=5)

    # Crop with alpha + feathered edges:
    img = crop_rgba(arr, window, box, pad=4, feather=14, thresh=28)
    img.save('output.png')

## Lessons baked into this code (read before skipping a step)

1. **Never trust a bounding-box count alone.** A component count matching the sheet's own
   label count is not proof of correctness — two merges can cancel out, or a slice can grab a
   caption instead of the art. ALWAYS render `draw_debug()` and look, and for finished crops,
   open a sample of the actual output PNGs (not just the debug overlay) before filing.
2. **`verified_pitch_row_boxes` takes the largest CONNECTED COMPONENT per slice, not the full
   slice content span.** An earlier version took the full span and silently baked caption
   text below the art into several crops (they're both "content" within the same slice window
   if you don't distinguish blob size). This was the single most common bug found during the
   2026-08-20 delivery — check for it specifically.
3. **Small escalating dilation (0-3 iterations) bridges an item's own internal gaps** (sparse
   branches, thin roots, rope, fence rails) without bridging into a caption below it. Going
   higher than ~3 risks merging into neighboring content — if an item still won't segment
   cleanly by dilation=3, it needs a manual re-crop (see #5).
4. **Constant item spacing along a row must be measured and confirmed, never assumed** — even
   on a clean catalog-style sheet, and even though `verified_pitch_row_boxes` divides a row
   into N equal-width slices once you've confirmed that's valid. Before calling it for a whole
   row, measure the real pixel gap between a few already-unambiguous items in that row and
   confirm the spacing is actually constant. It usually is on generated catalog sheets, but
   confirm rather than guess (see AGENTS.md's rule against assuming uniform sheet layout) — and
   when it ISN'T constant (see #5's failure cases, or Panel X's "Ground Debris" item which was
   legitimately much wider than its row siblings), don't force equal slicing at all — fall back
   to real per-item connected-component detection across the row's full real span instead.
5. **Sparse/thin items (bare branches, hanging vines, small props, thin poles) sometimes need
   a manual re-crop anyway.** When a box comes back suspiciously small/thin relative to its
   row siblings (see the outlier-detection snippet below), widen the search window around
   that item's approximate expected position, re-run `segment_window` with a wider window
   and a couple dilation values, and *visually confirm* the result against a zoomed crop of
   the source before accepting it. Don't force it through the automated equal-slice pass a
   second time — hand-verify it directly.
6. **Exclude panel border lines.** `segment_window`'s `exclude_border` drops components whose
   bbox covers >85% of the window in both dimensions (works for whole-panel windows, but
   disable it — pass `exclude_border=False` — for a single large hero image that legitimately
   fills most of its window). `verified_pitch_row_boxes` instead drops any column with near-
   full-window-height content (a vertical border line) when computing the row's real content
   span.

## Outlier-detection snippet (run this after any verified_pitch_row_boxes/segment_window pass)

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
    window-local coords, in reading order (top-to-bottom rows, left-to-right within a row).
    This is the default, safest method — real connected-component detection with no assumption
    about how many items a row/panel holds or how they're spaced. Prefer this over
    `verified_pitch_row_boxes` whenever spacing hasn't been separately confirmed constant."""
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


def verified_pitch_row_boxes(arr, win, n_items, thresh=28, min_size=30):
    """win=(x0,y0,x1,y1) spanning ONE row only. Use ONLY after separately measuring real pixel
    gaps between a few unambiguous items in this row and confirming the spacing is genuinely
    constant (module docstring #4) — this function does not verify that for you, it assumes
    you already did. Finds the row's real outer content span (excluding panel border lines),
    divides into n_items equal-width slices, then within each slice takes the LARGEST CONNECTED
    COMPONENT (with small escalating dilation to bridge an item's own internal gaps) — not a
    blind slice crop, and not the full slice content span (that bug bakes caption text into the
    crop, see module docstring #2).

    If spacing turns out NOT to be constant for a row (an item is legitimately much wider or
    narrower than its siblings), do not use this function for that row — fall back to
    `segment_window` across the row's real content span and let real per-item boundaries fall
    out on their own."""
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
    slice_w = (cx1 - cx0) / n_items
    boxes = []
    for c in range(n_items):
        sx0 = int(cx0 + c * slice_w)
        sx1 = int(cx0 + (c + 1) * slice_w)
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
