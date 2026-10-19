import type { EnemyDef, EnemyKind, Position } from '../../common/types';
import type { BaseEnemyObject } from './base-enemy-object';
import { Grunt } from './grunt';
import { Runner } from './runner';
import { Tank } from './tank';

export { Grunt, Runner, Tank };

/** The only place an enemy kind becomes a class. */
export const ENEMY_CLASSES: Record<
  EnemyKind,
  new (id: string, def: EnemyDef, spawn: Position, hpScale: number) => BaseEnemyObject
> = {
  GRUNT: Grunt,
  RUNNER: Runner,
  TANK: Tank,
};
