# Scallywags — Design Breakdown & Action Plan

A living reference doc mapping our pirate game (working title **Scallywags**) against the
structure of the original Game Boy Pokémon games, so we have a shared, concrete plan to build
against. Legend: ✅ built and tested, 🔄 partially built / needs rework, ⬜ designed but not built.

## Premise & Goal
- ✅ Player becomes a pirate captain, sailing an open world, recruiting a crew
- ✅ **Player character has a fixed identity — Captain Scally, with sidekick Cheeky the monkey**
  (built 2026-07-31, from the "Scallywags" brand style guide). `src/data/protagonist.ts` holds
  the shared name/emoji constants. Named on the onboarding overlay (narrated in Scally's voice)
  and the Menu screen header ("Captain Scally's Log" / "Cheeky is minding the ship"); the on-land
  player token swapped from a generic `🧍` to a walking-man glyph (see Movement & Exploration for
  the 2026-08-01 animation pass) so it visually reads as Scally rather than an anonymous figure.
  Cheeky is flavor-only — deliberately **not** a mechanical crew member, so the
  permadeath/heat system (navy press-gangs, rival capture) applies uniformly with no named-character
  exemption to design around. Per the branding decision below, this is packaging on top of the
  existing systems, not a rewrite of them — no mechanics changed
- ⬜ The other 5 named crew from the brand sheet (Polly, Big Beard Bill, Tiny Tim, Captain Blackfin,
  Admiral Grace) are intentionally **not** mapped to specific in-game NPCs/recruit templates yet —
  left as external brand assets until there's a concrete reason to wire one in (e.g. a specific
  recruit template reskin, a rival, a Pirate Lord). **Update 2026-08-10: that reason now exists —
  see Main Story Arc immediately below.** Blackfin and Grace are cast as the rival captain and
  Navy antagonist respectively; the other 3 (Polly, Big Beard Bill, Tiny Tim) stay unassigned
- ✅ Three parallel goals mirroring Pokédex + League (+ a second "catch 'em all" layer): (1) a
  **Crew Log** (like a Pokédex — every recruitable NPC/species you've met vs. actually recruited,
  with a completion %), (2) a **main questline** ending in becoming a named Pirate Lord/King — the
  "beat the League" analog, (3) a **Treasure Codex** — a parallel collection catalog of individually
  named treasure items, same completion-% shape as the Crew Log. See Main Story Arc below for both
  the now-decided main-questline objective and the new Treasure Codex design
- ⬜ Rival captain (named, recurring) mirrors the Pokémon rival — currently our "Rival Captain" is
  just a random hostile template, not a persistent character. **Designed 2026-08-10: this is
  Captain Blackfin — see Main Story Arc below.** Not built yet (no code changes from this pass;
  this is a pure narrative-design session, deliberately kept separate from implementation so the
  story gets decided once rather than being invented ad hoc quest-by-quest)

## Main Story Arc (designed 2026-08-10 — build started 2026-08-10: the Treasure Codex, section 6,
and Act I.A's Blackfin intro are now live; everything else below is still narrative design only)
A direct answer to "what's the ultimate objective, and what's the story that gets you there,"
requested explicitly so future quest content has a spine to hang off instead of being invented
one quest at a time. Every named beat below is new **framing** around systems that already exist
(the 6 Lords, heat/Navy, permadeath, the Pirate Council) — nothing here requires new game
mechanics, only new dialogue/encounters using the existing `lord`/`navy`/`rival` factions plus two
newly-named recurring characters pulled from the brand sheet. Reference beats by their number/letter
(e.g. "III.B", "Antagonists.A.2") rather than re-describing them elsewhere.

### 1. Ultimate Objective
**Become the uncrowned Pirate King (or Queen) of the Caribbean — recognized by all six Pirate
Lords, still standing when the Crown comes to end you, and the one name left when your rival's
isn't.** Concretely, that's the win condition the game already has (defeat all 6 Lords via the
Pirate Council → Blackbeard), but stated as a story rather than a checklist: the six Letters of
Marque were never royal paperwork — no king signed them. They're each Lord's own private
recognition that you're worth reckoning with, extracted one duel at a time from people who don't
hand out respect. Collecting all six means every power broker in the Caribbean has personally
conceded you've earned your name. Blackbeard, the seventh and hardest "yes," is the only one who
gets to make that call twice — first by letting the Council vouch for you, then by seeing for
himself. Two things are trying to stop that from happening, and neither of them is a wild
encounter roll:
   - **A.** The Crown, in the person of Admiral Grace, who intends to end the golden age of
     piracy before it produces another Blackbeard — and you are visibly trying to become one
   - **B.** Captain Blackfin, a rival captain chasing the exact same six marques, for the exact
     same reason, and not particularly interested in being second

### 2. Named Antagonists
Both pulled from the existing brand sheet (see Premise & Goal above) rather than invented fresh —
they were flagged as "waiting for a concrete reason to wire in," and this is that reason.

**A. Admiral Grace — "the Crown"**
   1. A Royal Navy admiral, not a random patrol captain — the human face already implied by every
      `navy` encounter and every heat-triggered ambush. She doesn't appear in early low-heat play;
      she's what "the Navy" turns out to mean once you're worth her personal attention
   2. Her campaign is historically grounded rather than invented: 1717-1718 was the real Crown
      crackdown on the pirate republic at Nassau (New Providence — already the Order-2 Lord's
      island in this game), led by a real governor who offered pirates the King's Pardon or the
      noose. Grace is that campaign's in-fiction face, not a 1:1 historical figure — same
      "folklore layer on real places" approach already decided for Port Royal's ghosts and
      Ocracoke's Blackbeard
   3. **The Pardon beat**: at some point after Lord 3 or 4, Grace offers Scally a Letter of
      Pardon in person — walk away now, surrender any captured intel, and live free of the noose.
      This is the branching-choice mini-quest style already brainstormed (see Side Quest Concepts)
      finally given a face and stakes. Refusing (the expected heroic path) is what turns her from
      "the heat system" into a direct antagonist for the endgame; nothing mechanical forces the
      refusal, so a player who takes the pardon should get a distinct (short, non-punishing)
      alternate flavor beat instead of just being blocked — exact handling TBD when this gets
      built, flagging it now so it isn't forgotten
   4. **Finale**: Grace's fleet converges on Ocracoke Inlet at the same moment as the Pirate
      Council showdown — the real Blackbeard was killed there in 1718 by a Royal Navy expedition,
      so having the Crown arrive to try to end both Blackbeard and Scally in the same stroke isn't
      an invented coincidence, it's the actual history the game already committed to. This is the
      natural climax for "Antagonist faction with escalating set-piece confrontations" (previously
      an unassigned ⬜ bullet under Progression & Story Structure)

**B. Captain Blackfin — "the Rival"**
   1. A rival pirate captain, introduced at Tortuga before Lord 1 is even challenged (mirrors the
      Pokémon rival's day-one appearance) — established immediately as chasing the same six
      marques, for the same reason, openly framing this as a race
   2. Recurring structure: after each Lord fight (Acts II-V below), Blackfin is waiting at the
      *next* island, having gotten there first — sometimes having already fought that Lord and
      lost, sometimes just scouting. "Always one step ahead," per the original wishlist bullet,
      reframed as "always arriving one step ahead of you, not one step ahead in skill" — he loses
      to the Lords too, which is why the race stays close instead of making him feel unbeatable
   3. Optional duels at each reappearance (reuses the existing `rival` encounter faction as-is —
      no new mechanic) rather than mandatory fights, matching the "mandatory path is exactly the
      5 Lords → Council → Blackbeard, nothing else" scope decision. Beating Blackfin doesn't grant
      a marque; it's rivalry/flavor payoff, same tier as a side quest
   4. **Finale**: Blackfin reaches Ocracoke ahead of the Council, tries Blackbeard himself, and
      loses — the player arrives to find him humbled rather than triumphant. Whether he then helps
      against Grace's fleet (2.A.4) or just steps aside is the last open story beat, left
      undecided until the endgame sequence actually gets built

### 3. The Storyboard
One act per mandatory Lord fight, in existing sequence order. "Terrain/Challenge" is the
*flavor* of the encounter leading up to each Lord — not a new mechanic, just which of the
already-built backdrop themes (town/jungle/beach/sea/fort/jail, see Battle System) and challenge
shape (straight fight vs. the still-unbuilt puzzle-gauntlet idea) each island leans into, so the
run from Cow Island to Ocracoke actually *feels* different leg to leg instead of six reskinned
copies of the same boss fight. See section 4 for the full terrain map.

**Act I — Cow Island (Redbeard Sully, Order 1)**
   - **A.** ✅ **Built 2026-08-10.** Prologue at Tortuga: Blackfin introduced, taunts Scally into
     proving himself, sets off for Cow Island first. `src/data/blackfin.ts` models Blackfin as a
     sequence of `BlackfinStage` entries (one per future Act appearance — only this first one is
     populated), rendered on the map as a 🦈 marker at Tortuga's docks (near the quay, offset
     `{170, -255}`) that disappears once visited. Walking up to it navigates to a new dedicated
     `BlackfinScreen` (modeled on `PirateLordScreen`'s header/dialogue-card layout, minus the
     Challenge button — this stage is dialogue-only, no fight, per 3.B.3) showing his 3-line taunt,
     then marks the stage complete via `gameStore`'s new `completedBlackfinStageIds` state. Verified:
     `tsc` clean, jest 42/42 (3 new: idempotent completion, current-stage tracking, reset clears
     both), and a live Playwright pass (Debug-screen jump → dialogue renders correctly → Continue
     marks it complete with zero console errors). Acts II-VI's Blackfin appearances (the optional
     duels, starting at New Providence) are unbuilt — the `fightable` field on `BlackfinStage`
     exists for them but nothing wires it up yet
   - **B.** Cow Island itself plays as a straightforward physical trial — a fleet-muster ground,
     jungle/beach terrain, the "cut your teeth" island by design already. No puzzle layer yet;
     this act is deliberately the plainest one, establishing baseline difficulty before the game
     starts varying challenge shape
   - **C.** Defeat Sully, take the Muster Marque. Blackfin isn't here yet — he shows up waiting at
     New Providence instead (I.A pays off in II.A)

**Act II — New Providence (Iron Jenny, Order 2)**
   - **A.** ✅ **Built 2026-08-11.** Blackfin is already at New Providence, smug about beating you
     there — first optional rival duel available. Added as `blackfin_new_providence_duel`
     (`fightable: true`, Lv.8 — between Sully's 6 and Jenny's 9) in `src/data/blackfin.ts`, with a
     shared `BLACKFIN_TEMPLATE` (blade specialty, boarding_rush + cutlass_slash) kept out of
     `crew.ts` since he's never recruitable, same as a Pirate Lord. `BlackfinScreen` now branches on
     `stage.fightable`: an unfought fightable stage shows "⚔️ Duel" (sets a `wildEncounter` with
     `faction: 'rival'` and a new `blackfinStageId` field, backdrop `'town'`) alongside "Not Today"
     (leaves without marking the stage complete, so the marker stays and you can come back later).
     Reuses the `rival` faction exactly as designed in 2.B.3 — same permadeath risk as any other
     rival ambush, no new mechanic, no marque on a win. `EncounterScreen` special-cases
     `blackfinStageId` on victory: a bespoke opening line, his own `victoryLine` in the resolution
     card instead of a generic "X is defeated," and calls `completeBlackfinStage` so the map marker
     disappears once he's actually beaten (not just talked to). Verified: `tsc` clean, jest 42/42,
     and a full live Playwright duel (Lv.25 crew vs. his Lv.8 — "Not Today" leaves the stage
     available, then the real duel resolves with his custom victory line, XP, and gold, zero
     console errors)
   - **B.** ✅ **Built 2026-08-11.** Grace introduced here specifically, not earlier — this is
     the real historical pirate republic, so her crackdown campaign starting exactly where it
     started historically is the whole point (2.A.2). A scripted Navy patrol/dialogue beat, not yet
     a direct confrontation — added as `grace_new_providence_intro` in the new
     `src/data/grace.ts`, deliberately mirroring `blackfin.ts`'s stage-sequence shape (one data
     entry per Act appearance) but dialogue-only throughout: per 2.A.3/2.A.4 her escalation is the
     still-unbuilt Pardon beat and the Ocracoke finale, not a fight, so `GraceStage` has no
     `fightable` field at all yet. A new `GraceScreen` (measured, formal tone — deliberately
     colder than Blackfin's swagger, `#101825` vs. his `#1a1420`) shows her three-line "I'm watching
     you" introduction; the map marker (🫡) and walk-up trigger are the same one-time-visit pattern
     as every other story-beat marker. Verified: `tsc` clean, jest 45/45 (3 new, mirroring
     Blackfin's: idempotent completion, current-stage tracking, reset clears both), and a live
     Playwright pass (Debug jump → all 3 dialogue lines render → Continue marks it complete, zero
     console errors)
   - **C.** New Providence plays as a social/urban gauntlet through the Republic's taverns and
     streets (town terrain) — swagger and gunfights rather than Cow Island's straight muster trial
   - **D.** Defeat Jenny, take the Queen's Marque

**Act III — Roatán (Captain Bellows, Order 3)**
   - **A.** ✅ **Built 2026-08-11.** Blackfin reappears, having tried Bellows and lost — first crack
     in his confidence. Added as `blackfin_roatan_reappearance` (fightable, Lv.11 — between Jenny's
     9 and Bellows' 12, fort backdrop) with a rattled-not-cocky tone shift in his dialogue and his
     own victory line reflecting the crack widening. Pure data addition on the pattern from II.A —
     no new code needed. Verified: `tsc` clean, jest 45/45, live duel resolves correctly with zero
     console errors
   - **B.** Roatán plays as a mechanical puzzle before the fight — a careening-yard/shipyard
     challenge (align capstans, clear a drydock gate) fitting the island's real function as a
     repair site, and echoing the already-built Cannon-specialty-gated Locked Vault quest that
     lives here. This is the first island to use the "themed puzzle before the boss" idea
     (previously an unassigned ⬜ bullet under Progression & Story Structure) rather than a direct
     walk-in fight
   - **C.** Defeat Bellows, take the Roatán Marque

**Act IV — Port Royal (Marietta Graves, Order 4)**
   - **A.** The Pardon beat (2.A.3) lands around here or Act V — Grace offers Scally a way out.
     Declining hardens her arc for the endgame
   - **B.** Port Royal plays as exploration/curse terrain — a reef maze through the drowned city's
     sunken streets (the other previously-unassigned "themed puzzle" idea), heavy on the ghost
     lore that's already written for Marietta Graves rather than a straight fight
   - **C.** ✅ **Built 2026-08-11.** Blackfin reappears once more, rattled — the drowned city
     unsettles him more than any fight has. Added as `blackfin_port_royal_reappearance` (fightable,
     Lv.13 — between Bellows' 12 and Graves' 15, jail backdrop for the eerie ruins). This crack is
     superstitious dread rather than a fight loss — his dialogue leans on the drowned city itself,
     and his victory line blames "this place" rather than admitting he's slipping. Pure data
     addition on the pattern from II.A/III.A. Verified: `tsc` clean, jest 45/45, live duel resolves
     correctly with zero console errors
   - **D.** Defeat Graves, take the Widow's Marque

**Act V — Île Sainte-Marie (Ezra Vane, Order 5, final sequential Lord)**
   - **A.** Vane's own existing dialogue already calls this "the sea's about to prove you're not [the
     real thing]" and references a whirlpool — play that literally: a mystical trial, a scripted
     run of back-to-back ambushes framing the whirlpool's crews as the last gauntlet before the
     Last Free Captain himself, rather than a single walk-in fight
   - **B.** ✅ **Built 2026-08-11.** Blackfin's last pre-finale appearance — he's stopped bragging by
     now, just wishes you luck. The rivalry's tone has shifted from race to mutual respect without
     him ever winning. Added as `blackfin_ile_sainte_marie_reappearance` (fightable, Lv.17 —
     between Graves' 15 and Vane's 20, beach-dusk backdrop). Still an optional duel he still loses,
     per the design's "without him winning" — but the dialogue and victory line read as warmth and
     a send-off ("go remind Vane's ghosts what a real captain looks like") rather than another crack
     in his pride. Pure data addition on the pattern from II.A/III.A/IV.C. Verified: `tsc` clean,
     jest 45/45, live duel resolves correctly with zero console errors
   - **C.** Defeat Vane, take Libertalia's Marque — all 5 sequential Lords now down, the Pirate
     Council at Ocracoke Inlet unlocks

**Act VI — The Pirate Council (Ocracoke Inlet, endgame)**
   - **A.** The existing Council rematch (all 5 Lords, boosted, back-to-back, no heal between
     waves) plays as the "greatest hits" gauntlet — every terrain/challenge flavor from Acts I-V
     echoed in miniature, tying the whole run together before the true finale
   - **B.** Blackfin has beaten the Council here first and gone straight for Blackbeard alone —
     found humbled, having lost (3.B.4)
   - **C.** Grace's fleet arrives at Ocracoke in the same moment (2.A.4) — the real 1718 history
     this game already committed to, played straight
   - **D.** Blackbeard's own existing dialogue already asks "whose legend that really is" — the
     final duel is framed as answering that question for both the Lords' world and the Crown's at
     once. Defeat him, take the Terror's Marque: all six are yours, and there's no seventh to
     collect. That's the win

### 4. Terrain & Challenge Variety (the "diverse challenges in all terrains" requirement)
Each mandatory stop uses a distinct backdrop theme (already built, see Battle System) and a
distinct *shape* of challenge, not just a reskinned fight:

| Stop | Backdrop theme(s) | Challenge shape |
|---|---|---|
| Cow Island | jungle, beach | straight physical trial (baseline) |
| New Providence | town | social/urban gauntlet (taverns, streets) |
| Roatán | fort/shipyard-flavored | mechanical puzzle (careening-yard gate) |
| Port Royal | sea/jail-flavored ruins | exploration/curse maze |
| Île Sainte-Marie | jungle/beach, remote | mystical trial (whirlpool wave-gauntlet) |
| Ocracoke Inlet | sea, fort | finale — echoes every prior shape at once |
| Tortuga Cove | town | hub — Blackfin/Grace beats surface here between acts, not a Lord fight |

The puzzle-shaped stops (Roatán, Port Royal, Île Sainte-Marie) all lean on the existing but
unbuilt "themed island puzzle gauntlet" idea (Progression & Story Structure) — this section is
what finally assigns a specific puzzle *concept* to each of the three previously-generic examples
(reef maze → Port Royal, smuggler's lock → Roatán, bar-brawl gauntlet → New Providence's
tavern-crawl), rather than three unassigned examples with no home.

### 5. Where Mini Quests Slot In
"Obviously we will have mini quests as well" — the existing brainstormed mini-quest archetypes
(Side Quest Concepts, Mini-Quest Styles) already cover the mechanical shapes; this just gives
several of them a reason tied to the new antagonists instead of being generic filler:
   - **A.** Grace's pardon offer *is* the already-brainstormed "Branching/moral choice" archetype
     — this main-story beat (2.A.3) doubles as the first real example of that style
   - **B.** "Rival race" mini quests (already an existing archetype) are the natural home for
     Blackfin showing up between his scripted main-story appearances — small side detours where
     he's racing you to a resource node or a recruit, not just the Act-transition beats above
   - **C.** "Escort/protect" quests can be reframed around refugees fleeing Grace's crackdown at
     New Providence specifically, once she's introduced there (II.B) — ties an existing archetype
     to a specific place and reason instead of a generic NPC-in-danger
   - **D.** "Infiltration/heist" quests fit naturally as stealing intel on Grace's fleet
     movements — also the concept doc already flagged this archetype as "a natural setup for
     GTA-style character switching," so it's a candidate to revisit once that feature exists
   - **E.** Patron-hosted quests at Tortuga (the hub, per section 3's table) are the cheapest place
     to drop small Blackfin/Grace flavor beats between acts without needing new map markers —
     reuses the Patrons system exactly as already built, just with two recurring named patrons
     instead of one-off ones

### 6. The Treasure Codex (the "gotta catch 'em all" collection layer) — ✅ core system built 2026-08-10
Requested explicitly as a second Pokédex-shaped goal, but for treasure instead of crew: not one
hoard to walk up and grab, but a large catalog of individually named items — jewels, relics, coins,
artifacts — found in varied, sometimes weird places or earned through quests, tracked toward a
completion % the same way the Crew Log already is. The earlier "one big hoard" idea (prompted by
"should we be looking for buried treasure, one big hoard?") isn't discarded — it becomes the
Codex's single hardest capstone entry (see D below) rather than the whole goal, so there's both a
long collection grind *and* one legendary payoff at the top of it.

   - **A. Concept & UI** — a **Treasure Codex** screen, structurally identical to the existing Crew
     Log: every known item shown silhouette-until-found, full card once collected (name, rarity,
     flavor text, where/how it was found), running "X / Y found" completion %. Reuses the existing
     seen-vs-recruited two-state reveal pattern rather than inventing a new UI concept
   - **B. Acquisition methods** — deliberately varied, so "weird places, earned, or quested for" is
     literally true rather than one mechanic repeated forty times:
     1. ✅ **Exploration finds** — hidden off the main path in a specific terrain spot (a cove, a
        ruin, deep jungle undergrowth). Finally gives the already-brainstormed "Specialty-gated
        hidden areas" idea (Side Quest Concepts) a concrete payoff — the reward behind the
        Cannon-blasted cave or Blade-forced door is a Codex item, not just gold
     2. ✅ **Buried treasure maps** — finally builds out the already-stubbed "Buried treasure maps"
        General Store item (Side Quest Concepts): buy or find a map fragment, it marks a dig site
        on the map, walk up and dig for a named item instead of an instant gold payout
     3. ✅ **Salvage dives** — extends the existing Diving Bell salvage mechanic (currently gold-only,
        Port Royal) so specific dive sites can yield a unique Codex item alongside or instead of gold
     4. ⬜ **Quest rewards** — side quests, escort/heist quests, and Patron-hosted quests (Tortuga hub)
        can name a specific Codex item as their payoff instead of only gold/XP. Deferred — needs the
        actual quests this Main Story Arc's "quests" phase hasn't designed yet
     5. ⬜ **Puzzle solves** — the Act III/IV puzzle-gauntlet islands (Roatán's careening-yard,
        Port Royal's reef maze) each hide one item behind the puzzle itself, a second prize
        alongside beating the Lord. Deferred — those puzzle gauntlets aren't built yet either
     6. ⬜ **Rare drops** — a low-chance drop from specific named threat templates at legendary rarity,
        same odds-shape as today's rare recruit encounters. Deferred — no drop-table hook on wild
        encounters exists yet; straightforward to add, just not done this pass
     7. ✅ **Vendor purchase** — a handful of items are simply for sale at specific shops (e.g. Roatán's
        Smuggler's Den) at a steep price, for players who'd rather buy than hunt
   - **C. Rarity & rough count** — reuses the existing common/uncommon/rare/legendary tiers as-is
     (no new economy math needed). Rough target spread, not final: ~18 common (cheap, plentiful
     exploration finds so early collection feels achievable), ~12 uncommon (quest rewards, buried
     maps), ~7 rare (salvage dives, puzzle solves, rare drops), and a small handful of legendary
     pieces topped by the capstone below — roughly 40 items total, "a lot to collect" without being
     an unreasonable grind
   - **D. The legendary capstone** — Blackbeard's own lost treasure (per the real history: it was
     never actually found), assembled from 7 map fragments, one hidden near each mandatory island
     plus Tortuga (reusing section 4's terrain table locations). Completing the fragment set is the
     single hardest Codex entry, not a separate system — 100%-ing the Codex and finding Blackbeard's
     hoard are the same achievement, and it's the natural place for a twist beyond "it's just gold"
     (exact reveal TBD, worth deciding deliberately when this gets built rather than picked now)
   - **E. Why it stays optional** — same scope rule as Blackfin's duels (2.B.3): the Codex is
     parallel content, not a second mandatory gate. A player can beat all 6 Lords having found zero
     treasure, same as they can beat the game today without 100%-ing the Crew Log — it exists to
     make exploring off the direct island-to-island path worth doing, not to block progress

   **Build status (2026-08-10):** the full engine shipped — `src/data/treasures.ts` (17 items:
   7 rare fragments, the legendary capstone, 1 buried-map item, 1 salvage item, 1 vendor item, 6
   common exploration finds), `gameStore.ts` (`foundTreasureIds`, `findTreasureSite`, `buyTreasure`,
   `debugAddTreasure`, `salvageSite` extended with an optional `treasureId`, and a `withHoardCheck`
   helper that auto-assembles the legendary hoard the instant the 7th fragment lands, from
   whichever method delivered it), a new **Treasure Codex** screen (mirrors Crew Log exactly:
   silhouette-until-found, rarity-colored border, completion %), a **Treasure Chest** status block
   on the Crew screen's bag area (icons + a "Codex X/Y ▸" shortcut), a Menu row, map markers
   (rarity-colored, 🔒 when a buried-map site is missing its map), and a **Treasure** purchase
   section in `BuildingScreen` alongside the General Store. Verified: `tsc --noEmit` clean, 39/39
   jest tests passing (6 new: site proximity + double-grant guard, buried-map item gating +
   consumption, salvage-treasureId one-time grant, hoard auto-assembly, debug-grant idempotency,
   vendor purchase), and a full Playwright pass in a live dev server — granted fragments via Debug,
   watched the hoard auto-assemble with zero console/page errors, confirmed the Menu row and Crew
   screen bag both update live, and walked a character in-app up to Roatán's Smuggler's Den counter
   and completed a real gold-for-treasure purchase end to end.
   Methods 4 (quest rewards), 5 (puzzle solves), and 6 (rare drops) are intentionally **not** wired
   yet — they need quest content, the puzzle-gauntlet islands, and a wild-encounter drop table that
   don't exist yet, all of which are what the next "quests" pass is for. Content is a starter set
   (17 items), not the full ~40 target from section 4.C — trivial to keep adding via
   `TREASURES`/`TREASURE_SITES` entries, no further engineering required to grow it.

## World & Map Structure
- ✅ One continuous world (not Pokémon's screen-by-screen grid) — 7 islands + open sea, free-roam,
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
- ✅ A post-game superboss zone (Cerulean Cave equivalent) is built at **Ocracoke Inlet**
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
- ✅ **Ocracoke Inlet** — Order 6 Pirate Lord (true finale), Blade, Lv.25. Blackbeard's actual base
  and death site, gated behind completing the Pirate Council rather than sequential order — a
  natural convergence point for the still-unbuilt recurring named rival captain arc

### Real-world coastline shapes (built 2026-07-31)
- ✅ Every island's landmass is now a hand-authored irregular polygon that echoes the real
  island's true orientation and elongation, instead of a perfect circle — Tortuga's turtle-shaped
  silhouette, Roatán's strongly elongated wasp-waisted form, Île Sainte-Marie's narrow north-south
  sliver, Ocracoke's thin curved barrier-island crescent, Port Royal's rounded head trailing a
  Palisadoes-style sand spit, Cow Island tapering from hillier west to swampy east, New
  Providence's fairly regular oval
- ✅ `Island.radius` replaced with `Island.shape: {x,y}[]` (points relative to `position`);
  `islandAtPoint()` in `src/data/islands.ts` now does real point-in-polygon (ray casting) instead
  of a circular distance check
- ✅ Added `react-native-svg` and render each island as an `<Svg><Polygon>` in `MapScreen.tsx`
  rather than a `View` with `borderRadius`
- ✅ Every existing building/quest/resource-node/pirate-lord/rescue/salvage offset was checked
  against its island's new polygon (all currently fall on land) before shipping
- Not survey-accurate GIS data — approximated by hand from each island's real dimensions/shape
  described on Wikipedia, sized to keep all existing map content on land. A true art-fidelity
  pass (hand-painted coastlines/forests like a fantasy map) would need real art assets, which is
  out of scope for now.

## Movement & Exploration
- ✅ **Deliberately not grid-based** — this is our biggest intentional divergence from Pokémon.
  Kingshot-style drag-to-move continuous movement instead of tile-by-tile. Keep this; it's core to
  the pitch. This is about *movement*, not *town layout* — item 73 later in this doc puts Tortuga
  Cove's streets/buildings/houses on an orthogonal grid too, but the player still glides over it
  continuously rather than stepping tile-by-tile; the two aren't in tension.
- ✅ Camera follows player; speed and sprite change between sea (ship) and land (on-foot)
- ✅ **Pokémon-close camera zoom, built 2026-07-31, tuned to 5x against reference screenshots**:
  the outdoor map now renders at 5x its native scale (`ZOOM` in `MapScreen.tsx`) — buildings,
  houses, streets, everything inside the `world` container zooms uniformly via a single CSS-style
  transform (`translate` then `scale`, with the translate math canceling out the view's default
  center-origin so it zooms around the player rather than the world's geometric center). No
  gameplay math changed — movement speed, encounter radii, building triggers, coastline collision
  all still operate in true world units; only the world-to-screen rendering scale changed
- ✅ **Player-to-building size ratio fixed, 2026-07-31**: raising `ZOOM` alone never got the view
  close to Pokémon's, because the player token's on-screen size scaled in lockstep with everything
  else — and it started from a native size (40 units) already close to a building's (44 units). In
  real Pokémon a character is roughly 1 tile and a building is 5-7 tiles, i.e. the character reads
  as small next to structures; ours read as roughly building-sized. Fixed by shrinking the
  player's native footprint to 12 units — the same `ZOOM` factor now makes buildings and houses
  loom the way they do in the reference screenshots while the player stays correctly small next to
  them, with zero change to any world-unit gameplay math
- ✅ **Street life roster more than doubled, 2026-07-31**: 8 more ambient NPCs (a town crier, a
  farmer, a net-mender, a fort sentry, a beggar, a forge cat, a rope-maker, a lookout) patrol
  areas of Tortuga Cove that previously had no wandering life — near the Customs House, La Ringot
  Fields, the Fishmonger, Fort de Rocher's approach, the Warehouse, the Smithy, the Ropewalk, and
  West Point — for 15 wandering NPCs total, spread across the whole town instead of clustered near
  the square. Same mechanism throughout: deterministic waypoint patrol, one-shot flavor toast on
  approach, every waypoint validated on-land before being added
- ✅ **Simple filler townspeople, 2026-07-31**: 15 more street NPCs using plain "generic person"
  emoji (🕺💃🚶🏃🧍👫🧌🧞) rather than named trades — a couple of dancers, passersby, runners,
  locals, a couple, and even a troll and three genies (fitting, given the game already has
  curse-type crew and dark-forces quest flavor). Deliberately undifferentiated: same short generic
  flavor line shared across variants of the same "type" (e.g. all 3 "Passerby" NPCs say the same
  thing) rather than bespoke lore per NPC — 30 wandering NPCs total now, just more bodies making
  the town feel busy, not more content to author or maintain
- ✅ **Player token: walking-man glyph + animated walk cycle, 2026-08-01**: swapped
  `PLAYER_EMOJI_LAND` from the boy-face `👦` to `🚶‍♂️` per direct feedback. Since there's no real
  spritesheet, "animation" is a single-glyph bob: an `Animated.Value` drives `translateY` in a
  160ms-up/160ms-down loop (`Animated.loop`) while the drag gesture is actively past the deadzone,
  settling back to rest the instant it stops — driven by the same `directionRef`/gesture state the
  movement tick loop already uses, no new source of truth. Also flips the glyph horizontally
  (`scaleX: -1`) based on drag direction so the character visibly faces the way they're walking;
  the base glyph's art faces left, confirmed empirically via cropped high-DPI screenshots (the
  first attempt had the mapping backwards — moving right showed him facing left — caught by
  actually comparing rendered frames rather than assuming a direction)
- ✅ **Front-facing glyph for vertical movement, 2026-08-01**: the side-profile emoji only reads
  left/right, so walking up or down looked identical to standing still sideways. Added a second
  glyph (`🧍‍♂️`, front-facing) and pick between it and the side-profile one based on which axis of
  the drag gesture dominates (`|dy| > |dx|` → front-facing) — same gesture-derived state as the
  left/right flip, no separate tracking. Up and down still look identical to each other (there's no
  Unicode "back view" walking person to distinguish them), but toward/away now visibly differs from
  sideways movement, which was the actual ask
- ✅ **Map decluttered, 2026-07-31**: at 5x zoom, two always-on floating text labels — the island
  name+emoji badge and each landmark's name — turned out to be sized for the old unzoomed 1:1 view
  and never got revisited when `ZOOM` was introduced. The island label box alone rendered wider
  than the phone screen. Removed both: the island name is redundant with the header bar (which
  already shows the current zone persistently), and a landmark's name is already communicated by
  its walk-up flavor toast, matching how buildings already worked (emoji only on the map, name
  discovered by approaching). Also fixed street NPCs, which had the exact same bug as the player
  token before that fix — a native size (32 units) big enough to render house-sized once zoomed;
  shrunk to 10 units so ambient NPCs read as small figures near the player, not structures
- ✅ **Houses are solid, and walking speed halved, 2026-08-01**: first real playtest feedback — the
  player could run straight through the 79 decorative houses (they'd never had any collision, only
  buildings/landmarks did via their proximity triggers), and `LAND_SPEED` at 140 units/s felt far
  too fast once the camera was zoomed in tight. Added axis-separated circle collision against every
  house on the player's current island (`HOUSE_COLLISION_RADIUS` 14 + `PLAYER_COLLISION_RADIUS` 6):
  a blocked diagonal move retries X-only then Y-only before giving up, so the player slides along a
  house's edge instead of hard-stopping the instant they touch it. `LAND_SPEED` dropped 140 → 70.
  Buildings/landmarks/quest markers deliberately excluded — their `ENTER_RADIUS` (45) is already
  bigger than their visual footprint (22), so you're navigated into them well before you'd visually
  clash; adding collision there would be redundant. Verified by holding a drag into a house for 2+
  seconds and confirming the camera stopped scrolling rather than sliding the player through it
- ✅ **Fixed a real soft-lock in that house collision, 2026-08-01**: second playtest session, the
  player got permanently wedged between two houses. Root cause, checked against the actual
  procedurally-generated layout in `src/data/houses.ts`: the combined keep-out radius (14+6=20)
  exactly matched the tightest recurring house-to-house spacing in the grid (many pairs are exactly
  20 units apart), leaving zero or negative real-world gap between dozens of neighboring pairs —
  and since the slide fallback only retries the *current* drag's exact X and Y axes (not other
  directions), landing in one of those corners meant both axes were blocked simultaneously for
  whichever direction the player was holding. Fixed by shrinking to `HOUSE_COLLISION_RADIUS` 6 +
  `PLAYER_COLLISION_RADIUS` 3 (9 combined) — verified programmatically against every pair in the
  real dataset (zero pairs left with a negative gap, smallest real gap now 2 units) and against a
  synthetic 8-directional escape check across the whole town grid (zero fully-enclosed points at
  any radius tested, including the original — confirming this was a corner/direction-limitation
  issue, not a literal maze dead-end). Re-verified in-browser with a multi-direction wander through
  the densest house cluster; the player kept moving throughout and even walked into a building
  naturally, rather than freezing
- ✅ **`ENTER_RADIUS` shrunk 45 → 26, 2026-08-01**: third playtest round — walking anywhere near a
  building on the way to somewhere else would yank you inside it, since 45 was more than double a
  building's own visual half-width (22). 26 keeps entry to "you're basically at the door" while
  still safely bigger than the sprite. Applies to every walk-up trigger (buildings, landmarks, side
  quest markers, pirate lord forts, rescue point) since they all share the one constant. Verified
  every Tortuga building stays reachable from spawn within the new radius via a flood-fill
  simulation using the exact same house-collision logic as the live game (BFS over a stepped grid
  from spawn, checking whether any reachable point lands within `ENTER_RADIUS` of each building) —
  a much more reliable check than blind simulated drags, which kept getting rerouted by the
  residential grid the same way a real player would need to actually follow the streets
- ✅ **Visual indicator for buildings hosting an open Patron quest, 2026-08-01**: same feedback —
  "not obvious which building has a challenge." A small ❗ badge (reusing the same one already used
  inside a building on an individual patron NPC) now renders on a building's map icon whenever any
  of its `hostedByBuildingId` quests isn't in `completedQuestIds` yet. Pure derived UI, no new store
  state — same "has an open quest" definition `BuildingScreen` already uses per-patron
- ✅ **Street NPCs rewritten from ping-pong to street-network wandering, 2026-08-01**: same feedback
  — NPCs "just going back and forth" and wandering off streets into yards. Reworked from a
  stateless pure-function-of-time ping-pong between two fixed points to a real per-tick simulation:
  each NPC's `anchor` (its original rough flavor location) is projected onto the *nearest actual
  street segment* (`nearestStreetSegment` in `src/data/streets.ts`) at first use, and it wanders by
  walking to a random point on that segment or any segment connected to it (`connectedSegments`,
  sharing an endpoint), picking a new random target on arrival — a small local random walk along
  the real street graph instead of a fixed back-and-forth line. Nine NPCs' original anchors were
  18-30 units off the nearest street (checked programmatically); they now visibly live on the
  street instead of in a yard, which is the intended behavior. Also collides with houses using the
  same `slideAroundObstacles` helper the player uses (extracted as a shared pure function so both
  share one implementation), with a smaller collision radius (2, vs. the player's 3) matching their
  smaller on-screen size. Simulated once per 250ms wander tick (not the 33ms movement tick — ambient
  motion doesn't need that resolution), storing state in a `Map` ref to avoid extra re-renders.
  Verified in-browser: NPCs visibly relocated to different points along the street over a 10-second
  window, and no console errors from the rewrite
- ✅ **Street NPCs: generic walking-person sprite + bounded patrol radius, 2026-08-02**: two
  complaints at once — "confusing when random emojis walk around," and "I want them to stick to the
  paths and routes rather than just running around all over." Root cause of the second one: the
  residential grid's own streets can be very long (a full avenue can span the whole town), so once
  an NPC's nearest street *was* one of those, "any random point on a connected segment" let it wander
  the length of that whole avenue — confirmed programmatically against the real street data before
  touching any code: the worst case (the New Providence ship's cat) could reach 293 units from its
  own anchor under the old logic, nearly the width of the island. Fixed with `NPC_PATROL_RADIUS`
  (45) and a new `pickPatrolTarget()`: every retarget still has to land on a real street point, but
  now retries (falling back to the anchor itself) until it finds one within 45 units of the NPC's
  original anchor, so they stay a tight local loop near their authored flavor spot instead of
  crossing the map. Re-ran the same simulation post-fix — all 38 street NPCs across every island
  stayed within the 45-unit cap over 500 simulated retargets each. For the emoji complaint: replaced
  each NPC's individual flavor emoji (a dice, a fiddle, a parrot, a cat) with the exact same
  `PLAYER_EMOJI_LAND_FRONT`/`PLAYER_EMOJI_LAND_SIDE` sprite pair the player itself uses, in the same
  front/side pose based on which axis they're currently moving along, plus a left/right flip matching
  the player's own convention — so every wanderer on screen now unambiguously reads as "a person
  walking" rather than a menagerie of moving objects. The per-NPC flavor emoji is untouched in the
  data model and still shown in the approach flavor-toast text (`🎻 A One-Legged Fiddler: ...`) — only
  the moving map sprite changed. Verified in-browser: every visible street NPC now renders as the
  walking-person figure, confirmed against a screenshot showing several at once with no leftover
  object/animal icons
- ✅ **Street NPCs get varied clothing colors, 2026-08-02**: immediate follow-up — now that every
  NPC shares one walking-person glyph, they all looked like the same identical person. Emoji glyphs
  are colored images, not vector art with a separately recolorable clothing layer, so there's no
  direct way to "just change the shirt color." Landed on a per-NPC CSS `hue-rotate` filter
  (`npcClothingHueDeg()`, hashed from the NPC's id so a given NPC always gets the same color, not a
  new random one every render) plus a `saturate(2.5)` boost so the shifted hues stay clearly visible
  instead of washing out — shifts every colored pixel (clothes, skin, hair) around the color wheel
  together while leaving true black/white pixels (outlines, shading) alone, which reads as "a person
  in different-colored clothes" well enough for emoji-placeholder art. Feasibility was checked
  in-browser before writing the real implementation (a throwaway inline version screenshotted first)
  since `filter` isn't part of React Native's own style types — it's a react-native-web-only pass-
  through, confirmed working on this project's `react-native-web` version, but a reminder for later:
  **this has no effect on a native iOS/Android build**, only the web export this project currently
  ships. A real cross-platform fix would need actual per-NPC sprite art or an SVG-based character
  instead of a plain emoji glyph
- ✅ **Fixed: clothing-color hue-rotate was recoloring skin too, 2026-08-02**: immediate, entirely
  fair correction — "didn't think I'd have to tell you not to make the skin not human coloured."
  The bug was inherent to the approach above, not a tuning mistake: `hue-rotate` shifts every
  colored pixel in the glyph together, so it rotated skin tone right along with the shirt — on an
  unlucky hash, straight to pink. There's no rotation amount that fixes this in general, since emoji
  glyphs have no separate "clothing" pixels to target in isolation. Replaced entirely: removed the
  filter from the glyph (skin now renders 100% untouched, always natural), and instead draw a small
  solid-color `View` patch (`npcClothingColor()`, same id-hash approach for a stable per-NPC color)
  positioned over just the torso region of the 7pt glyph centered in its 10x10 box — tuned by eye
  against real screenshots rather than exact font metrics, since emoji glyph internals aren't
  something code can introspect. Verified at 4x device-scale zoom on both the side-walking and
  front-standing poses: natural yellow/tan skin visible above and below the patch in both cases, and
  the patch itself lines up convincingly with the shirt/chest area, not overlapping the face
- ✅ **Joystick reliably resets on release, 2026-08-01**: fourth playtest round, on a real
  touchscreen — "controls are stuck," movement not stopping when the finger lifts. Direction was
  already a ref cleared synchronously in `clearDrag()`, so the likely cause is
  react-native-gesture-handler's web implementation occasionally missing `onFinalize` on a real
  touch (a swallowed touchend/touchcancel) — not reproducible via mouse/Playwright, which is
  presumably why it wasn't caught earlier. Added a window-level `pointerup`/`pointercancel`/
  `touchend`/`touchcancel` listener as a safety net that also calls `clearDrag()`, so release is
  never missed regardless of what the gesture handler itself does. Also made the visual reset match
  a real joystick: the knob now snaps to dead-center of the base immediately on release (previously
  it just vanished mid-position), then the whole control fades out ~150ms later instead of cutting
  off abruptly. Caught and fixed a self-inflicted bug in the same change: the native `onFinalize`
  and the new window-level listener both fire for every release by design (redundant, not just a
  fallback), and the second call was immediately hiding the knob before the snap-back was visible —
  fixed by making `clearDrag()` a no-op on the visual reset (not the movement stop, which stays
  unconditional) whenever a snap-back is already in progress. Verified in-browser: knob visibly
  centered at 30ms post-release, fully faded by ~330ms, and the world stayed motionless across a
  1-second window after release (only independently-timed ambient NPCs moved)
- ✅ **Joystick anchored on the character, not the touch point, 2026-08-01**: fifth playtest round —
  the control ring appeared wherever the finger first touched down, which could be nowhere near the
  player token. Since the player is always fixed at the exact center of the screen, `onBegin` now
  anchors the joystick there (`viewport.width/2, viewport.height/2`) instead of the touch
  coordinates — the ring visibly surrounds the character regardless of where the drag starts.
  Direction/speed math is untouched (it was always based on drag *delta*, not absolute position),
  so this was a pure display-anchor fix. Verified in-browser: touched down in the opposite corner
  of the screen from the player and the ring still appeared centered on the character
- ✅ **Streets widened, 2026-08-01**: same playtest round, "too congested." Bumped the 'main' street
  sidewalk/road stroke widths (28/16, was 22/12) and the 'path' dashed stroke (8, was 6). Checked
  first whether a bigger jump was safe: houses hug streets tightly by design (median house-to-street
  distance is only 10 units against a house's own 13-unit visual radius, i.e. most houses already
  graze the current sidewalk edge on purpose, like real streetside frontage) — a large width
  increase would start visibly cutting into houses on the tightest blocks, so this was a deliberate
  moderate bump rather than a bigger one. Purely a rendering change; the walkable width (house
  collision positions) is unchanged
- ✅ **`LAND_SPEED` dropped 70 → 45, 2026-08-01**: sixth playtest round, walking still felt too
  fast. Sea speed (260) untouched — only asked about walking pace
- ✅ **Fixed the exit-doorway soft-lock, 2026-08-01**: seventh playtest round — "can't move, stuck
  in the doorway" after leaving a building. Root cause, checked against the real data: the
  "push the player just outside the building's trigger radius" logic (added long before house
  collision existed) uses a fixed distance (`ENTER_RADIUS + 15` = 41 units) straight out from the
  door in whatever direction the player approached from — but several Tortuga buildings have a
  house closer than 41 units (as close as 30), so that fixed push could land the player directly
  inside a house's collision zone, wedging them in immediately on exit. Added `findClearExitSpot()`
  — radiates outward from the door, trying the original approach direction at increasing distances
  first, then fanning out to other angles, until it finds a spot clear of every house on that
  island. Verified programmatically against the real building/house data: every Tortuga building
  produces a clear exit spot across a full sweep of approach angles (0-350° in 10° steps) — the
  same rigor as the earlier house-collision fixes, since blind manual test-walks to a specific
  building kept being an unreliable way to verify this class of bug
- ✅ **Building entry is now a dismissible bottom prompt instead of auto-navigating, 2026-08-02**:
  eighth playtest round — walking near a building instantly opened its full-page screen, but "you
  don't always want to go inside the building you walk past." Walking into `ENTER_RADIUS` now shows
  a small card pinned to the bottom of the screen ("Enter The Salty Parrot?" + its emoji) instead of
  navigating immediately; tapping it enters the building, walking away from it without tapping makes
  it disappear, and movement is no longer frozen just for being near a door. Follow-on fix: the
  "nudge the player just outside the trigger radius on return to the map" effect used to include
  buildings (needed when proximity meant instant re-entry) — with buildings no longer auto-entering,
  that nudge was pure unwanted bounce, so buildings were dropped from that check and the now-dead
  `nearbyBuildingPos()` helper was deleted. Verified with a marked, fully-reverted temporary
  test-spawn (`TEMP-TEST-SPAWN`, confirmed removed via `grep -rn TEMP src` before commit) placing the
  player in range of a real building: the prompt appeared while approaching, disappeared when walked
  past without tapping, and tapping it correctly opened the building screen.
- ✅ **Buildings get a roof-colored cap so they read as small buildings, not flat squares,
  2026-08-02**: same round — "add a small emoji symbolising what type of building it is on the roof
  of the building." Turned out the type emoji already existed and was already shown (tavern = 🍻,
  fishmonger = 🐟, exactly the user's own examples) — the real problem was the plain flat dark square
  it sat in, which didn't read as "a building" next to the nicer-looking decorative house sprites and
  didn't stand out enough to tell buildings apart at a glance. First attempt was a separate peaked
  roof shape floating above the box with the emoji shrunk onto it as a badge — screenshotted and
  rejected before shipping: several type emoji (the fort's 🏰, the shop's 🏪) already render as
  detailed mini-buildings with their own roof/awning baked into the glyph, so the extra shape floating
  above them just doubled up and looked wrong. Landed on a roof-colored band (`buildingRoofCap`)
  clipped inside the existing box's rounded corners instead, with the type emoji kept at its original
  large centered size — gives every building a consistent two-tone "roofed box" look without fighting
  any individual glyph's own artwork. Verified via screenshots (using the same temporary, fully-
  reverted `TEMP-TEST-SPAWN` technique) across four different building types (tavern, fort, shop,
  warehouse) to confirm the cap clips cleanly and the icon stays legible in every case.
- ✅ **Roof-cap swapped for an actual house base under the type badge, 2026-08-02**: immediate
  follow-up feedback on the above — "if there is a ready made emoji for the building use them, but
  for the others that don't have a specific emoji use the house building with the emoji on top,
  rather than just a triangle." Split buildings into two groups by their emoji: ones that already
  depict an actual structure (`BUILDING_SHAPED_EMOJI` — fort's 🏰, shop's 🏪, chapel's ⛪, customs'
  🏛️, manor's 🏚️, the two hut-type beach buildings' 🛖, the shrine's ⛩️) keep rendering large and
  alone, unchanged. Everything else (tavern's 🍻/🍺, fishmonger's 🐟, smithy's ⚒️, warehouse's 📦,
  distillery's 🥃, timber yard's 🪵, armoury's 💥, smuggler's den's 🕳️, college's 🎓, beach camp's
  🏖️) now renders a plain house emoji as the base with the real type emoji layered on top of it as a
  small badge. Note for anyone touching this next: the map view applies a `ZOOM = 5` scale transform
  to everything inside it, so a `fontSize: 14` badge still renders as a ~70px glyph on screen — don't
  mistake that for a bug, it's the same scale factor every other marker on the map already gets.
  Verified via screenshots (temporary `TEMP-TEST-SPAWN`, reverted and grep-confirmed clean before
  commit) on the tavern and warehouse (house base + badge) and the fort and shop (unchanged, still
  large and alone) — a tight crop on the tavern confirmed the house's door/windows and the beer mugs
  badge sitting on its roof are both clearly visible together, not just one covering the other.
- ✅ **Added a rotating compass pointing at the main quest, 2026-08-02**: raised as "I don't know
  where to find things for a quest" — discussed how Pokémon solves this (hard-gated routes + NPC
  dialogue, not markers) and agreed that doesn't transfer here since Scallywags is free-roam across
  six islands with nothing physically blocking a wrong turn. Landed on a 🧭 badge, top-right of the
  map viewport, that rotates to always point at the current main-quest target — reuses the exact
  target the header's "Main Quest" banner already names (next undefeated Pirate Lord's fort, or the
  gating side quest's location if the next lord isn't unlocked yet), resolved to a world position via
  the existing `pirateLordWorldPosition` / `sideQuestWorldPosition` / `buildingWorldPosition` helpers.
  Scoped to the main quest only, not every open side quest — side quests keep the Quest Log's island
  name plus the ❗ badge on their building, which is closer to "find it yourself" and was a deliberate
  choice, not an oversight. The rotation math (`atan2(dx, -dy)`, screen y grows downward so north
  needs the sign flip) works because the whole world already lives in one shared coordinate space —
  island `position` + building/lord `offset` are just numbers in the same units as the player's own
  position, so "as the crow flies" pointing works identically whether the target is on the same
  island, a different island, or the player's out at open sea. Verified two ways: hand-computed the
  expected bearing from spawn to Cow Island's fort and confirmed the rendered rotation matched, then
  dragged the player out to open sea and confirmed the needle visibly swung as the bearing changed
  (read back via the element's computed CSS transform, not just eyeballed). Emoji is a placeholder
  per the request ("use a compass emoji for now") — a proper needle asset can swap in later without
  touching the angle math.
- ✅ **Off-screen edge icons for resource nodes, 2026-08-02**: follow-up ask — "add an emoji that
  moves around the extremes of the screen for the mini quests... 🪵 moves in real life to show me
  where to get wood from." Added `edgeIndicatorPosition()`: clamps a world-space target to the edge
  of the visible viewport along the ray from the player (screen center) to the target, same idea as
  an off-screen objective marker in most open-world games — the icon "orbits" whichever edge the
  target is behind as the player moves, and returns `null` (hide it) once the target is already
  inside the visible area, since its own on-map marker is enough at that point. Scoped to resource
  nodes on the player's *current* island only, skipped while a node is on cooldown (nothing to gather
  right then) — deliberately narrower than "all mini quests": side quests already have the Quest
  Log's island name plus their own ❗ badge once you're there, and a marker pointing at a resource
  node on a different island wouldn't be actionable, so didn't add those to avoid stacking multiple
  edge icons and cluttering the screen. Can extend to side quests too if that turns out to be wanted.
  Verified in-browser: confirmed the fish node's edge icon appears pinned to the top edge dead-center
  when directly north and off-screen (matches its true offset, `{x:0, y:-140}`), slides sideways
  along the edge as the player moves off that exact bearing, and — via a temporary `TEMP-TEST-SPAWN`
  placed right next to the node, reverted after — disappears entirely once the node's own on-map
  marker is visible, confirming the "already visible" skip actually fires and doesn't just leave a
  redundant second icon next to the real one.
- ✅ **Extended edge icons to standalone side quests, 2026-08-02**: asked for right after the above.
  `resourceEdgeIndicators` and a new `sideQuestEdgeIndicators` now merge into one combined
  `edgeIndicators` list rendered by a single loop, instead of duplicating the render block. Limited
  to side quests with their own `.offset` (the ones that already get a 📜 map marker today) — quests
  with `hostedByBuildingId` are deliberately left out, since those are meant to be found by talking to
  patrons inside a building, not marked on the map at all, and adding an edge icon for them would
  undercut that. Also excludes whichever quest is the current main-quest `gateQuest`, since that one
  is already pointed at by the compass — showing both would just be two markers for the same target.
  Uses 📜 for every side-quest icon (matching the existing on-map marker) rather than each quest's
  `npcEmoji`, since the data model doesn't have a separate "what you'll get" emoji the way resources
  do, and 📜 is what the player will actually recognize once they arrive. Verified in-browser on
  Tortuga's bounty board quest (`offset: {x:0, y:130}`, due south of spawn): its 📜 icon appeared
  pinned to the bottom edge, roughly centered, at the same time as the fish node's 🐟 icon at the top
  — confirming multiple simultaneous indicators render independently without fighting each other.
- ✅ **Accepted patron quests also get an edge icon, pointing at their building, 2026-08-02**: asked
  "once I've got the side quest item, should where to deliver it pop up the same as the resources?"
  Turned out fetch quests always deliver back to the exact same NPC/building the quest came from —
  no separate drop-off point — so standalone quests already had this covered for free (their edge
  icon persists the whole time a quest is accepted, right up to turn-in). The real gap was
  building-hosted patron quests: deliberately unmarked before acceptance so they're found by
  exploring, but once accepted that reasoning no longer holds — you've already found it, you just
  need to get back. `sideQuestEdgeIndicators` now also includes `hostedByBuildingId` quests once
  `acceptedQuestIds` contains them, targeting the host building's position instead of a quest offset;
  still hidden pre-acceptance so undiscovered patrons stay a real discovery. Verified against the real
  quest data first (`patron_tortuga_drunk`: not eligible before accepting, eligible once accepted, not
  eligible once completed — the three states that matter), then confirmed visually by seeding
  `acceptedQuestIds` into `localStorage` before boot (faster and more reliable than navigating the
  dense house grid to actually click through the accept dialogue) and screenshotting a second 📜 icon
  appearing on the correct edge, pointing toward the tavern.
- ✅ **Fixed drag-to-sail breaking after visiting a building, fight, or pirate lord fort,
  2026-08-03**: reported as "control of movement goes wrong" after those specific flows. Root
  cause: React Navigation keeps `MapScreen` mounted (just hidden) underneath
  Encounter/Building/PirateLord/SideQuest/Rescue while any of them is on top, and the drag
  gesture's `GestureDetector` was never disabled while unfocused — so it kept listening the whole
  time you were on one of those screens. A stray touch reaching it there would leave `directionRef`
  holding a leftover direction that the movement loop (gated on focus, but never itself reset by a
  focus change) would immediately act on the moment you came back — reading as the character moving
  on its own, or the joystick responding wrong, right after leaving. Fixed two ways: the gesture
  itself now carries `.enabled(isFocused)` so it can't register anything at all while another
  screen is on top, and a dedicated effect force-resets every piece of drag state (`directionRef`,
  `isMoving`, the joystick's origin/knob, any pending snap-back timer) the instant focus is lost —
  covering the case where a wild/ambush encounter fires and navigates away mid-drag, before the
  gesture's own `onFinalize` would ever see the release. Verified `npx tsc --noEmit`, and two full
  in-browser round trips (Map → Debug → forced wild encounter → flee → Debug → Map, and
  Map → Debug → themed shop building → leave → Debug → Map): idling with zero input after each
  return showed no phantom movement or stuck joystick, and a fresh drag immediately afterward moved
  normally in the dragged direction both times
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
- ✅ **Real walkable interiors, built 2026-07-31**: walking into a building no longer jumps
  straight to a menu-like summary — it cuts to an actual small floor-plan room (furniture rendered
  as styled shapes: a bar counter, stools, tables, a rug, a barrel) that you walk around in with
  the same drag-gesture movement used outdoors, just bounded to the room instead of the world.
  NPCs (the building's own NPC plus any hosted Patrons) are positioned in the room as walk-up-to
  tokens rather than list rows; getting close to one surfaces a "Talk to X" prompt. Talking to the
  main NPC opens the existing hire/shop/craft/sell/steal/upgrades content (unchanged, just now
  reached this way instead of always being shown) with a Back button returning to the room; talking
  to a patron opens the same `SideQuestScreen` flow as before, completely unmodified. Buildings
  without a hand-authored floor plan yet (`src/data/interiors.ts` → `BUILDING_INTERIORS`) get a
  generic fallback room (main NPC up top, patrons arranged below, light decoration) so nothing is
  left non-functional — only Tortuga's tavern has a bespoke layout so far, matching Pokémon's own
  pattern of walking into a real tile room rather than a menu. Room player position is local to
  each visit (resets to the door on re-entry), and this is exactly the interior variant of the
  overworld's drag-to-sail movement, not a new engine built from scratch
- ✅ **The Salty Parrot, fleshed out**: a visible 🚪 door marks the entrance/exit, and two new
  generic furniture pieces support it — `chair` (🪑, ringing each of the tavern's 3 tables, 4
  apiece) and `prop` (a generic decorative-emoji type covering everything else: a parrot 🦜 perched
  over the bar — a nod to the tavern's name — a pirate flag and a map on the walls, two windows, a
  hearth, a potted plant, a cat, candles flanking the barkeep, and a dartboard with someone actually
  standing at it). Room grew to 360×340 (from 300×220 originally) with a third table added to fill
  the space. Two more named patrons round out the cast: **Scar-Faced Odom** (Rival Pirate archetype,
  `fetch` — wants a Grapeshot Charge "no questions asked," standing by the dartboard) and
  **Mother Yew** (Fortune Teller archetype, `specialty_gate` — needs a Curse-type crew member
  onboard to break a "ward," tucked by the hearth). The tavern now has 5 named characters total
  (Old Tom + 4 patrons) and its own quest count contributes 4 toward the 150+ target
- ✅ **Ambient NPCs — not every face needs a quest**: a new `AMBIENT_NPCS` record
  (`src/data/interiors.ts`) holds ordinary members of the public — a weathered sailor, the ship's
  cook, a local lass — who populate a room without being quest-givers. Walking up to one shows a
  one-off flavor line in a toast instead of navigating anywhere, keeping the "normal person, just
  there" feel distinct from patrons. To tell them apart at a glance, quest-giving patrons with an
  uncompleted quest show a small ❗ above their token (drawn from `completedQuestIds`, same
  approach as the outdoor quest markers' status coloring); it disappears once that patron's quest
  is done. The tavern now seats 3 ambient locals alongside its 4 questing patrons
- ✅ **Tortuga Cove: the whole-island blueprint, built 2026-07-31** (GTA-style: a real laid-out
  settlement covering the *entire* landmass — roads, buildings, docks, farmland, patrolling
  townsfolk — not a handful of markers scattered on grass). Historically grounded throughout, and
  meant as the template to repeat island-by-island next:
  - **Basse-Terre Square** is the town's hub (named for Tortuga's real farming/settlement
    district), with dirt-road streets (`src/data/streets.ts`, rendered as SVG lines) radiating out
    to every building and landmark, plus a separate harbor road linking the trading post to the docks
  - **Fort de Rocher, Chapelle Notre-Dame, and Smugglers' Warehouse are real enterable buildings**,
    each with its own interior, a named NPC + recruit, and a hosted Patron quest — not just scenery.
    Fort de Rocher is modeled on the real fortress: Jean Le Vasseur's actual fortified home atop a
    30-ft rock, ~40 cannons facing the harbor, reachable historically only by a staircase and a
    pull-up ladder — reflected in-game as a `path`-style street (thin, dashed) instead of a proper
    `main` road, the one place the road style itself carries historical meaning
  - **West Point Shack** is a new building on the island's far west tail (previously empty land),
    a retired pirate's hovel reached by a rough coastal trail — proof the layout now uses the whole
    landmass, not just the historically "correct" central town core
  - **La Ringot Fields** is a new non-interactive landmark (farmland — a real Tortuga district
    where tobacco was grown) rounding out the south-east corner
  - **The Harbor Pier** and **Basse-Terre Square** remain intentionally **non-interactive scenery**
    (`src/data/landmarks.ts`) — no interior, no quest, just a flavor-text toast on approach — the
    same "not every building needs to be a menu" idea as ambient NPCs, applied at the town level
  - **Street life**: `src/data/streetNpcs.ts` adds ambient NPCs that patrol back and forth between
    two waypoints (a deterministic function of time, no per-NPC state needed — `streetNpcPosition()`)
    instead of standing still, so the town feels lived-in from outside its buildings too. Same
    one-shot flavor-toast treatment as landmarks; never a quest
  - **Densified into a real downtown block, 2026-07-31**: streets got an actual sidewalk (a wider
    light stroke under a narrower dark road stroke, `main`-style only — `path`-style stays a bare
    dashed line, keeping that visual distinction meaningful), and the topology grew from pure
    hub-and-spoke into a small block network — each inner building now also connects onward to one
    more, so downtown reads as inter-connected blocks radiating from the square rather than a
    starburst. Two more real enterable buildings filled the gaps: **The Customs House** (harbor
    trade/bribery flavor) and **The Anchor & Forge** (blacksmith), plus two more non-interactive
    landmarks, **The Baker's Oven** and **The Ropewalk**, for density without more authoring cost
  - 6 new Patron quests came free with the 6 new buildings across both passes (fort, chapel,
    warehouse, West Point Shack, Customs House, Anchor & Forge), pushing Tortuga Cove's own quest
    count higher toward the 150+ target without inventing new mechanics
  - **A real concentrated town, not scattered buildings, 2026-07-31**: matched the composition of
    a real fantasy-map reference — one dense town, a small satellite settlement, a few scattered
    outliers — instead of markers spread evenly over the whole island. Added `src/data/houses.ts`:
    79 purely-visual row houses (procedurally generated along a 5-avenue × 5-cross-street grid,
    every position validated on-land against Tortuga's coastline polygon and kept clear of every
    other marker before being written down) filling the blocks between the new grid streets with
    actual rows of houses lining both sides, the way a real street looks. Houses are intentionally
    the lightest-weight content tier yet — no interior, no interaction, not even a proximity check
    in the movement loop, purely a footprint on the map, like background buildings in GTA. 4 more
    ambient street NPCs (residents, a fishwife, a child, an old fisherman) patrol through the new
    residential blocks, for 7 wandering NPCs total. West Point Shack (far west) now reads clearly
    as the "small settlement," and Fort de Rocher / Harbor Pier / La Ringot Fields as the "few
    buildings scattered around the island," while everything from the harbor road south is one
    unbroken, dense downtown — Tortuga Cove is now well past 60 total structures
  - **Placeholder art note**: everything above renders with the same emoji + colored-shape
    primitives used everywhere else in the game (no real pixel art asset pipeline exists yet — see
    `TileLayer.tsx`, built but unused, waiting on a real licensed tileset). The specific places a
    real art pass would matter most, in rough priority order: the coastline/terrain texture itself
    (currently a flat green polygon), Fort de Rocher (should read as a fortified cliff, not a 🏰
    emoji), the harbor/pier (ship silhouettes, actual dock structure), and generic
    building/street/foliage texture (palm trees, cobblestone, wood-and-thatch facades) to replace
    the plain colored boxes
  - Only Tortuga Cove has been fleshed out this way so far — the other 6 islands still have their
    original 1-3 buildings with no street layout, landmarks, or street life; repeating this whole
    pass island-by-island is the natural next step now that the blueprint is proven
- ✅ **New Providence: the blueprint repeated for the first time, 2026-08-02**. Before this it had 2
  buildings (The Cracked Hull, The Distillery), Iron Jenny's fort, and one standalone side quest —
  zero houses, zero streets, zero street life. Verification-first, same as every geometry change this
  project has made: wrote a throwaway script that copied the island's real polygon and generated
  candidate house positions along a residential grid, filtering to *inside the actual coastline* and
  clear of every existing marker, before writing a single line into `houses.ts` — 61 houses landed
  clean this way (one candidate, dropped for being 20 units from the rum resource node, is the only
  one the script's marker list initially missed — see the bug note below).
  - **Republic Square** (new landmark, hub) reflects Nassau's real character as a run-by-consensus
    "pirate republic" rather than a governed town — captains voting on plunder shares instead of a
    town hall — radiating streets to every building, same hub-and-spoke pattern as Basse-Terre Square
  - **The Careening Yard** (new enterable building, `smithy` type) is grounded in the real reason
    Nassau mattered to pirates at all: its harbor was too shallow for Royal Navy warships but ideal
    for beaching and careening (tipping a ship on its side to scrape the hull) — the pirate
    republic's only real shipyard. Comes with a recruit (Shipwright Odalys) and, once patron content
    is authored for it, a Patron quest slot
  - **8 new street NPCs** (`src/data/streetNpcs.ts`) written distinct from Tortuga's archetypes on
    purpose — no patrolling guard, because Nassau explicitly has "no crown, no law": a dice gambler,
    a lookout watching for Navy sails, a furtive smuggler, a one-legged fiddler, and others leaning
    into the lawless-republic tone rather than reusing Tortuga's cast with new names
  - **Bug caught during in-browser verification, not left for the user to find**: the Careening
    Yard's first placement (`{x:-150,y:-100}`) landed 10 units from the pre-existing rum resource
    node at `{x:-140,y:-100}` — missed during design because the generation script's marker list
    only included buildings/fort/quests, not resource nodes. A screenshot showed the resource node's
    marker and the new building's marker rendering on top of each other before this ever reached the
    user. Fixed by relocating the building to `{x:-190,y:-30}` (a real clear coastal spot, verified
    against the polygon and every other marker) and dropping the one house that had been placed too
    close to the resource node as a result. A final comprehensive script re-checked all 61 houses
    against all 7 non-house markers (buildings, fort, landmark, quest, resource node) pairwise, and
    all markers against each other, before shipping: zero remaining violations
  - **Deliberately not done in this pass**: Patron quests and a bespoke floor plan for the two new
    buildings (Careening Yard, and updating The Cracked Hull's tavern) — both buildings still use the
    generic fallback interior. That's real content-authoring work (2-4 patrons each, per the roadmap)
    better done as its own dedicated pass rather than rushed alongside a world-geometry change
- ✅ **Building interiors get a camera and a real zoom, 2026-08-02**: raised after playtesting the
  interiors — "the whole building... likely won't just fill the screen. We will have to explore the
  building and move around to see it all," plus "the movement for the internal building is wrong,
  it's slow." Both turned out to be the same root cause: rooms rendered at native pixel size with no
  camera at all, so a 360×340 room just fit entirely on screen at a glance — nothing to explore —
  and `ROOM_SPEED` (90) was tuned as a raw pixel-per-second value with no zoom multiplier, while the
  outdoor map moves at `LAND_SPEED`(45) × its own `ZOOM`(5) = 225px/s on screen. Same numbers, very
  different effective speeds — indoors was really running at well under half the outdoor pace.
  Fixed by giving rooms the exact same camera architecture the outdoor map already has: a new
  `INTERIOR_ZOOM` (2) scale-and-translate transform on the room `View`, centered on the player and
  measured against the room container's real layout size (`onLayout`, same pattern as the map's own
  `viewport` state) — furniture, NPCs, and the player all render at their existing native-unit
  positions and come out bigger and clearer for free, no floor plan had to be re-authored. Rooms
  bigger than the viewport (which is now every room, since zoom effectively doubles their on-screen
  footprint) are only ever partially visible at once, so walking to the door, the counter, or a
  patron in the corner actually means walking there. `ROOM_SPEED` recalculated as `225 /
  INTERIOR_ZOOM` (112.5) to land on the same effective on-screen pace as outdoors, the same tuning
  target used throughout the outdoor speed passes. Verified in-browser on both a bespoke room (the
  tavern — confirmed the camera panned from the door up to the counter as the player walked, and the
  tables/patrons/barkeep only became visible once actually walked toward) and a generic fallback
  room (the fishmonger's stall), so the fix isn't specific to hand-authored floor plans
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
- ✅ **6 named Pirate Lords** as Gym Leader equivalents — 5 sequential ones, one per non-home
  island (Redbeard Sully → Iron Jenny → Captain Bellows → Marietta Graves → Ezra Vane), each a
  unique boss fort you walk into on the map, gated **sequentially** — you can't challenge Lord N
  until Lord N-1 is defeated — plus a 6th, true-finale Lord (Blackbeard, see the Pirate Council
  bullet below) gated on quest completion instead of sequence
- ⬜ Themed island "puzzle" before each boss fight (reef maze, smuggler's lock, bar brawl gauntlet)
  not built — forts are currently a direct walk-in-and-fight, no puzzle layer yet
- ✅ Defeating a Lord grants a **Letter of Marque** (Badge equivalent): a permanent +3%/badge
  Atk/Def boost applied to your active crew member in every battle, big XP/gold rewards (badge
  fights use the same 'legendary' rarity multiplier as top-tier wild encounters), and unlocks the
  next Lord. Tracked in a **Quest Log** screen (accessible from the Menu hub) showing all 6 with
  Locked/Available/Defeated status
- ✅ Lord fights disable Flee (you commit to the duel, matching Pokémon's own no-running-from-
  trainer-battles rule) and Recruit (Lords aren't recruitable); losing gives the normal
  faint-and-heal-at-Tortuga outcome, **not** permadeath — that stays reserved for rival/navy
  ambushes since a sanctioned duel isn't the same as being caught unawares
- ⬜ Raising the level at which recruited crew "obey" you (direct obey-mechanic reskin) — not
  built, and not very meaningful yet without a level-cap concept tied to badge count
- ✅ Traversal gate: **Reinforced Hull** (see Economy below) hard-gates Île Sainte-Marie until
  bought at Roatán — the ship-upgrade traversal gate this bullet was waiting on
- ⬜ Reputation-gated port (beyond the one hull-gated island) — not built
- ✅ **Endgame: the Pirate Council (Elite Four equivalent) + Blackbeard (Champion equivalent)**.
  A new side quest, **The Pirate Council** at Ocracoke Inlet, reuses the existing escort/wave-quest
  mechanic (already proven for multi-stage, no-heal-between-waves content) to rematch all 5
  previously-defeated Lords back-to-back at boosted levels — gated behind having beaten all 5, via
  a new optional `requiresAllLordsDefeated` field on the escort quest type. Completing it unlocks
  **Blackbeard** himself, a new 6th `PirateLord` entry (order 6, Lv.25, the highest stats in the
  game) gated by a new optional `requiresQuestId` field on `PirateLord` (checked in `isLordUnlocked`
  instead of the sequential order chain) rather than a new gating system. Defeating him is the true
  ending: the Quest Log's "all defeated" banner updates for the real finale once `defeatedLordIds`
  covers all 6. No credits screen or post-game unlocks yet — out of scope for this pass
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
- ✅ Quest log / journal UI (the new Quests screen) now lists both Pirate Lord progress and side
  quests with Available/Accepted/Completed status (heat-bounty shows "Open · N turned in" instead,
  since it never reaches a terminal Completed state)
- ✅ **Prisoner rescue**: permadeath finally has a narrative payoff instead of just a stat loss.
  `removeCrewMember` now takes an optional `capturedBy: 'navy' | 'rival'` — when a navy/rival
  ambush claims a crew member, their identity (template, nickname, level) is persisted to a new
  `capturedCrew` list rather than just being deleted. **The Locked Ward**, a new fixed map marker
  at Tortuga (dims when no one's held, lights up like an available quest marker when someone is),
  opens a dynamic screen listing everyone currently captured with an "Attempt Rescue" button per
  person — no per-incident map markers needed since the list is data-driven. Rescuing fights a
  jailer (reuses `navy_marine`/`rival_deckhand` from the existing threat templates, scaled to at
  least the captured member's own level) via a new `rescue` encounter faction: victory calls
  `rescueCrewMember`, which restores them at 50% HP (boarding the ship if there's room, otherwise
  Crew Quarters) and adds a small heat bump (+8, on par with other provocative crime-layer
  actions); losing costs nothing further — no recruit option (matches every non-`wild` faction),
  flee always available. The Quest Log also surfaces a read-only Captured Crew section pointing
  players toward Tortuga, so the mechanic doesn't rely on stumbling onto the map marker

### Side Quest Concepts (brainstormed)
- ⬜ **Smuggling runs** — timed delivery of contraband cargo; a navy patrol encounter en route adds
  heat on top of losing the goods, turning the heat system into an active quest risk
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

### Scaling to 150+ Mini Quests: the Patrons System (planned 2026-07-31, foundation built 2026-07-31)
- ✅ **Foundation built and proven with 2 example patrons — bulk content authoring is still the
  remaining work, in future batches.** Revises the side-quest target up from 15-20/25-30 to
  **150+**, via a mechanism that keeps the per-quest cost low instead of scaling authoring effort
  linearly:
  - **The key unlock: quests don't need their own map marker.** Every side quest so far has been a
    standalone 📜 marker with its own island offset — that's what made "120 quests" look
    map-cluttered and expensive. Instead, **buildings can host multiple named "patrons"** — walk-in
    NPCs you talk to once inside, each offering their own self-contained one-off quest, all sharing
    the single map marker/interior the building already has. A tavern doesn't need 5 quest markers
    on the map for 5 quests — it needs 5 patrons sitting inside it
  - **A reusable patron archetype roster** to draw from per building (mix and match, not
    one-per-building): the Barkeep, a Local, a Drunk (comic/unreliable framing), a Rival Pirate
    (morally-grey exchange), a Wandering Sea Dog, a Constable/Lawman (bounty-flavored — already
    used for Cull the Cattle Rustler and The Bounty Board), a Smuggler (crime-flavored), a Grieving
    Widow/Local (already used for A Toast for the Fallen), a Fortune Teller/Mystic (curse-flavored,
    matches the folklore layer), an Old Captain (lore/specialty-gated), a Ship's Cook
    (resource-flavored), a Navy Deserter (heat-flavored, risky), a Cabin Boy (low-stakes comic). All
    reuse the existing quest types (`bounty`/`fetch`/`specialty_gate`/`escort`/`heat_bounty`) — no
    new mechanics required to hit volume
  - **Rough math for why 150+ is realistic, not aspirational**: ~12 existing buildings × 3-5
    patrons each ≈ 40-60, plus the already-flagged gap of adding more buildings per island (Pokémon
    towns run 3-5 per town; most islands here only have 1-3 today) — 2-3 more buildings per island
    × their own patrons adds another 60-100+ over time. Split **some island-specific** (a tavern
    needing rum at New Providence, matching its real rum-running history — same flavor-matching
    approach already used for every building/lord/resource) **and some generic/templated** (a
    reused fetch/gather skeleton with light variation, no less legitimate than Pokémon's own
    identical-mechanic-different-NPC gyms)
  - ✅ **Engineering foundation, built**: `SideQuestBase` gained an optional `hostedByBuildingId`
    field and made `offset` optional — a quest with `hostedByBuildingId` set has no map marker of
    its own. `BuildingScreen` gained a **Patrons** section (same generic-section pattern already
    used for Craft/Sell/Steal/Ship Upgrades) that lists every quest hosted by that building and
    opens the existing, unmodified `SideQuestScreen` flow per patron on tap. `MapScreen`'s quest
    marker rendering and walk-up proximity trigger both filter to `quest.offset` only, so
    patron-hosted quests never appear on the map or at anywhere near it — reached purely by walking
    into the building. No new quest mechanics were needed; `fetch` and `bounty` both work
    unmodified through this new hosting path
  - ✅ **Proven with 2 examples at Tortuga's tavern (The Salty Parrot)**: Wobbly Pete (a Drunk
    patron, `fetch` type — wants a Rum Ration) and Barmaid Ross (a Local patron, `bounty` type —
    wants a new common-rarity `tavern_troublemaker` bounty target dealt with). Both tested
    end-to-end in-browser: walking into the tavern shows both patrons with no extra map markers
    anywhere, talking to either opens the normal quest accept/confront/complete flow, and both
    complete correctly and show up in the Quest Log
  - ⬜ **Remaining work is content authoring, not engineering**: apply this same pattern to the
    other ~11 existing buildings (and new buildings as islands grow more of them per the
    already-flagged town-density gap), batching quests over future sessions toward the 150+ target.
    Explicitly **not** claiming 150 fully bespoke unique narratives — some will be short, familiar,
    formulaic (that's fine, matches how mini-quests actually scale in bigger games); the goal is
    volume of *fun, flavorful, non-duplicate* content without 150x-ing the writing effort per quest

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
- ✅ **HUD audit against a ChatGPT-mocked art-style reference (2026-08-01)**: the reference nailed
  the pixel-art chrome aesthetic but its actual HUD content (player/companion HP bars, Achievements,
  a "Pirate Pass" button, global always-on Shop/Craft buttons, a minimap) was a generic RPG template,
  not derived from our systems — several pieces directly conflict with decided mechanics (no player
  HP system exists; Cheeky is deliberately non-mechanical; "Pirate Pass" implies a season-pass
  monetization scheme never decided; global Shop/Craft buttons undermine the walk-up-only
  interaction model that's a core design pillar and an onboarding tip). Adopted only what's real:
  a wood/brass pixel-frame reskin of the existing Map header (`#2b1c12` wood + `#c9a227` brass
  border, cosmetic only, zero mechanic changes) and one genuine functional gap it surfaced — no
  on-map indicator of the current objective, the main quest was buried in Menu → Quest Log
- ✅ **Persistent on-map quest tracker**: a tappable strip under the heat bar showing the live main
  quest objective, derived from real store state (`defeatedLordIds`, `completedQuestIds`) via the
  same `isLordUnlocked` helper the Quest Log itself uses — not a separate/hardcoded copy. Handles
  all state transitions correctly: next unlocked lord ("Defeat Iron Jenny at New Providence"), the
  Council gate before Blackbeard is challengeable ("Complete 'The Pirate Council' at Ocracoke
  Inlet"), and the true endgame banner once all six are defeated. Verified via an isolated `tsx`
  script exercising the real exported functions across all six progression states (fresh save →
  each sequential lord → Council-gated → post-Council → all defeated), plus in-browser for the
  fresh-save case. Tapping it navigates straight to the Quest Log
- ✅ **Player identity on the Map HUD itself**: a small captain tag (👦 Captain Scally) above the
  zone name in the header — previously "Captain Scally" only appeared on the Menu screen, not on
  the screen the player actually spends most of their time on
- ⬜ Separate Bag/inventory screen — still folded into the Crew screen (Cargo Hold), a real but
  lower-priority gap from the same audit
- ⬜ Save/Options screen — autosave via the persisted store exists, but no manual save indicator or
  settings screen (volume, reset save is dev-only)
- ⬜ Party/move-management screen (nicknames, move loadouts)

## Onboarding & Tutorial
- ✅ **First-launch overlay**: a lightweight, skippable, 3-step overlay (Drag to Sail / Walk Right
  In / Mind Your Heat) shown once on a fresh save, gated by a persisted `hasSeenOnboarding` flag.
  Skippable at any step via a Skip button, or steps through to a "Got it, let's sail!" CTA on the
  last step — either path marks it seen permanently. Resetting the save (Debug screen) also resets
  this flag, so it can be re-tested without a fresh install
- ⬜ No day/night or weather-specific onboarding beats yet (not needed until those systems exist)

## Playable Deploy (GitHub Pages)
The live build is at **https://joeeaton11.github.io/Pirate-game/**, served from this repo's
`gh-pages` branch. There is no CI/automated pipeline for this — every deploy is a manual export +
publish, repeated each time a session wants to push a new build. The process, reconstructed
2026-08-22 from the `gh-pages` branch's own commit history (no script or written record existed
before this):

1. `npx expo export --platform web --output-dir <dir>` — produces a static build (`index.html`,
   `_expo/static/js/web/*.js`, `assets/`, `favicon.ico`, `metadata.json`).
2. **The export's asset/script paths are absolute (`/assets/...`, `/_expo/...`), which breaks once
   served from GitHub Pages' subpath** (`/Pirate-game/`, not the domain root). `EXPO_BASE_URL` does
   **not** fix this in the installed Expo CLI version — confirmed by testing it directly, output was
   byte-identical with or without it. The fix has to be a manual text rewrite after export:
   - In every `_expo/static/js/web/*.js` bundle file: `"/assets/` → `"/Pirate-game/assets/` (the
     bundle bakes in ~600 absolute asset references for every sprite/font/sfx the app can show —
     all of them need this, not just the ones visibly used on the first screen).
   - In `index.html`: `href="/favicon.ico"` → `href="/Pirate-game/favicon.ico"` and
     `src="/_expo/` → `src="/Pirate-game/_expo/`.
   - This is exactly what every prior `gh-pages` commit already did (confirmed by diffing an
     unmodified fresh export against the last working deployed bundle) — not a new fix, just an
     undocumented repeated one.
3. A `.nojekyll` file must exist at the published root — GitHub Pages' default Jekyll processing
   ignores underscore-prefixed directories, which would silently drop `_expo/` entirely without it
   (an earlier session hit this and left a "Restore .nojekyll" commit on `gh-pages` as the trail).
4. Publish via a git worktree checked out to `gh-pages` (`git worktree add <dir> gh-pages`), replace
   its tracked content with the rewritten export (`git rm -rq .` then copy the new files in), commit,
   push, remove the worktree. Never rewrite `gh-pages`' history — always a new commit on top, so the
   branch's own log stays a readable deploy history (see its commit messages, all prefixed
   `Deploy: ...`).

**This session's own network policy could not reach `joeeaton11.github.io` to self-verify a push
landed** (the outbound proxy allowlist doesn't include it) — pushing the `gh-pages` ref and
confirming via `git ls-remote` was the only self-check available; the user's own reload of the page
is the real confirmation. Say so plainly rather than claiming a live check that didn't happen.

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
- ✅ **Brand decision (2026-07-31)**: the cheerful, all-ages "Scallywags" brand/mascot style guide
  is packaging, not a tone change. Captain Scally became the named protagonist (see Premise &
  Goal), but permadeath, heat/crime, and bounty violence stay exactly as designed — the brand
  sits on top of the existing Moderate/Teen mechanics, it doesn't soften them

## Art Direction — DECIDED: Pixel art (16/32-bit RPG style)
- ✅ Target look: SNES-era JRPG pixel art, not strict 2-bit Game Boy — richer color, still readable
  at small mobile sizes, animates cheaply via spritesheets
- ✅ **Real reference art landed (2026-08-11)**: the user supplied the actual "Scallywags" brand
  sheet and a production sprite sheet for Captain Scally (walk cycles, idle, portrait, and more)
  generated to match it. Saved as-is for reference at `assets/brand/scallywags_brand_sheet.png` and
  `assets/brand/scally_sprite_sheet_source.png` — not shipped in-game directly, but the source every
  future sprite cut should match stylistically
- ✅ **Captain Scally's map token is real sprite art, not emoji (2026-08-11)** — first slice of the
  incremental per-screen art pass. Cut 20 walk-cycle frames (4 directions × 5 frames) from the
  production sheet into individually transparent PNGs (`assets/sprites/scally/walk_<dir>_<frame>.png`,
  background removed via a flood-fill + connected-component + morphological-opening pipeline, no ML
  tooling available in this environment) plus a bust portrait (`portrait.png`, not wired into any
  screen yet). `src/data/scallySprites.ts` exposes `scallySpriteSource(direction, moving, frame)`.
  `MapScreen.tsx`'s player token now renders `Animated.Image` for Scally on land, replacing the old
  2-state (front/side + horizontal mirror) emoji trick with a true 4-directional facing (down/left
  /right/up) driven by drag vector, cycling all 5 walk frames on a 110ms interval while moving and
  holding frame 0 as the idle pose once stopped (the source sheet's separately-cut idle panel had
  inconsistent scale/framing between directions, so idle intentionally reuses each direction's own
  walk-frame-0 rather than shipping mismatched art). The existing vertical `walkBounce` animation is
  kept layered on top for a little extra life. The sea token (⛵) and the Map header's captain tag
  are unchanged — no ship sprite was cut, and the header tag is a small inline glyph, not the map
  token. Verified in-browser via Playwright: dragged in all 4 directions, screenshotted and visually
  confirmed each shows the correct sprite (front/back/left-profile/right-profile), confirmed two
  consecutive in-motion frames differ (walk cycle actually animates), confirmed it holds the last
  facing direction at rest, zero console errors
- ✅ **Turn frames — Scally pivots instead of snapping between directions (2026-08-11)**: the sheet's
  "Turn Frames (8 directions)" panel is a continuous half-circle sweep (down -> down/right -> right
  -> up/right -> up -> up/left -> left) — a real mid-pivot pose for 3 of the 4 cardinal-to-cardinal
  turns. Cut those 3 (`turn_se.png`, `turn_ne.png`, `turn_nw.png`) with the same cutout pipeline as
  the walk frames, located by an edge-energy column scan (gradient magnitude per column, valley-
  finding via `scipy.signal.find_peaks`) rather than eyeballing a grid, since this panel's characters
  weren't evenly spaced. The 4th pivot (left <-> down, the "SW" quadrant) isn't in the sheet — the
  sweep only goes one way around — so it reuses the SE frame horizontally mirrored, the same flip
  trick the old emoji token used. `scallySprites.ts`'s `turnFrameFor(from, to)` looks up the right
  frame (or null for a direct 180 — down<->up / left<->right — which the sheet doesn't cover either,
  so those still snap instantly). `MapScreen.tsx` watches `facingDir`, shows the matching turn frame
  for `TURN_ANIMATION_MS` (100ms) on a real change, then falls back to the normal walk/idle art.
  Verified in-browser: a long-duration test run confirmed the correct turn pose renders and holds for
  the full window; an `<img src>`-polling script (more reliable than eyeballing thumbnails — the
  first screenshot-based pass gave a false negative) confirmed all 4 mapped pivots show the right
  frame, the down<->left pivot's `matrix(-1, 0, 0, 1, ...)` computed transform confirms the mirror is
  actually applied, and the unmapped down->up pivot correctly shows no turn frame at all
- ✅ **Tortuga Cove's ground and buildings are real art, not emoji (2026-08-11)** — second slice of
  the incremental art pass, and the first for the world map itself rather than the player token.
  The user supplied two reference tileset sheets (`assets/brand/tileset-catalog/master_catalog_v1
  .png`, a 16-category master catalog preview, and `tortuga_focus_v1.png`, a Tortuga-specific pass
  whose building nameplates — INN, TAVERN, TRADING CO, BLACKSMITH, TAILOR, MARKET, FISHMONGER,
  SHIPYARD, DOCK OFFICE, a skull-flagged "smuggler's den" building — happen to match a good chunk of
  Tortuga's existing shops almost exactly) with a stated plan to regenerate the rest as one clean
  sheet per category later. This slice uses what's already in hand:
  - **Ground texture**: 5 tiles (grass/sand/cobble/wood/water) cut from the master sheet's clean,
    evenly-gridded terrain panel, tiled behind Tortuga Cove's polygon via a real SVG `<Pattern>` +
    `<Image>` (`react-native-svg` supports both) referenced as the Polygon's `fill` — no rendering
    architecture change needed, just swapping `fill="#2c7a4b"` for `fill="url(#grassPattern)"` on
    Tortuga specifically; every other island keeps the flat color for now.
  - **13 building icons** (`assets/sprites/buildings/`) cut from the Tortuga sheet's two building
    rows. Unlike the character sheet, these sit over a continuous blurred photo-style background
    with no flat/gradient boundary to key on, so the flood-fill cutout that worked for Scally kept
    bleeding into neighboring buildings here. First attempt papered over that with a soft vignette
    (fade a rounded-rect alpha mask at the edges) instead of a real cutout — the user correctly
    called this out as lazy, since it hid the bleed rather than removing it and shipped visibly
    blurry, muddy icons. Replaced 2026-08-11 (see below) with a real edge-based segmentation.
  - **`spriteId` field added to `Building`** (`src/data/buildings.ts`) — set on 10 of Tortuga's 18
    buildings where a genuine name/theme match exists (tavern→tavern, harbourmaster→dock_office,
    the two smuggler-themed buildings→smugglers_den, etc. — see `worldSprites.ts`'s header comment
    for the full mapping); the rest keep their emoji marker unchanged. `MapScreen.tsx`'s building
    render branches on `spriteId` to show a real `Image` (sized larger than the emoji marker's tight
    box, no dark badge chrome behind it) instead of the emoji/house-badge fallback.
  - **The Black Pearl** now renders as the sheet's black skull-flagged ship (a striking thematic
    fit) instead of an emoji, keeping its captured/guarded status ring but dropping the translucent
    fill that would've tinted the art.
  - **A new Tortuga gate landmark**, cut from the sheet's own "TORTUGA" arch prop, placed near the
    harbor entrance — a one-off piece rendered directly rather than added to the reusable LANDMARKS
    data type.
  - Also cut but not yet placed: 3 more building icons with no current 1:1 match (`weapons`,
    `spice_merchant`, `lighthouse_chapel`), a second ship, a rowboat, a dock/pier piece, and 3 flags
    (`assets/sprites/world/`) — saved for the next pass.
  - Everywhere outside Tortuga Cove (other islands, ships at sea, UI chrome, other named crew) is
    still emoji/procedural, per the user's own incremental plan — worth resuming once more
    per-category sheets exist.
  - Verified in-browser: zero console errors across the full session; confirmed via a `getComputedStyle`
    transform readout that player-drag movement genuinely advances world coordinates (ruling out a
    stuck-token illusion during manual QA); walked the player to the tavern and screenshotted it
    rendering correctly in place, nameplate legible, blending into the surrounding procedural streets,
    with the real "Enter The Salty Parrot?" prompt showing beneath it.
- ✅ **Real cutouts, not vignette crops, for all Tortuga sprite art (2026-08-11)** — the user flagged
  the vignette approach above as lazy, correctly: it hid background bleed behind a blur instead of
  actually removing it, so every icon shipped soft and muddy at the edges instead of crisp. Fixed
  with a real segmentation technique instead of a color-based cutout: these sheets render every
  foreground object in sharp focus over a genuinely *blurred* background (real depth-of-field, not
  just a flat/gradient color), so the blur itself is a reliable signal — segment on local edge/
  gradient strength rather than color. Pipeline: gaussian-smooth, take the gradient magnitude,
  threshold it into a boundary mask, dilate+close to seal any gaps in that boundary into a closed
  contour, `binary_fill_holes` to solidify the interior, erode back off the dilation, keep the
  largest connected component, feather the final edge ~1px for anti-aliasing. Re-cut all 13
  buildings plus the ship, gate, rowboat, dock/pier, and 2 of the 3 flags with this technique —
  clean silhouettes, zero bleed, no vignette softness. Along the way, caught and fixed two real
  mis-crops from the first pass that the vignette blur had been hiding: the ship's masts/sails were
  silently missing entirely (crop box too tight vertically), and "flag_uk" was actually the red
  skull flag cut from the wrong coordinates — both now correct. Dropped `flagSkullRed` (couldn't get
  a clean cut in the time available; it wasn't wired into the game yet, so nothing regressed) and
  two never-used flag sprites (`flag_france`, `flag_spain`) left over from the first pass, rather
  than ship unverified assets. Verified in-browser: zero console errors, and walked the player back
  to the same tavern spot to confirm the new crisp-edged art renders correctly live, replacing the
  old blurry version.
- ✅ **Tortuga's roads are real cobblestone, not a flat color (2026-08-11)** — the user asked why the
  street/path rendering hadn't been touched, correctly: the `cobble` tile had been cut and sat
  unused in `GROUND_TILES` since the very first pass, an oversight. `STREETS.map` in `MapScreen.tsx`
  still drew every road as flat-color `Line` strokes. Fixed by adding a second SVG `<Pattern>`
  (`cobblePattern`, same `GROUND_TILES`/`<Defs>` mechanism as the ground fill) and referencing it as
  the `stroke` on Tortuga's `'main'`-style street segments — SVG strokes can reference a `<Pattern>`
  exactly like a fill can, so no new rendering mechanism was needed. The wider light sidewalk stroke
  underneath stays a flat color (reads as a curb/edge); only the inner road surface got the texture.
  Scoped the same way as the ground tile fill: Tortuga Cove's `'main'` streets only — every other
  island, and Tortuga's own dirt `'path'`-style tracks (no sidewalk, dashed line), keep the flat
  color they had, since there's no dirt-track tile cut yet and forcing cobblestone onto a "rough,
  treacherous route" would contradict its own design intent. Verified in-browser: zero console
  errors, walked to the tavern and confirmed the road surface now shows visible stone-block texture
  instead of a flat tan fill.
- ⬜ Everything else is still emoji-as-sprite placeholders (other islands' buildings, islands/tiles
  elsewhere, battle backdrops, UI chrome, other named crew). Worth tackling incrementally per-screen
  rather than as one giant art pass — Tortuga Cove is the first full slice of that

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
- ✅ Target ~6-10 hours for the **mandatory** main-quest spine at launch (leaner than Pokémon's
  ~20-26 hour campaign), designed around short 5-15 minute mobile sessions rather than long
  sit-downs. This was a deliberate call, revisited 2026-07-31 (see below) and reaffirmed rather
  than lengthened
- ✅ Difficulty curve: easy/forgiving early (matches Pokémon's own approachability plus our rescue
  mechanic), real tension emerging mid-to-late game as heat rises — that's the differentiator,
  not overall length or raw combat difficulty
- ✅ **Mandatory vs. optional content, decided 2026-07-31**: the mandatory path is exactly the
  5 sequential Pirate Lords → the Pirate Council → Blackbeard, and nothing else. Every side quest,
  resource system, crafting recipe, ship upgrade, and crime-layer mechanic is optional. This
  mirrors classic Game Boy Pokémon's own split (gyms mandatory, nearly everything else optional —
  Gen 1 itself only has ~5-8 loose side objectives in the whole game, so a short mandatory spine is
  actually the *closer* match to the stated Pokémon benchmark, not a deviation from it)
- ✅ **Total playtime lever, decided 2026-07-31**: considered lengthening the main quest itself
  GTA5-style (its main story alone runs ~30 hours, ~69 missions, before counting ~15 Strangers-and-
  Freaks side questlines and dozens of non-quest sandbox systems that pad the rest of its ~50-80
  hour total). Decided against — GTA5 is a long-session console epic; this is F2P mobile with
  session-frequency-over-months as the real retention lever, not one long linear campaign, and that
  was already the stated design intent above. **The lever for more total playtime is optional
  content, not a longer mandatory spine**: more side quests, and leaning harder into the
  repeatable/systemic loops already built (resource gathering, the crime layer, the Bounty Board)
  plus future live-ops/dailies. **Target revised again same day to 150+ total mini quests** via the
  Patrons system (see Quests & Main Story below) — buildings hosting multiple walk-in quest-givers
  sharing one map marker, rather than one quest per marker. This keeps per-quest authoring cost low
  enough that 150+ is a realistic batch-built backlog, not a scope blowout, while the mandatory
  path stays untouched
- ⬜ Side content/live-ops (events, dailies) intended to extend engagement beyond the main quest
  once there's a content cadence to support it — the primary vehicle for the playtime lever above

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
15. ✅ **Prisoner rescue** — `removeCrewMember` now persists captured-crew identity
    (`capturedCrew`), and a new Locked Ward marker at Tortuga + `rescue` encounter faction lets you
    fight a jailer to win them back at reduced HP. Gives permadeath the narrative payoff this list
    called for, reusing existing threat templates rather than adding new opponent data
16. ✅ **Pirate Council + final superboss (Elite Four/Champion equivalent)** — a new Ocracoke Inlet
    island hosts a back-to-back rematch gauntlet against all 5 Lords (reusing the escort wave-quest
    mechanic) which unlocks Blackbeard as a 6th, quest-gated Pirate Lord. The game finally has a
    real ending state to point playtesters at, built almost entirely by reusing existing fort/quest/
    badge machinery rather than inventing new screens
17. ✅ **Patrons system foundation** — `SideQuestBase` gained an optional `hostedByBuildingId`
    (offset becomes optional alongside it), so a quest can be reached by walking into an existing
    building instead of needing its own map marker. Proven with 2 example patrons at Tortuga's
    tavern (a fetch and a bounty, both tested end-to-end). This is the engineering prerequisite
    for scaling to 150+ mini quests — content authoring across the other buildings happens in
    future batches, not all at once
18. ✅ **Walkable building interiors** — building interiors are now real small floor-plan rooms
    (furniture as styled shapes, walk-up-to NPC tokens) instead of a static list-menu, matching
    Pokémon's actual walk-into-a-room pattern. `src/data/interiors.ts` holds hand-authored layouts
    plus a fallback generator so every building works even before it gets a bespoke floor plan.
    Reuses the outdoor drag-movement engine at room scale — no new movement tech, no new quest
    mechanics, just a new way of *arriving* at the same hire/shop/craft/patron content that already
    existed
19. ✅ **Real-world coastline shapes** — all 7 islands replaced their perfect-circle landmass with
    a hand-authored irregular polygon echoing the real island's true orientation/elongation
    (`Island.shape`, point-in-polygon `islandAtPoint()`, `react-native-svg` rendering in
    `MapScreen.tsx`) — see the "Real-world coastline shapes" note above
20. ✅ **Tortuga Cove: the whole-island blueprint** — a real street plan (`src/data/streets.ts`)
    covering the entire landmass, 3 new enterable buildings with interiors + Patron quests (Fort de
    Rocher, Chapelle Notre-Dame, Smugglers' Warehouse), 1 more new building on the previously-empty
    west tail (West Point Shack), 2 non-interactive landmarks (Basse-Terre Square, The Harbor Pier),
    1 new scenery-only landmark (La Ringot Fields), and patrolling ambient street NPCs
    (`src/data/streetNpcs.ts`) — see the "Tortuga Cove: the whole-island blueprint" note above

### Now (next up)
21. ✅ **New Providence** done (see the "New Providence: the blueprint repeated" note above) —
    **repeat the whole-island blueprint for the remaining 5 islands** (Port Royal, Roatán,
    Ocracoke Inlet, Île Sainte-Marie, Cow Island) — street plan + landmarks + enterable buildings +
    street life, same historically-grounded approach proven on Tortuga Cove and now New Providence
22. ✅ **Bespoke floor plans for every remaining building** (2026-08-02) — the 12 buildings still
    falling back to the generic room (`tortuga_shop`, `cow_island_camp`, `new_providence_tavern`,
    `new_providence_careening_yard`, `roatan_den`, `port_royal_college`, `port_royal_manor`,
    `ile_sainte_marie_shrine`, `tortuga_fishmonger`, `new_providence_distillery`,
    `roatan_timber_yard`, `port_royal_armoury`) each got a hand-authored `BUILDING_INTERIORS`
    entry themed to their name/dialogue instead of `fallbackInterior()` — e.g. the manor's ⚔️ prop
    nods to Lady Ashworth's "his cutlass is still quite sharp" line, and the beach camp skips a
    `counter` entirely and centers a ⛺ tent for its outdoor feel. Every building in the game now
    has a real room. Verified with `npx tsc --noEmit` plus in-browser screenshots (via a temporary
    auto-navigate-on-mount test effect, fully reverted after) across 5 representative layouts —
    counter+shelves (shop), tables+chairs (tavern), altar (shrine), no-counter outdoor (camp), and
    4-shelf bookcase wall (college) — confirming no overlapping furniture and every NPC spot clear
    under the `INTERIOR_ZOOM=2` camera. Patron quests for these buildings are still future content.
23. ✅ **Tortuga Cove enlarged 1.35x: woodland, a ruined redoubt, and an abandoned quarter**
    (2026-08-02) — the first island to get more physical room rather than more content packed
    into the same footprint. `TORTUGA_SHAPE` scaled 1.35x from island center in `islands.ts`;
    every existing marker (buildings, houses, landmarks, resource nodes) keeps its old coordinate
    unchanged and now simply sits further inland from the new coastline — verified with a script
    that reruns the real `islandAtPoint()` against every Tortuga marker and every street endpoint,
    confirming all still resolve to land, plus a neighbor-clearance check against Cow Island and
    New Providence (nearest at 283 world units, comfortably clear). Three new zones fill the freed
    ring of land, each tied to real Tortuga history rather than invented lore: (1) **El Fuerte
    Viejo**, a new enterable building (`ruins`, a new `BuildingType`) on the west cape — a Spanish
    redoubt predating Fort de Rocher, since Tortuga was Spanish before French buccaneers seized it
    in 1629; its bespoke interior skips the rug/counter every other building gets, using rubble,
    moss, and cobweb props instead to read as abandoned; (2) **The High Woods**, a forested
    landmark plus two new timber resource nodes on the east cape, its flavor text tying to the
    real etymology of "buccaneer" (from *boucan*, the smoking-frame buccaneers used before they
    turned to piracy); (3) **Ruins of the Old Landing** and **The Forgotten Graves**, two
    non-interactive landmarks on the newly-opened south coast referencing the Spanish razings of
    the original Tortuga settlement in 1635 and 1638. All three zones are reached by winding,
    multi-bend `path`-style trails (not paved `main` streets) branching off the existing town —
    the East trail forks to both timber nodes, reading as an actual forest path rather than a
    straight line. Verified in-browser: screenshots of all three zones from the map (coastline,
    forking trails, landmark/resource rendering) plus the new building's interior, using the
    established TEMP-TEST-SPAWN/TEMP-TEST-ENTER techniques, fully reverted after (confirmed via
    `git diff` showing zero net change to `MapScreen.tsx`).
24. ✅ **A real forest, ruin rubble, and grave markers — plus a woodland recruit** (2026-08-02) —
    the three new zones from the enlargement had only one named landmark icon each; this pass adds
    the actual visual density and one more piece of interactive content. New `src/data/scenery.ts`
    introduces a `SceneryProp` type: pure decoration with zero gameplay hook (no proximity toast,
    no collision) — Landmarks stay reserved for the one or two *named, described* points of
    interest in an area, Scenery is the dozens of small background details around them, the same
    relationship Houses already have to named Buildings. All 29 positions were generated by a
    script that scattered candidates inside each zone and filtered them to real land, clear of
    every other marker and of each other, rather than hand-placed — the same discipline as every
    other geometry pass this project has done. The High Woods gets 18 trees (pine/hardwood inland,
    palms toward the shoreline) turning one landmark tree into an actual forest with a real canopy
    to walk through; El Fuerte Viejo gets rubble and creeping vines scattered around the building
    itself; the abandoned quarter gets grave markers, scorched rock, and moss. Also added **The
    Trapper's Camp**, a new enterable building deep in the High Woods (reusing the `beach` type
    like the game's other rustic huts) — Boucanier Yves, a recruit whose whole presence is the
    payoff of the High Woods landmark's own flavor text about the *boucan* smoking-frame origin of
    "buccaneer." Placement required a dedicated clearance search (`find_camp_spot2.ts`) since the
    forest and existing infrastructure had already filled most of the cape tightly enough that a
    naive coordinate guess kept landing inside a tree or too close to the Customs House; the script
    swept the whole zone scoring candidates by violation count against every building (55 units),
    landmark/resource (35), house (30), and scenery prop (30), and returned the one true zero-
    violation spot. Reached by extending the timber-node trail one more spur rather than a new
    branch off town. Three new ambient `STREET_NPCS` (a Boucan Hunter, a Ruin Scavenger, a Quiet
    Mourner) give each zone a wandering flavor character, anchored exactly on existing path-bend
    coordinates so they resolve onto the real trail network immediately. Verified with
    `npx tsc --noEmit`, the full marker/street `islandAtPoint()` sweep, a scenery-specific overlap
    script, and in-browser screenshots of the forest, the camp (map + interior), the ruin rubble,
    and the grave markers — all via the established TEMP-TEST-SPAWN/TEMP-TEST-ENTER techniques,
    fully reverted after (confirmed via `git diff` showing only the intended net change).
25. ✅ **The whole world doubled in size** (2026-08-02) — rather than repeat the Tortuga-style
    enlargement island-by-island, every island and every sea gap between them doubled at once, in
    a single pass: `WORLD_WIDTH`/`WORLD_HEIGHT` (1800×2600 → 3600×5200), every island's absolute
    `position` (doubling the distance between every pair of islands, since scaling positions by 2
    from a shared origin scales every pairwise distance by 2 too), every island's coastline `shape`
    polygon, and every single island-relative coordinate in the game — building/house/landmark/
    resource-node/scenery/salvage-site `offset`, Pirate Lord `buildingOffset`, street NPC `anchor`,
    street segment `from`/`to`. Building icon size, `ENTER_RADIUS`, collision radii, `ZOOM`, and
    every movement speed were deliberately left untouched — the request was a bigger world to
    explore, not bigger buildings or faster travel, so those pixel/interaction constants and
    world-unit-per-second speeds stay exactly as they were (a real, intentional side effect:
    crossing the map now takes twice as long in real seconds, flagged here as worth revisiting if
    playtesting finds it sluggish rather than "more to explore").
    Implementation was a scripted text-level transform (not a hand-edit pass and not an AST
    regeneration, which would have silently deleted the codebase's many prose comments) —
    a Python script matched the exact field-name patterns (`offset:`, `buildingOffset:`, `anchor:`,
    `position:`, `from:`, `to:`, each as `{ x: N, y: N }`) plus the bracket-tuple coastline points
    in `islands.ts`, and doubled only the numbers inside those specific patterns, leaving every
    other numeric literal (cost, level, weight, fontSize, room width/height, cooldowns, speeds)
    untouched since a blind find-and-replace on numbers would have corrupted unrelated data.
    Verified with `npx tsc --noEmit`; a whole-world script re-running the real `islandAtPoint()`
    against every marker and every street endpoint on all 7 islands (not just Tortuga this time);
    an all-pairs neighbor-clearance check (closest pair post-doubling: New Providence/Port Royal at
    566 world units, still far clear); and in-browser screenshots confirming the Tortuga home port,
    forest, and ruins zones render pixel-identical in composition to pre-doubling screenshots
    (proving the uniform scale preserved every relationship exactly), via the established
    TEMP-TEST-SPAWN technique with doubled spawn coordinates, fully reverted after. One pre-existing
    issue surfaced (not introduced) by the whole-world street check: 10 New Providence street
    endpoints already sat fractionally outside that island's coastline before this change too —
    confirmed by re-running the same check against the pre-doubling code — and left alone, since
    `streets.ts`'s own comment already documents this as an accepted quirk of the residential grid
    not perfectly following New Providence's rounder coastline, and streets are decorative only.
26. ✅ **Restored Tortuga's scenery density after doubling** (2026-08-02) — the world-doubling pass
    doubled the *spacing* between every scenery prop while deliberately leaving each prop's visual
    size (`fontSize`) untouched, which meant the High Woods, El Fuerte Viejo, and the abandoned
    quarter all read visibly sparser than before, not the same — since doubling both x and y
    spacing means each prop now covers roughly 4x the ground it used to. Fixed by thickening all
    three zones with the same generator-script approach already proven twice: the High Woods went
    from 18 trees to 72 (added 54, packed at 26-unit self-clearance instead of the original 20, and
    checked against every existing tree too so new growth never lands on old), El Fuerte Viejo's
    rubble from 4 to 14, and the abandoned quarter's debris from 7 to 23 — 109 scenery props on
    Tortuga total, up from 29. Verified with `npx tsc --noEmit`, the scenery-specific land/overlap
    script (all 109 pass), the whole-world `islandAtPoint()` sweep (no new failures beyond the
    pre-existing New Providence street quirk noted above), and in-browser screenshots from three
    different points inside the High Woods confirming a genuinely dense, consistent canopy rather
    than scattered individual trees.
27. ✅ **Loaded up the High Woods further** (2026-08-02) — even at 72 trees the canopy still read as
    individual trees rather than genuine forest; added 134 more with the same generator-script
    approach (self-clearance tightened from 26 to 17 units, and the sampling region widened to use
    the full cape out to the coastline) for 206 trees total, 243 scenery props on Tortuga overall.
    Verified with `npx tsc --noEmit`, the scenery land/overlap script (all 243 pass), the
    whole-world sweep (no new failures), and an in-browser screenshot showing a genuinely dense,
    edge-to-edge canopy from the player's spawn point in the woods.
28. ✅ **Loaded up the High Woods a third time** (2026-08-02) — from 206 trees to 345 (139 more,
    self-clearance 14). Caught and fixed a real bug from the previous pass in the process: that
    generator checked new trees against only a *filtered subset* of existing trees (anything with
    `offset.x > 280`), which silently excluded a chunk of the 206 already there and let a few dozen
    new trees land within 2-10 units of an existing one — close enough to visibly stack glyphs.
    Caught by the scenery-overlap script before it ever reached the browser; fixed by discarding
    that batch (`git checkout`) and rerunning with every one of the 243 existing Tortuga scenery
    props as collision context, not a filtered slice — cheap at this size, and the only way to
    *guarantee* no accidental overlap rather than hope the filter happened to be wide enough.
    382 scenery props on Tortuga total. Verified with `npx tsc --noEmit`, the scenery script (all
    382 pass, zero stacking), the whole-world sweep, and an in-browser screenshot confirming a
    genuinely edge-to-edge canopy with no visual overlap between trees.
29. ✅ **Two more Tortuga buildings: a hidden cache in the woods, a dock in the ruins** (2026-08-02)
    — the High Woods had only one building (the Trapper's Camp) despite now being a 345-tree
    forest, and the abandoned quarter had none. Added **The Smuggler's Cache** (reuses the
    `warehouse` type; Silent Mara, a `boarding_captain` recruit) tucked well off the main forest
    trail — its own dialogue and placement directly pay off Inspector Hale's Customs House line
    about "half of it" never reaching the crown, since this is where that half goes. Placement
    needed a dedicated clearance search (`find_new_buildings_2.ts`) since the now-345-tree forest
    had filled most of the cape too tightly for a naive guess; the script scored candidates against
    every building/landmark/resource/house/scenery prop and found the one genuine opening. Also
    added **The Old Landing Dock** (reuses `beach`; Old Ilsabet, a `tavern_brawler` recruit) at the
    literal site referenced by the "Ruins of the Old Landing" landmark — a family that never left
    after the 1635/1638 Spanish raids, giving that landmark's flavor text a face. Both connect via
    new winding `path` spurs off the existing trails (the cache via a deliberately fainter
    side-track off the Trapper's Camp, since a smuggler doesn't camp on the main road). Verified
    with `npx tsc --noEmit`, the whole-world `islandAtPoint()` sweep (no new failures), the scenery
    overlap script, and in-browser screenshots of both buildings on the map and both interiors.
30. **Fill the other 6 islands' new space with content** — the world-doubling pass above gave every
    island more room, the same way Tortuga's enlargement did on its own; what Tortuga got next
    (a real forest, ruin rubble, grave markers, a new woodland recruit — all script-placed and
    clearance-verified) hasn't been repeated anywhere else yet. New Providence, Roatán, Port Royal,
    Île Sainte-Marie, Cow Island, and Ocracoke Inlet are all still exactly as sparse as before,
    just with more empty water and grass around them
31. ✅ **The port: piers, boardwalks, moored boats, ships offshore** (2026-08-02) — new
    `src/data/harbor.ts` adds three pieces of pure decoration, same zero-gameplay-hook discipline
    as Scenery but deliberately placed *outside* the island's land polygon instead of inside it,
    since that's the whole point: `PierSegment` (boardwalk lines, rendered in the same `<Svg>` as
    streets/coastline with a weathered-plank double stroke distinct from both paved `main` streets
    and dirt `path` tracks — free to run straight over open water since it's SVG geometry, not a
    walkable network), `DOCKED_BOATS` (small moored boats right at the pier), and `OFFSHORE_SHIPS`
    (larger ships anchored further out, rotated for natural variety). The main pier starts at the
    existing Harbor Pier landmark and forks partway to a second, shorter dock; a separate pier
    reaches out from the Fishing Dock — two working docks instead of one for a busier harbor feel.
    Critical constraint, confirmed rather than assumed: the player can never actually walk out onto
    a pier, because sailing-vs-walking state is purely a function of the real island polygon
    (`islandAtPoint`) and piers are deliberately never added to it — verified in-browser by
    spawning directly on a pier coordinate and confirming the game correctly rendered the player's
    boat sprite (open sea), not a walking figure on solid ground. Coordinates were found the same
    way as the Trapper's Camp: a ray-cast search from the Harbor Pier landmark found the nearest
    real coastline in every direction, so the pier's land-to-sea transition sits at an actual
    shoreline crossing rather than a guessed distance. Verified with `npx tsc --noEmit`, a
    dedicated sea-placement script confirming every boat/ship/pier-tip resolves to open water (not
    accidentally on Tortuga or any other island), the whole-world sweep, and three in-browser
    screenshots: the forked pier boardwalk from land, small boats moored at the tips, and a large
    offshore ship. Turning this into a full port *district* (new streets, more waterfront houses)
    remains open if wanted — this delivers the specific ask (boardwalks into the sea, boats docked
    up, bustling docks), not a full neighborhood rebuild
32. ✅ **A GTA-style minimap radar** (2026-08-03, reworked twice from the first pass on 2026-08-02) —
    a small circular `<Svg>` panel fixed in the map screen's top-left corner (`MapScreen.tsx`),
    always centered on the player: the world scrolls underneath a marker that never itself moves,
    at a fixed local radius (`MINIMAP_RADIUS` world units in every direction) rather than showing a
    whole island or the whole world. Went through two earlier designs first, each replaced after
    seeing it actually run: v1 plotted all 7 islands on one whole-world-viewBox `<Svg>`, which read
    as tiny disconnected dots and didn't answer "where am I"; v2 scoped to just the current island's
    own bounding box (forest drawn as a dark-green tree mass, town as a building/house cluster,
    echoing a hand-drawn fantasy map reference the player shared) — better, but still went blank
    while sailing between islands since it had no island to show. The fixed-radius follow-cam radar
    (matching GTA's minimap) solves both at once: there's always *something* local to show
    regardless of what's underneath the player, on land or at open sea. Renders nearby streets,
    houses, buildings, forest (`SCENERY` entries with tree emoji, drawn as overlapping same-color
    circles that read as one solid canopy at this scale), Pirate Lord forts (colored by
    locked/available/defeated state), the current main-quest target as a gold ring, and the player
    as a red heading arrow that rotates to match the live drag direction and holds its last heading
    once released — everything filtered to a generous margin around the visible radius so nothing
    pops in/out right at the circle's edge. Verified with `npx tsc --noEmit`, and in-browser
    screenshots confirming the radar follows the player through the town center, along the
    coastline, and out into open water (correctly showing solid blue with just the heading arrow
    once nothing else is nearby), plus a drag-gesture test confirming the circular overlay's
    `pointerEvents="none"` still lets sailing work underneath it
33. ✅ **Resource/quest blips on the minimap radar** (2026-08-03) — the radar already plotted
    buildings and forts precisely, but resource nodes and side quests were conspicuously missing;
    added both as `react-native-svg`'s `<Text>` (imported as `SvgText` to avoid colliding with RN's
    own `Text`) rendered right inside the same world-unit-coordinate `<Svg>`, so no separate
    projection math was needed — a resource's real emoji (fish, timber, etc.) and a quest's 📜 now
    sit at their exact position on the radar, the same two categories the pre-existing edge-of-screen
    icons already track (ready resource nodes only, standalone quests only, filtered to the visible
    radius). Deliberately left the edge-of-screen icons in place rather than replacing them per the
    player's ask — they still cover a different range: they clamp to the screen edge and stay visible
    at *any* distance on the current island, while the radar blips only exist within its fixed local
    radius, so a resource node farther out (real on Tortuga's enlarged layout) still needs the edge
    icon once it's outside the radar's reach. Verified `npx tsc --noEmit` and an in-browser screenshot
    of the Fishing Dock's 🐟 and a nearby quest's 📜 both rendering clearly at readable size on the radar
34. ✅ **The big dock: a real port district** (2026-08-03) — delivers the "full port district (new
    streets, more waterfront houses)" follow-up that item 31's piers/boats pass deliberately left
    open. The whole area between the Warehouse and Harbor Pier was still empty grass — no houses,
    only a 3-segment street stub — despite the piers/boats sitting right offshore of it. A grid-search
    script (same approach as the Trapper's Camp/Smuggler's Cache placements: score candidate points
    by violation count against every existing marker, land-check, and a coastline buffer so nothing
    sits right at the water's edge) found room for 3 new buildings — **Harbourmaster's Office**
    (customs-type, `master_gunner` recruit — Voss runs the waterfront and its paperwork), **The
    Chandlery** (shop-type, `powder_monkey` recruit — Fenwick sells rope/tar/sailcloth), **Dockworkers'
    Bunkhouse** (warehouse-type, `tavern_brawler` recruit — Cutter Doyle and five others share a leaky
    room) — plus 9 waterfront row houses and a proper street front (`main` pavement) connecting
    Warehouse → Chandlery → Harbourmaster's Office → Harbor Pier and → Dockworkers' Bunkhouse, with a
    second, rougher `path` from the Bunkhouse up to Fort de Rocher. Two new street NPCs (A Rigger, A
    Fishwife) patrol the new pavement using the same street-network wander system as the rest of town.
    Every one of the 3 buildings + 9 houses was verified individually: on real land (point-in-polygon
    against the true `TORTUGA_SHAPE`), clear of all 535 existing markers *and* the newly-added streets
    (a coastline buffer and a street-line buffer, not just point clearance, so nothing ends up
    standing in the water or straddling the new road), with the one pairing that came back tight
    (a house 28 units from the Bunkhouse, under the ~35-unit combined visual radius) nudged out to 40
    before shipping. Verified `npx tsc --noEmit`, then in-browser: each of the 3 new interiors
    (candle/rope/scales/bunks all rendering as designed), each building's entry prompt, the Fishwife's
    walk-up flavor toast firing correctly, and the minimap radar picking up the new cluster
35. ✅ **A proper harbour: quay, extra jetties, breakwater, lighthouse** (2026-08-03) — direct
    follow-up after seeing the district: "you know the docks are in the water right" — the two
    original piers reached out from a road-facing base, but there was no actual built shoreline
    behind them, just the natural coastline. Found the real coastline the same way as every pier
    tip so far — ray-cast sweeps due north from points along the harbor front until `islandAtPoint`
    flips from land to sea — which revealed the harbor front is a shallow natural headland (the
    coast peaks around x=50–70, curving back on both sides). Added `QUAYS` (a 6-segment stone
    embankment hugging that exact curve, rendered in grey masonry — solid double-stroke, distinct
    from both the wood-plank piers and the paved town streets — sitting a few units inland of the
    true coastline so it always draws on solid ground, never floats over water), 2 more jetties
    branching off the quay itself into open water, 4 more docked boats (2 at the new jetty tips, 2
    rowboats tied directly against the quay wall), a `BREAKWATER` arm further out enclosing a
    sheltered basin with 2 more ships riding at anchor inside it, and **The Lighthouse** — a new
    landmark placed right on the headland the coastline forms, the one point along the whole
    harbor front where the ray-cast crossing sits furthest out to sea, exactly where a real
    lighthouse would stand. Every new coordinate was verified programmatically before being
    written in: all 6 quay points and the lighthouse confirmed on real land, both new jetty tips
    and all 4 new boats confirmed in open sea, the breakwater confirmed fully offshore, and the
    lighthouse checked clear of every other marker (186 units to the nearest). Verified
    `npx tsc --noEmit`, then in-browser: the Lighthouse and curved quay rendering together on the
    headland, the player's sprite correctly switching to a boat the instant they cross the new
    quay's coastline (not before, not after), and the breakwater/extra boats visible further out
36. ✅ **Piers/quay reclassified as walkable land + the whole dock district relocated onto the real
    coastline** (2026-08-03) — two corrections from direct feedback in one pass: "I want the dock
    boardwalk to be classed as land, so you can walk on and not become the boat," and "the quay and
    dock town is nowhere near the actual dock!" First: `islandAtPoint()` (`islands.ts`) now also
    checks distance to every `PIERS`/`QUAYS` segment (not just the real island polygon) — standing
    within `PIER_WALK_RADIUS` (16 units, matching half the drawn stroke width plus a little slack)
    of a boardwalk counts as land, same as standing on the island itself, reversing the earlier
    "piers must never be walkable" rule from item 31 on direct instruction. `BREAKWATER` was
    deliberately left out of this — it's a rubble arm, not a boardwalk, so it stays sea-only.
    Second, and the bigger fix: items 34/35 built the buildings, houses, and quay/lighthouse in the
    same session but never actually checked distance *between* them — the grid-search scripts each
    verified their own placements against existing markers, but nobody compared the two districts
    to each other, and the 3 buildings + 9 houses from item 34 ended up ~250–300 units south of the
    real coastline the quay was built along in item 35, on the wrong side of the Harbor Pier
    landmark entirely. Re-ran the same grid-search approach targeting a band hugging the quay
    instead (y −300 to −420), relocated all 3 buildings, all 9 houses, the connecting streets (plus
    one new segment running straight onto the quay itself), and both street NPCs' anchors: every
    new position checked on real land, clear of every other marker *and* the quay/pier/breakwater
    segments, with 4 houses that came back too close to the new streets (10–15 units, under the
    ~24-unit ideal for a `main` street) nudged clear before shipping. The 3 buildings now sit 29–53
    units from the actual dock structure, down from 250+. Verified `npx tsc --noEmit`, then
    in-browser: the player's sprite staying a walking figure at a pier-tip coordinate that used to
    be open sea (with the zone label correctly still reading "Tortuga Cove," not "The Open Sea"),
    the same holding true standing directly on the quay's curve, and a screenshot confirming the
    relocated houses/buildings now visibly flank the quay and sit near the Lighthouse instead of
    being a walk across an empty field away from it
37. ✅ **The Black Pearl: capture, board, disembark, and sea blocked-by-default** (2026-08-04) —
    "Should we make it so you can't go into the water unless you go to the Black Pearl, the
    captain's boat?" plus a direct correction mid-discussion ("why would only sailing his ship
    undo things?" — the sea/encounter/sprite systems are all untouched; the actual change is that
    open water flips from always-enterable to blocked-by-default) and a clarified scope ("Fuller
    for sure" — a real docked/re-boardable ship, not a one-time unlock). New `src/data/blackPearl.ts`
    defines a persistent, mutable ship position (unlike every other marker in the game, which is a
    fixed data-file offset, `blackPearlPosition` lives in the Zustand store because the player
    relocates it every time they make landfall) plus the guarding `Captain Odessa Kane`
    (`black_pearl_captain`) and her forced-duel dialogue. `gameStore.ts` gained
    `blackPearlCaptured`/`blackPearlBoarded`/`blackPearlPosition` state, a new `'blackpearl'`
    `EncounterFaction`, and `captureBlackPearl`/`boardBlackPearl`/`disembarkBlackPearl` actions
    (all persisted). `EncounterScreen.tsx` gained the captain's opening line, banner label, and
    victory branch. `MapScreen.tsx` is the bulk of the feature: `islandAtPoint()` already treats
    piers/quays as land (item 36), so the sea-blocking collision is a bespoke inline three-stage
    retry (full move, then each axis alone, then stay put — same shape as the house-collision
    slide, just checked against "is this point open water" instead of a list of obstacle circles),
    gated on `!blackPearlBoardedRef.current`; a proximity check pre-capture starts the forced duel
    (`startEncounter` with the `'blackpearl'` faction) the same way a Pirate Lord's fort does, and
    post-capture instead shows a dismissible "Board the Black Pearl?" prompt; making landfall while
    boarded auto-disembarks (gated on `!currentIsland` — the pre-move state — so the check fires
    only on a genuine sea→land transition, not on the very first tick after boarding, since boarding
    happens while already standing on the land/pier the ship is docked at); the ship gets a
    findable map marker (🚢, with a 🏴‍☠️ flag badge while still guarded) plus an edge-of-screen
    indicator and minimap blip whenever she isn't currently being sailed; and `mainQuestText`/
    `mainQuestTarget` lead with "Capture the Black Pearl" until she's taken, then fall through to
    the existing Pirate Lord chain. Debug screen gained a Black Pearl section (force the duel,
    instant-capture, board, force-disembark) for testability. The captain's original stats
    (a plain "rare"-tier template, baseHp 42/atk 17/def 11 at level 4) were caught by in-browser
    testing losing to the starting Deckhand Swordsman (level 3: 46hp/17atk/11def) — she
    out-damaged him roughly 2:1 and outlasted his hits 5-to-2 — which directly contradicted the
    intended "no way to grind first, so the boss must be reliably winnable" design (Tortuga is a
    safe zone with zero wild encounters); cut down to baseHp 20/atk 7/def 8, verified both by a
    20,000-run Monte Carlo simulation of the exact damage formula (~99.98% player win rate) and by
    repeated clean in-browser wins. A second real bug surfaced the same way: the auto-disembark
    check originally fired on any tick where `nextIsland` was truthy while boarded, which is always
    true on the very first movement tick after boarding (since you board while standing on land) —
    instantly un-boarding the player before they ever left the dock; fixed by requiring the
    pre-move position to have been sea (`!currentIsland`). Verified `npx tsc --noEmit` throughout,
    then in-browser via a temporary, fully-reverted `TEMP-TEST-SPAWN` spawn near the ship (confirmed
    removed via `grep -rn TEMP src` before commit): the guarded ship's marker and flag badge
    visible and findable, the forced duel triggering on approach and won cleanly across multiple
    attempts, capture correctly updating gold/quest-text/marker color, the board prompt appearing
    and boarding hiding the marker, sea movement genuinely blocked while not boarded (confirmed via
    a temporary on-screen coordinate/state readout, also reverted), successful sailing to open
    water once boarded (zone label flips to "The Open Sea," player sprite becomes the sea emoji,
    a random sea encounter still fires normally mid-sail), and the compass/quest-tracker correctly
    pointing at the ship pre-capture
38. ✅ **Off-path and sea speed penalties, for better movement control** (2026-08-04) — a design
    question ("should we lock players to paths so we can control them better?") where full
    path-locking was rejected as too invasive (it would strand every resource node, scenery spot,
    and building not sitting exactly on a street, and reverses the shipped free-roam design), in
    favor of a lighter speed-based nudge: `MapScreen.tsx` gained an `isOnPath()` check (new
    `PATH_WALK_RADIUS = 20`, reusing `streets.ts`'s existing `nearestStreetSegment` — the same
    lookup street NPCs already use to stay on the road network) that picks `ON_PATH_SPEED` (45,
    unchanged from the old flat `LAND_SPEED`) vs a new, slower `OFF_PATH_SPEED` (26) for land
    movement each tick, and a separately reduced `SEA_SPEED` (260 → 150, sailing felt
    uncontrollable at full speed, especially threading the harbor mouth right after boarding the
    Black Pearl). Only Tortuga Cove and New Providence have any authored street data — `isOnPath()`
    always returns true (no penalty) on the other five islands, so the slowdown only ever applies
    somewhere a path actually exists to find and follow, rather than uniformly nerfing every other
    island's open ground. A real bug surfaced during verification: the first implementation passed
    the player's absolute world position straight into `nearestStreetSegment()`, but `STREETS`
    segments are stored relative to each island's center (the same convention `streetsForIsland`/
    street-NPC code already uses) — so every on-path check was silently comparing world coordinates
    against relative ones and never matched, even standing dead-center on a street. Fixed by
    converting to island-relative coordinates before the lookup, same as the NPC wander code
    already does. Verified `npx tsc --noEmit`, a standalone Node script exercising the exact
    `isOnPath` logic against known points (street hub, mid-block gap, no-street island) to confirm
    correct classification independent of browser frame-rate noise, and in-browser via a temporary,
    fully-reverted `TEMP-TEST-SPAWN` spawn at Tortuga's town-square hub (confirmed removed via
    `grep -rn TEMP src` before commit) with a temporary on-screen `onPath` readout (also reverted)
    showing `1` standing on the street and `0` at a verified mid-block point away from any segment
39. ✅ **Houses and buildings became solid, with a garden buffer, to cut down on free-roam
    shortcuts** (2026-08-04) — "make sure buildings aren't on the paths... give houses gardens...
    stopping players from wandering off too much and finding shortcuts." First checked whether
    buildings/houses actually sit ON street lines (a programmatic distance check against every
    street segment on Tortuga and New Providence): they do, at distance ~0 — but that's the
    existing "buildings front directly onto the street, row-houses line both sides" layout working
    as designed, not a bug, so nothing needed fixing there. The real gap surfaced while looking:
    `BUILDINGS` (taverns, forts, shops, ...) had **no collision at all** — only `HOUSES` were ever
    passed into the movement tick's `slideAroundObstacles` call, so the player could walk straight
    through a building's sprite without ever triggering its "Enter?" prompt. Fixed by adding a
    second `slideAroundObstacles` pass for buildings (`BUILDING_COLLISION_RADIUS`, new), and by
    raising `HOUSE_COLLISION_RADIUS` (6 → 12) for a real "can't cut through the yard" buffer —
    both checked against the actual minimum gaps in the placement data first (40 house-house, 35.8
    house-building, 82.5 building-building; the old "20 units apart" comment was stale), so neither
    change reproduces the old permanently-wedged-between-houses bug. Each house/building sprite
    also gained a tinted, bordered "garden" patch drawn behind it (`houseGarden`/`buildingGarden`
    styles, sized a little past the actual collision radius) so the new invisible wall reads as a
    fenced yard rather than an arbitrary block. Caught two more real bugs during this pass: (1) the
    first `BUILDING_COLLISION_RADIUS` (24) plus `PLAYER_COLLISION_RADIUS` (3) exceeded
    `ENTER_RADIUS` (26) — the player could never get close enough to a building to trigger its
    "Enter?" prompt at all, since collision now stopped them further out than the prompt's own
    trigger distance; fixed by dropping the radius to 15, comfortably under that ceiling. (2) Street
    NPCs' existing house-avoidance code compared their island-relative wander position against
    `houseWorldPosition()`'s absolute world coordinates — a preexisting, unrelated bug (not
    introduced by this change, just noticed while touching the same lines) that silently made every
    "blocked" check false, so NPCs never actually avoided houses; fixed the same way as `isOnPath`
    earlier — convert to the same coordinate space — and extended it to buildings too. Verified
    `npx tsc --noEmit`, a programmatic minimum-gap sweep across every island before picking radii,
    and in-browser via a temporary, fully-reverted `TEMP-TEST-SPAWN` (confirmed removed via
    `grep -rn TEMP src` before commit): walking straight at The Salty Parrot now stops at its garden
    edge and correctly still surfaces the "Enter The Salty Parrot?" prompt, and a walk through the
    dense residential grid showed visible garden patches on every house with movement still flowing
    through the gaps between them, no wedging
40. ✅ **Buildings pulled off street centerlines — they really were sitting on the road**
    (2026-08-04) — direct user pushback on the previous item's "buildings don't overlap streets,
    that's just intentional street-fronting" conclusion: "There are clearly buildings on the road/
    path." Re-checked properly this time and the user was right — the earlier check only measured
    building-center to street-*endpoint* distance and found ~0, which was waved off as "the street
    terminates at the building's door," but that's centering the building ON the road's endpoint,
    not beside it; the item 39 garden patches (radius 30) just made the always-present overlap
    hard to miss. Root-caused two distinct patterns: (1) most buildings sit exactly at the far
    endpoint of their one connecting "spoke" street (35 endpoint matches across 28 segments,
    programmatically found), so those 28 segments got their building-side endpoint pulled back
    30 units along the segment's own direction — cheap and safe since streets are pure flavor data
    with no other system depending on their exact endpoint coordinates. (2) A handful of buildings
    (`tortuga_smithy` worst — sitting at distance *0* on the residential grid's x=-220 avenue,
    dead-center on the road; plus `new_providence_tavern`, `new_providence_distillery`,
    `tortuga_chapel`, `tortuga_smuggler_cache`) sit near the *middle* of an unrelated long grid
    avenue, which endpoint-pulling can't fix — those 5 buildings got nudged 6-24 units off the
    line instead, via the same grid-search-against-real-placement-data technique used for house
    placement earlier in the project, re-verified against every other building/house/street
    afterward so the fix didn't introduce new overlaps elsewhere. Verified `npx tsc --noEmit`, a
    programmatic building-to-every-street-*segment* sweep (not just endpoints — the mistake last
    time) confirming zero buildings closer than 24 units to any street line, and in-browser via a
    temporary, fully-reverted `TEMP-TEST-SPAWN` (confirmed removed via `grep -rn TEMP src` before
    commit) at both The Salty Parrot and The Anchor & Forge showing a real grass gap between the
    road and each building's garden edge where before the road ran straight into the plot
41. ✅ **Garden patches actually never overlap a street now — moved to a z-order fix, not more
    repositioning** (2026-08-04) — user sent a real device screenshot straight after the previous
    item shipped: "I don't think that worked. Also don't let the gardens overlap the paths." They
    were right again — that screenshot showed four ordinary row *houses* (not the specially-handled
    shop/tavern `BUILDINGS`) whose garden circles were visibly washing green across a residential
    street, since houses were always placed with only a few units of clearance from their fronting
    street's centerline (intentional — that's how a row-house street front works) while the new
    `HOUSE_GARDEN_RADIUS` (18) is bigger than that clearance. Repositioning ~90 hand-placed houses
    the same way the 5 buildings were nudged in the previous item was the wrong tool here — it
    would fight the deliberate "houses line the street" layout instead of respecting it. Switched
    approach entirely: garden tints for both houses and buildings now render as `<Circle>` elements
    inside the same `<Svg>` block, positioned *before* `STREETS`/`PIERS`/`QUAYS`/`BREAKWATER`, so
    the road's own paint always wins wherever the two shapes overlap — a garden that reaches a
    street now reads as "the road cuts across the yard's edge" instead of "the yard washes out over
    the road," with zero coordinate changes and no risk of relitigating individual placements one
    green blob at a time. The house/building icons themselves stayed in their own `View` layer on
    top of the `Svg`, untouched. Verified `npx tsc --noEmit` and in-browser via a temporary, fully-
    reverted `TEMP-TEST-SPAWN` (confirmed removed via `grep -rn TEMP src` before commit) at two busy
    residential intersections — every street segment, including ones passing directly beside a
    house's garden circle, renders with clean, uninterrupted road color, no green bleed anywhere
42. ✅ **Garden shapes actually repositioned off paths — not just painted over** (2026-08-04) —
    explicit follow-up direction: "Change the shape of the gardens to adjust positioning. Don't
    mind the front of the house being close to the path. But not the garden overlap the path."
    The previous item's z-order trick made overlap invisible but the gardens still geometrically
    sat on top of paths underneath the paint — this replaces the raw entity position with a real,
    precomputed offset for the garden shape only. New `computeGardenOffset()` walks every real path
    on the island (streets, using half-width 14 for 'main'/4 for 'path'; piers half-width 10; quays
    half-width 8 — not `BREAKWATER`, a rubble arm never near a garden) and, if the garden circle
    would overlap the nearest one, pushes the circle's center directly away from it until clear,
    repeating a few passes since escaping one path can occasionally land closer to a different one
    nearby. Run once at module load over the static `HOUSES`/`BUILDINGS` data into
    `HOUSE_GARDEN_OFFSETS`/`BUILDING_GARDEN_OFFSETS` (parallel arrays/maps, not recomputed on the
    movement tick), so there's zero added per-frame cost. The house/building *icon* still renders
    at its real, original position — fronting the street is exactly what was asked to keep; only
    the tinted yard shape moves, asymmetrically, to whichever side of the building has room.
    Verified `npx tsc --noEmit` and in-browser via a temporary, fully-reverted `TEMP-TEST-SPAWN`
    (confirmed removed via `grep -rn TEMP src` before commit) at the same two busy residential
    intersections from the previous item: garden circles now visibly sit off to one side of each
    house, never touching a road's paint, while the houses themselves stayed exactly where they
    were, still fronting the street
43. ✅ **Houses genuinely pulled off path bodies, and 6 buildings finally cleared for real**
    (2026-08-04) — direct correction: "There is still loads of houses in the middle of the path."
    Root cause: items 39-42 only ever checked *buildings* against paths, using each building's
    *own connecting spoke* as the reference distance — never a systematic sweep of every house
    against every street/pier/quay *line* (not just its nearest endpoint). A fresh diagnostic
    script doing that full sweep found 95 of the 149 houses (64%) sitting on a path body, plus 6
    buildings that had passed their item-40 endpoint check but were still only 10-14 units clear
    of a *different*, non-connecting street running past them (short of the required
    `BUILDING_COLLISION_RADIUS`, 15). Fixed with the same grid-search/spiral-search relocation
    already used for individual buildings, generalized to run over every house and building
    against every street/pier/quay simultaneously: 110 houses moved to the nearest clear spot, 3
    unfixable pocket houses dropped outright, and the 6 buildings moved clear (most by single-digit
    units; two — the Chapel and the Smithy — sat in genuinely boxed-in grid corners with no clear
    ground nearby and moved further, to the edge of their block/into the High Woods edge). A
    second, unrelated pre-existing bug surfaced by the same sweep — 3 New Providence houses placed
    outside the island's actual coastline polygon, floating over open sea — got the identical
    grid-search fix while in there. Verified via a comprehensive Node script (not the game code
    itself, a faithful reimplementation of its collision math) checking, after every fix: houses on
    paths (0/171 bad), buildings on paths (0/28 bad), house-house/house-building/building-building
    minimum gaps (all ≥ their collision-radius sums), and every house/building inside its island's
    real polygon (0 outside) — plus `npx tsc --noEmit` and in-browser confirmation via
    `TEMP-TEST-SPAWN` (reverted, confirmed via `grep -rn TEMP-TEST src`) that the relocated Chapel,
    Smithy, and a relocated New Providence house all render on solid clear ground with working
    "Enter?" prompts
44. ✅ **Old Town: a cramped 17th-century harbor quarter by the Tortuga dock** (2026-08-04) — direct
    request: "I want you to create a proper old 17c town centre probably near the dock. Houses and
    business cramped in next to each other." Added 25 new row houses and 2 new buildings (The
    Cooper's Yard, a barrel-cooper market run by Old Merriweather; The Sailmaker's Loft, a canvas
    and rigging shop run by Needle Annie) wedged into the gap between the existing big-dock
    district (Chandlery, Harbourmaster's Office, Bunkhouse) and the residential grid. Positions were
    generated programmatically at the *tight-but-legal minimum* clearance from every real
    path/building/house/resource-node (same grid-search tool as item 43, just run at minimum
    instead of comfortable spacing) rather than the suburb's usual gaps, so the block genuinely
    reads as cramped instead of merely dense. Tortuga's house count goes from 149 to 171 across
    both this and item 43's infill. Verified the same way as item 43, plus an in-browser
    `TEMP-TEST-SPAWN` walkthrough of the new block confirming it reads as a packed quarter and that
    both new buildings' "Enter?" prompts fire correctly
45. ✅ **Old Town re-laid as one adjacent row, not a 3-deep block; house gardens switched off**
    (2026-08-04) — direct follow-up: "Rather than houses three rows deep. I'd rather them be next
    to each other. Ignore gardens. In fact we could disable them for now. And maybe switch them
    back later." Item 44's 25 houses had been scattered to fill the available gap, which read as a
    dense block several houses deep from the street rather than a real row-house terrace. Replaced
    with a single continuous chain: a snake-placement script walks house-to-house from the dock at
    fixed ~29-unit (touching-neighbor) spacing, at each step searching a widening cone of
    angles/step-lengths for the nearest legal spot and bending around obstacles (dock buildings,
    the existing waterfront houses) instead of ever placing a second parallel row. The result winds
    from the dock down toward the residential grid as one unbroken adjacent terrace. Gardens
    (`SHOW_GARDENS` in MapScreen.tsx, added as a single render-time toggle) are switched off
    entirely for now, per the explicit "switch them back later" ask — the offset math and
    precomputed `HOUSE_GARDEN_OFFSETS`/`BUILDING_GARDEN_OFFSETS` are untouched and cost nothing
    while off, so re-enabling is a one-line flip back to `true` with no data changes needed.
    (Collision itself was never tied to the garden radius — `HOUSE_COLLISION_RADIUS`/
    `BUILDING_COLLISION_RADIUS` are separate and unaffected.) Verified via the same comprehensive
    Node script as items 43-44 (0 bad path clearances, 0 bad gaps, 0 outside-polygon) plus
    `npx tsc --noEmit` and an in-browser `TEMP-TEST-SPAWN` walkthrough of three points along the new
    row (dock end, the bend, and the east end) confirming a clean unbroken terrace with no garden
    rings and no stacked houses
46. ✅ **Tortuga's housing rebuilt as a real 17th-century port town: clustered around the harbor,
    sporadic elsewhere, ~10 fewer streets** (2026-08-05) — direct design feedback: "All the houses
    seem scattered over a large portion of the island. I don't think this is how the island make up
    would be in the 17th century. They would be clustered together around the port all jammed in
    next to each other and then a few sporadic houses scattered around. There're possibly too many
    roads as well." Root cause: Tortuga's houses had always lived on a 5-avenue x 5-cross-street
    residential grid spanning most of the island's southern half (`x: -280..310, y: -20..300`) —
    a real settlement pattern, just the wrong one (20th-century suburb, not a cramped period harbor
    town), and the same grid that kept causing the house/building-on-path bugs fixed in items 39-45.
    Deleted the grid outright (10 street segments, 46 → 36 on Tortuga) along with the 85 houses that
    lined it, keeping item 45's 25-house Old Town row as-is since it already read as the right
    pattern. Replaced with two placement modes: a **nucleated cluster** — a tight halo of 3-6 houses
    spiral-packed directly around each of 15 real dock/downtown buildings and landmarks (the
    Chandlery, Harbourmaster's Office, Basse-Terre Square, the Salty Parrot, Fort de Rocher, etc.,
    all via the project's established spiral-search pattern, same one behind Old Town and the
    garden-offset fix) — for the port core (66 new houses), and a single **standalone homestead**
    near each of 10 outlying named locations (the Fishmonger, the Ropewalk, West Point Shack, the
    Ruins, the Trapper's Camp, La Ringot Fields, etc.) for the "sporadic" ask, instead of a second
    neighborhood. Net Tortuga housing: 149 → 101 (down, not up — deliberately: a real cramped
    port town is a few tight blocks, not a bigger sprawl), all still comfortably inside the
    "keep close to current count" range agreed with the player. Street NPCs anchored inside the
    deleted grid re-snap onto whatever real street is nearest at runtime (`nearestStreetSegment`)
    — checked all 30 Tortuga street NPCs' new snap distance individually; 7 had drifted more than
    60 units from their authored flavor spot (e.g. the Forge Cat's anchor no longer landed anywhere
    near the Anchor & Forge), so those 7 got a new hand-picked anchor near a real surviving street
    close to their original spot; the other 23 were left as-is. Verified via a comprehensive Node
    script (0 houses/buildings on paths, 0 outside the island polygon, 0 too close to any
    landmark/resource node, healthy house-house/house-building gaps), `npx tsc --noEmit`, and an
    in-browser `TEMP-TEST-SPAWN` walkthrough of Basse-Terre Square, the dock cluster, and a sporadic
    outskirts house (reverted, confirmed via `grep -rn TEMP-TEST src`), plus confirming the
    Chandlery's "Enter?" prompt still fires correctly from inside its new house cluster
47. ✅ **Row houses actually line the road now, one deep — not spiral halos around buildings**
    (2026-08-05) — direct correction of item 46, same day: "Not convinced you have done what I
    said. I don't want row and rows of houses three deep. I want them lined up next to each other
    lining the road rather than spaced deep. This makes the player have to use the paths. Your last
    build it still massively spread out." Fair: item 46's "nucleated cluster" was a spiral fill —
    rings of houses several deep around each building by construction, centered on 15 buildings
    spread across the whole town (lighthouse to Fort de Rocher to the Customs House), so it was
    still both "deep" and sprawling, just with the deep bit arranged in circles instead of a grid.
    Replaced entirely with literal road-lining: picked a tight, curated 11-segment subset of real
    Tortuga streets — just the harbor-to-Basse-Terre-Square corridor (the Square's three inner
    spokes, the harbor road, the dock-district streets, the Salty Parrot -> Anchor & Forge lane),
    deliberately excluding the far-flung spokes to Customs House/Chapel/Fort/Baker's Oven that item
    46 had wrongly treated as core — and walked each one placing a single house every ~27 units on
    BOTH sides of the road, offset just far enough past the road's edge to legally clear it. One
    house deep, always facing the street, gaps left wherever a real building already sits on that
    stretch of frontage. 27-unit spacing is deliberate: two 12-unit house collision radii leave
    only ~3 units of gap, well under the player's own footprint, so a player physically cannot
    squeeze between two neighboring row houses — the row itself is what channels foot traffic onto
    the road, the mechanism the player was actually asking for. Also deleted item 45's Old Town
    chain (25 houses) since it wound through open ground rather than following an actual drawn
    street, which no longer fit the stricter "lines a real road" definition. Net effect: Tortuga's
    house count drops again, 101 → 51 (41 lining the core streets + item 46's 10 sporadic outposts,
    kept as-is) — deliberately smaller and tighter, not padded back up to a target number, since
    fidelity to "lines the road, one deep, small area" mattered more than a headcount. Verified via
    the same comprehensive Node script (0 bad path clearances, 0 outside-polygon, healthy gaps,
    minimum house-house spacing exactly at the 27-unit floor confirming the "can't squeeze through"
    property), `npx tsc --noEmit`, and in-browser `TEMP-TEST-SPAWN` checks of Basse-Terre Square,
    the harbor road, and the minimap overview (now showing a tight dot cluster near the port
    against mostly-open green, instead of dots scattered across the whole southern half), plus
    confirming the Salty Parrot's "Enter?" prompt still fires from inside its new roadside row
48. ✅ **Row houses extended to every real street, packed close enough to touch/interlock** (2026-08-06)
    — direct follow-up, with a reference sketch showing houses shoulder-to-shoulder along both
    sides of a road: "Better. Not just concentrate the houses and streets next to the dock. And
    line the road with houses close to and next to each other." Two changes: (1) item 47's
    road-lining only covered an 11-segment harbor-to-Basse-Terre-Square corridor, leaving the rest
    of the town's real streets (the spokes to the Fishmonger, the Chapel, the Locked Ward, the
    Bounty Board, the Ropewalk, the Customs House, the Baker's Oven) completely without housing —
    extended the same technique to every one of Tortuga's 20 `'main'`-style streets (the rural
    `'path'` trails stay deliberately house-free), so row houses now radiate out from the square
    along the whole street network instead of pooling in one corner; (2) tightened spacing from 27
    to 22 units — under the 26-unit house sprite's own width, so consecutive houses now visually
    touch or slightly overlap/interlock rather than showing daylight between them, matching the
    sketch. Also dropped 3 of item 46's "sporadic" homesteads (near the Fishmonger, the Ropewalk,
    the Locked Ward/Bounty Board) since those locations are now themselves on a lined street and no
    longer qualify as "sporadic elsewhere" — kept the 7 that are still genuinely off any real
    street, on a rural trail. Net: Tortuga housing 51 → 103 (96 lining 17 different street
    segments + 7 sporadic), spread across the whole town's actual road network instead of one
    pocket by the harbor. Verified via the same comprehensive Node script (0 bad path clearances,
    0 outside-polygon, healthy gaps, minimum house-house spacing exactly at the new 22-unit floor),
    `npx tsc --noEmit`, and in-browser `TEMP-TEST-SPAWN` checks of Basse-Terre Square, the
    Fishmonger spoke (visibly touching/overlapping houses on both sides), and the minimap overview
    (dots now radiating along every spoke from the square, not clustered in one corner), plus
    confirming the Customs House's "Enter?" prompt still fires from inside its new roadside row
49. ✅ **Housing pulled back off the far spokes and packed tighter; new Quay Row street right at the
    wharf** (2026-08-06) — direct follow-up, with a second reference image (two dense horizontal
    rows of touching/overlapping houses): "Place the houses closer together. Like the image. Try
    and keep the street running horizontally so looks like this. And concentrate the houses even
    closer to the port." Three changes: (1) dropped housing entirely from the 9 far-spoke groups
    added in item 48 (Fishmonger, Chapel, Locked Ward, Bounty Board, Customs House, Baker's Oven x2,
    Ropewalk x2 — 44 houses) to pull density back toward the harbor, per "concentrate...closer to
    the port"; (2) tightened spacing again, 22 → 20 units (a real, deliberate overlap against the
    26-unit house sprite, not just edge-touching) on every kept street; (3) added a new street, the
    Quay Row, running horizontally along the one open stretch of ground directly behind the wharf
    buildings (the actual dockfront itself is already built up with the Chandlery, Harbourmaster's
    Office, and the Bunkhouse, so there was no room for housing right on the water) — searched
    several candidate horizontal lines near the port programmatically before picking this one, since
    most others intersected existing buildings or ran over open water past the coastline. A true
    mirrored two-row street (houses on both sides, matching the reference image exactly) wasn't
    geometrically available anywhere this close to the already-built-up dock without relocating
    real buildings, which was out of scope — the Quay Row is a single dense horizontal row instead,
    with the existing dock buildings/houses effectively forming the other side of the corridor.
    Net: Tortuga housing 103 → 68 (61 across 8 near-port street segments + a new 7-house Quay Row +
    7 sporadic homesteads unchanged) — smaller again, deliberately, since "concentrate near the
    port" means less housing spread thin and more packed into a smaller area, not a higher count.
    Verified via the same comprehensive Node script (0 bad path clearances, 0 outside-polygon,
    minimum house-house spacing exactly at the new 20-unit floor, 0 broken building clearances from
    the new street), `npx tsc --noEmit`, a street-NPC anchor re-check (all 30 still snap within a
    reasonable distance of the new street layout), and in-browser `TEMP-TEST-SPAWN` checks of the
    Quay Row (visibly overlapping houses), the harbor road, and the minimap overview (the house-dot
    cluster now sits tightly against the port with the far spokes empty), plus confirming the
    Chandlery's "Enter?" prompt still fires from inside the retightened dock cluster
50. ✅ **Basse-Terre Square itself moved off the island's vertical center, toward the harbor**
    (2026-08-07) — direct correction of item 49: "The layout is still in the middle of the island
    and not what I said for you to build," confirmed by screenshot of a player walking a housing
    row with no coast in sight. Root cause: items 46-49 all repositioned *housing*, but never the
    square the two busiest housing spokes (-> Salty Parrot, -> Harbor Trading Post) actually radiate
    from — Basse-Terre Square sat at y=+80, close to Tortuga's true vertical center (the island
    spans y -478 to +448), so those two spokes' 20 houses always read as mid-island no matter how
    tightly packed. Given a choice between cutting that housing entirely (port-only) or keeping it
    on its street but pulling the whole corridor north, picked the latter. Moved the square from
    (-40, 80) to (-40, -160) — just south of the harbor buildings — in `streets.ts` (6 spoke "from"
    points) and `landmarks.ts` (the square's own marker); the 20 houses on the two affected spokes
    were then regenerated from scratch along the new, shorter lines with the same two-row/~20-unit
    pattern as item 49. Every other street, house, and building on Tortuga (the harbor road, Quay
    Row, the 4 southern spokes to Fishmonger/Chapel/Locked Ward/Bounty Board, all sporadic
    homesteads) is untouched — only the square's position and its two housing spokes moved.
    Verified with a Python point-in-polygon/clearance script mirroring the game's own
    `pointInPolygon`: all 20 regenerated houses fall inside `TORTUGA_SHAPE`, clear of every building
    (closest 48 units, consistent with the closest pre-existing clearance elsewhere on the island),
    clear of every other house (closest 20 units, the established spacing floor), and clear of each
    other across the two spokes (closest 27 units) — plus `npx tsc --noEmit`
51. ✅ **Full-town remap: every remaining Tortuga building/marker pulled into the harbor town**
    (2026-08-07) — direct correction of item 50: "That hasn't worked at all. Start a fresh and
    remap all of the buildings on the island." Root cause: item 50 only moved Basse-Terre Square
    and its two housing spokes — 7 other buildings/markers (Fishmonger's Stall, Chapelle
    Notre-Dame, The Customs House, The Anchor & Forge, the Bounty Board, the Locked Ward, plus the
    Baker's Oven and Ropewalk landmarks) were still on their original south/east/west positions,
    up to 460 units from the coast, so the square's spokes reaching them still ran most of the
    length of the island. Relocated all 8 into a compact band hugging the harbor (roughly
    y = -190 to -27, vs. the coast at y = -478 and the harbor buildings already at y = -210 to
    -380), leaving only the explicitly rural/outlying locations untouched: West Point Shack, El
    Fuerte Viejo (the Ruins), the Trapper's Camp, the Smuggler's Cache, and the Old Landing Dock —
    all already established as deliberately-outlying content (item 46) reached by rough trails, not
    town streets. Re-aimed every spoke/connector street to the new positions (the 4 remaining
    Square spokes, Trading Post -> Customs House, Chapel <-> Baker's Oven, Locked Ward <-> Baker's
    Oven, Fishmonger <-> Ropewalk, Bounty Board <-> Ropewalk, Salty Parrot -> Anchor & Forge) and
    regenerated the 4 houses on the Salty Parrot -> Anchor & Forge street, which shortened
    substantially. Verified with a TypeScript validation script run via `npx tsx` directly against
    the live data modules (not a hand-copied approximation): every building, house, and landmark
    still falls inside `TORTUGA_SHAPE`; every relocated building/marker clears every other building
    by 43-138 units and every house by 43-133 units (in line with the ~48-unit floor already
    established elsewhere on the island); the 4 regenerated Anchor & Forge houses clear everything
    by 43+ units; and `npx tsc --noEmit` passes. Patron quests (`hostedByBuildingId`) and interior
    floor plans (keyed by building ID with room-local coordinates) needed no changes — both follow
    their building automatically
52. ✅ **Tortuga's whole geography rebuilt as a real horseshoe harbor** (2026-08-07) — "Let's start
    again... A complete overhaul of the placement of everything... If we have to change the shape
    of the island to accommodate that's fine," with a written brief on real 17th-century outlaw
    port layout (organic non-grid streets, waterfront-centric town, narrow packed thoroughfares,
    an elevated fort guarding the harbor mouth, functional zones — docks/careening, tavern
    district, contraband warehouses, rural periphery) plus 4 reference images of hand-drawn
    fantasy harbor-town maps. Items 39-51 had all kept the same fundamental shape (a hub-and-spoke
    square with row houses lining a few streets) and kept re-failing the same "still spread out /
    still the middle of the island" feedback in different forms — this pass changed the shape
    itself instead. Reshaped Tortuga's north coast (`TORTUGA_SHAPE` in islands.ts) from a convex
    peninsula tip into a real horseshoe bay: two headlands (west and east) flanking a crescent
    inlet, built with Shapely (Python) and checked for validity/simplicity before use; every
    rural/outlying marker on the untouched west/south/east coastline re-verified still on land.
    Rebuilt every single thing on the old north coast from scratch around the new bay: a curving
    coastal "high street" (streets.ts) replaces the old hub-and-spoke square, with short alleys to
    every building; all 13 named buildings (buildings.ts) repositioned into zones along it — a
    docks-and-careening quarter (Sailmaker's Loft, Cooper's Yard, the Ropewalk) on the west side,
    contraband storage (the Warehouse, Chandlery, Anchor & Forge) tucked behind the docks, the
    harbor's administrative core (Harbourmaster's Office, Customs House, the Bounty Board, the
    Locked Ward) at the sheltered bottom of the bay, a tavern district (the Salty Parrot, Harbor
    Trading Post, Dockworkers' Bunkhouse) on the busiest stretch of quay, and the Chapel/
    Fishmonger/Baker's Oven on the east side; Fort de Rocher moved onto the east headland (an
    "elevated stronghold... overlooking both the town and the sea approach," per the brief) and
    the Lighthouse onto the west headland, guarding the harbor mouth from both sides. Housing
    (houses.ts) is no longer row-lined streets at all — 95 houses generated by Poisson-disc-style
    rejection sampling (organic jitter, ~21-unit minimum spacing, ~42 units clear of any building),
    matching "organic, non-linear" rather than formal planning, wrapping the whole crescent in a
    dense, maze-like band. The harbor front (harbor.ts: quay, 4 piers, a sheltering breakwater arm,
    boats) was rebuilt to follow the new coastline, plus the one resource node that fell inside the
    new bay water (`node_tortuga_fish`) moved to the docks quarter. The rural periphery (West Point
    Shack, El Fuerte Viejo, the Trapper's Camp, the Smuggler's Cache, the Old Landing Dock, La
    Ringot Fields, the High Woods, the Forgotten Graves) is completely untouched, matching the
    brief's own "makeshift shanties... spreading up the hillsides" periphery. Verified with a
    from-scratch TypeScript script (`npx tsx`) run directly against the live data modules: every
    building/house/landmark/marker/resource-node inside `TORTUGA_SHAPE`; every harbor fixture
    (piers, quay, breakwater, boats) outside it (in open water); 0 building-building pairs under 45
    units; minimum house-house spacing 20.8, minimum house-building spacing 39.8; every rural
    marker re-confirmed on land — plus `npx tsc --noEmit` and an in-browser check (the minimap now
    shows a dense building cluster wrapping a real bay, and a short walk from spawn reaches the
    Bounty Board almost immediately)
53. ✅ **Thin footpaths to the houses off the coastal high street; 5 alley/trail segments that had
    started clipping a building fixed** (2026-08-07) — "Getting there. We could have some smaller
    thinner tracks for the houses not on the main road. Make sure all roads and tracks are not
    obscured by buildings," direct feedback on item 52's horseshoe-bay rebuild. Added ~100 new
    thin `'path'`-style footpath segments (single-bend-around-buildings, routed programmatically)
    connecting 66 houses that sit back from the 7-segment coastal backbone; 7 sporadic rural
    homesteads (already served by their own rural trail) and 4 houses wedged too tightly into the
    Chandlery/Anchor & Forge cluster to route cleanly were left without one rather than force a
    path through a building. Also fixed 5 existing `'main'`/`'path'` alley segments (the routes to
    the Ropewalk, the Bounty Board, the Locked Ward, and West Point Shack) that were clipping a
    building they didn't belong to, by moving/re-solving their bend points with a grid search for
    the shortest detour clearing every building by 24+ units. Verified with a from-scratch
    TypeScript script (`npx tsx`) run directly against the live `streets.ts`/`buildings.ts` data:
    0 street segments (of either style) pass within 24 units of a building that isn't their own
    endpoint; every new footpath's bend point falls inside `TORTUGA_SHAPE`; `npx tsc --noEmit`
    passes; confirmed in-browser that the thin footpaths render distinctly from the wide two-tone
    high street and curve cleanly around every building
54. ✅ **The 66 individual house footpaths consolidated into 5 shared back lanes** (2026-08-07) —
    "Not every house needs its own path. One path next to the houses interconnecting them. Make
    sure the paths and roads clean," direct feedback that item 53's one-spur-per-house layout
    (each of 66 houses routed independently to the coastal backbone) looked cluttered — many spurs
    converging on a handful of shared bend points created a spider-web/spaghetti look. Replaced it
    with 5 shared lanes, one per house cluster: k-means-clustered the same 66 houses (k=5), ordered
    each cluster into a single walking route with a nearest-neighbor chain refined by 2-opt (removes
    self-crossings and long backtracks), then attached each lane to the coastal backbone at one
    point. Net effect: 68 path segments instead of ~100, and every lane reads as one continuous
    route threading past a row of houses rather than many separate lines converging on a point.
    Verified with a from-scratch TypeScript script (`npx tsx`) against the live data: 0 street
    segments obscured by an unrelated building (same 24-unit-clearance check as item 53); `npx tsc
    --noEmit` passes; confirmed in-browser that each lane renders as a single clean winding path
    past its row of houses, not a web of crossing spurs
55. ✅ **Battle screen redesigned so it's obvious which fighter is yours** (2026-08-09) — "It looks a
    bit bland and boring and limited... I don't even know which person I am in combat." Presented 5
    layout directions as static mockups (Dueling Platforms, Face-Off Portraits, Ship's Deck
    Broadside, Captain's Log Card Duel, Cinematic Scene) rendered as images for review; picked
    Dueling Platforms for being "clean and descriptive," then layered in a light combo of borrowed
    ideas: a soft gradient backdrop and deck-plank shading from the Ship's Deck direction, and a
    specialty-type badge (⚔️/🔫/💣/🔮/👊) from the Card Duel direction next to each name so the
    blade/musket/cannon/curse/brawler triangle in `battle.ts` is visible instead of a hidden dice
    roll. Rebuilt `EncounterScreen.tsx`'s combatant area for real: a diagonal stance (foe back-right
    on a smaller platform, you front-left on a bigger one, via ordinary flex layout rather than
    absolute positioning so it holds up across screen sizes) with an explicit "You"/"Foe" tag pill
    above each name — added `expo-linear-gradient` as the one new dependency. Caught and fixed a
    real regression during in-app testing: the first pass hardcoded the HP bars to gold/crimson to
    match the tag colors, which silently killed the low-HP red-warning signal; reverted the bars to
    their original green→amber→red-by-actual-health behavior since "which one is mine" is already
    answered by the tag and name color, and the bar's job is to show danger. Verified `npx tsc
    --noEmit` passes and confirmed in-browser via a forced Rival Ambush, both at full HP and
    mid-fight after a few exchanges
56. ✅ **Battle backdrops that change with where the fight actually happens** (2026-08-09) —
    "Backdrop will change and be specific to where the battle happens. Town background with
    buildings and cobble floor etc, jungle, beach, sea, on boats… loads of scenery and scenarios,"
    direct follow-up to item 55's layout redesign. Built 6 distinct scenes (Town, Jungle, Beach,
    Sea, Fort, Jail), each a gradient + a handful of positioned decorative emoji/shapes (building
    silhouettes and a cobblestone tint for Town, palm trees for Jungle/Beach, a wave/sail motif for
    Sea, battlements and cannons for Fort, and actual barred-cell stripes for Jail) reusing the
    existing plank-shadow ground element from item 55, retinted per scene. Added
    `src/utils/battleBackdrop.ts::classifyBackdrop`, which turns a world position into a backdrop by
    reusing existing infrastructure — `islandAtPoint` for land-vs-sea, `nearestStreetSegment` for
    "close enough to count as town," and a new point-to-polygon-edge check against the island's
    coastline for "close enough to count as beach" — anything else on land reads as jungle. Threaded
    a `backdrop` field through `WildEncounter` and every `setWildEncounter` call site: MapScreen's
    wild/ambush/merchant triggers classify from the real position the fight started at; the
    Pirate-Lord-fort, jail-rescue, and Black-Pearl-duel fights force a fixed backdrop since those
    happen at a specific, already-known kind of place regardless of where the player's standing;
    bounty/heat-bounty side quests classify from the quest's own map position, escort quests are
    always forced to Sea (raiders boarding a convoy underway). Added a "Preview Battle Backdrop" row
    to the dev Debug screen so every scene can be checked without walking to a matching location.
    Caught and fixed two real issues while checking all 6 in-browser: gold-on-sand text on the Beach
    scene was nearly illegible (fixed with a small dark chip behind every name/tag, which also
    guards every future backdrop from the same issue); the Jail bars were originally a dark tint on
    a near-black background and effectively invisible (recolored to a visible steel tone). Verified
    `npx tsc --noEmit` passes and confirmed all 6 scenes in-browser via the new debug preview row
57. ✅ **Battle motion pass: lunge, hit flash, screen shake, HP tween, floating damage numbers,
    idle bob, an effectiveness banner, and distinct victory/defeat poses** (2026-08-09) — "Build
    all of these they sound cool," direct follow-up to the design-lead suggestion list after items
    55-56 landed with zero animation anywhere (HP bars snapped, nothing moved between turns). All
    built on React Native's built-in `Animated` API, no new dependency:
    - Every exchange is now a short async sequence (`animateTiming`/`sleep` helpers) instead of an
      instant state flip: the attacker lunges toward the target and back, impact triggers a red
      hit-flash pulse on the defender, a small screen shake, and a floating `-12`/`+8`/`MISS`
      number that pops and fades over the combatant that was hit
    - `HpBar` now tweens its width toward the new value over ~450ms instead of snapping; the
      current/max text and low-HP color threshold still update instantly, only the fill animates
    - A floating effectiveness banner ("It worked wonders!"/"It barely helped.") fades in over the
      scene instead of being buried in the log
    - Victory gives the player a bounce-scale flourish and fades the defeated foe; a faint gives
      the player a subtle slump (rotate + dim), reset automatically on crew switch
    - Idle bob (both fighters) and a gentle sway on every backdrop decoration keep the scene alive
      between turns instead of looking frozen
    - Recruit button now shows the live recruit chance, e.g. "Recruit (34%)", instead of hiding
      that math
    - Caught and fixed a real crash: recruiting isn't possible against non-`wild` factions (their
      templates aren't in `CREW_TEMPLATES`), and the new recruit-% display was computing that
      unconditionally on every render — guarded it behind the same `isAmbush` check the Recruit
      button itself already used
    - Verified `npx tsc --noEmit` passes and, in-browser, ran full multi-turn battles to victory,
      to defeat, and against an ambush faction (no Recruit button/crash) — confirmed the lunge,
      flash, shake, popups, HP tween, banner, and recruit-% all fire correctly turn after turn
58. ✅ **"Ship's Deck at Dusk" — full battle-scene redesign for real, built after five rounds of
    HTML mockup iteration** (2026-08-10) — replaces the emoji-scatter backdrop and plain bottom
    bar from items 55-57 with a considered visual pass, driven start-to-finish by the design-lead
    conversation ("I'm not liking it much" → fresh mockup → iterate → "green light for what we
    have worked through today"):
    - **Backdrop**: emoji-scatter decorations replaced with a small deliberate stack of layers —
      gradient sky, one SVG horizon silhouette per backdrop (`HORIZON_PATHS`: town skyline, fort
      crenellations + flag, jungle canopy, beach dunes + palm, sea gets a ship silhouette instead
      of a horizon line), a ground/water gradient band, and soft `RadialGradient` spotlight pools
      under each fighter (`react-native-svg`, no new dependency). A glowing moon/sun disc
      (`Celestial`) sits in the sky for every theme but jungle. Jail stays the one interior
      exception — cell bars plus two corner torches, no horizon
    - **Portraits**: bare emoji replaced with ring-bordered circular portraits (colored border +
      glow, gold for you/red for the foe) — existing lunge/idle/flash/victory-bounce/defeat-slump
      animations moved onto the ring wrapper unchanged
    - **Bottom panel**: the flush-to-the-bottom-edge action bar replaced with a raised floating
      sheet (margin + rounded corners + shadow) containing a "▶ Your Move" turn indicator, the log
      in its own bordered card, and larger move/secondary buttons
    - **Crew-swap strip**: every onboard crew member now shows as a small ring in the panel —
      gold-glowing ring = who's fighting, ring color = their HP (green/amber/red), greyed + ✕ badge
      = fainted. One tap on a healthy bench member swaps them in instantly and costs the turn
      (enemy acts), reusing the existing forced-switch-on-faint logic voluntarily. Hidden below 2
      crew members — nothing to swap to yet, and per design-lead decision, `SHIP_CREW_CAP` stays a
      flat 6 from the start for now (see item 69) rather than gating it further
    - **Resolution cards**: every way a fight can end used to be a single "Return to Map" button
      with the outcome buried in the log; each now gets a dedicated full-screen card over the
      (dimmed, still-visible) frozen scene, color-coded by kind — gold Victory (with the beaten
      foe's portrait, a level-up pill, a distinct blue "Promoted!" banner, and reward rows for
      XP/gold/loot resources), teal Recruit (portrait + specialty/rarity chips), lavender Rescue
      (a returning crewmate is a different feeling than a new one, so it isn't Recruit's color),
      muted-red Defeat ("Return to Tortuga Cove" button, a reassuring "crew fully healed" line),
      a harsher red Defeat-Captured for the navy/rival permadeath case (grayscale portrait, red
      "LOST" tag, no reassuring line), and a quiet neutral Fled card since nothing consequential
      happened. Built via a flat `ResolutionInfo` state object populated alongside the existing
      `appendLog` calls at every branch (lord duel, Black Pearl, escort waves, heat bounty, plain
      bounty, merchant plunder, rescue, standard win, standard/navy/rival defeat) — no reward logic
      changed, only what gets shown
    - Verified `npx tsc --noEmit` clean, then in-browser via Playwright driving the real dev
      build (not a mockup) through the Debug screen: all 6 backdrops screenshotted individually
      (caught and fixed one real bug — a second jail torch wasn't rendering because a
      `{ left: undefined }` style override didn't reliably unset the base style's `left: 10` on
      web; fixed with two explicit named styles instead of one shared style + override), a full
      Merchant Ship fight through to the loot-reward Victory card, a Recruit card, and — caught
      by accident when an automated flee-loop chipped HP down to a real faint — the standard
      Defeat card, all confirmed rendering correctly with zero console/page errors throughout
59. ✅ **Move buttons show power vs. accuracy, not just a name** (2026-08-10) — second item off the
    "improve this scene" follow-up list after the resolution cards (item 58). A crew member's two
    moves are always the same specialty as each other and as the crew member (already shown in
    their namecard), so a specialty icon per button wouldn't help pick between them — what
    actually differs is the power/accuracy tradeoff (`MOVES` ranges roughly power 40-70, accuracy
    75%-95%). Each move button now shows a 3-dot power tier plus hit% under its name (e.g.
    "Cutlass Slash ●○○ · 95% hit" next to "Boarding Rush ●●● · 85% hit"), so the reliable/weak vs.
    risky/strong choice is visible at a glance instead of memorized. Verified `npx tsc --noEmit`
    and in-browser at both one-move and two-move crew levels
60. ✅ **Enemy move telegraph** (2026-08-10) — third item off the "improve this scene" follow-up
    list. Previously the foe's move was rolled fresh the instant `playEnemyTurn` resolved, so you
    only found out what hit you after it happened. Now the foe's *next* move is picked and shown
    up front — a small "⚠ Boarding Rush ●●●" chip under the foe's HP bar, visible the whole time
    the player is choosing their own action — and `playEnemyTurn` consumes that same queued move
    rather than rolling a new one, so the telegraph is always honest. A fresh move re-rolls
    immediately after each turn resolves, ready for the next round. Reuses the power-tier dots
    from item 59 rather than inventing a new indicator. Verified in-browser: the telegraphed move
    name matched the log line for what the foe actually used, turn after turn
61. ✅ **Hit sound + haptics** (2026-08-10) — fourth and final item off the "improve this scene"
    follow-up list. Every landed hit (yours or the foe's) now fires a short synthesized clash
    sound (`assets/sfx/hit.wav` — a percussive noise burst + metallic high partials + a low thump,
    generated procedurally, no external asset needed) via `expo-audio`'s `useAudioPlayer` (the
    SDK 52+ replacement for the now-deprecated `expo-av`; `seekTo(0)` + `play()` replays the same
    loaded buffer every hit instead of allocating a new player each time), plus a medium haptic
    tap via `expo-haptics` on native, explicitly skipped on web with a `Platform.OS` guard rather
    than relying on its own no-op. Both wrapped in try/catch so a failed audio/haptics init can
    never break a turn. New dependencies: `expo-audio@57.0.3`, `expo-haptics@57.0.1` (installed
    directly from `registry.npmjs.org`, same as `expo-linear-gradient` earlier — `npx expo
    install` can't reach `api.expo.dev` in this environment). Verified `npx tsc --noEmit` clean
    and in-browser: multiple hits both directions with zero console/page errors, and confirmed via
    the network panel that `hit.wav` actually loads through Metro's dev server (no `<audio>` tag
    on web — expo-audio plays it through WebAudio directly)
62. **Author Patron quest batches, building-by-building** — apply the proven Patron pattern
    (`SIDE_QUESTS` entries with `hostedByBuildingId`) to the buildings that don't have any patrons
    yet, drawing from the reusable archetype roster: Barkeep, Local, Drunk, Rival Pirate, Smuggler,
    Fortune Teller, etc., toward the 150+ mini-quest target. Every building already has a bespoke
    floor plan now, so this is purely content authoring — no more engineering prerequisite
63. **More side quests from the brainstormed concepts/styles list** — timed race, clear-the-area,
    investigation, etc.; cheap to add now that one-shot/multi-stage/repeatable are all proven
    patterns. Feeds both standalone map-marker quests and Patron-hosted ones

### Next
64. **Economy polish** — per-island resource price variance for real trade routes, resource-cost
    recruits, resource-based fetch quests
65. **Themed island "puzzle" gauntlets before each Pirate Lord fort** — forts are currently a
    direct walk-in-and-fight with no lead-up layer
66. **Reputation-gated ports** — beyond the one hull-gated island, more traversal gating tied to
    heat/reputation rather than a one-time purchase
67. ✅ **A pure-logic unit test suite for `gameStore`** (2026-08-10) — 33 tests, no rendering:
    `jest` + `ts-jest` (`testEnvironment: 'node'`), a hand-written in-memory
    `@react-native-async-storage/async-storage` mock (the real package's own jest mock isn't
    published at a stable path for this SDK version) mapped in via `moduleNameMapper`, and
    `debugResetSave()` — the same action the Debug screen's "Reset Save" button already calls —
    reused as the fresh-fixture `beforeEach`. New deps: `jest@30.4.2`, `ts-jest@29.4.12`,
    `@types/jest@30.0.0`, installed directly from `registry.npmjs.org` like the other recent ones.
    `npm test` runs it; `npx tsc --noEmit` now needs an explicit `"types": ["jest", "node"]` in
    `tsconfig.json` since auto-inclusion of `@types/*` wasn't picking up jest's ambient globals in
    this project's config, plus `"rootDir": "."` and `"isolatedModules": true` for ts-jest itself.
    Covers gold/heat clamping, XP + promotion (including cascades), the 6-crew ship cap, permadeath
    (`removeCrewMember`'s two branches — survives vs. entire-crew-wiped auto-replace), rescue,
    Crew Quarters bench/board, theft heat math + cooldowns, resource gather/sell/craft, ship
    upgrades + salvage gating, side-quest completion idempotency + wave progress + repeatable
    turn-ins, `defeatPirateLord` idempotency (the shared state the Council gate reads), and the
    Black Pearl capture/board/disembark flags.
    **Found and fixed a real bug in the process**: both `gainXp` and `debugSetCrewLevel` only ever
    recorded the *final* template of a multi-stage promotion cascade as seen/recruited — a big
    enough XP dump or debug level jump that crossed two promotion thresholds at once (e.g.
    deckhand_swordsman → boarding_captain → duelist_first_mate in one call) silently skipped
    marking the intermediate stage, which would under-count Crew Log completion. Fixed by
    collecting every stage crossed during the cascade instead of only the last one; verified via
    the new test and, in-browser, a Debug-screen Lv.25 jump correctly landing on "Duelist First
    Mate" with zero console errors

### Later
68. **Recurring named rival captain** with scripted story-beat battles (currently just a random
    hostile template) — Ocracoke Inlet is already reserved as a natural convergence point
69. **GTA-style character switching** (biggest, most novel, probably last)
70. Credits screen + real post-game content unlocks once there's more post-Blackbeard content to
    unlock
71. Full e2e test automation, IAP integration, real art asset pipeline —
    pre-launch/production concerns rather than gameplay-loop gaps
72. **Progressive crew-slot unlocks tied to story milestones** — right now `SHIP_CREW_CAP` is a
    flat 6 available from the very start (see Crew Management above); revisit this so you begin
    with 1-2 slots and unlock more by defeating Pirate Lords (or similar story beats), turning
    party growth into a reward rather than a static number. Pairs with the battle-scene crew-swap
    strip (see Battle System UI work): the strip should show one dim/locked "next slot" placeholder
    at the end rather than every unearned slot, so a new player's first battle doesn't show 5 empty
    grey circles
73. ✅ **Tortuga Cove's town snapped onto an orthogonal grid, diagonal streets removed** (2026-08-13)
    — direct feedback: "I thought we were going for the grid layout, everything in a grid, and
    tiled, removing all diagonal roads and paths etc." Movement itself is unchanged (still the
    continuous drag-to-sail from the "Movement & Exploration" section above — see that note for why
    tile-stepping stays off the table); only the *town's* street/building/house layout got gridded,
    and only on Tortuga Cove — the other 6 islands' street plans are untouched. Built
    programmatically, not redesigned by hand: every Tortuga building, house, and street-connected
    landmark/marker (Basse-Terre Square, the Lighthouse, La Ringot Fields, the Locked Ward, the
    Bounty Board — the handful whose offset was also a literal street endpoint) got snapped to the
    nearest free cell of a 24-unit lattice (collision-resolved via spiral search, re-verified inside
    `TORTUGA_SHAPE`), then reconnected with a Manhattan minimum spanning tree — the shortest network
    of strictly horizontal/vertical edges that still reaches every point, each multi-axis hop split
    into an L-shaped elbow instead of a diagonal line. Average displacement from each entity's old
    position was ~9 units (max ~18) — this is a snap, not a redesign, per the same direct feedback's
    scope. Deliberately left un-gridded: decorative Scenery (the High Woods/Bois Sombre/ruins/
    graveyard trees, rocks, and grave markers — hundreds of them, meant to read as natural, not
    town blocks), the wilderness Landmarks with no street connection, Resource nodes, Treasure
    sites, and the Blackfin duel-stage markers — none of these are part of "the roads and paths,"
    and gridding a forest canopy would look wrong rather than better. Piers/quays/the breakwater
    (`harbor.ts`) are also untouched — they hug the real coastline by design, same as the coastline
    itself. Verified with the same Python collision/polygon-membership scripting used throughout
    this project's town-layout work, `npx tsc --noEmit` clean, all 45 `jest` tests still green, and
    an in-browser check (temporarily nudging `START_POSITION` to sweep a few different parts of
    town, then reverting it) confirmed clean right-angle streets and no rendering regressions.
74. ✅ **Minimal overlap fix: 19 buildings/houses nudged, nothing else touched** (2026-08-13) — a
    first attempt at "check distances from the path and other objects... unobstructed walk for the
    character" over-corrected: it rebuilt the whole street network with a driveway/setback for
    every building whose street ran through it, more than doubling the segment count (193 → 455)
    into a visibly cluttered mess. Direct feedback: "why are there lots and lots of paths
    everywhere... place the buildings in a logical position near the paths... they should be
    intersecting the paths and should have a clear unobscured route around... use logic and game
    logic." Reverted that attempt outright (`git revert`, back to item 73's 193 segments) and
    re-read the actual ask: buildings fronting directly onto their street is correct and wanted —
    item 39 already established this is "working as designed, not a bug" — the only real problem is
    the handful of buildings/houses sitting so close to an *unrelated* building/house that there's
    no walkable room around them. Fixed with the smallest change that solves that: checked every
    pair of Tortuga buildings/houses/street-linked markers against (a) the real in-game collision
    radii (`HOUSE_COLLISION_RADIUS`/`BUILDING_COLLISION_RADIUS`, `MapScreen.tsx`) — the actual "can
    the player get stuck" test — and (b) a looser visual-footprint check for the worst sprite-on-
    sprite overlaps, leaving ordinary row-house touching alone as the established cramped-quarter
    look. 19 of 161 entities needed a nudge: first tried sliding an entity along its own street's
    existing line (the street just gets longer or shorter, stays perfectly straight, no new
    segment); only where that wasn't possible — a true corner where two streets meet at the
    building from different directions — did it get a short local move with its street elbowed to
    still reach it exactly (never diagonally). Net effect: 213 street segments (193 unchanged + 20
    new elbow pieces for the corner cases), not 455; zero pairs closer than the hard collision floor
    anywhere in town; the 142 untouched buildings/houses and the rest of the street layout are
    pixel-identical to item 73. Verified `npx tsc --noEmit` clean, all 45 `jest` tests green, and an
    in-browser check of the town core shows the same layout as before with only the handful of
    nudges visible.
75. ✅ **Captain Scally's map sprite re-cut: fixed the shadow smudge, added the missing SW turn
    frame** (2026-08-13) — "captain scally has a weird shadow... do we also need any new animation
    frames, I know we were missing one view right?" Both were cutting/tooling bugs, not missing
    art: `assets/brand/scally_sprite_sheet_source.png` already has real per-pixel alpha (confirmed
    by inspecting the channel directly) with a small, soft, centered shadow ellipse baked under
    each pose's feet — clean on every row checked (down/left/right/up walk, all 4 idle rows, all 8
    turn-frame poses). Whatever cut the shipped `assets/sprites/scally/*.png` files previously
    didn't use that native alpha; each frame instead carried a lopsided dark smudge (background/
    row bleed). Re-cut every walk (20), idle (12), and turn (now 4, was 3) frame straight from the
    sheet's own alpha channel — auto-detected row/column boundaries via content gaps, tight-trimmed
    each frame to its own bbox with a few px of padding, no re-derived thresholding at all. Also
    answers the "missing view": the sheet's "TURN FRAMES (8 DIRECTIONS)" panel has all 8 real
    poses, but the previous cut only pulled 3 (SE/NE/NW) and stood in for the missing SW pivot
    (the left<->down turn) with a horizontal mirror of SE (`scallySprites.ts`'s `TURN_SW`). The
    4th real pose was sitting uncut in the sheet the whole time — cut it as `turn_sw.png` and wired
    it in directly, no mirror trick needed anymore. Nothing else in the sheet needs new frames for
    what's currently wired up (movement + idle + the 4 turn pivots are all covered by real art).
    Verified `npx tsc --noEmit` clean, all 45 `jest` tests green, and an in-browser crop over the
    player token confirms a clean, centered, symmetric shadow.
76. ✅ **The Black Pearl gets real ship art** (2026-08-14) — "Here is captains Scallys ship. Swap
    out the animations like you did for captain scally for his boat. Include the wake and turns.
    Dock the black in the harbour and when I approach the boat and step into it. I then control
    the boat... when I hit the jetty I turn back into captain scally and the boat parks up on the
    jetty waiting for a return." The user's "CAPTAIN'S BOAT – SPRITE SHEET" reference has no alpha
    channel (flat RGB, unlike Scally's sheet), so a new chroma-key cutout module
    (`scratchpad/.../cutout.py`, not committed — a throwaway tool) computed a soft alpha mask from
    color-distance to the sheet's sampled background, then connected-component-labeled the result
    to pull each sprite. Cut 16 frames into `assets/sprites/ship/`: all 8 "Quarter Turns" compass
    poses (S/SE/E/NE/N/NW/W/SW), the Docking panel's 3-frame "APPROACH DOCK" loop and its separate
    "DOCKED IDLE"/"DEPART DOCK" frames (these two were one merged connected-component at first —
    their pier posts touch with no background gap between them, same touching-frame issue as
    Scally's walk_up — fixed with a hard x-boundary split at the gap column instead of a bbox per
    component), and 3 wake sizes from the Effects panel. New `src/data/shipSprites.ts` mirrors
    `scallySprites.ts`'s structure: `shipSpriteSource(heading)` for the 8-way sailing art,
    `headingFromVector()` bucketing the same drag vector the joystick already produces into one of
    8 compass headings (`scallySprites.ts`'s `turnFrameFor` only had 4 to bucket into), plus the
    approach/depart/wake exports.

    Turns out no new state machine was needed at all — sea travel was already fully gated behind
    boarding the Black Pearl (capturing her from Captain Odessa Kane is the game's first main
    quest), with an existing board/sail/auto-disembark-on-landfall loop in `MapScreen.tsx`. This
    was purely an art-and-polish pass over that existing mechanic: `MapScreen.tsx`'s sea-render
    branch (previously the `PLAYER_EMOJI_SEA` ⛵ glyph) now shows the real 8-direction sprite, with
    a wake image trailing opposite the heading while moving. A per-tick proximity check against
    every `PIERS` line (not just its tip — `distToSegment`-style projection) swaps in the 3-frame
    approach loop once she's closing on a jetty; `confirmBoardBlackPearl()` flashes the depart pose
    for `DEPART_ANIMATION_MS` right as she pulls off the pier. `WORLD_SPRITES.blackShip` (the
    docked marker, previously a detailed non-matching galleon render) now points at the same
    `ship_docked.png` "DOCKED IDLE" frame, so she reads as one consistent piece of art whether
    parked or under sail — satisfying "the boat parks up on the jetty waiting for a return" for
    free, since that marker already re-appears the instant `blackPearlBoarded` goes false.

    `BLACK_PEARL_START_OFFSET` (`blackPearl.ts`) moved from an arbitrary open-water point (192
    units from the nearest coastline — never actually reachable on foot, a latent bug from before
    this pass) to 20 units past the tip of `harbor.ts` `PIERS[0]` (the westernmost pier, the
    docks-and-careening quarter) — confirmed reachable because `islands.ts`'s `islandAtPoint()`
    already treats standing within `PIER_WALK_RADIUS` of a pier's line as land, so the very end of
    the jetty is walkable and sits within `ENTER_RADIUS` of her new position. "Dock the black in
    the harbour" — done, at a real named pier instead of a bare sea coordinate.

    Verified `npx tsc --noEmit` clean and all 45 `jest` tests green. In-browser: confirmed via the
    Debug screen's Black Pearl shortcuts (Instant Capture/Board/Force Disembark) that the app loads
    and runs with zero console errors through many capture/board cycles (meaning all 16 new asset
    `require()`s resolve and the sea-render branch mounts cleanly), and that normal on-land movement
    (walk cycle, turn frames, building/quest prompts) is unaffected. Tortuga's harbor front turned
    out to be built out wall-to-wall with no direct unobstructed line from the town center to open
    water — repeated scripted drag-navigation toward the ship's exact coordinates (read via a
    temporary on-screen debug readout, removed before commit) made steady progress but didn't
    finish closing the last ~200-300 units before time was called on that approach; the live sea
    render (8-way heading swap, wake, approach/depart flashes) is therefore verified by code review
    and the individually-inspected cut frames rather than a full in-browser sail-to-the-ship
    screenshot. Scoped out for now (available in the source sheet, unused): Sail States
    (furled/half/full), the south-view Sail-Idle/Sail-Move/Row-Move loops, Special Animations
    (turn-left/right/accelerate/stop-skid/reverse), Combat/Actions (cannon fire/take damage/
    sinking — no sea-combat hook exists yet), and the Rowboat/Captain's-Longboat panel — same
    "flag it, don't force it in" treatment the unused Scally portrait/emote content got.
77. ✅ **Ship polish pass: smooth turns, layered wake, idle sway, universal docking, a "stop/skid"
    battle flash** (2026-08-14) — the user liked all 8 suggestions offered after item 76 shipped
    and said to go ahead on each. What actually landed, and what got reshaped or cut along the way:

    - **Smooth turns.** `shipSprites.ts` gained `turnDirectionFor()` — the shortest-arc left/right
      call between two of the 8 headings (mirrors `turnFrameFor`'s logic but across 8 points
      instead of 4, and returns null on a dead-on 180 same as that function does) — paired with the
      sheet's "Special Animations" TURN LEFT/TURN RIGHT poses. `MapScreen.tsx` flashes the banked
      pose for `SHIP_TURN_ANIMATION_MS` whenever `shipHeading` changes, same pattern as Scally's
      `turningFrame` effect.
    - **Wake that scales with speed.** The joystick's existing clamped-distance-to-max-drag ratio
      (previously computed and discarded every drag update) is now kept as `dragIntensity` state
      and used to pick small/medium/large wake tiers. Two copies of the chosen tier render behind
      the ship at different offsets/opacities along `-SHIP_HEADING_VECTOR` instead of one static
      blob, reading as a short fading trail without tracking real trail-point history.
    - **Idle sway.** A continuous slow sea-legs bob (`shipIdleSway`, composed with the existing
      `walkBounce` via `Animated.add`) runs while boarded, stationary, and off any island — so she
      doesn't look frozen sitting on open water between drags.
    - **Piers on other islands, reframed.** Rather than hand-author pier art+data for one more
      island, the "APPROACH DOCK" trigger now checks distance to *every* island's own coastline
      (`ISLAND_LIST`, via the already-existing `closestPointOnSegment` helper), not just Tortuga's
      named piers. The docking moment now shows up wherever the player actually makes for shore,
      not only at the one island with a jetty — same practical outcome as adding more piers, no new
      art needed.
    - **A "stop/skid" moment for sea fights.** The sheet's "Stop/Skid" special-animation pose (a
      wide double-wake sudden-halt frame) flashes for `STOP_SKID_ANIMATION_MS` right before
      `startEncounter()` actually cuts to the battle screen, whenever `blackPearlBoardedRef.current`
      is true — covers the pre-capture Odessa Kane duel, wild sea encounters, and merchant-ship
      encounters alike, since all three are "something stops the ship," not just one of them.
    - **Two-stage depart.** Boarding now flashes DEPART DOCK (still shows the pier) then a second
      beat of the sheet's "Accelerate" pose (open water, gaining speed) before settling into normal
      sailing — uses a frame that was sitting cut-but-unused after the first pass.
    - **Sail State (furled/half/full), dropped.** Cutting this panel for real showed its ships have
      tan/cream sails with only a small skull flag at the masthead — not the solid black sails the
      rest of the sheet (and the game) uses for Captain Scally's boat. Swapping it in for idle
      moments would have read as a mismatched ship, not a state change, so it was left uncut/unused
      rather than forced in.
    - **Bulldozing a "boat lane" through the harbor front, reconsidered and dropped.** The original
      suggestion assumed the harbor front was a genuine dead end. Checking `buildings.ts`'s
      waterfront row against `BUILDING_COLLISION_RADIUS` showed there's already a walkable corridor
      along Dock Street (y≈0 between the two building rows) with real clearance — what read as a
      wall during testing was a scripted-drag precision problem, not a structural one. Given the
      user's earlier, still-open feedback about layout edits happening without being asked ("the
      layout is still following the old paths and buildings... we will come back to that shortly"
      — still unresolved, not touched here), moving buildings on a hunch that turned out to be
      wrong wasn't the right call; nothing in `buildings.ts`/`houses.ts`/`streets.ts` was touched
      this pass.
    - **Rowboat mechanic, deferred outright.** This needs real gameplay decisions this pass
      shouldn't make unilaterally (where would rowboat-only landings exist that the ship can't
      already reach, given she already docks anywhere; is it faster/slower; any rowboat-specific
      encounters) — flagged back to the user rather than half-built.
    - **Cannon-fire/take-damage sprites, not integrated.** Attempted cuts from the Combat/Actions
      panel kept fusing adjacent ships' muzzle-flash/smoke clouds into one connected component —
      same touching-art problem as the docking panel, but without a clean hard-boundary column to
      split on this time. Given no real sea-combat mechanic exists to hang it on anyway, this was
      dropped in favor of reusing the already-clean Stop/Skid pose for the "a fight interrupted the
      sail" moment instead.

    Verified `npx tsc --noEmit` clean and all 45 `jest` tests green. In-browser: zero console errors
    across several long boarded sessions exercising heading changes, drag-intensity updates, and
    the tick loop's per-frame approach/coastline checks — the same kind of partial live coverage
    documented for item 76, for the same reason (Tortuga's harbor front is dense enough that
    scripted straight-line dragging repeatedly got boxed in before reaching open water). The new
    render code (wake layering, turn-bank selection, the `Animated.add` idle-sway composite) is
    verified by code review and the individually re-inspected cut frames, not a live screenshot of
    it firing at sea.
78. ✅ **Sails actually furl at a pier, both directions** (2026-08-14) — the user asked directly:
    "Does the boat have stored sails when docked? And drop when setting sail. And vice versa when
    docking?" Checking the actual cut art (not memory) confirmed the sheet's Docking panel already
    draws this distinction on its own: DOCKED IDLE and DEPART DOCK both show a small furled sail
    bundle at the masthead, while APPROACH DOCK and every sailing pose show the full spread black
    canvas. So: yes for departure already (item 77's depart→accelerate sequence goes furled→full),
    but arrival was asymmetric — the approach loop stayed full-sail right up to the instant of
    landfall, then cut straight to the furled docked marker with no transition. Fixed by adding a
    tighter `SHIP_FURL_RADIUS` (55 units, inside the existing 130-unit `SHIP_APPROACH_RADIUS`):
    once she's this close to a real pier, still under sail, the approach loop hands off to
    `SHIP_DEPART_SPRITE`'s furled pose for the final stretch, so the sail is visibly already down
    by the time the static docked marker takes over. Symmetric with departure now.

    Investigating this also surfaced a real bug worth fixing while in there: `SHIP_DEPART_SPRITE`
    bakes in a pier's dock posts (it's cut from the same source image as the docked marker), but
    item 77's depart→accelerate flourish played on *every* boarding, regardless of whether the
    Black Pearl was actually sitting at a real pier — since item 76 already lets her park anywhere
    a player makes landfall, boarding her from a plain beach would have shown phantom jetty timbers
    floating over open sand. Fixed by gating both the new arrival-furl and the existing departure
    flourish on the same `SHIP_FURL_RADIUS` check (via a new shared `distanceToNearestPier()`
    helper): only a genuine pier gets the furled-sail art either direction; a coastline-only landing
    keeps the simpler instant full-sail-to-marker cut, no pier art. Cutting a pier-free furled-sail
    frame to cover that case too would need new art (the ship and pier are fused in the one source
    image) — flagged as a gap, not solved here, since it's low-frequency (most disembarks happen
    near Tortuga's real piers) and the fallback already reads fine.

    Verified `npx tsc --noEmit` clean and all 45 `jest` tests green.
79. ✅ **Captain Scally art pass: idle loop, portrait, emotes, faces, run cycle, interact poses, UI
    icons, Cheeky the monkey** (2026-08-14) — the user asked "How can we improve Captain Scally?",
    got 8 sheet-grounded suggestions back (all cut from `assets/brand/scally_sprite_sheet_source.png`,
    same alpha-based extraction technique as the item-75 re-cut), then said "Try them all. If they
    don't work at this stage that's fine." Wired all 8, several trimmed to something honest rather
    than forced:
    - **Idle animation.** `IDLE_SOURCES` (4 directions × 3 frames) was already cut in item 75 but
      never actually cycled — Scally just held the walk cycle's frame 0 while stationary. Re-checked
      the frames against the walk cycle's scale/framing (clean, no mismatch) and wired a slow
      450ms/frame breathing loop, independent of `walkSpriteFrame` so switching between
      moving/stopped never skips mid-cycle.
    - **Header portrait.** The map header's plain `{emoji} Captain Scally` text swapped for the cut
      bust portrait (`SCALLY_PORTRAIT`), with the now-fully-replaced `playerEmoji` derivation (and
      its orphaned `PLAYER_EMOJI_SEA` import and dead `styles.playerEmoji` rule) removed.
    - **Emotes.** Two get real narrative triggers: a wave (`EMOTE_WAVE`) flashes the instant a
      building's enter-prompt appears — greeting the door — and a victory flourish
      (`EMOTE_VICTORY`) flashes when the map screen notices `defeatedLordIds`/`completedQuestIds`
      grew since last render (a Pirate Lord fell or a side quest completed on another screen). The
      other four (cheer/think/laugh/sit) don't have one clean story beat each, so they share an
      `IDLE_FLOURISH_POOL`: stand still 5s and Scally cycles a random one of the four for 2.2s
      before returning to the ordinary breathing loop — the standard "idle animation after
      inactivity" trick rather than four separate bespoke triggers.
    - **Expression faces.** `SCALLY_FACES` doesn't have a home in `EncounterScreen` — battles are
      fought by whichever crew member is active, not Scally herself, so pinning his expression to a
      duel he isn't visually in would misrepresent the actual fighter. Redirected to something the
      map screen genuinely knows: a small mood badge on the corner of the header portrait, driven by
      the same wanted-heat gauge already on screen (neutral under 25%, `FACE_DETERMINED` above it,
      `FACE_HURT` above 60% — the existing amber/red heat-bar thresholds).
    - **Run cycle.** `RUN_SOURCES` (side view only, faces right in the source art) swaps in for the
      ordinary walk cycle once heat crosses `RUN_HEAT_THRESHOLD` (60%, matching the heat-bar's red
      line) while moving left/right; mirrored via the same `scaleX` trick already used for turn
      frames when facing left. Up/down movement keeps the normal walk cycle regardless of heat — no
      matching run art was cut for those facings.
    - **Attack/sword-ready poses.** The on-foot equivalent of item 77's ship Stop/Skid flash: forced
      fights (`startEncounter`'s `else` branch, i.e. not boarded) now flash `POSE_ATTACK` then
      `POSE_SWORD_READY` for `ATTACK_FLASH_MS` each before cutting to the battle screen, instead of
      an instant cut. `POSE_POINT` and `POSE_CHEER_FIST` are cut and exported but left unwired —
      same precedent as `SHIP_REVERSE_SPRITE` in item 76, available for whenever a real "pointing at
      something"/"cheering a recruit" moment gets designed.
    - **UI icons.** `ICON_EXCLAIM` replaces the plain `❗` text on both BuildingScreen's quest badge
      and MapScreen's own building quest-indicator; `ICON_SPEECH` sits next to BuildingScreen's Talk
      button; `ICON_MAP` replaces the `📜` side-quest world marker. `ICON_QUESTION` stayed unwired —
      no existing "?"/mystery UI moment turned up that didn't also require an unrelated design call
      (e.g. hiding a locked Pirate Lord's identity, which `QuestScreen` currently doesn't do), so
      forcing it in would have been a scope decision disguised as an icon swap.
    - **Cheeky the monkey.** `protagonist.ts` and the Menu screen already establish Cheeky stays
      aboard ship ("Cheeky is minding the ship") rather than trailing Scally on foot — an early draft
      of `monkeySprites.ts` assumed a trailing companion before this was caught via grep and
      corrected. Wired instead as a small idle/wink figure perched on the docked, unboarded,
      uncaptured Black Pearl marker (blinks to `MONKEY_WINK` every 4s), and swapped into the Menu
      screen's subtitle in place of the plain 🐒 emoji. `MONKEY_WALK`/`MONKEY_SLEEP` and the sheet's
      whole "Extras" row (climbing a rope, hanging from a bar, sitting with a banana/barrel) are cut
      but unused — no on-foot or asleep-at-the-wheel moment currently calls for them, and where
      Cheeky would actually climb/hang is a real design decision this pass didn't make.

    Verified `npx tsc --noEmit` clean and all 45 `jest` tests green. In-browser: confirmed the idle
    breathing loop, header portrait, and heat-driven face badge (`FACE_HURT` at 90% heat via the
    Debug screen's heat shortcuts) render correctly via Playwright screenshots. The run cycle,
    attack/sword-ready flash, and monkey-on-deck marker are verified by code review and typecheck
    only — the Debug screen's "Force Captain Duel"/board shortcuts bypass MapScreen's transition
    code entirely (they set the encounter/board state directly), and Tortuga's harbor front is
    dense enough that scripted dragging to trigger a real forced encounter or get the docked-ship
    marker in frame wasn't reliable in the time budget, same limitation noted in items 76 and 77.
80. ✅ **Fixed item 79's walk cycle regression: run cycle reverted, emotes made idle-only**
    (2026-08-14) — the user reported Scally's walk now "looks like he is hopping." Root cause was
    two of item 79's overlays being able to override the moving sprite mid-stride: the run cycle
    swapped in a bigger-stride pose set once heat crossed 60% (compounding with the existing
    `walkBounce` vertical animation into a visible pop), and the emote overlay — most commonly the
    wave, since its trigger (a building's enter-prompt appearing) routinely fires while still
    walking up to the door — could freeze Scally into a static pose for up to 900ms while she kept
    sliding across the map. Both read as the same thing: a hop instead of a smooth walk. Fixed by
    (a) removing the run-cycle swap from the move-rendering path entirely — walking is always the
    plain `WALK_SOURCES` cycle now, full stop, and (b) gating the emote overlay on `!isMoving`, so
    a wave/victory/flourish that fires while still moving simply doesn't show rather than freezing
    the walk. The attack/sword-ready flash keeps overriding movement, since that one's *meant* to
    interrupt a stride (same as the ship's Stop/Skid) rather than being a bug. `RUN_SOURCES`/
    `runSpriteSource`/`RUN_HEAT_THRESHOLD` stay exported from `scallySprites.ts`, cut but unwired,
    for whenever a real crossfade (not a hard swap) gets designed between walk and run.

    Verified `npx tsc --noEmit` clean and all 45 `jest` tests green.
81. ✅ **Actually fixed the hop: idle breathing animation reverted, `scallySpriteSource` back to
    holding walk frame 0** (2026-08-14) — item 80's fix didn't work; the user reported it was still
    hopping. Item 80 addressed two real overlay bugs (run cycle, emotes) but missed the actual
    culprit: item 79's idle breathing animation. In `MapScreen.tsx`, `isMoving` is driven directly
    off the joystick drag distance crossing `DEADZONE` inside the pan gesture's `onUpdate`, which
    fires on every pointer-move event — so near the deadzone boundary (a slow drag, a hand
    micro-tremor) `isMoving` can flip true/false rapidly, well beyond genuine start/stop moments.
    Before item 79, that flicker was invisible: idle held `WALK_SOURCES[direction][0]`, the same
    pose family as walking. Item 79 swapped that for a real 3-frame standing/breathing pose
    (`IDLE_SOURCES`) — visually a different stance (feet together) from mid-stride walk frames — so
    every `isMoving` flicker now popped Scally between two distinct poses. That's the hop. Fixed by
    reverting `scallySpriteSource` to its pre-item-79 form (idle = walk-cycle frame 0, full stop) and
    removing the idle-frame-cycling state/effect from `MapScreen.tsx`. `IDLE_SOURCES`/
    `IDLE_FRAME_COUNT` stay exported, cut but unwired, with a doc comment explaining a real idle
    stance isn't safe to wire in until `isMoving` itself gets debounced — a genuine fix belongs in
    the drag-gesture code, not the sprite-selection code, and wasn't done here.

    Verified `npx tsc --noEmit` clean and all 45 `jest` tests green.
82. ✅ **Found the real hop: a leftover single-glyph "walk bounce" was drowning out the walk cycle**
    (2026-08-14) — item 81's fix didn't work either; the user, understandably out of patience,
    clarified what "hopping" actually meant: "It doesn't switch between the walking cycle anymore.
    It doesn't go left foot right foot." That's a different claim than items 80/81 chased (a pose
    popping between two different stances) — this is about the stride itself not reading as a
    stride. Rather than guess a fifth time, this got verified two ways before touching code: (1) a
    temporary `console.log` inside the walk-frame interval, read back via Playwright, proved
    `walkSpriteFrame` cycles 0→1→2→3→4→0… reliably every 110ms with zero interruption during a
    sustained drag — the state machinery was never broken; (2) a side-by-side of the actual
    `walk_left_0..4.png` frames showed a real, clear alternating stride in the art (unlike the
    `walk_down` set, which is subtler — a front-on view inherently shows less leg motion than a
    side view). So the frames were cycling and the art was fine. What was left: `styles.playerSprite`
    still applied `{ translateY: walkBounce }` — a sharp -6px/160ms vertical bob — to Scally's
    sprite. Its own doc comment gave it away: *"Single-glyph 'walk cycle': bob the player emoji up
    and down… No spritesheet, so this is the whole animation."* That comment predates the real
    walk-cycle art entirely (item 75) and was never cleaned up when the emoji got replaced — the
    bounce kept firing on top of the now-real stride animation, and being a fast, sharp,
    unmistakable motion, it visually drowned out the subtle frame-to-frame leg changes underneath
    it. The result reads exactly as described: a bob in place, not a walk. Fixed by dropping
    `translateY: walkBounce` from the on-land sprite's transform entirely — the 5-frame cycle is the
    motion now, full stop. `walkBounce` itself stays (the Black Pearl's idle sway while sailing
    still layers on top of it), only the on-foot character stopped receiving it. Verified with a
    frame-by-frame Playwright capture of a sustained leftward drag against the production build:
    the leg position now visibly changes frame to frame with a level, non-bouncing torso — a real
    walk, not a hop.

    Verified `npx tsc --noEmit` clean and all 45 `jest` tests green.
83. ✅ **Full revert of Scally's walk rendering to before the art pass, at the user's direct request**
    (2026-08-14) — item 82's fix didn't land either: the user pointed out that its own verification
    screenshots showed one leg stepping forward repeatedly rather than a genuine alternating gait,
    and asked directly to revert to before any of this session's changes touched the walk. Honored
    literally rather than attempted as a fourth diagnosis: the on-land sprite's `Animated.Image`
    (source ternary + transform) is now byte-for-byte what shipped at `4321591` (the commit
    immediately before this whole Scally pass began) — `turningFrame` takes priority, otherwise the
    plain walk cycle, with the original `walkBounce` restored. `scallySpriteSource`/`WALK_SOURCES`/
    the walk-frame-cycling effect were already at that same baseline (items 80-81 already reverted
    those), so this was the one remaining piece.

    Two features from items 184/185 existed only to override this same render — the emote overlay
    (wave/victory/idle-flourish) and the attack/sword-ready forced-encounter flash — so reverting
    the render left them calling `setState` with no visible effect anywhere. Rather than leave that
    dead weight in, they were removed outright: `emoteOverlay`/`flashEmote` and its three triggers
    (building-prompt wave, defeated-lord/completed-quest victory watch, prolonged-idle flourish
    interval), `scallyAttackFlash`/`scallySwordReadyFlash` state, and `startEncounter`'s two-stage
    on-foot flash all deleted; `startEncounter` is back to firing straight through when not boarded,
    exactly as it was at `4321591`. The now-unused `EMOTE_*`/`IDLE_FLOURISH_*`/`POSE_ATTACK`/
    `POSE_SWORD_READY`/`ATTACK_FLASH_MS`/`WAVE_ANIMATION_MS`/`VICTORY_ANIMATION_MS` imports were
    dropped from `MapScreen.tsx` accordingly (their exports stay in `scallySprites.ts`, available if
    a future pass wants to build genuinely walk-independent triggers for them). Everything else from
    the Scally pass that doesn't touch walking — the header portrait, the heat-driven face badge,
    the idle-frame-count/run-cycle exports left cut-but-unwired, the UI icon swaps, Cheeky on the
    docked ship — was left as is, since the ask was specifically about the walk.

    Verified `npx tsc --noEmit` clean and all 45 `jest` tests green, and a direct diff of the on-land
    render block against `4321591` shows only comment text differs, not code.
84. ✅ **Found the actual bug: `facingDir` flicker on a not-perfectly-straight drag was interrupting
    the walk cycle** (2026-08-14) — item 83's full revert still didn't satisfy the user, who
    clarified precisely: the walk *does* have real art (confirmed, again, by cropping the individual
    `walk_left_0..4.png` files and viewing them in sequence — a clean, clearly alternating stride,
    unchanged since before this session), but it doesn't read that way in the game specifically when
    moving left/right. That ruled out both the art and the frame-cycling state (already proven
    correct via instrumented logging in item 82) and pointed at the one piece never actually
    scrutinized: how `facingDir` itself gets picked.

    `MapScreen.tsx`'s pan gesture recomputes `facingDir` from raw, instantaneous
    `e.translationX`/`e.translationY` on *every* `onUpdate` call, with no margin — whichever axis has
    the (even barely) larger magnitude wins. A real drag is never a laser-straight line; a thumb
    moving "left" still has constant small vertical wobble. Traced the actual numbers with a
    realistic arced synthetic drag (net leftward, ±25px vertical sine wobble) and confirmed several
    points along the path where `|translationY|` genuinely exceeds `|translationX|` — enough to flip
    `facingDir` to `'up'`/`'down'` under the letter of the old code. Every such flip does two things
    at once: fires the mid-pivot `turnFrameFor` flash (a diagonal turn pose, not a walk-cycle frame)
    for `TURN_ANIMATION_MS`, and swaps the walk art to the `up`/`down` set — which items 79-83
    already established is real but far subtler than `left`/`right` (confirmed again by zooming into
    the master sheet: the artist drew almost no leg movement for the front-facing view). The result:
    a left/right drag with any natural wobble gets diluted with random turn-pose flashes and stretches
    of the weak front-facing art, which reads exactly as "not really alternating" even though the
    `left`/`right` art and its frame cycle are both genuinely fine on their own.

    Fixed with hysteresis on the direction pick: added `DIRECTION_HYSTERESIS = 1.4`, and `facingDir`
    now only flips to the other axis when that axis's magnitude leads by that factor — otherwise it
    holds the current facing through the wobble, via a functional `setFacingDir` update rather than
    an unconditional one. This is a real, load-bearing fix (not a revert) — this exact code, wobble
    sensitivity included, has been present since `502ad31`, the very first sprite-art commit, so it
    predates every "before" state this whole thread reverted back to; none of the earlier reverts
    could have touched it. `facingRight`/`facingMode` (the old emoji-era direction state, now
    otherwise unused) were left as-is, out of scope for this fix.

    Verified `npx tsc --noEmit` clean and all 45 `jest` tests green.
85. ✅ **Found the actual `walk_down` bug: the front-facing cut frames never alternated feet at all**
    (2026-08-14) — user follow-up after item 84 confirmed left/right now reads as a real walk, but
    flagged down as still broken, precisely: "only using the leg on the left as you look at him."
    That phrasing (a *specific, consistent* leg, not a flicker) pointed away from the direction/state
    bugs items 80-84 had been chasing and straight at the down-facing art itself, so this time the
    diagnosis started there instead of in `MapScreen.tsx`.

    Cropped and bottom-aligned all 5 `walk_down_0..4.png` frames on a shared canvas (necessary
    because each frame had been independently alpha-trimmed to its own bounding box —
    73-76px wide, 113-120px tall — so laid directly over each other at native offset they'd
    misleadingly appear to "jump around" regardless of the actual pose). Once aligned, the leg
    region made the bug plain: frames 0, 1, and 4 are all close variants of the same pose — left
    foot (as drawn, viewer's left) planted forward, right foot trailing — frame 2 is a crossed
    "passing" pose, and frame 3 is another near-duplicate of the passing pose. At no point in the
    5-frame set does the *opposite* foot ever plant forward. Compared this against the `walk_left`
    set the same way (same alignment technique) as a sanity check, since item 84 had called that
    art "genuinely fine" — confirmed: left/right's 5 frames are a real, clearly alternating side-on
    stride, so this is specific to the down cut, not a project-wide art problem. (`walk_up`, the
    back view, turned out to have the same non-alternating-leg issue on inspection, but the user
    only reported down; left it untouched since a back-view stride reads far more subtly than a
    front view one to begin with, and wasn't in scope for this fix.)

    There was no missing source art to re-cut from — the master sheet's front-view walk panel
    simply wasn't drawn with a mirrored opposite-foot-forward contact pose, only the one side's.
    Rather than ship a walk cycle that can't alternate, synthesized the missing pose: mirrored
    frame 0 horizontally (`ImageOps.mirror`) to produce a genuine "right foot forward" contact
    frame, and did the same to frame 2's passing pose for a second, distinct crossed frame. Front
    view means the character reads as bilaterally close-to-symmetric already (centered hat/face,
    both hands at the sides), so a full-sprite mirror doesn't introduce any obvious seam; the one
    asymmetric detail, the bandana tail, simply swaps sides on the mirrored frames, which reads as
    natural cloth sway rather than an error. Rebuilt the 5-frame sequence as a real alternating
    cycle: `0` contact-left (original), `1` passing (original frame 2), `2` contact-right (new
    mirror of frame 0), `3` passing (new mirror of frame 2), `4` contact-left variant (original
    frame 1, for a touch of extra life before the loop repeats). Only
    `walk_down_1..4.png` changed on disk; `walk_down_0.png` is untouched.

    Verified three ways: (1) the same bottom-aligned crop comparison, now showing a clean
    left-forward / passing / right-forward / passing / left-forward cycle; (2) `npx tsc --noEmit`
    clean and all 45 `jest` tests green (asset-only change, no code touched); (3) a live Playwright
    capture against the actual dev server — dismissed onboarding, held a downward drag, and
    screenshotted the character every ~110ms through a full multi-cycle hold. The captured
    sequence shows the leg position genuinely alternating frame to frame in the running app, not
    just in the isolated source PNGs.
86. 🔄 **Buildings hidden from the map to isolate the street/road layout for review** (2026-08-14) —
    direct feedback: the building sprites aren't cut or placed well enough yet, and they're making
    it hard to judge the street network on its own. Rather than delete `buildings.ts` or any
    building logic (they're still load-bearing — shops, quest givers, the Patrons system, walk-up
    "Enter?" prompts all key off building data elsewhere), added a single render-time toggle,
    `SHOW_BUILDINGS = false` in `MapScreen.tsx`, following the exact pattern `SHOW_GARDENS` already
    established for this kind of "keep the data, hide the render" flag. Gated three things behind
    it: the building icon/sprite render on the map, the building collision obstacle list (so an
    invisible building doesn't still block movement), and the walk-up "Enter {name}?" bottom prompt
    (so no building-related UI surfaces while they're invisible). Houses (`houses.ts`, generic 🏠
    scatter, no sprite art, not what was flagged) and landmarks (`landmarks.ts`) are untouched and
    still render — the complaint was specifically about buildings. Verified in-browser: Tortuga
    Cove now shows streets, houses, landmarks, and NPCs with zero building markers anywhere.
    `npx tsc --noEmit` clean, all 45 `jest` tests green. Flipping `SHOW_BUILDINGS` back to `true` is
    the entire un-revert once the building art/placement gets a real pass — no data or logic
    changed. Next up, per direct request: get the street/road layout itself right first, with
    buildings out of the way.
87. 🔄 **Everything but the ground hidden from the map, at direct request** (2026-08-14) — item 86
    only hid buildings; the follow-up was blunter: "remove everything that isn't the ground." Took
    it literally rather than partially, since the point is a clean slate to judge the street/road
    layout against before rebuilding anything on top of it. Extended the exact `SHOW_BUILDINGS`
    pattern with six more render-time toggles, all `false`, one per content category: `SHOW_STREETS`
    (streets/piers/quays/breakwater), `SHOW_HOUSES`, `SHOW_SCENERY` (trees/rocks/props/decorative
    boats), `SHOW_LANDMARKS` (including the one-off Tortuga gate art, not just the `LANDMARKS`
    array), `SHOW_STREET_NPCS`, and `SHOW_MAP_MARKERS` (every interactive world marker that isn't a
    building — side quests, resource/salvage/treasure sites, the rescue point, Blackfin/Grace story
    stages, Pirate Lord forts, the Black Pearl marker). Left standing: each island's ground polygon
    (the literal ground) and the player token/camera/joystick, since those are what "the ground" and
    "being able to look at it" require.

    Learned from item 86's narrower scope and went further this time on three fronts that a
    render-only toggle doesn't automatically cover:
    - **Collision** — the house obstacle list (separately from buildings', already handled in item
      86) now empties out under `SHOW_HOUSES`, so an invisible house can't still block movement.
    - **The minimap** — it draws its own miniature copy of streets/houses/buildings/lords/resource
      nodes/quest markers from local `near*` variables, which would otherwise leak all this content
      right back into view in the corner even with the main map clean. Every one of those now
      returns `[]` under its matching toggle instead of the real filtered list.
    - **Proximity triggers** — the biggest gap, and the one that actually surfaced in testing: this
      game's walk-up interactions aren't all a dismissible prompt like buildings' "Enter?" card.
      Pirate Lords, side quests, the rescue point, and the Blackfin/Grace stages *auto-navigate to a
      new screen* on proximity with zero UI cue first; resource/salvage/treasure nodes gather
      passively with a toast; landmarks and street NPCs fire a one-shot flavor toast. All of those
      read as "the screen just changed" or "a toast appeared from nothing" with their marker
      invisible — worse than the old invisible-collision problem, not better. Gated every one of
      these behind its matching toggle too. Caught the landmark/street-NPC toasts specifically via a
      live Playwright walk after the first pass looked clean in a static screenshot — the "A Couple:
      Young love, or old love..." flavor line firing over a bare grass field was the tell that the
      render-only pass wasn't enough.

    Verified `npx tsc --noEmit` clean, all 45 `jest` tests green, and a live Playwright capture:
    Tortuga Cove now renders as plain ground texture and the player token only — empty minimap
    outline, no streets, houses, scenery, landmarks, NPCs, or markers — and a wandering drag across
    the area that used to trigger the street-NPC flavor toast now stays silent. Every `SHOW_*` flag
    flips independently, so the natural next step (per the standing request) is turning
    `SHOW_STREETS` back on alone once the road layout itself is redesigned, before touching anything
    else.
88. 🔄 **Roads and paths turned back on and re-skinned with real tile textures** (2026-08-14) — first
    layer of the item 87 rebuild plan, per direct request: "add only the roads and paths. Skin them
    using the sprites and tiles." Flipped `SHOW_STREETS` back to `true` — that one toggle already
    covered exactly this category (`STREETS`, `PIERS`, `QUAYS`, `BREAKWATER`) from how item 87 split
    things up, so no new toggle needed. Everything else from item 87 (houses, buildings, scenery,
    landmarks, street NPCs, map markers) stays off.

    The "skin them" half needed real work, not just the flag flip: `STREETS`' paved 'main' style
    already had a `cobblePattern` SVG tile fill, but only for Tortuga Cove — every other island fell
    back to a flat color, and `PIERS`/`QUAYS`/`BREAKWATER` were flat-color double-strokes
    everywhere, no tile art at all. Only 5 ground tiles exist (`GROUND_TILES`: grass, sand, cobble,
    wood, water — see `worldSprites.ts`), no dedicated dirt/path or stone-embankment art, so this
    pass mapped the closest real texture to each category rather than waiting on new art:
    - **'main' streets** — `cobblePattern`, now on every island, not just Tortuga.
    - **'path' style** (dirt/rough tracks) — new `sandPattern` (sand tile's warm unpaved tone
      stands in for dirt), still a dashed stroke, just pattern-filled instead of flat-colored.
    - **Piers** — new `woodPattern` for the deck, with a thin dark translucent stroke down the
      center standing in for a plank-joint seam (previously two flat-colored strokes).
    - **Quays** — `cobblePattern` (the only stone tile available) plus a light translucent overlay
      stroke down the center, keeping the same two-tone silhouette the old flat double-stroke had
      so quays still read as distinct from plain streets despite sharing cobble's texture.
    - **Breakwater** — `cobblePattern` again, darkened with a semi-transparent black overlay stroke
      of the same width, so it still reads "rougher, darker stone than the quay" per its original
      design intent even without a second stone texture to draw on.

    All five reuse the existing SVG `<Pattern patternUnits="userSpaceOnUse">` technique the ground
    fill and Tortuga's old cobble streets already established — tied to world coordinates, so the
    tile grid doesn't stretch or slide as the pattern gets reused across differently-angled street
    segments. Minimap street rendering (the small schematic blips, not the main map) intentionally
    kept its flat colors — texture doesn't read at that scale, and the minimap already used flat
    colors as a deliberate simplification before this pass.

    Verified `npx tsc --noEmit` clean, all 45 `jest` tests green, and a live Playwright walk through
    Tortuga Cove's town core and harbor: cobblestone streets, wood-plank piers, and sand-dashed
    paths all render with visible tile texture, houses/buildings/scenery/markers all still hidden.
89. 🔄 **Fixed the actual tile art item 88 shipped, plus the dashed-path round-cap bug** (2026-08-14)
    — direct feedback on item 88's result: a reference screenshot of the target look ("Remember I
    want the streets to look like this"), the question "why are the paths rounded at the end," and
    "I don't think you cut the sprites very well... make sure they are correct and fill what's
    supposed to be filled and positioned correctly." All three trace back to the same root cause.

    **The sprite-cutting bug.** `GROUND_TILES`' `sand`/`cobble`/`wood` PNGs (and the pre-existing
    `grass`) were each a single 64x64 crop taken from an arbitrary spot in
    `tileset-catalog/master_catalog_v1.png`'s Terrain & Tiles panel, close enough to the right
    material to look correct as one static icon but never checked against the one thing that
    actually matters for a tile meant to *repeat*: whether its own edges match its own opposite
    edges. They didn't — cropped straight from the panel, `cobble.png` and `sand.png` each carried a
    sliver of the neighboring tile's color and a soft rounded-corner vignette baked into their
    border (the source sheet renders each material as an isolated bordered "chip" sitting on a
    blurred background, not seamless yardage — see `worldSprites.ts`'s cutout-technique comment for
    why that blur exists). Tiled via the SVG `<Pattern>` used for street rendering, that border
    repeats every 32px as a visible seam, and on the dashed 'path' stroke specifically, the sand
    chip's own rounded fringe compounded with the dash's round linecaps to produce the "rounded
    blob" look that prompted the direct question below.

    Confirmed with a real diagnostic rather than eyeballing: built 4x4/5x5 tiled previews of every
    candidate crop before committing any of them (`PIL`, offline, same workflow as the sprite-sheet
    cuts elsewhere in this doc) — the old crops showed an obvious repeating seam in this test, every
    replacement crop below was verified clean in it first.

    **Re-cut properly**, this time from `tileset-catalog/tortuga_focus_v1.png`'s own Terrain & Tiles
    panel — a cleaner, Tortuga-focused pass of the same sheet that turned out to have much better
    pre-tiled material (light, regular stone pavers for cobble — a real match for the reference
    screenshot's plaza, not the old sheet's mossy grey — plus grass/sand/wood that tile with
    essentially no visible seam). `dirt` (new, for 'path') isn't in that sheet, so it's cut from
    `master_catalog_v1.png`'s matching panel instead, using the same interior-crop-then-verify
    method — a genuine soil/track texture, not sand reused as a stand-in like item 88 shipped.
    `water` is untouched (wasn't part of the complaint, already tiled acceptably).

    **The rounded-path-ends bug**, fixed directly rather than just explained: 'path' style used
    `strokeDasharray` with `strokeLinecap="round"` — SVG rounds *every* dash segment's end under a
    round linecap, not only the line's true start/end, so a dashed path always rendered as a chain
    of pill/capsule shapes, not a continuous track; the bad tile art made this worse but didn't
    cause it. Dropped the dash entirely — 'path' is now one continuous stroke exactly like 'main'
    (dirt-textured, `strokeWidth` 14 vs. main's 20, so it still reads as the rougher/narrower
    route), and `strokeLinecap="round"` now only rounds the two genuine endpoints of each real
    track, which is the look a rounded cap was always supposed to produce.

    Verified: rebuilt the same tiled-preview check on the final saved 64x64 PNGs (not just the
    source crops, in case the resize introduced its own edge softening — it didn't), `npx tsc
    --noEmit` clean, all 45 `jest` tests green, and a live Playwright walk through Tortuga Cove —
    the dirt path now bends as one continuous textured track with rounded ends only at its true
    termini, and the cobblestone reads as a clean, light, continuous paved surface much closer to
    the reference screenshot. Houses/buildings/scenery/landmarks/NPCs/markers are all still hidden
    per item 87 — this pass only touched tile art and the 'path' stroke.
90. ✅ **Street/pier/quay/breakwater ends switched to square caps** (2026-08-14) — immediate
    direct follow-up on item 89's fix: "I don't want rounded paths. Change this so it's a full
    tile." Item 89 fixed the dashed-chain-of-pills bug but left `strokeLinecap="round"` on the
    (now single, continuous) stroke, which still rounds off the two true endpoints of every street
    segment — reads as a stubby rounded-off tile rather than a flat one wherever the network
    dead-ends or two segments meet at an angle. Switched every street-family stroke —
    `STREETS`' 'main' and 'path', plus `PIERS`/`QUAYS`/`BREAKWATER`'s double-strokes — from
    `strokeLinecap="round"` to `"square"`: SVG's square cap extends the stroke a half-width past
    the endpoint with flat corners instead of a curve, so a segment's end reads as a complete
    rectangular paving tile. Pure rendering change, no data/geometry touched. Verified `npx tsc
    --noEmit` clean, all 45 `jest` tests green, and a live Playwright walk confirming both the
    dirt path and the cobblestone streets now end in flat square blocks with no rounding anywhere.
91. 🔄 **Piers straightened to due-vertical + wired to the real generated jetty sprite**
    (2026-08-14) — direct follow-up: "The jetty's need to also be vertical and horizontal not
    diagonal. Then replace them with the sprites we generated for the jetty." Two separate fixes.

    **Straightening**: `harbor.ts`'s 4 `PIERS` each had real diagonal drift (up to 86 units
    sideways over their length) left over from the original Shapely harbor-rebuild script, which
    only checked "does the tip land in open water," never axis-alignment. Since every pier already
    reaches predominantly north (the bay opens north) more than sideways, snapping was a one-line
    fix per pier: keep `from` (the quay attachment point, which has to stay put) and set
    `to.x = from.x`, unchanged `to.y` — turns every pier into a straight vertical spur, length
    unchanged. Re-verified with the same ray-casting point-in-polygon check the original harbor
    build used (run standalone against `TORTUGA_SHAPE`, not a new dependency): all 4 new tips still
    land outside the island polygon, same invariant the original rebuild documented. `DOCKED_BOATS`'
    first 4 entries and `blackPearl.ts`'s `BLACK_PEARL_START_OFFSET` are anchored to these exact
    tips (boats moor there, the Black Pearl docks a few units past pier 0's tip) — moved to match,
    same "a few units past the tip" extension, now purely north instead of along the old diagonal.

    **Sprite wiring**: `assets/sprites/world/dock_pier.png` — real generated jetty art, cut during
    the earlier Black Pearl pass and exported as `WORLD_SPRITES.dockPier` (`worldSprites.ts:77`) —
    was never actually placed anywhere; piers kept rendering as a plain wood-pattern SVG stroke
    (see item 88) instead. Wired it in properly: since it's a single illustrated dock scene (posts,
    planking, water gaps), not a repeatable plank texture, tiling it the way cobble/wood/dirt do
    would repeat the same chest/post detail down the boardwalk, so instead each pier gets one
    `<Image resizeMode="stretch">` instance sized to its own exact `x1..x2/y1..y2` span (36 units
    wide, height = the pier's real length) — the same "one placed image per feature" pattern
    buildings/landmarks already use, just stretched to a line's bounding box instead of a fixed
    icon size. Moved out of the `<Svg>` block entirely into the View-layer render (alongside
    HOUSES/BUILDINGS) since `Image` handles this more predictably than an `SvgImage`. The old
    two-stroke SVG pier render (wood-pattern deck + dark seam) is gone.

    Verified `npx tsc --noEmit` clean, all 45 `jest` tests green, and a live Playwright walk to the
    harbor: all 4 piers render as straight vertical wooden jetties with visible plank/post detail
    reaching from the quay into open water, no diagonal drift, boats and the Black Pearl's docked
    position still line up at the new tips.
92. 🔄 **Reverted the dock_pier sprite, back to the tiled wood-plank texture** (2026-08-14) — item
    91's single-stretched-image approach didn't work, per direct feedback: "I can still see a bit
    horizontal jetty. And why haven't you used the wooden board sprite tile we have in the assets?"
    Both point at the same root cause. `dock_pier.png` is one fixed illustrated scene — horizontal
    plank rows forming a small dock platform, mooring posts, a diagonal walkway, all baked into a
    single 180x145 composition, not a repeatable strip. Stretching that whole scene to fill each
    pier's tall, narrow vertical bounding box (item 91's `resizeMode="stretch"`) distorted its own
    horizontal/diagonal structure along with it — the platform's horizontal plank rows survived the
    stretch as a visibly horizontal chunk, which is exactly the "still see a bit horizontal jetty"
    artifact reported, even though the pier's actual line geometry was already correctly vertical.

    Reverted to the tiled `woodPattern` (`GROUND_TILES.wood` via SVG `<Pattern>`) the piers used
    before item 91 — the actual "wooden board sprite tile in the assets" the feedback was asking
    for, re-cut and verified seamless back in item 89. A tiled plank pattern is inherently
    orientation-agnostic (parallel planks read correctly whichever way the stroke runs), which is
    what an axis-aligned pier actually needs, unlike a single posed scene. Removed the item-91
    `<Image resizeMode="stretch">` render block entirely; piers are back to the two-stroke SVG line
    (wood-pattern deck + dark center seam) at their now-correctly-vertical coordinates from item 91,
    just with the deck stroke widened slightly (36, was 20) to read clearly at pier length.
    `WORLD_SPRITES.dockPier` stays exported/available (same "cut but not currently wired" pattern
    already used elsewhere in this doc) in case a future pass wants it as a fixed-size dock-platform
    prop rather than a stretched line-fill.

    Verified `npx tsc --noEmit` clean, all 45 `jest` tests green, and a live Playwright walk to the
    harbor: piers read as clean straight wooden boardwalks with real plank-seam texture, no
    distorted horizontal chunk anywhere along their length.
93. ✅ **Piers/jetties added to the minimap** (2026-08-14) — direct request: "Show the jetty and
    piers on the mini map." They were already filtered into every other `near*`/`SHOW_*`-gated
    category (streets, houses, buildings, lords, resource nodes, quest markers) but `PIERS` itself
    had no minimap entry at all, gated or not — a plain oversight, not a hidden-by-design case.
    Added `nearPiers` alongside the existing `nearStreets` (same `inView` bounds check, same
    `SHOW_STREETS` gate PIERS' main-map render already uses) and a matching `<Line>` render in the
    minimap `<Svg>`, positioned right after the street lines. Given a distinct warm brown
    (`#8a5a2b`) rather than either street color (tan `#d9cdb0` for 'main', darker tan `#a9825a` for
    'path') so a pier reads as its own wooden-jetty feature reaching off the coastline, not another
    road. Verified `npx tsc --noEmit` clean, all 45 `jest` tests green, and a live Playwright
    capture of the minimap near Tortuga's harbor: all 4 piers now show as short brown spurs poking
    out from the green coastline into the blue water, clearly distinct from the tan street network.
94. ✅ **Piers switched from a flat wood texture to a real repeatable dock module** (2026-08-14) —
    direct follow-up on item 92's revert: "What happened to the jetty's we designed? Not just lines
    sticking out the water?" Item 92's fix (a plain plank-pattern SVG stroke) solved the *distortion*
    complaint from item 91 but still read as a flat colored/textured band, not a built structure —
    genuinely just a wide line, which is exactly what got called out.

    Went back to `master_catalog_v1.png`'s "Docks & Harbour" panel looking for real jetty
    structure rather than a texture swatch, and found it draws one small dock module — 4 corner
    posts plus a woven-plank deck — stacked repeatedly in a column, confirming it's meant to tile
    end-to-end rather than sit as a single fixed scene the way `dock_pier.png` (item 91/92) does.
    Isolated one clean module by pixel-coordinate scanning and cropped it to a 56x64 PNG
    (`assets/sprites/world/pier_module.png`). Along the way, found this specific crop — unlike
    every other `GROUND_TILES`/`WORLD_SPRITES` cutout in this project, all of which get flattened
    to RGB — already carries genuine per-item alpha transparency baked into the source sheet: the
    posts/deck sit on nothing, confirmed by extracting and viewing the alpha channel directly (a
    clean module silhouette on a transparent background, not a soft vignette fade). That transparency
    is what makes the tiled result read as a structure and not a texture — the sea color shows
    through the real gaps between and around the posts once repeated, instead of a solid stroke.

    Wired it as a new SVG `<Pattern id="pierModulePattern" patternUnits="userSpaceOnUse" width={56}
    height={64}>` (same technique as `GROUND_TILES`' patterns, just with a structural module image
    instead of a flat texture) and pointed `PIERS`' render at it — one `<Line stroke="url(#pierModulePattern)"
    strokeWidth={56} strokeLinecap="square">` per pier, `strokeWidth` matched to the module's native
    pixel width so its posts aren't clipped at either edge. This replaces the item-92 two-stroke
    `woodPattern` render entirely; `woodPattern` itself is now unused (QUAYS was already on
    `cobblePattern`, not wood) and was removed from the `<Defs>` block rather than left as dead code.

    Verified with the same tiled-preview discipline used throughout this doc — composited the
    module over a simulated sea-blue background, both singly and stacked 3x, before touching any
    app code — then `npx tsc --noEmit` clean, all 45 `jest` tests green, and a live Playwright walk
    to the harbor: all 4 piers now show regularly-spaced corner posts and a plank deck down their
    full length, water visibly showing through the gaps between modules, ending in a clean square
    cross-braced tip — reads as an actual built jetty rather than a solid line, and the minimap's
    item-93 brown spurs are unaffected (that render never depended on `PIERS`' main-map stroke).
95. ✅ **Two piers given axis-aligned bends (T-head/L-head) instead of a single straight run**
    (2026-08-14) — direct follow-up: "The jetty's we designed were more than just one straight
    line. One wrapped around for example. Change the bits of the jetty that aren't horizontal or
    vertical to horizontal and vertical." Every pier since item 90's straightening pass had been a
    single vertical spur — the "wraps around" shape the reference sheets actually depict (a dock
    that turns a corner at its tip) had simply been dropped when the diagonals were straightened,
    never rebuilt as an axis-aligned bend.

    `harbor.ts`'s `PIERS` array has no notion of a multi-segment "pier" as one object — each entry
    is just an independent `PierSegment` line — so the simplest correct fix was to add more
    segments that share an endpoint with an existing spur, rather than invent a new data shape.
    Added a **T-head** on the west pier (docks-and-careening quarter): two new horizontal segments
    both starting at the spur's existing tip `(-146, -440)`, one running to `(-206, -440)`, the
    other to `(-86, -440)` — the dock turns a full corner in both directions, a real "wraps around"
    jetty. Added an **L-head** on the east pier (by the chapel): one new horizontal segment from its
    tip `(205, -439)` to `(265, -439)`, bending just one way so it doesn't crowd the neighboring
    pier's tip. Both middle piers (harbor admin core, tavern district) were left as single straight
    spurs — they sit close enough together that a head on either would visually collide with the
    other. Every new endpoint is still purely horizontal or vertical (no diagonal reintroduced) and
    was re-verified with the same point-in-polygon check against `TORTUGA_SHAPE` the straightening
    pass in item 90 used — all land outside the island, same invariant.

    One rendering wrinkle the bends surfaced: `pierModulePattern` tiles in fixed world-space
    coordinates (56 wide x 64 tall), not rotated to follow the stroke, so the old constant
    `strokeWidth={56}` (correct for a vertical spur, where 56 is the module's own width) would have
    clipped the top/bottom off every post on the new horizontal arms, where 64 (the module's
    height) is the dimension that actually needs to match the stroke's cross-section. `PIERS`'
    render now picks `strokeWidth` per segment (`y1 === y2 ? 64 : 56`) instead of a single constant.

    `islandAtPoint()`'s pier-walkability check (`islands.ts`) already iterates every entry in
    `PIERS` generically (`distToSegment` against each one), so the new head segments are walkable
    boardwalk with zero code changes there — confirmed live by literally walking into Captain
    Odessa Kane's forced duel at the west pier's tip while probing the new geometry, which only
    triggers standing right at the Black Pearl's dock. `DOCKED_BOATS`/`BLACK_PEARL_START_OFFSET`
    weren't touched (they anchor to the spurs' original tips, which are unchanged, not the new arms).

    Verified `npx tsc --noEmit` clean, all 45 `jest` tests green, and — since the in-game camera
    proved hard to walk to the exact tip for a live screenshot (the collision system doesn't slide
    along a diagonal quay edge, so several Playwright drag attempts stalled short of the bend) —
    an offline PIL composite of the T-head using the exact same `pier_module.png` asset and tiling
    math the SVG `<Pattern>` performs: a horizontal crossbar of regularly-spaced posts meeting a
    vertical spur at a right angle, water fully visible around and between every module, no seam or
    clipping at the joint. Same asset, same tile size, same per-orientation `strokeWidth` logic the
    shipped code uses — a faithful preview of the in-game result.
96. ✅ **Street junctions patched, 7 duplicate/degenerate segments removed, grass tiling
    de-repeated** (2026-08-14) — direct follow-up to a "look at the whole map" review: streets-only
    screenshots showed every point where a `'path'` crossed a `'main'` road cutting a hard
    rectangular gap with bare grass poking through at the corners, since `STREETS.map()` draws each
    segment as its own independent `<Line>` with no shared concept of an intersection —
    `strokeLinecap="square"` only extends a stroke past its own endpoint *along its own direction*,
    so it never covers the outer corner of a plain right-angle elbow either, not just a
    style-mismatched crossing.

    Added `streets.ts::STREET_JUNCTIONS` — every point where 2+ segments on an island share an
    endpoint (exact-match epsilon of 3, tight enough for the grid-snapped data to never falsely
    merge two separate corners), computed once at module load same as the existing
    `HOUSE_GARDEN_OFFSETS` pattern. `MapScreen.tsx`'s `STREETS` render now draws a small filled
    `<Circle>` at every one of these (`url(#cobblePattern)` r=12 if any touching segment is
    `'main'`, else `url(#dirtPattern)` r=9), after all the `<Line>`s so each patch sits on top and
    covers the seam — fixes every elbow and crossing at once, not just the style-mismatched ones.

    While tracking down exactly which points still looked wrong after that landed, found real data
    bugs instead of a rendering gap: **7 duplicate/degenerate `STREETS` entries** — one dead
    zero-length segment (`from` equal to `to`), and 6 pairs/triples of fully-overlapping duplicate
    lines (one pair a genuine `'main'`/`'path'` duplicate on the identical line, the rest same-style
    dupes, one segment tripled) — found with a from/to-order-independent key script and removed
    (234 → 227 segments), keeping `'main'` over `'path'` where the pair mismatched. None affect
    walkability (`isOnPath`/`islandAtPoint` only need distance to *a* segment, and a real one always
    remained), just dead weight in the data.

    The remaining bare-grass patches turned out not to be a bug at all once traced through the
    actual rendered SVG geometry (dumped and cross-referenced against screenshot pixels, not
    eyeballed): they're the ordinary interior of a city block — two parallel `'main'`/`'path'`
    streets one 24-unit grid cell apart, exactly as a real orthogonal grid town should look, just
    empty because `SHOW_BUILDINGS` is still off (see item 88). Confirmed by pairwise-scanning every
    near-parallel segment pair on the island (63 found, every one's combined half-width less than
    the 24-unit gap by design, not accident) — nothing to fix there; it'll read as intended the
    moment buildings come back.

    Also gave `grassPattern` a 2x2 mirrored super-tile (four placements of the same source image,
    alternating flipped via `transform="translate(...) scale(±1,±1)"`) instead of one 64x64 tile
    repeated directly — with only one real grass source image, a plain repeat reads as an obvious
    "wallpaper" once several tiles are visible together (the same blob motif recurring on a
    predictable grid, flagged in the same review). Doubles the effective repeat period to 128 units
    for free, no new art needed — swap back to a plain tile (or real variants) once the incoming
    terrain sheet lands.

    Verified `npx tsc --noEmit` clean, all 45 `jest` tests green, and a live Playwright check:
    dumped every rendered `<line>`/`<circle>` from the actual page DOM and cross-referenced specific
    screenshot pixels against world coordinates (not guessing from images) to confirm each junction
    patch lands exactly where a real corner needed one, and that the leftover green patches are
    block interiors, not seams — a T-junction that used to show a hard rectangular cut with grass
    corners now blends into one continuous paved circle with no gap anywhere.

97. ✅ **Master terrain sheet cut into 230 tiles/sprites, wired into worldSprites.ts**
    (2026-08-15) — the user supplied a purpose-generated 1536x1024 "master terrain sheet" (21
    labeled categories: ground basics, road/path/cobble autotile sets, water, cliffs, vegetation,
    small props) built from TERRAIN_BRIEF.md's request list, and asked for it cut into individual,
    cleanly-transparent game assets.

    First attempt used one uniform grid per panel (fixed pitch/cell-size, same technique as the
    earlier ship-sprite and building-icon cuts). That worked cleanly for the large, evenly-spaced
    ground/road/water panels but produced badly broken output for the small-prop panels (rocks,
    logs, stumps, flowers, mushrooms, vines, weeds, bushes) — wrong content, label-banner bleed,
    empty crops — because those panels were never actually on a uniform grid: the source sheet
    hand-places sprites of varying size at irregular spacing, so a rigid pitch just doesn't line up.
    The user caught this directly: *"A one set grid isn't lining up correctly with all the sprites.
    Do you think we need put a grid over each sprite individually... or is there a better way?"*

    Answer landed on a hybrid, not per-sprite manual placement: kept the uniform grid where it
    already worked (ground basics, grass variety, dirt/grass/cobble/road_worn path autotiles,
    beach/sea/wave tiles, grass-dirt-road transitions, corner transitions, cliff walls/top-edges,
    elevation ledges, stairs/ramps, trees), and re-cut the irregular small-prop panels with
    **connected-component detection on the chroma-keyed alpha mask** instead of a grid: crop a
    generous window around each category (verified against the actual sheet via the Read tool's
    image support, not blind pixel-math), threshold the alpha, label connected blobs
    (`scipy.ndimage.label`), and take each blob's own bounding box (with small padding) as the crop.
    Each sprite finds its own true extent automatically — the automated equivalent of centering a
    grid on each sprite, without hand-placing coordinates for the ~100 individual small props. A
    thin-sliver filter (min width/height + min pixel area) dropped spurious divider-line/text
    fragments the label banners left in the chroma-keyed mask.

    Result: 230 clean PNGs organized into `assets/sprites/{tiles,nature,props}/` and exported from
    `worldSprites.ts` as 11 new tables — `TERRAIN_TILES`, `PATH_TILES` (dirt/grass/cobble/road_worn,
    each `{straight, corner, tjunction, cross}` autotile arrays), `WATER_TILES`, `TRANSITION_TILES`,
    `CLIFF_TILES`, `ELEVATION_TILES`, `SPECIAL_GROUND_TILES`, `TREE_SPRITES`, `ROCK_SPRITES`,
    `PLANT_SPRITES` (log/stump/flowers/mushrooms/vines/weeds/the 27-sprite bush set), and
    `DECOR_PROPS`. A handful of items came out unrecoverable from the source sheet itself (label
    text baked across the full sample height of `rocky_ground`, and `wave_variations`/
    `cliffs_top_edges`' second rows) and were dropped rather than shipped wrong.

    Verified `npx tsc --noEmit` clean and every one of the 230 crops against a fresh contact-sheet
    (viewed directly via the Read tool, not inferred from coordinates). Not yet done: wiring these
    into `MapScreen.tsx`'s actual rendering (they're available as exports, nothing draws them yet)
    and building the autotile-selection logic for `PATH_TILES` — left for a follow-up pass, likely
    once the user's remaining sheets arrive so both land together.

98. ✅ **Grid-panel tiles re-cut from measured boundaries, not guessed pitch** (2026-08-15) —
    direct user pushback on item 97's delivery: *"you're missing parts of the sprite and cutting
    into another one because the lines aren't aligned to cut the tile... the layout of the sheet
    isn't compatible with the grid you have drawn."* Correct — the uniform-grid panels (ground
    basics, road/path/cobble autotile sets, water, transitions, cliffs, elevation) used an
    eyeballed pitch/cell-size per panel, close but not exact, so crop boundaries drifted from the
    sheet's real tile edges over many columns: some cells clipped a sliver of the neighboring
    tile, others clipped their own tile's edge short (`cliff_wall_2`, `cobble_corner`, and
    `trans_corner` all showed this in review).

    Fix: stopped guessing pitch and started measuring the sheet's actual tile boundaries per
    panel, in three tiers depending on what the art needed:
    - Flat/simple panels: column/row gap detection (a real inter-tile gap reads as background
      across a column's *entire* height) with a morphological closing pass added — a single dark
      shadow pixel inside a tile's own texture was getting mistaken for a tile boundary without it.
    - Busy autotile panels (dirt/grass paths, cobble, road, jungle ground, transitions): even with
      closing, high-contrast internal art still misfired against a fixed threshold. Switched to
      measuring only each row's two *outer* edges (against a long run of true background, far
      harder to fool than a 1-2px internal dip) and dividing that span evenly by the known column
      count — guarantees uniform cell width by construction, matching how the sheet was actually
      generated.
    - Row height itself was a separate bug: using a single narrow reference column to find a row's
      vertical extent broke when that column happened to land on a short/notched tile (e.g. an
      inner-corner transition) sharing a row with a full-square tile — it truncated the *whole
      row* to the short tile's height, clipping the taller ones beside it. Fixed by taking MAX
      across the full row width instead of one column.
    - `cliff_walls` turned out to be 3 tall wall faces in a single row, not 6 short ones as
      originally guessed — re-measured directly, and `worldSprites.ts`'s `CLIFF_TILES.wall`
      shrunk from 6 entries to 3 (stale `cliff_wall_4/5/6.png` deleted).
    - `trees` (organic, non-rectangular canopies) dropped the grid idea entirely in favor of
      per-tree windows with connected-component bbox tightening, same technique as the row D/E
      props in item 97.

    Verified with a purpose-built edge-continuity check: every row's re-cut tiles pasted flush
    with zero gap between them, confirming complete uncut content and no bleed into neighbors, not
    just "the count matched." All 142 changed sprite files re-copied into `assets/sprites/`,
    `npx tsc --noEmit` clean.

99. ✅ **Terrain sheet re-cut as individual objects, grid approach abandoned entirely**
    (2026-08-15) — after two rounds of grid-alignment fixes (item 98) still didn't hold up, the
    user cut it short: *"this method isn't working... just remove the background and use them as
    individual sprites we can place throughout the scene."* Right call — this sheet genuinely does
    not keep a uniform cell size even within one nominal "row" of what looked like an autotile
    set: corner/notch shapes, wider cross-junctions, and tapered edges all differ in size, so
    every pitch-based method (rigid grid, measured-outer-edge-divide, longest-stable-threshold
    auto-tune) kept finding a *new* way to misalign, because they all shared the same underlying
    assumption — a uniform cell — that this sheet doesn't honor.

    Replaced the grid with pure connected-component detection per panel region: find every real
    object by its alpha-cut boundary against the sheet's reliable near-black background, with no
    assumption about how many items a panel "should" contain or what shape family it belongs to.
    Where an object's own art naturally fragments into pieces under this scheme — cliff-wall
    stonework with dark mortar lines, dead-tree branches, tightly-packed transition corners with
    thin waists — group with a dilated copy of the mask first, but still measure and crop from the
    *real, undilated* pixels within each dilated group; this keeps genuinely separate neighboring
    tiles apart (dilation only has to bridge a tile's own internal gaps, not the real gap to its
    neighbor) while stopping one object's internal texture from splitting it into fragments.

    Result: 148 individually-detected, alpha-cut sprites replacing every prior grid-cut file for
    the ground/road/water/cliff/elevation/tree categories (rocks/bushes/decor/props from item 97
    were already individual-object style and untouched). `worldSprites.ts` restructured to match —
    `TERRAIN_TILES`, `PATH_DIRT_TILES`, `PATH_GRASS_BORDER_TILES`, `COBBLE_TILES`,
    `ROAD_WORN_TILES`, `JUNGLE_GROUND_TILES`, `BEACH_TILES`, `SEA_TILES`,
    `TRANSITION_GRASS_DIRT_ROAD_TILES`, `TRANSITION_CORNER_TILES`, `CLIFF_TOP_EDGE_TILES`,
    `CLIFF_WALL_TILES`, `ELEVATION_LEDGE_TILES`, `STAIRS_RAMP_TILES`, and `TREE_SPRITES` are now
    flat arrays of individually-cut sprites — a variety pool meant to be placed/scattered
    individually, not a `{straight, corner, tjunction, cross}` autotile system keyed by shape.

    Verified with contact sheets across every category plus targeted zoomed spot-checks on every
    category that had previously misaligned (cliff walls, transition corners, trees — which also
    turned out to be clipping their own per-column label text, a separate bug caught in the same
    pass and fixed by measuring the true label-to-content gap directly from the pixel data rather
    than reusing an assumed y-offset from a different panel). `npx tsc --noEmit` and all 45 `jest`
    tests clean.

100. ✅ **Hand-painted bitmap pirate glyph set cut and added** (2026-08-15) — user uploaded a
    reference sheet of a full hand-painted "pirate" character set (A-Z, a-z, 0-9, the standard
    ASCII punctuation set, plus two bonus decorative icons) on a black background with real,
    already-authentic alpha transparency. Cut with the same connected-component method as every
    other sheet (see item 99 and `assets/sprites/README.md`), against the sheet's real alpha
    channel directly rather than re-deriving one from a flat background color.

    Row-clustering by y-center worked cleanly for the 62 alphanumeric glyphs (verified against a
    contact sheet) but failed for the 38-component punctuation/symbol zone — those glyphs have
    deliberately different vertical extents and baselines by design (tall brackets, low-sitting
    commas, high carets), so there's no clean y-gap to cluster on. That zone was identified by
    hand against a gridded, numbered reference render of the source image instead, then verified
    against a final labeled contact sheet before shipping.

    96 named glyph files landed in the new `assets/fonts/bitmap_pirate/` folder (not
    `assets/sprites/` — it's a font-like asset despite being image-based, so it sits beside the
    two vector fonts instead), with its own README covering the naming convention and a full
    punctuation-to-filename table. Colon and semicolon are each shipped as one merged image
    spanning their two naturally-disconnected marks (dot+dot, dot+tail) rather than two separate
    files, since they're one character to place despite the real gap in the art. The two bonus
    icons (skull & crossbones, compass rose) were split out to `assets/sprites/ui/` instead, per
    the sprite library's own "categorize by what the object is, not where it was drawn" rule — not
    part of the character set. Not yet wired into any screen; per-character `<Image>` compositing
    (no kerning/spacing table built yet) is the eventual path, separate from the `expo-font`
    path used for the two vector fonts.

101. ✅ **Parchment/portrait Conversation Box, previewable — not yet wired into real dialogue**
    (2026-08-16) — user asked for a dialogue popup: parchment anchored to the bottom of the
    screen, the speaking character's portrait (torso-up) overlapping its top edge at whichever
    side they're on, text lettered onto the parchment, and the character's mouth flapping in sync
    with the words as they appear — "does this make sense, and can you make it look like he's lip
    syncing to the text." Confirmed the design and answered the lip-sync question honestly before
    building: there's no voice audio in this game, so it can't be phoneme-accurate lip sync — what
    it does instead is the classic visual-novel/Animal-Crossing trick, a text-driven mouth-flap
    that cycles a `talkFrames` frame range in step with the typewriter reveal (rest on
    spaces/punctuation, cycling open shapes while a word is mid-reveal). User confirmed: build the
    reusable component first (not wired into a real screen yet), and hold off on the actual
    mouth-movement art until they upload it rather than build against a placeholder.

    First real use of the two vector fonts added earlier this project (item 100's session) —
    `expo-font` installed and wired via a `useGameFonts()` hook (`useFonts` gating `App.tsx`'s
    first paint alongside `hasHydrated`), Pirata One for the speaker name, IM Fell English SC for
    the dialogue body. No parchment texture asset exists in the repo (the earlier parchment banner
    upload was only ever used for a font preview, never saved as an asset), so `ConversationBox`
    fakes the look with a warm gradient + a double inner border rather than guessing at one of many
    stale files in the shared uploads directory — swap `PARCHMENT_COLORS` for a real texture image
    whenever one is cut.

    `src/components/ConversationBox.tsx`: parchment pinned to the screen bottom, portrait
    (`portraitSource`) overlapping its top edge on the given `side`, character-by-character
    typewriter reveal, tap-to-fast-forward mid-line / tap-to-advance once fully revealed with a
    bouncing "▼" indicator, and the mouth-flap hook already wired to an optional `talkFrames` prop
    (frame 0 = rest, 1..n cycled while "talking") — passing nothing (today's state, using Scally's
    existing bust `portrait.png`) just renders a static portrait, no other behavior changes when
    real frames land. Previewable from the Debug screen's new "Conversation Box Preview" section
    (left/right portrait toggle, 3-line demo script proving reveal/fast-forward/advance) rather
    than wired into BuildingScreen's existing plain-text NPC dialogue yet — that's the next pass
    once the look is confirmed.

    Verified with a headless-Chromium Playwright run against the live web build (screenshot at
    each step: typewriter mid-reveal, full line with bounce indicator, tap-advance to line 2,
    portrait-right layout) plus `npx tsc --noEmit` and all 45 `jest` tests clean.

102. ✅ **Real per-letter lip sync wired in from Scally's actual mouth-shape sheet** (2026-08-16)
    — immediately following item 101, user sent the promised reference sheet: 29 full torso poses
    (same crossed-arms stance, arms don't move) organized in the sheet's own three sections —
    9 vowels (A E I O U OO EE AH OU), 11 consonant groups (B/M/P F/V TH L W/OO R S/Z SH/CH/J D/T/N
    K/G H/Y), 9 blends (BR DR TR PR KR GR CL GL SN) — with "let's separate these so we can use them
    first."

    Cut with the same per-row connected-component method as every other sheet (real alpha channel
    already present in the source, no chroma-key re-derivation needed) into
    `assets/sprites/scally/lipsync/` — the second subfolder in the whole sprite library (after
    `interiors/ship/`), earned because `scally/` had already crossed 60+ flat files and this is a
    clearly distinct, always-used-as-a-set group. Verified against a labeled contact sheet (all 29
    correctly ordered/named) and a zoomed mouth-only crop confirming the shapes actually read as
    distinct up close (closed lips on `consonant_bmp`, wide open on the vowels, pursed on
    `consonant_w_oo`, etc.) before wiring anything.

    This unlocked a real upgrade over item 101's generic mouth-flap: instead of just cycling
    frames while typing, `src/data/visemes.ts`'s `visemeForPosition()` looks up which of the 29
    frames matches the *actual letter* currently being revealed — two-letter digraphs/blends
    (`th`, `sh`, `ch`, `oo`, `ee`, `ou`, and the sheet's own `br/dr/tr/pr/kr/gr/cl/gl/sn` blends)
    checked first so both ticks of a 2-letter reveal land on the same correct shape, then a
    per-letter fallback table, with anything that isn't a real letter (space, punctuation, line
    ends) resting on `consonant_bmp` — the sheet's own closed-lips B/M/P frame, which doubles as
    the natural "not talking" pose since it's the same pose family as every talking frame (no
    scale/crop pop when resting). Not real phoneme detection (no dictionary, can't tell "read"
    past-tense from present-tense), but the same trick hand-timed 2D lip sync has always used —
    now driven by the typewriter reveal instead of an animator's ear.

    `ConversationBox`'s API changed from item 101's generic `talkFrames` array + interval-cycling
    to a `getTalkFrame(text, revealedIndex)` callback the caller controls — cleaner separation
    (the component knows nothing about visemes or Scally specifically; DebugScreen's demo wires
    `LIP_SYNC_FRAMES` + `visemeForPosition` together) and it also let the mouth-cycling `setState`
    interval be deleted entirely: the frame now updates in lockstep with the same `revealedCount`
    that drives the typewriter, no separate timer needed. Portrait size in the box tuned from the
    old bust proportions (140x168) to the new pose's real ~0.51 aspect ratio (118x198) so it
    doesn't letterbox.

    Verified with a headless-Chromium Playwright run capturing 6 screenshots in quick succession
    mid-line and cropping tightly to just the mouth — confirmed the shape genuinely alternates
    between open (vowel) and closed/narrow (consonant) frames as different letters are revealed,
    not just a static image. `npx tsc --noEmit` and all 45 `jest` tests clean.

103. ✅ **Real parchment texture cut and wired into ConversationBox** (2026-08-16) — user sent the
    actual torn-scroll banner art with "this is the parchment," replacing item 101's fake
    gradient-and-border stand-in.

    First real gotcha: the upload displayed with a checkerboard background in chat, which read as
    "already transparent" — but direct inspection showed the file itself was `mode: 'RGB'` with no
    alpha channel at all; the checkerboard was baked into the RGB pixels as actual near-white
    pixel data, not real transparency. (Same category of trap as this project's very first
    sprite-cutting lesson, just inverted — there it was a fake box that looked real; here it's fake
    transparency that displays real.) Verified directly rather than assumed, per that lesson.

    Chroma-keyed it out with a two-condition test — brightness AND desaturation, not just distance
    from one background color — because the source used a two-tone checkerboard, not a flat key
    color, so a single-color distance test wouldn't cover both tones. This also correctly avoided a
    second trap: the art's own near-black outline/crack strokes are *desaturated* the same way the
    checkerboard is (low saturation is what near-black and near-white have in common), so a
    saturation-only test would have keyed out the dark linework along with the background. Requiring
    *both* high brightness and low saturation fixed that — dark strokes have low brightness and
    survive. Verified against a real checkerboard composite (not a solid color) at multiple zoom
    levels, specifically checking the two intentional punch-holes in the scroll (fully enclosed
    within the parchment silhouette, not touching the canvas edge) render correctly transparent, not
    just the connected exterior background — confirmed clean on both after the fact, no separate
    flood-fill handling needed. Cropped tight to the art's own bounding box (the source canvas had a
    lot of empty space above the scroll) and saved as `assets/sprites/ui/ui_dialogue_parchment_1.png`
    — the sprite library's `ui/` folder's first real wire-up (`src/data/uiSprites.ts`), holding the
    "dialogue boxes" line in its own README row that had sat unwired since that folder was created.

    Wiring it into `ConversationBox` hit a real react-native-web bug: `ImageBackground` sized itself
    to the source PNG's *natural pixel width* (1485px) instead of stretching to fill its container,
    silently pushing the whole right portion of the art — including the wax-seal decoration — off
    past the edge of any screen narrower than that. Caught by inspecting the actual rendered `<img>`
    element's bounding rect via Playwright rather than guessing from a screenshot alone (a screenshot
    alone just showed "the seal isn't here," not why). Fixed by dropping `ImageBackground` for a
    plain `Image` — but the first fix attempt (`position:absolute` with all four sides pinned to 0)
    hit the *same* intrinsic-sizing bug again; what actually worked was explicit `width:'100%',
    height:'100%'` on the Image style. Re-verified the fix with the same DOM-rect check before
    trusting a screenshot again.

    `npx tsc --noEmit` and all 45 `jest` tests clean; both portrait-left and portrait-right layouts
    re-verified visually afterward, wax seal and both parchment edges now rendering correctly on a
    430px-wide viewport.

104. ✅ **Reference mockup composition matched: big overlapping portrait, name-plate, corner tab**
    (2026-08-16) — user sent a target mockup ("this is what we're aiming for... this layout") and
    asked what else was missing besides background art. Compared point-by-point against item 103's
    layout and closed every gap that wasn't the background:

    - **Portrait**: was a small floating card (118x198, inset 18px from the screen edge, ~27% of
      its own height overlapping the parchment). Rescaled to the mockup's proportions — flush
      against the screen edge (no inset) and overlapping ~45% of its height into the parchment —
      by upsizing to 175 wide (aspect-locked to the real lip-sync frames' native 129:251 ratio) and
      recomputing the overlap/wrapper math off that.
    - **Name-plate**: the mockup shows a proper wood-sign banner (skull icon + name, straddling
      the parchment's top edge) — previously just plain text inline at the top of the parchment.
      No reference art exists for this specific element, so it's coded: a `LinearGradient`
      pill with a dark border, straddling the parchment top edge the same way the portrait does,
      using the skull-and-crossbones icon already cut from the bitmap-glyph sheet (item 100) as its
      badge. Flagged to the user as a placeholder, same as the parchment gradient was before real
      parchment art arrived — swappable for real signage art later.
    - **Advance indicator**: moved from bottom-center to a small dark corner tab, matching the
      mockup's bottom-right placement — but nudged up off the very corner, since (unlike the
      mockup's plain concept parchment) the real cut parchment has its own wax-seal decoration
      sitting in exactly that corner; sitting the tab directly on top of it made both illegible.
    - **Paragraph spacing**: the mockup's dialogue has a blank-line gap between two sentences on
      the same page (not two separate advances) — already worked for free (`Text` respects literal
      `\n`), just hadn't been exercised; the Debug preview's demo script now includes the mockup's
      actual line as a two-paragraph example to prove it.

    Re-verified both portrait-left/right layouts visually against the mockup via the same
    Playwright screenshot loop as item 103. `npx tsc --noEmit` and all 45 `jest` tests clean.

    Only thing left unaddressed, by the user's own framing: the full background scene (harbor,
    ship, tavern, sky) — explicitly deferred, coming later.

105. ✅ **Portrait cropped at the waist to match the mockup's tight torso shot** (2026-08-16) —
    user pointed out the one remaining mismatch: the mockup's Scally is cut off partway down (a
    tight bust/torso close-up, cropped by the frame), while item 104's version showed the full
    standing figure, boots and all, just bigger and lower. "Adjust our version to match."

    Implemented as a real crop, not a smaller/differently-posed source image (the lip-sync frames
    are the only Scally art at this scale, and re-cutting them would lose the boots permanently) —
    the portrait renders at its true full-body height so the head/torso stay correctly
    proportioned, inside a shorter sibling `View` with `overflow: 'hidden'` that clips the legs off
    partway down. Crop line (66% of the frame's height) read off the source art's own proportions
    rather than guessed — the belt sits at roughly 60% down, so cropping a little past that keeps
    the coat's flare visible without reaching the boots, verified with a zoomed crop of the
    rendered result afterward (belt buckle right at the cut line, no boots showing).

    One real gotcha: `overflow: 'hidden'` and the portrait's drop shadow can't live on the same
    `View` — on native, overflow-hidden clips the shadow along with the content, since the shadow
    is drawn outside the view's own bounds. Split into two nested views — outer keeps the shadow
    (no overflow), inner adds the crop — so both survive.

    `npx tsc --noEmit` and all 45 `jest` tests clean; re-verified both portrait-left/right layouts
    visually, crop line landing cleanly at the belt on both.

    Immediate follow-up, same session: "move the cut off lower so can see more of him" — the 66%
    crop read too tight once seen live. Bumped `PORTRAIT_CROP_FRACTION` to 0.85 (same clipping
    mechanism, just a taller visible slot) — now shows the coat's full flare and upper legs,
    cutting just above the boot tops instead of right at the belt. Re-verified both sides again;
    `npx tsc --noEmit` and all 45 `jest` tests still clean. Also: "move Scally down a little bit" —
    bumped `PORTRAIT_OVERLAP` from 45% to 55% of the portrait height so the whole portrait sits
    lower (the wrapper auto-sizes around it, so this shifts the top edge down too, not just the
    bottom).

106. ✅ **Real wood-signboard art + matching carved-bone bitmap font for the name-plate** (2026-08-16)
    — user sent the promised name-plate art: a blank riveted wood board, and a reference sheet
    pairing it with a "CAPTAIN SCALLY" example plus the full carved-bone bitmap font that renders
    it (uppercase A-Z, digits, and ! ? . , : ; ' " ( ) [ ] - _ / &) — replacing item 104's coded
    LinearGradient-and-Pirata-One placeholder with the real thing.

    Same chroma-key trap as the parchment (item 103) and hit again without re-deriving the fix from
    scratch: both source PNGs were flat RGB with the checkerboard baked into the pixels, not real
    alpha — verified directly, keyed out with the same brightness+desaturation two-condition test.

    Cut with the same per-row connected-component method as every bitmap alphabet sheet in this
    repo: 52 glyphs into `assets/fonts/bitmap_nameplate/`, the board cropped to its own bounding box
    into `assets/sprites/ui/ui_nameplate_board_1.png`. One new wrinkle handled the same way as the
    bitmap_pirate alphabet's colon/semicolon: this sheet's semicolon also split into two raw
    components (dot + tail) that a blind dilation-based count-match doesn't reliably separate from
    a coincidentally-correct total, so it's merged by explicit index rather than asserted by count.
    Verified against a labeled contact sheet before wiring anything in.

    `src/data/bitmapNameplateFont.ts` maps each character to its glyph and its own measured aspect
    ratio (letters aren't monospace — "I" and "M" are very different widths) so a name lays out like
    real type, not a slot machine; uppercases automatically since no lowercase forms exist.
    `ConversationBox`'s name-plate is now a content-sized box (icon + glyph row width, not a fixed
    size) with the board art stretched to fit — same "explicit width/height, not ImageBackground"
    fix as the parchment.

    One real layout bug caught before shipping: at full glyph size, "CAPTAIN SCALLY" ran off the
    right edge of the screen entirely — the portrait had grown much wider since the plate's sizing
    was last tuned (items 104-105), and nobody had re-checked the plate against that width budget.
    Fixed with a shrink-to-fit: `useWindowDimensions()` measures what's actually left beside the
    portrait, and the glyph height (plus everything derived from it — letter gaps, space width, icon
    size) scales down together if the name would overflow, floored at 50% scale so it never goes
    illegibly small. Re-verified both portrait-left/right layouts visually, full name now fits
    cleanly on a 430px-wide viewport. `npx tsc --noEmit` and all 45 `jest` tests clean.

107. ✅ **Read-along word highlight, synced with the lip-sync reveal** (2026-08-16) — user asked how
    to make it visually obvious which word Scally is "reading" as the mouth animates, floating a
    background-color-behind-the-active-word idea themselves and asking whether there was a better
    way. Answered honestly (this is the standard karaoke/read-along-app trick — Duolingo Stories
    does the same thing) and offered a choice on the actual open design question, which was style
    rather than mechanism: a hard-edged digital selection box would read as a UI element pasted onto
    the parchment, so the options were a soft translucent "highlighter pen over old paper" tint, a
    solid box, no background at all (just darker/bolder ink), or an underline/caret. User picked the
    soft highlighter tint.

    `activeWordSpan()` in `ConversationBox.tsx` finds whichever word contains the
    most-recently-revealed character (same idea as `visemes.ts`'s per-character viseme lookup, one
    level up — word-grained instead of letter-grained) and splits the revealed text into a plain
    "before" portion and a highlighted "active word" portion, rendered as nested `Text` with a
    `rgba(214, 158, 46, 0.4)` translucent amber background — just the active word tinted, nothing
    else about the text changes. Returns null (no highlight) the instant the space/punctuation after
    a word reveals, matching the mouth's own rest state on those same characters, so the highlight
    and the mouth go idle in lockstep even though they're two independently-computed systems reading
    the same `revealedCount`.

    Verified by capturing 10 screenshots at 150ms intervals through a live reveal (a single "final"
    screenshot can't show a transient per-word effect) — confirmed the tint genuinely walks
    word-to-word ("here" -> "smell" -> "might", etc.) rather than staying static or drifting out of
    sync, and clears cleanly once the line finishes on a period. `npx tsc --noEmit` and all 45
    `jest` tests clean.

108. ✅ **Read-along highlight: swapped the solid tint for an outline glow** (2026-08-16) — direct
    follow-up: user tried the shipped highlighter tint and asked for "just the outline of the word
    like a glow behind rather than a big bulky block behind it." Straightforward style swap in
    principle — `activeWordSpan()` and its wiring didn't change at all, only `styles.activeWord` —
    but getting a glow to actually render turned into a real debugging chase.

    First attempt used React Native's standard `textShadowColor`/`textShadowOffset`/
    `textShadowRadius` trio (the documented-correct RN API for exactly this). `getComputedStyle()`
    confirmed the CSS `text-shadow` was genuinely present and correctly cascaded on the live DOM
    span — and it still didn't render. Not "too subtle": even a maxed-out debug value (40px radius,
    fully-opaque cyan, `!important` inline style) painted nothing, in both headless and headed
    (xvfb) Chromium alike, on a fully static replay page with the animation stopped. Bisecting by
    swapping pieces in and out of an isolated test page traced it to one specific combination: our
    custom carved-bone display webfont (`assets/fonts/IMFellEnglishSC-Regular.ttf`, wired in
    `useGameFonts.ts`) plus `text-shadow`. Swap in a generic system serif and the identical shadow
    renders perfectly; keep the custom font and it silently fails — the shadow's blur region is
    computed from the font's glyph ink-overflow box, and this hand-built font reports bad-enough
    metrics for that box that the blurred glow paints as a faint blob well off to the side of the
    actual letters, invisible in a normal screenshot. A real font-metrics bug, not a headless quirk,
    a timing issue, or a contrast problem (all three were suspected and ruled out in turn first).

    Fix: `-webkit-text-stroke` instead. It strokes the real glyph outline rather than a computed
    ink-overflow box, so the bad font metrics don't touch it — confirmed rendering cleanly with the
    same custom font in the same isolated test. `paint-order: stroke fill` draws the amber stroke
    first so it reads as a glow sitting behind crisp dark letters rather than a bulky block, per the
    original ask. Web-only (`Platform.OS === 'web'`, since RN has no native stroke style prop);
    native iOS/Android keep the standard RN `textShadow*` trio as a fallback, since nothing here
    suggests that one is broken anywhere except web + this specific webfont.

    Re-verified the same way as item 107 (screenshots across a live reveal) plus a tight zoomed crop
    to confirm the outline itself looks right up close — clean amber outline glow, walks word-to-word
    correctly, no regressions to the mouth-sync or the reveal timing. `npx tsc --noEmit` and all 45
    `jest` tests clean.

109. ✅ **"Ember Stroke" — the read-along glow's final form** (2026-08-16) — user liked item 108's
    outline glow and asked for ideas to push it further. Rather than guess, pitched four independent
    refinements (two-tone stroke, torchlight flicker, softened edge, reveal-synced flash) and built
    all four as live, actually-animating CSS demos plus a 5th "all combined" version, published as an
    artifact so the user could see real motion rather than static mockups. User picked #5 and asked
    for it wired into the real component as-is.

    New `EmberWord` component replaces the single-style `styles.activeWord` on web (native keeps the
    plain `textShadow*` fallback from item 108 unchanged — none of these four ingredients have a
    native equivalent). Each letter of the active word renders as three stacked `Text` layers sharing
    one `position: relative` box: a wider dark-rust `-webkit-text-stroke` layer, a thinner amber one
    on top of that (both with a touch of `filter: blur()`), and the plain ink fill on top of both —
    same "stroke/blur the real glyph, not a computed shadow box" principle as item 108, extended to
    two stroke layers instead of one, which is what makes the glow read as it has depth instead of a
    flat line.

    The flash-then-flicker motion is RN's `Animated` API, not CSS `@keyframes` — one `Animated.Value`
    per letter position, driving only the amber layer's opacity through a fixed
    `Animated.sequence`: quick flash to full brightness, settle, then an `Animated.loop` gently
    breathing between two opacity levels for as long as that letter stays part of the active word.
    Matches the pattern already used for the advance-indicator bounce elsewhere in this file, so the
    whole component now animates through one consistent API rather than mixing in raw CSS keyframes
    on web only. `EmberWord` is remounted (via `key={activeSpan.before}`, a string that's different
    for every word occurrence) each time the active word changes, so every new word's letters always
    start their animation fresh rather than inheriting stale state from the previous word.

    First real-app screenshot came out with the amber/rust strokes almost entirely swallowing the ink
    fill instead of rimming it — the stroke widths ported over from the artifact's 54px demo font
    were proportionally far too thick for the dialogue box's actual 17px text, wide enough that the
    two strokes met in the middle of each thin serif letterform. Fixed by scaling the stroke widths
    down to match the font size actually in use (outer 1.3px, inner 0.6px) rather than the demo's
    absolute pixel values.

    Verified in the real running component (not the artifact): screenshots across a live reveal
    confirm the two-tone glow renders correctly on real words, a pixel diff between two consecutive
    frames on the same word confirms the flicker is genuinely animating (not a static screenshot),
    and the browser console stayed clean throughout. `npx tsc --noEmit` and all 45 `jest` tests clean.

110. ✅ **First real background art for ConversationBox — Tortuga's tavern at dusk** (2026-08-16) —
    user sent a portrait-oriented harbour/tavern illustration and asked to add it as the backdrop,
    fulfilling the "I'll provide a load of background artwork later" note from the very first
    ConversationBox mockup back in item 104. A complete standalone scene, not a sheet to cut, so it
    introduces a genuinely new asset category rather than another sprite: `assets/backgrounds/`, a
    sibling to `assets/sprites/` for whole-scene art meant to be used exactly as delivered — see the
    new note at the top of `assets/sprites/README.md` pointing to it. Wired from a new
    `src/data/sceneBackgrounds.ts` (first entry: `SCENE_TORTUGA_TAVERN_DUSK`), matching the
    one-file-per-category pattern `uiSprites.ts` already established.

    Wired into the Debug screen's "Conversation Box Preview" specifically (not ConversationBox
    itself — the component stays a reusable overlay with no opinion about what's behind it; the
    background belongs to whatever screen hosts it, which for now is just this preview). Real bug
    caught during verification: wrapping the backdrop `Image` and `ConversationBox` together in a
    full-screen `View` blocked every debug button underneath it, including the very button used to
    relaunch the preview — a full-screen decorative wrapper has to be `pointerEvents="box-none"` so
    only its actual interactive subview (ConversationBox's own `Pressable`) still catches touches.
    That alone wasn't enough: RN Web's `Image` renders its own inner `<img>` with an explicit
    `pointer-events: auto` that does not inherit the parent's box-none `none` — verified directly via
    `getComputedStyle` on the live DOM, confirming the `<img>` really was the one re-blocking clicks
    despite its ancestor being correctly set. Fixed by setting `pointerEvents: 'none'` directly in
    the image's own style object (a style field, not the unsupported top-level `Image` prop TypeScript
    rejected first) rather than relying on inheritance.

    Verified both `side="left"` and `side="right"` render cleanly against the real scene (separate
    fresh page loads per side, after an initial combined test surfaced a second, unrelated finding:
    clicking "Show (portrait right)" while "Show (portrait left)"'s box was still open can fail
    because the still-open box legitimately covers that button on screen — a pre-existing debug-panel
    interaction quirk, not something this change introduced, so each side was verified independently
    instead). Zero console errors on either. `npx tsc --noEmit` and all 45 `jest` tests clean.

111. ✅ **Lifted ConversationBox clear of the screen's bottom edge** (2026-08-16) — with real
    background art behind it now (item 110), the parchment sitting flush against the very bottom
    edge read as cropped rather than intentional. One new `WRAPPER_BOTTOM_OFFSET = 20` constant on
    `styles.wrapper`'s `bottom` (was a hard `0`) — parchment, portrait, and name-plate are all
    positioned relative to `wrapper`, not the screen, so the whole assembly lifts together as one
    unit with a single number. Verified both portrait sides in the real running app against the
    tavern backdrop — a clear strip of ground now shows below the parchment. `npx tsc --noEmit` and
    all 45 `jest` tests clean.

112. ✅ **Portrait now flush with the parchment's bottom edge** (2026-08-16) — direct follow-up:
    Scally's leg crop was floating well above the bottom of the paper (the old `PORTRAIT_OVERLAP`
    math sat his crop slot's bottom edge `PARCHMENT_HEIGHT - PORTRAIT_OVERLAP` px above the
    parchment's own bottom), and the user asked for the cutoff to land right at the bottom of the
    box instead. `portraitSlot.bottom` changed from that offset to a flat `0` — same baseline as
    `parchment` itself, both children of `wrapper` — so the crop line now touches the paper's edge
    exactly. `PORTRAIT_OVERLAP` no longer has any use once both elements share a baseline, so it's
    gone entirely rather than left dead; `wrapper`'s height is now `Math.max(PARCHMENT_HEIGHT,
    PORTRAIT_HEIGHT)`, whichever of the two is actually taller, instead of a formula built around the
    old overlap value. Verified both portrait sides in the real app against the tavern backdrop —
    the boot-cutoff line sits exactly on the parchment's bottom edge on both. `npx tsc --noEmit` and
    all 45 `jest` tests clean.

113. ✅ **Portrait past the parchment's edge, whole box raised further** (2026-08-16) — item 112's
    flat `bottom: 0` was, per user feedback, "still not quite flush" — a `getBoundingClientRect`-true
    match apparently doesn't read as *touching* the way a few px of genuine overlap does. New
    `PORTRAIT_BOTTOM_NUDGE = 10` constant; `portraitSlot.bottom` is now `-PORTRAIT_BOTTOM_NUDGE`
    rather than a flat `0`, sinking the boots slightly past the parchment's own bottom edge instead
    of stopping exactly on it. Separately, `WRAPPER_BOTTOM_OFFSET` (item 111) doubled from `20` to
    `40` — "move the box and him higher again." Verified both portrait sides in the real app against
    the tavern backdrop, with a tight crop on the boot area confirming the torn-paper edge now sits
    visibly above the boots (planted on the ground below) rather than level with them. `npx tsc
    --noEmit` and all 45 `jest` tests clean.

114. ✅ **Back to flush — boots level with the paper, not past it** (2026-08-16) — item 113's sink
    past the edge wasn't what was wanted after all; asked to move him back up so his bottom lands
    level with the bottom of the paper. `PORTRAIT_BOTTOM_NUDGE` removed entirely and
    `portraitSlot.bottom` is a flat `0` again — the same state item 112 first landed on, this time
    confirmed as the actual target rather than a stepping stone. `WRAPPER_BOTTOM_OFFSET` (item 111,
    raised to 40 in item 113) is untouched — this round was leg position only. Verified both portrait
    sides in the real app; a tight crop on the boot area confirms the torn-paper edge and boot
    bottoms now sit on the same line. `npx tsc --noEmit` and all 45 `jest` tests clean.

115. ✅ **Raised the portrait again — flush still read as not level** (2026-08-16) — item 114's flat
    `bottom: 0` still wasn't right per user feedback ("It's not level. Raise him up more").
    `portraitSlot.bottom` moved to `12` (up from `0`). Verified both portrait sides in the real app
    against the tavern backdrop; sent for review rather than second-guessed against my own read of
    the previous crop, since this is a by-eye call the user is iterating on directly. `npx tsc
    --noEmit` and all 45 `jest` tests clean.

116. ✅ **Real video demo, then slowed the typing speed** (2026-08-16) — user asked to see the box
    actually playing the script rather than another screenshot sequence. Static screenshots can't
    show a typewriter animation, so this used Playwright's real video recording (`recordVideo` on
    the browser context, not screenshots-in-a-loop) to capture genuine footage of a full reveal —
    mouth shapes changing, the ember glow tracking word-to-word, the advance-indicator bounce at the
    end. First export was `.webm` (Playwright's native format), which the user's client couldn't open
    inline; re-encoded to `.mp4` with OpenCV (already available; no `ffmpeg` binary on this box) for
    a format that opens directly. Watched it and asked for the pace to slow down —
    `DEFAULT_TYPING_SPEED_MS` in `ConversationBox.tsx` raised from `26` to `38`. Re-recorded and
    re-sent at the new pace. `npx tsc --noEmit` and all 45 `jest` tests clean.

117. ✅ **Decoupled mouth-frame cadence from the character-reveal rate** (2026-08-16) — user asked
    whether the mouth movements were actually synced to the words, and separately said the mouth
    still looked "quick" and "not smooth." Verified sync first rather than assuming: a Playwright
    script polled the live DOM every 20ms, logging the revealed text and the portrait `<img>`'s frame
    filename together — confirmed `visemeForPosition()` fires the exact right viseme on every single
    revealed character, including correctly *not* changing the visible frame when consecutive letters
    share a viseme (e.g. "c" then "k" both map to `consonant_kg`). So the sync was already exact; the
    "not smooth" complaint was a separate cadence problem — the mouth frame was updating on every
    character (every `typingSpeedMs` = 38ms), several times faster than real speech ever changes
    mouth shape (a syllable holds for more like 150-200ms), which reads as flicker rather than
    talking. Fixed by decoupling the two rates: a new `MOUTH_TICK_MS = 160` constant drives its own
    `setInterval` that samples the latest reveal position via a `revealedCountRef` (kept current by a
    separate effect, so the mouth-tick interval itself doesn't need to restart every character — only
    when the line changes or talking starts/stops); the text reveal keeps running on its own 38ms
    timer, untouched. Render now reads from the resulting `mouthFrame` state instead of calling
    `getTalkFrame` directly inline. Re-ran the same DOM-polling approach afterward to confirm the
    fix: mouth-frame changes now land ~120-160ms apart (quantized against the 20ms poll) while the
    revealed-text length keeps climbing every poll at the original pace — the two rates are now
    independent, as intended. `npx tsc --noEmit` and all 45 `jest` tests clean.

118. ✅ **"Are we using all of the face animations?" — audited, then wired up everything that had a
    real trigger** (2026-08-16) — the question turned up two separate systems, not one. Lip-sync: 28
    of 29 cut mouth frames were reachable from real text; `vowel_ah` was cut but nothing in
    `visemes.ts` ever pointed to it. Fixed with one new digraph, `ar` -> `vowel_ah` (as in "Arrr",
    "harbor", "starboard" — the open-mouth shape a plain short `a` doesn't cover). Expression faces
    (`SCALLY_FACES`, 6 total): only 2 were wired (the heat-tier mood badge). The user then asked to
    wire up everything "as realistic as possible," including the emotes/idle-breathing/run-cycle/
    attack-pose system that item 83 (2026-08-14) had fully reverted after three failed attempts at a
    walk-cycle "hopping" bug — so this pass fixed the actual root causes those revert notes had
    already diagnosed, rather than repeating the same swap a fourth time:
    - **isMoving debounce (the real prerequisite).** The pan gesture's `onUpdate` used to flip
      `isMoving` the instant drag distance crossed `DEADZONE` (12px) in either direction, with no
      margin — a slow drag or hand tremor hovering right at that line could flip it several times a
      second, which is what made every previous idle-pose/emote attempt pop. Added a second, lower
      `STOP_DEADZONE` (4px): entering "moving" is unchanged (still fires exactly at `DEADZONE`, so
      real movement itself never got slower or laggier), but *leaving* moving now only fires once
      distance drops below `STOP_DEADZONE` — a value oscillating in the 4-12px gap no longer toggles
      the animation flag at all.
    - **Idle breathing** (`IDLE_SOURCES`, 3 frames) now cycles for real on its own slower ~450ms
      interval once `isMoving` is stable, instead of holding walk-frame 0. `scallySpriteSource`
      gained a fourth `idleFrameIndex` param for this (defaults to 0, so every other caller is
      unaffected).
    - **Emotes**: wave fires on `nearbyBuildingPrompt` appearing (door greeting), victory fires on
      `defeatedLordIds`/`completedQuestIds` growing, and the 4-pose idle-flourish pool fires once
      after 5s stationary — all gated on `!isMoving`, and an extra effect force-clears any showing
      emote the instant movement resumes, so an emote can never freeze a stride even if a trigger's
      own gate is somehow stale.
    - **Run cycle**: reuses the walk cycle's own frame counter directly (`RUN_FRAME_COUNT ===
      WALK_FRAME_COUNT === 5`) so a heat-triggered swap always lands on the matching stride position
      instead of resetting to frame 0, and dampens `walkBounce`'s amplitude (-6px -> -3px) while
      running, since the run pose's own bigger stride was compounding with the full bounce to read
      as a pop (the specific bug the original run-cycle revert note described).
    - **Attack/sword-ready flash**: the on-foot equivalent of the ship's Stop/Skid flash, now flashes
      on a forced (not-boarded) fight in `startEncounter`'s `else` branch. Never actually implicated
      in the hop bug — item 83's revert removed it only as cleanup alongside the render it briefly
      overrode, not because it caused anything.
    - **Faces**: extended the mood badge to a full range instead of `null` below 25% heat —
      `FACE_NEUTRAL` fills that gap, `FACE_WINK` (the sixth face, previously cut but nameless) gives
      an occasional idle blink at heat=0 reusing Cheeky the monkey's already-shipped wink mechanism,
      and `FACE_HAPPY`/`FACE_LAUGH` flash transiently on the same quest-complete/lord-defeat triggers
      as the victory emote.
    - **Left honestly unwired**: `POSE_CHEER_FIST`/`POSE_POINT` and Cheeky's climb/hang/sleep extras
      still have no real one-off story moment to attach to (the two nearest candidates — lord-fort
      and side-quest markers — navigate away the instant you're in range, leaving no on-map moment
      to show a pose in) — forcing a generic trigger in would be a scope decision disguised as an
      asset swap, same reasoning that already left `ICON_QUESTION` unwired.

    Verified in the real running app via Playwright rather than by inspection alone: a sustained
    drag showed a genuine 5-frame alternating walk cycle (not the old "one leg" repeat bug); a
    simulated hand-tremor wobble held on a single idle-breathing frame family the whole time, no
    idle/walk flicker; heat=90 correctly showed `face_2` (HURT) and a clean 5-frame run cycle while
    moving sideways; heat=0 defaulted to `face_0` (NEUTRAL) and a real wink (`face_3`) fired and
    reverted on schedule; the idle flourish fired once after ~5s stationary and held for its full
    duration before returning to breathing. `npx tsc --noEmit` and all 45 `jest` tests clean.

119. ✅ **Cut the "Talking Expressions" sheet — 20 new full-body poses, not yet wired anywhere**
    (2026-08-16) — the user supplied a new reference sheet as a library addition, not a specific
    request. Cut with the same connected-component method as every other sheet (near-white
    background this time, not near-black — the method adapts to whatever the sheet's actual bg
    color is, chroma-key threshold aside): 2 rows of 10 components each, exact count match, clean
    even spacing, no merges. New `scally/talk_expressions/` subfolder (third one to earn it, same
    bar as `scally/lipsync/`: a clearly distinct, always-browsed-as-a-set group). Wired as a typed
    `TALK_EXPRESSIONS` export in `scallySprites.ts`, but deliberately **not** wired into any actual
    game moment yet — these share `LIP_SYNC_FRAMES`' crossed-arms crop/scale but vary the *face*,
    while the lip-sync set's 29 mouth shapes were all drawn against one fixed expression. There's no
    "angry" version of each mouth shape, so these can't drive ConversationBox's active-typing mouth
    animation the way LIP_SYNC_FRAMES does — using one mid-word would just hold one closed-mouth
    face for the whole line, not talk. Real candidates (a per-line REST/mood pose before/after
    typing, or a reaction pose on a different screen entirely) are a real product decision with more
    than one honest answer, not something to guess at silently — asked the user which they want
    before building either. `npx tsc --noEmit` and all 45 `jest` tests clean.

120. ✅ **Wired the rest-pose half of item 119's question — battle reactions and story beats stayed
    unbuilt, for reasons that predate this session** (2026-08-16) — user picked all four options
    (rest pose, battle reactions, story beat, undecided), which reads less like "build three
    features" than "these are all reasonable, pick what's actually buildable now." Built the one
    with a real, already-proven mechanism and no open design question:
    - **ConversationBox REST pose.** `DEMO_SCRIPT` in `DebugScreen.tsx` is now `{ text,
      restExpression }[]` instead of plain strings; `restExpression` picks a `TALK_EXPRESSIONS` frame
      shown before typing starts and after the line finishes (the neutral lip-sync mouth animation
      still owns the talking beat itself, per item 119's constraint). `ConversationBox` itself needed
      zero changes — `portraitSource` was always just a generic `ImageSourcePropType`, so any frame
      from the same crop/scale family works. Assigned: `curious` (the Blackbeard/Cheeky line),
      `happy` (the "watch me mouth move" intro), `confident` (the fast-forward tip), `neutral` (the
      last line). Verified live: portrait shows `curious` immediately on open, swaps to the ordinary
      neutral lip-sync frames the instant typing starts, and returns to `curious` once the line's
      fully revealed — confirmed via the DOM image-src poll, and visually via before/after
      screenshots (no crop/scale seam between the two sprite sets, they compose cleanly).
    - **Battle reactions: left unbuilt, and not just for lack of time.** Item 79 already looked at
      this exact idea (an expression tied to battle outcomes) and rejected it on purpose: Scally
      isn't the one fighting in `EncounterScreen` — whichever crew member is active is — so pinning
      his expression to a duel he isn't visually in would misrepresent the actual fighter. That's why
      the *existing* heat-tier face badge lives on the map header instead, reflecting state MapScreen
      actually has. Nothing about the new sheet changes that reasoning; building it now would
      re-introduce the same problem item 79 deliberately avoided.
    - **Story beat pose: left unbuilt, no reachable trigger yet.** No cutscene/story-beat system
      exists to hook a one-off expression into — `ConversationBox` is the only dialogue surface today
      (still Debug-preview-only), and the map/quest flow doesn't have a moment that isn't already
      just a state change with its own established reaction (toast text, badge flash). Worth
      revisiting once/if a real story-beat moment exists to attach it to.

    `npx tsc --noEmit` and all 45 `jest` tests clean.

121. ✅ **Wrote `CONVERSATION_BACKGROUNDS_BRIEF.md` — 30 background scenes for ConversationBox, ready
    to hand to an image generator** (2026-08-16) — same purpose `ART_BRIEF.md` served for the sprite
    pass (item 151), applied to this new asset category. Every scene is a real place already in the
    game data, not invented setting: one harbor/tavern/landmark trio for Tortuga Cove, a
    harbor+interior+Pirate-Lord-lair set for each of the other 6 islands (pulling the lord's actual
    name/title/specialty/flavor text straight from `pirateLords.ts` so each lair looks like *that*
    lord's, not a generic fort), 3 Black Pearl/open-sea scenes, and 5 named landmarks/wilderness
    scenes. Opens with a reusable style-guide paragraph (art direction, the 853×1844 portrait
    canvas, and — the one easy detail to miss — a composition rule keeping the bottom 35-40% of the
    canvas simple, since that's where the parchment/portrait overlay sits in the real UI) meant to
    be pasted once and reused ahead of each of the 30 scene-specific prompts.

122. ✅ **First delivery from the background brief: `tortuga_market_day_1`, wired and verified**
    (2026-08-16) — matched the brief's 853×1844 canvas exactly, no resize needed. Saved to
    `assets/backgrounds/`, exported as `SCENE_TORTUGA_MARKET_DAY` from `sceneBackgrounds.ts`, and
    added a second "BG:" toggle row to the Debug screen's Conversation Box Preview (alongside the
    existing tavern-dusk one) so any future delivery can be previewed the same way without more
    plumbing than picking which constant a button sets. One deviation from the brief worth flagging
    honestly: the composition rule asked for the bottom 35-40% to stay simple, and this piece has a
    fruit cart, barrels, and crates well into that band instead. Checked it in the real running app
    rather than assuming it's a problem — the parchment box is opaque and sits fully on top of that
    detail, so it reads perfectly clean in practice; not sending it back. `npx tsc --noEmit` and all
    45 `jest` tests clean.

123. ✅ **Scene #2 delivered as two versions — picked legibility over an exact canvas match, cropped
    to fix it** (2026-08-16) — `tortuga_tavern_night_1` (The Salty Parrot's front door at night)
    came back twice: one at the exact 853x1844 target canvas, but with garbled AI-generated sign
    text ("the The — SALTY PARROT — The TAVERN" — a real, ship-blocking flaw on a building whose
    entire identity is that sign); the other with clean, correct "THE SALTY PARROT" lettering and
    better overall composition, but a wider 941x1672 (0.56) source aspect than the 0.46 target.
    Rather than ask for a third regeneration, cropped the clean one down to 773x1672 (0.4623 —
    effectively identical to the target ratio) with an asymmetric trim (67px off the left, 101px off
    the right) chosen by eye to cut the least essential content — a sliver of distant building on the
    left survives whole, a bit of background barrel/crate on the right got trimmed, and the sign,
    doorway, and windows that actually carry the scene are untouched. Wired as
    `SCENE_TORTUGA_TAVERN_NIGHT`, third "BG:" toggle added to the Debug preview. Verified live: sign
    fully legible, composites cleanly with the parchment box on the right-side layout, no stretch or
    distortion visible. `npx tsc --noEmit` and all 45 `jest` tests clean.

124. ✅ **Scene #3 delivered clean on the first try: `tortuga_gaol_interior_1`** (2026-08-16) — the
    jail cell interior, matching the brief's 853x1844 canvas almost exactly (853x1843) with no text
    to garble and a naturally dark, simple lower half that satisfies the composition rule without
    needing a call either way. Wired as `SCENE_TORTUGA_GAOL_INTERIOR`, fourth "BG:" toggle added.
    Verified live — moody and tense, parchment box stays fully legible against the dark stone.
    `npx tsc --noEmit` and all 45 `jest` tests clean.

125. ✅ **Scene #4 delivered clean: `tortuga_old_landing_dusk_1`** (2026-08-16) — the Ruins of the
    Old Landing, a collapsed dock being reclaimed by jungle. Exact 853x1844 canvas match, no text,
    naturally simple dirt-path lower half. Wired as `SCENE_TORTUGA_OLD_LANDING`, fifth "BG:" toggle
    added. Verified live — composites cleanly on both portrait sides. `npx tsc --noEmit` and all 45
    `jest` tests clean.

126. ✅ **Cow Island's first two scenes: `cow_island_beach_camp_1` + `cow_island_muster_flats_1`**
    (2026-08-16) — both delivered together, both an exact 853x1844 canvas match, no text, no crop
    needed. Beach camp is an overcast grey morning (driftwood tent, cook-fire, cattle grazing, ships
    anchored offshore); muster flats is the same island's open grazing ground at a dramatic orange
    sunset, per the brief's note that these are "where real pirate fleets once mustered before a
    raid." Wired as `SCENE_COW_ISLAND_BEACH_CAMP`/`SCENE_COW_ISLAND_MUSTER_FLATS`, sixth and seventh
    "BG:" toggles added. Verified live on both portrait sides (used the established separate-page-
    load-per-check pattern — the Debug preview's known pre-existing overlap bug still applies when
    switching backgrounds with a box already open). Only Redbeard Sully's fort remains to complete
    Cow Island's three-scene set. `npx tsc --noEmit` and all 45 `jest` tests clean.

127. ✅ **Scene #7 delivered clean: `lord_redbeard_sully_fort_1`, completing Cow Island's set**
    (2026-08-16) — the first Pirate Lord's stronghold: rough palisade-and-timber walls, skull
    banners, a stone keep behind the gate, deliberately not the grandest fort in the run (fits
    Sully being the entry-level lord, per the brief). Exact 853x1844 canvas match, no text, no crop
    needed. Wired as `SCENE_LORD_REDBEARD_SULLY_FORT`, eighth "BG:" toggle added. Verified live —
    reads genuinely menacing, composites cleanly. All three Cow Island scenes (beach camp, muster
    flats, this fort) are now done. `npx tsc --noEmit` and all 45 `jest` tests clean.

128. ✅ **Scene #8, `new_providence_harbor_1`, caught and fixed a real continuity conflict, not just
    a framing one** (2026-08-16) — New Providence's Harbor Trading Post came in at a much wider
    1023x1537 (0.67) source aspect than the 0.46 target, the biggest mismatch yet, and its
    background carried a hand-painted "SALTY PARROT" tavern sign — the exact name already
    established as Tortuga's own tavern (`SCENE_TORTUGA_TAVERN_NIGHT`). Two different islands both
    having a "Salty Parrot" isn't a framing nitpick like the earlier garbled-text case; it's a
    continuity error that would read as the same tavern existing in two places. Cropped to 711x1537
    (0.4626, exact) with an asymmetric trim (60px off the left, 252px off the right) specifically
    aimed at pushing the sign past the frame edge rather than just hitting the target ratio — the
    result leaves only a bare, unreadable sliver of signboard at the border, confirmed by eye before
    wiring it in. Everything else (the ship, dock, market stalls, the gallows-lantern touch fitting
    the "no crown, no law" flavor text, the two figures talking) stayed intact. Wired as
    `SCENE_NEW_PROVIDENCE_HARBOR`, ninth "BG:" toggle added. Verified live — no legible signage
    anywhere in frame. `npx tsc --noEmit` and all 45 `jest` tests clean.

129. ✅ **A bonus scene outside the 30-item brief, `tortuga_signal_post_1`, matched to a real building
    on its own merits** (2026-08-16) — a lookout-tower-over-a-bay piece the user sent wasn't one of
    the 30 planned scenes, but it's a strong match for an existing named building: `buildings.ts`'s
    `tortuga_signal_post` ("The Signal Post"), Tortuga's watchtower, home to lookout NPC Yann whose
    entire dialogue line is about spotting sails from a vantage point ("First to spot a sail, first
    to ring the bell"). The delivered art — a thatched tower on a cliff over a wide bay, a ship
    visible offshore, misty peaks behind — is exactly that vantage point. Exact 853x1844 canvas
    match, no text, no crop needed. Wired as `SCENE_TORTUGA_SIGNAL_POST`, tenth "BG:" toggle added.
    Verified live. `npx tsc --noEmit` and all 45 `jest` tests clean.

130. ✅ **Scene #11, `roatan_careening_yard_1`, delivered clean** (2026-08-16) — Roatán's shipyard:
    hulls tilted on scaffolding for repair, a wrecked ship offshore, dramatic sunset. Sign reads
    "CAREENING YARD," matching `buildings.ts`'s real `roatan` building name exactly — no continuity
    conflict like scene #8's. Exact 853x1844 canvas match, no crop needed. Wired as
    `SCENE_ROATAN_CAREENING_YARD`, eleventh "BG:" toggle added. Verified live. `npx tsc --noEmit`
    and all 45 `jest` tests clean.

    User asked for a status check on the 30-scene brief at this point — full tally below, since
    delivery has been arriving out of the brief's original order (skipped New Providence's tavern
    and Iron Jenny's fort to jump to Roatán, plus one bonus scene outside the list entirely):
    - **Done (11 wired):** #1 Tortuga market day, #2 Tortuga tavern night, #3 Tortuga gaol interior,
      #4 Tortuga old landing, #5 Cow Island beach camp, #6 Cow Island muster flats, #7 Redbeard
      Sully's fort, #8 New Providence harbor, #11 Roatán careening yard — plus the original tavern-
      dusk piece from before the brief existed, and the bonus Signal Post lookout scene.
    - **Still open:** #9 New Providence tavern porch, #10 Iron Jenny's stronghold, #12 The Anchor &
      Forge (Roatán blacksmith), #13 Captain Bellows' fort, and all of #14-30 (Port Royal, Île
      Sainte-Marie, Ocracoke, the Black Pearl/sea scenes, and the 5 landmark/wilderness scenes).

131. ✅ **Scene #12, `roatan_forge_night_1`, delivered clean, closing the gap the status tally just
    flagged** (2026-08-16) — The Anchor & Forge at night: an open-air forge glowing orange, anchors
    and chains mid-repair, a cannon nearby, moonlit sea behind. Sign reads "THE ANCHOR & FORGE,"
    matching `buildings.ts`'s real `roatan` building name exactly. Exact 853x1844 canvas match, no
    crop needed. Wired as `SCENE_ROATAN_FORGE_NIGHT`, twelfth "BG:" toggle added. Verified live —
    sign fully legible against the dark scene, composites cleanly. `npx tsc --noEmit` and all 45
    `jest` tests clean. Only Captain Bellows' fort (#13) remains to complete Roatán's three-scene
    set.

132. ✅ **Two scenes delivered together, closing out both open gaps from the status tally: #13
    Captain Bellows' fort and #9 New Providence's tavern** (2026-08-16) — `lord_captain_bellows_fort_1`:
    a full cannon battery along a clifftop wall, stone keep with a red banner, powder/armament crates
    in the foreground — cannon-focused per Bellows' "commands the careening yards of Roatán with an
    iron gun crew" flavor text, completing Roatán's three-scene set (careening yard, forge, this
    fort). `new_providence_tavern_1`: The Cracked Hull's open-air porch at night, patrons drinking at
    outdoor tables, a moored ship under a full moon; sign reads "THE CRACKED HULL," matching
    `buildings.ts`'s real `new_providence` building name exactly. Both an exact 853x1844 canvas
    match, no crop needed. Wired as `SCENE_LORD_CAPTAIN_BELLOWS_FORT`/`SCENE_NEW_PROVIDENCE_TAVERN`,
    thirteenth and fourteenth "BG:" toggles added. Verified live on both — signage legible,
    composites cleanly. Only Iron Jenny's stronghold (#10) remains to complete New Providence.
    `npx tsc --noEmit` and all 45 `jest` tests clean.

133. ✅ **Iron Jenny's stronghold (#10) completes New Providence; Port Royal's flooded street (#14)
    opens the next island — and catches a second sign/geography mismatch** (2026-08-16) —
    `lord_iron_jenny_fort_1`: a tall fortified watchtower on a cliff, red skull banners, cannon and
    gate guards, sign reads "IRON JENNY'S STRONGHOLD." Source came in at 852x1846 (0.4615) — a
    fraction of a percent off the 0.4626 target, well within what `resizeMode="cover"` absorbs, no
    crop needed. Completes New Providence's three-scene set (harbor, Cracked Hull, this stronghold).
    `port_royal_flooded_street_1`: a half-submerged colonial street, buildings tilting into brackish
    water, a "PORT ROYAL" sign post in the foreground — exact 853x1844 canvas match. One thing
    caught before wiring it in: the building on the right is signed "CUSTOMS HOUSE," but the real
    Customs House in `buildings.ts` (`tortuga_customs`) is on Tortuga Cove, not Port Royal — a
    smaller-scale version of item 128's Salty Parrot problem (art asserting a named location that
    contradicts where the game data actually puts it). Rather than crop it out like the Salty Parrot
    sign, filed this one under the generic "flooded street" scene name instead of "Port Royal's
    Customs House" specifically, so nothing here actually claims a location the real data
    contradicts — left a comment flagging it as worth revisiting (crop, or a redo) if a genuine Port
    Royal Customs House scene is ever needed. Wired as
    `SCENE_LORD_IRON_JENNY_FORT`/`SCENE_PORT_ROYAL_FLOODED_STREET`, fifteenth and sixteenth "BG:"
    toggles added. Verified live on both. `npx tsc --noEmit` and all 45 `jest` tests clean.

    Half the 6 island Pirate Lord forts are now done (Redbeard Sully, Iron Jenny, Captain Bellows —
    Marietta Graves, Ezra Vane, and Blackbeard still open). New Providence and Roatán are fully
    complete (all 3 scenes each, plus Tortuga's 4 + the tavern-dusk original + the bonus Signal Post
    = 16 backgrounds total). Next open: #15 Port Royal's own Customs House (a real one, not the
    flooded-street sign), #16 Marietta Graves' drowned lair, then Île Sainte-Marie (#17-19), Ocracoke
    (#20-22), Black Pearl/sea (#23-25), and the 5 landmark/wilderness scenes (#26-30).

134. ✅ **A second Iron Jenny's Stronghold delivery, kept as an alternate rather than a
    replacement; two style-mismatched deliveries caught and held back** (2026-08-17) — a second
    pixel-art take on scene #10 came in (`lord_iron_jenny_fort_2`): same stronghold, framed from
    the gate looking in rather than the first version's approach shot — "IRON JENNY'S STRONGHOLD"
    sign on the palisade at left, open gate, a captain walking through, fort and cannon battery
    behind, ship offshore at sunset. User's call on the duplicate: keep both. Source came in wide
    at 1024x1536 (0.667); cropped to 711x1536 (0.4629, matches target), trimming 60px off the left
    and 253px off the right — loses a torch-bearing guard at the right edge, keeps the sign, gate,
    ship, and fort fully intact. Wired as `SCENE_LORD_IRON_JENNY_FORT_ALT`, a seventeenth "BG:"
    toggle ("Iron Jenny's fort (alt)") alongside the original rather than swapping it out. Verified
    live — composites cleanly behind the parchment box. `npx tsc --noEmit` and all 45 `jest` tests
    clean.

    Two other deliveries arrived alongside this one and were *not* wired in: a second style-mismatch
    case (Republic Square, Île Sainte-Marie, scene #17) came back photorealistic/painterly again,
    same issue as Marietta Graves' lair (item 132's redo request) — no pixel-art texture at all.
    Flagged it rather than wiring it in silently; user asked for a pixel-art redo, same as before.
    Both #16 and #17 now sit on hold pending redos rather than shipped as mismatched art.

135. ✅ **New track opened: a UI & Menus art brief, then a 245-sprite terrain/world "extras" dump
    cut and filed into the sprite library** (2026-08-17) — two separate pieces of work.

    First, audited every screen/component rendering UI chrome (`src/screens/*.tsx`,
    `ConversationBox.tsx`, `OnboardingOverlay.tsx`): every button, panel, progress bar, and stat/
    currency icon across all 16 is still a flat `StyleSheet` box with an emoji standing in for real
    art — only 4 sprites exist in `assets/sprites/ui/` today (the `ConversationBox` parchment/
    nameplate/skull badge, plus an unwired compass rose). Wrote `UI_MENU_ART_BRIEF.md`, splitting
    the gap into 6 requestable sheets (buttons & panels, bars & meters, currency/resource/specialty
    icons, badges/ranks/quest markers, header & nav chrome, full-screen overlays), same paste-once
    style-guide convention as `ART_BRIEF.md`/`CONVERSATION_BACKGROUNDS_BRIEF.md`. Published as a
    designed artifact alongside the plain-text repo doc, then sent the `.md` directly to the user
    for pasting into their image generator.

    Second — and unrelated to the UI brief above — a dense 1536×1024 terrain/world "extras" catalog
    sheet came back (12 labeled panels: additional ground/water/road/edge-transition/cliff/
    vegetation/stairs/wall variants, a Majestic Waterfall hero feature set, a Neptune Fountain hero
    landmark set, 15 one-off Hero Environmental Landmarks matching `landmarks.ts`-style named
    sights, and a Misc Details & Overlays decal sheet). This maps onto `TERRAIN_BRIEF.md`'s
    long-open request, not the UI brief — routed it there instead of trying to force it into
    `uiSprites.ts`. Cut using the README's established method (row/column background-profile
    detection instead of assuming a fixed grid, since several panels turned out to have two-line
    wrapped labels and per-cell layouts that a naive pitch-division would have sliced wrong) —
    caught and fixed a systematic y-offset bug partway through (relative in-panel coordinates were
    being used as absolute image coordinates for 7 of the 9 grid panels, which briefly cropped the
    wrong region entirely — e.g. "cliffs" coming out as water tiles — fixed by re-deriving every
    panel's true absolute y-band and re-cutting), plus several rounds of trimming labels that had
    bled into the top or bottom of a crop. Filed 245 sprites across `tiles/`, `nature/`, `props/`,
    `decals/` (first entries — was empty), `water_fx/` (first entries — was empty), and
    `landmarks/` (first entries — was empty), using the codebase's plain-sequential-number filename
    convention rather than baking each label into the filename. Wrote
    `assets/sprites/TERRAIN_EXTRAS_MANIFEST.md` as the filename → real-label lookup table, since
    the sequential names alone don't say what's in them. Dropped 3 small fountain edge/corner trim
    pieces whose column boundaries didn't segment cleanly rather than spend more time perfecting a
    minor detail category. Scope for this pass was cut-and-file only, per explicit request — no
    renderer wiring yet (that's the natural next step whenever it's wanted). `npx tsc --noEmit` and
    all 45 `jest` tests clean throughout (asset-only changes, no code touched).

136. ✅ **Re-audited item 135's cut against a direct challenge ("make sure you are not using grid
    cutting") and found it was warranted — re-cut every row with real per-item segmentation**
    (2026-08-17) — item 135's method was a hybrid, not the README's own connected-component
    standard: most rows used *equal-width division* of the row into N cells (N taken from reading
    the sheet's labels), then a real-content tight-bbox crop *within* each assumed cell. That inner
    crop step hid the problem in a quick look, but it doesn't fix a wrong cell boundary — it only
    crops to whatever happens to fall inside a window that may not actually contain one whole item.

    Checked by measuring real background gaps against the assumed equal-width boundaries for every
    row cut in item 135. Result: **10 of 21 rows didn't match** — real gaps drifted increasingly far
    from the assumed grid lines column over column (worst case, panel IV: item 135 assumed 13
    equal-width sub-tiles per row; the real content is 4 groups of 3-4 *touching* tiles with actual
    gaps only between groups, so the equal-13-way split had been cutting some tiles right down the
    middle and merging slivers into their neighbors). One panel (I) really was a uniform grid and
    matched almost exactly — but that turned out to be a property of that one source panel, not
    something safe to assume for the other eight.

    Re-cut all 21 grid-panel rows plus 6 hero sub-panel rows using real per-item detection: column
    background-profile segmentation, with an auto-tuned dilation radius (search radius 0-19,
    stop at the first value giving both the expected item count *and* sane, mutually-consistent
    segment widths — plain count-matching alone was a trap, see below) to bridge an item's own
    internal gaps (a fence's rail slats, a coral's branches, scattered decal dots) without merging
    across a real item boundary; a raised on/off threshold where items' anti-aliased edges blend
    together at the default threshold (several `water_extra`/`paving_extra` rows); and, for panel
    IV specifically, group-boundary detection (4 real groups per row, auto-tuned `min_gap` per row
    since the true inter-group gap width itself varies row to row) followed by equal subdivision
    *within* each group, since within-group tiles turned out to be genuinely touching with zero
    real background gap — equal-width division was actually correct there, just scoped to the
    wrong span (the whole row instead of one group).

    Caught one false-positive along the way worth flagging: a naive "does the segment count match
    my expected label count" check is not sufficient on its own — one row matched 7-for-7 purely by
    coincidence (one accidental 2-item merge plus one 1px noise fragment cancelling out in the
    total). Fixed by requiring segment widths to also be sane and mutually consistent, not just the
    right count. Also found one row where my *expected* count itself was wrong: the sheet's
    "Fountain Base & Pool" section shows 5 text labels but the real pixel content is 6 distinct
    pieces (a second curved base-wall piece at a different angle, visually close enough to the
    first that it read as one item on a quick pass) — kept as 6 real sprites
    (`props/fountain_piece_1..6`) rather than force a merge to match the label count. Updated
    `TERRAIN_EXTRAS_MANIFEST.md` with a revision note and the corrected fountain-piece labels.
    Re-verified every re-cut category visually via contact sheets — no clipped edges, no fragments,
    no residual label-text bleed. `npx tsc --noEmit` and all 45 `jest` tests clean (asset-only
    changes).

137. 🔒 **Locked in a standing policy: never request multi-item grid/catalog sheets for art
    generation going forward — one asset per image, always** (2026-08-17) — item 136 fixed how
    already-delivered grid sheets get *cut*; this closes the loop on the far cheaper fix: don't ask
    for a grid in the first place. Added a durable rule to `AGENTS.md` (loaded every session via
    `CLAUDE.md`'s `@AGENTS.md`) so this persists automatically rather than depending on a brief
    doc being re-read. Updated every brief that asked for multi-item sheets: `ART_BRIEF.md`'s
    "Universal technical spec" flipped from "multiple items per sheet (never one-per-image)" and
    "clean grid" layout to one-asset-per-image with individually-sized canvases, and its Part C-F
    "Sheet 1-6" groupings relabeled "Batch 1-6" with an explicit note that each named item is still
    its own separate generation; `UI_MENU_ART_BRIEF.md`'s entire "Sheet 1-6" structure relabeled to
    "Batch 1-6" with the same one-asset-per-image note added to both its intro and its reusable
    paste-once prompt; `TERRAIN_BRIEF.md` — the doc most directly responsible for the sheet item
    135/136 had to un-grid — got a correction notice up top flagging that its original "master
    terrain sheet" framing produced the exact 250-sprite mess that just took an extensive re-cut to
    fix, plus a fixed "Format notes" line that no longer implies one shared canvas across items.
    `CONVERSATION_BACKGROUNDS_BRIEF.md` already asked for one continuous scene per image ("not a
    collage or vignette grid") — checked, no change needed. `npx tsc --noEmit` and all 45 `jest`
    tests clean (doc-only changes).

138. ✅ **Saved the original terrain-extras sheet into the repo as a permanent reference, for
    re-verification and future style-matching** (2026-08-17) — the 1536×1024 sheet items 135/136
    cut 245 sprites from only ever existed in ephemeral upload/scratch storage; nothing tied the cut
    sprites back to their source once the session ended. Copied it to
    `assets/brand/tileset-catalog/terrain_extras_sheet_v1.png`, following the exact precedent
    already set by `master_catalog_v1.png`/`tortuga_focus_v1.png` in that same folder (original,
    uncut reference sheets a cutting pass came from — not used directly in-game). Two reasons this
    matters going forward: re-verification (if a cut sprite ever looks wrong, the real source panel
    is sitting right there to check against instead of trusting the crop blind) and future
    requests (matching the same visual language if more items in this style are ever needed).
    Updated `TERRAIN_EXTRAS_MANIFEST.md` to point at the saved file and added the source sheet's own
    roman-numeral panel labels (Panel I ground variants, II water, III paving, IV edges/
    transitions, V cliffs, VI vegetation, VII stairs, VIII fences, IX waterfall hero set, X
    fountain hero set, XI hero landmarks, XII decals) to every section heading, so any future
    lookup goes straight to the right part of the sheet rather than searching by eye. `npx tsc
    --noEmit` and all 45 `jest` tests clean (asset + doc changes only).

139. ✅ **Future-proofed the cutting process and asset filing itself, ahead of many more incoming
    deliveries** (2026-08-17) — the user's own framing: fix storage/filing *before* the next dump
    lands, not after. Two changes, both process, no new sprites.

    Rewrote `assets/sprites/README.md`'s "Cutting convention" section to bake the item 136 fix in
    as the actual default method, not just a lesson learned in `GAME_DESIGN.md` history: explicit
    warning against the equal-width-division shortcut (the exact mistake made in item 135, even
    though the README's older text technically already said not to trust a matching count alone);
    concrete technique for both failure directions found this session — auto-tuned dilation radius
    for items that over-fragment (fence rails, coral branches, scattered decals) and a raised
    on/off threshold or group-then-subdivide approach for items that under-fragment (touching
    tiles, blended anti-aliased edges); a new standing step to always save the original sheet to
    `assets/brand/tileset-catalog/` (previously only done because it was asked for — item 138); and
    a naming-continuation rule for future deliveries in an already-existing category (`ground_extra_25`,
    not a fresh descriptor).

    Created `assets/sprites/DELIVERY_LOG.md` — a running per-delivery index (date, source sheet,
    manifest doc, item count, folders touched, wired status) so "which sheet did this come from"
    and "is this wired in yet" both stay answerable after many more deliveries, rather than
    requiring a commit-history search or relying on memory. Pre-populated with the two prior
    deliveries (`master_catalog_v1.png`, `tortuga_focus_v1.png`) plus this session's terrain-extras
    delivery, and seeded with a "known free wiring opportunities" section capturing the landmark
    gaps and variant-pool opportunities found while answering the user's "what else could we do"
    question — so those findings don't get lost before wiring work actually starts.

    Flagged but did *not* do: `tiles/` (268 files) and `nature/` (116 files) are both well past the
    README's own stated subfolder-split threshold. Not split yet because it means updating every
    `require()` path already wired into `worldSprites.ts` for the pre-existing files in those
    folders — a real refactor, not a free action — so it's recorded in `DELIVERY_LOG.md` as an open
    decision rather than done unilaterally. `npx tsc --noEmit` and all 45 `jest` tests clean
    (doc-only changes).

140. ✅ **Split `tiles/` and `nature/` into subfolders** (2026-08-17) — the open decision flagged in
    item 139, actioned once the user confirmed ("Do it now") rather than left for a future session
    to trip over. Both folders had grown well past this library's own 15-20-file subfolder
    threshold, and each held several genuinely distinct sub-groups (ground vs. water vs. paving vs.
    transitions vs. elevation vs. beach vs. bridges within `tiles/`; vegetation vs. trees vs. rocks
    within `nature/`) that were getting harder to browse flat.

    First searched the whole codebase for anything referencing `assets/sprites/tiles/` or
    `assets/sprites/nature/` paths — only one file does, `src/data/worldSprites.ts`, which
    considerably de-risked the move. Created 8 subfolders under `tiles/`
    (`ground/water/paving/paths/transitions/elevation/beach/bridges`) and 3 under `nature/`
    (`vegetation/trees/rocks`), moved all 268 `tiles/` files and all 116 `nature/` files into them
    with `git mv` (history-preserving), and confirmed both post-move counts matched the pre-move
    flat-folder counts exactly with zero loose files left behind in either parent folder.

    Rewrote all 227 affected `require()` calls in `worldSprites.ts` via a scripted regex
    substitution against an explicit filename-prefix → subfolder mapping table (e.g.
    `tiles/ground_extra_` → `tiles/ground/ground_extra_`, `nature/rock_extra_` →
    `nature/rocks/rock_extra_`), then verified: no old-style unfoldered `tiles/`/`nature/` paths
    remained anywhere in the file, and all 276 total `require()` paths in the file resolve to a
    real file on disk (0 missing). `npx tsc --noEmit` clean, all 45 `jest` tests still pass. Started
    the dev server and ran a Playwright check (navigate, dismiss onboarding, screenshot, capture
    console/page/network errors) against the live Tortuga Cove map — zero errors of any kind, and
    the screenshot confirmed grass/cobblestone/dirt-path tiles, the Scally sprite, minimap,
    compass, and quest banner all still rendering exactly as before. Zero regressions.

    Updated `assets/sprites/README.md`'s folder map and subfolder-threshold paragraph to describe
    the new structure, and `assets/sprites/TERRAIN_EXTRAS_MANIFEST.md`'s section headings (which
    had gone stale the moment the files moved) to point at the real new paths
    (`tiles/ground/ground_extra_1..24`, `nature/rocks/rock_extra_1..21`, etc.). Also updated
    `DELIVERY_LOG.md`'s folder-size note to record the split as done rather than open. Naming
    convention inside each subfolder is unchanged — plain `{descriptor}_{n}.png` — only the folder
    path grew a subfolder segment, so nothing about how future deliveries get numbered changes.

141. ✅ **Cut and filed the second terrain-extras delivery — 145 sprites across 11 labeled panels**
    (2026-08-20) — a clean, computer-arranged catalog-style sheet (`terrain_extras_2_sheet_v1.png`),
    the first delivery to land since the cutting-process and folder-structure future-proofing work
    in items 139–140. Real per-item extraction throughout: connected-component detection within
    each row's column slices (not equal-width division blindly trusted — spacing was measured
    against unambiguous items first, since this sheet's rows genuinely did turn out to have
    constant spacing, verified rather than assumed). Filed into existing folders, continuing numbering everywhere a
    category already existed (`ground_extra_25..37`, `stairs_ramp_14..21`, `trans_extra_53..78`,
    `rock_extra_22..23`, etc.) and starting fresh only for genuinely new categories (`curb_*` and
    `plinth_*`, plus the first 8 real entries in the previously-empty `harbour/` folder). Full
    per-sprite breakdown in the new `TERRAIN_EXTRAS_2_MANIFEST.md`; delivery logged in
    `DELIVERY_LOG.md`; original sheet saved to `assets/brand/tileset-catalog/terrain_extras_2_sheet_v1.png`
    per standing practice.

    Two real bugs surfaced during verification and got fixed before filing, not after — both
    caught by actually opening the cropped PNGs rather than trusting bounding-box counts alone
    (the exact discipline `README.md`'s cutting convention calls for):

    - **Caption text baked into the crop.** The first extraction pass took a column slice's full
      content span as the sprite, which sometimes included the item's own label text sitting
      directly below the art (no dilation involved — the two were just both "content" within the
      same column window). Fixed by taking only the *largest connected component* per column slice
      instead of the full span — the art blob is reliably much larger than a caption's text
      fragments, so this cleanly separates them without needing per-item tuning.
    - **A handful of sparse/thin items still needed hand re-cropping** after that fix — a dead
      tree's bare branches, hanging vines, a small drainage grate, and a lantern post all had real
      content that a uniform column split clipped or missed (thin art near a column boundary, or
      legitimately wider/narrower than its row siblings). Each was individually re-examined against
      the source sheet at full resolution and re-cropped by hand. Also caught: Panel XI's "corner
      blends" group was initially miscounted as 2 unique large tiles + a separate 14-item, 2×7
      layout (16 total) — re-inspection showed the first two columns just have busier internal art
      than the rest, not a different structure; it's the same 2-row × 7-column layout throughout,
      14 items. Corrected before filing (145 total, not 147).

    Nothing wired into a renderer yet — that's still explicitly out of scope until "a ton more
    sheets" (the user's own framing) have landed. `npx tsc --noEmit` and all 45 `jest` tests clean
    (asset + doc changes only, no source code touched).

142. ✅ **Built the reusable cutting tool + four asset-pipeline subagents** (2026-08-20) — prompted
    by the user asking why the item-141 delivery took so long and proposing dedicated roles for
    the pipeline. The honest answer to "why so long": no two sheets share a layout so panel/row
    structure gets rediscovered by eye every time, the cutting tool (`segment_lib.py`) was written
    *during* item 141 rather than reused, and verification (opening every actual cropped PNG, not
    trusting bbox counts) is inherently expensive across 145 items — the first two are fixable with
    tooling, the third is a discipline worth keeping.

    Extracted the item-141 cutting logic into `scripts/asset_cutting/segment_lib.py` — a
    documented, reusable module (connected-component extraction, auto-escalating dilation, the
    largest-component-per-slice fix for the caption-text bug, an outlier-detection snippet) so the
    next delivery starts from working tooling instead of rebuilding it.

    Created four project-specific subagents in `.claude/agents/`:
    - `asset-qa` — independently verifies a cutting pass before it's treated as filed (catches
      baked-in text, merges/splits, wrong content, thin/clipped crops).
    - `asset-artist` — judges art quality and style/scale/palette consistency against what's
      already in the game, separate from cut correctness.
    - `asset-librarian` — keeps `README.md`'s folder map, `DELIVERY_LOG.md`, and per-delivery
      manifests in sync with what's actually on disk; owns naming-continuation and subfolder-split
      decisions.
    - `scene-art-director` — plans concrete uses of the library in the actual game world (which
      sprites go where, what to wire next); planning only, no implementation.

    Cross-linked all four plus the new tool from `assets/sprites/README.md` so they're
    discoverable from the doc a future session would already be reading. `npx tsc --noEmit` and
    all 45 `jest` tests clean (new tool/agent files only, no existing source touched).

143. ✅ **Purged "grid" terminology from the new cutting tool and its docs** (2026-08-20) — direct
    feedback right after item 142 landed: even a *verified*-spacing equal-slice technique
    shouldn't be called or named "grid," since the word itself is what invited the blind-grid
    mistakes fixed in items 98/99/135–137. Renamed `segment_lib.py`'s `row_grid_boxes()` →
    `verified_pitch_row_boxes()` and reworded its module docstring and inline comments throughout
    to say "confirmed/constant spacing" instead of "grid," while keeping every actual lesson
    intact (still requires measuring real gaps first, still falls back to real per-item detection
    the moment spacing isn't constant). Same pass through `TERRAIN_EXTRAS_2_MANIFEST.md` (Panel
    XI's G-group description, the cutting-method note, the miscount writeup), item 141/142's own
    text above, and `.claude/agents/asset-qa.md`'s one incidental "grid the sprites" phrase
    (meant a contact-sheet layout, unrelated to cutting method, reworded anyway for zero
    ambiguity).

    Deliberately **not** touched: the pre-existing "do not assume a grid" warning phrasing in
    `README.md`'s Cutting convention section (that IS the standing prohibition, not a risk of
    reintroducing one) and every historical `GAME_DESIGN.md` entry describing past grid-cutting
    mistakes (items 97–99, 135–137) or the town's actual orthogonal street grid (an unrelated,
    intentional design element) — rewriting either would erase real history or edit an unrelated
    concept, not reduce risk. `npx tsc --noEmit` and all 45 `jest` tests clean (doc/tool text
    only, no behavior changed).

144. ✅ **Cut and filed the third terrain-extras delivery — 306 sprites across 32 panels**
    (2026-08-20; corrected to 309 items on 2026-08-21 per item 145, then 311 per item 146, then
    305 per item 147) — the first delivery to go through the new pipeline built in item 142
    (`segment_lib.py` + the four asset-pipeline subagents). Structurally the densest and most
    varied sheet yet: no per-item numbered captions on the source at all, just a panel title and
    named categories, and — unlike either prior terrain-extras delivery — the number of real
    items packed under one category name genuinely varies panel to panel and even category to
    category within the same panel. Confirmed by zooming into the source before cutting each
    panel, not inferred from a category count:

    - Some categories are a single item, some are 2 stacked variants, some are a verified 2×2
      grid of 4 genuinely distinct pieces (confirmed via extreme zoom on Panel 4's "Cobble
      Streets" LIGHT swatch — a real seam separates 4 different stone arrangements, not one tile
      shown four times).
    - Panel 12's four categories aren't uniform with each other (FLOOR/OVERGROWN/ROOTS are 2×2,
      VINES is 1 row of 4). Panel 13's four tree categories have different column counts each
      (2/3/3/2) — a single assumed grid across the whole panel would have misaligned every column
      past the first category. Panel 30 mixes four single-item categories with one 2×4-grid
      category (PUDDLES, 8 items) in the same panel.

    Solved this with a purpose-built panel divider detector (color-signature match on the sheet's
    gold border lines, strict >90% row/column coverage threshold to reject panel-content false
    positives) that located all 32 panels' exact pixel boundaries automatically — far more
    reliable than the manual crop-view-adjust loop used for the prior two deliveries, and this
    detector plus the row/category-slicing helpers are now reusable for the next dense catalog-
    style sheet. Two real bugs surfaced during verification and got fixed before filing, both
    caught by an automated outlier check (crop dimensions far below a panel's own median) rather
    than by chance:

    - **Category-label text baked into a few crops** (Panels 13, 21, 28) — the header-padding
      value tuned against most panels wasn't tall enough for these three (their category labels
      sit measurably lower before real content starts), so a couple of narrow column slices
      picked up the label text itself as the "largest connected component." Fixed by re-measuring
      the true content-start row for each affected panel directly against the source image and
      re-cutting with a corrected offset.
    - **Fragment-not-whole-tile crops on two heavily-textured panels** (Panel 18 "Special
      Surfaces": mud/swamp/mossy stone/lava rock, and Panel 28 "Island Terrain Specials": volcanic
      rock among them) — "largest connected component" is right when a slice might contain noise
      to reject, but a densely mottled ground texture is naturally fragmented into many small
      blobs by its own texture, so "largest single blob" grabbed only a fraction of the tile.
      Fixed by switching those two panels to a full-content bounding box (union of all content
      pixels in the slice, the same fix already used for Panel 11's scattered rock-pile scenes)
      instead of a single-blob search.

    Filed into existing folders, continuing numbering everywhere a category already existed
    (`ground_extra_38..61`, `trans_extra_79..106`, `cobble_13..29`, `tree_9..24` plus
    `tree_dead_2..5` — caught and fixed two would-be filename collisions with the prior delivery's
    `tree_dead_1`/`broken_ground_2` during a pre-flight dry run before any file was actually
    copied) and starting fresh only for genuinely new categories (`shoreline_*`, `plateau_*`,
    `desert_*`, `road_intersection_*`, `map_edge_*`, `buildings/floor_tile_*`, plus the first 4
    real entries in the previously-empty `weather_fx/` folder). Full per-sprite breakdown in the
    new `TERRAIN_EXTRAS_3_MANIFEST.md`; delivery logged in `DELIVERY_LOG.md` along with fresh
    "known free wiring opportunities" and a folder-size note flagging `tiles/ground/` (136),
    `tiles/transitions/` (159), and `nature/vegetation/` (128) as now well past the
    subfolder-split threshold *within* their own subfolder, though none obviously decompose into
    distinct sub-groups yet the way `tiles/` itself did — flagged for a future session, not acted
    on unilaterally. Original sheet saved to
    `assets/brand/tileset-catalog/terrain_extras_3_sheet_v1.png` per standing practice. `npx tsc
    --noEmit` and all 45 `jest` tests clean (asset + doc changes only, no source code touched).

145. ✅ **Independent QA pass on the terrain-extras-3 delivery found real, extensive defects
    beyond the two item 144 claimed to have caught — re-cut and re-filed all of them** (2026-08-21).
    Invoking the `asset-qa` subagent against the delivery (before treating it as done, per its own
    stated purpose) surfaced problems in 8 of the 32 panels that item 144's automated
    outlier-size check and debug-overlay glance had both missed:

    - **Baked-in category-label text** in Panels 4, 10, 11, 12, 18, and 22 (item 144 had only
      caught this for Panels 13/21/28) — same root cause as before (insufficient header padding),
      just not tuned correctly for these panels either. Fixed the same way: re-measure the real
      content-start row per panel directly against the source, not by reusing one panel's value.
    - **Wrong equal-width category-boundary assumption** in Panels 12 and 13 — some sub-categories
      touch with zero real background gap while others have a real gap, and dividing a category's
      width evenly by item count silently drifts content across the boundary when that's true.
      Fixed by measuring real per-item boundaries via a column-activity gap profile (and, where
      even that gap is genuinely absent, by direct visual silhouette comparison) instead of
      assuming uniform spacing — extending the project's standing "never assume equal
      spacing" rule to *category* boundaries, not just item boundaries within a row.
    - **Panel 13's tree-category structure was wrong in both the original cut and the first
      re-cut attempt.** A ruler-gridded re-measurement of the source found the real structure is
      PALMS=2×2=4, JUNGLE TREES=2×2=4, BROADLEAF=2×3=6, DEAD TREES=2×3=6 — both earlier passes
      had JUNGLE TREES and DEAD TREES backwards (assumed 6/4, real 4/6). The category totals
      happened to sum to the same overall panel total (20) either way, which is exactly why the
      error survived an aggregate count check — only opening individual crops and comparing them
      to a ruler-gridded zoom of the source caught it.
    - **Panel 22 was undercounted 4x** — the original cut treated all 4 category labels (STONE
      BLOCKS, BROKEN WALLS, PILLARS, RUINED TILES) as single items. PILLARS is really 4
      freestanding statues with real, individually-confirmed background gaps between each one,
      now cut and filed as 4 separate `ruin_pillar_*` items. STONE BLOCKS, BROKEN WALLS, and
      RUINED TILES turned out to be organic rubble/debris compositions — real, visually distinct
      item silhouettes exist inside each (e.g. a chest-shaped block next to a medallion-topped
      block) but with no consistent, verifiable per-item pixel boundary between them (items touch
      and stagger with no real grid). Rather than ship an unverifiable guessed split, each of
      those three categories is filed as one whole-category crop capturing its full real content
      losslessly instead of a fragmented, possibly-wrong multi-item cut.
    - **A sort-order bug scrambled category labeling during the Panel 13 re-verification attempt**
      (caught and fixed before filing, not shipped) — an intermediate re-cut sorted output crops by
      absolute row position for readable debug output, which silently interleaves items across
      categories whenever different categories have different per-row item counts sharing the same
      physical rows. The underlying pixel-level cuts were correct the whole time; the bug was
      purely in how the output list was labeled afterward. Fixed by cutting and naming every item
      by its explicit category/row/column position and re-verifying by name, never trusting index
      order.

    Net effect on the delivery: 306 → 309 items (Panel 22 +3 net after correcting its structure;
    Panel 13's total stayed at 20 since its two miscounted categories summed the same either way).
    `tree_23.png`/`tree_24.png` (filed under Panel 13's wrong structure) were removed since
    Broadleaf's real 6 items fit in `tree_9..22`; `nature/trees/tree_dead_6.png` and `_7.png` are
    new. `props/ruin_pillar_2..4.png` are new. Every other affected file kept its original
    filename/destination — only the pixel content changed. Re-ran the full re-verification
    discipline that this pass established as non-negotiable: every corrected crop was opened
    directly with the Read tool and visually confirmed (not just debug-overlay boxes, not just an
    automated size check, not just re-trusting the fix that was applied) before filing.
    `TERRAIN_EXTRAS_3_MANIFEST.md` and `DELIVERY_LOG.md` rewritten to reflect the real structure
    and an honest account of what the first pass got wrong. `npx tsc --noEmit` and all 45 `jest`
    tests clean (asset + doc changes only, no source code touched).

146. ✅ **A second independent QA pass on item 145's own fixes found two more real defects it
    introduced — fixed and re-filed** (2026-08-21). Requesting a second `asset-qa` review of
    round 1's re-cut, rather than self-certifying it, was the right call: round 1 had itself
    shipped defects despite following the "open every crop and look at it" discipline it had just
    established, proving that discipline alone doesn't catch every failure mode — cross-checking
    a crop's *claimed* label against a fresh crop from that exact position in the source is a
    separate, necessary check.

    - **Panels 4, 10, and 11's individual crops were pixel-correct but filed under the wrong
      category label.** All three panels lay out several categories side by side across a shared
      row (e.g. Panel 4: LIGHT/MEDIUM/DARK/MOSAIC cobble variants, 4 categories × 2 columns × 2
      rows = 16 tiles). Round 1's re-cut sliced straight across every column of row 1, then every
      column of row 2, and filed the resulting 16 crops in that row-major order under
      category-grouped filenames — assuming slot N was always category ⌈N/4⌉ when it wasn't. So
      `cobble_15.png` labeled "Light 3" actually held Medium's first row-1 tile, `cobble_17.png`
      labeled "Medium 1" actually held Dark's, and so on — 12 of Panel 4's 16 files, 12 of Panel
      10's 16, and 6 of Panel 11's 8 were mislabeled this way. This is the exact same *class* of
      bug as item 145's Panel 13 sort-order bug — pixel content correct, output labeling wrong —
      just undetected the first time because round 1 checked "does this crop look like a
      plausible cobble/cliff/rock texture" rather than "does this crop's content match a fresh
      crop from its claimed label's real position in the source." Fixed by re-deriving the real
      category→slot mapping directly against the source and re-permuting the filenames onto the
      already-correct crops — no re-cutting needed.
    - **Panel 13's PALMS was undercounted (real structure is 3×2=6, not 2×2=4 as both the
      original cut and round 1 assumed) and PALMS/BROADLEAF were both being extracted as
      disconnected leaf/trunk fragments, not whole trees.** A wider ruler-gridded zoom of the
      source (round 1's zoom window had cut off before the real 3rd palm column started) found
      the missing column. Separately, palm fronds and broadleaf canopy leaves are naturally
      sparse — they don't touch each other or the trunk at a low pixel-activity threshold — so a
      largest-connected-component extraction (the method round 1 used, appropriate for rejecting
      caption text but wrong for a naturally fragmented tree) grabbed only one leaf cluster or
      the bare trunk out of 10+ real disconnected pieces per tree. This is exactly the sparse-item
      risk `scripts/asset_cutting/segment_lib.py`'s docstring lesson #5 warns about, and it slipped
      past round 1's own visual check because a single leaf-cluster fragment still *looks* like
      plausible green foliage at thumbnail scale — only comparing it against the source's real,
      complete tree silhouette revealed it was a fragment. Fixed by re-measuring PALMS' true
      3-column width and re-cutting every PALMS and BROADLEAF item with a full-pixel-union
      bounding box (`content_bbox`, not a single largest blob) — the same method already proven
      for Panel 11's rock piles and Panel 18's mottled ground.

    Net effect: 309 → 311 items (Panel 13's Palms category +2; Panels 4/10/11 unchanged in count,
    only relabeled). `tree_23.png`/`tree_24.png` — removed in item 145 under the (still-wrong)
    assumption Broadleaf only needed `tree_9..22` — are back, now correctly holding Broadleaf's
    5th/6th items; the full `tree_9..24` range from the very first cut turns out to have been the
    right file count all along, just internally mis-partitioned across categories twice in a row
    before landing on the real 6/4/6/6 split. `TERRAIN_EXTRAS_3_MANIFEST.md` and `DELIVERY_LOG.md`
    updated again. `npx tsc --noEmit` and all 45 `jest` tests clean (asset + doc changes only, no
    source code touched). This still wasn't the last round — see item 147.

147. ✅ **A third independent QA pass on item 146's own fixes found three more real defects —
    fixed and re-filed** (2026-08-21). Requested as a matter of course this time, since both prior
    rounds had shown a round's own re-verification catches its intended fix but not necessarily
    everything else in the panels it touched.

    - **Panel 11's four categories (SMALL ROCKS, BOULDERS, ROCK OUTCROPS, STONE PATCHES) were
      each split into an "A"/"B" pair from the very first cut, and this survived two further
      rounds of review — every category is really one whole scattered-rock scene.** The bug
      hid in plain sight because each half, viewed alone, still reads as a plausible small rock
      cluster; nothing about either half looks broken on its own. Caught by checking for a real
      near-zero-activity background gap at the claimed split point (there isn't one — row
      activity never drops close to zero across a category's full real height) and by
      reconstructing a whole scene from the two halves and confirming it exactly reproduces a
      fresh crop of the source. Re-filed as 4 whole-scene items instead of 8 (`rock_small_10.png`,
      `boulder_large_5.png`, `rock_extra_25.png`, `rock_patch_2.png` removed).
    - **Panel 10's PLATEAUS had the identical bug, scoped to one category in an otherwise-correct
      panel.** CLIFF TOP, CLIFF SIDES, and LEDGES in the same panel are genuine 2×2 grids with a
      real row gap between top and bottom — confirmed correct across all three rounds — which is
      exactly what made PLATEAUS' superficially similar 2×2 layout easy to mistrust in one
      direction only: nobody had checked whether *its* row split was real. It wasn't — PLATEAUS
      is 2 whole grass-capped rock columns, and the "top"/"bottom" halves every prior round
      treated as separate items were the grass cap and bare rock base of the same column.
      Re-filed as 2 whole-column items instead of 4 (`plateau_3.png`, `plateau_4.png` removed).
    - **Panel 13's DEAD TREES were still clipped, despite round 2 explicitly re-checking this
      exact category and reporting it fine.** The bug wasn't in the header padding (that part was
      correctly measured) — each tree's column slice was simply too narrow, so a tree's tallest
      branch tips (which fan out sideways rather than growing straight up) fell outside the slice
      and were excluded from the tight content bounding box, silently shortening the crop by
      about a third of its real height (~29-37px delivered vs. ~44-50px of real content) even
      though the vertical (row) range used was correct. Fixed by widening each tree's column
      slice to its real, wider branch spread and re-cutting all 6.

    Net effect: 311 → 305 items (Panel 11 -4, Panel 10 -2; Panel 13's Dead Trees count unchanged,
    only re-cut for correct height). `TERRAIN_EXTRAS_3_MANIFEST.md` and `DELIVERY_LOG.md` updated
    again. `npx tsc --noEmit` and all 45 `jest` tests clean (asset + doc changes only, no source
    code touched). Three successive independent QA rounds were needed before a pass returned no
    findings; the standing lesson for any future dense multi-category catalog sheet cut through
    this pipeline is to keep requesting independent QA rounds until one comes back clean, not to
    budget a fixed number of rounds and stop — and to distrust "this category looks structurally
    like its neighbors" as a substitute for checking each category's own real internal boundaries,
    since Panel 10 shows two categories in the same panel can look alike while only one of them
    actually has the split its layout suggests.

148. ✅ **Cut and filed a new 21-panel "terrain extras 4" reference sheet — 234 sprites, applying
    every lesson from items 145–147 proactively during cutting itself instead of finding the same
    defects in a later QA round** (2026-08-21). The user uploaded a new, unrelated master-catalog-v2
    style sheet (21 panels: ground/grass/path/cobble/road tiles, jungle floor, beach & shore, sea
    tiles, sea transitions, two transition-type panels, cliffs/rocks, elevation, stairs, trees,
    bushes & plants, rocks & boulders, decorative details, special tiles, miscellaneous) with no
    accompanying text; confirmed via `AskUserQuestion` that it should go through the same
    measure-cut-verify-file pipeline as `terrain_extras_3_sheet_v1.png`.

    Checked for the "whole category, not grid" trap (item 147's Panel 11/10 lesson) on every
    panel that visually resembled a small grid before cutting it as one, rather than after —
    correctly identified Panels 18 (Rocks & Boulders), 19 (Decorative Details), 20 (Special Tiles),
    and 21 (Miscellaneous) as single whole-category composites (2, 6, 5, and 6 items respectively,
    not the naively-assumed 12/12/7/12) by checking row/column activity profiles for a real
    near-zero gap before ever cutting a split. Two defects still slipped through the first pass and
    were caught while building this delivery's own verification contact sheets (not a separate
    post-hoc QA round):

    - **Panel 21's first-pass column boundaries were shifted by roughly one category width** —
      `Barrels`/`Sacks` both got crops of the barrels grid, `Campfire`/`Signpost` got sack and
      campfire+signpost content. A contact sheet alone didn't reveal this (each individual crop
      still looked like a plausible barrel or sack image); catching it required reading a couple of
      the individual output files directly and comparing them against a fresh crop of the source
      region at the label's real x-position. Re-measured the true column-run boundaries via
      `bg_distance`+run-detection across the full category band and re-cut all 6 items correctly.
    - **A stray 468×5px border-line sliver in Panel 12** slipped past the standard outlier-area
      filter (0.4×-median threshold) because two of the panel's real items are themselves narrow.
      Found by printing every crop's raw pixel dimensions and spotting the one 5px-tall outlier,
      confirmed against the debug overlay, deleted — Panel 12 is 19 real items, not 20.

    Filed into `assets/sprites/` continuing every matching existing series (`ground_basic_7..12`,
    `grass_variations_13..24`, `path_dirt_25..36`, `cobble_30..43`, `jungle_ground_29..40`,
    `trans_grass_dirt_road_21..40`, `trans_corner_34..52`, `cliff_top_edge_12..16`,
    `elevation_ledge_11..16`, `stairs_ramp_27..31`, `tree_25..29`/`tree_dead_8`,
    `bush_plant_52..78`, `shoreline_5..18`, and more — see `TERRAIN_EXTRAS_4_MANIFEST.md` for the
    full per-panel map) plus three brand-new series this sheet's content didn't fit anywhere
    existing: `props/beach_detail_1..11` (small beach-scatter clutter — shells, starfish,
    driftwood), `water_fx/wave_1..11` (standalone wave-crest sprites, distinct from the flat
    `tiles/water` sea tiles), and `tiles/ground/rocky_ground_1..4` (a rock-strewn ground tile).
    `TERRAIN_EXTRAS_4_MANIFEST.md` and `DELIVERY_LOG.md` written/updated. `npx tsc --noEmit` and
    all `jest` tests clean (asset + doc changes only, no source code touched). Not yet wired into
    any renderer.

    An independent `asset-qa` subagent pass, requested right after the initial commit (this
    session's standing practice, proven worthwhile by items 145–147), found one further real
    defect this delivery's own verification had missed: **all 6 Panel 16 tree crops had the
    panel's bronze border/divider line baked into their bottom edge, plus a soft background-color
    halo along their other edges.** The panel's real tree content ends around row 154 of the panel
    window; rows 155–165 are real background; the panel's own outer border sits at rows 166–167.
    The original cut's mask window ran to the panel's full height without excluding those last two
    rows, so `content_bbox` unioned the border line into every tree's bounding box — which also
    explains the halo, since the enlarged box's newly-included background rows fell inside
    `crop_rgba`'s color-distance feather ramp. Root-caused via direct row-by-row pixel inspection
    of the source (confirmed the border color and row range precisely, not just "looks wrong"),
    fixed by re-deriving each tree's column range from an activity profile capped at row 155 and
    re-cutting; verified with a fully-opaque-edge check across all 234 delivered files (only the
    tree series tripped it, confirming the fix was complete and nothing else needed it) and a
    direct composite over a grass tile showing no border frame or halo. Re-filed over the same 6
    filenames (`tree_25.png`…`tree_29.png`, `tree_dead_8.png`) — no renumbering needed.
    `TERRAIN_EXTRAS_4_MANIFEST.md` and `DELIVERY_LOG.md` updated again same day.

150. 📌 **Logged, not started: give the rival/navy threat factions their own visible ship**, the
    same way item 149 gave merchants one. The user is continuing to provide new art sheets, so this
    is queued rather than acted on immediately. When it's picked up: `MapScreen.tsx`'s
    `triggerAmbush('rival'|'navy', atPoint)` is the equivalent of `triggerMerchant` — it currently
    has no visible-ship flash at all (not even the merchant path's kind), so this needs the same
    `shipFlash`-style state + render as `merchantShipFlash`, not just a new sprite mapping. Boat
    stock already sitting unused in `assets/sprites/ship/boats/` for this: Pirate Sloop and Heavy
    Pirate Ship read as rival-appropriate by name; Dinghy/Small Sloop/Merchant Schooner/Flagship
    remain unmatched to any faction. The 16 damaged/wrecked/burning example variants are also still
    completely unused — see `DELIVERY_LOG.md`'s "Known free wiring opportunities (2026-08-22)" for
    the full list of what's cut and filed but not wired.

149. ✅ **Cut, filed, and wired a 10-boat × 8-direction "Scallywags Boat Sprite Library" — 96
    sprites, giving the merchant encounter system its first-ever visible ship** (2026-08-22). The
    user uploaded a new, unrelated reference sheet (10 boat types × 8 compass directions, plus
    example damaged/wrecked/burning variant panels, a size chart, and a colour-palette/art-notes
    strip) with only "these are some boat sprites... use them when boats are sailing" as
    accompanying text. Since the game had never had anything but the player's own Black Pearl
    render as a real sprite before — merchant ships (`src/data/merchants.ts`) were, and had always
    been, an invisible dice-roll trigger with zero on-screen representation — `AskUserQuestion`
    confirmed the scope: cut and file the whole library, then wire it specifically into the
    merchant encounter system rather than stopping at cut-and-file or building a separate ambient
    sea-traffic feature.

    Measured the sheet's real per-row/per-column boundaries rather than trusting its
    computer-generated-looking regularity — confirmed genuinely uneven column widths row to row via
    a "hull-level" content profile (the sail-crowded top of each row wasn't reliable for gap
    detection, but the hull+wake band was). Two boundary defects were caught and fixed before first
    filing: Column 8's window bled into the sheet's own "VIEW GUIDE" compass legend panel for the
    two rows whose y-range overlapped it (fixed by masking the legend's rectangle out of the content
    mask, rather than guessing a column-8 boundary that would also fit the widest Flagship row); and
    a thin gold row-divider line bled into many crops' top/bottom edges.

    That divider-line defect took three real attempts to actually close, and the first attempt
    (committed and filed) still shipped it in 12 of the 80 boats — caught only by an independent
    edge-opacity scan run *after* filing, the same discipline this session applied proactively for
    terrain-extras-4's tree panel but initially skipped here. Root cause had three layers: (1) no
    single fixed-pixel trim value worked for every row — some rows' masts sit close enough to their
    divider that too small a trim left divider color in the crop, while other rows' masts sit *even
    closer*, so the trim big enough to fix the first group clipped real mast-tip content in the
    second; (2) the real fix was a targeted color-signature exclusion (the divider's own gold/bronze
    RGB profile, zeroed out only near row boundaries) instead of a blind trim; (3) even with that
    exclusion working, `crop_rgba`'s `pad` parameter was independently re-including the divider by
    recomputing alpha on the un-excluded padded region around the already-correct tight
    `content_bbox` — `pad=0` was the piece that actually closed it. Two rows (Small Sloop, Cutter)
    still needed a small additional trim on top of everything else, accepted as genuine source-art
    tightness (their masts are close enough to the divider that a couple of anti-aliased fringe
    pixels don't cleanly match the color-exclusion formula) — same category of call as Row 6's
    slightly-flat mast finials, and documented as such rather than chased further. Verified this
    time with a systematic top/bottom-edge opacity scan across all 80 final files (zero remaining
    false-edge hits) plus a full 10-row contact-sheet re-check, then re-filed over the original 80
    filenames. `BOAT_LIBRARY_MANIFEST.md` documents the full three-layer root cause for the next
    time this bug class shows up on a new sheet.

    Wired 4 of the 10 boat types into the merchant encounter system by thematic fit against each
    template's cargo (`fishing_trawler`→Fishing Boat, `timber_galleon`→Large Merchant Ship,
    `rum_runner`→Cutter, `powder_hulk`→Brigantine): `triggerMerchant` now shows the matched boat
    sailing across the Black Pearl's path — offset to one side using a heading perpendicular to the
    player's own, opposite her facing so it reads as a real second vessel crossing paths rather
    than a costume swap — for the same `STOP_SKID_ANIMATION_MS` beat the ship's existing
    intercept-flash already held, before cutting to the encounter. Confirmed in a real headless
    Chromium run against the dev server (Playwright driving the actual web build, not a unit test):
    boarded the Black Pearl via the Debug screen's Instant-Capture/Board shortcuts, forced every
    ambush/encounter dice roll into the merchant bucket via a runtime `Math.random` override (no
    source files touched), sailed into open sea, and burst-captured screenshots through the
    triggering tick — one frame caught the flash directly, showing the Black Pearl and a small
    Fishing Boat both rendered with independent wake ripples, correctly offset from each other.
    `merchantShipSpriteSource`/`oppositeHeading` added to `shipSprites.ts`; the other 6 boat types
    and all 16 damaged/wrecked/burning variants are cut and filed but not wired to anything yet —
    flagged in `DELIVERY_LOG.md`. `npx tsc --noEmit` and all 45 `jest` tests clean.

151. ✅ **Cut, filed, and wired a real 8-directional walk cycle for Captain Scally, replacing the
    old 4-cardinal-only one** (2026-08-22). The user uploaded a "Captain Scally — Walk Animations (8
    Directions)" reference sheet with just "These are the new walking sprites for scallys walk" —
    understood as an upgrade to the existing walk cycle (which only had down/left/right/up, 5 frames
    each, from an earlier, different source sheet) rather than a side-by-side addition, since the
    sheet delivers full sustained walk cycles for every compass direction and there's no sensible
    reading of "new walking sprites for Scally's walk" that leaves most of them unused. Proceeded
    without an `AskUserQuestion` this time (unlike item 149's boat library) — the destination was
    judged unambiguous enough not to need it.

    The sheet has no real alpha channel despite looking like a transparent checkerboard —
    `Image.open().mode` came back `RGB`, the checkerboard is a baked-in flat near-white pattern.
    Cut via chroma-key against `(250,250,250)` instead (same category of fix as `shipSprites.ts`'s
    own no-real-alpha source sheet). The sheet's own printed frame-number labels had gaps in every
    row (e.g. South showed "1,2,3,4,6,8"), which turned out to accurately describe genuinely uneven
    real per-direction frame counts (6 or 7, never a flat 8 despite the sheet's own title) —
    confirmed by direct pixel/column measurement rather than trusting the labels, the same
    discipline items 145–148 already established. Cut cleanly on the first attempt: all 8
    per-direction column-run assertions passed immediately, and the systematic edge-opacity scan
    that caught real defects in both of the prior two deliveries (item 148's tree-panel border-line
    bug, item 149's boat-library row dividers) came back with zero hits here.

    Filed 53 sprites into `assets/sprites/scally/` under compass-letter keys
    (`walk_s/se/e/ne/n/nw/w/sw_*.png`, matching `ShipHeading`'s naming) — **replacing**, not
    supplementing, the old `walk_down/left/right/up_0..4.png` (deleted; this sheet's own
    South/East/North/West columns are strictly better replacements with more frames and matching
    style to the new diagonals). The existing 3-frame idle breathing loop was kept and renamed to
    match (`idle_down/left/right/up` → `idle_s/e/n/w`) — no diagonal idle art exists on this sheet,
    so `se`/`ne`/`nw`/`sw` idle poses fall back to a held static frame (that direction's own first
    walk frame) instead of forcing a breathing loop that was never drawn.

    Wired directly into `scallySprites.ts` and `MapScreen.tsx`:
    - `FacingDirection` expanded from the old 4-value type to the full 8-value compass type,
      matching `shipSprites.ts`'s `ShipHeading` exactly.
    - `MapScreen.tsx`'s pan-gesture direction bucketing — previously its own bespoke 4-way
      `DIRECTION_HYSTERESIS` axis-dominance logic, explicitly written to avoid diagonal flicker in
      the old 4-direction-only world — was replaced with a direct call to `headingFromVector`, the
      same function that already buckets the Black Pearl's own `shipHeading` from the identical drag
      vector in the same handler. The two systems now literally share one bucketing call.
    - The old `turnFrameFor`/`TurnFrame`/`TURN_FRAME_BY_PAIR` mid-pivot-flash system (a workaround,
      from a third, still-earlier source sheet, for the 4-cardinal walk cycle having no diagonal art
      of its own) was removed entirely — real sustained diagonal walk art makes a momentary pivot
      flash both redundant and visually mismatched with the new art's own diagonal stance. Its
      `turn_se/ne/nw/sw.png` source files were deleted along with the old cardinal walk files they
      were cut alongside.
    - The side-view run cycle (`isRunning`/`RUN_SOURCES`, a single pose set with no directional
      variants) is now gated on `facingDir === 'w' || facingDir === 'e'` in place of the old
      `'left'`/`'right'` check — the other 6 headings, including all 4 new diagonals, keep the plain
      walk cycle rather than sprinting at an angle the pose doesn't depict.

    Verified in a real headless-Chromium run against the dev server (not a unit test): dragged
    through all 8 compass directions in turn, screenshotting mid-stride and post-release for each —
    every direction showed visibly distinct, correctly-oriented art (back view due north, front view
    due south, side views due east/west, correct 3/4 poses on all four diagonals), the 4 cardinal
    idle poses held their real breathing loop, the 4 diagonal idle poses held their static fallback
    frame as designed, and 0 console errors were logged throughout. `npx tsc --noEmit` and all 45
    `jest` tests clean. `SCALLY_WALK_8DIR_MANIFEST.md` and `DELIVERY_LOG.md` written/updated.

152. ✅ **Cut, filed, and wired a 10-animation "Captain Scally — Idle Animations" reference sheet —
    73 sprites, upgrading the south breathing loop and replacing the old single-pose flourish
    system with real multi-frame animated vignettes** (2026-08-22). The user's message was just "I
    have some idle animations" — no explicit integration instruction, same terseness as item 151's
    walk sheet, but the destination was judged unambiguous enough not to need an `AskUserQuestion`:
    the sheet's 10 panels map cleanly onto the two idle-adjacent systems already in the game
    (`IDLE_SOURCES`' breathing loop and `IDLE_FLOURISH_POOL`'s "prolonged idle after standing still"
    mechanism), and there's no other sensible place for "idle animations" to go.

    This sheet turned out to be **auto-laid-out per panel rather than a rigid shared grid** — the
    single fact behind every real defect found. Each of the 10 panels' title/content/label bands
    sit at their own tight offset from that panel's own content height, not a shared absolute
    row-group y-position the way earlier terrain/boat sheets' rows did. Real per-panel frame counts
    (7 or 8, gapped in the sheet's own printed labels — the same lesson item 151 already applied,
    reapplied here) needed a hybrid cutting approach: gap-based column detection first (as usual),
    falling back to an even-pitch split of the panel's total content width when a raised limb, a
    floating prop, or tight spacing made gap detection merge or over-split frames — 6 of the 10
    panels cut cleanly with gap detection alone, the other 4 needed the pitch fallback.

    The auto-layout discovery itself came from chasing down two real defects this delivery's own
    verification caught before filing: **panel title text baked into the top of every frame in 3
    panels** (Sitting on Barrel, Scratch Head/Thinking, Fishing) from a shared row-group y-window
    that was a few pixels too high for those particular panels' own title height, and **frame-number
    labels baked into the bottom of every frame in 1 panel** (Bored/Boot Kick) from assuming it
    shared its row-group partner's (Sitting on Barrel's) content-bottom boundary, when in fact the
    two panels' real content-bottom/label-start rows differ by close to 20px. Both fixed by
    measuring each of the 10 panels' own boundaries independently via direct row-pixel-density
    profiling (not assumed from a neighboring panel), then re-cut and re-verified. A systematic
    edge-opacity scan across all 73 final files found only 2 remaining hits, both confirmed correct
    on inspection (the Fishing rod's line legitimately touching its own tight bounding box edge in
    2 frames — real content, same call as the boat library's mast-tip edges).

    Filed into `assets/sprites/scally/`: panel 1 (Breathing) → `idle_breathing_0..6.png`, the other
    9 → `idle_flourish_<name>_N.png`. Wired:
    - South's idle breathing loop upgraded from the original 3-frame cut to this sheet's real
      7-frame loop (same pose family — a strict art upgrade). East/north/west keep their original
      3-frame art unchanged; this sheet only drew breathing for the front-facing view.
    - The old 4-item `IDLE_FLOURISH_POOL` (single static frames — a fist-pump cheer, a chin-scratch
      think, a laugh, a seated pose, cut from a third, earlier "Animated Idle / Emotes" sheet) was
      replaced entirely by `IDLE_FLOURISHES`, 9 full multi-frame animated vignettes. The old pool's
      source files (`emote_cheer/think/laugh/sit.png`) were deleted — 3 of the 9 new flourishes are
      direct richer successors of ideas the old pool already had (Bored/Boot Kick, Sitting on
      Barrel, Hat Tip/Grin), so keeping both would have left the old ones as strictly worse
      duplicates of the same idea.
    - `MapScreen.tsx` gained real per-flourish frame cycling (a new interval at
      `IDLE_FLOURISH_FRAME_MS`, 150ms/frame) where the old system only ever held one static image —
      the same general pattern the walk cycle's own frame-cycling interval already used, applied to
      a second animated system. `IDLE_FLOURISH_HOLD_MS` raised from 2200ms to 2400ms so the longest
      (8-frame) flourish gets roughly two full loops before cutting back to the breathing loop.
      Render priority: attack/sword-ready flash, then any single-frame emote (door greeting/victory
      — a real story moment), then the flourish, then the run cycle, then plain walk/idle — emotes
      sit above the flourish deliberately, so a greeting or a win can always interrupt idle boredom
      and not the other way around.

    Verified in a real headless-Chromium run against the dev server: standing still long enough
    triggered a real animated flourish in every run, two separate runs picked two different
    flourishes at random (Hat Tip/Grin, then Fishing — confirming the random pick works, not just
    that *a* flourish shows), and a fine-grained capture during one flourish showed genuine
    frame-by-frame motion (the fishing rod visibly moving, the bobber appearing and disappearing
    across consecutive 150ms-apart screenshots) before cleanly returning to the plain breathing
    loop, 0 console errors throughout. `npx tsc --noEmit` and all 45 `jest` tests clean.
    `SCALLY_IDLE_ANIMATIONS_MANIFEST.md` and `DELIVERY_LOG.md` written/updated.

153. ✅ **Fixed a real walk-cycle bug in item 151's 8-directional walk cycle: the torso wobbled
    left/right every frame, masking the legs' real alternating stride** (2026-08-22). Reported by
    the user after testing the deployed build themselves: "the walk seems to be off still, only one
    leg goes in front of the other, and we don't alternate which foot goes forward." This was the
    first bug this session caught only after the user's own hands-on testing, not by this session's
    own verification screenshots — worth noting since it's exactly the failure mode automated
    contact-sheet review is weak at (each frame looked like a plausible walking pose in isolation;
    the defect only shows up as *motion*, comparing consecutive frames against each other, which a
    burst of static screenshots doesn't naturally invite scrutinizing that way).

    Root cause, confirmed by inspecting the shipped files directly: item 151's cut tight-cropped
    every walk frame independently to its own content bounding box (`content_bbox` per frame — the
    same method every other delivery this session used without issue). For a walk cycle specifically
    this is wrong, because a stepping pose's legs splay asymmetrically — whichever leg is forward
    pushes that frame's silhouette wider on one side — so each frame's tight bbox ends up a
    different width with a different center relative to the character's actual spine
    (`walk_s_0..5.png` measured 95–98px wide, no two the same). `resizeMode="contain"` then centers
    each differently-shaped crop independently, which visibly shifts the whole torso side to side
    frame to frame. That wobble was large enough to read as "the same leg always forward" — the
    torso sliding toward whichever side had more silhouette canceled out the actual leg-crossing
    motion in the viewer's perception, rather than producing an obviously-broken image.

    Fix: re-cut every direction from the original source sheet using one shared, uniform canvas per
    direction instead of an independent tight crop per frame. Each frame's own column slice (from
    the original gap-detected cut) has a natural, pose-independent anchor — the slice's own
    midpoint, which sits between one frame's content and the next regardless of that particular
    pose's silhouette. Re-measured each frame's tight content bbox relative to *that* anchor instead
    of re-centering on itself, took the max left/right/top/bottom extent needed across all frames of
    a direction, and cropped every frame into that same fixed per-direction canvas at the same
    anchor point. Every frame in a direction is now pixel-identical in size (e.g. all 6 south frames
    are exactly 100×146). Diagonal idle's static fallback (`WALK_SOURCES[dir][0]`) picked up the fix
    automatically since it just reads the corrected files — no code change needed there.

    Verified by zooming into the feet region of consecutive frames directly against a fixed
    reference guideline (confirmed genuine alternating stagger on both `s` and `e`, where the first
    fix attempt had shown a static-looking same-leg-forward silhouette) and by a fresh in-browser
    capture showing the torso holding a fixed screen position through a full walk burst with 0
    console errors. `npx tsc --noEmit` and all 45 `jest` tests clean (art-only fix, no source code
    touched). `SCALLY_WALK_8DIR_MANIFEST.md` updated with the full root-cause writeup. Re-exported
    the static web build and re-published to the `gh-pages` branch (see the "Playable deploy"
    section of this doc for that process) so the live build at
    https://joeeaton11.github.io/Pirate-game/ has the fix.

154. ✅ **Replaced Scally's walk cycle a third time** (2026-08-22) — `scally_walk12_source.png`, a
    12-frame-per-direction sheet the user hand-specified after item 153's fix (torso stability) still
    left a deeper problem: item 151/153's art itself never let the trailing leg take a turn leading,
    so the stride read as a shuffle rather than a walk ("only one leg goes in front of the other" /
    "it's always the furthest foot from us that is first"). Two follow-up candidate sheets (a 7-frame
    "v2" and this 12-frame one) were evaluated against the user's own explicit test before either was
    cut for real: track each frame's boot positions and confirm the *identity* of the leading leg
    swaps partway through the cycle rather than one leg always occupying the "forward" role. The
    7-frame sheet failed this test outright (visible near/far occlusion asymmetry, one leg
    permanently tucked); this 12-frame sheet is the one that got cut and wired, but it does **not**
    fully pass either — see the East-direction verification note below. It was still filed because it
    fixes the torso-wobble and even-frame-count issues cleanly and is a clear net improvement, and the
    user asked to see it running in the actual game rather than judge it from static contact sheets
    alone.

    Same measurement discipline as every prior delivery — didn't trust the sheet's own printed labels
    (`1`-`12` per direction). Each direction's row turned out to hold a compass-name label plaque
    (`"SOUTH ↓"` etc., its own extra column) followed by 13 real character columns, not 12 — the 13th
    confirmed a loop-closing duplicate of column 1 by direct visual comparison (South and East both
    checked). Cut using columns 1–12 only, with the same uniform-per-direction-canvas anchoring
    technique item 153 established (anchor each frame to its own gap-detected slice midpoint, size
    the canvas to the max extent needed across the direction's 12 frames, crop every frame into that
    shared canvas). Result: all 96 frames land within 1–2px of their direction's canvas size (vs.
    item 151's 95–98px unconstrained spread), zero edge-opacity defects on the systematic scan. All 8
    directions now share a flat 12-frame count — first time this walk cycle hasn't had uneven
    per-direction counts. Sheet has a genuine alpha channel (no chroma-key guessing needed, unlike
    every earlier walk/idle sheet this session).

    **Honest verification finding, East direction:** tracked the two boot blobs' x-position across
    all 12 East frames directly against the source art (not the crop). The back-boot cluster never
    exceeded x≈36 and the front-boot cluster never dropped below x≈79 (in a ~120px-wide frame) in any
    of the 12 frames — the two legs approach each other at the passing poses (frames 4/8) but never
    actually cross paths. One physical leg is locked into "always leading," the other into "always
    trailing," for the whole cycle — the same root defect as the two prior candidate sheets, just
    harder to spot by eye here since both boots stay similarly sized (no strong near/far occlusion
    difference to make it look obviously wrong at a glance). South was spot-checked visually only
    (facing-camera stepping motion looks like genuine alternating left-right steps) but not put
    through the same quantitative boot-tracking check the East finding is based on.
    **Not yet re-verified against a 4th sheet** — reported to the user with the specific fix language
    to hand ChatGPT next time ("the two legs must actually cross paths at the midpoint of the stride —
    the leg trailing in frame 1 must be the leading leg by frame 7 of a 12-frame loop, not just swing
    back and forth around two fixed positions").

    Wiring: `scallySprites.ts`'s `WALK_SOURCES` now holds 12 frames per direction (was 6/7, uneven);
    `WALK_FRAME_COUNT` raised from 7 to 12. `MapScreen.tsx`'s walk-frame interval was already 110ms
    (~9fps) from the user's own explicit request earlier in this thread ("a slightly slower,
    deliberate pirate strut... will probably read better than a rapid little leg blur") — left
    unchanged, just updated stale comments referencing the old 5/6/7-frame counts. `npx tsc --noEmit`
    and all 45 `jest` tests clean (art + comment changes only). Verified in a real headless-Chromium
    run against the dev server: dragged due east, captured a burst of screenshots at the walk
    interval's own cadence, cropped Scally out of each and confirmed the sprite genuinely advances
    frame-to-frame with a stable torso position and 0 console errors — same in-game rendering
    checklist as items 151/153, just not yet re-run against the East-direction leg-alternation defect
    documented above (that failure only shows up in a frame-by-frame pixel measurement, not a visual
    render check). `SCALLY_WALK_8DIR_MANIFEST.md` updated. Re-exported the static web build and
    re-published to `gh-pages` (see "Playable Deploy" section) so
    https://joeeaton11.github.io/Pirate-game/ has this cut for the user to judge directly.

155. ✅ **East direction's leg-alternation defect finally fixed — 4th-generation source, one
    direction only** (2026-08-22). After item 154 shipped with the defect still present, the user
    asked what to actually change rather than retry the same prompt again. Two real insights came out
    of that conversation, both from the user: (1) since ChatGPT draws each frame independently with
    no rig/skeleton, a fully symmetric character gives it nothing to track leg identity against
    frame-to-frame — it was effectively guessing "generic walk pose" each time rather than
    consciously alternating; (2) giving each boot a permanent outside-ankle detail (a gold buckle,
    same on both boots, mirrored) would give both the generator and this session's own verification a
    fixed anchor to check against, without inventing an asymmetric left/right boot backstory. That
    became the core of the next ChatGPT prompt: an explicit frame-by-frame leg-role script ("leg A
    forward in frame 1, leg B forward by frame 4, back to leg A by frame 7...") plus a request for
    ChatGPT to describe back which leg would be forward in each of the 12 frames before rendering.

    The user sent back a new East-only sheet (`assets/brand/scally_walk_e_v4_source.png`) and asked
    to "add it to the build" directly. Verified the fix genuinely landed before wiring it, same
    discipline as every other delivery: measured the sheet's real structure first (12 real columns
    this time, no label plaque, no duplicate 13th frame — the "no baked-in labels, no duplicate
    closing frame" ask from the prompt was honored), then did a direct pixel comparison of frame 1
    against frame 7 (the two clearest "one leg planted forward, other leg raised back" poses, exactly
    six frames — half the loop — apart). The gold buckle sits on the **front** boot in frame 1 and
    the **back** boot in frame 7. Since both boots carry an identical buckle, that can only mean the
    two legs actually swapped which one leads at the cycle's midpoint — the specific mechanical
    failure that sank all three prior sheets (items 151/153's original cut, the unwired "v2" 7-frame
    candidate, and item 154's 12-frame sheet). This is the first sheet this whole saga that passes
    that test.

    Cut with the same uniform-per-direction-canvas technique as every walk-cycle delivery since item
    153 (anchor each frame to its own gap-detected slice midpoint, size the shared canvas to the
    biggest extent needed across the 12 frames). One new wrinkle: this source sheet was drawn at
    roughly 2.2x the scale of the other 7 directions' 3rd-generation sheet, so after cutting, all 12
    frames were resized down (Lanczos resampling) to match the other directions' ~117px standing
    height — otherwise Scally would visibly grow when facing east and shrink when turning away from
    it. Zero edge-opacity defects, all 12 output frames land at an identical 67×117.

    **Only the East direction was replaced.** The other 7 directions (`s`/`se`/`ne`/`n`/`nw`/`w`/`sw`)
    are still on item 154's 3rd-generation sheet and still carry the unresolved leg-alternation
    defect — this was a single-direction proof sheet, not a full 8-direction redo, and the user said
    so up front. No `scallySprites.ts` code changes were needed beyond a doc-comment update — the
    file names (`walk_e_0.png`...`walk_e_11.png`) are unchanged, only their pixel content was
    replaced, the same pattern as item 153's torso-wobble fix.

    Verified in a real headless-Chromium run: `npx tsc --noEmit` and all 45 `jest` tests clean, no
    console errors, dragged due east and confirmed the sprite renders at the expected size next to
    the other directions and cycles cleanly frame-to-frame. Re-exported the static web build and
    re-published to `gh-pages` so https://joeeaton11.github.io/Pirate-game/ has this East-direction
    fix live. Next step, if the user likes how East reads in motion: regenerate the other 7 directions
    with the same buckle-marker + explicit-leg-role-script prompt approach.

156. ✅ **West direction fixed for free by mirroring item 155's East fix — no new art generated**
    (2026-08-22). The user asked whether the newly-fixed East cycle could just be flipped for West
    instead of running a whole separate ChatGPT round. It's a pure side-profile view, so a horizontal
    flip is the standard trick basically every 2D game uses to get its reverse-facing sprite for
    free: the gait is symmetric under a left-right mirror (a valid rightward stride flipped is a
    valid leftward stride, frame-for-frame, no reordering needed), and because item 155's ankle
    buckle was deliberately put on the *outside of both* boots rather than as an asymmetric
    single-boot marker, the mirror can't misplace it onto the wrong foot or create a left/right
    inconsistency.

    Flipped all 12 of the corrected `walk_e_*.png` files (`Image.FLIP_LEFT_RIGHT`) straight into
    `walk_w_0.png`..`walk_w_11.png`, replacing the old 3rd-generation West art. Checked the result
    directly for the two things a naive mirror can get wrong — none found: hair/bandana still trails
    correctly behind the now-leftward-facing head (it's flipped along with everything else in the
    frame, not left dangling on the wrong side), and the boot buckle still reads as "outside ankle"
    on both feet rather than jumping to the inside. All 12 frames land at the identical 67×117 (same
    canvas size as the East cut, since it's the same pixels mirrored), zero edge-opacity defects.

    `npx tsc --noEmit` and all 45 `jest` tests clean (art-only change, `scallySprites.ts` only got a
    doc-comment update — `WALK_SOURCES.w` already pointed at these exact filenames). Verified in a
    real headless-Chromium run: dragged due west, confirmed the sprite renders at the correct size
    and orientation and cycles cleanly with 0 console errors. Re-exported and re-published to
    `gh-pages`. East and West are now both fixed; `s`/`se`/`ne`/`n`/`nw`/`sw` are still on the
    3rd-generation sheet with the unresolved leg-alternation defect. North and South are pure
    front/back views (not profile), so this mirror trick doesn't apply to them the same way — they'll
    need their own regeneration pass with the buckle-marker + explicit-leg-role-script prompt whenever
    the user wants to tackle the remaining 6 directions.

157. ✅ **Fixed a real bug: Scally intermittently vanishing mid-stride while moving, then popping
    back** (2026-08-23). Reported by the user as "Scally keeps ghosting a[nd] goes missing when he
    moves. Then stutters back into shot." — a real, reproducible rendering bug, unrelated to any of
    the walk-cycle art work above (confirmed it happened identically on South, which hadn't been
    touched, ruling out the newly-replaced east/west frames as the cause).

    Reproduced for real (not just taken on the user's word) in a headless-Chromium run: captured a
    screenshot every 40ms during a walk burst and found the entire player marker — sprite AND the
    ring beneath it, not just the image — completely blank on 2-4 frames out of every 40 sampled.
    Ruled out "browser hasn't cached this image yet" as the cause with a second test: warmed the
    cache with 4+ seconds of walking first (well over 3 full 12-frame loops, so every frame image had
    already been shown and decoded), then re-sampled — the blanks still happened, at different points
    in the cycle, proving it wasn't a first-load latency issue.

    Root cause: MapScreen rendered Captain Scally as a single `<Image>` and swapped its `source` prop
    every 110ms to advance the walk/idle/run/flourish cycle. On the web, changing an `<img>`'s `src`
    forces the browser to decode the new bitmap from scratch even if that exact image was shown
    seconds ago (the browser doesn't keep a persistent decoded-bitmap cache keyed by src the way this
    render assumed) — at a ~9fps swap rate that decode can occasionally miss a paint, showing nothing
    for a tick. This is a known class of bug with animating via `<img>` src-swapping rather than
    pre-mounted frames; it wasn't specific to Scally's art, the walk cycle, or anything else this
    session touched — the single-Image-swap pattern itself was the bug, and had been since whichever
    session first wired the walk cycle this way.

    Fix, in two parts:
    1. **Stopped swapping a single Image's source.** MapScreen now renders every frame of whichever
       cycle is currently active (walk, idle breathing, run, or an idle flourish — attack-flash and
       emote overlays too, trivially, as 1-frame "cycles") as separate, permanently-mounted `<Image>`
       elements stacked exactly on top of each other, and switches between them by toggling `opacity`
       (1 for the active frame, 0 for the rest) instead of changing which image is shown. Toggling
       opacity on an already-decoded, already-painted image is a GPU-composited operation with no
       decode step, so there's no window where nothing is drawn. Added `scallySpriteFrames()` and
       exported `RUN_SOURCES` to `scallySprites.ts` so MapScreen can get the raw frame array instead
       of just a single picked frame.
    2. **Preloaded every direction's frames up front.** A second, invisible (0×0, `pointerEvents:
       'none'`) block mounts every walk/idle/run/flourish frame for *all* 8 directions the moment the
       player marker exists — not nested inside the land/sea branch, so boarding or disembarking the
       ship never unmounts it — via a new `ALL_SCALLY_MAP_FRAMES` export (a flattened list of every
       frame image Scally's map sprite can ever show). This means even a fresh direction change never
       re-triggers the original first-time-decode risk, on top of the opacity-stack fix already
       covering the steady-state cycling case.

    Verified with the exact same reproduction method that caught the bug: re-ran the 40-shot,
    40ms-interval capture on a fresh page load for both East and South after the fix — 0 blank frames
    across 80 total samples, versus a reliable 2-4 blanks per 40 before. `npx tsc --noEmit` and all
    45 `jest` tests clean. Re-exported and re-published to `gh-pages`.

158. ✅ **Fixed the walk cycle reading as "skipping" once the ghosting fix above made the underlying
    motion actually visible** (2026-08-23). The user's own framing: "It now looks like he is
    skipping rather than hopping. Which is better." — real progress, not the same bug, but still off.

    Diagnosed by reading the animation timing code rather than trying to eyeball it (screenshot
    round-trips in this sandbox are too slow — several hundred ms each — to sample a sub-second
    bounce cycle reliably). Found two independent, un-synchronized clocks driving the same character:
    the leg-swing frames advanced every 110ms (12 frames = 1,320ms per stride loop), while the
    vertical body "bounce" ran as its own free-running `Animated.loop` — a fixed 160ms-up/160ms-down,
    320ms cycle — with zero connection to which leg frame was actually showing. Those two periods are
    close (four bounce cycles fit *almost* exactly into one stride loop) but not locked, so they
    drifted in and out of phase continuously: sometimes the body dipped right as a foot planted
    (reads as a normal step), sometimes the dip landed mid-swing with no foot down (reads as a
    hop/skip). That slow "beat" between two near-but-not-quite-matched clocks — not a fixed timing
    error — is exactly the kind of thing that would read as *inconsistent* skipping rather than a
    clean repeating gait, matching the report.

    Fix: merged the frame-cycling and bounce-driving effects into one, sharing a single
    `setInterval`. The bounce target is now computed directly from the same tick that advances the
    leg frame — two full up/down cycles per 12-frame stride loop (contact/0 at tick%12 = 0 and 6,
    peak at tick%12 = 3 and 9), animated toward that per-tick target with a duration matched to the
    tick interval. Since both come from the same callback, they can never drift apart again, however
    long the loop runs — this replaces "happens to be close" with "is the same number."

    Caught and fixed a second bug along the way, while merging: `walkSpriteFrame` used to be
    pre-wrapped to 0-11 before the run cycle's render-time `% RUN_SOURCES.length` (5) wrapped it a
    second time — since 12 isn't a multiple of 5, that double-wrap produced a visible stutter at the
    loop seam (frames 0,1,0,1 back-to-back right as the outer 12-counter rolled over) instead of a
    clean advancing 0,1,2,3,4,0,1,2,3,4,.... Fixed by making `walkSpriteFrame` a raw counter (wrapped
    at 60, the LCM of 12 and 5, purely to keep the number small without changing either `% 12` or
    `% 5` result) that both the walk and run branches derive their own index from independently, with
    no intermediate wrap. Also had to make the tick counter a `ref` rather than a plain local
    variable inside the effect — the effect legitimately needs to rerun whenever `isRunning` toggles
    mid-walk (to pick up the run-cycle's smaller bounce amplitude), and a local counter would have
    reset to 0 on every one of those reruns, reintroducing the exact "pops to frame 0 on a run
    transition" glitch a previous session's fix (see `scallySprites.ts`'s run-cycle comment)
    deliberately avoided.

    Verified two ways: `npx tsc --noEmit` and all 45 `jest` tests clean, 0 console errors in a fresh
    headless-Chromium walk burst (same repro harness as the ghosting fix, confirming no regression).
    More importantly, empirically confirmed the actual fix — not just trusted the math — by
    temporarily exposing the live `Animated.Value` on `window` in a dev build and polling it during a
    real walk: the sampled bounce trajectory threaded cleanly through every expected waypoint (0 at
    tick%12 = 0 and 6, -6 at tick%12 = 3 and 9, smoothly interpolating between), always redirecting
    from wherever it currently was rather than snapping — exactly the intended phase-locked curve.
    The debug hook was removed once confirmed; it never shipped. Not attempted in this pass: tailoring
    the bounce curve to each direction's *actual* measured contact frames (which vary — East plants at
    1/5/7/11, not evenly every 6 frames) rather than a generic two-contacts-per-loop assumption — a
    possible future refinement, noted but out of scope here since the drift, not the exact shape of
    the curve, was the reported problem. Re-exported and re-published to `gh-pages`.

159. ✅ **Re-audited every idle animation at the user's request ("double check they all work
    properly") and found one real, silent bug** (2026-08-23) — south's upgraded 7-frame breathing
    loop (item 151) had, since the day it was cut, only ever actually shown its first 3 frames.

    Same root-cause shape as item 158's run-cycle stutter, just quieter: `idleSpriteFrame`'s own
    `setInterval` wrapped it with `% IDLE_FRAME_COUNT`, and `IDLE_FRAME_COUNT` was `3` — a leftover
    from before south's breathing loop was upgraded from 3 frames to 7 (see item 151). So the counter
    itself never advanced past 2, and by the time the player-sprite render's own (correct)
    `% frames.length` ran against south's real 7-frame array, it was re-wrapping a value that had
    already been capped at 0-2 — frames 3-6 of the breathing loop were mathematically unreachable.
    `e`/`n`/`w`'s 3-frame idle loops happened to exactly match the old `% 3`, so only south was
    actually broken, and it read as a working (if now-shorter-than-intended) breathing loop rather
    than an obvious glitch — the render itself was never wrong, which is exactly why this one stayed
    hidden through every previous verification pass.

    Fixed the same way as the run-cycle bug: raised `IDLE_FRAME_COUNT` from a (wrong) "frame count"
    to `21`, the LCM of every real idle-frame count this cycle can hit (7 south, 3 cardinals, 1
    diagonal static hold) — a wrap bound, not a claim about how many frames any one loop has. No
    other code changes needed; the render's own per-direction `% frames.length` was already correct.

    Audited everything else idle-related while at it, and confirmed no other bugs:
    - **All frame files present and matching their declared counts** — checked on disk directly
      rather than trusting the data file: 7 breathing, 3 each for e/n/w, and all 9 flourishes
      (7,7,8,7,8,7,8,7,7) exactly matching `IDLE_FLOURISHES` in `scallySprites.ts`.
    - **The idle-flourish frame counter does *not* have the run-cycle's double-wrap bug** — it resets
      to 0 on every new flourish pick and its cycling interval is recreated fresh per flourish (keyed
      on the `idleFlourish` object reference), taking that flourish's own real `.length` directly
      rather than being pre-wrapped against an unrelated constant first.
    - **Cleanup/cancellation logic is sound** — movement resuming clears both the pending flourish
      timer and a currently-showing flourish immediately (with its hold timeout cleared too, no leak);
      nothing here could freeze a stride the way item 79's original bug did.
    - **One design characteristic, not a bug, worth noting**: a flourish only fires once per
      "stopped" period (the trigger effect depends only on `[isMoving]`, so it doesn't re-arm itself
      while already stationary) — standing still for very long stretches shows one flourish, then
      plain breathing forever until the player moves and stops again. Left as-is since it wasn't
      reported as broken and may be a deliberate choice (avoids flourishes firing too often).

    Verified two ways, same discipline as the walk-cycle fixes: `npx tsc --noEmit` and all 45 `jest`
    tests clean, 0 console errors. And empirically, not just by code-reading — temporarily exposed
    `idleSpriteFrame` on `window` and polled it live: confirmed the raw counter now advances past 2
    (0,1,2,3,4,5,6,7,8,9,10,... continuously, wrapping only at 21) where it used to hard-stop at 2,
    which combined with the render's own `% 7` for south means the breathing loop now genuinely
    visits all 7 real frames. Separately polled the flourish frame counter through a full trigger:
    confirmed clean 0→6→0 wraparound for a 7-frame flourish and a hold duration matching
    `IDLE_FLOURISH_HOLD_MS` (2400ms) exactly. Both debug hooks removed once confirmed; neither
    shipped. Re-exported and re-published to `gh-pages`.

160. ✅ **Fixed idle animations visibly shifting position/size frame-to-frame ("Some of the idles
    they aren't in the same frame/position")** (2026-08-23) — a real, measured bug across every idle
    set: breathing and all 9 flourishes (delivered item 151) were each cut with independent
    per-frame tight bounding boxes, no shared canvas — measuring the files on disk directly (not
    trusting the manifest) found real per-frame size swings of 20-30+ px in most flourishes (e.g.
    `idle_flourish_sitting_barrel` ranged from 71×141 to 107×145). Under `resizeMode="contain"`,
    React Native centers/scales each image independently within its box, so differently-sized
    source frames get recentered differently on every swap — reads exactly as the reported
    "not in the same frame/position" jitter. `idle_e/n/w` (item 183's cardinal idles, a separate,
    earlier delivery) had the same defect at smaller scale (2-6px).

    Fix followed the uniform-per-set-canvas technique established for the walk-cycle torso-wobble
    fix (item 153): re-measured `assets/brand/scally_idle_animations_source.png` from scratch (chroma
    + darkness background mask, since this sheet's checkerboard background isn't a flat color — a
    naive distance-from-white threshold falsely flagged nearly the whole sheet as "content" because
    the checkerboard's darker square is far enough from pure white to cross a low threshold; fixed by
    keying on `chroma = max(R,G,B)-min(R,G,B)` and `darkness = 255-max(R,G,B)` instead, both ≈0 for
    any neutral-gray checkerboard shade), then re-cut every one of the 73 breathing/flourish frames
    into one shared canvas per animation, anchored on each frame's own gap-detected column-slice
    midpoint (stable, pose-independent) rather than its own silhouette center. 7 of 10 panels'
    frame columns came out clean from gap detection; 3 (`bored_boot_kick`, `fishing`,
    `sleeping_snoring`) had frames close/connected enough (a raised boot, a fishing line, a sprawled
    sleeping pose) that gap detection merged adjacent frames, so those fell back to an even-pitch
    split of the panel's measured content span, same fallback rule the original item 151 delivery
    used. Caught one more real defect while re-measuring `juggling_coins`'s content y-window: the
    original delivery's boundary sat 1-2px inside the panel's own title text, baking a faint dashed
    strip into every re-cut frame until caught by inspecting an actual zoomed-in output file (not
    just a thumbnail contact sheet) and re-measuring the true title/content gap.

    `idle_e/n/w` got the same uniform-canvas treatment as a post-hoc pass directly on the existing
    on-disk files (no shared source-sheet slice survives for these — they're a separate, older
    delivery) — each direction's 3 frames padded out to that direction's own shared max canvas,
    anchored on bbox-center-x + bottom (feet), since these are subtle breathing loops where the pose
    barely shifts frame to frame.

    All 82 files (73 breathing/flourish + 9 cardinal) filed under their existing filenames — no
    `scallySprites.ts` or `MapScreen.tsx` changes needed, since frame counts and paths are unchanged.
    Ran the systematic edge-opacity defect scan (`(edge_alpha > 200).mean() > 0.5` on all 4 borders)
    across all 82 outputs before filing: zero hits. Built a checkerboard-background contact sheet per
    animation and visually reviewed every one (all 10 idle-animations-sheet panels plus e/n/w) before
    filing, not just after — same discipline as every prior delivery this session.

    Verified two ways: `npx tsc --noEmit` and all 45 `jest` tests clean. And empirically, live against
    the dev server via Playwright — tracked the *actual rendered* bounding box (not just file
    dimensions) of whichever stacked-opacity sprite frame was currently visible, sampled every 120ms
    across a full breathing loop, a full randomly-triggered flourish (`juggling_coins`), and all three
    cardinal directions (dragged the character west/north/east and let it settle into each idle) —
    every single sample across ~90 frame changes landed at the exact same `{x, y, w, h}` in the
    browser, confirming the jump is actually gone on screen, not just in the source files. 0 console
    errors throughout. Re-exported and re-published to `gh-pages`.

    **Missed one: the Fishing flourish itself was still broken** (not caught by the position-
    consistency checks above, because it isn't a position bug). User reported it directly right
    after this shipped ("The finding [fishing] idle is still not correct").

161. ✅ **Fixed the Fishing flourish flashing body-less every other frame** (2026-08-23) — a real
    content bug in how item 160 (and the original item 151 delivery before it) read this specific
    panel. The sheet's own printed labels say 8 frames, and item 151's original cut, and item 160's
    re-cut, both trusted that and cut 8 slices. But the sheet **only actually draws 7 distinct
    character poses** in this row — real connected-component analysis (chroma+darkness mask, no
    size filter this time, just plain connected-component labeling across the whole row) finds
    exactly 7 blobs of ~5,000-6,300px each, each one already a complete body+rod+bobber as a single
    connected shape. The printed "8" column has no body in it at all — it's just the tail end of
    frame 7's own long rod and bobber, swinging further out than any other frame's (confirmed by
    directly viewing a tight zoomed crop of that exact region: one character labeled "7", nothing
    but rod and bobber under the "8" label). Splitting this into 8 even-pitch slices (the fallback
    item 160 used, since gap detection had merged it into 1 giant run) cut frame 7's body away from
    part of its own rod/bobber, alternating full-body and rod-only-no-body results across the loop —
    a real, visible "Scally vanishes" flash every other frame, not a position/size artifact, which
    is why the position-consistency verification in item 160 didn't catch it (a missing body still
    reports a perfectly consistent `{x, y, w, h}` for whatever *is* there).

    Fixed by dropping the assumption entirely and using the 7 real connected-component boxes
    directly as the frame boundaries (each one already spans a full body plus its own complete rod
    and bobber, so no fallback splitting was needed once the true count was recognized). Deleted
    `idle_flourish_fishing_7.png` and changed `IDLE_FLOURISHES`'s fishing entry in
    `scallySprites.ts` from 8 frames to the real 7 — the flourish frame counter already derives its
    own `.length` per-flourish independently (confirmed sound in item 159's audit), so no other code
    change was needed.

    Verified two ways: `npx tsc --noEmit` and all 45 `jest` tests clean, zero edge-opacity defects on
    the 7 re-cut files. And empirically, live against the dev server — temporarily forced the random
    flourish picker to always choose Fishing (a one-line override, reverted before committing, same
    disposable-debug-hook discipline as every other empirical check this session) and tracked the
    actual rendered frame across a full trigger: clean `0,1,2,3,4,5,6` cycling with no missing index,
    a body present in the screenshot, then a clean return to breathing after
    `IDLE_FLOURISH_HOLD_MS`. 0 console errors. Re-exported and re-published to `gh-pages`.

    **Lesson for the rest of this delivery**: a printed frame-number label on a reference sheet is a
    claim about intended frame count, not a guarantee every one of those slots actually has content —
    this is a different failure mode than the "even-pitch fallback chosen when gap detection merges
    frames" case documented in the original delivery manifest, and worth checking for specifically
    (does every candidate slot contain a real character silhouette, not just *some* real pixels) on
    any future sheet that mixes character content with long/thin appendages like a rod, whip, or
    rope that can visually bridge into a neighboring slot's territory.

162. ✅ **Cut a new tropical-island tileset sheet into 127 sprites + 1 background** (2026-08-23),
    at the user's request ("Cut the sheet into assets for the game scene and environments") — see
    `assets/sprites/TROPICAL_ISLAND_MANIFEST.md` for the full breakdown.

    **Real defect found before cutting could even start**: the uploaded sheet's own alpha channel
    was corrupted across the whole image — not just at edges. Sampling supposedly-empty background
    regions found wild per-pixel noise in both alpha (0-252 within the same small patch) and RGB,
    and content regions that should read as a flat, fully opaque color instead showed broad blotchy
    patches of partial transparency. Composited over a light background this read as pink/red/cyan
    "tint" washes in specific spots (a pink cast over the top-left tiles, a red halo around a crab
    cluster, cyan near the dock) — but direct pixel sampling confirmed the underlying RGB hue was
    basically correct in those spots; only alpha was corrupted, almost certainly a lossy re-encode
    artifact rather than intentional art. Fixed by discarding the file's own alpha channel entirely
    and re-deriving a clean one: a 5×5 median filter (kills the high-frequency noise while
    preserving real silhouette edges — verified by comparing the filtered alpha's edge ramp against
    the raw channel's on a known-clean tree silhouette, identical) thresholded at 128, one 3×3
    binary-opening pass to clear residual speckle, then connected-component labeling on the result.
    A tree's trunk-to-crown connectivity was specifically checked and confirmed intact (opening a
    3×3 structure doesn't erase content that thin) before trusting the pipeline at full scale.

    Real per-item connected-component detection across the whole 1536×1024 sheet (no assumed grid,
    even for the obviously-grid-shaped left half — confirmed necessary since one nominal "grid
    cell" turned out to actually hold a multi-piece loose dock-plank cluster, not one tile) found
    128 real components. Every one visually reviewed via 4 labeled contact-sheet grids before
    filing, not sampled — this caught that a tree's crown and its own small foot-grass-tuft are two
    separate connected components (a real small gap in the source art, not a segmentation error;
    kept separate as tree + `bush` rather than force-merged).

    One whole-scene backdrop — a continuous illustrated shipwreck/shoreline panorama (rocks, a
    broken hull, a curving surf line, palm trees, and scattered shells, all genuinely touching with
    no real separating gaps) — was correctly recognized as *not* a tileset and filed uncut to
    `assets/backgrounds/castaway_shipwreck_cove_1.png` instead, matching the existing
    backdrop-vs-sprite distinction in `assets/sprites/README.md`. Three smaller fused compositions
    (a beach umbrella+chair+barrel lounge set, a tent+campfire+crates castaway camp, and a flag
    planted beside a small chest) were kept as single images rather than force-split, since their
    pixels are genuinely connected in the source — same "trust the pixels" rule.

    Filed into 15 folders total, giving `wildlife/` and `treasure/` their first-ever entries (both
    previously empty per `README.md`'s folder map). New descriptor names (`boulder_cluster`,
    `pebble`, `coral_clump`, `mangrove_stump`) were used instead of continuing this library's
    existing `rock_small`/`boulder_large`/`mangrove` series, since this sheet's pixel-art style is
    visibly distinct from the earlier deliveries that established those — mixing two styles under
    one descriptor name would make future browsing misleading, a deliberate call documented in the
    manifest. Ran the edge-opacity defect scan across all 128 cut files before filing: zero hits.

    **Not yet wired** — this delivery is cutting + filing only, matching the scope of the request.
    `worldSprites.ts`, `MapScreen.tsx`, `scenery.ts`, and `landmarks.ts` don't reference any of these
    128 files yet; wiring which sprites go where on which islands is separate follow-on work (the
    `scene-art-director` agent's job specifically).

163. ✅ **Cut a second new sheet — a modular dock/pier kit — into 80 sprites** (2026-08-23), sent
    immediately after item 162 with no accompanying text, read as a direct continuation of the same
    "cut the sheet into assets" request. See `assets/sprites/DOCK_PIER_KIT_MANIFEST.md`.

    Same corrupted-alpha defect as item 162's tropical-island sheet, found and fixed the same way
    (confirmed by sampling a supposedly-empty background patch and finding alpha noise ranging
    0-250 within it; fixed via 5×5 median-filter denoise + threshold + light opening before cutting).
    Unlike the tropical-island sheet, every module/post/plank/hardware piece in this one was already
    naturally isolated by real gaps — connected-component detection needed no fallback splitting and
    found a clean 80 items on the first pass.

    Compared this sheet's art style directly against the existing `harbour/pier_module_N` /
    `mooring_post_N` / `dock_ramp_N` series (from the 2026-08-20 harbour delivery) before naming
    anything — confirmed visibly different linework/palette — and used new, parallel descriptor
    names (`dock_module`, `dock_module_corner/_junction/_railed/_cargo`, `dock_platform`,
    `dock_stairs`, `piling`/`piling_roped`/`piling_hook`, `plank`/`plank_bundle`, `crane`,
    `dock_lantern`, `anchor`, `life_ring`, `rope_span`, `rope_coil`, `bollard`) rather than
    continuing those series, matching the same reasoning item 162 used for its rocks/vegetation.
    `cleat` was the one exception — continued its existing single-item series, since a small ring
    fitting doesn't carry a noticeable style clash the way a whole structure does.

    Ran the edge-opacity defect scan across all 80 cut files before filing: zero hits. **Not yet
    wired** — cutting and filing only, same as item 162.

164. ✅ **Cut a third new sheet — a market/cargo kit — into 90 sprites** (2026-08-23), sent right
    after item 163's dock kit, again with no accompanying text, again read as a direct continuation
    of the same request. See `assets/sprites/MARKET_CARGO_KIT_MANIFEST.md`.

    Same corrupted-alpha defect as the two sheets before it today, confirmed and fixed the same way
    before cutting anything. Connected-component detection found 90 real items; a handful needed a
    closer look before trusting them:
    - A ~30×30px reddish fragment near a tipped barrel was zoomed in on directly rather than
      assumed to be noise — confirmed to be real content (a small piece of spilled fish/meat), kept
      and filed as `items/fish_scrap_1` rather than discarded.
    - Two pairs of touching crates were kept as single composed images each (`market_crate_1`,
      `market_crate_12`) — genuinely connected pixels in the source, same "trust the pixels" rule
      as items 162-163.

    Extended item 162/163's style-comparison discipline to every descriptor choice: `market_crate`,
    `market_barrel`, and `hay_bale` got new descriptor names after directly comparing this sheet's
    crates/barrels/hay against the pre-existing `crates_N`/`barrels_N`/`hay_N` series (from a much
    earlier delivery this session) and finding them visibly darker/more weathered — and the
    existing hay bales are round while this sheet draws square-pressed bales, a real shape
    difference, not just a palette one. Conversely, `sacks_N`, `market_stall_N`, `torch_N`,
    `signpost_N` (all pre-existing from earlier deliveries), and `crane_N`/`rope_coil_N`/`anchor_N`
    (from item 163's dock kit, cut earlier the same day) were all judged close enough in style/
    simple enough in shape to continue their existing series rather than fork new ones — variety in
    a crane or a coil of rope reads as intentional, the way a whole tree or building wouldn't.

    Gave `items/` and `combat/` their first-ever entries (both previously empty per
    `assets/sprites/README.md`'s folder map) — a fish/meat scrap and a wheeled cannon respectively.

    Ran the edge-opacity defect scan across all 90 cut files before filing: zero hits. **Not yet
    wired** — cutting and filing only, same as items 162-163.

165. ✅ **Cut a fourth new sheet — a fortifications kit — into 90 sprites** (2026-08-24), sent the
    next day with no accompanying text, again read as a direct continuation of the same "cut the
    sheet into assets" request. See `assets/sprites/FORTIFICATIONS_KIT_MANIFEST.md`.

    A fortifications-and-military scene kit: lighthouses, watchtowers, a fort/castle, fort walls
    (incl. a rubble/breached variant and a gate), turrets, cannons with muzzle-flash/smoke effects
    and cannonball piles, palisade sections/posts/gates, spike barriers, sandbags, wood gates, many
    flags/banners, a gallows/hanging cage/pillory/skeleton set, harbour hardware, ammo crates/
    barrels/powder kegs, a cannon rammer, a linstock, war hammers, target boards, a brazier, a
    grave marker, and a torch.

    Same corrupted-alpha defect as the three sheets cut the day before, confirmed and fixed the
    same way (median-filter denoise + threshold + light opening + Gaussian feather) before cutting
    anything. Connected-component detection found 90 real items cleanly on the first pass — no
    fallback splitting, no fused-content merge calls needed this time.

    The key judgment call was on `landmarks/`: before naming the new lighthouse/watchtower/fort/
    turret/fort-wall descriptors, checked whether any existing series would collide. Found that
    `buildings/lighthouse.png` already exists as a bare, unnumbered file and is wired for the
    Tortuga lighthouse landmark (`src/data/landmarks.ts`'s `sprite: { category: 'building', id:
    'lighthouse' }`) — so the new lighthouse variants were filed to `landmarks/lighthouse_1..2`
    instead of `buildings/lighthouse_N`, keeping the wired reference untouched and avoiding any
    naming collision.

    Everywhere this sheet's art matched a series opened earlier the same session, it was continued
    rather than forked: `combat/cannon` (now `_1` through `_4`), `props/torch` (now `_1` through
    `_3`), `props/market_crate`/`market_barrel`, `world/flag_skull_pirate`/`flag_naval`, and
    `harbour/capstan`/`rope_coil`/`anchor`/`chain`/`chain_hook` all extend deliveries from earlier
    in the session (or the day before) rather than minting new descriptor names — simple hardware
    and flag shapes where cross-sheet variety reads as intentional. Genuinely new content
    (cannonball/cannonball_pile/muzzle_flash/smoke_puff/ammo_crate/ammo_barrel/powder_keg/
    powder_keg_bundle/cannon_rammer/linstock/war_hammer in `combat/`; the palisade/gallows/pillory/
    banner/target-board/brazier/grave-marker set in `props/`; flag_uk/flag_pennant/flag_stripe/
    flag_blue in `world/`) got fresh descriptor names since no prior delivery had anything close.

    Ran the edge-opacity defect scan across all 90 cut files before filing: zero hits. Also built a
    10-sample spot-check render of filed files across every touched folder, confirming clean art
    with no defects or color-tint artifacts. **Not yet wired** — cutting and filing only, same as
    items 162-164.

166. ✅ **File two single-asset UI variants — a parchment banner and a nameplate board** (2026-08-24),
    two separate sends later the same day, each with no accompanying text. Unlike items 162-165,
    neither upload was a sheet with multiple items to detect — each was one complete, self-contained
    UI background image. See `assets/sprites/UI_PARCHMENT_NAMEPLATE_V2_MANIFEST.md`.

    Different defect from every sprite-sheet delivery this session: both files' alpha channel was
    fully opaque (255 everywhere) — no real transparency data at all. What renders as a checkerboard
    "transparent" background was actually baked into the RGB pixels as a faint near-white/near-grey
    field (sampled ~244-255, saturation under 10) — the same failure class already hit once before
    in this repo (item 196, "fix chroma-key for baked-in checkerboard"). Fixed by chroma-keying on
    color instead of the (useless) alpha: any pixel with `max(R,G,B)-min(R,G,B) < 10` and
    `max(R,G,B) > 215` classified as background, since neither the warm parchment tan nor the dark
    wood/rivet tones are ever that neutral and that bright together. Cleaned with a light 2×2
    opening (fg noise only, never closing/filling background) + 3×3 median filter + 0.7-sigma
    Gaussian feather for anti-aliased edges. Confirmed each image is exactly one connected
    foreground blob, and that the parchment's two punch-holes and the board's plank/rivet gaps
    survived as real transparent holes rather than getting silently filled in.

    Compared both cutouts directly against the existing `ui_dialogue_parchment_1.png` and
    `ui_nameplate_board_1.png` before filing: same design language (banner/board shape, seal and
    rivet placement) but not pixel-identical to either — a distinct re-generation, not a duplicate
    upload. Both `_1` files are actively wired into `ConversationBox.tsx` via
    `src/data/uiSprites.ts`'s `UI_DIALOGUE_PARCHMENT`/`UI_NAMEPLATE_BOARD` exports, so rather than
    guess at a silent swap on a shipping UI component, filed the new art as `ui_dialogue_parchment_2.png`
    and `ui_nameplate_board_2.png` alongside the existing files — extending the numbered series the
    same way every repeated descriptor has been handled all session, rather than overwriting.

    Ran the edge-opacity defect scan on both cut files: zero hits. **Not yet wired** — `_1` of each
    stays the active production asset; `_2` is filed and available, not referenced anywhere yet.

167. ✅ **Background brief batch: 3 duplicate-check rounds (14 images, none new), then 5 genuinely new
    conversation backgrounds filed and wired** (2026-08-24) — user announced they'd be loading more
    `CONVERSATION_BACKGROUNDS_BRIEF.md` scenes, then sent four separate batches of images over the
    same conversation.

    The first three batches (4 + 5 + 5 = 14 images) were checked file-by-file against every PNG
    already in `assets/backgrounds/` — every single one came back byte-for-byte pixel-identical to
    an already-wired scene (`harbour_tavern_dusk_1`, `tortuga_market_day_1`, `tortuga_tavern_night_1`
    [both the garbled-sign reject and the clean-sign pick], `tortuga_gaol_interior_1`,
    `tortuga_old_landing_dusk_1`, both Cow Island scenes, Redbeard Sully's fort,
    `tortuga_signal_post_1`, both Roatán scenes + Bellows' fort, New Providence's tavern, and the
    careening yard). Reported each match back explicitly rather than silently re-filing or silently
    discarding — turned out to be the same source folder re-sent three times, not new content.

    The fourth batch (5 images) was genuinely new — verified with a mean-pixel-diff check against
    every existing background before treating any of them as new, not just an eyeball guess:
    - Two alternate angles of the Careening Yard (dusk + midday), a wider establishing shot with a
      watchtower/waterfall behind the yard and a parrot on the sign — filed as
      `roatan_careening_yard_2.png`/`_3.png`, additional alt angles on the existing export slot, the
      same pattern used for Iron Jenny's fort alt. Surfaced a pre-existing mismatch while filing
      these: the wired scene is named `SCENE_ROATAN_CAREENING_YARD`, but the real building "The
      Careening Yard" in `buildings.ts` (`new_providence_careening_yard`) is actually sited on New
      Providence, not Roatán — a conflict between the original brief and the shipped location data,
      predating this delivery. Left it as a documented note rather than resolving it unilaterally.
    - A tavern interior with no identifying signage — filed as `tavern_interior_generic_1.png`, a
      flexible fallback the same way the brief's own scene #30 (`generic_pier_night_1`, still
      undelivered) is meant to be one.
    - Two images of locations with no match anywhere in `islands.ts`/`buildings.ts`/`landmarks.ts`
      and not part of the original 30-scene brief: "Raven's Watch" (a lookout/hideout compound) and
      "Skull Cay Outpost" (a cliffside pirate outpost). Both also had a real defect: a dark
      placeholder UI panel (a drawn box with a beveled border) baked directly into the bottom
      ~12-15% of the canvas — exactly where the real `ConversationBox` parchment renders in-game —
      most likely the generator taking the brief's "keep the bottom simple for a dialogue box"
      instruction too literally and drawing a mock box into the art itself. Confirmed by cropping
      and zooming both bottoms rather than assumed from a distance; one was a solid opaque fill, the
      other a semi-transparent overlay you could see the ground texture through.

      Both of these were genuine judgment calls, not something to guess at — asked the user directly
      via two questions: (1) how to treat locations absent from the game's data model, (2) what to
      do about the baked-in box. Answers: file both as unassigned generic fallback scenes (not tied
      to any real island/building), and crop the box off before filing. Located each box's top edge
      by scanning row-wise pixel variance for the sharp texture-to-flat-fill transition (y=1662/1844
      for Raven's Watch, y=1627/1844 for Skull Cay) rather than eyeballing a crop line, then cropped
      a little above that with margin. Both landed wider than the 853x1844 target once shortened
      (0.5154 and 0.5265 vs 0.4626) — left uncorrected since `resizeMode="cover"` just crops a bit
      more off the sides in-game, the same tolerance every other off-aspect scene in this file has
      used. Filed as `ravens_watch_lookout_1.png` and `skull_cay_outpost_1.png`.

    All 5 new scenes exported from `src/data/sceneBackgrounds.ts` in this pass. `npx tsc --noEmit`
    and all 45 `jest` tests clean.

168. ✅ **Fifth background batch: 5 more images, all genuinely new, no user question needed this time**
    (2026-08-24) — verified all 5 against every existing background with a pixel-diff check first
    (none matched), then scanned each for the previous delivery's baked-in-placeholder-box defect
    (row-variance scan across the bottom 20% of each canvas) — none had it, so nothing to crop.

    - **Black Pearl's captain's quarters** — scene #24 (`black_pearl_captains_quarters_1`): chart
      table, globe, crossed cutlasses, coat-and-hat display, skull rug, twin windows on the cove.
      Brief calls for this "at night"; delivery came in bright daytime instead. Filed under the
      scene anyway since every other identifying detail matches exactly — same call made for scene
      #1's daytime market against the brief's original dusk piece.
    - **The Smugglers' Grotto** — scene #28 (`smugglers_grotto_1`): hidden cave, contraband crates,
      treasure, a lit cave mouth framing the anchored ship. Close match to the brief description.
      864x1821 source (0.4746 aspect vs 0.4626 target) — similar small mismatch to Iron Jenny's fort,
      left uncropped.
    - **A stone fort courtyard** with cannons, a target board, a training dummy, and skull banners —
      checked against all three still-undelivered Lord lairs (Marietta Graves' flooded ruin, Ezra
      Vane's whirlpool fortress, Blackbeard's driftwood storm-camp) and matched none of them by
      description. Not part of the 30-scene brief either. Filed as an unassigned generic fallback
      (`fort_courtyard_generic_1.png`) under the same standing the user gave for Raven's Watch/Skull
      Cay Outpost in item 167 — didn't re-ask, since that was an explicit answer to "how do you want
      unmatched locations handled going forward," not a one-off.
    - **A castaway beach camp, in two lighting versions** (day + golden hour) — tent/hammock camp,
      driftwood, a treasure chest, the ship offshore. Distinct from `SCENE_COW_ISLAND_BEACH_CAMP`
      (that one specifically has grazing cattle per the brief; these don't), and no location
      signage to identify it. Same generic-fallback treatment, filed as a day/dusk pair
      (`castaway_camp_beach_1.png`/`_2.png`) the same way the Careening Yard got a dusk/midday pair
      in the previous delivery.

    All 5 exported from `src/data/sceneBackgrounds.ts`. `npx tsc --noEmit` and all 45 `jest` tests
    clean.

169. ✅ **Sixth background batch: 1 duplicate, 4 new — including a real landmark match found by
    checking the description text, not just the picture** (2026-08-24) — same duplicate-check and
    defect-scan discipline as items 167-168 applied first.

    One of the 5 images was an exact pixel duplicate of `smugglers_grotto_1.png` (filed in item
    168) — reported back rather than re-filed. The other 4 were genuinely new and defect-free
    (same row-variance bottom-20% scan as item 168, no baked-in placeholder box on any of them):

    - **The High Woods** — scene #29 (`high_woods_jungle_1`): dense jungle path, dappled light, a
      skull-marked stone, a rocky peak and the sea through a gap in the canopy. Close match to the
      brief and to the game's existing `tortuga_high_woods` "jungle" encounter-backdrop category.
    - **A second generic tavern interior** ("TOMMY'S RUM" chalkboard, "NO CREDIT — NO QUARTER"
      sign, no real tavern name) — filed as `tavern_interior_generic_2.png`, a second option in the
      same fallback slot as item 168's tavern interior.
    - **A town square with a central fountain** — checked against the game's actual landmark data
      before guessing: `tortuga_town_square` (Basse-Terre Square)'s own description reads "a well,
      a market stall or two," which matches this scene almost exactly (fountain, market stall,
      tavern building, castle-gate archway), while the only other candidate,
      `new_providence_republic_square`, has no fountain/well detail in its description at all — a
      much weaker match. Confident enough to wire as the real landmark rather than file it generic,
      the same call made for `SCENE_TORTUGA_SIGNAL_POST` in an earlier delivery. Source came in
      wide (1023x1537, 0.6656 aspect) — center-cropped 156px off each side to the exact 0.4626
      target, keeping the fountain centered and both flanking buildings intact. Filed as
      `tortuga_town_square_1.png`.
    - **A second Black Pearl captain's quarters angle** — different furniture arrangement (writing
      desk, tripod telescope, red curtains) from item 168's version (which has a bed and a globe),
      same identity. Filed as `black_pearl_captains_quarters_2.png`, the same alt-angle pattern as
      the Careening Yard's and Iron Jenny's fort's alts.

    All 4 exported from `src/data/sceneBackgrounds.ts`. `npx tsc --noEmit` and all 45 `jest` tests
    clean.

170. ✅ **Seventh background batch: 5 more images, all new, all needed a center-crop** (2026-08-24) —
    none matched any existing file by dimensions even before a pixel check (all came in as
    DALL·E-3-style 1023-1024 × 1536-1537 canvases, none matching the 853×1844 canvas every prior
    delivery used), so all 5 were genuinely new. Same defect scan as items 168-169 first — all
    clean, no baked-in placeholder box on any of them.

    All 5 landed at ~0.665 aspect against the 0.4626 target (much wider than the small mismatches
    absorbed elsewhere in this file) — center-cropped each one (156-157px off each side) rather than
    leaving them for `resizeMode="cover"` to eat unevenly, verified afterward that nothing essential
    fell outside the crop on any of them.

    - **A third castaway beach camp** — a campfire ring and a distinct offshore rock formation not
      in the existing day/dusk pair. Filed as `castaway_camp_beach_3.png`, same generic-fallback
      standing as the other two.
    - **An ancient jungle temple ruin, in two companion angles** (near entrance + wide view with a
      rope bridge) — checked against the game's actual data before defaulting to generic: neither
      `ile_sainte_marie_shrine` ("Sunken Shrine," sea/drowning-themed, no jungle-temple imagery) nor
      `tortuga_ruins` ("El Fuerte Viejo," a Spanish/French stone redoubt, not a stepped temple) is a
      real match. Filed as `jungle_temple_ruins_1.png`/`_2.png`, unassigned generic fallback.
    - **A hidden treasure cave** — open chest, candlelight, path continuing to a jungle exterior
      rather than the sea (unlike `SCENE_SMUGGLERS_GROTTO`, which frames a boat and open water).
      Distinct enough to file separately rather than as a grotto alt — `treasure_cave_generic_1.png`.
    - **A small jungle outpost/camp** — palisade gate, cooking fire, a building with an unmarked
      tavern sign and a cross banner, the ship visible through the gate. No identifying signage,
      checked against the same candidates as Raven's Watch/Skull Cay Outpost and found nothing
      closer. Filed as `jungle_outpost_camp_1.png`, generic fallback.

    Worth flagging directly rather than just filing quietly: this is now 9 scenes across 4
    deliveries (items 167, 168, 170) filed as unassigned generic fallback rather than tied to a
    real place in `islands.ts`/`buildings.ts`/`landmarks.ts` — Raven's Watch, Skull Cay Outpost, the
    fort courtyard, 3 castaway beach variants, 2 jungle temple angles, the treasure cave, and the
    jungle outpost. All still usable as conversation backdrops, but if any of them are meant to
    anchor a real new location rather than stay a floating backdrop, that's data-layer work (a new
    `buildings.ts`/`landmarks.ts` entry, map placement, quest hooks) — a decision for the user, not
    something to invent unilaterally while just filing art.

    All 5 exported from `src/data/sceneBackgrounds.ts`. `npx tsc --noEmit` and all 45 `jest` tests
    clean.

171. ✅ **Eighth background batch: 5 more images, all new — and a second brief-vs-shipped-data
    mismatch found the same way as the Careening Yard's** (2026-08-24) — same duplicate/defect/crop
    discipline as items 169-170. All 5 came in on the wider DALL·E-3-style canvas, none matched
    anything on disk by dimensions, all center-cropped 156-157px per side to the 0.4626 target, all
    clean on the defect scan.

    - **A third generic tavern interior** ("WANTED — DEAD OR ALIVE" poster, a ship's wheel on the
      wall, no real tavern name) — `tavern_interior_generic_3.png`, third option in that fallback
      slot.
    - **A second Cow Island angle** — bright midday grazing flats, cattle, a hut, the ship offshore.
      Doesn't repeat either existing Cow Island scene's specific lighting/detail but is clearly the
      same real location (cattle + camp gear), so filed as a second beach-camp alt
      (`cow_island_beach_camp_2.png`) rather than a new generic slot.
    - **A jungle pirate camp, day + sunset pair** — an organized tent camp with a lookout platform
      and a central cook-fire, distinct from both the castaway beach series (loose driftwood lounge,
      no tents) and item 170's jungle outpost (a walled gate/building scene, not an open camp).
      Filed as its own generic-fallback pair, `pirate_camp_jungle_1.png`/`_2.png`.
    - **A blacksmith forge interior** (anvil, sword rack, a cannon mid-repair, live hearth) — checked
      against the real building data before filing and found a second instance of the same
      brief-vs-shipped-location mismatch as the Careening Yard (item 170's note): the only actual
      smithy, "The Anchor & Forge" (`tortuga_smithy`, Forge-Master Kade), is on **Tortuga Cove**, not
      Roatán, despite the existing `SCENE_ROATAN_FORGE_NIGHT` export's name. Filed this interior
      under the same `roatan_forge` naming pattern as the existing piece for consistency
      (`roatan_forge_interior_1.png`), with the same mismatch documented in the code comment rather
      than quietly renamed.

    All 5 exported from `src/data/sceneBackgrounds.ts`. `npx tsc --noEmit` and all 45 `jest` tests
    clean.

172. ✅ **Ninth background batch: 5 more images, all new, all real-location alts this time — none
    generic** (2026-08-24) — same duplicate/defect/crop discipline as items 169-171 first (all
    clean, all center-cropped 156-157px per side to the 0.4626 target). Unlike the last few
    batches, every one of these five had a confident real-location match — no generic fallback
    needed at all this round.

    - **The Black Pearl's main deck, daytime** — scene #23 from the original brief
      (`black_pearl_deck_day_1`), a close match: coiled rope, mainmast and rigging, a wind-filled
      sail, cannons and a treasure chest, another ship over the water.
    - **The Black Pearl's below-deck hold** — hammocks, shot barrels, a "BEWARE" sign, a
      skull-marked chest. Not one of the 30 brief scenes, but unambiguously the same ship the player
      captures and sails — filed as a real Black Pearl interior (`black_pearl_hold_1.png`)
      alongside the captain's quarters and the deck scene, not generic.
    - **A second angle of Tortuga's market** — a narrower bunting-strung alley rather than the
      brief's wide harbor square, but the same real market. Filed as `tortuga_market_day_2.png`.
    - **El Fuerte Viejo**, Tortuga's real ruins landmark (`tortuga_ruins` in `buildings.ts`) — a
      grand arched stone ruin, "Spanish stone, French blood" per its own flavor text. Checked
      against item 170's `jungle_temple_ruins` pair before filing: those show a stepped
      Mesoamerican pyramid, a completely different architectural language from this European
      arch-and-column colonial ruin — different enough to confirm this is the real El Fuerte Viejo,
      not a third temple angle. Confident enough to wire as the real landmark, same call as Basse-
      Terre Square in item 169. Filed as `tortuga_ruins_1.png`.
    - **A second angle of The Gaol** — a wider multi-cell corridor rather than
      `SCENE_TORTUGA_GAOL_INTERIOR`'s single cramped cell, same real building. Filed as
      `tortuga_gaol_interior_2.png`.

    Worth noting the shift from the last several deliveries: items 167-171 were mostly unassigned
    generic fallback (9 scenes with no real-location match); this batch found a confident real match
    for all 5, three of them (market, ruins, gaol) landing on locations that already have their own
    brief-scene entries or shipped `buildings.ts` data. Checking the actual game data before
    defaulting to generic — not just eyeballing the picture — is what made the difference.

    All 5 exported from `src/data/sceneBackgrounds.ts`. `npx tsc --noEmit` and all 45 `jest` tests
    clean.

173. ✅ **Tenth background batch: 5 more images, all new, split between real-location alts and
    generic fallback** (2026-08-24) — same duplicate/defect/crop discipline as items 169-172 first.

    - **The Salty Parrot, daytime** — a third angle of Tortuga's real tavern, bright midday dock
      shot with clean signage. Filed as a lighting alt, `tortuga_tavern_day_1.png`.
    - **A second fort courtyard** (well, red banners, covered stairway) — distinct composition from
      `SCENE_FORT_COURTYARD_GENERIC`, filed as a second option in that same unassigned slot.
    - **A jungle waterfall grotto exterior** — a freshwater waterfall/pool at a cave mouth, distinct
      from `SCENE_SMUGGLERS_GROTTO`'s interior sea-cave framing (no waterfall there). New unassigned
      generic scene.
    - **A quiet beach cove with a wrecked rowboat and treasure chest** — checked against the brief's
      still-open `shipwreck_santa_catalina_1` (a broken hull half-buried in a reef) and found it
      doesn't match closely enough (this is an intact rowboat on dry sand, not a broken hull in
      water) — filed as its own generic scene rather than claiming the Santa Catalina identity.
    - **The Wandering Deck** — a third tavern name with no match in `buildings.ts` (after The Salty
      Parrot and The Cracked Hull), same situation as Raven's Watch/Skull Cay Outpost. Filed
      generic under its own in-art name.

    All 5 exported from `src/data/sceneBackgrounds.ts`.

174. ✅ **Eleventh background batch: 18 images arrived across 4 rapid-fire sends, deduped down to 14
    real new scenes** (2026-08-24) — before classifying anything, ran a thumbnail-diff pass across
    all 18 against each other (not just against the repo): found 4 exact pixel duplicates between
    the second and third sends (same 4 images resent), leaving 14 genuinely unique new scenes, none
    matching anything already on disk. All landed on the standard 853x1844 canvas, no crop needed.
    Same bottom-band defect scan as prior deliveries — several interior scenes flagged a naturally
    dark floor gradient (not the sharp box-edge defect from item 167), confirmed by inspecting the
    row-by-row std curve on the most-flagged one and finding a smooth decline, not a cliff.

    Checked every scene against the real game data before defaulting to generic, and it paid off —
    5 of the 14 landed on confident real-location matches:
    - **Chapelle Notre-Dame**, Tortuga's real chapel (`tortuga_chapel`, "Brother Aldric") — two
      angles: the roofless nave with cross banners and an altar (`tortuga_chapel_1.png`), and the
      bell tower itself, its bell embossed with the same cross motif (`tortuga_chapel_2.png`).
    - **Le Vasseur's Residence**, Tortuga's real governor's manor (`tortuga_le_vasseur_residence`,
      type `'manor'`) — a checkered-marble hall, gilt portraits, a coat of arms, confidently matched
      on the portraits-and-crest detail alone (`tortuga_governors_residence_1.png`).
    - **The Harbourmaster's Office** (`tortuga_harbourmaster`) — a chart room with a world map,
      globe, and a ship-traffic table map, framed through a stone triple-arch window overlooking the
      harbor rather than open sea (unlike the Black Pearl's own windows) — the navigation-instrument
      focus and harbor-traffic framing read as an office that tracks shipping, not a ship's cabin
      (`tortuga_harbourmaster_office_1.png`).
    - **A third and fourth angle of Tortuga's market** (`tortuga_market_day_3.png`) and its own
      chapel bell tower already covered above.

    Two more Black Pearl interiors, same ship-cabin wood-paneled language as the existing captain's
    quarters scenes: a private bedroom with a skull-headboard bed and telescope
    (`black_pearl_captains_quarters_3.png`), and a gun deck with a cannon and a rug matching an
    existing captain's-quarters rug exactly (`black_pearl_gun_deck_1.png`).

    The remaining 7 had no real-location match and joined existing unassigned generic slots as
    additional angle options rather than new ones, following the pattern from items 167-173: a third
    jungle temple angle, a third fort courtyard, a third jungle pirate camp, a fourth generic tavern
    interior, plus three brand-new generic scenes (a rum cellar, a rooftop view over Tortuga, and a
    daytime dockside pier — filling a similar niche to the brief's still-undelivered
    `generic_pier_night_1` but not claiming that exact slot since this one is daylight).

    All 14 exported from `src/data/sceneBackgrounds.ts`. `npx tsc --noEmit` and all 45 `jest` tests
    clean.

175. ✅ **Cut a general-purpose UI kit sheet into 30 sprites — the first defect this session that
    turned out NOT to be one** (2026-08-24) — sent with no accompanying text, read as the same
    standing "cut the sheet" request applied to UI chrome instead of world sprites or backgrounds.
    See `assets/sprites/UI_KIT_MANIFEST.md`.

    Panel frames, a scroll banner, a speech bubble, item-slot sockets, a health bar, checkboxes,
    coin/heart/gem icons, a scrollbar, and 9 pill buttons (6 plain colors + 3 with arrow glyphs).

    Every other sheet this session had corrupted or fully-opaque-with-baked-background alpha. This
    one's alpha channel is real and smooth — correctly 0 at the true canvas corners — but carries an
    intentional soft vignette glow behind the whole grid that stays close to opaque (~250/255) even
    in the gaps between icons. Confirmed it was a smooth gradient and not the noise defect from
    earlier sheets by sampling local 10×10 patches at several gap locations and finding near-zero
    local standard deviation. Since a plain alpha threshold can't tell real icon content from this
    vignette (both read as nearly opaque), item boundaries were detected from RGB edge/gradient
    strength (Sobel) instead, and the closed+filled gradient mask was used to zero out alpha outside
    each item's real silhouette — the fix that keeps a pill button's rounded corners transparent
    instead of showing a hazy brown square from the vignette behind them.

    Two real fused-detection cases, both resolved by measuring rather than guessing:
    - The 9 stacked pill buttons initially collapsed into only 6 boxes (three touching pairs merged
      by the coarser gradient-closing pass). Scanned a narrow vertical alpha profile through the
      button column and found all 8 real gaps between the 9 buttons — including one only 9px wide
      that the closing operation had bridged over — then split at each gap's midpoint.
    - The wood divider bar and the speech bubble below it detected as one tall component; found the
      real gap between them (y 541–573) the same way.

    Filed all 30 into `assets/sprites/ui/` with new descriptor names (checked against the 4 existing
    files first — no collisions). Left the folder flat for now despite crossing this library's usual
    subfolder threshold (36 files, clean frames/buttons/icons/sockets sub-groups) — two of the
    existing files are actively wired via `src/data/uiSprites.ts`/`bitmapNameplateFont.ts`, and a
    split means rewriting those require paths, the same risk calculus as the `tiles/`/`nature/`
    split but flagged as separate follow-on work rather than folded into this delivery.

    Ran the edge-opacity defect scan across all 30 cut files: zero hits. Built and reviewed a full
    30-item contact sheet before classifying — confirmed clean transparent backgrounds (no vignette
    bleed into rounded corners) on every item, including both split cases. **Not yet wired** —
    cutting and filing only, same as every prior delivery this session.

176. ✅ **Cut a second UI kit sheet into 29 sprites — numbered category headers this time, and a
    tighter, trickier layout than the first** (2026-08-24), sent with no accompanying text, same
    standing request. See `assets/sprites/UI_KIT_V2_MANIFEST.md`.

    12 state buttons (normal/pressed/disabled/danger, 3 sizes each), 6 icon-only round buttons
    (back/close/settings in gold and brown rings), a normal/locked pair of panel-frame sets (wide +
    2 squares each), a 2-state tab selector, a confirmation modal frame, and Confirm/Cancel buttons.

    Same real (not corrupted) soft-vignette alpha as item 175's UI kit, same fix — RGB gradient
    strength for item boundaries, the closed/filled mask to clean the final alpha.

    This sheet's own numbered category labels ("1. PRIMARY ACTION BUTTON (Normal)," etc.) sit
    directly above each group with only a small gap, and text has sharp edges just like real
    content — a naive top-down crop would have baked the header text into the first item of every
    group. Checked the actual pixels above three representative groups before assuming any cutoff,
    and found the sheet uses three different header-row heights (one row for the 4 button-state
    groups, a more indented row for icon-buttons/tab-selector/modal, and a third for the panel-frame
    pairs) — a single guessed offset would have clipped some groups and bled text into others.
    Verified afterward that no header text survived into any of the 29 filed files.

    Three different real-boundary techniques were needed on one sheet: narrow gap scans (same
    technique as item 175's button column) for the 12 state buttons and 6 round icon buttons; and
    two genuine "trust the pixels, verify don't guess" calls — the wide-frame-vs-two-squares split
    in both panel groups (a real ~10px density dip found by reading the raw row-density curve, not
    assumed), and the confirmation modal's frame-vs-buttons split (a real gap at y 833–836 inside a
    much larger candidate region that would otherwise have looked like one component).

    Compared the new buttons directly against the first UI kit's `ui_button_{color}_1` series before
    naming anything: this sheet's buttons show individual wood-plank grain lines and separate dark
    corner brackets under the rivets (the first kit's are plain flat pills), plus a 3-size ladder
    the first kit doesn't have — a real style/structure difference, so named by UX state instead of
    color (`ui_button_normal/pressed/disabled/danger_1..3`, size ascending). `ui_frame_panel_wide_1`/
    `_square_1..2` and their locked counterparts are new descriptors too, not a continuation of the
    first kit's single plain `ui_frame_parchment_1` — this delivery's frames come as a matched
    normal/locked pair sharing a wide+2-square layout, a distinct enough sub-system to name on its
    own. Flagged two real limitations rather than hiding them: `ui_button_confirm_1`/`_cancel_1` and
    `ui_tabbar_crew_selected_1`/`_ship_selected_1` have "CONFIRM"/"CANCEL"/"CREW"/"SHIP" permanently
    painted into the art, so unlike every icon-only or blank asset elsewhere in this library they
    can't be reused for a different label without a redraw.

    Kept both tab-selector rows as one image each rather than splitting each into two tab halves —
    the two segments share one continuous wood plank with a rivet at the seam, not two abutting
    separate buttons, so a split would cut through real art, not a real gap.

    Ran the edge-opacity defect scan across all 29 cut files: zero hits. Built and visually reviewed
    a full 29-item contact sheet before classifying, confirming correct boundaries on all three
    fused-detection cases and no leftover header text. **Not yet wired** — cutting and filing only,
    same as every prior delivery this session.

177. ✅ **Cut two candidate UI kit sheets (124 sprites) into a dedicated `ui_candidates/` area, kept
    separate from the active `ui/` library** (2026-08-25). The user explicitly said these — and any
    more they load — "might not be the ones we go with," sent to compare designs before picking one,
    so they're filed as `assets/sprites/ui_candidates/design_a/` (58 files) and `design_b/` (66
    files) rather than merged into `ui/`'s naming scheme, which would have collided with the existing
    `ui_button_normal_1` etc. series from items 175-176 and made "which kit is this from" unanswerable
    later. See `assets/sprites/UI_KIT_CANDIDATES_MANIFEST.md`.

    Design A: a magenta-background sheet, single wood/metal material per button state, matching
    items 175-176's general layout (12 state buttons in 3 sizes, 8 icon buttons, panel/locked-panel
    frame sets, a themed 4-row tab selector, 2 confirm/cancel modals, plus an "Extra Variations" strip
    of alt-colored buttons/panels/corner brackets). Design B: a dark-navy sheet covering the same
    UX-state system but with three parallel *material* lines per button/panel (wood plank, brass
    plate, canvas & rope) and four modal/corner-bracket color variants instead of one — real design
    alternatives, not just a recolor pass, which is exactly what "a choice of designs" asked for.

    Both sheets have flat (if noisy) single-color backgrounds rather than items 175-176's soft
    vignette-glow alpha, so this delivery used a different real-boundary technique: per-sheet global
    background-color distance (sampled from a clean border strip, thresholded a handful of std-devs
    above the background's own noise floor) instead of local-gradient/Sobel detection. That choice
    surfaced its own defect worth flagging for future sheets like these: local-median background
    estimation (the first approach tried) reads a large *uniform-fill* interior — a solid gold
    button's flat center, not just its edges — as "background-like," since a median window sitting
    deep inside a flat-colored area returns that same color with near-zero local diff. It silently
    voided the interior alpha of several solid-fill buttons before the switch to global distance
    caught it. Also dropped the soft/feathered alpha edge used on 175-176 in favor of a hard binary
    threshold: with no real background glow to blend into, a feathered edge only left a ring of
    partial-alpha pixels whose RGB is still literally the source background color — invisible until
    composited elsewhere, where it reads as a colored fringe (classic non-premultiplied-alpha bleed).
    Confirmed the fix by sampling the exact pixel at a known edge before/after.

    Both sheets bake their own numbered/lettered group headers directly above their content with a
    real but narrow gap (matching the "checklist grouping only" rule in `AGENTS.md`) — verified per
    row via raw density-profile scans rather than one guessed offset, since row-to-row gaps varied
    (Design A: 3 different header heights across its 9 groups; Design B: the worst case, where "A.
    WOOD PLANK" sits right above its button, but "B. BRASS PLATE" is baked in *twice* — once for the
    real brass row, and again, apparently mislabeled, above the canvas/rope row directly below it,
    with the sheet's actual "C. CANVAS & ROPE" caption oddly trailing *after* that row instead of
    before it. Read the real content boundary from the raw pixels each time rather than trusting the
    label text's own claims, and caught two rounds of residual header bleed before all rows cut
    clean).

    A second real fused-detection problem on Design B: its panel/locked-panel frame groups (3 wide
    material rows + 1 tall frame in its own column) aren't a uniform grid — the tall frame's column
    spans the full height of rows 2+3 combined, and the last wide row doesn't extend under it. An
    automatic grid splitter forced into that shape produced nonsense; fixed by reading the real
    layout off a gridded pixel overlay and hand-specifying each of the 8 regions, same as items
    170/174's "trust the pixels" precedent. Design A's tab-selector group (Crew/Ship/skull/anchor,
    4 rows × inactive+active) split cleanly with a real gap between columns; Design B's tab group (a
    fused 2-segment Crew|Ship inactive combo beside a single active pill) has no real background gap
    between them at all in one row — the wood frames physically touch — so `tab_single_active_crew_1`
    carries a few px of the neighboring combo's edge; flagged rather than hidden, same "shared edge"
    tradeoff items 175-176 accepted for baked-together decorative elements.

    Both kits' primary-button variants come in a size ladder like item 176's (`_s`/`_l`, or `_s`/`_m`/
    `_l` where a sheet has 3), and Design B's confirm/cancel and Crew/Ship-tab labels are baked into
    the art the same way item 176 flagged for its own kit — can't be relabeled without a redraw.

    Ran the edge-opacity defect scan across all 124 cut files (58 + 66): zero hits — confirmed binary
    alpha (no non-{0,255} values), no near-empty or near-fully-opaque crops. Built and visually
    reviewed full contact sheets for both kits before filing, catching and re-cutting every group-
    header bleed and neighbor-bleed case documented above. **Not yet wired, and not merged into the
    active `ui/` library** — these are alternatives pending the user's choice of which (if either)
    design to standardize on; per the standing "cut and file only" scope for every unsolicited-sheet
    delivery this session, no UI kit (v1, v2, or either candidate here) has been wired into a real
    screen yet.

178. ✅ **Cut a third UI kit candidate (119 sprites) plus a new "Bars & Meters" sheet (39 sprites) —
    158 total** (2026-08-27), two sheets sent together with no accompanying text. See
    `assets/sprites/UI_KIT_CANDIDATES_MANIFEST.md` (design C section) and the new
    `assets/sprites/BARS_METERS_MANIFEST.md`.

    Design C joins A/B in `assets/sprites/ui_candidates/design_c/` — denser than either earlier
    candidate (5 material rows per button state instead of 3-4, real baked English labels like
    "Ship's Crew"/"Crew Quarters", plus reference-only extras — size examples, a second icon-button
    row, a pressed-icon strip, label-plate/title-plaque examples — neither A nor B included). The
    Bars & Meters sheet has no candidate counterpart to compare against, so it's new content filed
    straight into the active `ui/` library: HP bar tracks/fills (3 ornament styles, plus 9 pre-tinted
    high/mid/low reference examples), a fused XP/level bar in 3 colorways, a fused Heat/Wanted meter
    in 3 tiers, 9 cooldown indicators (circular/clock/linear × ready/partial/cooldown), and 9 material-
    palette reference swatches.

    Both sheets share design C's own real defect, not seen on A/B: their "pressed"/"disabled" button
    art is deliberately darker/lower-contrast, which pushed much of that art's own interior fill below
    the flat global-distance threshold (45) that cleanly separated A/B's brighter art from their
    backgrounds — first-pass crops came out as thin slivers, not full buttons (confirmed by direct
    pixel sampling: the pressed state's own median distance-from-background was ~24, nowhere near the
    45 threshold). Fixed by lowering the threshold to 18 and adding morphological closing + hole-
    filling to the alpha mask, recovering real interior pixels that dip below threshold from local
    shading without pulling in true background, then re-cutting the whole sheet with the corrected
    mask. A second, independent defect then surfaced on the corrected mask: several crops (all five
    `primary_button_normal_*_l` buttons, two `label_plate_*`, two `material_swatch_*`) carried a small
    disconnected fragment of a neighboring group's rope-tassel or header text, close enough for the
    closing operation to nearly bridge them into the real item. Fixed generally via connected-
    component analysis across every cut file — drop any component under 15% of the main component's
    size as debris, re-crop to the main component's own tight bounding box for the handful of larger
    bleed fragments — rather than hand-tuning each affected box; verified with a fresh connected-
    component pass afterward showing zero files retain a secondary blob.

    Design C's header-text exclusion had a new wrinkle beyond design B's (item 177): on this sheet a
    single group's header can overlap only *some* of the columns beneath it, not the full row width
    (seen on "EXTRA ICON ROUND BUTTONS" and "MATERIAL PALETTE REFERENCE"), so a shared per-row y-
    boundary that worked for most of a row's items still left header-text fragments in the columns it
    didn't actually clear. Fixed by reading the real per-column boundary off the pixel density profile
    rather than assuming one cutoff applies across an entire row — the same "trust the pixels" standard
    applied throughout this session, just needed at finer granularity than before.

179. ✅ **Cut two more Bars & Meters candidate sheets (31 + 34 = 65 sprites)** (2026-08-27), sent
    right after item 178's `ui_bars_meters_v1.png` with a single "😉" and no other text. See the new
    `assets/sprites/BARS_METERS_CANDIDATES_MANIFEST.md`.

    Unlike v1 (no counterpart, filed straight into `ui/`), these two sheets cover the same ground v1
    already filled — HP/stat bars, a level bar, a Heat/Wanted meter, cooldown indicators — so they're
    filed as candidates to compare rather than a continuation, in new `ui_candidates/bars_meters_b/`
    (31 items) and `ui_candidates/bars_meters_c/` (34 items) folders, same treatment as the design
    A/B/C button-kit candidates.

    First sheets this entire session to arrive with a **real per-item alpha channel already baked in**
    at generation time — sampling showed a clean matte (interior ~254/255, background 0, normal
    anti-aliased edge taper), so none of the background-reconstruction techniques used on every other
    sheet (color-distance thresholding, edge detection, morphological cleanup) were needed. The cutting
    task reduced to finding each item's true bounding box in the alpha the source already provided.

    One real defect: connected-component labeling on the alpha found fewer components than real items
    (27 vs 31 on the "b" sheet, 29 vs 34 on "c") — several items are baked touching their neighbor with
    literally zero background gap between them, the same situation documented for design B's tab
    selector in item 177. Five separate fused groups needed splitting: "b"'s 5-row ship's-wheel-cap bar
    family, and "c"'s icon-capped stat-bar trio (shield/lightning/crossed-swords), wood-plank-track trio
    (metal/gold-stud/rope corners), and "LVL"-badge pair (12/blue, 28/purple). Fixed by dividing each
    fused blob's bounding box into N equal-height bands and checking the split against the actual pixel
    content first (a gridline overlay over each candidate cut) before committing — every one of the 5
    splits landed exactly on the real seam, confirmed by full-sheet contact sheets and a connected-
    component debris scan afterward (zero secondary blobs on any of the 65 files).

    `assets/sprites/ui/` crosses its own README-stated subfolder-split threshold with this delivery
    (65→104 files, several genuinely distinct new sub-groups). Flagged in `DELIVERY_LOG.md`'s existing
    "Folder size note" rather than split unilaterally — same risk calculus already applied to
    `tiles/ground/` and its siblings: real `require()` paths in `src/data/uiSprites.ts` would need
    rewriting, and that's follow-on work, not something to fold into an already-large cutting pass.

    Ran the edge-opacity defect scan across all 158 newly cut files: zero hits. Built and visually
    reviewed full contact sheets for both deliveries, catching and re-cutting every low-contrast-alpha,
    neighbor-bleed, and header-bleed case documented above before filing. **Not yet wired** — cutting
    and filing only, same as every prior delivery this session. Neither the bars/meters sheet nor any
    of the three UI kit candidates (A/B/C) has been wired into a real screen.

180. ✅ **Cut four more UI candidate sheets — three bars/meters, one widget kit (137 sprites)**
    (2026-08-27), sent together with no accompanying text. See the updated
    `assets/sprites/BARS_METERS_CANDIDATES_MANIFEST.md` and `UI_KIT_CANDIDATES_MANIFEST.md` (design D
    section).

    `ui_bars_meters_v4.png` (40 items), `v5.png` (28 items), and `v6.png` (29 items) join `bars_meters_
    b`/`bars_meters_c` as three more bars/meters candidates (`bars_meters_d`, `_e`, `_f`).
    `ui_kit_candidate_d.png` (40 items) is a different content mix — bar frames, banner flags, toggle
    switches, checkboxes, round icon buttons, and nav icons, plus a few overlapping bar assets — filed
    as a 4th button-kit-style design candidate (`ui_candidates/design_d/`), joining A/B/C. All four
    sheets arrived pre-matted with real per-item alpha already baked in, same as v2/v3.

    Same "baked touching, zero gap" fusion pattern recurred on all four sheets — 5 to 8 items per
    fusion depending on the sheet, split at equal divisions verified against a gridline overlay first.
    One fusion needed a different approach: v4's left column has 4 skull-banner colored bars stacked
    directly on top of 4 resource-counter bars (fish/wood/rum/cannonball with baked fraction text),
    765px tall with zero internal gap anywhere — since the two halves aren't equal height, an even
    split would have cut into real content, so the actual per-item boundaries were read directly off a
    finely-gridded overlay instead of assumed.

    A second, more serious defect surfaced on v4-v6: connected-component **bounding boxes** can overlap
    even when the components themselves don't touch — an irregularly-shaped bar frame's rectangle
    extends well past its own visible silhouette, and a smaller separate item (a standalone "fill
    piece" bar sitting just below it) can have its top edge fall inside that rectangle. The first
    cutting pass cropped by alpha threshold within each item's own padded bounding box, which let a
    geometrically-overlapping neighbor's pixels leak into the crop (caught on `bar_skull_track` in v5,
    which picked up a sliver of the standalone red fill bar sitting directly beneath its frame — 7 more
    files across v5/v6 had the same pattern). Fixed by masking each crop against the actual connected-
    component label the pixel belongs to, not just an alpha threshold — a geometrically-overlapping
    neighbor can no longer contribute pixels regardless of bbox overlap. Re-cut all four sheets with the
    corrected method and reverified: the connected-component debris scan, which had flagged all 8
    affected files under the old method, came back clean on every one of the 137 files.

    Ran the edge-opacity defect scan across all 137 files: zero hits. Built and visually reviewed a full
    contact sheet per sheet; confirmed correct content and clean isolation on every item, including all
    6 split-from-fused items this round. **Not wired** — cutting and filing only, same as every prior
    delivery this session.

181. ✅ **Cut two more UI candidate sheets — 89 sprites — plus caught an exact duplicate upload**
    (2026-08-27), sent with "Continue from where you left off" (twice) and "Let's go". See the updated
    `assets/sprites/UI_KIT_CANDIDATES_MANIFEST.md` (design E, F sections).

    Three sheets arrived; one (`ui_kit_candidate_e.png`) turned out to be a **byte-for-byte duplicate**
    of the already-filed `ui_kit_candidate_d.png` — caught via a direct pixel diff before cutting
    anything (100% identical pixels, zero mean difference), so it was not re-cut or re-added to the
    repo. The other two are genuinely new: `ui_kit_candidate_f.png` (38 items → `ui_candidates/
    design_e/`) is a reskin of design D's widget-kit content — same categories, different dressing
    (a lantern-hung wheel bar frame, a ship-silhouette map scroll, a black pirate-flag panel, a
    hibiscus/parrot decorative frame). `ui_kit_candidate_g.png` (51 items → `ui_candidates/design_f/`)
    is the richest single sheet this session — a near-complete game HUD kit (resource bars with "+"
    buttons, a full baked-text BATTLE/MAP/SHOP menu panel that's the largest fused asset cut all
    session, PLAY/FIGHT/CONTINUE text buttons, two treasure chests, medals, potions, pennants, and 5
    tiny loose treasure-piece props) — and the first sheet in the whole `design_*`/`bars_meters_*`
    series with **zero fused items**: all 51 raw connected components matched the manual visual catalog
    1:1, confirmed before cutting a single file.

    Design E needed 4 fusion splits (three equal-halves pairs, one equal-sevenths icon-button row),
    each verified against a gridline overlay first, same technique as every prior fused-item case this
    session. Both sheets arrived pre-matted (real alpha baked in) and were cut using the connected-
    component-label masking method from item 180's fix, so no bounding-box-overlap bleed occurred on
    either — confirmed by a clean connected-component debris scan across all 89 files.

    Ran the edge-opacity defect scan across all 89 files: zero hits. Built and visually reviewed a full
    contact sheet per sheet. **Not wired** — cutting and filing only, same as every prior delivery this
    session. `ui_candidates/` now holds six button/widget-kit designs (A-F) and five bars/meters
    candidates (b-f) alongside `ui/`'s own v1 content — all still awaiting the user's pick.

182. ✅ **Cut one more UI candidate sheet (42 sprites)** (2026-08-27), sent alone with no accompanying
    text. See the updated `assets/sprites/UI_KIT_CANDIDATES_MANIFEST.md` (design G section).

    `ui_kit_candidate_h.png` (42 items → `ui_candidates/design_g/`) is another near-complete HUD kit in
    the spirit of design F, but with real structural differences worth tracking, not just a reskin: the
    BATTLE/MAP/SHOP buttons are **three separate assets** here (real gaps between them) instead of
    design F's one fused menu panel, the toggle's "off" state renders red instead of gray, the HP bar
    has no "+" button (design F's did), and there's only one treasure chest (open, jeweled — no
    matching closed chest on this sheet). Arrived pre-matted like every sheet since v2.

    One fusion needed splitting — a 2-flag banner pair (crown + an unusual icon) — split at the
    equal-halves seam, verified against a gridline first. Cut using the connected-component-label
    masking method, so no bounding-box-overlap bleed risk; confirmed by a clean debris scan.

    Genuine content oddity, not a cutting defect: `icon_button_batball` and `banner_flag_batball_green`
    show a real cricket-bat-and-ball icon in the slot every other sheet fills with crossed swords —
    checked at full resolution to rule out a misread before concluding it's actually drawn that way.
    Cut and filed as-drawn (standard is "cut what's on the sheet"), flagged in the manifest as likely a
    generation quirk rather than an intentional design choice — the only non-pirate-themed icon
    anywhere in the library so far.

    Ran the edge-opacity defect scan across all 42 files: zero hits. Built and visually reviewed a full
    contact sheet. **Not wired** — cutting and filing only, same as every prior delivery this session.
    `ui_candidates/` now holds seven button/widget-kit designs (A-G) and five bars/meters candidates
    (b-f) alongside `ui/`'s own v1 content — all still awaiting the user's pick.

183. ✅ **Cut three more UI candidate sheets — 112 sprites — a new content category** (2026-08-27),
    sent together with no accompanying text (followed up with "Continue from where you left off" ×2
    and "Wake up"). See the updated `assets/sprites/UI_KIT_CANDIDATES_MANIFEST.md` (design H, I, J
    sections).

    `ui_kit_candidate_i.png`/`j.png`/`k.png` (39 + 37 + 36 items → `ui_candidates/design_h/`,
    `design_i/`, `design_j/`) introduce a genuinely new category for this manifest: **screen-navigation
    kits** — top status bars with coin/gem/heart counters and "+" buttons, 5-tab navigation bars, big
    illustrated menu category cards (World Map/Battle/Shop/Teams/Achievements/Settings), banner-label
    and banner-action buttons, round nav/icon buttons, and pill-shaped state buttons — rather than
    another button ladder (A-C) or widget grab-bag (D-G). All three arrived pre-matted like every sheet
    since v2.

    Designs H and I had zero fusions — both sheets' raw connected-component counts (39, 37) matched
    the manual visual catalog 1:1, confirmed before cutting. Design J had one 3-item fusion: a REWARDS
    banner baked directly on top of a right-arrow icon and a close/X icon, all touching with zero
    background gap across a 193px-tall blob (checked the row-density profile first — genuinely no gap
    existed to find automatically). Split by reading the real boundaries off a finely-gridded pixel
    overlay: the banner/icon-row seam, then the arrow/X seam within that row — both confirmed clean on
    the contact sheet afterward.

    Ran the edge-opacity defect scan across all 112 files: zero hits. Ran the connected-component
    debris scan: zero hits, including on all 3 split-from-fused items. Built and visually reviewed a
    full contact sheet per sheet. **Not wired** — cutting and filing only, same as every prior delivery
    this session. `ui_candidates/` now holds ten button/widget/navigation-kit designs (A-J) and five
    bars/meters candidates (b-f) alongside `ui/`'s own v1 content — all still awaiting the user's pick.

184. ✅ **Cut the final batch of unsolicited sheets — 32 item-icon candidates, a new category and a
    new art style** (2026-08-29), sent with *"These are the last three sheets I have for now."* See the
    new `assets/sprites/ITEM_ICON_CANDIDATES_MANIFEST.md`.

    `item_icons_pixelart.png`/`item_icons_set_b.png`/`item_icons_set_c.png` (10 + 11 + 11 items →
    `item_icon_candidates/{pixelart,set_b,set_c}/`) are a new content category entirely: general item/
    prop icons rather than UI chrome — fish/logs/rum/coins (matching the game's existing resource
    types), a backpack, a compass, a scroll (blank-sealed, "Royal Pardon," or an illustrated treasure
    map depending on the set), a circular map-viewport frame, a cursor, and treasure chests. Overlaps
    the already-populated `items/`/`treasure/` folders, so filed as candidates to compare rather than
    merged in, same precedent as every UI-kit and bars/meters candidate this session.

    `pixelart` is also a **genuine style fork** — chunky retro pixel-art, distinctly different from the
    painterly look used for every other asset shipped this session (Scally, terrain, buildings, all ten
    UI-kit designs). Flagged clearly in the manifest: picking this direction would mean adopting
    pixel-art as the game's visual language, not just picking a different icon set.

    Real defect, unique to this delivery: the pixel-art sheet arrived as a **fully opaque RGB image**
    with an extremely subtle white-on-white checkerboard baked into the pixels (two near-identical
    off-white tones ~40px apart) rather than a real alpha channel. A first pass (binary threshold +
    border flood-fill) correctly cleared the checkerboard itself but left speckle noise across every
    icon's soft drop-shadow, where semi-transparent shadow pixels blend toward the checkerboard and a
    hard yes/no cutoff couldn't decide many of them consistently. Fixed with a **graduated (non-binary)
    alpha** — scaled by each pixel's distance from white rather than thresholded — plus connected-
    component debris cleanup (drop anything under 200px; the real icons are all far larger). Verified
    against a colored preview background: zero speckle, naturally fading shadows, clean isolation on
    all 10 items. `set_b`/`set_c` arrived pre-matted with real alpha and had zero fusions (raw
    component counts of 11 matched the manual visual catalog on both).

    Ran the edge-opacity defect scan across all 32 files: zero hits (specifically checked the pixel-art
    set's graduated shadows aren't mistaken for a defect — confirmed each is a real gradient, not a
    flat near-threshold value). Ran the connected-component debris scan: zero hits. Built and visually
    reviewed a full contact sheet per set. **Not wired** — cutting and filing only, same as every prior
    delivery this session. This closes out the unsolicited-sheet-delivery phase for now per the user's
    own note; `assets/sprites/` currently holds ten button/widget/nav-kit UI designs, five bars/meters
    candidates, and three item-icon candidate sets, none wired, all awaiting review.

185. ✅ **Audited the whole library for gaps, then wired 8 of `landmarks/`'s already-cut-but-unused
    files** (2026-08-29). Prompted by the user asking "how are we looking with the art assets" — a
    full audit found the single biggest miss is character art: every crew archetype (12), Pirate Lord
    state (12), and threat template (6) still renders as a raw emoji in `CrewScreen`/`EncounterScreen`
    despite 3,400+ files elsewhere in the library, plus two named recurring story characters (Admiral
    Grace, Captain Blackfin) with the same gap. Handed the user a 32-image asset list (one generation
    per image, per `AGENTS.md`'s standing rule) so they can start producing that art in parallel while
    wiring continues here. Secondary gaps noted: only 26 of 55 buildings have a `spriteId`, `interiors/`
    is fully procedural (0 files), `items.ts`/`treasures.ts` are all-emoji, and `market/`/`characters/`/
    `effects/`/`quest_markers/` are empty folders.

    Started on the "cut but not wired, no design decision needed" bucket (as opposed to the ten UI-kit
    and five bars/meters candidate sets, which need the user's pick first). `landmarks.ts` had only 3
    of 16 entries with real art (fountain/lighthouse/cave_arch, all reusing existing building/nature/
    prop sprites) — the other 13 fell back to `landmark.emoji`, despite `landmarks/` already holding 40
    cut, unused files from the 2026-08-17 terrain-extras delivery. Matched 8 of those 13 by content
    against the `hero_landmark_*`/`castaway_camp_1`/`shipwreck_debris_1`/`fountain_complete_2` art
    (High Woods → a rooted ancient tree; Old Landing ruins → a ruined gate structure; Forgotten Graves
    → a carved stone skull; both shipwrecks → two distinct wreck images; Blackwood's Hollow → a
    tent-and-campfire camp; Suzette's Still → a stone-ringed fire pit; Republic Square → a second,
    distinct fountain design for New Providence's own plaza) and found a 9th already-wired match for
    The Marked Palm (`NATURE_SPRITES.tree_palm`, unused by any landmark until now).

    Added a new `LANDMARK_SPRITES` export to `worldSprites.ts`, extended `Landmark['sprite']`'s
    category union to include `'landmark'`, and extended `MapScreen.tsx`'s landmark-rendering switch
    to resolve it — same pattern the existing building/nature/prop landmark sprites already used, just
    one more source map. 4 of the 16 landmarks (Harbor Pier, La Ringot Fields, Contrebandiers' Cove,
    Turtle Cove) still have no matching art anywhere in the folder and keep their emoji.

    This was a fresh container for the session (the local checkout had fallen 6 commits behind the
    already-pushed remote state from earlier work — a stale clone, not lost work; fast-forwarded to
    sync before starting), so `npm install` and a Python `Pillow`/`scipy` install were needed before
    `npx tsc --noEmit`/`npx jest` would run at all; both passed clean once dependencies were in place.
    Verified live: `npx expo start --web`, loaded in a real headless-Chromium session, zero console
    errors, confirmed all 8 new `require()` paths resolve to real files on disk (Metro would have hard-
    failed the build on a bad path, and it didn't). See `assets/sprites/README.md`'s `landmarks/` row.

186. ✅ **Fixed rounded/circular street junction patches — every path bend and crossing now reads as a
    flat square tile** (2026-08-29). Direct feedback on a live mobile screenshot of `joeeaton11.
    github.io`: several bends/intersections on Tortuga Cove's dirt paths were circled, with "remove
    them all and let the path take the shape of the sprite... it will be square as the environment is
    grid shaped."

    Root cause was `STREET_JUNCTIONS` in `streets.ts` — precomputed once at module load from every
    point 2+ street segments share an endpoint, meant to patch the real gap `strokeLinecap="square"`
    leaves at a right-angle elbow (a square cap only extends a stroke past its own endpoint along its
    own direction, so an elbow's outer corner is never covered by either line). `MapScreen.tsx` was
    covering that gap with an SVG `<Circle>` — which worked as a patch but put a round blob on top of
    an otherwise all-square street network at every single bend and crossing, exactly what got circled
    in the screenshot. (Item 185's landmark work and this bug are unrelated — this junction-patch code
    predates this session; item 185 only happened to be the prior entry.)

    Every entry in `STREETS` (`streets.ts`) is grid-snapped and axis-aligned — a pure horizontal or
    vertical run, never diagonal — so a junction patch never needs to be round to "fit" an angled
    joint; a plain square sits flush against the square-capped tiles on every side regardless of which
    two directions meet there. Swapped the `<Circle>` for a `<Rect>` (same `cobblePattern`/`dirtPattern`
    fill, same footprint size — 24 for a `'main'` junction, 18 for `'path'`, just square instead of a
    circle of that diameter) centered on the same precomputed point. Left two other `Circle`-based
    things untouched since they aren't the bug that was flagged: the house/building garden-yard tints
    (a deliberate round patch of grass color, not a street-surface texture) and the small corner
    minimap's own street rendering (a separate, deliberately stylized round-cap rendering at a much
    smaller scale — round forest-canopy blobs and round island borders there too — not the main
    gameplay view the screenshot was taken from).

    `npx tsc --noEmit` and `npx jest` (45/45) both pass. Verified live via `npx expo start --web` in a
    real headless-Chromium session at Tortuga Cove's actual spawn point (the same dirt-path bends shown
    in the flagged screenshot): zero console errors, and the path bends now render as flat square joins
    instead of rounded blobs.

187. ✅ **First real NPC portrait: Admiral Grace, wired into `GraceScreen.tsx`** (2026-08-29). Follow-up
    to item 185's audit, which flagged every crew/lord/threat as emoji-only — the user picked Grace as
    the first character to generate real art for and sent two candidate renders (an original swashbuckler
    captain, and an older, scarred, grey-haired officer). Picked the officer for Grace: weathered and
    authoritative rather than swashbuckling fits "the Crown" far better than a pirate-captain grin and a
    drawn cutlass. The swashbuckler render is being kept on the back burner for a future Pirate Lord or
    recurring character — not discarded, not yet assigned a slot.

    Sorting the un-picked render into "future Pirate Lord" also surfaced a real, independent problem
    while checking `pirateLords.ts`'s available slots: Lord #6 is literally named `Blackbeard`, flavor
    text "The real Edward Teach, still holding the inlet where history says he fell" — exactly the
    real-historical-figure identity the user explicitly said to avoid, already sitting in the code before
    that instruction was ever given. Flagged to the user; they've deferred the rename to whenever that
    Lord's own art/turn comes up, not blocking anything now.

    First delivery this session sent as a single pasted/attached character render rather than a sheet —
    genuinely different failure mode from every prior delivery: the image didn't reach disk on the first
    attempt (a paste and a file attachment look identical in the chat transcript, but only the attachment
    actually lands as a readable file this session's tools can reach) — caught by checking
    `/root/.claude/uploads/` for a new file before touching any image tooling, found none, and said so
    rather than guessing; the user re-sent it as an attachment and it read cleanly the second time.

    Cutting it hit a real defect distinct from anything in the sheet-cutting deliveries above: a solid
    dark-navy backdrop sitting close enough to Grace's own dark-navy coat shading that a flat
    global-color-distance threshold (30 units, the tolerance that had worked fine elsewhere) ate real
    fabric shadow — moth-hole gaps scattered across the coat, not a clean silhouette. Fixed with a much
    tighter tolerance (~7 units) combined with a border-connected-component flood fill: only pixels
    actually reachable from outside the figure through near-exact background matches get cleared, so a
    coat shadow that merely resembles the backdrop color but isn't part of the same contiguous region
    stays opaque regardless of how dark it is. Verified by re-checking known trouble spots (the sleeve/
    underarm shadow, the coat's trailing edge) at full zoom for stray transparency — none found.

    Mirrored horizontally per direct request — she's meant to face screen-left, opposite Scally, ahead of
    the still-pending swap from `GraceScreen`'s current "stacked dialogue cards" layout to
    `ConversationBox`'s two-sided tap-through one (Scally left/facing right, NPCs right/facing left,
    matching the reference mockup `ConversationBox.tsx` was originally built against). That swap is a
    real UX change — one line at a time with tap-to-advance, vs. every line visible at once — and
    `GraceScreen`'s own code comment already documents the stacked-card layout as a deliberate choice,
    not an oversight, so it wasn't done unprompted this pass; only the emoji-to-real-portrait swap
    within the existing layout shipped now.

    Added `src/data/characterSprites.ts` (this roster's counterpart to `scallySprites.ts`) exporting
    `ADMIRAL_GRACE_PORTRAIT`. `GraceScreen.tsx`'s header now shows a head-and-shoulders bust crop (top
    35% of the full-body source, landing just below the collar/epaulettes) using the same "full source
    image behind an `overflow:hidden` slot" technique `ConversationBox` already uses for Scally, rather
    than a second pre-cropped file or `resizeMode="cover"` (which would center-crop and cut into her
    face on this aspect ratio). `GRACE_EMOJI` itself is untouched and still used for her map marker in
    `MapScreen.tsx` — out of scope for this pass.

    `npx tsc --noEmit` and `npx jest` (45/45) both pass. Live in-app verification (navigating to New
    Providence and triggering her actual dialogue stage) was skipped as disproportionate to a header-
    icon change — confirmed instead via a direct render of the exact crop region the component uses,
    matching what shipped pixel-for-pixel, plus the standard file-exists + clean-typecheck/test check.

188. ✅ **`GraceScreen.tsx` swapped over to the real `ConversationBox`** (2026-08-29). Direct follow-up
    to item 187, same session: "do the same as we did for Scally and cut her image at the same point
    and position her the same... just on the other side of the screen so it looks like they're talking
    to each other." `ConversationBox` had been sitting built-but-unused since its own original
    construction (previewable only from the Debug screen) specifically because nothing had real NPC
    portrait art to put in it — Grace is the first thing that ever unblocked it.

    "Same crop, same position, mirrored side" turned out to need no new cropping math at all —
    `ConversationBox`'s `PORTRAIT_WIDTH`/`PORTRAIT_FULL_HEIGHT`/`PORTRAIT_CROP_FRACTION` are fixed
    constants inside the shared component, not something each screen re-tunes per character, so simply
    passing `ADMIRAL_GRACE_PORTRAIT` through the existing `portraitSource` prop with `side="right"`
    already produces the exact same crop treatment Scally's own screens get. Removed the previous
    delivery's bespoke `portraitBust` head-crop entirely — it was a stopgap for the old stacked-card
    layout, now replaced outright.

    `GraceStage.dialogue` is Grace's own lines only (no authored Scally response text in the data
    model), so this only ever shows her single side of the box — Scally isn't shown at all here,
    matching the existing silent-protagonist pattern used everywhere else in the game, not a new
    limitation introduced by this swap. Replaced the old "every line visible, one Continue button"
    layout with real per-line state (`lineIndex`) and `onAdvance` — tap fast-forwards a still-revealing
    line, tap again advances to the next, and advancing past the last line completes the stage and
    backs out of the screen exactly like the old `handleContinue` did. Updated `GraceStage.dialogue`'s
    own doc comment in `grace.ts`, which had explicitly documented the old stacked/non-paginated
    behavior as deliberate — now stale, so corrected rather than left to mislead the next reader.

    `npx tsc --noEmit` and `npx jest` (45/45) both pass. Verified live this time (the actual dialogue
    screen, not just a crop-region render): `npx expo start --web` in headless Chromium, through the
    Debug screen's existing `handleJumpToGrace` shortcut (no in-app navigation/drag needed) straight to
    her New Providence stage — confirmed Grace's portrait renders bottom-right facing left exactly as
    intended, the nameplate/parchment/typewriter reveal all work unchanged from the Debug-preview
    version, and repeated tap-to-advance correctly cycles all three of her lines and would exit the
    screen after the last one. Zero console errors throughout.

189. ✅ **Captain Blackfin's portrait, on the 3rd attempt — and a style/likeness catch that also hit
    item 187's Grace art** (2026-08-29). Asked for a Blackfin brief matched to his actual data
    (`blackfin.ts`: blade specialist, always exactly one step ahead, cocky-but-likable, "the Rival"
    not a villain) — described him leaner/faster-reading than a typical captain, a fin-shaped dark
    coat collar nodding at his name without literally being a shark, and a distinct palette so he
    doesn't read as a Scally recolor.

    First render sent back rejected: painterly-realistic adult proportions/shading, nothing like
    Scally's chibi/cel-shaded style — and worse, it visibly reused Jack Sparrow's specific design
    signifiers (dreadlocks-with-beads, skull-and-bandana tricorn, kohl-lined eyes), not just "generic
    pirate," a real character-likeness problem independent of the style mismatch. Comparing it against
    Grace's already-shipped portrait (item 187) while writing that feedback found the same style
    mismatch sitting there too, unnoticed until put side by side — flagged as a standing question (not
    resolved this pass): does Grace get redone once the correct style is locked down, or stay the one
    exception? Second render fixed both problems (original face, correct chibi/cel-shaded proportions)
    but kept Scally's own signature red sash/accent; third recolored it to purple and was accepted.

    Cut and mirrored the same way as Grace (tight ~7-unit border-connected-component flood fill against
    the same solid dark-navy backdrop) — this render had no shadow/backdrop color collision, clean at
    every threshold tried, unlike Grace's coat. Added `BLACKFIN_PORTRAIT` to `characterSprites.ts`.

    `BlackfinScreen.tsx` got the same `ConversationBox` swap as `GraceScreen.tsx` (item 188), with one
    real difference: Blackfin's screen shows dialogue *then* either a Duel/Not Today choice or a plain
    Continue, where Grace's just exits — added a `dialogueDone` boundary so tap-through ends by
    revealing the action row (computed exactly as before: `isWon && stage.victoryLine` swaps in his
    single victory line) instead of immediately backing out of the screen. `BLACKFIN_EMOJI` is
    untouched, still used for his map marker.

    `npx tsc --noEmit` and `npx jest` (45/45) both pass. Verified live via the Debug screen's
    `handleJumpToBlackfin` shortcut straight to the fightable New Providence stage: portrait renders
    bottom-right facing left, tap-through correctly cycles both lines, and the Duel Lv.8/Not Today
    buttons correctly appear once dialogue finishes. Zero console errors.
