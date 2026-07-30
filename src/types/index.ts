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
  radius: number; // landmass radius in world units, for land/sea detection
  isSafeZone?: boolean; // no encounters, heals crew on arrival
  encounterChance: number; // 0-1 chance rolled per movement tick while on land here
  encounterTable: EncounterSlot[];
}

export interface BattleLogEntry {
  id: string;
  text: string;
}
