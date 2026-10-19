import type { BaseTowerObject } from '../../../entities/towers/base-tower-object';
import { BaseCharacterState } from '../base-character-state';
import { TOWER_STATES } from '../character-states';

/** No target: cool down and scan. */
export class TowerIdleState extends BaseCharacterState<BaseTowerObject> {
  constructor(tower: BaseTowerObject) {
    super(TOWER_STATES.IDLE_STATE, tower);
  }

  onEnter(): void {
    this._gameObject.animationComponent.playAnimation(`IDLE_${this._gameObject.direction}`);
  }

  onUpdate(dt: number): void {
    this._gameObject.tickCooldown(dt);
    if (this._gameObject.acquireTarget()) this._stateMachine.setState(TOWER_STATES.ATTACK_STATE);
  }
}
