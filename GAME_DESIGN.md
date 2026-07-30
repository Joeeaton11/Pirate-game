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
- ⬜ Stone equivalent: consumable items that force-promote a crew member outside the normal level
  path — not built
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
- ✅ **v1 side quests**: one bounty quest (Cull the Marsh Viper — confront and defeat a named
  bounty target in battle, faction `bounty`: no permadeath, no recruiting the target, flee
  allowed), one fetch quest (A Toast for the Fallen — deliver a General Store item), and one
  specialty-gated quest (The Locked Vault — needs a Cannon-type crew member **onboard the ship**,
  not just anywhere in the roster, to fulfill). Quest givers are walk-up map markers (📜, same
  proximity-trigger pattern as buildings/forts) with a new SideQuest screen for the
  accept/progress/complete dialogue flow. Proves the "specific skills gate specific quests"
  pillar end-to-end
- ⬜ More side quests per island (escort, resource-gathering, and the rest of the brainstormed
  concepts/styles above) — the v1 pattern (data file + store accept/complete tracking + map
  marker + SideQuest screen) is now proven and ready to extend
- ✅ Quest log / journal UI (the new Quests screen) now lists both Pirate Lord progress and side
  quests with Available/Accepted/Completed status

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
- ⬜ Start-menu equivalent consolidating: Crew Log (Pokédex), Quest Journal, Inventory/Bag, Save,
  Options — right now these are separate screens with no single hub
- ⬜ Party/move-management screen (nicknames, move loadouts)

## Onboarding & Tutorial
- ⬜ Not a current priority, but noted here so it doesn't get lost: a short first-time-only overlay
  sequence teaching drag-to-sail, the heat meter, and that walking into a building enters it —
  a brand-new player has no in-game explanation of any of this right now
- ⬜ Likely a lightweight, skippable, one-time flow rather than a forced walled tutorial, given the
  mobile audience

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

### Now (next up)
9. **Expand side quests + add resource gathering** — more quests from the brainstormed
   concepts/styles list (escort, timed race, recurring board quest, etc.) using the now-proven v1
   pattern, plus gatherable materials (fish/timber/rum/gunpowder) distinct from gold

### Next
10. **Themed island "puzzle" gauntlets before each Pirate Lord fort** — forts are currently a
    direct walk-in-and-fight with no lead-up layer
11. **Ship upgrades as soft gates + reputation-gated ports** — the traversal-gating system the
    open world currently lacks entirely
12. **Pirate Council + final superboss** (Elite Four/Champion equivalent) — natural finale once
    the 5 Lords have side-quest content built around them

### Later
13. **Recurring named rival captain** with scripted story-beat battles (currently just a random
    hostile template)
14. **GTA-style character switching** (biggest, most novel, probably last)
14. Automated test suite, IAP integration, real art asset pipeline, onboarding tutorial —
    pre-launch/production concerns rather than gameplay-loop gaps
