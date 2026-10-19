import type { BaseEnemyObject } from '../../../entities/enemies/base-enemy-object';
import { BaseMoveState } from '../base-move-state';
import { ENEMY_STATES } from '../character-states';

/** Walk the path; at the end → REACHED_BASE_STATE. */
export class MoveState extends BaseMoveState {
  constructor(enemy: BaseEnemyObject) {
    super(ENEMY_STATES.MOVE_STATE, enemy, 'WALK');
  }

  onEnter(): void {
    this._gameObject.animationComponent.playAnimation(`WALK_${this._gameObject.direction}`);
  }

  onUpdate(dt: number): void {
    if (!this.moveAlongPath(dt)) this._stateMachine.setState(ENEMY_STATES.REACHED_BASE_STATE);
  }
}
