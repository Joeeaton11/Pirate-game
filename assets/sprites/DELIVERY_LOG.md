# Sprite Delivery Log

Running index of every art delivery that's been cut and filed into this library. One row per
delivery batch — not per sprite, `TERRAIN_EXTRAS_MANIFEST.md`-style docs (or their future
equivalents) carry the per-sprite detail. This doc exists so that after many more deliveries land,
"which sheet did this come from" and "is this wired in yet" both stay answerable at a glance
instead of requiring a search through commit history.

**Update this on every delivery** — add a row when a batch is cut and filed, flip the Wired column
once it's actually wired into a renderer (see each folder's own `Wired from` column in this
directory's `README.md`).

| Date | Source | Manifest | Items | Folders touched | Wired? |
|---|---|---|---|---|---|
| 2026-08-11 | `assets/brand/tileset-catalog/master_catalog_v1.png` | — (see `ART_BRIEF.md` Part A/C, `GAME_DESIGN.md` items 152–158) | ~30+ | `buildings/`, `world/`, `houses/`, misc | Partial — buildings/houses wired via `spriteId`; some categories still unused |
| 2026-08-11 | `assets/brand/tileset-catalog/tortuga_focus_v1.png` | — (see `ART_BRIEF.md`) | — | overlaps master_catalog_v1 | Partial |
| 2026-08-17 | `assets/brand/tileset-catalog/terrain_extras_sheet_v1.png` | `TERRAIN_EXTRAS_MANIFEST.md` | 245 | `tiles/` (now subfoldered — see below), `nature/` (now subfoldered), `props/`, `decals/`, `water_fx/`, `landmarks/` | **No** — cut and filed only, not yet wired into any renderer |
| 2026-08-20 | `assets/brand/tileset-catalog/terrain_extras_2_sheet_v1.png` | `TERRAIN_EXTRAS_2_MANIFEST.md` | 145 | `tiles/` (ground, water, paving, elevation, transitions, bridges), `nature/` (trees, vegetation, rocks), `props/`, `decals/`, `water_fx/`, `landmarks/`, `buildings/` (new `plinth_*` materials), `harbour/` (first entries — previously empty) | **No** — cut and filed only, not yet wired into any renderer |
| 2026-08-21 | `assets/brand/tileset-catalog/terrain_extras_3_sheet_v1.png` | `TERRAIN_EXTRAS_3_MANIFEST.md` | 305 | `tiles/` (ground, paths, paving, transitions, beach, elevation, bridges, water), `nature/` (trees, rocks, vegetation), `props/`, `decals/`, `water_fx/`, `harbour/`, `buildings/` (new `floor_tile_*`), `weather_fx/` (first entries — previously empty) | **No** — cut and filed only, not yet wired into any renderer. Re-cut three times on 2026-08-21, each round triggered by an independent `asset-qa` pass finding what the previous round's own re-verification missed: round 1 fixed baked-in caption text, wrong category boundaries, and a miscounted Panel 13/22 structure (306→309 items); round 2 fixed Panels 4/10/11 mislabeled category slots and Panel 13's Palms/Broadleaf undercounting/fragmentation (309→311); round 3 fixed Panel 11 (every category was one whole scene wrongly split into an "A"/"B" pair, 8→4 items), Panel 10 Plateaus (2 whole columns wrongly split into 4, 16→14 for the panel), and Panel 13 Dead Trees (all 6 clipped at the top) (311→305). See `TERRAIN_EXTRAS_3_MANIFEST.md`'s intro and `GAME_DESIGN.md` items 145–147 |
| 2026-08-21 | `assets/brand/tileset-catalog/terrain_extras_4_sheet_v1.png` | `TERRAIN_EXTRAS_4_MANIFEST.md` | 234 | `tiles/` (ground incl. new `rocky_ground_*`, paths, paving, beach, water, transitions, elevation, bridges), `nature/` (trees, vegetation, rocks), `props/` (new `beach_detail_*`), `water_fx/` (new `wave_*`) | **No** — cut and filed only, not yet wired into any renderer. Most defect-catching happened during this delivery's own cutting pass: a Panel 21 category-boundary misalignment (Barrels/Sacks/Campfire/Signpost content shifted one category slot from its label) was caught by reading individual crops directly and re-cut correctly; a stray 468×5px border-line artifact in Panel 12 slipped past the outlier-area filter and was found and deleted (19 real items, not 20); three stale pre-fix scratch files for Panels 10/14/16 were found via mtimes and discarded before filing. An independent `asset-qa` pass run right after the initial commit then found one further real defect: all 6 Panel 16 tree crops (`nature/trees/tree_25..29`, `tree_dead_8`) had the panel's bronze border line baked into their bottom edge plus a background halo, from `content_bbox` unioning in the panel's outer border row. Re-measured and re-cut, re-filed over the same 6 filenames same day. See `TERRAIN_EXTRAS_4_MANIFEST.md`'s intro for full detail |
| 2026-08-22 | `assets/brand/scallywags_boat_sprite_library_v1.png` | `assets/sprites/ship/boats/BOAT_LIBRARY_MANIFEST.md` | 96 | `ship/boats/` (new folder — 10 boat types × 8 directions, 16 damaged/wrecked/burning example variants) | **Partial** — 4 of 10 boat types (`fishing_boat`, `large_merchant_ship`, `cutter`, `brigantine`) wired into the merchant encounter system (`MapScreen.tsx`'s `triggerMerchant`/`merchantShipFlash`, `shipSprites.ts`'s `merchantShipSpriteSource`), confirmed rendering correctly in a real headless-Chromium run. The other 6 types (Dinghy, Small Sloop, Pirate Sloop, Merchant Schooner, Heavy Pirate Ship, Flagship) and all 16 damage-state variants are cut and filed but unused. A row-divider-line bleed bug (same class as the 2026-08-21 terrain-extras-4 Panel 16 fix) first shipped in 12 of the 80 boats — caught by an edge-opacity scan run after initial filing, root-caused to three compounding issues (no single trim value works across all 10 rows; a targeted divider-color exclusion was needed instead; `crop_rgba`'s `pad` was independently re-including the divider even after the exclusion worked), fixed, and re-filed same day. See `BOAT_LIBRARY_MANIFEST.md` and `GAME_DESIGN.md` item 149 |
| 2026-08-22 | `assets/brand/scally_walk_8dir_source.png` | `SCALLY_WALK_8DIR_MANIFEST.md` | 53 | `scally/` (replaces old `walk_down/left/right/up_*.png`, renames `idle_down/left/right/up_*.png` to compass keys, deletes now-obsolete `turn_se/ne/nw/sw.png`) | **Yes** — full replacement of Captain Scally's 4-cardinal-only walk cycle with true 8-directional walking. `FacingDirection` expanded to match `ShipHeading`'s compass keys; `MapScreen.tsx`'s pan-gesture direction bucketing now reuses `headingFromVector` instead of the old 4-way hysteresis logic; the old `turnFrameFor` mid-pivot workaround was removed as redundant now that real diagonal walk art exists. Confirmed rendering correctly for all 8 directions (and both idle cases — real breathing loop for the 4 cardinals, a static first-walk-frame hold for the 4 diagonals, which have no idle art) in a real headless-Chromium run, 0 console errors. Cut cleanly on the first attempt — 0 hits on the edge-opacity defect scan. See `SCALLY_WALK_8DIR_MANIFEST.md` and `GAME_DESIGN.md` item 151 |
| 2026-08-22 | `assets/brand/scally_idle_animations_source.png` | `SCALLY_IDLE_ANIMATIONS_MANIFEST.md` | 73 | `scally/` (upgrades south idle breathing loop, replaces `emote_cheer/think/laugh/sit.png` with 9 new `idle_flourish_*` animations) | **Yes** — south breathing loop upgraded 3→7 frames (e/n/w unchanged, no matching art); the old 4-item single-static-pose `IDLE_FLOURISH_POOL` replaced entirely by `IDLE_FLOURISHES`, 9 real multi-frame animated vignettes cycled by a new interval in `MapScreen.tsx`. This sheet turned out to be auto-laid-out per panel rather than a rigid shared grid — two panels sharing what looked like one row-group actually had different content-bottom/label-start boundaries, which first shipped a label-digit bleed into one panel (Bored/Boot Kick) and title-text bleed into three others (Sitting on Barrel, Scratch Head/Thinking, Fishing) before being caught and fixed during this delivery's own cutting pass. Confirmed two different runs of a real headless-Chromium session picked two different flourishes at random (Hat Tip/Grin, Fishing) and a fine-grained capture showed genuine frame-by-frame motion within one, 0 console errors. See `SCALLY_IDLE_ANIMATIONS_MANIFEST.md` and `GAME_DESIGN.md` item 152 |

## Known free wiring opportunities (found while auditing the 2026-08-17 delivery)

Worth acting on whenever wiring work starts, without needing new art:

- **8 of 12 entries in `src/data/landmarks.ts` have no `sprite` field at all** — several of the
  2026-08-17 delivery's `landmarks/hero_landmark_*` pieces are strong direct matches: Shipwreck
  Beached → `tortuga_wreck_santa_catalina`/`tortuga_wreck_bonne_esperance`; Ancient Temple Ruins →
  `tortuga_old_landing`; Giant Banyan → `tortuga_high_woods`. `tortuga_town_square` and
  `tortuga_lighthouse` already have placeholder-tier sprites that the new hero pieces
  (`fountain_complete_1.png`, `hero_landmark_7` Lighthouse Tall) could upgrade.
- **`worldSprites.ts`'s variant-pool tiles** (`GRASS_VARIATION_TILES`, `COBBLE_TILES`,
  `TRANSITION_GRASS_DIRT_ROAD_TILES`, etc.) already pick randomly per-instance for visual variety —
  the 2026-08-17 delivery's `ground_extra_*`, `paving_extra_*`, and `trans_extra_*` slot directly
  into that existing pattern and would meaningfully widen it (the game has never had snow/ice
  ground tiles before this delivery; transition tiles have never covered grass↔water or
  cliff↔anything before this delivery).

## Known free wiring opportunities (found while filing the 2026-08-20 delivery)

- **`harbour/` went from an empty, unwired folder to 8 real dock/pier/mooring sprites** — the
  README already names it as feeding the working-harbour scenes distinct from `world/`'s one-off
  landmark objects, but nothing has drawn from it yet. This is the first delivery with anything to
  wire there.
- **A second waterfall (`waterfall_complete_2`) and a second Neptune Fountain
  (`fountain_complete_2`)** exist now alongside the first delivery's — either could become a
  distinct landmark on a different island rather than reusing the same hero art twice.
- **`buildings/plinth_1..6`** are the first building-material (not whole-building) sprites in that
  folder — raised-foundation edge/corner/fill pieces that could dress the base of existing
  buildings once a renderer supports layering a foundation course under a building sprite.

## Known free wiring opportunities (found while filing the 2026-08-20 terrain-extras-3 delivery)

- **`weather_fx/` went from an empty, unwired folder to 4 real atmosphere sprites**
  (`fog_patch_1`, `cloud_1`, `mist_1`, `dust_cloud_1`) — README already names it as feeding
  rain/storm/fog/mist effects, but this is the first delivery with anything to wire there.
- **This delivery roughly doubles or more several already-large variant pools** —
  `ground_extra_*` now runs to 61, `trans_extra_*` to 106, `bush_plant_*`/`flowers_*` each grew by
  24. `worldSprites.ts`'s existing `GRASS_VARIATION_TILES`/`TRANSITION_GRASS_DIRT_ROAD_TILES`-style
  pools would get meaningfully more varied by pulling from the new numbers without any code
  change beyond widening the array literal.
- **Two brand-new tile categories the game has never had:** `desert_*` (5 ground tiles — cracked
  earth, dry sand, cactus ground, rocky desert, dunes) and island-special tiles
  (`volcanic_rock_1`, `lava_flow_1`, `coral_ground_1`, `water_fx/geyser_1`) — no existing island in
  `islands.ts` is currently a desert or volcanic biome, so these are art waiting on a place to use
  them rather than a gap in an existing scene.
- **`decals/map_edge_*` (4 items)** are purpose-built for a screen/map-boundary vignette effect
  that doesn't exist yet in `MapScreen.tsx` — distinct from the ground-overlay decals already
  wired-for elsewhere in that folder.

## Known free wiring opportunities (found while filing the 2026-08-21 terrain-extras-4 delivery)

- **`water_fx/wave_1..11`** are the first standalone wave-crest sprites in the library — distinct
  from the flat `tiles/water/sea_*` surface tiles, these could animate/overlay onto open-water map
  tiles for a moving-sea effect that doesn't exist yet.
- **`props/beach_detail_1..11`** (starfish, shells, driftwood, coral fragments, etc.) are
  purpose-built beach-scatter clutter — no current island scene places small objects directly on its
  beach tiles the way `decals/`-style scattering does for ground.
- **`tiles/beach/shoreline_5..18`** roughly quadruples that series (was 4, now 18) and adds a second
  transition type (`sea_to_rock`, not just `sea_to_sand`) — any coastline currently using only
  `shoreline_1..4` could get meaningfully more visual variety and a rocky-coast option for free.
- **`tiles/ground/rocky_ground_1..4`** is a brand-new ground tile type (rock-strewn ground, distinct
  from both `nature/rocks` standalone objects and the cliff tile series) with no current placement.

## Known free wiring opportunities (found while filing the 2026-08-22 boat library delivery)

- **6 of the 10 boat types are cut and filed but completely unused**: Dinghy, Small Sloop, Pirate
  Sloop, Merchant Schooner, Heavy Pirate Ship, and Flagship. The rival/navy threat factions
  (`src/data/threats.ts`) currently have no ship art of their own the way merchants now do — Heavy
  Pirate Ship or Pirate Sloop would be a natural fit for a rival ambush's visible vessel, the same
  pattern `triggerMerchant`/`merchantShipFlash` in `MapScreen.tsx` already established and could be
  generalized to `triggerAmbush`.
- **All 16 damaged/wrecked/burning example variants (`boats/damaged_example_1..6`,
  `wrecked_example_1..6`, `burning_example_1..4`) are unused.** The wrecked variants in particular
  are ready-made world-prop material (the sheet's own subtitle says "use as world props or
  obstacles") — distinct from the existing `tortuga_wreck_*` landmark sprites, these are small
  enough to scatter as ambient sea/coastline debris rather than a named landmark.
- **Merchant ship art is currently a single fixed sprite per template** — `merchantShipSpriteSource`
  always renders the same boat/heading pairing for a given `templateId`; the damaged/burning
  variants above would be a natural fit for showing the merchant vessel's own state during or after
  the encounter (e.g. a burning-ship flash on defeat) if that becomes a desired gameplay beat.

## Folder size note

`tiles/` and `nature/` were both well past this directory's own README-stated subfolder threshold
(~15-20 files with distinct sub-groups) — 268 and 116 flat files respectively. **Split on
2026-08-17** into `tiles/{ground,water,paving,paths,transitions,elevation,beach,bridges}/` and
`nature/{vegetation,trees,rocks}/` (see `GAME_DESIGN.md` item 140 for the full account). All 227
affected `require()` paths in `worldSprites.ts` were rewritten in the same pass and verified
against disk — nothing left pointing at the old flat paths. Filenames themselves are unchanged,
only the folder segment grew.

The 2026-08-20 terrain-extras-3 delivery pushed several of those subfolders considerably further:
`tiles/ground/` (136), `tiles/transitions/` (159), and `nature/vegetation/` (128) are now well
past the original 15-20-file threshold *within their own subfolder*. Not split further yet — the
same file/require-path-rewrite risk calculus applies as before splitting `tiles/`/`nature/`
themselves, and none of these categories obviously decompose into distinct sub-groups the way
`tiles/` did (e.g. `tiles/ground/` mixes plain grass/dirt variants with jungle floor, mud, desert,
and volcanic tiles that don't yet have enough of any one theme to justify their own folder).
Flagged here for the next delivery or two to watch, not acted on unilaterally.
