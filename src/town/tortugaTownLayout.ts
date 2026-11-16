/**
 * Tortuga Cove town centre + harbour — the PAINTED town (2026-11-16). The ground, buildings,
 * walls, piers and props are one hand-painted picture (25 chunks in
 * assets/sprites/tortuga_town/painted), styled to match assets/brand/style/MASTER_STYLE_harbour.png.
 * Walls, water, buildings and doors are mapped onto that picture in tortugaPainted.generated.ts.
 * Harbour is NORTH; the three piers (Long, Customs, Fish) are walkable boardwalks. The previous sprite-library layout is kept in tortugaTownLayout.library.ts.
 */
import { TownLayout } from './townTypes';
import { PAINTED_BLOCKS, PAINTED_CHUNKS, PAINTED_DOORS } from './tortugaPainted.generated';

export const TORTUGA_TOWN_LAYOUT: TownLayout = {
  islandId: 'tortuga_cove',
  clear: [{ l: -152, r: 302, t: -457, b: 34 }],
  ground: [],
  terraces: [],
  buildings: [],
  props: [],
  strips: [],
  greenery: [],
  decals: PAINTED_CHUNKS,
  blocks: PAINTED_BLOCKS,
  doors: PAINTED_DOORS,
  spawn: { x: 30, y: -100 },
};
