/** Purely visual row-house scenery: fills out the residential district around the town core
 * so it reads as a dense, real settlement instead of a handful of named buildings on grass.
 * No interior, no interaction, no per-tick proximity checks — just a footprint on the map,
 * like background buildings in GTA. Positions were procedurally generated and filtered to land
 * + clearance from every other marker before being pasted in here.
 *
 * Tortuga's residential layout was rebuilt 2026-08-05, replacing a 5x5 avenue grid that spread
 * housing across most of the island's southern half — realistic for a 20th-century suburb, not a
 * 17th-century harbor town, and it was also the reason houses kept turning up sitting on top of
 * paths (see GAME_DESIGN.md items 39-45). Direct feedback: "They're clustered together around the
 * port all jammed in next to each other and then a few sporadic houses scattered around." Replaced
 * with two patterns instead: a nucleated cluster (a tight halo of houses packed around each real
 * dock/downtown building or landmark, via the same spiral-search placement already used for
 * gardens/Old Town) for the port core, and a handful of standalone houses near the outlying named
 * locations (Fishmonger, Ropewalk, West Point Shack, the Ruins, etc.) for everywhere else. */
export interface House {
  islandId: string;
  offset: { x: number; y: number }; // relative to island center, in world units
}

export const HOUSES: House[] = [
  // Lighthouse — 3 houses clustered tight around it
  { islandId: 'tortuga_cove', offset: { x: 83, y: -442 } },
  { islandId: 'tortuga_cove', offset: { x: 51, y: -431 } },
  { islandId: 'tortuga_cove', offset: { x: 84, y: -416 } },
  // Harbor Pier — 4 houses clustered tight around it
  { islandId: 'tortuga_cove', offset: { x: 168, y: -290 } },
  { islandId: 'tortuga_cove', offset: { x: 131, y: -263 } },
  { islandId: 'tortuga_cove', offset: { x: 98, y: -314 } },
  { islandId: 'tortuga_cove', offset: { x: 146, y: -238 } },
  // The Chandlery — 5 houses clustered tight around it
  { islandId: 'tortuga_cove', offset: { x: -92, y: -370 } },
  { islandId: 'tortuga_cove', offset: { x: -89, y: -403 } },
  { islandId: 'tortuga_cove', offset: { x: -102, y: -346 } },
  { islandId: 'tortuga_cove', offset: { x: -119, y: -382 } },
  { islandId: 'tortuga_cove', offset: { x: -128, y: -345 } },
  // Harbourmaster's Office — 4 houses clustered tight around it
  { islandId: 'tortuga_cove', offset: { x: 110, y: -410 } },
  { islandId: 'tortuga_cove', offset: { x: 88, y: -342 } },
  { islandId: 'tortuga_cove', offset: { x: 58, y: -404 } },
  { islandId: 'tortuga_cove', offset: { x: 135, y: -424 } },
  // Dockworkers' Bunkhouse — 4 houses clustered tight around it
  { islandId: 'tortuga_cove', offset: { x: 212, y: -360 } },
  { islandId: 'tortuga_cove', offset: { x: 190, y: -390 } },
  { islandId: 'tortuga_cove', offset: { x: 168, y: -322 } },
  { islandId: 'tortuga_cove', offset: { x: 222, y: -336 } },
  // The Cooper's Yard — 4 houses clustered tight around it
  { islandId: 'tortuga_cove', offset: { x: -45, y: -287 } },
  { islandId: 'tortuga_cove', offset: { x: 17, y: -317 } },
  { islandId: 'tortuga_cove', offset: { x: 28, y: -342 } },
  { islandId: 'tortuga_cove', offset: { x: -10, y: -241 } },
  // The Sailmaker's Loft — 3 houses clustered tight around it
  { islandId: 'tortuga_cove', offset: { x: 73, y: -259 } },
  { islandId: 'tortuga_cove', offset: { x: 18, y: -403 } },
  { islandId: 'tortuga_cove', offset: { x: 102, y: -248 } },
  // Smugglers' Warehouse — 5 houses clustered tight around it
  { islandId: 'tortuga_cove', offset: { x: -68, y: -210 } },
  { islandId: 'tortuga_cove', offset: { x: -108, y: -155 } },
  { islandId: 'tortuga_cove', offset: { x: -169, y: -245 } },
  { islandId: 'tortuga_cove', offset: { x: -139, y: -145 } },
  { islandId: 'tortuga_cove', offset: { x: -187, y: -222 } },
  // Basse-Terre Square — 6 houses clustered tight around it
  { islandId: 'tortuga_cove', offset: { x: -40, y: 32 } },
  { islandId: 'tortuga_cove', offset: { x: -58, y: 129 } },
  { islandId: 'tortuga_cove', offset: { x: -16, y: 21 } },
  { islandId: 'tortuga_cove', offset: { x: -107, y: 92 } },
  { islandId: 'tortuga_cove', offset: { x: -53, y: 9 } },
  { islandId: 'tortuga_cove', offset: { x: -107, y: 44 } },
  // The Salty Parrot — 5 houses clustered tight around it
  { islandId: 'tortuga_cove', offset: { x: -154, y: -99 } },
  { islandId: 'tortuga_cove', offset: { x: -136, y: -80 } },
  { islandId: 'tortuga_cove', offset: { x: -219, y: -46 } },
  { islandId: 'tortuga_cove', offset: { x: -125, y: -104 } },
  { islandId: 'tortuga_cove', offset: { x: -121, y: -56 } },
  // Harbor Trading Post — 5 houses clustered tight around it
  { islandId: 'tortuga_cove', offset: { x: 190, y: -90 } },
  { islandId: 'tortuga_cove', offset: { x: 192, y: -22 } },
  { islandId: 'tortuga_cove', offset: { x: 217, y: -84 } },
  { islandId: 'tortuga_cove', offset: { x: 162, y: -11 } },
  { islandId: 'tortuga_cove', offset: { x: 130, y: -72 } },
  // The Anchor & Forge — 5 houses clustered tight around it
  { islandId: 'tortuga_cove', offset: { x: -276, y: 75 } },
  { islandId: 'tortuga_cove', offset: { x: -298, y: 105 } },
  { islandId: 'tortuga_cove', offset: { x: -334, y: 94 } },
  { islandId: 'tortuga_cove', offset: { x: -334, y: 56 } },
  { islandId: 'tortuga_cove', offset: { x: -266, y: 99 } },
  // The Customs House — 5 houses clustered tight around it
  { islandId: 'tortuga_cove', offset: { x: 352, y: 20 } },
  { islandId: 'tortuga_cove', offset: { x: 330, y: 50 } },
  { islandId: 'tortuga_cove', offset: { x: 294, y: 39 } },
  { islandId: 'tortuga_cove', offset: { x: 330, y: -10 } },
  { islandId: 'tortuga_cove', offset: { x: 362, y: 44 } },
  // The Baker's Oven — 5 houses clustered tight around it
  { islandId: 'tortuga_cove', offset: { x: 112, y: 164 } },
  { islandId: 'tortuga_cove', offset: { x: 70, y: 76 } },
  { islandId: 'tortuga_cove', offset: { x: 100, y: 79 } },
  { islandId: 'tortuga_cove', offset: { x: 138, y: 165 } },
  { islandId: 'tortuga_cove', offset: { x: 15, y: 186 } },
  // Fort de Rocher — 3 houses clustered tight around it
  { islandId: 'tortuga_cove', offset: { x: 232, y: -200 } },
  { islandId: 'tortuga_cove', offset: { x: 210, y: -170 } },
  { islandId: 'tortuga_cove', offset: { x: 174, y: -181 } },
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
  // Old Town infill near the dock — a single continuous row of adjacent houses (~29 units apart,
  // touching-neighbor spacing), not a block of parallel rows. Walked programmatically house by
  // house from the dock south toward the residential grid, bending around whatever it ran into
  // (dock buildings, the existing waterfront houses) instead of doubling back into a second row.
  // Gardens are off for this district (see MapScreen.tsx's SHOW_GARDENS) so there's no yard buffer
  // padding the gaps — houses sit shoulder to shoulder like a real terrace.
  { islandId: 'tortuga_cove', offset: { x: -127, y: -302 } },
  { islandId: 'tortuga_cove', offset: { x: -126, y: -273 } },
  { islandId: 'tortuga_cove', offset: { x: -137, y: -246 } },
  { islandId: 'tortuga_cove', offset: { x: -154, y: -222 } },
  { islandId: 'tortuga_cove', offset: { x: -171, y: -198 } },
  { islandId: 'tortuga_cove', offset: { x: -188, y: -174 } },
  { islandId: 'tortuga_cove', offset: { x: -205, y: -150 } },
  { islandId: 'tortuga_cove', offset: { x: -222, y: -126 } },
  { islandId: 'tortuga_cove', offset: { x: -233, y: -99 } },
  { islandId: 'tortuga_cove', offset: { x: -239, y: -71 } },
  { islandId: 'tortuga_cove', offset: { x: -210, y: -84 } },
  { islandId: 'tortuga_cove', offset: { x: -195, y: -109 } },
  { islandId: 'tortuga_cove', offset: { x: -180, y: -134 } },
  { islandId: 'tortuga_cove', offset: { x: -165, y: -159 } },
  { islandId: 'tortuga_cove', offset: { x: -146, y: -181 } },
  { islandId: 'tortuga_cove', offset: { x: -117, y: -180 } },
  { islandId: 'tortuga_cove', offset: { x: -88, y: -179 } },
  { islandId: 'tortuga_cove', offset: { x: -59, y: -178 } },
  { islandId: 'tortuga_cove', offset: { x: -30, y: -177 } },
  { islandId: 'tortuga_cove', offset: { x: -1, y: -176 } },
  { islandId: 'tortuga_cove', offset: { x: 28, y: -175 } },
  { islandId: 'tortuga_cove', offset: { x: 56, y: -168 } },
  { islandId: 'tortuga_cove', offset: { x: 75, y: -146 } },
  { islandId: 'tortuga_cove', offset: { x: 83, y: -118 } },
  { islandId: 'tortuga_cove', offset: { x: 53, y: -128 } },
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
