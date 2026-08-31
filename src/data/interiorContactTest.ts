/**
 * Data for the standalone backdrop/contact-point tester (InteriorContactTestScreen), built against
 * the user's own "The Jolly Roger" reference mockup — a fully painted room with every piece of
 * furniture baked straight into one image, exactly the "smoke and mirrors" approach discussed:
 * no separate furniture sprites, just invisible collision shapes positioned over where the art
 * already shows a table, stool, barrel, or the bar counter.
 *
 * TEST_ROOM_SIZE is an arbitrary round logical coordinate space (0–1000 on each axis) mapped onto
 * the backdrop image, which is a 1254x1254 square — every obstacle coordinate below is this
 * session's best-effort eyeballed read of the reference art, scaled into that space. These are a
 * starting point for feel-testing the mechanism, not a calibrated final layout — expect to nudge
 * individual x/y values after actually walking around against the real art.
 */
import { ImageSourcePropType } from 'react-native';

export const TEST_ROOM_SIZE = 1000;

export const TEST_BACKDROP: ImageSourcePropType = require(
  '../../assets/sprites/interiors/test_jolly_roger_tavern.png'
);

export type TestObstacleType = 'bar' | 'table' | 'stool' | 'barrel' | 'wall';

export interface TestObstacle {
  label: string;
  type: TestObstacleType;
  x: number;
  y: number;
  radius: number;
}

export const TEST_OBSTACLES: TestObstacle[] = [
  // Bar counter — a wide fixture, so it's a chain of circles along its length rather than one
  // point-radius at its center, same trick as the counter case in BuildingScreen's
  // furnitureObstacles.
  { label: 'Bar counter', type: 'bar', x: 330, y: 225, radius: 55 },
  { label: 'Bar counter', type: 'bar', x: 410, y: 220, radius: 55 },
  { label: 'Bar counter', type: 'bar', x: 490, y: 218, radius: 55 },
  { label: 'Bar counter', type: 'bar', x: 570, y: 220, radius: 55 },
  { label: 'Bar counter', type: 'bar', x: 650, y: 225, radius: 55 },

  // Bar stools
  { label: 'Stool', type: 'stool', x: 365, y: 345, radius: 26 },
  { label: 'Stool', type: 'stool', x: 445, y: 345, radius: 26 },
  { label: 'Stool', type: 'stool', x: 560, y: 345, radius: 26 },
  { label: 'Stool', type: 'stool', x: 645, y: 345, radius: 26 },

  // Round tables (six seating clusters visible in the reference art)
  { label: 'Table (top-left)', type: 'table', x: 200, y: 290, radius: 58 },
  { label: 'Table (top-right)', type: 'table', x: 790, y: 310, radius: 58 },
  { label: 'Table (mid-left, by stairs)', type: 'table', x: 150, y: 470, radius: 55 },
  { label: 'Table (mid-right)', type: 'table', x: 790, y: 510, radius: 58 },
  { label: 'Table (bottom-left)', type: 'table', x: 240, y: 690, radius: 58 },
  { label: 'Table (bottom-right)', type: 'table', x: 790, y: 690, radius: 58 },

  // Barrels
  { label: 'Barrel', type: 'barrel', x: 920, y: 280, radius: 32 },
  { label: 'Barrel', type: 'barrel', x: 945, y: 335, radius: 32 },
  { label: 'Barrel', type: 'barrel', x: 60, y: 650, radius: 32 },

  // The staircase structure along the left wall — modeled as a vertical chain rather than one
  // shape since it runs the height of that wall, not just a single point.
  { label: 'Staircase', type: 'wall', x: 70, y: 180, radius: 58 },
  { label: 'Staircase', type: 'wall', x: 70, y: 260, radius: 58 },
  { label: 'Staircase', type: 'wall', x: 70, y: 340, radius: 58 },
];

/** Where the player starts — roughly where Captain Scally is already standing on the rug in the
 * reference art, so the first frame matches the mockup. */
export const TEST_ENTRY_POSITION = { x: 500, y: 560 };
