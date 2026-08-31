/**
 * Standalone, dev-only sandbox for testing the "invisible contact points over a fully painted
 * backdrop" approach discussed for interiors — walls, tables, stools, and the bar are all baked
 * into one reference image (the user's own "Jolly Roger" mockup), and this screen lays invisible
 * (toggleable) collision shapes over it so the mechanism itself can actually be walked around and
 * felt out before any real backdrop art exists.
 *
 * Deliberately NOT wired through BUILDINGS/interiors.ts/BuildingScreen — this is throwaway-safe
 * scaffolding for one reference image, not a new building. Reachable only from the dev-only Debug
 * screen, same __DEV__ gating as Debug itself.
 */
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { Image, LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  TEST_BACKDROP,
  TEST_ENTRY_POSITION,
  TEST_OBSTACLES,
  TEST_ROOM_SIZE,
  TestObstacleType,
} from '../data/interiorContactTest';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'InteriorContactTest'>;

const PLAYER_SIZE = 34;
const SPEED = TEST_ROOM_SIZE / 3.2; // logical units per second — a leisurely, controllable walk
const DEADZONE = 10;
const MAX_DRAG = 55;
const TICK_MS = 33;

const CONTACT_COLORS: Record<TestObstacleType, string> = {
  bar: 'rgba(210,120,40,0.45)',
  table: 'rgba(220,60,50,0.45)',
  stool: 'rgba(230,180,40,0.45)',
  barrel: 'rgba(120,80,200,0.45)',
  wall: 'rgba(60,180,220,0.45)',
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** Same circle-vs-circle collision-with-sliding trick used for outdoor buildings (MapScreen) and
 * indoor furniture (BuildingScreen) — a blocked move retries the X-only then Y-only projection
 * before giving up, so the player slides along an obstacle's edge instead of stopping dead or
 * clipping through it. */
function slideAroundObstacles(
  current: { x: number; y: number },
  raw: { x: number; y: number },
  obstacles: { x: number; y: number; radius: number }[]
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

export default function InteriorContactTestScreen({ navigation }: Props) {
  const [showContacts, setShowContacts] = useState(true);
  const [roomSize, setRoomSize] = useState(0);
  const [player, setPlayer] = useState(TEST_ENTRY_POSITION);
  const playerRef = useRef(player);
  playerRef.current = player;
  const directionRef = useRef<{ x: number; y: number } | null>(null);
  const [dragOrigin, setDragOrigin] = useState<{ x: number; y: number } | null>(null);
  const [dragKnob, setDragKnob] = useState<{ x: number; y: number } | null>(null);
  const dragOriginRef = useRef<{ x: number; y: number } | null>(null);

  function onLayoutRoom(e: LayoutChangeEvent) {
    setRoomSize(Math.min(e.nativeEvent.layout.width, e.nativeEvent.layout.height));
  }

  function resetPosition() {
    playerRef.current = TEST_ENTRY_POSITION;
    setPlayer(TEST_ENTRY_POSITION);
  }

  useEffect(() => {
    const iv = setInterval(() => {
      const direction = directionRef.current;
      if (!direction) return;
      const dt = TICK_MS / 1000;
      const rawX = clamp(playerRef.current.x + direction.x * SPEED * dt, 0, TEST_ROOM_SIZE);
      const rawY = clamp(playerRef.current.y + direction.y * SPEED * dt, 0, TEST_ROOM_SIZE);
      playerRef.current = slideAroundObstacles(playerRef.current, { x: rawX, y: rawY }, TEST_OBSTACLES);
      setPlayer(playerRef.current);
    }, TICK_MS);
    return () => clearInterval(iv);
  }, []);

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

  const scale = roomSize / TEST_ROOM_SIZE;

  return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>Backdrop Contact-Point Tester</Text>
        </View>
        <Text style={styles.subtitle}>
          Drag anywhere on the scene to walk. This is one flat reference image with invisible
          collision shapes laid over the bar, tables, stools, and stairs — nothing here is a
          separate sprite.
        </Text>

        <GestureDetector gesture={panGesture}>
          <View style={styles.roomOuter} onLayout={onLayoutRoom}>
            {roomSize > 0 && (
              <View style={[styles.room, { width: roomSize, height: roomSize }]}>
                {/* Explicit pixel width/height rather than StyleSheet.absoluteFill: this asset's
                    registered intrinsic size (1254x1254, no @2x/@3x density variant) is larger
                    than the room box on most screens, and absoluteFill's implicit sizing lost to
                    that intrinsic size here, rendering the image at full native resolution and
                    letting the room's own overflow:hidden clip it to a zoomed-in top-left corner
                    instead of the whole scene. An explicit size removes the ambiguity outright. */}
                <Image
                  source={TEST_BACKDROP}
                  style={{ width: roomSize, height: roomSize }}
                  resizeMode="cover"
                />

                {showContacts &&
                  TEST_OBSTACLES.map((o, i) => (
                    <View
                      key={i}
                      style={[
                        styles.contactCircle,
                        {
                          left: o.x * scale - o.radius * scale,
                          top: o.y * scale - o.radius * scale,
                          width: o.radius * 2 * scale,
                          height: o.radius * 2 * scale,
                          borderRadius: o.radius * scale,
                          backgroundColor: CONTACT_COLORS[o.type],
                        },
                      ]}
                    />
                  ))}

                <View
                  style={[
                    styles.player,
                    {
                      left: player.x * scale - (PLAYER_SIZE / 2) * scale,
                      top: player.y * scale - (PLAYER_SIZE / 2) * scale,
                      width: PLAYER_SIZE * scale,
                      height: PLAYER_SIZE * scale,
                    },
                  ]}
                >
                  <Text style={{ fontSize: 22 * scale }}>🧍</Text>
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

        {showContacts && (
          <View style={styles.legend}>
            {(Object.keys(CONTACT_COLORS) as TestObstacleType[]).map((type) => (
              <View key={type} style={styles.legendRow}>
                <View style={[styles.legendSwatch, { backgroundColor: CONTACT_COLORS[type] }]} />
                <Text style={styles.legendText}>{type}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.controls}>
          <Pressable style={styles.controlButton} onPress={() => setShowContacts((v) => !v)}>
            <Text style={styles.controlButtonText}>
              {showContacts ? 'Hide' : 'Show'} Contact Points
            </Text>
          </Pressable>
          <Pressable style={styles.controlButton} onPress={resetPosition}>
            <Text style={styles.controlButtonText}>Reset Position</Text>
          </Pressable>
        </View>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1a1208' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 12,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#2c2013',
    borderRadius: 8,
  },
  backButtonText: { color: '#f4e9cd', fontSize: 14, fontWeight: '600' },
  title: { color: '#f4e9cd', fontSize: 16, fontWeight: '700', flexShrink: 1 },
  subtitle: {
    color: '#c9b78f',
    fontSize: 12,
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 8,
    lineHeight: 16,
  },
  roomOuter: { flex: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  room: { position: 'relative', overflow: 'hidden', borderRadius: 8 },
  contactCircle: { position: 'absolute', borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)' },
  player: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 999,
  },
  joystickBase: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(244,233,205,0.15)',
  },
  joystickKnob: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(244,233,205,0.4)',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSwatch: { width: 12, height: 12, borderRadius: 6 },
  legendText: { color: '#c9b78f', fontSize: 12, textTransform: 'capitalize' },
  controls: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
  },
  controlButton: {
    flex: 1,
    backgroundColor: '#f4e9cd',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  controlButtonText: { color: '#2c2013', fontWeight: '700', fontSize: 13 },
});
