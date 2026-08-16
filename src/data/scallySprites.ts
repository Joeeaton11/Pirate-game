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

// Cut but NOT wired — reverted 2026-08-14, second time. First attempt (2026-08-14, earlier) wired
// this in as a real 3-frame breathing/shifting-weight loop while stationary, on the theory that the
// old "mismatched framing/scale" excuse was stale. The framing was fine; the real problem is the
// joystick: `isMoving` in MapScreen flips on the drag distance crossing DEADZONE, which happens on
// nearly every pointer-move event while dragging near that threshold, not just at genuine
// start/stop. With a real idle pose wired in, each flip swapped Scally between a mid-stride walk
// frame and a feet-together standing frame — a much bigger visual jump than the previous "hold walk
// frame 0" approach, and it read as hopping rather than walking. Reverted `scallySpriteSource` back
// to holding walk-cycle frame 0 while idle (same pose family as walking, so an `isMoving` flicker is
// invisible) until `isMoving` itself gets debounced — only then does swapping in a real idle stance
// become safe.
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

/** Which frame image to show for a given facing direction/movement state. Idle holds walk-cycle
 * frame 0 (see IDLE_SOURCES' doc comment above for why a real idle stance isn't safe to swap in
 * yet); moving cycles through all 5 walk frames. */
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

// --- Lip-sync mouth frames ("Captain Scally: Lip Sync & Talking Animations" reference sheet) ----
// 29 full torso poses (same crossed-arms stance throughout — only the mouth shape changes), cut
// with the same connected-component method as every other sheet (see assets/sprites/README.md's
// "Cutting convention"). Organized exactly as the source sheet's own three sections and keyed by
// viseme name so ConversationBox (or anything else) can pick the frame that matches whichever
// letter is currently being "spoken" — see src/data/visemes.ts for the letter -> viseme lookup
// that drives that. Full narrative in GAME_DESIGN.md.
export const LIP_SYNC_FRAMES = {
  // Vowels
  vowel_a: require('../../assets/sprites/scally/lipsync/vowel_a.png'),
  vowel_e: require('../../assets/sprites/scally/lipsync/vowel_e.png'),
  vowel_i: require('../../assets/sprites/scally/lipsync/vowel_i.png'),
  vowel_o: require('../../assets/sprites/scally/lipsync/vowel_o.png'),
  vowel_u: require('../../assets/sprites/scally/lipsync/vowel_u.png'),
  vowel_oo: require('../../assets/sprites/scally/lipsync/vowel_oo.png'),
  vowel_ee: require('../../assets/sprites/scally/lipsync/vowel_ee.png'),
  vowel_ah: require('../../assets/sprites/scally/lipsync/vowel_ah.png'),
  vowel_ou: require('../../assets/sprites/scally/lipsync/vowel_ou.png'),
  // Consonants
  consonant_bmp: require('../../assets/sprites/scally/lipsync/consonant_bmp.png'),
  consonant_fv: require('../../assets/sprites/scally/lipsync/consonant_fv.png'),
  consonant_th: require('../../assets/sprites/scally/lipsync/consonant_th.png'),
  consonant_l: require('../../assets/sprites/scally/lipsync/consonant_l.png'),
  consonant_w_oo: require('../../assets/sprites/scally/lipsync/consonant_w_oo.png'),
  consonant_r: require('../../assets/sprites/scally/lipsync/consonant_r.png'),
  consonant_sz: require('../../assets/sprites/scally/lipsync/consonant_sz.png'),
  consonant_shchj: require('../../assets/sprites/scally/lipsync/consonant_shchj.png'),
  consonant_dtn: require('../../assets/sprites/scally/lipsync/consonant_dtn.png'),
  consonant_kg: require('../../assets/sprites/scally/lipsync/consonant_kg.png'),
  consonant_hy: require('../../assets/sprites/scally/lipsync/consonant_hy.png'),
  // Blends & other sounds
  blend_br: require('../../assets/sprites/scally/lipsync/blend_br.png'),
  blend_dr: require('../../assets/sprites/scally/lipsync/blend_dr.png'),
  blend_tr: require('../../assets/sprites/scally/lipsync/blend_tr.png'),
  blend_pr: require('../../assets/sprites/scally/lipsync/blend_pr.png'),
  blend_kr: require('../../assets/sprites/scally/lipsync/blend_kr.png'),
  blend_gr: require('../../assets/sprites/scally/lipsync/blend_gr.png'),
  blend_cl: require('../../assets/sprites/scally/lipsync/blend_cl.png'),
  blend_gl: require('../../assets/sprites/scally/lipsync/blend_gl.png'),
  blend_sn: require('../../assets/sprites/scally/lipsync/blend_sn.png'),
} as const;

export type VisemeKey = keyof typeof LIP_SYNC_FRAMES;

/** consonant_bmp is drawn lips-together (the sheet's own closed-mouth frame for B/M/P) — the
 * natural "not talking" pose for this set, and the same pose family as every other frame here so
 * resting between lines doesn't pop to a different scale/crop. */
export const VISEME_REST: VisemeKey = 'consonant_bmp';

// --- Extras: hand-drawn UI icons -------------------------------------------------------------------
export const ICON_EXCLAIM = require('../../assets/sprites/scally/icon_exclaim.png');
export const ICON_QUESTION = require('../../assets/sprites/scally/icon_question.png');
export const ICON_SPEECH = require('../../assets/sprites/scally/icon_speech.png');
export const ICON_MAP = require('../../assets/sprites/scally/icon_map.png');
