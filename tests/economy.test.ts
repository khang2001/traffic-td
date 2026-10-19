import { GAME_CONFIG, TOWER_CONFIG, WAVE_CONFIG } from '../src/engine/common/config';
import { GameEngine } from '../src/engine/engine';
import { buildWave } from '../src/engine/waves';

const free = { col: 1, row: 0 };

describe('engine commands and economy', () => {
  it('buys, upgrades and sells with engine-side validation', () => {
    const e = new GameEngine();
    expect(e.gold).toBe(GAME_CONFIG.startingGold);
    expect(e.placeTower(free)).toEqual({ ok: false, reason: 'NO_SELECTION' });
    expect(e.selectBuild('RAPID').ok).toBe(true);
    expect(e.placeTower({ col: 0, row: 2 })).toEqual({ ok: false, reason: 'TILE_BLOCKED' }); // path tile
    expect(e.placeTower(free).ok).toBe(true);
    expect(e.gold).toBe(GAME_CONFIG.startingGold - 70);
    expect(e.placing).toBeNull();

    const id = e.towers[0].id;
    expect(e.upgradeTower(id).ok).toBe(true); // 42
    const afterUpgrade = GAME_CONFIG.startingGold - 70 - 42;
    expect(e.gold).toBe(afterUpgrade);
    e.gold = 10;
    expect(e.upgradeTower(id)).toEqual({ ok: false, reason: 'NOT_ENOUGH_GOLD' });
    expect(e.selectBuild('SPLASH')).toEqual({ ok: false, reason: 'NOT_ENOUGH_GOLD' });

    expect(e.sellTower(id).ok).toBe(true);
    expect(e.gold).toBe(10 + Math.floor((70 + 42) * GAME_CONFIG.sellRefundRate));
    expect(e.towers).toHaveLength(0);
    expect(e.isBuildable(free)).toBe(true);
  });

  it('shift-place keeps placing while gold lasts', () => {
    const e = new GameEngine();
    e.gold = 200;
    e.selectBuild('RAPID');
    e.placeTower({ col: 1, row: 0 }, true);
    expect(e.placing).toBe('RAPID'); // 130 left
    e.placeTower({ col: 2, row: 0 }, true);
    expect(e.placing).toBeNull(); // 60 left < 70
  });

  it('runs a wave: spawns, pays bounties and the clear bonus, returns to BUILD', () => {
    const e = new GameEngine();
    e.gold = 1000;
    // Ring the first straight run with Rapid towers.
    for (const col of [1, 2, 3, 4]) {
      e.selectBuild('RAPID');
      e.placeTower({ col, row: 1 });
      e.selectBuild('SNIPER');
      e.placeTower({ col, row: 3 });
    }
    const goldBefore = e.gold;
    expect(e.startWave().ok).toBe(true);
    expect(e.startWave()).toEqual({ ok: false, reason: 'WAVE_IN_PROGRESS' });
    for (let i = 0; i < 60 * 60 && e.phase === 'WAVE'; i++) e.tick(GAME_CONFIG.tickSeconds);
    expect(e.phase).toBe('BUILD');
    expect(e.kills).toBe(8);
    expect(e.lives).toBe(GAME_CONFIG.startingLives);
    expect(e.gold).toBe(goldBefore + 8 * 5 + WAVE_CONFIG.bonusBase);
  });

  it('loses when lives hit 0', () => {
    const e = new GameEngine();
    e.lives = 1;
    e.startWave();
    for (let i = 0; i < 60 * 120 && e.phase === 'WAVE'; i++) e.tick(GAME_CONFIG.tickSeconds);
    expect(e.phase).toBe('LOST');
    expect(e.selectBuild('RAPID')).toEqual({ ok: false, reason: 'GAME_OVER' });
  });

  it('builds authored and generated waves from WAVE_CONFIG', () => {
    expect(buildWave(1).spawns).toHaveLength(8);
    const w11 = buildWave(11);
    expect(w11.groups).toEqual([
      { enemy: 'GRUNT', count: 17 },
      { enemy: 'RUNNER', count: 17 },
      { enemy: 'TANK', count: 7 },
    ]);
    expect(w11.hpScale).toBeCloseTo(WAVE_CONFIG.hpScaleGrowth ** 10);
    expect(TOWER_CONFIG.RAPID.cost).toBe(70);
  });
});
