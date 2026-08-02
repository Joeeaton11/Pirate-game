import { ResourceId } from './resources';

export interface ShipUpgrade {
  id: string;
  name: string;
  emoji: string;
  description: string;
  goldCost: number;
  resourceId: ResourceId;
  resourceCost: number;
}

export const SHIP_UPGRADES: ShipUpgrade[] = [
  {
    id: 'reinforced_hull',
    name: 'Reinforced Hull',
    emoji: '🛡️',
    description:
      "Strengthens your hull enough to survive Île Sainte-Marie's waters. Without it, the crossing is impassable.",
    goldCost: 150,
    resourceId: 'timber',
    resourceCost: 15,
  },
  {
    id: 'swift_rigging',
    name: 'Swift Rigging',
    emoji: '⛵',
    description: 'Faster, quieter sailing — halves the chance of a Navy ambush.',
    goldCost: 120,
    resourceId: 'rum',
    resourceCost: 12,
  },
  {
    id: 'diving_bell',
    name: 'Diving Bell',
    emoji: '🤿',
    description: "Lets you dive Port Royal's sunken ruins for salvage.",
    goldCost: 100,
    resourceId: 'gunpowder',
    resourceCost: 10,
  },
];

export function shipUpgradeFor(id: string): ShipUpgrade | undefined {
  return SHIP_UPGRADES.find((u) => u.id === id);
}

/** Diving-Bell-gated salvage site: a one-off gold windfall, not another resource-gather node. */
export interface SalvageSite {
  id: string;
  islandId: string;
  offset: { x: number; y: number };
  requiresUpgradeId: string;
  minGold: number;
  maxGold: number;
  cooldownMinutes: number;
}

export const SALVAGE_SITES: SalvageSite[] = [
  {
    id: 'port_royal_ruins',
    islandId: 'port_royal',
    offset: { x: -280, y: -300 },
    requiresUpgradeId: 'diving_bell',
    minGold: 25,
    maxGold: 50,
    cooldownMinutes: 40,
  },
];

export function salvageSiteWorldPosition(
  site: SalvageSite,
  islandPosition: { x: number; y: number }
): { x: number; y: number } {
  return { x: islandPosition.x + site.offset.x, y: islandPosition.y + site.offset.y };
}
