# Terrain Tile Wishlist

Companion doc for the incoming "master island terrain sheet." Written 2026-08-14, ahead of the
sheet landing, so cutting can start immediately against a real checklist instead of improvising.
Organized so **every item is usable on any island**, not just Tortuga — a shared terrain library the
whole game draws from, the same way `GROUND_TILES`/`WORLD_SPRITES` already work in `worldSprites.ts`.

Current state for context: `GROUND_TILES` has exactly 6 tiles (grass/sand/dirt/cobble/wood/water),
each a single 32-64px source image tiled via an SVG `<Pattern>`. Every category below is either a
genuinely new tile this project has zero of yet, or extra *variants* of what already exists so a
single repeating texture stops reading as a repeating texture.

## Format notes (apply to every tile below)

- **Seamless tiling is non-negotiable.** Every tile gets used as an SVG `<Pattern>` at a fixed pixel
  size, butted directly against its own neighbors with no gutter — a tile whose edges don't match
  its own opposite edge shows an obvious seam the moment it repeats (this bit us twice already: item
  89's original cobble/sand/wood crops, and the still-open "one grass source" repeat noted in item
  96). Verify seams before handing tiles back, the same tiled-preview check this project already
  uses (`PIL`, 4x4/5x5 repeat, offline, before anything gets wired in).
- **2-4 variants per tile, not 1.** A single source image always reads as wallpaper once several
  copies are on screen together (exactly what happened to grass). Grass, sand, and water especially
  need multiple interchangeable variants so a renderer can pick randomly per-tile.
- **Consistent top-down angle and light direction across the whole set** — mixing a tile drawn from
  a slight isometric angle with one drawn dead-flat is the fastest way to make a tiled floor look
  wrong even if each tile is individually well-drawn.
- **Real alpha transparency wherever a tile has an irregular silhouette** (footprints, shrubs,
  driftwood, overlay decals) — flattened-to-RGB crops need a segmentation pass to cut
  (`worldSprites.ts`'s gradient/edge-threshold method); a tile that already ships with alpha (like
  `pier_module.png` turned out to) skips that work entirely. Worth calling out explicitly when
  requesting the sheet.

## 1. Ground base tiles

- **Grass**: 3-4 variants (light/dark mix, a couple with small flowers/clover, one worn/patchy for
  high-traffic areas) — direct fix for item 96's repeat.
- **Sand (dry, inland/dune)** and **sand (wet, tideline)** — visibly different tone/saturation, not
  just one sand reused for both. Wet sand is also the base for footprints (see §4) and matters a lot
  for Ocracoke Inlet's whole coastline.
- **Dirt/soil**: 2-3 variants (packed-path brown, looser tilled-earth, a drier cracked version for
  anywhere sun-baked).
- **Rocky/scree ground** — bare stone-and-gravel floor tile, for cliff bases, ruins, and volcanic
  ground if that ever comes up.
- **Marsh/mud** — wet, dark, semi-reflective ground for Ocracoke's barrier-island marsh and any
  swampy interior.
- **Jungle floor** — dense leaf-litter/undergrowth ground tile, distinct from plain grass, for dense
  interior stretches (High Woods, Bois Sombre already lean this way with props but the ground itself
  is still plain grass underneath).
- **Snow/frost** — only if a cold island is ever planned, but cheap to request alongside everything
  else while the sheet's being made.

## 2. Water & coastline

This is the single biggest gap — `GROUND_TILES.water` is one flat tile and there is no shoreline
transition art at all today (the coastline is just a hard polygon edge in `islands.ts`).

- **Deep sea**: 2-3 tile variants, slightly different color/ripple so open water doesn't read flat.
- **Shallow/reef water** — lighter, more turquoise, for lagoons and near-shore.
- **Foam/surf edge strip** — a *directional* tile (foam along one edge, clean water on the other) so
  it can line up against a coastline polygon edge, the way `pierModulePattern` lines up along a
  pier's stroke.
- **Breaking wave** (a few animation-ready frames if hand-drawn frame-by-frame is feasible — even a
  2-3 frame loop would sell a beach far better than a static line) and a **static beach-wave**
  fallback for anywhere animation isn't worth wiring up yet.
- **Sand-to-grass transition edge** — a directional strip tile (sand one side, grass the other),
  same use pattern as the foam edge; today that boundary is just two flat polygons meeting with no
  blend at all.
- **Sand-to-water transition edge** — same idea, wet-sand darkening toward the waterline.
- **Rock-to-water transition** — for cliff coastlines (Port Royal, the headlands flanking Tortuga's
  harbor mouth) where sand isn't the right transition material.
- **Tide pool** — a small round/irregular prop-like water patch that can be scattered on a beach
  tile, not a full pattern tile.

## 3. Roads, paths & jetties

Mostly asking for *more of what already works*, since item 88-96 already proved the tiled-stroke
technique end to end.

- **Cobblestone variants** (2-3): worn/mossy, a lighter "grand avenue" paving, a darker
  rain-slicked version — same use as the grass-variant point above.
- **Dirt path variants** (2-3): dry/packed, a muddier rutted-cart-track version, a leaf-strewn
  woodland-trail version for paths that cut through the High Woods/Bois Sombre.
- **A real junction/crossing tile** — right now junctions are patched with a plain filled circle
  (item 96) because there's no dedicated intersection art; a cobblestone tile specifically composed
  to look correct as a 4-way (or T, or L) crossing would look much better than a solid-color patch.
- **Road-edge/curb strip** — a directional tile so a road can read as a built edge against grass,
  not just a stroke that stops.
- **Boardwalk/plank variants** beyond the current pier module — a plainer straight-run plank tile
  (no posts) for boardwalks that aren't reaching into open water (e.g. a harbor-front promenade).
- **More jetty/dock modules**: a **corner module** (proper mitered turn instead of two straight
  modules meeting, which is currently how the new T-head/L-head bends render), a **ladder/steps**
  module for a pier's water-access point, a **mooring-post-only** module (no deck) for marking a
  ship's tie-up point without implying walkable boardwalk there.
- **Bridge tile** — nothing in the game crosses water on land yet, but cheap to request now given
  the sheet's already being made, and several islands' shapes (bays, inlets) would support one.

## 4. Overlay decals (small, scattered — not full pattern tiles)

- **Footprints in sand** — a short, human-scale track (a few footprint pairs) as a small
  transparent-background sprite scattered near beaches/coastlines, not tiled.
- **Seaweed/kelp clumps**, **driftwood pieces** (2-3), **shells/pebbles scatter** — beach dressing,
  same "small prop, not a tile" treatment as the existing `PROP_SPRITES` (barrel, crate, etc.).
- **Puddles** (for muddy/rainy ground), **cracks** (for dry/desert or ruined stone floors), **moss
  patches** (for anything old/damp — ruins, the sunken city).
- **Crab/gull tracks**, tiny and easy to miss but the kind of detail that sells a "lived-in" beach.

## 5. Vegetation (small, individually placed — not tiles)

Extends `NATURE_SPRITES`, which currently has 7 entries (2 tree types + palm, 2 bushes, a rock
spire, a cave arch):

- **2-3 more shrub/bush variants** distinct from the existing plain/flowering pair — a low scrub, a
  thorny/dry variant for anywhere less lush.
- **Tall grass / reed clumps** — for marsh edges and Ocracoke's dune grass specifically; nothing
  like this exists today and it's a very identifying feature of a barrier-island biome.
- **Mangrove** — swampy coastline dressing, distinct from a palm tree.
- **Dead/dry tree** — for ruined or rural-outskirts areas (El Fuerte Viejo, the Forgotten Graves)
  that shouldn't read as healthy woodland.
- **Vine/creeper overlay** — a semi-transparent overlay sprite for aging a wall or ruin prop.

## 6. Cliffs, rocks & ruins ground

- **Cliff-face tile** (a vertical rock texture, not top-down) for anywhere the map wants an implied
  elevation change at a coastline or quarry.
- **Rubble/ruin floor** — broken masonry ground, distinct from plain rocky ground, for El Fuerte
  Viejo and Port Royal's sunken-city stretches specifically.
- **Cave floor** — dark, damp stone, for cave-mouth landmarks (`cave_arch` already exists as a prop,
  but nothing exists for the ground just inside one).

## 7. Biome-specific asks, tied to the other 6 islands

Grounding this in what the game actually needs next, not generic requests — each of the other 6
islands (`islands.ts`) has a distinct enough brief that its ground shouldn't be Tortuga's grass
reused:

- **Cow Island** ("low grazing flats") — a lighter, shorter-cut grass variant reading as pasture,
  not jungle.
- **New Providence** ("no crown, no law, just captains" — another real port town) — can mostly
  reuse Tortuga's town kit (roads/cobble/jetty), but its own sand/grass variant keeps it from being
  visually identical to Tortuga.
- **Roatán** ("a real careening cove") — more dock/jetty ground, reef-adjacent shallow water.
- **Port Royal** ("the sunken city... still drawing the desperate and the cursed") — the ruin
  floor + moss overlay + a genuinely distinct "cursed/waterlogged" ground variant (darker,
  algae-tinted) is the single highest-value biome-specific ask on this whole list; nothing else in
  the game currently supports "this place looks wrong."
- **Île Sainte-Marie** ("a remote haven... old legends") — denser jungle floor, maybe a
  bioluminescent/misty accent variant if the sheet supports something stylized.
- **Ocracoke Inlet** (barrier island, Outer Banks) — this is the dune-grass/marsh/wet-sand cluster
  above; genuinely can't be represented at all with the current 6-tile set.

## 8. Building interiors (currently flat color, zero tile art)

`BuildingScreen.tsx`'s interiors (`interiors.ts`) render every floor as a flat `backgroundColor`
today (`FLOOR_COLORS`/`INTERIOR_COLORS`, keyed by building type) — genuinely nothing here yet, and
it's the same tiled-`<Pattern>` technique already proven outdoors:

- **Wood plank floor** (tavern, shops, houses), **stone/flagstone floor** (fort, jail, chapel),
  **packed dirt floor** (rustic/rural interiors), **rug/carpet accent** (a placeable overlay, not a
  full-room tile, for anywhere richer like the Harbourmaster's Office).

## Priority if the sheet can't cover everything at once

1. Water/coastline set (§2) — biggest visible gap, nothing exists today.
2. Grass/sand/dirt variants (§1) — directly fixes the repeat problem already shipped a workaround
   for.
3. Road/path variants + a real junction tile (§3) — builds on art already proven to work well.
4. Port Royal's cursed-ground variant (§7) — highest-value single biome ask.
5. Everything else, roughly in the order listed.
