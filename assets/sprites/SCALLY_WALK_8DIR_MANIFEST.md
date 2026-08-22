# Captain Scally — 8-Directional Walk Cycle — Delivery Manifest

Source: `assets/brand/scally_walk_8dir_source.png` (1536×1024) — "Captain Scally — Walk Animations
(8 Directions)" reference sheet, uploaded with the message "These are the new walking sprites for
scallys walk." Understood as an upgrade to the existing on-map walk cycle, which previously only
covered 4 cardinal directions (down/left/right/up, 5 frames each, cut from an earlier, different
source sheet).

Cut 2026-08-22 with the same discipline as every prior delivery this session: measured real
per-frame pixel boundaries rather than trusting the sheet's own printed frame-number labels, and ran
a systematic edge-opacity scan across all final files before filing. This delivery's cut succeeded
cleanly on the first attempt — no border-line or divider-bleed defects found (unlike the
terrain-extras-4 tree panel or the boat library's row dividers earlier this session).

**53 sprites filed** across 8 compass directions:

| Direction | Frames | Filenames |
|---|---|---|
| South (`s`) | 6 | `walk_s_0.png`..`walk_s_5.png` |
| South-East (`se`) | 7 | `walk_se_0.png`..`walk_se_6.png` |
| East (`e`) | 6 | `walk_e_0.png`..`walk_e_5.png` |
| North-East (`ne`) | 7 | `walk_ne_0.png`..`walk_ne_6.png` |
| North (`n`) | 6 | `walk_n_0.png`..`walk_n_5.png` |
| North-West (`nw`) | 7 | `walk_nw_0.png`..`walk_nw_6.png` |
| West (`w`) | 7 | `walk_w_0.png`..`walk_w_6.png` |
| South-West (`sw`) | 7 | `walk_sw_0.png`..`walk_sw_6.png` |

Direction keys match `ShipHeading` from `src/data/shipSprites.ts` (s/se/e/ne/n/nw/w/sw) rather than
the old down/left/right/up names, now that Scally's facing is bucketed the same way the Black
Pearl's own heading already was.

## Real findings during cutting

- **The sheet has no real alpha channel** despite looking like a transparent checkerboard —
  `Image.open().mode` came back `RGB`, and the "checkerboard" is a baked-in flat near-white pattern
  (~246–254, R≈G≈B). Cut via chroma-key against a `(250,250,250)` reference color (same general
  approach as `shipSprites.ts`'s doc comment describes for its own no-real-alpha source sheet),
  distance threshold ~25–28, verified by rendering and inspecting a black/white silhouette mask
  before cutting for real.
- **The sheet's own printed frame-number labels are not the real frame count.** Every row's labels
  had gaps (e.g. South showed "1,2,3,4,6,8" — a 6-number sequence with holes at 5 and 7), which
  turned out to accurately describe genuinely uneven real frame counts (6 or 7, never a flat 8
  despite the sheet's own title). Confirmed by direct column/gap measurement on the mask, not by
  trusting the label text — the same lesson this session's earlier deliveries already established,
  reapplied here rather than assumed.
- **Zero edge-opacity or border-line defects found** — the systematic top/bottom/left/right scan
  (`(edge == 255).mean() > 0.5`) that caught real bugs in both prior deliveries this session
  (terrain-extras-4's tree panel, the boat library's row dividers) came back with 0 hits across all
  53 frames on the first pass.

## Filing changes to existing assets

- **The old 4-cardinal walk set was replaced, not kept alongside the new art.** `walk_down_0..4.png`,
  `walk_left_0..4.png`, `walk_right_0..4.png`, `walk_up_0..4.png` (5 frames each, from the original,
  different "Scallywags" source sheet) were deleted — this new sheet's South/East/North/West columns
  are full replacements with more frames (6) and matching style to the new diagonals, so keeping both
  sets would have left the old cardinal art as dead, confusing duplicates.
- **The existing 3-frame idle breathing loop was kept and renamed**, not replaced —
  `idle_down/left/right/up_{0,1,2}.png` → `idle_s/e/n/w_{0,1,2}.png` (same files, same art, just
  the new compass-letter naming to match). No new idle art was cut from this sheet — it doesn't
  include one.
- **The old `turn_se/ne/nw/sw.png` mid-pivot frames were deleted.** They were a workaround (from a
  third, earlier source sheet) for the 4-cardinal-only walk cycle having no real diagonal art — see
  `GAME_DESIGN.md` and `scallySprites.ts`'s comments for the full removal rationale. Genuine
  sustained 8-directional walk art makes a momentary pivot flash both redundant and visually
  mismatched (the old pivot poses don't share this sheet's diagonal stance).

## Diagonal idle fallback

This sheet has no diagonal idle art, and neither did the original 4-cardinal idle cut. Rather than
force a breathing loop that doesn't exist, `IDLE_SOURCES` for `se`/`ne`/`nw`/`sw` in
`scallySprites.ts` holds a single static frame — that direction's own first walk frame — while
stationary. This reads as "standing still facing that way" rather than snapping to a neighboring
cardinal's idle pose the instant movement stops, at the cost of the pose looking a little
stride-like when held still (there's no way around that without new art).

## Wiring

Wired directly into `scallySprites.ts` and `MapScreen.tsx` — see `GAME_DESIGN.md` for the write-up.
Headline changes:

- `FacingDirection` expanded from 4 values (`down`/`left`/`right`/`up`) to the full 8-value compass
  type (`n`/`ne`/`e`/`se`/`s`/`sw`/`w`/`nw`), matching `ShipHeading`.
- MapScreen's pan-gesture direction bucketing now reuses `headingFromVector` (the same function
  already driving the Black Pearl's `shipHeading`) instead of the old 4-way `DIRECTION_HYSTERESIS`
  axis-dominance logic — both the player's facing and the ship's heading now come from one call on
  the same drag vector.
- The `turnFrameFor`/`TurnFrame`/`TURN_FRAME_BY_PAIR` mid-pivot system and its `useEffect` in
  MapScreen were removed entirely (see above).
- The side-view run cycle (`isRunning`/`RUN_SOURCES`) — a single pose set with no directional
  variants — is now gated on `facingDir === 'w' || facingDir === 'e'` (previously
  `'left'`/`'right'`); the other 6 headings, including all 4 new diagonals, keep using the plain
  walk cycle instead of running at an angle the run pose doesn't depict.
