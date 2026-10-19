import { DIRECTION } from '../common/common';
import type { Direction } from '../common/types';
import type { BaseGameObject } from '../entities/base-game-object';
import { BaseGameObjectComponent } from './base-game-object-component';

export class DirectionComponent extends BaseGameObjectComponent {
  #direction: Direction;
  #callback: (direction: Direction) => void;

  constructor(
    gameObject: BaseGameObject,
    initial: Direction = DIRECTION.DOWN,
    onDirectionChange: (direction: Direction) => void = () => undefined,
  ) {
    super(gameObject);
    this.#direction = initial;
    this.#callback = onDirectionChange;
  }

  get direction(): Direction {
    return this.#direction;
  }

  set direction(direction: Direction) {
    if (direction === this.#direction) return;
    this.#direction = direction;
    this.#callback(direction);
  }

  set callback(callback: (direction: Direction) => void) {
    this.#callback = callback;
  }
}
