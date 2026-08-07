/** Purely visual row-house scenery: fills out the residential district around the town core
 * so it reads as a dense, real settlement instead of a handful of named buildings on grass.
 * No interior, no interaction, no per-tick proximity checks — just a footprint on the map,
 * like background buildings in GTA. Positions were procedurally generated and filtered to land
 * + clearance from every other marker before being pasted in here.
 *
 * Tortuga's residential layout was rebuilt 2026-08-05/06, replacing a 5x5 avenue grid that spread
 * housing across most of the island's southern half — realistic for a 20th-century suburb, not a
 * 17th-century harbor town, and it was also the reason houses kept turning up sitting on top of
 * paths (see GAME_DESIGN.md items 39-45). Three same-day corrections followed direct feedback:
 * (1) a spiral-packed "halo" per building was still rings-deep and still spread across the whole
 * town, replaced with literal road-lining; (2) the first road-lining pass only covered the
 * harbor-to-Square corridor and left daylight between houses, extended to every real street at
 * tighter spacing; (3) still "massively spread out" and not tight enough per a reference sketch of
 * two dense horizontal rows — dropped housing from the far spokes entirely (Fishmonger, Chapel,
 * Locked Ward, Bounty Board, Customs House, Baker's Oven, Ropewalk) to concentrate density back at
 * the port, tightened spacing again (20 units, under the 26-unit sprite width — houses now visibly
 * overlap/interlock), and added a new dedicated street right behind the wharf buildings (the
 * closest open stretch to the water, since the actual dockfront is already lined with working
 * buildings) for a proper dense horizontal row. The rural 'path' trails (West Point Shack, the
 * Ruins, La Ringot Fields, etc.) stay deliberately house-free — a handful of standalone homesteads
 * near those cover the "sporadic elsewhere" half of the original ask. Spacing is tight enough that
 * a player can't squeeze between two neighboring row houses — the row itself is what channels foot
 * traffic onto the road.
 *
 * 2026-08-07 correction: even after the port cleanup above, the two spokes anchored on Basse-Terre
 * Square (-> Salty Parrot, -> Harbor Trading Post) still put a player walking that road visibly in
 * the middle of the island — because the square itself sat at y=+80, close to Tortuga's vertical
 * center (the island spans y -478 to +448), not anywhere near the coast. Rather than moving
 * housing off its street (rejected — the road-lining look is the point), the square was moved to
 * (-40, -160), just south of the harbor buildings (see streets.ts and landmarks.ts), and these two
 * spokes' 20 houses were regenerated along the new, shorter lines with the same two-row/~20-unit-
 * spacing pattern as before. Every other street/house on Tortuga is unchanged. Verified: all 20 new
 * points fall inside TORTUGA_SHAPE, clear of every building (closest 48 units, in line with the
 * closest pre-existing clearance), clear of every other house on the island (closest 20 units,
 * matching the established spacing floor), and clear of each other across the two spokes. */
export interface House {
  islandId: string;
  offset: { x: number; y: number }; // relative to island center, in world units
}

export const HOUSES: House[] = [
  // Basse-Terre Square -> the Salty Parrot (8 houses) — regenerated 2026-08-07 along the square's
  // new, more-northern position
  { islandId: 'tortuga_cove', offset: { x: -80, y: -161 } },
  { islandId: 'tortuga_cove', offset: { x: -99, y: -145 } },
  { islandId: 'tortuga_cove', offset: { x: -118, y: -128 } },
  { islandId: 'tortuga_cove', offset: { x: -137, y: -112 } },
  { islandId: 'tortuga_cove', offset: { x: -57, y: -110 } },
  { islandId: 'tortuga_cove', offset: { x: -76, y: -94 } },
  { islandId: 'tortuga_cove', offset: { x: -95, y: -78 } },
  { islandId: 'tortuga_cove', offset: { x: -113, y: -61 } },
  // Basse-Terre Square -> Harbor Trading Post (12 houses) — regenerated 2026-08-07, same reason
  { islandId: 'tortuga_cove', offset: { x: -35, y: -126 } },
  { islandId: 'tortuga_cove', offset: { x: -18, y: -115 } },
  { islandId: 'tortuga_cove', offset: { x: -1, y: -105 } },
  { islandId: 'tortuga_cove', offset: { x: 17, y: -95 } },
  { islandId: 'tortuga_cove', offset: { x: 34, y: -85 } },
  { islandId: 'tortuga_cove', offset: { x: 51, y: -74 } },
  { islandId: 'tortuga_cove', offset: { x: 68, y: -64 } },
  { islandId: 'tortuga_cove', offset: { x: 85, y: -54 } },
  { islandId: 'tortuga_cove', offset: { x: 4, y: -165 } },
  { islandId: 'tortuga_cove', offset: { x: 21, y: -155 } },
  { islandId: 'tortuga_cove', offset: { x: 38, y: -145 } },
  { islandId: 'tortuga_cove', offset: { x: 55, y: -135 } },
  // The harbor road, Trading Post -> Fishing Dock (13 houses)
  { islandId: 'tortuga_cove', offset: { x: 176, y: -108 } },
  { islandId: 'tortuga_cove', offset: { x: 164, y: -124 } },
  { islandId: 'tortuga_cove', offset: { x: 138, y: -155 } },
  { islandId: 'tortuga_cove', offset: { x: 113, y: -186 } },
  { islandId: 'tortuga_cove', offset: { x: 88, y: -217 } },
  { islandId: 'tortuga_cove', offset: { x: 62, y: -248 } },
  { islandId: 'tortuga_cove', offset: { x: 133, y: -73 } },
  { islandId: 'tortuga_cove', offset: { x: 120, y: -89 } },
  { islandId: 'tortuga_cove', offset: { x: 95, y: -119 } },
  { islandId: 'tortuga_cove', offset: { x: 82, y: -135 } },
  { islandId: 'tortuga_cove', offset: { x: 57, y: -166 } },
  { islandId: 'tortuga_cove', offset: { x: 32, y: -197 } },
  { islandId: 'tortuga_cove', offset: { x: 6, y: -228 } },
  // -> Harbor Pier (5 houses)
  { islandId: 'tortuga_cove', offset: { x: 92, y: -258 } },
  { islandId: 'tortuga_cove', offset: { x: 112, y: -260 } },
  { islandId: 'tortuga_cove', offset: { x: 132, y: -261 } },
  { islandId: 'tortuga_cove', offset: { x: 28, y: -310 } },
  { islandId: 'tortuga_cove', offset: { x: 88, y: -314 } },
  // -> the Warehouse (4 houses)
  { islandId: 'tortuga_cove', offset: { x: -57, y: -279 } },
  { islandId: 'tortuga_cove', offset: { x: -12, y: -241 } },
  { islandId: 'tortuga_cove', offset: { x: -46, y: -220 } },
  { islandId: 'tortuga_cove', offset: { x: -64, y: -210 } },
  // Warehouse -> the Chandlery (4 houses)
  { islandId: 'tortuga_cove', offset: { x: -132, y: -257 } },
  { islandId: 'tortuga_cove', offset: { x: -125, y: -276 } },
  { islandId: 'tortuga_cove', offset: { x: -118, y: -295 } },
  { islandId: 'tortuga_cove', offset: { x: -104, y: -332 } },
  // Chandlery -> Harbourmaster's Office (4 houses)
  { islandId: 'tortuga_cove', offset: { x: 22, y: -347 } },
  { islandId: 'tortuga_cove', offset: { x: 18, y: -403 } },
  { islandId: 'tortuga_cove', offset: { x: 38, y: -404 } },
  { islandId: 'tortuga_cove', offset: { x: 58, y: -405 } },
  // Salty Parrot -> the Anchor & Forge (4 houses)
  { islandId: 'tortuga_cove', offset: { x: -217, y: -48 } },
  { islandId: 'tortuga_cove', offset: { x: -226, y: -9 } },
  { islandId: 'tortuga_cove', offset: { x: -172, y: 4 } },
  { islandId: 'tortuga_cove', offset: { x: -177, y: 24 } },
  // The Quay Row — a new dedicated street right behind the wharf buildings, the closest open
  // horizontal stretch to the water since the actual dockfront is already built up (7 houses).
  { islandId: 'tortuga_cove', offset: { x: 0, y: -417 } },
  { islandId: 'tortuga_cove', offset: { x: 80, y: -417 } },
  { islandId: 'tortuga_cove', offset: { x: 100, y: -417 } },
  { islandId: 'tortuga_cove', offset: { x: 120, y: -417 } },
  { islandId: 'tortuga_cove', offset: { x: 200, y: -417 } },
  { islandId: 'tortuga_cove', offset: { x: 220, y: -417 } },
  { islandId: 'tortuga_cove', offset: { x: 240, y: -417 } },
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
