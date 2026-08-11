import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BLACKFIN_EMOJI, BLACKFIN_NAME, BLACKFIN_TEMPLATE, blackfinStageFor } from '../data/blackfin';
import { RootStackParamList } from '../navigation/types';
import { useGameStore } from '../store/gameStore';
import { maxHpFor } from '../utils/battle';

type Props = NativeStackScreenProps<RootStackParamList, 'Blackfin'>;

// A dedicated dialogue screen for Captain Blackfin's recurring story beats — modeled on
// PirateLordScreen's header/dialogue-card shape. Dialogue-only stages (Act I) get a single
// "Continue" that marks the stage complete on dismissal. Fightable stages (Act II onward) get a
// "Duel"/"Not Today" pair instead — completion for those happens on victory in EncounterScreen, not
// on dismissal, so the marker stays put if you walk away without fighting.
export default function BlackfinScreen({ navigation }: Props) {
  const currentBlackfinStageId = useGameStore((s) => s.currentBlackfinStageId);
  const setCurrentBlackfinStage = useGameStore((s) => s.setCurrentBlackfinStage);
  const completeBlackfinStage = useGameStore((s) => s.completeBlackfinStage);
  const completedBlackfinStageIds = useGameStore((s) => s.completedBlackfinStageIds);
  const setWildEncounter = useGameStore((s) => s.setWildEncounter);

  const stage = blackfinStageFor(currentBlackfinStageId);

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

  const isWon = completedBlackfinStageIds.includes(stage.id);

  function handleContinue() {
    completeBlackfinStage(stage!.id);
    setCurrentBlackfinStage(null);
    navigation.goBack();
  }

  function handleLeave() {
    setCurrentBlackfinStage(null);
    navigation.goBack();
  }

  function handleDuel() {
    if (!stage!.level) return;
    const maxHp = maxHpFor(
      { instanceId: 'blackfin', templateId: BLACKFIN_TEMPLATE.id, nickname: BLACKFIN_NAME, level: stage!.level, xp: 0, currentHp: 0 },
      BLACKFIN_TEMPLATE
    );
    setWildEncounter({
      templateId: BLACKFIN_TEMPLATE.id,
      level: stage!.level,
      currentHp: maxHp,
      faction: 'rival',
      backdrop: stage!.backdrop ?? 'sea',
      blackfinStageId: stage!.id,
    });
    navigation.navigate('Encounter');
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{BLACKFIN_EMOJI}</Text>
        <Text style={styles.name}>{BLACKFIN_NAME}</Text>
        <Text style={styles.title}>{stage.title}</Text>
      </View>

      <View style={styles.dialogueList}>
        {(isWon && stage.victoryLine ? [stage.victoryLine] : stage.dialogue).map((line, i) => (
          <View key={i} style={styles.dialogueCard}>
            <Text style={styles.dialogue}>"{line}"</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        {stage.fightable && !isWon ? (
          <>
            <Pressable style={styles.continueButton} onPress={handleDuel}>
              <Text style={styles.continueButtonText}>⚔️ Duel Lv.{stage.level} {BLACKFIN_NAME}</Text>
            </Pressable>
            <Pressable style={styles.leaveButton} onPress={handleLeave}>
              <Text style={styles.leaveButtonText}>Not Today</Text>
            </Pressable>
          </>
        ) : (
          <Pressable style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Continue</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1a1420' },
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
  continueButtonText: { color: '#1a1420', fontWeight: '800', fontSize: 15 },
  leaveButton: {
    backgroundColor: '#f4e9cd',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  leaveButtonText: { color: '#1a1420', fontWeight: '800', fontSize: 15 },
});
