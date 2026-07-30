import { Item } from '../types';

export const ITEMS: Record<string, Item> = {
  rum_ration: {
    id: 'rum_ration',
    name: 'Rum Ration',
    emoji: '🍶',
    description: 'A stiff drink that patches up wounds. Heals 40% of max HP.',
    price: 15,
    effect: 'heal',
    healPercent: 0.4,
    usableOutsideBattle: true,
    usableInBattle: true,
  },
  grapeshot_charge: {
    id: 'grapeshot_charge',
    name: 'Grapeshot Charge',
    emoji: '💥',
    description: 'A volatile powder charge. Boosts your next attack.',
    price: 25,
    effect: 'battle_boost',
    boostMultiplier: 1.5,
    usableOutsideBattle: false,
    usableInBattle: true,
  },
  forged_papers: {
    id: 'forged_papers',
    name: 'Forged Papers',
    emoji: '📜',
    description: 'Convincing enough to make any wild pirate think you already sail together. Guarantees your next recruit attempt.',
    price: 80,
    effect: 'guaranteed_recruit',
    usableOutsideBattle: false,
    usableInBattle: true,
  },
};

export const ITEM_LIST = Object.values(ITEMS);
