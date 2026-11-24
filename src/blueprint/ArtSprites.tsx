/**
 * Art mode's sprites: one image per art slot on Tortuga's plan (buildings, homes, trees, props),
 * back to front. Which image an asset uses lives in tortugaArtSlots.generated.ts — today stand-ins
 * from the sprite library, later the new consistent art — so swapping art never moves anything.
 */
import React from 'react';
import { Image } from 'react-native';
import { ART_ASSETS, ART_SLOTS } from './tortugaArtSlots.generated';
import { OBJ_ASSETS, OBJ_SLOTS } from './artObjects.generated';
import { useArtShowsCode } from './artLook';

const MARGIN_X = 420;
const MARGIN_Y = 520;
// trees, rocks and props are many and small: mount only those within reach of the (coarse) camera
const OBJ_MARGIN_X = 160;
const OBJ_MARGIN_Y = 200;

const ASSETS = { ...ART_ASSETS, ...OBJ_ASSETS };
/** Buildings and objects in one back-to-front list: [asset, x, ground y, width, isObject]. */
const SLOTS: [string, number, number, number, boolean][] = [
  ...ART_SLOTS.map(([a, x, y, w]) => [a, x, y, w, false] as [string, number, number, number, boolean]),
  ...OBJ_SLOTS.map(([a, x, y, w]) => [a, x, y, w, true] as [string, number, number, number, boolean]),
].sort((p, q) => p[2] - q[2]);

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
  const code = useArtShowsCode();
  return (
    <>
      {SLOTS.map(([aid, x, y, w, isObj], i) => {
        const a = ASSETS[aid];
        if (!a) return null;
        const wx = origin.x + x;
        const wy = origin.y + y;
        if (isObj && all && !/^(jungle|tree|palm|mangrove|rock|dead_tree)_/.test(aid)) return null; // the overview shows trees, not every barrel
        if (!all && (Math.abs(wx - cam.x) > (isObj ? OBJ_MARGIN_X : MARGIN_X) || Math.abs(wy - cam.y) > (isObj ? OBJ_MARGIN_Y : MARGIN_Y))) return null;
        const useCode = code && !!a.code;
        const h = w * (useCode ? a.codeAspect ?? a.aspect : a.aspect);
        if (occludeFor) {
          const p = occludeFor;
          if (!(wy > p.y + 0.5 && wy - h < p.y + 4 && Math.abs(p.x - wx) < w / 2 + 2)) return null;
        }
        return (
          <Image
            key={i}
            source={useCode ? a.code : a.src}
            resizeMode="stretch"
            style={{ position: 'absolute', left: wx - w / 2, top: wy - h, width: w, height: h, opacity: occludeFor ? 0.72 : 1 }}
          />
        );
      })}
    </>
  );
});
