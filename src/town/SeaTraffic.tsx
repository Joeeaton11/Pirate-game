/**
 * Ships at sea round Tortuga (2026-11-24): a merchant fluyt working along the coast outside the
 * breakwater and a navy frigate patrolling a wide circuit round the island. Both are the 3D-rendered
 * pixel ships (32 views) so they turn smoothly, with a water shadow and a pixel foam wake. World
 * coordinates; drawn inside the world layer.
 */
import React, { useEffect, useState } from 'react';
import { Image, ImageSourcePropType, View } from 'react-native';
import { MERCHANT_3D_FRAMES, MERCHANT_3D_SHADOWS, NAVY_3D_FRAMES, NAVY_3D_SHADOWS, ship3dIndex } from '../data/shipSprites';

const SIZE = 44; // world units: every ship canvas is 44 x 44
type Loop = { cx: number; cy: number; rx: number; ry: number; period: number; phase: number; dir: 1 | -1 };
type Vessel = { id: string; loop: Loop; frames: ImageSourcePropType[]; shadows: ImageSourcePropType[] };

// island-relative ellipses checked clear of the coast with 25 units to spare (tools: shapely on BP_COAST)
const VESSELS: Vessel[] = [
  { id: 'merchant', loop: { cx: 60, cy: -640, rx: 480, ry: 90, period: 240, phase: 0.1, dir: 1 }, frames: MERCHANT_3D_FRAMES, shadows: MERCHANT_3D_SHADOWS },
  { id: 'navy', loop: { cx: 80, cy: 20, rx: 760, ry: 640, period: 520, phase: 0.55, dir: -1 }, frames: NAVY_3D_FRAMES, shadows: NAVY_3D_SHADOWS },
];

/** Merchantmen tied up in the harbour (island-relative, 32-view frame index): at the Middle Pier head
 * and alongside the Long Pier. Exported so the Black Pearl can't sail through them. */
export const MOORED_SHIPS: { x: number; y: number; frame: number }[] = [
  { x: 92, y: -399, frame: 0 },
  { x: 38, y: -352, frame: 24 },
];

function at(l: Loop, t: number) {
  const a = ((t / l.period + l.phase) * Math.PI * 2) * l.dir;
  const x = l.cx + l.rx * Math.cos(a), y = l.cy + l.ry * Math.sin(a);
  const dx = -l.rx * Math.sin(a) * l.dir, dy = l.ry * Math.cos(a) * l.dir;
  return { x, y, heading: Math.atan2(dy, dx) };
}

export const SeaTraffic = React.memo(function SeaTraffic({ origin, cam, range = 520 }: { origin: { x: number; y: number }; cam: { x: number; y: number }; range?: number }) {
  const [t, setT] = useState(() => Date.now() / 1000);
  useEffect(() => {
    const id = setInterval(() => setT(Date.now() / 1000), 100);
    return () => clearInterval(id);
  }, []);
  const out: React.ReactNode[] = [];
  for (const [i, m] of MOORED_SHIPS.entries()) {
    const wx = origin.x + m.x, wy = origin.y + m.y;
    if (Math.abs(wx - cam.x) > range || Math.abs(wy - cam.y) > range) continue;
    const bob = Math.sin(t * 1.3 + i * 2) * 0.3;
    out.push(
      <Image key={`ms${i}`} source={MERCHANT_3D_SHADOWS[m.frame]} resizeMode="contain" style={{ position: 'absolute', left: wx - SIZE / 2, top: wy - SIZE / 2, width: SIZE, height: SIZE, opacity: 0.3 }} />,
      <Image key={`mh${i}`} source={MERCHANT_3D_FRAMES[m.frame]} resizeMode="contain" style={{ position: 'absolute', left: wx - SIZE / 2, top: wy - SIZE / 2 + bob, width: SIZE, height: SIZE }} />
    );
  }
  for (const v of VESSELS) {
    const p = at(v.loop, t);
    const wx = origin.x + p.x, wy = origin.y + p.y;
    if (Math.abs(wx - cam.x) > range || Math.abs(wy - cam.y) > range) continue;
    const fi = ship3dIndex(p.heading);
    // wake: a fading V of foam squares at the points she passed in the last few seconds
    for (let k = 1; k <= 10; k++) {
      const q = at(v.loop, t - k * 0.35);
      const age = k / 10;
      const c = Math.cos(q.heading), s = Math.sin(q.heading);
      const sx = origin.x + q.x - c * 16, sy = origin.y + q.y + 4 - s * 8;
      const spread = 1 + age * 8, nx = -s, ny = c * 0.5;
      const op = age < 0.3 ? 0.85 : age < 0.6 ? 0.55 : 0.3;
      for (const side of [1, -1]) {
        out.push(
          <View
            key={`${v.id}w${k}${side}`}
            pointerEvents="none"
            style={{ position: 'absolute', left: Math.round((sx + nx * spread * side) * 6) / 6, top: Math.round((sy + ny * spread * side) * 6) / 6, width: age < 0.4 ? 1.5 : 1, height: age < 0.4 ? 1.5 : 1, backgroundColor: age < 0.4 ? '#ffffff' : '#cdeff0', opacity: op }}
          />
        );
      }
    }
    out.push(
      <Image key={`${v.id}s`} source={v.shadows[fi]} resizeMode="contain" style={{ position: 'absolute', left: wx - SIZE / 2, top: wy - SIZE / 2, width: SIZE, height: SIZE, opacity: 0.3 }} />,
      <Image key={`${v.id}h`} source={v.frames[fi]} resizeMode="contain" style={{ position: 'absolute', left: wx - SIZE / 2, top: wy - SIZE / 2 + Math.sin(t * 1.7 + v.loop.phase * 9) * 0.4, width: SIZE, height: SIZE }} />
    );
  }
  return <>{out}</>;
});
