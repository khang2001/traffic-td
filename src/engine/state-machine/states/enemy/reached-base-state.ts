import type { BaseEnemyObject } from '../../../entities/enemies/base-enemy-object';
import { BaseCharacterState } from '../base-character-state';
import { ENEMY_STATES } from '../character-states';

/** Cost lives and disappear. */
export class ReachedBaseState extends BaseCharacterState<BaseEnemyObject> {
  constructor(enemy: BaseEnemyObject) {
    super(ENEMY_STATES.REACHED_BASE_STATE, enemy);
  }

  onEnter(): void {
    this._gameObject.ctx.loseLives(this._gameObject.livesCost);
    this._gameObject.disableObject();
  }
}
