# Terrain Extras 4 — Delivery Manifest

Source: `assets/brand/tileset-catalog/terrain_extras_4_sheet_v1.png` (1536×1024, 21 labeled panels,
"master catalog v2"-style reference sheet — no accompanying brief text, uploaded directly).

Cut and filed 2026-08-21 following the same discipline established for `TERRAIN_EXTRAS_3_MANIFEST.md`:
measure real per-item/category pixel boundaries (never assume equal grid spacing), use `content_bbox`
for sparse/organic content, open every final crop directly before filing, check for baked-in caption
text bleeding into a crop, and verify a category that *looks* like a multi-item grid actually has a
real pixel gap between its items before treating it as more than one sprite.

**234 sprites filed**, zero re-cut rounds needed post-hoc — the lessons from the terrain-extras-3
saga (3 QA rounds) were applied proactively during cutting itself this time. Two defects were still
caught and fixed before filing, both during this delivery's own cutting pass (not by a separate QA
round): a border-line pixel artifact slipped through the outlier-area filter in Panel 12 (deleted,
19 real items not 20) and three earlier scratch-file leftovers from a pre-fix cutting attempt were
found alongside the corrected files for Panels 10/14/16 (stale files deleted before filing, did not
affect what got filed). Panel 21 (Miscellaneous) needed a full re-measurement after the first attempt
put wrong content under the Barrels/Sacks/Campfire/Signpost labels — the true column boundaries were
one full category width off from a plausible-looking guess (see "Notable defects" below).

## Notable defects found and fixed during cutting (not a separate QA round)

- **Panel 21 category-boundary misalignment**: the first pass assigned column ranges to
  Barrels/Sacks/Campfire/Signpost that were each shifted by roughly one category width, so
  `p21_Barrels.png` and `p21_Sacks.png` both actually contained crops of the barrels grid, and
  `p21_Campfire.png`/`p21_Signpost.png` contained sack and campfire+signpost content respectively.
  Caught by reading the individual crops directly (not just a contact sheet) and comparing against
  the source panel's real header-label x-positions. Re-measured real column-run boundaries via
  `bg_distance`+run-detection on the full category band, confirmed against a direct crop of the
  source region, and re-cut all 6 items correctly.
- **Panel 12 stray border-line artifact**: `segment_window` returned a spurious 468×5px sliver
  (a thin panel-divider line) as box #11 despite the area-outlier filter; the filter's 0.4×-median
  threshold didn't catch it because a couple of the panel's real items are also narrow/tall. Found
  by printing per-crop pixel dimensions and spotting the one 5px-tall outlier, confirmed against the
  debug overlay, deleted. Panel 12 is 19 real items, not the initially-assumed 20.
- **Stale pre-fix files for Panels 10, 14, 16**: each of these panels needed one re-cut (outlier-area
  filtering removing a spurious extra box), but the very first attempt's output files were never
  deleted, leaving one extra stale file per panel (`p10_15.png`, `p14_07.png`, `p16_07.png`, all with
  earlier timestamps than the corrected batch). Found via file mtimes and confirmed by their odd
  dimensions (thin slivers or a shape height not matching what the fixed batch produced). Deleted
  before filing — none of these three ended up in `assets/sprites/`.

## "Whole category, not grid" panels

Same lesson as `TERRAIN_EXTRAS_3_MANIFEST.md` Panel 11 (round 3) and repeated multiple times in this
sheet: several categories that visually resemble a small grid of variants (e.g. "2 rows of items")
turned out to have **no real pixel gap** between their apparent sub-items anywhere in the row/column
activity profile — meaning they're one continuous composite illustration, not several separate
sprites. Confirmed for each of these before cutting (not assumed from the thumbnail look):

- Panel 18 (Rocks & Boulders): SmallRocks and LargeBoulders are each ONE item (2 items total, not 12).
- Panel 19 (Decorative Details): Log, Stump, Flowers, Mushrooms, Vines, Weeds are each ONE item
  (6 items total, not 12).
- Panel 20 (Special Tiles): Mud, Puddle, BridgeWood, BridgeRope, BrokenGround are each ONE item
  (5 items total, not more).
- Panel 21 (Miscellaneous): Hay, Crates, Barrels, Sacks, Campfire, Signpost are each ONE item
  (6 items total) — Crates and Barrels each visually show a 2×2 sub-arrangement but have no real
  pixel gap separating it into independent sprites.

## Panel → filename map

| # | Panel title | Items | Destination |
|---|---|---|---|
| 1 | Basic Ground Tiles | 6 | `tiles/ground/ground_basic_7..12` |
| 2 | Grass Variations | 12 | `tiles/ground/grass_variations_13..24` |
| 3 | Paths (Dirt) | 12 | `tiles/paths/path_dirt_25..36` |
| 4 | Paths With Grass Borders | 12 | `tiles/paths/path_grass_border_21..32` |
| 5 | Cobble Streets | 14 | `tiles/paving/cobble_30..43` |
| 6 | Road (Worn) | 8 | `tiles/paving/road_worn_10..17` |
| 7 | Jungle/Dense Ground | 12 | `tiles/ground/jungle_ground_29..40` |
| 8 (top row) | Beach & Shore — Dry Sand/Wet Sand/Footprints/Shells | 4 | `tiles/beach/beach_13..16` |
| 8 (Beach Details) | Beach & Shore — driftwood/shell/starfish/coral/etc. | 11 | `props/beach_detail_1..11` |
| 9 (top row) | Sea Tiles — Deep/Mid/Shallow/Shore Foam | 4 | `tiles/water/sea_5..8` |
| 9 (Wave Variations) | Sea Tiles — wave-crest sprites | 11 | `water_fx/wave_1..11` |
| 10 | Sea Transitions — Sea-to-Sand (7) + Sea-to-Rock (7) | 14 | `tiles/beach/shoreline_5..18` |
| 11 | Transitions – Grass/Dirt/Road | 20 | `tiles/transitions/trans_grass_dirt_road_21..40` |
| 12 | Transitions – Corners & Edges | 19 (of 20 detected; 1 border-line artifact discarded) | `tiles/transitions/trans_corner_34..52` |
| 13 (Cliff Top Edges) | Cliffs & Rocks | 5 | `tiles/elevation/cliff_top_edge_12..16` |
| 13 (Cliff Walls) | Cliffs & Rocks | 3 | `tiles/elevation/cliff_wall_9..11` |
| 13 (Rocky Ground) | Cliffs & Rocks | 4 | `tiles/ground/rocky_ground_1..4` (new series) |
| 14 | Elevation/Ledges | 6 | `tiles/elevation/elevation_ledge_11..16` |
| 15 | Stairs & Ramps | 5 | `tiles/elevation/stairs_ramp_27..31` |
| 16 | Trees — 2 palm, 1 jungle-canopy, 2 broadleaf | 5 | `nature/trees/tree_25..29` |
| 16 | Trees — 1 dead tree | 1 | `nature/trees/tree_dead_8` |
| 17 | Bushes & Plants | 27 | `nature/vegetation/bush_plant_52..78` |
| 18 | Rocks & Boulders — SmallRocks, LargeBoulders (whole-scene) | 2 | `nature/rocks/rock_small_10`, `nature/rocks/boulder_large_5` |
| 19 | Decorative Details — Log/Stump/Flowers/Mushrooms/Vines/Weeds (whole-category) | 6 | `nature/vegetation/log_5`, `stump_4`, `flowers_29`, `mushrooms_8`, `vines_4`, `weeds_5` |
| 20 | Special Tiles — Mud/Puddle/BridgeWood/BridgeRope/BrokenGround (whole-category) | 5 | `tiles/ground/mud_3`, `puddle_11`, `tiles/bridges/bridge_wood_4`, `bridge_rope_4`, `tiles/ground/broken_ground_4` |
| 21 | Miscellaneous — Hay/Crates/Barrels/Sacks/Campfire/Signpost (whole-category) | 6 | `props/hay_2`, `crates_7`, `barrels_8`, `sacks_7`, `campfire_4`, `signpost_6` |

**Total: 234 sprites.**

## New series started by this delivery

- `props/beach_detail_1..11` — small placeable beach clutter (shell, starfish, driftwood, coral
  fragment, etc.), distinct from `tiles/beach`'s full-tile ground textures.
- `water_fx/wave_1..11` — standalone wave-crest sprites (11 pose/color variants), distinct from
  `tiles/water`'s flat sea-surface tiles.
- `tiles/ground/rocky_ground_1..4` — a rock-strewn ground tile, distinct from both `nature/rocks`
  (standalone rock/boulder objects) and the existing cliff tile series.

## Folders touched

`tiles/ground`, `tiles/paths`, `tiles/paving`, `tiles/beach`, `tiles/water`, `tiles/transitions`,
`tiles/elevation`, `tiles/bridges`, `nature/trees`, `nature/vegetation`, `nature/rocks`, `props`,
`water_fx` (first new entries since the folder's creation in the 2026-08-21 terrain-extras-3
delivery).
