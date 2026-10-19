// Every number comes from the def passed in (TOWER_CONFIG[kind]) or from config.ts.
import { DIRECTION, TARGETING } from '../../common/common';
import { ANIMATION_CONFIG, GAME_CONFIG } from '../../common/config';
import type { Tile, TowerDef, TowerKind } from '../../common/types';
import { distSq, exhaustiveGuard, maxBy, tileCenter } from '../../common/utils';
import type { GameContext } from '../../game-context';
import { squareAnimations } from '../../../render/shape-sprites';
import { TOWER_STATES } from '../../state-machine/states/character-states';
import { TowerAttackState } from '../../state-machine/states/tower/tower-attack-state';
import { TowerIdleState } from '../../state-machine/states/tower/tower-idle-state';
import { BaseGameObject } from '../base-game-object';
import type { BaseEnemyObject } from '../enemies/base-enemy-object';
import { Projectile } from '../projectile';

export abstract class BaseTowerObject extends BaseGameObject {
  abstract readonly kind: TowerKind;
  readonly tile: Tile;
  level = 0;
  spent: number;
  protected cooldown = 0;
  protected target: BaseEnemyObject | null = null;

  constructor(
    id: string,
    tile: Tile,
    readonly def: TowerDef,
  ) {
    super({
      id,
      position: tileCenter(tile),
      speed: 0,
      animationConfig: squareAnimations(def.color),
      initialDirection: DIRECTION.UP,
    });
    this.tile = tile;
    this.spent = def.cost;
    this._stateMachine.addState(new TowerIdleState(this));
    this._stateMachine.addState(new TowerAttackState(this));
    this._stateMachine.setState(TOWER_STATES.IDLE_STATE);
  }

  get range(): number {
    return this.def.range * this.mult('rangeMult');
  }

  get damage(): number {
    return this.def.damage * this.mult('damageMult');
  }

  get fireRate(): number {
    return this.def.fireRate * this.mult('fireRateMult');
  }

  get maxLevel(): number {
    return this.def.upgrades.length;
  }

  tickCooldown(dt: number): void {
    this.cooldown = Math.max(0, this.cooldown - dt);
  }

  /** Epsilon absorbs float drift (0.2 − 12 × 1/60 ≈ 1e-17), which otherwise costs a whole extra tick per shot. */
  isReady(): boolean {
    return this.cooldown <= Number.EPSILON;
  }

  /** Keeps the current target while it stays valid, otherwise asks selectTarget. */
  acquireTarget(): BaseEnemyObject | null {
    if (!this.target || !this.isTargetable(this.target)) this.target = this.selectTarget(this.ctx.enemies);
    return this.target;
  }

  fireAt(target: BaseEnemyObject): void {
    this.fire(target, this.ctx);
    this.cooldown = 1 / this.fireRate;
  }

  protected isTargetable(e: BaseEnemyObject): boolean {
    return e.isAlive && distSq(e.position, this.position) <= this.range ** 2;
  }

  /** Rule comes from config: FIRST = furthest along the path, STRONGEST = highest hp. */
  protected selectTarget(enemies: readonly BaseEnemyObject[]): BaseEnemyObject | null {
    const inRange = enemies.filter((e) => this.isTargetable(e));
    switch (this.def.targeting) {
      case TARGETING.FIRST:
        return maxBy(inRange, (e) => e.distanceTraveled);
      case TARGETING.STRONGEST:
        return maxBy(inRange, (e) => e.hp);
      default:
        return exhaustiveGuard(this.def.targeting);
    }
  }

  /** projectileSpeed 0 in config = instant hit (with a tracer line); otherwise a homing projectile. */
  protected fire(target: BaseEnemyObject, ctx: GameContext): void {
    if (this.def.projectileSpeed === 0) {
      ctx.addEffect({
        kind: 'trace',
        from: { ...this.position },
        to: { ...target.position },
        color: this.def.color,
        age: 0,
        ttl: ANIMATION_CONFIG.shotTraceSecs,
      });
      this.onHit(target, ctx);
      return;
    }
    ctx.spawnProjectile(new Projectile({ ...this.position }, this, target, this.def.projectileSpeed));
  }

  /** Default: plain damage. Override for splash, etc. */
  onHit(target: BaseEnemyObject, _ctx: GameContext): void {
    target.takeDamage(this.damage);
  }

  canUpgrade(): boolean {
    return this.level < this.maxLevel;
  }

  upgradeCost(): number | null {
    const next = this.def.upgrades[this.level];
    return next ? Math.round(this.def.cost * next.costRate) : null;
  }

  /** Stats after the next upgrade, or null at max level. Used by the dashboard preview. */
  nextStats(): { damage: number; range: number; fireRate: number } | null {
    const next = this.def.upgrades[this.level];
    if (!next) return null;
    return {
      damage: this.damage * next.damageMult,
      range: this.range * next.rangeMult,
      fireRate: this.fireRate * next.fireRateMult,
    };
  }

  upgrade(): void {
    const cost = this.upgradeCost();
    if (cost === null) return;
    this.spent += cost;
    this.level++;
  }

  sellValue(): number {
    return Math.floor(this.spent * GAME_CONFIG.sellRefundRate);
  }

  private mult(key: 'damageMult' | 'rangeMult' | 'fireRateMult'): number {
    return this.def.upgrades.slice(0, this.level).reduce((m, u) => m * u[key], 1);
  }
}
