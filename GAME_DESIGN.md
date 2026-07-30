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
- ⬜ Crew Log (Pokédex equivalent): track every template you've *seen* vs *recruited*, viewable
  from a menu, with a completion percentage
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
- ⬜ **8ish "Pirate Lords"/Port Governors** as Gym Leader equivalents — each controls a region, has
  a themed crew, and a themed island "puzzle" (navigate a reef maze, solve a smuggler's lock,
  survive a bar brawl gauntlet) before the boss fight
- ⬜ Defeating one grants a **Letter of Marque** (Badge equivalent): permanent stat boost to your
  crew, raises the level at which recruited crew "obey" you (direct obey-mechanic reskin), and
  unlocks a traversal gate (ship upgrade, reputation-gated port, etc.)
- ⬜ Endgame: a **Pirate Council** (Elite Four equivalent) — back-to-back fights, no free healing
  between them — followed by a final Pirate King/Queen or Kraken-type superboss (Champion
  equivalent), credits, then post-game content unlocks
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
- ✅ Permanent crew loss on ambush defeat (arrested/hanged or killed), with gold seizure + heat
  reset on capture
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

## Quests & Main Story (biggest open gap)
- ⬜ Main questline strung through the Pirate Lord fights above, giving the world a spine the way
  Pokémon's Gym order does
- ⬜ Side quests per island (bounties, fetch/deliver, escort, resource-gathering) — this is where
  "specific skills gate specific quests" lives: a quest needs a Navigator-type crew member to
  complete, forcing you to go recruit one
- ⬜ Quest log / journal UI

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

---

## Suggested build order (biggest gaps first, matching what makes it "feel like Pokémon")
1. ✅ **General Store + Item system** — done: Rum Ration, Grapeshot Charge, Forged Papers, buyable
   from shop buildings, usable in battle and (heal) from the Crew screen
2. **Crew Log (Pokédex equivalent)** — small-medium, huge "collect 'em all" motivation payoff
3. **Promotions (evolution equivalent)** — medium, makes leveling feel like Pokémon instead of a
   flat number-go-up
4. **Main quest spine + Pirate Lords (Gym/Badge equivalent)** — large, this is the story backbone
   everything else hangs off
5. Side quests + resource gathering
6. GTA-style character switching (biggest, most novel, probably last)
