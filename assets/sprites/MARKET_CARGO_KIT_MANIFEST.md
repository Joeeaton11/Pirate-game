# Market/Cargo Kit — Delivery Manifest

Source: `assets/brand/tileset-catalog/market_cargo_kit_v1.png` (1536×1024) — a market-and-cargo
scene kit: awning market stalls (fish, produce, general goods), a canvas tent stall, street/dock
lanterns, a torch, a signpost, a tavern sign, a notice board, three dock cranes, many crate/barrel/
sack/hay-bale variants, fish-drying racks, a fishing net, treasure chests, a cannonball pile, a
spilled barrel, wheelbarrows/carts, harbour hardware (capstans, rope coils, chains, an anchor), a
cannon, and two flags. Uploaded with no accompanying text — read as a direct continuation of the
"cut the sheet into assets" request (third sheet in the same session).

Cut 2026-08-23 with the same discipline as every prior delivery: real per-item connected-component
detection, no assumed grid.

## Real defect found and fixed before cutting: same corrupted-alpha issue, third time this session

Confirmed the identical defect diagnosed on the two earlier sheets today: the file's own alpha
channel was noisy across the whole image (a supposedly-empty background patch sampled at alpha
0-250 within itself). Fixed the same way — discard it, re-derive a clean one via 5×5 median-filter
denoise + threshold(128) + light morphological opening + Gaussian feather.

## 90 sprites filed

| Category | Count | Destination |
|---|---|---|
| Market stalls (awning) | 4 | `props/market_stall_2..5` |
| Market tent stall | 1 | `props/market_tent_1` |
| Dock lanterns (post + hanging lantern) | 2 | `props/dock_lamp_1..2` |
| Torch | 1 | `props/torch_2` |
| Signpost | 1 | `props/signpost_8` |
| Tavern hanging sign | 1 | `props/tavern_sign_1` |
| Notice board | 1 | `props/notice_board_1` |
| Cranes | 3 | `harbour/crane_2..4` |
| Market crates (various open/closed/stacked) | 21 | `props/market_crate_1..21` |
| Market barrels | 9 | `props/market_barrel_1..9` |
| Hay bales | 2 | `props/hay_bale_1..2` |
| Sacks | 4 | `props/sacks_8..11` |
| Fish drying racks | 3 | `props/fish_rack_1..3` |
| Fishing net panel | 1 | `props/fishing_net_1` |
| Fish/ice basket | 1 | `props/fish_basket_1` |
| Bread basket | 1 | `props/bread_basket_1` |
| Cannonball pile | 1 | `props/cannonball_pile_1` |
| Spilled/tipped barrel | 1 | `props/barrel_spilled_1` |
| Small basins | 3 | `props/basin_1..3` |
| Wheelbarrows | 2 | `props/wheelbarrow_1..2` |
| 2-wheel carts | 2 | `props/cart_1..2` |
| Milk can | 1 | `props/milk_can_1` |
| Small ambiguous wood post-block | 1 | `props/dock_block_1` |
| Hanging hook rig | 1 | `props/hanging_hook_1` |
| Treasure chests | 3 | `treasure/chest_2..4` |
| Fish/meat scrap (tiny) | 1 | `items/fish_scrap_1` (first entry — previously empty) |
| Capstans | 5 | `harbour/capstan_1..5` |
| Rope coils/rings | 8 | `harbour/rope_coil_2..8`, continuing the dock-kit series |
| Chain segment | 1 | `harbour/chain_1` |
| Chain hook/shackle | 1 | `harbour/chain_hook_1` |
| Anchor (with chain) | 1 | `harbour/anchor_2` |
| Cannon | 1 | `combat/cannon_1` (first entry — previously empty) |
| Flags | 2 | `world/flag_skull_pirate_1`, `world/flag_naval_1` |

## Judgment calls

- **Market crates/barrels/hay bales use new descriptor names** (`market_crate`, `market_barrel`,
  `hay_bale`) rather than continuing this library's pre-existing `crates_N`/`barrels_N`/`hay_N`
  series — a direct side-by-side comparison found the existing series noticeably darker/more
  weathered, and the existing hay bales are round while this sheet's are square-pressed, a real
  shape difference, not just palette. Same reasoning as the two sheets cut earlier today.
- **Sacks continue the existing `sacks_N` series** — burlap-sack shape and tone are close enough
  between the two deliveries that a new descriptor wasn't warranted.
- **Cranes, rope coils, capstans, and the anchor continue their series from today's earlier
  dock-kit delivery** (`crane_N`, `rope_coil_N`, `anchor_N`) — cranes and coiled rope are simple
  enough shapes that style variety reads as intentional variety, not a mismatch, unlike a whole
  tree or building. `capstan` is a new descriptor within `harbour/` for the wood/metal rope-wound
  spool shapes, distinct from the existing simple cylindrical `bollard_N`.
- **`market_stall` and `torch` and `signpost` continue their existing series** (from the
  tropical-island and dock-kit deliveries earlier today) — same general "awning stall"/"lit
  torch"/"wood signpost" concept, close enough in style.
- **Two touching-content compositions kept as one image each**, matching the "trust the pixels"
  rule: `market_crate_1` (a produce crate with a small barrel touching it) and `market_crate_12`
  (two crates touching each other).
- **`combat/` and `items/` get their first-ever entries** (both previously empty).
- **A tiny ~30×30px reddish fragment** (spilled meat/fish near a tipped barrel) was kept and filed
  as `items/fish_scrap_1` rather than discarded as noise — confirmed by direct zoomed inspection to
  be real intentional content (a small piece of flesh), not a stray pixel artifact.

## Verification

Ran the edge-opacity defect scan across all 90 cut files before filing: zero hits. Built and
visually reviewed labeled contact-sheet grids covering every one of the 90 items before filing.

## Wiring

**Not yet wired**, same as the two deliveries earlier today — cutting and filing only.
