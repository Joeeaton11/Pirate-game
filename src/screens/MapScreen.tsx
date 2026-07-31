import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Line, Polygon } from 'react-native-svg';
import OnboardingOverlay from '../components/OnboardingOverlay';
import { BUILDINGS, ENTER_RADIUS, buildingWorldPosition, buildingsForIsland } from '../data/buildings';
import { CREW_TEMPLATES } from '../data/crew';
import {
  ISLAND_LIST,
  ISLANDS,
  SEA_ENCOUNTER_CHANCE,
  SEA_ENCOUNTER_TABLE,
  START_POSITION,
  WORLD_HEIGHT,
  WORLD_WIDTH,
  islandAtPoint,
} from '../data/islands';
import { LANDMARKS, landmarkWorldPosition } from '../data/landmarks';
import {
  PIRATE_LORDS,
  isLordUnlocked,
  pirateLordForIsland,
  pirateLordWorldPosition,
} from '../data/pirateLords';
import { MERCHANT_ENCOUNTER_TABLE, MERCHANT_SEA_CHANCE, MERCHANT_TEMPLATES } from '../data/merchants';
import { RESCUE_POINT, rescuePointWorldPosition } from '../data/rescue';
import { STREETS } from '../data/streets';
import { STREET_NPCS, streetNpcPosition } from '../data/streetNpcs';
import { RESOURCE_NODES, RESOURCES, resourceNodeWorldPosition } from '../data/resources';
import { SALVAGE_SITES, salvageSiteWorldPosition } from '../data/shipUpgrades';
import { SIDE_QUESTS, SideQuest, sideQuestWorldPosition } from '../data/sideQuests';
import {
  THREAT_TEMPLATES,
  ThreatFaction,
  ambushChance,
  navyTableForHeat,
  rivalTableForHeat,
} from '../data/threats';
import { RootStackParamList } from '../navigation/types';
import { EncounterFaction, useGameStore } from '../store/gameStore';
import { CrewTemplate } from '../types';
import { maxHpFor, pickWildEncounter } from '../utils/battle';

type Props = NativeStackScreenProps<RootStackParamList, 'Map'>;

const PLAYER_SIZE = 40;
const BUILDING_SIZE = 44;
const SEA_SPEED = 260; // world units per second
const LAND_SPEED = 140;
const DEADZONE = 12; // px of drag before movement starts
const MAX_DRAG = 70; // px of drag for full speed
const ENCOUNTER_TICK_MS = 1400;
const TICK_MS = 33;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function MapScreen({ navigation }: Props) {
  const isFocused = useIsFocused();
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [player, setPlayer] = useState(START_POSITION);
  const [dragKnob, setDragKnob] = useState<{ x: number; y: number } | null>(null);
  const [dragOrigin, setDragOrigin] = useState<{ x: number; y: number } | null>(null);
  const [zoneLabel, setZoneLabel] = useState('Tortuga Cove');
  const [zoneDescription, setZoneDescription] = useState(
    'Your home port. Calm waters, no trouble here.'
  );

  const crew = useGameStore((s) => s.crew);
  const gold = useGameStore((s) => s.gold);
  const heat = useGameStore((s) => s.heat);
  const healAllCrew = useGameStore((s) => s.healAllCrew);
  const setWildEncounter = useGameStore((s) => s.setWildEncounter);
  const addHeat = useGameStore((s) => s.addHeat);
  const setCurrentBuilding = useGameStore((s) => s.setCurrentBuilding);
  const defeatedLordIds = useGameStore((s) => s.defeatedLordIds);
  const setCurrentPirateLord = useGameStore((s) => s.setCurrentPirateLord);
  const acceptedQuestIds = useGameStore((s) => s.acceptedQuestIds);
  const completedQuestIds = useGameStore((s) => s.completedQuestIds);
  const setCurrentSideQuest = useGameStore((s) => s.setCurrentSideQuest);
  const gatherResource = useGameStore((s) => s.gatherResource);
  const resourceNodeCooldowns = useGameStore((s) => s.resourceNodeCooldowns);
  const shipUpgrades = useGameStore((s) => s.shipUpgrades);
  const salvageCooldowns = useGameStore((s) => s.salvageCooldowns);
  const salvageSite = useGameStore((s) => s.salvageSite);
  const capturedCrew = useGameStore((s) => s.capturedCrew);
  const [resourceToast, setResourceToast] = useState<string | null>(null);
  const resourceToastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastLandmarkIdRef = useRef<string | null>(null);
  const lastStreetNpcIdRef = useRef<string | null>(null);
  const [, setWanderTick] = useState(0);

  const directionRef = useRef<{ x: number; y: number } | null>(null);
  const playerRef = useRef(player);
  const lastZoneIdRef = useRef<string | null>('tortuga_cove');
  const lastEncounterCheckRef = useRef(0);
  const crewRef = useRef(crew);
  crewRef.current = crew;
  const heatRef = useRef(heat);
  heatRef.current = heat;
  const shipUpgradesRef = useRef(shipUpgrades);
  shipUpgradesRef.current = shipUpgrades;
  const dragOriginRef = useRef<{ x: number; y: number } | null>(null);

  function clearDrag() {
    directionRef.current = null;
    dragOriginRef.current = null;
    setDragOrigin(null);
    setDragKnob(null);
  }

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
      clearDrag();
    });

  function onLayoutContainer(event: LayoutChangeEvent) {
    const { width, height } = event.nativeEvent.layout;
    setViewport({ width, height });
  }

  function startEncounter(
    templateId: string,
    level: number,
    faction: EncounterFaction,
    template: CrewTemplate
  ) {
    const wildMaxHp = maxHpFor(
      {
        instanceId: 'wild',
        templateId,
        nickname: template.name,
        level,
        xp: 0,
        currentHp: 0,
      },
      template
    );
    directionRef.current = null;
    setWildEncounter({ templateId, level, currentHp: wildMaxHp, faction });
    navigation.navigate('Encounter');
  }

  function triggerEncounter(isLand: boolean, islandId: string | null) {
    const island = islandId ? ISLAND_LIST.find((i) => i.id === islandId) : null;
    const table = isLand && island ? island.encounterTable : SEA_ENCOUNTER_TABLE;
    if (table.length === 0) return;

    const isAlive = crewRef.current.some((member) => member.currentHp > 0);
    if (!isAlive) return;

    const { templateId, level } = pickWildEncounter(table);
    startEncounter(templateId, level, 'wild', CREW_TEMPLATES[templateId]);
  }

  function triggerAmbush(faction: ThreatFaction) {
    const table = faction === 'rival' ? rivalTableForHeat(heatRef.current) : navyTableForHeat(heatRef.current);
    if (!table) return;

    const isAlive = crewRef.current.some((member) => member.currentHp > 0);
    if (!isAlive) return;

    const { templateId, level } = pickWildEncounter(table);
    startEncounter(templateId, level, faction, THREAT_TEMPLATES[templateId]);
  }

  function triggerMerchant() {
    const isAlive = crewRef.current.some((member) => member.currentHp > 0);
    if (!isAlive) return;

    const { templateId, level } = pickWildEncounter(MERCHANT_ENCOUNTER_TABLE);
    startEncounter(templateId, level, 'merchant', MERCHANT_TEMPLATES[templateId]);
  }

  function nearbyBuildingPos(pos: { x: number; y: number }, island: { id: string; position: { x: number; y: number } }) {
    const b = buildingsForIsland(island.id).find((b) => {
      const bp = buildingWorldPosition(b, island.position);
      return Math.hypot(pos.x - bp.x, pos.y - bp.y) <= ENTER_RADIUS;
    });
    return b ? buildingWorldPosition(b, island.position) : null;
  }

  function nearbyLordPos(pos: { x: number; y: number }, island: { id: string; position: { x: number; y: number } }) {
    const lord = pirateLordForIsland(island.id);
    if (!lord) return null;
    const lp = pirateLordWorldPosition(lord, island.position);
    return Math.hypot(pos.x - lp.x, pos.y - lp.y) <= ENTER_RADIUS ? lp : null;
  }

  function nearbySideQuestPos(pos: { x: number; y: number }, island: { id: string; position: { x: number; y: number } }) {
    const quest = SIDE_QUESTS.find((q) => {
      if (q.islandId !== island.id || !q.offset) return false;
      const qp = sideQuestWorldPosition(q as SideQuest & { offset: { x: number; y: number } }, island.position);
      return Math.hypot(pos.x - qp.x, pos.y - qp.y) <= ENTER_RADIUS;
    });
    return quest && quest.offset
      ? sideQuestWorldPosition(quest as SideQuest & { offset: { x: number; y: number } }, island.position)
      : null;
  }

  function nearbyRescuePointPos(pos: { x: number; y: number }, island: { id: string; position: { x: number; y: number } }) {
    if (RESCUE_POINT.islandId !== island.id) return null;
    const rp = rescuePointWorldPosition(island.position);
    return Math.hypot(pos.x - rp.x, pos.y - rp.y) <= ENTER_RADIUS ? rp : null;
  }

  function nearbyLandmark(pos: { x: number; y: number }, island: { id: string; position: { x: number; y: number } }) {
    return LANDMARKS.find((landmark) => {
      if (landmark.islandId !== island.id) return false;
      const lp = landmarkWorldPosition(landmark, island.position);
      return Math.hypot(pos.x - lp.x, pos.y - lp.y) <= ENTER_RADIUS;
    });
  }

  function nearbyStreetNpc(pos: { x: number; y: number }, island: { id: string; position: { x: number; y: number } }) {
    const now = Date.now();
    return STREET_NPCS.find((npc) => {
      if (npc.islandId !== island.id) return false;
      const local = streetNpcPosition(npc, now);
      const world = { x: island.position.x + local.x, y: island.position.y + local.y };
      return Math.hypot(pos.x - world.x, pos.y - world.y) <= ENTER_RADIUS;
    });
  }

  function showResourceToast(message: string, durationMs = 2200) {
    setResourceToast(message);
    if (resourceToastTimeoutRef.current) clearTimeout(resourceToastTimeoutRef.current);
    resourceToastTimeoutRef.current = setTimeout(() => setResourceToast(null), durationMs);
  }

  useEffect(() => {
    return () => {
      if (resourceToastTimeoutRef.current) clearTimeout(resourceToastTimeoutRef.current);
    };
  }, []);

  // Street NPCs patrol as a pure function of time (see streetNpcPosition) — this timer just
  // forces a re-render often enough to animate that, independent of the movement tick loop.
  useEffect(() => {
    if (!isFocused) return;
    const wanderInterval = setInterval(() => setWanderTick((t) => t + 1), 250);
    return () => clearInterval(wanderInterval);
  }, [isFocused]);

  useEffect(() => {
    if (!isFocused) return;

    // Returning from the Building/PirateLord screen can leave the player still standing inside
    // that structure's trigger radius, which would instantly re-enter it on the next tick. Nudge
    // them just outside it first.
    const pos = playerRef.current;
    const island = islandAtPoint(pos);
    if (island) {
      const nearbyPos =
        nearbyBuildingPos(pos, island) ??
        nearbyLordPos(pos, island) ??
        nearbySideQuestPos(pos, island) ??
        nearbyRescuePointPos(pos, island);
      if (nearbyPos) {
        const bp = nearbyPos;
        let dx = pos.x - bp.x;
        let dy = pos.y - bp.y;
        let dist = Math.hypot(dx, dy);
        if (dist < 1) {
          dx = 0;
          dy = 1;
          dist = 1;
        }
        const pushDist = ENTER_RADIUS + 15;
        const pushed = {
          x: clamp(bp.x + (dx / dist) * pushDist, 0, WORLD_WIDTH),
          y: clamp(bp.y + (dy / dist) * pushDist, 0, WORLD_HEIGHT),
        };
        playerRef.current = pushed;
        setPlayer(pushed);
      }
    }

    const interval = setInterval(() => {
      const direction = directionRef.current;
      if (!direction) return;

      const currentIsland = islandAtPoint(playerRef.current);
      const speed = currentIsland ? LAND_SPEED : SEA_SPEED;
      const dt = TICK_MS / 1000;

      const nextX = clamp(playerRef.current.x + direction.x * speed * dt, 0, WORLD_WIDTH);
      const nextY = clamp(playerRef.current.y + direction.y * speed * dt, 0, WORLD_HEIGHT);
      const nextPosition = { x: nextX, y: nextY };

      const nextIsland = islandAtPoint(nextPosition);

      if (nextIsland?.id === 'ile_sainte_marie' && !shipUpgradesRef.current.includes('reinforced_hull')) {
        showResourceToast('⛔ Too rough without a Reinforced Hull!');
        return;
      }

      playerRef.current = nextPosition;
      setPlayer(nextPosition);

      if (nextIsland) {
        const nearbyBuilding = buildingsForIsland(nextIsland.id).find((building) => {
          const pos = buildingWorldPosition(building, nextIsland.position);
          return Math.hypot(nextPosition.x - pos.x, nextPosition.y - pos.y) <= ENTER_RADIUS;
        });
        if (nearbyBuilding) {
          directionRef.current = null;
          setCurrentBuilding(nearbyBuilding.id);
          navigation.navigate('Building');
          return;
        }

        const lord = pirateLordForIsland(nextIsland.id);
        if (lord) {
          const lp = pirateLordWorldPosition(lord, nextIsland.position);
          if (Math.hypot(nextPosition.x - lp.x, nextPosition.y - lp.y) <= ENTER_RADIUS) {
            directionRef.current = null;
            setCurrentPirateLord(lord.id);
            navigation.navigate('PirateLord');
            return;
          }
        }

        const nearbyQuest = SIDE_QUESTS.find((q) => {
          if (q.islandId !== nextIsland.id || !q.offset) return false;
          const qp = sideQuestWorldPosition(q as SideQuest & { offset: { x: number; y: number } }, nextIsland.position);
          return Math.hypot(nextPosition.x - qp.x, nextPosition.y - qp.y) <= ENTER_RADIUS;
        });
        if (nearbyQuest) {
          directionRef.current = null;
          setCurrentSideQuest(nearbyQuest.id);
          navigation.navigate('SideQuest');
          return;
        }

        if (nearbyRescuePointPos(nextPosition, nextIsland)) {
          directionRef.current = null;
          navigation.navigate('Rescue');
          return;
        }

        // Resource nodes gather passively while walking through — no navigation, no interrupt.
        const nearbyNode = RESOURCE_NODES.find((n) => {
          if (n.islandId !== nextIsland.id) return false;
          const np = resourceNodeWorldPosition(n, nextIsland.position);
          return Math.hypot(nextPosition.x - np.x, nextPosition.y - np.y) <= ENTER_RADIUS;
        });
        if (nearbyNode) {
          const result = gatherResource(nearbyNode.id);
          if (result.success && result.resourceId && result.amount) {
            const resource = RESOURCES[result.resourceId];
            showResourceToast(`${resource.emoji} +${result.amount} ${resource.name}!`);
          }
        }

        // Salvage sites gather passively too, once the Diving Bell is owned.
        const nearbySite = SALVAGE_SITES.find((site) => {
          if (site.islandId !== nextIsland.id) return false;
          const sp = salvageSiteWorldPosition(site, nextIsland.position);
          return Math.hypot(nextPosition.x - sp.x, nextPosition.y - sp.y) <= ENTER_RADIUS;
        });
        if (nearbySite && shipUpgradesRef.current.includes(nearbySite.requiresUpgradeId)) {
          const result = salvageSite(nearbySite.id);
          if (result.success && result.amount) {
            showResourceToast(`🤿 Salvaged ${result.amount} gold!`);
          }
        }

        // Landmarks are scenery, not gameplay — a flavor toast once per approach, no navigation.
        const landmark = nearbyLandmark(nextPosition, nextIsland);
        if (landmark) {
          if (lastLandmarkIdRef.current !== landmark.id) {
            lastLandmarkIdRef.current = landmark.id;
            showResourceToast(`${landmark.emoji} ${landmark.name}: ${landmark.description}`, 4500);
          }
        } else {
          lastLandmarkIdRef.current = null;
        }

        // Street NPCs are ambient too — same one-shot toast pattern, never a quest.
        const streetNpc = nearbyStreetNpc(nextPosition, nextIsland);
        if (streetNpc) {
          if (lastStreetNpcIdRef.current !== streetNpc.id) {
            lastStreetNpcIdRef.current = streetNpc.id;
            showResourceToast(`${streetNpc.emoji} ${streetNpc.name}: ${streetNpc.flavor}`, 3500);
          }
        } else {
          lastStreetNpcIdRef.current = null;
        }
      }

      const nextZoneId = nextIsland?.id ?? null;
      if (nextZoneId !== lastZoneIdRef.current) {
        lastZoneIdRef.current = nextZoneId;
        if (nextIsland) {
          setZoneLabel(nextIsland.name);
          setZoneDescription(nextIsland.description);
          if (nextIsland.isSafeZone) {
            healAllCrew();
            addHeat(-40);
          }
        } else {
          setZoneLabel('The Open Sea');
          setZoneDescription('Nothing but waves in every direction.');
        }
      }

      const now = Date.now();
      if (now - lastEncounterCheckRef.current > ENCOUNTER_TICK_MS) {
        lastEncounterCheckRef.current = now;
        const isSafe = nextIsland?.isSafeZone;
        if (!isSafe) {
          const navyRoll = Math.random();
          const rivalRoll = Math.random();
          const merchantRoll = Math.random();
          const wildRoll = Math.random();
          const navyAmbushChance =
            ambushChance('navy', heatRef.current) * (shipUpgradesRef.current.includes('swift_rigging') ? 0.5 : 1);
          if (navyRoll < navyAmbushChance) {
            triggerAmbush('navy');
          } else if (rivalRoll < ambushChance('rival', heatRef.current)) {
            triggerAmbush('rival');
          } else if (!nextIsland && merchantRoll < MERCHANT_SEA_CHANCE) {
            triggerMerchant();
          } else {
            const chance = nextIsland ? nextIsland.encounterChance : SEA_ENCOUNTER_CHANCE;
            if (wildRoll < chance) {
              triggerEncounter(!!nextIsland, nextIsland?.id ?? null);
            }
          }
        }
      }
    }, TICK_MS);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused]);

  const currentIsland = islandAtPoint(player);
  const playerEmoji = currentIsland ? '🧍' : '⛵';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>🏴‍☠️ {zoneLabel}</Text>
          {__DEV__ && (
            <Pressable onPress={() => navigation.navigate('Debug')} style={styles.debugButton}>
              <Text style={styles.debugButtonText}>🛠</Text>
            </Pressable>
          )}
        </View>
        <View style={styles.headerRow}>
          <Text style={styles.headerText}>💰 {gold} gold</Text>
          <Pressable onPress={() => navigation.navigate('Menu')} style={styles.crewButton}>
            <Text style={styles.crewButtonText}>☰ Menu</Text>
          </Pressable>
        </View>
        <View style={styles.heatTrack}>
          <View
            style={[
              styles.heatFill,
              {
                width: `${heat}%`,
                backgroundColor: heat > 60 ? '#e53935' : heat > 25 ? '#ffb300' : '#4caf50',
              },
            ]}
          />
          <Text style={styles.heatLabel}>⚠️ Heat {Math.round(heat)}%</Text>
        </View>
      </View>

      <GestureDetector gesture={panGesture}>
      <View
        style={styles.mapContainer}
        onLayout={onLayoutContainer}
      >
        {viewport.width > 0 && (
          <View
            style={[
              styles.world,
              {
                width: WORLD_WIDTH,
                height: WORLD_HEIGHT,
                transform: [
                  { translateX: viewport.width / 2 - player.x },
                  { translateY: viewport.height / 2 - player.y },
                ],
              },
            ]}
          >
            <Svg
              width={WORLD_WIDTH}
              height={WORLD_HEIGHT}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            >
              {ISLAND_LIST.map((island) => (
                <Polygon
                  key={island.id}
                  points={island.shape
                    .map((p) => `${island.position.x + p.x},${island.position.y + p.y}`)
                    .join(' ')}
                  fill="#2c7a4b"
                  stroke={island.isSafeZone ? '#ffd166' : '#1f5a37'}
                  strokeWidth={3}
                />
              ))}

              {STREETS.map((street, i) => {
                const islandPos = ISLANDS[street.islandId].position;
                const x1 = islandPos.x + street.from.x;
                const y1 = islandPos.y + street.from.y;
                const x2 = islandPos.x + street.to.x;
                const y2 = islandPos.y + street.to.y;
                // 'main' streets get a wider light sidewalk stroke under a narrower dark road
                // stroke, so downtown reads as a real paved street instead of a bare dirt track.
                // 'path' stays a single thin dashed line — a rough or treacherous route, no sidewalk.
                if (street.style === 'main') {
                  return (
                    <React.Fragment key={i}>
                      <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#d9cdb0" strokeWidth={22} strokeLinecap="round" />
                      <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#a9825a" strokeWidth={12} strokeLinecap="round" />
                    </React.Fragment>
                  );
                }
                return (
                  <Line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#8a7452"
                    strokeWidth={6}
                    strokeDasharray="10,8"
                    strokeLinecap="round"
                  />
                );
              })}
            </Svg>

            {ISLAND_LIST.map((island) => (
              <View
                key={island.id}
                style={[
                  styles.islandLabel,
                  { left: island.position.x - 90, top: island.position.y - 32 },
                ]}
                pointerEvents="none"
              >
                <Text style={styles.islandEmoji}>{island.emoji}</Text>
                <Text style={styles.islandName}>{island.name}</Text>
              </View>
            ))}

            {BUILDINGS.map((building) => {
              const islandPos = ISLANDS[building.islandId].position;
              const pos = buildingWorldPosition(building, islandPos);
              return (
                <View
                  key={building.id}
                  style={[
                    styles.building,
                    {
                      left: pos.x - BUILDING_SIZE / 2,
                      top: pos.y - BUILDING_SIZE / 2,
                    },
                  ]}
                >
                  <Text style={styles.buildingEmoji}>{building.emoji}</Text>
                </View>
              );
            })}

            {LANDMARKS.map((landmark) => {
              const islandPos = ISLANDS[landmark.islandId].position;
              const pos = landmarkWorldPosition(landmark, islandPos);
              return (
                <View
                  key={landmark.id}
                  style={[
                    styles.landmark,
                    {
                      left: pos.x - BUILDING_SIZE / 2,
                      top: pos.y - BUILDING_SIZE / 2,
                    },
                  ]}
                  pointerEvents="none"
                >
                  <Text style={styles.buildingEmoji}>{landmark.emoji}</Text>
                  <Text style={styles.landmarkName}>{landmark.name}</Text>
                </View>
              );
            })}

            {STREET_NPCS.map((npc) => {
              const islandPos = ISLANDS[npc.islandId].position;
              const local = streetNpcPosition(npc, Date.now());
              const pos = { x: islandPos.x + local.x, y: islandPos.y + local.y };
              return (
                <View
                  key={npc.id}
                  style={[styles.streetNpc, { left: pos.x - 16, top: pos.y - 16 }]}
                  pointerEvents="none"
                >
                  <Text style={styles.streetNpcEmoji}>{npc.emoji}</Text>
                </View>
              );
            })}

            {SIDE_QUESTS.filter((quest) => quest.offset).map((quest) => {
              const islandPos = ISLANDS[quest.islandId].position;
              const pos = sideQuestWorldPosition(quest as SideQuest & { offset: { x: number; y: number } }, islandPos);
              const isCompleted = completedQuestIds.includes(quest.id);
              const isAccepted = acceptedQuestIds.includes(quest.id);
              const questStyle = isCompleted
                ? styles.questMarkerDone
                : isAccepted
                ? styles.questMarkerAccepted
                : styles.questMarkerAvailable;
              return (
                <View
                  key={quest.id}
                  style={[
                    styles.building,
                    questStyle,
                    {
                      left: pos.x - BUILDING_SIZE / 2,
                      top: pos.y - BUILDING_SIZE / 2,
                    },
                  ]}
                >
                  <Text style={styles.buildingEmoji}>📜</Text>
                </View>
              );
            })}

            {RESOURCE_NODES.map((node) => {
              const islandPos = ISLANDS[node.islandId].position;
              const pos = resourceNodeWorldPosition(node, islandPos);
              const isReady = (resourceNodeCooldowns[node.id] ?? 0) <= Date.now();
              return (
                <View
                  key={node.id}
                  style={[
                    styles.resourceNode,
                    isReady ? styles.resourceNodeReady : styles.resourceNodeCooling,
                    {
                      left: pos.x - BUILDING_SIZE / 2,
                      top: pos.y - BUILDING_SIZE / 2,
                    },
                  ]}
                >
                  <Text style={styles.buildingEmoji}>{RESOURCES[node.resourceId].emoji}</Text>
                </View>
              );
            })}

            {SALVAGE_SITES.map((site) => {
              const islandPos = ISLANDS[site.islandId].position;
              const pos = salvageSiteWorldPosition(site, islandPos);
              const isReady =
                shipUpgrades.includes(site.requiresUpgradeId) &&
                (salvageCooldowns[site.id] ?? 0) <= Date.now();
              const isUnlocked = shipUpgrades.includes(site.requiresUpgradeId);
              return (
                <View
                  key={site.id}
                  style={[
                    styles.resourceNode,
                    isReady
                      ? styles.resourceNodeReady
                      : isUnlocked
                      ? styles.resourceNodeCooling
                      : styles.salvageLocked,
                    {
                      left: pos.x - BUILDING_SIZE / 2,
                      top: pos.y - BUILDING_SIZE / 2,
                    },
                  ]}
                >
                  <Text style={styles.buildingEmoji}>🤿</Text>
                </View>
              );
            })}

            {(() => {
              const islandPos = ISLANDS[RESCUE_POINT.islandId].position;
              const pos = rescuePointWorldPosition(islandPos);
              const hasPrisoners = capturedCrew.length > 0;
              return (
                <View
                  style={[
                    styles.building,
                    hasPrisoners ? styles.questMarkerAvailable : styles.rescueMarkerEmpty,
                    {
                      left: pos.x - BUILDING_SIZE / 2,
                      top: pos.y - BUILDING_SIZE / 2,
                    },
                  ]}
                >
                  <Text style={styles.buildingEmoji}>🔓</Text>
                </View>
              );
            })()}

            {PIRATE_LORDS.map((lord) => {
              const islandPos = ISLANDS[lord.islandId].position;
              const pos = pirateLordWorldPosition(lord, islandPos);
              const isDefeated = defeatedLordIds.includes(lord.id);
              const isUnlocked = isLordUnlocked(lord, defeatedLordIds, completedQuestIds);
              const fortStyle = isDefeated
                ? styles.fortDefeated
                : isUnlocked
                ? styles.fortAvailable
                : styles.fortLocked;
              return (
                <View
                  key={lord.id}
                  style={[
                    styles.fort,
                    fortStyle,
                    {
                      left: pos.x - BUILDING_SIZE / 2,
                      top: pos.y - BUILDING_SIZE / 2,
                    },
                  ]}
                >
                  <Text style={styles.buildingEmoji}>🏰</Text>
                </View>
              );
            })}
          </View>
        )}

        {viewport.width > 0 && (
          <View
            style={[
              styles.player,
              {
                left: viewport.width / 2 - PLAYER_SIZE / 2,
                top: viewport.height / 2 - PLAYER_SIZE / 2,
              },
            ]}
          >
            <Text style={styles.playerEmoji}>{playerEmoji}</Text>
          </View>
        )}

        {dragOrigin && (
          <View
            pointerEvents="none"
            style={[styles.joystickBase, { left: dragOrigin.x - 45, top: dragOrigin.y - 45 }]}
          />
        )}
        {dragKnob && (
          <View
            pointerEvents="none"
            style={[styles.joystickKnob, { left: dragKnob.x - 20, top: dragKnob.y - 20 }]}
          />
        )}

        {resourceToast && (
          <View pointerEvents="none" style={styles.resourceToast}>
            <Text style={styles.resourceToastText}>{resourceToast}</Text>
          </View>
        )}
      </View>
      </GestureDetector>

      <View style={styles.footer}>
        <Text style={styles.islandDescription}>{zoneDescription}</Text>
        <Text style={styles.statusMessage}>
          Touch and drag anywhere to sail. Let go to stop.
        </Text>
      </View>

      <OnboardingOverlay />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0b3d5c',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f4e9cd',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  debugButton: {
    backgroundColor: '#444',
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  debugButtonText: { fontSize: 14 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  headerText: {
    color: '#f4e9cd',
    fontSize: 15,
  },
  crewButton: {
    backgroundColor: '#f4e9cd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  heatTrack: {
    height: 18,
    backgroundColor: '#062331',
    borderRadius: 9,
    marginTop: 8,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  heatFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 9,
  },
  heatLabel: {
    fontSize: 11,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
  },
  crewButtonText: {
    color: '#0b3d5c',
    fontWeight: '600',
  },
  mapContainer: {
    flex: 1,
    marginHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#124d73',
    overflow: 'hidden',
  },
  world: {
    position: 'absolute',
    backgroundColor: '#124d73',
  },
  islandLabel: {
    position: 'absolute',
    width: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  islandEmoji: {
    fontSize: 40,
  },
  islandName: {
    fontSize: 13,
    color: '#f4e9cd',
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
  building: {
    position: 'absolute',
    width: BUILDING_SIZE,
    height: BUILDING_SIZE,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#f4e9cd',
  },
  landmark: {
    position: 'absolute',
    width: BUILDING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  landmarkName: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '700',
    color: '#f4e9cd',
    textAlign: 'center',
  },
  streetNpc: {
    position: 'absolute',
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streetNpcEmoji: {
    fontSize: 20,
  },
  buildingEmoji: {
    fontSize: 24,
  },
  questMarkerAvailable: {
    borderColor: '#ffd166',
  },
  questMarkerAccepted: {
    borderColor: '#ff8c42',
  },
  questMarkerDone: {
    borderColor: '#4caf50',
    opacity: 0.6,
  },
  resourceNode: {
    position: 'absolute',
    width: BUILDING_SIZE - 8,
    height: BUILDING_SIZE - 8,
    borderRadius: (BUILDING_SIZE - 8) / 2,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  resourceNodeReady: {
    borderColor: '#4caf50',
  },
  resourceNodeCooling: {
    borderColor: '#666',
    opacity: 0.45,
  },
  salvageLocked: {
    borderColor: '#444',
    opacity: 0.3,
  },
  rescueMarkerEmpty: {
    borderColor: '#777',
    opacity: 0.55,
  },
  resourceToast: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    alignSelf: 'center',
    maxWidth: 420,
    backgroundColor: 'rgba(6, 35, 49, 0.92)',
    borderWidth: 1,
    borderColor: '#ffd166',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  resourceToastText: {
    color: '#f4e9cd',
    fontWeight: '700',
    fontSize: 14,
  },
  fort: {
    position: 'absolute',
    width: BUILDING_SIZE,
    height: BUILDING_SIZE,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  fortLocked: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderColor: '#777',
    opacity: 0.6,
  },
  fortAvailable: {
    backgroundColor: 'rgba(122, 31, 31, 0.5)',
    borderColor: '#ffd166',
  },
  fortDefeated: {
    backgroundColor: 'rgba(44, 122, 75, 0.5)',
    borderColor: '#4caf50',
  },
  player: {
    position: 'absolute',
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerEmoji: {
    fontSize: 30,
  },
  joystickBase: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(244, 233, 205, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(244, 233, 205, 0.4)',
  },
  joystickKnob: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 209, 102, 0.85)',
  },
  footer: {
    padding: 16,
    backgroundColor: '#0b3d5c',
  },
  islandDescription: {
    color: '#f4e9cd',
    fontSize: 14,
    fontStyle: 'italic',
  },
  statusMessage: {
    color: '#ffd166',
    marginTop: 6,
    fontSize: 13,
    fontWeight: '600',
  },
});
