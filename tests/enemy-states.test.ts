import { ENEMY_CONFIG } from '../src/engine/common/config';
import { ENEMY_STATES } from '../src/engine/state-machine/states/character-states';
import { Grunt, Runner, Tank } from '../src/engine/entities/enemies';
import { fakeContext, run } from './helpers';

const path = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
];

describe('enemy movement (MoveState / BaseMoveState)', () => {
  it('walks at config speed and faces the way it moves', () => {
    const { ctx } = fakeContext(path);
    const g = new Grunt('g', ENEMY_CONFIG.GRUNT, path[0], 1);
    run(g, ctx, 60); // 1 s at 60 px/s
    expect(g.position.x).toBeCloseTo(60);
    expect(g.direction).toBe('RIGHT');
    expect(g.animationComponent.currentAnimation).toBe('WALK_RIGHT');
  });

  it('carries leftover distance past a corner in the same tick', () => {
    const { ctx } = fakeContext(path);
    const r = new Runner('r', ENEMY_CONFIG.RUNNER, { x: 99.5, y: 0 }, 1);
    r.update(1 / 60, ctx); // budget 2 px: 0.5 to the corner, 1.5 down
    expect(r.position.x).toBeCloseTo(100);
    expect(r.position.y).toBeCloseTo(1.5);
    expect(r.direction).toBe('DOWN');
    expect(r.distanceTraveled).toBeCloseTo(2);
  });

  it('costs lives and disappears at the base', () => {
    const { ctx, log } = fakeContext(path);
    const t = new Tank('t', ENEMY_CONFIG.TANK, path[0], 1);
    run(t, ctx, 60 * 10); // 200 px at 35 px/s ≈ 5.7 s
    expect(log.lives).toBe(ENEMY_CONFIG.TANK.livesCost);
    expect(t.active).toBe(false);
  });
});

describe('damage, hurt and death', () => {
  it('keeps walking while hurt, then returns to MOVE_STATE', () => {
    const { ctx } = fakeContext(path);
    const g = new Grunt('g', ENEMY_CONFIG.GRUNT, path[0], 1);
    g.bindContext(ctx);
    g.takeDamage(5);
    expect(g.stateName).toBe(ENEMY_STATES.HURT_STATE);
    const x = g.position.x;
    run(g, ctx, 3);
    expect(g.position.x).toBeGreaterThan(x);
    run(g, ctx, 10);
    expect(g.stateName).toBe(ENEMY_STATES.MOVE_STATE);
  });

  it('applies tank armor but never below the minimum damage', () => {
    const { ctx } = fakeContext(path);
    const t = new Tank('t', ENEMY_CONFIG.TANK, path[0], 1);
    t.bindContext(ctx);
    t.takeDamage(2); // 2 - 3 armor → clamped to min 1
    expect(t.hp).toBe(ENEMY_CONFIG.TANK.hp - 1);
    t.takeDamage(45); // Sniper hit: 45 - 3 = 42
    expect(t.hp).toBe(ENEMY_CONFIG.TANK.hp - 1 - 42);
  });

  it('pays the bounty once and is no longer targetable while dying', () => {
    const { ctx, log } = fakeContext(path);
    const g = new Grunt('g', ENEMY_CONFIG.GRUNT, path[0], 1);
    g.bindContext(ctx);
    g.takeDamage(999);
    g.takeDamage(999);
    expect(g.stateName).toBe(ENEMY_STATES.DEATH_STATE);
    expect(g.isAlive).toBe(false);
    expect(log.gold).toBe(ENEMY_CONFIG.GRUNT.bounty);
    run(g, ctx, 30);
    expect(g.active).toBe(false);
  });

  it('scales hp by the wave multiplier', () => {
    const g = new Grunt('g', ENEMY_CONFIG.GRUNT, path[0], 1.15 ** 4);
    expect(g.maxHp).toBe(Math.round(ENEMY_CONFIG.GRUNT.hp * 1.15 ** 4));
  });
});
