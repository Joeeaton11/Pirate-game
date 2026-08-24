# UI Parchment/Nameplate Variants (v2) — Delivery Manifest

Two single-asset sends this session, each with no accompanying text: a parchment scroll banner
(wax seal with a skull-and-crossbones) and a riveted wood plank nameplate board. Both read as a
direct continuation of the standing "cut the sheet into assets" request — except neither is a
sheet with multiple items to detect. Each upload is one complete, self-contained UI background
asset, so the work here is defect-fix-and-file, not connected-component cutting.

## Real defect found and fixed: baked-in near-white background, not a corrupted alpha channel

Different failure mode from every sprite-sheet delivery earlier this session. Both files' alpha
channel is fully opaque (`255` everywhere) — there is no real transparency data at all. What
displays as a checkerboard "transparent" background is actually painted into the RGB pixels
themselves as a very low-contrast near-white/near-grey field (sampled range ~244-255, saturation
under 10). This is the same failure class already diagnosed and fixed once before in this repo
(`GAME_DESIGN.md` item 196, "fix chroma-key for baked-in checkerboard") — an export flattened real
transparency into a faint neutral fill instead of preserving it.

Fixed by chroma-keying on color, not on the (useless) alpha channel: any pixel with saturation
`(max(R,G,B) - min(R,G,B)) < 10` and `max(R,G,B) > 215` was classified as background (matches the
near-neutral, near-white checker field but not the warm parchment tan or the dark wood/rivet
tones, which are never that neutral or that bright at once). Cleaned with a light 2×2 opening to
drop single-pixel noise, then a 3×3 median filter + 0.7-sigma Gaussian feather on the resulting
alpha for a naturally anti-aliased edge — same feathering approach as every alpha-cleanup this
session, just built from a different source signal. Confirmed via connected-component labeling
that each image is exactly one real foreground blob (no debris to filter out), and that the small
punch-holes in the parchment and the visual gaps in the wood-board's plank/rivet silhouette
survived as real transparent holes rather than getting filled in — the fix only removes fg noise
speckle, never closes background regions, so genuine cutouts in the source art are preserved.

## 2 files filed

| Source | Destination | Notes |
|---|---|---|
| Parchment scroll banner, torn left edge, 2 hanging holes, red wax seal (skull) | `ui/ui_dialogue_parchment_2.png` | New numbered variant of the wired `ui_dialogue_parchment_1.png` (ConversationBox background) — same design language (torn parchment banner, same seal placement) but a distinct re-generation, not a pixel-identical duplicate |
| Riveted 3-plank wood board, 4 rivets, notched top/bottom edges | `ui/ui_nameplate_board_2.png` | New numbered variant of the wired `ui_nameplate_board_1.png` (ConversationBox nameplate) — same board/rivet design, distinct re-generation |

Both source uploads also saved uncut to `assets/brand/tileset-catalog/dialogue_parchment_v2.png`
and `assets/brand/tileset-catalog/nameplate_board_v2.png`.

## Judgment call: filed as new numbered variants, not used to replace `_1`

Compared each new cutout directly against its existing `_1` counterpart before deciding where it
goes. Both pairs are clearly the same design concept (identical banner/board shape language, same
seal and rivet placement) but are not pixel-identical — different crop dimensions and enough
per-pixel difference in the wood grain/parchment texture to be a separate render, not a re-export
of the same source file. `ui_dialogue_parchment_1.png` and `ui_nameplate_board_1.png` are both
actively wired into `ConversationBox.tsx` via `src/data/uiSprites.ts`
(`UI_DIALOGUE_PARCHMENT`/`UI_NAMEPLATE_BOARD`). Rather than guess at a silent asset swap on a
currently-shipping, actively-referenced UI component, filed the new art as `_2` alongside the
existing `_1` — consistent with how every other repeated descriptor this session (torch, cannon,
capstan, etc.) has been handled by extending the numbered series rather than overwriting.

## Verification

Ran the edge-opacity defect scan on both cut files: zero hits on all four borders. Visually
reviewed each full-resolution cutout against its `_1` counterpart to confirm clean, correctly
recovered alpha (including the parchment's two punch-holes and the board's plank gaps/rivet
recesses reading as real transparency, not solid fill).

## Wiring

**Not yet wired.** `_1` of each stays the active production asset referenced by
`src/data/uiSprites.ts` / `ConversationBox.tsx` — untouched by this delivery. `_2` of each is
filed and available for a future swap or alternate-skin use, not referenced anywhere yet.
