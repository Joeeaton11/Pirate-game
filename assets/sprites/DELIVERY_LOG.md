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
| 2026-08-20 | `assets/brand/tileset-catalog/terrain_extras_3_sheet_v1.png` | `TERRAIN_EXTRAS_3_MANIFEST.md` | 306 | `tiles/` (ground, paths, paving, transitions, beach, elevation, bridges, water), `nature/` (trees, rocks, vegetation), `props/`, `decals/`, `water_fx/`, `harbour/`, `buildings/` (new `floor_tile_*`), `weather_fx/` (first entries — previously empty) | **No** — cut and filed only, not yet wired into any renderer |

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
