/**
 * Gameplay read straight from the island blueprints: which district you're in (discovery), what
 * you're walking on (footsteps), shallow water (the ship slows), cliffs (no landing), and each
 * island's walls and doors in Plan view. World coordinates in, answers out.
 */
import { ISLANDS, ISLAND_LIST } from '../data/islands';
import { ISLAND_PLANS } from './islandPlans.generated';
import { BP_DOORS, BP_SOLIDS } from './tortugaBlueprint.generated';
import { BP_CLIFFS, BP_DISTRICTS, BP_REEF, BP_SURFACE } from './tortugaGameplay.generated';

type Pt = { x: number; y: number };
type Rect = { l: number; r: number; t: number; b: number };
const T = ISLANDS.tortuga_cove.position;

function inPoly(x: number, y: number, flat: number[]) {
  let inside = false;
  for (let i = 0, j = flat.length - 2; i < flat.length; j = i, i += 2) {
    const xi = flat[i], yi = flat[i + 1], xj = flat[j], yj = flat[j + 1];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function segDist(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax, dy = by - ay;
  const len = dx * dx + dy * dy;
  const t = len ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len)) : 0;
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}
function polylineDist(px: number, py: number, flat: number[]) {
  let best = Infinity;
  for (let i = 0; i + 3 < flat.length; i += 2) best = Math.min(best, segDist(px, py, flat[i], flat[i + 1], flat[i + 2], flat[i + 3]));
  return best;
}

// ---------------------------------------------------------------- districts (discovery)
export const DISTRICTS = BP_DISTRICTS;
export const START_DISTRICTS = BP_DISTRICTS.filter((d) => d.known).map((d) => d.name);
/** The Tortuga district at a world point, if any. */
export function districtAt(p: Pt): string | null {
  const x = p.x - T.x, y = p.y - T.y;
  for (const d of BP_DISTRICTS) if (inPoly(x, y, d.poly)) return d.name;
  return null;
}

// ---------------------------------------------------------------- ground surface (footsteps)
const SURF = (() => {
  const { w, h, rows } = BP_SURFACE;
  const grid = new Uint8Array(w * h);
  const codes: Record<string, number> = { '.': 0, g: 1, s: 2, d: 3, c: 4, p: 5 };
  rows.forEach((row, j) => {
    let i = 0;
    for (const m of row.matchAll(/(\d+)([.gsdcp])/g)) {
      const n = parseInt(m[1], 10);
      grid.fill(codes[m[2]], j * w + i, j * w + i + n);
      i += n;
    }
  });
  return grid;
})();
export type Surface = 'none' | 'grass' | 'sand' | 'dirt' | 'cobble' | 'plank';
const SURF_NAMES: Surface[] = ['none', 'grass', 'sand', 'dirt', 'cobble', 'plank'];
export function surfaceAt(p: Pt): Surface {
  const { x0, y0, cell, w, h } = BP_SURFACE;
  const i = Math.floor((p.x - T.x - x0) / cell), j = Math.floor((p.y - T.y - y0) / cell);
  if (i < 0 || j < 0 || i >= w || j >= h) return 'none';
  return SURF_NAMES[SURF[j * w + i]];
}

// ---------------------------------------------------------------- shallows and cliffs
export const SHALLOW_DEPTH = 22;
const REEF_ABS = BP_REEF.map((v, i) => v + (i % 2 ? T.y : T.x));
/** Open water within SHALLOW_DEPTH of any coast, or over the reef. */
export function isShallow(p: Pt): boolean {
  if (inPoly(p.x, p.y, REEF_ABS)) return true;
  for (const island of ISLAND_LIST) {
    const o = island.position;
    const s = island.shape;
    // quick reject on bounds
    let minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity;
    for (const q of s) { minx = Math.min(minx, q.x); maxx = Math.max(maxx, q.x); miny = Math.min(miny, q.y); maxy = Math.max(maxy, q.y); }
    const x = p.x - o.x, y = p.y - o.y;
    if (x < minx - SHALLOW_DEPTH || x > maxx + SHALLOW_DEPTH || y < miny - SHALLOW_DEPTH || y > maxy + SHALLOW_DEPTH) continue;
    for (let i = 0; i < s.length; i++) {
      const a = s[i], b = s[(i + 1) % s.length];
      if (segDist(x, y, a.x, a.y, b.x, b.y) < SHALLOW_DEPTH) return true;
    }
  }
  return false;
}
const CLIFFS_ABS: number[][] = [
  ...BP_CLIFFS.map((c) => c.map((v, i) => v + (i % 2 ? T.y : T.x))),
  ...Object.entries(ISLAND_PLANS).flatMap(([id, plan]) => {
    const o = ISLANDS[id]?.position;
    return o ? plan.cliffs.map((c) => c.map((v, i) => v + (i % 2 ? o.y : o.x))) : [];
  }),
];
/** A coast where the land is high: boats can't land here. */
export function atCliff(p: Pt, reach = 10): boolean {
  return CLIFFS_ABS.some((c) => polylineDist(p.x, p.y, c) < reach);
}

// ---------------------------------------------------------------- walls and doors per island (Plan view)
export const PLAN_SOLIDS: Record<string, Rect[]> = {};
export const PLAN_DOORS: Record<string, { id: string; x: number; y: number }[]> = {};
{
  const rects = (flat: number[], o: Pt) => {
    const out: Rect[] = [];
    for (let i = 0; i < flat.length; i += 4) out.push({ l: o.x + flat[i], r: o.x + flat[i + 1], t: o.y + flat[i + 2], b: o.y + flat[i + 3] });
    return out;
  };
  PLAN_SOLIDS.tortuga_cove = rects(BP_SOLIDS, T);
  PLAN_DOORS.tortuga_cove = BP_DOORS.map((d) => ({ id: d.id, x: T.x + d.x, y: T.y + d.y }));
  for (const [id, plan] of Object.entries(ISLAND_PLANS)) {
    const o = ISLANDS[id]?.position;
    if (!o) continue;
    PLAN_SOLIDS[id] = rects(plan.solids, o);
    PLAN_DOORS[id] = plan.doors.map((d) => ({ id: d.id, x: o.x + d.x, y: o.y + d.y }));
  }
}
