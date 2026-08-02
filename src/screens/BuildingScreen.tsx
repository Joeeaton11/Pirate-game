import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BUILDINGS, BuildingType } from '../data/buildings';
import { CREW_TEMPLATES } from '../data/crew';
import { AMBIENT_NPCS, BuildingInterior, InteriorFurniture, interiorForBuilding } from '../data/interiors';
import { CRAFTING_RECIPES, ITEMS } from '../data/items';
import { RESOURCE_LIST, RESOURCES } from '../data/resources';
import { SHIP_UPGRADES } from '../data/shipUpgrades';
import { SIDE_QUESTS } from '../data/sideQuests';
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
  fort: '#3a3530',
  chapel: '#2a2a3a',
  warehouse: '#3a301f',
  customs: '#2a2a20',
  smithy: '#2a1c18',
  ruins: '#26301f',
};

const FLOOR_COLORS: Record<BuildingType, string> = {
  tavern: '#5c3a20',
  beach: '#a8834a',
  manor: '#4a3760',
  college: '#234a5c',
  shrine: '#234a44',
  shop: '#3a4a5c',
  market: '#3a4a3a',
  fort: '#4a4438',
  chapel: '#3a3a4a',
  warehouse: '#4a3c28',
  customs: '#3a3a2c',
  smithy: '#3a2a22',
  ruins: '#3a4a30',
};

const PLAYER_SIZE = 28;
const NPC_SIZE = 34;
// Rooms used to render at native size with no camera — the whole floor plan fit on screen at a
// glance, nothing to explore. Zooming in (like the outdoor map's own ZOOM) and following the player
// with a camera instead makes the same room data feel like a real space you walk around in, and
// makes furniture/NPCs read bigger and clearer for free, without re-authoring every floor plan.
const INTERIOR_ZOOM = 2;
// The outdoor map moves at LAND_SPEED(45) * its own ZOOM(5) = 225px/s on screen. Rooms only just
// got their own zoom, so ROOM_SPEED needs dividing by INTERIOR_ZOOM to land on that same effective
// screen speed — the old value (90, applied with no zoom at all) was really only 90px/s, well under
// half the outdoor pace, which is the "movement feels slow" bug.
const ROOM_SPEED = 225 / INTERIOR_ZOOM; // world units per second
const DEADZONE = 10;
const MAX_DRAG = 55;
const TICK_MS = 33;
const INTERACT_RADIUS = 38;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function renderFurniture(item: InteriorFurniture, key: number) {
  switch (item.type) {
    case 'counter': {
      const width = item.width ?? 120;
      const height = item.height ?? 24;
      return (
        <View
          key={key}
          style={[
            styles.counter,
            { left: item.x - width / 2, top: item.y - height / 2, width, height },
          ]}
        />
      );
    }
    case 'table':
      return (
        <View key={key} style={[styles.table, { left: item.x - 26, top: item.y - 26 }]} />
      );
    case 'chair':
      return (
        <Text key={key} style={[styles.chairEmoji, { left: item.x - 11, top: item.y - 11 }]}>
          🪑
        </Text>
      );
    case 'stool':
      return (
        <View key={key} style={[styles.stool, { left: item.x - 10, top: item.y - 10 }]} />
      );
    case 'barrel':
      return (
        <View key={key} style={[styles.barrel, { left: item.x - 12, top: item.y - 12 }]} />
      );
    case 'shelf':
      return (
        <View key={key} style={[styles.shelf, { left: item.x - 30, top: item.y - 10 }]} />
      );
    case 'rug':
      return (
        <View key={key} style={[styles.rug, { left: item.x - 60, top: item.y - 40 }]} />
      );
    case 'door': {
      const size = item.fontSize ?? 26;
      return (
        <Text
          key={key}
          style={[styles.doorEmoji, { fontSize: size, left: item.x - size / 2, top: item.y - size / 2 }]}
        >
          🚪
        </Text>
      );
    }
    case 'prop': {
      const size = item.fontSize ?? 22;
      return (
        <Text
          key={key}
          style={[styles.propEmoji, { fontSize: size, left: item.x - size / 2, top: item.y - size / 2 }]}
        >
          {item.emoji}
        </Text>
      );
    }
    default:
      return null;
  }
}

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
  const setCurrentSideQuest = useGameStore((s) => s.setCurrentSideQuest);
  const completedQuestIds = useGameStore((s) => s.completedQuestIds);
  const [sentToQuarters, setSentToQuarters] = useState(false);
  const [theftResult, setTheftResult] = useState<{ caught: boolean; amount: number } | null>(null);
  const [showCounter, setShowCounter] = useState(false);
  const [nearbyNpcId, setNearbyNpcId] = useState<string | null>(null);
  const [ambientMessage, setAmbientMessage] = useState<string | null>(null);
  const ambientMessageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const building = BUILDINGS.find((b) => b.id === currentBuildingId);
  const patronQuests = building
    ? SIDE_QUESTS.filter((q) => q.hostedByBuildingId === building.id)
    : [];
  const interior: BuildingInterior | null = building
    ? interiorForBuilding(
        building.id,
        patronQuests.map((q) => q.id)
      )
    : null;

  const [roomPlayer, setRoomPlayer] = useState(() => interior?.entryPosition ?? { x: 0, y: 0 });
  const roomPlayerRef = useRef(roomPlayer);
  roomPlayerRef.current = roomPlayer;
  const directionRef = useRef<{ x: number; y: number } | null>(null);
  const [dragKnob, setDragKnob] = useState<{ x: number; y: number } | null>(null);
  const [dragOrigin, setDragOrigin] = useState<{ x: number; y: number } | null>(null);
  const [roomViewport, setRoomViewport] = useState({ width: 0, height: 0 });

  function onLayoutRoomOuter(event: LayoutChangeEvent) {
    const { width, height } = event.nativeEvent.layout;
    setRoomViewport({ width, height });
  }
  const dragOriginRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (building?.recruit) {
      markSeen(building.recruit.templateId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [building?.id]);

  useEffect(() => {
    return () => {
      if (ambientMessageTimeoutRef.current) clearTimeout(ambientMessageTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!interior || showCounter) return;
    const iv = setInterval(() => {
      const direction = directionRef.current;
      if (direction) {
        const dt = TICK_MS / 1000;
        const nextX = clamp(roomPlayerRef.current.x + direction.x * ROOM_SPEED * dt, 0, interior.width);
        const nextY = clamp(roomPlayerRef.current.y + direction.y * ROOM_SPEED * dt, 0, interior.height);
        roomPlayerRef.current = { x: nextX, y: nextY };
        setRoomPlayer(roomPlayerRef.current);
      }
      let nearest: string | null = null;
      let nearestDist = INTERACT_RADIUS;
      for (const spot of interior.npcSpots) {
        const d = Math.hypot(roomPlayerRef.current.x - spot.x, roomPlayerRef.current.y - spot.y);
        if (d <= nearestDist) {
          nearest = spot.id;
          nearestDist = d;
        }
      }
      setNearbyNpcId(nearest);
    }, TICK_MS);
    return () => clearInterval(iv);
  }, [interior, showCounter]);

  const panGesture = Gesture.Pan()
    .minDistance(0)
    .shouldCancelWhenOutside(false)
    .onBegin((e) => {
      dragOriginRef.current = { x: e.x, y: e.y };
      setDragOrigin({ x: e.x, y: e.y });
      setDragKnob({ x: e.x, y: e.y });
    })
    .onUpdate((e) => {
      const dist = Math.hypot(e.translationX, e.translationY);
      if (dist > DEADZONE) {
        const clampedDist = Math.min(dist, MAX_DRAG);
        directionRef.current = {
          x: (e.translationX / dist) * (clampedDist / MAX_DRAG),
          y: (e.translationY / dist) * (clampedDist / MAX_DRAG),
        };
      } else {
        directionRef.current = null;
      }
      const origin = dragOriginRef.current;
      if (origin) {
        const knobDist = Math.min(dist, MAX_DRAG);
        const angle = Math.atan2(e.translationY, e.translationX);
        setDragKnob({
          x: origin.x + Math.cos(angle) * knobDist,
          y: origin.y + Math.sin(angle) * knobDist,
        });
      }
    })
    .onFinalize(() => {
      directionRef.current = null;
      dragOriginRef.current = null;
      setDragOrigin(null);
      setDragKnob(null);
    });

  if (!building || !interior) {
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

  function showAmbientMessage(message: string) {
    setAmbientMessage(message);
    if (ambientMessageTimeoutRef.current) clearTimeout(ambientMessageTimeoutRef.current);
    ambientMessageTimeoutRef.current = setTimeout(() => setAmbientMessage(null), 2500);
  }

  function handleTalk() {
    if (!nearbyNpcId) return;
    if (nearbyNpcId === 'main') {
      setShowCounter(true);
      return;
    }
    const ambient = AMBIENT_NPCS[nearbyNpcId];
    if (ambient) {
      showAmbientMessage(`${ambient.name}: "${ambient.flavor}"`);
      return;
    }
    setCurrentSideQuest(nearbyNpcId);
    navigation.navigate('SideQuest');
  }

  function handleLeaveBuilding() {
    setCurrentBuilding(null);
    navigation.goBack();
  }

  const nearbyPatronQuest = nearbyNpcId ? patronQuests.find((q) => q.id === nearbyNpcId) : undefined;
  const nearbyAmbient = nearbyNpcId ? AMBIENT_NPCS[nearbyNpcId] : undefined;
  const nearbyLabel =
    nearbyNpcId === 'main' ? building.npcName : nearbyPatronQuest?.npcName ?? nearbyAmbient?.name ?? '';

  if (showCounter) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: INTERIOR_COLORS[building.type] }]}
        edges={['top']}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.buildingEmoji}>{building.npcEmoji}</Text>
            <Text style={styles.buildingName}>{building.npcName}</Text>
          </View>

          <View style={styles.npcCard}>
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
          <Pressable style={styles.leaveButton} onPress={() => setShowCounter(false)}>
            <Text style={styles.leaveButtonText}>Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: INTERIOR_COLORS[building.type] }]}
      edges={['top']}
    >
      <View style={styles.roomHeader}>
        <Text style={styles.buildingEmoji}>{building.emoji}</Text>
        <Text style={styles.buildingName}>{building.name}</Text>
      </View>

      <GestureDetector gesture={panGesture}>
        <View style={styles.roomOuter} onLayout={onLayoutRoomOuter}>
          {roomViewport.width > 0 && (
          <View
            style={[
              styles.room,
              {
                width: interior.width,
                height: interior.height,
                backgroundColor: FLOOR_COLORS[building.type],
                // Same camera math as the outdoor map's own world transform: center the player on
                // screen, then zoom in around them — the room is bigger on screen than the viewport
                // once INTERIOR_ZOOM > 1, so only part of it is visible at once and you have to
                // actually walk around to see the rest, instead of the whole floor plan fitting on
                // screen at a glance.
                transform: [
                  {
                    translateX:
                      roomViewport.width / 2 -
                      interior.width / 2 +
                      INTERIOR_ZOOM * (interior.width / 2 - roomPlayer.x),
                  },
                  {
                    translateY:
                      roomViewport.height / 2 -
                      interior.height / 2 +
                      INTERIOR_ZOOM * (interior.height / 2 - roomPlayer.y),
                  },
                  { scale: INTERIOR_ZOOM },
                ],
              },
            ]}
          >
            {interior.furniture.map((item, i) => renderFurniture(item, i))}

            {interior.npcSpots.map((spot) => {
              const isMain = spot.id === 'main';
              const patronQuest = !isMain ? patronQuests.find((q) => q.id === spot.id) : undefined;
              const ambient = !isMain && !patronQuest ? AMBIENT_NPCS[spot.id] : undefined;
              const emoji = isMain ? building.npcEmoji : patronQuest?.npcEmoji ?? ambient?.emoji ?? '👤';
              const hasOpenQuest = !!patronQuest && !completedQuestIds.includes(patronQuest.id);
              return (
                <View
                  key={spot.id}
                  style={[
                    styles.npcToken,
                    { left: spot.x - NPC_SIZE / 2, top: spot.y - NPC_SIZE / 2 },
                  ]}
                >
                  {hasOpenQuest && (
                    <Text style={styles.questIndicator}>❗</Text>
                  )}
                  <Text style={styles.npcTokenEmoji}>{emoji}</Text>
                </View>
              );
            })}

            <View
              style={[
                styles.roomPlayer,
                { left: roomPlayer.x - PLAYER_SIZE / 2, top: roomPlayer.y - PLAYER_SIZE / 2 },
              ]}
            >
              <Text style={styles.roomPlayerEmoji}>🧍</Text>
            </View>
          </View>
          )}

          {dragOrigin && (
            <View
              pointerEvents="none"
              style={[styles.joystickBase, { left: dragOrigin.x - 35, top: dragOrigin.y - 35 }]}
            />
          )}
          {dragKnob && (
            <View
              pointerEvents="none"
              style={[styles.joystickKnob, { left: dragKnob.x - 16, top: dragKnob.y - 16 }]}
            />
          )}
        </View>
      </GestureDetector>

      {ambientMessage && (
        <View style={styles.ambientToast}>
          <Text style={styles.ambientToastText}>{ambientMessage}</Text>
        </View>
      )}

      {nearbyNpcId && !ambientMessage && (
        <Pressable style={styles.talkButton} onPress={handleTalk}>
          <Text style={styles.talkButtonText}>Talk to {nearbyLabel}</Text>
        </Pressable>
      )}

      <View style={styles.footer}>
        <Pressable style={styles.leaveButton} onPress={handleLeaveBuilding}>
          <Text style={styles.leaveButtonText}>Leave Building</Text>
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
  roomHeader: { alignItems: 'center', paddingTop: 12, paddingBottom: 8 },
  buildingEmoji: { fontSize: 40 },
  buildingName: { color: '#f4e9cd', fontSize: 18, fontWeight: '700', marginTop: 4 },
  roomOuter: {
    flex: 1,
    overflow: 'hidden',
  },
  room: {
    position: 'absolute',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: 'rgba(0,0,0,0.35)',
    overflow: 'hidden',
  },
  counter: {
    position: 'absolute',
    backgroundColor: '#3d2a18',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#6b4a2a',
  },
  table: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#6b4a2a',
    borderWidth: 2,
    borderColor: '#3d2a18',
  },
  stool: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#8a6b3a',
    borderWidth: 1,
    borderColor: '#3d2a18',
  },
  barrel: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#5c3a20',
    borderWidth: 2,
    borderColor: '#2e1d10',
  },
  shelf: {
    position: 'absolute',
    width: 60,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#3d2a18',
    borderWidth: 2,
    borderColor: '#6b4a2a',
  },
  rug: {
    position: 'absolute',
    width: 150,
    height: 100,
    borderRadius: 16,
    backgroundColor: 'rgba(122, 31, 31, 0.35)',
  },
  chairEmoji: {
    position: 'absolute',
    fontSize: 20,
  },
  doorEmoji: {
    position: 'absolute',
    opacity: 0.9,
  },
  propEmoji: {
    position: 'absolute',
  },
  npcToken: {
    position: 'absolute',
    width: NPC_SIZE,
    height: NPC_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  npcTokenEmoji: { fontSize: 28 },
  questIndicator: {
    position: 'absolute',
    top: -14,
    width: NPC_SIZE,
    textAlign: 'center',
    fontSize: 14,
  },
  roomPlayer: {
    position: 'absolute',
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomPlayerEmoji: { fontSize: 22 },
  joystickBase: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(244, 233, 205, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(244, 233, 205, 0.4)',
  },
  joystickKnob: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 209, 102, 0.85)',
  },
  talkButton: {
    alignSelf: 'center',
    backgroundColor: '#ffd166',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  talkButtonText: { color: '#0b3d5c', fontWeight: '800', fontSize: 14 },
  ambientToast: {
    alignSelf: 'center',
    backgroundColor: 'rgba(6, 35, 49, 0.92)',
    borderWidth: 1,
    borderColor: '#ffd166',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 8,
    maxWidth: '85%',
  },
  ambientToastText: { color: '#f4e9cd', fontSize: 13, fontStyle: 'italic', textAlign: 'center' },
  npcCard: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 12,
  },
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
