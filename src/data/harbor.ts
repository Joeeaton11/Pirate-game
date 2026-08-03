/** Pure decoration: a boardwalk reaching from the harbor out into open water, small boats moored
 * along it, and larger ships anchored further offshore. Same discipline as Scenery — zero
 * gameplay hook, no interaction, no collision — but deliberately placed OUTSIDE the island's land
 * polygon rather than inside it, since that's the whole point (a pier reaches into the sea, a
 * ship sits offshore). The player can never actually walk out onto a pier: movement/sailing state
 * is purely a function of the real island polygon (`islandAtPoint`), and a pier is never part of
 * that polygon — this is dressing to look at, not new ground to stand on. */
export interface PierSegment {
  islandId: string;
  from: { x: number; y: number }; // relative to island center, in world units
  to: { x: number; y: number };
}

export const PIERS: PierSegment[] = [
  // Main pier: starts at the Harbor Pier landmark, crosses the harbor-front shore, and reaches
  // well out into open water, forking partway to a second, shorter dock.
  { islandId: 'tortuga_cove', from: { x: 140, y: -290 }, to: { x: 165, y: -460 } },
  { islandId: 'tortuga_cove', from: { x: 165, y: -460 }, to: { x: 170, y: -620 } },
  { islandId: 'tortuga_cove', from: { x: 165, y: -460 }, to: { x: 90, y: -500 } },
  // Second pier, off the Fishing Dock — a working town has more than one place to tie up.
  { islandId: 'tortuga_cove', from: { x: 0, y: -280 }, to: { x: -40, y: -510 } },
  // Two more jetties off the quay itself (see QUAYS below), west and east of the main pier —
  // a proper working harbor has more than two places to tie up. Base points sit right on the
  // quay line; verified by ray-cast the same way as the original piers (start on real land right
  // at the coastline, end well out in open water).
  { islandId: 'tortuga_cove', from: { x: -50, y: -451 }, to: { x: -70, y: -560 } },
  { islandId: 'tortuga_cove', from: { x: 190, y: -455 }, to: { x: 210, y: -580 } },
];

/** A built stone quay along the natural curve of the harbor-front coastline (found the same way
 * as every pier tip: ray-cast sweeps from points south of the harbor until `islandAtPoint` flips
 * from land to sea) — rendered distinctly from the wooden piers (grey masonry, not brown planks)
 * since a quay is a solid embankment ships pull alongside, not a walkway reaching out to sea. Sits
 * a few world units inland of the true coastline so it always draws on solid ground. */
export const QUAYS: PierSegment[] = [
  { islandId: 'tortuga_cove', from: { x: -110, y: -425 }, to: { x: -50, y: -451 } },
  { islandId: 'tortuga_cove', from: { x: -50, y: -451 }, to: { x: 10, y: -463 } },
  { islandId: 'tortuga_cove', from: { x: 10, y: -463 }, to: { x: 70, y: -469 } },
  { islandId: 'tortuga_cove', from: { x: 70, y: -469 }, to: { x: 130, y: -465 } },
  { islandId: 'tortuga_cove', from: { x: 130, y: -465 }, to: { x: 190, y: -455 } },
  { islandId: 'tortuga_cove', from: { x: 190, y: -455 }, to: { x: 230, y: -445 } },
];

/** An offshore breakwater arm sheltering a harbor basin — pure backdrop, same "never touches the
 * land polygon" rule as everything else here, just further out to sea than the pier tips. */
export const BREAKWATER: PierSegment[] = [
  { islandId: 'tortuga_cove', from: { x: -90, y: -540 }, to: { x: 60, y: -600 } },
  { islandId: 'tortuga_cove', from: { x: 60, y: -600 }, to: { x: 220, y: -540 } },
];

export interface HarborBoat {
  islandId: string;
  offset: { x: number; y: number };
  emoji: string;
  fontSize?: number;
  rotationDeg?: number;
}

/** Small boats moored right at or along the piers and quay themselves. */
export const DOCKED_BOATS: HarborBoat[] = [
  { islandId: 'tortuga_cove', offset: { x: 170, y: -620 }, emoji: '⛵', fontSize: 26, rotationDeg: -20 },
  { islandId: 'tortuga_cove', offset: { x: 150, y: -540 }, emoji: '🛶', fontSize: 20, rotationDeg: 40 },
  { islandId: 'tortuga_cove', offset: { x: 90, y: -500 }, emoji: '🚣', fontSize: 20, rotationDeg: -30 },
  { islandId: 'tortuga_cove', offset: { x: -40, y: -510 }, emoji: '⛵', fontSize: 26, rotationDeg: 15 },
  // New jetties' own boats.
  { islandId: 'tortuga_cove', offset: { x: -70, y: -560 }, emoji: '🛶', fontSize: 20, rotationDeg: -10 },
  { islandId: 'tortuga_cove', offset: { x: 210, y: -580 }, emoji: '⛵', fontSize: 24, rotationDeg: 25 },
  // Rowboats tied up directly against the quay wall, not off a jetty tip.
  { islandId: 'tortuga_cove', offset: { x: 10, y: -478 }, emoji: '🚣', fontSize: 18, rotationDeg: 5 },
  { islandId: 'tortuga_cove', offset: { x: 150, y: -478 }, emoji: '🛶', fontSize: 18, rotationDeg: -15 },
];

/** Larger ships anchored further out, well clear of the piers — the harbor's real deep-water
 * traffic, purely a backdrop. */
export const OFFSHORE_SHIPS: HarborBoat[] = [
  { islandId: 'tortuga_cove', offset: { x: 250, y: -700 }, emoji: '🚢', fontSize: 34, rotationDeg: 10 },
  { islandId: 'tortuga_cove', offset: { x: 60, y: -740 }, emoji: '🛳️', fontSize: 36, rotationDeg: -15 },
  { islandId: 'tortuga_cove', offset: { x: -140, y: -660 }, emoji: '⛴️', fontSize: 32, rotationDeg: 25 },
  { islandId: 'tortuga_cove', offset: { x: 330, y: -620 }, emoji: '🚢', fontSize: 30, rotationDeg: -8 },
  // Sheltering inside the breakwater basin, closer in than the deep-water anchorage above.
  { islandId: 'tortuga_cove', offset: { x: -30, y: -510 }, emoji: '⛴️', fontSize: 26, rotationDeg: -12 },
  { islandId: 'tortuga_cove', offset: { x: 175, y: -500 }, emoji: '🚢', fontSize: 26, rotationDeg: 18 },
];

export function piersForIsland(islandId: string): PierSegment[] {
  return PIERS.filter((p) => p.islandId === islandId);
}

export function harborBoatWorldPosition(
  boat: HarborBoat,
  islandPosition: { x: number; y: number }
): { x: number; y: number } {
  return { x: islandPosition.x + boat.offset.x, y: islandPosition.y + boat.offset.y };
}
