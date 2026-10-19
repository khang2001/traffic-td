// Ported from portfolio-game component/state-machine/state-machine.ts.
// Kept: State interface, state map, change queue, logging flag.
// Added: dt for the fixed-step loop, onExit.
// Fixed: (1) a queued change no longer also applies immediately (missing `return`),
//        (2) queued args are spread instead of nested one level deep,
//        (3) Map<string> instead of the String wrapper type.
import { GAME_CONFIG } from '../common/config';

export interface State {
  name: string;
  stateMachine: StateMachine;
  onEnter?: (args: unknown[]) => void;
  onUpdate?: (dt: number) => void;
  onExit?: () => void;
}

export class StateMachine {
  #id: string;
  #states = new Map<string, State>();
  #currentState: State | undefined;
  #isChangingState = false;
  #queue: { state: string; args: unknown[] }[] = [];

  constructor(id: string) {
    this.#id = id;
  }

  get currentStateName(): string | undefined {
    return this.#currentState?.name;
  }

  update(dt: number): void {
    const queued = this.#queue.shift();
    if (queued) {
      this.setState(queued.state, ...queued.args);
      return;
    }
    this.#currentState?.onUpdate?.(dt);
  }

  setState(name: string, ...args: unknown[]): void {
    if (!this.#states.has(name)) {
      console.warn(`[StateMachine-${this.#id}:setState] tried to change to unknown state ${name}`);
      return;
    }
    if (this.#currentState?.name === name) return;
    if (this.#isChangingState) {
      this.#queue.push({ state: name, args });
      return;
    }
    this.#isChangingState = true;
    this.#log(`change from ${this.#currentState?.name ?? 'none'} to ${name}`);
    this.#currentState?.onExit?.();
    this.#currentState = this.#states.get(name);
    this.#currentState?.onEnter?.(args);
    this.#isChangingState = false;
  }

  addState(state: State): void {
    state.stateMachine = this;
    this.#states.set(state.name, state);
  }

  #log(message: string): void {
    if (GAME_CONFIG.enableLogging) console.log(`[StateMachine-${this.#id}] ${message}`);
  }
}
