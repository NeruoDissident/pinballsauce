# pinballsauce

Read `docs/LLM_GUIDE.md` before anything else. It is one page: the map of the repo, the house rules, and which
other doc to open for the job in hand. Do not read the codebase to get your bearings; the guide is the bearings.
For any job that makes or changes a table, read `docs/PINBALL.md` next: it is what a table has without being asked.

What this repo is for: the owner makes pinball tables and does not want to repeat the basics each time. So:

- `docs/PINBALL.md` is the default for everything a request does not say (lights on every goal, game state on the
  playfield, goals that build, a fair launch, shots for every flipper). It is guidelines, not law: a request that
  contradicts it wins. Never ask him something it already answers.
- Nothing is core. Classes, levels, health, enemies, bosses, quests, the party, cards, the Grave are switches
  (`uses` in a table's `table.js`). Never tell him a table must have one. If a table cannot run without one, fix
  the shared code.
- Nothing is forced. Every sound, effect, word, light colour, point value and rule number the shared code has is
  a named default a table can change or switch off. If you find one a table cannot change, make it a named default
  in the shared code (existing tables unchanged); do not work round it inside the table.
- Hard rules are only the ones code depends on: a table imports only from `engine/api.js`; the engine never names
  a table; art never calls `Math.random` (use `hash`).
- One table's feel is its own: set `feel` in its `table.js`. Do not edit a shared number to suit one table.
  Changing a shared default changes every table: do it only when that is what he asked for, and say so.
- After any change: `npm run check`, then `npm test`. The recordings are an alarm: a replay failure means you
  changed how that table plays. Re-record only if you meant to, and say so.
- A new or changed layout: `npm run soak`, `reach` and `standards` for that table. Read every note they print.
- Build the shape he asked for. If you think another would play better, ask; do not substitute. Ask too when a
  request leaves the shape or the optional systems unclear.
- He wants to hear what you will change and why before a large change, and verified over guessed. Passing the
  checks means a table is not broken; whether it is good is decided by playing it.
