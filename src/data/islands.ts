import { EncounterSlot, Island } from '../types';

export const WORLD_WIDTH = 3600;
export const WORLD_HEIGHT = 5200;

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
  [568, 0], [532, 114], [476, 214], [408, 298], [330, 364], [240, 414], [144, 442], [46, 448],
  [-46, 448], [-144, 442], [-244, 422], [-350, 388], [-402, 294], [-392, 176], [-470, 100], [-594, 0],
  [-462, -98], [-322, -144], [-306, -222], [-268, -296], [-210, -364], [-138, -422], [-48, -460],
  [52, -478], [154, -472], [256, -446], [316, -350], [354, -256], [380, -170], [450, -98],
]);

/** Île-à-Vache: ~13km x 3.2km, tapers from wider hills in the west to a swampy east end. */
const COW_ISLAND_SHAPE = polygon([
  [300, 0], [294, 62], [274, 122], [242, 176], [200, 222], [150, 260], [92, 286], [32, 298],
  [-32, 302], [-96, 296], [-160, 278], [-220, 244], [-282, 206], [-342, 152], [-394, 84], [-430, 0],
  [-404, -86], [-364, -162], [-310, -226], [-246, -274], [-178, -308], [-106, -324], [-34, -326],
  [34, -316], [98, -300], [156, -272], [208, -230], [250, -182], [278, -124], [296, -62],
]);

/** New Providence: ~34km x 11km, fairly regular oval, elongated east-west. */
const NEW_PROVIDENCE_SHAPE = polygon([
  [420, 0], [394, 84], [362, 160], [316, 230], [256, 284], [186, 322], [112, 346], [38, 352],
  [-36, 344], [-104, 322], [-166, 288], [-218, 242], [-266, 192], [-318, 142], [-362, 76], [-390, 0],
  [-388, -82], [-368, -164], [-332, -240], [-266, -294], [-192, -332], [-114, -352], [-38, -354],
  [36, -342], [102, -316], [160, -278], [208, -230], [246, -180], [308, -136], [364, -78],
]);

/** Roatán: ~59km x 8km, the most elongated of the seven, with a pinched wasp-waist. */
const ROATAN_SHAPE = polygon([
  [470, 0], [440, 94], [392, 174], [330, 240], [252, 280], [170, 294], [92, 284], [28, 258],
  [-28, 258], [-92, 282], [-166, 288], [-248, 276], [-330, 240], [-380, 170], [-414, 88], [-430, 0],
  [-392, -84], [-340, -152], [-276, -202], [-210, -234], [-146, -254], [-84, -258], [-26, -250],
  [28, -270], [104, -320], [200, -346], [310, -344], [354, -258], [350, -156], [414, -88],
]);

/** Port Royal: a rounded head at the tip of the real Palisadoes tombolo, with a spit tailing off. */
const PORT_ROYAL_SHAPE = polygon([
  [380, 0], [396, 84], [390, 174], [366, 266], [310, 344], [216, 376], [124, 384], [40, 372],
  [-38, 366], [-118, 366], [-200, 348], [-280, 310], [-346, 252], [-378, 168], [-394, 84], [-390, 0],
  [-398, -84], [-388, -174], [-358, -260], [-308, -340], [-222, -386], [-134, -410], [-44, -414],
  [42, -404], [122, -378], [196, -338], [286, -316], [372, -270], [442, -196], [400, -84],
]);

/** Île Sainte-Marie: ~50km x 7km, narrow and elongated north-south along Madagascar's coast. */
const ILE_SAINTE_MARIE_SHAPE = polygon([
  [260, 0], [270, 58], [266, 118], [252, 184], [224, 250], [180, 312], [118, 366], [42, 406],
  [-42, 406], [-118, 366], [-180, 312], [-220, 244], [-240, 174], [-244, 110], [-238, 50], [-220, 0],
  [-230, -50], [-230, -102], [-220, -160], [-198, -220], [-160, -278], [-114, -350], [-44, -414],
  [44, -418], [118, -362], [170, -294], [206, -228], [224, -162], [238, -106], [254, -54],
]);

/** Ocracoke: a thin, curved Outer Banks barrier island, elongated east-west. */
const OCRACOKE_SHAPE = polygon([
  [380, 0], [360, 76], [326, 144], [272, 198], [212, 236], [150, 260], [82, 254], [24, 234],
  [-24, 230], [-80, 244], [-140, 242], [-204, 226], [-266, 192], [-320, 142], [-362, 76], [-390, 0],
  [-366, -78], [-328, -146], [-272, -198], [-206, -228], [-140, -242], [-88, -274], [-30, -294],
  [30, -294], [88, -274], [140, -242], [198, -220], [252, -184], [304, -136], [348, -74],
]);

export const ISLANDS: Record<string, Island> = {
  tortuga_cove: {
    id: 'tortuga_cove',
    name: 'Tortuga Cove',
    emoji: '🏝️',
    description: 'Your home port. Calm waters, no trouble here.',
    position: { x: 1800, y: 4560 },
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
    position: { x: 860, y: 3540 },
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
    position: { x: 2740, y: 3540 },
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
    position: { x: 800, y: 2180 },
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
    position: { x: 2800, y: 2180 },
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
    position: { x: 1800, y: 840 },
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
    position: { x: 3000, y: 500 },
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
