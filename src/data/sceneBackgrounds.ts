// Full-scene backdrop art — complete standalone illustrations meant to fill the screen behind a
// UI overlay (like ConversationBox), not sprites cut from a reference sheet. See
// assets/sprites/README.md's backgrounds/ row. First entry in this file.

/** Tortuga's dockside tavern at dusk — the Black Pearl moored at the pier, "TAVERN" signboard lit,
 * castle silhouette across the water. Portrait-oriented (853x1844, ~0.46 aspect), close to a phone
 * screen's own proportions, so it reads as a real backdrop rather than a stretched/cropped square
 * illustration. First background art provided for ConversationBox — wired into the Debug screen's
 * "Conversation Box Preview" so Scally's tavern lines finally have the tavern behind them, matching
 * the original mockup this component was built from. */
export const SCENE_TORTUGA_TAVERN_DUSK = require('../../assets/backgrounds/harbour_tavern_dusk_1.png');

/** Tortuga Cove's harbor square at midday — market stalls, the Black Pearl at the pier, a busy
 * bustling hometown feel, contrasting the dusk/quiet tavern piece above. First delivery from
 * CONVERSATION_BACKGROUNDS_BRIEF.md's scene #1 (`tortuga_market_day_1`). Matches the brief's
 * 853x1844 canvas exactly, no resize needed. Note for future deliveries: the brief's composition
 * rule (keep the bottom ~35-40% simple, since that's where the parchment/portrait overlay sits) is
 * only loosely followed here — there's a fruit cart, barrels, and crates well into the lower third
 * — but it still reads fine in practice since none of that detail is bright/high-contrast enough to
 * fight the parchment for attention; see the item 122 GAME_DESIGN.md note for the actual in-app
 * check before deciding whether to send this one back for a redo. */
export const SCENE_TORTUGA_MARKET_DAY = require('../../assets/backgrounds/tortuga_market_day_1.png');

/** The Salty Parrot's own front door at night — scene #2 from the background brief
 * (`tortuga_tavern_night_1`), a closer match to the actual building than the wide dusk-harbor
 * piece above. Two versions came in for this scene: one at the exact 853x1844 target canvas but
 * with garbled sign text ("the The... The TAVERN"), and this one with a clean, correctly-lettered
 * "THE SALTY PARROT" sign but a wider 941x1672 (0.56) source aspect. Picked legibility over an
 * exact canvas match and re-cropped this file to 773x1672 (0.4623, effectively identical to the
 * 0.4626 target) — trimmed unevenly (67px off the left, 101px off the right) to cut the least
 * essential content: a sliver of a distant building on the left survives untouched, a bit of
 * background barrel/crate on the right got trimmed, and the sign, doorway, and windows that
 * actually carry the scene are untouched in the middle. */
export const SCENE_TORTUGA_TAVERN_NIGHT = require('../../assets/backgrounds/tortuga_tavern_night_1.png');
