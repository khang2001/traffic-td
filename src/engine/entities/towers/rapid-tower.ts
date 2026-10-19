import { TOWER_KIND } from '../../common/common';
import { BaseTowerObject } from './base-tower-object';

/** High fire rate, low damage. Uses every base default. */
export class RapidTower extends BaseTowerObject {
  readonly kind = TOWER_KIND.RAPID;
}
