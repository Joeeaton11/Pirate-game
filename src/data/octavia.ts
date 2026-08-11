// Admiral Octavia — the Crown. GAME_DESIGN.md, Main Story Arc section 2.A / section 3 (the Acts).
// A recurring named character, same "sequence of stages" shape as Captain Blackfin
// (src/data/blackfin.ts) — one data entry per Act appearance, no new engineering per beat once the
// pattern is proven. Unlike Blackfin, none of her stages are fightable yet: per 2.A.3/2.A.4 her
// escalation is the Pardon beat and the Ocracoke finale, both later Acts, so every stage built so
// far is dialogue-only — she's "not yet a direct confrontation" (3, Act II.B).
//
// Built 2026-08-11: only the New Providence introduction (Act II.B) is populated. Introduced here
// specifically, not earlier, because this is the real historical pirate republic (2.A.2) — her
// crackdown campaign starting exactly where it started historically is the whole point.

export const OCTAVIA_NAME = 'Admiral Octavia';
export const OCTAVIA_EMOJI = '🫡';

export interface OctaviaStage {
  id: string;
  islandId: string;
  offset: { x: number; y: number }; // relative to island center, in world units
  title: string;
  /** Shown as a stacked mini-script, one card per line — not tap-through paginated. */
  dialogue: string[];
}

export const OCTAVIA_STAGES: OctaviaStage[] = [
  {
    id: 'octavia_new_providence_intro',
    islandId: 'new_providence',
    offset: { x: -250, y: 280 },
    title: 'The Crown Takes Notice',
    dialogue: [
      'Captain Scally, is it? Word travels faster than ships these days.',
      "I don't chase petty smugglers, Captain. I make note of names that might one day be worth the Crown's personal attention. Yours is being written down.",
      'Sail carefully. New Providence remembers what happens to those who mistake a harbor for a home.',
    ],
  },
];

export function octaviaStageFor(id: string | null): OctaviaStage | undefined {
  return OCTAVIA_STAGES.find((s) => s.id === id);
}

export function octaviaStageWorldPosition(
  stage: OctaviaStage,
  islandPosition: { x: number; y: number }
): { x: number; y: number } {
  return { x: islandPosition.x + stage.offset.x, y: islandPosition.y + stage.offset.y };
}
