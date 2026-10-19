// Plain data for the bottom dashboard. React never reads tower instances.
import { TOWER_CONFIG, UI_CONFIG } from './common/config';
import type { TowerKind } from './common/types';
import type { BaseTowerObject } from './entities/towers/base-tower-object';

export interface ShopCard {
  kind: TowerKind;
  name: string;
  color: string;
  cost: number;
  affordable: boolean;
  hotkey: string;
  range: number;
  damage: number;
  fireRate: number;
}

export interface StatLine {
  label: 'Damage' | 'Range' | 'Rate';
  value: number;
  next: number | null; // null when it doesn't change or at max level
  unit: string;
}

export interface SelectedTowerInfo {
  id: string;
  kind: TowerKind;
  name: string;
  color: string;
  level: number; // 0-based; shown as level + 1
  maxLevel: number; // 0-based max; shown as maxLevel + 1
  stats: StatLine[];
  upgradeCost: number | null; // null at max level
  canAfford: boolean;
  sellValue: number;
}

export interface DashboardSnapshot {
  enabled: boolean;
  gold: number;
  placing: TowerKind | null;
  shop: ShopCard[];
  selected: SelectedTowerInfo | null;
}

const round1 = (n: number) => Number(n.toFixed(UI_CONFIG.statDecimals));

export function buildDashboard(
  gold: number,
  enabled: boolean,
  placing: TowerKind | null,
  selected: BaseTowerObject | null,
): DashboardSnapshot {
  const shop: ShopCard[] = (Object.keys(TOWER_CONFIG) as TowerKind[]).map((kind) => {
    const def = TOWER_CONFIG[kind];
    return {
      kind,
      name: def.name,
      color: def.color,
      cost: def.cost,
      affordable: gold >= def.cost,
      hotkey: def.hotkey,
      range: def.range,
      damage: def.damage,
      fireRate: def.fireRate,
    };
  });

  let selectedInfo: SelectedTowerInfo | null = null;
  if (selected) {
    const next = selected.nextStats();
    const line = (label: StatLine['label'], value: number, nextValue: number | undefined, unit: string): StatLine => {
      const v = round1(value);
      const n = nextValue === undefined ? null : round1(nextValue);
      return { label, value: v, next: n !== null && n !== v ? n : null, unit };
    };
    const upgradeCost = selected.upgradeCost();
    selectedInfo = {
      id: selected.id,
      kind: selected.kind,
      name: selected.def.name,
      color: selected.def.color,
      level: selected.level,
      maxLevel: selected.maxLevel,
      stats: [
        line('Damage', selected.damage, next?.damage, ''),
        line('Range', selected.range, next?.range, 'px'),
        line('Rate', selected.fireRate, next?.fireRate, '/s'),
      ],
      upgradeCost,
      canAfford: upgradeCost !== null && gold >= upgradeCost,
      sellValue: selected.sellValue(),
    };
  }

  return { enabled, gold, placing, shop, selected: selectedInfo };
}
