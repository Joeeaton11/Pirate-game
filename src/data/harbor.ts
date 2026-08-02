/** Pure decoration: a boardwalk reaching from the harbor out into open water, small boats moored
 * along it, and larger ships anchored further offshore. Same discipline as Scenery — zero
 * gameplay hook, no interaction, no collision — but deliberately placed OUTSIDE the island's land
 * polygon rather than inside it, since that's the whole point (a pier reaches into the sea, a
 * ship sits offshore). The player can never actually walk out onto a pier: movement/sailing state
 * is purely a function of the real island polygon (`islandAtPoint`), and a pier is never part of
 * that polygon — this is dressing to look at, not new ground to stand on. */
export interface PierSegment {
  islandId: string;
  from: { x: number; y: number }; // relative to island center, in world units
  to: { x: number; y: number };
}

export const PIERS: PierSegment[] = [
  // Main pier: starts at the Harbor Pier landmark, crosses the harbor-front shore, and reaches
  // well out into open water, forking partway to a second, shorter dock.
  { islandId: 'tortuga_cove', from: { x: 140, y: -290 }, to: { x: 165, y: -460 } },
  { islandId: 'tortuga_cove', from: { x: 165, y: -460 }, to: { x: 170, y: -620 } },
  { islandId: 'tortuga_cove', from: { x: 165, y: -460 }, to: { x: 90, y: -500 } },
  // Second pier, off the Fishing Dock — a working town has more than one place to tie up.
  { islandId: 'tortuga_cove', from: { x: 0, y: -280 }, to: { x: -40, y: -510 } },
];

export interface HarborBoat {
  islandId: string;
  offset: { x: number; y: number };
  emoji: string;
  fontSize?: number;
  rotationDeg?: number;
}

/** Small boats moored right at or along the piers themselves. */
export const DOCKED_BOATS: HarborBoat[] = [
  { islandId: 'tortuga_cove', offset: { x: 170, y: -620 }, emoji: '⛵', fontSize: 26, rotationDeg: -20 },
  { islandId: 'tortuga_cove', offset: { x: 150, y: -540 }, emoji: '🛶', fontSize: 20, rotationDeg: 40 },
  { islandId: 'tortuga_cove', offset: { x: 90, y: -500 }, emoji: '🚣', fontSize: 20, rotationDeg: -30 },
  { islandId: 'tortuga_cove', offset: { x: -40, y: -510 }, emoji: '⛵', fontSize: 26, rotationDeg: 15 },
];

/** Larger ships anchored further out, well clear of the piers — the harbor's real deep-water
 * traffic, purely a backdrop. */
export const OFFSHORE_SHIPS: HarborBoat[] = [
  { islandId: 'tortuga_cove', offset: { x: 250, y: -700 }, emoji: '🚢', fontSize: 34, rotationDeg: 10 },
  { islandId: 'tortuga_cove', offset: { x: 60, y: -740 }, emoji: '🛳️', fontSize: 36, rotationDeg: -15 },
  { islandId: 'tortuga_cove', offset: { x: -140, y: -660 }, emoji: '⛴️', fontSize: 32, rotationDeg: 25 },
  { islandId: 'tortuga_cove', offset: { x: 330, y: -620 }, emoji: '🚢', fontSize: 30, rotationDeg: -8 },
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
