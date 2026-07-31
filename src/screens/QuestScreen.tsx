import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ISLANDS } from '../data/islands';
import { isLordUnlocked, PIRATE_LORDS, PirateLord } from '../data/pirateLords';
import { SIDE_QUESTS, SideQuest } from '../data/sideQuests';
import { RootStackParamList } from '../navigation/types';
import { useGameStore } from '../store/gameStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Quests'>;

export default function QuestScreen({ navigation }: Props) {
  const defeatedLordIds = useGameStore((s) => s.defeatedLordIds);
  const acceptedQuestIds = useGameStore((s) => s.acceptedQuestIds);
  const completedQuestIds = useGameStore((s) => s.completedQuestIds);
  const questTurnInCounts = useGameStore((s) => s.questTurnInCounts);
  const sortedLords = [...PIRATE_LORDS].sort((a, b) => a.order - b.order);
  const allDefeated = defeatedLordIds.length === PIRATE_LORDS.length;

  function renderLordCard(lord: PirateLord) {
    const isDefeated = defeatedLordIds.includes(lord.id);
    const isUnlocked = isLordUnlocked(lord, defeatedLordIds);
    const island = ISLANDS[lord.islandId];
    const status = isDefeated ? 'Defeated' : isUnlocked ? 'Available' : 'Locked';
    const statusColor = isDefeated ? '#4caf50' : isUnlocked ? '#ffd166' : '#777';

    return (
      <View key={lord.id} style={[styles.card, isDefeated && styles.cardDefeated]}>
        <Text style={styles.emoji}>{lord.emoji}</Text>
        <View style={styles.info}>
          <Text style={styles.name}>
            {lord.order}. {lord.name}
          </Text>
          <Text style={styles.subtext}>
            {lord.title} · {island.name} · Lv.{lord.level}
          </Text>
          <Text style={[styles.status, { color: statusColor }]}>{status}</Text>
        </View>
      </View>
    );
  }

  function renderQuestCard(quest: SideQuest) {
    const isCompleted = completedQuestIds.includes(quest.id);
    const isAccepted = acceptedQuestIds.includes(quest.id);
    const turnIns = questTurnInCounts[quest.id] ?? 0;
    const island = ISLANDS[quest.islandId];
    const status =
      quest.type === 'heat_bounty'
        ? isAccepted
          ? `Open${turnIns > 0 ? ` · ${turnIns} turned in` : ''}`
          : 'Available'
        : isCompleted
        ? 'Completed'
        : isAccepted
        ? 'Accepted'
        : 'Available';
    const statusColor = isCompleted ? '#4caf50' : isAccepted ? '#ff8c42' : '#ffd166';
    const typeLabel =
      quest.type === 'bounty'
        ? 'Bounty'
        : quest.type === 'fetch'
        ? 'Fetch'
        : quest.type === 'escort'
        ? 'Escort'
        : quest.type === 'heat_bounty'
        ? 'Bounty Board'
        : 'Specialty';

    return (
      <View key={quest.id} style={[styles.card, isCompleted && styles.cardDefeated]}>
        <Text style={styles.emoji}>{quest.npcEmoji}</Text>
        <View style={styles.info}>
          <Text style={styles.name}>{quest.title}</Text>
          <Text style={styles.subtext}>
            {typeLabel} · {island.name} · {quest.goldReward} gold
          </Text>
          <Text style={[styles.status, { color: statusColor }]}>{status}</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Letters of Marque</Text>
        <Text style={styles.headerText}>
          {defeatedLordIds.length}/{PIRATE_LORDS.length}
        </Text>
      </View>
      {allDefeated && (
        <View style={styles.completeBanner}>
          <Text style={styles.completeBannerText}>
            All five marques claimed — you're the terror of these waters.
          </Text>
        </View>
      )}
      <ScrollView contentContainerStyle={styles.listContent}>
        {sortedLords.map(renderLordCard)}

        <Text style={styles.sectionHeading}>
          Side Quests ({completedQuestIds.length}/{SIDE_QUESTS.length})
        </Text>
        {SIDE_QUESTS.map(renderQuestCard)}
      </ScrollView>
      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0b3d5c' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#f4e9cd' },
  headerText: { color: '#f4e9cd', fontSize: 15 },
  completeBanner: {
    backgroundColor: 'rgba(255, 209, 102, 0.15)',
    borderWidth: 1,
    borderColor: '#ffd166',
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 10,
    padding: 12,
  },
  completeBannerText: { color: '#ffd166', fontWeight: '700', textAlign: 'center' },
  listContent: { paddingHorizontal: 12, paddingBottom: 12, gap: 10 },
  sectionHeading: { color: '#ffd166', fontWeight: '800', fontSize: 14, marginTop: 8 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#124d73',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardDefeated: { borderColor: '#4caf50' },
  emoji: { fontSize: 36 },
  info: { flex: 1 },
  name: { color: '#f4e9cd', fontWeight: '700', fontSize: 16 },
  subtext: { color: '#cfe3ee', fontSize: 12, marginTop: 2 },
  status: { fontSize: 12, fontWeight: '800', marginTop: 4 },
  backButton: {
    margin: 16,
    backgroundColor: '#f4e9cd',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  backButtonText: { color: '#0b3d5c', fontWeight: '800', fontSize: 16 },
});
