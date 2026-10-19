// engine/common/config.ts
// The ONLY file with tunable numbers. Edit a value, save, and the game reloads with it.
// Every other file in src/engine reads from here (enforced by ESLint no-magic-numbers).
import type { EnemyDef, EnemyKind, TowerDef, TowerKind, UpgradeDef } from './types';

// ---------- game rules ----------
export const GAME_CONFIG = {
  startingGold: 200, // 0.7.0 playtest: was 150, two Rapids leaked half of wave 1
  startingLives: 20,
  totalWaves: 20,
  sellRefundRate: 0.7, // share of total gold spent on a tower that selling returns
  tickSeconds: 1 / 60, // fixed simulation step
  speedMultipliers: [1, 2], // HUD speed toggle options
  maxTicksPerFrame: 5, // caps catch-up after a long frame (tab switch, breakpoint)
  enableLogging: false, // StateMachine transition logs
} as const;

// ---------- map ----------
export const MAP_CONFIG = {
  cols: 20,
  rows: 12,
  tileSize: 40, // px; canvas = 800 × 480 at these values
  /** Path corner tiles, spawn first, base last. Straight runs between corners are filled in. */
  pathCorners: [
    { col: 0, row: 2 },
    { col: 5, row: 2 },
    { col: 5, row: 9 },
    { col: 12, row: 9 },
    { col: 12, row: 4 },
    { col: 19, row: 4 },
  ],
} as const;

// ---------- combat ----------
export const COMBAT_CONFIG = {
  minDamagePerHit: 1, // armor never reduces a hit below this
  projectileHitRadius: 4, // px added to the enemy radius for a projectile hit
} as const;

// ---------- towers ----------
/** Shared upgrade track. Give a tower its own array to tune it separately. */
const STANDARD_UPGRADES: readonly UpgradeDef[] = [
  { costRate: 0.6, damageMult: 1.4, rangeMult: 1.1, fireRateMult: 1 }, // level 1 → 2
  { costRate: 1.0, damageMult: 1.4, rangeMult: 1.1, fireRateMult: 1 }, // level 2 → 3
];

export const TOWER_CONFIG = {
  RAPID: {
    name: 'Rapid',
    color: '#facc15',
    hotkey: '1',
    cost: 70,
    range: 100,
    fireRate: 5,
    damage: 4, // 0.7.0 playtest: was 3
    projectileSpeed: 400, // px/s; 0 = instant hit
    splashRadius: 0, // px; 0 = single target
    targeting: 'FIRST', // FIRST | STRONGEST
    upgrades: STANDARD_UPGRADES,
  },
  SPLASH: {
    name: 'Splash',
    color: '#f97316',
    hotkey: '2',
    cost: 120,
    range: 110,
    fireRate: 0.8,
    damage: 15,
    projectileSpeed: 250,
    splashRadius: 50,
    targeting: 'FIRST',
    upgrades: STANDARD_UPGRADES,
  },
  SNIPER: {
    name: 'Sniper',
    color: '#3b82f6',
    hotkey: '3',
    cost: 100,
    range: 260,
    fireRate: 0.5,
    damage: 45,
    projectileSpeed: 0,
    splashRadius: 0,
    targeting: 'STRONGEST',
    upgrades: STANDARD_UPGRADES,
  },
} as const satisfies Record<TowerKind, TowerDef>;

// ---------- enemies ----------
export const ENEMY_CONFIG = {
  GRUNT: { name: 'Grunt', color: '#ef4444', radius: 10, hp: 40, speed: 60, armor: 0, bounty: 5, livesCost: 1, ringWidth: 0 },
  RUNNER: { name: 'Runner', color: '#22c55e', radius: 7, hp: 25, speed: 120, armor: 0, bounty: 6, livesCost: 1, ringWidth: 0 },
  TANK: { name: 'Tank', color: '#a855f7', radius: 15, hp: 200, speed: 35, armor: 3, bounty: 15, livesCost: 2, ringWidth: 3 },
} as const satisfies Record<EnemyKind, EnemyDef>;

// ---------- waves ----------
export const WAVE_CONFIG = {
  hpScaleGrowth: 1.1, // wave n enemy hp = base hp × 1.1^(n-1); 0.7.0 playtest: was 1.15
  bonusBase: 20, // gold for clearing wave 1
  bonusPerWave: 5, // extra gold per later wave
  spawnInterval: 0.8, // s between enemies in a group
  groupDelay: 3, // s between groups
  /** Waves 1–10, hand-authored: groups of [kind, count] spawned in order. */
  authored: [
    [['GRUNT', 8]],
    [['GRUNT', 12]],
    [['GRUNT', 8], ['RUNNER', 6]],
    [['RUNNER', 12]],
    [['GRUNT', 10], ['TANK', 2]],
    [['GRUNT', 12], ['RUNNER', 8]],
    [['RUNNER', 12], ['TANK', 4]],
    [['GRUNT', 20], ['RUNNER', 10]],
    [['TANK', 8]],
    [['GRUNT', 15], ['RUNNER', 15], ['TANK', 6]],
  ],
  /** Waves 11+: count = base + perWave × (wave − 10). */
  generated: {
    GRUNT: { base: 15, perWave: 2 },
    RUNNER: { base: 15, perWave: 2 },
    TANK: { base: 6, perWave: 1 },
  },
} as const satisfies {
  authored: readonly (readonly (readonly [EnemyKind, number])[])[];
  generated: Record<EnemyKind, { base: number; perWave: number }>;
  [key: string]: unknown;
};

// ---------- visuals ----------
export const ANIMATION_CONFIG = {
  walkPulseSecs: 0.4,
  walkPulseScale: 0.05,
  hurtFlashSecs: 0.1,
  hurtFlashColor: '#ffffff',
  deathShrinkSecs: 0.25,
  fireRecoilSecs: 0.08,
  fireRecoilPx: 4,
  hpBarHeight: 3,
  facingDotRadius: 2,
  barrelLength: 14,
  barrelWidth: 4,
  levelInsetPx: 5, // gap between nested level squares
  towerPaddingPx: 4, // gap between tower square and tile edge
  shotTraceSecs: 0.08, // instant-hit tracer line lifetime
  splashRingSecs: 0.2, // splash impact ring lifetime
  popupSecs: 0.8, // floating "+5" text
  popupRisePx: 24,
  lifeLossFlashSecs: 0.35,
} as const;

// ---------- UI ----------
export const UI_CONFIG = {
  dashboardHeight: 140, // px
  sellConfirmSecs: 2,
  errorShakeMs: 300,
  waveBannerSecs: 2,
  statDecimals: 1, // decimals shown in the dashboard stat preview (3 → 4.2)
} as const;
