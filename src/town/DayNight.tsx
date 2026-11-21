/**
 * Day → dusk → night → dawn tint over the map, with warm lamp glows at the painted Tortuga doors
 * once it gets dark. Screen-space (drawn over everything), so glows are placed from the camera.
 * The clock is wall-time based, so every screen agrees on the hour without shared state.
 * Web testing: `?tod=night|dusk|day` pins the time.
 */
import React, { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import { DOOR_LAMPS } from './townLife.generated';

const CYCLE_S = 8 * 60;
// Fractions of the cycle: long day, dusk, night, dawn.
const DAY = 0.5;
const DUSK = 0.12;
const NIGHT = 0.26;

function pinned(): number | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  const m = /[?&]tod=(\w+)/.exec(window.location?.search ?? '');
  if (!m) return null;
  return m[1] === 'night' ? 1 : m[1] === 'dusk' ? 0.5 : 0;
}

/** 0 = full day, 1 = full night; 0..1 through dusk/dawn. Also how orange the light is. */
export function nightAmount(nowS = Date.now() / 1000): { dark: number; warm: number } {
  const pin = pinned();
  if (pin !== null) return { dark: pin, warm: pin === 0.5 ? 1 : 0 };
  const f = (nowS % CYCLE_S) / CYCLE_S;
  if (f < DAY) return { dark: 0, warm: 0 };
  if (f < DAY + DUSK) {
    const k = (f - DAY) / DUSK;
    return { dark: k, warm: Math.sin(k * Math.PI) };
  }
  if (f < DAY + DUSK + NIGHT) return { dark: 1, warm: 0 };
  const k = (f - DAY - DUSK - NIGHT) / (1 - DAY - DUSK - NIGHT);
  return { dark: 1 - k, warm: Math.sin(k * Math.PI) * 0.6 };
}

function useNight() {
  const [n, setN] = useState(() => nightAmount());
  useEffect(() => {
    const id = setInterval(() => setN(nightAmount()), 1000);
    return () => clearInterval(id);
  }, []);
  return n;
}

interface Props {
  /** World point at the centre of the screen. */
  cam: { x: number; y: number };
  zoom: number;
  viewport: { width: number; height: number };
  /** Tortuga's world origin, for the door lamps. */
  origin: { x: number; y: number };
  /** Interiors are lit by their own lamps; pass false to skip the lamp glows. */
  lamps?: boolean;
  /** More lamp heads (island-relative) to light, e.g. Art mode's street lamps. */
  extraLamps?: [number, number][];
  /** Window centres (island-relative) that light up warm at night. */
  windows?: [number, number][];
}

export function DayNight({ cam, zoom, viewport, origin, lamps = true, extraLamps, windows }: Props) {
  const { dark, warm } = useNight();
  if (dark < 0.01 && warm < 0.01) return null;
  const flicker = Date.now() / 1000;
  const glows =
    lamps && !extraLamps && dark > 0.35
      ? DOOR_LAMPS.map(([x, y], i) => {
          const sx = viewport.width / 2 + (origin.x + x - cam.x) * zoom;
          const sy = viewport.height / 2 + (origin.y + y - cam.y) * zoom;
          if (sx < -80 || sy < -80 || sx > viewport.width + 80 || sy > viewport.height + 80) return null;
          const a = (dark - 0.35) / 0.65;
          const f = 0.9 + 0.1 * Math.sin(flicker * 7 + i * 1.3);
          return [56, 34, 16].map((r, k) => {
            const rr = r * f;
            return (
              <View
                key={`l${i}-${k}`}
                style={{
                  position: 'absolute',
                  left: sx - rr,
                  top: sy - rr,
                  width: rr * 2,
                  height: rr * 2,
                  borderRadius: rr,
                  backgroundColor: k === 2 ? 'rgb(255,214,140)' : 'rgb(255,160,60)',
                  opacity: a * (k === 0 ? 0.12 : k === 1 ? 0.18 : 0.35),
                }}
              />
            );
          });
        })
      : null;
  // Art mode: small pixel-stepped lamp pools (square rings, not soft discs) and lit windows
  const a2 = Math.max(0, (dark - 0.3) / 0.7);
  const onScreen = (x: number, y: number) => {
    const sx = viewport.width / 2 + (origin.x + x - cam.x) * zoom;
    const sy = viewport.height / 2 + (origin.y + y - cam.y) * zoom;
    return sx < -40 || sy < -40 || sx > viewport.width + 40 || sy > viewport.height + 40 ? null : [sx, sy];
  };
  const pix =
    a2 > 0
      ? [
          ...(lamps && extraLamps ? [...DOOR_LAMPS, ...extraLamps] : []).map(([x, y], i) => {
            const p = onScreen(x, y);
            if (!p) return null;
            const f = 0.85 + 0.15 * Math.sin(flicker * 9 + i * 2.1) * Math.sin(flicker * 3.3 + i);
            return [5.5, 3.6, 2.0, 0.9].map((r, k) => {
              const rr = Math.round(r * zoom * f);
              return (
                <View
                  key={`p${i}-${k}`}
                  style={{
                    position: 'absolute',
                    left: p[0] - rr,
                    top: p[1] - rr,
                    width: rr * 2,
                    height: rr * 2,
                    borderRadius: Math.round(rr * 0.45),
                    backgroundColor: k >= 2 ? 'rgb(255,226,150)' : 'rgb(255,170,70)',
                    opacity: a2 * [0.1, 0.14, 0.3, 0.8][k],
                  }}
                />
              );
            });
          }),
          ...(windows ?? []).map(([x, y], i) => {
            const p = onScreen(x, y);
            if (!p || (i * 7) % 10 > 6) return null; // not every window is lit
            const w = 0.62 * zoom;
            const g = 2.2 * zoom;
            return [
              <View key={`wg${i}`} style={{ position: 'absolute', left: p[0] - g, top: p[1] - g, width: g * 2, height: g * 2, borderRadius: g * 0.4, backgroundColor: 'rgb(255,180,80)', opacity: a2 * 0.16 }} />,
              <View key={`w${i}`} style={{ position: 'absolute', left: p[0] - w * 0.8, top: p[1] - w, width: w * 1.6, height: w * 2, backgroundColor: 'rgb(255,214,130)', opacity: a2 * 0.85 }} />,
            ];
          }),
        ]
      : null;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }}>
      {warm > 0.01 && (
        <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: 'rgb(255,120,50)', opacity: 0.16 * warm }} />
      )}
      {dark > 0.01 && (
        <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: 'rgb(16,24,70)', opacity: 0.5 * dark }} />
      )}
      {glows}
      {pix}
    </View>
  );
}
