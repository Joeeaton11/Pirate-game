# Item Icon Candidates — Delivery Manifest

Sources: `assets/brand/tileset-catalog/item_icons_pixelart.png`, `item_icons_set_b.png`,
`item_icons_set_c.png` (2026-08-29), sent with no accompanying text, followed by *"These are the last
three sheets I have for now."* — signalling this closes out the unsolicited-sheet-delivery phase of
the session, at least for the moment.

A genuinely new content category, and a new candidates tree: **general item/prop icons** — the game's
core resources (fish, logs, rum, coins), navigation/inventory gear (backpack, compass), reward props
(sealed scroll, treasure chest), a circular map-viewport frame, and a UI cursor/pointer. This overlaps
directly with existing content (`items/fish_scrap_1.png`, `treasure/chest_1..4.png`), so — same
precedent as every UI-kit and bars/meters candidate this session — filed as **candidates to compare**
in a new `assets/sprites/item_icon_candidates/{pixelart,set_b,set_c}/` tree, not merged into `items/`
or `treasure/`.

Cut 2026-08-29. **Not wired** — cutting and filing only, matching the scope of every prior
unsolicited-sheet delivery this session.

## A third art style enters the library: chunky retro pixel-art

`item_icons_pixelart.png` is rendered in a distinctly different style from every other sheet cut this
session — hard-edged, chunky pixel-art rather than the painterly/vector look used everywhere else
(designs A-J, bars/meters, terrain, buildings, Scally). Flagging this clearly since it's a real style
fork, not a minor variant: if this direction is picked, it would mean adopting pixel-art as the game's
visual language rather than the painterly style used for every other asset shipped so far.

## Real defect: pixel-art sheet has a baked-in checkerboard, not real alpha, plus soft anti-aliased noise

`item_icons_pixelart.png` arrived as a **fully opaque RGB image** (alpha 0-255 uniformly 255) with an
extremely subtle white-on-white checkerboard baked into the pixels as a "this is transparent" visual
convention (two near-identical off-white tones, ~40px cells, sampled at (250,250,250) and
(254,254,253) — barely distinguishable from pure white). `item_icons_set_b.png` and `_set_c.png`, by
contrast, arrived pre-matted with real alpha, same as every sheet since v2 in the bars/meters and UI
kit deliveries.

Reconstructing real alpha for the pixel-art sheet took two passes:
1. **First pass** (flood-fill from image border through near-white, low-saturation pixels, binary
   alpha): worked for the checkerboard itself, but left a scatter of small isolated white specks across
   every icon's soft drop-shadow — the shadows are semi-transparent blends toward the checkerboard, and
   a hard binary cutoff couldn't decide many of those blended pixels consistently, leaving salt-and-
   pepper noise where the shadow faded through the threshold's edge.
2. **Second pass** (the one actually used): a **soft, graduated alpha** — alpha scales with each
   pixel's distance from white/checker-gray rather than a hard yes/no cutoff, which lets the drop
   shadows fade naturally instead of dithering — plus connected-component debris cleanup (drop any
   component under 200px, which is every leftover checkerboard/shadow fragment; the 10 real icons are
   all far larger). Verified against a colored preview background: zero speckle, correctly graduated
   shadows, clean isolation on all 10 items.

`item_icons_set_b.png` and `_set_c.png` needed no alpha reconstruction (real alpha already present) and
had no fused items — all 11 raw connected components on each sheet were real, distinct items 1:1, cut
using the same connected-component-label masking method as every recent delivery (guards against
bounding-box overlap bleed even though none of these items' boxes meaningfully overlapped).

## 10 sprites filed into `assets/sprites/item_icon_candidates/pixelart/`

| Item | File |
|---|---|
| Fish (matches `items/fish_scrap_1.png`'s role) | `item_fish` |
| Bundled logs | `item_logs_bundle` |
| Rum bottle | `item_rum_bottle` |
| Coin stack (skull-face coin visible) | `item_coin_stack` |
| Sealed scroll (wax seal, tied) | `item_scroll_sealed` |
| Backpack (skull-and-crossbones flap, red sash) | `item_backpack` |
| Compass (closed lid, needle visible) | `item_compass` |
| Circular map-viewport frame, filled with an island map + ship marker | `item_frame_circular_map_filled` |
| Cursor/pointer arrow | `item_cursor_arrow` |
| Closed treasure chest | `item_chest_closed` |

**10 total.**

## 11 sprites filed into `assets/sprites/item_icon_candidates/set_b/`

| Item | File |
|---|---|
| Fish, logs, rum, coin stack | `item_fish`, `item_logs_bundle`, `item_rum_bottle`, `item_coin_stack` |
| "Royal Pardon" scroll (unfurled, readable body text) | `item_scroll_royal_pardon` |
| Backpack (with attached scroll + potion bottle) | `item_backpack` |
| Compass, open-lid pose (skull-and-crossbones inside the lid) | `item_compass_open` |
| Circular rope-and-metal frame, empty, skull-and-crossbones emblem at top | `item_frame_circular_rope_skull_empty` |
| Cursor/pointer arrow (red) | `item_cursor_arrow` |
| Open treasure chest, modest fill | `item_chest_open_modest` |
| Open treasure chest, lavish fill (crown, gems, coin piles) | `item_chest_open_lavish` |

**11 total.**

## 11 sprites filed into `assets/sprites/item_icon_candidates/set_c/`

Same content roster as `set_b`, different dressing throughout — this and `set_b` read as two skins of
the same underlying icon set (matching item silhouettes, different ornamentation), same relationship
as design A vs. B in the UI-kit candidates.

| Item | File |
|---|---|
| Fish, logs, rum, coin stack | `item_fish`, `item_logs_bundle`, `item_rum_bottle`, `item_coin_stack` |
| Treasure-map scroll (illustrated map body, X marks the spot, wax seal) | `item_scroll_treasure_map` |
| Backpack (same pose as set_b, different leather tone) | `item_backpack` |
| Compass, closed-lid pose | `item_compass_closed` |
| Circular rope-and-metal frame, empty, anchor emblem at top (vs. set_b's skull) | `item_frame_circular_rope_anchor_empty` |
| Cursor/pointer arrow (red) | `item_cursor_arrow` |
| Open treasure chest, lavish fill | `item_chest_open_lavish` |
| Open treasure chest, modest fill | `item_chest_open_modest` |

**11 total.**

## Judgment calls

- **`item_frame_circular_*` (all three sets) is a UI element, not a world prop** — reads as a minimap
  or map-preview viewport frame (the pixel-art set even shows it pre-filled with an island + ship
  marker, confirming the intended use). `set_b`/`set_c`'s empty rope-frame versions are the reusable
  "shell," ready to be filled with a live map render; the pixel-art version is a filled example, not a
  separate reusable asset.
- **`item_cursor_arrow` (all three sets) is UI chrome, not a game-world item** — a mouse/touch pointer
  icon, filed here only because it happened to share the sheet with genuine item icons. Flagged so it
  isn't mistaken for a collectible.
- **The pixel-art sheet's items don't have "open/closed" or "modest/lavish" chest variants like sets
  b/c do** — it shipped exactly one chest (closed) and one compass pose (closed), fewer states overall.
  Not a gap in cutting; the source sheet simply drew fewer variants.
- **`item_scroll_*` differs in content across all three sets** — pixel-art's is a blank sealed scroll,
  set_b's is a readable "Royal Pardon" document, set_c's is an illustrated treasure map. These are
  three different in-game objects that happen to share a scroll silhouette, not three renders of the
  same asset — worth keeping that distinction in mind if only one set gets picked.

## Verification

Ran the edge-opacity defect scan across all 32 cut files: zero hits — no near-empty or near-fully-
opaque crops (the pixel-art set's soft/graduated shadow alpha was specifically checked against this,
since a naive scan could mistake a fading shadow for a defect; confirmed each file's opacity
distribution is a real gradient, not a flat near-threshold value). Ran the connected-component debris
scan: zero hits on all 32 files, including the pixel-art set's reconstructed alpha (the technique
that produces the debris scan's own zero-noise result is documented above). Built and visually
reviewed a full contact sheet per set before filing.

## Wiring

**Not wired**, and **not merged into `items/`/`treasure/`** — these are alternatives pending the user's
choice of which set (if any) to standardize on. Cutting and filing only, matching the scope of every
prior unsolicited-sheet delivery this session.
