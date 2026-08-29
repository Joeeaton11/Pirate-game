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
 * color but isn't part of the same contiguous region stays opaque). Both portraits are mirrored
 * horizontally from their source renders so every NPC faces screen-left in ConversationBox's
 * side="right" slot, opposite Scally's own screen-right-facing portrait.
 *
 * Blackfin's first source render (not kept) visibly reused Jack Sparrow's specific design
 * signifiers (dreadlocks-and-beads, skull-and-bandana tricorn, kohl-lined eyes) and a painterly-
 * realistic adult art style that doesn't match Scally's chibi/cel-shaded look at all — re-sent twice,
 * once to fix the style, once more to move his sash/accent color off of Scally's own signature red
 * (kept in this comment as a flag: if this "shared house style, distinct accent color" convention
 * ever gets written down as an actual style guide, log it there too, not just here). */
export const ADMIRAL_GRACE_PORTRAIT = require('../../assets/sprites/characters/admiral_grace_portrait_1.png');
export const BLACKFIN_PORTRAIT = require('../../assets/sprites/characters/blackfin_portrait_1.png');
