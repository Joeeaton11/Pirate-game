/**
 * Tortuga Cove town centre — the whole layout as data. Harbour is NORTH (top of the map); every
 * building faces SOUTH onto the street below it. Edit a line to move/add/remove anything; swap
 * art in tortugaTownAssets.ts. Coordinates: world units from the island centre, y grows south.
 *
 *   ~~~~~~~~~~~~~~~~~~~~~~~~~ harbour ~~~~~~~~~~~~~~~~~~~~~~~~~  (piers at x -10, 78, 236)
 *   [battery][offices] pier [harbourmaster] pier [customs][fish hall] pier
 *   ═══════════════════ Quay Street ═══════════════════════════════
 *   [Brine][grog row]║Pier Alley║[ TAVERN ]║Rum║[bakery][shop][chandlery][boarding]║║[kraal][powder]
 *   ── Tar Lane ─────╢   ▲ MARKET SQUARE (raised) ▲   ╟──── Chandlers' Row ────────
 *   [smithy]║Cutlass║[careening][timber]  ▼steps  steps▼  [distillery]║Gallows║[menagerie][tannery][sexton]
 *   ── Back Lane ─────────────  lower market (well, cart)  ────────────────────────
 *   [sail][nets][cooper][rope]║Rope Alley║[bunk][overflow][salt]║Barrel║[warehouse] [CHAPEL HILL] ║ [grog]
 *   ═══════════════════ Rope Walk ═════════════════ Gallows Lane runs on south out of town
 */
import { TownLayout } from './townTypes';

// Ground lines (door thresholds) of each band of buildings.
const QUAY = -250; // waterfront stands on this; Quay Street runs below it
const SQ = -180; // square row: fronts on the square, Tar Lane and Chandlers' Row
const BACK = -108; // Back Lane row
const ROPE = -30; // Rope Walk row
const W = -130; // west edge of the town
const E = 258; // east edge

export const TORTUGA_TOWN_LAYOUT: TownLayout = {
  islandId: 'tortuga_cove',
  clear: [{ l: W - 22, r: E + 4, t: -312, b: 12 }],

  ground: [
    // base packed earth under the whole town
    { l: W - 20, r: E, t: -304, b: ROPE + 12, tile: 'earth', size: 18 },
    // Quay Street and Rope Walk: the two wide cobbled streets
    { l: W - 20, r: E, t: QUAY, b: QUAY + 12, tile: 'cobble', kerb: true },
    { l: W - 20, r: E, t: ROPE, b: ROPE + 12, tile: 'cobble', kerb: true },
    // Tar Lane (west) and Chandlers' Row (east) run off the square
    { l: W - 20, r: -6, t: SQ, b: SQ + 11, tile: 'cobble' },
    { l: 112, r: E, t: SQ, b: SQ + 11, tile: 'cobble' },
    // Back Lane: packed earth with a cobbled lower market under the square
    { l: -6, r: 112, t: -122, b: BACK + 12, tile: 'cobble' },
    // alleys between buildings
    { l: -16, r: -6, t: QUAY + 12, b: SQ, tile: 'cobble' }, // Pier Alley (quay -> square)
    { l: 64, r: 72, t: QUAY + 12, b: SQ, tile: 'cobble' }, // Rum Alley
    { l: 202, r: 212, t: QUAY + 12, b: SQ, tile: 'cobble' }, // Kraal Alley
    { l: -78, r: -70, t: SQ + 11, b: BACK, tile: 'cobble' }, // Cutlass Cut
    { l: 166, r: 176, t: SQ + 11, b: 10, tile: 'cobble' }, // Gallows Lane (on south out of town)
    { l: -42, r: -34, t: BACK + 12, b: ROPE, tile: 'cobble' }, // Rope Alley
    { l: 28, r: 38, t: BACK + 12, b: ROPE, tile: 'cobble' }, // Barrel Lane
    // pier approaches
    { l: -22, r: 2, t: -300, b: QUAY, tile: 'cobble' },
    { l: 66, r: 90, t: -296, b: QUAY, tile: 'cobble' },
    { l: 226, r: 246, t: -290, b: QUAY, tile: 'cobble' },
    // grass under gardens
    { l: -30, r: -6, t: SQ + 11, b: BACK - 2, tile: 'grass', size: 16 },
    { l: 178, r: E, t: BACK + 12, b: ROPE - 2, tile: 'grass', size: 16 },
  ],

  terraces: [
    // Harbour battery: raised gun platform, steps down to Quay Street.
    { l: W, r: -88, t: -300, b: QUAY - 8, height: 8, tile: 'cobble', steps: [-109] },
    // Market square sits up a level: retaining wall + two flights down to the lower market.
    // Tar Lane and Chandlers' Row come in level from the sides, so no side cliffs.
    { l: -6, r: 112, t: SQ, b: -130, height: 8, tile: 'cobble', steps: [14, 92], sides: false },
    // Chapel hill.
    { l: 100, r: 164, t: BACK + 12, b: -50, height: 8, tile: 'grass', size: 16, steps: [132] },
  ],

  buildings: [
    // ── Waterfront (backs to the water, fronts on Quay Street) ──
    { id: 'tortuga_fishermens_guildhall', asset: 'r_harbour_offices_1', x: -72.7, y: QUAY },
    { id: 'tortuga_quayside_trading_post', asset: 'r_harbour_offices_2', x: -52.7, y: QUAY },
    { id: 'tortuga_ships_provisioner', asset: 'r_harbour_offices_3', x: -33, y: QUAY },
    { id: 'tortuga_harbourmaster', asset: 'b_harbourmaster', x: 33, y: QUAY },
    { id: 'tortuga_customs', asset: 'b_customs', x: 128, y: QUAY, w: 72 },
    { id: 'tortuga_fishmonger', asset: 'b_fishhall', x: 195, y: QUAY },

    // ── Square row: Tar Lane / the square / Chandlers' Row ──
    { id: 'tortuga_brine_barrel', asset: 'b_grogshop', x: -106, y: SQ, w: 44 },
    { id: 'tortuga_cockpit', asset: 'r_grog_row_1', x: -68.7, y: SQ - 3 },
    { id: null, asset: 'r_grog_row_2', x: -48.7, y: SQ - 3 },
    { id: 'tortuga_crews_lodge', asset: 'r_grog_row_3', x: -28.7, y: SQ - 3 },
    { id: 'tortuga_tavern', asset: 'b_tavern', x: 29, y: SQ },
    { id: 'tortuga_bakery', asset: 'r_square_north_2', x: 80.7, y: SQ },
    { id: 'tortuga_shop', asset: 'r_square_north_3', x: 100.4, y: SQ },
    { id: 'tortuga_chandlery', asset: 'b_chandlery', x: 133, y: SQ, w: 38 },
    { id: 'tortuga_boarding_house', asset: 'b_boarding', x: 178, y: SQ - 2, w: 42 },
    { id: 'tortuga_turtle_kraal', asset: 'r_harbour_market_2', x: 222.7, y: SQ },
    { id: 'tortuga_powder_and_shot', asset: 'r_harbour_market_3', x: 242.4, y: SQ },

    // ── Back Lane row ──
    { id: 'tortuga_smithy', asset: 'b_smithy', x: -104, y: BACK },
    { id: 'tortuga_careening_shed', asset: 'r_craft_row_1', x: -58.7, y: BACK - 4 },
    { id: 'tortuga_timber_yard', asset: 'r_craft_row_2', x: -38.7, y: BACK - 4 },
    { id: 'tortuga_distillery', asset: 'b_distillery', x: 140, y: BACK, w: 50 },
    { id: 'tortuga_menagerie', asset: 'b_menagerie', x: 197, y: BACK, w: 40 },
    { id: 'tortuga_tannery', asset: 'r_tannery_row_0', x: 230, y: BACK - 3 },
    { id: 'tortuga_sextons_house', asset: 'r_tannery_row_3', x: 249.75, y: BACK - 3 },

    // ── Rope Walk row ──
    { id: 'tortuga_sailmakers_loft', asset: 'r_riggers_row_0', x: -117.3, y: ROPE },
    { id: 'tortuga_net_loft', asset: 'r_riggers_row_1', x: -93.3, y: ROPE },
    { id: 'tortuga_coopers_yard', asset: 'r_riggers_row_2', x: -73.3, y: ROPE },
    { id: 'tortuga_rope_and_tackle', asset: 'r_riggers_row_3', x: -53.5, y: ROPE },
    { id: 'tortuga_dockworkers_bunkhouse', asset: 'r_warehouse_row_1', x: -22.7, y: ROPE - 4 },
    { id: 'tortuga_overflow_warehouse', asset: 'r_warehouse_row_2', x: -2.7, y: ROPE - 4 },
    { id: 'tortuga_salt_works', asset: 'r_warehouse_row_3', x: 17, y: ROPE - 4 },
    { id: 'tortuga_warehouse', asset: 'b_warehouse', x: 68, y: ROPE, w: 56 },
    { id: 'tortuga_chapel', asset: 'chapel', x: 132, y: -58, w: 40 },
    { id: null, asset: 'r_grog_row_0', x: 190, y: ROPE },
  ],

  props: [
    // battery guns
    { asset: 'cannon', x: -122, y: -266 },
    { asset: 'cannon', x: -96, y: -266, flip: true },
    { asset: 'cannon', x: -112, y: -286 },
    { asset: 'crates', x: -124, y: -284, w: 8 },
    // waterfront cargo + nets
    { asset: 'crates', x: 62, y: QUAY - 1, w: 7 },
    { asset: 'sacks', x: 96, y: QUAY - 1, w: 6 },
    { asset: 'crates', x: 168, y: QUAY - 1, w: 7 },
    { asset: 'net_rack', x: 222, y: QUAY - 2, w: 9 },
    { asset: 'crates', x: 252, y: QUAY - 1, w: 7 },
    // Quay Street
    { asset: 'fish_stall', x: 190, y: QUAY + 12, w: 14 },
    { asset: 'lamp', x: -60, y: QUAY + 12 },
    { asset: 'lamp', x: 52, y: QUAY + 12 },
    { asset: 'lamp', x: 160, y: QUAY + 12 },
    // alleys: clutter against the walls (leaves a walkable gap)
    { asset: 'sacks', x: -14, y: -200, w: 4 },
    { asset: 'crates', x: 70, y: -214, w: 4 },
    { asset: 'crates', x: 210, y: -196, w: 4 },
    { asset: 'sacks', x: -76, y: -140, w: 4 },
    { asset: 'crates', x: 174, y: -150, w: 4 },
    // ▲ Market square (raised)
    { asset: 'fountain', x: 53, y: -146, w: 20 },
    { asset: 'market_stall', x: 4, y: -158, w: 15 },
    { asset: 'market_stall', x: 104, y: -158, w: 15, flip: true },
    { asset: 'bench', x: 36, y: -138, w: 6 },
    { asset: 'bench', x: 70, y: -138, w: 6, flip: true },
    { asset: 'lamp', x: 40, y: -164 },
    { asset: 'lamp', x: 66, y: -164 },
    { asset: 'plant_bed', x: 26, y: -136, w: 7 },
    { asset: 'plant_bed', x: 80, y: -136, w: 7 },
    { asset: 'palm_tall', x: 0, y: -132 },
    { asset: 'palm_tall', x: 108, y: -132, flip: true },
    // ▼ lower market (Back Lane)
    { asset: 'well', x: 53, y: -110, w: 11 },
    { asset: 'cart', x: 30, y: -110, w: 11 },
    { asset: 'market_stall', x: 76, y: -110, w: 14, flip: true },
    { asset: 'sacks', x: 2, y: -112, w: 5 },
    { asset: 'crates', x: 106, y: -112, w: 6 },
    // Back Lane
    { asset: 'lamp', x: -80, y: BACK + 12 },
    { asset: 'lamp', x: 164, y: BACK + 12 },
    // chapel hill
    { asset: 'lamp', x: 112, y: -54 },
    { asset: 'bench', x: 154, y: -56, w: 6 },
    // Rope Walk
    { asset: 'lamp', x: -40, y: ROPE + 12 },
    { asset: 'lamp', x: 96, y: ROPE + 12 },
    { asset: 'crates', x: 42, y: ROPE - 1, w: 6 },
    { asset: 'net_rack', x: -128, y: ROPE + 11, w: 8 },
    { asset: 'cart', x: 222, y: ROPE - 2, w: 11 },
  ],

  strips: [],

  // Planted yards and gardens: one line per patch (change the seed to reshuffle the plants).
  greenery: [
    { l: W, r: -6, t: SQ + 13, b: SQ + 26, seed: 1, spacing: 8 }, // behind the Back Lane row, west
    { l: -30, r: -8, t: SQ + 26, b: BACK - 3, seed: 2, spacing: 7 }, // corner garden
    { l: 114, r: E, t: SQ + 13, b: SQ + 26, seed: 3, spacing: 8 },
    { l: W, r: -42, t: BACK + 14, b: BACK + 24, seed: 4, spacing: 8 }, // behind the Rope Walk row
    { l: -34, r: 28, t: BACK + 14, b: BACK + 24, seed: 5, spacing: 8 },
    { l: 38, r: 98, t: BACK + 14, b: BACK + 26, seed: 6, spacing: 8 },
    { l: 178, r: E, t: BACK + 14, b: ROPE - 40, seed: 7, spacing: 8 },
    { l: 206, r: E, t: ROPE - 40, b: ROPE - 4, seed: 8, spacing: 8 },
    { l: 102, r: 116, t: BACK + 14, b: -60, seed: 9, spacing: 7 }, // round the chapel
    { l: 148, r: 162, t: BACK + 14, b: -64, seed: 10, spacing: 7 },
    { l: W, r: -90, t: -300, b: -294, seed: 11, spacing: 12, kinds: ['palm_tall'] }, // battery
    { l: 246, r: E, t: QUAY - 30, b: QUAY - 8, seed: 12, spacing: 8 },
  ],

  spawn: { x: 53, y: -136 },
};
