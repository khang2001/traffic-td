import { DIRECTION } from './common';
import { MAP_CONFIG } from './config';
import type { Direction, Position, Tile } from './types';

export function exhaustiveGuard(value: never): never {
  throw new Error(`Unhandled value: ${String(value)}`);
}

/** Vector → 4-way direction. Vertical wins ties, matching BaseMoveState in portfolio-game. */
export function directionFromVector(dx: number, dy: number, fallback: Direction): Direction {
  if (dx === 0 && dy === 0) return fallback;
  if (Math.abs(dy) >= Math.abs(dx)) return dy < 0 ? DIRECTION.UP : DIRECTION.DOWN;
  return dx < 0 ? DIRECTION.LEFT : DIRECTION.RIGHT;
}

export function distSq(a: Position, b: Position): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

export function tileCenter(tile: Tile): Position {
  const s = MAP_CONFIG.tileSize;
  return { x: tile.col * s + s / 2, y: tile.row * s + s / 2 };
}

export function pixelToTile(p: Position): Tile | null {
  const s = MAP_CONFIG.tileSize;
  const col = Math.floor(p.x / s);
  const row = Math.floor(p.y / s);
  if (col < 0 || row < 0 || col >= MAP_CONFIG.cols || row >= MAP_CONFIG.rows) return null;
  return { col, row };
}

export function tileKey(tile: Tile): string {
  return `${tile.col},${tile.row}`;
}

export function maxBy<T>(items: readonly T[], score: (item: T) => number): T | null {
  let best: T | null = null;
  let bestScore = -Infinity;
  for (const item of items) {
    const s = score(item);
    if (s > bestScore) {
      best = item;
      bestScore = s;
    }
  }
  return best;
}
