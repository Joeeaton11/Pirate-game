import { CrewTemplate } from '../types';

/** The ship you need before you can sail anywhere at all. Starts docked on Tortuga's quay,
 * guarded by her captain — walk up before capturing her and it's a forced duel, not a random
 * roll. Once captured she's a real, trackable position (not just decoration): board her to
 * unlock sailing, and she parks herself wherever you make landfall next, waiting for you to
 * walk back and board her again. See MapScreen.tsx for the board/disembark/sea-blocked logic
 * this drives. */
export const BLACK_PEARL_ISLAND_ID = 'tortuga_cove';
// Docked at the tip of the westernmost pier (harbor.ts PIERS[0], the docks-and-careening quarter)
// — a few units past the actual tip, so her hull sits in open water just beyond the boardwalk
// instead of overlapping it. islandAtPoint() treats the pier itself as walkable land (see
// islands.ts's PIER_WALK_RADIUS), so walking to the end of the jetty is enough to board her.
export const BLACK_PEARL_START_OFFSET = { x: -208, y: -458 };
export const BLACK_PEARL_EMOJI = '🚢';
export const BLACK_PEARL_FLAG_EMOJI = '🏴‍☠️';

// Deliberately weak for a "boss" — this fight happens before the player can sail anywhere, so
// there's no way to grind first (Tortuga is a safe zone with zero wild encounters by design), and
// a loss can't be undone by leveling up before trying again. Original stats (baseHp 42/atk 17/def
// 11 at level 4) were a straightforward "rare"-tier template and lost to the starting Deckhand
// Swordsman (lvl 3: 46hp/17atk/11def) in browser testing — she out-damaged him roughly 2:1 and
// outlasted his hits 5-to-2, the opposite of "reliably winnable." Cut down here so the starting
// crew member's own numbers (17atk/11def) comfortably out-damage her while she needs several more
// hits than she gets to return the favor.
export const BLACK_PEARL_CAPTAIN_TEMPLATE: CrewTemplate = {
  id: 'black_pearl_captain',
  name: 'Captain Odessa Kane',
  specialty: 'blade',
  emoji: '🏴‍☠️',
  rarity: 'rare',
  baseHp: 20,
  baseAtk: 7,
  baseDef: 8,
  baseSpeed: 15,
  moveIds: ['cutlass_slash'],
  flavor: "Won the Black Pearl in a duel, same as everyone before her — she's not planning to lose it the same way.",
};

export const BLACK_PEARL_CAPTAIN_LEVEL = 4;

export const BLACK_PEARL_INTRO_DIALOGUE =
  "Every soul in this harbor knows the rule: you want the Black Pearl, you take her from me. Draw steel, then.";
export const BLACK_PEARL_CAPTURED_LOG =
  "Captain Odessa Kane concedes the deck! The Black Pearl is yours.";
