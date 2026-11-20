/** Draws TownScene data (townScene.ts) as React Native views. */
import React from 'react';
import { Image as RNImage, View } from 'react-native';
import type { GroundTile, SceneDecal, SceneSprite } from './townScene';

/** One ground cell: clipped so partial tiles at an area's edge never stretch. */
export function renderGroundTile(g: GroundTile) {
  return (
    <View key={g.key} style={{ position: 'absolute', left: g.left, top: g.top, width: g.w + 0.3, height: g.h + 0.3, overflow: 'hidden' }}>
      <RNImage source={g.source} resizeMode="stretch" style={{ width: g.size + 0.3, height: g.size + 0.3 }} />
    </View>
  );
}

/** One depth-sorted scene sprite (strips are clipped to their partial length). */
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

/** A flat ground image (baked ground chunk, pier deck). */
export function renderDecal(d: SceneDecal) {
  return <RNImage key={d.key} source={d.source} resizeMode="stretch" style={{ position: 'absolute', left: d.left, top: d.top, width: d.w + 0.15, height: d.h + 0.15 }} />;
}
