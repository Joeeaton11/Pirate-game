// Bottom-anchored, parchment-and-portrait dialogue popup. Built standalone per the user's request
// (see GAME_DESIGN.md) — not wired into any real screen yet, previewable from the Debug screen
// ("Conversation Box Preview") until the layout and lip-sync feel are confirmed.
//
// Layout: matches the reference mockup the user sent (GAME_DESIGN.md) — the real torn-parchment
// banner (assets/sprites/ui/ui_dialogue_parchment_1.png) pinned to the bottom of the screen, with
// a big torso-up portrait flush against the screen edge and overlapping deep into the parchment
// (not a small floating card), a real riveted wood-sign name-plate straddling the parchment's top
// edge (assets/sprites/ui/ui_nameplate_board_1.png, lettered with the matching carved-bone bitmap
// font — see src/data/bitmapNameplateFont.ts), and the advance indicator in a small dark tab
// bottom-right, nudged clear of the parchment art's own wax-seal decoration.
//
// Lip-sync: there's no voice audio in this game, so this can't be phoneme-accurate lip sync. What
// it does instead is a text-driven lip sync — as the line types itself onto the parchment, on
// every revealed character the caller's `getTalkFrame` picks the portrait frame that matches it
// (see src/data/visemes.ts for Scally's letter -> mouth-shape lookup, built from his real
// "Lip Sync & Talking Animations" reference sheet), so the mouth genuinely tracks the word being
// spoken rather than just flapping generically. Rest pose shows before the line starts and once
// it finishes. Omit `getTalkFrame` and the portrait just stays static the whole time — nothing
// else about the component changes.
//
// Read-along highlight: the same trick karaoke captions/read-along apps use — `activeWordSpan()`
// finds whichever word contains the most-recently-revealed character and gives it an "ember"
// glow (see EmberWord below) so it's visually obvious which word the mouth is currently on,
// independent of the mouth animation itself. Clears for the one tick between words
// (space/punctuation revealing) same as the mouth resting on those characters in visemes.ts.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  ImageSourcePropType,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { FONT_IM_FELL } from '../hooks/useGameFonts';
import { UI_DIALOGUE_PARCHMENT, UI_ICON_SKULL_CROSSBONES, UI_NAMEPLATE_BOARD } from '../data/uiSprites';
import {
  NAMEPLATE_LETTER_GAP_FRACTION,
  NAMEPLATE_SPACE_FRACTION,
  nameplateChars,
} from '../data/bitmapNameplateFont';

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

/** Which word is currently being "read" — the word containing the most-recently-revealed
 * character — so the dialogue text can highlight it in sync with the mouth, the same way a
 * karaoke caption or a read-along app tracks the active word. Returns null when nothing is
 * revealed yet or the most recent character is whitespace (between words, mouth at rest — no word
 * should be highlighted). `before` is everything revealed up to the active word's start (rendered
 * plain); `active` is the active word's own revealed portion (rendered highlighted) — it grows
 * letter by letter like the rest of the reveal, then stays highlighted until the space after it
 * reveals, at which point this returns null again for that one tick before the next word starts. */
function activeWordSpan(text: string, revealedCount: number): { before: string; active: string } | null {
  if (revealedCount <= 0) return null;
  const wordPattern = /\S+/g;
  let match: RegExpExecArray | null;
  while ((match = wordPattern.exec(text))) {
    const start = match.index;
    const end = start + match[0].length;
    if (start < revealedCount && revealedCount <= end) {
      return { before: text.slice(0, start), active: text.slice(start, revealedCount) };
    }
  }
  return null;
}

// The active word's glow, live on web — "Ember Stroke" (see GAME_DESIGN.md, and the "Ember
// Stroke" artifact this was picked from). Three ingredients per letter, all landed on for the
// same reason: they're built from real glyph outlines/rasterized pixels rather than a computed
// text-shadow blur region, which is the thing that silently breaks on this custom carved-bone
// font (see the long comment on styles.letterInk below for the actual diagnosis):
//   1. Two-tone stroke — a wider dark-rust rim under a thinner amber one, for depth instead of a
//      single flat outline.
//   2. Softened edge — a touch of `filter: blur()` on both stroke layers (never the ink fill on
//      top), so it reads as hand-inked rather than vector-crisp.
//   3. Reveal-synced flash, then idle flicker — each letter's glow snaps bright the instant it's
//      revealed, settles, then breathes gently (like nearby torchlight) for as long as it stays
//      the active word. Driven by RN's Animated API (not CSS @keyframes) so it's the same
//      portable approach as the advance-indicator bounce elsewhere in this file.
// Native (iOS/Android) has no stroke/blur equivalent for Text, so it keeps the simpler
// styles.activeWord textShadow* fallback instead of this component — see ConversationBox's main
// render.
function EmberWord({ text }: { text: string }) {
  // One Animated.Value per letter position, reused across re-renders of the same word instance
  // (this component remounts — see the `key={activeSpan.before}` where it's used — every time the
  // active word changes, so a fresh set of letters always starts fresh). `startedCount` tracks how
  // many letters already have their animation kicked off, so a letter's sequence only starts once
  // even though this effect re-runs on every new letter reveal.
  const animsRef = useRef<Animated.Value[]>([]);
  const startedCountRef = useRef(0);

  useEffect(() => {
    while (animsRef.current.length < text.length) {
      animsRef.current.push(new Animated.Value(0));
    }
    for (let i = startedCountRef.current; i < text.length; i++) {
      const v = animsRef.current[i];
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 90, useNativeDriver: false }),
        Animated.timing(v, { toValue: 0.55, duration: 260, useNativeDriver: false }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(v, { toValue: 0.3, duration: 760, useNativeDriver: false }),
            Animated.timing(v, { toValue: 0.55, duration: 940, useNativeDriver: false }),
          ])
        ),
      ]).start();
    }
    startedCountRef.current = text.length;
  }, [text.length]);

  return (
    <>
      {text.split('').map((ch, i) => {
        const v = animsRef.current[i];
        const glowOpacity = v
          ? v.interpolate({
              inputRange: [0, 0.3, 0.55, 1],
              outputRange: [0, 0.55, 0.85, 1],
              extrapolate: 'clamp',
            })
          : 0;
        return (
          <Text key={i} style={styles.letterWrap}>
            <Text style={styles.letterStrokeOuter}>{ch}</Text>
            <Animated.Text style={[styles.letterStrokeInner, { opacity: glowOpacity }]}>{ch}</Animated.Text>
            <Text style={styles.letterInk}>{ch}</Text>
          </Text>
        );
      })}
    </>
  );
}

// Portrait sized and cropped to match the reference mockup: flush to the screen edge (no side
// margin), overlapping deep into the parchment, and cropped off partway down rather than showing
// the full standing figure (boots and all) — the mockup's shot is a tight torso close-up, cut off
// by the frame, not a small complete mini-figure floating above the paper. Achieved by rendering
// the portrait at its real full-body height (so head/torso stay correctly proportioned, not
// squashed) inside a shorter, `overflow: 'hidden'` slot that clips the legs off. Aspect ratio read
// off the real lip-sync frames (129x251 native); crop fraction tuned up from an initial 0.66 (cut
// right at the belt) to 0.85 per user feedback ("move the cut off lower so can see more of him") —
// now shows the coat's full flare and upper legs, cutting just above the boot tops. That crop slot
// sits flush with the parchment's own bottom edge (see portraitSlot below) so the leg cutoff lands
// right at the bottom of the paper rather than floating above it, per later feedback.
const PORTRAIT_WIDTH = 175;
const PORTRAIT_FULL_HEIGHT = Math.round(PORTRAIT_WIDTH * (251 / 129));
const PORTRAIT_CROP_FRACTION = 0.85;
const PORTRAIT_HEIGHT = Math.round(PORTRAIT_FULL_HEIGHT * PORTRAIT_CROP_FRACTION);
const PARCHMENT_HEIGHT = 240;
// A few extra px of sink below the parchment's own bottom edge — a flat 0 (matching parchment
// exactly) still read as not-quite-touching, per user feedback.
const PORTRAIT_BOTTOM_NUDGE = 10;
// Lifts the whole box (parchment, portrait, name-plate together — they're all positioned relative
// to `wrapper`, not the screen) clear of the very bottom edge, per user feedback (raised again from
// an initial 20 — "move the box and him higher again").
const WRAPPER_BOTTOM_OFFSET = 40;

// Name-plate: sized to its own content (icon + bitmap-font name) rather than a fixed width, since
// speaker names vary in length and the real board art has to stretch to fit whatever comes out —
// same "no ImageBackground, explicit width/height" fix as the parchment (see parchmentImg below).
const NAMEPLATE_HEIGHT = 40;
const NAMEPLATE_H_PADDING = 16; // inside the board's own rounded/riveted ends
const NAMEPLATE_ICON_SIZE = 24;
const NAMEPLATE_ICON_GAP = 8; // between the skull icon and the first letter
const NAMEPLATE_GLYPH_HEIGHT = 22;
const NAMEPLATE_STRADDLE = 16; // how far the plate's bottom edge sinks below the parchment's top edge

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

  // Name-plate content width: icon + each glyph at its own aspect ratio (a fixed monospace cell
  // would look wrong — "I" and "M" aren't the same width) + a small gap between letters, a wider
  // gap for spaces, all wrapped in the board art's own end padding. Scaled down to fit whatever
  // width is actually left beside the (now much wider) portrait on a narrow phone screen — at full
  // size a longer name (e.g. "Captain Scally") ran off the right edge entirely.
  const { width: windowWidth } = useWindowDimensions();
  const chars = useMemo(() => nameplateChars(speakerName), [speakerName]);
  const fixedWidth = NAMEPLATE_H_PADDING * 2 + NAMEPLATE_ICON_SIZE + NAMEPLATE_ICON_GAP;
  const naturalGlyphsWidth = chars.reduce(
    (sum, c) =>
      sum +
      (c === 'space'
        ? NAMEPLATE_GLYPH_HEIGHT * NAMEPLATE_SPACE_FRACTION
        : NAMEPLATE_GLYPH_HEIGHT * c.aspect + NAMEPLATE_GLYPH_HEIGHT * NAMEPLATE_LETTER_GAP_FRACTION),
    0
  );
  const availableWidth = windowWidth - (PORTRAIT_WIDTH + 18) - 12;
  const scale = Math.min(1, Math.max(0.5, (availableWidth - fixedWidth) / naturalGlyphsWidth));
  const glyphHeight = NAMEPLATE_GLYPH_HEIGHT * scale;
  const letterGap = glyphHeight * NAMEPLATE_LETTER_GAP_FRACTION;
  const spaceWidth = glyphHeight * NAMEPLATE_SPACE_FRACTION;
  const glyphsWidth = naturalGlyphsWidth * scale;
  const plateWidth = fixedWidth + glyphsWidth;

  const activeSpan = useMemo(() => activeWordSpan(text, revealedCount), [text, revealedCount]);

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
        <Text style={[styles.dialogueText, textIndent]}>
          {activeSpan ? (
            <>
              {activeSpan.before}
              {Platform.OS === 'web' ? (
                // Remounts (fresh letter animations) every time the active word changes, since
                // `before` — everything up to this word's start — is a new string each time.
                <EmberWord key={activeSpan.before} text={activeSpan.active} />
              ) : (
                <Text style={styles.activeWord}>{activeSpan.active}</Text>
              )}
            </>
          ) : (
            text.slice(0, revealedCount)
          )}
        </Text>
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

      <View
        style={[styles.nameplate, { [sideProp]: PORTRAIT_WIDTH + 18, width: plateWidth } as const]}
      >
        <Image source={UI_NAMEPLATE_BOARD} style={styles.nameplateBoardImg} resizeMode="stretch" />
        <Image
          source={UI_ICON_SKULL_CROSSBONES}
          style={{
            width: NAMEPLATE_ICON_SIZE * scale,
            height: NAMEPLATE_ICON_SIZE * scale,
            marginRight: NAMEPLATE_ICON_GAP,
          }}
          resizeMode="contain"
        />
        {chars.map((c, i) =>
          c === 'space' ? (
            <View key={i} style={{ width: spaceWidth }} />
          ) : (
            <Image
              key={i}
              source={c.source}
              style={{
                height: glyphHeight,
                width: glyphHeight * c.aspect,
                marginRight: letterGap,
              }}
              resizeMode="contain"
            />
          )
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: WRAPPER_BOTTOM_OFFSET,
    // Portrait and parchment now share the same bottom (0) — see portraitSlot below — so the
    // taller of the two (the portrait) is what sets the wrapper's overall height.
    height: Math.max(PARCHMENT_HEIGHT, PORTRAIT_HEIGHT),
  },
  portraitSlot: {
    position: 'absolute',
    // A few px past the parchment's own bottom edge (not a flat 0 — that still read as
    // not-quite-touching), so the leg crop visibly meets the paper rather than floating above it.
    bottom: -PORTRAIT_BOTTOM_NUDGE,
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
  // Native (iOS/Android) fallback for the active word — EmberWord (see above) is web-only since
  // RN Text has no stroke/blur equivalent there. Plain RN textShadow* trio, the
  // documented-correct RN API for a glow; not known to share the web/custom-font text-shadow bug
  // documented on EmberWord's letterInk style below (that bug is specifically about how Chromium
  // computes a *blur* region from this font's glyph metrics — iOS/Android don't go through that
  // code path at all).
  activeWord: {
    color: '#1c0f04',
    textShadowColor: 'rgba(255, 140, 0, 0.95)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  // EmberWord's three stacked layers per letter (outer dark stroke, inner amber stroke, ink fill
  // on top) — see EmberWord's own comment for why stroke+blur instead of text-shadow.
  letterWrap: {
    position: 'relative',
  },
  letterStrokeOuter: {
    position: 'absolute',
    left: 0,
    top: 0,
    color: 'transparent',
    ...(Platform.OS === 'web'
      ? ({ WebkitTextStroke: '1.3px #5a2a06', filter: 'blur(0.6px)' } as Record<string, string>)
      : {}),
  },
  letterStrokeInner: {
    position: 'absolute',
    left: 0,
    top: 0,
    color: 'transparent',
    ...(Platform.OS === 'web'
      ? ({ WebkitTextStroke: '0.6px rgba(255, 170, 50, 0.98)', filter: 'blur(0.3px)' } as Record<
          string,
          string
        >)
      : {}),
  },
  // The dark stroke's own comment has the full diagnosis: text-shadow's blur region is computed
  // from this font's (IM Fell / assets/fonts/IMFellEnglishSC-Regular.ttf) glyph metrics, which are
  // bad enough that the blur renders off to the side of the actual letters — invisible in
  // practice, confirmed by isolating the exact (custom font) + (text-shadow) combination outside
  // the app. `-webkit-text-stroke` and `filter: blur()` both sidestep it — they work from the real
  // glyph outline / rasterized pixels instead of a computed metrics box, confirmed working with
  // this same font.
  letterInk: {
    position: 'relative',
    color: '#1c0f04',
  },
  nameplate: {
    position: 'absolute',
    bottom: PARCHMENT_HEIGHT - NAMEPLATE_STRADDLE,
    height: NAMEPLATE_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: NAMEPLATE_H_PADDING,
    zIndex: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 9,
  },
  nameplateBoardImg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
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
