/** Purely visual row-house scenery: fills out the residential district around the town core
 * so it reads as a dense, real settlement instead of a handful of named buildings on grass.
 * No interior, no interaction, no per-tick proximity checks — just a footprint on the map,
 * like background buildings in GTA. Positions were procedurally generated along a street
 * grid and filtered to land + clearance from every other marker before being pasted in here. */
export interface House {
  islandId: string;
  offset: { x: number; y: number }; // relative to island center, in world units
}

export const HOUSES: House[] = [
  { islandId: 'tortuga_cove', offset: { x: -130, y: -26 } },
  { islandId: 'tortuga_cove', offset: { x: -130, y: 6 } },
  { islandId: 'tortuga_cove', offset: { x: -130, y: -48 } },
  { islandId: 'tortuga_cove', offset: { x: -110, y: 6 } },
  { islandId: 'tortuga_cove', offset: { x: -90, y: 6 } },
  { islandId: 'tortuga_cove', offset: { x: -70, y: 6 } },
  { islandId: 'tortuga_cove', offset: { x: -70, y: 28 } },
  { islandId: 'tortuga_cove', offset: { x: -50, y: -26 } },
  { islandId: 'tortuga_cove', offset: { x: -50, y: 6 } },
  { islandId: 'tortuga_cove', offset: { x: -50, y: -48 } },
  { islandId: 'tortuga_cove', offset: { x: -50, y: 28 } },
  { islandId: 'tortuga_cove', offset: { x: -30, y: -26 } },
  { islandId: 'tortuga_cove', offset: { x: -30, y: 6 } },
  { islandId: 'tortuga_cove', offset: { x: -30, y: -48 } },
  { islandId: 'tortuga_cove', offset: { x: -10, y: -26 } },
  { islandId: 'tortuga_cove', offset: { x: -10, y: 6 } },
  { islandId: 'tortuga_cove', offset: { x: -10, y: -48 } },
  { islandId: 'tortuga_cove', offset: { x: 10, y: -26 } },
  { islandId: 'tortuga_cove', offset: { x: 10, y: 6 } },
  { islandId: 'tortuga_cove', offset: { x: 10, y: -48 } },
  { islandId: 'tortuga_cove', offset: { x: 10, y: 28 } },
  { islandId: 'tortuga_cove', offset: { x: 30, y: -26 } },
  { islandId: 'tortuga_cove', offset: { x: 30, y: 6 } },
  { islandId: 'tortuga_cove', offset: { x: 30, y: -48 } },
  { islandId: 'tortuga_cove', offset: { x: 30, y: 28 } },
  { islandId: 'tortuga_cove', offset: { x: 50, y: -26 } },
  { islandId: 'tortuga_cove', offset: { x: 50, y: 6 } },
  { islandId: 'tortuga_cove', offset: { x: 50, y: -48 } },
  { islandId: 'tortuga_cove', offset: { x: 50, y: 28 } },
  { islandId: 'tortuga_cove', offset: { x: 70, y: 6 } },
  { islandId: 'tortuga_cove', offset: { x: 70, y: 28 } },
  { islandId: 'tortuga_cove', offset: { x: 90, y: 6 } },
  { islandId: 'tortuga_cove', offset: { x: 90, y: 28 } },
  { islandId: 'tortuga_cove', offset: { x: 110, y: 6 } },
  { islandId: 'tortuga_cove', offset: { x: 110, y: 28 } },
  { islandId: 'tortuga_cove', offset: { x: 130, y: -26 } },
  { islandId: 'tortuga_cove', offset: { x: 130, y: 6 } },
  { islandId: 'tortuga_cove', offset: { x: 130, y: -48 } },
  { islandId: 'tortuga_cove', offset: { x: 130, y: 28 } },
  { islandId: 'tortuga_cove', offset: { x: 150, y: -26 } },
  { islandId: 'tortuga_cove', offset: { x: 150, y: -48 } },
  { islandId: 'tortuga_cove', offset: { x: -140, y: 46 } },
  { islandId: 'tortuga_cove', offset: { x: -140, y: 68 } },
  { islandId: 'tortuga_cove', offset: { x: -80, y: 46 } },
  { islandId: 'tortuga_cove', offset: { x: -80, y: 68 } },
  { islandId: 'tortuga_cove', offset: { x: -60, y: 46 } },
  { islandId: 'tortuga_cove', offset: { x: -60, y: 68 } },
  { islandId: 'tortuga_cove', offset: { x: -40, y: 68 } },
  { islandId: 'tortuga_cove', offset: { x: 0, y: 68 } },
  { islandId: 'tortuga_cove', offset: { x: 60, y: 46 } },
  { islandId: 'tortuga_cove', offset: { x: 140, y: 46 } },
  { islandId: 'tortuga_cove', offset: { x: 140, y: 68 } },
  { islandId: 'tortuga_cove', offset: { x: -130, y: 86 } },
  { islandId: 'tortuga_cove', offset: { x: -110, y: 86 } },
  { islandId: 'tortuga_cove', offset: { x: -90, y: 86 } },
  { islandId: 'tortuga_cove', offset: { x: -90, y: 108 } },
  { islandId: 'tortuga_cove', offset: { x: -70, y: 86 } },
  { islandId: 'tortuga_cove', offset: { x: -70, y: 108 } },
  { islandId: 'tortuga_cove', offset: { x: -50, y: 86 } },
  { islandId: 'tortuga_cove', offset: { x: -50, y: 108 } },
  { islandId: 'tortuga_cove', offset: { x: -30, y: 86 } },
  { islandId: 'tortuga_cove', offset: { x: -30, y: 108 } },
  { islandId: 'tortuga_cove', offset: { x: -10, y: 86 } },
  { islandId: 'tortuga_cove', offset: { x: 30, y: 108 } },
  { islandId: 'tortuga_cove', offset: { x: 70, y: 86 } },
  { islandId: 'tortuga_cove', offset: { x: 90, y: 108 } },
  { islandId: 'tortuga_cove', offset: { x: 110, y: 108 } },
  { islandId: 'tortuga_cove', offset: { x: -100, y: 126 } },
  { islandId: 'tortuga_cove', offset: { x: -100, y: 148 } },
  { islandId: 'tortuga_cove', offset: { x: -80, y: 126 } },
  { islandId: 'tortuga_cove', offset: { x: -60, y: 126 } },
  { islandId: 'tortuga_cove', offset: { x: -40, y: 126 } },
  { islandId: 'tortuga_cove', offset: { x: -40, y: 148 } },
  { islandId: 'tortuga_cove', offset: { x: 100, y: 126 } },
  { islandId: 'tortuga_cove', offset: { x: -15, y: 161 } },
  { islandId: 'tortuga_cove', offset: { x: 5, y: 161 } },
  { islandId: 'tortuga_cove', offset: { x: 25, y: 161 } },
  { islandId: 'tortuga_cove', offset: { x: 45, y: 161 } },
  { islandId: 'tortuga_cove', offset: { x: -148, y: -10 } },
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
