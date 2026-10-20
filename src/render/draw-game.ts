// Draws one frame from engine state: board → range rings → towers → enemies → projectiles → effects → overlays.
import { GAME_PHASE } from '../engine/common/common';
import { ANIMATION_CONFIG, TOWER_CONFIG, UI_CONFIG } from '../engine/common/config';
import { tileCenter, tileKey } from '../engine/common/utils';
import type { GameEngine } from '../engine/engine';

const TAU = Math.PI * 2;

const COLORS = {
  ground: '#121215',
  grid: 'rgba(255, 255, 255, 0.09)',
  path: '#2c2c35',
  pathEdge: '#34343c',
  spawn: '#3f3f46',
  base: '#7f1d1d',
  ringValid: 'rgba(74, 222, 128, 0.9)',
  ringInvalid: 'rgba(248, 113, 113, 0.9)',
  ringSelected: 'rgba(255, 255, 255, 0.55)',
  text: '#fafafa',
};

export function drawGame(g: CanvasRenderingContext2D, engine: GameEngine): void {
  const { map } = engine;
  const s = map.tileSize;
  const width = map.cols * s;
  const height = map.rows * s;

  // board: plain ground with a continuous road; no tile grid during normal play
  g.fillStyle = COLORS.ground;
  g.fillRect(0, 0, width, height);
  g.fillStyle = COLORS.path;
  for (const t of map.pathTiles) g.fillRect(t.col * s, t.row * s, s, s);
  const first = map.pathTiles[0];
  const last = map.pathTiles[map.pathTiles.length - 1];
  g.fillStyle = COLORS.spawn;
  g.fillRect(first.col * s, first.row * s, s, s);
  g.fillStyle = COLORS.base;
  g.fillRect(last.col * s, last.row * s, s, s);

  // build grid: shown only while placing a tower, on tiles you can build on
  if (engine.placing) {
    g.save();
    g.strokeStyle = COLORS.grid;
    g.lineWidth = 1;
    for (let row = 0; row < map.rows; row++) {
      for (let col = 0; col < map.cols; col++) {
        if (map.pathKeys.has(tileKey({ col, row }))) continue;
        g.strokeRect(col * s + 1.5, row * s + 1.5, s - 3, s - 3);
      }
    }
    g.restore();
  }

  // path center line
  g.save();
  g.strokeStyle = COLORS.pathEdge;
  g.lineWidth = 2;
  g.setLineDash([4, 6]);
  g.beginPath();
  map.waypoints.forEach((w, i) => (i === 0 ? g.moveTo(w.x, w.y) : g.lineTo(w.x, w.y)));
  g.stroke();
  g.restore();
  label(g, 'IN', tileCenter(first).x, tileCenter(first).y, '#d4d4d8', 10, true);
  label(g, 'BASE', tileCenter(last).x, tileCenter(last).y, '#fecaca', 9, true);

  // selected tower range
  const selected = engine.selectedTower;
  if (selected) rangeRing(g, selected.position.x, selected.position.y, selected.range, COLORS.ringSelected);

  // towers + enemies (each draws its current <PREFIX>_<DIRECTION> animation)
  for (const t of engine.towers) t.draw(g);
  if (selected) {
    const half = s / 2 - 1;
    g.strokeStyle = '#fafafa';
    g.lineWidth = 2;
    g.strokeRect(selected.position.x - half, selected.position.y - half, half * 2, half * 2);
  }
  for (const e of engine.enemies) e.draw(g);

  // projectiles
  for (const p of engine.projectiles) {
    g.beginPath();
    g.arc(p.position.x, p.position.y, 3, 0, TAU);
    g.fillStyle = p.source.def.color;
    g.fill();
  }

  // effects
  for (const fx of engine.effects) {
    const life = 1 - fx.age / fx.ttl;
    g.save();
    g.globalAlpha = Math.max(0, life);
    if (fx.kind === 'trace') {
      g.strokeStyle = fx.color;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(fx.from.x, fx.from.y);
      g.lineTo(fx.to.x, fx.to.y);
      g.stroke();
    } else if (fx.kind === 'ring') {
      g.strokeStyle = fx.color;
      g.lineWidth = 2;
      g.beginPath();
      g.arc(fx.at.x, fx.at.y, fx.radius * (0.4 + 0.6 * (1 - life)), 0, TAU);
      g.stroke();
    } else {
      label(g, fx.text, fx.at.x, fx.at.y - ANIMATION_CONFIG.popupRisePx * (1 - life), fx.color, 12, true);
    }
    g.restore();
  }

  // placement ghost
  if (engine.placing && engine.hoverTile) {
    const def = TOWER_CONFIG[engine.placing];
    const c = tileCenter(engine.hoverTile);
    const valid = engine.isBuildable(engine.hoverTile) && engine.gold >= def.cost;
    rangeRing(g, c.x, c.y, def.range, valid ? COLORS.ringValid : COLORS.ringInvalid);
    g.save();
    g.globalAlpha = 0.55;
    g.fillStyle = valid ? def.color : '#f87171';
    const pad = ANIMATION_CONFIG.towerPaddingPx;
    g.fillRect(c.x - s / 2 + pad, c.y - s / 2 + pad, s - pad * 2, s - pad * 2);
    g.restore();
  }

  // life-loss flash
  if (engine.lifeFlashTimeLeft > 0) {
    g.save();
    g.globalAlpha = engine.lifeFlashTimeLeft / ANIMATION_CONFIG.lifeLossFlashSecs;
    g.strokeStyle = '#ef4444';
    g.lineWidth = 10;
    g.strokeRect(0, 0, width, height);
    g.restore();
  }

  // wave banner
  if (engine.bannerTimeLeft > 0 && engine.bannerText) {
    g.save();
    g.globalAlpha = Math.min(1, engine.bannerTimeLeft / (UI_CONFIG.waveBannerSecs * 0.3));
    g.fillStyle = 'rgba(9,9,11,0.8)';
    g.font = '600 15px "JetBrains Mono", ui-monospace, monospace';
    const w = g.measureText(engine.bannerText).width + 32;
    g.fillRect(width / 2 - w / 2, 16, w, 34);
    label(g, engine.bannerText, width / 2, 33, COLORS.text, 15, true);
    g.restore();
  }

  if (engine.paused && engine.phase !== GAME_PHASE.WON && engine.phase !== GAME_PHASE.LOST) {
    g.fillStyle = 'rgba(9,9,11,0.55)';
    g.fillRect(0, 0, width, height);
    label(g, 'PAUSED', width / 2, height / 2, COLORS.text, 22, true);
  }
}

function rangeRing(g: CanvasRenderingContext2D, x: number, y: number, r: number, color: string): void {
  g.save();
  g.beginPath();
  g.arc(x, y, r, 0, TAU);
  g.fillStyle = color.replace(/[\d.]+\)$/, '0.07)');
  g.fill();
  g.strokeStyle = color;
  g.lineWidth = 1.5;
  g.setLineDash([5, 4]);
  g.stroke();
  g.restore();
}

function label(
  g: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  size: number,
  bold = false,
): void {
  g.font = `${bold ? '700' : '500'} ${size}px "JetBrains Mono", ui-monospace, monospace`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = color;
  g.fillText(text, x, y);
}
