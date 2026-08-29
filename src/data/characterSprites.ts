/** Real portrait art for named NPCs — the crew/lord/threat/rival roster's counterpart to
 * scallySprites.ts, which only ever covers the player. Starts with Admiral Grace (2026-08-29); the
 * rest of the roster (Blackfin, the 6 Pirate Lords, 12 crew archetypes, 6 threats) is still emoji
 * fallback — see GAME_DESIGN.md's asset-gap audit.
 *
 * Cut the same way every other delivery in this library is: real per-item alpha, background
 * removed by flood-filling outward from the canvas border through near-exact matches of the flat
 * backdrop color (not a flat global color-distance threshold — the user's source art has dark
 * navy/near-black clothing that sits close enough to a dark flat backdrop that a loose global
 * threshold eats real fabric shading; the border-connected flood fill only ever clears pixels
 * actually reachable from outside the figure, so a shadow fold that merely resembles the backdrop
 * color but isn't part of the same contiguous background region stays opaque). */
export const ADMIRAL_GRACE_PORTRAIT = require('../../assets/sprites/characters/admiral_grace_portrait_1.png');
