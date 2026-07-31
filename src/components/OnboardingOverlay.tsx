import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useGameStore } from '../store/gameStore';

interface Step {
  emoji: string;
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    emoji: '⛵',
    title: 'Drag to Sail',
    body: 'Touch and drag anywhere on the map to sail. Let go to stop. Your ship moves faster at sea than on land.',
  },
  {
    emoji: '🚪',
    title: 'Walk Right In',
    body: "Walk up to a building, fort, or quest marker to enter it — no button needed. Just get close.",
  },
  {
    emoji: '⚠️',
    title: 'Mind Your Heat',
    body: 'Fighting rivals and the Navy raises your Heat meter. Too high, and ambushes turn dangerous — crew lost to them are gone for good. Docking at Tortuga cools you off.',
  },
];

export default function OnboardingOverlay() {
  const hasSeenOnboarding = useGameStore((s) => s.hasSeenOnboarding);
  const completeOnboarding = useGameStore((s) => s.completeOnboarding);
  const [stepIndex, setStepIndex] = useState(0);

  if (hasSeenOnboarding) return null;

  const step = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  function handleNext() {
    if (isLastStep) {
      completeOnboarding();
    } else {
      setStepIndex(stepIndex + 1);
    }
  }

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.skipButton} onPress={completeOnboarding}>
        <Text style={styles.skipButtonText}>Skip</Text>
      </Pressable>

      <View style={styles.card}>
        <Text style={styles.emoji}>{step.emoji}</Text>
        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.body}>{step.body}</Text>

        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View key={i} style={[styles.dot, i === stepIndex && styles.dotActive]} />
          ))}
        </View>

        <Pressable style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>{isLastStep ? "Got it, let's sail!" : 'Next'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(6, 35, 49, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: 24,
  },
  skipButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  skipButtonText: {
    color: '#cfe3ee',
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#0b3d5c',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ffd166',
    padding: 28,
    alignItems: 'center',
    maxWidth: 340,
    width: '100%',
  },
  emoji: { fontSize: 56, marginBottom: 8 },
  title: { color: '#ffd166', fontSize: 20, fontWeight: '800', marginBottom: 10 },
  body: {
    color: '#f4e9cd',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(244, 233, 205, 0.3)',
  },
  dotActive: {
    backgroundColor: '#ffd166',
  },
  nextButton: {
    backgroundColor: '#ffd166',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  nextButtonText: { color: '#0b3d5c', fontWeight: '800', fontSize: 15 },
});
