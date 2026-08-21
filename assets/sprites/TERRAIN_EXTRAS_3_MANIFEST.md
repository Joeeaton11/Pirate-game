# Terrain & World Extras (3rd Delivery) — Cut Manifest

Source: `assets/brand/tileset-catalog/terrain_extras_3_sheet_v1.png` — the original, uncut
1536×1024 delivery, 32 numbered panels covering ground variety, paths/roads, transitions,
water, cliffs/rocks, vegetation, elevation, ruins, atmosphere effects, and tileable props.
Kept in the repo alongside `master_catalog_v1.png` / `tortuga_focus_v1.png` /
`terrain_extras_sheet_v1.png` / `terrain_extras_2_sheet_v1.png` (same folder, same convention —
original reference sheets a cut pass came from, not meant to be used directly in-game). Files
below use the codebase's plain-sequential-number convention (`{descriptor}_{n}.png`) rather than
baking each specific variant name into the filename — this doc is the lookup table from filename
back to what it actually shows.

**Structurally the densest sheet yet.** Unlike the two prior terrain-extras deliveries, this
sheet has no per-item numbered captions on the source — just a panel title and, within it,
named categories (e.g. "COBBLE STREETS" → LIGHT / MEDIUM / DARK / MOSAIC). Crucially, **the
number of real items packed under one category name is not consistent across the sheet** — real
per-item pixel boundaries had to be found for every panel individually rather than assumed from
the category label alone:

- Some categories are a single item (`SMOOTH`, `ROCKY`, `CLIFF BASE`, `REEF` in Panel 8).
- Some are 2 stacked variants (`STRAIGHT`, `CORNERS`, … in Panel 2).
- Some are a 2×2 grid of 4 *genuinely distinct* pieces, not a repeated single-tile preview —
  confirmed by zooming into Panel 4's "LIGHT" cobble swatch and finding a real seam separating
  4 different stone arrangements, not one tile shown four times (see `GAME_DESIGN.md` item 144).
- Panel 12's four categories aren't even uniform with each other: FLOOR/OVERGROWN/ROOTS are 2×2,
  but VINES is 1 row of 4 (a hanging vine strand doesn't split into a 2×2 sensibly).
- Panel 13's four tree categories have *different column counts* (PALMS=2, JUNGLE TREES=3,
  BROADLEAF=3, DEAD TREES=2) — assuming a uniform grid across the whole panel would have
  misaligned every column past the first category.
- Panel 30's PUDDLES category is a 2×4 grid of 8 distinct small puddle shapes sitting next to
  four *single-item* categories (FOG PATCHES, CLOUDS, MIST, DUST CLOUDS) in the same panel.

Every panel's real structure was confirmed by zooming into the source before cutting, not
inferred from the category count. See `GAME_DESIGN.md` item 144 (initial cut) and item 145
(independent QA + re-cut) for the full account.

**The initial cut pass had real, extensive defects that an automated size-outlier check and a
debug-overlay glance both missed.** An independent `asset-qa` review, followed by direct
pixel-level re-measurement of every flagged panel, found:

1. **Category-label text baked into crops** (Panels 4, 10, 11, 12, 13, 18, 22) — the header-padding
   value used per panel was tuned by eyeballing a subset of panels and wasn't tall enough for
   several others, so extraction picked up category-name text in the crop before the real content
   started. Fixed by re-measuring the true content-start row for each affected panel directly
   (zoom + column/row activity profile), not by reusing one panel's padding value everywhere.
2. **Equal-width category-boundary assumption was wrong for some panels** (Panels 12 and 13) —
   sub-categories that visually look evenly spaced sometimes touch with zero real background gap
   between some pairs while having a real gap between others (Panel 12: FLOOR/OVERGROWN/ROOTS
   touch, only ROOTS→VINES has a gap). Fixed by measuring real per-category boundaries via a
   column-activity gap profile instead of dividing panel width by category count.
3. **Panel 13's real tree-category structure was different from what both the first cut and the
   first re-cut assumed.** A close ruler-gridded re-measurement of the source found PALMS=2x2=4,
   JUNGLE TREES=2x2=4 (not 2x3=6 as both earlier passes assumed), BROADLEAF=2x3=6, DEAD
   TREES=2x3=6 (not 2x2=4 as the first cut assumed) — the true column count differs per category
   and doesn't match a glance-level read of the sheet. Total item count (20) happened to match
   the first cut's wrong assumption by coincidence, masking the error until crops were opened
   individually.
4. **Panel 22's real structure was undercounted by 4x in the first cut.** STONE BLOCKS, BROKEN
   WALLS, and PILLARS were treated as one single item each; PILLARS is actually 4 freestanding,
   individually-boundaried statues (confirmed by real background gaps between each) and is cut as
   4 separate items. STONE BLOCKS, BROKEN WALLS, and RUINED TILES turned out to be organic
   rubble/debris compositions with no clean internal grid — pixel analysis found real item
   silhouettes (e.g. a distinct chest-shaped block vs. a medallion-topped block) but no
   consistent, verifiable per-item boundary between them (items are staggered/touching in a
   non-grid arrangement). Rather than ship an unverifiable guessed split, each of those three
   categories is filed as one whole-category crop capturing 100% of its real content losslessly.
5. **A sort-order bug silently scrambled category assignment during re-verification** (Panel 13
   specifically) — an early re-cut attempt sorted output crops by absolute row position for
   readability, which interleaves items across categories whenever different categories have
   different per-row item counts in the same physical rows. The pixel-level cuts were correct;
   the bug was purely in how output was labeled/ordered afterward. Fixed by cutting and naming
   every item by its explicit category/row/column position, never trusting index order alone.

**The standing lesson, reinforced hard by this pass:** a debug bounding-box overlay only proves
box *positions* look plausible — it does not reveal baked-in caption text (invisible at overlay
scale) or wrong-category content. The only reliable check is opening every final saved crop PNG
directly and looking at it, which is what caught all of the above.

309 sprites cut in this pass (Panel 13's real DEAD TREES count and Panel 22's real PILLARS count
both differ from the first cut's assumptions — see their sections below). Nothing here is wired
into a renderer yet — see `README.md`'s
folder table for what each folder feeds into once it is wired. New descriptors/categories this
delivery introduced (continuing an existing series everywhere one already existed): `shoreline_*`,
`plateau_*`, `rock_patch_*`, `swamp_*`, `mossy_stone_*`, `lava_rock_*`, `volcanic_rock_*`,
`lava_flow_*`, `coral_ground_*`, `desert_*`, `black_sand_*`, `road_intersection_*`,
`ruin_stone_blocks_*`, `ruin_pillar_*`, `map_edge_*`, `floor_tile_*` (new in `buildings/`), and
`fog_patch_* / cloud_* / mist_* / dust_cloud_*` — the **first entries** in the previously-empty
`weather_fx/` folder. `water_fx/geyser_1.png` is also new. Every other item continues an existing
numbered series (`ground_extra_38..61`, `trans_extra_79..106`, `cobble_13..29`, `tree_9..22` plus
`tree_dead_2..7`, `ruin_pillar_1..4`, `puddle_3..10`, etc.) — checked against the highest existing
number in each folder before assigning, per the standing naming-continuation rule. `tree_23.png`
and `tree_24.png`, filed in the first cut under a miscounted Broadleaf structure, were removed —
Broadleaf's real 6 items fit in `tree_17..22`, freeing those two numbers rather than leaving
gap-filled duplicates.

## Panel 1 — Grass & Dirt Variations (source: Panel I), 24 items
24 ground-tile variations in an 8x3 grid (no individual sheet labels — visually distinct grass/dirt tones and textures).

1. `ground/ground_extra_38.png` (`assets/sprites/tiles/ground/ground_extra_38.png`) — Ground Variation 1
2. `ground/ground_extra_39.png` (`assets/sprites/tiles/ground/ground_extra_39.png`) — Ground Variation 2
3. `ground/ground_extra_40.png` (`assets/sprites/tiles/ground/ground_extra_40.png`) — Ground Variation 3
4. `ground/ground_extra_41.png` (`assets/sprites/tiles/ground/ground_extra_41.png`) — Ground Variation 4
5. `ground/ground_extra_42.png` (`assets/sprites/tiles/ground/ground_extra_42.png`) — Ground Variation 5
6. `ground/ground_extra_43.png` (`assets/sprites/tiles/ground/ground_extra_43.png`) — Ground Variation 6
7. `ground/ground_extra_44.png` (`assets/sprites/tiles/ground/ground_extra_44.png`) — Ground Variation 7
8. `ground/ground_extra_45.png` (`assets/sprites/tiles/ground/ground_extra_45.png`) — Ground Variation 8
9. `ground/ground_extra_46.png` (`assets/sprites/tiles/ground/ground_extra_46.png`) — Ground Variation 9
10. `ground/ground_extra_47.png` (`assets/sprites/tiles/ground/ground_extra_47.png`) — Ground Variation 10
11. `ground/ground_extra_48.png` (`assets/sprites/tiles/ground/ground_extra_48.png`) — Ground Variation 11
12. `ground/ground_extra_49.png` (`assets/sprites/tiles/ground/ground_extra_49.png`) — Ground Variation 12
13. `ground/ground_extra_50.png` (`assets/sprites/tiles/ground/ground_extra_50.png`) — Ground Variation 13
14. `ground/ground_extra_51.png` (`assets/sprites/tiles/ground/ground_extra_51.png`) — Ground Variation 14
15. `ground/ground_extra_52.png` (`assets/sprites/tiles/ground/ground_extra_52.png`) — Ground Variation 15
16. `ground/ground_extra_53.png` (`assets/sprites/tiles/ground/ground_extra_53.png`) — Ground Variation 16
17. `ground/ground_extra_54.png` (`assets/sprites/tiles/ground/ground_extra_54.png`) — Ground Variation 17
18. `ground/ground_extra_55.png` (`assets/sprites/tiles/ground/ground_extra_55.png`) — Ground Variation 18
19. `ground/ground_extra_56.png` (`assets/sprites/tiles/ground/ground_extra_56.png`) — Ground Variation 19
20. `ground/ground_extra_57.png` (`assets/sprites/tiles/ground/ground_extra_57.png`) — Ground Variation 20
21. `ground/ground_extra_58.png` (`assets/sprites/tiles/ground/ground_extra_58.png`) — Ground Variation 21
22. `ground/ground_extra_59.png` (`assets/sprites/tiles/ground/ground_extra_59.png`) — Ground Variation 22
23. `ground/ground_extra_60.png` (`assets/sprites/tiles/ground/ground_extra_60.png`) — Ground Variation 23
24. `ground/ground_extra_61.png` (`assets/sprites/tiles/ground/ground_extra_61.png`) — Ground Variation 24

## Panel 2 — Paths & Roads (Dirt) (source: Panel I), 10 items
STRAIGHT, CORNERS, T-JUNCTIONS, CROSSES, WIDE ROADS — 2 variants each.

1. `paths/path_dirt_13.png` (`assets/sprites/tiles/paths/path_dirt_13.png`) — Straight A
2. `paths/path_dirt_14.png` (`assets/sprites/tiles/paths/path_dirt_14.png`) — Straight B
3. `paths/path_dirt_15.png` (`assets/sprites/tiles/paths/path_dirt_15.png`) — Corners A
4. `paths/path_dirt_16.png` (`assets/sprites/tiles/paths/path_dirt_16.png`) — Corners B
5. `paths/path_dirt_17.png` (`assets/sprites/tiles/paths/path_dirt_17.png`) — T-Junctions A
6. `paths/path_dirt_18.png` (`assets/sprites/tiles/paths/path_dirt_18.png`) — T-Junctions B
7. `paths/path_dirt_19.png` (`assets/sprites/tiles/paths/path_dirt_19.png`) — Crosses A
8. `paths/path_dirt_20.png` (`assets/sprites/tiles/paths/path_dirt_20.png`) — Crosses B
9. `paths/path_dirt_21.png` (`assets/sprites/tiles/paths/path_dirt_21.png`) — Wide Roads A
10. `paths/path_dirt_22.png` (`assets/sprites/tiles/paths/path_dirt_22.png`) — Wide Roads B

## Panel 3 — Paths With Grass Borders (source: Panel I), 8 items
STRAIGHT, CORNERS, T-JUNCTIONS, CROSSES — 2 variants each.

1. `paths/path_grass_border_13.png` (`assets/sprites/tiles/paths/path_grass_border_13.png`) — Straight A
2. `paths/path_grass_border_14.png` (`assets/sprites/tiles/paths/path_grass_border_14.png`) — Straight B
3. `paths/path_grass_border_15.png` (`assets/sprites/tiles/paths/path_grass_border_15.png`) — Corners A
4. `paths/path_grass_border_16.png` (`assets/sprites/tiles/paths/path_grass_border_16.png`) — Corners B
5. `paths/path_grass_border_17.png` (`assets/sprites/tiles/paths/path_grass_border_17.png`) — T-Junctions A
6. `paths/path_grass_border_18.png` (`assets/sprites/tiles/paths/path_grass_border_18.png`) — T-Junctions B
7. `paths/path_grass_border_19.png` (`assets/sprites/tiles/paths/path_grass_border_19.png`) — Crosses A
8. `paths/path_grass_border_20.png` (`assets/sprites/tiles/paths/path_grass_border_20.png`) — Crosses B

## Panel 4 — Cobble Streets (source: Panel I), 16 items
LIGHT, MEDIUM, DARK, MOSAIC — each a 2x2 set of 4 distinct cobble tiles (verified via zoom: NOT a repeated single-tile preview, each quadrant is genuinely different art).

1. `paving/cobble_13.png` (`assets/sprites/tiles/paving/cobble_13.png`) — Light 1
2. `paving/cobble_14.png` (`assets/sprites/tiles/paving/cobble_14.png`) — Light 2
3. `paving/cobble_15.png` (`assets/sprites/tiles/paving/cobble_15.png`) — Light 3
4. `paving/cobble_16.png` (`assets/sprites/tiles/paving/cobble_16.png`) — Light 4
5. `paving/cobble_17.png` (`assets/sprites/tiles/paving/cobble_17.png`) — Medium 1
6. `paving/cobble_18.png` (`assets/sprites/tiles/paving/cobble_18.png`) — Medium 2
7. `paving/cobble_19.png` (`assets/sprites/tiles/paving/cobble_19.png`) — Medium 3
8. `paving/cobble_20.png` (`assets/sprites/tiles/paving/cobble_20.png`) — Medium 4
9. `paving/cobble_21.png` (`assets/sprites/tiles/paving/cobble_21.png`) — Dark 1
10. `paving/cobble_22.png` (`assets/sprites/tiles/paving/cobble_22.png`) — Dark 2
11. `paving/cobble_23.png` (`assets/sprites/tiles/paving/cobble_23.png`) — Dark 3
12. `paving/cobble_24.png` (`assets/sprites/tiles/paving/cobble_24.png`) — Dark 4
13. `paving/cobble_25.png` (`assets/sprites/tiles/paving/cobble_25.png`) — Mosaic 1
14. `paving/cobble_26.png` (`assets/sprites/tiles/paving/cobble_26.png`) — Mosaic 2
15. `paving/cobble_27.png` (`assets/sprites/tiles/paving/cobble_27.png`) — Mosaic 3
16. `paving/cobble_28.png` (`assets/sprites/tiles/paving/cobble_28.png`) — Mosaic 4

## Panel 5 — Grass Transitions (source: Panel I), 10 items
TO DIRT, TO SAND, TO ROCK, TO PATH, TO COBBLE — 2 variants each.

1. `transitions/trans_extra_79.png` (`assets/sprites/tiles/transitions/trans_extra_79.png`) — To Dirt A
2. `transitions/trans_extra_80.png` (`assets/sprites/tiles/transitions/trans_extra_80.png`) — To Dirt B
3. `transitions/trans_extra_81.png` (`assets/sprites/tiles/transitions/trans_extra_81.png`) — To Sand A
4. `transitions/trans_extra_82.png` (`assets/sprites/tiles/transitions/trans_extra_82.png`) — To Sand B
5. `transitions/trans_extra_83.png` (`assets/sprites/tiles/transitions/trans_extra_83.png`) — To Rock A
6. `transitions/trans_extra_84.png` (`assets/sprites/tiles/transitions/trans_extra_84.png`) — To Rock B
7. `transitions/trans_extra_85.png` (`assets/sprites/tiles/transitions/trans_extra_85.png`) — To Path A
8. `transitions/trans_extra_86.png` (`assets/sprites/tiles/transitions/trans_extra_86.png`) — To Path B
9. `transitions/trans_extra_87.png` (`assets/sprites/tiles/transitions/trans_extra_87.png`) — To Cobble A
10. `transitions/trans_extra_88.png` (`assets/sprites/tiles/transitions/trans_extra_88.png`) — To Cobble B

## Panel 6 — Dirt Transitions (source: Panel I), 10 items
TO GRASS, TO SAND, TO ROCK, TO PATH, TO COBBLE — 2 variants each.

1. `transitions/trans_extra_89.png` (`assets/sprites/tiles/transitions/trans_extra_89.png`) — To Grass A
2. `transitions/trans_extra_90.png` (`assets/sprites/tiles/transitions/trans_extra_90.png`) — To Grass B
3. `transitions/trans_extra_91.png` (`assets/sprites/tiles/transitions/trans_extra_91.png`) — To Sand A
4. `transitions/trans_extra_92.png` (`assets/sprites/tiles/transitions/trans_extra_92.png`) — To Sand B
5. `transitions/trans_extra_93.png` (`assets/sprites/tiles/transitions/trans_extra_93.png`) — To Rock A
6. `transitions/trans_extra_94.png` (`assets/sprites/tiles/transitions/trans_extra_94.png`) — To Rock B
7. `transitions/trans_extra_95.png` (`assets/sprites/tiles/transitions/trans_extra_95.png`) — To Path A
8. `transitions/trans_extra_96.png` (`assets/sprites/tiles/transitions/trans_extra_96.png`) — To Path B
9. `transitions/trans_extra_97.png` (`assets/sprites/tiles/transitions/trans_extra_97.png`) — To Cobble A
10. `transitions/trans_extra_98.png` (`assets/sprites/tiles/transitions/trans_extra_98.png`) — To Cobble B

## Panel 7 — Sand & Beach (source: Panel II), 8 items
SAND, WET SAND, BEACH PATHS, SAND DETAILS — 2 variants each.

1. `beach/beach_5.png` (`assets/sprites/tiles/beach/beach_5.png`) — Sand A
2. `beach/beach_6.png` (`assets/sprites/tiles/beach/beach_6.png`) — Sand B
3. `beach/beach_7.png` (`assets/sprites/tiles/beach/beach_7.png`) — Wet Sand A
4. `beach/beach_8.png` (`assets/sprites/tiles/beach/beach_8.png`) — Wet Sand B
5. `beach/beach_9.png` (`assets/sprites/tiles/beach/beach_9.png`) — Beach Paths A
6. `beach/beach_10.png` (`assets/sprites/tiles/beach/beach_10.png`) — Beach Paths B
7. `beach/beach_11.png` (`assets/sprites/tiles/beach/beach_11.png`) — Sand Details A
8. `beach/beach_12.png` (`assets/sprites/tiles/beach/beach_12.png`) — Sand Details B

## Panel 8 — Shorelines (Water Edge) (source: Panel II), 4 items
SMOOTH, ROCKY, CLIFF BASE, REEF — single wide scene each.

1. `beach/shoreline_1.png` (`assets/sprites/tiles/beach/shoreline_1.png`) — Smooth
2. `beach/shoreline_2.png` (`assets/sprites/tiles/beach/shoreline_2.png`) — Rocky
3. `beach/shoreline_3.png` (`assets/sprites/tiles/beach/shoreline_3.png`) — Cliff Base
4. `beach/shoreline_4.png` (`assets/sprites/tiles/beach/shoreline_4.png`) — Reef

## Panel 9 — Sea & Water Tiles (source: Panel II), 12 items
DEEP SEA, MID SEA, SHALLOW, CLEAR SHOAL (base tiles, 1 each) + WAVES & FOAM VARIATIONS sub-strip (8 distinct wave/foam icons).

1. `water/water_extra_19.png` (`assets/sprites/tiles/water/water_extra_19.png`) — Deep Sea
2. `water/water_extra_20.png` (`assets/sprites/tiles/water/water_extra_20.png`) — Mid Sea
3. `water/water_extra_21.png` (`assets/sprites/tiles/water/water_extra_21.png`) — Shallow
4. `water/water_extra_22.png` (`assets/sprites/tiles/water/water_extra_22.png`) — Clear Shoal
5. `water_fx_extra_14.png` (`assets/sprites/water_fx/water_fx_extra_14.png`) — Wave/Foam 1
6. `water_fx_extra_15.png` (`assets/sprites/water_fx/water_fx_extra_15.png`) — Wave/Foam 2
7. `water_fx_extra_16.png` (`assets/sprites/water_fx/water_fx_extra_16.png`) — Wave/Foam 3
8. `water_fx_extra_17.png` (`assets/sprites/water_fx/water_fx_extra_17.png`) — Wave/Foam 4
9. `water_fx_extra_18.png` (`assets/sprites/water_fx/water_fx_extra_18.png`) — Wave/Foam 5
10. `water_fx_extra_19.png` (`assets/sprites/water_fx/water_fx_extra_19.png`) — Wave/Foam 6
11. `water_fx_extra_20.png` (`assets/sprites/water_fx/water_fx_extra_20.png`) — Wave/Foam 7
12. `water_fx_extra_21.png` (`assets/sprites/water_fx/water_fx_extra_21.png`) — Wave/Foam 8

## Panel 10 — Cliffs & Ledges (source: Panel III), 16 items
CLIFF TOP, CLIFF SIDES, LEDGES, PLATEAUS — each a 2x2 set of 4 distinct pieces.

1. `elevation/cliff_top_edge_8.png` (`assets/sprites/tiles/elevation/cliff_top_edge_8.png`) — Cliff Top 1
2. `elevation/cliff_top_edge_9.png` (`assets/sprites/tiles/elevation/cliff_top_edge_9.png`) — Cliff Top 2
3. `elevation/cliff_top_edge_10.png` (`assets/sprites/tiles/elevation/cliff_top_edge_10.png`) — Cliff Top 3
4. `elevation/cliff_top_edge_11.png` (`assets/sprites/tiles/elevation/cliff_top_edge_11.png`) — Cliff Top 4
5. `elevation/cliff_wall_5.png` (`assets/sprites/tiles/elevation/cliff_wall_5.png`) — Cliff Sides 1
6. `elevation/cliff_wall_6.png` (`assets/sprites/tiles/elevation/cliff_wall_6.png`) — Cliff Sides 2
7. `elevation/cliff_wall_7.png` (`assets/sprites/tiles/elevation/cliff_wall_7.png`) — Cliff Sides 3
8. `elevation/cliff_wall_8.png` (`assets/sprites/tiles/elevation/cliff_wall_8.png`) — Cliff Sides 4
9. `elevation/elevation_ledge_7.png` (`assets/sprites/tiles/elevation/elevation_ledge_7.png`) — Ledges 1
10. `elevation/elevation_ledge_8.png` (`assets/sprites/tiles/elevation/elevation_ledge_8.png`) — Ledges 2
11. `elevation/elevation_ledge_9.png` (`assets/sprites/tiles/elevation/elevation_ledge_9.png`) — Ledges 3
12. `elevation/elevation_ledge_10.png` (`assets/sprites/tiles/elevation/elevation_ledge_10.png`) — Ledges 4
13. `elevation/plateau_1.png` (`assets/sprites/tiles/elevation/plateau_1.png`) — Plateaus 1
14. `elevation/plateau_2.png` (`assets/sprites/tiles/elevation/plateau_2.png`) — Plateaus 2
15. `elevation/plateau_3.png` (`assets/sprites/tiles/elevation/plateau_3.png`) — Plateaus 3
16. `elevation/plateau_4.png` (`assets/sprites/tiles/elevation/plateau_4.png`) — Plateaus 4

## Panel 11 — Rocks & Stones (source: Panel III), 8 items
SMALL ROCKS, BOULDERS, ROCK OUTCROPS, STONE PATCHES — 2 scattered-arrangement variants each (organic scenes, not further subdivided).

1. `rocks/rock_small_9.png` (`assets/sprites/nature/rocks/rock_small_9.png`) — Small Rocks A
2. `rocks/rock_small_10.png` (`assets/sprites/nature/rocks/rock_small_10.png`) — Small Rocks B
3. `rocks/boulder_large_4.png` (`assets/sprites/nature/rocks/boulder_large_4.png`) — Boulders A
4. `rocks/boulder_large_5.png` (`assets/sprites/nature/rocks/boulder_large_5.png`) — Boulders B
5. `rocks/rock_extra_24.png` (`assets/sprites/nature/rocks/rock_extra_24.png`) — Rock Outcrops A
6. `rocks/rock_extra_25.png` (`assets/sprites/nature/rocks/rock_extra_25.png`) — Rock Outcrops B
7. `rocks/rock_patch_1.png` (`assets/sprites/nature/rocks/rock_patch_1.png`) — Stone Patches A
8. `rocks/rock_patch_2.png` (`assets/sprites/nature/rocks/rock_patch_2.png`) — Stone Patches B

## Panel 12 — Jungle/Dense Ground (source: Panel III), 16 items
FLOOR, OVERGROWN, ROOTS — each a 2x2 set of 4; VINES — 4 individual hanging-vine strands (1 row, not 2x2).

1. `ground/jungle_ground_13.png` (`assets/sprites/tiles/ground/jungle_ground_13.png`) — Floor 1
2. `ground/jungle_ground_14.png` (`assets/sprites/tiles/ground/jungle_ground_14.png`) — Floor 2
3. `ground/jungle_ground_15.png` (`assets/sprites/tiles/ground/jungle_ground_15.png`) — Floor 3
4. `ground/jungle_ground_16.png` (`assets/sprites/tiles/ground/jungle_ground_16.png`) — Floor 4
5. `ground/jungle_ground_17.png` (`assets/sprites/tiles/ground/jungle_ground_17.png`) — Overgrown 1
6. `ground/jungle_ground_18.png` (`assets/sprites/tiles/ground/jungle_ground_18.png`) — Overgrown 2
7. `ground/jungle_ground_19.png` (`assets/sprites/tiles/ground/jungle_ground_19.png`) — Overgrown 3
8. `ground/jungle_ground_20.png` (`assets/sprites/tiles/ground/jungle_ground_20.png`) — Overgrown 4
9. `ground/jungle_ground_21.png` (`assets/sprites/tiles/ground/jungle_ground_21.png`) — Roots 1
10. `ground/jungle_ground_22.png` (`assets/sprites/tiles/ground/jungle_ground_22.png`) — Roots 2
11. `ground/jungle_ground_23.png` (`assets/sprites/tiles/ground/jungle_ground_23.png`) — Roots 3
12. `ground/jungle_ground_24.png` (`assets/sprites/tiles/ground/jungle_ground_24.png`) — Roots 4
13. `ground/jungle_ground_25.png` (`assets/sprites/tiles/ground/jungle_ground_25.png`) — Vines 1
14. `ground/jungle_ground_26.png` (`assets/sprites/tiles/ground/jungle_ground_26.png`) — Vines 2
15. `ground/jungle_ground_27.png` (`assets/sprites/tiles/ground/jungle_ground_27.png`) — Vines 3
16. `ground/jungle_ground_28.png` (`assets/sprites/tiles/ground/jungle_ground_28.png`) — Vines 4

## Panel 13 — Trees (Variety) (source: Panel III), 20 items
PALMS (2x2=4), JUNGLE TREES (2x2=4), BROADLEAF (2x3=6), DEAD TREES (2x3=6) — real structure
confirmed via a ruler-gridded re-measurement of the source after the first cut and first re-cut
both mis-assumed JUNGLE TREES=6/DEAD TREES=4 (their total happened to match this panel's true
total of 20, which is what let the error ship undetected the first time).

1. `trees/tree_9.png` (`assets/sprites/nature/trees/tree_9.png`) — Palm 1
2. `trees/tree_10.png` (`assets/sprites/nature/trees/tree_10.png`) — Palm 2
3. `trees/tree_11.png` (`assets/sprites/nature/trees/tree_11.png`) — Palm 3
4. `trees/tree_12.png` (`assets/sprites/nature/trees/tree_12.png`) — Palm 4
5. `trees/tree_13.png` (`assets/sprites/nature/trees/tree_13.png`) — Jungle Tree 1
6. `trees/tree_14.png` (`assets/sprites/nature/trees/tree_14.png`) — Jungle Tree 2
7. `trees/tree_15.png` (`assets/sprites/nature/trees/tree_15.png`) — Jungle Tree 3
8. `trees/tree_16.png` (`assets/sprites/nature/trees/tree_16.png`) — Jungle Tree 4
9. `trees/tree_17.png` (`assets/sprites/nature/trees/tree_17.png`) — Broadleaf 1
10. `trees/tree_18.png` (`assets/sprites/nature/trees/tree_18.png`) — Broadleaf 2
11. `trees/tree_19.png` (`assets/sprites/nature/trees/tree_19.png`) — Broadleaf 3
12. `trees/tree_20.png` (`assets/sprites/nature/trees/tree_20.png`) — Broadleaf 4
13. `trees/tree_21.png` (`assets/sprites/nature/trees/tree_21.png`) — Broadleaf 5
14. `trees/tree_22.png` (`assets/sprites/nature/trees/tree_22.png`) — Broadleaf 6
15. `trees/tree_dead_2.png` (`assets/sprites/nature/trees/tree_dead_2.png`) — Dead Tree 1
16. `trees/tree_dead_3.png` (`assets/sprites/nature/trees/tree_dead_3.png`) — Dead Tree 2
17. `trees/tree_dead_4.png` (`assets/sprites/nature/trees/tree_dead_4.png`) — Dead Tree 3
18. `trees/tree_dead_5.png` (`assets/sprites/nature/trees/tree_dead_5.png`) — Dead Tree 4
19. `trees/tree_dead_6.png` (`assets/sprites/nature/trees/tree_dead_6.png`) — Dead Tree 5
20. `trees/tree_dead_7.png` (`assets/sprites/nature/trees/tree_dead_7.png`) — Dead Tree 6

## Panel 14 — Bushes & Plants (source: Panel IV), 24 items
24 bush/plant variations in an 8x3 grid.

1. `vegetation/bush_plant_28.png` (`assets/sprites/nature/vegetation/bush_plant_28.png`) — Bush/Plant 1
2. `vegetation/bush_plant_29.png` (`assets/sprites/nature/vegetation/bush_plant_29.png`) — Bush/Plant 2
3. `vegetation/bush_plant_30.png` (`assets/sprites/nature/vegetation/bush_plant_30.png`) — Bush/Plant 3
4. `vegetation/bush_plant_31.png` (`assets/sprites/nature/vegetation/bush_plant_31.png`) — Bush/Plant 4
5. `vegetation/bush_plant_32.png` (`assets/sprites/nature/vegetation/bush_plant_32.png`) — Bush/Plant 5
6. `vegetation/bush_plant_33.png` (`assets/sprites/nature/vegetation/bush_plant_33.png`) — Bush/Plant 6
7. `vegetation/bush_plant_34.png` (`assets/sprites/nature/vegetation/bush_plant_34.png`) — Bush/Plant 7
8. `vegetation/bush_plant_35.png` (`assets/sprites/nature/vegetation/bush_plant_35.png`) — Bush/Plant 8
9. `vegetation/bush_plant_36.png` (`assets/sprites/nature/vegetation/bush_plant_36.png`) — Bush/Plant 9
10. `vegetation/bush_plant_37.png` (`assets/sprites/nature/vegetation/bush_plant_37.png`) — Bush/Plant 10
11. `vegetation/bush_plant_38.png` (`assets/sprites/nature/vegetation/bush_plant_38.png`) — Bush/Plant 11
12. `vegetation/bush_plant_39.png` (`assets/sprites/nature/vegetation/bush_plant_39.png`) — Bush/Plant 12
13. `vegetation/bush_plant_40.png` (`assets/sprites/nature/vegetation/bush_plant_40.png`) — Bush/Plant 13
14. `vegetation/bush_plant_41.png` (`assets/sprites/nature/vegetation/bush_plant_41.png`) — Bush/Plant 14
15. `vegetation/bush_plant_42.png` (`assets/sprites/nature/vegetation/bush_plant_42.png`) — Bush/Plant 15
16. `vegetation/bush_plant_43.png` (`assets/sprites/nature/vegetation/bush_plant_43.png`) — Bush/Plant 16
17. `vegetation/bush_plant_44.png` (`assets/sprites/nature/vegetation/bush_plant_44.png`) — Bush/Plant 17
18. `vegetation/bush_plant_45.png` (`assets/sprites/nature/vegetation/bush_plant_45.png`) — Bush/Plant 18
19. `vegetation/bush_plant_46.png` (`assets/sprites/nature/vegetation/bush_plant_46.png`) — Bush/Plant 19
20. `vegetation/bush_plant_47.png` (`assets/sprites/nature/vegetation/bush_plant_47.png`) — Bush/Plant 20
21. `vegetation/bush_plant_48.png` (`assets/sprites/nature/vegetation/bush_plant_48.png`) — Bush/Plant 21
22. `vegetation/bush_plant_49.png` (`assets/sprites/nature/vegetation/bush_plant_49.png`) — Bush/Plant 22
23. `vegetation/bush_plant_50.png` (`assets/sprites/nature/vegetation/bush_plant_50.png`) — Bush/Plant 23
24. `vegetation/bush_plant_51.png` (`assets/sprites/nature/vegetation/bush_plant_51.png`) — Bush/Plant 24

## Panel 15 — Tropical Flowers & Plants (source: Panel IV), 24 items
24 flower/plant variations in an 8x3 grid.

1. `vegetation/flowers_5.png` (`assets/sprites/nature/vegetation/flowers_5.png`) — Flower/Plant 1
2. `vegetation/flowers_6.png` (`assets/sprites/nature/vegetation/flowers_6.png`) — Flower/Plant 2
3. `vegetation/flowers_7.png` (`assets/sprites/nature/vegetation/flowers_7.png`) — Flower/Plant 3
4. `vegetation/flowers_8.png` (`assets/sprites/nature/vegetation/flowers_8.png`) — Flower/Plant 4
5. `vegetation/flowers_9.png` (`assets/sprites/nature/vegetation/flowers_9.png`) — Flower/Plant 5
6. `vegetation/flowers_10.png` (`assets/sprites/nature/vegetation/flowers_10.png`) — Flower/Plant 6
7. `vegetation/flowers_11.png` (`assets/sprites/nature/vegetation/flowers_11.png`) — Flower/Plant 7
8. `vegetation/flowers_12.png` (`assets/sprites/nature/vegetation/flowers_12.png`) — Flower/Plant 8
9. `vegetation/flowers_13.png` (`assets/sprites/nature/vegetation/flowers_13.png`) — Flower/Plant 9
10. `vegetation/flowers_14.png` (`assets/sprites/nature/vegetation/flowers_14.png`) — Flower/Plant 10
11. `vegetation/flowers_15.png` (`assets/sprites/nature/vegetation/flowers_15.png`) — Flower/Plant 11
12. `vegetation/flowers_16.png` (`assets/sprites/nature/vegetation/flowers_16.png`) — Flower/Plant 12
13. `vegetation/flowers_17.png` (`assets/sprites/nature/vegetation/flowers_17.png`) — Flower/Plant 13
14. `vegetation/flowers_18.png` (`assets/sprites/nature/vegetation/flowers_18.png`) — Flower/Plant 14
15. `vegetation/flowers_19.png` (`assets/sprites/nature/vegetation/flowers_19.png`) — Flower/Plant 15
16. `vegetation/flowers_20.png` (`assets/sprites/nature/vegetation/flowers_20.png`) — Flower/Plant 16
17. `vegetation/flowers_21.png` (`assets/sprites/nature/vegetation/flowers_21.png`) — Flower/Plant 17
18. `vegetation/flowers_22.png` (`assets/sprites/nature/vegetation/flowers_22.png`) — Flower/Plant 18
19. `vegetation/flowers_23.png` (`assets/sprites/nature/vegetation/flowers_23.png`) — Flower/Plant 19
20. `vegetation/flowers_24.png` (`assets/sprites/nature/vegetation/flowers_24.png`) — Flower/Plant 20
21. `vegetation/flowers_25.png` (`assets/sprites/nature/vegetation/flowers_25.png`) — Flower/Plant 21
22. `vegetation/flowers_26.png` (`assets/sprites/nature/vegetation/flowers_26.png`) — Flower/Plant 22
23. `vegetation/flowers_27.png` (`assets/sprites/nature/vegetation/flowers_27.png`) — Flower/Plant 23
24. `vegetation/flowers_28.png` (`assets/sprites/nature/vegetation/flowers_28.png`) — Flower/Plant 24

## Panel 16 — Steps, Stairs & Ramps (source: Panel IV), 5 items
DIRT STAIRS, STONE STAIRS, WOOD STAIRS, EARTH RAMP UP, EARTH RAMP DOWN — single item each.

1. `elevation/stairs_ramp_22.png` (`assets/sprites/tiles/elevation/stairs_ramp_22.png`) — Dirt Stairs
2. `elevation/stairs_ramp_23.png` (`assets/sprites/tiles/elevation/stairs_ramp_23.png`) — Stone Stairs
3. `elevation/stairs_ramp_24.png` (`assets/sprites/tiles/elevation/stairs_ramp_24.png`) — Wood Stairs
4. `elevation/stairs_ramp_25.png` (`assets/sprites/tiles/elevation/stairs_ramp_25.png`) — Earth Ramp Up
5. `elevation/stairs_ramp_26.png` (`assets/sprites/tiles/elevation/stairs_ramp_26.png`) — Earth Ramp Down

## Panel 17 — Bridges & Boardwalks (source: Panel IV), 4 items
WOOD BRIDGE, ROPE BRIDGE, PLANK WALKWAY, PIER SECTION — single item each.

1. `bridges/bridge_wood_3.png` (`assets/sprites/tiles/bridges/bridge_wood_3.png`) — Wood Bridge
2. `bridges/bridge_rope_3.png` (`assets/sprites/tiles/bridges/bridge_rope_3.png`) — Rope Bridge
3. `boardwalk_2.png` (`assets/sprites/harbour/boardwalk_2.png`) — Plank Walkway
4. `pier_module_2.png` (`assets/sprites/harbour/pier_module_2.png`) — Pier Section

## Panel 18 — Special Surfaces (source: Panel IV), 4 items
MUD, SWAMP, MOSSY STONE, LAVA ROCK — single item each.

1. `ground/mud_2.png` (`assets/sprites/tiles/ground/mud_2.png`) — Mud
2. `ground/swamp_1.png` (`assets/sprites/tiles/ground/swamp_1.png`) — Swamp
3. `ground/mossy_stone_1.png` (`assets/sprites/tiles/ground/mossy_stone_1.png`) — Mossy Stone
4. `ground/lava_rock_1.png` (`assets/sprites/tiles/ground/lava_rock_1.png`) — Lava Rock

## Panel 19 — Building Foundations/Floors (source: Panel V), 5 items
WOOD FLOOR, STONE FLOOR, DIRT FLOOR, PLANK PLATFORM, RUINED FLOOR — single item each.

1. `floor_tile_1.png` (`assets/sprites/buildings/floor_tile_1.png`) — Wood Floor
2. `floor_tile_2.png` (`assets/sprites/buildings/floor_tile_2.png`) — Stone Floor
3. `floor_tile_3.png` (`assets/sprites/buildings/floor_tile_3.png`) — Dirt Floor
4. `floor_tile_4.png` (`assets/sprites/buildings/floor_tile_4.png`) — Plank Platform
5. `floor_tile_5.png` (`assets/sprites/buildings/floor_tile_5.png`) — Ruined Floor

## Panel 20 — Footprints & Tracks (source: Panel V), 4 items
HUMAN FOOTSTEPS, BAREFOOT, ANIMAL TRACKS, WHEEL TRACKS — single item each.

1. `ground_decal_21.png` (`assets/sprites/decals/ground_decal_21.png`) — Human Footsteps
2. `ground_decal_22.png` (`assets/sprites/decals/ground_decal_22.png`) — Barefoot
3. `ground_decal_23.png` (`assets/sprites/decals/ground_decal_23.png`) — Animal Tracks
4. `ground_decal_24.png` (`assets/sprites/decals/ground_decal_24.png`) — Wheel Tracks

## Panel 21 — Debris & Small Details (source: Panel V), 5 items
DRIFTWOOD, SHELLS, PEBBLES, SCATTERED LEAVES, SEAWEED — single item each.

1. `ground_decal_25.png` (`assets/sprites/decals/ground_decal_25.png`) — Driftwood
2. `ground_decal_26.png` (`assets/sprites/decals/ground_decal_26.png`) — Shells
3. `ground_decal_27.png` (`assets/sprites/decals/ground_decal_27.png`) — Pebbles
4. `ground_decal_28.png` (`assets/sprites/decals/ground_decal_28.png`) — Scattered Leaves
5. `ground_decal_29.png` (`assets/sprites/decals/ground_decal_29.png`) — Seaweed

## Panel 22 — Ruins & Ancient Stone (source: Panel V), 7 items
The first cut treated all 4 category labels as single items (4 total) — wrong. PILLARS is
actually 4 freestanding, individually-boundaried statues (real background gaps confirmed between
each one), cut as 4 separate items. STONE BLOCKS, BROKEN WALLS, and RUINED TILES are organic
rubble/debris compositions with real, visually-distinct item silhouettes inside them but no
consistent verifiable per-item pixel boundary (items touch/stagger with no clean grid) — each is
filed as one whole-category crop capturing its full real content rather than an unverifiable
guessed split.

1. `ruin_stone_blocks_1.png` (`assets/sprites/props/ruin_stone_blocks_1.png`) — Stone Blocks (whole composition)
2. `fence_wall_extra_20.png` (`assets/sprites/props/fence_wall_extra_20.png`) — Broken Walls (whole composition)
3. `ruin_pillar_1.png` (`assets/sprites/props/ruin_pillar_1.png`) — Pillar 1 (squat, medallion top)
4. `ruin_pillar_2.png` (`assets/sprites/props/ruin_pillar_2.png`) — Pillar 2 (short, broken/angled top)
5. `ruin_pillar_3.png` (`assets/sprites/props/ruin_pillar_3.png`) — Pillar 3 (tall, medallion top)
6. `ruin_pillar_4.png` (`assets/sprites/props/ruin_pillar_4.png`) — Pillar 4 (small, decorative finial)
7. `ground/broken_ground_3.png` (`assets/sprites/tiles/ground/broken_ground_3.png`) — Ruined Tiles (whole composition)

## Panel 23 — Waterfalls & Rivers (source: Panel VI), 4 items
WATERFALLS, RIVER TILES, RIVER EDGES, RAPIDS — single item each.

1. `waterfall_piece_15.png` (`assets/sprites/water_fx/waterfall_piece_15.png`) — Waterfalls
2. `water/water_extra_23.png` (`assets/sprites/tiles/water/water_extra_23.png`) — River Tiles
3. `water_fx_extra_22.png` (`assets/sprites/water_fx/water_fx_extra_22.png`) — River Edges
4. `water_fx_extra_23.png` (`assets/sprites/water_fx/water_fx_extra_23.png`) — Rapids

## Panel 24 — River/Water Transitions (source: Panel VI), 4 items
WATER TO GRASS, WATER TO DIRT, WATER TO ROCK, WATER TO SAND — single item each.

1. `transitions/trans_extra_99.png` (`assets/sprites/tiles/transitions/trans_extra_99.png`) — Water To Grass
2. `transitions/trans_extra_100.png` (`assets/sprites/tiles/transitions/trans_extra_100.png`) — Water To Dirt
3. `transitions/trans_extra_101.png` (`assets/sprites/tiles/transitions/trans_extra_101.png`) — Water To Rock
4. `transitions/trans_extra_102.png` (`assets/sprites/tiles/transitions/trans_extra_102.png`) — Water To Sand

## Panel 25 — Cliff & Rock Transitions (source: Panel VI), 4 items
CLIFF TO GRASS, CLIFF TO DIRT, CLIFF TO SAND, CLIFF TO WATER — single item each.

1. `transitions/trans_extra_103.png` (`assets/sprites/tiles/transitions/trans_extra_103.png`) — Cliff To Grass
2. `transitions/trans_extra_104.png` (`assets/sprites/tiles/transitions/trans_extra_104.png`) — Cliff To Dirt
3. `transitions/trans_extra_105.png` (`assets/sprites/tiles/transitions/trans_extra_105.png`) — Cliff To Sand
4. `transitions/trans_extra_106.png` (`assets/sprites/tiles/transitions/trans_extra_106.png`) — Cliff To Water

## Panel 26 — Road Intersections (Variations) (source: Panel VI), 4 items
4-WAY, 3-WAY, AS Y SHAPE, CIRCLE — single item each.

1. `paths/road_intersection_1.png` (`assets/sprites/tiles/paths/road_intersection_1.png`) — 4-Way
2. `paths/road_intersection_2.png` (`assets/sprites/tiles/paths/road_intersection_2.png`) — 3-Way
3. `paths/road_intersection_3.png` (`assets/sprites/tiles/paths/road_intersection_3.png`) — As Y Shape
4. `paths/road_intersection_4.png` (`assets/sprites/tiles/paths/road_intersection_4.png`) — Circle

## Panel 27 — Overgrown/Wild Paths (source: Panel VI), 4 items
OVERGROWN PATH, BROKEN ROAD, WEEDY PATH, RUINED COBBLE — single item each.

1. `paths/path_dirt_23.png` (`assets/sprites/tiles/paths/path_dirt_23.png`) — Overgrown Path
2. `paving/road_worn_9.png` (`assets/sprites/tiles/paving/road_worn_9.png`) — Broken Road
3. `paths/path_dirt_24.png` (`assets/sprites/tiles/paths/path_dirt_24.png`) — Weedy Path
4. `paving/cobble_29.png` (`assets/sprites/tiles/paving/cobble_29.png`) — Ruined Cobble

## Panel 28 — Island Terrain Specials (source: Panel VII), 5 items
VOLCANIC ROCK, LAVA FLOW, GEYSER, BLACK SAND, CORAL GROUND — single item each.

1. `ground/volcanic_rock_1.png` (`assets/sprites/tiles/ground/volcanic_rock_1.png`) — Volcanic Rock
2. `ground/lava_flow_1.png` (`assets/sprites/tiles/ground/lava_flow_1.png`) — Lava Flow
3. `geyser_1.png` (`assets/sprites/water_fx/geyser_1.png`) — Geyser
4. `beach/black_sand_1.png` (`assets/sprites/tiles/beach/black_sand_1.png`) — Black Sand
5. `ground/coral_ground_1.png` (`assets/sprites/tiles/ground/coral_ground_1.png`) — Coral Ground

## Panel 29 — Desert/Dry Islands (source: Panel VII), 5 items
CRACKED EARTH, DRY SAND, CACTUS GROUND, ROCKY DESERT, SAND DUNES — single item each.

1. `ground/desert_cracked_earth_1.png` (`assets/sprites/tiles/ground/desert_cracked_earth_1.png`) — Cracked Earth
2. `ground/desert_dry_sand_1.png` (`assets/sprites/tiles/ground/desert_dry_sand_1.png`) — Dry Sand
3. `ground/desert_cactus_ground_1.png` (`assets/sprites/tiles/ground/desert_cactus_ground_1.png`) — Cactus Ground
4. `ground/desert_rocky_1.png` (`assets/sprites/tiles/ground/desert_rocky_1.png`) — Rocky Desert
5. `ground/desert_dunes_1.png` (`assets/sprites/tiles/ground/desert_dunes_1.png`) — Sand Dunes

## Panel 30 — Cloud/Fog/Misc Atmosphere (source: Panel VII), 12 items
FOG PATCHES, CLOUDS, MIST, DUST CLOUDS — single item each; PUDDLES — 2x4 grid of 8 distinct small puddle shapes.

1. `fog_patch_1.png` (`assets/sprites/weather_fx/fog_patch_1.png`) — Fog Patches
2. `cloud_1.png` (`assets/sprites/weather_fx/cloud_1.png`) — Clouds
3. `mist_1.png` (`assets/sprites/weather_fx/mist_1.png`) — Mist
4. `dust_cloud_1.png` (`assets/sprites/weather_fx/dust_cloud_1.png`) — Dust Clouds
5. `ground/puddle_3.png` (`assets/sprites/tiles/ground/puddle_3.png`) — Puddle 1
6. `ground/puddle_4.png` (`assets/sprites/tiles/ground/puddle_4.png`) — Puddle 2
7. `ground/puddle_5.png` (`assets/sprites/tiles/ground/puddle_5.png`) — Puddle 3
8. `ground/puddle_6.png` (`assets/sprites/tiles/ground/puddle_6.png`) — Puddle 4
9. `ground/puddle_7.png` (`assets/sprites/tiles/ground/puddle_7.png`) — Puddle 5
10. `ground/puddle_8.png` (`assets/sprites/tiles/ground/puddle_8.png`) — Puddle 6
11. `ground/puddle_9.png` (`assets/sprites/tiles/ground/puddle_9.png`) — Puddle 7
12. `ground/puddle_10.png` (`assets/sprites/tiles/ground/puddle_10.png`) — Puddle 8

## Panel 31 — Map Edge/Out of Bounds (source: Panel VII), 4 items
MAP EDGE GRASS, MAP EDGE DIRT, MAP EDGE SAND, MAP EDGE WATER — screen-edge vignette/fade overlays, single item each.

1. `map_edge_grass_1.png` (`assets/sprites/decals/map_edge_grass_1.png`) — Map Edge Grass
2. `map_edge_dirt_1.png` (`assets/sprites/decals/map_edge_dirt_1.png`) — Map Edge Dirt
3. `map_edge_sand_1.png` (`assets/sprites/decals/map_edge_sand_1.png`) — Map Edge Sand
4. `map_edge_water_1.png` (`assets/sprites/decals/map_edge_water_1.png`) — Map Edge Water

## Panel 32 — Decorative Details & Props (Tileable) (source: Panel VIII), 19 items
BARRELS, CRATES, SACKS, FENCES — each a 2x2 set of 4; CAMPFIRE — single item; SIGNS — 2 stacked variants.

1. `barrels_4.png` (`assets/sprites/props/barrels_4.png`) — Barrel 1
2. `barrels_5.png` (`assets/sprites/props/barrels_5.png`) — Barrel 2
3. `barrels_6.png` (`assets/sprites/props/barrels_6.png`) — Barrel 3
4. `barrels_7.png` (`assets/sprites/props/barrels_7.png`) — Barrel 4
5. `crates_3.png` (`assets/sprites/props/crates_3.png`) — Crate 1
6. `crates_4.png` (`assets/sprites/props/crates_4.png`) — Crate 2
7. `crates_5.png` (`assets/sprites/props/crates_5.png`) — Crate 3
8. `crates_6.png` (`assets/sprites/props/crates_6.png`) — Crate 4
9. `sacks_3.png` (`assets/sprites/props/sacks_3.png`) — Sack 1
10. `sacks_4.png` (`assets/sprites/props/sacks_4.png`) — Sack 2
11. `sacks_5.png` (`assets/sprites/props/sacks_5.png`) — Sack 3
12. `sacks_6.png` (`assets/sprites/props/sacks_6.png`) — Sack 4
13. `campfire_3.png` (`assets/sprites/props/campfire_3.png`) — Campfire
14. `signpost_4.png` (`assets/sprites/props/signpost_4.png`) — Sign 1
15. `signpost_5.png` (`assets/sprites/props/signpost_5.png`) — Sign 2
16. `fence_wall_extra_21.png` (`assets/sprites/props/fence_wall_extra_21.png`) — Fence 1
17. `fence_wall_extra_22.png` (`assets/sprites/props/fence_wall_extra_22.png`) — Fence 2
18. `fence_wall_extra_23.png` (`assets/sprites/props/fence_wall_extra_23.png`) — Fence 3
19. `fence_wall_extra_24.png` (`assets/sprites/props/fence_wall_extra_24.png`) — Fence 4
