/**
 * Art mode's moving life, drawn over the painted base: shore foam that washes in and out, sea
 * sparkles, chimney smoke, boats bobbing, flags flapping, fires flickering, and animals that
 * wander, peck and scuttle — and scatter (gulls, crows, crabs, chickens) when the player comes close.
 * Positions come from artLife.generated.ts; only what is near the camera is mounted.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Image, View } from 'react-native';
import { LIFE_CRITTERS, LIFE_SHORE, LIFE_SPARKLES, LIFE_SPRITES } from './artLife.generated';
import { ART_CHIMNEYS } from './tortugaArtSlots.generated';

const MX = 300;
const MY = 420;
const TICK_MS = 120;
const FLEE = new Set(['gull', 'crow', 'crab', 'chicken', 'parrot']);

function hash(i: number) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export const ArtLife = React.memo(function ArtLife({
  origin,
  cam,
  player,
}: {
  origin: { x: number; y: number };
  cam: { x: number; y: number };
  player?: { x: number; y: number };
}) {
  const [t, setT] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => setT((Date.now() - start) / 1000), TICK_MS);
    return () => clearInterval(id);
  }, []);
  // when each critter was startled (seconds), so it runs/flies off and comes back later
  const scared = useRef<Record<number, { at: number; dx: number; dy: number }>>({});
  const near = (wx: number, wy: number, mx = MX, my = MY) => Math.abs(wx - cam.x) < mx && Math.abs(wy - cam.y) < my;
  const ox = origin.x;
  const oy = origin.y;
  const out: React.ReactNode[] = [];

  // shore foam: a broken white line that washes up the beach and slides back
  for (let i = 0; i < LIFE_SHORE.length; i++) {
    const [x, y, nx, ny] = LIFE_SHORE[i];
    const wx = ox + x;
    const wy = oy + y;
    if (!near(wx, wy)) continue;
    const ph = t * 0.9 + hash(i) * 6.28;
    const s = Math.sin(ph);
    const off = 1.8 + s * 1.2;
    const op = 0.35 + 0.4 * (0.5 + 0.5 * Math.cos(ph));
    out.push(
      <View
        key={`f${i}`}
        style={{ position: 'absolute', left: wx + nx * off - 1.6, top: wy + ny * off - 0.25, width: 3.2, height: 0.5, backgroundColor: '#f4fbf8', opacity: op }}
      />,
    );
    if (i % 2 === 0) {
      const off2 = 4 + Math.sin(ph - 1.4) * 1.6;
      out.push(
        <View
          key={`g${i}`}
          style={{ position: 'absolute', left: wx + nx * off2 - 1.2, top: wy + ny * off2 - 0.2, width: 2.4, height: 0.4, backgroundColor: '#c8f0ea', opacity: 0.35 * op }}
        />,
      );
    }
  }
  // sea sparkles: a few glint at a time
  for (let i = 0; i < LIFE_SPARKLES.length; i++) {
    const [x, y] = LIFE_SPARKLES[i];
    const wx = ox + x;
    const wy = oy + y;
    if (!near(wx, wy)) continue;
    const k = Math.sin(t * 1.7 + hash(i + 9) * 40);
    if (k < 0.82) continue;
    const a = (k - 0.82) / 0.18;
    out.push(<View key={`s${i}`} style={{ position: 'absolute', left: wx - 1, top: wy - 0.25, width: 2, height: 0.5, backgroundColor: '#ffffff', opacity: a }} />);
    out.push(<View key={`t${i}`} style={{ position: 'absolute', left: wx - 0.25, top: wy - 0.8, width: 0.5, height: 1.6, backgroundColor: '#ffffff', opacity: a * 0.7 }} />);
  }
  // critters, boats, flags, fires
  for (let i = 0; i < LIFE_CRITTERS.length; i++) {
    const [kind, x, y] = LIFE_CRITTERS[i];
    const sp = LIFE_SPRITES[kind];
    if (!sp) continue;
    let wx = ox + x;
    let wy = oy + y;
    if (!near(wx, wy)) continue;
    const h = hash(i);
    let frame = 0;
    let flip = false;
    let opacity = 1;
    let rot = 0;
    if (kind === 'gull') {
      const r = 8 + h * 10;
      const a = t * (0.35 + h * 0.3) * (h > 0.5 ? 1 : -1) + h * 6.28;
      wx += Math.cos(a) * r;
      wy += Math.sin(a) * r * 0.55 - 10;
      frame = Math.floor(t * 4 + h * 10) % 2;
      flip = Math.sin(a) * (h > 0.5 ? 1 : -1) < 0;
    } else if (kind === 'rowboat_moored' || kind === 'fishing_boat') {
      wy += Math.sin(t * 1.3 + h * 6) * 0.4;
      rot = Math.sin(t * 1.1 + h * 6) * 2.5;
      if (kind === 'fishing_boat') wx += Math.sin(t * 0.05 + h * 6) * 12;
    } else if (kind === 'jolly_roger' || kind === 'flag' || kind === 'campfire') {
      frame = Math.floor(t * (kind === 'campfire' ? 6 : 3) + h * 10) % 2;
    } else if (kind === 'goat' || kind === 'pig' || kind === 'turtle') {
      const sp_ = kind === 'turtle' ? 0.05 : 0.12;
      const dx = Math.sin(t * sp_ + h * 20) * (kind === 'turtle' ? 3 : 4);
      wx += dx;
      wy += Math.sin(t * sp_ * 0.7 + h * 11) * 1.5;
      flip = Math.cos(t * sp_ + h * 20) < 0;
    } else if (kind === 'chicken' || kind === 'crow' || kind === 'parrot') {
      frame = Math.sin(t * 2.3 + h * 30) > 0.55 ? 1 : 0;
      wx += Math.round(Math.sin(t * 0.3 + h * 9) * 2);
      flip = Math.cos(t * 0.3 + h * 9) < 0;
    } else if (kind === 'crab') {
      wx += Math.sin(t * 0.8 + h * 14) * 2.5;
      frame = Math.floor(t * 5 + h * 10) % 2;
    }
    // startle: run or fly away from the player, return after a while
    if (FLEE.has(kind) && player) {
      const s = scared.current[i];
      const ddx = wx - player.x;
      const ddy = wy - player.y;
      const d = Math.hypot(ddx, ddy);
      if (!s && d < (kind === 'gull' ? 16 : 9)) scared.current[i] = { at: t, dx: ddx / (d || 1), dy: ddy / (d || 1) };
      const sc = scared.current[i];
      if (sc) {
        const age = t - sc.at;
        if (age > 9 && d > 20) delete scared.current[i];
        else {
          const flies = kind === 'gull' || kind === 'crow' || kind === 'parrot';
          const run = Math.min(age, 2.5) * (flies ? 18 : 7);
          wx += sc.dx * run;
          wy += sc.dy * run - (flies ? run * 0.8 : 0);
          opacity = Math.max(0, 1 - age / (flies ? 2 : 1.4));
          if (flies) frame = Math.floor(t * 8) % 2;
          flip = sc.dx < 0;
          if (opacity <= 0) continue;
        }
      }
    }
    const src = sp.frames[Math.min(frame, sp.frames.length - 1)];
    const transform: any[] = [];
    if (flip) transform.push({ scaleX: -1 });
    if (rot) transform.push({ rotate: `${rot}deg` });
    out.push(
      <Image
        key={`c${i}`}
        source={src}
        resizeMode="stretch"
        style={{ position: 'absolute', left: wx - sp.w * sp.ax, top: wy - sp.h * sp.ay, width: sp.w, height: sp.h, opacity, transform }}
      />,
    );
  }
  // chimney smoke: soft grey puffs drifting up and right, fading out
  for (let i = 0; i < ART_CHIMNEYS.length; i++) {
    const [x, y] = ART_CHIMNEYS[i];
    const wx = ox + x;
    const wy = oy + y;
    if (!near(wx, wy)) continue;
    for (let k = 0; k < 3; k++) {
      const age = (t * 0.35 + k / 3 + hash(i) * 3) % 1;
      const r = Math.round((0.7 + age * 1.8) * 2) / 2;
      out.push(
        <View
          key={`m${i}-${k}`}
          style={{
            position: 'absolute',
            left: wx + age * 4 + Math.sin(age * 6 + i) * 0.8 - r,
            top: wy - age * 12 - r,
            width: r * 2,
            height: r * 2,
            borderRadius: r * 0.35,
            backgroundColor: '#e4e6e6',
            opacity: 0.38 * (1 - age),
          }}
        />,
      );
    }
  }
  return <>{out}</>;
});
