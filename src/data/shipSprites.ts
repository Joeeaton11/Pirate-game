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
  const order: ShipHeading[] = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];
  return order[Math.round(deg / 45) % 8];
}

/** The "Docking" panel's 3-frame APPROACH DOCK loop — shown in place of the normal directional
 * sprite while under sail and closing in on a pier. */
export const SHIP_APPROACH_FRAMES = [
  require('../../assets/sprites/ship/ship_approach_0.png'),
  require('../../assets/sprites/ship/ship_approach_1.png'),
  require('../../assets/sprites/ship/ship_approach_2.png'),
];

/** Held for a beat the moment the player re-boards and the ship pulls off the pier. */
export const SHIP_DEPART_SPRITE = require('../../assets/sprites/ship/ship_depart.png');

/** Parked at a pier, sails furled — the docked marker shown whenever the Black Pearl isn't
 * boarded (see worldSprites.ts's `blackShip`, which now points at this same art). */
export const SHIP_DOCKED_SPRITE = require('../../assets/sprites/ship/ship_docked.png');

export const WAKE_SPRITES = {
  small: require('../../assets/sprites/ship/wake_small.png'),
  medium: require('../../assets/sprites/ship/wake_medium.png'),
};

/** How close (world units) to a pier's line before the approach loop takes over from the normal
 * directional sprite. */
export const SHIP_APPROACH_RADIUS = 130;

/** How long the depart pose holds before falling back to normal directional sailing art. */
export const DEPART_ANIMATION_MS = 550;
