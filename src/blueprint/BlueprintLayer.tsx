/**
 * Plan view: the map as an architect's drawing — ink outlines on drafting paper, no art.
 * Tortuga's site plan is one generated SVG (tools/blueprint/architect.py); every other island is
 * drawn as a plain coastline outline until it gets its own blueprint.
 */
import React from 'react';
import Svg, { Path, SvgXml, Text as SvgText } from 'react-native-svg';
import { ISLAND_LIST, ISLANDS, WORLD_HEIGHT, WORLD_WIDTH } from '../data/islands';
import { ISLAND_PLANS } from './islandPlans.generated';
import { DISTRICTS } from './planGameplay';
import { EDIT_ITEMS, itemPos, PlanEdits } from './planEditing';
import { TORTUGA_PLAN_LAYERS } from './tortugaPlanSvg';

export const PLAN_PAPER = '#f4f1e6';
const INK = '#2b2a27';
const GRID = '#8fb0cf';

export const PLAN_LAYERS = TORTUGA_PLAN_LAYERS;
export const DEFAULT_PLAN_LAYERS: Record<string, boolean> = Object.fromEntries(TORTUGA_PLAN_LAYERS.map((l) => [l.id, l.on]));

/** One layer of Tortuga's site plan at the island's world position (static, renders once). */
const PlanLayerSvg = React.memo(function PlanLayerSvg({ svg, left, top }: { svg: string; left: number; top: number }) {
  return (
    <SvgXml
      xml={svg}
      width={1240}
      height={1120}
      pointerEvents="none"
      style={{ position: 'absolute', left, top, width: 1240, height: 1120 }}
    />
  );
});

/** Tortuga's site plan, stacked layer by layer (bottom to top); hidden layers aren't mounted. */
export const BlueprintLayer = React.memo(function BlueprintLayer({
  origin,
  visible,
}: {
  origin: { x: number; y: number };
  visible: Record<string, boolean>;
}) {
  return (
    <>
      {TORTUGA_PLAN_LAYERS.map((l) =>
        l.id === 'paper' || visible[l.id] ? <PlanLayerSvg key={l.id} svg={l.svg} left={origin.x - 620} top={origin.y - 580} /> : null
      )}
    </>
  );
});

/** The rest of the world on the same paper: a 50-unit drafting grid and island coastlines. */
export const PlanWorld = React.memo(function PlanWorld() {
  let grid = '';
  for (let x = 0; x <= WORLD_WIDTH; x += 50) grid += `M${x} 0V${WORLD_HEIGHT}`;
  for (let y = 0; y <= WORLD_HEIGHT; y += 50) grid += `M0 ${y}H${WORLD_WIDTH}`;
  const others = ISLAND_LIST.filter((i) => i.id !== 'tortuga_cove' && !ISLAND_PLANS[i.id]);
  return (
    <Svg width={WORLD_WIDTH} height={WORLD_HEIGHT} pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0 }}>
      <Path d={grid} stroke={GRID} strokeWidth={0.3} opacity={0.5} fill="none" />
      {others.map((island) => (
        <Path
          key={island.id}
          d={'M' + island.shape.map((p) => `${island.position.x + p.x} ${island.position.y + p.y}`).join('L') + 'Z'}
          fill="none"
          stroke={INK}
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
      ))}
      {others.map((island) => (
        <SvgText
          key={`n${island.id}`}
          x={island.position.x}
          y={island.position.y}
          fontSize={14}
          fontWeight="bold"
          fontFamily="Arial, Helvetica, sans-serif"
          letterSpacing={3}
          textAnchor="middle"
          fill="#1f3b5c"
        >
          {island.name.toUpperCase()}
        </SvgText>
      ))}
    </Svg>
  );
});

/** Plans of the other islands near the camera (only nearby ones are mounted). */
export function PlanIslands({ cam, visible }: { cam: { x: number; y: number }; visible: Record<string, boolean> }) {
  return (
    <>
      {Object.entries(ISLAND_PLANS).map(([id, plan]) => {
        const o = ISLANDS[id]?.position;
        if (!o || Math.hypot(o.x - cam.x, o.y - cam.y) > 1100) return null;
        return plan.layers.map((l) =>
          visible[l.id] ? <PlanLayerSvg key={`${id}-${l.id}`} svg={l.svg} left={o.x - 620} top={o.y - 580} /> : null
        );
      })}
    </>
  );
}

/** Fog over Tortuga's districts until Scally has walked into them. */
export const DiscoveryFog = React.memo(function DiscoveryFog({
  origin,
  discovered,
}: {
  origin: { x: number; y: number };
  discovered: string[];
}) {
  const hidden = DISTRICTS.filter((d) => !discovered.includes(d.name));
  if (!hidden.length) return null;
  return (
    <Svg
      width={1240}
      height={1120}
      viewBox="-620 -580 1240 1120"
      pointerEvents="none"
      style={{ position: 'absolute', left: origin.x - 620, top: origin.y - 580, width: 1240, height: 1120 }}
    >
      {hidden.map((d) => {
        const pts = [];
        for (let i = 0; i < d.poly.length; i += 2) pts.push(`${d.poly[i]} ${d.poly[i + 1]}`);
        return (
          <React.Fragment key={d.name}>
            <Path d={`M${pts.join('L')}Z`} fill="#d9d4c4" fillOpacity={0.92} stroke="#8d8676" strokeWidth={0.8} strokeDasharray="4 2" />
            <SvgText x={d.cx} y={d.cy} fontSize={10} fontWeight="bold" fontFamily="Arial, Helvetica, sans-serif" textAnchor="middle" fill="#8d8676">
              ?
            </SvgText>
            <SvgText x={d.cx} y={d.cy + 9} fontSize={4} fontFamily="Arial, Helvetica, sans-serif" letterSpacing={1} textAnchor="middle" fill="#8d8676">
              UNEXPLORED
            </SvgText>
          </React.Fragment>
        );
      })}
    </Svg>
  );
});

/** Plan editor overlay: moved items drawn at their new spot (orange), ghosts where they were. */
export function EditOverlay({ origin, edits, selected }: { origin: { x: number; y: number }; edits: PlanEdits; selected: string | null }) {
  const moved = EDIT_ITEMS.filter((it) => edits[it.kind][it.key] || it.key === selected);
  return (
    <Svg
      width={1240}
      height={1120}
      viewBox="-620 -580 1240 1120"
      pointerEvents="none"
      style={{ position: 'absolute', left: origin.x - 620, top: origin.y - 580, width: 1240, height: 1120 }}
    >
      {moved.map((it) => {
        const p = itemPos(edits, it);
        const sel = it.key === selected;
        return (
          <React.Fragment key={`${it.kind}${it.key}`}>
            <Path
              d={`M${it.x - it.w / 2} ${it.y - it.h / 2}h${it.w}v${it.h}h${-it.w}Z`}
              fill="none"
              stroke="#8d8676"
              strokeWidth={0.6}
              strokeDasharray="1.5 1.5"
            />
            <Path
              d={`M${p.x - it.w / 2} ${p.y - it.h / 2}h${it.w}v${it.h}h${-it.w}Z`}
              fill="#e67e22"
              fillOpacity={sel ? 0.3 : 0.15}
              stroke="#d35400"
              strokeWidth={sel ? 1.2 : 0.8}
            />
          </React.Fragment>
        );
      })}
    </Svg>
  );
}
