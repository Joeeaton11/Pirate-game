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
