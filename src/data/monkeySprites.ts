// Cheeky the monkey — Captain Scally's companion, cut from the same sheet's "Cheeky (Monkey)"
// panel (assets/brand/scally_sprite_sheet_source.png). Only the core idle/walk/emote frames are
// cut; the sheet also has a whole "Extras" set (climbing a rope, hanging from a bar, sitting with
// a banana/barrel) that isn't — those need a real design decision (where would Cheeky actually
// climb/hang in the world?) this pass didn't make, so they're left uncut rather than forced in.
//
// protagonist.ts already establishes where Cheeky lives: `COMPANION_NAME`/`COMPANION_EMOJI` and
// the Menu screen's own subtitle say "Cheeky is minding the ship" — he stays aboard the Black
// Pearl, not trailing Scally on foot. So he's wired in at the docked-ship marker (see
// MapScreen.tsx), a small idle/wink figure perched on deck whenever she's parked and unboarded,
// not a following companion. MONKEY_WALK and MONKEY_SLEEP are cut but unused this pass — no
// on-foot or asleep-at-the-wheel moment currently calls for them.

export const MONKEY_IDLE = require('../../assets/sprites/scally/monkey_idle.png');
export const MONKEY_WALK = require('../../assets/sprites/scally/monkey_walk.png');
export const MONKEY_WINK = require('../../assets/sprites/scally/monkey_wink.png');
export const MONKEY_SLEEP = require('../../assets/sprites/scally/monkey_sleep.png');

/** How often Cheeky blinks (swaps to MONKEY_WINK) while perched on the docked ship, and how long
 * the wink holds. */
export const MONKEY_WINK_INTERVAL_MS = 4000;
export const MONKEY_WINK_HOLD_MS = 220;

/** Cheeky's on-foot walk cycle (Tortuga art pass v2, 2026-11-14): an 8-frame hop built from the
 * existing `monkey_walk.png` pose (bounce + slight lean + landing squash), not new generated art,
 * so it stays exactly on-model. Faces east; mirror for west. Used when Cheeky follows Scally. */
export const CHEEKY_WALK_FRAMES = [
  require('../../assets/sprites/scally/cheeky_walk_0.png'),
  require('../../assets/sprites/scally/cheeky_walk_1.png'),
  require('../../assets/sprites/scally/cheeky_walk_2.png'),
  require('../../assets/sprites/scally/cheeky_walk_3.png'),
  require('../../assets/sprites/scally/cheeky_walk_4.png'),
  require('../../assets/sprites/scally/cheeky_walk_5.png'),
  require('../../assets/sprites/scally/cheeky_walk_6.png'),
  require('../../assets/sprites/scally/cheeky_walk_7.png'),
];

// --- Cheeky v2 (2026-11-16) -----------------------------------------------------------------------
// Made like Scally's v2 set: one locked pose per view (side / front / back), animated as AI video
// and cut to pixel frames on a shared 96x96 canvas (tools/sprites/video_to_frames.py). West is the
// mirrored east hop.
export const CHEEKY_HOP: Record<'e' | 'w' | 's' | 'n', any[]> = {
  e: [
  require('../../assets/sprites/scally/cheeky_v2/hop_e_0.png'),
  require('../../assets/sprites/scally/cheeky_v2/hop_e_1.png'),
  require('../../assets/sprites/scally/cheeky_v2/hop_e_2.png'),
  require('../../assets/sprites/scally/cheeky_v2/hop_e_3.png'),
  require('../../assets/sprites/scally/cheeky_v2/hop_e_4.png'),
  require('../../assets/sprites/scally/cheeky_v2/hop_e_5.png'),
  require('../../assets/sprites/scally/cheeky_v2/hop_e_6.png'),
  require('../../assets/sprites/scally/cheeky_v2/hop_e_7.png'),
],
  w: [
  require('../../assets/sprites/scally/cheeky_v2/hop_w_0.png'),
  require('../../assets/sprites/scally/cheeky_v2/hop_w_1.png'),
  require('../../assets/sprites/scally/cheeky_v2/hop_w_2.png'),
  require('../../assets/sprites/scally/cheeky_v2/hop_w_3.png'),
  require('../../assets/sprites/scally/cheeky_v2/hop_w_4.png'),
  require('../../assets/sprites/scally/cheeky_v2/hop_w_5.png'),
  require('../../assets/sprites/scally/cheeky_v2/hop_w_6.png'),
  require('../../assets/sprites/scally/cheeky_v2/hop_w_7.png'),
],
  s: [
  require('../../assets/sprites/scally/cheeky_v2/hop_s_0.png'),
  require('../../assets/sprites/scally/cheeky_v2/hop_s_1.png'),
  require('../../assets/sprites/scally/cheeky_v2/hop_s_2.png'),
  require('../../assets/sprites/scally/cheeky_v2/hop_s_3.png'),
  require('../../assets/sprites/scally/cheeky_v2/hop_s_4.png'),
  require('../../assets/sprites/scally/cheeky_v2/hop_s_5.png'),
  require('../../assets/sprites/scally/cheeky_v2/hop_s_6.png'),
  require('../../assets/sprites/scally/cheeky_v2/hop_s_7.png'),
],
  n: [
  require('../../assets/sprites/scally/cheeky_v2/hop_n_0.png'),
  require('../../assets/sprites/scally/cheeky_v2/hop_n_1.png'),
  require('../../assets/sprites/scally/cheeky_v2/hop_n_2.png'),
  require('../../assets/sprites/scally/cheeky_v2/hop_n_3.png'),
  require('../../assets/sprites/scally/cheeky_v2/hop_n_4.png'),
  require('../../assets/sprites/scally/cheeky_v2/hop_n_5.png'),
  require('../../assets/sprites/scally/cheeky_v2/hop_n_6.png'),
  require('../../assets/sprites/scally/cheeky_v2/hop_n_7.png'),
],
};
/** Sitting idle: looks around, scratches his head and tummy, settles. */
export const CHEEKY_IDLE = [
  require('../../assets/sprites/scally/cheeky_v2/idle_0.png'),
  require('../../assets/sprites/scally/cheeky_v2/idle_1.png'),
  require('../../assets/sprites/scally/cheeky_v2/idle_2.png'),
  require('../../assets/sprites/scally/cheeky_v2/idle_3.png'),
  require('../../assets/sprites/scally/cheeky_v2/idle_4.png'),
  require('../../assets/sprites/scally/cheeky_v2/idle_5.png'),
  require('../../assets/sprites/scally/cheeky_v2/idle_6.png'),
  require('../../assets/sprites/scally/cheeky_v2/idle_7.png'),
  require('../../assets/sprites/scally/cheeky_v2/idle_8.png'),
  require('../../assets/sprites/scally/cheeky_v2/idle_9.png'),
  require('../../assets/sprites/scally/cheeky_v2/idle_10.png'),
  require('../../assets/sprites/scally/cheeky_v2/idle_11.png'),
];
/** Jump, spin, clap — plays alongside Scally's celebrate. */
export const CHEEKY_CELEBRATE = [
  require('../../assets/sprites/scally/cheeky_v2/celebrate_0.png'),
  require('../../assets/sprites/scally/cheeky_v2/celebrate_1.png'),
  require('../../assets/sprites/scally/cheeky_v2/celebrate_2.png'),
  require('../../assets/sprites/scally/cheeky_v2/celebrate_3.png'),
  require('../../assets/sprites/scally/cheeky_v2/celebrate_4.png'),
  require('../../assets/sprites/scally/cheeky_v2/celebrate_5.png'),
  require('../../assets/sprites/scally/cheeky_v2/celebrate_6.png'),
  require('../../assets/sprites/scally/cheeky_v2/celebrate_7.png'),
  require('../../assets/sprites/scally/cheeky_v2/celebrate_8.png'),
  require('../../assets/sprites/scally/cheeky_v2/celebrate_9.png'),
  require('../../assets/sprites/scally/cheeky_v2/celebrate_10.png'),
  require('../../assets/sprites/scally/cheeky_v2/celebrate_11.png'),
];
/** Scally (front) with Cheeky scampering up onto his shoulder; the last frame is the "riding" pose
 * held while Scally stands still. Same 112x128 canvas as Scally's own frames. */
export const SCALLY_CHEEKY_CLIMB = [
  require('../../assets/sprites/scally/cheeky_v2/climb_0.png'),
  require('../../assets/sprites/scally/cheeky_v2/climb_1.png'),
  require('../../assets/sprites/scally/cheeky_v2/climb_2.png'),
  require('../../assets/sprites/scally/cheeky_v2/climb_3.png'),
  require('../../assets/sprites/scally/cheeky_v2/climb_4.png'),
  require('../../assets/sprites/scally/cheeky_v2/climb_5.png'),
  require('../../assets/sprites/scally/cheeky_v2/climb_6.png'),
  require('../../assets/sprites/scally/cheeky_v2/climb_7.png'),
  require('../../assets/sprites/scally/cheeky_v2/climb_8.png'),
  require('../../assets/sprites/scally/cheeky_v2/climb_9.png'),
  require('../../assets/sprites/scally/cheeky_v2/climb_10.png'),
  require('../../assets/sprites/scally/cheeky_v2/climb_11.png'),
];
export const CHEEKY_V2_ALL: any[] = [
  ...Object.values(CHEEKY_HOP).flat(),
  ...CHEEKY_IDLE,
  ...CHEEKY_CELEBRATE,
  ...SCALLY_CHEEKY_CLIMB,
];
