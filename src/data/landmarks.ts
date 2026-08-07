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
    // Moved 2026-08-07 from (-40, 80), near the island's vertical center, to (-40, -160), just
    // south of the harbor buildings — see streets.ts and houses.ts for the matching street/house
    // moves (item 50 in GAME_DESIGN.md).
    id: 'tortuga_town_square',
    islandId: 'tortuga_cove',
    offset: { x: -40, y: -160 },
    name: 'Basse-Terre Square',
    emoji: '⛲',
    description:
      "The heart of Basse-Terre — a well, a market stall or two, and enough loose talk to start three duels before noon.",
  },
  {
    id: 'tortuga_harbor_pier',
    islandId: 'tortuga_cove',
    offset: { x: 140, y: -290 },
    name: 'The Harbor Pier',
    emoji: '⚓',
    description: 'A weathered wooden pier where every manner of sloop, brigantine, and stolen merchantman ties up.',
  },
  {
    // Sits on the small headland the coastline itself forms right here — found the same way as
    // the quay and every pier tip, by sweeping rays out from land until they cross into open
    // water; this is the one point along the whole harbor front where that crossing happens
    // furthest out; a real lighthouse would stand exactly there.
    id: 'tortuga_lighthouse',
    islandId: 'tortuga_cove',
    offset: { x: 60, y: -458 },
    name: 'The Lighthouse',
    emoji: '🗼',
    description: "Lit every night without fail — the one soul in Tortuga everyone agrees is worth paying, raid or no raid.",
  },
  {
    id: 'tortuga_la_ringot_fields',
    islandId: 'tortuga_cove',
    offset: { x: 280, y: 220 },
    name: 'La Ringot Fields',
    emoji: '🌾',
    description:
      "Real tobacco fields once grew on Tortuga's south side, in a district the buccaneers called La Ringot. Whatever coin doesn't come from plunder comes from here.",
  },
  {
    id: 'tortuga_bakery',
    islandId: 'tortuga_cove',
    offset: { x: 70, y: 140 },
    name: "The Baker's Oven",
    emoji: '🍞',
    description: "Bread at dawn, before the tavern crowd's even awake. Half the town lines up for it anyway.",
  },
  {
    id: 'tortuga_ropewalk',
    islandId: 'tortuga_cove',
    offset: { x: -140, y: 320 },
    name: 'The Ropewalk',
    emoji: '🪢',
    description: "A long, low shed where hemp gets twisted into rigging, coil by coil. No ship sails without what's made here.",
  },
  {
    id: 'tortuga_high_woods',
    islandId: 'tortuga_cove',
    offset: { x: 436, y: -40 },
    name: 'The High Woods',
    emoji: '🌲',
    description:
      "The real buccaneers took their name from the boucan — a wooden frame for smoking wild boar and cattle over a slow fire — and this ridge is where the smoke still used to rise, before the harbor town grew big enough to feed itself another way.",
  },
  {
    id: 'tortuga_old_landing',
    islandId: 'tortuga_cove',
    offset: { x: -70, y: 416 },
    name: 'Ruins of the Old Landing',
    emoji: '🔥',
    description:
      "The first French settlement here wasn't at the harbor — it was here, until the Spanish burned it out in 1635, and again in 1638. What's left is scorched foundations and a lesson nobody who stayed ever forgot.",
  },
  {
    id: 'tortuga_forgotten_graves',
    islandId: 'tortuga_cove',
    offset: { x: 120, y: 410 },
    name: 'The Forgotten Graves',
    emoji: '⚰️',
    description:
      "No names, no dates — just a few dozen mounds gone soft with moss, from whichever raid or fever thinned the settlement that year. Someone still leaves rum bottles here. Nobody's ever seen who.",
  },
  {
    id: 'new_providence_republic_square',
    islandId: 'new_providence',
    offset: { x: 0, y: -20 },
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
