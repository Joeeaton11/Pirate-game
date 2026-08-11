// Captain Blackfin — the Rival. GAME_DESIGN.md, Main Story Arc section 2.B / section 3 (the Acts).
// A recurring named character, not a generic `rival` encounter: introduced day one at Tortuga,
// then reappears at the next island after each Lord fight (Acts II-V), always having gotten there
// first. Modeled as a sequence of "stages" — one per appearance — so each Act's beat is just a data
// entry, not new engineering, once the pattern below is proven.
//
// Built 2026-08-10: only the Tortuga intro (Act I.A) is populated. It's dialogue-only, no fight —
// per 3.B.3 the first duel doesn't unlock until New Providence (Act II.A). Later stages (II-VI)
// are deliberately left unbuilt until the acts around them exist; see GAME_DESIGN.md for the plan.

export const BLACKFIN_NAME = 'Captain Blackfin';
export const BLACKFIN_EMOJI = '🦈';

export interface BlackfinStage {
  id: string;
  islandId: string;
  offset: { x: number; y: number }; // relative to island center, in world units
  title: string;
  /** Shown as a stacked mini-script, one card per line — not tap-through paginated. */
  dialogue: string[];
  /** Once true (Act II onward), this stage offers an optional duel. Not used yet — every stage
   * built so far is dialogue-only — but the field exists so later stages don't need a data-model
   * change to add it. */
  fightable: boolean;
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
