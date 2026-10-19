import { ENEMY_KIND } from '../../common/common';
import { BaseEnemyObject } from './base-enemy-object';

/** Fast and fragile (speed/hp from config). */
export class Runner extends BaseEnemyObject {
  readonly kind = ENEMY_KIND.RUNNER;
}
