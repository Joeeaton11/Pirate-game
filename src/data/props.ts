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
  // Basse-Terre Square — market stall + lampposts flanking the fountain landmark itself.
  { islandId: 'tortuga_cove', offset: { x: -22, y: -205 }, spriteId: 'market_stall' },
  { islandId: 'tortuga_cove', offset: { x: 67, y: -211 }, spriteId: 'lamppost' },
  { islandId: 'tortuga_cove', offset: { x: -3, y: -160 }, spriteId: 'lamppost' },

  // Benches outside the two busiest hero buildings on the quay.
  { islandId: 'tortuga_cove', offset: { x: 147, y: -125 }, spriteId: 'bench' }, // near The Salty Parrot
  { islandId: 'tortuga_cove', offset: { x: 261, y: -141 }, spriteId: 'bench' }, // near Harbor Trading Post

  // Barrels stacked by the warehouse district.
  { islandId: 'tortuga_cove', offset: { x: -280, y: -256 }, spriteId: 'barrel' }, // Smugglers' Warehouse
  { islandId: 'tortuga_cove', offset: { x: -381, y: -32 }, spriteId: 'barrel' }, // Tobacco Warehouse
  { islandId: 'tortuga_cove', offset: { x: 280, y: 35 }, spriteId: 'barrel' }, // Timber Yard

  // Crates by the trading/provisioning buildings.
  { islandId: 'tortuga_cove', offset: { x: 253, y: -179 }, spriteId: 'crate' }, // Harbor Trading Post
  { islandId: 'tortuga_cove', offset: { x: -77, y: 22 }, spriteId: 'crate' }, // The Ship's Provisioner
  { islandId: 'tortuga_cove', offset: { x: 280, y: -221 }, spriteId: 'crate' }, // Dockworkers' Bunkhouse

  // Pirate colors flying over the two buildings that answer to no crown.
  { islandId: 'tortuga_cove', offset: { x: 400, y: -488 }, spriteId: 'flag_skull', fontSize: 26 }, // Fort de Rocher
  { islandId: 'tortuga_cove', offset: { x: -35, y: -35 }, spriteId: 'flag_skull', fontSize: 20 }, // Le Vasseur's Residence
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
