/** Visual-only street plan connecting a town's buildings/landmarks — no gameplay logic, purely
 * so a settlement reads as an actual laid-out town instead of markers scattered on grass. */
export interface StreetSegment {
  islandId: string;
  from: { x: number; y: number }; // relative to island center, in world units
  to: { x: number; y: number };
  /** 'main' = a proper town street; 'path' = a rough/treacherous route (rendered thinner, dashed). */
  style: 'main' | 'path';
}

export const STREETS: StreetSegment[] = [
  // Basse-Terre Square as the downtown hub, radiating out to the inner ring of buildings.
  { islandId: 'tortuga_cove', from: { x: -20, y: 40 }, to: { x: -90, y: -40 }, style: 'main' }, // -> The Salty Parrot
  { islandId: 'tortuga_cove', from: { x: -20, y: 40 }, to: { x: 90, y: -30 }, style: 'main' }, // -> Harbor Trading Post
  { islandId: 'tortuga_cove', from: { x: -20, y: 40 }, to: { x: -130, y: 120 }, style: 'main' }, // -> Fishmonger's Stall
  { islandId: 'tortuga_cove', from: { x: -20, y: 40 }, to: { x: 100, y: 65 }, style: 'main' }, // -> Chapelle Notre-Dame
  { islandId: 'tortuga_cove', from: { x: -20, y: 40 }, to: { x: 60, y: 130 }, style: 'main' }, // -> The Locked Ward
  { islandId: 'tortuga_cove', from: { x: -20, y: 40 }, to: { x: 0, y: 130 }, style: 'main' }, // -> The Bounty Board
  // Harbor road, linking the trading post down to the docks.
  { islandId: 'tortuga_cove', from: { x: 90, y: -30 }, to: { x: 0, y: -140 }, style: 'main' }, // -> Fishing Dock
  { islandId: 'tortuga_cove', from: { x: 0, y: -140 }, to: { x: 70, y: -145 }, style: 'main' }, // -> Harbor Pier
  { islandId: 'tortuga_cove', from: { x: 0, y: -140 }, to: { x: -60, y: -105 }, style: 'main' }, // -> Warehouse
  // Outer ring: each inner building connects onward to one more, so the downtown reads as blocks
  // radiating from the square rather than a single spoke pattern.
  { islandId: 'tortuga_cove', from: { x: 90, y: -30 }, to: { x: 160, y: 10 }, style: 'main' }, // Trading Post -> Customs House
  { islandId: 'tortuga_cove', from: { x: 100, y: 65 }, to: { x: 35, y: 70 }, style: 'main' }, // Chapel -> The Baker's Oven
  { islandId: 'tortuga_cove', from: { x: 60, y: 130 }, to: { x: 35, y: 70 }, style: 'main' }, // Locked Ward -> The Baker's Oven
  { islandId: 'tortuga_cove', from: { x: -130, y: 120 }, to: { x: -70, y: 160 }, style: 'main' }, // Fishmonger -> The Ropewalk
  { islandId: 'tortuga_cove', from: { x: 0, y: 130 }, to: { x: -70, y: 160 }, style: 'main' }, // Bounty Board -> The Ropewalk
  { islandId: 'tortuga_cove', from: { x: -90, y: -40 }, to: { x: -110, y: 40 }, style: 'main' }, // Salty Parrot -> The Anchor & Forge
  // Fort de Rocher's real access was a rock-cut staircase and a pull-up ladder — a treacherous
  // route rather than a proper street.
  { islandId: 'tortuga_cove', from: { x: 70, y: -145 }, to: { x: 100, y: -100 }, style: 'path' }, // -> Fort de Rocher
  // Rural outskirts, reached by coastal trail / farm track rather than a paved town street.
  { islandId: 'tortuga_cove', from: { x: -20, y: 40 }, to: { x: -190, y: 10 }, style: 'path' }, // -> West Point Shack
  { islandId: 'tortuga_cove', from: { x: 100, y: 65 }, to: { x: 140, y: 110 }, style: 'path' }, // -> La Ringot Fields
  // Residential grid: 5 horizontal avenues x 5 vertical cross streets, lined with row houses
  // (src/data/houses.ts) on both sides — the dense town blocks proper, south of the harbor road.
  { islandId: 'tortuga_cove', from: { x: -130, y: -10 }, to: { x: 150, y: -10 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: -140, y: 30 }, to: { x: 155, y: 30 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: -130, y: 70 }, to: { x: 150, y: 70 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: -120, y: 110 }, to: { x: 130, y: 110 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: -95, y: 145 }, to: { x: 85, y: 145 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: -110, y: -10 }, to: { x: -110, y: 145 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: -60, y: -10 }, to: { x: -60, y: 150 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: 0, y: -10 }, to: { x: 0, y: 150 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: 60, y: -10 }, to: { x: 60, y: 150 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: 110, y: -10 }, to: { x: 110, y: 140 }, style: 'main' },

  // The 1.35x island enlargement (2026-08-02) opened new land beyond the original coastline for
  // three outlying zones, each reached by a rough, winding trail rather than a paved street —
  // wilderness and ruins, not town blocks.
  // West cape: a goat-track out to El Fuerte Viejo, the ruined Spanish redoubt.
  { islandId: 'tortuga_cove', from: { x: -190, y: 10 }, to: { x: -222, y: -18 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -222, y: -18 }, to: { x: -255, y: -5 }, style: 'path' },
  // East cape: a forest trail forking to the High Woods and its two timber stands.
  { islandId: 'tortuga_cove', from: { x: 160, y: 10 }, to: { x: 193, y: -10 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 193, y: -10 }, to: { x: 218, y: -20 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 218, y: -20 }, to: { x: 260, y: 10 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 193, y: -10 }, to: { x: 205, y: 50 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 205, y: 50 }, to: { x: 166, y: 84 }, style: 'path' },
  // South coast: a track past the Ropewalk to the abandoned quarter and its burying ground.
  { islandId: 'tortuga_cove', from: { x: -70, y: 160 }, to: { x: -46, y: 179 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -46, y: 179 }, to: { x: -35, y: 208 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -35, y: 208 }, to: { x: 60, y: 205 }, style: 'path' },

  // New Providence (Nassau) — Republic Square as the hub, same pattern as Basse-Terre Square.
  { islandId: 'new_providence', from: { x: 0, y: -10 }, to: { x: -70, y: 60 }, style: 'main' }, // -> The Cracked Hull
  { islandId: 'new_providence', from: { x: 0, y: -10 }, to: { x: 170, y: 40 }, style: 'main' }, // -> The Distillery
  { islandId: 'new_providence', from: { x: 0, y: -10 }, to: { x: 90, y: -70 }, style: 'main' }, // -> Fort Nassau
  { islandId: 'new_providence', from: { x: 0, y: -10 }, to: { x: 130, y: 100 }, style: 'main' }, // -> Widow Hallis's house
  // The careening yard sits right on the beach — reached by a rough sand track, not a paved street.
  { islandId: 'new_providence', from: { x: 0, y: -10 }, to: { x: -190, y: -30 }, style: 'path' }, // -> The Careening Yard
  // Residential grid: 8 horizontal avenues x 9 vertical cross streets, lined with row houses
  // (src/data/houses.ts) — extents follow the actual house placements rather than a uniform span,
  // since New Providence's rounder coastline clips the grid unevenly at the edges.
  { islandId: 'new_providence', from: { x: -140, y: -120 }, to: { x: 100, y: -120 }, style: 'main' },
  { islandId: 'new_providence', from: { x: -180, y: -85 }, to: { x: 140, y: -85 }, style: 'main' },
  { islandId: 'new_providence', from: { x: -180, y: -50 }, to: { x: 180, y: -50 }, style: 'main' },
  { islandId: 'new_providence', from: { x: -180, y: -15 }, to: { x: 180, y: -15 }, style: 'main' },
  { islandId: 'new_providence', from: { x: -180, y: 20 }, to: { x: 140, y: 20 }, style: 'main' },
  { islandId: 'new_providence', from: { x: -140, y: 55 }, to: { x: 180, y: 55 }, style: 'main' },
  { islandId: 'new_providence', from: { x: -140, y: 90 }, to: { x: 180, y: 90 }, style: 'main' },
  { islandId: 'new_providence', from: { x: -100, y: 125 }, to: { x: 140, y: 125 }, style: 'main' },
  { islandId: 'new_providence', from: { x: -160, y: -85 }, to: { x: -160, y: 52 }, style: 'main' },
  { islandId: 'new_providence', from: { x: -120, y: -152 }, to: { x: -120, y: 122 }, style: 'main' },
  { islandId: 'new_providence', from: { x: -80, y: -152 }, to: { x: -80, y: 157 }, style: 'main' },
  { islandId: 'new_providence', from: { x: -40, y: -152 }, to: { x: -40, y: 157 }, style: 'main' },
  { islandId: 'new_providence', from: { x: 0, y: -152 }, to: { x: 0, y: 157 }, style: 'main' },
  { islandId: 'new_providence', from: { x: 40, y: -152 }, to: { x: 40, y: 157 }, style: 'main' },
  { islandId: 'new_providence', from: { x: 80, y: -152 }, to: { x: 80, y: 157 }, style: 'main' },
  { islandId: 'new_providence', from: { x: 120, y: -85 }, to: { x: 120, y: 157 }, style: 'main' },
  { islandId: 'new_providence', from: { x: 160, y: -50 }, to: { x: 160, y: 122 }, style: 'main' },
];

export function streetsForIsland(islandId: string): StreetSegment[] {
  return STREETS.filter((s) => s.islandId === islandId);
}

function closestPointOnSegment(
  p: { x: number; y: number },
  a: { x: number; y: number },
  b: { x: number; y: number }
): { x: number; y: number } {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const lenSq = abx * abx + aby * aby;
  if (lenSq === 0) return { ...a };
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * abx + (p.y - a.y) * aby) / lenSq));
  return { x: a.x + abx * t, y: a.y + aby * t };
}

/** Finds the street segment nearest a point (e.g. a street NPC's rough flavor location), and the
 * closest point on it — used so ambient NPCs live on the actual street network instead of wherever
 * their original hand-picked coordinate happened to land. */
export function nearestStreetSegment(
  point: { x: number; y: number },
  islandId: string
): { segment: StreetSegment; point: { x: number; y: number } } | null {
  const segments = streetsForIsland(islandId);
  let best: { segment: StreetSegment; point: { x: number; y: number } } | null = null;
  let bestDist = Infinity;
  for (const segment of segments) {
    const closest = closestPointOnSegment(point, segment.from, segment.to);
    const dist = Math.hypot(point.x - closest.x, point.y - closest.y);
    if (dist < bestDist) {
      bestDist = dist;
      best = { segment, point: closest };
    }
  }
  return best;
}

/** Every segment on the island that shares an endpoint with `segment` (including itself) — an
 * NPC's local walkable neighborhood, so they wander around their home block/corner instead of
 * teleporting across town or being confined to one single line. */
export function connectedSegments(
  segment: StreetSegment,
  islandId: string,
  epsilon = 6
): StreetSegment[] {
  const segments = streetsForIsland(islandId);
  const endpoints = [segment.from, segment.to];
  return segments.filter(
    (other) =>
      other === segment ||
      [other.from, other.to].some((otherPoint) =>
        endpoints.some((ep) => Math.hypot(ep.x - otherPoint.x, ep.y - otherPoint.y) < epsilon)
      )
  );
}

export function randomPointOnSegment(segment: StreetSegment): { x: number; y: number } {
  const t = Math.random();
  return {
    x: segment.from.x + (segment.to.x - segment.from.x) * t,
    y: segment.from.y + (segment.to.y - segment.from.y) * t,
  };
}
