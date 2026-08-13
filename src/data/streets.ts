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
  // Grid-layout conversion (2026-08-13): direct player feedback — "I thought we were going
  // for the grid layout, everything in a grid, and tiled, removing all diagonal roads and
  // paths etc." Movement stays exactly as it was (continuous drag-to-sail, no tile-snapping —
  // only the *town* got gridded), scoped to Tortuga Cove only, and every existing building/
  // house/landmark keeps its place in town, just snapped onto the nearest free cell of a
  // 24-unit lattice instead of redesigned from scratch. Regenerated programmatically: every
  // building, house, and street-connected landmark (Basse-Terre Square, the Lighthouse, La
  // Ringot Fields) plus the Locked Ward and the Bounty Board snapped to the lattice (collision-
  // resolved, re-verified inside TORTUGA_SHAPE), then reconnected with a Manhattan minimum
  // spanning tree — the shortest possible network of strictly horizontal/vertical streets that
  // still reaches every building and house, each multi-axis hop split into an L-shaped elbow
  // (never a diagonal line). 'main' style = an edge between named buildings/landmarks; 'path'
  // style = any edge touching a house (background residential lane) or the two outlying rural
  // trails (the Lighthouse ladder, La Ringot Fields). See GAME_DESIGN.md.
  { islandId: 'tortuga_cove', from: { x: 144, y: -48 }, to: { x: 144, y: -96 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 240, y: -192 }, to: { x: 288, y: -192 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 240, y: -240 }, to: { x: 264, y: -240 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 264, y: -240 }, to: { x: 264, y: -288 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 288, y: -120 }, to: { x: 288, y: -144 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 288, y: -144 }, to: { x: 264, y: -144 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -168, y: -120 }, to: { x: -168, y: -168 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -168, y: -168 }, to: { x: -192, y: -168 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -312, y: 24 }, to: { x: -384, y: 24 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: 24, y: -120 }, to: { x: 24, y: -72 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: 0, y: -48 }, to: { x: 0, y: 0 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: 24, y: 0 }, to: { x: 72, y: 0 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: 240, y: -240 }, to: { x: 312, y: -240 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -264, y: -144 }, to: { x: -264, y: -168 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -264, y: -168 }, to: { x: -288, y: -168 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -72, y: -72 }, to: { x: -72, y: -96 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -72, y: -96 }, to: { x: -96, y: -96 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -480, y: 24 }, to: { x: -504, y: 24 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -504, y: 24 }, to: { x: -504, y: 0 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 312, y: 216 }, to: { x: 312, y: 168 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 312, y: 168 }, to: { x: 336, y: 168 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 216, y: 288 }, to: { x: 216, y: 264 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 216, y: 264 }, to: { x: 240, y: 264 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 216, y: 360 }, to: { x: 192, y: 360 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 24, y: -120 }, to: { x: -24, y: -120 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: -24, y: -120 }, to: { x: -24, y: -96 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: -96, y: -144 }, to: { x: -120, y: -144 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 192, y: -168 }, to: { x: 192, y: -120 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -288, y: -216 }, to: { x: -240, y: -216 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -240, y: -216 }, to: { x: -240, y: -264 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: -240, y: -264 }, to: { x: -264, y: -264 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: -264, y: -72 }, to: { x: -312, y: -72 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: -240, y: -96 }, to: { x: -240, y: -72 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -240, y: -72 }, to: { x: -264, y: -72 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -216, y: -24 }, to: { x: -288, y: -24 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: -384, y: -48 }, to: { x: -384, y: -96 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: -384, y: 24 }, to: { x: -384, y: -48 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: -384, y: 24 }, to: { x: -384, y: 96 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: -312, y: 24 }, to: { x: -312, y: 96 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: -288, y: -24 }, to: { x: -288, y: 24 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: -288, y: 24 }, to: { x: -312, y: 24 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: -216, y: -24 }, to: { x: -240, y: -24 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: -240, y: -24 }, to: { x: -240, y: 0 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: -264, y: -144 }, to: { x: -312, y: -144 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -168, y: -24 }, to: { x: -192, y: -24 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: -192, y: -24 }, to: { x: -192, y: 24 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: -192, y: 24 }, to: { x: -144, y: 24 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: -120, y: -24 }, to: { x: -168, y: -24 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -168, y: -24 }, to: { x: -216, y: -24 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: 0, y: 24 }, to: { x: -72, y: 24 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: 0, y: 0 }, to: { x: 0, y: 24 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: 0, y: 24 }, to: { x: 0, y: 72 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: 0, y: 72 }, to: { x: 24, y: 72 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: 0, y: 0 }, to: { x: 24, y: 0 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: 168, y: -24 }, to: { x: 168, y: 24 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 96, y: 48 }, to: { x: 96, y: 96 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: 96, y: 96 }, to: { x: 120, y: 96 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: 72, y: 0 }, to: { x: 72, y: 48 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: 72, y: 48 }, to: { x: 96, y: 48 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: 72, y: -96 }, to: { x: 48, y: -96 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: 48, y: -96 }, to: { x: 48, y: -120 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: 48, y: -120 }, to: { x: 24, y: -120 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: -240, y: -312 }, to: { x: -192, y: -312 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -192, y: -312 }, to: { x: -192, y: -336 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 288, y: 288 }, to: { x: 288, y: 216 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 24, y: -72 }, to: { x: 48, y: -72 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: 48, y: -72 }, to: { x: 48, y: -48 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: 24, y: -72 }, to: { x: 0, y: -72 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: 0, y: -72 }, to: { x: 0, y: -48 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: -96, y: -216 }, to: { x: -168, y: -216 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 144, y: -216 }, to: { x: 144, y: -192 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -24, y: -192 }, to: { x: -48, y: -192 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -168, y: -48 }, to: { x: -144, y: -48 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -168, y: -120 }, to: { x: -216, y: -120 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 288, y: -72 }, to: { x: 288, y: -120 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 216, y: -240 }, to: { x: 240, y: -240 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 144, y: -216 }, to: { x: 168, y: -216 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 288, y: -72 }, to: { x: 312, y: -72 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 312, y: -72 }, to: { x: 312, y: -96 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 24, y: -168 }, to: { x: 24, y: -192 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -144, y: -48 }, to: { x: -144, y: -72 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -168, y: -24 }, to: { x: -168, y: -48 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 360, y: -168 }, to: { x: 360, y: -192 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -168, y: -216 }, to: { x: -192, y: -216 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -192, y: -216 }, to: { x: -192, y: -240 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -48, y: -72 }, to: { x: -48, y: -24 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 72, y: -168 }, to: { x: 96, y: -168 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -24, y: -168 }, to: { x: -24, y: -192 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -144, y: -240 }, to: { x: -144, y: -264 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 120, y: -48 }, to: { x: 120, y: -24 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 168, y: -48 }, to: { x: 144, y: -48 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -72, y: -48 }, to: { x: -96, y: -48 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 216, y: -72 }, to: { x: 240, y: -72 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -72, y: -72 }, to: { x: -72, y: -48 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -144, y: -96 }, to: { x: -168, y: -96 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 336, y: -144 }, to: { x: 360, y: -144 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 168, y: -216 }, to: { x: 192, y: -216 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 336, y: -96 }, to: { x: 336, y: -120 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 24, y: -168 }, to: { x: 72, y: -168 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -96, y: -96 }, to: { x: -96, y: -144 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -144, y: -288 }, to: { x: -168, y: -288 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 216, y: -240 }, to: { x: 216, y: -264 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 192, y: -120 }, to: { x: 216, y: -120 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 216, y: -120 }, to: { x: 216, y: -96 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -240, y: -120 }, to: { x: -240, y: -144 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -240, y: -120 }, to: { x: -264, y: -120 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 192, y: -216 }, to: { x: 192, y: -240 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 216, y: -48 }, to: { x: 216, y: -24 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 24, y: -168 }, to: { x: 0, y: -168 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -240, y: -144 }, to: { x: -264, y: -144 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -24, y: -192 }, to: { x: -24, y: -216 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 240, y: -192 }, to: { x: 216, y: -192 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 216, y: -192 }, to: { x: 216, y: -168 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 240, y: -72 }, to: { x: 288, y: -72 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 192, y: -240 }, to: { x: 216, y: -240 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 168, y: -24 }, to: { x: 168, y: -48 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 336, y: -120 }, to: { x: 336, y: -144 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 96, y: -168 }, to: { x: 96, y: -192 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 144, y: -48 }, to: { x: 120, y: -48 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 240, y: -48 }, to: { x: 264, y: -48 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -144, y: -264 }, to: { x: -120, y: -264 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -72, y: -216 }, to: { x: -96, y: -216 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -96, y: -48 }, to: { x: -96, y: -24 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -72, y: -216 }, to: { x: -72, y: -240 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -24, y: -96 }, to: { x: -24, y: -120 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -24, y: -120 }, to: { x: -48, y: -120 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 240, y: -216 }, to: { x: 240, y: -192 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 120, y: -216 }, to: { x: 144, y: -216 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -144, y: -264 }, to: { x: -144, y: -288 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -288, y: -168 }, to: { x: -288, y: -216 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 360, y: -144 }, to: { x: 384, y: -144 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -216, y: -96 }, to: { x: -240, y: -96 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 24, y: -120 }, to: { x: 24, y: -168 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 192, y: -120 }, to: { x: 240, y: -120 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 72, y: -96 }, to: { x: 96, y: -96 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 96, y: -96 }, to: { x: 96, y: -120 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 144, y: -192 }, to: { x: 144, y: -144 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -168, y: -216 }, to: { x: -168, y: -192 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -168, y: -192 }, to: { x: -144, y: -192 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -96, y: -24 }, to: { x: -120, y: -24 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 24, y: -192 }, to: { x: 48, y: -192 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 216, y: -96 }, to: { x: 216, y: -72 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -216, y: -120 }, to: { x: -216, y: -96 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -24, y: -96 }, to: { x: -24, y: -72 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -24, y: -72 }, to: { x: -48, y: -72 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -48, y: -72 }, to: { x: -72, y: -72 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -168, y: -216 }, to: { x: -144, y: -216 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -144, y: -216 }, to: { x: -144, y: -240 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 216, y: -168 }, to: { x: 192, y: -168 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 96, y: -192 }, to: { x: 96, y: -216 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 216, y: -72 }, to: { x: 216, y: -48 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -168, y: -48 }, to: { x: -192, y: -48 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -48, y: -192 }, to: { x: -72, y: -192 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -72, y: -192 }, to: { x: -72, y: -216 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -144, y: -72 }, to: { x: -144, y: -96 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -216, y: -120 }, to: { x: -240, y: -120 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 120, y: -48 }, to: { x: 96, y: -48 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -168, y: -96 }, to: { x: -168, y: -120 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 216, y: -72 }, to: { x: 192, y: -72 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 312, y: -96 }, to: { x: 336, y: -96 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 144, y: -144 }, to: { x: 120, y: -144 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 96, y: -216 }, to: { x: 120, y: -216 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 360, y: -144 }, to: { x: 360, y: -168 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 240, y: -72 }, to: { x: 240, y: -48 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -192, y: -48 }, to: { x: -192, y: -72 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 336, y: -144 }, to: { x: 336, y: -168 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 216, y: -96 }, to: { x: 264, y: -96 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 0, y: -168 }, to: { x: -24, y: -168 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 216, y: -24 }, to: { x: 192, y: -24 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -240, y: -264 }, to: { x: -240, y: -312 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 96, y: -192 }, to: { x: 120, y: -192 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 192, y: -24 }, to: { x: 168, y: -24 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 240, y: -240 }, to: { x: 240, y: -216 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -120, y: -264 }, to: { x: -120, y: -288 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -384, y: 24 }, to: { x: -360, y: 24 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -360, y: 24 }, to: { x: -360, y: 48 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -384, y: 24 }, to: { x: -480, y: 24 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 336, y: 168 }, to: { x: 384, y: 168 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 216, y: 288 }, to: { x: 216, y: 360 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 288, y: 216 }, to: { x: 312, y: 216 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 336, y: -96 }, to: { x: 336, y: -48 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 336, y: -48 }, to: { x: 480, y: -48 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -120, y: 288 }, to: { x: -120, y: 408 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -192, y: 288 }, to: { x: -264, y: 288 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -120, y: 288 }, to: { x: -192, y: 288 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -48, y: 288 }, to: { x: -120, y: 288 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 0, y: 288 }, to: { x: -48, y: 288 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 72, y: 288 }, to: { x: 0, y: 288 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 144, y: 288 }, to: { x: 72, y: 288 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 120, y: 96 }, to: { x: 144, y: 96 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 144, y: 96 }, to: { x: 144, y: 288 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 144, y: 288 }, to: { x: 216, y: 288 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 216, y: 288 }, to: { x: 288, y: 288 }, style: 'path' },

  // New Providence (Nassau) — Republic Square as the hub, same pattern as Basse-Terre Square.

  { islandId: 'new_providence', from: { x: 0, y: -20 }, to: { x: -119, y: 99 }, style: 'main' }, // -> The Cracked Hull
  { islandId: 'new_providence', from: { x: 0, y: -20 }, to: { x: 311, y: 72 }, style: 'main' }, // -> The Distillery
  { islandId: 'new_providence', from: { x: 0, y: -20 }, to: { x: 180, y: -140 }, style: 'main' }, // -> Fort Nassau
  { islandId: 'new_providence', from: { x: 0, y: -20 }, to: { x: 260, y: 200 }, style: 'main' }, // -> Widow Hallis's house
  // The careening yard sits right on the beach — reached by a rough sand track, not a paved street.
  { islandId: 'new_providence', from: { x: 0, y: -20 }, to: { x: -350, y: -57 }, style: 'path' }, // -> The Careening Yard
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
