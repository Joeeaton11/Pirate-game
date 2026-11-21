# Scallywag Isles: painted art brief (Tortuga)

This brief is for replacing the code-drawn art with painted art from Weave, Figma or an artist.
Nothing on the map moves when you do this. Every look is its own file, the code-drawn version is the
reference for its size and footprint, and a painted file dropped into `assets/art_painted/` wins on
the next build.

## The rules

1. **One asset per image.** Every generation request produces exactly one item on its own canvas.
   Never use a grid, sheet or collage (see `AGENTS.md`). The ground is one asset, so it is one image.
2. **Match the target style.** The look is `docs/style/target_style.png`. Read
   `docs/ART_STYLE_GUIDE.md` for the camera, light, outline and palette rules.
3. **Use the code version as the reference.** For every asset, send its reference image from
   `docs/art_reference/` alongside the target style. Ask for the same shape, size, footprint and
   framing, painted in the target style.
4. **Use a transparent background** for everything except the ground. Don't include text, apart
   from the district name boards.

### Style prompt (use the same one every time)

> Top-down three-quarter view pixel-art game asset, dense detailed tropical pirate island style,
> sun from the upper left, soft shadow to the lower right, dark warm brown outlines, rich saturated
> colours, clean readable shapes, transparent background, single object only, no text, no grid,
> no border. Match the shape, size and framing of the attached reference exactly.

For the ground, drop "transparent background, single object only". Add: "the whole island seen from
above, same coastline, roads, rivers, fields and docks as the reference, no buildings, no trees,
no props".

## What to make

| Group | Reference images | Drop painted files here | How many |
|---|---|---|---|
| **Ground** (sea, beaches, grass, roads, cobbles, docks, cliffs, bushes, flowers) | `docs/art_reference/ground_reference.png` | `assets/art_painted/ground.png` | 1 image |
| **Buildings** (each named building and every town house) | `docs/art_reference/buildings/<id>.png` | `assets/art_painted/buildings/<id>.png` | one per file, about 120 |
| **Objects** (trees, palms, boulders, props, clutter, stalls, canopies, tents, cranes, name boards) | `docs/art_reference/obj/<id>.png` | `assets/art_painted/obj/<id>.png` | one per look, about 140 |
| **Moving life** (animal, boat, flag and fire frames) | `docs/art_reference/life/<kind>_<frame>.png` | `assets/art_painted/life/<kind>_<frame>.png` | about 20 |

Use the reference file name as the painted file name. One painted look replaces every copy on the
map. For example, `palm_2.png` restyles every palm that uses variant 2.

### The ground

- **Framing:** island units from x -620 to 620 and y -580 to 540. That is an aspect ratio of
  1240:1120 (about 1.107:1), with the island centred as in the reference. Keep the coastline,
  roads, rivers, fields, docks and walls exactly where the reference has them. These positions
  carry gameplay, because you can't walk through cliffs, water or walls.
- **Leave out buildings, trees and props.** They are drawn on top as their own sprites. Bushes,
  flowers, grass detail, path wear and the sea are part of the ground.
- **Resolution:** the code ground is 4,960 × 4,480 px. Most image tools stop at about 2,048 px.
  At that size one image gives about 1.6 px per unit, compared with 4 now, so it will look softer
  close up. Generate as large as the tool allows. The build scales the image to fit and cuts it into
  tiles.

### Buildings, objects and life

- **Keep the footprint.** The bottom centre of the image is where the object stands. The game
  places it there and scales it to the reference width.
- **Painted files can be higher resolution** than the reference, as long as the aspect ratio
  (height ÷ width) stays the same.
- **Buildings face south.** The door is on the front face, towards the bottom of the image.
- **Life frames are pairs.** Frame 0 and frame 1 are the two poses of the animation, such as wings
  up and down, or a flag waving. Paint both with the same proportions.

## Applying painted art

1. Save the painted files into `assets/art_painted/...`, using the paths in the table above.
2. Run `python3 tools/blueprint/build_tortuga.py <town walk map>`. The build:
   - uses each painted file in place of the code look
   - cuts the painted ground into tiles
   - regenerates the slot lists. Positions, collision, lamps, windows and chimney smoke are
     unchanged.
3. Anything without a painted file keeps its code-drawn look, so you can do the island in stages.
   For example, do the ground first, then the trees, then the town.
