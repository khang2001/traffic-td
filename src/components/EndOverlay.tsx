import type { GameSnapshot } from '../engine/engine';

export function EndOverlay({ snapshot, onRestart }: { snapshot: GameSnapshot; onRestart: () => void }) {
  if (snapshot.phase !== 'WON' && snapshot.phase !== 'LOST') return null;
  const won = snapshot.phase === 'WON';
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/80" data-testid="end-overlay">
      <div className="w-80 rounded-lg border border-zinc-700 bg-zinc-900 p-6 text-center">
        <p className={`text-2xl font-bold ${won ? 'text-emerald-400' : 'text-red-400'}`}>{won ? 'Victory' : 'Defeat'}</p>
        <dl className="mt-4 grid grid-cols-2 gap-y-1 text-left text-sm">
          <dt className="text-zinc-500">Waves cleared</dt>
          <dd className="text-right tabular-nums">{won ? snapshot.wave : Math.max(0, snapshot.wave - 1)}</dd>
          <dt className="text-zinc-500">Towers built</dt>
          <dd className="text-right tabular-nums">{snapshot.towersBuilt}</dd>
          <dt className="text-zinc-500">Circles destroyed</dt>
          <dd className="text-right tabular-nums">{snapshot.kills}</dd>
        </dl>
        <button
          type="button"
          onClick={onRestart}
          className="mt-6 w-full rounded bg-emerald-500 py-2 text-sm font-bold text-zinc-950 hover:bg-emerald-400"
        >
          Restart
        </button>
      </div>
    </div>
  );
}
