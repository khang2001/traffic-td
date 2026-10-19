import { GAME_CONFIG } from '../engine/common/config';
import type { CommandResult } from '../engine/common/types';
import type { GameEngine, GameSnapshot } from '../engine/engine';

interface Props {
  engine: GameEngine;
  snapshot: GameSnapshot;
  onResult: (result: CommandResult, target: string) => void;
}

export function Hud({ engine, snapshot, onResult }: Props) {
  return (
    <div className="flex min-h-12 flex-wrap items-center gap-x-6 gap-y-2 border-b border-zinc-800 bg-zinc-900 px-4 py-2 text-sm">
      <Stat label="Gold" value={snapshot.gold} className="text-yellow-300" testId="hud-gold" />
      <Stat label="Lives" value={snapshot.lives} className={snapshot.lives <= 5 ? 'text-red-400' : 'text-zinc-100'} testId="hud-lives" />
      <Stat label="Wave" value={`${snapshot.wave}/${snapshot.totalWaves}`} className="text-zinc-100" testId="hud-wave" />

      <div className="ml-auto flex items-center gap-2">
        {snapshot.canStartWave && snapshot.nextWaveText && (
          <span className="hidden max-w-[220px] truncate text-xs text-zinc-500 md:inline" title={snapshot.nextWaveText}>
            Next: {snapshot.nextWaveText}
          </span>
        )}
        <button
          type="button"
          data-testid="start-wave"
          disabled={!snapshot.canStartWave}
          onClick={() => onResult(engine.startWave(), 'start-wave')}
          className="rounded bg-emerald-500 px-3 py-1.5 text-xs font-bold text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
        >
          {snapshot.phase === 'WAVE' ? 'Wave running' : '▶ Start wave'}
        </button>
        <button
          type="button"
          onClick={() => engine.togglePause()}
          className="rounded border border-zinc-700 px-2.5 py-1.5 text-xs hover:bg-zinc-800"
          aria-label={snapshot.paused ? 'Resume' : 'Pause'}
        >
          {snapshot.paused ? '▶' : '❚❚'}
        </button>
        <div className="flex overflow-hidden rounded border border-zinc-700 text-xs">
          {GAME_CONFIG.speedMultipliers.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => engine.setSpeed(s)}
              className={`px-2.5 py-1.5 ${snapshot.speed === s ? 'bg-zinc-100 text-zinc-950' : 'hover:bg-zinc-800'}`}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, className, testId }: { label: string; value: string | number; className: string; testId: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-[10px] uppercase tracking-widest text-zinc-500">{label}</span>
      <span data-testid={testId} className={`text-base font-bold tabular-nums ${className}`}>
        {value}
      </span>
    </div>
  );
}
