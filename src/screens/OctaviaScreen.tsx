import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OCTAVIA_EMOJI, OCTAVIA_NAME, octaviaStageFor } from '../data/octavia';
import { RootStackParamList } from '../navigation/types';
import { useGameStore } from '../store/gameStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Octavia'>;

// A dedicated dialogue-only screen for Admiral Octavia's recurring story beats — same shape as
// BlackfinScreen's dialogue-only path, minus the duel branch: per 2.A.3/2.A.4 her escalation is the
// (still-unbuilt) Pardon beat and the Ocracoke finale, not a fight, so nothing here needs to
// support one yet.
export default function OctaviaScreen({ navigation }: Props) {
  const currentOctaviaStageId = useGameStore((s) => s.currentOctaviaStageId);
  const setCurrentOctaviaStage = useGameStore((s) => s.setCurrentOctaviaStage);
  const completeOctaviaStage = useGameStore((s) => s.completeOctaviaStage);

  const stage = octaviaStageFor(currentOctaviaStageId);

  if (!stage) {
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

  function handleContinue() {
    completeOctaviaStage(stage!.id);
    setCurrentOctaviaStage(null);
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{OCTAVIA_EMOJI}</Text>
        <Text style={styles.name}>{OCTAVIA_NAME}</Text>
        <Text style={styles.title}>{stage.title}</Text>
      </View>

      <View style={styles.dialogueList}>
        {stage.dialogue.map((line, i) => (
          <View key={i} style={styles.dialogueCard}>
            <Text style={styles.dialogue}>"{line}"</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#101825' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  header: { alignItems: 'center', paddingTop: 24, paddingBottom: 12 },
  emoji: { fontSize: 56 },
  name: { color: '#f4e9cd', fontSize: 22, fontWeight: '800', marginTop: 8 },
  title: { color: '#8ec7e8', fontSize: 14, fontStyle: 'italic', marginTop: 2 },
  dialogueList: { paddingHorizontal: 20, marginTop: 16, gap: 12 },
  dialogueCard: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
    padding: 18,
  },
  dialogue: {
    color: '#f4e9cd',
    fontStyle: 'italic',
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
  },
  actions: { flex: 1, justifyContent: 'flex-end', padding: 20, gap: 10 },
  continueButton: {
    backgroundColor: '#f4e9cd',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  continueButtonText: { color: '#101825', fontWeight: '800', fontSize: 15 },
  leaveButton: {
    backgroundColor: '#f4e9cd',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  leaveButtonText: { color: '#101825', fontWeight: '800', fontSize: 15 },
});
