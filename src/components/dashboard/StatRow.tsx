import type { StatLine } from '../../engine/dashboard';

/** "Damage 3 → 4.2" — the arrow appears only for stats the next upgrade changes. */
export function StatRow({ stat }: { stat: StatLine }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-wider text-zinc-500">{stat.label}</span>
      <span className="text-sm tabular-nums">
        {stat.value}
        {stat.unit}
        {stat.next !== null && (
          <span className="text-emerald-400">
            {' '}
            → {stat.next}
            {stat.unit}
          </span>
        )}
      </span>
    </div>
  );
}
