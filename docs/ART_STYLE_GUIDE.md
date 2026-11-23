# Scallywag Isles — art style guide

Every new map asset follows this page, so the whole island reads as one painting. To replace the code-drawn art with painted art, follow `docs/PAINTED_ART_BRIEF.md`. The list of what
to make is `docs/ART_LIST_TORTUGA.md` (generated from the plan). When an asset is finished, drop
the file in and point its asset id at it in `tools/blueprint/art_slots.py` — nothing on the map
moves.

## The one rule that overrides everything

**One asset per image.** Every generation request produces exactly one item on its own canvas —
never a grid, catalogue sheet or collage to be cut up later (see `AGENTS.md`).

## Locked style

**Locked 2026-11-23:** the island is drawn in the style of `docs/style/target_style.png` and nothing
else (see `AGENTS.md`). Weave tests on 2026-11-23 (palm, barrels, crates, bollard, tree, cottage in
`assets/art_painted/`) confirmed it can be matched.

## Reference images (match these)

- **Target style for the whole island: `docs/style/target_style.png`** — dense top-down pixel art,
  turquoise sea with foam and submerged rocks, dark jagged coastal rocks, palms and flowering
  bushes everywhere, grey cobbles, red-tiled cream buildings, heavy timber docks on pilings.
  Its palette is sampled into `tools/art/palette_target.png`, and every coded layer snaps to it.

- Camera and building style: `assets/sprites/tortuga_v2/buildings/tortuga_gunsmith.png` and
  `tortuga_v2/buildings/tortuga_lucky_draw.png`.
- Palette and light: the painted town, `assets/sprites/tortuga_town/` (the harbour core).
- Homes: `assets/sprites/tortuga_v2/houses/house_1.png`.

Attach the camera reference and one palette reference to **every** generation.

## Camera

- **Houses: face-on, pointed gable facing you, seen from high up** (chosen by the user 2026-11-23,
  like the houses in `docs/style/house_angle_example.png`): the front wall is square to the screen with
  no side walls showing, the gable end faces the viewer, and the roof's two slopes run well back into
  the picture so lots of tiles show. Very wide buildings (over 24 units) keep their ridge across the
  front instead of one giant gable.
- **High three-quarter view, looking down at about 50-60 degrees** (chosen 2026-11-23): the same
  angle as the houses in `docs/style/target_style.png`. A building is roughly **half roof, half front
  wall**: enough roof to read the shape of the town from above, and enough front wall to see the door
  and windows clearly. Never face-on (gable end towards the viewer, little roof visible) and never
  straight down (no front wall, so no doors).
- The ground, trees, props and characters are all drawn from this same angle: round things (barrels,
  wells, tree canopies) show their tops as ovals, and upright things show their front.
- Fronts are parallel to the screen and roof ridges run left to right. **Never isometric**, never
  rotated.
- Doors are drawn on the front, the side facing the bottom of the image. If a building's door faces
  another way on the plan, we flip or note it in the list. Don't redraw the camera to suit.

## Light and shadow

- The sun is in the upper left (north-west). Lit faces are on the left and top, shade is on the
  right.
- Each sprite has a small soft contact shadow falling to the lower right, matching the shadows on
  the Art map base.
- Don't add cast shadows longer than about a quarter of the object's height.

## Line and finish

- Painterly pixel-art finish, matching the references. Edges are clean and readable at small
  size.
- Outlines are dark warm brown (`#3a2a1a`) rather than black, about 1/40 of the asset's width.
- No text or lettering in the image. Shop signs use pictures: a tankard, a fish, a skull.
- Transparent background, with no ground tile, grass patch or frame around the object.

## Palette

The island palette (also used by the plan and the Art map base):

| Use | Colour |
|---|---|
| Grass | `#86b25e` |
| Beach | `#e8d49c` |
| Jungle | `#3e7438` |
| Woods | `#4f8a45` |
| Water | `#4ea6cc` |
| Roads | `#b8936a` |
| Plaza stone | `#d3c7ab` |
| Wood (docks, timber) | `#a5784a` |
| Roof tile (homes) | `#b4694a` |
| Roof tile (town) | `#a8583c` |
| Outline | `#3a2a1a` |

Accent colours (flags, sails, signs) should be muted reds, ochres and teal. No neon.

## Size and framing

- **Sizes come from the art list.** Each asset has a "size on map" in world units, which is the
  width it is drawn at. Export at **8 pixels per world unit** (a 20-unit cottage is 160 px wide),
  with up to 10% transparent margin.
- **Buildings and homes:** the bottom edge of the walls sits on the bottom of the canvas. The game
  stands the sprite on its footprint's front edge.
- **Trees, props and landmarks:** the base sits on the bottom centre of the canvas.
- **Height:** draw buildings as tall as they naturally are. The game keeps the aspect ratio of the
  image.

## Characterful but readable

- Every named building should be recognisable at a glance from its shape and sign picture. The
  tavern has a tankard sign and barrels; the gunsmith has a pistol sign; the gaol has bars.
- Pirate flavour comes from small details: patched roofs, rope, nets, skulls on signs and flags.
  Avoid gore and anything frightening for young players.
- Variants of the same thing (cottages A–D, trees 1–4) share a silhouette family but differ in
  roof, colour or detail.

## Prompt template (one asset)

> Pixel-art game sprite of **[asset description from the list]**, for a pirate island adventure
> game. Top-down three-quarter view, facade parallel to the screen, roof ridge horizontal, not
> isometric. Sun from the upper left, soft contact shadow to the lower right. Warm dark-brown
> outlines, painterly pixel finish, palette matching the attached references. Single object only,
> centred, transparent background, no text, no ground tile. Width about [size × 8] px.

## Checking a delivery

Before an asset goes in, check that:

1. It is a single object, on a transparent background, with no text.
2. The camera matches the reference, so it sits naturally beside its neighbours on the map.
3. The light comes from the upper left.
4. Its width in pixels matches the size in the list.

Then point its id at the file in `art_slots.py` and rebuild.
