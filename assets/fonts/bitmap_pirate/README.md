# Bitmap Pirate Glyph Set

A hand-painted, weathered-parchment-style glyph set — not a vector font, a set of 96 individual
PNG images (one per character) cut from a single reference sheet the same way every other sprite
in this repo is cut: connected-component detection against the sheet's own real alpha channel, no
grid assumed. Full uppercase A-Z, lowercase a-z, digits 0-9, and the standard ASCII punctuation
set, each glyph individually alpha-cut with a real transparent background.

Two bonus decorative icons from the same sheet (skull & crossbones, compass rose) are **not**
part of the character set — they live in `assets/sprites/ui/` instead
(`ui_icon_skull_crossbones_1.png`, `ui_icon_compass_rose_1.png`) per the sprite library's own
rule: a decorative icon is what it *is* (a UI icon), not where it happened to be drawn.

## Naming convention

`{upper|lower}_{letter}.png`, `digit_{0-9}.png`, `punct_{name}.png` — plain-English names, not the
literal punctuation character, so every filename stays safe on case-insensitive filesystems (no
`A.png`/`a.png` collision) and legible in a directory listing.

| Prefix | Covers |
|---|---|
| `upper_A.png` … `upper_Z.png` | Uppercase letters |
| `lower_a.png` … `lower_z.png` | Lowercase letters |
| `digit_0.png` … `digit_9.png` | Digits |
| `punct_*.png` | Punctuation — see table below |

## Punctuation glyphs

| File | Character | File | Character | File | Character |
|---|---|---|---|---|---|
| `punct_period.png` | `.` | `punct_hyphen.png` | `-` | `punct_paren_open.png` | `(` |
| `punct_comma.png` | `,` | `punct_endash.png` | `–` | `punct_paren_close.png` | `)` |
| `punct_colon.png` | `:` | `punct_underscore.png` | `_` | `punct_bracket_open.png` | `[` |
| `punct_semicolon.png` | `;` | `punct_equals.png` | `=` | `punct_bracket_close.png` | `]` |
| `punct_exclaim.png` | `!` | `punct_plus.png` | `+` | `punct_brace_open.png` | `{` |
| `punct_question.png` | `?` | `punct_asterisk.png` | `*` | `punct_brace_close.png` | `}` |
| `punct_apostrophe.png` | `'` | `punct_hash.png` | `#` | `punct_lt.png` | `<` |
| `punct_quote_left.png` | `"` (open) | `punct_dollar.png` | `$` | `punct_gt.png` | `>` |
| `punct_quote_right.png` | `"` (close) | `punct_percent.png` | `%` | `punct_slash.png` | `/` |
| `punct_at.png` | `@` | `punct_caret.png` | `^` | `punct_backslash.png` | `\` |
| `punct_ampersand.png` | `&` | `punct_tilde.png` | `~` | `punct_pipe.png` | `\|` |
| `punct_backtick.png` | `` ` `` | | | | |

`punct_colon.png` and `punct_semicolon.png` are each cropped as one image spanning both of their
naturally-disconnected marks (colon's two dots; semicolon's dot + comma-tail) rather than as two
separate files — they're one character to place, even though the art itself has a real gap in the
middle.

## Cutting notes

Same method as every other sheet in this repo (see `assets/sprites/README.md`'s "Cutting
convention"), with one addition specific to this sheet: the source PNG already carried real,
authentic alpha (not a flat color to chroma-key), so detection ran directly against
`alpha > threshold` rather than re-deriving a distance-from-background mask. Row clustering by
y-center correctly separated the six visual rows for the 62 alphanumeric glyphs, but broke down
for the punctuation/symbol zone — those glyphs have deliberately different vertical extents and
baselines (tall brackets, low commas, high-sitting carets) with no clean y-gap to cluster on — so
that zone's 38 detected components were identified and named by hand against a gridded, numbered
reference render of the source image rather than by an automated heuristic.

## Wiring status

**Not wired into the app.** This is a bitmap glyph set, not a font file — using it in-game means
rendering a run of `<Image>` components per character (kerning/spacing table not yet built), not
an `expo-font` `useFonts()` call like the vector fonts in the parent `assets/fonts/` folder. Best
fit for short, chunky display text (a title, a stamped label, a treasure-map legend) rather than
paragraphs of dialogue — no lowercase-vs-small-caps tradeoff here since real lowercase forms
exist, but per-character image compositing is heavier than a real font for long text.
