/** Real portrait art for named NPCs — the crew/lord/threat/rival roster's counterpart to
 * scallySprites.ts, which only ever covers the player. Starts with Admiral Grace and Captain
 * Blackfin (2026-08-29); the rest of the roster (the 6 Pirate Lords, 12 crew archetypes, 6 threats)
 * is still emoji fallback — see GAME_DESIGN.md's asset-gap audit.
 *
 * Cut the same way every other delivery in this library is: real per-item alpha, background
 * removed by flood-filling outward from the canvas border through near-exact matches of the flat
 * backdrop color (not a flat global color-distance threshold — the user's source art has dark
 * navy/near-black clothing that sits close enough to a dark flat backdrop that a loose global
 * threshold eats real fabric shading; the border-connected flood fill only ever clears pixels
 * actually reachable from outside the figure, so a shadow fold that merely resembles the backdrop
 * color but isn't part of the same contiguous region stays opaque). No mirroring is applied to
 * either file: the very first Grace/Blackfin renders needed a horizontal flip to face screen-left
 * for ConversationBox's side="right" slot, but the user now generates every character pre-oriented
 * the right way round (2026-08-29 follow-up — both files here were re-cut from re-sent, already-
 * correctly-facing renders), so the source PNG's own orientation is exactly what ships. Don't
 * reintroduce a flip step for future characters unless a source render actually comes in backwards.
 *
 * Blackfin's first source render (not kept) visibly reused Jack Sparrow's specific design
 * signifiers (dreadlocks-and-beads, skull-and-bandana tricorn, kohl-lined eyes) and a painterly-
 * realistic adult art style that doesn't match Scally's chibi/cel-shaded look at all — re-sent twice,
 * once to fix the style, once more to move his sash/accent color off of Scally's own signature red
 * (kept in this comment as a flag: if this "shared house style, distinct accent color" convention
 * ever gets written down as an actual style guide, log it there too, not just here). */
export const ADMIRAL_GRACE_PORTRAIT = require('../../assets/sprites/characters/admiral_grace_portrait_1.png');
export const BLACKFIN_PORTRAIT = require('../../assets/sprites/characters/blackfin_portrait_1.png');

/** Pirate Lord portraits, keyed by `PirateLord.id` — partial coverage like `LANDMARK_SPRITES`
 * (worldSprites.ts): `PirateLordScreen` checks this map and falls back to the old emoji-header
 * rendering for any lord not yet in it, same "partial map + fallback" shape used everywhere else in
 * this library rather than requiring every entry up front. Starts with Redbeard Sully (2026-08-29,
 * Lord #1 — first boss fight, so first in line for real art). */
export const LORD_PORTRAITS = {
  lord_cow_island: require('../../assets/sprites/characters/redbeard_sully_portrait_1.png'),
};
