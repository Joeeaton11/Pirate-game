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
| 2026-08-17 | `assets/brand/tileset-catalog/terrain_extras_sheet_v1.png` | `TERRAIN_EXTRAS_MANIFEST.md` | 245 | `tiles/`, `nature/`, `props/`, `decals/`, `water_fx/`, `landmarks/` | **No** — cut and filed only, not yet wired into any renderer |

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

## Folder size note

`tiles/` (268 files) and `nature/` (116 files) are both well past this directory's own
README-stated subfolder threshold (~15-20 files with distinct sub-groups). Not split yet because
doing so means updating every existing `require()` path already wired into `worldSprites.ts` for
the pre-existing files in those folders — a real, if mechanical, refactor, not a free action.
Worth doing before too many more deliveries land on top of an already-large flat folder, but
flagged here rather than done unilaterally.
