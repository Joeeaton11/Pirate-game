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
  { islandId: 'tortuga_cove', offset: { x: -16, y: -148 }, spriteId: 'market_stall' },
  { islandId: 'tortuga_cove', offset: { x: 48, y: -152 }, spriteId: 'lamppost' },
  { islandId: 'tortuga_cove', offset: { x: -2, y: -115 }, spriteId: 'lamppost' },

  // Benches outside the two busiest hero buildings on the quay.
  { islandId: 'tortuga_cove', offset: { x: 106, y: -90 }, spriteId: 'bench' }, // near The Salty Parrot
  { islandId: 'tortuga_cove', offset: { x: 188, y: -102 }, spriteId: 'bench' }, // near Harbor Trading Post

  // Barrels stacked by the warehouse district.
  { islandId: 'tortuga_cove', offset: { x: -202, y: -184 }, spriteId: 'barrel' }, // Smugglers' Warehouse
  { islandId: 'tortuga_cove', offset: { x: -274, y: -23 }, spriteId: 'barrel' }, // Tobacco Warehouse
  { islandId: 'tortuga_cove', offset: { x: 202, y: 25 }, spriteId: 'barrel' }, // Timber Yard

  // Crates by the trading/provisioning buildings.
  { islandId: 'tortuga_cove', offset: { x: 182, y: -129 }, spriteId: 'crate' }, // Harbor Trading Post
  { islandId: 'tortuga_cove', offset: { x: -55, y: 16 }, spriteId: 'crate' }, // The Ship's Provisioner
  { islandId: 'tortuga_cove', offset: { x: 202, y: -159 }, spriteId: 'crate' }, // Dockworkers' Bunkhouse

  // Pirate colors flying over the two buildings that answer to no crown.
  { islandId: 'tortuga_cove', offset: { x: 288, y: -351 }, spriteId: 'flag_skull', fontSize: 26 }, // Fort de Rocher
  { islandId: 'tortuga_cove', offset: { x: -25, y: -25 }, spriteId: 'flag_skull', fontSize: 20 }, // Le Vasseur's Residence
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
