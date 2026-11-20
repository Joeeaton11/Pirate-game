export type ResourceId = 'fish' | 'timber' | 'rum' | 'gunpowder' | 'coconut' | 'sugarcane';

export interface ResourceType {
  id: ResourceId;
  name: string;
  emoji: string;
  sellPrice: number;
}

export const RESOURCES: Record<ResourceId, ResourceType> = {
  fish: { id: 'fish', name: 'Fish', emoji: '🐟', sellPrice: 3 },
  timber: { id: 'timber', name: 'Timber', emoji: '🪵', sellPrice: 5 },
  rum: { id: 'rum', name: 'Rum', emoji: '🥃', sellPrice: 6 },
  gunpowder: { id: 'gunpowder', name: 'Gunpowder', emoji: '💥', sellPrice: 8 },
  coconut: { id: 'coconut', name: 'Coconut', emoji: '🥥', sellPrice: 2 },
  sugarcane: { id: 'sugarcane', name: 'Sugarcane', emoji: '🎋', sellPrice: 4 },
};

export const RESOURCE_LIST = Object.values(RESOURCES);

export interface ResourceNode {
  id: string;
  islandId: string;
  offset: { x: number; y: number }; // relative to island center, in world units
  resourceId: ResourceId;
  name: string;
  minYield: number;
  maxYield: number;
  cooldownMinutes: number;
}

import { BP_GATHER } from '../blueprint/tortugaGameplay.generated';

export const RESOURCE_NODES: ResourceNode[] = [
  {
    id: 'node_tortuga_fish',
    islandId: 'tortuga_cove',
    // Full-town rebuild 2026-08-07 (item 52): the old spot is now open water inside the new
    // horseshoe bay — moved to the docks-and-careening quarter on the west shore.
    offset: { x: -100, y: -288 },
    resourceId: 'fish',
    name: 'Fishing Dock',
    minYield: 2,
    maxYield: 5,
    cooldownMinutes: 20,
  },
  {
    id: 'node_tortuga_timber_1',
    islandId: 'tortuga_cove',
    offset: { x: 581, y: 23 }, // was 599,23 — just off the coast; moved onto land 2026-11-20
    resourceId: 'timber',
    name: 'High Woods Stand',
    minYield: 2,
    maxYield: 5,
    cooldownMinutes: 20,
  },
  {
    id: 'node_tortuga_timber_2',
    islandId: 'tortuga_cove',
    offset: { x: 472, y: 115 },
    resourceId: 'timber',
    name: 'Boucan Ridge Stand',
    minYield: 2,
    maxYield: 5,
    cooldownMinutes: 20,
  },
  {
    id: 'node_roatan_timber',
    islandId: 'roatan',
    offset: { x: -280, y: 200 },
    resourceId: 'timber',
    name: 'Timber Stand',
    minYield: 2,
    maxYield: 5,
    cooldownMinutes: 20,
  },
  {
    id: 'node_new_providence_rum',
    islandId: 'new_providence',
    offset: { x: -280, y: -200 },
    resourceId: 'rum',
    name: 'Distillery Yard',
    minYield: 2,
    maxYield: 4,
    cooldownMinutes: 20,
  },
  {
    id: 'node_port_royal_gunpowder',
    islandId: 'port_royal',
    offset: { x: 0, y: -360 },
    resourceId: 'gunpowder',
    name: 'Powder Stores',
    minYield: 1,
    maxYield: 3,
    cooldownMinutes: 25,
  },
];

export function resourceNodesForIsland(islandId: string): ResourceNode[] {
  return RESOURCE_NODES.filter((n) => n.islandId === islandId);
}

export function resourceNodeWorldPosition(
  node: ResourceNode,
  islandPosition: { x: number; y: number }
): { x: number; y: number } {
  return { x: islandPosition.x + node.offset.x, y: islandPosition.y + node.offset.y };
}

// Tortuga gathering spots from the island blueprint (2026-11-20): fishing off the jetties, timber in
// the woods, coconuts in the palm grove, sugarcane at La Ringot. Walk through to gather.
const GATHER_NAMES: Record<string, string> = {
  fish: 'Fishing Spot',
  timber: 'Timber Stand',
  coconut: 'Coconut Palms',
  sugarcane: 'Sugarcane Rows',
};
RESOURCE_NODES.push(
  ...BP_GATHER.map((g) => ({
    id: g.id,
    islandId: 'tortuga_cove',
    offset: { x: g.x, y: g.y },
    resourceId: g.resource as ResourceId,
    name: GATHER_NAMES[g.resource] ?? 'Gathering Spot',
    minYield: 1,
    maxYield: g.resource === 'fish' ? 2 : 3,
    cooldownMinutes: 3,
  }))
);
