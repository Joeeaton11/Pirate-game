// The Treasure Codex — a second "catch 'em all" collection layer alongside the Crew Log.
// Design: GAME_DESIGN.md, Main Story Arc section 6. Every item here is individually named and
// tracked toward a completion %, found through a deliberately varied set of methods rather than
// one repeated mechanic.

export type TreasureRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

// The 7 acquisition methods from the design doc, plus 'assembled' for the one capstone item that
// isn't found anywhere directly — it's built from other Codex entries (see HOARD_TREASURE_ID).
export type TreasureMethod =
  | 'exploration'
  | 'buried_map'
  | 'salvage'
  | 'quest_reward'
  | 'puzzle'
  | 'rare_drop'
  | 'vendor'
  | 'assembled';

export interface TreasureItem {
  id: string;
  name: string;
  emoji: string;
  rarity: TreasureRarity;
  method: TreasureMethod;
  flavor: string;
  /** Shown once found, under the flavor text — where/how it turned up. */
  foundHint: string;
  /** Only set for method: 'vendor' — gold cost to buy outright. */
  price?: number;
}

export const TREASURES: Record<string, TreasureItem> = {
  // --- The 7 map fragments (rare), one per mandatory island, per the terrain table in
  // GAME_DESIGN.md section 4. Collecting all 7 auto-assembles the legendary capstone below. ---
  fragment_tortuga: {
    id: 'fragment_tortuga',
    name: 'Chart Fragment: Tortuga',
    emoji: '🧭',
    rarity: 'rare',
    method: 'exploration',
    flavor: "Torn from the edge of a larger map. Even faded, Tortuga's harbor is unmistakable.",
    foundHint: 'Tucked into a hollow log deep in the High Woods.',
  },
  fragment_cow_island: {
    id: 'fragment_cow_island',
    name: 'Chart Fragment: Cow Island',
    emoji: '🗺️',
    rarity: 'rare',
    method: 'exploration',
    flavor: 'Salt-stained and half-illegible, but the muster grounds are drawn clear as day.',
    foundHint: 'Wedged between two boulders on the swampy eastern shore.',
  },
  fragment_new_providence: {
    id: 'fragment_new_providence',
    name: 'Chart Fragment: New Providence',
    emoji: '🗺️',
    rarity: 'rare',
    method: 'exploration',
    flavor: 'A republic drawn in careful ink, before the Crown came to erase it.',
    foundHint: 'Behind a loose brick in a Nassau back alley.',
  },
  fragment_roatan: {
    id: 'fragment_roatan',
    name: 'Chart Fragment: Roatán',
    emoji: '🗺️',
    rarity: 'rare',
    method: 'exploration',
    flavor: "Marks a careening yard that isn't on any Navy chart.",
    foundHint: 'Nailed inside an old drydock gate, long since abandoned.',
  },
  fragment_port_royal: {
    id: 'fragment_port_royal',
    name: 'Chart Fragment: Port Royal',
    emoji: '🗺️',
    rarity: 'rare',
    method: 'exploration',
    flavor: 'Drawn before the earthquake took half the city into the sea.',
    foundHint: 'Floating in a bottle, snagged on a sunken chimney.',
  },
  fragment_ile_sainte_marie: {
    id: 'fragment_ile_sainte_marie',
    name: 'Chart Fragment: Île Sainte-Marie',
    emoji: '🗺️',
    rarity: 'rare',
    method: 'exploration',
    flavor: 'The whirlpool is marked with a single word: "don\'t."',
    foundHint: 'Buried in dry sand just above the tideline.',
  },
  fragment_ocracoke: {
    id: 'fragment_ocracoke',
    name: 'Chart Fragment: Ocracoke Inlet',
    emoji: '🗺️',
    rarity: 'rare',
    method: 'exploration',
    flavor: 'The last piece. Whoever drew this knew exactly how the story ends.',
    foundHint: "Found nailed to a piling at the inlet's edge.",
  },

  // --- The legendary capstone (GAME_DESIGN.md 6.D) ---
  blackbeards_hoard: {
    id: 'blackbeards_hoard',
    name: "Blackbeard's Lost Hoard",
    emoji: '👑',
    rarity: 'legendary',
    method: 'assembled',
    flavor: 'History says it was never found. History was wrong.',
    foundHint: 'Assembled from all seven chart fragments — the map led true.',
  },

  // --- One example each of the remaining built methods (buried map, salvage, vendor) ---
  buried_doubloons: {
    id: 'buried_doubloons',
    name: 'Chest of Buried Doubloons',
    emoji: '💰',
    rarity: 'uncommon',
    method: 'buried_map',
    flavor: 'Someone buried this in a hurry and never came back for it.',
    foundHint: "Dug up on Tortuga's western shore, right where the map said.",
  },
  sunken_locket: {
    id: 'sunken_locket',
    name: 'Sunken Locket',
    emoji: '📿',
    rarity: 'uncommon',
    method: 'salvage',
    flavor: "A stranger's portrait, warped by decades underwater.",
    foundHint: 'Salvaged from the drowned ruins off Port Royal.',
  },
  smugglers_lucky_coin: {
    id: 'smugglers_lucky_coin',
    name: "Smuggler's Lucky Coin",
    emoji: '🪙',
    rarity: 'common',
    method: 'vendor',
    flavor: "Every smuggler swears by a lucky coin. This one's seen a lot of luck, good and bad.",
    foundHint: "Bought outright from Roatán's Smuggler's Den — no digging required.",
    price: 60,
  },

  // --- Common exploration finds, one per island, so the Codex has an achievable early tier ---
  rusty_compass: {
    id: 'rusty_compass',
    name: 'Rusty Compass',
    emoji: '🧭',
    rarity: 'common',
    method: 'exploration',
    flavor: 'The needle still points somewhere. Not necessarily north.',
    foundHint: 'Found rusting in the ruins of El Fuerte Viejo.',
  },
  tarnished_spyglass: {
    id: 'tarnished_spyglass',
    name: 'Tarnished Spyglass',
    emoji: '🔭',
    rarity: 'common',
    method: 'exploration',
    flavor: "Still works, if you don't mind a green haze over everything.",
    foundHint: 'Left coiled in vines near the old muster ground.',
  },
  barnacled_bell: {
    id: 'barnacled_bell',
    name: "Barnacled Ship's Bell",
    emoji: '🔔',
    rarity: 'common',
    method: 'exploration',
    flavor: "Still rings, muffled, like it's calling from underwater.",
    foundHint: 'Half-buried at the tideline near the docks.',
  },
  chipped_cutlass_hilt: {
    id: 'chipped_cutlass_hilt',
    name: 'Chipped Cutlass Hilt',
    emoji: '⚔️',
    rarity: 'common',
    method: 'exploration',
    flavor: "No blade left, but the maker's mark is worth something to a collector.",
    foundHint: 'Rusting in a pile of shipyard scrap.',
  },
  ivory_dice: {
    id: 'ivory_dice',
    name: 'Ivory Dice',
    emoji: '🎲',
    rarity: 'common',
    method: 'exploration',
    flavor: 'Loaded, probably. Someone lost badly with these.',
    foundHint: "Rattling loose in a drowned tavern's floorboards.",
  },
  coral_earring: {
    id: 'coral_earring',
    name: 'Coral-Crusted Earring',
    emoji: '💍',
    rarity: 'common',
    method: 'exploration',
    flavor: 'Gold under all that coral, if you scrape it clean.',
    foundHint: 'Snagged in a tide pool at low water.',
  },
};

export const TREASURE_LIST = Object.values(TREASURES);

/** The 7 fragments that assemble into the legendary capstone. Order matches the terrain table. */
export const TREASURE_FRAGMENT_IDS = [
  'fragment_tortuga',
  'fragment_cow_island',
  'fragment_new_providence',
  'fragment_roatan',
  'fragment_port_royal',
  'fragment_ile_sainte_marie',
  'fragment_ocracoke',
];

export const HOARD_TREASURE_ID = 'blackbeards_hoard';

export function rarityColor(rarity: TreasureRarity): string {
  switch (rarity) {
    case 'common':
      return '#9aa0a6';
    case 'uncommon':
      return '#4caf50';
    case 'rare':
      return '#4fa8ff';
    case 'legendary':
      return '#ffd166';
  }
}

/** Exploration/buried-map find spots — walked up to and collected passively, same interaction
 * shape as a resource node. `requiresItemId`, when set, must be held (and is consumed) to collect —
 * that's what makes an entry a "buried treasure map" site instead of a plain exploration find. */
export interface TreasureSite {
  id: string;
  islandId: string;
  offset: { x: number; y: number };
  treasureId: string;
  requiresItemId?: string;
}

export const TREASURE_SITES: TreasureSite[] = [
  { id: 'site_fragment_tortuga', islandId: 'tortuga_cove', offset: { x: -350, y: 350 }, treasureId: 'fragment_tortuga' },
  { id: 'site_fragment_cow_island', islandId: 'cow_island', offset: { x: 150, y: -200 }, treasureId: 'fragment_cow_island' },
  { id: 'site_fragment_new_providence', islandId: 'new_providence', offset: { x: 250, y: 200 }, treasureId: 'fragment_new_providence' },
  { id: 'site_fragment_roatan', islandId: 'roatan', offset: { x: 300, y: -200 }, treasureId: 'fragment_roatan' },
  { id: 'site_fragment_port_royal', islandId: 'port_royal', offset: { x: 300, y: 250 }, treasureId: 'fragment_port_royal' },
  { id: 'site_fragment_ile_sainte_marie', islandId: 'ile_sainte_marie', offset: { x: -150, y: 250 }, treasureId: 'fragment_ile_sainte_marie' },
  { id: 'site_fragment_ocracoke', islandId: 'ocracoke_inlet', offset: { x: 200, y: -150 }, treasureId: 'fragment_ocracoke' },

  {
    id: 'site_buried_doubloons',
    islandId: 'tortuga_cove',
    offset: { x: -350, y: 50 },
    treasureId: 'buried_doubloons',
    requiresItemId: 'treasure_map',
  },

  { id: 'site_rusty_compass', islandId: 'tortuga_cove', offset: { x: -400, y: -150 }, treasureId: 'rusty_compass' },
  { id: 'site_tarnished_spyglass', islandId: 'cow_island', offset: { x: -200, y: -100 }, treasureId: 'tarnished_spyglass' },
  { id: 'site_barnacled_bell', islandId: 'new_providence', offset: { x: -150, y: 100 }, treasureId: 'barnacled_bell' },
  { id: 'site_chipped_cutlass_hilt', islandId: 'roatan', offset: { x: 150, y: 150 }, treasureId: 'chipped_cutlass_hilt' },
  { id: 'site_ivory_dice', islandId: 'port_royal', offset: { x: -150, y: 100 }, treasureId: 'ivory_dice' },
  { id: 'site_coral_earring', islandId: 'ile_sainte_marie', offset: { x: 100, y: -200 }, treasureId: 'coral_earring' },
];

export function treasureSiteWorldPosition(
  site: TreasureSite,
  islandPosition: { x: number; y: number }
): { x: number; y: number } {
  return { x: islandPosition.x + site.offset.x, y: islandPosition.y + site.offset.y };
}
