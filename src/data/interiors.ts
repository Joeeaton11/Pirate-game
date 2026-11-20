import { ImageSourcePropType } from 'react-native';

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
  /** Seats in painted rooms: which way a local sits here ('right' needs a side-on sitting pose). */
  facing?: 'front' | 'right';
}

/** One walk-up-to character in the room: 'main' is the building's own NPC, an id found in
 * AMBIENT_NPCS is a quest-less local, and anything else is a hosted patron side-quest id
 * (looked up from SIDE_QUESTS by id at render time). */
export interface InteriorNpcSpot {
  id: string;
  x: number;
  y: number;
  /** Sits (painted rooms): stays put rather than pacing. */
  seated?: boolean;
  /** How they sit: 'front' = facing the viewer on their own stool; 'right' = side-on on a chair,
   * facing right towards the table. Default 'front'. */
  seat?: 'front' | 'right';
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
  // Townsfolk for the painted rooms (2026-11-20), drawn with the tavern locals' sprites.
  tortuga_amb_browser: {
    id: 'tortuga_amb_browser',
    name: 'A Browsing Shopper',
    emoji: '👩',
    flavor: "Twelve doubloons for a lantern? I'll wait till he's drunk and ask again.",
  },
  tortuga_amb_deckhand: {
    id: 'tortuga_amb_deckhand',
    name: 'A Thrifty Deckhand',
    emoji: '🧔',
    flavor: 'Only came in for a needle. Leaving with a parrot cage, somehow.',
  },
  tortuga_amb_apprentice: {
    id: 'tortuga_amb_apprentice',
    name: 'The Forge Apprentice',
    emoji: '👨‍🍳',
    flavor: "Kade says I'll make smith in ten years. If I keep my eyebrows.",
  },
  tortuga_amb_clerk: {
    id: 'tortuga_amb_clerk',
    name: 'A Harbour Clerk',
    emoji: '👩',
    flavor: 'Mooring fees are due on arrival. And on departure. And on Tuesdays.',
  },
  tortuga_amb_captain: {
    id: 'tortuga_amb_captain',
    name: 'A Merchant Captain',
    emoji: '🧔',
    flavor: "Third time this month I've filed for 'lost to pirates'. Present company excepted.",
  },
  tortuga_amb_galley: {
    id: 'tortuga_amb_galley',
    name: 'A Galley Cook',
    emoji: '👨‍🍳',
    flavor: 'Need rope for the hammocks. And the cat. Long story.',
  },
  tortuga_amb_sailmaker: {
    id: 'tortuga_amb_sailmaker',
    name: 'A Sailmaker',
    emoji: '👩',
    flavor: "Canvas this good won't last. Neither will the sailor who tears it.",
  },
};

/** Something in a painted room Scally can look at: a one-line description, no quest. */
export interface RoomHotspot {
  x: number;
  y: number;
  label: string;
  text: string;
  /** Reach, room units (default 34). */
  r?: number;
}

export interface BuildingInterior {
  buildingId: string;
  width: number;
  height: number;
  entryPosition: { x: number; y: number };
  furniture: InteriorFurniture[];
  hotspots?: RoomHotspot[];
  npcSpots: InteriorNpcSpot[];
  /** A painted room (one picture covering width x height). When set, the furniture list is
   * invisible collision/seating data only — the picture already shows every table and barrel. */
  backdrop?: ImageSourcePropType;
  /** Solid areas of a painted room (walls, the staircase, the fireplace, the bar's back), in room
   * units. Only used with a backdrop. */
  walls?: { l: number; r: number; t: number; b: number }[];
  /** Painted rooms: walking into this area (heading down, out of the door) leaves the building.
   * Rooms without one use their 'door' furniture's position instead. */
  exitZone?: { l: number; r: number; t: number; b: number };
  /** Painted rooms: pieces of the picture (the bar counter, table tops) that are re-drawn over
   * anyone standing behind them, so a barman stands behind his bar and drinkers sit at tables.
   * Each one sorts in depth at its bottom edge. */
  foreground?: { l: number; r: number; t: number; b: number }[];
  /** Painted rooms built in layers: furniture pieces from the room kit (src/data/roomKit.ts), placed
   * by centre x and bottom y and depth-sorted with the characters. */
  props?: { kit: string; x: number; y: number; flip?: boolean }[];
  /** Flickering warm glows (candles, lanterns, fire), room units. */
  lights?: { x: number; y: number; r: number }[];
  /** Small pieces of the picture that bob now and then (the parrot on the sign). */
  bobs?: { l: number; r: number; t: number; b: number }[];
}

/** Hand-authored floor plans. Buildings without an entry here get a generic room via
 * fallbackInterior() instead — nothing is left without a walkable interior. */
export const BUILDING_INTERIORS: Record<string, BuildingInterior> = {
  // Painted room (2026-11-20), styled on the "Jolly Roger" reference: bar along the back wall,
  // skull rug in the middle, tables in the corners, stairs left, fireplace right, door bottom
  // centre. Coordinates are read off assets/sprites/interiors/tavern_salty_parrot.jpg (360 x 360).
  tortuga_tavern: {
    buildingId: 'tortuga_tavern',
    width: 360,
    height: 360,
    entryPosition: { x: 180, y: 262 },
    backdrop: require('../../assets/sprites/interiors/tavern_salty_parrot_shell.jpg'),
    exitZone: { l: 150, r: 210, t: 280, b: 300 },
    walls: [
      { l: 0, r: 360, t: 0, b: 84 }, // back wall
      { l: 0, r: 22, t: 0, b: 360 }, // left wall
      { l: 336, r: 360, t: 0, b: 360 }, // right wall
      { l: 0, r: 148, t: 262, b: 360 }, // front wall, left of the door
      { l: 212, r: 360, t: 262, b: 360 }, // front wall, right of the door
      { l: 0, r: 360, t: 292, b: 360 }, // outside, below the door step
      { l: 108, r: 250, t: 84, b: 124 }, // bar counter
      { l: 0, r: 75, t: 115, b: 165 }, // staircase
      { l: 0, r: 72, t: 172, b: 232 }, // wanted-poster partition
      { l: 312, r: 360, t: 98, b: 205 }, // fireplace
    ],
    foreground: [
      { l: 106, r: 252, t: 100, b: 125 }, // bar counter (part of the room shell)
    ],
    // Furniture from the room kit: five tables, each with a chair facing you (behind it), one either
    // side and one with its back to you, stools along the bar, barrels and crates.
    props: [
      { kit: 'chair_front', x: 66, y: 94 },
      { kit: 'chair_side', x: 93, y: 116, flip: true },
      { kit: 'chair_side', x: 39, y: 116 },
      { kit: 'table', x: 66, y: 124 },
      { kit: 'chair_back', x: 66, y: 136 },
      { kit: 'chair_front', x: 285, y: 98 },
      { kit: 'chair_side', x: 258, y: 120 },
      { kit: 'table', x: 285, y: 128 },
      { kit: 'chair_back', x: 285, y: 140 },
      { kit: 'chair_front', x: 282, y: 170 },
      { kit: 'chair_side', x: 309, y: 192, flip: true },
      { kit: 'table', x: 282, y: 200 },
      { kit: 'chair_back', x: 282, y: 212 },
      { kit: 'chair_front', x: 258, y: 226 },
      { kit: 'chair_side', x: 231, y: 248 },
      { kit: 'table', x: 258, y: 256 },
      { kit: 'chair_back', x: 258, y: 268 },
      { kit: 'chair_front', x: 82, y: 234 },
      { kit: 'chair_side', x: 55, y: 256 },
      { kit: 'table', x: 82, y: 264 },
      { kit: 'chair_back', x: 82, y: 276 },
      { kit: 'bar_red', x: 138, y: 142 },
      { kit: 'stool', x: 170, y: 140 },
      { kit: 'bar_deckhand', x: 202, y: 142 },
      { kit: 'bar_old', x: 234, y: 142 },
      { kit: 'barrel', x: 326, y: 238 },
      { kit: 'barrel', x: 340, y: 256 },
      { kit: 'barrel', x: 22, y: 250 },
      { kit: 'crates', x: 30, y: 272 },
    ],
    hotspots: [
      { x: 38, y: 228, label: 'wanted poster', text: "WANTED: Scar-Faced Odom, for crimes against the King's rum. He's sitting right over there." },
      { x: 272, y: 100, label: 'sea chart', text: 'A chart of the Windward Isles — someone has circled Skull Rock in red.' },
      { x: 304, y: 178, label: 'fireplace', text: 'The fire crackles. Something that might once have been a boot is smouldering in the grate.' },
      { x: 60, y: 104, label: "ship's wheel", text: "The Salty Parrot's old wheel. Tom swears it steered him through a hurricane." },
    ],
    lights: [
      { x: 66, y: 106, r: 14 },
      { x: 285, y: 110, r: 14 },
      { x: 282, y: 182, r: 14 },
      { x: 258, y: 238, r: 14 },
      { x: 82, y: 246, r: 14 },
      { x: 330, y: 172, r: 34 }, // fireplace
      { x: 140, y: 268, r: 16 }, // door lanterns
      { x: 218, y: 268, r: 16 },
      { x: 120, y: 62, r: 14 }, // bar lanterns
      { x: 236, y: 62, r: 14 },
    ],
    bobs: [{ l: 165, r: 190, t: 14, b: 48 }], // the parrot on the sign
    furniture: [
      { type: 'table', x: 66, y: 112 },
      { type: 'table', x: 285, y: 116 },
      { type: 'table', x: 282, y: 188 },
      { type: 'table', x: 258, y: 244 },
      { type: 'table', x: 82, y: 252 },
      { type: 'barrel', x: 326, y: 232 },
      { type: 'barrel', x: 340, y: 250 },
      { type: 'barrel', x: 22, y: 244 },
      { type: 'barrel', x: 30, y: 264 },
      // Seats the roaming locals use: side-on chairs (only for those with a side sitting pose) and
      // spots at a table's front corner where they sit facing the room on their own stool.
      { type: 'chair', x: 260, y: 125, facing: 'right' },
      { type: 'chair', x: 233, y: 253, facing: 'right' },
      { type: 'chair', x: 286, y: 256, facing: 'front' },
      { type: 'chair', x: 313, y: 128, facing: 'front' },
    ],
    npcSpots: [
      { id: 'main', x: 178, y: 118 }, // behind the bar
      { id: 'patron_tortuga_drunk', x: 41, y: 121, seated: true, seat: 'right' },
      { id: 'patron_tortuga_local', x: 262, y: 162 },
      { id: 'patron_tortuga_rival', x: 252, y: 200, seated: true },
      { id: 'patron_tortuga_mystic', x: 112, y: 264, seated: true },
      { id: 'tortuga_amb_sailor', x: 200, y: 220 },
      { id: 'tortuga_amb_cook', x: 215, y: 205 },
      { id: 'tortuga_amb_lass', x: 190, y: 165 },
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
  // Painted room (2026-11-20): The Anchor & Forge — forge at the back, quench trough left, door down the short passage.
  tortuga_smithy: {
    buildingId: 'tortuga_smithy',
    width: 360,
    height: 360,
    entryPosition: { x: 180, y: 262 },
    backdrop: require('../../assets/sprites/interiors/smithy_anchor_forge.jpg'),
    exitZone: { l: 160, r: 200, t: 318, b: 336 },
    walls: [
      { l: 0, r: 360, t: 0, b: 118 },
      { l: 195, r: 255, t: 0, b: 140 },
      { l: 28, r: 112, t: 100, b: 218 },
      { l: 0, r: 36, t: 0, b: 360 },
      { l: 324, r: 360, t: 0, b: 360 },
      { l: 312, r: 360, t: 0, b: 218 },
      { l: 0, r: 70, t: 212, b: 360 },
      { l: 290, r: 360, t: 212, b: 360 },
      { l: 0, r: 158, t: 252, b: 360 },
      { l: 202, r: 360, t: 252, b: 360 },
      { l: 0, r: 360, t: 336, b: 360 },
    ],
    props: [
      { kit: 'barrel', x: 290, y: 244 },
      { kit: 'barrel', x: 305, y: 230 },
      { kit: 'crates', x: 100, y: 248 },
      { kit: 'crates', x: 286, y: 150 },
    ],
    furniture: [
      { type: 'barrel', x: 290, y: 236 },
      { type: 'barrel', x: 305, y: 222 },
      { type: 'barrel', x: 100, y: 238 },
      { type: 'barrel', x: 286, y: 140 },
    ],
    hotspots: [
      { x: 150, y: 132, label: 'tool rack', text: 'Hammers, tongs and a sword with your name engraved on it. Wait — that says "Scully".' },
      { x: 126, y: 168, label: 'quench trough', text: 'The quench trough hisses and steams. Do not drink.' },
      { x: 262, y: 138, label: 'forge', text: 'The forge roars, hot enough to bend an anchor. Cheeky keeps a respectful distance.', r: 26 },
    ],
    npcSpots: [
      { id: 'main', x: 228, y: 156 },
      { id: 'patron_tortuga_smithy', x: 140, y: 200 },
      { id: 'tortuga_amb_apprentice', x: 262, y: 206 },
    ],
  },
  // Painted room (2026-11-20): Harbor Trading Post, kit-furnished.
  tortuga_shop: {
    buildingId: 'tortuga_shop',
    width: 360,
    height: 360,
    entryPosition: { x: 179, y: 262 },
    backdrop: require('../../assets/sprites/interiors/shop_trading_post.jpg'),
    exitZone: { l: 150, r: 208, t: 280, b: 298 },
    walls: [
      { l: 0, r: 360, t: 0, b: 98 },
      { l: 0, r: 24, t: 0, b: 360 },
      { l: 336, r: 360, t: 0, b: 360 },
      { l: 0, r: 148, t: 258, b: 360 },
      { l: 210, r: 360, t: 258, b: 360 },
      { l: 0, r: 360, t: 292, b: 360 },
      { l: 0, r: 40, t: 95, b: 240 },
    ],
    props: [
      { kit: 'crates', x: 60, y: 128 },
      { kit: 'crates', x: 300, y: 126 },
      { kit: 'table', x: 180, y: 164 },
      { kit: 'barrel', x: 300, y: 246 },
      { kit: 'barrel', x: 318, y: 232 },
      { kit: 'crates', x: 62, y: 248 },
      { kit: 'barrel', x: 104, y: 126 },
      { kit: 'crates', x: 252, y: 128 },
      { kit: 'stool', x: 222, y: 176 },
    ],
    furniture: [
      { type: 'table', x: 180, y: 152 },
      { type: 'barrel', x: 60, y: 118 },
      { type: 'barrel', x: 300, y: 116 },
      { type: 'barrel', x: 306, y: 236 },
      { type: 'barrel', x: 62, y: 238 },
      { type: 'barrel', x: 104, y: 116 },
      { type: 'barrel', x: 252, y: 118 },
    ],
    hotspots: [
      { x: 268, y: 108, label: 'painted chart', text: "A painted chart of the Windward Passage. 'Price on request' — which means 'a lot'." },
      { x: 58, y: 160, label: 'fishing nets', text: 'Fishing nets, mended twice and sold as new.' },
    ],
    npcSpots: [
      { id: 'main', x: 180, y: 106 },
      { id: 'tortuga_amb_browser', x: 112, y: 196 },
      { id: 'tortuga_amb_deckhand', x: 262, y: 206 },
    ],
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
  // Painted room (2026-11-20): Harbourmaster's Office — big sea window behind the desk.
  tortuga_harbourmaster: {
    buildingId: 'tortuga_harbourmaster',
    width: 360,
    height: 360,
    entryPosition: { x: 179, y: 262 },
    backdrop: require('../../assets/sprites/interiors/harbourmaster_office.jpg'),
    exitZone: { l: 150, r: 208, t: 280, b: 298 },
    walls: [
      { l: 0, r: 360, t: 0, b: 98 },
      { l: 0, r: 24, t: 0, b: 360 },
      { l: 336, r: 360, t: 0, b: 360 },
      { l: 0, r: 148, t: 258, b: 360 },
      { l: 210, r: 360, t: 258, b: 360 },
      { l: 0, r: 360, t: 292, b: 360 },
      { l: 0, r: 80, t: 80, b: 238 },
      { l: 318, r: 360, t: 98, b: 180 },
    ],
    props: [
      { kit: 'table', x: 180, y: 166 },
      { kit: 'crates', x: 300, y: 248 },
      { kit: 'barrel', x: 312, y: 150 },
      { kit: 'crates', x: 62, y: 250 },
    ],
    furniture: [
      { type: 'table', x: 180, y: 154 },
      { type: 'barrel', x: 300, y: 238 },
      { type: 'barrel', x: 312, y: 142 },
      { type: 'barrel', x: 62, y: 240 },
    ],
    hotspots: [
      { x: 230, y: 104, label: 'window', text: 'Masts crowd the harbour like a winter forest.', r: 26 },
      { x: 288, y: 116, label: 'wanted poster', text: 'WANTED: Captain Odessa Kane, aboard the Black Pearl. Last seen moored off the Long Pier.' },
    ],
    npcSpots: [
      { id: 'main', x: 180, y: 112 },
      { id: 'tortuga_amb_clerk', x: 270, y: 176 },
      { id: 'tortuga_amb_captain', x: 110, y: 214 },
    ],
  },
  // Painted room (2026-11-20): The Chandlery — rope, tackle and sailcloth.
  tortuga_chandlery: {
    buildingId: 'tortuga_chandlery',
    width: 360,
    height: 360,
    entryPosition: { x: 179, y: 262 },
    backdrop: require('../../assets/sprites/interiors/chandlery.jpg'),
    exitZone: { l: 150, r: 208, t: 280, b: 298 },
    walls: [
      { l: 0, r: 360, t: 0, b: 98 },
      { l: 0, r: 24, t: 0, b: 360 },
      { l: 336, r: 360, t: 0, b: 360 },
      { l: 0, r: 148, t: 258, b: 360 },
      { l: 210, r: 360, t: 258, b: 360 },
      { l: 0, r: 360, t: 292, b: 360 },
      { l: 0, r: 50, t: 95, b: 262 },
      { l: 316, r: 360, t: 95, b: 262 },
    ],
    props: [
      { kit: 'barrel', x: 82, y: 128 },
      { kit: 'barrel', x: 290, y: 126 },
      { kit: 'table', x: 180, y: 166 },
      { kit: 'crates', x: 284, y: 248 },
      { kit: 'crates', x: 78, y: 250 },
      { kit: 'crates', x: 240, y: 130 },
      { kit: 'stool', x: 128, y: 176 },
    ],
    furniture: [
      { type: 'barrel', x: 82, y: 120 },
      { type: 'barrel', x: 290, y: 118 },
      { type: 'table', x: 180, y: 154 },
      { type: 'barrel', x: 284, y: 238 },
      { type: 'barrel', x: 78, y: 240 },
      { type: 'barrel', x: 240, y: 120 },
    ],
    hotspots: [
      { x: 296, y: 210, label: 'anchors', text: "Anchors for every hull, from rowboat to man-o'-war." },
      { x: 66, y: 214, label: 'rope coils', text: 'Rope by the fathom. Tarred, so mind your hands.' },
    ],
    npcSpots: [
      { id: 'main', x: 180, y: 106 },
      { id: 'tortuga_amb_galley', x: 116, y: 204 },
      { id: 'tortuga_amb_sailmaker', x: 252, y: 198 },
    ],
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
  const authored = BUILDING_INTERIORS[buildingId] ?? PLAN_ROOMS[buildingId];
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

// Rooms for Tortuga's buildings outside the painted town and its explorable landmarks.
import { PLAN_ROOMS } from './planRooms.generated';
