/**
 * Data-driven town scenes (Tortuga first). Everything that makes up a town centre — buildings,
 * props, ground surfaces, raised terraces with retaining walls and steps, kerbs and fences — is
 * plain data in a layout file, drawn and collided by townScene.tsx. To change the town:
 *   - swap an image: replace the PNG (same file name) or point the asset key at a new file in the
 *     assets registry. Nothing else changes.
 *   - move/add/remove something: edit one line in the layout file.
 *   - re-tune a sprite's door / ground line / solid area: edit its entry in the assets registry.
 * Coordinates are world units relative to the island centre; y grows southwards (down the screen).
 * Every building faces south: its door is on its bottom edge.
 */
import { ImageSourcePropType } from 'react-native';

export type AssetKind = 'building' | 'prop' | 'tile' | 'strip';

export interface TownAsset {
  src: ImageSourcePropType;
  kind: AssetKind;
  /** height / width of the image. */
  aspect: number;
  /** building: door centre across the image (0 = left edge, 1 = right edge). */
  doorX?: number;
  /** Fraction of the image height, measured up from the bottom, where the ground line (door
   * threshold) sits. Anything drawn below it (crates, steps at the base) is walkable decoration. */
  ground?: number;
  /** Solid footprint as fractions of the image: left/right inset and how far up from the ground
   * line the solid part reaches (1 = whole sprite). Props default to a small base footprint. */
  solid?: { inset: number; up: number } | false;
  /** Default draw width in world units (layout can override). */
  w: number;
}

export interface PlacedBuilding {
  /** Building id from src/data/buildings.ts (makes the door enterable), or null for scenery. */
  id: string | null;
  asset: string;
  /** Horizontal centre and the ground line (y of the door threshold). */
  x: number;
  y: number;
  w?: number;
  flip?: boolean;
}

export interface PlacedProp {
  asset: string;
  x: number;
  /** Ground line (bottom of the object's footprint). */
  y: number;
  w?: number;
  flip?: boolean;
  solid?: boolean;
  /** Nudge the depth-sort line (e.g. a lamp on a kerb that should draw over the street). */
  z?: number;
}

export interface Rect { l: number; r: number; t: number; b: number }

export interface GroundArea extends Rect {
  tile: string;
  /** Tile repeat size in world units. */
  size?: number;
  /** Draw a kerb strip along the south edge (where the street steps down to the ground in front). */
  kerb?: boolean;
}

/** A raised area. Its south edge is a retaining wall (face hangs below `b`), broken by steps. */
export interface Terrace extends Rect {
  /** Wall face height in world units. */
  height: number;
  /** Ground tile on top of the terrace. */
  tile: string;
  size?: number;
  /** Centres of stone steps cut into the south wall. */
  steps: number[];
  stepWidth?: number;
  /** Block the east/west edges too (a free-standing plateau). Set false when lanes run onto the
   * terrace from the sides at the same level. Default true. */
  sides?: boolean;
}

/** A straight run of a tiling strip asset (fence, low wall) along y, from x1 to x2. */
export interface StripRun { asset: string; x1: number; x2: number; y: number; height: number; solid?: boolean }

/** A planted patch (back yard, garden, hillside): filled with plants on a jittered grid, picked
 * deterministically from `seed`, so it looks hand-placed but is one line to move or resize.
 * Solid by default (gardens are not walkable). */
export interface Greenery extends Rect {
  seed: number;
  /** Grid spacing in world units (smaller = denser). Default 9. */
  spacing?: number;
  /** Asset keys to pick from (repeat a key to weight it). Default palms/bushes/planters. */
  kinds?: string[];
  solid?: boolean;
}

/** A flat image laid on the ground (baked ground chunks, pier decks): drawn above the tiled
 * ground and below every sprite. l/t/w/h in world units. */
export interface BakedChunk { src: ImageSourcePropType; l: number; t: number; w: number; h: number }

export interface TownLayout {
  islandId: string;
  /** Old island content (v2 houses/props/single buildings) inside these rects is hidden. */
  clear: Rect[];
  ground: GroundArea[];
  terraces: Terrace[];
  buildings: PlacedBuilding[];
  props: PlacedProp[];
  strips: StripRun[];
  greenery: Greenery[];
  /** Painted ground images over the tiles (see src/town/ground + tools/town/bake_ground.py). */
  decals?: BakedChunk[];
  /** Invisible walls: harbour edges, pier rails, anywhere the player shouldn't walk. */
  blocks: Rect[];
  /** Where a new game starts on this island (inside the town). */
  spawn: { x: number; y: number };
}
