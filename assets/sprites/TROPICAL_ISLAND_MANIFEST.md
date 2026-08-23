# Tropical Island Tileset — Delivery Manifest

Source: `assets/brand/tileset-catalog/tropical_island_v1.png` (1536×1024) — a tropical-island scene
sheet combining a left-hand 8×8 ground-tile grid (sand, water, grass/rock cliff edges, wood dock
tiles) with a freeform right-hand prop scene (palm trees, rocks, a cave/waterfall, a castaway camp,
market stall, wildlife, and a large illustrated shipwreck/shoreline panorama). Uploaded with "Cut
the sheet into assets for the game scene and environments."

Cut 2026-08-23 with the same discipline as every prior delivery this session: real per-item
connected-component detection across the whole sheet, no assumed grid.

## Real defect found and fixed before cutting: corrupted alpha channel

The uploaded file's own alpha channel was **unreliable across the whole image** — not a clean
matte. Sampling supposedly-empty background regions found wild, high-variance noise in both alpha
(0-252 in the same small patch) and RGB, and content regions that should read as a flat, fully
opaque color (alpha ≈250) instead showed broad blotchy patches of partial transparency (alpha
dropping into the 60-165 range in patches spanning dozens of pixels). Composited over a light
background this reads as pink/red/yellow/cyan "tint" washes in specific spots — which is exactly
what a first look at the sheet showed (a pink cast over the top-left tiles, a red halo around the
crab cluster, cyan near the dock) — but sampling confirmed the underlying RGB hue was essentially
correct in those spots; only the alpha was corrupted. This looks like a lossy re-encode/export
artifact, not intentional art.

**Fixed by ignoring the file's own alpha channel entirely** and re-deriving a clean one: a 5×5
median filter on the alpha channel (kills the high-frequency per-pixel noise while preserving real
silhouette edges — verified directly against a known-clean tree silhouette, where the filtered
alpha reproduced the same smooth ~2-4px anti-aliased edge ramp as the raw channel, confirming the
filter doesn't damage real content), thresholded at 128, then a single 3×3 binary-opening pass to
remove residual single-pixel speckle before connected-component labeling. A light Gaussian
smoothing (σ=0.6) on the denoised alpha gives the final feathered edge on every crop. Verified this
recovered clean, evenly-opaque output by direct pixel inspection of a sample tile before and after
(both looked identical where the source was already clean; the denoised version fixed every patchy
region) — see the full write-up in `GAME_DESIGN.md` item 162.

## What's NOT included: one whole-scene backdrop stays uncut

The bottom-right shipwreck/shoreline panorama (rocks, a broken hull, a curving surf line, palm
trees, and scattered shells/starfish, all genuinely touching in the source art with no real
separating gaps) is a single continuous illustrated composition, not a tileset — filed as-is per
`assets/sprites/README.md`'s own distinction, at `assets/backgrounds/castaway_shipwreck_cove_1.png`,
not cut into pieces.

## 127 sprites + 1 background filed

| Category | Count | Destination |
|---|---|---|
| Sand tiles (plain + decorative) | 16 | `tiles/beach/beach_17..19`, `beach_detail_*_1..2` |
| Shoreline curve tiles | 15 | `tiles/beach/shoreline_19..29` |
| Plain water tiles | 15 | `tiles/water/water_extra_24..34` |
| Grass/rock cliff-edge transitions | 4 | `tiles/transitions/trans_extra_107..110` |
| Grass-topped island fragment | 1 | `tiles/elevation/island_fragment_1` |
| Wood-plank dock tiles (full tile) | 2 | `tiles/paving/wood_dock_tile_1..2` |
| Loose dock hardware (pilings, panel, plank bundle) | 6 | `props/dock_piling_1..4`, `dock_wall_panel_1`, `dock_plank_bundle_1` |
| Palm trees | 8 | `nature/trees/palm_1..8` |
| Vegetation (bush, fern, mangrove stump, berry bush) | 12 | `nature/vegetation/bush_1..9`, `fern_1`, `mangrove_stump_1`, `berry_bush_1` |
| Rocks (boulder cluster, pebble, coral) | 7 | `nature/rocks/boulder_cluster_1..2`, `pebble_1..3`, `coral_clump_1..2` |
| Decorative water tiles (driftwood/rock-in-water/tide pool) | 11 | `props/driftwood_water_tile_1..3`, `nature/rocks/rock_water_tile_1..4`, `rock_water_cluster_1`, `props/tide_pool_2..3` |
| Driftwood props | 5 | `props/driftwood_1..3`, `driftwood_crossed_1` |
| Containers (crate/barrel variants) | 12 | `props/crate_1`, `crate_dark_1..2`, `crate_banded_1`, `crate_cage_1`, `crate_trough_1`, `barrel_1..4` |
| Misc set-dressing | 13 | `props/hook_post_1..2`, `clothesline_1`, `campfire_5`, `jug_1`, `anchor_1`, `sandcastle_1`, `signpost_7`, `market_stall_1`, `torch_1`, `beach_lounge_set_1`, `bunting_1` |
| Wildlife | 9 | `wildlife/crab_1..6`, `seagull_1..2`, `seagull_flying_1` |
| Landmarks | 3 | `landmarks/cave_waterfall_1`, `castaway_camp_1`, `shipwreck_debris_1` |
| Treasure | 2 | `treasure/chest_1`, `treasure_marker_1` |
| World (alt rowboat) | 1 | `world/rowboat_alt_1` |
| **Background (whole scene, uncut)** | 1 | `backgrounds/castaway_shipwreck_cove_1.png` |

Numbering continues existing sequences where a matching descriptor already existed in the library
(`beach`, `shoreline`, `water_extra`, `trans_extra`, `signpost`, `campfire`, `tide_pool`); every
other descriptor is new to this delivery and starts at `_1`.

## Judgment calls worth flagging

- **`treasure_marker_1` is a flag-planted-beside-a-small-chest composition**, not just a flag —
  connected-component detection found the flag pole's grass tuft touching the chest's own base
  shadow, fusing them into one real blob. Kept as one image rather than forcing a split, per the
  "don't force a merge or split just to match an assumption" rule — the source art draws them
  together.
- **`beach_lounge_set_1`** (umbrella + deck chair + barrel) is similarly one fused composition, not
  three separate props — genuinely touching in the source, kept as one placeable set-piece.
- **`landmarks/castaway_camp_1`** (tent + campfire + two crates) is the same situation — filed as
  one named scene vignette rather than force-split into individual props.
- **New descriptor names were used for rocks/vegetation rather than continuing `rock_small`,
  `boulder_large`, or `mangrove`** — this sheet's pixel-art style is visually distinct from the
  earlier deliveries that established those series, and mixing two different art styles under one
  descriptor name would make future browsing misleading. `boulder_cluster`, `pebble`,
  `coral_clump`, and `mangrove_stump` are new, deliberately separate series.
- **`world/rowboat_alt_1`** is a second, different-style rowboat sprite alongside the existing
  `world/rowboat.png` — kept as an explicit "alt" rather than overwriting, since the two are drawn
  in different styles and neither is strictly an upgrade of the other.

## Verification

Ran the systematic edge-opacity defect scan (`(edge_alpha > 200).mean() > 0.5` on all 4 borders)
across all 128 cut files before filing: zero hits. Built and visually reviewed labeled contact
sheets covering every one of the 128 items before filing (not just after), confirming real
per-item boundaries, no baked-in noise/tint, and no merged/split content beyond the three
deliberate fused compositions noted above.

## Wiring

**Not yet wired.** This delivery is cutting + filing only, per the request ("cut the sheet into
assets for the game scene and environments"). None of `worldSprites.ts`, `MapScreen.tsx`,
`scenery.ts`, or `landmarks.ts` reference any of these 128 files yet — see `GAME_DESIGN.md` item 162
for the plan-not-yet-executed note.
