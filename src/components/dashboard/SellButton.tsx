/** Two-click sell: first click arms ("Confirm?"), second sells. The arm times out in Dashboard. */
export function SellButton({ armed, value, onClick }: { armed: boolean; value: number; onClick: () => void }) {
  return (
    <button
      type="button"
      data-testid="sell"
      onClick={onClick}
      className={`w-32 rounded border py-1.5 text-xs font-bold transition ${
        armed ? 'border-red-500 bg-red-500 text-zinc-950' : 'border-zinc-600 text-zinc-200 hover:border-zinc-400'
      }`}
    >
      {armed ? 'Confirm?' : <>Sell <span className="text-yellow-300">+{value}g</span></>}
      <kbd className="ml-2 text-[10px] opacity-60">S</kbd>
    </button>
  );
}
