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
// finds whichever word contains the most-recently-revealed character and gives it an amber
// outline glow (see styles.activeWord below for why that's a web-only text-stroke rather than
// RN's textShadow) so it's visually obvious which word the mouth is currently on, independent of
// the mouth animation itself. Clears for the one tick between words (space/punctuation revealing)
// same as the mouth resting on those characters in visemes.ts.
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
const PORTRAIT_OVERLAP = Math.round(PORTRAIT_HEIGHT * 0.55); // how far the portrait sinks into the parchment
const PARCHMENT_HEIGHT = 240;

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
              <Text style={styles.activeWord}>{activeSpan.active}</Text>
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
  // Glow around the letters themselves for the word currently being read, not a block behind
  // them — an amber outline that lights up the letter shapes — rather than a highlighter box, per
  // user feedback that the solid tint read as too bulky.
  //
  // This is NOT React Native's textShadow* — that was the first attempt, and it's the technically
  // "correct" RN API for a glow, but on web (react-native-web, which is what every screenshot in
  // this session has been verified against) it silently fails to paint with our custom carved-bone
  // display font (IM Fell / assets/fonts/IMFellEnglishSC-Regular.ttf): the CSS text-shadow blur
  // pass computes its blur region from the font's glyph ink-overflow box, and this particular
  // hand-built webfont reports wildly wrong metrics for that box, so the blur renders as a faint
  // blob offset well away from the actual letters — invisible in practice. Confirmed by isolating
  // the exact failure down to (custom font) + (text-shadow) specifically: swap in a generic system
  // font and the identical shadow renders fine; keep the custom font and it silently breaks, on
  // both headless and headed Chromium, static or animated, at any radius/color — so it's not a
  // headless quirk or a timing/contrast issue, it's this webfont's metrics.
  // `-webkit-text-stroke` sidesteps it entirely: it strokes the real glyph outline instead of a
  // computed ink-overflow box, so it isn't affected by this font's bad metrics — confirmed working
  // with the same custom font. `paint-order: stroke fill` draws the stroke first so it reads as an
  // outline glow sitting behind the crisp dark letters, not a bulky block. Web-only (RN has no
  // native stroke prop); native platforms keep the standard RN textShadow* trio, which is the
  // documented-correct API there and isn't known to share this particular web/font-metrics bug.
  activeWord: {
    color: '#1c0f04',
    ...(Platform.OS === 'web'
      ? ({
          WebkitTextStroke: '1.5px rgba(255, 140, 0, 0.95)',
          paintOrder: 'stroke fill',
        } as Record<string, string>)
      : {
          textShadowColor: 'rgba(255, 140, 0, 0.95)',
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 6,
        }),
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
