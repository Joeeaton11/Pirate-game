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
  {
    id: 'tortuga_street_resident_a',
    islandId: 'tortuga_cove',
    name: 'A Local Resident',
    emoji: '🧑',
    flavor: "Mornin'. Or evenin'. Hard to keep track out here — one day's much like the last.",
    waypointA: { x: -90, y: -10 },
    waypointB: { x: -40, y: 20 },
    speed: 15,
  },
  {
    id: 'tortuga_street_resident_b',
    islandId: 'tortuga_cove',
    name: 'A Fishwife',
    emoji: '👩‍🦱',
    flavor: "Nets are mended, wash is out. Nothing left to do but gossip until supper.",
    waypointA: { x: 20, y: 50 },
    waypointB: { x: 70, y: 80 },
    speed: 15,
  },
  {
    id: 'tortuga_street_resident_c',
    islandId: 'tortuga_cove',
    name: 'A Child at Play',
    emoji: '🧒',
    flavor: "Wanna see my cutlass? It's just a stick, but don't tell the other captains that.",
    waypointA: { x: -60, y: 100 },
    waypointB: { x: -10, y: 130 },
    speed: 25,
  },
  {
    id: 'tortuga_street_resident_d',
    islandId: 'tortuga_cove',
    name: 'An Old Fisherman',
    emoji: '🎣',
    flavor: "Caught a marlin bigger than my rowboat once. Nobody believes me anymore, and that's fine.",
    waypointA: { x: 40, y: 130 },
    waypointB: { x: 90, y: 150 },
    speed: 14,
  },
  {
    id: 'tortuga_street_crier',
    islandId: 'tortuga_cove',
    name: 'A Town Crier',
    emoji: '📯',
    flavor: "Hear ye! Prices are up at the customs house, tempers are up at the tavern, and the fort's out of rum. Same as every week.",
    waypointA: { x: 130, y: -10 },
    waypointB: { x: 150, y: 20 },
    speed: 16,
  },
  {
    id: 'tortuga_street_farmer',
    islandId: 'tortuga_cove',
    name: 'A Farmer',
    emoji: '🧑‍🌾',
    flavor: "Tobacco's coming in thin this season. Blame the soil, blame the rain, blame the pirates trampling the rows — everybody does.",
    waypointA: { x: 110, y: 90 },
    waypointB: { x: 125, y: 105 },
    speed: 12,
  },
  {
    id: 'tortuga_street_netmender',
    islandId: 'tortuga_cove',
    name: 'A Net-Mender',
    emoji: '🧵',
    flavor: "Torn again. Always torn. I swear the fish do it on purpose out of spite.",
    waypointA: { x: -135, y: 95 },
    waypointB: { x: -115, y: 110 },
    speed: 13,
  },
  {
    id: 'tortuga_street_sentry',
    islandId: 'tortuga_cove',
    name: 'A Fort Sentry',
    emoji: '🔭',
    flavor: "Watching the harbor mouth. Nothing gets past this rock without Le Vasseur hearing about it first.",
    waypointA: { x: 80, y: -110 },
    waypointB: { x: 105, y: -90 },
    speed: 14,
  },
  {
    id: 'tortuga_street_beggar',
    islandId: 'tortuga_cove',
    name: 'A Beggar',
    emoji: '🧎',
    flavor: "Spare a coin, captain? I sailed with better men than you and worse men too. Ended up here regardless.",
    waypointA: { x: -50, y: -90 },
    waypointB: { x: -20, y: -70 },
    speed: 12,
  },
  {
    id: 'tortuga_street_cat',
    islandId: 'tortuga_cove',
    name: "A Forge Cat",
    emoji: '🐈‍⬛',
    flavor: "Answers to nobody, sleeps wherever it pleases. Currently claims the warmest spot by the forge as its own.",
    waypointA: { x: -130, y: 60 },
    waypointB: { x: -100, y: 80 },
    speed: 20,
  },
  {
    id: 'tortuga_street_ropemaker',
    islandId: 'tortuga_cove',
    name: 'A Rope-Maker',
    emoji: '🪢',
    flavor: "Hemp in one end, rigging out the other. Every ship in this harbor owes its sails to this walk, back and forth, all day.",
    waypointA: { x: -90, y: 150 },
    waypointB: { x: -60, y: 152 },
    speed: 12,
  },
  {
    id: 'tortuga_street_lookout',
    islandId: 'tortuga_cove',
    name: 'A Lookout',
    emoji: '🏴',
    flavor: "Quiet out here on the point. Suits me. First one to spot a sail gets first pick of the salvage.",
    waypointA: { x: -170, y: 0 },
    waypointB: { x: -150, y: 25 },
    speed: 15,
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
