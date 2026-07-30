import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BUILDINGS, BuildingType } from '../data/buildings';
import { CREW_TEMPLATES } from '../data/crew';
import { RootStackParamList } from '../navigation/types';
import { useGameStore } from '../store/gameStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Building'>;

const INTERIOR_COLORS: Record<BuildingType, string> = {
  tavern: '#4a2f1a',
  beach: '#8a6b3a',
  manor: '#3a2a4a',
  college: '#1a3a4a',
  shrine: '#1a3a35',
  shop: '#2a3a4a',
};

export default function BuildingScreen({ navigation }: Props) {
  const currentBuildingId = useGameStore((s) => s.currentBuildingId);
  const gold = useGameStore((s) => s.gold);
  const hiredBuildingIds = useGameStore((s) => s.hiredBuildingIds);
  const hireFromBuilding = useGameStore((s) => s.hireFromBuilding);
  const setCurrentBuilding = useGameStore((s) => s.setCurrentBuilding);

  const building = BUILDINGS.find((b) => b.id === currentBuildingId);

  if (!building) {
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

  const buildingId = building.id;
  const recruit = building.recruit;
  const template = CREW_TEMPLATES[recruit.templateId];
  const alreadyHired = hiredBuildingIds.includes(buildingId);
  const canAfford = gold >= recruit.cost;

  function handleHire() {
    hireFromBuilding(buildingId, recruit.templateId, recruit.level, recruit.cost);
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: INTERIOR_COLORS[building.type] }]}
      edges={['top']}
    >
      <View style={styles.header}>
        <Text style={styles.buildingEmoji}>{building.emoji}</Text>
        <Text style={styles.buildingName}>{building.name}</Text>
      </View>

      <View style={styles.npcCard}>
        <Text style={styles.npcEmoji}>{building.npcEmoji}</Text>
        <Text style={styles.npcName}>{building.npcName}</Text>
        <Text style={styles.dialogue}>"{building.dialogue}"</Text>
      </View>

      <View style={styles.recruitCard}>
        <Text style={styles.recruitEmoji}>{template.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.recruitName}>
            {template.name} · Lv.{recruit.level}
          </Text>
          <Text style={styles.recruitSubtext}>
            {template.specialty} · {template.rarity}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        {alreadyHired ? (
          <View style={styles.hiredBanner}>
            <Text style={styles.hiredBannerText}>Already signed on with your crew.</Text>
          </View>
        ) : (
          <Pressable
            style={[styles.hireButton, !canAfford && styles.hireButtonDisabled]}
            onPress={handleHire}
            disabled={!canAfford}
          >
            <Text style={styles.hireButtonText}>
              Hire for {recruit.cost} gold {!canAfford && '(not enough gold)'}
            </Text>
          </Pressable>
        )}
        <Pressable
          style={styles.leaveButton}
          onPress={() => {
            setCurrentBuilding(null);
            navigation.goBack();
          }}
        >
          <Text style={styles.leaveButtonText}>Leave</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  header: { alignItems: 'center', paddingTop: 24, paddingBottom: 12 },
  buildingEmoji: { fontSize: 48 },
  buildingName: { color: '#f4e9cd', fontSize: 20, fontWeight: '700', marginTop: 4 },
  npcCard: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 12,
  },
  npcEmoji: { fontSize: 56 },
  npcName: { color: '#ffd166', fontWeight: '700', fontSize: 16, marginTop: 8 },
  dialogue: {
    color: '#f4e9cd',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
  },
  recruitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 14,
  },
  recruitEmoji: { fontSize: 40 },
  recruitName: { color: '#f4e9cd', fontWeight: '700', fontSize: 15 },
  recruitSubtext: { color: '#cfe3ee', fontSize: 12, marginTop: 2 },
  actions: { flex: 1, justifyContent: 'flex-end', padding: 20, gap: 10 },
  hireButton: {
    backgroundColor: '#2c7a4b',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  hireButtonDisabled: { backgroundColor: '#4a4a4a' },
  hireButtonText: { color: '#f4e9cd', fontWeight: '700', fontSize: 15 },
  hiredBanner: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  hiredBannerText: { color: '#ffd166', fontWeight: '700' },
  leaveButton: {
    backgroundColor: '#f4e9cd',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  leaveButtonText: { color: '#0b3d5c', fontWeight: '800', fontSize: 15 },
});
