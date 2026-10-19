# Dev diary

Newest first. Each entry: intent, what was built, decisions (with rejected alternatives), problems, next.
Planning entries 0.0.0–0.0.5 live in the plan doc's "Changelog & Dev Diary" tab.

## 2026-10-19 — First playable prototype (0.7.0)

**Intent:** turn the plan into a playable build so the core loop (place, defend, earn, upgrade) can be judged by playing it.

**Built:** milestones 1–7 from the plan in one pass.
- Engine: `config.ts` + `validateConfig()`, `StateMachine` (with the three portfolio-game fixes), direction / speed / animation components, `BaseGameObject`, `BaseTowerObject` + Rapid / Splash / Sniper, `BaseEnemyObject` + Grunt / Runner / Tank, all six states, projectiles, map built from path corners, authored waves 1–10 and generated 11–20, commands returning `CommandResult`, fixed-step loop.
- UI: HUD (gold, lives, wave, next-wave preview, start, pause, 1×/2×), canvas with placement ghost and range rings, bottom dashboard (Buy cards with hotkeys 1–3, Selected panel with level pips, stat preview, Upgrade [U], two-click Sell [S]), error shake + message, Victory/Defeat overlay with Restart.
- Feel: hit flash, death shrink, barrel recoil, Sniper tracer, Splash ring, "+gold" popups, life-loss flash, wave banners.
- Tests (24): state-machine queue/args fixes, config validation and path continuity, enemy movement / corner carry-over / armor / death, tower targeting / instant hit / splash / exact DPS / upgrades, engine economy and wave flow, balance guard.

**Decisions:**
- Speed scales how much game time accumulates, and every tick keeps the same `tickSeconds` (2× runs twice as many identical ticks). Rejected: the plan's `dt = 1/60 × speed`, because bigger steps at 2× change projectile and corner behavior between speeds.
- `GameContext` is a small `EngineContext` class with getters instead of an object literal aliasing `this` (lint rule `no-this-alias`).
- `GameContext.addEffect` added so towers can emit tracers / splash rings without knowing about the renderer.
- Projectiles are plain objects updated by the engine, not `BaseGameObject`s: they have no states or directions.
- ESLint `no-magic-numbers` applies to `src/engine` only. Render and UI code keeps cosmetic literals (font sizes, line widths); every gameplay stat still comes from `config.ts`.
- The layout is fluid: the canvas scales to the available width (mouse/touch input is rescaled), and the dashboard stacks on narrow screens so the game also works on a phone.

**Problems hit:**
1. Towers fired one tick late: `0.2 − 12 × (1/60)` leaves ~1e-17, so `cooldown === 0` failed and Rapid dealt 138 of an expected 150 damage per 10 s. Fixed with `cooldown <= Number.EPSILON`; covered by an exact-DPS test.
2. Balance from the plan was too hard. A scripted bot with two Rapids leaked half of wave 1 and lost by wave 3–7; wave 9 Tanks had 3× hp because hp growth (1.15^n) compounded with growing counts. Tuned in `config.ts` after comparing runs:

| Setting | Plan | Now | Bot result |
| --- | --- | --- | --- |
| `startingGold` | 150 | 200 | Waves 1–8 clean |
| `TOWER_CONFIG.RAPID.damage` | 3 | 4 | |
| `WAVE_CONFIG.hpScaleGrowth` | 1.15 | 1.10 | Spike at wave 9 (4 leaks), loses at 19 |

  1.08 made the bot win with almost no leaks (too easy); 1.10 leaves room for a player who places better than the bot. `tests/balance.test.ts` now fails if a config change makes waves 1–8 leak for the bot.

**Next:** playtest by hand and tune waves 9 and 18–20; milestone 8 extras (sound, targeting mode toggle per tower); decide the open questions (auto-start waves, more maps).
