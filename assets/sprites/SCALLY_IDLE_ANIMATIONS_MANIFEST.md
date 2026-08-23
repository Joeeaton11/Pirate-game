# Captain Scally — Idle Animations — Delivery Manifest

Source: `assets/brand/scally_idle_animations_source.png` (1536×1024) — "Captain Scally — Idle
Animations" reference sheet, 10 panels (2 columns × 5 rows): Breathing, Hat Tip/Grin, Juggling
Coins, Reading Map, Sitting on Barrel, Bored/Boot Kick, Scratch Head/Thinking, Fishing,
Stretch/Yawn, Sleeping/Snoring. Uploaded with just "I have some idle animations."

Cut 2026-08-22 with the same discipline as every prior delivery this session: measured real
per-frame pixel boundaries rather than trusting the sheet's own printed frame-number labels (which
had gaps in every panel — real per-panel frame counts are 7 or 8, never a flat 8). This delivery
needed more correction rounds than most this session — see below — but every defect was caught by
this delivery's own verification, not a later independent pass.

**72 sprites filed** across 10 animations (was 73 — see the 2026-08-23 fishing correction below,
which dropped a body-less 8th slot that should never have been counted as a real frame):

| Panel | Frames | Destination |
|---|---|---|
| 1. Breathing | 7 | `idle_breathing_0..6.png` |
| 2. Hat Tip/Grin | 7 | `idle_flourish_hat_tip_grin_0..6.png` |
| 3. Juggling Coins | 7 | `idle_flourish_juggling_coins_0..6.png` |
| 4. Reading Map | 8 | `idle_flourish_reading_map_0..7.png` |
| 5. Sitting on Barrel | 7 | `idle_flourish_sitting_barrel_0..6.png` |
| 6. Bored/Boot Kick | 8 | `idle_flourish_bored_boot_kick_0..7.png` |
| 7. Scratch Head/Thinking | 7 | `idle_flourish_scratch_thinking_0..6.png` |
| 8. Fishing | **7** (not 8 — see below) | `idle_flourish_fishing_0..6.png` |
| 9. Stretch/Yawn | 7 | `idle_flourish_stretch_yawn_0..6.png` |
| 10. Sleeping/Snoring | 7 | `idle_flourish_sleeping_snoring_0..6.png` |

## Real defects found and fixed during cutting

This sheet's construction turned out to be **auto-laid-out per panel, not a rigid shared grid** —
each panel's title/content/label bands sit at their own tight offsets from that panel's own content
height, not a shared absolute row-group position. This one fact was the root cause of every real
defect below; every fix followed from re-measuring per-panel instead of assuming a row-group's two
panels (left/right column) share one y-window.

- **No real alpha channel**, same as the walk-sheet delivery earlier this session — `Image.open()`
  mode is `RGB`, the checkerboard is baked-in flat near-white (~250,250,250). Cut via chroma-key,
  same threshold (~28) as that delivery.
- **Column boundaries needed a hybrid gap-detection + even-pitch-split approach, chosen per panel.**
  Several panels (Hat Tip/Grin, Bored/Boot Kick, Fishing, Sleeping/Snoring, Juggling Coins) have
  frames close enough together, or props (a raised fist, a fishing rod's line, a floating coin)
  extending far enough from the body, that plain column-gap detection either merged adjacent frames
  or a stray gap-tolerance choice split one frame's own prop into its own false "item." The working
  rule: try gap-based run detection first (tolerance 8px); if the resulting count doesn't match the
  panel's real frame count, fall back to an even-pitch split of the panel's total content width
  divided by its frame count, then tighten each slice with `content_bbox`. Gap-based alone got 6 of
  10 panels right; the other 4 needed the pitch fallback.
- **Title text bled into the top of every frame in 2 panels (Sitting on Barrel, Bored/Boot Kick,
  Scratch Head/Thinking, Fishing) on the first cutting attempt** — the y-window's top boundary was
  set a few pixels too high, still inside the panel's own title text band. Caught by reading the
  actual cut files directly (not just a contact sheet — a contact sheet at thumbnail scale didn't
  make small baked-in text obviously wrong at a glance) and confirmed via tight zoomed crops of the
  source at each panel's real title/content boundary before re-cutting.
- **Frame-number labels bled into the bottom of Bored/Boot Kick specifically** — the row-group's
  left panel (Sitting on Barrel) and right panel (Bored/Boot Kick) turned out to have genuinely
  different content-bottom and label-start y-positions (616/622 vs. 600/608 respectively) despite
  sharing what looked like one row-group. Assuming a shared bottom boundary (which worked for every
  other row-group in this sheet) silently pulled digit glyphs into every Bored/Boot Kick frame.
  Fixed by measuring each of the 10 panels' own content-bottom/label-start boundary independently
  rather than assuming any two panels in the same visual row share one.
- **Zero remaining edge-opacity defects** after the fixes above — the systematic
  top/bottom/left/right scan across all 73 final files found only 2 hits, both confirmed correct on
  inspection (the Fishing panel's rod tip/line legitimately touches its own tight bounding box edge
  in 2 of its 8 frames — real content, not a border-line artifact, same call as the boat library's
  mast-tip edge cases).
- **Real bug, found and fixed 2026-08-23** (see `GAME_DESIGN.md` item 160): despite the above, this
  delivery's original cut used independent per-frame tight bounding boxes with no shared canvas per
  animation — measured up to 20-30+ px per-frame size variance in most flourishes. Under
  `resizeMode="contain"`, differently-sized frames get recentered/rescaled differently on every swap,
  which read on screen as the idle animations "not staying in the same frame/position." Re-cut all 73
  files into one shared canvas per animation (breathing, and each of the 9 flourishes), anchored on
  each frame's own gap-detected column-slice midpoint rather than its own silhouette center — same
  filenames, same frame counts, no wiring changes. `idle_e/n/w` (a separate, older delivery, see item
  183) had the same defect at smaller scale (2-6px) and got an equivalent post-hoc uniform-canvas
  pass directly on the existing files.
- **Second real bug, found and fixed 2026-08-23, same day** (see `GAME_DESIGN.md` item 161): Fishing
  was never actually 8 frames — the sheet's own printed "8" label sits over a slot with no character
  in it at all, just the tail of frame 7's own long rod/bobber. Both this delivery's original cut and
  the same-day re-cut above trusted the printed count and split it into 8 slices anyway, which cut
  frame 7's body away from part of its own rod — Scally flashed body-less every other frame in this
  one flourish. Fixed by using the 7 real connected-component boxes (body+rod+bobber, already one
  connected shape per frame) directly instead of assuming 8 and falling back to an even-pitch split.
  `idle_flourish_fishing_7.png` deleted; `IDLE_FLOURISHES`'s fishing entry in `scallySprites.ts` now
  declares 7 frames, not 8.

## Wiring

Wired directly into `scallySprites.ts` and `MapScreen.tsx` — see `GAME_DESIGN.md` item 151 for the
full write-up. Headline changes:

- **Breathing (panel 1) upgrades only the south-facing idle loop**, from the original 3-frame cut
  to this sheet's real 7-frame loop — a strict same-pose upgrade. The other 3 cardinals (e/n/w) keep
  their original 3-frame idle art unchanged; this sheet only drew breathing for the front-facing
  view, so there's no matching art to upgrade them to.
  - **Real bug, found and fixed 2026-08-23** (see `GAME_DESIGN.md` item 159): `MapScreen.tsx`'s
    frame counter was still wrapping at the *old* 3-frame count, so south's upgraded 7-frame loop
    silently only ever showed its first 3 frames from the day this was wired until the fix — no
    visible glitch, just a shorter loop than intended. `IDLE_FRAME_COUNT` now exists purely as a
    wrap bound (21, the LCM of every real idle-frame count in play), not a per-loop frame count.
- **The other 9 panels replace the old 4-item single-static-frame `IDLE_FLOURISH_POOL`
  entirely** (`emote_cheer/think/laugh/sit.png`, cut from an earlier, different "Animated Idle /
  Emotes" sheet — deleted). Three of the nine are richer direct successors of ideas the old pool
  already had (Bored/Boot Kick ~ the old think pose, Sitting on Barrel ~ the old sit pose, Hat
  Tip/Grin ~ the old cheer pose); the other six are new material entirely.
- `IDLE_FLOURISH_POOL: any[]` (single images) became `IDLE_FLOURISHES: IdleFlourish[]` (each entry a
  real multi-frame `frames` array). `MapScreen.tsx` now tracks which flourish is showing plus its
  own frame counter, cycled by a new interval at `IDLE_FLOURISH_FRAME_MS` (150ms) while a flourish
  is up — the same general pattern as the walk cycle's own frame-cycling interval, not the old
  single-`flashEmote`-call approach (which only ever held one static image).
- `IDLE_FLOURISH_HOLD_MS` raised from 2200ms to 2400ms — long enough for roughly two full loops of
  the longest (8-frame) animation before cutting back to the ordinary breathing loop, cut off
  mid-cycle rather than on a clean loop boundary (same as the walk/run cycles already do when
  movement stops).

Verified in a real headless-Chromium run against the dev server: standing still long enough
triggered a real animated flourish (confirmed two different runs picked two different flourishes —
Hat Tip/Grin and Fishing — showing the random pick works), a fine-grained capture showed genuine
frame-by-frame motion within one flourish (the Fishing rod visibly moving, the bobber
appearing/disappearing), and it cleanly returned to the plain breathing loop after the hold window
with 0 console errors throughout.
