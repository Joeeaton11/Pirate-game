export type FurnitureType = 'counter' | 'table' | 'stool' | 'barrel' | 'rug' | 'shelf';

export interface InteriorFurniture {
  type: FurnitureType;
  x: number;
  y: number;
  width?: number; // only meaningful for 'counter'
  height?: number;
}

/** One walk-up-to character in the room: 'main' is the building's own NPC, anything else is a
 * hosted patron side-quest id (looked up from SIDE_QUESTS by id at render time). */
export interface InteriorNpcSpot {
  id: string;
  x: number;
  y: number;
}

export interface BuildingInterior {
  buildingId: string;
  width: number;
  height: number;
  entryPosition: { x: number; y: number };
  furniture: InteriorFurniture[];
  npcSpots: InteriorNpcSpot[];
}

/** Hand-authored floor plans. Buildings without an entry here get a generic room via
 * fallbackInterior() instead — nothing is left without a walkable interior. */
export const BUILDING_INTERIORS: Record<string, BuildingInterior> = {
  tortuga_tavern: {
    buildingId: 'tortuga_tavern',
    width: 300,
    height: 220,
    entryPosition: { x: 150, y: 200 },
    furniture: [
      { type: 'rug', x: 150, y: 150 },
      { type: 'counter', x: 150, y: 36, width: 220, height: 26 },
      { type: 'stool', x: 90, y: 74 },
      { type: 'stool', x: 150, y: 74 },
      { type: 'stool', x: 210, y: 74 },
      { type: 'table', x: 85, y: 145 },
      { type: 'table', x: 215, y: 145 },
      { type: 'barrel', x: 270, y: 190 },
    ],
    npcSpots: [
      { id: 'main', x: 150, y: 36 },
      { id: 'patron_tortuga_drunk', x: 85, y: 145 },
      { id: 'patron_tortuga_local', x: 215, y: 100 },
    ],
  },
};

export function interiorForBuilding(
  buildingId: string,
  patronQuestIds: string[]
): BuildingInterior {
  const authored = BUILDING_INTERIORS[buildingId];
  if (authored) return authored;
  return fallbackInterior(buildingId, patronQuestIds);
}

/** A plain, generic room for any building without a hand-authored floor plan yet: the main NPC
 * up top, patrons arranged in a row below, a rug and a shelf for a little flavor. */
function fallbackInterior(buildingId: string, patronQuestIds: string[]): BuildingInterior {
  const width = 260;
  const height = 200;
  const npcSpots: InteriorNpcSpot[] = [{ id: 'main', x: width / 2, y: 40 }];
  const spacing = width / (patronQuestIds.length + 1);
  patronQuestIds.forEach((id, i) => {
    npcSpots.push({ id, x: spacing * (i + 1), y: 130 });
  });
  return {
    buildingId,
    width,
    height,
    entryPosition: { x: width / 2, y: height - 20 },
    furniture: [
      { type: 'rug', x: width / 2, y: 100 },
      { type: 'shelf', x: 30, y: 30 },
    ],
    npcSpots,
  };
}
