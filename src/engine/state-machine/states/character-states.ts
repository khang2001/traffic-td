export const ENEMY_STATES = {
  MOVE_STATE: 'MOVE_STATE',
  HURT_STATE: 'HURT_STATE',
  DEATH_STATE: 'DEATH_STATE',
  REACHED_BASE_STATE: 'REACHED_BASE_STATE',
} as const;

export const TOWER_STATES = {
  IDLE_STATE: 'IDLE_STATE',
  ATTACK_STATE: 'ATTACK_STATE',
} as const;

export type EnemyStateName = keyof typeof ENEMY_STATES;
export type TowerStateName = keyof typeof TOWER_STATES;
