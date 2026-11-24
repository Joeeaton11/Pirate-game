// Captain Scally's ship, the Black Pearl — sliced from the "CAPTAIN'S BOAT – SPRITE SHEET" the
// user supplied into per-frame transparent PNGs under assets/sprites/ship/. This source sheet has
// no real alpha channel (flat RGB against a dark backdrop), so unlike scallySprites.ts's direct
// alpha-channel cut, these frames were pulled with a color-distance (chroma-key) cutout against
// the sheet's background color instead — see GAME_DESIGN.md for the write-up.

/** The sheet's "Quarter Turns (8 directions)" panel — a full 8-way compass sweep, used for the
 * ship while under sail, direction chosen by bucketing the drag-to-sail heading. */
export type ShipHeading = 's' | 'se' | 'e' | 'ne' | 'n' | 'nw' | 'w' | 'sw';

const SHIP_DIRECTION_SOURCES: Record<ShipHeading, any> = {
  s: require('../../assets/sprites/ship/px6/ship_s.png'),
  se: require('../../assets/sprites/ship/px6/ship_se.png'),
  e: require('../../assets/sprites/ship/px6/ship_e.png'),
  ne: require('../../assets/sprites/ship/px6/ship_ne.png'),
  n: require('../../assets/sprites/ship/px6/ship_n.png'),
  nw: require('../../assets/sprites/ship/px6/ship_nw.png'),
  w: require('../../assets/sprites/ship/px6/ship_w.png'),
  sw: require('../../assets/sprites/ship/px6/ship_sw.png'),
};

/** Compass order, clockwise from north — the single source of truth both `headingFromVector` and
 * `turnDirectionFor` bucket/compare against. */
const HEADING_ORDER: ShipHeading[] = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];

/** Unit vector for each heading, screen space (+x right, +y down) — used to aim the wake behind
 * the ship (opposite the heading) instead of it dragging off to one fixed side. */
export const SHIP_HEADING_VECTOR: Record<ShipHeading, { x: number; y: number }> = {
  n: { x: 0, y: -1 },
  ne: { x: 0.7071, y: -0.7071 },
  e: { x: 1, y: 0 },
  se: { x: 0.7071, y: 0.7071 },
  s: { x: 0, y: 1 },
  sw: { x: -0.7071, y: 0.7071 },
  w: { x: -1, y: 0 },
  nw: { x: -0.7071, y: -0.7071 },
};

export function shipSpriteSource(heading: ShipHeading) {
  return SHIP_DIRECTION_SOURCES[heading];
}

/** Buckets a raw drag vector (same x/y the joystick already produces) into one of the 8 compass
 * headings the sheet was cut for — the sailing equivalent of scallySprites' 4-way facingDir. */
export function headingFromVector(dx: number, dy: number): ShipHeading {
  if (dx === 0 && dy === 0) return 's';
  const angle = Math.atan2(dx, -dy); // 0 = north, sweeping clockwise
  const deg = ((angle * 180) / Math.PI + 360) % 360;
  return HEADING_ORDER[Math.round(deg / 45) % 8];
}

/** The sheet's "Special Animations" panel — a banked mid-turn pose for each rotation direction,
 * shown for a beat whenever the heading changes, same idea as scallySprites' turnFrameFor but for
 * all 8 headings instead of just 4. */
const SHIP_TURN_LEFT = require('../../assets/sprites/ship/ship_turn_left.png');
const SHIP_TURN_RIGHT = require('../../assets/sprites/ship/ship_turn_right.png');

/** Which way the wheel turns going from one heading to the next, by shortest arc around the
 * compass. Returns null for no change or a dead-on 180 (equally short either way — not worth a
 * banked pose for, same call scallySprites makes for its direct opposites). */
export function turnDirectionFor(from: ShipHeading, to: ShipHeading): 'left' | 'right' | null {
  const fromIdx = HEADING_ORDER.indexOf(from);
  const toIdx = HEADING_ORDER.indexOf(to);
  const diff = (toIdx - fromIdx + 8) % 8;
  if (diff === 0 || diff === 4) return null;
  return diff < 4 ? 'right' : 'left';
}

export function turnBankSource(direction: 'left' | 'right') {
  return direction === 'left' ? SHIP_TURN_LEFT : SHIP_TURN_RIGHT;
}

/** How long the banked turn pose holds before falling back to the new heading's normal sprite. */
export const SHIP_TURN_ANIMATION_MS = 180;

/** The "Docking" panel's 3-frame APPROACH DOCK loop — shown in place of the normal directional
 * sprite while under sail and closing in on a pier. */
export const SHIP_APPROACH_FRAMES = [
  require('../../assets/sprites/ship/ship_approach_0.png'),
  require('../../assets/sprites/ship/ship_approach_1.png'),
  require('../../assets/sprites/ship/ship_approach_2.png'),
];

/** Held for a beat the moment the player re-boards, then a second beat of the "Accelerate" pose
 * (open water, no pier under her) before settling into normal directional sailing — two-stage so
 * pulling off the dock reads as leaving the pier, then picking up speed, instead of one flat cut. */
export const SHIP_DEPART_SPRITE = require('../../assets/sprites/ship/ship_depart.png');
export const SHIP_ACCELERATE_SPRITE = require('../../assets/sprites/ship/ship_accelerate.png');
export const DEPART_ANIMATION_MS = 500;
export const ACCELERATE_ANIMATION_MS = 450;

/** The sheet's "Reverse" special animation — cut alongside turn/accelerate/stop-skid but not
 * wired into any screen yet, since there's no backing-away-from-dock maneuver to show it for.
 * Ready if that ever gets a use (e.g. a deliberate "cast off" step before the depart sequence
 * above), same as scallySprites.ts's SCALLY_PORTRAIT sitting cut-but-unused. */
export const SHIP_REVERSE_SPRITE = require('../../assets/sprites/ship/ship_reverse.png');

/** A wide double-wake "sudden stop" pose, flashed for a beat the instant a sea encounter or the
 * pre-capture duel interrupts a sail — reuses the sheet's own "Stop/Skid" special animation
 * instead of the Combat panel's cannon-fire/take-damage frames, whose smoke clouds run together
 * between adjacent poses on the sheet and don't cut cleanly to a single frame. */
export const SHIP_STOP_SKID_SPRITE = require('../../assets/sprites/ship/ship_stop_skid.png');
export const STOP_SKID_ANIMATION_MS = 500;

/** Parked at a pier, sails furled — the docked marker shown whenever the Black Pearl isn't
 * boarded (see worldSprites.ts's `blackShip`, which now points at this same art). */
export const SHIP_DOCKED_SPRITE = require('../../assets/sprites/ship/px6/ship_e.png');

export const WAKE_SPRITES = {
  small: require('../../assets/sprites/ship/wake_small.png'),
  medium: require('../../assets/sprites/ship/wake_medium.png'),
  large: require('../../assets/sprites/ship/wake_large.png'),
};

/** The "Scallywags – Boat Sprite Library" delivery (assets/sprites/ship/boats/, see
 * BOAT_LIBRARY_MANIFEST.md) — 10 boat types × 8 compass directions, cut from a second, unrelated
 * reference sheet. Currently only the 4 types matched to a merchant template below are wired up;
 * the other 6 (dinghy, small_sloop, pirate_sloop, merchant_schooner, heavy_pirate_ship, flagship)
 * and the damaged/wrecked/burning example variants are filed but not yet used anywhere. */
type BoatType =
  | 'fishing_boat'
  | 'large_merchant_ship'
  | 'cutter'
  | 'brigantine';

const BOAT_DIRECTION_SOURCES: Record<BoatType, Record<ShipHeading, any>> = {
  fishing_boat: {
    s: require('../../assets/sprites/ship/boats/fishing_boat_s.png'),
    se: require('../../assets/sprites/ship/boats/fishing_boat_se.png'),
    e: require('../../assets/sprites/ship/boats/fishing_boat_e.png'),
    ne: require('../../assets/sprites/ship/boats/fishing_boat_ne.png'),
    n: require('../../assets/sprites/ship/boats/fishing_boat_n.png'),
    nw: require('../../assets/sprites/ship/boats/fishing_boat_nw.png'),
    w: require('../../assets/sprites/ship/boats/fishing_boat_w.png'),
    sw: require('../../assets/sprites/ship/boats/fishing_boat_sw.png'),
  },
  large_merchant_ship: {
    s: require('../../assets/sprites/ship/boats/large_merchant_ship_s.png'),
    se: require('../../assets/sprites/ship/boats/large_merchant_ship_se.png'),
    e: require('../../assets/sprites/ship/boats/large_merchant_ship_e.png'),
    ne: require('../../assets/sprites/ship/boats/large_merchant_ship_ne.png'),
    n: require('../../assets/sprites/ship/boats/large_merchant_ship_n.png'),
    nw: require('../../assets/sprites/ship/boats/large_merchant_ship_nw.png'),
    w: require('../../assets/sprites/ship/boats/large_merchant_ship_w.png'),
    sw: require('../../assets/sprites/ship/boats/large_merchant_ship_sw.png'),
  },
  cutter: {
    s: require('../../assets/sprites/ship/boats/cutter_s.png'),
    se: require('../../assets/sprites/ship/boats/cutter_se.png'),
    e: require('../../assets/sprites/ship/boats/cutter_e.png'),
    ne: require('../../assets/sprites/ship/boats/cutter_ne.png'),
    n: require('../../assets/sprites/ship/boats/cutter_n.png'),
    nw: require('../../assets/sprites/ship/boats/cutter_nw.png'),
    w: require('../../assets/sprites/ship/boats/cutter_w.png'),
    sw: require('../../assets/sprites/ship/boats/cutter_sw.png'),
  },
  brigantine: {
    s: require('../../assets/sprites/ship/boats/brigantine_s.png'),
    se: require('../../assets/sprites/ship/boats/brigantine_se.png'),
    e: require('../../assets/sprites/ship/boats/brigantine_e.png'),
    ne: require('../../assets/sprites/ship/boats/brigantine_ne.png'),
    n: require('../../assets/sprites/ship/boats/brigantine_n.png'),
    nw: require('../../assets/sprites/ship/boats/brigantine_nw.png'),
    w: require('../../assets/sprites/ship/boats/brigantine_w.png'),
    sw: require('../../assets/sprites/ship/boats/brigantine_sw.png'),
  },
};

/** Which boat art each merchant template (src/data/merchants.ts) sails as, chosen for thematic fit
 * against its cargo: the trawler is literally a fishing boat, the timber galleon is the biggest
 * hull in the set, the rum runner gets the fast Cutter, and the powder hulk gets the sturdy
 * two-master Brigantine. */
const MERCHANT_BOAT_TYPE: Record<string, BoatType> = {
  fishing_trawler: 'fishing_boat',
  timber_galleon: 'large_merchant_ship',
  rum_runner: 'cutter',
  powder_hulk: 'brigantine',
};

/** Source for a merchant template's boat art in a given heading, or null for a merchant template
 * with no boat art wired up (there currently aren't any — every MERCHANT_TEMPLATES entry has a
 * mapping above — but callers should still treat this as possibly-null since the two lists are
 * maintained separately). */
export function merchantShipSpriteSource(templateId: string, heading: ShipHeading) {
  const boatType = MERCHANT_BOAT_TYPE[templateId];
  if (!boatType) return null;
  return BOAT_DIRECTION_SOURCES[boatType][heading];
}

/** Opposite point of the compass, shortest way round — used to make a merchant ship glimpsed at
 * the moment of interception read as crossing the player's path rather than mysteriously facing
 * the same way for no reason. */
export function oppositeHeading(heading: ShipHeading): ShipHeading {
  const idx = HEADING_ORDER.indexOf(heading);
  return HEADING_ORDER[(idx + 4) % 8];
}

/** How close (world units) to a pier's line, or to any island's coastline, before the approach
 * loop takes over from the normal directional sprite. */
export const SHIP_APPROACH_RADIUS = 130;

/** A tighter radius, pier-only: once inside it the sail actually comes down (SHIP_DEPART_SPRITE's
 * furled pose takes over from the full-sail approach loop) before the docked marker appears, and
 * symmetrically, boarding only plays the furled-depart-into-accelerate sequence when she's this
 * close to a real pier. Not checked against plain coastline — SHIP_DEPART_SPRITE bakes in a
 * pier's dock posts, which would show up as phantom jetty timbers on a beach landing that has no
 * real pier there. A beach/coastline landing keeps the simpler instant cut instead. */
export const SHIP_FURL_RADIUS = 55;

/** The 3D Black Pearl (2026-11-24): a Tripo model rendered from the world camera at 32 headings and
 * pixelated onto the 6 px/unit grid (tools/art/ship3d_render.html + tools/art/pack_ship3d.py).
 * Index 0 = bow pointing east, then clockwise in 11.25° steps (8 = south, 16 = west, 24 = north).
 * SHIP_3D_SHADOWS are the matching silhouettes flattened onto the sea, thrown away from the sun. */
export const SHIP_3D_FRAMES = [
  require('../../assets/sprites/ship/px6_3d/ship_00.png'),
  require('../../assets/sprites/ship/px6_3d/ship_01.png'),
  require('../../assets/sprites/ship/px6_3d/ship_02.png'),
  require('../../assets/sprites/ship/px6_3d/ship_03.png'),
  require('../../assets/sprites/ship/px6_3d/ship_04.png'),
  require('../../assets/sprites/ship/px6_3d/ship_05.png'),
  require('../../assets/sprites/ship/px6_3d/ship_06.png'),
  require('../../assets/sprites/ship/px6_3d/ship_07.png'),
  require('../../assets/sprites/ship/px6_3d/ship_08.png'),
  require('../../assets/sprites/ship/px6_3d/ship_09.png'),
  require('../../assets/sprites/ship/px6_3d/ship_10.png'),
  require('../../assets/sprites/ship/px6_3d/ship_11.png'),
  require('../../assets/sprites/ship/px6_3d/ship_12.png'),
  require('../../assets/sprites/ship/px6_3d/ship_13.png'),
  require('../../assets/sprites/ship/px6_3d/ship_14.png'),
  require('../../assets/sprites/ship/px6_3d/ship_15.png'),
  require('../../assets/sprites/ship/px6_3d/ship_16.png'),
  require('../../assets/sprites/ship/px6_3d/ship_17.png'),
  require('../../assets/sprites/ship/px6_3d/ship_18.png'),
  require('../../assets/sprites/ship/px6_3d/ship_19.png'),
  require('../../assets/sprites/ship/px6_3d/ship_20.png'),
  require('../../assets/sprites/ship/px6_3d/ship_21.png'),
  require('../../assets/sprites/ship/px6_3d/ship_22.png'),
  require('../../assets/sprites/ship/px6_3d/ship_23.png'),
  require('../../assets/sprites/ship/px6_3d/ship_24.png'),
  require('../../assets/sprites/ship/px6_3d/ship_25.png'),
  require('../../assets/sprites/ship/px6_3d/ship_26.png'),
  require('../../assets/sprites/ship/px6_3d/ship_27.png'),
  require('../../assets/sprites/ship/px6_3d/ship_28.png'),
  require('../../assets/sprites/ship/px6_3d/ship_29.png'),
  require('../../assets/sprites/ship/px6_3d/ship_30.png'),
  require('../../assets/sprites/ship/px6_3d/ship_31.png'),
];
export const SHIP_3D_SHADOWS = [
  require('../../assets/sprites/ship/px6_3d/ship_00_shadow.png'),
  require('../../assets/sprites/ship/px6_3d/ship_01_shadow.png'),
  require('../../assets/sprites/ship/px6_3d/ship_02_shadow.png'),
  require('../../assets/sprites/ship/px6_3d/ship_03_shadow.png'),
  require('../../assets/sprites/ship/px6_3d/ship_04_shadow.png'),
  require('../../assets/sprites/ship/px6_3d/ship_05_shadow.png'),
  require('../../assets/sprites/ship/px6_3d/ship_06_shadow.png'),
  require('../../assets/sprites/ship/px6_3d/ship_07_shadow.png'),
  require('../../assets/sprites/ship/px6_3d/ship_08_shadow.png'),
  require('../../assets/sprites/ship/px6_3d/ship_09_shadow.png'),
  require('../../assets/sprites/ship/px6_3d/ship_10_shadow.png'),
  require('../../assets/sprites/ship/px6_3d/ship_11_shadow.png'),
  require('../../assets/sprites/ship/px6_3d/ship_12_shadow.png'),
  require('../../assets/sprites/ship/px6_3d/ship_13_shadow.png'),
  require('../../assets/sprites/ship/px6_3d/ship_14_shadow.png'),
  require('../../assets/sprites/ship/px6_3d/ship_15_shadow.png'),
  require('../../assets/sprites/ship/px6_3d/ship_16_shadow.png'),
  require('../../assets/sprites/ship/px6_3d/ship_17_shadow.png'),
  require('../../assets/sprites/ship/px6_3d/ship_18_shadow.png'),
  require('../../assets/sprites/ship/px6_3d/ship_19_shadow.png'),
  require('../../assets/sprites/ship/px6_3d/ship_20_shadow.png'),
  require('../../assets/sprites/ship/px6_3d/ship_21_shadow.png'),
  require('../../assets/sprites/ship/px6_3d/ship_22_shadow.png'),
  require('../../assets/sprites/ship/px6_3d/ship_23_shadow.png'),
  require('../../assets/sprites/ship/px6_3d/ship_24_shadow.png'),
  require('../../assets/sprites/ship/px6_3d/ship_25_shadow.png'),
  require('../../assets/sprites/ship/px6_3d/ship_26_shadow.png'),
  require('../../assets/sprites/ship/px6_3d/ship_27_shadow.png'),
  require('../../assets/sprites/ship/px6_3d/ship_28_shadow.png'),
  require('../../assets/sprites/ship/px6_3d/ship_29_shadow.png'),
  require('../../assets/sprites/ship/px6_3d/ship_30_shadow.png'),
  require('../../assets/sprites/ship/px6_3d/ship_31_shadow.png'),
];
export const SHIP_3D_STEPS = SHIP_3D_FRAMES.length;
/** Nearest 3D frame for a heading angle in radians (0 = east, screen y down, so clockwise). */
export function ship3dIndex(angle: number): number {
  const step = (Math.PI * 2) / SHIP_3D_STEPS;
  return ((Math.round(angle / step) % SHIP_3D_STEPS) + SHIP_3D_STEPS) % SHIP_3D_STEPS;
}

/** Other 3D ships, made the same way as the Black Pearl (2026-11-24): a fat merchant fluyt
 * (34 units) and a navy frigate (38 units), 32 views each with water shadows. */
export const MERCHANT_3D_FRAMES = [
  require('../../assets/sprites/ship/merchant3d/ship_00.png'),
  require('../../assets/sprites/ship/merchant3d/ship_01.png'),
  require('../../assets/sprites/ship/merchant3d/ship_02.png'),
  require('../../assets/sprites/ship/merchant3d/ship_03.png'),
  require('../../assets/sprites/ship/merchant3d/ship_04.png'),
  require('../../assets/sprites/ship/merchant3d/ship_05.png'),
  require('../../assets/sprites/ship/merchant3d/ship_06.png'),
  require('../../assets/sprites/ship/merchant3d/ship_07.png'),
  require('../../assets/sprites/ship/merchant3d/ship_08.png'),
  require('../../assets/sprites/ship/merchant3d/ship_09.png'),
  require('../../assets/sprites/ship/merchant3d/ship_10.png'),
  require('../../assets/sprites/ship/merchant3d/ship_11.png'),
  require('../../assets/sprites/ship/merchant3d/ship_12.png'),
  require('../../assets/sprites/ship/merchant3d/ship_13.png'),
  require('../../assets/sprites/ship/merchant3d/ship_14.png'),
  require('../../assets/sprites/ship/merchant3d/ship_15.png'),
  require('../../assets/sprites/ship/merchant3d/ship_16.png'),
  require('../../assets/sprites/ship/merchant3d/ship_17.png'),
  require('../../assets/sprites/ship/merchant3d/ship_18.png'),
  require('../../assets/sprites/ship/merchant3d/ship_19.png'),
  require('../../assets/sprites/ship/merchant3d/ship_20.png'),
  require('../../assets/sprites/ship/merchant3d/ship_21.png'),
  require('../../assets/sprites/ship/merchant3d/ship_22.png'),
  require('../../assets/sprites/ship/merchant3d/ship_23.png'),
  require('../../assets/sprites/ship/merchant3d/ship_24.png'),
  require('../../assets/sprites/ship/merchant3d/ship_25.png'),
  require('../../assets/sprites/ship/merchant3d/ship_26.png'),
  require('../../assets/sprites/ship/merchant3d/ship_27.png'),
  require('../../assets/sprites/ship/merchant3d/ship_28.png'),
  require('../../assets/sprites/ship/merchant3d/ship_29.png'),
  require('../../assets/sprites/ship/merchant3d/ship_30.png'),
  require('../../assets/sprites/ship/merchant3d/ship_31.png'),
];
export const MERCHANT_3D_SHADOWS = [
  require('../../assets/sprites/ship/merchant3d/ship_00_shadow.png'),
  require('../../assets/sprites/ship/merchant3d/ship_01_shadow.png'),
  require('../../assets/sprites/ship/merchant3d/ship_02_shadow.png'),
  require('../../assets/sprites/ship/merchant3d/ship_03_shadow.png'),
  require('../../assets/sprites/ship/merchant3d/ship_04_shadow.png'),
  require('../../assets/sprites/ship/merchant3d/ship_05_shadow.png'),
  require('../../assets/sprites/ship/merchant3d/ship_06_shadow.png'),
  require('../../assets/sprites/ship/merchant3d/ship_07_shadow.png'),
  require('../../assets/sprites/ship/merchant3d/ship_08_shadow.png'),
  require('../../assets/sprites/ship/merchant3d/ship_09_shadow.png'),
  require('../../assets/sprites/ship/merchant3d/ship_10_shadow.png'),
  require('../../assets/sprites/ship/merchant3d/ship_11_shadow.png'),
  require('../../assets/sprites/ship/merchant3d/ship_12_shadow.png'),
  require('../../assets/sprites/ship/merchant3d/ship_13_shadow.png'),
  require('../../assets/sprites/ship/merchant3d/ship_14_shadow.png'),
  require('../../assets/sprites/ship/merchant3d/ship_15_shadow.png'),
  require('../../assets/sprites/ship/merchant3d/ship_16_shadow.png'),
  require('../../assets/sprites/ship/merchant3d/ship_17_shadow.png'),
  require('../../assets/sprites/ship/merchant3d/ship_18_shadow.png'),
  require('../../assets/sprites/ship/merchant3d/ship_19_shadow.png'),
  require('../../assets/sprites/ship/merchant3d/ship_20_shadow.png'),
  require('../../assets/sprites/ship/merchant3d/ship_21_shadow.png'),
  require('../../assets/sprites/ship/merchant3d/ship_22_shadow.png'),
  require('../../assets/sprites/ship/merchant3d/ship_23_shadow.png'),
  require('../../assets/sprites/ship/merchant3d/ship_24_shadow.png'),
  require('../../assets/sprites/ship/merchant3d/ship_25_shadow.png'),
  require('../../assets/sprites/ship/merchant3d/ship_26_shadow.png'),
  require('../../assets/sprites/ship/merchant3d/ship_27_shadow.png'),
  require('../../assets/sprites/ship/merchant3d/ship_28_shadow.png'),
  require('../../assets/sprites/ship/merchant3d/ship_29_shadow.png'),
  require('../../assets/sprites/ship/merchant3d/ship_30_shadow.png'),
  require('../../assets/sprites/ship/merchant3d/ship_31_shadow.png'),
];
export const NAVY_3D_FRAMES = [
  require('../../assets/sprites/ship/navy3d/ship_00.png'),
  require('../../assets/sprites/ship/navy3d/ship_01.png'),
  require('../../assets/sprites/ship/navy3d/ship_02.png'),
  require('../../assets/sprites/ship/navy3d/ship_03.png'),
  require('../../assets/sprites/ship/navy3d/ship_04.png'),
  require('../../assets/sprites/ship/navy3d/ship_05.png'),
  require('../../assets/sprites/ship/navy3d/ship_06.png'),
  require('../../assets/sprites/ship/navy3d/ship_07.png'),
  require('../../assets/sprites/ship/navy3d/ship_08.png'),
  require('../../assets/sprites/ship/navy3d/ship_09.png'),
  require('../../assets/sprites/ship/navy3d/ship_10.png'),
  require('../../assets/sprites/ship/navy3d/ship_11.png'),
  require('../../assets/sprites/ship/navy3d/ship_12.png'),
  require('../../assets/sprites/ship/navy3d/ship_13.png'),
  require('../../assets/sprites/ship/navy3d/ship_14.png'),
  require('../../assets/sprites/ship/navy3d/ship_15.png'),
  require('../../assets/sprites/ship/navy3d/ship_16.png'),
  require('../../assets/sprites/ship/navy3d/ship_17.png'),
  require('../../assets/sprites/ship/navy3d/ship_18.png'),
  require('../../assets/sprites/ship/navy3d/ship_19.png'),
  require('../../assets/sprites/ship/navy3d/ship_20.png'),
  require('../../assets/sprites/ship/navy3d/ship_21.png'),
  require('../../assets/sprites/ship/navy3d/ship_22.png'),
  require('../../assets/sprites/ship/navy3d/ship_23.png'),
  require('../../assets/sprites/ship/navy3d/ship_24.png'),
  require('../../assets/sprites/ship/navy3d/ship_25.png'),
  require('../../assets/sprites/ship/navy3d/ship_26.png'),
  require('../../assets/sprites/ship/navy3d/ship_27.png'),
  require('../../assets/sprites/ship/navy3d/ship_28.png'),
  require('../../assets/sprites/ship/navy3d/ship_29.png'),
  require('../../assets/sprites/ship/navy3d/ship_30.png'),
  require('../../assets/sprites/ship/navy3d/ship_31.png'),
];
export const NAVY_3D_SHADOWS = [
  require('../../assets/sprites/ship/navy3d/ship_00_shadow.png'),
  require('../../assets/sprites/ship/navy3d/ship_01_shadow.png'),
  require('../../assets/sprites/ship/navy3d/ship_02_shadow.png'),
  require('../../assets/sprites/ship/navy3d/ship_03_shadow.png'),
  require('../../assets/sprites/ship/navy3d/ship_04_shadow.png'),
  require('../../assets/sprites/ship/navy3d/ship_05_shadow.png'),
  require('../../assets/sprites/ship/navy3d/ship_06_shadow.png'),
  require('../../assets/sprites/ship/navy3d/ship_07_shadow.png'),
  require('../../assets/sprites/ship/navy3d/ship_08_shadow.png'),
  require('../../assets/sprites/ship/navy3d/ship_09_shadow.png'),
  require('../../assets/sprites/ship/navy3d/ship_10_shadow.png'),
  require('../../assets/sprites/ship/navy3d/ship_11_shadow.png'),
  require('../../assets/sprites/ship/navy3d/ship_12_shadow.png'),
  require('../../assets/sprites/ship/navy3d/ship_13_shadow.png'),
  require('../../assets/sprites/ship/navy3d/ship_14_shadow.png'),
  require('../../assets/sprites/ship/navy3d/ship_15_shadow.png'),
  require('../../assets/sprites/ship/navy3d/ship_16_shadow.png'),
  require('../../assets/sprites/ship/navy3d/ship_17_shadow.png'),
  require('../../assets/sprites/ship/navy3d/ship_18_shadow.png'),
  require('../../assets/sprites/ship/navy3d/ship_19_shadow.png'),
  require('../../assets/sprites/ship/navy3d/ship_20_shadow.png'),
  require('../../assets/sprites/ship/navy3d/ship_21_shadow.png'),
  require('../../assets/sprites/ship/navy3d/ship_22_shadow.png'),
  require('../../assets/sprites/ship/navy3d/ship_23_shadow.png'),
  require('../../assets/sprites/ship/navy3d/ship_24_shadow.png'),
  require('../../assets/sprites/ship/navy3d/ship_25_shadow.png'),
  require('../../assets/sprites/ship/navy3d/ship_26_shadow.png'),
  require('../../assets/sprites/ship/navy3d/ship_27_shadow.png'),
  require('../../assets/sprites/ship/navy3d/ship_28_shadow.png'),
  require('../../assets/sprites/ship/navy3d/ship_29_shadow.png'),
  require('../../assets/sprites/ship/navy3d/ship_30_shadow.png'),
  require('../../assets/sprites/ship/navy3d/ship_31_shadow.png'),
];

/** The Black Pearl under full sail (sails bellied with wind): same 32 headings, used at speed. */
export const SHIP_3D_FULL_FRAMES = [
  require('../../assets/sprites/ship/px6_3d_full/ship_00.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_01.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_02.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_03.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_04.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_05.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_06.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_07.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_08.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_09.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_10.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_11.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_12.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_13.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_14.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_15.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_16.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_17.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_18.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_19.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_20.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_21.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_22.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_23.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_24.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_25.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_26.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_27.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_28.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_29.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_30.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_31.png'),
];
export const SHIP_3D_FULL_SHADOWS = [
  require('../../assets/sprites/ship/px6_3d_full/ship_00_shadow.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_01_shadow.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_02_shadow.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_03_shadow.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_04_shadow.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_05_shadow.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_06_shadow.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_07_shadow.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_08_shadow.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_09_shadow.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_10_shadow.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_11_shadow.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_12_shadow.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_13_shadow.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_14_shadow.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_15_shadow.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_16_shadow.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_17_shadow.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_18_shadow.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_19_shadow.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_20_shadow.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_21_shadow.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_22_shadow.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_23_shadow.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_24_shadow.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_25_shadow.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_26_shadow.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_27_shadow.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_28_shadow.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_29_shadow.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_30_shadow.png'),
  require('../../assets/sprites/ship/px6_3d_full/ship_31_shadow.png'),
];
