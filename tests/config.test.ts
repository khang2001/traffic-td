import { validateConfig } from '../src/engine/common/validate-config';
import { buildMap } from '../src/engine/map';
import { MAP_CONFIG } from '../src/engine/common/config';

describe('config.ts', () => {
  it('passes validateConfig', () => {
    expect(validateConfig()).toEqual([]);
  });

  it('builds a continuous path from the corner tiles', () => {
    const map = buildMap();
    expect(map.pathTiles[0]).toEqual(MAP_CONFIG.pathCorners[0]);
    expect(map.pathTiles.at(-1)).toEqual(MAP_CONFIG.pathCorners.at(-1));
    for (let i = 1; i < map.pathTiles.length; i++) {
      const a = map.pathTiles[i - 1];
      const b = map.pathTiles[i];
      expect(Math.abs(a.col - b.col) + Math.abs(a.row - b.row)).toBe(1);
    }
    expect(map.waypoints).toHaveLength(MAP_CONFIG.pathCorners.length);
  });
});
