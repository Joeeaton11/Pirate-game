import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BUILDINGS, BuildingType } from '../data/buildings';
import { CREW_TEMPLATES } from '../data/crew';
import { ITEMS } from '../data/items';
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
  const inventory = useGameStore((s) => s.inventory);
  const hireFromBuilding = useGameStore((s) => s.hireFromBuilding);
  const buyItem = useGameStore((s) => s.buyItem);
  const setCurrentBuilding = useGameStore((s) => s.setCurrentBuilding);
  const markSeen = useGameStore((s) => s.markSeen);

  const building = BUILDINGS.find((b) => b.id === currentBuildingId);

  useEffect(() => {
    if (building) {
      markSeen(building.recruit.templateId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [building?.id]);

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
  const canAffordRecruit = gold >= recruit.cost;
  const shopItems = building.itemsForSale ?? [];

  function handleHire() {
    hireFromBuilding(buildingId, recruit.templateId, recruit.level, recruit.cost);
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: INTERIOR_COLORS[building.type] }]}
      edges={['top']}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
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

        {alreadyHired ? (
          <View style={styles.hiredBanner}>
            <Text style={styles.hiredBannerText}>Already signed on with your crew.</Text>
          </View>
        ) : (
          <Pressable
            style={[styles.hireButton, !canAffordRecruit && styles.disabledButton]}
            onPress={handleHire}
            disabled={!canAffordRecruit}
          >
            <Text style={styles.hireButtonText}>
              Hire for {recruit.cost} gold {!canAffordRecruit && '(not enough gold)'}
            </Text>
          </Pressable>
        )}

        {shopItems.length > 0 && (
          <View style={styles.shopSection}>
            <Text style={styles.shopHeading}>General Store</Text>
            {shopItems.map((itemId) => {
              const item = ITEMS[itemId];
              const owned = inventory[itemId] ?? 0;
              const canAfford = gold >= item.price;
              return (
                <View key={itemId} style={styles.itemRow}>
                  <Text style={styles.itemEmoji}>{item.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>
                      {item.name} {owned > 0 && `(owned ${owned})`}
                    </Text>
                    <Text style={styles.itemDescription}>{item.description}</Text>
                  </View>
                  <Pressable
                    style={[styles.buyButton, !canAfford && styles.disabledButton]}
                    onPress={() => buyItem(itemId, item.price)}
                    disabled={!canAfford}
                  >
                    <Text style={styles.buyButtonText}>{item.price}g</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
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
  scrollContent: { paddingBottom: 12 },
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
  hireButton: {
    backgroundColor: '#2c7a4b',
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: { backgroundColor: '#4a4a4a' },
  hireButtonText: { color: '#f4e9cd', fontWeight: '700', fontSize: 15 },
  hiredBanner: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  hiredBannerText: { color: '#ffd166', fontWeight: '700' },
  shopSection: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  shopHeading: {
    color: '#ffd166',
    fontWeight: '800',
    fontSize: 15,
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  itemEmoji: { fontSize: 30 },
  itemName: { color: '#f4e9cd', fontWeight: '700', fontSize: 14 },
  itemDescription: { color: '#cfe3ee', fontSize: 11, marginTop: 2 },
  buyButton: {
    backgroundColor: '#8a5a2b',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buyButtonText: { color: '#f4e9cd', fontWeight: '700' },
  footer: { padding: 20, paddingTop: 8 },
  leaveButton: {
    backgroundColor: '#f4e9cd',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  leaveButtonText: { color: '#0b3d5c', fontWeight: '800', fontSize: 15 },
});
