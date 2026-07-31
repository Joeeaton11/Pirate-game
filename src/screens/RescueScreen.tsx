import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CREW_TEMPLATES } from '../data/crew';
import { THREAT_TEMPLATES } from '../data/threats';
import { RootStackParamList } from '../navigation/types';
import { CapturedCrewMember, useGameStore } from '../store/gameStore';
import { maxHpFor } from '../utils/battle';

type Props = NativeStackScreenProps<RootStackParamList, 'Rescue'>;

const JAILER_TEMPLATE_ID: Record<'navy' | 'rival', string> = {
  navy: 'navy_marine',
  rival: 'rival_deckhand',
};

export default function RescueScreen({ navigation }: Props) {
  const capturedCrew = useGameStore((s) => s.capturedCrew);
  const setWildEncounter = useGameStore((s) => s.setWildEncounter);

  function handleAttemptRescue(record: CapturedCrewMember) {
    const templateId = JAILER_TEMPLATE_ID[record.capturedBy];
    const level = Math.max(5, record.level);
    const template = THREAT_TEMPLATES[templateId];
    const maxHp = maxHpFor(
      { instanceId: 'rescue', templateId, nickname: template.name, level, xp: 0, currentHp: 0 },
      template
    );
    setWildEncounter({ templateId, level, currentHp: maxHp, faction: 'rescue', rescueId: record.id });
    navigation.navigate('Encounter');
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.npcEmoji}>🔓</Text>
        <Text style={styles.title}>The Locked Ward</Text>
        <Text style={styles.subtitle}>
          "Word travels fast in this port. Anyone we're missing, we can go get 'em back."
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {capturedCrew.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No one's currently locked up. Lucky you.</Text>
          </View>
        )}
        {capturedCrew.map((record) => {
          const template = CREW_TEMPLATES[record.templateId];
          return (
            <View key={record.id} style={styles.card}>
              <Text style={styles.cardEmoji}>{template.emoji}</Text>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>
                  {record.nickname} · Lv.{record.level}
                </Text>
                <Text style={styles.cardSubtext}>
                  {record.capturedBy === 'navy'
                    ? 'Pressed into naval service'
                    : 'Held by a rival crew'}
                </Text>
              </View>
              <Pressable style={styles.rescueButton} onPress={() => handleAttemptRescue(record)}>
                <Text style={styles.rescueButtonText}>Attempt Rescue</Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>

      <Pressable style={styles.leaveButton} onPress={() => navigation.goBack()}>
        <Text style={styles.leaveButtonText}>Leave</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#241a2e' },
  header: { alignItems: 'center', paddingTop: 24, paddingBottom: 12, paddingHorizontal: 20 },
  npcEmoji: { fontSize: 48 },
  title: { color: '#f4e9cd', fontSize: 20, fontWeight: '800', marginTop: 8 },
  subtitle: {
    color: '#cfe3ee',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
  },
  listContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, gap: 10 },
  emptyCard: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: { color: '#cfe3ee', fontSize: 14, fontStyle: 'italic' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 12,
    padding: 14,
  },
  cardEmoji: { fontSize: 32 },
  cardInfo: { flex: 1 },
  cardName: { color: '#f4e9cd', fontWeight: '700', fontSize: 14 },
  cardSubtext: { color: '#cfe3ee', fontSize: 11, marginTop: 2 },
  rescueButton: {
    backgroundColor: '#7a1f1f',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  rescueButtonText: { color: '#f4e9cd', fontWeight: '700', fontSize: 12 },
  leaveButton: {
    margin: 20,
    marginTop: 8,
    backgroundColor: '#f4e9cd',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  leaveButtonText: { color: '#241a2e', fontWeight: '800', fontSize: 15 },
});
