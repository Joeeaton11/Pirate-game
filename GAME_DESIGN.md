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
