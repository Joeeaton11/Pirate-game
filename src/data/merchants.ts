import { EncounterSlot, CrewTemplate } from '../types';
import { ResourceId } from './resources';

/** Merchant vessels: weak, non-combatant crews, plundered for gold + cargo rather than recruited. */
export const MERCHANT_TEMPLATES: Record<string, CrewTemplate> = {
  fishing_trawler: {
    id: 'fishing_trawler',
    name: 'Fishing Trawler',
    specialty: 'brawler',
    emoji: '🚤',
    rarity: 'common',
    baseHp: 22,
    baseAtk: 7,
    baseDef: 5,
    baseSpeed: 9,
    moveIds: ['brawl'],
    flavor: 'A humble trawler, nets heavy with the day\'s catch.',
  },
  timber_galleon: {
    id: 'timber_galleon',
    name: 'Timber Galleon',
    specialty: 'blade',
    emoji: '🪚',
    rarity: 'common',
    baseHp: 24,
    baseAtk: 8,
    baseDef: 6,
    baseSpeed: 8,
    moveIds: ['cutlass_slash'],
    flavor: 'Riding low in the water, hull packed with fresh-cut timber.',
  },
  rum_runner: {
    id: 'rum_runner',
    name: 'Rum Runner',
    specialty: 'musket',
    emoji: '🛶',
    rarity: 'common',
    baseHp: 22,
    baseAtk: 8,
    baseDef: 5,
    baseSpeed: 11,
    moveIds: ['flintlock_shot'],
    flavor: 'Fast and light, built for outrunning the customs house — not you.',
  },
  powder_hulk: {
    id: 'powder_hulk',
    name: 'Powder Hulk',
    specialty: 'cannon',
    emoji: '⛴️',
    rarity: 'common',
    baseHp: 26,
    baseAtk: 9,
    baseDef: 7,
    baseSpeed: 7,
    moveIds: ['cannon_broadside'],
    flavor: 'A lumbering transport, escorted by nothing but bad luck.',
  },
};

export interface MerchantCargo {
  templateId: string;
  resourceId: ResourceId;
  minYield: number;
  maxYield: number;
}

export const MERCHANT_CARGO: Record<string, MerchantCargo> = {
  fishing_trawler: { templateId: 'fishing_trawler', resourceId: 'fish', minYield: 4, maxYield: 8 },
  timber_galleon: { templateId: 'timber_galleon', resourceId: 'timber', minYield: 4, maxYield: 8 },
  rum_runner: { templateId: 'rum_runner', resourceId: 'rum', minYield: 3, maxYield: 6 },
  powder_hulk: { templateId: 'powder_hulk', resourceId: 'gunpowder', minYield: 2, maxYield: 5 },
};

/** Rolled only over open sea, alongside the wild/rival/navy checks. */
export const MERCHANT_SEA_CHANCE = 0.045;

export const MERCHANT_ENCOUNTER_TABLE: EncounterSlot[] = [
  { templateId: 'fishing_trawler', weight: 3, minLevel: 3, maxLevel: 8 },
  { templateId: 'timber_galleon', weight: 3, minLevel: 4, maxLevel: 10 },
  { templateId: 'rum_runner', weight: 2, minLevel: 5, maxLevel: 11 },
  { templateId: 'powder_hulk', weight: 2, minLevel: 6, maxLevel: 13 },
];

export function merchantGoldReward(level: number): number {
  return 10 + level * 3;
}
