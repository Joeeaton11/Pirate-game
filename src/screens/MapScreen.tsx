import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, LayoutChangeEvent, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Line, Polygon } from 'react-native-svg';
import OnboardingOverlay from '../components/OnboardingOverlay';
import { Building, BUILDINGS, ENTER_RADIUS, buildingWorldPosition, buildingsForIsland } from '../data/buildings';
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
import { HOUSES, houseWorldPosition, housesForIsland } from '../data/houses';
import { LANDMARKS, landmarkWorldPosition } from '../data/landmarks';
import {
  CAPTAIN_NAME,
  PLAYER_EMOJI_LAND_FRONT,
  PLAYER_EMOJI_LAND_SIDE,
  PLAYER_EMOJI_SEA,
} from '../data/protagonist';
import {
  PIRATE_LORDS,
  isLordUnlocked,
  pirateLordForIsland,
  pirateLordWorldPosition,
} from '../data/pirateLords';
import { MERCHANT_ENCOUNTER_TABLE, MERCHANT_SEA_CHANCE, MERCHANT_TEMPLATES } from '../data/merchants';
import { RESCUE_POINT, rescuePointWorldPosition } from '../data/rescue';
import {
  STREETS,
  connectedSegments,
  nearestStreetSegment,
  randomPointOnSegment,
  StreetSegment,
} from '../data/streets';
import { STREET_NPCS, StreetNpc } from '../data/streetNpcs';
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

// Pokémon-style close camera: the world renders at ZOOM x its native scale (buildings, houses,
// streets, everything inside the `world` container), while the player token — rendered as a
// separate fixed element always centered on screen — is sized to match by hand below.
const ZOOM = 5;
// In real Pokémon a character is ~1 tile and a building is ~5-7 tiles — the character is small
// next to structures. PLAYER_SIZE previously scaled at the same native size as a building (40 vs
// 44), which is why zooming alone never got there: zoom scales everything in lockstep, so a
// player already sized like a building stayed sized like a building at any zoom level. Fixed by
// giving the player a genuinely small native footprint before the same ZOOM is applied to it.
const PLAYER_SIZE = 12 * ZOOM;
const BUILDING_SIZE = 44;
const HOUSE_EMOJIS = ['🏠', '🏚️', '🛖'];
// Some building types already have a ready-made emoji that IS a structure (fort's castle, shop's
// storefront, chapel's church, etc.) — those render large and alone, same as before. The rest
// (tavern's mugs, fishmonger's fish, smithy's hammer, ...) aren't shaped like a building at all, so
// those get a house emoji as a base with the type emoji sitting on top of it as a small roof badge.
const BUILDING_SHAPED_EMOJI = new Set(['🏪', '🏚️', '⛩️', '🏰', '⛪', '🛖', '🏛️']);
const EDGE_ICON_SIZE = 34;
const EDGE_ICON_MARGIN = EDGE_ICON_SIZE / 2 + 8;
const SEA_SPEED = 260; // world units per second
const LAND_SPEED = 45;
// The procedurally-generated house grid packs some houses as little as 20 units apart
// (verified against src/data/houses.ts) — a combined radius of 20+ leaves zero or negative
// gap between them, which is how the player got permanently wedged between two houses.
// 6+3=9 keeps every real gap in the data positive (checked programmatically).
const PLAYER_COLLISION_RADIUS = 3;
const HOUSE_COLLISION_RADIUS = 6;
// Street NPCs are much smaller than the player on screen, so they get a tighter collision
// footprint — otherwise they'd feel like they're bumping into houses far from their own sprite.
const NPC_COLLISION_RADIUS = 2;
const NPC_WANDER_SPEED_SCALE = 0.6; // wandering reads better slower than a purposeful walk
const NPC_ARRIVE_RADIUS = 4; // world units — close enough to a target to pick a new one
const DEADZONE = 12; // px of drag before movement starts
const MAX_DRAG = 70; // px of drag for full speed
const ENCOUNTER_TICK_MS = 1400;

/** Shared circle-vs-circle obstacle collision with axis-separated sliding: if the full move is
 * blocked, retry the X-only and Y-only projections before giving up, so both the player and
 * street NPCs can slide along an obstacle's edge instead of hard-stopping or clipping through. */
function slideAroundObstacles(
  current: { x: number; y: number },
  raw: { x: number; y: number },
  obstacles: { x: number; y: number }[],
  keepOutRadius: number
): { x: number; y: number } {
  const blocked = (pos: { x: number; y: number }) =>
    obstacles.some((o) => Math.hypot(pos.x - o.x, pos.y - o.y) < keepOutRadius);
  if (!blocked(raw)) return raw;
  const slideX = { x: raw.x, y: current.y };
  if (!blocked(slideX)) return slideX;
  const slideY = { x: current.x, y: raw.y };
  if (!blocked(slideY)) return slideY;
  return current;
}

/** Clamps a world-space target to the edge of the visible viewport along the ray from the player
 * (screen center) to the target, so an off-screen point of interest gets a small icon pinned to
 * whichever edge it lies behind — the icon "orbits" the screen border as the player moves, same
 * idea as an off-screen objective marker in most open-world games. Returns null if the target is
 * already inside the visible area (its own on-map marker is enough, no edge icon needed).
 */
function edgeIndicatorPosition(
  player: { x: number; y: number },
  target: { x: number; y: number },
  viewport: { width: number; height: number },
  margin: number
): { x: number; y: number } | null {
  const dx = (target.x - player.x) * ZOOM;
  const dy = (target.y - player.y) * ZOOM;
  const halfW = viewport.width / 2 - margin;
  const halfH = viewport.height / 2 - margin;
  if (Math.abs(dx) <= halfW && Math.abs(dy) <= halfH) return null;
  const tX = dx !== 0 ? halfW / Math.abs(dx) : Infinity;
  const tY = dy !== 0 ? halfH / Math.abs(dy) : Infinity;
  const t = Math.min(tX, tY);
  return { x: viewport.width / 2 + dx * t, y: viewport.height / 2 + dy * t };
}

/** Finds a house-free spot near a building's door to place the player when they exit, radiating
 * outward from the entry point's own direction/distance first before fanning out to other angles.
 * The naive fixed-distance push used before this existed could land the player inside a nearby
 * house's collision zone (several Tortuga buildings have a house closer than the push distance),
 * leaving them wedged in the doorway with no clear direction to move. */
function findClearExitSpot(
  buildingPos: { x: number; y: number },
  awayDx: number,
  awayDy: number,
  awayDist: number,
  baseDist: number,
  houseObstacles: { x: number; y: number }[],
  keepOutRadius: number
): { x: number; y: number } {
  const blocked = (pos: { x: number; y: number }) =>
    houseObstacles.some((h) => Math.hypot(pos.x - h.x, pos.y - h.y) < keepOutRadius);

  const baseAngle = Math.atan2(awayDy, awayDx);
  const extraDistances = [0, 10, 20, 30, 40, 60, 80, 100];
  const angleOffsetsDeg = [0, 30, -30, 60, -60, 90, -90, 135, -135, 180];

  for (const offsetDeg of angleOffsetsDeg) {
    const angle = baseAngle + (offsetDeg * Math.PI) / 180;
    for (const extra of extraDistances) {
      const d = baseDist + extra;
      const candidate = { x: buildingPos.x + Math.cos(angle) * d, y: buildingPos.y + Math.sin(angle) * d };
      if (!blocked(candidate)) return candidate;
    }
  }
  // Should be unreachable given the search above, but never leave the player with no fallback.
  return { x: buildingPos.x + (awayDx / awayDist) * baseDist, y: buildingPos.y + (awayDy / awayDist) * baseDist };
}

interface NpcSimState {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  candidateSegments: StreetSegment[];
}

function initNpcSim(npc: StreetNpc): NpcSimState {
  const nearest = nearestStreetSegment(npc.anchor, npc.islandId);
  if (!nearest) {
    // No streets registered for this island — stay put rather than crash; shouldn't happen for
    // any island that actually has street NPCs.
    return { x: npc.anchor.x, y: npc.anchor.y, targetX: npc.anchor.x, targetY: npc.anchor.y, candidateSegments: [] };
  }
  const candidateSegments = connectedSegments(nearest.segment, npc.islandId);
  const target = randomPointOnSegment(
    candidateSegments[Math.floor(Math.random() * candidateSegments.length)]
  );
  return {
    x: nearest.point.x,
    y: nearest.point.y,
    targetX: target.x,
    targetY: target.y,
    candidateSegments,
  };
}
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
  // Walking near a building now just offers to let you in — it doesn't yank you inside — so you
  // can pass right by without stopping if you didn't actually want to go in.
  const [nearbyBuildingPrompt, setNearbyBuildingPrompt] = useState<Building | null>(null);
  const nearbyBuildingPromptIdRef = useRef<string | null>(null);
  const lastLandmarkIdRef = useRef<string | null>(null);
  const lastStreetNpcIdRef = useRef<string | null>(null);
  const [, setWanderTick] = useState(0);
  const npcSimRef = useRef<Map<string, NpcSimState>>(new Map());

  const directionRef = useRef<{ x: number; y: number } | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  // The walking-man glyph's native art faces left, so "facing right" is the one that needs a flip.
  const [facingRight, setFacingRight] = useState(false);
  // Side-profile emoji only reads left/right; swap to a front-facing glyph when the drag is mostly
  // vertical so walking toward/away from the camera actually looks different from walking sideways.
  const [facingMode, setFacingMode] = useState<'side' | 'front'>('side');
  const walkBounce = useRef(new Animated.Value(0)).current;
  const walkLoopRef = useRef<Animated.CompositeAnimation | null>(null);
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
  const dragResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearDrag() {
    // Movement stops the instant this runs, regardless of the visual cleanup below — direction
    // is a ref, not state, so there's no render delay between "released" and "actually stopped."
    directionRef.current = null;
    setIsMoving(false);

    // The native gesture's onFinalize and the window-level safety-net listener below both fire
    // for the same physical release, so this runs twice per release by design. If a snap-back is
    // already scheduled, let it finish rather than letting the second call cut it short.
    if (dragResetTimeoutRef.current) return;

    // Snap the knob back to dead-center of the base immediately (matches a real joystick),
    // then let the whole control fade out a moment later instead of vanishing mid-snap.
    const origin = dragOriginRef.current;
    dragOriginRef.current = null;
    if (origin) {
      setDragKnob({ ...origin });
      dragResetTimeoutRef.current = setTimeout(() => {
        setDragOrigin(null);
        setDragKnob(null);
        dragResetTimeoutRef.current = null;
      }, 150);
    } else {
      setDragOrigin(null);
      setDragKnob(null);
    }
  }

  // Safety net: react-native-gesture-handler's web implementation can occasionally miss firing
  // onFinalize on a real touchscreen (a swallowed touchend/touchcancel), which would otherwise
  // leave the joystick and movement direction stuck. A window-level listener guarantees release
  // is never missed — clearDrag() is a no-op when nothing is being dragged, so this is always safe.
  const clearDragRef = useRef(clearDrag);
  clearDragRef.current = clearDrag;
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const handleRelease = () => clearDragRef.current();
    window.addEventListener('pointerup', handleRelease);
    window.addEventListener('pointercancel', handleRelease);
    window.addEventListener('touchend', handleRelease);
    window.addEventListener('touchcancel', handleRelease);
    return () => {
      window.removeEventListener('pointerup', handleRelease);
      window.removeEventListener('pointercancel', handleRelease);
      window.removeEventListener('touchend', handleRelease);
      window.removeEventListener('touchcancel', handleRelease);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (dragResetTimeoutRef.current) clearTimeout(dragResetTimeoutRef.current);
    };
  }, []);

  const panGesture = Gesture.Pan()
    .minDistance(0)
    .shouldCancelWhenOutside(false)
    .onBegin((e) => {
      if (dragResetTimeoutRef.current) {
        clearTimeout(dragResetTimeoutRef.current);
        dragResetTimeoutRef.current = null;
      }
      // The player token is always fixed at the exact center of the screen, so anchor the
      // joystick there too — not at the touch point — so it visibly surrounds the character
      // regardless of where on screen the drag starts.
      const center = { x: viewport.width / 2, y: viewport.height / 2 };
      dragOriginRef.current = center;
      setDragOrigin(center);
      setDragKnob(center);
    })
    .onUpdate((e) => {
      const dist = Math.hypot(e.translationX, e.translationY);
      if (dist > DEADZONE) {
        const clampedDist = Math.min(dist, MAX_DRAG);
        directionRef.current = {
          x: (e.translationX / dist) * (clampedDist / MAX_DRAG),
          y: (e.translationY / dist) * (clampedDist / MAX_DRAG),
        };
        setIsMoving(true);
        if (e.translationX !== 0) setFacingRight(e.translationX > 0);
        setFacingMode(Math.abs(e.translationY) > Math.abs(e.translationX) ? 'front' : 'side');
      } else {
        directionRef.current = null;
        setIsMoving(false);
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
    return STREET_NPCS.find((npc) => {
      if (npc.islandId !== island.id) return false;
      const sim = npcSimRef.current.get(npc.id);
      if (!sim) return false;
      const world = { x: island.position.x + sim.x, y: island.position.y + sim.y };
      return Math.hypot(pos.x - world.x, pos.y - world.y) <= ENTER_RADIUS;
    });
  }

  function showResourceToast(message: string, durationMs = 2200) {
    setResourceToast(message);
    if (resourceToastTimeoutRef.current) clearTimeout(resourceToastTimeoutRef.current);
    resourceToastTimeoutRef.current = setTimeout(() => setResourceToast(null), durationMs);
  }

  function confirmEnterBuilding() {
    if (!nearbyBuildingPrompt) return;
    directionRef.current = null;
    nearbyBuildingPromptIdRef.current = null;
    setNearbyBuildingPrompt(null);
    setCurrentBuilding(nearbyBuildingPrompt.id);
    navigation.navigate('Building');
  }

  useEffect(() => {
    return () => {
      if (resourceToastTimeoutRef.current) clearTimeout(resourceToastTimeoutRef.current);
    };
  }, []);

  // Single-glyph "walk cycle": bob the player emoji up and down in a loop while actively moving,
  // settle back to rest the moment movement stops. No spritesheet, so this is the whole animation.
  useEffect(() => {
    if (isMoving) {
      walkLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(walkBounce, {
            toValue: -6,
            duration: 160,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(walkBounce, {
            toValue: 0,
            duration: 160,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
      walkLoopRef.current.start();
    } else {
      walkLoopRef.current?.stop();
      Animated.timing(walkBounce, { toValue: 0, duration: 120, useNativeDriver: true }).start();
    }
    return () => walkLoopRef.current?.stop();
  }, [isMoving, walkBounce]);

  // Street NPCs wander the real street network near their home spot: walk toward a random point
  // on their current/connected street segments, collide with houses same as the player, and pick
  // a new random target on arrival — independent of the main movement tick loop.
  useEffect(() => {
    if (!isFocused) return;
    const wanderInterval = setInterval(() => {
      const dt = 0.25;
      for (const npc of STREET_NPCS) {
        let sim = npcSimRef.current.get(npc.id);
        if (!sim) {
          sim = initNpcSim(npc);
          npcSimRef.current.set(npc.id, sim);
        }
        if (sim.candidateSegments.length === 0) continue; // no streets on this island — stays put

        const dx = sim.targetX - sim.x;
        const dy = sim.targetY - sim.y;
        const dist = Math.hypot(dx, dy);
        if (dist < NPC_ARRIVE_RADIUS) {
          const next = randomPointOnSegment(
            sim.candidateSegments[Math.floor(Math.random() * sim.candidateSegments.length)]
          );
          sim.targetX = next.x;
          sim.targetY = next.y;
          continue;
        }

        const step = npc.speed * NPC_WANDER_SPEED_SCALE * dt;
        const raw = { x: sim.x + (dx / dist) * step, y: sim.y + (dy / dist) * step };
        const houseObstacles = housesForIsland(npc.islandId).map((house) =>
          houseWorldPosition(house, ISLANDS[npc.islandId].position)
        );
        const resolved = slideAroundObstacles(
          { x: sim.x, y: sim.y },
          raw,
          houseObstacles,
          HOUSE_COLLISION_RADIUS + NPC_COLLISION_RADIUS
        );
        sim.x = resolved.x;
        sim.y = resolved.y;
      }
      setWanderTick((t) => t + 1);
    }, 250);
    return () => clearInterval(wanderInterval);
  }, [isFocused]);

  useEffect(() => {
    if (!isFocused) return;

    // Returning from the PirateLord/SideQuest/Rescue screen can leave the player still standing
    // inside that trigger's radius, which would instantly re-enter it on the next tick. Nudge them
    // just outside it first. Buildings are excluded here — they no longer auto-enter on proximity
    // (a dismissible prompt now, see nearbyBuildingPrompt), so there's nothing to instantly re-enter.
    const pos = playerRef.current;
    const island = islandAtPoint(pos);
    if (island) {
      const nearbyPos =
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
        const houseObstacles = housesForIsland(island.id).map((house) =>
          houseWorldPosition(house, island.position)
        );
        const clearSpot = findClearExitSpot(
          bp,
          dx,
          dy,
          dist,
          pushDist,
          houseObstacles,
          HOUSE_COLLISION_RADIUS + PLAYER_COLLISION_RADIUS
        );
        const pushed = {
          x: clamp(clearSpot.x, 0, WORLD_WIDTH),
          y: clamp(clearSpot.y, 0, WORLD_HEIGHT),
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

      const rawX = clamp(playerRef.current.x + direction.x * speed * dt, 0, WORLD_WIDTH);
      const rawY = clamp(playerRef.current.y + direction.y * speed * dt, 0, WORLD_HEIGHT);

      // Houses are solid — walking into one blocks that axis but still lets the player slide
      // along it on the other axis, rather than hard-stopping dead at the first touch.
      const houseObstacles = currentIsland
        ? housesForIsland(currentIsland.id).map((house) => houseWorldPosition(house, currentIsland.position))
        : [];
      const nextPosition = slideAroundObstacles(
        playerRef.current,
        { x: rawX, y: rawY },
        houseObstacles,
        HOUSE_COLLISION_RADIUS + PLAYER_COLLISION_RADIUS
      );

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
          if (nearbyBuildingPromptIdRef.current !== nearbyBuilding.id) {
            nearbyBuildingPromptIdRef.current = nearbyBuilding.id;
            setNearbyBuildingPrompt(nearbyBuilding);
          }
        } else if (nearbyBuildingPromptIdRef.current) {
          nearbyBuildingPromptIdRef.current = null;
          setNearbyBuildingPrompt(null);
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
  const playerEmoji = currentIsland
    ? facingMode === 'front'
      ? PLAYER_EMOJI_LAND_FRONT
      : PLAYER_EMOJI_LAND_SIDE
    : PLAYER_EMOJI_SEA;

  const sortedLords = [...PIRATE_LORDS].sort((a, b) => a.order - b.order);
  const nextLord = sortedLords.find(
    (lord) => !defeatedLordIds.includes(lord.id) && isLordUnlocked(lord, defeatedLordIds, completedQuestIds)
  );
  const allLordsDefeated = defeatedLordIds.length === PIRATE_LORDS.length;
  const gatedLord =
    !allLordsDefeated && !nextLord ? sortedLords.find((lord) => !defeatedLordIds.includes(lord.id)) : undefined;
  const gateQuest = gatedLord?.requiresQuestId
    ? SIDE_QUESTS.find((q) => q.id === gatedLord.requiresQuestId)
    : undefined;

  let mainQuestText: string;
  if (allLordsDefeated) {
    mainQuestText = 'Every marque is yours — terror of these waters';
  } else if (nextLord) {
    mainQuestText = `Defeat ${nextLord.name} at ${ISLANDS[nextLord.islandId].name}`;
  } else {
    mainQuestText = gateQuest
      ? `Complete "${gateQuest.title}" at ${ISLANDS[gateQuest.islandId].name}`
      : 'Seek your next target';
  }

  // The compass points at whatever `mainQuestText` is currently naming — same underlying target,
  // just resolved to a world position instead of a sentence. Null means "nothing to point at"
  // (every lord defeated), which hides the compass entirely rather than showing a dead needle.
  let mainQuestTarget: { x: number; y: number } | null = null;
  if (nextLord) {
    mainQuestTarget = pirateLordWorldPosition(nextLord, ISLANDS[nextLord.islandId].position);
  } else if (gateQuest) {
    const gateIslandPos = ISLANDS[gateQuest.islandId].position;
    if (gateQuest.offset) {
      mainQuestTarget = sideQuestWorldPosition(
        gateQuest as SideQuest & { offset: { x: number; y: number } },
        gateIslandPos
      );
    } else if (gateQuest.hostedByBuildingId) {
      const hostBuilding = BUILDINGS.find((b) => b.id === gateQuest.hostedByBuildingId);
      mainQuestTarget = hostBuilding ? buildingWorldPosition(hostBuilding, gateIslandPos) : null;
    }
  }
  // Screen/world y increases downward, so "north" (no rotation) needs -dy; atan2(dx, -dy) then
  // gives 0deg when the target is directly above and increases clockwise, matching CSS rotate.
  const compassAngleDeg = mainQuestTarget
    ? (Math.atan2(mainQuestTarget.x - player.x, -(mainQuestTarget.y - player.y)) * 180) / Math.PI
    : null;

  // Off-screen resource nodes and side quests on the current island get a small edge-of-screen icon
  // so a player who hasn't explored the island yet can still see roughly where to go — scoped to the
  // current island only (a marker pointing at something on a different island wouldn't be
  // actionable). Resource nodes are skipped while on cooldown (nothing to gather right now); side
  // quests are limited to the standalone ones with their own `.offset` map marker (quests hosted by
  // a building are meant to be found by talking to patrons, not marked), skip completed ones, and
  // skip the current gate quest since that one's already covered by the compass above.
  type EdgeIndicator = { id: string; emoji: string; pos: { x: number; y: number } };
  const resourceEdgeIndicators: EdgeIndicator[] = currentIsland
    ? RESOURCE_NODES.filter(
        (n) => n.islandId === currentIsland.id && (resourceNodeCooldowns[n.id] ?? 0) <= Date.now()
      )
        .map((n) => {
          const targetPos = resourceNodeWorldPosition(n, ISLANDS[n.islandId].position);
          const edgePos = edgeIndicatorPosition(player, targetPos, viewport, EDGE_ICON_MARGIN);
          return edgePos ? { id: n.id, emoji: RESOURCES[n.resourceId].emoji, pos: edgePos } : null;
        })
        .filter((x): x is EdgeIndicator => x !== null)
    : [];
  const sideQuestEdgeIndicators: EdgeIndicator[] = currentIsland
    ? SIDE_QUESTS.filter(
        (q) =>
          q.offset &&
          q.islandId === currentIsland.id &&
          !completedQuestIds.includes(q.id) &&
          q.id !== gateQuest?.id
      )
        .map((q) => {
          const targetPos = sideQuestWorldPosition(
            q as SideQuest & { offset: { x: number; y: number } },
            ISLANDS[q.islandId].position
          );
          const edgePos = edgeIndicatorPosition(player, targetPos, viewport, EDGE_ICON_MARGIN);
          return edgePos ? { id: q.id, emoji: '📜', pos: edgePos } : null;
        })
        .filter((x): x is EdgeIndicator => x !== null)
    : [];
  const edgeIndicators = [...resourceEdgeIndicators, ...sideQuestEdgeIndicators];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.captainTag}>
              {playerEmoji} {CAPTAIN_NAME}
            </Text>
            <Text style={styles.title}>🏴‍☠️ {zoneLabel}</Text>
          </View>
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
        <Pressable style={styles.questTracker} onPress={() => navigation.navigate('Quests')}>
          <Text style={styles.questTrackerLabel}>🧭 Main Quest</Text>
          <Text style={styles.questTrackerText} numberOfLines={1}>
            {mainQuestText}
          </Text>
        </Pressable>
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
                // The `world` view's own default transform-origin is its center, so a plain
                // { scale: ZOOM } would zoom around (WORLD_WIDTH/2, WORLD_HEIGHT/2) — nowhere
                // near the player on a large multi-island map. This translate cancels that
                // center-origin offset out algebraically so the net effect is exactly "zoom in
                // around the player, then re-center them on screen":
                //   finalTranslate = viewportCenter - worldCenter + ZOOM * (worldCenter - player)
                transform: [
                  {
                    translateX:
                      viewport.width / 2 - WORLD_WIDTH / 2 + ZOOM * (WORLD_WIDTH / 2 - player.x),
                  },
                  {
                    translateY:
                      viewport.height / 2 - WORLD_HEIGHT / 2 + ZOOM * (WORLD_HEIGHT / 2 - player.y),
                  },
                  { scale: ZOOM },
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
                      <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#d9cdb0" strokeWidth={28} strokeLinecap="round" />
                      <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#a9825a" strokeWidth={16} strokeLinecap="round" />
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
                    strokeWidth={8}
                    strokeDasharray="10,8"
                    strokeLinecap="round"
                  />
                );
              })}
            </Svg>

            {HOUSES.map((house, i) => {
              const islandPos = ISLANDS[house.islandId].position;
              const pos = houseWorldPosition(house, islandPos);
              const emoji = HOUSE_EMOJIS[i % HOUSE_EMOJIS.length];
              return (
                <View
                  key={i}
                  style={[styles.house, { left: pos.x - 13, top: pos.y - 13 }]}
                  pointerEvents="none"
                >
                  <Text style={styles.houseEmoji}>{emoji}</Text>
                </View>
              );
            })}

            {BUILDINGS.map((building) => {
              const islandPos = ISLANDS[building.islandId].position;
              const pos = buildingWorldPosition(building, islandPos);
              const hasOpenChallenge = SIDE_QUESTS.some(
                (q) => q.hostedByBuildingId === building.id && !completedQuestIds.includes(q.id)
              );
              const isBuildingShaped = BUILDING_SHAPED_EMOJI.has(building.emoji);
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
                  {hasOpenChallenge && <Text style={styles.buildingQuestIndicator}>❗</Text>}
                  {isBuildingShaped ? (
                    <Text style={styles.buildingEmoji}>{building.emoji}</Text>
                  ) : (
                    <>
                      <Text style={styles.buildingHouseBase}>🏠</Text>
                      <Text style={styles.buildingTypeBadge}>{building.emoji}</Text>
                    </>
                  )}
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
                </View>
              );
            })}

            {STREET_NPCS.map((npc) => {
              const islandPos = ISLANDS[npc.islandId].position;
              const sim = npcSimRef.current.get(npc.id) ?? initNpcSim(npc);
              const pos = { x: islandPos.x + sim.x, y: islandPos.y + sim.y };
              return (
                <View
                  key={npc.id}
                  style={[styles.streetNpc, { left: pos.x - 5, top: pos.y - 5 }]}
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
            <Animated.Text
              style={[
                styles.playerEmoji,
                {
                  transform: [
                    { translateY: walkBounce },
                    { scaleX: facingRight ? -1 : 1 },
                  ],
                },
              ]}
            >
              {playerEmoji}
            </Animated.Text>
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

        {nearbyBuildingPrompt && (
          <Pressable style={styles.buildingPrompt} onPress={confirmEnterBuilding}>
            <Text style={styles.buildingPromptEmoji}>{nearbyBuildingPrompt.emoji}</Text>
            <Text style={styles.buildingPromptText}>Enter {nearbyBuildingPrompt.name}?</Text>
          </Pressable>
        )}

        {compassAngleDeg !== null && (
          <View pointerEvents="none" style={styles.compassBadge}>
            <Text style={[styles.compassEmoji, { transform: [{ rotate: `${compassAngleDeg}deg` }] }]}>
              🧭
            </Text>
          </View>
        )}

        {edgeIndicators.map((indicator) => (
          <View
            key={indicator.id}
            pointerEvents="none"
            style={[
              styles.edgeIndicator,
              { left: indicator.pos.x - EDGE_ICON_SIZE / 2, top: indicator.pos.y - EDGE_ICON_SIZE / 2 },
            ]}
          >
            <Text style={styles.edgeIndicatorEmoji}>{indicator.emoji}</Text>
          </View>
        ))}
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
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: '#2b1c12',
    borderBottomWidth: 3,
    borderBottomColor: '#c9a227',
  },
  captainTag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffd166',
    letterSpacing: 0.4,
    marginBottom: 2,
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
    backgroundColor: '#c9a227',
    borderWidth: 1,
    borderColor: '#7a5a1e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  heatTrack: {
    height: 18,
    backgroundColor: '#1a1008',
    borderWidth: 1,
    borderColor: '#7a5a1e',
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
    color: '#2b1c12',
    fontWeight: '700',
  },
  questTracker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 209, 102, 0.12)',
    borderWidth: 1,
    borderColor: '#c9a227',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 8,
  },
  questTrackerLabel: {
    color: '#ffd166',
    fontWeight: '800',
    fontSize: 11,
  },
  questTrackerText: {
    color: '#f4e9cd',
    fontSize: 12,
    marginLeft: 8,
    flexShrink: 1,
    textAlign: 'right',
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
  // Buildings whose type emoji isn't already shaped like a structure (tavern's mugs, fishmonger's
  // fish, smithy's hammer, ...) get a plain house as a base instead, with the real type emoji
  // sitting on top of it like a small badge on the roof.
  buildingHouseBase: {
    fontSize: 30,
  },
  buildingTypeBadge: {
    position: 'absolute',
    top: 3,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 14,
    zIndex: 2,
  },
  landmark: {
    position: 'absolute',
    width: BUILDING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  house: {
    position: 'absolute',
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  houseEmoji: {
    fontSize: 18,
  },
  streetNpc: {
    position: 'absolute',
    width: 10,
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streetNpcEmoji: {
    fontSize: 7,
  },
  buildingEmoji: {
    fontSize: 24,
  },
  buildingQuestIndicator: {
    position: 'absolute',
    top: -6,
    right: -6,
    fontSize: 16,
    zIndex: 1,
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
  buildingPrompt: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    alignSelf: 'center',
    maxWidth: 420,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(43, 28, 18, 0.95)',
    borderWidth: 2,
    borderColor: '#ffd166',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  buildingPromptEmoji: {
    fontSize: 22,
  },
  buildingPromptText: {
    color: '#f4e9cd',
    fontWeight: '800',
    fontSize: 15,
  },
  compassBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 2,
    borderColor: '#f4e9cd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassEmoji: {
    fontSize: 26,
  },
  edgeIndicator: {
    position: 'absolute',
    width: EDGE_ICON_SIZE,
    height: EDGE_ICON_SIZE,
    borderRadius: EDGE_ICON_SIZE / 2,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 2,
    borderColor: '#f4e9cd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  edgeIndicatorEmoji: {
    fontSize: 17,
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
    fontSize: 9 * ZOOM,
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
