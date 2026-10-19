# Shapes Tower Defense

Square towers defend a path against circle attackers. React + TypeScript + Tailwind, with a
Phaser-free engine drawn to one `<canvas>`.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload (edit `config.ts`, save, the game reloads) |
| `npm test` | 24 Vitest tests: state machine, enemy/tower states, economy, config, balance guard |
| `npm run lint` | ESLint, including `no-magic-numbers` in `src/engine` |
| `npm run build` | Typecheck + production build into `dist/` |
| `npm run build:single` | One self-contained `dist-single/index.html` |
| `BALANCE_REPORT=1 npx vitest run tests/balance.test.ts` | Prints a scripted bot's leaks per wave across all 20 waves |

## How to play

- **Buy:** click a card in the dashboard (or press 1 Rapid, 2 Splash, 3 Sniper), then click a free tile.
  Shift-click places more. Right-click or Esc cancels.
- **Upgrade / sell:** click a tower, then Upgrade (U) or Sell (S). Sell needs a second click within 2 s.
- **Waves:** press Start wave. Pause and 1×/2× speed are in the top bar.
- Survive 20 waves. Each circle that reaches BASE costs lives (Tank 2, others 1).

## Tuning

Every adjustable number lives in **`src/engine/common/config.ts`**: game rules, map and path,
tower and enemy stats, upgrades, waves, animation timings and UI timings. `validateConfig()`
checks it at startup and names any bad key, e.g. `TOWER_CONFIG.SPLASH.fireRate must be > 0`.

## Architecture

Ported from the portfolio-game pattern (state machine + base states + components):

```
BaseGameObject  (DirectionComponent, SpeedComponent, AnimationComponent, StateMachine)
├── BaseTowerObject   IDLE_STATE ⇄ ATTACK_STATE          → RapidTower, SplashTower, SniperTower
└── BaseEnemyObject   MOVE_STATE ⇄ HURT_STATE → DEATH_STATE | REACHED_BASE_STATE → Grunt, Runner, Tank
```

- Behavior lives in states; `update()` only forwards to the state machine.
- Animation keys are `<PREFIX>_<DIRECTION>` (`WALK_LEFT`, `FIRE_UP`); sprites are canvas shape drawers.
- Entities see the world only through `GameContext`. React reads a frozen `GameSnapshot` via
  `useSyncExternalStore` and sends commands that the engine validates.

See `CHANGELOG.md` and `DEVLOG.md` for every change and the reasoning behind it.
