import { ENEMY_KIND } from './common/common';
import { WAVE_CONFIG } from './common/config';
import type { EnemyKind } from './common/types';

export interface SpawnEntry {
  at: number; // seconds after the wave starts
  enemy: EnemyKind;
}

export interface WavePlan {
  number: number; // 1-based
  spawns: SpawnEntry[];
  hpScale: number;
  bonus: number;
  groups: { enemy: EnemyKind; count: number }[];
}

const AUTHORED_WAVES = WAVE_CONFIG.authored.length;

/** Builds wave `n` (1-based) from WAVE_CONFIG: authored for 1–10, generated after. */
export function buildWave(n: number): WavePlan {
  const groups: { enemy: EnemyKind; count: number }[] =
    n <= AUTHORED_WAVES
      ? WAVE_CONFIG.authored[n - 1].map(([enemy, count]) => ({ enemy, count }))
      : Object.values(ENEMY_KIND).map((enemy) => {
          const g = WAVE_CONFIG.generated[enemy];
          return { enemy, count: g.base + g.perWave * (n - AUTHORED_WAVES) };
        });

  const spawns: SpawnEntry[] = [];
  let cursor = 0;
  for (const group of groups) {
    for (let i = 0; i < group.count; i++) spawns.push({ at: cursor + i * WAVE_CONFIG.spawnInterval, enemy: group.enemy });
    cursor += group.count * WAVE_CONFIG.spawnInterval + WAVE_CONFIG.groupDelay;
  }

  return {
    number: n,
    spawns,
    hpScale: WAVE_CONFIG.hpScaleGrowth ** (n - 1),
    bonus: WAVE_CONFIG.bonusBase + WAVE_CONFIG.bonusPerWave * (n - 1),
    groups,
  };
}

/** "12 Grunts, 4 Tanks" — used by the wave banner. */
export function describeWave(plan: WavePlan, names: Record<EnemyKind, string>): string {
  return plan.groups.map((g) => `${g.count} ${names[g.enemy]}${g.count === 1 ? '' : 's'}`).join(', ');
}
