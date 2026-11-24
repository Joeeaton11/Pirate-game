/**
 * Tavern furniture kit (2026-11-20): one painted picture per piece, colour-matched to The Salty
 * Parrot and given a soft floor shadow. Sizes are room units (painted rooms are 360 across).
 * Place pieces in a room's `props` list by centre x and bottom y; flip mirrors a piece.
 */
import { ImageSourcePropType } from 'react-native';

export interface KitPiece { src: ImageSourcePropType; w: number; h: number }

export const ROOM_KIT: Record<string, KitPiece> = {
  table: { src: require('../../assets/sprites/interiors/kit/table.png'), w: 52, h: 48.5 },
  chair_front: { src: require('../../assets/sprites/interiors/kit/chair_front.png'), w: 25, h: 36.25 },
  chair_back: { src: require('../../assets/sprites/interiors/kit/chair_back.png'), w: 25, h: 31.5 },
  chair_side: { src: require('../../assets/sprites/interiors/kit/chair_side.png'), w: 25, h: 31.75 },
  stool: { src: require('../../assets/sprites/interiors/kit/stool.png'), w: 22, h: 20.5 },
  barrel: { src: require('../../assets/sprites/interiors/kit/barrel.png'), w: 27, h: 31 },
  crates: { src: require('../../assets/sprites/interiors/kit/crates.png'), w: 32, h: 34.75 },
  /** A local sat at the bar, seen from behind (stool included). */
  bar_red: { src: require('../../assets/sprites/interiors/kit/bar_red.png'), w: 24.6, h: 40 },
  /** A local sat at the bar, seen from behind (stool included). */
  bar_deckhand: { src: require('../../assets/sprites/interiors/kit/bar_deckhand.png'), w: 20.7, h: 40 },
  /** A local sat at the bar, seen from behind (stool included). */
  bar_old: { src: require('../../assets/sprites/interiors/kit/bar_old.png'), w: 24.3, h: 40 },
};
