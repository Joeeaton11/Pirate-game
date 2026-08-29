import { CrewTemplate } from '../types';
import { BattleBackdrop } from '../utils/battleBackdrop';

// Captain Blackfin — the Rival. GAME_DESIGN.md, Main Story Arc section 2.B / section 3 (the Acts).
// A recurring named character, not a generic `rival` encounter: introduced day one at Tortuga,
// then reappears at the next island after each Lord fight (Acts II-V), always having gotten there
// first. Modeled as a sequence of "stages" — one per appearance — so each Act's beat is just a data
// entry, not new engineering, once the pattern below is proven.
//
// Built 2026-08-10: the Tortuga intro (Act I.A, dialogue-only). Built 2026-08-11: the New
// Providence duel (Act II.A) — the first stage with `fightable: true`, reusing the existing
// `rival` encounter faction exactly as 2.B.3 specifies (optional, no marque, same permadeath risk
// as any other rival ambush — no new mechanic). Built 2026-08-11: the Roatán reappearance
// (Act III.A) — "first crack in his confidence" per the design, so this one's fightable too (2.B.3
// says duels are optional at *each* reappearance, not just New Providence), just rattled instead
// of cocky. Built 2026-08-11: the Port Royal reappearance (Act IV.C) — "the drowned city unsettles
// him more than any fight has," so the crack here is superstitious dread, not a fight loss; jail
// backdrop for the eerie ruins. Built 2026-08-11: the Île Sainte-Marie appearance (Act V.B) — his
// last pre-finale beat, where "the tone shifts from race to respect without him winning" (per the
// design): still fightable and he still loses, but the dialogue/victoryLine read as warmth and a
// send-off rather than another crack in his pride. Act VI (the Ocracoke finale, found humbled by
// Blackbeard) is still unbuilt.

export const BLACKFIN_NAME = 'Captain Blackfin';
export const BLACKFIN_EMOJI = '🦈';

/** One shared combat template — it's the same character at every fightable stage, only the level
 * (set per-stage below) changes. Kept out of src/data/crew.ts deliberately: like Pirate Lords,
 * Blackfin is never recruitable, so he has no business in the Crew Log. */
export const BLACKFIN_TEMPLATE: CrewTemplate = {
  id: 'blackfin',
  name: BLACKFIN_NAME,
  specialty: 'blade',
  emoji: BLACKFIN_EMOJI,
  rarity: 'legendary',
  baseHp: 58,
  baseAtk: 26,
  baseDef: 17,
  baseSpeed: 20,
  moveIds: ['boarding_rush', 'cutlass_slash'],
  flavor: "Faster to every island than he has any right to be.",
};

export interface BlackfinStage {
  id: string;
  islandId: string;
  offset: { x: number; y: number }; // relative to island center, in world units
  title: string;
  /** Shown one line at a time via ConversationBox, tap-to-advance (2026-08-29 — previously a
   * stacked mini-script with every line visible at once; swapped once Blackfin had real portrait
   * art to put in the box). */
  dialogue: string[];
  /** Whether this stage offers an optional duel (Act II onward) or is dialogue-only (Act I). */
  fightable: boolean;
  /** Required when fightable. Sets his level for maxHpFor — same shape as PirateLord.level. */
  level?: number;
  /** Required when fightable. Which battle backdrop the duel renders behind. */
  backdrop?: BattleBackdrop;
  /** Required when fightable. His own line on losing the duel — shown in the victory resolution
   * instead of the generic "X has been defeated" a plain rival ambush gets. */
  victoryLine?: string;
}

export const BLACKFIN_STAGES: BlackfinStage[] = [
  {
    id: 'blackfin_tortuga_intro',
    islandId: 'tortuga_cove',
    offset: { x: 170, y: -255 },
    title: 'A Familiar Face at the Docks',
    dialogue: [
      "Well, well. A new face crawling out of Tortuga's gutters, looking to be somebody.",
      "Six marques, six Lords, one crown nobody's actually wearing — you know the game. I'm already three moves ahead of you, captain.",
      "Cow Island's first on the list. Try to keep up — I'd hate to win before you've even started.",
    ],
    fightable: false,
  },
  {
    id: 'blackfin_new_providence_duel',
    islandId: 'new_providence',
    offset: { x: 180, y: -280 },
    title: 'Already Here',
    dialogue: [
      "Ha! Look who finally made it. Sully folded quick, didn't he? Let's see if you're worth the reputation.",
      "New Providence already knows my name. Care to make sure it remembers yours too?",
    ],
    fightable: true,
    level: 8,
    backdrop: 'town',
    victoryLine: "Not bad. Not bad at all. I'll remember this, captain — see you at the next port.",
  },
  {
    id: 'blackfin_roatan_reappearance',
    islandId: 'roatan',
    offset: { x: 380, y: 50 },
    title: 'Cracked Ribs, Dented Pride',
    dialogue: [
      "Bellows nearly had me. Cracked ribs, dented pride — but I'm still standing, and still ahead of you.",
      "Don't get comfortable. A rough patch isn't the same as losing the race.",
    ],
    fightable: true,
    level: 11,
    backdrop: 'fort',
    victoryLine: "...Alright. That one stung more than Bellows did. Don't let it go to your head.",
  },
  {
    id: 'blackfin_port_royal_reappearance',
    islandId: 'port_royal',
    offset: { x: 350, y: -50 },
    title: 'Something in the Water',
    dialogue: [
      "This city's half underwater and I still don't like it. Feels like it's watching.",
      "I've faced worse than ghosts. Probably. Still — humor me, and let's get this over with quick.",
    ],
    fightable: true,
    level: 13,
    backdrop: 'jail',
    victoryLine: "...Don't tell anyone I lost focus back there. This place plays tricks. I'll be sharper next time — count on it.",
  },
  {
    id: 'blackfin_ile_sainte_marie_reappearance',
    islandId: 'ile_sainte_marie',
    offset: { x: 200, y: -50 },
    title: 'One for the Road',
    dialogue: [
      "Vane's whirlpool nearly finished me. Doesn't care whose name is louder.",
      "I'm not going to pretend I'll catch you now. Five Lords down and you're still standing — that's not luck anymore.",
      "One for the road, if you're willing? Not for the race. Just to see how far you've actually come.",
    ],
    fightable: true,
    level: 17,
    backdrop: 'beach',
    victoryLine: "...Heh. Good. Go remind Vane's ghosts what a real captain looks like — I'll be watching from somewhere safe.",
  },
];

export function blackfinStageFor(id: string | null): BlackfinStage | undefined {
  return BLACKFIN_STAGES.find((s) => s.id === id);
}

export function blackfinStageWorldPosition(
  stage: BlackfinStage,
  islandPosition: { x: number; y: number }
): { x: number; y: number } {
  return { x: islandPosition.x + stage.offset.x, y: islandPosition.y + stage.offset.y };
}
