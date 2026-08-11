import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { BLACK_PEARL_ISLAND_ID, BLACK_PEARL_START_OFFSET } from '../data/blackPearl';
import { BUILDINGS } from '../data/buildings';
import { CREW_TEMPLATES } from '../data/crew';
import { ISLANDS } from '../data/islands';
import { craftingRecipeFor } from '../data/items';
import { promotionFor } from '../data/promotions';
import { RESOURCE_NODES, RESOURCES, ResourceId } from '../data/resources';
import { SALVAGE_SITES, shipUpgradeFor } from '../data/shipUpgrades';
import { HOARD_TREASURE_ID, TREASURE_FRAGMENT_IDS, TREASURE_SITES } from '../data/treasures';
import { OwnedCrewMember } from '../types';
import { createOwnedCrewMember, maxHpFor, xpToNextLevel } from '../utils/battle';
import { BattleBackdrop } from '../utils/battleBackdrop';

export type EncounterFaction =
  | 'wild'
  | 'rival'
  | 'navy'
  | 'lord'
  | 'bounty'
  | 'merchant'
  | 'rescue'
  | 'blackpearl';

export interface WildEncounter {
  templateId: string;
  level: number;
  currentHp: number;
  faction: EncounterFaction;
  questId?: string;
  rescueId?: string;
  /** Which scene EncounterScreen renders behind the fight. Defaults to 'sea' at the type level so
   * any call site that forgets to set it fails safe rather than crashing. */
  backdrop?: BattleBackdrop;
}

export interface CapturedCrewMember {
  id: string;
  templateId: string;
  nickname: string;
  level: number;
  capturedBy: 'navy' | 'rival';
  capturedAt: number;
}

export const SHIP_CREW_CAP = 6;

/** Auto-assembles the legendary capstone the moment all 7 map fragments are present, so finding
 * the last fragment anywhere (exploration, debug grant, whatever) always triggers it — no separate
 * "assemble" button to remember to press. See GAME_DESIGN.md Main Story Arc 6.D. */
function withHoardCheck(foundTreasureIds: string[]): string[] {
  if (foundTreasureIds.includes(HOARD_TREASURE_ID)) return foundTreasureIds;
  const hasAllFragments = TREASURE_FRAGMENT_IDS.every((id) => foundTreasureIds.includes(id));
  return hasAllFragments ? [...foundTreasureIds, HOARD_TREASURE_ID] : foundTreasureIds;
}

interface GameState {
  gold: number;
  crew: OwnedCrewMember[];
  shipCrewIds: string[];
  activeCrewId: string | null;
  hasHydrated: boolean;
  wildEncounter: WildEncounter | null;
  heat: number;
  currentBuildingId: string | null;
  hiredBuildingIds: string[];
  inventory: Record<string, number>;
  currentPirateLordId: string | null;
  defeatedLordIds: string[];
  seenTemplateIds: string[];
  recruitedTemplateIds: string[];
  currentSideQuestId: string | null;
  acceptedQuestIds: string[];
  completedQuestIds: string[];
  questWaveProgress: Record<string, number>;
  questTurnInCounts: Record<string, number>;
  resources: Record<string, number>;
  resourceNodeCooldowns: Record<string, number>;
  theftCooldowns: Record<string, number>;
  shipUpgrades: string[];
  salvageCooldowns: Record<string, number>;
  hasSeenOnboarding: boolean;
  capturedCrew: CapturedCrewMember[];
  blackPearlCaptured: boolean;
  blackPearlBoarded: boolean;
  blackPearlPosition: { x: number; y: number };
  foundTreasureIds: string[];
  currentBlackfinStageId: string | null;
  completedBlackfinStageIds: string[];

  setWildEncounter: (encounter: WildEncounter | null) => void;
  damageWildEncounter: (amount: number) => void;
  addCrewMember: (templateId: string, level: number) => boolean;
  removeCrewMember: (instanceId: string, capturedBy?: 'navy' | 'rival') => boolean;
  rescueCrewMember: (capturedId: string) => boolean;
  setActiveCrew: (instanceId: string) => void;
  sendToQuarters: (instanceId: string) => void;
  bringAboard: (instanceId: string) => boolean;
  setCrewHp: (instanceId: string, hp: number) => void;
  gainXp: (instanceId: string, amount: number) => string | null;
  addGold: (amount: number) => void;
  healAllCrew: () => void;
  addHeat: (amount: number) => void;
  setHeat: (value: number) => void;
  setCurrentBuilding: (buildingId: string | null) => void;
  hireFromBuilding: (
    buildingId: string,
    templateId: string,
    level: number,
    cost: number
  ) => { success: boolean; boardedShip: boolean };
  buyItem: (itemId: string, price: number) => boolean;
  consumeItem: (itemId: string) => boolean;
  setCurrentPirateLord: (lordId: string | null) => void;
  defeatPirateLord: (lordId: string) => void;
  markSeen: (templateId: string) => void;
  setCurrentSideQuest: (questId: string | null) => void;
  acceptSideQuest: (questId: string) => void;
  completeSideQuest: (questId: string, goldReward: number) => void;
  advanceQuestWave: (questId: string) => void;
  completeRepeatableQuest: (questId: string, goldReward: number, heatReduction: number) => void;
  gatherResource: (nodeId: string) => { success: boolean; resourceId?: ResourceId; amount?: number };
  sellResource: (resourceId: string, amount: number) => boolean;
  addResource: (resourceId: string, amount: number) => void;
  addItem: (itemId: string, amount: number) => void;
  craftItem: (itemId: string) => boolean;
  promoteCrewMember: (instanceId: string) => boolean;
  stealFromShop: (buildingId: string) => {
    success: boolean;
    caught: boolean;
    resourceId?: ResourceId;
    amount?: number;
  };
  buyShipUpgrade: (upgradeId: string) => boolean;
  salvageSite: (siteId: string) => { success: boolean; amount?: number; treasureId?: string };
  findTreasureSite: (siteId: string) => { success: boolean; treasureId?: string };
  buyTreasure: (treasureId: string, price: number) => boolean;
  debugAddTreasure: (treasureId: string) => void;
  setCurrentBlackfinStage: (stageId: string | null) => void;
  completeBlackfinStage: (stageId: string) => void;
  debugClearResourceCooldowns: () => void;
  debugClearTheftCooldowns: () => void;
  debugClearSalvageCooldowns: () => void;
  debugSetCrewLevel: (instanceId: string, level: number) => void;
  debugResetSave: () => void;
  setHasHydrated: (value: boolean) => void;
  completeOnboarding: () => void;
  captureBlackPearl: () => void;
  boardBlackPearl: () => void;
  disembarkBlackPearl: (position: { x: number; y: number }) => void;
}

const STARTER_TEMPLATE_ID = 'deckhand_swordsman';

type InitialState = Pick<
  GameState,
  | 'gold'
  | 'crew'
  | 'shipCrewIds'
  | 'activeCrewId'
  | 'wildEncounter'
  | 'heat'
  | 'currentBuildingId'
  | 'hiredBuildingIds'
  | 'inventory'
  | 'currentPirateLordId'
  | 'defeatedLordIds'
  | 'seenTemplateIds'
  | 'recruitedTemplateIds'
  | 'currentSideQuestId'
  | 'acceptedQuestIds'
  | 'completedQuestIds'
  | 'questWaveProgress'
  | 'questTurnInCounts'
  | 'resources'
  | 'resourceNodeCooldowns'
  | 'theftCooldowns'
  | 'shipUpgrades'
  | 'salvageCooldowns'
  | 'hasSeenOnboarding'
  | 'capturedCrew'
  | 'blackPearlCaptured'
  | 'blackPearlBoarded'
  | 'blackPearlPosition'
  | 'foundTreasureIds'
  | 'currentBlackfinStageId'
  | 'completedBlackfinStageIds'
>;

function createInitialState(): InitialState {
  const starterCrewMember = createOwnedCrewMember(STARTER_TEMPLATE_ID, 3);
  return {
    gold: 20,
    crew: [starterCrewMember],
    shipCrewIds: [starterCrewMember.instanceId],
    activeCrewId: starterCrewMember.instanceId,
    wildEncounter: null,
    heat: 0,
    currentBuildingId: null,
    hiredBuildingIds: [],
    inventory: {},
    currentPirateLordId: null,
    defeatedLordIds: [],
    seenTemplateIds: [STARTER_TEMPLATE_ID],
    recruitedTemplateIds: [STARTER_TEMPLATE_ID],
    currentSideQuestId: null,
    acceptedQuestIds: [],
    completedQuestIds: [],
    questWaveProgress: {},
    questTurnInCounts: {},
    resources: {},
    resourceNodeCooldowns: {},
    theftCooldowns: {},
    shipUpgrades: [],
    salvageCooldowns: {},
    hasSeenOnboarding: false,
    capturedCrew: [],
    blackPearlCaptured: false,
    blackPearlBoarded: false,
    blackPearlPosition: {
      x: ISLANDS[BLACK_PEARL_ISLAND_ID].position.x + BLACK_PEARL_START_OFFSET.x,
      y: ISLANDS[BLACK_PEARL_ISLAND_ID].position.y + BLACK_PEARL_START_OFFSET.y,
    },
    foundTreasureIds: [],
    currentBlackfinStageId: null,
    completedBlackfinStageIds: [],
  };
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...createInitialState(),
      hasHydrated: false,

      setWildEncounter: (encounter) => set({ wildEncounter: encounter }),

      damageWildEncounter: (amount) =>
        set((state) => ({
          wildEncounter: state.wildEncounter
            ? { ...state.wildEncounter, currentHp: Math.max(0, state.wildEncounter.currentHp - amount) }
            : null,
        })),

      addCrewMember: (templateId, level) => {
        const state = get();
        const newMember = createOwnedCrewMember(templateId, level);
        const boardedShip = state.shipCrewIds.length < SHIP_CREW_CAP;
        set({
          crew: [...state.crew, newMember],
          shipCrewIds: boardedShip
            ? [...state.shipCrewIds, newMember.instanceId]
            : state.shipCrewIds,
          activeCrewId: state.activeCrewId ?? newMember.instanceId,
          seenTemplateIds: state.seenTemplateIds.includes(templateId)
            ? state.seenTemplateIds
            : [...state.seenTemplateIds, templateId],
          recruitedTemplateIds: state.recruitedTemplateIds.includes(templateId)
            ? state.recruitedTemplateIds
            : [...state.recruitedTemplateIds, templateId],
        });
        return boardedShip;
      },

      removeCrewMember: (instanceId, capturedBy) => {
        const state = get();
        const captured = state.crew.find((m) => m.instanceId === instanceId);
        const capturedCrew =
          capturedBy && captured
            ? [
                ...state.capturedCrew,
                {
                  id: captured.instanceId,
                  templateId: captured.templateId,
                  nickname: captured.nickname,
                  level: captured.level,
                  capturedBy,
                  capturedAt: Date.now(),
                },
              ]
            : state.capturedCrew;
        const remaining = state.crew.filter((m) => m.instanceId !== instanceId);
        if (remaining.length === 0) {
          const rescue = createOwnedCrewMember('cabin_hand', 2);
          set({
            crew: [rescue],
            shipCrewIds: [rescue.instanceId],
            activeCrewId: rescue.instanceId,
            capturedCrew,
            seenTemplateIds: state.seenTemplateIds.includes('cabin_hand')
              ? state.seenTemplateIds
              : [...state.seenTemplateIds, 'cabin_hand'],
            recruitedTemplateIds: state.recruitedTemplateIds.includes('cabin_hand')
              ? state.recruitedTemplateIds
              : [...state.recruitedTemplateIds, 'cabin_hand'],
          });
          return true;
        }
        let newShipCrewIds = state.shipCrewIds.filter((id) => id !== instanceId);
        if (newShipCrewIds.length === 0) {
          newShipCrewIds = [remaining[0].instanceId];
        }
        const newActiveId =
          state.activeCrewId === instanceId
            ? remaining.find((m) => newShipCrewIds.includes(m.instanceId) && m.currentHp > 0)
                ?.instanceId ?? newShipCrewIds[0]
            : state.activeCrewId;
        set({ crew: remaining, shipCrewIds: newShipCrewIds, activeCrewId: newActiveId, capturedCrew });
        return false;
      },

      rescueCrewMember: (capturedId) => {
        const state = get();
        const record = state.capturedCrew.find((c) => c.id === capturedId);
        if (!record) return false;
        const rescued = createOwnedCrewMember(record.templateId, record.level);
        rescued.currentHp = Math.max(1, Math.round(rescued.currentHp * 0.5));
        const boardedShip = state.shipCrewIds.length < SHIP_CREW_CAP;
        set({
          crew: [...state.crew, rescued],
          shipCrewIds: boardedShip ? [...state.shipCrewIds, rescued.instanceId] : state.shipCrewIds,
          capturedCrew: state.capturedCrew.filter((c) => c.id !== capturedId),
        });
        return true;
      },

      setActiveCrew: (instanceId) => set({ activeCrewId: instanceId }),

      sendToQuarters: (instanceId) => {
        const state = get();
        if (state.shipCrewIds.length <= 1 || !state.shipCrewIds.includes(instanceId)) return;
        const newShipCrewIds = state.shipCrewIds.filter((id) => id !== instanceId);
        const newActiveId =
          state.activeCrewId === instanceId ? newShipCrewIds[0] : state.activeCrewId;
        set({ shipCrewIds: newShipCrewIds, activeCrewId: newActiveId });
      },

      bringAboard: (instanceId) => {
        const state = get();
        if (state.shipCrewIds.length >= SHIP_CREW_CAP || state.shipCrewIds.includes(instanceId)) {
          return false;
        }
        set({ shipCrewIds: [...state.shipCrewIds, instanceId] });
        return true;
      },

      setCrewHp: (instanceId, hp) =>
        set((state) => ({
          crew: state.crew.map((member) =>
            member.instanceId === instanceId
              ? { ...member, currentHp: Math.max(0, hp) }
              : member
          ),
        })),

      gainXp: (instanceId, amount) => {
        const state = get();
        let promotedTo: string | null = null;
        // Every promotion stage crossed in this single XP dump, not just the last one — a big
        // enough reward can cross two promotion thresholds in one call (found by the gameStore
        // test suite, item 67), and the old code only ever recorded the final destination
        // template as seen/recruited, silently skipping whichever stage(s) got passed through.
        const promotedThrough: string[] = [];
        const crew = state.crew.map((member) => {
          if (member.instanceId !== instanceId) return member;
          let level = member.level;
          let xp = member.xp + amount;
          let currentHp = member.currentHp;
          let templateId = member.templateId;
          let nickname = member.nickname;
          while (xp >= xpToNextLevel(level)) {
            xp -= xpToNextLevel(level);
            const prevMaxHp = maxHpFor({ ...member, level, templateId });
            level += 1;
            const promo = promotionFor(templateId);
            if (promo && level >= promo.level) {
              templateId = promo.nextTemplateId;
              nickname = CREW_TEMPLATES[templateId].name;
              promotedTo = templateId;
              promotedThrough.push(templateId);
            }
            const newMaxHp = maxHpFor({ ...member, level, templateId });
            currentHp = Math.min(newMaxHp, currentHp + (newMaxHp - prevMaxHp));
          }
          return { ...member, level, xp, currentHp, templateId, nickname };
        });
        set({
          crew,
          seenTemplateIds: Array.from(new Set([...state.seenTemplateIds, ...promotedThrough])),
          recruitedTemplateIds: Array.from(
            new Set([...state.recruitedTemplateIds, ...promotedThrough])
          ),
        });
        return promotedTo;
      },

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

      setCurrentBuilding: (buildingId) => set({ currentBuildingId: buildingId }),

      hireFromBuilding: (buildingId, templateId, level, cost) => {
        const state = get();
        if (state.hiredBuildingIds.includes(buildingId) || state.gold < cost) {
          return { success: false, boardedShip: false };
        }
        const newMember = createOwnedCrewMember(templateId, level);
        const boardedShip = state.shipCrewIds.length < SHIP_CREW_CAP;
        set({
          gold: state.gold - cost,
          crew: [...state.crew, newMember],
          shipCrewIds: boardedShip
            ? [...state.shipCrewIds, newMember.instanceId]
            : state.shipCrewIds,
          activeCrewId: state.activeCrewId ?? newMember.instanceId,
          hiredBuildingIds: [...state.hiredBuildingIds, buildingId],
          seenTemplateIds: state.seenTemplateIds.includes(templateId)
            ? state.seenTemplateIds
            : [...state.seenTemplateIds, templateId],
          recruitedTemplateIds: state.recruitedTemplateIds.includes(templateId)
            ? state.recruitedTemplateIds
            : [...state.recruitedTemplateIds, templateId],
        });
        return { success: true, boardedShip };
      },

      buyItem: (itemId, price) => {
        const state = get();
        if (state.gold < price) return false;
        set({
          gold: state.gold - price,
          inventory: { ...state.inventory, [itemId]: (state.inventory[itemId] ?? 0) + 1 },
        });
        return true;
      },

      consumeItem: (itemId) => {
        const state = get();
        const count = state.inventory[itemId] ?? 0;
        if (count <= 0) return false;
        set({ inventory: { ...state.inventory, [itemId]: count - 1 } });
        return true;
      },

      setCurrentPirateLord: (lordId) => set({ currentPirateLordId: lordId }),

      defeatPirateLord: (lordId) =>
        set((state) =>
          state.defeatedLordIds.includes(lordId)
            ? state
            : { defeatedLordIds: [...state.defeatedLordIds, lordId] }
        ),

      captureBlackPearl: () => set({ blackPearlCaptured: true }),

      boardBlackPearl: () => set({ blackPearlBoarded: true }),

      disembarkBlackPearl: (position) => set({ blackPearlBoarded: false, blackPearlPosition: position }),

      markSeen: (templateId) =>
        set((state) =>
          state.seenTemplateIds.includes(templateId)
            ? state
            : { seenTemplateIds: [...state.seenTemplateIds, templateId] }
        ),

      setCurrentSideQuest: (questId) => set({ currentSideQuestId: questId }),

      acceptSideQuest: (questId) =>
        set((state) =>
          state.acceptedQuestIds.includes(questId)
            ? state
            : { acceptedQuestIds: [...state.acceptedQuestIds, questId] }
        ),

      completeSideQuest: (questId, goldReward) =>
        set((state) =>
          state.completedQuestIds.includes(questId)
            ? state
            : {
                completedQuestIds: [...state.completedQuestIds, questId],
                gold: state.gold + goldReward,
              }
        ),

      advanceQuestWave: (questId) =>
        set((state) => ({
          questWaveProgress: {
            ...state.questWaveProgress,
            [questId]: (state.questWaveProgress[questId] ?? 0) + 1,
          },
        })),

      completeRepeatableQuest: (questId, goldReward, heatReduction) =>
        set((state) => ({
          gold: state.gold + goldReward,
          heat: Math.min(100, Math.max(0, state.heat - heatReduction)),
          questTurnInCounts: {
            ...state.questTurnInCounts,
            [questId]: (state.questTurnInCounts[questId] ?? 0) + 1,
          },
        })),

      gatherResource: (nodeId) => {
        const state = get();
        const node = RESOURCE_NODES.find((n) => n.id === nodeId);
        if (!node) return { success: false };
        const readyAt = state.resourceNodeCooldowns[nodeId] ?? 0;
        if (Date.now() < readyAt) return { success: false };
        const amount =
          node.minYield + Math.floor(Math.random() * (node.maxYield - node.minYield + 1));
        set({
          resources: {
            ...state.resources,
            [node.resourceId]: (state.resources[node.resourceId] ?? 0) + amount,
          },
          resourceNodeCooldowns: {
            ...state.resourceNodeCooldowns,
            [nodeId]: Date.now() + node.cooldownMinutes * 60_000,
          },
        });
        return { success: true, resourceId: node.resourceId, amount };
      },

      sellResource: (resourceId, amount) => {
        const state = get();
        const have = state.resources[resourceId] ?? 0;
        if (amount <= 0 || have < amount) return false;
        const resource = RESOURCES[resourceId as ResourceId];
        if (!resource) return false;
        set({
          resources: { ...state.resources, [resourceId]: have - amount },
          gold: state.gold + resource.sellPrice * amount,
        });
        return true;
      },

      addResource: (resourceId, amount) =>
        set((state) => ({
          resources: {
            ...state.resources,
            [resourceId]: Math.max(0, (state.resources[resourceId] ?? 0) + amount),
          },
        })),

      addItem: (itemId, amount) =>
        set((state) => ({
          inventory: {
            ...state.inventory,
            [itemId]: Math.max(0, (state.inventory[itemId] ?? 0) + amount),
          },
        })),

      craftItem: (itemId) => {
        const state = get();
        const recipe = craftingRecipeFor(itemId);
        if (!recipe) return false;
        const have = state.resources[recipe.resourceId] ?? 0;
        if (have < recipe.resourceCost) return false;
        set({
          resources: { ...state.resources, [recipe.resourceId]: have - recipe.resourceCost },
          inventory: { ...state.inventory, [itemId]: (state.inventory[itemId] ?? 0) + 1 },
        });
        return true;
      },

      promoteCrewMember: (instanceId) => {
        const state = get();
        const member = state.crew.find((m) => m.instanceId === instanceId);
        if (!member) return false;
        const promo = promotionFor(member.templateId);
        if (!promo) return false;
        const prevMaxHp = maxHpFor(member);
        const templateId = promo.nextTemplateId;
        const newMaxHp = maxHpFor({ ...member, templateId });
        const currentHp = Math.min(newMaxHp, member.currentHp + (newMaxHp - prevMaxHp));
        const nickname = CREW_TEMPLATES[templateId].name;
        set({
          crew: state.crew.map((m) =>
            m.instanceId === instanceId ? { ...m, templateId, nickname, currentHp } : m
          ),
          seenTemplateIds: state.seenTemplateIds.includes(templateId)
            ? state.seenTemplateIds
            : [...state.seenTemplateIds, templateId],
          recruitedTemplateIds: state.recruitedTemplateIds.includes(templateId)
            ? state.recruitedTemplateIds
            : [...state.recruitedTemplateIds, templateId],
        });
        return true;
      },

      stealFromShop: (buildingId) => {
        const state = get();
        const building = BUILDINGS.find((b) => b.id === buildingId);
        if (!building || !building.stealResourceId || !building.stealYield) {
          return { success: false, caught: false };
        }
        const readyAt = state.theftCooldowns[buildingId] ?? 0;
        if (Date.now() < readyAt) return { success: false, caught: false };
        const { stealResourceId: resourceId, stealYield, stealDetectionChance, stealCooldownMinutes } = building;
        const amount =
          stealYield.min + Math.floor(Math.random() * (stealYield.max - stealYield.min + 1));
        const caught = Math.random() < (stealDetectionChance ?? 0.4);
        set({
          resources: {
            ...state.resources,
            [resourceId]: (state.resources[resourceId] ?? 0) + amount,
          },
          heat: Math.min(100, Math.max(0, state.heat + (caught ? 15 : 5))),
          theftCooldowns: {
            ...state.theftCooldowns,
            [buildingId]: Date.now() + (stealCooldownMinutes ?? 30) * 60_000,
          },
        });
        return { success: true, caught, resourceId, amount };
      },

      buyShipUpgrade: (upgradeId) => {
        const state = get();
        const upgrade = shipUpgradeFor(upgradeId);
        if (!upgrade || state.shipUpgrades.includes(upgradeId)) return false;
        if (state.gold < upgrade.goldCost) return false;
        if ((state.resources[upgrade.resourceId] ?? 0) < upgrade.resourceCost) return false;
        set({
          gold: state.gold - upgrade.goldCost,
          resources: {
            ...state.resources,
            [upgrade.resourceId]: (state.resources[upgrade.resourceId] ?? 0) - upgrade.resourceCost,
          },
          shipUpgrades: [...state.shipUpgrades, upgradeId],
        });
        return true;
      },

      salvageSite: (siteId) => {
        const state = get();
        const site = SALVAGE_SITES.find((s) => s.id === siteId);
        if (!site || !state.shipUpgrades.includes(site.requiresUpgradeId)) {
          return { success: false };
        }
        const readyAt = state.salvageCooldowns[siteId] ?? 0;
        if (Date.now() < readyAt) return { success: false };
        const amount = site.minGold + Math.floor(Math.random() * (site.maxGold - site.minGold + 1));
        const treasureId =
          site.treasureId && !state.foundTreasureIds.includes(site.treasureId)
            ? site.treasureId
            : undefined;
        set({
          gold: state.gold + amount,
          salvageCooldowns: { ...state.salvageCooldowns, [siteId]: Date.now() + site.cooldownMinutes * 60_000 },
          foundTreasureIds: treasureId
            ? withHoardCheck([...state.foundTreasureIds, treasureId])
            : state.foundTreasureIds,
        });
        return { success: true, amount, treasureId };
      },

      findTreasureSite: (siteId) => {
        const state = get();
        const site = TREASURE_SITES.find((s) => s.id === siteId);
        if (!site || state.foundTreasureIds.includes(site.treasureId)) return { success: false };
        if (site.requiresItemId && (state.inventory[site.requiresItemId] ?? 0) <= 0) {
          return { success: false };
        }
        set({
          foundTreasureIds: withHoardCheck([...state.foundTreasureIds, site.treasureId]),
          inventory: site.requiresItemId
            ? {
                ...state.inventory,
                [site.requiresItemId]: (state.inventory[site.requiresItemId] ?? 0) - 1,
              }
            : state.inventory,
        });
        return { success: true, treasureId: site.treasureId };
      },

      buyTreasure: (treasureId, price) => {
        const state = get();
        if (state.foundTreasureIds.includes(treasureId) || state.gold < price) return false;
        set({
          gold: state.gold - price,
          foundTreasureIds: withHoardCheck([...state.foundTreasureIds, treasureId]),
        });
        return true;
      },

      debugAddTreasure: (treasureId) =>
        set((state) => ({
          foundTreasureIds: withHoardCheck(
            state.foundTreasureIds.includes(treasureId)
              ? state.foundTreasureIds
              : [...state.foundTreasureIds, treasureId]
          ),
        })),

      setCurrentBlackfinStage: (stageId) => set({ currentBlackfinStageId: stageId }),

      completeBlackfinStage: (stageId) =>
        set((state) => ({
          completedBlackfinStageIds: state.completedBlackfinStageIds.includes(stageId)
            ? state.completedBlackfinStageIds
            : [...state.completedBlackfinStageIds, stageId],
        })),

      debugClearResourceCooldowns: () => set({ resourceNodeCooldowns: {} }),

      debugClearTheftCooldowns: () => set({ theftCooldowns: {} }),

      debugClearSalvageCooldowns: () => set({ salvageCooldowns: {} }),

      debugSetCrewLevel: (instanceId, level) => {
        const state = get();
        // Same fix as gainXp above: walk the promotion chain a stage at a time (instead of
        // resolvePromotion's single jump straight to the final template) so a debug level jump
        // that crosses two promotion thresholds at once still marks every intermediate template
        // as seen/recruited, not just the one the crew member ends up on.
        const promotedThrough: string[] = [];
        const crew = state.crew.map((member) => {
          if (member.instanceId !== instanceId) return member;
          let templateId = member.templateId;
          let promo = promotionFor(templateId);
          while (promo && level >= promo.level) {
            templateId = promo.nextTemplateId;
            promotedThrough.push(templateId);
            promo = promotionFor(templateId);
          }
          const nickname = templateId !== member.templateId ? CREW_TEMPLATES[templateId].name : member.nickname;
          const newMaxHp = maxHpFor({ ...member, level, templateId });
          return { ...member, level, xp: 0, currentHp: newMaxHp, templateId, nickname };
        });
        set({
          crew,
          seenTemplateIds: Array.from(new Set([...state.seenTemplateIds, ...promotedThrough])),
          recruitedTemplateIds: Array.from(
            new Set([...state.recruitedTemplateIds, ...promotedThrough])
          ),
        });
      },

      debugResetSave: () => set({ ...createInitialState(), hasHydrated: true }),

      setHasHydrated: (value) => set({ hasHydrated: value }),

      completeOnboarding: () => set({ hasSeenOnboarding: true }),
    }),
    {
      name: 'pirate-game-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        gold: state.gold,
        crew: state.crew,
        shipCrewIds: state.shipCrewIds,
        activeCrewId: state.activeCrewId,
        heat: state.heat,
        hiredBuildingIds: state.hiredBuildingIds,
        inventory: state.inventory,
        defeatedLordIds: state.defeatedLordIds,
        seenTemplateIds: state.seenTemplateIds,
        recruitedTemplateIds: state.recruitedTemplateIds,
        acceptedQuestIds: state.acceptedQuestIds,
        completedQuestIds: state.completedQuestIds,
        questWaveProgress: state.questWaveProgress,
        questTurnInCounts: state.questTurnInCounts,
        resources: state.resources,
        resourceNodeCooldowns: state.resourceNodeCooldowns,
        theftCooldowns: state.theftCooldowns,
        shipUpgrades: state.shipUpgrades,
        salvageCooldowns: state.salvageCooldowns,
        hasSeenOnboarding: state.hasSeenOnboarding,
        capturedCrew: state.capturedCrew,
        blackPearlCaptured: state.blackPearlCaptured,
        blackPearlBoarded: state.blackPearlBoarded,
        blackPearlPosition: state.blackPearlPosition,
        foundTreasureIds: state.foundTreasureIds,
        completedBlackfinStageIds: state.completedBlackfinStageIds,
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
