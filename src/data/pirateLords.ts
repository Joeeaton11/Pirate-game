import { CrewTemplate } from '../types';

export interface PirateLord {
  id: string;
  islandId: string;
  order: number; // 1-based; must defeat order N-1 before challenging order N
  name: string;
  title: string;
  emoji: string;
  buildingOffset: { x: number; y: number }; // relative to island center, in world units
  level: number;
  badgeName: string;
  introDialogue: string;
  defeatDialogue: string;
  lockedDialogue: string;
  template: CrewTemplate;
}

export const PIRATE_LORDS: PirateLord[] = [
  {
    id: 'lord_salt_marsh',
    islandId: 'salt_marsh_isle',
    order: 1,
    name: 'Redbeard Sully',
    title: 'the Marsh Reaver',
    emoji: '🏴‍☠️',
    buildingOffset: { x: 0, y: -120 },
    level: 6,
    badgeName: 'Marsh Marque',
    introDialogue:
      "So you fancy yourself a captain? Show me you can handle a blade before you go bothering the real powers of these waters.",
    defeatDialogue:
      "Ha! Not bad, green crew. Take this marque — you've earned the right to call yourself a captain.",
    lockedDialogue: "Come back when you've actually done something worth my time.",
    template: {
      id: 'lord_salt_marsh',
      name: 'Redbeard Sully',
      specialty: 'blade',
      emoji: '🏴‍☠️',
      rarity: 'legendary',
      baseHp: 55,
      baseAtk: 24,
      baseDef: 16,
      baseSpeed: 16,
      moveIds: ['cutlass_slash', 'boarding_rush'],
      flavor: 'The self-declared reaver-king of Salt Marsh Isle.',
    },
  },
  {
    id: 'lord_gullwing',
    islandId: 'gullwing_rock',
    order: 2,
    name: 'Iron Jenny',
    title: 'the Gull Queen',
    emoji: '🦅',
    buildingOffset: { x: 90, y: -70 },
    level: 9,
    badgeName: "Gull Queen's Marque",
    introDialogue:
      "A marsh marque, is it? Cute. Let's see if you can shoot as well as you can talk.",
    defeatDialogue:
      "Straight shooting. You've got my marque and my respect — rare, both of them.",
    lockedDialogue: "Sully's marque or nothing, sailor. Go earn it.",
    template: {
      id: 'lord_gullwing',
      name: 'Iron Jenny',
      specialty: 'musket',
      emoji: '🦅',
      rarity: 'legendary',
      baseHp: 62,
      baseAtk: 27,
      baseDef: 19,
      baseSpeed: 20,
      moveIds: ['flintlock_shot', 'volley_fire'],
      flavor: 'Never missed a shot, never lost a duel.',
    },
  },
  {
    id: 'lord_blackrock',
    islandId: 'blackrock_shoals',
    order: 3,
    name: 'Captain Bellows',
    title: 'Lord of Blackrock',
    emoji: '💣',
    buildingOffset: { x: -90, y: -90 },
    level: 12,
    badgeName: 'Blackrock Marque',
    introDialogue:
      "Two marques already? You're either very good or very lucky. My guns will settle which.",
    defeatDialogue:
      "By thunder. Take the marque — and my shoals. They're more yours than mine now.",
    lockedDialogue: "Two marques first. Then we'll talk cannons.",
    template: {
      id: 'lord_blackrock',
      name: 'Captain Bellows',
      specialty: 'cannon',
      emoji: '💣',
      rarity: 'legendary',
      baseHp: 70,
      baseAtk: 30,
      baseDef: 22,
      baseSpeed: 15,
      moveIds: ['cannon_broadside', 'grapeshot_blast'],
      flavor: 'Commands the reef fortress at Blackrock Shoals with an iron gun crew.',
    },
  },
  {
    id: 'lord_widows_reef',
    islandId: 'widows_reef',
    order: 4,
    name: 'Marietta Graves',
    title: 'the Drowned Widow',
    emoji: '👻',
    buildingOffset: { x: 160, y: -30 },
    level: 15,
    badgeName: "Widow's Marque",
    introDialogue:
      "Three marques. The fog respects you, a little. Let's see if the deep does too.",
    defeatDialogue:
      "The sea itself vouches for you now. Take my marque, captain — you've more than earned it.",
    lockedDialogue: "The fog doesn't part for the unworthy. Three marques, then return.",
    template: {
      id: 'lord_widows_reef',
      name: 'Marietta Graves',
      specialty: 'curse',
      emoji: '👻',
      rarity: 'legendary',
      baseHp: 78,
      baseAtk: 33,
      baseDef: 24,
      baseSpeed: 19,
      moveIds: ['krakens_grip', 'ghostly_wail'],
      flavor: 'Drowned once, and came back captain of the reef all the same.',
    },
  },
  {
    id: 'lord_serpents_maw',
    islandId: 'serpents_maw',
    order: 5,
    name: 'Ezra Vane',
    title: 'Master of the Maw',
    emoji: '🌀',
    buildingOffset: { x: 0, y: 130 },
    level: 20,
    badgeName: "Maw Master's Marque",
    introDialogue:
      "Four marques, and still you sail into my whirlpool. Either you're the real thing, or the sea's about to prove you're not.",
    defeatDialogue:
      "Five marques. There hasn't been a captain to claim them all in a generation. The Maw is yours, and so is your name, now.",
    lockedDialogue: "Four marques or the whirlpool takes you. Those are the only two options.",
    template: {
      id: 'lord_serpents_maw',
      name: 'Ezra Vane',
      specialty: 'curse',
      emoji: '🌀',
      rarity: 'legendary',
      baseHp: 95,
      baseAtk: 38,
      baseDef: 28,
      baseSpeed: 20,
      moveIds: ['krakens_grip', 'cannon_broadside'],
      flavor: 'The last free captain of Serpent\'s Maw, bound to it as much as it is to him.',
    },
  },
];

export const PIRATE_LORD_TEMPLATES: Record<string, CrewTemplate> = Object.fromEntries(
  PIRATE_LORDS.map((lord) => [lord.id, lord.template])
);

export function pirateLordForIsland(islandId: string): PirateLord | undefined {
  return PIRATE_LORDS.find((lord) => lord.islandId === islandId);
}

export function pirateLordWorldPosition(
  lord: PirateLord,
  islandPosition: { x: number; y: number }
): { x: number; y: number } {
  return {
    x: islandPosition.x + lord.buildingOffset.x,
    y: islandPosition.y + lord.buildingOffset.y,
  };
}

export function isLordUnlocked(lord: PirateLord, defeatedLordIds: string[]): boolean {
  if (lord.order <= 1) return true;
  const previous = PIRATE_LORDS.find((l) => l.order === lord.order - 1);
  return previous ? defeatedLordIds.includes(previous.id) : true;
}
