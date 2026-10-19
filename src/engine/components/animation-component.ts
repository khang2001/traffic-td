// Mirrors portfolio-game's AnimationComponent: playAnimation(key, onComplete) with the same
// fallback (no config for a key → run the callback now). Draws canvas shapes instead of sprite sheets.
import type { ObjectAnimation } from '../common/types';
import type { BaseGameObject } from '../entities/base-game-object';
import { BaseGameObjectComponent } from './base-game-object-component';

/** Draws one frame. `progress` runs 0 → 1 over the animation's duration. */
export type ShapeDrawer = (g: CanvasRenderingContext2D, obj: BaseGameObject, progress: number) => void;

export type AnimationConfig = {
  [key in ObjectAnimation]?: { draw: ShapeDrawer; duration: number; loop: boolean; ignoreIfPlaying: boolean };
};

export class AnimationComponent extends BaseGameObjectComponent {
  #config: AnimationConfig;
  #current: ObjectAnimation | undefined;
  #elapsed = 0;
  #onComplete: (() => void) | undefined;

  constructor(gameObject: BaseGameObject, config: AnimationConfig) {
    super(gameObject);
    this.#config = config;
  }

  get currentAnimation(): ObjectAnimation | undefined {
    return this.#current;
  }

  playAnimation(key: ObjectAnimation, onComplete?: () => void): void {
    const anim = this.#config[key];
    if (!anim) {
      onComplete?.(); // same fallback as portfolio-game: no config → run the callback now
      return;
    }
    if (key === this.#current && anim.ignoreIfPlaying) return;
    this.#current = key;
    this.#elapsed = 0;
    this.#onComplete = onComplete;
  }

  isAnimationPlaying(): boolean {
    const anim = this.#current ? this.#config[this.#current] : undefined;
    return !!anim && (anim.loop || this.#elapsed < anim.duration);
  }

  update(dt: number): void {
    const anim = this.#current ? this.#config[this.#current] : undefined;
    if (!anim) return;
    this.#elapsed += dt;
    if (!anim.loop && this.#elapsed >= anim.duration && this.#onComplete) {
      const done = this.#onComplete;
      this.#onComplete = undefined;
      done();
    }
  }

  draw(g: CanvasRenderingContext2D): void {
    const anim = this.#current ? this.#config[this.#current] : undefined;
    if (!anim) return;
    const p = anim.loop
      ? (this.#elapsed % anim.duration) / anim.duration
      : Math.min(1, this.#elapsed / anim.duration);
    anim.draw(g, this.gameObject, p);
  }
}
