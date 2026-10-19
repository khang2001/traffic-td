// Phaser-free version of portfolio-game's CharacterGameObject: same components, same direction
// getter/setter, same enableObject/disableObject. Behavior lives in states; update() only forwards.
import { DIRECTION } from '../common/common';
import type { Direction, Position } from '../common/types';
import { AnimationComponent, type AnimationConfig } from '../components/animation-component';
import { DirectionComponent } from '../components/direction-component';
import { SpeedComponent } from '../components/speed-component';
import type { GameContext } from '../game-context';
import { StateMachine } from '../state-machine/state-machine';

export type BaseGameObjectConfig = {
  id: string;
  position: Position;
  speed: number;
  animationConfig: AnimationConfig;
  initialDirection?: Direction;
};

export abstract class BaseGameObject {
  readonly id: string;
  position: Position;
  active = true;
  visible = true;
  protected _speedComponent: SpeedComponent;
  protected _directionComponent: DirectionComponent;
  protected _animationComponent: AnimationComponent;
  protected _stateMachine: StateMachine;
  protected _ctx!: GameContext; // set every tick; states read it via `ctx`

  constructor(config: BaseGameObjectConfig) {
    this.id = config.id;
    this.position = { ...config.position };
    this._speedComponent = new SpeedComponent(this, config.speed);
    this._directionComponent = new DirectionComponent(this, config.initialDirection ?? DIRECTION.DOWN, (d) =>
      this.onDirectionChange(d),
    );
    this._animationComponent = new AnimationComponent(this, config.animationConfig);
    this._stateMachine = new StateMachine(config.id);
  }

  get ctx(): GameContext {
    return this._ctx;
  }

  get speed(): number {
    return this._speedComponent.speed;
  }

  get direction(): Direction {
    return this._directionComponent.direction;
  }

  set direction(value: Direction) {
    this._directionComponent.direction = value;
  }

  get animationComponent(): AnimationComponent {
    return this._animationComponent;
  }

  get stateName(): string | undefined {
    return this._stateMachine.currentStateName;
  }

  /** Lets constructors (which run before the first tick) and tests provide the world. */
  bindContext(ctx: GameContext): void {
    this._ctx = ctx;
  }

  update(dt: number, ctx: GameContext): void {
    if (!this.active) return;
    this._ctx = ctx;
    this._stateMachine.update(dt);
    this._animationComponent.update(dt);
  }

  draw(g: CanvasRenderingContext2D): void {
    if (this.visible) this._animationComponent.draw(g);
  }

  /** Hook like Spider#handleDirectionChange. Default: nothing; the shape drawers read `direction`. */
  protected onDirectionChange(_direction: Direction): void {}

  disableObject(): void {
    this.active = false;
    this.visible = false;
  }

  enableObject(): void {
    this.active = true;
    this.visible = true;
  }
}
