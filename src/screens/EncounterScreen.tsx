import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BLACK_PEARL_CAPTAIN_TEMPLATE, BLACK_PEARL_CAPTURED_LOG, BLACK_PEARL_INTRO_DIALOGUE } from '../data/blackPearl';
import { CREW_TEMPLATES } from '../data/crew';
import { ITEM_LIST, ITEMS } from '../data/items';
import { MOVES } from '../data/moves';
import { MERCHANT_CARGO, MERCHANT_TEMPLATES, merchantGoldReward } from '../data/merchants';
import { PIRATE_LORDS, PIRATE_LORD_TEMPLATES } from '../data/pirateLords';
import { RESOURCES } from '../data/resources';
import { BOUNTY_TEMPLATES, SIDE_QUESTS } from '../data/sideQuests';
import { THREAT_TEMPLATES } from '../data/threats';
import { RootStackParamList } from '../navigation/types';
import { EncounterFaction, useActiveCrewMember, useGameStore } from '../store/gameStore';
import {
  applyBadgeBoost,
  calcDamage,
  maxHpFor,
  recruitChance,
  statsAtLevel,
  xpRewardFor,
} from '../utils/battle';

type Props = NativeStackScreenProps<RootStackParamList, 'Encounter'>;

type Phase = 'battling' | 'victory' | 'defeat' | 'fled' | 'recruited';

const ALL_TEMPLATES = {
  ...CREW_TEMPLATES,
  ...THREAT_TEMPLATES,
  ...PIRATE_LORD_TEMPLATES,
  ...BOUNTY_TEMPLATES,
  ...MERCHANT_TEMPLATES,
  [BLACK_PEARL_CAPTAIN_TEMPLATE.id]: BLACK_PEARL_CAPTAIN_TEMPLATE,
};

function openingLine(faction: EncounterFaction | undefined, questId: string | undefined): string {
  if (faction === 'rival') return 'A rival pirate crew ambushes you!';
  if (faction === 'navy') return "Navy patrol closes in — you're a wanted pirate!";
  if (faction === 'lord') return 'The duel for a Letter of Marque begins!';
  if (faction === 'bounty') {
    const quest = questId ? SIDE_QUESTS.find((q) => q.id === questId) : undefined;
    if (quest?.id === 'quest_pirate_council') return 'The next captain of the Council steps up for their rematch!';
    if (quest?.type === 'escort') return 'Raiders close in on the convoy!';
    return 'You track down your bounty target!';
  }
  if (faction === 'merchant') return 'A merchant vessel comes into view — ripe for plunder!';
  if (faction === 'rescue') return 'You storm the holding cell to break your crewmate loose!';
  if (faction === 'blackpearl') return BLACK_PEARL_INTRO_DIALOGUE;
  return 'A wild pirate blocks your path!';
}

interface FallenSnapshot {
  emoji: string;
  nickname: string;
  level: number;
  maxHp: number;
}

export default function EncounterScreen({ navigation }: Props) {
  const wildEncounter = useGameStore((s) => s.wildEncounter);
  const gold = useGameStore((s) => s.gold);
  const gainXp = useGameStore((s) => s.gainXp);
  const addGold = useGameStore((s) => s.addGold);
  const setCrewHp = useGameStore((s) => s.setCrewHp);
  const addCrewMember = useGameStore((s) => s.addCrewMember);
  const removeCrewMember = useGameStore((s) => s.removeCrewMember);
  const rescueCrewMember = useGameStore((s) => s.rescueCrewMember);
  const capturedCrew = useGameStore((s) => s.capturedCrew);
  const setWildEncounter = useGameStore((s) => s.setWildEncounter);
  const healAllCrew = useGameStore((s) => s.healAllCrew);
  const addHeat = useGameStore((s) => s.addHeat);
  const addResource = useGameStore((s) => s.addResource);
  const setHeat = useGameStore((s) => s.setHeat);
  const inventory = useGameStore((s) => s.inventory);
  const consumeItem = useGameStore((s) => s.consumeItem);
  const defeatedLordIds = useGameStore((s) => s.defeatedLordIds);
  const defeatPirateLord = useGameStore((s) => s.defeatPirateLord);
  const captureBlackPearl = useGameStore((s) => s.captureBlackPearl);
  const completeSideQuest = useGameStore((s) => s.completeSideQuest);
  const advanceQuestWave = useGameStore((s) => s.advanceQuestWave);
  const completeRepeatableQuest = useGameStore((s) => s.completeRepeatableQuest);
  const questWaveProgress = useGameStore((s) => s.questWaveProgress);
  const markSeen = useGameStore((s) => s.markSeen);
  const crew = useGameStore((s) => s.crew);
  const shipCrewIds = useGameStore((s) => s.shipCrewIds);
  const setActiveCrew = useGameStore((s) => s.setActiveCrew);
  const activeCrew = useActiveCrewMember();
  const liveCrewMember = useGameStore((s) =>
    s.crew.find((m) => m.instanceId === activeCrew?.instanceId)
  );

  const [log, setLog] = useState<string[]>(() => [
    openingLine(
      useGameStore.getState().wildEncounter?.faction,
      useGameStore.getState().wildEncounter?.questId
    ),
  ]);
  const [phase, setPhase] = useState<Phase>('battling');
  const [busy, setBusy] = useState(false);
  const [fallenSnapshot, setFallenSnapshot] = useState<FallenSnapshot | null>(null);
  const [fallenInstanceId, setFallenInstanceId] = useState<string | null>(null);
  const [rescueMessage, setRescueMessage] = useState<string | null>(null);
  const [showItemMenu, setShowItemMenu] = useState(false);
  const [nextAttackBoost, setNextAttackBoost] = useState(1);
  const [guaranteedRecruit, setGuaranteedRecruit] = useState(false);
  const [awaitingSwitch, setAwaitingSwitch] = useState(false);

  useEffect(() => {
    if (wildEncounter?.faction === 'wild') {
      markSeen(wildEncounter.templateId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wildEncounter?.templateId, wildEncounter?.faction]);

  if (!wildEncounter || !activeCrew || !liveCrewMember) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.logText}>No encounter in progress.</Text>
          <Pressable style={styles.actionButton} onPress={() => navigation.goBack()}>
            <Text style={styles.actionButtonText}>Return to Map</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const encounter = wildEncounter;
  const crewMember = liveCrewMember;
  const isAmbush = encounter.faction !== 'wild';
  const wildTemplate = ALL_TEMPLATES[encounter.templateId];
  const playerTemplate = CREW_TEMPLATES[crewMember.templateId];
  const wildMaxHp = maxHpFor(
    {
      instanceId: 'wild',
      templateId: encounter.templateId,
      nickname: wildTemplate.name,
      level: encounter.level,
      xp: 0,
      currentHp: 0,
    },
    wildTemplate
  );
  const playerMaxHp = maxHpFor(crewMember);
  const wildStats = statsAtLevel(wildTemplate, encounter.level);
  const playerStats = applyBadgeBoost(
    statsAtLevel(playerTemplate, crewMember.level),
    defeatedLordIds.length
  );

  function appendLog(line: string) {
    setLog((prev) => [...prev.slice(-5), line]);
  }

  function endBattle(nextPhase: Phase) {
    setPhase(nextPhase);
  }

  function enemyTurn() {
    const moveId =
      wildTemplate.moveIds[Math.floor(Math.random() * wildTemplate.moveIds.length)];
    const result = calcDamage(moveId, wildStats, playerStats, playerTemplate.specialty);
    if (!result.hit) {
      appendLog(`${wildTemplate.name}'s ${MOVES[moveId].name} missed!`);
      return;
    }
    const newHp = Math.max(0, crewMember.currentHp - result.damage);
    setCrewHp(crewMember.instanceId, newHp);
    appendLog(
      `${wildTemplate.name} uses ${MOVES[moveId].name} for ${result.damage} damage.` +
        (result.effectivenessLabel ? ` ${result.effectivenessLabel}` : '')
    );
    if (newHp <= 0) {
      setFallenSnapshot({
        emoji: playerTemplate.emoji,
        nickname: crewMember.nickname,
        level: crewMember.level,
        maxHp: playerMaxHp,
      });
      setFallenInstanceId(crewMember.instanceId);
      const otherFighterAvailable = crew.some(
        (m) => m.instanceId !== crewMember.instanceId && shipCrewIds.includes(m.instanceId) && m.currentHp > 0
      );

      if (encounter.faction === 'navy' || encounter.faction === 'rival') {
        if (encounter.faction === 'navy') {
          const goldLost = Math.round(gold * 0.3);
          appendLog(
            `${crewMember.nickname} is captured and pressed into naval service — gone for good.`
          );
          if (goldLost > 0) {
            appendLog(`The crown seizes ${goldLost} gold from your hold.`);
            addGold(-goldLost);
          }
          setHeat(0);
        } else {
          appendLog(
            `${crewMember.nickname} is overwhelmed and taken prisoner by the rival crew — gone for good.`
          );
        }
        const rescued = removeCrewMember(
          crewMember.instanceId,
          encounter.faction === 'navy' ? 'navy' : 'rival'
        );
        if (rescued) {
          setRescueMessage(
            'Your crew is gone. A tavern drunk owes you a favor and signs on as your new cabin hand.'
          );
          endBattle('defeat');
          return;
        }
        if (otherFighterAvailable) {
          setAwaitingSwitch(true);
        } else {
          healAllCrew();
          endBattle('defeat');
        }
        return;
      }

      appendLog(`${crewMember.nickname} has fainted!`);
      if (otherFighterAvailable) {
        setAwaitingSwitch(true);
      } else {
        appendLog('You retreat to Tortuga Cove.');
        healAllCrew();
        endBattle('defeat');
      }
    }
  }

  function handleSwitchCrew(instanceId: string) {
    setActiveCrew(instanceId);
    setFallenSnapshot(null);
    setFallenInstanceId(null);
    setAwaitingSwitch(false);
    const next = crew.find((m) => m.instanceId === instanceId);
    if (next) appendLog(`Go, ${next.nickname}!`);
  }

  function handleAttack(moveId: string) {
    if (busy || phase !== 'battling') return;
    setBusy(true);
    setShowItemMenu(false);
    const boost = nextAttackBoost;
    if (boost !== 1) setNextAttackBoost(1);
    const result = calcDamage(moveId, playerStats, wildStats, wildTemplate.specialty);
    if (!result.hit) {
      appendLog(`${crewMember.nickname}'s ${MOVES[moveId].name} missed!`);
      enemyTurn();
      setBusy(false);
      return;
    }

    const damage = Math.round(result.damage * boost);
    const newWildHp = Math.max(0, encounter.currentHp - damage);
    setWildEncounter({ ...encounter, currentHp: newWildHp });
    appendLog(
      `${crewMember.nickname} uses ${MOVES[moveId].name} for ${damage} damage.` +
        (result.effectivenessLabel ? ` ${result.effectivenessLabel}` : '') +
        (boost > 1 ? ' Empowered by grapeshot!' : '')
    );

    if (newWildHp <= 0) {
      const reward = xpRewardFor(encounter.templateId, encounter.level, wildTemplate);
      const isLordFight = encounter.faction === 'lord';
      const bountyQuest =
        encounter.faction === 'bounty' && encounter.questId
          ? SIDE_QUESTS.find((q) => q.id === encounter.questId)
          : undefined;
      const promotedTo = gainXp(crewMember.instanceId, reward);
      if (isLordFight) {
        const goldReward = 50 + encounter.level * 5;
        addGold(goldReward);
        const lord = PIRATE_LORDS.find((l) => l.id === encounter.templateId);
        defeatPirateLord(encounter.templateId);
        appendLog(
          `${wildTemplate.name} concedes! +${reward} XP, +${goldReward} gold, and the ${
            lord?.badgeName ?? 'marque'
          } is yours!`
        );
      } else if (encounter.faction === 'blackpearl') {
        const goldReward = 30;
        addGold(goldReward);
        captureBlackPearl();
        appendLog(`${BLACK_PEARL_CAPTURED_LOG} +${reward} XP, +${goldReward} gold.`);
      } else if (bountyQuest?.type === 'escort') {
        const waveIndex = questWaveProgress[bountyQuest.id] ?? 0;
        const isFinalWave = waveIndex + 1 >= bountyQuest.waveTemplateIds.length;
        if (isFinalWave) {
          completeSideQuest(bountyQuest.id, bountyQuest.goldReward);
          appendLog(
            `${wildTemplate.name} is driven off! The convoy makes it through — +${reward} XP, +${bountyQuest.goldReward} gold.`
          );
        } else {
          advanceQuestWave(bountyQuest.id);
          appendLog(
            `${wildTemplate.name} is driven off! Wave ${waveIndex + 1}/${
              bountyQuest.waveTemplateIds.length
            } survived — brace for the next. +${reward} XP.`
          );
        }
      } else if (bountyQuest?.type === 'heat_bounty') {
        completeRepeatableQuest(bountyQuest.id, bountyQuest.goldReward, bountyQuest.heatReduction);
        appendLog(
          `${wildTemplate.name} is defeated! +${reward} XP, +${bountyQuest.goldReward} gold, heat reduced by ${bountyQuest.heatReduction}.`
        );
      } else if (bountyQuest) {
        completeSideQuest(bountyQuest.id, bountyQuest.goldReward);
        appendLog(
          `${wildTemplate.name} is defeated! +${reward} XP, +${bountyQuest.goldReward} gold. Bounty claimed!`
        );
      } else if (encounter.faction === 'merchant') {
        const cargo = MERCHANT_CARGO[encounter.templateId];
        const goldReward = merchantGoldReward(encounter.level);
        addGold(goldReward);
        if (cargo) {
          const amount =
            cargo.minYield + Math.floor(Math.random() * (cargo.maxYield - cargo.minYield + 1));
          addResource(cargo.resourceId, amount);
          const resourceInfo = RESOURCES[cargo.resourceId];
          appendLog(
            `${wildTemplate.name} is plundered! +${reward} XP, +${goldReward} gold, +${amount} ${resourceInfo.emoji} ${resourceInfo.name}.`
          );
        } else {
          appendLog(`${wildTemplate.name} is plundered! +${reward} XP, +${goldReward} gold.`);
        }
        addHeat(10);
      } else if (encounter.faction === 'rescue' && encounter.rescueId) {
        const rescuedRecord = capturedCrew.find((c) => c.id === encounter.rescueId);
        rescueCrewMember(encounter.rescueId);
        addHeat(8);
        appendLog(
          `The guard is beaten back! ${
            rescuedRecord?.nickname ?? 'Your crewmate'
          } is free and rejoins the crew, worse for wear. +${reward} XP.`
        );
      } else {
        const goldReward = 5 + encounter.level * 2;
        addGold(goldReward);
        appendLog(`${wildTemplate.name} is defeated! +${reward} XP, +${goldReward} gold.`);
        addHeat(encounter.faction === 'navy' ? 6 : encounter.faction === 'rival' ? 4 : 2);
      }
      if (promotedTo) {
        appendLog(`${crewMember.nickname} is promoted to ${CREW_TEMPLATES[promotedTo].name}!`);
      }
      endBattle('victory');
      setBusy(false);
      return;
    }

    enemyTurn();
    setBusy(false);
  }

  function handleRecruit() {
    if (busy || phase !== 'battling' || isAmbush) return;
    setBusy(true);
    setShowItemMenu(false);
    const forced = guaranteedRecruit;
    if (forced) setGuaranteedRecruit(false);
    const chance = forced ? 1 : recruitChance(encounter.templateId, encounter.currentHp, wildMaxHp);
    const success = Math.random() < chance;
    if (success) {
      const boardedShip = addCrewMember(encounter.templateId, encounter.level);
      appendLog(
        boardedShip
          ? `${wildTemplate.name} joins your crew!`
          : `${wildTemplate.name} joins your crew, but your ship is full — they wait in the Crew Quarters.`
      );
      addHeat(2);
      endBattle('recruited');
      setBusy(false);
      return;
    }
    appendLog(`${wildTemplate.name} resists joining your crew.`);
    enemyTurn();
    setBusy(false);
  }

  function handleUseItem(itemId: string) {
    if (busy || phase !== 'battling') return;
    const item = ITEMS[itemId];
    if ((inventory[itemId] ?? 0) <= 0) return;
    setBusy(true);
    setShowItemMenu(false);
    consumeItem(itemId);
    if (item.effect === 'heal') {
      const healAmount = Math.round(playerMaxHp * (item.healPercent ?? 0));
      const newHp = Math.min(playerMaxHp, crewMember.currentHp + healAmount);
      const actualHealed = newHp - crewMember.currentHp;
      setCrewHp(crewMember.instanceId, newHp);
      appendLog(`${crewMember.nickname} uses ${item.name} and recovers ${actualHealed} HP.`);
    } else if (item.effect === 'battle_boost') {
      setNextAttackBoost(item.boostMultiplier ?? 1);
      appendLog(`${crewMember.nickname} primes a ${item.name} for the next strike!`);
    } else if (item.effect === 'guaranteed_recruit') {
      setGuaranteedRecruit(true);
      appendLog(`You ready the ${item.name}, certain it'll seal the deal.`);
    }
    enemyTurn();
    setBusy(false);
  }

  function handleFlee() {
    if (busy || phase !== 'battling') return;
    setBusy(true);
    setShowItemMenu(false);
    const success = Math.random() < 0.7;
    if (success) {
      appendLog('You slip away safely.');
      endBattle('fled');
      setBusy(false);
      return;
    }
    appendLog('Could not escape!');
    enemyTurn();
    setBusy(false);
  }

  const resolved = phase !== 'battling';
  const canFlee = encounter.faction !== 'lord';
  const activeSideQuest =
    encounter.faction === 'bounty' && encounter.questId
      ? SIDE_QUESTS.find((q) => q.id === encounter.questId)
      : undefined;
  const usableItems = ITEM_LIST.filter(
    (item) =>
      item.usableInBattle &&
      (inventory[item.id] ?? 0) > 0 &&
      !(isAmbush && item.effect === 'guaranteed_recruit')
  );
  const displayEmoji = fallenSnapshot ? fallenSnapshot.emoji : playerTemplate.emoji;
  const displayName = fallenSnapshot ? fallenSnapshot.nickname : crewMember.nickname;
  const displayLevel = fallenSnapshot ? fallenSnapshot.level : crewMember.level;
  const displayHp = fallenSnapshot ? 0 : crewMember.currentHp;
  const displayMaxHp = fallenSnapshot ? fallenSnapshot.maxHp : playerMaxHp;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {isAmbush && (
        <View style={styles.ambushBanner}>
          <Text style={styles.ambushBannerText}>
            {encounter.faction === 'navy'
              ? '⚜️ NAVY AMBUSH'
              : encounter.faction === 'lord'
              ? '🏆 LETTER OF MARQUE DUEL'
              : encounter.faction === 'blackpearl'
              ? '🚢 DUEL FOR THE BLACK PEARL'
              : encounter.faction === 'merchant'
              ? '💰 PLUNDER OPPORTUNITY'
              : encounter.faction === 'bounty'
              ? activeSideQuest?.id === 'quest_pirate_council'
                ? '👑 PIRATE COUNCIL REMATCH'
                : activeSideQuest?.type === 'escort'
                ? '⚔️ CONVOY UNDER ATTACK'
                : '📜 BOUNTY HUNT'
              : encounter.faction === 'rescue'
              ? '🔓 PRISON BREAK'
              : '☠️ RIVAL AMBUSH'}
          </Text>
        </View>
      )}
      <View style={styles.combatants}>
        <View style={styles.combatantCard}>
          <Text style={styles.emoji}>{wildTemplate.emoji}</Text>
          <Text style={styles.name}>
            {isAmbush ? '' : 'Wild '}
            {wildTemplate.name} Lv.{encounter.level}
          </Text>
          <HpBar current={encounter.currentHp} max={wildMaxHp} />
        </View>
        <Text style={styles.vs}>VS</Text>
        <View style={styles.combatantCard}>
          <Text style={styles.emoji}>{displayEmoji}</Text>
          <Text style={styles.name}>
            {displayName} Lv.{displayLevel}
          </Text>
          <HpBar current={displayHp} max={displayMaxHp} />
        </View>
      </View>

      <ScrollView style={styles.log} contentContainerStyle={{ padding: 12 }}>
        {log.map((line, i) => (
          <Text key={i} style={styles.logText}>
            {line}
          </Text>
        ))}
        {rescueMessage && <Text style={styles.rescueText}>{rescueMessage}</Text>}
      </ScrollView>

      {!resolved && awaitingSwitch && (
        <View style={styles.actions}>
          <Text style={styles.switchPromptText}>Choose your next fighter:</Text>
          {crew
            .filter(
              (m) =>
                m.instanceId !== fallenInstanceId &&
                shipCrewIds.includes(m.instanceId) &&
                m.currentHp > 0
            )
            .map((member) => {
              const template = CREW_TEMPLATES[member.templateId];
              const memberMaxHp = maxHpFor(member);
              return (
                <Pressable
                  key={member.instanceId}
                  style={styles.itemMenuButton}
                  onPress={() => handleSwitchCrew(member.instanceId)}
                >
                  <Text style={styles.itemMenuButtonText}>
                    {template.emoji} {member.nickname} Lv.{member.level} ({member.currentHp}/
                    {memberMaxHp} HP)
                  </Text>
                </Pressable>
              );
            })}
        </View>
      )}

      {!resolved && !awaitingSwitch && showItemMenu && (
        <View style={styles.actions}>
          {usableItems.map((item) => (
            <Pressable
              key={item.id}
              style={styles.itemMenuButton}
              onPress={() => handleUseItem(item.id)}
              disabled={busy}
            >
              <Text style={styles.itemMenuButtonText}>
                {item.emoji} {item.name} (x{inventory[item.id] ?? 0})
              </Text>
            </Pressable>
          ))}
          <Pressable style={styles.secondaryButton} onPress={() => setShowItemMenu(false)}>
            <Text style={styles.secondaryButtonText}>Back</Text>
          </Pressable>
        </View>
      )}

      {!resolved && !awaitingSwitch && !showItemMenu && (
        <View style={styles.actions}>
          <View style={styles.movesRow}>
            {playerTemplate.moveIds.map((moveId) => (
              <Pressable
                key={moveId}
                style={styles.moveButton}
                onPress={() => handleAttack(moveId)}
                disabled={busy}
              >
                <Text style={styles.moveButtonText}>{MOVES[moveId].name}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.movesRow}>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => setShowItemMenu(true)}
              disabled={busy || usableItems.length === 0}
            >
              <Text style={styles.secondaryButtonText}>Item</Text>
            </Pressable>
            {!isAmbush && (
              <Pressable style={styles.secondaryButton} onPress={handleRecruit} disabled={busy}>
                <Text style={styles.secondaryButtonText}>Recruit</Text>
              </Pressable>
            )}
            {canFlee && (
              <Pressable style={styles.secondaryButton} onPress={handleFlee} disabled={busy}>
                <Text style={styles.secondaryButtonText}>Flee</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}

      {resolved && (
        <View style={styles.actions}>
          <Pressable
            style={styles.actionButton}
            onPress={() => {
              setWildEncounter(null);
              navigation.goBack();
            }}
          >
            <Text style={styles.actionButtonText}>Return to Map</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

function HpBar({ current, max }: { current: number; max: number }) {
  const pct = Math.max(0, Math.min(1, current / max));
  const color = pct > 0.5 ? '#4caf50' : pct > 0.2 ? '#ffb300' : '#e53935';
  return (
    <View style={styles.hpBarTrack}>
      <View style={[styles.hpBarFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      <Text style={styles.hpText}>
        {Math.max(0, current)}/{max}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0b3d5c' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  ambushBanner: {
    backgroundColor: '#7a1f1f',
    paddingVertical: 6,
    alignItems: 'center',
  },
  ambushBannerText: {
    color: '#ffd166',
    fontWeight: '800',
    letterSpacing: 1,
  },
  combatants: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 20,
  },
  combatantCard: { alignItems: 'center', width: '42%' },
  emoji: { fontSize: 48 },
  name: { color: '#f4e9cd', fontWeight: '700', marginTop: 4, textAlign: 'center' },
  vs: { color: '#ffd166', fontWeight: '800', fontSize: 18 },
  hpBarTrack: {
    width: '100%',
    height: 16,
    backgroundColor: '#123',
    borderRadius: 8,
    marginTop: 8,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  hpBarFill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 8 },
  hpText: { fontSize: 10, color: '#fff', textAlign: 'center', fontWeight: '700' },
  log: {
    flex: 1,
    backgroundColor: '#062331',
    marginHorizontal: 12,
    borderRadius: 12,
  },
  logText: { color: '#f4e9cd', marginBottom: 4 },
  rescueText: { color: '#ffd166', fontWeight: '700', marginTop: 8 },
  switchPromptText: {
    color: '#ffd166',
    fontWeight: '800',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  actions: { padding: 12 },
  movesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  moveButton: {
    flexGrow: 1,
    backgroundColor: '#2c7a4b',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: '45%',
  },
  moveButtonText: { color: '#f4e9cd', fontWeight: '700' },
  secondaryButton: {
    flexGrow: 1,
    backgroundColor: '#8a5a2b',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButtonText: { color: '#f4e9cd', fontWeight: '700' },
  itemMenuButton: {
    backgroundColor: '#2c5a7a',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  itemMenuButtonText: { color: '#f4e9cd', fontWeight: '700' },
  actionButton: {
    backgroundColor: '#f4e9cd',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: { color: '#0b3d5c', fontWeight: '800', fontSize: 16 },
});
