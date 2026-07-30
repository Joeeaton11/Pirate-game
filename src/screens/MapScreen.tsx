import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapLine } from '../components/MapLine';
import { CREW_TEMPLATES } from '../data/crew';
import { ISLAND_LIST, ISLANDS } from '../data/islands';
import { RootStackParamList } from '../navigation/types';
import { useGameStore } from '../store/gameStore';
import { maxHpFor, pickWildEncounter } from '../utils/battle';

type Props = NativeStackScreenProps<RootStackParamList, 'Map'>;

const ISLAND_SIZE = 64;

export default function MapScreen({ navigation }: Props) {
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const currentIslandId = useGameStore((s) => s.currentIslandId);
  const gold = useGameStore((s) => s.gold);
  const crew = useGameStore((s) => s.crew);
  const sailTo = useGameStore((s) => s.sailTo);
  const healAllCrew = useGameStore((s) => s.healAllCrew);
  const setWildEncounter = useGameStore((s) => s.setWildEncounter);
  const [statusMessage, setStatusMessage] = useState(
    'Tap a connected island to set sail.'
  );

  const currentIsland = ISLANDS[currentIslandId];

  function onLayoutContainer(event: LayoutChangeEvent) {
    const { width, height } = event.nativeEvent.layout;
    setLayout({ width, height });
  }

  function toPixels(pos: { x: number; y: number }) {
    return {
      x: pos.x * layout.width,
      y: pos.y * layout.height,
    };
  }

  function handleIslandPress(islandId: string) {
    if (islandId === currentIslandId) {
      setStatusMessage(`You're already at ${ISLANDS[islandId].name}.`);
      return;
    }
    if (!currentIsland.connections.includes(islandId)) {
      setStatusMessage('No direct route to that island from here.');
      return;
    }

    const destination = ISLANDS[islandId];
    sailTo(islandId);

    if (destination.id === 'tortuga_cove') {
      healAllCrew();
      setStatusMessage('You dock at Tortuga Cove. Your crew rests and heals up.');
      return;
    }

    const isAlive = crew.some((member) => member.currentHp > 0);
    const roll = Math.random();
    if (isAlive && destination.encounterTable.length > 0 && roll < destination.encounterChance) {
      const { templateId, level } = pickWildEncounter(destination.encounterTable);
      const template = CREW_TEMPLATES[templateId];
      const wildMaxHp = maxHpFor({
        instanceId: 'wild',
        templateId,
        nickname: template.name,
        level,
        xp: 0,
        currentHp: 0,
      });
      setWildEncounter({ templateId, level, currentHp: wildMaxHp });
      navigation.navigate('Encounter');
      return;
    }

    setStatusMessage(`You arrive at ${destination.name} without incident.`);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>⚓ Pirate's Chart</Text>
        <View style={styles.headerRow}>
          <Text style={styles.headerText}>💰 {gold} gold</Text>
          <Pressable onPress={() => navigation.navigate('Crew')} style={styles.crewButton}>
            <Text style={styles.crewButtonText}>Crew ({crew.length}) ▸</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.mapContainer} onLayout={onLayoutContainer}>
        {layout.width > 0 &&
          ISLAND_LIST.flatMap((island) =>
            island.connections
              .filter((connId) => connId > island.id)
              .map((connId) => (
                <MapLine
                  key={`${island.id}-${connId}`}
                  from={toPixels(island.position)}
                  to={toPixels(ISLANDS[connId].position)}
                />
              ))
          )}

        {layout.width > 0 &&
          ISLAND_LIST.map((island) => {
            const pixelPos = toPixels(island.position);
            const isCurrent = island.id === currentIslandId;
            const isReachable = currentIsland.connections.includes(island.id);
            return (
              <Pressable
                key={island.id}
                onPress={() => handleIslandPress(island.id)}
                style={[
                  styles.islandButton,
                  {
                    left: pixelPos.x - ISLAND_SIZE / 2,
                    top: pixelPos.y - ISLAND_SIZE / 2,
                  },
                  isCurrent && styles.islandCurrent,
                  !isCurrent && !isReachable && styles.islandUnreachable,
                ]}
              >
                <Text style={styles.islandEmoji}>{island.emoji}</Text>
                <Text style={styles.islandName} numberOfLines={1}>
                  {island.name}
                </Text>
                {isCurrent && <Text style={styles.shipMarker}>⛵</Text>}
              </Pressable>
            );
          })}
      </View>

      <View style={styles.footer}>
        <Text style={styles.islandDescription}>{currentIsland.description}</Text>
        <Text style={styles.statusMessage}>{statusMessage}</Text>
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
    fontSize: 22,
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
  crewButton: {
    backgroundColor: '#f4e9cd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
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
  islandButton: {
    position: 'absolute',
    width: ISLAND_SIZE,
    height: ISLAND_SIZE,
    borderRadius: ISLAND_SIZE / 2,
    backgroundColor: '#2c7a4b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#f4e9cd',
  },
  islandCurrent: {
    borderColor: '#ffd166',
    borderWidth: 3,
  },
  islandUnreachable: {
    opacity: 0.45,
  },
  islandEmoji: {
    fontSize: 24,
  },
  islandName: {
    fontSize: 9,
    color: '#f4e9cd',
    fontWeight: '600',
    position: 'absolute',
    bottom: -16,
    width: 90,
    textAlign: 'center',
  },
  shipMarker: {
    position: 'absolute',
    top: -22,
    fontSize: 18,
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
    fontSize: 14,
    fontWeight: '600',
  },
});
