import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { OwnedCrewMember } from '../types';
import { createOwnedCrewMember, maxHpFor, xpToNextLevel } from '../utils/battle';
import { START_ISLAND_ID } from '../data/islands';

export interface WildEncounter {
  templateId: string;
  level: number;
  currentHp: number;
}

interface GameState {
  currentIslandId: string;
  gold: number;
  crew: OwnedCrewMember[];
  activeCrewId: string | null;
  hasHydrated: boolean;
  wildEncounter: WildEncounter | null;

  sailTo: (islandId: string) => void;
  setWildEncounter: (encounter: WildEncounter | null) => void;
  damageWildEncounter: (amount: number) => void;
  addCrewMember: (templateId: string, level: number) => void;
  setActiveCrew: (instanceId: string) => void;
  setCrewHp: (instanceId: string, hp: number) => void;
  gainXp: (instanceId: string, amount: number) => void;
  addGold: (amount: number) => void;
  healAllCrew: () => void;
  setHasHydrated: (value: boolean) => void;
}

const STARTER_TEMPLATE_ID = 'deckhand_swordsman';
const starterCrewMember = createOwnedCrewMember(STARTER_TEMPLATE_ID, 3);

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      currentIslandId: START_ISLAND_ID,
      gold: 20,
      crew: [starterCrewMember],
      activeCrewId: starterCrewMember.instanceId,
      hasHydrated: false,
      wildEncounter: null,

      sailTo: (islandId) => set({ currentIslandId: islandId }),

      setWildEncounter: (encounter) => set({ wildEncounter: encounter }),

      damageWildEncounter: (amount) =>
        set((state) => ({
          wildEncounter: state.wildEncounter
            ? { ...state.wildEncounter, currentHp: Math.max(0, state.wildEncounter.currentHp - amount) }
            : null,
        })),

      addCrewMember: (templateId, level) =>
        set((state) => {
          const newMember = createOwnedCrewMember(templateId, level);
          return {
            crew: [...state.crew, newMember],
            activeCrewId: state.activeCrewId ?? newMember.instanceId,
          };
        }),

      setActiveCrew: (instanceId) => set({ activeCrewId: instanceId }),

      setCrewHp: (instanceId, hp) =>
        set((state) => ({
          crew: state.crew.map((member) =>
            member.instanceId === instanceId
              ? { ...member, currentHp: Math.max(0, hp) }
              : member
          ),
        })),

      gainXp: (instanceId, amount) =>
        set((state) => ({
          crew: state.crew.map((member) => {
            if (member.instanceId !== instanceId) return member;
            let level = member.level;
            let xp = member.xp + amount;
            let currentHp = member.currentHp;
            while (xp >= xpToNextLevel(level)) {
              xp -= xpToNextLevel(level);
              const prevMaxHp = maxHpFor({ ...member, level });
              level += 1;
              const newMaxHp = maxHpFor({ ...member, level });
              currentHp = Math.min(newMaxHp, currentHp + (newMaxHp - prevMaxHp));
            }
            return { ...member, level, xp, currentHp };
          }),
        })),

      addGold: (amount) => set((state) => ({ gold: Math.max(0, state.gold + amount) })),

      healAllCrew: () =>
        set((state) => ({
          crew: state.crew.map((member) => ({
            ...member,
            currentHp: maxHpFor(member),
          })),
        })),

      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'pirate-game-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentIslandId: state.currentIslandId,
        gold: state.gold,
        crew: state.crew,
        activeCrewId: state.activeCrewId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export function useActiveCrewMember() {
  const crew = useGameStore((state) => state.crew);
  const activeCrewId = useGameStore((state) => state.activeCrewId);
  return crew.find((member) => member.instanceId === activeCrewId) ?? crew[0] ?? null;
}
