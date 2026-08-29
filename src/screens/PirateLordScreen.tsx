import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ConversationBox, { CONVERSATION_BOX_RESERVED_HEIGHT } from '../components/ConversationBox';
import { LORD_PORTRAITS } from '../data/characterSprites';
import { isLordUnlocked, PIRATE_LORDS } from '../data/pirateLords';
import { RootStackParamList } from '../navigation/types';
import { useGameStore } from '../store/gameStore';
import { maxHpFor } from '../utils/battle';

type Props = NativeStackScreenProps<RootStackParamList, 'PirateLord'>;

export default function PirateLordScreen({ navigation }: Props) {
  const currentPirateLordId = useGameStore((s) => s.currentPirateLordId);
  const defeatedLordIds = useGameStore((s) => s.defeatedLordIds);
  const completedQuestIds = useGameStore((s) => s.completedQuestIds);
  const setCurrentPirateLord = useGameStore((s) => s.setCurrentPirateLord);
  const setWildEncounter = useGameStore((s) => s.setWildEncounter);

  const lord = PIRATE_LORDS.find((l) => l.id === currentPirateLordId);

  if (!lord) {
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

  const isDefeated = defeatedLordIds.includes(lord.id);
  const isUnlocked = isLordUnlocked(lord, defeatedLordIds, completedQuestIds);
  // Partial coverage — see characterSprites.ts's doc comment on LORD_PORTRAITS. Lords without real
  // art yet keep the original emoji-header layout entirely; only a lord with a portrait gets the
  // ConversationBox treatment, same "partial map, two render paths" shape MapScreen already uses
  // for landmarks/buildings with a spriteId.
  const portrait = (LORD_PORTRAITS as Record<string, ImageSourcePropType>)[lord.id];
  const line = isDefeated ? lord.defeatDialogue : isUnlocked ? lord.introDialogue : lord.lockedDialogue;

  function handleChallenge() {
    if (!lord) return;
    const maxHp = maxHpFor(
      {
        instanceId: 'lord',
        templateId: lord.id,
        nickname: lord.name,
        level: lord.level,
        xp: 0,
        currentHp: 0,
      },
      lord.template
    );
    setWildEncounter({
      templateId: lord.id,
      level: lord.level,
      currentHp: maxHp,
      faction: 'lord',
      backdrop: 'fort',
    });
    navigation.navigate('Encounter');
  }

  function handleLeave() {
    setCurrentPirateLord(null);
    navigation.goBack();
  }

  const actions = (
    <View style={[styles.actions, portrait ? { paddingBottom: CONVERSATION_BOX_RESERVED_HEIGHT } : null]}>
      {!isDefeated && isUnlocked && (
        <Pressable style={styles.challengeButton} onPress={handleChallenge}>
          <Text style={styles.challengeButtonText}>Challenge Lv.{lord.level} {lord.name}</Text>
        </Pressable>
      )}
      <Pressable style={styles.leaveButton} onPress={handleLeave}>
        <Text style={styles.leaveButtonText}>Leave</Text>
      </Pressable>
    </View>
  );

  if (portrait) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.lordTitle}>{lord.title}</Text>
        </View>

        {isDefeated && (
          <View style={styles.badgeBanner}>
            <Text style={styles.badgeBannerText}>🎖️ {lord.badgeName} earned</Text>
          </View>
        )}

        {actions}

        <ConversationBox speakerName={lord.name} text={line} portraitSource={portrait} side="right" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.lordEmoji}>{lord.emoji}</Text>
        <Text style={styles.lordName}>{lord.name}</Text>
        <Text style={styles.lordTitle}>{lord.title}</Text>
      </View>

      <View style={styles.dialogueCard}>
        <Text style={styles.dialogue}>"{line}"</Text>
      </View>

      {isDefeated && (
        <View style={styles.badgeBanner}>
          <Text style={styles.badgeBannerText}>🎖️ {lord.badgeName} earned</Text>
        </View>
      )}

      {actions}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#241a2e' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  header: { alignItems: 'center', paddingTop: 24, paddingBottom: 12 },
  lordEmoji: { fontSize: 56 },
  lordName: { color: '#f4e9cd', fontSize: 22, fontWeight: '800', marginTop: 8 },
  lordTitle: { color: '#ffd166', fontSize: 14, fontStyle: 'italic', marginTop: 2 },
  dialogueCard: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
  },
  dialogue: {
    color: '#f4e9cd',
    fontStyle: 'italic',
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
  },
  badgeBanner: {
    backgroundColor: 'rgba(255, 209, 102, 0.15)',
    borderWidth: 1,
    borderColor: '#ffd166',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  badgeBannerText: { color: '#ffd166', fontWeight: '800', fontSize: 15 },
  actions: { flex: 1, justifyContent: 'flex-end', padding: 20, gap: 10 },
  challengeButton: {
    backgroundColor: '#7a1f1f',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  challengeButtonText: { color: '#f4e9cd', fontWeight: '800', fontSize: 15 },
  leaveButton: {
    backgroundColor: '#f4e9cd',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  leaveButtonText: { color: '#241a2e', fontWeight: '800', fontSize: 15 },
});
