# Font Library

## What's here

| File | Family | Style | License |
|---|---|---|---|
| `IMFellEnglishSC-Regular.ttf` | IM FELL English SC | Small-caps, 18th-century English printing revival | SIL OFL 1.1 — `licenses/IMFellEnglishSC-OFL.txt` |

**Small-caps note:** lowercase input renders as smaller capital letters, not true lowercase forms.
Good for titles, nameplates, headers, banners — not recommended for dense body text (dialogue,
descriptions), where long lowercase-heavy lines get harder to scan in small-caps. Pair with a
plainer body font for that once one's picked.

## License policy

Every font file gets its license text saved alongside it in `licenses/`, named
`{FontFamily}-{LicenseType}.txt`, even if the license permits redistribution without keeping a
copy — this is the compliance record for what's actually allowed (embedding in the built game,
modification, etc.) without having to re-derive it later. Check the license before adding a new
font: OFL (SIL Open Font License) is the common case for Google Fonts and is fine to bundle into a
commercial game; some free-for-personal-use fonts are not, and shouldn't go in here even if the
art is a perfect fit.

## Wiring status

**Not yet wired into the app.** The Expo/React Native path is `expo-font`'s `useFonts()` hook,
loaded once at the app root (typically in `App.tsx` or a root layout) before rendering anything
that uses the custom family — `expo-font` isn't installed yet. That's the next step whenever
there's a screen ready to use this font; until then it just sits here as an asset.
