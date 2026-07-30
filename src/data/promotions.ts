export interface PromotionRule {
  templateId: string;
  nextTemplateId: string;
  level: number;
}

/**
 * Evolution-equivalent: each line follows the specialty's rarity tiers upward.
 * Blade and cannon run three stages (common -> uncommon -> rare); musket and
 * brawler stop at two (no rare tier exists for them yet); curse starts at
 * rare and tops out at legendary. Mixed stage counts are intentional, same
 * as real Pokemon evolution families.
 */
export const PROMOTIONS: PromotionRule[] = [
  { templateId: 'deckhand_swordsman', nextTemplateId: 'boarding_captain', level: 10 },
  { templateId: 'boarding_captain', nextTemplateId: 'duelist_first_mate', level: 20 },
  { templateId: 'powder_monkey', nextTemplateId: 'gun_deck_veteran', level: 10 },
  { templateId: 'gun_deck_veteran', nextTemplateId: 'master_gunner', level: 20 },
  { templateId: 'dockside_sharpshooter', nextTemplateId: 'musketeer_marksman', level: 10 },
  { templateId: 'cabin_hand', nextTemplateId: 'tavern_brawler', level: 10 },
  { templateId: 'cursed_bosun', nextTemplateId: 'kraken_bound_captain', level: 30 },
];

export function promotionFor(templateId: string): PromotionRule | undefined {
  return PROMOTIONS.find((p) => p.templateId === templateId);
}

/** Cascades through as many promotion stages as `level` qualifies for in one jump. */
export function resolvePromotion(templateId: string, level: number): string {
  let current = templateId;
  let promo = promotionFor(current);
  while (promo && level >= promo.level) {
    current = promo.nextTemplateId;
    promo = promotionFor(current);
  }
  return current;
}
