import { EncounterSlot, Island } from '../types';
import { PIERS, QUAYS } from './harbor';

export const WORLD_WIDTH = 3600;
export const WORLD_HEIGHT = 5600;

/** Converts a compact [x,y][] literal into the {x,y}[] shape Island.shape expects. */
function polygon(points: [number, number][]): { x: number; y: number }[] {
  return points.map(([x, y]) => ({ x, y }));
}

// Each shape below is a hand-authored approximation of the real island's true coastline —
// orientation, elongation, and major coves/headlands — traced relative to `position` (0,0).
// Not survey-accurate, but a real irregular silhouette instead of a perfect circle.

/** Île de la Tortue: replaced 2026-09-12 with a real trace of the user's own reference chart
 * ("Tortuga Cove — Composite Planning Blueprint"), not a hand-authored approximation, then
 * RE-SCALED 2026-09-12 (same day, direct follow-up) once the chart turned out to carry its own
 * authoritative world-unit scale that the first trace had missed.
 *
 * Traced with an image-processing pipeline, not eyeballed: classified the reference image into
 * land/water by color (water = blue channel meaningfully above red), filled small holes, then used
 * a morphological opening (a disk-shaped erode+dilate) to sever the thin pier/breakwater bridges
 * that would otherwise wrongly bridge the harbor bay closed as "land", and explicitly masked out
 * the Old Dock pier icon at the south tip (a real dock structure, not coastline, that the same
 * warm color threshold otherwise fuses onto the shore) — picked the single largest connected
 * region left, traced its outer boundary, and simplified it down to a clean polygon
 * (Douglas-Peucker-style, ~40-50 points).
 *
 * The scale: a later reference sheet the user shared for one chunk ("F05 — Anchor & Forge") is
 * headed `GRID: 12 x 10 | CELL: 97 x 93 WORLD UNITS` — the same A-L / 01-10 grid the master
 * blueprint's own corner key already labels its columns/rows with. That ties the blueprint
 * directly to this file's own coordinate system: measuring the master image's column/row label
 * spacing (83.55px/column, 80.17px/row — their ratio matches the stated 97:93 cell aspect to
 * within 0.1%, confirming the reading) gives a real px-to-world-unit conversion, independent of
 * any "does this look about right" guess. Re-measuring the traced coastline through that
 * conversion gave a real island size of ~1170 x ~1008 world units — the first trace above
 * (scaled instead to fit a previously-verified-safe footprint, see the item-213 history this
 * comment used to hold) had come out 1680 x 1356, i.e. 44%/35% too big on x/y. Every other real
 * Tortuga-relative coordinate in the game (buildings, houses, landmarks, streets/junctions,
 * harbor piers/quays/breakwater/boats, props, scenery, resources, Blackfin/rescue/side-quest/
 * street-NPC/treasure locations) was rescaled by the same factor (0.7199, the average of the
 * measured x/y correction) so the whole town shrinks together rather than this shape alone —
 * building/house/NPC footprint SIZES themselves (BUILDING_LABEL_SIZE etc., MapScreen.tsx) were
 * deliberately left untouched, since the user's own read was "the size of these buildings feels
 * good" — only their spacing needed to close up to match the correctly-sized island. See
 * GAME_DESIGN.md item 217. Position (0,0) is the traced shape's own bounding-box center. */
const TORTUGA_SHAPE = polygon([
  [24, 504], [-53, 491], [-166, 431], [-218, 450], [-345, 411], [-449, 285], [-425, 117], [-456, 70],
  [-585, -27], [-585, -79], [-558, -120], [-434, -216], [-348, -241], [-330, -320], [-279, -379], [-270, -452],
  [-211, -504], [-199, -486], [-241, -434], [-249, -321], [-168, -228], [-107, -234], [-85, -258], [-140, -334],
  [-107, -360], [-129, -428], [-100, -459], [-76, -442], [-73, -323], [31, -298], [62, -311], [91, -280],
  [190, -311], [216, -372], [239, -368], [262, -410], [315, -432], [413, -353], [453, -225], [585, -111],
  [585, 93], [559, 165], [414, 347], [300, 414], [286, 394], [118, 394], [117, 463], [59, 473],
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

/** Skull's End: a thin, curved barrier island, elongated east-west — the final frontier of these
 * seas. (Shape/constant name predate the 2026-08-30 rename — this island was "Ocracoke Inlet" until
 * then, a real historical place directly tied to the real Blackbeard's death; renamed alongside the
 * Lord who lives here for the same reason.) */
const SKULLS_END_SHAPE = polygon([
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
  skulls_end: {
    id: 'skulls_end',
    name: "Skull's End",
    emoji: '💀',
    description:
      "Shallow, treacherous waters — where Silas Grimtide made his last stand, or so the legend goes. The endgame of these seas.",
    position: { x: 3000, y: 500 },
    shape: SKULLS_END_SHAPE,
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

/** Shortest distance from a point to a line segment — used below to test whether a point is
 * standing on a pier/quay boardwalk rather than the natural coastline. */
function distToSegment(
  point: { x: number; y: number },
  a: { x: number; y: number },
  b: { x: number; y: number }
): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (dx === 0 && dy === 0) return Math.hypot(point.x - a.x, point.y - a.y);
  const t = Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(point.x - (a.x + t * dx), point.y - (a.y + t * dy));
}

// Half the drawn width of a pier/quay stroke, plus a little slack — a boardwalk is a built,
// walkable structure, so standing on one counts as land even out over open water, per direct
// player feedback ("I want the dock boardwalk to be classed as land, so you can walk on and not
// become the boat"). The offshore BREAKWATER is deliberately excluded: it's a rubble arm, not a
// boardwalk, so it stays sea-only backdrop.
const PIER_WALK_RADIUS = 16;

/** Returns the island whose landmass — or whose pier/quay boardwalk — contains the given world
 * point, if any. */
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
  for (const segment of [...PIERS, ...QUAYS]) {
    const island = ISLANDS[segment.islandId];
    const from = { x: island.position.x + segment.from.x, y: island.position.y + segment.from.y };
    const to = { x: island.position.x + segment.to.x, y: island.position.y + segment.to.y };
    if (distToSegment(point, from, to) <= PIER_WALK_RADIUS) {
      return island;
    }
  }
  return null;
}
