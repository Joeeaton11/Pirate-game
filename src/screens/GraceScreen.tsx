import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ADMIRAL_GRACE_PORTRAIT } from '../data/characterSprites';
import { GRACE_NAME, graceStageFor } from '../data/grace';
import { RootStackParamList } from '../navigation/types';
import { useGameStore } from '../store/gameStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Grace'>;

// Same "full source image, crop with an overflow:hidden slot" technique ConversationBox uses for
// Scally's portrait (see its PORTRAIT_WIDTH/PORTRAIT_FULL_HEIGHT/PORTRAIT_CROP_FRACTION) rather than
// react-native Image's own resizeMode="cover", which would crop symmetrically from the image's
// center on whichever axis overflows -- wrong here, since a bust crop needs the TOP of the source
// kept (head/shoulders), not a center-crop that would cut into the face. Native art is 775x1409.
const PORTRAIT_BUST_WIDTH = 90;
const PORTRAIT_BUST_FULL_HEIGHT = Math.round(PORTRAIT_BUST_WIDTH * (1409 / 775));
const PORTRAIT_BUST_CROP_FRACTION = 0.35; // lands just below the epaulettes/collar
const PORTRAIT_BUST_HEIGHT = Math.round(PORTRAIT_BUST_FULL_HEIGHT * PORTRAIT_BUST_CROP_FRACTION);

// A dedicated dialogue-only screen for Admiral Grace's recurring story beats — same shape as
// BlackfinScreen's dialogue-only path, minus the duel branch: per 2.A.3/2.A.4 her escalation is the
// (still-unbuilt) Pardon beat and the Ocracoke finale, not a fight, so nothing here needs to
// support one yet.
export default function GraceScreen({ navigation }: Props) {
  const currentGraceStageId = useGameStore((s) => s.currentGraceStageId);
  const setCurrentGraceStage = useGameStore((s) => s.setCurrentGraceStage);
  const completeGraceStage = useGameStore((s) => s.completeGraceStage);

  const stage = graceStageFor(currentGraceStageId);

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
    completeGraceStage(stage!.id);
    setCurrentGraceStage(null);
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.portraitBust}>
          <Image source={ADMIRAL_GRACE_PORTRAIT} resizeMode="contain" style={styles.portraitBustImg} />
        </View>
        <Text style={styles.name}>{GRACE_NAME}</Text>
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
  portraitBust: {
    width: PORTRAIT_BUST_WIDTH,
    height: PORTRAIT_BUST_HEIGHT,
    overflow: 'hidden',
    borderRadius: 12,
  },
  portraitBustImg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: PORTRAIT_BUST_WIDTH,
    height: PORTRAIT_BUST_FULL_HEIGHT,
  },
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
