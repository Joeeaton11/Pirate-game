import { CREW_TEMPLATES } from '../data/crew';
import { MOVES } from '../data/moves';
import { CrewTemplate, OwnedCrewMember, Specialty } from '../types';

// Rock-paper-scissors style effectiveness triangle: blade > musket > cannon > blade.
// Brawler and curse sit outside the triangle, with curse having a slight edge on brawler.
const EFFECTIVENESS: Partial<Record<Specialty, Partial<Record<Specialty, number>>>> = {
  blade: { musket: 1.5, cannon: 0.67 },
  musket: { cannon: 1.5, blade: 0.67 },
  cannon: { blade: 1.5, musket: 0.67 },
  curse: { brawler: 1.5 },
  brawler: { curse: 0.67 },
};

export function getEffectiveness(attacker: Specialty, defender: Specialty): number {
  return EFFECTIVENESS[attacker]?.[defender] ?? 1;
}

export interface Stats {
  hp: number;
  atk: number;
  def: number;
  speed: number;
}

export function statsAtLevel(template: CrewTemplate, level: number): Stats {
  return {
    hp: Math.round(template.baseHp + template.baseHp * 0.12 * level),
    atk: Math.round(template.baseAtk + template.baseAtk * 0.08 * level),
    def: Math.round(template.baseDef + template.baseDef * 0.08 * level),
    speed: Math.round(template.baseSpeed + template.baseSpeed * 0.05 * level),
  };
}

/** Pass `template` explicitly for wild/threat creatures that aren't in CREW_TEMPLATES. */
export function maxHpFor(owned: OwnedCrewMember, template?: CrewTemplate): number {
  const resolved = template ?? CREW_TEMPLATES[owned.templateId];
  return statsAtLevel(resolved, owned.level).hp;
}

/** Permanent Atk/Def boost from Letters of Marque earned by defeating Pirate Lords. */
export function applyBadgeBoost(stats: Stats, badgeCount: number): Stats {
  const multiplier = 1 + badgeCount * 0.03;
  return {
    ...stats,
    atk: Math.round(stats.atk * multiplier),
    def: Math.round(stats.def * multiplier),
  };
}

let instanceCounter = 0;
export function createOwnedCrewMember(templateId: string, level: number): OwnedCrewMember {
  const template = CREW_TEMPLATES[templateId];
  const stats = statsAtLevel(template, level);
  instanceCounter += 1;
  return {
    instanceId: `${templateId}-${Date.now()}-${instanceCounter}`,
    templateId,
    nickname: template.name,
    level,
    xp: 0,
    currentHp: stats.hp,
  };
}

export interface DamageResult {
  damage: number;
  hit: boolean;
  effectivenessLabel: 'It worked wonders!' | 'It barely helped.' | null;
}

export function calcDamage(
  moveId: string,
  attackerStats: Stats,
  defenderStats: Stats,
  defenderSpecialty: Specialty
): DamageResult {
  const move = MOVES[moveId];
  const hit = Math.random() < move.accuracy;
  if (!hit) {
    return { damage: 0, hit: false, effectivenessLabel: null };
  }
  const multiplier = getEffectiveness(move.specialty, defenderSpecialty);
  const raw =
    (move.power * (attackerStats.atk / Math.max(defenderStats.def, 1))) / 4 + 4;
  const variance = 0.85 + Math.random() * 0.3;
  const damage = Math.max(1, Math.round(raw * multiplier * variance));
  const effectivenessLabel =
    multiplier > 1 ? 'It worked wonders!' : multiplier < 1 ? 'It barely helped.' : null;
  return { damage, hit: true, effectivenessLabel };
}

export function xpToNextLevel(level: number): number {
  return Math.round(20 * Math.pow(level, 1.4));
}

export function xpRewardFor(templateId: string, level: number, template?: CrewTemplate): number {
  const resolved = template ?? CREW_TEMPLATES[templateId];
  const rarityMultiplier =
    resolved.rarity === 'legendary'
      ? 4
      : resolved.rarity === 'rare'
      ? 2.5
      : resolved.rarity === 'uncommon'
      ? 1.5
      : 1;
  return Math.round(8 * level * rarityMultiplier);
}

/** Chance to successfully recruit a wild crew member, based on remaining HP and rarity. */
export function recruitChance(
  templateId: string,
  currentHp: number,
  maxHp: number
): number {
  const template = CREW_TEMPLATES[templateId];
  const rarityFactor =
    template.rarity === 'legendary'
      ? 0.18
      : template.rarity === 'rare'
      ? 0.35
      : template.rarity === 'uncommon'
      ? 0.55
      : 0.75;
  const hpFactor = 1 - currentHp / maxHp; // lower HP = easier to recruit
  const chance = rarityFactor * (0.25 + hpFactor * 0.9);
  return Math.min(0.95, Math.max(0.03, chance));
}

export function pickWildEncounter(
  table: { templateId: string; weight: number; minLevel: number; maxLevel: number }[]
): { templateId: string; level: number } {
  const totalWeight = table.reduce((sum, slot) => sum + slot.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const slot of table) {
    roll -= slot.weight;
    if (roll <= 0) {
      const level =
        slot.minLevel + Math.floor(Math.random() * (slot.maxLevel - slot.minLevel + 1));
      return { templateId: slot.templateId, level };
    }
  }
  const fallback = table[table.length - 1];
  return { templateId: fallback.templateId, level: fallback.minLevel };
}
