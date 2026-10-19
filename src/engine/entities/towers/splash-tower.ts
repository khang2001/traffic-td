import { TOWER_KIND } from '../../common/common';
import { ANIMATION_CONFIG } from '../../common/config';
import { distSq } from '../../common/utils';
import type { GameContext } from '../../game-context';
import type { BaseEnemyObject } from '../enemies/base-enemy-object';
import { BaseTowerObject } from './base-tower-object';

/** Damages every enemy within splashRadius of the impact. */
export class SplashTower extends BaseTowerObject {
  readonly kind = TOWER_KIND.SPLASH;

  onHit(target: BaseEnemyObject, ctx: GameContext): void {
    const r2 = this.def.splashRadius ** 2;
    const at = { ...target.position };
    for (const e of ctx.enemies) {
      if (e.isAlive && distSq(e.position, at) <= r2) e.takeDamage(this.damage);
    }
    ctx.addEffect({
      kind: 'ring',
      at,
      radius: this.def.splashRadius,
      color: this.def.color,
      age: 0,
      ttl: ANIMATION_CONFIG.splashRingSecs,
    });
  }
}
