# Town scenes (Tortuga Cove town centre)

The whole town centre is data. Nothing in `MapScreen.tsx` needs touching to change it.

| To… | Edit |
|---|---|
| Swap a building/prop/tile's art | Replace the PNG in `assets/sprites/tortuga_town/v3/` (same name), or point its entry in `tortugaTownAssets.ts` at a new file |
| Re-tune a sprite (size, door position, ground line, solid area) | Its one line in `tortugaTownAssets.ts` |
| Move / add / remove a building, prop, street, lane, kerb, fence | One line in `tortugaTownLayout.ts` |
| Raise / lower ground (terraces, retaining walls, steps) | `terraces` in `tortugaTownLayout.ts` — `height` is the wall face, `steps` are x positions of flights |
| Gardens and yards | `greenery` — one rect + seed per patch (change the seed to reshuffle the plants) |
| Spawn point | `spawn` in the layout (and `START_POSITION` in `src/data/islands.ts`) |

| Piers | Their walkable lines live in `src/data/harbor.ts` (`townDrawn: true`); the layout builds the planks, pilings and rails from them |
| Invisible walls (quay edge, pier rails) | `blocks` in the layout |
| Extra props | `assets/sprites/tortuga_town/v3/lib/` — trimmed copies from the main sprite library, registered at the bottom of `tortugaTownAssets.ts` |

**Checking a change:** `npm test` runs `src/town/__tests__/tortugaTown.test.ts` — spawn is clear, every
door is reachable, piers/hills/square reachable, no overlapping buildings. On the web build, add
`?at=x,y` to the URL to start Scally at any town coordinate (e.g. `?at=-10,-380` = the Long Pier).

Rules: harbour is north; every building faces south; a building's `y` is its door threshold
(ground line) and `id` is its `src/data/buildings.ts` id (makes the door enterable; `null` = scenery).
Contiguous `r_*` singles were cut from one terrace image — keep them side by side in order.

`townScene.ts` turns the layout into ground tiles, depth-sorted sprites, collision rects and door
points (`townRender.tsx` draws them). It is town-agnostic, so a second town is just another layout + asset file.
