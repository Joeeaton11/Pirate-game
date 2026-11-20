/**
 * In-game Plan editor: drag Tortuga's buildings, props and trees to new spots. Moves are kept as
 * offsets keyed by each item's stable plan key, saved on the device, and exported as JSON that
 * tools/blueprint/edits_tortuga.json takes as-is — the builder then bakes them into the plan.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Share } from 'react-native';
import { BP_BUILDINGS, BP_PROP_KEYS, BP_PROPS, BP_TREE_KEYS, BP_TREES } from './tortugaBlueprint.generated';

export type EditKind = 'buildings' | 'props' | 'trees' | 'added';
/** Something placed in the editor: a cottage, a tree, or a prop of the given kind. */
export interface AddedItem {
  key: string;
  what: string;
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface PlanEdits {
  buildings: Record<string, [number, number]>;
  props: Record<string, [number, number]>;
  trees: Record<string, [number, number]>;
  deleted_trees: string[];
  deleted_buildings: string[];
  deleted_props: string[];
  /** New footprint [w, h] for a resized building. */
  resized: Record<string, [number, number]>;
  added: AddedItem[];
}
export const EMPTY_EDITS: PlanEdits = {
  buildings: {},
  props: {},
  trees: {},
  deleted_trees: [],
  deleted_buildings: [],
  deleted_props: [],
  resized: {},
  added: [],
};
/** What the editor's Add buttons place, with their footprint. */
export const ADDABLE: Record<string, { w: number; h: number; label: string }> = {
  cottage: { w: 18, h: 16, label: '🏠 Cottage' },
  tree: { w: 8, h: 8, label: '🌳 Tree' },
  well: { w: 5, h: 5, label: '⛲ Well' },
  crates: { w: 5, h: 5, label: '📦 Crates' },
};
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

const off = (e: PlanEdits, it: EditItem): [number, number] => (it.kind === 'added' ? [0, 0] : e[it.kind][it.key] ?? [0, 0]);
/** Where an item now sits with the edits applied. */
export function itemPos(e: PlanEdits, it: EditItem) {
  const [dx, dy] = off(e, it);
  return { x: it.x + dx, y: it.y + dy };
}
/** Its footprint with any resize applied. */
export function itemSize(e: PlanEdits, it: EditItem) {
  const r = it.kind === 'buildings' ? e.resized[it.key] : undefined;
  return { w: r ? r[0] : it.w, h: r ? r[1] : it.h };
}
export function isDeleted(e: PlanEdits, it: EditItem) {
  return (
    (it.kind === 'trees' && e.deleted_trees.includes(it.key)) ||
    (it.kind === 'buildings' && e.deleted_buildings.includes(it.key)) ||
    (it.kind === 'props' && e.deleted_props.includes(it.key))
  );
}
/** Every editable item: the plan's own plus anything added in the editor. */
export function allItems(e: PlanEdits): EditItem[] {
  return EDIT_ITEMS.concat(e.added.map((a) => ({ kind: 'added' as const, key: a.key, label: a.what, x: a.x, y: a.y, w: a.w, h: a.h })));
}

/** The item under an island-relative point: buildings first, then props, then trees. */
export function hitTest(e: PlanEdits, x: number, y: number): EditItem | null {
  let best: EditItem | null = null;
  let bestD = Infinity;
  for (const it of allItems(e)) {
    if (isDeleted(e, it)) continue;
    const p = itemPos(e, it);
    const sz = itemSize(e, it);
    const inside = Math.abs(x - p.x) <= sz.w / 2 + 1.5 && Math.abs(y - p.y) <= sz.h / 2 + 1.5;
    if (!inside) continue;
    const pri = it.kind === 'added' ? -1000 : it.kind === 'buildings' ? 0 : it.kind === 'props' ? 1000 : 2000;
    const d = pri + Math.hypot(x - p.x, y - p.y);
    if (d < bestD) {
      bestD = d;
      best = it;
    }
  }
  return best;
}

const half = (v: number) => Math.round(v * 2) / 2;
export function withOffset(e: PlanEdits, it: EditItem, dx: number, dy: number): PlanEdits {
  if (it.kind === 'added') return e; // added items move with dragTo (they have no offset)
  const next = { ...e[it.kind] };
  if (half(dx) === 0 && half(dy) === 0) delete next[it.key];
  else next[it.key] = [half(dx), half(dy)];
  return { ...e, [it.kind]: next };
}
/** Start position used when dragging begins: offset for plan items, absolute for added ones. */
export function dragStart(e: PlanEdits, it: EditItem): [number, number] {
  if (it.kind === 'added') {
    const a = e.added.find((x) => x.key === it.key);
    return a ? [a.x, a.y] : [it.x, it.y];
  }
  return e[it.kind][it.key] ?? [0, 0];
}
/** Drag: an offset for plan items, a new position for added ones. */
export function dragTo(e: PlanEdits, it: EditItem, start: [number, number], tx: number, ty: number): PlanEdits {
  if (it.kind !== 'added') return withOffset(e, it, start[0] + tx, start[1] + ty);
  return { ...e, added: e.added.map((a) => (a.key === it.key ? { ...a, x: half(start[0] + tx), y: half(start[1] + ty) } : a)) };
}
export function addItem(e: PlanEdits, what: string, x: number, y: number): { edits: PlanEdits; key: string } {
  const d = ADDABLE[what];
  const n = e.added.reduce((m, a) => Math.max(m, Number(a.key.slice(3)) || 0), 0) + 1;
  const key = `new${n}`;
  return { edits: { ...e, added: [...e.added, { key, what, x: half(x), y: half(y), w: d.w, h: d.h }] }, key };
}
export function deleteItem(e: PlanEdits, it: EditItem): PlanEdits {
  if (it.kind === 'added') return { ...e, added: e.added.filter((a) => a.key !== it.key) };
  const list = it.kind === 'trees' ? 'deleted_trees' : it.kind === 'buildings' ? 'deleted_buildings' : 'deleted_props';
  return e[list].includes(it.key) ? e : { ...e, [list]: [...e[list], it.key] };
}
/** Grow or shrink a cottage (or an added one) by `step` units each way, within sensible bounds. */
export function resizeItem(e: PlanEdits, it: EditItem, step: number): PlanEdits {
  const clamp = (v: number) => Math.max(10, Math.min(36, v));
  if (it.kind === 'added') {
    return { ...e, added: e.added.map((a) => (a.key === it.key && a.what === 'cottage' ? { ...a, w: clamp(a.w + step), h: clamp(a.h + step) } : a)) };
  }
  if (it.kind !== 'buildings') return e;
  const sz = itemSize(e, it);
  return { ...e, resized: { ...e.resized, [it.key]: [clamp(sz.w + step), clamp(sz.h + step)] } };
}
export function findItem(e: PlanEdits, key: string | null): EditItem | null {
  return key ? allItems(e).find((it) => it.key === key) ?? null : null;
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
  return (
    Object.keys(e.buildings).length +
    Object.keys(e.props).length +
    Object.keys(e.trees).length +
    e.deleted_trees.length +
    e.deleted_buildings.length +
    e.deleted_props.length +
    Object.keys(e.resized).length +
    e.added.length
  );
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
