/**
 * The Tortuga blueprint drawn as a flat, colour-coded plan (terrain, water, roads, buildings with
 * their doors, trees, props, names) — the layout every art pass is built on. Generated data lives
 * in tortugaBlueprint.generated.ts (tools/blueprint/). Static, so it renders once.
 */
import React from 'react';
import Svg, { G, Path, Polyline, Rect, Text as SvgText } from 'react-native-svg';
import { BUILDINGS } from '../data/buildings';
import { PAINTED_DOORS } from '../town/tortugaPainted.generated';
import {
  BP_BEACH,
  BP_BRIDGES,
  BP_BUILDINGS,
  BP_COAST,
  BP_LABELS,
  BP_PLAZAS,
  BP_POIS,
  BP_PROPS,
  BP_ROADS,
  BP_SEA_ZONES,
  BP_TOWN,
  BP_TOWN_BUILDINGS,
  BP_TREES,
  BP_WATER,
  BP_ZONES,
} from './tortugaBlueprint.generated';

// Same colours as tools/blueprint/palette.py.
const PAL: Record<string, string> = {
  grass: '#86b25e', beach: '#e8d49c', jungle: '#3e7438', forest: '#4f8a45', fields: '#cdb35e',
  rock: '#9d9585', graveyard: '#8f9f7c', garden: '#93c46c', water: '#4ea6cc',
  main: '#b8936a', lane: '#c4a479', path: '#cdb48c', plaza: '#d3c7ab',
  street: '#d3c7ab', wood: '#a5784a', townwater: '#2f78a6', towngarden: '#5d8e47', sand: '#e8d49c',
  outline: '#3a2a1a', door: '#e8432e', label: '#2a1d10',
  b_civic: '#b4a7cc', b_shop: '#e3aa5c', b_tavern: '#db744f', b_warehouse: '#ab8f6b', b_market: '#e3c45c',
  b_home: '#cc916f', b_fort: '#8f8f8f', b_manor: '#bb82b3', b_ruin: '#8c8272', b_landmark: '#f2efe6',
  b_shed: '#a98b66', b_town: '#c97b5c',
  swamp: '#5d7d55', palms: '#a3c46e', sugarcane: '#b4c95a', reef: '#c78f86', bridge: '#8a5a32', roadEdge: '#785c3e',
  poi_treasure: '#f2c230', poi_resource: '#55c8e8', poi_quest: '#e8432e', poi_landmark: '#f2c230',
};
const TREE_STYLE = [
  { r: 4, fill: '#2a5a29' }, // jungle
  { r: 5, fill: '#2f6b2d' }, // tree
  { r: 3.5, fill: '#5f9a35' }, // palm
  { r: 4, fill: '#7d776b' }, // rock
  { r: 3.5, fill: '#34503a' }, // mangrove
];
const PROP_ICON: Record<string, string> = {
  signpost: '🪧', well: '🪣', crates: '📦', barrels: '🛢️', cart: '🛒', bench: '🪑', lamp: '🏮',
  cannon: '💣', grave: '✝️', boat: '🛶', fence: '🚧', cave: '🕳️', wreck: '⚓', marked_palm: '🌴',
  campfire: '🔥', still: '🍶',
};

const rectsPath = (flat: number[]) => {
  let d = '';
  for (let i = 0; i < flat.length; i += 4) d += `M${flat[i]} ${flat[i + 2]}H${flat[i + 1]}V${flat[i + 3]}H${flat[i]}Z`;
  return d;
};
const circlesPath = (pts: [number, number][], r: number) =>
  pts.map(([x, y]) => `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`).join('');

const NAME = new Map(BUILDINGS.map((b) => [b.id, b.name]));
// Plan extent, island-relative.
const X0 = -620;
const Y0 = -540;
const W = 1240;
const H = 1080;

function gridPath() {
  let d = '';
  for (let x = -600; x <= 600; x += 50) d += `M${x} ${Y0}V${Y0 + H}`;
  for (let y = -500; y <= 500; y += 50) d += `M${X0} ${y}H${X0 + W}`;
  return d;
}

function Label({ x, y, text, size, color = PAL.label }: { x: number; y: number; text: string; size: number; color?: string }) {
  return (
    <>
      <SvgText x={x} y={y} fontSize={size} fontFamily="Arial, Helvetica, sans-serif" fontWeight="bold" textAnchor="middle" fill="#fffaf0" stroke="#fffaf0" strokeWidth={size * 0.22}>
        {text}
      </SvgText>
      <SvgText x={x} y={y} fontSize={size} fontFamily="Arial, Helvetica, sans-serif" fontWeight="bold" textAnchor="middle" fill={color}>
        {text}
      </SvgText>
    </>
  );
}

export const BlueprintLayer = React.memo(function BlueprintLayer({ origin }: { origin: { x: number; y: number } }) {
  const trees: [number, number][][] = [[], [], [], [], []];
  for (let i = 0; i < BP_TREES.length; i += 3) trees[BP_TREES[i + 2]].push([BP_TREES[i], BP_TREES[i + 1]]);
  const doors = BP_BUILDINGS.filter((b) => b.door).map((b) => b.door!);
  const townDoorD = PAINTED_DOORS.map((d) => `M${d.x - 2} ${d.y - 1.5}h4v3h-4Z`).join('');

  return (
    <Svg
      pointerEvents="none"
      style={{ position: 'absolute', left: origin.x + X0, top: origin.y + Y0, width: W, height: H }}
      width={W}
      height={H}
      viewBox={`${X0} ${Y0} ${W} ${H}`}
    >
      {/* 0. Offshore (reef) */}
      {BP_SEA_ZONES.map((z, i) => (
        <Path key={`s${i}`} d={z.d} fill={PAL[z.t]} stroke="#e9d3c4" strokeWidth={0.8} strokeDasharray="3 2" />
      ))}

      {/* 1. Terrain */}
      <Path d={BP_COAST} fill={PAL.grass} stroke={PAL.outline} strokeWidth={1.5} />
      <Path d={BP_BEACH} fill={PAL.beach} fillRule="evenodd" />
      {BP_ZONES.map((z, i) => (
        <Path key={`z${i}`} d={z.d} fill={PAL[z.t]} fillRule="evenodd" />
      ))}
      <Path d={BP_WATER} fill={PAL.water} />

      {/* 2. Roads (dark edging underneath), bridges and plazas */}
      {BP_ROADS.map((r, i) => (
        <Polyline
          key={`re${i}`}
          points={r.pts.map((p) => p.join(',')).join(' ')}
          fill="none"
          stroke={PAL.roadEdge}
          strokeWidth={r.w + 1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {BP_ROADS.map((r, i) => (
        <Polyline
          key={`r${i}`}
          points={r.pts.map((p) => p.join(',')).join(' ')}
          fill="none"
          stroke={PAL[r.kind]}
          strokeWidth={r.w}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      <Path d={BP_BRIDGES} fill={PAL.bridge} stroke={PAL.outline} strokeWidth={0.6} />
      {BP_PLAZAS.map(([n, l, r, t, b]) => (
        <Rect key={n} x={l} y={t} width={r - l} height={b - t} fill={PAL.plaza} />
      ))}

      {/* 3. The painted town as a plan (derived from its walk map) */}
      <Path d={rectsPath(BP_TOWN.street)} fill={PAL.street} />
      <Path d={rectsPath(BP_TOWN.sand)} fill={PAL.sand} />
      <Path d={rectsPath(BP_TOWN.wood)} fill={PAL.wood} />
      <Path d={rectsPath(BP_TOWN.water)} fill={PAL.townwater} />
      <Path d={rectsPath(BP_TOWN.garden)} fill={PAL.towngarden} />
      <Path d={rectsPath(BP_TOWN_BUILDINGS)} fill={PAL.b_town} stroke={PAL.outline} strokeWidth={0.8} />

      {/* 4. Trees and rocks */}
      {trees.map((pts, k) => (
        <Path key={`t${k}`} d={circlesPath(pts, TREE_STYLE[k].r)} fill={TREE_STYLE[k].fill} />
      ))}

      {/* 5. Buildings and doors */}
      {BP_BUILDINGS.map((b, i) => (
        <Rect key={`b${i}`} x={b.l} y={b.t} width={b.w} height={b.h} fill={PAL[`b_${b.kind}`] ?? PAL.b_home} stroke={PAL.outline} strokeWidth={0.8} />
      ))}
      <Path d={doors.map(([x, y]) => `M${x - 2.5} ${y - 2.5}h5v5h-5Z`).join('') + townDoorD} fill={PAL.door} />

      {/* 6. Props */}
      {BP_PROPS.map(([k, x, y], i) => (
        <SvgText key={`p${i}`} x={x} y={y + 2} fontSize={5.5} textAnchor="middle">
          {PROP_ICON[k] ?? '•'}
        </SvgText>
      ))}

      {/* 7. Points of interest: treasure/landmark (gold), resource (blue), quest (red) */}
      {BP_POIS.map(([k, id, x, y]) =>
        k === 'quest' ? (
          <Path key={`q${id}`} d={`M${x - 3.5} ${y}a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0 -7 0`} fill={PAL.poi_quest} stroke="#fff" strokeWidth={0.8} />
        ) : (
          <Path key={`q${id}`} d={`M${x} ${y - 4}L${x + 4} ${y}L${x} ${y + 4}L${x - 4} ${y}Z`} fill={PAL[`poi_${k}`]} stroke={PAL.outline} strokeWidth={0.6} />
        )
      )}

      {/* 8. Planning grid and names */}
      <Path d={gridPath()} stroke="rgba(30,40,60,0.18)" strokeWidth={0.5} />
      <G>
        {BP_BUILDINGS.filter((b) => b.kind !== 'home' || b.label !== 'Cottage').map((b, i) => (
          <Label key={`bl${i}`} x={b.l + b.w / 2} y={b.t + b.h / 2 + 1.2} text={(b.id && NAME.get(b.id)) || b.label} size={3.4} />
        ))}
        {PAINTED_DOORS.map((d) => (
          <Label key={`tl${d.id}`} x={d.x} y={d.y - 4} text={NAME.get(d.id) ?? d.id} size={2.6} />
        ))}
        {BP_LABELS.map(([x, y, t, s], i) => (
          <Label key={`l${i}`} x={x} y={y} text={t} size={s === 'district' ? 9 : 5} color={s === 'district' ? '#1d2c4a' : PAL.label} />
        ))}
      </G>
    </Svg>
  );
});
