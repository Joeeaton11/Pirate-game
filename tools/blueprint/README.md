# Island blueprints

The plan every art pass is built on. One source of truth per island; the game's walk map, doors and
the in-game Plan view are all generated from it — nothing is placed by hand in game code.

Layers, bottom to top: terrain zones -> inland water -> roads and plazas -> buildings (with doors)
-> trees and rocks -> props -> names.

- `plan_tortuga.py` — the authored plan outside the painted town (zones, lagoon/river, roads,
  plazas, buildings + door side, props, labels). Edit this to change the island.
- `build_tortuga.py <town.png> [preview.png]` — checks the plan (buildings on land, off roads, not
  touching, doors within reach of a road; roads on land), scatters trees per zone, derives the
  painted town's plan from its walk map, and writes `src/blueprint/tortugaBlueprint.generated.ts`
  plus a preview image.
- In game: the 📐 Plan button on the map (or `?plan=1` on web) swaps the art for the plan; walls,
  trees and doors work, so the layout can be walked before any art is made.
