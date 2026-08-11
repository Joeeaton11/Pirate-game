// Captain Scally's on-map sprite art. Sliced from the production sprite sheet the user supplied
// (assets/brand/scally_sprite_sheet_source.png, "Scallywags" style guide) into per-frame
// transparent PNGs under assets/sprites/scally/ — see GAME_DESIGN.md for the art-overhaul note.
//
// Walk cycle: 4 directions x 5 frames, used both for movement (cycled while the player is moving)
// and idle (held at frame 0). The source sheet's separately-sliced idle panel had inconsistent
// framing/scale between directions (a close-up bust for one side, a full body for another), so
// idle intentionally reuses each direction's own neutral standing walk frame rather than shipping
// mismatched art — a real idle-breathing set can replace this later if a cleaner one is cut.

export type FacingDirection = 'down' | 'left' | 'right' | 'up';

export const WALK_FRAME_COUNT = 5;

const WALK_SOURCES: Record<FacingDirection, any[]> = {
  down: [
    require('../../assets/sprites/scally/walk_down_0.png'),
    require('../../assets/sprites/scally/walk_down_1.png'),
    require('../../assets/sprites/scally/walk_down_2.png'),
    require('../../assets/sprites/scally/walk_down_3.png'),
    require('../../assets/sprites/scally/walk_down_4.png'),
  ],
  left: [
    require('../../assets/sprites/scally/walk_left_0.png'),
    require('../../assets/sprites/scally/walk_left_1.png'),
    require('../../assets/sprites/scally/walk_left_2.png'),
    require('../../assets/sprites/scally/walk_left_3.png'),
    require('../../assets/sprites/scally/walk_left_4.png'),
  ],
  right: [
    require('../../assets/sprites/scally/walk_right_0.png'),
    require('../../assets/sprites/scally/walk_right_1.png'),
    require('../../assets/sprites/scally/walk_right_2.png'),
    require('../../assets/sprites/scally/walk_right_3.png'),
    require('../../assets/sprites/scally/walk_right_4.png'),
  ],
  up: [
    require('../../assets/sprites/scally/walk_up_0.png'),
    require('../../assets/sprites/scally/walk_up_1.png'),
    require('../../assets/sprites/scally/walk_up_2.png'),
    require('../../assets/sprites/scally/walk_up_3.png'),
    require('../../assets/sprites/scally/walk_up_4.png'),
  ],
};

/** Bust portrait, cut from the same sheet — not wired into any screen yet. */
export const SCALLY_PORTRAIT = require('../../assets/sprites/scally/portrait.png');

/** Which frame image to show for a given facing direction/movement state. Idle always shows frame
 * 0 (the neutral standing pose); moving cycles through all 5 walk frames. */
export function scallySpriteSource(direction: FacingDirection, moving: boolean, frameIndex: number) {
  const frames = WALK_SOURCES[direction];
  return moving ? frames[frameIndex % frames.length] : frames[0];
}

/** How long to hold a turn frame before settling into the new direction's walk/idle art. */
export const TURN_ANIMATION_MS = 100;

export interface TurnFrame {
  source: any;
  /** Mirror horizontally — used for the one pivot the sheet didn't cut a frame for (see below). */
  mirror: boolean;
}

// The sheet's "Turn Frames (8 directions)" panel is a continuous half-circle sweep: down (S) ->
// down/right (SE) -> right (E) -> up/right (NE) -> up (N) -> up/left (NW) -> left (W). That's a
// mid-pivot pose for 3 of our 4 cardinal-to-cardinal turns directly. The 4th — left <-> down, the
// "SW" quadrant — isn't in the sheet (the sweep only goes one way around), so it reuses the SE
// frame horizontally mirrored: the same left/right flip trick the old emoji token used, and
// Scally's turn pose is symmetric enough that the mirror reads fine.
const TURN_SE: TurnFrame = { source: require('../../assets/sprites/scally/turn_se.png'), mirror: false };
const TURN_NE: TurnFrame = { source: require('../../assets/sprites/scally/turn_ne.png'), mirror: false };
const TURN_NW: TurnFrame = { source: require('../../assets/sprites/scally/turn_nw.png'), mirror: false };
const TURN_SW: TurnFrame = { source: TURN_SE.source, mirror: true };

const TURN_FRAME_BY_PAIR: Partial<Record<string, TurnFrame>> = {
  'down|right': TURN_SE,
  'right|down': TURN_SE,
  'right|up': TURN_NE,
  'up|right': TURN_NE,
  'up|left': TURN_NW,
  'left|up': TURN_NW,
  'left|down': TURN_SW,
  'down|left': TURN_SW,
};

/** A brief mid-pivot pose to show while the player's facing direction changes, so a joystick
 * direction change reads as a turn instead of an instant snap. Returns null for a direct 180
 * (down<->up, left<->right) — the sheet's 8 frames cover one continuous half-turn, not a full
 * loop, so those flips fall back to the old instant-snap behavior. */
export function turnFrameFor(from: FacingDirection, to: FacingDirection): TurnFrame | null {
  if (from === to) return null;
  return TURN_FRAME_BY_PAIR[`${from}|${to}`] ?? null;
}
