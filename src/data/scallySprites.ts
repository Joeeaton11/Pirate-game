// Captain Scally's on-map sprite art. Sliced from the production sprite sheet the user supplied
// (assets/brand/scally_sprite_sheet_source.png, "Scallywags" style guide) into per-frame
// transparent PNGs under assets/sprites/scally/ — see GAME_DESIGN.md for the art-overhaul note.
//
// Walk cycle: real 8-directional art, 3rd-generation source (assets/brand/scally_walk12_source.png,
// "Captain Scally — Walk Animations (8 Directions)" — 12-frame-per-direction sheet with a genuine
// alpha channel), cut 2026-08-22. Replaces the 2nd-generation 6/7-frame cut
// (scally_walk_8dir_source.png) after the user's own hands-on testing caught that cut's real defect:
// every direction's forward-reaching leg was always the same physical leg — the trailing leg never
// took its turn leading, so the stride read as a shuffle rather than a walk ("we don't alternate
// which foot goes forward" / "it's always the furthest foot from us that is first"). Confirmed
// against the raw source art (not the crop) via per-frame boot-blob tracking before recutting —
// see GAME_DESIGN.md for the full write-up and the East-direction pixel evidence.
//
// This sheet's own printed labels ("1"-"12" per direction) undercounted again — measured 13 real
// character columns per direction after a compass-name label plaque (its own extra column), with
// the 13th confirmed a loop-closing duplicate of column 1 (visual + pixel-diff check, both South and
// East). Cut using columns 1-12 only. All directions now share a flat 12-frame count — the first
// time this walk cycle hasn't had uneven per-direction frame counts.

export type FacingDirection = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';

/** Every direction now has exactly 12 real frames (see header note) — no more per-direction
 * variance, so this is both the shared upper bound for MapScreen's walk-frame counter and each
 * direction's own real length. */
export const WALK_FRAME_COUNT = 12;

const WALK_SOURCES: Record<FacingDirection, any[]> = {
  s: [
    require('../../assets/sprites/scally/walk_s_0.png'),
    require('../../assets/sprites/scally/walk_s_1.png'),
    require('../../assets/sprites/scally/walk_s_2.png'),
    require('../../assets/sprites/scally/walk_s_3.png'),
    require('../../assets/sprites/scally/walk_s_4.png'),
    require('../../assets/sprites/scally/walk_s_5.png'),
    require('../../assets/sprites/scally/walk_s_6.png'),
    require('../../assets/sprites/scally/walk_s_7.png'),
    require('../../assets/sprites/scally/walk_s_8.png'),
    require('../../assets/sprites/scally/walk_s_9.png'),
    require('../../assets/sprites/scally/walk_s_10.png'),
    require('../../assets/sprites/scally/walk_s_11.png'),
  ],
  se: [
    require('../../assets/sprites/scally/walk_se_0.png'),
    require('../../assets/sprites/scally/walk_se_1.png'),
    require('../../assets/sprites/scally/walk_se_2.png'),
    require('../../assets/sprites/scally/walk_se_3.png'),
    require('../../assets/sprites/scally/walk_se_4.png'),
    require('../../assets/sprites/scally/walk_se_5.png'),
    require('../../assets/sprites/scally/walk_se_6.png'),
    require('../../assets/sprites/scally/walk_se_7.png'),
    require('../../assets/sprites/scally/walk_se_8.png'),
    require('../../assets/sprites/scally/walk_se_9.png'),
    require('../../assets/sprites/scally/walk_se_10.png'),
    require('../../assets/sprites/scally/walk_se_11.png'),
  ],
  e: [
    require('../../assets/sprites/scally/walk_e_0.png'),
    require('../../assets/sprites/scally/walk_e_1.png'),
    require('../../assets/sprites/scally/walk_e_2.png'),
    require('../../assets/sprites/scally/walk_e_3.png'),
    require('../../assets/sprites/scally/walk_e_4.png'),
    require('../../assets/sprites/scally/walk_e_5.png'),
    require('../../assets/sprites/scally/walk_e_6.png'),
    require('../../assets/sprites/scally/walk_e_7.png'),
    require('../../assets/sprites/scally/walk_e_8.png'),
    require('../../assets/sprites/scally/walk_e_9.png'),
    require('../../assets/sprites/scally/walk_e_10.png'),
    require('../../assets/sprites/scally/walk_e_11.png'),
  ],
  ne: [
    require('../../assets/sprites/scally/walk_ne_0.png'),
    require('../../assets/sprites/scally/walk_ne_1.png'),
    require('../../assets/sprites/scally/walk_ne_2.png'),
    require('../../assets/sprites/scally/walk_ne_3.png'),
    require('../../assets/sprites/scally/walk_ne_4.png'),
    require('../../assets/sprites/scally/walk_ne_5.png'),
    require('../../assets/sprites/scally/walk_ne_6.png'),
    require('../../assets/sprites/scally/walk_ne_7.png'),
    require('../../assets/sprites/scally/walk_ne_8.png'),
    require('../../assets/sprites/scally/walk_ne_9.png'),
    require('../../assets/sprites/scally/walk_ne_10.png'),
    require('../../assets/sprites/scally/walk_ne_11.png'),
  ],
  n: [
    require('../../assets/sprites/scally/walk_n_0.png'),
    require('../../assets/sprites/scally/walk_n_1.png'),
    require('../../assets/sprites/scally/walk_n_2.png'),
    require('../../assets/sprites/scally/walk_n_3.png'),
    require('../../assets/sprites/scally/walk_n_4.png'),
    require('../../assets/sprites/scally/walk_n_5.png'),
    require('../../assets/sprites/scally/walk_n_6.png'),
    require('../../assets/sprites/scally/walk_n_7.png'),
    require('../../assets/sprites/scally/walk_n_8.png'),
    require('../../assets/sprites/scally/walk_n_9.png'),
    require('../../assets/sprites/scally/walk_n_10.png'),
    require('../../assets/sprites/scally/walk_n_11.png'),
  ],
  nw: [
    require('../../assets/sprites/scally/walk_nw_0.png'),
    require('../../assets/sprites/scally/walk_nw_1.png'),
    require('../../assets/sprites/scally/walk_nw_2.png'),
    require('../../assets/sprites/scally/walk_nw_3.png'),
    require('../../assets/sprites/scally/walk_nw_4.png'),
    require('../../assets/sprites/scally/walk_nw_5.png'),
    require('../../assets/sprites/scally/walk_nw_6.png'),
    require('../../assets/sprites/scally/walk_nw_7.png'),
    require('../../assets/sprites/scally/walk_nw_8.png'),
    require('../../assets/sprites/scally/walk_nw_9.png'),
    require('../../assets/sprites/scally/walk_nw_10.png'),
    require('../../assets/sprites/scally/walk_nw_11.png'),
  ],
  w: [
    require('../../assets/sprites/scally/walk_w_0.png'),
    require('../../assets/sprites/scally/walk_w_1.png'),
    require('../../assets/sprites/scally/walk_w_2.png'),
    require('../../assets/sprites/scally/walk_w_3.png'),
    require('../../assets/sprites/scally/walk_w_4.png'),
    require('../../assets/sprites/scally/walk_w_5.png'),
    require('../../assets/sprites/scally/walk_w_6.png'),
    require('../../assets/sprites/scally/walk_w_7.png'),
    require('../../assets/sprites/scally/walk_w_8.png'),
    require('../../assets/sprites/scally/walk_w_9.png'),
    require('../../assets/sprites/scally/walk_w_10.png'),
    require('../../assets/sprites/scally/walk_w_11.png'),
  ],
  sw: [
    require('../../assets/sprites/scally/walk_sw_0.png'),
    require('../../assets/sprites/scally/walk_sw_1.png'),
    require('../../assets/sprites/scally/walk_sw_2.png'),
    require('../../assets/sprites/scally/walk_sw_3.png'),
    require('../../assets/sprites/scally/walk_sw_4.png'),
    require('../../assets/sprites/scally/walk_sw_5.png'),
    require('../../assets/sprites/scally/walk_sw_6.png'),
    require('../../assets/sprites/scally/walk_sw_7.png'),
    require('../../assets/sprites/scally/walk_sw_8.png'),
    require('../../assets/sprites/scally/walk_sw_9.png'),
    require('../../assets/sprites/scally/walk_sw_10.png'),
    require('../../assets/sprites/scally/walk_sw_11.png'),
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
// Real breathing loop only exists for the 4 cardinals — the 8-directional walk sheet didn't
// include a matching idle set, and the original idle cut (from a different, earlier source sheet)
// never covered diagonals either. Diagonals fall back to a held single frame — that direction's own
// first walk frame — rather than forcing a breathing loop that doesn't exist; a static hold reads
// as "standing still facing that way," which is honest, versus reusing a neighboring cardinal's
// idle art, which would visibly snap the pose the instant movement stopped.
//
// South's own breathing loop was upgraded 2026-08-22 from 3 frames (the original cut) to a real
// 7-frame loop cut from a new "Captain Scally — Idle Animations" reference sheet's own "1. IDLE —
// BREATHING" panel — a strict art upgrade, same character/pose family, just a longer, smoother
// cycle. That sheet only drew breathing for the front-facing view, so e/n/w keep their original
// 3-frame art unchanged rather than sitting at a mismatched frame count with no matching art to
// upgrade them to.
const IDLE_SOURCES: Record<FacingDirection, any[]> = {
  s: [
    require('../../assets/sprites/scally/idle_breathing_0.png'),
    require('../../assets/sprites/scally/idle_breathing_1.png'),
    require('../../assets/sprites/scally/idle_breathing_2.png'),
    require('../../assets/sprites/scally/idle_breathing_3.png'),
    require('../../assets/sprites/scally/idle_breathing_4.png'),
    require('../../assets/sprites/scally/idle_breathing_5.png'),
    require('../../assets/sprites/scally/idle_breathing_6.png'),
  ],
  e: [
    require('../../assets/sprites/scally/idle_e_0.png'),
    require('../../assets/sprites/scally/idle_e_1.png'),
    require('../../assets/sprites/scally/idle_e_2.png'),
  ],
  n: [
    require('../../assets/sprites/scally/idle_n_0.png'),
    require('../../assets/sprites/scally/idle_n_1.png'),
    require('../../assets/sprites/scally/idle_n_2.png'),
  ],
  w: [
    require('../../assets/sprites/scally/idle_w_0.png'),
    require('../../assets/sprites/scally/idle_w_1.png'),
    require('../../assets/sprites/scally/idle_w_2.png'),
  ],
  se: [WALK_SOURCES.se[0]],
  ne: [WALK_SOURCES.ne[0]],
  nw: [WALK_SOURCES.nw[0]],
  sw: [WALK_SOURCES.sw[0]],
};

/** Bust portrait, cut from the same sheet — now wired into the map header (see MapScreen.tsx). */
export const SCALLY_PORTRAIT = require('../../assets/sprites/scally/portrait.png');

/** Which frame image to show for a given facing direction/movement state. Moving cycles through
 * that direction's own walk frames (`frameIndex`, from MapScreen's shared walk-cycle interval —
 * frame counts are per-direction now, 6 or 7, so this wraps via `frames.length` rather than a
 * single shared count); idle cycles that direction's own breathing loop (7 frames for south, 3 for
 * the other cardinals) or holds a single static frame for diagonals (`idleFrameIndex`, from
 * MapScreen's own separate, slower interval — see IDLE_SOURCES' doc comment for the debounce
 * history and the diagonal fallback). `idleFrameIndex` defaults to 0 (a plain standing pose) for
 * any caller that doesn't track it. */
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

// The old `turnFrameFor`/`TurnFrame` mid-pivot system (turn_se/ne/nw/sw.png, a different, earlier
// source sheet's "Turn Frames" panel) was a workaround for the 4-cardinal-only walk cycle having no
// real diagonal art — it flashed a single pivot pose while facingDir crossed between two adjacent
// cardinals. Removed 2026-08-22 now that genuine sustained 8-directional walk art exists (a real
// diagonal walk cycle makes a momentary pivot flash redundant, and the old pivot poses don't line up
// with the new art's diagonal stance anyway). turn_se/ne/nw/sw.png were deleted from
// assets/sprites/scally/ along with the old 4-cardinal walk_down/left/right/up_*.png files they
// were cut alongside — see GAME_DESIGN.md for the write-up.

// --- Emotes ("Animated Idle / Emotes" panel) ---------------------------------------------------
// Re-wired 2026-08-15 (see the IDLE_SOURCES note above for the isMoving-debounce fix that made
// this safe again). Two real narrative triggers (see MapScreen.tsx): VICTORY flashes on a
// quest/Pirate Lord completion, WAVE flashes when a building's enter-prompt appears (greeting the
// door). Both are gated on `!isMoving` and drop out immediately if movement resumes while one is
// showing, so an emote can never freeze a stride the way item 79's first attempt did.
export const EMOTE_WAVE = require('../../assets/sprites/scally/emote_wave.png');
export const EMOTE_VICTORY = require('../../assets/sprites/scally/emote_victory.png');
export const WAVE_ANIMATION_MS = 900;
export const VICTORY_ANIMATION_MS = 1600;

// --- Idle flourishes ("Captain Scally — Idle Animations" reference sheet) ----------------------
// Stand still long enough with no story-moment emote showing and Scally cycles through a little
// flourish rather than holding the same breathing loop forever — the same "idle animation after
// inactivity" trick old-school RPGs use to keep a stationary character from reading as frozen.
//
// Originally (2026-08-15) this pool held 4 single static frames cut from an earlier "Animated
// Idle / Emotes" sheet (a cheer fist-pump, a chin-scratch, a laugh, a seated pose). Replaced
// entirely 2026-08-22 by 9 full multi-frame looping animations cut from a dedicated new reference
// sheet — the old single-pose set is now a strict downgrade of what's available (the sheet even
// includes richer versions of 3 of the same ideas: BORED/BOOT KICK vs. the old think pose,
// SITTING ON BARREL vs. the old sit pose, HAT TIP/GRIN vs. the old cheer pose), so it was removed
// rather than kept alongside — see GAME_DESIGN.md for the write-up. Each entry is now a real frame
// array (7 or 8 frames — this sheet's per-animation counts are genuinely uneven, same lesson as
// every other delivery this session: measured directly off the sheet, not trusted from its own
// printed frame-number labels, which had gaps) instead of one held image, cycled by MapScreen's
// own idle-flourish interval at IDLE_FLOURISH_FRAME_MS per frame while showing.
export interface IdleFlourish {
  key: string;
  frames: any[];
}
export const IDLE_FLOURISHES: IdleFlourish[] = [
  {
    key: 'hat_tip_grin',
    frames: [
      require('../../assets/sprites/scally/idle_flourish_hat_tip_grin_0.png'),
      require('../../assets/sprites/scally/idle_flourish_hat_tip_grin_1.png'),
      require('../../assets/sprites/scally/idle_flourish_hat_tip_grin_2.png'),
      require('../../assets/sprites/scally/idle_flourish_hat_tip_grin_3.png'),
      require('../../assets/sprites/scally/idle_flourish_hat_tip_grin_4.png'),
      require('../../assets/sprites/scally/idle_flourish_hat_tip_grin_5.png'),
      require('../../assets/sprites/scally/idle_flourish_hat_tip_grin_6.png'),
    ],
  },
  {
    key: 'juggling_coins',
    frames: [
      require('../../assets/sprites/scally/idle_flourish_juggling_coins_0.png'),
      require('../../assets/sprites/scally/idle_flourish_juggling_coins_1.png'),
      require('../../assets/sprites/scally/idle_flourish_juggling_coins_2.png'),
      require('../../assets/sprites/scally/idle_flourish_juggling_coins_3.png'),
      require('../../assets/sprites/scally/idle_flourish_juggling_coins_4.png'),
      require('../../assets/sprites/scally/idle_flourish_juggling_coins_5.png'),
      require('../../assets/sprites/scally/idle_flourish_juggling_coins_6.png'),
    ],
  },
  {
    key: 'reading_map',
    frames: [
      require('../../assets/sprites/scally/idle_flourish_reading_map_0.png'),
      require('../../assets/sprites/scally/idle_flourish_reading_map_1.png'),
      require('../../assets/sprites/scally/idle_flourish_reading_map_2.png'),
      require('../../assets/sprites/scally/idle_flourish_reading_map_3.png'),
      require('../../assets/sprites/scally/idle_flourish_reading_map_4.png'),
      require('../../assets/sprites/scally/idle_flourish_reading_map_5.png'),
      require('../../assets/sprites/scally/idle_flourish_reading_map_6.png'),
      require('../../assets/sprites/scally/idle_flourish_reading_map_7.png'),
    ],
  },
  {
    key: 'sitting_barrel',
    frames: [
      require('../../assets/sprites/scally/idle_flourish_sitting_barrel_0.png'),
      require('../../assets/sprites/scally/idle_flourish_sitting_barrel_1.png'),
      require('../../assets/sprites/scally/idle_flourish_sitting_barrel_2.png'),
      require('../../assets/sprites/scally/idle_flourish_sitting_barrel_3.png'),
      require('../../assets/sprites/scally/idle_flourish_sitting_barrel_4.png'),
      require('../../assets/sprites/scally/idle_flourish_sitting_barrel_5.png'),
      require('../../assets/sprites/scally/idle_flourish_sitting_barrel_6.png'),
    ],
  },
  {
    key: 'bored_boot_kick',
    frames: [
      require('../../assets/sprites/scally/idle_flourish_bored_boot_kick_0.png'),
      require('../../assets/sprites/scally/idle_flourish_bored_boot_kick_1.png'),
      require('../../assets/sprites/scally/idle_flourish_bored_boot_kick_2.png'),
      require('../../assets/sprites/scally/idle_flourish_bored_boot_kick_3.png'),
      require('../../assets/sprites/scally/idle_flourish_bored_boot_kick_4.png'),
      require('../../assets/sprites/scally/idle_flourish_bored_boot_kick_5.png'),
      require('../../assets/sprites/scally/idle_flourish_bored_boot_kick_6.png'),
      require('../../assets/sprites/scally/idle_flourish_bored_boot_kick_7.png'),
    ],
  },
  {
    key: 'scratch_thinking',
    frames: [
      require('../../assets/sprites/scally/idle_flourish_scratch_thinking_0.png'),
      require('../../assets/sprites/scally/idle_flourish_scratch_thinking_1.png'),
      require('../../assets/sprites/scally/idle_flourish_scratch_thinking_2.png'),
      require('../../assets/sprites/scally/idle_flourish_scratch_thinking_3.png'),
      require('../../assets/sprites/scally/idle_flourish_scratch_thinking_4.png'),
      require('../../assets/sprites/scally/idle_flourish_scratch_thinking_5.png'),
      require('../../assets/sprites/scally/idle_flourish_scratch_thinking_6.png'),
    ],
  },
  {
    key: 'fishing',
    frames: [
      require('../../assets/sprites/scally/idle_flourish_fishing_0.png'),
      require('../../assets/sprites/scally/idle_flourish_fishing_1.png'),
      require('../../assets/sprites/scally/idle_flourish_fishing_2.png'),
      require('../../assets/sprites/scally/idle_flourish_fishing_3.png'),
      require('../../assets/sprites/scally/idle_flourish_fishing_4.png'),
      require('../../assets/sprites/scally/idle_flourish_fishing_5.png'),
      require('../../assets/sprites/scally/idle_flourish_fishing_6.png'),
      require('../../assets/sprites/scally/idle_flourish_fishing_7.png'),
    ],
  },
  {
    key: 'stretch_yawn',
    frames: [
      require('../../assets/sprites/scally/idle_flourish_stretch_yawn_0.png'),
      require('../../assets/sprites/scally/idle_flourish_stretch_yawn_1.png'),
      require('../../assets/sprites/scally/idle_flourish_stretch_yawn_2.png'),
      require('../../assets/sprites/scally/idle_flourish_stretch_yawn_3.png'),
      require('../../assets/sprites/scally/idle_flourish_stretch_yawn_4.png'),
      require('../../assets/sprites/scally/idle_flourish_stretch_yawn_5.png'),
      require('../../assets/sprites/scally/idle_flourish_stretch_yawn_6.png'),
    ],
  },
  {
    key: 'sleeping_snoring',
    frames: [
      require('../../assets/sprites/scally/idle_flourish_sleeping_snoring_0.png'),
      require('../../assets/sprites/scally/idle_flourish_sleeping_snoring_1.png'),
      require('../../assets/sprites/scally/idle_flourish_sleeping_snoring_2.png'),
      require('../../assets/sprites/scally/idle_flourish_sleeping_snoring_3.png'),
      require('../../assets/sprites/scally/idle_flourish_sleeping_snoring_4.png'),
      require('../../assets/sprites/scally/idle_flourish_sleeping_snoring_5.png'),
      require('../../assets/sprites/scally/idle_flourish_sleeping_snoring_6.png'),
    ],
  },
];
/** How long standing still before a flourish is eligible to interrupt the normal idle loop. */
export const IDLE_FLOURISH_DELAY_MS = 5000;
/** How long a flourish plays once picked, before returning to the ordinary breathing loop. Long
 * enough for roughly 2 full loops of the longest (8-frame) animation at IDLE_FLOURISH_FRAME_MS —
 * cut off mid-cycle rather than on a clean loop boundary, same as the walk/run cycles already do
 * when movement stops, which reads fine since it's a continuous loop either way. */
export const IDLE_FLOURISH_HOLD_MS = 2400;
/** Per-frame cadence for a showing idle flourish — slower than the walk cycle's 110ms since these
 * are unhurried idle vignettes, not active motion. */
export const IDLE_FLOURISH_FRAME_MS = 150;

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
