/**
 * Turns a TownLayout (pure data) into what MapScreen draws and collides with. Nothing in here is
 * town-specific: it reads the layout + asset registry only, so editing either file is enough.
 */
import React from 'react';
import { Image as RNImage, ImageSourcePropType, View } from 'react-native';
import { Rect, TownAsset, TownLayout } from './townTypes';

export interface SceneSprite {
  key: string;
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

export interface SceneDoor { id: string; x: number; y: number }

export interface TownScene {
  ground: React.ReactElement[];
  sprites: SceneSprite[];
  solids: Rect[];
  doors: SceneDoor[];
  clear: Rect[];
  buildingIds: Set<string>;
}

const STEP_W = 14;

export function buildTownScene(
  layout: TownLayout,
  assets: Record<string, TownAsset>,
  origin: { x: number; y: number }
): TownScene {
  const ox = origin.x;
  const oy = origin.y;
  const ground: React.ReactElement[] = [];
  const sprites: SceneSprite[] = [];
  const solids: Rect[] = [];
  const doors: SceneDoor[] = [];
  const A = (k: string) => {
    const a = assets[k];
    if (!a) throw new Error(`Town asset "${k}" missing from the registry`);
    return a;
  };

  // Tiled ground surface: one clipped image per tile so partial tiles at the edges never stretch.
  const tileArea = (key: string, r: Rect, tile: string, size: number) => {
    const src = A(tile).src;
    for (let y = r.t; y < r.b; y += size) {
      for (let x = r.l; x < r.r; x += size) {
        const w = Math.min(size, r.r - x);
        const h = Math.min(size, r.b - y);
        ground.push(
          <View key={`${key}-${x}-${y}`} style={{ position: 'absolute', left: ox + x, top: oy + y, width: w + 0.3, height: h + 0.3, overflow: 'hidden' }}>
            <RNImage source={src} resizeMode="stretch" style={{ width: size + 0.3, height: size + 0.3 }} />
          </View>
        );
      }
    }
  };

  // A horizontal run of a tiling strip, as depth-sorted sprites cut to length.
  const stripRun = (key: string, asset: string, x1: number, x2: number, bottom: number, height: number) => {
    const a = A(asset);
    const seg = height / a.aspect; // native segment length at this height
    let i = 0;
    for (let x = x1; x < x2 - 0.01; x += seg, i++) {
      const w = Math.min(seg, x2 - x);
      sprites.push({ key: `${key}-${i}`, source: a.src, x: ox + x + w / 2, bottom: oy + bottom, w, h: height, z: oy + bottom, clipFrac: w / seg });
    }
  };

  layout.ground.forEach((g, i) => {
    tileArea(`g${i}`, g, g.tile, g.size ?? 14);
    if (g.kerb) stripRun(`k${i}`, 'kerb', g.l, g.r, g.b + 1.6, 1.8);
  });

  layout.terraces.forEach((t, i) => {
    tileArea(`t${i}`, t, t.tile, t.size ?? 14);
    const sw = t.stepWidth ?? STEP_W;
    const gaps = t.steps.map((c) => [c - sw / 2, c + sw / 2]).sort((a, b) => a[0] - b[0]);
    // Wall face hangs below the terrace edge, split around each flight of steps.
    let cur = t.l;
    const runs: [number, number][] = [];
    gaps.forEach(([a, b]) => { if (a > cur) runs.push([cur, a]); cur = Math.max(cur, b); });
    if (cur < t.r) runs.push([cur, t.r]);
    runs.forEach(([a, b], j) => {
      stripRun(`tw${i}-${j}`, 'wall', a, b, t.b + t.height, t.height);
      solids.push({ l: ox + a, r: ox + b, t: oy + t.b - 1, b: oy + t.b + t.height });
    });
    t.steps.forEach((c, j) => {
      const s = A('stairs');
      const h = t.height + 2;
      sprites.push({ key: `ts${i}-${j}`, source: s.src, x: ox + c, bottom: oy + t.b + t.height + 1, w: sw, h: Math.max(h, sw * s.aspect * 0.9), z: oy + t.b + t.height });
    });
    // Side edges of a terrace are cliffs too: block them, a thin shadow line marks them.
    if (t.sides !== false) {
      solids.push({ l: ox + t.l - 2, r: ox + t.l, t: oy + t.t, b: oy + t.b + t.height });
      solids.push({ l: ox + t.r, r: ox + t.r + 2, t: oy + t.t, b: oy + t.b + t.height });
    }
  });

  layout.strips.forEach((s, i) => {
    stripRun(`s${i}`, s.asset, s.x1, s.x2, s.y, s.height);
    if (s.solid !== false) solids.push({ l: ox + s.x1, r: ox + s.x2, t: oy + s.y - 2, b: oy + s.y });
  });

  const buildingIds = new Set<string>();
  layout.buildings.forEach((b, i) => {
    const a = A(b.asset);
    const w = b.w ?? a.w;
    const h = w * a.aspect;
    const g = (a.ground ?? 0.06) * h; // ground line above image bottom
    const bottom = b.y + g;
    sprites.push({ key: `b${i}-${b.asset}`, source: a.src, x: ox + b.x, bottom: oy + bottom, w, h, flip: b.flip, z: oy + b.y });
    const sol = a.solid === undefined ? { inset: 0.04, up: 1 } : a.solid;
    if (sol) {
      const inset = sol.inset * w;
      solids.push({ l: ox + b.x - w / 2 + inset, r: ox + b.x + w / 2 - inset, t: oy + b.y - (h - g) * sol.up, b: oy + b.y - 0.5 });
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
  const props = [...layout.props];
  layout.greenery.forEach((g) => {
    let seed = g.seed * 9301 + 49297;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
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
    if (g.solid !== false) solids.push({ l: ox + g.l, r: ox + g.r, t: oy + g.t, b: oy + g.b });
  });

  props.forEach((p, i) => {
    const a = A(p.asset);
    const w = p.w ?? a.w;
    const h = w * a.aspect;
    sprites.push({ key: `p${i}-${p.asset}`, source: a.src, x: ox + p.x, bottom: oy + p.y, w, h, flip: p.flip, z: oy + p.y });
    const solid = p.solid ?? (a.solid !== false);
    if (solid) {
      const sol = a.solid || { inset: 0.15, up: 0.3 };
      const inset = sol.inset * w;
      solids.push({ l: ox + p.x - w / 2 + inset, r: ox + p.x + w / 2 - inset, t: oy + p.y - h * sol.up, b: oy + p.y });
    }
  });

  return {
    ground,
    sprites,
    solids,
    doors,
    clear: layout.clear.map((r) => ({ l: r.l, r: r.r, t: r.t, b: r.b })),
    buildingIds,
  };
}

/** Renders one depth-sorted scene sprite (strips are clipped to their partial length). */
export function renderSceneSprite(s: SceneSprite) {
  const left = s.x - s.w / 2;
  const top = s.bottom - s.h;
  if (s.clipFrac !== undefined && s.clipFrac < 0.999) {
    const full = s.w / s.clipFrac;
    return (
      <View key={s.key} style={{ position: 'absolute', left, top, width: s.w + 0.2, height: s.h, overflow: 'hidden' }}>
        <RNImage source={s.source} resizeMode="stretch" style={{ width: full, height: s.h }} />
      </View>
    );
  }
  return (
    <RNImage
      key={s.key}
      source={s.source}
      resizeMode="stretch"
      style={{ position: 'absolute', left, top, width: s.w + (s.clipFrac !== undefined ? 0.2 : 0), height: s.h, transform: s.flip ? [{ scaleX: -1 }] : undefined }}
    />
  );
}
