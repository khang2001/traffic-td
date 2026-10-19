// Constant objects (`as const`) + `keyof typeof` types — same convention as portfolio-game common/common.ts.

export const DIRECTION = {
  UP: 'UP',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
} as const;

export const TOWER_KIND = {
  RAPID: 'RAPID',
  SPLASH: 'SPLASH',
  SNIPER: 'SNIPER',
} as const;

export const ENEMY_KIND = {
  GRUNT: 'GRUNT',
  RUNNER: 'RUNNER',
  TANK: 'TANK',
} as const;

export const TARGETING = {
  FIRST: 'FIRST',
  STRONGEST: 'STRONGEST',
} as const;

export const GAME_PHASE = {
  BUILD: 'BUILD',
  WAVE: 'WAVE',
  WON: 'WON',
  LOST: 'LOST',
} as const;

export const COMMAND_ERROR = {
  NOT_ENOUGH_GOLD: 'NOT_ENOUGH_GOLD',
  MAX_LEVEL: 'MAX_LEVEL',
  TILE_BLOCKED: 'TILE_BLOCKED',
  NO_SELECTION: 'NO_SELECTION',
  GAME_OVER: 'GAME_OVER',
  WAVE_IN_PROGRESS: 'WAVE_IN_PROGRESS',
} as const;
