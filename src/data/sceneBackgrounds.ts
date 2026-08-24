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

/** Iron Jenny's Stronghold — scene #10, "Queen of the Republic" (`lord_iron_jenny_fort_1`): a tall
 * fortified watchtower on a cliff, red skull banners, a cannon and gate guards, sign reads "IRON
 * JENNY'S STRONGHOLD." Completes New Providence's three-scene set (harbor, Cracked Hull tavern,
 * this stronghold). Source came in at 852x1846 (0.4615) — essentially identical to the 0.4626
 * target (a fraction of a percent off), well within what `resizeMode="cover"` absorbs invisibly, so
 * no crop was needed. */
export const SCENE_LORD_IRON_JENNY_FORT = require('../../assets/backgrounds/lord_iron_jenny_fort_1.png');

/** Port Royal's flooded street — scene #14 (`port_royal_flooded_street_1`): a half-submerged
 * colonial street, buildings tilted into brackish water, a "PORT ROYAL" sign post in the
 * foreground. Exact 853x1844 canvas match, no crop needed. One thing worth flagging: the building
 * on the right is signed "CUSTOMS HOUSE," but the real Customs House in `buildings.ts`
 * (`tortuga_customs`) is on Tortuga Cove, not Port Royal — wiring this in under the generic
 * "flooded street" scene rather than as "Port Royal's Customs House" specifically, so nothing here
 * asserts a location that contradicts the real building data. Worth cropping or requesting a redo
 * if a genuine Port Royal Customs House scene is ever needed later. */
export const SCENE_PORT_ROYAL_FLOODED_STREET = require('../../assets/backgrounds/port_royal_flooded_street_1.png');

/** Iron Jenny's Stronghold, alternate angle — a second delivery for scene #10, framed from the
 * gate looking in rather than the first version's approach shot: "IRON JENNY'S STRONGHOLD" sign on
 * the palisade at left, open gate, a pirate captain walking through, fort and cannon battery behind,
 * ship offshore at sunset. User's call: keep both rather than replace — wired in as a second "BG:"
 * toggle rather than swapping out `SCENE_LORD_IRON_JENNY_FORT`. Source came in wide at 1024x1536
 * (0.667); cropped to 711x1536 (0.4629, matches target), trimmed 60px off the left and 253px off
 * the right — loses a torch-bearing guard on the right edge, keeps the sign, gate, ship, and fort
 * fully intact. */
export const SCENE_LORD_IRON_JENNY_FORT_ALT = require('../../assets/backgrounds/lord_iron_jenny_fort_2.png');

/** The Careening Yard, alternate angle #2 — sunset, wider establishing shot: a stone watchtower and
 * waterfall visible on the headland behind the yard, a parrot perched on the "THE CAREENING YARD"
 * sign, an open-sided workshop under the tiled roof, ships and dock in the foreground. Note on the
 * underlying place name: `SCENE_ROATAN_CAREENING_YARD` above is exported as Roatán's shipyard (per
 * `CONVERSATION_BACKGROUNDS_BRIEF.md`'s scene #11), but the real building "The Careening Yard" in
 * `buildings.ts` (`new_providence_careening_yard`) is actually sited on New Providence, not Roatán —
 * a pre-existing mismatch between the brief and the shipped location data, not something introduced
 * by this delivery. Filed as a second alt angle of the same export slot rather than resolving that
 * conflict unilaterally. Exact 853x1844 canvas match, no crop needed. */
export const SCENE_ROATAN_CAREENING_YARD_ALT2 = require('../../assets/backgrounds/roatan_careening_yard_2.png');

/** The Careening Yard, alternate angle #3 — bright midday version of the same wider establishing
 * shot as ALT2 above (same watchtower/waterfall headland, parrot on the sign), just a different time
 * of day. Same New Providence/Roatán naming note applies. Exact 853x1844 canvas match, no crop
 * needed. */
export const SCENE_ROATAN_CAREENING_YARD_ALT3 = require('../../assets/backgrounds/roatan_careening_yard_3.png');

/** Generic tavern interior — not tied to a specific named tavern (no identifying sign, just a
 * "GOOD ALE GOOD RUM GOOD CREW" chalkboard and a generic WANTED poster), unlike every other tavern
 * scene in this file which are all exteriors. A flexible fallback for indoor tavern conversations
 * the same way the brief's still-undelivered `generic_pier_night_1` scene (#30) is meant to be a
 * fallback for waterfront ones. Exact 853x1844 canvas match, no crop needed. */
export const SCENE_TAVERN_INTERIOR_GENERIC = require('../../assets/backgrounds/tavern_interior_generic_1.png');

/** Raven's Watch — a lookout/hideout compound (watchtower, dock with a cargo hoist, signposts
 * reading "LOOKOUT / CANNON DECK / HIDEOUT") that doesn't correspond to any named island, building,
 * or landmark in `islands.ts`/`buildings.ts`/`landmarks.ts` — not part of the original 30-scene
 * brief either. Filed as an unassigned generic scene per the user's call, the same way
 * the tavern interior above is a flexible fallback rather than tied to one real place. Source
 * came in with a dark placeholder UI panel baked into the bottom ~12% of the canvas (a drawn box
 * with a beveled border sitting right where the real ConversationBox parchment would render on
 * top of it) — cropped off before filing rather than left in, so nothing here doubles up with the
 * actual in-game dialogue box. Cropped to 853x1655 (0.5154 aspect, wider than the 0.4626 target);
 * left uncorrected since `resizeMode="cover"` just crops a bit more off the sides in-game, same as
 * every other scene whose source aspect didn't land exactly on target. */
export const SCENE_RAVENS_WATCH_LOOKOUT = require('../../assets/backgrounds/ravens_watch_lookout_1.png');

/** Skull Cay Outpost — a cliffside pirate outpost (watchtower above a waterfall, a beach house
 * compound, a dock) with the same status as Raven's Watch above: no matching entry anywhere in the
 * game's location data, not part of the original brief, filed as an unassigned generic scene per
 * the user's call. Same defect as Raven's Watch — a dark placeholder UI panel baked into the bottom
 * of the canvas, this one a semi-transparent overlay rather than a solid fill — cropped off before
 * filing for the same reason. Cropped to 853x1620 (0.5265 aspect); left uncorrected for the same
 * `resizeMode="cover"` reason as above. */
export const SCENE_SKULL_CAY_OUTPOST = require('../../assets/backgrounds/skull_cay_outpost_1.png');

/** The Black Pearl's captain's quarters — scene #24 from the background brief
 * (`black_pearl_captains_quarters_1`): a chart table with a compass, quill, and spyglass, a globe,
 * a four-poster bed, crossed cutlasses and a pirate coat on the wall, a skull-and-crossbones rug,
 * and twin arched windows looking out on the anchored ship and a cove. The brief calls for this
 * scene "at night... warm low light through a stern window looking out on dark water" — this
 * delivery came in as bright daytime instead (blue sky, sunlit cove through the windows). Filed
 * under the same export anyway since every other identifying detail (chart table, globe, crossed
 * cutlasses, coat-and-hat display, skull rug) matches the brief's description exactly — the same
 * "accept a reasonable brief deviation rather than reject the delivery" call made for scene #1's
 * daytime market contrasting the brief's original dusk piece. Exact 853x1844 canvas match, no crop
 * needed. */
export const SCENE_BLACK_PEARL_CAPTAINS_QUARTERS = require('../../assets/backgrounds/black_pearl_captains_quarters_1.png');

/** The Smugglers' Grotto — scene #28 from the background brief (`smugglers_grotto_1`): a hidden sea
 * cave interior, contraband crates and treasure chests stacked on wet rock, lanterns, a moored
 * rowboat, and a shaft of daylight through the cave mouth framing the anchored ship outside — matches
 * the brief's description closely. Source came in at 864x1821 (0.4746 aspect) against the 0.4626
 * target, a similar small mismatch to Iron Jenny's fort (0.4615) — left uncropped, absorbed by
 * `resizeMode="cover"`. */
export const SCENE_SMUGGLERS_GROTTO = require('../../assets/backgrounds/smugglers_grotto_1.png');

/** A stone fort courtyard by day — cannons, a target-practice board, a straw training dummy, gun
 * racks, and skull-and-crossbones banners on a castle keep. Doesn't match any of the three
 * still-undelivered Pirate Lord lairs by description (Marietta Graves' flooded/cursed ruin, Ezra
 * Vane's whirlpool fortress, Blackbeard's driftwood storm-camp — none of which read as a sunlit
 * stone-castle training yard), and isn't part of the original 30-scene brief. Filed as an
 * unassigned generic fallback per the same standing the user gave for Raven's Watch/Skull Cay
 * Outpost in the prior delivery — usable for any conversation set at a fortified training ground
 * without asserting a specific Lord's identity. Exact 853x1844 canvas match, no crop needed. */
export const SCENE_FORT_COURTYARD_GENERIC = require('../../assets/backgrounds/fort_courtyard_generic_1.png');

/** A castaway beach camp, daytime — a shaded tent/hammock camp under palms, a driftwood-strewn
 * beach, a treasure chest, calm turquoise water, and the anchored ship offshore. Distinct from
 * `SCENE_COW_ISLAND_BEACH_CAMP` (which specifically shows grazing cattle per the brief) — no
 * cattle here, and no named-location signage to tie it to a specific island. Filed as an unassigned
 * generic fallback, same standing as the fort courtyard above. Exact 853x1844 canvas match, no crop
 * needed. */
export const SCENE_CASTAWAY_CAMP_BEACH_DAY = require('../../assets/backgrounds/castaway_camp_beach_1.png');

/** The same castaway beach camp, golden-hour/dusk version — same tent/driftwood/treasure-chest
 * composition as the day version above, matching lighting pair the same way the Careening Yard got
 * a dusk/midday pair in the prior delivery. Same generic-fallback standing. Exact 853x1844 canvas
 * match, no crop needed. */
export const SCENE_CASTAWAY_CAMP_BEACH_DUSK = require('../../assets/backgrounds/castaway_camp_beach_2.png');

/** The High Woods — scene #29 from the background brief (`high_woods_jungle_1`): a dense jungle
 * path under thick canopy, dappled green-gold light, a skull-marked boundary stone, a rocky peak
 * and the sea visible through a gap in the trees ahead — matches the brief's description closely
 * and the game's existing "jungle" encounter-backdrop category (`tortuga_high_woods` landmark).
 * Source came in at 864x1821 (0.4746 aspect vs 0.4626 target), the same small mismatch several
 * other scenes in this file have absorbed via `resizeMode="cover"` — left uncropped. */
export const SCENE_HIGH_WOODS_JUNGLE = require('../../assets/backgrounds/high_woods_jungle_1.png');

/** A second generic tavern interior — a rum-and-grog bar room ("TOMMY'S RUM" chalkboard, a
 * "NO CREDIT — NO QUARTER" sign, a doorway open on the beach and a moored ship). Like the first
 * generic tavern interior, no signage ties it to a specific named tavern in `buildings.ts` — filed
 * as a second option in the same unassigned-fallback slot rather than forcing it onto a real
 * location. Exact-enough 863x1822 canvas match (0.4737 aspect), no crop needed. */
export const SCENE_TAVERN_INTERIOR_GENERIC_2 = require('../../assets/backgrounds/tavern_interior_generic_2.png');

/** Basse-Terre Square — Tortuga's own town square landmark (`tortuga_town_square` in
 * `landmarks.ts`), not part of the original 30-scene brief but a strong enough real-location match
 * to earn wiring anyway, the same call made for `SCENE_TORTUGA_SIGNAL_POST`. The landmark's own
 * description — "a well, a market stall or two" — matches this scene almost exactly: a central
 * stone fountain, a market stall under a red awning, a tavern building, and a castle-gate archway
 * looking out to the sea, all in bright daylight. Ruled out `new_providence_republic_square` as an
 * alternative reading — that landmark's description is about lawless captains' councils with no
 * fountain/well detail at all, a much weaker match. Source came in wide at 1023x1537 (0.6656
 * aspect) — center-cropped to 711x1537 (0.4626, exact target), 156px off each side, keeping the
 * fountain centered and both flanking buildings intact; only the far foreground crates/anchor prop
 * on the right edge lost a sliver. */
export const SCENE_TORTUGA_TOWN_SQUARE = require('../../assets/backgrounds/tortuga_town_square_1.png');

/** The Black Pearl's captain's quarters, alternate angle — a different composition of the same
 * scene #24 concept: a writing desk with a chart, quill, and lit lantern, a telescope on a tripod,
 * red curtains framing a window on the anchored ship, crossed cutlasses, and a skull-motif rug —
 * distinct furniture arrangement from `SCENE_BLACK_PEARL_CAPTAINS_QUARTERS` (that one has a bed and
 * a globe; this one doesn't), same "captain's cabin" identity. Filed as a second alt angle, the
 * same pattern as the Careening Yard's and Iron Jenny's fort's alts. 864x1821 source, same small
 * aspect mismatch as several other scenes, left uncropped. */
export const SCENE_BLACK_PEARL_CAPTAINS_QUARTERS_ALT2 = require('../../assets/backgrounds/black_pearl_captains_quarters_2.png');
