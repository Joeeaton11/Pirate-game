import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { OwnedCrewMember } from '../types';
import { createOwnedCrewMember, maxHpFor, xpToNextLevel } from '../utils/battle';

export type EncounterFaction = 'wild' | 'rival' | 'navy';

export interface WildEncounter {
  templateId: string;
  level: number;
  currentHp: number;
  faction: EncounterFaction;
}

interface GameState {
  gold: number;
  crew: OwnedCrewMember[];
  activeCrewId: string | null;
  hasHydrated: boolean;
  wildEncounter: WildEncounter | null;
  heat: number;

  setWildEncounter: (encounter: WildEncounter | null) => void;
  damageWildEncounter: (amount: number) => void;
  addCrewMember: (templateId: string, level: number) => void;
  removeCrewMember: (instanceId: string) => boolean;
  setActiveCrew: (instanceId: string) => void;
  setCrewHp: (instanceId: string, hp: number) => void;
  gainXp: (instanceId: string, amount: number) => void;
  addGold: (amount: number) => void;
  healAllCrew: () => void;
  addHeat: (amount: number) => void;
  setHeat: (value: number) => void;
  setHasHydrated: (value: boolean) => void;
}

const STARTER_TEMPLATE_ID = 'deckhand_swordsman';
const starterCrewMember = createOwnedCrewMember(STARTER_TEMPLATE_ID, 3);

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      gold: 20,
      crew: [starterCrewMember],
      activeCrewId: starterCrewMember.instanceId,
      hasHydrated: false,
      wildEncounter: null,
      heat: 0,

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

      removeCrewMember: (instanceId) => {
        const state = get();
        const remaining = state.crew.filter((m) => m.instanceId !== instanceId);
        if (remaining.length === 0) {
          const rescue = createOwnedCrewMember('cabin_hand', 2);
          set({ crew: [rescue], activeCrewId: rescue.instanceId });
          return true;
        }
        const newActiveId =
          state.activeCrewId === instanceId
            ? remaining.find((m) => m.currentHp > 0)?.instanceId ?? remaining[0].instanceId
            : state.activeCrewId;
        set({ crew: remaining, activeCrewId: newActiveId });
        return false;
      },

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

      addHeat: (amount) =>
        set((state) => ({ heat: Math.min(100, Math.max(0, state.heat + amount)) })),

      setHeat: (value) => set({ heat: Math.min(100, Math.max(0, value)) }),

      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'pirate-game-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        gold: state.gold,
        crew: state.crew,
        activeCrewId: state.activeCrewId,
        heat: state.heat,
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
