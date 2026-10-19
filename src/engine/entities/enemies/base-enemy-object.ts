import { DIRECTION } from '../../common/common';
import { COMBAT_CONFIG } from '../../common/config';
import type { EnemyDef, EnemyKind, Position } from '../../common/types';
import { circleAnimations } from '../../../render/shape-sprites';
import { ENEMY_STATES } from '../../state-machine/states/character-states';
import { DeathState } from '../../state-machine/states/enemy/death-state';
import { HurtState } from '../../state-machine/states/enemy/hurt-state';
import { MoveState } from '../../state-machine/states/enemy/move-state';
import { ReachedBaseState } from '../../state-machine/states/enemy/reached-base-state';
import { BaseGameObject } from '../base-game-object';

export abstract class BaseEnemyObject extends BaseGameObject {
  abstract readonly kind: EnemyKind;
  hp: number;
  readonly maxHp: number;
  waypointIndex = 1;
  distanceTraveled = 0;

  constructor(
    id: string,
    readonly def: EnemyDef,
    spawn: Position,
    hpScale: number,
  ) {
    super({
      id,
      position: spawn,
      speed: def.speed,
      animationConfig: circleAnimations(def.color, def.radius, def.ringWidth),
      initialDirection: DIRECTION.RIGHT,
    });
    this.maxHp = this.hp = Math.round(def.hp * hpScale);
    this._stateMachine.addState(new MoveState(this));
    this._stateMachine.addState(new HurtState(this));
    this._stateMachine.addState(new DeathState(this));
    this._stateMachine.addState(new ReachedBaseState(this));
    this._stateMachine.setState(ENEMY_STATES.MOVE_STATE);
  }

  get radius(): number {
    return this.def.radius;
  }

  get bounty(): number {
    return this.def.bounty;
  }

  get livesCost(): number {
    return this.def.livesCost;
  }

  /** Targetable only while walking. Dying circles are ignored by towers and projectiles. */
  get isAlive(): boolean {
    return (
      this.active && (this.stateName === ENEMY_STATES.MOVE_STATE || this.stateName === ENEMY_STATES.HURT_STATE)
    );
  }

  takeDamage(amount: number): void {
    if (!this.isAlive) return;
    this.hp = Math.max(0, this.hp - this.reduceDamage(amount));
    this._stateMachine.setState(this.hp <= 0 ? ENEMY_STATES.DEATH_STATE : ENEMY_STATES.HURT_STATE);
  }

  /** Default: flat armor from config, never below COMBAT_CONFIG.minDamagePerHit. */
  protected reduceDamage(amount: number): number {
    return Math.max(COMBAT_CONFIG.minDamagePerHit, amount - this.def.armor);
  }
}
