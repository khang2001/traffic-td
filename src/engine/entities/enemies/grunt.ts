import { ENEMY_KIND } from '../../common/common';
import { BaseEnemyObject } from './base-enemy-object';

/** Baseline circle. */
export class Grunt extends BaseEnemyObject {
  readonly kind = ENEMY_KIND.GRUNT;
}
