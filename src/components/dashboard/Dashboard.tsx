import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { UI_CONFIG } from '../../engine/common/config';
import type { CommandResult, TowerKind } from '../../engine/common/types';
import type { GameEngine, GameSnapshot } from '../../engine/engine';
import type { Feedback } from '../../App';
import { ShopPanel } from './ShopPanel';
import { SelectedTowerPanel } from './SelectedTowerPanel';

interface Props {
  engine: GameEngine;
  snapshot: GameSnapshot;
  feedback: Feedback;
  onResult: (result: CommandResult, target: string) => void;
}

/** 140 px bar under the map. Owns hotkeys 1–3 (buy), U (upgrade), S (sell, press twice), Esc (cancel/deselect). */
export function Dashboard({ engine, snapshot, feedback, onResult }: Props) {
  const dash = snapshot.dashboard;
  const [sellArmedFor, setSellArmedFor] = useState<string | null>(null);
  const disarmTimer = useRef<number | undefined>(undefined);

  // Selection changed → the armed sell no longer applies.
  useEffect(() => setSellArmedFor(null), [dash.selected?.id]);

  const buy = (kind: TowerKind) => {
    if (dash.placing === kind) {
      engine.cancelBuild();
      return;
    }
    onResult(engine.selectBuild(kind), `card-${kind}`);
  };

  const upgrade = () => {
    if (!dash.selected) return;
    onResult(engine.upgradeTower(dash.selected.id), 'upgrade');
  };

  /** Two-step sell: first press arms for UI_CONFIG.sellConfirmSecs, second press sells. */
  const sell = () => {
    const sel = dash.selected;
    if (!sel) return;
    if (sellArmedFor === sel.id) {
      window.clearTimeout(disarmTimer.current);
      setSellArmedFor(null);
      onResult(engine.sellTower(sel.id), 'sell');
      return;
    }
    setSellArmedFor(sel.id);
    window.clearTimeout(disarmTimer.current);
    disarmTimer.current = window.setTimeout(() => setSellArmedFor(null), UI_CONFIG.sellConfirmSecs * 1000);
  };

  // Hotkeys. Re-bound each render so handlers see the latest snapshot.
  const handlers = useRef({ buy, upgrade, sell });
  handlers.current = { buy, upgrade, sell };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.ctrlKey || e.metaKey || e.altKey) return;
      const card = dash.shop.find((c) => c.hotkey === e.key);
      if (card) return handlers.current.buy(card.kind);
      const key = e.key.toLowerCase();
      if (key === 'u') return handlers.current.upgrade();
      if (key === 's') return handlers.current.sell();
      if (e.key === 'Escape') {
        if (engine.placing) engine.cancelBuild();
        else engine.selectTower(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [engine, dash.shop]);

  return (
    <div
      style={{ '--dash-h': `${UI_CONFIG.dashboardHeight}px` } as React.CSSProperties}
      className={`grid grid-cols-1 border-t sm:h-[var(--dash-h)] sm:grid-cols-2 border-zinc-800 bg-zinc-900 ${dash.enabled ? '' : 'pointer-events-none opacity-40'}`}
      data-testid="dashboard"
    >
      <ShopPanel shop={dash.shop} placing={dash.placing} feedback={feedback} onBuy={buy} />
      <SelectedTowerPanel
        selected={dash.selected}
        placing={dash.placing}
        sellArmed={dash.selected !== null && sellArmedFor === dash.selected.id}
        feedback={feedback}
        onUpgrade={upgrade}
        onSell={sell}
      />
    </div>
  );
}
