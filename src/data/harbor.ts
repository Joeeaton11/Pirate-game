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
export const PIERS: PierSegment[] = [
  // Four piers off the quay, spread around the bay — the docks-and-careening quarter (west),
  // the harbor's administrative core, the tavern district, and the east side by the chapel.
  { islandId: 'tortuga_cove', from: { x: -146, y: -311 }, to: { x: -146, y: -440 } },
  { islandId: 'tortuga_cove', from: { x: -9, y: -210 }, to: { x: -9, y: -389 } },
  { islandId: 'tortuga_cove', from: { x: 68, y: -205 }, to: { x: 68, y: -342 } },
  { islandId: 'tortuga_cove', from: { x: 205, y: -281 }, to: { x: 205, y: -439 } },
];

/** A built stone quay along the natural curve of the new horseshoe bay's coastline — rendered
 * distinctly from the wooden piers (grey masonry, not brown planks) since a quay is a solid
 * embankment ships pull alongside, not a walkway reaching out to sea. Sits a few world units
 * inland of the true coastline so it always draws on solid ground. */
export const QUAYS: PierSegment[] = [
  { islandId: 'tortuga_cove', from: { x: -196, y: -391 }, to: { x: -146, y: -311 } },
  { islandId: 'tortuga_cove', from: { x: -146, y: -311 }, to: { x: -87, y: -250 } },
  { islandId: 'tortuga_cove', from: { x: -87, y: -250 }, to: { x: -9, y: -210 } },
  { islandId: 'tortuga_cove', from: { x: -9, y: -210 }, to: { x: 68, y: -205 } },
  { islandId: 'tortuga_cove', from: { x: 68, y: -205 }, to: { x: 146, y: -231 } },
  { islandId: 'tortuga_cove', from: { x: 146, y: -231 }, to: { x: 205, y: -281 } },
  { islandId: 'tortuga_cove', from: { x: 205, y: -281 }, to: { x: 255, y: -351 } },
];

/** An offshore breakwater arm sheltering the harbor basin, strung between the bay's two
 * headlands — pure backdrop, same "never touches the land polygon" rule as everything else here,
 * just further out to sea than the pier tips. */
export const BREAKWATER: PierSegment[] = [
  { islandId: 'tortuga_cove', from: { x: -237, y: -482 }, to: { x: 40, y: -388 } },
  { islandId: 'tortuga_cove', from: { x: 40, y: -388 }, to: { x: 305, y: -438 } },
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
  { islandId: 'tortuga_cove', offset: { x: -146, y: -440 }, emoji: '⛵', fontSize: 26, rotationDeg: -15 },
  { islandId: 'tortuga_cove', offset: { x: -9, y: -389 }, emoji: '🛶', fontSize: 20, rotationDeg: 20 },
  { islandId: 'tortuga_cove', offset: { x: 68, y: -342 }, emoji: '🚣', fontSize: 20, rotationDeg: -25 },
  { islandId: 'tortuga_cove', offset: { x: 205, y: -439 }, emoji: '⛵', fontSize: 26, rotationDeg: 10 },
  // Rowboats tied up directly against the quay wall, not off a pier tip.
  { islandId: 'tortuga_cove', offset: { x: -87, y: -280 }, emoji: '🚣', fontSize: 18, rotationDeg: 5 },
  { islandId: 'tortuga_cove', offset: { x: 146, y: -261 }, emoji: '🛶', fontSize: 18, rotationDeg: -10 },
];

/** Larger ships anchored further out, well clear of the piers — the harbor's real deep-water
 * traffic, purely a backdrop, roughly following the sheltering breakwater arc. */
export const OFFSHORE_SHIPS: HarborBoat[] = [
  { islandId: 'tortuga_cove', offset: { x: -144, y: -531 }, emoji: '🚢', fontSize: 32, rotationDeg: 10 },
  { islandId: 'tortuga_cove', offset: { x: -24, y: -524 }, emoji: '🛳️', fontSize: 34, rotationDeg: -12 },
  { islandId: 'tortuga_cove', offset: { x: 97, y: -515 }, emoji: '⛴️', fontSize: 30, rotationDeg: 18 },
  { islandId: 'tortuga_cove', offset: { x: 217, y: -503 }, emoji: '🚢', fontSize: 28, rotationDeg: -8 },
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
