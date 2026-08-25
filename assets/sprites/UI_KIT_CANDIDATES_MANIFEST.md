# UI Kit Candidates — Delivery Manifest

Sources: `assets/brand/tileset-catalog/ui_kit_candidate_a.png` and `ui_kit_candidate_b.png` (1536×1024
each) — two more full UI-kit reference sheets, sent with no accompanying text but explicitly flagged
in conversation: *"I've got more sheets with more ui on. The ones I've loaded so far might not be
the ones we go with... so we have a choice of designs and artwork."*

Filed into a **separate `assets/sprites/ui_candidates/design_a/` and `design_b/` tree**, not merged
into the active `ui/` library — a deliberate choice, not an oversight. Both sheets reuse the exact
same 9-group layout as items 175-176's `UI_KIT_MANIFEST.md`/`UI_KIT_V2_MANIFEST.md` (primary/
pressed/disabled/danger buttons, icon-only round buttons, panel frame, locked panel, tab selector,
confirmation modal, plus an "Extra Variations" strip), which means naming them with `ui/`'s existing
`ui_button_normal_1` etc. convention would collide outright. Keeping them in their own folder means
nothing has to be decided or renamed until the user actually picks a design — at that point, expect
the winner's files to move into `ui/` (renamed to fit its convention) and the loser to be dropped or
kept as an archived alternative.

Cut 2026-08-25. **Not wired** — cutting and filing only, matching the scope of every prior
unsolicited-sheet delivery this session. Neither `ui/`'s existing v1/v2 kits nor either candidate
here has been wired into a real screen yet.

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

## Verification

Ran the edge-opacity defect scan across all 124 cut files (58 + 66): zero hits — confirmed binary
alpha only (no values other than 0/255), no near-empty crops, no near-fully-opaque crops (which
would indicate background bleeding into a "transparent" file). Built and visually reviewed full
contact sheets for both designs before filing, catching and re-cutting every group-header bleed and
neighbor-bleed case documented above — including two full re-cut passes on design B's primary-button
column and its two "Extra Variations" rows before both came back clean.

## Wiring

**Not wired**, and **not merged into the active `ui/` library** — these are alternatives pending the
user's choice of which design (if either) to standardize on. Cutting and filing only, matching the
scope of every prior unsolicited-sheet delivery this session.
