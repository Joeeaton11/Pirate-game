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
  { islandId: 'tortuga_cove', offset: { x: -14, y: -128 }, spriteId: 'market_stall' },
  { islandId: 'tortuga_cove', offset: { x: 42, y: -132 }, spriteId: 'lamppost' },
  { islandId: 'tortuga_cove', offset: { x: -2, y: -100 }, spriteId: 'lamppost' },

  // Benches outside the two busiest hero buildings on the quay.
  { islandId: 'tortuga_cove', offset: { x: 92, y: -78 }, spriteId: 'bench' }, // near The Salty Parrot
  { islandId: 'tortuga_cove', offset: { x: 163, y: -88 }, spriteId: 'bench' }, // near Harbor Trading Post

  // Barrels stacked by the warehouse district.
  { islandId: 'tortuga_cove', offset: { x: -175, y: -160 }, spriteId: 'barrel' }, // Smugglers' Warehouse
  { islandId: 'tortuga_cove', offset: { x: -238, y: -20 }, spriteId: 'barrel' }, // Tobacco Warehouse
  { islandId: 'tortuga_cove', offset: { x: 175, y: 22 }, spriteId: 'barrel' }, // Timber Yard

  // Crates by the trading/provisioning buildings.
  { islandId: 'tortuga_cove', offset: { x: 158, y: -112 }, spriteId: 'crate' }, // Harbor Trading Post
  { islandId: 'tortuga_cove', offset: { x: -48, y: 14 }, spriteId: 'crate' }, // The Ship's Provisioner
  { islandId: 'tortuga_cove', offset: { x: 175, y: -138 }, spriteId: 'crate' }, // Dockworkers' Bunkhouse

  // Pirate colors flying over the two buildings that answer to no crown.
  { islandId: 'tortuga_cove', offset: { x: 250, y: -305 }, spriteId: 'flag_skull', fontSize: 26 }, // Fort de Rocher
  { islandId: 'tortuga_cove', offset: { x: -22, y: -22 }, spriteId: 'flag_skull', fontSize: 20 }, // Le Vasseur's Residence
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
