/**
 * Pure-logic unit tests for gameStore (GAME_DESIGN.md item 67 — "increasingly worth it now that
 * permadeath, crime, quests, ship upgrades, rescue, and the Council/Blackbeard gating all touch
 * shared state (heat/gold/resources/crew/quests) simultaneously"). No rendering: the store is a
 * plain zustand hook, so its actions are called directly via `useGameStore.getState()` and
 * asserted against the resulting state, the same way any other function under test would be.
 *
 * `debugResetSave()` — the same action the in-app Debug screen uses — resets every field back to
 * `createInitialState()`, so it doubles as this suite's "fresh save" fixture between tests.
 */
import { useGameStore, SHIP_CREW_CAP } from './gameStore';
import { xpToNextLevel } from '../utils/battle';
import { promotionFor } from '../data/promotions';

function reset() {
  useGameStore.getState().debugResetSave();
}

function starterId(): string {
  return useGameStore.getState().crew[0].instanceId;
}

beforeEach(() => {
  reset();
});

describe('initial state', () => {
  it('starts a new save with one crew member, no gold spent, and no heat', () => {
    const s = useGameStore.getState();
    expect(s.gold).toBe(20);
    expect(s.crew).toHaveLength(1);
    expect(s.shipCrewIds).toEqual([s.crew[0].instanceId]);
    expect(s.activeCrewId).toBe(s.crew[0].instanceId);
    expect(s.heat).toBe(0);
    expect(s.capturedCrew).toEqual([]);
  });
});

describe('gold', () => {
  it('never goes negative even when spending more than you have', () => {
    useGameStore.getState().addGold(-1000);
    expect(useGameStore.getState().gold).toBe(0);
  });

  it('accumulates normally', () => {
    useGameStore.getState().addGold(50);
    expect(useGameStore.getState().gold).toBe(70);
  });
});

describe('heat', () => {
  it('clamps to [0, 100] on both ends', () => {
    useGameStore.getState().addHeat(-50);
    expect(useGameStore.getState().heat).toBe(0);
    useGameStore.getState().addHeat(500);
    expect(useGameStore.getState().heat).toBe(100);
    useGameStore.getState().setHeat(-10);
    expect(useGameStore.getState().heat).toBe(0);
    useGameStore.getState().setHeat(999);
    expect(useGameStore.getState().heat).toBe(100);
  });
});

describe('crew XP, leveling, and promotion', () => {
  it('levels up and promotes the starter once it crosses the promotion threshold', () => {
    const id = starterId();
    const promo = promotionFor('deckhand_swordsman');
    expect(promo).toBeDefined(); // deckhand_swordsman -> boarding_captain at level 10

    // Feed exactly enough XP to cross every threshold from level 3 up to the promo level.
    let level = 3;
    let totalXp = 0;
    while (level < promo!.level) {
      totalXp += xpToNextLevel(level);
      level += 1;
    }
    totalXp += 1; // land one XP past the last threshold, not exactly on it

    const promotedTo = useGameStore.getState().gainXp(id, totalXp);
    expect(promotedTo).toBe('boarding_captain');

    const member = useGameStore.getState().crew.find((m) => m.instanceId === id)!;
    expect(member.templateId).toBe('boarding_captain');
    expect(member.level).toBeGreaterThanOrEqual(promo!.level);
    expect(useGameStore.getState().seenTemplateIds).toContain('boarding_captain');
    expect(useGameStore.getState().recruitedTemplateIds).toContain('boarding_captain');
  });

  it('does not promote or change template before the threshold', () => {
    const id = starterId();
    useGameStore.getState().gainXp(id, 1); // nowhere near a level-up
    const member = useGameStore.getState().crew.find((m) => m.instanceId === id)!;
    expect(member.templateId).toBe('deckhand_swordsman');
    expect(member.level).toBe(3);
  });

  it('heals proportionally to the max-HP gained on level-up (never above the new max)', () => {
    const id = starterId();
    const before = useGameStore.getState().crew.find((m) => m.instanceId === id)!;
    useGameStore.getState().setCrewHp(id, 1); // near death
    useGameStore.getState().gainXp(id, xpToNextLevel(before.level) + 1);
    const after = useGameStore.getState().crew.find((m) => m.instanceId === id)!;
    expect(after.level).toBe(before.level + 1);
    expect(after.currentHp).toBeGreaterThan(1); // gained the level's HP increase
  });
});

describe('recruiting and the 6-crew ship cap', () => {
  it('boards new recruits until the cap, then benches them to Crew Quarters', () => {
    // Starts with 1 (the starter). Recruit 5 more to hit the cap of 6.
    for (let i = 0; i < SHIP_CREW_CAP - 1; i++) {
      const boarded = useGameStore.getState().addCrewMember('cabin_hand', 2);
      expect(boarded).toBe(true);
    }
    expect(useGameStore.getState().shipCrewIds).toHaveLength(SHIP_CREW_CAP);
    expect(useGameStore.getState().crew).toHaveLength(SHIP_CREW_CAP);

    // The 7th recruit still joins crew (the roster), but doesn't board the ship.
    const boarded = useGameStore.getState().addCrewMember('cabin_hand', 2);
    expect(boarded).toBe(false);
    expect(useGameStore.getState().crew).toHaveLength(SHIP_CREW_CAP + 1);
    expect(useGameStore.getState().shipCrewIds).toHaveLength(SHIP_CREW_CAP);
  });

  it('marks a template as seen and recruited the first time it joins', () => {
    expect(useGameStore.getState().recruitedTemplateIds).not.toContain('cabin_hand');
    useGameStore.getState().addCrewMember('cabin_hand', 2);
    expect(useGameStore.getState().seenTemplateIds).toContain('cabin_hand');
    expect(useGameStore.getState().recruitedTemplateIds).toContain('cabin_hand');
  });
});

describe('permadeath: removeCrewMember', () => {
  it('records a capture and reassigns the active fighter when a non-last crew member is lost', () => {
    useGameStore.getState().addCrewMember('cabin_hand', 2);
    const [first, second] = useGameStore.getState().crew;
    useGameStore.getState().setActiveCrew(first.instanceId);

    const rescued = useGameStore.getState().removeCrewMember(first.instanceId, 'navy');

    expect(rescued).toBe(false); // false = crew survives (not the "wiped out, auto-replaced" case)
    const state = useGameStore.getState();
    expect(state.crew.find((m) => m.instanceId === first.instanceId)).toBeUndefined();
    expect(state.crew).toHaveLength(1);
    expect(state.activeCrewId).toBe(second.instanceId);
    expect(state.capturedCrew).toHaveLength(1);
    expect(state.capturedCrew[0]).toMatchObject({ id: first.instanceId, capturedBy: 'navy' });
  });

  it('auto-replaces with a fresh cabin hand when the entire crew is wiped out', () => {
    const id = starterId();
    const wiped = useGameStore.getState().removeCrewMember(id, 'rival');

    expect(wiped).toBe(true); // true = crew was wiped, a fallback recruit was auto-added
    const state = useGameStore.getState();
    expect(state.crew).toHaveLength(1);
    expect(state.crew[0].templateId).toBe('cabin_hand');
    expect(state.shipCrewIds).toEqual([state.crew[0].instanceId]);
    expect(state.activeCrewId).toBe(state.crew[0].instanceId);
    // The permadeath capture is still on record even though the roster was refilled.
    expect(state.capturedCrew).toHaveLength(1);
    expect(state.capturedCrew[0].capturedBy).toBe('rival');
  });

  it('does not record a capture when no capturedBy is given (e.g. a non-permadeath removal path)', () => {
    useGameStore.getState().addCrewMember('cabin_hand', 2);
    const [first] = useGameStore.getState().crew;
    useGameStore.getState().removeCrewMember(first.instanceId);
    expect(useGameStore.getState().capturedCrew).toHaveLength(0);
  });
});

describe('rescueCrewMember', () => {
  it('returns a captured crew member to the roster at half HP and clears the capture record', () => {
    const id = starterId();
    const original = useGameStore.getState().crew[0];
    useGameStore.getState().removeCrewMember(id, 'navy'); // wipes out -> auto-replace + 1 capture record
    const capturedId = useGameStore.getState().capturedCrew[0].id;
    expect(capturedId).toBe(id);

    const success = useGameStore.getState().rescueCrewMember(capturedId);

    expect(success).toBe(true);
    const state = useGameStore.getState();
    expect(state.capturedCrew).toHaveLength(0);
    expect(state.crew).toHaveLength(2); // the auto-replace cabin hand + the rescued member
    const rescued = state.crew.find((m) => m.templateId === 'deckhand_swordsman')!;
    expect(rescued).toBeDefined();
    // rescueCrewMember re-creates the member at full HP for their level, then halves it — since
    // the original was never damaged, that's exactly half of their (equal) starting HP.
    expect(rescued.currentHp).toBe(Math.max(1, Math.round(original.currentHp * 0.5)));
  });

  it('fails for an unknown capture id', () => {
    expect(useGameStore.getState().rescueCrewMember('not-a-real-id')).toBe(false);
  });
});

describe('sendToQuarters / bringAboard', () => {
  it('refuses to bench the last crew member aboard the ship', () => {
    const id = starterId();
    useGameStore.getState().sendToQuarters(id);
    expect(useGameStore.getState().shipCrewIds).toEqual([id]); // unchanged
  });

  it('reassigns the active fighter when the active member is sent to quarters', () => {
    useGameStore.getState().addCrewMember('cabin_hand', 2);
    const [first, second] = useGameStore.getState().crew;
    useGameStore.getState().setActiveCrew(first.instanceId);
    useGameStore.getState().sendToQuarters(first.instanceId);
    const state = useGameStore.getState();
    expect(state.shipCrewIds).toEqual([second.instanceId]);
    expect(state.activeCrewId).toBe(second.instanceId);
  });

  it('refuses to bring a member aboard once the ship is at the cap', () => {
    for (let i = 0; i < SHIP_CREW_CAP; i++) {
      useGameStore.getState().addCrewMember('cabin_hand', 2);
    }
    // One more recruit sits in Crew Quarters (never boarded).
    useGameStore.getState().addCrewMember('cabin_hand', 2);
    const benched = useGameStore.getState().crew.find(
      (m) => !useGameStore.getState().shipCrewIds.includes(m.instanceId)
    )!;
    expect(useGameStore.getState().bringAboard(benched.instanceId)).toBe(false);
  });
});

describe('crime: stealFromShop', () => {
  it('adds more heat when caught than when not, and always yields the stolen resource', () => {
    const before = useGameStore.getState().resources.fish ?? 0;
    const result = useGameStore.getState().stealFromShop('tortuga_fishmonger');
    expect(result.success).toBe(true);
    expect(result.resourceId).toBe('fish');
    const state = useGameStore.getState();
    expect(state.resources.fish ?? 0).toBeGreaterThan(before);
    expect(state.heat).toBe(result.caught ? 15 : 5);
  });

  it('is on cooldown immediately after a successful theft', () => {
    useGameStore.getState().stealFromShop('tortuga_fishmonger');
    const second = useGameStore.getState().stealFromShop('tortuga_fishmonger');
    expect(second.success).toBe(false);
  });

  it('fails for a building with no theft target', () => {
    // tortuga_tavern (or any non-shop building) has no stealResourceId configured.
    const result = useGameStore.getState().stealFromShop('not-a-real-building');
    expect(result.success).toBe(false);
  });
});

describe('resources: gather, sell, cooldowns', () => {
  it('gathers within the configured yield range and starts a cooldown', () => {
    const result = useGameStore.getState().gatherResource('node_tortuga_fish');
    expect(result.success).toBe(true);
    expect(result.amount).toBeGreaterThanOrEqual(2);
    expect(result.amount).toBeLessThanOrEqual(5);
    expect(useGameStore.getState().resources.fish).toBe(result.amount);

    const second = useGameStore.getState().gatherResource('node_tortuga_fish');
    expect(second.success).toBe(false); // still on cooldown
  });

  it('sells resources for gold and refuses to sell more than you have', () => {
    useGameStore.getState().addResource('fish', 10);
    const goldBefore = useGameStore.getState().gold;

    expect(useGameStore.getState().sellResource('fish', 20)).toBe(false); // don't have 20
    expect(useGameStore.getState().gold).toBe(goldBefore);

    expect(useGameStore.getState().sellResource('fish', 10)).toBe(true);
    expect(useGameStore.getState().resources.fish).toBe(0);
    expect(useGameStore.getState().gold).toBe(goldBefore + 10 * 3); // fish sellPrice is 3
  });
});

describe('crafting', () => {
  it('consumes the recipe resource and grants the item', () => {
    useGameStore.getState().addResource('rum', 5);
    const success = useGameStore.getState().craftItem('rum_ration'); // costs 2 rum
    expect(success).toBe(true);
    expect(useGameStore.getState().resources.rum).toBe(3);
    expect(useGameStore.getState().inventory.rum_ration).toBe(1);
  });

  it('fails without enough of the required resource', () => {
    useGameStore.getState().addResource('rum', 1); // recipe needs 2
    expect(useGameStore.getState().craftItem('rum_ration')).toBe(false);
    expect(useGameStore.getState().inventory.rum_ration ?? 0).toBe(0);
  });
});

describe('ship upgrades and salvage', () => {
  it('requires both enough gold and enough resource, and cannot be bought twice', () => {
    useGameStore.getState().addGold(1000);
    useGameStore.getState().addResource('gunpowder', 5); // diving_bell needs 10
    expect(useGameStore.getState().buyShipUpgrade('diving_bell')).toBe(false); // not enough resource

    useGameStore.getState().addResource('gunpowder', 10);
    const goldBefore = useGameStore.getState().gold;
    expect(useGameStore.getState().buyShipUpgrade('diving_bell')).toBe(true);
    expect(useGameStore.getState().gold).toBe(goldBefore - 100);
    expect(useGameStore.getState().resources.gunpowder).toBe(5);
    expect(useGameStore.getState().shipUpgrades).toContain('diving_bell');

    expect(useGameStore.getState().buyShipUpgrade('diving_bell')).toBe(false); // already owned
  });

  it('gates salvage behind owning the prerequisite upgrade, then cooldowns after use', () => {
    const beforeUpgrade = useGameStore.getState().salvageSite('port_royal_ruins');
    expect(beforeUpgrade.success).toBe(false);

    useGameStore.getState().addGold(1000);
    useGameStore.getState().addResource('gunpowder', 10);
    useGameStore.getState().buyShipUpgrade('diving_bell');

    const goldBefore = useGameStore.getState().gold;
    const result = useGameStore.getState().salvageSite('port_royal_ruins');
    expect(result.success).toBe(true);
    expect(result.amount).toBeGreaterThanOrEqual(25);
    expect(result.amount).toBeLessThanOrEqual(50);
    expect(useGameStore.getState().gold).toBe(goldBefore + result.amount!);

    expect(useGameStore.getState().salvageSite('port_royal_ruins').success).toBe(false); // cooldown
  });

  it('grants a salvage site treasureId once, and only once', () => {
    useGameStore.getState().addGold(1000);
    useGameStore.getState().addResource('gunpowder', 10);
    useGameStore.getState().buyShipUpgrade('diving_bell');

    const first = useGameStore.getState().salvageSite('port_royal_ruins');
    expect(first.treasureId).toBe('sunken_locket');
    expect(useGameStore.getState().foundTreasureIds).toContain('sunken_locket');

    useGameStore.getState().debugClearSalvageCooldowns();
    const second = useGameStore.getState().salvageSite('port_royal_ruins');
    expect(second.success).toBe(true);
    expect(second.treasureId).toBeUndefined(); // already found — gold only, no repeat grant
  });
});

describe('Treasure Codex', () => {
  it('findTreasureSite requires proximity to a real site and refuses to double-grant', () => {
    expect(useGameStore.getState().findTreasureSite('not_a_real_site').success).toBe(false);

    const result = useGameStore.getState().findTreasureSite('site_rusty_compass');
    expect(result.success).toBe(true);
    expect(result.treasureId).toBe('rusty_compass');
    expect(useGameStore.getState().foundTreasureIds).toContain('rusty_compass');

    // Already found — same site can't be collected twice.
    expect(useGameStore.getState().findTreasureSite('site_rusty_compass').success).toBe(false);
  });

  it('gates a buried-map site behind holding the Treasure Map item, and consumes it on dig', () => {
    expect(useGameStore.getState().findTreasureSite('site_buried_doubloons').success).toBe(false);

    useGameStore.getState().addItem('treasure_map', 1);
    const result = useGameStore.getState().findTreasureSite('site_buried_doubloons');
    expect(result.success).toBe(true);
    expect(result.treasureId).toBe('buried_doubloons');
    expect(useGameStore.getState().inventory.treasure_map).toBe(0);

    // No more maps left — a second buried site (hypothetically) would fail; re-verify by trying
    // the same site again, which is already-found and should fail for that reason regardless.
    expect(useGameStore.getState().findTreasureSite('site_buried_doubloons').success).toBe(false);
  });

  it('auto-assembles the legendary hoard the instant the 7th fragment is granted', () => {
    const fragments = [
      'fragment_tortuga',
      'fragment_cow_island',
      'fragment_new_providence',
      'fragment_roatan',
      'fragment_port_royal',
      'fragment_ile_sainte_marie',
    ];
    fragments.forEach((id) => useGameStore.getState().debugAddTreasure(id));
    expect(useGameStore.getState().foundTreasureIds).not.toContain('blackbeards_hoard');

    useGameStore.getState().debugAddTreasure('fragment_ocracoke');
    expect(useGameStore.getState().foundTreasureIds).toContain('fragment_ocracoke');
    expect(useGameStore.getState().foundTreasureIds).toContain('blackbeards_hoard');
  });

  it('debugAddTreasure is idempotent', () => {
    useGameStore.getState().debugAddTreasure('rusty_compass');
    useGameStore.getState().debugAddTreasure('rusty_compass');
    const matches = useGameStore.getState().foundTreasureIds.filter((id) => id === 'rusty_compass');
    expect(matches).toHaveLength(1);
  });

  it('buyTreasure deducts gold, grants the item, and refuses if already owned or unaffordable', () => {
    expect(useGameStore.getState().buyTreasure('smugglers_lucky_coin', 60)).toBe(false); // no gold

    useGameStore.getState().addGold(100);
    const goldBefore = useGameStore.getState().gold;
    expect(useGameStore.getState().buyTreasure('smugglers_lucky_coin', 60)).toBe(true);
    expect(useGameStore.getState().gold).toBe(goldBefore - 60);
    expect(useGameStore.getState().foundTreasureIds).toContain('smugglers_lucky_coin');

    expect(useGameStore.getState().buyTreasure('smugglers_lucky_coin', 60)).toBe(false); // already owned
  });
});

describe('Captain Blackfin', () => {
  it('completeBlackfinStage is idempotent', () => {
    expect(useGameStore.getState().completedBlackfinStageIds).toEqual([]);

    useGameStore.getState().completeBlackfinStage('blackfin_tortuga_intro');
    useGameStore.getState().completeBlackfinStage('blackfin_tortuga_intro');
    expect(useGameStore.getState().completedBlackfinStageIds).toEqual(['blackfin_tortuga_intro']);
  });

  it('setCurrentBlackfinStage tracks which stage the Blackfin screen should show', () => {
    expect(useGameStore.getState().currentBlackfinStageId).toBeNull();

    useGameStore.getState().setCurrentBlackfinStage('blackfin_tortuga_intro');
    expect(useGameStore.getState().currentBlackfinStageId).toBe('blackfin_tortuga_intro');

    useGameStore.getState().setCurrentBlackfinStage(null);
    expect(useGameStore.getState().currentBlackfinStageId).toBeNull();
  });

  it('debugResetSave clears completed stages and the current stage pointer', () => {
    useGameStore.getState().setCurrentBlackfinStage('blackfin_tortuga_intro');
    useGameStore.getState().completeBlackfinStage('blackfin_tortuga_intro');
    reset();
    expect(useGameStore.getState().completedBlackfinStageIds).toEqual([]);
    expect(useGameStore.getState().currentBlackfinStageId).toBeNull();
  });
});

describe('Admiral Grace', () => {
  it('completeGraceStage is idempotent', () => {
    expect(useGameStore.getState().completedGraceStageIds).toEqual([]);

    useGameStore.getState().completeGraceStage('grace_new_providence_intro');
    useGameStore.getState().completeGraceStage('grace_new_providence_intro');
    expect(useGameStore.getState().completedGraceStageIds).toEqual([
      'grace_new_providence_intro',
    ]);
  });

  it('setCurrentGraceStage tracks which stage the Grace screen should show', () => {
    expect(useGameStore.getState().currentGraceStageId).toBeNull();

    useGameStore.getState().setCurrentGraceStage('grace_new_providence_intro');
    expect(useGameStore.getState().currentGraceStageId).toBe('grace_new_providence_intro');

    useGameStore.getState().setCurrentGraceStage(null);
    expect(useGameStore.getState().currentGraceStageId).toBeNull();
  });

  it('debugResetSave clears completed stages and the current stage pointer', () => {
    useGameStore.getState().setCurrentGraceStage('grace_new_providence_intro');
    useGameStore.getState().completeGraceStage('grace_new_providence_intro');
    reset();
    expect(useGameStore.getState().completedGraceStageIds).toEqual([]);
    expect(useGameStore.getState().currentGraceStageId).toBeNull();
  });
});

describe('side quests', () => {
  it('completeSideQuest is idempotent — the gold reward is only granted once', () => {
    const goldBefore = useGameStore.getState().gold;
    useGameStore.getState().completeSideQuest('quest_cattle_rustler', 60);
    expect(useGameStore.getState().gold).toBe(goldBefore + 60);
    expect(useGameStore.getState().completedQuestIds).toEqual(['quest_cattle_rustler']);

    useGameStore.getState().completeSideQuest('quest_cattle_rustler', 60); // repeat completion
    expect(useGameStore.getState().gold).toBe(goldBefore + 60); // no double payout
    expect(useGameStore.getState().completedQuestIds).toEqual(['quest_cattle_rustler']); // no dupe
  });

  it('advanceQuestWave increments per-quest wave progress independently', () => {
    useGameStore.getState().advanceQuestWave('quest_merchant_convoy');
    useGameStore.getState().advanceQuestWave('quest_merchant_convoy');
    useGameStore.getState().advanceQuestWave('quest_pirate_council');
    const progress = useGameStore.getState().questWaveProgress;
    expect(progress.quest_merchant_convoy).toBe(2);
    expect(progress.quest_pirate_council).toBe(1);
  });

  it('completeRepeatableQuest pays out and reduces heat every time (not one-shot)', () => {
    useGameStore.getState().setHeat(50);
    const goldBefore = useGameStore.getState().gold;

    useGameStore.getState().completeRepeatableQuest('quest_bounty_board', 20, 15);
    expect(useGameStore.getState().gold).toBe(goldBefore + 20);
    expect(useGameStore.getState().heat).toBe(35);
    expect(useGameStore.getState().questTurnInCounts.quest_bounty_board).toBe(1);

    useGameStore.getState().completeRepeatableQuest('quest_bounty_board', 20, 15);
    expect(useGameStore.getState().gold).toBe(goldBefore + 40); // paid out again
    expect(useGameStore.getState().heat).toBe(20);
    expect(useGameStore.getState().questTurnInCounts.quest_bounty_board).toBe(2);
  });
});

describe('Pirate Lord defeats (the shared state the Council gate reads)', () => {
  it('defeatPirateLord is idempotent — a lord cannot be recorded as defeated twice', () => {
    useGameStore.getState().defeatPirateLord('lord_one');
    useGameStore.getState().defeatPirateLord('lord_one');
    useGameStore.getState().defeatPirateLord('lord_two');
    expect(useGameStore.getState().defeatedLordIds).toEqual(['lord_one', 'lord_two']);
  });
});

describe('the Black Pearl', () => {
  it('tracks capture and boarding independently, and boarding resets on disembark', () => {
    expect(useGameStore.getState().blackPearlCaptured).toBe(false);
    useGameStore.getState().captureBlackPearl();
    expect(useGameStore.getState().blackPearlCaptured).toBe(true);

    useGameStore.getState().boardBlackPearl();
    expect(useGameStore.getState().blackPearlBoarded).toBe(true);

    useGameStore.getState().disembarkBlackPearl({ x: 42, y: 99 });
    expect(useGameStore.getState().blackPearlBoarded).toBe(false);
    expect(useGameStore.getState().blackPearlPosition).toEqual({ x: 42, y: 99 });
    expect(useGameStore.getState().blackPearlCaptured).toBe(true); // capture itself doesn't reset
  });
});

describe('debugSetCrewLevel (the Debug-screen level jump, cascading promotions)', () => {
  it('cascades through every promotion stage a big level jump qualifies for', () => {
    const id = starterId();
    useGameStore.getState().debugSetCrewLevel(id, 25); // deckhand -> boarding_captain(10) -> duelist_first_mate(20)
    const member = useGameStore.getState().crew.find((m) => m.instanceId === id)!;
    expect(member.templateId).toBe('duelist_first_mate');
    expect(member.level).toBe(25);
    expect(member.xp).toBe(0);
    expect(useGameStore.getState().recruitedTemplateIds).toEqual(
      expect.arrayContaining(['boarding_captain', 'duelist_first_mate'])
    );
  });

  it('heals to the new max HP', () => {
    const id = starterId();
    useGameStore.getState().setCrewHp(id, 1);
    useGameStore.getState().debugSetCrewLevel(id, 8);
    const member = useGameStore.getState().crew.find((m) => m.instanceId === id)!;
    expect(member.currentHp).toBeGreaterThan(1);
  });
});
