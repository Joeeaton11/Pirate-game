/** Pure decoration: a boardwalk reaching from the harbor out into open water, small boats moored
 * along it, and larger ships anchored further offshore. Same discipline as Scenery — zero
 * gameplay hook, no interaction, no collision — but deliberately placed OUTSIDE the island's land
 * polygon rather than inside it, since that's the whole point (a pier reaches into the sea, a
 * ship sits offshore). The player can never actually walk out onto a pier: movement/sailing state
 * is purely a function of the real island polygon (`islandAtPoint`), and a pier is never part of
 * that polygon — this is dressing to look at, not new ground to stand on.
 *
 * Full-town rebuild 2026-08-07 (item 52): Tortuga's harbor front was rebuilt from scratch around
 * the new horseshoe bay (see islands.ts) — every quay/pier/breakwater/boat below follows the new
 * coastline instead of the old peninsula-tip coast. Generated with a Python/Shapely script:
 * QUAYS trace a few units inland of the actual new bay coastline (the same "sits on solid ground"
 * rule as before); PIERS reach outward from points along the quay, away from the polygon centroid,
 * into open water; BREAKWATER arcs between the two headlands, sheltering the bay mouth; boats sit
 * at pier tips and scattered further out. Verified: every quay point falls inside TORTUGA_SHAPE,
 * every pier tip and the whole breakwater falls outside it. */
export interface PierSegment {
  islandId: string;
  from: { x: number; y: number }; // relative to island center, in world units
  to: { x: number; y: number };
  /** Drawn by the town scene (src/town) instead of the generic SVG pier/quay stroke. */
  townDrawn?: boolean;
}

// Straightened to due-vertical 2026-08-14, per direct feedback ("the jetty's need to also be
// vertical and horizontal not diagonal") — each pier's original diagonal `to` point had real
// lateral drift (up to 86 units sideways over its length), left over from the Shapely-generated
// harbor rebuild that only checked "does the tip land in open water," never "is this axis-aligned."
// Since every pier already reaches outward from its quay attachment more north than sideways (the
// bay opens north), snapping was a one-line fix per pier: keep `from` (the quay attachment, which
// has to stay put) and set `to.x = from.x`, keeping the original `to.y` so the pier's length is
// unchanged — turns every pier into a straight vertical spur. Re-verified with the same
// point-in-polygon check the original rebuild used: all 4 new tips still fall outside
// TORTUGA_SHAPE. DOCKED_BOATS' first 4 entries and BLACK_PEARL_START_OFFSET (blackPearl.ts) are
// anchored to these tips and were moved to match.
//
// Given bends 2026-08-14, per direct follow-up: "The jetty's we designed were more than just one
// straight line. One wrapped around for example. Change the bits of the jetty that aren't
// horizontal or vertical to horizontal and vertical." Every pier before this was a single straight
// spur — the "wrapped around" shape the reference sheets actually showed (a T-head/L-head where
// the dock turns a corner at the tip, letting boats moor on more than one face) had been dropped
// entirely when the piers were straightened above, not carried forward as a bend. Restored it here
// as extra `PierSegment` entries sharing a tip with their parent spur — each `PIERS` "pier" is now
// however many axis-aligned segments it takes to draw its shape, not necessarily one. Every new
// segment is still purely horizontal or vertical (no diagonal reintroduced) and every new endpoint
// was re-verified with the same point-in-polygon check against TORTUGA_SHAPE as the spurs above —
// all land outside the island, same invariant.
export const PIERS: PierSegment[] = [
  // Four piers off the quay, spread around the bay — the docks-and-careening quarter (west),
  // the harbor's administrative core, the tavern district, and the east side by the chapel.
  { islandId: 'tortuga_cove', from: { x: -168, y: -359 }, to: { x: -168, y: -507 } },
  // T-head on the west pier (docks-and-careening quarter): the spur above ends at (-146,-440),
  // and this pier turns a full corner in both directions there — a real "wraps around" jetty,
  // not just a longer straight run. Both arms are pure horizontal, meeting the vertical spur at a
  // right angle.
  { islandId: 'tortuga_cove', from: { x: -168, y: -507 }, to: { x: -238, y: -507 } },
  { islandId: 'tortuga_cove', from: { x: -168, y: -507 }, to: { x: -99, y: -507 } },
  // Town harbour piers (2026-11-14 town-centre rebuild): walkable boardwalks drawn by the town
  // scene (src/town/tortugaTownLayout.ts builds its pier art from these same segments, so the
  // walkable line and the planks can never drift apart). Walk off a pier's open end to set sail.
  // Long Pier (T-head) off the main quay:
  { islandId: 'tortuga_cove', from: { x: -10, y: -292 }, to: { x: -10, y: -392 }, townDrawn: true },
  { islandId: 'tortuga_cove', from: { x: -10, y: -392 }, to: { x: -48, y: -392 }, townDrawn: true },
  { islandId: 'tortuga_cove', from: { x: -10, y: -392 }, to: { x: 28, y: -392 }, townDrawn: true },
  // Customs Pier (L-head east):
  { islandId: 'tortuga_cove', from: { x: 78, y: -292 }, to: { x: 78, y: -356 }, townDrawn: true },
  { islandId: 'tortuga_cove', from: { x: 78, y: -356 }, to: { x: 122, y: -356 }, townDrawn: true },
  // Fish Pier off the fish quay (L-head east):
  { islandId: 'tortuga_cove', from: { x: 236, y: -372 }, to: { x: 236, y: -444 }, townDrawn: true },
  { islandId: 'tortuga_cove', from: { x: 236, y: -444 }, to: { x: 276, y: -444 }, townDrawn: true },
  // Missed docks, added 2026-09-12 (GAME_DESIGN.md item 218) — direct feedback: "you've missed
  // the north and south docks." Two real structures the reference blueprint shows that the
  // original Shapely rebuild never picked up: a long boardwalk climbing the west headland up
  // toward the Lighthouse (distinct from pier 1 — it starts on the headland's own coastal path,
  // not the quay, and reaches a good deal further north), and the "Old Dock / Old Landing"
  // jetty at the island's south tip, which had no pier/quay data at all before this, only the
  // one building marker. Both traced the same way as the coastline itself: isolate the
  // structure's own warm-wood pixels against the water, follow its centerline out from shore.
  { islandId: 'tortuga_cove', from: { x: -283, y: -321 }, to: { x: -255, y: -425 } },
  { islandId: 'tortuga_cove', from: { x: -255, y: -425 }, to: { x: -209, y: -512 } },
  // Old Dock / Old Landing: a bent jetty reaching south off the ruins, with its own short
  // crossbar near the tip (same "wraps around" convention as the T/L-heads above).
  { islandId: 'tortuga_cove', from: { x: 147, y: 402 }, to: { x: 179, y: 454 } },
  { islandId: 'tortuga_cove', from: { x: 179, y: 454 }, to: { x: 165, y: 509 } },
  { islandId: 'tortuga_cove', from: { x: 179, y: 454 }, to: { x: 208, y: 472 } },
];

/** A built stone quay along the natural curve of the new horseshoe bay's coastline — rendered
 * distinctly from the wooden piers (grey masonry, not brown planks) since a quay is a solid
 * embankment ships pull alongside, not a walkway reaching out to sea. Sits a few world units
 * inland of the true coastline so it always draws on solid ground. */
export const QUAYS: PierSegment[] = [
  // Town wharf (2026-11-14): keeps the whole plank wharf walkable where the coast dips inland.
  { islandId: 'tortuga_cove', from: { x: -73, y: -298 }, to: { x: 196, y: -298 }, townDrawn: true },
  { islandId: 'tortuga_cove', from: { x: 196, y: -340 }, to: { x: 258, y: -340 }, townDrawn: true },
  // Tortuga Cove art pass v2 (2026-11-14): quay walls retraced to match the painted backdrop
  // (tortugaV2.ts) — 10 world units inland of the coastline through the harbour mouth.
  { islandId: 'tortuga_cove', from: { x: -246, y: -435.5 }, to: { x: -253.5, y: -319.5 } },
  { islandId: 'tortuga_cove', from: { x: -253.5, y: -319.5 }, to: { x: -170.5, y: -223.5 } },
  { islandId: 'tortuga_cove', from: { x: -170.5, y: -223.5 }, to: { x: -105.5, y: -229.5 } },
  { islandId: 'tortuga_cove', from: { x: -105.5, y: -229.5 }, to: { x: -80.5, y: -259.5 }, townDrawn: true },
  { islandId: 'tortuga_cove', from: { x: -80.5, y: -259.5 }, to: { x: -135, y: -335 }, townDrawn: true },
  { islandId: 'tortuga_cove', from: { x: -135, y: -335 }, to: { x: -102, y: -359.5 } },
  { islandId: 'tortuga_cove', from: { x: -102, y: -359.5 }, to: { x: -124, y: -427.5 } },
  { islandId: 'tortuga_cove', from: { x: -124, y: -427.5 }, to: { x: -98.5, y: -454 } },
  { islandId: 'tortuga_cove', from: { x: -98.5, y: -454 }, to: { x: -81, y: -441 } },
  { islandId: 'tortuga_cove', from: { x: -81, y: -441 }, to: { x: -77, y: -320 } },
  { islandId: 'tortuga_cove', from: { x: -77, y: -320 }, to: { x: 30.5, y: -293 } },
  { islandId: 'tortuga_cove', from: { x: 30.5, y: -293 }, to: { x: 60.5, y: -306 } },
  { islandId: 'tortuga_cove', from: { x: 60.5, y: -306 }, to: { x: 91, y: -275 } },
  { islandId: 'tortuga_cove', from: { x: 91, y: -275 }, to: { x: 193, y: -307 } },
  { islandId: 'tortuga_cove', from: { x: 193, y: -307 }, to: { x: 265, y: -406 } },
];

/** An offshore breakwater arm sheltering the harbor basin, strung between the bay's two
 * headlands — pure backdrop, same "never touches the land polygon" rule as everything else here,
 * just further out to sea than the pier tips. */
export const BREAKWATER: PierSegment[] = [
  { islandId: 'tortuga_cove', from: { x: -273, y: -555 }, to: { x: 46, y: -447 } },
  { islandId: 'tortuga_cove', from: { x: 46, y: -447 }, to: { x: 351, y: -505 } },
];

export interface HarborBoat {
  islandId: string;
  offset: { x: number; y: number };
  emoji: string;
  fontSize?: number;
  rotationDeg?: number;
}

/** Small boats moored right at or along the piers and quay themselves — one per pier tip.
 * First 4 offsets moved 2026-08-14 to match PIERS' new straightened (due-vertical) tips. */
export const DOCKED_BOATS: HarborBoat[] = [
  { islandId: 'tortuga_cove', offset: { x: -168, y: -507 }, emoji: '⛵', fontSize: 26, rotationDeg: -15 },
  { islandId: 'tortuga_cove', offset: { x: -10, y: -448 }, emoji: '🛶', fontSize: 20, rotationDeg: 20 },
  { islandId: 'tortuga_cove', offset: { x: 78, y: -394 }, emoji: '🚣', fontSize: 20, rotationDeg: -25 },
  { islandId: 'tortuga_cove', offset: { x: 236, y: -505 }, emoji: '⛵', fontSize: 26, rotationDeg: 10 },
  // Rowboats tied up directly against the quay wall, not off a pier tip.
  { islandId: 'tortuga_cove', offset: { x: -100, y: -323 }, emoji: '🚣', fontSize: 18, rotationDeg: 5 },
  { islandId: 'tortuga_cove', offset: { x: 168, y: -301 }, emoji: '🛶', fontSize: 18, rotationDeg: -10 },
  // One at each of the two "missed docks" added 2026-09-12 (item 218) — same convention as the
  // original four, a boat at the tip.
  { islandId: 'tortuga_cove', offset: { x: -209, y: -512 }, emoji: '🛶', fontSize: 20, rotationDeg: -30 },
  { islandId: 'tortuga_cove', offset: { x: 165, y: 509 }, emoji: '🚣', fontSize: 18, rotationDeg: 15 },
];

/** Larger ships anchored further out, well clear of the piers — the harbor's real deep-water
 * traffic, purely a backdrop, roughly following the sheltering breakwater arc. */
export const OFFSHORE_SHIPS: HarborBoat[] = [
  { islandId: 'tortuga_cove', offset: { x: -166, y: -612 }, emoji: '🚢', fontSize: 32, rotationDeg: 10 },
  { islandId: 'tortuga_cove', offset: { x: -27, y: -603 }, emoji: '🛳️', fontSize: 34, rotationDeg: -12 },
  { islandId: 'tortuga_cove', offset: { x: 112, y: -593 }, emoji: '⛴️', fontSize: 30, rotationDeg: 18 },
  { islandId: 'tortuga_cove', offset: { x: 250, y: -580 }, emoji: '🚢', fontSize: 28, rotationDeg: -8 },
];

export function piersForIsland(islandId: string): PierSegment[] {
  return PIERS.filter((p) => p.islandId === islandId);
}

export function harborBoatWorldPosition(
  boat: HarborBoat,
  islandPosition: { x: number; y: number }
): { x: number; y: number } {
  return { x: islandPosition.x + boat.offset.x, y: islandPosition.y + boat.offset.y };
}
