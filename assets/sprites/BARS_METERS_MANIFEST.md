# Bars & Meters — Delivery Manifest

Source: `assets/brand/tileset-catalog/ui_bars_meters_v1.png` (1536×1024) — a "Sheet 2" reference,
sent alongside the third UI kit candidate (`ui_kit_candidate_c.png`, see `UI_KIT_CANDIDATES_MANIFEST.md`)
with no accompanying text. Unlike that sheet, this one isn't a button/panel kit and has no design-A/B/C
counterpart to compare against — it's new content (HP bars, an XP/level bar, a Heat/Wanted meter, and
cooldown indicators) filling a real gap in the library, so it's filed straight into the active
`assets/sprites/ui/` folder rather than `ui_candidates/`.

Cut 2026-08-27. **Not wired** — cutting and filing only, matching the scope of every prior
unsolicited-sheet delivery this session.

## Real defect: same low-contrast alpha issue as `ui_kit_candidate_c.png`

Same dark-navy noisy background as design C (cut in the same delivery, see that manifest's defect
notes) — used the same fix throughout: global background-color distance with a low threshold (18)
plus morphological closing + hole-filling on the alpha mask, rather than the higher flat threshold
that worked for designs A/B's brighter art. Also hit the same "neighboring group's text/decoration
bleeds into an otherwise-correct crop" pattern — `material_swatch_rope` and `material_swatch_wood`
both initially carried a fragment of the "MATERIAL PALETTE REFERENCE" header, which (like design C's
own header cases) only overlapped *some* of the row's columns rather than the full row width. Fixed
the same way: read the real per-column header boundary from the pixel density profile rather than
reusing one y-cutoff for the whole row, and re-cropped both files clean.

## 39 sprites filed into `assets/sprites/ui/`

| Category | Count | Files |
|---|---|---|
| HP bar track (empty frame), 3 ornament styles | 3 | `hp_track_1..3` (skull-and-crossbones, ship's-wheel, skull-in-plaque) |
| HP bar fill, neutral (untinted), matching the 3 track styles | 3 | `hp_fill_1..3` |
| HP bar fill, pre-tinted reference examples — high/mid/low × all 3 track styles | 9 | `hp_fill_tinted_{high,mid,low}_{1,2,3}` |
| XP/level progress bar (level badge + track + fill fused as one asset), 3 colorways | 3 | `xp_bar_{blue,purple,teal}` |
| Heat/Wanted meter (wanted-poster cap + ruled track + fill + flag cap fused as one asset), 3 tiers | 3 | `heat_meter_wanted_{1,5,10}` |
| Cooldown indicator, 3 render styles (circular radial / clock-style radial / linear overlay) × 3 states | 9 | `cooldown_{circle,clock,linear}_{ready,partial,cooldown}` |
| Material palette reference swatches | 9 | `material_swatch_{iron,steel,brass,wood,rope,leather,parchment,canvas,red_cloth}` |

**39 total.**

## Judgment calls

- **`hp_fill_tinted_*` (9 files) are pre-tinted reference examples, not meant to replace `hp_fill_*`.**
  The sheet's own on-image notes say tinting "is handled in-game" — these 9 are the sheet author's
  demonstration of what that tinting should look like at three thresholds, across all three track
  styles, not a second set of assets to swap in for the neutral fill. Cut and filed anyway (same
  "cut what's on the sheet" standard as every other delivery), but if/when this gets wired, `hp_fill_1..3`
  are almost certainly the ones a real HP bar component tints programmatically — the `_tinted_*`
  variants are reference material for getting that in-game tint right, not drop-in assets.
- **`xp_bar_*` and `heat_meter_wanted_*` are each filed as one fused asset per state/colorway**, not
  split into separate cap/track/fill/badge pieces, because the level-badge circle (XP bar) and the
  wanted-poster/flag end-caps (Heat meter) are drawn as part of the same continuous composition in
  the source art, not modular pieces with real gaps between them — matching the "kept as one image
  when a real seam isn't there" precedent used throughout this session (e.g. item 176's tab-selector
  rows). This means these three colorways/tiers are fixed at "12" and "1/5/10" respectively; using a
  different number needs either a redraw or a font/number swap on the existing art.
- **`material_swatch_*` are reference chips, not standalone game-ready textures** — small flat/
  slightly-textured color-only patches meant to document the kit's material vocabulary (the same 9
  materials named across design C's own manifest entries), not intended to be placed in the game as
  their own UI element. Filed for completeness and easy cross-reference, flagged here so they aren't
  mistaken for a 10th button style or panel material.

## Verification

Ran the edge-opacity defect scan across all 39 cut files: zero hits — binary alpha only, no near-
empty or near-fully-opaque crops, no disconnected secondary-blob debris (checked via connected-
component labeling, same technique used to catch design C's bleed cases). Built and visually
reviewed a full contact sheet, plus targeted verification strips per category, before filing —
confirmed correct content and clean isolation on every item, including the two re-cut material
swatches.

## Folder size note

This delivery brings `assets/sprites/ui/` from 65 to 104 flat files — past this directory's own
README-stated subfolder threshold (~15-20 files with genuinely distinct sub-groups), and this
delivery alone adds several distinguishable sub-groups (bars, meters, cooldown indicators, material
swatches) on top of the folder's existing buttons/panels/frames/icons mix. Not split into subfolders
in this pass — same risk calculus noted for `tiles/ground/` and friends in this log's existing
"Folder size note": `ui/` has files actively wired via `src/data/uiSprites.ts`/`bitmapNameplateFont.ts`,
and a split means rewriting those require paths. Flagged here for a future pass rather than acted on
unilaterally.

## Wiring

**Not wired** — cutting and filing only, same as every prior delivery this session.
