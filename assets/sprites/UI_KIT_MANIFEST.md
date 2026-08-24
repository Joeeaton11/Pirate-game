# UI Kit — Delivery Manifest

Source: `assets/brand/tileset-catalog/ui_kit_v1.png` (1536×1024) — a general-purpose UI kit sheet:
parchment/metal panel frames, a scroll banner, a speech bubble, item-slot sockets, a health bar,
checkboxes, coin/heart/gem icons, a vertical scrollbar, and 9 pill-shaped buttons (6 plain color
variants + 3 with directional arrow glyphs). Uploaded with no accompanying text — read as a direct
continuation of the standing "cut the sheet into assets" request, this time for UI chrome rather
than world sprites or backgrounds.

Cut 2026-08-24 with the same discipline as every prior delivery: real per-item connected-component
detection, no assumed grid.

## Real defect assessed and found NOT to be one: a soft vignette in the alpha channel

Every other sheet this session had corrupted/noisy alpha or fully-opaque alpha with a baked-in
background. This one is different: the raw alpha channel is real and smooth (correct at the true
edges — 0 at the canvas corners), but it carries an intentional soft brownish vignette glow behind
the whole icon grid that stays fairly opaque (~250/255) even in the gaps between icons. Verified
this was a smooth gradient, not noise, by sampling local 10×10 patches at several "gap" locations
and finding near-zero local standard deviation (0.5–1.5) — nothing like the sharp pixel-to-pixel
alpha noise diagnosed on the sprite sheets earlier this session. Because a naive alpha threshold
can't separate real icon content from this vignette (both reach ~250+ opacity), item boundaries
were detected from RGB edge/gradient strength (Sobel) instead of raw alpha, then the closed and
filled gradient mask was used to zero out alpha everywhere outside each item's real silhouette —
this is what keeps the rounded corners of pill buttons and sockets transparent instead of showing a
hazy brown square behind them.

## Two real fused-detection cases resolved by measuring, not guessing

Two spots produced one bounding box for two real items:
- The 9 stacked pill buttons initially detected as only 6 boxes (three touching pairs merged) —
  resolved by scanning a narrow vertical alpha profile through the button column and finding all 8
  real gaps between the 9 buttons (down to a 9px gap the coarser gradient-closing pass had bridged
  over), then slicing the shared x-range at each gap's midpoint.
- The wood divider bar and the speech bubble below it were detected as one tall component —
  resolved the same way, finding the real gap (y 541–573) between them.

## 30 sprites filed into `assets/sprites/ui/`

| Category | Count | Destination |
|---|---|---|
| Panel/title frames | 4 | `ui_frame_title_1`, `ui_frame_parchment_1`, `ui_frame_slot_1`, `ui_frame_slot_2` |
| Scroll banner / label strip / torn parchment | 3 | `ui_banner_scroll_1`, `ui_label_strip_1`, `ui_parchment_torn_1` |
| Scrollbar | 1 | `ui_scrollbar_1` |
| Item-slot sockets | 4 | `ui_socket_wood_1`, `ui_socket_slot_1`, `ui_socket_circle_1`, `ui_socket_circle_rope_1` |
| Health/progress bar | 1 | `ui_bar_health_1` |
| Checkboxes | 2 | `ui_checkbox_checked_1`, `ui_checkbox_empty_1` |
| Icons (coin, heart, 2 gems) | 4 | `ui_icon_coin_1`, `ui_icon_heart_1`, `ui_icon_gem_green_1`, `ui_icon_gem_dark_1` |
| Divider bar | 1 | `ui_divider_wood_1` |
| Speech bubble | 1 | `ui_speech_bubble_1` |
| Plain pill buttons (green/orange/blue/red/wood/dark) | 6 | `ui_button_{green,orange,blue,red,wood,dark}_1` |
| Arrow pill buttons (green ▶, orange ▶, blue ◀) | 3 | `ui_button_arrow_{green,orange}_1`, `ui_button_arrow_blue_1` |

All new descriptor names — checked against the 4 existing `ui/` files (`ui_dialogue_parchment`,
`ui_icon_compass_rose`, `ui_icon_skull_crossbones`, `ui_nameplate_board`) first; no collisions.

## Judgment calls

- **No corrupted-alpha "fix" applied** — diagnosed the vignette as intentional/smooth rather than
  a defect (see above), so the fix here was choosing the right detection signal (RGB gradient, not
  alpha), not cleaning up noise.
- **Both close-button frames (`ui_frame_title_1`, `ui_frame_slot_1`) kept their baked-in red ✕
  button** rather than being split out as a separate icon — the ✕ sits inside the frame's own
  corner rivet slot as part of the frame's design, not a freestanding, reusable control.
- **Folder stays flat** — `ui/` is now at 36 files, comfortably past this library's usual
  "~15–20 files with distinct sub-groups" subfolder threshold, and the new content does split
  cleanly into frames/buttons/icons/sockets. Not split this delivery: two of the four existing
  files (`ui_dialogue_parchment_1`, `ui_nameplate_board_1`) are actively wired via
  `src/data/uiSprites.ts`/`bitmapNameplateFont.ts`, and a subfolder split would mean rewriting those
  require paths — the same risk calculus as the `tiles/`/`nature/` split, but for a delivery this
  size that's a separate, deliberate pass rather than something to fold in here. Flagged for the
  `asset-librarian` agent or a future delivery to actually execute.

## Verification

Ran the edge-opacity defect scan across all 30 cut files before filing: zero hits on all four
borders of every file. Built and visually reviewed a 6-column contact sheet (checkerboard
background) covering all 30 items before classifying — confirmed clean transparent backgrounds
(no vignette bleed into rounded corners) and correct per-item boundaries on every one, including
the two split cases.

## Wiring

**Not yet wired** — cutting and filing only, matching the scope of every prior delivery this
session.
