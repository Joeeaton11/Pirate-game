// Bottom-anchored, parchment-and-portrait dialogue popup. Built standalone per the user's request
// (see GAME_DESIGN.md) — not wired into any real screen yet, previewable from the Debug screen
// ("Conversation Box Preview") until the layout and lip-sync feel are confirmed.
//
// Layout: a parchment scroll pinned to the bottom of the screen, with the speaker's portrait
// (torso/chest-up) overlapping its top edge at whichever side the speaker is on, and the dialogue
// text lettered onto the parchment next to it. No real parchment texture asset exists in the repo
// yet (the earlier parchment banner upload was only ever used for a font preview, never saved as
// an asset) so this fakes the look with a warm gradient + a double inner border, matching the
// warm-tan/aged-paper tones from that preview — swap `PARCHMENT_COLORS` below for a real texture
// image whenever one is cut.
//
// Lip-sync: there's no voice audio in this game, so this can't be phoneme-accurate lip sync. What
// it does instead is a text-driven lip sync — as the line types itself onto the parchment, on
// every revealed character the caller's `getTalkFrame` picks the portrait frame that matches it
// (see src/data/visemes.ts for Scally's letter -> mouth-shape lookup, built from his real
// "Lip Sync & Talking Animations" reference sheet), so the mouth genuinely tracks the word being
// spoken rather than just flapping generically. Rest pose shows before the line starts and once
// it finishes. Omit `getTalkFrame` and the portrait just stays static the whole time — nothing
// else about the component changes.
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FONT_IM_FELL, FONT_PIRATA_ONE } from '../hooks/useGameFonts';

export interface ConversationBoxProps {
  speakerName: string;
  text: string;
  /** Rest-pose portrait: shown statically whenever getTalkFrame isn't provided, and as the
   * before/after-talking pose whenever it is. Should be the same pose family as whatever
   * getTalkFrame returns (e.g. Scally's closed-mouth LIP_SYNC_FRAMES.consonant_bmp) so resting
   * between lines doesn't pop to a different scale/crop. */
  portraitSource: ImageSourcePropType;
  /** Called with the full line and the index of the character that was just revealed; return the
   * portrait frame that matches it (a mouth-shape lookup, typically). Called on every reveal tick
   * while the line is mid-typewriter; portraitSource shows before typing starts and once it ends. */
  getTalkFrame?: (text: string, revealedIndex: number) => ImageSourcePropType;
  /** Which side of the parchment the portrait sits on. */
  side?: 'left' | 'right';
  /** Called when the player taps after the line has fully revealed — advance/close the box. Bare
   * tap while the line is still revealing instead fast-forwards it to complete. */
  onAdvance?: () => void;
  /** ms per revealed character. */
  typingSpeedMs?: number;
}

const DEFAULT_TYPING_SPEED_MS = 26;

const PORTRAIT_WIDTH = 118;
const PORTRAIT_HEIGHT = 198;
const PORTRAIT_OVERLAP = 54; // how far the portrait's bottom edge sinks into the parchment
const PARCHMENT_HEIGHT = 220;
const SIDE_MARGIN = 18;

const PARCHMENT_COLORS = ['#ecd8a8', '#ddbd7e', '#c8a35e'] as const;

export default function ConversationBox({
  speakerName,
  text,
  portraitSource,
  getTalkFrame,
  side = 'left',
  onAdvance,
  typingSpeedMs = DEFAULT_TYPING_SPEED_MS,
}: ConversationBoxProps) {
  const [revealedCount, setRevealedCount] = useState(0);
  const fullyRevealed = revealedCount >= text.length;

  // New line -> start the reveal over from scratch.
  useEffect(() => {
    setRevealedCount(0);
  }, [text]);

  // Typewriter reveal, one character at a time.
  useEffect(() => {
    if (revealedCount >= text.length) return;
    const id = setTimeout(() => setRevealedCount((c) => c + 1), typingSpeedMs);
    return () => clearTimeout(id);
  }, [revealedCount, text, typingSpeedMs]);

  // Bounce the "tap to continue" indicator once the line has fully revealed.
  const bounce = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!fullyRevealed) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: 1, duration: 420, useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0, duration: 420, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [fullyRevealed, bounce]);

  function handlePress() {
    if (!fullyRevealed) {
      setRevealedCount(text.length);
    } else {
      onAdvance?.();
    }
  }

  // Rest pose before typing starts and once the line finishes; otherwise the frame for whichever
  // character was just revealed, straight from the caller's lookup.
  const portrait =
    getTalkFrame && revealedCount > 0 && !fullyRevealed
      ? getTalkFrame(text, revealedCount - 1)
      : portraitSource;
  const isLeft = side === 'left';
  const textIndent = { [isLeft ? 'marginLeft' : 'marginRight']: PORTRAIT_WIDTH + 14 } as const;

  return (
    <Pressable style={styles.wrapper} onPress={handlePress}>
      <View
        style={[
          styles.portraitSlot,
          isLeft ? { left: SIDE_MARGIN } : { right: SIDE_MARGIN },
        ]}
      >
        <Image source={portrait} style={styles.portraitImg} resizeMode="contain" />
      </View>

      <LinearGradient colors={PARCHMENT_COLORS} style={styles.parchment}>
        <View style={styles.parchmentInnerBorder} pointerEvents="none" />
        <Text
          style={[styles.nameLabel, textIndent, isLeft ? undefined : { textAlign: 'right' }]}
          numberOfLines={1}
        >
          {speakerName}
        </Text>
        <Text style={[styles.dialogueText, textIndent]}>{text.slice(0, revealedCount)}</Text>
        {fullyRevealed && onAdvance && (
          <Animated.Text
            style={[
              styles.advanceIndicator,
              { transform: [{ translateY: bounce.interpolate({ inputRange: [0, 1], outputRange: [0, 6] }) }] },
            ]}
          >
            ▼
          </Animated.Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: PARCHMENT_HEIGHT - PORTRAIT_OVERLAP + PORTRAIT_HEIGHT,
  },
  portraitSlot: {
    position: 'absolute',
    bottom: PARCHMENT_HEIGHT - PORTRAIT_OVERLAP,
    width: PORTRAIT_WIDTH,
    height: PORTRAIT_HEIGHT,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  portraitImg: {
    width: '100%',
    height: '100%',
  },
  parchment: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: PARCHMENT_HEIGHT,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderTopWidth: 3,
    borderColor: '#5a3a1e',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 12,
  },
  parchmentInnerBorder: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: 6,
    bottom: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(90, 58, 30, 0.35)',
    borderRadius: 2,
  },
  nameLabel: {
    fontFamily: FONT_PIRATA_ONE,
    fontSize: 20,
    color: '#3f2410',
    marginBottom: 4,
  },
  dialogueText: {
    fontFamily: FONT_IM_FELL,
    fontSize: 17,
    lineHeight: 22,
    color: '#2c1a0c',
  },
  advanceIndicator: {
    position: 'absolute',
    right: 16,
    bottom: 10,
    fontSize: 16,
    color: '#5a3a1e',
  },
});
