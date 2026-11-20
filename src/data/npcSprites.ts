/**
 * Pixel-art sprites for the characters you meet inside buildings (painted 2026-11-20 in Scally's
 * style, one picture per character, green-keyed and trimmed to 128 px tall; side-view walk cycles cut
 * from one animation video each with tools/sprites/video_to_frames.py, same as Scally's). Keyed by NPC spot id;
 * a building's own keeper is keyed '<buildingId>:main'. Anyone not listed still shows as an emoji.
 */
import { ImageSourcePropType } from 'react-native';

export interface NpcSprite {
  src: ImageSourcePropType;
  aspect: number;
  /** Side-view walk cycle facing right, and the same frames mirrored (facing left). */
  walk?: ImageSourcePropType[];
  walkLeft?: ImageSourcePropType[];
  /** Walk frames sit on a shared canvas with headroom: width/height of that canvas, and how much
   * bigger to draw it so the figure matches the standing sprite's height. */
  walkAspect?: number;
  walkScale?: number;
  /** Sitting on a stool, facing the viewer (used at tables). */
  sit?: ImageSourcePropType;
  sitAspect?: number;
  /** Sitting side-on, facing right (on a chair beside a table); mirrored when facing left. */
  sitSide?: ImageSourcePropType;
  sitSideAspect?: number;
  /** Keeper's 'serving' pose, shown while the player stands at their counter. */
  pour?: ImageSourcePropType;
  pourAspect?: number;
}

export const NPC_SPRITES: Record<string, NpcSprite> = {
  'tortuga_tavern:main': { src: require('../../assets/sprites/characters/npcs/old_tom.png'), aspect: 0.672,
    walk: [require('../../assets/sprites/characters/npcs/walk/old_tom_walk_0.png'), require('../../assets/sprites/characters/npcs/walk/old_tom_walk_1.png'), require('../../assets/sprites/characters/npcs/walk/old_tom_walk_2.png'), require('../../assets/sprites/characters/npcs/walk/old_tom_walk_3.png'), require('../../assets/sprites/characters/npcs/walk/old_tom_walk_4.png'), require('../../assets/sprites/characters/npcs/walk/old_tom_walk_5.png'), require('../../assets/sprites/characters/npcs/walk/old_tom_walk_6.png'), require('../../assets/sprites/characters/npcs/walk/old_tom_walk_7.png')],
    walkLeft: [require('../../assets/sprites/characters/npcs/walk/old_tom_walkl_0.png'), require('../../assets/sprites/characters/npcs/walk/old_tom_walkl_1.png'), require('../../assets/sprites/characters/npcs/walk/old_tom_walkl_2.png'), require('../../assets/sprites/characters/npcs/walk/old_tom_walkl_3.png'), require('../../assets/sprites/characters/npcs/walk/old_tom_walkl_4.png'), require('../../assets/sprites/characters/npcs/walk/old_tom_walkl_5.png'), require('../../assets/sprites/characters/npcs/walk/old_tom_walkl_6.png'), require('../../assets/sprites/characters/npcs/walk/old_tom_walkl_7.png')],
    walkAspect: 112 / 128,
    walkScale: 128 / 108,
    pour: require('../../assets/sprites/characters/npcs/old_tom_pour.png'),
    pourAspect: 0.664,
  },
  'patron_tortuga_local': { src: require('../../assets/sprites/characters/npcs/barmaid_ross.png'), aspect: 0.562,
    walk: [require('../../assets/sprites/characters/npcs/walk/barmaid_ross_walk_0.png'), require('../../assets/sprites/characters/npcs/walk/barmaid_ross_walk_1.png'), require('../../assets/sprites/characters/npcs/walk/barmaid_ross_walk_2.png'), require('../../assets/sprites/characters/npcs/walk/barmaid_ross_walk_3.png'), require('../../assets/sprites/characters/npcs/walk/barmaid_ross_walk_4.png'), require('../../assets/sprites/characters/npcs/walk/barmaid_ross_walk_5.png'), require('../../assets/sprites/characters/npcs/walk/barmaid_ross_walk_6.png'), require('../../assets/sprites/characters/npcs/walk/barmaid_ross_walk_7.png')],
    walkLeft: [require('../../assets/sprites/characters/npcs/walk/barmaid_ross_walkl_0.png'), require('../../assets/sprites/characters/npcs/walk/barmaid_ross_walkl_1.png'), require('../../assets/sprites/characters/npcs/walk/barmaid_ross_walkl_2.png'), require('../../assets/sprites/characters/npcs/walk/barmaid_ross_walkl_3.png'), require('../../assets/sprites/characters/npcs/walk/barmaid_ross_walkl_4.png'), require('../../assets/sprites/characters/npcs/walk/barmaid_ross_walkl_5.png'), require('../../assets/sprites/characters/npcs/walk/barmaid_ross_walkl_6.png'), require('../../assets/sprites/characters/npcs/walk/barmaid_ross_walkl_7.png')],
    walkAspect: 112 / 128,
    walkScale: 128 / 108,
  },
  'patron_tortuga_drunk': { src: require('../../assets/sprites/characters/npcs/wobbly_pete.png'), aspect: 0.617,
    walk: [require('../../assets/sprites/characters/npcs/walk/wobbly_pete_walk_0.png'), require('../../assets/sprites/characters/npcs/walk/wobbly_pete_walk_1.png'), require('../../assets/sprites/characters/npcs/walk/wobbly_pete_walk_2.png'), require('../../assets/sprites/characters/npcs/walk/wobbly_pete_walk_3.png'), require('../../assets/sprites/characters/npcs/walk/wobbly_pete_walk_4.png'), require('../../assets/sprites/characters/npcs/walk/wobbly_pete_walk_5.png'), require('../../assets/sprites/characters/npcs/walk/wobbly_pete_walk_6.png'), require('../../assets/sprites/characters/npcs/walk/wobbly_pete_walk_7.png')],
    walkLeft: [require('../../assets/sprites/characters/npcs/walk/wobbly_pete_walkl_0.png'), require('../../assets/sprites/characters/npcs/walk/wobbly_pete_walkl_1.png'), require('../../assets/sprites/characters/npcs/walk/wobbly_pete_walkl_2.png'), require('../../assets/sprites/characters/npcs/walk/wobbly_pete_walkl_3.png'), require('../../assets/sprites/characters/npcs/walk/wobbly_pete_walkl_4.png'), require('../../assets/sprites/characters/npcs/walk/wobbly_pete_walkl_5.png'), require('../../assets/sprites/characters/npcs/walk/wobbly_pete_walkl_6.png'), require('../../assets/sprites/characters/npcs/walk/wobbly_pete_walkl_7.png')],
    walkAspect: 112 / 128,
    walkScale: 128 / 108,
    sitSide: require('../../assets/sprites/characters/npcs/sit/wobbly_pete_side.png'),
    sitSideAspect: 0.558,
    sit: require('../../assets/sprites/characters/npcs/sit/wobbly_pete_sit.png'),
    sitAspect: 0.625,
  },
  'patron_tortuga_rival': { src: require('../../assets/sprites/characters/npcs/scar_faced_odom.png'), aspect: 0.523,
    walk: [require('../../assets/sprites/characters/npcs/walk/scar_faced_odom_walk_0.png'), require('../../assets/sprites/characters/npcs/walk/scar_faced_odom_walk_1.png'), require('../../assets/sprites/characters/npcs/walk/scar_faced_odom_walk_2.png'), require('../../assets/sprites/characters/npcs/walk/scar_faced_odom_walk_3.png'), require('../../assets/sprites/characters/npcs/walk/scar_faced_odom_walk_4.png'), require('../../assets/sprites/characters/npcs/walk/scar_faced_odom_walk_5.png'), require('../../assets/sprites/characters/npcs/walk/scar_faced_odom_walk_6.png'), require('../../assets/sprites/characters/npcs/walk/scar_faced_odom_walk_7.png')],
    walkLeft: [require('../../assets/sprites/characters/npcs/walk/scar_faced_odom_walkl_0.png'), require('../../assets/sprites/characters/npcs/walk/scar_faced_odom_walkl_1.png'), require('../../assets/sprites/characters/npcs/walk/scar_faced_odom_walkl_2.png'), require('../../assets/sprites/characters/npcs/walk/scar_faced_odom_walkl_3.png'), require('../../assets/sprites/characters/npcs/walk/scar_faced_odom_walkl_4.png'), require('../../assets/sprites/characters/npcs/walk/scar_faced_odom_walkl_5.png'), require('../../assets/sprites/characters/npcs/walk/scar_faced_odom_walkl_6.png'), require('../../assets/sprites/characters/npcs/walk/scar_faced_odom_walkl_7.png')],
    walkAspect: 112 / 128,
    walkScale: 128 / 108,
    sit: require('../../assets/sprites/characters/npcs/sit/scar_faced_odom_sit.png'),
    sitAspect: 0.558,
  },
  'patron_tortuga_mystic': { src: require('../../assets/sprites/characters/npcs/mother_yew.png'), aspect: 0.500,
    walk: [require('../../assets/sprites/characters/npcs/walk/mother_yew_walk_0.png'), require('../../assets/sprites/characters/npcs/walk/mother_yew_walk_1.png'), require('../../assets/sprites/characters/npcs/walk/mother_yew_walk_2.png'), require('../../assets/sprites/characters/npcs/walk/mother_yew_walk_3.png'), require('../../assets/sprites/characters/npcs/walk/mother_yew_walk_4.png'), require('../../assets/sprites/characters/npcs/walk/mother_yew_walk_5.png'), require('../../assets/sprites/characters/npcs/walk/mother_yew_walk_6.png'), require('../../assets/sprites/characters/npcs/walk/mother_yew_walk_7.png')],
    walkLeft: [require('../../assets/sprites/characters/npcs/walk/mother_yew_walkl_0.png'), require('../../assets/sprites/characters/npcs/walk/mother_yew_walkl_1.png'), require('../../assets/sprites/characters/npcs/walk/mother_yew_walkl_2.png'), require('../../assets/sprites/characters/npcs/walk/mother_yew_walkl_3.png'), require('../../assets/sprites/characters/npcs/walk/mother_yew_walkl_4.png'), require('../../assets/sprites/characters/npcs/walk/mother_yew_walkl_5.png'), require('../../assets/sprites/characters/npcs/walk/mother_yew_walkl_6.png'), require('../../assets/sprites/characters/npcs/walk/mother_yew_walkl_7.png')],
    walkAspect: 112 / 128,
    walkScale: 128 / 108,
    sit: require('../../assets/sprites/characters/npcs/sit/mother_yew_sit.png'),
    sitAspect: 0.548,
  },
  'tortuga_amb_sailor': { src: require('../../assets/sprites/characters/npcs/sailor.png'), aspect: 0.523,
    walk: [require('../../assets/sprites/characters/npcs/walk/sailor_walk_0.png'), require('../../assets/sprites/characters/npcs/walk/sailor_walk_1.png'), require('../../assets/sprites/characters/npcs/walk/sailor_walk_2.png'), require('../../assets/sprites/characters/npcs/walk/sailor_walk_3.png'), require('../../assets/sprites/characters/npcs/walk/sailor_walk_4.png'), require('../../assets/sprites/characters/npcs/walk/sailor_walk_5.png'), require('../../assets/sprites/characters/npcs/walk/sailor_walk_6.png'), require('../../assets/sprites/characters/npcs/walk/sailor_walk_7.png')],
    walkLeft: [require('../../assets/sprites/characters/npcs/walk/sailor_walkl_0.png'), require('../../assets/sprites/characters/npcs/walk/sailor_walkl_1.png'), require('../../assets/sprites/characters/npcs/walk/sailor_walkl_2.png'), require('../../assets/sprites/characters/npcs/walk/sailor_walkl_3.png'), require('../../assets/sprites/characters/npcs/walk/sailor_walkl_4.png'), require('../../assets/sprites/characters/npcs/walk/sailor_walkl_5.png'), require('../../assets/sprites/characters/npcs/walk/sailor_walkl_6.png'), require('../../assets/sprites/characters/npcs/walk/sailor_walkl_7.png')],
    walkAspect: 112 / 128,
    walkScale: 128 / 108,
    sit: require('../../assets/sprites/characters/npcs/sit/sailor_sit.png'),
    sitAspect: 0.538,
  },
  'tortuga_amb_cook': { src: require('../../assets/sprites/characters/npcs/cook.png'), aspect: 0.625,
    walk: [require('../../assets/sprites/characters/npcs/walk/cook_walk_0.png'), require('../../assets/sprites/characters/npcs/walk/cook_walk_1.png'), require('../../assets/sprites/characters/npcs/walk/cook_walk_2.png'), require('../../assets/sprites/characters/npcs/walk/cook_walk_3.png'), require('../../assets/sprites/characters/npcs/walk/cook_walk_4.png'), require('../../assets/sprites/characters/npcs/walk/cook_walk_5.png'), require('../../assets/sprites/characters/npcs/walk/cook_walk_6.png'), require('../../assets/sprites/characters/npcs/walk/cook_walk_7.png')],
    walkLeft: [require('../../assets/sprites/characters/npcs/walk/cook_walkl_0.png'), require('../../assets/sprites/characters/npcs/walk/cook_walkl_1.png'), require('../../assets/sprites/characters/npcs/walk/cook_walkl_2.png'), require('../../assets/sprites/characters/npcs/walk/cook_walkl_3.png'), require('../../assets/sprites/characters/npcs/walk/cook_walkl_4.png'), require('../../assets/sprites/characters/npcs/walk/cook_walkl_5.png'), require('../../assets/sprites/characters/npcs/walk/cook_walkl_6.png'), require('../../assets/sprites/characters/npcs/walk/cook_walkl_7.png')],
    walkAspect: 112 / 128,
    walkScale: 128 / 108,
    sit: require('../../assets/sprites/characters/npcs/sit/cook_sit.png'),
    sitAspect: 0.625,
  },
  'tortuga_amb_lass': { src: require('../../assets/sprites/characters/npcs/lass.png'), aspect: 0.438,
    walk: [require('../../assets/sprites/characters/npcs/walk/lass_walk_0.png'), require('../../assets/sprites/characters/npcs/walk/lass_walk_1.png'), require('../../assets/sprites/characters/npcs/walk/lass_walk_2.png'), require('../../assets/sprites/characters/npcs/walk/lass_walk_3.png'), require('../../assets/sprites/characters/npcs/walk/lass_walk_4.png'), require('../../assets/sprites/characters/npcs/walk/lass_walk_5.png'), require('../../assets/sprites/characters/npcs/walk/lass_walk_6.png'), require('../../assets/sprites/characters/npcs/walk/lass_walk_7.png')],
    walkLeft: [require('../../assets/sprites/characters/npcs/walk/lass_walkl_0.png'), require('../../assets/sprites/characters/npcs/walk/lass_walkl_1.png'), require('../../assets/sprites/characters/npcs/walk/lass_walkl_2.png'), require('../../assets/sprites/characters/npcs/walk/lass_walkl_3.png'), require('../../assets/sprites/characters/npcs/walk/lass_walkl_4.png'), require('../../assets/sprites/characters/npcs/walk/lass_walkl_5.png'), require('../../assets/sprites/characters/npcs/walk/lass_walkl_6.png'), require('../../assets/sprites/characters/npcs/walk/lass_walkl_7.png')],
    walkAspect: 112 / 128,
    walkScale: 128 / 108,
    sitSide: require('../../assets/sprites/characters/npcs/sit/lass_side.png'),
    sitSideAspect: 0.519,
    sit: require('../../assets/sprites/characters/npcs/sit/lass_sit.png'),
    sitAspect: 0.529,
  },
};

// Painted rooms beyond the tavern (2026-11-20) reuse the tavern cast: keepers, then townsfolk.
// (Old Tom's 'pour' pose belongs behind his own bar, so the smith gets him without it.)
const alias = (to: string, from: string, drop: (keyof NpcSprite)[] = []) => {
  const base = { ...NPC_SPRITES[from] };
  drop.forEach((k) => delete base[k]);
  NPC_SPRITES[to] = base;
};
alias('tortuga_shop:main', 'tortuga_amb_cook');
alias('tortuga_smithy:main', 'tortuga_tavern:main', ['pour', 'pourAspect']);
alias('tortuga_harbourmaster:main', 'patron_tortuga_rival', ['sit', 'sitAspect']);
alias('tortuga_chandlery:main', 'tortuga_amb_sailor');
alias('patron_tortuga_smithy', 'patron_tortuga_drunk', ['sit', 'sitAspect', 'sitSide', 'sitSideAspect']);
alias('tortuga_amb_browser', 'tortuga_amb_lass');
alias('tortuga_amb_deckhand', 'tortuga_amb_sailor');
alias('tortuga_amb_apprentice', 'tortuga_amb_cook');
alias('tortuga_amb_clerk', 'tortuga_amb_lass');
alias('tortuga_amb_captain', 'tortuga_amb_sailor');
alias('tortuga_amb_galley', 'tortuga_amb_cook');
alias('tortuga_amb_sailmaker', 'tortuga_amb_lass');
