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
