/**
 * Art mode's sprites: one image per art slot on Tortuga's plan (buildings, homes, trees, props),
 * back to front. Which image an asset uses lives in tortugaArtSlots.generated.ts — today stand-ins
 * from the sprite library, later the new consistent art — so swapping art never moves anything.
 */
import React from 'react';
import { Image } from 'react-native';
import { ART_ASSETS, ART_SLOTS } from './tortugaArtSlots.generated';

const MARGIN_X = 420;
const MARGIN_Y = 520;

export const ArtSprites = React.memo(function ArtSprites({
  origin,
  cam,
  all,
  occludeFor,
}: {
  origin: { x: number; y: number };
  /** Coarse camera centre (world); only nearby slots are mounted unless `all`. */
  cam: { x: number; y: number };
  all?: boolean;
  /** Occluder pass: only the sprites standing in front of this world point and covering it,
   *  drawn again above the player so walking behind a building or tower hides them. */
  occludeFor?: { x: number; y: number };
}) {
  return (
    <>
      {ART_SLOTS.map(([aid, x, y, w], i) => {
        const a = ART_ASSETS[aid];
        if (!a) return null;
        const wx = origin.x + x;
        const wy = origin.y + y;
        if (!all && (Math.abs(wx - cam.x) > MARGIN_X || Math.abs(wy - cam.y) > MARGIN_Y)) return null;
        const h = w * a.aspect;
        if (occludeFor) {
          const p = occludeFor;
          if (!(wy > p.y + 0.5 && wy - h < p.y + 4 && Math.abs(p.x - wx) < w / 2 + 2)) return null;
        }
        return (
          <Image
            key={i}
            source={a.src}
            resizeMode="stretch"
            style={{ position: 'absolute', left: wx - w / 2, top: wy - h, width: w, height: h }}
          />
        );
      })}
    </>
  );
});
