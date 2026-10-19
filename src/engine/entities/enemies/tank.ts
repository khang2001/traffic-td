import { ENEMY_KIND } from '../../common/common';
import { BaseEnemyObject } from './base-enemy-object';

/** Armored; armor and outline ring come from config. */
export class Tank extends BaseEnemyObject {
  readonly kind = ENEMY_KIND.TANK;
}
