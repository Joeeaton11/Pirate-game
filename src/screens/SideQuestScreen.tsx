import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CREW_TEMPLATES } from '../data/crew';
import { ITEMS } from '../data/items';
import { BOUNTY_TEMPLATES, SIDE_QUESTS } from '../data/sideQuests';
import { THREAT_TEMPLATES } from '../data/threats';
import { RootStackParamList } from '../navigation/types';
import { useGameStore } from '../store/gameStore';
import { maxHpFor } from '../utils/battle';

type Props = NativeStackScreenProps<RootStackParamList, 'SideQuest'>;

export default function SideQuestScreen({ navigation }: Props) {
  const currentSideQuestId = useGameStore((s) => s.currentSideQuestId);
  const acceptedQuestIds = useGameStore((s) => s.acceptedQuestIds);
  const completedQuestIds = useGameStore((s) => s.completedQuestIds);
  const acceptSideQuest = useGameStore((s) => s.acceptSideQuest);
  const completeSideQuest = useGameStore((s) => s.completeSideQuest);
  const setCurrentSideQuest = useGameStore((s) => s.setCurrentSideQuest);
  const setWildEncounter = useGameStore((s) => s.setWildEncounter);
  const inventory = useGameStore((s) => s.inventory);
  const consumeItem = useGameStore((s) => s.consumeItem);
  const crew = useGameStore((s) => s.crew);
  const shipCrewIds = useGameStore((s) => s.shipCrewIds);
  const questWaveProgress = useGameStore((s) => s.questWaveProgress);
  const questTurnInCounts = useGameStore((s) => s.questTurnInCounts);

  const quest = SIDE_QUESTS.find((q) => q.id === currentSideQuestId);

  if (!quest) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.dialogue}>There's nobody here.</Text>
          <Pressable style={styles.leaveButton} onPress={() => navigation.goBack()}>
            <Text style={styles.leaveButtonText}>Leave</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const isAccepted = acceptedQuestIds.includes(quest.id);
  const isCompleted = completedQuestIds.includes(quest.id);

  function handleLeave() {
    setCurrentSideQuest(null);
    navigation.goBack();
  }

  function handleAccept() {
    if (!quest) return;
    acceptSideQuest(quest.id);
  }

  function handleConfrontBounty() {
    if (!quest || quest.type !== 'bounty') return;
    const template = BOUNTY_TEMPLATES[quest.bountyTemplateId];
    const maxHp = maxHpFor(
      {
        instanceId: 'bounty',
        templateId: quest.bountyTemplateId,
        nickname: template.name,
        level: quest.bountyLevel,
        xp: 0,
        currentHp: 0,
      },
      template
    );
    setWildEncounter({
      templateId: quest.bountyTemplateId,
      level: quest.bountyLevel,
      currentHp: maxHp,
      faction: 'bounty',
      questId: quest.id,
    });
    navigation.navigate('Encounter');
  }

  function handleDeliverFetch() {
    if (!quest || quest.type !== 'fetch') return;
    consumeItem(quest.fetchItemId);
    completeSideQuest(quest.id, quest.goldReward);
  }

  function handleFulfillSpecialtyGate() {
    if (!quest || quest.type !== 'specialty_gate') return;
    completeSideQuest(quest.id, quest.goldReward);
  }

  function handleConfrontEscortWave() {
    if (!quest || quest.type !== 'escort') return;
    const waveIndex = questWaveProgress[quest.id] ?? 0;
    const templateId = quest.waveTemplateIds[waveIndex];
    const level = quest.waveLevels[waveIndex];
    const template = THREAT_TEMPLATES[templateId];
    const maxHp = maxHpFor(
      { instanceId: 'escort', templateId, nickname: template.name, level, xp: 0, currentHp: 0 },
      template
    );
    setWildEncounter({ templateId, level, currentHp: maxHp, faction: 'bounty', questId: quest.id });
    navigation.navigate('Encounter');
  }

  function handleConfrontHeatBounty() {
    if (!quest || quest.type !== 'heat_bounty') return;
    const pool = ['rival_deckhand', 'rival_corsair', 'navy_marine'];
    const templateId = pool[Math.floor(Math.random() * pool.length)];
    const level = 4 + Math.floor(Math.random() * 6);
    const template = THREAT_TEMPLATES[templateId];
    const maxHp = maxHpFor(
      { instanceId: 'heat_bounty', templateId, nickname: template.name, level, xp: 0, currentHp: 0 },
      template
    );
    setWildEncounter({ templateId, level, currentHp: maxHp, faction: 'bounty', questId: quest.id });
    navigation.navigate('Encounter');
  }

  const fetchItem = quest.type === 'fetch' ? ITEMS[quest.fetchItemId] : null;
  const fetchOwned = fetchItem ? inventory[fetchItem.id] ?? 0 : 0;
  const canDeliver = quest.type === 'fetch' && fetchOwned >= quest.fetchCount;

  const hasRequiredSpecialty =
    quest.type === 'specialty_gate' &&
    crew.some(
      (m) =>
        shipCrewIds.includes(m.instanceId) &&
        CREW_TEMPLATES[m.templateId]?.specialty === quest.requiredSpecialty
    );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.npcEmoji}>{quest.npcEmoji}</Text>
        <Text style={styles.npcName}>{quest.npcName}</Text>
        <Text style={styles.questTitle}>{quest.title}</Text>
      </View>

      <View style={styles.dialogueCard}>
        <Text style={styles.dialogue}>
          "
          {isCompleted
            ? quest.completeDialogue
            : isAccepted
            ? quest.acceptedDialogue
            : quest.introDialogue}
          "
        </Text>
      </View>

      {isCompleted && (
        <View style={styles.rewardBanner}>
          <Text style={styles.rewardBannerText}>✅ Quest complete — {quest.goldReward} gold earned</Text>
        </View>
      )}

      {isAccepted && !isCompleted && quest.type === 'fetch' && (
        <View style={styles.progressCard}>
          <Text style={styles.progressText}>
            {ITEMS[quest.fetchItemId].emoji} {fetchOwned}/{quest.fetchCount} {ITEMS[quest.fetchItemId].name}
          </Text>
        </View>
      )}

      {isAccepted && !isCompleted && quest.type === 'specialty_gate' && !hasRequiredSpecialty && (
        <View style={styles.progressCard}>
          <Text style={styles.progressText}>Needs a {quest.requiredSpecialty}-type crew member aboard</Text>
        </View>
      )}

      {isAccepted && !isCompleted && quest.type === 'escort' && (
        <View style={styles.progressCard}>
          <Text style={styles.progressText}>
            Wave {(questWaveProgress[quest.id] ?? 0) + 1}/{quest.waveTemplateIds.length}
          </Text>
        </View>
      )}

      {isAccepted && quest.type === 'heat_bounty' && (questTurnInCounts[quest.id] ?? 0) > 0 && (
        <View style={styles.progressCard}>
          <Text style={styles.progressText}>
            Turned in {questTurnInCounts[quest.id]} time{questTurnInCounts[quest.id] === 1 ? '' : 's'}
          </Text>
        </View>
      )}

      <View style={styles.actions}>
        {!isAccepted && !isCompleted && (
          <Pressable style={styles.acceptButton} onPress={handleAccept}>
            <Text style={styles.acceptButtonText}>Accept Quest ({quest.goldReward} gold)</Text>
          </Pressable>
        )}
        {isAccepted && !isCompleted && quest.type === 'bounty' && (
          <Pressable style={styles.actionButton} onPress={handleConfrontBounty}>
            <Text style={styles.actionButtonText}>Confront Lv.{quest.bountyLevel} Bounty</Text>
          </Pressable>
        )}
        {isAccepted && !isCompleted && quest.type === 'fetch' && (
          <Pressable
            style={[styles.actionButton, !canDeliver && styles.disabledButton]}
            onPress={handleDeliverFetch}
            disabled={!canDeliver}
          >
            <Text style={styles.actionButtonText}>Deliver</Text>
          </Pressable>
        )}
        {isAccepted && !isCompleted && quest.type === 'specialty_gate' && (
          <Pressable
            style={[styles.actionButton, !hasRequiredSpecialty && styles.disabledButton]}
            onPress={handleFulfillSpecialtyGate}
            disabled={!hasRequiredSpecialty}
          >
            <Text style={styles.actionButtonText}>Open the Vault</Text>
          </Pressable>
        )}
        {isAccepted && !isCompleted && quest.type === 'escort' && (
          <Pressable style={styles.actionButton} onPress={handleConfrontEscortWave}>
            <Text style={styles.actionButtonText}>
              Confront Wave {(questWaveProgress[quest.id] ?? 0) + 1}
            </Text>
          </Pressable>
        )}
        {isAccepted && quest.type === 'heat_bounty' && (
          <Pressable style={styles.actionButton} onPress={handleConfrontHeatBounty}>
            <Text style={styles.actionButtonText}>Confront a Target</Text>
          </Pressable>
        )}
        <Pressable style={styles.leaveButton} onPress={handleLeave}>
          <Text style={styles.leaveButtonText}>Leave</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#241a2e' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  header: { alignItems: 'center', paddingTop: 24, paddingBottom: 12 },
  npcEmoji: { fontSize: 56 },
  npcName: { color: '#f4e9cd', fontSize: 20, fontWeight: '800', marginTop: 8 },
  questTitle: { color: '#ffd166', fontSize: 14, fontStyle: 'italic', marginTop: 2 },
  dialogueCard: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
  },
  dialogue: {
    color: '#f4e9cd',
    fontStyle: 'italic',
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
  },
  rewardBanner: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderWidth: 1,
    borderColor: '#4caf50',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  rewardBannerText: { color: '#a5d6a7', fontWeight: '800', fontSize: 14 },
  progressCard: {
    backgroundColor: 'rgba(255, 209, 102, 0.12)',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  progressText: { color: '#ffd166', fontWeight: '700', fontSize: 13 },
  actions: { flex: 1, justifyContent: 'flex-end', padding: 20, gap: 10 },
  acceptButton: {
    backgroundColor: '#2c7a4b',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  acceptButtonText: { color: '#f4e9cd', fontWeight: '800', fontSize: 15 },
  actionButton: {
    backgroundColor: '#7a1f1f',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: { color: '#f4e9cd', fontWeight: '800', fontSize: 15 },
  disabledButton: { backgroundColor: '#4a4a4a' },
  leaveButton: {
    backgroundColor: '#f4e9cd',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  leaveButtonText: { color: '#241a2e', fontWeight: '800', fontSize: 15 },
});
