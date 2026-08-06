/** Purely visual row-house scenery: fills out the residential district around the town core
 * so it reads as a dense, real settlement instead of a handful of named buildings on grass.
 * No interior, no interaction, no per-tick proximity checks — just a footprint on the map,
 * like background buildings in GTA. Positions were procedurally generated and filtered to land
 * + clearance from every other marker before being pasted in here.
 *
 * Tortuga's residential layout was rebuilt 2026-08-05, replacing a 5x5 avenue grid that spread
 * housing across most of the island's southern half — realistic for a 20th-century suburb, not a
 * 17th-century harbor town, and it was also the reason houses kept turning up sitting on top of
 * paths (see GAME_DESIGN.md items 39-45). A first pass replaced the grid with spiral-packed halos
 * around every downtown building — corrected the same day per direct pushback: "I don't want row
 * and rows of houses three deep. I want them lined up next to each other lining the road rather
 * than spaced deep. This makes the player have to use the paths." Halos are rings by definition
 * (several houses deep from any given point) and were still centered on buildings spread across
 * the whole town, so the result was still both "deep" and sprawling. Replaced with literal
 * road-lining instead: walk a tight, curated subset of real Tortuga streets — just the
 * harbor-to-Basse-Terre-Square corridor, not every spoke on the island — and place a single file
 * of houses along BOTH sides at fixed ~27-unit (touching-neighbor) spacing, offset just far enough
 * off the road edge to legally clear it. One house deep, always facing the street, with gaps left
 * wherever a real building already occupies that stretch of frontage. Spacing is tight enough
 * (house collision radius 12 x2 vs 27-unit spacing) that a player can't squeeze between two
 * adjacent houses — the row itself is what channels foot traffic onto the road. A handful of
 * standalone houses near the outlying named locations (Fishmonger, Ropewalk, West Point Shack,
 * the Ruins, etc.) round out the "sporadic elsewhere" half of the original ask. */
export interface House {
  islandId: string;
  offset: { x: number; y: number }; // relative to island center, in world units
}

export const HOUSES: House[] = [
  // Row houses lining Basse-Terre Square's three inner spokes (-> Salty Parrot, -> Trading Post,
  // -> Chapel), one house deep on each side of the road.
  { islandId: 'tortuga_cove', offset: { x: -47, y: 28 } },
  { islandId: 'tortuga_cove', offset: { x: -82, y: -12 } },
  { islandId: 'tortuga_cove', offset: { x: -100, y: -33 } },
  { islandId: 'tortuga_cove', offset: { x: -108, y: 46 } },
  { islandId: 'tortuga_cove', offset: { x: -144, y: 6 } },
  { islandId: 'tortuga_cove', offset: { x: -161, y: -15 } },
  { islandId: 'tortuga_cove', offset: { x: 35, y: 67 } },
  { islandId: 'tortuga_cove', offset: { x: 58, y: 52 } },
  { islandId: 'tortuga_cove', offset: { x: 103, y: 23 } },
  { islandId: 'tortuga_cove', offset: { x: 149, y: -6 } },
  { islandId: 'tortuga_cove', offset: { x: -19, y: 32 } },
  { islandId: 'tortuga_cove', offset: { x: 26, y: 3 } },
  { islandId: 'tortuga_cove', offset: { x: 72, y: -26 } },
  { islandId: 'tortuga_cove', offset: { x: 118, y: -55 } },
  { islandId: 'tortuga_cove', offset: { x: 88, y: 77 } },
  { islandId: 'tortuga_cove', offset: { x: 140, y: 88 } },
  // Row houses lining the harbor road (Trading Post -> Fishing Dock).
  { islandId: 'tortuga_cove', offset: { x: 173, y: -114 } },
  { islandId: 'tortuga_cove', offset: { x: 156, y: -135 } },
  { islandId: 'tortuga_cove', offset: { x: 139, y: -156 } },
  { islandId: 'tortuga_cove', offset: { x: 122, y: -177 } },
  { islandId: 'tortuga_cove', offset: { x: 105, y: -198 } },
  { islandId: 'tortuga_cove', offset: { x: 71, y: -239 } },
  { islandId: 'tortuga_cove', offset: { x: 111, y: -98 } },
  { islandId: 'tortuga_cove', offset: { x: 94, y: -119 } },
  { islandId: 'tortuga_cove', offset: { x: 77, y: -140 } },
  { islandId: 'tortuga_cove', offset: { x: 60, y: -161 } },
  { islandId: 'tortuga_cove', offset: { x: 43, y: -182 } },
  { islandId: 'tortuga_cove', offset: { x: 26, y: -203 } },
  { islandId: 'tortuga_cove', offset: { x: 9, y: -224 } },
  // Row houses lining the dock-district streets (Harbor Pier / Warehouse / Chandlery /
  // Harbourmaster spokes).
  { islandId: 'tortuga_cove', offset: { x: 99, y: -258 } },
  { islandId: 'tortuga_cove', offset: { x: 95, y: -316 } },
  { islandId: 'tortuga_cove', offset: { x: -52, y: -283 } },
  { islandId: 'tortuga_cove', offset: { x: -23, y: -233 } },
  { islandId: 'tortuga_cove', offset: { x: -131, y: -263 } },
  { islandId: 'tortuga_cove', offset: { x: -121, y: -289 } },
  { islandId: 'tortuga_cove', offset: { x: 15, y: -346 } },
  { islandId: 'tortuga_cove', offset: { x: 11, y: -404 } },
  { islandId: 'tortuga_cove', offset: { x: 38, y: -405 } },
  // Row houses lining Salty Parrot -> The Anchor & Forge.
  { islandId: 'tortuga_cove', offset: { x: -219, y: -42 } },
  { islandId: 'tortuga_cove', offset: { x: -232, y: 10 } },
  { islandId: 'tortuga_cove', offset: { x: -176, y: 24 } },
  // Sporadic houses: a single standalone homestead near each outlying location, instead of a
  // second neighborhood — matches the existing outpost pattern (West Point Shack, the Ruins, etc).
  { islandId: 'tortuga_cove', offset: { x: -248, y: 280 } }, // near the Fishmonger's Stall
  { islandId: 'tortuga_cove', offset: { x: 92, y: 284 } }, // near the Locked Ward / Bounty Board
  { islandId: 'tortuga_cove', offset: { x: -128, y: 358 } }, // near the Ropewalk
  { islandId: 'tortuga_cove', offset: { x: -368, y: 58 } }, // near West Point Shack
  { islandId: 'tortuga_cove', offset: { x: -478, y: 14 } }, // near El Fuerte Viejo (the Ruins)
  { islandId: 'tortuga_cove', offset: { x: 372, y: 168 } }, // near the Trapper's Camp
  { islandId: 'tortuga_cove', offset: { x: 224, y: 350 } }, // near the Old Landing Dock
  { islandId: 'tortuga_cove', offset: { x: 320, y: 220 } }, // near La Ringot Fields
  { islandId: 'tortuga_cove', offset: { x: 476, y: -40 } }, // near the High Woods
  { islandId: 'tortuga_cove', offset: { x: -110, y: 416 } }, // near the Forgotten Graves
  // New Providence residential grid: generated the same way as Tortuga's original grid — candidate positions
  // along a residential avenue grid, filtered to inside the real island polygon and clear of
  // every building/fort/quest marker and every other house (see GAME_DESIGN.md for the script).
  { islandId: 'new_providence', offset: { x: -269, y: -278 } },
  // (-120,-104) dropped — too close to the rum resource node at (-140,-100), missed in the
  // original generation pass because resource nodes weren't in that script's marker list.
  { islandId: 'new_providence', offset: { x: -189, y: -278 } },
  { islandId: 'new_providence', offset: { x: -189, y: -202 } },
  { islandId: 'new_providence', offset: { x: -109, y: -278 } },
  { islandId: 'new_providence', offset: { x: -109, y: -202 } },
  { islandId: 'new_providence', offset: { x: -29, y: -278 } },
  { islandId: 'new_providence', offset: { x: -29, y: -202 } },
  { islandId: 'new_providence', offset: { x: 51, y: -278 } },
  { islandId: 'new_providence', offset: { x: 51, y: -202 } },
  { islandId: 'new_providence', offset: { x: 131, y: -278 } },
  { islandId: 'new_providence', offset: { x: 131, y: -202 } },
  { islandId: 'new_providence', offset: { x: -349, y: -132 } },
  { islandId: 'new_providence', offset: { x: -269, y: -132 } },
  { islandId: 'new_providence', offset: { x: -189, y: -132 } },
  { islandId: 'new_providence', offset: { x: -109, y: -132 } },
  { islandId: 'new_providence', offset: { x: -29, y: -132 } },
  { islandId: 'new_providence', offset: { x: 51, y: -132 } },
  { islandId: 'new_providence', offset: { x: 211, y: -132 } },
  { islandId: 'new_providence', offset: { x: -290, y: -72 } },
  { islandId: 'new_providence', offset: { x: -210, y: -68 } },
  { islandId: 'new_providence', offset: { x: -130, y: -68 } },
  { islandId: 'new_providence', offset: { x: -50, y: -68 } },
  { islandId: 'new_providence', offset: { x: 116, y: -63 } },
  { islandId: 'new_providence', offset: { x: 190, y: -68 } },
  { islandId: 'new_providence', offset: { x: 270, y: -68 } },
  { islandId: 'new_providence', offset: { x: 350, y: -68 } },
  { islandId: 'new_providence', offset: { x: -349, y: 8 } },
  { islandId: 'new_providence', offset: { x: -269, y: 8 } },
  { islandId: 'new_providence', offset: { x: -189, y: 8 } },
  { islandId: 'new_providence', offset: { x: -109, y: 8 } },
  { islandId: 'new_providence', offset: { x: 51, y: 74 } },
  { islandId: 'new_providence', offset: { x: 190, y: 2 } },
  { islandId: 'new_providence', offset: { x: 270, y: 2 } },
  { islandId: 'new_providence', offset: { x: 350, y: 2 } },
  { islandId: 'new_providence', offset: { x: -349, y: 78 } },
  { islandId: 'new_providence', offset: { x: -269, y: 78 } },
  { islandId: 'new_providence', offset: { x: -50, y: 72 } },
  { islandId: 'new_providence', offset: { x: -29, y: 144 } },
  { islandId: 'new_providence', offset: { x: 51, y: 144 } },
  { islandId: 'new_providence', offset: { x: 190, y: 72 } },
  { islandId: 'new_providence', offset: { x: 274, y: 142 } },
  { islandId: 'new_providence', offset: { x: -269, y: 148 } },
  { islandId: 'new_providence', offset: { x: -109, y: 148 } },
  { islandId: 'new_providence', offset: { x: -29, y: 214 } },
  { islandId: 'new_providence', offset: { x: 110, y: 142 } },
  { islandId: 'new_providence', offset: { x: 131, y: 214 } },
  { islandId: 'new_providence', offset: { x: 211, y: 214 } },
  { islandId: 'new_providence', offset: { x: 350, y: 142 } },
  { islandId: 'new_providence', offset: { x: -297, y: 132 } }, // was outside the island polygon; refixed 2026-08-04
  { islandId: 'new_providence', offset: { x: -189, y: 218 } },
  { islandId: 'new_providence', offset: { x: -109, y: 218 } },
  { islandId: 'new_providence', offset: { x: 30, y: 212 } },
  { islandId: 'new_providence', offset: { x: 51, y: 284 } },
  { islandId: 'new_providence', offset: { x: 131, y: 284 } },
  { islandId: 'new_providence', offset: { x: 291, y: 218 } },
  { islandId: 'new_providence', offset: { x: -54, y: 307 } }, // was outside the island polygon; refixed 2026-08-04
  { islandId: 'new_providence', offset: { x: -109, y: 288 } },
  { islandId: 'new_providence', offset: { x: -29, y: 288 } },
  { islandId: 'new_providence', offset: { x: 108, y: 305 } },
  { islandId: 'new_providence', offset: { x: 190, y: 282 } },
  { islandId: 'new_providence', offset: { x: 214, y: 84 } }, // was outside the island polygon; refixed 2026-08-04
];

export function housesForIsland(islandId: string): House[] {
  return HOUSES.filter((h) => h.islandId === islandId);
}

export function houseWorldPosition(
  house: House,
  islandPosition: { x: number; y: number }
): { x: number; y: number } {
  return { x: islandPosition.x + house.offset.x, y: islandPosition.y + house.offset.y };
}
