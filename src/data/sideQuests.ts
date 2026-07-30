import { CrewTemplate, Specialty } from '../types';

export type SideQuestType = 'bounty' | 'fetch' | 'specialty_gate' | 'escort' | 'heat_bounty';

interface SideQuestBase {
  id: string;
  islandId: string;
  offset: { x: number; y: number }; // relative to island center, in world units
  title: string;
  npcName: string;
  npcEmoji: string;
  introDialogue: string;
  acceptedDialogue: string;
  completeDialogue: string;
  goldReward: number;
}

export interface BountySideQuest extends SideQuestBase {
  type: 'bounty';
  bountyTemplateId: string;
  bountyLevel: number;
}

export interface FetchSideQuest extends SideQuestBase {
  type: 'fetch';
  fetchItemId: string;
  fetchCount: number;
}

export interface SpecialtyGateSideQuest extends SideQuestBase {
  type: 'specialty_gate';
  requiredSpecialty: Specialty;
}

/** A back-to-back wave gauntlet with no healing between waves; fails back to the same wave on defeat. */
export interface EscortSideQuest extends SideQuestBase {
  type: 'escort';
  waveTemplateIds: string[];
  waveLevels: number[];
}

/** Repeatable: never enters completedQuestIds, tracked instead via questTurnInCounts. */
export interface HeatBountySideQuest extends SideQuestBase {
  type: 'heat_bounty';
  heatReduction: number;
}

export type SideQuest =
  | BountySideQuest
  | FetchSideQuest
  | SpecialtyGateSideQuest
  | EscortSideQuest
  | HeatBountySideQuest;

/** Bounty targets: hostile-only, never recruitable, fought only via a side quest confrontation. */
export const BOUNTY_TEMPLATES: Record<string, CrewTemplate> = {
  marsh_viper_bandit: {
    id: 'marsh_viper_bandit',
    name: 'The Marsh Viper',
    specialty: 'blade',
    emoji: '🐍',
    rarity: 'rare',
    baseHp: 50,
    baseAtk: 22,
    baseDef: 14,
    baseSpeed: 18,
    moveIds: ['cutlass_slash', 'boarding_rush'],
    flavor: "A bandit who's been raiding the marsh's supply boats for months.",
  },
};

export const SIDE_QUESTS: SideQuest[] = [
  {
    id: 'quest_marsh_viper',
    type: 'bounty',
    islandId: 'salt_marsh_isle',
    offset: { x: -150, y: 60 },
    title: 'Cull the Marsh Viper',
    npcName: 'Constable Reyes',
    npcEmoji: '👮',
    introDialogue:
      "There's a bandit's been raiding our supply boats — calls himself the Marsh Viper. Bring him down and there's coin in it for you.",
    acceptedDialogue:
      "The Marsh Viper's been spotted skulking around these reeds. Find him and finish it.",
    completeDialogue:
      "Word already reached me — the Viper's done raiding. Salt Marsh owes you a debt, captain.",
    goldReward: 60,
    bountyTemplateId: 'marsh_viper_bandit',
    bountyLevel: 6,
  },
  {
    id: 'quest_toast_fallen',
    type: 'fetch',
    islandId: 'gullwing_rock',
    offset: { x: 130, y: 100 },
    title: 'A Toast for the Fallen',
    npcName: 'Widow Hallis',
    npcEmoji: '🧕',
    introDialogue:
      "My husband sailed from this rock and never came back. Bring me a Rum Ration so I can pour one out for him properly.",
    acceptedDialogue: "Still hoping you'll bring that rum, captain. It's a small thing to ask.",
    completeDialogue:
      "Thank you, truly. He'd have liked you. Here — take this for your trouble.",
    goldReward: 25,
    fetchItemId: 'rum_ration',
    fetchCount: 1,
  },
  {
    id: 'quest_locked_vault',
    type: 'specialty_gate',
    islandId: 'blackrock_shoals',
    offset: { x: 140, y: -60 },
    title: 'The Locked Vault',
    npcName: 'Quartermaster Bly',
    npcEmoji: '🔐',
    introDialogue:
      "There's an old naval vault wedged in the rocks here, sealed tight. Only cannon fire's ever cracked one of these open. Bring me a gunner and it's yours to split.",
    acceptedDialogue:
      "Still need a Cannon-type aboard to blast this vault open. Come back once you've got one.",
    completeDialogue:
      "Your gunner made short work of that door. Fair's fair — here's your share.",
    goldReward: 80,
    requiredSpecialty: 'cannon',
  },
  {
    id: 'quest_merchant_convoy',
    type: 'escort',
    islandId: 'widows_reef',
    offset: { x: -150, y: 120 },
    title: 'Escort the Merchant Convoy',
    npcName: 'Captain Osei',
    npcEmoji: '🧑‍✈️',
    introDialogue:
      "My convoy's due through this fog, and rival raiders have been circling like sharks. Sail escort for us — two waves, maybe more — and there's a cut of the cargo in it for you.",
    acceptedDialogue:
      "The raiders won't wait for you to catch your breath between waves. Brace yourself and confront them when you're ready.",
    completeDialogue:
      "We made it through without losing a crate. You've got a standing invitation on any of my ships, captain.",
    goldReward: 90,
    waveTemplateIds: ['rival_deckhand', 'rival_corsair'],
    waveLevels: [7, 10],
  },
  {
    id: 'quest_bounty_board',
    type: 'heat_bounty',
    islandId: 'tortuga_cove',
    offset: { x: 0, y: 130 },
    title: 'The Bounty Board',
    npcName: 'Constable Duval',
    npcEmoji: '📋',
    introDialogue:
      "Crown pays well for pirates and privateers brought to heel. Bring me proof of a fight won, and I'll square things with the crown on your behalf.",
    acceptedDialogue:
      "The board's always open, captain. Bring me a fight won and I'll pay out and cool your name with the crown.",
    completeDialogue:
      "The board's always open, captain. Bring me a fight won and I'll pay out and cool your name with the crown.",
    goldReward: 20,
    heatReduction: 15,
  },
];

export function sideQuestsForIsland(islandId: string): SideQuest[] {
  return SIDE_QUESTS.filter((q) => q.islandId === islandId);
}

export function sideQuestWorldPosition(
  quest: SideQuest,
  islandPosition: { x: number; y: number }
): { x: number; y: number } {
  return { x: islandPosition.x + quest.offset.x, y: islandPosition.y + quest.offset.y };
}
