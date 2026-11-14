/** Visual-only street plan connecting a town's buildings/landmarks — no gameplay logic, purely
 * so a settlement reads as an actual laid-out town instead of markers scattered on grass. */
export interface StreetSegment {
  islandId: string;
  from: { x: number; y: number }; // relative to island center, in world units
  to: { x: number; y: number };
  /** 'main' = a proper town street; 'path' = a rough/treacherous route (rendered thinner, dashed). */
  style: 'main' | 'path';
  /** Real road width in world units, where known (Tortuga v2). Renderers fall back to the style default. */
  width?: number;
}

export const STREETS: StreetSegment[] = [
  // Minimal overlap fix (2026-08-13, follow-up to item 74's revert) — direct feedback:
  // "Place the buildings in a logical position near the paths... they should be
  // intersecting the paths and should have a clear unobscured route around... use logic
  // and game logic." Reverted item 74's driveway/rebuild approach entirely — buildings
  // fronting directly onto their street is the intended look, not a bug. This pass only
  // touches the small number of entities that were genuinely too close to another
  // building/house to walk around (checked against the real in-game collision radii,
  // `HOUSE_COLLISION_RADIUS`/`BUILDING_COLLISION_RADIUS` in MapScreen.tsx, plus a looser
  // visual-footprint check for the worst sprite-overlap cases): 19 of 161
  // buildings/houses/markers got a small nudge — first tried sliding along their own
  // street's existing line (keeps a straight street, just longer/shorter), and only where
  // that wasn't possible (a true street corner) a short local move with its street elbowed
  // to still reach it exactly, never diagonally. Everything else — all 142 unmoved
  // buildings/houses and the entire rest of the street layout — is untouched from the
  // original grid conversion. See GAME_DESIGN.md.
  // Tortuga Cove art pass v2 (2026-11-14): the survey street network at 1x, incl. the new
  // alleys (style 'main', narrow) and coastal path (style 'path'); `width` is the real road width.
  { islandId: 'tortuga_cove', from: { x: 166.0, y: -55.0 }, to: { x: 166.0, y: -111.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 276.0, y: -221.0 }, to: { x: 359.0, y: -221.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 276.0, y: -276.0 }, to: { x: 304.0, y: -276.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 304.0, y: -276.0 }, to: { x: 304.0, y: -332.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 332.0, y: 0.0 }, to: { x: 332.0, y: -166.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -194.0, y: -138.0 }, to: { x: -194.0, y: -194.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -194.0, y: -194.0 }, to: { x: -221.0, y: -194.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -359.0, y: 27.0 }, to: { x: -442.0, y: 27.0 }, style: 'main', width: 12.0 },
  { islandId: 'tortuga_cove', from: { x: 27.0, y: -138.0 }, to: { x: 0.0, y: -138.0 }, style: 'main', width: 12.0 },
  { islandId: 'tortuga_cove', from: { x: 276.0, y: -276.0 }, to: { x: 359.0, y: -276.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -304.0, y: -166.0 }, to: { x: -304.0, y: -194.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -304.0, y: -194.0 }, to: { x: -332.0, y: -194.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -55.0, y: -111.0 }, to: { x: -83.0, y: -111.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -83.0, y: -111.0 }, to: { x: -111.0, y: -111.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -553.0, y: 27.0 }, to: { x: -580.0, y: 27.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -580.0, y: 27.0 }, to: { x: -580.0, y: 0.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 359.0, y: 249.0 }, to: { x: 359.0, y: 194.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 359.0, y: 194.0 }, to: { x: 387.0, y: 194.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 221.0, y: 304.0 }, to: { x: 249.0, y: 304.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 249.0, y: 304.0 }, to: { x: 276.0, y: 304.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 276.0, y: 415.0 }, to: { x: 221.0, y: 415.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 27.0, y: -138.0 }, to: { x: -27.0, y: -138.0 }, style: 'main', width: 12.0 },
  { islandId: 'tortuga_cove', from: { x: -27.0, y: -138.0 }, to: { x: -27.0, y: 55.0 }, style: 'main', width: 12.0 },
  { islandId: 'tortuga_cove', from: { x: -111.0, y: -166.0 }, to: { x: -138.0, y: -166.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 221.0, y: -194.0 }, to: { x: 221.0, y: -138.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -332.0, y: -249.0 }, to: { x: -276.0, y: -249.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -276.0, y: -249.0 }, to: { x: -249.0, y: -249.0 }, style: 'main', width: 12.0 },
  { islandId: 'tortuga_cove', from: { x: -249.0, y: -304.0 }, to: { x: -304.0, y: -304.0 }, style: 'main', width: 12.0 },
  { islandId: 'tortuga_cove', from: { x: -304.0, y: -83.0 }, to: { x: -359.0, y: -83.0 }, style: 'main', width: 12.0 },
  { islandId: 'tortuga_cove', from: { x: -249.0, y: -83.0 }, to: { x: -276.0, y: -83.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -276.0, y: -83.0 }, to: { x: -304.0, y: -83.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -249.0, y: -27.0 }, to: { x: -332.0, y: -27.0 }, style: 'main', width: 12.0 },
  { islandId: 'tortuga_cove', from: { x: -442.0, y: -55.0 }, to: { x: -442.0, y: -111.0 }, style: 'main', width: 12.0 },
  { islandId: 'tortuga_cove', from: { x: -442.0, y: 27.0 }, to: { x: -442.0, y: -55.0 }, style: 'main', width: 12.0 },
  { islandId: 'tortuga_cove', from: { x: -442.0, y: 27.0 }, to: { x: -442.0, y: 111.0 }, style: 'main', width: 12.0 },
  { islandId: 'tortuga_cove', from: { x: -359.0, y: 27.0 }, to: { x: -359.0, y: 111.0 }, style: 'main', width: 12.0 },
  { islandId: 'tortuga_cove', from: { x: -332.0, y: -27.0 }, to: { x: -332.0, y: 27.0 }, style: 'main', width: 12.0 },
  { islandId: 'tortuga_cove', from: { x: -332.0, y: 27.0 }, to: { x: -359.0, y: 27.0 }, style: 'main', width: 12.0 },
  { islandId: 'tortuga_cove', from: { x: -249.0, y: -27.0 }, to: { x: -276.0, y: -27.0 }, style: 'main', width: 12.0 },
  { islandId: 'tortuga_cove', from: { x: -276.0, y: -27.0 }, to: { x: -276.0, y: 0.0 }, style: 'main', width: 12.0 },
  { islandId: 'tortuga_cove', from: { x: -304.0, y: -166.0 }, to: { x: -359.0, y: -166.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -194.0, y: -27.0 }, to: { x: -221.0, y: -27.0 }, style: 'main', width: 12.0 },
  { islandId: 'tortuga_cove', from: { x: -221.0, y: -27.0 }, to: { x: -221.0, y: 27.0 }, style: 'main', width: 12.0 },
  { islandId: 'tortuga_cove', from: { x: -221.0, y: 27.0 }, to: { x: -166.0, y: 27.0 }, style: 'main', width: 12.0 },
  { islandId: 'tortuga_cove', from: { x: -138.0, y: -27.0 }, to: { x: -194.0, y: -27.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -194.0, y: -27.0 }, to: { x: -249.0, y: -27.0 }, style: 'main', width: 12.0 },
  { islandId: 'tortuga_cove', from: { x: 194.0, y: -27.0 }, to: { x: 194.0, y: 27.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 442.0, y: -111.0 }, to: { x: 55.0, y: -111.0 }, style: 'main', width: 12.0 },
  { islandId: 'tortuga_cove', from: { x: 55.0, y: -111.0 }, to: { x: 55.0, y: -138.0 }, style: 'main', width: 12.0 },
  { islandId: 'tortuga_cove', from: { x: 55.0, y: -138.0 }, to: { x: 27.0, y: -138.0 }, style: 'main', width: 12.0 },
  { islandId: 'tortuga_cove', from: { x: -276.0, y: -359.0 }, to: { x: -221.0, y: -359.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -221.0, y: -359.0 }, to: { x: -221.0, y: -387.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 332.0, y: 332.0 }, to: { x: 332.0, y: 249.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 0.0, y: -83.0 }, to: { x: 55.0, y: -83.0 }, style: 'main', width: 12.0 },
  { islandId: 'tortuga_cove', from: { x: 55.0, y: -83.0 }, to: { x: 55.0, y: -55.0 }, style: 'main', width: 12.0 },
  { islandId: 'tortuga_cove', from: { x: 0.0, y: -111.0 }, to: { x: 0.0, y: -83.0 }, style: 'main', width: 12.0 },
  { islandId: 'tortuga_cove', from: { x: 0.0, y: -83.0 }, to: { x: 0.0, y: -55.0 }, style: 'main', width: 12.0 },
  { islandId: 'tortuga_cove', from: { x: -111.0, y: -249.0 }, to: { x: -194.0, y: -249.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 166.0, y: -249.0 }, to: { x: 166.0, y: -221.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -27.0, y: -221.0 }, to: { x: -55.0, y: -221.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -194.0, y: -55.0 }, to: { x: -166.0, y: -55.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -194.0, y: -138.0 }, to: { x: -249.0, y: -138.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 332.0, y: -83.0 }, to: { x: 332.0, y: 0.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 249.0, y: -276.0 }, to: { x: 276.0, y: -276.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 166.0, y: -249.0 }, to: { x: 194.0, y: -249.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 332.0, y: -83.0 }, to: { x: 359.0, y: -83.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 359.0, y: -83.0 }, to: { x: 359.0, y: -111.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 27.0, y: -194.0 }, to: { x: 27.0, y: -221.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -166.0, y: -55.0 }, to: { x: -166.0, y: -83.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -194.0, y: -27.0 }, to: { x: -194.0, y: -83.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 415.0, y: -194.0 }, to: { x: 415.0, y: -221.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -194.0, y: -249.0 }, to: { x: -221.0, y: -249.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -221.0, y: -249.0 }, to: { x: -221.0, y: -276.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -55.0, y: -83.0 }, to: { x: -55.0, y: -27.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 83.0, y: -194.0 }, to: { x: 111.0, y: -194.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -27.0, y: -194.0 }, to: { x: -27.0, y: -221.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -166.0, y: -276.0 }, to: { x: -166.0, y: -304.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 138.0, y: -55.0 }, to: { x: 138.0, y: -27.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 194.0, y: -55.0 }, to: { x: 166.0, y: -55.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -83.0, y: -55.0 }, to: { x: -111.0, y: -55.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 249.0, y: -83.0 }, to: { x: 276.0, y: -83.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -55.0, y: -55.0 }, to: { x: -83.0, y: -55.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -166.0, y: -111.0 }, to: { x: -194.0, y: -111.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 387.0, y: -166.0 }, to: { x: 415.0, y: -166.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 194.0, y: -249.0 }, to: { x: 221.0, y: -249.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 387.0, y: -111.0 }, to: { x: 387.0, y: -138.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 27.0, y: -194.0 }, to: { x: 83.0, y: -194.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -111.0, y: -111.0 }, to: { x: -111.0, y: -194.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -166.0, y: -332.0 }, to: { x: -194.0, y: -332.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 249.0, y: -276.0 }, to: { x: 249.0, y: -304.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 221.0, y: -138.0 }, to: { x: 249.0, y: -138.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 249.0, y: -138.0 }, to: { x: 249.0, y: -111.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -276.0, y: -138.0 }, to: { x: -276.0, y: -166.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -276.0, y: -138.0 }, to: { x: -304.0, y: -138.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 221.0, y: -249.0 }, to: { x: 221.0, y: -276.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 249.0, y: -55.0 }, to: { x: 249.0, y: -27.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 27.0, y: -194.0 }, to: { x: 0.0, y: -194.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -276.0, y: -166.0 }, to: { x: -304.0, y: -166.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -27.0, y: -221.0 }, to: { x: -27.0, y: -249.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 276.0, y: -221.0 }, to: { x: 249.0, y: -221.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 249.0, y: -221.0 }, to: { x: 249.0, y: -194.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 276.0, y: -83.0 }, to: { x: 332.0, y: -83.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 221.0, y: -276.0 }, to: { x: 249.0, y: -276.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 194.0, y: -27.0 }, to: { x: 194.0, y: -55.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 387.0, y: -138.0 }, to: { x: 387.0, y: -166.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 111.0, y: -194.0 }, to: { x: 111.0, y: -221.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 166.0, y: -55.0 }, to: { x: 138.0, y: -55.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 276.0, y: -55.0 }, to: { x: 304.0, y: -55.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -166.0, y: -304.0 }, to: { x: -138.0, y: -304.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -83.0, y: -249.0 }, to: { x: -111.0, y: -249.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -111.0, y: -55.0 }, to: { x: -111.0, y: -27.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -83.0, y: -249.0 }, to: { x: -83.0, y: -276.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -27.0, y: -138.0 }, to: { x: -55.0, y: -138.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 276.0, y: -249.0 }, to: { x: 276.0, y: -221.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 138.0, y: -249.0 }, to: { x: 166.0, y: -249.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -166.0, y: -304.0 }, to: { x: -166.0, y: -332.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -332.0, y: -194.0 }, to: { x: -332.0, y: -249.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 415.0, y: -166.0 }, to: { x: 442.0, y: -166.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -249.0, y: -111.0 }, to: { x: -249.0, y: -83.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 27.0, y: -83.0 }, to: { x: 27.0, y: -194.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 221.0, y: -138.0 }, to: { x: 276.0, y: -138.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 442.0, y: -111.0 }, to: { x: 111.0, y: -111.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 111.0, y: -111.0 }, to: { x: 111.0, y: -138.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 166.0, y: -221.0 }, to: { x: 166.0, y: -166.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -194.0, y: -249.0 }, to: { x: -194.0, y: -221.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -194.0, y: -221.0 }, to: { x: -166.0, y: -221.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -111.0, y: -27.0 }, to: { x: -138.0, y: -27.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 27.0, y: -221.0 }, to: { x: 55.0, y: -221.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 249.0, y: -111.0 }, to: { x: 249.0, y: -83.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -249.0, y: -138.0 }, to: { x: -249.0, y: -111.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -27.0, y: 55.0 }, to: { x: -27.0, y: -83.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -27.0, y: -83.0 }, to: { x: -55.0, y: -83.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -55.0, y: -83.0 }, to: { x: -55.0, y: -111.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -194.0, y: -249.0 }, to: { x: -166.0, y: -249.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -166.0, y: -249.0 }, to: { x: -166.0, y: -276.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 249.0, y: -194.0 }, to: { x: 221.0, y: -194.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 111.0, y: -221.0 }, to: { x: 111.0, y: -249.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 249.0, y: -83.0 }, to: { x: 249.0, y: -55.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -194.0, y: -55.0 }, to: { x: -221.0, y: -55.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -55.0, y: -221.0 }, to: { x: -83.0, y: -221.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -83.0, y: -221.0 }, to: { x: -83.0, y: -249.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -166.0, y: -83.0 }, to: { x: -166.0, y: -111.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -249.0, y: -138.0 }, to: { x: -276.0, y: -138.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 138.0, y: -55.0 }, to: { x: 111.0, y: -55.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -194.0, y: -111.0 }, to: { x: -194.0, y: -138.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 249.0, y: -83.0 }, to: { x: 221.0, y: -83.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 359.0, y: -111.0 }, to: { x: 387.0, y: -111.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 166.0, y: -166.0 }, to: { x: 138.0, y: -166.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 111.0, y: -249.0 }, to: { x: 138.0, y: -249.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 415.0, y: -166.0 }, to: { x: 415.0, y: -194.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 276.0, y: -83.0 }, to: { x: 276.0, y: -55.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -221.0, y: -55.0 }, to: { x: -221.0, y: -83.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 387.0, y: -166.0 }, to: { x: 387.0, y: -249.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 276.0, y: -111.0 }, to: { x: 304.0, y: -111.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 0.0, y: -194.0 }, to: { x: -27.0, y: -194.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 249.0, y: -27.0 }, to: { x: 221.0, y: -27.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -249.0, y: -359.0 }, to: { x: -276.0, y: -359.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 111.0, y: -221.0 }, to: { x: 138.0, y: -221.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 221.0, y: -27.0 }, to: { x: 194.0, y: -27.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 276.0, y: -276.0 }, to: { x: 276.0, y: -249.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -138.0, y: -304.0 }, to: { x: -138.0, y: -332.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -442.0, y: 27.0 }, to: { x: -415.0, y: 27.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -415.0, y: 27.0 }, to: { x: -415.0, y: 55.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -442.0, y: 27.0 }, to: { x: -553.0, y: 27.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 387.0, y: 194.0 }, to: { x: 442.0, y: 194.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 249.0, y: 332.0 }, to: { x: 276.0, y: 332.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 332.0, y: 249.0 }, to: { x: 387.0, y: 249.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 387.0, y: -111.0 }, to: { x: 387.0, y: -55.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 387.0, y: -55.0 }, to: { x: 553.0, y: -55.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -138.0, y: 332.0 }, to: { x: -138.0, y: 470.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -55.0, y: 332.0 }, to: { x: -138.0, y: 332.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 0.0, y: 332.0 }, to: { x: -55.0, y: 332.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 83.0, y: 332.0 }, to: { x: 0.0, y: 332.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 166.0, y: 332.0 }, to: { x: 83.0, y: 332.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 138.0, y: 111.0 }, to: { x: 166.0, y: 111.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 166.0, y: 111.0 }, to: { x: 166.0, y: 332.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 166.0, y: 332.0 }, to: { x: 221.0, y: 332.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 221.0, y: 332.0 }, to: { x: 332.0, y: 332.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -55.0, y: -55.0 }, to: { x: -55.0, y: -111.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 221.0, y: 304.0 }, to: { x: 221.0, y: 332.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 249.0, y: 332.0 }, to: { x: 221.0, y: 332.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 276.0, y: 332.0 }, to: { x: 276.0, y: 415.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -111.0, y: -166.0 }, to: { x: -111.0, y: -194.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 249.0, y: -111.0 }, to: { x: 276.0, y: -111.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -194.0, y: -55.0 }, to: { x: -194.0, y: -83.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 359.0, y: 249.0 }, to: { x: 387.0, y: 249.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 0.0, y: -138.0 }, to: { x: 0.0, y: -111.0 }, style: 'main', width: 12.0 },
  { islandId: 'tortuga_cove', from: { x: 27.0, y: -138.0 }, to: { x: 27.0, y: -83.0 }, style: 'main', width: 12.0 },
  { islandId: 'tortuga_cove', from: { x: -249.0, y: -249.0 }, to: { x: -249.0, y: -304.0 }, style: 'main', width: 12.0 },
  { islandId: 'tortuga_cove', from: { x: -249.0, y: -359.0 }, to: { x: -249.0, y: -304.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -440.0, y: 277.5 }, to: { x: -410.0, y: 277.5 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -410.0, y: 277.5 }, to: { x: -410.0, y: 312.5 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -410.0, y: 312.5 }, to: { x: -380.0, y: 312.5 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -380.0, y: 312.5 }, to: { x: -380.0, y: 350.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -380.0, y: 350.0 }, to: { x: -350.0, y: 350.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -350.0, y: 350.0 }, to: { x: -350.0, y: 385.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -350.0, y: 385.0 }, to: { x: -310.0, y: 385.0 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -310.0, y: 385.0 }, to: { x: -310.0, y: 402.5 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: -310.0, y: 402.5 }, to: { x: -150.0, y: 402.5 }, style: 'path', width: 5.0 },
  { islandId: 'tortuga_cove', from: { x: 325.0, y: -375.0 }, to: { x: 304.0, y: -375.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: 304.0, y: -375.0 }, to: { x: 304.0, y: -332.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -476.0, y: 47.0 }, to: { x: -476.0, y: 27.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -466.0, y: 52.0 }, to: { x: -476.0, y: 52.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -476.0, y: 52.0 }, to: { x: -476.0, y: 47.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: 450.0, y: 30.0 }, to: { x: 450.0, y: -55.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: 75.0, y: 410.0 }, to: { x: 75.0, y: 332.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -306.0, y: -222.0 }, to: { x: -332.0, y: -222.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -545.0, y: -24.0 }, to: { x: -545.0, y: 27.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: 396.0, y: 215.0 }, to: { x: 396.0, y: 194.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: 305.0, y: 304.0 }, to: { x: 332.0, y: 304.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: 230.0, y: 373.0 }, to: { x: 230.0, y: 332.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: 46.5, y: -32.5 }, to: { x: 55.0, y: -32.5 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: 55.0, y: -32.5 }, to: { x: 55.0, y: -55.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: 9.5, y: -13.5 }, to: { x: -27.0, y: -13.5 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: 4.0, y: -28.0 }, to: { x: 4.0, y: -55.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: 4.0, y: -55.0 }, to: { x: 0.0, y: -55.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: 28.0, y: -34.0 }, to: { x: 46.5, y: -34.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: 46.5, y: -34.0 }, to: { x: 46.5, y: -32.5 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: 44.5, y: -13.5 }, to: { x: 46.5, y: -13.5 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: 46.5, y: -13.5 }, to: { x: 46.5, y: -32.5 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: 60.0, y: -21.5 }, to: { x: 55.0, y: -21.5 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: 55.0, y: -21.5 }, to: { x: 55.0, y: -32.5 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: 26.5, y: -12.5 }, to: { x: -27.0, y: -12.5 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: 87.0, y: -84.0 }, to: { x: 87.0, y: -111.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -308.0, y: -281.0 }, to: { x: -304.0, y: -281.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -304.0, y: -281.0 }, to: { x: -304.0, y: -304.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -360.0, y: -58.0 }, to: { x: -359.0, y: -58.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -359.0, y: -58.0 }, to: { x: -359.0, y: -83.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -293.0, y: -56.0 }, to: { x: -293.0, y: -83.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -352.0, y: -26.0 }, to: { x: -332.0, y: -26.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -419.0, y: -111.0 }, to: { x: -442.0, y: -111.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -413.0, y: -55.0 }, to: { x: -442.0, y: -55.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -413.0, y: 111.0 }, to: { x: -442.0, y: 111.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -330.0, y: 111.0 }, to: { x: -359.0, y: 111.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -375.0, y: -1.0 }, to: { x: -375.0, y: 27.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -351.0, y: -144.0 }, to: { x: -351.0, y: -166.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -251.0, y: 42.0 }, to: { x: -221.0, y: 42.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -221.0, y: 42.0 }, to: { x: -221.0, y: 27.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: 82.0, y: -52.0 }, to: { x: 55.0, y: -52.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: 55.0, y: -52.0 }, to: { x: 55.0, y: -55.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: 92.0, y: -35.5 }, to: { x: 82.0, y: -35.5 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: 82.0, y: -35.5 }, to: { x: 82.0, y: -52.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: 63.0, y: 1.0 }, to: { x: 55.0, y: 1.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: 55.0, y: 1.0 }, to: { x: 55.0, y: -55.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: 289.0, y: -421.0 }, to: { x: 304.0, y: -421.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: 304.0, y: -421.0 }, to: { x: 304.0, y: -332.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -217.0, y: -213.0 }, to: { x: -217.0, y: -194.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -47.0, y: -12.5 }, to: { x: -27.0, y: -12.5 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -76.0, y: -341.0 }, to: { x: -76.0, y: -332.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -76.0, y: -332.0 }, to: { x: -138.0, y: -332.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -119.0, y: -314.0 }, to: { x: -138.0, y: -314.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -105.0, y: -292.0 }, to: { x: -83.0, y: -292.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -83.0, y: -292.0 }, to: { x: -83.0, y: -276.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -102.0, y: -348.0 }, to: { x: -138.0, y: -348.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -138.0, y: -348.0 }, to: { x: -138.0, y: -332.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -92.0, y: -319.0 }, to: { x: -83.0, y: -319.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -83.0, y: -319.0 }, to: { x: -83.0, y: -276.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -525.0, y: -3.0 }, to: { x: -525.0, y: 27.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: 307.0, y: 393.0 }, to: { x: 276.0, y: 393.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -430.0, y: 260.0 }, to: { x: -430.0, y: 277.5 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -385.0, y: 285.0 }, to: { x: -410.0, y: 285.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -357.5, y: 325.0 }, to: { x: -380.0, y: 325.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -325.0, y: 357.5 }, to: { x: -350.0, y: 357.5 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -280.0, y: 375.0 }, to: { x: -280.0, y: 402.5 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -230.0, y: 85.0 }, to: { x: -221.0, y: 85.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -221.0, y: 85.0 }, to: { x: -221.0, y: 27.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -260.0, y: 85.0 }, to: { x: -359.0, y: 85.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -245.0, y: 85.0 }, to: { x: -230.0, y: 85.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -260.0, y: 105.0 }, to: { x: -359.0, y: 105.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -245.0, y: 105.0 }, to: { x: -230.0, y: 105.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -230.0, y: 105.0 }, to: { x: -230.0, y: 85.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -230.0, y: 105.0 }, to: { x: -230.0, y: 85.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -235.0, y: 380.0 }, to: { x: -235.0, y: 402.5 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -175.0, y: 380.0 }, to: { x: -175.0, y: 402.5 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: 138.0, y: -27.0 }, to: { x: 138.0, y: -15.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: 138.0, y: -15.0 }, to: { x: 194.0, y: -15.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: 194.0, y: -15.0 }, to: { x: 194.0, y: -27.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -55.0, y: -111.0 }, to: { x: -55.0, y: -115.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: -55.0, y: -115.0 }, to: { x: 0.0, y: -115.0 }, style: 'main', width: 3.0 },
  { islandId: 'tortuga_cove', from: { x: 0.0, y: -115.0 }, to: { x: 0.0, y: -111.0 }, style: 'main', width: 3.0 },

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

/** A point where 2+ street segments meet, with the texture the patch drawn there should use. */
export interface StreetJunction {
  islandId: string;
  point: { x: number; y: number };
  style: 'main' | 'path';
}

// A junction needs a real "fits everything that touches it" test, not the looser epsilon
// `connectedSegments` uses for NPC wandering — grid-snapped segments share an endpoint exactly,
// so a tight tolerance still catches every real junction without accidentally merging two
// separate corners a few units apart.
const JUNCTION_EPSILON = 3;

/** Every point on an island where 2+ street segments share an endpoint — including plain "passes
 * through" crossings authored as two segments meeting at one point, and ordinary elbow turns, not
 * just style-mismatched intersections. Rendering a small filled patch at each of these (see
 * MapScreen.tsx's STREETS render) covers a real gap two independent `<Line>` strokes always leave:
 * `strokeLinecap="square"` only extends a stroke past its own endpoint *along its own direction*,
 * so at a plain right-angle elbow the outer corner is never covered by either rectangle, and where
 * a narrower 'path' crosses a wider 'main' the mismatch leaves visible grass showing through at the
 * corners (the bug direct feedback flagged: "the paths and roads" not reading as clean crossings).
 * A junction that touches at least one 'main' segment gets the paved patch — a paved street stub
 * meeting a dirt path should still look paved right at the joint, matching how the two styles
 * already read (main is the through-route, path yields to it). Computed once per island at module
 * load, the same precomputed-at-import pattern `HOUSE_GARDEN_OFFSETS` (MapScreen.tsx) already uses. */
function streetJunctions(islandId: string): StreetJunction[] {
  const segments = streetsForIsland(islandId);
  const endpoints = segments.flatMap((s) => [
    { point: s.from, style: s.style },
    { point: s.to, style: s.style },
  ]);
  const used = new Array(endpoints.length).fill(false);
  const junctions: StreetJunction[] = [];
  for (let i = 0; i < endpoints.length; i++) {
    if (used[i]) continue;
    const cluster = [endpoints[i]];
    used[i] = true;
    for (let j = i + 1; j < endpoints.length; j++) {
      if (used[j]) continue;
      if (
        Math.hypot(endpoints[i].point.x - endpoints[j].point.x, endpoints[i].point.y - endpoints[j].point.y) <
        JUNCTION_EPSILON
      ) {
        cluster.push(endpoints[j]);
        used[j] = true;
      }
    }
    if (cluster.length < 2) continue; // a lone dead-end's own square cap already covers it cleanly
    junctions.push({
      islandId,
      point: cluster[0].point,
      style: cluster.some((c) => c.style === 'main') ? 'main' : 'path',
    });
  }
  return junctions;
}

const STREET_ISLAND_IDS = Array.from(new Set(STREETS.map((s) => s.islandId)));
export const STREET_JUNCTIONS: StreetJunction[] = STREET_ISLAND_IDS.flatMap((id) => streetJunctions(id));

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
