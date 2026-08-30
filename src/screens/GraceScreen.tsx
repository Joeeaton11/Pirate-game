import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ConversationBox from '../components/ConversationBox';
import {
  ADMIRAL_GRACE_PORTRAIT,
  ADMIRAL_GRACE_PORTRAIT_ASPECT_RATIO,
  ADMIRAL_GRACE_PORTRAIT_CROP_FRACTION,
} from '../data/characterSprites';
import { GRACE_NAME, graceStageFor } from '../data/grace';
import { RootStackParamList } from '../navigation/types';
import { useGameStore } from '../store/gameStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Grace'>;

// A dedicated dialogue-only screen for Admiral Grace's recurring story beats — same shape as
// BlackfinScreen's dialogue-only path, minus the duel branch: per 2.A.3/2.A.4 her escalation is the
// (still-unbuilt) Pardon beat and the Skull's End finale, not a fight, so nothing here needs to
// support one yet.
//
// 2026-08-29: swapped from a stacked "every line visible at once" card list over to the shared
// ConversationBox — the parchment-and-portrait box built for Scally, previewable from the Debug
// screen but not wired into any real screen until now. Grace is never the player, so this only ever
// shows her own side of the box (side="right", real portrait, no getTalkFrame — she has no mouth-
// shape frames the way Scally's lipsync set does, so the component just holds her rest portrait
// static for the whole line, which is exactly what omitting getTalkFrame is for) — Scally's own
// silent-protagonist lines were never authored as text in GraceStage.dialogue, so there's nothing to
// show on the left. Cut/positioned exactly like Scally's own portrait: same component, same fixed
// PORTRAIT_WIDTH/crop-fraction, no per-character tuning — passing ADMIRAL_GRACE_PORTRAIT through the
// same portraitSource prop Scally's screens use is what "the same crop, same position, mirrored
// side" actually means here, not a second bespoke crop.
export default function GraceScreen({ navigation }: Props) {
  const currentGraceStageId = useGameStore((s) => s.currentGraceStageId);
  const setCurrentGraceStage = useGameStore((s) => s.setCurrentGraceStage);
  const completeGraceStage = useGameStore((s) => s.completeGraceStage);

  const stage = graceStageFor(currentGraceStageId);
  const [lineIndex, setLineIndex] = useState(0);

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

  function handleAdvance() {
    if (lineIndex < stage!.dialogue.length - 1) {
      setLineIndex((i) => i + 1);
      return;
    }
    completeGraceStage(stage!.id);
    setCurrentGraceStage(null);
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{stage.title}</Text>
      </View>

      <ConversationBox
        speakerName={GRACE_NAME}
        text={stage.dialogue[lineIndex]}
        portraitSource={ADMIRAL_GRACE_PORTRAIT}
        portraitAspectRatio={ADMIRAL_GRACE_PORTRAIT_ASPECT_RATIO}
        portraitCropFraction={ADMIRAL_GRACE_PORTRAIT_CROP_FRACTION}
        side="right"
        onAdvance={handleAdvance}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#101825' },
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
  leaveButton: {
    backgroundColor: '#f4e9cd',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  leaveButtonText: { color: '#101825', fontWeight: '800', fontSize: 15 },
});
