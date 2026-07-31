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
  cow_island: {
    id: 'cow_island',
    name: 'Cow Island',
    emoji: '🐄',
    description: "Low grazing flats where real fleets once mustered before a raid.",
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
  new_providence: {
    id: 'new_providence',
    name: 'New Providence',
    emoji: '🌴',
    description: 'The real pirate republic — no crown, no law, just captains.',
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
  roatan: {
    id: 'roatan',
    name: 'Roatán',
    emoji: '⚓',
    description: 'A real careening cove where hulls get scraped, patched, and re-armed.',
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
  port_royal: {
    id: 'port_royal',
    name: 'Port Royal',
    emoji: '🌊',
    description: 'The sunken city — swallowed by an earthquake, still drawing the desperate and the cursed.',
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
  ile_sainte_marie: {
    id: 'ile_sainte_marie',
    name: 'Île Sainte-Marie',
    emoji: '🌀',
    description: 'A remote haven at the edge of the map, tied to old legends of a pirate utopia.',
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
  ocracoke_inlet: {
    id: 'ocracoke_inlet',
    name: 'Ocracoke Inlet',
    emoji: '💀',
    description:
      "Shallow, treacherous waters — the real site of Blackbeard's last stand. The endgame of these seas.",
    position: { x: 1500, y: 250 },
    radius: 200,
    encounterChance: 0.14,
    encounterTable: [
      { templateId: 'cursed_bosun', weight: 2, minLevel: 15, maxLevel: 20 },
      { templateId: 'master_gunner', weight: 2, minLevel: 15, maxLevel: 20 },
      { templateId: 'duelist_first_mate', weight: 3, minLevel: 16, maxLevel: 21 },
      { templateId: 'kraken_bound_captain', weight: 2, minLevel: 18, maxLevel: 24 },
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
