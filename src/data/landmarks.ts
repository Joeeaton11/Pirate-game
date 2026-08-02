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
    id: 'tortuga_town_square',
    islandId: 'tortuga_cove',
    offset: { x: -20, y: 40 },
    name: 'Basse-Terre Square',
    emoji: '⛲',
    description:
      "The heart of Basse-Terre — a well, a market stall or two, and enough loose talk to start three duels before noon.",
  },
  {
    id: 'tortuga_harbor_pier',
    islandId: 'tortuga_cove',
    offset: { x: 70, y: -145 },
    name: 'The Harbor Pier',
    emoji: '⚓',
    description: 'A weathered wooden pier where every manner of sloop, brigantine, and stolen merchantman ties up.',
  },
  {
    id: 'tortuga_la_ringot_fields',
    islandId: 'tortuga_cove',
    offset: { x: 140, y: 110 },
    name: 'La Ringot Fields',
    emoji: '🌾',
    description:
      "Real tobacco fields once grew on Tortuga's south side, in a district the buccaneers called La Ringot. Whatever coin doesn't come from plunder comes from here.",
  },
  {
    id: 'tortuga_bakery',
    islandId: 'tortuga_cove',
    offset: { x: 35, y: 70 },
    name: "The Baker's Oven",
    emoji: '🍞',
    description: "Bread at dawn, before the tavern crowd's even awake. Half the town lines up for it anyway.",
  },
  {
    id: 'tortuga_ropewalk',
    islandId: 'tortuga_cove',
    offset: { x: -70, y: 160 },
    name: 'The Ropewalk',
    emoji: '🪢',
    description: "A long, low shed where hemp gets twisted into rigging, coil by coil. No ship sails without what's made here.",
  },
  {
    id: 'new_providence_republic_square',
    islandId: 'new_providence',
    offset: { x: 0, y: -10 },
    name: 'Republic Square',
    emoji: '🏴‍☠️',
    description:
      "No governor, no crown, no court — just captains hashing out plunder shares by shouted vote. The closest thing this town has to a town hall.",
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
