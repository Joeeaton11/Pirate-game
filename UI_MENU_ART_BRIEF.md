# UI & Menus Art Brief

Companion doc for commissioning the game's interface chrome — buttons, panels, bars, icons, badges,
and full-screen overlays. Written 2026-08-17, after the world (map/terrain), characters (Scally,
crew, lords), and backgrounds (30-scene conversation brief) all have real art or a brief in flight.
UI is the one layer still 100% placeholder: every screen below is plain React Native `StyleSheet`
boxes (flat colors, `borderWidth`/`borderColor`) with emoji standing in for icons.

## Why this exists

Audited all 16 screens/components that render UI chrome (`src/screens/*.tsx`,
`src/components/ConversationBox.tsx`, `OnboardingOverlay.tsx`). Only four sprites exist for UI
today, all in `assets/sprites/ui/`: the dialogue parchment, the wood nameplate board, and a skull
badge (all three wired into `ConversationBox` — see `GAME_DESIGN.md` items 196–204), plus a
compass rose that's cut but not yet wired anywhere. Everything else — every button, every progress
bar, every stat/currency icon, every badge, every menu row — is emoji-on-a-colored-box. That's the
gap this brief covers.

## Yes — split into sheets, request separately

Six sheets below, ordered by how much of the app each one touches. Sheets 1–3 are the ones worth
doing first: they're small, cheap, and every other screen leans on them (a button style, once
made, gets reused on all 16 screens; an icon, once made, replaces the same emoji everywhere it
appears). Sheets 4–6 are lower-frequency, higher-detail pieces — fine to commission later, or skip
initially and ship with emoji a while longer if you want to pace the work.

## Paste this once, reuse for every sheet

> Clean pixel-art UI/game-icon illustration for a mobile pirate RPG, matching the painterly
> pixel-art style already used for this game's world and character art — richly detailed, warm,
> slightly desaturated color grading, visible but fine pixel-art texture, not blocky/retro 8-bit,
> not flat vector/"flat design." Caribbean pirate-era materials: aged wood, wrought iron, rope,
> brass, parchment, leather, canvas — no fantasy/sci-fi UI chrome, no glowing neon, no modern
> flat-icon style.
>
> **This is a UI asset, not a scene** — a single object or a small set of related objects on a
> plain background, not an environment. Consistent light source (upper-left) and consistent scale
> across every item on the sheet.
>
> **Background**: flat, single solid color (pure green or pure magenta works best) so it can be
> chroma-keyed out cleanly — not the soft blurred-background convention used for world scenery
> sprites. If your tool can output real alpha transparency directly, that's even better; skip the
> solid-color background entirely in that case.
>
> **Readability at small size**: this will often render as small as 24-40px on a phone screen —
> keep silhouettes bold and simple, avoid fine detail that will just turn to mud once scaled down.
>
> Now generate this specific item/set: [paste one entry below]

---

## Sheet 1 — Buttons & Panels (highest priority — every screen uses these)

Every screen's `Pressable` and card/row container is currently a flat colored `View` — see e.g.
`MenuScreen.tsx`'s hub rows, `CrewScreen.tsx`'s crew cards, `QuestScreen.tsx`'s quest rows,
`TreasureCodexScreen.tsx`'s treasure cards. One reusable button kit and one reusable panel kit
cover all of them.

1. **Primary action button** — a wood-plank or brass-plate button, normal state. Needs to tile/
   stretch cleanly to different widths (either a 9-slice-friendly design with a flat, repeatable
   middle section, or deliver 2-3 width variants: short/medium/wide).
2. **Primary action button — pressed/active state** — same button, visibly recessed/darkened.
3. **Primary action button — disabled state** — same button, desaturated/grayed, no shine.
4. **Danger/attack button** — same kit, red-accented (used for Attack in battle, Steal, other
   aggressive actions).
5. **Small icon-only round button** — for back arrows, close (X), and similar single-glyph
   controls. Normal + pressed states.
6. **Panel/card frame** — a bordered box (parchment-on-wood or iron-cornered plank) for list rows:
   crew cards, quest cards, item rows, treasure entries. Needs a 9-slice-friendly flat middle so it
   can stretch to fit varying row heights/content.
7. **"Unfound"/locked variant of the panel** — a dimmer, desaturated version for not-yet-discovered
   treasure (`TreasureCodexScreen.tsx`'s `cardUnfound` style) and locked quest entries.
8. **Tab/segment selector** — two-way toggle control, active + inactive states, for things like
   `CrewScreen.tsx`'s "Ship's Crew" vs. "Crew Quarters" split.
9. **Confirmation/modal dialog frame** — a larger bordered panel for a centered popup (currently
   nothing like this exists — no `Modal`/`Alert` usage anywhere yet, but it's an obvious near-term
   need for "are you sure?" prompts).

## Sheet 2 — Bars & Meters

Currently all flat colored `View` rects with a colored fill — see `EncounterScreen.tsx`'s `HpBar`
(`hpBarTrack`/`hpBarFill`), and `MapScreen.tsx`'s heat/wanted gauge (`heatTrack`).

1. **HP bar — track** (empty frame) — a riveted-iron or rope-bound gauge housing.
2. **HP bar — fill** — a plain colored/textured strip that sits inside the track; game code already
   swaps its color by HP percentage (green/yellow/red), so this can be a single neutral-textured
   fill, not three separate colored fills.
3. **XP/level progress bar** — same kit language as the HP bar, distinct enough at a glance not to
   be confused with it (a level-up bar isn't drawn anywhere yet, but crew leveling/promotion is a
   real system — see `promotions.ts` — and currently has no visual progress indicator at all).
4. **Heat/Wanted meter** — track + fill, themed toward a "wanted poster"/law-enforcement feel to
   match what it represents (`MapScreen.tsx`'s heat gauge — currently a plain colored track).
5. **Cooldown indicator** — a small radial or linear "recharging" overlay for resource-gathering
   nodes (`resources.ts` cooldowns) — currently no visual at all, just disabled interaction.

## Sheet 3 — Icons: Currency, Resources, Stats & Specialties

Every one of these is currently a raw emoji character in the source. Small, cheap, high-reuse —
each icon replaces the same emoji everywhere it appears across the codebase.

1. **Gold coin** — replaces 💰 (shown constantly, e.g. `MapScreen.tsx`'s header "💰 {gold} gold").
2. **Resource icons** (4): Fish 🐟, Timber 🪵, Rum 🥃, Gunpowder 💥 — see `resources.ts`.
3. **Item icons** (6): Healing Draught 🍶, Powder Charge 💥, a scroll/letter 📜, Ship's Biscuit 🍪,
   a bottle 🍾, a map 🗺️ — see `items.ts` for exact names/flavor to match.
4. **Specialty icons** (5): Blade ⚔️, Musket 🔫, Cannon 💣, Brawler 👊, Curse 🔮 — see
   `EncounterScreen.tsx`'s `SPECIALTY_ICON` map. These badge every crew member's role throughout
   battle and crew screens, so worth getting a clean, consistent set.
5. **Status glyphs** (3): checkmark (quest/objective complete), lock (gated content), X/cancel.

## Sheet 4 — Badges, Ranks & Quest Markers

1. **Crew promotion/rank badge** — a small ribbon or chevron insignia, ideally 2-3 tiers (matching
   `promotions.ts`'s common → uncommon → rare → legendary specialty tiers) so a glance at a crew
   card shows rank without reading text.
2. **Letter of Marque / Pirate Lord badge** — each defeated lord grants a named badge
   (`pirateLords.ts`'s `badgeName`) that boosts stats — currently text-only, no art at all.
3. **Rarity frame/glow** (4): common/uncommon/rare/legendary border treatments for treasure and
   crew cards (`treasures.ts`'s `rarityColor` is currently just a flat border color, no texture).
4. **Quest state markers** (4): available, in-progress, completed, locked — these map to
   `assets/sprites/quest_markers/`, a folder that already exists in the sprite library structure
   but has never had art delivered into it. Used both on map pins and in list rows
   (`QuestScreen.tsx`, `SideQuestScreen.tsx`).

## Sheet 5 — Header & Navigation Chrome

1. **Header bar background** — a wood-plank or iron-banded strip for the top bar shared across
   screens (currently a flat `#0b3d5c`/`#2b1c12` colored `View` in most screens).
2. **Menu hub tile background** — a card frame for `MenuScreen.tsx`'s four hub rows (Crew, Crew
   Log, Quest Log, Treasure Codex — currently plain rows with a single emoji: ⛵ 📖 🎖️ 💎).
3. **Screen title plaque** — reuses the nameplate-board language already established in
   `ConversationBox` (`ui_nameplate_board_1.png`) for consistency — a carved-wood or brass title
   banner for each screen header.
4. **Back/menu button** — a distinct wheel, anchor, or helm-themed icon rather than a generic
   arrow, to fit the nautical UI language.

## Sheet 6 — Full-Screen Overlays

1. **Splash/loading screen art** — the app currently ships Expo's default generic splash icon
   (`assets/splash-icon.png`) — a real branded loading screen would replace it.
2. **Victory banner** — a torn/unfurled pirate-flag or parchment-ribbon graphic for encounter wins
   (`EncounterScreen.tsx` currently shows plain text on the flat battle background).
3. **Defeat/game-over banner** — same kit, somber palette — pairs with permadeath (losing a crew
   member is permanent in this game, so this moment matters).
4. **Onboarding illustration(s)** — `OnboardingOverlay.tsx` walks new players through 3 steps
   (drag-to-sail, walk-in-to-enter, mind your heat) currently illustrated with a single emoji each
   (⛵ 🚪 ⚠️) — real art here would make first impressions much stronger.
5. **Pause/settings backdrop** — no pause/settings screen exists yet, but if one gets built, a
   matching full-screen parchment/wood backdrop keeps it visually consistent with everything else.

---

## Already yours — don't re-order these

`assets/sprites/ui/` already has four cut, ready-to-use assets: `ui_dialogue_parchment_1.png` and
`ui_nameplate_board_1.png` (both wired into `ConversationBox`), `ui_icon_skull_crossbones_1.png`
(wired as a seal/badge), and `ui_icon_compass_rose_1.png` (cut but not yet wired anywhere — a
natural fit for Sheet 5's back/menu button or a map-screen compass widget). Worth checking these
against whatever new sheets come in for style consistency before finalizing a look.

## Suggested order

Sheet 1 (buttons/panels) and Sheet 3 (icons) first — cheapest, and every other screen in the app
immediately looks less placeholder-y once those two land. Sheet 2 (bars) next, since HP/heat are
on-screen constantly during play. Sheets 4-6 whenever — they're real improvements but lower
frequency, and the game functions fine without them for now (same as this brief's counterpart,
`CONVERSATION_BACKGROUNDS_BRIEF.md`, ships gradually rather than all at once).
