/**
 * Turns a TownLayout (pure data) into plain draw/collision data: ground tiles, depth-sorted
 * sprites, solid rects and door points. No React here (townRender.tsx draws it), so the same
 * output feeds the game, the layout test and offline previews. Nothing is town-specific: it reads
 * the layout + asset registry only, so editing either file is enough.
 */
import type { ImageSourcePropType } from 'react-native';
import { PlacedProp, Rect, TownAsset, TownLayout } from './townTypes';

export interface GroundTile {
  key: string;
  source: ImageSourcePropType;
  /** absolute world coords of the visible cell */
  left: number;
  top: number;
  w: number;
  h: number;
  /** full tile size (the cell shows its top-left w x h) */
  size: number;
}

export interface SceneSprite {
  key: string;
  asset: string;
  source: ImageSourcePropType;
  x: number; // centre, world units (absolute)
  bottom: number; // bottom edge of the image (absolute)
  w: number;
  h: number;
  flip?: boolean;
  /** Depth-sort key (ground line). */
  z: number;
  /** Strips: fraction of one tile segment shown (last piece of a run). */
  clipFrac?: number;
}

export interface SceneDecal { key: string; source: ImageSourcePropType; left: number; top: number; w: number; h: number }

export interface SceneDoor { id: string; x: number; y: number }

export interface TownScene {
  ground: GroundTile[];
  decals: SceneDecal[];
  sprites: SceneSprite[];
  solids: Rect[];
  doors: SceneDoor[];
  clear: Rect[];
  buildingIds: Set<string>;
  spawn: { x: number; y: number };
}

const STEP_W = 14;

/** Deterministic 0..1 generator (same sequence everywhere, so gardens never reshuffle). */
export function seeded(seed: number) {
  let s = seed * 9301 + 49297;
  return () => (s = (s * 9301 + 49297) % 233280) / 233280;
}

export function buildTownScene(
  layout: TownLayout,
  assets: Record<string, TownAsset>,
  origin: { x: number; y: number }
): TownScene {
  const ox = origin.x;
  const oy = origin.y;
  const ground: GroundTile[] = [];
  const sprites: SceneSprite[] = [];
  const solids: Rect[] = [];
  const doors: SceneDoor[] = [];
  const A = (k: string) => {
    const a = assets[k];
    if (!a) throw new Error(`Town asset "${k}" missing from the registry`);
    return a;
  };
  const solid = (r: Rect) => solids.push({ l: ox + r.l, r: ox + r.r, t: oy + r.t, b: oy + r.b });

  const tileArea = (key: string, r: Rect, tile: string, size: number) => {
    const src = A(tile).src;
    for (let y = r.t; y < r.b - 0.01; y += size) {
      for (let x = r.l; x < r.r - 0.01; x += size) {
        ground.push({ key: `${key}-${x}-${y}`, source: src, left: ox + x, top: oy + y, w: Math.min(size, r.r - x), h: Math.min(size, r.b - y), size });
      }
    }
  };

  const stripRun = (key: string, asset: string, x1: number, x2: number, bottom: number, height: number) => {
    const a = A(asset);
    const seg = height / a.aspect;
    let i = 0;
    for (let x = x1; x < x2 - 0.01; x += seg, i++) {
      const w = Math.min(seg, x2 - x);
      sprites.push({ key: `${key}-${i}`, asset, source: a.src, x: ox + x + w / 2, bottom: oy + bottom, w, h: height, z: oy + bottom, clipFrac: w / seg });
    }
  };

  layout.ground.forEach((g, i) => {
    tileArea(`g${i}`, g, g.tile, g.size ?? A(g.tile).w);
    if (g.kerb) stripRun(`k${i}`, 'kerb', g.l, g.r, g.b + 1.6, 1.8);
  });

  const decals: SceneDecal[] = (layout.decals ?? []).map((d, i) => ({ key: `d${i}`, source: d.src, left: ox + d.l, top: oy + d.t, w: d.w, h: d.h }));

  layout.terraces.forEach((t, i) => {
    tileArea(`t${i}`, t, t.tile, t.size ?? A(t.tile).w);
    const sw = t.stepWidth ?? STEP_W;
    const gaps = t.steps.map((c) => [c - sw / 2, c + sw / 2]).sort((a, b) => a[0] - b[0]);
    let cur = t.l;
    const runs: [number, number][] = [];
    gaps.forEach(([a, b]) => { if (a > cur) runs.push([cur, a]); cur = Math.max(cur, b); });
    if (cur < t.r) runs.push([cur, t.r]);
    runs.forEach(([a, b], j) => {
      stripRun(`tw${i}-${j}`, 'wall', a, b, t.b + t.height, t.height);
      solid({ l: a, r: b, t: t.b - 1, b: t.b + t.height });
    });
    t.steps.forEach((c, j) => {
      const s = A('stairs');
      sprites.push({ key: `ts${i}-${j}`, asset: 'stairs', source: s.src, x: ox + c, bottom: oy + t.b + t.height + 1, w: sw, h: Math.max(t.height + 2, sw * s.aspect * 0.9), z: oy + t.b + t.height });
    });
    if (t.sides !== false) {
      solid({ l: t.l - 2, r: t.l, t: t.t, b: t.b + t.height });
      solid({ l: t.r, r: t.r + 2, t: t.t, b: t.b + t.height });
    }
  });

  layout.strips.forEach((s, i) => {
    stripRun(`s${i}`, s.asset, s.x1, s.x2, s.y, s.height);
    if (s.solid !== false) solid({ l: s.x1, r: s.x2, t: s.y - 2, b: s.y });
  });

  layout.blocks.forEach(solid);

  const buildingIds = new Set<string>();
  layout.buildings.forEach((b, i) => {
    const a = A(b.asset);
    const w = b.w ?? a.w;
    const h = w * a.aspect;
    const g = (a.ground ?? 0.06) * h;
    sprites.push({ key: `b${i}-${b.asset}`, asset: b.asset, source: a.src, x: ox + b.x, bottom: oy + b.y + g, w, h, flip: b.flip, z: oy + b.y });
    const sol = a.solid === undefined ? { inset: 0.04, up: 1 } : a.solid;
    if (sol) {
      const inset = sol.inset * w;
      solid({ l: b.x - w / 2 + inset, r: b.x + w / 2 - inset, t: b.y - (h - g) * sol.up, b: b.y - 0.5 });
    }
    if (b.id) {
      const dx = ((a.doorX ?? 0.5) - 0.5) * w * (b.flip ? -1 : 1);
      doors.push({ id: b.id, x: ox + b.x + dx, y: oy + b.y + 1.5 });
      buildingIds.add(b.id);
    }
  });

  // Planted patches become ordinary props (non-solid individually; the patch rect is solid).
  const DEFAULT_KINDS = ['bush', 'bush', 'bush', 'palm_tall', 'palm_tall', 'plant_bed'];
  const SIZE: Record<string, [number, number]> = { bush: [6.5, 9], palm_tall: [12, 17], plant_bed: [8, 10.5] };
  const props: PlacedProp[] = [...layout.props];
  layout.greenery.forEach((g) => {
    const rnd = seeded(g.seed);
    const kinds = g.kinds ?? DEFAULT_KINDS;
    const sp = g.spacing ?? 9;
    for (let y = g.t + sp * 0.6; y <= g.b; y += sp * 0.75) {
      for (let x = g.l + sp * 0.5 * rnd(); x <= g.r; x += sp * (0.8 + 0.4 * rnd())) {
        const k = kinds[Math.floor(rnd() * kinds.length)];
        const [lo, hi] = SIZE[k] ?? [A(k).w * 0.85, A(k).w * 1.1];
        const px = Math.min(g.r - 2, Math.max(g.l + 2, x + (rnd() - 0.5) * sp * 0.5));
        props.push({ asset: k, x: px, y: Math.min(g.b, y + (rnd() - 0.5) * sp * 0.3), w: lo + (hi - lo) * rnd(), flip: rnd() < 0.5, solid: false });
      }
    }
    if (g.solid !== false) solid(g);
  });

  props.forEach((p, i) => {
    const a = A(p.asset);
    const w = p.w ?? a.w;
    const h = w * a.aspect;
    sprites.push({ key: `p${i}-${p.asset}`, asset: p.asset, source: a.src, x: ox + p.x, bottom: oy + p.y, w, h, flip: p.flip, z: oy + p.y + (p.z ?? 0) });
    const isSolid = p.solid ?? (a.solid !== false);
    if (isSolid) {
      const sol = a.solid || { inset: 0.15, up: 0.3 };
      const inset = sol.inset * w;
      solid({ l: p.x - w / 2 + inset, r: p.x + w / 2 - inset, t: p.y - h * sol.up, b: p.y });
    }
  });

  sprites.sort((a, b) => a.z - b.z);
  return {
    ground,
    decals,
    sprites,
    solids,
    doors,
    clear: layout.clear.map((r) => ({ l: r.l, r: r.r, t: r.t, b: r.b })),
    buildingIds,
    spawn: { x: ox + layout.spawn.x, y: oy + layout.spawn.y },
  };
}
