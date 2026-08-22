import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image as RNImage,
  ImageSourcePropType,
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, {
  Circle,
  Defs,
  Image as SvgImage,
  Line,
  Pattern,
  Polygon,
  Rect,
  Text as SvgText,
} from 'react-native-svg';
import OnboardingOverlay from '../components/OnboardingOverlay';
import {
  BLACK_PEARL_CAPTAIN_LEVEL,
  BLACK_PEARL_CAPTAIN_TEMPLATE,
  BLACK_PEARL_EMOJI,
  BLACK_PEARL_FLAG_EMOJI,
} from '../data/blackPearl';
import { Building, BUILDINGS, ENTER_RADIUS, buildingWorldPosition, buildingsForIsland } from '../data/buildings';
import { CREW_TEMPLATES } from '../data/crew';
import {
  ISLAND_LIST,
  ISLANDS,
  SEA_ENCOUNTER_CHANCE,
  SEA_ENCOUNTER_TABLE,
  START_POSITION,
  WORLD_HEIGHT,
  WORLD_WIDTH,
  islandAtPoint,
} from '../data/islands';
import { HOUSES, houseWorldPosition, housesForIsland } from '../data/houses';
import { LANDMARKS, landmarkWorldPosition } from '../data/landmarks';
import { PROPS, propWorldPosition } from '../data/props';
import { SCENERY, sceneryWorldPosition } from '../data/scenery';
import {
  CAPTAIN_NAME,
  PLAYER_EMOJI_LAND_FRONT,
  PLAYER_EMOJI_LAND_SIDE,
} from '../data/protagonist';
import {
  ATTACK_FLASH_MS,
  EMOTE_VICTORY,
  EMOTE_WAVE,
  FACE_DETERMINED,
  FACE_HAPPY,
  FACE_HURT,
  FACE_LAUGH,
  FACE_NEUTRAL,
  FACE_WINK,
  FacingDirection,
  ICON_EXCLAIM,
  ICON_MAP,
  IDLE_FLOURISH_DELAY_MS,
  IDLE_FLOURISH_FRAME_MS,
  IDLE_FLOURISH_HOLD_MS,
  IDLE_FLOURISHES,
  IDLE_FRAME_COUNT,
  IdleFlourish,
  POSE_ATTACK,
  POSE_SWORD_READY,
  RUN_FRAME_COUNT,
  RUN_HEAT_THRESHOLD,
  SCALLY_PORTRAIT,
  VICTORY_ANIMATION_MS,
  WALK_FRAME_COUNT,
  WAVE_ANIMATION_MS,
  runSpriteSource,
  scallySpriteSource,
} from '../data/scallySprites';
import { MONKEY_IDLE, MONKEY_WINK, MONKEY_WINK_HOLD_MS, MONKEY_WINK_INTERVAL_MS } from '../data/monkeySprites';
import {
  ACCELERATE_ANIMATION_MS,
  DEPART_ANIMATION_MS,
  SHIP_ACCELERATE_SPRITE,
  SHIP_APPROACH_FRAMES,
  SHIP_APPROACH_RADIUS,
  SHIP_DEPART_SPRITE,
  SHIP_FURL_RADIUS,
  SHIP_HEADING_VECTOR,
  SHIP_STOP_SKID_SPRITE,
  SHIP_TURN_ANIMATION_MS,
  STOP_SKID_ANIMATION_MS,
  ShipHeading,
  WAKE_SPRITES,
  headingFromVector,
  merchantShipSpriteSource,
  oppositeHeading,
  shipSpriteSource,
  turnBankSource,
  turnDirectionFor,
} from '../data/shipSprites';
import {
  BUILDING_SPRITES,
  GROUND_TILES,
  HOUSE_SPRITES,
  NATURE_SPRITES,
  PROP_SPRITES,
  WORLD_SPRITES,
} from '../data/worldSprites';
import {
  PIRATE_LORDS,
  isLordUnlocked,
  pirateLordForIsland,
  pirateLordWorldPosition,
} from '../data/pirateLords';
import { MERCHANT_ENCOUNTER_TABLE, MERCHANT_SEA_CHANCE, MERCHANT_TEMPLATES } from '../data/merchants';
import { RESCUE_POINT, rescuePointWorldPosition } from '../data/rescue';
import { PIERS, QUAYS, BREAKWATER, DOCKED_BOATS, OFFSHORE_SHIPS, harborBoatWorldPosition } from '../data/harbor';
import {
  STREETS,
  STREET_JUNCTIONS,
  connectedSegments,
  nearestStreetSegment,
  randomPointOnSegment,
  streetsForIsland,
  StreetSegment,
} from '../data/streets';
import { STREET_NPCS, StreetNpc } from '../data/streetNpcs';
import { RESOURCE_NODES, RESOURCES, resourceNodeWorldPosition } from '../data/resources';
import { SALVAGE_SITES, salvageSiteWorldPosition } from '../data/shipUpgrades';
import { SIDE_QUESTS, SideQuest, sideQuestWorldPosition } from '../data/sideQuests';
import { rarityColor, TREASURE_SITES, TREASURES, treasureSiteWorldPosition } from '../data/treasures';
import { BLACKFIN_EMOJI, BLACKFIN_STAGES, blackfinStageWorldPosition } from '../data/blackfin';
import { GRACE_EMOJI, GRACE_STAGES, graceStageWorldPosition } from '../data/grace';
import {
  THREAT_TEMPLATES,
  ThreatFaction,
  ambushChance,
  navyTableForHeat,
  rivalTableForHeat,
} from '../data/threats';
import { RootStackParamList } from '../navigation/types';
import { EncounterFaction, useGameStore } from '../store/gameStore';
import { CrewTemplate } from '../types';
import { maxHpFor, pickWildEncounter } from '../utils/battle';
import { BattleBackdrop, classifyBackdrop } from '../utils/battleBackdrop';

type Props = NativeStackScreenProps<RootStackParamList, 'Map'>;

// Pokémon-style close camera: the world renders at ZOOM x its native scale (buildings, houses,
// streets, everything inside the `world` container), while the player token — rendered as a
// separate fixed element always centered on screen — is sized to match by hand below.
const ZOOM = 5;
// In real Pokémon a character is ~1 tile and a building is ~5-7 tiles — the character is small
// next to structures. PLAYER_SIZE previously scaled at the same native size as a building (40 vs
// 44), which is why zooming alone never got there: zoom scales everything in lockstep, so a
// player already sized like a building stayed sized like a building at any zoom level. Fixed by
// giving the player a genuinely small native footprint before the same ZOOM is applied to it.
const PLAYER_SIZE = 12 * ZOOM;
const BUILDING_SIZE = 44;
// The Black Pearl under sail reads as a ship, not a person, so she gets a footprint closer to the
// docked marker's (BUILDING_SIZE * 1.8) than to Captain Scally's own on-foot sprite.
const SHIP_SPRITE_SIZE = 80;
const SHIP_WAKE_SIZE = 46;
const HOUSE_EMOJIS = ['🏠', '🏚️', '🛖'];
// Real house art (2026-08-13 art pass) reads better with more room than the 26px emoji box —
// same reasoning as buildings getting BUILDING_SIZE*1.7 when they have real sprite art.
const HOUSE_SPRITE_SIZE = 34;
// Some building types already have a ready-made emoji that IS a structure (fort's castle, shop's
// storefront, chapel's church, etc.) — those render large and alone, same as before. The rest
// (tavern's mugs, fishmonger's fish, smithy's hammer, ...) aren't shaped like a building at all, so
// those get a house emoji as a base with the type emoji sitting on top of it as a small roof badge.
const BUILDING_SHAPED_EMOJI = new Set(['🏪', '🏚️', '⛩️', '🏰', '⛪', '🛖', '🏛️', '🏕️']);
const EDGE_ICON_SIZE = 34;
const EDGE_ICON_MARGIN = EDGE_ICON_SIZE / 2 + 8;
// GTA-style radar: a circular minimap fixed in the corner, always centered on the player (the
// world scrolls under a marker that never moves), zoomed to a local radius rather than the whole
// island or world. Solves both the "which of 7 islands is this" problem and the "I can't see
// anything while sailing between islands" gap the previous island-bounding-box version had — the
// radar just keeps following the player regardless of what's underneath them.
const MINIMAP_SIZE = 130; // on-screen diameter, px
const MINIMAP_RADIUS = 450; // world units shown in every direction from the player
const MINIMAP_WORLD_PER_PX = (MINIMAP_RADIUS * 2) / MINIMAP_SIZE;
// Scenery emoji that read as "forest" for the minimap's dark-green tree-mass fill — 🌿 (scrub) and
// 🪨/🪦 (rocks/graves) are dressing for the ruins/abandoned zones, not woodland.
const FOREST_EMOJI = new Set(['🌴', '🌲', '🌳']);
// Real art pass (2026-08-13) — maps a SCENERY prop's emoji to a cut nature sprite where a genuine
// match exists (worldSprites.ts NATURE_SPRITES). 🌿 alternates between the two bush designs for
// variety instead of always picking one; everything else keeps rendering its emoji as before.
const TREE_ROCK_SPRITE: Partial<Record<string, keyof typeof NATURE_SPRITES>> = {
  '🌴': 'tree_palm',
  '🌲': 'tree_tall',
  '🌳': 'tree_round',
  '🪨': 'rock_spire',
};
function natureSpriteFor(emoji: string, index: number): keyof typeof NATURE_SPRITES | null {
  if (emoji === '🌿') return index % 2 === 0 ? 'bush_plain' : 'bush_flower';
  return TREE_ROCK_SPRITE[emoji] ?? null;
}
// Slowed from 260 — full sea speed made sailing feel uncontrollable, especially threading the
// harbor mouth/piers right after boarding the Black Pearl.
const SEA_SPEED = 150; // world units per second
const ON_PATH_SPEED = 45; // world units per second — walking an actual street/path
// Cutting across open grass/scenery instead of following a street reads as harder going, and
// nudges players toward the authored street network instead of beelining through decor.
const OFF_PATH_SPEED = 26; // world units per second
// How close to a street segment counts as "on it" — half the widest street's drawn stroke (16
// world units on the minimap) plus a little slack, so walking isn't punished for being a few
// pixels off dead-center of the line.
const PATH_WALK_RADIUS = 20;
const PLAYER_COLLISION_RADIUS = 3;
// A "garden" buffer beyond the house's own 13-unit visual footprint, so players can't cut
// straight through what reads as someone's yard — tightest real house-house gap is 40 units,
// house-building is 35.8 (checked programmatically), both comfortably clear of 12+12 or 12+24.
const HOUSE_COLLISION_RADIUS = 12;
// Buildings previously had no collision at all — the player could walk straight through a
// tavern or fort's sprite without ever entering it. Kept below `ENTER_RADIUS` (26) minus
// `PLAYER_COLLISION_RADIUS` — a radius as large as the visual footprint (BUILDING_SIZE/2 = 22)
// would physically block the player before they ever got close enough to trigger the "Enter?"
// prompt at all, since that prompt only fires within ENTER_RADIUS of the building's center.
const BUILDING_COLLISION_RADIUS = 15;
// Visual "fenced yard" patches, drawn behind the house/building sprite — sized a little past
// their respective collision radii so the tinted grass reads as the reason you can't cut through,
// not just an invisible wall.
// Disabled 2026-08-04 per direct feedback: with the Old Town packed into tight, adjacent row
// houses, the garden rings just made everything look crowded/messy again. Purely a render-time
// toggle — the offset math, collision radii, and precomputed *_GARDEN_OFFSETS below are all still
// intact and cost nothing when off, so flipping this back to `true` is the entire un-revert.
const SHOW_GARDENS = false;
// Disabled 2026-08-14 per direct feedback: the building sprites are cut/placed badly enough
// (wrong scale, wrong offsets relative to the street grid) that they need a real re-pass, and
// they were making it hard to judge the street/road layout on its own. Same pattern as
// SHOW_GARDENS above — a pure render-time toggle, nothing about building data, collision, or
// walk-up "Enter?" prompts changed, so buildings are still fully functional, just invisible until
// this flips back to `true` once the art/placement pass is redone.
const SHOW_BUILDINGS = false;
// Disabled 2026-08-14, same request as SHOW_BUILDINGS above but taken further: "remove everything
// that isn't the ground" — so the street/road network itself, houses, decorative scenery/props,
// landmarks, ambient street NPCs, and every interactive map marker (quests, resource/salvage/
// treasure sites, the rescue point, Blackfin/Grace stages, Pirate Lord forts, the Black Pearl
// marker) are all gated off too, leaving only each island's ground polygon and the player token.
// Same render-time-only pattern throughout — no data deleted, nothing in gameStore touched. The
// intent is to rebuild this up in layers (ground now, then streets/roads per the standing request,
// then everything else) by flipping these back on one at a time rather than all at once.
//
// SHOW_STREETS flipped back on 2026-08-14, first layer of that rebuild: "add only the roads and
// paths. Skin them using the sprites and tiles" — every one of STREETS/PIERS/QUAYS/BREAKWATER now
// renders with a real tile-pattern stroke (cobble for paved streets/quay/breakwater, sand standing
// in for dirt 'path' tracks, wood for piers) instead of the old flat stroke colors — see the
// GAME_DESIGN.md entry for this pass for the exact per-category mapping.
const SHOW_STREETS = true; // STREETS, PIERS, QUAYS, BREAKWATER
const SHOW_HOUSES = false;
const SHOW_SCENERY = false; // SCENERY (trees/rocks), PROPS, decorative DOCKED_BOATS/OFFSHORE_SHIPS
const SHOW_LANDMARKS = false;
const SHOW_STREET_NPCS = false;
// Every interactive world marker that isn't a building: side quests, resource/salvage/treasure
// sites, the rescue point, Blackfin/Grace story-stage markers, Pirate Lord forts, the Black Pearl
// marker, and the matching edge-of-screen indicators/minimap blips for all of the above.
const SHOW_MAP_MARKERS = false;
const HOUSE_GARDEN_RADIUS = 18;
const BUILDING_GARDEN_RADIUS = 30;
// Street NPCs are much smaller than the player on screen, so they get a tighter collision
// footprint — otherwise they'd feel like they're bumping into houses far from their own sprite.
const NPC_COLLISION_RADIUS = 2;
const NPC_WANDER_SPEED_SCALE = 0.6; // wandering reads better slower than a purposeful walk
const NPC_ARRIVE_RADIUS = 4; // world units — close enough to a target to pick a new one
// The residential grid's own streets can be very long (a single avenue can span the whole town),
// so picking a random point anywhere on a "connected" segment let NPCs wander much further from
// their authored flavor spot than intended — reads as running around the whole map instead of
// keeping to a local patrol route. Bounding every retarget to within this distance of the NPC's
// original anchor keeps them exactly on real street points while staying local.
const NPC_PATROL_RADIUS = 45;
const DEADZONE = 12; // px of drag before movement starts
// Below this, `isMoving` (the animation-facing flag) is allowed to drop back to false. Deliberately
// lower than DEADZONE itself: a drag distance oscillating in the gap between the two (hand tremor,
// a slow drag hovering right at the edge) no longer toggles isMoving at all, only a genuine
// start/stop does. Real movement (directionRef) still stops exactly at DEADZONE, unchanged — only
// the animation flag got the hysteresis. See scallySprites.ts's IDLE_SOURCES doc comment for why
// this needed fixing before a real idle stance was safe to wire in.
const STOP_DEADZONE = 4;
const MAX_DRAG = 70; // px of drag for full speed
const ENCOUNTER_TICK_MS = 1400;

/** Shared circle-vs-circle obstacle collision with axis-separated sliding: if the full move is
 * blocked, retry the X-only and Y-only projections before giving up, so both the player and
 * street NPCs can slide along an obstacle's edge instead of hard-stopping or clipping through. */
function slideAroundObstacles(
  current: { x: number; y: number },
  raw: { x: number; y: number },
  obstacles: { x: number; y: number }[],
  keepOutRadius: number
): { x: number; y: number } {
  const blocked = (pos: { x: number; y: number }) =>
    obstacles.some((o) => Math.hypot(pos.x - o.x, pos.y - o.y) < keepOutRadius);
  if (!blocked(raw)) return raw;
  const slideX = { x: raw.x, y: current.y };
  if (!blocked(slideX)) return slideX;
  const slideY = { x: current.x, y: raw.y };
  if (!blocked(slideY)) return slideY;
  return current;
}

/** Whether a world point is close enough to a real street/path segment to count as "on it" for
 * movement-speed purposes. Islands with no authored street data (most of them — only Tortuga and
 * New Providence have a street network so far) always read as on-path here, so the off-path speed
 * penalty only ever applies somewhere it's actually possible to find and follow a path; it would
 * otherwise nerf every step taken on every other island. */
function isOnPath(
  worldPoint: { x: number; y: number },
  island: { id: string; position: { x: number; y: number } }
): boolean {
  const segments = streetsForIsland(island.id);
  if (segments.length === 0) return true;
  // STREETS stores each segment relative to its island's center, so the world point has to be
  // converted the same way before comparing against it (nearestStreetSegment/closestPointOnSegment
  // both operate in that same island-relative space, same convention street NPCs already use).
  const relativePoint = { x: worldPoint.x - island.position.x, y: worldPoint.y - island.position.y };
  const nearest = nearestStreetSegment(relativePoint, island.id);
  return (
    !!nearest &&
    Math.hypot(relativePoint.x - nearest.point.x, relativePoint.y - nearest.point.y) <= PATH_WALK_RADIUS
  );
}

function closestPointOnSegment(
  p: { x: number; y: number },
  a: { x: number; y: number },
  b: { x: number; y: number }
): { x: number; y: number } {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const lenSq = abx * abx + aby * aby;
  if (lenSq === 0) return { ...a };
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * abx + (p.y - a.y) * aby) / lenSq));
  return { x: a.x + abx * t, y: a.y + aby * t };
}

/** Shortest distance from a point to any real pier's line — used to gate the Black Pearl's
 * furled-sail art (which bakes in a pier's dock posts) so it only ever shows up genuinely near a
 * jetty, never floating phantom timbers over a plain beach landing. */
function distanceToNearestPier(point: { x: number; y: number }): number {
  let best = Infinity;
  for (const p of PIERS) {
    const islandPos = ISLANDS[p.islandId].position;
    const from = { x: islandPos.x + p.from.x, y: islandPos.y + p.from.y };
    const to = { x: islandPos.x + p.to.x, y: islandPos.y + p.to.y };
    const closest = closestPointOnSegment(point, from, to);
    const d = Math.hypot(point.x - closest.x, point.y - closest.y);
    if (d < best) best = d;
  }
  return best;
}

interface PathObstacle {
  from: { x: number; y: number };
  to: { x: number; y: number };
  halfWidth: number; // half the drawn stroke width, i.e. how far the paint reaches off the centerline
}

/** Every real, drawn path on an island — streets (width depends on 'main'/'path' style), piers,
 * and quays — as a flat list of segments a garden needs to stay clear of. Not BREAKWATER: that's
 * a rubble arm out at sea, never near a house/building garden. */
function pathObstaclesForIsland(islandId: string): PathObstacle[] {
  return [
    ...streetsForIsland(islandId).map((s) => ({
      from: s.from,
      to: s.to,
      halfWidth: s.style === 'main' ? 14 : 4,
    })),
    ...PIERS.filter((p) => p.islandId === islandId).map((p) => ({ from: p.from, to: p.to, halfWidth: 10 })),
    ...QUAYS.filter((q) => q.islandId === islandId).map((q) => ({ from: q.from, to: q.to, halfWidth: 8 })),
  ];
}

/** Nudges a garden circle's center away from whichever real path it would otherwise overlap, so
 * the tinted yard never geometrically overlaps a path — the house/building icon itself stays
 * exactly where it always was (fronting the street is fine and expected; it's the yard that
 * shouldn't spill onto the road). A few relaxation passes: each nudge can occasionally bring the
 * center nearer to a *different* nearby path than the one just cleared, so repeating a handful of
 * times converges on a spot clear of everything nearby without an expensive full solve. Computed
 * once at module load — house/building/street positions are static data, not per-render state —
 * so this never runs on the movement tick. */
function computeGardenOffset(
  entityOffset: { x: number; y: number },
  islandId: string,
  gardenRadius: number
): { x: number; y: number } {
  const obstacles = pathObstaclesForIsland(islandId);
  if (obstacles.length === 0) return entityOffset;
  let center = { ...entityOffset };
  for (let pass = 0; pass < 4; pass++) {
    let nearestPoint: { x: number; y: number } | null = null;
    let nearestHalfWidth = 0;
    let nearestDist = Infinity;
    for (const o of obstacles) {
      const point = closestPointOnSegment(center, o.from, o.to);
      const dist = Math.hypot(center.x - point.x, center.y - point.y);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestPoint = point;
        nearestHalfWidth = o.halfWidth;
      }
    }
    if (!nearestPoint) break;
    const needed = gardenRadius + nearestHalfWidth;
    if (nearestDist >= needed) break;
    let dx = center.x - nearestPoint.x;
    let dy = center.y - nearestPoint.y;
    let d = Math.hypot(dx, dy);
    if (d < 0.01) {
      dx = 0;
      dy = 1;
      d = 1;
    }
    center = { x: nearestPoint.x + (dx / d) * needed, y: nearestPoint.y + (dy / d) * needed };
  }
  return center;
}

// Precomputed once at module load, in the same island-relative units as `house.offset`/
// `building.offset` — parallel to HOUSES/BUILDINGS by index/id respectively.
const HOUSE_GARDEN_OFFSETS: { x: number; y: number }[] = HOUSES.map((house) =>
  computeGardenOffset(house.offset, house.islandId, HOUSE_GARDEN_RADIUS)
);
const BUILDING_GARDEN_OFFSETS: Record<string, { x: number; y: number }> = Object.fromEntries(
  BUILDINGS.map((building) => [
    building.id,
    computeGardenOffset(building.offset, building.islandId, BUILDING_GARDEN_RADIUS),
  ])
);

/** Clamps a world-space target to the edge of the visible viewport along the ray from the player
 * (screen center) to the target, so an off-screen point of interest gets a small icon pinned to
 * whichever edge it lies behind — the icon "orbits" the screen border as the player moves, same
 * idea as an off-screen objective marker in most open-world games. Returns null if the target is
 * already inside the visible area (its own on-map marker is enough, no edge icon needed).
 */
function edgeIndicatorPosition(
  player: { x: number; y: number },
  target: { x: number; y: number },
  viewport: { width: number; height: number },
  margin: number
): { x: number; y: number } | null {
  const dx = (target.x - player.x) * ZOOM;
  const dy = (target.y - player.y) * ZOOM;
  const halfW = viewport.width / 2 - margin;
  const halfH = viewport.height / 2 - margin;
  if (Math.abs(dx) <= halfW && Math.abs(dy) <= halfH) return null;
  const tX = dx !== 0 ? halfW / Math.abs(dx) : Infinity;
  const tY = dy !== 0 ? halfH / Math.abs(dy) : Infinity;
  const t = Math.min(tX, tY);
  return { x: viewport.width / 2 + dx * t, y: viewport.height / 2 + dy * t };
}

/** Finds a house-free spot near a building's door to place the player when they exit, radiating
 * outward from the entry point's own direction/distance first before fanning out to other angles.
 * The naive fixed-distance push used before this existed could land the player inside a nearby
 * house's collision zone (several Tortuga buildings have a house closer than the push distance),
 * leaving them wedged in the doorway with no clear direction to move. */
function findClearExitSpot(
  buildingPos: { x: number; y: number },
  awayDx: number,
  awayDy: number,
  awayDist: number,
  baseDist: number,
  houseObstacles: { x: number; y: number }[],
  keepOutRadius: number
): { x: number; y: number } {
  const blocked = (pos: { x: number; y: number }) =>
    houseObstacles.some((h) => Math.hypot(pos.x - h.x, pos.y - h.y) < keepOutRadius);

  const baseAngle = Math.atan2(awayDy, awayDx);
  const extraDistances = [0, 10, 20, 30, 40, 60, 80, 100];
  const angleOffsetsDeg = [0, 30, -30, 60, -60, 90, -90, 135, -135, 180];

  for (const offsetDeg of angleOffsetsDeg) {
    const angle = baseAngle + (offsetDeg * Math.PI) / 180;
    for (const extra of extraDistances) {
      const d = baseDist + extra;
      const candidate = { x: buildingPos.x + Math.cos(angle) * d, y: buildingPos.y + Math.sin(angle) * d };
      if (!blocked(candidate)) return candidate;
    }
  }
  // Should be unreachable given the search above, but never leave the player with no fallback.
  return { x: buildingPos.x + (awayDx / awayDist) * baseDist, y: buildingPos.y + (awayDy / awayDist) * baseDist };
}

interface NpcSimState {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  candidateSegments: StreetSegment[];
  anchorPoint: { x: number; y: number };
}

/** Picks a random point from the candidate segments, retrying until it lands within
 * `NPC_PATROL_RADIUS` of the NPC's home anchor — falls back to the anchor itself if nothing
 * turns up nearby (e.g. every connected segment happens to be a long one), so an NPC always has
 * a valid, on-street target without ever needing to roam far to find one. */
function pickPatrolTarget(
  anchorPoint: { x: number; y: number },
  candidateSegments: StreetSegment[]
): { x: number; y: number } {
  for (let attempt = 0; attempt < 12; attempt++) {
    const point = randomPointOnSegment(
      candidateSegments[Math.floor(Math.random() * candidateSegments.length)]
    );
    if (Math.hypot(point.x - anchorPoint.x, point.y - anchorPoint.y) <= NPC_PATROL_RADIUS) {
      return point;
    }
  }
  return anchorPoint;
}

/** Every street NPC now shares the exact same walking-person glyph as the player, so without some
 * per-NPC variation the whole street would be identical figures. A `hue-rotate` filter on the whole
 * glyph was tried first and rejected: it shifts every colored pixel together, which recolors the
 * skin tone right along with the clothes (reported as "skin isn't human-coloured any more" — a real
 * bug, not a style nitpick). Emoji glyphs have no separate, addressable "clothing" layer to filter
 * in isolation, so instead of touching the glyph at all, a small solid-color patch is drawn over
 * just the torso — the glyph itself (skin included) renders completely untouched underneath/around
 * it. Hash of the id keeps each NPC's color fixed across renders instead of flickering randomly. */
function npcClothingColor(npcId: string): string {
  let hash = 0;
  for (let i = 0; i < npcId.length; i++) hash += npcId.charCodeAt(i);
  return `hsl(${hash % 360}, 65%, 42%)`;
}

function initNpcSim(npc: StreetNpc): NpcSimState {
  const nearest = nearestStreetSegment(npc.anchor, npc.islandId);
  if (!nearest) {
    // No streets registered for this island — stay put rather than crash; shouldn't happen for
    // any island that actually has street NPCs.
    return {
      x: npc.anchor.x,
      y: npc.anchor.y,
      targetX: npc.anchor.x,
      targetY: npc.anchor.y,
      candidateSegments: [],
      anchorPoint: npc.anchor,
    };
  }
  const candidateSegments = connectedSegments(nearest.segment, npc.islandId);
  const anchorPoint = nearest.point;
  const target = pickPatrolTarget(anchorPoint, candidateSegments);
  return {
    x: anchorPoint.x,
    y: anchorPoint.y,
    targetX: target.x,
    targetY: target.y,
    candidateSegments,
    anchorPoint,
  };
}
const TICK_MS = 33;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function MapScreen({ navigation }: Props) {
  const isFocused = useIsFocused();
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [player, setPlayer] = useState(START_POSITION);
  const [dragKnob, setDragKnob] = useState<{ x: number; y: number } | null>(null);
  const [dragOrigin, setDragOrigin] = useState<{ x: number; y: number } | null>(null);
  const [zoneLabel, setZoneLabel] = useState('Tortuga Cove');
  const [zoneDescription, setZoneDescription] = useState(
    'Your home port. Calm waters, no trouble here.'
  );

  const crew = useGameStore((s) => s.crew);
  const gold = useGameStore((s) => s.gold);
  const heat = useGameStore((s) => s.heat);
  const healAllCrew = useGameStore((s) => s.healAllCrew);
  const setWildEncounter = useGameStore((s) => s.setWildEncounter);
  const addHeat = useGameStore((s) => s.addHeat);
  const setCurrentBuilding = useGameStore((s) => s.setCurrentBuilding);
  const defeatedLordIds = useGameStore((s) => s.defeatedLordIds);
  const setCurrentPirateLord = useGameStore((s) => s.setCurrentPirateLord);
  const acceptedQuestIds = useGameStore((s) => s.acceptedQuestIds);
  const completedQuestIds = useGameStore((s) => s.completedQuestIds);
  const setCurrentSideQuest = useGameStore((s) => s.setCurrentSideQuest);
  const gatherResource = useGameStore((s) => s.gatherResource);
  const resourceNodeCooldowns = useGameStore((s) => s.resourceNodeCooldowns);
  const shipUpgrades = useGameStore((s) => s.shipUpgrades);
  const salvageCooldowns = useGameStore((s) => s.salvageCooldowns);
  const salvageSite = useGameStore((s) => s.salvageSite);
  const foundTreasureIds = useGameStore((s) => s.foundTreasureIds);
  const findTreasureSite = useGameStore((s) => s.findTreasureSite);
  const inventory = useGameStore((s) => s.inventory);
  const completedBlackfinStageIds = useGameStore((s) => s.completedBlackfinStageIds);
  const setCurrentBlackfinStage = useGameStore((s) => s.setCurrentBlackfinStage);
  const completedGraceStageIds = useGameStore((s) => s.completedGraceStageIds);
  const setCurrentGraceStage = useGameStore((s) => s.setCurrentGraceStage);
  const capturedCrew = useGameStore((s) => s.capturedCrew);
  const blackPearlCaptured = useGameStore((s) => s.blackPearlCaptured);
  const blackPearlBoarded = useGameStore((s) => s.blackPearlBoarded);
  const blackPearlPosition = useGameStore((s) => s.blackPearlPosition);
  const boardBlackPearl = useGameStore((s) => s.boardBlackPearl);
  const disembarkBlackPearl = useGameStore((s) => s.disembarkBlackPearl);
  const [resourceToast, setResourceToast] = useState<string | null>(null);
  const resourceToastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Walking near a building now just offers to let you in — it doesn't yank you inside — so you
  // can pass right by without stopping if you didn't actually want to go in.
  const [nearbyBuildingPrompt, setNearbyBuildingPrompt] = useState<Building | null>(null);
  const nearbyBuildingPromptIdRef = useRef<string | null>(null);
  // The Black Pearl is a single fixed entity (not a list of ids), so a plain boolean pair does
  // the same "don't re-set state every tick while still standing next to it" job the building
  // prompt's id-ref does.
  const [showBoardPrompt, setShowBoardPrompt] = useState(false);
  const boardPromptShownRef = useRef(false);
  const lastLandmarkIdRef = useRef<string | null>(null);
  const lastStreetNpcIdRef = useRef<string | null>(null);
  const [, setWanderTick] = useState(0);
  const npcSimRef = useRef<Map<string, NpcSimState>>(new Map());

  const directionRef = useRef<{ x: number; y: number } | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  // The walking-man glyph's native art faces left, so "facing right" is the one that needs a flip.
  const [facingRight, setFacingRight] = useState(false);
  // Side-profile emoji only reads left/right; swap to a front-facing glyph when the drag is mostly
  // vertical so walking toward/away from the camera actually looks different from walking sideways.
  const [facingMode, setFacingMode] = useState<'side' | 'front'>('side');
  // True 8-directional facing for Captain Scally's sprite art (on land only — the sea token is
  // still the ship emoji, no ship sprite was cut). Bucketed the same way as the Black Pearl's own
  // `shipHeading` below (headingFromVector on the same drag vector) now that real diagonal walk art
  // exists — the old 4-cardinal-only hysteresis bucketing and its mid-turn pivot-flash workaround
  // are gone (see scallySprites.ts). Drives which of the 8 sliced walk-cycle frame sets to show;
  // walkSpriteFrame cycles through that set's own frame count (6 or 7) while isMoving.
  const [facingDir, setFacingDir] = useState<FacingDirection>('s');
  const [walkSpriteFrame, setWalkSpriteFrame] = useState(0);
  // The idle breathing loop's own frame counter, cycled by a separate, slower interval than the
  // walk cycle's — see IDLE_SOURCES' doc comment in scallySprites.ts for why this is safe now.
  const [idleSpriteFrame, setIdleSpriteFrame] = useState(0);
  // Overrides the normal walk/idle render with one of Scally's single-frame emote poses for a fixed
  // hold time — see the effects below for the two triggers (door greeting, quest/lord win). Cleared
  // immediately if isMoving flips true while one is showing, so an emote can never freeze a stride
  // (the actual bug in item 79's first attempt was elsewhere — see scallySprites.ts — but this guard
  // costs nothing and removes any risk of repeating it).
  const [emoteOverlay, setEmoteOverlay] = useState<{ source: any } | null>(null);
  const emoteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // The "prolonged idle" flourish — a full multi-frame animated vignette (juggling coins, reading
  // a map, dozing off, ...), distinct from the single-frame emotes above. Holds which flourish is
  // showing and its own frame counter, cycled by a dedicated interval at IDLE_FLOURISH_FRAME_MS
  // while set — see IDLE_FLOURISHES' doc comment in scallySprites.ts for why this replaced the old
  // single-static-pose pool.
  const [idleFlourish, setIdleFlourish] = useState<IdleFlourish | null>(null);
  const [idleFlourishFrame, setIdleFlourishFrame] = useState(0);
  const idleFlourishTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleFlourishHoldTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleFlourishFrameIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevDefeatedLordCountRef = useRef(defeatedLordIds.length);
  const prevCompletedQuestCountRef = useRef(completedQuestIds.length);
  // On-foot equivalent of shipStopSkid — flashes right as a forced (not-boarded) fight triggers.
  const [scallyAttackFlash, setScallyAttackFlash] = useState<'attack' | 'sword_ready' | null>(null);
  // Transient override for the header portrait's mood badge — a happy/laugh flash on a real win, or
  // an occasional idle wink while heat is totally clear. Takes priority over the plain heat-tier
  // face computed at render time below.
  const [captainFaceOverride, setCaptainFaceOverride] = useState<any>(null);
  const captainFaceOverrideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Cheeky blinks every so often while perched on the docked, unboarded Black Pearl (see the ship
  // marker render below) — see monkeySprites.ts for why he lives there instead of trailing on foot.
  const [monkeyWinking, setMonkeyWinking] = useState(false);
  const showMonkeyOnDeck = !blackPearlBoarded && !blackPearlCaptured;
  useEffect(() => {
    if (!showMonkeyOnDeck) return;
    const id = setInterval(() => {
      setMonkeyWinking(true);
      setTimeout(() => setMonkeyWinking(false), MONKEY_WINK_HOLD_MS);
    }, MONKEY_WINK_INTERVAL_MS);
    return () => clearInterval(id);
  }, [showMonkeyOnDeck]);
  // The Black Pearl's own 8-way facing, driven by the same drag vector as facingDir above but
  // bucketed finer (the ship sheet was cut with real diagonal poses, unlike Scally's 4-direction
  // walk cycle). Only rendered while boarded, but harmless to keep updating unconditionally.
  const [shipHeading, setShipHeading] = useState<ShipHeading>('s');
  // Swaps the normal directional sprite for the sheet's 3-frame "APPROACH DOCK" loop once the
  // ship closes in on a pier, per the user's ask to use those frames on the way in.
  const [shipApproaching, setShipApproaching] = useState(false);
  const [shipApproachFrame, setShipApproachFrame] = useState(0);
  const shipApproachingRef = useRef(false);
  // Sails actually come down (furled DEPART_SPRITE pose) once she's within SHIP_FURL_RADIUS of a
  // real pier, still under way — pier-only, see SHIP_FURL_RADIUS's doc comment for why.
  const [shipFurling, setShipFurling] = useState(false);
  const shipFurlingRef = useRef(false);
  // Held for a beat right as the player re-boards, so pulling off the pier reads as a depart
  // instead of an instant cut from the docked marker to a mid-sail pose.
  const [shipDeparting, setShipDeparting] = useState(false);
  // Second beat of the depart sequence — the "Accelerate" pose, held briefly right after the
  // depart flash, once she's clear of the pier and picking up speed.
  const [shipAccelerating, setShipAccelerating] = useState(false);
  // A brief banked pose (left or right) shown right after shipHeading changes — see
  // turnDirectionFor's doc comment. Scally's own on-foot equivalent (turningFrame) was removed once
  // real 8-directional walk art made a pivot-flash workaround unnecessary (see scallySprites.ts).
  const [shipTurnBank, setShipTurnBank] = useState<'left' | 'right' | null>(null);
  const prevShipHeadingRef = useRef<ShipHeading>('s');
  // A wide "Stop/Skid" flash the instant a fight interrupts a sail (see startEncounter) — reads
  // as the ship being intercepted rather than an instant cut to the battle screen.
  const [shipStopSkid, setShipStopSkid] = useState(false);
  // The merchant vessel glimpsed crossing the Black Pearl's path right as triggerMerchant fires —
  // real 8-directional boat art (see shipSprites.ts's BOAT_DIRECTION_SOURCES) instead of the old
  // invisible instant-cut-to-battle behavior. Cleared alongside shipStopSkid once the flash ends.
  const [merchantShipFlash, setMerchantShipFlash] = useState<{ templateId: string; heading: ShipHeading } | null>(
    null
  );
  // How far the joystick is pushed (0-1 past the deadzone), used to scale the wake's size —
  // a light nudge trails a small wake, a full push trails the big one.
  const [dragIntensity, setDragIntensity] = useState(0);
  // Continuous gentle sway while boarded and drifting (not actively sailing, not docked) —
  // stacks with walkBounce below so she never looks frozen sitting on open water.
  const shipIdleSway = useRef(new Animated.Value(0)).current;
  const shipIdleLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const walkBounce = useRef(new Animated.Value(0)).current;
  const walkLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const playerRef = useRef(player);
  const lastZoneIdRef = useRef<string | null>('tortuga_cove');
  // GTA-style minimap heading arrow: remembers the last real movement direction so the arrow
  // doesn't snap back to "north" the instant the player lets go of the drag.
  const lastFacingAngleRef = useRef(0);
  const lastEncounterCheckRef = useRef(0);
  const crewRef = useRef(crew);
  crewRef.current = crew;
  const heatRef = useRef(heat);
  heatRef.current = heat;
  const shipUpgradesRef = useRef(shipUpgrades);
  shipUpgradesRef.current = shipUpgrades;
  const blackPearlCapturedRef = useRef(blackPearlCaptured);
  blackPearlCapturedRef.current = blackPearlCaptured;
  const blackPearlBoardedRef = useRef(blackPearlBoarded);
  blackPearlBoardedRef.current = blackPearlBoarded;
  const shipHeadingRef = useRef(shipHeading);
  shipHeadingRef.current = shipHeading;
  const blackPearlPositionRef = useRef(blackPearlPosition);
  blackPearlPositionRef.current = blackPearlPosition;
  const dragOriginRef = useRef<{ x: number; y: number } | null>(null);
  const dragResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearDrag() {
    // Movement stops the instant this runs, regardless of the visual cleanup below — direction
    // is a ref, not state, so there's no render delay between "released" and "actually stopped."
    directionRef.current = null;
    setIsMoving(false);

    // The native gesture's onFinalize and the window-level safety-net listener below both fire
    // for the same physical release, so this runs twice per release by design. If a snap-back is
    // already scheduled, let it finish rather than letting the second call cut it short.
    if (dragResetTimeoutRef.current) return;

    // Snap the knob back to dead-center of the base immediately (matches a real joystick),
    // then let the whole control fade out a moment later instead of vanishing mid-snap.
    const origin = dragOriginRef.current;
    dragOriginRef.current = null;
    if (origin) {
      setDragKnob({ ...origin });
      dragResetTimeoutRef.current = setTimeout(() => {
        setDragOrigin(null);
        setDragKnob(null);
        dragResetTimeoutRef.current = null;
      }, 150);
    } else {
      setDragOrigin(null);
      setDragKnob(null);
    }
  }

  // Safety net: react-native-gesture-handler's web implementation can occasionally miss firing
  // onFinalize on a real touchscreen (a swallowed touchend/touchcancel), which would otherwise
  // leave the joystick and movement direction stuck. A window-level listener guarantees release
  // is never missed — clearDrag() is a no-op when nothing is being dragged, so this is always safe.
  const clearDragRef = useRef(clearDrag);
  clearDragRef.current = clearDrag;
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const handleRelease = () => clearDragRef.current();
    window.addEventListener('pointerup', handleRelease);
    window.addEventListener('pointercancel', handleRelease);
    window.addEventListener('touchend', handleRelease);
    window.addEventListener('touchcancel', handleRelease);
    return () => {
      window.removeEventListener('pointerup', handleRelease);
      window.removeEventListener('pointercancel', handleRelease);
      window.removeEventListener('touchend', handleRelease);
      window.removeEventListener('touchcancel', handleRelease);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (dragResetTimeoutRef.current) clearTimeout(dragResetTimeoutRef.current);
    };
  }, []);

  // Losing focus can happen mid-drag (an ambush/wild encounter fires and navigates away while a
  // finger is still down), which the gesture's own onFinalize never sees since it's the screen
  // being hidden, not the touch being released, that ends the interaction. Force a full reset the
  // instant focus is lost so nothing — direction, joystick position, the pending snap-back timer —
  // survives to be read stale when the player comes back.
  useEffect(() => {
    if (isFocused) return;
    directionRef.current = null;
    setIsMoving(false);
    dragOriginRef.current = null;
    setDragOrigin(null);
    setDragKnob(null);
    if (dragResetTimeoutRef.current) {
      clearTimeout(dragResetTimeoutRef.current);
      dragResetTimeoutRef.current = null;
    }
  }, [isFocused]);

  // React Navigation keeps MapScreen mounted (just hidden) underneath Encounter/Building/PirateLord/
  // SideQuest/Rescue while they're on top, so without `.enabled(isFocused)` this gesture keeps
  // listening the whole time you're on one of those screens. A stray touch reaching it there would
  // leave `directionRef` holding a leftover direction that the movement loop — gated on focus, but
  // never itself reset by a focus change — would immediately act on the moment you came back,
  // reading as the character moving on its own or the joystick responding wrong right after leaving
  // a building/fight/menu.
  const panGesture = Gesture.Pan()
    .enabled(isFocused)
    .minDistance(0)
    .shouldCancelWhenOutside(false)
    .onBegin((e) => {
      if (dragResetTimeoutRef.current) {
        clearTimeout(dragResetTimeoutRef.current);
        dragResetTimeoutRef.current = null;
      }
      // The player token is always fixed at the exact center of the screen, so anchor the
      // joystick there too — not at the touch point — so it visibly surrounds the character
      // regardless of where on screen the drag starts.
      const center = { x: viewport.width / 2, y: viewport.height / 2 };
      dragOriginRef.current = center;
      setDragOrigin(center);
      setDragKnob(center);
    })
    .onUpdate((e) => {
      const dist = Math.hypot(e.translationX, e.translationY);
      if (dist > DEADZONE) {
        const clampedDist = Math.min(dist, MAX_DRAG);
        directionRef.current = {
          x: (e.translationX / dist) * (clampedDist / MAX_DRAG),
          y: (e.translationY / dist) * (clampedDist / MAX_DRAG),
        };
        setIsMoving(true);
        if (e.translationX !== 0) setFacingRight(e.translationX > 0);
        setFacingMode(Math.abs(e.translationY) > Math.abs(e.translationX) ? 'front' : 'side');
        // Now that real 8-directional walk art exists, Scally's facing buckets off the exact same
        // drag vector the same way the Black Pearl's shipHeading already does — no more separate
        // 4-way hysteresis system or its mid-turn pivot-flash workaround (see scallySprites.ts).
        const dir = headingFromVector(e.translationX, e.translationY);
        setFacingDir(dir);
        setShipHeading(dir);
        setDragIntensity(clampedDist / MAX_DRAG);
      } else {
        // Real movement stops here exactly as before, at DEADZONE — no gameplay change. Only the
        // animation-facing isMoving flag gets the lower STOP_DEADZONE threshold (see its const doc
        // comment): between the two, isMoving is simply left alone rather than forced false.
        directionRef.current = null;
        setDragIntensity(0);
        if (dist < STOP_DEADZONE) setIsMoving(false);
      }
      const origin = dragOriginRef.current;
      if (origin) {
        const knobDist = Math.min(dist, MAX_DRAG);
        const angle = Math.atan2(e.translationY, e.translationX);
        setDragKnob({
          x: origin.x + Math.cos(angle) * knobDist,
          y: origin.y + Math.sin(angle) * knobDist,
        });
      }
    })
    .onFinalize(() => {
      clearDrag();
    });

  function onLayoutContainer(event: LayoutChangeEvent) {
    const { width, height } = event.nativeEvent.layout;
    setViewport({ width, height });
  }

  function startEncounter(
    templateId: string,
    level: number,
    faction: EncounterFaction,
    template: CrewTemplate,
    atPoint?: { x: number; y: number } | null,
    forcedBackdrop?: BattleBackdrop
  ) {
    const wildMaxHp = maxHpFor(
      {
        instanceId: 'wild',
        templateId,
        nickname: template.name,
        level,
        xp: 0,
        currentHp: 0,
      },
      template
    );
    directionRef.current = null;
    const backdrop = forcedBackdrop ?? classifyBackdrop(atPoint === undefined ? playerRef.current : atPoint);
    const fire = () => {
      setWildEncounter({ templateId, level, currentHp: wildMaxHp, faction, backdrop });
      navigation.navigate('Encounter');
    };
    // A fight breaking out mid-sail reads as the ship being intercepted — flash the "Stop/Skid"
    // pose for a beat before cutting to the battle screen, instead of an instant cut. Gated on
    // being boarded rather than on which particular encounter this is (wild sea encounter,
    // merchant ship, the Odessa Kane duel), since all of them are "something stops the ship."
    if (blackPearlBoardedRef.current) {
      setShipStopSkid(true);
      setTimeout(() => {
        setShipStopSkid(false);
        setMerchantShipFlash(null);
        fire();
      }, STOP_SKID_ANIMATION_MS);
    } else {
      // On-foot equivalent of the ship's Stop/Skid flash above: a forced fight not at sea flashes
      // attack then sword-ready for a beat each before cutting to the battle screen, instead of an
      // instant cut. Also clears any showing emote outright — a duel starting is a harder interrupt
      // than ordinary movement, so it doesn't wait for the emote's own hold timer to finish.
      setEmoteOverlay(null);
      setScallyAttackFlash('attack');
      setTimeout(() => {
        setScallyAttackFlash('sword_ready');
        setTimeout(() => {
          setScallyAttackFlash(null);
          fire();
        }, ATTACK_FLASH_MS);
      }, ATTACK_FLASH_MS);
    }
  }

  function triggerEncounter(isLand: boolean, islandId: string | null, atPoint: { x: number; y: number }) {
    const island = islandId ? ISLAND_LIST.find((i) => i.id === islandId) : null;
    const table = isLand && island ? island.encounterTable : SEA_ENCOUNTER_TABLE;
    if (table.length === 0) return;

    const isAlive = crewRef.current.some((member) => member.currentHp > 0);
    if (!isAlive) return;

    const { templateId, level } = pickWildEncounter(table);
    startEncounter(templateId, level, 'wild', CREW_TEMPLATES[templateId], atPoint);
  }

  function triggerAmbush(faction: ThreatFaction, atPoint: { x: number; y: number }) {
    const table = faction === 'rival' ? rivalTableForHeat(heatRef.current) : navyTableForHeat(heatRef.current);
    if (!table) return;

    const isAlive = crewRef.current.some((member) => member.currentHp > 0);
    if (!isAlive) return;

    const { templateId, level } = pickWildEncounter(table);
    startEncounter(templateId, level, faction, THREAT_TEMPLATES[templateId], atPoint);
  }

  function triggerMerchant(atPoint: { x: number; y: number }) {
    const isAlive = crewRef.current.some((member) => member.currentHp > 0);
    if (!isAlive) return;

    const { templateId, level } = pickWildEncounter(MERCHANT_ENCOUNTER_TABLE);
    // Show her crossing our path — real boat art instead of the old invisible instant-cut. Only
    // fires the flash while boarded (matches startEncounter's own stop-skid gate below); on foot
    // there's no ship on screen for a merchant vessel to cross paths with.
    if (blackPearlBoardedRef.current) {
      setMerchantShipFlash({ templateId, heading: oppositeHeading(shipHeadingRef.current) });
    }
    startEncounter(templateId, level, 'merchant', MERCHANT_TEMPLATES[templateId], atPoint);
  }

  function nearbyLordPos(pos: { x: number; y: number }, island: { id: string; position: { x: number; y: number } }) {
    const lord = pirateLordForIsland(island.id);
    if (!lord) return null;
    const lp = pirateLordWorldPosition(lord, island.position);
    return Math.hypot(pos.x - lp.x, pos.y - lp.y) <= ENTER_RADIUS ? lp : null;
  }

  function nearbySideQuestPos(pos: { x: number; y: number }, island: { id: string; position: { x: number; y: number } }) {
    const quest = SIDE_QUESTS.find((q) => {
      if (q.islandId !== island.id || !q.offset) return false;
      const qp = sideQuestWorldPosition(q as SideQuest & { offset: { x: number; y: number } }, island.position);
      return Math.hypot(pos.x - qp.x, pos.y - qp.y) <= ENTER_RADIUS;
    });
    return quest && quest.offset
      ? sideQuestWorldPosition(quest as SideQuest & { offset: { x: number; y: number } }, island.position)
      : null;
  }

  function nearbyRescuePointPos(pos: { x: number; y: number }, island: { id: string; position: { x: number; y: number } }) {
    if (RESCUE_POINT.islandId !== island.id) return null;
    const rp = rescuePointWorldPosition(island.position);
    return Math.hypot(pos.x - rp.x, pos.y - rp.y) <= ENTER_RADIUS ? rp : null;
  }

  // Unlike every other "nearby" helper, the Black Pearl isn't tied to a specific island — she
  // parks wherever the player last made landfall, so this checks the player's position against
  // her live, mutable world position directly instead of resolving an island-relative offset.
  function nearbyBlackPearlPos(pos: { x: number; y: number }) {
    const bp = blackPearlPositionRef.current;
    return Math.hypot(pos.x - bp.x, pos.y - bp.y) <= ENTER_RADIUS ? bp : null;
  }

  function nearbyLandmark(pos: { x: number; y: number }, island: { id: string; position: { x: number; y: number } }) {
    return LANDMARKS.find((landmark) => {
      if (landmark.islandId !== island.id) return false;
      const lp = landmarkWorldPosition(landmark, island.position);
      return Math.hypot(pos.x - lp.x, pos.y - lp.y) <= ENTER_RADIUS;
    });
  }

  function nearbyStreetNpc(pos: { x: number; y: number }, island: { id: string; position: { x: number; y: number } }) {
    return STREET_NPCS.find((npc) => {
      if (npc.islandId !== island.id) return false;
      const sim = npcSimRef.current.get(npc.id);
      if (!sim) return false;
      const world = { x: island.position.x + sim.x, y: island.position.y + sim.y };
      return Math.hypot(pos.x - world.x, pos.y - world.y) <= ENTER_RADIUS;
    });
  }

  function showResourceToast(message: string, durationMs = 2200) {
    setResourceToast(message);
    if (resourceToastTimeoutRef.current) clearTimeout(resourceToastTimeoutRef.current);
    resourceToastTimeoutRef.current = setTimeout(() => setResourceToast(null), durationMs);
  }

  function confirmEnterBuilding() {
    if (!nearbyBuildingPrompt) return;
    directionRef.current = null;
    nearbyBuildingPromptIdRef.current = null;
    setNearbyBuildingPrompt(null);
    setCurrentBuilding(nearbyBuildingPrompt.id);
    navigation.navigate('Building');
  }

  function confirmBoardBlackPearl() {
    boardPromptShownRef.current = false;
    setShowBoardPrompt(false);
    directionRef.current = null;
    blackPearlBoardedRef.current = true;
    boardBlackPearl();
    // Two-stage depart: the "DEPART DOCK" pose (furled sail, still shows the pier under her) for a
    // beat, then the "Accelerate" pose (full sail, open water, picking up speed) for a second beat,
    // before falling back to normal directional sailing art — reads as pulling off the pier and
    // getting under way, not one flat cut. Only played when she's actually at a real pier — the
    // depart sprite bakes in dock posts, which would float over open water on a beach reboarding
    // (see SHIP_FURL_RADIUS's doc comment); boarding from a plain coastline skips straight to
    // normal sailing instead.
    if (distanceToNearestPier(blackPearlPositionRef.current) <= SHIP_FURL_RADIUS) {
      setShipDeparting(true);
      setTimeout(() => {
        setShipDeparting(false);
        setShipAccelerating(true);
        setTimeout(() => setShipAccelerating(false), ACCELERATE_ANIMATION_MS);
      }, DEPART_ANIMATION_MS);
    }
  }

  useEffect(() => {
    return () => {
      if (resourceToastTimeoutRef.current) clearTimeout(resourceToastTimeoutRef.current);
    };
  }, []);

  // Same "moving, side-facing, above the heat threshold" test the run-cycle render uses further
  // down — recomputed here directly from `player` rather than shared, since this effect runs
  // earlier in the component than `currentIsland` is otherwise derived. Only used to dampen the
  // bounce below during a run swap — see RUN_HEAT_THRESHOLD's doc comment in scallySprites.ts for
  // why the swap needed this instead of the walk cycle's full -6px bounce. Still gated on due-east/
  // due-west only ('w'/'e', the old 'left'/'right') — RUN_SOURCES is a single side-view pose set
  // with no directional variants, so the other 6 headings (including the 4 new diagonals) keep
  // using the plain walk cycle instead of running sideways at an angle that doesn't match the pose.
  const isRunning =
    isMoving &&
    !!islandAtPoint(player) &&
    (facingDir === 'w' || facingDir === 'e') &&
    heat > RUN_HEAT_THRESHOLD * 100;

  // Single-glyph "walk cycle": bob the player emoji up and down in a loop while actively moving,
  // settle back to rest the moment movement stops. No spritesheet, so this is the whole animation.
  // Dampened to a smaller amplitude while running — the run pose's own bigger stride already reads
  // as more motion, and the full walk-cycle bounce on top of it was what made the run swap read as
  // a pop rather than a smooth speed-up (see scallySprites.ts's run-cycle comment).
  useEffect(() => {
    if (isMoving) {
      const bounceHeight = isRunning ? -3 : -6;
      walkLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(walkBounce, {
            toValue: bounceHeight,
            duration: 160,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(walkBounce, {
            toValue: 0,
            duration: 160,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
      walkLoopRef.current.start();
    } else {
      walkLoopRef.current?.stop();
      Animated.timing(walkBounce, { toValue: 0, duration: 120, useNativeDriver: true }).start();
    }
    return () => walkLoopRef.current?.stop();
  }, [isMoving, isRunning, walkBounce]);

  // Cycles Captain Scally's sprite through its 5-frame walk cycle while moving; holds on the
  // neutral frame (index 0) the instant movement stops, same beat as the emoji bounce above.
  useEffect(() => {
    if (!isMoving) {
      setWalkSpriteFrame(0);
      return;
    }
    const id = setInterval(() => {
      setWalkSpriteFrame((f) => (f + 1) % WALK_FRAME_COUNT);
    }, 110);
    return () => clearInterval(id);
  }, [isMoving]);

  // Idle breathing loop — a slow 3-frame standing/shifting-weight cycle, independent of the walk
  // cycle's own (much faster) interval above. Only runs while genuinely stationary; resets to frame
  // 0 the moment movement resumes, so a real start always begins from the same standing pose rather
  // than mid-breath. Safe now that isMoving itself is debounced (STOP_DEADZONE, above) — see
  // IDLE_SOURCES' doc comment in scallySprites.ts for the history here.
  useEffect(() => {
    if (isMoving) {
      setIdleSpriteFrame(0);
      return;
    }
    const id = setInterval(() => {
      setIdleSpriteFrame((f) => (f + 1) % IDLE_FRAME_COUNT);
    }, 450);
    return () => clearInterval(id);
  }, [isMoving]);

  function flashEmote(source: any, holdMs: number) {
    if (emoteTimeoutRef.current) clearTimeout(emoteTimeoutRef.current);
    setEmoteOverlay({ source });
    emoteTimeoutRef.current = setTimeout(() => setEmoteOverlay(null), holdMs);
  }

  function flashCaptainFace(source: any, holdMs: number) {
    if (captainFaceOverrideTimeoutRef.current) clearTimeout(captainFaceOverrideTimeoutRef.current);
    setCaptainFaceOverride(source);
    captainFaceOverrideTimeoutRef.current = setTimeout(() => setCaptainFaceOverride(null), holdMs);
  }

  // Wave greeting: fires the instant a building's enter-prompt appears (the same `nearbyBuildingPrompt`
  // transition the prompt UI itself renders off of), gated on `!isMoving` since walking past a
  // building shouldn't interrupt the stride to wave at it.
  useEffect(() => {
    if (nearbyBuildingPrompt && !isMoving) {
      flashEmote(EMOTE_WAVE, WAVE_ANIMATION_MS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fires once per prompt appearing, not
    // once per render while it's showing.
  }, [nearbyBuildingPrompt]);

  // Victory flourish + a happy/laugh face flash, the instant defeatedLordIds/completedQuestIds grows
  // (a Pirate Lord fell or a side quest completed, possibly from another screen). Lord defeats get
  // the bigger LAUGH face; ordinary quest completions get HAPPY. Body emote only shows if currently
  // stationary — same guard as the wave above — but the face badge flash isn't tied to movement at
  // all (it's a header UI overlay, not part of the on-map sprite), so it always fires.
  useEffect(() => {
    const grew =
      defeatedLordIds.length > prevDefeatedLordCountRef.current ||
      completedQuestIds.length > prevCompletedQuestCountRef.current;
    const lordGrew = defeatedLordIds.length > prevDefeatedLordCountRef.current;
    prevDefeatedLordCountRef.current = defeatedLordIds.length;
    prevCompletedQuestCountRef.current = completedQuestIds.length;
    if (!grew) return;
    if (!isMoving) flashEmote(EMOTE_VICTORY, VICTORY_ANIMATION_MS);
    flashCaptainFace(lordGrew ? FACE_LAUGH : FACE_HAPPY, VICTORY_ANIMATION_MS);
  }, [defeatedLordIds.length, completedQuestIds.length, isMoving]);

  // Idle flourish: after standing still for IDLE_FLOURISH_DELAY_MS, play a random one of the
  // animated flourishes for IDLE_FLOURISH_HOLD_MS before returning to the ordinary breathing loop —
  // the "idle animation after inactivity" trick. Cancels cleanly the moment movement resumes.
  useEffect(() => {
    if (isMoving) {
      if (idleFlourishTimerRef.current) {
        clearTimeout(idleFlourishTimerRef.current);
        idleFlourishTimerRef.current = null;
      }
      return;
    }
    idleFlourishTimerRef.current = setTimeout(() => {
      const pick = IDLE_FLOURISHES[Math.floor(Math.random() * IDLE_FLOURISHES.length)];
      setIdleFlourish(pick);
      setIdleFlourishFrame(0);
      idleFlourishHoldTimeoutRef.current = setTimeout(() => setIdleFlourish(null), IDLE_FLOURISH_HOLD_MS);
    }, IDLE_FLOURISH_DELAY_MS);
    return () => {
      if (idleFlourishTimerRef.current) clearTimeout(idleFlourishTimerRef.current);
    };
  }, [isMoving]);

  // Cycles the showing flourish's own frames while it's up; stops (and the render falls back to the
  // ordinary breathing loop) the instant idleFlourish clears, whether that's the hold timeout above
  // or movement resuming below.
  useEffect(() => {
    if (!idleFlourish) return;
    idleFlourishFrameIntervalRef.current = setInterval(() => {
      setIdleFlourishFrame((f) => (f + 1) % idleFlourish.frames.length);
    }, IDLE_FLOURISH_FRAME_MS);
    return () => {
      if (idleFlourishFrameIntervalRef.current) clearInterval(idleFlourishFrameIntervalRef.current);
    };
  }, [idleFlourish]);

  // Drop any showing emote/flourish immediately if movement resumes — the actual bug item 79's
  // first attempt hit (an emote freezing the stride) would have to slip past both this and each
  // trigger's own `!isMoving` gate above to recur.
  useEffect(() => {
    if (!isMoving) return;
    if (emoteOverlay) setEmoteOverlay(null);
    if (idleFlourish) {
      setIdleFlourish(null);
      if (idleFlourishHoldTimeoutRef.current) {
        clearTimeout(idleFlourishHoldTimeoutRef.current);
        idleFlourishHoldTimeoutRef.current = null;
      }
    }
  }, [isMoving, emoteOverlay, idleFlourish]);

  // Captain's idle wink: while heat is completely clear (no badge would otherwise show), Scally
  // occasionally winks for a beat — the same idle-personality mechanism already shipped for Cheeky
  // the monkey (see MONKEY_WINK_INTERVAL_MS above), just applied to the header portrait instead of
  // the docked ship.
  useEffect(() => {
    if (heat > 25) return;
    const id = setInterval(() => {
      flashCaptainFace(FACE_WINK, MONKEY_WINK_HOLD_MS);
    }, MONKEY_WINK_INTERVAL_MS);
    return () => clearInterval(id);
  }, [heat]);

  // Cycles the Black Pearl's 3-frame "APPROACH DOCK" loop while she's lined up on a pier.
  useEffect(() => {
    if (!shipApproaching) {
      setShipApproachFrame(0);
      return;
    }
    const id = setInterval(() => {
      setShipApproachFrame((f) => (f + 1) % SHIP_APPROACH_FRAMES.length);
    }, 220);
    return () => clearInterval(id);
  }, [shipApproaching]);

  // Same idea, for the ship: whenever shipHeading changes, bank left or right for a beat before
  // settling into the new heading's normal sailing sprite.
  useEffect(() => {
    const prev = prevShipHeadingRef.current;
    prevShipHeadingRef.current = shipHeading;
    if (prev === shipHeading) return;
    const direction = turnDirectionFor(prev, shipHeading);
    if (!direction) return;
    setShipTurnBank(direction);
    const id = setTimeout(() => setShipTurnBank(null), SHIP_TURN_ANIMATION_MS);
    return () => clearTimeout(id);
  }, [shipHeading]);

  // Street NPCs wander the real street network near their home spot: walk toward a random point
  // on their current/connected street segments, collide with houses same as the player, and pick
  // a new random target on arrival — independent of the main movement tick loop.
  useEffect(() => {
    if (!isFocused) return;
    const wanderInterval = setInterval(() => {
      const dt = 0.25;
      for (const npc of STREET_NPCS) {
        let sim = npcSimRef.current.get(npc.id);
        if (!sim) {
          sim = initNpcSim(npc);
          npcSimRef.current.set(npc.id, sim);
        }
        if (sim.candidateSegments.length === 0) continue; // no streets on this island — stays put

        const dx = sim.targetX - sim.x;
        const dy = sim.targetY - sim.y;
        const dist = Math.hypot(dx, dy);
        if (dist < NPC_ARRIVE_RADIUS) {
          const next = pickPatrolTarget(sim.anchorPoint, sim.candidateSegments);
          sim.targetX = next.x;
          sim.targetY = next.y;
          continue;
        }

        const step = npc.speed * NPC_WANDER_SPEED_SCALE * dt;
        const raw = { x: sim.x + (dx / dist) * step, y: sim.y + (dy / dist) * step };
        // sim.x/y are island-relative (same space as street segments), so the obstacles compared
        // against them need to be too — using world positions here compared distances on the
        // order of the island's own world coordinates (thousands of units), silently defeating
        // the "blocked" check every time (never true), so NPCs never actually avoided anything.
        const houseObstacles = housesForIsland(npc.islandId).map((house) => house.offset);
        const buildingObstacles = buildingsForIsland(npc.islandId).map((building) => building.offset);
        let resolved = slideAroundObstacles(
          { x: sim.x, y: sim.y },
          raw,
          houseObstacles,
          HOUSE_COLLISION_RADIUS + NPC_COLLISION_RADIUS
        );
        resolved = slideAroundObstacles(
          { x: sim.x, y: sim.y },
          resolved,
          buildingObstacles,
          BUILDING_COLLISION_RADIUS + NPC_COLLISION_RADIUS
        );
        sim.x = resolved.x;
        sim.y = resolved.y;
      }
      setWanderTick((t) => t + 1);
    }, 250);
    return () => clearInterval(wanderInterval);
  }, [isFocused]);

  useEffect(() => {
    if (!isFocused) return;

    // Returning from the PirateLord/SideQuest/Rescue screen can leave the player still standing
    // inside that trigger's radius, which would instantly re-enter it on the next tick. Nudge them
    // just outside it first. Buildings are excluded here — they no longer auto-enter on proximity
    // (a dismissible prompt now, see nearbyBuildingPrompt), so there's nothing to instantly re-enter.
    const pos = playerRef.current;
    const island = islandAtPoint(pos);
    if (island) {
      const nearbyPos =
        nearbyLordPos(pos, island) ??
        nearbySideQuestPos(pos, island) ??
        nearbyRescuePointPos(pos, island) ??
        // Only pre-capture: the guarding captain's forced duel would otherwise instantly re-fire
        // the moment the player returns from losing it. The post-capture board prompt is a
        // dismissible UI card, not a forced navigation, so it's harmless to leave un-nudged.
        (!blackPearlCapturedRef.current ? nearbyBlackPearlPos(pos) : null);
      if (nearbyPos) {
        const bp = nearbyPos;
        let dx = pos.x - bp.x;
        let dy = pos.y - bp.y;
        let dist = Math.hypot(dx, dy);
        if (dist < 1) {
          dx = 0;
          dy = 1;
          dist = 1;
        }
        const pushDist = ENTER_RADIUS + 15;
        const houseObstacles = SHOW_HOUSES
          ? housesForIsland(island.id).map((house) => houseWorldPosition(house, island.position))
          : [];
        const clearSpot = findClearExitSpot(
          bp,
          dx,
          dy,
          dist,
          pushDist,
          houseObstacles,
          HOUSE_COLLISION_RADIUS + PLAYER_COLLISION_RADIUS
        );
        const pushed = {
          x: clamp(clearSpot.x, 0, WORLD_WIDTH),
          y: clamp(clearSpot.y, 0, WORLD_HEIGHT),
        };
        playerRef.current = pushed;
        setPlayer(pushed);
      }
    }

    const interval = setInterval(() => {
      const direction = directionRef.current;
      if (!direction) return;

      const currentIsland = islandAtPoint(playerRef.current);
      const speed = currentIsland
        ? isOnPath(playerRef.current, currentIsland)
          ? ON_PATH_SPEED
          : OFF_PATH_SPEED
        : SEA_SPEED;
      const dt = TICK_MS / 1000;

      const rawX = clamp(playerRef.current.x + direction.x * speed * dt, 0, WORLD_WIDTH);
      const rawY = clamp(playerRef.current.y + direction.y * speed * dt, 0, WORLD_HEIGHT);

      // The open sea is impassable on foot — the Black Pearl is the only way off land. Same
      // three-stage retry as the house collision below (full move, then each axis alone, then
      // stay put), just checked against "is this point open water" instead of a list of obstacle
      // circles, so the player slides along the coastline instead of hard-stopping at the shore.
      const seaBlocked = (pos: { x: number; y: number }) =>
        !blackPearlBoardedRef.current && !islandAtPoint(pos);
      let seaSafePosition = { x: rawX, y: rawY };
      if (seaBlocked(seaSafePosition)) {
        const xOnly = { x: rawX, y: playerRef.current.y };
        const yOnly = { x: playerRef.current.x, y: rawY };
        if (!seaBlocked(xOnly)) seaSafePosition = xOnly;
        else if (!seaBlocked(yOnly)) seaSafePosition = yOnly;
        else seaSafePosition = playerRef.current;
      }

      // Houses and buildings are solid — walking into one blocks that axis but still lets the
      // player slide along it on the other axis, rather than hard-stopping dead at the first
      // touch. Two sequential passes (each with its own radius) since slideAroundObstacles takes
      // one uniform keep-out radius per call and houses/buildings need different ones.
      const houseObstacles = SHOW_HOUSES && currentIsland
        ? housesForIsland(currentIsland.id).map((house) => houseWorldPosition(house, currentIsland.position))
        : [];
      const buildingObstacles = SHOW_BUILDINGS && currentIsland
        ? buildingsForIsland(currentIsland.id).map((building) =>
            buildingWorldPosition(building, currentIsland.position)
          )
        : [];
      let nextPosition = slideAroundObstacles(
        playerRef.current,
        seaSafePosition,
        houseObstacles,
        HOUSE_COLLISION_RADIUS + PLAYER_COLLISION_RADIUS
      );
      nextPosition = slideAroundObstacles(
        playerRef.current,
        nextPosition,
        buildingObstacles,
        BUILDING_COLLISION_RADIUS + PLAYER_COLLISION_RADIUS
      );

      const nextIsland = islandAtPoint(nextPosition);

      if (nextIsland?.id === 'ile_sainte_marie' && !shipUpgradesRef.current.includes('reinforced_hull')) {
        showResourceToast('⛔ Too rough without a Reinforced Hull!');
        return;
      }

      playerRef.current = nextPosition;
      setPlayer(nextPosition);

      // Swap to the "APPROACH DOCK" loop once she's closing in on land, still under sail — only
      // meaningful while boarded and still at sea (nextIsland null); once ashore the docked marker
      // takes over entirely. Checked against a pier's actual line (not just its tip) so the loop
      // starts the moment she lines up with a jetty, same radius as a building's ENTER_RADIUS logic
      // elsewhere, just wider since a ship closes distance faster than a walking player. Also
      // checked against every island's own coastline, not just Tortuga's piers — every island is a
      // potential landing, not only the one with named jetties, so the docking moment shows up
      // wherever the player actually makes for shore.
      if (blackPearlBoardedRef.current && !nextIsland) {
        const pierDist = distanceToNearestPier(nextPosition);
        const nearPier = pierDist <= SHIP_APPROACH_RADIUS;
        const nearCoast =
          !nearPier &&
          ISLAND_LIST.some((island) => {
            const shape = island.shape;
            for (let i = 0; i < shape.length; i++) {
              const a = shape[i];
              const b = shape[(i + 1) % shape.length];
              const from = { x: island.position.x + a.x, y: island.position.y + a.y };
              const to = { x: island.position.x + b.x, y: island.position.y + b.y };
              const closest = closestPointOnSegment(nextPosition, from, to);
              if (Math.hypot(nextPosition.x - closest.x, nextPosition.y - closest.y) <= SHIP_APPROACH_RADIUS) {
                return true;
              }
            }
            return false;
          });
        const nearLand = nearPier || nearCoast;
        if (nearLand !== shipApproachingRef.current) {
          shipApproachingRef.current = nearLand;
          setShipApproaching(nearLand);
        }
        // The sail only actually comes down this close to a genuine pier — see SHIP_FURL_RADIUS's
        // doc comment for why plain coastline never gets this beat.
        const furling = pierDist <= SHIP_FURL_RADIUS;
        if (furling !== shipFurlingRef.current) {
          shipFurlingRef.current = furling;
          setShipFurling(furling);
        }
      } else if (shipApproachingRef.current || shipFurlingRef.current) {
        shipApproachingRef.current = false;
        setShipApproaching(false);
        shipFurlingRef.current = false;
        setShipFurling(false);
      }

      // Making landfall while under sail auto-disembarks: the Black Pearl parks herself right
      // here, waiting to be boarded again, rather than the player staying "boarded" while walking
      // around on land. Gated on `!currentIsland` (the position *before* this tick's move) so this
      // only fires on a genuine sea-to-land transition — boarding happens while already standing
      // on land/a pier, and without this guard the very next tick (still on that same land) would
      // read as "landfall" and instantly un-board the player before they ever left the dock.
      if (nextIsland && !currentIsland && blackPearlBoardedRef.current) {
        blackPearlBoardedRef.current = false;
        blackPearlPositionRef.current = nextPosition;
        disembarkBlackPearl(nextPosition);
      }

      if (nextIsland) {
        if (!blackPearlCapturedRef.current) {
          const bpDist = Math.hypot(
            nextPosition.x - blackPearlPositionRef.current.x,
            nextPosition.y - blackPearlPositionRef.current.y
          );
          if (bpDist <= ENTER_RADIUS) {
            directionRef.current = null;
            startEncounter(
              BLACK_PEARL_CAPTAIN_TEMPLATE.id,
              BLACK_PEARL_CAPTAIN_LEVEL,
              'blackpearl',
              BLACK_PEARL_CAPTAIN_TEMPLATE,
              null,
              'sea'
            );
            return;
          }
        } else if (!blackPearlBoardedRef.current) {
          const bp = SHOW_MAP_MARKERS ? nearbyBlackPearlPos(nextPosition) : null;
          if (bp) {
            if (!boardPromptShownRef.current) {
              boardPromptShownRef.current = true;
              setShowBoardPrompt(true);
            }
          } else if (boardPromptShownRef.current) {
            boardPromptShownRef.current = false;
            setShowBoardPrompt(false);
          }
        }

        const nearbyBuilding = SHOW_BUILDINGS
          ? buildingsForIsland(nextIsland.id).find((building) => {
              const pos = buildingWorldPosition(building, nextIsland.position);
              return Math.hypot(nextPosition.x - pos.x, nextPosition.y - pos.y) <= ENTER_RADIUS;
            })
          : undefined;
        if (nearbyBuilding) {
          if (nearbyBuildingPromptIdRef.current !== nearbyBuilding.id) {
            nearbyBuildingPromptIdRef.current = nearbyBuilding.id;
            setNearbyBuildingPrompt(nearbyBuilding);
          }
        } else if (nearbyBuildingPromptIdRef.current) {
          nearbyBuildingPromptIdRef.current = null;
          setNearbyBuildingPrompt(null);
        }

        const lord = SHOW_MAP_MARKERS ? pirateLordForIsland(nextIsland.id) : undefined;
        if (lord) {
          const lp = pirateLordWorldPosition(lord, nextIsland.position);
          if (Math.hypot(nextPosition.x - lp.x, nextPosition.y - lp.y) <= ENTER_RADIUS) {
            directionRef.current = null;
            setCurrentPirateLord(lord.id);
            navigation.navigate('PirateLord');
            return;
          }
        }

        const nearbyQuest = SHOW_MAP_MARKERS
          ? SIDE_QUESTS.find((q) => {
              if (q.islandId !== nextIsland.id || !q.offset) return false;
              const qp = sideQuestWorldPosition(q as SideQuest & { offset: { x: number; y: number } }, nextIsland.position);
              return Math.hypot(nextPosition.x - qp.x, nextPosition.y - qp.y) <= ENTER_RADIUS;
            })
          : undefined;
        if (nearbyQuest) {
          directionRef.current = null;
          setCurrentSideQuest(nearbyQuest.id);
          navigation.navigate('SideQuest');
          return;
        }

        if (SHOW_MAP_MARKERS && nearbyRescuePointPos(nextPosition, nextIsland)) {
          directionRef.current = null;
          navigation.navigate('Rescue');
          return;
        }

        const nearbyBlackfinStage = SHOW_MAP_MARKERS
          ? BLACKFIN_STAGES.find((stage) => {
              if (stage.islandId !== nextIsland.id || completedBlackfinStageIds.includes(stage.id)) {
                return false;
              }
              const bp = blackfinStageWorldPosition(stage, nextIsland.position);
              return Math.hypot(nextPosition.x - bp.x, nextPosition.y - bp.y) <= ENTER_RADIUS;
            })
          : undefined;
        if (nearbyBlackfinStage) {
          directionRef.current = null;
          setCurrentBlackfinStage(nearbyBlackfinStage.id);
          navigation.navigate('Blackfin');
          return;
        }

        const nearbyGraceStage = SHOW_MAP_MARKERS
          ? GRACE_STAGES.find((stage) => {
              if (stage.islandId !== nextIsland.id || completedGraceStageIds.includes(stage.id)) {
                return false;
              }
              const op = graceStageWorldPosition(stage, nextIsland.position);
              return Math.hypot(nextPosition.x - op.x, nextPosition.y - op.y) <= ENTER_RADIUS;
            })
          : undefined;
        if (nearbyGraceStage) {
          directionRef.current = null;
          setCurrentGraceStage(nearbyGraceStage.id);
          navigation.navigate('Grace');
          return;
        }

        // Resource nodes gather passively while walking through — no navigation, no interrupt.
        const nearbyNode = SHOW_MAP_MARKERS
          ? RESOURCE_NODES.find((n) => {
              if (n.islandId !== nextIsland.id) return false;
              const np = resourceNodeWorldPosition(n, nextIsland.position);
              return Math.hypot(nextPosition.x - np.x, nextPosition.y - np.y) <= ENTER_RADIUS;
            })
          : undefined;
        if (nearbyNode) {
          const result = gatherResource(nearbyNode.id);
          if (result.success && result.resourceId && result.amount) {
            const resource = RESOURCES[result.resourceId];
            showResourceToast(`${resource.emoji} +${result.amount} ${resource.name}!`);
          }
        }

        // Salvage sites gather passively too, once the Diving Bell is owned.
        const nearbySite = SHOW_MAP_MARKERS
          ? SALVAGE_SITES.find((site) => {
              if (site.islandId !== nextIsland.id) return false;
              const sp = salvageSiteWorldPosition(site, nextIsland.position);
              return Math.hypot(nextPosition.x - sp.x, nextPosition.y - sp.y) <= ENTER_RADIUS;
            })
          : undefined;
        if (nearbySite && shipUpgradesRef.current.includes(nearbySite.requiresUpgradeId)) {
          const result = salvageSite(nearbySite.id);
          if (result.success && result.amount) {
            showResourceToast(`🤿 Salvaged ${result.amount} gold!`);
          }
          if (result.treasureId) {
            const treasure = TREASURES[result.treasureId];
            showResourceToast(`${treasure.emoji} Treasure! ${treasure.name}`, 4500);
          }
        }

        // Treasure sites — same passive walk-through pickup as resource nodes/salvage. Skips ones
        // already found (no marker for those anyway, see the render section below).
        const nearbyTreasureSite = SHOW_MAP_MARKERS
          ? TREASURE_SITES.find((site) => {
              if (site.islandId !== nextIsland.id || foundTreasureIds.includes(site.treasureId)) {
                return false;
              }
              const tp = treasureSiteWorldPosition(site, nextIsland.position);
              return Math.hypot(nextPosition.x - tp.x, nextPosition.y - tp.y) <= ENTER_RADIUS;
            })
          : undefined;
        if (nearbyTreasureSite) {
          const result = findTreasureSite(nearbyTreasureSite.id);
          if (result.success && result.treasureId) {
            const treasure = TREASURES[result.treasureId];
            showResourceToast(`${treasure.emoji} Treasure! ${treasure.name}`, 4500);
            // The hoard auto-assembles inside the store action the instant the 7th fragment lands
            // (see withHoardCheck in gameStore.ts) — this is just a second, delayed toast so both
            // reveals are readable instead of one overwriting the other.
            const hoardJustAssembled =
              result.treasureId !== 'blackbeards_hoard' &&
              useGameStore.getState().foundTreasureIds.includes('blackbeards_hoard');
            if (hoardJustAssembled) {
              setTimeout(() => {
                showResourceToast("👑 All 7 fragments found — Blackbeard's Lost Hoard assembles itself!", 5500);
              }, 1200);
            }
          }
        }

        // Landmarks are scenery, not gameplay — a flavor toast once per approach, no navigation.
        const landmark = SHOW_LANDMARKS ? nearbyLandmark(nextPosition, nextIsland) : undefined;
        if (landmark) {
          if (lastLandmarkIdRef.current !== landmark.id) {
            lastLandmarkIdRef.current = landmark.id;
            showResourceToast(`${landmark.emoji} ${landmark.name}: ${landmark.description}`, 4500);
          }
        } else {
          lastLandmarkIdRef.current = null;
        }

        // Street NPCs are ambient too — same one-shot toast pattern, never a quest.
        const streetNpc = SHOW_STREET_NPCS ? nearbyStreetNpc(nextPosition, nextIsland) : undefined;
        if (streetNpc) {
          if (lastStreetNpcIdRef.current !== streetNpc.id) {
            lastStreetNpcIdRef.current = streetNpc.id;
            showResourceToast(`${streetNpc.emoji} ${streetNpc.name}: ${streetNpc.flavor}`, 3500);
          }
        } else {
          lastStreetNpcIdRef.current = null;
        }
      }

      const nextZoneId = nextIsland?.id ?? null;
      if (nextZoneId !== lastZoneIdRef.current) {
        lastZoneIdRef.current = nextZoneId;
        if (nextIsland) {
          setZoneLabel(nextIsland.name);
          setZoneDescription(nextIsland.description);
          if (nextIsland.isSafeZone) {
            healAllCrew();
            addHeat(-40);
          }
        } else {
          setZoneLabel('The Open Sea');
          setZoneDescription('Nothing but waves in every direction.');
        }
      }

      const now = Date.now();
      if (now - lastEncounterCheckRef.current > ENCOUNTER_TICK_MS) {
        lastEncounterCheckRef.current = now;
        const isSafe = nextIsland?.isSafeZone;
        if (!isSafe) {
          const navyRoll = Math.random();
          const rivalRoll = Math.random();
          const merchantRoll = Math.random();
          const wildRoll = Math.random();
          const navyAmbushChance =
            ambushChance('navy', heatRef.current) * (shipUpgradesRef.current.includes('swift_rigging') ? 0.5 : 1);
          if (navyRoll < navyAmbushChance) {
            triggerAmbush('navy', nextPosition);
          } else if (rivalRoll < ambushChance('rival', heatRef.current)) {
            triggerAmbush('rival', nextPosition);
          } else if (!nextIsland && merchantRoll < MERCHANT_SEA_CHANCE) {
            triggerMerchant(nextPosition);
          } else {
            const chance = nextIsland ? nextIsland.encounterChance : SEA_ENCOUNTER_CHANCE;
            if (wildRoll < chance) {
              triggerEncounter(!!nextIsland, nextIsland?.id ?? null, nextPosition);
            }
          }
        }
      }
    }, TICK_MS);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused]);

  const currentIsland = islandAtPoint(player);

  // Gentle continuous sway while boarded and drifting at sea (not actively sailing, not docked)
  // so she never looks frozen sitting on open water between drags. Declared here rather than up
  // with the other effects since it needs `currentIsland`, computed fresh each render just above —
  // keyed on its id (a stable primitive) rather than the object itself, which is a new reference
  // every render and would restart the loop on every tick.
  const isDriftingAtSea = blackPearlBoarded && !isMoving && !currentIsland;
  useEffect(() => {
    if (isDriftingAtSea) {
      shipIdleLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(shipIdleSway, {
            toValue: -3,
            duration: 900,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(shipIdleSway, {
            toValue: 3,
            duration: 900,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
      shipIdleLoopRef.current.start();
    } else {
      shipIdleLoopRef.current?.stop();
      Animated.timing(shipIdleSway, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
    return () => shipIdleLoopRef.current?.stop();
  }, [isDriftingAtSea, shipIdleSway]);

  const sortedLords = [...PIRATE_LORDS].sort((a, b) => a.order - b.order);
  const nextLord = sortedLords.find(
    (lord) => !defeatedLordIds.includes(lord.id) && isLordUnlocked(lord, defeatedLordIds, completedQuestIds)
  );
  const allLordsDefeated = defeatedLordIds.length === PIRATE_LORDS.length;
  const gatedLord =
    !allLordsDefeated && !nextLord ? sortedLords.find((lord) => !defeatedLordIds.includes(lord.id)) : undefined;
  const gateQuest = gatedLord?.requiresQuestId
    ? SIDE_QUESTS.find((q) => q.id === gatedLord.requiresQuestId)
    : undefined;

  // Capturing the Black Pearl always leads — there's no sailing anywhere, so there's nothing
  // else to point at, until she's yours.
  let mainQuestText: string;
  if (!blackPearlCaptured) {
    mainQuestText = 'Capture the Black Pearl from Captain Odessa Kane at Tortuga Cove';
  } else if (allLordsDefeated) {
    mainQuestText = 'Every marque is yours — terror of these waters';
  } else if (nextLord) {
    mainQuestText = `Defeat ${nextLord.name} at ${ISLANDS[nextLord.islandId].name}`;
  } else {
    mainQuestText = gateQuest
      ? `Complete "${gateQuest.title}" at ${ISLANDS[gateQuest.islandId].name}`
      : 'Seek your next target';
  }

  // The compass points at whatever `mainQuestText` is currently naming — same underlying target,
  // just resolved to a world position instead of a sentence. Null means "nothing to point at"
  // (every lord defeated), which hides the compass entirely rather than showing a dead needle.
  let mainQuestTarget: { x: number; y: number } | null = null;
  if (!blackPearlCaptured) {
    mainQuestTarget = blackPearlPosition;
  } else if (nextLord) {
    mainQuestTarget = pirateLordWorldPosition(nextLord, ISLANDS[nextLord.islandId].position);
  } else if (gateQuest) {
    const gateIslandPos = ISLANDS[gateQuest.islandId].position;
    if (gateQuest.offset) {
      mainQuestTarget = sideQuestWorldPosition(
        gateQuest as SideQuest & { offset: { x: number; y: number } },
        gateIslandPos
      );
    } else if (gateQuest.hostedByBuildingId) {
      const hostBuilding = BUILDINGS.find((b) => b.id === gateQuest.hostedByBuildingId);
      mainQuestTarget = hostBuilding ? buildingWorldPosition(hostBuilding, gateIslandPos) : null;
    }
  }
  // Screen/world y increases downward, so "north" (no rotation) needs -dy; atan2(dx, -dy) then
  // gives 0deg when the target is directly above and increases clockwise, matching CSS rotate.
  const compassAngleDeg = mainQuestTarget
    ? (Math.atan2(mainQuestTarget.x - player.x, -(mainQuestTarget.y - player.y)) * 180) / Math.PI
    : null;

  // Same convention as the compass above (0deg = up, clockwise) — the minimap heading arrow uses
  // the live drag direction while moving, and holds its last value once the player lets go.
  if (directionRef.current && (directionRef.current.x !== 0 || directionRef.current.y !== 0)) {
    lastFacingAngleRef.current =
      (Math.atan2(directionRef.current.x, -directionRef.current.y) * 180) / Math.PI;
  }

  // Off-screen resource nodes and side quests on the current island get a small edge-of-screen icon
  // so a player who hasn't explored the island yet can still see roughly where to go — scoped to the
  // current island only (a marker pointing at something on a different island wouldn't be
  // actionable). Resource nodes are skipped while on cooldown (nothing to gather right now); side
  // quests are limited to the standalone ones with their own `.offset` map marker (quests hosted by
  // a building are meant to be found by talking to patrons, not marked), skip completed ones, and
  // skip the current gate quest since that one's already covered by the compass above.
  type EdgeIndicator = { id: string; emoji: string; pos: { x: number; y: number } };
  const resourceEdgeIndicators: EdgeIndicator[] = currentIsland
    ? RESOURCE_NODES.filter(
        (n) => n.islandId === currentIsland.id && (resourceNodeCooldowns[n.id] ?? 0) <= Date.now()
      )
        .map((n) => {
          const targetPos = resourceNodeWorldPosition(n, ISLANDS[n.islandId].position);
          const edgePos = edgeIndicatorPosition(player, targetPos, viewport, EDGE_ICON_MARGIN);
          return edgePos ? { id: n.id, emoji: RESOURCES[n.resourceId].emoji, pos: edgePos } : null;
        })
        .filter((x): x is EdgeIndicator => x !== null)
    : [];
  const sideQuestEdgeIndicators: EdgeIndicator[] = currentIsland
    ? SIDE_QUESTS.filter(
        (q) =>
          q.islandId === currentIsland.id &&
          !completedQuestIds.includes(q.id) &&
          q.id !== gateQuest?.id &&
          // Standalone quests already have their own map marker, so they're always eligible.
          // Building-hosted quests (patrons) are meant to be found by exploring, not signposted —
          // but once accepted, there's an item to deliver back to a specific building, and "explore
          // to find it" no longer applies. Show those only after acceptance.
          (q.offset || (q.hostedByBuildingId && acceptedQuestIds.includes(q.id)))
      )
        .map((q) => {
          const islandPos = ISLANDS[q.islandId].position;
          const targetPos = q.offset
            ? sideQuestWorldPosition(q as SideQuest & { offset: { x: number; y: number } }, islandPos)
            : (() => {
                const hostBuilding = BUILDINGS.find((b) => b.id === q.hostedByBuildingId);
                return hostBuilding ? buildingWorldPosition(hostBuilding, islandPos) : null;
              })();
          if (!targetPos) return null;
          const edgePos = edgeIndicatorPosition(player, targetPos, viewport, EDGE_ICON_MARGIN);
          return edgePos ? { id: q.id, emoji: '📜', pos: edgePos } : null;
        })
        .filter((x): x is EdgeIndicator => x !== null)
    : [];
  // The Black Pearl isn't scoped to the current island (she can be anywhere she was last left),
  // and isn't hidden until she's boarded — she's the whole point of the "add an external screen
  // emoji so it can be found" ask, so unlike the resource/quest icons above she always gets a
  // shot at an edge indicator regardless of which island the player is standing on.
  const blackPearlEdgeIndicator: EdgeIndicator | null = blackPearlBoarded
    ? null
    : (() => {
        const edgePos = edgeIndicatorPosition(player, blackPearlPosition, viewport, EDGE_ICON_MARGIN);
        return edgePos ? { id: 'black_pearl', emoji: BLACK_PEARL_EMOJI, pos: edgePos } : null;
      })();
  const edgeIndicators = SHOW_MAP_MARKERS
    ? [
        ...resourceEdgeIndicators,
        ...sideQuestEdgeIndicators,
        ...(blackPearlEdgeIndicator ? [blackPearlEdgeIndicator] : []),
      ]
    : [];

  // Mood badge over the header portrait, driven by the same wanted-heat gauge shown just below it
  // (see the heat bar render further down) — neutral in the clear, determined once law/rivals start
  // paying attention, visibly rattled once heat is genuinely dangerous. A real, honest use of the
  // face set: it reflects state MapScreen actually has, rather than reaching for an expression with
  // no story behind it. `captainFaceOverride` (occasional idle wink, or a happy/laugh flash on a
  // real win — see the effects above) takes priority over the plain heat tier while it's set.
  const captainFace =
    captainFaceOverride ?? (heat > 60 ? FACE_HURT : heat > 25 ? FACE_DETERMINED : FACE_NEUTRAL);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.captainTagRow}>
            <View>
              <RNImage source={SCALLY_PORTRAIT} resizeMode="contain" style={styles.captainPortrait} />
              {captainFace && (
                <RNImage source={captainFace} resizeMode="contain" style={styles.captainFaceBadge} />
              )}
            </View>
            <View>
              <Text style={styles.captainTag}>{CAPTAIN_NAME}</Text>
              <Text style={styles.title}>🏴‍☠️ {zoneLabel}</Text>
            </View>
          </View>
          {__DEV__ && (
            <Pressable onPress={() => navigation.navigate('Debug')} style={styles.debugButton}>
              <Text style={styles.debugButtonText}>🛠</Text>
            </Pressable>
          )}
        </View>
        <View style={styles.headerRow}>
          <Text style={styles.headerText}>💰 {gold} gold</Text>
          <Pressable onPress={() => navigation.navigate('Menu')} style={styles.crewButton}>
            <Text style={styles.crewButtonText}>☰ Menu</Text>
          </Pressable>
        </View>
        <View style={styles.heatTrack}>
          <View
            style={[
              styles.heatFill,
              {
                width: `${heat}%`,
                backgroundColor: heat > 60 ? '#e53935' : heat > 25 ? '#ffb300' : '#4caf50',
              },
            ]}
          />
          <Text style={styles.heatLabel}>⚠️ Heat {Math.round(heat)}%</Text>
        </View>
        <Pressable style={styles.questTracker} onPress={() => navigation.navigate('Quests')}>
          <Text style={styles.questTrackerLabel}>🧭 Main Quest</Text>
          <Text style={styles.questTrackerText} numberOfLines={1}>
            {mainQuestText}
          </Text>
        </Pressable>
      </View>

      <GestureDetector gesture={panGesture}>
      <View
        style={styles.mapContainer}
        onLayout={onLayoutContainer}
      >
        {viewport.width > 0 && (
          <View
            style={[
              styles.world,
              {
                width: WORLD_WIDTH,
                height: WORLD_HEIGHT,
                // The `world` view's own default transform-origin is its center, so a plain
                // { scale: ZOOM } would zoom around (WORLD_WIDTH/2, WORLD_HEIGHT/2) — nowhere
                // near the player on a large multi-island map. This translate cancels that
                // center-origin offset out algebraically so the net effect is exactly "zoom in
                // around the player, then re-center them on screen":
                //   finalTranslate = viewportCenter - worldCenter + ZOOM * (worldCenter - player)
                transform: [
                  {
                    translateX:
                      viewport.width / 2 - WORLD_WIDTH / 2 + ZOOM * (WORLD_WIDTH / 2 - player.x),
                  },
                  {
                    translateY:
                      viewport.height / 2 - WORLD_HEIGHT / 2 + ZOOM * (WORLD_HEIGHT / 2 - player.y),
                  },
                  { scale: ZOOM },
                ],
              },
            ]}
          >
            <Svg
              width={WORLD_WIDTH}
              height={WORLD_HEIGHT}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            >
              <Defs>
                {/* Real ground texture, tiled behind Tortuga Cove only for now (first slice of the
                    incremental art pass — see GAME_DESIGN.md) — everywhere else keeps the flat
                    fill below. patternUnits="userSpaceOnUse" ties the tile grid to world
                    coordinates rather than the polygon's own bounding box, so it doesn't stretch. */}
                {/* A 2x2 mirrored super-tile instead of one 64x64 tile repeated directly — with
                    only one grass source image (until the incoming terrain sheet adds real
                    variants), a plain repeat reads as an obvious "wallpaper" once several tiles
                    are visible at once (same blob motif recurring on a predictable grid). Flipping
                    alternating quadrants doubles the effective repeat period to 128 units and
                    breaks the direct copy-paste look for free, no new art needed — the standard
                    trick for stretching one tileable source further. Swap back to a plain single
                    tile (or better, several real variants) once the new sheet lands. */}
                <Pattern id="grassPattern" patternUnits="userSpaceOnUse" width={128} height={128}>
                  <SvgImage href={GROUND_TILES.grass} x={0} y={0} width={64} height={64} />
                  <SvgImage
                    href={GROUND_TILES.grass}
                    x={64}
                    y={0}
                    width={64}
                    height={64}
                    transform="translate(192,0) scale(-1,1)"
                  />
                  <SvgImage
                    href={GROUND_TILES.grass}
                    x={0}
                    y={64}
                    width={64}
                    height={64}
                    transform="translate(0,192) scale(1,-1)"
                  />
                  <SvgImage
                    href={GROUND_TILES.grass}
                    x={64}
                    y={64}
                    width={64}
                    height={64}
                    transform="translate(192,192) scale(-1,-1)"
                  />
                </Pattern>
                {/* Same deal for paved 'main' streets and the stone quay/breakwater, used as a
                    stroke pattern below — SVG strokes can reference a <Pattern> exactly like a
                    fill can. One real stone texture (cobble) covers all three; they're kept
                    visually distinct from each other by width/overlay, not by separate art. */}
                <Pattern id="cobblePattern" patternUnits="userSpaceOnUse" width={32} height={32}>
                  <SvgImage href={GROUND_TILES.cobble} x={0} y={0} width={32} height={32} />
                </Pattern>
                {/* Dirt/rough 'path' style tracks — real soil texture (see GROUND_TILES' doc
                    comment for where this was cut from). */}
                <Pattern id="dirtPattern" patternUnits="userSpaceOnUse" width={32} height={32}>
                  <SvgImage href={GROUND_TILES.dirt} x={0} y={0} width={32} height={32} />
                </Pattern>
                {/* Piers/jetties — a real repeatable dock module (4 corner posts + a plank deck,
                    with genuine alpha transparency around it) instead of a flat wood texture,
                    per direct feedback: "What happened to the jetty's we designed? Not just lines
                    sticking out the water?" Tiled at its native pixel size (56x64) so the posts
                    land at regular intervals down the pier's length, same technique as the ground
                    tile patterns above, just with a structural module instead of a flat texture. */}
                <Pattern id="pierModulePattern" patternUnits="userSpaceOnUse" width={56} height={64}>
                  <SvgImage href={WORLD_SPRITES.pierModule} x={0} y={0} width={56} height={64} />
                </Pattern>
              </Defs>

              {ISLAND_LIST.map((island) => (
                <Polygon
                  key={island.id}
                  points={island.shape
                    .map((p) => `${island.position.x + p.x},${island.position.y + p.y}`)
                    .join(' ')}
                  fill={island.id === 'tortuga_cove' ? 'url(#grassPattern)' : '#2c7a4b'}
                  stroke={island.isSafeZone ? '#ffd166' : '#1f5a37'}
                  strokeWidth={3}
                />
              ))}

              {/* Garden/yard patches, centered on each entity's precomputed HOUSE/BUILDING_GARDEN_
                  OFFSETS rather than its actual position — nudged away from any real path so the
                  yard never geometrically overlaps a street/pier/quay (the house's own icon can
                  still front the path just fine; only the tinted yard shape is repositioned).
                  Drawn here, before streets/piers/quays in the same SVG, as a second line of
                  defense: belt-and-suspenders in case a garden ever still grazes a path edge, the
                  road paint wins. The house/building icons themselves render in a separate View
                  layer on top of this whole Svg, at their real, unmoved position. */}
              {SHOW_GARDENS &&
                HOUSES.map((house, i) => {
                  const islandPos = ISLANDS[house.islandId].position;
                  const offset = HOUSE_GARDEN_OFFSETS[i];
                  return (
                    <Circle
                      key={`house-garden-${i}`}
                      cx={islandPos.x + offset.x}
                      cy={islandPos.y + offset.y}
                      r={HOUSE_GARDEN_RADIUS}
                      fill="rgba(139, 195, 74, 0.22)"
                      stroke="rgba(85, 139, 47, 0.45)"
                      strokeWidth={1}
                    />
                  );
                })}
              {SHOW_GARDENS &&
                BUILDINGS.map((building) => {
                  const islandPos = ISLANDS[building.islandId].position;
                  const offset = BUILDING_GARDEN_OFFSETS[building.id];
                  return (
                    <Circle
                      key={`building-garden-${building.id}`}
                      cx={islandPos.x + offset.x}
                      cy={islandPos.y + offset.y}
                      r={BUILDING_GARDEN_RADIUS}
                      fill="rgba(139, 195, 74, 0.16)"
                      stroke="rgba(85, 139, 47, 0.35)"
                      strokeWidth={1}
                    />
                  );
                })}

              {SHOW_STREETS &&
                STREETS.map((street, i) => {
                const islandPos = ISLANDS[street.islandId].position;
                const x1 = islandPos.x + street.from.x;
                const y1 = islandPos.y + street.from.y;
                const x2 = islandPos.x + street.to.x;
                const y2 = islandPos.y + street.to.y;
                // 'main' streets render as a single clean paved stroke, real cobblestone texture
                // now on every island (previously Tortuga-only while the tile art was still being
                // cut in — see the item below documenting this pass). 'path' is real dirt texture
                // too, narrower than a paved street so it still reads as the rougher route.
                //
                // 'path' used to be a dashed stroke (strokeDasharray) with a round linecap — SVG
                // rounds *every* dash segment's end under a round linecap, not just the line's true
                // start/end, so a dashed path rendered as a chain of little pill/capsule shapes
                // rather than one continuous track (worse once the dashes were pattern-filled
                // instead of flat-colored, per direct feedback: "why are the paths rounded at the
                // end"). Dropped the dash entirely so 'path' is one continuous stroke like 'main' —
                // but a round linecap still rounded off the two genuine endpoints of every segment,
                // which reads as a stubby rounded-off tile rather than a flat one wherever a street
                // network ends or two segments meet at an angle. Switched both to
                // strokeLinecap="square" per direct follow-up ("I don't want rounded paths...
                // change this so it's a full tile") — square extends the stroke a half-width past
                // the endpoint with flat corners, so a segment's end reads as a complete rectangular
                // paving tile instead of being rounded off.
                if (street.style === 'main') {
                  return (
                    <Line
                      key={i}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="url(#cobblePattern)"
                      strokeWidth={20}
                      strokeLinecap="square"
                    />
                  );
                }
                return (
                  <Line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="url(#dirtPattern)"
                    strokeWidth={14}
                    strokeLinecap="square"
                  />
                );
              })}

              {/* Junction patches — a real seam two independent `<Line>` strokes always leave at
                  every point 2+ street segments meet: `strokeLinecap="square"` only extends a
                  stroke past its own endpoint along its own direction, so a plain right-angle elbow
                  never gets its outer corner covered, and where a narrower 'path' crosses a wider
                  'main' the mismatch leaves bare grass showing through at the corners — the exact
                  bug direct feedback flagged looking at the street network as a whole. Drawn after
                  every STREETS line so each patch sits on top and covers the gap; STREET_JUNCTIONS
                  is precomputed once at module load (see streets.ts) from every shared endpoint,
                  not just the style-mismatched ones, since a same-style elbow has the identical gap. */}
              {SHOW_STREETS &&
                STREET_JUNCTIONS.map((junction, i) => {
                const islandPos = ISLANDS[junction.islandId].position;
                return (
                  <Circle
                    key={`junction-${i}`}
                    cx={islandPos.x + junction.point.x}
                    cy={islandPos.y + junction.point.y}
                    r={junction.style === 'main' ? 12 : 9}
                    fill={junction.style === 'main' ? 'url(#cobblePattern)' : 'url(#dirtPattern)'}
                  />
                );
              })}

              {SHOW_STREETS &&
                PIERS.map((pier, i) => {
                const islandPos = ISLANDS[pier.islandId].position;
                const x1 = islandPos.x + pier.from.x;
                const y1 = islandPos.y + pier.from.y;
                const x2 = islandPos.x + pier.to.x;
                const y2 = islandPos.y + pier.to.y;
                // A real repeatable dock module (pierModulePattern — 4 corner posts + a plank
                // deck, cut with genuine alpha transparency) instead of a flat wood-plank
                // texture — a flat tiled texture read as "just lines sticking out the water" per
                // direct feedback asking where "the jetty's we designed" went. This module is the
                // exact piece the reference sheet itself draws stacked in a column (confirming
                // it's meant to tile), so repeating it down each pier's length reads as a real
                // built structure — regularly spaced posts, a woven deck, sea visible through the
                // gaps between modules — rather than a solid colored/textured band.
                //
                // Some piers now bend (T-head/L-head "wraps around" jetties — see harbor.ts) so a
                // single PIERS entry can be a vertical spur OR one of its horizontal head arms.
                // pierModulePattern tiles in fixed world-space coordinates (56 wide x 64 tall), not
                // rotated to follow the stroke, so strokeWidth has to match whichever pattern
                // dimension is actually the segment's cross-section: 56 (the module's own width)
                // for a vertical run, 64 (its height) for a horizontal one — using 56 on a
                // horizontal segment would clip the top/bottom of every post.
                const isHorizontal = y1 === y2;
                return (
                  <Line
                    key={`pier-${i}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="url(#pierModulePattern)"
                    strokeWidth={isHorizontal ? 64 : 56}
                    strokeLinecap="square"
                  />
                );
              })}

              {SHOW_STREETS &&
                QUAYS.map((quay, i) => {
                const islandPos = ISLANDS[quay.islandId].position;
                const x1 = islandPos.x + quay.from.x;
                const y1 = islandPos.y + quay.from.y;
                const x2 = islandPos.x + quay.to.x;
                const y2 = islandPos.y + quay.to.y;
                // Real stone texture (the same cobble tile as paved streets, since it's the only
                // stone art cut so far) plus a lighter flat highlight down the center — a built
                // embankment, not a wooden walkway, so it still reads distinctly from both the
                // piers above and the paved town streets despite sharing the texture.
                return (
                  <React.Fragment key={`quay-${i}`}>
                    <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#cobblePattern)" strokeWidth={24} strokeLinecap="square" />
                    <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#c9c9c0" strokeOpacity={0.35} strokeWidth={14} strokeLinecap="square" />
                  </React.Fragment>
                );
              })}

              {SHOW_STREETS &&
                BREAKWATER.map((arm, i) => {
                const islandPos = ISLANDS[arm.islandId].position;
                const x1 = islandPos.x + arm.from.x;
                const y1 = islandPos.y + arm.from.y;
                const x2 = islandPos.x + arm.to.x;
                const y2 = islandPos.y + arm.to.y;
                // Same cobble texture as the quay, darkened with a translucent overlay stroke —
                // rougher, darker stone than the quay, since it's rubble sheltering the harbor
                // basin, not somewhere a ship ties up.
                return (
                  <React.Fragment key={`breakwater-${i}`}>
                    <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#cobblePattern)" strokeWidth={18} strokeLinecap="square" />
                    <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1c1c18" strokeOpacity={0.4} strokeWidth={18} strokeLinecap="square" />
                  </React.Fragment>
                );
              })}
            </Svg>

            {SHOW_HOUSES &&
              HOUSES.map((house, i) => {
              const islandPos = ISLANDS[house.islandId].position;
              const pos = houseWorldPosition(house, islandPos);
              // Tortuga Cove is the only island with real house art cut so far (see
              // worldSprites.ts HOUSE_SPRITES) — everywhere else keeps the emoji rotation.
              if (house.islandId === 'tortuga_cove') {
                const sprite = HOUSE_SPRITES[i % HOUSE_SPRITES.length];
                const size = HOUSE_SPRITE_SIZE;
                return (
                  <View
                    key={i}
                    style={[styles.house, { left: pos.x - size / 2, top: pos.y - size / 2, width: size, height: size }]}
                    pointerEvents="none"
                  >
                    <RNImage source={sprite} resizeMode="contain" style={{ width: size, height: size }} />
                  </View>
                );
              }
              const emoji = HOUSE_EMOJIS[i % HOUSE_EMOJIS.length];
              return (
                <View
                  key={i}
                  style={[styles.house, { left: pos.x - 13, top: pos.y - 13 }]}
                  pointerEvents="none"
                >
                  <Text style={styles.houseEmoji}>{emoji}</Text>
                </View>
              );
            })}

            {SHOW_SCENERY &&
              SCENERY.map((prop, i) => {
              const islandPos = ISLANDS[prop.islandId].position;
              const pos = sceneryWorldPosition(prop, islandPos);
              const natureId = natureSpriteFor(prop.emoji, i);
              if (natureId) {
                const size = (prop.fontSize ?? 22) * 1.9;
                return (
                  <View
                    key={i}
                    style={[styles.scenery, { left: pos.x - size / 2, top: pos.y - size / 2, width: size, height: size }]}
                    pointerEvents="none"
                  >
                    <RNImage
                      source={NATURE_SPRITES[natureId]}
                      resizeMode="contain"
                      style={{ width: size, height: size }}
                    />
                  </View>
                );
              }
              return (
                <View
                  key={i}
                  style={[styles.scenery, { left: pos.x - 13, top: pos.y - 13 }]}
                  pointerEvents="none"
                >
                  <Text style={{ fontSize: prop.fontSize ?? 22 }}>{prop.emoji}</Text>
                </View>
              );
            })}

            {SHOW_SCENERY &&
              PROPS.map((prop, i) => {
              const islandPos = ISLANDS[prop.islandId].position;
              const pos = propWorldPosition(prop, islandPos);
              const size = (prop.fontSize ?? 22) * 1.7;
              return (
                <View
                  key={`prop-${i}`}
                  style={[styles.scenery, { left: pos.x - size / 2, top: pos.y - size / 2, width: size, height: size }]}
                  pointerEvents="none"
                >
                  <RNImage
                    source={PROP_SPRITES[prop.spriteId]}
                    resizeMode="contain"
                    style={{ width: size, height: size }}
                  />
                </View>
              );
            })}

            {SHOW_SCENERY &&
              [...DOCKED_BOATS, ...OFFSHORE_SHIPS].map((boat, i) => {
              const islandPos = ISLANDS[boat.islandId].position;
              const pos = harborBoatWorldPosition(boat, islandPos);
              return (
                <View
                  key={`boat-${i}`}
                  style={[styles.scenery, { left: pos.x - 15, top: pos.y - 15 }]}
                  pointerEvents="none"
                >
                  <Text
                    style={{
                      fontSize: boat.fontSize ?? 24,
                      transform: [{ rotate: `${boat.rotationDeg ?? 0}deg` }],
                    }}
                  >
                    {boat.emoji}
                  </Text>
                </View>
              );
            })}

            {SHOW_BUILDINGS &&
              BUILDINGS.map((building) => {
              const islandPos = ISLANDS[building.islandId].position;
              const pos = buildingWorldPosition(building, islandPos);
              const hasOpenChallenge = SIDE_QUESTS.some(
                (q) => q.hostedByBuildingId === building.id && !completedQuestIds.includes(q.id)
              );
              const isBuildingShaped = BUILDING_SHAPED_EMOJI.has(building.emoji);
              // Real building art (Tortuga Cove only so far — see worldSprites.ts) reads better
              // with more room than the emoji marker's tight little box, so it gets a bigger one,
              // still centered on the same world position the emoji/badge box uses.
              const size = building.spriteId ? BUILDING_SIZE * 1.7 : BUILDING_SIZE;
              return (
                <View
                  key={building.id}
                  style={[
                    styles.building,
                    {
                      width: size,
                      height: size,
                      left: pos.x - size / 2,
                      top: pos.y - size / 2,
                    },
                    // No boxed/highlighted background — buildings render as plain art or emoji on
                    // the map now. Enterability is signaled some other way (still to be decided),
                    // not by a badge around every building.
                    { backgroundColor: 'transparent', borderWidth: 0 },
                  ]}
                >
                  {hasOpenChallenge && (
                    <RNImage source={ICON_EXCLAIM} resizeMode="contain" style={styles.buildingQuestIndicator} />
                  )}
                  {building.spriteId ? (
                    <RNImage
                      source={BUILDING_SPRITES[building.spriteId]}
                      resizeMode="contain"
                      style={{ width: size, height: size }}
                    />
                  ) : isBuildingShaped ? (
                    <Text style={styles.buildingEmoji}>{building.emoji}</Text>
                  ) : (
                    <>
                      <Text style={styles.buildingHouseBase}>🏠</Text>
                      <Text style={styles.buildingTypeBadge}>{building.emoji}</Text>
                    </>
                  )}
                </View>
              );
            })}

            {SHOW_LANDMARKS &&
              LANDMARKS.map((landmark) => {
              const islandPos = ISLANDS[landmark.islandId].position;
              const pos = landmarkWorldPosition(landmark, islandPos);
              if (landmark.sprite) {
                const sourceMap =
                  landmark.sprite.category === 'building'
                    ? BUILDING_SPRITES
                    : landmark.sprite.category === 'nature'
                    ? NATURE_SPRITES
                    : PROP_SPRITES;
                const source = (sourceMap as Record<string, ImageSourcePropType>)[landmark.sprite.id];
                const size = BUILDING_SIZE * 1.6;
                return (
                  <View
                    key={landmark.id}
                    style={[
                      styles.landmark,
                      { left: pos.x - size / 2, top: pos.y - size / 2, width: size, height: size },
                    ]}
                    pointerEvents="none"
                  >
                    <RNImage source={source} resizeMode="contain" style={{ width: size, height: size }} />
                  </View>
                );
              }
              return (
                <View
                  key={landmark.id}
                  style={[
                    styles.landmark,
                    {
                      left: pos.x - BUILDING_SIZE / 2,
                      top: pos.y - BUILDING_SIZE / 2,
                    },
                  ]}
                  pointerEvents="none"
                >
                  <Text style={styles.buildingEmoji}>{landmark.emoji}</Text>
                </View>
              );
            })}

            {/* The Tortuga gate — real sliced art rather than a LANDMARKS entry, since it's a
                single one-off piece rather than a repeatable type. Sat just off the tavern
                district, roughly where the town road opens onto the harbor square. */}
            {SHOW_LANDMARKS && (() => {
              const gatePos = {
                x: ISLANDS.tortuga_cove.position.x - 40,
                y: ISLANDS.tortuga_cove.position.y - 40,
              };
              const gateSize = BUILDING_SIZE * 2;
              return (
                <View
                  style={[
                    styles.landmark,
                    {
                      width: gateSize,
                      height: gateSize,
                      left: gatePos.x - gateSize / 2,
                      top: gatePos.y - gateSize / 2,
                    },
                  ]}
                  pointerEvents="none"
                >
                  <RNImage
                    source={WORLD_SPRITES.tortugaGate}
                    resizeMode="contain"
                    style={{ width: gateSize, height: gateSize }}
                  />
                </View>
              );
            })()}

            {SHOW_STREET_NPCS &&
              STREET_NPCS.map((npc) => {
              const islandPos = ISLANDS[npc.islandId].position;
              const sim = npcSimRef.current.get(npc.id) ?? initNpcSim(npc);
              const pos = { x: islandPos.x + sim.x, y: islandPos.y + sim.y };
              // Individual flavor emoji (a dice, a fiddle, a cat) read as confusing clutter once
              // they're moving around the street — swapped for the same walking-person sprite the
              // player uses, in the same front/side pose based on which axis they're moving along,
              // so every wanderer on screen unambiguously reads as "a person walking."
              const dx = sim.targetX - sim.x;
              const dy = sim.targetY - sim.y;
              const npcEmoji =
                Math.abs(dy) > Math.abs(dx) ? PLAYER_EMOJI_LAND_FRONT : PLAYER_EMOJI_LAND_SIDE;
              const npcFacingRight = dx > 0;
              return (
                <View
                  key={npc.id}
                  style={[styles.streetNpc, { left: pos.x - 5, top: pos.y - 5 }]}
                  pointerEvents="none"
                >
                  <Text
                    style={[
                      styles.streetNpcEmoji,
                      { transform: [{ scaleX: npcFacingRight ? -1 : 1 }] },
                    ]}
                  >
                    {npcEmoji}
                  </Text>
                  {/* Small solid patch over the torso only — the glyph itself (skin included)
                      renders fully untouched above and below it. */}
                  <View
                    style={[
                      styles.streetNpcClothingPatch,
                      { backgroundColor: npcClothingColor(npc.id) },
                    ]}
                    pointerEvents="none"
                  />
                </View>
              );
            })}

            {SHOW_MAP_MARKERS &&
              SIDE_QUESTS.filter((quest) => quest.offset).map((quest) => {
              const islandPos = ISLANDS[quest.islandId].position;
              const pos = sideQuestWorldPosition(quest as SideQuest & { offset: { x: number; y: number } }, islandPos);
              const isCompleted = completedQuestIds.includes(quest.id);
              const isAccepted = acceptedQuestIds.includes(quest.id);
              const questStyle = isCompleted
                ? styles.questMarkerDone
                : isAccepted
                ? styles.questMarkerAccepted
                : styles.questMarkerAvailable;
              return (
                <View
                  key={quest.id}
                  style={[
                    styles.building,
                    questStyle,
                    {
                      left: pos.x - BUILDING_SIZE / 2,
                      top: pos.y - BUILDING_SIZE / 2,
                    },
                  ]}
                >
                  <RNImage source={ICON_MAP} resizeMode="contain" style={styles.questMarkerIcon} />
                </View>
              );
            })}

            {SHOW_MAP_MARKERS &&
              RESOURCE_NODES.map((node) => {
              const islandPos = ISLANDS[node.islandId].position;
              const pos = resourceNodeWorldPosition(node, islandPos);
              const isReady = (resourceNodeCooldowns[node.id] ?? 0) <= Date.now();
              return (
                <View
                  key={node.id}
                  style={[
                    styles.resourceNode,
                    isReady ? styles.resourceNodeReady : styles.resourceNodeCooling,
                    {
                      left: pos.x - BUILDING_SIZE / 2,
                      top: pos.y - BUILDING_SIZE / 2,
                    },
                  ]}
                >
                  <Text style={styles.buildingEmoji}>{RESOURCES[node.resourceId].emoji}</Text>
                </View>
              );
            })}

            {SHOW_MAP_MARKERS &&
              SALVAGE_SITES.map((site) => {
              const islandPos = ISLANDS[site.islandId].position;
              const pos = salvageSiteWorldPosition(site, islandPos);
              const isReady =
                shipUpgrades.includes(site.requiresUpgradeId) &&
                (salvageCooldowns[site.id] ?? 0) <= Date.now();
              const isUnlocked = shipUpgrades.includes(site.requiresUpgradeId);
              return (
                <View
                  key={site.id}
                  style={[
                    styles.resourceNode,
                    isReady
                      ? styles.resourceNodeReady
                      : isUnlocked
                      ? styles.resourceNodeCooling
                      : styles.salvageLocked,
                    {
                      left: pos.x - BUILDING_SIZE / 2,
                      top: pos.y - BUILDING_SIZE / 2,
                    },
                  ]}
                >
                  <Text style={styles.buildingEmoji}>🤿</Text>
                </View>
              );
            })}

            {SHOW_MAP_MARKERS &&
              TREASURE_SITES.filter((site) => !foundTreasureIds.includes(site.treasureId)).map(
              (site) => {
                const islandPos = ISLANDS[site.islandId].position;
                const pos = treasureSiteWorldPosition(site, islandPos);
                const treasure = TREASURES[site.treasureId];
                const locked = !!site.requiresItemId && (inventory[site.requiresItemId] ?? 0) <= 0;
                return (
                  <View
                    key={site.id}
                    style={[
                      styles.resourceNode,
                      { borderColor: rarityColor(treasure.rarity) },
                      locked && styles.salvageLocked,
                      {
                        left: pos.x - BUILDING_SIZE / 2,
                        top: pos.y - BUILDING_SIZE / 2,
                      },
                    ]}
                  >
                    <Text style={styles.buildingEmoji}>{locked ? '🔒' : treasure.emoji}</Text>
                  </View>
                );
              }
            )}

            {SHOW_MAP_MARKERS && (() => {
              const islandPos = ISLANDS[RESCUE_POINT.islandId].position;
              const pos = rescuePointWorldPosition(islandPos);
              const hasPrisoners = capturedCrew.length > 0;
              return (
                <View
                  style={[
                    styles.building,
                    hasPrisoners ? styles.questMarkerAvailable : styles.rescueMarkerEmpty,
                    {
                      left: pos.x - BUILDING_SIZE / 2,
                      top: pos.y - BUILDING_SIZE / 2,
                    },
                  ]}
                >
                  <Text style={styles.buildingEmoji}>🔓</Text>
                </View>
              );
            })()}

            {SHOW_MAP_MARKERS &&
              BLACKFIN_STAGES.filter((stage) => !completedBlackfinStageIds.includes(stage.id)).map(
              (stage) => {
                const islandPos = ISLANDS[stage.islandId].position;
                const pos = blackfinStageWorldPosition(stage, islandPos);
                return (
                  <View
                    key={stage.id}
                    style={[
                      styles.building,
                      styles.questMarkerAvailable,
                      {
                        left: pos.x - BUILDING_SIZE / 2,
                        top: pos.y - BUILDING_SIZE / 2,
                      },
                    ]}
                  >
                    <Text style={styles.buildingEmoji}>{BLACKFIN_EMOJI}</Text>
                  </View>
                );
              }
            )}

            {SHOW_MAP_MARKERS &&
              GRACE_STAGES.filter((stage) => !completedGraceStageIds.includes(stage.id)).map(
              (stage) => {
                const islandPos = ISLANDS[stage.islandId].position;
                const pos = graceStageWorldPosition(stage, islandPos);
                return (
                  <View
                    key={stage.id}
                    style={[
                      styles.building,
                      styles.questMarkerAvailable,
                      {
                        left: pos.x - BUILDING_SIZE / 2,
                        top: pos.y - BUILDING_SIZE / 2,
                      },
                    ]}
                  >
                    <Text style={styles.buildingEmoji}>{GRACE_EMOJI}</Text>
                  </View>
                );
              }
            )}

            {SHOW_MAP_MARKERS &&
              PIRATE_LORDS.map((lord) => {
              const islandPos = ISLANDS[lord.islandId].position;
              const pos = pirateLordWorldPosition(lord, islandPos);
              const isDefeated = defeatedLordIds.includes(lord.id);
              const isUnlocked = isLordUnlocked(lord, defeatedLordIds, completedQuestIds);
              const fortStyle = isDefeated
                ? styles.fortDefeated
                : isUnlocked
                ? styles.fortAvailable
                : styles.fortLocked;
              return (
                <View
                  key={lord.id}
                  style={[
                    styles.fort,
                    fortStyle,
                    {
                      left: pos.x - BUILDING_SIZE / 2,
                      top: pos.y - BUILDING_SIZE / 2,
                    },
                  ]}
                >
                  <Text style={styles.buildingEmoji}>🏰</Text>
                </View>
              );
            })}

            {/* Hidden while boarded — she's under the player's feet at that point, represented by
                the sea player-emoji instead of a separate marker. Otherwise always visible,
                wherever she was last left, guarded or not. */}
            {SHOW_MAP_MARKERS && !blackPearlBoarded && (
              <View
                style={[
                  styles.building,
                  blackPearlCaptured ? styles.blackPearlMarkerCaptured : styles.blackPearlMarkerGuarded,
                  // Keep the status-color ring (red = guarded, green = captured) but drop the
                  // translucent fill behind it — it would tint the ship art muddy.
                  { backgroundColor: 'transparent' },
                  {
                    width: BUILDING_SIZE * 1.8,
                    height: BUILDING_SIZE * 1.8,
                    left: blackPearlPosition.x - (BUILDING_SIZE * 1.8) / 2,
                    top: blackPearlPosition.y - (BUILDING_SIZE * 1.8) / 2,
                  },
                ]}
                pointerEvents="none"
              >
                {!blackPearlCaptured && (
                  <Text style={styles.buildingQuestIndicator}>{BLACK_PEARL_FLAG_EMOJI}</Text>
                )}
                <RNImage
                  source={WORLD_SPRITES.blackShip}
                  resizeMode="contain"
                  style={{ width: BUILDING_SIZE * 1.8, height: BUILDING_SIZE * 1.8 }}
                />
                {showMonkeyOnDeck && (
                  <RNImage
                    source={monkeyWinking ? MONKEY_WINK : MONKEY_IDLE}
                    resizeMode="contain"
                    style={styles.monkeyOnDeck}
                  />
                )}
              </View>
            )}
          </View>
        )}

        {viewport.width > 0 && (
          <View
            style={[
              styles.player,
              {
                left: viewport.width / 2 - PLAYER_SIZE / 2,
                top: viewport.height / 2 - PLAYER_SIZE / 2,
              },
            ]}
          >
            {currentIsland ? (
              // On land, Captain Scally renders as real sprite art — a true 8-directional walk
              // cycle instead of the old front/side emoji + mirror trick (kept below for the sea
              // token, since no ship sprite was cut).
              //
              // Reverted to a bare walk-cycle-only render on 2026-08-14 at the user's direct
              // request, after three attempted fixes (items 80-82) didn't resolve their "hopping,
              // not walking" report — every overlay this render could show got pulled at once.
              // Re-wired individually on 2026-08-15, each behind the fix for whichever specific
              // thing actually caused the hop (see scallySprites.ts's IDLE_SOURCES/run-cycle doc
              // comments): attack/sword-ready flash takes top priority (a duel interrupt), then any
              // showing single-frame emote (door greeting / victory — a real story moment), then the
              // prolonged-idle flourish (a much longer multi-frame vignette, added 2026-08-22 — see
              // IDLE_FLOURISHES' doc comment in scallySprites.ts — deliberately below the emotes
              // since a greeting or a win should always be able to interrupt idle boredom, not the
              // other way around), then the heat-triggered run cycle, and otherwise the plain
              // walk/idle cycle. The idle and run branches are the two that needed a real fix rather
              // than just an `!isMoving` guard — see those comments for what each one was. The
              // mid-turn pivot flash that used to sit between the attack flash and the emote here
              // was removed 2026-08-22 once real 8-directional walk art made it redundant (see
              // scallySprites.ts).
              <Animated.Image
                source={
                  scallyAttackFlash
                    ? scallyAttackFlash === 'attack'
                      ? POSE_ATTACK
                      : POSE_SWORD_READY
                    : emoteOverlay
                    ? emoteOverlay.source
                    : idleFlourish
                    ? idleFlourish.frames[idleFlourishFrame % idleFlourish.frames.length]
                    : isRunning
                    ? runSpriteSource(walkSpriteFrame)
                    : scallySpriteSource(facingDir, isMoving, walkSpriteFrame, idleSpriteFrame)
                }
                resizeMode="contain"
                style={[
                  styles.playerSprite,
                  {
                    transform: [{ translateY: walkBounce }],
                  },
                ]}
              />
            ) : (
              // At sea, the Black Pearl herself renders as real sprite art — 8-way directional
              // sailing with a banked pose while turning, a brief "APPROACH DOCK" loop near land,
              // a two-stage "DEPART DOCK" -> "Accelerate" flash right off a fresh boarding, a
              // "Stop/Skid" flash if a fight interrupts the sail, and a layered wake trail that
              // grows with how hard the joystick is pushed. islandAtPoint() blocks sea movement
              // entirely unless boarded (see the movement tick), so this branch is only ever
              // reached while boarded in practice.
              (() => {
                const wakeTier = shipApproaching
                  ? WAKE_SPRITES.small
                  : dragIntensity < 0.45
                  ? WAKE_SPRITES.small
                  : dragIntensity < 0.8
                  ? WAKE_SPRITES.medium
                  : WAKE_SPRITES.large;
                const headingVec = SHIP_HEADING_VECTOR[shipHeading];
                const wakeLayer = (distanceFrac: number, opacity: number) => ({
                  transform: [
                    { translateX: -headingVec.x * SHIP_SPRITE_SIZE * distanceFrac },
                    { translateY: -headingVec.y * SHIP_SPRITE_SIZE * distanceFrac + 6 },
                  ],
                  opacity,
                });
                return (
                  <View style={styles.shipWrap}>
                    {isMoving && !shipDeparting && (
                      <>
                        <RNImage
                          source={wakeTier}
                          resizeMode="contain"
                          style={[styles.shipWake, wakeLayer(0.35, 0.85)]}
                        />
                        <RNImage
                          source={wakeTier}
                          resizeMode="contain"
                          style={[styles.shipWake, wakeLayer(0.7, 0.4)]}
                        />
                      </>
                    )}
                    <Animated.Image
                      source={
                        shipStopSkid
                          ? SHIP_STOP_SKID_SPRITE
                          : shipDeparting
                          ? SHIP_DEPART_SPRITE
                          : shipAccelerating
                          ? SHIP_ACCELERATE_SPRITE
                          : shipFurling
                          ? SHIP_DEPART_SPRITE
                          : shipApproaching
                          ? SHIP_APPROACH_FRAMES[shipApproachFrame]
                          : shipTurnBank
                          ? turnBankSource(shipTurnBank)
                          : shipSpriteSource(shipHeading)
                      }
                      resizeMode="contain"
                      style={[
                        styles.shipSprite,
                        { transform: [{ translateY: Animated.add(walkBounce, shipIdleSway) }] },
                      ]}
                    />
                  </View>
                );
              })()
            )}
          </View>
        )}

        {viewport.width > 0 && merchantShipFlash && (() => {
          const source = merchantShipSpriteSource(merchantShipFlash.templateId, merchantShipFlash.heading);
          if (!source) return null;
          // Offset to one side of the Black Pearl rather than dead-center on top of her — reads as
          // a real second vessel crossing the path rather than a costume swap on the player's own
          // ship. The offset direction is perpendicular to her heading so it looks plausible for
          // any facing instead of always popping in from the same screen edge.
          const headingVec = SHIP_HEADING_VECTOR[shipHeadingRef.current];
          const perpX = -headingVec.y;
          const perpY = headingVec.x;
          const offset = SHIP_SPRITE_SIZE * 1.1;
          return (
            <RNImage
              source={source}
              resizeMode="contain"
              style={[
                styles.shipSprite,
                styles.merchantShipFlash,
                {
                  left: viewport.width / 2 - SHIP_SPRITE_SIZE / 2 + perpX * offset,
                  top: viewport.height / 2 - SHIP_SPRITE_SIZE / 2 + perpY * offset,
                },
              ]}
            />
          );
        })()}

        {viewport.width > 0 && (() => {
          const minX = player.x - MINIMAP_RADIUS;
          const minY = player.y - MINIMAP_RADIUS;
          const span = MINIMAP_RADIUS * 2;
          // Generous slack beyond the visible circle so items just outside it don't pop in/out
          // right at the edge as the player moves.
          const inView = (x: number, y: number) =>
            x >= minX - 100 && x <= minX + span + 100 && y >= minY - 100 && y <= minY + span + 100;

          // Each mirrors its corresponding SHOW_* toggle above, so the minimap doesn't leak the
          // same content back into view in miniature while the full map has it hidden.
          const forestProps = SHOW_SCENERY
            ? SCENERY.filter((p) => {
                if (!FOREST_EMOJI.has(p.emoji)) return false;
                const pos = sceneryWorldPosition(p, ISLANDS[p.islandId].position);
                return inView(pos.x, pos.y);
              })
            : [];
          const nearHouses = SHOW_HOUSES
            ? HOUSES.filter((h) => {
                const pos = houseWorldPosition(h, ISLANDS[h.islandId].position);
                return inView(pos.x, pos.y);
              })
            : [];
          const nearBuildings = SHOW_BUILDINGS
            ? BUILDINGS.filter((b) => {
                const pos = buildingWorldPosition(b, ISLANDS[b.islandId].position);
                return inView(pos.x, pos.y);
              })
            : [];
          const nearStreets = SHOW_STREETS
            ? STREETS.filter((s) => {
                const islandPos = ISLANDS[s.islandId].position;
                return (
                  inView(islandPos.x + s.from.x, islandPos.y + s.from.y) ||
                  inView(islandPos.x + s.to.x, islandPos.y + s.to.y)
                );
              })
            : [];
          const nearPiers = SHOW_STREETS
            ? PIERS.filter((p) => {
                const islandPos = ISLANDS[p.islandId].position;
                return (
                  inView(islandPos.x + p.from.x, islandPos.y + p.from.y) ||
                  inView(islandPos.x + p.to.x, islandPos.y + p.to.y)
                );
              })
            : [];
          const nearLords = SHOW_MAP_MARKERS
            ? PIRATE_LORDS.filter((l) => {
                const pos = pirateLordWorldPosition(l, ISLANDS[l.islandId].position);
                return inView(pos.x, pos.y);
              })
            : [];
          // Same two categories the edge-of-screen icons already track (see edgeIndicators below) —
          // ready resource nodes, and standalone side quests with their own map marker — but plotted
          // at their exact position instead of clamped to a screen edge, like a GTA blip.
          const nearResourceNodes = SHOW_MAP_MARKERS
            ? RESOURCE_NODES.filter((n) => {
                const pos = resourceNodeWorldPosition(n, ISLANDS[n.islandId].position);
                return (resourceNodeCooldowns[n.id] ?? 0) <= Date.now() && inView(pos.x, pos.y);
              })
            : [];
          const nearQuestMarkers = SHOW_MAP_MARKERS
            ? SIDE_QUESTS.filter((q) => {
                if (!q.offset || completedQuestIds.includes(q.id)) return false;
                const pos = sideQuestWorldPosition(q as SideQuest & { offset: { x: number; y: number } }, ISLANDS[q.islandId].position);
                return inView(pos.x, pos.y);
              })
            : [];

          const arrowLen = 12 * MINIMAP_WORLD_PER_PX;
          const arrowWidth = 8 * MINIMAP_WORLD_PER_PX;
          const arrowPoints = [
            `${player.x},${player.y - arrowLen}`,
            `${player.x + arrowWidth},${player.y + arrowLen * 0.6}`,
            `${player.x - arrowWidth},${player.y + arrowLen * 0.6}`,
          ].join(' ');

          return (
            <View pointerEvents="none" style={styles.miniMap}>
              <Svg width={MINIMAP_SIZE} height={MINIMAP_SIZE} viewBox={`${minX} ${minY} ${span} ${span}`}>
                <Rect x={minX} y={minY} width={span} height={span} fill="#124d73" />
                {ISLAND_LIST.map((island) => (
                  <Polygon
                    key={island.id}
                    points={island.shape
                      .map((p) => `${island.position.x + p.x},${island.position.y + p.y}`)
                      .join(' ')}
                    fill={island.isSafeZone ? '#4fae70' : '#3d9963'}
                    stroke={island.isSafeZone ? '#ffd166' : '#1f5a37'}
                    strokeWidth={20}
                  />
                ))}
                {/* Overlapping same-color circles with no stroke read as one solid tree mass at
                    this scale, echoing a hand-drawn map's clustered-canopy forest texture. */}
                {forestProps.map((prop, i) => {
                  const pos = sceneryWorldPosition(prop, ISLANDS[prop.islandId].position);
                  return <Circle key={`forest-${i}`} cx={pos.x} cy={pos.y} r={50} fill="#1b4d32" />;
                })}
                {nearStreets.map((street, i) => {
                  const islandPos = ISLANDS[street.islandId].position;
                  const x1 = islandPos.x + street.from.x;
                  const y1 = islandPos.y + street.from.y;
                  const x2 = islandPos.x + street.to.x;
                  const y2 = islandPos.y + street.to.y;
                  return street.style === 'main' ? (
                    <Line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#d9cdb0" strokeWidth={16} strokeLinecap="round" />
                  ) : (
                    <Line
                      key={i}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#a9825a"
                      strokeWidth={10}
                      strokeLinecap="round"
                    />
                  );
                })}
                {/* Piers/jetties — a distinct warm brown from both street colors above so they
                    read as a separate, wooden feature reaching off the coastline rather than
                    another road. */}
                {nearPiers.map((pier, i) => {
                  const islandPos = ISLANDS[pier.islandId].position;
                  const x1 = islandPos.x + pier.from.x;
                  const y1 = islandPos.y + pier.from.y;
                  const x2 = islandPos.x + pier.to.x;
                  const y2 = islandPos.y + pier.to.y;
                  return (
                    <Line key={`pier-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#8a5a2b" strokeWidth={14} strokeLinecap="square" />
                  );
                })}
                {nearHouses.map((house, i) => {
                  const pos = houseWorldPosition(house, ISLANDS[house.islandId].position);
                  return <Circle key={`house-${i}`} cx={pos.x} cy={pos.y} r={14} fill="#caa06a" />;
                })}
                {nearBuildings.map((building) => {
                  const pos = buildingWorldPosition(building, ISLANDS[building.islandId].position);
                  return (
                    <Circle
                      key={building.id}
                      cx={pos.x}
                      cy={pos.y}
                      r={20}
                      fill="#f4e9cd"
                      stroke="#2b1c12"
                      strokeWidth={6}
                    />
                  );
                })}
                {nearLords.map((lord) => {
                  const pos = pirateLordWorldPosition(lord, ISLANDS[lord.islandId].position);
                  const color = defeatedLordIds.includes(lord.id)
                    ? '#4caf50'
                    : isLordUnlocked(lord, defeatedLordIds, completedQuestIds)
                    ? '#ffd166'
                    : '#8a7a6a';
                  return (
                    <Circle key={lord.id} cx={pos.x} cy={pos.y} r={26} fill={color} stroke="#2b1c12" strokeWidth={8} />
                  );
                })}
                {nearResourceNodes.map((node) => {
                  const pos = resourceNodeWorldPosition(node, ISLANDS[node.islandId].position);
                  return (
                    <SvgText
                      key={`res-${node.id}`}
                      x={pos.x}
                      y={pos.y}
                      fontSize={18 * MINIMAP_WORLD_PER_PX}
                      textAnchor="middle"
                      alignmentBaseline="central"
                    >
                      {RESOURCES[node.resourceId].emoji}
                    </SvgText>
                  );
                })}
                {nearQuestMarkers.map((quest) => {
                  const pos = sideQuestWorldPosition(
                    quest as SideQuest & { offset: { x: number; y: number } },
                    ISLANDS[quest.islandId].position
                  );
                  return (
                    <SvgText
                      key={`quest-${quest.id}`}
                      x={pos.x}
                      y={pos.y}
                      fontSize={20 * MINIMAP_WORLD_PER_PX}
                      textAnchor="middle"
                      alignmentBaseline="central"
                    >
                      📜
                    </SvgText>
                  );
                })}
                {/* Parked and findable on the radar same as any other blip — hidden while
                    boarded, since at that point the player's own arrow marker is the ship. */}
                {SHOW_MAP_MARKERS && !blackPearlBoarded && inView(blackPearlPosition.x, blackPearlPosition.y) && (
                  <SvgText
                    x={blackPearlPosition.x}
                    y={blackPearlPosition.y}
                    fontSize={20 * MINIMAP_WORLD_PER_PX}
                    textAnchor="middle"
                    alignmentBaseline="central"
                  >
                    {BLACK_PEARL_EMOJI}
                  </SvgText>
                )}
                {mainQuestTarget && inView(mainQuestTarget.x, mainQuestTarget.y) && (
                  <Circle
                    cx={mainQuestTarget.x}
                    cy={mainQuestTarget.y}
                    r={34}
                    fill="none"
                    stroke="#ffd166"
                    strokeWidth={10}
                  />
                )}
                {/* The player marker is always plotted at the exact viewBox center — the world
                    scrolls under it as `player` changes, it never itself moves on screen. */}
                <Polygon
                  points={arrowPoints}
                  fill="#ff5252"
                  stroke="#fff"
                  strokeWidth={4}
                  transform={`rotate(${lastFacingAngleRef.current} ${player.x} ${player.y})`}
                />
              </Svg>
            </View>
          );
        })()}

        {dragOrigin && (
          <View
            pointerEvents="none"
            style={[styles.joystickBase, { left: dragOrigin.x - 45, top: dragOrigin.y - 45 }]}
          />
        )}
        {dragKnob && (
          <View
            pointerEvents="none"
            style={[styles.joystickKnob, { left: dragKnob.x - 20, top: dragKnob.y - 20 }]}
          />
        )}

        {resourceToast && (
          <View pointerEvents="none" style={styles.resourceToast}>
            <Text style={styles.resourceToastText}>{resourceToast}</Text>
          </View>
        )}

        {nearbyBuildingPrompt && (
          <Pressable style={styles.buildingPrompt} onPress={confirmEnterBuilding}>
            <Text style={styles.buildingPromptEmoji}>{nearbyBuildingPrompt.emoji}</Text>
            <Text style={styles.buildingPromptText}>Enter {nearbyBuildingPrompt.name}?</Text>
          </Pressable>
        )}

        {showBoardPrompt && (
          <Pressable style={styles.buildingPrompt} onPress={confirmBoardBlackPearl}>
            <Text style={styles.buildingPromptEmoji}>{BLACK_PEARL_EMOJI}</Text>
            <Text style={styles.buildingPromptText}>Board the Black Pearl?</Text>
          </Pressable>
        )}

        {compassAngleDeg !== null && (
          <View pointerEvents="none" style={styles.compassBadge}>
            <Text style={[styles.compassEmoji, { transform: [{ rotate: `${compassAngleDeg}deg` }] }]}>
              🧭
            </Text>
          </View>
        )}

        {edgeIndicators.map((indicator) => (
          <View
            key={indicator.id}
            pointerEvents="none"
            style={[
              styles.edgeIndicator,
              { left: indicator.pos.x - EDGE_ICON_SIZE / 2, top: indicator.pos.y - EDGE_ICON_SIZE / 2 },
            ]}
          >
            <Text style={styles.edgeIndicatorEmoji}>{indicator.emoji}</Text>
          </View>
        ))}
      </View>
      </GestureDetector>

      <View style={styles.footer}>
        <Text style={styles.islandDescription}>{zoneDescription}</Text>
        <Text style={styles.statusMessage}>
          Touch and drag anywhere to sail. Let go to stop.
        </Text>
      </View>

      <OnboardingOverlay />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0b3d5c',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: '#2b1c12',
    borderBottomWidth: 3,
    borderBottomColor: '#c9a227',
  },
  captainTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  captainPortrait: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#c9a227',
  },
  captainFaceBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2b1c12',
    backgroundColor: '#2b1c12',
  },
  captainTag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffd166',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f4e9cd',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  debugButton: {
    backgroundColor: '#444',
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  debugButtonText: { fontSize: 14 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  headerText: {
    color: '#f4e9cd',
    fontSize: 15,
  },
  crewButton: {
    backgroundColor: '#c9a227',
    borderWidth: 1,
    borderColor: '#7a5a1e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  heatTrack: {
    height: 18,
    backgroundColor: '#1a1008',
    borderWidth: 1,
    borderColor: '#7a5a1e',
    borderRadius: 9,
    marginTop: 8,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  heatFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 9,
  },
  heatLabel: {
    fontSize: 11,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
  },
  crewButtonText: {
    color: '#2b1c12',
    fontWeight: '700',
  },
  questTracker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 209, 102, 0.12)',
    borderWidth: 1,
    borderColor: '#c9a227',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 8,
  },
  questTrackerLabel: {
    color: '#ffd166',
    fontWeight: '800',
    fontSize: 11,
  },
  questTrackerText: {
    color: '#f4e9cd',
    fontSize: 12,
    marginLeft: 8,
    flexShrink: 1,
    textAlign: 'right',
  },
  mapContainer: {
    flex: 1,
    marginHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#124d73',
    overflow: 'hidden',
  },
  world: {
    position: 'absolute',
    backgroundColor: '#124d73',
  },
  building: {
    position: 'absolute',
    width: BUILDING_SIZE,
    height: BUILDING_SIZE,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#f4e9cd',
  },
  // Buildings whose type emoji isn't already shaped like a structure (tavern's mugs, fishmonger's
  // fish, smithy's hammer, ...) get a plain house as a base instead, with the real type emoji
  // sitting on top of it like a small badge on the roof.
  buildingHouseBase: {
    fontSize: 30,
  },
  buildingTypeBadge: {
    position: 'absolute',
    top: 3,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 14,
    zIndex: 2,
  },
  landmark: {
    position: 'absolute',
    width: BUILDING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // The garden/yard tint itself now renders as an SVG circle in the streets layer (so roads
  // paint over it), not here — this is just the plain icon container.
  house: {
    position: 'absolute',
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  houseEmoji: {
    fontSize: 18,
  },
  scenery: {
    position: 'absolute',
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streetNpc: {
    position: 'absolute',
    width: 10,
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streetNpcEmoji: {
    fontSize: 7,
  },
  // Positioned over the walking figure's torso only (roughly where a shirt sits on a 7pt-tall
  // glyph centered in a 10x10 box) — tuned against real screenshots, not exact font metrics.
  streetNpcClothingPatch: {
    position: 'absolute',
    left: 3.2,
    top: 3.6,
    width: 3.6,
    height: 2,
    borderRadius: 1,
  },
  buildingEmoji: {
    fontSize: 24,
  },
  questMarkerIcon: {
    width: 26,
    height: 26,
  },
  buildingQuestIndicator: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    zIndex: 1,
  },
  questMarkerAvailable: {
    borderColor: '#ffd166',
  },
  questMarkerAccepted: {
    borderColor: '#ff8c42',
  },
  questMarkerDone: {
    borderColor: '#4caf50',
    opacity: 0.6,
  },
  resourceNode: {
    position: 'absolute',
    width: BUILDING_SIZE - 8,
    height: BUILDING_SIZE - 8,
    borderRadius: (BUILDING_SIZE - 8) / 2,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  resourceNodeReady: {
    borderColor: '#4caf50',
  },
  resourceNodeCooling: {
    borderColor: '#666',
    opacity: 0.45,
  },
  salvageLocked: {
    borderColor: '#444',
    opacity: 0.3,
  },
  rescueMarkerEmpty: {
    borderColor: '#777',
    opacity: 0.55,
  },
  resourceToast: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    alignSelf: 'center',
    maxWidth: 420,
    backgroundColor: 'rgba(6, 35, 49, 0.92)',
    borderWidth: 1,
    borderColor: '#ffd166',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  resourceToastText: {
    color: '#f4e9cd',
    fontWeight: '700',
    fontSize: 14,
  },
  buildingPrompt: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    alignSelf: 'center',
    maxWidth: 420,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(43, 28, 18, 0.95)',
    borderWidth: 2,
    borderColor: '#ffd166',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  buildingPromptEmoji: {
    fontSize: 22,
  },
  buildingPromptText: {
    color: '#f4e9cd',
    fontWeight: '800',
    fontSize: 15,
  },
  compassBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 2,
    borderColor: '#f4e9cd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassEmoji: {
    fontSize: 26,
  },
  edgeIndicator: {
    position: 'absolute',
    width: EDGE_ICON_SIZE,
    height: EDGE_ICON_SIZE,
    borderRadius: EDGE_ICON_SIZE / 2,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 2,
    borderColor: '#f4e9cd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  edgeIndicatorEmoji: {
    fontSize: 17,
  },
  fort: {
    position: 'absolute',
    width: BUILDING_SIZE,
    height: BUILDING_SIZE,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  fortLocked: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderColor: '#777',
    opacity: 0.6,
  },
  fortAvailable: {
    backgroundColor: 'rgba(122, 31, 31, 0.5)',
    borderColor: '#ffd166',
  },
  fortDefeated: {
    backgroundColor: 'rgba(44, 122, 75, 0.5)',
    borderColor: '#4caf50',
  },
  blackPearlMarkerGuarded: {
    backgroundColor: 'rgba(122, 31, 31, 0.5)',
    borderColor: '#ffd166',
  },
  blackPearlMarkerCaptured: {
    backgroundColor: 'rgba(44, 122, 75, 0.5)',
    borderColor: '#4caf50',
  },
  monkeyOnDeck: {
    position: 'absolute',
    width: 20,
    height: 20,
    left: '20%',
    top: '18%',
  },
  player: {
    position: 'absolute',
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerSprite: {
    width: PLAYER_SIZE * 1.5,
    height: PLAYER_SIZE * 1.5,
  },
  shipWrap: {
    width: SHIP_SPRITE_SIZE,
    height: SHIP_SPRITE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shipSprite: {
    width: SHIP_SPRITE_SIZE,
    height: SHIP_SPRITE_SIZE,
  },
  shipWake: {
    position: 'absolute',
    width: SHIP_WAKE_SIZE,
    height: SHIP_WAKE_SIZE,
    opacity: 0.85,
  },
  merchantShipFlash: {
    position: 'absolute',
  },
  miniMap: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: MINIMAP_SIZE,
    height: MINIMAP_SIZE,
    borderRadius: MINIMAP_SIZE / 2,
    borderWidth: 3,
    borderColor: '#c9a227',
    overflow: 'hidden',
    backgroundColor: '#124d73',
  },
  joystickBase: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(244, 233, 205, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(244, 233, 205, 0.4)',
  },
  joystickKnob: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 209, 102, 0.85)',
  },
  footer: {
    padding: 16,
    backgroundColor: '#0b3d5c',
  },
  islandDescription: {
    color: '#f4e9cd',
    fontSize: 14,
    fontStyle: 'italic',
  },
  statusMessage: {
    color: '#ffd166',
    marginTop: 6,
    fontSize: 13,
    fontWeight: '600',
  },
});
