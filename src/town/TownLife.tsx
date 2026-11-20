/**
 * Ambient life for the painted Tortuga town, drawn in world coordinates inside the map's world
 * layer: townsfolk walking errands between doors, painted ships bobbing at their moorings, gulls
 * circling the harbour and glints on the water. Runs on its own timer so the map screen only
 * re-renders this layer, not itself.
 */
import React, { useEffect, useState } from 'react';
import { Image as RNImage, ImageSourcePropType, View } from 'react-native';
import { NPC_SPRITES } from '../data/npcSprites';
import { SHIMMER_POINTS, WALKER_ROUTES } from './townLife.generated';

const FRAME_MS = 100;
const WALK_FRAME_MS = 115;
const WALKER_SPEED = 5.5; // world units / s (a stroll, slower than Scally)
const WALKER_HEIGHT = 11.5; // world units, a touch shorter than Scally
const STOP_PAUSE_S = 2.5; // lingering at each door on the errand

/** Painted ships cut out of the town picture (tools/town/life/cut_boats.py), world boxes. */
const BOATS: { src: ImageSourcePropType; l: number; t: number; w: number; h: number; phase: number }[] = [
  { src: require('../../assets/sprites/tortuga_town/life/boat_sloop.png'), l: -63, t: -378, w: 35, h: 27, phase: 0 },
  { src: require('../../assets/sprites/tortuga_town/life/boat_brig.png'), l: 6, t: -376, w: 52, h: 36, phase: 1.9 },
  { src: require('../../assets/sprites/tortuga_town/life/boat_long.png'), l: 127.5, t: -390, w: 17.5, h: 52, phase: 3.4 },
];

const GULL = require('../../assets/sprites/wildlife/seagull_flying_1.png');
const GULLS = [
  { cx: 40, cy: -420, rx: 60, ry: 22, speed: 0.22, phase: 0, size: 7 },
  { cx: 170, cy: -400, rx: 45, ry: 30, speed: -0.3, phase: 2, size: 6 },
  { cx: -40, cy: -440, rx: 35, ry: 14, speed: 0.35, phase: 4, size: 5.5 },
];

const WALKER_CAST = [
  'tortuga_amb_sailor',
  'tortuga_amb_cook',
  'tortuga_amb_lass',
  'patron_tortuga_local',
  'patron_tortuga_drunk',
  'patron_tortuga_mystic',
];

interface RoutePlan {
  pts: [number, number][];
  cum: number[]; // cumulative distance at each point
  total: number;
}
const PLANS: RoutePlan[] = WALKER_ROUTES.map((r) => {
  const pts = [...r, r[0]] as [number, number][];
  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  }
  return { pts, cum, total: cum[cum.length - 1] };
});

/** Where a walker is `t` seconds into its loop, pausing briefly at the route's first stop. */
function walkerAt(plan: RoutePlan, t: number) {
  const loop = plan.total / WALKER_SPEED + STOP_PAUSE_S;
  const local = ((t % loop) + loop) % loop;
  if (local < STOP_PAUSE_S) return { x: plan.pts[0][0], y: plan.pts[0][1], dx: 0, moving: false };
  const d = (local - STOP_PAUSE_S) * WALKER_SPEED;
  let i = 1;
  while (i < plan.cum.length - 1 && plan.cum[i] < d) i++;
  const a = plan.pts[i - 1];
  const b = plan.pts[i];
  const seg = plan.cum[i] - plan.cum[i - 1] || 1;
  const f = Math.min(1, (d - plan.cum[i - 1]) / seg);
  return { x: a[0] + (b[0] - a[0]) * f, y: a[1] + (b[1] - a[1]) * f, dx: b[0] - a[0], moving: true };
}

/** Gentle swell shared by every moored hull (world units). */
export function harbourSwell(t: number, phase: number) {
  return Math.sin(t * 1.25 + phase) * 0.32;
}

function useClock() {
  const [t, setT] = useState(() => Date.now() / 1000);
  useEffect(() => {
    const id = setInterval(() => setT(Date.now() / 1000), FRAME_MS);
    return () => clearInterval(id);
  }, []);
  return t;
}

interface Props {
  origin: { x: number; y: number };
  /** The moored Black Pearl's world position, or null while she's being sailed. */
  ship: { x: number; y: number; size: number; source: ImageSourcePropType } | null;
  /** Blueprint mode: only the ship and the walkers (no painted-ship bobbing, gulls or glints). */
  plan?: boolean;
}

export const TownLife = React.memo(function TownLife({ origin, ship, plan }: Props) {
  const t = useClock();
  const ox = origin.x;
  const oy = origin.y;

  const shimmer = SHIMMER_POINTS.map(([x, y], i) => {
    const o = Math.max(0, Math.sin(t * 1.6 + i * 2.39));
    const a = o * o * o * 0.35;
    if (a < 0.03) return null;
    const w = 1.4 + (i % 3) * 0.5;
    return (
      <View
        key={`sh${i}`}
        style={{
          position: 'absolute',
          left: ox + x - w / 2,
          top: oy + y,
          width: w,
          height: 0.3,
          borderRadius: 0.3,
          backgroundColor: '#e8fbff',
          opacity: a,
        }}
      />
    );
  });

  const walkers = PLANS.map((plan, i) => {
    const sprite = NPC_SPRITES[WALKER_CAST[i % WALKER_CAST.length]];
    if (!sprite) return null;
    // Stagger each walker along its own loop so they don't all leave home together.
    const p = walkerAt(plan, t + i * 17.3);
    const frames = p.moving ? (p.dx < 0 ? sprite.walkLeft : sprite.walk) : undefined;
    const frame = frames ? frames[Math.floor((t * 1000) / WALK_FRAME_MS + i * 3) % frames.length] : sprite.src;
    const h = WALKER_HEIGHT * (frames ? sprite.walkScale ?? 1 : 1);
    const w = h * (frames ? sprite.walkAspect ?? sprite.aspect : sprite.aspect);
    return { y: p.y, el: (
      <View key={`w${i}`} style={{ position: 'absolute', left: ox + p.x - w / 2, top: oy + p.y - h, width: w, height: h }}>
        <View style={{ position: 'absolute', left: w * 0.22, right: w * 0.22, bottom: -0.6, height: 1.4, borderRadius: 1, backgroundColor: 'rgba(0,0,0,0.25)' }} />
        <RNImage source={frame} resizeMode="contain" style={{ width: w, height: h }} />
      </View>
    ) };
  })
    .filter(Boolean)
    .sort((a, b) => a!.y - b!.y)
    .map((x) => x!.el);

  const gulls = GULLS.map((g, i) => {
    const a = t * g.speed + g.phase;
    const x = g.cx + Math.cos(a) * g.rx;
    const y = g.cy + Math.sin(a) * g.ry;
    const goingLeft = -Math.sin(a) * g.speed < 0;
    const flap = 0.7 + 0.3 * Math.abs(Math.sin(t * 6 + i));
    return (
      <RNImage
        key={`g${i}`}
        source={GULL}
        resizeMode="contain"
        style={{
          position: 'absolute',
          left: ox + x - g.size / 2,
          top: oy + y - g.size / 2,
          width: g.size,
          height: g.size * 0.67,
          transform: [{ scaleX: goingLeft ? -1 : 1 }, { scaleY: flap }],
        }}
      />
    );
  });

  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }}>
      {!plan && shimmer}
      {!plan && BOATS.map((b, i) => (
        <RNImage
          key={`b${i}`}
          source={b.src}
          resizeMode="stretch"
          style={{
            position: 'absolute',
            left: ox + b.l,
            top: oy + b.t,
            width: b.w,
            height: b.h,
            transform: [{ translateY: harbourSwell(t, b.phase) }],
          }}
        />
      ))}
      {ship && (
        <RNImage
          source={ship.source}
          resizeMode="contain"
          style={{
            position: 'absolute',
            left: ship.x - ship.size / 2,
            top: ship.y - ship.size / 2,
            width: ship.size,
            height: ship.size,
            transform: [{ translateY: harbourSwell(t, 0.8) }],
          }}
        />
      )}
      {walkers}
      {!plan && gulls}
    </View>
  );
});
