/** Real portrait art for named NPCs — the crew/lord/threat/rival roster's counterpart to
 * scallySprites.ts, which only ever covers the player. Starts with Admiral Grace and Captain
 * Blackfin (2026-08-29); the rest of the roster (5 more Pirate Lords, 12 crew archetypes, 6 threats)
 * is still emoji fallback — see GAME_DESIGN.md's asset-gap audit.
 *
 * Cut the same way every other delivery in this library is: real per-item alpha. Grace/Blackfin/
 * Sully's source renders arrived as fully-opaque flat backdrops and needed background removal —
 * flood-filling outward from the canvas border through near-exact matches of the flat backdrop
 * color (not a flat global color-distance threshold — those three had dark navy/near-black clothing
 * that sits close enough to a dark flat backdrop that a loose global threshold eats real fabric
 * shading; the border-connected flood fill only ever clears pixels actually reachable from outside
 * the figure, so a shadow fold that merely resembles the backdrop color but isn't part of the same
 * contiguous region stays opaque). Iron Jenny's (2026-08-30) arrived pre-matted with real alpha
 * already baked in (a radial dark-vignette RGB backdrop, but alpha itself already 0 at every true
 * background pixel and ~254 across her whole silhouette) — just needed trimming to her real content
 * bbox via the alpha channel directly, no reconstruction. No mirroring is applied to any of these
 * files: the very first Grace/Blackfin renders needed a horizontal flip to face screen-left for
 * ConversationBox's side="right" slot, but the user now generates every character pre-oriented the
 * right way round (2026-08-29 follow-up — both files here were re-cut from re-sent, already-
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

/** Each portrait's own native height/width ratio, hand-read off the actual cut PNG (`file`/PIL, not
 * guessed) — every character's source render comes from a separate generation and is NOT the same
 * shape as Scally's own 129x251 lipsync frames (`ConversationBox`'s default), so this has to be
 * passed explicitly as `portraitAspectRatio` or the box sizes/crops that character inconsistently
 * with Scally (2026-08-30 fix — see `ConversationBox.tsx`'s own long comment on this for the full
 * story of what broke without it). Recompute and update this if a portrait file is ever re-cut at a
 * different crop/canvas size. */
export const ADMIRAL_GRACE_PORTRAIT_ASPECT_RATIO = 1452 / 791;
export const BLACKFIN_PORTRAIT_ASPECT_RATIO = 1391 / 847;

/** How far down each portrait its ConversationBox crop should cut off, as a fraction of the
 * portrait's own full rendered height. 2026-08-30: briefly tuned per-character (0.55-0.60) to land
 * at "the belt, no legs visible" matching Scally's own 0.85 framing — direct follow-up feedback
 * reversed that same day: don't crop any NPC at all, show the whole character. 1 (no crop) for every
 * NPC now; Scally himself is unaffected (still his own tuned 0.85 default) since this was scoped to
 * NPCs specifically. If NPC cropping is ever reintroduced, the per-character tuning method (compare
 * render previews at several candidate fractions against a reference) is what worked before — see
 * git history on this file for the 0.55-0.60 values that were here. */
export const ADMIRAL_GRACE_PORTRAIT_CROP_FRACTION = 1;
export const BLACKFIN_PORTRAIT_CROP_FRACTION = 1;

/** Pirate Lord portraits, keyed by `PirateLord.id` — partial coverage like `LANDMARK_SPRITES`
 * (worldSprites.ts): `PirateLordScreen` checks this map and falls back to the old emoji-header
 * rendering for any lord not yet in it, same "partial map + fallback" shape used everywhere else in
 * this library rather than requiring every entry up front. Starts with Grizzle Bones (2026-08-29,
 * Lord #1 — first boss fight, so first in line for real art; named "Redbeard Sully" at the time,
 * renamed 2026-08-30 for the same real-historical-figure reason "Blackbeard" is queued for a rename
 * — see `pirateLords.ts`). */
export const LORD_PORTRAITS = {
  lord_cow_island: require('../../assets/sprites/characters/redbeard_sully_portrait_1.png'),
  lord_new_providence: require('../../assets/sprites/characters/iron_jenny_portrait_1.png'),
  lord_roatan: require('../../assets/sprites/characters/captain_bellows_portrait_1.png'),
  lord_port_royal: require('../../assets/sprites/characters/marietta_graves_portrait_1.png'),
  lord_ile_sainte_marie: require('../../assets/sprites/characters/finn_maelstrom_portrait_1.png'),
};

/** Aspect ratio per lord portrait — see ADMIRAL_GRACE_PORTRAIT_ASPECT_RATIO's doc comment; same
 * "read off the actual file" rule applies to every entry added here. */
export const LORD_PORTRAIT_ASPECT_RATIOS: Record<string, number> = {
  lord_cow_island: 1404 / 990,
  lord_new_providence: 1454 / 940,
  lord_roatan: 1306 / 1080,
  lord_port_royal: 1395 / 966,
  lord_ile_sainte_marie: 1229 / 1041,
};

/** Crop fraction per lord portrait — see ADMIRAL_GRACE_PORTRAIT_CROP_FRACTION's doc comment: no
 * cropping for any NPC, 1 for every entry here. */
export const LORD_PORTRAIT_CROP_FRACTIONS: Record<string, number> = {
  lord_cow_island: 1,
  lord_new_providence: 1,
  lord_roatan: 1,
  lord_port_royal: 1,
  lord_ile_sainte_marie: 1,
};
