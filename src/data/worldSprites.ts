// Real map art, sliced from the two reference tileset sheets the user supplied
// (assets/brand/tileset-catalog/master_catalog_v1.png — the full 16-category catalog preview, and
// tortuga_focus_v1.png — a Tortuga-specific pass whose building nameplates happen to match several
// of Tortuga Cove's existing shops almost exactly). This is the first slice of the incremental
// per-screen art pass GAME_DESIGN.md tracks: Tortuga Cove only, for now — everywhere else stays on
// the emoji/procedural system until more per-category sheets arrive (see the user's stated plan).
//
// Building/prop art background removal note: unlike Scally's character sheet, these sheets render
// each item over a continuous blurred photo-style background rather than a flat/gradient one — the
// same flood-fill + connected-component cutout used for Scally's sprites kept bleeding into
// neighboring items because there's no clean background/foreground color boundary to key on. Cut a
// soft-edge vignette instead (crop generously, fade a rounded-rect alpha mask to transparent at the
// edges): it sidesteps the segmentation problem entirely and reads as a deliberately-framed icon
// rather than a botched cutout, which is exactly what a small map marker should look like anyway.

/** Ground tile textures — tiled via an SVG <Pattern> fill, not placed individually. */
export const GROUND_TILES = {
  grass: require('../../assets/sprites/tiles/grass.png'),
  sand: require('../../assets/sprites/tiles/sand.png'),
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
};
export type BuildingSpriteId = keyof typeof BUILDING_SPRITES;

/** Ships, the Tortuga gate landmark, and harbor dressing. */
export const WORLD_SPRITES = {
  blackShip: require('../../assets/sprites/world/black_ship.png'),
  tanShip: require('../../assets/sprites/world/tan_ship.png'),
  rowboat: require('../../assets/sprites/world/rowboat.png'),
  dockPier: require('../../assets/sprites/world/dock_pier.png'),
  tortugaGate: require('../../assets/sprites/world/tortuga_gate.png'),
  flagSkullBlack: require('../../assets/sprites/world/flag_skull_black.png'),
  flagSkullRed: require('../../assets/sprites/world/flag_skull_red.png'),
  flagUk: require('../../assets/sprites/world/flag_uk.png'),
};
