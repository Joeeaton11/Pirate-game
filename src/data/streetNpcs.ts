/** Ambient street life: NPCs that patrol back and forth between two points instead of standing
 * still, so a town feels lived-in from the outside too, not just inside its buildings. Purely
 * flavor — walking near one shows a toast, same as landmarks — never a quest. */
export interface StreetNpc {
  id: string;
  islandId: string;
  name: string;
  emoji: string;
  flavor: string;
  waypointA: { x: number; y: number }; // relative to island center, in world units
  waypointB: { x: number; y: number };
  speed: number; // world units per second
}

export const STREET_NPCS: StreetNpc[] = [
  {
    id: 'tortuga_street_guard',
    islandId: 'tortuga_cove',
    name: 'A Patrolling Guard',
    emoji: '🥾',
    flavor: "Evening, captain. Keep your blade sheathed in the square and we'll get along fine.",
    waypointA: { x: 10, y: 30 },
    waypointB: { x: -40, y: 50 },
    speed: 18,
  },
  {
    id: 'tortuga_street_dog',
    islandId: 'tortuga_cove',
    name: 'A Scruffy Dog',
    emoji: '🐕',
    flavor: "Belongs to nobody and everybody. Half the tavern's regulars swear it's good luck.",
    waypointA: { x: -70, y: -60 },
    waypointB: { x: -100, y: -20 },
    speed: 22,
  },
  {
    id: 'tortuga_street_dockhand',
    islandId: 'tortuga_cove',
    name: 'A Dockhand',
    emoji: '🧑‍🌾',
    flavor: "Crates don't carry themselves, more's the pity. Mind the rope.",
    waypointA: { x: 20, y: -130 },
    waypointB: { x: -10, y: -155 },
    speed: 16,
  },
];

export function streetNpcsForIsland(islandId: string): StreetNpc[] {
  return STREET_NPCS.filter((n) => n.islandId === islandId);
}

/** Deterministic ping-pong position along the NPC's patrol line, purely a function of time —
 * no per-NPC state needed, just re-render on a timer to animate it. */
export function streetNpcPosition(npc: StreetNpc, nowMs: number): { x: number; y: number } {
  const dist = Math.hypot(npc.waypointB.x - npc.waypointA.x, npc.waypointB.y - npc.waypointA.y);
  if (dist === 0) return npc.waypointA;
  const legDurationMs = (dist / npc.speed) * 1000;
  const cycleMs = legDurationMs * 2;
  const t = nowMs % cycleMs;
  const progress = t < legDurationMs ? t / legDurationMs : (cycleMs - t) / legDurationMs;
  return {
    x: npc.waypointA.x + (npc.waypointB.x - npc.waypointA.x) * progress,
    y: npc.waypointA.y + (npc.waypointB.y - npc.waypointA.y) * progress,
  };
}
