# Painted Tortuga town pipeline

The Tortuga town centre is one painted picture (AI-painted tiles in the MASTER_STYLE_harbour
style), cut into chunks in `assets/sprites/tortuga_town/painted/` and mapped for walking in
`src/town/tortugaPainted.generated.ts`.

- `tiles.py` / `canvas.py`: the 2x3 tile grid, guide sketches and neighbour strips sent to the
  image model (one tile per generation).
- `colorfix2.py`: colour-matches each painted tile to the reference.
- `stitch.py`: blends the tiles into `town.png` (world x -150..300, y -455..31.7, 4.8 px/unit).
- `grid.py`: grid overlay views for reading coordinates off the painting.
- `mapdata.py`: hand-measured buildings (with door x and building id), walls, stair gaps, solids.
- `buildmap2.py`: water + vegetation masks + mapdata -> blocked cells -> merged rects + doors.
- `reach.py`: flood-fill preview of what's walkable from the spawn, doors marked.
- `export_ts.py`: writes the rects and doors into `tortugaPainted.generated.ts`.
