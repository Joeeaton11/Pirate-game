// UI chrome art. First entry in this file — assets/sprites/ui/ was previously unwired (see that
// folder's row in assets/sprites/README.md).

// Torn-parchment banner for ConversationBox's dialogue panel. Real alpha now: the source upload
// had no actual alpha channel (checked directly — PIL reported mode 'RGB', not 'RGBA') despite
// displaying with a checkerboard in the chat preview; that checkerboard was baked into the RGB
// pixels themselves; a hard lesson from this project's very first sprite-cutting pass. Chroma-keyed
// out via a brightness+desaturation test rather than the usual distance-from-a-single-background-
// color approach, since the source used a two-tone checkerboard, not one flat color: background
// pixels are both bright (near-white) AND desaturated, which a plain "distance from near-black"
// test can't express, and which also correctly leaves the art's own near-black outline strokes
// (dark but equally desaturated) fully opaque instead of keying them out too. Cropped tight to the
// scroll's own bounding box (the source canvas had a lot of empty space above it).
export const UI_DIALOGUE_PARCHMENT = require('../../assets/sprites/ui/ui_dialogue_parchment_1.png');

/** Small skull-and-crossbones badge — cut from the pirate bitmap-glyph sheet's two bonus icons
 * (see assets/fonts/bitmap_pirate/README.md). Used on ConversationBox's speaker name-plate. */
export const UI_ICON_SKULL_CROSSBONES = require('../../assets/sprites/ui/ui_icon_skull_crossbones_1.png');
