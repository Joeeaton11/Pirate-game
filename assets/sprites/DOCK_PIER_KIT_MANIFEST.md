# Dock/Pier Kit — Delivery Manifest

Source: `assets/brand/tileset-catalog/dock_pier_kit_v1.png` (1536×1024) — a modular working-harbour
kit: dock/pier tile modules (plain, corner, junction, railed, cargo, raised platform), stairs/ramps,
loose pilings and planks, hardware (cleats, bollards, rings, life rings, coiled rope), a dock crane,
a hanging lantern post, an anchor, and two seagulls. Uploaded with no accompanying text, as a direct
continuation of the previous "cut the sheet into assets" request.

Cut 2026-08-23 with the same discipline as every prior delivery this session: real per-item
connected-component detection, no assumed grid — every module, post, and loose plank in this sheet
is already naturally isolated by real gaps, so this cut needed no fallback splitting.

## Real defect found and fixed before cutting: same corrupted-alpha issue as the tropical island sheet

This upload had the identical defect diagnosed and fixed for the tropical-island sheet earlier the
same day: the file's own alpha channel was noisy across the whole image (confirmed by sampling a
supposedly-empty background patch and finding alpha ranging 0-250 within it), while the underlying
RGB was fine. Fixed the same way — discard the file's own alpha, re-derive a clean one via a 5×5
median filter + threshold(128) + one 3×3 binary-opening pass, then a light Gaussian feather (σ=0.6)
for the final edge. Produced a clean 80-component mask on the first attempt.

## 80 sprites filed

| Category | Count | Destination |
|---|---|---|
| Dock modules (plain/basic tile shapes, incl. built-in-ladder and small variants) | 15 | `harbour/dock_module_1..15` |
| Dock module — corner (L-shape) | 1 | `harbour/dock_module_corner_1` |
| Dock module — junction (T-shape) | 1 | `harbour/dock_module_junction_1` |
| Dock module — rope-railed | 6 | `harbour/dock_module_railed_1..6` |
| Dock module — cargo (barrel/crates on deck) | 2 | `harbour/dock_module_cargo_1..2` |
| Raised dock platform (cross-braced legs) | 4 | `harbour/dock_platform_1..4` |
| Dock stairs/ramps | 6 | `harbour/dock_stairs_1..6` |
| Pilings (plain) | 10 | `harbour/piling_1..10` |
| Pilings (rope-wrapped) | 5 | `harbour/piling_roped_1..5` |
| Pilings (hanging hook/chain) | 2 | `harbour/piling_hook_1..2` |
| Loose planks (single board) | 8 | `harbour/plank_1..8` |
| Loose plank bundles | 5 | `harbour/plank_bundle_1..5` |
| Plank fragment / leaning plank | 2 | `harbour/plank_fragment_1`, `plank_leaning_1` |
| Cleats (continuing the existing series) | 3 | `harbour/cleat_2..4` |
| Life rings | 2 | `harbour/life_ring_1..2` |
| Rope span (between 2 posts, with hanging life ring) | 1 | `harbour/rope_span_1` |
| Coiled rope | 1 | `harbour/rope_coil_1` |
| Bollard (metal) | 1 | `harbour/bollard_1` |
| Anchor | 1 | `harbour/anchor_1` |
| Dock lantern (post + lit hanging lantern) | 1 | `harbour/dock_lantern_1` |
| Crane | 1 | `harbour/crane_1` |
| Seagulls (standing) | 2 | `wildlife/seagull_3..4` |

## Judgment call: new descriptor names instead of continuing the existing harbour series

This sheet's pixel-art style (brighter, cleaner linework) is visibly distinct from the earlier
2026-08-20 harbour delivery that established `pier_module_N`, `mooring_post_N`, `dock_ramp_N`, and
`boardwalk_N`/`boardwalk_corner_N` — confirmed by a direct side-by-side comparison before deciding.
Continuing those series would mix two different art styles under one descriptor name and make
future browsing misleading (e.g. `pier_module_3` rendering nothing like `pier_module_1`/`_2` next to
it). New, parallel descriptor names (`dock_module`, `piling`, `dock_stairs`, etc.) were used instead
— same reasoning as the tropical-island delivery's `boulder_cluster`/`pebble`/`coral_clump` earlier
today. The one exception: `cleat` continues its existing single-item series, since a small ring
fitting doesn't carry a noticeable style clash the way a whole structure does.

## Verification

Ran the systematic edge-opacity defect scan (`(edge_alpha > 200).mean() > 0.5` on all 4 borders)
across all 80 cut files before filing: zero hits. Built and visually reviewed labeled contact-sheet
grids covering every one of the 80 items before filing.

## Wiring

**Not yet wired**, same as the tropical-island delivery earlier today — cutting and filing only.
None of `worldSprites.ts`, `MapScreen.tsx`, or the existing dock-rendering code in `buildings.ts`
reference any of these 80 files yet.
