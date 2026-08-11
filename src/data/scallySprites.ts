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
