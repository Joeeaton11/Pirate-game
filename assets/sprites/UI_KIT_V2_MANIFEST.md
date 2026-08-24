# UI Kit v2 — Delivery Manifest

Source: `assets/brand/tileset-catalog/ui_kit_v2.png` (1536×1024) — a second, more structured UI kit
sheet: numbered category headers ("1. PRIMARY ACTION BUTTON (Normal)", "5. ICON-ONLY ROUND
BUTTONS", "9. CONFIRMATION / MODAL DIALOG FRAME", etc.) each containing several real sprites in a
UX-state-driven system (normal/pressed/disabled/danger button states, locked/unlocked panel pairs,
a two-tab selector, a full confirm/cancel modal). Uploaded with no accompanying text — read as a
direct continuation of the standing "cut the sheet into assets" request. This is the second UI-kit
sheet this session (see `UI_KIT_MANIFEST.md` for the first).

Cut 2026-08-24. The numbered category headers baked into the sheet ("1. PRIMARY ACTION BUTTON...",
etc.) are the user's own reference labels for grouping, not sprite content — treated the same way
`AGENTS.md`'s "checklist grouping only" rule treats numbered batches in art briefs: real per-item
detection within each group, and the header text itself explicitly excluded from every cut file
(verified — no baked-in category-label text survived into any of the 29 filed sprites).

## Real defect: same soft vignette as `ui_kit_v1.png`, same fix

Confirmed the same intentional (not corrupted) soft vignette-glow alpha behavior diagnosed on the
first UI kit sheet — real, smooth alpha at the true canvas edges, but a warm glow that stays near-
opaque in the gaps between icons, making a plain alpha threshold unable to separate real content
from background. Used the same fix: item silhouettes detected from RGB gradient strength (Sobel),
closed and filled into a mask, then that mask used to zero the alpha everywhere outside each item's
real shape before cropping.

## Real per-item boundary work: three distinct techniques needed, not just one gap scan

This sheet packed items far more tightly than the first UI kit, and different sections needed
different resolution techniques:

- **Header exclusion.** Every group's numbered title text sits directly above its content with a
  small gap that a naive top-down gradient mask happily includes as "real content" (text has sharp
  edges too). Verified the actual header-to-content boundary by cropping and looking at the raw
  pixels above three representative groups (icon buttons, tab selector, confirmation dialog) rather
  than assuming a fixed offset — the two header rows on this sheet sit at different heights (one row
  for groups 1–4, a second, more indented row for groups 5/8/9, and a third for 6/7), so a single
  guessed cutoff would have clipped some groups and bled header text into others.
- **Narrow vertical/horizontal gap scans**, same technique as the first UI kit's button column,
  used per-group to split: 4 groups of 3 same-state buttons (12 total), 2 rows of 3 round icon
  buttons (6 total), and the two locked/unlocked panel rows (2×3 each).
- **Trust-the-pixels calls, verified rather than assumed**, for the two spots where a real dip
  in content density was easy to mistake for noise: the "wide top frame vs. two squares below" gap
  in both the panel and locked-panel groups (a genuine ~10px dip found by scanning the raw row-
  density curve directly, not a threshold guess), and the confirmation modal's frame-vs-buttons
  split (a real gap at y 833–836 out of a much larger candidate region).

## 29 sprites filed into `assets/sprites/ui/`

| Category | Count | Destination |
|---|---|---|
| Primary button — normal state, 3 sizes | 3 | `ui_button_normal_1..3` |
| Primary button — pressed/active state, 3 sizes | 3 | `ui_button_pressed_1..3` |
| Primary button — disabled state, 3 sizes | 3 | `ui_button_disabled_1..3` |
| Danger/attack button, 3 sizes | 3 | `ui_button_danger_1..3` |
| Icon-only round buttons (back/close/settings), gold ring | 3 | `ui_icon_button_back_1`, `ui_icon_button_close_1`, `ui_icon_button_settings_1` |
| Icon-only round buttons, brown ring | 3 | `ui_icon_button_back_2`, `ui_icon_button_close_2`, `ui_icon_button_settings_2` |
| Panel/card frame — wide + 2 squares | 3 | `ui_frame_panel_wide_1`, `ui_frame_panel_square_1..2` |
| Locked/unfound panel — wide (skull) + 2 squares (padlock) | 3 | `ui_frame_locked_wide_1`, `ui_frame_locked_square_1..2` |
| Tab/segment selector, 2 selection states | 2 | `ui_tabbar_crew_selected_1`, `ui_tabbar_ship_selected_1` |
| Confirmation modal frame | 1 | `ui_frame_modal_1` |
| Confirm / Cancel buttons | 2 | `ui_button_confirm_1`, `ui_button_cancel_1` |

All new descriptor names — checked against all 36 existing `ui/` files first (including the first
UI kit's `ui_button_{color}_1` series); no collisions, and no series continued, for the reasons
below.

## Judgment calls

- **New `ui_button_*` descriptors rather than continuing the first UI kit's `ui_button_green_1`
  etc. series.** Compared directly: the first kit's buttons are plain solid-color pills with simple
  gold end-caps, one size each. This sheet's buttons are visibly more detailed (individual wood-
  plank grain lines, separate dark-grey corner brackets under the gold rivets) and come in three
  sizes per state — a real style and structure difference, not just a recolor, so named by UX state
  (`normal`/`pressed`/`disabled`/`danger`) instead of by color, with the size baked into the trailing
  number (`_1`=small, `_2`=medium, `_3`=large — documented here since the numbering convention
  elsewhere in this library means "sequence," not "size").
- **`ui_frame_panel_wide_1`/`square_1..2` are new, not a continuation of `ui_frame_parchment_1`**
  from the first kit — that earlier frame is a single plain rope-corner frame with no locked/unlocked
  pairing or size set; this delivery's frames come as a matched normal/locked pair sharing the same
  wide+2-square layout, which reads as a distinct, purpose-built sub-system worth its own name.
- **Two baked-in-text limitations, flagged rather than hidden:** `ui_button_confirm_1` and
  `ui_button_cancel_1` have the words "CONFIRM"/"CANCEL" permanently painted into the art, and
  `ui_tabbar_crew_selected_1`/`ui_tabbar_ship_selected_1` have "CREW"/"SHIP" baked in the same way —
  unlike every icon-only or blank-panel asset elsewhere in this library, these four can't be
  reused for any other button label without a redraw. Cut and filed as-is since that's what the
  sheet delivered, but worth knowing before reaching for them in a context that isn't confirm/
  cancel or crew/ship.
- **Tab-bar rows kept as one image each**, not split into 4 individual tab halves — the two tab
  segments in each row are drawn as one continuous connected plank with a shared rivet in the
  middle, not two abutting separate buttons, so splitting them would cut through real art rather
  than a real seam (same "trust the pixels" rule used throughout this session).

## Verification

Ran the edge-opacity defect scan across all 29 cut files: zero hits. Built and visually reviewed a
5-column contact sheet (checkerboard background) covering all 29 items before classifying —
confirmed correct per-item boundaries (including all three fused-detection cases) and confirmed no
group-header text survived into any cut file.

## Wiring

**Not yet wired** — cutting and filing only, matching the scope of every prior delivery this
session.
