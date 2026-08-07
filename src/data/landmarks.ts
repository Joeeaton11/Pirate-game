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
    // Full-town rebuild 2026-08-07 (item 52): a small plaza set back from the busiest stretch of
    // quay, near the harbor's administrative core (Harbourmaster's Office, Customs House).
    id: 'tortuga_town_square',
    islandId: 'tortuga_cove',
    offset: { x: 16, y: -118 },
    name: 'Basse-Terre Square',
    emoji: '⛲',
    description:
      "The heart of Basse-Terre — a well, a market stall or two, and enough loose talk to start three duels before noon.",
  },
  {
    // Full-town rebuild 2026-08-07 (item 52): the main pier off the busiest stretch of quay,
    // between the tavern district and the harbor's administrative core.
    id: 'tortuga_harbor_pier',
    islandId: 'tortuga_cove',
    offset: { x: 68, y: -205 },
    name: 'The Harbor Pier',
    emoji: '⚓',
    description: 'A weathered wooden pier where every manner of sloop, brigantine, and stolen merchantman ties up.',
  },
  {
    // Full-town rebuild 2026-08-07 (item 52): the west headland guarding the new horseshoe
    // harbor's mouth, opposite Fort de Rocher on the east headland.
    id: 'tortuga_lighthouse',
    islandId: 'tortuga_cove',
    offset: { x: -195, y: -330 },
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
    // Full-town rebuild 2026-08-07 (item 52): east side of the bay, near the Fishmonger's Stall
    // and Chapelle Notre-Dame.
    id: 'tortuga_bakery',
    islandId: 'tortuga_cove',
    offset: { x: 319, y: -241 },
    name: "The Baker's Oven",
    emoji: '🍞',
    description: "Bread at dawn, before the tavern crowd's even awake. Half the town lines up for it anyway.",
  },
  {
    // Full-town rebuild 2026-08-07 (item 52): the docks-and-careening quarter on the west side of
    // the bay, near the Cooper's Yard — rope-makers alongside the barrel-makers, matching a real
    // outlaw port's waterfront trades.
    id: 'tortuga_ropewalk',
    islandId: 'tortuga_cove',
    offset: { x: -280, y: -175 },
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
