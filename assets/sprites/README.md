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
`lipsync/`, varying face instead of mouth. `tiles/` and `nature/` are the fourth and fifth: both
grew past 100 flat files across many unrelated sub-groups (ground vs. water vs. paving vs.
transitions vs. elevation, or vegetation vs. trees vs. rocks) once the 2026-08-17 terrain-extras
delivery landed, so both were split into the subfolders listed in the folder map below (2026-08-17
reorg — see `GAME_DESIGN.md`). The naming convention inside each subfolder is unchanged — plain
`{descriptor}_{n}.png`, no extra prefix — only the folder path grew a subfolder segment.

## Folder map

| Folder | Holds | Wired from |
|---|---|---|
| `tiles/` | Ground/terrain, split into subfolders now that the category crossed 250+ files: `ground/` (grass, dirt, sand, mud, puddle, broken/jungle ground, plus desert, swamp, mossy stone, and volcanic/lava/coral variants added 2026-08-20), `water/` (sea, water base tiles), `paving/` (cobble, road, wood), `paths/` (dirt/grass-border paths, road intersections), `transitions/` (edge/corner blends between terrain pairs), `elevation/` (cliffs, ledges, stairs/ramps, plateaus), `beach/` (beach detail, shorelines, black sand), `bridges/` (rope/wood bridge pieces) | `src/data/worldSprites.ts` |
| `nature/` | Vegetation & natural scatter, split into subfolders for the same reason: `vegetation/` (bushes, flowers, weeds, vines, mushrooms, logs, stumps), `trees/` (tall/round/palm and other tree variants), `rocks/` (rock/boulder/spire/cave formations, stone patches) | `src/data/worldSprites.ts` |
| `wildlife/` | Animals: parrots, gulls, dogs, cats, rats, monkeys, crabs, fish, sharks — living creatures, not plant/rock scatter (that's `nature/`) | *(not yet wired)* |
| `props/` | Placeable set-dressing: crates, barrels, sacks, hay, campfires, signposts, fountains, lampposts, benches, market stalls, flags, furniture, tools, carts, fences/walls, ruin stone blocks/pillars | `src/data/worldSprites.ts` |
| `decals/` | Ground overlays — cracks, stains, footprints, scorch marks — plus `map_edge_*` screen/map-boundary vignette overlays (a different use than the on-tile decals, but the same "overlay, not a replacement" idea). Sits *on top of* a ground tile, not a replacement for one | *(not yet wired)* |
| `market/` | Stall goods & displays: fish, fruit, spices, textiles, pottery, awnings — the *contents* of a market stall (the stall structure itself is `props/`) | *(not yet wired)* |
| `buildings/` | Whole-building icon art + building materials (roofs, walls, windows, doors, chimneys, `plinth_*` raised-foundation pieces, `floor_tile_*` interior floor materials added 2026-08-20) | `src/data/worldSprites.ts` → `buildings.ts` `spriteId` |
| `houses/` | Generic house variants (no per-house identity) | `src/data/worldSprites.ts` |
| `interiors/` | Building-interior floor tiles, furniture, decor. `interiors/ship/` may split into `deck/`, `captains_cabin/`, `crew_quarters/`, `cargo_hold/`, `gun_deck/` once that art exists | *(not yet wired — `src/data/interiors.ts` uses a procedural fallback)* |
| `harbour/` | Docks, piers, jetties, quays, cranes, winches, capstans, anchors, gangplanks, ladders — the working harbour, distinct from `world/`'s one-off landmark objects. First entries landed 2026-08-20 (pier modules, mooring posts, cleats, boardwalk, dock ramp) | *(not yet wired)* |
| `landmarks/` | Named one-of-a-kind sights: statues, lighthouses, waterfalls, temples, graveyards, monuments, giant trees, shipwrecks — matches `src/data/landmarks.ts` entries | **Partial** (2026-08-29) — `LANDMARK_SPRITES` in `worldSprites.ts` wires 8 `hero_landmark_*`/`castaway_camp_1`/`shipwreck_debris_1`/`fountain_complete_2` files to 8 previously-emoji-only landmarks (High Woods, Old Landing ruins, Forgotten Graves, both shipwrecks, Blackwood's Hollow, Suzette's Still, Republic Square); `tree_palm` (already in `NATURE_SPRITES`) now covers The Marked Palm too. 4 of 16 landmarks (Harbor Pier, La Ringot Fields, Contrebandiers' Cove, Turtle Cove) still have no matching art in the folder and keep their emoji — the rest of `landmarks/`'s 40 files (fort/watchtower/turret pieces, fountain/statue variants, cave_waterfall, waterfall_complete) are cut but still unused |
| `world/` | Existing one-off world objects (dock/pier kit, Tortuga gate, flags) — kept as-is; new harbour art goes in `harbour/` instead | `src/data/worldSprites.ts` |
| `characters/` | NPCs beyond Scally: crew, named NPCs, generic townsfolk/pirates/sailors/etc. Use filename prefixes (`crew_01_idle.png`, `generic_sailor_drunk_1.png`) rather than a folder per archetype | **In progress** (2026-08-29) — `admiral_grace_portrait_1.png`, `blackfin_portrait_1.png`, `redbeard_sully_portrait_1.png` (all user-generated, real per-item alpha cut in-session — see `characterSprites.ts`'s doc comment) are wired into `ConversationBox` via `GraceScreen.tsx`/`BlackfinScreen.tsx`/`PirateLordScreen.tsx`, all `side="right"`. As of Sully, source renders come pre-oriented facing screen-left — no mirror step needed, unlike Grace/Blackfin's first (since-replaced) renders. `PirateLordScreen.tsx` has two render paths, keyed on `LORD_PORTRAITS[lord.id]` — Sully (Lord #1) gets the real `ConversationBox`; the other 5 lords keep the original emoji-header layout untouched until they get art too. `GRACE_EMOJI`/`BLACKFIN_EMOJI`/lord `emoji` fields are all untouched and still used for map markers. Blackfin's first source render visibly copied Jack Sparrow's specific design (dreadlocks/beads, skull-and-bandana tricorn, kohl eyes) in a painterly-realistic style that didn't match Scally's chibi look at all — re-sent twice to fix the style and move his sash off Scally's own red; Sully and Grace's redone render both confirm that chibi style is now the locked house look. `ConversationBox`'s portrait sizing/crop is per-character now (`portraitAspectRatio`/`portraitCropFraction` props, both defaulting to Scally's own values) — a hardcoded shared constant made every non-Scally character render at an inconsistent size and cut-off point; see `characterSprites.ts` for each character's tuned values and why they can't be derived from the file alone. NPCs are shown full-body with no crop at all as of 2026-08-30 (`portraitCropFraction: 1` for all five wired so far, direct follow-up reversing the belt-line tuning) — Scally himself is unaffected, still cropped at his own tuned 0.85. `marietta_graves_portrait_1.png` (Lord #4, the Drowned Widow) is the fourth Pirate Lord — first with no weapon (curse-only moveset) and first genuinely supernatural design. `finn_maelstrom_portrait_1.png` (Lord #5, formerly "Ezra Vane") is the fifth. Only the current "Blackbeard" slot (Lord #6, queued for its own rename) is still emoji — everyone else in the Lord roster now has real art. `iron_jenny_portrait_1.png` (2026-08-30, Lord #2) is the first delivery this session to arrive pre-matted with real alpha already baked in — no background-removal reconstruction needed, just a bbox trim off the alpha channel directly. Everyone else (4 more Pirate Lords, 12 crew, 6 threats) is still emoji |
| `scally/` | The player character's own full sprite set (idle, run, emotes, faces, poses) — kept separate since he's the one character with a complete animation set, not a single portrait | `src/data/scallySprites.ts` |
| `ship/` | Ship sprites: sailing/turning/docking frames, wake, sails | `src/data/shipSprites.ts` |
| `combat/` | Weapons (swords, pistols, muskets, cannons) and combat FX (muzzle flash, slashes, explosions, smoke, hit/defend/status effects) | *(not yet wired)* |
| `water_fx/` | Animated/overlay water effects: waves, foam, splashes, ripples, wakes, whirlpools, fountains, bubbles — distinct from the static sea *tiles* in `tiles/` | *(not yet wired)* |
| `weather_fx/` | Rain, storms, lightning, fog, mist, wind-blown leaves/sand. First entries landed 2026-08-20 (`fog_patch_1`, `cloud_1`, `mist_1`, `dust_cloud_1`) | *(not yet wired)* |
| `treasure/` | The treasure-hunting quest line: chests, coins, gems, maps, map fragments, dig sites, X-marks, clues, legendary items | *(not yet wired)* |
| `items/` | Everything else inventory-related: cargo goods, consumables, quest items, keys, resources | *(not yet wired)* |
| `item_icon_candidates/{pixelart,set_b,set_c}/` | Three alternate icon sets for the game's core item/prop roster (fish/logs/rum/coins matching existing `resources.ts`, plus backpack, compass, scroll, a circular map-viewport frame, a cursor, and treasure chests) — overlaps `items/`/`treasure/`, so kept as candidates rather than merged in. `pixelart` is a genuinely different art style (chunky retro pixel-art) from everything else in the library. See `ITEM_ICON_CANDIDATES_MANIFEST.md` | *(not yet wired — pending the user's choice)* |
| `quest_markers/` | Map/world icons for quest state: available, in-progress, discovered, locked | *(not yet wired)* |
| `ui/` | HUD icons, buttons, panels, frames, dialogue boxes, portraits-in-UI, HP/XP/heat bars, cooldown indicators. Past this directory's own subfolder threshold as of 2026-08-27 (104 files, several distinct sub-groups) — flagged for a future split, not yet split (see `DELIVERY_LOG.md`'s Folder size note) | `src/data/uiSprites.ts` (parchment banner, name-plate board, skull badge) → `ConversationBox`; the compass-rose icon and the new bars/meters/cooldown-indicator sprites (`BARS_METERS_MANIFEST.md`) are cut but not yet wired |
| `ui_candidates/{design_a,design_b,design_c,design_d,design_e,design_f,design_g,design_h,design_i,design_j}/` | Alternate full UI-kit designs the user is comparing before picking one — kept separate from `ui/` on purpose so nothing collides with or gets confused for the active kit. Designs A-C are buttons/panels/tabs/modals; D-G are broader widget kits (bar frames, banner flags, toggles, checkboxes, icon buttons, nav icons — F and G add near-complete HUD kits with menu/action buttons, chests, medals, potions); H-J are screen-navigation kits (status bars, 5-tab nav bars, menu category cards, banner buttons, pill state buttons). See `UI_KIT_CANDIDATES_MANIFEST.md`. Once a design is chosen, expect its files to move into `ui/` proper (renamed to fit that folder's convention) and this subtree to either drop the losing designs or be removed entirely | *(not yet wired — pending the user's choice)* |
| `ui_candidates/{bars_meters_b,bars_meters_c,bars_meters_d,bars_meters_e,bars_meters_f}/` | Five more bars/HP/XP/heat-meter/cooldown-indicator sheets, filed as candidates to compare against the bars/meters content already in `ui/` (`BARS_METERS_MANIFEST.md`) rather than merged into it. See `BARS_METERS_CANDIDATES_MANIFEST.md`. First sheets this session to arrive with real per-item alpha already baked in — no background reconstruction needed | *(not yet wired — pending the user's choice)* |
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

## Reusable cutting tool + review agents

`scripts/asset_cutting/segment_lib.py` is the working, documented implementation of the method
above — real per-item connected-component extraction, auto-escalating dilation, the caption-text
trap and its fix, the outlier-detection snippet. Load it fresh for every new sheet rather than
rebuilding the same logic from scratch (see its own module docstring for the lessons and a quick
start). It was extracted from the 2026-08-20 delivery specifically so the next one doesn't start
from zero.

Four project-specific subagents (`.claude/agents/`) cover the rest of the pipeline end to end —
invoke by name via the Agent tool once a delivery needs more than just cutting:

- **`asset-qa`** — independently verifies a cutting pass is actually correct (no baked-in text,
  no merges/splits, sane crops) before it's treated as done.
- **`asset-artist`** — judges art quality and style/scale consistency, separate from cut
  correctness — is this good art that belongs in the game.
- **`asset-librarian`** — keeps this README, `DELIVERY_LOG.md`, manifests, and the folder
  structure itself honest and in sync with what's actually on disk.
- **`scene-art-director`** — plans concrete uses of the library in the actual game world (which
  sprites go where, what to wire next) — planning only, not implementation.
