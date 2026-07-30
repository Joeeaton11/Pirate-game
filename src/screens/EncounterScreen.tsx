import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CREW_TEMPLATES } from '../data/crew';
import { MOVES } from '../data/moves';
import { THREAT_TEMPLATES } from '../data/threats';
import { RootStackParamList } from '../navigation/types';
import { useActiveCrewMember, useGameStore } from '../store/gameStore';
import {
  calcDamage,
  maxHpFor,
  recruitChance,
  statsAtLevel,
  xpRewardFor,
} from '../utils/battle';

type Props = NativeStackScreenProps<RootStackParamList, 'Encounter'>;

type Phase = 'battling' | 'victory' | 'defeat' | 'fled' | 'recruited';

const ALL_TEMPLATES = { ...CREW_TEMPLATES, ...THREAT_TEMPLATES };

function openingLine(faction: 'wild' | 'rival' | 'navy' | undefined): string {
  if (faction === 'rival') return 'A rival pirate crew ambushes you!';
  if (faction === 'navy') return "Navy patrol closes in — you're a wanted pirate!";
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
  const setWildEncounter = useGameStore((s) => s.setWildEncounter);
  const healAllCrew = useGameStore((s) => s.healAllCrew);
  const addHeat = useGameStore((s) => s.addHeat);
  const setHeat = useGameStore((s) => s.setHeat);
  const activeCrew = useActiveCrewMember();
  const liveCrewMember = useGameStore((s) =>
    s.crew.find((m) => m.instanceId === activeCrew?.instanceId)
  );

  const [log, setLog] = useState<string[]>(() => [
    openingLine(useGameStore.getState().wildEncounter?.faction),
  ]);
  const [phase, setPhase] = useState<Phase>('battling');
  const [busy, setBusy] = useState(false);
  const [fallenSnapshot, setFallenSnapshot] = useState<FallenSnapshot | null>(null);
  const [rescueMessage, setRescueMessage] = useState<string | null>(null);

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
  const playerStats = statsAtLevel(playerTemplate, crewMember.level);

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
      if (encounter.faction === 'navy') {
        const goldLost = Math.round(gold * 0.3);
        appendLog(`${crewMember.nickname} is captured, arrested, and hanged at the gallows!`);
        if (goldLost > 0) {
          appendLog(`The crown seizes ${goldLost} gold from your hold.`);
          addGold(-goldLost);
        }
        setHeat(0);
        const rescued = removeCrewMember(crewMember.instanceId);
        if (rescued) {
          setRescueMessage(
            'Your crew is gone. A tavern drunk owes you a favor and signs on as your new cabin hand.'
          );
        }
      } else if (encounter.faction === 'rival') {
        appendLog(`${crewMember.nickname} is cut down by the rival crew!`);
        const rescued = removeCrewMember(crewMember.instanceId);
        if (rescued) {
          setRescueMessage(
            'Your crew is gone. A tavern drunk owes you a favor and signs on as your new cabin hand.'
          );
        }
      } else {
        appendLog(`${crewMember.nickname} has fainted! You retreat to Tortuga Cove.`);
        healAllCrew();
      }
      endBattle('defeat');
    }
  }

  function handleAttack(moveId: string) {
    if (busy || phase !== 'battling') return;
    setBusy(true);
    const result = calcDamage(moveId, playerStats, wildStats, wildTemplate.specialty);
    if (!result.hit) {
      appendLog(`${crewMember.nickname}'s ${MOVES[moveId].name} missed!`);
      enemyTurn();
      setBusy(false);
      return;
    }

    const newWildHp = Math.max(0, encounter.currentHp - result.damage);
    setWildEncounter({ ...encounter, currentHp: newWildHp });
    appendLog(
      `${crewMember.nickname} uses ${MOVES[moveId].name} for ${result.damage} damage.` +
        (result.effectivenessLabel ? ` ${result.effectivenessLabel}` : '')
    );

    if (newWildHp <= 0) {
      const reward = xpRewardFor(encounter.templateId, encounter.level, wildTemplate);
      const goldReward = 5 + encounter.level * 2;
      appendLog(`${wildTemplate.name} is defeated! +${reward} XP, +${goldReward} gold.`);
      gainXp(crewMember.instanceId, reward);
      addGold(goldReward);
      addHeat(encounter.faction === 'navy' ? 6 : encounter.faction === 'rival' ? 4 : 2);
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
    const chance = recruitChance(encounter.templateId, encounter.currentHp, wildMaxHp);
    const success = Math.random() < chance;
    if (success) {
      addCrewMember(encounter.templateId, encounter.level);
      appendLog(`${wildTemplate.name} joins your crew!`);
      addHeat(2);
      endBattle('recruited');
      setBusy(false);
      return;
    }
    appendLog(`${wildTemplate.name} resists joining your crew.`);
    enemyTurn();
    setBusy(false);
  }

  function handleFlee() {
    if (busy || phase !== 'battling') return;
    setBusy(true);
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
            {encounter.faction === 'navy' ? '⚜️ NAVY AMBUSH' : '☠️ RIVAL AMBUSH'}
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

      {!resolved && (
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
            {!isAmbush && (
              <Pressable style={styles.secondaryButton} onPress={handleRecruit} disabled={busy}>
                <Text style={styles.secondaryButtonText}>Recruit</Text>
              </Pressable>
            )}
            <Pressable style={styles.secondaryButton} onPress={handleFlee} disabled={busy}>
              <Text style={styles.secondaryButtonText}>Flee</Text>
            </Pressable>
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
  actionButton: {
    backgroundColor: '#f4e9cd',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: { color: '#0b3d5c', fontWeight: '800', fontSize: 16 },
});
