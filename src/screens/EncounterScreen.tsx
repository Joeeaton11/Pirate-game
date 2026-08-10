import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, Line, Path, RadialGradient, Stop } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BLACK_PEARL_CAPTAIN_TEMPLATE, BLACK_PEARL_CAPTURED_LOG, BLACK_PEARL_INTRO_DIALOGUE } from '../data/blackPearl';
import { CREW_TEMPLATES } from '../data/crew';
import { ITEM_LIST, ITEMS } from '../data/items';
import { MOVES } from '../data/moves';
import { MERCHANT_CARGO, MERCHANT_TEMPLATES, merchantGoldReward } from '../data/merchants';
import { PIRATE_LORDS, PIRATE_LORD_TEMPLATES } from '../data/pirateLords';
import { RESOURCES } from '../data/resources';
import { BOUNTY_TEMPLATES, SIDE_QUESTS } from '../data/sideQuests';
import { THREAT_TEMPLATES } from '../data/threats';
import { RootStackParamList } from '../navigation/types';
import { EncounterFaction, useActiveCrewMember, useGameStore } from '../store/gameStore';
import { OwnedCrewMember } from '../types';
import {
  applyBadgeBoost,
  calcDamage,
  maxHpFor,
  recruitChance,
  statsAtLevel,
  xpRewardFor,
} from '../utils/battle';
import { BattleBackdrop } from '../utils/battleBackdrop';

type Props = NativeStackScreenProps<RootStackParamList, 'Encounter'>;

type Phase = 'battling' | 'victory' | 'defeat' | 'fled' | 'recruited';

// Battle layout redesign (2026-08-09, item 55): a small badge next to each name so the
// blade/musket/cannon/curse/brawler effectiveness triangle in battle.ts is visible at a
// glance instead of a hidden dice roll.
const SPECIALTY_ICON: Record<string, string> = {
  blade: '⚔️',
  musket: '🔫',
  cannon: '💣',
  brawler: '👊',
  curse: '🔮',
};

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ============================================================================
// Scene backdrop (2026-08-10, item 58): "Ship's Deck at Dusk" — a considered redesign of the
// contextual-backdrop work from item 56. That version leaned on many small scattered emoji for
// scenery, which read as clutter rather than atmosphere. This version paints each backdrop as a
// small number of deliberate layers instead: a gradient sky, one horizon silhouette (drawn in
// SVG, not emoji), a ground/water band, and soft spotlight pools under each fighter. Jail is the
// one interior exception — no horizon, just its existing cell-bars overlay plus a couple of
// torches.
type HorizonKind = 'town' | 'fort' | 'jungle' | 'beach' | 'sea' | 'none';
interface SceneTheme {
  sky: readonly [string, string, ...string[]];
  ground?: readonly [string, string];
  groundHeight?: number; // percent of scene height, where the horizon/ground band starts
  accent: string; // ambient ground-glow tint under "you"
  horizon: HorizonKind;
  celestial?: 'moon' | 'sun';
}
const SCENE_THEME: Record<BattleBackdrop, SceneTheme> = {
  town: {
    sky: ['#4a3b23', '#2b2116', '#1c150e'],
    ground: ['#241c14', '#140f0a'],
    groundHeight: 44,
    accent: 'rgba(255,196,120,0.28)',
    horizon: 'town',
    celestial: 'moon',
  },
  jungle: {
    sky: ['#234a2e', '#122a1a', '#0a1811'],
    ground: ['#13261c', '#081209'],
    groundHeight: 42,
    accent: 'rgba(140,255,170,0.18)',
    horizon: 'jungle',
  },
  beach: {
    sky: ['#3f7186', '#d98f5c', '#e8b878'],
    ground: ['#d9bd7c', '#a98a52'],
    groundHeight: 40,
    accent: 'rgba(255,180,140,0.28)',
    horizon: 'beach',
    celestial: 'sun',
  },
  sea: {
    sky: ['#0c1524', '#16213a', '#33344a', '#6b4a4f', '#3a2430', '#170f14'],
    ground: ['#16202f', '#070c12'],
    groundHeight: 50,
    accent: 'rgba(255,209,102,0.24)',
    horizon: 'sea',
    celestial: 'moon',
  },
  fort: {
    sky: ['#544a3d', '#2c261e', '#1a1610'],
    ground: ['#2c2620', '#141210'],
    groundHeight: 44,
    accent: 'rgba(255,150,120,0.22)',
    horizon: 'fort',
    celestial: 'moon',
  },
  jail: {
    sky: ['#241c14', '#140f0a'],
    accent: 'rgba(255,120,60,0.3)',
    horizon: 'none',
  },
};

const HORIZON_PATHS: Record<Exclude<HorizonKind, 'none' | 'sea'>, string> = {
  town:
    'M0,34 L0,20 L18,20 L18,10 L34,10 L34,20 L52,20 L52,4 L58,0 L64,4 L64,20 L86,20 L86,14 L98,14 L98,20 L120,20 L120,2 L128,2 L128,0 L136,2 L136,20 L162,20 L162,12 L178,12 L178,20 L200,20 L200,6 L212,6 L212,20 L236,20 L236,16 L250,16 L250,20 L270,20 L270,3 L280,3 L280,0 L290,3 L290,20 L312,20 L312,14 L326,14 L326,20 L348,20 L348,8 L360,8 L360,20 L380,20 L380,34 Z',
  fort:
    'M0,34 L0,22 L14,22 L14,14 L28,14 L28,22 L42,22 L42,14 L56,14 L56,22 L70,22 L70,14 L84,14 L84,22 L98,22 L98,14 L112,14 L112,22 L126,22 L126,14 L140,14 L140,22 L154,22 L154,14 L168,14 L168,22 L182,22 L182,14 L182,4 L186,4 L186,0 L190,4 L190,14 L196,14 L196,22 L210,22 L210,14 L224,14 L224,22 L238,22 L238,14 L252,14 L252,22 L266,22 L266,14 L280,14 L280,22 L294,22 L294,14 L308,14 L308,22 L322,22 L322,14 L336,14 L336,22 L350,22 L350,14 L364,14 L364,22 L380,22 L380,34 Z',
  jungle:
    'M0,34 L0,18 Q10,6 20,16 Q30,2 42,14 Q54,4 66,16 Q78,6 90,14 Q102,0 116,12 Q128,4 140,16 Q152,6 164,14 Q176,2 190,14 Q202,6 214,16 Q226,4 238,14 Q250,8 262,16 Q274,2 288,12 Q300,6 312,16 Q324,4 336,14 Q348,8 360,16 Q370,10 380,16 L380,34 Z',
  beach:
    'M0,34 L0,26 Q40,14 90,22 Q140,10 190,20 Q240,8 290,18 Q330,10 380,20 L380,34 Z',
};

let sceneShapeSeq = 0;

/** Warm/cool glowing disc for a sky's moon or sun, drawn with an SVG radial gradient instead of
 * RN's unsupported box-shadow-blur. Each instance needs its own gradient id — SVG ids share one
 * namespace with the whole (web) DOM. */
function Celestial({ kind }: { kind: 'moon' | 'sun' }) {
  const id = useRef(`cel-${sceneShapeSeq++}`).current;
  const base = kind === 'moon' ? '#ffe9b8' : '#ffb347';
  return (
    <View style={styles.celestialWrap} pointerEvents="none">
      <Svg width={140} height={140} viewBox="0 0 140 140">
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={base} stopOpacity={0.4} />
            <Stop offset="100%" stopColor={base} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={70} cy={70} r={70} fill={`url(#${id})`} />
        <Circle cx={70} cy={70} r={22} fill={base} />
        {kind === 'moon' && (
          <>
            <Circle cx={64} cy={62} r={3} fill="rgba(200,170,120,0.35)" />
            <Circle cx={79} cy={75} r={2} fill="rgba(200,170,120,0.3)" />
          </>
        )}
      </Svg>
    </View>
  );
}

/** A soft grounded glow under a fighter's feet — an SVG radial-gradient ellipse. */
function Spotlight({ style, color }: { style: object; color: string }) {
  const id = useRef(`spot-${sceneShapeSeq++}`).current;
  return (
    <View style={[styles.spotlightWrap, style]} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 150 60">
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity={0.9} />
            <Stop offset="100%" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Ellipse cx={75} cy={30} rx={75} ry={30} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

function ShipSilhouette({ style }: { style: object }) {
  return (
    <View style={[styles.shipSilhouetteWrap, style]} pointerEvents="none">
      <Svg width={62} height={54} viewBox="0 0 70 60">
        <Line x1={35} y1={4} x2={35} y2={46} stroke="#0b0f18" strokeWidth={2} />
        <Path d="M35 8 L58 20 L35 24 Z" fill="#0b0f18" />
        <Path d="M35 24 L16 34 L35 38 Z" fill="#0b0f18" />
        <Path d="M8 46 Q35 58 62 46 L58 40 L12 40 Z" fill="#0b0f18" />
      </Svg>
    </View>
  );
}

function PalmSilhouette({ style }: { style: object }) {
  return (
    <View style={[styles.palmSilhouetteWrap, style]} pointerEvents="none">
      <Svg width={34} height={40} viewBox="0 0 40 46">
        <Path d="M20 46 Q17 28 21 14" stroke="#3a2a12" strokeWidth={3} fill="none" strokeLinecap="round" />
        <Path d="M21 14 Q6 10 2 20" stroke="#3a2a12" strokeWidth={3} fill="none" strokeLinecap="round" />
        <Path d="M21 14 Q36 8 40 18" stroke="#3a2a12" strokeWidth={3} fill="none" strokeLinecap="round" />
        <Path d="M21 14 Q14 2 6 4" stroke="#3a2a12" strokeWidth={3} fill="none" strokeLinecap="round" />
        <Path d="M21 14 Q28 2 36 2" stroke="#3a2a12" strokeWidth={3} fill="none" strokeLinecap="round" />
      </Svg>
    </View>
  );
}

function SceneBackdrop({ backdrop }: { backdrop: BattleBackdrop }) {
  const theme = SCENE_THEME[backdrop];
  const groundHeight = theme.groundHeight ?? 0;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={theme.sky} style={StyleSheet.absoluteFill} />
      {theme.celestial && <Celestial kind={theme.celestial} />}

      {theme.horizon !== 'none' && theme.horizon !== 'sea' && (
        <View style={[styles.horizonWrap, { bottom: `${groundHeight}%` }]}>
          <Svg width="100%" height={34} viewBox="0 0 380 34" preserveAspectRatio="none">
            <Path d={HORIZON_PATHS[theme.horizon]} fill="#0b0f18" opacity={0.88} />
          </Svg>
        </View>
      )}
      {theme.horizon === 'beach' && (
        <PalmSilhouette style={{ position: 'absolute', bottom: `${groundHeight - 3}%`, left: '8%' }} />
      )}
      {theme.horizon === 'sea' && (
        <ShipSilhouette style={{ position: 'absolute', bottom: `${groundHeight}%`, left: '8%' }} />
      )}

      {theme.ground && (
        <LinearGradient
          colors={theme.ground}
          style={[styles.groundBand, { height: `${groundHeight}%` }]}
        />
      )}

      <Spotlight style={styles.spotFoe} color="rgba(255,120,100,0.9)" />
      <Spotlight style={styles.spotYou} color={theme.accent} />

      {backdrop === 'jail' && (
        <View style={StyleSheet.absoluteFill}>
          <View style={styles.jailTorchLeft}>
            <Text style={styles.jailTorchEmoji}>🔥</Text>
          </View>
          <View style={styles.jailTorchRight}>
            <Text style={styles.jailTorchEmoji}>🔥</Text>
          </View>
          <View style={styles.jailBarsRow}>
            {Array.from({ length: 7 }).map((_, i) => (
              <View key={i} style={styles.jailBar} />
            ))}
          </View>
        </View>
      )}

      <View style={styles.edgeVignette} pointerEvents="none" />
    </View>
  );
}

type PopupKind = 'damage' | 'heal' | 'miss';
interface Popup {
  id: number;
  text: string;
  kind: PopupKind;
}

/** A "-12"/"MISS"/"+8" that pops up over a combatant and fades away — self-contained, plays once
 * on mount and calls back to remove itself from its owner's popup list when done. */
function DamagePopup({ text, kind, onDone }: { text: string; kind: PopupKind; onDone: () => void }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 850, easing: Easing.out(Easing.quad), useNativeDriver: true }).start(
      onDone
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -38] });
  const opacity = anim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] });
  const color = kind === 'heal' ? '#7ee08a' : kind === 'miss' ? '#d8cbb0' : '#ff5c4d';
  return (
    <Animated.Text
      pointerEvents="none"
      style={[styles.popupText, { color, transform: [{ translateY }], opacity }]}
    >
      {text}
    </Animated.Text>
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function animateTiming(value: Animated.Value, toValue: number, duration: number): Promise<void> {
  return new Promise((resolve) => {
    Animated.timing(value, { toValue, duration, easing: Easing.out(Easing.quad), useNativeDriver: true }).start(() =>
      resolve()
    );
  });
}

const ALL_TEMPLATES = {
  ...CREW_TEMPLATES,
  ...THREAT_TEMPLATES,
  ...PIRATE_LORD_TEMPLATES,
  ...BOUNTY_TEMPLATES,
  ...MERCHANT_TEMPLATES,
  [BLACK_PEARL_CAPTAIN_TEMPLATE.id]: BLACK_PEARL_CAPTAIN_TEMPLATE,
};

function openingLine(faction: EncounterFaction | undefined, questId: string | undefined): string {
  if (faction === 'rival') return 'A rival pirate crew ambushes you!';
  if (faction === 'navy') return "Navy patrol closes in — you're a wanted pirate!";
  if (faction === 'lord') return 'The duel for a Letter of Marque begins!';
  if (faction === 'bounty') {
    const quest = questId ? SIDE_QUESTS.find((q) => q.id === questId) : undefined;
    if (quest?.id === 'quest_pirate_council') return 'The next captain of the Council steps up for their rematch!';
    if (quest?.type === 'escort') return 'Raiders close in on the convoy!';
    return 'You track down your bounty target!';
  }
  if (faction === 'merchant') return 'A merchant vessel comes into view — ripe for plunder!';
  if (faction === 'rescue') return 'You storm the holding cell to break your crewmate loose!';
  if (faction === 'blackpearl') return BLACK_PEARL_INTRO_DIALOGUE;
  return 'A wild pirate blocks your path!';
}

interface FallenSnapshot {
  emoji: string;
  nickname: string;
  level: number;
  maxHp: number;
}

// Battle resolution cards (2026-08-10, item 59): each way a fight can end used to just be another
// line buried in the scrolling log. Now every ending gets a dedicated full-screen card over the
// (dimmed) frozen scene — distinct color per kind of outcome, since "you won" and "you got a new
// crewmate" and "someone is gone for good" are very different feelings and shouldn't look
// identical. This struct is deliberately a flat bag of optional fields rather than a strict
// per-kind union — simpler to build up incrementally alongside the existing appendLog calls
// without touching any of the underlying reward logic.
interface ResolutionInfo {
  kind: 'victory' | 'recruit' | 'rescue' | 'defeat' | 'defeat-lost' | 'fled';
  eyebrow: string;
  title: string;
  subtitle?: string;
  foeEmoji?: string;
  portraitEmoji?: string;
  specialtyIcon?: string;
  specialtyLabel?: string;
  rarityLabel?: string;
  statusLine?: string;
  xp?: number;
  gold?: number;
  lootLabel?: string;
  lootEmoji?: string;
  lootAmount?: number;
  leveledFrom?: number;
  leveledTo?: number;
  promotedToName?: string;
  promotedFromEmoji?: string;
  promotedToEmoji?: string;
  continueLabel?: string;
}

function resolutionPalette(kind: ResolutionInfo['kind']) {
  switch (kind) {
    case 'victory':
      return {
        card: '#251a10',
        border: 'rgba(255,209,102,0.35)',
        eyebrow: '#ffd166',
        title: '#fff3dd',
        button: ['#ffd166', '#e0a83f'] as const,
        buttonText: '#2a1a08',
      };
    case 'recruit':
      return {
        card: '#12262a',
        border: 'rgba(110,220,200,0.35)',
        eyebrow: '#7ce8d4',
        title: '#eafff8',
        button: ['#7ce8d4', '#4fb8a3'] as const,
        buttonText: '#08211d',
      };
    case 'rescue':
      return {
        card: '#221c30',
        border: 'rgba(185,163,255,0.35)',
        eyebrow: '#c7b6ff',
        title: '#f2ecff',
        button: ['#c7b6ff', '#9b82e0'] as const,
        buttonText: '#1c1330',
      };
    case 'defeat-lost':
      return {
        card: '#211011',
        border: 'rgba(224,87,74,0.4)',
        eyebrow: '#e0857a',
        title: '#e8c8c2',
        button: ['#4a3936', '#342725'] as const,
        buttonText: '#e8dcc0',
      };
    case 'defeat':
      return {
        card: '#211615',
        border: 'rgba(224,110,95,0.28)',
        eyebrow: '#e0857a',
        title: '#d8c8c2',
        button: ['#4a3936', '#342725'] as const,
        buttonText: '#e8dcc0',
      };
    case 'fled':
    default:
      return {
        card: '#182228',
        border: 'rgba(150,180,200,0.22)',
        eyebrow: '#9cc4d8',
        title: '#e6f0f4',
        button: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.06)'] as const,
        buttonText: '#e6f0f4',
      };
  }
}

/** The persistent crew-swap strip (2026-08-10, item 59): every onboard crew member as a small
 * ring — gold-glowing ring = who's fighting now, ring color = their health, greyed + ✕ = fainted
 * and unavailable. One tap on a healthy bench member swaps them straight in, no menu. Hidden
 * entirely with only one crew member aboard, since there's nothing to swap to yet. */
function CrewSwapStrip({
  crew,
  shipCrewIds,
  activeInstanceId,
  onSwap,
}: {
  crew: OwnedCrewMember[];
  shipCrewIds: string[];
  activeInstanceId: string;
  onSwap: (instanceId: string) => void;
}) {
  const onboard = shipCrewIds
    .map((id) => crew.find((m) => m.instanceId === id))
    .filter((m): m is OwnedCrewMember => !!m);
  return (
    <View style={styles.crewStripRow}>
      {onboard.map((member) => {
        const template = CREW_TEMPLATES[member.templateId];
        const memberMaxHp = maxHpFor(member);
        const pct = memberMaxHp > 0 ? member.currentHp / memberMaxHp : 0;
        const fainted = member.currentHp <= 0;
        const active = member.instanceId === activeInstanceId;
        const ringColor = fainted
          ? 'rgba(255,255,255,0.14)'
          : pct > 0.5
          ? '#4caf7d'
          : pct > 0.2
          ? '#e0b34c'
          : '#e0574a';
        return (
          <Pressable
            key={member.instanceId}
            disabled={fainted || active}
            onPress={() => onSwap(member.instanceId)}
            style={styles.crewChip}
          >
            <View
              style={[
                styles.crewChipRing,
                { borderColor: ringColor },
                active && styles.crewChipRingActive,
                fainted && styles.crewChipRingFainted,
              ]}
            >
              <Text style={[styles.crewChipEmoji, fainted && styles.crewChipEmojiFainted]}>
                {template.emoji}
              </Text>
            </View>
            <View style={styles.crewChipBadge}>
              <Text style={styles.crewChipBadgeText}>{SPECIALTY_ICON[template.specialty]}</Text>
            </View>
            {fainted && (
              <View style={styles.crewChipLock}>
                <Text style={styles.crewChipLockText}>✕</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

export default function EncounterScreen({ navigation }: Props) {
  const wildEncounter = useGameStore((s) => s.wildEncounter);
  const gold = useGameStore((s) => s.gold);
  const gainXp = useGameStore((s) => s.gainXp);
  const addGold = useGameStore((s) => s.addGold);
  const setCrewHp = useGameStore((s) => s.setCrewHp);
  const addCrewMember = useGameStore((s) => s.addCrewMember);
  const removeCrewMember = useGameStore((s) => s.removeCrewMember);
  const rescueCrewMember = useGameStore((s) => s.rescueCrewMember);
  const capturedCrew = useGameStore((s) => s.capturedCrew);
  const setWildEncounter = useGameStore((s) => s.setWildEncounter);
  const healAllCrew = useGameStore((s) => s.healAllCrew);
  const addHeat = useGameStore((s) => s.addHeat);
  const addResource = useGameStore((s) => s.addResource);
  const setHeat = useGameStore((s) => s.setHeat);
  const inventory = useGameStore((s) => s.inventory);
  const consumeItem = useGameStore((s) => s.consumeItem);
  const defeatedLordIds = useGameStore((s) => s.defeatedLordIds);
  const defeatPirateLord = useGameStore((s) => s.defeatPirateLord);
  const captureBlackPearl = useGameStore((s) => s.captureBlackPearl);
  const completeSideQuest = useGameStore((s) => s.completeSideQuest);
  const advanceQuestWave = useGameStore((s) => s.advanceQuestWave);
  const completeRepeatableQuest = useGameStore((s) => s.completeRepeatableQuest);
  const questWaveProgress = useGameStore((s) => s.questWaveProgress);
  const markSeen = useGameStore((s) => s.markSeen);
  const crew = useGameStore((s) => s.crew);
  const shipCrewIds = useGameStore((s) => s.shipCrewIds);
  const setActiveCrew = useGameStore((s) => s.setActiveCrew);
  const activeCrew = useActiveCrewMember();
  const liveCrewMember = useGameStore((s) =>
    s.crew.find((m) => m.instanceId === activeCrew?.instanceId)
  );

  const [log, setLog] = useState<string[]>(() => [
    openingLine(
      useGameStore.getState().wildEncounter?.faction,
      useGameStore.getState().wildEncounter?.questId
    ),
  ]);
  const [phase, setPhase] = useState<Phase>('battling');
  const [busy, setBusy] = useState(false);
  const [fallenSnapshot, setFallenSnapshot] = useState<FallenSnapshot | null>(null);
  const [fallenInstanceId, setFallenInstanceId] = useState<string | null>(null);
  const [rescueMessage, setRescueMessage] = useState<string | null>(null);
  const [showItemMenu, setShowItemMenu] = useState(false);
  const [nextAttackBoost, setNextAttackBoost] = useState(1);
  const [guaranteedRecruit, setGuaranteedRecruit] = useState(false);
  const [awaitingSwitch, setAwaitingSwitch] = useState(false);
  const [youPopups, setYouPopups] = useState<Popup[]>([]);
  const [foePopups, setFoePopups] = useState<Popup[]>([]);
  const [banner, setBannerText] = useState<string | null>(null);
  const [resolution, setResolution] = useState<ResolutionInfo | null>(null);

  // Battle motion (2026-08-09, item 57): "Build all of these they sound cool" — lunge, hit
  // flash, screen shake, HP tween, floating damage numbers, idle bob, an effectiveness banner,
  // and distinct victory/defeat poses, on top of the layout/backdrop work from items 55-56.
  const youOffsetX = useRef(new Animated.Value(0)).current;
  const foeOffsetX = useRef(new Animated.Value(0)).current;
  const youFlash = useRef(new Animated.Value(0)).current;
  const foeFlash = useRef(new Animated.Value(0)).current;
  const sceneShake = useRef(new Animated.Value(0)).current;
  const youBounce = useRef(new Animated.Value(1)).current;
  const youSlump = useRef(new Animated.Value(0)).current;
  const foeDefeatFade = useRef(new Animated.Value(1)).current;
  const youIdleRaw = useRef(new Animated.Value(0)).current;
  const foeIdleRaw = useRef(new Animated.Value(0)).current;
  const bannerOpacity = useRef(new Animated.Value(0)).current;

  const youIdleY = youIdleRaw.interpolate({ inputRange: [0, 1], outputRange: [0, -5] });
  const foeIdleY = foeIdleRaw.interpolate({ inputRange: [0, 1], outputRange: [0, -4] });
  const youSlumpRotate = youSlump.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '12deg'] });
  const youSlumpOpacity = youSlump.interpolate({ inputRange: [0, 1], outputRange: [1, 0.45] });

  useEffect(() => {
    if (wildEncounter?.faction === 'wild') {
      markSeen(wildEncounter.templateId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wildEncounter?.templateId, wildEncounter?.faction]);

  // Idle bob, always running so the scene has life even between turns.
  useEffect(() => {
    const makeLoop = (value: Animated.Value, duration: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(value, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      );
    const youLoop = makeLoop(youIdleRaw, 1400);
    const foeLoop = makeLoop(foeIdleRaw, 1650);
    youLoop.start();
    foeLoop.start();
    return () => {
      youLoop.stop();
      foeLoop.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Victory flourish for the player, defeat fade for the foe.
  useEffect(() => {
    if (phase === 'victory') {
      Animated.sequence([
        Animated.timing(youBounce, { toValue: 1.25, duration: 180, useNativeDriver: true }),
        Animated.spring(youBounce, { toValue: 1, useNativeDriver: true }),
      ]).start();
      Animated.timing(foeDefeatFade, { toValue: 0.25, duration: 500, useNativeDriver: true }).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Defeat slump for the player when they faint (and reset if they're switched back in).
  useEffect(() => {
    if (fallenSnapshot) {
      Animated.timing(youSlump, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    } else {
      youSlump.setValue(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fallenSnapshot]);

  if (!wildEncounter || !activeCrew || !liveCrewMember) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.logText}>No encounter in progress.</Text>
          <Pressable style={styles.actionButton} onPress={() => navigation.goBack()}>
            <Text style={styles.actionButtonText}>Return to Map</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const encounter = wildEncounter;
  const backdrop: BattleBackdrop = encounter.backdrop ?? 'sea';
  const crewMember = liveCrewMember;
  const isAmbush = encounter.faction !== 'wild';
  const wildTemplate = ALL_TEMPLATES[encounter.templateId];
  const playerTemplate = CREW_TEMPLATES[crewMember.templateId];
  const wildMaxHp = maxHpFor(
    {
      instanceId: 'wild',
      templateId: encounter.templateId,
      nickname: wildTemplate.name,
      level: encounter.level,
      xp: 0,
      currentHp: 0,
    },
    wildTemplate
  );
  const playerMaxHp = maxHpFor(crewMember);
  const wildStats = statsAtLevel(wildTemplate, encounter.level);
  const playerStats = applyBadgeBoost(
    statsAtLevel(playerTemplate, crewMember.level),
    defeatedLordIds.length
  );

  function appendLog(line: string) {
    setLog((prev) => [...prev.slice(-5), line]);
  }

  function endBattle(nextPhase: Phase) {
    setPhase(nextPhase);
  }

  function triggerFlash(value: Animated.Value) {
    value.setValue(0);
    Animated.sequence([
      Animated.timing(value, { toValue: 1, duration: 70, useNativeDriver: true }),
      Animated.timing(value, { toValue: 0, duration: 260, useNativeDriver: true }),
    ]).start();
  }

  function triggerShake() {
    sceneShake.setValue(0);
    Animated.sequence([
      Animated.timing(sceneShake, { toValue: 6, duration: 40, useNativeDriver: true }),
      Animated.timing(sceneShake, { toValue: -6, duration: 40, useNativeDriver: true }),
      Animated.timing(sceneShake, { toValue: 4, duration: 40, useNativeDriver: true }),
      Animated.timing(sceneShake, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]).start();
  }

  function spawnYouPopup(text: string, kind: PopupKind) {
    const id = Date.now() + Math.random();
    setYouPopups((prev) => [...prev, { id, text, kind }]);
  }
  function spawnFoePopup(text: string, kind: PopupKind) {
    const id = Date.now() + Math.random();
    setFoePopups((prev) => [...prev, { id, text, kind }]);
  }

  function showBanner(text: string) {
    setBannerText(text);
    bannerOpacity.setValue(0);
    Animated.sequence([
      Animated.timing(bannerOpacity, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.delay(650),
      Animated.timing(bannerOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => setBannerText(null));
  }

  /** The wild side's turn: lunges, resolves the hit, and (on a lethal blow to the player) runs
   * the same faint/capture handling the game always has. Awaited by every player action that
   * doesn't end the battle outright. */
  async function playEnemyTurn() {
    const moveId = wildTemplate.moveIds[Math.floor(Math.random() * wildTemplate.moveIds.length)];
    const result = calcDamage(moveId, wildStats, playerStats, playerTemplate.specialty);

    await animateTiming(foeOffsetX, -16, 150);
    if (!result.hit) {
      appendLog(`${wildTemplate.name}'s ${MOVES[moveId].name} missed!`);
      spawnYouPopup('MISS', 'miss');
      await animateTiming(foeOffsetX, 0, 150);
      return;
    }

    const newHp = Math.max(0, crewMember.currentHp - result.damage);
    setCrewHp(crewMember.instanceId, newHp);
    triggerFlash(youFlash);
    triggerShake();
    spawnYouPopup(`-${result.damage}`, 'damage');
    if (result.effectivenessLabel) showBanner(result.effectivenessLabel);
    appendLog(
      `${wildTemplate.name} uses ${MOVES[moveId].name} for ${result.damage} damage.` +
        (result.effectivenessLabel ? ` ${result.effectivenessLabel}` : '')
    );
    await animateTiming(foeOffsetX, 0, 150);
    await sleep(150);

    if (newHp <= 0) {
      setFallenSnapshot({
        emoji: playerTemplate.emoji,
        nickname: crewMember.nickname,
        level: crewMember.level,
        maxHp: playerMaxHp,
      });
      setFallenInstanceId(crewMember.instanceId);
      const otherFighterAvailable = crew.some(
        (m) => m.instanceId !== crewMember.instanceId && shipCrewIds.includes(m.instanceId) && m.currentHp > 0
      );

      if (encounter.faction === 'navy' || encounter.faction === 'rival') {
        let lostStatusLine: string | undefined;
        if (encounter.faction === 'navy') {
          const goldLost = Math.round(gold * 0.3);
          appendLog(
            `${crewMember.nickname} is captured and pressed into naval service — gone for good.`
          );
          if (goldLost > 0) {
            appendLog(`The crown seizes ${goldLost} gold from your hold.`);
            addGold(-goldLost);
            lostStatusLine = `💰 The crown seizes ${goldLost} gold from your hold`;
          }
          setHeat(0);
        } else {
          appendLog(
            `${crewMember.nickname} is overwhelmed and taken prisoner by the rival crew — gone for good.`
          );
        }
        const lostInfo: ResolutionInfo = {
          kind: 'defeat-lost',
          eyebrow: '☠️ Crew Lost ☠️',
          title: 'CAPTURED',
          subtitle:
            encounter.faction === 'navy'
              ? `${crewMember.nickname} is captured and pressed into naval service — gone for good.`
              : `${crewMember.nickname} is overwhelmed and taken prisoner by the rival crew — gone for good.`,
          portraitEmoji: playerTemplate.emoji,
          statusLine: lostStatusLine,
        };
        const rescued = removeCrewMember(
          crewMember.instanceId,
          encounter.faction === 'navy' ? 'navy' : 'rival'
        );
        if (rescued) {
          setRescueMessage(
            'Your crew is gone. A tavern drunk owes you a favor and signs on as your new cabin hand.'
          );
          setResolution({
            ...lostInfo,
            statusLine: 'A tavern drunk owes you a favor and signs on as your new cabin hand.',
          });
          endBattle('defeat');
          return;
        }
        if (otherFighterAvailable) {
          setAwaitingSwitch(true);
        } else {
          healAllCrew();
          setResolution(lostInfo);
          endBattle('defeat');
        }
        return;
      }

      appendLog(`${crewMember.nickname} has fainted!`);
      if (otherFighterAvailable) {
        setAwaitingSwitch(true);
      } else {
        appendLog('You retreat to Tortuga Cove.');
        healAllCrew();
        setResolution({
          kind: 'defeat',
          eyebrow: '☠️ Crew Defeated ☠️',
          title: 'RETREAT',
          subtitle: `${crewMember.nickname} has fainted. Your crew flees back to Tortuga Cove.`,
          statusLine: '❤️ Crew fully healed on the way back',
          continueLabel: 'Return to Tortuga Cove',
        });
        endBattle('defeat');
      }
    }
  }

  function handleSwitchCrew(instanceId: string) {
    setActiveCrew(instanceId);
    setFallenSnapshot(null);
    setFallenInstanceId(null);
    setAwaitingSwitch(false);
    const next = crew.find((m) => m.instanceId === instanceId);
    if (next) appendLog(`Go, ${next.nickname}!`);
  }

  /** Voluntary mid-battle crew swap (2026-08-10, item 59) — same underlying swap as the
   * forced-on-faint picker above, just player-initiated from the crew strip and costing a turn
   * (the enemy gets to act), mirroring every other battle action. */
  async function handleVoluntarySwitch(instanceId: string) {
    if (busy || phase !== 'battling' || awaitingSwitch || instanceId === crewMember.instanceId) return;
    const target = crew.find((m) => m.instanceId === instanceId);
    if (!target || target.currentHp <= 0) return;
    setBusy(true);
    setShowItemMenu(false);
    setActiveCrew(instanceId);
    appendLog(`Go, ${target.nickname}!`);
    await playEnemyTurn();
    setBusy(false);
  }

  async function handleAttack(moveId: string) {
    if (busy || phase !== 'battling') return;
    setBusy(true);
    setShowItemMenu(false);
    const boost = nextAttackBoost;
    if (boost !== 1) setNextAttackBoost(1);
    const result = calcDamage(moveId, playerStats, wildStats, wildTemplate.specialty);

    await animateTiming(youOffsetX, 16, 150);
    if (!result.hit) {
      appendLog(`${crewMember.nickname}'s ${MOVES[moveId].name} missed!`);
      spawnFoePopup('MISS', 'miss');
      await animateTiming(youOffsetX, 0, 150);
      await playEnemyTurn();
      setBusy(false);
      return;
    }

    const damage = Math.round(result.damage * boost);
    const newWildHp = Math.max(0, encounter.currentHp - damage);
    setWildEncounter({ ...encounter, currentHp: newWildHp });
    triggerFlash(foeFlash);
    triggerShake();
    spawnFoePopup(`-${damage}`, 'damage');
    if (result.effectivenessLabel) showBanner(result.effectivenessLabel);
    appendLog(
      `${crewMember.nickname} uses ${MOVES[moveId].name} for ${damage} damage.` +
        (result.effectivenessLabel ? ` ${result.effectivenessLabel}` : '') +
        (boost > 1 ? ' Empowered by grapeshot!' : '')
    );
    await animateTiming(youOffsetX, 0, 150);
    await sleep(150);

    if (newWildHp <= 0) {
      const reward = xpRewardFor(encounter.templateId, encounter.level, wildTemplate);
      const isLordFight = encounter.faction === 'lord';
      const bountyQuest =
        encounter.faction === 'bounty' && encounter.questId
          ? SIDE_QUESTS.find((q) => q.id === encounter.questId)
          : undefined;
      const levelBefore = crewMember.level;
      const promotedTo = gainXp(crewMember.instanceId, reward);
      const freshMember = useGameStore.getState().crew.find((m) => m.instanceId === crewMember.instanceId);
      const levelAfter = freshMember?.level ?? levelBefore;

      let victoryInfo: ResolutionInfo | null = null;
      let rescueInfo: ResolutionInfo | null = null;

      if (isLordFight) {
        const goldReward = 50 + encounter.level * 5;
        addGold(goldReward);
        const lord = PIRATE_LORDS.find((l) => l.id === encounter.templateId);
        defeatPirateLord(encounter.templateId);
        appendLog(
          `${wildTemplate.name} concedes! +${reward} XP, +${goldReward} gold, and the ${
            lord?.badgeName ?? 'marque'
          } is yours!`
        );
        victoryInfo = {
          kind: 'victory',
          eyebrow: '🏆 Duel Won 🏆',
          title: 'VICTORY!',
          subtitle: `${wildTemplate.name} concedes. The ${lord?.badgeName ?? 'Letter of Marque'} is yours!`,
          foeEmoji: wildTemplate.emoji,
          xp: reward,
          gold: goldReward,
        };
      } else if (encounter.faction === 'blackpearl') {
        const goldReward = 30;
        addGold(goldReward);
        captureBlackPearl();
        appendLog(`${BLACK_PEARL_CAPTURED_LOG} +${reward} XP, +${goldReward} gold.`);
        victoryInfo = {
          kind: 'victory',
          eyebrow: '🚢 Ship Captured 🚢',
          title: 'VICTORY!',
          subtitle: BLACK_PEARL_CAPTURED_LOG,
          foeEmoji: wildTemplate.emoji,
          xp: reward,
          gold: goldReward,
        };
      } else if (bountyQuest?.type === 'escort') {
        const waveIndex = questWaveProgress[bountyQuest.id] ?? 0;
        const isFinalWave = waveIndex + 1 >= bountyQuest.waveTemplateIds.length;
        if (isFinalWave) {
          completeSideQuest(bountyQuest.id, bountyQuest.goldReward);
          appendLog(
            `${wildTemplate.name} is driven off! The convoy makes it through — +${reward} XP, +${bountyQuest.goldReward} gold.`
          );
          victoryInfo = {
            kind: 'victory',
            eyebrow: '⚔️ Convoy Saved ⚔️',
            title: 'VICTORY!',
            subtitle: `${wildTemplate.name} is driven off. The convoy makes it through!`,
            foeEmoji: wildTemplate.emoji,
            xp: reward,
            gold: bountyQuest.goldReward,
          };
        } else {
          advanceQuestWave(bountyQuest.id);
          appendLog(
            `${wildTemplate.name} is driven off! Wave ${waveIndex + 1}/${
              bountyQuest.waveTemplateIds.length
            } survived — brace for the next. +${reward} XP.`
          );
          victoryInfo = {
            kind: 'victory',
            eyebrow: '⚔️ Wave Survived ⚔️',
            title: 'VICTORY!',
            subtitle: `Wave ${waveIndex + 1}/${bountyQuest.waveTemplateIds.length} survived. Brace for the next.`,
            foeEmoji: wildTemplate.emoji,
            xp: reward,
          };
        }
      } else if (bountyQuest?.type === 'heat_bounty') {
        completeRepeatableQuest(bountyQuest.id, bountyQuest.goldReward, bountyQuest.heatReduction);
        appendLog(
          `${wildTemplate.name} is defeated! +${reward} XP, +${bountyQuest.goldReward} gold, heat reduced by ${bountyQuest.heatReduction}.`
        );
        victoryInfo = {
          kind: 'victory',
          eyebrow: '📜 Bounty Claimed 📜',
          title: 'VICTORY!',
          subtitle: `${wildTemplate.name} is defeated. Heat reduced by ${bountyQuest.heatReduction}.`,
          foeEmoji: wildTemplate.emoji,
          xp: reward,
          gold: bountyQuest.goldReward,
        };
      } else if (bountyQuest) {
        completeSideQuest(bountyQuest.id, bountyQuest.goldReward);
        appendLog(
          `${wildTemplate.name} is defeated! +${reward} XP, +${bountyQuest.goldReward} gold. Bounty claimed!`
        );
        victoryInfo = {
          kind: 'victory',
          eyebrow: '📜 Bounty Claimed 📜',
          title: 'VICTORY!',
          subtitle: `${wildTemplate.name} is defeated. Bounty claimed!`,
          foeEmoji: wildTemplate.emoji,
          xp: reward,
          gold: bountyQuest.goldReward,
        };
      } else if (encounter.faction === 'merchant') {
        const cargo = MERCHANT_CARGO[encounter.templateId];
        const goldReward = merchantGoldReward(encounter.level);
        addGold(goldReward);
        if (cargo) {
          const amount =
            cargo.minYield + Math.floor(Math.random() * (cargo.maxYield - cargo.minYield + 1));
          addResource(cargo.resourceId, amount);
          const resourceInfo = RESOURCES[cargo.resourceId];
          appendLog(
            `${wildTemplate.name} is plundered! +${reward} XP, +${goldReward} gold, +${amount} ${resourceInfo.emoji} ${resourceInfo.name}.`
          );
          victoryInfo = {
            kind: 'victory',
            eyebrow: '⚔️ Ship Plundered ⚔️',
            title: 'VICTORY!',
            subtitle: `${wildTemplate.name} is plundered`,
            foeEmoji: wildTemplate.emoji,
            xp: reward,
            gold: goldReward,
            lootLabel: resourceInfo.name,
            lootEmoji: resourceInfo.emoji,
            lootAmount: amount,
          };
        } else {
          appendLog(`${wildTemplate.name} is plundered! +${reward} XP, +${goldReward} gold.`);
          victoryInfo = {
            kind: 'victory',
            eyebrow: '⚔️ Ship Plundered ⚔️',
            title: 'VICTORY!',
            subtitle: `${wildTemplate.name} is plundered`,
            foeEmoji: wildTemplate.emoji,
            xp: reward,
            gold: goldReward,
          };
        }
        addHeat(10);
      } else if (encounter.faction === 'rescue' && encounter.rescueId) {
        const rescuedRecord = capturedCrew.find((c) => c.id === encounter.rescueId);
        rescueCrewMember(encounter.rescueId);
        addHeat(8);
        const rescuedName = rescuedRecord?.nickname ?? 'Your crewmate';
        appendLog(
          `The guard is beaten back! ${rescuedName} is free and rejoins the crew, worse for wear. +${reward} XP.`
        );
        const rescuedTemplate = rescuedRecord ? CREW_TEMPLATES[rescuedRecord.templateId] : undefined;
        rescueInfo = {
          kind: 'rescue',
          eyebrow: '⛓️ Crewmate Rescued ⛓️',
          title: rescuedName,
          subtitle: 'Freed from the cell, worse for wear',
          portraitEmoji: rescuedTemplate?.emoji ?? '🧑',
          statusLine: '🎉 Rejoined your crew!',
        };
      } else {
        const goldReward = 5 + encounter.level * 2;
        addGold(goldReward);
        appendLog(`${wildTemplate.name} is defeated! +${reward} XP, +${goldReward} gold.`);
        addHeat(encounter.faction === 'navy' ? 6 : encounter.faction === 'rival' ? 4 : 2);
        victoryInfo = {
          kind: 'victory',
          eyebrow: '⚔️ Battle Won ⚔️',
          title: 'VICTORY!',
          subtitle: `${wildTemplate.name} has been defeated`,
          foeEmoji: wildTemplate.emoji,
          xp: reward,
          gold: goldReward,
        };
      }
      if (promotedTo) {
        appendLog(`${crewMember.nickname} is promoted to ${CREW_TEMPLATES[promotedTo].name}!`);
        if (victoryInfo) {
          victoryInfo.promotedToName = CREW_TEMPLATES[promotedTo].name;
          victoryInfo.promotedFromEmoji = playerTemplate.emoji;
          victoryInfo.promotedToEmoji = CREW_TEMPLATES[promotedTo].emoji;
        }
      }
      if (victoryInfo && levelAfter > levelBefore) {
        victoryInfo.leveledFrom = levelBefore;
        victoryInfo.leveledTo = levelAfter;
      }
      setResolution(victoryInfo ?? rescueInfo);
      endBattle('victory');
      setBusy(false);
      return;
    }

    await playEnemyTurn();
    setBusy(false);
  }

  async function handleRecruit() {
    if (busy || phase !== 'battling' || isAmbush) return;
    setBusy(true);
    setShowItemMenu(false);
    const forced = guaranteedRecruit;
    if (forced) setGuaranteedRecruit(false);
    const chance = forced ? 1 : recruitChance(encounter.templateId, encounter.currentHp, wildMaxHp);
    const success = Math.random() < chance;
    if (success) {
      const boardedShip = addCrewMember(encounter.templateId, encounter.level);
      appendLog(
        boardedShip
          ? `${wildTemplate.name} joins your crew!`
          : `${wildTemplate.name} joins your crew, but your ship is full — they wait in the Crew Quarters.`
      );
      addHeat(2);
      setResolution({
        kind: 'recruit',
        eyebrow: '🏴‍☠️ New Recruit 🏴‍☠️',
        title: wildTemplate.name,
        portraitEmoji: wildTemplate.emoji,
        specialtyIcon: SPECIALTY_ICON[wildTemplate.specialty],
        specialtyLabel: capitalize(wildTemplate.specialty),
        rarityLabel: capitalize(wildTemplate.rarity),
        statusLine: boardedShip ? '⛵ Boarded your ship!' : "📦 Ship's full — sent to Crew Quarters",
      });
      endBattle('recruited');
      setBusy(false);
      return;
    }
    appendLog(`${wildTemplate.name} resists joining your crew.`);
    await playEnemyTurn();
    setBusy(false);
  }

  async function handleUseItem(itemId: string) {
    if (busy || phase !== 'battling') return;
    const item = ITEMS[itemId];
    if ((inventory[itemId] ?? 0) <= 0) return;
    setBusy(true);
    setShowItemMenu(false);
    consumeItem(itemId);
    if (item.effect === 'heal') {
      const healAmount = Math.round(playerMaxHp * (item.healPercent ?? 0));
      const newHp = Math.min(playerMaxHp, crewMember.currentHp + healAmount);
      const actualHealed = newHp - crewMember.currentHp;
      setCrewHp(crewMember.instanceId, newHp);
      spawnYouPopup(`+${actualHealed}`, 'heal');
      appendLog(`${crewMember.nickname} uses ${item.name} and recovers ${actualHealed} HP.`);
    } else if (item.effect === 'battle_boost') {
      setNextAttackBoost(item.boostMultiplier ?? 1);
      appendLog(`${crewMember.nickname} primes a ${item.name} for the next strike!`);
    } else if (item.effect === 'guaranteed_recruit') {
      setGuaranteedRecruit(true);
      appendLog(`You ready the ${item.name}, certain it'll seal the deal.`);
    }
    await playEnemyTurn();
    setBusy(false);
  }

  async function handleFlee() {
    if (busy || phase !== 'battling') return;
    setBusy(true);
    setShowItemMenu(false);
    const success = Math.random() < 0.7;
    if (success) {
      appendLog('You slip away safely.');
      setResolution({
        kind: 'fled',
        eyebrow: '💨 Escaped 💨',
        title: 'You Fled',
        subtitle: `You slip away safely. ${wildTemplate.name} doesn't give chase.`,
      });
      endBattle('fled');
      setBusy(false);
      return;
    }
    appendLog('Could not escape!');
    await playEnemyTurn();
    setBusy(false);
  }

  const resolved = phase !== 'battling';
  const canFlee = encounter.faction !== 'lord';
  const activeSideQuest =
    encounter.faction === 'bounty' && encounter.questId
      ? SIDE_QUESTS.find((q) => q.id === encounter.questId)
      : undefined;
  const usableItems = ITEM_LIST.filter(
    (item) =>
      item.usableInBattle &&
      (inventory[item.id] ?? 0) > 0 &&
      !(isAmbush && item.effect === 'guaranteed_recruit')
  );
  const displayEmoji = fallenSnapshot ? fallenSnapshot.emoji : playerTemplate.emoji;
  const displayName = fallenSnapshot ? fallenSnapshot.nickname : crewMember.nickname;
  const displayLevel = fallenSnapshot ? fallenSnapshot.level : crewMember.level;
  const displayHp = fallenSnapshot ? 0 : crewMember.currentHp;
  const displayMaxHp = fallenSnapshot ? fallenSnapshot.maxHp : playerMaxHp;
  const recruitPct = isAmbush
    ? 0
    : Math.round(recruitChance(encounter.templateId, encounter.currentHp, wildMaxHp) * 100);
  const palette = resolution ? resolutionPalette(resolution.kind) : null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {isAmbush && (
        <View style={styles.ambushBanner}>
          <Text style={styles.ambushBannerText}>
            {encounter.faction === 'navy'
              ? '⚜️ NAVY AMBUSH'
              : encounter.faction === 'lord'
              ? '🏆 LETTER OF MARQUE DUEL'
              : encounter.faction === 'blackpearl'
              ? '🚢 DUEL FOR THE BLACK PEARL'
              : encounter.faction === 'merchant'
              ? '💰 PLUNDER OPPORTUNITY'
              : encounter.faction === 'bounty'
              ? activeSideQuest?.id === 'quest_pirate_council'
                ? '👑 PIRATE COUNCIL REMATCH'
                : activeSideQuest?.type === 'escort'
                ? '⚔️ CONVOY UNDER ATTACK'
                : '📜 BOUNTY HUNT'
              : encounter.faction === 'rescue'
              ? '🔓 PRISON BREAK'
              : '☠️ RIVAL AMBUSH'}
          </Text>
        </View>
      )}
      <Animated.View style={[styles.scene, { transform: [{ translateX: sceneShake }] }]}>
        <SceneBackdrop backdrop={backdrop} />
        {banner && (
          <Animated.Text
            pointerEvents="none"
            style={[
              styles.effectivenessBanner,
              {
                opacity: bannerOpacity,
                transform: [{ scale: bannerOpacity.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }],
              },
            ]}
          >
            {banner}
          </Animated.Text>
        )}
        <View style={[styles.combatant, styles.combatantFoe]}>
          <View style={[styles.tag, styles.tagFoe]}>
            <Text style={styles.tagText}>🏴‍☠️ Foe</Text>
          </View>
          <View style={styles.portraitOuterFoe}>
            <Animated.View
              style={[
                styles.portraitRing,
                styles.portraitRingFoe,
                {
                  transform: [{ translateX: foeOffsetX }, { translateY: foeIdleY }],
                  opacity: foeDefeatFade,
                },
              ]}
            >
              <Text style={styles.emojiFoe}>{wildTemplate.emoji}</Text>
              <Animated.View pointerEvents="none" style={[styles.flashOverlayRing, { opacity: foeFlash }]} />
            </Animated.View>
            {foePopups.map((p) => (
              <DamagePopup
                key={p.id}
                text={p.text}
                kind={p.kind}
                onDone={() => setFoePopups((prev) => prev.filter((x) => x.id !== p.id))}
              />
            ))}
          </View>
          <View style={[styles.nameRow, styles.nameRowFoe]}>
            <Text style={styles.specBadge}>{SPECIALTY_ICON[wildTemplate.specialty]}</Text>
            <Text style={[styles.name, styles.nameFoe]}>
              {isAmbush ? '' : 'Wild '}
              {wildTemplate.name} Lv.{encounter.level}
            </Text>
          </View>
          <HpBar current={encounter.currentHp} max={wildMaxHp} align="flex-end" />
        </View>
        <View style={[styles.combatant, styles.combatantYou]}>
          <View style={[styles.tag, styles.tagYou]}>
            <Text style={styles.tagText}>🏴 You</Text>
          </View>
          <View style={styles.portraitOuterYou}>
            <Animated.View
              style={[
                styles.portraitRing,
                styles.portraitRingYou,
                {
                  transform: [
                    { translateX: youOffsetX },
                    { translateY: youIdleY },
                    { scale: youBounce },
                    { rotate: youSlumpRotate },
                  ],
                  opacity: youSlumpOpacity,
                },
              ]}
            >
              <Text style={styles.emojiYou}>{displayEmoji}</Text>
              <Animated.View pointerEvents="none" style={[styles.flashOverlayRing, { opacity: youFlash }]} />
            </Animated.View>
            {youPopups.map((p) => (
              <DamagePopup
                key={p.id}
                text={p.text}
                kind={p.kind}
                onDone={() => setYouPopups((prev) => prev.filter((x) => x.id !== p.id))}
              />
            ))}
          </View>
          <View style={styles.nameRow}>
            <Text style={styles.specBadge}>{SPECIALTY_ICON[playerTemplate.specialty]}</Text>
            <Text style={[styles.name, styles.nameYou]}>
              {displayName} Lv.{displayLevel}
            </Text>
          </View>
          <HpBar current={displayHp} max={displayMaxHp} align="flex-start" />
        </View>
      </Animated.View>

      {!resolved && (
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />

          {awaitingSwitch && (
            <View style={styles.sheetInner}>
              <Text style={styles.switchPromptText}>Choose your next fighter:</Text>
              {crew
                .filter(
                  (m) =>
                    m.instanceId !== fallenInstanceId &&
                    shipCrewIds.includes(m.instanceId) &&
                    m.currentHp > 0
                )
                .map((member) => {
                  const template = CREW_TEMPLATES[member.templateId];
                  const memberMaxHp = maxHpFor(member);
                  return (
                    <Pressable
                      key={member.instanceId}
                      style={styles.itemMenuButton}
                      onPress={() => handleSwitchCrew(member.instanceId)}
                    >
                      <Text style={styles.itemMenuButtonText}>
                        {template.emoji} {member.nickname} Lv.{member.level} ({member.currentHp}/
                        {memberMaxHp} HP)
                      </Text>
                    </Pressable>
                  );
                })}
            </View>
          )}

          {!awaitingSwitch && showItemMenu && (
            <View style={styles.sheetInner}>
              {usableItems.map((item) => (
                <Pressable
                  key={item.id}
                  style={styles.itemMenuButton}
                  onPress={() => handleUseItem(item.id)}
                  disabled={busy}
                >
                  <Text style={styles.itemMenuButtonText}>
                    {item.emoji} {item.name} (x{inventory[item.id] ?? 0})
                  </Text>
                </Pressable>
              ))}
              <Pressable style={styles.secondaryButton} onPress={() => setShowItemMenu(false)}>
                <Text style={styles.secondaryButtonText}>Back</Text>
              </Pressable>
            </View>
          )}

          {!awaitingSwitch && !showItemMenu && (
            <View style={styles.sheetInner}>
              <View style={styles.turnRow}>
                <View style={styles.turnPill}>
                  <Text style={styles.turnPillText}>{busy ? '⚔ Clashing…' : '▶ Your Move'}</Text>
                </View>
              </View>

              {shipCrewIds.length >= 2 && (
                <CrewSwapStrip
                  crew={crew}
                  shipCrewIds={shipCrewIds}
                  activeInstanceId={crewMember.instanceId}
                  onSwap={handleVoluntarySwitch}
                />
              )}

              <View style={styles.logCard}>
                <ScrollView contentContainerStyle={{ padding: 2 }}>
                  {log.map((line, i) => (
                    <Text key={i} style={styles.logText}>
                      {line}
                    </Text>
                  ))}
                  {rescueMessage && <Text style={styles.rescueText}>{rescueMessage}</Text>}
                </ScrollView>
              </View>

              <View style={styles.movesRow}>
                {playerTemplate.moveIds.map((moveId) => (
                  <Pressable
                    key={moveId}
                    style={styles.moveButton}
                    onPress={() => handleAttack(moveId)}
                    disabled={busy}
                  >
                    <Text style={styles.moveButtonText}>{MOVES[moveId].name}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.secRow}>
                <Pressable
                  style={styles.secondaryButton}
                  onPress={() => setShowItemMenu(true)}
                  disabled={busy || usableItems.length === 0}
                >
                  <Text style={styles.secondaryButtonText}>Item</Text>
                </Pressable>
                {!isAmbush && (
                  <Pressable style={styles.secondaryButton} onPress={handleRecruit} disabled={busy}>
                    <Text style={styles.secondaryButtonText}>
                      Recruit {guaranteedRecruit ? '(Guaranteed!)' : `(${recruitPct}%)`}
                    </Text>
                  </Pressable>
                )}
                {canFlee && (
                  <Pressable style={styles.secondaryButton} onPress={handleFlee} disabled={busy}>
                    <Text style={styles.secondaryButtonText}>Flee</Text>
                  </Pressable>
                )}
              </View>
            </View>
          )}
        </View>
      )}

      {resolved && (
        <View style={styles.resolutionOverlay}>
          <View
            style={[
              styles.resolutionCard,
              { backgroundColor: palette?.card ?? '#1c1c1c', borderColor: palette?.border ?? 'rgba(255,255,255,0.2)' },
            ]}
          >
            <Text style={[styles.resolutionEyebrow, { color: palette?.eyebrow }]}>
              {resolution?.eyebrow ?? 'Battle Over'}
            </Text>

            {resolution?.kind === 'victory' && resolution.foeEmoji && (
              <View style={styles.resFoePortrait}>
                <Text style={styles.resFoePortraitEmoji}>{resolution.foeEmoji}</Text>
              </View>
            )}

            {(resolution?.kind === 'recruit' || resolution?.kind === 'rescue') && (
              <View
                style={[
                  styles.resPortraitRing,
                  resolution.kind === 'rescue' ? styles.resPortraitRingRescue : styles.resPortraitRingRecruit,
                ]}
              >
                <Text style={styles.resPortraitEmoji}>{resolution.portraitEmoji}</Text>
              </View>
            )}

            {resolution?.kind === 'defeat-lost' && (
              <View style={styles.resLostPortraitWrap}>
                <View style={styles.resLostPortrait}>
                  <Text style={styles.resLostPortraitEmoji}>{resolution.portraitEmoji}</Text>
                </View>
                <Text style={styles.resLostTag}>LOST</Text>
              </View>
            )}

            <Text style={[styles.resolutionTitle, { color: palette?.title }]}>
              {resolution?.title ?? 'Continue'}
            </Text>
            {resolution?.subtitle && <Text style={styles.resolutionSubtitle}>{resolution.subtitle}</Text>}

            {resolution?.kind === 'recruit' && (resolution.specialtyLabel || resolution.rarityLabel) && (
              <View style={styles.resChipRow}>
                {resolution.specialtyLabel && (
                  <View style={styles.resChip}>
                    <Text style={styles.resChipText}>
                      {resolution.specialtyIcon} {resolution.specialtyLabel}
                    </Text>
                  </View>
                )}
                {resolution.rarityLabel && (
                  <View style={styles.resChip}>
                    <Text style={styles.resChipText}>{resolution.rarityLabel}</Text>
                  </View>
                )}
              </View>
            )}

            {resolution?.leveledTo != null && (
              <View style={styles.levelUpPill}>
                <Text style={styles.levelUpPillText}>
                  ▲ Level Up · Lv.{resolution.leveledFrom} → Lv.{resolution.leveledTo}
                </Text>
              </View>
            )}

            {resolution?.promotedToName && (
              <View style={styles.promoBanner}>
                <View style={styles.promoPortrait}>
                  <Text style={styles.promoPortraitEmoji}>{resolution.promotedFromEmoji}</Text>
                </View>
                <Text style={styles.promoArrow}>→</Text>
                <View style={styles.promoPortrait}>
                  <Text style={styles.promoPortraitEmoji}>{resolution.promotedToEmoji}</Text>
                </View>
                <View style={styles.promoText}>
                  <Text style={styles.promoEyebrow}>Promoted!</Text>
                  <Text style={styles.promoName}>{resolution.promotedToName}</Text>
                </View>
              </View>
            )}

            {resolution?.kind === 'victory' && (
              <View style={styles.rewardRows}>
                {typeof resolution.xp === 'number' && (
                  <View style={styles.rewardRow}>
                    <Text style={styles.rewardLabel}>✨ Experience</Text>
                    <Text style={styles.rewardValue}>+{resolution.xp} XP</Text>
                  </View>
                )}
                {typeof resolution.gold === 'number' && (
                  <View style={styles.rewardRow}>
                    <Text style={styles.rewardLabel}>💰 Gold</Text>
                    <Text style={styles.rewardValue}>+{resolution.gold}</Text>
                  </View>
                )}
                {resolution.lootLabel && (
                  <View style={styles.rewardRow}>
                    <Text style={styles.rewardLabel}>
                      {resolution.lootEmoji} {resolution.lootLabel}
                    </Text>
                    <Text style={styles.rewardValue}>+{resolution.lootAmount}</Text>
                  </View>
                )}
              </View>
            )}

            {(resolution?.kind === 'recruit' || resolution?.kind === 'rescue') && resolution.statusLine && (
              <Text
                style={[
                  styles.resStatusLine,
                  resolution.kind === 'rescue' && styles.resStatusLineRescue,
                ]}
              >
                {resolution.statusLine}
              </Text>
            )}

            {(resolution?.kind === 'defeat' || resolution?.kind === 'defeat-lost') && resolution.statusLine && (
              <Text
                style={[
                  styles.defeatStatusLine,
                  resolution.kind === 'defeat-lost' && styles.defeatStatusLineGrim,
                ]}
              >
                {resolution.statusLine}
              </Text>
            )}

            <Pressable
              onPress={() => {
                setWildEncounter(null);
                navigation.goBack();
              }}
            >
              <LinearGradient
                colors={palette?.button ?? (['#3a3a3a', '#2a2a2a'] as const)}
                style={styles.resContinueButton}
              >
                <Text style={[styles.resContinueText, { color: palette?.buttonText }]}>
                  {resolution?.continueLabel ?? 'Continue'}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

function HpBar({
  current,
  max,
  color,
  align = 'flex-start',
}: {
  current: number;
  max: number;
  color?: string;
  align?: 'flex-start' | 'flex-end';
}) {
  const pct = Math.max(0, Math.min(1, current / max));
  const animatedPct = useRef(new Animated.Value(pct)).current;
  useEffect(() => {
    Animated.timing(animatedPct, { toValue: pct, duration: 450, easing: Easing.out(Easing.quad), useNativeDriver: false }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pct]);
  const width = animatedPct.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const fillColor = color ?? (pct > 0.5 ? '#4caf50' : pct > 0.2 ? '#ffb300' : '#e53935');
  return (
    <View style={[styles.hpBarTrack, { alignSelf: align }]}>
      <Animated.View style={[styles.hpBarFill, { width, backgroundColor: fillColor }]} />
      <Text style={styles.hpText}>
        {Math.max(0, current)}/{max}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0b3d5c' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  ambushBanner: {
    backgroundColor: '#7a1f1f',
    paddingVertical: 6,
    alignItems: 'center',
  },
  ambushBannerText: {
    color: '#ffd166',
    fontWeight: '800',
    letterSpacing: 1,
  },
  scene: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 18,
  },

  // ---- scene backdrop shapes ----
  celestialWrap: { position: 'absolute', top: '6%', right: '4%' },
  horizonWrap: { position: 'absolute', left: 0, right: 0, height: 34 },
  shipSilhouetteWrap: { opacity: 0.65 },
  palmSilhouetteWrap: { opacity: 0.6 },
  groundBand: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  spotlightWrap: { position: 'absolute', width: 150, height: 60 },
  spotFoe: { right: '2%', bottom: '46%' },
  spotYou: { left: '-8%', bottom: '15%' },
  edgeVignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 40,
    borderColor: 'rgba(0,0,0,0.18)',
  },
  jailTorchLeft: { position: 'absolute', top: 10, left: 10 },
  jailTorchRight: { position: 'absolute', top: 10, right: 10 },
  jailTorchEmoji: { fontSize: 22, opacity: 0.8 },
  jailBarsRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  jailBar: {
    width: 5,
    backgroundColor: 'rgba(196,192,184,0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 0,
  },

  effectivenessBanner: {
    position: 'absolute',
    top: '42%',
    alignSelf: 'center',
    fontSize: 15,
    fontWeight: '800',
    color: '#ffe08a',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    textAlign: 'center',
    zIndex: 5,
  },

  // ---- combatants ----
  combatant: { gap: 5 },
  combatantFoe: { alignSelf: 'flex-end', alignItems: 'flex-end', width: '68%', marginBottom: 16 },
  combatantYou: { alignSelf: 'flex-start', alignItems: 'flex-start', width: '74%' },
  tag: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
  },
  tagYou: { backgroundColor: 'rgba(255,209,102,0.18)' },
  tagFoe: { backgroundColor: 'rgba(255,138,117,0.18)' },
  tagText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, color: '#f4e9cd' },

  portraitOuterFoe: { width: 76, height: 76, position: 'relative' },
  portraitOuterYou: { width: 98, height: 98, position: 'relative' },
  portraitRing: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  portraitRingFoe: {
    borderWidth: 2.5,
    borderColor: '#ff6b5b',
    shadowColor: '#ff6b5b',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  portraitRingYou: {
    borderWidth: 3,
    borderColor: '#ffd166',
    shadowColor: '#ffd166',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  emojiFoe: { fontSize: 38, textShadowColor: 'rgba(0,0,0,0.35)', textShadowRadius: 6, textShadowOffset: { width: 0, height: 4 } },
  emojiYou: { fontSize: 50, textShadowColor: 'rgba(0,0,0,0.35)', textShadowRadius: 6, textShadowOffset: { width: 0, height: 4 } },
  flashOverlayRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ff3b30',
  },
  popupText: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    fontWeight: '800',
    fontSize: 16,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 3,
    textShadowOffset: { width: 0, height: 1 },
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(10,8,6,0.55)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  nameRowFoe: { flexDirection: 'row-reverse' },
  specBadge: { fontSize: 15 },
  name: { fontWeight: '700', fontSize: 13 },
  nameYou: { color: '#ffd166' },
  nameFoe: { color: '#ff8a75' },

  hpBarTrack: {
    width: 140,
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 7,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  hpBarFill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 7 },
  hpText: { fontSize: 10, color: '#fff', textAlign: 'center', fontWeight: '700' },

  // ---- floating bottom sheet ----
  sheet: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 12,
    backgroundColor: '#171310',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -6 },
    elevation: 12,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  sheetInner: { paddingHorizontal: 14, paddingBottom: 14 },
  turnRow: { alignItems: 'center', marginBottom: 8 },
  turnPill: {
    backgroundColor: 'rgba(58,166,110,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(124,232,171,0.35)',
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 4,
  },
  turnPillText: { fontSize: 10.5, fontWeight: '800', letterSpacing: 1.2, color: '#7ce8ab' },

  logCard: {
    maxHeight: 78,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    marginBottom: 8,
    paddingHorizontal: 10,
  },
  logText: { color: '#f2e8d6', marginVertical: 3, fontSize: 13 },
  rescueText: { color: '#ffd166', fontWeight: '700', marginTop: 6, fontSize: 13 },
  switchPromptText: {
    color: '#ffd166',
    fontWeight: '800',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },

  movesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  moveButton: {
    flexGrow: 1,
    backgroundColor: '#2c7a4b',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: '45%',
  },
  moveButtonText: { color: '#f9f2e0', fontWeight: '800', fontSize: 14.5 },
  secRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  secondaryButton: {
    flexGrow: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: { color: '#e8dcc0', fontWeight: '700', fontSize: 12.5 },
  itemMenuButton: {
    backgroundColor: '#2c5a7a',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  itemMenuButtonText: { color: '#f4e9cd', fontWeight: '700' },

  // ---- crew swap strip ----
  crewStripRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 8 },
  crewChip: { width: 42, position: 'relative' },
  crewChipRing: {
    width: 42,
    height: 42,
    borderRadius: 999,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1c1712',
  },
  crewChipRingActive: {
    borderColor: '#ffd166',
    shadowColor: '#ffd166',
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    transform: [{ scale: 1.1 }],
  },
  crewChipRingFainted: { opacity: 0.4 },
  crewChipEmoji: { fontSize: 19 },
  crewChipEmojiFainted: { opacity: 0.6 },
  crewChipBadge: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    width: 16,
    height: 16,
    borderRadius: 999,
    backgroundColor: '#0d0a08',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crewChipBadgeText: { fontSize: 9 },
  crewChipLock: {
    position: 'absolute',
    top: -3,
    left: -3,
    width: 15,
    height: 15,
    borderRadius: 999,
    backgroundColor: '#2a2320',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crewChipLockText: { fontSize: 8, color: '#c9beac', fontWeight: '800' },

  // ---- resolution overlay ----
  resolutionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(5,4,3,0.86)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  resolutionCard: {
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 20,
    alignItems: 'center',
  },
  resolutionEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 10,
    textAlign: 'center',
  },
  resFoePortrait: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: '#1c1712',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    opacity: 0.7,
  },
  resFoePortraitEmoji: { fontSize: 22 },
  resPortraitRing: {
    width: 84,
    height: 84,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2.5,
  },
  resPortraitRingRecruit: {
    backgroundColor: '#1c3a3c',
    borderColor: '#7ce8d4',
    shadowColor: '#7ce8d4',
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
  resPortraitRingRescue: {
    backgroundColor: '#322850',
    borderColor: '#b9a3ff',
    shadowColor: '#b9a3ff',
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
  resPortraitEmoji: { fontSize: 40 },
  resLostPortraitWrap: { marginBottom: 14, position: 'relative' },
  resLostPortrait: {
    width: 60,
    height: 60,
    borderRadius: 999,
    backgroundColor: '#1c1414',
    borderWidth: 2,
    borderColor: 'rgba(224,110,95,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.65,
  },
  resLostPortraitEmoji: { fontSize: 28 },
  resLostTag: {
    position: 'absolute',
    bottom: -6,
    alignSelf: 'center',
    backgroundColor: '#e0574a',
    color: '#1c0a08',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  resolutionTitle: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 6,
    textAlign: 'center',
  },
  resolutionSubtitle: {
    fontSize: 13,
    color: '#c9beac',
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 19,
  },
  resChipRow: { flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap', justifyContent: 'center' },
  resChip: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  resChipText: { fontSize: 11, fontWeight: '700', color: '#d8f5ec' },

  levelUpPill: {
    backgroundColor: 'rgba(76,175,125,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(124,232,171,0.4)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 14,
  },
  levelUpPillText: { fontSize: 10.5, fontWeight: '800', letterSpacing: 1, color: '#7ce8ab' },

  promoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(74,157,224,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(124,201,255,0.35)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    alignSelf: 'stretch',
  },
  promoPortrait: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: '#10202a',
    borderWidth: 1.5,
    borderColor: 'rgba(124,201,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoPortraitEmoji: { fontSize: 17 },
  promoArrow: { color: '#7cc9ff', fontSize: 16, fontWeight: '900' },
  promoText: { flexShrink: 1 },
  promoEyebrow: { fontSize: 9.5, fontWeight: '800', letterSpacing: 1.2, color: '#7cc9ff', textTransform: 'uppercase' },
  promoName: { fontSize: 12.5, fontWeight: '800', color: '#eaf6ff' },

  rewardRows: { alignSelf: 'stretch', gap: 12, marginBottom: 20 },
  rewardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rewardLabel: { fontSize: 12.5, color: '#d8cbb0', fontWeight: '700' },
  rewardValue: { fontSize: 14, fontWeight: '800', color: '#ffe3a3' },

  resStatusLine: { fontSize: 12.5, fontWeight: '700', color: '#7ce8d4', marginBottom: 18, textAlign: 'center' },
  resStatusLineRescue: { color: '#c7b6ff' },
  defeatStatusLine: { fontSize: 12, fontWeight: '700', color: '#7ce8ab', marginBottom: 20, textAlign: 'center' },
  defeatStatusLineGrim: { color: '#e0857a' },

  resContinueButton: {
    alignSelf: 'stretch',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  resContinueText: { fontWeight: '900', fontSize: 15 },

  actionButton: {
    backgroundColor: '#f4e9cd',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: { color: '#0b3d5c', fontWeight: '800', fontSize: 16 },
});
