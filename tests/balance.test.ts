// Balance guard: a simple scripted bot must clear the early game without leaks.
// `BALANCE_REPORT=1 npx vitest run tests/balance.test.ts` prints the full 20-wave run.
import { GAME_CONFIG, TOWER_CONFIG } from '../src/engine/common/config';
import type { TowerKind } from '../src/engine/common/types';
import { GameEngine } from '../src/engine/engine';

const SPOTS = [
  { col: 4, row: 3 }, { col: 6, row: 8 }, { col: 6, row: 3 }, { col: 11, row: 8 },
  { col: 4, row: 8 }, { col: 13, row: 5 }, { col: 11, row: 5 }, { col: 6, row: 6 },
  { col: 13, row: 8 }, { col: 4, row: 5 }, { col: 8, row: 8 }, { col: 15, row: 5 },
  { col: 9, row: 8 }, { col: 15, row: 3 }, { col: 17, row: 5 }, { col: 11, row: 6 },
];
const ORDER: TowerKind[] = ['RAPID', 'RAPID', 'SNIPER', 'SPLASH', 'RAPID', 'SNIPER', 'SPLASH', 'SNIPER'];

function playBot() {
  const e = new GameEngine();
  let spot = 0;
  const leaks: number[] = [];
  for (let w = 1; w <= GAME_CONFIG.totalWaves && e.phase !== 'LOST'; w++) {
    for (let guard = 0; guard < 20; guard++) {
      const kind = ORDER[spot % ORDER.length];
      if (spot < SPOTS.length && e.gold >= TOWER_CONFIG[kind].cost) {
        e.selectBuild(kind);
        e.placeTower(SPOTS[spot++]);
        continue;
      }
      const up = e.towers
        .filter((t) => t.upgradeCost() !== null)
        .sort((a, b) => a.upgradeCost()! - b.upgradeCost()!)[0];
      if (up && spot >= 3 && e.gold >= up.upgradeCost()!) {
        e.upgradeTower(up.id);
        continue;
      }
      break;
    }
    const lives = e.lives;
    e.startWave();
    for (let i = 0; i < 60 * 300 && e.phase === 'WAVE'; i++) e.tick(GAME_CONFIG.tickSeconds);
    leaks.push(lives - e.lives);
  }
  return { engine: e, leaks };
}

describe('balance', () => {
  it('a scripted bot clears waves 1–8 with no leaks', () => {
    const { engine, leaks } = playBot();
    if (process.env.BALANCE_REPORT) {
      console.log(leaks.map((l, i) => `w${i + 1}:${l}`).join(' '), engine.phase, `lives ${engine.lives}`);
    }
    expect(leaks.slice(0, 8)).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
  });
});
