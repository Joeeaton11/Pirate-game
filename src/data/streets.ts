/** Visual-only street plan connecting a town's buildings/landmarks — no gameplay logic, purely
 * so a settlement reads as an actual laid-out town instead of markers scattered on grass. */
export interface StreetSegment {
  islandId: string;
  from: { x: number; y: number }; // relative to island center, in world units
  to: { x: number; y: number };
  /** 'main' = a proper town street; 'path' = a rough/treacherous route (rendered thinner, dashed). */
  style: 'main' | 'path';
}

export const STREETS: StreetSegment[] = [
  // Basse-Terre Square as the town's central hub, radiating out to every building/landmark.
  { islandId: 'tortuga_cove', from: { x: -20, y: 40 }, to: { x: -90, y: -40 }, style: 'main' }, // -> The Salty Parrot
  { islandId: 'tortuga_cove', from: { x: -20, y: 40 }, to: { x: 90, y: -30 }, style: 'main' }, // -> Harbor Trading Post
  { islandId: 'tortuga_cove', from: { x: -20, y: 40 }, to: { x: -130, y: 120 }, style: 'main' }, // -> Fishmonger's Stall
  { islandId: 'tortuga_cove', from: { x: -20, y: 40 }, to: { x: 100, y: 65 }, style: 'main' }, // -> Chapelle Notre-Dame
  { islandId: 'tortuga_cove', from: { x: -20, y: 40 }, to: { x: 60, y: 130 }, style: 'main' }, // -> The Locked Ward
  { islandId: 'tortuga_cove', from: { x: -20, y: 40 }, to: { x: 0, y: 130 }, style: 'main' }, // -> The Bounty Board
  // Harbor road, linking the trading post down to the docks.
  { islandId: 'tortuga_cove', from: { x: 90, y: -30 }, to: { x: 0, y: -140 }, style: 'main' }, // -> Fishing Dock
  { islandId: 'tortuga_cove', from: { x: 0, y: -140 }, to: { x: 70, y: -145 }, style: 'main' }, // -> Harbor Pier
  { islandId: 'tortuga_cove', from: { x: 0, y: -140 }, to: { x: -60, y: -105 }, style: 'main' }, // -> Warehouse
  // Fort de Rocher's real access was a rock-cut staircase and a pull-up ladder — a treacherous
  // route rather than a proper street.
  { islandId: 'tortuga_cove', from: { x: 70, y: -145 }, to: { x: 100, y: -100 }, style: 'path' }, // -> Fort de Rocher
  // Rural outskirts, reached by coastal trail / farm track rather than a paved town street.
  { islandId: 'tortuga_cove', from: { x: -20, y: 40 }, to: { x: -190, y: 10 }, style: 'path' }, // -> West Point Shack
  { islandId: 'tortuga_cove', from: { x: 100, y: 65 }, to: { x: 140, y: 110 }, style: 'path' }, // -> La Ringot Fields
];

export function streetsForIsland(islandId: string): StreetSegment[] {
  return STREETS.filter((s) => s.islandId === islandId);
}
