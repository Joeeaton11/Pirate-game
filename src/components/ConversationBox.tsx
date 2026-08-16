// Bottom-anchored, parchment-and-portrait dialogue popup. Built standalone per the user's request
// (see GAME_DESIGN.md) — not wired into any real screen yet, previewable from the Debug screen
// ("Conversation Box Preview") until the layout and lip-sync feel are confirmed.
//
// Layout: matches the reference mockup the user sent (GAME_DESIGN.md) — the real torn-parchment
// banner (assets/sprites/ui/ui_dialogue_parchment_1.png) pinned to the bottom of the screen, with
// a big torso-up portrait flush against the screen edge and overlapping deep into the parchment
// (not a small floating card), a wood-sign name-plate straddling the parchment's top edge, and the
// advance indicator in a small dark tab bottom-right, nudged clear of the parchment art's own
// wax-seal decoration. The name-plate is coded (LinearGradient + the cut skull-and-crossbones
// icon), not real signage art — no reference was provided for it, so this is a placeholder in the
// same spirit as earlier placeholders in this file; swap for real art if/when it arrives.
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
import { UI_DIALOGUE_PARCHMENT, UI_ICON_SKULL_CROSSBONES } from '../data/uiSprites';

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
   * tap while the line is still revealing instead fast-forwards it to complete. Text may contain
   * blank-line paragraph breaks ("\n\n") — they render as a gap, same page, same tap-to-advance. */
  onAdvance?: () => void;
  /** ms per revealed character. */
  typingSpeedMs?: number;
}

const DEFAULT_TYPING_SPEED_MS = 26;

// Portrait sized and overlapped to match the reference mockup: flush to the screen edge (no side
// margin), overlapping deep into the parchment, and cropped off partway down rather than showing
// the full standing figure (boots and all) — the mockup's shot is a tight torso close-up, cut off
// by the frame, not a small complete mini-figure floating above the paper. Achieved by rendering
// the portrait at its real full-body height (so head/torso stay correctly proportioned, not
// squashed) inside a shorter, `overflow: 'hidden'` slot that clips the legs off. Aspect ratio read
// off the real lip-sync frames (129x251 native); crop fraction tuned up from an initial 0.66 (cut
// right at the belt) to 0.85 per user feedback ("move the cut off lower so can see more of him") —
// now shows the coat's full flare and upper legs, cutting just above the boot tops.
const PORTRAIT_WIDTH = 175;
const PORTRAIT_FULL_HEIGHT = Math.round(PORTRAIT_WIDTH * (251 / 129));
const PORTRAIT_CROP_FRACTION = 0.85;
const PORTRAIT_HEIGHT = Math.round(PORTRAIT_FULL_HEIGHT * PORTRAIT_CROP_FRACTION);
const PORTRAIT_OVERLAP = Math.round(PORTRAIT_HEIGHT * 0.45); // how far the portrait sinks into the parchment
const PARCHMENT_HEIGHT = 240;

const NAMEPLATE_HEIGHT = 34;
const NAMEPLATE_STRADDLE = 14; // how far the plate's bottom edge sinks below the parchment's top edge

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
  const sideProp = isLeft ? 'left' : 'right';
  const textIndent = { [isLeft ? 'marginLeft' : 'marginRight']: PORTRAIT_WIDTH + 18 } as const;

  return (
    <Pressable style={styles.wrapper} onPress={handlePress}>
      <View style={[styles.portraitSlot, { [sideProp]: 0 } as const]}>
        {/* overflow:'hidden' on the same view as the shadow clips the shadow too on iOS/Android —
            the crop and the shadow live on separate nested views so both work. */}
        <View style={styles.portraitCrop}>
          <Image source={portrait} style={styles.portraitImg} resizeMode="contain" />
        </View>
      </View>

      <View style={styles.parchment}>
        {/* Plain absolutely-filled Image rather than ImageBackground: RN Web's ImageBackground
            sized itself to the source PNG's natural pixel width (1485px) instead of stretching to
            fill this box, silently pushing the wax-seal decoration off past the right edge of the
            screen on any device narrower than that. An explicit percentage width/height sidesteps
            it (inset-only positioning hit the same bug). */}
        <Image source={UI_DIALOGUE_PARCHMENT} style={styles.parchmentImg} resizeMode="stretch" />
        <Text style={[styles.dialogueText, textIndent]}>{text.slice(0, revealedCount)}</Text>
        {fullyRevealed && onAdvance && (
          <View style={styles.advanceTab}>
            <Animated.Text
              style={[
                styles.advanceIndicator,
                { transform: [{ translateY: bounce.interpolate({ inputRange: [0, 1], outputRange: [0, 5] }) }] },
              ]}
            >
              ▼
            </Animated.Text>
          </View>
        )}
      </View>

      <LinearGradient
        colors={['#8a5a30', '#5c3417']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.nameplate, { [sideProp]: PORTRAIT_WIDTH + 18 } as const]}
      >
        <Image source={UI_ICON_SKULL_CROSSBONES} style={styles.nameplateIcon} resizeMode="contain" />
        <Text style={styles.nameplateText} numberOfLines={1}>
          {speakerName}
        </Text>
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
    height: PORTRAIT_HEIGHT, // the cropped (waist-up) height
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  portraitCrop: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  portraitImg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: PORTRAIT_FULL_HEIGHT, // full body at correct proportions; portraitCrop clips the legs
  },
  parchment: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: PARCHMENT_HEIGHT,
    paddingHorizontal: 26,
    paddingTop: 32,
    paddingBottom: 34,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 12,
  },
  parchmentImg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  dialogueText: {
    fontFamily: FONT_IM_FELL,
    fontSize: 17,
    lineHeight: 23,
    color: '#2c1a0c',
  },
  nameplate: {
    position: 'absolute',
    bottom: PARCHMENT_HEIGHT - NAMEPLATE_STRADDLE,
    height: NAMEPLATE_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    borderRadius: NAMEPLATE_HEIGHT / 2,
    borderWidth: 2,
    borderColor: '#2c1a0a',
    zIndex: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 9,
  },
  nameplateIcon: {
    width: 20,
    height: 20,
  },
  nameplateText: {
    fontFamily: FONT_PIRATA_ONE,
    fontSize: 16,
    color: '#f4e4c1',
  },
  advanceTab: {
    position: 'absolute',
    right: 14,
    // Nudged up clear of the parchment art's own wax-seal + ribbon decoration, which sits in this
    // same bottom-right corner (roughly the bottom third of the box) and made the tab hard to
    // read sitting directly on top of it.
    bottom: 82,
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: 'rgba(44, 26, 10, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  advanceIndicator: {
    fontSize: 14,
    color: '#f4e4c1',
  },
});
