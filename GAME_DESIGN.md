# Scallywags — Design Breakdown & Action Plan

A living reference doc mapping our pirate game (working title **Scallywags**) against the
structure of the original Game Boy Pokémon games, so we have a shared, concrete plan to build
against. Legend: ✅ built and tested, 🔄 partially built / needs rework, ⬜ designed but not built.

## Premise & Goal
- ✅ Player becomes a pirate captain, sailing an open world, recruiting a crew
- ⬜ Two parallel goals mirroring Pokédex + League: (1) a **Crew Log** (like a Pokédex — every
  recruitable NPC/species you've met vs. actually recruited, with a completion %), (2) a **main
  questline** ending in becoming a named Pirate Lord/King — the "beat the League" analog
- ⬜ Rival captain (named, recurring) mirrors the Pokémon rival — currently our "Rival Captain" is
  just a random hostile template, not a persistent character

## World & Map Structure
- ✅ One continuous world (not Pokémon's screen-by-screen grid) — 6 islands + open sea, free-roam,
  camera-follow
- 🔄 Currently fully open with no gating at all — Pokémon's world *feels* open but is actually
  gated hard by HMs/Badges. We have zero equivalent gating yet, which makes "danger scales with
  distance from home" the only progression signal. Needs:
  - ⬜ **Ship upgrades as soft gates** (Sea equivalent of HMs): can't survive Serpent's Maw's
    waters without a "Reinforced Hull," can't outrun Navy patrols without a "Swift Rigging," can't
    dive for underwater ruins without a "Diving Bell," etc.
  - ⬜ **Reputation-gated ports**: some islands refuse to let you dock/enter buildings until you
    hold a certain Letter of Marque tier (see Progression below), mirroring Badges gating HM use
- ⬜ More islands over time (currently 6); each should get a distinct identity like Pokémon's
  per-city gimmick (a fog cave, a plantation island, a colonial capital, a pirate-controlled black
  market island, a naval fortress island)
- ⬜ A "Safari Zone" equivalent: a paid-entry, limited-turns treasure island with exclusive rare
  crew/resources and its own catch-without-battle mechanic (e.g., pay coin to attempt recruitment
  via a persuasion mini-game instead of combat)
- ⬜ A post-game superboss zone (Cerulean Cave equivalent): unlocked only after finishing the main
  quest, home to a "Kraken" or legendary pirate-ghost final superboss

## Movement & Exploration
- ✅ **Deliberately not grid-based** — this is our biggest intentional divergence from Pokémon.
  Kingshot-style drag-to-move continuous movement instead of tile-by-tile. Keep this; it's core to
  the pitch.
- ✅ Camera follows player; speed and sprite change between sea (ship) and land (on-foot)
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
- ✅ No hard party-size cap yet (Pokémon caps active party at 6, extra go to PC boxes)
- ⬜ Should add a cap (e.g., 6 "on-ship" active crew) plus a **Crew Quarters / PC-box equivalent**
  for overflow — ties in nicely with a future "ship capacity" upgrade system
- ⬜ Nicknaming crew members (Pokémon lets you rename any caught Pokémon)
- ⬜ Per-crew-member move/skill loadout management screen (currently moves are fixed per template)

## Progression & Story Structure (Gyms/Badges + Elite Four equivalent)
- ✅ **5 named Pirate Lords** as Gym Leader equivalents, one per non-home island (Redbeard Sully →
  Iron Jenny → Captain Bellows → Marietta Graves → Ezra Vane), each a unique boss fort you walk
  into on the map, gated **sequentially** — you can't challenge Lord N until Lord N-1 is defeated
- ⬜ Themed island "puzzle" before each boss fight (reef maze, smuggler's lock, bar brawl gauntlet)
  not built — forts are currently a direct walk-in-and-fight, no puzzle layer yet
- ✅ Defeating a Lord grants a **Letter of Marque** (Badge equivalent): a permanent +3%/badge
  Atk/Def boost applied to your active crew member in every battle, big XP/gold rewards (badge
  fights use the same 'legendary' rarity multiplier as top-tier wild encounters), and unlocks the
  next Lord. Tracked in a **Quest Log** screen (accessible from a new header button on the map)
  showing all 5 with Locked/Available/Defeated status
- ✅ Lord fights disable Flee (you commit to the duel, matching Pokémon's own no-running-from-
  trainer-battles rule) and Recruit (Lords aren't recruitable); losing gives the normal
  faint-and-heal-at-Tortuga outcome, **not** permadeath — that stays reserved for rival/navy
  ambushes since a sanctioned duel isn't the same as being caught unawares
- ⬜ Raising the level at which recruited crew "obey" you (direct obey-mechanic reskin) — not
  built, and not very meaningful yet without a level-cap concept tied to badge count
- ⬜ Traversal gate unlocked per badge (ship upgrade, reputation-gated port) — not built, waiting
  on the ship-upgrade system
- ⬜ Endgame: a **Pirate Council** (Elite Four equivalent) — back-to-back fights, no free healing
  between them — followed by a final Pirate King/Queen or Kraken-type superboss (Champion
  equivalent), credits, then post-game content unlocks. Natural next step after these 5 Lords
- ⬜ Antagonist faction with escalating set-piece confrontations across the story (Team Rocket
  equivalent) — **the Navy is already built for this mechanically** (ambushes scale with heat) and
  just needs scripted story beats layered on top instead of only random encounters
- ⬜ Recurring named rival captain, always one step ahead, type-advantaged crew, battles you at
  fixed story beats

## Evolution equivalent (Promotions)
- 🔄 Currently every crew template is a flat, standalone "species" — no growth *line*. Pokémon's
  evolution hook (a Cabin Hand becoming something visibly better) is one of its most satisfying
  loops and we're not using it yet
- ⬜ Restructure common templates into promotion lines: Cabin Hand (lvl 1-9) → Deckhand Swordsman
  (lvl 10+) → Boarding Captain (lvl 20+ or via item) → a rare named endpoint
- ⬜ Stone equivalent: consumable items ("Captain's Commission," "Cursed Rum," "Letter of Marque")
  that force-promote a crew member outside the normal level path
- ⬜ Trade-evolution equivalent (no multiplayer trading, so reskin it): certain elite crew only
  promote after you **duel and beat a specific named rival captain while that crew member is
  active** — mirrors the "prove it to someone else" flavor of trade evolution without needing a
  second cartridge

## Permadeath & Threat System (no Pokémon equivalent — our differentiator)
- ✅ Heat/wanted meter, rival ambushes, navy ambushes once heat crosses a threshold
- ✅ Permanent crew loss on ambush defeat (pressed into naval service, or taken prisoner by
  rivals — Moderate/Teen framing, not explicit execution), with gold seizure + heat reset on
  capture
- ✅ Roster-wipe rescue (free cabin hand) so players are never permanently soft-locked
- ⬜ This is the system that should carry most of the "GTA" chaos-and-consequence feeling — worth
  leaning into harder than Pokémon ever needed to, since Pokémon has zero permadeath or stakes-of-
  loss

## Economy (Poké Mart equivalent)
- ✅ Gold from battles and quests
- ✅ Gold sinks: building hires and General Store items
- ⬜ Selling looted goods/resources back to shops for gold (Pokémon's sell-half-price mechanic)
- ⬜ Resource gathering (the vision item not yet built): fish/timber/rum/gunpowder as gatherable
  materials feeding crafting or ship upgrades, distinct from gold

## Quests & Main Story
- ✅ Main questline spine: the 5 sequential Pirate Lord fights above now give the world a goal
  structure the way Pokémon's Gym order does. This is the "direction" the game was missing
- ⬜ Side quests per island (bounties, fetch/deliver, escort, resource-gathering) — this is where
  "specific skills gate specific quests" lives: a quest needs a Navigator-type crew member to
  complete, forcing you to go recruit one
- ✅ Quest log / journal UI (the new Quests screen) — currently only tracks Pirate Lord progress;
  will need to expand once side quests exist

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
- ⬜ Start-menu equivalent consolidating: Crew Log (Pokédex), Quest Journal, Inventory/Bag, Save,
  Options — right now these are separate screens with no single hub
- ⬜ Party/move-management screen (nicknames, move loadouts)

## Onboarding & Tutorial
- ⬜ Not a current priority, but noted here so it doesn't get lost: a short first-time-only overlay
  sequence teaching drag-to-sail, the heat meter, and that walking into a building enters it —
  a brand-new player has no in-game explanation of any of this right now
- ⬜ Likely a lightweight, skippable, one-time flow rather than a forced walled tutorial, given the
  mobile audience

## Tone & Content Rating — DECIDED: Moderate / Teen
- ✅ Target Teen/PEGI 12. Permadeath framing is now: navy captures **press crew into naval
  service**, rivals **take crew prisoner** — permanent and stakes-carrying, but no execution
  imagery or gore

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
- ✅ Target ~6-10 hours of main-quest content at launch (leaner than Pokémon's ~20-26 hour
  campaign), designed around short 5-15 minute mobile sessions rather than long sit-downs
- ✅ Difficulty curve: easy/forgiving early (matches Pokémon's own approachability plus our rescue
  mechanic), real tension emerging mid-to-late game as heat rises — that's the differentiator,
  not overall length or raw combat difficulty
- ⬜ Side content/live-ops (events, dailies) intended to extend engagement beyond the main quest
  once there's a content cadence to support it

---

## Suggested build order (biggest gaps first, matching what makes it "feel like Pokémon")
1. ✅ **General Store + Item system** — done: Rum Ration, Grapeshot Charge, Forged Papers, buyable
   from shop buildings, usable in battle and (heal) from the Crew screen
2. ✅ **Main quest spine + Pirate Lords (Gym/Badge equivalent)** — done: 5 sequential named boss
   forts, Letters of Marque with a permanent stat boost, Quest Log screen
3. ✅ **Crew Log (Pokédex equivalent)** — done: unseen/seen/recruited states, completion counter
4. **Promotions (evolution equivalent)** — medium, makes leveling feel like Pokémon instead of a
   flat number-go-up
5. Side quests + resource gathering, island "puzzle" gauntlets before each Pirate Lord
6. Pirate Council + final superboss (Elite Four/Champion equivalent) — natural finale once the
   5 Lords have side-quest content built around them
7. GTA-style character switching (biggest, most novel, probably last)
