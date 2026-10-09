# pinballsauce

Read `docs/LLM_GUIDE.md` before anything else. It is one page: the map of the repo, the house rules, and which
single other doc to open for the job in hand. Do not read the codebase to get your bearings; the guide is the bearings.

Short version of the house rules:

- A table imports only from `engine/api.js`. Layout and content are data; a table's own behaviour goes in its
  `rules.js` hooks. The engine never names a table.
- Never change an engine number (physics, class stats, scores, timers) for one table.
- After any change: `npm run check`, then `npm test`. A replay failure means you changed how the game plays:
  re-record only if you meant to, and say so.
- New layout geometry comes from the parts bin in `docs/NEW_TABLE_CHECKLIST.md` and must pass `tests/soak.mjs`.
- Art never calls `Math.random` (use `hash`).
- The owner wants to hear what you will change and why before a large change, and verified over guessed.
