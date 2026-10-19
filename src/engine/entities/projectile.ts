import { COMBAT_CONFIG } from '../common/config';
import type { Position } from '../common/types';
import type { GameContext } from '../game-context';
import type { BaseEnemyObject } from './enemies/base-enemy-object';
import type { BaseTowerObject } from './towers/base-tower-object';

/** Homing shot. On contact it calls source.onHit, so splash logic stays in the tower subclass. */
export class Projectile {
  alive = true;

  constructor(
    public position: Position,
    readonly source: BaseTowerObject,
    readonly target: BaseEnemyObject,
    readonly speed: number,
  ) {}

  update(dt: number, ctx: GameContext): void {
    if (!this.alive) return;
    if (!this.target.isAlive) {
      this.alive = false; // target already dead or gone: the shot vanishes
      return;
    }
    const dx = this.target.position.x - this.position.x;
    const dy = this.target.position.y - this.position.y;
    const dist = Math.hypot(dx, dy);
    const step = this.speed * dt;
    const hitDistance = this.target.radius + COMBAT_CONFIG.projectileHitRadius;
    if (dist - step <= hitDistance) {
      this.alive = false;
      this.position = { ...this.target.position };
      this.source.onHit(this.target, ctx);
      return;
    }
    this.position.x += (dx / dist) * step;
    this.position.y += (dy / dist) * step;
  }
}
