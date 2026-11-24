import { PropSpriteId } from './worldSprites';

/** Small decorative set-dressing (2026-08-13 art pass) — real cut art scattered near the
 * buildings/landmarks it thematically belongs to. Purely visual, same spirit as SCENERY: no
 * gameplay hook, no collision, no interaction. Positions are hand-placed a short distance from an
 * existing building/landmark offset rather than script-scattered, since precision doesn't matter
 * for a prop nobody can walk into. */
export interface Prop {
  islandId: string;
  offset: { x: number; y: number };
  spriteId: PropSpriteId;
  fontSize?: number; // reused as a rough size multiplier, same convention as SceneryProp
}

export const PROPS: Prop[] = [
  // Tortuga Cove's set-dressing moved to TORTUGA_V2_PROPS (tortugaV2.ts, art pass v2, 2026-11-14).
  // Basse-Terre Square — market stall + lampposts flanking the fountain landmark itself.

  // Benches outside the two busiest hero buildings on the quay.

  // Barrels stacked by the warehouse district.

  // Crates by the trading/provisioning buildings.

  // Pirate colors flying over the two buildings that answer to no crown.
];

export function propsForIsland(islandId: string): Prop[] {
  return PROPS.filter((p) => p.islandId === islandId);
}

export function propWorldPosition(
  prop: Prop,
  islandPosition: { x: number; y: number }
): { x: number; y: number } {
  return { x: islandPosition.x + prop.offset.x, y: islandPosition.y + prop.offset.y };
}
