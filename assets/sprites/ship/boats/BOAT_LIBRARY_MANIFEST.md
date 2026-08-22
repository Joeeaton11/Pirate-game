# Boat Sprite Library — Delivery Manifest

Source: `assets/brand/scallywags_boat_sprite_library_v1.png` (1536×1024) — a "Scallywags – Boat
Sprite Library" reference sheet: 10 boat types × 8 compass-view directions, plus example
damaged/wrecked/burning variant panels, a size-comparison chart, and a colour-palette/art-notes
strip. Uploaded with no accompanying brief text beyond "these are some boat sprites... use them
when boats are sailing." Scope confirmed via `AskUserQuestion`: cut, file, and wire into the
merchant ship encounter system (see `GAME_DESIGN.md` for the wiring writeup).

Cut 2026-08-22 following the same discipline as the terrain-extras deliveries: measured real
per-item pixel boundaries rather than assuming the visually-regular 10×8 table was evenly spaced
(it mostly is, but several real defects were caught and fixed before filing — see below).

**96 sprites filed**: 80 directional boats (10 types × 8 views) + 16 damaged/wrecked/burning
example variants. The Size Comparison chart and Colour Palette/Art Notes strip were **not** cut as
individual assets — the former is redundant with the South-view column already in the main grid,
the latter is a reference legend, not game art.

## Real defects found and fixed during cutting

- **Column grid is NOT evenly spaced, despite looking like a clean computer-generated table.**
  Confirmed real per-row column boundaries via a "hull-level" content profile (bottom ~40-60% of
  each row band, avoiding the sail-crowded top where adjacent boats' sails visually approach each
  other) rather than assuming a uniform 142.5px column width — this caught real boundary variance
  row to row (e.g. row 8's columns run 194–277, 310–423, 456–574, ... — visibly uneven widths).
- **Column 8's window bled into the "VIEW GUIDE" compass legend panel** (top-right of the sheet,
  overlapping rows 1–2's y-range) — `r1_c8`'s first cut included a chunk of the legend's border and
  "7. WEST / 8. SOUTH-WEST" label text. Fixed by zeroing out the legend panel's rectangular region
  from the content mask before running `content_bbox`, rather than trying to guess a safe column-8
  right boundary that would also fit the widest (Flagship) row.
- **Every row's top/bottom edge picked up the thin gold row-divider line, and a plain fixed-pixel
  trim could not fully solve it** — same bug class as `TERRAIN_EXTRAS_4_MANIFEST.md`'s Panel 16
  tree fix, but worse here because the real content in several rows sits closer to its divider than
  in that delivery. Three things had to work together, discovered in sequence by an independent
  edge-opacity scan run *after* the delivery was first committed and filed (this delivery's own
  verification during cutting missed it — the lesson below is the reason this whole section exists):
  1. A 1px row trim alone left divider color in many rows (masts of Pirate Sloop, Large Merchant
     Ship, Heavy Pirate Ship, and others sit close enough that 1px wasn't enough).
  2. Raising the trim to 2–3px fixed those but then clipped real mast-tip content in other rows
     (Small Sloop, Cutter) whose masts sit *even closer* to their divider than the ones a bigger trim
     was fixing — there is no single trim value that is simultaneously enough and not too much
     across all 10 rows.
  3. The real fix: identify the divider's own gold/bronze color signature precisely (the same
     r>g≥b, r−b≥8 formula `find_panel_dividers` uses) and zero out only pixels matching that color
     within a few px of each row boundary — a targeted color exclusion instead of a blind pixel
     trim — combined with a minimal 1px structural trim (to skip the exact divider row) and
     **`pad=0`** in the final `crop_rgba` call. That last part mattered on its own: `crop_rgba`
     recomputes alpha independently on the padded region, so even a `content_bbox` that correctly
     avoided the divider still had the line silently reappear in the output whenever `pad>0` walked
     the crop rectangle back into it.
  Two rows (Small Sloop, Cutter) still needed a further +3px trim on top of the color-exclusion
  logic even after this fix, because their masts sit so close to the divider that some of the
  actual divider-adjacent pixels don't cleanly match the color formula (anti-aliased fringe mixed
  with real rigging color) — a small, deliberate, and now-necessary loss of a couple of pixels off
  those two rows' mast tips, not a leftover bug. Verified clean with a systematic top/bottom-edge
  opacity scan across all 80 final files (0 remaining false-edge hits) plus a full contact-sheet
  re-check of every one of the 10 rows.
- **Several rows' masts sit extremely close to their row's divider line — genuinely near-zero
  margin in the source art**, most visible on Row 5 (Cutter), Row 6 (Merchant Schooner), and Row 8
  (Large Merchant Ship). Row 6's masts are tall enough that their finial tips read as very slightly
  flat-topped rather than perfectly pointed even after the fix above — a source-art tightness, not
  a cutting error. Confirmed this is the correct read by checking a wide crop of the row5/row6
  boundary directly against the source (row 5 has full clearance around its own mast; only row 6
  is tight enough that widening its window upward to "give the masts more room" would instead pull
  in row 5's own boat, since both rows' art shares the same column x-range).
- **Damaged/Wrecked/Burning example panels have no real gaps between items either** — cut with an
  even 6-way (damaged, wrecked) / 4-way (burning) column split per panel, using the same
  `content_bbox` approach; verified via contact sheet, sizes came out consistent across each
  panel's items confirming the even split was correct (no merges/splits).

## Panel → filename map

| Row | Boat type | Destination prefix |
|---|---|---|
| 1 | Dinghy / Rowboat | `dinghy_*` |
| 2 | Fishing Boat | `fishing_boat_*` |
| 3 | Small Sloop | `small_sloop_*` |
| 4 | Pirate Sloop | `pirate_sloop_*` |
| 5 | Cutter | `cutter_*` |
| 6 | Merchant Schooner | `merchant_schooner_*` |
| 7 | Brigantine | `brigantine_*` |
| 8 | Large Merchant Ship | `large_merchant_ship_*` |
| 9 | Heavy Pirate Ship | `heavy_pirate_ship_*` |
| 10 | Flagship (Captain Scally's boat) | `flagship_*` |

Each prefix has 8 direction suffixes matching `ShipHeading` from `src/data/shipSprites.ts`:
`_s, _se, _e, _ne, _n, _nw, _w, _sw` (columns 1–8 in the source, in that order — same compass
convention already used for the Black Pearl's own sprites).

Variant examples (not tied to a specific boat type — the sheet only shows one example ship style
per state): `damaged_example_1..6.png`, `wrecked_example_1..6.png`, `burning_example_1..4.png`.

## Note on the Flagship row

Row 10 ("Flagship — Captain Scally's Boat") is visually the same ship concept as the existing
`assets/sprites/ship/ship_*.png` 8-directional set (the Black Pearl, already fully wired for player
movement) but is a **different, independently-drawn piece of art** from a different source sheet —
not a duplicate or replacement. Filed under `boats/flagship_*` for completeness and any future use
(e.g. a second flagship-class NPC, a title-screen asset) but the player's own ship continues to use
`shipSprites.ts`'s existing `ship_*` files unchanged.

## Wiring

Wired into the merchant encounter system — see `GAME_DESIGN.md` for the write-up. Mapping used
(chosen for thematic fit against each merchant template's cargo):

- `fishing_trawler` (fish) → `fishing_boat`
- `timber_galleon` (timber) → `large_merchant_ship`
- `rum_runner` (rum) → `cutter`
- `powder_hulk` (gunpowder) → `brigantine`

The other 6 boat types (Dinghy, Small Sloop, Pirate Sloop, Merchant Schooner, Heavy Pirate Ship,
Flagship) and all 16 damaged/wrecked/burning variants are cut and filed but not yet wired to
anything — flagged as free wiring opportunities in `DELIVERY_LOG.md`.
