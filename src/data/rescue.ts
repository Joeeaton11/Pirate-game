export interface RescuePoint {
  id: string;
  islandId: string;
  offset: { x: number; y: number };
}

/** A single fixed location where captured crew can be broken out, regardless of who holds them. */
export const RESCUE_POINT: RescuePoint = {
  id: 'tortuga_locked_ward',
  islandId: 'tortuga_cove',
  // Pulled into the harbor town 2026-08-07 from (120, 260) to (260, -90) — item 51's full-town
  // remap. See GAME_DESIGN.md.
  offset: { x: 260, y: -90 },
};

export function rescuePointWorldPosition(islandPosition: { x: number; y: number }): {
  x: number;
  y: number;
} {
  return { x: islandPosition.x + RESCUE_POINT.offset.x, y: islandPosition.y + RESCUE_POINT.offset.y };
}
