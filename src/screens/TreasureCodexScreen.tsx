import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { rarityColor, TREASURE_LIST, TreasureItem } from '../data/treasures';
import { RootStackParamList } from '../navigation/types';
import { useGameStore } from '../store/gameStore';

type Props = NativeStackScreenProps<RootStackParamList, 'TreasureCodex'>;

export default function TreasureCodexScreen({ navigation }: Props) {
  const foundTreasureIds = useGameStore((s) => s.foundTreasureIds);

  function renderItem({ item: treasure }: { item: TreasureItem }) {
    const isFound = foundTreasureIds.includes(treasure.id);

    if (!isFound) {
      return (
        <View style={[styles.card, styles.cardUnfound]}>
          <Text style={styles.emoji}>❓</Text>
          <View style={styles.info}>
            <Text style={styles.name}>???</Text>
            <Text style={styles.subtext}>Not yet found</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.card, { borderColor: rarityColor(treasure.rarity) }]}>
        <Text style={styles.emoji}>{treasure.emoji}</Text>
        <View style={styles.info}>
          <Text style={styles.name}>{treasure.name}</Text>
          <Text style={[styles.subtext, { color: rarityColor(treasure.rarity) }]}>
            {treasure.rarity}
          </Text>
          <Text style={styles.flavor}>{treasure.flavor}</Text>
          <Text style={styles.foundHint}>📍 {treasure.foundHint}</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Treasure Codex</Text>
        <Text style={styles.headerText}>
          {foundTreasureIds.length}/{TREASURE_LIST.length} found
        </Text>
      </View>
      <FlatList
        data={TREASURE_LIST}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0b3d5c' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#f4e9cd' },
  headerText: { color: '#f4e9cd', fontSize: 14 },
  listContent: { paddingHorizontal: 12, paddingBottom: 12, gap: 10 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#124d73',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardUnfound: { opacity: 0.6 },
  emoji: { fontSize: 36 },
  info: { flex: 1 },
  name: { color: '#f4e9cd', fontWeight: '700', fontSize: 16 },
  subtext: { color: '#cfe3ee', fontSize: 12, marginTop: 2, fontWeight: '700', textTransform: 'capitalize' },
  flavor: { color: '#cfe3ee', fontSize: 11, fontStyle: 'italic', marginTop: 4 },
  foundHint: { color: '#ffd166', fontSize: 11, marginTop: 4 },
  backButton: {
    margin: 16,
    backgroundColor: '#f4e9cd',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  backButtonText: { color: '#0b3d5c', fontWeight: '800', fontSize: 16 },
});
