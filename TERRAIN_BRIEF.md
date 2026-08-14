# Terrain & Town Kit — Exact Tile List

Companion doc for the incoming "master island terrain sheet." Rewritten 2026-08-14 against a direct
reference image (a finished pirate-town scene: curbed cobblestone roads, raised building plinths
with entrance steps, dense street props, jetty with moored boat) — every item below is either
visible in that reference or a tiling-mechanics requirement it implies (corner/junction/end pieces
for anything linear, since a curb or a road needs the same wrap-around-a-corner treatment a road
itself does).

**164 distinct, named items.** Not padded to hit a round number and not trimmed to look modest either
— this is what "properly" costs for a kit this dense. Organized so **every item is usable on any
island**, not just Tortuga, the same shared-library principle `GROUND_TILES`/`WORLD_SPRITES` already
use in `worldSprites.ts`.

## Format notes (apply to every tile below)

- **Seamless tiling is non-negotiable** for anything used as a repeating `<Pattern>` fill (ground,
  paving, water, roofs, walls). Edges must match their own opposite edge with zero gutter — bit us
  twice already (item 89's original crops, the "one grass source" repeat in item 96). Verify with a
  tiled preview (4x4/5x5, offline) before handing tiles back.
- **Linear kits (curbs, plinths, steps-as-runs) need corner/junction/end pieces, not just a straight
  strip** — a curb that only has a straight tile will show the exact hard-rectangle-overwrite seam
  item 96 just fixed for roads, the moment it turns a corner. Section III below spells these out
  explicitly so nothing gets cut "straight-only" by accident.
- **Curb and plinth pieces need two widths**, matching the two street styles already in the game
  (`'main'` at 20 units wide, `'path'` at 14) — a curb sized for the wide road will look wrong
  hugging the narrow one. Doesn't double the whole list; just keep both widths in mind when cutting
  §III/§IV.
- **2-4 variants minimum for anything tiled edge-to-edge at scale** (grass, sand, water, plaza
  paving) — a single source always reads as wallpaper once several copies are on screen together.
- **One consistent top-down angle and light direction across the entire sheet.** The reference image
  is a slight-isometric angle with a consistent upper-left light source — match that across every
  single item below, not just within one category. Mixing angles is the fastest way to make an
  otherwise well-drawn tile look wrong once it's placed next to everything else.
- **Real alpha transparency on every irregular-silhouette item** (props, vegetation, steps, decals) —
  a tile that ships with genuine alpha (like `pier_module.png` turned out to) skips the
  gradient/edge-threshold segmentation pass entirely; flattened-to-RGB costs real cutting time.

---

## I. Natural ground (base fill tiles) — 13

1. Grass — light green
2. Grass — dark green
3. Grass — flowering/clover
4. Grass — worn/patchy (high-traffic)
5. Sand — dry, inland/dune
6. Sand — wet, tideline
7. Dirt — packed path brown
8. Dirt — loose/tilled earth
9. Dirt — dry, cracked
10. Rocky/scree ground
11. Marsh/mud ground
12. Jungle floor (leaf litter/undergrowth)
13. Snow/frost ground (future-proofing only)

## II. Water & coastline — 15

14. Deep sea — variant A
15. Deep sea — variant B
16. Shallow/reef water
17. Foam/surf edge strip (directional — foam one side, clean water the other)
18. Breaking wave — frame 1
19. Breaking wave — frame 2
20. Breaking wave — frame 3
21. Beach wave — static fallback (for anywhere animation isn't wired up)
22. Sand-to-grass transition edge (directional strip)
23. Sand-to-water transition edge (directional strip)
24. Rock-to-water transition edge (directional strip, for cliff coastlines)
25. Tide pool (small scattered prop, not a tile)
26. Harbor/dockside water (murkier than open sea)
27. Harbor water — ripple/reflection variant
28. Harbor water — hull-shadow variant (for under a docked ship)

## III. Roads, curbs & plaza paving — 17

*The core ask from the reference image.* Every numbered curb piece needs both the `'main'`-width
and `'path'`-width version (see format notes).

29. Plaza cobblestone — small light pavers
30. Plaza cobblestone — larger flagstone
31. Plaza cobblestone — worn/mossy patch
32. Narrow alley cobblestone (finer paving between buildings)
33. Curb — straight edge
34. Curb — outer corner (convex, road turns away)
35. Curb — inner corner (concave, road turns into itself)
36. Curb — T-junction
37. Curb — 4-way cross junction
38. Curb — dead-end cap
39. Curb — flush ramp/dip (a cart track crosses without a step)
40. Road-to-dirt-path transition (curbed main street meets uncurbed path)
41. Road-to-plaza transition (curb dissolves into the open square, matching the reference image's
    town-square treatment)
42. Cobblestone-to-grass edge (no curb, softer boundary for minor streets)
43. Drainage grate (small inset detail prop)
44. Wet/puddled cobblestone patch
45. Moss-between-pavers overlay

## IV. Building plinth / raised foundation — 6

Every building in the reference image sits on a raised stone (or wood-decked) base with a visible
edge lip — nothing like this exists in the game today, buildings currently just sit flush on grass.

46. Plinth — straight edge (stone)
47. Plinth — outer corner
48. Plinth — inner corner
49. Plinth — top surface fill
50. Plinth — wood-decked variant (for a building on a raised deck rather than stone, like the
    reference's Dockside Tavern)
51. Plinth — wood-decked corner

## V. Steps & ramps — 8

52. Steps — narrow, 2-step (small shop entrance)
53. Steps — narrow, 3-step
54. Steps — wide, 3-step (mid-size building)
55. Steps — wide, 5-step (grand entrance, raised porch)
56. Steps — with wood side rail
57. Steps — with stone balustrade
58. Steps — corner/turning (ascends while changing direction)
59. Cargo ramp (loading-dock alternative to steps, for warehouse-style buildings)

## VI. Jetty / dock / pier kit — 9

Extends the pier module already shipped (item 94) rather than replacing it.

60. Pier module — corner/mitered turn (today's T-head/L-head bends use two straight modules meeting
    at a right angle — a real mitered corner piece would read cleaner)
61. Pier — ladder down to water
62. Pier — mooring post, single (no deck, marks a tie-up point without implying walkable boardwalk)
63. Pier — mooring post pair with rope strung between
64. Pier — cleat/tie-off ring (small prop)
65. Dock — boat launch ramp (sloped, for hauling a small boat out of the water)
66. Boardwalk plank — plain straight (no posts, for a harbor-front promenade that isn't over open
    water)
67. Boardwalk plank — corner
68. Bridge tile (nothing crosses water on land yet, but several islands' shapes would support one)

## VII. Vegetation (small, individually placed) — 12

Extends `NATURE_SPRITES` (currently 7 entries: 2 tree types + palm, 2 bushes, a rock spire, a cave
arch).

69. Palm tree — upright
70. Palm tree — windswept/leaning
71. Shrub — low scrub
72. Shrub — thorny/dry
73. Potted plant — barrel-planter
74. Potted plant — ceramic pot
75. Window flower box
76. Tall grass / reed clump
77. Mangrove
78. Dead/dry tree (for ruined/rural-outskirts areas)
79. Hanging vine/creeper overlay (wall-mounted, semi-transparent)
80. Grass tuft (small wall-base detail)

## VIII. Cliffs, rocks & ruins ground — 3

81. Cliff-face tile (vertical rock texture, not top-down)
82. Rubble/ruin floor (broken masonry, distinct from plain rocky ground)
83. Cave floor (dark, damp stone — `cave_arch` exists as a prop, nothing exists for just inside one)

## IX. Props — cargo & containers — 10

84. Barrel — standing, single
85. Barrel — stacked pair
86. Barrel — stacked pyramid (3+)
87. Barrel — on its side
88. Barrel — with rope netting
89. Crate — small, single
90. Crate — stacked pair
91. Crate — open (contents visible)
92. Sack/burlap bag — single
93. Sack/burlap bag — stacked pile

## X. Props — lighting & signage — 8

94. Hanging lantern — lit
95. Hanging lantern — unlit
96. Wall sconce lantern
97. Standing lamppost
98. Sign board — rectangular, blank (for text overlay, matches the reference's carved shop signs)
99. Sign board — arched-top, blank
100. Sign board — hanging (swings from a bracket)
101. Sign bracket/iron mount (no board, for a hand-lettered sign to attach to)

## XI. Props — fabric & decoration — 7

102. Awning — striped, straight
103. Awning — striped, scalloped edge
104. Bunting/pennant string
105. Flag on pole — skull & crossbones
106. Flag on pole — plain/neutral
107. Laundry line with hanging clothes
108. Window curtain/drape

## XII. Props — furniture & street fixtures — 10

109. Bench (wood)
110. Stool/chair, single
111. Market table — bare
112. Market table — with goods laid out
113. Hitching post
114. Ship's wheel — wall-mounted decoration
115. Anchor — decorative, standing/leaning
116. Rope coil
117. Fishing net — hung to dry
118. Wooden ladder — leaning against a wall

## XIII. Building materials — roofs — 5

For when the building art pass resumes (`SHOW_BUILDINGS`, currently off) — same sheet, no reason not
to request it now.

119. Roof — blue ceramic tile
120. Roof — red terracotta tile
121. Roof — thatched
122. Roof — wood shingle
123. Roof ridge cap trim

## XIV. Building materials — walls — 4

124. Wall — whitewashed plaster
125. Wall — timber-frame (dark beam + light plaster infill)
126. Wall — fieldstone
127. Wall — weathered plank siding

## XV. Building materials — windows, doors & chimneys — 7

128. Window — shuttered, closed
129. Window — shuttered, open, lit interior
130. Window — glass pane, lit
131. Door — plain plank
132. Door — arched stone frame
133. Chimney — plain stone
134. Chimney — with smoke wisp

## XVI. Ship & large dock props — 4

135. Ship hull — docked, broadside
136. Ship gangplank
137. Rowboat — moored
138. Furled-sail/rigging detail overlay (for a docked ship's static look)

## XVII. Ground detail overlays (small decals) — 12

139. Puddle — small
140. Puddle — large, with reflection
141. Crack pattern (dry/old stone)
142. Moss patch
143. Fallen leaves scatter
144. Sand scatter (blown onto cobblestone near the coast)
145. Footprints in sand — trail
146. Seaweed/kelp clump
147. Driftwood piece — A
148. Driftwood piece — B
149. Shell/pebble scatter
150. Crab/gull tracks

## XVIII. Interior floor tiles — 4

`BuildingScreen.tsx` renders every interior floor as a flat `backgroundColor` today
(`FLOOR_COLORS`/`INTERIOR_COLORS`) — genuinely zero tile art here, same technique as outdoors.

151. Interior — wood plank floor
152. Interior — stone/flagstone floor
153. Interior — packed dirt floor
154. Interior — rug/carpet accent (placeable overlay, not a full-room tile)

## XIX. Per-island biome ground sets — 10

Grounded in each island's actual brief (`islands.ts`), not generic requests.

155. Cow Island — pasture grass (shorter-cut, lighter than Tortuga's)
156. New Providence — town sand/grass variant (visually distinct from Tortuga's own)
157. Roatán — reef-adjacent shallow water variant
158. Port Royal — cursed/waterlogged ground (dark, algae-tinted — highest-value single biome ask,
     nothing currently supports "this place looks wrong")
159. Port Royal — algae overlay decal
160. Île Sainte-Marie — dense, misty jungle floor
161. Île Sainte-Marie — bioluminescent accent overlay (optional/stylized)
162. Ocracoke Inlet — dune grass clump
163. Ocracoke Inlet — marsh reed clump
164. Ocracoke Inlet — wet sand/mud flat variant

---

## Priority if the sheet can't cover everything at once

1. **§III Roads/curbs/plaza** + **§IV Plinths** + **§V Steps** — the direct ask, and the biggest gap
   between how the map currently looks and the reference image. Nothing in this trio exists today.
2. **§II Water/coastline** — still the single biggest natural-terrain gap, unchanged from before.
3. **§I Grass/sand/dirt variants** — fixes the tiling repeat already shipped a workaround for.
4. **§VI Jetty/dock kit** — builds on art already proven to work (item 94-95).
5. **§IX-§XII Props** — cheap per-item, high density payoff, matches the reference image's clutter.
6. Everything else, roughly in the order listed.
