import type { BaseEnemyObject } from '../../../entities/enemies/base-enemy-object';
import { BaseCharacterState } from '../base-character-state';
import { ENEMY_STATES } from '../character-states';

/** Pay the bounty, shrink, then disappear. */
export class DeathState extends BaseCharacterState<BaseEnemyObject> {
  constructor(enemy: BaseEnemyObject) {
    super(ENEMY_STATES.DEATH_STATE, enemy);
  }

  onEnter(): void {
    const e = this._gameObject;
    e.ctx.addGold(e.bounty, { ...e.position });
    e.animationComponent.playAnimation(`DIE_${e.direction}`, () => e.disableObject());
  }
}
