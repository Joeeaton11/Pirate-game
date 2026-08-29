import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ConversationBox from '../components/ConversationBox';
import { BLACKFIN_NAME, BLACKFIN_TEMPLATE, blackfinStageFor } from '../data/blackfin';
import {
  BLACKFIN_PORTRAIT,
  BLACKFIN_PORTRAIT_ASPECT_RATIO,
  BLACKFIN_PORTRAIT_CROP_FRACTION,
} from '../data/characterSprites';
import { RootStackParamList } from '../navigation/types';
import { useGameStore } from '../store/gameStore';
import { maxHpFor } from '../utils/battle';

type Props = NativeStackScreenProps<RootStackParamList, 'Blackfin'>;

// A dedicated dialogue screen for Captain Blackfin's recurring story beats — modeled on
// PirateLordScreen's header/dialogue-card shape. Dialogue-only stages (Act I) get a single
// "Continue" that marks the stage complete on dismissal. Fightable stages (Act II onward) get a
// "Duel"/"Not Today" pair instead — completion for those happens on victory in EncounterScreen, not
// on dismissal, so the marker stays put if you walk away without fighting.
//
// 2026-08-29: same swap as GraceScreen — stacked "every line visible" cards replaced with the real
// ConversationBox now that Blackfin has portrait art. The one difference from Grace's version: her
// screen only ever shows dialogue then exits, but this one shows dialogue THEN either a Duel/Not
// Today choice or a Continue button, so tap-through has to end by revealing the action row instead
// of immediately backing out — `dialogueDone` is that boundary.
export default function BlackfinScreen({ navigation }: Props) {
  const currentBlackfinStageId = useGameStore((s) => s.currentBlackfinStageId);
  const setCurrentBlackfinStage = useGameStore((s) => s.setCurrentBlackfinStage);
  const completeBlackfinStage = useGameStore((s) => s.completeBlackfinStage);
  const completedBlackfinStageIds = useGameStore((s) => s.completedBlackfinStageIds);
  const setWildEncounter = useGameStore((s) => s.setWildEncounter);

  const stage = blackfinStageFor(currentBlackfinStageId);
  const [lineIndex, setLineIndex] = useState(0);
  const [dialogueDone, setDialogueDone] = useState(false);

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
  const lines = isWon && stage.victoryLine ? [stage.victoryLine] : stage.dialogue;

  function handleAdvance() {
    if (lineIndex < lines.length - 1) {
      setLineIndex((i) => i + 1);
      return;
    }
    setDialogueDone(true);
  }

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
        <Text style={styles.title}>{stage.title}</Text>
      </View>

      {!dialogueDone ? (
        <ConversationBox
          speakerName={BLACKFIN_NAME}
          text={lines[lineIndex]}
          portraitSource={BLACKFIN_PORTRAIT}
          portraitAspectRatio={BLACKFIN_PORTRAIT_ASPECT_RATIO}
          portraitCropFraction={BLACKFIN_PORTRAIT_CROP_FRACTION}
          side="right"
          onAdvance={handleAdvance}
        />
      ) : (
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
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1a1420' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  header: { alignItems: 'center', paddingTop: 24, paddingBottom: 12 },
  title: { color: '#8ec7e8', fontSize: 14, fontStyle: 'italic', marginTop: 2 },
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
