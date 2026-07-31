export type FurnitureType =
  | 'counter'
  | 'table'
  | 'chair'
  | 'stool'
  | 'barrel'
  | 'rug'
  | 'shelf'
  | 'door'
  | 'prop'; // generic decorative emoji — dartboard, fireplace, window, plant, etc.

export interface InteriorFurniture {
  type: FurnitureType;
  x: number;
  y: number;
  width?: number; // only meaningful for 'counter'
  height?: number;
  emoji?: string; // required for 'prop', ignored otherwise
  fontSize?: number; // optional size override for 'prop'/'door' emoji
}

/** One walk-up-to character in the room: 'main' is the building's own NPC, an id found in
 * AMBIENT_NPCS is a quest-less local, and anything else is a hosted patron side-quest id
 * (looked up from SIDE_QUESTS by id at render time). */
export interface InteriorNpcSpot {
  id: string;
  x: number;
  y: number;
}

/** Ordinary members of the public — just flavor, no quest attached. Talking to one shows a
 * one-off line and nothing else, so not every face in a room needs to be a quest-giver. */
export interface AmbientNpc {
  id: string;
  name: string;
  emoji: string;
  flavor: string;
}

export const AMBIENT_NPCS: Record<string, AmbientNpc> = {
  tortuga_amb_sailor: {
    id: 'tortuga_amb_sailor',
    name: 'A Weathered Sailor',
    emoji: '🧔',
    flavor: "Fair winds don't last. Neither does the rum, unfortunately.",
  },
  tortuga_amb_cook: {
    id: 'tortuga_amb_cook',
    name: "The Ship's Cook",
    emoji: '👨‍🍳',
    flavor: "Best stew this side of the Caribbean. Don't ask what's in it.",
  },
  tortuga_amb_lass: {
    id: 'tortuga_amb_lass',
    name: 'A Local Lass',
    emoji: '👩',
    flavor: "You look like you've got stories. Buy me a drink and let's hear one.",
  },
};

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
    width: 360,
    height: 340,
    entryPosition: { x: 180, y: 310 },
    furniture: [
      // Floor + fixed furniture
      { type: 'rug', x: 170, y: 180 },
      { type: 'counter', x: 170, y: 36, width: 260, height: 26 },
      { type: 'stool', x: 75, y: 74 },
      { type: 'stool', x: 140, y: 74 },
      { type: 'stool', x: 200, y: 74 },
      { type: 'stool', x: 265, y: 74 },
      { type: 'table', x: 80, y: 150 },
      { type: 'chair', x: 80, y: 112 },
      { type: 'chair', x: 80, y: 188 },
      { type: 'chair', x: 42, y: 150 },
      { type: 'chair', x: 118, y: 150 },
      { type: 'table', x: 170, y: 215 },
      { type: 'chair', x: 170, y: 177 },
      { type: 'chair', x: 170, y: 253 },
      { type: 'chair', x: 132, y: 215 },
      { type: 'chair', x: 208, y: 215 },
      { type: 'table', x: 260, y: 150 },
      { type: 'chair', x: 260, y: 112 },
      { type: 'chair', x: 260, y: 188 },
      { type: 'chair', x: 222, y: 150 },
      { type: 'chair', x: 298, y: 150 },
      { type: 'barrel', x: 300, y: 255 },
      { type: 'barrel', x: 18, y: 150 },
      { type: 'barrel', x: 342, y: 150 },
      { type: 'stool', x: 320, y: 100 },
      // Walls & atmosphere
      { type: 'door', x: 180, y: 328, fontSize: 26 },
      { type: 'prop', x: 170, y: 12, emoji: '🦜', fontSize: 24 },
      { type: 'prop', x: 55, y: 12, emoji: '🏴‍☠️', fontSize: 22 },
      { type: 'prop', x: 285, y: 12, emoji: '🗺️', fontSize: 22 },
      { type: 'prop', x: 16, y: 95, emoji: '🪟', fontSize: 22 },
      { type: 'prop', x: 344, y: 235, emoji: '🪟', fontSize: 22 },
      { type: 'prop', x: 22, y: 272, emoji: '🔥', fontSize: 24 },
      { type: 'prop', x: 342, y: 300, emoji: '🪴', fontSize: 22 },
      { type: 'prop', x: 300, y: 280, emoji: '🐈', fontSize: 20 },
      { type: 'prop', x: 335, y: 88, emoji: '🎯', fontSize: 26 },
      { type: 'prop', x: 110, y: 34, emoji: '🕯️', fontSize: 16 },
      { type: 'prop', x: 230, y: 34, emoji: '🕯️', fontSize: 16 },
    ],
    npcSpots: [
      { id: 'main', x: 170, y: 36 },
      { id: 'patron_tortuga_drunk', x: 80, y: 150 },
      { id: 'patron_tortuga_local', x: 230, y: 95 },
      { id: 'patron_tortuga_rival', x: 320, y: 100 },
      { id: 'patron_tortuga_mystic', x: 40, y: 230 },
      { id: 'tortuga_amb_sailor', x: 55, y: 110 },
      { id: 'tortuga_amb_cook', x: 330, y: 190 },
      { id: 'tortuga_amb_lass', x: 250, y: 280 },
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
