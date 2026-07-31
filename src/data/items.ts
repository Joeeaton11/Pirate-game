import { Item } from '../types';
import { ResourceId } from './resources';

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
  captains_draught: {
    id: 'captains_draught',
    name: "Captain's Draught",
    emoji: '🍾',
    description:
      'A rare rum blend that inspires immediate advancement. Force-promotes a crew member to their next stage, regardless of level. Craft-only — never sold.',
    price: 0,
    effect: 'force_promote',
    usableOutsideBattle: true,
    usableInBattle: false,
  },
};

export const ITEM_LIST = Object.values(ITEMS);

export interface CraftingRecipe {
  itemId: string;
  resourceId: ResourceId;
  resourceCost: number;
}

export const CRAFTING_RECIPES: CraftingRecipe[] = [
  { itemId: 'rum_ration', resourceId: 'rum', resourceCost: 2 },
  { itemId: 'grapeshot_charge', resourceId: 'gunpowder', resourceCost: 3 },
  { itemId: 'captains_draught', resourceId: 'rum', resourceCost: 5 },
];

export function craftingRecipeFor(itemId: string): CraftingRecipe | undefined {
  return CRAFTING_RECIPES.find((r) => r.itemId === itemId);
}
