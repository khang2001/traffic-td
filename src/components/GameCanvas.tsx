import { useEffect, useRef } from 'react';
import { MAP_CONFIG } from '../engine/common/config';
import type { CommandResult } from '../engine/common/types';
import { pixelToTile } from '../engine/common/utils';
import type { GameEngine } from '../engine/engine';
import { drawGame } from '../render/draw-game';

const WIDTH = MAP_CONFIG.cols * MAP_CONFIG.tileSize;
const HEIGHT = MAP_CONFIG.rows * MAP_CONFIG.tileSize;

interface Props {
  engine: GameEngine;
  placing: boolean;
  onResult: (result: CommandResult, target: string) => void;
}

export function GameCanvas({ engine, placing, onResult }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const g = canvas?.getContext('2d');
    if (!canvas || !g) return;
    engine.start(() => drawGame(g, engine));
    return () => engine.stop();
  }, [engine]);

  const tileFromEvent = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = WIDTH / rect.width;
    const scaleY = HEIGHT / rect.height;
    return pixelToTile({ x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY });
  };

  return (
    <canvas
      ref={canvasRef}
      width={WIDTH}
      height={HEIGHT}
      data-testid="game-canvas"
      className={`block h-auto w-full touch-manipulation ${placing ? 'cursor-crosshair' : 'cursor-pointer'}`}
      onMouseMove={(e) => engine.setHoverTile(tileFromEvent(e))}
      onMouseLeave={() => engine.setHoverTile(null)}
      onClick={(e) => {
        const tile = tileFromEvent(e);
        if (tile) onResult(engine.clickTile(tile, e.shiftKey), 'canvas');
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        if (engine.placing) engine.cancelBuild();
        else engine.selectTower(null);
      }}
    />
  );
}
