import type { BaseEnemyObject } from '../../../entities/enemies/base-enemy-object';
import { BaseMoveState } from '../base-move-state';
import { ENEMY_STATES } from '../character-states';

/**
 * Flash while still walking. Unlike portfolio-game's HurtState there is no push-back or stop:
 * a TD enemy that halted on every hit could be stun-locked by Rapid towers.
 */
export class HurtState extends BaseMoveState {
  constructor(enemy: BaseEnemyObject) {
    super(ENEMY_STATES.HURT_STATE, enemy, 'HURT');
  }

  onEnter(): void {
    this._gameObject.animationComponent.playAnimation(`HURT_${this._gameObject.direction}`, () =>
      this._stateMachine.setState(ENEMY_STATES.MOVE_STATE),
    );
  }

  onUpdate(dt: number): void {
    if (!this.moveAlongPath(dt)) this._stateMachine.setState(ENEMY_STATES.REACHED_BASE_STATE);
  }
}
