import { useFonts } from 'expo-font';

// The two vector fonts added under assets/fonts/ (see that folder's README) — wired here for the
// first time. 'PirataOne' is the bold display face (speaker names, banner text), 'IMFellEnglishSC'
// is the secondary/body face (dialogue text) — same pairing already proven on the parchment banner
// preview when these fonts were first added.
export const FONT_PIRATA_ONE = 'PirataOne';
export const FONT_IM_FELL = 'IMFellEnglishSC';

/** Call once at the app root. Returns [fontsLoaded, error] same as the underlying expo-font hook —
 * gate first paint on `fontsLoaded` so nothing renders text in these families before they're ready. */
export function useGameFonts() {
  return useFonts({
    [FONT_PIRATA_ONE]: require('../../assets/fonts/PirataOne-Regular.ttf'),
    [FONT_IM_FELL]: require('../../assets/fonts/IMFellEnglishSC-Regular.ttf'),
  });
}
