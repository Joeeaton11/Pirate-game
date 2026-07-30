import { CrewTemplate, EncounterSlot } from '../types';

export type ThreatFaction = 'rival' | 'navy';

/** Hostile-only NPCs: never recruitable, encountered only in ambushes. */
export const THREAT_TEMPLATES: Record<string, CrewTemplate> = {
  rival_deckhand: {
    id: 'rival_deckhand',
    name: 'Rival Deckhand',
    specialty: 'blade',
    emoji: '🔪',
    rarity: 'common',
    baseHp: 32,
    baseAtk: 13,
    baseDef: 9,
    baseSpeed: 13,
    moveIds: ['cutlass_slash'],
    flavor: 'Sails under a rival flag, looking for easy prey.',
  },
  rival_corsair: {
    id: 'rival_corsair',
    name: 'Rival Corsair',
    specialty: 'cannon',
    emoji: '💀',
    rarity: 'uncommon',
    baseHp: 48,
    baseAtk: 20,
    baseDef: 15,
    baseSpeed: 14,
    moveIds: ['grapeshot_blast', 'cannon_broadside'],
    flavor: 'A rival crew boss out to sink your ship and take your loot.',
  },
  rival_captain: {
    id: 'rival_captain',
    name: 'Rival Captain',
    specialty: 'blade',
    emoji: '☠️',
    rarity: 'rare',
    baseHp: 62,
    baseAtk: 28,
    baseDef: 18,
    baseSpeed: 19,
    moveIds: ['boarding_rush', 'cutlass_slash'],
    flavor: 'A notorious rival captain with a bounty of their own.',
  },
  navy_marine: {
    id: 'navy_marine',
    name: 'Navy Marine',
    specialty: 'musket',
    emoji: '🪖',
    rarity: 'common',
    baseHp: 36,
    baseAtk: 15,
    baseDef: 12,
    baseSpeed: 12,
    moveIds: ['flintlock_shot'],
    flavor: 'Sent to bring wanted pirates to the gallows.',
  },
  navy_lieutenant: {
    id: 'navy_lieutenant',
    name: 'Navy Lieutenant',
    specialty: 'musket',
    emoji: '🎖️',
    rarity: 'uncommon',
    baseHp: 50,
    baseAtk: 21,
    baseDef: 16,
    baseSpeed: 15,
    moveIds: ['volley_fire', 'flintlock_shot'],
    flavor: 'Leads boarding parties against known pirate crews.',
  },
  navy_captain: {
    id: 'navy_captain',
    name: "Navy Man-o'-War Captain",
    specialty: 'cannon',
    emoji: '⚜️',
    rarity: 'rare',
    baseHp: 68,
    baseAtk: 26,
    baseDef: 22,
    baseSpeed: 13,
    moveIds: ['cannon_broadside', 'volley_fire'],
    flavor: 'Commands a warship hunting the most wanted names at sea.',
  },
};

interface ThreatTier {
  minHeat: number;
  table: EncounterSlot[];
}

const RIVAL_TIERS: ThreatTier[] = [
  {
    minHeat: 0,
    table: [{ templateId: 'rival_deckhand', weight: 1, minLevel: 2, maxLevel: 5 }],
  },
  {
    minHeat: 25,
    table: [
      { templateId: 'rival_deckhand', weight: 2, minLevel: 4, maxLevel: 7 },
      { templateId: 'rival_corsair', weight: 2, minLevel: 6, maxLevel: 9 },
    ],
  },
  {
    minHeat: 55,
    table: [
      { templateId: 'rival_corsair', weight: 2, minLevel: 8, maxLevel: 11 },
      { templateId: 'rival_captain', weight: 1, minLevel: 10, maxLevel: 14 },
    ],
  },
];

const NAVY_TIERS: ThreatTier[] = [
  {
    minHeat: 25,
    table: [{ templateId: 'navy_marine', weight: 1, minLevel: 4, maxLevel: 7 }],
  },
  {
    minHeat: 50,
    table: [
      { templateId: 'navy_marine', weight: 2, minLevel: 6, maxLevel: 9 },
      { templateId: 'navy_lieutenant', weight: 2, minLevel: 8, maxLevel: 11 },
    ],
  },
  {
    minHeat: 75,
    table: [
      { templateId: 'navy_lieutenant', weight: 2, minLevel: 10, maxLevel: 13 },
      { templateId: 'navy_captain', weight: 1, minLevel: 12, maxLevel: 16 },
    ],
  },
];

function tableForHeat(tiers: ThreatTier[], heat: number): EncounterSlot[] | null {
  let chosen: EncounterSlot[] | null = null;
  for (const tier of tiers) {
    if (heat >= tier.minHeat) chosen = tier.table;
  }
  return chosen;
}

/** Chance an ambush of the given faction is rolled on a movement tick, given current heat (0-100). */
export function ambushChance(faction: ThreatFaction, heat: number): number {
  if (faction === 'rival') {
    return Math.min(0.12, 0.015 + heat * 0.0022);
  }
  if (heat < 25) return 0;
  return Math.min(0.1, (heat - 25) * 0.0022);
}

export function rivalTableForHeat(heat: number): EncounterSlot[] | null {
  return tableForHeat(RIVAL_TIERS, heat);
}

export function navyTableForHeat(heat: number): EncounterSlot[] | null {
  return tableForHeat(NAVY_TIERS, heat);
}
