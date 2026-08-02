import { EncounterSlot, Island } from '../types';

export const WORLD_WIDTH = 1800;
export const WORLD_HEIGHT = 2600;

/** Converts a compact [x,y][] literal into the {x,y}[] shape Island.shape expects. */
function polygon(points: [number, number][]): { x: number; y: number }[] {
  return points.map(([x, y]) => ({ x, y }));
}

// Each shape below is a hand-authored approximation of the real island's true coastline —
// orientation, elongation, and major coves/headlands — traced relative to `position` (0,0).
// Not survey-accurate, but a real irregular silhouette instead of a perfect circle.

/** Île de la Tortue: ~37km x 7km, turtle-shaped, elongated east-west. Scaled 1.35x over the
 * original coastline trace (2026-08-02) to open room for a woodland belt, a ruined redoubt, and
 * an abandoned quarter beyond the original town's footprint — every existing marker keeps its
 * old coordinate, which now simply sits further inland from the new coastline. */
const TORTUGA_SHAPE = polygon([
  [284, 0], [266, 57], [238, 107], [204, 149], [165, 182], [120, 207], [72, 221], [23, 224],
  [-23, 224], [-72, 221], [-122, 211], [-175, 194], [-201, 147], [-196, 88], [-235, 50], [-297, 0],
  [-231, -49], [-161, -72], [-153, -111], [-134, -148], [-105, -182], [-69, -211], [-24, -230],
  [26, -239], [77, -236], [128, -223], [158, -175], [177, -128], [190, -85], [225, -49],
]);

/** Île-à-Vache: ~13km x 3.2km, tapers from wider hills in the west to a swampy east end. */
const COW_ISLAND_SHAPE = polygon([
  [150, 0], [147, 31], [137, 61], [121, 88], [100, 111], [75, 130], [46, 143], [16, 149],
  [-16, 151], [-48, 148], [-80, 139], [-110, 122], [-141, 103], [-171, 76], [-197, 42], [-215, 0],
  [-202, -43], [-182, -81], [-155, -113], [-123, -137], [-89, -154], [-53, -162], [-17, -163],
  [17, -158], [49, -150], [78, -136], [104, -115], [125, -91], [139, -62], [148, -31],
]);

/** New Providence: ~34km x 11km, fairly regular oval, elongated east-west. */
const NEW_PROVIDENCE_SHAPE = polygon([
  [210, 0], [197, 42], [181, 80], [158, 115], [128, 142], [93, 161], [56, 173], [19, 176],
  [-18, 172], [-52, 161], [-83, 144], [-109, 121], [-133, 96], [-159, 71], [-181, 38], [-195, 0],
  [-194, -41], [-184, -82], [-166, -120], [-133, -147], [-96, -166], [-57, -176], [-19, -177],
  [18, -171], [51, -158], [80, -139], [104, -115], [123, -90], [154, -68], [182, -39],
]);

/** Roatán: ~59km x 8km, the most elongated of the seven, with a pinched wasp-waist. */
const ROATAN_SHAPE = polygon([
  [235, 0], [220, 47], [196, 87], [165, 120], [126, 140], [85, 147], [46, 142], [14, 129],
  [-14, 129], [-46, 141], [-83, 144], [-124, 138], [-165, 120], [-190, 85], [-207, 44], [-215, 0],
  [-196, -42], [-170, -76], [-138, -101], [-105, -117], [-73, -127], [-42, -129], [-13, -125],
  [14, -135], [52, -160], [100, -173], [155, -172], [177, -129], [175, -78], [207, -44],
]);

/** Port Royal: a rounded head at the tip of the real Palisadoes tombolo, with a spit tailing off. */
const PORT_ROYAL_SHAPE = polygon([
  [190, 0], [198, 42], [195, 87], [183, 133], [155, 172], [108, 188], [62, 192], [20, 186],
  [-19, 183], [-59, 183], [-100, 174], [-140, 155], [-173, 126], [-189, 84], [-197, 42], [-195, 0],
  [-199, -42], [-194, -87], [-179, -130], [-154, -170], [-111, -193], [-67, -205], [-22, -207],
  [21, -202], [61, -189], [98, -169], [143, -158], [186, -135], [221, -98], [200, -42],
]);

/** Île Sainte-Marie: ~50km x 7km, narrow and elongated north-south along Madagascar's coast. */
const ILE_SAINTE_MARIE_SHAPE = polygon([
  [130, 0], [135, 29], [133, 59], [126, 92], [112, 125], [90, 156], [59, 183], [21, 203],
  [-21, 203], [-59, 183], [-90, 156], [-110, 122], [-120, 87], [-122, 55], [-119, 25], [-110, 0],
  [-115, -25], [-115, -51], [-110, -80], [-99, -110], [-80, -139], [-57, -175], [-22, -207],
  [22, -209], [59, -181], [85, -147], [103, -114], [112, -81], [119, -53], [127, -27],
]);

/** Ocracoke: a thin, curved Outer Banks barrier island, elongated east-west. */
const OCRACOKE_SHAPE = polygon([
  [190, 0], [180, 38], [163, 72], [136, 99], [106, 118], [75, 130], [41, 127], [12, 117],
  [-12, 115], [-40, 122], [-70, 121], [-102, 113], [-133, 96], [-160, 71], [-181, 38], [-195, 0],
  [-183, -39], [-164, -73], [-136, -99], [-103, -114], [-70, -121], [-44, -137], [-15, -147],
  [15, -147], [44, -137], [70, -121], [99, -110], [126, -92], [152, -68], [174, -37],
]);

export const ISLANDS: Record<string, Island> = {
  tortuga_cove: {
    id: 'tortuga_cove',
    name: 'Tortuga Cove',
    emoji: '🏝️',
    description: 'Your home port. Calm waters, no trouble here.',
    position: { x: 900, y: 2280 },
    shape: TORTUGA_SHAPE,
    isSafeZone: true,
    encounterChance: 0,
    encounterTable: [],
  },
  cow_island: {
    id: 'cow_island',
    name: 'Cow Island',
    emoji: '🐄',
    description: "Low grazing flats where real fleets once mustered before a raid.",
    position: { x: 430, y: 1770 },
    shape: COW_ISLAND_SHAPE,
    encounterChance: 0.09,
    encounterTable: [
      { templateId: 'cabin_hand', weight: 4, minLevel: 2, maxLevel: 4 },
      { templateId: 'deckhand_swordsman', weight: 3, minLevel: 2, maxLevel: 5 },
      { templateId: 'powder_monkey', weight: 3, minLevel: 2, maxLevel: 5 },
      { templateId: 'dockside_sharpshooter', weight: 2, minLevel: 3, maxLevel: 5 },
    ],
  },
  new_providence: {
    id: 'new_providence',
    name: 'New Providence',
    emoji: '🌴',
    description: 'The real pirate republic — no crown, no law, just captains.',
    position: { x: 1370, y: 1770 },
    shape: NEW_PROVIDENCE_SHAPE,
    encounterChance: 0.09,
    encounterTable: [
      { templateId: 'cabin_hand', weight: 3, minLevel: 3, maxLevel: 5 },
      { templateId: 'dockside_sharpshooter', weight: 3, minLevel: 3, maxLevel: 6 },
      { templateId: 'tavern_brawler', weight: 3, minLevel: 4, maxLevel: 7 },
      { templateId: 'musketeer_marksman', weight: 2, minLevel: 5, maxLevel: 7 },
    ],
  },
  roatan: {
    id: 'roatan',
    name: 'Roatán',
    emoji: '⚓',
    description: 'A real careening cove where hulls get scraped, patched, and re-armed.',
    position: { x: 400, y: 1090 },
    shape: ROATAN_SHAPE,
    encounterChance: 0.1,
    encounterTable: [
      { templateId: 'tavern_brawler', weight: 3, minLevel: 6, maxLevel: 9 },
      { templateId: 'boarding_captain', weight: 3, minLevel: 7, maxLevel: 10 },
      { templateId: 'gun_deck_veteran', weight: 3, minLevel: 7, maxLevel: 10 },
      { templateId: 'musketeer_marksman', weight: 2, minLevel: 6, maxLevel: 9 },
    ],
  },
  port_royal: {
    id: 'port_royal',
    name: 'Port Royal',
    emoji: '🌊',
    description: 'The sunken city — swallowed by an earthquake, still drawing the desperate and the cursed.',
    position: { x: 1400, y: 1090 },
    shape: PORT_ROYAL_SHAPE,
    encounterChance: 0.1,
    encounterTable: [
      { templateId: 'boarding_captain', weight: 3, minLevel: 7, maxLevel: 10 },
      { templateId: 'gun_deck_veteran', weight: 2, minLevel: 7, maxLevel: 10 },
      { templateId: 'cursed_bosun', weight: 3, minLevel: 8, maxLevel: 11 },
      { templateId: 'master_gunner', weight: 2, minLevel: 9, maxLevel: 12 },
    ],
  },
  ile_sainte_marie: {
    id: 'ile_sainte_marie',
    name: 'Île Sainte-Marie',
    emoji: '🌀',
    description: 'A remote haven at the edge of the map, tied to old legends of a pirate utopia.',
    position: { x: 900, y: 420 },
    shape: ILE_SAINTE_MARIE_SHAPE,
    encounterChance: 0.12,
    encounterTable: [
      { templateId: 'cursed_bosun', weight: 3, minLevel: 10, maxLevel: 14 },
      { templateId: 'master_gunner', weight: 3, minLevel: 10, maxLevel: 14 },
      { templateId: 'duelist_first_mate', weight: 3, minLevel: 11, maxLevel: 15 },
      { templateId: 'kraken_bound_captain', weight: 1, minLevel: 14, maxLevel: 18 },
    ],
  },
  ocracoke_inlet: {
    id: 'ocracoke_inlet',
    name: 'Ocracoke Inlet',
    emoji: '💀',
    description:
      "Shallow, treacherous waters — the real site of Blackbeard's last stand. The endgame of these seas.",
    position: { x: 1500, y: 250 },
    shape: OCRACOKE_SHAPE,
    encounterChance: 0.14,
    encounterTable: [
      { templateId: 'cursed_bosun', weight: 2, minLevel: 15, maxLevel: 20 },
      { templateId: 'master_gunner', weight: 2, minLevel: 15, maxLevel: 20 },
      { templateId: 'duelist_first_mate', weight: 3, minLevel: 16, maxLevel: 21 },
      { templateId: 'kraken_bound_captain', weight: 2, minLevel: 18, maxLevel: 24 },
    ],
  },
};

export const ISLAND_LIST = Object.values(ISLANDS);
export const START_POSITION = { ...ISLANDS.tortuga_cove.position };

/** Wild encounters rolled while sailing open water, away from any island. */
export const SEA_ENCOUNTER_CHANCE = 0.05;
export const SEA_ENCOUNTER_TABLE: EncounterSlot[] = [
  { templateId: 'powder_monkey', weight: 3, minLevel: 2, maxLevel: 6 },
  { templateId: 'dockside_sharpshooter', weight: 3, minLevel: 3, maxLevel: 7 },
  { templateId: 'gun_deck_veteran', weight: 2, minLevel: 6, maxLevel: 10 },
  { templateId: 'master_gunner', weight: 1, minLevel: 9, maxLevel: 13 },
];

/** Ray-casting point-in-polygon test against a shape given in world coordinates. */
function pointInPolygon(point: { x: number; y: number }, worldShape: { x: number; y: number }[]): boolean {
  let inside = false;
  for (let i = 0, j = worldShape.length - 1; i < worldShape.length; j = i++) {
    const pi = worldShape[i];
    const pj = worldShape[j];
    const intersects =
      pi.y > point.y !== pj.y > point.y &&
      point.x < ((pj.x - pi.x) * (point.y - pi.y)) / (pj.y - pi.y) + pi.x;
    if (intersects) inside = !inside;
  }
  return inside;
}

/** Returns the island whose landmass contains the given world point, if any. */
export function islandAtPoint(point: { x: number; y: number }): Island | null {
  for (const island of ISLAND_LIST) {
    const worldShape = island.shape.map((p) => ({
      x: island.position.x + p.x,
      y: island.position.y + p.y,
    }));
    if (pointInPolygon(point, worldShape)) {
      return island;
    }
  }
  return null;
}
