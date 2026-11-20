/**
 * Plan view: the map as an architect's drawing — ink outlines on drafting paper, no art.
 * Tortuga's site plan is one generated SVG (tools/blueprint/architect.py); every other island is
 * drawn as a plain coastline outline until it gets its own blueprint.
 */
import React from 'react';
import Svg, { Path, SvgXml, Text as SvgText } from 'react-native-svg';
import { ISLAND_LIST, WORLD_HEIGHT, WORLD_WIDTH } from '../data/islands';
import { TORTUGA_PLAN_SVG } from './tortugaPlanSvg';

export const PLAN_PAPER = '#f4f1e6';
const INK = '#2b2a27';
const GRID = '#8fb0cf';

/** Tortuga's site plan, placed at the island's world position (static, renders once). */
export const BlueprintLayer = React.memo(function BlueprintLayer({ origin }: { origin: { x: number; y: number } }) {
  return (
    <SvgXml
      xml={TORTUGA_PLAN_SVG}
      width={1240}
      height={1080}
      pointerEvents="none"
      style={{ position: 'absolute', left: origin.x - 620, top: origin.y - 540, width: 1240, height: 1080 }}
    />
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
