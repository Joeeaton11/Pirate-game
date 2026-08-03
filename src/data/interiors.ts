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
  tortuga_fort: {
    buildingId: 'tortuga_fort',
    width: 260,
    height: 220,
    entryPosition: { x: 130, y: 195 },
    furniture: [
      { type: 'rug', x: 130, y: 110 },
      { type: 'barrel', x: 40, y: 60 },
      { type: 'barrel', x: 40, y: 160 },
      { type: 'shelf', x: 220, y: 100 },
      { type: 'door', x: 130, y: 210, fontSize: 26 },
      { type: 'prop', x: 90, y: 20, emoji: '⚔️', fontSize: 24 },
      { type: 'prop', x: 170, y: 20, emoji: '🪖', fontSize: 22 },
      { type: 'prop', x: 20, y: 110, emoji: '🕯️', fontSize: 16 },
      { type: 'prop', x: 240, y: 190, emoji: '🕯️', fontSize: 16 },
    ],
    npcSpots: [
      { id: 'main', x: 130, y: 40 },
      { id: 'patron_tortuga_fort', x: 70, y: 140 },
    ],
  },
  tortuga_chapel: {
    buildingId: 'tortuga_chapel',
    width: 240,
    height: 220,
    entryPosition: { x: 120, y: 195 },
    furniture: [
      { type: 'rug', x: 120, y: 130 },
      { type: 'chair', x: 70, y: 110 },
      { type: 'chair', x: 170, y: 110 },
      { type: 'chair', x: 70, y: 150 },
      { type: 'chair', x: 170, y: 150 },
      { type: 'door', x: 120, y: 210, fontSize: 26 },
      { type: 'prop', x: 120, y: 18, emoji: '✝️', fontSize: 24 },
      { type: 'prop', x: 60, y: 30, emoji: '🕯️', fontSize: 16 },
      { type: 'prop', x: 180, y: 30, emoji: '🕯️', fontSize: 16 },
    ],
    npcSpots: [
      { id: 'main', x: 120, y: 40 },
      { id: 'patron_tortuga_chapel', x: 70, y: 160 },
    ],
  },
  tortuga_warehouse: {
    buildingId: 'tortuga_warehouse',
    width: 260,
    height: 220,
    entryPosition: { x: 130, y: 195 },
    furniture: [
      { type: 'rug', x: 130, y: 110 },
      { type: 'barrel', x: 30, y: 40 },
      { type: 'barrel', x: 30, y: 100 },
      { type: 'barrel', x: 30, y: 160 },
      { type: 'shelf', x: 230, y: 50 },
      { type: 'shelf', x: 230, y: 170 },
      { type: 'door', x: 130, y: 210, fontSize: 26 },
      { type: 'prop', x: 130, y: 20, emoji: '📦', fontSize: 22 },
      { type: 'prop', x: 190, y: 100, emoji: '🪤', fontSize: 18 },
    ],
    npcSpots: [
      { id: 'main', x: 130, y: 40 },
      { id: 'patron_tortuga_warehouse', x: 190, y: 150 },
    ],
  },
  tortuga_west_point: {
    buildingId: 'tortuga_west_point',
    width: 200,
    height: 180,
    entryPosition: { x: 100, y: 158 },
    furniture: [
      { type: 'rug', x: 100, y: 100 },
      { type: 'table', x: 100, y: 100 },
      { type: 'chair', x: 100, y: 130 },
      { type: 'chair', x: 100, y: 70 },
      { type: 'shelf', x: 25, y: 30 },
      { type: 'door', x: 100, y: 172, fontSize: 24 },
      { type: 'prop', x: 175, y: 30, emoji: '🪟', fontSize: 20 },
    ],
    npcSpots: [
      { id: 'main', x: 100, y: 36 },
      { id: 'patron_tortuga_west_point', x: 50, y: 120 },
    ],
  },
  tortuga_customs: {
    buildingId: 'tortuga_customs',
    width: 240,
    height: 200,
    entryPosition: { x: 120, y: 178 },
    furniture: [
      { type: 'rug', x: 120, y: 110 },
      { type: 'counter', x: 120, y: 40, width: 140, height: 24 },
      { type: 'shelf', x: 220, y: 90 },
      { type: 'shelf', x: 20, y: 90 },
      { type: 'door', x: 120, y: 192, fontSize: 24 },
      { type: 'prop', x: 120, y: 16, emoji: '📜', fontSize: 22 },
      { type: 'prop', x: 30, y: 150, emoji: '🕯️', fontSize: 16 },
    ],
    npcSpots: [
      { id: 'main', x: 120, y: 40 },
      { id: 'patron_tortuga_customs', x: 60, y: 140 },
    ],
  },
  tortuga_smithy: {
    buildingId: 'tortuga_smithy',
    width: 240,
    height: 200,
    entryPosition: { x: 120, y: 178 },
    furniture: [
      { type: 'rug', x: 120, y: 110 },
      { type: 'barrel', x: 30, y: 50 },
      { type: 'barrel', x: 30, y: 130 },
      { type: 'shelf', x: 210, y: 140 },
      { type: 'door', x: 120, y: 192, fontSize: 24 },
      { type: 'prop', x: 120, y: 16, emoji: '🔥', fontSize: 24 },
      { type: 'prop', x: 200, y: 40, emoji: '⚒️', fontSize: 22 },
    ],
    npcSpots: [
      { id: 'main', x: 120, y: 40 },
      { id: 'patron_tortuga_smithy', x: 180, y: 140 },
    ],
  },
  tortuga_shop: {
    buildingId: 'tortuga_shop',
    width: 250,
    height: 200,
    entryPosition: { x: 125, y: 178 },
    furniture: [
      { type: 'rug', x: 125, y: 110 },
      { type: 'counter', x: 125, y: 40, width: 150, height: 26 },
      { type: 'shelf', x: 30, y: 90 },
      { type: 'shelf', x: 220, y: 90 },
      { type: 'barrel', x: 30, y: 150 },
      { type: 'barrel', x: 220, y: 150 },
      { type: 'door', x: 125, y: 192, fontSize: 24 },
      { type: 'prop', x: 125, y: 16, emoji: '🗺️', fontSize: 20 },
      { type: 'prop', x: 70, y: 40, emoji: '⚖️', fontSize: 18 },
    ],
    npcSpots: [{ id: 'main', x: 125, y: 40 }],
  },
  cow_island_camp: {
    buildingId: 'cow_island_camp',
    width: 220,
    height: 180,
    entryPosition: { x: 110, y: 158 },
    furniture: [
      { type: 'rug', x: 110, y: 100 },
      { type: 'barrel', x: 40, y: 130 },
      { type: 'barrel', x: 180, y: 130 },
      { type: 'door', x: 110, y: 172, fontSize: 24 },
      { type: 'prop', x: 110, y: 40, emoji: '⛺', fontSize: 30 },
      { type: 'prop', x: 60, y: 90, emoji: '🔥', fontSize: 20 },
      { type: 'prop', x: 170, y: 70, emoji: '🦀', fontSize: 16 },
      { type: 'prop', x: 40, y: 60, emoji: '🎣', fontSize: 18 },
    ],
    npcSpots: [{ id: 'main', x: 110, y: 100 }],
  },
  new_providence_tavern: {
    buildingId: 'new_providence_tavern',
    width: 280,
    height: 240,
    entryPosition: { x: 140, y: 216 },
    furniture: [
      { type: 'rug', x: 140, y: 130 },
      { type: 'counter', x: 140, y: 40, width: 160, height: 26 },
      { type: 'table', x: 70, y: 150 },
      { type: 'chair', x: 55, y: 175 },
      { type: 'chair', x: 85, y: 175 },
      { type: 'table', x: 210, y: 150 },
      { type: 'chair', x: 195, y: 175 },
      { type: 'chair', x: 225, y: 175 },
      { type: 'barrel', x: 30, y: 60 },
      { type: 'barrel', x: 250, y: 60 },
      { type: 'door', x: 140, y: 230, fontSize: 24 },
      { type: 'prop', x: 140, y: 16, emoji: '☸️', fontSize: 24 },
      { type: 'prop', x: 220, y: 40, emoji: '⚓', fontSize: 18 },
      { type: 'prop', x: 60, y: 40, emoji: '🪟', fontSize: 18 },
    ],
    npcSpots: [{ id: 'main', x: 140, y: 40 }],
  },
  new_providence_careening_yard: {
    buildingId: 'new_providence_careening_yard',
    width: 250,
    height: 210,
    entryPosition: { x: 125, y: 188 },
    furniture: [
      { type: 'rug', x: 125, y: 115 },
      { type: 'barrel', x: 40, y: 60 },
      { type: 'barrel', x: 40, y: 140 },
      { type: 'shelf', x: 210, y: 100 },
      { type: 'door', x: 125, y: 202, fontSize: 24 },
      { type: 'prop', x: 125, y: 30, emoji: '⛵', fontSize: 28 },
      { type: 'prop', x: 210, y: 150, emoji: '🪚', fontSize: 20 },
      { type: 'prop', x: 190, y: 40, emoji: '🪢', fontSize: 18 },
    ],
    npcSpots: [{ id: 'main', x: 125, y: 60 }],
  },
  roatan_den: {
    buildingId: 'roatan_den',
    width: 230,
    height: 190,
    entryPosition: { x: 115, y: 168 },
    furniture: [
      { type: 'rug', x: 115, y: 100 },
      { type: 'barrel', x: 40, y: 60 },
      { type: 'barrel', x: 40, y: 130 },
      { type: 'barrel', x: 190, y: 130 },
      { type: 'shelf', x: 190, y: 60 },
      { type: 'door', x: 115, y: 182, fontSize: 24 },
      { type: 'prop', x: 115, y: 30, emoji: '🕯️', fontSize: 16 },
      { type: 'prop', x: 115, y: 100, emoji: '🗝️', fontSize: 18 },
    ],
    npcSpots: [{ id: 'main', x: 115, y: 40 }],
  },
  port_royal_college: {
    buildingId: 'port_royal_college',
    width: 250,
    height: 210,
    entryPosition: { x: 125, y: 188 },
    furniture: [
      { type: 'rug', x: 125, y: 120 },
      { type: 'table', x: 125, y: 120 },
      { type: 'chair', x: 125, y: 150 },
      { type: 'shelf', x: 30, y: 60 },
      { type: 'shelf', x: 30, y: 140 },
      { type: 'shelf', x: 220, y: 60 },
      { type: 'shelf', x: 220, y: 140 },
      { type: 'door', x: 125, y: 202, fontSize: 24 },
      { type: 'prop', x: 125, y: 40, emoji: '🌍', fontSize: 22 },
      { type: 'prop', x: 90, y: 120, emoji: '📜', fontSize: 16 },
    ],
    npcSpots: [{ id: 'main', x: 125, y: 40 }],
  },
  port_royal_manor: {
    buildingId: 'port_royal_manor',
    width: 260,
    height: 220,
    entryPosition: { x: 130, y: 198 },
    furniture: [
      { type: 'rug', x: 130, y: 120 },
      { type: 'table', x: 130, y: 120 },
      { type: 'chair', x: 105, y: 145 },
      { type: 'chair', x: 155, y: 145 },
      { type: 'shelf', x: 30, y: 60 },
      { type: 'shelf', x: 230, y: 60 },
      { type: 'door', x: 130, y: 212, fontSize: 24 },
      { type: 'prop', x: 130, y: 20, emoji: '🖼️', fontSize: 24 },
      { type: 'prop', x: 40, y: 150, emoji: '🕯️', fontSize: 18 },
      { type: 'prop', x: 220, y: 150, emoji: '⚔️', fontSize: 20 },
    ],
    npcSpots: [{ id: 'main', x: 130, y: 40 }],
  },
  ile_sainte_marie_shrine: {
    buildingId: 'ile_sainte_marie_shrine',
    width: 220,
    height: 200,
    entryPosition: { x: 110, y: 178 },
    furniture: [
      { type: 'rug', x: 110, y: 110 },
      { type: 'counter', x: 110, y: 50, width: 90, height: 22 },
      { type: 'door', x: 110, y: 192, fontSize: 24 },
      { type: 'prop', x: 70, y: 50, emoji: '🕯️', fontSize: 18 },
      { type: 'prop', x: 150, y: 50, emoji: '🕯️', fontSize: 18 },
      { type: 'prop', x: 40, y: 130, emoji: '🗿', fontSize: 24 },
      { type: 'prop', x: 180, y: 130, emoji: '🐚', fontSize: 18 },
    ],
    npcSpots: [{ id: 'main', x: 110, y: 90 }],
  },
  tortuga_fishmonger: {
    buildingId: 'tortuga_fishmonger',
    width: 230,
    height: 190,
    entryPosition: { x: 115, y: 168 },
    furniture: [
      { type: 'rug', x: 115, y: 110 },
      { type: 'counter', x: 115, y: 40, width: 140, height: 24 },
      { type: 'barrel', x: 30, y: 130 },
      { type: 'barrel', x: 190, y: 130 },
      { type: 'shelf', x: 30, y: 60 },
      { type: 'door', x: 115, y: 182, fontSize: 24 },
      { type: 'prop', x: 95, y: 40, emoji: '🐟', fontSize: 18 },
      { type: 'prop', x: 135, y: 40, emoji: '🐟', fontSize: 18 },
      { type: 'prop', x: 190, y: 60, emoji: '🕸️', fontSize: 18 },
    ],
    npcSpots: [{ id: 'main', x: 115, y: 40 }],
  },
  new_providence_distillery: {
    buildingId: 'new_providence_distillery',
    width: 240,
    height: 200,
    entryPosition: { x: 120, y: 178 },
    furniture: [
      { type: 'rug', x: 120, y: 110 },
      { type: 'counter', x: 120, y: 40, width: 130, height: 24 },
      { type: 'barrel', x: 30, y: 60 },
      { type: 'barrel', x: 30, y: 130 },
      { type: 'barrel', x: 210, y: 60 },
      { type: 'barrel', x: 210, y: 130 },
      { type: 'door', x: 120, y: 192, fontSize: 24 },
      { type: 'prop', x: 120, y: 16, emoji: '🥃', fontSize: 20 },
      { type: 'prop', x: 120, y: 100, emoji: '🔥', fontSize: 18 },
    ],
    npcSpots: [{ id: 'main', x: 120, y: 40 }],
  },
  roatan_timber_yard: {
    buildingId: 'roatan_timber_yard',
    width: 240,
    height: 200,
    entryPosition: { x: 120, y: 178 },
    furniture: [
      { type: 'rug', x: 120, y: 110 },
      { type: 'shelf', x: 30, y: 50 },
      { type: 'shelf', x: 30, y: 130 },
      { type: 'barrel', x: 210, y: 130 },
      { type: 'door', x: 120, y: 192, fontSize: 24 },
      { type: 'prop', x: 150, y: 50, emoji: '🪵', fontSize: 22 },
      { type: 'prop', x: 190, y: 60, emoji: '🪵', fontSize: 22 },
      { type: 'prop', x: 210, y: 40, emoji: '🪚', fontSize: 18 },
    ],
    npcSpots: [{ id: 'main', x: 120, y: 40 }],
  },
  port_royal_armoury: {
    buildingId: 'port_royal_armoury',
    width: 240,
    height: 200,
    entryPosition: { x: 120, y: 178 },
    furniture: [
      { type: 'rug', x: 120, y: 110 },
      { type: 'counter', x: 120, y: 40, width: 130, height: 24 },
      { type: 'shelf', x: 30, y: 90 },
      { type: 'shelf', x: 210, y: 90 },
      { type: 'barrel', x: 30, y: 150 },
      { type: 'barrel', x: 210, y: 150 },
      { type: 'door', x: 120, y: 192, fontSize: 24 },
      { type: 'prop', x: 100, y: 40, emoji: '⚔️', fontSize: 18 },
      { type: 'prop', x: 140, y: 40, emoji: '💥', fontSize: 18 },
    ],
    npcSpots: [{ id: 'main', x: 120, y: 40 }],
  },
  tortuga_ruins: {
    buildingId: 'tortuga_ruins',
    width: 240,
    height: 200,
    entryPosition: { x: 120, y: 178 },
    furniture: [
      // No rug, no counter — this is a collapsed Spanish redoubt with one squatter, not a shop.
      { type: 'stool', x: 120, y: 100 },
      { type: 'barrel', x: 190, y: 90 },
      { type: 'door', x: 120, y: 192, fontSize: 24 },
      { type: 'prop', x: 60, y: 60, emoji: '🪨', fontSize: 26 },
      { type: 'prop', x: 180, y: 140, emoji: '🪨', fontSize: 24 },
      { type: 'prop', x: 40, y: 140, emoji: '🌿', fontSize: 22 },
      { type: 'prop', x: 200, y: 50, emoji: '🕸️', fontSize: 20 },
      { type: 'prop', x: 120, y: 60, emoji: '🕯️', fontSize: 18 },
    ],
    npcSpots: [{ id: 'main', x: 120, y: 100 }],
  },
  tortuga_trapper_camp: {
    buildingId: 'tortuga_trapper_camp',
    width: 220,
    height: 190,
    entryPosition: { x: 110, y: 168 },
    furniture: [
      // No counter, no rug — an open-air boucan camp, not a shop.
      { type: 'stool', x: 110, y: 110 },
      { type: 'barrel', x: 165, y: 90 },
      { type: 'door', x: 110, y: 182, fontSize: 24 },
      { type: 'prop', x: 110, y: 50, emoji: '🏕️', fontSize: 30 },
      { type: 'prop', x: 150, y: 50, emoji: '🥩', fontSize: 20 },
      { type: 'prop', x: 70, y: 100, emoji: '🔥', fontSize: 20 },
      { type: 'prop', x: 60, y: 50, emoji: '🌲', fontSize: 22 },
    ],
    npcSpots: [{ id: 'main', x: 110, y: 80 }],
  },
  tortuga_smuggler_cache: {
    buildingId: 'tortuga_smuggler_cache',
    width: 220,
    height: 190,
    entryPosition: { x: 110, y: 168 },
    furniture: [
      // No counter, no rug — a hidden stash, not a shop with a front door.
      { type: 'barrel', x: 60, y: 60 },
      { type: 'barrel', x: 160, y: 60 },
      { type: 'shelf', x: 60, y: 120 },
      { type: 'door', x: 110, y: 182, fontSize: 24 },
      { type: 'prop', x: 160, y: 110, emoji: '📦', fontSize: 24 },
      { type: 'prop', x: 110, y: 50, emoji: '🕯️', fontSize: 18 },
      { type: 'prop', x: 140, y: 140, emoji: '🗺️', fontSize: 18 },
    ],
    npcSpots: [{ id: 'main', x: 110, y: 90 }],
  },
  tortuga_old_landing_dock: {
    buildingId: 'tortuga_old_landing_dock',
    width: 220,
    height: 190,
    entryPosition: { x: 110, y: 168 },
    furniture: [
      // No counter, no rug — a working dock shack, not a shop.
      { type: 'barrel', x: 60, y: 90 },
      { type: 'door', x: 110, y: 182, fontSize: 24 },
      { type: 'prop', x: 110, y: 50, emoji: '🛶', fontSize: 28 },
      { type: 'prop', x: 150, y: 60, emoji: '🎣', fontSize: 20 },
      { type: 'prop', x: 160, y: 130, emoji: '🪨', fontSize: 22 },
      { type: 'prop', x: 60, y: 140, emoji: '🐚', fontSize: 18 },
    ],
    npcSpots: [{ id: 'main', x: 110, y: 90 }],
  },
  tortuga_harbourmaster: {
    buildingId: 'tortuga_harbourmaster',
    width: 230,
    height: 195,
    entryPosition: { x: 115, y: 183 },
    furniture: [
      { type: 'rug', x: 115, y: 110 },
      { type: 'counter', x: 115, y: 40, width: 130, height: 24 },
      { type: 'shelf', x: 210, y: 90 },
      { type: 'shelf', x: 20, y: 90 },
      { type: 'door', x: 115, y: 187, fontSize: 24 },
      { type: 'prop', x: 115, y: 16, emoji: '📜', fontSize: 22 },
      { type: 'prop', x: 190, y: 150, emoji: '⚖️', fontSize: 18 },
    ],
    npcSpots: [{ id: 'main', x: 115, y: 40 }],
  },
  tortuga_chandlery: {
    buildingId: 'tortuga_chandlery',
    width: 230,
    height: 195,
    entryPosition: { x: 115, y: 183 },
    furniture: [
      { type: 'counter', x: 115, y: 40, width: 140, height: 24 },
      { type: 'barrel', x: 30, y: 100 },
      { type: 'barrel', x: 30, y: 150 },
      { type: 'shelf', x: 200, y: 90 },
      { type: 'shelf', x: 200, y: 150 },
      { type: 'door', x: 115, y: 187, fontSize: 24 },
      { type: 'prop', x: 115, y: 16, emoji: '🪢', fontSize: 22 },
      { type: 'prop', x: 60, y: 40, emoji: '🕯️', fontSize: 16 },
    ],
    npcSpots: [{ id: 'main', x: 115, y: 40 }],
  },
  tortuga_dockworkers_bunkhouse: {
    buildingId: 'tortuga_dockworkers_bunkhouse',
    width: 220,
    height: 190,
    entryPosition: { x: 110, y: 178 },
    furniture: [
      // No counter, no rug — a working bunkhouse, not a shop. Three bunks along the back wall,
      // a card table up front where "the rum's cheap" line plays out.
      { type: 'prop', x: 40, y: 40, emoji: '🛏️', fontSize: 24 },
      { type: 'prop', x: 110, y: 40, emoji: '🛏️', fontSize: 24 },
      { type: 'prop', x: 180, y: 40, emoji: '🛏️', fontSize: 24 },
      { type: 'table', x: 110, y: 120 },
      { type: 'stool', x: 90, y: 140 },
      { type: 'stool', x: 130, y: 140 },
      { type: 'barrel', x: 30, y: 150 },
      { type: 'door', x: 110, y: 182, fontSize: 24 },
    ],
    npcSpots: [{ id: 'main', x: 110, y: 90 }],
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
