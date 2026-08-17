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
`src/data/scallySprites.ts`'s `LIP_SYNC_FRAMES` and `src/data/visemes.ts`). `scally/talk_expressions/`
is the third, same reasoning: 20 full-body poses cut as one set from "Captain Scally: Talking
Expressions" (see `TALK_EXPRESSIONS` in `scallySprites.ts`) — same crossed-arms crop/scale as
`lipsync/`, varying face instead of mouth.

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

🔒 **Per `AGENTS.md`, new deliveries should already be one asset per image** — grids/catalog
sheets shouldn't be arriving at all going forward. This section is still real and still matters
for two cases: (a) sheets already in the library from before that rule existed, and (b) it's the
same underlying discipline — "trust real pixel boundaries, not an assumption" — that also applies
to filing a batch of individually-generated images that happen to need consistent naming/sizing.

**Do not assume a grid, and do not shortcut with equal-width division either.** Every reference
sheet so far has looked like a uniform grid at a glance and turned out not to be one on inspection
— corner/notch shapes, wider cross-junctions, tapered edges, and scattered props all break a fixed
pitch somewhere. This includes the tempting middle-ground shortcut of dividing a row into N
equal-width cells (N read off a label count) and then tight-cropping the real content *within*
each cell — that still silently mis-segments the moment items aren't actually equal width, and the
inner crop makes the error hard to spot without deliberately checking. Confirmed the hard way: a
250-sprite pass using that shortcut had 10 of 21 rows drift off the real boundaries (`GAME_DESIGN.md`
items 135–136). Always detect real per-item boundaries — no exceptions for "it'll probably be
fine."

The reliable method:

1. **Connected-component detection**, not pitch division. Chroma-key the sheet's background to a
   distance-from-background mask (`BG ≈ near-black`, see `scipy.ndimage.label`), and crop each
   connected blob to its own tight bounding box. No assumption about how many items a panel
   "should" contain or what shape family it belongs to — whatever the pixels show is what gets
   cut.
2. **Generous, non-overlapping windows per panel/region**, not one global pass over the whole
   sheet — a global pass fuses unrelated content (banners, borders, neighboring panels) into one
   blob. Window each labeled panel separately.
3. **When one object's own art fragments** (stonework with dark mortar lines, bare branches, a
   corner shape with a thin waist, a fence's rail slats, scattered decal dots), group with a
   *dilated* copy of the mask first, but still measure and crop from the *real, undilated* pixels
   within each group — this bridges an object's own internal gaps without also bridging the real
   gap to its neighbor. Don't guess the dilation radius: auto-tune it (try radius 0 upward, stop
   at the first value that gives both the expected item count *and* sane, mutually consistent
   segment widths — see point 5, count alone is not enough) rather than picking one fixed radius
   for the whole sheet.
4. **When items are genuinely touching with zero real gap** (anti-aliased edges blending directly,
   or — as with some transition/connector-tile groups — items that are meant to render as one
   continuous strip), a *raised* on/off threshold on the content mask often separates them cleanly
   where the default threshold can't. For a group of items with **no real gap at all but a known
   sub-count** (e.g. 4 sub-tiles inside one named group), detect the group's own outer boundary
   against its *neighboring groups* (which do have a real gap), then divide evenly *within* that
   group only — equal-width division is correct there, just scoped to the true span, not the whole
   row.
5. **Verify by looking, not just by counting.** A component count matching what the sheet's label
   implies is not proof of correctness — two merges (or a merge plus a stray noise fragment) can
   cancel out to the "right" number. Require segment widths to also be sane and mutually
   consistent, not just a matching count. Check actual crop dimensions for suspicious outliers and
   spot-check a sample visually before calling a batch done. If the pixel content clearly shows a
   different item count than the sheet's own labels imply (an unlabeled variant, a duplicated
   piece), trust the pixels — don't force a merge or a split just to match the label count.
6. **Alpha, not a flattened background.** Every output PNG is RGBA — background pixels are
   `alpha=0`, sprite content ramps up to full opacity with a short (~30-unit color-distance)
   feathered band so edges don't look hard-cut when composited over other art.
7. **Keep the original, uncut sheet.** Save it to `assets/brand/tileset-catalog/{descriptor}_v1.png`
   (increment the version suffix if a redo replaces it) — this is standing practice, not something
   to be asked for each time. It's the only way to re-verify a questionable crop later, or to match
   the same visual language if more items in that style are needed. See
   `assets/sprites/TERRAIN_EXTRAS_MANIFEST.md` for the pattern (a per-delivery manifest doc, since
   this library's plain-sequential filenames don't carry the source labels on their own) and log
   the delivery in `assets/sprites/DELIVERY_LOG.md`.
8. **Continuing a series from an earlier delivery** (e.g. a second sheet of ground variants):
   number onward from the existing sequence rather than starting a new descriptor —
   `ground_extra_25`, not a fresh `ground_extra_2_1`. Check the target folder's existing max
   number first.

Full narrative of how this method was arrived at (including the false starts — uniform grid,
measured-pitch grid, threshold-count auto-tuning) is in `GAME_DESIGN.md` items 97–99 and 135–136.
