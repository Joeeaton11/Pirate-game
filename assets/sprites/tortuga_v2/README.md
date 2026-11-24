# Tortuga Cove — art pass v2 (2026-11-14)

Generated art for the redesigned Tortuga Cove, wired in via `src/data/tortugaV2.ts` and the
`SHOW_TORTUGA_V2` layer in `src/screens/MapScreen.tsx`.

- `backdrop.jpg` — painted terrain only (ground, roads, plaza, coast, reef, river, lagoon, trees,
  rocks, stone quays). 3900×3420 px covering island-relative x −650…650, y −570…570 (3 px per
  world unit). No buildings, houses, props or piers — those are drawn separately on top.
- `buildings/<buildingId>.png` — one bespoke, front-facing sprite per named building (57). Files
  for the 45 live buildings are named after their `buildings.ts` id; the 12 survey "proposed"
  buildings (not yet in `BUILDINGS`) use `tortuga_v2_<slug>` and are render-only for now.
- `houses/house_1..4.png`, `props/*.png` — background houses and street dressing.

Style: pixel-art, matching the harbour reference (palette/lighting) and the Gunsmith/Smuggler's
Den reference (camera angle: facade parallel to the screen, roof ridge horizontal — never
isometric). Each building's door faces the street it was snapped to (`facing` in tortugaV2.ts).
Generated with Nano Banana 2.1 via Weave; building sprites one asset per image.
