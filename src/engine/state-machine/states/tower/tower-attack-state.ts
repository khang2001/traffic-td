import { directionFromVector } from '../../../common/utils';
import type { BaseTowerObject } from '../../../entities/towers/base-tower-object';
import { BaseCharacterState } from '../base-character-state';
import { TOWER_STATES } from '../character-states';

/** Face the target (direction → AIM_/FIRE_ animation), fire when the cooldown is ready. */
export class TowerAttackState extends BaseCharacterState<BaseTowerObject> {
  constructor(tower: BaseTowerObject) {
    super(TOWER_STATES.ATTACK_STATE, tower);
  }

  onEnter(): void {
    this._gameObject.animationComponent.playAnimation(`AIM_${this._gameObject.direction}`);
  }

  onUpdate(dt: number): void {
    const t = this._gameObject;
    t.tickCooldown(dt);
    const target = t.acquireTarget();
    if (!target) {
      this._stateMachine.setState(TOWER_STATES.IDLE_STATE);
      return;
    }

    t.direction = directionFromVector(target.position.x - t.position.x, target.position.y - t.position.y, t.direction);

    if (t.isReady()) {
      t.fireAt(target);
      t.animationComponent.playAnimation(`FIRE_${t.direction}`, () =>
        t.animationComponent.playAnimation(`AIM_${t.direction}`),
      );
    } else if (t.animationComponent.currentAnimation?.startsWith('AIM_')) {
      // Between shots: keep the barrel on the target (same key is a no-op via ignoreIfPlaying).
      t.animationComponent.playAnimation(`AIM_${t.direction}`);
    }
  }
}
