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
  // Full-town rebuild 2026-08-07 (item 52): "start again" — Tortuga's north coast was reshaped
  // into a real horseshoe harbor (see islands.ts) and the whole town rebuilt around it as an
  // organic, waterfront-centric street plan instead of a hub-and-spoke square, per real
  // 17th-century outlaw ports (Port Royal, Tortuga) and hand-drawn fantasy harbor-town references
  // supplied directly. The backbone is a single curving coastal high street hugging the inner
  // shore of the bay, headland to headland, with a short "alley" off it to every building/
  // landmark/quest-marker — narrow, organic, non-grid, matching "narrow thoroughfares...
  // tightly packed buildings" rather than formal planning. See buildings.ts, houses.ts,
  // landmarks.ts, harbor.ts for the matching moves.
  // The coastal high street itself, west headland to east headland.
  { islandId: 'tortuga_cove', from: { x: -259, y: -363 }, to: { x: -205, y: -276 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: -205, y: -276 }, to: { x: -131, y: -202 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: -131, y: -202 }, to: { x: -29, y: -151 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: -29, y: -151 }, to: { x: 79, y: -144 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: 79, y: -144 }, to: { x: 184, y: -177 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: 184, y: -177 }, to: { x: 262, y: -242 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: 262, y: -242 }, to: { x: 317, y: -319 }, style: 'main' },
  // Alleys off the high street — docks-and-careening quarter, west side.
  { islandId: 'tortuga_cove', from: { x: -209, y: -282 }, to: { x: -246, y: -259 }, style: 'main' }, // -> Sailmaker's Loft
  { islandId: 'tortuga_cove', from: { x: -184, y: -255 }, to: { x: -228, y: -211 }, style: 'main' }, // -> The Cooper's Yard
  // -> The Ropewalk, bent around the Cooper's Yard instead of cutting behind it
  { islandId: 'tortuga_cove', from: { x: -192, y: -263 }, to: { x: -246, y: -229 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: -246, y: -229 }, to: { x: -280, y: -175 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: -147, y: -218 }, to: { x: -193, y: -172 }, style: 'main' }, // -> Smugglers' Warehouse
  { islandId: 'tortuga_cove', from: { x: -105, y: -189 }, to: { x: -130, y: -140 }, style: 'main' }, // -> The Chandlery
  { islandId: 'tortuga_cove', from: { x: -66, y: -169 }, to: { x: -98, y: -105 }, style: 'main' }, // -> The Anchor & Forge
  // Alleys off the high street — the sheltered bottom of the bay, the harbor's administrative core.
  { islandId: 'tortuga_cove', from: { x: -19, y: -150 }, to: { x: -22, y: -100 }, style: 'main' }, // -> Harbourmaster's Office
  { islandId: 'tortuga_cove', from: { x: 32, y: -147 }, to: { x: 28, y: -79 }, style: 'main' }, // -> The Customs House
  { islandId: 'tortuga_cove', from: { x: 18, y: -148 }, to: { x: 16, y: -118 }, style: 'main' }, // -> Basse-Terre Square
  // -> Bounty Board, bent around the Harbourmaster's Office instead of cutting behind it
  { islandId: 'tortuga_cove', from: { x: 2, y: -149 }, to: { x: 10, y: -108 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: 10, y: -108 }, to: { x: -4, y: -49 }, style: 'main' },
  // -> Locked Ward, bent around the Customs House instead of cutting behind it
  { islandId: 'tortuga_cove', from: { x: 54, y: -146 }, to: { x: 112, y: -88 }, style: 'main' },
  { islandId: 'tortuga_cove', from: { x: 112, y: -88 }, to: { x: 47, y: -38 }, style: 'main' },
  // Alleys off the high street — the tavern district, the busiest stretch of quay.
  { islandId: 'tortuga_cove', from: { x: 77, y: -144 }, to: { x: 73, y: -89 }, style: 'main' }, // -> The Salty Parrot
  { islandId: 'tortuga_cove', from: { x: 125, y: -159 }, to: { x: 144, y: -99 }, style: 'main' }, // -> Harbor Trading Post
  { islandId: 'tortuga_cove', from: { x: 175, y: -174 }, to: { x: 190, y: -126 }, style: 'main' }, // -> Dockworkers' Bunkhouse
  // Alleys off the high street — the east side, chapel and working-class quarter.
  { islandId: 'tortuga_cove', from: { x: 216, y: -204 }, to: { x: 260, y: -151 }, style: 'main' }, // -> Chapelle Notre-Dame
  { islandId: 'tortuga_cove', from: { x: 262, y: -242 }, to: { x: 297, y: -199 }, style: 'main' }, // -> The Fishmonger's Stall
  { islandId: 'tortuga_cove', from: { x: 281, y: -268 }, to: { x: 319, y: -241 }, style: 'main' }, // -> The Baker's Oven
  // Both headlands' real access was a rock-cut staircase and a pull-up ladder — a treacherous
  // route rather than a proper street.
  { islandId: 'tortuga_cove', from: { x: 286, y: -275 }, to: { x: 265, y: -290 }, style: 'path' }, // -> Fort de Rocher
  { islandId: 'tortuga_cove', from: { x: -226, y: -311 }, to: { x: -195, y: -330 }, style: 'path' }, // -> the Lighthouse
  // Rural outskirts, reached by coastal trail / farm track rather than a paved town street.
  // -> West Point Shack, bent around the Cooper's Yard/Sailmaker's Loft cluster instead of
  // cutting behind it
  { islandId: 'tortuga_cove', from: { x: -205, y: -276 }, to: { x: -202, y: -206 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -202, y: -206 }, to: { x: -350, y: 25 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 220, y: 152 }, to: { x: 280, y: 220 }, style: 'path' }, // -> La Ringot Fields
  // Back lanes off the coastal high street, each one shared path threading through a
  // cluster of houses that sit further back from it and interconnecting them directly —
  // direct feedback: "not every house needs its own path. One path next to the houses
  // interconnecting them." Replaces the earlier one-spur-per-house layout (item 53) with a
  // single shared lane per district, attached to the backbone at one point. Routed
  // programmatically (k-means clustering + nearest-neighbor chain + 2-opt) so each lane
  // visits its houses in a sensible order without crossing itself; a handful of houses too
  // tightly wedged into the Chandlery/Anchor & Forge cluster, plus the sporadic rural
  // homesteads (already served by their own trail), are still left without one — see
  // GAME_DESIGN.md item 54.
  // -> East back lane, serving the houses tucked behind the Chapel/Fishmonger/Baker's Oven quarter
  { islandId: 'tortuga_cove', from: { x: 236, y: -221 }, to: { x: 226, y: -268 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 226, y: -268 }, to: { x: 215, y: -246 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 215, y: -246 }, to: { x: 186, y: -246 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 186, y: -246 }, to: { x: 240, y: -132 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 240, y: -132 }, to: { x: 285, y: -110 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 285, y: -110 }, to: { x: 269, y: -90 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 269, y: -90 }, to: { x: 292, y: -76 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 292, y: -76 }, to: { x: 311, y: -87 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 311, y: -87 }, to: { x: 332, y: -101 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 332, y: -101 }, to: { x: 325, y: -123 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 325, y: -123 }, to: { x: 328, y: -149 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 328, y: -149 }, to: { x: 339, y: -167 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 339, y: -167 }, to: { x: 356, y: -149 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 356, y: -149 }, to: { x: 376, y: -141 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 376, y: -141 }, to: { x: 364, y: -169 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 364, y: -169 }, to: { x: 353, y: -192 }, style: 'path' },
  // -> North back lane, serving the houses set back from the harbor administrative core
  { islandId: 'tortuga_cove', from: { x: 67, y: -145 }, to: { x: 69, y: -179 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 69, y: -179 }, to: { x: 88, y: -190 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 88, y: -190 }, to: { x: 104, y: -209 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 104, y: -209 }, to: { x: 39, y: -191 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 39, y: -191 }, to: { x: 17, y: -200 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 17, y: -200 }, to: { x: -24, y: -187 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -24, y: -187 }, to: { x: -35, y: -214 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -35, y: -214 }, to: { x: -70, y: -215 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -70, y: -215 }, to: { x: -83, y: -239 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -83, y: -239 }, to: { x: -109, y: -257 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -109, y: -257 }, to: { x: -126, y: -275 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -126, y: -275 }, to: { x: -143, y: -289 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -143, y: -289 }, to: { x: -134, y: -254 }, style: 'path' },
  // -> West back lane, serving the houses tucked behind the docks-and-careening quarter
  { islandId: 'tortuga_cove', from: { x: -130, y: -201 }, to: { x: -171, y: -119 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -171, y: -119 }, to: { x: -168, y: -93 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -168, y: -93 }, to: { x: -187, y: -60 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -187, y: -60 }, to: { x: -202, y: -79 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -202, y: -79 }, to: { x: -207, y: -102 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -207, y: -102 }, to: { x: -205, y: -128 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -205, y: -128 }, to: { x: -229, y: -104 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -229, y: -104 }, to: { x: -237, y: -128 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -237, y: -128 }, to: { x: -256, y: -111 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -256, y: -111 }, to: { x: -268, y: -132 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -268, y: -132 }, to: { x: -238, y: -152 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -238, y: -152 }, to: { x: -289, y: -217 }, style: 'path' },
  // -> Small back lane, serving the houses south of the Harbourmaster's Office/Anchor & Forge
  { islandId: 'tortuga_cove', from: { x: -29, y: -151 }, to: { x: -49, y: -108 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -49, y: -108 }, to: { x: -46, y: -61 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -46, y: -61 }, to: { x: -68, y: -62 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -68, y: -62 }, to: { x: -88, y: -48 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -88, y: -48 }, to: { x: -105, y: -60 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -105, y: -60 }, to: { x: -122, y: -24 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -122, y: -24 }, to: { x: -93, y: -22 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -93, y: -22 }, to: { x: -53, y: -26 }, style: 'path' },
  // -> South back lane, serving the houses set back from the tavern district
  { islandId: 'tortuga_cove', from: { x: 155, y: -168 }, to: { x: 144, y: -202 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 144, y: -202 }, to: { x: 125, y: -214 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 125, y: -214 }, to: { x: 153, y: -226 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 153, y: -226 }, to: { x: 242, y: -110 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 242, y: -110 }, to: { x: 251, y: -76 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 251, y: -76 }, to: { x: 271, y: -56 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 271, y: -56 }, to: { x: 254, y: -42 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 254, y: -42 }, to: { x: 227, y: -38 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 227, y: -38 }, to: { x: 206, y: -34 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 206, y: -34 }, to: { x: 208, y: -64 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 208, y: -64 }, to: { x: 229, y: -66 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 229, y: -66 }, to: { x: 219, y: -87 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 219, y: -87 }, to: { x: 177, y: -59 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 177, y: -59 }, to: { x: 183, y: -34 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 183, y: -34 }, to: { x: 165, y: -23 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 165, y: -23 }, to: { x: 154, y: -44 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 154, y: -44 }, to: { x: 129, y: -59 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 129, y: -59 }, to: { x: 117, y: -25 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 117, y: -25 }, to: { x: 96, y: -42 }, style: 'path' },

  // The 1.35x island enlargement (2026-08-02) opened new land beyond the original coastline for
  // three outlying zones, each reached by a rough, winding trail rather than a paved street —
  // wilderness and ruins, not town blocks.
  // West cape: a goat-track out to El Fuerte Viejo, the ruined Spanish redoubt.
  { islandId: 'tortuga_cove', from: { x: -403, y: 0 }, to: { x: -444, y: -36 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -444, y: -36 }, to: { x: -482, y: -21 }, style: 'path' },
  // East cape: a forest trail forking to the High Woods and its two timber stands.
  { islandId: 'tortuga_cove', from: { x: 346, y: 4 }, to: { x: 386, y: -20 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 386, y: -20 }, to: { x: 436, y: -40 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 436, y: -40 }, to: { x: 520, y: 20 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 386, y: -20 }, to: { x: 410, y: 100 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 410, y: 100 }, to: { x: 355, y: 148 }, style: 'path' },
  // A smuggler doesn't camp on the main trail — a fainter side-track breaks off from the
  // Trapper's Camp toward the cache, deeper into the woods still.
  { islandId: 'tortuga_cove', from: { x: 311, y: 190 }, to: { x: 261, y: 244 }, style: 'path' },
  // South coast: a rough trail down to the abandoned quarter and its burying ground. (Used to
  // start right at the Ropewalk before item 51 pulled it into the harbor town — this trailhead
  // coordinate is unchanged, just no longer named after a building that isn't there anymore.)
  { islandId: 'tortuga_cove', from: { x: -140, y: 320 }, to: { x: -92, y: 358 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -92, y: 358 }, to: { x: -70, y: 416 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: -70, y: 416 }, to: { x: 120, y: 410 }, style: 'path' },
  { islandId: 'tortuga_cove', from: { x: 120, y: 410 }, to: { x: 162, y: 371 }, style: 'path' },

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
