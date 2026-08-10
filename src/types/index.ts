// Core game types shared across data, store, and screens.

export type Specialty = 'blade' | 'musket' | 'cannon' | 'brawler' | 'curse';

export interface Move {
  id: string;
  name: string;
  specialty: Specialty;
  power: number;
  accuracy: number; // 0-1
  description: string;
}

export interface CrewTemplate {
  id: string;
  name: string;
  specialty: Specialty;
  emoji: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  baseHp: number;
  baseAtk: number;
  baseDef: number;
  baseSpeed: number;
  moveIds: string[];
  flavor: string;
}

export interface OwnedCrewMember {
  instanceId: string;
  templateId: string;
  nickname: string;
  level: number;
  xp: number;
  currentHp: number;
}

export interface EncounterSlot {
  templateId: string;
  weight: number;
  minLevel: number;
  maxLevel: number;
}

export interface Island {
  id: string;
  name: string;
  emoji: string;
  description: string;
  position: { x: number; y: number }; // absolute world coordinates (center of landmass)
  // Organic coastline outline, as points relative to `position` (in world units), tracing an
  // approximation of the real island's true shape/orientation for land/sea detection + rendering.
  shape: { x: number; y: number }[];
  isSafeZone?: boolean; // no encounters, heals crew on arrival
  encounterChance: number; // 0-1 chance rolled per movement tick while on land here
  encounterTable: EncounterSlot[];
}

export interface BattleLogEntry {
  id: string;
  text: string;
}

export type ItemEffect = 'heal' | 'battle_boost' | 'guaranteed_recruit' | 'force_promote' | 'dig_key';

export interface Item {
  id: string;
  name: string;
  emoji: string;
  description: string;
  price: number;
  effect: ItemEffect;
  healPercent?: number; // for 'heal': fraction of max HP restored
  boostMultiplier?: number; // for 'battle_boost': damage multiplier on next attack
  usableOutsideBattle?: boolean;
  usableInBattle?: boolean;
}
