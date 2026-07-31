/** Non-interactive scenery: fleshes out a town's street plan without needing a full walkable
 * interior for every structure. Walking near one shows a flavor-text toast — no navigation, no
 * gameplay hook. Historically grounded where possible; art is emoji/shape placeholder for now. */
export interface Landmark {
  id: string;
  islandId: string;
  offset: { x: number; y: number }; // relative to island center, in world units
  name: string;
  emoji: string;
  description: string;
}

export const LANDMARKS: Landmark[] = [
  {
    id: 'tortuga_fort_de_rocher',
    islandId: 'tortuga_cove',
    offset: { x: 100, y: -100 },
    name: 'Fort de Rocher',
    emoji: '🏰',
    description:
      "The real Le Vasseur built his fortress-mansion atop a thirty-foot rock and called it the Colombier. Forty guns cover the harbor, and the only way up is a staircase and a ladder he can pull up behind him.",
  },
  {
    id: 'tortuga_town_square',
    islandId: 'tortuga_cove',
    offset: { x: -20, y: 40 },
    name: 'Basse-Terre Square',
    emoji: '⛲',
    description:
      "The heart of Basse-Terre — a well, a market stall or two, and enough loose talk to start three duels before noon.",
  },
  {
    id: 'tortuga_chapel',
    islandId: 'tortuga_cove',
    offset: { x: 100, y: 65 },
    name: 'Chapelle Notre-Dame',
    emoji: '⛪',
    description: "A small wooden chapel, more shrine than church. Even outlaws cross themselves before a voyage.",
  },
  {
    id: 'tortuga_warehouse',
    islandId: 'tortuga_cove',
    offset: { x: -60, y: -105 },
    name: "Smugglers' Warehouse",
    emoji: '📦',
    description: "Crates of plundered sugar, tobacco, and gunpowder, waiting on a buyer who won't ask where they came from.",
  },
  {
    id: 'tortuga_harbor_pier',
    islandId: 'tortuga_cove',
    offset: { x: 70, y: -145 },
    name: 'The Harbor Pier',
    emoji: '⚓',
    description: 'A weathered wooden pier where every manner of sloop, brigantine, and stolen merchantman ties up.',
  },
];

export function landmarksForIsland(islandId: string): Landmark[] {
  return LANDMARKS.filter((l) => l.islandId === islandId);
}

export function landmarkWorldPosition(
  landmark: Landmark,
  islandPosition: { x: number; y: number }
): { x: number; y: number } {
  return { x: islandPosition.x + landmark.offset.x, y: islandPosition.y + landmark.offset.y };
}
