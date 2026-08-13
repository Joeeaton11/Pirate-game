# Tortuga Art Pipeline — Asset Brief

Companion doc to the published artifact (ask in-session for the current link, or check `claude.ai/code/artifacts`).
This is the plain-text record of the same audit, for git history / future sessions. Written 2026-08-13.

## Why this exists

Before commissioning any new art for the ~30-building-strong Tortuga Cove town, we audited the two
reference sheets already on disk (`assets/brand/tileset-catalog/master_catalog_v1.png` and
`tortuga_focus_v1.png`) against everything already cut (`src/data/worldSprites.ts`) and everything the
game now needs (`src/data/buildings.ts`, `houses.ts`, `landmarks.ts`, `streets.ts`). Only 12 of the
~120+ items across both sheets have ever been cut into sprites — a lot of what looked like "new art
needed" turned out to already be sitting there, unused.

## Part A — Already yours, cut these first (zero new generation)

Both sheets are 1536×1024 catalog grids, same cutout technique as the existing 12 sprites (see the
gradient/edge-threshold method documented at the top of `worldSprites.ts`).

| Asset | Source | Becomes |
|---|---|---|
| 8 house designs | `master_catalog_v1.png` → "Buildings – Residential" | Real house art, replacing the 3-emoji rotation in `MapScreen.tsx`'s `HOUSE_EMOJIS` |
| Jail | `master_catalog_v1.png` → "Buildings – Special" (labeled JAIL) | `tortuga_gaol` spriteId |
| Castle/fort compound | `master_catalog_v1.png` → "Buildings – Special" | `tortuga_fort` (Fort de Rocher) spriteId, currently emoji-only |
| 2 lookout towers | `master_catalog_v1.png` → "Buildings – Special" | `tortuga_signal_post` + `tortuga_old_watchtower` spriteIds |
| Standalone lighthouse | `master_catalog_v1.png` → "Buildings – Special" | `tortuga_lighthouse` landmark — has no sprite at all today |
| Chapel | `tortuga_focus_v1.png` row 2, next to the lighthouse crop | `tortuga_chapel` (Chapelle Notre-Dame) — re-crop `lighthouse_chapel.png` into two separate files, it was cut merged and never wired to `BUILDING_SPRITES` |
| Full dock/harbor kit | `master_catalog_v1.png` → "Docks & Harbour" | Replaces the flat-line pier/quay rendering in `MapScreen.tsx` |
| 2nd ship, rowboats, a shipwreck | `master_catalog_v1.png` → "Ships & Boats" | Covers one of the two wreck landmarks for free |
| Real trees & bushes | `master_catalog_v1.png` → "Vegetation" | Replaces 🌲🌳🌴🌿 across `scenery.ts` (400+ instances) |
| Cliffs, rocks, cave mouths | `master_catalog_v1.png` → "Cliffs, Rocks & Caves" | Covers The Smugglers' Grotto for free; upgrades El Fuerte Viejo's rubble |
| Beach/nature detail | `master_catalog_v1.png` → "Nature Details" | Dresses the 3 real beaches + both new coves |
| Street props (well/fountain, lamppost, fence, stall) | `master_catalog_v1.png` → "Street Props" | Basse-Terre Square's well landmark, general set dressing |
| Extra terrain tiles (dirt, water/foam edges) | `master_catalog_v1.png` → "Terrain & Tiles" | `GROUND_TILES.sand/wood/water` already exist in code but aren't wired into any renderer yet — worth doing at the same time |
| Flags, signage, props | `master_catalog_v1.png` → "Flags & Banners," "Signs & UI Elements," "Props & Containers" | General decoration |
| Effects, treasure, map icons | `master_catalog_v1.png` → "Effects & Particles," "Treasure & Collectibles," "Map Objects" | Battle polish, Treasure Codex art, possible map-UI reskin |

## Part B — Free reuse (spriteId only, zero art)

| Building | spriteId | Why |
|---|---|---|
| The Gunsmith's Shop | `'weapons'` | Same trade as the already-cut Weapons shop |
| The Boarding House | `'inn'` | A boarding house is a small inn |
| Fishermen's Guildhall | `'fishmonger'` | Same trade, different scale |
| The Ship's Provisioner | `'trading_co'` | Same shop archetype |
| The Careening Shed | `'shipyard'` | Shared with Shipwright's Slip |

## Part C — New buildings that need real generation (16 total, 3 sheets)

Full prompts (with the locked style paragraph) live in the published artifact — summary here for reference:

- **Sheet 1, Trades & Industry (6):** The Ropewalk, The Netmender's Shed, The Tannery, The Timber Yard, The Salt Works, The Tobacco Warehouse
- **Sheet 2, Commerce & Vice (5):** The Vendue House, The Counting House, The Lucky Draw, The Apothecary, The Baker's Oven
- **Sheet 3, Civic & Curiosities (5):** The Powder Magazine, The Almshouse, The Sexton's House, The Turtle Kraal, The Distillery

## Part D — Wild-card landmarks (Sheet 4)

Blackwood's Hollow, Old Suzette's Still, The Marked Palm, plus an optional second visually-distinct
shipwreck (the free one from Part A can cover both wrecks if you'd rather skip this).

## Part E — House variety expansion (Sheet 5, optional)

6 more archetypes beyond the free 8: two-story merchant townhouse, fisherman's stilt shack, plain
laborer's cottage, half-collapsed ruin (for the Abandoned Quarter), walled courtyard house, leaning
"drunkard's" house.

## Part F — Rural trail tile (Sheet 6, optional)

One seamless dirt/trodden-earth tile — the only real terrain gap. Right now `streets.ts`'s `'path'`
style (every rural trail) renders as a flat dashed line with no texture.

## Universal technical spec

- PNG, 1536×1024+ canvas, multiple items per sheet (never one-per-image)
- **Continuous soft-focus blurred background** — not flat, not transparent, not a hard vignette. The
  cutout pipeline segments by edge/gradient strength, and only works against a real continuous blur.
- Semi-isometric 3/4 front view for buildings/scenes; flat top-down only for ground tiles
- Attach `tortuga_focus_v1.png` as a style reference on every generation if the tool supports image input
- Single evenly-spaced row (or clean grid), same scale/baseline, generous margin for cropping
- Keep exact signboard wording where a prompt specifies it in quotes

## Handoff, once art comes back

1. Cut with the same gradient/edge-threshold technique already in `worldSprites.ts`
2. Save to `assets/sprites/buildings/` (or `tiles/`, `world/`, `scenery/`), add a key to the matching map
3. Set `spriteId` on the buildings/landmarks that now have real art — `MapScreen.tsx`'s render branch
   already handles any `spriteId` generically, no other code changes needed
4. Typecheck, jest, in-browser screenshot pass, commit, push — same as every other change in this project
