# Scallywags — Design Breakdown & Action Plan

A living reference doc mapping our pirate game (working title **Scallywags**) against the
structure of the original Game Boy Pokémon games, so we have a shared, concrete plan to build
against. Legend: ✅ built and tested, 🔄 partially built / needs rework, ⬜ designed but not built.

## Premise & Goal
- ✅ Player becomes a pirate captain, sailing an open world, recruiting a crew
- ✅ **Player character has a fixed identity — Captain Scally, with sidekick Cheeky the monkey**
  (built 2026-07-31, from the "Scallywags" brand style guide). `src/data/protagonist.ts` holds
  the shared name/emoji constants. Named on the onboarding overlay (narrated in Scally's voice)
  and the Menu screen header ("Captain Scally's Log" / "Cheeky is minding the ship"); the on-land
  player token swapped from a generic `🧍` to a walking-man glyph (see Movement & Exploration for
  the 2026-08-01 animation pass) so it visually reads as Scally rather than an anonymous figure.
  Cheeky is flavor-only — deliberately **not** a mechanical crew member, so the
  permadeath/heat system (navy press-gangs, rival capture) applies uniformly with no named-character
  exemption to design around. Per the branding decision below, this is packaging on top of the
  existing systems, not a rewrite of them — no mechanics changed
- ⬜ The other 5 named crew from the brand sheet (Polly, Big Beard Bill, Tiny Tim, Captain Blackfin,
  Admiral Octavia) are intentionally **not** mapped to specific in-game NPCs/recruit templates yet —
  left as external brand assets until there's a concrete reason to wire one in (e.g. a specific
  recruit template reskin, a rival, a Pirate Lord)
- ⬜ Two parallel goals mirroring Pokédex + League: (1) a **Crew Log** (like a Pokédex — every
  recruitable NPC/species you've met vs. actually recruited, with a completion %), (2) a **main
  questline** ending in becoming a named Pirate Lord/King — the "beat the League" analog
- ⬜ Rival captain (named, recurring) mirrors the Pokémon rival — currently our "Rival Captain" is
  just a random hostile template, not a persistent character

## World & Map Structure
- ✅ One continuous world (not Pokémon's screen-by-screen grid) — 7 islands + open sea, free-roam,
  camera-follow
- 🔄 Currently fully open with no gating at all — Pokémon's world *feels* open but is actually
  gated hard by HMs/Badges. We have zero equivalent gating yet, which makes "danger scales with
  distance from home" the only progression signal. Needs:
  - ⬜ **Ship upgrades as soft gates** (Sea equivalent of HMs): can't survive Île Sainte-Marie's
    waters without a "Reinforced Hull," can't outrun Navy patrols without a "Swift Rigging," can't
    dive for underwater ruins without a "Diving Bell," etc.
  - ⬜ **Reputation-gated ports**: some islands refuse to let you dock/enter buildings until you
    hold a certain Letter of Marque tier (see Progression below), mirroring Badges gating HM use
- ✅ **DECIDED: real 17th/18th-century pirate locations, not invented islands.** Each of the 6
  current islands is a real Golden Age of Piracy location, chosen because its real history already
  supplies a distinct per-island identity/gimmick (Pokémon's per-city-gimmick equivalent) that
  matches mechanics already built or already planned, rather than needing an invented hook. See
  the **Island Layout** subsection below for the full list and rationale. Supernatural elements
  (curses, krakens, ghosts) are kept as a folklore layer on top of real places — period sailor lore
  genuinely included ghost ships and sea monsters, so this isn't a contradiction
- ⬜ More islands over time beyond the current 6 + endgame zone — candidates already scouted:
  Cartagena/Havana/Panama/Maracaibo (raid-heist content), Bermuda (supernatural side zone, real
  "Isle of Devils" nickname), the Whydah wreck site off Cape Cod (shipwreck-salvage dive quest),
  Bath NC (real site of Blackbeard's pardon — a narrative hook for the Letter-of-Pardon monetization
  idea below)
- ⬜ A "Safari Zone" equivalent: a paid-entry, limited-turns treasure island with exclusive rare
  crew/resources and its own catch-without-battle mechanic (e.g., pay coin to attempt recruitment
  via a persuasion mini-game instead of combat)
- ✅ A post-game superboss zone (Cerulean Cave equivalent) is built at **Ocracoke Inlet**
  (Blackbeard's real base and death site) — see Island Layout below

### Island Layout (real locations, chosen 2026-07-30)
- ✅ **Tortuga** *(home port, unchanged)* — the real historical pirate free port. Stays the safe
  zone / bounty board home
- ✅ **Cow Island (Île à Vache)** — Order 1 Pirate Lord, Blade, Lv.6. A real fleet-muster point
  where green crews assembled before Henry Morgan's raids — a natural "cut your teeth" starting
  zone
- ✅ **New Providence (Nassau)** — Order 2 Pirate Lord, Musket, Lv.9. The real pirate-run republic
  (no crown authority) — gunfights and taverns, fits the musket specialty better than an invented
  island could
- ✅ **Roatán (Bay Islands)** — Order 3 Pirate Lord, Cannon, Lv.12. A real careening/ship-repair
  site — literally a shipyard, which is why the Cannon-specialty-gated side quest lives here
- ✅ **Port Royal** — Order 4 Pirate Lord, Curse, Lv.15. Sank into the sea in a real 1692
  earthquake — the existing "Drowned Widow" lord and her drowned/ghost lore needed almost no
  rewriting, since the real history already matched the invented fiction
- ✅ **Île Sainte-Marie** — Order 5 Pirate Lord (final), Curse, Lv.20. The real remote pirate haven
  tied to the Libertalia legend — the hardest, most exotic challenge before the endgame
- ✅ **Ocracoke Inlet** — Order 6 Pirate Lord (true finale), Blade, Lv.25. Blackbeard's actual base
  and death site, gated behind completing the Pirate Council rather than sequential order — a
  natural convergence point for the still-unbuilt recurring named rival captain arc

### Real-world coastline shapes (built 2026-07-31)
- ✅ Every island's landmass is now a hand-authored irregular polygon that echoes the real
  island's true orientation and elongation, instead of a perfect circle — Tortuga's turtle-shaped
  silhouette, Roatán's strongly elongated wasp-waisted form, Île Sainte-Marie's narrow north-south
  sliver, Ocracoke's thin curved barrier-island crescent, Port Royal's rounded head trailing a
  Palisadoes-style sand spit, Cow Island tapering from hillier west to swampy east, New
  Providence's fairly regular oval
- ✅ `Island.radius` replaced with `Island.shape: {x,y}[]` (points relative to `position`);
  `islandAtPoint()` in `src/data/islands.ts` now does real point-in-polygon (ray casting) instead
  of a circular distance check
- ✅ Added `react-native-svg` and render each island as an `<Svg><Polygon>` in `MapScreen.tsx`
  rather than a `View` with `borderRadius`
- ✅ Every existing building/quest/resource-node/pirate-lord/rescue/salvage offset was checked
  against its island's new polygon (all currently fall on land) before shipping
- Not survey-accurate GIS data — approximated by hand from each island's real dimensions/shape
  described on Wikipedia, sized to keep all existing map content on land. A true art-fidelity
  pass (hand-painted coastlines/forests like a fantasy map) would need real art assets, which is
  out of scope for now.

## Movement & Exploration
- ✅ **Deliberately not grid-based** — this is our biggest intentional divergence from Pokémon.
  Kingshot-style drag-to-move continuous movement instead of tile-by-tile. Keep this; it's core to
  the pitch.
- ✅ Camera follows player; speed and sprite change between sea (ship) and land (on-foot)
- ✅ **Pokémon-close camera zoom, built 2026-07-31, tuned to 5x against reference screenshots**:
  the outdoor map now renders at 5x its native scale (`ZOOM` in `MapScreen.tsx`) — buildings,
  houses, streets, everything inside the `world` container zooms uniformly via a single CSS-style
  transform (`translate` then `scale`, with the translate math canceling out the view's default
  center-origin so it zooms around the player rather than the world's geometric center). No
  gameplay math changed — movement speed, encounter radii, building triggers, coastline collision
  all still operate in true world units; only the world-to-screen rendering scale changed
- ✅ **Player-to-building size ratio fixed, 2026-07-31**: raising `ZOOM` alone never got the view
  close to Pokémon's, because the player token's on-screen size scaled in lockstep with everything
  else — and it started from a native size (40 units) already close to a building's (44 units). In
  real Pokémon a character is roughly 1 tile and a building is 5-7 tiles, i.e. the character reads
  as small next to structures; ours read as roughly building-sized. Fixed by shrinking the
  player's native footprint to 12 units — the same `ZOOM` factor now makes buildings and houses
  loom the way they do in the reference screenshots while the player stays correctly small next to
  them, with zero change to any world-unit gameplay math
- ✅ **Street life roster more than doubled, 2026-07-31**: 8 more ambient NPCs (a town crier, a
  farmer, a net-mender, a fort sentry, a beggar, a forge cat, a rope-maker, a lookout) patrol
  areas of Tortuga Cove that previously had no wandering life — near the Customs House, La Ringot
  Fields, the Fishmonger, Fort de Rocher's approach, the Warehouse, the Smithy, the Ropewalk, and
  West Point — for 15 wandering NPCs total, spread across the whole town instead of clustered near
  the square. Same mechanism throughout: deterministic waypoint patrol, one-shot flavor toast on
  approach, every waypoint validated on-land before being added
- ✅ **Simple filler townspeople, 2026-07-31**: 15 more street NPCs using plain "generic person"
  emoji (🕺💃🚶🏃🧍👫🧌🧞) rather than named trades — a couple of dancers, passersby, runners,
  locals, a couple, and even a troll and three genies (fitting, given the game already has
  curse-type crew and dark-forces quest flavor). Deliberately undifferentiated: same short generic
  flavor line shared across variants of the same "type" (e.g. all 3 "Passerby" NPCs say the same
  thing) rather than bespoke lore per NPC — 30 wandering NPCs total now, just more bodies making
  the town feel busy, not more content to author or maintain
- ✅ **Player token: walking-man glyph + animated walk cycle, 2026-08-01**: swapped
  `PLAYER_EMOJI_LAND` from the boy-face `👦` to `🚶‍♂️` per direct feedback. Since there's no real
  spritesheet, "animation" is a single-glyph bob: an `Animated.Value` drives `translateY` in a
  160ms-up/160ms-down loop (`Animated.loop`) while the drag gesture is actively past the deadzone,
  settling back to rest the instant it stops — driven by the same `directionRef`/gesture state the
  movement tick loop already uses, no new source of truth. Also flips the glyph horizontally
  (`scaleX: -1`) based on drag direction so the character visibly faces the way they're walking;
  the base glyph's art faces left, confirmed empirically via cropped high-DPI screenshots (the
  first attempt had the mapping backwards — moving right showed him facing left — caught by
  actually comparing rendered frames rather than assuming a direction)
- ✅ **Front-facing glyph for vertical movement, 2026-08-01**: the side-profile emoji only reads
  left/right, so walking up or down looked identical to standing still sideways. Added a second
  glyph (`🧍‍♂️`, front-facing) and pick between it and the side-profile one based on which axis of
  the drag gesture dominates (`|dy| > |dx|` → front-facing) — same gesture-derived state as the
  left/right flip, no separate tracking. Up and down still look identical to each other (there's no
  Unicode "back view" walking person to distinguish them), but toward/away now visibly differs from
  sideways movement, which was the actual ask
- ✅ **Map decluttered, 2026-07-31**: at 5x zoom, two always-on floating text labels — the island
  name+emoji badge and each landmark's name — turned out to be sized for the old unzoomed 1:1 view
  and never got revisited when `ZOOM` was introduced. The island label box alone rendered wider
  than the phone screen. Removed both: the island name is redundant with the header bar (which
  already shows the current zone persistently), and a landmark's name is already communicated by
  its walk-up flavor toast, matching how buildings already worked (emoji only on the map, name
  discovered by approaching). Also fixed street NPCs, which had the exact same bug as the player
  token before that fix — a native size (32 units) big enough to render house-sized once zoomed;
  shrunk to 10 units so ambient NPCs read as small figures near the player, not structures
- ✅ **Houses are solid, and walking speed halved, 2026-08-01**: first real playtest feedback — the
  player could run straight through the 79 decorative houses (they'd never had any collision, only
  buildings/landmarks did via their proximity triggers), and `LAND_SPEED` at 140 units/s felt far
  too fast once the camera was zoomed in tight. Added axis-separated circle collision against every
  house on the player's current island (`HOUSE_COLLISION_RADIUS` 14 + `PLAYER_COLLISION_RADIUS` 6):
  a blocked diagonal move retries X-only then Y-only before giving up, so the player slides along a
  house's edge instead of hard-stopping the instant they touch it. `LAND_SPEED` dropped 140 → 70.
  Buildings/landmarks/quest markers deliberately excluded — their `ENTER_RADIUS` (45) is already
  bigger than their visual footprint (22), so you're navigated into them well before you'd visually
  clash; adding collision there would be redundant. Verified by holding a drag into a house for 2+
  seconds and confirming the camera stopped scrolling rather than sliding the player through it
- ✅ **Fixed a real soft-lock in that house collision, 2026-08-01**: second playtest session, the
  player got permanently wedged between two houses. Root cause, checked against the actual
  procedurally-generated layout in `src/data/houses.ts`: the combined keep-out radius (14+6=20)
  exactly matched the tightest recurring house-to-house spacing in the grid (many pairs are exactly
  20 units apart), leaving zero or negative real-world gap between dozens of neighboring pairs —
  and since the slide fallback only retries the *current* drag's exact X and Y axes (not other
  directions), landing in one of those corners meant both axes were blocked simultaneously for
  whichever direction the player was holding. Fixed by shrinking to `HOUSE_COLLISION_RADIUS` 6 +
  `PLAYER_COLLISION_RADIUS` 3 (9 combined) — verified programmatically against every pair in the
  real dataset (zero pairs left with a negative gap, smallest real gap now 2 units) and against a
  synthetic 8-directional escape check across the whole town grid (zero fully-enclosed points at
  any radius tested, including the original — confirming this was a corner/direction-limitation
  issue, not a literal maze dead-end). Re-verified in-browser with a multi-direction wander through
  the densest house cluster; the player kept moving throughout and even walked into a building
  naturally, rather than freezing
- ✅ **`ENTER_RADIUS` shrunk 45 → 26, 2026-08-01**: third playtest round — walking anywhere near a
  building on the way to somewhere else would yank you inside it, since 45 was more than double a
  building's own visual half-width (22). 26 keeps entry to "you're basically at the door" while
  still safely bigger than the sprite. Applies to every walk-up trigger (buildings, landmarks, side
  quest markers, pirate lord forts, rescue point) since they all share the one constant. Verified
  every Tortuga building stays reachable from spawn within the new radius via a flood-fill
  simulation using the exact same house-collision logic as the live game (BFS over a stepped grid
  from spawn, checking whether any reachable point lands within `ENTER_RADIUS` of each building) —
  a much more reliable check than blind simulated drags, which kept getting rerouted by the
  residential grid the same way a real player would need to actually follow the streets
- ✅ **Visual indicator for buildings hosting an open Patron quest, 2026-08-01**: same feedback —
  "not obvious which building has a challenge." A small ❗ badge (reusing the same one already used
  inside a building on an individual patron NPC) now renders on a building's map icon whenever any
  of its `hostedByBuildingId` quests isn't in `completedQuestIds` yet. Pure derived UI, no new store
  state — same "has an open quest" definition `BuildingScreen` already uses per-patron
- ✅ **Street NPCs rewritten from ping-pong to street-network wandering, 2026-08-01**: same feedback
  — NPCs "just going back and forth" and wandering off streets into yards. Reworked from a
  stateless pure-function-of-time ping-pong between two fixed points to a real per-tick simulation:
  each NPC's `anchor` (its original rough flavor location) is projected onto the *nearest actual
  street segment* (`nearestStreetSegment` in `src/data/streets.ts`) at first use, and it wanders by
  walking to a random point on that segment or any segment connected to it (`connectedSegments`,
  sharing an endpoint), picking a new random target on arrival — a small local random walk along
  the real street graph instead of a fixed back-and-forth line. Nine NPCs' original anchors were
  18-30 units off the nearest street (checked programmatically); they now visibly live on the
  street instead of in a yard, which is the intended behavior. Also collides with houses using the
  same `slideAroundObstacles` helper the player uses (extracted as a shared pure function so both
  share one implementation), with a smaller collision radius (2, vs. the player's 3) matching their
  smaller on-screen size. Simulated once per 250ms wander tick (not the 33ms movement tick — ambient
  motion doesn't need that resolution), storing state in a `Map` ref to avoid extra re-renders.
  Verified in-browser: NPCs visibly relocated to different points along the street over a 10-second
  window, and no console errors from the rewrite
- ✅ **Street NPCs: generic walking-person sprite + bounded patrol radius, 2026-08-02**: two
  complaints at once — "confusing when random emojis walk around," and "I want them to stick to the
  paths and routes rather than just running around all over." Root cause of the second one: the
  residential grid's own streets can be very long (a full avenue can span the whole town), so once
  an NPC's nearest street *was* one of those, "any random point on a connected segment" let it wander
  the length of that whole avenue — confirmed programmatically against the real street data before
  touching any code: the worst case (the New Providence ship's cat) could reach 293 units from its
  own anchor under the old logic, nearly the width of the island. Fixed with `NPC_PATROL_RADIUS`
  (45) and a new `pickPatrolTarget()`: every retarget still has to land on a real street point, but
  now retries (falling back to the anchor itself) until it finds one within 45 units of the NPC's
  original anchor, so they stay a tight local loop near their authored flavor spot instead of
  crossing the map. Re-ran the same simulation post-fix — all 38 street NPCs across every island
  stayed within the 45-unit cap over 500 simulated retargets each. For the emoji complaint: replaced
  each NPC's individual flavor emoji (a dice, a fiddle, a parrot, a cat) with the exact same
  `PLAYER_EMOJI_LAND_FRONT`/`PLAYER_EMOJI_LAND_SIDE` sprite pair the player itself uses, in the same
  front/side pose based on which axis they're currently moving along, plus a left/right flip matching
  the player's own convention — so every wanderer on screen now unambiguously reads as "a person
  walking" rather than a menagerie of moving objects. The per-NPC flavor emoji is untouched in the
  data model and still shown in the approach flavor-toast text (`🎻 A One-Legged Fiddler: ...`) — only
  the moving map sprite changed. Verified in-browser: every visible street NPC now renders as the
  walking-person figure, confirmed against a screenshot showing several at once with no leftover
  object/animal icons
- ✅ **Street NPCs get varied clothing colors, 2026-08-02**: immediate follow-up — now that every
  NPC shares one walking-person glyph, they all looked like the same identical person. Emoji glyphs
  are colored images, not vector art with a separately recolorable clothing layer, so there's no
  direct way to "just change the shirt color." Landed on a per-NPC CSS `hue-rotate` filter
  (`npcClothingHueDeg()`, hashed from the NPC's id so a given NPC always gets the same color, not a
  new random one every render) plus a `saturate(2.5)` boost so the shifted hues stay clearly visible
  instead of washing out — shifts every colored pixel (clothes, skin, hair) around the color wheel
  together while leaving true black/white pixels (outlines, shading) alone, which reads as "a person
  in different-colored clothes" well enough for emoji-placeholder art. Feasibility was checked
  in-browser before writing the real implementation (a throwaway inline version screenshotted first)
  since `filter` isn't part of React Native's own style types — it's a react-native-web-only pass-
  through, confirmed working on this project's `react-native-web` version, but a reminder for later:
  **this has no effect on a native iOS/Android build**, only the web export this project currently
  ships. A real cross-platform fix would need actual per-NPC sprite art or an SVG-based character
  instead of a plain emoji glyph
- ✅ **Fixed: clothing-color hue-rotate was recoloring skin too, 2026-08-02**: immediate, entirely
  fair correction — "didn't think I'd have to tell you not to make the skin not human coloured."
  The bug was inherent to the approach above, not a tuning mistake: `hue-rotate` shifts every
  colored pixel in the glyph together, so it rotated skin tone right along with the shirt — on an
  unlucky hash, straight to pink. There's no rotation amount that fixes this in general, since emoji
  glyphs have no separate "clothing" pixels to target in isolation. Replaced entirely: removed the
  filter from the glyph (skin now renders 100% untouched, always natural), and instead draw a small
  solid-color `View` patch (`npcClothingColor()`, same id-hash approach for a stable per-NPC color)
  positioned over just the torso region of the 7pt glyph centered in its 10x10 box — tuned by eye
  against real screenshots rather than exact font metrics, since emoji glyph internals aren't
  something code can introspect. Verified at 4x device-scale zoom on both the side-walking and
  front-standing poses: natural yellow/tan skin visible above and below the patch in both cases, and
  the patch itself lines up convincingly with the shirt/chest area, not overlapping the face
- ✅ **Joystick reliably resets on release, 2026-08-01**: fourth playtest round, on a real
  touchscreen — "controls are stuck," movement not stopping when the finger lifts. Direction was
  already a ref cleared synchronously in `clearDrag()`, so the likely cause is
  react-native-gesture-handler's web implementation occasionally missing `onFinalize` on a real
  touch (a swallowed touchend/touchcancel) — not reproducible via mouse/Playwright, which is
  presumably why it wasn't caught earlier. Added a window-level `pointerup`/`pointercancel`/
  `touchend`/`touchcancel` listener as a safety net that also calls `clearDrag()`, so release is
  never missed regardless of what the gesture handler itself does. Also made the visual reset match
  a real joystick: the knob now snaps to dead-center of the base immediately on release (previously
  it just vanished mid-position), then the whole control fades out ~150ms later instead of cutting
  off abruptly. Caught and fixed a self-inflicted bug in the same change: the native `onFinalize`
  and the new window-level listener both fire for every release by design (redundant, not just a
  fallback), and the second call was immediately hiding the knob before the snap-back was visible —
  fixed by making `clearDrag()` a no-op on the visual reset (not the movement stop, which stays
  unconditional) whenever a snap-back is already in progress. Verified in-browser: knob visibly
  centered at 30ms post-release, fully faded by ~330ms, and the world stayed motionless across a
  1-second window after release (only independently-timed ambient NPCs moved)
- ✅ **Joystick anchored on the character, not the touch point, 2026-08-01**: fifth playtest round —
  the control ring appeared wherever the finger first touched down, which could be nowhere near the
  player token. Since the player is always fixed at the exact center of the screen, `onBegin` now
  anchors the joystick there (`viewport.width/2, viewport.height/2`) instead of the touch
  coordinates — the ring visibly surrounds the character regardless of where the drag starts.
  Direction/speed math is untouched (it was always based on drag *delta*, not absolute position),
  so this was a pure display-anchor fix. Verified in-browser: touched down in the opposite corner
  of the screen from the player and the ring still appeared centered on the character
- ✅ **Streets widened, 2026-08-01**: same playtest round, "too congested." Bumped the 'main' street
  sidewalk/road stroke widths (28/16, was 22/12) and the 'path' dashed stroke (8, was 6). Checked
  first whether a bigger jump was safe: houses hug streets tightly by design (median house-to-street
  distance is only 10 units against a house's own 13-unit visual radius, i.e. most houses already
  graze the current sidewalk edge on purpose, like real streetside frontage) — a large width
  increase would start visibly cutting into houses on the tightest blocks, so this was a deliberate
  moderate bump rather than a bigger one. Purely a rendering change; the walkable width (house
  collision positions) is unchanged
- ✅ **`LAND_SPEED` dropped 70 → 45, 2026-08-01**: sixth playtest round, walking still felt too
  fast. Sea speed (260) untouched — only asked about walking pace
- ✅ **Fixed the exit-doorway soft-lock, 2026-08-01**: seventh playtest round — "can't move, stuck
  in the doorway" after leaving a building. Root cause, checked against the real data: the
  "push the player just outside the building's trigger radius" logic (added long before house
  collision existed) uses a fixed distance (`ENTER_RADIUS + 15` = 41 units) straight out from the
  door in whatever direction the player approached from — but several Tortuga buildings have a
  house closer than 41 units (as close as 30), so that fixed push could land the player directly
  inside a house's collision zone, wedging them in immediately on exit. Added `findClearExitSpot()`
  — radiates outward from the door, trying the original approach direction at increasing distances
  first, then fanning out to other angles, until it finds a spot clear of every house on that
  island. Verified programmatically against the real building/house data: every Tortuga building
  produces a clear exit spot across a full sweep of approach angles (0-350° in 10° steps) — the
  same rigor as the earlier house-collision fixes, since blind manual test-walks to a specific
  building kept being an unreliable way to verify this class of bug
- ✅ **Building entry is now a dismissible bottom prompt instead of auto-navigating, 2026-08-02**:
  eighth playtest round — walking near a building instantly opened its full-page screen, but "you
  don't always want to go inside the building you walk past." Walking into `ENTER_RADIUS` now shows
  a small card pinned to the bottom of the screen ("Enter The Salty Parrot?" + its emoji) instead of
  navigating immediately; tapping it enters the building, walking away from it without tapping makes
  it disappear, and movement is no longer frozen just for being near a door. Follow-on fix: the
  "nudge the player just outside the trigger radius on return to the map" effect used to include
  buildings (needed when proximity meant instant re-entry) — with buildings no longer auto-entering,
  that nudge was pure unwanted bounce, so buildings were dropped from that check and the now-dead
  `nearbyBuildingPos()` helper was deleted. Verified with a marked, fully-reverted temporary
  test-spawn (`TEMP-TEST-SPAWN`, confirmed removed via `grep -rn TEMP src` before commit) placing the
  player in range of a real building: the prompt appeared while approaching, disappeared when walked
  past without tapping, and tapping it correctly opened the building screen.
- ✅ **Buildings get a roof-colored cap so they read as small buildings, not flat squares,
  2026-08-02**: same round — "add a small emoji symbolising what type of building it is on the roof
  of the building." Turned out the type emoji already existed and was already shown (tavern = 🍻,
  fishmonger = 🐟, exactly the user's own examples) — the real problem was the plain flat dark square
  it sat in, which didn't read as "a building" next to the nicer-looking decorative house sprites and
  didn't stand out enough to tell buildings apart at a glance. First attempt was a separate peaked
  roof shape floating above the box with the emoji shrunk onto it as a badge — screenshotted and
  rejected before shipping: several type emoji (the fort's 🏰, the shop's 🏪) already render as
  detailed mini-buildings with their own roof/awning baked into the glyph, so the extra shape floating
  above them just doubled up and looked wrong. Landed on a roof-colored band (`buildingRoofCap`)
  clipped inside the existing box's rounded corners instead, with the type emoji kept at its original
  large centered size — gives every building a consistent two-tone "roofed box" look without fighting
  any individual glyph's own artwork. Verified via screenshots (using the same temporary, fully-
  reverted `TEMP-TEST-SPAWN` technique) across four different building types (tavern, fort, shop,
  warehouse) to confirm the cap clips cleanly and the icon stays legible in every case.
- ✅ **Roof-cap swapped for an actual house base under the type badge, 2026-08-02**: immediate
  follow-up feedback on the above — "if there is a ready made emoji for the building use them, but
  for the others that don't have a specific emoji use the house building with the emoji on top,
  rather than just a triangle." Split buildings into two groups by their emoji: ones that already
  depict an actual structure (`BUILDING_SHAPED_EMOJI` — fort's 🏰, shop's 🏪, chapel's ⛪, customs'
  🏛️, manor's 🏚️, the two hut-type beach buildings' 🛖, the shrine's ⛩️) keep rendering large and
  alone, unchanged. Everything else (tavern's 🍻/🍺, fishmonger's 🐟, smithy's ⚒️, warehouse's 📦,
  distillery's 🥃, timber yard's 🪵, armoury's 💥, smuggler's den's 🕳️, college's 🎓, beach camp's
  🏖️) now renders a plain house emoji as the base with the real type emoji layered on top of it as a
  small badge. Note for anyone touching this next: the map view applies a `ZOOM = 5` scale transform
  to everything inside it, so a `fontSize: 14` badge still renders as a ~70px glyph on screen — don't
  mistake that for a bug, it's the same scale factor every other marker on the map already gets.
  Verified via screenshots (temporary `TEMP-TEST-SPAWN`, reverted and grep-confirmed clean before
  commit) on the tavern and warehouse (house base + badge) and the fort and shop (unchanged, still
  large and alone) — a tight crop on the tavern confirmed the house's door/windows and the beer mugs
  badge sitting on its roof are both clearly visible together, not just one covering the other.
- ✅ **Added a rotating compass pointing at the main quest, 2026-08-02**: raised as "I don't know
  where to find things for a quest" — discussed how Pokémon solves this (hard-gated routes + NPC
  dialogue, not markers) and agreed that doesn't transfer here since Scallywags is free-roam across
  six islands with nothing physically blocking a wrong turn. Landed on a 🧭 badge, top-right of the
  map viewport, that rotates to always point at the current main-quest target — reuses the exact
  target the header's "Main Quest" banner already names (next undefeated Pirate Lord's fort, or the
  gating side quest's location if the next lord isn't unlocked yet), resolved to a world position via
  the existing `pirateLordWorldPosition` / `sideQuestWorldPosition` / `buildingWorldPosition` helpers.
  Scoped to the main quest only, not every open side quest — side quests keep the Quest Log's island
  name plus the ❗ badge on their building, which is closer to "find it yourself" and was a deliberate
  choice, not an oversight. The rotation math (`atan2(dx, -dy)`, screen y grows downward so north
  needs the sign flip) works because the whole world already lives in one shared coordinate space —
  island `position` + building/lord `offset` are just numbers in the same units as the player's own
  position, so "as the crow flies" pointing works identically whether the target is on the same
  island, a different island, or the player's out at open sea. Verified two ways: hand-computed the
  expected bearing from spawn to Cow Island's fort and confirmed the rendered rotation matched, then
  dragged the player out to open sea and confirmed the needle visibly swung as the bearing changed
  (read back via the element's computed CSS transform, not just eyeballed). Emoji is a placeholder
  per the request ("use a compass emoji for now") — a proper needle asset can swap in later without
  touching the angle math.
- ✅ **Off-screen edge icons for resource nodes, 2026-08-02**: follow-up ask — "add an emoji that
  moves around the extremes of the screen for the mini quests... 🪵 moves in real life to show me
  where to get wood from." Added `edgeIndicatorPosition()`: clamps a world-space target to the edge
  of the visible viewport along the ray from the player (screen center) to the target, same idea as
  an off-screen objective marker in most open-world games — the icon "orbits" whichever edge the
  target is behind as the player moves, and returns `null` (hide it) once the target is already
  inside the visible area, since its own on-map marker is enough at that point. Scoped to resource
  nodes on the player's *current* island only, skipped while a node is on cooldown (nothing to gather
  right then) — deliberately narrower than "all mini quests": side quests already have the Quest
  Log's island name plus their own ❗ badge once you're there, and a marker pointing at a resource
  node on a different island wouldn't be actionable, so didn't add those to avoid stacking multiple
  edge icons and cluttering the screen. Can extend to side quests too if that turns out to be wanted.
  Verified in-browser: confirmed the fish node's edge icon appears pinned to the top edge dead-center
  when directly north and off-screen (matches its true offset, `{x:0, y:-140}`), slides sideways
  along the edge as the player moves off that exact bearing, and — via a temporary `TEMP-TEST-SPAWN`
  placed right next to the node, reverted after — disappears entirely once the node's own on-map
  marker is visible, confirming the "already visible" skip actually fires and doesn't just leave a
  redundant second icon next to the real one.
- ✅ **Extended edge icons to standalone side quests, 2026-08-02**: asked for right after the above.
  `resourceEdgeIndicators` and a new `sideQuestEdgeIndicators` now merge into one combined
  `edgeIndicators` list rendered by a single loop, instead of duplicating the render block. Limited
  to side quests with their own `.offset` (the ones that already get a 📜 map marker today) — quests
  with `hostedByBuildingId` are deliberately left out, since those are meant to be found by talking to
  patrons inside a building, not marked on the map at all, and adding an edge icon for them would
  undercut that. Also excludes whichever quest is the current main-quest `gateQuest`, since that one
  is already pointed at by the compass — showing both would just be two markers for the same target.
  Uses 📜 for every side-quest icon (matching the existing on-map marker) rather than each quest's
  `npcEmoji`, since the data model doesn't have a separate "what you'll get" emoji the way resources
  do, and 📜 is what the player will actually recognize once they arrive. Verified in-browser on
  Tortuga's bounty board quest (`offset: {x:0, y:130}`, due south of spawn): its 📜 icon appeared
  pinned to the bottom edge, roughly centered, at the same time as the fish node's 🐟 icon at the top
  — confirming multiple simultaneous indicators render independently without fighting each other.
- ✅ **Accepted patron quests also get an edge icon, pointing at their building, 2026-08-02**: asked
  "once I've got the side quest item, should where to deliver it pop up the same as the resources?"
  Turned out fetch quests always deliver back to the exact same NPC/building the quest came from —
  no separate drop-off point — so standalone quests already had this covered for free (their edge
  icon persists the whole time a quest is accepted, right up to turn-in). The real gap was
  building-hosted patron quests: deliberately unmarked before acceptance so they're found by
  exploring, but once accepted that reasoning no longer holds — you've already found it, you just
  need to get back. `sideQuestEdgeIndicators` now also includes `hostedByBuildingId` quests once
  `acceptedQuestIds` contains them, targeting the host building's position instead of a quest offset;
  still hidden pre-acceptance so undiscovered patrons stay a real discovery. Verified against the real
  quest data first (`patron_tortuga_drunk`: not eligible before accepting, eligible once accepted, not
  eligible once completed — the three states that matter), then confirmed visually by seeding
  `acceptedQuestIds` into `localStorage` before boot (faster and more reliable than navigating the
  dense house grid to actually click through the accept dialogue) and screenshotting a second 📜 icon
  appearing on the correct edge, pointing toward the tavern.
- ✅ Random encounters roll periodically while moving through a zone (land table per island, shared
  high-seas table at sea) — functionally equivalent to Pokémon's per-step tall-grass roll, just
  continuous instead of discrete
- ⬜ No day/night cycle yet (Gen 2 feature, not Gen 1 — low priority, could add later for
  atmosphere/spawn variation)
- ⬜ No weather system yet — storms could be a nice pirate-flavored addition (reduced visibility,
  changed encounter tables, ship damage over time), analogous to Gen 3's weather mechanics more
  than Gen 1
- ⬜ One-way ledge equivalent: currents/rip tides that sweep you past certain points but can't be
  sailed back against without an upgrade — a natural pirate-flavored one-way gate

## Islands, Ports & Buildings (Towns equivalent)
- ✅ Buildings exist and are walk-in-to-enter, Pokémon-style (proximity-triggered, no button
  press) — tavern, beach camp, smuggler's den, naval college, manor, shrine, trading post
- ✅ **Real walkable interiors, built 2026-07-31**: walking into a building no longer jumps
  straight to a menu-like summary — it cuts to an actual small floor-plan room (furniture rendered
  as styled shapes: a bar counter, stools, tables, a rug, a barrel) that you walk around in with
  the same drag-gesture movement used outdoors, just bounded to the room instead of the world.
  NPCs (the building's own NPC plus any hosted Patrons) are positioned in the room as walk-up-to
  tokens rather than list rows; getting close to one surfaces a "Talk to X" prompt. Talking to the
  main NPC opens the existing hire/shop/craft/sell/steal/upgrades content (unchanged, just now
  reached this way instead of always being shown) with a Back button returning to the room; talking
  to a patron opens the same `SideQuestScreen` flow as before, completely unmodified. Buildings
  without a hand-authored floor plan yet (`src/data/interiors.ts` → `BUILDING_INTERIORS`) get a
  generic fallback room (main NPC up top, patrons arranged below, light decoration) so nothing is
  left non-functional — only Tortuga's tavern has a bespoke layout so far, matching Pokémon's own
  pattern of walking into a real tile room rather than a menu. Room player position is local to
  each visit (resets to the door on re-entry), and this is exactly the interior variant of the
  overworld's drag-to-sail movement, not a new engine built from scratch
- ✅ **The Salty Parrot, fleshed out**: a visible 🚪 door marks the entrance/exit, and two new
  generic furniture pieces support it — `chair` (🪑, ringing each of the tavern's 3 tables, 4
  apiece) and `prop` (a generic decorative-emoji type covering everything else: a parrot 🦜 perched
  over the bar — a nod to the tavern's name — a pirate flag and a map on the walls, two windows, a
  hearth, a potted plant, a cat, candles flanking the barkeep, and a dartboard with someone actually
  standing at it). Room grew to 360×340 (from 300×220 originally) with a third table added to fill
  the space. Two more named patrons round out the cast: **Scar-Faced Odom** (Rival Pirate archetype,
  `fetch` — wants a Grapeshot Charge "no questions asked," standing by the dartboard) and
  **Mother Yew** (Fortune Teller archetype, `specialty_gate` — needs a Curse-type crew member
  onboard to break a "ward," tucked by the hearth). The tavern now has 5 named characters total
  (Old Tom + 4 patrons) and its own quest count contributes 4 toward the 150+ target
- ✅ **Ambient NPCs — not every face needs a quest**: a new `AMBIENT_NPCS` record
  (`src/data/interiors.ts`) holds ordinary members of the public — a weathered sailor, the ship's
  cook, a local lass — who populate a room without being quest-givers. Walking up to one shows a
  one-off flavor line in a toast instead of navigating anywhere, keeping the "normal person, just
  there" feel distinct from patrons. To tell them apart at a glance, quest-giving patrons with an
  uncompleted quest show a small ❗ above their token (drawn from `completedQuestIds`, same
  approach as the outdoor quest markers' status coloring); it disappears once that patron's quest
  is done. The tavern now seats 3 ambient locals alongside its 4 questing patrons
- ✅ **Tortuga Cove: the whole-island blueprint, built 2026-07-31** (GTA-style: a real laid-out
  settlement covering the *entire* landmass — roads, buildings, docks, farmland, patrolling
  townsfolk — not a handful of markers scattered on grass). Historically grounded throughout, and
  meant as the template to repeat island-by-island next:
  - **Basse-Terre Square** is the town's hub (named for Tortuga's real farming/settlement
    district), with dirt-road streets (`src/data/streets.ts`, rendered as SVG lines) radiating out
    to every building and landmark, plus a separate harbor road linking the trading post to the docks
  - **Fort de Rocher, Chapelle Notre-Dame, and Smugglers' Warehouse are real enterable buildings**,
    each with its own interior, a named NPC + recruit, and a hosted Patron quest — not just scenery.
    Fort de Rocher is modeled on the real fortress: Jean Le Vasseur's actual fortified home atop a
    30-ft rock, ~40 cannons facing the harbor, reachable historically only by a staircase and a
    pull-up ladder — reflected in-game as a `path`-style street (thin, dashed) instead of a proper
    `main` road, the one place the road style itself carries historical meaning
  - **West Point Shack** is a new building on the island's far west tail (previously empty land),
    a retired pirate's hovel reached by a rough coastal trail — proof the layout now uses the whole
    landmass, not just the historically "correct" central town core
  - **La Ringot Fields** is a new non-interactive landmark (farmland — a real Tortuga district
    where tobacco was grown) rounding out the south-east corner
  - **The Harbor Pier** and **Basse-Terre Square** remain intentionally **non-interactive scenery**
    (`src/data/landmarks.ts`) — no interior, no quest, just a flavor-text toast on approach — the
    same "not every building needs to be a menu" idea as ambient NPCs, applied at the town level
  - **Street life**: `src/data/streetNpcs.ts` adds ambient NPCs that patrol back and forth between
    two waypoints (a deterministic function of time, no per-NPC state needed — `streetNpcPosition()`)
    instead of standing still, so the town feels lived-in from outside its buildings too. Same
    one-shot flavor-toast treatment as landmarks; never a quest
  - **Densified into a real downtown block, 2026-07-31**: streets got an actual sidewalk (a wider
    light stroke under a narrower dark road stroke, `main`-style only — `path`-style stays a bare
    dashed line, keeping that visual distinction meaningful), and the topology grew from pure
    hub-and-spoke into a small block network — each inner building now also connects onward to one
    more, so downtown reads as inter-connected blocks radiating from the square rather than a
    starburst. Two more real enterable buildings filled the gaps: **The Customs House** (harbor
    trade/bribery flavor) and **The Anchor & Forge** (blacksmith), plus two more non-interactive
    landmarks, **The Baker's Oven** and **The Ropewalk**, for density without more authoring cost
  - 6 new Patron quests came free with the 6 new buildings across both passes (fort, chapel,
    warehouse, West Point Shack, Customs House, Anchor & Forge), pushing Tortuga Cove's own quest
    count higher toward the 150+ target without inventing new mechanics
  - **A real concentrated town, not scattered buildings, 2026-07-31**: matched the composition of
    a real fantasy-map reference — one dense town, a small satellite settlement, a few scattered
    outliers — instead of markers spread evenly over the whole island. Added `src/data/houses.ts`:
    79 purely-visual row houses (procedurally generated along a 5-avenue × 5-cross-street grid,
    every position validated on-land against Tortuga's coastline polygon and kept clear of every
    other marker before being written down) filling the blocks between the new grid streets with
    actual rows of houses lining both sides, the way a real street looks. Houses are intentionally
    the lightest-weight content tier yet — no interior, no interaction, not even a proximity check
    in the movement loop, purely a footprint on the map, like background buildings in GTA. 4 more
    ambient street NPCs (residents, a fishwife, a child, an old fisherman) patrol through the new
    residential blocks, for 7 wandering NPCs total. West Point Shack (far west) now reads clearly
    as the "small settlement," and Fort de Rocher / Harbor Pier / La Ringot Fields as the "few
    buildings scattered around the island," while everything from the harbor road south is one
    unbroken, dense downtown — Tortuga Cove is now well past 60 total structures
  - **Placeholder art note**: everything above renders with the same emoji + colored-shape
    primitives used everywhere else in the game (no real pixel art asset pipeline exists yet — see
    `TileLayer.tsx`, built but unused, waiting on a real licensed tileset). The specific places a
    real art pass would matter most, in rough priority order: the coastline/terrain texture itself
    (currently a flat green polygon), Fort de Rocher (should read as a fortified cliff, not a 🏰
    emoji), the harbor/pier (ship silhouettes, actual dock structure), and generic
    building/street/foliage texture (palm trees, cobblestone, wood-and-thatch facades) to replace
    the plain colored boxes
  - Only Tortuga Cove has been fleshed out this way so far — the other 6 islands still have their
    original 1-3 buildings with no street layout, landmarks, or street life; repeating this whole
    pass island-by-island is the natural next step now that the blueprint is proven
- ✅ **New Providence: the blueprint repeated for the first time, 2026-08-02**. Before this it had 2
  buildings (The Cracked Hull, The Distillery), Iron Jenny's fort, and one standalone side quest —
  zero houses, zero streets, zero street life. Verification-first, same as every geometry change this
  project has made: wrote a throwaway script that copied the island's real polygon and generated
  candidate house positions along a residential grid, filtering to *inside the actual coastline* and
  clear of every existing marker, before writing a single line into `houses.ts` — 61 houses landed
  clean this way (one candidate, dropped for being 20 units from the rum resource node, is the only
  one the script's marker list initially missed — see the bug note below).
  - **Republic Square** (new landmark, hub) reflects Nassau's real character as a run-by-consensus
    "pirate republic" rather than a governed town — captains voting on plunder shares instead of a
    town hall — radiating streets to every building, same hub-and-spoke pattern as Basse-Terre Square
  - **The Careening Yard** (new enterable building, `smithy` type) is grounded in the real reason
    Nassau mattered to pirates at all: its harbor was too shallow for Royal Navy warships but ideal
    for beaching and careening (tipping a ship on its side to scrape the hull) — the pirate
    republic's only real shipyard. Comes with a recruit (Shipwright Odalys) and, once patron content
    is authored for it, a Patron quest slot
  - **8 new street NPCs** (`src/data/streetNpcs.ts`) written distinct from Tortuga's archetypes on
    purpose — no patrolling guard, because Nassau explicitly has "no crown, no law": a dice gambler,
    a lookout watching for Navy sails, a furtive smuggler, a one-legged fiddler, and others leaning
    into the lawless-republic tone rather than reusing Tortuga's cast with new names
  - **Bug caught during in-browser verification, not left for the user to find**: the Careening
    Yard's first placement (`{x:-150,y:-100}`) landed 10 units from the pre-existing rum resource
    node at `{x:-140,y:-100}` — missed during design because the generation script's marker list
    only included buildings/fort/quests, not resource nodes. A screenshot showed the resource node's
    marker and the new building's marker rendering on top of each other before this ever reached the
    user. Fixed by relocating the building to `{x:-190,y:-30}` (a real clear coastal spot, verified
    against the polygon and every other marker) and dropping the one house that had been placed too
    close to the resource node as a result. A final comprehensive script re-checked all 61 houses
    against all 7 non-house markers (buildings, fort, landmark, quest, resource node) pairwise, and
    all markers against each other, before shipping: zero remaining violations
  - **Deliberately not done in this pass**: Patron quests and a bespoke floor plan for the two new
    buildings (Careening Yard, and updating The Cracked Hull's tavern) — both buildings still use the
    generic fallback interior. That's real content-authoring work (2-4 patrons each, per the roadmap)
    better done as its own dedicated pass rather than rushed alongside a world-geometry change
- ✅ Each building = one named NPC, one line of dialogue, one one-time gold-priced hire
- 🔄 Needs the Pokémon-Center equivalent: a **Shipwright/Surgeon building** on every island (or at
  least the safe ones) for full-crew healing without needing to sail back to Tortuga Cove
  specifically. Right now Tortuga Cove is the *only* heal point, which is more restrictive than
  Pokémon (every town has a Center)
- ✅ Poké Mart equivalent: General Store items sold from shop-type buildings (Harbor Trading Post,
  Smuggler's Den) — Rum Ration (heal), Grapeshot Charge (boosts next attack), Forged Papers
  (guarantees next recruit attempt). Usable mid-battle via an Item menu (consumes a turn, like
  Pokémon's Bag) and Rum Ration is also usable directly from the Crew screen outside of battle
- ⬜ More item variety: Bandages (cure status, once status conditions exist), Spyglass (reveals a
  zone's encounter table before you sail in), Ship upgrades (see gating above), Treasure Maps
  (point toward a resource/quest node)
- ⬜ Multiple buildings per island once islands get bigger — currently 1-2 per island, Pokémon
  towns often have 3-5 functional buildings
- ⬜ A Fan-Club/Hall-of-Fame equivalent: a building that reacts to your reputation/quest progress
  with flavor dialogue and rewards, giving repeat reasons to revisit early islands

## Battle System
- ✅ Turn-based, menu-driven (Attack moves / Item / Recruit / Flee)
- ✅ Type effectiveness triangle (blade/musket/cannon) plus two off-triangle types
  (brawler/curse), mirroring Pokémon's type chart in miniature
- ✅ HP bars, damage formula with variance, effectiveness messages ("It worked wonders!"/"It
  barely helped." — direct reskin of Pokémon's own text)
- ✅ Leveling via XP, stat growth by level formula
- ✅ Item option in battle (Pokémon's Bag menu), consumes a turn like Pokémon's own items
- ⬜ No status conditions yet (Poison/Burn/Paralysis equivalent) — pirate-flavored options:
  Bleeding (poison-like DoT), Drunk (paralysis-like, may skip turn), Cursed (confusion-like)
- ⬜ No critical hits / stat stages yet
- ⬜ No PP-equivalent (move-use limits) — currently moves are unlimited use; consider a "Grit" or
  "Stamina" resource if we want that Pokémon-like resource management

## Recruiting & Collecting (Catching equivalent)
- ✅ Two parallel recruit paths (more than Pokémon's single catch mechanic):
  - Battle-then-recruit on wild encounters, HP-based success chance (direct catch-mechanic analog)
  - Gold-priced one-time hire from named building NPCs (no Pokémon equivalent — this is our own
    addition, good differentiator)
- ✅ Crew Log (Pokédex equivalent): tracks every template as unseen (❓), seen-but-not-recruited
  (name/specialty/rarity, no flavor text), or recruited (full card + flavor text), with a
  completion counter. Seen on wild encounter start or viewing a building's NPC offer; accessible
  from a button on the Crew roster screen
- ✅ A "Master Ball" equivalent: Forged Papers, a General Store item that guarantees the next
  recruit attempt succeeds
- 🔄 No trading between players — Pokémon's trade-evolution mechanic has no equivalent yet (see
  Evolution below for how this could still work single-player)

## Crew Management (Party equivalent)
- ✅ Roster list, active-member selection, HP/level/XP display
- ✅ **6-crew "on-ship" cap + Crew Quarters (PC-box equivalent)**: recruiting past the cap
  (wild-encounter recruit or building hire) auto-benches the new hire to Crew Quarters instead of
  failing outright; Crew screen shows Ship's Crew and Crew Quarters as separate sections with
  **Send to Quarters** / **Bring Aboard** buttons (always at least 1 onboard — the button is
  disabled rather than letting the ship empty out). Quarters members aren't present during battles:
  the mid-battle crew-switch prompt only offers onboard crew, and if permadeath wipes the entire
  onboard party while Quarters has spares, the next voyage auto-boards one so you're never stuck
  with zero deployable crew
- ⬜ Nicknaming crew members (Pokémon lets you rename any caught Pokémon)
- ⬜ Per-crew-member move/skill loadout management screen (currently moves are fixed per template)

## Progression & Story Structure (Gyms/Badges + Elite Four equivalent)
- ✅ **6 named Pirate Lords** as Gym Leader equivalents — 5 sequential ones, one per non-home
  island (Redbeard Sully → Iron Jenny → Captain Bellows → Marietta Graves → Ezra Vane), each a
  unique boss fort you walk into on the map, gated **sequentially** — you can't challenge Lord N
  until Lord N-1 is defeated — plus a 6th, true-finale Lord (Blackbeard, see the Pirate Council
  bullet below) gated on quest completion instead of sequence
- ⬜ Themed island "puzzle" before each boss fight (reef maze, smuggler's lock, bar brawl gauntlet)
  not built — forts are currently a direct walk-in-and-fight, no puzzle layer yet
- ✅ Defeating a Lord grants a **Letter of Marque** (Badge equivalent): a permanent +3%/badge
  Atk/Def boost applied to your active crew member in every battle, big XP/gold rewards (badge
  fights use the same 'legendary' rarity multiplier as top-tier wild encounters), and unlocks the
  next Lord. Tracked in a **Quest Log** screen (accessible from the Menu hub) showing all 6 with
  Locked/Available/Defeated status
- ✅ Lord fights disable Flee (you commit to the duel, matching Pokémon's own no-running-from-
  trainer-battles rule) and Recruit (Lords aren't recruitable); losing gives the normal
  faint-and-heal-at-Tortuga outcome, **not** permadeath — that stays reserved for rival/navy
  ambushes since a sanctioned duel isn't the same as being caught unawares
- ⬜ Raising the level at which recruited crew "obey" you (direct obey-mechanic reskin) — not
  built, and not very meaningful yet without a level-cap concept tied to badge count
- ✅ Traversal gate: **Reinforced Hull** (see Economy below) hard-gates Île Sainte-Marie until
  bought at Roatán — the ship-upgrade traversal gate this bullet was waiting on
- ⬜ Reputation-gated port (beyond the one hull-gated island) — not built
- ✅ **Endgame: the Pirate Council (Elite Four equivalent) + Blackbeard (Champion equivalent)**.
  A new side quest, **The Pirate Council** at Ocracoke Inlet, reuses the existing escort/wave-quest
  mechanic (already proven for multi-stage, no-heal-between-waves content) to rematch all 5
  previously-defeated Lords back-to-back at boosted levels — gated behind having beaten all 5, via
  a new optional `requiresAllLordsDefeated` field on the escort quest type. Completing it unlocks
  **Blackbeard** himself, a new 6th `PirateLord` entry (order 6, Lv.25, the highest stats in the
  game) gated by a new optional `requiresQuestId` field on `PirateLord` (checked in `isLordUnlocked`
  instead of the sequential order chain) rather than a new gating system. Defeating him is the true
  ending: the Quest Log's "all defeated" banner updates for the real finale once `defeatedLordIds`
  covers all 6. No credits screen or post-game unlocks yet — out of scope for this pass
- ⬜ Antagonist faction with escalating set-piece confrontations across the story (Team Rocket
  equivalent) — **the Navy is already built for this mechanically** (ambushes scale with heat) and
  just needs scripted story beats layered on top instead of only random encounters
- ⬜ Recurring named rival captain, always one step ahead, type-advantaged crew, battles you at
  fixed story beats

## Evolution equivalent (Promotions)
- ✅ Level-based promotion lines built from the existing specialty/rarity tiers: **blade**
  (Deckhand Swordsman → Boarding Captain at Lv.10 → Duelist First Mate at Lv.20), **cannon**
  (Powder Monkey → Gun Deck Veteran at Lv.10 → Master Gunner at Lv.20), **musket** (Dockside
  Sharpshooter → Musketeer Marksman at Lv.10), **brawler** (Cabin Hand → Tavern Brawler at
  Lv.10), **curse** (Cursed Bosun → Kraken-Bound Captain at Lv.30). Mixed 2/3-stage lines,
  matching real Pokémon evolution families
- ✅ Promoting swaps templateId + nickname, carries HP forward by the max-HP delta (not reset,
  same continuity Pokémon uses on evolution), and picks up the new template's moves and stats
  automatically since both are looked up live from the template rather than stored per-instance
- ✅ Promoting into a new species marks it seen + recruited in the Crew Log, same as catching it
  directly
- ✅ A Pokémon-style log line on the battle screen ("X is promoted to Y!") when it happens
- ✅ **Stone equivalent**: Captain's Draught, a craft-only consumable (5 Rum, at either shop) that
  force-promotes a crew member to their next stage regardless of level, from a new "Promote" button
  on their Crew screen card. Level is left untouched — only templateId/nickname swap and HP scales
  by the max-HP delta, same as the normal level-based path, matching how Pokémon's own stone
  evolutions don't touch level either
- ⬜ Trade-evolution equivalent (no multiplayer trading, so reskin it): certain elite crew only
  promote after you **duel and beat a specific named rival captain while that crew member is
  active** — mirrors the "prove it to someone else" flavor of trade evolution without needing a
  second cartridge. Not built

## Permadeath & Threat System (no Pokémon equivalent — our differentiator)
- ✅ Heat/wanted meter, rival ambushes, navy ambushes once heat crosses a threshold
- ✅ Permanent crew loss on ambush defeat (pressed into naval service, or taken prisoner by
  rivals — Moderate/Teen framing, not explicit execution), with gold seizure + heat reset on
  capture
- ✅ Roster-wipe rescue (free cabin hand) so players are never permanently soft-locked
- ✅ This is the system carrying the "GTA" chaos-and-consequence feeling — now backed by real
  choices with stakes: ship plundering and shop theft (see Economy below) both spend heat
  deliberately for gold/resources, rather than heat only ever being something to avoid

## Economy (Poké Mart equivalent)
- ✅ Gold from battles and quests
- ✅ Gold sinks: building hires and General Store items
- ✅ **Resource gathering v1 (core loop)**: Fish, Timber, Rum, and Gunpowder are gatherable
  materials distinct from gold, each with a real-location home — Fish at Tortuga, Timber at
  Roatán (real careening yard), Rum at New Providence (real rum-running history), Gunpowder at
  Port Royal (real naval magazine). A resource node is a map marker like a building, but gathers
  **passively while walking through** rather than stopping to open a screen — a small random
  yield plus a real-time cooldown (first wall-clock-based mechanic in the game; ties naturally to
  the existing time-saver IAP philosophy for a future "instant refresh" purchase). Sold at the two
  existing shop buildings (Harbor Trading Post, Smuggler's Den) via a new Sell Resources section;
  held resources shown in a new Cargo Hold section on the Crew screen. This also closes the
  previously-open "sell loot back to shops" gap
- ✅ **Crafting**: a Craft section at the same two shops turns resources into items instead of
  gold — 2 Rum → Rum Ration, 3 Gunpowder → Grapeshot Charge, and 5 Rum → Captain's Draught (see
  Evolution equivalent above). A second resource sink alongside selling, using the existing Item
  system rather than a new one
- ✅ **The crime layer**: two new ways to make gold "the hard way," both feeding heat directly —
  - **Ship plundering**: a new `merchant` encounter faction, rolled only over open sea alongside
    the existing wild/rival/navy checks. Four weak, non-combatant merchant templates (Fishing
    Trawler, Timber Galleon, Rum Runner, Powder Hulk), each tied to one resource. Victory pays gold
    **and** cargo, but adds +10 heat — visibly more than a normal wild fight, since robbing
    civilian shipping is a step past fighting other criminals. No recruiting the crew, no
    permadeath on a loss, flee always available
  - **Shop theft**: four new resource-themed buildings (Fishmonger's Stall/Tortuga, Distillery/New
    Providence, Timber Yard/Roatán, Armoury/Port Royal) where you can buy the resource honestly
    (gold, safe) or steal it (free, cooldown-gated like a gather node). Stealing always succeeds at
    getting the goods; a random "caught" check only decides whether the heat spike is small (clean
    grab) or large (caught red-handed) — never an outright failure. `Building.recruit` became
    optional to support shops with no NPC to hire
- ✅ **Ship Upgrades**: a gold-and-resource sink at Roatán's Smuggler's Den (already the real
  careening/shipyard island) that finally gives Timber, Rum, and Gunpowder the "feeds crafting or
  ship upgrades" purpose promised early on, and gives Fish something beyond selling (Ship's
  Biscuit, a cheap weaker heal craftable from 3 Fish). Three one-time purchases, each permanent
  once bought:
  - **Reinforced Hull** (150g + 15 Timber) — a **hard gate**: Île Sainte-Marie's waters are
    impassable without it, matching the design doc's own "ship upgrades as soft gates (Sea
    equivalent of HMs)" framing — Pokémon HMs are genuine hard blocks, so this is the literal
    version rather than a discount on an encounter roll
  - **Swift Rigging** (120g + 12 Rum) — halves the Navy ambush chance everywhere, permanently
  - **Diving Bell** (100g + 10 Gunpowder) — unlocks a salvage site among Port Royal's sunken
    ruins: a one-off passive gold windfall (25-50g) on a cooldown, gathered the same
    walk-through-it way as a resource node, but paying out gold instead of a resource since it's a
    treasure dive, not a materials gather
- ⬜ **Economy polish (not yet built)**: per-island price variance for real trade routes,
  resource-cost recruits, resource-based fetch quests

## Quests & Main Story
- ✅ Main questline spine: the 5 sequential Pirate Lord fights above now give the world a goal
  structure the way Pokémon's Gym order does. This is the "direction" the game was missing
- ✅ **v1 side quests**: one bounty quest (Cull the Cattle Rustler, Cow Island — confront and
  defeat a named bounty target in battle, faction `bounty`: no permadeath, no recruiting the
  target, flee allowed), one fetch quest (A Toast for the Fallen, New Providence — deliver a
  General Store item), and one specialty-gated quest (The Locked Vault, Roatán — needs a
  Cannon-type crew member **onboard the ship**, not just anywhere in the roster, to fulfill).
  Quest givers are walk-up map markers (📜, same proximity-trigger pattern as buildings/forts)
  with a new SideQuest screen for the accept/progress/complete dialogue flow. Proves the
  "specific skills gate specific quests" pillar end-to-end
- ✅ **Escort quest** (Escort the Merchant Convoy, Port Royal): a back-to-back wave gauntlet
  (2 waves, no healing between) — confront-per-wave via the same `bounty` encounter faction,
  progress tracked in `questWaveProgress`, only completes (and pays out) after the final wave;
  losing a wave doesn't reset progress, just retries that wave
- ✅ **Repeatable heat-bounty quest** (The Bounty Board, Tortuga Cove): combines two brainstormed
  concepts — the recurring board quest style and the bounty-with-heat-payoff idea. Confronting
  picks a random rival/navy target; each win pays gold **and** reduces heat, and the quest never
  enters `completedQuestIds` — it stays open indefinitely, tracked instead via a
  `questTurnInCounts` counter, so heat management becomes an active, repeatable choice rather than
  only fleeing and waiting
- ⬜ More side quests per island (resource-gathering, and the rest of the brainstormed
  concepts/styles above) — the pattern (data file + store accept/complete tracking + map
  marker + SideQuest screen) is now proven across one-shot, multi-stage, and repeatable quests
- ✅ Quest log / journal UI (the new Quests screen) now lists both Pirate Lord progress and side
  quests with Available/Accepted/Completed status (heat-bounty shows "Open · N turned in" instead,
  since it never reaches a terminal Completed state)
- ✅ **Prisoner rescue**: permadeath finally has a narrative payoff instead of just a stat loss.
  `removeCrewMember` now takes an optional `capturedBy: 'navy' | 'rival'` — when a navy/rival
  ambush claims a crew member, their identity (template, nickname, level) is persisted to a new
  `capturedCrew` list rather than just being deleted. **The Locked Ward**, a new fixed map marker
  at Tortuga (dims when no one's held, lights up like an available quest marker when someone is),
  opens a dynamic screen listing everyone currently captured with an "Attempt Rescue" button per
  person — no per-incident map markers needed since the list is data-driven. Rescuing fights a
  jailer (reuses `navy_marine`/`rival_deckhand` from the existing threat templates, scaled to at
  least the captured member's own level) via a new `rescue` encounter faction: victory calls
  `rescueCrewMember`, which restores them at 50% HP (boarding the ship if there's room, otherwise
  Crew Quarters) and adds a small heat bump (+8, on par with other provocative crime-layer
  actions); losing costs nothing further — no recruit option (matches every non-`wild` faction),
  flee always available. The Quest Log also surfaces a read-only Captured Crew section pointing
  players toward Tortuga, so the mechanic doesn't rely on stumbling onto the map marker

### Side Quest Concepts (brainstormed)
- ⬜ **Smuggling runs** — timed delivery of contraband cargo; a navy patrol encounter en route adds
  heat on top of losing the goods, turning the heat system into an active quest risk
- ⬜ **Bounty board with heat payoff** — turn in defeated rival/navy targets for gold *and* a heat
  reduction, making bounty hunting a deliberate way to cool off instead of only fleeing and waiting
- ⬜ **Buried treasure maps** — already stubbed as a General Store item; sell as a map-marker + dig
  quest rather than an instant reward, giving a reason to sail somewhere new
- ⬜ **Specialty-gated hidden areas** — HM-reskin: a sealed cave needs a Cannon-type to blast open,
  a locked door needs a Blade-type to force — same "recruit to progress" idea, applied to
  exploration instead of just quest-gating
- ⬜ **Crew loyalty questline** — a personal backstory quest tied to one specific recruited crew
  member (old captain, a debt, a grudge); completing it grants a small permanent bonus. Reuses the
  "prove it to a rival captain" trade-evolution idea as its own side content
- ⬜ **Weather-gated resource nodes** — once the (currently unbuilt) weather system exists: rum/fish
  easier to gather in calm weather, storms make gathering riskier but higher-yield — a "later" hook

### Mini-Quest Styles (mechanical archetypes, not tied to one concept above)
- ⬜ **Escort/protect** — guard an NPC ship through a zone; encounter rolls still fire, but you're
  defending them, failing if they take too much damage before making port
- ⬜ **Timed race** — a regatta or delivery deadline between two points; pure movement/navigation
  test, no combat at all
- ⬜ **Clear-the-area** — defeat N enemies in a zone rather than one named target; cheap filler
  content generated from existing threat templates
- ⬜ **Defend-the-port** — survive a wave of incoming navy/rival attackers at Tortuga Cove itself,
  inverting the usual "you're the aggressor" framing
- ⬜ **Infiltration/heist** — sneak into a manor/fort and get out without triggering a fight, rather
  than winning one; a natural setup for GTA-style character switching (see below)
- ⬜ **Branching/moral choice** — help the rival crew or turn them in to the Navy; no clean right
  answer, each path changes heat/reputation differently rather than just paying out gold
- ⬜ **Rival race** — a named rival crew is chasing the same prize; first to reach it wins, adding
  urgency without adding a new mechanic
- ⬜ **Investigation** — talk to a string of NPCs to piece together a clue before acting, rather
  than fighting or gathering; dialogue-only, detective-lite
- ⬜ **Recurring board quest** — a repeatable, low-narrative bounty/gather quest that resets; this
  is the side-content-for-engagement gap already flagged under Scope & Pacing

### Scaling to 150+ Mini Quests: the Patrons System (planned 2026-07-31, foundation built 2026-07-31)
- ✅ **Foundation built and proven with 2 example patrons — bulk content authoring is still the
  remaining work, in future batches.** Revises the side-quest target up from 15-20/25-30 to
  **150+**, via a mechanism that keeps the per-quest cost low instead of scaling authoring effort
  linearly:
  - **The key unlock: quests don't need their own map marker.** Every side quest so far has been a
    standalone 📜 marker with its own island offset — that's what made "120 quests" look
    map-cluttered and expensive. Instead, **buildings can host multiple named "patrons"** — walk-in
    NPCs you talk to once inside, each offering their own self-contained one-off quest, all sharing
    the single map marker/interior the building already has. A tavern doesn't need 5 quest markers
    on the map for 5 quests — it needs 5 patrons sitting inside it
  - **A reusable patron archetype roster** to draw from per building (mix and match, not
    one-per-building): the Barkeep, a Local, a Drunk (comic/unreliable framing), a Rival Pirate
    (morally-grey exchange), a Wandering Sea Dog, a Constable/Lawman (bounty-flavored — already
    used for Cull the Cattle Rustler and The Bounty Board), a Smuggler (crime-flavored), a Grieving
    Widow/Local (already used for A Toast for the Fallen), a Fortune Teller/Mystic (curse-flavored,
    matches the folklore layer), an Old Captain (lore/specialty-gated), a Ship's Cook
    (resource-flavored), a Navy Deserter (heat-flavored, risky), a Cabin Boy (low-stakes comic). All
    reuse the existing quest types (`bounty`/`fetch`/`specialty_gate`/`escort`/`heat_bounty`) — no
    new mechanics required to hit volume
  - **Rough math for why 150+ is realistic, not aspirational**: ~12 existing buildings × 3-5
    patrons each ≈ 40-60, plus the already-flagged gap of adding more buildings per island (Pokémon
    towns run 3-5 per town; most islands here only have 1-3 today) — 2-3 more buildings per island
    × their own patrons adds another 60-100+ over time. Split **some island-specific** (a tavern
    needing rum at New Providence, matching its real rum-running history — same flavor-matching
    approach already used for every building/lord/resource) **and some generic/templated** (a
    reused fetch/gather skeleton with light variation, no less legitimate than Pokémon's own
    identical-mechanic-different-NPC gyms)
  - ✅ **Engineering foundation, built**: `SideQuestBase` gained an optional `hostedByBuildingId`
    field and made `offset` optional — a quest with `hostedByBuildingId` set has no map marker of
    its own. `BuildingScreen` gained a **Patrons** section (same generic-section pattern already
    used for Craft/Sell/Steal/Ship Upgrades) that lists every quest hosted by that building and
    opens the existing, unmodified `SideQuestScreen` flow per patron on tap. `MapScreen`'s quest
    marker rendering and walk-up proximity trigger both filter to `quest.offset` only, so
    patron-hosted quests never appear on the map or at anywhere near it — reached purely by walking
    into the building. No new quest mechanics were needed; `fetch` and `bounty` both work
    unmodified through this new hosting path
  - ✅ **Proven with 2 examples at Tortuga's tavern (The Salty Parrot)**: Wobbly Pete (a Drunk
    patron, `fetch` type — wants a Rum Ration) and Barmaid Ross (a Local patron, `bounty` type —
    wants a new common-rarity `tavern_troublemaker` bounty target dealt with). Both tested
    end-to-end in-browser: walking into the tavern shows both patrons with no extra map markers
    anywhere, talking to either opens the normal quest accept/confront/complete flow, and both
    complete correctly and show up in the Quest Log
  - ⬜ **Remaining work is content authoring, not engineering**: apply this same pattern to the
    other ~11 existing buildings (and new buildings as islands grow more of them per the
    already-flagged town-density gap), batching quests over future sessions toward the 150+ target.
    Explicitly **not** claiming 150 fully bespoke unique narratives — some will be short, familiar,
    formulaic (that's fine, matches how mini-quests actually scale in bigger games); the goal is
    volume of *fun, flavorful, non-duplicate* content without 150x-ing the writing effort per quest

## GTA-style Character Switching (open gap)
- ⬜ Distinct from crew battle-switching (which already exists) — this means directly controlling
  a *different named character* on the overworld for certain missions (e.g., play as a captured
  crew member to break them out, or a dockside spy character for a stealth quest), then switching
  back to the captain
- ⬜ Needs its own save-state per character (position, maybe separate inventory) and a
  switch-trigger UI

## Menus & UI
- ✅ Map HUD (gold, crew count, heat meter), Crew roster screen, Battle screen, Building interior
  screen
- ✅ **Start-menu equivalent**: a new Menu screen (☰ Menu button on the Map header, replacing the
  separate Quests/Crew buttons that were starting to crowd the header) consolidating Crew Roster,
  Crew Log (Pokédex), and Quest Log into one hub with live counters (crew count, recruited X/Y,
  Pirate Lords defeated X/Y). Inventory/Bag, Save, and Options aren't separate screens yet — Bag
  is folded into the Crew screen (Cargo Hold) and Item usage; Save/Options don't exist as concepts
  yet
- ✅ **HUD audit against a ChatGPT-mocked art-style reference (2026-08-01)**: the reference nailed
  the pixel-art chrome aesthetic but its actual HUD content (player/companion HP bars, Achievements,
  a "Pirate Pass" button, global always-on Shop/Craft buttons, a minimap) was a generic RPG template,
  not derived from our systems — several pieces directly conflict with decided mechanics (no player
  HP system exists; Cheeky is deliberately non-mechanical; "Pirate Pass" implies a season-pass
  monetization scheme never decided; global Shop/Craft buttons undermine the walk-up-only
  interaction model that's a core design pillar and an onboarding tip). Adopted only what's real:
  a wood/brass pixel-frame reskin of the existing Map header (`#2b1c12` wood + `#c9a227` brass
  border, cosmetic only, zero mechanic changes) and one genuine functional gap it surfaced — no
  on-map indicator of the current objective, the main quest was buried in Menu → Quest Log
- ✅ **Persistent on-map quest tracker**: a tappable strip under the heat bar showing the live main
  quest objective, derived from real store state (`defeatedLordIds`, `completedQuestIds`) via the
  same `isLordUnlocked` helper the Quest Log itself uses — not a separate/hardcoded copy. Handles
  all state transitions correctly: next unlocked lord ("Defeat Iron Jenny at New Providence"), the
  Council gate before Blackbeard is challengeable ("Complete 'The Pirate Council' at Ocracoke
  Inlet"), and the true endgame banner once all six are defeated. Verified via an isolated `tsx`
  script exercising the real exported functions across all six progression states (fresh save →
  each sequential lord → Council-gated → post-Council → all defeated), plus in-browser for the
  fresh-save case. Tapping it navigates straight to the Quest Log
- ✅ **Player identity on the Map HUD itself**: a small captain tag (👦 Captain Scally) above the
  zone name in the header — previously "Captain Scally" only appeared on the Menu screen, not on
  the screen the player actually spends most of their time on
- ⬜ Separate Bag/inventory screen — still folded into the Crew screen (Cargo Hold), a real but
  lower-priority gap from the same audit
- ⬜ Save/Options screen — autosave via the persisted store exists, but no manual save indicator or
  settings screen (volume, reset save is dev-only)
- ⬜ Party/move-management screen (nicknames, move loadouts)

## Onboarding & Tutorial
- ✅ **First-launch overlay**: a lightweight, skippable, 3-step overlay (Drag to Sail / Walk Right
  In / Mind Your Heat) shown once on a fresh save, gated by a persisted `hasSeenOnboarding` flag.
  Skippable at any step via a Skip button, or steps through to a "Got it, let's sail!" CTA on the
  last step — either path marks it seen permanently. Resetting the save (Debug screen) also resets
  this flag, so it can be re-tested without a fresh install
- ⬜ No day/night or weather-specific onboarding beats yet (not needed until those systems exist)

## Testing & QA
- ✅ **Dev debug panel**: a `__DEV__`-gated Debug screen (🛠 button on the Map, stripped from
  production builds) for fast manual QA without grinding — jump any crew member to a level
  (cascades promotions correctly), add gold, set heat, force a wild/rival/navy encounter, jump
  straight to any Pirate Lord fort, heal the whole crew, or wipe the save back to a fresh start
- ✅ **Convention**: features get verified in-browser (Expo web build, Playwright + Chromium)
  before being called done, not just type-checked. Run the dev server with
  `npx expo start --web --port 8081` — **not** `CI=1`, which disables Metro's file-watcher/cache
  invalidation and serves stale bundles
- ✅ For logic too RNG-fragile to reliably trigger through the UI (e.g. grinding a real crew member
  to a specific level), an isolated script run via `npx tsx` that imports and exercises the real
  exported functions directly is an acceptable substitute — used once for verifying promotions
- ⬜ No automated test suite (unit or e2e) yet — everything above is manual, ad hoc, and doesn't
  run in CI. Worth adding once the core loop stabilizes enough that regressions become a real risk
  rather than a hypothetical one

## Tone & Content Rating — DECIDED: Moderate / Teen
- ✅ Target Teen/PEGI 12. Permadeath framing is now: navy captures **press crew into naval
  service**, rivals **take crew prisoner** — permanent and stakes-carrying, but no execution
  imagery or gore
- ✅ **Brand decision (2026-07-31)**: the cheerful, all-ages "Scallywags" brand/mascot style guide
  is packaging, not a tone change. Captain Scally became the named protagonist (see Premise &
  Goal), but permadeath, heat/crime, and bounty violence stay exactly as designed — the brand
  sits on top of the existing Moderate/Teen mechanics, it doesn't soften them

## Art Direction — DECIDED: Pixel art (16/32-bit RPG style)
- ✅ Target look: SNES-era JRPG pixel art, not strict 2-bit Game Boy — richer color, still readable
  at small mobile sizes, animates cheaply via spritesheets
- ⬜ Everything is currently emoji-as-sprite placeholders. Needs a real asset pipeline (character
  sprites, island/building tiles, battle backdrops, UI chrome) before this can ship or brand
  properly. Worth tackling incrementally per-screen rather than as one giant art pass

## Monetization — DECIDED: F2P + cosmetic/convenience IAP
- ✅ Free download. Sell ship/crew cosmetics, time-savers (e.g. instant heal, faster travel), extra
  crew-quarters slots. No pay-to-win, no randomized/gacha pulls, no "revive a permadeath'd crew
  member" purchase — that pattern is the one that erodes trust and draws regulatory scrutiny
  precisely because it sells undoing a loss after the fact
- ⬜ If we ever want a proactive risk-mitigation purchase, the fair version is something bought
  *before* a loss happens (e.g. a "Letter of Pardon" held in inventory that auto-triggers instead
  of a permadeath once), not an after-the-fact revive
- ⬜ Optional rewarded ads for bonus gold/items, opt-in only, never forced between screens
- ⬜ Needs an IAP SDK integrated (Expo's in-app-purchases / RevenueCat or similar) before shipping

## Scope & Pacing
- ✅ Target ~6-10 hours for the **mandatory** main-quest spine at launch (leaner than Pokémon's
  ~20-26 hour campaign), designed around short 5-15 minute mobile sessions rather than long
  sit-downs. This was a deliberate call, revisited 2026-07-31 (see below) and reaffirmed rather
  than lengthened
- ✅ Difficulty curve: easy/forgiving early (matches Pokémon's own approachability plus our rescue
  mechanic), real tension emerging mid-to-late game as heat rises — that's the differentiator,
  not overall length or raw combat difficulty
- ✅ **Mandatory vs. optional content, decided 2026-07-31**: the mandatory path is exactly the
  5 sequential Pirate Lords → the Pirate Council → Blackbeard, and nothing else. Every side quest,
  resource system, crafting recipe, ship upgrade, and crime-layer mechanic is optional. This
  mirrors classic Game Boy Pokémon's own split (gyms mandatory, nearly everything else optional —
  Gen 1 itself only has ~5-8 loose side objectives in the whole game, so a short mandatory spine is
  actually the *closer* match to the stated Pokémon benchmark, not a deviation from it)
- ✅ **Total playtime lever, decided 2026-07-31**: considered lengthening the main quest itself
  GTA5-style (its main story alone runs ~30 hours, ~69 missions, before counting ~15 Strangers-and-
  Freaks side questlines and dozens of non-quest sandbox systems that pad the rest of its ~50-80
  hour total). Decided against — GTA5 is a long-session console epic; this is F2P mobile with
  session-frequency-over-months as the real retention lever, not one long linear campaign, and that
  was already the stated design intent above. **The lever for more total playtime is optional
  content, not a longer mandatory spine**: more side quests, and leaning harder into the
  repeatable/systemic loops already built (resource gathering, the crime layer, the Bounty Board)
  plus future live-ops/dailies. **Target revised again same day to 150+ total mini quests** via the
  Patrons system (see Quests & Main Story below) — buildings hosting multiple walk-in quest-givers
  sharing one map marker, rather than one quest per marker. This keeps per-quest authoring cost low
  enough that 150+ is a realistic batch-built backlog, not a scope blowout, while the mandatory
  path stays untouched
- ⬜ Side content/live-ops (events, dailies) intended to extend engagement beyond the main quest
  once there's a content cadence to support it — the primary vehicle for the playtime lever above

---

## Suggested build order (biggest gaps first, matching what makes it "feel like Pokémon")

### Done
1. ✅ **General Store + Item system** — Rum Ration, Grapeshot Charge, Forged Papers, buyable
   from shop buildings, usable in battle and (heal) from the Crew screen
2. ✅ **Main quest spine + Pirate Lords (Gym/Badge equivalent)** — 5 sequential named boss
   forts, Letters of Marque with a permanent stat boost, Quest Log screen
3. ✅ **Crew Log (Pokédex equivalent)** — unseen/seen/recruited states, completion counter
4. ✅ **Promotions (evolution equivalent)** — level-based promotion lines across all 5
   specialties, HP/moves/stats carry over automatically, Crew Log + battle log integration
5. ✅ **Dev debug/QA panel** — `__DEV__`-gated Debug screen reachable from a 🛠 button on the
   Map, with level-jump, gold, heat, force-encounter (wild/rival/navy), jump-to-Pirate-Lord-fort,
   and reset-save shortcuts for fast manual testing without grinding
6. ✅ **Mid-battle crew switch on faint** — fainting a crew member with a healthy bench member
   available now prompts a switch instead of always ending the battle (permadeath still applies for
   navy/rival ambushes regardless — only the *battle outcome* changes, not the removal); battle only
   ends outright when no healthy crew member remains
7. ✅ **Party cap + Crew Quarters (PC-box equivalent)** — 6-crew onboard cap, overflow auto-benched
   to Crew Quarters, Send to Quarters / Bring Aboard in the Crew screen, mid-battle switch limited
   to onboard crew, auto-refill from Quarters if the whole onboard party is wiped by permadeath
8. ✅ **v1 side quests** — one bounty, one fetch, one specialty-gated quest, proving the
   data-file + store-tracking + map-marker + dedicated-screen pattern end-to-end
9. ✅ **Escort + repeatable heat-bounty quests** — a 2-wave escort gauntlet and a repeatable
   bounty-board quest with heat payoff, proving the pattern also handles multi-stage and
   never-terminally-completed quests, not just one-shot ones
10. ✅ **Resource gathering v1** — Fish/Timber/Rum/Gunpowder gatherable from real-location map
    nodes (passive, cooldown-gated) and sellable at existing shop buildings; Cargo Hold on the
    Crew screen
11. ✅ **Resource sinks: crafting + promotion stones** — a Craft section at the same two shops
    (2 Rum → Rum Ration, 3 Gunpowder → Grapeshot Charge, 5 Rum → Captain's Draught), plus the
    Draught itself as the "stone equivalent" force-promotion from the Crew screen — both reused
    the existing Item/Promotion systems rather than adding new ones
12. ✅ **The crime layer: ship plundering + shop theft** — a new `merchant` sea encounter (gold +
    cargo, +10 heat, no recruit/permadeath) and a steal option at 4 new resource-themed shops
    (free, cooldown-gated, heat spike bigger if caught) — the "GTA chaos" pillar's first real
    teeth beyond the existing rival/navy ambush system
13. ✅ **Ship Upgrades (traversal gate + more resource sinks)** — Reinforced Hull (hard-gates Île
    Sainte-Marie), Swift Rigging (halves Navy ambush chance), and Diving Bell (unlocks a passive
    gold-salvage site at Port Royal), all bought at Roatán's Smuggler's Den; plus Ship's Biscuit
    finally gives Fish a craft use beyond selling
14. ✅ **Menu hub + first-launch onboarding** — a new Menu screen consolidating Crew/Crew
    Log/Quest Log behind a single ☰ Menu button (replacing two separate header buttons that were
    starting to crowd the Map), plus a skippable 3-step first-launch overlay covering drag-to-sail,
    walking into buildings, and the heat meter. Both were UX-debt items flagged in a design review
    rather than gameplay-loop gaps, tackled now while the mechanic surface area is still small
    enough to retrofit cheaply
15. ✅ **Prisoner rescue** — `removeCrewMember` now persists captured-crew identity
    (`capturedCrew`), and a new Locked Ward marker at Tortuga + `rescue` encounter faction lets you
    fight a jailer to win them back at reduced HP. Gives permadeath the narrative payoff this list
    called for, reusing existing threat templates rather than adding new opponent data
16. ✅ **Pirate Council + final superboss (Elite Four/Champion equivalent)** — a new Ocracoke Inlet
    island hosts a back-to-back rematch gauntlet against all 5 Lords (reusing the escort wave-quest
    mechanic) which unlocks Blackbeard as a 6th, quest-gated Pirate Lord. The game finally has a
    real ending state to point playtesters at, built almost entirely by reusing existing fort/quest/
    badge machinery rather than inventing new screens
17. ✅ **Patrons system foundation** — `SideQuestBase` gained an optional `hostedByBuildingId`
    (offset becomes optional alongside it), so a quest can be reached by walking into an existing
    building instead of needing its own map marker. Proven with 2 example patrons at Tortuga's
    tavern (a fetch and a bounty, both tested end-to-end). This is the engineering prerequisite
    for scaling to 150+ mini quests — content authoring across the other buildings happens in
    future batches, not all at once
18. ✅ **Walkable building interiors** — building interiors are now real small floor-plan rooms
    (furniture as styled shapes, walk-up-to NPC tokens) instead of a static list-menu, matching
    Pokémon's actual walk-into-a-room pattern. `src/data/interiors.ts` holds hand-authored layouts
    plus a fallback generator so every building works even before it gets a bespoke floor plan.
    Reuses the outdoor drag-movement engine at room scale — no new movement tech, no new quest
    mechanics, just a new way of *arriving* at the same hire/shop/craft/patron content that already
    existed
19. ✅ **Real-world coastline shapes** — all 7 islands replaced their perfect-circle landmass with
    a hand-authored irregular polygon echoing the real island's true orientation/elongation
    (`Island.shape`, point-in-polygon `islandAtPoint()`, `react-native-svg` rendering in
    `MapScreen.tsx`) — see the "Real-world coastline shapes" note above
20. ✅ **Tortuga Cove: the whole-island blueprint** — a real street plan (`src/data/streets.ts`)
    covering the entire landmass, 3 new enterable buildings with interiors + Patron quests (Fort de
    Rocher, Chapelle Notre-Dame, Smugglers' Warehouse), 1 more new building on the previously-empty
    west tail (West Point Shack), 2 non-interactive landmarks (Basse-Terre Square, The Harbor Pier),
    1 new scenery-only landmark (La Ringot Fields), and patrolling ambient street NPCs
    (`src/data/streetNpcs.ts`) — see the "Tortuga Cove: the whole-island blueprint" note above

### Now (next up)
21. ✅ **New Providence** done (see the "New Providence: the blueprint repeated" note above) —
    **repeat the whole-island blueprint for the remaining 5 islands** (Port Royal, Roatán,
    Ocracoke Inlet, Île Sainte-Marie, Cow Island) — street plan + landmarks + enterable buildings +
    street life, same historically-grounded approach proven on Tortuga Cove and now New Providence
22. **Author Patron quest batches + bespoke floor plans, building-by-building** — apply the proven
    patterns to the remaining ~13 buildings (2-4 patrons each, drawing from the reusable archetype
    roster: Barkeep, Local, Drunk, Rival Pirate, Smuggler, Fortune Teller, etc.), giving each a real
    floor plan instead of the generic fallback room as content is authored, toward the 150+ target.
    New Providence's Careening Yard (and updating The Cracked Hull) are the most immediate targets
23. **More side quests from the brainstormed concepts/styles list** — timed race, clear-the-area,
    investigation, etc.; cheap to add now that one-shot/multi-stage/repeatable are all proven
    patterns. Feeds both standalone map-marker quests and Patron-hosted ones

### Next
24. **Economy polish** — per-island resource price variance for real trade routes, resource-cost
    recruits, resource-based fetch quests
25. **Themed island "puzzle" gauntlets before each Pirate Lord fort** — forts are currently a
    direct walk-in-and-fight with no lead-up layer
26. **Reputation-gated ports** — beyond the one hull-gated island, more traversal gating tied to
    heat/reputation rather than a one-time purchase
27. **A pure-logic unit test suite for `gameStore`** (no rendering) — cheap relative to new
    systems, and increasingly worth it now that permadeath, crime, quests, ship upgrades, rescue,
    and the Council/Blackbeard gating all touch shared state (heat/gold/resources/crew/quests)
    simultaneously

### Later
28. **Recurring named rival captain** with scripted story-beat battles (currently just a random
    hostile template) — Ocracoke Inlet is already reserved as a natural convergence point
29. **GTA-style character switching** (biggest, most novel, probably last)
30. Credits screen + real post-game content unlocks once there's more post-Blackbeard content to
    unlock
31. Full e2e test automation, IAP integration, real art asset pipeline —
    pre-launch/production concerns rather than gameplay-loop gaps
