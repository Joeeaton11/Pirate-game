# Fortifications Kit — Delivery Manifest

Source: `assets/brand/tileset-catalog/fortifications_kit_v1.png` — a fortifications-and-military
scene kit: lighthouses, watchtowers, a fort/castle, fort walls (incl. a rubble/breached variant
and a gate), turrets, cannons with muzzle-flash/smoke effects and cannonball piles, palisade wall
sections/posts/gates (incl. a skull-topped post), spike barriers, sandbags, wood gates, many
flags/banners (skull-and-crossbones, naval, UK, pennant, striped, plain blue), a gallows/hanging
cage/pillory/skeleton set, decorative banners, harbour hardware (capstans, rope coils, chains, an
anchor), ammo crates/barrels/powder kegs, a cannon rammer, a linstock, war hammers, a target board
(plain and painted), a brazier, a grave marker, and a torch. Uploaded with no accompanying text —
the fourth sheet in the same session, read as a direct continuation of the standing "cut the sheet
into assets for the game scene and environments" request.

Cut 2026-08-24 with the same discipline as every prior delivery: real per-item connected-component
detection, no assumed grid.

## Real defect found and fixed before cutting: same corrupted-alpha issue, fourth time this session

Confirmed the identical defect diagnosed on all three sheets cut earlier this session: the file's
own alpha channel was noisy across the whole image, not just at edges (a supposedly-empty
background patch sampled at wildly varying alpha within itself, while the underlying RGB hue
stayed correct). Fixed the same way — discard the raw alpha, re-derive a clean one via 5×5
median-filter denoise + threshold(128) + light morphological opening (3×3, clears speckle without
eroding real thin content) + Gaussian feather (sigma 0.6) for a naturally anti-aliased edge.

Connected-component detection found 90 real items on the first pass — no fallback splitting or
re-cutting needed.

## 90 sprites filed

| Category | Count | Destination |
|---|---|---|
| Lighthouses | 2 | `landmarks/lighthouse_1..2` |
| Watchtowers | 2 | `landmarks/watchtower_1..2` |
| Fort/castle | 1 | `landmarks/fort_1` |
| Turrets | 2 | `landmarks/turret_1..2` |
| Fort walls | 4 | `landmarks/fort_wall_1..4` |
| Fort wall (rubble/breached) | 1 | `landmarks/fort_wall_rubble_1` |
| Fort gate | 1 | `landmarks/fort_gate_1` |
| Cannons | 3 | `combat/cannon_2..4` (continues today's `cannon_1`) |
| Cannonball piles | 3 | `combat/cannonball_pile_1..3` |
| Cannonballs (loose) | 2 | `combat/cannonball_1..2` |
| Muzzle flash | 2 | `combat/muzzle_flash_1..2` |
| Smoke puff | 2 | `combat/smoke_puff_1..2` |
| Ammo crates | 3 | `combat/ammo_crate_1..3` |
| Ammo barrel | 1 | `combat/ammo_barrel_1` |
| Powder keg | 1 | `combat/powder_keg_1` |
| Powder keg bundle | 1 | `combat/powder_keg_bundle_1` |
| Cannon rammer | 1 | `combat/cannon_rammer_1` |
| Linstock (lit match-holder) | 1 | `combat/linstock_1` |
| War hammers | 2 | `combat/war_hammer_1..2` |
| Palisade wall sections | 3 | `props/palisade_1..3` |
| Palisade posts | 2 | `props/palisade_post_1..2` |
| Palisade skull-topped post | 1 | `props/palisade_skull_1` |
| Palisade gate | 1 | `props/palisade_gate_1` |
| Wood gates | 2 | `props/wood_gate_1..2` |
| Spike barriers | 4 | `props/spike_barrier_1..4` |
| Sandbags | 2 | `props/sandbags_1..2` |
| Gallows | 1 | `props/gallows_1` |
| Hanging cage | 1 | `props/hanging_cage_1` |
| Gallows with skeleton | 1 | `props/gallows_skeleton_1` |
| Pillory | 1 | `props/pillory_1` |
| Banner (skull) | 1 | `props/banner_skull_1` |
| Banner (anchor) | 1 | `props/banner_anchor_1` |
| Banner (crown) | 1 | `props/banner_crown_1` |
| Grapnel | 1 | `props/grapnel_1` |
| Shovel | 1 | `props/shovel_1` |
| Telescope | 1 | `props/telescope_1` |
| Telescope on tripod | 1 | `props/telescope_tripod_1` |
| Tripod stand (bare) | 1 | `props/tripod_stand_1` |
| Mallet stand | 1 | `props/mallet_stand_1` |
| Target board (painted) | 1 | `props/target_board_1` |
| Target board (blank) | 1 | `props/target_board_blank_1` |
| Brazier | 1 | `props/brazier_1` |
| Grave marker | 1 | `props/grave_marker_1` |
| Torch | 1 | `props/torch_3` (continues today's `torch_2`) |
| Market crates | 2 | `props/market_crate_22..23` (continues today's series) |
| Market barrels | 3 | `props/market_barrel_10..12` (continues today's series) |
| Flags — skull-and-crossbones | 3 | `world/flag_skull_pirate_2..4` (continues today's `_1`) |
| Flags — naval | 1 | `world/flag_naval_2` (continues today's `_1`) |
| Flag — UK | 1 | `world/flag_uk_1` (new numbered entry; existing `world/flag_uk.png` is bare) |
| Flag — pennant | 1 | `world/flag_pennant_1` |
| Flag — striped | 1 | `world/flag_stripe_1` |
| Flag — plain blue | 1 | `world/flag_blue_1` |
| Capstans | 3 | `harbour/capstan_6..8` (continues today's series) |
| Rope coils | 2 | `harbour/rope_coil_9..10` (continues today's series) |
| Anchors | 2 | `harbour/anchor_3..4` (continues today's series) |
| Chain segment | 1 | `harbour/chain_2` (continues today's series) |
| Chain hook | 1 | `harbour/chain_hook_2` (continues today's series) |

## Judgment calls

- **New `landmarks/` descriptors for the fortification structures** (`lighthouse`, `watchtower`,
  `fort`, `turret`, `fort_wall`, `fort_wall_rubble`, `fort_gate`) rather than any existing
  `buildings/` series. Checked the existing library before naming: `buildings/lighthouse.png`
  already exists as a bare, unnumbered file and is wired for the Tortuga lighthouse landmark
  (`src/data/landmarks.ts`, `sprite: { category: 'building', id: 'lighthouse' }`). Filing these new
  lighthouse variants to `landmarks/lighthouse_1..2` instead of `buildings/lighthouse_N` avoids any
  collision with that wired reference and keeps the wired asset untouched.
- **`combat/` continues today's series** — `cannon` extends the single `cannon_1` filed earlier
  today from the market/cargo kit (now `_1` through `_4`); `torch` extends `_2` (from the same
  delivery) to `_3`. All other `combat/` descriptors (`cannonball`, `cannonball_pile`,
  `muzzle_flash`, `smoke_puff`, `ammo_crate`, `ammo_barrel`, `powder_keg`, `powder_keg_bundle`,
  `cannon_rammer`, `linstock`, `war_hammer`) are first-ever entries for those specific items —
  `combat/` itself was only opened today (market/cargo delivery) with just the one cannon in it.
- **`harbour/` continues today's series** — `capstan` (from `_5` to `_8`), `rope_coil` (from `_8`
  to `_10`), `anchor` (from `_2` to `_4`), `chain` and `chain_hook` (from `_1` to `_2`) — all
  simple hardware shapes where style variety across sheets reads as intentional, same reasoning
  used throughout today's deliveries.
- **`world/` continues today's flag series where the art matches** — `flag_skull_pirate` extends
  `_1` to `_2..4`, `flag_naval` extends `_1` to `_2`. New descriptors (`flag_uk`, `flag_pennant`,
  `flag_stripe`, `flag_blue`) were minted for flag designs not seen in any prior delivery this
  session; `flag_uk` specifically is numbered (`_1`) rather than folded into the existing bare
  `world/flag_uk.png`, since that file is unnumbered and this is new, separately-sourced art.
- **`props/market_crate` and `market_barrel` continue today's market/cargo series** — a wood
  ammo/cargo crate and barrel in this sheet read as the same weathered-crate style established
  earlier today, not a new fortification-specific design.
- **No fused/touching-content compositions** in this sheet — every item detected cleanly as its
  own connected component, no "trust the pixels" merge calls needed this time.

## Verification

Ran the edge-opacity defect scan across all 90 cut files before filing: zero hits. Built and
visually reviewed labeled contact-sheet grids (4 sheets, ~23 items each) covering every one of the
90 items before classifying, plus a final spot-check render of 10 sample filed files confirming
clean art with no defects or color-tint artifacts.

## Wiring

**Not yet wired**, same as the three deliveries earlier this session — cutting and filing only.
