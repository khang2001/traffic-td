import type { Position } from './common/types';
import type { BaseEnemyObject } from './entities/enemies/base-enemy-object';
import type { Projectile } from './entities/projectile';

/** Short-lived visuals the renderer draws (tracers, splash rings, gold popups). */
export type Effect =
  | { kind: 'trace'; from: Position; to: Position; color: string; age: number; ttl: number }
  | { kind: 'ring'; at: Position; radius: number; color: string; age: number; ttl: number }
  | { kind: 'popup'; at: Position; text: string; color: string; age: number; ttl: number };

/** Everything an entity may touch in the world. Entities never see GameState directly. */
export interface GameContext {
  readonly now: number;
  readonly waypoints: readonly Position[];
  readonly enemies: readonly BaseEnemyObject[];
  spawnProjectile(p: Projectile): void;
  addGold(amount: number, at?: Position): void;
  loseLives(amount: number): void;
  addEffect(effect: Effect): void;
}
