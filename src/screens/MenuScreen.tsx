import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CREW_TEMPLATE_LIST } from '../data/crew';
import { PIRATE_LORDS } from '../data/pirateLords';
import { CAPTAIN_NAME, COMPANION_EMOJI, COMPANION_NAME } from '../data/protagonist';
import { TREASURE_LIST } from '../data/treasures';
import { RootStackParamList } from '../navigation/types';
import { useGameStore } from '../store/gameStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Menu'>;

export default function MenuScreen({ navigation }: Props) {
  const crew = useGameStore((s) => s.crew);
  const recruitedTemplateIds = useGameStore((s) => s.recruitedTemplateIds);
  const defeatedLordIds = useGameStore((s) => s.defeatedLordIds);
  const foundTreasureIds = useGameStore((s) => s.foundTreasureIds);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{CAPTAIN_NAME}'s Log</Text>
        <Text style={styles.subtitle}>
          {COMPANION_EMOJI} {COMPANION_NAME} is minding the ship
        </Text>
      </View>
      <View style={styles.list}>
        <Pressable style={styles.row} onPress={() => navigation.navigate('Crew')}>
          <Text style={styles.rowEmoji}>⛵</Text>
          <View style={styles.rowInfo}>
            <Text style={styles.rowTitle}>Crew Roster</Text>
            <Text style={styles.rowSubtext}>{crew.length} crew signed on</Text>
          </View>
          <Text style={styles.chevron}>▸</Text>
        </Pressable>

        <Pressable style={styles.row} onPress={() => navigation.navigate('CrewLog')}>
          <Text style={styles.rowEmoji}>📖</Text>
          <View style={styles.rowInfo}>
            <Text style={styles.rowTitle}>Crew Log</Text>
            <Text style={styles.rowSubtext}>
              {recruitedTemplateIds.length}/{CREW_TEMPLATE_LIST.length} recruited
            </Text>
          </View>
          <Text style={styles.chevron}>▸</Text>
        </Pressable>

        <Pressable style={styles.row} onPress={() => navigation.navigate('Quests')}>
          <Text style={styles.rowEmoji}>🎖️</Text>
          <View style={styles.rowInfo}>
            <Text style={styles.rowTitle}>Quest Log</Text>
            <Text style={styles.rowSubtext}>
              {defeatedLordIds.length}/{PIRATE_LORDS.length} Pirate Lords defeated
            </Text>
          </View>
          <Text style={styles.chevron}>▸</Text>
        </Pressable>

        <Pressable style={styles.row} onPress={() => navigation.navigate('TreasureCodex')}>
          <Text style={styles.rowEmoji}>💎</Text>
          <View style={styles.rowInfo}>
            <Text style={styles.rowTitle}>Treasure Codex</Text>
            <Text style={styles.rowSubtext}>
              {foundTreasureIds.length}/{TREASURE_LIST.length} found
            </Text>
          </View>
          <Text style={styles.chevron}>▸</Text>
        </Pressable>
      </View>
      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back to Map</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0b3d5c' },
  header: { padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#f4e9cd' },
  subtitle: { fontSize: 13, color: '#cfe3ee', marginTop: 4 },
  list: { paddingHorizontal: 16, gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#124d73',
    borderRadius: 12,
    padding: 16,
  },
  rowEmoji: { fontSize: 30 },
  rowInfo: { flex: 1 },
  rowTitle: { color: '#f4e9cd', fontWeight: '700', fontSize: 16 },
  rowSubtext: { color: '#cfe3ee', fontSize: 12, marginTop: 2 },
  chevron: { color: '#ffd166', fontSize: 20, fontWeight: '700' },
  backButton: {
    margin: 16,
    marginTop: 'auto',
    backgroundColor: '#f4e9cd',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  backButtonText: { color: '#0b3d5c', fontWeight: '800', fontSize: 16 },
});
