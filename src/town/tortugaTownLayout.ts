/**
 * Tortuga Cove town centre — the whole layout as data. Harbour is NORTH (top of the map); every
 * building faces SOUTH onto the street below it. Edit a line to move/add/remove anything; swap
 * art in tortugaTownAssets.ts. Coordinates: world units from the island centre, y grows south.
 *
 *   y -300  ~~~~~~~~~~~~~~~~ harbour ~~~~~~~~~~~~~~~~ (piers at x -10, 78, 236)
 *           [battery]  [offices][ pier ][harbourmaster][ pier ][customs][fish hall][ pier ][kraal]
 *   y -250  ================ Quay Street (cobbles, kerb) ===========================
 *           [garden][Brine Barrel][Tavern] |  MARKET SQUARE  | [bakery][shop][chandlery][boarding]
 *   y -150  ================ Main Street (cobbles, kerb) ===========================
 *           [smithy][careening][timber] lane [distillery][tannery] [menagerie] lane [CHAPEL TERRACE]
 *   y  -66  ---------------- Back Lane (packed earth) ---------- terrace wall + steps --
 *           [sailmaker][net loft][cooper][rope] lane [bunkhouse][overflow][salt] [warehouse] lane [grog row] [park]
 *   y  +14  ================ Rope Walk (cobbles) ====================================
 */
import { TownLayout } from './townTypes';

// Street lines (south-facing ground lines of each row of buildings).
const QUAY = -250; // waterfront row stands on this line, Quay Street runs south of it
const MAIN = -150;
const BACK = -66;
const ROPE = 14;
const W = -150; // west edge of the town
const E = 290; // east edge

export const TORTUGA_TOWN_LAYOUT: TownLayout = {
  islandId: 'tortuga_cove',
  clear: [{ l: W - 2, r: E + 2, t: -312, b: ROPE + 20 }],

  ground: [
    // base packed earth under the whole town (crisper than the painted backdrop at play zoom)
    { l: W, r: E, t: -304, b: ROPE + 16, tile: 'earth', size: 18 },
    // streets
    { l: W, r: E, t: QUAY, b: QUAY + 18, tile: 'cobble', kerb: true },
    { l: 0, r: 142, t: QUAY + 18, b: MAIN, tile: 'cobble' }, // market square
    { l: W, r: E, t: MAIN, b: MAIN + 16, tile: 'cobble', kerb: true },
    { l: W, r: E, t: ROPE, b: ROPE + 16, tile: 'cobble', kerb: true },
    // lanes Main -> Back -> Rope
    { l: -54, r: -38, t: MAIN + 16, b: ROPE, tile: 'cobble' },
    { l: 98, r: 114, t: MAIN + 16, b: ROPE, tile: 'cobble' },
    // pier approaches
    { l: -22, r: 2, t: -300, b: QUAY, tile: 'cobble' },
    { l: 66, r: 90, t: -296, b: QUAY, tile: 'cobble' },
    { l: 226, r: 246, t: -290, b: QUAY, tile: 'cobble' },
    // grass under the gardens / yards (plants are added in `greenery` below)
    { l: W, r: 0, t: QUAY + 20, b: MAIN - 6, tile: 'grass', size: 16 },
    { l: 142, r: E, t: QUAY + 20, b: MAIN - 6, tile: 'grass', size: 16 },
    { l: W, r: -54, t: MAIN + 18, b: BACK - 6, tile: 'grass', size: 16 },
    { l: -38, r: 98, t: MAIN + 18, b: BACK - 6, tile: 'grass', size: 16 },
    { l: W, r: -54, t: BACK + 18, b: ROPE - 6, tile: 'grass', size: 16 },
    { l: -38, r: 98, t: BACK + 18, b: ROPE - 6, tile: 'grass', size: 16 },
    { l: 114, r: E, t: BACK + 18, b: ROPE - 6, tile: 'grass', size: 16 },
    // chapel forecourt on the hill + path from the steps
    { l: 140, r: 206, t: -86, b: BACK - 14, tile: 'cobble' },
  ],

  terraces: [
    // Harbour battery: raised gun platform overlooking the water, steps down to Quay Street.
    { l: W, r: -88, t: -300, b: QUAY - 10, height: 10, tile: 'cobble', steps: [-119] },
    // Chapel hill: grassy rise, retaining wall faces Back Lane, one flight of steps.
    { l: 118, r: E, t: MAIN + 16, b: BACK - 14, height: 10, tile: 'grass', size: 16, steps: [200] },
  ],

  buildings: [
    // ── Waterfront (backs to the water, fronts on Quay Street) ──
    { id: 'tortuga_fishermens_guildhall', asset: 'r_harbour_offices_1', x: -72.7, y: QUAY },
    { id: 'tortuga_quayside_trading_post', asset: 'r_harbour_offices_2', x: -52.7, y: QUAY },
    { id: 'tortuga_ships_provisioner', asset: 'r_harbour_offices_3', x: -33, y: QUAY },
    { id: 'tortuga_harbourmaster', asset: 'b_harbourmaster', x: 33, y: QUAY },
    { id: 'tortuga_customs', asset: 'b_customs', x: 128, y: QUAY, w: 72 },
    { id: 'tortuga_fishmonger', asset: 'b_fishhall', x: 195, y: QUAY },
    { id: 'tortuga_turtle_kraal', asset: 'r_harbour_market_2', x: 257, y: QUAY },
    { id: 'tortuga_powder_and_shot', asset: 'r_harbour_market_3', x: 276.7, y: QUAY },

    // ── Square row (fronts on Main Street) ──
    { id: 'tortuga_brine_barrel', asset: 'b_grogshop', x: -92, y: MAIN },
    { id: 'tortuga_tavern', asset: 'b_tavern', x: -33, y: MAIN },
    { id: 'tortuga_bakery', asset: 'r_square_north_2', x: 151.7, y: MAIN },
    { id: 'tortuga_shop', asset: 'r_square_north_3', x: 171.4, y: MAIN },
    { id: 'tortuga_chandlery', asset: 'b_chandlery', x: 205, y: MAIN },
    { id: 'tortuga_boarding_house', asset: 'b_boarding', x: 250, y: MAIN },

    // ── Back Lane row ──
    { id: 'tortuga_smithy', asset: 'b_smithy', x: -124, y: BACK },
    { id: 'tortuga_careening_shed', asset: 'r_craft_row_1', x: -86.7, y: BACK },
    { id: 'tortuga_timber_yard', asset: 'r_craft_row_2', x: -66.7, y: BACK },
    { id: 'tortuga_distillery', asset: 'b_distillery', x: -10, y: BACK },
    { id: 'tortuga_tannery', asset: 'r_tannery_row_0', x: 29, y: BACK },
    { id: 'tortuga_sextons_house', asset: 'r_tannery_row_3', x: 48.8, y: BACK },
    { id: 'tortuga_menagerie', asset: 'b_menagerie', x: 77, y: BACK, w: 42 },
    // on the chapel terrace
    { id: 'tortuga_chapel', asset: 'chapel', x: 168, y: -86, w: 46 },

    // ── Rope Walk row ──
    { id: 'tortuga_sailmakers_loft', asset: 'r_riggers_row_0', x: -133.3, y: ROPE },
    { id: 'tortuga_net_loft', asset: 'r_riggers_row_1', x: -109.3, y: ROPE },
    { id: 'tortuga_coopers_yard', asset: 'r_riggers_row_2', x: -89.3, y: ROPE },
    { id: 'tortuga_rope_and_tackle', asset: 'r_riggers_row_3', x: -69.5, y: ROPE },
    { id: 'tortuga_dockworkers_bunkhouse', asset: 'r_warehouse_row_1', x: -22.7, y: ROPE },
    { id: 'tortuga_overflow_warehouse', asset: 'r_warehouse_row_2', x: -2.7, y: ROPE },
    { id: 'tortuga_salt_works', asset: 'r_warehouse_row_3', x: 17, y: ROPE },
    { id: 'tortuga_warehouse', asset: 'b_warehouse', x: 64, y: ROPE },
    { id: null, asset: 'r_grog_row_0', x: 130, y: ROPE },
    { id: 'tortuga_cockpit', asset: 'r_grog_row_1', x: 154.2, y: ROPE },
    { id: null, asset: 'r_grog_row_2', x: 174.2, y: ROPE },
    { id: 'tortuga_crews_lodge', asset: 'r_grog_row_3', x: 193.9, y: ROPE },
  ],

  props: [
    // battery guns
    { asset: 'cannon', x: -138, y: -266 },
    { asset: 'cannon', x: -98, y: -266, flip: true },
    { asset: 'cannon', x: -126, y: -286 },
    { asset: 'crates', x: -104, y: -284, w: 9 },
    // waterfront clutter between the piers
    { asset: 'crates', x: 62, y: QUAY - 1, w: 8 },
    { asset: 'net_rack', x: 222, y: QUAY - 2, w: 10 },
    { asset: 'sacks', x: 4, y: QUAY - 1, w: 6 },
    // Quay Street: fish quay stalls + lamps on the kerb
    { asset: 'fish_stall', x: 190, y: QUAY + 17, w: 16 },
    { asset: 'fish_stall', x: 260, y: QUAY + 17, w: 16, flip: true },
    { asset: 'lamp', x: -60, y: QUAY + 18 },
    { asset: 'lamp', x: 52, y: QUAY + 18 },
    { asset: 'lamp', x: 160, y: QUAY + 18 },
    // Market square
    { asset: 'fountain', x: 71, y: -184, w: 22 },
    { asset: 'market_stall', x: 18, y: -212 },
    { asset: 'market_stall', x: 18, y: -186 },
    { asset: 'market_stall', x: 124, y: -212, flip: true },
    { asset: 'market_stall', x: 124, y: -186, flip: true },
    { asset: 'bench', x: 54, y: -168, w: 7 },
    { asset: 'bench', x: 88, y: -168, w: 7, flip: true },
    { asset: 'palm_tall', x: 6, y: MAIN - 1 },
    { asset: 'palm_tall', x: 136, y: MAIN - 1, flip: true },
    { asset: 'well', x: 40, y: -214 },
    { asset: 'cart', x: 104, y: -214, flip: true },
    { asset: 'sacks', x: 30, y: -186, w: 7 },
    { asset: 'plant_bed', x: 5, y: QUAY + 24, w: 9 },
    { asset: 'plant_bed', x: 137, y: QUAY + 24, w: 9 },
    { asset: 'lamp', x: 52, y: -196 },
    { asset: 'lamp', x: 90, y: -196 },
    { asset: 'bush', x: 60, y: -170, w: 6 },
    { asset: 'bush', x: 82, y: -170, w: 6 },
    { asset: 'crates', x: 34, y: -212, w: 7 },
    { asset: 'sacks', x: 112, y: -200, w: 6 },
    // waterfront: cargo stacked by the warehouses
    { asset: 'crates', x: 168, y: QUAY - 1, w: 7 },
    { asset: 'sacks', x: 96, y: QUAY - 1, w: 6 },
    { asset: 'crates', x: -86, y: QUAY - 1, w: 6 },
    { asset: 'net_rack', x: 250, y: QUAY + 14, w: 9 },
    { asset: 'crates', x: 112, y: -186, w: 8 },
    // west garden
    // east end of Main
    { asset: 'plant_bed', x: 282, y: MAIN - 1, w: 11 },
    // chapel terrace
    { asset: 'lamp', x: 140, y: -82 },
    { asset: 'lamp', x: 208, y: -82 },
    { asset: 'bench', x: 196, y: -88, w: 7 },
    // Back Lane
    { asset: 'crates', x: -150 + 4, y: BACK + 2, w: 7 },
    { asset: 'sacks', x: 45, y: BACK - 1, w: 5 },
    // Rope Walk / park
    { asset: 'lamp', x: 90, y: ROPE + 16 },
    { asset: 'lamp', x: -40, y: ROPE + 16 },
    { asset: 'crates', x: 102, y: ROPE - 1, w: 7 },
  ],

  strips: [
    // the chapel hill is only reached by its steps: low fence along its top edge
    { asset: 'fence', x1: 118, x2: E, y: MAIN + 19, height: 4 },
  ],

  // Planted yards behind each row and on the hills. Each line is one patch (rect + seed).
  greenery: [
    { l: W, r: 0, t: QUAY + 22, b: MAIN - 34, seed: 1 },
    { l: W + 2, r: -118, t: MAIN - 34, b: MAIN - 4, seed: 2, spacing: 8 },
    { l: 144, r: E, t: QUAY + 22, b: MAIN - 40, seed: 3 },
    { l: W, r: -56, t: MAIN + 20, b: BACK - 44, seed: 4 },
    { l: -36, r: 96, t: MAIN + 20, b: BACK - 44, seed: 5 },
    { l: W, r: -56, t: BACK + 20, b: ROPE - 44, seed: 6 },
    { l: -36, r: 96, t: BACK + 20, b: ROPE - 44, seed: 7 },
    { l: 116, r: E, t: BACK + 20, b: ROPE - 44, seed: 8 },
    { l: 210, r: E, t: BACK + 20, b: ROPE - 4, seed: 9, spacing: 10 },
    // chapel hill: planted all round the chapel
    { l: 120, r: 142, t: MAIN + 20, b: -90, seed: 10, spacing: 8 },
    { l: 212, r: E - 2, t: MAIN + 20, b: -86, seed: 11, spacing: 9 },
    { l: 142, r: 210, t: MAIN + 20, b: -128, seed: 12, spacing: 8, kinds: ['bush', 'palm_tall'] },
    // battery: a few palms at the back
    { l: W, r: -90, t: -300, b: -292, seed: 13, spacing: 12, kinds: ['palm_tall'] },
  ],

  spawn: { x: 71, y: -162 },
};
