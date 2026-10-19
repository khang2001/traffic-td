# Changelog

Versioning: `0.<milestone>.<patch>` until the first full release. Every entry states its intent.

| Date | Version | Milestone | Change | Intent |
| --- | --- | --- | --- | --- |
| 2026-10-19 | 0.7.0 | 1–7 | First playable prototype: engine, states, 3 towers, 3 enemies, 20 waves, bottom dashboard, HUD, end screens, 24 tests; playtest tuning (starting gold 200, Rapid damage 4, hp growth 1.10) | Turn the plan into something playable and confirm the core loop is fun before polishing |
| 2026-10-19 | 0.0.5 | Planning | All tunable numbers moved into `config.ts` | Rebalance or restyle the game by editing one file |
| 2026-10-19 | 0.0.4 | Planning | Bottom dashboard for buy / upgrade / sell | Keep every tower transaction in one fixed place under the map |
| 2026-10-19 | 0.0.3 | Planning | Architecture ported from portfolio-game (state machine, base states, components, direction-keyed sprites) | Build on a pattern already proven in Khang's own code |
| 2026-10-19 | 0.0.2 | Planning | Roster cut to Rapid / Splash / Sniper and Grunt / Runner / Tank | Ship a small complete roster where each tower has a clear job |
| 2026-10-19 | 0.0.1 | Planning | Class hierarchy: `BaseTowerObject`, `BaseEnemyObject` | One shared base per entity type |
| 2026-10-19 | 0.0.0 | Planning | Game plan written | Agree on scope and architecture before writing code |
