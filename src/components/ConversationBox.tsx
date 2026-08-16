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
// it does instead is a text-driven mouth-flap, the same trick classic visual-novel/Animal
// Crossing-style talking heads use — as the line types itself onto the parchment, the portrait
// cycles through `talkFrames` in step with that reveal (closed/rest on spaces and punctuation
// pauses, cycling open shapes while a word is mid-reveal), and holds the rest frame the instant
// the line pauses or finishes. Pass `talkFrames` (frame 0 = mouth closed/rest, 1..n = open
// variants) once Scally's mouth-movement range is cut; until then this renders a static portrait
// with no animation — nothing else about the component changes when the frames are added.
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FONT_IM_FELL, FONT_PIRATA_ONE } from '../hooks/useGameFonts';

export interface ConversationBoxProps {
  speakerName: string;
  text: string;
  /** Static bust/torso portrait, shown whenever talkFrames isn't provided (or between cycles). */
  portraitSource: ImageSourcePropType;
  /** Optional mouth-movement frame range for the lip-sync flap. Frame 0 is treated as mouth
   * closed/rest; frames 1..n are cycled through while a word is being "spoken". Omit until real
   * art exists — the portrait just stays static, no other behavior changes. */
  talkFrames?: ImageSourcePropType[];
  /** Which side of the parchment the portrait sits on. */
  side?: 'left' | 'right';
  /** Called when the player taps after the line has fully revealed — advance/close the box. Bare
   * tap while the line is still revealing instead fast-forwards it to complete. */
  onAdvance?: () => void;
  /** ms per revealed character. */
  typingSpeedMs?: number;
}

const DEFAULT_TYPING_SPEED_MS = 26;
const MOUTH_CYCLE_MS = 110;

const PORTRAIT_WIDTH = 140;
const PORTRAIT_HEIGHT = 168;
const PORTRAIT_OVERLAP = 46; // how far the portrait's bottom edge sinks into the parchment
const PARCHMENT_HEIGHT = 220;
const SIDE_MARGIN = 18;

const PARCHMENT_COLORS = ['#ecd8a8', '#ddbd7e', '#c8a35e'] as const;

export default function ConversationBox({
  speakerName,
  text,
  portraitSource,
  talkFrames,
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

  // Mouth flap, driven by the reveal rather than audio: "talking" is true while there's more line
  // left to reveal AND the most-recently-revealed character is a real (non-whitespace) glyph, so
  // it pauses naturally on spaces/punctuation instead of flapping through the whole line at once.
  const lastRevealedChar = text[revealedCount - 1] ?? '';
  const isTalking = !fullyRevealed && /\S/.test(lastRevealedChar);
  const [mouthFrame, setMouthFrame] = useState(0);
  useEffect(() => {
    if (!talkFrames || talkFrames.length <= 1 || !isTalking) {
      setMouthFrame(0);
      return;
    }
    const id = setInterval(() => {
      setMouthFrame((f) => (f % (talkFrames.length - 1)) + 1);
    }, MOUTH_CYCLE_MS);
    return () => clearInterval(id);
  }, [isTalking, talkFrames]);

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

  const portrait = talkFrames && talkFrames.length > 0 ? talkFrames[mouthFrame] ?? portraitSource : portraitSource;
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
