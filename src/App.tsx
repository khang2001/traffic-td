import { useCallback, useState } from 'react';
import { MAP_CONFIG, UI_CONFIG } from './engine/common/config';
import { GameEngine } from './engine/engine';
import type { CommandResult } from './engine/common/types';
import { useGameEngine } from './hooks/use-game-engine';
import { GameCanvas } from './components/GameCanvas';
import { Hud } from './components/Hud';
import { EndOverlay } from './components/EndOverlay';
import { Dashboard } from './components/dashboard/Dashboard';

const WIDTH = MAP_CONFIG.cols * MAP_CONFIG.tileSize;

export type Feedback = { target: string; message: string; id: number } | null;

export default function App() {
  const [engine, setEngine] = useState(() => new GameEngine());
  const snapshot = useGameEngine(engine);
  const [feedback, setFeedback] = useState<Feedback>(null);

  /** Turns a failed command into a shake on `target` plus a short message. */
  const report = useCallback((result: CommandResult, target: string) => {
    if (result.ok) return;
    const id = Date.now();
    setFeedback({ target, message: ERROR_TEXT[result.reason], id });
    window.setTimeout(() => setFeedback((f) => (f?.id === id ? null : f)), UI_CONFIG.errorShakeMs * 5);
  }, []);

  const restart = () => {
    engine.stop();
    setFeedback(null);
    setEngine(new GameEngine());
  };

  return (
    <div
      className="flex min-h-full items-start justify-center bg-zinc-950 py-6 text-zinc-100"
      style={{ paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))' }}
    >
      <div style={{ maxWidth: WIDTH }} className="w-full overflow-hidden rounded-lg border border-zinc-800 shadow-2xl shadow-black">
        <Hud engine={engine} snapshot={snapshot} onResult={report} />
        <div className="relative">
          <GameCanvas engine={engine} placing={snapshot.dashboard.placing !== null} onResult={report} />
          <EndOverlay snapshot={snapshot} onRestart={restart} />
        </div>
        <Dashboard engine={engine} snapshot={snapshot} feedback={feedback} onResult={report} />
      </div>
    </div>
  );
}

export const ERROR_TEXT = {
  NOT_ENOUGH_GOLD: 'Not enough gold',
  MAX_LEVEL: 'Already at max level',
  TILE_BLOCKED: "Can't build there",
  NO_SELECTION: 'Nothing selected',
  GAME_OVER: 'Game over',
  WAVE_IN_PROGRESS: 'Wave already running',
} as const;
