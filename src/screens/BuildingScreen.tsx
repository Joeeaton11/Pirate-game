import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { Image, LayoutChangeEvent, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { backgroundForBuilding } from '../data/buildingBackgrounds';
import { BUILDINGS, BuildingType } from '../data/buildings';
import { CREW_TEMPLATES } from '../data/crew';
import { AMBIENT_NPCS, BuildingInterior, InteriorFurniture, interiorForBuilding } from '../data/interiors';
import { CRAFTING_RECIPES, ITEMS } from '../data/items';
import { RESOURCE_LIST, RESOURCES } from '../data/resources';
import { ICON_EXCLAIM, ICON_SPEECH } from '../data/scallySprites';
import { SHIP_UPGRADES } from '../data/shipUpgrades';
import { SIDE_QUESTS } from '../data/sideQuests';
import { TREASURES } from '../data/treasures';
import { RootStackParamList } from '../navigation/types';
import { useGameStore } from '../store/gameStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Building'>;

// Base floor tone shown beneath the background Image while it loads, and at the room's edges if the
// art doesn't perfectly fill the floor-plan aspect ratio. INTERIOR_COLORS (the old full-screen fill)
// is gone now that both views render real backdrop art — see buildingBackgrounds.ts.
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
  gaol: '#3a3a40',
  watchtower: '#463c30',
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
// Ambient (quest-less) NPCs amble at a fraction of the player's pace — a leisurely wander, not a
// race across the room. Quest patrons and the building's own NPC never move: the player (and the
// game's own proximity/interact logic) always needs to find them exactly where the floor plan says.
const AMBIENT_WANDER_SPEED = 40; // world units per second
// How far from an ambient NPC's registered spot a chair/stool counts as "their" seat. Keeps a
// tavern sailor circulating around the bar he's stood at rather than wandering across the whole
// room to sit at a table on the far side.
const AMBIENT_SEAT_RADIUS = 110;

interface AmbientWaypoint {
  x: number;
  y: number;
  seat: boolean;
}

interface AmbientWanderState {
  x: number;
  y: number;
  phase: 'paused' | 'walking';
  seated: boolean;
  target: AmbientWaypoint;
  waitUntil: number;
}

// Clearance added to every solid furniture piece's own footprint so the player stops a believable
// half-body-width short of it, not toe-to-toe.
const PLAYER_FURNITURE_CLEARANCE = PLAYER_SIZE / 2;
// Chairs/stools are deliberately NOT solid — they're small, often clustered tight around a table,
// and NPCs sit in them, so blocking on them would make navigating up to a seated NPC fiddly for no
// real benefit. Doors and decorative floor items (rug/prop) obviously can't block either. Table,
// barrel, shelf, and counter are the pieces actually worth bumping into.

interface FurnitureObstacle {
  x: number;
  y: number;
  radius: number; // already includes the player's own clearance
}

/** Same circle-vs-circle collision-with-sliding trick MapScreen.tsx uses for outdoor
 * buildings/houses (slideAroundObstacles), generalized to per-obstacle radii since furniture
 * pieces aren't all the same size the way outdoor buildings are. If the full move is blocked,
 * retry the X-only and Y-only projections before giving up, so the player slides along a table's
 * edge instead of hard-stopping or clipping through it. This is the "invisible outline" half of
 * painted-backdrop furniture: a table/barrel/shelf/counter blocks movement at roughly its real
 * footprint whether it's a placeholder box today or painted straight into a backdrop later —
 * nothing here depends on how (or whether) the piece is actually rendered. */
function slideAroundFurniture(
  current: { x: number; y: number },
  raw: { x: number; y: number },
  obstacles: FurnitureObstacle[]
): { x: number; y: number } {
  const blocked = (pos: { x: number; y: number }) =>
    obstacles.some((o) => Math.hypot(pos.x - o.x, pos.y - o.y) < o.radius);
  if (!blocked(raw)) return raw;
  const slideX = { x: raw.x, y: current.y };
  if (!blocked(slideX)) return slideX;
  const slideY = { x: current.x, y: raw.y };
  if (!blocked(slideY)) return slideY;
  return current;
}

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
  const foundTreasureIds = useGameStore((s) => s.foundTreasureIds);
  const buyTreasure = useGameStore((s) => s.buyTreasure);
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

  // Which npcSpots are ambient (no quest, not the building's own NPC) and where each is allowed to
  // wander: its own registered spot, plus any chair/stool within AMBIENT_SEAT_RADIUS of it. Quest
  // patrons and 'main' are deliberately left out — they always stay exactly where the floor plan
  // and quest logic expect them.
  const ambientWaypoints = React.useMemo(() => {
    const map: Record<string, AmbientWaypoint[]> = {};
    if (!interior) return map;
    const seats = interior.furniture.filter((f) => f.type === 'chair' || f.type === 'stool');
    for (const spot of interior.npcSpots) {
      if (spot.id === 'main') continue;
      if (patronQuests.some((q) => q.id === spot.id)) continue;
      if (!AMBIENT_NPCS[spot.id]) continue;
      const nearbySeats = seats
        .filter((s) => Math.hypot(s.x - spot.x, s.y - spot.y) <= AMBIENT_SEAT_RADIUS)
        .map((s) => ({ x: s.x, y: s.y, seat: true }));
      map[spot.id] = [{ x: spot.x, y: spot.y, seat: false }, ...nearbySeats];
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interior?.buildingId]);

  // Invisible collision geometry for solid furniture, built straight from the same x/y (and
  // width/height, for a counter) already authored for rendering — no new data needed. Radii below
  // match renderFurniture()'s own placeholder dimensions so today's colored-box art and tomorrow's
  // painted backdrop both collide the same way regardless of what's actually drawn on screen.
  const furnitureObstacles = React.useMemo(() => {
    const obstacles: FurnitureObstacle[] = [];
    if (!interior) return obstacles;
    for (const item of interior.furniture) {
      switch (item.type) {
        case 'table':
          obstacles.push({ x: item.x, y: item.y, radius: 26 + PLAYER_FURNITURE_CLEARANCE });
          break;
        case 'barrel':
          obstacles.push({ x: item.x, y: item.y, radius: 12 + PLAYER_FURNITURE_CLEARANCE });
          break;
        case 'shelf': {
          // Rendered as a 60x20 rect — two circles spaced along its width so the whole span
          // blocks, not just a point at its center.
          const radius = 14 + PLAYER_FURNITURE_CLEARANCE;
          obstacles.push({ x: item.x - 15, y: item.y, radius });
          obstacles.push({ x: item.x + 15, y: item.y, radius });
          break;
        }
        case 'counter': {
          const width = item.width ?? 120;
          const height = item.height ?? 24;
          const radius = height / 2 + PLAYER_FURNITURE_CLEARANCE;
          // Chain circles along its length so the counter blocks edge-to-edge instead of just at
          // its center — the same circle-obstacle model MapScreen already uses, extended to a
          // piece with real length.
          const step = Math.max(radius, 20);
          for (let cx = item.x - width / 2 + step / 2; cx <= item.x + width / 2; cx += step) {
            obstacles.push({ x: cx, y: item.y, radius });
          }
          break;
        }
        default:
          break; // chair/stool/rug/prop/door stay walk-through
      }
    }
    return obstacles;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interior?.buildingId]);

  const ambientWanderRef = useRef<Map<string, AmbientWanderState>>(new Map());
  const [ambientPositions, setAmbientPositions] = useState<
    Record<string, { x: number; y: number; seated: boolean }>
  >({});

  useEffect(() => {
    const map = new Map<string, AmbientWanderState>();
    const initial: Record<string, { x: number; y: number; seated: boolean }> = {};
    for (const [id, waypoints] of Object.entries(ambientWaypoints)) {
      const home = waypoints[0];
      map.set(id, {
        x: home.x,
        y: home.y,
        phase: 'paused',
        seated: false,
        target: home,
        // Stagger the first move so a room's ambient NPCs don't all set off in lockstep.
        waitUntil: Date.now() + 1000 + Math.random() * 4000,
      });
      initial[id] = { x: home.x, y: home.y, seated: false };
    }
    ambientWanderRef.current = map;
    setAmbientPositions(initial);
  }, [ambientWaypoints]);
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
      const dt = TICK_MS / 1000;
      const direction = directionRef.current;
      if (direction) {
        const rawX = clamp(roomPlayerRef.current.x + direction.x * ROOM_SPEED * dt, 0, interior.width);
        const rawY = clamp(roomPlayerRef.current.y + direction.y * ROOM_SPEED * dt, 0, interior.height);
        roomPlayerRef.current = slideAroundFurniture(
          roomPlayerRef.current,
          { x: rawX, y: rawY },
          furnitureObstacles
        );
        setRoomPlayer(roomPlayerRef.current);
      }

      // Ambient NPCs amble between their home spot and any nearby seating: sit for a while,
      // stand, wander to another chair (or back to their spot), repeat. This is what makes a
      // room feel lived-in rather than a static backdrop with icons pinned to it.
      const now = Date.now();
      let ambientMoved = false;
      for (const [id, waypoints] of Object.entries(ambientWaypoints)) {
        const state = ambientWanderRef.current.get(id);
        if (!state) continue;
        if (state.phase === 'paused') {
          if (now >= state.waitUntil) {
            state.target = waypoints[Math.floor(Math.random() * waypoints.length)];
            state.phase = 'walking';
          }
          continue;
        }
        const dx = state.target.x - state.x;
        const dy = state.target.y - state.y;
        const dist = Math.hypot(dx, dy);
        const step = AMBIENT_WANDER_SPEED * dt;
        if (dist <= step) {
          state.x = state.target.x;
          state.y = state.target.y;
          state.phase = 'paused';
          state.seated = state.target.seat;
          // Seated NPCs linger much longer than ones just pausing mid-room.
          state.waitUntil = now + (state.seated ? 6000 + Math.random() * 9000 : 2000 + Math.random() * 4000);
        } else {
          state.x += (dx / dist) * step;
          state.y += (dy / dist) * step;
        }
        ambientMoved = true;
      }
      if (ambientMoved) {
        const next: Record<string, { x: number; y: number; seated: boolean }> = {};
        ambientWanderRef.current.forEach((s, wid) => {
          next[wid] = { x: s.x, y: s.y, seated: s.seated };
        });
        setAmbientPositions(next);
      }

      let nearest: string | null = null;
      let nearestDist = INTERACT_RADIUS;
      for (const spot of interior.npcSpots) {
        const live = ambientWanderRef.current.get(spot.id);
        const px = live ? live.x : spot.x;
        const py = live ? live.y : spot.y;
        const d = Math.hypot(roomPlayerRef.current.x - px, roomPlayerRef.current.y - py);
        if (d <= nearestDist) {
          nearest = spot.id;
          nearestDist = d;
        }
      }
      setNearbyNpcId(nearest);
    }, TICK_MS);
    return () => clearInterval(iv);
  }, [interior, showCounter, ambientWaypoints, furnitureObstacles]);

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
  // Real backdrop art for this building's interior — a specific documented match where one exists,
  // else the closest scene for its BuildingType (see buildingBackgrounds.ts). Replaces the flat
  // INTERIOR_COLORS/FLOOR_COLORS fill both views used before this wiring pass.
  const backgroundSource = backgroundForBuilding(buildingId, building.type);
  const recruit = building.recruit;
  const template = recruit ? CREW_TEMPLATES[recruit.templateId] : null;
  const alreadyHired = hiredBuildingIds.includes(buildingId);
  const canAffordRecruit = !!recruit && gold >= recruit.cost;
  const shopItems = building.itemsForSale ?? [];
  const treasureItems = building.treasuresForSale ?? [];
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
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Image source={backgroundSource} style={StyleSheet.absoluteFill} resizeMode="cover" />
        {/* Dark scrim over the art so the plain header text and any card without its own
            translucent backing (the item/recruit cards already carry rgba(0,0,0,...) fills of
            their own and read fine without help) stay legible over a busy background. */}
        <View style={[StyleSheet.absoluteFill, styles.counterScrim]} />
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

          {treasureItems.length > 0 && (
            <View style={styles.shopSection}>
              <Text style={styles.shopHeading}>Treasure</Text>
              {treasureItems.map((treasureId) => {
                const treasure = TREASURES[treasureId];
                const found = foundTreasureIds.includes(treasureId);
                const price = treasure.price ?? 0;
                const canAffordTreasure = gold >= price;
                return (
                  <View key={treasureId} style={styles.itemRow}>
                    <Text style={styles.itemEmoji}>{treasure.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{treasure.name}</Text>
                      <Text style={styles.itemDescription}>{treasure.flavor}</Text>
                    </View>
                    {found ? (
                      <Text style={styles.buyButtonText}>✓ Found</Text>
                    ) : (
                      <Pressable
                        style={[styles.buyButton, !canAffordTreasure && styles.disabledButton]}
                        onPress={() => buyTreasure(treasureId, price)}
                        disabled={!canAffordTreasure}
                      >
                        <Text style={styles.buyButtonText}>{price}g</Text>
                      </Pressable>
                    )}
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
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
            <Image source={backgroundSource} style={StyleSheet.absoluteFill} resizeMode="cover" />

            {interior.furniture.map((item, i) => renderFurniture(item, i))}

            {interior.npcSpots.map((spot) => {
              const isMain = spot.id === 'main';
              const patronQuest = !isMain ? patronQuests.find((q) => q.id === spot.id) : undefined;
              const ambient = !isMain && !patronQuest ? AMBIENT_NPCS[spot.id] : undefined;
              const emoji = isMain ? building.npcEmoji : patronQuest?.npcEmoji ?? ambient?.emoji ?? '👤';
              const hasOpenQuest = !!patronQuest && !completedQuestIds.includes(patronQuest.id);
              // Ambient NPCs report their live wandered position; everyone else stays pinned to
              // their authored floor-plan spot.
              const live = ambient ? ambientPositions[spot.id] : undefined;
              const x = live?.x ?? spot.x;
              const y = live?.y ?? spot.y;
              const seated = live?.seated ?? false;
              return (
                <View
                  key={spot.id}
                  style={[
                    styles.npcToken,
                    { left: x - NPC_SIZE / 2, top: y - NPC_SIZE / 2 },
                    seated && styles.npcTokenSeated,
                  ]}
                >
                  {hasOpenQuest && (
                    <Image source={ICON_EXCLAIM} resizeMode="contain" style={styles.questIndicator} />
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
          <Image source={ICON_SPEECH} resizeMode="contain" style={styles.talkButtonIcon} />
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
  // Sits between the counter view's background Image and its content. Tuned dark enough that the
  // plain header text and the dialogue quote (neither has a translucent card of its own) stay
  // legible over a busy scene, but light enough that the art underneath still reads as art.
  counterScrim: { backgroundColor: 'rgba(0,0,0,0.32)' },
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
  // Small settle-down cue for a seated ambient NPC — no dedicated seated sprite exists yet, so a
  // slight drop and shrink is what reads as "sitting" until real seated art replaces the emoji.
  npcTokenSeated: { transform: [{ translateY: 5 }, { scale: 0.9 }] },
  questIndicator: {
    position: 'absolute',
    top: -16,
    left: NPC_SIZE / 2 - 8,
    width: 16,
    height: 16,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    backgroundColor: '#ffd166',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  talkButtonIcon: { width: 20, height: 20 },
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
