/**
 * Where you can actually stand on Tortuga, matched to the drawn art (2026-11-24). The old game
 * shape (islands.ts TORTUGA_SHAPE plus pier walk radii) is looser than the painted coast, so
 * Scally could stroll a little way onto the harbour water. This answers "is this drawn ground?"
 * from the blueprint itself: inside the painted town, everything but its water; outside it, the
 * drawn coastline, the docks and jetties, the breakwater and the bridges. Island-relative points.
 * Cached per 1-unit cell, so it is cheap to ask every tick.
 */
import { BP_BRIDGES, BP_COAST, BP_DOCK_SEGMENTS, BP_MOLES, BP_ROADS, BP_TOWN } from './tortugaBlueprint.generated';

type Pt = [number, number];

function parsePath(d: string): Pt[][] {
  const polys: Pt[][] = [];
  for (const part of d.split('Z')) {
    const nums = part.match(/-?\d+(\.\d+)?/g);
    if (!nums || nums.length < 6) continue;
    const pts: Pt[] = [];
    for (let i = 0; i + 1 < nums.length; i += 2) pts.push([+nums[i], +nums[i + 1]]);
    polys.push(pts);
  }
  return polys;
}

function inPoly(x: number, y: number, poly: Pt[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function distSeg(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const vx = bx - ax, vy = by - ay, L2 = vx * vx + vy * vy || 1;
  const t = Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / L2));
  return Math.hypot(px - (ax + vx * t), py - (ay + vy * t));
}

const COAST = parsePath(BP_COAST);
const BRIDGES = parsePath(BP_BRIDGES);
const WATER = BP_TOWN.water ?? [];
const TOWN_KEYS = Object.keys(BP_TOWN);
let TX0 = 1e9, TX1 = -1e9, TY0 = 1e9, TY1 = -1e9;
for (const k of TOWN_KEYS) {
  const r = BP_TOWN[k];
  for (let i = 0; i < r.length; i += 4) {
    TX0 = Math.min(TX0, r[i]); TX1 = Math.max(TX1, r[i + 1]); TY0 = Math.min(TY0, r[i + 2]); TY1 = Math.max(TY1, r[i + 3]);
  }
}

function compute(x: number, y: number): boolean {
  // docks, jetties and the breakwater are always ground, in town or out
  for (const s of BP_DOCK_SEGMENTS) if (distSeg(x, y, s.from.x, s.from.y, s.to.x, s.to.y) <= s.halfWidth) return true;
  // every road, lane and quay walk stays walkable end to end, whatever it crosses
  for (const r of BP_ROADS) {
    const h = r.w / 2 + 0.5;
    for (let i = 0; i + 1 < r.pts.length; i++) if (distSeg(x, y, r.pts[i][0], r.pts[i][1], r.pts[i + 1][0], r.pts[i + 1][1]) <= h) return true;
  }
  for (const arm of BP_MOLES) for (let i = 0; i + 1 < arm.length; i++) if (distSeg(x, y, arm[i][0], arm[i][1], arm[i + 1][0], arm[i + 1][1]) <= 4) return true;
  if (x >= TX0 && x <= TX1 && y >= TY0 && y <= TY1) {
    for (let i = 0; i < WATER.length; i += 4) if (x >= WATER[i] && x < WATER[i + 1] && y >= WATER[i + 2] && y < WATER[i + 3]) return false;
    // the town's drawn street, wharf, garden and sand cells are ground (wharves and piers stand
    // out over the sea, past the coastline); anything else falls back to the coastline
    for (const k of TOWN_KEYS) {
      if (k === 'water') continue;
      const r = BP_TOWN[k];
      for (let i = 0; i < r.length; i += 4) if (x >= r[i] && x < r[i + 1] && y >= r[i + 2] && y < r[i + 3]) return true;
    }
    return COAST.some((p) => inPoly(x, y, p));
  }
  if (BRIDGES.some((p) => inPoly(x, y, p))) return true;
  return COAST.some((p) => inPoly(x, y, p));
}

const cache = new Map<number, boolean>();
export function isTortugaGround(x: number, y: number): boolean {
  const cx = Math.floor(x), cy = Math.floor(y);
  const key = (cx + 2000) * 4000 + (cy + 2000);
  let v = cache.get(key);
  if (v === undefined) {
    v = compute(cx + 0.5, cy + 0.5);
    if (cache.size > 200000) cache.clear();
    cache.set(key, v);
  }
  return v;
}
