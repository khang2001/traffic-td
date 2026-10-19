import { ENEMY_CONFIG, GAME_CONFIG, MAP_CONFIG, TOWER_CONFIG, WAVE_CONFIG } from './config';

/**
 * Sanity checks for config.ts. Runs at startup in dev and in tests.
 * Returns every problem found, each naming the exact key, e.g. "TOWER_CONFIG.SPLASH.fireRate must be > 0".
 */
export function validateConfig(): string[] {
  const errors: string[] = [];
  const positive = (path: string, value: number) => {
    if (!(value > 0)) errors.push(`${path} must be > 0 (got ${value})`);
  };
  const nonNegative = (path: string, value: number) => {
    if (!(value >= 0)) errors.push(`${path} must be >= 0 (got ${value})`);
  };

  positive('GAME_CONFIG.startingGold', GAME_CONFIG.startingGold);
  positive('GAME_CONFIG.startingLives', GAME_CONFIG.startingLives);
  positive('GAME_CONFIG.totalWaves', GAME_CONFIG.totalWaves);
  if (GAME_CONFIG.sellRefundRate < 0 || GAME_CONFIG.sellRefundRate > 1) {
    errors.push(`GAME_CONFIG.sellRefundRate must be between 0 and 1 (got ${GAME_CONFIG.sellRefundRate})`);
  }

  for (const [kind, def] of Object.entries(TOWER_CONFIG)) {
    const p = `TOWER_CONFIG.${kind}`;
    positive(`${p}.cost`, def.cost);
    positive(`${p}.range`, def.range);
    positive(`${p}.fireRate`, def.fireRate);
    positive(`${p}.damage`, def.damage);
    nonNegative(`${p}.projectileSpeed`, def.projectileSpeed);
    nonNegative(`${p}.splashRadius`, def.splashRadius);
    def.upgrades.forEach((u, i) => {
      positive(`${p}.upgrades[${i}].costRate`, u.costRate);
      positive(`${p}.upgrades[${i}].damageMult`, u.damageMult);
      positive(`${p}.upgrades[${i}].rangeMult`, u.rangeMult);
      positive(`${p}.upgrades[${i}].fireRateMult`, u.fireRateMult);
    });
  }

  for (const [kind, def] of Object.entries(ENEMY_CONFIG)) {
    const p = `ENEMY_CONFIG.${kind}`;
    positive(`${p}.hp`, def.hp);
    positive(`${p}.speed`, def.speed);
    positive(`${p}.radius`, def.radius);
    nonNegative(`${p}.armor`, def.armor);
    nonNegative(`${p}.bounty`, def.bounty);
    nonNegative(`${p}.livesCost`, def.livesCost);
  }

  const corners = MAP_CONFIG.pathCorners;
  if (corners.length < 2) errors.push('MAP_CONFIG.pathCorners needs at least 2 corners');
  corners.forEach((c, i) => {
    if (c.col < 0 || c.row < 0 || c.col >= MAP_CONFIG.cols || c.row >= MAP_CONFIG.rows) {
      errors.push(`MAP_CONFIG.pathCorners[${i}] (${c.col},${c.row}) is off the ${MAP_CONFIG.cols}×${MAP_CONFIG.rows} grid`);
    }
    const next = corners[i + 1];
    if (next && next.col !== c.col && next.row !== c.row) {
      errors.push(`MAP_CONFIG.pathCorners[${i}] → [${i + 1}] must share a row or column`);
    }
  });

  positive('WAVE_CONFIG.hpScaleGrowth', WAVE_CONFIG.hpScaleGrowth);
  positive('WAVE_CONFIG.spawnInterval', WAVE_CONFIG.spawnInterval);
  nonNegative('WAVE_CONFIG.groupDelay', WAVE_CONFIG.groupDelay);
  WAVE_CONFIG.authored.forEach((wave, w) =>
    wave.forEach(([, count], g) => positive(`WAVE_CONFIG.authored[${w}][${g}] count`, count)),
  );

  return errors;
}
