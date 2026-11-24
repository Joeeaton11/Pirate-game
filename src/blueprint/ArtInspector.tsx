/**
 * Art inspector (Art mode): walk up to anything and it lists the art assets right around you — the
 * asset id, what it is, hero or kit, size, how many copies are on the map, its priority, whether it
 * is painted yet and where its guide image is. Also flips between the painted and code looks, and
 * shows how much of the island is painted.
 */
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ART_SLOTS } from './tortugaArtSlots.generated';
import { OBJ_SLOTS } from './artObjects.generated';
import { LIFE_CRITTERS, LIFE_SPRITES } from './artLife.generated';
import { ART_MANIFEST, ART_PROGRESS } from './artManifest.generated';
import { setArtShowsCode, useArtShowsCode } from './artLook';

const PLACES: [string, number, number][] = [
  ...ART_SLOTS.map(([a, x, y]) => [a, x, y] as [string, number, number]),
  ...OBJ_SLOTS.map(([a, x, y]) => [a, x, y] as [string, number, number]),
  ...LIFE_CRITTERS.filter(([k]) => LIFE_SPRITES[k]).map(([k, x, y]) => [`${k}_0`, x, y] as [string, number, number]),
];

export function ArtInspector({
  origin,
  player,
  onClose,
}: {
  origin: { x: number; y: number };
  player: { x: number; y: number };
  onClose: () => void;
}) {
  const showCode = useArtShowsCode();
  // re-sort only when the player has moved a couple of units
  const px = Math.round(player.x / 2);
  const py = Math.round(player.y / 2);
  const near = useMemo(() => {
    const seen = new Set<string>();
    return PLACES.map(([a, x, y]) => ({ a, d: Math.hypot(origin.x + x - player.x, origin.y + y - player.y) }))
      .filter((p) => p.d < 30)
      .sort((p, q) => p.d - q.d)
      .filter((p) => (seen.has(p.a) ? false : (seen.add(p.a), true)))
      .slice(0, 6);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [px, py]);
  const pct = Math.round((ART_PROGRESS.done / Math.max(1, ART_PROGRESS.total)) * 100);
  return (
    <View style={styles.panel}>
      <View style={styles.head}>
        <Text style={styles.title}>🔍 Art inspector</Text>
        <Pressable onPress={onClose} hitSlop={8}>
          <Text style={styles.close}>✕</Text>
        </Pressable>
      </View>
      <View style={styles.bar}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.prog}>
        {ART_PROGRESS.done} of {ART_PROGRESS.total} assets painted
      </Text>
      <Pressable style={styles.switch} onPress={() => setArtShowsCode(!showCode)}>
        <Text style={styles.switchText}>Showing: {showCode ? 'code placeholders' : 'painted art (where painted)'} · tap to flip</Text>
      </Pressable>
      <ScrollView style={{ maxHeight: 150 }}>
        {near.length === 0 && <Text style={styles.empty}>Walk up to something to see its asset.</Text>}
        {near.map(({ a, d }) => {
          const m = ART_MANIFEST[a];
          if (!m) return null;
          const [group, label, hero, w, count, pri, painted, guide] = m;
          return (
            <View key={a} style={styles.row}>
              <Text style={styles.label} numberOfLines={1}>
                {label}
              </Text>
              <Text style={styles.id}>{a}</Text>
              <Text style={styles.meta}>
                {group} · {hero ? 'hero' : 'kit'} · {w} units wide · {count} on map · priority {pri} · {painted ? 'painted' : 'to paint'} ·{' '}
                {Math.round(d)} away
              </Text>
              <Text style={styles.path}>{guide}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 10,
    backgroundColor: 'rgba(43,33,24,0.94)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#c9a227',
  },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: '#f6f1e4', fontWeight: '700', fontSize: 16 },
  close: { color: '#f6f1e4', fontSize: 18 },
  bar: { height: 8, backgroundColor: '#4a3b2c', borderRadius: 4, marginTop: 8, overflow: 'hidden' },
  fill: { height: 8, backgroundColor: '#c9a227' },
  prog: { color: '#e6dcc6', fontSize: 12, marginTop: 4 },
  switch: { marginTop: 8, backgroundColor: '#4a3b2c', borderRadius: 8, padding: 8 },
  switchText: { color: '#f6f1e4', fontSize: 13 },
  empty: { color: '#e6dcc6', marginTop: 8 },
  row: { marginTop: 8, borderTopWidth: 1, borderTopColor: '#4a3b2c', paddingTop: 6 },
  label: { color: '#f6f1e4', fontWeight: '600', textTransform: 'capitalize' },
  id: { color: '#c9a227', fontFamily: 'monospace', fontSize: 12 },
  meta: { color: '#e6dcc6', fontSize: 12 },
  path: { color: '#a89a84', fontSize: 11, fontFamily: 'monospace' },
});
