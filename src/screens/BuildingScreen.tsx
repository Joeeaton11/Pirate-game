import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BUILDINGS, BuildingType } from '../data/buildings';
import { CREW_TEMPLATES } from '../data/crew';
import { CRAFTING_RECIPES, ITEMS } from '../data/items';
import { RESOURCE_LIST, RESOURCES } from '../data/resources';
import { SHIP_UPGRADES } from '../data/shipUpgrades';
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
  market: '#2a3a2a',
};

export default function BuildingScreen({ navigation }: Props) {
  const currentBuildingId = useGameStore((s) => s.currentBuildingId);
  const gold = useGameStore((s) => s.gold);
  const hiredBuildingIds = useGameStore((s) => s.hiredBuildingIds);
  const inventory = useGameStore((s) => s.inventory);
  const hireFromBuilding = useGameStore((s) => s.hireFromBuilding);
  const buyItem = useGameStore((s) => s.buyItem);
  const resources = useGameStore((s) => s.resources);
  const sellResource = useGameStore((s) => s.sellResource);
  const craftItem = useGameStore((s) => s.craftItem);
  const theftCooldowns = useGameStore((s) => s.theftCooldowns);
  const stealFromShop = useGameStore((s) => s.stealFromShop);
  const shipUpgrades = useGameStore((s) => s.shipUpgrades);
  const buyShipUpgrade = useGameStore((s) => s.buyShipUpgrade);
  const setCurrentBuilding = useGameStore((s) => s.setCurrentBuilding);
  const markSeen = useGameStore((s) => s.markSeen);
  const [sentToQuarters, setSentToQuarters] = useState(false);
  const [theftResult, setTheftResult] = useState<{ caught: boolean; amount: number } | null>(null);

  const building = BUILDINGS.find((b) => b.id === currentBuildingId);

  useEffect(() => {
    if (building?.recruit) {
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
  const template = recruit ? CREW_TEMPLATES[recruit.templateId] : null;
  const alreadyHired = hiredBuildingIds.includes(buildingId);
  const canAffordRecruit = !!recruit && gold >= recruit.cost;
  const shopItems = building.itemsForSale ?? [];

  const stealResource = building.stealResourceId ? RESOURCES[building.stealResourceId] : null;
  const stealReadyAt = theftCooldowns[buildingId] ?? 0;
  const stealReady = Date.now() >= stealReadyAt;

  function handleHire() {
    if (!recruit) return;
    const result = hireFromBuilding(buildingId, recruit.templateId, recruit.level, recruit.cost);
    if (result.success) setSentToQuarters(!result.boardedShip);
  }

  function handleSteal() {
    const result = stealFromShop(buildingId);
    if (result.success && result.amount !== undefined) {
      setTheftResult({ caught: result.caught, amount: result.amount });
    }
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

        {recruit && template && (
          <>
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
                <Text style={styles.hiredBannerText}>
                  {sentToQuarters
                    ? 'Signed on, but your ship is full — waiting in the Crew Quarters.'
                    : 'Already signed on with your crew.'}
                </Text>
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
          </>
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

        {building.buysResources && (
          <View style={styles.shopSection}>
            <Text style={styles.shopHeading}>Craft</Text>
            {CRAFTING_RECIPES.map((recipe) => {
              const item = ITEMS[recipe.itemId];
              const resource = RESOURCES[recipe.resourceId];
              const owned = resources[recipe.resourceId] ?? 0;
              const canCraft = owned >= recipe.resourceCost;
              return (
                <View key={recipe.itemId} style={styles.itemRow}>
                  <Text style={styles.itemEmoji}>{item.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemDescription}>
                      Needs {recipe.resourceCost} {resource.emoji} {resource.name} (have {owned})
                    </Text>
                  </View>
                  <Pressable
                    style={[styles.buyButton, !canCraft && styles.disabledButton]}
                    onPress={() => craftItem(recipe.itemId)}
                    disabled={!canCraft}
                  >
                    <Text style={styles.buyButtonText}>Craft</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}

        {building.buysResources && (
          <View style={styles.shopSection}>
            <Text style={styles.shopHeading}>Sell Resources</Text>
            {RESOURCE_LIST.map((resource) => {
              const owned = resources[resource.id] ?? 0;
              return (
                <View key={resource.id} style={styles.itemRow}>
                  <Text style={styles.itemEmoji}>{resource.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{resource.name}</Text>
                    <Text style={styles.itemDescription}>
                      {owned} owned · {resource.sellPrice}g each
                    </Text>
                  </View>
                  <Pressable
                    style={[styles.buyButton, owned === 0 && styles.disabledButton]}
                    onPress={() => sellResource(resource.id, owned)}
                    disabled={owned === 0}
                  >
                    <Text style={styles.buyButtonText}>Sell All</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}

        {building.sellsUpgrades && (
          <View style={styles.shopSection}>
            <Text style={styles.shopHeading}>Ship Upgrades</Text>
            {SHIP_UPGRADES.map((upgrade) => {
              const owned = shipUpgrades.includes(upgrade.id);
              const resource = RESOURCES[upgrade.resourceId];
              const resourceOwned = resources[upgrade.resourceId] ?? 0;
              const canAfford = gold >= upgrade.goldCost && resourceOwned >= upgrade.resourceCost;
              return (
                <View key={upgrade.id} style={styles.itemRow}>
                  <Text style={styles.itemEmoji}>{upgrade.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{upgrade.name} {owned && '(owned)'}</Text>
                    <Text style={styles.itemDescription}>{upgrade.description}</Text>
                    {!owned && (
                      <Text style={styles.itemDescription}>
                        {upgrade.goldCost}g + {upgrade.resourceCost} {resource.emoji} {resource.name} (have{' '}
                        {resourceOwned})
                      </Text>
                    )}
                  </View>
                  {!owned && (
                    <Pressable
                      style={[styles.buyButton, !canAfford && styles.disabledButton]}
                      onPress={() => buyShipUpgrade(upgrade.id)}
                      disabled={!canAfford}
                    >
                      <Text style={styles.buyButtonText}>Buy</Text>
                    </Pressable>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {stealResource && (
          <View style={styles.shopSection}>
            <Text style={styles.shopHeading}>Take Your Chances</Text>
            {theftResult && (
              <View style={theftResult.caught ? styles.caughtBanner : styles.cleanBanner}>
                <Text style={styles.theftBannerText}>
                  {theftResult.caught
                    ? `Caught red-handed! Got away with ${theftResult.amount} ${stealResource.name}, but word's spreading.`
                    : `Clean grab — ${theftResult.amount} ${stealResource.name}, no one the wiser. Probably.`}
                </Text>
              </View>
            )}
            <View style={styles.itemRow}>
              <Text style={styles.itemEmoji}>{stealResource.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>Steal {stealResource.name}</Text>
                <Text style={styles.itemDescription}>
                  Free, but raises heat — more if you're caught. {!stealReady && 'Watched too closely right now.'}
                </Text>
              </View>
              <Pressable
                style={[styles.stealButton, !stealReady && styles.disabledButton]}
                onPress={handleSteal}
                disabled={!stealReady}
              >
                <Text style={styles.buyButtonText}>Steal</Text>
              </Pressable>
            </View>
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
  stealButton: {
    backgroundColor: '#7a1f1f',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  caughtBanner: {
    backgroundColor: 'rgba(122, 31, 31, 0.35)',
    borderWidth: 1,
    borderColor: '#e53935',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  cleanBanner: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderWidth: 1,
    borderColor: '#4caf50',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  theftBannerText: { color: '#f4e9cd', fontSize: 12, fontWeight: '600' },
  footer: { padding: 20, paddingTop: 8 },
  leaveButton: {
    backgroundColor: '#f4e9cd',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  leaveButtonText: { color: '#0b3d5c', fontWeight: '800', fontSize: 15 },
});
