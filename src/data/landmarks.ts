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
  // Real map art (2026-08-13 art pass), for the handful of landmarks with a genuine match in
  // worldSprites.ts — everything else keeps rendering its emoji marker as before.
  sprite?: { category: 'building' | 'nature' | 'prop'; id: string };
}

export const LANDMARKS: Landmark[] = [
  {
    // Full-town rebuild 2026-08-07 (item 52): a small plaza set back from the busiest stretch of
    // quay, near the harbor's administrative core (Harbourmaster's Office, Customs House).
    id: 'tortuga_town_square',
    islandId: 'tortuga_cove',
    offset: { x: 0, y: -180 },
    name: 'Basse-Terre Square',
    emoji: '⛲',
    description:
      "The heart of Basse-Terre — a well, a market stall or two, and enough loose talk to start three duels before noon.",
    sprite: { category: 'prop', id: 'fountain' },
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
    offset: { x: -204, y: -372 },
    name: 'The Lighthouse',
    emoji: '🗼',
    description: "Lit every night without fail — the one soul in Tortuga everyone agrees is worth paying, raid or no raid.",
    sprite: { category: 'building', id: 'lighthouse' },
  },
  {
    id: 'tortuga_la_ringot_fields',
    islandId: 'tortuga_cove',
    offset: { x: 288, y: 216 },
    name: 'La Ringot Fields',
    emoji: '🌾',
    description:
      "Real tobacco fields once grew on Tortuga's south side, in a district the buccaneers called La Ringot. Whatever coin doesn't come from plunder comes from here.",
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
    // Blueprint Sheet 4 wild card, 2026-08-13: a broken hull on the reef off the west cape, near
    // El Fuerte Viejo and West Point Beach. Purely invented — not tied to any real event.
    id: 'tortuga_wreck_santa_catalina',
    islandId: 'tortuga_cove',
    offset: { x: -430, y: 235 },
    name: 'Wreck of the Santa Catalina',
    emoji: '🚢',
    description:
      "Her manifest never turned up, and the reef that broke her back still hasn't given up whatever was in the hold. Local wisdom says salvage what you can before the tide — or a rival crew — beats you to it.",
  },
  {
    // Blueprint Sheet 4 wild card, 2026-08-13: a second wreck, north of Fort de Rocher, framed as
    // a ship that tried to run the fort's guns and lost. Purely invented.
    id: 'tortuga_wreck_bonne_esperance',
    islandId: 'tortuga_cove',
    offset: { x: 450, y: -350 },
    name: 'Wreck of the Bonne Espérance',
    emoji: '💥',
    description:
      "Sunk trying to slip past Fort de Rocher's guns under cover of night — the cannonball holes in what's left of the hull tell the rest. Nobody in Basse-Terre remembers what she was carrying, or won't say.",
  },
  {
    // Blueprint Sheet 4 wild card, 2026-08-13: a rogue pirate camp deep in Bois Sombre, the second
    // forest added the same session. Purely invented.
    id: 'tortuga_blackwoods_hollow',
    islandId: 'tortuga_cove',
    offset: { x: -30, y: 180 },
    name: "Blackwood's Hollow",
    emoji: '🏕️',
    description:
      "A ragged campsite hidden in Bois Sombre, flying no colors anyone recognizes. Blackwood's crew answers to no lord — pirate or governor — and skims every cart that strays too close to the treeline.",
  },
  {
    // Blueprint Sheet 4 wild card, 2026-08-13: a hidden still in the High Woods, relocated once
    // from an earlier spot that sat almost on the coastline. Purely invented.
    id: 'tortuga_suzettes_still',
    islandId: 'tortuga_cove',
    offset: { x: 400, y: 50 },
    name: "Old Suzette's Still",
    emoji: '🥃',
    description:
      "Copper pot, coiled tube, and two barrels tucked deep enough in the High Woods that the excise man's never once found it. Suzette's rum never sees a customs stamp, and everyone in town prefers it that way.",
  },
  {
    // Blueprint Sheet 4 wild card, 2026-08-13: a rumored buried-treasure site on the south coast,
    // near The Smugglers' Grotto. Purely invented.
    id: 'tortuga_marked_palm',
    islandId: 'tortuga_cove',
    offset: { x: -320, y: 355 },
    name: 'The Marked Palm',
    emoji: '🌴',
    description:
      "A lone leaning palm with an X scratched into the bark, said to mark where a dead man's coat once pointed. Half of Basse-Terre has dug near it at one time or another. Nobody's found anything yet — officially.",
  },
  {
    // Blueprint Sheet 4 wild card, 2026-08-13: a hidden sea cave on the southwest coast, relocated
    // once from an earlier spot that overlapped El Fuerte Viejo. Purely invented.
    id: 'tortuga_smugglers_grotto',
    islandId: 'tortuga_cove',
    offset: { x: -395, y: 300 },
    name: "The Smugglers' Grotto",
    emoji: '🕳️',
    description:
      "A low sea cave that floods at high tide and hides a landing no customs man has ever mapped. Whatever doesn't cross the quay in daylight has a way of turning up in Basse-Terre a few days after passing through here.",
    sprite: { category: 'nature', id: 'cave_arch' },
  },
  {
    // Blueprint Sheet 4, 2026-08-13: an invented cove notch on the west cape, near El Fuerte Viejo
    // — an artistic addition to the coastline, not part of the traced polygon.
    id: 'tortuga_contrebandiers_cove',
    islandId: 'tortuga_cove',
    offset: { x: -555, y: -30 },
    name: "Contrebandiers' Cove",
    emoji: '🌊',
    description:
      "A tight, easy-to-miss notch in the west cape, sheltered enough that a small boat can sit unseen from the open water. The name's older than anyone's memory of who first used it.",
  },
  {
    // Blueprint Sheet 4, 2026-08-13: an invented cove notch on the south coast, near the Marked
    // Palm and the Abandoned Quarter — named for Tortuga's own turtle-trade namesake.
    id: 'tortuga_turtle_cove',
    islandId: 'tortuga_cove',
    offset: { x: -195, y: 415 },
    name: 'Turtle Cove',
    emoji: '🐢',
    description:
      "A shallow, sandy inlet on the south shore where sea turtles still haul out most seasons — a quiet echo of the trade that gave this whole island its name.",
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
