import { TOWER_KIND } from '../../common/common';
import { BaseTowerObject } from './base-tower-object';

/** Instant hit + STRONGEST targeting, both from TOWER_CONFIG.SNIPER. */
export class SniperTower extends BaseTowerObject {
  readonly kind = TOWER_KIND.SNIPER;
}
