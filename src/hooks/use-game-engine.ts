import { useSyncExternalStore } from 'react';
import type { GameEngine, GameSnapshot } from '../engine/engine';

/** Bridge: React re-renders only when the engine publishes a new frozen snapshot. */
export function useGameEngine(engine: GameEngine): GameSnapshot {
  return useSyncExternalStore(engine.subscribe, engine.getSnapshot);
}
