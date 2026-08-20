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

## Folder size note

`tiles/` and `nature/` were both well past this directory's own README-stated subfolder threshold
(~15-20 files with distinct sub-groups) — 268 and 116 flat files respectively. **Split on
2026-08-17** into `tiles/{ground,water,paving,paths,transitions,elevation,beach,bridges}/` and
`nature/{vegetation,trees,rocks}/` (see `GAME_DESIGN.md` item 140 for the full account). All 227
affected `require()` paths in `worldSprites.ts` were rewritten in the same pass and verified
against disk — nothing left pointing at the old flat paths. Filenames themselves are unchanged,
only the folder segment grew.
