// Real map art, sliced from the two reference tileset sheets the user supplied
// (assets/brand/tileset-catalog/master_catalog_v1.png — the full 16-category catalog preview, and
// tortuga_focus_v1.png — a Tortuga-specific pass whose building nameplates happen to match several
// of Tortuga Cove's existing shops almost exactly). This is the first slice of the incremental
// per-screen art pass GAME_DESIGN.md tracks: Tortuga Cove only, for now — everywhere else stays on
// the emoji/procedural system until more per-category sheets arrive (see the user's stated plan).
//
// Cutout technique: unlike Scally's character sheet, these sheets render each item over a
// continuous *blurred* background (real depth-of-field, not a flat color or gradient) — a
// flood-fill/color-threshold cutout has no boundary to key on there and kept bleeding into
// neighboring items. The blur itself is the usable signal instead: every foreground object is in
// sharp focus and the background isn't, so segmenting on local edge/gradient strength (rather than
// color) reliably separates them. Pipeline per asset: gaussian-smooth, take the gradient magnitude,
// threshold it to a boundary mask, dilate+close to seal any gaps in that boundary into a closed
// contour, binary_fill_holes to solidify the interior, erode back off the dilation, keep the
// largest connected component, then feather the final silhouette edge by ~1px for anti-aliasing.
// An earlier pass here used a soft vignette-crop (fade a rounded-rect alpha mask at the edges)
// instead of a real cutout — it hid bleed rather than removing it and shipped visibly blurry,
// muddy icons; every asset below has been re-cut with the edge/gradient technique instead.

/** Ground tile textures — tiled via an SVG <Pattern> fill, not placed individually.
 * Re-cut 2026-08-14 (grass/sand/cobble/wood) from `tileset-catalog/tortuga_focus_v1.png`'s own
 * Terrain & Tiles panel — the original cuts (still used for `dirt` below, and for `water`) were
 * arbitrary crops that happened to straddle a tile boundary in the source sheet, so they carried a
 * sliver of the *next* tile's color/border baked into one edge. That's invisible as a single 64x64
 * icon but turns into an obvious repeating seam once tiled via an SVG <Pattern> — see the
 * MapScreen.tsx street-rendering comment for the visible symptom this caused. Re-cut from a clean,
 * fully-interior region of each tile cell instead (verified by tiling each candidate crop 4x4/5x5
 * before committing) — see GAME_DESIGN.md for the exact before/after. `dirt` is new, cut from
 * `master_catalog_v1.png`'s matching panel (soil/path texture, not present in the Tortuga-focused
 * sheet) using the same interior-crop, tile-verified method. */
export const GROUND_TILES = {
  grass: require('../../assets/sprites/tiles/grass.png'),
  sand: require('../../assets/sprites/tiles/sand.png'),
  dirt: require('../../assets/sprites/tiles/dirt.png'),
  cobble: require('../../assets/sprites/tiles/cobble.png'),
  wood: require('../../assets/sprites/tiles/wood.png'),
  water: require('../../assets/sprites/tiles/water.png'),
};

/** Building icon art, keyed by the same name used in src/data/buildings.ts's `spriteId` field.
 * Not every Tortuga building has a real sprite yet — buildings.ts only sets `spriteId` where a
 * genuine match exists; everything else keeps rendering its emoji as before. */
export const BUILDING_SPRITES = {
  inn: require('../../assets/sprites/buildings/inn.png'),
  tavern: require('../../assets/sprites/buildings/tavern.png'),
  trading_co: require('../../assets/sprites/buildings/trading_co.png'),
  weapons: require('../../assets/sprites/buildings/weapons.png'),
  smugglers_den: require('../../assets/sprites/buildings/smugglers_den.png'),
  dock_office: require('../../assets/sprites/buildings/dock_office.png'),
  shipyard: require('../../assets/sprites/buildings/shipyard.png'),
  blacksmith: require('../../assets/sprites/buildings/blacksmith.png'),
  tailor: require('../../assets/sprites/buildings/tailor.png'),
  spice_merchant: require('../../assets/sprites/buildings/spice_merchant.png'),
  market: require('../../assets/sprites/buildings/market.png'),
  fishmonger: require('../../assets/sprites/buildings/fishmonger.png'),
  // "Whole-island art pass" (2026-08-13) — cut from master_catalog_v1.png's "Buildings – Special"
  // row (jail/fort/2 towers/lighthouse) and tortuga_focus_v1.png (chapel, re-cropped separately
  // from the lighthouse this time). See ART_BRIEF.md Part A — these were already drawn and unused.
  jail: require('../../assets/sprites/buildings/jail.png'),
  fort: require('../../assets/sprites/buildings/fort.png'),
  tower_stone: require('../../assets/sprites/buildings/tower_stone.png'),
  tower_wood: require('../../assets/sprites/buildings/tower_wood.png'),
  lighthouse: require('../../assets/sprites/buildings/lighthouse.png'),
  chapel: require('../../assets/sprites/buildings/chapel.png'),
};
export type BuildingSpriteId = keyof typeof BUILDING_SPRITES;

/** Ships, the Tortuga gate landmark, and harbor dressing. */
export const WORLD_SPRITES = {
  // The docked Black Pearl marker — was the old detailed galleon render, now the "DOCKED IDLE"
  // frame cut from the same sheet as the sailing/turn sprites in shipSprites.ts, so the ship reads
  // as one consistent piece of art whether she's parked at the jetty or under sail.
  blackShip: require('../../assets/sprites/ship/ship_docked.png'),
  tanShip: require('../../assets/sprites/world/tan_ship.png'),
  rowboat: require('../../assets/sprites/world/rowboat.png'),
  dockPier: require('../../assets/sprites/world/dock_pier.png'),
  // A single repeatable pier/jetty module — 4 corner posts + a woven-plank deck, cut from
  // master_catalog_v1.png's "Docks & Harbour" panel, which draws this exact module stacked
  // several times in a column (confirming it's meant to tile, unlike dock_pier above). Unlike
  // every other GROUND_TILES/WORLD_SPRITES cutout in this project, this crop keeps its real alpha
  // channel instead of getting flattened to RGB — the source sheet turned out to already have each
  // item individually cut with transparency, so the posts/deck sit on nothing, letting the sea
  // color underneath show through the gaps once tiled vertically along a pier's SVG stroke. See
  // MapScreen.tsx's PIERS render for how it's used.
  pierModule: require('../../assets/sprites/world/pier_module.png'),
  tortugaGate: require('../../assets/sprites/world/tortuga_gate.png'),
  flagSkullBlack: require('../../assets/sprites/world/flag_skull_black.png'),
  flagUk: require('../../assets/sprites/world/flag_uk.png'),
};

/** Real house art (2026-08-13 art pass) — 8 designs cut from master_catalog_v1.png's
 * "Buildings – Residential" row, replacing the 3-emoji rotation MapScreen used to draw every
 * house with. Purely decorative like HOUSES itself — no per-house identity. */
export const HOUSE_SPRITES = [
  require('../../assets/sprites/houses/house_1.png'),
  require('../../assets/sprites/houses/house_2.png'),
  require('../../assets/sprites/houses/house_3.png'),
  require('../../assets/sprites/houses/house_4.png'),
  require('../../assets/sprites/houses/house_5.png'),
  require('../../assets/sprites/houses/house_6.png'),
  require('../../assets/sprites/houses/house_7.png'),
  require('../../assets/sprites/houses/house_8.png'),
];

/** Real vegetation/terrain-feature art (2026-08-13 art pass), cut from master_catalog_v1.png's
 * "Vegetation" and "Cliffs, Rocks & Caves" rows. Keyed so scenery.ts entries can opt in per-prop;
 * anything not listed here keeps rendering its emoji as before. */
export const NATURE_SPRITES = {
  tree_palm: require('../../assets/sprites/nature/tree_palm.png'),
  tree_round: require('../../assets/sprites/nature/tree_round.png'),
  tree_tall: require('../../assets/sprites/nature/tree_tall.png'),
  bush_plain: require('../../assets/sprites/nature/bush_plain.png'),
  bush_flower: require('../../assets/sprites/nature/bush_flower.png'),
  rock_spire: require('../../assets/sprites/nature/rock_spire.png'),
  cave_arch: require('../../assets/sprites/nature/cave_arch.png'),
};
export type NatureSpriteId = keyof typeof NATURE_SPRITES;

/** Small decorative set-dressing (2026-08-13 art pass), cut from master_catalog_v1.png's
 * "Street Props" and "Props & Containers" rows — scattered around the town core and docks for
 * visual density, same spirit as SCENERY but its own table since these aren't foliage. */
export const PROP_SPRITES = {
  fountain: require('../../assets/sprites/props/fountain.png'),
  lamppost: require('../../assets/sprites/props/lamppost.png'),
  market_stall: require('../../assets/sprites/props/market_stall.png'),
  bench: require('../../assets/sprites/props/bench.png'),
  barrel: require('../../assets/sprites/props/barrel.png'),
  crate: require('../../assets/sprites/props/crate.png'),
  flag_skull: require('../../assets/sprites/props/flag_skull.png'),
};
export type PropSpriteId = keyof typeof PROP_SPRITES;

/** Terrain & Town Kit master sheet (2026-08-15) — a purpose-generated 1536x1024 catalog of
 * ground/road/water/vegetation/prop tiles, requested via TERRAIN_BRIEF.md. Cutting method:
 * uniform-grid crops worked fine for the large, evenly-spaced ground/road/water panels below, but
 * broke down on the tightly-packed, non-uniformly-spaced small-prop panels (rocks, logs, flowers,
 * mushrooms, vines, weeds, bushes) — a rigid pitch kept misaligning with sprites of varying size.
 * Those panels were instead cut with connected-component detection on the chroma-keyed alpha mask:
 * each sprite becomes its own blob, and its bounding box (not a guessed grid cell) is the crop — the
 * automated equivalent of centering a grid on each sprite, without hand-placing every one. */

/** Flat ground materials + grass variety pack, tileable via SVG <Pattern> like GROUND_TILES. */
export const TERRAIN_TILES = {
  grass1: require('../../assets/sprites/tiles/grass_1.png'),
  grass2: require('../../assets/sprites/tiles/grass_2.png'),
  dirt1: require('../../assets/sprites/tiles/dirt_1.png'),
  dirt2: require('../../assets/sprites/tiles/dirt_2.png'),
  sand1: require('../../assets/sprites/tiles/sand_1.png'),
  sand2: require('../../assets/sprites/tiles/sand_2.png'),
  grassVar1: require('../../assets/sprites/tiles/grass_var_1.png'),
  grassVar2: require('../../assets/sprites/tiles/grass_var_2.png'),
  grassVar3: require('../../assets/sprites/tiles/grass_var_3.png'),
  grassVar4: require('../../assets/sprites/tiles/grass_var_4.png'),
  grassVar5: require('../../assets/sprites/tiles/grass_var_5.png'),
  grassVar6: require('../../assets/sprites/tiles/grass_var_6.png'),
  grassVar7: require('../../assets/sprites/tiles/grass_var_7.png'),
  grassVar8: require('../../assets/sprites/tiles/grass_var_8.png'),
  grassVar9: require('../../assets/sprites/tiles/grass_var_9.png'),
  grassVar10: require('../../assets/sprites/tiles/grass_var_10.png'),
  grassVar11: require('../../assets/sprites/tiles/grass_var_11.png'),
  grassVar12: require('../../assets/sprites/tiles/grass_var_12.png'),
  jungleGround1: require('../../assets/sprites/tiles/jungle_ground_1.png'),
  jungleGround2: require('../../assets/sprites/tiles/jungle_ground_2.png'),
  jungleGround3: require('../../assets/sprites/tiles/jungle_ground_3.png'),
  jungleGround4: require('../../assets/sprites/tiles/jungle_ground_4.png'),
  jungleGround5: require('../../assets/sprites/tiles/jungle_ground_5.png'),
  jungleGround6: require('../../assets/sprites/tiles/jungle_ground_6.png'),
  jungleGround7: require('../../assets/sprites/tiles/jungle_ground_7.png'),
  jungleGround8: require('../../assets/sprites/tiles/jungle_ground_8.png'),
  jungleGround9: require('../../assets/sprites/tiles/jungle_ground_9.png'),
  jungleGround10: require('../../assets/sprites/tiles/jungle_ground_10.png'),
  jungleGround11: require('../../assets/sprites/tiles/jungle_ground_11.png'),
  jungleGround12: require('../../assets/sprites/tiles/jungle_ground_12.png'),
};

/** Road/path autotile sets — each shape has {straight, corner, tjunction, cross}, each an array
 * of 2-3 weathering variants to pick from randomly so a long road doesn't look copy-pasted. */
export const PATH_TILES = {
  dirt: {
    straight: [require('../../assets/sprites/tiles/path_dirt_straight_1.png'), require('../../assets/sprites/tiles/path_dirt_straight_2.png'), require('../../assets/sprites/tiles/path_dirt_straight_3.png')],
    corner: [require('../../assets/sprites/tiles/path_dirt_corner_1.png'), require('../../assets/sprites/tiles/path_dirt_corner_2.png'), require('../../assets/sprites/tiles/path_dirt_corner_3.png')],
    tjunction: [require('../../assets/sprites/tiles/path_dirt_tjunction_1.png'), require('../../assets/sprites/tiles/path_dirt_tjunction_2.png'), require('../../assets/sprites/tiles/path_dirt_tjunction_3.png')],
    cross: [require('../../assets/sprites/tiles/path_dirt_cross_1.png'), require('../../assets/sprites/tiles/path_dirt_cross_2.png'), require('../../assets/sprites/tiles/path_dirt_cross_3.png')],
  },
  grass: {
    straight: [require('../../assets/sprites/tiles/path_grass_straight_1.png'), require('../../assets/sprites/tiles/path_grass_straight_2.png'), require('../../assets/sprites/tiles/path_grass_straight_3.png')],
    corner: [require('../../assets/sprites/tiles/path_grass_corner_1.png'), require('../../assets/sprites/tiles/path_grass_corner_2.png'), require('../../assets/sprites/tiles/path_grass_corner_3.png')],
    tjunction: [require('../../assets/sprites/tiles/path_grass_tjunction_1.png'), require('../../assets/sprites/tiles/path_grass_tjunction_2.png'), require('../../assets/sprites/tiles/path_grass_tjunction_3.png')],
    cross: [require('../../assets/sprites/tiles/path_grass_cross_1.png'), require('../../assets/sprites/tiles/path_grass_cross_2.png'), require('../../assets/sprites/tiles/path_grass_cross_3.png')],
  },
  cobble: {
    straight: [require('../../assets/sprites/tiles/cobble_straight_1.png'), require('../../assets/sprites/tiles/cobble_straight_2.png'), require('../../assets/sprites/tiles/cobble_straight_3.png')],
    corner: [require('../../assets/sprites/tiles/cobble_corner_1.png'), require('../../assets/sprites/tiles/cobble_corner_2.png'), require('../../assets/sprites/tiles/cobble_corner_3.png')],
    tjunction: [require('../../assets/sprites/tiles/cobble_tjunction_1.png'), require('../../assets/sprites/tiles/cobble_tjunction_2.png'), require('../../assets/sprites/tiles/cobble_tjunction_3.png')],
    cross: [require('../../assets/sprites/tiles/cobble_cross_1.png'), require('../../assets/sprites/tiles/cobble_cross_2.png'), require('../../assets/sprites/tiles/cobble_cross_3.png')],
  },
  roadWorn: {
    straight: [require('../../assets/sprites/tiles/road_worn_straight_1.png'), require('../../assets/sprites/tiles/road_worn_straight_2.png')],
    corner: [require('../../assets/sprites/tiles/road_worn_corner_1.png'), require('../../assets/sprites/tiles/road_worn_corner_2.png')],
    tjunction: [require('../../assets/sprites/tiles/road_worn_tjunction_1.png'), require('../../assets/sprites/tiles/road_worn_tjunction_2.png')],
    cross: [require('../../assets/sprites/tiles/road_worn_cross_1.png'), require('../../assets/sprites/tiles/road_worn_cross_2.png')],
  },
};

/** Water, sand & shoreline dressing. */
export const WATER_TILES = {
  seaDeep: require('../../assets/sprites/tiles/sea_deep.png'),
  seaMid: require('../../assets/sprites/tiles/sea_mid.png'),
  seaShallow: require('../../assets/sprites/tiles/sea_shallow.png'),
  seaShoreFoam: require('../../assets/sprites/tiles/sea_shore_foam.png'),
  wave1: require('../../assets/sprites/tiles/wave_1.png'),
  wave2: require('../../assets/sprites/tiles/wave_2.png'),
  wave3: require('../../assets/sprites/tiles/wave_3.png'),
  wave4: require('../../assets/sprites/tiles/wave_4.png'),
  wave5: require('../../assets/sprites/tiles/wave_5.png'),
  sandDry: require('../../assets/sprites/tiles/sand_dry.png'),
  sandWet: require('../../assets/sprites/tiles/sand_wet.png'),
  sandFootprints: require('../../assets/sprites/tiles/sand_footprints.png'),
  sandShells: require('../../assets/sprites/tiles/sand_shells.png'),
  beachStarfish: require('../../assets/sprites/tiles/beach_detail_starfish.png'),
  beachCrossbones: require('../../assets/sprites/tiles/beach_detail_crossbones.png'),
  beachDriftwood: require('../../assets/sprites/tiles/beach_detail_driftwood.png'),
  beachCoral: require('../../assets/sprites/tiles/beach_detail_coral.png'),
};

/** Grass/dirt/road blend edges — for softening a hard material change into a gradient. */
export const TRANSITION_TILES = {
  grassDirtRoad: [
    require('../../assets/sprites/tiles/trans_gdr_1.png'),
    require('../../assets/sprites/tiles/trans_gdr_2.png'),
    require('../../assets/sprites/tiles/trans_gdr_3.png'),
    require('../../assets/sprites/tiles/trans_gdr_4.png'),
    require('../../assets/sprites/tiles/trans_gdr_5.png'),
    require('../../assets/sprites/tiles/trans_gdr_6.png'),
    require('../../assets/sprites/tiles/trans_gdr_7.png'),
    require('../../assets/sprites/tiles/trans_gdr_8.png'),
    require('../../assets/sprites/tiles/trans_gdr_9.png'),
    require('../../assets/sprites/tiles/trans_gdr_10.png'),
    require('../../assets/sprites/tiles/trans_gdr_11.png'),
    require('../../assets/sprites/tiles/trans_gdr_12.png'),
    require('../../assets/sprites/tiles/trans_gdr_13.png'),
    require('../../assets/sprites/tiles/trans_gdr_14.png'),
    require('../../assets/sprites/tiles/trans_gdr_15.png'),
    require('../../assets/sprites/tiles/trans_gdr_16.png'),
    require('../../assets/sprites/tiles/trans_gdr_17.png'),
    require('../../assets/sprites/tiles/trans_gdr_18.png'),
    require('../../assets/sprites/tiles/trans_gdr_19.png'),
    require('../../assets/sprites/tiles/trans_gdr_20.png'),
  ],
  cornerEdge: [
    require('../../assets/sprites/tiles/trans_corner_1.png'),
    require('../../assets/sprites/tiles/trans_corner_2.png'),
    require('../../assets/sprites/tiles/trans_corner_3.png'),
    require('../../assets/sprites/tiles/trans_corner_4.png'),
    require('../../assets/sprites/tiles/trans_corner_5.png'),
    require('../../assets/sprites/tiles/trans_corner_6.png'),
    require('../../assets/sprites/tiles/trans_corner_7.png'),
    require('../../assets/sprites/tiles/trans_corner_8.png'),
    require('../../assets/sprites/tiles/trans_corner_9.png'),
    require('../../assets/sprites/tiles/trans_corner_10.png'),
    require('../../assets/sprites/tiles/trans_corner_11.png'),
    require('../../assets/sprites/tiles/trans_corner_12.png'),
    require('../../assets/sprites/tiles/trans_corner_13.png'),
    require('../../assets/sprites/tiles/trans_corner_14.png'),
    require('../../assets/sprites/tiles/trans_corner_15.png'),
    require('../../assets/sprites/tiles/trans_corner_16.png'),
  ],
};

/** Cliff faces and their grass-capped top edges. */
export const CLIFF_TILES = {
  topEdge: [
    require('../../assets/sprites/tiles/cliff_top_edge_1.png'),
    require('../../assets/sprites/tiles/cliff_top_edge_2.png'),
    require('../../assets/sprites/tiles/cliff_top_edge_3.png'),
    require('../../assets/sprites/tiles/cliff_top_edge_4.png'),
    require('../../assets/sprites/tiles/cliff_top_edge_5.png'),
    require('../../assets/sprites/tiles/cliff_top_edge_6.png'),
  ],
  wall: [
    require('../../assets/sprites/tiles/cliff_wall_1.png'),
    require('../../assets/sprites/tiles/cliff_wall_2.png'),
    require('../../assets/sprites/tiles/cliff_wall_3.png'),
  ],
};

/** Height-change kit — stacked ledges plus dirt/stone/wood stairs and ramps. */
export const ELEVATION_TILES = {
  ledgeTop1: require('../../assets/sprites/tiles/ledge_top_1.png'),
  ledgeTop2: require('../../assets/sprites/tiles/ledge_top_2.png'),
  ledgeMiddle1: require('../../assets/sprites/tiles/ledge_middle_1.png'),
  ledgeMiddle2: require('../../assets/sprites/tiles/ledge_middle_2.png'),
  ledgeBottom1: require('../../assets/sprites/tiles/ledge_bottom_1.png'),
  ledgeBottom2: require('../../assets/sprites/tiles/ledge_bottom_2.png'),
  stairsDirt: require('../../assets/sprites/tiles/stairs_dirt.png'),
  stairsStone: require('../../assets/sprites/tiles/stairs_stone.png'),
  stairsWood: require('../../assets/sprites/tiles/stairs_wood.png'),
  rampUp: require('../../assets/sprites/tiles/ramp_up.png'),
  rampDown: require('../../assets/sprites/tiles/ramp_down.png'),
};

/** One-off ground tiles for specific terrain features (mud pits, puddles, bridge decking). */
export const SPECIAL_GROUND_TILES = {
  mud: require('../../assets/sprites/tiles/mud_1.png'),
  puddle1: require('../../assets/sprites/tiles/puddle_1.png'),
  puddle2: require('../../assets/sprites/tiles/puddle_2.png'),
  bridgeWood: require('../../assets/sprites/tiles/bridge_wood_1.png'),
  bridgeRope1: require('../../assets/sprites/tiles/bridge_rope_1.png'),
  bridgeRope2: require('../../assets/sprites/tiles/bridge_rope_2.png'),
  brokenGround: require('../../assets/sprites/tiles/broken_ground_1.png'),
};

/** Six new tree silhouettes (2 palm, 2 broadleaf, 1 jungle canopy, 1 dead/bare) — a bigger variety
 * pool than NATURE_SPRITES' single tree_palm/tree_round/tree_tall, for denser forest scenery. */
export const TREE_SPRITES = {
  palm1: require('../../assets/sprites/nature/tree_palm_1.png'),
  palm2: require('../../assets/sprites/nature/tree_palm_2.png'),
  broad1: require('../../assets/sprites/nature/tree_broad_1.png'),
  broad2: require('../../assets/sprites/nature/tree_broad_2.png'),
  jungle: require('../../assets/sprites/nature/tree_jungle.png'),
  dead: require('../../assets/sprites/nature/tree_dead.png'),
};

/** Loose rocks and boulder clusters for scattering along cliffs, shorelines and rough ground. */
export const ROCK_SPRITES = {
  small: [
    require('../../assets/sprites/nature/rock_small_1.png'),
    require('../../assets/sprites/nature/rock_small_2.png'),
    require('../../assets/sprites/nature/rock_small_3.png'),
    require('../../assets/sprites/nature/rock_small_4.png'),
    require('../../assets/sprites/nature/rock_small_5.png'),
    require('../../assets/sprites/nature/rock_small_6.png'),
    require('../../assets/sprites/nature/rock_small_7.png'),
    require('../../assets/sprites/nature/rock_small_8.png'),
  ],
  boulder: [
    require('../../assets/sprites/nature/boulder_large_1.png'),
    require('../../assets/sprites/nature/boulder_large_2.png'),
  ],
};

/** Small scatterable vegetation/decor — logs, stumps, flowers, mushrooms, vines, weeds and the
 * full 27-sprite bush/flowering-plant set (row of plain bushes shading into flowering variants). */
export const PLANT_SPRITES = {
  log: [
    require('../../assets/sprites/nature/log_1.png'),
    require('../../assets/sprites/nature/log_2.png'),
    require('../../assets/sprites/nature/log_3.png'),
  ],
  stump: [
    require('../../assets/sprites/nature/stump_1.png'),
    require('../../assets/sprites/nature/stump_2.png'),
  ],
  flowers: [
    require('../../assets/sprites/nature/flowers_1.png'),
    require('../../assets/sprites/nature/flowers_2.png'),
    require('../../assets/sprites/nature/flowers_3.png'),
    require('../../assets/sprites/nature/flowers_4.png'),
  ],
  mushrooms: [
    require('../../assets/sprites/nature/mushrooms_1.png'),
    require('../../assets/sprites/nature/mushrooms_2.png'),
    require('../../assets/sprites/nature/mushrooms_3.png'),
    require('../../assets/sprites/nature/mushrooms_4.png'),
    require('../../assets/sprites/nature/mushrooms_5.png'),
    require('../../assets/sprites/nature/mushrooms_6.png'),
    require('../../assets/sprites/nature/mushrooms_7.png'),
  ],
  vines: [
    require('../../assets/sprites/nature/vines_1.png'),
    require('../../assets/sprites/nature/vines_2.png'),
  ],
  weeds: [
    require('../../assets/sprites/nature/weeds_1.png'),
    require('../../assets/sprites/nature/weeds_2.png'),
    require('../../assets/sprites/nature/weeds_3.png'),
    require('../../assets/sprites/nature/weeds_4.png'),
  ],
  bush: [
    require('../../assets/sprites/nature/bush_plant_1.png'),
    require('../../assets/sprites/nature/bush_plant_2.png'),
    require('../../assets/sprites/nature/bush_plant_3.png'),
    require('../../assets/sprites/nature/bush_plant_4.png'),
    require('../../assets/sprites/nature/bush_plant_5.png'),
    require('../../assets/sprites/nature/bush_plant_6.png'),
    require('../../assets/sprites/nature/bush_plant_7.png'),
    require('../../assets/sprites/nature/bush_plant_8.png'),
    require('../../assets/sprites/nature/bush_plant_9.png'),
    require('../../assets/sprites/nature/bush_plant_10.png'),
    require('../../assets/sprites/nature/bush_plant_11.png'),
    require('../../assets/sprites/nature/bush_plant_12.png'),
    require('../../assets/sprites/nature/bush_plant_13.png'),
    require('../../assets/sprites/nature/bush_plant_14.png'),
    require('../../assets/sprites/nature/bush_plant_15.png'),
    require('../../assets/sprites/nature/bush_plant_16.png'),
    require('../../assets/sprites/nature/bush_plant_17.png'),
    require('../../assets/sprites/nature/bush_plant_18.png'),
    require('../../assets/sprites/nature/bush_plant_19.png'),
    require('../../assets/sprites/nature/bush_plant_20.png'),
    require('../../assets/sprites/nature/bush_plant_21.png'),
    require('../../assets/sprites/nature/bush_plant_22.png'),
    require('../../assets/sprites/nature/bush_plant_23.png'),
    require('../../assets/sprites/nature/bush_plant_24.png'),
    require('../../assets/sprites/nature/bush_plant_25.png'),
    require('../../assets/sprites/nature/bush_plant_26.png'),
    require('../../assets/sprites/nature/bush_plant_27.png'),
  ],
};

/** Additional set-dressing props — supply crates/sacks/barrels, a hay bale, campfire, signpost. */
export const DECOR_PROPS = {
  hay: require('../../assets/sprites/props/hay_1.png'),
  crates: require('../../assets/sprites/props/crates_1.png'),
  barrels1: require('../../assets/sprites/props/barrels_1.png'),
  barrels2: require('../../assets/sprites/props/barrels_2.png'),
  sacks: require('../../assets/sprites/props/sacks_1.png'),
  campfire: require('../../assets/sprites/props/campfire_1.png'),
  signpost1: require('../../assets/sprites/props/signpost_1.png'),
  signpost2: require('../../assets/sprites/props/signpost_2.png'),
};
