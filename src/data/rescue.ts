export interface RescuePoint {
  id: string;
  islandId: string;
  offset: { x: number; y: number };
}

/** A single fixed location where captured crew can be broken out, regardless of who holds them. */
export const RESCUE_POINT: RescuePoint = {
  id: 'tortuga_locked_ward',
  islandId: 'tortuga_cove',
  offset: { x: 120, y: 260 },
};

export function rescuePointWorldPosition(islandPosition: { x: number; y: number }): {
  x: number;
  y: number;
} {
  return { x: islandPosition.x + RESCUE_POINT.offset.x, y: islandPosition.y + RESCUE_POINT.offset.y };
}
