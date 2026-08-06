/** Purely visual row-house scenery: fills out the residential district around the town core
 * so it reads as a dense, real settlement instead of a handful of named buildings on grass.
 * No interior, no interaction, no per-tick proximity checks — just a footprint on the map,
 * like background buildings in GTA. Positions were procedurally generated and filtered to land
 * + clearance from every other marker before being pasted in here.
 *
 * Tortuga's residential layout was rebuilt 2026-08-05, replacing a 5x5 avenue grid that spread
 * housing across most of the island's southern half — realistic for a 20th-century suburb, not a
 * 17th-century harbor town, and it was also the reason houses kept turning up sitting on top of
 * paths (see GAME_DESIGN.md items 39-45). Two same-day corrections followed direct feedback:
 * (1) a spiral-packed "halo" per building was still rings-deep and still spread across the whole
 * town, so it was replaced with literal road-lining — a single file of houses on both sides of a
 * real street, offset just past the road edge; (2) that first road-lining pass only covered the
 * harbor-to-Basse-Terre-Square corridor and left too much daylight between houses, per a reference
 * sketch showing houses touching/overlapping shoulder to shoulder — extended to every real 'main'
 * street on the island (not just the dock corridor) at tight ~22-unit spacing, close enough that
 * the 26-unit-wide house sprites visually touch/interlock, matching the sketch. The rural 'path'
 * trails (West Point Shack, the Ruins, La Ringot Fields, etc.) stay deliberately house-free — a
 * handful of standalone homesteads near those cover the "sporadic elsewhere" half of the original
 * ask instead. Spacing is tight enough (house collision radius 12 x2 vs 22-unit spacing) that a
 * player can't squeeze between two neighboring row houses — the row itself is what channels foot
 * traffic onto the road. */
export interface House {
  islandId: string;
  offset: { x: number; y: number }; // relative to island center, in world units
}

export const HOUSES: House[] = [
  // Basse-Terre Square -> the Salty Parrot (7 houses)
  { islandId: 'tortuga_cove', offset: { x: -41, y: 34 } },
  { islandId: 'tortuga_cove', offset: { x: -70, y: 1 } },
  { islandId: 'tortuga_cove', offset: { x: -99, y: -32 } },
  { islandId: 'tortuga_cove', offset: { x: -128, y: -65 } },
  { islandId: 'tortuga_cove', offset: { x: -114, y: 40 } },
  { islandId: 'tortuga_cove', offset: { x: -128, y: 23 } },
  { islandId: 'tortuga_cove', offset: { x: -143, y: 6 } },
  // Basse-Terre Square -> Harbor Trading Post (10 houses)
  { islandId: 'tortuga_cove', offset: { x: 42, y: 62 } },
  { islandId: 'tortuga_cove', offset: { x: 61, y: 50 } },
  { islandId: 'tortuga_cove', offset: { x: 80, y: 38 } },
  { islandId: 'tortuga_cove', offset: { x: 117, y: 15 } },
  { islandId: 'tortuga_cove', offset: { x: 154, y: -9 } },
  { islandId: 'tortuga_cove', offset: { x: -7, y: 25 } },
  { islandId: 'tortuga_cove', offset: { x: 30, y: 1 } },
  { islandId: 'tortuga_cove', offset: { x: 67, y: -22 } },
  { islandId: 'tortuga_cove', offset: { x: 86, y: -34 } },
  { islandId: 'tortuga_cove', offset: { x: 123, y: -58 } },
  // Basse-Terre Square -> the Fishmonger's Stall (13 houses)
  { islandId: 'tortuga_cove', offset: { x: -103, y: 90 } },
  { islandId: 'tortuga_cove', offset: { x: -121, y: 103 } },
  { islandId: 'tortuga_cove', offset: { x: -139, y: 116 } },
  { islandId: 'tortuga_cove', offset: { x: -157, y: 129 } },
  { islandId: 'tortuga_cove', offset: { x: -175, y: 142 } },
  { islandId: 'tortuga_cove', offset: { x: -210, y: 168 } },
  { islandId: 'tortuga_cove', offset: { x: -69, y: 137 } },
  { islandId: 'tortuga_cove', offset: { x: -87, y: 150 } },
  { islandId: 'tortuga_cove', offset: { x: -105, y: 163 } },
  { islandId: 'tortuga_cove', offset: { x: -123, y: 176 } },
  { islandId: 'tortuga_cove', offset: { x: -141, y: 189 } },
  { islandId: 'tortuga_cove', offset: { x: -176, y: 214 } },
  { islandId: 'tortuga_cove', offset: { x: -194, y: 227 } },
  // Basse-Terre Square -> Chapelle Notre-Dame (3 houses)
  { islandId: 'tortuga_cove', offset: { x: 65, y: 72 } },
  { islandId: 'tortuga_cove', offset: { x: 87, y: 77 } },
  { islandId: 'tortuga_cove', offset: { x: 130, y: 86 } },
  // Basse-Terre Square -> the Locked Ward (3 houses)
  { islandId: 'tortuga_cove', offset: { x: 20, y: 191 } },
  { islandId: 'tortuga_cove', offset: { x: 35, y: 208 } },
  { islandId: 'tortuga_cove', offset: { x: 64, y: 241 } },
  // Basse-Terre Square -> the Bounty Board (3 houses)
  { islandId: 'tortuga_cove', offset: { x: -51, y: 164 } },
  { islandId: 'tortuga_cove', offset: { x: -42, y: 207 } },
  { islandId: 'tortuga_cove', offset: { x: 25, y: 237 } },
  // The harbor road, Trading Post -> Fishing Dock (16 houses)
  { islandId: 'tortuga_cove', offset: { x: 175, y: -112 } },
  { islandId: 'tortuga_cove', offset: { x: 161, y: -129 } },
  { islandId: 'tortuga_cove', offset: { x: 147, y: -146 } },
  { islandId: 'tortuga_cove', offset: { x: 133, y: -163 } },
  { islandId: 'tortuga_cove', offset: { x: 119, y: -180 } },
  { islandId: 'tortuga_cove', offset: { x: 105, y: -197 } },
  { islandId: 'tortuga_cove', offset: { x: 78, y: -231 } },
  { islandId: 'tortuga_cove', offset: { x: 64, y: -248 } },
  { islandId: 'tortuga_cove', offset: { x: 116, y: -92 } },
  { islandId: 'tortuga_cove', offset: { x: 102, y: -109 } },
  { islandId: 'tortuga_cove', offset: { x: 88, y: -126 } },
  { islandId: 'tortuga_cove', offset: { x: 61, y: -160 } },
  { islandId: 'tortuga_cove', offset: { x: 47, y: -177 } },
  { islandId: 'tortuga_cove', offset: { x: 33, y: -194 } },
  { islandId: 'tortuga_cove', offset: { x: 19, y: -211 } },
  { islandId: 'tortuga_cove', offset: { x: 5, y: -228 } },
  // -> Harbor Pier (4 houses)
  { islandId: 'tortuga_cove', offset: { x: 103, y: -258 } },
  { islandId: 'tortuga_cove', offset: { x: 125, y: -260 } },
  { islandId: 'tortuga_cove', offset: { x: 33, y: -311 } },
  { islandId: 'tortuga_cove', offset: { x: 99, y: -316 } },
  // -> the Warehouse (3 houses)
  { islandId: 'tortuga_cove', offset: { x: -45, y: -287 } },
  { islandId: 'tortuga_cove', offset: { x: -16, y: -237 } },
  { islandId: 'tortuga_cove', offset: { x: -54, y: -215 } },
  // Warehouse -> the Chandlery (3 houses)
  { islandId: 'tortuga_cove', offset: { x: -132, y: -260 } },
  { islandId: 'tortuga_cove', offset: { x: -124, y: -281 } },
  { islandId: 'tortuga_cove', offset: { x: -117, y: -302 } },
  // Chandlery -> Harbourmaster's Office (4 houses)
  { islandId: 'tortuga_cove', offset: { x: 29, y: -346 } },
  { islandId: 'tortuga_cove', offset: { x: 3, y: -403 } },
  { islandId: 'tortuga_cove', offset: { x: 25, y: -404 } },
  { islandId: 'tortuga_cove', offset: { x: 47, y: -406 } },
  // Trading Post -> the Customs House (5 houses)
  { islandId: 'tortuga_cove', offset: { x: 203, y: -13 } },
  { islandId: 'tortuga_cove', offset: { x: 241, y: 8 } },
  { islandId: 'tortuga_cove', offset: { x: 261, y: 19 } },
  { islandId: 'tortuga_cove', offset: { x: 232, y: -64 } },
  { islandId: 'tortuga_cove', offset: { x: 270, y: -42 } },
  // Chapel -> the Baker's Oven (3 houses)
  { islandId: 'tortuga_cove', offset: { x: 159, y: 162 } },
  { islandId: 'tortuga_cove', offset: { x: 137, y: 164 } },
  { islandId: 'tortuga_cove', offset: { x: 115, y: 165 } },
  // Locked Ward -> the Baker's Oven (2 houses)
  { islandId: 'tortuga_cove', offset: { x: 142, y: 237 } },
  { islandId: 'tortuga_cove', offset: { x: 133, y: 216 } },
  // Fishmonger -> the Ropewalk (6 houses)
  { islandId: 'tortuga_cove', offset: { x: -240, y: 288 } },
  { islandId: 'tortuga_cove', offset: { x: -222, y: 301 } },
  { islandId: 'tortuga_cove', offset: { x: -203, y: 313 } },
  { islandId: 'tortuga_cove', offset: { x: -190, y: 252 } },
  { islandId: 'tortuga_cove', offset: { x: -171, y: 264 } },
  { islandId: 'tortuga_cove', offset: { x: -153, y: 277 } },
  // Bounty Board -> the Ropewalk (6 houses)
  { islandId: 'tortuga_cove', offset: { x: -44, y: 247 } },
  { islandId: 'tortuga_cove', offset: { x: -84, y: 265 } },
  { islandId: 'tortuga_cove', offset: { x: -125, y: 282 } },
  { islandId: 'tortuga_cove', offset: { x: -1, y: 292 } },
  { islandId: 'tortuga_cove', offset: { x: -41, y: 309 } },
  { islandId: 'tortuga_cove', offset: { x: -82, y: 327 } },
  // Salty Parrot -> the Anchor & Forge (5 houses)
  { islandId: 'tortuga_cove', offset: { x: -218, y: -45 } },
  { islandId: 'tortuga_cove', offset: { x: -229, y: -3 } },
  { islandId: 'tortuga_cove', offset: { x: -235, y: 19 } },
  { islandId: 'tortuga_cove', offset: { x: -168, y: -10 } },
  { islandId: 'tortuga_cove', offset: { x: -173, y: 12 } },
  // Sporadic houses: a single standalone homestead near each outlying location that's still on a
  // rural trail rather than a real street, instead of a second neighborhood — matches the existing
  // outpost pattern (West Point Shack, the Ruins, etc).
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
