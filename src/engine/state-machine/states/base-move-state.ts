// Port of portfolio-game's BaseMoveState. Keeps updateDirection (set direction → play
// `<prefix>_<direction>`). Keyboard input becomes waypoint following; Arcade-body velocity
// becomes direct position steps.
import type { Direction } from '../../common/types';
import { directionFromVector } from '../../common/utils';
import type { BaseEnemyObject } from '../../entities/enemies/base-enemy-object';
import { BaseCharacterState } from './base-character-state';

export abstract class BaseMoveState extends BaseCharacterState<BaseEnemyObject> {
  constructor(
    name: string,
    enemy: BaseEnemyObject,
    protected readonly _moveAnimationPrefix: 'WALK' | 'HURT',
  ) {
    super(name, enemy);
  }

  /**
   * Spend this tick's movement along the path. Leftover distance carries past corners so
   * fast Runners never stall on a waypoint. Returns false once the base is reached.
   */
  protected moveAlongPath(dt: number): boolean {
    const e = this._gameObject;
    const wps = e.ctx.waypoints;
    let budget = e.speed * dt;
    while (budget > 0 && e.waypointIndex < wps.length) {
      const target = wps[e.waypointIndex];
      const dx = target.x - e.position.x;
      const dy = target.y - e.position.y;
      const dist = Math.hypot(dx, dy);
      this.updateDirection(directionFromVector(dx, dy, e.direction));
      if (dist <= budget) {
        e.position = { ...target };
        e.waypointIndex++;
        e.distanceTraveled += dist;
        budget -= dist;
      } else {
        e.position.x += (dx / dist) * budget;
        e.position.y += (dy / dist) * budget;
        e.distanceTraveled += budget;
        budget = 0;
      }
    }
    return e.waypointIndex < wps.length;
  }

  protected updateDirection(direction: Direction): void {
    this._gameObject.direction = direction;
    this._gameObject.animationComponent.playAnimation(`${this._moveAnimationPrefix}_${this._gameObject.direction}`);
  }
}
