import { MAP_CONFIG } from './common/config';
import type { Position, Tile } from './common/types';
import { tileCenter, tileKey } from './common/utils';

export interface GameMap {
  readonly cols: number;
  readonly rows: number;
  readonly tileSize: number;
  readonly pathTiles: readonly Tile[];
  readonly pathKeys: ReadonlySet<string>;
  readonly waypoints: readonly Position[];
}

/** Fills the straight runs between MAP_CONFIG.pathCorners; waypoints are the corner centers. */
export function buildMap(corners: readonly Tile[] = MAP_CONFIG.pathCorners): GameMap {
  const pathTiles: Tile[] = [];
  for (let i = 0; i < corners.length - 1; i++) {
    const a = corners[i];
    const b = corners[i + 1];
    const stepCol = Math.sign(b.col - a.col);
    const stepRow = Math.sign(b.row - a.row);
    let col = a.col;
    let row = a.row;
    if (i === 0) pathTiles.push({ col, row });
    while (col !== b.col || row !== b.row) {
      col += stepCol;
      row += stepRow;
      pathTiles.push({ col, row });
    }
  }
  return {
    cols: MAP_CONFIG.cols,
    rows: MAP_CONFIG.rows,
    tileSize: MAP_CONFIG.tileSize,
    pathTiles,
    pathKeys: new Set(pathTiles.map(tileKey)),
    waypoints: corners.map(tileCenter),
  };
}
