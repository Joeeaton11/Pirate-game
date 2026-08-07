import { ResourceId } from './resources';

export type BuildingType =
  | 'tavern'
  | 'beach'
  | 'manor'
  | 'college'
  | 'shrine'
  | 'shop'
  | 'market'
  | 'fort'
  | 'chapel'
  | 'warehouse'
  | 'customs'
  | 'smithy'
  | 'ruins';

export interface Building {
  id: string;
  islandId: string;
  name: string;
  type: BuildingType;
  emoji: string;
  offset: { x: number; y: number }; // relative to the island's center, in world units
  npcName: string;
  npcEmoji: string;
  dialogue: string;
  recruit?: {
    templateId: string;
    level: number;
    cost: number;
  };
  itemsForSale?: string[]; // item ids, priced from ITEMS
  buysResources?: boolean; // if true, shows a Sell Resources section priced from RESOURCES
  sellsUpgrades?: boolean; // if true, shows a Ship Upgrades section priced from SHIP_UPGRADES
  // Theft: buy this resource honestly here too, or steal it for free at a heat cost.
  stealResourceId?: ResourceId;
  stealYield?: { min: number; max: number };
  stealDetectionChance?: number; // 0-1, chance of a bigger heat spike; default 0.4
  stealCooldownMinutes?: number; // default 30
}

// Was 45 — more than double a building's own visual radius (22), so walking anywhere near a
// building on the way to somewhere else would yank you inside it. 26 keeps entry to "you're
// basically at the door" while still comfortably bigger than the 44-native sprite's half-width.
export const ENTER_RADIUS = 26;

export const BUILDINGS: Building[] = [
  {
    id: 'tortuga_tavern',
    islandId: 'tortuga_cove',
    name: 'The Salty Parrot',
    type: 'tavern',
    emoji: '🍻',
    offset: { x: -180, y: -80 },
    npcName: 'Old Tom',
    npcEmoji: '🧔',
    dialogue: "Buy a round and I'll sign on, no questions asked.",
    recruit: { templateId: 'cabin_hand', level: 2, cost: 15 },
  },
  {
    id: 'tortuga_shop',
    islandId: 'tortuga_cove',
    name: 'Harbor Trading Post',
    type: 'shop',
    emoji: '🏪',
    offset: { x: 180, y: -60 },
    npcName: 'Merchant Wren',
    npcEmoji: '🧑‍💼',
    dialogue: "I know a sharpshooter looking for steady work, if you've got the coin.",
    recruit: { templateId: 'dockside_sharpshooter', level: 3, cost: 30 },
    itemsForSale: ['rum_ration', 'grapeshot_charge', 'ships_biscuit'],
    buysResources: true,
  },
  {
    id: 'cow_island_camp',
    islandId: 'cow_island',
    name: 'Cow Island Beach Camp',
    type: 'beach',
    emoji: '🏖️',
    offset: { x: 0, y: 200 },
    npcName: 'Barefoot Nia',
    npcEmoji: '🧍‍♀️',
    dialogue: 'Been living off crabs and cannon fire. I could use a real crew.',
    recruit: { templateId: 'powder_monkey', level: 4, cost: 35 },
  },
  {
    id: 'new_providence_tavern',
    islandId: 'new_providence',
    name: 'The Cracked Hull',
    type: 'tavern',
    emoji: '🍺',
    // Nudged clear of the residential avenue a second time (2026-08-04) — the first item-40 pass
    // only checked distance-to-endpoint against its own connecting street, not perpendicular
    // distance to every street LINE, so it was still only 10 units clear of the x=-280..360
    // avenue it runs alongside. Re-checked programmatically against every segment. See GAME_DESIGN.md.
    offset: { x: -193, y: 144 },
    npcName: 'Bruiser Mags',
    npcEmoji: '🥊',
    dialogue: "Bought me one drink too many and now I owe you a favor, apparently.",
    recruit: { templateId: 'tavern_brawler', level: 5, cost: 60 },
  },
  {
    // Nassau's harbor was too shallow for Royal Navy warships but perfect for careening — beaching
    // a sloop and tipping it on its side to scrape the hull — which is exactly what kept the
    // pirate republic's fleet seaworthy with no formal shipyard.
    id: 'new_providence_careening_yard',
    islandId: 'new_providence',
    name: 'The Careening Yard',
    type: 'smithy',
    emoji: '🛠️',
    offset: { x: -380, y: -60 },
    npcName: 'Shipwright Odalys',
    npcEmoji: '👷',
    dialogue: "Tip her on her side, scrape the barnacles, patch the planks. No fleet without it.",
    recruit: { templateId: 'gun_deck_veteran', level: 6, cost: 75 },
  },
  {
    id: 'roatan_den',
    islandId: 'roatan',
    name: "Smuggler's Den",
    type: 'shop',
    emoji: '🕳️',
    offset: { x: 160, y: 140 },
    npcName: 'Quiet Sef',
    npcEmoji: '🥷',
    dialogue: "I don't ask where the gold's from. You shouldn't ask where I've been.",
    recruit: { templateId: 'gun_deck_veteran', level: 8, cost: 130 },
    itemsForSale: ['forged_papers', 'rum_ration'],
    buysResources: true,
    sellsUpgrades: true,
  },
  {
    id: 'port_royal_college',
    islandId: 'port_royal',
    name: 'Sunken Naval College',
    type: 'college',
    emoji: '🎓',
    offset: { x: -120, y: -160 },
    npcName: 'Professor Halloway',
    npcEmoji: '🧑‍🏫',
    dialogue: 'Top of my class in gunnery theory. Practical experience, admittedly, lacking.',
    recruit: { templateId: 'master_gunner', level: 10, cost: 220 },
  },
  {
    id: 'port_royal_manor',
    islandId: 'port_royal',
    name: 'Widow Ashworth Manor',
    type: 'manor',
    emoji: '🏚️',
    offset: { x: 140, y: 180 },
    npcName: 'Lady Ashworth',
    npcEmoji: '👩',
    dialogue: "My late husband's fortune is spent. His cutlass, however, is still quite sharp.",
    recruit: { templateId: 'boarding_captain', level: 9, cost: 180 },
  },
  {
    id: 'ile_sainte_marie_shrine',
    islandId: 'ile_sainte_marie',
    name: 'Sunken Shrine',
    type: 'shrine',
    emoji: '⛩️',
    offset: { x: 0, y: -220 },
    npcName: 'The Fathomless Monk',
    npcEmoji: '🧘',
    dialogue: 'The deep offers strength to those willing to pay its price.',
    recruit: { templateId: 'kraken_bound_captain', level: 15, cost: 400 },
  },
  {
    id: 'tortuga_fishmonger',
    islandId: 'tortuga_cove',
    name: "The Fishmonger's Stall",
    type: 'market',
    emoji: '🐟',
    // Pulled into the harbor town 2026-08-07 from (-260, 242), on the far south side of the
    // island, to (-270, -150) — item 51's full-town remap. See GAME_DESIGN.md.
    offset: { x: -270, y: -150 },
    npcName: 'Old Dinah',
    npcEmoji: '🧓',
    dialogue: "Freshest catch on the wharf. Buy it fair, or don't let me catch you taking it.",
    stealResourceId: 'fish',
    stealYield: { min: 3, max: 6 },
    stealDetectionChance: 0.35,
    stealCooldownMinutes: 20,
  },
  {
    id: 'new_providence_distillery',
    islandId: 'new_providence',
    name: 'The Distillery',
    type: 'market',
    emoji: '🥃',
    // Nudged clear a second time (2026-08-04) — see The Cracked Hull's comment above for why
    // the item-40 pass under-corrected this one too. See GAME_DESIGN.md.
    offset: { x: 350, y: 78 },
    npcName: 'Brix',
    npcEmoji: '🧑‍🌾',
    dialogue: "Rum's the only honest currency left in this republic. Mind you pay for it.",
    stealResourceId: 'rum',
    stealYield: { min: 3, max: 5 },
    stealDetectionChance: 0.4,
    stealCooldownMinutes: 25,
  },
  {
    id: 'roatan_timber_yard',
    islandId: 'roatan',
    name: 'The Timber Yard',
    type: 'market',
    emoji: '🪵',
    offset: { x: 300, y: -300 },
    npcName: 'Foreman Cutter',
    npcEmoji: '🧑‍🔧',
    dialogue: "Every plank here is spoken for. Buy it proper, or take it and answer to the yard dogs.",
    stealResourceId: 'timber',
    stealYield: { min: 3, max: 6 },
    stealDetectionChance: 0.4,
    stealCooldownMinutes: 25,
  },
  {
    id: 'port_royal_armoury',
    islandId: 'port_royal',
    name: 'The Armoury',
    type: 'market',
    emoji: '💥',
    offset: { x: 300, y: 300 },
    npcName: 'Sergeant Vane',
    npcEmoji: '💂',
    dialogue: "Crown powder, under crown lock. I'd think twice before helping yourself.",
    stealResourceId: 'gunpowder',
    stealYield: { min: 2, max: 4 },
    stealDetectionChance: 0.5,
    stealCooldownMinutes: 30,
  },
  {
    id: 'tortuga_fort',
    islandId: 'tortuga_cove',
    name: 'Fort de Rocher',
    type: 'fort',
    emoji: '🏰',
    offset: { x: 200, y: -200 },
    npcName: 'Sergeant Duclos',
    npcEmoji: '💂',
    dialogue:
      "Forty guns and one bad ladder between us and the Spanish. Mind where you step — Le Vasseur pulls it up at dusk, invited or not.",
    recruit: { templateId: 'musketeer_marksman', level: 4, cost: 40 },
  },
  {
    id: 'tortuga_chapel',
    islandId: 'tortuga_cove',
    name: 'Chapelle Notre-Dame',
    type: 'chapel',
    emoji: '⛪',
    // Pulled into the harbor town 2026-08-07 from (330, 116), on the far south-east side of the
    // island, to (280, -150) — item 51's full-town remap. See GAME_DESIGN.md.
    offset: { x: 280, y: -150 },
    npcName: 'Brother Aldric',
    npcEmoji: '🙏',
    dialogue: "Even outlaws want forgiveness sometimes. I keep the door open and ask no questions about the cargo.",
    recruit: { templateId: 'cursed_bosun', level: 3, cost: 35 },
  },
  {
    id: 'tortuga_warehouse',
    islandId: 'tortuga_cove',
    name: "Smugglers' Warehouse",
    type: 'warehouse',
    emoji: '📦',
    offset: { x: -120, y: -210 },
    npcName: 'Big Pella',
    npcEmoji: '🧔‍♂️',
    dialogue: "Crates in, crates out, no manifest ever matches. You look like you can keep your mouth shut — that's worth good coin here.",
    recruit: { templateId: 'deckhand_swordsman', level: 3, cost: 25 },
  },
  {
    id: 'tortuga_west_point',
    islandId: 'tortuga_cove',
    name: 'West Point Shack',
    type: 'beach',
    emoji: '🛖',
    offset: { x: -380, y: 20 },
    npcName: 'Old Man Hollis',
    npcEmoji: '🧓',
    dialogue: "Retired from the account, as they say. Out here the wind's quieter and nobody remembers my face.",
    recruit: { templateId: 'duelist_first_mate', level: 4, cost: 45 },
  },
  {
    id: 'tortuga_customs',
    islandId: 'tortuga_cove',
    name: 'The Customs House',
    type: 'customs',
    emoji: '🏛️',
    // Pulled into the harbor town 2026-08-07 from (320, 20) to (300, -60) — item 51's full-town
    // remap. See GAME_DESIGN.md.
    offset: { x: 300, y: -60 },
    npcName: 'Inspector Hale',
    npcEmoji: '🎩',
    dialogue:
      "Every crate that crosses this harbor's meant to pay its due to the crown. Half of it does. I've learned not to ask about the other half.",
  },
  {
    id: 'tortuga_smithy',
    islandId: 'tortuga_cove',
    name: 'The Anchor & Forge',
    type: 'smithy',
    emoji: '⚒️',
    // Pulled into the harbor town 2026-08-07 from (-308, 75) to (-269, -27), staying on its own
    // spoke off the Salty Parrot but now close to the harbor cluster instead of the island's
    // south side — item 51's full-town remap. See GAME_DESIGN.md.
    offset: { x: -269, y: -27 },
    npcName: 'Forge-Master Kade',
    npcEmoji: '🔨',
    dialogue: "Cutlasses, grapeshot, ship fittings — if it's metal and it's broken, I can fix it or melt it down and start again.",
  },
  {
    // Tortuga was a Spanish possession before French buccaneers seized it in 1629 (and the
    // Spanish razed the pirate settlement more than once afterward, in 1635 and 1638) — this
    // redoubt predates Fort de Rocher, which Le Vasseur only built once the French had the
    // island for good. Sits on the newly-opened west cape beyond West Point Shack.
    id: 'tortuga_ruins',
    islandId: 'tortuga_cove',
    name: 'El Fuerte Viejo',
    type: 'ruins',
    emoji: '🏚️',
    offset: { x: -510, y: -10 },
    npcName: 'The Ruin-Keeper',
    npcEmoji: '🧙',
    dialogue: "Spanish stone, French blood, and nobody left who remembers which came first. I just remember it's quiet out here.",
    recruit: { templateId: 'musketeer_marksman', level: 4, cost: 50 },
  },
  {
    // The word "buccaneer" comes from boucan, the wooden smoking-frame hunters used to cure wild
    // boar and cattle meat on Hispaniola and Tortuga before the trade turned to piracy — this camp
    // is where that older, quieter trade still happens, deep in the High Woods.
    id: 'tortuga_trapper_camp',
    islandId: 'tortuga_cove',
    name: "The Trapper's Camp",
    type: 'beach',
    emoji: '🏕️',
    offset: { x: 332, y: 168 },
    npcName: 'Boucanier Yves',
    npcEmoji: '🏹',
    dialogue: "Wild boar, cut thin and smoked slow over green wood — that's how we did it before anyone called us pirates. Still works.",
    recruit: { templateId: 'gun_deck_veteran', level: 5, cost: 55 },
  },
  {
    // Every crate that crosses the harbor is meant to pay its due to the Customs House — Inspector
    // Hale himself admits half of it does. This is where the other half goes: deep enough in the
    // High Woods that no tax collector has ever bothered to look.
    id: 'tortuga_smuggler_cache',
    islandId: 'tortuga_cove',
    name: "The Smuggler's Cache",
    type: 'warehouse',
    emoji: '🕳️',
    // Nudged 4 units clear of the avenue it runs alongside (2026-08-04 sweep). See GAME_DESIGN.md.
    offset: { x: 250, y: 266 },
    npcName: 'Silent Mara',
    npcEmoji: '🥷',
    dialogue: "You didn't see this place. In exchange, I didn't see you. That's the whole arrangement.",
    recruit: { templateId: 'boarding_captain', level: 6, cost: 70 },
  },
  {
    // The original French landing on Tortuga wasn't at today's harbor — it was here, until the
    // Spanish burned it out in 1635 and 1638 (see "Ruins of the Old Landing"). A dock still clings
    // to the shore below the ruin, and someone still lives by it.
    id: 'tortuga_old_landing_dock',
    islandId: 'tortuga_cove',
    name: 'The Old Landing Dock',
    type: 'beach',
    emoji: '⚓',
    offset: { x: 184, y: 350 },
    npcName: 'Old Ilsabet',
    npcEmoji: '🧓',
    dialogue: "My grandmother's grandmother fished this water before the harbor town existed. Some of us never left, raid or no raid.",
    recruit: { templateId: 'tavern_brawler', level: 5, cost: 55 },
  },
  {
    // The big-dock district: the Harbor Pier's decorative boardwalks and moored boats got a real
    // neighborhood around them — a proper street front, working buildings, and waterfront housing
    // instead of just Fishing Dock + Warehouse standing alone on open grass. Relocated 2026-08-03
    // to sit right against the real quay (found by ray-cast, see harbor.ts) after the first pass
    // placed the whole district ~250 units inland of the actual coastline — nowhere near the dock.
    id: 'tortuga_harbourmaster',
    islandId: 'tortuga_cove',
    name: "Harbourmaster's Office",
    type: 'customs',
    emoji: '🗼',
    offset: { x: 100, y: -380 },
    npcName: 'Harbourmaster Voss',
    npcEmoji: '🎖️',
    dialogue: "Every hull that ties up on this dock answers to me first — the Customs House gets its cut after. Been running this waterfront since before some of you had teeth.",
    recruit: { templateId: 'master_gunner', level: 8, cost: 150 },
  },
  {
    id: 'tortuga_chandlery',
    islandId: 'tortuga_cove',
    name: 'The Chandlery',
    type: 'shop',
    emoji: '🕯️',
    offset: { x: -60, y: -370 },
    npcName: 'Fenwick',
    npcEmoji: '🪢',
    dialogue: "Rope, tar, sailcloth, spare rigging — if it keeps a ship's canvas from tearing loose in a storm, I stock it. My apprentice here's quick with a splice, if you're hiring.",
    recruit: { templateId: 'powder_monkey', level: 4, cost: 35 },
  },
  {
    id: 'tortuga_dockworkers_bunkhouse',
    islandId: 'tortuga_cove',
    name: "Dockworkers' Bunkhouse",
    type: 'warehouse',
    emoji: '🛏️',
    offset: { x: 180, y: -360 },
    npcName: 'Cutter Doyle',
    npcEmoji: '🧢',
    dialogue: "Six of us to a room and the walls still leak, but the pay's honest and the rum's cheap. Card games run past midnight if you fancy losing your coin the easy way.",
    recruit: { templateId: 'tavern_brawler', level: 6, cost: 65 },
  },
  // Old Town infill, wedged between the existing dock buildings and packed row houses (see
  // HOUSES) — positions found the same way as everything else in this district: programmatically
  // cleared against every real path/building/house first, at the tight-but-legal minimum instead
  // of the suburb's usual spacing, so it actually reads as a cramped 17th-century harbor quarter.
  {
    id: 'tortuga_coopers_yard',
    islandId: 'tortuga_cove',
    name: "The Cooper's Yard",
    type: 'market',
    emoji: '🛢️',
    offset: { x: -35, y: -317 },
    npcName: 'Old Merriweather',
    npcEmoji: '🔨',
    dialogue: "Every cask of salt pork, rum, and fresh water on this waterfront passed through my hands first. Been hooping barrels since before the Chandlery had a roof.",
    recruit: { templateId: 'cabin_hand', level: 3, cost: 25 },
  },
  {
    id: 'tortuga_sailmakers_loft',
    islandId: 'tortuga_cove',
    name: "The Sailmaker's Loft",
    type: 'shop',
    emoji: '🧵',
    offset: { x: 60, y: -330 },
    npcName: 'Needle Annie',
    npcEmoji: '🪡',
    dialogue: "Torn canvas, a busted seam mid-squall, a flag shot clean off its halyard — bring it here before you bring it to the bottom of the sea.",
    recruit: { templateId: 'dockside_sharpshooter', level: 5, cost: 45 },
  },
];

export function buildingsForIsland(islandId: string): Building[] {
  return BUILDINGS.filter((b) => b.islandId === islandId);
}

export function buildingWorldPosition(
  building: Building,
  islandPosition: { x: number; y: number }
): { x: number; y: number } {
  return { x: islandPosition.x + building.offset.x, y: islandPosition.y + building.offset.y };
}
