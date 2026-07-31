export type ResourceId = 'fish' | 'timber' | 'rum' | 'gunpowder';

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

export const RESOURCE_NODES: ResourceNode[] = [
  {
    id: 'node_tortuga_fish',
    islandId: 'tortuga_cove',
    offset: { x: 0, y: -140 },
    resourceId: 'fish',
    name: 'Fishing Dock',
    minYield: 2,
    maxYield: 5,
    cooldownMinutes: 20,
  },
  {
    id: 'node_roatan_timber',
    islandId: 'roatan',
    offset: { x: -140, y: 100 },
    resourceId: 'timber',
    name: 'Timber Stand',
    minYield: 2,
    maxYield: 5,
    cooldownMinutes: 20,
  },
  {
    id: 'node_new_providence_rum',
    islandId: 'new_providence',
    offset: { x: -140, y: -100 },
    resourceId: 'rum',
    name: 'Distillery Yard',
    minYield: 2,
    maxYield: 4,
    cooldownMinutes: 20,
  },
  {
    id: 'node_port_royal_gunpowder',
    islandId: 'port_royal',
    offset: { x: 0, y: -180 },
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
