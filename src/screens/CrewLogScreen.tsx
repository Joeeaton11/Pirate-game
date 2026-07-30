import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CREW_TEMPLATE_LIST } from '../data/crew';
import { RootStackParamList } from '../navigation/types';
import { useGameStore } from '../store/gameStore';
import { CrewTemplate } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'CrewLog'>;

export default function CrewLogScreen({ navigation }: Props) {
  const seenTemplateIds = useGameStore((s) => s.seenTemplateIds);
  const recruitedTemplateIds = useGameStore((s) => s.recruitedTemplateIds);

  function renderItem({ item: template }: { item: CrewTemplate }) {
    const isRecruited = recruitedTemplateIds.includes(template.id);
    const isSeen = seenTemplateIds.includes(template.id);

    if (!isSeen) {
      return (
        <View style={[styles.card, styles.cardUnseen]}>
          <Text style={styles.emoji}>❓</Text>
          <View style={styles.info}>
            <Text style={styles.name}>???</Text>
            <Text style={styles.subtext}>Not yet encountered</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.card, isRecruited && styles.cardRecruited]}>
        <Text style={styles.emoji}>{template.emoji}</Text>
        <View style={styles.info}>
          <Text style={styles.name}>{template.name}</Text>
          <Text style={styles.subtext}>
            {template.specialty} · {template.rarity}
          </Text>
          {isRecruited ? (
            <>
              <Text style={styles.flavor}>{template.flavor}</Text>
              <Text style={styles.recruitedTag}>✓ Recruited</Text>
            </>
          ) : (
            <Text style={styles.notRecruitedTag}>Not recruited yet</Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Crew Log</Text>
        <Text style={styles.headerText}>
          {recruitedTemplateIds.length}/{CREW_TEMPLATE_LIST.length} recruited
        </Text>
      </View>
      <FlatList
        data={CREW_TEMPLATE_LIST}
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
  cardUnseen: { opacity: 0.6 },
  cardRecruited: { borderColor: '#ffd166' },
  emoji: { fontSize: 36 },
  info: { flex: 1 },
  name: { color: '#f4e9cd', fontWeight: '700', fontSize: 16 },
  subtext: { color: '#cfe3ee', fontSize: 12, marginTop: 2 },
  flavor: { color: '#cfe3ee', fontSize: 11, fontStyle: 'italic', marginTop: 4 },
  recruitedTag: { color: '#4caf50', fontSize: 12, fontWeight: '800', marginTop: 4 },
  notRecruitedTag: { color: '#ffb300', fontSize: 12, fontWeight: '700', marginTop: 4 },
  backButton: {
    margin: 16,
    backgroundColor: '#f4e9cd',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  backButtonText: { color: '#0b3d5c', fontWeight: '800', fontSize: 16 },
});
