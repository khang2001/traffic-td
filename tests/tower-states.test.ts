import { ENEMY_CONFIG, TOWER_CONFIG } from '../src/engine/common/config';
import { tileCenter } from '../src/engine/common/utils';
import { Grunt, Tank } from '../src/engine/entities/enemies';
import { RapidTower, SniperTower, SplashTower } from '../src/engine/entities/towers';
import { TOWER_STATES } from '../src/engine/state-machine/states/character-states';
import { fakeContext, run } from './helpers';

const tile = { col: 5, row: 5 };
const c = tileCenter(tile);
const far = [{ x: c.x - 1000, y: c.y }, { x: c.x + 1000, y: c.y }];

describe('towers', () => {
  it('idles with no target, attacks and faces a target in range', () => {
    const grunt = new Grunt('g', ENEMY_CONFIG.GRUNT, { x: c.x, y: c.y - 60 }, 1);
    const { ctx, log } = fakeContext(far, []);
    const tower = new RapidTower('t', tile, TOWER_CONFIG.RAPID);
    run(tower, ctx, 2);
    expect(tower.stateName).toBe(TOWER_STATES.IDLE_STATE);

    const world = fakeContext(far, [grunt]);
    grunt.bindContext(world.ctx);
    run(tower, world.ctx, 2);
    expect(tower.stateName).toBe(TOWER_STATES.ATTACK_STATE);
    expect(tower.direction).toBe('UP');
    expect(world.log.projectiles.length).toBe(1);
    expect(log.projectiles.length).toBe(0);
  });

  it('Sniper hits instantly and picks the strongest enemy', () => {
    const weak = new Grunt('g', ENEMY_CONFIG.GRUNT, { x: c.x + 100, y: c.y }, 1);
    const strong = new Tank('t', ENEMY_CONFIG.TANK, { x: c.x - 100, y: c.y }, 1);
    const { ctx } = fakeContext(far, [weak, strong]);
    weak.bindContext(ctx);
    strong.bindContext(ctx);
    const sniper = new SniperTower('s', tile, TOWER_CONFIG.SNIPER);
    run(sniper, ctx, 2);
    expect(strong.hp).toBe(ENEMY_CONFIG.TANK.hp - (TOWER_CONFIG.SNIPER.damage - ENEMY_CONFIG.TANK.armor));
    expect(weak.hp).toBe(ENEMY_CONFIG.GRUNT.hp);
    expect(sniper.direction).toBe('LEFT');
  });

  it('Splash damages everything within splashRadius of the impact', () => {
    const a = new Grunt('a', ENEMY_CONFIG.GRUNT, { x: c.x + 50, y: c.y }, 1);
    const b = new Grunt('b', ENEMY_CONFIG.GRUNT, { x: c.x + 50, y: c.y + 30 }, 1);
    const outside = new Grunt('o', ENEMY_CONFIG.GRUNT, { x: c.x + 50, y: c.y + 90 }, 1);
    const { ctx } = fakeContext(far, [a, b, outside]);
    [a, b, outside].forEach((e) => e.bindContext(ctx));
    const splash = new SplashTower('sp', tile, TOWER_CONFIG.SPLASH);
    splash.bindContext(ctx);
    splash.onHit(a, ctx);
    expect(a.hp).toBe(ENEMY_CONFIG.GRUNT.hp - TOWER_CONFIG.SPLASH.damage);
    expect(b.hp).toBe(ENEMY_CONFIG.GRUNT.hp - TOWER_CONFIG.SPLASH.damage);
    expect(outside.hp).toBe(ENEMY_CONFIG.GRUNT.hp);
  });

  it('deals exactly damage × fireRate per second (no float drift on the cooldown)', () => {
    const target = new Tank('t', { ...ENEMY_CONFIG.TANK, hp: 1e6, armor: 0, speed: 1e-6 }, { x: c.x, y: c.y - 60 }, 1);
    const { ctx } = fakeContext(far, [target]);
    target.bindContext(ctx);
    const sniper = new SniperTower('s', tile, TOWER_CONFIG.SNIPER);
    run(sniper, ctx, 600); // 10 s
    expect(1e6 - target.hp).toBe(TOWER_CONFIG.SNIPER.damage * TOWER_CONFIG.SNIPER.fireRate * 10);
  });

  it('upgrades scale damage and range from the config track', () => {
    const t = new RapidTower('t', tile, TOWER_CONFIG.RAPID);
    expect(t.upgradeCost()).toBe(42); // 60% of 70
    t.upgrade();
    expect(t.damage).toBeCloseTo(TOWER_CONFIG.RAPID.damage * 1.4);
    expect(t.range).toBeCloseTo(110);
    expect(t.upgradeCost()).toBe(70); // 100% of 70
    t.upgrade();
    expect(t.upgradeCost()).toBeNull();
    expect(t.sellValue()).toBe(Math.floor((70 + 42 + 70) * 0.7));
  });
});
