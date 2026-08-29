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
  grass: require('../../assets/sprites/tiles/ground/grass.png'),
  sand: require('../../assets/sprites/tiles/ground/sand.png'),
  dirt: require('../../assets/sprites/tiles/ground/dirt.png'),
  cobble: require('../../assets/sprites/tiles/paving/cobble.png'),
  wood: require('../../assets/sprites/tiles/paving/wood.png'),
  water: require('../../assets/sprites/tiles/water/water.png'),
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
  tree_palm: require('../../assets/sprites/nature/trees/tree_palm.png'),
  tree_round: require('../../assets/sprites/nature/trees/tree_round.png'),
  tree_tall: require('../../assets/sprites/nature/trees/tree_tall.png'),
  bush_plain: require('../../assets/sprites/nature/vegetation/bush_plain.png'),
  bush_flower: require('../../assets/sprites/nature/vegetation/bush_flower.png'),
  rock_spire: require('../../assets/sprites/nature/rocks/rock_spire.png'),
  cave_arch: require('../../assets/sprites/nature/rocks/cave_arch.png'),
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

/** One-off `landmarks/` art (2026-08-29 wiring pass) matched by hand against `landmarks.ts`
 * entries that had never gotten past the emoji fallback — the `hero_landmark_*` sheet was cut
 * back on 2026-08-17 (terrain-extras delivery) but never actually wired to anything until now.
 * Matched by content, not by filename order (the hero_landmark_N numbers carry no meaning). */
export const LANDMARK_SPRITES = {
  high_woods_tree: require('../../assets/sprites/landmarks/hero_landmark_11.png'),
  old_landing_ruins: require('../../assets/sprites/landmarks/hero_landmark_12.png'),
  forgotten_graves_skull: require('../../assets/sprites/landmarks/hero_landmark_6.png'),
  wreck_santa_catalina: require('../../assets/sprites/landmarks/shipwreck_debris_1.png'),
  wreck_bonne_esperance: require('../../assets/sprites/landmarks/hero_landmark_5.png'),
  blackwoods_hollow_camp: require('../../assets/sprites/landmarks/castaway_camp_1.png'),
  suzettes_still_fire: require('../../assets/sprites/landmarks/hero_landmark_9.png'),
  republic_square_fountain: require('../../assets/sprites/landmarks/fountain_complete_2.png'),
};
export type LandmarkSpriteId = keyof typeof LANDMARK_SPRITES;

/** Terrain & Town Kit master sheet (2026-08-15, re-cut 2026-08-15) — a purpose-generated
 * 1536x1024 catalog of ground/road/water/vegetation/prop tiles, requested via TERRAIN_BRIEF.md.
 *
 * Cutting method: both a per-panel uniform grid AND a "measure the real tile pitch" version of
 * that grid kept producing misaligned crops - some cells clipped a neighbor, others clipped
 * their own tile short - because this sheet does not actually keep a uniform cell size even
 * within one nominal row (corner/notch shapes, wider cross-junctions, tapered edges all differ).
 * Direct user call after both grid attempts: stop assuming a grid at all - cut out each sprite as
 * it actually is and use them as individual placeable objects. So every category below, including
 * what would traditionally be an "autotile set", is a flat pool of individually-detected sprites
 * (connected-component detection on the chroma-keyed alpha, no pitch/count assumption) rather
 * than a strict {straight, corner, tjunction, cross} grid keyed by shape. They're meant to be
 * placed/scattered individually, not tiled edge-to-edge via an SVG <Pattern>. */

/** Flat ground materials + grass variety pack. */
export const TERRAIN_TILES = [
  require('../../assets/sprites/tiles/ground/ground_basic_1.png'),
  require('../../assets/sprites/tiles/ground/ground_basic_2.png'),
  require('../../assets/sprites/tiles/ground/ground_basic_3.png'),
  require('../../assets/sprites/tiles/ground/ground_basic_4.png'),
  require('../../assets/sprites/tiles/ground/ground_basic_5.png'),
  require('../../assets/sprites/tiles/ground/ground_basic_6.png'),
];

export const GRASS_VARIATION_TILES = [
  require('../../assets/sprites/tiles/ground/grass_variations_1.png'),
  require('../../assets/sprites/tiles/ground/grass_variations_2.png'),
  require('../../assets/sprites/tiles/ground/grass_variations_3.png'),
  require('../../assets/sprites/tiles/ground/grass_variations_4.png'),
  require('../../assets/sprites/tiles/ground/grass_variations_5.png'),
  require('../../assets/sprites/tiles/ground/grass_variations_6.png'),
  require('../../assets/sprites/tiles/ground/grass_variations_7.png'),
  require('../../assets/sprites/tiles/ground/grass_variations_8.png'),
  require('../../assets/sprites/tiles/ground/grass_variations_9.png'),
  require('../../assets/sprites/tiles/ground/grass_variations_10.png'),
  require('../../assets/sprites/tiles/ground/grass_variations_11.png'),
  require('../../assets/sprites/tiles/ground/grass_variations_12.png'),
];

/** Dirt path tiles - a mixed pool of straights/corners/junctions, not keyed by shape. Pick
 * randomly per path segment rather than selecting a specific autotile shape. */
export const PATH_DIRT_TILES = [
  require('../../assets/sprites/tiles/paths/path_dirt_1.png'),
  require('../../assets/sprites/tiles/paths/path_dirt_2.png'),
  require('../../assets/sprites/tiles/paths/path_dirt_3.png'),
  require('../../assets/sprites/tiles/paths/path_dirt_4.png'),
  require('../../assets/sprites/tiles/paths/path_dirt_5.png'),
  require('../../assets/sprites/tiles/paths/path_dirt_6.png'),
  require('../../assets/sprites/tiles/paths/path_dirt_7.png'),
  require('../../assets/sprites/tiles/paths/path_dirt_8.png'),
  require('../../assets/sprites/tiles/paths/path_dirt_9.png'),
  require('../../assets/sprites/tiles/paths/path_dirt_10.png'),
  require('../../assets/sprites/tiles/paths/path_dirt_11.png'),
  require('../../assets/sprites/tiles/paths/path_dirt_12.png'),
];

export const PATH_GRASS_BORDER_TILES = [
  require('../../assets/sprites/tiles/paths/path_grass_border_1.png'),
  require('../../assets/sprites/tiles/paths/path_grass_border_2.png'),
  require('../../assets/sprites/tiles/paths/path_grass_border_3.png'),
  require('../../assets/sprites/tiles/paths/path_grass_border_4.png'),
  require('../../assets/sprites/tiles/paths/path_grass_border_5.png'),
  require('../../assets/sprites/tiles/paths/path_grass_border_6.png'),
  require('../../assets/sprites/tiles/paths/path_grass_border_7.png'),
  require('../../assets/sprites/tiles/paths/path_grass_border_8.png'),
  require('../../assets/sprites/tiles/paths/path_grass_border_9.png'),
  require('../../assets/sprites/tiles/paths/path_grass_border_10.png'),
  require('../../assets/sprites/tiles/paths/path_grass_border_11.png'),
  require('../../assets/sprites/tiles/paths/path_grass_border_12.png'),
];

export const COBBLE_TILES = [
  require('../../assets/sprites/tiles/paving/cobble_1.png'),
  require('../../assets/sprites/tiles/paving/cobble_2.png'),
  require('../../assets/sprites/tiles/paving/cobble_3.png'),
  require('../../assets/sprites/tiles/paving/cobble_4.png'),
  require('../../assets/sprites/tiles/paving/cobble_5.png'),
  require('../../assets/sprites/tiles/paving/cobble_6.png'),
  require('../../assets/sprites/tiles/paving/cobble_7.png'),
  require('../../assets/sprites/tiles/paving/cobble_8.png'),
  require('../../assets/sprites/tiles/paving/cobble_9.png'),
  require('../../assets/sprites/tiles/paving/cobble_10.png'),
  require('../../assets/sprites/tiles/paving/cobble_11.png'),
  require('../../assets/sprites/tiles/paving/cobble_12.png'),
];

export const ROAD_WORN_TILES = [
  require('../../assets/sprites/tiles/paving/road_worn_1.png'),
  require('../../assets/sprites/tiles/paving/road_worn_2.png'),
  require('../../assets/sprites/tiles/paving/road_worn_3.png'),
  require('../../assets/sprites/tiles/paving/road_worn_4.png'),
  require('../../assets/sprites/tiles/paving/road_worn_5.png'),
  require('../../assets/sprites/tiles/paving/road_worn_6.png'),
  require('../../assets/sprites/tiles/paving/road_worn_7.png'),
  require('../../assets/sprites/tiles/paving/road_worn_8.png'),
];

export const JUNGLE_GROUND_TILES = [
  require('../../assets/sprites/tiles/ground/jungle_ground_1.png'),
  require('../../assets/sprites/tiles/ground/jungle_ground_2.png'),
  require('../../assets/sprites/tiles/ground/jungle_ground_3.png'),
  require('../../assets/sprites/tiles/ground/jungle_ground_4.png'),
  require('../../assets/sprites/tiles/ground/jungle_ground_5.png'),
  require('../../assets/sprites/tiles/ground/jungle_ground_6.png'),
  require('../../assets/sprites/tiles/ground/jungle_ground_7.png'),
  require('../../assets/sprites/tiles/ground/jungle_ground_8.png'),
  require('../../assets/sprites/tiles/ground/jungle_ground_9.png'),
  require('../../assets/sprites/tiles/ground/jungle_ground_10.png'),
  require('../../assets/sprites/tiles/ground/jungle_ground_11.png'),
  require('../../assets/sprites/tiles/ground/jungle_ground_12.png'),
];

/** Beach & sea dressing - sand textures with detail (footprints/shells) plus open-water shades. */
export const BEACH_TILES = [
  require('../../assets/sprites/tiles/beach/beach_1.png'),
  require('../../assets/sprites/tiles/beach/beach_2.png'),
  require('../../assets/sprites/tiles/beach/beach_3.png'),
  require('../../assets/sprites/tiles/beach/beach_4.png'),
];

export const SEA_TILES = [
  require('../../assets/sprites/tiles/water/sea_1.png'),
  require('../../assets/sprites/tiles/water/sea_2.png'),
  require('../../assets/sprites/tiles/water/sea_3.png'),
  require('../../assets/sprites/tiles/water/sea_4.png'),
];

/** Grass/dirt/road blend edges - for softening a hard material change into a gradient. */
export const TRANSITION_GRASS_DIRT_ROAD_TILES = [
  require('../../assets/sprites/tiles/transitions/trans_grass_dirt_road_1.png'),
  require('../../assets/sprites/tiles/transitions/trans_grass_dirt_road_2.png'),
  require('../../assets/sprites/tiles/transitions/trans_grass_dirt_road_3.png'),
  require('../../assets/sprites/tiles/transitions/trans_grass_dirt_road_4.png'),
  require('../../assets/sprites/tiles/transitions/trans_grass_dirt_road_5.png'),
  require('../../assets/sprites/tiles/transitions/trans_grass_dirt_road_6.png'),
  require('../../assets/sprites/tiles/transitions/trans_grass_dirt_road_7.png'),
  require('../../assets/sprites/tiles/transitions/trans_grass_dirt_road_8.png'),
  require('../../assets/sprites/tiles/transitions/trans_grass_dirt_road_9.png'),
  require('../../assets/sprites/tiles/transitions/trans_grass_dirt_road_10.png'),
  require('../../assets/sprites/tiles/transitions/trans_grass_dirt_road_11.png'),
  require('../../assets/sprites/tiles/transitions/trans_grass_dirt_road_12.png'),
  require('../../assets/sprites/tiles/transitions/trans_grass_dirt_road_13.png'),
  require('../../assets/sprites/tiles/transitions/trans_grass_dirt_road_14.png'),
  require('../../assets/sprites/tiles/transitions/trans_grass_dirt_road_15.png'),
  require('../../assets/sprites/tiles/transitions/trans_grass_dirt_road_16.png'),
  require('../../assets/sprites/tiles/transitions/trans_grass_dirt_road_17.png'),
  require('../../assets/sprites/tiles/transitions/trans_grass_dirt_road_18.png'),
  require('../../assets/sprites/tiles/transitions/trans_grass_dirt_road_19.png'),
  require('../../assets/sprites/tiles/transitions/trans_grass_dirt_road_20.png'),
];

export const TRANSITION_CORNER_TILES = [
  require('../../assets/sprites/tiles/transitions/trans_corner_1.png'),
  require('../../assets/sprites/tiles/transitions/trans_corner_2.png'),
  require('../../assets/sprites/tiles/transitions/trans_corner_3.png'),
  require('../../assets/sprites/tiles/transitions/trans_corner_4.png'),
  require('../../assets/sprites/tiles/transitions/trans_corner_5.png'),
  require('../../assets/sprites/tiles/transitions/trans_corner_6.png'),
  require('../../assets/sprites/tiles/transitions/trans_corner_7.png'),
  require('../../assets/sprites/tiles/transitions/trans_corner_8.png'),
  require('../../assets/sprites/tiles/transitions/trans_corner_9.png'),
  require('../../assets/sprites/tiles/transitions/trans_corner_10.png'),
  require('../../assets/sprites/tiles/transitions/trans_corner_11.png'),
  require('../../assets/sprites/tiles/transitions/trans_corner_12.png'),
  require('../../assets/sprites/tiles/transitions/trans_corner_13.png'),
  require('../../assets/sprites/tiles/transitions/trans_corner_14.png'),
  require('../../assets/sprites/tiles/transitions/trans_corner_15.png'),
  require('../../assets/sprites/tiles/transitions/trans_corner_16.png'),
  require('../../assets/sprites/tiles/transitions/trans_corner_17.png'),
  require('../../assets/sprites/tiles/transitions/trans_corner_18.png'),
  require('../../assets/sprites/tiles/transitions/trans_corner_19.png'),
];

/** Cliff faces and their grass-capped top edges. */
export const CLIFF_TOP_EDGE_TILES = [
  require('../../assets/sprites/tiles/elevation/cliff_top_edge_1.png'),
  require('../../assets/sprites/tiles/elevation/cliff_top_edge_2.png'),
  require('../../assets/sprites/tiles/elevation/cliff_top_edge_3.png'),
  require('../../assets/sprites/tiles/elevation/cliff_top_edge_4.png'),
  require('../../assets/sprites/tiles/elevation/cliff_top_edge_5.png'),
  require('../../assets/sprites/tiles/elevation/cliff_top_edge_6.png'),
  require('../../assets/sprites/tiles/elevation/cliff_top_edge_7.png'),
];

export const CLIFF_WALL_TILES = [
  require('../../assets/sprites/tiles/elevation/cliff_wall_1.png'),
  require('../../assets/sprites/tiles/elevation/cliff_wall_2.png'),
  require('../../assets/sprites/tiles/elevation/cliff_wall_3.png'),
];

/** Height-change kit - stacked ledges plus dirt/stone/wood stairs and ramps. */
export const ELEVATION_LEDGE_TILES = [
  require('../../assets/sprites/tiles/elevation/elevation_ledge_1.png'),
  require('../../assets/sprites/tiles/elevation/elevation_ledge_2.png'),
  require('../../assets/sprites/tiles/elevation/elevation_ledge_3.png'),
  require('../../assets/sprites/tiles/elevation/elevation_ledge_4.png'),
  require('../../assets/sprites/tiles/elevation/elevation_ledge_5.png'),
  require('../../assets/sprites/tiles/elevation/elevation_ledge_6.png'),
];

export const STAIRS_RAMP_TILES = [
  require('../../assets/sprites/tiles/elevation/stairs_ramp_1.png'),
  require('../../assets/sprites/tiles/elevation/stairs_ramp_2.png'),
  require('../../assets/sprites/tiles/elevation/stairs_ramp_3.png'),
  require('../../assets/sprites/tiles/elevation/stairs_ramp_4.png'),
  require('../../assets/sprites/tiles/elevation/stairs_ramp_5.png'),
];

/** One-off ground tiles for specific terrain features (mud pits, puddles, bridge decking). */
export const SPECIAL_GROUND_TILES = {
  mud: require('../../assets/sprites/tiles/ground/mud_1.png'),
  puddle1: require('../../assets/sprites/tiles/ground/puddle_1.png'),
  puddle2: require('../../assets/sprites/tiles/ground/puddle_2.png'),
  bridgeWood: require('../../assets/sprites/tiles/bridges/bridge_wood_1.png'),
  bridgeRope1: require('../../assets/sprites/tiles/bridges/bridge_rope_1.png'),
  bridgeRope2: require('../../assets/sprites/tiles/bridges/bridge_rope_2.png'),
  brokenGround: require('../../assets/sprites/tiles/ground/broken_ground_1.png'),
};

/** Six tree silhouettes (2 palm, 2 broadleaf, 1 jungle canopy, 1 dead/bare) - a bigger variety
 * pool than NATURE_SPRITES' single tree_palm/tree_round/tree_tall, for denser forest scenery. */
export const TREE_SPRITES = [
  require('../../assets/sprites/nature/trees/tree_1.png'),
  require('../../assets/sprites/nature/trees/tree_2.png'),
  require('../../assets/sprites/nature/trees/tree_3.png'),
  require('../../assets/sprites/nature/trees/tree_4.png'),
  require('../../assets/sprites/nature/trees/tree_5.png'),
  require('../../assets/sprites/nature/trees/tree_6.png'),
];

/** Loose rocks and boulder clusters for scattering along cliffs, shorelines and rough ground. */
export const ROCK_SPRITES = {
  small: [
    require('../../assets/sprites/nature/rocks/rock_small_1.png'),
    require('../../assets/sprites/nature/rocks/rock_small_2.png'),
    require('../../assets/sprites/nature/rocks/rock_small_3.png'),
    require('../../assets/sprites/nature/rocks/rock_small_4.png'),
    require('../../assets/sprites/nature/rocks/rock_small_5.png'),
    require('../../assets/sprites/nature/rocks/rock_small_6.png'),
    require('../../assets/sprites/nature/rocks/rock_small_7.png'),
    require('../../assets/sprites/nature/rocks/rock_small_8.png'),
  ],
  boulder: [
    require('../../assets/sprites/nature/rocks/boulder_large_1.png'),
    require('../../assets/sprites/nature/rocks/boulder_large_2.png'),
  ],
};

/** Small scatterable vegetation/decor — logs, stumps, flowers, mushrooms, vines, weeds and the
 * full 27-sprite bush/flowering-plant set (row of plain bushes shading into flowering variants). */
export const PLANT_SPRITES = {
  log: [
    require('../../assets/sprites/nature/vegetation/log_1.png'),
    require('../../assets/sprites/nature/vegetation/log_2.png'),
    require('../../assets/sprites/nature/vegetation/log_3.png'),
  ],
  stump: [
    require('../../assets/sprites/nature/vegetation/stump_1.png'),
    require('../../assets/sprites/nature/vegetation/stump_2.png'),
  ],
  flowers: [
    require('../../assets/sprites/nature/vegetation/flowers_1.png'),
    require('../../assets/sprites/nature/vegetation/flowers_2.png'),
    require('../../assets/sprites/nature/vegetation/flowers_3.png'),
    require('../../assets/sprites/nature/vegetation/flowers_4.png'),
  ],
  mushrooms: [
    require('../../assets/sprites/nature/vegetation/mushrooms_1.png'),
    require('../../assets/sprites/nature/vegetation/mushrooms_2.png'),
    require('../../assets/sprites/nature/vegetation/mushrooms_3.png'),
    require('../../assets/sprites/nature/vegetation/mushrooms_4.png'),
    require('../../assets/sprites/nature/vegetation/mushrooms_5.png'),
    require('../../assets/sprites/nature/vegetation/mushrooms_6.png'),
    require('../../assets/sprites/nature/vegetation/mushrooms_7.png'),
  ],
  vines: [
    require('../../assets/sprites/nature/vegetation/vines_1.png'),
    require('../../assets/sprites/nature/vegetation/vines_2.png'),
  ],
  weeds: [
    require('../../assets/sprites/nature/vegetation/weeds_1.png'),
    require('../../assets/sprites/nature/vegetation/weeds_2.png'),
    require('../../assets/sprites/nature/vegetation/weeds_3.png'),
    require('../../assets/sprites/nature/vegetation/weeds_4.png'),
  ],
  bush: [
    require('../../assets/sprites/nature/vegetation/bush_plant_1.png'),
    require('../../assets/sprites/nature/vegetation/bush_plant_2.png'),
    require('../../assets/sprites/nature/vegetation/bush_plant_3.png'),
    require('../../assets/sprites/nature/vegetation/bush_plant_4.png'),
    require('../../assets/sprites/nature/vegetation/bush_plant_5.png'),
    require('../../assets/sprites/nature/vegetation/bush_plant_6.png'),
    require('../../assets/sprites/nature/vegetation/bush_plant_7.png'),
    require('../../assets/sprites/nature/vegetation/bush_plant_8.png'),
    require('../../assets/sprites/nature/vegetation/bush_plant_9.png'),
    require('../../assets/sprites/nature/vegetation/bush_plant_10.png'),
    require('../../assets/sprites/nature/vegetation/bush_plant_11.png'),
    require('../../assets/sprites/nature/vegetation/bush_plant_12.png'),
    require('../../assets/sprites/nature/vegetation/bush_plant_13.png'),
    require('../../assets/sprites/nature/vegetation/bush_plant_14.png'),
    require('../../assets/sprites/nature/vegetation/bush_plant_15.png'),
    require('../../assets/sprites/nature/vegetation/bush_plant_16.png'),
    require('../../assets/sprites/nature/vegetation/bush_plant_17.png'),
    require('../../assets/sprites/nature/vegetation/bush_plant_18.png'),
    require('../../assets/sprites/nature/vegetation/bush_plant_19.png'),
    require('../../assets/sprites/nature/vegetation/bush_plant_20.png'),
    require('../../assets/sprites/nature/vegetation/bush_plant_21.png'),
    require('../../assets/sprites/nature/vegetation/bush_plant_22.png'),
    require('../../assets/sprites/nature/vegetation/bush_plant_23.png'),
    require('../../assets/sprites/nature/vegetation/bush_plant_24.png'),
    require('../../assets/sprites/nature/vegetation/bush_plant_25.png'),
    require('../../assets/sprites/nature/vegetation/bush_plant_26.png'),
    require('../../assets/sprites/nature/vegetation/bush_plant_27.png'),
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
