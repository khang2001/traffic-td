import type { TowerKind } from '../../engine/common/types';
import type { SelectedTowerInfo } from '../../engine/dashboard';
import type { Feedback } from '../../App';
import { StatRow } from './StatRow';
import { SellButton } from './SellButton';

interface Props {
  selected: SelectedTowerInfo | null;
  placing: TowerKind | null;
  sellArmed: boolean;
  feedback: Feedback;
  onUpgrade: () => void;
  onSell: () => void;
}

export function SelectedTowerPanel({ selected, placing, sellArmed, feedback, onUpgrade, onSell }: Props) {
  const message = feedback?.message;

  if (!selected) {
    return (
      <section className="flex flex-col p-3">
        <h2 className="text-[10px] uppercase tracking-widest text-zinc-500">Selected</h2>
        <p className="my-auto py-2 text-sm text-zinc-400" data-testid="selected-hint">
          {placing
            ? 'Click a free tile · Shift-click places more · Esc cancels'
            : 'Click a tower to upgrade or sell it'}
        </p>
        {message && <p className="text-xs text-red-400">{message}</p>}
      </section>
    );
  }

  const shakeUpgrade = feedback?.target === 'upgrade' ? feedback.id : null;
  const atMax = selected.upgradeCost === null;

  return (
    <section className="flex flex-col gap-1.5 p-3" data-testid="selected-panel">
      <div className="flex items-center gap-2">
        <h2 className="text-[10px] uppercase tracking-widest text-zinc-500">Selected</h2>
        <span className="h-3 w-3" style={{ backgroundColor: selected.color }} />
        <span className="text-sm font-bold">{selected.name}</span>
        <span className="ml-auto flex items-center gap-1 text-xs text-zinc-400" data-testid="selected-level">
          Lv {selected.level + 1}/{selected.maxLevel + 1}
          {Array.from({ length: selected.maxLevel + 1 }, (_, i) => (
            <span key={i} className={`h-2 w-2 ${i <= selected.level ? 'bg-zinc-100' : 'border border-zinc-600'}`} />
          ))}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-x-3">
        {selected.stats.map((s) => (
          <StatRow key={s.label} stat={s} />
        ))}
      </div>

      <div className="mt-auto flex items-center gap-2">
        {atMax ? (
          <span className="flex-1 rounded border border-zinc-700 py-1.5 text-center text-xs text-zinc-500">Max level</span>
        ) : (
          <button
            key={shakeUpgrade ?? 'still'}
            type="button"
            data-testid="upgrade"
            onClick={onUpgrade}
            className={[
              'flex-1 rounded py-1.5 text-xs font-bold transition',
              selected.canAfford ? 'bg-zinc-100 text-zinc-950 hover:bg-white' : 'bg-zinc-800 text-zinc-400',
              shakeUpgrade !== null ? 'animate-shake' : '',
            ].join(' ')}
          >
            Upgrade{' '}
            <span className={selected.canAfford ? 'text-yellow-700' : 'text-red-400'}>{selected.upgradeCost}g</span>
            <kbd className="ml-2 text-[10px] opacity-60">U</kbd>
          </button>
        )}
        <SellButton armed={sellArmed} value={selected.sellValue} onClick={onSell} />
      </div>
      {message && <p className="text-xs text-red-400">{message}</p>}
    </section>
  );
}
