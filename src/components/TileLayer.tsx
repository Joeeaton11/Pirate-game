import React from 'react';
import { Image, ImageSourcePropType, View } from 'react-native';

export interface TileCell {
  /** Destination column/row in the rendered grid. */
  col: number;
  row: number;
  /** Source column/row of the desired tile within the sheet. */
  tileCol: number;
  tileRow: number;
}

interface TileLayerProps {
  source: ImageSourcePropType;
  /** Size of one tile in the source sheet, in px. */
  tileSize: number;
  /** Full source sheet dimensions, in px. */
  sheetWidth: number;
  sheetHeight: number;
  /** On-screen size of one destination tile, in px (defaults to tileSize — no scaling). */
  displayTileSize?: number;
  cells: TileCell[];
}

/** Renders a sparse grid of cropped sprites from a single tileset sheet, using the classic
 * absolute-positioned-image-inside-an-overflow-hidden-box technique (works identically on
 * react-native-web and native). */
export default function TileLayer({
  source,
  tileSize,
  sheetWidth,
  sheetHeight,
  displayTileSize,
  cells,
}: TileLayerProps) {
  const displaySize = displayTileSize ?? tileSize;
  const scale = displaySize / tileSize;

  return (
    <>
      {cells.map((cell) => (
        <View
          key={`${cell.col},${cell.row}`}
          style={{
            position: 'absolute',
            left: cell.col * displaySize,
            top: cell.row * displaySize,
            width: displaySize,
            height: displaySize,
            overflow: 'hidden',
          }}
        >
          <Image
            source={source}
            style={{
              position: 'absolute',
              left: -cell.tileCol * tileSize * scale,
              top: -cell.tileRow * tileSize * scale,
              width: sheetWidth * scale,
              height: sheetHeight * scale,
            }}
          />
        </View>
      ))}
    </>
  );
}
