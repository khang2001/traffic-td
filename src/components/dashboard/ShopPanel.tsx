import type { TowerKind } from '../../engine/common/types';
import type { ShopCard } from '../../engine/dashboard';
import type { Feedback } from '../../App';
import { TowerCard } from './TowerCard';

interface Props {
  shop: ShopCard[];
  placing: TowerKind | null;
  feedback: Feedback;
  onBuy: (kind: TowerKind) => void;
}

export function ShopPanel({ shop, placing, feedback, onBuy }: Props) {
  return (
    <section className="flex flex-col gap-2 border-b border-zinc-800 p-3 sm:border-b-0 sm:border-r">
      <h2 className="text-[10px] uppercase tracking-widest text-zinc-500">Buy</h2>
      <div className="grid flex-1 grid-cols-3 gap-2">
        {shop.map((card) => (
          <TowerCard
            key={card.kind}
            card={card}
            active={placing === card.kind}
            shake={feedback?.target === `card-${card.kind}` ? feedback.id : null}
            onClick={() => onBuy(card.kind)}
          />
        ))}
      </div>
    </section>
  );
}
