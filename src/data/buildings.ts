import { ResourceId } from './resources';

export type BuildingType = 'tavern' | 'beach' | 'manor' | 'college' | 'shrine' | 'shop' | 'market';

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
  // Theft: buy this resource honestly here too, or steal it for free at a heat cost.
  stealResourceId?: ResourceId;
  stealYield?: { min: number; max: number };
  stealDetectionChance?: number; // 0-1, chance of a bigger heat spike; default 0.4
  stealCooldownMinutes?: number; // default 30
}

export const ENTER_RADIUS = 45;

export const BUILDINGS: Building[] = [
  {
    id: 'tortuga_tavern',
    islandId: 'tortuga_cove',
    name: 'The Salty Parrot',
    type: 'tavern',
    emoji: '🍻',
    offset: { x: -90, y: -40 },
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
    offset: { x: 90, y: -30 },
    npcName: 'Merchant Wren',
    npcEmoji: '🧑‍💼',
    dialogue: "I know a sharpshooter looking for steady work, if you've got the coin.",
    recruit: { templateId: 'dockside_sharpshooter', level: 3, cost: 30 },
    itemsForSale: ['rum_ration', 'grapeshot_charge'],
    buysResources: true,
  },
  {
    id: 'cow_island_camp',
    islandId: 'cow_island',
    name: 'Cow Island Beach Camp',
    type: 'beach',
    emoji: '🏖️',
    offset: { x: 0, y: 100 },
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
    offset: { x: -70, y: 60 },
    npcName: 'Bruiser Mags',
    npcEmoji: '🥊',
    dialogue: "Bought me one drink too many and now I owe you a favor, apparently.",
    recruit: { templateId: 'tavern_brawler', level: 5, cost: 60 },
  },
  {
    id: 'roatan_den',
    islandId: 'roatan',
    name: "Smuggler's Den",
    type: 'shop',
    emoji: '🕳️',
    offset: { x: 80, y: 70 },
    npcName: 'Quiet Sef',
    npcEmoji: '🥷',
    dialogue: "I don't ask where the gold's from. You shouldn't ask where I've been.",
    recruit: { templateId: 'gun_deck_veteran', level: 8, cost: 130 },
    itemsForSale: ['forged_papers', 'rum_ration'],
    buysResources: true,
  },
  {
    id: 'port_royal_college',
    islandId: 'port_royal',
    name: 'Sunken Naval College',
    type: 'college',
    emoji: '🎓',
    offset: { x: -60, y: -80 },
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
    offset: { x: 70, y: 90 },
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
    offset: { x: 0, y: -110 },
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
    offset: { x: -130, y: 120 },
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
    offset: { x: 170, y: 40 },
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
    offset: { x: 150, y: -150 },
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
    offset: { x: 150, y: 150 },
    npcName: 'Sergeant Vane',
    npcEmoji: '💂',
    dialogue: "Crown powder, under crown lock. I'd think twice before helping yourself.",
    stealResourceId: 'gunpowder',
    stealYield: { min: 2, max: 4 },
    stealDetectionChance: 0.5,
    stealCooldownMinutes: 30,
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
