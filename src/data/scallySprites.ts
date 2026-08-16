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

// Wired a third time, 2026-08-15 — this time by actually fixing the thing the first two attempts'
// revert notes said was the real blocker instead of retrying the same swap. `isMoving` used to flip
// on every pointer-move update the instant drag distance crossed DEADZONE, with no margin — a slow
// drag or hand tremor hovering right at that line flipped it several times a second. Any real idle
// pose wired on top of that flicker popped Scally between a mid-stride walk frame and a
// feet-together standing frame — a much bigger visual jump than the old "hold walk frame 0"
// approach, and it read as hopping rather than walking. Fixed at the source in MapScreen's pan
// gesture: entering "moving" still fires the instant drag crosses DEADZONE (unchanged — real
// movement itself, driven by `directionRef`, was never the flickery part), but *leaving* moving only
// fires once drag distance drops below a lower `STOP_DEADZONE`, so a value oscillating in the gap
// between the two doesn't toggle animation state at all. With that hysteresis in place, an
// `isMoving` flip is a genuine start/stop, and swapping to a real breathing pose on it stopped
// reading as a hop in testing.
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

/** Which frame image to show for a given facing direction/movement state. Moving cycles through
 * all 5 walk frames (`frameIndex`, from MapScreen's walk-cycle interval); idle cycles the slower
 * 3-frame breathing loop instead (`idleFrameIndex`, from MapScreen's own separate, slower interval —
 * see IDLE_SOURCES' doc comment for why this needed `isMoving` debounced before it was safe to
 * wire in). `idleFrameIndex` defaults to 0 (a plain standing pose) for any caller that doesn't
 * track it. */
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
// Re-wired 2026-08-15 (see the IDLE_SOURCES note above for the isMoving-debounce fix that made
// this safe again). Two real narrative triggers (see MapScreen.tsx): VICTORY flashes on a
// quest/Pirate Lord completion, WAVE flashes when a building's enter-prompt appears (greeting the
// door). Both are gated on `!isMoving` and drop out immediately if movement resumes while one is
// showing, so an emote can never freeze a stride the way item 79's first attempt did. The other
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
// Six mood variants. Live on the map header's portrait badge (see MapScreen.tsx), not
// EncounterScreen — battles are fought by whichever crew member is active, not Scally herself, so
// pinning his expression to a duel he isn't visually in would misrepresent the actual fighter.
// All six now have a real, honest trigger there instead:
//   - NEUTRAL / DETERMINED / HURT: the original heat-tier mood badge (clear / being watched /
//     genuinely in danger) — unchanged, just extended to cover the low-heat case with an actual
//     face instead of no badge at all.
//   - WINK: heat-zero only, an occasional idle blink (same mechanism already shipped for Cheeky
//     the monkey's dockside wink, just applied to the captain) — a small personality beat with no
//     story stakes, so it only shows up when nothing else is asking for attention.
//   - HAPPY / LAUGH: brief transient flashes over whichever badge is currently showing, fired the
//     instant `completedQuestIds` (HAPPY) or `defeatedLordIds` (LAUGH, the bigger win) grows.
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
/** A sly half-grin, one eye closed — the sixth face, previously cut but nameless/unused. */
export const FACE_WINK = SCALLY_FACES[3];
export const FACE_HAPPY = SCALLY_FACES[4];
export const FACE_LAUGH = SCALLY_FACES[5];

// --- Run cycle (side view) -----------------------------------------------------------------------
// Re-wired 2026-08-15. The original swap read as a pop (bigger stride + the existing walkBounce
// animation exaggerating the jump between the two poses); rather than a hard instant swap,
// MapScreen now (a) reuses the same walk-cycle frame counter for the run frames too, since both
// sets are RUN_FRAME_COUNT === WALK_FRAME_COUNT === 5, so a mid-stride swap always lands on the
// matching stride position instead of resetting to frame 0, and (b) dampens walkBounce's amplitude
// specifically while running, since the run pose's own bigger stride already reads as more motion
// without the added bounce stacking on top of it.
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
// ATTACK/SWORD_READY re-wired 2026-08-15: the on-foot equivalent of the ship's Stop/Skid flash (see
// shipSprites.ts) — a forced fight while not boarded flashes both poses for ATTACK_FLASH_MS each
// before cutting to the battle screen, instead of an instant cut. This is a one-shot transition,
// not a per-frame overlay, so it was never actually implicated in the walk-cycle hop bug (item 83's
// revert removed it only as cleanup alongside the render it briefly overrode, not because it caused
// the bug itself).
export const POSE_ATTACK = require('../../assets/sprites/scally/attack.png');
export const POSE_SWORD_READY = require('../../assets/sprites/scally/sword_ready.png');
/** How long the attack flash holds right as a forced duel triggers, before the screen cuts to
 * Encounter. */
export const ATTACK_FLASH_MS = 450;
// POSE_CHEER_FIST / POSE_POINT stay cut but unwired. Both need a real one-off story moment (a
// specific recruit celebration, a specific "look over there" beat) rather than a generic map-loop
// trigger — the two nearest candidates (lord-fort and side-quest markers) navigate to a different
// screen the instant you're close enough to reach them, so there's no on-map moment left standing
// to show the pose in. Forcing one in anyway would be a scope decision disguised as an asset swap
// (the same reasoning that left ICON_QUESTION and Cheeky's climb/hang/sleep frames unwired below).
export const POSE_CHEER_FIST = require('../../assets/sprites/scally/cheer_fist.png');
export const POSE_POINT = require('../../assets/sprites/scally/point.png');

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

// --- Talking expressions ("Captain Scally: Talking Expressions" reference sheet) ---------------
// 20 full torso poses — same crossed-arms family and crop as LIP_SYNC_FRAMES, but varying the
// *face* instead of just the mouth. These are NOT a drop-in replacement for LIP_SYNC_FRAMES during
// active dialogue: the lip-sync sheet's whole mouth-shape set was drawn against one fixed facial
// expression, so there's no "surprised" or "angry" version of each of the 29 mouth shapes — only
// this one frame per expression, mouth already closed/set. Swapping expression mid-word would
// therefore look identical for every syllable rather than talking, i.e. wrong for the same reason
// the mouth-shape set doesn't have expression variants. Real uses are ones that don't require
// syncing to letters: a per-line REST/mood pose for ConversationBox (before typing starts / after
// it ends, no mouth animation running), or a reaction pose on another screen entirely (battle
// outcome, quest completion) — not yet wired to either; see GAME_DESIGN.md for the open question.
export const TALK_EXPRESSIONS = {
  neutral: require('../../assets/sprites/scally/talk_expressions/neutral.png'),
  happy: require('../../assets/sprites/scally/talk_expressions/happy.png'),
  big_smile: require('../../assets/sprites/scally/talk_expressions/big_smile.png'),
  laugh: require('../../assets/sprites/scally/talk_expressions/laugh.png'),
  smug: require('../../assets/sprites/scally/talk_expressions/smug.png'),
  confident: require('../../assets/sprites/scally/talk_expressions/confident.png'),
  determined: require('../../assets/sprites/scally/talk_expressions/determined.png'),
  surprised: require('../../assets/sprites/scally/talk_expressions/surprised.png'),
  scared: require('../../assets/sprites/scally/talk_expressions/scared.png'),
  angry: require('../../assets/sprites/scally/talk_expressions/angry.png'),
  thinking: require('../../assets/sprites/scally/talk_expressions/thinking.png'),
  wink: require('../../assets/sprites/scally/talk_expressions/wink.png'),
  raised_brow: require('../../assets/sprites/scally/talk_expressions/raised_brow.png'),
  curious: require('../../assets/sprites/scally/talk_expressions/curious.png'),
  disappointed: require('../../assets/sprites/scally/talk_expressions/disappointed.png'),
  tired: require('../../assets/sprites/scally/talk_expressions/tired.png'),
  excited: require('../../assets/sprites/scally/talk_expressions/excited.png'),
  shouting: require('../../assets/sprites/scally/talk_expressions/shouting.png'),
  tongue_out: require('../../assets/sprites/scally/talk_expressions/tongue_out.png'),
  puffed_cheeks: require('../../assets/sprites/scally/talk_expressions/puffed_cheeks.png'),
} as const;

export type TalkExpressionKey = keyof typeof TALK_EXPRESSIONS;

// --- Extras: hand-drawn UI icons -------------------------------------------------------------------
export const ICON_EXCLAIM = require('../../assets/sprites/scally/icon_exclaim.png');
export const ICON_QUESTION = require('../../assets/sprites/scally/icon_question.png');
export const ICON_SPEECH = require('../../assets/sprites/scally/icon_speech.png');
export const ICON_MAP = require('../../assets/sprites/scally/icon_map.png');
