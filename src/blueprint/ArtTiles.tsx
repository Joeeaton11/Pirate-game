/** Art mode's base map (painted from the plan, pixel style), drawn as tiles; only nearby tiles mount. */
import React from 'react';
import { Image } from 'react-native';
import { ART_TILES } from './tortugaArtTiles.generated';

export const ArtTiles = React.memo(function ArtTiles({
  origin,
  cam,
  all,
}: {
  origin: { x: number; y: number };
  cam: { x: number; y: number };
  all?: boolean;
}) {
  return (
    <>
      {ART_TILES.map((t, i) => {
        const l = origin.x + t.l;
        const tp = origin.y + t.t;
        if (!all && (l > cam.x + 700 || l + t.w < cam.x - 700 || tp > cam.y + 800 || tp + t.h < cam.y - 800)) return null;
        return (
          <Image
            key={i}
            source={t.src}
            resizeMode="stretch"
            style={{ position: 'absolute', left: l, top: tp, width: t.w + 0.4, height: t.h + 0.4 }}
          />
        );
      })}
    </>
  );
});
