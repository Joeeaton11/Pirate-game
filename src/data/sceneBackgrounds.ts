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

/** Interior of The Gaol — scene #3 from the background brief (`tortuga_gaol_interior_1`): a small
 * stone cell, barred window, wet flagstones, a manacle-and-chain bolted to the wall. Matches the
 * brief's 853x1844 canvas almost exactly (853x1843, 1px off) — no resize/crop needed, and the whole
 * lower half is already dark, plain wet stone, so it naturally satisfies the "keep the bottom
 * simple" composition rule without needing a check like the market/tavern-night pieces did. */
export const SCENE_TORTUGA_GAOL_INTERIOR = require('../../assets/backgrounds/tortuga_gaol_interior_1.png');

/** The Ruins of the Old Landing — scene #4 from the background brief
 * (`tortuga_old_landing_dusk_1`): a collapsed, overgrown dock being reclaimed by jungle, broken
 * pilings in shallow water, late-day gold-to-purple sky. Matches the brief's 853x1844 canvas
 * exactly, no crop/resize needed. */
export const SCENE_TORTUGA_OLD_LANDING = require('../../assets/backgrounds/tortuga_old_landing_dusk_1.png');

/** Cow Island Beach Camp — scene #5 from the background brief (`cow_island_beach_camp_1`): a
 * driftwood-and-canvas pirate camp on the grazing flats, cook-fire, grey overcast morning, real
 * cattle grazing distantly with pirate ships anchored offshore. Exact 853x1844 canvas match. */
export const SCENE_COW_ISLAND_BEACH_CAMP = require('../../assets/backgrounds/cow_island_beach_camp_1.png');

/** Cow Island's muster flats at sunset — scene #6 (`cow_island_muster_flats_1`): the open grazing
 * flats "where real pirate fleets once mustered before a raid," dramatic orange sunset, a pirate
 * flag and supply crates in the foreground. Exact 853x1844 canvas match. */
export const SCENE_COW_ISLAND_MUSTER_FLATS = require('../../assets/backgrounds/cow_island_muster_flats_1.png');

/** Redbeard Sully's fort — scene #7, the first Pirate Lord lair (`lord_redbeard_sully_fort_1`): a
 * rough palisade-and-timber stronghold, skull-and-crossbones banners, a stone keep behind the gate,
 * appropriately entry-level (not yet the grandest fort in the run, matching Sully being the first
 * lord fought). Exact 853x1844 canvas match, no text, no crop needed. Completes Cow Island's
 * three-scene set (beach camp, muster flats, this one). */
export const SCENE_LORD_REDBEARD_SULLY_FORT = require('../../assets/backgrounds/lord_redbeard_sully_fort_1.png');

/** New Providence's Harbor Trading Post — scene #8 (`new_providence_harbor_1`): a crowded
 * pirate-republic waterfront at midday, a tall ship at the dock, market stalls, a gallows-lantern
 * post fitting the "no crown, no law" flavor text. Source came in at a much wider 1023x1537 (0.67)
 * aspect than the 0.46 target — cropped to 711x1537 (0.4626, exact), trimmed unevenly (60px off the
 * left, 252px off the right) specifically to push a background tavern sign that read "SALTY PARROT"
 * off the right edge. That sign is Tortuga's own tavern name (see `SCENE_TORTUGA_TAVERN_NIGHT`) —
 * a real continuity conflict, not just a framing choice, since it would've read as the same tavern
 * existing on two different islands. The crop leaves only a bare unreadable sliver of signboard at
 * the border; everything else (ship, dock, market scene, the two figures talking) is intact. */
export const SCENE_NEW_PROVIDENCE_HARBOR = require('../../assets/backgrounds/new_providence_harbor_1.png');

/** The Signal Post — Tortuga's watchtower, home to lookout NPC Yann (see `buildings.ts`,
 * `tortuga_signal_post`). Not one of the 30 scenes in CONVERSATION_BACKGROUNDS_BRIEF.md — delivered
 * separately, but a strong enough real-location match (an actual named building with its own
 * lookout NPC, whose whole dialogue is about spotting sails) that it earned wiring in the same way.
 * A thatched lookout tower on a cliff over a wide bay, ship visible offshore, distant misty peaks —
 * exactly the vantage point Yann's dialogue describes. Exact 853x1844 canvas match, no text. */
export const SCENE_TORTUGA_SIGNAL_POST = require('../../assets/backgrounds/tortuga_signal_post_1.png');

/** The Careening Yard — scene #11, Roatán's shipyard (`roatan_careening_yard_1`): hulls tilted on
 * scaffolding for repair, a wrecked ship offshore, dramatic sunset. Sign reads "CAREENING YARD",
 * matching `buildings.ts`'s real building name exactly — no continuity issue like scene #8's. Exact
 * 853x1844 canvas match, no crop needed. */
export const SCENE_ROATAN_CAREENING_YARD = require('../../assets/backgrounds/roatan_careening_yard_1.png');

/** The Anchor & Forge — scene #12, Roatán's blacksmith at night (`roatan_forge_night_1`): open-air
 * forge glowing orange, anchors and chains mid-repair, a cannon nearby, moonlit sea in the
 * background. Sign reads "THE ANCHOR & FORGE," matching `buildings.ts`'s real `roatan` building
 * name exactly. Exact 853x1844 canvas match, no crop needed. */
export const SCENE_ROATAN_FORGE_NIGHT = require('../../assets/backgrounds/roatan_forge_night_1.png');

/** Captain Bellows' fort — scene #13, "Lord of Roatán" (`lord_captain_bellows_fort_1`): a full
 * cannon battery along a clifftop wall, a stone keep with a red banner, powder and armament crates
 * in the foreground. Bellows is a cannon specialist ("commands the careening yards of Roatán with
 * an iron gun crew" — see `pirateLords.ts`), so artillery is the visual focus, matching the brief.
 * Exact 853x1844 canvas match, no continuity-sensitive signage (just "POWDER"/"ARMAMENT" crate
 * labels), no crop needed. Completes Roatán's three-scene set. */
export const SCENE_LORD_CAPTAIN_BELLOWS_FORT = require('../../assets/backgrounds/lord_captain_bellows_fort_1.png');

/** The Cracked Hull — scene #9, New Providence's tavern porch at night (`new_providence_tavern_1`):
 * an open-air waterfront bar, patrons drinking at outdoor tables, a moored ship under a full moon.
 * Sign reads "THE CRACKED HULL," matching `buildings.ts`'s real `new_providence` building name
 * exactly. Exact 853x1844 canvas match, no crop needed. */
export const SCENE_NEW_PROVIDENCE_TAVERN = require('../../assets/backgrounds/new_providence_tavern_1.png');
