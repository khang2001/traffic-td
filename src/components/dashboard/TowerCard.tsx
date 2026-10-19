import type { ShopCard } from '../../engine/dashboard';

interface Props {
  card: ShopCard;
  active: boolean;
  shake: number | null;
  onClick: () => void;
}

export function TowerCard({ card, active, shake, onClick }: Props) {
  return (
    <button
      key={shake ?? 'still'}
      type="button"
      data-testid={`card-${card.kind}`}
      onClick={onClick}
      title={`Damage ${card.damage} · Range ${card.range}px · ${card.fireRate}/s`}
      className={[
        'flex flex-col justify-between rounded-md border p-2 text-left transition',
        active ? 'border-zinc-100 bg-zinc-800 ring-2 ring-zinc-100' : 'border-zinc-700 bg-zinc-950 hover:border-zinc-500',
        card.affordable ? '' : 'opacity-50',
        shake !== null ? 'animate-shake' : '',
      ].join(' ')}
    >
      <div className="flex items-center gap-2">
        <span className="h-4 w-4 shrink-0" style={{ backgroundColor: card.color }} />
        <span className="text-sm font-bold">{card.name}</span>
      </div>
      <div className="flex items-end justify-between">
        <span className={`text-sm font-bold tabular-nums ${card.affordable ? 'text-yellow-300' : 'text-red-400'}`}>
          {card.cost}g
        </span>
        <kbd className="rounded border border-zinc-600 px-1.5 text-[10px] text-zinc-400">{card.hotkey}</kbd>
      </div>
    </button>
  );
}
