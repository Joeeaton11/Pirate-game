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
  /** If set, gates this lord on a completed side quest instead of the sequential order chain. */
  requiresQuestId?: string;
}

export const PIRATE_LORDS: PirateLord[] = [
  {
    id: 'lord_cow_island',
    islandId: 'cow_island',
    order: 1,
    name: 'Grizzle Bones',
    title: 'the Reaver of Cow Island',
    emoji: '🏴‍☠️',
    buildingOffset: { x: 0, y: -240 },
    level: 6,
    badgeName: 'Muster Marque',
    introDialogue:
      "So you fancy yourself a captain? Show me you can handle a blade before you go bothering the real powers of these waters.",
    defeatDialogue:
      "Ha! Not bad, green crew. Take this marque — you've earned the right to call yourself a captain.",
    lockedDialogue: "Come back when you've actually done something worth my time.",
    template: {
      id: 'lord_cow_island',
      name: 'Grizzle Bones',
      specialty: 'blade',
      emoji: '🏴‍☠️',
      rarity: 'legendary',
      baseHp: 55,
      baseAtk: 24,
      baseDef: 16,
      baseSpeed: 16,
      moveIds: ['cutlass_slash', 'boarding_rush'],
      flavor: 'The self-declared reaver-king of Cow Island.',
    },
  },
  {
    id: 'lord_new_providence',
    islandId: 'new_providence',
    order: 2,
    name: 'Iron Jenny',
    title: 'Queen of the Republic',
    emoji: '🦅',
    buildingOffset: { x: 180, y: -140 },
    level: 9,
    badgeName: "Queen's Marque",
    introDialogue:
      "A muster marque, is it? Cute. Let's see if you can shoot as well as you can talk.",
    defeatDialogue:
      "Straight shooting. You've got my marque and my respect — rare, both of them.",
    lockedDialogue: "Bones's marque or nothing, sailor. Go earn it.",
    template: {
      id: 'lord_new_providence',
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
    id: 'lord_roatan',
    islandId: 'roatan',
    order: 3,
    name: 'Captain Bellows',
    title: 'Lord of Roatán',
    emoji: '💣',
    buildingOffset: { x: -180, y: -180 },
    level: 12,
    badgeName: 'Roatán Marque',
    introDialogue:
      "Two marques already? You're either very good or very lucky. My guns will settle which.",
    defeatDialogue:
      "By thunder. Take the marque — and my cove. It's more yours than mine now.",
    lockedDialogue: "Two marques first. Then we'll talk cannons.",
    template: {
      id: 'lord_roatan',
      name: 'Captain Bellows',
      specialty: 'cannon',
      emoji: '💣',
      rarity: 'legendary',
      baseHp: 70,
      baseAtk: 30,
      baseDef: 22,
      baseSpeed: 15,
      moveIds: ['cannon_broadside', 'grapeshot_blast'],
      flavor: 'Commands the careening yards of Roatán with an iron gun crew.',
    },
  },
  {
    id: 'lord_port_royal',
    islandId: 'port_royal',
    order: 4,
    name: 'Marietta Graves',
    title: 'the Drowned Widow',
    emoji: '👻',
    buildingOffset: { x: 320, y: -60 },
    level: 15,
    badgeName: "Widow's Marque",
    introDialogue:
      "Three marques. The city respects you, a little. Let's see if the deep does too.",
    defeatDialogue:
      "The sea itself vouches for you now. Take my marque, captain — you've more than earned it.",
    lockedDialogue: "The sunken city doesn't part for the unworthy. Three marques, then return.",
    template: {
      id: 'lord_port_royal',
      name: 'Marietta Graves',
      specialty: 'curse',
      emoji: '👻',
      rarity: 'legendary',
      baseHp: 78,
      baseAtk: 33,
      baseDef: 24,
      baseSpeed: 19,
      moveIds: ['krakens_grip', 'ghostly_wail'],
      flavor: 'Drowned once, when the city sank beneath her, and came back captain of the ruins all the same.',
    },
  },
  {
    id: 'lord_ile_sainte_marie',
    islandId: 'ile_sainte_marie',
    order: 5,
    name: 'Finn Maelstrom',
    title: 'the Last Free Captain',
    emoji: '🌀',
    buildingOffset: { x: 0, y: 260 },
    level: 20,
    badgeName: "Libertalia's Marque",
    introDialogue:
      "Four marques, and still you sail into my whirlpool. Either you're the real thing, or the sea's about to prove you're not.",
    defeatDialogue:
      "Five marques. There hasn't been a captain to claim them all in a generation. Île Sainte-Marie is yours, and so is your name, now.",
    lockedDialogue: "Four marques or the whirlpool takes you. Those are the only two options.",
    template: {
      id: 'lord_ile_sainte_marie',
      name: 'Finn Maelstrom',
      specialty: 'curse',
      emoji: '🌀',
      rarity: 'legendary',
      baseHp: 95,
      baseAtk: 38,
      baseDef: 28,
      baseSpeed: 20,
      moveIds: ['krakens_grip', 'cannon_broadside'],
      flavor: 'The last free captain of Île Sainte-Marie, bound to it as much as it is to him.',
    },
  },
  {
    id: 'lord_ocracoke_inlet',
    islandId: 'ocracoke_inlet',
    order: 6,
    name: 'Blackbeard',
    title: 'Terror of the Atlantic',
    emoji: '💀',
    buildingOffset: { x: 0, y: -200 },
    level: 25,
    badgeName: "Terror's Marque",
    introDialogue:
      "The Council sent you? Then you're the real thing after all. Funny — this inlet's where I'm meant to die. Let's see whose legend that really is.",
    defeatDialogue:
      "Ha! So it is. Take the marque, captain — and the waters. They were only ever mine to borrow.",
    lockedDialogue: "The Council decides who's worth my time. Go convince them first.",
    requiresQuestId: 'quest_pirate_council',
    template: {
      id: 'lord_ocracoke_inlet',
      name: 'Blackbeard',
      specialty: 'blade',
      emoji: '💀',
      rarity: 'legendary',
      baseHp: 120,
      baseAtk: 44,
      baseDef: 32,
      baseSpeed: 22,
      moveIds: ['cutlass_slash', 'krakens_grip'],
      flavor: 'The real Edward Teach, still holding the inlet where history says he fell.',
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

export function isLordUnlocked(
  lord: PirateLord,
  defeatedLordIds: string[],
  completedQuestIds: string[] = []
): boolean {
  if (lord.requiresQuestId) return completedQuestIds.includes(lord.requiresQuestId);
  if (lord.order <= 1) return true;
  const previous = PIRATE_LORDS.find((l) => l.order === lord.order - 1);
  return previous ? defeatedLordIds.includes(previous.id) : true;
}
