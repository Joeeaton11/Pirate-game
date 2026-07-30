import React from 'react';
import { View } from 'react-native';

interface Point {
  x: number;
  y: number;
}

/** Renders a straight connecting line between two points inside an absolutely-positioned container. */
export function MapLine({ from, to }: { from: Point; to: Point }) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);

  return (
    <View
      style={{
        position: 'absolute',
        left: from.x,
        top: from.y - 1,
        width: length,
        height: 2,
        backgroundColor: 'rgba(224, 214, 180, 0.45)',
        transform: [{ rotate: `${angle}rad` }],
        transformOrigin: '0% 50%',
      }}
    />
  );
}
