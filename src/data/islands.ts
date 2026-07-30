import { EncounterSlot, Island } from '../types';

export const WORLD_WIDTH = 1800;
export const WORLD_HEIGHT = 2600;

export const ISLANDS: Record<string, Island> = {
  tortuga_cove: {
    id: 'tortuga_cove',
    name: 'Tortuga Cove',
    emoji: '🏝️',
    description: 'Your home port. Calm waters, no trouble here.',
    position: { x: 900, y: 2280 },
    radius: 190,
    isSafeZone: true,
    encounterChance: 0,
    encounterTable: [],
  },
  salt_marsh_isle: {
    id: 'salt_marsh_isle',
    name: 'Salt Marsh Isle',
    emoji: '🌾',
    description: 'Reedy shallows where green crews cut their teeth.',
    position: { x: 430, y: 1770 },
    radius: 220,
    encounterChance: 0.09,
    encounterTable: [
      { templateId: 'cabin_hand', weight: 4, minLevel: 2, maxLevel: 4 },
      { templateId: 'deckhand_swordsman', weight: 3, minLevel: 2, maxLevel: 5 },
      { templateId: 'powder_monkey', weight: 3, minLevel: 2, maxLevel: 5 },
      { templateId: 'dockside_sharpshooter', weight: 2, minLevel: 3, maxLevel: 5 },
    ],
  },
  gullwing_rock: {
    id: 'gullwing_rock',
    name: 'Gullwing Rock',
    emoji: '🪨',
    description: 'Windswept crags patrolled by scrappy dockside brawlers.',
    position: { x: 1370, y: 1770 },
    radius: 220,
    encounterChance: 0.09,
    encounterTable: [
      { templateId: 'cabin_hand', weight: 3, minLevel: 3, maxLevel: 5 },
      { templateId: 'dockside_sharpshooter', weight: 3, minLevel: 3, maxLevel: 6 },
      { templateId: 'tavern_brawler', weight: 3, minLevel: 4, maxLevel: 7 },
      { templateId: 'musketeer_marksman', weight: 2, minLevel: 5, maxLevel: 7 },
    ],
  },
  blackrock_shoals: {
    id: 'blackrock_shoals',
    name: 'Blackrock Shoals',
    emoji: '⛰️',
    description: 'Jagged reefs where hardened boarding crews lie in wait.',
    position: { x: 400, y: 1090 },
    radius: 230,
    encounterChance: 0.1,
    encounterTable: [
      { templateId: 'tavern_brawler', weight: 3, minLevel: 6, maxLevel: 9 },
      { templateId: 'boarding_captain', weight: 3, minLevel: 7, maxLevel: 10 },
      { templateId: 'gun_deck_veteran', weight: 3, minLevel: 7, maxLevel: 10 },
      { templateId: 'musketeer_marksman', weight: 2, minLevel: 6, maxLevel: 9 },
    ],
  },
  widows_reef: {
    id: 'widows_reef',
    name: "Widow's Reef",
    emoji: '🌊',
    description: 'Fog-shrouded waters where things below start to stir.',
    position: { x: 1400, y: 1090 },
    radius: 230,
    encounterChance: 0.1,
    encounterTable: [
      { templateId: 'boarding_captain', weight: 3, minLevel: 7, maxLevel: 10 },
      { templateId: 'gun_deck_veteran', weight: 2, minLevel: 7, maxLevel: 10 },
      { templateId: 'cursed_bosun', weight: 3, minLevel: 8, maxLevel: 11 },
      { templateId: 'master_gunner', weight: 2, minLevel: 9, maxLevel: 12 },
    ],
  },
  serpents_maw: {
    id: 'serpents_maw',
    name: "Serpent's Maw",
    emoji: '🌀',
    description: 'A cursed whirlpool strait. Only seasoned crews return.',
    position: { x: 900, y: 420 },
    radius: 240,
    encounterChance: 0.12,
    encounterTable: [
      { templateId: 'cursed_bosun', weight: 3, minLevel: 10, maxLevel: 14 },
      { templateId: 'master_gunner', weight: 3, minLevel: 10, maxLevel: 14 },
      { templateId: 'duelist_first_mate', weight: 3, minLevel: 11, maxLevel: 15 },
      { templateId: 'kraken_bound_captain', weight: 1, minLevel: 14, maxLevel: 18 },
    ],
  },
};

export const ISLAND_LIST = Object.values(ISLANDS);
export const START_POSITION = { ...ISLANDS.tortuga_cove.position };

/** Wild encounters rolled while sailing open water, away from any island. */
export const SEA_ENCOUNTER_CHANCE = 0.05;
export const SEA_ENCOUNTER_TABLE: EncounterSlot[] = [
  { templateId: 'powder_monkey', weight: 3, minLevel: 2, maxLevel: 6 },
  { templateId: 'dockside_sharpshooter', weight: 3, minLevel: 3, maxLevel: 7 },
  { templateId: 'gun_deck_veteran', weight: 2, minLevel: 6, maxLevel: 10 },
  { templateId: 'master_gunner', weight: 1, minLevel: 9, maxLevel: 13 },
];

/** Returns the island whose landmass contains the given world point, if any. */
export function islandAtPoint(point: { x: number; y: number }): Island | null {
  for (const island of ISLAND_LIST) {
    const dx = point.x - island.position.x;
    const dy = point.y - island.position.y;
    if (Math.sqrt(dx * dx + dy * dy) <= island.radius) {
      return island;
    }
  }
  return null;
}
