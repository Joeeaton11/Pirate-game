/**
 * Layout sanity for the Tortuga town centre: the spawn point is clear, every door can be walked
 * to from the spawn, the piers and raised areas are reachable, and no two buildings overlap.
 * Set TOWN_DUMP=/path.json to also write the built scene out (used for overview previews).
 */
import * as fs from 'fs';
import { buildTownScene } from '../townScene';
import { TORTUGA_TOWN_ASSETS } from '../tortugaTownAssets';
import { TORTUGA_TOWN_LAYOUT } from '../tortugaTownLayout';

const scene = buildTownScene(TORTUGA_TOWN_LAYOUT, TORTUGA_TOWN_ASSETS, { x: 0, y: 0 });
const PAD = 1.5; // same padding MapScreen uses
const blocked = (x: number, y: number) =>
  scene.solids.some((q) => x > q.l - PAD && x < q.r + PAD && y > q.t - PAD && y < q.b + PAD);

// Flood fill on a 1-unit grid from the spawn point.
const reach = (() => {
  const seen = new Set<string>();
  const start = [Math.round(scene.spawn.x), Math.round(scene.spawn.y)];
  const q: number[][] = [start];
  seen.add(start.join(','));
  while (q.length) {
    const [x, y] = q.pop()!;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      const k = `${nx},${ny}`;
      if (nx < -175 || nx > 300 || ny < -470 || ny > 70 || seen.has(k) || blocked(nx, ny)) continue;
      seen.add(k);
      q.push([nx, ny]);
    }
  }
  return seen;
})();
const near = (x: number, y: number, r = 4) => {
  for (let dx = -r; dx <= r; dx++) for (let dy = -2; dy <= r; dy++) if (reach.has(`${Math.round(x) + dx},${Math.round(y) + dy}`)) return true;
  return false;
};

if (process.env.TOWN_DUMP) {
  fs.writeFileSync(process.env.TOWN_DUMP, JSON.stringify({ ...scene, buildingIds: [...scene.buildingIds] }));
}

describe('Tortuga town layout', () => {
  it('spawns on open ground', () => expect(blocked(scene.spawn.x, scene.spawn.y)).toBe(false));

  it('can walk to every door', () => {
    const unreachable = scene.doors.filter((d) => !near(d.x, d.y)).map((d) => d.id);
    expect(unreachable).toEqual([]);
  });

  it('can reach the piers, the square, the lower market and the hills', () => {
    const spots: Record<string, [number, number]> = {
      'long pier head': [-30, -394],
      'customs pier head': [112, -380],
      'fish pier head': [262, -443],
      'gun point': [-83, -330],
      wharf: [60, -302],
      'fish quay': [240, -320],
      square: [30, -100],
      'lower market': [30, -70],
      'chapel door': [122, -10],
      'south lane': [171, 25],
    };
    const missing = Object.entries(spots).filter(([, [x, y]]) => !near(x, y)).map(([k]) => k);
    expect(missing).toEqual([]);
  });

  it('places every building id once and buildings never overlap', () => {
    const ids = TORTUGA_TOWN_LAYOUT.buildings.filter((b) => b.id).map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
    const boxes = scene.sprites
      .filter((s) => TORTUGA_TOWN_ASSETS[s.asset]?.kind === 'building')
      .map((s) => ({ k: s.asset, l: s.x - s.w / 2 + 0.6, r: s.x + s.w / 2 - 0.6, z: s.z }));
    const clashes: string[] = [];
    boxes.forEach((a, i) => boxes.slice(i + 1).forEach((b) => {
      if (Math.abs(a.z - b.z) < 30 && a.l < b.r && b.l < a.r) clashes.push(`${a.k} / ${b.k}`);
    }));
    expect(clashes).toEqual([]);
  });
});
