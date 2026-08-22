// Captain Scally's ship, the Black Pearl — sliced from the "CAPTAIN'S BOAT – SPRITE SHEET" the
// user supplied into per-frame transparent PNGs under assets/sprites/ship/. This source sheet has
// no real alpha channel (flat RGB against a dark backdrop), so unlike scallySprites.ts's direct
// alpha-channel cut, these frames were pulled with a color-distance (chroma-key) cutout against
// the sheet's background color instead — see GAME_DESIGN.md for the write-up.

/** The sheet's "Quarter Turns (8 directions)" panel — a full 8-way compass sweep, used for the
 * ship while under sail, direction chosen by bucketing the drag-to-sail heading. */
export type ShipHeading = 's' | 'se' | 'e' | 'ne' | 'n' | 'nw' | 'w' | 'sw';

const SHIP_DIRECTION_SOURCES: Record<ShipHeading, any> = {
  s: require('../../assets/sprites/ship/ship_s.png'),
  se: require('../../assets/sprites/ship/ship_se.png'),
  e: require('../../assets/sprites/ship/ship_e.png'),
  ne: require('../../assets/sprites/ship/ship_ne.png'),
  n: require('../../assets/sprites/ship/ship_n.png'),
  nw: require('../../assets/sprites/ship/ship_nw.png'),
  w: require('../../assets/sprites/ship/ship_w.png'),
  sw: require('../../assets/sprites/ship/ship_sw.png'),
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
export const SHIP_DOCKED_SPRITE = require('../../assets/sprites/ship/ship_docked.png');

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
