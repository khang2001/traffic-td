// Same as portfolio-game's BaseCharacterState, made generic so tower states see BaseTowerObject
// and enemy states see BaseEnemyObject without casts.
import type { BaseGameObject } from '../../entities/base-game-object';
import type { State, StateMachine } from '../state-machine';

export abstract class BaseCharacterState<T extends BaseGameObject> implements State {
  protected _stateMachine!: StateMachine;
  readonly #name: string;

  constructor(
    name: string,
    protected readonly _gameObject: T,
  ) {
    this.#name = name;
  }

  get name(): string {
    return this.#name;
  }

  set stateMachine(stateMachine: StateMachine) {
    this._stateMachine = stateMachine;
  }

  get stateMachine(): StateMachine {
    return this._stateMachine;
  }
}
