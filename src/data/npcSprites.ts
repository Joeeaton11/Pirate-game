/**
 * Pixel-art sprites for the characters you meet inside buildings (painted 2026-11-20 in Scally's
 * style, one picture per character, green-keyed and trimmed to 128 px tall). Keyed by NPC spot id;
 * a building's own keeper is keyed '<buildingId>:main'. Anyone not listed still shows as an emoji.
 */
import { ImageSourcePropType } from 'react-native';

export interface NpcSprite { src: ImageSourcePropType; aspect: number }

export const NPC_SPRITES: Record<string, NpcSprite> = {
  'tortuga_tavern:main': { src: require('../../assets/sprites/characters/npcs/old_tom.png'), aspect: 0.672 },
  'patron_tortuga_local': { src: require('../../assets/sprites/characters/npcs/barmaid_ross.png'), aspect: 0.562 },
  'patron_tortuga_drunk': { src: require('../../assets/sprites/characters/npcs/wobbly_pete.png'), aspect: 0.617 },
  'patron_tortuga_rival': { src: require('../../assets/sprites/characters/npcs/scar_faced_odom.png'), aspect: 0.523 },
  'patron_tortuga_mystic': { src: require('../../assets/sprites/characters/npcs/mother_yew.png'), aspect: 0.500 },
  'tortuga_amb_sailor': { src: require('../../assets/sprites/characters/npcs/sailor.png'), aspect: 0.523 },
  'tortuga_amb_cook': { src: require('../../assets/sprites/characters/npcs/cook.png'), aspect: 0.625 },
  'tortuga_amb_lass': { src: require('../../assets/sprites/characters/npcs/lass.png'), aspect: 0.438 },
};
