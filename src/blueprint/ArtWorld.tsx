/**
 * Art mode's world extras on Tortuga:
 * - Townsfolk walking the streets and roads, fishermen on the jetties
 * - Shortcuts (a fallen log over the brook, a rope ladder up the High Woods wall) drawn once opened
 * - Weather and district mood: passing rain showers, warmer light in town, greener in the High Woods,
 *   grey and misty in Blackwood's Hollow
 * - The full island map opened by tapping the radar
 * - Things to do with props: search barrels and crates, shake palms, rest on benches, wish at wells,
 *   fish from bridges
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { NPC_SPRITES } from '../data/npcSprites';
import { OBJ_SLOTS } from './artObjects.generated';
import { WORLD_BRIDGE_FISHING, WORLD_FISHERS, WORLD_SHORTCUTS, WORLD_WALKS } from './artWorld.generated';
import { BP_DISTRICT_CENTRES } from './tortugaGameplay.generated';

const MINIMAP = require('../../assets/sprites/tortuga_town/minimap.png');

function useClock(ms: number) {
  const [t, setT] = useState(() => Date.now() / 1000);
  useEffect(() => {
    const id = setInterval(() => setT(Date.now() / 1000), ms);
    return () => clearInterval(id);
  }, [ms]);
  return t;
}

const hash = (i: number) => {
  const x = Math.sin(i * 91.7 + 13.1) * 43758.5453;
  return x - Math.floor(x);
};

// ---------------------------------------------------------------- townsfolk
const FOLK = ['tortuga_amb_sailor', 'tortuga_amb_cook', 'tortuga_amb_lass', 'patron_tortuga_local', 'patron_tortuga_drunk', 'patron_tortuga_rival', 'patron_tortuga_mystic', 'tortuga_tavern:main']
  .map((k) => NPC_SPRITES[k])
  .filter((s) => s && s.walk && s.walkLeft);
const ROUTES = WORLD_WALKS.map((pts) => {
  const seg: number[] = [0];
  for (let i = 1; i < pts.length; i++) seg.push(seg[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { pts, seg, len: seg[seg.length - 1] };
});
const FOLK_H = 8.5;

function along(r: (typeof ROUTES)[number], d: number) {
  let i = 1;
  while (i < r.seg.length - 1 && r.seg[i] < d) i++;
  const a = r.pts[i - 1];
  const b = r.pts[i];
  const f = (d - r.seg[i - 1]) / Math.max(0.001, r.seg[i] - r.seg[i - 1]);
  return { x: a[0] + (b[0] - a[0]) * f, y: a[1] + (b[1] - a[1]) * f, dx: b[0] - a[0] };
}

export const Townsfolk = React.memo(function Townsfolk({ origin, cam }: { origin: { x: number; y: number }; cam: { x: number; y: number } }) {
  const t = useClock(110);
  if (!FOLK.length) return null;
  const out: React.ReactNode[] = [];
  ROUTES.forEach((r, ri) => {
    const n = Math.max(1, Math.min(3, Math.round(r.len / 70)));
    for (let k = 0; k < n; k++) {
      const id = ri * 7 + k;
      const sp = FOLK[id % FOLK.length];
      const speed = 3.2 + hash(id) * 1.6;
      let d = (t * speed + hash(id + 3) * r.len * 2) % (2 * r.len);
      const back = d > r.len;
      if (back) d = 2 * r.len - d;
      const p = along(r, d);
      const wx = origin.x + p.x;
      const wy = origin.y + p.y;
      if (Math.abs(wx - cam.x) > 220 || Math.abs(wy - cam.y) > 280) continue;
      const right = back ? p.dx < 0 : p.dx >= 0;
      const frames = right ? sp.walk! : sp.walkLeft!;
      const f = frames[Math.floor(t * 8 + id) % frames.length];
      const h = FOLK_H * (sp.walkScale ?? 1);
      const w = h * (sp.walkAspect ?? 0.8);
      out.push(<Image key={`f${id}`} source={f} resizeMode="stretch" style={{ position: 'absolute', left: wx - w / 2, top: wy - h, width: w, height: h }} />);
    }
  });
  // fishermen at the jetty ends, rod out over the water
  const sailor = NPC_SPRITES['tortuga_amb_sailor'];
  if (sailor)
    WORLD_FISHERS.forEach(([x, y], i) => {
      const wx = origin.x + x;
      const wy = origin.y + y - 1;
      if (Math.abs(wx - cam.x) > 220 || Math.abs(wy - cam.y) > 280) return;
      const h = FOLK_H;
      const w = h * sailor.aspect;
      const bob = Math.sin(t * 1.5 + i) * 0.4;
      out.push(
        <View key={`fl${i}`} style={{ position: 'absolute', left: wx + 2, top: wy - h * 0.7, width: 6, height: 0.3, backgroundColor: '#5a3a1e', transform: [{ rotate: '-25deg' }] }} />,
        <View key={`ln${i}`} style={{ position: 'absolute', left: wx + 7.4, top: wy - h * 0.7 + 1.2, width: 0.15, height: 5 + bob, backgroundColor: 'rgba(240,240,230,0.8)' }} />,
        <Image key={`fs${i}`} source={sailor.src} resizeMode="stretch" style={{ position: 'absolute', left: wx - w / 2, top: wy - h, width: w, height: h }} />
      );
    });
  return <>{out}</>;
});

// ---------------------------------------------------------------- shortcuts
export function ShortcutSprites({ origin, unlocked }: { origin: { x: number; y: number }; unlocked: string[] }) {
  return (
    <>
      {WORLD_SHORTCUTS.map((s) => {
        const [[x0, y0], [x1, y1]] = s.line;
        const cx = origin.x + (x0 + x1) / 2;
        const cy = origin.y + (y0 + y1) / 2;
        const len = Math.hypot(x1 - x0, y1 - y0) + 2;
        const ang = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
        const open = unlocked.includes(s.id);
        if (s.kind === 'log') {
          if (!open) {
            // a dead tree leaning over the far bank: the hint that it could be pushed across
            const bx = origin.x + s.b[0];
            const by = origin.y + s.b[1];
            return (
              <View key={s.id} style={{ position: 'absolute', left: bx - 1, top: by - 9, width: 2.2, height: 9, backgroundColor: '#6e4c2c', borderWidth: 0.25, borderColor: '#3a2412', transform: [{ rotate: '18deg' }] }} />
            );
          }
          return (
            <View key={s.id} style={{ position: 'absolute', left: cx - len / 2, top: cy - 1.2, width: len, height: 2.4, transform: [{ rotate: `${ang}deg` }] }}>
              <View style={{ flex: 1, backgroundColor: '#7a5230', borderRadius: 1.2, borderWidth: 0.25, borderColor: '#3a2412' }} />
              <View style={{ position: 'absolute', left: 1, right: 1, top: 0.35, height: 0.35, backgroundColor: '#a37446' }} />
              <View style={{ position: 'absolute', right: -0.3, top: 0, width: 2.2, height: 2.4, borderRadius: 1.2, backgroundColor: '#c89a62', borderWidth: 0.25, borderColor: '#3a2412' }} />
            </View>
          );
        }
        // rope ladder: rolled up at the top until opened, then hanging down the wall
        const top = origin.y + Math.min(y0, y1) - 1;
        const h = open ? Math.abs(y1 - y0) + 2.5 : 1.2;
        return (
          <View key={s.id} style={{ position: 'absolute', left: cx - 1.4, top, width: 2.8, height: h }}>
            <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 0.3, backgroundColor: '#c8a66a' }} />
            <View style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 0.3, backgroundColor: '#c8a66a' }} />
            {Array.from({ length: Math.max(1, Math.floor(h / 0.9)) }).map((_, k) => (
              <View key={k} style={{ position: 'absolute', left: 0, right: 0, top: k * 0.9 + 0.3, height: 0.3, backgroundColor: '#8a5a30' }} />
            ))}
          </View>
        );
      })}
    </>
  );
}

export function lockedShortcutRects(origin: { x: number; y: number }, unlocked: string[]) {
  return WORLD_SHORTCUTS.filter((s) => !unlocked.includes(s.id)).map((s) => ({
    l: origin.x + s.block[0],
    r: origin.x + s.block[1],
    t: origin.y + s.block[2],
    b: origin.y + s.block[3],
  }));
}

// ---------------------------------------------------------------- weather and mood (screen space)
const RAIN_CYCLE = 900; // seconds
export function rainAmount(t = Date.now() / 1000) {
  const f = (t % RAIN_CYCLE) / RAIN_CYCLE;
  if (f < 0.88) return 0;  // a short shower now and then, not a quarter of the time
  const k = (f - 0.88) / 0.12;
  return Math.min(1, Math.min(k, 1 - k) * 6);
}

export function WeatherMood({ rel, viewport }: { rel: { x: number; y: number }; viewport: { width: number; height: number } }) {
  const t = useClock(90);
  const rain =
    typeof window !== 'undefined' && typeof window.location !== 'undefined' && /[?&]rain=1/.test(window.location.search ?? '') ? 1 : rainAmount(t);
  // district mood, faded by distance from each district's heart
  const near = (x: number, y: number, r: number) => Math.max(0, Math.min(1, 1 - (Math.hypot(rel.x - x, rel.y - y) - r * 0.5) / r));
  const town = rel.x > -150 && rel.x < 300 && rel.y > -460 && rel.y < 30 ? 1 : 0;
  const woods = near(495, 0, 110);
  const hollow = near(-20, 240, 90);
  const drops: React.ReactNode[] = [];
  if (rain > 0.02) {
    for (let i = 0; i < 70; i++) {
      const sx = (hash(i) * viewport.width + t * 40) % viewport.width;
      const sy = ((hash(i + 50) * viewport.height + t * (520 + hash(i + 9) * 200)) % (viewport.height + 40)) - 20;
      drops.push(<View key={`r${i}`} style={{ position: 'absolute', left: sx, top: sy, width: 1.5, height: 14, backgroundColor: 'rgba(200,220,240,0.55)', opacity: rain, transform: [{ rotate: '12deg' }] }} />);
    }
    for (let i = 0; i < 18; i++) {
      const life = (t * 3 + hash(i + 70)) % 1;
      const sx = hash(i + 100 + Math.floor(t * 3 + hash(i + 70))) * viewport.width;
      const sy = hash(i + 200 + Math.floor(t * 3 + hash(i + 70))) * viewport.height;
      const r = 2 + life * 6;
      drops.push(<View key={`s${i}`} style={{ position: 'absolute', left: sx - r, top: sy - r * 0.5, width: r * 2, height: r, borderRadius: r, borderWidth: 1, borderColor: 'rgba(220,235,245,0.6)', opacity: rain * (1 - life) }} />);
    }
  }
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {town > 0 && <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgb(255,190,110)', opacity: 0.05 * town }]} />}
      {woods > 0 && <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgb(60,140,70)', opacity: 0.09 * woods }]} />}
      {hollow > 0 && <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgb(110,120,140)', opacity: 0.16 * hollow }]} />}
      {rain > 0.02 && <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgb(40,60,90)', opacity: 0.22 * rain }]} />}
      {drops}
    </View>
  );
}

// ---------------------------------------------------------------- full island map
export function FullMap({
  rel,
  target,
  discovered,
  viewport,
  onClose,
}: {
  rel: { x: number; y: number };
  target: { x: number; y: number; label?: string } | null;
  discovered: string[];
  viewport: { width: number; height: number };
  onClose: () => void;
}) {
  const W = viewport.width - 24;
  const H = (W * 1120) / 1240;
  const P = (x: number, y: number) => ({ left: ((x + 620) / 1240) * W, top: ((y + 580) / 1120) * H });
  const me = P(rel.x, rel.y);
  return (
    <Pressable style={styles.mapBack} onPress={onClose}>
      <View style={[styles.mapCard, { width: W + 12 }]}>
        <Text style={styles.mapTitle}>Tortuga</Text>
        <View style={{ width: W, height: H }}>
          <Image source={MINIMAP} style={{ width: W, height: H, borderRadius: 8 }} resizeMode="stretch" />
          {BP_DISTRICT_CENTRES.map((d) => {
            const p = P(d.x, d.y);
            const known = discovered.includes(d.name);
            return (
              <Text key={d.name} style={[styles.mapLabel, { left: p.left - 60, top: p.top - 8, opacity: known ? 1 : 0.6 }]}>
                {known ? d.name : '???'}
              </Text>
            );
          })}
          {target && (
            <View style={[styles.mapTarget, { left: P(target.x, target.y).left - 7, top: P(target.x, target.y).top - 7 }]} />
          )}
          <View style={[styles.mapMe, { left: me.left - 6, top: me.top - 6 }]} />
        </View>
        <Text style={styles.mapHint}>
          {target?.label ? `◆ ${target.label}   ` : ''}● You · tap anywhere to close
        </Text>
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------- things to do with props
export type Interact = { id: string; kind: 'barrel' | 'palm' | 'bench' | 'well' | 'fish'; x: number; y: number; label: string };
const INTERACTS: Interact[] = [
  ...OBJ_SLOTS.map(([a, x, y], i) => {
    const k = a.replace(/_\d+$/, '');
    const kind =
      k === 'barrels' || k === 'barrel' || k === 'crates' || k === 'cargo' || k === 'sacks' || k === 'loot_crates'
        ? 'barrel'
        : k === 'palm'
        ? 'palm'
        : k === 'bench'
        ? 'bench'
        : k === 'well'
        ? 'well'
        : null;
    if (!kind) return null;
    const label =
      kind === 'barrel' ? `🛢️ Search the ${k.replace('_', ' ')}` : kind === 'palm' ? '🌴 Shake the palm' : kind === 'bench' ? '🪑 Rest a while' : '🪙 Make a wish';
    return { id: `${a}@${i}`, kind, x, y: y - 1.5, label } as Interact;
  }).filter((v): v is Interact => !!v),
  ...WORLD_BRIDGE_FISHING.map(([x, y], i) => ({ id: `bridge${i}`, kind: 'fish' as const, x, y, label: '🎣 Fish from the bridge' })),
];

export function nearestInteract(rel: { x: number; y: number }, reach = 3.6): Interact | null {
  let best: Interact | null = null;
  let bd = reach;
  for (const it of INTERACTS) {
    const d = Math.hypot(it.x - rel.x, it.y - rel.y);
    if (d < bd) {
      bd = d;
      best = it;
    }
  }
  return best;
}

const styles = StyleSheet.create({
  mapBack: { position: 'absolute', zIndex: 100, elevation: 100, left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(10,20,30,0.7)', alignItems: 'center', justifyContent: 'center' },
  mapCard: { backgroundColor: '#2b2118', borderRadius: 14, padding: 6, borderWidth: 2, borderColor: '#c9a227', alignItems: 'center' },
  mapTitle: { color: '#f6f1e4', fontWeight: '700', fontSize: 16, marginBottom: 4 },
  mapLabel: { position: 'absolute', width: 120, textAlign: 'center', color: '#2b2118', fontWeight: '700', fontSize: 10, textShadowColor: '#fff8e6', textShadowRadius: 3 },
  mapTarget: { position: 'absolute', width: 14, height: 14, backgroundColor: '#b061ff', borderWidth: 2, borderColor: '#fff', transform: [{ rotate: '45deg' }] },
  mapMe: { position: 'absolute', width: 12, height: 12, borderRadius: 6, backgroundColor: '#ff5252', borderWidth: 2, borderColor: '#fff' },
  mapHint: { color: '#e6dcc6', fontSize: 12, marginTop: 6 },
});
