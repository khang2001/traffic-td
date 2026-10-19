// GameEngine: owns GameState, runs the fixed-step loop, validates commands, publishes a
// frozen plain snapshot for React (useSyncExternalStore). Never imports React.
import { COMMAND_ERROR, GAME_PHASE } from './common/common';
import { ANIMATION_CONFIG, ENEMY_CONFIG, GAME_CONFIG, TOWER_CONFIG, UI_CONFIG } from './common/config';
import type { CommandError, CommandResult, EnemyKind, GamePhase, Position, Tile, TowerKind } from './common/types';
import { tileKey } from './common/utils';
import { buildDashboard, type DashboardSnapshot } from './dashboard';
import type { BaseEnemyObject } from './entities/enemies/base-enemy-object';
import { ENEMY_CLASSES } from './entities/enemies';
import type { Projectile } from './entities/projectile';
import type { BaseTowerObject } from './entities/towers/base-tower-object';
import { TOWER_CLASSES } from './entities/towers';
import type { Effect, GameContext } from './game-context';
import { buildMap, type GameMap } from './map';
import { buildWave, describeWave, type SpawnEntry, type WavePlan } from './waves';

export interface GameSnapshot {
  gold: number;
  lives: number;
  wave: number; // last wave started (0 before the first)
  totalWaves: number;
  phase: GamePhase;
  paused: boolean;
  speed: number;
  canStartWave: boolean;
  nextWaveText: string | null;
  towersBuilt: number;
  kills: number;
  dashboard: DashboardSnapshot;
}

const OK: CommandResult = { ok: true };
const fail = (reason: CommandError): CommandResult => ({ ok: false, reason });

const ENEMY_NAMES = Object.fromEntries(
  (Object.keys(ENEMY_CONFIG) as EnemyKind[]).map((k) => [k, ENEMY_CONFIG[k].name]),
) as Record<EnemyKind, string>;

const MS_PER_SECOND = 1000;
const MAX_FRAME_SECONDS = 0.25;

export class GameEngine {
  readonly map: GameMap = buildMap();

  // ---- state (read by the renderer; mutated only here and by entities) ----
  time = 0;
  phase: GamePhase = GAME_PHASE.BUILD;
  gold: number = GAME_CONFIG.startingGold;
  lives: number = GAME_CONFIG.startingLives;
  waveNumber = 0;
  waveTime = 0;
  currentWave: WavePlan | null = null;
  spawnQueue: SpawnEntry[] = [];
  towers: BaseTowerObject[] = [];
  enemies: BaseEnemyObject[] = [];
  projectiles: Projectile[] = [];
  effects: Effect[] = [];
  speed: number = GAME_CONFIG.speedMultipliers[0];
  paused = false;
  selectedTowerId: string | null = null;
  placing: TowerKind | null = null;
  hoverTile: Tile | null = null;
  bannerText = '';
  bannerTimeLeft = 0;
  lifeFlashTimeLeft = 0;
  towersBuilt = 0;
  kills = 0;

  #nextId = 1;
  #occupied = new Map<string, BaseTowerObject>();
  #listeners = new Set<() => void>();
  #snapshot!: GameSnapshot;
  #snapshotKey = '';
  #ctx: GameContext;
  #rafId: number | null = null;
  #lastTs: number | null = null;
  #accumulator = 0;
  #onFrame: (() => void) | null = null;

  constructor() {
    this.#ctx = new EngineContext(this);
    this.#publish(true);
  }

  /** Used by EngineContext; entities reach these only through GameContext. */
  popup(at: Position, text: string, color: string): void {
    this.#popup(at, text, color);
  }

  get context(): GameContext {
    return this.#ctx;
  }

  get selectedTower(): BaseTowerObject | null {
    return this.towers.find((t) => t.id === this.selectedTowerId) ?? null;
  }

  get isOver(): boolean {
    return this.phase === GAME_PHASE.WON || this.phase === GAME_PHASE.LOST;
  }

  // ---------- React bridge ----------
  subscribe = (listener: () => void): (() => void) => {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  };

  getSnapshot = (): GameSnapshot => this.#snapshot;

  // ---------- loop ----------
  /** Starts the rAF loop. `onFrame` runs after each frame's ticks (the canvas draws there). */
  start(onFrame: () => void): void {
    this.#onFrame = onFrame;
    if (this.#rafId !== null) return;
    const frame = (ts: number) => {
      const real = this.#lastTs === null ? 0 : Math.min((ts - this.#lastTs) / MS_PER_SECOND, MAX_FRAME_SECONDS);
      this.#lastTs = ts;
      this.advance(real);
      this.#onFrame?.();
      this.#rafId = requestAnimationFrame(frame);
    };
    this.#rafId = requestAnimationFrame(frame);
  }

  stop(): void {
    if (this.#rafId !== null) cancelAnimationFrame(this.#rafId);
    this.#rafId = null;
    this.#lastTs = null;
  }

  /**
   * Feed real elapsed seconds. Speed scales how much game time accumulates; every tick still uses
   * the same fixed dt (GAME_CONFIG.tickSeconds), so 2× runs twice as many identical ticks.
   */
  advance(realSeconds: number): void {
    if (this.paused || this.isOver) {
      this.#ageVisuals(realSeconds);
      this.#publish();
      return;
    }
    const step = GAME_CONFIG.tickSeconds;
    this.#accumulator += realSeconds * this.speed;
    const maxTicks = GAME_CONFIG.maxTicksPerFrame * this.speed;
    let ticks = 0;
    while (this.#accumulator >= step && ticks < maxTicks) {
      this.tick(step);
      this.#accumulator -= step;
      ticks++;
    }
    if (ticks === maxTicks) this.#accumulator = 0; // drop backlog instead of spiraling
    this.#publish();
  }

  /** One fixed simulation step: spawn → enemies → towers → projectiles → cleanup/economy. */
  tick(dt: number): void {
    this.time += dt;

    // 1. spawn
    if (this.phase === GAME_PHASE.WAVE && this.currentWave) {
      this.waveTime += dt;
      while (this.spawnQueue.length > 0 && this.spawnQueue[0].at <= this.waveTime) {
        const entry = this.spawnQueue.shift()!;
        this.#spawn(entry.enemy, this.currentWave.hpScale);
      }
    }

    // 2. enemies, 3. towers, 4. projectiles
    for (const e of this.enemies) e.update(dt, this.#ctx);
    for (const t of this.towers) t.update(dt, this.#ctx);
    for (const p of this.projectiles) p.update(dt, this.#ctx);

    // 5. cleanup and economy
    this.enemies = this.enemies.filter((e) => {
      if (e.active) return true;
      if (e.hp <= 0) this.kills++;
      return false;
    });
    this.projectiles = this.projectiles.filter((p) => p.alive);
    this.#ageVisuals(dt);

    if (this.lives <= 0) {
      this.phase = GAME_PHASE.LOST;
      this.placing = null;
      return;
    }

    if (this.phase === GAME_PHASE.WAVE && this.spawnQueue.length === 0 && this.enemies.length === 0 && this.currentWave) {
      this.gold += this.currentWave.bonus;
      if (this.waveNumber >= GAME_CONFIG.totalWaves) {
        this.phase = GAME_PHASE.WON;
        this.placing = null;
      } else {
        this.phase = GAME_PHASE.BUILD;
        this.#banner(`Wave ${this.waveNumber} cleared  +${this.currentWave.bonus} gold`);
      }
    }
  }

  // ---------- commands (every one validated here; UI disabled states are only hints) ----------
  selectBuild(kind: TowerKind): CommandResult {
    if (this.isOver) return fail(COMMAND_ERROR.GAME_OVER);
    if (this.gold < TOWER_CONFIG[kind].cost) return fail(COMMAND_ERROR.NOT_ENOUGH_GOLD);
    this.placing = kind;
    this.selectedTowerId = null;
    this.#publish();
    return OK;
  }

  cancelBuild(): CommandResult {
    this.placing = null;
    this.#publish();
    return OK;
  }

  placeTower(tile: Tile, keepPlacing = false): CommandResult {
    if (this.isOver) return fail(COMMAND_ERROR.GAME_OVER);
    const kind = this.placing;
    if (!kind) return fail(COMMAND_ERROR.NO_SELECTION);
    if (!this.isBuildable(tile)) return fail(COMMAND_ERROR.TILE_BLOCKED);
    const def = TOWER_CONFIG[kind];
    if (this.gold < def.cost) return fail(COMMAND_ERROR.NOT_ENOUGH_GOLD);

    const tower = new TOWER_CLASSES[kind](`tower-${this.#nextId++}`, tile, def);
    tower.bindContext(this.#ctx);
    this.towers.push(tower);
    this.#occupied.set(tileKey(tile), tower);
    this.gold -= def.cost;
    this.towersBuilt++;
    if (!keepPlacing || this.gold < def.cost) this.placing = null;
    this.#publish();
    return OK;
  }

  selectTower(id: string | null): CommandResult {
    this.selectedTowerId = id && this.towers.some((t) => t.id === id) ? id : null;
    if (this.selectedTowerId) this.placing = null;
    this.#publish();
    return OK;
  }

  upgradeTower(id: string): CommandResult {
    if (this.isOver) return fail(COMMAND_ERROR.GAME_OVER);
    const tower = this.towers.find((t) => t.id === id);
    if (!tower) return fail(COMMAND_ERROR.NO_SELECTION);
    const cost = tower.upgradeCost();
    if (cost === null) return fail(COMMAND_ERROR.MAX_LEVEL);
    if (this.gold < cost) return fail(COMMAND_ERROR.NOT_ENOUGH_GOLD);
    this.gold -= cost;
    tower.upgrade();
    this.#publish();
    return OK;
  }

  sellTower(id: string): CommandResult {
    if (this.isOver) return fail(COMMAND_ERROR.GAME_OVER);
    const tower = this.towers.find((t) => t.id === id);
    if (!tower) return fail(COMMAND_ERROR.NO_SELECTION);
    const refund = tower.sellValue();
    this.gold += refund;
    this.#popup(tower.position, `+${refund}`, '#facc15');
    this.towers = this.towers.filter((t) => t !== tower);
    this.#occupied.delete(tileKey(tower.tile));
    if (this.selectedTowerId === id) this.selectedTowerId = null;
    this.#publish();
    return OK;
  }

  startWave(): CommandResult {
    if (this.isOver) return fail(COMMAND_ERROR.GAME_OVER);
    if (this.phase === GAME_PHASE.WAVE) return fail(COMMAND_ERROR.WAVE_IN_PROGRESS);
    this.waveNumber++;
    this.currentWave = buildWave(this.waveNumber);
    this.spawnQueue = [...this.currentWave.spawns];
    this.waveTime = 0;
    this.phase = GAME_PHASE.WAVE;
    this.#banner(`Wave ${this.waveNumber}: ${describeWave(this.currentWave, ENEMY_NAMES)}`);
    this.#publish();
    return OK;
  }

  togglePause(): void {
    if (this.isOver) return;
    this.paused = !this.paused;
    this.#publish();
  }

  setSpeed(speed: number): void {
    this.speed = speed;
    this.#publish();
  }

  /** Canvas click: place when placing, otherwise select the tower on the tile (or deselect). */
  clickTile(tile: Tile, shiftKey: boolean): CommandResult {
    if (this.placing) return this.placeTower(tile, shiftKey);
    const tower = this.#occupied.get(tileKey(tile));
    return this.selectTower(tower ? tower.id : null);
  }

  setHoverTile(tile: Tile | null): void {
    this.hoverTile = tile;
  }

  isBuildable(tile: Tile): boolean {
    if (tile.col < 0 || tile.row < 0 || tile.col >= this.map.cols || tile.row >= this.map.rows) return false;
    const key = tileKey(tile);
    return !this.map.pathKeys.has(key) && !this.#occupied.has(key);
  }

  towerAt(tile: Tile): BaseTowerObject | undefined {
    return this.#occupied.get(tileKey(tile));
  }

  // ---------- internals ----------
  #spawn(kind: EnemyKind, hpScale: number): void {
    const enemy = new ENEMY_CLASSES[kind](`enemy-${this.#nextId++}`, ENEMY_CONFIG[kind], this.map.waypoints[0], hpScale);
    enemy.bindContext(this.#ctx);
    this.enemies.push(enemy);
  }

  #popup(at: Position, text: string, color: string): void {
    this.effects.push({ kind: 'popup', at: { ...at }, text, color, age: 0, ttl: ANIMATION_CONFIG.popupSecs });
  }

  #banner(text: string): void {
    this.bannerText = text;
    this.bannerTimeLeft = UI_CONFIG.waveBannerSecs;
  }

  #ageVisuals(dt: number): void {
    for (const fx of this.effects) fx.age += dt;
    this.effects = this.effects.filter((fx) => fx.age < fx.ttl);
    this.bannerTimeLeft = Math.max(0, this.bannerTimeLeft - dt);
    this.lifeFlashTimeLeft = Math.max(0, this.lifeFlashTimeLeft - dt);
  }

  #nextWaveCache: { wave: number; text: string | null } = { wave: -1, text: null };

  #nextWaveText(): string | null {
    if (this.#nextWaveCache.wave !== this.waveNumber) {
      const text =
        this.waveNumber < GAME_CONFIG.totalWaves ? describeWave(buildWave(this.waveNumber + 1), ENEMY_NAMES) : null;
      this.#nextWaveCache = { wave: this.waveNumber, text };
    }
    return this.#nextWaveCache.text;
  }

  #publish(force = false): void {
    const next: GameSnapshot = {
      gold: this.gold,
      lives: this.lives,
      wave: this.waveNumber,
      totalWaves: GAME_CONFIG.totalWaves,
      phase: this.phase,
      paused: this.paused,
      speed: this.speed,
      canStartWave: this.phase === GAME_PHASE.BUILD,
      nextWaveText: this.#nextWaveText(),
      towersBuilt: this.towersBuilt,
      kills: this.kills,
      dashboard: buildDashboard(this.gold, !this.isOver, this.placing, this.selectedTower),
    };
    const key = JSON.stringify(next);
    if (!force && key === this.#snapshotKey) return;
    this.#snapshotKey = key;
    this.#snapshot = Object.freeze(next);
    for (const l of this.#listeners) l();
  }
}

/** The GameContext entities receive: a narrow, live view of the engine. */
class EngineContext implements GameContext {
  constructor(private readonly engine: GameEngine) {}

  get now(): number {
    return this.engine.time;
  }

  get waypoints(): readonly Position[] {
    return this.engine.map.waypoints;
  }

  get enemies(): readonly BaseEnemyObject[] {
    return this.engine.enemies;
  }

  spawnProjectile(p: Projectile): void {
    this.engine.projectiles.push(p);
  }

  addGold(amount: number, at?: Position): void {
    this.engine.gold += amount;
    if (at) this.engine.popup(at, `+${amount}`, '#facc15');
  }

  loseLives(amount: number): void {
    this.engine.lives = Math.max(0, this.engine.lives - amount);
    this.engine.lifeFlashTimeLeft = ANIMATION_CONFIG.lifeLossFlashSecs;
  }

  addEffect(effect: Effect): void {
    this.engine.effects.push(effect);
  }
}
