# Bars & Meters Candidates — Delivery Manifest

Sources: `assets/brand/tileset-catalog/ui_bars_meters_v2.png` and `ui_bars_meters_v3.png` (both
2026-08-27), 1536×1024 each — two more bars/meters/cooldown reference sheets, sent with no
accompanying text, immediately after a "😉" following the `ui_bars_meters_v1.png` delivery
(`BARS_METERS_MANIFEST.md`). Same standing instruction as every wordless sheet upload this session:
cut, file, verify, document — not wired.

Unlike `ui_bars_meters_v1.png` (which had no counterpart and went straight into the active `ui/`
library), these two sheets cover the *same content* v1 already filled — HP/stat bars, level bars,
a Heat/Wanted meter, and cooldown indicators — so they're candidates to compare against v1, not a
continuation of it. Filed into their own `ui_candidates/bars_meters_b/` and `ui_candidates/bars_meters_c/`
folders, matching the `design_a/b/c` precedent in `UI_KIT_CANDIDATES_MANIFEST.md`: nothing renamed or
merged into `ui/` until the user actually picks one.

## A genuine first for this session: these sheets arrived pre-matted

Every prior sheet this session (`ui_kit_candidate_a/b/c.png`, `ui_bars_meters_v1.png`, all the terrain
and prop sheets before them) was a flat opaque image needing alpha reconstructed from scratch —
background-color distance, edge detection, or similar. These two are different: **the uploaded PNGs
already carry a real per-item alpha channel**, baked in at generation time. Sampling the alpha showed
a clean matte — interior pixels at ~253-254/255 (effectively opaque), background at 0, with a normal
few-pixel anti-aliased taper at every item's silhouette edge. No background-distance thresholding, no
morphological cleanup, no fringing to fix — the cutting task reduced to finding each item's real
bounding box and cropping it out of the alpha the source already provided.

## Real defect: several items are baked touching with zero background gap

Connected-component labeling on the alpha (threshold 128) found 27 components in v2 against a visual
count of 31 real items, and 29 components in v3 against 34 real items. The shortfall in both cases was
the same root cause seen earlier this session on design B's tab selector: some items are baked flush
against their neighbor with no real transparent gap between them, so they label as one blob.

- **v2**: the ship's-wheel-cap bar group (5 stacked rows — track + blue/purple/gold/red fills) is one
  connected component spanning all 5 rows.
- **v3**: three separate fusions — the icon-capped stat bar trio (shield/lightning/crossed-swords,
  3 rows), the wood-plank track trio (metal/gold-stud/rope corner treatments, 3 rows), and the two
  "LVL" badge bars (12/blue, 28/purple, 2 rows).

Fixed by splitting each fused blob's bounding box into N equal-height bands (N = the row count) and
verifying the split lines against the actual pixel content first — for every one of these 5 fused
groups, an equal split landed exactly on the real seam between items (checked visually with a
magenta gridline overlay before committing to the automatic split), so no item lost or gained content
at its boundary. This is the same "cut at the real touching-point, no gap exists to find" situation
documented for design B's tab case, just five more instances of it.

## 31 sprites filed into `assets/sprites/ui_candidates/bars_meters_b/`

| Category | Count | Files |
|---|---|---|
| Ship's-wheel-cap + banner bar, track + 4 tinted fills (split from the 5-row fused blob above) | 5 | `bar_wheel_track`, `bar_wheel_fill_{blue,purple,gold,red}` |
| Skull-medallion + red-banner bar, track + 3 fills | 4 | `bar_skull_track`, `bar_skull_fill_{green,yellow,red}` |
| Rope-and-anchor-cap bar, track + 3 fills | 4 | `bar_ropeanchor_track`, `bar_ropeanchor_fill_{green,yellow,red}` |
| "24"-badge level bar, diamond-arrow cap, 3 colorways | 3 | `bar_level24_{blue,purple,gold}` |
| Plain metal-frame bar, track + 3 fills | 4 | `bar_plain_track`, `bar_plain_fill_{green,yellow,red}` |
| "WANTED" scroll heat meter, 3 tiers (empty/partial/full) | 3 | `heat_meter_scroll_{empty,partial,full}` |
| Cooldown indicator, rope-bordered wood circle, 5 states | 5 | `cooldown_rope_ready`, `cooldown_rope_partial`, `cooldown_rope_hourglass_{blue,gold,red}` |
| Cooldown indicator, metal-bordered icon circle, 3 icons | 3 | `cooldown_metal_{wheel_blue,anchor_cyan,skull_red}` |

**31 total.**

## 34 sprites filed into `assets/sprites/ui_candidates/bars_meters_c/`

| Category | Count | Files |
|---|---|---|
| Multi-icon-cap bar (wheel/heart/skull/star caps, each a different stat), track + 3 fills | 4 | `bar_icon_track`, `bar_icon_{heart_red,skull_green,star_yellow}` |
| Blue-gem-cap bar (plain gem / compass / flame left caps), track + 3 fills | 4 | `bar_gem_track`, `bar_gem_fill_blue`, `bar_gem_{compass_yellow,flame_red}` |
| Parchment-scroll bar (potion/barrel/bomb icon caps), track + 3 fills | 4 | `bar_scroll_track`, `bar_scroll_{potion_green,barrel_yellow,bomb_red}` |
| "LVL"-badge level bar, 2 baked example levels (split from the fused pair above) | 2 | `bar_level_badge_blue_12`, `bar_level_badge_purple_28` |
| Segmented multi-stage boss/danger bar, skull cap (single fused asset) | 1 | `boss_bar_segmented_skull` |
| "WANTED" torn-poster heat meter, badge cap (single fused asset) | 1 | `heat_meter_wanted_torn` |
| Rope-wrapped bar, track + 2 fills | 3 | `bar_rope_track`, `bar_rope_fill_{green,blue}` |
| Stat bar with icon end-cap (shield/lightning/crossed-swords), split from the 3-row fused blob above | 3 | `bar_stat_{shield_green,lightning_yellow,crossed_red}` |
| Wood-plank track, 3 corner-ornament styles (metal bracket / gold stud / rope wrap), split from the 3-row fused blob above | 3 | `bar_plank_{metal,gold,rope}_track` |
| Cooldown indicator, wood-track circle, 5 states | 5 | `cooldown_track_{ready,partial}`, `cooldown_hourglass_{blue,gold,red}` |
| Cooldown indicator, metal-bordered icon circle, 4 icons | 4 | `cooldown_{wheel_blue,anchor_blue,skull_red,chest_gold}` |

**34 total.**

## Judgment calls

- **`bar_level24_*` (b) and `bar_level_badge_*_{12,28}` (c) have a baked-in level number**, same as
  v1's `xp_bar_*` precedent for fused single assets — "24", "12", and "28" are part of the source art,
  not a placeholder. Using a different number needs a redraw or a font/number swap on the existing art,
  not a runtime substitution.
- **`boss_bar_segmented_skull` and `heat_meter_wanted_torn` (c) are each one fused asset**, not split
  into cap/track/fill pieces — same rationale as v1's `xp_bar_*`/`heat_meter_wanted_*`: the ornament
  (skull plate, torn-poster badge) is drawn as part of the same continuous composition as the bar, with
  no real seam to cut at.
- **The equal-split boundaries on the 5 fused groups are a judgment call, not a measured seam** — there
  is no transparent gap to find in the source art at all, so "the exact midpoint between two touching
  items" is the best available boundary rather than a discovered one. Visually verified against a
  gridline overlay before cutting (see defect note above); no content was cut into the wrong item at
  any of the 5 split points.
- **v2's and v3's bar families overlap conceptually but aren't identical to v1 or to each other** — v1
  has skull/wheel/skull-in-plaque HP tracks + a separate XP bar + a numbered Heat/Wanted meter; v2 adds
  a "24"-level bar and a scroll-style Heat/Wanted meter on top of its own skull/wheel/rope bar trio; v3
  adds per-stat icon caps (heart/skull/star, shield/lightning/crossed-swords) and a segmented boss bar
  not present in either v1 or v2. Whichever gets picked, expect to cherry-pick pieces across all three
  rather than choosing one wholesale — flagging this now so the comparison isn't read as "three
  redraws of the same asset list."

## Verification

Ran the edge-opacity defect scan across all 65 cut files: zero hits — no near-empty or near-fully-
opaque crops, no undersized dimensions. Ran connected-component debris scan (same technique used for
design C's bleed cases and v1's material-swatch header bleed): zero hits — no disconnected secondary
blobs on any file, including the 5 split-from-fused items. Built and visually reviewed a full contact
sheet per source sheet; confirmed correct content and clean isolation on every item, and specifically
confirmed each of the 5 equal-split crops landed on its real seam with no neighbor content bleeding in.

## Wiring

**Not wired** — cutting and filing only, same as every prior delivery this session.
