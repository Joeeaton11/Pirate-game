import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
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
import { BattleBackdrop } from '../utils/battleBackdrop';

type Props = NativeStackScreenProps<RootStackParamList, 'Encounter'>;

type Phase = 'battling' | 'victory' | 'defeat' | 'fled' | 'recruited';

// Battle layout redesign (2026-08-09, item 55): a small badge next to each name so the
// blade/musket/cannon/curse/brawler effectiveness triangle in battle.ts is visible at a
// glance instead of a hidden dice roll.
const SPECIALTY_ICON: Record<string, string> = {
  blade: '⚔️',
  musket: '🔫',
  cannon: '💣',
  brawler: '👊',
  curse: '🔮',
};

// Contextual backdrops (2026-08-09, item 56): "Backdrop will change and be specific to where the
// battle happens. Town background... jungle, beach, sea, on boats." Which scene renders is decided
// once, at the moment an encounter starts (see classifyBackdrop in battleBackdrop.ts and every
// setWildEncounter call site), and carried on the encounter record — this screen just paints
// whatever it's told.
type Offset = number | `${number}%`;
interface Decoration {
  emoji: string;
  size: number;
  opacity: number;
  top?: Offset;
  bottom?: Offset;
  left?: Offset;
  right?: Offset;
}
interface BackdropTheme {
  gradient: [string, string, ...string[]];
  groundTint: string;
  decorations: Decoration[];
  bars?: boolean; // jail cell bars overlay
}
const BACKDROP_THEME: Record<BattleBackdrop, BackdropTheme> = {
  town: {
    gradient: ['#40331f', '#241c14', '#241c14'],
    groundTint: 'rgba(120,102,74,0.4)',
    decorations: [
      { emoji: '🏠', size: 30, opacity: 0.55, top: 6, left: 8 },
      { emoji: '⛪', size: 34, opacity: 0.5, top: 0, left: '42%' },
      { emoji: '🏚️', size: 28, opacity: 0.5, top: 8, right: 10 },
    ],
  },
  jungle: {
    gradient: ['#1c3d26', '#0f2417', '#0f2417'],
    groundTint: 'rgba(63,82,38,0.45)',
    decorations: [
      { emoji: '🌴', size: 34, opacity: 0.6, top: 4, left: 6 },
      { emoji: '🌳', size: 42, opacity: 0.55, top: -4, left: '38%' },
      { emoji: '🌳', size: 32, opacity: 0.55, top: 6, right: 8 },
    ],
  },
  beach: {
    gradient: ['#3f7186', '#e8cf8f', '#e8cf8f'],
    groundTint: 'rgba(224,196,140,0.55)',
    decorations: [
      { emoji: '🌴', size: 40, opacity: 0.7, top: 0, left: 6 },
      { emoji: '🌊', size: 24, opacity: 0.4, top: 92, left: '32%' },
      { emoji: '🐚', size: 18, opacity: 0.55, bottom: 6, right: 30 },
    ],
  },
  sea: {
    gradient: ['#173d57', '#0b3d5c', '#0b3d5c'],
    groundTint: 'rgba(90,58,31,0.4)',
    decorations: [
      { emoji: '🌊', size: 22, opacity: 0.35, top: 4, left: '28%' },
      { emoji: '⛵', size: 26, opacity: 0.35, top: 6, right: 14 },
    ],
  },
  fort: {
    gradient: ['#4f4c47', '#221f1c', '#221f1c'],
    groundTint: 'rgba(90,86,78,0.5)',
    decorations: [
      { emoji: '🏰', size: 42, opacity: 0.5, top: -6, left: '36%' },
      { emoji: '💣', size: 22, opacity: 0.55, top: 8, left: 4 },
      { emoji: '💣', size: 22, opacity: 0.55, top: 8, right: 4 },
    ],
  },
  jail: {
    gradient: ['#33281d', '#140f0a', '#140f0a'],
    groundTint: 'rgba(58,47,36,0.5)',
    decorations: [
      { emoji: '🔥', size: 22, opacity: 0.75, top: 8, left: 10 },
      { emoji: '🔥', size: 22, opacity: 0.75, top: 8, right: 10 },
      { emoji: '⛓️', size: 26, opacity: 0.5, bottom: 92, left: '46%' },
    ],
    bars: true,
  },
};

function BackdropDecorations({ backdrop }: { backdrop: BattleBackdrop }) {
  const theme = BACKDROP_THEME[backdrop];
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {theme.decorations.map((d, i) => (
        <Text
          key={i}
          style={{
            position: 'absolute',
            fontSize: d.size,
            opacity: d.opacity,
            top: d.top,
            bottom: d.bottom,
            left: d.left,
            right: d.right,
          }}
        >
          {d.emoji}
        </Text>
      ))}
      {theme.bars && (
        <View style={styles.jailBarsRow}>
          {Array.from({ length: 7 }).map((_, i) => (
            <View key={i} style={styles.jailBar} />
          ))}
        </View>
      )}
    </View>
  );
}

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
  const backdrop: BattleBackdrop = encounter.backdrop ?? 'sea';
  const backdropTheme = BACKDROP_THEME[backdrop];
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
      <LinearGradient colors={backdropTheme.gradient} style={styles.scene}>
        <BackdropDecorations backdrop={backdrop} />
        <View style={[styles.combatant, styles.combatantFoe]}>
          <View style={[styles.tag, styles.tagFoe]}>
            <Text style={styles.tagText}>🏴‍☠️ Foe</Text>
          </View>
          <Text style={styles.emojiFoe}>{wildTemplate.emoji}</Text>
          <View style={[styles.nameRow, styles.nameRowFoe]}>
            <Text style={styles.specBadge}>{SPECIALTY_ICON[wildTemplate.specialty]}</Text>
            <Text style={[styles.name, styles.nameFoe]}>
              {isAmbush ? '' : 'Wild '}
              {wildTemplate.name} Lv.{encounter.level}
            </Text>
          </View>
          <HpBar current={encounter.currentHp} max={wildMaxHp} align="flex-end" />
          <View style={[styles.plank, styles.plankFoe, { backgroundColor: backdropTheme.groundTint }]} />
        </View>
        <View style={[styles.combatant, styles.combatantYou]}>
          <View style={[styles.tag, styles.tagYou]}>
            <Text style={styles.tagText}>🏴 You</Text>
          </View>
          <Text style={styles.emojiYou}>{displayEmoji}</Text>
          <View style={styles.nameRow}>
            <Text style={styles.specBadge}>{SPECIALTY_ICON[playerTemplate.specialty]}</Text>
            <Text style={[styles.name, styles.nameYou]}>
              {displayName} Lv.{displayLevel}
            </Text>
          </View>
          <HpBar current={displayHp} max={displayMaxHp} align="flex-start" />
          <View style={[styles.plank, styles.plankYou, { backgroundColor: backdropTheme.groundTint }]} />
        </View>
      </LinearGradient>

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

function HpBar({
  current,
  max,
  color,
  align = 'flex-start',
}: {
  current: number;
  max: number;
  color?: string;
  align?: 'flex-start' | 'flex-end';
}) {
  const pct = Math.max(0, Math.min(1, current / max));
  const fillColor = color ?? (pct > 0.5 ? '#4caf50' : pct > 0.2 ? '#ffb300' : '#e53935');
  return (
    <View style={[styles.hpBarTrack, { alignSelf: align }]}>
      <View style={[styles.hpBarFill, { width: `${pct * 100}%`, backgroundColor: fillColor }]} />
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
  scene: {
    flex: 1.2,
    flexDirection: 'column',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  combatant: { gap: 5 },
  combatantFoe: { alignSelf: 'flex-end', alignItems: 'flex-end', width: '68%', marginBottom: 36 },
  combatantYou: { alignSelf: 'flex-start', alignItems: 'flex-start', width: '74%' },
  tag: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
  },
  tagYou: { backgroundColor: 'rgba(255,209,102,0.18)' },
  tagFoe: { backgroundColor: 'rgba(255,138,117,0.18)' },
  tagText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, color: '#f4e9cd' },
  emojiFoe: { fontSize: 40, textShadowColor: 'rgba(0,0,0,0.35)', textShadowRadius: 6, textShadowOffset: { width: 0, height: 4 } },
  emojiYou: { fontSize: 48, textShadowColor: 'rgba(0,0,0,0.35)', textShadowRadius: 6, textShadowOffset: { width: 0, height: 4 } },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.32)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  nameRowFoe: { flexDirection: 'row-reverse' },
  specBadge: { fontSize: 15 },
  name: { fontWeight: '700', fontSize: 13 },
  nameYou: { color: '#ffd166' },
  nameFoe: { color: '#ff8a75' },
  plank: {
    height: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(90,58,31,0.4)',
    marginTop: 2,
  },
  plankYou: { width: 96 },
  plankFoe: { width: 82 },
  jailBarsRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  jailBar: {
    width: 5,
    backgroundColor: 'rgba(196,192,184,0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 0,
  },
  hpBarTrack: {
    width: 140,
    height: 14,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  hpBarFill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 8 },
  hpText: { fontSize: 10, color: '#fff', textAlign: 'center', fontWeight: '700' },
  log: {
    flex: 0.8,
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
