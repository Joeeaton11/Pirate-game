/**
 * Tortuga Cove town centre + harbour — the whole layout as data. Harbour is NORTH (top of the
 * map); every building faces SOUTH onto the street below it. Edit a line to move/add/remove
 * anything; swap art in tortugaTownAssets.ts. Coordinates: world units from the island centre,
 * y grows south. Scally is ~8.5 units tall.
 *
 *            ~~~~~ harbour ~~~~~   ships moored along three walkable piers (walk off the end to sail)
 *   [Gun Point]  Long Pier ┬        Customs Pier ┐                 Fish Pier ┐
 *   ═════════════ WHARF (planks): cranes, capstans, bollards, cargo ═══════ FISH QUAY ═════
 *   [offices] gate [harbourmaster] gate [customs][fish hall] gate
 *   ═══════════════════════ Quay Street ═════════════════════════════════
 *   [Brine][grog row]║Pier Alley║[ TAVERN ]║Rum║[bakery][shop][chandlery][boarding]║[kraal][powder]
 *   ── Tar Lane ──────╢  ▲ MARKET SQUARE (raised) ▲  ╟──── Chandlers' Row ─────────
 *   [smithy]║Cutlass║[careening][timber] ▼steps steps▼ [distillery]║Gallows║[menagerie][tannery][sexton]
 *   ── Back Lane ─────────── lower market: gallows, pillory, well, stalls ──────────────
 *   [sail][nets][cooper][rope]║Rope Alley║[bunk][overflow][salt]║Barrel║[warehouse] [CHAPEL HILL]║[grog]
 *   ═══════════════════════ Rope Walk ════════════ Gallows Lane runs on south out of town
 */
import { PIERS } from '../data/harbor';
import { BakedChunk, PlacedProp, Rect, TownLayout } from './townTypes';
import { TORTUGAHARBOUR_BLOCKS, TORTUGAHARBOUR_CHUNKS, TORTUGAHARBOUR_STRIPS } from './ground/tortugaHarbour.generated';

// Ground lines (door thresholds) of each band of buildings.
const WHARF = -312; // north (water) edge of the plank wharf
const QUAY = -212; // waterfront row stands on this; Quay Street runs below it
const SQ = -136; // square row: fronts on the square, Tar Lane and Chandlers' Row
const BACK = -64; // Back Lane row
const ROPE = 14; // Rope Walk row
const W = -130; // west edge of the town
const E = 258; // east edge

// ── Piers: art + rails generated from the walkable pier lines in src/data/harbor.ts ──
const PIER_HALF = 10; // drawn deck half-width (the walkable line is a little wider; rails stop you)
const townPiers = PIERS.filter((p) => p.islandId === 'tortuga_cove' && p.townDrawn);
const pierProps: PlacedProp[] = [];
const pierBlocks: Rect[] = [];
const pierDecks: BakedChunk[] = [];
const DECK_V = require('../../assets/sprites/tortuga_town/style2/edge_pierdeck.png');
const DECK_H = require('../../assets/sprites/tortuga_town/style2/edge_pierdeck_h.png');
const DECK_LEN = PIER_HALF * 2 * 1.8776; // one deck section's length at the pier's width
townPiers.forEach((p) => {
  const vertical = p.from.x === p.to.x;
  if (vertical) {
    const x = p.from.x;
    const lo = Math.min(p.from.y, p.to.y) - PIER_HALF;
    const hi = Math.max(p.from.y, p.to.y);
    // deck sections laid from the shore end outwards (the last one may overhang the tip slightly)
    for (let y = hi; y > lo + 2; y -= DECK_LEN) pierDecks.push({ src: DECK_V, l: x - PIER_HALF, t: y - DECK_LEN, w: PIER_HALF * 2, h: DECK_LEN });
    // rails along both sides, below the head
    pierBlocks.push({ l: x - PIER_HALF - 6, r: x - PIER_HALF + 1, t: lo + PIER_HALF * 2, b: hi });
    pierBlocks.push({ l: x + PIER_HALF - 1, r: x + PIER_HALF + 6, t: lo + PIER_HALF * 2, b: hi });
  } else {
    const y = p.from.y;
    const spurX = p.from.x;
    const lo = Math.min(p.from.x, p.to.x);
    const hi = Math.max(p.from.x, p.to.x);
    const goingLeft = lo < spurX;
    if (goingLeft) for (let x = spurX - PIER_HALF; x > lo - 2; x -= DECK_LEN) pierDecks.push({ src: DECK_H, l: x - DECK_LEN, t: y - PIER_HALF, w: DECK_LEN, h: PIER_HALF * 2 });
    else for (let x = spurX + PIER_HALF; x < hi + 2; x += DECK_LEN) pierDecks.push({ src: DECK_H, l: x, t: y - PIER_HALF, w: DECK_LEN, h: PIER_HALF * 2 });
    if (goingLeft) pierBlocks.push({ l: lo, r: spurX - PIER_HALF + 1, t: y + PIER_HALF - 1, b: y + PIER_HALF + 6 });
    else pierBlocks.push({ l: spurX + PIER_HALF - 1, r: hi, t: y + PIER_HALF - 1, b: y + PIER_HALF + 6 });
  }
});
// Quay edge: solid all along the wharf's water side except where a pier leaves it.
const pierMouths = townPiers.filter((p) => p.from.x === p.to.x).map((p) => p.from.x);
const edge = (x1: number, x2: number, y: number): Rect[] => {
  const out: Rect[] = [];
  let cur = x1;
  pierMouths.filter((m) => m > x1 && m < x2).sort((a, b) => a - b).forEach((m) => {
    out.push({ l: cur, r: m - PIER_HALF, t: y - 6, b: y + 0.5 });
    cur = m + PIER_HALF;
  });
  out.push({ l: cur, r: x2, t: y - 6, b: y + 0.5 });
  return out;
};
// Bollards every few strides along the wharf edge (skipping the pier mouths).
const bollards: PlacedProp[] = [];
const bollardRow = (x1: number, x2: number, y: number) => {
  for (let x = x1; x < x2; x += 16) {
    if (pierMouths.some((m) => Math.abs(m - x) < PIER_HALF + 3)) continue;
    bollards.push({ asset: 'bollard_1', x, y });
  }
};
bollardRow(126, 190, WHARF + 4);
bollardRow(204, E, -368);

export const TORTUGA_TOWN_LAYOUT: TownLayout = {
  islandId: 'tortuga_cove',
  clear: [{ l: W - 22, r: E + 4, t: -345, b: 60 }],

  ground: [
    // base packed earth under the town (south of the inlet on the west side)
    { l: W - 20, r: E, t: -240, b: ROPE + 12, tile: 'earth', size: 18 },
    { l: -92, r: E, t: QUAY - 26, b: -240, tile: 'earth', size: 18 },
    // ── harbour ──
    { l: 120, r: 196, t: WHARF, b: -278, tile: 'planks' }, // plank wharf (west of x 120 is painted: ground/tortugaHarbour.json)
    { l: 196, r: E, t: -372, b: -278, tile: 'planks' }, // fish quay (out to the waterline)
    { l: -92, r: E, t: -278, b: QUAY - 26, tile: 'cobble' }, // stone apron behind the wharf
    // dock gates: lanes from the wharf through the waterfront row to Quay Street
    { l: -20, r: 0, t: QUAY - 26, b: QUAY, tile: 'cobble' },
    { l: 62, r: 90, t: QUAY - 26, b: QUAY, tile: 'cobble' },
    { l: 226, r: 246, t: QUAY - 26, b: QUAY, tile: 'cobble' },
    // ── streets ──
    { l: W - 20, r: E, t: QUAY, b: QUAY + 12, tile: 'cobble', kerb: true }, // Quay Street
    { l: W - 20, r: E, t: ROPE, b: ROPE + 12, tile: 'cobble', kerb: true }, // Rope Walk
    { l: W - 20, r: -6, t: SQ, b: SQ + 11, tile: 'cobble' }, // Tar Lane
    { l: 112, r: E, t: SQ, b: SQ + 11, tile: 'cobble' }, // Chandlers' Row
    { l: -6, r: 112, t: -78, b: BACK + 12, tile: 'cobble' }, // lower market
    // alleys
    { l: -16, r: -6, t: QUAY + 12, b: SQ, tile: 'cobble' }, // Pier Alley
    { l: 64, r: 72, t: QUAY + 12, b: SQ, tile: 'cobble' }, // Rum Alley
    { l: 202, r: 212, t: QUAY + 12, b: SQ, tile: 'cobble' }, // Kraal Alley
    { l: -78, r: -70, t: SQ + 11, b: BACK, tile: 'cobble' }, // Cutlass Cut
    { l: 166, r: 176, t: SQ + 11, b: 56, tile: 'cobble' }, // Gallows Lane (on south out of town)
    { l: -42, r: -34, t: BACK + 12, b: ROPE, tile: 'cobble' }, // Rope Alley
    { l: 28, r: 38, t: BACK + 12, b: ROPE, tile: 'cobble' }, // Barrel Lane
    // gardens
    { l: -30, r: -6, t: SQ + 11, b: BACK - 2, tile: 'grass', size: 16 },
    { l: 178, r: E, t: BACK + 12, b: ROPE - 2, tile: 'grass', size: 16 },
      ],

  terraces: [
    // Market square sits up a level: retaining wall + two flights down to the lower market.
    { l: -6, r: 112, t: SQ, b: -86, height: 8, tile: 'cobble', steps: [14, 92], sides: false },
    // Chapel hill.
    { l: 100, r: 164, t: BACK + 12, b: -6, height: 8, tile: 'grass', size: 16, steps: [132] },
  ],

  buildings: [
    // ── Waterfront (backs to the wharf, fronts on Quay Street) ──
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
    { id: 'tortuga_chapel', asset: 'chapel', x: 132, y: -14, w: 40 },
    { id: null, asset: 'r_grog_row_0', x: 190, y: ROPE },
  ],

  props: [
    ...pierProps,
    ...bollards,

    // ── Ships moored in the harbour (on the water, not solid) ──
    { asset: 'brigantine_w', x: 30, y: -342 },
    { asset: 'pirate_sloop_e', x: -44, y: -352 },
    { asset: 'merchant_schooner_w', x: 152, y: -326 },
    { asset: 'dinghy_e', x: 4, y: -416, z: 20 },
    { asset: 'dinghy_w', x: 60, y: -378 },
    { asset: 'fishing_boat_w', x: 212, y: -400 },
    { asset: 'fishing_boat_e', x: 264, y: -416 },
    { asset: 'dinghy_w', x: 256, y: -466, z: 20 },
    // pier heads: lamps + flags
    { asset: 'dock_lamp_1', x: -44, y: -396 },
    { asset: 'dock_lamp_1', x: 24, y: -396 },
    { asset: 'flag_skull_pirate_1', x: -10, y: -398 },
    { asset: 'dock_lamp_1', x: 118, y: -360 },
    { asset: 'dock_lamp_1', x: 272, y: -448 },
    { asset: 'rope_coil_9', x: -32, y: -388 },
    { asset: 'crate_banded_1', x: 108, y: -350 },
    { asset: 'fish_basket_1', x: 246, y: -438 },

    // ── Gun Point (painted headland; wall + steps from the ground bake) ──
    { asset: 's2_stairs', x: -80, y: -317 },
    { asset: 'watchtower_2', x: -88, y: -338 },
    { asset: 'flag_skull_black', x: -70, y: -344 },
    { asset: 'cannon', x: -76, y: -332, w: 11 },
    { asset: 'telescope_tripod_1', x: -92, y: -330, w: 5 },
    { asset: 's2_palms', x: -94, y: -296 },
    { asset: 's2_palms', x: -104, y: -214, flip: true },

    // ── The wharf (new matched art) ──
    { asset: 's2_crane', x: -40, y: -294 },
    { asset: 's2_crates', x: -28, y: -292, w: 12 },
    { asset: 's2_barrels', x: 16, y: -294, w: 11 },
    { asset: 's2_bollard', x: -30, y: -313, w: 5.5 },
    { asset: 's2_bollard', x: 8, y: -313, w: 5.5 },
    { asset: 's2_bollard', x: 40, y: -313, w: 5.5 },
    { asset: 's2_bollard', x: 100, y: -313, w: 5.5 },
    { asset: 's2_crates', x: 52, y: -292, w: 11, flip: true },
    { asset: 's2_barrels', x: 62, y: -298, w: 9 },
    { asset: 's2_crane', x: 104, y: -294, flip: true },
    { asset: 's2_barrels', x: 116, y: -292, w: 9 },
    { asset: 's2_palms', x: -54, y: -268 },
    { asset: 's2_palms', x: 44, y: -270, flip: true },
    { asset: 's2_crates', x: -2, y: -240, w: 7 },
    { asset: 's2_barrels', x: 86, y: -236, w: 6 },
    { asset: 'dock_lamp_1', x: -20, y: -290 },
    { asset: 'dock_lamp_1', x: 90, y: -290 },
    // the quay apron: market life between the wharf and the waterfront row
    { asset: 'fish_stall', x: -38, y: -272, w: 14 },
    { asset: 'net_rack', x: 28, y: -276, w: 11 },
    { asset: 'market_stall', x: 98, y: -272, w: 14, flip: true },
    { asset: 'cart', x: 62, y: -272, w: 12 },
    { asset: 'sacks', x: -64, y: -276, w: 6 },
    { asset: 'lamp', x: -20, y: -228 },
    { asset: 'lamp', x: 66, y: -228 },
    { asset: 'lamp', x: -20, y: -266 },
    { asset: 'lamp', x: 88, y: -266 },
    { asset: 'cannon', x: -86, y: -284, w: 10, flip: true },
    { asset: 's2_crates', x: -102, y: -246, w: 9 },
    // east of the painted harbour
    { asset: 'market_crate_11', x: 136, y: -280 },
    { asset: 'barrel_spilled_1', x: 150, y: -282 },
    { asset: 'capstan_3', x: 170, y: -288 },
    { asset: 'anchor_2', x: 184, y: -270, w: 8 },
    // fish quay
    { asset: 'fish_rack_1', x: 212, y: -340 },
    { asset: 'fish_rack_2', x: 252, y: -350 },
    { asset: 'barrel_spilled_1', x: 220, y: -356 },
    { asset: 'fish_rack_2', x: 212, y: -298 },
    { asset: 'fishing_net_1', x: 252, y: -300 },
    { asset: 'fish_basket_1', x: 222, y: -286, w: 5 },
    { asset: 'market_barrel_1', x: 252, y: -284 },
    { asset: 'crane_3', x: 254, y: -322, w: 13 },
    { asset: 'fish_stall', x: 214, y: -266, w: 13 },

    // ── Quay Street ──
    { asset: 'dock_lamp_1', x: -60, y: QUAY + 12 },
    { asset: 'dock_lamp_1', x: 52, y: QUAY + 12 },
    { asset: 'dock_lamp_1', x: 160, y: QUAY + 12 },
    { asset: 'notice_board_1', x: 46, y: QUAY - 1, w: 8 },
    { asset: 'signpost_7', x: 4, y: QUAY + 11 },
    { asset: 'market_barrel_5', x: 168, y: QUAY - 1 },
    { asset: 'sacks_9', x: 96, y: QUAY - 1 },
    { asset: 'crates', x: 252, y: QUAY - 1, w: 7 },
    // alleys: clutter against the walls (leaves a walkable gap)
    { asset: 'barrel_1', x: -14, y: QUAY + 20, w: 3.5 },
    { asset: 'sacks_8', x: 70, y: QUAY + 24, w: 3.5 },
    { asset: 'crate_banded_1', x: 210, y: QUAY + 28, w: 3.5 },
    { asset: 'barrel_1', x: -76, y: SQ + 40, w: 3.5 },
    { asset: 'crate_banded_1', x: 174, y: SQ + 30, w: 3.5 },
    { asset: 'clothesline_1', x: -74, y: SQ + 26, w: 10, z: 30 },
    { asset: 'clothesline_1', x: 68, y: QUAY + 40, w: 10, z: 30 },

    // ── Tar Lane / Chandlers' Row ──
    { asset: 'tavern_sign_1', x: -84, y: SQ + 1, w: 7 },
    { asset: 'torch_1', x: -40, y: SQ + 1 },
    { asset: 'market_barrel_8', x: -124, y: SQ + 1 },
    { asset: 'torch_1', x: 152, y: SQ + 1 },
    { asset: 'market_crate_10', x: 112, y: SQ - 1 },

    // ── ▲ Market square (raised) ──
    { asset: 'fountain', x: 53, y: -102, w: 20 },
    { asset: 'market_stall_2', x: 4, y: -114, w: 14 },
    { asset: 'market_stall_3', x: 104, y: -114, w: 14 },
    { asset: 'bunting_1', x: 30, y: -122, w: 26, z: 60 },
    { asset: 'bunting_1', x: 78, y: -122, w: 26, z: 60 },
    { asset: 'bench', x: 36, y: -94, w: 6 },
    { asset: 'bench', x: 70, y: -94, w: 6, flip: true },
    { asset: 'dock_lamp_1', x: 40, y: -120 },
    { asset: 'dock_lamp_1', x: 66, y: -120 },
    { asset: 'plant_bed', x: 24, y: -90, w: 7 },
    { asset: 'plant_bed', x: 82, y: -90, w: 7 },
    { asset: 'palm_1', x: 0, y: -88, w: 14 },
    { asset: 'palm_8', x: 108, y: -88, w: 14, flip: true },
    { asset: 'market_crate_13', x: 14, y: -106 },
    { asset: 'market_barrel_1', x: 94, y: -106 },

    // ── ▼ Lower market (Back Lane) ──
    { asset: 'gallows_1', x: 4, y: -66, w: 11 },
    { asset: 'hanging_cage_1', x: 18, y: -70 },
    { asset: 'well', x: 53, y: -64, w: 10 },
    { asset: 'pillory_1', x: 34, y: -64, w: 6 },
    { asset: 'market_stall_4', x: 78, y: -64, w: 13, flip: true },
    { asset: 'market_tent_1', x: 102, y: -66, w: 12 },
    { asset: 'hay_bale_1', x: 68, y: -55, w: 6 },
    { asset: 'brazier_1', x: 22, y: -54 },

    // ── Back Lane ──
    { asset: 'dock_lamp_1', x: -80, y: BACK + 12 },
    { asset: 'dock_lamp_1', x: 164, y: BACK + 12 },
    { asset: 'wheelbarrow_1', x: -126, y: BACK + 11, w: 8 },
    { asset: 'signpost_8', x: 182, y: BACK + 11 },
    // chapel hill
    { asset: 'dock_lamp_1', x: 112, y: -10 },
    { asset: 'bench', x: 154, y: -12, w: 6 },
    // ── Rope Walk ──
    { asset: 'dock_lamp_1', x: -40, y: ROPE + 12 },
    { asset: 'dock_lamp_1', x: 96, y: ROPE + 12 },
    { asset: 'market_crate_16', x: 42, y: ROPE - 1, w: 5 },
    { asset: 'net_rack', x: -128, y: ROPE + 11, w: 8 },
    { asset: 'cart_1', x: 222, y: ROPE - 2, w: 11 },
    { asset: 'hay_bale_1', x: 240, y: ROPE - 2, w: 6 },
  ],

  strips: [...TORTUGAHARBOUR_STRIPS],

  // Planted yards and gardens: one line per patch (change the seed to reshuffle the plants).
  greenery: [
    // painted harbour: shrubs on the grass patches behind the wharf
    { l: -56, r: -22, t: -260, b: -248, seed: 31, spacing: 7, kinds: ['bush', 'bush', 'plant_bed'], solid: true },
    { l: 18, r: 62, t: -258, b: -246, seed: 32, spacing: 7, kinds: ['bush', 'bush', 's2_palms'] },
    { l: 96, r: 118, t: -260, b: -248, seed: 33, spacing: 7, kinds: ['bush', 'bush'] },
    { l: -112, r: -98, t: -236, b: -214, seed: 34, spacing: 7, kinds: ['bush', 's2_palms'] },
    // back yards behind the square row (between Quay Street and the roofs)
    { l: W - 18, r: -18, t: QUAY + 14, b: SQ - 44, seed: 21, spacing: 8 },
    { l: -4, r: 62, t: QUAY + 14, b: SQ - 46, seed: 22, spacing: 8 },
    { l: 74, r: 200, t: QUAY + 14, b: SQ - 58, seed: 23, spacing: 8 },
    { l: 214, r: E, t: QUAY + 14, b: SQ - 52, seed: 24, spacing: 8 },
    { l: W, r: -6, t: SQ + 13, b: SQ + 26, seed: 1, spacing: 8 },
    { l: -30, r: -8, t: SQ + 26, b: BACK - 3, seed: 2, spacing: 7 },
    { l: 114, r: E, t: SQ + 13, b: SQ + 26, seed: 3, spacing: 8 },
    { l: W, r: -42, t: BACK + 14, b: BACK + 24, seed: 4, spacing: 8 },
    { l: -34, r: 28, t: BACK + 14, b: BACK + 24, seed: 5, spacing: 8 },
    { l: 38, r: 98, t: BACK + 14, b: BACK + 26, seed: 6, spacing: 8 },
    { l: 178, r: E, t: BACK + 14, b: ROPE - 40, seed: 7, spacing: 8 },
    { l: 206, r: E, t: ROPE - 40, b: ROPE - 4, seed: 8, spacing: 8 },
    { l: 102, r: 116, t: BACK + 14, b: -16, seed: 9, spacing: 7 },
    { l: 148, r: 162, t: BACK + 14, b: -20, seed: 10, spacing: 7 },
  ],

  decals: [...TORTUGAHARBOUR_CHUNKS, ...pierDecks],

  blocks: [
    ...pierBlocks,
    ...edge(120, 196, WHARF), // wharf edge east of the painted harbour
    ...TORTUGAHARBOUR_BLOCKS, // painted harbour: shoreline, wharf edge, Gun Point walls
    ...edge(196, E, -372), // fish-quay edge
    { l: 190, r: 196, t: -372, b: WHARF + 1 }, // step in the quay line
  ],

  spawn: { x: 30, y: -108 },
};
