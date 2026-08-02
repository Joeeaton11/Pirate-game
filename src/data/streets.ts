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
  { islandId: 'tortuga_cove', from: { x: -40, y: 80 }, to: { x: -180, y: -80 }, style: 'main' }, // -> The Salty Parrot
  { islandId: 'tortuga_cove', from: { x: -40, y: 80 }, to: { x: 180, y: -60 }, style: 'main' }, // -> Harbor Trading Post
  { islandId: 'tortuga_cove', from: { x: -40, y: 80 }, to: { x: -260, y: 240 }, style: 'main' }, // -> Fishmonger's Stall
  { islandId: 'tortuga_cove', from: { x: -40, y: 80 }, to: { x: 200, y: 130 }, style: 'main' }, // -> Chapelle Notre-Dame
  { islandId: 'tortuga_cove', from: { x: -40, y: 80 }, to: { x: 120, y: 260 }, style: 'main' }, // -> The Locked Ward
  { islandId: 'tortuga_cove', from: { x: -40, y: 80 }, to: { x: 0, y: 260 }, style: 'main' }, // -> The Bounty Board
  // Harbor road, linking the trading post down to the docks.
  { islandId: 'tortuga_cove', from: { x: 180, y: -60 }, to: { x: 0, y: -280 }, style: 'main' }, // -> Fishing Dock
  { islandId: 'tortuga_cove', from: { x: 0, y: -280 }, to: { x: 140, y: -290 }, style: 'main' }, // -> Harbor Pier
  { islandId: 'tortuga_cove', from: { x: 0, y: -280 }, to: { x: -120, y: -210 }, style: 'main' }, // -> Warehouse
  // Outer ring: each inner building connects onward to one more, so the downtown reads as blocks
  // radiating from the square rather than a single spoke pattern.
  { islandId: 'tortuga_cove', from: { x: 180, y: -60 }, to: { x: 320, y: 20 }, style: 'main' }, // Trading Post -> Customs House
  { islandId: 'tortuga_cove', from: { x: 200, y: 130 }, to: { x: 70, y: 140 }, style: 'main' }, // Chapel -> The Baker's Oven
  { islandId: 'tortuga_cove', from: { x: 120, y: 260 }, to: { x: 70, y: 140 }, style: 'main' }, // Locked Ward -> The Baker's Oven
  { islandId: 'tortuga_cove', from: { x: -260, y: 240 }, to: { x: -140, y: 320 }, style: 'main' }, // Fishmonger -> The Ropewalk
  { islandId: 'tortuga_cove', from: { x: 0, y: 260 }, to: { x: -140, y: 320 }, style: 'main' }, // Bounty Board -> The Ropewalk
  { islandId: 'tortuga_cove', from: { x: -180, y: -80 }, to: { x: -220, y: 80 }, style: 'main' }, // Salty Parrot -> The Anchor & Forge
  // Fort de Rocher's real access was a rock-cut staircase and a pull-up ladder — a treacherous
  // route rather than a proper street.
  { islandId: 'tortuga_cove', from: { x: 140, y: -290 }, to: { x: 200, y: -200 }, style: 'path' }, // -> Fort de Rocher
  // Rural outskirts, reached by coastal trail / farm track rather than a paved town street.
  { islandId: 'tortuga_cove', from: { x: -40, y: 80 }, to: { x: -380, y: 20 }, style: 'path' }, // -> West Point Shack
  { islandId: 'tortuga_cove', from: { x: 200, y: 130 }, to: { x: 280, y: 220 }, style: 'path' }, // -> La Ringot Fields
  // Residential grid: 5 horizontal avenues x 5 vertical cross streets, lined with row houses
  // (src/data/houses.ts) on both sides — the dense town blocks proper, south of the harbor road.
  { islandId: 'tortuga_cove', from: { x: -260, y: -20 }, to: { x: 300, y: -20 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: -280, y: 60 }, to: { x: 310, y: 60 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: -260, y: 140 }, to: { x: 300, y: 140 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: -240, y: 220 }, to: { x: 260, y: 220 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: -190, y: 290 }, to: { x: 170, y: 290 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: -220, y: -20 }, to: { x: -220, y: 290 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: -120, y: -20 }, to: { x: -120, y: 300 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: 0, y: -20 }, to: { x: 0, y: 300 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: 120, y: -20 }, to: { x: 120, y: 300 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: 220, y: -20 }, to: { x: 220, y: 280 }, style: 'main' },

  // The 1.35x island enlargement (2026-08-02) opened new land beyond the original coastline for
  // three outlying zones, each reached by a rough, winding trail rather than a paved street —
  // wilderness and ruins, not town blocks.
  // West cape: a goat-track out to El Fuerte Viejo, the ruined Spanish redoubt.
  { islandId: 'tortuga_cove', from: { x: -380, y: 20 }, to: { x: -444, y: -36 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -444, y: -36 }, to: { x: -510, y: -10 }, style: 'path' },
  // East cape: a forest trail forking to the High Woods and its two timber stands.
  { islandId: 'tortuga_cove', from: { x: 320, y: 20 }, to: { x: 386, y: -20 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 386, y: -20 }, to: { x: 436, y: -40 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 436, y: -40 }, to: { x: 520, y: 20 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 386, y: -20 }, to: { x: 410, y: 100 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 410, y: 100 }, to: { x: 332, y: 168 }, style: 'path' },
  // A smuggler doesn't camp on the main trail — a fainter side-track breaks off from the
  // Trapper's Camp toward the cache, deeper into the woods still.
  { islandId: 'tortuga_cove', from: { x: 332, y: 168 }, to: { x: 240, y: 266 }, style: 'path' },
  // South coast: a track past the Ropewalk to the abandoned quarter and its burying ground.
  { islandId: 'tortuga_cove', from: { x: -140, y: 320 }, to: { x: -92, y: 358 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -92, y: 358 }, to: { x: -70, y: 416 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -70, y: 416 }, to: { x: 120, y: 410 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 120, y: 410 }, to: { x: 184, y: 350 }, style: 'path' },

  // New Providence (Nassau) — Republic Square as the hub, same pattern as Basse-Terre Square.
  { islandId: 'new_providence', from: { x: 0, y: -20 }, to: { x: -140, y: 120 }, style: 'main' }, // -> The Cracked Hull
  { islandId: 'new_providence', from: { x: 0, y: -20 }, to: { x: 340, y: 80 }, style: 'main' }, // -> The Distillery
  { islandId: 'new_providence', from: { x: 0, y: -20 }, to: { x: 180, y: -140 }, style: 'main' }, // -> Fort Nassau
  { islandId: 'new_providence', from: { x: 0, y: -20 }, to: { x: 260, y: 200 }, style: 'main' }, // -> Widow Hallis's house
  // The careening yard sits right on the beach — reached by a rough sand track, not a paved street.
  { islandId: 'new_providence', from: { x: 0, y: -20 }, to: { x: -380, y: -60 }, style: 'path' }, // -> The Careening Yard
  // Residential grid: 8 horizontal avenues x 9 vertical cross streets, lined with row houses
  // (src/data/houses.ts) — extents follow the actual house placements rather than a uniform span,
  // since New Providence's rounder coastline clips the grid unevenly at the edges.
  { islandId: 'new_providence', from: { x: -280, y: -240 }, to: { x: 200, y: -240 }, style: 'main' },
  { islandId: 'new_providence', from: { x: -360, y: -170 }, to: { x: 280, y: -170 }, style: 'main' },
  { islandId: 'new_providence', from: { x: -360, y: -100 }, to: { x: 360, y: -100 }, style: 'main' },
  { islandId: 'new_providence', from: { x: -360, y: -30 }, to: { x: 360, y: -30 }, style: 'main' },
  { islandId: 'new_providence', from: { x: -360, y: 40 }, to: { x: 280, y: 40 }, style: 'main' },
  { islandId: 'new_providence', from: { x: -280, y: 110 }, to: { x: 360, y: 110 }, style: 'main' },
  { islandId: 'new_providence', from: { x: -280, y: 180 }, to: { x: 360, y: 180 }, style: 'main' },
  { islandId: 'new_providence', from: { x: -200, y: 250 }, to: { x: 280, y: 250 }, style: 'main' },
  { islandId: 'new_providence', from: { x: -320, y: -170 }, to: { x: -320, y: 104 }, style: 'main' },
  { islandId: 'new_providence', from: { x: -240, y: -304 }, to: { x: -240, y: 244 }, style: 'main' },
  { islandId: 'new_providence', from: { x: -160, y: -304 }, to: { x: -160, y: 314 }, style: 'main' },
  { islandId: 'new_providence', from: { x: -80, y: -304 }, to: { x: -80, y: 314 }, style: 'main' },
  { islandId: 'new_providence', from: { x: 0, y: -304 }, to: { x: 0, y: 314 }, style: 'main' },
  { islandId: 'new_providence', from: { x: 80, y: -304 }, to: { x: 80, y: 314 }, style: 'main' },
  { islandId: 'new_providence', from: { x: 160, y: -304 }, to: { x: 160, y: 314 }, style: 'main' },
  { islandId: 'new_providence', from: { x: 240, y: -170 }, to: { x: 240, y: 314 }, style: 'main' },
  { islandId: 'new_providence', from: { x: 320, y: -100 }, to: { x: 320, y: 244 }, style: 'main' },
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
