import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CREW_TEMPLATES } from '../data/crew';
import { RootStackParamList } from '../navigation/types';
import { useGameStore } from '../store/gameStore';
import { maxHpFor, xpToNextLevel } from '../utils/battle';
import { OwnedCrewMember } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Crew'>;

export default function CrewScreen({ navigation }: Props) {
  const crew = useGameStore((s) => s.crew);
  const activeCrewId = useGameStore((s) => s.activeCrewId);
  const setActiveCrew = useGameStore((s) => s.setActiveCrew);
  const gold = useGameStore((s) => s.gold);

  function renderItem({ item }: { item: OwnedCrewMember }) {
    const template = CREW_TEMPLATES[item.templateId];
    const maxHp = maxHpFor(item);
    const isActive = item.instanceId === activeCrewId;
    const isFainted = item.currentHp <= 0;

    return (
      <Pressable
        style={[styles.card, isActive && styles.cardActive]}
        onPress={() => !isFainted && setActiveCrew(item.instanceId)}
        disabled={isFainted}
      >
        <Text style={styles.emoji}>{template.emoji}</Text>
        <View style={styles.info}>
          <Text style={styles.name}>
            {item.nickname} {isActive && '★'}
          </Text>
          <Text style={styles.subtext}>
            Lv.{item.level} · {template.specialty} · {template.rarity}
          </Text>
          <View style={styles.hpBarTrack}>
            <View
              style={[
                styles.hpBarFill,
                {
                  width: `${Math.max(0, (item.currentHp / maxHp) * 100)}%`,
                  backgroundColor: isFainted ? '#555' : '#4caf50',
                },
              ]}
            />
          </View>
          <Text style={styles.subtext}>
            {isFainted ? 'Fainted' : `${item.currentHp}/${maxHp} HP`} · XP {item.xp}/
            {xpToNextLevel(item.level)}
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Crew Roster</Text>
        <Text style={styles.headerText}>💰 {gold} gold</Text>
      </View>
      <FlatList
        data={crew}
        keyExtractor={(item) => item.instanceId}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back to Map</Text>
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
  listContent: { paddingHorizontal: 12, paddingBottom: 12, gap: 10 },
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
  cardActive: { borderColor: '#ffd166' },
  emoji: { fontSize: 36 },
  info: { flex: 1 },
  name: { color: '#f4e9cd', fontWeight: '700', fontSize: 16 },
  subtext: { color: '#cfe3ee', fontSize: 12, marginTop: 2 },
  hpBarTrack: {
    height: 8,
    backgroundColor: '#062331',
    borderRadius: 4,
    marginTop: 6,
    overflow: 'hidden',
  },
  hpBarFill: { height: '100%', borderRadius: 4 },
  backButton: {
    margin: 16,
    backgroundColor: '#f4e9cd',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  backButtonText: { color: '#0b3d5c', fontWeight: '800', fontSize: 16 },
});
