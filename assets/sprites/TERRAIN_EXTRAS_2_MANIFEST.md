# Terrain & World Extras (Delivery 2) — Cut Manifest

Source: `assets/brand/tileset-catalog/terrain_extras_2_sheet_v1.png` — the original, uncut
1536×1024 delivery ("Natural Ground / Water & Coastline / Roads, Curbs & Plaza Paving / Building
Plinth / Steps & Ramps / Jetty-Dock-Pier Kit / Vegetation / Cliffs, Rocks & Ruins Ground / Special
Focal Pieces (Waterfall & Fountain) / Extra Environmental Props / Tile Transition Strips &
Blends"), delivered 2026-08-20, kept in the repo alongside `master_catalog_v1.png`/
`tortuga_focus_v1.png`/`terrain_extras_sheet_v1.png` (same folder, same convention — original
reference sheets a cut pass came from, not meant to be used directly in-game). This is the second
terrain-extras delivery — a clean, labeled catalog-style sheet (11 roman-numeral panels, each item
individually numbered and captioned on the sheet itself), distinct in style from the first
delivery's denser painterly panels but cut with the same discipline: real per-item pixel
boundaries, never a grid assumption.

Files below use the codebase's plain-sequential-number convention (`{descriptor}_{n}.png`) and
**continue the existing numbering** for every category that already had entries from the first
terrain-extras delivery (or earlier deliveries) — nothing renumbers from 1. New categories this
sheet introduced (`curb`, `plinth`, the `harbour/` folder's whole contents, `shrub`, `reed_clump`,
`mangrove`, `tree_dead`, `well`, `tide_pool`, `drainage_grate`) start at 1.

**Cutting method note:** this sheet's clean, computer-arranged catalog layout meant most rows
really were uniform-pitch grids (verified by measuring real background gaps between unambiguous
items in each row before trusting the pitch — never assumed blind). Real per-item connected-component
extraction was used within each column slice (largest-blob-per-slice, with a small auto-escalating
dilation to bridge an item's own internal gaps — sparse branches, thin roots — without bridging into
neighboring caption text). Two things surfaced during verification that are worth recording:

1. **First pass baked caption text into several crops** (the column slice's tallest content
   sometimes included the label text below the art, not just the art itself) — caught by actually
   opening the cropped PNGs, not just trusting bounding-box counts. Fixed by taking only the
   largest *connected component* per column slice instead of the full column's content span.
2. **A handful of items still needed hand-verification and a manual re-crop** after that fix —
   sparse/thin art (a dead tree's bare branches, hanging vines, a small drainage grate, a lantern
   post) sat in irregular positions that a uniform column split didn't reliably capture. Each one
   was individually re-examined against the source sheet and re-cropped by hand rather than forced
   through the automated pass a second time. This is the same "verify by looking, not just by
   counting" lesson from the first delivery, applied again — a plausible-looking bounding box is
   not proof of correct content.
3. **Panel XI's "corner blends" group (G) was initially miscounted as 16 items** (2 "tall anchor"
   tiles + a 14-item 2-row grid) — re-examination showed the first two columns just have busier
   art (multiple stone patches in one tile) than the rest, not a different structure. It's a
   uniform 2×7 grid throughout, 14 items total. Corrected before filing.

145 sprites cut in this pass. Nothing here is wired into a renderer yet — see `README.md`'s
folder table for what each folder feeds into once it is wired.

## Panel I — Natural Ground (Base Fill Tiles), 13 items
`tiles/ground/ground_extra_25..37`: 1 Grass Light Green · 2 Grass Dark Green ·
3 Grass Flowering/Clover · 4 Grass Worn/Patchy · 5 Sand Dry/Inland/Dune · 6 Sand Wet/Tideline ·
7 Dirt Packed Path Brown · 8 Dirt Loose/Tilled Earth · 9 Dirt Dry/Cracked · 10 Rocky/Scree Ground ·
11 Marsh/Mud Ground · 12 Jungle Floor Leaf Litter · 13 Snow/Frost Ground

## Panel II — Water & Coastline, 15 items
- **Base water tiles** `tiles/water/water_extra_12..18`: 14 Deep Sea Variant A ·
  15 Deep Sea Variant B · 16 Shallow/Reef Water · 21 Beach Wave Static Fallback ·
  26 Harbor/Dockside Water (Murky) · 27 Harbor Water Ripple Variant · 28 Harbor Water Hull-Shadow
- **Dynamic effects** `water_fx/water_fx_extra_10..13`: 17 Foam/Surf Edge Strip ·
  18 Breaking Wave Frame 1 · 19 Breaking Wave Frame 2 · 20 Breaking Wave Frame 3
- **Transition edges** `tiles/transitions/trans_extra_53..55`: 22 Sand-to-Grass Transition Edge ·
  23 Sand-to-Water Transition Edge · 24 Rock-to-Water Transition Edge
- **`props/tide_pool_1`**: 25 Tide Pool (Small Prop)

## Panel III — Roads, Curbs & Plaza Paving, 17 items
- **Plaza pavers** `tiles/paving/paving_extra_15..18`: 29 Plaza Cobble Small Light Pavers ·
  30 Plaza Cobble Large Flagstone · 31 Plaza Cobble Worn/Mossy Patch · 32 Narrow Alley Cobblestone
- **Curb pieces (new descriptor)** `tiles/paving/curb_1..7`: 33 Curb Straight Edge ·
  34 Curb Outer Corner (Convex) · 35 Curb Inner Corner (Concave) · 36 Curb T-Junction ·
  37 Curb 4-Way Cross Junction · 38 Curb Dead-End Cap · 39 Curb Flush Ramp/Dip
- **Transitions** `tiles/transitions/trans_extra_56..58`: 40 Road-to-Dirt Path Transition ·
  41 Road-to-Plaza Transition · 42 Cobble-to-Grass Edge (No Curb)
- **`props/drainage_grate_1`**: 43 Drainage Grate (Small Prop)
- **`decals/ground_decal_17..18`**: 44 Wet/Puddled Cobblestone Patch · 45 Moss-Between-Pavers Overlay

## Panel IV — Building Plinth / Raised Foundation, 6 items (new descriptor)
`buildings/plinth_1..6`: 46 Plinth Straight Edge (Stone) · 47 Plinth Outer Corner ·
48 Plinth Inner Corner · 49 Plinth Top Surface Fill · 50 Plinth Wood-Decked Variant ·
51 Plinth Wood-Decked Corner

## Panel V — Steps & Ramps, 8 items
`tiles/elevation/stairs_ramp_14..21` (continues the existing `stairs_ramp_1..13` series):
52 Steps Narrow 2-Step · 53 Steps Narrow 3-Step · 54 Steps Wide 3-Step · 55 Steps Wide 5-Step ·
56 Steps With Wood Side Rail · 57 Steps With Stone Balustrade · 58 Steps Corner/Turning ·
59 Cargo Ramp (Loading Dock Alternative)

## Panel VI — Jetty / Dock / Pier Kit, 9 items
First entries in the previously-empty `harbour/` folder (per its README description: docks,
piers, jetties, mooring hardware): 60 Pier Module Corner/Mitred Turn → `harbour/pier_module_1` ·
61 Pier Ladder Down to Water → `harbour/pier_ladder_1` · 62 Mooring Post Single →
`harbour/mooring_post_1` · 63 Mooring Post Pair with Rope → `harbour/mooring_post_pair_1` ·
64 Cleat/Tie-Off (Ring, Small Prop) → `harbour/cleat_1` · 65 Dock Boat Launch Ramp →
`harbour/dock_ramp_1` · 66 Boardwalk Plank Straight (No Posts) → `harbour/boardwalk_1` ·
67 Boardwalk Plank Corner → `harbour/boardwalk_corner_1` · 68 Bridge Tile (Over Water) →
`tiles/bridges/bridge_wood_2` (continues the existing `bridge_wood_1` — this is a literal bridge
tile, not harbour infrastructure, so it joined the bridges series instead).

## Panel VII — Vegetation (Small, Individually Placed), 12 items
69 Palm Tree Upright, 70 Palm Tree Windswept → `nature/trees/tree_7..8` (continues `tree_1..6`) ·
71 Shrub Low Scrub, 72 Shrub Thorny/Dry → `nature/vegetation/shrub_1..2` (new descriptor) ·
73 Potted Plant Barrel Planter, 74 Potted Plant Ceramic Pot → `props/potted_plant_1..2` (new) ·
75 Window Flower Box → `props/window_flower_box_1` (new) · 76 Tall Grass/Reed Clump →
`nature/vegetation/reed_clump_1` (new) · 77 Mangrove → `nature/trees/mangrove_1` (new — a mangrove
tree itself, distinct from the existing `vegetation_extra_22` "Mangrove Roots") ·
78 Dead/Dry Tree → `nature/trees/tree_dead_1` (new) · 79 Hanging Vine/Creeper Overlay
(Wall-Mounted) → `nature/vegetation/vines_3` (continues `vines_1..2`) · 80 Grass Tuft (Small
Wall-Base Detail) → `decals/ground_decal_19` (filed as a decal, not a plant, since it's described
as a small base-of-wall detail overlay like the other decals — it's actually 3 small tuft clusters
grouped into one image on the source sheet, kept together as one sprite since the sheet labels
them as a single item).

## Panel VIII — Cliffs, Rocks & Ruins Ground, 3 items
81 Cliff-Face Tile (Vertical Rock Texture) → `tiles/elevation/cliff_wall_4` (continues
`cliff_wall_1..3`) · 82 Rubble/Ruin Floor (Broken Masonry) → `tiles/ground/broken_ground_2`
(continues `broken_ground_1`) · 83 Ruined Wall Base/Crumbled Foundation (Edge/Corner Piece) →
`props/fence_wall_extra_17` (continues the `fence_wall_extra_1..16` series from the first
delivery — a companion wall piece, same family).

## Panel IX — Special Focal Pieces (Waterfall & Fountain)

### Panel IX-A — Majestic Waterfall (Multi-Tile)
`landmarks/waterfall_complete_2` (continues `waterfall_complete_1`) — the assembled hero
illustration, a second waterfall in a different rock/vegetation arrangement than the first
delivery's.

### Panel IX-B — Neptune Fountain (Inspired by Gdansk's Fountain of Neptune)
`landmarks/fountain_complete_2` (continues `fountain_complete_1`) — the assembled hero
illustration, a second fountain design distinct from the first delivery's.

Piece breakdown (11 items): Fountain Base (Empty), Fountain Pool Water Variant, Central Statue
(Neptune), Side Statue Variant A, Side Statue Variant B → `props/fountain_piece_7..11` (continues
the `fountain_piece_1..6` series) · Water Spout Small, Water Spout Medium, Water Spout Tall,
Water Splash Impact → `water_fx/fountain_jet_4..7` (continues `fountain_jet_1..3`) · Fountain
Edge Corner, Fountain Edge Straight → `props/fountain_piece_12..13` (structural pieces, filed with
the other fountain pieces rather than the water-fx jets).

## Panel X — Extra Environmental Props (Filler & Detail), 15 items
84 Fallen Log → `nature/vegetation/log_4` (continues `log_1..3`) · 85 Tree Stump →
`nature/vegetation/stump_3` (continues `stump_1..2`) · 86 Barrel → `props/barrels_3` (continues
`barrels_1..2`) · 87 Crate → `props/crates_2` (continues `crates_1`) · 88 Sack →
`props/sacks_2` (continues `sacks_1`) · 89 Campfire → `props/campfire_2` (continues `campfire_1`) ·
90 Rocks Small Cluster, 91 Rocks Large Cluster → `nature/rocks/rock_extra_22..23` (continues
`rock_extra_1..21`) · 92 Boulders (Decor) → `nature/rocks/boulder_large_3` (continues
`boulder_large_1..2`) · 93 Signpost → `props/signpost_3` (continues `signpost_1..2`) ·
94 Lantern Post → `props/lamppost_1` (new numbered variant alongside the existing unnumbered
`lamppost.png`, same convention already used for `water.png`+`water_extra_*`, `cobble.png`+
`cobble_*`, etc.) · 95 Well → `props/well_1` (new — no well sprite existed in the library before
this, despite `DELIVERY_LOG.md`'s Tier-2-props history mentioning one; this is the first) ·
96 Fence Wooden, 97 Fence Broken → `props/fence_wall_extra_18..19` (continues the series) ·
98 Ground Debris (Small Scatter) → `decals/ground_decal_20` (the sheet shows this as one wide
image containing several scattered debris pieces — kept as a single sprite, same "sheet labels it
as one item" principle as item 80 above).

## Panel XI — Tile Transition Strips & Blends (Autotiler / Edge Helpers), 34 items
Six lettered sub-groups on the sheet (labeled A–E, then G — F does not appear on the source sheet,
not an omission on this end):

- **A. Grass Edges, B. Sand Edges, C. Dirt/Path Edges, D. Cobble Edges, E. Cliff Top Edges** —
  4 strip tiles each (20 total) → `tiles/transitions/trans_extra_59..78` (continues the
  `trans_extra_*` series, now up through 78 total across both terrain-extras deliveries).
- **G. Corner Blends & Inner Corners** — a uniform 2-row × 7-column grid, 14 items →
  `tiles/transitions/trans_corner_20..33` (continues the `trans_corner_1..19` series from the
  first delivery).
