// Captain Scally's on-map sprite art. Sliced from the production sprite sheet the user supplied
// (assets/brand/scally_sprite_sheet_source.png, "Scallywags" style guide) into per-frame
// transparent PNGs under assets/sprites/scally/ — see GAME_DESIGN.md for the art-overhaul note.
//
// Walk cycle: 4 directions x 5 frames, cycled while the player is moving.

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

export const IDLE_FRAME_COUNT = 3;

// Re-examined 2026-08-14: these were re-cut alongside the walk/turn frames in the item-75 alpha
// re-cut and are clean, consistently scaled with the walk cycle — the old "mismatched
// framing/scale" call that kept idle frozen on the walk cycle's frame 0 was stale, describing a
// problem from before that re-cut. Wired in for real now: a slow 3-frame breathing/shifting-weight
// loop while stationary, instead of a held pose.
const IDLE_SOURCES: Record<FacingDirection, any[]> = {
  down: [
    require('../../assets/sprites/scally/idle_down_0.png'),
    require('../../assets/sprites/scally/idle_down_1.png'),
    require('../../assets/sprites/scally/idle_down_2.png'),
  ],
  left: [
    require('../../assets/sprites/scally/idle_left_0.png'),
    require('../../assets/sprites/scally/idle_left_1.png'),
    require('../../assets/sprites/scally/idle_left_2.png'),
  ],
  right: [
    require('../../assets/sprites/scally/idle_right_0.png'),
    require('../../assets/sprites/scally/idle_right_1.png'),
    require('../../assets/sprites/scally/idle_right_2.png'),
  ],
  up: [
    require('../../assets/sprites/scally/idle_up_0.png'),
    require('../../assets/sprites/scally/idle_up_1.png'),
    require('../../assets/sprites/scally/idle_up_2.png'),
  ],
};

/** Bust portrait, cut from the same sheet — now wired into the map header (see MapScreen.tsx). */
export const SCALLY_PORTRAIT = require('../../assets/sprites/scally/portrait.png');

/** Which frame image to show for a given facing direction/movement state. `idleFrameIndex` only
 * matters while not moving; `frameIndex` only matters while moving — each cycles its own set
 * independently so switching between them doesn't skip or jump mid-cycle. */
export function scallySpriteSource(
  direction: FacingDirection,
  moving: boolean,
  frameIndex: number,
  idleFrameIndex = 0
) {
  if (moving) {
    const frames = WALK_SOURCES[direction];
    return frames[frameIndex % frames.length];
  }
  const idleFrames = IDLE_SOURCES[direction];
  return idleFrames[idleFrameIndex % idleFrames.length];
}

/** How long to hold a turn frame before settling into the new direction's walk/idle art. */
export const TURN_ANIMATION_MS = 100;

export interface TurnFrame {
  source: any;
  /** Mirror horizontally — used for the one pivot the sheet didn't cut a frame for (see below). */
  mirror: boolean;
}

// The sheet's "Turn Frames (8 directions)" panel is a full circular sweep, all 8 genuine poses:
// down (S) -> down/right (SE) -> up/right-ish (NE) -> up (N) -> up/left-ish (NW) -> down/left (SW)
// -> back to down. Re-cut 2026-08-13 (all 4 are real art now, straight off the source sheet — the
// previous cut only found 3 of the 8 and stood the missing SW in with a horizontal mirror of SE;
// turn_sw.png is a real, distinct frame, not a mirror).
const TURN_SE: TurnFrame = { source: require('../../assets/sprites/scally/turn_se.png'), mirror: false };
const TURN_NE: TurnFrame = { source: require('../../assets/sprites/scally/turn_ne.png'), mirror: false };
const TURN_NW: TurnFrame = { source: require('../../assets/sprites/scally/turn_nw.png'), mirror: false };
const TURN_SW: TurnFrame = { source: require('../../assets/sprites/scally/turn_sw.png'), mirror: false };

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

// --- Emotes ("Animated Idle / Emotes" panel) ---------------------------------------------------
// Two real narrative triggers (see MapScreen.tsx): VICTORY flashes on a quest/Pirate Lord
// completion, WAVE flashes when a building's enter-prompt appears (greeting the door). The other
// four don't have an obvious one-to-one story moment each, so they share a single "prolonged
// idle" pool instead — stand still long enough and Scally cycles through a little flourish rather
// than holding the same breathing loop forever, the same "idle animation after inactivity" trick
// old-school RPGs use to keep a stationary character from reading as frozen.
export const EMOTE_WAVE = require('../../assets/sprites/scally/emote_wave.png');
export const EMOTE_VICTORY = require('../../assets/sprites/scally/emote_victory.png');
export const IDLE_FLOURISH_POOL = [
  require('../../assets/sprites/scally/emote_cheer.png'),
  require('../../assets/sprites/scally/emote_think.png'),
  require('../../assets/sprites/scally/emote_laugh.png'),
  require('../../assets/sprites/scally/emote_sit.png'),
];
export const WAVE_ANIMATION_MS = 900;
export const VICTORY_ANIMATION_MS = 1600;
/** How long standing still before a flourish pose is eligible to interrupt the normal idle loop. */
export const IDLE_FLOURISH_DELAY_MS = 5000;
/** How long a flourish pose holds once picked. */
export const IDLE_FLOURISH_HOLD_MS = 2200;

// --- Faces / Portraits (small expression icons) -------------------------------------------------
// Six mood variants, roughly neutral -> determined -> surprised -> delighted -> laughing -> wink.
// Wired into EncounterScreen's battle header (see that screen) rather than every dialogue box —
// picking a believable expression per NPC/topic across every screen wasn't a call this pass could
// make well, but "neutral by default, pained on a big hit, happy on a win" in one battle-focused
// spot is a real, honest use of the set.
export const SCALLY_FACES = [
  require('../../assets/sprites/scally/face_0.png'),
  require('../../assets/sprites/scally/face_1.png'),
  require('../../assets/sprites/scally/face_2.png'),
  require('../../assets/sprites/scally/face_3.png'),
  require('../../assets/sprites/scally/face_4.png'),
  require('../../assets/sprites/scally/face_5.png'),
];
export const FACE_NEUTRAL = SCALLY_FACES[0];
export const FACE_DETERMINED = SCALLY_FACES[1];
export const FACE_HURT = SCALLY_FACES[2];
export const FACE_HAPPY = SCALLY_FACES[4];
export const FACE_LAUGH = SCALLY_FACES[5];

// --- Run cycle (side view) -----------------------------------------------------------------------
// Cut but NOT wired into MapScreen — reverted 2026-08-14. It briefly replaced the walk cycle once
// heat crossed RUN_HEAT_THRESHOLD, but the swap read as a pop/hop rather than a smooth speed-up
// (the run pose is a bigger stride than the walk cycle's, and the existing walkBounce animation
// exaggerated the jump between the two). Left here, available whenever a real transition between
// the two gets designed (e.g. crossfading rather than a hard swap), same as POSE_POINT/
// POSE_CHEER_FIST below.
export const RUN_FRAME_COUNT = 5;
const RUN_SOURCES = [
  require('../../assets/sprites/scally/run_0.png'),
  require('../../assets/sprites/scally/run_1.png'),
  require('../../assets/sprites/scally/run_2.png'),
  require('../../assets/sprites/scally/run_3.png'),
  require('../../assets/sprites/scally/run_4.png'),
];
export function runSpriteSource(frameIndex: number) {
  return RUN_SOURCES[frameIndex % RUN_SOURCES.length];
}
/** Heat level (0-1) at/above which a moving, side-facing Scally sprints instead of walks. */
export const RUN_HEAT_THRESHOLD = 0.6;

// --- Special / Interact poses ---------------------------------------------------------------------
export const POSE_ATTACK = require('../../assets/sprites/scally/attack.png');
export const POSE_SWORD_READY = require('../../assets/sprites/scally/sword_ready.png');
export const POSE_CHEER_FIST = require('../../assets/sprites/scally/cheer_fist.png');
export const POSE_POINT = require('../../assets/sprites/scally/point.png');
/** How long the attack flash holds right as a forced duel triggers, before the screen cuts to
 * Encounter. */
export const ATTACK_FLASH_MS = 450;

// --- Extras: hand-drawn UI icons -------------------------------------------------------------------
export const ICON_EXCLAIM = require('../../assets/sprites/scally/icon_exclaim.png');
export const ICON_QUESTION = require('../../assets/sprites/scally/icon_question.png');
export const ICON_SPEECH = require('../../assets/sprites/scally/icon_speech.png');
export const ICON_MAP = require('../../assets/sprites/scally/icon_map.png');
