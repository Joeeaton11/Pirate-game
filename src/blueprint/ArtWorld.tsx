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
import { BUILDINGS } from '../data/buildings';
import { UI_NAMEPLATE_BOARD } from '../data/uiSprites';
import { NAMEPLATE_LETTER_GAP_FRACTION, NAMEPLATE_SPACE_FRACTION, nameplateChars } from '../data/bitmapNameplateFont';
import { BP_DOORS } from './tortugaBlueprint.generated';
import { OBJ_ASSETS, OBJ_SLOTS } from './artObjects.generated';
import { WORLD_BRIDGE_FISHING, WORLD_FISHERS, WORLD_SHORTCUTS, WORLD_SPANS, WORLD_SQUARE, WORLD_STEPS, WORLD_WALKS, WORLD_WORK } from './artWorld.generated';
import { CYCLE_SECONDS } from '../town/DayNight';
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
const FOLK_H = 11.5; // same height as the town walkers (TownLife WALKER_HEIGHT), a touch shorter than Scally

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
  // workers: a farmer hoeing along the furrows, dockhands rolling barrels down the wharf
  const barrel = OBJ_ASSETS['barrel_0'];
  WORK_ROUTES.forEach((r, i) => {
    const sp = r.kind === 'farm' ? NPC_SPRITES['patron_tortuga_local'] ?? FOLK[0] : NPC_SPRITES['tortuga_amb_sailor'] ?? FOLK[0];
    if (!sp || !sp.walk || !sp.walkLeft) return;
    const speed = r.kind === 'farm' ? 1.1 : 2.4;
    let d = (t * speed + hash(i + 40) * r.len) % (2 * r.len);
    const back = d > r.len;
    if (back) d = 2 * r.len - d;
    // the farmer stops to hoe every few paces
    const working = r.kind === 'farm' && Math.floor(t / 2.5 + i) % 3 === 0;
    const p = along(r, d);
    const wx = origin.x + p.x;
    const wy = origin.y + p.y;
    if (Math.abs(wx - cam.x) > 220 || Math.abs(wy - cam.y) > 280) return;
    const dirX = r.pts[r.pts.length - 1][0] - r.pts[0][0];
    const dirY = r.pts[r.pts.length - 1][1] - r.pts[0][1];
    const right = Math.abs(dirX) > Math.abs(dirY) ? (back ? dirX < 0 : dirX >= 0) : !back;
    const frames = right ? sp.walk! : sp.walkLeft!;
    const f = working ? sp.src : frames[Math.floor(t * 8 + i) % frames.length];
    const h = FOLK_H * (working ? 1 : sp.walkScale ?? 1);
    const w = h * (working ? sp.aspect : sp.walkAspect ?? 0.8);
    if (r.kind === 'barrel' && barrel) {
      // the barrel rolls ahead of him
      const bw = 3.2;
      const bh = bw * barrel.aspect;
      const ahead = Math.abs(dirX) > Math.abs(dirY) ? { x: right ? 3 : -3, y: 0 } : { x: 0, y: back ? -2.5 : 2.5 };
      out.push(
        <Image key={`wb${i}`} source={barrel.src} resizeMode="stretch"
          style={{ position: 'absolute', left: wx + ahead.x - bw / 2, top: wy + ahead.y - bh, width: bw, height: bh, transform: [{ rotate: `${Math.round(((t * speed * 60) % 360) / 90) * 90}deg` }] }} />
      );
    }
    out.push(<Image key={`w${i}`} source={f} resizeMode="stretch" style={{ position: 'absolute', left: wx - w / 2, top: wy - h, width: w, height: h }} />);
    if (working)
      out.push(
        <View key={`wh${i}`} style={{ position: 'absolute', left: wx + (right ? 1 : -4), top: wy - 3 + Math.abs(Math.sin(t * 6)) * 1.5, width: 3, height: 1, backgroundColor: '#6e4c2c', transform: [{ rotate: right ? '35deg' : '-35deg' }] }} />
      );
  });
  // cargo swinging from the harbour cranes, hoisted up and lowered in turn
  const crate = OBJ_ASSETS['crates_0'];
  if (crate)
    CRANES.forEach(([x, y], i) => {
      const wx = origin.x + x;
      const wy = origin.y + y;
      if (Math.abs(wx - cam.x) > 220 || Math.abs(wy - cam.y) > 280) return;
      const phase = (t / 9 + hash(i + 77)) % 1;
      const lift = Math.sin(phase * Math.PI) * 6; // up and down once a cycle
      const sway = Math.sin(t * 1.3 + i) * 0.8;
      const cw = 3.4;
      const ch = cw * crate.aspect;
      const topY = wy - 15;
      const cy = wy - 4 - lift;
      out.push(
        <View key={`cr${i}`} style={{ position: 'absolute', left: wx + 4 + sway, top: topY, width: 1, height: Math.max(1, cy - ch - topY), backgroundColor: 'rgba(70,50,30,0.9)' }} />,
        <Image key={`cc${i}`} source={crate.src} resizeMode="stretch" style={{ position: 'absolute', left: wx + 4.5 + sway - cw / 2, top: cy - ch, width: cw, height: ch }} />
      );
    });
  return <>{out}</>;
});

const WORK_ROUTES = WORLD_WORK.map((w) => {
  const pts = w.pts;
  const seg: number[] = [0];
  for (let i = 1; i < pts.length; i++) seg.push(seg[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { kind: w.kind, pts, seg, len: seg[seg.length - 1] };
});
const CRANES: [number, number][] = OBJ_SLOTS.filter((s) => s[0].startsWith('crane')).map((s) => [s[1], s[2]]);

/** What Scally's feet are on for footsteps: a bridge deck (timber or stone) or a flight of steps. */
export function footingAt(rel: { x: number; y: number }): { bridge: 'wood' | 'stone' | null; steps: boolean } {
  let bridge: 'wood' | 'stone' | null = null;
  for (const b of WORLD_SPANS) {
    const [a, c] = [b.pts[0], b.pts[b.pts.length - 1]];
    const dx = c[0] - a[0];
    const dy = c[1] - a[1];
    const L2 = dx * dx + dy * dy || 1;
    const k = Math.max(-0.2, Math.min(1.2, ((rel.x - a[0]) * dx + (rel.y - a[1]) * dy) / L2));
    if (Math.hypot(a[0] + dx * k - rel.x, a[1] + dy * k - rel.y) < b.w / 2 + 1.5) {
      bridge = b.kind === 'stone' ? 'stone' : 'wood';
      break;
    }
  }
  const steps = WORLD_STEPS.some(([x, y, r]) => Math.hypot(rel.x - x, rel.y - y) < r);
  return { bridge, steps };
}

// ---------------------------------------------------------------- the market square's life
// Traders behind the stalls and shoppers browsing, pigeons that scatter when you run through, water
// splashing in the fountain, bunting strung between the lamps, a town crier with a tip for you, and
// once every seven days a market day: extra stalls and a crowd.
const PIGEON = [require('../../assets/sprites/plan_art/fx/pigeon_0.png'), require('../../assets/sprites/plan_art/fx/pigeon_1.png')];
const SPLASH = require('../../assets/sprites/plan_art/fx/splash.png');
const BUNTING = require('../../assets/sprites/plan_art/fx/bunting.png');
const CRIER_LINES = [
  "Hear ye! The Salty Parrot pours the best grog on Tortuga!",
  "Search the barrels on the wharf - sailors drop all sorts.",
  "Cat Steps is the quickest way down to the harbour!",
  "Rumour says there's treasure buried past the Old Landing...",
  "Wanted! Pirates with a ship of their own - ask at the docks.",
  "Market day comes round every seventh day. Bargains aplenty!",
  "Mind the cliffs past the lighthouse after dark.",
  "The smithy on Tanners' Row sharpens a cutlass for a few coins.",
];
const TRADERS = ['tortuga_amb_cook', 'patron_tortuga_local', 'tortuga_amb_lass', 'patron_tortuga_mystic', 'tortuga_amb_sailor', 'patron_tortuga_drunk'];
export function isMarketDay(t = Date.now() / 1000) {
  return Math.floor(t / CYCLE_SECONDS) % 7 === 3 || (typeof window !== 'undefined' && /[?&]market=1/.test(window.location?.search ?? ''));
}
export const SquareLife = React.memo(function SquareLife({ origin, cam, player }: { origin: { x: number; y: number }; cam: { x: number; y: number }; player: { x: number; y: number } }) {
  const t = useClock(120);
  const ox = origin.x;
  const oy = origin.y;
  const [bl, bt, br, bb] = WORLD_SQUARE.bounds;
  if (cam.x < ox + bl - 160 || cam.x > ox + br + 160 || cam.y < oy + bt - 200 || cam.y > oy + bb + 200) return null;
  const market = isMarketDay(t);
  const out: React.ReactNode[] = [];
  const person = (key: string, id: string, x: number, y: number, bob = 0) => {
    const sp = NPC_SPRITES[id] ?? FOLK[0];
    if (!sp) return;
    const h = FOLK_H;
    const w = h * sp.aspect;
    out.push(<Image key={key} source={sp.src} resizeMode="stretch" style={{ position: 'absolute', left: ox + x - w / 2, top: oy + y - h + bob, width: w, height: h }} />);
  };
  // bunting: strung corner to corner round the square, and across it on market day
  const L = WORLD_SQUARE.lamps;
  // one strand along the tavern side of the square; on market day a second along the far side
  const byY = [...L].sort((a, b) => a[1] - b[1]);
  const north = byY.slice(0, 2).sort((a, b) => a[0] - b[0]);
  const south = byY.slice(-2).sort((a, b) => a[0] - b[0]);
  const pairs: [number[], number[]][] = L.length >= 4 ? [[north[0], north[1]]] : [];
  if (market && L.length >= 4) pairs.push([south[0], south[1]]);
  pairs.forEach(([a, b], i) => {
    const ax = a[0], ay = a[1] - 7, bx = b[0], by = b[1] - 7;
    const len = Math.hypot(bx - ax, by - ay);
    const ang = (Math.atan2(by - ay, bx - ax) * 180) / Math.PI;
    out.push(<Image key={`bn${i}`} source={BUNTING} resizeMode="repeat"
      style={{ position: 'absolute', left: ox + (ax + bx) / 2 - len / 2, top: oy + (ay + by) / 2 - 0.5 + Math.sin(t * 2 + i) * 0.15, width: len, height: 1.6, transform: [{ rotate: `${ang}deg` }] }} />);
  });
  // traders behind every stall, shoppers drifting from stall to stall
  const stalls = [...WORLD_SQUARE.stalls];
  if (market) {
    const [fx, fy] = WORLD_SQUARE.fountain;
    for (const [dx, dy] of [[-28, 16], [28, 16]]) stalls.push([fx + dx, fy + dy]);
    const stall = OBJ_ASSETS['stall_0'];
    stalls.slice(WORLD_SQUARE.stalls.length).forEach(([x, y], i) => {
      if (!stall) return;
      const w = 18;
      const h = w * stall.aspect;
      out.push(<Image key={`ms${i}`} source={stall.src} resizeMode="stretch" style={{ position: 'absolute', left: ox + x - w / 2, top: oy + y - h, width: w, height: h }} />);
    });
  }
  stalls.forEach(([x, y], i) => person(`tr${i}`, TRADERS[i % TRADERS.length], x + 2, y - 6, Math.sin(t * 1.6 + i) * 0.15));
  const shoppers = market ? 9 : 4;
  for (let k = 0; k < shoppers; k++) {
    const s0 = stalls[(Math.floor(t / 9 + k * 1.7) + k) % stalls.length];
    if (!s0) continue;
    person(`sh${k}`, FOLK_IDS[(k + 2) % FOLK_IDS.length], s0[0] + (k % 2 ? -4 : 4), s0[1] + 5, 0);
  }
  // the fountain: splashes where the water falls, and a town crier beside it with a tip when you're near
  const [fx, fy] = WORLD_SQUARE.fountain;
  for (let i = 0; i < 6; i++) {
    const ph = (t * 1.4 + i * 0.37) % 1;
    const x = fx + [-8, -5, 5, 8, -2, 2][i];
    out.push(<Image key={`sp${i}`} source={SPLASH} resizeMode="stretch"
      style={{ position: 'absolute', left: ox + x - 1.4, top: oy + fy - 8.5 - ph * 1.2, width: 2.8, height: 1.4, opacity: 1 - ph }} />);
  }
  const cx = fx + 19, cy = fy + 3;
  person('crier', 'tortuga_tavern:main', cx, cy, Math.abs(Math.sin(t * 3)) * -0.4);
  let say: React.ReactNode = null;
  if (Math.hypot(player.x - (ox + cx), player.y - (oy + cy)) < 18) {
    const line = CRIER_LINES[Math.floor(t / 7) % CRIER_LINES.length];
    say = (
      <View key="crierSay" pointerEvents="none"
        style={{ position: 'absolute', left: ox + cx - 160, top: oy + cy - FOLK_H - 6 - 60, width: 320, height: 120, justifyContent: 'flex-end', transform: [{ scale: 0.065 }] }}>
        <View style={{ backgroundColor: 'rgba(250,240,214,0.95)', borderRadius: 14, borderWidth: 3, borderColor: '#5a3a1e', padding: 12 }}>
          <Text style={{ fontSize: 26, color: '#2a1a0c', fontWeight: '700', textAlign: 'center' }}>{line}</Text>
        </View>
      </View>
    );
  }
  // pigeons pecking on the cobbles; they burst away when Scally comes close, and settle again later
  for (let i = 0; i < (market ? 6 : 12); i++) {
    const hx = bl + 10 + ((i * 37) % Math.max(1, br - bl - 20));
    const hy = bt + 12 + ((i * 23) % Math.max(1, bb - bt - 24));
    const d = Math.hypot(player.x - (ox + hx), player.y - (oy + hy));
    const flying = d < 9;
    const fx2 = flying ? hx + (hx - (player.x - ox)) * 2.5 : hx + Math.sin(t * 0.7 + i) * 1.2;
    const fy2 = flying ? hy - 14 : hy;
    const fr = PIGEON[flying ? Math.floor(t * 10 + i) % 2 : Math.floor(t * 1.5 + i) % 4 === 0 ? 1 : 0];
    out.push(<Image key={`pg${i}`} source={fr} resizeMode="stretch" style={{ position: 'absolute', left: ox + fx2 - 1.2, top: oy + fy2 - 1.9, width: 2.4, height: 1.9, opacity: flying ? 0.85 : 1 }} />);
  }
  if (say) out.push(say);
  return <>{out}</>;
});
const FOLK_IDS = ['tortuga_amb_sailor', 'tortuga_amb_cook', 'tortuga_amb_lass', 'patron_tortuga_local', 'patron_tortuga_drunk', 'patron_tortuga_rival', 'patron_tortuga_mystic'];

// ---------------------------------------------------------------- name boards
// A carved board with the building's name over its door, shown only when Scally is close (the hanging
// trade sign beside the door tells you what it is from further off). Names come from the game's
// building list, so they are always spelt right and can change without repainting anything.
const NAMED_DOORS = BP_DOORS.map((d) => ({ ...d, name: BUILDINGS.find((b) => b.id === d.id)?.name })).filter((d) => !!d.name) as {
  id: string; x: number; y: number; name: string;
}[];
const BOARD_NEAR = 22; // world units
const GLYPH_H = 1.55;
export const NameBoards = React.memo(function NameBoards({ origin, player }: { origin: { x: number; y: number }; player: { x: number; y: number } }) {
  const rx = player.x - origin.x;
  const ry = player.y - origin.y;
  return (
    <>
      {NAMED_DOORS.filter((d) => Math.abs(d.x - rx) < BOARD_NEAR && Math.abs(d.y - ry) < BOARD_NEAR && Math.hypot(d.x - rx, d.y - ry) < BOARD_NEAR).map((d) => {
        const chars = nameplateChars(d.name);
        // laid out at 10x and scaled down: inside the zoomed world, sizes under one unit round off on web
        const K = 10;
        const gh = GLYPH_H * K;
        const gap = gh * NAMEPLATE_LETTER_GAP_FRACTION;
        const textW = chars.reduce((a, c) => a + (c === 'space' ? gh * NAMEPLATE_SPACE_FRACTION : gh * c.aspect + gap), 0);
        const w = Math.round(textW + 24);
        const h = Math.round(gh + 13);
        let x = 12;
        const glyphs = chars.map((c, i) => {
          if (c === 'space') { x += gh * NAMEPLATE_SPACE_FRACTION; return null; }
          const gw = gh * c.aspect;
          const el = <Image key={i} source={c.source} resizeMode="stretch" style={{ position: 'absolute', left: Math.round(x), top: Math.round((h - gh) / 2), width: Math.round(gw), height: Math.round(gh) }} />;
          x += gw + gap;
          return el;
        });
        const cx = origin.x + d.x;
        const cy = origin.y + d.y - 8.5 - h / K / 2;
        return (
          <View key={d.id} pointerEvents="none"
            style={{ position: 'absolute', left: cx - w / 2, top: cy - h / 2, width: w, height: h, transform: [{ scale: 1 / K }] }}>
            <Image source={UI_NAMEPLATE_BOARD} resizeMode="stretch" style={{ position: 'absolute', left: 0, top: 0, width: w, height: h }} />
            {glyphs}
          </View>
        );
      })}
    </>
  );
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

/** Seconds until the next shower starts (0 while it's raining). */
export function rainIn(t = Date.now() / 1000) {
  const f = (t % RAIN_CYCLE) / RAIN_CYCLE;
  return f >= 0.88 ? 0 : (0.88 - f) * RAIN_CYCLE;
}

export function WeatherMood({ rel, viewport }: { rel: { x: number; y: number }; viewport: { width: number; height: number } }) {
  const t = useClock(90);
  const rain =
    typeof window !== 'undefined' && typeof window.location !== 'undefined' && /[?&]rain=1/.test(window.location.search ?? '') ? 1 : /[?&]rain=soon/.test(window.location.search ?? '') ? 0 : rainAmount(t);
  // district mood, faded by distance from each district's heart
  const near = (x: number, y: number, r: number) => Math.max(0, Math.min(1, 1 - (Math.hypot(rel.x - x, rel.y - y) - r * 0.5) / r));
  const town = rel.x > -150 && rel.x < 300 && rel.y > -460 && rel.y < 30 ? 1 : 0;
  const woods = near(495, 0, 110);
  const hollow = near(-20, 240, 90);
  // the build-up: the sky greys and the wind picks up in the minute before a shower
  const forceSoon = typeof window !== 'undefined' && typeof window.location !== 'undefined' && /[?&]rain=soon/.test(window.location.search ?? '');
  const soon = forceSoon ? 0.1 : rainIn(t);
  const gloom = rain > 0.02 ? 0 : soon < 60 ? 1 - soon / 60 : 0;
  const drops: React.ReactNode[] = [];
  if (gloom > 0) {
    for (let i = 0; i < 10; i++) {
      // gusts: a few pale streaks blowing across the screen
      const sx = ((hash(i + 300) * viewport.width + t * 220) % (viewport.width + 80)) - 40;
      const sy = hash(i + 320) * viewport.height;
      drops.push(<View key={`g${i}`} style={{ position: 'absolute', left: sx, top: sy, width: 26 + hash(i) * 30, height: 1, backgroundColor: 'rgba(235,240,245,0.35)', opacity: gloom }} />);
    }
  }
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
      {gloom > 0 && <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgb(60,70,90)', opacity: 0.14 * gloom }]} />}
      {gloom > 0.15 && (
        <View style={{ position: 'absolute', bottom: 24, left: 24, right: 24, alignItems: 'center', backgroundColor: 'rgba(30,24,16,0.85)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#c9a24a', opacity: Math.min(1, gloom * 2) }}>
          <Text style={{ color: '#f1e2b8', fontWeight: '700', fontSize: 14, textAlign: 'center' }}>⛈ Storm coming — the wind's picking up</Text>
        </View>
      )}
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
