/**
 * Plan view: the map as an architect's drawing — ink outlines on drafting paper, no art.
 * Tortuga's site plan is one generated SVG (tools/blueprint/architect.py); every other island is
 * drawn as a plain coastline outline until it gets its own blueprint.
 */
import React from 'react';
import Svg, { Path, SvgXml, Text as SvgText } from 'react-native-svg';
import { ISLAND_LIST, WORLD_HEIGHT, WORLD_WIDTH } from '../data/islands';
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
  const others = ISLAND_LIST.filter((i) => i.id !== 'tortuga_cove');
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
