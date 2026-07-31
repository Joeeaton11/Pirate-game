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
  - ⬜ **Ship upgrades as soft gates** (Sea equivalent of HMs): can't survive Île Sainte-Marie's
    waters without a "Reinforced Hull," can't outrun Navy patrols without a "Swift Rigging," can't
    dive for underwater ruins without a "Diving Bell," etc.
  - ⬜ **Reputation-gated ports**: some islands refuse to let you dock/enter buildings until you
    hold a certain Letter of Marque tier (see Progression below), mirroring Badges gating HM use
- ✅ **DECIDED: real 17th/18th-century pirate locations, not invented islands.** Each of the 6
  current islands is a real Golden Age of Piracy location, chosen because its real history already
  supplies a distinct per-island identity/gimmick (Pokémon's per-city-gimmick equivalent) that
  matches mechanics already built or already planned, rather than needing an invented hook. See
  the **Island Layout** subsection below for the full list and rationale. Supernatural elements
  (curses, krakens, ghosts) are kept as a folklore layer on top of real places — period sailor lore
  genuinely included ghost ships and sea monsters, so this isn't a contradiction
- ⬜ More islands over time beyond the current 6 + endgame zone — candidates already scouted:
  Cartagena/Havana/Panama/Maracaibo (raid-heist content), Bermuda (supernatural side zone, real
  "Isle of Devils" nickname), the Whydah wreck site off Cape Cod (shipwreck-salvage dive quest),
  Bath NC (real site of Blackbeard's pardon — a narrative hook for the Letter-of-Pardon monetization
  idea below)
- ⬜ A "Safari Zone" equivalent: a paid-entry, limited-turns treasure island with exclusive rare
  crew/resources and its own catch-without-battle mechanic (e.g., pay coin to attempt recruitment
  via a persuasion mini-game instead of combat)
- ✅ A post-game superboss zone (Cerulean Cave equivalent) is now planned at **Ocracoke Inlet**
  (Blackbeard's real base and death site) — see Island Layout below

### Island Layout (real locations, chosen 2026-07-30)
- ✅ **Tortuga** *(home port, unchanged)* — the real historical pirate free port. Stays the safe
  zone / bounty board home
- ✅ **Cow Island (Île à Vache)** — Order 1 Pirate Lord, Blade, Lv.6. A real fleet-muster point
  where green crews assembled before Henry Morgan's raids — a natural "cut your teeth" starting
  zone
- ✅ **New Providence (Nassau)** — Order 2 Pirate Lord, Musket, Lv.9. The real pirate-run republic
  (no crown authority) — gunfights and taverns, fits the musket specialty better than an invented
  island could
- ✅ **Roatán (Bay Islands)** — Order 3 Pirate Lord, Cannon, Lv.12. A real careening/ship-repair
  site — literally a shipyard, which is why the Cannon-specialty-gated side quest lives here
- ✅ **Port Royal** — Order 4 Pirate Lord, Curse, Lv.15. Sank into the sea in a real 1692
  earthquake — the existing "Drowned Widow" lord and her drowned/ghost lore needed almost no
  rewriting, since the real history already matched the invented fiction
- ✅ **Île Sainte-Marie** — Order 5 Pirate Lord (final), Curse, Lv.20. The real remote pirate haven
  tied to the Libertalia legend — the hardest, most exotic challenge before the endgame
- ✅ **Ocracoke Inlet** *(endgame, not yet built)* — Blackbeard's actual base and death site.
  Planned home for the Pirate Council/final-superboss content and a natural convergence point for
  the still-unbuilt recurring named rival captain arc

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
- ✅ **6-crew "on-ship" cap + Crew Quarters (PC-box equivalent)**: recruiting past the cap
  (wild-encounter recruit or building hire) auto-benches the new hire to Crew Quarters instead of
  failing outright; Crew screen shows Ship's Crew and Crew Quarters as separate sections with
  **Send to Quarters** / **Bring Aboard** buttons (always at least 1 onboard — the button is
  disabled rather than letting the ship empty out). Quarters members aren't present during battles:
  the mid-battle crew-switch prompt only offers onboard crew, and if permadeath wipes the entire
  onboard party while Quarters has spares, the next voyage auto-boards one so you're never stuck
  with zero deployable crew
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
- ✅ Traversal gate: **Reinforced Hull** (see Economy below) hard-gates Île Sainte-Marie until
  bought at Roatán — the ship-upgrade traversal gate this bullet was waiting on
- ⬜ Reputation-gated port (beyond the one hull-gated island) — not built
- ⬜ Endgame: a **Pirate Council** (Elite Four equivalent) — back-to-back fights, no free healing
  between them — followed by a final Pirate King/Queen or Kraken-type superboss (Champion
  equivalent), credits, then post-game content unlocks. Natural next step after these 5 Lords
- ⬜ Antagonist faction with escalating set-piece confrontations across the story (Team Rocket
  equivalent) — **the Navy is already built for this mechanically** (ambushes scale with heat) and
  just needs scripted story beats layered on top instead of only random encounters
- ⬜ Recurring named rival captain, always one step ahead, type-advantaged crew, battles you at
  fixed story beats

## Evolution equivalent (Promotions)
- ✅ Level-based promotion lines built from the existing specialty/rarity tiers: **blade**
  (Deckhand Swordsman → Boarding Captain at Lv.10 → Duelist First Mate at Lv.20), **cannon**
  (Powder Monkey → Gun Deck Veteran at Lv.10 → Master Gunner at Lv.20), **musket** (Dockside
  Sharpshooter → Musketeer Marksman at Lv.10), **brawler** (Cabin Hand → Tavern Brawler at
  Lv.10), **curse** (Cursed Bosun → Kraken-Bound Captain at Lv.30). Mixed 2/3-stage lines,
  matching real Pokémon evolution families
- ✅ Promoting swaps templateId + nickname, carries HP forward by the max-HP delta (not reset,
  same continuity Pokémon uses on evolution), and picks up the new template's moves and stats
  automatically since both are looked up live from the template rather than stored per-instance
- ✅ Promoting into a new species marks it seen + recruited in the Crew Log, same as catching it
  directly
- ✅ A Pokémon-style log line on the battle screen ("X is promoted to Y!") when it happens
- ✅ **Stone equivalent**: Captain's Draught, a craft-only consumable (5 Rum, at either shop) that
  force-promotes a crew member to their next stage regardless of level, from a new "Promote" button
  on their Crew screen card. Level is left untouched — only templateId/nickname swap and HP scales
  by the max-HP delta, same as the normal level-based path, matching how Pokémon's own stone
  evolutions don't touch level either
- ⬜ Trade-evolution equivalent (no multiplayer trading, so reskin it): certain elite crew only
  promote after you **duel and beat a specific named rival captain while that crew member is
  active** — mirrors the "prove it to someone else" flavor of trade evolution without needing a
  second cartridge. Not built

## Permadeath & Threat System (no Pokémon equivalent — our differentiator)
- ✅ Heat/wanted meter, rival ambushes, navy ambushes once heat crosses a threshold
- ✅ Permanent crew loss on ambush defeat (pressed into naval service, or taken prisoner by
  rivals — Moderate/Teen framing, not explicit execution), with gold seizure + heat reset on
  capture
- ✅ Roster-wipe rescue (free cabin hand) so players are never permanently soft-locked
- ✅ This is the system carrying the "GTA" chaos-and-consequence feeling — now backed by real
  choices with stakes: ship plundering and shop theft (see Economy below) both spend heat
  deliberately for gold/resources, rather than heat only ever being something to avoid

## Economy (Poké Mart equivalent)
- ✅ Gold from battles and quests
- ✅ Gold sinks: building hires and General Store items
- ✅ **Resource gathering v1 (core loop)**: Fish, Timber, Rum, and Gunpowder are gatherable
  materials distinct from gold, each with a real-location home — Fish at Tortuga, Timber at
  Roatán (real careening yard), Rum at New Providence (real rum-running history), Gunpowder at
  Port Royal (real naval magazine). A resource node is a map marker like a building, but gathers
  **passively while walking through** rather than stopping to open a screen — a small random
  yield plus a real-time cooldown (first wall-clock-based mechanic in the game; ties naturally to
  the existing time-saver IAP philosophy for a future "instant refresh" purchase). Sold at the two
  existing shop buildings (Harbor Trading Post, Smuggler's Den) via a new Sell Resources section;
  held resources shown in a new Cargo Hold section on the Crew screen. This also closes the
  previously-open "sell loot back to shops" gap
- ✅ **Crafting**: a Craft section at the same two shops turns resources into items instead of
  gold — 2 Rum → Rum Ration, 3 Gunpowder → Grapeshot Charge, and 5 Rum → Captain's Draught (see
  Evolution equivalent above). A second resource sink alongside selling, using the existing Item
  system rather than a new one
- ✅ **The crime layer**: two new ways to make gold "the hard way," both feeding heat directly —
  - **Ship plundering**: a new `merchant` encounter faction, rolled only over open sea alongside
    the existing wild/rival/navy checks. Four weak, non-combatant merchant templates (Fishing
    Trawler, Timber Galleon, Rum Runner, Powder Hulk), each tied to one resource. Victory pays gold
    **and** cargo, but adds +10 heat — visibly more than a normal wild fight, since robbing
    civilian shipping is a step past fighting other criminals. No recruiting the crew, no
    permadeath on a loss, flee always available
  - **Shop theft**: four new resource-themed buildings (Fishmonger's Stall/Tortuga, Distillery/New
    Providence, Timber Yard/Roatán, Armoury/Port Royal) where you can buy the resource honestly
    (gold, safe) or steal it (free, cooldown-gated like a gather node). Stealing always succeeds at
    getting the goods; a random "caught" check only decides whether the heat spike is small (clean
    grab) or large (caught red-handed) — never an outright failure. `Building.recruit` became
    optional to support shops with no NPC to hire
- ✅ **Ship Upgrades**: a gold-and-resource sink at Roatán's Smuggler's Den (already the real
  careening/shipyard island) that finally gives Timber, Rum, and Gunpowder the "feeds crafting or
  ship upgrades" purpose promised early on, and gives Fish something beyond selling (Ship's
  Biscuit, a cheap weaker heal craftable from 3 Fish). Three one-time purchases, each permanent
  once bought:
  - **Reinforced Hull** (150g + 15 Timber) — a **hard gate**: Île Sainte-Marie's waters are
    impassable without it, matching the design doc's own "ship upgrades as soft gates (Sea
    equivalent of HMs)" framing — Pokémon HMs are genuine hard blocks, so this is the literal
    version rather than a discount on an encounter roll
  - **Swift Rigging** (120g + 12 Rum) — halves the Navy ambush chance everywhere, permanently
  - **Diving Bell** (100g + 10 Gunpowder) — unlocks a salvage site among Port Royal's sunken
    ruins: a one-off passive gold windfall (25-50g) on a cooldown, gathered the same
    walk-through-it way as a resource node, but paying out gold instead of a resource since it's a
    treasure dive, not a materials gather
- ⬜ **Economy polish (not yet built)**: per-island price variance for real trade routes,
  resource-cost recruits, resource-based fetch quests

## Quests & Main Story
- ✅ Main questline spine: the 5 sequential Pirate Lord fights above now give the world a goal
  structure the way Pokémon's Gym order does. This is the "direction" the game was missing
- ✅ **v1 side quests**: one bounty quest (Cull the Cattle Rustler, Cow Island — confront and
  defeat a named bounty target in battle, faction `bounty`: no permadeath, no recruiting the
  target, flee allowed), one fetch quest (A Toast for the Fallen, New Providence — deliver a
  General Store item), and one specialty-gated quest (The Locked Vault, Roatán — needs a
  Cannon-type crew member **onboard the ship**, not just anywhere in the roster, to fulfill).
  Quest givers are walk-up map markers (📜, same proximity-trigger pattern as buildings/forts)
  with a new SideQuest screen for the accept/progress/complete dialogue flow. Proves the
  "specific skills gate specific quests" pillar end-to-end
- ✅ **Escort quest** (Escort the Merchant Convoy, Port Royal): a back-to-back wave gauntlet
  (2 waves, no healing between) — confront-per-wave via the same `bounty` encounter faction,
  progress tracked in `questWaveProgress`, only completes (and pays out) after the final wave;
  losing a wave doesn't reset progress, just retries that wave
- ✅ **Repeatable heat-bounty quest** (The Bounty Board, Tortuga Cove): combines two brainstormed
  concepts — the recurring board quest style and the bounty-with-heat-payoff idea. Confronting
  picks a random rival/navy target; each win pays gold **and** reduces heat, and the quest never
  enters `completedQuestIds` — it stays open indefinitely, tracked instead via a
  `questTurnInCounts` counter, so heat management becomes an active, repeatable choice rather than
  only fleeing and waiting
- ⬜ More side quests per island (resource-gathering, and the rest of the brainstormed
  concepts/styles above) — the pattern (data file + store accept/complete tracking + map
  marker + SideQuest screen) is now proven across one-shot, multi-stage, and repeatable quests
- ⬜ **Prisoner rescue** (deferred, needs its own build): the store currently deletes a permadeath
  victim's data entirely, so there's nothing to reference for a "rescue this specific crew member"
  quest yet — building this for real means persisting captured-crew identity in `removeCrewMember`
  first, which is a bigger, separate feature from the rest of this list
- ✅ Quest log / journal UI (the new Quests screen) now lists both Pirate Lord progress and side
  quests with Available/Accepted/Completed status (heat-bounty shows "Open · N turned in" instead,
  since it never reaches a terminal Completed state)

### Side Quest Concepts (brainstormed)
- ⬜ **Smuggling runs** — timed delivery of contraband cargo; a navy patrol encounter en route adds
  heat on top of losing the goods, turning the heat system into an active quest risk
- ⬜ **Prisoner rescue** — since permadeath already frames losses as "captured"/"imprisoned" rather
  than killed, a later quest could let you break a *specific* named crew member back out of a navy
  fort or rival camp — gives permadeath a narrative payoff, not just a stat loss
- ⬜ **Bounty board with heat payoff** — turn in defeated rival/navy targets for gold *and* a heat
  reduction, making bounty hunting a deliberate way to cool off instead of only fleeing and waiting
- ⬜ **Buried treasure maps** — already stubbed as a General Store item; sell as a map-marker + dig
  quest rather than an instant reward, giving a reason to sail somewhere new
- ⬜ **Specialty-gated hidden areas** — HM-reskin: a sealed cave needs a Cannon-type to blast open,
  a locked door needs a Blade-type to force — same "recruit to progress" idea, applied to
  exploration instead of just quest-gating
- ⬜ **Crew loyalty questline** — a personal backstory quest tied to one specific recruited crew
  member (old captain, a debt, a grudge); completing it grants a small permanent bonus. Reuses the
  "prove it to a rival captain" trade-evolution idea as its own side content
- ⬜ **Weather-gated resource nodes** — once the (currently unbuilt) weather system exists: rum/fish
  easier to gather in calm weather, storms make gathering riskier but higher-yield — a "later" hook

### Mini-Quest Styles (mechanical archetypes, not tied to one concept above)
- ⬜ **Escort/protect** — guard an NPC ship through a zone; encounter rolls still fire, but you're
  defending them, failing if they take too much damage before making port
- ⬜ **Timed race** — a regatta or delivery deadline between two points; pure movement/navigation
  test, no combat at all
- ⬜ **Clear-the-area** — defeat N enemies in a zone rather than one named target; cheap filler
  content generated from existing threat templates
- ⬜ **Defend-the-port** — survive a wave of incoming navy/rival attackers at Tortuga Cove itself,
  inverting the usual "you're the aggressor" framing
- ⬜ **Infiltration/heist** — sneak into a manor/fort and get out without triggering a fight, rather
  than winning one; a natural setup for GTA-style character switching (see below)
- ⬜ **Branching/moral choice** — help the rival crew or turn them in to the Navy; no clean right
  answer, each path changes heat/reputation differently rather than just paying out gold
- ⬜ **Rival race** — a named rival crew is chasing the same prize; first to reach it wins, adding
  urgency without adding a new mechanic
- ⬜ **Investigation** — talk to a string of NPCs to piece together a clue before acting, rather
  than fighting or gathering; dialogue-only, detective-lite
- ⬜ **Recurring board quest** — a repeatable, low-narrative bounty/gather quest that resets; this
  is the side-content-for-engagement gap already flagged under Scope & Pacing

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
- ✅ **Start-menu equivalent**: a new Menu screen (☰ Menu button on the Map header, replacing the
  separate Quests/Crew buttons that were starting to crowd the header) consolidating Crew Roster,
  Crew Log (Pokédex), and Quest Log into one hub with live counters (crew count, recruited X/Y,
  Pirate Lords defeated X/Y). Inventory/Bag, Save, and Options aren't separate screens yet — Bag
  is folded into the Crew screen (Cargo Hold) and Item usage; Save/Options don't exist as concepts
  yet
- ⬜ Party/move-management screen (nicknames, move loadouts)

## Onboarding & Tutorial
- ✅ **First-launch overlay**: a lightweight, skippable, 3-step overlay (Drag to Sail / Walk Right
  In / Mind Your Heat) shown once on a fresh save, gated by a persisted `hasSeenOnboarding` flag.
  Skippable at any step via a Skip button, or steps through to a "Got it, let's sail!" CTA on the
  last step — either path marks it seen permanently. Resetting the save (Debug screen) also resets
  this flag, so it can be re-tested without a fresh install
- ⬜ No day/night or weather-specific onboarding beats yet (not needed until those systems exist)

## Testing & QA
- ✅ **Dev debug panel**: a `__DEV__`-gated Debug screen (🛠 button on the Map, stripped from
  production builds) for fast manual QA without grinding — jump any crew member to a level
  (cascades promotions correctly), add gold, set heat, force a wild/rival/navy encounter, jump
  straight to any Pirate Lord fort, heal the whole crew, or wipe the save back to a fresh start
- ✅ **Convention**: features get verified in-browser (Expo web build, Playwright + Chromium)
  before being called done, not just type-checked. Run the dev server with
  `npx expo start --web --port 8081` — **not** `CI=1`, which disables Metro's file-watcher/cache
  invalidation and serves stale bundles
- ✅ For logic too RNG-fragile to reliably trigger through the UI (e.g. grinding a real crew member
  to a specific level), an isolated script run via `npx tsx` that imports and exercises the real
  exported functions directly is an acceptable substitute — used once for verifying promotions
- ⬜ No automated test suite (unit or e2e) yet — everything above is manual, ad hoc, and doesn't
  run in CI. Worth adding once the core loop stabilizes enough that regressions become a real risk
  rather than a hypothetical one

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

### Done
1. ✅ **General Store + Item system** — Rum Ration, Grapeshot Charge, Forged Papers, buyable
   from shop buildings, usable in battle and (heal) from the Crew screen
2. ✅ **Main quest spine + Pirate Lords (Gym/Badge equivalent)** — 5 sequential named boss
   forts, Letters of Marque with a permanent stat boost, Quest Log screen
3. ✅ **Crew Log (Pokédex equivalent)** — unseen/seen/recruited states, completion counter
4. ✅ **Promotions (evolution equivalent)** — level-based promotion lines across all 5
   specialties, HP/moves/stats carry over automatically, Crew Log + battle log integration
5. ✅ **Dev debug/QA panel** — `__DEV__`-gated Debug screen reachable from a 🛠 button on the
   Map, with level-jump, gold, heat, force-encounter (wild/rival/navy), jump-to-Pirate-Lord-fort,
   and reset-save shortcuts for fast manual testing without grinding
6. ✅ **Mid-battle crew switch on faint** — fainting a crew member with a healthy bench member
   available now prompts a switch instead of always ending the battle (permadeath still applies for
   navy/rival ambushes regardless — only the *battle outcome* changes, not the removal); battle only
   ends outright when no healthy crew member remains
7. ✅ **Party cap + Crew Quarters (PC-box equivalent)** — 6-crew onboard cap, overflow auto-benched
   to Crew Quarters, Send to Quarters / Bring Aboard in the Crew screen, mid-battle switch limited
   to onboard crew, auto-refill from Quarters if the whole onboard party is wiped by permadeath
8. ✅ **v1 side quests** — one bounty, one fetch, one specialty-gated quest, proving the
   data-file + store-tracking + map-marker + dedicated-screen pattern end-to-end
9. ✅ **Escort + repeatable heat-bounty quests** — a 2-wave escort gauntlet and a repeatable
   bounty-board quest with heat payoff, proving the pattern also handles multi-stage and
   never-terminally-completed quests, not just one-shot ones
10. ✅ **Resource gathering v1** — Fish/Timber/Rum/Gunpowder gatherable from real-location map
    nodes (passive, cooldown-gated) and sellable at existing shop buildings; Cargo Hold on the
    Crew screen
11. ✅ **Resource sinks: crafting + promotion stones** — a Craft section at the same two shops
    (2 Rum → Rum Ration, 3 Gunpowder → Grapeshot Charge, 5 Rum → Captain's Draught), plus the
    Draught itself as the "stone equivalent" force-promotion from the Crew screen — both reused
    the existing Item/Promotion systems rather than adding new ones
12. ✅ **The crime layer: ship plundering + shop theft** — a new `merchant` sea encounter (gold +
    cargo, +10 heat, no recruit/permadeath) and a steal option at 4 new resource-themed shops
    (free, cooldown-gated, heat spike bigger if caught) — the "GTA chaos" pillar's first real
    teeth beyond the existing rival/navy ambush system
13. ✅ **Ship Upgrades (traversal gate + more resource sinks)** — Reinforced Hull (hard-gates Île
    Sainte-Marie), Swift Rigging (halves Navy ambush chance), and Diving Bell (unlocks a passive
    gold-salvage site at Port Royal), all bought at Roatán's Smuggler's Den; plus Ship's Biscuit
    finally gives Fish a craft use beyond selling
14. ✅ **Menu hub + first-launch onboarding** — a new Menu screen consolidating Crew/Crew
    Log/Quest Log behind a single ☰ Menu button (replacing two separate header buttons that were
    starting to crowd the Map), plus a skippable 3-step first-launch overlay covering drag-to-sail,
    walking into buildings, and the heat meter. Both were UX-debt items flagged in a design review
    rather than gameplay-loop gaps, tackled now while the mechanic surface area is still small
    enough to retrofit cheaply

### Now (next up)
15. **Prisoner rescue** — needs `removeCrewMember` to persist captured-crew identity first (it
    currently just deletes it), so a rescue quest has something real to reference
16. **Pirate Council + final superboss** (Elite Four/Champion equivalent) — gives the 5-Lord spine
    an actual ending state; prioritized ahead of more side content so there's a completable game to
    point playtesters at
17. **More side quests from the brainstormed concepts/styles list** — timed race, clear-the-area,
    investigation, etc.; cheap to add now that one-shot/multi-stage/repeatable are all proven
    patterns

### Next
18. **Economy polish** — per-island resource price variance for real trade routes, resource-cost
    recruits, resource-based fetch quests
19. **Themed island "puzzle" gauntlets before each Pirate Lord fort** — forts are currently a
    direct walk-in-and-fight with no lead-up layer
20. **Reputation-gated ports** — beyond the one hull-gated island, more traversal gating tied to
    heat/reputation rather than a one-time purchase
21. **A pure-logic unit test suite for `gameStore`** (no rendering) — cheap relative to new
    systems, and increasingly worth it now that permadeath, crime, quests, and ship upgrades all
    touch shared state (heat/gold/resources) simultaneously

### Later
22. **Recurring named rival captain** with scripted story-beat battles (currently just a random
    hostile template)
23. **GTA-style character switching** (biggest, most novel, probably last)
24. Full e2e test automation, IAP integration, real art asset pipeline —
    pre-launch/production concerns rather than gameplay-loop gaps
