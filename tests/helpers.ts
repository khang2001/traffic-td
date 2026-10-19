import type { Position } from '../src/engine/common/types';
import type { Effect, GameContext } from '../src/engine/game-context';
import type { BaseEnemyObject } from '../src/engine/entities/enemies/base-enemy-object';
import type { Projectile } from '../src/engine/entities/projectile';

/** Minimal fake world so states and entities can be tested without the engine. */
export function fakeContext(waypoints: Position[], enemies: BaseEnemyObject[] = []) {
  const log = { gold: 0, lives: 0, projectiles: [] as Projectile[], effects: [] as Effect[] };
  const ctx: GameContext = {
    now: 0,
    waypoints,
    enemies,
    spawnProjectile: (p) => log.projectiles.push(p),
    addGold: (a) => (log.gold += a),
    loseLives: (n) => (log.lives += n),
    addEffect: (e) => log.effects.push(e),
  };
  return { ctx, log };
}

/** Run n fixed ticks of 1/60 s on an object. */
export function run(obj: { update(dt: number, ctx: GameContext): void }, ctx: GameContext, ticks: number, dt = 1 / 60) {
  for (let i = 0; i < ticks; i++) obj.update(dt, ctx);
}
