// Carved-bone bitmap font cut from the user's "CAPTAIN SCALLY" wood-signboard reference sheet —
// uppercase A-Z, digits 0-9, and a small punctuation set (! ? . , : ; ' " ( ) [ ] - _ / &),
// styled to look branded into wood. Purpose-built for ConversationBox's speaker name-plate (see
// assets/sprites/ui/ui_nameplate_board_1.png, the matching blank board), not a general body font —
// no lowercase forms exist, so lowercase input renders as uppercase automatically.
//
// Same chroma-key trap as the parchment banner (item 103 in GAME_DESIGN.md): the source PNGs had
// no real alpha channel — the checkerboard background was baked into the RGB pixels — verified
// directly rather than assumed, and keyed out with the same brightness+desaturation two-condition
// test (catches a two-tone checkerboard without also eating the glyphs' own dark outline strokes).
import { ImageSourcePropType } from 'react-native';

export const NAMEPLATE_GLYPHS: Record<string, ImageSourcePropType> = {
  A: require('../../assets/fonts/bitmap_nameplate/upper_A.png'),
  B: require('../../assets/fonts/bitmap_nameplate/upper_B.png'),
  C: require('../../assets/fonts/bitmap_nameplate/upper_C.png'),
  D: require('../../assets/fonts/bitmap_nameplate/upper_D.png'),
  E: require('../../assets/fonts/bitmap_nameplate/upper_E.png'),
  F: require('../../assets/fonts/bitmap_nameplate/upper_F.png'),
  G: require('../../assets/fonts/bitmap_nameplate/upper_G.png'),
  H: require('../../assets/fonts/bitmap_nameplate/upper_H.png'),
  I: require('../../assets/fonts/bitmap_nameplate/upper_I.png'),
  J: require('../../assets/fonts/bitmap_nameplate/upper_J.png'),
  K: require('../../assets/fonts/bitmap_nameplate/upper_K.png'),
  L: require('../../assets/fonts/bitmap_nameplate/upper_L.png'),
  M: require('../../assets/fonts/bitmap_nameplate/upper_M.png'),
  N: require('../../assets/fonts/bitmap_nameplate/upper_N.png'),
  O: require('../../assets/fonts/bitmap_nameplate/upper_O.png'),
  P: require('../../assets/fonts/bitmap_nameplate/upper_P.png'),
  Q: require('../../assets/fonts/bitmap_nameplate/upper_Q.png'),
  R: require('../../assets/fonts/bitmap_nameplate/upper_R.png'),
  S: require('../../assets/fonts/bitmap_nameplate/upper_S.png'),
  T: require('../../assets/fonts/bitmap_nameplate/upper_T.png'),
  U: require('../../assets/fonts/bitmap_nameplate/upper_U.png'),
  V: require('../../assets/fonts/bitmap_nameplate/upper_V.png'),
  W: require('../../assets/fonts/bitmap_nameplate/upper_W.png'),
  X: require('../../assets/fonts/bitmap_nameplate/upper_X.png'),
  Y: require('../../assets/fonts/bitmap_nameplate/upper_Y.png'),
  Z: require('../../assets/fonts/bitmap_nameplate/upper_Z.png'),
  '0': require('../../assets/fonts/bitmap_nameplate/digit_0.png'),
  '1': require('../../assets/fonts/bitmap_nameplate/digit_1.png'),
  '2': require('../../assets/fonts/bitmap_nameplate/digit_2.png'),
  '3': require('../../assets/fonts/bitmap_nameplate/digit_3.png'),
  '4': require('../../assets/fonts/bitmap_nameplate/digit_4.png'),
  '5': require('../../assets/fonts/bitmap_nameplate/digit_5.png'),
  '6': require('../../assets/fonts/bitmap_nameplate/digit_6.png'),
  '7': require('../../assets/fonts/bitmap_nameplate/digit_7.png'),
  '8': require('../../assets/fonts/bitmap_nameplate/digit_8.png'),
  '9': require('../../assets/fonts/bitmap_nameplate/digit_9.png'),
  '!': require('../../assets/fonts/bitmap_nameplate/punct_exclaim.png'),
  '?': require('../../assets/fonts/bitmap_nameplate/punct_question.png'),
  '.': require('../../assets/fonts/bitmap_nameplate/punct_period.png'),
  ',': require('../../assets/fonts/bitmap_nameplate/punct_comma.png'),
  ':': require('../../assets/fonts/bitmap_nameplate/punct_colon.png'),
  ';': require('../../assets/fonts/bitmap_nameplate/punct_semicolon.png'),
  "'": require('../../assets/fonts/bitmap_nameplate/punct_apostrophe.png'),
  '"': require('../../assets/fonts/bitmap_nameplate/punct_quote.png'),
  '(': require('../../assets/fonts/bitmap_nameplate/punct_paren_open.png'),
  ')': require('../../assets/fonts/bitmap_nameplate/punct_paren_close.png'),
  '[': require('../../assets/fonts/bitmap_nameplate/punct_bracket_open.png'),
  ']': require('../../assets/fonts/bitmap_nameplate/punct_bracket_close.png'),
  '-': require('../../assets/fonts/bitmap_nameplate/punct_hyphen.png'),
  _: require('../../assets/fonts/bitmap_nameplate/punct_underscore.png'),
  '/': require('../../assets/fonts/bitmap_nameplate/punct_slash.png'),
  '&': require('../../assets/fonts/bitmap_nameplate/punct_ampersand.png'),
};

/** Each glyph's own width:height ratio (read from the cut PNGs) — every character is a different
 * width ("I" vs "M"), so laying them out at this ratio per glyph (rather than a fixed monospace
 * cell) is what keeps the rendered word looking like real type instead of a slot machine. */
export const NAMEPLATE_GLYPH_ASPECT: Record<string, number> = {
  A: 0.7674, B: 0.6462, C: 0.6615, D: 0.7422, E: 0.6279, F: 0.6202, G: 0.7231,
  H: 0.7597, I: 0.4409, J: 0.6562, K: 0.7209, L: 0.6094, M: 0.8594, N: 0.7422,
  O: 0.7287, P: 0.6535, Q: 0.6621, R: 0.7109, S: 0.5814, T: 0.7442, U: 0.7559,
  V: 0.7402, W: 0.9685, X: 0.7266, Y: 0.7559, Z: 0.6562,
  '0': 0.6822, '1': 0.4646, '2': 0.6328, '3': 0.6016, '4': 0.6693, '5': 0.6047,
  '6': 0.6562, '7': 0.6172, '8': 0.6562, '9': 0.6484,
  '!': 0.359, '?': 0.5763, '.': 0.9189, ',': 0.6471, ':': 0.45, ';': 0.3646,
  "'": 0.6731, '"': 1.0, '(': 0.3934, ')': 0.3821, '[': 0.3659, ']': 0.3821,
  '-': 1.9091, _: 2.1765, '/': 0.626, '&': 0.8103,
};

/** Fraction of glyph height used as the gap between characters, and the (wider) gap for a space. */
export const NAMEPLATE_LETTER_GAP_FRACTION = 0.08;
export const NAMEPLATE_SPACE_FRACTION = 0.5;

export interface NameplateChar {
  key: string;
  source: ImageSourcePropType;
  aspect: number;
}

/** Uppercases the input (no lowercase forms exist) and drops any character with no cut glyph,
 * so an unsupported symbol just vanishes rather than crashing on a missing require(). */
export function nameplateChars(text: string): (NameplateChar | 'space')[] {
  const out: (NameplateChar | 'space')[] = [];
  for (const raw of text.toUpperCase()) {
    if (raw === ' ') {
      out.push('space');
      continue;
    }
    const source = NAMEPLATE_GLYPHS[raw];
    const aspect = NAMEPLATE_GLYPH_ASPECT[raw];
    if (source && aspect) {
      out.push({ key: raw, source, aspect });
    }
  }
  return out;
}
