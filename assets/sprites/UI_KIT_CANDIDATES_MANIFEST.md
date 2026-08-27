# UI Kit Candidates — Delivery Manifest

Sources: `assets/brand/tileset-catalog/ui_kit_candidate_a.png`, `ui_kit_candidate_b.png` (both
2026-08-25), `ui_kit_candidate_c.png` (2026-08-27, added in a later delivery), and
`ui_kit_candidate_d.png` (2026-08-27, added in a third delivery the same day) — 1536×1024 each, four
full UI-kit reference sheets, sent with no accompanying text but explicitly flagged in conversation:
*"I've got more sheets with more ui on. The ones I've loaded so far might not be the ones we go
with... so we have a choice of designs and artwork."*

Filed into a **separate `assets/sprites/ui_candidates/design_a/`, `design_b/`, `design_c/`, and
`design_d/` tree**, not merged into the active `ui/` library — a deliberate choice, not an oversight.
Designs A-C reuse the same 9-group layout as items 175-176's `UI_KIT_MANIFEST.md`/
`UI_KIT_V2_MANIFEST.md` (primary/pressed/disabled/danger buttons, icon-only round buttons, panel
frame, locked panel, tab selector, confirmation modal, plus an "Extra Variations" strip), which means
naming them with `ui/`'s existing `ui_button_normal_1` etc. convention would collide outright.
Design D is a different content mix (see its own section below) but gets the same folder treatment
for the same reason — nothing has to be decided or renamed until the user actually picks a design, at
which point expect the winner's files to move into `ui/` (renamed to fit its convention) and the
losers to be dropped or kept as archived alternatives.

Cut 2026-08-25 (designs A, B) and 2026-08-27 (designs C, D). **Not wired** — cutting and filing only,
matching the scope of every prior unsolicited-sheet delivery this session. Neither `ui/`'s existing
v1/v2 kits nor any of the four candidates here has been wired into a real screen yet.

## Real defect: local-median background estimation voids uniform-fill interiors

Both sheets have flat (if noisy) single-color backgrounds — magenta (`~137,18,72`) for design A,
dark navy/charcoal (`~15,19,22`) for design B — a different kind of background than items 175-176's
soft vignette-glow alpha, so a different real-boundary technique was needed: **global background-
color distance** (RGB distance from a color sampled off a clean, guaranteed-background border strip,
thresholded a handful of std-devs above that strip's own noise floor) instead of local-gradient/
Sobel edge detection.

The first approach tried — local-median background estimation, the same class of technique that
worked for 175-176's vignette — turned out wrong for these flat-background sheets: a median filter
window sitting deep inside a *large uniform-color fill* (a solid gold button's flat center, not just
its edges) returns that same flat color as its own "local background" estimate, since there's no
local variation for the median to average away. That silently zeroed the alpha of several solid-fill
buttons' interiors — confirmed on `button_style_gold` in design A, where the entire tan/gold body
came out fully transparent, leaving only the border. Caught by comparing the alpha-masked crop
against the raw RGB crop of the same region side by side. Switched to global background distance for
both sheets and re-cut everything; verified with a fresh contact sheet afterward.

Also dropped the soft/feathered alpha edge used on 175-176's items in favor of a hard binary
threshold (`0` or `255`, no blur). With no real background glow to blend into, a feathered edge only
produced a ring of partial-alpha pixels whose RGB channel is still literally the background color —
invisible in isolation, but a visible background-tinted fringe once composited onto anything else
(classic non-premultiplied-alpha color bleed). Confirmed by sampling the same edge pixel before and
after the switch: `(142, 25, 75, 4)` → `(142, 28, 76, 0)`, i.e. a translucent magenta pixel became a
fully transparent one instead of a magenta-tinted one.

## Real header-text exclusion problems (both sheets, worse on design B)

Both sheets bake their own group headers directly above the content, with a real but narrow gap —
the same "checklist grouping only" situation `AGENTS.md` calls out, verified per-group via raw row-
density profile scans rather than one guessed offset, since the gap height varies group to group.

**Design A** needed three different header heights across its 9 groups (matching 176's own
precedent) — caught and fixed before the first contact-sheet review, no re-cuts needed after.

**Design B** was worse: its primary-button group has three sub-rows, each with its own material
label ("A. WOOD PLANK", "B. BRASS PLATE", "C. CANVAS & ROPE"), and reading the raw pixels found the
sheet's own labeling is inconsistent — "B. BRASS PLATE" is baked in *twice* (once correctly above
the brass row, and again directly above the canvas/rope row below it, apparently a copy/paste error
in the source art), while the sheet's real "C. CANVAS & ROPE" caption sits *after* that row instead
of before it. A first pass at excluding the header (based on where the *first* "B. BRASS PLATE"
ended) still left visible header-text fragments in `primary_button_brass_s` and
`primary_button_canvas_s` — the true content boundary was further down than the label text implied,
past a second near-empty gap the first pass didn't scan for. Fixed by reading the complete column
(header → button → header → button → header) off a gridded pixel overlay rather than trusting either
label's position, and re-cropped both files; a fresh crop confirmed clean.

The same "header bleeds past a shallow first fix" pattern hit design B's `extra_corner_*` (the
"CORNER STYLES" caption's real gap was ~15px lower than an initial guess), `button_style_*` (a
"BUTTON STYLE VARIATIONS" caption), and `panel_material_*` (a "PANEL MATERIAL VARIATIONS" caption)
rows — each caught by a raw density-profile check and re-cut once before the final contact sheet.

## Real fused-detection problem: design B's panel/locked-panel groups aren't a uniform grid

Design A's panel-frame group (wide top frame / square+narrow+tall row / wide bottom frame) matches
item 176's own layout and was hand-specified from a gridded overlay the same way 176 was.

Design B's equivalent group has a genuinely different shape: three *wide* material rows (gold trim,
dark wood, tan rope) stacked in one column, beside a single *tall* frame in its own column that spans
the full height of rows 2+3 combined — and the third wide row does **not** extend under the tall
column the way a uniform 3-row grid would assume. An automatic row/column grid splitter forced into
that shape produced nonsense (a tiny sliver row, a bogus second column-split cutting through real
art). Fixed the same way item 174 called for its own irregular layouts: read the real region
boundaries off a gridded pixel overlay by eye, hand-specify all 8 boxes (3 wide + 1 tall, ×2 for the
locked-panel twin group), then let the same global-distance mask tighten each box to its real content
edges. Cross-checked against the mask afterward — all 8 came back clean with the correct, distinct
shape per item.

## Real shared-edge case: design B's tab combo vs. its single active pill

Design A's tab-selector group (4 rows × inactive/active, themed Crew/Ship/skull/anchor) has a real
background gap between every pair of adjacent items — confirmed via density profile, split cleanly.

Design B's tab group is structured differently: each row is a fused 2-segment "Crew | Ship" inactive
combo (one continuous wood plank, matching the "kept as one image" precedent from item 176's own tab
rows) beside a *separate* single active-state pill (just "Crew" or just "Ship"). Checked the real gap
between the combo and the pill with the same density-profile technique used everywhere else in this
delivery — and for row 1, there isn't one: the profile stays flat and non-zero across the whole
transition, meaning the two wood/metal frames physically touch in the source art with no true
background pixel between them. Cut at the real color-transition point rather than forcing a fake gap;
`tab_single_active_crew_1` still carries a few px of the neighboring combo's edge as a result. Flagged
rather than hidden — the same "shared edge, not a cutting error" tradeoff items 175-176 documented for
their own baked-together decorative elements (rope ties, tab-selector rivets).

## 58 sprites filed into `assets/sprites/ui_candidates/design_a/`

Magenta-background sheet. Single wood/metal material per state (matches items 175-176's general
layout most closely).

| Category | Count | Files |
|---|---|---|
| Primary button, normal, 3 sizes | 3 | `primary_button_normal_s/m/l` |
| Primary button, pressed, 3 sizes | 3 | `primary_button_pressed_s/m/l` |
| Primary button, disabled, 3 sizes | 3 | `primary_button_disabled_s/m/l` |
| Danger/attack button, 3 sizes | 3 | `danger_button_s/m/l` |
| Icon-only round buttons (back/close/settings/menu), normal | 4 | `icon_button_{back,close,settings,menu}_normal` |
| Icon-only round buttons, pressed | 4 | `icon_button_{back,close,settings,menu}_pressed` |
| Panel/card frame (wide top, square, narrow, tall, wide bottom) | 5 | `panel_frame_{wide_top,square,narrow,tall,wide_bottom}` |
| Locked/unfound panel, same layout | 5 | `locked_panel_{wide_top,square,narrow,tall,wide_bottom}` |
| Tab/segment selector, 4 themes × inactive/active | 8 | `tab_{crew,ship,skull,anchor}_{inactive,active}` |
| Confirmation modal (confirm/cancel baked in) | 2 | `modal_frame_flags`, `modal_frame_plain` |
| Extra: primary-button style variations | 4 | `button_style_{teal,green,wood,gold}` |
| Extra: panel-frame material variations | 4 | `panel_material_{blue,wood,teal,stone}` |
| Extra: button-corner decorative swatches | 10 | `corner_style_1..10` (pixel-verified as 10, not the 9 a first glance suggested — see note below) |

**58 total.** `corner_style_1..10` are generic sequence numbers rather than descriptive names — each
is a small decorative corner-bracket accent (plain gold, plain grey, then 8 skull/anchor combos in
alternating color pairs) too visually similar to name meaningfully apart without over-claiming a
distinction the art doesn't clearly support.

## 66 sprites filed into `assets/sprites/ui_candidates/design_b/`

Dark-navy sheet. Three parallel material lines (wood plank, brass plate, canvas & rope) per button/
panel state, and four modal/corner variants instead of one — a real design alternative, not a recolor.

| Category | Count | Files |
|---|---|---|
| Primary button, normal — wood/brass/canvas, 2 sizes each | 6 | `primary_button_{wood,brass,canvas}_{s,l}` |
| Primary button, pressed — wood/brass/canvas, 1 size each | 3 | `pressed_button_{wood,brass,canvas}` |
| Primary button, disabled — wood/brass/canvas, 1 size each | 3 | `disabled_button_{wood,brass,canvas}` |
| Danger/attack button — plain, brass+skull, canvas+skull | 3 | `danger_button_plain`, `danger_button_brass_skull`, `danger_button_canvas_skull` |
| Icon-only round buttons (back/close), 4 ring colors × normal/pressed | 16 | `icon_{back,close}_{normal,pressed}_{gold,bronze,silver,rope}` |
| Panel frame — 3 wide materials + 1 tall | 4 | `panel_frame_wide_{gold,wood,rope}`, `panel_frame_tall_gold` |
| Locked panel — 3 wide materials + 1 tall | 4 | `locked_panel_wide_{skull,dark,rope}`, `locked_panel_tall` |
| Tab/segment selector — 4 rows, fused inactive combo + single active pill | 8 | `tab_combo_{wood_1,wood_2,tan_3,red_4}`, `tab_single_active_{crew_1,ship_2,crew_3,ship_4}` |
| Confirmation modal, 4 ornament variants | 4 | `modal_frame_{gold_flags,bronze_skull,dark_skull,plain}` |
| Extra: primary-button style variations | 4 | `button_style_{teal,slate,charcoal,cream}` |
| Extra: panel-frame material variations | 5 | `panel_material_{wood,tan,red,stone,blue}` |
| Extra: button-corner decorative swatches | 6 | `corner_style_{gold_plain,grey_plain,gold_cross,grey_dot,gold_rope,red_banner}` |

**66 total.**

## Judgment calls

- **Kept both sheets' baked-in text as-is.** Design B's tab combos have "Crew"/"Ship" painted in,
  and both sheets' confirm/cancel buttons (baked into their modal frames, not separate assets on
  either sheet) carry "CONFIRM"/"CANCEL" — same limitation items 175-176 flagged for their own kits.
  None of these can be relabeled without a redraw.
- **`tab_single_active_crew_1` carries a small shared-edge artifact** (see the fused-detection note
  above) rather than a clean isolated crop — a real property of the source art, not deferred cleanup.
- **`corner_style_*` names are sequence numbers (design A) or descriptor tags (design B)**, not a
  claim about their intended use — they're small decorative accents whose real-world pairing (which
  corner goes with which button/panel style) isn't determinable from the sheet alone.
- **Did not attempt to reconcile design A's and design B's naming schemes with each other or with
  `ui/`'s existing `ui_button_normal_1` series.** They're being kept legitimately separate until the
  user picks one — premature renaming now would just mean renaming again later.

## 119 sprites filed into `assets/sprites/ui_candidates/design_c/`

Dark-navy sheet, third candidate. Denser than A or B: 5 material rows per button state (not 3-4),
real English labels baked into several elements ("Ship's Crew"/"Crew Quarters" tab pair, not just
"Crew"/"Ship"), and considerably more reference/extra material — size examples, a second icon-button
row, a pressed-icon reference strip, and label-plate/title-plaque examples not present on A or B.

| Category | Count | Files |
|---|---|---|
| Primary button, normal — 5 materials × 2 sizes | 10 | `primary_button_normal_{wood,gold,parchment,dark,green}_{s,l}` |
| Primary button, pressed — 5 materials × 2 sizes | 10 | `primary_button_pressed_{wood,gold,parchment,dark,green}_{s,l}` |
| Primary button, disabled — 5 materials × 2 sizes | 10 | `primary_button_disabled_{wood,gold,parchment,dark,green}_{s,l}` |
| Danger/attack button, 5 style variants, 1 size each | 5 | `danger_button_1..5` |
| Icon-only round buttons — back/close, normal | 8 | `icon_back_normal_1..4`, `icon_close_normal_1..4` (4 ring-color rows) |
| Icon-only round buttons — 1 extra icon per row, pressed | 4 | `icon_extra_pressed_1..4` |
| Panel/card frame — wide + square, 4 material rows | 8 | `panel_frame_wide_1..4`, `panel_frame_square_1..4` |
| Locked panel — wide + square, 4 material rows | 8 | `locked_panel_wide_1..4`, `locked_panel_square_1..4` |
| Tab/segment selector — "Ship's Crew"/"Crew Quarters", 5 color rows | 10 | `tab_inactive_ships_crew_1..5`, `tab_active_crew_quarters_1..5` |
| Confirmation modal — 4 compact + 1 large ornate | 5 | `modal_small_1..4`, `modal_large` |
| Extra: primary-button style variations, 2 rows × 5 | 10 | `button_style_1..10` |
| Extra: panel-frame material variations | 5 | `panel_material_1..5` |
| Extra: button-corner decorative swatches | 6 | `corner_style_1..6` |
| Extra: button size reference (short/medium) | 2 | `button_size_short`, `button_size_medium` |
| Extra: icon-only round buttons, 2nd row set | 10 | `icon_extra_1..10` |
| Extra: pressed-icon reference strip | 4 | `pressed_icon_example_1..4` |
| Extra: label-plate / title-plaque examples (for headers) | 4 | `label_plate_1..4` |

**119 total.**

### Real defects found and fixed on design C

- **Dark, low-contrast "pressed"/"disabled" button art defeated the global-distance threshold used
  for designs A/B.** Those states are deliberately darker/desaturated, which pushed large parts of
  their own interior fill below the same distance-from-background threshold that worked fine for
  design C's brighter "normal" buttons — first-pass crops came out as thin slivers (only the
  brightest rivets/highlights survived), not full buttons. Fixed by lowering the threshold and adding
  morphological closing + hole-filling to the mask (recovers interior pixels that dip below threshold
  from local shading without pulling in real background), then re-cutting every item on the sheet
  with the corrected mask — confirmed via a direct pixel-distance sample showing the "pressed" state's
  median distance-from-background was ~24, well under the ~45 threshold that separated design A/B's
  brighter art cleanly.
- **A second, independent defect after that fix: closing/filling recovered each button's own interior,
  but several crops — all five `primary_button_normal_*_l` buttons plus two `label_plate_*` — still
  carried a small disconnected second blob (a neighboring group's rope-tassel or header-text fragment
  sitting just outside the true item, close enough for the closing operation to nearly bridge them).
  Fixed generally rather than per-file: for every crop, ran connected-component labeling and dropped
  any component under 15% of the main component's size as debris; for the handful still over that
  threshold (the true bleed fragments), re-cropped to the main component's own tight bounding box.
  Verified with a fresh connected-component pass afterward: zero files retain a secondary blob.
- **Group-header text baked directly above content, same class of defect as design B**, but with a
  new wrinkle: on this sheet a single group's header can be positioned differently across its own
  row (e.g. "EXTRA ICON ROUND BUTTONS" and "MATERIAL PALETTE REFERENCE" each turned out to overlap
  only some of the columns beneath them, not the full row width) — first-pass boxes using one shared
  y-boundary for the whole row left two files (`icon_extra_*` row 2, `material_swatch_rope`/`_wood`)
  with header-text fragments that a same-row sibling using the identical y-boundary didn't have.
  Fixed by reading the real per-column boundary directly off the pixel density profile rather than
  assuming one cutoff applies across an entire row.
- **Two items were undercounted on first read and corrected before cutting**: the "9. CONFIRMATION"
  group's stacked small modals are 4, not the 5 a first glance at the reference thumbnail suggested;
  the corner-style swatches used a pixel run-length scan (not eyeballing) that turned out cleanly
  divisible into groups matching the visible art rather than any assumed count.

### Judgment calls

- **`danger_button_1..5` and `corner_style_1..6` use sequence numbers, not material/color names** —
  unlike the primary-button rows (which repeat the same 5-material system and can be named by
  material), these groups' per-row styling didn't map cleanly 1:1 onto that same 5-material set, so
  numbering avoids asserting a material identity the art doesn't clearly support.
- **`icon_extra_1..10` and `icon_back/close_normal_1..4` are kept as separate groups**, not merged
  or renumbered together, since they come from two visibly different sections of the sheet (the
  main icon-button group vs. the "Extra Icon Round Buttons" strip) with different icon sets — merging
  their numbering would imply a relationship the source sheet doesn't have.
- **Baked-in text**: the tab pair's "Ship's Crew"/"Crew Quarters" labels and both modal styles'
  "CANCEL"/"CONFIRM" buttons are permanently painted into the art, same limitation flagged for every
  prior UI kit this session — can't be relabeled without a redraw.

## 40 sprites filed into `assets/sprites/ui_candidates/design_d/`

Unlike A-C, design D isn't a button/panel/tab/modal ladder — it's a broader widget kit: bar frames,
banner flags, toggle switches, checkboxes, round icon buttons, and nav icons, plus a handful of bar
assets that overlap with the `bars_meters_*` candidates (see `BARS_METERS_CANDIDATES_MANIFEST.md`).
Arrived alongside three more bars/meters sheets (`ui_bars_meters_v4/v5/v6.png`) in the same delivery,
with a real per-item alpha channel already baked in (see that manifest's "genuine first" note) — no
background reconstruction needed here either.

Two fusions needed splitting, both verified against a gridline overlay first: a 5-row multi-icon stat
bar family (heart/lightning/crown/potion/skull caps) split at equal fifths, and a 5-flag banner strip
split at equal fifths, plus a smaller 3-up fusion (wheel/rope/metal frame circles) split at equal
thirds. Also hit the bounding-box-overlap neighbor-bleed defect documented in
`BARS_METERS_CANDIDATES_MANIFEST.md` (shared root cause, same delivery, same fix — mask crops against
the actual connected-component label rather than a rectangular alpha threshold); re-cut and reverified
clean.

| Category | Count | Files |
|---|---|---|
| Bar frame, empty track, 3 styles (wheel/bandana cap, blank compass scroll, anchor cap) | 3 | `bar_frame_{wheel,scroll,anchor}_track` |
| Blank decorative scroll/banner panel (treasure map, no bar) | 1 | `scroll_map_blank` |
| XP scroll composite (yellow) + LVL/crown composite (purple) | 2 | `bar_scroll_xp_composite_yellow`, `bar_crown_lvl_composite_purple` |
| Multi-icon stat bar (heart/lightning/crown/potion/skull caps), split from a 5-row fused blob | 5 | `bar_stat_{heart_red,lightning_blue,crown_yellow,potion_green,skull_purple}` |
| Segmented boss bar, chain caps + skull medallion (single fused asset) | 1 | `boss_bar_segmented_chainskull` |
| Combo anchor/wheel bar, split blue+orange fill (single fused asset) | 1 | `bar_combo_anchor_wheel_composite` |
| Star-rating bar (5-star row, partially filled, single fused asset) | 1 | `star_rating_bar` |
| Banner flag, icon + color per flag, split from a 5-flag fused strip | 5 | `banner_flag_{swords_red,anchor_blue,crown_green,skull_purple,trophy_orange}` |
| Decorative frame circle (empty, no bar), 3 border styles, split from a 3-up fused row | 3 | `frame_circle_{wheel_gold,rope,metal_red}` |
| Toggle switch, on/off × 2 colorways | 4 | `toggle_on_{green,gold}`, `toggle_off_gray_{1,2}` |
| Checkbox button, 3 states | 3 | `checkbox_{check,x,empty}` |
| Round icon button (stat/currency icons) | 6 | `icon_button_{heart_red,lightning_blue,coins_gold,potion_green,skull_red,trophy_purple}` |
| Round nav icon (menu chrome) | 5 | `nav_icon_{menu,settings,speaker,music,home}` |

**40 total.**

## Verification

Ran the edge-opacity defect scan across all 283 cut files across all four designs (58 + 66 + 119 +
40): zero hits — confirmed binary/near-binary alpha with no near-empty or near-fully-opaque crops
(which would indicate background bleeding into a "transparent" file). Built and visually reviewed full
contact sheets for all four designs before filing, catching and re-cutting every group-header bleed,
neighbor-bleed, low-contrast-alpha, and bounding-box-overlap case documented above.

## Wiring

**Not wired**, and **not merged into the active `ui/` library** — these are alternatives pending the
user's choice of which design (if any) to standardize on. Cutting and filing only, matching the
scope of every prior unsolicited-sheet delivery this session.
