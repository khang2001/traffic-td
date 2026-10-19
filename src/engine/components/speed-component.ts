import type { BaseGameObject } from '../entities/base-game-object';
import { BaseGameObjectComponent } from './base-game-object-component';

export class SpeedComponent extends BaseGameObjectComponent {
  constructor(
    gameObject: BaseGameObject,
    readonly speed: number,
  ) {
    super(gameObject);
  }
}
