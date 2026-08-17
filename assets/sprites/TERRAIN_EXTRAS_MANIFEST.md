# Terrain & World Extras — Cut Manifest

Source: one 1536×1024 catalog sheet ("Additional Ground/Water/Road/Edges/Cliffs/Vegetation/
Stairs/Walls (Extra)" + two hero feature sets + hero landmarks + misc overlays), delivered
2026-08-17. Files use the codebase's plain-sequential-number convention (`{descriptor}_{n}.png`)
rather than baking each specific variant name into the filename — this doc is the lookup table
from filename back to what it actually shows.

**Revision note:** the first pass through this sheet used equal-width division within each row
(then a real-content tight-bbox crop inside each assumed cell) rather than independently detecting
each item's real boundary — a shortcut that happened to work for a few rows but silently
mis-segmented roughly half of them (confirmed by re-checking real background gaps against the
assumed cell boundaries: several rows showed the assumed-vs-real boundary drifting by 5-10+ px
column over column). Re-cut everything in this doc using real per-item background-gap detection
instead: column-profile segmentation with an auto-tuned dilation radius (to bridge an item's own
internal gaps — a fence's rail slats, a coral's branches — without merging across a real item
boundary) or a raised on/off threshold (for items whose anti-aliased edges blend together at low
threshold), verified against sane, consistent segment widths rather than just a matching count.
One row (`props/fountain_piece_*`) turned out to have 6 real distinct pieces on the sheet, not the
5 implied by its visible labels — kept all 6 rather than force-merging two into one to match the
label count. See `GAME_DESIGN.md` item 136 for the full account.

245 sprites cut in this pass. Nothing here is wired into a renderer yet — see `README.md`'s
folder table for what each folder feeds into once it is wired.

## `tiles/ground_extra_1..24` — Ground Variants
1 Grass Bright · 2 Grass Overgrown · 3 Grass Tall · 4 Grass Sparse · 5 Flowers Wild ·
6 Mossy Ground · 7 Leaf Litter · 8 Autumn Leaves · 9 Dirt Dark · 10 Dirt Rutted · 11 Dirt Stony ·
12 Pebbled Ground · 13 Sand Windy · 14 Sand Dune Ridge · 15 Sand Pebbly · 16 Sand Shells ·
17 Red Dirt Clay · 18 Cracked Earth · 19 Charred Ground · 20 Volcanic Ash · 21 Snow Light ·
22 Snow Deep · 23 Ice Packed · 24 Ice Cracked

## `tiles/water_extra_1..11` — Water Variants (base tiles)
1 Calm Shallow · 2 Reef Shallow · 3 Clear Water · 4 Tropical Water · 5 Deep Sea Dark ·
6 Deep Sea Stormy · 7 Rough Sea Variant · 8 Current Slow · 9 Current Fast · 10 Algae Water ·
11 Murky Shallows

## `water_fx/water_fx_extra_1..9` — Water Variants (dynamic effects)
1 Whitecap Animation 1 · 2 Whitecap Animation 2 · 3 Whitecap Animation 3 · 4 Spray Rocks ·
5 Waterfall Splash · 6 Water Swirl · 7 Water Ripple · 8 Water Shimmer · 9 Ship Wake Straight

## `tiles/paving_extra_1..14` — Road & Paving Variants
1 Road Dirt Wide · 2 Road Rutted · 3 Road Gravel · 4 Road Stone · 5 Brick Pavers ·
6 Stone Pavers · 7 Herringbone Brick · 8 Mosaic Pavers · 9 White Stone Pavers · 10 Slate Pavers ·
11 Cobble Round · 12 Cobble Irregular · 13 Muddy Cobbles · 14 Overgrown Cobbles

## `tiles/trans_extra_1..52` — Edges & Transitions
Four terrain-pairs per row, each pair cut as Straight/Corner/T-Junction (+ Cross on the last pair
of each row):
- **Row 1 (1-13):** Grass→Sand, Grass→Dirt, Grass→Cobble, Grass→Water(+Cross)
- **Row 2 (14-26):** Sand→Water, Sand→Rock, Dirt→Cobble, Dirt→Rock(+Cross)
- **Row 3 (27-39):** Cliff→Grass, Cliff→Dirt, Cliff→Sand, Cliff→Water(+Cross)
- **Row 4 (40-52):** Water→Mangrove, Dirt→Planks, Sand→Planks, Rock→Planks(+Cross)

## `tiles/stairs_ramp_6..13` — Stairs, Ramps & Elevation
(Continues the existing `stairs_ramp_1..5` series.) 6 Steps Narrow 4-Step · 7 Steps Wide 7-Step ·
8 Steps Ruined · 9 Steps Broken · 10 Ramp Stone Gentle · 11 Ramp Wood Gentle ·
12 Ramp Earth Gentle · 13 Ramp Shipyard Gangway

## `nature/rock_extra_1..21` — Cliffs & Rock Formations
1 Cliff Vertical 1 · 2 Cliff Vertical 2 · 3 Cliff Vertical 3 · 4 Cliff Corner ·
5 Cliff Inner Corner · 6 Cliff Plateau Top · 7 Cliff Slope · 8 Rock Block Large ·
9 Rock Block Medium · 10 Rock Block Small · 11 Boulder Round Large · 12 Boulder Round Medium ·
13 Boulder Cluster · 14 Rock Spire Tall · 15 Rock Spire Short · 16 Stalagmite Cluster ·
17 Cave Entrance · 18 Stalactite Ceiling · 19 Basalt Columns · 20 Rock Debris · 21 Lava Crack

## `nature/vegetation_extra_1..23` — Vegetation & Nature Props
1 Palm Cluster · 2 Banana Plant · 3 Broadleaf Tree · 4 Jungle Tree · 5 Large Fern ·
6 Agave Plant · 7 Cactus Cluster · 8 Giant Leaf Plant · 9 Bush Flowering · 10 Bush Red Flowers ·
11 Bush Yellow Flowers · 12 Bush Blue Flowers · 13 Spiky Plant · 14 Bamboo Cluster · 15 Reed Tall ·
16 Lily Pad Cluster · 17 Seaweed Shallow · 18 Seaweed Deep · 19 Coral Red · 20 Coral Purple ·
21 Coral Green · 22 Mangrove Roots · 23 Roots Cluster

## `props/fence_wall_extra_1..16` — Walls, Fences & Barriers
1 Stone Wall Low · 2 Stone Wall High · 3 Stone Wall Ruined · 4 Wood Fence Post & Rail ·
5 Wood Fence Vertical Plank · 6 Rope Fence Posts · 7 Hedge Low · 8 Hedge Tall ·
9 Palisade Spiked · 10 Palisade Gate · 11 Iron Fence Ornate · 12 Iron Fence Simple ·
13 Rope Barrier Short · 14 Rope Barrier Tall · 15 Spike Trap · 16 Portcullis Gate

## `decals/ground_decal_1..16` — Misc Details & Overlays
First entries in this previously-empty folder. 1 Leaves Scatter · 2 Flowers Scatter ·
3 Rocks Scatter · 4 Shells Scatter · 5 Driftwood · 6 Bones Scatter · 7 Skull · 8 Starfish ·
9 Footprints Sand · 10 Wheel Ruts Dirt · 11 Cart Tracks Mud · 12 Water Puddle Shallow ·
13 Blood Stain · 14 Soot Stain · 15 Cracks Ground · 16 Moss Patch

## Hero pieces (Sheet sections IX–XI)

**`landmarks/waterfall_complete_1.png`** — the assembled multi-tier waterfall hero illustration.

**`water_fx/waterfall_piece_1..14`** — 1 Top Source · 2 Top Source (alt) · 3 Waterfall Wide ·
4 Waterfall Medium · 5 Waterfall Narrow · 6 Cascade Short · 7 Cascade Tiny · 8 Splash Large ·
9 Splash Medium · 10 Splash Small · 11 Spray Mist · 12 Impact Pool · 13 Foam Eddy · 14 Foam Edge

**`water_fx/water_spout_1..7`** — 1 Spout Tall · 2 Spout Medium · 3 Spout Short · 4 Geyser Burst ·
5 Water Ripple Ring · 6 Mist Puff · 7 Dripping Rocks

**`landmarks/fountain_complete_1.png`** — the assembled Neptune Fountain hero illustration.

**`props/fountain_piece_1..6`** — 1 Base Corner · 2 Base Straight · 3 Pool Empty · 4 Pool Water ·
5 Pool Ripple · 6 Base Corner (Alt Angle). The sheet's "B. Fountain Base & Pool" section only
labels 5 items, but the real pixel content segments cleanly into 6 distinct pieces — item 6 is a
second curved base-wall piece at a different angle, visually similar to item 1 but genuinely
separate art. Kept as its own sprite rather than merged into item 1 to force a match to the
5-label count.

**`landmarks/fountain_statue_1..5`** — 1 Neptune Statue · 2 Side Trident · 3 Side Conch ·
4 Side Dolphin · 5 Sea Creature Decor

**`water_fx/fountain_jet_1..3`** — 1 Water Jet Tall · 2 Water Jet Medium · 3 Water Jet Short

**`landmarks/hero_landmark_1..15`** — one-of-a-kind large props, matching `landmarks.ts`-style
named sights: 1 Giant Waterfall · 2 Natural Stone Arch · 3 Giant Pirate Statue ·
4 Ancient Temple Ruins · 5 Shipwreck Beached · 6 Giant Skull Rock · 7 Lighthouse Tall ·
8 Ancient Fountain Ruins · 9 Volcano Crater · 10 Giant Banyan · 11 Hidden Grotto Entrance ·
12 Pirate Fort Gate · 13 Monument Obelisk · 14 Ancient Anchor Monument · 15 Treasure Shrine
