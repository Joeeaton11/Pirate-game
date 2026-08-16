# Sprite Asset Library

Reference for where new art goes and how it gets cut. Read this before dropping in a new
reference sheet — the goal is a one-glance folder lookup, not a grep, without 250 nested branches
to click through to find 12 files.

This file is specifically about *sprites* — individual pieces cut out of a reference sheet (see
"Cutting convention" below). Whole-scene backdrop illustrations meant to be used as-is, uncut, are
a different kind of asset entirely and live in the sibling `assets/backgrounds/` folder instead
(`{descriptor}_{n}.png`, no category prefix needed since there's no sprite sheet taxonomy to carry
— e.g. `harbour_tavern_dusk_1.png`), wired from `src/data/sceneBackgrounds.ts`.

## Structure: flat categories, descriptive filenames

One level of folders. No `combat/weapons/pistols/`, just `combat/weapon_pistol_1.png` — the full
taxonomy still exists, it's just carried in the filename instead of the folder path. Naming
convention: `{category}_{descriptor}_{n}.png`, e.g. `harbour_dock_straight_2.png`,
`combat_weapon_sword_1.png`, `wildlife_parrot_3.png`. Plain sequential numbers within a
descriptor, not semantic shape names (see "Cutting convention" below for why).

**When a category earns a subfolder:** once it crosses roughly 15-20 files *and* has genuinely
distinct sub-groups worth browsing separately — not before. `interiors/ship/` is the one place
this is already pre-approved (deck/captain's cabin/crew quarters/cargo hold/gun deck are really
different spaces, not just a naming variant), everything else waits until it actually has the
volume to justify it. `scally/lipsync/` is the second: `scally/` had already crossed 60+ flat
files, and the 29 lip-sync mouth frames are a clearly distinct, always-browsed-as-a-set group (see
`src/data/scallySprites.ts`'s `LIP_SYNC_FRAMES` and `src/data/visemes.ts`).

## Folder map

| Folder | Holds | Wired from |
|---|---|---|
| `tiles/` | Ground/terrain: grass, dirt, sand, paths, cobble, road, jungle floor, beach, sea, cliffs, elevation, stairs/ramps, transition blends, mud/puddle/bridge | `src/data/worldSprites.ts` |
| `nature/` | Vegetation & natural scatter: trees, bushes, flowers, mushrooms, vines, weeds, rocks, boulders, logs, stumps | `src/data/worldSprites.ts` |
| `wildlife/` | Animals: parrots, gulls, dogs, cats, rats, monkeys, crabs, fish, sharks — living creatures, not plant/rock scatter (that's `nature/`) | *(not yet wired)* |
| `props/` | Placeable set-dressing: crates, barrels, sacks, hay, campfires, signposts, fountains, lampposts, benches, market stalls, flags, furniture, tools, carts | `src/data/worldSprites.ts` |
| `decals/` | Ground overlays — cracks, stains, footprints, scorch marks. Sits *on top of* a ground tile, not a replacement for one | *(not yet wired)* |
| `market/` | Stall goods & displays: fish, fruit, spices, textiles, pottery, awnings — the *contents* of a market stall (the stall structure itself is `props/`) | *(not yet wired)* |
| `buildings/` | Whole-building icon art + building materials (roofs, walls, windows, doors, chimneys) | `src/data/worldSprites.ts` → `buildings.ts` `spriteId` |
| `houses/` | Generic house variants (no per-house identity) | `src/data/worldSprites.ts` |
| `interiors/` | Building-interior floor tiles, furniture, decor. `interiors/ship/` may split into `deck/`, `captains_cabin/`, `crew_quarters/`, `cargo_hold/`, `gun_deck/` once that art exists | *(not yet wired — `src/data/interiors.ts` uses a procedural fallback)* |
| `harbour/` | Docks, piers, jetties, quays, cranes, winches, capstans, anchors, gangplanks, ladders — the working harbour, distinct from `world/`'s one-off landmark objects | *(not yet wired)* |
| `landmarks/` | Named one-of-a-kind sights: statues, lighthouses, waterfalls, temples, graveyards, monuments, giant trees, shipwrecks — matches `src/data/landmarks.ts` entries | *(not yet wired)* |
| `world/` | Existing one-off world objects (dock/pier kit, Tortuga gate, flags) — kept as-is; new harbour art goes in `harbour/` instead | `src/data/worldSprites.ts` |
| `characters/` | NPCs beyond Scally: crew, named NPCs, generic townsfolk/pirates/sailors/etc. Use filename prefixes (`crew_01_idle.png`, `generic_sailor_drunk_1.png`) rather than a folder per archetype | *(not yet wired)* |
| `scally/` | The player character's own full sprite set (idle, run, emotes, faces, poses) — kept separate since he's the one character with a complete animation set, not a single portrait | `src/data/scallySprites.ts` |
| `ship/` | Ship sprites: sailing/turning/docking frames, wake, sails | `src/data/shipSprites.ts` |
| `combat/` | Weapons (swords, pistols, muskets, cannons) and combat FX (muzzle flash, slashes, explosions, smoke, hit/defend/status effects) | *(not yet wired)* |
| `water_fx/` | Animated/overlay water effects: waves, foam, splashes, ripples, wakes, whirlpools, fountains, bubbles — distinct from the static sea *tiles* in `tiles/` | *(not yet wired)* |
| `weather_fx/` | Rain, storms, lightning, fog, mist, wind-blown leaves/sand | *(not yet wired)* |
| `treasure/` | The treasure-hunting quest line: chests, coins, gems, maps, map fragments, dig sites, X-marks, clues, legendary items | *(not yet wired)* |
| `items/` | Everything else inventory-related: cargo goods, consumables, quest items, keys, resources | *(not yet wired)* |
| `quest_markers/` | Map/world icons for quest state: available, in-progress, discovered, locked | *(not yet wired)* |
| `ui/` | HUD icons, buttons, panels, frames, dialogue boxes, portraits-in-UI | `src/data/uiSprites.ts` (parchment banner, name-plate board, skull badge) → `ConversationBox`; the compass-rose icon is cut but not yet wired |
| `effects/` | Catch-all for FX that don't fit `combat/`, `water_fx/`, or `weather_fx/` (leave this one empty in practice — prefer the specific category) | *(not yet wired)* |

If something seems to fit two folders, pick the one for what the object *is*, not where it's
used — a lantern prop that happens to light a tavern interior is still `props/`, not
`interiors/tavern/`.

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
