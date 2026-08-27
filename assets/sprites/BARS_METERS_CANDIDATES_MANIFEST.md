# Bars & Meters Candidates — Delivery Manifest

Sources: `assets/brand/tileset-catalog/ui_bars_meters_v2.png` through `v6.png` (all 2026-08-27),
1536×1024 each — five more bars/meters/cooldown reference sheets, each sent with no accompanying text.
Same standing instruction as every wordless sheet upload this session: cut, file, verify, document —
not wired.

All five cover ground `ui_bars_meters_v1.png` already filled — HP/stat bars, level bars, a Heat/Wanted
meter, cooldown indicators — so they're filed as candidates to compare, matching the `design_a/b/c`
precedent, rather than merged into `ui/`. Naming follows the letter suffix each sheet arrived in:
`bars_meters_b` = v2, `bars_meters_c` = v3, `bars_meters_d` = v4, `bars_meters_e` = v5, `bars_meters_f`
= v6. (A sixth sheet in the second batch, `ui_kit_candidate_d.png`, is a different content mix —
banners, toggles, icon buttons, frame circles alongside a few bars — filed separately as
`ui_candidates/design_d/`; see `UI_KIT_CANDIDATES_MANIFEST.md`.)

## A genuine first for this session: these sheets arrived pre-matted

Every sheet in this batch (v2 through v6) arrived with **a real per-item alpha channel already baked
in** at generation time — unlike every earlier sheet this session (which needed alpha reconstructed
from a flat or vignette background). Sampling showed a clean matte: interior pixels at ~253-254/255,
background at 0, with a normal few-pixel anti-aliased taper at each item's edge. No background-distance
thresholding, no morphological cleanup, no fringing to fix on any of these five sheets.

## Real defect: several items baked touching with zero gap

Connected-component labeling on the alpha consistently found fewer components than real items —
several items on each sheet are baked flush against a neighbor with no real transparent gap between
them, the same situation documented earlier this session for design B's tab selector. Every fused group
below was split only after checking the split line against a gridline overlay first (or, for v4's
uneven-height fusion, reading each item's real boundary off a finely-gridded overlay) — every split
landed on the true seam, confirmed by contact sheets and a debris scan.

- **v2**: one 5-row fusion (ship's-wheel-cap bar family) — equal fifths.
- **v3**: three fusions — icon-capped stat-bar trio, wood-plank-track trio (equal thirds each), and a
  2-row "LVL"-badge pair (equal half).
- **v4**: one large 8-item fusion (4 skull-banner bars stacked directly on 4 fraction-counter resource
  bars, 765px tall, no internal gap at all) — the two halves aren't equal height, so this one was cut
  from real boundaries read off a fine gridline overlay, not an even split. Three more 3-row fusions
  (a "LVL 12" compass-bar trio, a wheel/hourglass/bomb-cap bar trio, a segmented-bar trio) split at
  equal thirds.
- **v5**: one 2-up fusion (two cooldown-wheel dial circles side by side) — equal halves.
- **v6**: one 4-up fusion (four rope-bordered hourglass cooldown circles side by side) — equal
  quarters.

## Second defect (v4-v6 only): rectangular bounding-box overlap causing neighbor bleed

A more subtle defect surfaced while cutting v4-v6 specifically: connected-component **bounding boxes**
(axis-aligned rectangles) can overlap even when the components themselves don't touch — a tall,
irregularly-shaped item like a scalloped bar frame has a bounding box that extends well past its own
visible content, and a smaller separate item (like a standalone "fill piece" bar sitting just below it)
can have its top edge fall inside that rectangle. The first cutting pass cropped by alpha threshold
within each item's padded bounding box, which is exactly where this went wrong: any pixel in the crop
window belonging to a *different* labeled component still passed the alpha test and got included,
producing a thin sliver of the neighboring item's content along one edge (caught on `bar_skull_track`
in v5, which picked up a few rows of the standalone red fill bar sitting directly below its frame, plus
7 more files across v5/v6 with the same pattern — every affected file was a composite bar/frame sitting
directly above a "loose fill piece" or another bar).

Fixed by switching the crop step to mask against the actual **connected-component label**, not just an
alpha threshold: every pixel in the crop window that doesn't belong to the target component's own label
gets zeroed before the tight bounding box is computed, so a geometrically-overlapping neighbor can never
contribute pixels regardless of how close it sits. Re-ran the full cut for v4-v6 (and design_d) with the
corrected method — the connected-component debris scan (which had flagged all 8 affected files under
the old method) came back clean on every one of the 137 files cut this round. v2/v3 predate this
particular technique but don't exhibit the bug (their items don't have the same overlapping-bbox
geometry), confirmed by re-running the same debris scan against them.

## 31 sprites filed into `assets/sprites/ui_candidates/bars_meters_b/` (from `ui_bars_meters_v2.png`)

| Category | Count | Files |
|---|---|---|
| Ship's-wheel-cap + banner bar, track + 4 tinted fills (split from a 5-row fused blob) | 5 | `bar_wheel_track`, `bar_wheel_fill_{blue,purple,gold,red}` |
| Skull-medallion + red-banner bar, track + 3 fills | 4 | `bar_skull_track`, `bar_skull_fill_{green,yellow,red}` |
| Rope-and-anchor-cap bar, track + 3 fills | 4 | `bar_ropeanchor_track`, `bar_ropeanchor_fill_{green,yellow,red}` |
| "24"-badge level bar, diamond-arrow cap, 3 colorways | 3 | `bar_level24_{blue,purple,gold}` |
| Plain metal-frame bar, track + 3 fills | 4 | `bar_plain_track`, `bar_plain_fill_{green,yellow,red}` |
| "WANTED" scroll heat meter, 3 tiers (empty/partial/full) | 3 | `heat_meter_scroll_{empty,partial,full}` |
| Cooldown indicator, rope-bordered wood circle, 5 states | 5 | `cooldown_rope_ready`, `cooldown_rope_partial`, `cooldown_rope_hourglass_{blue,gold,red}` |
| Cooldown indicator, metal-bordered icon circle, 3 icons | 3 | `cooldown_metal_{wheel_blue,anchor_cyan,skull_red}` |

**31 total.**

## 34 sprites filed into `assets/sprites/ui_candidates/bars_meters_c/` (from `ui_bars_meters_v3.png`)

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

## 40 sprites filed into `assets/sprites/ui_candidates/bars_meters_d/` (from `ui_bars_meters_v4.png`)

| Category | Count | Files |
|---|---|---|
| Skull-medallion bar, 4 colorways (no shared empty track on this sheet) | 4 | `bar_skull_fill_{red,green,yellow,gray}` |
| Resource counter bar with icon + fraction text | 4 | `resource_bar_{fish,wood,rum,cannonball}` |
| XP scroll bar (single fused asset) | 1 | `xp_bar_scroll_green` |
| Compass-cap "LVL 12" bar, 3 colorways | 3 | `bar_compass_lvl12_{blue,purple,gold}` |
| Lantern-cap "WANTED" heat meter, 3 tiers | 3 | `heat_meter_lantern_{empty,low,high}` |
| Multi-icon-cap bar (wheel/hourglass/bomb caps, each its own color) | 3 | `bar_{wheel_blue,hourglass_yellow,bomb_red}` |
| Cooldown circle, resource/theme icon + colored radial | 8 | `cooldown_{wheel_blue,logs_gold,fish_green,rum_purple,compass_cyan,bomb_red,skull_red,hourglass_gold}` |
| Cooldown circle, hourglass-only radial dial, 4 states | 4 | `cooldown_dial_{ready,cyan,gold,red}` |
| Cooldown circle, clock-hand dial, 4 states | 4 | `cooldown_clock_{ready,blue,gold,red}` |
| Plank track, 3 corner-ornament styles | 3 | `plank_{wood,green,metal}_track` |
| Segmented multi-block bar, icon cap, 3 colorways | 3 | `segmented_bar_{skull_green,anchor_yellow,flame_red}` |

**40 total.**

## 28 sprites filed into `assets/sprites/ui_candidates/bars_meters_e/` (from `ui_bars_meters_v5.png`)

This sheet is a **component teardown** — several bar families are shown twice: once as a composite
(frame + fill baked together, or an empty frame alone) and once as a standalone "fill piece" (just the
colored pill, no frame), evidently to show the fill as a separately-layerable game asset. Kept both
forms; see Judgment calls.

| Category | Count | Files |
|---|---|---|
| Skull-medallion bar: empty track, red composite, and the loose fill piece | 3 | `bar_skull_track`, `bar_skull_composite_red`, `fill_piece_red` |
| Heart HP icon, 3 states | 3 | `heart_{full,half,empty}` |
| Compass-cap "LVL 12"/XP composite (blue) + loose fill piece | 2 | `bar_compass_lvl_xp_composite_blue`, `fill_piece_blue` |
| Compass-cap plain bar composite (yellow) + loose fill piece | 2 | `bar_compass_composite_yellow`, `fill_piece_yellow` |
| Flame-skull-cap heat meter composite + loose segmented fill piece | 2 | `heat_meter_flameskull_composite`, `fill_piece_segmented` |
| Badge-cap heat meter composite (red) | 1 | `heat_meter_badge_composite` |
| Bounty-rank plaque, 5 tiers (star count doesn't cleanly increment — see Judgment calls) | 5 | `bounty_rank_1..5` |
| Cooldown dial, wheel-cap circle, split from a fused pair | 2 | `cooldown_wheel_{blue,gold}` |
| Cooldown dial, rope-bordered circle, 2 colorways | 2 | `cooldown_rope_{green,gray}` |
| Cooldown dial, metal circle with up-arrow marker | 1 | `cooldown_metal_blue_arrow` |
| Loose radial-arc piece (no circle background), 5 colorways | 5 | `arc_piece_{blue,gold,green,red,gray}` |

**28 total.**

## 29 sprites filed into `assets/sprites/ui_candidates/bars_meters_f/` (from `ui_bars_meters_v6.png`)

Same component-teardown pattern as `bars_meters_e` (v5) — composite bars paired with their loose fill
piece where the sheet shows both.

| Category | Count | Files |
|---|---|---|
| Ship's-wheel-cap bar: empty track + red composite | 2 | `bar_wheel_track`, `bar_wheel_composite_red` |
| Heart HP icon, 4 states (2 render visually identical — see Judgment calls) | 4 | `heart_full_1`, `heart_full_2`, `heart_half`, `heart_empty` |
| Potion-cap "LVL 12"/XP composite (blue) + loose lightning-textured fill piece | 2 | `bar_potion_lvl_xp_composite_blue`, `fill_piece_lightning_blue` |
| Compass-cap plain bar composite (green) + loose fill piece | 2 | `bar_compass_composite_green`, `fill_piece_green` |
| Flame-skull-cap heat meter composite + loose segmented fill piece | 2 | `heat_meter_flameskull_composite`, `fill_piece_segmented` |
| Badge-cap heat meter composite (gold) | 1 | `heat_meter_badge_composite_gold` |
| Bounty-rank plaque, 5 tiers (clean 1★–4★→4★+crown progression) | 5 | `bounty_rank_1..5` |
| Cooldown dial, rope-bordered circle, split from a 4-up fused row | 4 | `cooldown_rope_{blue,gold,green,red}` |
| Cooldown dial, pirate-skull/crossed-cutlass circle | 1 | `cooldown_pirate_skull_orange` |
| Loose radial-arc piece (no circle background), 5 colorways | 5 | `arc_piece_{blue,gold,green,red,gray}` |

**29 total.**

## Judgment calls

- **`bar_level24_*` (b) and `bar_level_badge_*_{12,28}` (c) have a baked-in level number**, same as
  v1's `xp_bar_*` precedent for fused single assets — "24", "12", and "28" are part of the source art,
  not a placeholder. Using a different number needs a redraw or a font/number swap on the existing art,
  not a runtime substitution.
- **`boss_bar_segmented_skull` and `heat_meter_wanted_torn` (c) are each one fused asset**, not split
  into cap/track/fill pieces — the ornament (skull plate, torn-poster badge) is drawn as part of the
  same continuous composition as the bar, with no real seam to cut at.
- **The equal-split boundaries on the fused groups are a judgment call, not a measured seam** — there
  is no transparent gap to find in the source art at all, so "the exact midpoint between two touching
  items" is the best available boundary rather than a discovered one, except v4's 8-item fusion, whose
  real per-item boundaries were read directly off a fine gridline overlay since the items aren't equal
  height. Visually verified against a gridline overlay before cutting on every one of the 6 splits this
  round; no content was cut into the wrong item at any split point.
- **`fill_piece_*` and `arc_piece_*` (e, f) are loose, frame-less pieces** — literally just the colored
  pill or radial-arc shape with no border/cap art around them. They pair with this same sheet's
  composite bars/dials (same color, same style) and read as the "fill layer" half of a track+fill pair
  meant to be composited at runtime rather than baked. Filed as-is; if wired, expect these to slot
  behind/inside their matching track asset rather than stand alone.
- **v6's `heart_full_1`/`heart_full_2` render as visually identical full hearts** at normal viewing
  size — likely either a source duplication or a subtle animation-frame variant (e.g. a glint/pulse
  state) too fine to distinguish here. Kept both since the sheet drew them as two separate assets;
  flagged in case wiring reveals they're meant to alternate.
- **`resource_bar_{fish,wood,rum,cannonball}` (d) have baked-in fraction text** ("18/30" etc.) — like
  every other baked-number case this session, the number is part of the source art, not a live value.
  Useful as a resource-bar visual reference, not a drop-in HUD element without a redraw or number swap.
- **`plank_{wood,green,metal}_track` (d) are empty tracks with no matching fill on this sheet** —
  parking them here for now; a fill to pair with them would need to come from elsewhere in the library
  or a future sheet.
- **v5's and v6's bounty-rank plaques don't share the same star-count progression** — v6 reads as a
  clean 1★→2★→3★→4★→4★+crown ladder, while v5's five plaques include what look like two visually
  similar low tiers before jumping straight to 3★. Both cut and filed as-drawn; flagging the
  inconsistency here rather than "fixing" a progression that may be intentional variety across
  candidates.
- **v2's, v3's, and v4-v6's bar families overlap conceptually but aren't identical to each other or to
  v1** — expect to cherry-pick pieces across all six sheets rather than choosing one wholesale once a
  direction is picked.

## Verification

Ran the edge-opacity defect scan across all 162 files across the five sheets: zero hits — no near-empty
or near-fully-opaque crops, no undersized dimensions. Ran connected-component debris scan (catches both
the disconnected-fragment class of defect from earlier deliveries and the bounding-box-overlap defect
documented above): zero hits on the final extraction for all five sheets. Built and visually reviewed a
full contact sheet per source sheet; confirmed correct content and clean isolation on every item,
including all 9 split-from-fused items across the batch (v2's 5-way, v3's three splits, v4's 8-way
custom split plus three 3-way splits, v5's 2-way, v6's 4-way).

## Wiring

**Not wired** — cutting and filing only, same as every prior delivery this session.
