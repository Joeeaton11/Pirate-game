import { islandAtPoint } from '../data/islands';
import { nearestStreetSegment } from '../data/streets';
import { Island } from '../types';

/** Which scene EncounterScreen renders behind the fight. Chosen once, at the moment an encounter
 * starts, and carried on the WildEncounter record itself — EncounterScreen has no independent
 * notion of "where" a fight is happening, only what it's told. */
export type BattleBackdrop = 'town' | 'jungle' | 'beach' | 'sea' | 'fort' | 'jail';

const TOWN_STREET_RADIUS = 45; // matches the alley/footpath clearance used elsewhere in streets.ts
const BEACH_COAST_RADIUS = 55;

function distToSegment(
  p: { x: number; y: number },
  a: { x: number; y: number },
  b: { x: number; y: number }
): number {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const lenSq = abx * abx + aby * aby;
  if (lenSq === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * abx + (p.y - a.y) * aby) / lenSq));
  return Math.hypot(p.x - (a.x + t * abx), p.y - (a.y + t * aby));
}

/** Distance from a world point to the nearest edge of an island's coastline polygon. */
function distToCoast(worldPoint: { x: number; y: number }, island: Island): number {
  const local = { x: worldPoint.x - island.position.x, y: worldPoint.y - island.position.y };
  const shape = island.shape;
  let best = Infinity;
  for (let i = 0; i < shape.length; i++) {
    const a = shape[i];
    const b = shape[(i + 1) % shape.length];
    best = Math.min(best, distToSegment(local, a, b));
  }
  return best;
}

/** Picks a backdrop from a world position for the common "wandering/ambushed on land or sea"
 * case. `null` (no position available, e.g. sea-only ambush triggers) always reads as open sea. */
export function classifyBackdrop(worldPoint: { x: number; y: number } | null): BattleBackdrop {
  if (!worldPoint) return 'sea';
  const island = islandAtPoint(worldPoint);
  if (!island) return 'sea';

  const relativePoint = { x: worldPoint.x - island.position.x, y: worldPoint.y - island.position.y };
  const nearestStreet = nearestStreetSegment(relativePoint, island.id);
  if (
    nearestStreet &&
    Math.hypot(relativePoint.x - nearestStreet.point.x, relativePoint.y - nearestStreet.point.y) <
      TOWN_STREET_RADIUS
  ) {
    return 'town';
  }

  if (distToCoast(worldPoint, island) < BEACH_COAST_RADIUS) return 'beach';

  return 'jungle';
}
