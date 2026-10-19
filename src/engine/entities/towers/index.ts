// Behavior is config-driven; the subclasses exist so each kind can override hooks later.
import type { Tile, TowerDef, TowerKind } from '../../common/types';
import type { BaseTowerObject } from './base-tower-object';
import { RapidTower } from './rapid-tower';
import { SniperTower } from './sniper-tower';
import { SplashTower } from './splash-tower';

export { RapidTower, SniperTower, SplashTower };

/** The only place a tower kind becomes a class. Record<> fails the build if a kind is missing. */
export const TOWER_CLASSES: Record<TowerKind, new (id: string, tile: Tile, def: TowerDef) => BaseTowerObject> = {
  RAPID: RapidTower,
  SPLASH: SplashTower,
  SNIPER: SniperTower,
};
