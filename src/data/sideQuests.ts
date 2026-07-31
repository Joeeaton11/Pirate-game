import { CrewTemplate, Specialty } from '../types';

export type SideQuestType = 'bounty' | 'fetch' | 'specialty_gate' | 'escort' | 'heat_bounty';

interface SideQuestBase {
  id: string;
  islandId: string;
  // Standalone quests get their own walk-up map marker via `offset`. A quest hosted by a
  // building instead (a "patron" you talk to inside) sets `hostedByBuildingId` and omits
  // `offset` entirely — no marker of its own, reached via that building's Patrons section.
  offset?: { x: number; y: number }; // relative to island center, in world units
  hostedByBuildingId?: string;
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
  requiresAllLordsDefeated?: boolean;
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
  cattle_rustler_bandit: {
    id: 'cattle_rustler_bandit',
    name: 'The Rustler',
    specialty: 'blade',
    emoji: '🥷',
    rarity: 'rare',
    baseHp: 50,
    baseAtk: 22,
    baseDef: 14,
    baseSpeed: 18,
    moveIds: ['cutlass_slash', 'boarding_rush'],
    flavor: "A rustler who's been raiding the muster camp's cattle and supply boats for months.",
  },
  tavern_troublemaker: {
    id: 'tavern_troublemaker',
    name: 'The Troublemaker',
    specialty: 'brawler',
    emoji: '🤛',
    rarity: 'common',
    baseHp: 32,
    baseAtk: 14,
    baseDef: 8,
    baseSpeed: 12,
    moveIds: ['brawl', 'bottle_bash'],
    flavor: 'Starts a fight most nights and never remembers who won.',
  },
  warehouse_thief: {
    id: 'warehouse_thief',
    name: 'The Skimmer',
    specialty: 'brawler',
    emoji: '🕵️',
    rarity: 'common',
    baseHp: 35,
    baseAtk: 15,
    baseDef: 9,
    baseSpeed: 14,
    moveIds: ['brawl', 'bottle_bash'],
    flavor: "Been skimming crates off the top for months. Time someone caught him at it.",
  },
};

export const SIDE_QUESTS: SideQuest[] = [
  {
    id: 'quest_cattle_rustler',
    type: 'bounty',
    islandId: 'cow_island',
    offset: { x: -150, y: 60 },
    title: 'Cull the Cattle Rustler',
    npcName: 'Constable Reyes',
    npcEmoji: '👮',
    introDialogue:
      "There's a rustler's been raiding the muster camp's cattle and supply stores — the crews here call him the Rustler. Bring him down and there's coin in it for you.",
    acceptedDialogue:
      "The Rustler's been spotted skulking around the grazing flats. Find him and finish it.",
    completeDialogue:
      "Word already reached me — the Rustler's done raiding. Cow Island owes you a debt, captain.",
    goldReward: 60,
    bountyTemplateId: 'cattle_rustler_bandit',
    bountyLevel: 6,
  },
  {
    id: 'quest_toast_fallen',
    type: 'fetch',
    islandId: 'new_providence',
    offset: { x: 130, y: 100 },
    title: 'A Toast for the Fallen',
    npcName: 'Widow Hallis',
    npcEmoji: '🧕',
    introDialogue:
      "My husband sailed from this harbor and never came back. Bring me a Rum Ration so I can pour one out for him properly.",
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
    islandId: 'roatan',
    offset: { x: 140, y: -60 },
    title: 'The Locked Vault',
    npcName: 'Quartermaster Bly',
    npcEmoji: '🔐',
    introDialogue:
      "There's an old naval vault wedged in the careening yards here, sealed tight. Only cannon fire's ever cracked one of these open. Bring me a gunner and it's yours to split.",
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
    islandId: 'port_royal',
    offset: { x: -150, y: 120 },
    title: 'Escort the Merchant Convoy',
    npcName: 'Captain Osei',
    npcEmoji: '🧑‍✈️',
    introDialogue:
      "My convoy's due through these waters, and rival raiders have been circling like sharks. Sail escort for us — two waves, maybe more — and there's a cut of the cargo in it for you.",
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
  {
    id: 'quest_pirate_council',
    type: 'escort',
    islandId: 'ocracoke_inlet',
    offset: { x: 100, y: 80 },
    title: 'The Pirate Council',
    npcName: 'The Council Herald',
    npcEmoji: '📯',
    introDialogue:
      "Every captain you've bested wants a rematch, all at once, right here — that's the Council's way. Beat all five, back-to-back, no quarter given between bouts, and you'll have earned the right to face what waits beyond them.",
    acceptedDialogue:
      "Five captains, one after another, no rest between. The Council doesn't care that you've already beaten them once.",
    completeDialogue:
      "Five for five. There's nothing left the Council can teach you, captain. What's beyond is yours to face now.",
    goldReward: 500,
    waveTemplateIds: [
      'lord_cow_island',
      'lord_new_providence',
      'lord_roatan',
      'lord_port_royal',
      'lord_ile_sainte_marie',
    ],
    waveLevels: [11, 14, 17, 20, 25],
    requiresAllLordsDefeated: true,
  },
  {
    id: 'patron_tortuga_drunk',
    type: 'fetch',
    islandId: 'tortuga_cove',
    hostedByBuildingId: 'tortuga_tavern',
    title: 'One More Round',
    npcName: 'Wobbly Pete',
    npcEmoji: '🥴',
    introDialogue:
      "Buy us a round, hair of the dog and all that. A Rum Ration would set me right as rain.",
    acceptedDialogue: "Still parched over here, captain. One Rum Ration, that's all I ask.",
    completeDialogue:
      "Ahh, there we are. You're a saint, or the closest thing to one in this tavern.",
    goldReward: 10,
    fetchItemId: 'rum_ration',
    fetchCount: 1,
  },
  {
    id: 'patron_tortuga_local',
    type: 'bounty',
    islandId: 'tortuga_cove',
    hostedByBuildingId: 'tortuga_tavern',
    title: 'Settle the Tab',
    npcName: 'Barmaid Ross',
    npcEmoji: '🙍‍♀️',
    introDialogue:
      "See that lout in the corner? Picks a fight most nights and I'm sick of mopping up the mess. Rough him up proper and there's coin in it for you.",
    acceptedDialogue: "He's still swaggering around out there causing bother. You know what to do.",
    completeDialogue:
      "Peace and quiet, finally. Drinks are on the house next time — well, one drink.",
    goldReward: 20,
    bountyTemplateId: 'tavern_troublemaker',
    bountyLevel: 4,
  },
  {
    id: 'patron_tortuga_rival',
    type: 'fetch',
    islandId: 'tortuga_cove',
    hostedByBuildingId: 'tortuga_tavern',
    title: 'No Questions Asked',
    npcName: 'Scar-Faced Odom',
    npcEmoji: '🦹‍♂️',
    introDialogue:
      "Don't ask where it's headed, don't ask who it's for. Just get me a Grapeshot Charge, quiet-like, and there's coin in it — more than it's worth, honestly.",
    acceptedDialogue: "Still waiting on that charge. Quietly, mind.",
    completeDialogue: "Didn't see a thing, didn't hear a thing. Pleasure doing business.",
    goldReward: 15,
    fetchItemId: 'grapeshot_charge',
    fetchCount: 1,
  },
  {
    id: 'patron_tortuga_fort',
    type: 'fetch',
    islandId: 'tortuga_cove',
    hostedByBuildingId: 'tortuga_fort',
    title: 'Rations for the Garrison',
    npcName: 'Private Renn',
    npcEmoji: '🪖',
    introDialogue:
      "Garrison's rations are thin as paper this week. Bring us Ship's Biscuit and the sergeant might even remember your name.",
    acceptedDialogue: "Still waiting on that biscuit, captain. Bellies don't fill themselves.",
    completeDialogue: "Now that's a soldier's friend. Thank you kindly — the garrison eats tonight.",
    goldReward: 15,
    fetchItemId: 'ships_biscuit',
    fetchCount: 1,
  },
  {
    id: 'patron_tortuga_chapel',
    type: 'specialty_gate',
    islandId: 'tortuga_cove',
    hostedByBuildingId: 'tortuga_chapel',
    title: 'A Soul to Cleanse',
    npcName: 'Sister Elodie',
    npcEmoji: '🙇‍♀️',
    introDialogue:
      "Something dark rides with one of your crew — I can feel it from here. Bring them to kneel at the altar, and we'll see what can be lifted.",
    acceptedDialogue: "The altar's still waiting, captain. Bring the cursed one when you're ready.",
    completeDialogue: "There — lighter already, aren't they? Some weights take more than one prayer, but it's a start.",
    goldReward: 30,
    requiredSpecialty: 'curse',
  },
  {
    id: 'patron_tortuga_warehouse',
    type: 'bounty',
    islandId: 'tortuga_cove',
    hostedByBuildingId: 'tortuga_warehouse',
    title: 'Catch the Skimmer',
    npcName: 'Skinny Jorge',
    npcEmoji: '🕵️',
    introDialogue:
      "Someone's been skimming crates off every shipment for months. Pella doesn't know yet. Catch him quiet and there's a cut in it for you.",
    acceptedDialogue: "He's still working the night shifts, bold as brass. Go on, catch him at it.",
    completeDialogue: "Caught red-handed, was he? Good. Pella never needs to know how close he came to losing everything.",
    goldReward: 20,
    bountyTemplateId: 'warehouse_thief',
    bountyLevel: 4,
  },
  {
    id: 'patron_tortuga_west_point',
    type: 'fetch',
    islandId: 'tortuga_cove',
    hostedByBuildingId: 'tortuga_west_point',
    title: 'One Last Toast',
    npcName: 'Widow Yara',
    npcEmoji: '👵',
    introDialogue:
      "Old Hollis and my late husband used to share a bottle out here every full moon. Bring me a Rum Ration and let an old woman keep the tradition alive.",
    acceptedDialogue: "The moon's not getting any younger, captain. Neither am I.",
    completeDialogue: "There we are. To absent friends — and to you, for humoring an old woman's memories.",
    goldReward: 15,
    fetchItemId: 'rum_ration',
    fetchCount: 1,
  },
  {
    id: 'patron_tortuga_mystic',
    type: 'specialty_gate',
    islandId: 'tortuga_cove',
    hostedByBuildingId: 'tortuga_tavern',
    title: 'A Ward Needs Breaking',
    npcName: 'Mother Yew',
    npcEmoji: '🔮',
    introDialogue:
      "Something's curdled the luck in this tavern — I can feel it in my bones. Bring me one touched by the curse itself, and we'll set it right.",
    acceptedDialogue:
      "Still no cursed soul at your side, captain. The ward holds until one stands with you.",
    completeDialogue:
      "There — the air's lighter already. You've done this tavern a kindness money can't buy.",
    goldReward: 35,
    requiredSpecialty: 'curse',
  },
];

export function sideQuestsForIsland(islandId: string): SideQuest[] {
  return SIDE_QUESTS.filter((q) => q.islandId === islandId);
}

/** Only call this for quests that have a map marker of their own (i.e. `offset` is set) —
 * a building-hosted patron quest has no offset and is reached via that building instead. */
export function sideQuestWorldPosition(
  quest: SideQuest & { offset: { x: number; y: number } },
  islandPosition: { x: number; y: number }
): { x: number; y: number } {
  return { x: islandPosition.x + quest.offset.x, y: islandPosition.y + quest.offset.y };
}
