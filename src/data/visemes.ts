// Letter -> viseme lookup driving real "lip sync to the text" (see ConversationBox's
// getTalkFrame prop): the character currently being typewriter-revealed picks which of Scally's
// LIP_SYNC_FRAMES mouth shapes to show, instead of just cycling through them generically. Not real
// phoneme detection — no dictionary, no stress/vowel-length awareness — but it's the same trick
// hand-timed 2D lip sync has always used (a small set of mouth shapes triggered by what's on the
// page), just driven by the typewriter reveal instead of an animator's ear or an audio track.
import { VisemeKey, VISEME_REST } from './scallySprites';

// Two-letter combos checked before the single-letter table, so real English digraphs (their sound
// isn't either letter alone) and the sheet's own consonant-blend frames both win over a plain
// per-letter guess.
const DIGRAPHS: Record<string, VisemeKey> = {
  th: 'consonant_th',
  sh: 'consonant_shchj',
  ch: 'consonant_shchj',
  oo: 'vowel_oo',
  ee: 'vowel_ee',
  ou: 'vowel_ou',
  // "ar" as in "Arrr", "harbor", "starboard", "cargo" — the open-mouth "ah" shape a plain "a" (short
  // vowel_a) doesn't cover. The one digraph added specifically to stop vowel_ah from being a cut
  // frame nothing ever pointed to.
  ar: 'vowel_ah',
  br: 'blend_br',
  dr: 'blend_dr',
  tr: 'blend_tr',
  pr: 'blend_pr',
  kr: 'blend_kr',
  gr: 'blend_gr',
  cl: 'blend_cl',
  gl: 'blend_gl',
  sn: 'blend_sn',
};

const SINGLE: Record<string, VisemeKey> = {
  a: 'vowel_a',
  e: 'vowel_e',
  i: 'vowel_i',
  o: 'vowel_o',
  u: 'vowel_u',
  b: 'consonant_bmp',
  m: 'consonant_bmp',
  p: 'consonant_bmp',
  f: 'consonant_fv',
  v: 'consonant_fv',
  l: 'consonant_l',
  w: 'consonant_w_oo',
  r: 'consonant_r',
  s: 'consonant_sz',
  z: 'consonant_sz',
  x: 'consonant_sz',
  j: 'consonant_shchj',
  d: 'consonant_dtn',
  t: 'consonant_dtn',
  n: 'consonant_dtn',
  k: 'consonant_kg',
  g: 'consonant_kg',
  c: 'consonant_kg',
  q: 'consonant_kg',
  h: 'consonant_hy',
  y: 'consonant_hy',
};

/** Which mouth frame to show for the character at `index` in `text`. Checks a 2-letter combo at
 * the current position both ways (char+next and prev+char) so both ticks of a digraph/blend reveal
 * land on the same correct shape, falls back to the per-letter table, and returns the closed-mouth
 * rest pose for anything that isn't a real letter (space, punctuation, line boundaries). */
export function visemeForPosition(text: string, index: number): VisemeKey {
  const ch = text[index]?.toLowerCase();
  if (!ch || !/[a-z]/.test(ch)) return VISEME_REST;

  const next = text[index + 1]?.toLowerCase();
  if (next) {
    const digraph = DIGRAPHS[ch + next];
    if (digraph) return digraph;
  }
  const prev = text[index - 1]?.toLowerCase();
  if (prev) {
    const digraph = DIGRAPHS[prev + ch];
    if (digraph) return digraph;
  }
  return SINGLE[ch] ?? VISEME_REST;
}
