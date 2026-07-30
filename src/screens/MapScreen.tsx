import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import {
  PIRATE_LORDS,
  isLordUnlocked,
  pirateLordForIsland,
  pirateLordWorldPosition,
} from '../data/pirateLords';
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

  const directionRef = useRef<{ x: number; y: number } | null>(null);
  const playerRef = useRef(player);
  const lastZoneIdRef = useRef<string | null>('tortuga_cove');
  const lastEncounterCheckRef = useRef(0);
  const crewRef = useRef(crew);
  crewRef.current = crew;
  const heatRef = useRef(heat);
  heatRef.current = heat;
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

  useEffect(() => {
    if (!isFocused) return;

    // Returning from the Building/PirateLord screen can leave the player still standing inside
    // that structure's trigger radius, which would instantly re-enter it on the next tick. Nudge
    // them just outside it first.
    const pos = playerRef.current;
    const island = islandAtPoint(pos);
    if (island) {
      const nearbyPos = nearbyBuildingPos(pos, island) ?? nearbyLordPos(pos, island);
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
      playerRef.current = nextPosition;
      setPlayer(nextPosition);

      const nextIsland = islandAtPoint(nextPosition);

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
          const wildRoll = Math.random();
          if (navyRoll < ambushChance('navy', heatRef.current)) {
            triggerAmbush('navy');
          } else if (rivalRoll < ambushChance('rival', heatRef.current)) {
            triggerAmbush('rival');
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
        <Text style={styles.title}>🏴‍☠️ {zoneLabel}</Text>
        <View style={styles.headerRow}>
          <Text style={styles.headerText}>💰 {gold} gold</Text>
          <View style={styles.headerButtons}>
            <Pressable onPress={() => navigation.navigate('Quests')} style={styles.questButton}>
              <Text style={styles.crewButtonText}>
                🎖️ {defeatedLordIds.length}/{PIRATE_LORDS.length}
              </Text>
            </Pressable>
            <Pressable onPress={() => navigation.navigate('Crew')} style={styles.crewButton}>
              <Text style={styles.crewButtonText}>Crew ({crew.length}) ▸</Text>
            </Pressable>
          </View>
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
            {ISLAND_LIST.map((island) => (
              <View
                key={island.id}
                style={[
                  styles.island,
                  {
                    left: island.position.x - island.radius,
                    top: island.position.y - island.radius,
                    width: island.radius * 2,
                    height: island.radius * 2,
                    borderRadius: island.radius,
                  },
                  island.isSafeZone && styles.islandSafe,
                ]}
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

            {PIRATE_LORDS.map((lord) => {
              const islandPos = ISLANDS[lord.islandId].position;
              const pos = pirateLordWorldPosition(lord, islandPos);
              const isDefeated = defeatedLordIds.includes(lord.id);
              const isUnlocked = isLordUnlocked(lord, defeatedLordIds);
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
      </View>
      </GestureDetector>

      <View style={styles.footer}>
        <Text style={styles.islandDescription}>{zoneDescription}</Text>
        <Text style={styles.statusMessage}>
          Touch and drag anywhere to sail. Let go to stop.
        </Text>
      </View>
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
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  crewButton: {
    backgroundColor: '#f4e9cd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  questButton: {
    backgroundColor: '#ffd166',
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
  island: {
    position: 'absolute',
    backgroundColor: '#2c7a4b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#1f5a37',
  },
  islandSafe: {
    borderColor: '#ffd166',
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
  buildingEmoji: {
    fontSize: 24,
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
