/**
 * In-game Plan editor: drag Tortuga's buildings, props and trees to new spots. Moves are kept as
 * offsets keyed by each item's stable plan key, saved on the device, and exported as JSON that
 * tools/blueprint/edits_tortuga.json takes as-is — the builder then bakes them into the plan.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Share } from 'react-native';
import { BP_BUILDINGS, BP_PROP_KEYS, BP_PROPS, BP_TREE_KEYS, BP_TREES } from './tortugaBlueprint.generated';

export type EditKind = 'buildings' | 'props' | 'trees';
export interface PlanEdits {
  buildings: Record<string, [number, number]>;
  props: Record<string, [number, number]>;
  trees: Record<string, [number, number]>;
  deleted_trees: string[];
}
export const EMPTY_EDITS: PlanEdits = { buildings: {}, props: {}, trees: {}, deleted_trees: [] };
const STORE_KEY = 'plan-edits-tortuga';

export interface EditItem {
  kind: EditKind;
  key: string;
  label: string;
  /** Plan position (island-relative) before this session's offset. */
  x: number;
  y: number;
  w: number;
  h: number;
}

export const EDIT_ITEMS: EditItem[] = [
  ...BP_BUILDINGS.map((b) => ({ kind: 'buildings' as const, key: b.key, label: b.label, x: b.l + b.w / 2, y: b.t + b.h / 2, w: b.w, h: b.h })),
  ...BP_PROPS.map(([k, x, y], i) => ({ kind: 'props' as const, key: BP_PROP_KEYS[i], label: k, x, y, w: 5, h: 5 })),
  ...BP_TREE_KEYS.map((key, i) => ({ kind: 'trees' as const, key, label: 'tree', x: BP_TREES[i * 3], y: BP_TREES[i * 3 + 1], w: 8, h: 8 })),
];

const off = (e: PlanEdits, it: EditItem) => e[it.kind][it.key] ?? [0, 0];
/** Where an item now sits with the edits applied. */
export function itemPos(e: PlanEdits, it: EditItem) {
  const [dx, dy] = off(e, it);
  return { x: it.x + dx, y: it.y + dy };
}

/** The item under an island-relative point: buildings first, then props, then trees. */
export function hitTest(e: PlanEdits, x: number, y: number): EditItem | null {
  let best: EditItem | null = null;
  let bestD = Infinity;
  for (const it of EDIT_ITEMS) {
    if (it.kind === 'trees' && e.deleted_trees.includes(it.key)) continue;
    const p = itemPos(e, it);
    const inside = Math.abs(x - p.x) <= it.w / 2 + 1.5 && Math.abs(y - p.y) <= it.h / 2 + 1.5;
    if (!inside) continue;
    const pri = it.kind === 'buildings' ? 0 : it.kind === 'props' ? 1000 : 2000;
    const d = pri + Math.hypot(x - p.x, y - p.y);
    if (d < bestD) {
      bestD = d;
      best = it;
    }
  }
  return best;
}

export function withOffset(e: PlanEdits, it: EditItem, dx: number, dy: number): PlanEdits {
  return { ...e, [it.kind]: { ...e[it.kind], [it.key]: [Math.round(dx * 2) / 2, Math.round(dy * 2) / 2] } };
}

export async function loadEdits(): Promise<PlanEdits> {
  try {
    const raw = await AsyncStorage.getItem(STORE_KEY);
    return raw ? { ...EMPTY_EDITS, ...JSON.parse(raw) } : EMPTY_EDITS;
  } catch {
    return EMPTY_EDITS;
  }
}
export function saveEdits(e: PlanEdits) {
  AsyncStorage.setItem(STORE_KEY, JSON.stringify(e)).catch(() => {});
}

export function editCount(e: PlanEdits) {
  return Object.keys(e.buildings).length + Object.keys(e.props).length + Object.keys(e.trees).length + e.deleted_trees.length;
}

/** Copy (web) or share (phone) the edits as JSON for tools/blueprint/edits_tortuga.json. */
export async function exportEdits(e: PlanEdits): Promise<string> {
  const json = JSON.stringify(e, null, 1);
  try {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(json);
      return 'Edits copied — paste them to Claude';
    }
    await Share.share({ message: json });
    return 'Edits shared';
  } catch {
    return 'Could not copy the edits';
  }
}
