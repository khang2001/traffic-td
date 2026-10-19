// Components are typed fields on BaseGameObject. portfolio-game's getComponent / assignComponentToObject
// (lookup by constructor.name) is not ported: class names are mangled in minified production builds.
import type { BaseGameObject } from '../entities/base-game-object';

export abstract class BaseGameObjectComponent {
  constructor(protected readonly gameObject: BaseGameObject) {}
}
