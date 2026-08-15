# Sprite Asset Library

Reference for where new art goes and how it gets cut. Read this before dropping in a new
reference sheet or adding a new folder — the goal is that a year from now, finding "the rock
sprites" or "the tavern interior tiles" is a one-glance folder lookup, not a grep.

## Folder map

| Folder | Holds | Wired from |
|---|---|---|
| `tiles/` | Ground/terrain: grass, dirt, sand, paths, cobble, road, jungle floor, beach, sea, cliff faces/edges, elevation ledges, stairs/ramps, transition blends, mud/puddle/bridge | `src/data/worldSprites.ts` |
| `nature/` | Vegetation & natural scatter: trees, bushes, flowers, mushrooms, vines, weeds, rocks, boulders, logs, stumps | `src/data/worldSprites.ts` |
| `props/` | Placeable set-dressing: crates, barrels, sacks, hay, campfires, signposts, fountains, lampposts, market stalls, benches, flags | `src/data/worldSprites.ts` |
| `decals/` | Ground overlays — cracks, stains, footprints, scorch marks, spilled-cargo splatter. Meant to sit *on top* of a ground tile, not replace it | *(not yet wired)* |
| `buildings/` | Building icon art (whole-building sprites) + building materials (roofs, walls, windows, doors, chimneys) | `src/data/worldSprites.ts` → `buildings.ts` `spriteId` |
| `houses/` | Generic house variants (no per-house identity) | `src/data/worldSprites.ts` |
| `interiors/` | Building-interior floor tiles, furniture, interior decor | *(not yet wired — `src/data/interiors.ts` currently uses a procedural fallback)* |
| `world/` | One-off/singular world objects: dock/pier kit, Tortuga gate, flags | `src/data/worldSprites.ts` |
| `characters/` | NPCs beyond Scally: crew portraits, pirate lords, merchants, enemies, prisoners | *(not yet wired)* |
| `scally/` | The player character's own sprite set (idle, run, emotes, faces) — kept separate from `characters/` since he's the one character with a full animation set, not a single portrait | `src/data/scallySprites.ts` (or equivalent) |
| `ship/` | Ship sprites: sailing/turning/docking frames, wake, sails | `src/data/shipSprites.ts` |
| `items/` | Treasure, weapons, inventory/collectible icons | *(not yet wired)* |
| `effects/` | Particles, splashes, weather, combat FX | *(not yet wired)* |
| `ui/` | HUD icons, buttons, banners, signage-as-UI (not signage-as-world-prop, which is `props/`) | *(not yet wired)* |

When a new sheet doesn't obviously fit one folder (e.g. a sheet mixing furniture and wall
materials), it's fine to split its cuts across folders by content rather than by source sheet —
the folder is "what this is," not "where it came from."

## Naming convention

`{category}_{n}.png`, e.g. `rock_small_4.png`, `path_dirt_11.png`, `tree_3.png`. Plain sequential
numbers, not semantic shape names (not `path_dirt_corner_1.png`) — see below for why.

## Cutting convention (read before cutting a new sheet)

**Do not assume a grid.** Every reference sheet so far has looked like a uniform grid at a glance
and turned out not to be one on inspection — corner/notch shapes, wider cross-junctions, tapered
edges, and scattered props all break a fixed pitch somewhere. Any method that assumes a uniform
cell size will eventually misalign: either clipping a tile's own edge short, or bleeding into a
neighbor.

The reliable method, used for every sprite currently in this library:

1. **Connected-component detection**, not pitch division. Chroma-key the sheet's background to a
   distance-from-background mask (`BG ≈ near-black`, see `scipy.ndimage.label`), and crop each
   connected blob to its own tight bounding box. No assumption about how many items a panel
   "should" contain or what shape family it belongs to — whatever the pixels show is what gets
   cut.
2. **Generous, non-overlapping windows per panel/region**, not one global pass over the whole
   sheet — a global pass fuses unrelated content (banners, borders, neighboring panels) into one
   blob. Window each labeled panel separately.
3. **When one object's own art fragments** (stonework with dark mortar lines, bare branches, a
   corner shape with a thin waist), group with a *dilated* copy of the mask first, but still
   measure and crop from the *real, undilated* pixels within each group. This bridges an object's
   own internal gaps without also bridging the real gap to its neighbor.
4. **Alpha, not a flattened background.** Every output PNG is RGBA — background pixels are
   `alpha=0`, sprite content ramps up to full opacity with a short (~30-unit color-distance)
   feathered band so edges don't look hard-cut when composited over other art.
5. **Verify by looking, not just by counting.** A component count matching what the sheet's label
   implies is not proof of correctness — two merges can cancel out to the "right" number. Check
   actual crop dimensions for suspicious outliers (much wider/taller than its neighbors) and
   spot-check a sample visually before calling a batch done.

Full narrative of how this method was arrived at (including the false starts — uniform grid,
measured-pitch grid, threshold-count auto-tuning) is in `GAME_DESIGN.md` items 97–99.
