import type { COMMAND_ERROR, DIRECTION, ENEMY_KIND, GAME_PHASE, TARGETING, TOWER_KIND } from './common';

export type Direction = keyof typeof DIRECTION;
export type TowerKind = keyof typeof TOWER_KIND;
export type EnemyKind = keyof typeof ENEMY_KIND;
export type Targeting = keyof typeof TARGETING;
export type GamePhase = keyof typeof GAME_PHASE;
export type CommandError = keyof typeof COMMAND_ERROR;

export type CommandResult = { ok: true } | { ok: false; reason: CommandError };

export type Position = { x: number; y: number }; // pixels
export type Tile = { col: number; row: number };

/** Animation keys are `<PREFIX>_<DIRECTION>`, like IDLE_DOWN / WALK_LEFT in portfolio-game. */
export type AnimationPrefix = 'IDLE' | 'WALK' | 'HURT' | 'DIE' | 'AIM' | 'FIRE';
export type ObjectAnimation = `${AnimationPrefix}_${Direction}`;

export interface UpgradeDef {
  readonly costRate: number; // × base cost
  readonly damageMult: number;
  readonly rangeMult: number;
  readonly fireRateMult: number;
}

export interface TowerDef {
  readonly name: string;
  readonly color: string;
  readonly hotkey: string;
  readonly cost: number;
  readonly range: number; // px
  readonly fireRate: number; // shots per second
  readonly damage: number;
  readonly projectileSpeed: number; // px/s, 0 = instant hit
  readonly splashRadius: number; // px, 0 = single target
  readonly targeting: Targeting;
  readonly upgrades: readonly UpgradeDef[];
}

export interface EnemyDef {
  readonly name: string;
  readonly color: string;
  readonly radius: number; // px
  readonly hp: number;
  readonly speed: number; // px/s
  readonly armor: number; // flat reduction per hit
  readonly bounty: number;
  readonly livesCost: number;
  readonly ringWidth: number; // px outline, 0 = none
}
