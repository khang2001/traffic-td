// Same idea as Spider's animationConfig in portfolio-game: every `<PREFIX>_<DIRECTION>` key maps to an
// animation. Here each animation is a canvas drawer instead of a sprite sheet, so real sprites can
// replace these later without touching any state. Timings and sizes come from ANIMATION_CONFIG.
import { DIRECTION } from '../engine/common/common';
import { ANIMATION_CONFIG, MAP_CONFIG } from '../engine/common/config';
import type { Direction, Position } from '../engine/common/types';
import type { AnimationConfig } from '../engine/components/animation-component';
import type { BaseGameObject } from '../engine/entities/base-game-object';
import type { BaseEnemyObject } from '../engine/entities/enemies/base-enemy-object';
import type { BaseTowerObject } from '../engine/entities/towers/base-tower-object';

const A = ANIMATION_CONFIG;
const TAU = Math.PI * 2;

const DIR_VECTOR: Record<Direction, Position> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

export function circleAnimations(color: string, radius: number, ringWidth: number): AnimationConfig {
  const config: AnimationConfig = {};
  for (const dir of Object.values(DIRECTION)) {
    config[`WALK_${dir}`] = {
      loop: true,
      duration: A.walkPulseSecs,
      ignoreIfPlaying: true,
      draw: (g, o, p) => drawCircle(g, o, radius * (1 + A.walkPulseScale * Math.sin(p * TAU)), color, dir, ringWidth),
    };
    config[`HURT_${dir}`] = {
      loop: false,
      duration: A.hurtFlashSecs,
      ignoreIfPlaying: true,
      draw: (g, o) => drawCircle(g, o, radius, A.hurtFlashColor, dir, ringWidth),
    };
    config[`DIE_${dir}`] = {
      loop: false,
      duration: A.deathShrinkSecs,
      ignoreIfPlaying: true,
      draw: (g, o, p) => drawCircle(g, o, radius * (1 - p), color, dir, 0, 1 - p),
    };
  }
  return config;
}

export function squareAnimations(color: string): AnimationConfig {
  const config: AnimationConfig = {};
  for (const dir of Object.values(DIRECTION)) {
    config[`IDLE_${dir}`] = { loop: true, duration: 1, ignoreIfPlaying: true, draw: (g, o) => drawSquare(g, o, color, dir, 0) };
    config[`AIM_${dir}`] = { loop: true, duration: 1, ignoreIfPlaying: true, draw: (g, o) => drawSquare(g, o, color, dir, 0) };
    config[`FIRE_${dir}`] = {
      loop: false,
      duration: A.fireRecoilSecs,
      ignoreIfPlaying: false,
      draw: (g, o, p) => drawSquare(g, o, color, dir, A.fireRecoilPx * (1 - p)),
    };
  }
  return config;
}

/** Body + facing dot toward `dir` + optional armor ring + HP bar when damaged. */
export function drawCircle(
  g: CanvasRenderingContext2D,
  obj: BaseGameObject,
  radius: number,
  color: string,
  dir: Direction,
  ringWidth: number,
  alpha = 1,
): void {
  const e = obj as BaseEnemyObject;
  const { x, y } = e.position;
  if (radius <= 0) return;
  g.save();
  g.globalAlpha = alpha;

  g.beginPath();
  g.arc(x, y, radius, 0, TAU);
  g.fillStyle = color;
  g.fill();

  if (ringWidth > 0) {
    g.lineWidth = ringWidth;
    g.strokeStyle = 'rgba(255,255,255,0.55)';
    g.beginPath();
    g.arc(x, y, radius - ringWidth / 2, 0, TAU);
    g.stroke();
  }

  const v = DIR_VECTOR[dir];
  const dotOffset = radius - A.facingDotRadius - (ringWidth > 0 ? ringWidth : 1);
  g.beginPath();
  g.arc(x + v.x * dotOffset, y + v.y * dotOffset, A.facingDotRadius, 0, TAU);
  g.fillStyle = '#0a0a0a';
  g.fill();

  if (e.hp < e.maxHp && e.hp > 0) {
    const w = Math.max(16, e.radius * 2 + 4);
    const top = y - e.radius - 7;
    g.fillStyle = 'rgba(0,0,0,0.6)';
    g.fillRect(x - w / 2, top, w, A.hpBarHeight);
    g.fillStyle = e.hp / e.maxHp > 0.35 ? '#4ade80' : '#f87171';
    g.fillRect(x - w / 2, top, (w * e.hp) / e.maxHp, A.hpBarHeight);
  }
  g.restore();
}

/** Body + one nested square per upgrade level + barrel toward `dir`, pulled back by `recoil` px. */
export function drawSquare(
  g: CanvasRenderingContext2D,
  obj: BaseGameObject,
  color: string,
  dir: Direction,
  recoil: number,
): void {
  const t = obj as BaseTowerObject;
  const { x, y } = t.position;
  const size = MAP_CONFIG.tileSize - A.towerPaddingPx * 2;
  const half = size / 2;

  g.save();
  g.fillStyle = color;
  g.fillRect(x - half, y - half, size, size);

  g.strokeStyle = 'rgba(0,0,0,0.45)';
  g.lineWidth = 2;
  for (let i = 1; i <= t.level; i++) {
    const inset = A.levelInsetPx * i;
    g.strokeRect(x - half + inset, y - half + inset, size - inset * 2, size - inset * 2);
  }

  const v = DIR_VECTOR[dir];
  const len = A.barrelLength - recoil;
  const w = A.barrelWidth;
  g.fillStyle = '#0a0a0a';
  if (v.x !== 0) g.fillRect(v.x > 0 ? x : x - len, y - w / 2, len, w);
  else g.fillRect(x - w / 2, v.y > 0 ? y : y - len, w, len);
  g.beginPath();
  g.arc(x, y, w, 0, TAU);
  g.fill();
  g.restore();
}
