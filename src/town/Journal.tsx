/**
 * The ship's journal (everything found and still open on Tortuga) and the guidance arrow that
 * circles Scally pointing at whatever you're tracking — GTA 1's mission arrow, pirate-flavoured.
 */
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import {
  BP_BOTTLES,
  BP_DIGS,
  BP_DISTRICT_CENTRES,
  BP_ERRANDS,
  BP_SKULLS,
  BP_VIEWPOINTS,
} from '../blueprint/tortugaGameplay.generated';
import { RESOURCES } from '../data/resources';

export type TrackKind = 'errand' | 'dig' | 'district' | 'view';
export interface TrackTarget {
  kind: TrackKind;
  id: string;
  label: string;
  /** Island-relative position on Tortuga. */
  x: number;
  y: number;
}
export const TRACK_COLOURS: Record<TrackKind, string> = {
  errand: '#b06ad6',
  dig: '#f2c230',
  district: '#ff8c42',
  view: '#4fd1b5',
};

interface Progress {
  completedErrands: string[];
  dugSpots: string[];
  seenClues: string[];
  foundSkulls: string[];
  readBottles: string[];
  discoveredDistricts: string[];
  resources: Record<string, number>;
  ferryUnlocked: boolean;
}

/** What to point at when nothing is tracked: the nearest errand you can hand in, else the nearest open one. */
export function autoTarget(p: Progress, at: { x: number; y: number }): TrackTarget | null {
  const open = BP_ERRANDS.filter((e) => !p.completedErrands.includes(e.id));
  if (!open.length) return null;
  const ready = open.filter((e) => (p.resources[e.resource] ?? 0) >= e.amount);
  const pool = ready.length ? ready : open;
  const e = pool.reduce((a, b) => (Math.hypot(a.x - at.x, a.y - at.y) <= Math.hypot(b.x - at.x, b.y - at.y) ? a : b));
  return { kind: 'errand', id: e.id, label: `${e.person}${ready.length ? ' (ready to hand in)' : ''}`, x: e.x, y: e.y };
}

/** True once the tracked thing is done (so the arrow moves on). */
export function targetDone(t: TrackTarget, p: Progress) {
  if (t.kind === 'errand') return p.completedErrands.includes(t.id);
  if (t.kind === 'dig') return p.dugSpots.includes(t.id);
  if (t.kind === 'district') return p.discoveredDistricts.includes(t.id);
  return false;
}

const ARROWS_R = 92;
/** The arrow round the player (screen centre). Hidden once the target is close. */
export function TrackerArrow({
  target,
  rel,
  centre,
}: {
  target: TrackTarget | null;
  rel: { x: number; y: number } | null;
  centre: { x: number; y: number };
}) {
  if (!target || !rel) return null;
  const dx = target.x - rel.x;
  const dy = target.y - rel.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 14) return null;
  const a = Math.atan2(dy, dx);
  const col = TRACK_COLOURS[target.kind];
  const ax = centre.x + Math.cos(a) * ARROWS_R;
  const ay = centre.y + Math.sin(a) * ARROWS_R;
  const lx = centre.x + Math.cos(a) * (ARROWS_R - 4);
  const ly = centre.y + Math.sin(a) * (ARROWS_R - 4) + 30;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View
        style={[
          styles.arrow,
          { left: ax - 24, top: ay - 24, transform: [{ rotate: `${a}rad` }] },
        ]}
      >
        <Svg width={48} height={48} viewBox="0 0 36 36">
          <Path d="M33 18 L6 4 L12 18 L6 32 Z" fill={col} stroke="#1b120a" strokeWidth={2.5} strokeLinejoin="round" />
        </Svg>
      </View>
      <View style={[styles.arrowLabel, { left: lx - 60, top: ly - 11, borderColor: col }]}>
        <Text style={styles.arrowLabelText} numberOfLines={1}>
          {Math.max(1, Math.round(dist / 5) * 5)} paces
        </Text>
      </View>
    </View>
  );
}

function Row({ done, text, onTrack }: { done?: boolean; text: string; onTrack?: () => void }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowText, done && styles.rowDone]}>
        {done ? '✓ ' : '• '}
        {text}
      </Text>
      {onTrack && !done && (
        <Pressable style={styles.trackBtn} onPress={onTrack} hitSlop={6}>
          <Text style={styles.trackBtnText}>➤ Track</Text>
        </Pressable>
      )}
    </View>
  );
}

export function JournalPanel({
  progress,
  tracked,
  onTrack,
  onClose,
}: {
  progress: Progress;
  tracked: TrackTarget | null;
  onTrack: (t: TrackTarget | null) => void;
  onClose: () => void;
}) {
  const p = progress;
  const errandsDone = BP_ERRANDS.filter((e) => p.completedErrands.includes(e.id)).length;
  const digsDone = BP_DIGS.filter((d) => p.dugSpots.includes(d.id)).length;
  const unseen = BP_DISTRICT_CENTRES.filter((d) => !p.discoveredDistricts.includes(d.name));
  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <Text style={styles.title}>📖 Ship's journal — Tortuga</Text>
        <Pressable onPress={onClose} hitSlop={8}>
          <Text style={styles.close}>✕</Text>
        </Pressable>
      </View>
      <Text style={styles.tracking}>
        Tracking: {tracked ? tracked.label : 'nearest errand (automatic)'}
        {tracked ? '  ' : ''}
      </Text>
      {tracked && (
        <Pressable onPress={() => onTrack(null)} hitSlop={6}>
          <Text style={styles.link}>Back to automatic</Text>
        </Pressable>
      )}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 12 }}>
        <Text style={styles.section}>
          Errands {errandsDone}/{BP_ERRANDS.length}
        </Text>
        {BP_ERRANDS.map((e) => {
          const res = RESOURCES[e.resource as keyof typeof RESOURCES];
          return (
            <Row
              key={e.id}
              done={p.completedErrands.includes(e.id)}
              text={`${e.person} (${e.district}) wants ${e.amount} ${res?.emoji ?? ''} ${res?.name ?? e.resource}`}
              onTrack={() => onTrack({ kind: 'errand', id: e.id, label: e.person, x: e.x, y: e.y })}
            />
          );
        })}

        <Text style={styles.section}>
          Buried treasure {digsDone}/{BP_DIGS.length}
        </Text>
        {BP_DIGS.map((d) =>
          p.dugSpots.includes(d.id) ? (
            <Row key={d.id} done text={`Dug up ${d.gold} gold by ${d.landmark}`} />
          ) : p.seenClues.includes(d.id) ? (
            <Row
              key={d.id}
              text={`${d.landmark}: ${d.clue}`}
              onTrack={() => onTrack({ kind: 'dig', id: d.id, label: `Clue at ${d.landmark}`, x: d.lx, y: d.ly })}
            />
          ) : (
            <Row key={d.id} text="??? — find the clue first (bottles help)" />
          )
        )}

        <Text style={styles.section}>
          Carved skulls {p.foundSkulls.length}/{BP_SKULLS.length}
        </Text>
        <Text style={styles.rowText}>
          {p.foundSkulls.length ? `Found in: ${p.foundSkulls.join(', ')}` : 'None yet. One is hidden in every district.'}
        </Text>

        <Text style={styles.section}>
          Messages in bottles {p.readBottles.length}/{BP_BOTTLES.length}
        </Text>
        {BP_BOTTLES.map((b, i) =>
          p.readBottles.includes(`bottle_${i}`) ? <Row key={i} done text={b.text} /> : null
        )}
        {!p.readBottles.length && <Text style={styles.rowText}>Walk the beaches.</Text>}

        <Text style={styles.section}>
          Districts {BP_DISTRICT_CENTRES.length - unseen.length}/{BP_DISTRICT_CENTRES.length}
        </Text>
        {unseen.map((d) => (
          <Row
            key={d.name}
            text={`${d.name} — unexplored`}
            onTrack={() => onTrack({ kind: 'district', id: d.name, label: d.name, x: d.x, y: d.y })}
          />
        ))}

        <Text style={styles.section}>Viewpoints</Text>
        {BP_VIEWPOINTS.map((v) => (
          <Row
            key={v.name}
            done={v.districts.every((d) => p.discoveredDistricts.includes(d))}
            text={v.name}
            onTrack={() => onTrack({ kind: 'view', id: v.name, label: v.name, x: v.x, y: v.y })}
          />
        ))}

        <Text style={styles.section}>Rowboat taxi</Text>
        <Text style={styles.rowText}>
          {p.ferryUnlocked ? '✓ Unlocked — 2 gold a trip between the jetties.' : "Locked — Old Kessler at the Boat-Builder's Yard wants timber."}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  arrow: { position: 'absolute', width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  arrowGlyph: {
    fontSize: 34,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.95)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  arrowLabel: {
    position: 'absolute',
    width: 120,
    alignItems: 'center',
    backgroundColor: 'rgba(20,14,8,0.72)',
    borderRadius: 9,
    borderWidth: 1.5,
    paddingVertical: 2,
  },
  arrowLabelText: { color: '#f4e9cd', fontSize: 12, fontWeight: '800' },
  panel: {
    position: 'absolute',
    top: 66,
    bottom: 12,
    left: 12,
    right: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(36,24,14,0.97)',
    borderWidth: 2,
    borderColor: '#c9a227',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: '#f4e9cd', fontSize: 17, fontWeight: '900' },
  close: { color: '#f4e9cd', fontSize: 18, fontWeight: '800' },
  tracking: { color: '#ffd166', fontSize: 13, fontWeight: '700', marginTop: 6 },
  link: { color: '#7fb3e0', fontSize: 13, fontWeight: '700', textDecorationLine: 'underline', marginTop: 2 },
  section: { color: '#ffd166', fontSize: 15, fontWeight: '900', marginTop: 12, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 2, gap: 8 },
  rowText: { color: '#f4e9cd', fontSize: 13, flexShrink: 1 },
  rowDone: { opacity: 0.55 },
  trackBtn: { backgroundColor: '#c9a227', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  trackBtnText: { color: '#24180e', fontSize: 12, fontWeight: '800' },
});
